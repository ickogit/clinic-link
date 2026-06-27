const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctor: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  patientPhone: {
    type: String,
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  reasonForVisit: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;