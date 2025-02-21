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
import { useAppSelector } from "../../store";
import { authState } from "../auth/auth.slice";
import { AccountType } from "../../common/constants";

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
  isFixed,
  currentTime,
  setCurrentTime,
}) => {
    const { accountType } = useAppSelector(authState);
  const [showVolume, setShowVolume] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  useEffect(() => {
    const handleEnded = () => setIsPlaying(false);
    const handleUpdate = () => setCurrentTime(videoRef?.current?.currentTime);
    if (videoRef?.current) {
      videoRef.current.addEventListener("ended", handleEnded);
      videoRef.current.addEventListener("timeupdate", handleUpdate);
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("ended", handleEnded);
        videoRef.current.addEventListener("timeupdate", handleUpdate);
      }
    };
  }, [videoRef]);

  //   const GetVolumeIcon = () => {
  //     if (volume === 0) return <FaVolumeMute />;
  //     if (volume < 0.6) return <FaVolumeDown />;
  //     return <FaVolumeUp />;
  //   };

  return (
    <div
      style={{
        position: isFixed ? "relative" : "absolute",
        bottom: isFixed ? "0px" : "10px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "Center",
        justifyContent: "center",
        gap: "5px",
        width: "100%",
        visibility:accountType === AccountType.TRAINEE?"hidden":"visible"
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
              padding: "5px 15px",
              width: "100%",
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
                fontSize: "16px",
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
              style={{
                flex: 1,
                cursor: "pointer",
                height: "5px",
                appearance: "none",
                background: `linear-gradient(to right, #2566e8 ${
                  ((videoRef.current?.currentTime || 0) /
                    (videoRef.current?.duration || 100)) *
                  100
                }%, #ccc 0%)`,
                borderRadius: "5px",
                outline: "none",
                transition: "background 0.3s ease",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {!isFixed && (
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
      )}
    </div>
  );
};

export default CustomVideoControls;
