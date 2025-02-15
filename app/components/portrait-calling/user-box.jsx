import Draggable from "react-draggable";
import { Utils } from "../../../utils/utils";
import { useEffect } from "react";

export const UserBox = ({
  onClick,
  selected,
  id,
  notSelected,
  videoRef,
  user,
  stream,
  isStreamOff
}) => {
  console.log("user",user)
  useEffect(()=>{
    if(videoRef?.current){
      videoRef.current.srcObject = stream
    }
  },[videoRef,stream,isStreamOff,id])
  
  return (
    <div
      className={`${false?"": "profile-box"} ${
        notSelected && (selected ? "selected" : "hidden")
      }`}
      style={{
        position:"relative"
      }}
      onClick={() => onClick(id)}
    >
      {!isStreamOff ? (
        <video
          playsInline
          autoPlay
          ref={videoRef}
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            objectFit: "cover",
            borderRadius:"20px"
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

export const UserBoxMini = ({ name, onClick, selected, id,videoRef,user,stream,isStreamOff }) => {

  useEffect(()=>{
    if(videoRef?.current){
      videoRef.current.srcObject = stream
    }
  },[videoRef,stream,isStreamOff])
  return (
    <Draggable bounds="parent">
    
     
      <div className={`profile-box mini`}>

      {!isStreamOff ? (
        <video
          playsInline
          autoPlay
          ref={videoRef}
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            objectFit: "cover",
            borderRadius: "20px"
          }}
        >

        </video>
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
            <p className="profile-name">{name}</p>
        </>
      )}
     
      </div>
    </Draggable>
  );
};
