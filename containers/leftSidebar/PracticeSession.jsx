import React from 'react'
import { X } from "react-feather";
import PracticeLiveExperience from '../../app/components/practiceLiveExperience';

function PracticeLiveExperienceSideBar(props) {

  const closeLeftSide = () => {
    props.smallSideBarToggle();
  };

  return (
    <div className={`notification-tab dynemic-sidebar custom-scroll ${props.tab === "practice_session" ? "active" : ""}`} id="practice_session">
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
        {
            props.tab === "practice_session" && <PracticeLiveExperience closeLeftSide={closeLeftSide}/>
        }
      
      </div>
    </div>
  )
}

export default PracticeLiveExperienceSideBar
