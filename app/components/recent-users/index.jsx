import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppDispatch } from "../../store";
import { authState } from "../auth/auth.slice";
import { AccountType, LOCAL_STORAGE_KEYS } from "../../common/constants";
import {
  getRecentStudent,
  getRecentTrainers,
  getTraineeClips,
} from "../NavHomePage/navHomePage.api";
import Modal from "../../common/modal";
import { X } from "react-feather";
import StudentDetail from "../Header/StudentTab/StudentDetail";
import { Utils } from "../../../utils/utils";
import { useMediaQuery } from "../../hook/useMediaQuery";
import BookingTable from "../trainee/scheduleTraining/BookingTable.jsx";
import { TrainerDetails } from "../trainer/trainerDetails.jsx";
import { getTraineeWithSlotsAsync } from "../trainee/trainee.slice";
import Slider from "react-slick";

// const placeholderImageUrl = '/assets/images/avtar/user.png'; // Placeholder image path
const placeholderImageUrl = "/assets/images/demoUser.png"; // Placeholder image path

// Array.from({ length: 10 }, () => placeholderImageUrl)

const RecentUsers = ({ onTraineeSelect }) => {
  const [accountType, setAccountType] = useState("");
  const [recentStudent, setRecentStudent] = useState([]);
  const [recentTrainer, setRecentTrainer] = useState([]);

  const [recentFriends, setRecentFriends] = useState(
    Array.from({ length: 5 }, () => placeholderImageUrl)
  );
  const [recentStudentClips, setRecentStudentClips] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudentData, SetselectedStudentData] = useState({});
  const width600 = useMediaQuery(600);

  useEffect(() => {
    getRecentStudentApi();
    getRecentTrainerApi();
    setAccountType(localStorage.getItem(LOCAL_STORAGE_KEYS?.ACC_TYPE));
  }, []);

  const getRecentStudentApi = async () => {
    try {
      let res = await getRecentStudent();
      // API returns { status: "SUCCESS", data: [...] }
      // axiosInstance returns response.data, so res is { status: "SUCCESS", data: [...] }
      // We need to access res.data to get the array
      const students = (res?.data && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
      setRecentStudent(students);
      console.log("Recent students fetched:", students.length, "students");
    } catch (error) {
      console.error("Error fetching recent students:", error);
      setRecentStudent([]);
    }
  };

  const getRecentTrainerApi = async () => {
    try {
      let res = await getRecentTrainers();
      setRecentTrainer(res?.data || []);
    } catch (error) {
      console.error("Error fetching recent trainers:", error);
      setRecentTrainer([]);
    }
  };
  const getTraineeClipsApi = async (id) => {
    try {
      let res = await getTraineeClips({ trainer_id: id });
      setRecentStudentClips(res?.data);
    } catch (error) {
       
    }
  };
  const handleStudentClick = (id) => {
    setRecentStudentClips(null);
    setIsOpen(true);
    getTraineeClipsApi(id);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setRecentStudentClips(null);
  };

  const [startDate, setStartDate] = useState(new Date());
  const [activeTrainer, setActiveTrainer] = useState([]);
  const [getParams, setParams] = useState("");
  const [query, setQuery] = useState("");
  const [trainer, setTrainer] = useState({ trainer_id: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState({
    id: null,
    trainer_id: null,
    data: {},
  });
  const [trainerInfo, setTrainerInfo] = useState({
    userInfo: null,
    selected_category: null,
  });
  const [categoryList, setCategoryList] = useState([]);
  const dispatch = useAppDispatch()

  // Slider settings for recent users - horizontal scroll with touch/swipe support
  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: width600 ? 2.5 : 6,
    slidesToScroll: 1,
    swipe: true, // Enable touch/swipe
    swipeToSlide: true, // Allow swiping to slide
    touchMove: true, // Enable touch move
    touchThreshold: 5, // Sensitivity for touch
    draggable: true, // Enable dragging
    arrows: true, // Always show arrows
    variableWidth: false,
    adaptiveHeight: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
          swipe: true,
          swipeToSlide: true,
          touchMove: true,
          draggable: true,
          arrows: true,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          swipe: true,
          swipeToSlide: true,
          touchMove: true,
          draggable: true,
          arrows: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2.5,
          slidesToScroll: 1,
          swipe: true,
          swipeToSlide: true,
          touchMove: true,
          draggable: true,
          arrows: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          swipe: true,
          swipeToSlide: true,
          touchMove: true,
          draggable: true,
          arrows: true,
        },
      },
    ],
  };

  // Get the current list based on account type
  const currentList = accountType === AccountType?.TRAINER ? recentStudent : recentTrainer;
  
  // Debug: Log current list to verify data
  useEffect(() => {
    if (currentList && currentList.length > 0) {
      console.log("Current list to display:", currentList.length, "items", currentList);
    } else {
      console.log("No items to display. Account type:", accountType, "Recent student count:", recentStudent.length, "Recent trainer count:", recentTrainer.length);
    }
  }, [currentList, accountType, recentStudent.length, recentTrainer.length]);

  return (
    <>
      <style>{`
        .recent-users-slider {
          width: 100%;
          overflow: hidden;
          position: relative;
          -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
        }
        .recent-users-slider .slick-list {
          overflow: visible;
          margin: 0 -8px;
          touch-action: pan-y pinch-zoom; /* Enable touch gestures */
        }
        .recent-users-slider .slick-track {
          display: flex;
          align-items: stretch;
          touch-action: pan-y pinch-zoom;
        }
        .recent-users-slider .slick-slide {
          padding: 0 8px;
          touch-action: pan-y pinch-zoom;
        }
        .recent-users-slider .slick-slide > div {
          height: 100%;
        }
        .recent-users-slider .slick-prev,
        .recent-users-slider .slick-next {
          z-index: 10;
          width: 35px;
          height: 35px;
          background: #fff !important;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          display: flex !important;
          align-items: center;
          justify-content: center;
        }
        .recent-users-slider .slick-prev:hover,
        .recent-users-slider .slick-next:hover {
          background: #000080 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 128, 0.3);
        }
        .recent-users-slider .slick-prev:before,
        .recent-users-slider .slick-next:before {
          color: #000080;
          font-size: 20px;
          opacity: 1;
        }
        .recent-users-slider .slick-prev:hover:before,
        .recent-users-slider .slick-next:hover:before {
          color: #fff;
        }
        .recent-users-slider .slick-prev {
          left: -10px;
        }
        .recent-users-slider .slick-next {
          right: -10px;
        }
        .recent-users-slider .slick-prev.slick-disabled,
        .recent-users-slider .slick-next.slick-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        /* Mobile optimizations */
        @media (max-width: 600px) {
          .recent-users-slider {
            padding: 0 5px;
          }
          .recent-users-slider .slick-list {
            margin: 0 -4px;
          }
          .recent-users-slider .slick-slide {
            padding: 0 4px;
          }
          .recent-users-slider .slick-prev {
            left: -5px;
          }
          .recent-users-slider .slick-next {
            right: -5px;
          }
          .recent-users-slider .slick-prev,
          .recent-users-slider .slick-next {
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.95) !important;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }
          .recent-users-slider .slick-prev:before,
          .recent-users-slider .slick-next:before {
            font-size: 18px;
            color: #000080;
          }
          .recent-users-slider .slick-prev:active,
          .recent-users-slider .slick-next:active {
            transform: scale(0.95);
            background: #000080 !important;
          }
          .recent-users-slider .slick-prev:active:before,
          .recent-users-slider .slick-next:active:before {
            color: #fff;
          }
        }
        /* Very small screens */
        @media (max-width: 480px) {
          .recent-users-slider .slick-prev {
            left: -3px;
          }
          .recent-users-slider .slick-next {
            right: -3px;
          }
          .recent-users-slider .slick-prev,
          .recent-users-slider .slick-next {
            width: 28px;
            height: 28px;
          }
          .recent-users-slider .slick-prev:before,
          .recent-users-slider .slick-next:before {
            font-size: 16px;
          }
        }
      `}</style>
      <div className="card rounded trainer-profile-card Select Recent Student" style={{ 
        height: accountType === AccountType?.TRAINEE ? (width600 ? "auto" : "280px") : "100%",
        minHeight: accountType === AccountType?.TRAINEE ? (width600 ? "280px" : "280px") : "auto",
        maxHeight: accountType === AccountType?.TRAINEE ? (width600 ? "none" : "280px") : "none",
        display: "flex",
        flexDirection: "column",
        overflow: "visible"
      }}>
      {trainerInfo && trainerInfo.userInfo ? (
        <Modal
          className="recent-user-modal"
          isOpen={isModalOpen}
          allowFullWidth={true}
          element={
            <TrainerDetails
              selectOption={trainerInfo}
              isPopoverOpen={isPopoverOpen}
              categoryList={categoryList}
              key={`trainerDetails`}
              searchQuery={query}
              trainerInfo={trainerInfo?.userInfo}
              selectTrainer={(_id, trainer_id, data) => {
                if (_id) {
                  setSelectedTrainer({
                    ...selectedTrainer,
                    id: _id,
                    trainer_id,
                    data,
                  });
                }
                setTrainerInfo((pre) => {
                  return {
                    ...pre,
                    userInfo: {
                      ...pre?.userInfo,
                      ...data,
                    },
                  };
                });
              }}
              onClose={() => {
                setTrainerInfo((prev) => ({
                  ...prev,
                  userInfo: undefined,
                  selected_category: undefined,
                }));
                setParams((prev) => ({
                  ...prev,
                  search: null,
                }));
                setIsModalOpen(false);
              }}
              isUserOnline={true}
              element={
                <BookingTable
                  selectedTrainer={selectedTrainer}
                  trainerInfo={trainerInfo}
                  setStartDate={setStartDate}
                  startDate={startDate}
                  getParams={getParams}
                  isUserOnline={true}
                />
              }
            />
          }
        />
      ) : (
        <></>
      )}
      <h2
        className="Recent-Heading"
        style={{ 
          textAlign: "center", 
          fontSize: width600 ? "18px" : "20px",
          fontWeight: "600",
          color: "#333",
          marginBottom: width600 ? "10px" : "15px",
          paddingTop: width600 ? "12px" : "15px",
          paddingLeft: width600 ? "8px" : "0",
          paddingRight: width600 ? "8px" : "0",
          display: "block",
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        Recent {accountType === AccountType?.TRAINER ? "Students" : "Experts"}
      </h2>
      <div
        className="card-body Recent"
        style={{
          width: "100%",
          marginTop: "0px",
          padding: width600 ? "8px 6px" : "15px 12px",
          overflow: "hidden",
          height: accountType === AccountType?.TRAINEE ? (width600 ? "auto" : "calc(100% - 60px)") : "auto",
          minHeight: accountType === AccountType?.TRAINEE ? (width600 ? "200px" : "auto") : "auto",
          display: "flex",
          flexDirection: "column",
          flex: "1"
        }}
      >
        {/* Box container with proper styling */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            padding: width600 ? "15px 10px" : "20px 15px",
            position: "relative",
            overflow: "hidden",
            height: accountType === AccountType?.TRAINEE ? (width600 ? "auto" : "200px") : "auto",
            minHeight: accountType === AccountType?.TRAINEE ? (width600 ? "180px" : "200px") : "180px",
            maxHeight: accountType === AccountType?.TRAINEE ? (width600 ? "none" : "200px") : "none",
            flex: accountType === AccountType?.TRAINEE ? "1" : "none"
          }}
        >
          {currentList && currentList.length > 0 ? (
            <div className="recent-users-slider" style={{ position: "relative", width: "100%" }}>
              <Slider {...sliderSettings}>
                {currentList.map((item, index) => (
                  <div key={index} style={{ padding: width600 ? "0 5px" : "0 8px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        overflow: "hidden",
                        cursor: "pointer",
                        padding: width600 ? "10px 6px" : "10px",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                        backgroundColor: "#fafafa",
                        border: "1px solid #f0f0f0",
                        minHeight: width600 ? "140px" : "140px",
                        touchAction: "manipulation" /* Better touch handling */
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.15)";
                        e.currentTarget.style.borderColor = "#000080";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#fafafa";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "#f0f0f0";
                      }}
                      onClick={() => {
                        if (accountType === AccountType?.TRAINER) {
                          const traineeId = item?._id || item?.id;
                          // Call the callback to set trainee in locker page
                          if (onTraineeSelect) {
                            onTraineeSelect(traineeId);
                          }
                          // Also open the modal for detailed view
                          handleStudentClick(traineeId);
                          SetselectedStudentData({ ...item });
                        } else {
                          setTrainerInfo((prev) => ({
                            ...prev,
                            userInfo: item,
                            selected_category: null,
                          }));
                          setSelectedTrainer({
                            id: item?.id || item?._id,
                            trainer_id: item?.id || item?._id,
                            data: item,
                          });
                          dispatch(getTraineeWithSlotsAsync({ search: item?.fullname || item?.fullName }));
                          setIsModalOpen(true);
                        }
                      }}
                    >
                      <div
                        style={{
                          width: width600 ? "65px" : "80px",
                          height: width600 ? "65px" : "80px",
                          borderRadius: "50%",
                          border: width600 ? "2.5px solid rgb(0, 0, 128)" : "3px solid rgb(0, 0, 128)",
                          padding: "2px",
                          marginBottom: width600 ? "6px" : "10px",
                          transition: "all 0.3s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          backgroundColor: "#fff",
                          boxSizing: "border-box",
                          flexShrink: 0
                        }}
                      >
                        <img
                          className="Image-Division"
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                            objectPosition: "center",
                            display: "block",
                          }}
                          src={
                            Utils?.getImageUrlOfS3(item?.profile_picture || item.profile_picture) ||
                            "/assets/images/demoUser.png"
                          }
                          alt={
                            accountType === AccountType?.TRAINER
                              ? `Recent Student ${index + 1}`
                              : `Recent Expert ${index + 1}`
                          }
                          onError={(e) => {
                            e.target.src = "/assets/images/demoUser.png";
                          }}
                        />
                      </div>
                      <h5
                        style={{
                          maxWidth: "100%",
                          marginBottom: "0px",
                          fontSize: width600 ? "12px" : "13px",
                          fontWeight: "500",
                          color: "#333",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          width: "100%",
                          padding: "0 4px",
                          lineHeight: "1.3"
                        }}
                      >
                        {item?.fullname || item?.fullName || 'Unknown'}
                      </h5>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 20px",
                color: "#999",
                fontSize: "14px"
              }}
            >
              No recent {accountType === AccountType?.TRAINER ? "students" : "experts"} found
            </div>
          )}
        </div>
      </div>
      {accountType === AccountType?.TRAINER && (
        <Modal
          isOpen={isOpen}
          element={
            <div className="container media-gallery portfolio-section grid-portfolio ">
              <div className="theme-title">
                <div className="media">
                  <div className="media-body media-body text-right">
                    <div
                      className="icon-btn btn-sm btn-outline-light close-apps pointer"
                      onClick={handleCloseModal}
                    >
                      <X />
                    </div>
                  </div>
                </div>
                <StudentDetail
                  videoClips={recentStudentClips}
                  data={selectedStudentData}
                />
              </div>
            </div>
          }
        />
      )}
    </div>
    </>
  );
};

export default RecentUsers;
