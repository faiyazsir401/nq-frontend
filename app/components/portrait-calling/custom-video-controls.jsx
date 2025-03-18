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
  videoRef2,
  handleSeek,
  handleSeekMouseDown,
  handleSeekMouseUp,
  isFullscreen,
  toggleFullscreen,
  setIsPlaying,
  isLock,
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
        position: "relative",
        bottom: "0px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "Center",
        justifyContent: "center",
        gap: "5px",
        width: "100%",
      }}
      className="hide-in-screenshot"
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
              disabled={accountType === AccountType.TRAINEE}
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
            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              step="0.01"
              disabled={accountType === AccountType.TRAINEE}
              value={
                isLock
                  ? (videoRef.current?.duration || 0) > (videoRef2.current?.duration || 0)
                    ? videoRef.current?.currentTime || 0
                    : videoRef2.current?.currentTime || 0
                  : videoRef.current?.currentTime || 0
              }
              max={
                isLock
                  ? Math.max(videoRef.current?.duration || 0, videoRef2.current?.duration || 0)
                  : videoRef.current?.duration || 100
              }
              onChange={handleSeek}
              style={{
                flex: 1,
                cursor: "pointer",
                height: "5px",
                appearance: "none",
                background: `linear-gradient(to right, #2566e8 ${((
                    isLock
                      ? (videoRef.current?.duration || 0) > (videoRef2.current?.duration || 0)
                        ? videoRef.current?.currentTime || 0
                        : videoRef2.current?.currentTime || 0
                      : videoRef.current?.currentTime || 0
                  ) /
                    (isLock
                      ? Math.max(videoRef.current?.duration || 0, videoRef2.current?.duration || 0)
                      : videoRef.current?.duration || 100)) *
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
    </div>
  );
};

export default CustomVideoControls;
