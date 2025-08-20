import Link from "next/link";
import {X} from "react-feather"
import { useAppDispatch, useAppSelector } from "../../app/store";
import { getAllNotifications, notificationState ,  updateNotificationsStatus } from "../../app/components/notifications-service/notification.slice";
import {  useEffect, useState } from "react";
import { Utils } from "../../utils/utils";
import { authState } from "../../app/components/auth/auth.slice";

const NotificationSection = (props) => {
    const dispatch = useAppDispatch();
    const {sidebarModalActiveTab} = useAppSelector(authState);
    const [page , setPage] = useState(1);
    const {notifications , isLoading} = useAppSelector(notificationState)
    
    useEffect(() => {
      const handleScroll = () => {
      const ulElement = document.querySelector('.notification-tab');
      if (ulElement.scrollTop + ulElement.clientHeight >= ulElement.scrollHeight) {
      setPage(prevPage => prevPage + 1); // Increment page number
      dispatch(getAllNotifications({ page: page + 1, limit: 10 }));
      }
      };
      
      const ulElement = document.querySelector('.notification-tab');
      ulElement.addEventListener('scroll', handleScroll);
      
      return () => ulElement.removeEventListener('scroll', handleScroll); // Clean up
    }, [dispatch, page]);

    const closeLeftSide = () => {
      document.querySelector(".notification-tab").classList.remove("active")
      document.querySelector(".recent-default").classList.add("active");
      props.ActiveTab("")
    }
    useEffect(()=>{
      if(sidebarModalActiveTab === "notification"){
        dispatch(getAllNotifications({page , limit : 10})) ;
        dispatch(updateNotificationsStatus({page : 1 }));
        dispatch(getAllNotifications({page , limit : 10})) ;
      }
    }, [page, sidebarModalActiveTab])

    
  
    return (
        <div className={`notification-tab dynemic-sidebar ${props.tab === "notification" ? "active" : ""} notificationClass`} id="notification">
            <div className="theme-title">
              <div className="media">
                <div> 
                  <h2>Notifications</h2>
                  {/* <h4>List of notification</h4> */}
                </div>
                <div className="media-body text-right">   <Link className="icon-btn btn-outline-light btn-sm close-panel" href="#" onClick={() => props.smallSideBarToggle()}><X/></Link></div>
              </div>
            </div>
            <ul className="chat-main custom-scroll">
            {notifications?.map((notification) =>{
              return <>
              <li key = {notification?._id}>
                <div className="chat-box notification">
                  <div className="profile " style={{ backgroundImage: `url(${Utils?.getImageUrlOfS3(notification?.sender?.profile_picture)})` || `url('assets/images/contact/1.jpg')`,backgroundSize:"cover",backgroundPosition:"center",display:"block" }}>
                  <img className="bg-img" src="/assets/images/contact/1.jpg" alt="Avatar" style={{display:'none'}}/>
                  </div>
                  <div className="details"><span>{notification?.sender?.name}</span>
                    <h5>{notification?.title}</h5>
                    <p>{notification?.description}</p>
                  </div>
                  <div className="date-status">
                    <h6>{Utils.formatTimeAgo(notification?.createdAt)}</h6>
                  </div>
                </div>
              </li>
              </>
            })}
            </ul>
        </div>
    );
}

export default NotificationSection;