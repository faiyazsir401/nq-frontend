import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useMemo,
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
import { pushProfilePhotoToS3 } from "../common/common.api";
import { getReport, screenShotTake } from "../videoupload/videoupload.api";
import html2canvas from "html2canvas";
import ReportModal from "../video/reportModal";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { Utils } from "../../../utils/utils";
import {
  myClips,
  traineeClips,
} from "../../../containers/rightSidebar/fileSection.api";
import { X } from "react-feather";
import Notes from "../practiceLiveExperience/Notes";
import CustomModal from "../../common/modal";
import ScreenShotDetails from "../video/screenshotDetails";
import Timer from "../video/Timer";
const VideoCallUI = ({
  id,
  isClose,
  accountType,
  traineeInfo,
  trainerInfo,
  session_end_time,
  bIndex,
  isLandscape,
}) => {
  const fromUser =
    accountType === AccountType.TRAINEE ? traineeInfo : trainerInfo;
  const toUser =
    accountType === AccountType.TRAINEE ? trainerInfo : traineeInfo;

  const socket = useContext(SocketContext);
  const peerRef = useRef(null);
  const videoRef = useRef(null);
  const intervalRef = useRef(null); // useRef for interval
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const { startMeeting } = useAppSelector(bookingsState);
  const [selectedClips, setSelectedClips] = useState([]);
  const [isTraineeJoined, setIsTraineeJoined] = useState(false);
  const [permissionModal, setPermissionModal] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [displayMsg, setDisplayMsg] = useState({ showMsg: false, msg: "" });
  const [remoteStream, setRemoteStream] = useState(null);
  const [micStream, setMicStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(51 * 60 + 3); // 51:03 in seconds
  const [selectedUser, setSelectedUser] = useState(null);
  const [isShowVideos, setIsShowVideos] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isRemoteVideoOff, setRemoteVideoOff] = useState(false);
  const [isOpenReport, setIsOpenReport] = useState(false);
  const remoteVideoRef = useRef(null);
  const [isLockMode, setIsLockMode] = useState(false);
  const [clipSelectNote, setClipSelectNote] = useState(false);
  const [isLocalStreamOff, setIsLocalStreamOff] = useState(false);
  const [isRemoteStreamOff, setIsRemoteStreamOff] = useState(false);
  const [selectClips, setSelectClips] = useState([]);
  const [videoActiveTab, setAideoActiveTab] = useState("media");
  const [clips, setClips] = useState([]);
  const [traineeClip, setTraineeClips] = useState([]);
  const [isScreenShotModelOpen, setIsScreenShotModelOpen] = useState(false);
  const [screenShots, setScreenShots] = useState([]);
  const [reportObj, setReportObj] = useState({ title: "", topic: "" });
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const [isModelOpen, setIsModelOpen] = useState(false);
  const netquixVideos = [
    {
      _id: "656acd81cd2d7329ed0d8e91",
      title: "Dog Activity",
      category: "Acting",
      user_id: "6533881d1e8775aaa25b3b6e",
      createdAt: "2023-12-02T06:24:01.995Z",
      updatedAt: "2023-12-02T06:24:01.995Z",
      file_name: "1717589251977.mp4",
      __v: 0,
    },
    {
      _id: "657053c4c440a4d0d775e639",
      title: "Pupppy clip",
      category: "Golf",
      user_id: "64ad7aae6d668be38e53be1b",
      createdAt: "2023-12-06T10:58:12.080Z",
      updatedAt: "2023-12-06T10:58:12.080Z",
      file_name: "1718140110745.quicktime",
      __v: 0,
    },
  ];

  useEffect(() => {
    if (isOpen) {
      getMyClips();
    }
  }, [isOpen]);

  const getMyClips = async () => {
    var res = await myClips({});
    setClips(res?.data);
    var res2 = await traineeClips({});
    let selectedClips = [];
    var arr = res2?.data || [];
    for (let index = 0; index < arr?.length; index++) {
      if (arr[index]._id._id === traineeInfo._id) {
        var el = arr[index]?.clips;

        arr[index].clips = arr[index].clips.map((clip) => {
          // Check if the current clip's _id matches the given id
          if (clip._id === id) {
            // Add the extra field 'duringSession' to the clip
            clip.duringSession = true;
          }
          return clip; // Return the modified or unmodified clip
        });
        arr[index].clips = [
          ...new Map(el.map((item) => [item.clips._id, item])).values(),
        ];
        selectedClips = [arr[index]];
      }
    }
    console.log("selectedClips", selectedClips);
    setTraineeClips(selectedClips);
  };

  socket.on(EVENTS.ON_VIDEO_SELECT, ({ videos, type }) => {
    if (type === "clips") {
      setSelectedClips([...videos]);
    }
  });

  //NOTE - separate funtion for emit seelcted clip videos  and using same even for swapping the videos
  const emitVideoSelectEvent = (type, videos) => {
    socket.emit(EVENTS.ON_VIDEO_SELECT, {
      userInfo: { from_user: fromUser._id, to_user: toUser._id },
      type,
      videos,
    });
  };

  //NOTE - emit event after selecting the clips
  useEffect(() => {
    emitVideoSelectEvent("clips", selectedClips);
  }, [selectedClips?.length]);

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

  async function afterSucessUploadImageOnS3() {
    var result = await getReport({
      sessions: id,
      trainer: fromUser?._id,
      trainee: toUser?._id,
    });
    setScreenShots(result?.data?.reportData);
  }

  const takeScreenshot = () => {
    setIsScreenShotModelOpen(false);
    let targetElement = document.getElementById("clip-container");
    if (!targetElement) {
      targetElement = document.body;
    }

    // Select only elements with the class "hide-in-screenshot"
    const elementsToHide = Array.from(
      targetElement.getElementsByClassName("hide-in-screenshot")
    );

    // Hide selected elements
    elementsToHide.forEach((el) => (el.style.visibility = "hidden"));
    html2canvas(targetElement, {
      type: "png",
      allowTaint: true,
      useCORS: true,
    }).then(async (canvas) => {
      // Restore visibility after the screenshot is taken
      elementsToHide.forEach((el) => (el.style.visibility = "visible"));
      const dataUrl = canvas.toDataURL("image/png");
      console.log("dataUrl", dataUrl);

      var res = await screenShotTake({
        sessions: id,
        trainer: fromUser?._id,
        trainee: toUser?._id,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Handling Error if SS is not generate image

      if (!blob) {
        return toast.error("Unable to take Screen Shot");
      }
      console.log("res?.data?.url", res?.data?.url);
      if (res?.data?.url) {
        setIsScreenShotModelOpen(true);
        pushProfilePhotoToS3(
          res?.data?.url,
          blob,
          null,
          afterSucessUploadImageOnS3
        );
      }

      setTimeout(() => {
        toast.success("The screenshot taken successfully.", {
          type: "success",
        });
      }, 2000);
    });
  };

  console.log("IsScreenShotModelOpen", isScreenShotModelOpen);

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

  useMemo(() => {
    if (
      remoteVideoRef.current &&
      remoteStream &&
      !remoteVideoRef.current.srcObject
    ) {
      remoteVideoRef.current.srcObject = remoteStream;
      accountType === AccountType.TRAINEE ? setIsModelOpen(true) : null;
    }

    return () => {
      cutCall();
    };
  }, [remoteStream]);

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
      accountType === AccountType.TRAINEE ? setIsModelOpen(true) : null;
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
      // clearCanvas();
    });

    socket.on(EVENTS.VIDEO_CALL.STOP_FEED, ({ feedStatus }) => {
      setIsRemoteStreamOff(feedStatus);
    });
  }, [socket]);

  // NOTE - handle user offline
  const handleOffline = () => {
    socket.emit("chunksCompleted");
  };

  function handlePeerDisconnect() {
    if (!(peerRef && peerRef.current)) return;
    //NOTE -  manually close the peer connections
    for (let conns in peerRef.current.connections) {
      peerRef.current.connections[conns].forEach((conn, index, array) => {
        // console.log(
        //   `closing ${conn.connectionId} peerConnection (${index + 1}/${array.length
        //   })`,
        //   conn.peerConnection
        // );
        conn.peerConnection.close();

        //NOTE - close it using peerjs methods
        if (conn.close) conn.close();
      });
    }
  }

  const cleanupFunction = () => {
    handlePeerDisconnect();
    setIsCallEnded(true);

    if (localStream) {
      localStream.getAudioTracks().forEach(function (track) {
        track.stop();
      });
      localStream.getVideoTracks().forEach((track) => {
        track.stop();
      });
      setLocalStream(null);
    }
    if (screenStream) {
      screenStream.getAudioTracks().forEach(function (track) {
        track.stop();
      });
      screenStream.getVideoTracks().forEach((track) => {
        track.stop();
      });
      setScreenStream(null);
    }

    if (remoteStream) {
      remoteStream.getAudioTracks().forEach(function (track) {
        track.stop();
      });
      setRemoteStream(null);
    }
    if (micStream) {
      micStream.getAudioTracks().forEach((track) => {
        track.stop();
      });
    }
    let videorefSrc = videoRef.current || localVideoRef;
    if (videoRef && videorefSrc && videorefSrc.srcObject) {
      videorefSrc.srcObject.getTracks().forEach((t) => {
        t.stop();
      });

      videorefSrc.srcObject.getVideoTracks().forEach((t) => {
        t.stop();
      });
    }

    let videorefSrcRemote = remoteVideoRef.current;
    if (remoteVideoRef && videorefSrcRemote && videorefSrcRemote.srcObject) {
      videorefSrcRemote.srcObject.getTracks().forEach((t) => {
        t.stop();
      });
      videorefSrcRemote.srcObject.getVideoTracks().forEach((t) => {
        t.stop();
      });
    }

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // clearCanvas();
  };

  const cutCall = () => {
    cleanupFunction();
    if (isTraineeJoined && AccountType.TRAINER === accountType) {
      setIsOpenReport(true);
    } else {
      isClose();
    }
  };

  const handelTabClose = async () => {
    mediaRecorder?.stop();
    // setRecording(false);
    socket.emit("chunksCompleted");
  };

  useEffect(() => {
    if (fromUser && toUser) {
      handleStartCall();
    }
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeunload", handelTabClose);

    return () => {
      window.removeEventListener("beforeunload", handelTabClose);
      window.removeEventListener("offline", handleOffline);
      cutCall();
    };
  }, [fromUser, toUser]);

  console.log("refs", videoRef, remoteVideoRef, remoteStream);

  return (
    <div
      className="video-call-container"
      style={{
        alignItems: isMaximized ? "normal" : "center",
        margin: isLandscape ? "auto" : "none",
        width: isLandscape ? "50%" : "100%",
      }}
    >
      {displayMsg?.msg ? <div>{displayMsg?.msg}</div> : null}
      {selectedClips && selectedClips.length > 0 ? (
        <ClipModeCall
          timeRemaining={session_end_time}
          isMaximized={isMaximized}
          setIsMaximized={setIsMaximized}
          selectedClips={selectedClips}
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
          takeScreenshot={takeScreenshot}
          setIsLock={setIsLockMode}
          isLandscape={isLandscape}
        />
      ) : (
        <OneOnOneCall
          timeRemaining={session_end_time}
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
          isLandscape={isLandscape}
        />
      )}
      {!isMaximized && (
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
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          takeScreenshot={takeScreenshot}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          isOpenConfirm={isOpenConfirm}
          setIsOpenConfirm={setIsOpenConfirm}
          selectedClips={selectedClips}
          setIsOpenReport={setIsOpenReport}
          cutCall={cutCall}
        />
      )}

      <Modal
        isOpen={isOpenConfirm}
        toggle={() => {
          setIsOpenConfirm(false);
        }}
      >
        <ModalHeader
          toggle={() => {
            setIsOpenConfirm(false);
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
              setSelectedClips([]);
              setIsOpenConfirm(false);
            }}
          >
            Confirm
          </Button>{" "}
          <Button
            color="secondary"
            onClick={() => {
              setIsOpenConfirm(false);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <CustomModal
        isOpen={isOpen}
        element={
          <>
            <div className="container media-gallery portfolio-section grid-portfolio">
              <div className="theme-title  mb-5">
                <div className="media-body media-body text-right">
                  <div
                    className="icon-btn btn-sm btn-outline-light close-apps pointer"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                  >
                    <X />
                  </div>
                </div>
                <div className="media d-flex flex-column  align-items-center">
                  <div>
                    <h2>
                      Select one video to do a full-screen analysis or select
                      two videos to do a comparison.
                    </h2>
                  </div>
                </div>
              </div>
              <div className="theme-tab">
                <Nav tabs className="justify-content-around">
                  <NavItem className="mb-2" style={{ width: "100%" }}>
                    <NavLink
                      className={`button-effect ${
                        videoActiveTab === "media" ? "active" : ""
                      } select-clip-width`}
                      onClick={() => setAideoActiveTab("media")}
                    >
                      My Videos
                    </NavLink>
                  </NavItem>
                  <NavItem className="mb-2" style={{ width: "100%" }}>
                    <NavLink
                      className={`button-effect ${
                        videoActiveTab === "trainee" ? "active" : ""
                      } select-clip-width`}
                      onClick={() => setAideoActiveTab("trainee")}
                    >
                      Trainee
                    </NavLink>
                  </NavItem>
                  <NavItem className="mb-2" style={{ width: "100%" }}>
                    <NavLink
                      className={`button-effect ${
                        videoActiveTab === "docs" ? "active" : ""
                      } select-clip-width`}
                      onClick={() => setAideoActiveTab("docs")}
                    >
                      NetQwix
                    </NavLink>
                  </NavItem>
                </Nav>
              </div>
              <div className="file-tab">
                <TabContent
                  activeTab={videoActiveTab}
                  className="custom-scroll"
                >
                  <TabPane tabId="media">
                    <div
                      className="media-gallery portfolio-section grid-portfolio"
                      style={{ overflowY: "auto", height: "55dvh" }}
                    >
                      {clips?.length ? (
                        clips?.map((cl, ind) => (
                          <div className={`collapse-block open`}>
                            <h5
                              className="block-title"
                              onClick={() => {
                                var temp = clips;
                                temp = temp.map((vl) => {
                                  return { ...vl, show: false };
                                });
                                temp[ind].show = true;
                                setClips([...temp]);
                              }}
                            >
                              {cl?._id}
                              <label className="badge badge-primary sm ml-2">
                                {cl?.clips?.length}
                              </label>
                            </h5>
                            {/*  NORMAL  STRUCTURE END  */}
                            <div className={`block-content`}>
                              <div className="row" style={{ margin: 0 }}>
                                {cl?.clips.map((clp, index) => {
                                  var sld = selectClips.find(
                                    (val) => val?._id === clp?._id
                                  );
                                  return (
                                    <div
                                      key={index}
                                      className={`col-3 p-1`}
                                      style={{ borderRadius: 5 }}
                                      onClick={() => {
                                        if (!sld && selectClips?.length < 2) {
                                          selectClips.push(clp);
                                          setSelectClips([...selectClips]);
                                        } else {
                                          var temp = JSON.parse(
                                            JSON.stringify(selectClips)
                                          );
                                          temp = temp.filter(
                                            (val) => val._id !== clp?._id
                                          );
                                          setSelectClips([...temp]);
                                        }
                                      }}
                                    >
                                      <video
                                        poster={Utils?.generateThumbnailURL(
                                          clp
                                        )}
                                        style={{
                                          // border: `${sld ? "2px" : "0px"} solid green`,
                                          // width: "98%",
                                          // maxHeight: "150px",
                                          // height: "100%",
                                          marginBottom: "10px",
                                          // height: "200px",
                                          width: "100%",
                                          border: sld
                                            ? "4px solid green"
                                            : "4px solid rgb(180, 187, 209)",
                                          borderRadius: "5px",
                                          objectFit: "cover",
                                          aspectRatio: "1/1",
                                        }}
                                      >
                                        <source
                                          src={Utils?.generateVideoURL(clp)}
                                          type="video/mp4"
                                        />
                                      </video>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              marginTop: "40px",
                            }}
                          >
                            <h5 className="block-title"> No Data Found</h5>
                          </div>
                        </>
                      )}
                    </div>
                    {clips.length && (
                      <div className="d-flex justify-content-around w-100 p-3">
                        <Button
                          color="success"
                          onClick={() => {
                            if (selectClips && selectClips?.length) {
                              setSelectedClips(selectClips);
                              setClipSelectNote(false);
                            }
                            setIsOpen(false);
                          }}
                        >
                          Select
                        </Button>
                      </div>
                    )}
                  </TabPane>
                  <TabPane tabId="trainee">
                    <div
                      className="media-gallery portfolio-section grid-portfolio"
                      style={{ overflowY: "auto", height: "55dvh" }}
                    >
                      {traineeClip?.length ? (
                        traineeClip?.map((cl, ind) => (
                          <div className={`collapse-block open`}>
                            <h5
                              className="block-title"
                              onClick={() => {
                                var temp = traineeClip;
                                temp = temp.map((vl) => {
                                  return { ...vl, show: false };
                                });
                                temp[ind].show = true;
                                setTraineeClips([...temp]);
                              }}
                            >
                              {cl?._id?.fullname}
                              <label className="badge badge-primary sm ml-2">
                                {cl?.clips?.length}
                              </label>
                            </h5>
                            {/*  NORMAL  STRUCTURE END  */}
                            <div className={`block-content `}>
                              <div className="row" style={{ margin: 0 }}>
                                {cl?.clips.map((clp, index) => {
                                  var sld = selectClips.find(
                                    (val) => val?._id === clp?.clips?._id
                                  );
                                  return (
                                    <div
                                      key={index}
                                      className={`col-3 p-1`}
                                      style={{ borderRadius: 5 }}
                                      onClick={() => {
                                        if (!sld && selectClips?.length < 2) {
                                          selectClips.push(clp?.clips);
                                          setSelectClips([...selectClips]);
                                        } else {
                                          var temp = JSON.parse(
                                            JSON.stringify(selectClips)
                                          );
                                          temp = temp.filter(
                                            (val) => val._id !== clp?.clips?._id
                                          );
                                          setSelectClips([...temp]);
                                        }
                                      }}
                                    >
                                      <video
                                        poster={Utils?.generateThumbnailURL(
                                          clp?.clips
                                        )}
                                        style={{
                                          // border: `${sld ? "2px" : "0px"} solid green`,
                                          // width: "98%",
                                          // maxHeight: "150px",
                                          // height: "100%",
                                          marginBottom: "10px",

                                          width: "100%",
                                          border: sld
                                            ? "4px solid green"
                                            : clp.duringSession
                                            ? "4px solid red"
                                            : "4px solid rgb(180, 187, 209)",

                                          borderRadius: "5px",
                                          objectFit: "cover",
                                          aspectRatio: "1/1",
                                        }}
                                        preload="none"
                                      >
                                        <source
                                          src={Utils?.generateVideoURL(
                                            clp?.clips
                                          )}
                                          // src={Utils?.generateVideoURL(clp)}
                                          type="video/mp4"
                                        />
                                      </video>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "40px",
                          }}
                        >
                          <h5 className="block-title"> No Data Found</h5>
                        </div>
                      )}
                    </div>

                    {traineeClip.length && (
                      <div className="d-flex justify-content-around w-100 p-3">
                        <Button
                          color="success"
                          onClick={() => {
                            if (selectClips && selectClips?.length) {
                              setSelectedClips(selectClips);
                              setClipSelectNote(false);
                            }
                            setIsOpen(false);
                          }}
                        >
                          Select
                        </Button>
                      </div>
                    )}
                  </TabPane>
                  <TabPane tabId="docs">
                    <div
                      className="media-gallery portfolio-section grid-portfolio"
                      style={{ overflowY: "auto", height: "55dvh" }}
                    >
                      <div className={`collapse-block open`}>
                        <div className={`block-content `}>
                          <div className="row">
                            {netquixVideos.map((clp, index) => {
                              var sld = selectClips.find(
                                (val) => val?._id === clp?._id
                              );
                              return clp?.file_name ? (
                                <div
                                  key={index}
                                  className={`col-3 p-1`}
                                  style={{ borderRadius: 5 }}
                                  onClick={() => {
                                    if (!sld && selectClips?.length < 2) {
                                      selectClips.push(clp);
                                      setSelectClips([...selectClips]);
                                    } else {
                                      var temp = JSON.parse(
                                        JSON.stringify(selectClips)
                                      );
                                      temp = temp.filter(
                                        (val) => val._id !== clp?._id
                                      );
                                      setSelectClips([...temp]);
                                    }
                                  }}
                                >
                                  <video
                                    // style={{ border: `${sld ? "2px" : "0px"} solid green`, width: "98%", maxHeight: "150px", height: "100%", marginBottom: "10px", display: "flex", justifyContent: "center" }}
                                    style={{
                                      marginBottom: "10px",

                                      width: "100%",
                                      border: sld
                                        ? "4px solid green"
                                        : "4px solid rgb(180, 187, 209)",
                                      borderRadius: "5px",
                                      objectFit: "cover",
                                      aspectRatio: "1/1",
                                    }}
                                  >
                                    <source
                                      src={Utils?.generateVideoURL(clp)}
                                      type="video/mp4"
                                    />
                                  </video>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {netquixVideos.length && (
                      <div className="d-flex justify-content-around w-100 p-3">
                        <Button
                          color="success"
                          onClick={() => {
                            if (selectClips && selectClips?.length) {
                              setSelectedClips(selectClips);
                              setClipSelectNote(false);
                            }
                            setIsOpen(false);
                          }}
                        >
                          Select
                        </Button>
                      </div>
                    )}
                  </TabPane>
                </TabContent>
              </div>
            </div>

            {clipSelectNote && (
              <Notes
                isOpen={clipSelectNote}
                onClose={setClipSelectNote}
                title={"Select clips"}
                desc={
                  "Select clips to choose up to two clips, videos will load onto your board when you click the X (cross)."
                }
                style={{
                  top: "10px",
                  left: "10px",
                }}
                triangle={"clip-select"}
                nextFunc={() => {
                  setClipSelectNote(false);
                }}
              />
            )}
          </>
        }
      />

      {isScreenShotModelOpen && (
        <ScreenShotDetails
          screenShotImages={screenShots}
          setScreenShotImages={setScreenShots}
          setIsOpenDetail={setIsScreenShotModelOpen}
          isOpenDetail={isScreenShotModelOpen}
          currentReportData={{
            session: id,
            trainer: fromUser?._id,
            trainee: toUser?._id,
          }}
          reportObj={reportObj}
        />
      )}

      <ReportModal
        currentReportData={{
          session: id,
          trainer: fromUser?._id,
          trainee: toUser?._id,
        }}
        isOpenReport={isOpenReport}
        setIsOpenReport={setIsOpenReport}
        screenShots={screenShots}
        setScreenShots={setScreenShots}
        // setScreenShots={setScreenShot}
        reportObj={reportObj}
        setReportObj={setReportObj}
        isClose={isClose}
        isTraineeJoined={isTraineeJoined}
        isCallEnded={isCallEnded}
      />
    </div>
  );
};

export default VideoCallUI;
