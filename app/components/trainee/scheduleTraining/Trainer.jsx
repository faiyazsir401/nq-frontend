import React from 'react'
import { Utils } from '../../../../utils/utils'

const Trainer = ({trainer , onClickFunc}) => {
  return (
    <>
          <div className="recent-box"
          style={{
            cursor : 'pointer'
          }}
          onClick={onClickFunc}
          >
                <div className="dot-btn dot-danger grow"></div>
                <div
                  className="recent-profile"
                  style={{
                    backgroundImage: `url(${Utils?.getImageUrlOfS3(trainer?.profile_picture)})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    display: "block",
                  }}
                >
                  {/* <img className="bg-img" src="/assets/images/avtar/1.jpg" alt="Avatar" style={{display:"none"}}/> */}
                  <h6> {trainer?.fullname}</h6>
                </div>
              </div>
    </>
  )
}

export default Trainer