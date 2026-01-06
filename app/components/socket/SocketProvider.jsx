import React, { createContext, useEffect, useState } from "react";
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

  useEffect(() => {
    let token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    if (authToken) {
      token = authToken;
    }

    if (!token) {
      // Disconnect existing socket if token is removed
      setSocket((prevSocket) => {
        if (prevSocket) {
          prevSocket.disconnect();
        }
        return null;
      });
      return;
    }

    // Guard: Prevent socket connection if URL is missing
    if (!URL) {
      console.error('[SOCKET ERROR] Cannot connect socket: NEXT_PUBLIC_API_BASE_URL is undefined');
      return;
    }

    // Disconnect existing socket before creating new one
    setSocket((prevSocket) => {
      if (prevSocket) {
        prevSocket.disconnect();
      }
      return null;
    });

    const newSocket = socketio.connect(URL, {
      query: { authorization: token, autoConnect: true },
    });

    setSocket(newSocket);

    // Set up mock function for testing (only in development)
    if (process.env.NODE_ENV === "development") {
      setupMockInstantLesson(newSocket);
    }

    // Cleanup on unmount or token change
    return () => {
      if (newSocket) {
        newSocket.disconnect();
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

