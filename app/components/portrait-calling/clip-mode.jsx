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
import { AccountType, SHAPES } from "../../common/constants";
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
import { FaLock, FaUndo, FaUnlock } from "react-icons/fa";
import NextImage from "next/image";

let isDrawing = false;
let savedPos = { canvas1: null, canvas2: null };
let startPos = { canvas1: null, canvas2: null };
let currPos = { canvas1: null, canvas2: null };
let strikes = { canvas1: [], canvas2: [] };

let drawingStep = "baseline"
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

let lastDrawingStep;

let anglePoint = { canvas1: null, canvas2: null };
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
  isLandscape,
  videoContainerRef
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const { accountType } = useAppSelector(authState);
  const socket = useContext(SocketContext);
  // const videoContainerRef = useRef(null);
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
  console.log("IsVideoLoaded",isVideoLoaded)
  useEffect(() => {
    const video = videoRef?.current;
    if (!video) return;
  
    let isHandlingLoad = false; // Prevent multiple handlers from conflicting
  
    const handleVideoLoadComplete = () => {
      if (isHandlingLoad) return;
      isHandlingLoad = true;
      
      setIsVideoLoading(false);
      setVideoProgress(100);
      setIsVideoLoaded(true);
      
      console.log(`Video ${clip?.id} loaded successfully`);
    };
  
    const handleError = (error) => {
      console.error("Video failed to load:", error);
      setIsVideoLoading(false);
      setVideoProgress(0);
      setIsVideoLoaded(false);
      toast.error("Failed to load video");
    };
  
    const handleStalled = () => {
      console.log("Video playback stalled");
      setIsVideoLoading(true);
      setIsVideoLoaded(false);
    };
  
    const handleWaiting = () => {
      console.log("Video waiting for data");
      setIsVideoLoading(true);
      setIsVideoLoaded(false);
    };

    const handleVideoLoadStart = () => {
      console.log(`Video ${clip?.id} load started`);
      setIsVideoLoading(true);
      setVideoProgress(0);
      setIsVideoLoaded(false);
      
      // Start with a small progress to show loading has begun
      setTimeout(() => {
        if (!isVideoLoaded && videoProgress === 0) {
          setVideoProgress(5);
          console.log(`Video ${clip?.id} initial progress: 5%`);
        }
      }, 200);
    };

    const handleVideoProgress = (event) => {
      const video = event.target;
      if (video.buffered.length > 0 && video.duration) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        const progress = (bufferedEnd / duration) * 100;
        setVideoProgress(Math.round(progress));
        console.log(`Video ${clip?.id} progress: ${Math.round(progress)}%`);
      }
    };

    // Add a more frequent progress check using setInterval
    const progressInterval = setInterval(() => {
      if (video && !isVideoLoaded) {
        let newProgress = videoProgress;
        
        // Check buffered ranges
        if (video.buffered.length > 0 && video.duration) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const duration = video.duration;
          const bufferedProgress = (bufferedEnd / duration) * 100;
          
          if (bufferedProgress > newProgress) {
            newProgress = Math.round(bufferedProgress);
          }
        }
        
        // Also check readyState for more granular progress
        const readyStateProgress = (video.readyState / 4) * 100; // readyState goes from 0 to 4
        if (readyStateProgress > newProgress) {
          newProgress = Math.round(readyStateProgress);
        }
        
        // Ensure progress doesn't go backwards and has minimum increments
        if (newProgress > videoProgress && newProgress <= 100) {
          // Ensure minimum progress increment to show movement
          const minIncrement = Math.max(1, Math.floor((100 - videoProgress) / 10));
          const finalProgress = Math.max(videoProgress + minIncrement, newProgress);
          
          setVideoProgress(Math.min(finalProgress, 100));
          console.log(`Video ${clip?.id} interval progress: ${Math.min(finalProgress, 100)}%`);
        }
        
        // If video is ready but we haven't completed, force completion
        if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA && videoProgress >= 85) {
          setTimeout(() => handleVideoLoadComplete(), 200);
        }
      }
    }, 150); // Check every 150ms for smoother progress updates

    const handleVideoCanPlay = () => {
      console.log(`Video ${clip?.id} can play`);
      if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        // Ensure we show some progress before completing
        if (videoProgress < 90) {
          setVideoProgress(90);
          console.log(`Video ${clip?.id} final progress: 90%`);
        }
        setTimeout(() => handleVideoLoadComplete(), 100);
      }
    };

    const handleVideoCanPlayThrough = () => {
      console.log(`Video ${clip?.id} can play through`);
      // Ensure we show some progress before completing
      if (videoProgress < 95) {
        setVideoProgress(95);
        console.log(`Video ${clip?.id} final progress: 95%`);
      }
      setTimeout(() => handleVideoLoadComplete(), 100);
    };

    const handleVideoLoadedData = () => {
      console.log(`Video ${clip?.id} loaded data`);
      if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        // Ensure we show some progress before completing
        if (videoProgress < 85) {
          setVideoProgress(85);
          console.log(`Video ${clip?.id} loaded data progress: 85%`);
        }
        setTimeout(() => handleVideoLoadComplete(), 100);
      }
    };

    // Add loading progress events
    video.addEventListener('loadstart', handleVideoLoadStart);
    video.addEventListener('progress', handleVideoProgress);
    video.addEventListener('canplay', handleVideoCanPlay);
    video.addEventListener('canplaythrough', handleVideoCanPlayThrough);
    video.addEventListener('loadeddata', handleVideoLoadedData);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('error', handleError);
  
    // Additional check for cases where video might already be ready
    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      // If video is already ready, show some progress before completing
      if (videoProgress === 0) {
        setVideoProgress(50);
        setTimeout(() => {
          setVideoProgress(100);
          setTimeout(() => handleVideoLoadComplete(), 100);
        }, 100);
      } else {
        handleVideoLoadComplete();
      }
    }
  
    // Set preload for better loading behavior
    video.preload = "auto";
  
    // Add timeout to prevent infinite loading
    const loadTimeout = setTimeout(() => {
      if (!isVideoLoaded) {
        console.warn(`Video ${clip?.id} loading timeout`);
        handleError(new Error('Loading timeout'));
      }
    }, 30000); // 30 second timeout
  
    return () => {
      clearTimeout(loadTimeout);
      clearInterval(progressInterval);
      video.removeEventListener('loadstart', handleVideoLoadStart);
      video.removeEventListener('progress', handleVideoProgress);
      video.removeEventListener('canplay', handleVideoCanPlay);
      video.removeEventListener('canplaythrough', handleVideoCanPlayThrough);
      video.removeEventListener('loadeddata', handleVideoLoadedData);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('error', handleError);
    };
  }, [videoRef, clip?.id, isVideoLoaded]);

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

  const [aspectRatio, setAspectRatio] = useState("16 / 9");

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      video.onloadedmetadata = () => {
        const ratio = video.videoWidth / video.videoHeight;
        setAspectRatio(`${video.videoWidth} / ${video.videoHeight}`);
      };
    }
  }, [videoRef]);
  
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!canvasRef.current || !videoContainerRef.current) return;
      
      const canvas = canvasRef.current;
      const container = videoContainerRef.current;
      
      // Get actual displayed size
      const { width, height } = container.getBoundingClientRect();
      
      // Set internal resolution to match display size
      canvas.width = width;
      canvas.height = height;
      
      console.log('Canvas dimensions updated:', width, height);
    };
  
    // Initial setup
    updateCanvasSize();
  
    // Handle window resizing
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(videoContainerRef.current);
  
    return () => resizeObserver.disconnect();
  }, [canvasRef, videoContainerRef]);

  return (
    <>
    
      <div
        id="video-container"
        ref={videoContainerRef}
        className={`relative overflow-hidden `}
        style={{
          height: isSingle
            ? isMaximized
              ? "88dvh"
              : "80dvh" // If isSingle is true
            : isMaximized
              ? isLock
                ? "44.5dvh"
                : "42.5dvh" // If isMaximized is true and isSingle is false
              : isLock
                ? "40dvh"
                : "37dvh", // If isMaximized is false and isSingle is false
          width: isLandscape ? "50vw" : "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "white",
          position: "relative",
        }}
      >
        {!isVideoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
            <div className="text-white">Loading video...</div>
          </div>
        )}
        {drawingMode && accountType === AccountType.TRAINER && (
          <div
            className="absolute hide-in-screenshot"
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
              onClick={() => {

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
              overflow: "hidden"
            }}
          >
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <video
                controls={false}
                ref={videoRef}
                playsInline
                webkit-playsinline="true"
                style={{
                  touchAction: "manipulation",
                  maxWidth: "100%",
                  width: "auto",
                  height: `${100}%`,
                  // maxHeight:"100%",
                  aspectRatio: aspectRatio, // Force a correct aspect ratio
                  objectFit: "contain", // Prevent stretching
                  opacity: isVideoLoading ? 0.6 : 1,
                  pointerEvents: isVideoLoading ? "none" : "auto",
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
              
              {isVideoLoading && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "rgba(0, 0, 0, 0.7)",
                    borderRadius: "8px",
                    padding: "12px",
                    color: "white",
                    textAlign: "center",
                    minWidth: "80px",
                    zIndex: 10,
                  }}
                >
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <div style={{ fontSize: "12px", marginTop: "4px" }}>
                    {videoProgress}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          id="drawing-canvas"
          className="canvas"
        
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%', 
            display: drawingMode ? "block" : "none"
          }}
        />
        {drawingMode && accountType === AccountType.TRAINER && (
          <div
            className="absolute hide-in-screenshot"
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
      {!isLock && (
        <CustomVideoControls
          handleSeek={handleSeek}
          isFullscreen={isFullscreen}
          isPlaying={isPlaying}
          toggleFullscreen={toggleFullscreen}
          togglePlayPause={togglePlayPause}
          videoRef={videoRef}
          setIsPlaying={setIsPlaying}
          setCurrentTime={setCurrentTime}
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
  setIsLock,
  localVideoRef,
  remoteVideoRef,
  toUser,
  fromUser,
  localStream,
  remoteStream,
  isRemoteStreamOff,
  isLocalStreamOff,
  takeScreenshot,
  isLandscape,
  canvasRef,
  canvasRef2,
  videoRef,
  videoRef2,
  videoContainerRef,
  videoContainerRef2,
  setShowScreenshotButton
}) => {
  const socket = useContext(SocketContext);
  const [drawingMode, setDrawingMode] = useState(false);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const { accountType } = useAppSelector(authState);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setShowScreenshotButton(true)
  }, [])

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
    if (accountType === AccountType.TRAINER) {
      setSelectedUser(id);
      if (id) {
        setShowScreenshotButton(false)
      } else {
        setShowScreenshotButton(true)
      }
      emitVideoSelectEvent("swap", id);
    }
  }

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
      }
    });

    socket?.on(EVENTS.TOGGLE_LOCK_MODE, (data) => {
      if (accountType === AccountType.TRAINEE) {
        setIsLock(data.isLockMode);
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
      socket?.off(EVENTS?.TOGGLE_LOCK_MODE);
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

  const handleSeek = (e) => {
    const newProgress = parseFloat(e.target.value);

    if (!videoRef?.current || !videoRef2?.current) return;

    const video1 = videoRef.current;
    const video2 = videoRef2.current;

    const isVideo1Longer = video1.duration >= video2.duration;
    const longerVideo = isVideo1Longer ? video1 : video2;
    const shorterVideo = isVideo1Longer ? video2 : video1;

    // Calculate the delta (difference) in progress
    const delta = newProgress - longerVideo.currentTime;

    // Apply delta to both videos while ensuring shorterVideo does not exceed limits
    longerVideo.currentTime = newProgress;
    shorterVideo.currentTime = Math.min(
      Math.max(shorterVideo.currentTime + delta, 0),
      shorterVideo.duration
    );

    // Update state
    setCurrentTime(longerVideo.currentTime);

    // Emit event with the new progress
    socket?.emit(EVENTS?.ON_VIDEO_TIME, {
      userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
      both: true,
      progress: longerVideo.currentTime, // Sync using the longer video
    });
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

  // const [drawingStep, setDrawingStep] = useState("baseline")
  // console.log("drawingStep", drawingStep)
  const stopDrawing = (event, canvasIndex = 1) => {
    console.log("stopDrawingexcuted")
    event.preventDefault();

    if (selectedShape === SHAPES.ANGLE) {
      if (drawingStep === 'baseline' && currPos[`canvas${canvasIndex}`]) {
        console.log("stop-drawingStep", drawingStep, startPos, currPos)

        // If we're in baseline step and we completed it, move to angle drawing step
        lastDrawingStep = "baseline"
        drawingStep = "angle";
      } else if (drawingStep === 'angle' && anglePoint[`canvas${canvasIndex}`]) {
        // Save the angle calculation here
        drawingStep = "baseline";
        lastDrawingStep = "angle"
        anglePoint = { canvas1: null, canvas2: null };
      }
    }

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
      console.log("drawingStep", drawingStep, selectedShape, lastDrawingStep)
      if (drawingStep === "baseline" && selectedShape === SHAPES.ANGLE && lastDrawingStep === "angle") {
        context.putImageData(strikes[`canvas${canvasIndex}`].pop(), 0, 0);
      }
      // Send event to the other user (if needed)
      if (removeLastCoordinate) {
        sendEmitUndoEvent(canvasIndex);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const calculateAngle = (start, end, angle) => {
    console.log("start", start, end, angle)
    const dx1 = end.x - start.x;
    const dy1 = end.y - start.y;
    const dx2 = angle.x - end.x;
    const dy2 = angle.y - end.y;
    console.log("start2", dx1, dy1, dx2, dy2)
    const dotProduct = -(dx1 * dx2 + dy1 * dy2);
    console.log("start3", dotProduct)
    const magnitude1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const magnitude2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    console.log("start4", magnitude1, magnitude2)
    let angleRad = Math.acos(dotProduct / (magnitude1 * magnitude2));
    let angleDeg = (angleRad * 180) / Math.PI;
    console.log("start5", angleRad, angleDeg)

    return isNaN(angleDeg) ? 0 : angleDeg;
  };

  const calculateCompleteAngle = (start, end, angle) => {
    // Vector from start to end point (baseline)
    const dx1 = end.x - start.x;
    const dy1 = end.y - start.y;

    // Vector from end point to angle point
    const dx2 = angle.x - end.x;
    const dy2 = angle.y - end.y;

    // Calculate the angle between the two vectors
    const angleRad = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);
    let angleDeg = (angleRad * 180) / Math.PI;

    // Normalize to 0-360 range
    if (angleDeg < 0) {
      angleDeg += 360;
    }

    return isNaN(angleDeg) ? 0 : angleDeg;
  };

  useEffect(() => {
    const video1 = videoRef.current;
    const video2 = videoRef2.current;

    const canvas1 = canvasRef?.current;
    const canvas2 = canvasRef2?.current;

    const context1 = canvas1?.getContext("2d");
    const context2 = canvas2?.getContext("2d");

    const drawFrame = () => {
      if (canvas1 && context1 && video1) {
        context1.fillStyle = "rgba(255, 255, 255, 0.5)";
        context1.fillRect(0, 0, canvas1.width, canvas1.height);
      }
      if (canvas2 && context2 && video2) {
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
        if (selectedShape === SHAPES.ANGLE) {
          console.log("drawingStep", drawingStep)
          if (drawingStep === "baseline") {

            startPos[`canvas${canvasIndex}`] = { x: mousePos.x, y: mousePos.y };
            currPos[`canvas${canvasIndex}`] = { x: mousePos.x, y: mousePos.y };

          } else if (drawingStep === "angle") {
            anglePoint[`canvas${canvasIndex}`] = { x: mousePos.x, y: mousePos.y };

          }
        } else {
          startPos[`canvas${canvasIndex}`] = { x: mousePos.x, y: mousePos.y };

        }

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
        case SHAPES.ANGLE: {
          // Draw baseline
          context.moveTo(
            startPos[`canvas${canvasIndex}`].x,
            startPos[`canvas${canvasIndex}`].y
          );
          context.lineTo(
            currPos[`canvas${canvasIndex}`].x,
            currPos[`canvas${canvasIndex}`].y
          );
          // Draw angle lines
          if (anglePoint[`canvas${canvasIndex}`]) {
            context.moveTo(currPos[`canvas${canvasIndex}`].x, currPos[`canvas${canvasIndex}`].y);
            context.lineTo(anglePoint[`canvas${canvasIndex}`].x, anglePoint[`canvas${canvasIndex}`].y);
          }
          break;
        }
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

      console.log("selectedShape1", selectedShape);
      if (selectedShape === SHAPES.FREE_HAND) {
        context.strokeStyle = canvasConfigs.sender.strokeStyle;
        context.lineWidth = canvasConfigs.sender.lineWidth;
        context.lineCap = "round";
        context.lineTo(mousePos.x, mousePos.y);
        context.stroke();
        currPos[`canvas${canvasIndex}`] = { x: mousePos?.x, y: mousePos.y };
      }
      else if (selectedShape === SHAPES.ANGLE) {
        // Handle angle tool logic

        if (drawingStep === "baseline") {
          // Draw the angle tool shape (line + angle marking)
          currPos[`canvas${canvasIndex}`] = { x: mousePos?.x, y: mousePos.y };
          context.putImageData(savedPos[`canvas${canvasIndex}`], 0, 0);
          context.beginPath();
          drawShapes(context, canvasIndex);
          context.stroke();
        } else {
          anglePoint[`canvas${canvasIndex}`] = mousePos;

          context.putImageData(savedPos[`canvas${canvasIndex}`], 0, 0);
          context.beginPath();
          drawShapes(context, canvasIndex);
          context.stroke();
          const computedAngle = calculateAngle(
            startPos[`canvas${canvasIndex}`],
            currPos[`canvas${canvasIndex}`],
            mousePos
          );
          const completeComputedAngle = calculateCompleteAngle(startPos[`canvas${canvasIndex}`],
            currPos[`canvas${canvasIndex}`],
            mousePos)
          console.log("completeComputedAngle", completeComputedAngle)
          // Optionally, display the angle computed (you can use context.fillText)
          context.fillStyle = canvasConfigs.sender.strokeStyle;
          context.font = "16px Arial";
          if (completeComputedAngle > 180) {
            context.fillText(`${computedAngle.toFixed(2)}°`, currPos[`canvas${canvasIndex}`].x - 60, currPos[`canvas${canvasIndex}`].y + 20);
          } else {
            context.fillText(`${computedAngle.toFixed(2)}°`, currPos[`canvas${canvasIndex}`].x + 10, currPos[`canvas${canvasIndex}`].y - 20);

          }

        }

      } else {
        // console.log(`--- drawing ---- `);
        currPos[`canvas${canvasIndex}`] = { x: mousePos?.x, y: mousePos.y };
        context.putImageData(savedPos[`canvas${canvasIndex}`], 0, 0);
        context.beginPath();
        drawShapes(context, canvasIndex);
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

  function resetInitialPinnedUser() { }
  const isSingle = selectedClips?.length === 1;




  return (
    <>

      <div
        className={`d-flex  pl-1 pr-1 ${accountType === AccountType.TRAINER && !selectedUser
          ? "mt-1 mb-1 justify-content-between"
          : "mt-2 mb-2  justify-content-end"
          } ${isMaximized ? "" : "w-100"}`}
      >
        {accountType === AccountType.TRAINER && !selectedUser && (
          <div className="d-flex">
            <div
              className="button"
              onClick={() => {
                setIsMaximized(!isMaximized);
                socket.emit(EVENTS.TOGGLE_FULL_SCREEN, {
                  userInfo: {
                    from_user: fromUser._id,
                    to_user: toUser._id,
                  },
                  isMaximized: !isMaximized,
                });
              }}
            >
              {isMaximized ? <Minimize size={18} /> : <Maximize size={18} />}
            </div>

            {isMaximized && (
              <div className="button aperture ml-1" onClick={takeScreenshot}>
                <Aperture size={16} />
              </div>
            )}

            {isMaximized && (
              <div
                className="button video-lock  ml-1"
                onClick={() => {
                  socket.emit(EVENTS.TOGGLE_LOCK_MODE, {
                    userInfo: { from_user: fromUser._id, to_user: toUser._id },
                    isLockMode: !isLock,
                  });
                  setIsLock(!isLock);
                }}
              >
                {isLock ? <FaLock size={16} /> : <FaUnlock size={16} />}
              </div>
            )}

            <div
              style={{
                position: "relative",
              }}
            >
              <div
                className="button ml-1"
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
                    isFullScreen={isMaximized}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {drawingMode && accountType === AccountType.TRAINER  ? (
          <></>
        ) : (
          timeRemaining &&  <TimeRemaining timeRemaining={timeRemaining} />
        )}
      </div>
      <div
        style={{
          display: selectedUser ? "block" : "none",
          position: "relative",
        }}
      >
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
          isLandscape={isLandscape}
          muted={true}
        />
        {selectedUser === toUser._id ? (
          <UserBoxMini
            id={fromUser._id}
            onClick={handleUserClick}
            selected={false}
            videoRef={remoteVideoRef}
            stream={remoteStream}
            user={toUser}
            bottom={300}
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
            bottom={300}
            isStreamOff={isLocalStreamOff}
            muted={true}
          />
        )}

        <VideoMiniBox
          clips={selectedClips}
          id={null}
          bottom={60}
          onClick={handleUserClick}
        />
      </div>
      <div
        style={{
          display: selectedUser ? "none" : "block",
          position: "relative",
        }}
        id="clip-container"
      >
        <NextImage
          src="/assets/images/netquix_logo_beta.png"
          width={100}
          height={40}
          style={{
            objectFit: "contain",
            position: "absolute",
            zIndex: 10,
            top: 0,
            left: 5,
          }}
          unoptimized={true}
        />
        <h4
          style={{
            objectFit: "contain",
            position: "absolute",
            zIndex: 10,
            bottom: 40,
            right: 5,
            color: "black",
          }}
        >
          &copy; NetQwix.com
        </h4>
        {selectedClips.length > 1 ? (
          <>
            <VideoContainer
              drawingMode={drawingMode}
              isLock={isLock}
              index={1}
              isMaximized={isMaximized}
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
              isLandscape={isLandscape}
              videoContainerRef={videoContainerRef}
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
              isMaximized={isMaximized}
              canvasConfigs={canvasConfigs}
              selectedShape={selectedShape}
              sendDrawEvent={sendDrawEvent}
              undoDrawing={undoDrawing}
              isLandscape={isLandscape}
              videoContainerRef={videoContainerRef2}

            />

            {isLock && (
              <CustomVideoControls
                handleSeek={handleSeek}
                isPlaying={isPlayingBoth}
                // toggleFullscreen={toggleFullscreen}
                // toggleMute={toggleMute}
                togglePlayPause={togglePlayPause}
                videoRef={videoRef}
                videoRef2={videoRef2}
                setIsPlaying={setIsPlayingBoth}
                isLock={isLock}
                setCurrentTime={setCurrentTime}
              />
            )}
          </>
        ) : (
          <VideoContainer
            index={1}
            drawingMode={drawingMode}
            canvasRef={canvasRef}
            isMaximized={isMaximized}
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
            isLandscape={isLandscape}
            videoContainerRef={videoContainerRef}
          />
        )}
        {!isMaximized && (
          <>
            <UserBoxMini
              id={fromUser._id}
              zIndex={20}
              bottom={60}
              onClick={handleUserClick}
              selected={false}
              videoRef={remoteVideoRef}
              stream={remoteStream}
              user={toUser}
              isStreamOff={isRemoteStreamOff}
            />
            <UserBoxMini
              id={toUser._id}
              zIndex={10}
              bottom={300}
              onClick={handleUserClick}
              selected={false}
              videoRef={localVideoRef}
              stream={localStream}
              user={fromUser}
              isStreamOff={isLocalStreamOff}
              muted={true}
            />
          </>
        )}
      </div>
    </>
  );
};

export default ClipModeCall;
