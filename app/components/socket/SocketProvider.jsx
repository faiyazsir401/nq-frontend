import React, { createContext, useEffect, useState, useRef } from "react";
import socketio from "socket.io-client";
import { useAppSelector } from "../../store";
import { authState } from "../auth/auth.slice";
import { LOCAL_STORAGE_KEYS } from "../../common/constants";
import { setupMockInstantLesson } from "../instant-lesson/mockInstantLesson";

const URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { authToken } = useAppSelector(authState);
  const socketRef = useRef(null);

  useEffect(() => {
    let token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    if (authToken) {
      token = authToken;
    }

    if (!token) {
      // Disconnect existing socket if token is removed
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    // Guard: Prevent socket connection if URL is missing
    if (!URL) {
      console.error('[SOCKET ERROR] Cannot connect socket: NEXT_PUBLIC_API_BASE_URL is undefined');
      return;
    }

    // Only create new socket if we don't have one or if token changed
    const currentToken = socketRef.current?.io?.opts?.query?.authorization;
    if (socketRef.current && currentToken === token && socketRef.current.connected) {
      // Socket already exists and is connected with same token, no need to recreate
      return;
    }

    // Disconnect existing socket before creating new one
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const newSocket = socketio.connect(URL, {
      query: { authorization: token, autoConnect: true },
      // Prefer websocket transport to reduce polling requests
      transports: ['websocket', 'polling'],
      // Reduce reconnection attempts and delays
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // Timeout for connection attempts
      timeout: 20000,
      // Force new connection to avoid stale connections
      forceNew: false,
    });

    // Add error handling to suppress console errors
    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      // Set socket to null on connection failure so components know it's unavailable
      setSocket(null);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('[Socket] Reconnection error:', error.message);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed after all attempts');
      setSocket(null);
    });

    newSocket.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket] Connected successfully');
      }
    });

    newSocket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket] Disconnected:', reason);
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Set up mock function for testing (only in development)
    if (process.env.NODE_ENV === "development") {
      setupMockInstantLesson(newSocket);
    }

    // Cleanup on unmount or token change
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [authToken]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// Keep the old getSocket function for backward compatibility
export const getSocket = () => {
  // This is a placeholder - components should use SocketContext instead
  return null;
};

