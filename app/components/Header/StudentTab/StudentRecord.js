import React, { useEffect, useState } from "react";
import { Courses, LOCAL_STORAGE_KEYS } from "../../../common/constants";
import StudentDetail from "./StudentDetail";
import { X } from "react-feather";
import Modal from "../../../common/modal";
import {
  getRecentStudent,
  getTraineeClips,
} from "../../NavHomePage/navHomePage.api";
import { Utils } from "../../../../utils/utils";

const StudentRecord = () => {
  const [accountType, setAccountType] = useState("");
  const [recentStudent, setRecentStudent] = useState([]);
  const [recentStudentClips, setRecentStudentClips] = useState([]);
  const [selectedstudent, setselectedstudent] = useState(null);
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudentData, SetselectedStudentData] = useState({});

  const handleCourseClick = (course, index, id) => {
    setIsOpen(true);
    getTraineeClipsApi(id);
  };
  const handleCloseButtonClick = () => {
    setselectedstudent(null);
    setSelectedCourseIndex(null);
  };

  useEffect(() => {
    getRecentStudentApi();
    setAccountType(localStorage.getItem(LOCAL_STORAGE_KEYS?.ACC_TYPE));
  }, []);

  const getRecentStudentApi = async () => {
    try {
      let res = await getRecentStudent();
      setRecentStudent(res?.data);
      console.log("resresresresresresres", res);
    } catch (error) {
      console.log(error);
    }
  };

  const getTraineeClipsApi = async (id) => {
    try {
      let res = await getTraineeClips({ trainer_id: id });
      setRecentStudentClips(res?.data);
      console.log("getTraineeClipsApi==============>", res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="col-11 ml-2">
        <div className="dot-btn dot-success mt-4"></div>
        <h3 className="ml-1 text-uppercase mb-1"> Students </h3>
      </div>

      <div className={`col-12`} style={{ display: "flex", flexWrap: "wrap" }}>
        {recentStudent?.map((data, index) => {
          return (
            <div
              key={`courses_list${index}`}
              className={`col-lg-2 col-sm-12 ${
                selectedCourseIndex === index ? "selected-course" : ""
              }`}
              style={{ maxWidth: "237px", minWidth: "237px" }}
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
                    maxHeight: "200px",
                    overflow: "hidden",
                    minHeight: "200px",
                  }}
                >
                  <img
                    className="card-img-top"
                    // src={data?.profile_picture}
                    src={
                      Utils?.getImageUrlOfS3(data?.profile_picture) ||
                      "/assets/images/userdemo.png"
                    }
                    alt="Card image cap"
                    style={{
                      padding: "10px",
                      borderRadius: "20px",
                      height: "100%",
                      objectFit: "cover",
                      maxHeight: "200px",
                      minHeight: "200px",
                      maxWidth: "190px",
                      minWidth: "190px",
                    }}
                    onError={(e) => {
                      e.target.src = "/assets/images/demoUser.png"; // Set default image on error
                    }}
                  />
                </div>

                <div className="card-body">
                  <h5
                    className="card-title text-truncate"
                    style={{ textAlign: "center" }}
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
                    src="/assets/images/netquix_logo.png"
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

      {/* Modal */}
      {/* {selectedstudent && (
        <div className="modal" style={{ display: "block", alignItems: 'center' }}>
          <div className="modal-dialog" style={{ maxWidth: "50%", margin: "auto" }}>
            <div className="modal-content" style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", borderRadius: "15px", maxHeight: '500px', overflow: 'auto' }}>
              <div className="modal-dialog modal-xl">

              </div>
              <button
                className="icon-btn btn-sm btn-outline-light close-apps pointer"
                style={{ position: "absolute", top: "0px", right: "10px" }}
                onClick={handleCloseButtonClick}
              >
                <X />
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default StudentRecord;
