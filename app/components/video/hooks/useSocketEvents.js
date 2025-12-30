import { useEffect, useContext } from 'react';
import { SocketContext } from '../../socket';
import { EVENTS } from '../../../../helpers/events';

/**
 * Custom hook for managing socket events related to video call
 */ 
// Extracted from video.jsx to improve maintainability
export const useSocketEvents = ({
  socket,
  fromUser,
  toUser,
  clearCanvas,
  setRemoteVideoOff,
  canvasRef,
  storedLocalDrawPaths,
  canvasConfigs,
  undoDrawing,
  setDisplayMsg,
  toUserFullname,
  cleanupFunction,
}) => {
  useEffect(() => {
    if (!socket) return;

    // Handle clear canvas event
    const handleClearCanvas = () => {
      clearCanvas();
    };

    // Handle stop feed event
    const handleStopFeed = ({ feedStatus }) => {
      setRemoteVideoOff(feedStatus);
    };

    // Handle drawing coordinates
    const handleDrawingCoords = ({ strikes, canvasSize }) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
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
    };

    // Handle undo event
    const handleUndo = ({ sender, receiver }) => {
      storedLocalDrawPaths.receiver = [];
      storedLocalDrawPaths.sender = [];
      storedLocalDrawPaths.sender = receiver;
      storedLocalDrawPaths.receiver = sender;
      undoDrawing(
        { coordinates: sender, theme: canvasConfigs.receiver },
        {
          coordinates: receiver,
          theme: {
            lineWidth: canvasConfigs.sender.lineWidth,
            strokeStyle: canvasConfigs.sender.strokeStyle,
          },
        },
        false
      );
    };

    // Handle call close event
    const handleCallClose = () => {
      setDisplayMsg({
        showMsg: true,
        msg: `${toUserFullname} left the meeting, redirecting back to home screen in 5 seconds...`,
      });
      cleanupFunction();
    };

    // Register event listeners
    socket.on(EVENTS.ON_CLEAR_CANVAS, handleClearCanvas);
    socket.on(EVENTS.VIDEO_CALL.STOP_FEED, handleStopFeed);
    socket.on(EVENTS.EMIT_DRAWING_CORDS, handleDrawingCoords);
    socket.on(EVENTS.ON_UNDO, handleUndo);
    socket.on(EVENTS.VIDEO_CALL.ON_CLOSE, handleCallClose);

    // Cleanup
    return () => {
      socket.off(EVENTS.ON_CLEAR_CANVAS, handleClearCanvas);
      socket.off(EVENTS.VIDEO_CALL.STOP_FEED, handleStopFeed);
      socket.off(EVENTS.EMIT_DRAWING_CORDS, handleDrawingCoords);
      socket.off(EVENTS.ON_UNDO, handleUndo);
      socket.off(EVENTS.VIDEO_CALL.ON_CLOSE, handleCallClose);
    };
  }, [
    socket,
    clearCanvas,
    setRemoteVideoOff,
    canvasRef,
    storedLocalDrawPaths,
    canvasConfigs,
    undoDrawing,
    setDisplayMsg,
    toUserFullname,
    cleanupFunction,
  ]);
};

