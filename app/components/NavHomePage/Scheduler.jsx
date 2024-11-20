import React, { useState } from "react";
import "./schedular.css";
import timezones from "../../../utils/timezones.json";
import { useAppDispatch, useAppSelector } from "../../store";
import { authState } from "../auth/auth.slice";
import { updateProfileAsync } from "../trainer/trainer.slice";
import { currentTimeZone } from "../../../utils/videoCall";
import { MdContentCopy } from "react-icons/md";
import Image from "next/image";
import { toast } from "react-toastify";



const initialDayValue = {
  Sun: [{ start: "09:00 AM", end: "05:00 PM" }],
  Mon: [{ start: "09:00 AM", end: "05:00 PM" }],
  Tue: [{ start: "09:00 AM", end: "05:00 PM" }],
  Wed: [{ start: "09:00 AM", end: "05:00 PM" }],
  Thu: [{ start: "09:00 AM", end: "05:00 PM" }],
  Fri: [{ start: "09:00 AM", end: "05:00 PM" }],
  Sat: [{ start: "09:00 AM", end: "05:00 PM" }],
};


const appointmentDurations = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
];

const DayAvailability = ({ day, times, setTimes, copyToAll }) => {
  const handleTimeChange = (index, field, value) => {
    const newTimes = [...times];
    const newSlot = { ...times[index] };
  
    if (field === "end") {
      const [startHour, startMinutes] = parseTime(newSlot.start);
      const [endHour, endMinutes] = parseTime(value);
  
      // Check if end time is earlier than start time
      if (endHour < startHour || (endHour === startHour && endMinutes < startMinutes)) {
        toast.error("End time cannot be earlier than start time.");
        return; // Exit without updating if end time is invalid
      }
    } else if (field === "start") {
      const [newStartHour, newStartMinutes] = parseTime(value);
      const [currentEndHour, currentEndMinutes] = parseTime(newSlot.end);
  
      // Check if start time is later than end time
      if (newStartHour > currentEndHour || (newStartHour === currentEndHour && newStartMinutes > currentEndMinutes)) {
        toast.error("Start time cannot be later than end time.");
        return; // Exit without updating if start time is invalid
      }
    }
  
    newSlot[field] = value;
    newTimes[index] = newSlot;
    setTimes(newTimes);
  };
  
  
  const generateTimeOptions = () => {
    const times = [];
    const period = ["AM", "PM"];
  
    // Generate AM times (1:00 AM to 11:30 AM)
    for (let h = 1; h < 12; h++) {
      times.push(`${h}:00 AM`);
      times.push(`${h}:30 AM`);
    }
  
    // Add 12:00 PM and 12:30 PM separately
    times.push("12:00 PM");
    times.push("12:30 PM");
  
    // Generate PM times (1:00 PM to 11:30 PM)
    for (let h = 1; h < 12; h++) {
      times.push(`${h}:00 PM`);
      times.push(`${h}:30 PM`);
    }
  
    // Add 12:00 AM at the end
    times.push("12:00 AM");
  
    return times;
  };
  

  const timeOptions = generateTimeOptions();
  const parseTime = (time) => {
    const [hour, minute] = time.split(":");
    const parsedHour = parseInt(hour, 10);
    const isPM = time.includes("PM");
    return [(parsedHour % 12) + (isPM ? 12 : 0), minute.slice(0, 2)];
  };

  const getNextTimeSlot = () => {
    console.log("times", times);
    if (times.length === 0) return { start: "9:00 AM", end: "10:00 AM" };

    const lastSlot = times[times.length - 1];
    const [lastEndHour, lastEndMinutes] = parseTime(lastSlot.end);

    const nextStartHour = (lastEndHour + 1) % 24;
    const nextPeriod = nextStartHour >= 12 ? "PM" : "AM";
    const displayStartHour = nextStartHour % 12 === 0 ? 12 : nextStartHour % 12;
    const nextStart = `${displayStartHour}:${lastEndMinutes} ${nextPeriod}`;

    const nextEndHour = (lastEndHour + 2) % 24;
    const nextEndPeriod = nextEndHour >= 12 ? "PM" : "AM";
    const displayEndHour = nextEndHour % 12 === 0 ? 12 : nextEndHour % 12;
    const nextEnd = `${displayEndHour}:${lastEndMinutes} ${nextEndPeriod}`;

    // Ensure the end time does not exceed 11:59 PM
    if (nextStart === "11:00 PM") {
      return { start: "11:00 PM", end: "12:00 PM" };
    }

    return { start: nextStart, end: nextEnd };
  };

  const addTimeSlot = () => {
    if (times.length === 0 || times[times.length - 1].end !== "12:00 PM") {
      console.log("slimshady", [...times, getNextTimeSlot()]);
      setTimes([...times, getNextTimeSlot()]);
    }
  };

  const removeTimeSlot = (index) => {
    setTimes(times.filter((_, i) => i !== index));
  };

  console.log("plesae",timeOptions);

  return (
    <div className="day-availability d-flex justify-content-between">
      <h4>{day}</h4>
      <div className="d-flex align-items-start">
      {times.length === 0 ? (
        <p className="unavailable-text">Unavailable</p>
      ) : (
      
          <div className="time-slot-container">
            {times.map((slot, index) => (
              <div key={index} className="time-slot">
                <select            
                  onChange={(e) =>
                    handleTimeChange(index, "start", e.target.value)
                  }
                  value={slot.start}
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time} >
                      {time}
                    </option>
                  ))}
                </select>
                <span> - </span>
                <select
                  value={slot.end}
                  onChange={(e) =>
                    handleTimeChange(index, "end", e.target.value)
                  }
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time} >
                      {time}
                    </option>
                  ))}
                </select>
                <button
                  className="icon-button delete"
                  onClick={() => removeTimeSlot(index)}
                >
                  🚫
                </button>
              </div>
            ))}
          </div>
          
     
      )}
      <div className="day-actions d-flex align-items-center justify-content-end">
            <button className="icon-button add" onClick={addTimeSlot}>
              +
            </button>
            {times.length > 0 && (
              <button className="icon-button add" onClick={() => copyToAll()}>
                <Image
                  src={"/icons/copy-icon.png"}
                  alt=""
                  height={15}
                  width={15}
                />
              </button>
            )}
          </div>
          </div>
    </div>
  );
};

const Scheduler = () => {
  const [duration, setDuration] = useState(60);
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector(authState);
  const [availability, setAvailability] = useState(
    userInfo.extraInfo?.availabilityInfo.availability || initialDayValue
  );
  const [timeZone, setTimeZone] = useState(
    userInfo.extraInfo?.availabilityInfo.timeZone || currentTimeZone()
  );
  const [selectedDuration, setSelectedDuration] = useState(
    userInfo.extraInfo?.availabilityInfo.duration || 15
  );                  

  const setDayTimes = (day, newTimes) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: newTimes,
    }));
  };

  const copyToAll = (day_key) => {
    const copiedTimes = availability[day_key].length
      ? JSON.parse(JSON.stringify(availability[day_key]))
      : [];
    const newAvailability = Object.keys(availability).reduce((acc, key) => {
      acc[key] = copiedTimes;
      return acc;
    }, {});
    setAvailability(newAvailability);
  };

  const handleSave = () => {
    const working_hours = { availability, selectedDuration, timeZone };
    dispatch(
      updateProfileAsync({
        extraInfo: {
          ...userInfo?.extraInfo,
          availabilityInfo: working_hours,
        },
      })
    );
  };

  return (
    <div className="scheduler-container card-body">
      <div className="timezone-selector">
        <label htmlFor="timeZone">Select Time Zone: </label>
        <select
          id="timeZone"
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
        >
          {timezones.map((zone, index) => (
            <option key={index} value={zone.value}>
              {zone.label}
            </option>
          ))}
        </select>
        <div className="my-3">
          <label>Appointment duration</label>
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

      <div className="w-100 text-center my-2">
        <button
          onClick={handleSave}
          type="button"
          className="ml-2 btn btn-sm btn-primary"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Scheduler;
