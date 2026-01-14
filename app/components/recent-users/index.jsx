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

  // Slider settings for recent users - horizontal scroll
  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: width600 ? 3 : 6,
    slidesToScroll: 1,
    swipeToSlide: true,
    arrows: true,
    variableWidth: false,
    adaptiveHeight: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
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
        }
        .recent-users-slider .slick-list {
          overflow: visible;
          margin: 0 -8px;
        }
        .recent-users-slider .slick-track {
          display: flex;
          align-items: stretch;
        }
        .recent-users-slider .slick-slide {
          padding: 0 8px;
        }
        .recent-users-slider .slick-slide > div {
          height: 100%;
        }
        .recent-users-slider .slick-prev,
        .recent-users-slider .slick-next {
          z-index: 1;
          width: 35px;
          height: 35px;
          background: #fff !important;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
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
          left: -15px;
        }
        .recent-users-slider .slick-next {
          right: -15px;
        }
        @media (max-width: 600px) {
          .recent-users-slider .slick-prev {
            left: -10px;
          }
          .recent-users-slider .slick-next {
            right: -10px;
          }
          .recent-users-slider .slick-prev,
          .recent-users-slider .slick-next {
            width: 30px;
            height: 30px;
          }
          .recent-users-slider .slick-prev:before,
          .recent-users-slider .slick-next:before {
            font-size: 16px;
          }
        }
      `}</style>
      <div className="card rounded trainer-profile-card Select Recent Student" style={{ 
        height: accountType === AccountType?.TRAINEE ? "280px" : "100%",
        minHeight: accountType === AccountType?.TRAINEE ? "280px" : "auto",
        maxHeight: accountType === AccountType?.TRAINEE ? "280px" : "none"
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
          marginBottom: "15px",
          paddingTop: "15px"
        }}
      >
        Recent {accountType === AccountType?.TRAINER ? "Students" : "Experts"}
      </h2>
      <div
        className="card-body Recent"
        style={{
          width: "100%",
          marginTop: "5px",
          padding: width600 ? "12px 8px" : "15px 12px",
          overflow: "hidden",
          height: accountType === AccountType?.TRAINEE ? "calc(100% - 60px)" : "auto",
          display: "flex",
          flexDirection: "column"
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
            height: accountType === AccountType?.TRAINEE ? "200px" : "auto",
            minHeight: accountType === AccountType?.TRAINEE ? "200px" : "180px",
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
                        padding: width600 ? "8px 4px" : "10px",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                        backgroundColor: "#fafafa",
                        border: "1px solid #f0f0f0",
                        minHeight: width600 ? "120px" : "140px"
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
                          width: width600 ? "70px" : "80px",
                          height: width600 ? "70px" : "80px",
                          borderRadius: "50%",
                          border: width600 ? "2px solid rgb(0, 0, 128)" : "3px solid rgb(0, 0, 128)",
                          padding: "2px",
                          marginBottom: width600 ? "8px" : "10px",
                          transition: "all 0.3s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          backgroundColor: "#fff",
                          boxSizing: "border-box",
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
                          fontSize: width600 ? "11px" : "13px",
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
