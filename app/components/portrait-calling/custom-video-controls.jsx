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
  lockPoint
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
        videoRef.current.removeEventListener("timeupdate", handleUpdate);
      }
    };
  }, [videoRef, setIsPlaying, setCurrentTime]);

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
        visibility:accountType === AccountType.TRAINER ?"visible":"hidden", 
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
            {(() => {
              const formatSecondsToLabel = (seconds) => {
                if (typeof seconds !== "number" || Number.isNaN(seconds) || seconds < 0) {
                  return "--:--";
                }
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                const mm = String(mins).padStart(2, "0");
                const ss = String(secs).padStart(2, "0");
                return `${mm}:${ss}`;
              };

              const currentValue = isLock
                ? Math.max(
                    (videoRef.current?.duration || 0) >
                    (videoRef2?.current?.duration || 0)
                  ? videoRef.current?.currentTime || 0
                      : videoRef2?.current?.currentTime || 0,
                    lockPoint
                  )
                : videoRef.current?.currentTime || 0;
              
              const maxValue = isLock
                ? Math.max(
                    videoRef.current?.duration || 0,
                    videoRef2?.current?.duration || 0
                  )
                : videoRef.current?.duration || 0 || 100;
              
              // Calculate the relative progress for background styling
              let relativeProgress = 0;
              if (maxValue > 0) {
                if (isLock) {
                  const denom = Math.max(0.0001, maxValue - lockPoint);
                  relativeProgress = ((currentValue - lockPoint) / denom) * 100;
                } else {
                  relativeProgress = (currentValue / maxValue) * 100;
                }
              }
               
              return (
                <>
                <input
                  type="range"
                  min={isLock ? lockPoint : 0}
                  step="0.01"
                  disabled={accountType === AccountType.TRAINEE}
                  value={currentValue}
                  max={maxValue}
                  onChange={handleSeek}
                  style={{
                    flex: 1,
                    cursor: "pointer",
                    height: "5px",
                    appearance: "none",
                    background: `linear-gradient(to right, #2566e8 ${relativeProgress}%, #ccc 0%)`,
                    borderRadius: "5px",
                    outline: "none",
                    transition: "background 0.3s ease",
                  }}
                />
                  {isLock && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 12,
                        color: "#e5e5e5",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Locked from {formatSecondsToLabel(lockPoint)}
                    </span>
                  )}
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomVideoControls;
