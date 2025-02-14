import { useState } from "react";
import { ChevronDown, Maximize, Minimize, PenTool } from "react-feather";
import { CanvasMenuBar } from "../video/canvas.menubar";
import VideoContainer from "./video-container";
import { UserBoxMini } from "./user-box";
import TimeRemaining from "./time-remaining";
import { useRef } from "react";
import CustomVideoControls from "./custom-video-controls";

const ClipModeCall = ({
  timeRemaining,
  isMaximized,
  setIsMaximized,
  selectedClips,
  setSelectedClips,
  isLock
}) => {
  const [drawingMode, setDrawingMode] = useState(false);
  const [showDrawingTools, setShowDrawingTools] = useState(false);

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
    console.log("progress",progress)
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
      // socket.emit(EVENTS.EMIT_UNDO, { ... });
      // sendEmitUndoEvent();
    }
  };

  function resetInitialPinnedUser() {}
  const isSingle= selectedClips?.length ===1;
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
                  isPlaying={isLock?isPlayingBoth:isPlaying1}
                  setIsPlaying={isLock?setIsPlayingBoth:setIsPlaying1}
                />
                <VideoContainer
                  drawingMode={drawingMode}
                  isMaximized
                  isLock={isLock}
                  index={2}
                  canvasRef={canvasRef2}
                  videoRef={videoRef2}
                  clip={selectedClips[1]}
                  isPlaying={isLock?isPlayingBoth:isPlaying2}
                  setIsPlaying={isLock?setIsPlayingBoth:setIsPlaying2}
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
              />
            )}
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
                  isPlaying={isLock?isPlayingBoth:isPlaying1}
                  setIsPlaying={isLock?setIsPlayingBoth:setIsPlaying1}
                />
                <VideoContainer
                  drawingMode={drawingMode}
              
                  isLock={isLock}
                  index={2}
                  canvasRef={canvasRef2}
                  videoRef={videoRef2}
                  clip={selectedClips[1]}
                  isPlaying={isLock?isPlayingBoth:isPlaying2}
                  setIsPlaying={isLock?setIsPlayingBoth:setIsPlaying2}
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
                canvasRef={canvasRef}
                videoRef={videoRef}
                clip={selectedClips[0]}
                isPlaying={isPlaying1}
                setIsPlaying={setIsPlaying1}
                isSingle={isSingle}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ClipModeCall;
