import React, { useEffect, useState, useRef } from "react";
import NavHomePageCenterContainer from "./NavHomePageCenterContainer";
import "./home.scss";
import ShareClipsCard from "../share-clips";
import UploadClipCard from "../videoupload/UploadClipCard";
import InviteFriendsCard from "../invite-friends";
import RecentUsers from "../recent-users";
import UserInfoCard from "../cards/user-card";
import { useMediaQuery } from "../../hook/useMediaQuery";
import {
  AccountType,
  bookingButton,
  LIST_OF_ACCOUNT_TYPE,
} from "../../common/constants";
import { useAppDispatch, useAppSelector } from "../../store";
import { authState } from "../auth/auth.slice";
import "./index.scss";
import Slider from "react-slick"; 
import OnlineUserCard from "./banner";
import {
  addTraineeClipInBookedSessionAsync,
  bookingsAction,
  bookingsState,
  getScheduledMeetingDetailsAsync,
} from "../common/common.slice";

import { convertTimesForDataArray, CovertTimeAccordingToTimeZone, formatTimeInLocalZone, Utils } from "../../../utils/utils";
import { Button } from "reactstrap";
import { DateTime } from "luxon";
import { traineeAction } from "../trainee/trainee.slice";
import { addRating } from "../common/common.api";
import TrainerRenderBooking from "../bookings/TrainerRenderBooking";
import TraineeRenderBooking from "../bookings/TraineeRenderBooking";
import { fetchAllLatestOnlineUsers } from "../auth/auth.api";
import { acceptFriendRequest, getFriendRequests, rejectFriendRequest } from "../../common/common.api";
import { toast } from "react-toastify";
import { Star } from "react-feather";
const NavHomePage = () => {
  const [progress, setProgress] = useState(0);
  const width2000 = useMediaQuery(2000);
  const width1200 = useMediaQuery(1200);
  const width1000 = useMediaQuery(1000);
  const width900 = useMediaQuery(900);

  const width600 = useMediaQuery(700);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenID, setIsOpenID] = useState("");
  const [selectedClips, setSelectedClips] = useState([]);
  const [bookedSession, setBookedSession] = useState({
    id: "",
    booked_status: "",
  });
  const [bIndex, setBIndex] = useState(0);
  const [tabBook, setTabBook] = useState(bookingButton[0]);
  const { removeNewBookingData } = traineeAction;
  const { isLoading, configs, startMeeting } = useAppSelector(bookingsState);
  const { accountType, onlineUsers } = useAppSelector(authState);
  const [activeTrainer, setActiveTrainer] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [activeCenterTab, setActiveCenterTab] = useState("myClips");
  
  // Use refs to prevent duplicate API calls when switching tabs
  const hasFetchedFriendRequestsRef = useRef(false);
  const hasFetchedActiveTrainerRef = useRef(false);
  const hasFetchedScheduledMeetingsRef = useRef(false);
  
  
  const getFriendRequestsApi = async () => {
    try {
      let res = await getFriendRequests();
      setFriendRequests(res?.friendRequests);
       
    } catch (error) {
       
    }
  };

  useEffect(() => {
    // Only fetch if not already fetched
    if (!hasFetchedFriendRequestsRef.current) {
      hasFetchedFriendRequestsRef.current = true;
      getFriendRequestsApi();
    }
  }, []);

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      await acceptFriendRequest({ requestId });
      toast.success("Friend request accepted");
      getFriendRequestsApi();
    } catch (error) {
      toast.error(error);
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    try {
      await rejectFriendRequest({ requestId });
      toast.success("Friend request rejected");
      getFriendRequestsApi();
    } catch (error) {
      toast.error(error);
    }
  };

  const getAllLatestActiveTrainer = async () => {
    const response = await fetchAllLatestOnlineUsers();

    if (response.code === 200) {
      setActiveTrainer(response.result);
    }
  };

  //comment added

  const [userTimeZone, setUserTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const dispatch = useAppDispatch();
  const { scheduledMeetingDetails } = useAppSelector(bookingsState);
  
  useEffect(() => {
    // Check if data already exists in Redux before making API call
    // Only fetch if data doesn't exist or hasn't been fetched yet
    if (!hasFetchedScheduledMeetingsRef.current) {
      if (scheduledMeetingDetails && scheduledMeetingDetails.length > 0) {
        // Data already exists in Redux, use it
        hasFetchedScheduledMeetingsRef.current = true;
        return;
      }
      // No data in Redux, fetch it
      hasFetchedScheduledMeetingsRef.current = true;
      dispatch(getScheduledMeetingDetailsAsync());
    }
  }, [dispatch, scheduledMeetingDetails]);
  
  useEffect(() => {
    // Only fetch active trainers if not already fetched
    if (!hasFetchedActiveTrainerRef.current) {
      hasFetchedActiveTrainerRef.current = true;
      getAllLatestActiveTrainer();
    }
  }, []);

  var settings = {
    autoplay: true,
    infinite: true, // Changed to false to prevent duplication
    speed: 2000,
    slidesToShow: Math.min(2, activeTrainer?.length || 1), // Dynamic based on available data
    slidesToScroll: 1,
    swipeToSlide: true,
    autoplaySpeed: 3000,
    arrows: activeTrainer?.length > 1, // Only show arrows if more than 1 item
    dots: false,
    responsive: [
      {
        breakpoint: 1366,
        settings: {
          autoplay: true,
          slidesToShow: Math.min(3, activeTrainer?.length || 1),
          slidesToScroll: 1,
          infinite: false,
          arrows: activeTrainer?.length > 1,
        },
      },
      {
        breakpoint: 800,
        settings: {
          autoplay: true,
          slidesToShow: Math.min(2, activeTrainer?.length || 1),
          infinite: true,
          arrows: activeTrainer?.length > 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          autoplay: true,
          slidesToShow: Math.min(2, activeTrainer?.length || 1),
          infinite: true,
          arrows: activeTrainer?.length > 1,
        },
      },
      {
        breakpoint: 700,
        settings: {
          autoplay: true,
          slidesToShow: Math.min(1, activeTrainer?.length || 1),
          infinite: true,
          arrows: activeTrainer?.length > 1,
        },
      },
    ],
  };
   

  // Filter sessions that are confirmed and within the current time range
  useEffect(() => {
     
    if (scheduledMeetingDetails.length > 0) {
       
      const filtered = scheduledMeetingDetails.filter((session) => {
       
        const { start_time, end_time, ratings } = session;

         
        const startTimeUpdated = CovertTimeAccordingToTimeZone(start_time, session.time_zone, false);
        const endTimeUpdated = CovertTimeAccordingToTimeZone(end_time, session.time_zone, false);
         
         
        const currentTime = DateTime.now(); // Use UTC to avoid timezone mismatch

        // Parse the start_time and end_time in UTC
        const startTime = DateTime.fromISO(startTimeUpdated, { zone: "utc" });
        const endTime = DateTime.fromISO(endTimeUpdated, { zone: "utc" });
         
         
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
      
      setFilteredSessions(filtered);
    }
  }, [scheduledMeetingDetails]);

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

  const MeetingSetter = (payload) => {
    dispatch(bookingsAction.setStartMeeting(payload));
  };

  const handleAddRatingModelState = (data) => {
    dispatch(addRating(data));
  };

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

    switch (accountType) {
      case AccountType.TRAINER:
        return (
          <TrainerRenderBooking
            _id={_id}
            status={status}
            trainee_info={trainee_info}
            trainer_info={trainer_info}
            isCurrentDateBefore={isCurrentDateBefore}
            isStartButtonEnabled={true}
            isMeetingDone={false}
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
            activeTabs={bookingButton[0]}
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
            isMeetingDone={false}
            isUpcomingSession={isUpcomingSession}
            ratings={ratings}
            booking_index={booking_index}
            has24HoursPassedSinceBooking={has24HoursPassedSinceBooking}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            selectedClips={selectedClips}
            setSelectedClips={setSelectedClips}
            setIsOpenID={setIsOpenID}
            isOpenID={isOpenID}
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
            activeTabs={bookingButton[0]}
            start_time={start_time}
            bookingInfo={bookingInfo}
          />
        );
      default:
        break;
    }
  };
  return (
    <div className="container-fluid">
      {/* top  baaner */}

      {accountType === AccountType.TRAINEE &&
        activeTrainer &&
        activeTrainer?.length ? (
        <div
          className="upcoming_session"
          style={{
            marginTop: width600 ? "15px" : "20px",
            marginBottom: width600 ? "15px" : "20px",
          }}
        >
          <h2
            className="text-center"
            style={{ marginBottom: width600 ? "15px" : "20px" }}
          >
            Coaches Online Now!
          </h2>
          <div
            className="card trainer-bookings-card"
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "none",
              padding: width600 ? "8px 10px 6px 10px" : "12px 16px 8px 16px",
              width: "100%",
              maxWidth: "100%",
              margin: "0",
              boxSizing: "border-box",
              overflow: "hidden"
            }}
          >
            <div className="banner_Slider" style={{
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box"
            }}>
              <Slider {...settings}>
                {activeTrainer &&
                  activeTrainer?.map((info, index) => {
                    return (
                      <div 
                        key={`slider-${info.trainer_info?._id}-${index}`}
                        style={{
                          padding: width600 ? "0 5px" : "0 8px",
                          boxSizing: "border-box",
                          maxWidth: width600 ? "280px" : "320px",
                          width: "100%"
                        }}
                      >
                        <OnlineUserCard trainer={info.trainer_info} />
                      </div>
                    );
                  })}
              </Slider>
            </div>
          </div>
        </div>
      ) : null}

      {filteredSessions && filteredSessions?.length ? (
        <div className="upcoming_session">
          <h2 className="text-center">Active Sessions</h2>
          {filteredSessions.map((session, booking_index) => (
            <div
              className="card mt-2 trainer-bookings-card upcoming_session_content"
              key={`booking-schedule-training`}
            >
              <div className="card-body" style={{ padding: "5px" }}>
                <div className="d-flex justify-content-center " style={{ gap: width600 ? "10px" : "30px" }}>
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
                                session.trainer_info.profile_picture ||
                                  session.trainee_info.profile_picture
                                  ? Utils.getImageUrlOfS3(
                                    accountType === AccountType.TRAINER
                                      ? session.trainee_info.profile_picture
                                      : session.trainer_info.profile_picture
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
                            ? session.trainee_info.fullname
                            : session.trainer_info.fullname}
                        </dt>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-column justify-content-center">
                    <div className="">
                      <div
                        className={`d-flex ${width600 ? "flex-column" : "flex-row"
                          }`}
                      >
                        <div>Date :</div>
                        <dt className="ml-1">
                          {Utils.getDateInFormat(session.booked_date)}
                        </dt>
                      </div>
                    </div>

                    <div className="">
                      <div
                        className={`d-flex ${width600 ? "flex-column" : "flex-row"
                          }`}
                      >
                        <div className="">Time :</div>
                        <dt className="ml-1">{`${formatTimeInLocalZone(
                          session.start_time
                        )} - ${formatTimeInLocalZone(session.end_time)}`}</dt>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="card-footer"
                style={{ padding: width600 ? "5px" : "5px", display: 'flex', justifyContent: "center" }}
              >
                <div className="">
                  <div className="">
                    <div className="">{showRatingLabel(session.ratings)}</div>
                    <div className="">
                      {renderBooking(
                        session,
                        session.status,
                        booking_index,
                        session.booked_date,
                        session.session_start_time,
                        session.session_end_time,
                        session._id,
                        session.trainee_info,
                        session.trainer_info,
                        session.ratings,
                        session.trainee_clips,
                        session.report,
                        session.start_time,
                        session.end_time
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div
        className="row"
        style={{
          marginLeft: "0px",
          marginRight: "0px",
        }}
      >
        {/* Right side */}
        <div
          className={`${width600
            ? "row"
            : width1200
              ? "col-sm-12"
              : width2000
                ? "col-sm-3"
                : ""
            } my-3`}
          style={{
            width: "auto !important",
            padding: "0px",
            height: "100%",
            display: width1200 || width600 ? "flex" : "block",
            gap: width600 ? "20px" : width1200 ? "15px" : "0px",
          }}
        >
          {activeCenterTab !== "myClips" && (
            <div
              className={`${width600
                ? "col-sm-12"
                : width1200
                  ? "col-sm-6"
                  : width2000
                    ? "col-sm-12"
                    : ""
                }`}
              style={{
                height: width600 ? "auto" : "400px",
              }}
            >
              <div className="card trainer-profile-card Home-main-Cont" style={{ 
                height: "100%", 
                width: "100%", 
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "none"
              }}>
                <UserInfoCard />
              </div>
            </div>
          )}

          {(width1000 && friendRequests && friendRequests.length > 0) ? (
            <div
              className={`${width600
                ? "col-sm-12"
                : width1200
                  ? "col-sm-6"
                : width2000
                  ? "col-sm-12"
                  : ""
                }  ${!width1200 ? "my-3" : ""}`}
              style={{
                height: width1200 ? "100%" : "calc(100% - 400px)",
              }}
            >
            <div
              className={`card trainer-profile-card Home-main-Cont`}
              style={{ 
                width: "100%", 
                color: "black", 
                height: "100%",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "none"
              }}
            >
              <div
                className="card-body"
                style={{
                  height: "100%",
                  padding: "15px"
                }}
              >
                <h3 style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  fontSize: width600 ? "18px" : "20px",
                  fontWeight: "600",
                  color: "#333"
                }}>Recent Friend Requests</h3>
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    justifyContent: "center",
                    alignItems: 'center',
                  }}>
                    {
                      friendRequests?.map((request, index) => (
                        <div
                          style={{
                            cursor: "pointer",
                            border: "2px solid rgb(0, 0, 128)",
                            borderRadius: "5px",
                            display: "flex",
                            gap: "5px",
                            // maxWidth: 300,
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: 'center',
                            // width:  "100%" ,
                            padding: 5,

                            width: "fit-content",
                          }}
                          key={index}
                        >
                          <div>
                            <img
                              height={100}
                              width={100}
                              src={
                                Utils?.getImageUrlOfS3(
                                  request.senderId?.profile_picture
                                ) || "/assets/images/userdemo.png"
                              }
                              alt="Card image cap"
                              onError={(e) => {
                                e.target.src = "/assets/images/demoUser.png"; // Set default image on error
                              }}
                            />
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 5,
                              marginTop: 10,
                              justifyContent: "center",
                              alignItems: 'center',
                            }}
                          >
                            <h5 >
                              <b>{request.senderId?.fullname}</b>
                            </h5>


                            <div className="d-flex" style={{ gap: 5 }}>
                              <button
                                style={{
                                  padding: 5,

                                  marginTop: 5,
                                  fontSize: "revert-layer",
                                }}
                                className="btn btn-success btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptFriendRequest(request?._id);
                                }}
                              >
                                Accept
                              </button>
                              <button
                                style={{
                                  padding: 5,

                                  marginTop: 5,
                                  fontSize: "revert-layer",
                                }}
                                className="btn btn-danger btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectFriendRequest(request?._id);
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div
            className={`${width600
              ? "col-sm-12"
              : width1200
                ? "col-sm-6"
                : width2000
                  ? "col-sm-12"
                  : ""
              }  ${!width1200 ? "my-3" : ""}`}
            style={{
              height: width1200 ? "100%" : "calc(100% - 400px)",
            }}
          >
            {/* <div className={`card trainer-profile-card Home-main-Cont ${width1200 ? "max-height-280px" : ""}`} style={{ width: "100%", color: "black", maxHeight: (width1200 && accountType === AccountType?.TRAINER) ? '350px' : (width1200 && accountType !== AccountType?.TRAINER) ? '280px' : '' }}>
                            <div className='card-body'>
                                <RecentUsers />
                            </div>
                        </div> */}
            <div
              className={`card trainer-profile-card Home-main-Cont`}
              style={{ 
                width: "100%", 
                color: "black", 
                height: "100%",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "none"
              }}
            >
              <div
                className="card-body"
                style={{
                  height: "100%",
                  padding: "10px"
                }}
              >
                <RecentUsers />
              </div>
            </div>
          </div>
        </div>
        {/* Middle */}
        <div
          className={`${width600
            ? "col-sm-12"
            : width1200
              ? "col-sm-12"
              : width2000
                ? "col-sm-6"
                : ""
            } my-3`}
          style={{ width: "auto !important", padding: "0px" }}
        >
          <div
            className="card trainer-profile-card Home-main-Cont"
            style={{
              height: "100%",
              width: "100%",
              overflow: "auto",
              minWidth: "97%",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "none"
            }}
          >
            <div
              className="card-body"
              style={{ padding: width600 ? "10px" : "15px" }}
            >
              <NavHomePageCenterContainer onTabChange={setActiveCenterTab} />
            </div>
          </div>
        </div>

        {/* Left side */}
        <div
          className={`${width600
            ? "col-sm-12"
            : width1200
              ? "row"
              : width2000
                ? "col-sm-3"
                : ""
            }`}
          style={{ width: "auto !important", padding: "0px", marginTop: "5px" }}
        >
          <div
            className={`${width600
              ? "col-sm-12"
              : width1200
                ? "col-sm-6"
                : width2000
                  ? "col-sm-12"
                  : ""
              } my-3`}
            style={{
              padding: width600 ? "0px" : "0px 15px",
            }}
          >
            <div
              className="card trainer-profile-card Home-main-Cont"
              style={{ 
                height: "100%", 
                width: "100%",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "none"
              }}
            >
              <div className="card-body" style={{ padding: "15px" }}>
                <UploadClipCard progress={progress} setProgress={setProgress} />
              </div>
            </div>
          </div>

          <div
            className={`${width600
              ? "col-sm-12"
              : width1200
                ? "col-sm-6"
                : width2000
                  ? "col-sm-12"
                  : ""
              } my-3`}
            style={{
              padding: width600 ? "0px" : "0px 15px",
            }}
          >
            <div
              className="card trainer-profile-card Home-main-Cont"
              style={{
                height: "auto",
                minWidth: "200px",
                width: "100%",
                minHeight: "10rem",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "none",
                overflow: "hidden"
              }}
            >
              <div className="card-body" style={{ padding: "0px" }}>
                <div>
                  {/* <ShareClipsCard /> */}
                  <img
                    src={"/assets/images/dashboard-card.webp"}
                    alt="dashboard card"
                    className="rounded"
                    style={{
                      height: "150px",
                      width: "100%",
                      marginInline: "auto",
                      display: "block",
                      objectFit: "cover"
                    }}
                    onError={(e) => {
                      e.target.src = "/assets/images/dashboard-card.webp";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className={`${width600
              ? "col-sm-12"
              : width1200
                ? "col-sm-6"
                : width2000
                  ? "col-sm-12"
                  : ""
              } my-3`}
            style={{
              padding: width600 ? "0px" : "0px 15px",
            }}
          >
            <div
              className="card trainer-profile-card Home-main-Cont"
              style={{ 
                height: "100%", 
                width: "100%",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "none"
              }}
            >
              <div className="card-body" style={{ padding: "15px" }}>
                <InviteFriendsCard />
              </div>
            </div>
          </div>

          <div
            className={`${width600
              ? "col-sm-12"
              : width1200
                ? "col-sm-6"
                : width2000
                  ? "col-sm-12"
                  : ""
              } my-3`}
            style={{
              padding: width600 ? "0px" : "0px 15px",
            }}
          >
            <div
              className="card trainer-profile-card Home-main-Cont"
              style={{ 
                height: "auto", 
                width: "100%", 
                minHeight: "10rem",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "none",
                overflow: "hidden"
              }}
            >
              <div className="card-body" style={{ padding: "0px" }}>
                <div>
                  {/* <ShareClipsCard /> */}
                  <img
                    src={"/assets/images/callaway.jpg"}
                    alt="callaway card"
                    className="rounded"
                    style={{
                      height: "150px",
                      marginInline: "auto",
                      display: "block",
                      width: "100%",
                      objectFit: "cover"
                    }}
                    onError={(e) => {
                      e.target.src = "/assets/images/callaway.jpg";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavHomePage;
