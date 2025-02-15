import { useCallback, useState } from "react";
import { ChevronDown, Maximize, Minimize, PenTool } from "react-feather";
import { CanvasMenuBar } from "../video/canvas.menubar";
// import VideoContainer from "./video-container";
import { UserBoxMini } from "./user-box";
import TimeRemaining from "./time-remaining";
import { useRef } from "react";
import CustomVideoControls from "./custom-video-controls";
import { AccountType } from "../../common/constants";
import { useAppSelector } from "../../store";
import { authState } from "../auth/auth.slice";
import { SocketContext } from "../socket";
import { useContext } from "react";
import { EVENTS } from "../../../helpers/events";
import { useEffect } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { Utils } from "../../../utils/utils";
import _debounce from "lodash/debounce";
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

const VideoContainer = ({
  drawingMode,
  isMaximized,
  canvasRef,
  clip,
  isLock,
  index,
  videoRef,
  isPlaying,
  setIsPlaying,
  isSingle,
  fromUser,
  toUser,
  stopDrawing,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const { accountType } = useAppSelector(authState);
  const socket = useContext(SocketContext);
  const videoContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // const [cu,setCurrentTime]
  // Play/pause video
  const togglePlayPause = () => {
    const video = videoRef?.current;
    console.log("video hai", video);
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
        socket?.emit(EVENTS?.ON_VIDEO_PLAY_PAUSE, {
          videoId: clip?._id,
          userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
          isPlaying: true,
        });
      } else {
        video.pause();
        setIsPlaying(false);
        socket?.emit(EVENTS?.ON_VIDEO_PLAY_PAUSE, {
          videoId: clip?._id,
          userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
          isPlaying: false,
        });
      }
    } else {
      console.log("video not loaded yet");
    }
  };

  useEffect(() => {
    const video = videoRef?.current;

    socket?.on(EVENTS?.ON_VIDEO_PLAY_PAUSE, (data) => {
      if (data?.videoId === clip?._id && data?.isPlaying) {
        // Only play if the video matches and the action is play
        if (video?.paused) {
          video.play();
          setIsPlaying(true);
        }
      }
    });

    socket?.on(EVENTS?.ON_VIDEO_PLAY_PAUSE, (data) => {
      if (data?.videoId === clip?._id && !data?.isPlaying) {
        if (video?.play) {
          video.pause();
          setIsPlaying(false);
        }
      }
    });

    socket?.on(EVENTS?.ON_VIDEO_TIME, (data) => {
      if (data?.videoId === clip?._id) {
        video.currentTime = data.progress;
      }
    });

    socket?.on(EVENTS?.ON_VIDEO_ZOOM_PAN, (data) => {
      if (data?.videoId === clip?._id) {
        console.log("Received zoom:", data.zoom, "Received pan:", data.pan);
  
        // Apply the zoom and pan changes to the state
        setZoomLevel(data.zoom);
        setPanPosition(data.pan);
      }
    });

    // Clean up on unmount
    return () => {
      socket?.off(EVENTS?.ON_VIDEO_PLAY_PAUSE);
      socket?.off(EVENTS?.ON_VIDEO_TIME);
      socket?.off(EVENTS?.ON_VIDEO_ZOOM_PAN);
    };
  }, [socket, clip?._id, videoRef]);

  // // Handle volume change
  // const changeVolume = (e) => {
  //   const volume = parseFloat(e.target.value);
  //   const video = videoRef.current;
  //   if (video) {
  //     video.volume = volume;
  //     setVolume(volume);
  //   }
  // };

  // // Mute/unmute video
  // const toggleMute = () => {
  //   const video = videoRef.current;
  //   video.muted = !video.muted;
  //   setIsMuted(!isMuted);
  // };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    const videoContainer = videoContainerRef.current;
    if (videoContainer) {
      if (!document.fullscreenElement) {
        videoContainer.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle seeking
  const handleSeek = (e) => {
    const video = videoRef?.current;
    if (video) {
      const progress = e.target.value;

      video.currentTime = progress;
      socket?.emit(EVENTS?.ON_VIDEO_TIME, {
        userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
        videoId: clip._id,
        progress,
      });
    }
  };

  // Handle mouse down to indicate seeking
  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  // Handle mouse up to stop seeking
  const handleSeekMouseUp = () => {
    setSeeking(false);
  };

  // console.log("canvas12", canvasRef);
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
          height: isSingle
            ? isMaximized
              ? "100dvh"
              : "85dvh" // If isSingle is true
            : isMaximized
            ? isLock
              ? "47dvh"
              : "50dvh" // If isMaximized is true and isSingle is false
            : isLock
            ? "38dvh"
            : "40dvh", // If isMaximized is false and isSingle is false
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "gray",
          position: "relative",
        }}
      >
        <TransformWrapper
          disabled={drawingMode}
          initialScale={zoomLevel} // Set initial zoom level
          initialPositionX={panPosition.x} // Set initial pan X position
          initialPositionY={panPosition.y} // Set initial pan Y position
          scale={zoomLevel} // Dynamically set zoom level based on state
          positionX={panPosition.x} // Dynamically set pan X position
          positionY={panPosition.y} // Dynamically set pan Y position
          onZoomStop={(e) => {
            console.log("Zoom level:", e.state.scale);
            setZoomLevel(e.state.scale);
            socket?.emit(EVENTS?.ON_VIDEO_ZOOM_PAN, {
              userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
              videoId: clip._id,
              zoom: e.state.scale,
              pan: panPosition,
            });
          }}
          onPanningStop={(e) => {
            console.log("Pan position:", e.state.positionX, e.state.positionY);
            setPanPosition({ x: e.state.positionX, y: e.state.positionY });
            socket?.emit(EVENTS?.ON_VIDEO_ZOOM_PAN, {
              userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
              videoId: clip._id,
              zoom: zoomLevel,
              pan: { x: e.state.positionX, y: e.state.positionY },
            });
          }}
        >
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
                controls={false} // Hide built-in controls
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                webkit-playsinline="true"
                style={{
                  touchAction: "manipulation",
                }}
                id={clip?.id}
                muted={true}
                poster={Utils?.generateThumbnailURL(clip)}
                preload="metadata"
                crossOrigin="anonymous"
              >
                <source src={Utils?.generateVideoURL(clip)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </TransformComponent>
        </TransformWrapper>

        <canvas
          ref={canvasRef}
          id="drawing-canvas"
          className="canvas"
          style={{ display: drawingMode ? "block" : "none" }}
        />

        {accountType === AccountType.TRAINER && !isLock && (
          <CustomVideoControls
            handleSeek={handleSeek}
            isFullscreen={isFullscreen}
            isPlaying={isPlaying}
            toggleFullscreen={toggleFullscreen}
            togglePlayPause={togglePlayPause}
            videoRef={videoRef}
            setIsPlaying={setIsPlaying}
          />
        )}
      </div>
    </>
  );
};

const ClipModeCall = ({
  timeRemaining,
  isMaximized,
  setIsMaximized,
  selectedClips,
  setSelectedClips,
  isLock,
  localVideoRef,
  remoteVideoRef,
  toUser,
  fromUser,
  localStream,
  remoteStream,
  isRemoteStreamOff,
  isLocalStreamOff,
}) => {
  const socket = useContext(SocketContext);
  const state = {
    mousedown: false,
  };
  const [drawingMode, setDrawingMode] = useState(false);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const { accountType } = useAppSelector(authState);
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef(null);
  const canvasRef2 = useRef(null);
  const videoRef = useRef(null);
  const videoRef2 = useRef(null);
  const [sketchPickerColor, setSketchPickerColor] = useState({
    r: 241,
    g: 112,
    b: 19,
    a: 1,
  });

  const [isCanvasMenuNoteShow, setIsCanvasMenuNoteShow] = useState(false);
  const [micNote, setMicNote] = useState(false);
  const [clipSelectNote, setClipSelectNote] = useState(false);
  const [countClipNoteOpen, setCountClipNoteOpen] = useState(false);

  const [isPlayingBoth, setIsPlayingBoth] = useState(false); // Track video playback state
  const [isPlaying1, setIsPlaying1] = useState(false); // Track video playback state
  const [isPlaying2, setIsPlaying2] = useState(false); // Track video playback state

  const [isFullscreen, setIsFullscreen] = useState(false); // Track fullscreen state

  // Play/pause video
  const togglePlayPause = () => {
    const video1 = videoRef.current;
    const video2 = videoRef2.current;
    if (video1 && video2) {
      if (video1.paused) {
        video1.play();
        video2.play();
        setIsPlayingBoth(true);
      } else {
        video1.pause();
        video2.pause();
        setIsPlayingBoth(false);
      }
    }
  };

  // Handle seeking for both videos when locked
  const handleSeek = (e) => {
    const progress = e.target.value;
    console.log("progress", progress);
    const video1 = videoRef.current;
    const video2 = videoRef2.current;
    if (video1 && video2) {
      video1.currentTime = progress;
      video2.currentTime = progress;
    }
  };

  const clearCanvas = () => {
    const canvas1 = canvasRef?.current;
    const canvas2 = canvasRef2?.current;

    const context1 = canvas1?.getContext("2d");
    const context2 = canvas2?.getContext("2d");

    if (context1 && canvas1) {
      context1.clearRect(0, 0, canvas1.width, canvas1.height);
    }

    if (context2 && canvas2) {
      context2.clearRect(0, 0, canvas2.width, canvas2.height);
    }
  };

  const sendStopDrawingEvent = () => {
    if (remoteVideoRef && remoteVideoRef.current) {
      socket.emit(EVENTS.STOP_DRAWING, {
        userInfo: { from_user: fromUser._id, to_user: toUser._id },
      });
    }
  };

  const stopDrawing = (event) => {
    event.preventDefault();
    if (state.mousedown) {
      // console.log(`--- stop drawing ---- `);
      sendStopDrawingEvent();
      isDrawing = false;
      state.mousedown = false;
      sendDrawEvent();
    }
  };

  const sendDrawEvent = () => {
    try {
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
    } catch (error) {
      console.log("error", error);
    }
  };

  socket.on(EVENTS.EMIT_DRAWING_CORDS, ({ strikes, canvasSize }) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context || !canvas) return;
    const blob = new Blob([strikes]);
    const image = new Image();
    image.src = URL.createObjectURL(blob);
    image.onload = () => {
      const { width, height } = canvasSize;
      const scaleX = canvas.width / width;
      const scaleY = canvas.height / height;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, width * scaleX, height * scaleY);
    };
  });

  const sendEmitUndoEvent = useCallback(_debounce(sendDrawEvent, 500), []);

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
      redrawPaths(
        context1,
        extraCoordinateConfig.coordinates,
        extraCoordinateConfig.theme
      );
    }

    if (context2) {
      redrawPaths(context2, senderConfig.coordinates, senderConfig.theme);
      redrawPaths(
        context2,
        extraCoordinateConfig.coordinates,
        extraCoordinateConfig.theme
      );
    }

    // **Restore previous stroke only if available**
    if (strikes.length > 0) {
      const lastStrike = strikes.pop();
      if (context1) context1.putImageData(lastStrike, 0, 0);
      if (context2) context2.putImageData(lastStrike, 0, 0);
    }

    // **Emit undo event (if required)**
    if (removeLastCoordinate) {
      sendEmitUndoEvent();
    }
  };

  function resetInitialPinnedUser() {}
  const isSingle = selectedClips?.length === 1;
  return (
    <>
      {isMaximized ? (
        <div className="">
          {accountType === AccountType.TRAINER && (
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
                  {isMaximized ? (
                    <Minimize size={18} />
                  ) : (
                    <Maximize size={18} />
                  )}
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
          )}
          <div>
            {selectedClips.length > 1 ? (
              <>
                <VideoContainer
                  drawingMode={drawingMode}
                  isMaximized
                  isLock={isLock}
                  index={1}
                  canvasRef={canvasRef}
                  videoRef={videoRef}
                  clip={selectedClips[0]}
                  isPlaying={isLock ? isPlayingBoth : isPlaying1}
                  setIsPlaying={isLock ? setIsPlayingBoth : setIsPlaying1}
                  fromUser={fromUser}
                  toUser={toUser}
                  isDrawing={isDrawing}
                  stopDrawing={stopDrawing}
                  savedPos={savedPos}
                  startPos={startPos}
                  currPos={currPos}
                  strikes={strikes}
                  extraStream={extraStream}
                  localVideoRef={localVideoRef}
                  Peer={Peer}
                  canvasConfigs={canvasConfigs}
                  selectedShape={selectedShape}
                  storedLocalDrawPaths={storedLocalDrawPaths}
                />
                <VideoContainer
                  drawingMode={drawingMode}
                  isMaximized
                  isLock={isLock}
                  index={2}
                  canvasRef={canvasRef2}
                  videoRef={videoRef2}
                  clip={selectedClips[1]}
                  isPlaying={isLock ? isPlayingBoth : isPlaying2}
                  setIsPlaying={isLock ? setIsPlayingBoth : setIsPlaying2}
                  fromUser={fromUser}
                  toUser={toUser}
                  isDrawing={isDrawing}
                  stopDrawing={stopDrawing}
                  savedPos={savedPos}
                  startPos={startPos}
                  currPos={currPos}
                  strikes={strikes}
                  extraStream={extraStream}
                  localVideoRef={localVideoRef}
                  Peer={Peer}
                  canvasConfigs={canvasConfigs}
                  selectedShape={selectedShape}
                  storedLocalDrawPaths={storedLocalDrawPaths}
                />

                {isLock && (
                  <CustomVideoControls
                    handleSeek={handleSeek}
                    isPlaying={isPlayingBoth}
                    // toggleFullscreen={toggleFullscreen}
                    // toggleMute={toggleMute}
                    togglePlayPause={togglePlayPause}
                    videoRef={videoRef}
                    setIsPlaying={setIsPlayingBoth}
                    isFixed={isLock}
                  />
                )}
              </>
            ) : (
              <VideoContainer
                drawingMode={drawingMode}
                isMaximized
                index={1}
                canvasRef={canvasRef}
                videoRef={videoRef}
                clip={selectedClips[0]}
                isPlaying={isPlaying1}
                setIsPlaying={setIsPlaying1}
                isSingle={isSingle}
                fromUser={fromUser}
                toUser={toUser}
                isDrawing={isDrawing}
                stopDrawing={stopDrawing}
                savedPos={savedPos}
                startPos={startPos}
                currPos={currPos}
                strikes={strikes}
                extraStream={extraStream}
                localVideoRef={localVideoRef}
                Peer={Peer}
                canvasConfigs={canvasConfigs}
                selectedShape={selectedShape}
                storedLocalDrawPaths={storedLocalDrawPaths}
              />
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center pr-4 pl-4 mt-2 w-100">
            {accountType === AccountType.TRAINER && (
              <div className="d-flex">
                <div
                  className="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                >
                  {isMaximized ? (
                    <Minimize size={18} />
                  ) : (
                    <Maximize size={18} />
                  )}
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
            )}

            <TimeRemaining timeRemaining={timeRemaining} />
          </div>
          <UserBoxMini
            id={toUser._id}
            videoRef={remoteVideoRef}
            stream={remoteStream}
            user={toUser}
            isStreamOff={isRemoteStreamOff}
          />
          <UserBoxMini
            id={fromUser._id}
            videoRef={localVideoRef}
            stream={localStream}
            user={fromUser}
            isStreamOff={isLocalStreamOff}
          />

          <div>
            {selectedClips.length > 1 ? (
              <>
                <VideoContainer
                  drawingMode={drawingMode}
                  isLock={isLock}
                  index={1}
                  canvasRef={canvasRef}
                  videoRef={videoRef}
                  clip={selectedClips[0]}
                  isPlaying={isLock ? isPlayingBoth : isPlaying1}
                  setIsPlaying={isLock ? setIsPlayingBoth : setIsPlaying1}
                  fromUser={fromUser}
                  toUser={toUser}
                  isDrawing={isDrawing}
                  stopDrawing={stopDrawing}
                  savedPos={savedPos}
                  startPos={startPos}
                  currPos={currPos}
                  strikes={strikes}
                  extraStream={extraStream}
                  localVideoRef={localVideoRef}
                  Peer={Peer}
                  canvasConfigs={canvasConfigs}
                  selectedShape={selectedShape}
                  storedLocalDrawPaths={storedLocalDrawPaths}
                />
                <VideoContainer
                  drawingMode={drawingMode}
                  isLock={isLock}
                  index={2}
                  canvasRef={canvasRef2}
                  videoRef={videoRef2}
                  clip={selectedClips[1]}
                  isPlaying={isLock ? isPlayingBoth : isPlaying2}
                  setIsPlaying={isLock ? setIsPlayingBoth : setIsPlaying2}
                  fromUser={fromUser}
                  toUser={toUser}
                  isDrawing={isDrawing}
                  stopDrawing={stopDrawing}
                  savedPos={savedPos}
                  startPos={startPos}
                  currPos={currPos}
                  strikes={strikes}
                  extraStream={extraStream}
                  localVideoRef={localVideoRef}
                  Peer={Peer}
                  canvasConfigs={canvasConfigs}
                  selectedShape={selectedShape}
                  storedLocalDrawPaths={storedLocalDrawPaths}
                />

                {accountType === AccountType.TRAINER && isLock && (
                  <CustomVideoControls
                    handleSeek={handleSeek}
                    isPlaying={isPlayingBoth}
                    // toggleFullscreen={toggleFullscreen}
                    // toggleMute={toggleMute}
                    togglePlayPause={togglePlayPause}
                    videoRef={videoRef}
                    setIsPlaying={setIsPlayingBoth}
                    isFixed={isLock}
                  />
                )}
              </>
            ) : (
              <VideoContainer
                drawingMode={drawingMode}
                canvasRef={canvasRef}
                videoRef={videoRef}
                clip={selectedClips[0]}
                isPlaying={isPlaying1}
                setIsPlaying={setIsPlaying1}
                isSingle={isSingle}
                fromUser={fromUser}
                toUser={toUser}
                isDrawing={isDrawing}
                stopDrawing={stopDrawing}
                savedPos={savedPos}
                startPos={startPos}
                currPos={currPos}
                strikes={strikes}
                extraStream={extraStream}
                localVideoRef={localVideoRef}
                Peer={Peer}
                canvasConfigs={canvasConfigs}
                selectedShape={selectedShape}
                storedLocalDrawPaths={storedLocalDrawPaths}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ClipModeCall;
