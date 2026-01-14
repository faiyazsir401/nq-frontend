import React, { useEffect, useState } from "react";
import { Courses, LOCAL_STORAGE_KEYS } from "../../../common/constants";
import StudentDetail from "./StudentDetail";
import { X } from "react-feather";
import Modal from "../../../common/modal";
import {
  getRecentStudent,
  getTraineeClips,
  getRecentTrainers,  // Import new API function
} from "../../NavHomePage/navHomePage.api";
import { Utils } from "../../../../utils/utils";
import { useMediaQuery } from "../../../hook/useMediaQuery";

const StudentRecord = (props) => {  // Pass props to the component
  const [accountType, setAccountType] = useState("");
  const [recentStudent, setRecentStudent] = useState([]);
  const [recentStudentClips, setRecentStudentClips] = useState([]);
  const [selectedstudent, setselectedstudent] = useState(null);
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudentData, SetselectedStudentData] = useState({});
  const width600 = useMediaQuery(600);

  const handleCourseClick = (course, index, id) => {
    setIsOpen(true);
    getTraineeClipsApi(id);
  };
  const handleCloseButtonClick = () => {
    setselectedstudent(null);
    setSelectedCourseIndex(null);
  };

  // Fetch data depending on whether props.friends is true
  useEffect(() => {
    if (props.friends) {
      getRecentTrainersApi();  // Fetch recent trainers
    } else {
      getRecentStudentApi();   // Fetch recent students
    }
    setAccountType(localStorage.getItem(LOCAL_STORAGE_KEYS?.ACC_TYPE));
  }, [props.friends]);  // Rerun the effect when props.friends changes

  const getRecentStudentApi = async () => {
    try {
      let res = await getRecentStudent();
      setRecentStudent(res?.data);
       
    } catch (error) {
       
    }
  };

  const getRecentTrainersApi = async () => {
    try {
      let res = await getRecentTrainers();
      setRecentStudent(res?.data);  // Store trainers in the same state variable
       
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

  return (
    <div>
      <div className="col-11 ml-2" style={{ width: "100%", padding: width600 ? "8px" : "0" }}>
        <div className="dot-btn dot-success mt-4"></div>
        <h3 className="ml-1 text-uppercase mb-1" style={{ 
          fontSize: width600 ? "18px" : "22px",
          display: "block",
          width: "100%"
        }}> {props.friends ? 'Experts' : 'Students'} </h3>
      </div>

      <div className={`col-12`} style={{ 
        display: "flex", 
        flexWrap: "wrap",
        gap: width600 ? "12px" : "16px",
        justifyContent: width600 ? "center" : "flex-start",
        padding: width600 ? "8px" : "0"
      }}>
        {recentStudent?.map((data, index) => {
          return (
            <div
              key={`courses_list${index}`}
              className={`col-lg-2 col-sm-12 ${
                selectedCourseIndex === index ? "selected-course" : ""
              }`}
              style={{ 
                maxWidth: width600 ? "150px" : "237px", 
                minWidth: width600 ? "150px" : "237px",
                flex: width600 ? "0 0 auto" : "none"
              }}
            >
              <div
                className="card m-2"
                onClick={() => {
                  handleCourseClick(data, index, data?._id);
                  SetselectedStudentData({ ...data });
                }}
                style={{
                  cursor: "pointer",
                  border: "2px solid rgb(0, 0, 128)",
                  borderRadius: "5px",
                }}
              >
                <div
                  className="Top-img"
                  style={{
                    maxHeight: width600 ? "150px" : "200px",
                    overflow: "hidden",
                    minHeight: width600 ? "150px" : "200px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <img
                    className="card-img-top"
                    src={
                      Utils?.getImageUrlOfS3(data?.profile_picture) ||
                      "/assets/images/userdemo.png"
                    }
                    alt="Card image cap"
                    style={{
                      padding: width600 ? "8px" : "10px",
                      borderRadius: "20px",
                      height: "100%",
                      objectFit: "cover",
                      maxHeight: width600 ? "150px" : "200px",
                      minHeight: width600 ? "150px" : "200px",
                      maxWidth: width600 ? "134px" : "190px",
                      minWidth: width600 ? "134px" : "190px",
                    }}
                    onError={(e) => {
                      e.target.src = "/assets/images/demoUser.png"; // Set default image on error
                    }}
                  />
                </div>

                <div className="card-body" style={{ padding: width600 ? "8px" : "15px" }}>
                  <h5
                    className="card-title text-truncate"
                    style={{ 
                      textAlign: "center",
                      fontSize: width600 ? "13px" : "16px",
                      marginBottom: "0"
                    }}
                  >
                    {data?.fullname}
                  </h5>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isOpen}
        element={
          <div className="container media-gallery portfolio-section grid-portfolio ">
            <div className="theme-title">
              <div className="media mb-4">
                <div className="logo" style={{ marginLeft: "70px" }}>
                  <img
                    src="/assets/images/netquix_logo_beta.png"
                    alt="Left Logo"
                    height="75px"
                    width="246px"
                  />
                </div>
                <div className="media-body media-body text-right">
                  <div
                    className="icon-btn btn-sm btn-outline-light close-apps pointer"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                  >
                    {" "}
                    <X />{" "}
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
    </div>
  );
};

export default StudentRecord;
