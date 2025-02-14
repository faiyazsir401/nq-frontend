
import { Aperture, ExternalLink, FilePlus, MicOff, PauseCircle, Phone, PlayCircle } from "react-feather";
import { FaLock, FaUnlock } from "react-icons/fa";
import { Tooltip } from "react-tippy";


const ActionButtons = ({ isShowVideos, setIsShowVideos }) => {
  const isFeedStopped = true;
  const videoController = true;
  return (
    <div className="action-buttons">
      <Tooltip>
        <div className="button mic-toggle">
          <MicOff size={16} />
        </div>
      </Tooltip>
      <Tooltip>
        <div className="button feed-toggle">
          {!isFeedStopped ? (
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
        <div className="button video-lock">
          {videoController ? <FaLock size={16} /> : <FaUnlock size={16} />}
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
