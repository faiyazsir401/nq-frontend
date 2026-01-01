import React from 'react';
import { Tooltip } from 'react-tippy';
import {
  MicOff,
  PauseCircle,
  Phone,
  PlayCircle,
  ExternalLink,
  Aperture,
  FilePlus,
} from 'react-feather';
import { FaLock, FaUnlock } from 'react-icons/fa';
import { AccountType } from '../../../common/constants';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button } from 'reactstrap';

/**
 * Video call action buttons component
 */
export const VideoCallControls = ({
  isMuted,
  isFeedStopped,
  accountType,
  selectedClips,
  maxMin,
  videoController,
  displayMsg,
  localStream,
  micStream,
  setIsMuted,
  setIsFeedStopped,
  setCallEnd,
  cutCall,
  setIsOpen,
  setIsOpenConfirm,
  setSelectedClips,
  setInitialPinnedUser,
  globalProgressBarToggler,
  takeScreenshot,
  showReportData,
  setIsTooltipShow,
  width1000,
  mediaQuery,
  socket,
  fromUser,
  toUser,
  EVENTS,
  isOpenConfirm,
  setIsOpenConfirm: setIsOpenConfirmProp,
}) => {
  const handleMuteToggle = () => {
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
  };

  const handleVideoToggle = () => {
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
  };

  const handleEndCall = () => {
    setCallEnd(true);
    cutCall();
  };

  const handleClipAnalysis = () => {
    if (selectedClips?.length) {
      setIsOpenConfirm(true);
    } else {
      setIsOpen(true);
    }
  };

  const handleScreenshot = () => {
    setIsTooltipShow(false);
    setTimeout(() => {
      takeScreenshot();
    }, 30);
  };

  return (
    <div className="call-action-buttons z-50 my-3">
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
          onClick={handleMuteToggle}
        >
          <MicOff />
        </div>
      </Tooltip>

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
          onClick={handleVideoToggle}
        >
          {!isFeedStopped ? <PauseCircle /> : <PlayCircle />}
        </div>
      </Tooltip>

      <Tooltip title={'End Call'} position="bottom" trigger="mouseenter">
        <div
          className={`icon-btn btn-danger button-effect ${
            mediaQuery.matches ? 'btn-xl' : 'btn-sm'
          } ml-3`}
          style={{ height: '4vw', width: '4vw' }}
          onClick={handleEndCall}
        >
          <Phone />
        </div>
      </Tooltip>

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
            className={
              !maxMin
                ? `icon-btn btn-light button-effect ${
                    mediaQuery.matches ? 'btn-xl' : 'btn-sm'
                  } ml-3`
                : `icon-btn btn-danger button-effect ${
                    mediaQuery.matches ? 'btn-xl' : 'btn-sm'
                  } ml-3`
            }
            style={{ height: '4vw', width: '4vw' }}
            onClick={handleClipAnalysis}
          >
            <ExternalLink />
          </div>
        </Tooltip>
      )}

      {selectedClips?.length && accountType === AccountType.TRAINER ? (
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
            onClick={globalProgressBarToggler}
          >
            {videoController ? <FaLock /> : <FaUnlock />}
          </div>
        </Tooltip>
      ) : (
        <></>
      )}

      {accountType === AccountType.TRAINER ? (
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
            onClick={handleScreenshot}
          >
            <Aperture />
          </div>
        </Tooltip>
      ) : (
        <></>
      )}

      {accountType === AccountType.TRAINER ? (
        <Tooltip title={'Game Plans'} position="bottom" trigger="mouseenter">
          <div
            className={`icon-btn btn-light button-effect ${
              mediaQuery.matches ? 'btn-xl' : 'btn-sm'
            } ml-3`}
            style={{ height: '4vw', width: '4vw' }}
            onClick={showReportData}
          >
            <FilePlus />
          </div>
        </Tooltip>
      ) : (
        <></>
      )}

      <Modal
        isOpen={isOpenConfirm}
        toggle={() => {
          setIsOpenConfirmProp(false);
        }}
      >
        <ModalHeader
          toggle={() => {
            setIsOpenConfirmProp(false);
            setSelectedClips([]);
          }}
          close={() => <></>}
        >
          Confirm
        </ModalHeader>
        <ModalBody>Are you sure you want to exit clip analysis mode?</ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              setInitialPinnedUser();
              setSelectedClips([]);
              setIsOpenConfirmProp(false);
            }}
          >
            Confirm
          </Button>{' '}
          <Button
            color="secondary"
            onClick={() => {
              setIsOpenConfirmProp(false);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

