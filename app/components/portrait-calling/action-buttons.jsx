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

const ActionButtons = ({
  isShowVideos,
  setIsShowVideos,
  isLockMode,
  setIsLockMode,
  isVideoOff,
  setIsVideoOff,
  stream,
  fromUser,
  toUser
}) => {
  const socket = useContext(SocketContext)
  return (
    <div className="action-buttons">
      <Tooltip>
        <div className="button mic-toggle">
          <MicOff size={16} />
        </div>
      </Tooltip>
      <Tooltip>
        <div
          className="button feed-toggle"
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
          {!isVideoOff ? (
            <PauseCircle size={16} />
          ) : (
            <PlayCircle size={16} />
          )}
        </div>
      </Tooltip>

      <Tooltip>
        <div className="button end-call">
          <Phone size={16} />
        </div>
      </Tooltip>

      <Tooltip>
        <div className="button external-link">
          <ExternalLink
            size={16}
            onClick={() => setIsShowVideos(!isShowVideos)}
          />
        </div>
      </Tooltip>

      <Tooltip>
        <div
          className="button video-lock"
          onClick={() => setIsLockMode(!isLockMode)}
        >
          {isLockMode ? <FaLock size={16} /> : <FaUnlock size={16} />}
        </div>
      </Tooltip>

      <Tooltip>
        <div className="button aperture">
          <Aperture size={16} />
        </div>
      </Tooltip>

      <Tooltip>
        <div className="button file-add">
          <FilePlus size={16} />
        </div>
      </Tooltip>
    </div>
  );
};

export default ActionButtons;
