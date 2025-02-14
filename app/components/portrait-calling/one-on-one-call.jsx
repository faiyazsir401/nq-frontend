import TimeRemaining from "./time-remaining";
import { UserBox, UserBoxMini } from "./user-box";

const OneOnOneCall = ({ timeRemaining, selectedUser, setSelectedUser,videoRef }) => {
    const handleUserClick = (id) => {
      setSelectedUser(id);
    };
  
    return (
      <>
        <div className="d-flex w-100 justify-content-end mr-5 mt-2">
          <TimeRemaining timeRemaining={timeRemaining} />
        </div>
  
        <div className="video-section">
          <UserBox
            id="2"
            name="Trainer"
            onClick={handleUserClick}
            selected={selectedUser === "1"}
            notSelected={selectedUser}
            videoRef={videoRef}
          />
          <UserBox
            id="1"
            name="Trainee"
            onClick={handleUserClick}
            selected={selectedUser === "2"}
            notSelected={selectedUser}
          />
        </div>
  
        {selectedUser && (
          <UserBoxMini
            id={selectedUser === "1" ? "2" : "1"}
            name={selectedUser === "1" ? "Trainee" : "Trainer"}
            onClick={handleUserClick}
            selected={false}
          />
        )}
      </>
    );
  };

  export default OneOnOneCall