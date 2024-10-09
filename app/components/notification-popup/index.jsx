import React, { useContext, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { SocketContext } from "../socket";
import { notificationAction } from "../notifications-service/notification.slice";
import { notificiationTitles } from "../../../utils/constant";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { EVENTS } from "../../../helpers/events";
import AppModel from "../../common/modal";
import {
  bookingsAction,
  bookingsState,
  getScheduledMeetingDetailsAsync,
} from "../common/common.slice";
import { authState } from "../auth/auth.slice";
import { bookingButton } from "../../common/constants";

const initialModelValue = {
  title: "",
  description: "",
  cta: {
    title: "",
    call: () => {},
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
  const { startMeeting } = useAppSelector(bookingsState);
  const { userInfo } = useAppSelector(authState);

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

  const getUpcomingBookings = () => {
    dispatch(
      getScheduledMeetingDetailsAsync({
        status: bookingButton[0],
      })
    );
  };
  const notificationHandler = (notification) => {
    const tempObj = initialModelValue;

    switch (notification.title) {
      // case notificiationTitles.newBookingRequest:
      //   tempObj.cta.title = ctaTitle.confirmBooking;
      //   getUpcomingBookings();
      //   break;
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
    
    const MeetingPayload = {
      ...startMeeting,
      id: userInfo._id,
      isOpenModal: true,
      traineeInfo: notification?.bookingInfo?.trainee_info,
      trainerInfo: notification?.bookingInfo?.trainer_info,
      endTime: notification?.bookingInfo?.session_end_time,
    };
    tempObj.cta.call = () => {
      dispatch(bookingsAction.setStartMeeting(MeetingPayload));
      toggle();
    };
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
