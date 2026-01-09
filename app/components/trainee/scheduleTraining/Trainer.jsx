import React from 'react'
import { Utils } from '../../../../utils/utils'
import { useMediaQuery } from '../../../hook/useMediaQuery'

const Trainer = ({trainer , onClickFunc}) => {
  const isMobileScreen = useMediaQuery(768);
  
  return (
    <>
      <div 
        className="recent-box"
        style={{
          cursor: 'pointer',
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: isMobileScreen ? "10px" : "15px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease",
          backgroundColor: "#fff"
        }}
        onClick={onClickFunc}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
        }}
      >
        <div style={{ position: "relative", width: "100%", marginBottom: "10px" }}>
          <div className="dot-btn dot-danger grow" style={{ 
            position: "absolute", 
            top: "5px", 
            right: "5px", 
            zIndex: 2 
          }}></div>
          <div
            className="recent-profile"
            style={{
              backgroundImage: `url(${Utils?.getImageUrlOfS3(trainer?.profile_picture) || "/assets/images/demoUser.png"})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              display: "block",
              width: "100%",
              aspectRatio: "1/1",
              borderRadius: "8px",
              position: "relative"
            }}
          >
            <h6 style={{
              position: "absolute",
              bottom: "8px",
              left: "8px",
              right: "8px",
              color: "#fff",
              fontSize: isMobileScreen ? "12px" : "14px",
              fontWeight: "600",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}> {trainer?.fullname || trainer?.fullName || "Expert"}</h6>
          </div>
        </div>
        <div style={{ width: "100%", padding: "0 5px" }}>
          {trainer?.category && (
            <p style={{
              fontSize: isMobileScreen ? "11px" : "12px",
              color: "#666",
              margin: "4px 0",
              textAlign: "center",
              fontWeight: "500"
            }}>{trainer.category}</p>
          )}
          {trainer?.extraInfo?.hourly_rate && (
            <p style={{
              fontSize: isMobileScreen ? "11px" : "12px",
              color: "#000080",
              margin: "4px 0",
              textAlign: "center",
              fontWeight: "600"
            }}>${trainer.extraInfo.hourly_rate}/hr</p>
          )}
        </div>
      </div>
    </>
  )
}

export default Trainer