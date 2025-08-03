import React, { Fragment, useState, useEffect, useContext } from "react";
import LeftSide from "../../containers/leftSidebar";
import ChitChat from "../../containers/chatBoard";
import RightSide from "../../containers/rightSidebar";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { authAction, authState } from "../../app/components/auth/auth.slice";
import {
  AccountType,
  LOCAL_STORAGE_KEYS,
  leftSideBarOptions,
  topNavbarOptions,
} from "../../app/common/constants";
import TraineeDashboardContainer from "../../app/components/trainee/dashboard";
import TrainerDashboardContainer from "../../app/components/trainer/dashboard";
import ScheduleInventory from "../../app/components/trainer/scheduleInventory";
import Bookings from "../../app/components/bookings";
import { SocketContext, getSocket } from "../../app/components/socket";
import {
  getMasterDataAsync,
  masterState,
} from "../../app/components/master/master.slice";
import Header from "../../app/components/Header";
import NavHomePage from "../../app/components/NavHomePage";
import MyCommunity from "../../app/components/myCommunity";
import AboutUs from "../../app/components/aboutUs";
import ContactUs from "../../app/components/contactUs";
import { useMediaQuery } from "../../app/hook/useMediaQuery";
import StudentRecord from "../../app/components/Header/StudentTab/StudentRecord";
import { meetingRoom } from "../../app/components/bookings/BookingList";
import UpcomingSession from "../../app/components/bookings/UpcomingSession";
import PracticeLiveExperience from "../../app/components/practiceLiveExperience";
import { WebPushRegister } from "../../app/components/notifications-service/Notification";
import { getAllNotifications, notificationAction } from "../../app/components/notifications-service/notification.slice";
import { EVENTS } from "../../helpers/events";
import { useWindowDimensions } from "../../app/hook/useWindowDimensions";
import NotificationPopup from "../../app/components/notification-popup";

import Tracker from '@openreplay/tracker';

const tracker = new Tracker({
  projectKey: "Z4i45QZp973IIi1FAdB9",
  ingestPoint: "https://analytics.netqwix.com/ingest",
});

const Dashboard = () => {
  const socket = useContext(SocketContext);
  const dispatch = useAppDispatch();
  const { sidebarActiveTab, topNavbarActiveTab } = useAppSelector(authState);
  const [accountType, setAccountType] = useState("");
  const [openCloseToggleSideNav, setOpenCloseToggleSideNav] = useState(true)
  useEffect(() => {
    WebPushRegister()
    setAccountType(localStorage.getItem(LOCAL_STORAGE_KEYS.ACC_TYPE));
    // fetching master data, TODO: stop over calling API calls.
    dispatch(getMasterDataAsync());
    dispatch(getAllNotifications({page : 1, limit : 10})) ;
  }, []);

  useEffect(() => { 
    tracker.start()
    tracker.setUserID(localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ID))
    tracker.setMetadata(localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ID),localStorage.getItem(LOCAL_STORAGE_KEYS.ACC_TYPE));
  }, []);

  const getDashboard = () => {
    switch (accountType) {
      case AccountType.TRAINEE:
        return <TraineeDashboardContainer openCloseToggleSideNav={openCloseToggleSideNav}/>;
      case AccountType.TRAINER:
        return <TrainerDashboardContainer accountType={accountType} />;
    }
  };

  const getScheduledInventory = () => {
    return accountType === AccountType.TRAINEE || accountType === AccountType.TRAINER ? (
      <Bookings accountType={accountType} />
    ) : (
      <ScheduleInventory />
    );
  };

  const { height, width } = useWindowDimensions();
  const [isRotatedInitally, setIsRotatedInitally] = useState(false);
  useEffect(() => {
    if (height < width) setIsRotatedInitally(true)
  }, [height, width])

  const getNavbarTabs = () => {
    switch (topNavbarActiveTab) {
      case topNavbarOptions?.HOME: {
        return <NavHomePage />;
      }
      case topNavbarOptions?.MY_COMMUNITY: {
        return <MyCommunity />;
      }
      case topNavbarOptions?.STUDENT: {
        return <StudentRecord />;
      }
      case topNavbarOptions?.Friends: {
        return <StudentRecord friends={true}/>;
      }
      case topNavbarOptions?.UPCOMING_SESSION: {
        return <UpcomingSession />;
      }
      case topNavbarOptions?.ABOUT_US: {
        return <AboutUs />;
      }
      case topNavbarOptions?.CONTACT_US: {
        return <ContactUs />;
      }
      case topNavbarOptions?.PRACTICE_SESSION: {
        return <PracticeLiveExperience />;
      }
      case topNavbarOptions?.BOOK_LESSON: {
        return (
          <div id="get-dashboard" className="get-dashboard">
            {getDashboard()}
          </div>
        );
      }
      case topNavbarOptions?.MEETING_ROOM: {
        return meetingRoom( height, width, isRotatedInitally );
      }
      default:
        break;
    }
  };

  const getActiveTabs = () => {
    switch (sidebarActiveTab) {
      case leftSideBarOptions.CHATS:
        return (
          <React.Fragment>
            <ChitChat />
            <RightSide />
          </React.Fragment>
        );

      case leftSideBarOptions.TOPNAVBAR: {
        return (
          <div id="get-navbar-tabs" className="get-navbar-tabs"style={{overflow:"hidden"}}>
            {getNavbarTabs()}
          </div>
        );
      }

      case leftSideBarOptions.SCHEDULE_TRAINING:
        return getScheduledInventory();
      default:
        break;
    }
  };

  useEffect(() => {
    dispatch(authAction?.setTopNavbarActiveTab(topNavbarOptions?.HOME));
  }, []);

  const width1000 = useMediaQuery(1000);

  return (
    // TODO: move socket to root folder
    <Fragment>
      <SocketContext.Provider value={getSocket()}>
        {/* height-max-content */}
        {!width1000 &&
          topNavbarActiveTab !== topNavbarOptions?.MEETING_ROOM && <Header />}
        <div
          className={`chitchat-container sidebar-toggle ${accountType === AccountType.TRAINEE ? "" : ""
            }`}
          style={{
            marginTop:
              width1000 || topNavbarActiveTab === topNavbarOptions?.MEETING_ROOM
                ? "0px"
                : "80px",
          }}
        >
          <LeftSide setOpenCloseToggleSideNav={setOpenCloseToggleSideNav} openCloseToggleSideNav={openCloseToggleSideNav}/>
          {getActiveTabs()}
        </div>
        <NotificationPopup/>
      </SocketContext.Provider>
    </Fragment>
  );
};

export default Dashboard;
