import React, { useEffect, useState } from "react";
import NavHomePageCenterContainer from "./NavHomePageCenterContainer";
import "./index.scss";
import ShareClipsCard from "../share-clips";
import UploadClipCard from "../videoupload/UploadClipCard";
import InviteFriendsCard from "../invite-friends";
import RecentUsers from "../recent-users";
import UserInfoCard from "../cards/user-card";
import { useMediaQuery } from "../../hook/useMediaQuery";
import { AccountType, LIST_OF_ACCOUNT_TYPE } from "../../common/constants";
import { useAppDispatch, useAppSelector } from "../../store";
import { authState } from "../auth/auth.slice";
import "./index.css";
import Slider from "react-slick";
import OnlineUserCard from "./banner";
import {
  bookingsState,
  getScheduledMeetingDetailsAsync,
} from "../common/common.slice";

import { formatTimeInLocalZone, Utils } from "../../../utils/utils";
import { Button } from "reactstrap";
import { DateTime } from "luxon";
const NavHomePage = () => {
  const [progress, setProgress] = useState(0);
  const width2000 = useMediaQuery(2000);
  const width1200 = useMediaQuery(1200);
  const width900 = useMediaQuery(900);

  const width600 = useMediaQuery(700);
  const { accountType, onlineUsers } = useAppSelector(authState);
  const dispatch = useAppDispatch();
  const { scheduledMeetingDetails } = useAppSelector(bookingsState);
  useEffect(() => {
    dispatch(getScheduledMeetingDetailsAsync({ status: "upcoming" }));
  }, []);

  var settings = {
    autoplay: true,
    infinite: false,
    speed: 2000,
    slidesToShow: 2,
    slidesToScroll: 1,
    swipeToSlide: true,
    autoplaySpeed: 1000,
    arrows: true,
    responsive: [
      {
        breakpoint: 1366,
        settings: {
          autoplay: true,
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 800,
        settings: {
          autoplay: true,
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          autoplay: true,
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 700,
        settings: {
          autoplay: true,
          slidesToShow: 1,
        },
      },
    ],
  };
  console.log("scheduledMeetingDetails12", scheduledMeetingDetails);

  // Filter sessions that are confirmed and within the current time range
  const filteredSessions = scheduledMeetingDetails.filter((session) => {
    const { start_time, end_time, status } = session;

    const currentTime = DateTime.now(); // Use UTC to avoid timezone mismatch

    // Parse the start_time and end_time in UTC
    const startTime = DateTime.fromISO(start_time, { zone: "utc" });
    const endTime = DateTime.fromISO(end_time, { zone: "utc" });

    // Extract date and time components
    const currentDate = currentTime.toFormat("yyyy-MM-dd"); // YYYY-MM-DD format
    const currentTimeOnly = currentTime.toFormat("HH:mm"); // HH:mm format

    const startDate = startTime.toFormat("yyyy-MM-dd");
    const startTimeOnly = startTime.toFormat("HH:mm");

    const endDate = endTime.toFormat("yyyy-MM-dd");
    const endTimeOnly = endTime.toFormat("HH:mm");

    // Compare the current date and time (date + hour:minute) with start and end time
    const isDateSame = currentDate === startDate && currentDate === endDate;
    const isWithinTimeFrame =
      isDateSame &&
      currentTimeOnly >= startTimeOnly &&
      currentTimeOnly <= endTimeOnly;
    return status === "confirmed" && isWithinTimeFrame;
  });
  return (
    <div className="container-fluid">
      {/* top  baaner */}

      {accountType === AccountType.TRAINEE &&
      onlineUsers &&
      Object.values(onlineUsers)?.length ? (
        <div className="banner">
          <h1>
            Coaches online <span>Now!</span>
          </h1>

          <div className="banner_Slider">
            <Slider {...settings}>
              {onlineUsers &&
                Object?.values(onlineUsers)?.map((info, index) => {
                  return (
                    <div key={`slider-${info?._id}-${index}`}>
                      <OnlineUserCard trainer={info} />
                    </div>
                  );
                })}
            </Slider>
          </div>
        </div>
      ) : null}

      {accountType === AccountType.TRAINEE &&
      filteredSessions &&
      filteredSessions?.length ? (
        <div className="upcoming_session">
          <h1>Active Sessions</h1>
          {filteredSessions.map((session) => (
            <div className="upcoming_session_content mb-3">
              <div className="">
                <div className="">
                  <div className="" style={{ display: "flex" }}>
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        border: "2px solid rgb(0, 0, 128)",
                        borderRadius: "5px",
                        padding: "5px",
                      }}
                    >
                      <img
                        src={
                          session.trainer_info
                            .profile_picture
                            ? Utils.getImageUrlOfS3(
                                session.trainer_info
                                  .profile_picture
                              )
                            : "/assets/images/demoUser.png"
                        }
                        alt="trainer_image"
                        className="rounded"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          borderRadius: "50%",
                          transition: "all 0.6s linear",
                        }}
                        onError={(e) => {
                          e.target.src = "/assets/images/demoUser.png";
                        }}
                      />
                    </div>
                    <div>
                      <div className="d-flex">
                        <h4 className="ml-3" style={{ color: "white" }}>
                          Trainer :
                        </h4>
                        <h4 className="ml-1" style={{ color: "white" }}>
                          {session.trainer_info.fullname}
                        </h4>
                      </div>
                      <a href={"/meeting?id=" + session._id}>
                        <div className="ml-3 mt-2 instant">
                          <h5>Join Meeting Now </h5>
                        </div>
                      </a>
                    </div>
                  </div>

                  <div className="d-flex mt-2" style={{flexDirection:width600?"column":"row"}}>
                    <div className="d-flex">
                      <h4 style={{ color: "white" }}>Date :</h4>
                      <h4 className="ml-1" style={{ color: "white" }}>
                        {Utils.getDateInFormat(
                          session.booked_date
                        )}
                      </h4>
                    </div>
                    <div className="d-flex">
                      <h4 className="ml-3" style={{ color: "white" }}>
                        Time Durations :
                      </h4>
                      <h4
                        className="ml-1"
                        style={{ color: "white" }}
                      >{`${formatTimeInLocalZone(
                        session.start_time
                      )} - ${formatTimeInLocalZone(
                        session.end_time
                      )}`}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div
        className="row"
        style={{
          marginLeft: "0px",
          marginRight: "0px",
        }}
      >
        {/* Right side */}
        <div
          className={`${
            width600
              ? "row"
              : width1200
              ? "col-sm-12"
              : width2000
              ? "col-sm-3"
              : ""
          }  my-3`}
          style={{
            width: "auto !important",
            padding: "0px",
            height: "100%",
            display: width1200 || width600 ? "flex" : "block",
            gap: width600 ? "30px" : "0px",
          }}
        >
          <div
            className={`${
              width600
                ? "col-sm-12"
                : width1200
                ? "col-sm-6"
                : width2000
                ? "col-sm-12"
                : ""
            }`}
            style={{
              height: width600 ? "" : "400px",
            }}
          >
            <UserInfoCard />
          </div>
          <div
            className={`${
              width600
                ? "col-sm-12"
                : width1200
                ? "col-sm-6"
                : width2000
                ? "col-sm-12"
                : ""
            }  ${!width1200 ? "my-3" : ""}`}
            style={{
              height: width1200 ? "100%" : "calc(100% - 400px)",
            }}
          >
            {/* <div className={`card trainer-profile-card Home-main-Cont ${width1200 ? "max-height-280px" : ""}`} style={{ width: "100%", color: "black", maxHeight: (width1200 && accountType === AccountType?.TRAINER) ? '350px' : (width1200 && accountType !== AccountType?.TRAINER) ? '280px' : '' }}>
                            <div className='card-body'>
                                <RecentUsers />
                            </div>
                        </div> */}
            <div
              className={`card trainer-profile-card Home-main-Cont `}
              style={{ width: "100%", color: "black", height: "100%" }}
            >
              <div
                className="card-body"
                style={{
                  height: "100%",
                }}
              >
                <RecentUsers />
              </div>
            </div>
          </div>
        </div>
        {/* Middle */}
        <div
          className={`${
            width600
              ? "col-sm-12"
              : width1200
              ? "col-sm-12"
              : width2000
              ? "col-sm-6"
              : ""
          } my-3`}
          style={{ width: "auto !important", padding: "0px" }}
        >
          <div
            className="card trainer-profile-card Home-main-Cont"
            style={{
              height: "100%",
              width: "100%",
              overflow: "auto",
              minWidth: "97%",
            }}
          >
            <div
              className="card-body"
              style={{ padding: width600 ? "5px" : "auto" }}
            >
              <NavHomePageCenterContainer />
            </div>
          </div>
        </div>

        {/* Left side */}
        <div
          className={`${
            width600
              ? "col-sm-12"
              : width1200
              ? "row"
              : width2000
              ? "col-sm-3"
              : ""
          }`}
          style={{ width: "auto !important", padding: "0px", marginTop: "5px" }}
        >
          <div
            className={`${
              width600
                ? "col-sm-12"
                : width1200
                ? "col-sm-6"
                : width2000
                ? "col-sm-12"
                : ""
            } my-3`}
            style={{
              padding: width600 ? "0px" : "0px 15px",
            }}
          >
            <div
              className="card trainer-profile-card Home-main-Cont "
              style={{ height: "100%", width: "100%" }}
            >
              <div className="card-body">
                <UploadClipCard progress={progress} setProgress={setProgress} />
              </div>
            </div>
          </div>

          <div
            className={`${
              width600
                ? "col-sm-12"
                : width1200
                ? "col-sm-6"
                : width2000
                ? "col-sm-12"
                : ""
            } my-3`}
            style={{
              padding: width600 ? "0px" : "0px 15px",
            }}
          >
            <div
              className="card trainer-profile-card Home-main-Cont"
              style={{
                height: "auto",
                minWidth: "200px",
                width: "100%",
                minHeight: "10rem",
              }}
            >
              <div className="card-body">
                <div>
                  {/* <ShareClipsCard /> */}
                  <img
                    src={"/assets/images/dashboard-card.webp"}
                    alt="trainer_image"
                    className="rounded"
                    style={{
                      height: "150px",
                      width: "100%",
                      marginInline: "auto",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.target.src = "/assets/images/dashboard-card.webp";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className={`${
              width600
                ? "col-sm-12"
                : width1200
                ? "col-sm-6"
                : width2000
                ? "col-sm-12"
                : ""
            } my-3`}
            style={{
              padding: width600 ? "0px" : "0px 15px",
            }}
          >
            <div
              className="card trainer-profile-card Home-main-Cont"
              style={{ height: "100%", width: "100%" }}
            >
              <div className="card-body">
                <InviteFriendsCard />
              </div>
            </div>
          </div>

          <div
            className={`${
              width600
                ? "col-sm-12"
                : width1200
                ? "col-sm-6"
                : width2000
                ? "col-sm-12"
                : ""
            } my-3`}
            style={{
              padding: width600 ? "0px" : "0px 15px",
            }}
          >
            <div
              className="card trainer-profile-card Home-main-Cont"
              style={{ height: "auto", width: "100%", minHeight: "10rem" }}
            >
              <div className="card-body">
                <div>
                  {/* <ShareClipsCard /> */}
                  <img
                    src={"/assets/images/callaway.jpg"}
                    alt="trainer_image"
                    className="rounded"
                    style={{
                      height: "150px",
                      marginInline: "auto",
                      display: "block",
                      width: "100%",
                    }}
                    onError={(e) => {
                      e.target.src = "/assets/images/callaway.jpg";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavHomePage;
