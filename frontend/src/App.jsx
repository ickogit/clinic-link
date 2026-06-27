import React, { useState, useEffect } from 'react';
import './App.css'; // Importing our polished dashboard styles!

function App() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Booking Form State ---
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  // --- Editing State Variables ---
  const [editingId, setEditingId] = useState(null);
  const [editPatientName, setEditPatientName] = useState('');
  const [editPatientPhone, setEditPatientPhone] = useState('');
  const [editDoctor, setEditDoctor] = useState('');
  const [editAppointmentDate, setEditAppointmentDate] = useState('');
  const [editTimeSlot, setEditTimeSlot] = useState('');

  // --- Filter & Search State Variables ---
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState(''); // 🔍 New Search State!

  // Helper function for 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    let hour = 8;
    let minutes = 0;
    while (hour < 17 || (hour === 17 && minutes === 0)) {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      const displayMinutes = minutes === 0 ? '00' : '30';
      slots.push(`${displayHour}:${displayMinutes} ${ampm}`);
      minutes += 30;
      if (minutes === 60) { minutes = 0; hour += 1; }
    }
    return slots;
  };
  const timeSlotsArray = generateTimeSlots();

  // Converts appointmentDate + timeSlot string into a comparable Date Object
  const convertToComparableDate = (dateString, timeString) => {
    if (!dateString) return new Date(0);
    const baseDateStr = dateString.split('T')[0];
    if (!timeString) return new Date(baseDateStr);
    
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    const pad = (num) => String(num).padStart(2, '0');
    return new Date(`${baseDateStr}T${pad(hours)}:${pad(minutes)}:00`);
  };

  const fetchAppointments = () => {
    fetch('http://localhost:5001/api/appointments')
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleBookAppointment = (e) => {
    e.preventDefault();
    if (!patientName || !patientPhone || !doctorName || !appointmentDate || !timeSlot) {
      alert('Please fill out all fields.');
      return;
    }

    const newAppointment = { patientName, patientPhone, doctor: doctorName, appointmentDate, timeSlot };

    fetch('http://localhost:5001/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAppointment),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Server validation failed');
        return res.json();
      })
      .then(() => {
        fetchAppointments();
        setPatientName(''); setPatientPhone(''); setDoctorName(''); setAppointmentDate(''); setTimeSlot('');
      })
      .catch((err) => console.error('Error booking appointment:', err));
  };

  const handleDeleteAppointment = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      fetch(`http://localhost:5001/api/appointments/${id}`, { method: 'DELETE' })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to delete resource');
          return res.json();
        })
        .then((data) => {
          alert(data.message);
          fetchAppointments();
        })
        .catch((err) => console.error('Error removing appointment:', err));
    }
  };

  const startEditing = (appt) => {
    setEditingId(appt._id);
    setEditPatientName(appt.patientName);
    setEditPatientPhone(appt.patientPhone);
    setEditDoctor(appt.doctor);
    setEditAppointmentDate(appt.appointmentDate ? appt.appointmentDate.split('T')[0] : '');
    setEditTimeSlot(appt.timeSlot);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleUpdateAppointment = (id) => {
    if (!editPatientName || !editPatientPhone || !editDoctor || !editAppointmentDate || !editTimeSlot) {
      alert('Fields cannot be empty while saving modifications.');
      return;
    }

    const updatedData = {
      patientName: editPatientName,
      patientPhone: editPatientPhone,
      doctor: editDoctor,
      appointmentDate: editAppointmentDate,
      timeSlot: editTimeSlot
    };

    fetch(`http://localhost:5001/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Update failed');
        return res.json();
      })
      .then((data) => {
        alert(data.message);
        setEditingId(null);
        fetchAppointments();
      })
      .catch((err) => console.error('Error modifying record:', err));
  };

  // Extract list of unique doctors currently in the database
  const uniqueDoctorsList = ['All', ...new Set(appointments.map((appt) => appt.doctor).filter(Boolean))];

  // Combined Filter, Search, & Chronological Sorting execution lines
  const processedAppointments = appointments
    .filter((appt) => {
      const matchesDoctor = selectedDoctorFilter === 'All' || appt.doctor === selectedDoctorFilter;
      
      // Check if text matches patient name, phone number, or doctor name
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        appt.patientName.toLowerCase().includes(searchLower) ||
        appt.patientPhone.includes(searchLower) ||
        appt.doctor.toLowerCase().includes(searchLower);

      return matchesDoctor && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = convertToComparableDate(a.appointmentDate, a.timeSlot);
      const dateB = convertToComparableDate(b.appointmentDate, b.timeSlot);
      return dateA - dateB;
    });

  return (
    <div className="app-container">
      <div className="header-section">
        <h1>ClinicLink Admin Portal</h1>
        <p>Welcome, Icko! All systems active.</p>
      </div>
      
      {/* Creation Booking Form Card */}
      <div className="card">
        <h3>Book New Patient Appointment</h3>
        <form onSubmit={handleBookAppointment}>
          <div className="form-group">
            <label>Patient Name</label>
            <input type="text" className="form-input" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Full Name" />
          </div>
          <div className="form-group">
            <label>Patient Phone Number</label>
            <input type="text" className="form-input" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="09XXXXXXXXX" />
          </div>
          <div className="form-group">
            <label>Attending MD / Specialist</label>
            <input type="text" className="form-input" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="e.g. Dr. Vitusa" />
          </div>
          <div className="form-group">
            <label>Schedule Date</label>
            <input type="date" className="form-input" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Time Slot</label>
            <select className="form-input" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
              <option value="">-- Select Available Time Slot --</option>
              {timeSlotsArray.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Register Appointment
          </button>
        </form>
      </div>
      
      {/* Interactive Search & Filter Management Controls */}
      <div className="filter-row">
        <h2>Active Queue ({processedAppointments.length})</h2>
        <div className="filter-controls">
          {/* New Live Search Bar */}
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search patient, phone, or doctor..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <select className="filter-select" value={selectedDoctorFilter} onChange={(e) => setSelectedDoctorFilter(e.target.value)}>
            {uniqueDoctorsList.map((doc) => <option key={doc} value={doc}>{doc}</option>)}
          </select>
        </div>
      </div>
      
      {loading ? (
        <p className="empty-state">Loading medical logs...</p>
      ) : processedAppointments.length === 0 ? (
        <p className="empty-state">No medical records match your search or selection.</p>
      ) : (
        <ul className="appointment-list">
          {processedAppointments.map((appt) => {
            const isEditing = editingId === appt._id;
            
            return (
              <li key={appt._id} className={`appointment-item ${isEditing ? 'editing' : ''}`}>
                
                {isEditing ? (
                  /* CARD EDITING MODE LAYOUT */
                  <div className="edit-form-grid">
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>Modifying Record</span>
                    <input type="text" className="form-input" value={editPatientName} onChange={(e) => setEditPatientName(e.target.value)} />
                    <input type="text" className="form-input" value={editPatientPhone} onChange={(e) => setEditPatientPhone(e.target.value)} />
                    <input type="text" className="form-input" value={editDoctor} onChange={(e) => setEditDoctor(e.target.value)} />
                    <input type="date" className="form-input" value={editAppointmentDate} onChange={(e) => setEditAppointmentDate(e.target.value)} />
                    <select className="form-input" value={editTimeSlot} onChange={(e) => setEditTimeSlot(e.target.value)}>
                      {timeSlotsArray.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button onClick={() => handleUpdateAppointment(appt._id)} className="btn btn-save">Save</button>
                      <button onClick={cancelEditing} className="btn btn-secondary">Cancel</button>
                    </div>
                  </div>
                ) : (
                  /* STANDARD DISPLAY MODE LAYOUT */
                  <>
                    <div className="patient-info">
                      <div>
                        <strong>{appt.patientName}</strong> 
                        <span className="patient-phone">({appt.patientPhone})</span>
                      </div>
                      <div>
                        <span className="doctor-tag">Dr. {appt.doctor.replace(/^Dr\.\s*/i, '')}</span>
                      </div>
                      <div className="schedule-details">
                        Time: <span className="highlight-text">{appt.timeSlot}</span> | Date: <span className="highlight-text">{appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                    <div className="action-buttons">
                      <button onClick={() => startEditing(appt)} className="btn btn-edit">Edit</button>
                      <button onClick={() => handleDeleteAppointment(appt._id)} className="btn btn-cancel">Cancel</button>
                    </div>
                  </>
                )}
                
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default App;