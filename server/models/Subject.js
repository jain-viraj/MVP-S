const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
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
    required: true,
    min: 1,
    max: 8
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  type: {
    type: String,
    enum: ['theory', 'practical', 'project', 'seminar'],
    default: 'theory'
  },
  hoursPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  preferredClassroomType: {
    type: String,
    enum: ['lecture', 'lab', 'seminar', 'conference', 'auditorium'],
    default: 'lecture'
  },
  prerequisites: [String],
  coRequisites: [String],
  specialRequirements: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
