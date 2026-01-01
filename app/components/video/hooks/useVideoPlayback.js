import { useState, useCallback } from 'react';
import { useContext } from 'react';
import { SocketContext } from '../../socket';
import { EVENTS } from '../../../../helpers/events';

/**
 * Custom hook for managing video playback controls
 */
export const useVideoPlayback = ({
  selectedVideoRef1,
  selectedVideoRef2,
  fromUser,
  toUser,
  showThumbnailForFirstVideo,
  showThumbnailForTwoVideo,
  setShowThumbnailForFirstVideo,
  setShowThumbnailForTwoVideo,
  isPlaying,
  setIsPlaying,
  videoController,
  setVideoTime,
  formatTime,
}) => {
  const socket = useContext(SocketContext);

  /**
   * Toggle play/pause for videos
   */
  const togglePlay = useCallback(
    (num) => {
      if (num === 'one' && showThumbnailForFirstVideo) {
        setShowThumbnailForFirstVideo(false);
      }

      if (num === 'two' && showThumbnailForTwoVideo) {
        setShowThumbnailForTwoVideo(false);
      }

      if (num === 'all') {
        setShowThumbnailForFirstVideo(false);
        setShowThumbnailForTwoVideo(false);
      }

      if (selectedVideoRef1.current && selectedVideoRef2.current) {
        if (
          selectedVideoRef1.current.currentTime ===
            selectedVideoRef1.current.duration &&
          selectedVideoRef2.current.currentTime ===
            selectedVideoRef2.current.duration
        ) {
          selectedVideoRef1.current.currentTime = 0;
          selectedVideoRef2.current.currentTime = 0;
          emitVideoTimeEvent(0, 'one');
          emitVideoTimeEvent(0, 'two');
        }
      }

      const updatedPlayingState = { ...isPlaying };
      const toggleAll = num === 'all';

      if (toggleAll) {
        updatedPlayingState.isPlayingAll = !isPlaying.isPlayingAll;

        if (updatedPlayingState.isPlayingAll) {
          selectedVideoRef1.current?.play();
          selectedVideoRef2.current?.play();
        } else {
          selectedVideoRef1.current?.pause();
          selectedVideoRef2.current?.pause();
        }
      } else {
        const videoRef = num === 'one' ? selectedVideoRef1 : selectedVideoRef2;
        const isPlayingKey = num === 'one' ? 'isPlaying1' : 'isPlaying2';
        const isPlayingValue = updatedPlayingState[isPlayingKey];

        if (isPlayingValue) {
          videoRef.current?.pause();
        } else {
          videoRef.current?.play();
        }
        updatedPlayingState[isPlayingKey] = !isPlayingValue;
      }
      updatedPlayingState.number = num;

      socket?.emit(EVENTS?.ON_VIDEO_PLAY_PAUSE, {
        userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
        ...updatedPlayingState,
      });

      setIsPlaying(updatedPlayingState);
    },
    [
      showThumbnailForFirstVideo,
      showThumbnailForTwoVideo,
      setShowThumbnailForFirstVideo,
      setShowThumbnailForTwoVideo,
      selectedVideoRef1,
      selectedVideoRef2,
      isPlaying,
      socket,
      fromUser,
      toUser,
    ]
  );

  /**
   * Emit video time event
   */
  const emitVideoTimeEvent = useCallback(
    (clickedTime, number) => {
      socket?.emit(EVENTS.ON_VIDEO_TIME, {
        userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
        clickedTime,
        number,
      });
    },
    [socket, fromUser, toUser]
  );

  /**
   * Handle time update for videos
   */
  const handleTimeUpdate = useCallback(
    (videoRef, progressBarRef, number) => {
      if (!videoRef.current) return;

      if (progressBarRef?.current) {
        progressBarRef.current.value = videoRef.current.currentTime || 0;
      }

      if (videoRef.current.duration === videoRef.current.currentTime) {
        videoRef.current.currentTime = 0;
        if (videoController) {
          const updatedPlayingState = { ...isPlaying };
          const isPlayingValue = updatedPlayingState.isPlayingAll;
          updatedPlayingState.isPlayingAll = !isPlayingValue;
          setIsPlaying(updatedPlayingState);
        } else {
          const num = number === 1 ? 'one' : 'two';
          const isPlayingKey = num === 'one' ? 'isPlaying1' : 'isPlaying2';
          const updatedPlayingState = { ...isPlaying };
          const isPlayingValue = updatedPlayingState[isPlayingKey];
          updatedPlayingState[isPlayingKey] = !isPlayingValue;
          setIsPlaying(updatedPlayingState);
        }
      }

      const remainingTime = videoRef.current.duration - videoRef.current.currentTime;

      setVideoTime((prevVideoTime) => ({
        ...prevVideoTime,
        [`currentTime${number}`]: formatTime(videoRef.current.currentTime),
        [`remainingTime${number}`]: formatTime(remainingTime),
      }));
    },
    [videoController, isPlaying, setIsPlaying, setVideoTime, formatTime]
  );

  /**
   * Handle progress bar change
   */
  const handleProgressBarChange = useCallback(
    (e, number) => {
      const clickedTime = e.target.value;
      const videoRef = number === 'one' ? selectedVideoRef1 : selectedVideoRef2;
      if (videoRef.current) {
        videoRef.current.currentTime = clickedTime;

        socket?.emit(EVENTS?.ON_VIDEO_TIME, {
          userInfo: { from_user: fromUser?._id, to_user: toUser?._id },
          clickedTime,
          number,
        });
      }
    },
    [selectedVideoRef1, selectedVideoRef2, socket, fromUser, toUser]
  );

  /**
   * Handle global progress bar change
   */
  const handleGlobalProgressBarChange = useCallback(
    (e) => {
      const { value } = e.target;

      const maxTime = Math.max(
        selectedVideoRef1.current?.duration || 0,
        selectedVideoRef2.current?.duration || 0
      );

      const bothVideosEnded =
        selectedVideoRef1.current?.currentTime ===
          selectedVideoRef1.current?.duration &&
        selectedVideoRef2.current?.currentTime === selectedVideoRef2.current?.duration;

      if (bothVideosEnded) {
        selectedVideoRef1.current.pause();
        selectedVideoRef2.current.pause();
        setIsPlaying({
          isPlayingAll: false,
          number: '',
          isPlaying1: false,
          isPlaying2: false,
        });
        setVideoTime({
          currentTime1: '00:00',
          currentTime2: '00:00',
          remainingTime1: '00:00',
          remainingTime2: '00:00',
        });
        return;
      }

      if (selectedVideoRef1.current) {
        selectedVideoRef1.current.currentTime = value;
        emitVideoTimeEvent(value, 'one');
      }

      if (selectedVideoRef2.current) {
        selectedVideoRef2.current.currentTime = value;
        emitVideoTimeEvent(value, 'two');
      }

      if (!value) {
        setIsPlaying({ ...isPlaying, isPlayingAll: false });
      }
    },
    [
      selectedVideoRef1,
      selectedVideoRef2,
      setIsPlaying,
      setVideoTime,
      emitVideoTimeEvent,
      isPlaying,
    ]
  );

  return {
    togglePlay,
    emitVideoTimeEvent,
    handleTimeUpdate,
    handleProgressBarChange,
    handleGlobalProgressBarChange,
  };
};

