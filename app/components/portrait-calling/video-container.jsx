import { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { Utils } from "../../../utils/utils";
import CustomVideoControls from "./custom-video-controls";

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

const VideoContainer = ({ drawingMode, isMaximized, canvasRef, clip }) => {
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true); // Track if the video is loading

  const [isPlaying, setIsPlaying] = useState(false); // Track video playback state
  const [volume, setVolume] = useState(1); // Track video volume
  const [isMuted, setIsMuted] = useState(false); // Track mute state
  const [isFullscreen, setIsFullscreen] = useState(false); // Track fullscreen state
  const [currentTime, setCurrentTime] = useState(0); // Track current time of the video
  const [duration, setDuration] = useState(0); // Track video duration
  const [seeking, setSeeking] = useState(false); // Track if the user is seeking

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef?.current;

    if (canvas) {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
    }

    const handleTimeUpdate = () => {
      if (!seeking) {
        setCurrentTime(video.currentTime); // Update current time when video plays
      }
    };

    const handleDurationChange = () => {
      console.log("video.duration", video.duration);
      setDuration(video.duration); // Update video duration when it loads
    };

    if (video) {
      video.addEventListener("timeupdate", handleTimeUpdate); // Listen for time updates
      video.addEventListener("durationchange", handleDurationChange); // Listen for duration changes
    }

    return () => {
      if (video) {
        video.removeEventListener("timeupdate", handleTimeUpdate); // Clean up
        video.removeEventListener("durationchange", handleDurationChange);
      }
    };
  }, [canvasRef, seeking]);

  // Play/pause video
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Handle volume change
  const changeVolume = (e) => {
    const volume = parseFloat(e.target.value);
    const video = videoRef.current;
    if(video){
      video.volume = volume;
      setVolume(volume);
    }
  };

  // Mute/unmute video
  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

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

                {/* Show loading spinner while video is loading */}
                {isLoading && (
          <div className="absolute flex items-center justify-center w-full h-full bg-gray-700 opacity-75 z-10">
            <div className="animate-spin border-4 border-t-4 border-blue-600 rounded-full w-16 h-16"></div>
          </div>
        )}

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
                controls={false} // Hide built-in controls
                ref={videoRef}
                src={Utils?.generateVideoURL(clip)}
                className="w-full h-full object-cover"
                playsInline
                webkit-playsinline="true"
                style={{
                  touchAction: "manipulation",
                }}
                id={clip.id}
                muted={true}
                poster={Utils?.generateThumbnailURL(clip)}
                preload="metadata"
                crossOrigin="anonymous"
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

        <CustomVideoControls
          changeVolume={changeVolume}
          volume={volume}
          handleSeek={handleSeek}
          handleSeekMouseDown={handleSeekMouseDown}
          handleSeekMouseUp={handleSeekMouseUp}
          isFullscreen={isFullscreen}
          isMuted={isMuted}
          isPlaying={isPlaying}
          toggleFullscreen={toggleFullscreen}
          toggleMute={toggleMute}
          togglePlayPause={togglePlayPause}
          videoRef={videoRef}
          setIsPlaying={setIsPlaying}
        />
      </div>
    </>
  );
};

export default VideoContainer;
