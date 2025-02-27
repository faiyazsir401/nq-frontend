import Draggable from "react-draggable";
import { Point, Utils } from "../../../utils/utils";
import React, { useEffect } from "react";
import { useCallback } from "react";
import { AccountType } from "../../common/constants";

export const UserBox = ({
  onClick,
  selected,
  id,
  notSelected,
  videoRef,
  user,
  stream,
  isStreamOff,
  selectedUser,
  isLandscape
}) => {
  console.log("user", id);

  const setVideoRef = useCallback(
    (node) => {
      if (node) {
        videoRef.current = node;
        if (stream) {
          videoRef.current.srcObject = stream;
        }
      }
    },
    [stream]
  );
  useEffect(() => {
    console.log("ideoRef?.current", videoRef?.current);
    if (videoRef?.current) {
      videoRef.current.srcObject = stream;
    }
  }, [videoRef, stream, isStreamOff, selectedUser]);

  return (
    <div
      className={`${false ? "" : "profile-box"} ${
        notSelected && (selected ? "selected" : "hidden")
      }`}
      style={{
        position: "relative",
        width: isLandscape?"50vw":"95vw"
      }}
      onClick={() => !selected && onClick(id)}
    >
      {!isStreamOff ? (
        <video
          playsInline
          autoPlay
          ref={setVideoRef}
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            objectFit: "cover",
            borderRadius: "20px",
          }}
        ></video>
      ) : user?.profile_picture ? (
        <>
          <img
            src={Utils.getImageUrlOfS3(user?.profile_picture)}
            className={`profile-img `}
          />
          <p className="profile-name">{user?.fullname}</p>
        </>
      ) : (
        <>
          <img src="/user.jpg" alt="Large Profile" className={`profile-img `} />
          <p className="profile-name">{user?.fullname}</p>
        </>
      )}
    </div>
  );
};

function useClickObserver(callback) {
  const [dragStartPos, setDragStartPos] = React.useState(new Point());
  const onStart = (_, data) => {
    setDragStartPos(new Point(data.x, data.y));
  };
  const onStop = (_, data) => {
    const dragStopPoint = new Point(data.x, data.y);
    if (Point.dist(dragStartPos, dragStopPoint) < 5) {
      callback();
    }
  };
  return { onStart, onStop };
}

export const UserBoxMini = ({
  name,
  onClick,
  selected,
  id,
  videoRef,
  user,
  stream,
  isStreamOff,
  zIndex,
  bottom
}) => {
  const setVideoRef = useCallback(
    (node) => {
      if (node) {
        videoRef.current = node;
        if (stream) {
          videoRef.current.srcObject = stream;
        }
      }
    },
    [stream]
  );

  useEffect(() => {
    if (videoRef?.current) {
      videoRef.current.srcObject = stream;
    }
  }, [videoRef, stream, isStreamOff]);

  const handleBoxClick = () => {
    // event.stopPropagation();
    if (onClick && id) {
      console.log("i am clicked");
      onClick(id);
    }
  };


  return (
    <Draggable bounds="parent" {...useClickObserver(handleBoxClick)}>
      <div className={`profile-box mini hide-in-screenshot`} style={{
        zIndex: zIndex ?? 100,
        bottom:bottom??50
      }}>
        {!isStreamOff ? (
          <video
            playsInline
            autoPlay
            ref={setVideoRef}
            style={{
              height: "100%",
              width: "100%",
              position: "absolute",
              objectFit: "cover",
              borderRadius: "20px",
            }}
          ></video>
        ) : user?.profile_picture ? (
          <>
            <img
              src={Utils.getImageUrlOfS3(user?.profile_picture)}
              className={`profile-img `}
            />
            <p className="profile-name">{user?.fullname}</p>
          </>
        ) : (
          <>
            <img
              src="/user.jpg"
              alt="Large Profile"
              className={`profile-img `}
            />
            <p className="profile-name">{name}</p>
          </>
        )}
      </div>
    </Draggable>
  );
};

export const VideoMiniBox = ({ onClick, id, clips,bottom }) => {
  const handleBoxClick = () => {
    // event.stopPropagation();
    if (onClick) {
      console.log("i am clicked");
      onClick(id);
    }
  };

  return (
    <Draggable bounds="parent" {...useClickObserver(handleBoxClick)}>
      <div
        className={`profile-box mini-landscape hide-in-screenshot`}
        style={{
          zIndex: 5,
          bottom:bottom??50
        }}
      >
        {clips.map((clip) => (
          <img src={Utils?.generateThumbnailURL(clip)} />
        ))}
      </div>
    </Draggable>
  );
};
