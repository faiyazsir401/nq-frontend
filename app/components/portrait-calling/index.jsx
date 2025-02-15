import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import "./index.css";
import { AccountType } from "../../common/constants";
import "./action-buttons.css";
import { EVENTS } from "../../../helpers/events";
import { SocketContext } from "../socket";
import OneOnOneCall from "./one-on-one-call";
import ClipModeCall from "./clip-mode";
import ActionButtons from "./action-buttons";
import Peer from "peerjs";
import { toast } from "react-toastify";
import { useAppSelector } from "../../store";
import { bookingsState } from "../common/common.slice";

const VideoCallUI = ({
  id,
  isClose,
  accountType,
  traineeInfo,
  trainerInfo,
  session_end_time,
  bIndex,
}) => {
  const fromUser =
    accountType === AccountType.TRAINEE ? traineeInfo : trainerInfo;
  const toUser =
    accountType === AccountType.TRAINEE ? trainerInfo : traineeInfo;

  const socket = useContext(SocketContext);
  const peerRef = useRef(null);
  const videoRef = useRef(null);
  const intervalRef = useRef(null); // useRef for interval
  const { startMeeting } = useAppSelector(bookingsState);
  const [selectedClips, setSelectedClips] = useState([]);
  const [isTraineeJoined, setIsTraineeJoined] = useState(false);
  const [permissionModal, setPermissionModal] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [displayMsg, setDisplayMsg] = useState({ showMsg: false, msg: "" });
  const [remoteStream, setRemoteStream] = useState(null);

  const [timeRemaining, setTimeRemaining] = useState(51 * 60 + 3); // 51:03 in seconds
  const [selectedUser, setSelectedUser] = useState(null);
  const [isShowVideos, setIsShowVideos] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isRemoteVideoOff, setRemoteVideoOff] = useState(false);
  const [isOpenReport, setIsOpenReport] = useState(false);
  const remoteVideoRef = useRef(null);
  const [isLockMode, setIsLockMode] = useState(false);

  const [isLocalStreamOff, setIsLocalStreamOff] = useState(false);
  const [isRemoteStreamOff, setIsRemoteStreamOff] = useState(false);
  // selects trainee clips on load

  useEffect(() => {
    if (isTraineeJoined) {
      if (startMeeting?.trainee_clip?.length > 0) {
        setSelectedClips(startMeeting.trainee_clip);
      } else {
        setSelectedClips([]);
      } // Set the selected clips immediately
    }
  }, [accountType, startMeeting, isTraineeJoined]); // Dependencies to ensure it updates correctly

  console.log("selectedClips", selectedClips, accountType, startMeeting);

  // Handle start call
  const handleStartCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setPermissionModal(false);
      setLocalStream(stream);
      setDisplayMsg({
        showMsg: true,
        msg: `Waiting for ${toUser?.fullname} to join...`,
      });
      if (videoRef?.current) {
        videoRef.current.srcObject = stream;
      }

      const peer = new Peer(fromUser._id, {
        config: startMeeting.iceServers,
      });
      peerRef.current = peer;

      // Handle Peer events
      peer.on("open", (id) => {
        socket.emit("ON_CALL_JOIN", {
          userInfo: { from_user: fromUser._id, to_user: toUser._id },
        });
        console.log("call joined");
      });

      peer.on("error", (error) => {
        console.error("Peer error:", error);
      });

      peer.on("call", (call) => {
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          setIsTraineeJoined(true);
          setDisplayMsg({ showMsg: false, msg: "" });
          if (remoteVideoRef?.current)
            remoteVideoRef.current.srcObject = remoteStream;
          setRemoteStream(remoteStream);
        });
      });
    } catch (err) {
      console.log("error", err);
      setPermissionModal(true);
      toast.error(
        "Please allow media permission to microphone and camera for video call..."
      );
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    intervalRef.current = interval;

    return () => clearInterval(intervalRef.current); // Clear interval on cleanup
  }, []);

  const connectToPeer = (peer, peerId) => {
    if (!(videoRef && videoRef?.current)) return;
    const call = peer.call(peerId, videoRef?.current?.srcObject);
    call?.on("stream", (remoteStream) => {
      // console.log(`setting remoteStream for 2nd user here ---- `);
      setDisplayMsg({ showMsg: false, msg: "" });
      setIsTraineeJoined(true);
      console.log("remoteVideoRef", remoteVideoRef?.current);
      if (remoteVideoRef?.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      setRemoteStream(remoteStream);
      // accountType === AccountType.TRAINEE ? setIsModelOpen(true) : null;
    });
  };
  console.log("isTraineeJoined", isTraineeJoined);
  useEffect(() => {
    socket.on(EVENTS.VIDEO_CALL.ON_CLOSE, () => {
      setTimeout(() => {
        isClose();
      }, 3000);
    });

    socket.on("ON_CALL_JOIN", ({ userInfo }) => {
      const { to_user, from_user } = userInfo;
      if (peerRef.current) {
        connectToPeer(peerRef.current, from_user);
      }
    });

    socket.on(EVENTS.VIDEO_CALL.ON_OFFER, (offer) => {
      peerRef.current?.signal(offer);
    });

    socket.on(EVENTS.VIDEO_CALL.ON_ANSWER, (answer) => {
      peerRef.current?.signal(answer);
    });

    socket.on(EVENTS.VIDEO_CALL.ON_ICE_CANDIDATE, (candidate) => {
      peerRef.current?.signal(candidate);
    });

    socket.on(EVENTS.ON_CLEAR_CANVAS, () => {
      clearCanvas();
    });

    socket.on(EVENTS.VIDEO_CALL.STOP_FEED, ({ feedStatus }) => {
      setIsRemoteStreamOff(feedStatus);
    });
  }, [socket]);

  const cutCall = () => {
    stopRecording();
    cleanupFunction();
    if (isTraineeJoined && AccountType.TRAINER === accountType) {
      setIsOpenReport(true);
    } else {
      isClose();
    }
  };

  useEffect(() => {
    if (fromUser && toUser) {
      handleStartCall();
    }
  }, [fromUser, toUser]);

  console.log("refs", videoRef, remoteVideoRef, remoteStream);

  return (
    <div
      className="video-call-container"
      style={{ alignItems: isMaximized ? "normal" : "center" }}
    >
      {displayMsg?.msg ? (
        <div
        >
          {displayMsg?.msg}
        </div>
      ) : null}
      {isShowVideos ? (
        <OneOnOneCall
          timeRemaining={timeRemaining}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          videoRef={videoRef}
          remoteVideoRef={remoteVideoRef}
          toUser={toUser}
          fromUser={fromUser}
          localStream={localStream}
          remoteStream={remoteStream}
          isLocalStreamOff={isLocalStreamOff}
          setIsLocalStreamOff={setIsLocalStreamOff}
          isRemoteStreamOff={isRemoteStreamOff}
          setIsRemoteStreamOff={setIsRemoteStreamOff}
        />
      ) : (
        <ClipModeCall
          timeRemaining={timeRemaining}
          isMaximized={isMaximized}
          setIsMaximized={setIsMaximized}
          selectedClips={[selectedClips[0]]}
          setSelectedClips={setSelectedClips}
          isLock={isLockMode}
          localVideoRef={videoRef}
          remoteVideoRef={remoteVideoRef}
          toUser={toUser}
          fromUser={fromUser}
          localStream={localStream}
          remoteStream={remoteStream}
          isRemoteStreamOff={isRemoteStreamOff}
          isLocalStreamOff={isLocalStreamOff}
        />
      )}
      {!isMaximized &&
       
          <ActionButtons
            isShowVideos={isShowVideos}
            setIsShowVideos={setIsShowVideos}
            setIsLockMode={setIsLockMode}
            isLockMode={isLockMode}
            isVideoOff={isLocalStreamOff}
            setIsVideoOff={setIsLocalStreamOff}
            stream={localStream}
            fromUser={fromUser}
            toUser={toUser}
          />
      }
    </div>
  );
};

export default VideoCallUI;
