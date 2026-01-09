import React from "react";
import "./CenterMessage.scss";

/**
 * Reusable center-aligned message component for consistent UX across video call components
 */
export const CenterMessage = ({
  message,
  type = "info", // 'info', 'waiting', 'error', 'success', 'warning'
  icon,
  showSpinner = false,
  className = "",
  style = {},
}) => {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case "waiting":
        return <i className="fa fa-clock-o" aria-hidden="true"></i>;
      case "error":
        return <i className="fa fa-exclamation-circle" aria-hidden="true"></i>;
      case "success":
        return <i className="fa fa-check-circle" aria-hidden="true"></i>;
      case "warning":
        return <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>;
      default:
        return <i className="fa fa-info-circle" aria-hidden="true"></i>;
    }
  };

  if (!message) return null;

  return (
    <div
      className={`center-message center-message--${type} ${className}`}
      style={style}
      role="alert"
      aria-live="polite"
    >
      <div className="center-message__container">
        {showSpinner && (
          <div className="center-message__spinner">
            <div className="spinner"></div>
          </div>
        )}
        {!showSpinner && (
          <div className="center-message__icon">{getIcon()}</div>
        )}
        <div className="center-message__text">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default CenterMessage;

