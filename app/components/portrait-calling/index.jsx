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
import { getTraineeClips } from "../NavHomePage/navHomePage.api";
import PermissionModal from "../video/PermissionModal";
import ReactStrapModal from "../../common/modal";
import Ratings from "../bookings/ratings";
import TraineeRatings from "../bookings/ratings/trainee";
import { useMediaQuery } from "usehooks-ts";
import { updateExtendedSessionTime } from "../../common/common.api";


let Peer;
let timeoutId;




const VideoCallUI = ({
  id,
  isClose,
  accountType,
  traineeInfo,
  trainerInfo,
  session_end_time,
  session_start_time,
  extended_session_end_time,
  bIndex,
  isLandscape,
}) => {
  const fromUser =
    accountType === AccountType.TRAINEE ? traineeInfo : trainerInfo;
  const toUser =
    accountType === AccountType.TRAINEE ? trainerInfo : traineeInfo;

  const socket = useContext(SocketContext);
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasRef2 = useRef(null);
  const videoRef = useRef(null);
  const videoRef2 = useRef(null);
  const videoContainerRef = useRef(null);
  const videoContainerRef2 = useRef(null);

  const intervalRef = useRef(null); // useRef for interval
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const { startMeeting } = useAppSelector(bookingsState);
  const [selectedClips, setSelectedClips] = useState([]);
  const [isTraineeJoined, setIsTraineeJoined] = useState(false);
  const [permissionModal, setPermissionModal] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [displayMsg, setDisplayMsg] = useState({ show: false, msg: "" });
  const [remoteStream, setRemoteStream] = useState(null);
  const [micStream, setMicStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(51 * 60 + 3); // 51:03 in seconds
  const [selectedUser, setSelectedUser] = useState(null);
  const [isShowVideos, setIsShowVideos] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isRemoteVideoOff, setRemoteVideoOff] = useState(false);
  const [isOpenReport, setIsOpenReport] = useState(false);
  const [isOpenRating, setIsOpenRating] = useState(false);

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
  const [currentScreenShot, setCurrentScreenshot] = useState("")
  const [reportObj, setReportObj] = useState({ title: "", topic: "" });
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [errorMessageForPermission, setErrorMessageForPermission] = useState("Kindly allow us access to your camera and microphone.")
  const [userAlreadyInCall, setUserAlreadyInCall] = useState(false)
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isConfirmModelOpen, setIsConfirmModelOpen] = useState(false);
  const [showScreenshotButton, setShowScreenshotButton] = useState(false)
  const [isSessionExtended, setIsSessionExtended] = useState(false);
  const [sessionEndTime, setSessionEndTime] = useState(null)
  const [showGracePeriodModal, setShowGracePeriodModal] = useState(false);
  const [showSessionEndedModal, setShowSessionEndedModal] = useState(false);
  const [countdownMessage, setCountdownMessage] = useState("");
  const gracePeriodModalDismissedRef = useRef(false);
  const sessionEndedModalDismissedRef = useRef(false);

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

  function getTimeDifferenceStatus(session_end_time) {
    const now = new Date();

    if (typeof session_end_time === "string" && session_end_time.includes(":")) {
      const [endHours, endMinutes] = session_end_time.split(":").map(Number);
      const endTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        endHours,
        endMinutes
      );

      const timeDiff = (endTime - now) / (1000 * 60); // Convert to minutes
      // Show grace period modal at -4 minutes
      console.log("gracePeriodModalDismissed",gracePeriodModalDismissedRef.current)
      if (timeDiff <= -4 && timeDiff > -5 && !gracePeriodModalDismissedRef.current) {
        setShowGracePeriodModal(true);
        setCountdownMessage("1 minute");
      }

      // Show session ended modal at -5 minutes
      if (timeDiff <= -5 &&!sessionEndedModalDismissedRef.current) {
        setShowGracePeriodModal(false);
        setShowSessionEndedModal(true);
        return true; // Returns true to trigger call end
      }

      return false;
    } else {
      console.error("Invalid session_end_time:", session_end_time);
      return false; // Handle invalid input
    }
  };

  // Add this function to extend the session time
  const extendSessionTime = async () => {
    try {
      // Parse session start time
      const [startHours, startMinutes] = session_start_time.split(':').map(Number);

      // Create Date object for session_start_time
      const now = new Date();
      const startTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        startHours,
        startMinutes
      );

      // Create Date object for current time
      const currentTime = new Date();

      // Calculate difference between current time and session start time
      const timeElapsed = currentTime - startTime;

      if (timeElapsed < 0) {
        console.warn("Current time is before the session start time. Cannot extend.");
        return;
      }

      // Parse session end time
      const [endHours, endMinutes] = session_end_time.split(':').map(Number);
      const endTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        endHours,
        endMinutes
      );

      // Add the time elapsed to session end time
      const newEndTime = new Date(endTime.getTime() + timeElapsed);

      // Format new end time to HH:MM
      const newEndHours = String(newEndTime.getHours()).padStart(2, '0');
      const newEndMinutes = String(newEndTime.getMinutes()).padStart(2, '0');
      const newEndTimeStr = `${newEndHours}:${newEndMinutes}`;

      // Update the session_end_time
      console.log("newEndTimeStr", id, newEndTimeStr);
      setSessionEndTime(newEndTimeStr);
      socket.emit("ON_BOTH_JOIN", {
        userInfo: { from_user: fromUser._id, to_user: toUser._id },
        newEndTimeStr
      });
      await updateExtendedSessionTime({ sessionId: id, extendedEndTime: newEndTimeStr });
      console.log(`Session extended from ${session_end_time} to ${newEndTimeStr}`);
    } catch (error) {
      console.error("Error extending session time:", error);
    }
  };


  useEffect(() => {
    const checkStatus = () => {
      const isEndCall = getTimeDifferenceStatus(sessionEndTime);
      
      if (isEndCall) {
        cutCall(true)
      }
    };

    // Initial check
    checkStatus();

    // Check every second
    const intervalId = setInterval(checkStatus, 1000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [sessionEndTime]);

  const getMyClips = async () => {
    var res = await myClips({});
    setClips(res?.data);
    var trainee_clips = await myClips({ trainee_id: traineeInfo._id });

    let sharedClips = [];
    var arr = trainee_clips?.data || [];
    let res3 = await traineeClips({});
    const clipsSharedByTrainee = res3?.data
    console.log("clipsSharedByTrainee", clipsSharedByTrainee)
    for (let index = 0; index < clipsSharedByTrainee?.length; index++) {
      if (clipsSharedByTrainee[index]._id._id === traineeInfo._id) {

        clipsSharedByTrainee[index].clips.map((clip) => {
          // Check if the current clip's _id matches the given id
          if (clip._id === id) {
            // Add the extra field 'duringSession' to the clip
            console.log("clips", clip)
            sharedClips.push(clip.clips._id)
          }
          // return clip; // Return the modified or unmodified clip
        });
      }
    }


    console.log("shared_clips", sharedClips);

    arr[0]?.clips?.forEach(item => {
      if (sharedClips.includes(item._id)) {
        item.duringSession = true; // Add the duringSession field with value `true`
      } else {
        item.duringSession = false; // Optionally, you can set it to false or leave it undefined
      }
    });
    console.log("trainee_clips", arr)

    setTraineeClips(arr);
  };

  socket.on(EVENTS.ON_VIDEO_SELECT, ({ videos, type }) => {
    if (type === "clips") {
      setSelectedClips([...videos]);
    }
  });

  socket.on(EVENTS.CALL_END, () => {
    if (accountType === AccountType.TRAINEE) {
      cutCall();
      setIsOpenRating(true)
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
    setCurrentScreenshot(result?.data?.reportData[result?.data?.reportData?.length - 1]?.imageUrl)
  }
  const [isLoading, setIsLoading] = useState(false)

  const extractCroppedFrame = (videoRef, videoContainerRef, drawingCanvasRef) => {
    try {
      const video = videoRef.current;
      const videoContainer = videoContainerRef.current;

      if (!video || !videoContainer) return;

      // Get dimensions
      const containerRect = videoContainer.getBoundingClientRect();
      const videoRect = video.getBoundingClientRect();

      // Calculate visible portion in screen coordinates
      const visibleX = Math.max(containerRect.left, videoRect.left);
      const visibleY = Math.max(containerRect.top, videoRect.top);
      const visibleRight = Math.min(containerRect.right, videoRect.right);
      const visibleBottom = Math.min(containerRect.bottom, videoRect.bottom);

      const visibleWidth = visibleRight - visibleX;
      const visibleHeight = visibleBottom - visibleY;

      if (visibleWidth <= 0 || visibleHeight <= 0) {
        console.log("No visible portion");
        return;
      }

      // Calculate scaling factors (video might be scaled to fit its container)
      const videoScaleX = video.videoWidth / videoRect.width;
      const videoScaleY = video.videoHeight / videoRect.height;

      // Convert screen coordinates to video coordinates
      const sourceX = (visibleX - videoRect.left) * videoScaleX;
      const sourceY = (visibleY - videoRect.top) * videoScaleY;
      const sourceWidth = visibleWidth * videoScaleX;
      const sourceHeight = visibleHeight * videoScaleY;

      // Create canvas matching the container size
      const canvas = document.createElement('canvas');
      canvas.width = containerRect.width;
      canvas.height = containerRect.height;

      const ctx = canvas.getContext("2d");

      // Fill background (white or transparent)
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate position relative to container
      const destX = visibleX - containerRect.left;
      const destY = visibleY - containerRect.top;

      // Draw the video portion at its original position in the container
      ctx.drawImage(
        video,
        sourceX, sourceY,           // Source coordinates (in video pixels)
        sourceWidth, sourceHeight,  // Source dimensions (in video pixels)
        destX, destY,               // Destination coordinates (relative to container)
        visibleWidth, visibleHeight // Destination dimensions (matches screen visible area)
      );

      return mergeCanvases(canvas, drawingCanvasRef);

    } catch (error) {
      console.log("error", error);
      return null;
    }
  };

  const mergeCanvases = (croppedCanvas, drawingCanvasRef) => {
    try {
      const drawingCanvas = drawingCanvasRef.current;

      if (!croppedCanvas || !drawingCanvas) return null;

      // Determine the final dimensions (use the larger of each dimension)
      const finalWidth = Math.max(croppedCanvas.width, drawingCanvas.width);
      const finalHeight = Math.max(croppedCanvas.height, drawingCanvas.height);

      // Create a new canvas for the cropped image (handling size differences)
      const adjustedCroppedCanvas = document.createElement('canvas');
      adjustedCroppedCanvas.width = finalWidth;
      adjustedCroppedCanvas.height = finalHeight;
      const adjustedCtx = adjustedCroppedCanvas.getContext('2d');

      // Fill with white background (or transparent if you prefer)
      adjustedCtx.fillStyle = 'white';
      adjustedCtx.fillRect(0, 0, finalWidth, finalHeight);

      // Calculate offsets for centering the cropped canvas if it's smaller
      const xOffset = croppedCanvas.width < finalWidth
        ? (finalWidth - croppedCanvas.width) / 2
        : 0;

      const yOffset = croppedCanvas.height < finalHeight
        ? (finalHeight - croppedCanvas.height) / 2
        : 0;

      // Draw the cropped canvas centered if smaller than final dimensions
      adjustedCtx.drawImage(
        croppedCanvas,
        xOffset,
        yOffset,
        croppedCanvas.width,
        croppedCanvas.height
      );

      // Create the final merged canvas
      const mergedCanvas = document.createElement('canvas');
      mergedCanvas.width = finalWidth;
      mergedCanvas.height = finalHeight;
      const ctx = mergedCanvas.getContext('2d');

      // First draw the adjusted cropped frame
      ctx.drawImage(adjustedCroppedCanvas, 0, 0);

      // Then draw the drawing canvas on top
      ctx.drawImage(drawingCanvas, 0, 0);

      return mergedCanvas;
    } catch (error) {
      console.error("Error in mergeCanvases:", error);
      return null;
    }
  };

  const takeScreenshot = async () => {
    try {
      setIsLoading(true);
      setCurrentScreenshot("");
      setIsScreenShotModelOpen(false);

      // Ensure video posters are shown before taking the screenshot
      const videos = document.querySelectorAll("#video-container video");
      videos.forEach(video => {
        // Ensure each video is briefly played to trigger poster image rendering
        if (!video.paused) return;  // Skip if video is already playing
        video.play();
        video.pause();
      });

      setTimeout(async () => {
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

        const croppedCanvas1 = extractCroppedFrame(videoRef, videoContainerRef, canvasRef);
        const croppedCanvas2 = videoRef2 && videoContainerRef2 && canvasRef2
          ? extractCroppedFrame(videoRef2, videoContainerRef2, canvasRef2)
          : null;

        if (!croppedCanvas1) {
          console.error("Could not create the cropped frame");
          return null;
        }

        let finalCanvas;

        if (croppedCanvas2) {
          // Create final canvas (vertical stack) when both videos exist
          finalCanvas = document.createElement('canvas');
          const finalWidth = Math.max(croppedCanvas1.width, croppedCanvas2.width);
          const finalHeight = croppedCanvas1.height + croppedCanvas2.height;
          finalCanvas.width = finalWidth;
          finalCanvas.height = finalHeight;

          const ctx = finalCanvas.getContext('2d');

          // Draw first canvas (centered horizontally)
          ctx.drawImage(
            croppedCanvas1,
            (finalWidth - croppedCanvas1.width) / 2, 0
          );

          // Draw second canvas below first one (centered horizontally)
          ctx.drawImage(
            croppedCanvas2,
            (finalWidth - croppedCanvas2.width) / 2, croppedCanvas1.height
          );
        } else {
          // Use only the first canvas if second video doesn't exist
          finalCanvas = croppedCanvas1;
        }

        // Create a new canvas to add watermark and copyright
        const watermarkedCanvas = document.createElement('canvas');
        watermarkedCanvas.width = finalCanvas.width;
        watermarkedCanvas.height = finalCanvas.height;
        const watermarkedCtx = watermarkedCanvas.getContext('2d');

        // Draw the original content first
        watermarkedCtx.drawImage(finalCanvas, 0, 0);

        // Add NetQuix logo at top left
        const logoImg = new Image();
        logoImg.src = "/assets/images/netquix_logo_beta.png";
        await new Promise((resolve) => {
          logoImg.onload = resolve;
        });

        const logoWidth = 100; // Scale based on canvas width
        const logoHeight = 35; // Scale based on canvas height
        const logoPadding = 5;

        watermarkedCtx.drawImage(
          logoImg,
          logoPadding + 5,
          logoPadding,
          logoWidth,
          logoHeight
        );

        // Add copyright text at bottom right
        watermarkedCtx.font = `16px Arial`;
        watermarkedCtx.fillStyle = "gray";
        watermarkedCtx.textAlign = "right";

        const copyrightText = "©NetQwix.com";
        const textPadding = 10;
        const textY = watermarkedCanvas.height - 10;

        watermarkedCtx.fillText(
          copyrightText,
          watermarkedCanvas.width - textPadding,
          textY
        );

        const dataUrl = watermarkedCanvas.toDataURL("image/png");
        console.log("dataUrl", dataUrl)
        // Restore visibility of hidden elements
        elementsToHide.forEach((el) => (el.style.visibility = "visible"));

        var res = await screenShotTake({
          sessions: id,
          trainer: fromUser?._id,
          trainee: toUser?._id,
        });

        const response = await fetch(dataUrl);
        const blob = await response.blob();

        if (!blob) {
          return toast.error("Unable to take Screen Shot");
        }

        if (res?.data?.url) {
          setIsScreenShotModelOpen(true);
          await pushProfilePhotoToS3(
            res?.data?.url,
            blob,
            null,
            afterSucessUploadImageOnS3
          );
          toast.success("The screenshot taken successfully.", {
            type: "success",
          });
        }
      }, 1000);
    } catch (error) {
      console.log("error: Take Screenshot: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("IsScreenShotModelOpen", isScreenShotModelOpen);
  console.log("TimeOut", timeoutId)
  const handleStartCall = async () => {
    try {

      const checkIPVersion = async () => {
        try {
          const res = await fetch("https://api64.ipify.org?format=json");
          const data = await res.json();
          const ipAddress = data.ip;
          const isIPv6 = ipAddress.includes(":");
          toast.success(`You are using ${isIPv6 ? 'IPv6' : 'IPv4'}.`);
        } catch (error) {
          console.error("Error fetching IP version:", error);
          toast.error("Failed to determine IP version.");
        }
      };

      checkIPVersion();
      // Check permissions for camera and microphone
      const cameraPermission = await navigator.permissions.query({ name: 'camera' });
      const micPermission = await navigator.permissions.query({ name: 'microphone' });

      // Handle camera and mic permission states
      if (cameraPermission.state === 'denied' && micPermission.state === 'denied') {
        setPermissionModal(true);
        setErrorMessageForPermission("Kindly allow us access to your camera and microphone.");
        return;
      }

      if (cameraPermission.state === 'denied') {
        setPermissionModal(true);
        setErrorMessageForPermission("Camera permission is denied. Please enable camera for video call.");
        return;
      }

      if (micPermission.state === 'denied') {
        setPermissionModal(true);
        setErrorMessageForPermission("Microphone permission is denied. Please enable microphone for video call.");
        return;
      }

      // Check if any camera or microphone device is connected
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameraDevices = devices.filter(device => device.kind === 'videoinput');
      const micDevices = devices.filter(device => device.kind === 'audioinput');

      // Handle the case where no camera or microphone is connected
      if (cameraDevices.length === 0) {
        setPermissionModal(true);
        setErrorMessageForPermission("No camera device detected. Please connect a camera.");
        return;
      }

      if (micDevices.length === 0) {
        setPermissionModal(true);
        setErrorMessageForPermission("No microphone device detected. Please connect a microphone.");
        return;
      }

      // If permissions are granted, proceed with starting the call
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setPermissionModal(false);
      setLocalStream(stream);
      setDisplayMsg({
        show: true,
        msg: `Waiting for ${toUser?.fullname} to join...`,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Handle socket disconnect or errors after initial connection
      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected due to:', reason);
        toast.error("You have been disconnected from the server. Please reconnect.");
        // Additional logic to handle the disconnect (e.g., retry connection or show UI)
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connect error:', err);
        toast.error("Socket connection error occurred. Please try again later.");
        // Handle reconnection or other recovery mechanisms
      });

      socket.on('reconnect_error', (err) => {
        console.error('Socket reconnect error:', err);
        toast.error("Unable to reconnect to the server. Please try again later.");
      });

      socket.on('reconnect_failed', () => {
        toast.error("Reconnection to the server failed. Please check your internet and try again.");
      });

      console.log("startMeeting", startMeeting)

      const peer = new Peer(fromUser._id, {
        config: { iceServers: startMeeting.iceServers },
      });

      peer.on("error", (error) => {
        console.error("Peer error:", error);
        console.log("error", error.type, error.message)

        switch (error.type) {
          case 'browser-incompatible':
            toast.error("The browser does not support some or all WebRTC features.");
            break;
          case 'disconnected':
            toast.error("You have been disconnected from the server. No new connections can be made.");
            break;
          case 'invalid-id':
            toast.error("The ID contains illegal characters.");
            break;
          case 'invalid-key':
            toast.error("The API key contains illegal characters or is not recognized.");
            break;
          case 'network':
            toast.error("Lost or unable to establish a connection to the signaling server.");
            break;
          case 'peer-unavailable':
            toast.error("The peer you're trying to connect to does not exist.");
            break;
          case 'ssl-unavailable':
            toast.error("SSL is unavailable on the server. Consider using a custom PeerServer.");
            break;
          case 'server-error':
            toast.error("Unable to reach the server. Please try again later.");
            break;
          case 'socket-error':
            toast.error("A socket error occurred.");
            break;
          case 'socket-closed':
            toast.error("The underlying socket was closed unexpectedly.");
            break;
          case 'unavailable-id':
            setUserAlreadyInCall(true);
            toast.error("You have joined the lesson from another device or browser. Please end call there to join..");
            break;
          case 'webrtc':
            toast.error("A native WebRTC error occurred.");
            break;
          default:
            toast.error("An error occurred while trying to start the call.");
        }
      });

      peerRef.current = peer;

      // Handle Peer events
      peer.on("open", (id) => {
        socket.emit("ON_CALL_JOIN", {
          userInfo: { from_user: fromUser._id, to_user: toUser._id },
        });

        console.log("call joined");
      });



      peer.on("call", (call) => {
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          setIsTraineeJoined(true);
          setDisplayMsg({ show: false, msg: "" });
          setRemoteStream(remoteStream);
        });
      });
    } catch (err) {
      console.log("error", err);
      toast.error("Something Went Wrong.")
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

  }, [remoteStream]);

  const connectToPeer = (peer, peerId) => {
    if (!(localVideoRef && localVideoRef?.current)) return;
    const call = peer.call(peerId, localVideoRef?.current?.srcObject);
    call?.on("stream", (remoteStream) => {
      // console.log(`setting remoteStream for 2nd user here ---- `);
      setDisplayMsg({ show: false, msg: "" });
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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

  socket.on("ON_BOTH_JOIN", (data) => {
    console.log("newEndTimeStr",data.socketReq.newEndTimeStr)
    if(accountType === AccountType.TRAINEE){
      setSessionEndTime(data.socketReq.newEndTimeStr)
    }
  });

  const listenSocketEvents = () => {

    socket.on("ON_CALL_JOIN", ({ userInfo }) => {
      const { to_user, from_user } = userInfo;
      if (!(peerRef && peerRef.current)) return;
      connectToPeer(peerRef.current, from_user);
    });



    // Handle signaling events from the signaling server
    socket.on(EVENTS.VIDEO_CALL.ON_OFFER, (offer) => {
      // console.log(` -- on OFFER --`);
      peerRef.current?.signal(offer);
    });

    socket.on(EVENTS.VIDEO_CALL.ON_ANSWER, (answer) => {
      // console.log(` -- on answer --`);
      peerRef.current?.signal(answer);
    });

    socket.on(EVENTS.VIDEO_CALL.ON_ICE_CANDIDATE, (candidate) => {
      // console.log(` -- on ICE candidate --`);
      peerRef.current?.signal(candidate);
    });


    socket.on(EVENTS.VIDEO_CALL.STOP_FEED, ({ feedStatus }) => {
      setIsRemoteStreamOff(feedStatus);
    });


    socket.on(EVENTS.VIDEO_CALL.ON_CLOSE, () => {
      setDisplayMsg({
        show: true,
        msg: `${toUser?.fullname} left the meeting. Waiting for them to join`,
      });

      // },20000)
    });
  };

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
    if (!userAlreadyInCall) {
      handlePeerDisconnect();
    }
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
    let videorefSrc = localVideoRef.current;
    if (localVideoRef && videorefSrc && videorefSrc.srcObject) {
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

  console.log("displayMessage", displayMsg)

  const cutCall = (manually) => {
    if (!userAlreadyInCall) {
      socket.emit(EVENTS.VIDEO_CALL.ON_CLOSE, {
        userInfo: { from_user: fromUser._id, to_user: toUser._id }
      });
    }

    // Show session ended modal if not already shown
    if (!showSessionEndedModal && manually) {
      setShowSessionEndedModal(true);
    } else {
      cleanupFunction();
      if (AccountType.TRAINER === accountType) {
        setIsOpenReport(true);
      } else if (accountType === AccountType.TRAINEE) {
        setIsOpenRating(true);
      }
    }
  };

  const handelTabClose = async () => {
    // mediaRecorder?.stop();
    // setRecording(false);
    socket.emit("chunksCompleted");
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'You are currently in a call. Are you sure you want to leave or reload? This will disconnect the call.';
    };

    const handleUnload = () => {
      cutCall()
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);


    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);

    };
  }, []);

  const width1200 = useMediaQuery("(max-width:1200px)")

  useEffect(() => {
    if (fromUser && toUser && startMeeting?.iceServers && accountType) {
      if (typeof navigator !== "undefined") {
        Peer = require("peerjs").default;
      }
      handleStartCall();
      listenSocketEvents()
      window.addEventListener("offline", handleOffline);
      window.addEventListener("beforeunload", handelTabClose);

      return () => {
        window.removeEventListener("beforeunload", handelTabClose);
        window.removeEventListener("offline", handleOffline);

        // cutCall();
      };
    }
  }, [startMeeting, accountType]);
  console.log("SessionEndTime",sessionEndTime)
  // Add this useEffect to handle session extension when both parties join
  useEffect(() => {
    if (extended_session_end_time) {
      console.log("extended_session_end_time",extended_session_end_time)
      setSessionEndTime(extended_session_end_time)
    } else {
      if (isTraineeJoined && accountType === AccountType.TRAINER) {
        extendSessionTime();
        setIsSessionExtended(true);
      }
    }

  }, [isTraineeJoined]);

  console.log("refs", localVideoRef, remoteVideoRef, remoteStream);
  console.log("videoRef", videoRef)
  return (
    <div
      className="video-call-container"
      style={{
        alignItems: isMaximized ? "normal" : "center",
        margin: isLandscape ? "auto" : "none",
        width: isLandscape ? "50%" : "100%",
      }}
    >
      {displayMsg?.show ? <div style={{ textAlign: "center" }}>{displayMsg?.msg}</div> : null}
      {selectedClips && selectedClips.length > 0 ? (
        <ClipModeCall
          timeRemaining={sessionEndTime}
          isMaximized={isMaximized}
          setIsMaximized={setIsMaximized}
          selectedClips={selectedClips}
          setSelectedClips={setSelectedClips}
          isLock={isLockMode}
          localVideoRef={localVideoRef}
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
          canvasRef={canvasRef}
          canvasRef2={canvasRef2}
          videoRef={videoRef}
          videoRef2={videoRef2}
          videoContainerRef={videoContainerRef}
          videoContainerRef2={videoContainerRef2}
          setShowScreenshotButton={setShowScreenshotButton}
        />
      ) : (
        <OneOnOneCall
          timeRemaining={sessionEndTime}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          localVideoRef={localVideoRef}
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
          setShowScreenshotButton={setShowScreenshotButton}
        />
      )}
      {!isMaximized && (
        <ActionButtons
          setSelectedUser={setSelectedUser}
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
          setIsConfirmModelOpen={setIsConfirmModelOpen}
          showScreenshotButton={showScreenshotButton}
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
                <Nav tabs className="" style={{
                  justifyContent: 'center',
                  flexWrap: "nowrap",
                  gap: "5px",
                }}>
                  <NavItem className="mb-2" style={{
                    width: "100%"
                  }}>
                    <NavLink
                      className={`button-effect ${videoActiveTab === "media" ? "active" : ""
                        } select-clip-width`}
                      style={{
                        minWidth: "auto",
                      }}
                      onClick={() => setAideoActiveTab("media")}
                    >
                      My Videos
                    </NavLink>
                  </NavItem>
                  <NavItem className="mb-2 " style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center"
                  }}>
                    <NavLink
                      className={`button-effect ${videoActiveTab === "trainee" ? "active" : ""
                        } select-clip-width`}

                      style={{
                        minWidth: "auto",
                      }}
                      onClick={() => setAideoActiveTab("trainee")}
                    >
                      Enthusiast
                    </NavLink>
                  </NavItem>
                  <NavItem className="mb-2" style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "end"
                  }}>
                    <NavLink
                      className={`button-effect ${videoActiveTab === "docs" ? "active" : ""
                        } select-clip-width`}
                      style={{
                        minWidth: "auto",
                      }}
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
                      style={{ overflowY: "auto", height: "40dvh" }}
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
                                      className={`${width1200 ? "col-3" : "col-2"} p-1`}
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
                    {clips && clips.length !== 0 && (
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
                      style={{ overflowY: "auto", height: "40dvh" }}
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
                              {/* {cl?._id?.fullname}
                              <label className="badge badge-primary sm ml-2">
                                {cl?.clips?.length}
                              </label> */}
                            </h5>
                            {/*  NORMAL  STRUCTURE END  */}
                            <div className={`block-content `}>
                              <div className="row" style={{ margin: 0 }}>
                                {cl?.clips.map((clp, index) => {
                                  var sld = selectClips.find(
                                    (val) => val?._id === clp?._id
                                  );
                                  return (
                                    <div
                                      key={index}
                                      className={`${width1200 ? "col-3" : "col-2"} p-1`}
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
                                            clp
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

                    {traineeClip && traineeClip.length !== 0 && (
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
                      style={{ overflowY: "auto", height: "40dvh" }}
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
                                  className={`${width1200 ? "col-3" : "col-2"} p-1`}
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

                    {netquixVideos && netquixVideos?.length !== 0 && (
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
          currentScreenShot={currentScreenShot}
          setIsOpenDetail={setIsScreenShotModelOpen}
          isOpenDetail={isScreenShotModelOpen}
          currentReportData={{
            session: id,
            trainer: fromUser?._id,
            trainee: toUser?._id,
          }}
          isLoading={isLoading}
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
        isFromCalling={true}
      />

      {accountType === AccountType.TRAINEE &&
        <ReactStrapModal
          allowFullWidth={true}
          element={
            <TraineeRatings
              accountType={accountType}
              booking_id={id}
              key={id}
              onClose={() => {
                setIsOpenRating(false)
              }}
              isFromCall={true}
              trainer={toUser}
            />
          }
          isOpen={isOpenRating}
          id={id}
        // width={"50%"}
        />}

      <PermissionModal isOpen={permissionModal} errorMessage={errorMessageForPermission} />

      <Modal isOpen={isConfirmModelOpen}>
        <ModalHeader>
          <h5
            style={{
              fontSize: "22px !important"
            }}
          >{`Are you sure you want to exit the session?`}</h5>
        </ModalHeader>
        <ModalBody>
          <div className="row"
            style={{
              justifyContent: "space-between"
            }}
          >
            <Button
              className="mx-3"
              color="primary"
              onClick={() => {
                setIsConfirmModelOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              className="mx-3"
              color="danger"
              onClick={() => {
                cutCall();
                if (accountType === AccountType.TRAINER) {
                  socket.emit(EVENTS.CALL_END, {
                    userInfo: { from_user: fromUser._id, to_user: toUser._id }
                  });
                }

              }}
            >
              Yes
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Grace Period Modal (-4 minutes) */}
      <Modal isOpen={showGracePeriodModal} centered >
        <ModalHeader>Thank you for using NetQwix!</ModalHeader>
        <ModalBody>
          <p>
            We give our community a 5 minute grace period after each session to say good bye
            and discuss the game plan moving forward.
          </p>
          <p>
            The session will automatically close in {countdownMessage}.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() =>{gracePeriodModalDismissedRef.current = true; setShowGracePeriodModal(false);}}>
            OK
          </Button>
        </ModalFooter>
      </Modal>

      {/* Session Ended Modal (-5 minutes) */}
      <Modal isOpen={showSessionEndedModal} centered>
        <ModalHeader>Your session has now ended.</ModalHeader>
        <ModalBody>
          <p>
            Please make sure to rate your experience momentarily.
          </p>
          <p>
            Visit your locker shortly to view your game plan.
          </p>
          <p>
            Thank you for using NetQwix.
          </p>
          <p>
            See you soon!
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => {
            sessionEndedModalDismissedRef.current = true;
            setShowSessionEndedModal(false);
            if (accountType === AccountType.TRAINEE) {
              setIsOpenRating(true);
            }else{
              setIsOpenReport(true)
            }
          }}>
            OK
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default VideoCallUI;
