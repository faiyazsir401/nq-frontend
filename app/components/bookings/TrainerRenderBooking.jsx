import React, { useContext, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  bookingsState,
  updateBookedSessionScheduledMeetingAsync,
} from "../common/common.slice";
import { AccountType, BookedSession } from "../../common/constants";
import { Button } from "reactstrap";
import { X } from "react-feather";
import Modal from "../../common/modal";
import { authState } from "../auth/auth.slice";
import { CovertTimeAccordingToTimeZone, formatTimeInLocalZone, navigateToMeeting, Utils } from "../../../utils/utils";
import { commonState } from "../../common/common.slice";
import { SocketContext } from "../socket";
import { EVENTS } from "../../../helpers/events";
import { notificiationTitles } from "../../../utils/constant";
import { DateTime } from "luxon";

const TrainerRenderBooking = ({
  _id,
  status,
  trainee_info,
  trainer_info,
  isCurrentDateBefore,
  isStartButtonEnabled,
  isMeetingDone,
  isUpcomingSession,
  ratings,
  booking_index,
  has24HoursPassedSinceBooking,
  isOpen,
  setIsOpen,
  selectedClips,
  setSelectedClips,
  setIsOpenID,
  addTraineeClipInBookedSession,
  trainee_clips,
  report,
  bookedSession,
  setBookedSession,
  tabBook,
  startMeeting,
  setStartMeeting,
  handleAddRatingModelState,
  updateParentState,
  start_time,
  bookingInfo,
}) => {
  const { scheduledMeetingDetails, addRatingModel } =
    useAppSelector(bookingsState);
  const socket = useContext(SocketContext);
  const { clips } = useAppSelector(commonState);
  const { accountType } = useAppSelector(authState);
  const dispatch = useAppDispatch();

  const currentTime = DateTime.now(); // Use UTC to avoid timezone mismatch

  // Parse the start_time and end_time in UTC
  const startTime = DateTime.fromISO(bookingInfo.start_time, { zone: 'utc' });
  const endTime = DateTime.fromISO(bookingInfo.end_time, { zone: 'utc' });
  
  // Extract date and time components
  const currentDate = currentTime.toFormat('yyyy-MM-dd');  // YYYY-MM-DD format
  const currentTimeOnly = currentTime.toFormat('HH:mm');  // HH:mm format

  const startDate = startTime.toFormat('yyyy-MM-dd');
  const startTimeOnly = startTime.toFormat('HH:mm');

  const endDate = endTime.toFormat('yyyy-MM-dd');
  const endTimeOnly = endTime.toFormat('HH:mm');

  // Compare the current date and time (date + hour:minute) with start and end time
  const isDateSame = currentDate === startDate && currentDate === endDate;
  const isWithinTimeFrame  = isDateSame && currentTimeOnly >= startTimeOnly && currentTimeOnly <= endTimeOnly;

  console.log('Is the current date the same as start and end date?', isDateSame); 
  console.log('Is the current time within the time range?', isWithinTimeFrame);

  const isCompleted =
    has24HoursPassedSinceBooking || bookingInfo?.ratings?.trainee;

  const canShowRatingButton =
    !isUpcomingSession &&
    !isCurrentDateBefore &&
    !isStartButtonEnabled &&
    status !== BookedSession.booked &&
    !isCompleted;

  const updateBookedStatusApi = (_id, booked_status) => {
    if (_id) {
      const updatePayload = {
        id: _id,
        booked_status: booked_status,
      };
      const payload = {
        ...(accountType === AccountType?.TRAINER
          ? { status: tabBook, updatePayload }
          : { updatePayload }),
      };
      dispatch(updateBookedSessionScheduledMeetingAsync(payload));
    }
  };

  const handleClick = () => {
    updateParentState(booking_index)

  };

  const sendNotifications = (data) => {
    socket?.emit(EVENTS.PUSH_NOTIFICATIONS.ON_SEND, data);
  };
  return (
    <React.Fragment>
      {status !== BookedSession.canceled && isMeetingDone && (
        <h3 className="mt-1">Completed</h3>
      )}
      <span>
        <span>
          {trainee_info?.fullname} shared the following clips with you.{" "}
        </span>
        <span
          onClick={() => {
            if (trainee_clips?.length > 0) setSelectedClips(trainee_clips);
            setIsOpenID(_id);
            setIsOpen(!isOpen);
          }}
          style={{ textDecoration: "underline", cursor: "pointer" }}
        >
          click here
        </span>{" "}
        to view Clip
      </span>
      <br />
      {status === BookedSession.canceled && isMeetingDone && (
        <button
          className="btn btn-danger button-effect btn-sm ml-2 my-1"
          type="button"
          style={{
            cursor:
              status === BookedSession.canceled ? "not-allowed" : "pointer",
          }}
          disabled={status === BookedSession.canceled}
        >
          {status === BookedSession.canceled
            ? BookedSession.canceled
            : "Cancel"}
        </button>
      )}
      {!isUpcomingSession &&
      !isCurrentDateBefore &&
      status === BookedSession.confirmed &&
      !isStartButtonEnabled &&
      Utils.compairDateGraterOrNot(start_time) &&
      !isMeetingDone&& status === BookedSession.completed ? (
        <button
          className={`btn btn-success button-effect btn-sm mr-2 my-1`}
          type="button"
          onClick={() => {
            const payload = {
              _id,
              isOpen: true,
              booking_id: _id,
            };
            handleAddRatingModelState(payload);
          }}
        >
          Rating
        </button>
      ) : (
        <React.Fragment>
          {!isMeetingDone && (
            <React.Fragment>
              {status !== BookedSession.canceled && (
                <button
                  className={`btn btn-primary button-effect btn-sm mr-2 btn_cancel my-1`}
                  type="button"
                  style={{
                    cursor: status === BookedSession.confirmed && "not-allowed",
                  }}
                  disabled={status === BookedSession.confirmed}
                  onClick={() => {
                    setBookedSession({
                      ...bookedSession,
                      id: _id,
                      booked_status: BookedSession.confirmed,
                    });
                    updateBookedStatusApi(_id, BookedSession.confirmed);
                    sendNotifications({
                      title: notificiationTitles.sessionConfirmation,
                      description:
                        "Your upcoming training session has been confirmed.",
                      senderId: trainer_info?._id,
                      receiverId: trainee_info?._id,
                      bookingInfo: bookingInfo,
                    });
                  }}
                >
                  {status === BookedSession.confirmed
                    ? BookedSession.confirmed
                    : BookedSession.confirm}
                </button>
              )}
              {status === BookedSession.confirmed && (
                <button
                  className={`btn btn-primary button-effect btn-sm mr-2 btn_cancel my-1`}
                  type="button"
                  style={{
                    cursor: isWithinTimeFrame ? "pointer" : "not-allowed",
                  }}
                  disabled={!isWithinTimeFrame}
                  onClick={() => {
                    
                    console.log(
                      "start meeting set the booking info is ",
                      bookingInfo
                    );
                    navigateToMeeting(_id)
                    sendNotifications({
                      title: notificiationTitles.sessionStrated,
                      description: `${trainer_info.fullname} has started the session. Join the session via the upcoming sessions tab in My Locker.`,
                      senderId: trainer_info?._id,
                      receiverId: trainee_info?._id,
                      bookingInfo: bookingInfo,
                    });
                  }}
                >
                  {BookedSession.start}
                </button>
              )}
              <button
                className={`btn btn-danger button-effect btn-sm btn_cancel my-1`}
                type="button"
                style={{
                  cursor:
                    status === BookedSession.canceled || isStartButtonEnabled
                      ? "not-allowed"
                      : "pointer",
                }}
                disabled={
                  status === BookedSession.canceled || isStartButtonEnabled
                }
                onClick={() => {
                  if (
                    !isStartButtonEnabled &&
                    (status === BookedSession?.booked ||
                      status === BookedSession?.confirmed)
                  ) {
                    setBookedSession({
                      ...bookedSession,
                      id: _id,
                      booked_status: BookedSession.canceled,
                    });
                    updateBookedStatusApi(_id, BookedSession.canceled);
                    sendNotifications({
                      title: notificiationTitles.sessionCancelattion,
                      description:
                        "A scheduled training session has been cancelled. Please check your calendar for details.",
                      senderId: trainer_info?._id,
                      receiverId: trainee_info?._id,
                      bookingInfo: null,
                    });
                  }
                }}
              >
                {status === BookedSession.canceled
                  ? BookedSession.canceled
                  : "Cancel"}
              </button>
            </React.Fragment>
          )}
        </React.Fragment>
      )}

      <Modal
        isOpen={isOpen}
        element={
          <>
            <div className="container media-gallery portfolio-section grid-portfolio ">
              <div className="theme-title">
                <div className="media">
                  <div className="media-body media-body text-right">
                    <div
                      className="icon-btn btn-sm btn-outline-light close-apps pointer"
                      onClick={() => {
                        setIsOpen(false);
                      }}
                    >
                      {" "}
                      <X />{" "}
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex flex-column  align-items-center">
                <h1 className="p-3">
                  {trainee_info.fullname} shared the following clips with you.
                </h1>
                {selectedClips?.length ? (
                  <div>
                    <div className={`block-content`}>
                      <div className="row">
                        {selectedClips?.map((clp, index) => (
                          <>
                            <div
                              key={index}
                              className="col-md-6 col-sm-12 col-xs-12 p-2"
                            >
                              <div className="col">
                                <dl className="row">
                                  <h3 className="ml-1">{clp?.title || "-"}</h3>
                                </dl>
                              </div>
                              <video className="videoStyle" controls>
                                <source
                                  src={Utils?.generateVideoURL(clp)}
                                  type="video/mp4"
                                />
                              </video>
                            </div>
                          </>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <div className="justify-content-center"></div>
            </div>
          </>
        }
      />
    </React.Fragment>
  );
};

export default TrainerRenderBooking;
