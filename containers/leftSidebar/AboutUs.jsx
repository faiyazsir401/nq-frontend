import React from 'react'
import { X } from "react-feather";
import AboutUs from '../../app/components/aboutUs';

function AboutUsSideBar(props) {

  const closeLeftSide = () => {
    props.smallSideBarToggle();
  };

  return (
    <div className={`notification-tab dynemic-sidebar custom-scroll ${props.tab === "my_community" ? "active" : ""}`} id="my_community">
      <div className="theme-title">
        <div className="media">
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
      <div style={{ maxHeight: '85vh', overflowY: 'auto',  }} className='transaction-table' >
      <AboutUs />
      </div>
    </div>
  )
}

export default AboutUsSideBar
