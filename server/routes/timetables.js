const express = require('express');
const { body, validationResult } = require('express-validator');
const Timetables = require('../models/Timetable');
const Classroom = require('../models/Classroom');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const { auth, requirePermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/timetables
// @desc    Get all timetables
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { department, semester, status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    if (status) filter.status = status;

    const timetables = await Timetables.find(filter)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('timeSlots.subject', 'name code')
      .populate('timeSlots.faculty', 'name employeeId')
      .populate('timeSlots.classroom', 'name capacity type')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Timetables.countDocuments(filter);

    res.json({
      timetables,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get timetables error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/timetables/:id
// @desc    Get timetable by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const timetable = await Timetables.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('timeSlots.subject', 'name code credits type')
      .populate('timeSlots.faculty', 'name employeeId department')
      .populate('timeSlots.classroom', 'name capacity type building floor');

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    res.json(timetable);
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/timetables
// @desc    Create new timetable
// @access  Private (requires permission)
router.post('/', auth, requirePermission('canCreateTimetables'), [
  body('name').trim().notEmpty().withMessage('Timetable name is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, department, semester, academicYear, timeSlots = [] } = req.body;

    const timetable = new Timetables({
      name,
      department,
      semester,
      academicYear,
      timeSlots,
      createdBy: req.user._id
    });

    await timetable.save();
    await timetable.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Timetable created successfully',
      timetable
    });
  } catch (error) {
    console.error('Create timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/timetables/:id
// @desc    Update timetable
// @access  Private (requires permission)
router.put('/:id', auth, requirePermission('canCreateTimetables'), async (req, res) => {
  try {
    const timetable = await Timetables.findById(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    // Check if user can edit this timetable
    if (timetable.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this timetable' });
    }

    // Don't allow editing approved timetables
    if (timetable.status === 'approved' || timetable.status === 'active') {
      return res.status(400).json({ message: 'Cannot edit approved or active timetables' });
    }

    const updatedTimetable = await Timetables.findByIdAndUpdate(
      req.params.id,
      { ...req.body, version: timetable.version + 1 },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      message: 'Timetable updated successfully',
      timetable: updatedTimetable
    });
  } catch (error) {
    console.error('Update timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/timetables/:id/approve
// @desc    Approve timetable
// @access  Private (requires permission)
router.post('/:id/approve', auth, requirePermission('canApproveTimetables'), async (req, res) => {
  try {
    const timetable = await Timetables.findById(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    if (timetable.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Timetable is not pending approval' });
    }

    timetable.status = 'approved';
    timetable.approvedBy = req.user._id;
    timetable.approvalDate = new Date();

    await timetable.save();
    await timetable.populate('approvedBy', 'name email');

    res.json({
      message: 'Timetable approved successfully',
      timetable
    });
  } catch (error) {
    console.error('Approve timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/timetables/:id/reject
// @desc    Reject timetable
// @access  Private (requires permission)
router.post('/:id/reject', auth, requirePermission('canApproveTimetables'), [
  body('reason').trim().notEmpty().withMessage('Rejection reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const timetable = await Timetables.findById(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    if (timetable.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Timetable is not pending approval' });
    }

    timetable.status = 'rejected';
    timetable.approvedBy = req.user._id;
    timetable.rejectionReason = req.body.reason;

    await timetable.save();
    await timetable.populate('approvedBy', 'name email');

    res.json({
      message: 'Timetable rejected successfully',
      timetable
    });
  } catch (error) {
    console.error('Reject timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/timetables/:id/submit
// @desc    Submit timetable for approval
// @access  Private (requires permission)
router.post('/:id/submit', auth, requirePermission('canCreateTimetables'), async (req, res) => {
  try {
    const timetable = await Timetables.findById(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    if (timetable.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to submit this timetable' });
    }

    if (timetable.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft timetables can be submitted' });
    }

    timetable.status = 'pending_approval';
    await timetable.save();

    res.json({
      message: 'Timetable submitted for approval successfully',
      timetable
    });
  } catch (error) {
    console.error('Submit timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/timetables/:id
// @desc    Delete timetable
// @access  Private (requires permission)
router.delete('/:id', auth, requirePermission('canCreateTimetables'), async (req, res) => {
  try {
    const timetable = await Timetables.findById(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    // Check if user can delete this timetable
    if (timetable.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this timetable' });
    }

    // Don't allow deleting approved or active timetables
    if (timetable.status === 'approved' || timetable.status === 'active') {
      return res.status(400).json({ message: 'Cannot delete approved or active timetables' });
    }

    await Timetables.findByIdAndDelete(req.params.id);

    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    console.error('Delete timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
