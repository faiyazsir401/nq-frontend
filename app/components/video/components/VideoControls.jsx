import React from 'react';
import { Tooltip } from 'react-tippy';
import {
  MicOff,
  PauseCircle,
  Phone,
  PlayCircle,
  ExternalLink,
  Aperture,
} from 'react-feather';
import { FaLock, FaUnlock } from 'react-icons/fa';
import { AccountType } from '../../../common/constants';

/**
 * VideoControls Component
 * Extracted from video.jsx to improve maintainability
 * Handles all video call control buttons
 */
const VideoControls = ({
  isMuted,
  isFeedStopped,
  videoController,
  accountType,
  selectedClips,
  displayMsg,
  mediaQuery,
  width1000,
  onToggleMute,
  onToggleVideoFeed,
  onEndCall,
  onToggleClipAnalysis,
  onToggleVideoController,
  onScreenshot,
}) => {
  return (
    <div className="call-action-buttons z-50 my-3">
      {/* Mute/Unmute Button */}
      <Tooltip
        title={isMuted ? 'Unmute' : 'Mute'}
        position="bottom"
        trigger="mouseenter"
      >
        <div
          className={`icon-btn ${isMuted ? 'btn-danger' : 'btn-light'} ${
            mediaQuery.matches ? 'btn-xl' : 'btn-sm'
          } button-effect mic`}
          style={{ height: '4vw', width: '4vw' }}
          onClick={onToggleMute}
        >
          <MicOff />
        </div>
      </Tooltip>

      {/* Video Play/Pause Button */}
      <Tooltip
        title={isFeedStopped ? 'Video Play' : 'Video Pause'}
        position="bottom"
        trigger="mouseenter"
      >
        <div
          className={`icon-btn btn-light button-effect ${
            mediaQuery.matches ? 'btn-xl' : 'btn-sm'
          } ml-3`}
          style={{ height: '4vw', width: '4vw' }}
          onClick={onToggleVideoFeed}
        >
          {!isFeedStopped ? <PauseCircle /> : <PlayCircle />}
        </div>
      </Tooltip>

      {/* End Call Button */}
      <Tooltip title={'End Call'} position="bottom" trigger="mouseenter">
        <div
          className={`icon-btn btn-danger button-effect ${
            mediaQuery.matches ? 'btn-xl' : 'btn-sm'
          } ml-3`}
          style={{ height: '4vw', width: '4vw' }}
          onClick={onEndCall}
        >
          <Phone />
        </div>
      </Tooltip>

      {/* Clip Analysis Mode Button (Trainer only) */}
      {!displayMsg?.showMsg && accountType === AccountType.TRAINER && (
        <Tooltip
          title={
            selectedClips.length
              ? 'Exit clip analysis mode'
              : 'Clip analysis mode'
          }
          position="bottom"
          trigger="mouseenter"
        >
          <div
            className={`icon-btn btn-light button-effect ${
              mediaQuery.matches ? 'btn-xl' : 'btn-sm'
            } ml-3`}
            style={{ height: '4vw', width: '4vw' }}
            onClick={onToggleClipAnalysis}
          >
            <ExternalLink />
          </div>
        </Tooltip>
      )}

      {/* Video Controller Lock/Unlock (Trainer with clips) */}
      {selectedClips?.length && accountType === AccountType.TRAINER && (
        <Tooltip
          title={videoController ? 'Lock' : 'Unlock'}
          position="bottom"
          trigger="mouseenter"
        >
          <div
            className={`icon-btn btn-light button-effect ${
              mediaQuery.matches ? 'btn-xl' : 'btn-sm'
            } ml-3`}
            style={{ height: '4vw', width: '4vw' }}
            onClick={onToggleVideoController}
          >
            {videoController ? <FaLock /> : <FaUnlock />}
          </div>
        </Tooltip>
      )}

      {/* Screenshot Button (Trainer only) */}
      {accountType === AccountType.TRAINER && (
        <Tooltip
          title={'Screenshot'}
          position="bottom"
          trigger="mouseenter"
          className="custom-tooltip-hh"
          disabled={width1000}
        >
          <div
            className={`icon-btn btn-light button-effect ${
              mediaQuery.matches ? 'btn-xl' : 'btn-sm'
            } ml-3`}
            style={{ height: '4vw', width: '4vw' }}
            onClick={onScreenshot}
          >
            <Aperture />
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export default VideoControls;

