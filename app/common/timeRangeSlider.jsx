import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DefaultTimeRange } from "./constants";
import { Utils } from "../../utils/utils";

const CustomRangePicker = ({
  availableSlots,
  onChange,
  startTime,
  endTime,
  trainerHourlyRate = {
    from: DefaultTimeRange.startTime,
    to: DefaultTimeRange.endTime,
  },
}) => {
  const [startPosition, setStartPosition] = useState(0);
  const [endPosition, setEndPosition] = useState(100);
  const [isSlotAvailable, setIsSlotAvailable] = useState(true);
  const [draggingStart, setDraggingStart] = useState(false);
  const [draggingEnd, setDraggingEnd] = useState(false);
  const [time, setTime] = useState({});

  useEffect(() => { }, [availableSlots?.length])

  useEffect(() => {
    const changeStartTime = (startPosition / 100) * (endTime - startTime);
    const changeEndTime = (endPosition / 100) * (endTime - startTime);
    if (time && time.startTime && time.endTime) {
      onChange({
        startTime: convertMinutesToHour(+time.startTime + startTime),
        endTime: convertMinutesToHour(
          endTime - (endTime - startTime - +time.endTime)
        ),
      });
    }
    setTime({
      startTime: Math.floor(changeStartTime).toFixed(2),
      endTime: Math.floor(changeEndTime).toFixed(2),
    });
    for (const slot of availableSlots) {
      const slotStart =
        parseInt(slot?.start_time?.split(":")[0]) * 60 +
        parseInt(slot?.start_time?.split(":")[1]);
      const slotEnd =
        parseInt(slot?.end_time?.split(":")[0]) * 60 +
        parseInt(slot?.end_time?.split(":")[1]);
      if (changeStartTime < slotEnd && changeEndTime > slotStart) {
        setIsSlotAvailable(false);
        return;
      }
    }
    setIsSlotAvailable(true);
  }, [startPosition, endPosition]);

  const handleStartDrag = (e) => {
    setDraggingStart(true);
  };

  const handleEndDrag = (e) => {
    setDraggingEnd(true);
  };

  const handleDrag = (e) => {
    if (draggingStart) {
      const newPosition = calculateNewPosition(
        e.clientX || e?.touches[0]?.clientX
      );
      if (newPosition <= endPosition - 1.5 && newPosition >= 0) {
        setStartPosition(newPosition);
      }
    }

    if (draggingEnd) {
      const newPosition = calculateNewPosition(
        e.clientX || e?.touches[0]?.clientX
      );
      if (newPosition >= startPosition + 1.5 && newPosition <= 100) {
        setEndPosition(newPosition);
      }
    }
  };

  const convertMinutesToHour = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const minutesPart = minutes % 60;
    const formattedHour = `${hours.toString().padStart(2, "0")}:${minutesPart
      .toString()
      .padStart(2, "0")}`;
    return formattedHour;
  };

  const handleMouseUp = () => {
    setDraggingStart(false);
    setDraggingEnd(false);
  };

  const calculateNewPosition = (clientX) => {
    const range = document.getElementById("custom-range-picker");
    const rangeRect = range.getBoundingClientRect();
    const offsetX = clientX - rangeRect.left;
    const newPosition = (offsetX / rangeRect.width) * 100;
    return newPosition;
  };

  console.log("availableSlotsavailableSlotsavailableSlotsavailableSlotsavailableSlots", availableSlots)
  return (
    <React.Fragment>
      <div
        id="custom-range-picker"
        className={`${"custom-range-picker"} ${isSlotAvailable ? "" : "unavailable"
          }`}
        onMouseMove={handleDrag}
        onMouseUp={handleMouseUp}
        onTouchMove={handleDrag} // Handle touch events
        onTouchEnd={handleMouseUp} // Handle touch events
      >
        <div
          className={"start-range"}
          style={{ left: `${startPosition}%` }}
          onMouseDown={handleStartDrag}
          onTouchStart={handleStartDrag} // Handle touch events
        />
        <div
          onMouseDown={handleEndDrag}
          onTouchStart={handleEndDrag}
          className={"end-range-content"}
        >
          <div
            style={{ left: `${endPosition}%` }}
            onMouseDown={handleEndDrag}
            onTouchStart={handleEndDrag}
            className={"end-range"}
          />
        </div>
        {availableSlots?.map((slot, index) => {
          // const { startPos, endPos } = Utils.getPercentageForSlot(slot?.start_time, slot?.end_time, slot?.isSelected, slot?.status);
          const { startPos, endPos } = Utils.getPercentageForSlotForRangeBar(
            slot.start_time,
            slot.end_time,
            trainerHourlyRate.from,
            trainerHourlyRate.to
          );

          return (
            <div
              key={index}
              className="slot"
              style={{
                // left: `${(parseInt(slot.start_time.split(":")[0]) / +slot.end_time.split(":")[0]) * 100}%`,
                // left: `${(parseInt(slot.start_time.split(":")[0]) / +slot.end_time.split(":")[0]) * 100}%`,
                left: `${startPos}%`,
                width: `${endPos - startPos}%`,
              }}
            />
          );
        })}
      </div>
      <div className="mt-3">
        <span>
          Time Start Time : {convertMinutesToHour(+time.startTime + startTime)}
        </span>
        <span className="ml-2">
          End Time:{" "}
          {convertMinutesToHour(
            endTime - (endTime - startTime - +time.endTime)
          )}
        </span>
      </div>
    </React.Fragment>
  );
};

CustomRangePicker.prototype = {
  availableSlots: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired,
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
};
export default CustomRangePicker;
