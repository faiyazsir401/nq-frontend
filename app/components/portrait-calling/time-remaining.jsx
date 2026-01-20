import { useEffect, useMemo, useRef, useState } from "react";
import Timer from "../video/Timer";

const FIVE_MINUTES_IN_SECONDS = 5 * 60;
const THIRTY_SECONDS_IN_SECONDS = 30;

const TimeRemaining = ({ timeRemaining, bothUsersJoined = false }) => {
  const [timerColor, setTimerColor] = useState("#28a745"); // default green
  const [showFiveMinPopup, setShowFiveMinPopup] = useState(false);
  const [showThirtySecPopup, setShowThirtySecPopup] = useState(false);

  const lastRemainingSecondsRef = useRef(null);
  const fiveMinTimeoutRef = useRef(null);
  const thirtySecTimeoutRef = useRef(null);

  // Use existing Timer logic for the displayed label
  const displayTime = useMemo(
    () => Timer(timeRemaining, bothUsersJoined),
    [timeRemaining, bothUsersJoined]
  );

  // Derive remaining seconds from the provided HH:MM end time
  useEffect(() => {
    // Clear any active timeouts when dependencies change
    if (fiveMinTimeoutRef.current) {
      clearTimeout(fiveMinTimeoutRef.current);
      fiveMinTimeoutRef.current = null;
    }
    if (thirtySecTimeoutRef.current) {
      clearTimeout(thirtySecTimeoutRef.current);
      thirtySecTimeoutRef.current = null;
    }

    // Reset popups when we get a fresh time or users are not joined
    setShowFiveMinPopup(false);
    setShowThirtySecPopup(false);
    lastRemainingSecondsRef.current = null;

    if (!bothUsersJoined) {
      setTimerColor("#6c757d"); // muted grey while waiting
      return;
    }

    if (typeof timeRemaining !== "string" || !timeRemaining.includes(":")) {
      return;
    }

    const [endHours, endMinutes] = timeRemaining.split(":").map(Number);
    if (
      Number.isNaN(endHours) ||
      Number.isNaN(endMinutes) ||
      endHours < 0 ||
      endHours > 23 ||
      endMinutes < 0 ||
      endMinutes > 59
    ) {
      return;
    }

    const now = new Date();
    const endTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      endHours,
      endMinutes
    );

    const updateFromNow = () => {
      const current = new Date();
      const diffMs = endTime - current;
      const remainingSeconds = Math.max(
        0,
        Math.floor(diffMs / 1000)
      );

      // Dynamic color based on remaining time
      if (remainingSeconds > FIVE_MINUTES_IN_SECONDS) {
        setTimerColor("#28a745"); // green
      } else if (remainingSeconds > 60) {
        setTimerColor("#ff9800"); // orange
      } else {
        setTimerColor("#f44336"); // red
      }

      const previous = lastRemainingSecondsRef.current;
      lastRemainingSecondsRef.current = remainingSeconds;

      // Trigger "5 minutes left" popup once when crossing 5 minutes
      if (
        previous != null &&
        previous > FIVE_MINUTES_IN_SECONDS &&
        remainingSeconds <= FIVE_MINUTES_IN_SECONDS &&
        remainingSeconds > 0
      ) {
        setShowFiveMinPopup(true);
        if (fiveMinTimeoutRef.current) {
          clearTimeout(fiveMinTimeoutRef.current);
        }
        fiveMinTimeoutRef.current = setTimeout(() => {
          setShowFiveMinPopup(false);
          fiveMinTimeoutRef.current = null;
        }, 5000);
      }

      // Trigger "30 seconds left" popup once when crossing 30 seconds
      if (
        previous != null &&
        previous > THIRTY_SECONDS_IN_SECONDS &&
        remainingSeconds <= THIRTY_SECONDS_IN_SECONDS &&
        remainingSeconds > 0
      ) {
        setShowThirtySecPopup(true);
        if (thirtySecTimeoutRef.current) {
          clearTimeout(thirtySecTimeoutRef.current);
        }
        thirtySecTimeoutRef.current = setTimeout(() => {
          setShowThirtySecPopup(false);
          thirtySecTimeoutRef.current = null;
        }, 5000);
      }
    };

    // Initial update and interval
    updateFromNow();
    const intervalId = setInterval(updateFromNow, 1000);

    return () => {
      clearInterval(intervalId);
      if (fiveMinTimeoutRef.current) {
        clearTimeout(fiveMinTimeoutRef.current);
        fiveMinTimeoutRef.current = null;
      }
      if (thirtySecTimeoutRef.current) {
        clearTimeout(thirtySecTimeoutRef.current);
        thirtySecTimeoutRef.current = null;
      }
    };
  }, [timeRemaining, bothUsersJoined]);

  return (
    <>
      <div className="time-container">
        <h3 className="label">Time remaining:</h3>
        <h3 className="value" style={{ color: timerColor }}>
          {displayTime}
        </h3>
      </div>

      {showFiveMinPopup && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1e88e5",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 2000,
            fontSize: "14px",
          }}
        >
          <span>Only 5 minutes left in this session.</span>
          <button
            type="button"
            onClick={() => setShowFiveMinPopup(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "16px",
              lineHeight: 1,
            }}
            aria-label="Close 5-minute warning"
          >
            ×
          </button>
        </div>
      )}

      {showThirtySecPopup && (
        <div
          style={{
            position: "fixed",
            bottom: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#f44336",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 2000,
            fontSize: "14px",
          }}
        >
          <span>Session ending in about 30 seconds.</span>
          <button
            type="button"
            onClick={() => setShowThirtySecPopup(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "16px",
              lineHeight: 1,
            }}
            aria-label="Close 30-second warning"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default TimeRemaining;
