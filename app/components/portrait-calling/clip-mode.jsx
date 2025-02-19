import { useCallback, useState } from "react";
import {
  Aperture,
  ChevronDown,
  Maximize,
  Minimize,
  MinusCircle,
  PenTool,
  PlusCircle,
} from "react-feather";
import { CanvasMenuBar } from "../video/canvas.menubar";
// import VideoContainer from "./video-container";
import { UserBox, UserBoxMini, VideoMiniBox } from "./user-box";
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
import { toast } from "react-toastify";
import { pushProfilePhotoToS3 } from "../common/common.api";
import { screenShotTake } from "../videoupload/videoupload.api";
import html2canvas from "html2canvas";
import { FaUndo } from "react-icons/fa";
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
let savedPos = { canvas1: null, canvas2: null };
let startPos = { canvas1: null, canvas2: null };
let currPos = { canvas1: null, canvas2: null };
let strikes = { canvas1: [], canvas2: [] };

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

let state = {
  mousedown: { canvas1: false, canvas2: false },
};

let storedLocalDrawPaths = {
  canvas1: { sender: [], receiver: [] },
  canvas2: { sender: [], receiver: [] }, // Separate history for each canvas
};

let extraStream;
let localVideoRef;
let Peer;

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
  sendDrawEvent,
  undoDrawing,
}) => {
  const { accountType } = useAppSelector(authState);
  const socket = useContext(SocketContext);
  const videoContainerRef = useRef(null);
  const movingVideoContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [scale, setScale] = useState(1); // Zoom level (scale)
  const [lastTouch, setLastTouch] = useState(0);
  const [translate, setTranslate] = useState({
    x: 0,
    y: 0,
  });
  const [dragStart, setDragStart] = useState(null);

  // Zoom logic
  const onWheel = (e) => {
    if (accountType === AccountType.TRAINEE) return;

    const delta = e.deltaY;
    const zoomFactor = delta < 0 ? 1.1 : 0.9;
    const newScale = Math.max(1, Math.min(5, scale * zoomFactor));

    setScale(newScale);

    socket?.emit(EVENTS?.ON_VIDEO_ZOOM_PAN, {
      videoId: clip._id,
      zoom: newScale,
      pan: translate,
      userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
    });
  };

  const zoomIn = () => {
    if (accountType === AccountType.TRAINEE) return;

    // Increase the scale by 0.5, with a maximum value of 5
    const newScale = Math.min(5, scale + 0.2);
    setScale(newScale);

    socket?.emit(EVENTS?.ON_VIDEO_ZOOM_PAN, {
      videoId: clip._id,
      zoom: newScale,
      pan: translate,
      userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
    });
  };

  const zoomOut = () => {
    if (accountType === AccountType.TRAINEE) return;

    // Decrease the scale by 0.5, with a minimum value of 1
    const newScale = Math.max(1, scale - 0.2);
    console.log("newScale", newScale);
    setScale(newScale);

    socket?.emit(EVENTS?.ON_VIDEO_ZOOM_PAN, {
      videoId: clip._id,
      zoom: newScale,
      pan: translate,
      userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
    });
  };

  const handleTouchMove = (e) => {
    if (accountType === AccountType.TRAINEE) return;

    if (e.touches.length === 2) {
      // Zoom Handling
      const [touch1, touch2] = Array.from(e.touches);
      const currentDistance = Math.hypot(
        touch2.pageX - touch1.pageX,
        touch2.pageY - touch1.pageY
      );

      if (lastTouch) {
        const scaleChange = currentDistance / lastTouch;
        const newScale = Math.max(1, Math.min(5, scale * scaleChange));

        setScale(newScale);
      }
      setLastTouch(currentDistance);
    } else if (e.touches.length === 1 && dragStart) {
      // Panning Handling
      const touch = e.touches[0];
      const deltaX = touch.pageX - dragStart.x;
      const deltaY = touch.pageY - dragStart.y;

      let newX = translate.x + deltaX;
      let newY = translate.y + deltaY;

      setTranslate({ x: newX, y: newY });
      setDragStart({ x: touch.pageX, y: touch.pageY });

      socket?.emit(EVENTS?.ON_VIDEO_ZOOM_PAN, {
        videoId: clip._id,
        zoom: scale,
        pan: { x: newX, y: newY },
        userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
      });
    }
  };

  const handleTouchStart = (e) => {
    if (accountType === AccountType.TRAINEE) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setDragStart({ x: touch.pageX, y: touch.pageY });
    }
  };

  const handleTouchEnd = () => {
    if (accountType === AccountType.TRAINEE) return;
    setLastTouch(0);
    setDragStart(null);
  };

  // Apply CSS transformations directly to the element
  const transformStyle = {
    transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
  };

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
      if (data?.videoId === clip?._id && accountType === AccountType.TRAINEE) {
        video.currentTime = data.progress;
      }
    });
    const handleZoomPanChange = (data) => {
      if (data?.videoId === clip?._id) {
        console.log(
          "Received zoom:",
          data.zoom,
          "Received pan:",
          data.pan,
          "Clip Video ID:",
          clip?._id
        );

        // If the current user is the Trainee, apply the zoom and pan changes
        if (accountType === AccountType.TRAINEE) {
          // Only update if the zoom or pan values are different to avoid unnecessary re-renders
          if (
            data.zoom !== scale ||
            data.pan?.x !== translate.x ||
            data.pan?.y !== translate.y
          ) {
            setScale(data.zoom);
            setTranslate(data.pan);
          }
        }
      }
    };

    // Listen for the ON_VIDEO_ZOOM_PAN event from the socket
    socket?.on(EVENTS?.ON_VIDEO_ZOOM_PAN, handleZoomPanChange);

    // Clean up on unmount
    return () => {
      socket?.off(EVENTS?.ON_VIDEO_PLAY_PAUSE);
      socket?.off(EVENTS?.ON_VIDEO_TIME);
      socket?.off(EVENTS?.ON_VIDEO_ZOOM_PAN);
    };
  }, [socket, clip?._id, videoRef]);

  console.log("sky.zoom", scale);
  console.log("sky.pan", translate);
  console.log("sky.dragStart", dragStart);
  console.log("sky.lastTouch", lastTouch);

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
      setCurrentTime(progress);
      socket?.emit(EVENTS?.ON_VIDEO_TIME, {
        userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
        videoId: clip._id,
        progress,
      });
    }
  };

  return (
    <>
      <div
        id="video-container"
        ref={videoContainerRef}
        className={`relative border rounded-lg overflow-hidden `}
        style={{
          height: isSingle
            ? isMaximized
              ? "96dvh"
              : "85dvh" // If isSingle is true
            : isMaximized
            ? isLock
              ? "47dvh"
              : "46dvh" // If isMaximized is true and isSingle is false
            : isLock
            ? "42dvh"
            : "40dvh", // If isMaximized is false and isSingle is false
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "gray",
          position: "relative",
        }}
      >
        {drawingMode && accountType === AccountType.TRAINER && (
          <div
            className="absolute"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "5px",
              flexDirection: "column",
              right: "10px",
              top: "10px",
              zIndex: 10,
            }}
          >
            <div
              className="button"
              onClick={() =>
                undoDrawing(
                  {
                    coordinates: storedLocalDrawPaths[`canvas${index}`].sender,
                    theme: canvasConfigs.sender,
                  },
                  {
                    coordinates:
                      storedLocalDrawPaths[`canvas${index}`].receiver,
                    theme: {
                      lineWidth: canvasConfigs.receiver.lineWidth,
                      strokeStyle: canvasConfigs.receiver.strokeStyle,
                    },
                  },
                  true,
                  index
                )
              }
            >
              <FaUndo />
            </div>
          </div>
        )}
        <div
          onWheel={onWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            ...transformStyle,
            width: "fit-content",
            height: "100%",
            touchAction: "none", // Prevent default touch actions like scrolling
          }}
          ref={movingVideoContainerRef}
        >
          <div
            style={{
              position: "relative",
              width: "fit-content",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <video
              controls={false} // Hide built-in controls
              ref={videoRef}
              playsInline
              webkit-playsinline="true"
              style={{
                touchAction: "manipulation",
                width: "fit-content",
                height: "100%",
                aspectRatio: "auto",
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
        </div>
        <canvas
          ref={canvasRef}
          id="drawing-canvas"
          className="canvas"
          style={{ display: drawingMode ? "block" : "none" }}
        />
        {drawingMode && accountType === AccountType.TRAINER && (
          <div
            className="absolute"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "5px",
              flexDirection: "column",
              right: "10px",
              bottom: "10px",
              zIndex: 10,
            }}
          >
            <div className="button" onClick={zoomIn}>
              <PlusCircle />
            </div>
            <div className="button" onClick={zoomOut}>
              <MinusCircle />
            </div>
          </div>
        )}
      </div>
      {accountType === AccountType.TRAINER && !isLock && (
        <CustomVideoControls
          handleSeek={handleSeek}
          isFullscreen={isFullscreen}
          isPlaying={isPlaying}
          toggleFullscreen={toggleFullscreen}
          togglePlayPause={togglePlayPause}
          videoRef={videoRef}
          setIsPlaying={setIsPlaying}
          setCurrentTime={setCurrentTime}
          isFixed={true}
        />
      )}
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
  takeScreenshot,
}) => {
  const socket = useContext(SocketContext);
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
  const [currentTime, setCurrentTime] = useState(0);
  const [isCanvasMenuNoteShow, setIsCanvasMenuNoteShow] = useState(false);
  const [micNote, setMicNote] = useState(false);
  const [clipSelectNote, setClipSelectNote] = useState(false);
  const [countClipNoteOpen, setCountClipNoteOpen] = useState(false);

  const [isPlayingBoth, setIsPlayingBoth] = useState(false); // Track video playback state
  const [isPlaying1, setIsPlaying1] = useState(false); // Track video playback state
  const [isPlaying2, setIsPlaying2] = useState(false); // Track video playback state
  const [isFullscreen, setIsFullscreen] = useState(false); // Track fullscreen state
  const [selectedUser, setSelectedUser] = useState(null);

  function handleUserClick(id) {
    setSelectedUser(id);
    emitVideoSelectEvent("swap", id);
  }

  socket.on(EVENTS.ON_VIDEO_SELECT, ({ id, type }) => {
    if (type === "swap" && accountType === AccountType.TRAINEE) {
      setSelectedUser(id);
    }
  });

  //NOTE - separate funtion for emit seelcted clip videos  and using same even for swapping the videos
  const emitVideoSelectEvent = (type, id) => {
    socket.emit(EVENTS.ON_VIDEO_SELECT, {
      userInfo: { from_user: fromUser._id, to_user: toUser._id },
      type,
      id,
    });
  };

  useEffect(() => {
    const video1 = videoRef.current;
    const video2 = videoRef2.current;

    socket?.on(EVENTS?.ON_VIDEO_PLAY_PAUSE, (data) => {
      if (data?.both && data?.isPlaying) {
        // Only play if the video matches and the action is play
        if (video1?.paused) {
          video1.play();
          video2.play();
          setIsPlayingBoth(true);
        }
      }
    });

    socket?.on(EVENTS?.ON_VIDEO_PLAY_PAUSE, (data) => {
      if (data?.both && !data?.isPlaying) {
        if (video1?.play) {
          video1.pause();
          video2.pause();
          setIsPlayingBoth(false);
        }
      }
    });

    socket?.on(EVENTS?.ON_VIDEO_TIME, (data) => {
      if (data?.both && accountType === AccountType.TRAINEE) {
        video1.currentTime = data.progress;
        video2.currentTime = data.progress;
      }
    });

    socket?.on(EVENTS.TOGGLE_DRAWING_MODE, (data) => {
      if (accountType === AccountType.TRAINEE) {
        setDrawingMode(data.drawingMode);
      }
    });

    socket?.on(EVENTS.TOGGLE_FULL_SCREEN, (data) => {
      if (accountType === AccountType.TRAINEE) {
        setIsMaximized(data.isMaximized);
        setDrawingMode(false)
      }
    });

    socket.on(EVENTS.ON_CLEAR_CANVAS, () => {
      clearCanvas();
    });

    // Clean up on unmount
    return () => {
      socket?.off(EVENTS?.ON_VIDEO_PLAY_PAUSE);
      socket?.off(EVENTS?.ON_VIDEO_TIME);
      socket?.off(EVENTS?.ON_VIDEO_ZOOM_PAN);
      socket?.off(EVENTS?.TOGGLE_DRAWING_MODE);
      socket?.off(EVENTS?.TOGGLE_FULL_SCREEN);
      socket?.off(EVENTS?.ON_CLEAR_CANVAS);
    };
  }, [socket, videoRef, videoRef2]);

  // Play/pause video
  const togglePlayPause = () => {
    const video1 = videoRef.current;
    const video2 = videoRef2.current;
    if (video1 && video2) {
      if (video1.paused) {
        video1.play();
        video2.play();
        setIsPlayingBoth(true);
        socket?.emit(EVENTS?.ON_VIDEO_PLAY_PAUSE, {
          both: true,
          userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
          isPlaying: true,
        });
      } else {
        video1.pause();
        video2.pause();
        setIsPlayingBoth(false);
        socket?.emit(EVENTS?.ON_VIDEO_PLAY_PAUSE, {
          both: true,
          userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
          isPlaying: false,
        });
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
      setCurrentTime(progress);
      socket?.emit(EVENTS?.ON_VIDEO_TIME, {
        both: true,
        userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
        progress,
      });
    }
  };

  const sendClearCanvasEvent = () => {
    if (remoteVideoRef && remoteVideoRef.current) {
      socket.emit(EVENTS.EMIT_CLEAR_CANVAS, {
        userInfo: { from_user: fromUser._id, to_user: toUser._id },
      });
    }
  };

  const clearCanvas = () => {
    const canvas1 = canvasRef?.current;
    const canvas2 = canvasRef2?.current;

    // Clear canvas1
    const context1 = canvas1?.getContext("2d");
    if (context1 && canvas1) {
      context1.clearRect(0, 0, canvas1.width, canvas1.height);
    }

    // Clear canvas2
    const context2 = canvas2?.getContext("2d");
    if (context2 && canvas2) {
      context2.clearRect(0, 0, canvas2.width, canvas2.height);
    }
  };

  const sendStopDrawingEvent = (canvasIndex = 1) => {
    console.log("canvassendStopDrawingEvent", canvasIndex);
    if (remoteVideoRef && remoteVideoRef.current) {
      socket.emit(EVENTS.STOP_DRAWING, {
        userInfo: { from_user: fromUser._id, to_user: toUser._id },
        canvasIndex,
      });
    }
  };

  const stopDrawing = (event, canvasIndex = 1) => {
    event.preventDefault();
    if (state.mousedown[`canvas${canvasIndex}`]) {
      sendDrawEvent(canvasIndex);
      sendStopDrawingEvent(canvasIndex);
      isDrawing = false;
      state.mousedown[canvasIndex] = false;
    }
  };

  const sendDrawEvent = (canvasIndex = 1) => {
    console.log("canvassendDrawEvent", canvasIndex);
    try {
      const canvas =
        canvasIndex === 1 ? canvasRef?.current : canvasRef2?.current;
      if (!canvas) return;
      const { width, height } = canvas;
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (!(event && event.target)) return;
          const binaryData = event.target.result;

          socket.emit(EVENTS.DRAW, {
            userInfo: { from_user: fromUser._id, to_user: toUser._id },
            strikes: binaryData,
            canvasSize: { width, height },
            canvasIndex,
          });
        };
        reader.readAsArrayBuffer(blob);
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  socket.on(
    EVENTS.EMIT_DRAWING_CORDS,
    ({ strikes, canvasSize, canvasIndex }) => {
      console.log("is sending data");
      const canvas =
        canvasIndex === 1 ? canvasRef?.current : canvasRef2?.current;
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
    }
  );

  const sendEmitUndoEvent = useCallback((canvasIndex) => {
    _debounce(() => sendDrawEvent(canvasIndex), 500)();
  }, []);

  const undoDrawing = async (
    senderConfig,
    extraCoordinateConfig,
    removeLastCoordinate = true,
    canvasIndex = 1
  ) => {
    console.log("canvasundoDrawing", canvasIndex);
    try {
      const canvas =
        canvasIndex === 1 ? canvasRef?.current : canvasRef2?.current;
      const context = canvas?.getContext("2d");
      if (!context || !canvas) return;
      context.clearRect(0, 0, canvas.width, canvas.height);

      if (removeLastCoordinate)
        storedLocalDrawPaths[`canvas${canvasIndex}`].sender.splice(-1, 1);

      // Draw all the paths in the paths array
      await senderConfig.coordinates.forEach((path) => {
        context.beginPath();
        context.strokeStyle = senderConfig.theme.strokeStyle;
        context.lineWidth = senderConfig.theme.lineWidth;
        context.lineCap = "round";
        if (path && Array.isArray(path)) {
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

        if (path && Array.isArray(path)) {
          context.moveTo(path[0][0], path[0][1]);
          for (let i = 0; i < path.length; i++) {
            context.lineTo(path[i][0], path[i][1]);
          }
          context.stroke();
        }
      });

      if (strikes[`canvas${canvasIndex}`].length <= 0) return;
      context.putImageData(strikes[`canvas${canvasIndex}`].pop(), 0, 0);

      // Send event to the other user (if needed)
      if (removeLastCoordinate) {
        sendEmitUndoEvent(canvasIndex);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    const video1 = videoRef.current;
    const video2 = videoRef2.current;

    const canvas1 = canvasRef?.current;
    const canvas2 = canvasRef2?.current;

    if (canvas1) {
      canvas1.width = video1.clientWidth;
      canvas1.height = video1.clientHeight;
    }
    if (canvas2) {
      canvas2.width = video2.clientWidth;
      canvas2.height = video2.clientHeight;
    }

    const context1 = canvas1?.getContext("2d");
    const context2 = canvas2?.getContext("2d");

    const drawFrame = () => {
      if (canvas1 && context1 && video) {
        context1.fillStyle = "rgba(255, 255, 255, 0.5)";
        context1.fillRect(0, 0, canvas1.width, canvas1.height);
      }
      if (canvas2 && context2 && video) {
        context2.fillStyle = "rgba(255, 255, 255, 0.5)";
        context2.fillRect(0, 0, canvas2.width, canvas2.height);
      }
      requestAnimationFrame(drawFrame);
    };

    // Drawing Logic for Canvas 1 and Canvas 2
    const startDrawing = (event, canvasIndex = 1) => {
      try {
        console.log("canvas", canvasIndex);
        event.preventDefault();
        isDrawing = true;
        const canvas =
          canvasIndex === 1 ? canvasRef?.current : canvasRef2?.current;
        const context = canvas?.getContext("2d");
        if (!context) return;

        savedPos[`canvas${canvasIndex}`] = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        if (strikes[`canvas${canvasIndex}`].length >= 10)
          strikes[`canvas${canvasIndex}`].shift();
        strikes[`canvas${canvasIndex}`].push(savedPos[`canvas${canvasIndex}`]);

        const mousePos = event.type.includes("touchstart")
          ? getTouchPos(event, canvas)
          : getMousePositionOnCanvas(event, canvas);

        context.strokeStyle = canvasConfigs.sender.strokeStyle;
        context.lineWidth = canvasConfigs.sender.lineWidth;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(mousePos.x, mousePos.y);
        state.mousedown[`canvas${canvasIndex}`] = true;
        startPos[`canvas${canvasIndex}`] = { x: mousePos.x, y: mousePos.y };
      } catch (error) {
        console.log("error", error);
      }
    };

    const findDistance = (startPos, currPos) => {
      let dis = Math.sqrt(
        Math.pow(currPos.x - startPos.x, 2) +
          Math.pow(currPos.y - startPos.y, 2)
      );
      return dis;
    };

    const drawShapes = (context, canvasIndex) => {
      switch (selectedShape) {
        case SHAPES.LINE: {
          context.moveTo(
            startPos[`canvas${canvasIndex}`].x,
            startPos[`canvas${canvasIndex}`].y
          );
          context.lineTo(
            currPos[`canvas${canvasIndex}`].x,
            currPos[`canvas${canvasIndex}`].y
          );
          break;
        }
        case SHAPES.CIRCLE: {
          let distance = findDistance(
            startPos[`canvas${canvasIndex}`],
            currPos[`canvas${canvasIndex}`]
          );
          context.arc(
            startPos[`canvas${canvasIndex}`].x,
            startPos[`canvas${canvasIndex}`].y,
            distance,
            0,
            2 * Math.PI,
            false
          );
          break;
        }
        case SHAPES.SQUARE: {
          let w =
            currPos[`canvas${canvasIndex}`].x -
            startPos[`canvas${canvasIndex}`].x;
          let h =
            currPos[`canvas${canvasIndex}`].y -
            startPos[`canvas${canvasIndex}`].y;
          context.rect(
            startPos[`canvas${canvasIndex}`].x,
            startPos[`canvas${canvasIndex}`].y,
            w,
            h
          );
          break;
        }
        case SHAPES.RECTANGLE: {
          let w =
            currPos[`canvas${canvasIndex}`].x -
            startPos[`canvas${canvasIndex}`].x;
          let h =
            currPos[`canvas${canvasIndex}`].y -
            startPos[`canvas${canvasIndex}`].y;
          context.rect(
            startPos[`canvas${canvasIndex}`].x,
            startPos[`canvas${canvasIndex}`].y,
            w,
            h
          );
          break;
        }
        case SHAPES.OVAL: {
          const transform = context.getTransform();
          let w =
            currPos[`canvas${canvasIndex}`].x -
            startPos[`canvas${canvasIndex}`].x;
          let h =
            currPos[`canvas${canvasIndex}`].y -
            startPos[`canvas${canvasIndex}`].y;
          context.fillStyle = "#FFFFFF";
          context.fillStyle = "rgba(0, 0, 0, 0)";
          const radiusX = w * transform.a;
          const radiusY = h * transform.d;
          if (radiusX > 0 && radiusY > 0) {
            context.ellipse(
              currPos[`canvas${canvasIndex}`].x,
              currPos[`canvas${canvasIndex}`].y,
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
          context.moveTo(
            startPos[`canvas${canvasIndex}`].x +
              (currPos[`canvas${canvasIndex}`].x -
                startPos[`canvas${canvasIndex}`].x) /
                2,
            startPos[`canvas${canvasIndex}`].y
          );
          context.lineTo(
            startPos[`canvas${canvasIndex}`].x,
            currPos[`canvas${canvasIndex}`].y
          );
          context.lineTo(
            currPos[`canvas${canvasIndex}`].x,
            currPos[`canvas${canvasIndex}`].y
          );
          context.closePath();
          break;
        }
        case SHAPES.ARROW_RIGHT: {
          const arrowSize = 10;
          const direction = Math.atan2(
            currPos[`canvas${canvasIndex}`].y -
              startPos[`canvas${canvasIndex}`].y,
            currPos[`canvas${canvasIndex}`].x -
              startPos[`canvas${canvasIndex}`].x
          );
          const arrowheadX =
            currPos[`canvas${canvasIndex}`].x + length * Math.cos(direction);
          const arrowheadY =
            currPos[`canvas${canvasIndex}`].y + length * Math.sin(direction);
          context.moveTo(
            startPos[`canvas${canvasIndex}`].x,
            startPos[`canvas${canvasIndex}`].y
          );
          context.lineTo(
            currPos[`canvas${canvasIndex}`].x,
            currPos[`canvas${canvasIndex}`].y
          );
          context.moveTo(arrowheadX, arrowheadY);
          context.lineTo(
            currPos[`canvas${canvasIndex}`].x -
              arrowSize * Math.cos(direction - Math.PI / 6),
            currPos[`canvas${canvasIndex}`].y -
              arrowSize * Math.sin(direction - Math.PI / 6)
          );
          context.moveTo(
            currPos[`canvas${canvasIndex}`].x,
            currPos[`canvas${canvasIndex}`].y
          );
          context.lineTo(
            currPos[`canvas${canvasIndex}`].x -
              arrowSize * Math.cos(direction + Math.PI / 6),
            currPos[`canvas${canvasIndex}`].y -
              arrowSize * Math.sin(direction + Math.PI / 6)
          );
          context.stroke();
          break;
        }
        case SHAPES.TWO_SIDE_ARROW: {
          const x1 = startPos[`canvas${canvasIndex}`].x;
          const y1 = startPos[`canvas${canvasIndex}`].y;
          const x2 = currPos[`canvas${canvasIndex}`].x;
          const y2 = currPos[`canvas${canvasIndex}`].y;
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

    const draw = (event, canvasIndex = 1) => {
      console.log("canvasDraw", canvasIndex);
      event.preventDefault();
      const canvas =
        canvasIndex === 1 ? canvasRef?.current : canvasRef2?.current;
      const context = canvas?.getContext("2d");
      if (!isDrawing || !context || !state.mousedown[`canvas${canvasIndex}`])
        return;

      const mousePos = event.type.includes("touchmove")
        ? getTouchPos(event, canvas)
        : getMousePositionOnCanvas(event, canvas);
      currPos[`canvas${canvasIndex}`] = { x: mousePos?.x, y: mousePos.y };
      console.log("selectedShape1", selectedShape);
      if (selectedShape !== SHAPES.FREE_HAND) {
        context.putImageData(savedPos[`canvas${canvasIndex}`], 0, 0);
        context.beginPath();
        drawShapes(context, canvasIndex);
        context.stroke();
      } else {
        // console.log(`--- drawing ---- `);
        context.strokeStyle = canvasConfigs.sender.strokeStyle;
        context.lineWidth = canvasConfigs.sender.lineWidth;
        context.lineCap = "round";
        context.lineTo(mousePos.x, mousePos.y);
        context.stroke();
      }
    };

    if (canvas1) {
      canvas1.addEventListener("touchstart", (e) => startDrawing(e, 1), {
        passive: false,
      });
      canvas1.addEventListener("touchmove", (e) => draw(e, 1), {
        passive: false,
      });
      canvas1.addEventListener("touchend", (e) => stopDrawing(e, 1), {
        passive: false,
      });

      canvas1.addEventListener("mousedown", (e) => startDrawing(e, 1));
      canvas1.addEventListener("mousemove", (e) => draw(e, 1));
      canvas1.addEventListener("mouseup", (e) => stopDrawing(e, 1));
    }

    if (canvas2) {
      canvas2.addEventListener("touchstart", (e) => startDrawing(e, 2), {
        passive: false,
      });
      canvas2.addEventListener("touchmove", (e) => draw(e, 2), {
        passive: false,
      });
      canvas2.addEventListener("touchend", (e) => stopDrawing(e, 2), {
        passive: false,
      });

      canvas2.addEventListener("mousedown", (e) => startDrawing(e, 2));
      canvas2.addEventListener("mousemove", (e) => draw(e, 2));
      canvas2.addEventListener("mouseup", (e) => stopDrawing(e, 2));
    }

    return () => {
      video1?.removeEventListener("play", drawFrame);
      video2?.removeEventListener("play", drawFrame);
    };
  }, [canvasRef, canvasRef2]);

  const getMousePositionOnCanvas = (event, canvas) => {
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // Scale factor for width
    const scaleY = canvas.height / rect.height; // Scale factor for height

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    return { x, y };
  };

  const getTouchPos = (touchEvent, canvas) => {
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (touchEvent.changedTouches[0].clientX - rect.left) * scaleX;
    const y = (touchEvent.changedTouches[0].clientY - rect.top) * scaleY;

    return { x, y };
  };

  function resetInitialPinnedUser() {}
  const isSingle = selectedClips?.length === 1;
  return (
    <>
      {isMaximized ? (
        <div className="">
          {accountType === AccountType.TRAINER && (
            <div
              className="d-flex  justify-content-start top-0 absolute align-items-center pr-4 pl-2 mt-2 w-100"
              style={{
                zIndex: 99,
              }}
            >
              <div className="d-flex">
                {/* <div
                  className="button"
                  onClick={() => {
                    setIsMaximized(!isMaximized);
                    setDrawingMode(false)
                    socket.emit(EVENTS.TOGGLE_FULL_SCREEN, {
                      userInfo: {
                        from_user: fromUser._id,
                        to_user: toUser._id,
                      },
                      isMaximized: !isMaximized,
                    });
                  }}
                >
                  {isMaximized ? (
                    <Minimize size={18} />
                  ) : (
                    <Maximize size={18} />
                  )}
                </div> */}
                <div className="button aperture ml-2" onClick={takeScreenshot}>
                  <Aperture size={16} />
                </div>
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <div
                    className="button ml-2"
                    onClick={() => {
                      setDrawingMode(!drawingMode);
                      socket.emit(EVENTS.TOGGLE_DRAWING_MODE, {
                        userInfo: {
                          from_user: fromUser._id,
                          to_user: toUser._id,
                        },
                        drawingMode: !drawingMode,
                      });
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
                      style={{
                        position: "absolute",
                        zIndex: 99,
                        top: -10,
                      }}
                    >
                      <CanvasMenuBar
                        isOpen={isOpen}
                        isFromPotrait={true}
                        setIsOpen={setIsOpen}
                        setSketchPickerColor={(rgb) => {
                          setSketchPickerColor(rgb);
                        }}
                        sketchPickerColor={sketchPickerColor}
                        canvasConfigs={canvasConfigs}
                        setCanvasConfigs={(config) => {
                          canvasConfigs = config;
                        }}
                        drawShapes={(shapeType) => {
                          console.log("shapeType", shapeType);
                          selectedShape = shapeType;
                        }}
                        refreshDrawing={() => {
                          // deleting the canvas drawing
                          storedLocalDrawPaths = {
                            canvas1: { sender: [], receiver: [] },
                            canvas2: { sender: [], receiver: [] }, // Separate history for each canvas
                          };
                          clearCanvas();
                          sendClearCanvasEvent();
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
                  sendDrawEvent={sendDrawEvent}
                  undoDrawing={undoDrawing}
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
                  sendDrawEvent={sendDrawEvent}
                  undoDrawing={undoDrawing}
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
                    setCurrentTime={setCurrentTime}
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
                sendDrawEvent={sendDrawEvent}
                undoDrawing={undoDrawing}
              />
            )}
          </div>
        </div>
      ) : (
        <>
          <div
            className={`d-flex  pl-2 pr-4 ${
              accountType === AccountType.TRAINER
                ? "mt-2 justify-content-between"
                : "m-2 justify-content-end"
            } w-100`}
          >
            {accountType === AccountType.TRAINER && (
              <div className="d-flex">
                {/* <div
                  className="button"
                  onClick={() => {
                    setIsMaximized(!isMaximized);
                    setDrawingMode(false)
                    socket.emit(EVENTS.TOGGLE_FULL_SCREEN, {
                      userInfo: {
                        from_user: fromUser._id,
                        to_user: toUser._id,
                      },
                      isMaximized: !isMaximized,
                    });
                  }}
                >
                  {isMaximized ? (
                    <Minimize size={18} />
                  ) : (
                    <Maximize size={18} />
                  )}
                </div> */}
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <div
                    className="button "
                    onClick={() => {
                      setDrawingMode(!drawingMode);
                      socket.emit(EVENTS.TOGGLE_DRAWING_MODE, {
                        userInfo: {
                          from_user: fromUser._id,
                          to_user: toUser._id,
                        },
                        drawingMode: !drawingMode,
                      });
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
                      style={{
                        position: "absolute",
                        zIndex: 99,
                        top: -10,
                      }}
                    >
                      <CanvasMenuBar
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        setSketchPickerColor={(rgb) => {
                          setSketchPickerColor(rgb);
                        }}
                        isFromPotrait={true}
                        sketchPickerColor={sketchPickerColor}
                        canvasConfigs={canvasConfigs}
                        setCanvasConfigs={(config) => {
                          canvasConfigs = config;
                        }}
                        drawShapes={(shapeType) => {
                          console.log("shapeType", shapeType);
                          selectedShape = shapeType;
                        }}
                        refreshDrawing={() => {
                          // deleting the canvas drawing
                          storedLocalDrawPaths = {
                            canvas1: { sender: [], receiver: [] },
                            canvas2: { sender: [], receiver: [] }, // Separate history for each canvas
                          };
                          clearCanvas();
                          sendClearCanvasEvent();
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
          {selectedUser ? (
            <>
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
              />

              <UserBox
                id={toUser._id}
                onClick={handleUserClick}
                selectedUser={selectedUser}
                selected={selectedUser === toUser._id}
                notSelected={selectedUser}
                videoRef={localVideoRef}
                user={fromUser}
                stream={localStream}
                isStreamOff={isLocalStreamOff}
              />
              {selectedUser === toUser._id ? (
                <UserBoxMini
                  id={fromUser._id}
                  onClick={handleUserClick}
                  selected={false}
                  videoRef={remoteVideoRef}
                  stream={remoteStream}
                  user={toUser}
                  isStreamOff={isRemoteStreamOff}
                />
              ) : (
                <UserBoxMini
                  id={toUser._id}
                  onClick={handleUserClick}
                  selected={false}
                  videoRef={localVideoRef}
                  stream={localStream}
                  user={fromUser}
                  isStreamOff={isLocalStreamOff}
                />
              )}

              <VideoMiniBox
                clips={selectedClips}
                id={null}
                onClick={handleUserClick}
              />
            </>
          ) : (
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
                    sendDrawEvent={sendDrawEvent}
                    undoDrawing={undoDrawing}
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
                    sendDrawEvent={sendDrawEvent}
                    undoDrawing={undoDrawing}
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
                      setCurrentTime={setCurrentTime}
                    />
                  )}
                </>
              ) : (
                <VideoContainer
                  index={1}
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
                  sendDrawEvent={sendDrawEvent}
                  undoDrawing={undoDrawing}
                />
              )}
              <UserBoxMini
                id={fromUser._id}
                onClick={handleUserClick}
                selected={false}
                videoRef={remoteVideoRef}
                stream={remoteStream}
                user={toUser}
                isStreamOff={isRemoteStreamOff}
              />
              <UserBoxMini
                id={toUser._id}
                onClick={handleUserClick}
                selected={false}
                videoRef={localVideoRef}
                stream={localStream}
                user={fromUser}
                isStreamOff={isLocalStreamOff}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ClipModeCall;
