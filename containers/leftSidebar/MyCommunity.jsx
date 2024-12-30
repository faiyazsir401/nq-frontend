import React from 'react'
import { X } from "react-feather";
import MyCommunity from '../../app/components/myCommunity';
import { authAction } from '../../app/components/auth/auth.slice';

function MyCommunitySideBar(props) {

  const closeLeftSide = () => {
    props.smallSideBarToggle();
  };

  return (
    <div className={`notification-tab dynemic-sidebar custom-scroll ${props.tab === "about_us" ? "active" : ""}`} id="about_us">
     
      <div className="theme-title ml-3 mb-2">
        <div className="media">
          <div>
            <h2>My Community</h2>
            {/* <h4>Shared Media</h4> */}
          </div>
          <div className="media-body text-right">
            {" "}
            <a
              className="icon-btn btn-outline-light btn-sm close-panel"
              href="#"
              onClick={() => {
                closeLeftSide();
              }}
            >
              <X />
            </a>
          </div>
        </div>
      </div>
     
      <div style={{ maxHeight: '85vh', overflowY: 'auto'  }} className='transaction-table' >
      <MyCommunity />
      </div>
    </div>
  )
}

export default MyCommunitySideBar
