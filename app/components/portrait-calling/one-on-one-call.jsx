import { AccountType } from "../../common/constants";
import { useAppSelector } from "../../store";
import { authState } from "../auth/auth.slice";
import TimeRemaining from "./time-remaining";
import { UserBox, UserBoxMini } from "./user-box";

const OneOnOneCall = ({
  timeRemaining,
  selectedUser,
  setSelectedUser,
  videoRef,
  remoteVideoRef,
  toUser,
  fromUser,
  remoteStream,
  localStream,
  isLocalStreamOff,
  setIsLocalStreamOff,
  isRemoteStreamOff,
}) => {
  const handleUserClick = (id) => {
    setSelectedUser(id);
  };
  const { accountType } = useAppSelector(authState);
  console.log("selectedUser", selectedUser);
  console.log("toUser", toUser._id);
  console.log("fromUser", fromUser._id);

  return (
    <>
      <div className="d-flex w-100 justify-content-end mr-5 mt-2">
        <TimeRemaining timeRemaining={timeRemaining} />
      </div>

      <div className="video-section">
        <UserBox
          id={fromUser._id}
          onClick={handleUserClick}
          selected={selectedUser === toUser._id}
          notSelected={selectedUser}
          videoRef={videoRef}
          user={fromUser}
          stream={localStream}
          isStreamOff={isLocalStreamOff}
        />
        <UserBox
          id={toUser._id}
          onClick={handleUserClick}
          selected={selectedUser === fromUser._id}
          notSelected={selectedUser}
          videoRef={remoteVideoRef}
          user={toUser}
          stream={remoteStream}
          isStreamOff={isRemoteStreamOff}
        />
      </div>
      {selectedUser && (
        <UserBoxMini
          id={selectedUser === toUser._id ? toUser._id : fromUser._id}
          onClick={handleUserClick}
          selected={false}
          videoRef={selectedUser === toUser._id ? remoteVideoRef : videoRef}
          stream={selectedUser === toUser._id ? remoteStream : localStream}
          user={selectedUser === toUser._id ? toUser : fromUser}
          isStreamOff={
            selectedUser === toUser._id ? isRemoteStreamOff : isLocalStreamOff
          }
        />
      )}
    </>
  );
};

export default OneOnOneCall;
