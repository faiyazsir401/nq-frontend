import React, { useContext, useEffect, useState } from "react"
import { Utils } from "../../../utils/utils";
import { useAppDispatch, useAppSelector } from "../../store";
import { authAction, authState } from "../auth/auth.slice";
import { AccountType, LOCAL_STORAGE_KEYS, leftSideBarOptions, topNavbarOptions } from "../../common/constants";
import PopupContent from "../trainee/scheduleTraining/PopupContent";
import { SocketContext } from "../socket/SocketProvider";
import { useRouter } from "next/router";
import StudentRecord from "./StudentTab/StudentRecord";



const menuItems = [
  { label: 'My Locker', value: topNavbarOptions?.HOME, topNavbarTab: topNavbarOptions?.HOME, accessBy: [AccountType?.TRAINEE, AccountType?.TRAINER] },
  { label: 'My Uploads', value: 'file', leftSideBarTab: 'file', accessBy: [AccountType?.TRAINEE, AccountType?.TRAINER] },
  // { label: 'Upcoming Lessons', value: "scheduleTraining", leftSideBarTab: leftSideBarOptions?.SCHEDULE_TRAINING, accessBy: [] },
  { label: 'Book Expert', value: topNavbarOptions?.BOOK_LESSON, topNavbarTab: topNavbarOptions?.BOOK_LESSON, accessBy: [AccountType?.TRAINEE,] },
  // { label: 'Upcoming Lessons', value: "scheduleTraining", leftSideBarTab: leftSideBarOptions?.SCHEDULE_TRAINING, accessBy: [AccountType?.TRAINEE] },
  { label: 'Students', value: 'Student', topNavbarTab: topNavbarOptions?.STUDENT, accessBy: [AccountType?.TRAINER] },
  { label: 'Expert', value: 'Trainer', topNavbarTab: topNavbarOptions?.Friends, accessBy: [AccountType?.TRAINEE] },
  { label: 'Upcoming Sessions', value: 'Upcoming Session', topNavbarTab: topNavbarOptions?.UPCOMING_SESSION, accessBy: [AccountType?.TRAINER] },
  { label: 'My Community', value: "myCommunity", topNavbarTab: topNavbarOptions?.MY_COMMUNITY, accessBy: [AccountType?.TRAINEE, AccountType?.TRAINER] },
  // { label: 'About Us', value: "aboutUs", topNavbarTab: topNavbarOptions?.ABOUT_US, accessBy: [AccountType?.TRAINEE, AccountType?.TRAINER] },
  { label: 'Contact Us', value: "contactUs", topNavbarTab: topNavbarOptions?.CONTACT_US, accessBy: [AccountType?.TRAINEE, AccountType?.TRAINER] },
  { label: 'Practice Session', value: "practiceSession", topNavbarTab: topNavbarOptions?.PRACTICE_SESSION, accessBy: [AccountType?.TRAINER] },
  { label: '', value: topNavbarOptions?.MEETING_ROOM, topNavbarTab: topNavbarOptions?.MEETING_ROOM, accessBy: [AccountType?.TRAINEE, AccountType?.TRAINER] },
];

const Header = () => {
  const socket = useContext(SocketContext);
  const router = useRouter();
  const [isSticky, setIsSticky] = useState(false);
  const [activeNav, setActiveNav] = useState(null)
  const { userInfo, topNavbarActiveTab, sidebarActiveTab, accountType: accountTypeFromRedux } = useAppSelector(authState);
  const dispatch = useAppDispatch()
  
  // Use userInfo.account_type as fallback if accountType from Redux is not set
  // Check if we're in browser before accessing localStorage (SSR safety)
  const accountType = accountTypeFromRedux || userInfo?.account_type || (typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEYS?.ACC_TYPE) : null);
  const TogglTab = (value) => {
    if (value == "file") {
      dispatch(authAction?.setActiveModalTab(value));
      if (window.innerWidth > 1640 && document.querySelector(".chitchat-main")) {
        document
          .querySelector(".chitchat-main")
          .classList.remove("small-sidebar");
      }
    } else {
      dispatch(authAction.setActiveTab(value));
      if (
        window.innerWidth < 800 &&
        document &&
        document.querySelector &&
        document.querySelector(".app-sidebar")
      ) {
        document.querySelector(".app-sidebar").classList.remove("active");
      }
    }
  };

  const Logout = () => {
    try {
      // Disconnect socket if it exists
      if (socket && typeof socket.disconnect === 'function') {
        socket.disconnect();
      }
      
      // Update Redux state first
      dispatch(authAction?.updateIsUserLoggedIn());
      dispatch(authAction?.userLogout());
      
      // Clear all local storage
      localStorage.clear();
      
      // Use window.location for immediate redirect and full page reload
      // This ensures all state is cleared and socket provider will detect token removal
      window.location.href = "/auth/signIn";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, try to clear and redirect
      localStorage.clear();
      window.location.href = "/auth/signIn";
    }
  };



  const [popup, setPopup] = useState(false)

  const togglePopup = () => {
    setPopup(!popup);
  };

  const closePopup = () => {
    setPopup(false);
  };


  useEffect(() => {
    const handleScroll = () => {
      // You can add more logic here if needed
      // For now, just prevent the default behavior of scrolling
      if (popup) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'visible';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'visible'; // Ensure the default behavior is restored
    };
  }, [popup]);


  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById('navbar-wrapper');
      const stickyThreshold = navbar?.offsetTop;

      // Update the state based on the scroll position
      setIsSticky(window.pageYOffset >= stickyThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (accountType === AccountType?.TRAINEE) {
      dispatch(authAction?.setTopNavbarActiveTab(topNavbarOptions?.HOME))
      setActiveNav(topNavbarOptions?.HOME)
    }
  }, [])

  useEffect(() => {
    dispatch(authAction?.setAccountType(localStorage.getItem(LOCAL_STORAGE_KEYS?.ACC_TYPE)))
  }, [])


  useEffect(() => {
    setActiveNav(sidebarActiveTab === leftSideBarOptions?.TOPNAVBAR ? topNavbarActiveTab : sidebarActiveTab);
    dispatch(authAction?.setActiveModalTab(null));
  }, [topNavbarActiveTab, sidebarActiveTab])

  return (
    <>
      <div id="navbar-wrapper" className={`navbar-wrapper ${isSticky ? 'sticky' : ''}`}>
        <div className="logo">
          <img
            src="/assets/images/netquix_logo_beta.png"
            alt="logo"
            className="header-image-logo"
          />
        </div>
        <div className='menu-container'>
          {menuItems?.map((item, index) => (
            item?.accessBy?.includes(accountType) && <p
              key={index}
              className={`header-menu-item ${activeNav === item?.value ? "active" : ""}`}
              onClick={() => {
                if (item?.leftSideBarTab) {
                  TogglTab(item?.leftSideBarTab);
                }
                if (item?.topNavbarTab) {
                  dispatch(authAction?.setTopNavbarActiveTab(item?.topNavbarTab));
                }
                setActiveNav(item?.value)
              }}
            >
              {item?.label}
            </p>
          ))}
        </div>
        <div
          className="header-profile-picture"
          onClick={togglePopup}
        >
          <img
            src={Utils?.getImageUrlOfS3(userInfo?.profile_picture) || '/assets/images/demoUser.png'}
            alt={userInfo?.fullname}
            onError={(e) => {
              e.target.src = '/assets/images/demoUser.png';  // Set default image on error
            }}
          />
        </div>
        {popup && <PopupContent onClose={closePopup} userInfo={userInfo} Logout={Logout} />}
      </div>
    </>
  )
}
export default Header;


