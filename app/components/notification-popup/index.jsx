import React, { useContext, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { SocketContext } from "../socket";
import { notificationAction } from "../notifications-service/notification.slice";
import { NotificationType, notificiationTitles } from "../../../utils/constant";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { EVENTS } from "../../../helpers/events";
import AppModel from "../../common/modal";
import {
  bookingsAction,
  bookingsState,
  getScheduledMeetingDetailsAsync,
  updateBookedSessionScheduledMeetingAsync,
} from "../common/common.slice";
import { authState } from "../auth/auth.slice";
import { BookedSession, bookingButton } from "../../common/constants";
import { getScheduledMeetingDetails } from "../common/common.api";
import { navigateToMeeting } from "../../../utils/utils";

const initialModelValue = {
  title: "",
  description: "",
  cta: {
    title: "",
    call: () => { },
  },
};

const ctaTitle = {
  confirmBooking: "Confirm",
  joinSession: "Join Session",
};

const NotificationPopup = () => {
  const dispatch = useAppDispatch();
  const socket = useContext(SocketContext);
  const [modelObj, setModelObj] = useState(initialModelValue);
  const [isOpen, SetIsOpen] = useState(false);
  const { startMeeting, scheduledMeetingDetails } = useAppSelector(bookingsState);
  const { userInfo } = useAppSelector(authState);
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    if (socket) {
      socket.on(EVENTS.PUSH_NOTIFICATIONS.ON_RECEIVE, (notification) => {
        dispatch(notificationAction.addNotification(notification));
        notificationHandler(notification);
      });
    } else {
      console.error("Socket is null or undefined");
    }
  }, [socket, dispatch]);

  const getUpcomingBookings = async () => {
    try {
      const response = await getScheduledMeetingDetails({
        status: bookingButton[0],
      });

      dispatch(
        getScheduledMeetingDetailsAsync({
          status: bookingButton[0],
        })
      );
      return response.data;
    } catch (err) {
      console.log(err)
    }

  };

  const updateBookedStatusApi = async (_id, booked_status) => {

    const updatePayload = {
      id: _id,
      booked_status: booked_status,
    };
    await dispatch(updateBookedSessionScheduledMeetingAsync({ status: "upcoming", updatePayload })).unwrap();
  };

  const sendNotifications = (data) => {
    socket?.emit(EVENTS.PUSH_NOTIFICATIONS.ON_SEND, data);
  };

  const notificationHandler = (notification) => {
    const tempObj = initialModelValue;

    switch (notification.title) {
      case notificiationTitles.newBookingRequest:
        
        tempObj.cta.title = ctaTitle.confirmBooking;
        // getUpcomingBookings();
        // const newBooking = scheduledMeetingDetails[0];
        // updateBookedStatusApi(newBooking._id , BookedSession.confirmed)
        // Wrap the logic inside an async IIFE (Immediately Invoked Function Expression)

        tempObj.cta.call = () => {
          (async () => {
            try {
              setIsLoading(true)
              tempObj.cta.title = "Confirming..";
              const bookingdata = await getUpcomingBookings();

              // Access the updated state after fetching
              const newBooking = bookingdata[0];
              if (newBooking) {
              
                await updateBookedStatusApi(newBooking._id, BookedSession.confirmed);
                setIsLoading(false)
                tempObj.cta.title = ctaTitle.joinSession;
                const MeetingPayload = {
                  ...startMeeting,
                  id: userInfo._id,
                  isOpenModal: true,
                  traineeInfo: newBooking.trainee_info,
                  trainerInfo: newBooking.trainer_info,
                  endTime: newBooking.session_end_time,
                  iceServers: newBooking.iceServers,
                  trainee_clip: newBooking.trainee_clip
                };

                tempObj.cta.call = () => {
                  console.log("newBooking", newBooking)
                  navigateToMeeting(newBooking?._id)
                  sendNotifications({
                    title: notificiationTitles.sessionStrated,
                    description: `Expert has Confirmed and started the session. Join the session via the upcoming sessions tab in My Locker.`,
                    senderId: userInfo._id,
                    receiverId: newBooking.trainee_info._id,
                    bookingInfo: newBooking,
                    type: NotificationType.TRANSCATIONAL
                  });
                  toggle();
                }
              } else {
                console.error("No new booking found.");
              }
            } catch (error) {
              console.error("Error during booking confirmation:", error);
            }
          })();
        };
        break;
      case notificiationTitles.sessionStrated:
        tempObj.cta.title = ctaTitle.joinSession;
        break;
      case notificiationTitles.sessionConfirmation:
        tempObj.cta.title = ctaTitle.joinSession;
        getUpcomingBookings();
        return;
        break;
      default:
        return;
    }




    if (notification.title !== notificiationTitles.newBookingRequest) {
      const MeetingPayload = {
        ...startMeeting,
        id: userInfo._id,
        isOpenModal: true,
        traineeInfo: notification?.bookingInfo?.trainee_info,
        trainerInfo: notification?.bookingInfo?.trainer_info,
        endTime: notification?.bookingInfo?.session_end_time,
        iceServers: notification?.bookingInfo?.iceServers,
        trainee_clip: notification?.bookingInfo?.trainee_clip
      };

      tempObj.cta.call = () => {
        console.log("notification?.bookingInfo", notification?.bookingInfo)
        navigateToMeeting(notification?.bookingInfo?._id)
        toggle();
      };
    }

    tempObj.title = notification.title;
    tempObj.description = notification.description;
    setModelObj(tempObj);
    if (!document.getElementById("drawing-canvas")) {
      SetIsOpen(true);
    }
  };

  const toggle = () => {
    SetIsOpen((prev) => !prev);
  };

  return isOpen ? (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        display: "flex",
      }}
    >
      <AppModel
        isOpen={isOpen}
        toggle={toggle}
        id="notification_Model_id"
        element={
          <>
            {" "}
            <Modal isOpen={isOpen} toggle={toggle} centered={true}>
              <ModalHeader>{modelObj?.title}</ModalHeader>
              <ModalBody>{modelObj?.description}</ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  style={{
                    background: "green",
                  }}
                  disabled={isLoading}
                  onClick={() => modelObj.cta.call()}
                >
                  {modelObj?.cta?.title}
                </Button>
                <Button
                  color="secondary"
                  style={{
                    background: "red",
                  }}
                  onClick={toggle}
                >
                  Close
                </Button>
              </ModalFooter>
            </Modal>
          </>
        }
      />
    </div>
  ) : null;
};

export default NotificationPopup;
