const express = require('express');
const { body, validationResult } = require('express-validator');
const Timetables = require('../models/Timetable');
const Classroom = require('../models/Classroom');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const { auth, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Timetable optimization algorithm
class TimetableOptimizer {
  constructor(constraints) {
    this.constraints = constraints;
    this.timeSlots = this.generateTimeSlots();
    this.optimizationScore = 0;
    this.conflicts = [];
    this.suggestions = [];
  }

  generateTimeSlots() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = [];
    
    // Generate time slots from 8:00 AM to 6:00 PM with 1-hour intervals
    for (let hour = 8; hour < 18; hour++) {
      for (const day of days) {
        timeSlots.push({
          day,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          isAvailable: true
        });
      }
    }
    
    return timeSlots;
  }

  async optimize() {
    try {
      const { subjects, faculties, classrooms, batches, maxClassesPerDay } = this.constraints;
      
      // Get available resources
      const availableClassrooms = await Classroom.find({ isAvailable: true });
      const availableFaculties = await Faculty.find({ isActive: true });
      const availableSubjects = await Subject.find({ isActive: true });

      // Create optimized timetable
      const optimizedSlots = [];
      let totalScore = 0;

      for (const subject of subjects) {
        const subjectData = availableSubjects.find(s => s._id.toString() === subject.subjectId);
        if (!subjectData) continue;

        const faculty = availableFaculties.find(f => 
          f.subjects.some(s => s.toString() === subject.subjectId)
        );
        if (!faculty) continue;

        const classroom = this.findBestClassroom(availableClassrooms, subjectData);
        if (!classroom) continue;

        // Generate slots for this subject
        const subjectSlots = this.generateSubjectSlots(
          subjectData,
          faculty,
          classroom,
          subject.batch,
          subject.section,
          maxClassesPerDay
        );

        optimizedSlots.push(...subjectSlots);
        totalScore += this.calculateSlotScore(subjectSlots, faculty, classroom);
      }

      // Check for conflicts and generate suggestions
      this.detectConflicts(optimizedSlots);
      this.generateSuggestions(optimizedSlots);

      this.optimizationScore = Math.min(100, Math.max(0, totalScore / optimizedSlots.length));

      return {
        timeSlots: optimizedSlots,
        optimizationScore: this.optimizationScore,
        conflicts: this.conflicts,
        suggestions: this.suggestions
      };
    } catch (error) {
      console.error('Optimization error:', error);
      throw error;
    }
  }

  findBestClassroom(classrooms, subject) {
    // Find classroom that matches subject requirements
    const suitableClassrooms = classrooms.filter(classroom => {
      if (subject.type === 'practical' && classroom.type !== 'lab') return false;
      if (subject.type === 'seminar' && classroom.type !== 'seminar') return false;
      return true;
    });

    // Return the first suitable classroom or the first available one
    return suitableClassrooms[0] || classrooms[0];
  }

  generateSubjectSlots(subject, faculty, classroom, batch, section, maxClassesPerDay) {
    const slots = [];
    const hoursPerWeek = subject.hoursPerWeek;
    const classesPerWeek = Math.ceil(hoursPerWeek / 1); // Assuming 1-hour classes
    
    // Distribute classes across days
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const classesPerDay = Math.ceil(classesPerWeek / days.length);
    
    let classesScheduled = 0;
    
    for (const day of days) {
      if (classesScheduled >= classesPerWeek) break;
      
      const dayClasses = Math.min(classesPerDay, classesPerWeek - classesScheduled);
      
      for (let i = 0; i < dayClasses; i++) {
        const timeSlot = this.findAvailableTimeSlot(day, faculty, classroom);
        if (timeSlot) {
          slots.push({
            day: timeSlot.day,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            subject: subject._id,
            faculty: faculty._id,
            classroom: classroom._id,
            batch,
            section,
            isSpecialClass: false
          });
          classesScheduled++;
        }
      }
    }
    
    return slots;
  }

  findAvailableTimeSlot(day, faculty, classroom) {
    // Find first available time slot for the given day
    const availableSlots = this.timeSlots.filter(slot => 
      slot.day === day && 
      slot.isAvailable &&
      !this.isFacultyUnavailable(faculty, slot) &&
      !this.isClassroomUnavailable(classroom, slot)
    );
    
    return availableSlots[0];
  }

  isFacultyUnavailable(faculty, timeSlot) {
    // Check if faculty has preferred time slots
    if (faculty.preferredTimeSlots && faculty.preferredTimeSlots.length > 0) {
      const isPreferred = faculty.preferredTimeSlots.some(pref => 
        pref.day === timeSlot.day &&
        pref.startTime <= timeSlot.startTime &&
        pref.endTime >= timeSlot.endTime
      );
      if (!isPreferred) return true;
    }

    // Check if faculty is unavailable at this time
    if (faculty.unavailableTimeSlots && faculty.unavailableTimeSlots.length > 0) {
      return faculty.unavailableTimeSlots.some(unavail => 
        unavail.day === timeSlot.day &&
        unavail.startTime <= timeSlot.startTime &&
        unavail.endTime >= timeSlot.endTime
      );
    }

    return false;
  }

  isClassroomUnavailable(classroom, timeSlot) {
    // Check maintenance schedule
    if (classroom.maintenanceSchedule) {
      const maintenance = classroom.maintenanceSchedule;
      if (maintenance.day === timeSlot.day) {
        const maintenanceStart = maintenance.time;
        const maintenanceEnd = this.addMinutes(maintenanceStart, maintenance.duration);
        
        if (timeSlot.startTime >= maintenanceStart && timeSlot.startTime < maintenanceEnd) {
          return true;
        }
      }
    }

    return false;
  }

  addMinutes(timeString, minutes) {
    const [hours, mins] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  calculateSlotScore(slots, faculty, classroom) {
    let score = 50; // Base score

    // Faculty availability bonus
    if (faculty.preferredTimeSlots && faculty.preferredTimeSlots.length > 0) {
      score += 20;
    }

    // Classroom suitability bonus
    if (classroom.equipment && classroom.equipment.length > 0) {
      score += 10;
    }

    // Faculty experience bonus
    if (faculty.experience > 5) {
      score += 10;
    }

    // Classroom capacity bonus
    if (classroom.capacity > 50) {
      score += 10;
    }

    return Math.min(100, score);
  }

  detectConflicts(slots) {
    this.conflicts = [];

    // Check for faculty conflicts
    const facultySlots = {};
    slots.forEach(slot => {
      const key = `${slot.faculty}-${slot.day}-${slot.startTime}`;
      if (facultySlots[key]) {
        this.conflicts.push({
          type: 'faculty_conflict',
          description: `Faculty has overlapping classes at ${slot.startTime} on ${slot.day}`,
          severity: 'high'
        });
      } else {
        facultySlots[key] = slot;
      }
    });

    // Check for classroom conflicts
    const classroomSlots = {};
    slots.forEach(slot => {
      const key = `${slot.classroom}-${slot.day}-${slot.startTime}`;
      if (classroomSlots[key]) {
        this.conflicts.push({
          type: 'classroom_conflict',
          description: `Classroom is double-booked at ${slot.startTime} on ${slot.day}`,
          severity: 'high'
        });
      } else {
        classroomSlots[key] = slot;
      }
    });

    // Check for student batch conflicts
    const batchSlots = {};
    slots.forEach(slot => {
      const key = `${slot.batch}-${slot.section}-${slot.day}-${slot.startTime}`;
      if (batchSlots[key]) {
        this.conflicts.push({
          type: 'student_conflict',
          description: `Students have overlapping classes at ${slot.startTime} on ${slot.day}`,
          severity: 'high'
        });
      } else {
        batchSlots[key] = slot;
      }
    });
  }

  generateSuggestions(slots) {
    this.suggestions = [];

    // Suggest better time distribution
    const dayDistribution = {};
    slots.forEach(slot => {
      dayDistribution[slot.day] = (dayDistribution[slot.day] || 0) + 1;
    });

    const maxClasses = Math.max(...Object.values(dayDistribution));
    const minClasses = Math.min(...Object.values(dayDistribution));

    if (maxClasses - minClasses > 2) {
      this.suggestions.push({
        type: 'time_distribution',
        description: 'Consider redistributing classes more evenly across days',
        priority: 'medium'
      });
    }

    // Suggest faculty workload optimization
    const facultyWorkload = {};
    slots.forEach(slot => {
      facultyWorkload[slot.faculty] = (facultyWorkload[slot.faculty] || 0) + 1;
    });

    Object.entries(facultyWorkload).forEach(([facultyId, workload]) => {
      if (workload > 6) {
        this.suggestions.push({
          type: 'faculty_workload',
          description: `Faculty has high workload (${workload} classes). Consider redistributing.`,
          priority: 'high'
        });
      }
    });
  }
}

// @route   POST /api/optimization/generate
// @desc    Generate optimized timetable
// @access  Private (requires permission)
router.post('/generate', auth, requirePermission('canCreateTimetables'), [
  body('constraints').isObject().withMessage('Constraints object is required'),
  body('constraints.subjects').isArray().withMessage('Subjects array is required'),
  body('constraints.batches').isArray().withMessage('Batches array is required'),
  body('constraints.maxClassesPerDay').isInt({ min: 1, max: 8 }).withMessage('Max classes per day must be between 1 and 8')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { constraints } = req.body;
    const optimizer = new TimetableOptimizer(constraints);
    
    const result = await optimizer.optimize();

    res.json({
      message: 'Timetable optimization completed',
      result
    });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({ message: 'Server error during optimization' });
  }
});

// @route   POST /api/optimization/suggestions
// @desc    Get optimization suggestions for existing timetable
// @access  Private
router.post('/suggestions', auth, async (req, res) => {
  try {
    const { timetableId } = req.body;
    
    const timetable = await Timetables.findById(timetableId)
      .populate('timeSlots.subject', 'name code hoursPerWeek')
      .populate('timeSlots.faculty', 'name maxClassesPerDay preferredTimeSlots')
      .populate('timeSlots.classroom', 'name capacity type');

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    const suggestions = [];
    const conflicts = [];

    // Analyze current timetable
    const facultyWorkload = {};
    const classroomUsage = {};
    const dayDistribution = {};

    timetable.timeSlots.forEach(slot => {
      // Faculty workload analysis
      facultyWorkload[slot.faculty._id] = (facultyWorkload[slot.faculty._id] || 0) + 1;
      
      // Classroom usage analysis
      classroomUsage[slot.classroom._id] = (classroomUsage[slot.classroom._id] || 0) + 1;
      
      // Day distribution analysis
      dayDistribution[slot.day] = (dayDistribution[slot.day] || 0) + 1;
    });

    // Generate suggestions based on analysis
    Object.entries(facultyWorkload).forEach(([facultyId, workload]) => {
      if (workload > 6) {
        suggestions.push({
          type: 'faculty_workload',
          description: `Faculty has high workload (${workload} classes). Consider redistributing some classes.`,
          priority: 'high'
        });
      }
    });

    // Check for time distribution
    const maxClasses = Math.max(...Object.values(dayDistribution));
    const minClasses = Math.min(...Object.values(dayDistribution));
    
    if (maxClasses - minClasses > 2) {
      suggestions.push({
        type: 'time_distribution',
        description: 'Classes are unevenly distributed across days. Consider better time distribution.',
        priority: 'medium'
      });
    }

    res.json({
      suggestions,
      conflicts,
      analysis: {
        facultyWorkload,
        classroomUsage,
        dayDistribution
      }
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
