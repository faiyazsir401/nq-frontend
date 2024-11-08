import React, { useState } from 'react';
import './schedular.css';
import timezones from '../../../utils/timezones.json';

const generateTimeOptions = () => {
  const times = [];
  const period = ["AM", "PM"];
  for (let i = 0; i < 2; i++) {
    for (let h = 1; h <= 12; h++) {
      times.push(`${h}:00 ${period[i]}`);
      times.push(`${h}:30 ${period[i]}`);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();
const timeZones = [
  "UTC", "America/New_York", "Europe/London", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"
  // Add more time zones as needed
];
const appointmentDurations = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 }
];

const DayAvailability = ({ day, times, setTimes, copyToAll }) => {
  const handleTimeChange = (index, field, value) => {
    const newTimes = [...times];
    newTimes[index][field] = value;
    setTimes(newTimes);
  };

  const addTimeSlot = () => setTimes([...times, { start: '09:00 AM', end: '05:00 PM' }]);
  const removeTimeSlot = (index) => setTimes(times.filter((_, i) => i !== index));
  
  return (
    <div className="day-availability d-flex justify-content-between">
      <h4>{day}</h4>
      {times.length === 0 ? (
        <p className="unavailable-text">Unavailable</p>
      ) : (
        <div className="time-slot-container">
          {times.map((slot, index) => (
            <div key={index} className="time-slot">
              <select
                value={slot.start}
                onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              <span> - </span>
              <select
                value={slot.end}
                onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              <button className="icon-button delete" onClick={() => removeTimeSlot(index)}>🚫</button>
              <button className="icon-button add" onClick={addTimeSlot}>+</button>
            </div>
          ))}
        </div>
      )}
      <div className="day-actions">
        {times.length <= 0 && <button className="icon-button add" onClick={addTimeSlot}>+</button>}
        <button className="icon-button add" onClick={() => copyToAll()}>copy</button>
      </div>
    </div>
  );
};

const Scheduler = () => {
  const [duration, setDuration] = useState(60);
  const [availability, setAvailability] = useState({
    Sun: [],
    Mon: [{ start: '09:00 AM', end: '05:00 PM' }],
    Tue: [{ start: '09:00 AM', end: '05:00 PM' }],
    Wed: [{ start: '09:00 AM', end: '05:00 PM' }],
    Thu: [{ start: '09:00 AM', end: '05:00 PM' }],
    Fri: [{ start: '09:00 AM', end: '05:00 PM' }],
    Sat: []
  });
  const [timeZone, setTimeZone] = useState(timeZones[0]); // Default to system time zone
  const [selectedDuration, setSelectedDuration] = useState(15);
  const setDayTimes = (day, newTimes) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: newTimes
    }));
  };

  const copyTimes = (sourceDay, targetDay) => {
    setAvailability((prev) => ({
      ...prev,
      [targetDay]: [...prev[sourceDay]]
    }));
  };
  const copyToAll = (day_key) => {
    let tempObj = {}
    Object.keys(availability).map((key) =>{
      tempObj[key] =JSON.parse(JSON.stringify(availability[day_key])); 
    })
    setAvailability(tempObj)
    tempObj = {}
  }
  return (
    <div className="scheduler-container">
      <label>General Availability</label>
      
      <div className="timezone-selector">
        <label htmlFor="timeZone">Select Time Zone: </label>
        <select id="timeZone" value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
          {timezones.map((zone, index) => (
            <option key={index} value={zone.name}>
              {zone.name}
            </option>
          ))}
        </select>
        <div className='my-3'>
        <label >Appointment duration</label>
        <select 
            id="appointmentDuration" 
            value={selectedDuration} 
            onChange={(e) => setSelectedDuration(e.target.value)}
        >
            {appointmentDurations.map((duration) => (
                <option key={duration.value} value={duration.value}>
                    {duration.label}
                </option>
            ))}
        </select>
        </div>
      </div>

      {Object.entries(availability).map(([day, times]) => (
        <DayAvailability
          key={day}
          day={day}
          times={times}
          setTimes={(newTimes) => setDayTimes(day, newTimes)}
          copyToAll={() => copyToAll(day)}
        />
      ))}
    </div>
  );
};

export default Scheduler;
