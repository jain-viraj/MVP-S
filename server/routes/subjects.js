const express = require('express');
const { body, validationResult } = require('express-validator');
const Subject = require('../models/Subject');
const { auth, requirePermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { department, semester, type, isActive, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const subjects = await Subject.find(filter)
      .sort({ code: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subject.countDocuments(filter);

    res.json({
      subjects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subjects/:id
// @desc    Get subject by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subjects
// @desc    Create new subject
// @access  Private (requires permission)
router.post('/', auth, requirePermission('canCreateTimetables'), [
  body('code').trim().notEmpty().withMessage('Subject code is required'),
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('hoursPerWeek').isInt({ min: 1, max: 20 }).withMessage('Hours per week must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const subject = new Subject(req.body);
    await subject.save();

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Subject with this code already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update subject
// @access  Private (requires permission)
router.put('/:id', auth, requirePermission('canCreateTimetables'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({
      message: 'Subject updated successfully',
      subject
    });
  } catch (error) {
    console.error('Update subject error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Subject with this code already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete subject
// @access  Private (requires permission)
router.delete('/:id', auth, requirePermission('canCreateTimetables'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subjects/department/:department
// @desc    Get subjects by department
// @access  Private
router.get('/department/:department', auth, async (req, res) => {
  try {
    const { department } = req.params;
    const { semester } = req.query;
    
    const filter = { department, isActive: true };
    if (semester) filter.semester = parseInt(semester);

    const subjects = await Subject.find(filter).sort({ code: 1 });

    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects by department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
