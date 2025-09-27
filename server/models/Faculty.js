const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  maxHoursPerWeek: {
    type: Number,
    default: 40,
    min: 1,
    max: 60
  },
  maxClassesPerDay: {
    type: Number,
    default: 6,
    min: 1,
    max: 8
  },
  preferredTimeSlots: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String
  }],
  unavailableTimeSlots: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String,
    reason: String
  }],
  averageLeavesPerMonth: {
    type: Number,
    default: 2,
    min: 0,
    max: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  specializations: [String],
  experience: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);
