import React from 'react';
import Timer from '../Timer';


const VideoCallHeader = ({
  session_end_time,
  fromUser,
  toUser,
  accountType,
  displayMsg,
}) => {
  const timeDifference = Timer(session_end_time);

  return (
    <div className="video-call-header">
      {displayMsg?.showMsg && (
        <div className="waiting-message">
          <p>{displayMsg.msg}</p>
        </div>
      )}
      <div className="session-timer" id="sessionEndTime">
        <Timer session_end_time={session_end_time} />
      </div>
      <div className="user-info">
        <span>
          {accountType === 'Trainer' ? toUser?.fullname : fromUser?.fullname}
        </span>
      </div>
    </div>
  );
};

export default VideoCallHeader;

