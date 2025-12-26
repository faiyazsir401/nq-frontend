import { useRef, useCallback, useEffect } from 'react';
import { EVENTS } from '../../../../helpers/events';
import { AccountType, SHAPES } from '../../../common/constants';
import _debounce from 'lodash/debounce';

/**
 * Custom hook for managing canvas drawing functionality
 * Extracted from video.jsx to improve maintainability
 */
export const useCanvasDrawing = ({
  canvasRef,
  socket,
  fromUser,
  toUser,
  accountType,
  remoteVideoRef,
  videoRef,
  cutCall,
}) => {
  // Canvas drawing state
  let isDrawing = false;
  let savedPos;
  let startPos;
  let currPos;
  let strikes = [];
  let selectedShape = null;

  const canvasConfigs = {
    sender: {
      strokeStyle: 'red',
      lineWidth: 3,
      lineCap: 'round',
    },
    receiver: {
      strokeStyle: 'green',
      lineWidth: 3,
      lineCap: 'round',
    },
  };

  const storedLocalDrawPaths = { sender: [], receiver: [] };

  /**
   * Get mouse position on canvas
   */
  const getMousePositionOnCanvas = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = event?.clientX - rect?.left;
    const y = event?.clientY - rect?.top;
    return { x: x || 0, y: y || 0 };
  }, [canvasRef]);

  /**
   * Get touch position on canvas
   */
  const getTouchPos = useCallback((touchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = touchEvent?.changedTouches[0]?.clientX - rect?.left;
    const y = touchEvent?.changedTouches[0]?.clientY - rect?.top;
    return { x: x || 0, y: y || 0 };
  }, [canvasRef]);

  /**
   * Calculate distance between two points
   */
  const findDistance = useCallback((pos1, pos2) => {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
    );
  }, []);

  /**
   * Draw shapes on canvas
   */
  const drawShapes = useCallback((context, startPos, currPos, shape) => {
    switch (shape) {
      case SHAPES.LINE: {
        context.moveTo(startPos.x, startPos.y);
        context.lineTo(currPos.x, currPos.y);
        break;
      }
      case SHAPES.CIRCLE: {
        const distance = findDistance(startPos, currPos);
        context.arc(startPos.x, startPos.y, distance, 0, 2 * Math.PI, false);
        break;
      }
      case SHAPES.SQUARE:
      case SHAPES.RECTANGLE: {
        const w = currPos.x - startPos.x;
        const h = currPos.y - startPos.y;
        context.rect(startPos.x, startPos.y, w, h);
        break;
      }
      case SHAPES.OVAL: {
        const transform = context.getTransform();
        const w = currPos.x - startPos.x;
        const h = currPos.y - startPos.y;
        context.fillStyle = 'rgba(0, 0, 0, 0)';
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
      default:
        break;
    }
  }, [findDistance]);

  /**
   * Clear canvas
   */
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context || !canvas) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }, [canvasRef]);

  /**
   * Send draw event to socket
   */
  const sendDrawEvent = useCallback(() => {
    const canvas = canvasRef.current;
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
        });
      };
      reader.readAsArrayBuffer(blob);
    });
  }, [canvasRef, socket, fromUser, toUser]);

  /**
   * Send stop drawing event
   */
  const sendStopDrawingEvent = useCallback(() => {
    if (remoteVideoRef && remoteVideoRef.current) {
      socket.emit(EVENTS.STOP_DRAWING, {
        userInfo: { from_user: fromUser._id, to_user: toUser._id },
      });
    }
  }, [socket, fromUser, toUser, remoteVideoRef]);

  /**
   * Send clear canvas event
   */
  const sendClearCanvasEvent = useCallback(() => {
    if (remoteVideoRef && remoteVideoRef.current) {
      socket.emit(EVENTS.EMIT_CLEAR_CANVAS, {
        userInfo: { from_user: fromUser._id, to_user: toUser._id },
      });
    }
  }, [socket, fromUser, toUser, remoteVideoRef]);

  /**
   * Adjust canvas size based on device pixel ratio
   */
  const adjustCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      const context = canvas.getContext('2d');
      context.scale(ratio, ratio);
    }
  }, [canvasRef]);

  /**
   * Initialize canvas drawing event listeners
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const video = videoRef?.current;

    if (!canvas || !context) return;

    adjustCanvasSize();

    const state = { mousedown: false };

    const startDrawing = (event) => {
      event.preventDefault();
      isDrawing = true;
      savedPos = context.getImageData(
        0,
        0,
        document.getElementById('bookings')?.clientWidth || canvas.width,
        document.getElementById('bookings')?.clientHeight || canvas.height
      );
      if (strikes.length >= 10) strikes.shift();
      strikes.push(savedPos);

      const mousePos = event.type.includes('touchstart')
        ? getTouchPos(event)
        : getMousePositionOnCanvas(event);

      context.strokeStyle = canvasConfigs.sender.strokeStyle;
      context.lineWidth = canvasConfigs.sender.lineWidth;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(mousePos.x, mousePos.y);
      context.fill();
      state.mousedown = true;
      startPos = { x: mousePos.x, y: mousePos.y };
    };

    const draw = (event) => {
      event.preventDefault();
      if (!isDrawing || !context || !state.mousedown) return;

      const mousePos = event.type.includes('touchmove')
        ? getTouchPos(event)
        : getMousePositionOnCanvas(event);
      currPos = { x: mousePos?.x, y: mousePos.y };

      if (selectedShape !== SHAPES.FREE_HAND) {
        context.putImageData(savedPos, 0, 0);
        context.beginPath();
        drawShapes(context, startPos, currPos, selectedShape);
        context.stroke();
      } else {
        context.strokeStyle = canvasConfigs.sender.strokeStyle;
        context.lineWidth = canvasConfigs.sender.lineWidth;
        context.lineCap = 'round';
        context.lineTo(mousePos.x, mousePos.y);
        context.stroke();
      }
    };

    const stopDrawing = (event) => {
      event.preventDefault();
      if (state.mousedown) {
        sendStopDrawingEvent();
        isDrawing = false;
        state.mousedown = false;
        sendDrawEvent();
      }
    };

    // Add event listeners for trainer only
    if (canvas && accountType === AccountType.TRAINER) {
      canvas.addEventListener('touchstart', startDrawing, { passive: false });
      canvas.addEventListener('touchmove', draw, { passive: false });
      canvas.addEventListener('touchend', stopDrawing, { passive: false });
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
    }

    return () => {
      if (canvas && accountType === AccountType.TRAINER) {
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
      }
      cutCall();
    };
  }, [
    canvasRef,
    accountType,
    getMousePositionOnCanvas,
    getTouchPos,
    drawShapes,
    sendStopDrawingEvent,
    sendDrawEvent,
    cutCall,
    videoRef,
    adjustCanvasSize,
  ]);

  return {
    clearCanvas,
    sendClearCanvasEvent,
    adjustCanvasSize,
    canvasConfigs,
    storedLocalDrawPaths,
  };
};

