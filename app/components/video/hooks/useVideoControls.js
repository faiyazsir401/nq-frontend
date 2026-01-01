import { useState, useCallback } from 'react';
import { EVENTS } from '../../../../helpers/events';

/**
 * Custom hook for managing video call controls (mute, pause, volume, etc.)
 * Extracted from video.jsx to improve maintainability
 */
export const useVideoControls = ({
  localStream,
  micStream,
  socket,
  fromUser,
  toUser,
  accountType,
  selectedClips,
  setIsOpen,
  setIsOpenConfirm,
  setCallEnd,
  cutCall,
  globalProgressBarToggler,
  takeScreenshot,
  setIsTooltipShow,
  videoController,
  setVideoController,
  mediaQuery,
  width1000,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isFeedStopped, setIsFeedStopped] = useState(false);
  const [volume, setVolume] = useState(1);
  const [volume2, setVolume2] = useState(1);

  /**
   * Toggle mute/unmute audio
   */
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
        setIsMuted(!audioTracks[0].enabled);
      }
    }
    if (micStream) {
      const audioTracks = micStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
        setIsMuted(!audioTracks[0].enabled);
      }
    }
  }, [localStream, micStream]);

  /**
   * Toggle video feed on/off
   */
  const toggleVideoFeed = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      socket.emit(EVENTS.VIDEO_CALL.STOP_FEED, {
        userInfo: { from_user: fromUser._id, to_user: toUser._id },
        feedStatus: !isFeedStopped,
      });
      setIsFeedStopped(!isFeedStopped);
    }
  }, [localStream, socket, fromUser, toUser, isFeedStopped]);

  /**
   * End the call
   */
  const handleEndCall = useCallback(() => {
    setCallEnd(true);
    cutCall();
  }, [setCallEnd, cutCall]);

  /**
   * Toggle clip analysis mode
   */
  const toggleClipAnalysis = useCallback(() => {
    if (selectedClips?.length) {
      setIsOpenConfirm(true);
    } else {
      setIsOpen(true);
    }
  }, [selectedClips, setIsOpenConfirm, setIsOpen]);

  /**
   * Toggle video controller lock
   */
  const toggleVideoController = useCallback(() => {
    globalProgressBarToggler();
  }, [globalProgressBarToggler]);

  /**
   * Handle screenshot capture
   */
  const handleScreenshot = useCallback(() => {
    setIsTooltipShow(false);
    setTimeout(() => {
      takeScreenshot();
    }, 30);
  }, [setIsTooltipShow, takeScreenshot]);

  return {
    // State
    isMuted,
    isFeedStopped,
    volume,
    volume2,
    videoController,
    
    // Setters
    setVolume,
    setVolume2,
    setVideoController,
    
    // Actions
    toggleMute,
    toggleVideoFeed,
    handleEndCall,
    toggleClipAnalysis,
    toggleVideoController,
    handleScreenshot,
  };
};

