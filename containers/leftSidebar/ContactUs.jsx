import React from 'react'
import { X } from "react-feather";
import ContactUs from '../../app/components/contactUs';

function ContactUSSideBar(props) {

  const closeLeftSide = () => {
    props.smallSideBarToggle();
  };

  return (
    <div className={`notification-tab dynemic-sidebar custom-scroll ${props.tab === "contact_us" ? "active" : ""}`} id="contact_us">
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
      <ContactUs />
      </div>
    </div>
  )
}

export default ContactUSSideBar
