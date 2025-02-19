import {
  Aperture,
  ExternalLink,
  FilePlus,
  MicOff,
  PauseCircle,
  Phone,
  PlayCircle,
} from "react-feather";
import { FaLock, FaUnlock } from "react-icons/fa";
import { Tooltip } from "react-tippy";
import { EVENTS } from "../../../helpers/events";
import { useContext } from "react";
import { SocketContext } from "../socket";
import { useAppSelector } from "../../store";
import { authState } from "../auth/auth.slice";
import { AccountType } from "../../common/constants";

const ActionButtons = ({
  isShowVideos,
  setIsShowVideos,
  isLockMode,
  setIsLockMode,
  isVideoOff,
  setIsVideoOff,
  stream,
  fromUser,
  toUser,
  setIsMuted,
  isMuted,
  takeScreenshot,
  setIsOpenConfirm,
  setIsOpen,
  isOpen,
  isOpenConfirm,
  selectedClips,
  setIsOpenReport,
  cutCall
}) => {
  const { accountType } = useAppSelector(authState);
  const socket = useContext(SocketContext);
  return (
    <div className="action-buttons">
      <Tooltip>
        <div
          className={`button mic-toggle ${isMuted?"off":""}`}
          onClick={() => {

            if (stream) {
              const audioTracks = stream.getAudioTracks();
              if (audioTracks.length > 0) {
                audioTracks[0].enabled = !audioTracks[0].enabled;
                setIsMuted(!audioTracks[0].enabled);
              }
            }
            // if (micStream) {
            //   const audioTracks = micStream.getAudioTracks();
            //   if (audioTracks.length > 0) {
            //     audioTracks[0].enabled = !audioTracks[0].enabled;
            //     setIsMuted(!audioTracks[0].enabled);
            //   }
            // }
          }}
        >
          <MicOff size={16} />
        </div>
      </Tooltip>
      <Tooltip>
        <div
          className={`button video-toggle ${isVideoOff ? "off" : ""}`}
          onClick={() => {
            if (stream) {
              // console.log("inside of local stream  statement");
              stream.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled; // Toggle camera state
              });
              socket.emit(EVENTS.VIDEO_CALL.STOP_FEED, {
                userInfo: { from_user: fromUser._id, to_user: toUser._id },
                feedStatus: !isVideoOff,
              });
              setIsVideoOff(!isVideoOff);
            }
          }}
        >
          {!isVideoOff ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
        </div>
      </Tooltip>

      <Tooltip>
        <div className="button end-call off" onClick={cutCall}> 
          <Phone size={16} />
        </div>
      </Tooltip>

      {accountType === AccountType.TRAINER && (
        <>
          <Tooltip>
            <div className="button external-link">
              <ExternalLink
                size={16}
                onClick={() => {
                  if (selectedClips?.length) {
                    setIsOpenConfirm(true);
                  } else {
                    setIsOpen(true);
                  }
                }}
              />
            </div>
          </Tooltip>

          <Tooltip>
            <div
              className="button video-lock"
              onClick={() => {
                socket.emit(EVENTS.TOGGLE_LOCK_MODE, {
                  userInfo: { from_user: fromUser._id, to_user: toUser._id },
                  isLockMode: !isLockMode,
                });
                setIsLockMode(!isLockMode)}}
            >
              {isLockMode ? <FaLock size={16} /> : <FaUnlock size={16} />}
            </div>
          </Tooltip>

          <Tooltip>
            <div className="button aperture" onClick={takeScreenshot}>
              <Aperture size={16} />
            </div>
          </Tooltip>

          <Tooltip>
            <div className="button file-add" onClick={()=>setIsOpenReport(true)}>
              <FilePlus size={16} />
            </div>
          </Tooltip>
        </>
      )}
    </div>
  );
};

export default ActionButtons;
