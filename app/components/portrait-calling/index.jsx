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
  ArrowDown,
  ChevronDown,
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

    const findDistance = () => {
      let dis = Math.sqrt(
        Math.pow(currPos.x - startPos.x, 2) +
          Math.pow(currPos.y - startPos.y, 2)
      );
      return dis;
    };

    const drawShapes = () => {
      switch (selectedShape) {
        case SHAPES.LINE: {
          context.moveTo(startPos.x, startPos.y);
          context.lineTo(currPos.x, currPos.y);
          break;
        }
        case SHAPES.CIRCLE: {
          let distance = findDistance(startPos, currPos);
          context.arc(startPos.x, startPos.y, distance, 0, 2 * Math.PI, false);
          break;
        }
        case SHAPES.SQUARE: {
          let w = currPos.x - startPos.x;
          let h = currPos.y - startPos.y;
          context.rect(startPos.x, startPos.y, w, h);
          break;
        }
        case SHAPES.RECTANGLE: {
          let w = currPos.x - startPos.x;
          let h = currPos.y - startPos.y;
          context.rect(startPos.x, startPos.y, w, h);
          break;
        }
        case SHAPES.OVAL: {
          const transform = context.getTransform();
          let w = currPos.x - startPos.x;
          let h = currPos.y - startPos.y;
          context.fillStyle = "#FFFFFF";
          context.fillStyle = "rgba(0, 0, 0, 0)";
          const radiusX = w * transform.a;
          const radiusY = h * transform.d;
          if (radiusX > 0 && radiusY > 0) {
            context.ellipse(
              currPos.x,
              currPos.y,
              radiusX,
              radiusY,
              0,
              0,
              2 * Math.PI
            );
            context.fill();
          }
          break;
        }
        case SHAPES.TRIANGLE: {
          context.moveTo(startPos.x + (currPos.x - startPos.x) / 2, startPos.y);
          context.lineTo(startPos.x, currPos.y);
          context.lineTo(currPos.x, currPos.y);
          context.closePath();
          break;
        }
        case SHAPES.ARROW_RIGHT: {
          const arrowSize = 10;
          const direction = Math.atan2(
            currPos.y - startPos.y,
            currPos.x - startPos.x
          );
          // Calculate the coordinates of the arrowhead
          const arrowheadX = currPos.x + length * Math.cos(direction);
          const arrowheadY = currPos.y + length * Math.sin(direction);
          // Draw the line of the arrow
          context.moveTo(startPos.x, startPos.y);
          context.lineTo(currPos.x, currPos.y);
          // Draw the arrowhead
          context.moveTo(arrowheadX, arrowheadY);
          context.lineTo(
            currPos.x - arrowSize * Math.cos(direction - Math.PI / 6),
            currPos.y - arrowSize * Math.sin(direction - Math.PI / 6)
          );
          context.moveTo(currPos.x, currPos.y);
          context.lineTo(
            currPos.x - arrowSize * Math.cos(direction + Math.PI / 6),
            currPos.y - arrowSize * Math.sin(direction + Math.PI / 6)
          );
          context.stroke();
          break;
        }
        case SHAPES.TWO_SIDE_ARROW: {
          const x1 = startPos.x;
          const y1 = startPos.y;
          const x2 = currPos.x;
          const y2 = currPos.y;
          const size = 10;
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const arrowPoints = [
            {
              x: x2 - size * Math.cos(angle - Math.PI / 6),
              y: y2 - size * Math.sin(angle - Math.PI / 6),
            },
            {
              x: x2 - size * Math.cos(angle + Math.PI / 6),
              y: y2 - size * Math.sin(angle + Math.PI / 6),
            },
            {
              x: x1 + size * Math.cos(angle - Math.PI / 6),
              y: y1 + size * Math.sin(angle - Math.PI / 6),
            },
            {
              x: x1 + size * Math.cos(angle + Math.PI / 6),
              y: y1 + size * Math.sin(angle + Math.PI / 6),
            },
          ];
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.moveTo(arrowPoints[0].x, arrowPoints[0].y);
          context.lineTo(x2, y2);
          context.lineTo(arrowPoints[1].x, arrowPoints[1].y);
          context.moveTo(arrowPoints[2].x, arrowPoints[2].y);
          context.lineTo(x1, y1);
          context.lineTo(arrowPoints[3].x, arrowPoints[3].y);

          context.stroke();
          break;
        }
      }
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
          height: isMaximized ? "50dvh" : "40dvh",
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
                webkit-playsinline="true"
                style={{
                  touchAction:"manipulation"
                }}
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
  const [showDrawingTools, setShowDrawingTools] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef(null);
  const canvasRef2 = useRef(null);
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
    const canvas1 = canvasRef?.current;
    const canvas2 = canvasRef2?.current;

    const context1 = canvas1?.getContext("2d");
    const context2 = canvas2?.getContext("2d");

    if (context1 && canvas1) {
      context1.clearRect(0, 0, canvas1.width, canvas1.height);
    };

    if (context2 && canvas2) {
      context2.clearRect(0, 0, canvas2.width, canvas2.height);
    }
  };

  const sendDrawEvent = () => {
    const canvas = canvasRef?.current;
    const canvas2 = canvasRef2?.current;

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

    if (!canvas2) return;
    const { width2, height2 } = canvas2;

    canvas2.toBlob((blob) => {
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
          canvasSize: { width2, height2 },
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
    const canvas1 = canvasRef?.current || null;
    const canvas2 = canvasRef2?.current || null;
  
    const context1 = canvas1 ? canvas1.getContext("2d") : null;
    const context2 = canvas2 ? canvas2.getContext("2d") : null;
  
    if (!context1 && !context2) return; // Exit if both canvases are missing.
  
    // Function to clear canvas safely
    const clearCanvas = (ctx, canvas) => {
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  
    // Clear only the available canvases
    clearCanvas(context1, canvas1);
    clearCanvas(context2, canvas2);
  
    if (removeLastCoordinate) {
      storedLocalDrawPaths.sender.splice(-1, 1);
    }
  
    // Function to redraw paths for a specific canvas
    const redrawPaths = (ctx, coordinates, theme) => {
      if (!ctx || !coordinates) return;
  
      ctx.strokeStyle = theme.strokeStyle;
      ctx.lineWidth = theme.lineWidth;
      ctx.lineCap = "round";
  
      for (const path of coordinates) {
        if (path && Array.isArray(path)) {
          ctx.beginPath();
          ctx.moveTo(path[0][0], path[0][1]);
          for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i][0], path[i][1]);
          }
          ctx.stroke();
        }
      }
    };
  
    // **Redraw paths separately for each canvas**
    if (context1) {
      redrawPaths(context1, senderConfig.coordinates, senderConfig.theme);
      redrawPaths(context1, extraCoordinateConfig.coordinates, extraCoordinateConfig.theme);
    }
  
    if (context2) {
      redrawPaths(context2, senderConfig.coordinates, senderConfig.theme);
      redrawPaths(context2, extraCoordinateConfig.coordinates, extraCoordinateConfig.theme);
    }
  
    // **Restore previous stroke only if available**
    if (strikes.length > 0) {
      const lastStrike = strikes.pop();
      if (context1) context1.putImageData(lastStrike, 0, 0);
      if (context2) context2.putImageData(lastStrike, 0, 0);
    }
  
    // **Emit undo event (if required)**
    if (removeLastCoordinate) {
      // socket.emit(EVENTS.EMIT_UNDO, { ... });
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
                  onClick={() => {
                    setDrawingMode(!drawingMode);
                    setShowDrawingTools(false);
                  }}
                >
                  <PenTool size={18} color={drawingMode ? "blue" : "black"} />
                </div>
              </div>

              <div
                style={{
                  position: "relative",
                }}
              >
                {drawingMode && (
                  <div
                    className="button ml-1"
                    onClick={() => {
                      setShowDrawingTools(!showDrawingTools);
                    }}
                  >
                    <ChevronDown
                      size={18}
                      color={drawingMode ? "blue" : "black"}
                    />
                  </div>
                )}

                {showDrawingTools && (
                  <div
                    style={{
                      position: "absolute",
                      zIndex: 99,
                      top: 24,
                      left: -10,
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
                  onClick={() => {
                    setDrawingMode(!drawingMode);
                    setShowDrawingTools(false);
                  }}
                >
                  <PenTool size={18} color={drawingMode ? "blue" : "black"} />
                </div>
              </div>

              <div
                style={{
                  position: "relative",
                }}
              >
                {drawingMode && (
                  <div
                    className="button ml-1"
                    onClick={() => {
                      setShowDrawingTools(!showDrawingTools);
                    }}
                  >
                    <ChevronDown
                      size={18}
                      color={drawingMode ? "blue" : "black"}
                    />
                  </div>
                )}

                {showDrawingTools && (
                  <div
                    style={{
                      position: "absolute",
                      zIndex: 99,
                      top: 24,
                      left: -10,
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
