import socketio from 'socket.io-client';
import {createContext, useEffect, useState} from 'react';
import {useAppSelector} from '../../store';
import {authState} from '../auth/auth.slice';
import { LOCAL_STORAGE_KEYS } from '../../common/constants';
const URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const getSocket = () => {
  const [socket, setSocket] = useState (null);
  const {authToken} = useAppSelector (authState);

  useEffect (
    () => {
      let token = localStorage.getItem (LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
      if (authToken) {
        token = authToken;
      }
      setSocket (
        socketio.connect (URL, {
          // withCredentials: true,
          query: {authorization: token, autoConnect: false},
        })
      );
    },
    [authToken]
  );

  return socket;
};

export const SocketContext = createContext ();
