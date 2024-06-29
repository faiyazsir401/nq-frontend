import React from "react"
import { Utils } from "../../../../utils/utils";
import { useAppDispatch , useAppSelector } from "../../../store";
import { authState } from "../../auth/auth.slice";

const Header = ()=>{

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
      const togglePopup = () => {
        setPopup(!popup);
      };
      const { userInfo, sidebarModalActiveTab } = useAppSelector(authState);

return(
<div id="navbar-wrapper">
<div className='menu-container'>
  <p onClick={() => TogglTab("home")}>Home</p>
  <p onClick={() => TogglTab("file")}>My Locker</p>
  <p onClick={() => TogglTab(leftSideBarOptions.SCHEDULE_TRAINING)}>Upcoming Lessons</p>
  <p >My Community</p>
  <p >About Us</p>
  <p >Contact Us</p>
</div>
<div>
  <button style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden' }} onClick={togglePopup}>
    <img
      src={Utils?.getImageUrlOfS3(userInfo?.profile_picture)}
      alt={userInfo?.fullname}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </button>
</div>
</div>
)
}
export default Header;


