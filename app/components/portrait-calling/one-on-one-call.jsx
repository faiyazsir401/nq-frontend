import { useContext } from "react";
import { EVENTS } from "../../../helpers/events";
import { AccountType } from "../../common/constants";
import { useAppSelector } from "../../store";
import { authState } from "../auth/auth.slice";
import TimeRemaining from "./time-remaining";
import { UserBox, UserBoxMini } from "./user-box";
import { SocketContext } from "../socket";

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
  isLandscape,
}) => {
  const socket = useContext(SocketContext);
  const { accountType } = useAppSelector(authState);
  console.log("selectedUser", selectedUser);
  console.log("toUser", toUser._id);
  console.log("fromUser", fromUser._id);

  const handleUserClick = (id) => {
    if (accountType === AccountType.TRAINER) {
      setSelectedUser(id);
      emitVideoSelectEvent("swap", id);
    }
  };

  socket.on(EVENTS.ON_VIDEO_SELECT, ({ id, type }) => {
    if (type === "swap" && accountType === AccountType.TRAINEE) {
      setSelectedUser(id);
    }
  });

  const emitVideoSelectEvent = (type, id) => {
    socket.emit(EVENTS.ON_VIDEO_SELECT, {
      userInfo: { from_user: fromUser._id, to_user: toUser._id },
      type,
      id,
    });
  };

  return (
    <>
      <div className="d-flex w-100 justify-content-end mr-5 mt-2">
        <TimeRemaining timeRemaining={timeRemaining} />
      </div>

      <div className="video-section">
        <UserBox
          id={toUser._id}
          onClick={handleUserClick}
          selected={selectedUser === toUser._id}
          selectedUser={selectedUser}
          notSelected={selectedUser}
          videoRef={videoRef}
          user={fromUser}
          stream={localStream}
          isStreamOff={isLocalStreamOff}
          isLandscape={isLandscape}
          muted={true}
        />
        <UserBox
          id={fromUser._id}
          onClick={handleUserClick}
          selectedUser={selectedUser}
          selected={selectedUser === fromUser._id}
          notSelected={selectedUser}
          videoRef={remoteVideoRef}
          user={toUser}
          stream={remoteStream}
          isStreamOff={isRemoteStreamOff}
          isLandscape={isLandscape}
        />

        {selectedUser && (
          <UserBoxMini
            id={selectedUser === toUser._id ? fromUser._id : toUser._id}
            onClick={handleUserClick}
            selected={false}
            videoRef={selectedUser === toUser._id ? remoteVideoRef : videoRef}
            stream={selectedUser === toUser._id ? remoteStream : localStream}
            user={selectedUser === toUser._id ? toUser : fromUser}
            isStreamOff={
              selectedUser === toUser._id ? isRemoteStreamOff : isLocalStreamOff
            }
            muted={selectedUser === toUser._id ? false : true}
          />
        )}
      </div>
    </>
  );
};

export default OneOnOneCall;
