import React, { useContext, useEffect } from "react";
import { HandleVideoCall } from "../../video/video";
import { SocketContext } from "../../socket";
import { EVENTS } from "../../../../helpers/events";
import { AccountType } from "../../../common/constants";

const StartMeeting = ({
  id,
  isClose,
  accountType,
  traineeInfo,
  trainerInfo,
  session_end_time,
  bIndex,
}) => {
  console.log("StartMeeting -> session_end_time", session_end_time);
  const socket = useContext(SocketContext);

  socket.on(EVENTS.VIDEO_CALL.ON_CLOSE, () => {
    setTimeout(() => {
      // closing video call window in 5 sec
      isClose();
    }, 3000);
  });
  const mediaQuery = window.matchMedia("(min-width: 768px)");

  return (
    <div className={mediaQuery.matches ? "mr-3 full-height" : "mr-3"}>
      <HandleVideoCall
        id={id}
        isClose={isClose}
        accountType={accountType}
        bIndex={bIndex}
        fromUser={
          accountType === AccountType.TRAINEE ? traineeInfo : trainerInfo
        }
        toUser={accountType === AccountType.TRAINEE ? trainerInfo : traineeInfo}
        session_end_time={session_end_time}
      />
    </div>
  );
};

export default StartMeeting;
