import React, { useContext, useEffect } from "react";
import { HandleVideoCall } from "../../video/video";
import { SocketContext } from "../../socket";
import { EVENTS } from "../../../../helpers/events";
import { AccountType } from "../../../common/constants";
import { toast } from "react-toastify";

const StartMeeting = ({
  id,
  isClose,
  accountType,
  traineeInfo,
  trainerInfo,
  session_end_time,
  bIndex,
}) => {
  const socket = useContext(SocketContext);

  useEffect(() => {
    // Check if socket is available before setting up event listeners
    if (!socket) {
      console.error('[StartMeeting] Socket is not available');
      toast.error("Unable to connect to the server. Please refresh the page and try again.");
      return;
    }

    // Set up event listener for call close
    socket.on(EVENTS.VIDEO_CALL.ON_CLOSE, () => {
      setTimeout(() => {
       setTimeout(() => {
         // closing video call window in 3 sec
         isClose();
       }, 3000);
        isClose();
      }, 3000);
    });

    // Cleanup: Remove event listener on unmount
    return () => {
      if (socket) {
        socket.off(EVENTS.VIDEO_CALL.ON_CLOSE);
      }
    };
  }, [socket, isClose]);

  // Don't render video call if socket is not available
  if (!socket) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Connecting to server... Please wait.</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          If this message persists, please refresh the page.
        </p>
      </div>
    );
  }

  const mediaQuery = window.matchMedia("(min-width: 768px)");

  return (
    <div>
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
