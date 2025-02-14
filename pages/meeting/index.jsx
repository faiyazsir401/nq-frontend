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
    height > width && !isRotatedInitally ?
    <VideoCallUI
    id={meetingDetails._id}
      accountType={accountType}
      traineeInfo={meetingDetails.trainee_info}
      trainerInfo={meetingDetails.trainer_info}
      session_end_time={meetingDetails.session_end_time}
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
    />
    :
    <StartMeeting
      id={meetingDetails._id}
      accountType={accountType}
      traineeInfo={meetingDetails.trainee_info}
      trainerInfo={meetingDetails.trainer_info}
      session_end_time={meetingDetails.session_end_time}
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
    />
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
  let isMobile = useMediaQuery("(min-width: 452px)")
  useEffect(() => {
    // let getDashboard = document.querySelector("#get-dashboard");
    let getNavbarTabs = document.querySelector("#get-navbar-tabs");
    let getBookings = document.querySelector("#bookingsTab");
    let getBookingLesson = document.querySelector(".booking-container");
    let gettrainer = document.querySelector(".custom-trainer-scroll");
    let getvideoCall = document.querySelector(".video_call_reponsive")



    let customSidebarContentBooking = document.querySelector(".custom-sidebar-content-booking");
    let lockerDrawer = document.querySelector(".custom-mobile-menu.active")
    let isNotification = document.querySelector(".custom-mobile-notification-css")
    let isContact = document.querySelector(".custom-mobile-contact-css")
    let isAbout = document.querySelector(".custom-mobile-about-css")
    let isCommunity = document.querySelector(".custom-mobile-community-css")
    let isSetting = document.querySelector(".custom-mobile-setting-css")
    let istransaction = document.querySelector(".custom-mobile-transaction-css")
    let isfile = document.querySelector(".custom-mobile-file-css")

    if (getBookingLesson) {
      if (isMobile) {
        getBookingLesson.style.marginLeft = false ? '75px' : "0px";
      }
      getBookingLesson.style.marginLeft = false ? '65px' : "15px";

    }

    if (getvideoCall) {
      if (isMobile) {
        getvideoCall?.style?.setProperty('left', false ? '56px' : '0px', 'important');
        getvideoCall.style?.setProperty('max-width', 'calc(100vw - 0px)', '');
      } else {
        getvideoCall.style?.setProperty('width', 'calc(95vw)', '');
      }
    }

    if (gettrainer) {
      if (isMobile) {
        gettrainer?.style?.setProperty('margin', '0px', 'important');
        gettrainer?.style?.setProperty('margin-top', '20px', 'important');

        gettrainer?.style?.setProperty('padding', '0px', 'important');

        gettrainer?.style?.setProperty('left', false ? '52px' : '0px', 'important');
        gettrainer.style?.setProperty('max-width', false ? 'calc(100vw - 60px)' : 'calc(100vw - 0px)'); // Set max-width to calc(100vw - 105px)
      }
    }

    if (lockerDrawer) {
      lockerDrawer.style?.setProperty('margin-left', '105px', ''); // Set margin-left to 105px
      lockerDrawer.style?.setProperty('max-width', 'calc(100vw - 105px)', ''); // Set max-width to calc(100vw - 105px)
    }
    if (getBookings) {
      if (!isMobile) {

        getBookings.style.marginLeft = false ? '115px' : "0px";
      } else {
        getBookings.style.marginLeft = false ? '75px' : "0px";

        if (false) {
          isNotification?.style?.setProperty('margin-left', '55px', '');
          isNotification?.style?.setProperty('max-width', 'calc(100vw - 20px)', '');

          isSetting?.style?.setProperty('margin-left', '55px', '');
          isSetting?.style?.setProperty('max-width', 'calc(100vw - 20px)', '');

          istransaction?.style?.setProperty('margin-left', '55px', '');
          istransaction?.style?.setProperty('max-width', 'calc(100vw - 55px)', '');

          isfile?.style?.setProperty('margin-left', '55px', '');
          isfile?.style?.setProperty('max-width', 'calc(100vw - 55px)', '');
        } else {
          isNotification?.style?.setProperty('margin-left', '10px', '');
          isNotification?.style?.setProperty('max-width', 'calc(100vw - 10px)', '');

          isSetting?.style?.setProperty('margin-left', '10px', '');
          isSetting?.style?.setProperty('max-width', 'calc(100vw - 10px)', '');

          istransaction?.style?.setProperty('margin-left', '10px', '');
          istransaction?.style?.setProperty('max-width', 'calc(100vw - 10px)', '');

          isfile?.style?.setProperty('margin-left', '10px', '');
          isfile?.style?.setProperty('max-width', 'calc(100vw - 10px)', '');
        }

      }
    }
    // if (getDashboard) {
    //   getDashboard.style.marginLeft = false ? '105px' : "0px";
    // }
    if (getNavbarTabs) {
      if (isMobile) {
        getNavbarTabs.style.marginLeft = false ? '55px' : '0px';
        getNavbarTabs?.style?.setProperty('width', false ? 'calc(100vw - 55px)' : '100vw', 'important');
        if (false) {
          isNotification?.style?.setProperty('margin-left', '55px', '');
          isNotification?.style?.setProperty('max-width', 'calc(100vw - 20px)', '');

          isContact?.style?.setProperty('margin-left', '40px', '');
          isContact?.style?.setProperty('max-width', 'calc(100vw - 20px)', '');

          isAbout?.style?.setProperty('margin-left', '40px', '');
          isAbout?.style?.setProperty('max-width', 'calc(100vw - 20px)', '');

          isCommunity?.style?.setProperty('margin-left', '40px', '');
          isCommunity?.style?.setProperty('max-width', 'calc(100vw - 20px)', '');

          isSetting?.style?.setProperty('margin-left', '55px', '');
          isSetting?.style?.setProperty('max-width', 'calc(100vw - 20px)', '');

          istransaction?.style?.setProperty('margin-left', '55px', '');
          istransaction?.style?.setProperty('max-width', 'calc(100vw - 55px)', '');

          isfile?.style?.setProperty('margin-left', '55px', '');
          isfile?.style?.setProperty('max-width', 'calc(100vw - 55px)', '');
        } else {
          isNotification?.style?.setProperty('margin-left', '10px', '');
          isNotification?.style?.setProperty('max-width', 'calc(100vw - 10px)', '');

          isContact?.style?.setProperty('margin-left', '10px', '');
          isContact?.style?.setProperty('max-width', 'calc(100vw - 10px)', '');

          isAbout?.style?.setProperty('margin-left', '10px', '');
          isAbout?.style?.setProperty('max-width', 'calc(100vw - 10px)', '');

          isCommunity?.style?.setProperty('margin-left', '10px', '');
          isCommunity?.style?.setProperty('max-width', 'calc(100vw - 10px)', '');

          isSetting?.style?.setProperty('margin-left', '10px', '');
          isSetting?.style?.setProperty('max-width', 'calc(100vw - 10px)', '');

          istransaction?.style?.setProperty('margin-left', '10px', '');
          istransaction?.style?.setProperty('max-width', 'calc(100vw - 10px)', '');

          isfile?.style?.setProperty('margin-left', '10px', '');
          isfile?.style?.setProperty('max-width', 'calc(100vw - 10px)', '');
        }

      } else {
        getNavbarTabs.style.marginLeft = false && !document.getElementById("drawing-canvas") ? '105px' : '25px';
        getNavbarTabs?.style?.setProperty('width', false ? 'calc(100vw - 55px)' : 'calc(100vw - 25px)');

      }
    }
    if (customSidebarContentBooking) {
      customSidebarContentBooking?.style?.setProperty('width', false ? '85vw' : '100vw', 'important');
    }
    if (getvideoCall) {
      if (!isMobile) {
        getvideoCall?.style?.setProperty('width', false ? '85vw' : '95vw', 'important');
        getvideoCall?.style?.setProperty('left', false ? '5px' : '10px', 'important');
        getvideoCall?.style?.setProperty('margin-left', false ? '85px' : '0px', 'important');

      } else {
        getvideoCall?.style?.setProperty('width', false ? '85vw' : '95vw', 'important');
        getvideoCall?.style?.setProperty('left', false ? '5px' : '0px', 'important');
        getvideoCall?.style?.setProperty('margin-left', false ? '66px' : '20px', 'important');


      }


    }
  }, [isMobile])

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
