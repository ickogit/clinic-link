const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// 1. Create a new appointment
router.post('/', async (req, res) => {
  try {
    const { doctor, patientName, patientPhone, appointmentDate, timeSlot, reasonForVisit } = req.body;
    const newAppointment = new Appointment({
      doctor,
      patientName,
      patientPhone,
      appointmentDate,
      timeSlot,
      reasonForVisit
    });
    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error, could not save appointment.' });
  }
});

// 2. Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error, could not fetch appointments.' });
  }
});

// 3. Update an appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate that the status sent is one of our allowed options
    const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Find the specific appointment by its ID and update its status field
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after' } // Modern syntax to return the fresh update
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error, could not update status.' });
  }
});

// 4. Delete an appointment completely
router.delete('/:id', async (req, res) => {
  try {
    // Find the specific document by its dynamic ID and delete it
    const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!deletedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Return a success message along with the deleted data
    res.status(200).json({ 
      message: 'Appointment successfully removed from the clinic records.',
      deletedAppointment 
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error, could not delete appointment.' });
  }
});

module.exports = router;