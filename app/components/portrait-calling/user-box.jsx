import Draggable from "react-draggable";

export const UserBox = ({ name, onClick, selected, id, notSelected,videoRef }) => {
    return (
      <div
        className={`profile-box ${
          notSelected && (selected ? "selected" : "hidden")
        }`}
        onClick={() => onClick(id)}
      >
        <img src="/user.jpg" alt="Large Profile" className={`profile-img `} />
        <video src="" ref={videoRef}></video>
        <p className="profile-name">{name}</p>
      </div>
    );
  };
  
  export  const UserBoxMini = ({ name, onClick, selected, id }) => {
    return (
      <Draggable bounds="parent">
        <div className={`profile-box ${"mini" + id}`}>
          <img src="/user.jpg" alt="Large Profile" className={`profile-img `} />
          <p className="profile-name">{name}</p>
        </div>
      </Draggable>
    );
  };
  

  