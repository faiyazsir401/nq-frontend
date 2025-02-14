import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaVolumeDown,
  FaChevronDown,
  FaChevronUp,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";

const CustomVideoControls = ({
  isPlaying,
  togglePlayPause,
  volume,
  changeVolume,
  videoRef,
  handleSeek,
  handleSeekMouseDown,
  handleSeekMouseUp,
  isFullscreen,
  toggleFullscreen,
  setIsPlaying,
}) => {
  const [showVolume, setShowVolume] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  console.log("volume", volume);
  useEffect(() => {
    const handleEnded = () => setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.addEventListener("ended", handleEnded);
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("ended", handleEnded);
      }
    };
  }, [videoRef]);

  const GetVolumeIcon = () => {
    if (volume === 0) return <FaVolumeMute />;
    if (volume < 0.6) return <FaVolumeDown />;
    return <FaVolumeUp />;
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "Center",
        justifyContent: "center",
        gap: "5px",
      }}
    >
      {/* Toggle Controls Button */}

      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="custom-controls"
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              padding: "10px 15px",
              borderRadius: "12px",

              gap: "12px",
            }}
          >
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "22px",
                cursor: "pointer",
              }}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            {/* Volume Control */}
            {/* <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowVolume(!showVolume)}
                    style={{ background: "none", border: "none", color: "white", fontSize: "22px", cursor: "pointer" }}
                  >
                    {<GetVolumeIcon />}
                  </button>
                  {showVolume && (
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={changeVolume}
                      style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        bottom: "40px",
                        width: "100px",
                        cursor: "pointer",
                      }}
                    />
                  )}
                </div> */}

            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              step="0.01"
              value={videoRef.current?.currentTime || 0}
              max={videoRef.current?.duration || 100}
              onChange={handleSeek}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              style={{ flex: 1, cursor: "pointer", height: "5px" }}
            />

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "22px",
                cursor: "pointer",
              }}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setControlsVisible(!controlsVisible)}
        style={{
          background: "none",
          border: "none",
          color: "black",
          fontSize: "22px",
          cursor: "pointer",
          marginBottom: "5px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          //   border:"2px solid black",
          backgroundColor: "white",
          aspectRatio: "1",
          borderRadius: 99,
        }}
      >
        {controlsVisible ? <FaChevronDown /> : <FaChevronUp />}
      </button>
    </div>
  );
};

export default CustomVideoControls;
