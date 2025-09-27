const express = require('express');
const { body, validationResult } = require('express-validator');
const Classroom = require('../models/Classroom');
const { auth, requirePermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/classrooms
// @desc    Get all classrooms
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { department, type, isAvailable, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (department) filter.department = department;
    if (type) filter.type = type;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const classrooms = await Classroom.find(filter)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Classroom.countDocuments(filter);

    res.json({
      classrooms,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get classrooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/classrooms/:id
// @desc    Get classroom by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    res.json(classroom);
  } catch (error) {
    console.error('Get classroom error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/classrooms
// @desc    Create new classroom
// @access  Private (requires permission)
router.post('/', auth, requirePermission('canCreateTimetables'), [
  body('name').trim().notEmpty().withMessage('Classroom name is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('type').isIn(['lecture', 'lab', 'seminar', 'conference', 'auditorium']).withMessage('Invalid classroom type'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('floor').isInt({ min: 0 }).withMessage('Floor must be a non-negative integer'),
  body('building').trim().notEmpty().withMessage('Building is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const classroom = new Classroom(req.body);
    await classroom.save();

    res.status(201).json({
      message: 'Classroom created successfully',
      classroom
    });
  } catch (error) {
    console.error('Create classroom error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Classroom with this name already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// @route   PUT /api/classrooms/:id
// @desc    Update classroom
// @access  Private (requires permission)
router.put('/:id', auth, requirePermission('canCreateTimetables'), async (req, res) => {
  try {
    const classroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    res.json({
      message: 'Classroom updated successfully',
      classroom
    });
  } catch (error) {
    console.error('Update classroom error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Classroom with this name already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// @route   DELETE /api/classrooms/:id
// @desc    Delete classroom
// @access  Private (requires permission)
router.delete('/:id', auth, requirePermission('canCreateTimetables'), async (req, res) => {
  try {
    const classroom = await Classroom.findByIdAndDelete(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error('Delete classroom error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/classrooms/available/:day/:time
// @desc    Get available classrooms for specific day and time
// @access  Private
router.get('/available/:day/:time', auth, async (req, res) => {
  try {
    const { day, time } = req.params;
    
    // Find classrooms that are available and not in maintenance
    const availableClassrooms = await Classroom.find({
      isAvailable: true,
      $or: [
        { 'maintenanceSchedule.day': { $ne: day } },
        { 'maintenanceSchedule.day': { $exists: false } }
      ]
    });

    res.json({ availableClassrooms });
  } catch (error) {
    console.error('Get available classrooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
