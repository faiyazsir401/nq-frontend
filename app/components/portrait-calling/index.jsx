import React, { useState, useEffect, useRef, forwardRef } from "react";
import {
  FaMicrophoneSlash,
  FaVideo,
  FaPhone,
  FaGlobe,
  FaCopy,
  FaLock,
  FaUnlock,
} from "react-icons/fa";
import "./index.css";
import { Tooltip } from "react-tippy";
import {
  Aperture,
  ExternalLink,
  FilePlus,
  Maximize,
  MicOff,
  Minimize,
  PauseCircle,
  PenTool,
  Phone,
  PlayCircle,
} from "react-feather";
import { AccountType } from "../../common/constants";
import "./action-buttons.css";
import Draggable from "react-draggable";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { CanvasMenuBar } from "../video/canvas.menubar";
import { EVENTS } from "../../../helpers/events";

const ActionButtons = ({ isShowVideos, setIsShowVideos }) => {
  const isFeedStopped = true;
  const videoController = true;
  return (
    <div className="action-buttons">
      <Tooltip>
        <div className="button mic-toggle">
          <MicOff size={16} />
        </div>
      </Tooltip>
      <Tooltip>
        <div className="button feed-toggle">
          {!isFeedStopped ? (
            <PauseCircle size={16} />
          ) : (
            <PlayCircle size={16} />
          )}
        </div>
      </Tooltip>

      <Tooltip>
        <div className="button end-call">
          <Phone size={16} />
        </div>
      </Tooltip>

      <Tooltip>
        <div className="button external-link">
          <ExternalLink
            size={16}
            onClick={() => setIsShowVideos(!isShowVideos)}
          />
        </div>
      </Tooltip>

      <Tooltip>
        <div className="button video-lock">
          {videoController ? <FaLock size={16} /> : <FaUnlock size={16} />}
        </div>
      </Tooltip>

      <Tooltip>
        <div className="button aperture">
          <Aperture size={16} />
        </div>
      </Tooltip>

      <Tooltip>
        <div className="button file-add">
          <FilePlus size={16} />
        </div>
      </Tooltip>
    </div>
  );
};

const TimeRemaining = ({ timeRemaining }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="time-container">
      <h3 className="label">Time remaining:</h3>
      <h3 className="value">{formatTime(timeRemaining)}</h3>
    </div>
  );
};

const UserBox = ({ name, onClick, selected, id, notSelected }) => {
  return (
    <div
      className={`profile-box ${
        notSelected && (selected ? "selected" : "hidden")
      }`}
      onClick={() => onClick(id)}
    >
      <img src="/user.jpg" alt="Large Profile" className={`profile-img `} />
      <p className="profile-name">{name}</p>
    </div>
  );
};

const UserBoxMini = ({ name, onClick, selected, id }) => {
  return (
    <Draggable bounds="parent">
      <div className={`profile-box ${"mini" + id}`}>
        <img src="/user.jpg" alt="Large Profile" className={`profile-img `} />
        <p className="profile-name">{name}</p>
      </div>
    </Draggable>
  );
};

const OneOnOneCall = ({ timeRemaining, selectedUser, setSelectedUser }) => {
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

const SHAPES = {
  FREE_HAND: "hand",
  LINE: "line",
  CIRCLE: "circle",
  SQUARE: "square",
  OVAL: "oval",
  RECTANGLE: "rectangle",
  TRIANGLE: "triangle",
  ARROW_RIGHT: "arrow_right",
  TWO_SIDE_ARROW: "two_side_arrow",
};

let isDrawing = false;
let savedPos;
let startPos;
let currPos;
let strikes = [];
let extraStream;
let localVideoRef;
let Peer;
let canvasConfigs = {
  sender: {
    strokeStyle: "red",
    lineWidth: 3,
    lineCap: "round",
  },
  receiver: {
    strokeStyle: "green",
    lineWidth: 3,
    lineCap: "round",
  },
};
let selectedShape = null;
let storedLocalDrawPaths = { sender: [], receiver: [] };

const VideoContainer = ({ drawingMode, isMaximized, canvasRef }) => {
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  console.log("canvas12", canvasRef);
  const state = {
    mousedown: false,
  };

  useEffect(() => {
    const video = videoRef.current;
    const videoContainer = videoContainerRef.current;
    const canvas = canvasRef?.current;
    if (canvas && videoContainer) {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
    }
    console.log("canvas", canvas); // This should now log the canvas element correctly.
    const context = canvas?.getContext("2d");
    if (!context) return;

    const drawFrame = () => {
      if (canvas && context && video) {
        context.fillStyle = "rgba(255, 255, 255, 0.5)";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(drawFrame);
    };

    const startDrawing = (event) => {
      console.log(
        "clientWidth",
        document.getElementById("video-container")?.clientWidth
      );
      console.log(
        "clientHeight",
        document.getElementById("video-container")?.clientHeight
      );
      event.preventDefault();
      isDrawing = true;
      if (!context) return;
      savedPos = context?.getImageData(
        0,
        0,
        document.getElementById("video-container")?.clientWidth,
        document.getElementById("video-container")?.clientHeight
      );
      if (strikes.length >= 10) strikes.shift(); // removing first position if strikes > 10;
      strikes.push(savedPos);
      const mousePos = event.type.includes("touchstart")
        ? getTouchPos(event)
        : getMousePositionOnCanvas(event);
      context.strokeStyle = canvasConfigs.sender.strokeStyle;
      context.lineWidth = canvasConfigs.sender.lineWidth;
      context.lineCap = "round";
      context.beginPath();
      context.moveTo(mousePos.x, mousePos.y);
      context.fill();
      state.mousedown = true;
      startPos = { x: mousePos.x, y: mousePos.y };
    };

    const draw = (event) => {
      event.preventDefault();
      if (!isDrawing || !context || !state.mousedown) return;
      const mousePos = event.type.includes("touchmove")
        ? getTouchPos(event)
        : getMousePositionOnCanvas(event);
      currPos = { x: mousePos?.x, y: mousePos.y };

      if (selectedShape !== SHAPES.FREE_HAND) {
        context.putImageData(savedPos, 0, 0);
        context.beginPath();
        drawShapes();
        context.stroke();
      } else {
        context.lineTo(mousePos.x, mousePos.y);
        context.stroke();
      }
    };

    const stopDrawing = (event) => {
      event.preventDefault();
      if (state.mousedown) {
        isDrawing = false;
        state.mousedown = false;
      }
    };

    if (canvas) {
      canvas.addEventListener("touchstart", startDrawing, { passive: false });
      canvas.addEventListener("touchmove", draw, { passive: false });
      canvas.addEventListener("touchend", stopDrawing, { passive: false });

      canvas.addEventListener("mousedown", startDrawing);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseup", stopDrawing);
    }

    return () => {
      video?.removeEventListener("play", drawFrame);
    };
  }, [canvasRef]);

  const getMousePositionOnCanvas = (event) => {
    const canvas = canvasRef?.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // Scale factor for width
    const scaleY = canvas.height / rect.height; // Scale factor for height

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    return { x, y };
  };

  const getTouchPos = (touchEvent) => {
    const canvas = canvasRef?.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (touchEvent.changedTouches[0].clientX - rect.left) * scaleX;
    const y = (touchEvent.changedTouches[0].clientY - rect.top) * scaleY;

    return { x, y };
  };
  return (
    <>
      <div
        id="video-container"
        ref={videoContainerRef}
        className={`relative border rounded-lg overflow-hidden ${
          isMaximized ? "" : "mb-3"
        }`}
        style={{
          height: isMaximized ? "50vh" : "40vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "gray",
          position: "relative",
        }}
      >
        <TransformWrapper disabled={drawingMode}>
          <TransformComponent>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <video
                ref={videoRef}
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                controls
                className="w-full h-full object-cover"
                playsInline
              />
            </div>
          </TransformComponent>
        </TransformWrapper>

        <canvas
          ref={canvasRef}
          id="drawing-canvas"
          className="canvas"
          style={{ display: drawingMode ? "block" : "none" }}
        />
      </div>
    </>
  );
};

const ClipModeCall = ({
  timeRemaining,
  isMaximized,
  setIsMaximized,
  clips,
}) => {
  const [drawingMode, setDrawingMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef(null);
  const canvasRef2 = useRef(null)
  const [sketchPickerColor, setSketchPickerColor] = useState({
    r: 241,
    g: 112,
    b: 19,
    a: 1,
  });
  const [selectedClips, setSelectedClips] = useState([]);
  const [isCanvasMenuNoteShow, setIsCanvasMenuNoteShow] = useState(false);
  const [micNote, setMicNote] = useState(false);
  const [clipSelectNote, setClipSelectNote] = useState(false);
  const [countClipNoteOpen, setCountClipNoteOpen] = useState(false);

  const clearCanvas = () => {
    const canvas = canvasRef?.current;
    const context = canvas?.getContext("2d");
    if (!context || !canvas) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const sendDrawEvent = () => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const { width, height } = canvas;

    canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!(event && event.target)) return;
        const binaryData = event.target.result;
        // console.log(`emit draw event---`);
        socket.emit(EVENTS.DRAW, {
          userInfo: { from_user: fromUser._id, to_user: toUser._id },
          // storedEvents,
          // canvasConfigs,
          strikes: binaryData,
          canvasSize: { width, height },
        });
      };
      reader.readAsArrayBuffer(blob);
    });
  };

  const undoDrawing = async (
    senderConfig,
    extraCoordinateConfig,
    removeLastCoordinate = true
  ) => {
    const canvas = canvasRef?.current;
    const context = canvas?.getContext("2d");
    if (!context || !canvas) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (removeLastCoordinate) storedLocalDrawPaths.sender.splice(-1, 1);
    // draw all the paths in the paths array
    await senderConfig.coordinates.forEach((path) => {
      context.beginPath();
      context.strokeStyle = senderConfig.theme.strokeStyle;
      context.lineWidth = senderConfig.theme.lineWidth;
      context.lineCap = "round";
      if (path && Array.isArray(path)) {
        // context.
        context.moveTo(path[0][0], path[0][1]);
        for (let i = 0; i < path.length; i++) {
          context.lineTo(path[i][0], path[i][1]);
        }
        context.stroke();
      }
    });

    await extraCoordinateConfig.coordinates.forEach((path) => {
      context.beginPath();
      context.strokeStyle = extraCoordinateConfig.theme.strokeStyle;
      context.lineWidth = extraCoordinateConfig.theme.lineWidth;
      context.lineCap = "round";

      // context.beginPath();
      if (path && Array.isArray(path)) {
        // context.
        context.moveTo(path[0][0], path[0][1]);
        for (let i = 0; i < path.length; i++) {
          context.lineTo(path[i][0], path[i][1]);
        }
        context.stroke();
      }
    });

    if (strikes.length <= 0) return;
    context.putImageData(strikes[strikes.length - 1], 0, 0);
    strikes.pop();

    // sending event to end user
    if (removeLastCoordinate) {
      // socket.emit(EVENTS.EMIT_UNDO, {
      //     sender: storedLocalDrawPaths.sender,
      //     receiver: extraCoordinateConfig.coordinates,
      //     userInfo: { from_user: fromUser._id, to_user: toUser._id },
      // });
      // sendEmitUndoEvent();
    }
  };

  function resetInitialPinnedUser() {}
  return (
    <>
      {isMaximized ? (
        <div className="">
          <div
            className="d-flex  justify-content-start top-0 absolute align-items-center pr-4 pl-4 mt-2 w-100"
            style={{
              zIndex: 99,
            }}
          >
            <div className="d-flex">
              <div
                className="button"
                onClick={() => setIsMaximized(!isMaximized)}
              >
                {isMaximized ? <Minimize size={18} /> : <Maximize size={18} />}
              </div>
              <div
                style={{
                  position: "relative",
                }}
              >
                <div
                  className="button ml-3"
                  onClick={() => setDrawingMode(!drawingMode)}
                >
                  <PenTool size={18} color={drawingMode ? "blue" : "black"} />
                </div>
                {drawingMode && (
                  <div
                    style={{
                      position: "absolute",
                      zIndex: 99,
                      top: 24,
                    }}
                  >
                    <CanvasMenuBar
                      isOpen={isOpen}
                      setIsOpen={setIsOpen}
                      setSketchPickerColor={(rgb) => {
                        setSketchPickerColor(rgb);
                      }}
                      undoDrawing={() => {
                        undoDrawing(
                          {
                            coordinates: storedLocalDrawPaths.sender,
                            theme: canvasConfigs.sender,
                          },
                          {
                            coordinates: storedLocalDrawPaths.receiver,
                            theme: {
                              lineWidth: canvasConfigs.receiver.lineWidth,
                              strokeStyle: canvasConfigs.receiver.strokeStyle,
                            },
                          }
                        );
                      }}
                      sketchPickerColor={sketchPickerColor}
                      canvasConfigs={canvasConfigs}
                      setCanvasConfigs={(config) => {
                        canvasConfigs = config;
                      }}
                      drawShapes={(shapeType) => {
                        selectedShape = shapeType;
                      }}
                      refreshDrawing={() => {
                        // deleting the canvas drawing
                        storedLocalDrawPaths.sender = [];
                        storedLocalDrawPaths.receiver = [];
                        clearCanvas();
                        // sendClearCanvasEvent();
                      }}
                      selectedClips={selectedClips}
                      setSelectedClips={setSelectedClips}
                      toUser={{
                        fullname: "",
                      }}
                      isCanvasMenuNoteShow={isCanvasMenuNoteShow}
                      setIsCanvasMenuNoteShow={setIsCanvasMenuNoteShow}
                      setMicNote={setMicNote}
                      setClipSelectNote={setClipSelectNote}
                      clipSelectNote={clipSelectNote}
                      setCountClipNoteOpen={setCountClipNoteOpen}
                      resetInitialPinnedUser={resetInitialPinnedUser}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
  
              <VideoContainer
                drawingMode={drawingMode}
                isMaximized
                canvasRef={canvasRef}
              />
               <VideoContainer
                drawingMode={drawingMode}
                isMaximized
                canvasRef={canvasRef2}
              />
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center pr-4 pl-4 mt-2 w-100">
            <div className="d-flex">
              <div
                className="button"
                onClick={() => setIsMaximized(!isMaximized)}
              >
                {isMaximized ? <Minimize size={18} /> : <Maximize size={18} />}
              </div>
              <div
                style={{
                  position: "relative",
                }}
              >
                <div
                  className="button ml-3"
                  onClick={() => setDrawingMode(!drawingMode)}
                >
                  <PenTool size={18} color={drawingMode ? "blue" : "black"} />
                </div>
                {drawingMode && (
                  <div
                    style={{
                      position: "absolute",
                      zIndex: 99,
                      top: 24,
                    }}
                  >
                    <CanvasMenuBar
                      isOpen={isOpen}
                      setIsOpen={setIsOpen}
                      setSketchPickerColor={(rgb) => {
                        setSketchPickerColor(rgb);
                      }}
                      undoDrawing={() => {
                        undoDrawing(
                          {
                            coordinates: storedLocalDrawPaths.sender,
                            theme: canvasConfigs.sender,
                          },
                          {
                            coordinates: storedLocalDrawPaths.receiver,
                            theme: {
                              lineWidth: canvasConfigs.receiver.lineWidth,
                              strokeStyle: canvasConfigs.receiver.strokeStyle,
                            },
                          }
                        );
                      }}
                      sketchPickerColor={sketchPickerColor}
                      canvasConfigs={canvasConfigs}
                      setCanvasConfigs={(config) => {
                        canvasConfigs = config;
                      }}
                      drawShapes={(shapeType) => {
                        selectedShape = shapeType;
                      }}
                      refreshDrawing={() => {
                        // deleting the canvas drawing
                        storedLocalDrawPaths.sender = [];
                        storedLocalDrawPaths.receiver = [];
                        clearCanvas();
                        // sendClearCanvasEvent();
                      }}
                      selectedClips={selectedClips}
                      setSelectedClips={setSelectedClips}
                      toUser={{
                        fullname: "",
                      }}
                      isCanvasMenuNoteShow={isCanvasMenuNoteShow}
                      setIsCanvasMenuNoteShow={setIsCanvasMenuNoteShow}
                      setMicNote={setMicNote}
                      setClipSelectNote={setClipSelectNote}
                      clipSelectNote={clipSelectNote}
                      setCountClipNoteOpen={setCountClipNoteOpen}
                      resetInitialPinnedUser={resetInitialPinnedUser}
                    />
                  </div>
                )}
              </div>
            </div>

            <TimeRemaining timeRemaining={timeRemaining} />
          </div>
          <UserBoxMini
            id={"1"}
            name={"Trainer"}
            // onClick={handleUserClick}
            selected={false}
          />
          <UserBoxMini
            id={"2"}
            name={"Trainee"}
            // onClick={handleUserClick}
            selected={false}
          />
          
            <VideoContainer drawingMode={drawingMode} canvasRef={canvasRef} />
            <VideoContainer drawingMode={drawingMode} canvasRef={canvasRef2} />
        </>
      )}
    </>
  );
};

const VideoCallUI = () => {
  const [timeRemaining, setTimeRemaining] = useState(51 * 60 + 3); // 51:03 in seconds
  const [selectedUser, setSelectedUser] = useState(null);
  const [isShowVideos, setIsShowVideos] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [clips, setClips] = useState([0, 1]);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  console.log("selectedUser", selectedUser);

  return (
    <div
      className="video-call-container"
      style={{
        alignItems: isMaximized ? "normal" : "center",
      }}
    >
      {isShowVideos ? (
        <OneOnOneCall
          timeRemaining={timeRemaining}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
      ) : (
        <ClipModeCall
          timeRemaining={timeRemaining}
          isMaximized={isMaximized}
          setIsMaximized={setIsMaximized}
          clips={clips}
        />
      )}
      {!isMaximized && (
        <ActionButtons
          isShowVideos={isShowVideos}
          setIsShowVideos={setIsShowVideos}
        />
      )}
    </div>
  );
};

export default VideoCallUI;
