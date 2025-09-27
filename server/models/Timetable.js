const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  isSpecialClass: {
    type: Boolean,
    default: false
  },
  notes: String
});

const timetableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  timeSlots: [timeSlotSchema],
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'rejected', 'active'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  rejectionReason: String,
  optimizationScore: {
    type: Number,
    min: 0,
    max: 100
  },
  conflicts: [{
    type: String,
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  suggestions: [{
    type: String,
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  isActive: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  },
  parentTimetable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable'
  }
}, {
  timestamps: true
});

// Index for efficient queries
timetableSchema.index({ department: 1, semester: 1, academicYear: 1 });
timetableSchema.index({ status: 1 });
timetableSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
