import { useContext, useEffect, useRef, useState } from "react";
import { EVENTS } from "../../../helpers/events";
import { AccountType } from "../../common/constants";
import { useAppSelector } from "../../store";
import { authState } from "../auth/auth.slice";
import TimeRemaining from "./time-remaining";
import { UserBox, UserBoxMini } from "./user-box";
import { SocketContext } from "../socket";

const OneOnOneCall = ({
  timeRemaining,
  bothUsersJoined = false,
  selectedUser,
  setSelectedUser,
  localVideoRef,
  remoteVideoRef,
  toUser,
  fromUser,
  remoteStream,
  localStream,
  isLocalStreamOff,
  setIsLocalStreamOff,
  isRemoteStreamOff,
  isLandscape,
  setShowScreenshotButton
}) => {
  const socket = useContext(SocketContext);
  const { accountType } = useAppSelector(authState);
  const annotationCanvasRef = useRef(null);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(()=>{
    setShowScreenshotButton(false)
  },[])

  // Resize annotation canvas to match video section
  useEffect(() => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { offsetWidth, offsetHeight } = parent;
      if (offsetWidth && offsetHeight) {
        canvas.width = offsetWidth;
        canvas.height = offsetHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const getCanvasPos = (e) => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handlePointerDown = (e) => {
    if (accountType !== AccountType.TRAINER || !isAnnotating) return;
    e.preventDefault();
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasPos(e);
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    lastPosRef.current = { x, y };
    setIsDrawing(true);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || accountType !== AccountType.TRAINER || !isAnnotating) return;
    e.preventDefault();
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPosRef.current = { x, y };
  };

  const handlePointerUp = (e) => {
    if (!isDrawing) return;
    e && e.preventDefault();
    setIsDrawing(false);
  };

  const clearAnnotations = () => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

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
      {timeRemaining && <TimeRemaining timeRemaining={timeRemaining} bothUsersJoined={bothUsersJoined} />}
      </div>

      <div className="video-section" style={{ position: "relative" }}>
        <UserBox
          id={toUser._id}
          onClick={handleUserClick}
          selected={selectedUser === toUser._id}
          selectedUser={selectedUser}
          notSelected={selectedUser}
          videoRef={localVideoRef}
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
            videoRef={selectedUser === toUser._id ? remoteVideoRef : localVideoRef}
            stream={selectedUser === toUser._id ? remoteStream : localStream}
            user={selectedUser === toUser._id ? toUser : fromUser}
            isStreamOff={
              selectedUser === toUser._id ? isRemoteStreamOff : isLocalStreamOff
            }
            muted={selectedUser === toUser._id ? false : true}
          />
        )}

        {/* Annotation canvas overlay for trainer */}
        <canvas
          ref={annotationCanvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents:
              accountType === AccountType.TRAINER && isAnnotating ? "auto" : "none",
            zIndex: 15,
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />

        {accountType === AccountType.TRAINER && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 20,
              display: "flex",
              gap: "8px",
            }}
            className="hide-in-screenshot"
          >
            <button
              type="button"
              onClick={() => setIsAnnotating((prev) => !prev)}
              style={{
                padding: "6px 10px",
                fontSize: "12px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: isAnnotating ? "#1976d2" : "#ffffff",
                color: isAnnotating ? "#ffffff" : "#333333",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                cursor: "pointer",
              }}
            >
              {isAnnotating ? "Stop Annotate" : "Annotate"}
            </button>
            {isAnnotating && (
              <button
                type="button"
                onClick={clearAnnotations}
                style={{
                  padding: "6px 10px",
                  fontSize: "12px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#ffffff",
                  color: "#333333",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default OneOnOneCall;
