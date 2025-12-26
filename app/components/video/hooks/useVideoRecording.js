import { useState, useCallback, useEffect } from 'react';

export const useVideoRecording = ({
  id,
  fromUser,
  toUser,
  socket,
  localStream,
  screenStream,
  setScreenStream,
  setupAudioMixing,
}) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  /**
   * Start recording the video call
   */
  const startRecording = useCallback(async () => {
    try {
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
      setScreenStream(screenStr);

      const screenVideoTrack = screenStr.getVideoTracks()[0];

      const combinedStream = new MediaStream([
        screenVideoTrack,
        ...mixedAudioStream.getAudioTracks(),
      ]);

      const recorder = new MediaRecorder(combinedStream);
      let chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      const intervalId = setInterval(() => {
        if (recorder.state === 'recording') {
          recorder.requestData();

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

      recorder.onstop = () => {
        clearInterval(intervalId);
        socket.emit('chunksCompleted');
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecording(false);
    }
  }, [
    id,
    fromUser,
    toUser,
    socket,
    setupAudioMixing,
    setScreenStream,
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
      setScreenStream(null);
    }
  }, [mediaRecorder, screenStream, setScreenStream]);

  /**
   * Handle tab close - stop recording
   */
  const handleTabClose = useCallback(() => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setRecording(false);
    socket.emit('chunksCompleted');
  }, [mediaRecorder, socket]);

  /**
   * Handle user going offline
   */
  const handleOffline = useCallback(() => {
    stopRecording();
    socket.emit('chunksCompleted');
  }, [stopRecording, socket]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaRecorder, screenStream]);

  return {
    // State
    recording,
    mediaRecorder,
    recordedChunks,

    // Actions
    startRecording,
    stopRecording,
    handleTabClose,
    handleOffline,
  };
};

