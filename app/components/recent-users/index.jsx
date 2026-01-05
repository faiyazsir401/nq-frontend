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

// const placeholderImageUrl = '/assets/images/avtar/user.png'; // Placeholder image path
const placeholderImageUrl = "/assets/images/demoUser.png"; // Placeholder image path

// Array.from({ length: 10 }, () => placeholderImageUrl)

const RecentUsers = () => {
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
      setRecentStudent(res?.data);
    } catch (error) {
       
    }
  };

  const getRecentTrainerApi = async () => {
    try {
      let res = await getRecentTrainers();
      setRecentTrainer(res?.data);
    } catch (error) {
       
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

  return (

    <div className="card rounded trainer-profile-card Select Recent Student" style={{ height: "100%" }}>
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
          maxHeight: "95%",
          marginTop: "5px",
          overflowY: "auto",
          padding: "10px"
        }}
      >
        <div
          className="row"
          style={{ justifyContent: "center", paddingTop: "5px" }}
        >
          <div
            className="recent-users"
            style={{
              display: "grid",
              gridTemplateColumns: width600 ? "repeat(1, 1fr)" : "repeat(2, minmax(100px, 1fr))",
              gridGap: width600 ? "20px" : "15px",
              paddingTop: "5px",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Render images dynamically */}
            {accountType === AccountType?.TRAINER &&
              recentStudent?.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    overflow: "hidden",
                    cursor: "pointer",
                    padding: "10px",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onClick={() => {
                    handleStudentClick(item);
                    SetselectedStudentData({ ...item });
                  }}
                >
                  <div
                    style={{
                      width: width600 ? "100px" : "80px",
                      height: width600 ? "100px" : "80px",
                      borderRadius: "50%",
                      border: "3px solid rgb(0, 0, 128)",
                      padding: "3px",
                      marginBottom: "8px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <img
                      className="Image-Division"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: "0px",
                      }}
                      src={
                        Utils?.getImageUrlOfS3(item?.profile_picture) ||
                        "/assets/images/demoUser.png"
                      }
                      alt={`Recent Student ${index + 1}`}
                      onError={(e) => {
                        e.target.src = "/assets/images/demoUser.png";
                      }}
                    />
                  </div>
                  <h5 
                    style={{ 
                      maxWidth: "100px", 
                      marginBottom: "0px",
                      fontSize: width600 ? "14px" : "12px",
                      fontWeight: "500",
                      color: "#333",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {item?.fullname}
                  </h5>
                </div>
              ))}

            {accountType === AccountType?.TRAINEE &&
              recentTrainer?.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    overflow: "hidden",
                    cursor: "pointer",
                    padding: "10px",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onClick={() => {
                    setTrainerInfo((prev) => ({
                      ...prev,
                      userInfo: item,
                      selected_category: null,
                    }));
                    setSelectedTrainer({
                      id: item?.id,
                      trainer_id: item?.id,
                      data: trainer,
                    });
                     
                    dispatch(getTraineeWithSlotsAsync({ search: item?.fullname }));
                    
                    setIsModalOpen(true);
                  }}
                >
                  <div
                    style={{
                      width: width600 ? "100px" : "80px",
                      height: width600 ? "100px" : "80px",
                      borderRadius: "50%",
                      border: "3px solid rgb(0, 0, 128)",
                      padding: "3px",
                      marginBottom: "8px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <img
                      className="Image-Division"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: "0px",
                      }}
                      src={
                        Utils?.getImageUrlOfS3(item.profile_picture) ||
                        "/assets/images/demoUser.png"
                      }
                      onError={(e) => {
                        e.target.src = "/assets/images/demoUser.png";
                      }}
                      alt={`Recent Expert ${index + 1}`}
                    />
                  </div>
                  <h5 
                    style={{ 
                      maxWidth: "100px", 
                      marginBottom: "0px",
                      fontSize: width600 ? "14px" : "12px",
                      fontWeight: "500",
                      color: "#333",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {item.fullname}
                  </h5>
                </div>
              ))}
          </div>
        </div>
        {/* Additional content for Recent Students section can be added here */}
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
  );
};

export default RecentUsers;
