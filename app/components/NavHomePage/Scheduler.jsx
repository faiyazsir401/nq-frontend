import React, { useState } from 'react';
import './schedular.css';

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

const DayAvailability = ({ day, times, setTimes, copyFromMonday }) => {
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
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone); // Default to system time zone

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

  return (
    <div className="scheduler-container">
      <label>General Availability</label>
      
      <div className="timezone-selector">
        <label htmlFor="timeZone">Select Time Zone: </label>
        <select id="timeZone" value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
          {timeZones.map((zone) => (
            <option key={zone} value={zone}>{zone}</option>
          ))}
        </select>
      </div>

      {Object.entries(availability).map(([day, times]) => (
        <DayAvailability
          key={day}
          day={day}
          times={times}
          setTimes={(newTimes) => setDayTimes(day, newTimes)}
          copyFromMonday={() => copyTimes('Mon', day)}
        />
      ))}
      
      <p className="time-zone">Time Zone: {timeZone}</p>
    </div>
  );
};

export default Scheduler;
