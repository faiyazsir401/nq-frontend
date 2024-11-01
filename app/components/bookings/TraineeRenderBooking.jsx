import React, { useContext, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  addTraineeClipInBookedSessionAsync,
  bookingsState,
  getScheduledMeetingDetailsAsync,
  updateBookedSessionScheduledMeetingAsync,
} from "../common/common.slice";
import { Utils } from "../../../utils/utils";
import {
  AccountType,
  BookedSession,
  bookingButton,
} from "../../common/constants";
import { authState } from "../auth/auth.slice";
import { Button } from "reactstrap";
import { X } from "react-feather";
import Modal from "../../common/modal";
import { traineeAction } from "../trainee/trainee.slice";
import AddClip from "./start/AddClip";
import { commonState } from "../../common/common.slice";
import { SocketContext } from "../socket";
import { EVENTS } from "../../../helpers/events";
import { notificiationTitles } from "../../../utils/constant";

const TraineeRenderBooking = ({
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
  updateParentState,
  handleAddRatingModelState,
  accountType,
  activeTabs,
  start_time,
  bookingInfo
}) => {
  const { scheduledMeetingDetails, addRatingModel } =
    useAppSelector(bookingsState);
  const socket = useContext(SocketContext);
  const { clips } = useAppSelector(commonState);
  const dispatch = useAppDispatch();
  const { removeNewBookingData } = traineeAction;
  const isCompleted =
    has24HoursPassedSinceBooking ||
    bookingInfo?.ratings?.trainee;

  const canShowRatingButton =
    !isUpcomingSession &&
    !isCurrentDateBefore &&
    !isStartButtonEnabled &&
    status !== BookedSession.booked &&
    Utils.compairDateGraterOrNot(start_time) &&
    !isCompleted;

  const handleClick = () => {
    isStartButtonEnabled
      ? updateParentState(booking_index)
      : updateParentState(null); // Calling the function passed from parent
  };

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
      dispatch(getScheduledMeetingDetailsAsync({ status: "upcoming" }));
    }
  };

  const sendNotifications = (data) => {
    socket?.emit(EVENTS.PUSH_NOTIFICATIONS.ON_SEND, data);
  };

  const isMeetingCanceled = () => {
    return (status === BookedSession.canceled || activeTabs === BookedSession.canceled)
  }

  return (
    <React.Fragment>
      {status !== BookedSession.canceled &&
        activeTabs !== BookedSession.canceled &&
        isMeetingDone && (
          <h3 className="mt-1">Completed</h3>
        )}
      {canShowRatingButton && status !== BookedSession.canceled ? (
        <button
          className={`btn btn-success button-effect btn-sm mr-2 my-1`}
          type="button"
          onClick={() => {
            const payload = {
              _id,
              isOpen: true,
            };
            handleAddRatingModelState(payload);
            sendNotifications({
              title: notificiationTitles.feedBackReceived,
              description:
                "Your trainee has submitted a new rating for your session.",
              senderId: trainee_info?._id,
              receiverId: trainer_info?._id,
              bookingInfo:bookingInfo
            });
          }}
        >
          Rating
        </button>
      ) : (
        <React.Fragment>
          {!isMeetingDone && (
            <React.Fragment>
              {status !== BookedSession.canceled && (
                <React.Fragment>
                  <button
                    className="btn btn-success button-effect btn-sm mr-2 btn_cancel my-1"
                    type="button"
                    onClick={() => {
                      if (trainee_clips?.length > 0)
                        setSelectedClips(trainee_clips);
                      setIsOpenID(_id);
                      setIsOpen(true);
                    }}
                  >
                    Add Clip
                  </button>
                  {status === BookedSession.booked ? (
                    <button
                      className="btn btn-dark button-effect btn-sm mr-2 btn_cancel my-1"
                      type="button"
                      style={{
                        cursor:
                          status === BookedSession.booked && "not-allowed",
                      }}
                      disabled={status === BookedSession.booked}
                    >
                      {BookedSession.booked}
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary button-effect btn-sm mr-2 my-1"
                      type="button"
                      style={{
                        cursor:
                          status === BookedSession.confirmed && "not-allowed",
                      }}
                      disabled={status === BookedSession.confirmed}
                    >
                      {BookedSession.confirmed}
                    </button>
                  )}
                  <AddClip
                    isOpen={isOpen}
                    onClose={() => {
                      setIsOpen(false);
                      dispatch(removeNewBookingData());
                    }}
                    trainer={trainer_info?.fullname}
                    selectedClips={selectedClips}
                    setSelectedClips={setSelectedClips}
                    clips={clips}
                    shareFunc={addTraineeClipInBookedSession}
                    sendNotfication={null}
                  />
                </React.Fragment>
              )}
              {status === BookedSession.confirmed && (
                <button
                  className="btn btn-primary button-effect btn-sm mr-2 my-1"
                  type="button"
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    handleClick();
                    setStartMeeting({
                      ...startMeeting,
                      id: _id,
                      isOpenModal: true,
                      traineeInfo: trainee_info,
                      trainerInfo: trainer_info,
                      iceServers: bookingInfo.iceServers,
                      trainee_clip: bookingInfo.trainee_clips
                    });

                    sendNotifications({
                      title: notificiationTitles.sessionStrated,
                      description: `${trainee_info.fullname} has started the session. Join the session via the upcoming sessions tab in My Locker.`,
                      senderId: trainee_info?._id,
                      receiverId: trainer_info?._id,
                      bookingInfo:bookingInfo
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
                      senderId: trainee_info?._id,
                      receiverId: trainer_info?._id,
                      bookingInfo:null
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
          {isMeetingCanceled() && isMeetingDone && (
            <button
              className="btn btn-danger button-effect btn-sm  my-1"
              type="button"
              style={{
                cursor:
                  status === BookedSession.canceled ? "not-allowed" : "pointer",
              }}
              disabled={isMeetingCanceled()}
            >
              {isMeetingCanceled()
                ? BookedSession.canceled
                : "Cancel"}
            </button>
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default TraineeRenderBooking;
