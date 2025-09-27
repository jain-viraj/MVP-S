const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    enum: ['lecture', 'lab', 'seminar', 'conference', 'auditorium'],
    default: 'lecture'
  },
  department: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  building: {
    type: String,
    required: true
  },
  equipment: [{
    name: String,
    quantity: Number
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  specialRequirements: [String],
  maintenanceSchedule: {
    day: String,
    time: String,
    duration: Number // in minutes
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Classroom', classroomSchema);
