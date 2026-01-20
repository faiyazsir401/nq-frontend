import Timer from "../video/Timer";

const TimeRemaining = ({ timeRemaining, bothUsersJoined = false }) => {

  return (
    <div className="time-container">
      <h3 className="label">Time remaining:</h3>
      <h3 className="value">{Timer(timeRemaining, bothUsersJoined)}</h3>
    </div>
  );
};

export default TimeRemaining;
