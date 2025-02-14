const TimeRemaining = ({ timeRemaining }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="time-container">
      <h3 className="label">Time remaining:</h3>
      <h3 className="value">{formatTime(timeRemaining)}</h3>
    </div>
  );
};

export default TimeRemaining;
