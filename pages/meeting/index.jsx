import { useRouter } from "next/router";
import { authAction, authState } from "../../app/components/auth/auth.slice";
import StartMeeting from "../../app/components/bookings/start";
import "../dashboard/index"
import {
  bookingsAction,
  bookingsState,
  getScheduledMeetingDetailsAsync,
} from "../../app/components/common/common.slice";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { useEffect, useState } from "react";
import { getSocket, SocketContext } from "../../app/components/socket";
import { LOCAL_STORAGE_KEYS, topNavbarOptions } from "../../app/common/constants";
import { useMediaQuery } from "usehooks-ts";
import { useWindowDimensions } from "../../app/hook/useWindowDimensions";
import OrientationModal from "../../app/components/modalComponent/OrientationModal";
import VideoCallUI from "../../app/components/portrait-calling";
const RenderVideoCall = ({height,width,isRotatedInitally}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const id = router?.query?.id;

  // Get the state slices
  const { scheduledMeetingDetails, loading ,startMeeting} = useAppSelector(bookingsState); // Assuming `loading` indicates the fetching state
  const { accountType } = useAppSelector(authState);

  // Find the meeting details using the id
  const meetingDetails = scheduledMeetingDetails?.find(
    (meeting) => meeting._id === id
  );

  // Define the MeetingSetter function
  const MeetingSetter = (payload) => {
    dispatch(bookingsAction.setStartMeeting(payload));
  };

  useEffect(()=>{
    MeetingSetter({
      ...startMeeting,
      id: meetingDetails._id,
      isOpenModal: true,
      traineeInfo: meetingDetails.trainee_info,
      trainerInfo: meetingDetails.trainer_info,
      iceServers: meetingDetails.iceServers,
      trainee_clip: meetingDetails.trainee_clips,
    });
  },[meetingDetails])

  console.log("meetingDetails", meetingDetails, accountType);
  return (
    // height > width && !isRotatedInitally ?
    <VideoCallUI
    id={meetingDetails._id}
      accountType={accountType}
      traineeInfo={meetingDetails.trainee_info}
      trainerInfo={meetingDetails.trainer_info}
      session_end_time={meetingDetails.session_end_time}
      session_start_time={meetingDetails.session_start_time}
      isClose={() => {
        MeetingSetter({
          id: null,
          isOpenModal: false,
          traineeInfo: null,
          trainerInfo: null,
        });
        dispatch(authAction?.setTopNavbarActiveTab(topNavbarOptions?.HOME));
        router.push("/dashboard")
      }}
      isLandscape={height < width}

    />
    // :
    // <StartMeeting
    //   id={meetingDetails._id}
    //   accountType={accountType}
    //   traineeInfo={meetingDetails.trainee_info}
    //   trainerInfo={meetingDetails.trainer_info}
    //   session_end_time={meetingDetails.session_end_time}
    //   isClose={() => {
    //     MeetingSetter({
    //       id: null,
    //       isOpenModal: false,
    //       traineeInfo: null,
    //       trainerInfo: null,
    //     });
    //     dispatch(authAction?.setTopNavbarActiveTab(topNavbarOptions?.HOME));
    //     router.push("/dashboard")
    //   }}
    // />
  );
};

const MeetingRoom = () => {

  const { height, width } = useWindowDimensions();
  const [isRotatedInitally, setIsRotatedInitally] = useState(false);
  useEffect(() => {
    if (height < width) setIsRotatedInitally(true)
  }, [height, width])

  const mediaQuery = useMediaQuery("(min-width: 992px)");
  const { isLoading, configs, startMeeting } = useAppSelector(bookingsState);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const id = router?.query?.id;

  // Get the state slices
  const { scheduledMeetingDetails, loading } = useAppSelector(bookingsState); // Assuming `loading` indicates the fetching state
  const { accountType } = useAppSelector(authState);

  // Find the meeting details using the id
  const meetingDetails = scheduledMeetingDetails?.find(
    (meeting) => meeting._id === id
  );
  
  useEffect(() => {
    dispatch(getScheduledMeetingDetailsAsync());
    dispatch(authAction?.setAccountType(localStorage.getItem(LOCAL_STORAGE_KEYS?.ACC_TYPE)))
  }, [dispatch]);

  console.log("meetingDetails", meetingDetails, accountType);
  return (
    <SocketContext.Provider value={getSocket()}>
      {loading ||
      !scheduledMeetingDetails ||
      !meetingDetails ||
      !accountType ? (
        <div>Loading...</div>
      ) : (
        (() => {
            switch (meetingDetails.status) {
              case "confirmed":
                return (
                  <div id="get-navbar-tabs" className="get-navbar-tabs">
                    <div
                      id="bookings"
                      className={
                        mediaQuery.matches
                          ? "video_call custom-scroll position-relative"
                          : "custom-scroll scoll-content position-relative"
                      }
                      onScroll={() => {
                        if (configs.sidebar.isMobileMode) {
                          dispatch(isSidebarToggleEnabled(true));
                        }
                      }}
                    >
                      <RenderVideoCall height={height} width={width} isRotatedInitally={isRotatedInitally}/>
                    </div>
                  </div>
                );
    
              case "cancelled":
                return (
                  <div className="booking-status-message">
                    This booking has been cancelled. You cannot access it now.
                  </div>
                );
    
              case "booked":
                return (
                  <div className="booking-status-message">
                    Please wait until the booking is confirmed.
                  </div>
                );
    
              case "completed":
                return (
                  <div className="booking-status-message">
                    This booking is already completed. You cannot access it now.
                  </div>
                );
    
              default:
                return (
                  <div className="booking-status-message">
                    Invalid booking status. Please check again.
                  </div>
                );
            }
          })()
      )}
    </SocketContext.Provider>
  );
};

export default MeetingRoom;
