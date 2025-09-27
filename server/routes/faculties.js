const express = require('express');
const { body, validationResult } = require('express-validator');
const Faculty = require('../models/Faculty');
const { auth, requirePermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/faculties
// @desc    Get all faculties
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { department, isActive, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const faculties = await Faculty.find(filter)
      .populate('subjects', 'name code')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Faculty.countDocuments(filter);

    res.json({
      faculties,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get faculties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/faculties/:id
// @desc    Get faculty by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('subjects', 'name code credits hoursPerWeek');
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json(faculty);
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/faculties
// @desc    Create new faculty
// @access  Private (requires permission)
router.post('/', auth, requirePermission('canCreateTimetables'), [
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('name').trim().notEmpty().withMessage('Faculty name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const faculty = new Faculty(req.body);
    await faculty.save();
    await faculty.populate('subjects', 'name code');

    res.status(201).json({
      message: 'Faculty created successfully',
      faculty
    });
  } catch (error) {
    console.error('Create faculty error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Faculty with this employee ID or email already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// @route   PUT /api/faculties/:id
// @desc    Update faculty
// @access  Private (requires permission)
router.put('/:id', auth, requirePermission('canCreateTimetables'), async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('subjects', 'name code');

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json({
      message: 'Faculty updated successfully',
      faculty
    });
  } catch (error) {
    console.error('Update faculty error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Faculty with this employee ID or email already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// @route   DELETE /api/faculties/:id
// @desc    Delete faculty
// @access  Private (requires permission)
router.delete('/:id', auth, requirePermission('canCreateTimetables'), async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/faculties/department/:department
// @desc    Get faculties by department
// @access  Private
router.get('/department/:department', auth, async (req, res) => {
  try {
    const { department } = req.params;
    
    const faculties = await Faculty.find({ 
      department, 
      isActive: true 
    })
    .populate('subjects', 'name code')
    .sort({ name: 1 });

    res.json({ faculties });
  } catch (error) {
    console.error('Get faculties by department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/faculties/subject/:subjectId
// @desc    Get faculties who can teach a specific subject
// @access  Private
router.get('/subject/:subjectId', auth, async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const faculties = await Faculty.find({ 
      subjects: subjectId,
      isActive: true 
    })
    .populate('subjects', 'name code')
    .sort({ name: 1 });

    res.json({ faculties });
  } catch (error) {
    console.error('Get faculties by subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/faculties/:id/subjects
// @desc    Update faculty subjects
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
    
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { subjects },
      { new: true, runValidators: true }
    ).populate('subjects', 'name code');

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json({
      message: 'Faculty subjects updated successfully',
      faculty
    });
  } catch (error) {
    console.error('Update faculty subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
