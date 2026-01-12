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
import './VideoCallControls.scss';

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

      {/* Accessibility: keyboard dismissal enabled to allow Escape key to close modal,
          providing equivalent behavior to clicking Cancel for keyboard users (WCAG 2.1) */}
      <Modal
        isOpen={isOpenConfirm}
        toggle={() => {
          setIsOpenConfirmProp(false);
          setSelectedClips([]);
        }}
        centered
        className="clip-exit-confirm-modal"
        backdrop="static"
        keyboard={true}
      >
        <ModalHeader
          toggle={() => {
            setIsOpenConfirmProp(false);
            setSelectedClips([]);
          }}
          close={() => <></>}
          className="clip-exit-confirm-modal__header"
          style={{ textAlign: "center" }}
        >
          <div className="clip-exit-confirm-modal__title" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
            <span>Confirm Exit</span>
          </div>
        </ModalHeader>
        <ModalBody className="clip-exit-confirm-modal__body" style={{ textAlign: "center", padding: "1.5rem" }}>
          <p style={{ margin: "0 0 1rem 0", fontSize: "1rem", color: "#333" }}>Are you sure you want to exit clip analysis mode?</p>
          <p className="clip-exit-confirm-modal__subtext" style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
            Your selected clips will be cleared and you'll return to the regular call view.
          </p>
        </ModalBody>
        <ModalFooter className="clip-exit-confirm-modal__footer" style={{ display: "flex", justifyContent: "center", gap: "1rem", padding: "1rem 1.5rem" }}>
          <Button
            color="secondary"
            onClick={() => {
              setIsOpenConfirmProp(false);
            }}
            className="clip-exit-confirm-modal__btn-cancel"
            style={{
              backgroundColor: '#6c757d',
              borderColor: '#6c757d',
              color: '#ffffff',
              minHeight: '44px',
              padding: '0.75rem 1.5rem',
              fontWeight: '600'
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => {
              setInitialPinnedUser();
              setSelectedClips([]);
              setIsOpenConfirmProp(false);
            }}
            className="clip-exit-confirm-modal__btn-confirm"
            style={{
              backgroundColor: '#007bff',
              borderColor: '#007bff',
              color: '#ffffff',
              minHeight: '44px',
              padding: '0.75rem 1.5rem',
              fontWeight: '600'
            }}
          >
            <i className="fa fa-check" aria-hidden="true" style={{ marginRight: "8px" }}></i>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

