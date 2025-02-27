import Timer from "../video/Timer";

const TimeRemaining = ({ timeRemaining }) => {

  return (
    <div className="time-container">
      <h3 className="label">Time remaining:</h3>
      <h3 className="value">{Timer(timeRemaining)}</h3>
    </div>
  );
};

export default TimeRemaining;
