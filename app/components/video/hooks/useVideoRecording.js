import { useState, useRef, useCallback } from 'react';
import { SocketContext } from '../../socket';
import { useContext } from 'react';

/**
 * Custom hook for managing video recording functionality
 */
export const useVideoRecording = ({
  id,
  fromUser,
  toUser,
  remoteStream,
  setScreenStream,
  setMicStream,
}) => {
  const socket = useContext(SocketContext);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [screenStream, setScreenStreamLocal] = useState(null);
  const [micStream, setMicStreamLocal] = useState(null);

  /**
   * Setup audio mixing for recording
   */
  const setupAudioMixing = useCallback(async () => {
    const audioContext = new AudioContext();

    // Get local audio track
    const localAudioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    setMicStreamLocal(localAudioStream);
    setMicStream(localAudioStream);
    const localAudioTrack = localAudioStream.getAudioTracks()[0];

    // Get remote audio track if available
    let remoteAudioTrack;
    if (remoteStream && remoteStream.getAudioTracks().length > 0) {
      remoteAudioTrack = remoteStream.getAudioTracks()[0];
    }

    // Create audio nodes
    const localSource = audioContext.createMediaStreamSource(
      new MediaStream([localAudioTrack])
    );
    const destination = audioContext.createMediaStreamDestination();
    localSource.connect(destination);

    if (remoteAudioTrack) {
      const remoteSource = audioContext.createMediaStreamSource(
        new MediaStream([remoteAudioTrack])
      );
      remoteSource.connect(destination);
    }

    return destination.stream;
  }, [remoteStream, setMicStream]);

  /**
   * Start recording
   */
  const startRecording = useCallback(async () => {
    setRecording(true);

    const data = {
      sessions: id,
      trainer: toUser?._id,
      trainee: fromUser?._id,
      user_id: fromUser?._id,
      trainee_name: fromUser?.fullname,
      trainer_name: toUser?.fullname,
    };

    socket.emit('videoUploadData', data);

    const mixedAudioStream = await setupAudioMixing();

    const screenStr = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      preferCurrentTab: true,
    });
    setScreenStreamLocal(screenStr);
    setScreenStream(screenStr);

    const screenVideoTrack = screenStr.getVideoTracks()[0];

    const combinedStream = new MediaStream([
      screenVideoTrack,
      ...mixedAudioStream.getAudioTracks(),
    ]);

    const mediaRecorder = new MediaRecorder(combinedStream);
    let chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    const intervalId = setInterval(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.requestData();

        const chunkBuffers = chunks
          .map((chunk) => (chunk ? chunk : null))
          .filter(Boolean);

        if (chunkBuffers.length > 0) {
          const chunkData = { data: chunkBuffers };
          socket.emit('chunk', chunkData);
        }

        chunks = [];
      }
    }, 1000);

    mediaRecorder.onstop = () => {
      clearInterval(intervalId);
      socket.emit('chunksCompleted');
    };

    mediaRecorder.start();
    setMediaRecorder(mediaRecorder);
  }, [
    id,
    fromUser,
    toUser,
    socket,
    setupAudioMixing,
    setScreenStream,
    setMicStream,
  ]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStreamLocal(null);
      setScreenStream(null);
    }
  }, [mediaRecorder, screenStream, setScreenStream]);

  /**
   * Handle tab close/offline
   */
  const handleOffline = useCallback(() => {
    stopRecording();
    socket.emit('chunksCompleted');
  }, [stopRecording, socket]);

  return {
    recording,
    mediaRecorder,
    startRecording,
    stopRecording,
    handleOffline,
  };
};
