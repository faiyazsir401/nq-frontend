import React, { useEffect, useState ,useLayoutEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  addTraineeClipInBookedSessionAsync,
  bookingsAction,
  bookingsState,
  getScheduledMeetingDetailsAsync,
} from "../common/common.slice";
import { formatTimeInLocalZone, formatToAMPM, Utils } from "../../../utils/utils";
import {
  AccountType,
  BookedSession,
  bookingButton,
  topNavbarOptions,
} from "../../common/constants";
import { authAction, authState } from "../auth/auth.slice";
import TraineeRenderBooking from "./TraineeRenderBooking";
import TrainerRenderBooking from "./TrainerRenderBooking";
import StartMeeting from "./start";
import Modal from "../../common/modal";
import { Star, X } from "react-feather";
import { myClips } from "../../../containers/rightSidebar/fileSection.api";
import moment from "moment-timezone";
import axios from "axios";
import Ratings from "./ratings";
import ReactStrapModal from "../../common/modal";
import { commonState } from "../../common/common.slice";
import { traineeAction, traineeState } from "../trainee/trainee.slice";
import OrientationModal from "../modalComponent/OrientationModal";
import { useMediaQuery } from "usehooks-ts";
import TraineeRatings from "./ratings/trainee";
import { DateTime } from "luxon";



export var meetingRoom = () => <></>;

const BookingList = ({ activeCenterContainerTab, activeTabs }) => {
  const [tabBook, setTabBook] = useState(bookingButton[0]);
  const [selectedClips, setSelectedClips] = useState([]);
  const [isOpenID, setIsOpenID] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { newBookingData } = useAppSelector(traineeState);
  const { scheduledMeetingDetails, addRatingModel } =
    useAppSelector(bookingsState);
  const { removeNewBookingData } = traineeAction;
  const { accountType } = useAppSelector(authState);
  const [bookedSession, setBookedSession] = useState({
    id: "",
    booked_status: "",
  });
  const { isLoading, configs , startMeeting  } = useAppSelector(bookingsState);
  const { userInfo } = useAppSelector(authState);
  const mediaQuery = window.matchMedia("(min-width: 992px)");
  const [userTimeZone, setUserTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const { addRating } = bookingsAction;
  const [bIndex, setBIndex] = useState(0);
  const MeetingSetter = (payload) =>{
    dispatch(bookingsAction.setStartMeeting(payload))
  }

  useEffect(() => {
    if (userInfo?.extraInfo?.working_hours?.time_zone) {
      getIANATimeZone(userInfo?.extraInfo?.working_hours?.time_zone);
    }
  }, [userInfo?.extraInfo?.working_hours?.time_zone]);

  const getIANATimeZone = async (timezoneString) => {
    const matches = timezoneString.match(/\(UTC ([\+\-]\d+:\d+)\)/);
    const utcOffset = matches ? matches[1] : null;

    if (utcOffset === "-5:00") {
      return setUserTimeZone("America/New_York");
    }
    if (utcOffset === "-6:00") {
      return setUserTimeZone("America/Chicago");
    }
    if (utcOffset === "-7:00") {
      return setUserTimeZone("America/Denver");
    }
    if (utcOffset === "-8:00") {
      return setUserTimeZone("America/Los_Angeles");
    }
    if (utcOffset === "+5:30") {
      return setUserTimeZone("Asia/Calcutta");
    }
    const response = await axios.get(
      "https://fullcalendar.io/api/demo-feeds/timezones.json"
    );
    var timeZones = response.data;
    const ianaTimeZone = utcOffset
      ? timeZones.find(
          (tz) =>
            moment.tz(tz).utcOffset() === moment.duration(utcOffset).asMinutes()
        )
      : "";
    // console.log("=====>ianaTimeZone", ianaTimeZone, utcOffset)
    setUserTimeZone(
      ianaTimeZone
        ? ianaTimeZone
        : Intl.DateTimeFormat().resolvedOptions().timeZone
    );
  };
  // const [startMeeting, setStartMeeting] = useState({
  //   trainerInfo: null,
  //   traineeInfo: null,
  //   id: null,
  //   isOpenModal: false,
  // });

  useEffect(() => {
    if (activeCenterContainerTab === "upcomingLesson") {
      // if (accountType === AccountType.TRAINER) {
      //   if (tabBook === bookingButton[0]) {
      //     const payload = {
      //       status: tabBook,
      //     };
      //     dispatch(getScheduledMeetingDetailsAsync(payload));
      //   }
      // } else {
      //   dispatch(getScheduledMeetingDetailsAsync());
      // }
      if (tabBook === bookingButton[0]) {
        const payload = {
          status: tabBook,
        };
        dispatch(getScheduledMeetingDetailsAsync(payload));
      }
    }
  }, [tabBook,activeCenterContainerTab]);

  // Filter sessions that are confirmed and within the current time range (same as active sessions)
  const filteredSessions = scheduledMeetingDetails.filter((session) => {
    const { start_time, end_time, ratings } = session;

    const currentTime = DateTime.now(); // Use UTC to avoid timezone mismatch

    // Parse the start_time and end_time in UTC
    const startTime = DateTime.fromISO(start_time, { zone: "utc" });
    const endTime = DateTime.fromISO(end_time, { zone: "utc" });

    // Extract date and time components
    const currentDate = currentTime.toFormat("yyyy-MM-dd"); // YYYY-MM-DD format
    const currentTimeOnly = currentTime.toFormat("HH:mm"); // HH:mm format

    const startDate = startTime.toFormat("yyyy-MM-dd");
    const startTimeOnly = startTime.toFormat("HH:mm");

    const endDate = endTime.toFormat("yyyy-MM-dd");
    const endTimeOnly = endTime.toFormat("HH:mm");

    // Compare the current date and time (date + hour:minute) with start and end time
    const isDateSame = currentDate === startDate && currentDate === endDate;
    const isWithinTimeFrame =
      isDateSame &&
      currentTimeOnly >= startTimeOnly &&
      currentTimeOnly <= endTimeOnly;
    return isWithinTimeFrame && !ratings;
  });

  const showRatingLabel = (ratingInfo) => {
    // for trainee we're showing recommends
    return ratingInfo &&
      ratingInfo[accountType.toLowerCase()] &&
      (ratingInfo[accountType.toLowerCase()].sessionRating ||
        ratingInfo[accountType.toLowerCase()].sessionRating) ? (
      <div className="d-flex items-center">
        {" "}
        {/* You rated{" "} */}
        You rated this session{" "}
        <b className="pl-2">
          {ratingInfo[accountType.toLowerCase()].sessionRating ||
            ratingInfo[accountType.toLowerCase()].sessionRating}
        </b>
        <Star color="#FFC436" size={28} className="star-container star-svg" />{" "}
        stars
        {/* to this {accountType?.toLowerCase()}. */}
      </div>
    ) : null;
  };

  const isMeetingCompleted = (detail) => {
    return (
      detail.status === BookedSession.completed ||
      (detail &&
        detail.ratings &&
        detail.ratings[accountType.toLowerCase()] &&
        detail.ratings[accountType.toLowerCase()].sessionRating)
    );
  };

  const addTraineeClipInBookedSession = async (selectedClips) => {
    const payload = {
      id: isOpenID,
      trainee_clip: selectedClips?.map((val) => val?._id),
    };
    dispatch(addTraineeClipInBookedSessionAsync(payload));
    dispatch(removeNewBookingData());
    setIsOpen(false);
    // setIsModalOpen(false);
  };
  const [selectedTrainer,setSelectedTrainer] = useState(null)
  const handleAddRatingModelState = (data,trainer_info) => {
    dispatch(addRating(data));
    if(trainer_info){
      setSelectedTrainer(trainer_info)

    }
  };


  const renderBooking = (
    bookingInfo,
    status,
    booking_index,
    booked_date,
    session_start_time,
    session_end_time,
    _id,
    trainee_info,
    trainer_info,
    ratings,
    trainee_clips,
    report,
    start_time,
    end_time
  ) => {
    const availabilityInfo = Utils.meetingAvailability(
      booked_date,
      session_start_time,
      session_end_time,
      userTimeZone,
      start_time,
      end_time
    );
    const {
      isStartButtonEnabled,
      has24HoursPassedSinceBooking,
      isCurrentDateBefore,
      isUpcomingSession,
    } = availabilityInfo;

    const isMeetingDone =
      isMeetingCompleted(scheduledMeetingDetails[booking_index]) ||
      has24HoursPassedSinceBooking;

    switch (accountType) {
      case AccountType.TRAINER:
        
        return (
          <TrainerRenderBooking
            _id={_id}
            status={status}
            trainee_info={trainee_info}
            trainer_info={trainer_info}
            isCurrentDateBefore={isCurrentDateBefore}
            isStartButtonEnabled={isStartButtonEnabled}
            isMeetingDone={isMeetingDone}
            isUpcomingSession={isUpcomingSession}
            ratings={ratings}
            booking_index={booking_index}
            has24HoursPassedSinceBooking={has24HoursPassedSinceBooking}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            selectedClips={selectedClips}
            setSelectedClips={setSelectedClips}
            setIsOpenID={setIsOpenID}
            addTraineeClipInBookedSession={addTraineeClipInBookedSession}
            trainee_clips={trainee_clips}
            report={report}
            bookedSession={bookedSession}
            setBookedSession={setBookedSession}
            tabBook={tabBook}
            setStartMeeting={MeetingSetter}
            startMeeting={startMeeting}
            handleAddRatingModelState={handleAddRatingModelState}
            updateParentState={(value) => {
              setBIndex(value);
            }}
            activeTabs={activeTabs}
            start_time={start_time}
            bookingInfo={bookingInfo}
          />
        );
      case AccountType.TRAINEE:
        
        return (
          <TraineeRenderBooking
            _id={_id}
            status={status}
            trainee_info={trainee_info}
            trainer_info={trainer_info}
            isCurrentDateBefore={isCurrentDateBefore}
            isStartButtonEnabled={isStartButtonEnabled}
            isMeetingDone={isMeetingDone}
            isUpcomingSession={isUpcomingSession}
            ratings={ratings}
            booking_index={booking_index}
            has24HoursPassedSinceBooking={has24HoursPassedSinceBooking}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            selectedClips={selectedClips}
            setSelectedClips={setSelectedClips}
            setIsOpenID={setIsOpenID}
            isOpenID= {isOpenID}
            addTraineeClipInBookedSession={addTraineeClipInBookedSession}
            trainee_clips={trainee_clips}
            report={report}
            bookedSession={bookedSession}
            setBookedSession={setBookedSession}
            tabBook={tabBook}
            setStartMeeting={MeetingSetter}
            startMeeting={startMeeting}
            handleAddRatingModelState={handleAddRatingModelState}
            updateParentState={(value) => {
              setBIndex(value);
            }}
            accountType={AccountType.TRAINEE}
            activeTabs={activeTabs}
            start_time={start_time}
            bookingInfo={bookingInfo}
          />
        );
      default:
        break;
    }
  };

  const BookingCard = ({ bookingInfo, booking_index }) => {
    const {
      _id,
      trainee_info,
      trainer_info,
      booked_date,
      session_start_time,
      session_end_time,
      status,
      ratings,
      trainee_clips,
      report,
      start_time,
      end_time,
      time_zone, // Assuming 'time_zone' is coming from API
    } = bookingInfo;

    
    // Convert start and end times to local time if the time zone is different
    const localStartTime = formatTimeInLocalZone(start_time);
    const localEndTime = formatTimeInLocalZone(end_time);

    // const isMobileScreen = useMediaQuery("(max-width:600px)")
    
    console.log("bookingInfo:" + _id, localStartTime); // Displaying the converted start time
    const isMobileScreen = useMediaQuery('(max-width:600px)')
    return (
     <div
                   className="card mt-2 trainer-bookings-card upcoming_session_content"
                   key={`booking-schedule-training`}
                 >
                   <div className="card-body" style={{padding:"5px"}}>
                     <div className="d-flex justify-content-center " style={{gap:isMobileScreen?"5px":"30px"}}>
                       <div className="">
                         <div className="">
                           <div className="">
                             <div className="">
                               <div
                                 style={{
                                   width: "80px",
                                   height: "80px",
                                   border: "2px solid rgb(0, 0, 128)",
                                   borderRadius: "5px",
                                   padding: "5px",
                                 }}
                               >
                                 <img
                                   src={
                                     trainer_info.profile_picture ||
                                     trainee_info.profile_picture
                                       ? Utils.getImageUrlOfS3(
                                         accountType === AccountType.TRAINER
                                             ?trainee_info.profile_picture
                                             :  trainer_info.profile_picture
                                         )
                                       : "/assets/images/demoUser.png"
                                   }
                                   alt="trainer_image"
                                   className="rounded"
                                   style={{
                                     width: "100%",
                                     height: "100%",
                                     objectFit: "contain",
                                     borderRadius: "50%",
                                     transition: "all 0.6s linear",
                                   }}
                                   onError={(e) => {
                                     e.target.src = "/assets/images/demoUser.png";
                                   }}
                                 />
                               </div>
                             </div>
                           </div>
                         </div>
                         <div className="">
                           <div className="d-flex">
                             
                             <dt className="ml-1">
                               {accountType === AccountType.TRAINER
                                 ? trainee_info.fullname
                                 : trainer_info.fullname}
                             </dt>
                           </div>
                         </div>
                       </div>
     
                       <div className="d-flex flex-column justify-content-center">
                         <div className="">
                           <div
                             className={`d-flex ${
                               isMobileScreen ? "flex-column" : "flex-row"
                             }`}
                           >
                             <div>Date :</div>
                             <dt className="ml-1">
                               {Utils.getDateInFormat(booked_date)}
                             </dt>
                           </div>
                         </div>
     
                         <div className="">
                           <div
                             className={`d-flex ${
                               isMobileScreen ? "flex-column" : "flex-row"
                             }`}
                           >
                             <div className="">Time :</div>
                             <dt className="ml-1">{`${formatTimeInLocalZone(
                               start_time
                             )} - ${formatTimeInLocalZone(end_time)}`}</dt>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                   <div
                     className="card-footer"
                     style={{ padding: isMobileScreen ? "5px" : "5px",display:'flex',justifyContent:"center" }}
                   >
                     <div className="">
                       <div className="">
                         <div className="">{showRatingLabel(ratings)}</div>
                         <div className="">
                           {renderBooking(
                             bookingInfo,
                             status,
                             booking_index,
                             booked_date,
                             session_start_time,
                             session_end_time,
                             _id,
                             trainee_info,
                             trainer_info,
                             ratings,
                             trainee_clips,
                             report,
                             start_time,
                             end_time
                           )}
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
    );
  };

  const renderVideoCall = (height, width, isRotatedInitally) => 
      <StartMeeting
        id={startMeeting.id}
        accountType={accountType}
        traineeInfo={startMeeting.traineeInfo}
        trainerInfo={startMeeting.trainerInfo}
        session_end_time={scheduledMeetingDetails[bIndex]?.session_end_time}
        isClose={() => {
          MeetingSetter({
            ...startMeeting,
            id: null,
            isOpenModal: false,
            traineeInfo: null,
            trainerInfo: null,
          });
          dispatch(authAction?.setTopNavbarActiveTab(topNavbarOptions?.HOME));
        }}
      />

  meetingRoom = (height, width, isRotatedInitally) => {
    return (
      <div>
        {" "}
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
            return;
          }}
        >
          {renderVideoCall(height, width, isRotatedInitally)}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (startMeeting?.isOpenModal) {
      dispatch(
        authAction?.setTopNavbarActiveTab(topNavbarOptions?.MEETING_ROOM)
      );
    }
  }, [startMeeting?.isOpenModal]);

  const renderRating = () => {
    // console.log("trainer_info",trainer_info)
    return (
      <ReactStrapModal
        allowFullWidth={true}
        element={
          accountType === AccountType.TRAINEE?
          <TraineeRatings
            accountType={accountType}
            booking_id={addRatingModel._id}
            key={addRatingModel._id}
            trainer={selectedTrainer}
            onClose={() => {
              const payload = {
                _id: null,
                isOpen: false,
              };
              handleAddRatingModelState(payload);
            }}
            tabBook={tabBook}
          />
          :
          <Ratings
            accountType={accountType}
            booking_id={addRatingModel._id}
            key={addRatingModel._id}
            onClose={() => {
              const payload = {
                _id: null,
                isOpen: false,
              };
              handleAddRatingModelState(payload);
            }}
            tabBook={activeTabs}
          />
        }
        isOpen={addRatingModel.isOpen}
        id={addRatingModel._id}
        // width={"50%"}
      />
    );
  };

  console.log("filteredSessions",filteredSessions)
  return (
    <div>
      {!filteredSessions.length ? (
        // Show a message when there are no upcoming sessions
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "40px",
          }}
        >
          <h5 className="block-title">No upcoming Session</h5>
        </div>
      ) : (
        // Render scheduled meetings if there are any
        filteredSessions?.map((bookingInfo, booking_index) => (
          <BookingCard
            bookingInfo={bookingInfo}
            key={booking_index}
            booking_index={booking_index}
          />
        ))
      )}
      {addRatingModel.isOpen ? renderRating(startMeeting.trainerInfo) : null}
    </div>
  );
};

export default BookingList;
