import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppDispatch } from "../../store";
import { authState } from "../auth/auth.slice";
import { AccountType, LOCAL_STORAGE_KEYS } from "../../common/constants";
import {
  getRecentStudent,
  getTraineeClips,
} from "../NavHomePage/navHomePage.api";
import Modal from "../../common/modal";
import { X } from "react-feather";
import StudentDetail from "../Header/StudentTab/StudentDetail";
import { Utils } from "../../../utils/utils";
import './index.js';
import { useMediaQuery } from "../../hook/useMediaQuery.js";

// const placeholderImageUrl = '/assets/images/avtar/user.png'; // Placeholder image path
const placeholderImageUrl = "/assets/images/demoUser.png"; // Placeholder image path

// Array.from({ length: 10 }, () => placeholderImageUrl)

const RecentUsers = () => {
  const [accountType, setAccountType] = useState("");
  const [recentStudent, setRecentStudent] = useState([]);
  const [recentFriends, setRecentFriends] = useState(
    Array.from({ length: 5 }, () => placeholderImageUrl)
  );
  const [recentStudentClips, setRecentStudentClips] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudentData, SetselectedStudentData] = useState({});
  const width600 = useMediaQuery(600);
  
  useEffect(() => {
    getRecentStudentApi();
    setAccountType(localStorage.getItem(LOCAL_STORAGE_KEYS?.ACC_TYPE));
  }, []);

  const getRecentStudentApi = async () => {
    try {
      let res = await getRecentStudent();
      setRecentStudent(res?.data);
    } catch (error) {
      console.log(error);
    }
  };
  const getTraineeClipsApi = async (id) => {
    try {
      let res = await getTraineeClips({ trainer_id: id });
      setRecentStudentClips(res?.data);
    } catch (error) {
      console.log(error);
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

  return (
    <div className="card rounded trainer-profile-card Select Recent Student">
      <h2
        className="Recent-Heading"
        style={{ textAlign: "center", fontSize: "20px" }}
      >
        Recent {accountType === AccountType?.TRAINER ? "Students" : "Friends"}
      </h2>
      <div
        className="card-body Recent"
        style={{
          width: "100%",
          maxHeight: "95%",
          // height :"300px",
          marginTop: "5px",
          // overflowX: "auto",
        }}
      >
        <div
          className="row"
          style={{ justifyContent: "center", paddingTop: "10px" }}
        >
          <div
            className="recent-users"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(100px, 1fr))",
              gridGap: width600?"15px":"10px",
              paddingTop: "5px",
              width: width600?"50%":"100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Render images dynamically */}
            {accountType === AccountType?.TRAINER &&
              recentStudent?.map((item, index) => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "2px solid rgb(0, 0, 128)",
                    // padding : "5px",
                    textAlign: "center",
                    overflow: "hidden",
                  }}
                >
                  <img
                    className="Image-Division"
                    style={{
                      marginRight: "0px"
                    }}
                    key={index}
                    // src={item?.profile_picture}
                    src={
                      Utils?.getImageUrlOfS3(item?.profile_picture) ||
                      "/assets/images/demoUser.png"
                    }
                    alt={`Recent Trainee ${index + 1}`}
                    onError={(e) => {
                      e.target.src = "/assets/images/demoUser.png"; // Set default image on error
                    }}
                    onClick={() => {
                      handleStudentClick(item);
                      SetselectedStudentData({ ...item });
                    }}
                  />
                  <h5 class="d-inline-block text-truncate" style={{ maxWidth: "80px", marginBottom: "5px" }}>{item?.fullname}</h5>
                </div>
              ))}

            {accountType === AccountType?.TRAINEE &&
              recentFriends?.map((item, index) => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "2px solid rgb(0, 0, 128)",
                    // padding: "5px",
                    textAlign: "center",
                    overflow:"hidden"
                  }}
                >
                  <img
                    className="Image-Division"
                    style={{
                      marginRight: "0px"
                    }}
                    key={index}
                    // src={item || '/assets/images/demoUser.png'}
                    src={
                      Utils?.getImageUrlOfS3(item) ||
                      "/assets/images/demoUser.png"
                    }
                    onClick={() =>
                      handleStudentClick({ profile_picture: item })
                    }
                    onError={(e) => {
                      e.target.src = "/assets/images/demoUser.png"; // Set default image on error
                    }}
                    alt={`Recent Trainee ${index + 1}`}

                  />
                  <h5 class="d-inline-block text-truncate" style={{ maxWidth: "80px", marginBottom: "5px" }}>
                    Student {index + 1}
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
