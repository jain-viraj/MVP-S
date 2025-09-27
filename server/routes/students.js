const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const { auth, requirePermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/students
// @desc    Get all students
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { department, semester, batch, section, isActive, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    if (batch) filter.batch = batch;
    if (section) filter.section = section;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const students = await Student.find(filter)
      .populate('subjects', 'name code')
      .sort({ studentId: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(filter);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('subjects', 'name code credits hoursPerWeek');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/students
// @desc    Create new student
// @access  Private (requires permission)
router.post('/', auth, requirePermission('canCreateTimetables'), [
  body('studentId').trim().notEmpty().withMessage('Student ID is required'),
  body('name').trim().notEmpty().withMessage('Student name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('batch').trim().notEmpty().withMessage('Batch is required'),
  body('section').trim().notEmpty().withMessage('Section is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const student = new Student(req.body);
    await student.save();
    await student.populate('subjects', 'name code');

    res.status(201).json({
      message: 'Student created successfully',
      student
    });
  } catch (error) {
    console.error('Create student error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Student with this ID or email already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (requires permission)
router.put('/:id', auth, requirePermission('canCreateTimetables'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('subjects', 'name code');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Student updated successfully',
      student
    });
  } catch (error) {
    console.error('Update student error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Student with this ID or email already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (requires permission)
router.delete('/:id', auth, requirePermission('canCreateTimetables'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/batch/:batch
// @desc    Get students by batch
// @access  Private
router.get('/batch/:batch', auth, async (req, res) => {
  try {
    const { batch } = req.params;
    const { section, semester } = req.query;
    
    const filter = { batch, isActive: true };
    if (section) filter.section = section;
    if (semester) filter.semester = parseInt(semester);

    const students = await Student.find(filter)
      .populate('subjects', 'name code')
      .sort({ studentId: 1 });

    res.json({ students });
  } catch (error) {
    console.error('Get students by batch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/department/:department
// @desc    Get students by department
// @access  Private
router.get('/department/:department', auth, async (req, res) => {
  try {
    const { department } = req.params;
    const { semester, batch } = req.query;
    
    const filter = { department, isActive: true };
    if (semester) filter.semester = parseInt(semester);
    if (batch) filter.batch = batch;

    const students = await Student.find(filter)
      .populate('subjects', 'name code')
      .sort({ studentId: 1 });

    res.json({ students });
  } catch (error) {
    console.error('Get students by department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/students/:id/subjects
// @desc    Update student subjects
// @access  Private (requires permission)
router.put('/:id/subjects', auth, requirePermission('canCreateTimetables'), [
  body('subjects').isArray().withMessage('Subjects must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subjects } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { subjects },
      { new: true, runValidators: true }
    ).populate('subjects', 'name code');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Student subjects updated successfully',
      student
    });
  } catch (error) {
    console.error('Update student subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
