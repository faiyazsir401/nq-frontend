import React, { useEffect, useState } from "react";
import { getRecentStudent, getRecentTrainers, getTraineeClips } from "../../NavHomePage/navHomePage.api";
import { AccountType, LOCAL_STORAGE_KEYS } from "../../../common/constants";
import { Utils } from "../../../../utils/utils";
import { useMediaQuery } from "../../../hook/useMediaQuery";
import Modal from "../../../common/modal";
import { X } from "react-feather";
import StudentDetail from "../../Header/StudentTab/StudentDetail";

const RecentStudent = () => {
  const [accountType, setAccountType] = useState("");
  const [recentStudent, setRecentStudent] = useState([]);
  const [recentTrainer, setRecentTrainer] = useState([]);
  const [recentStudentClips, setRecentStudentClips] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudentData, setSelectedStudentData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Media queries for responsive design
  const width600 = useMediaQuery(600);
  const width900 = useMediaQuery(900);
  const width1200 = useMediaQuery(1200);

  useEffect(() => {
    getRecentStudentApi();
    getRecentTrainerApi();
    setAccountType(localStorage.getItem(LOCAL_STORAGE_KEYS?.ACC_TYPE));
  }, []);

  const getRecentStudentApi = async () => {
    try {
      let res = await getRecentStudent();
      setRecentStudent(res?.data || []);
    } catch (error) {
      console.error("Error fetching recent students:", error);
    }
  };

  const getRecentTrainerApi = async () => {
    try {
      let res = await getRecentTrainers();
      setRecentTrainer(res?.data || []);
    } catch (error) {
      console.error("Error fetching recent trainers:", error);
    }
  };

  const getTraineeClipsApi = async (id) => {
    try {
      let res = await getTraineeClips({ trainer_id: id });
      setRecentStudentClips(res?.data);
    } catch (error) {
      console.error("Error fetching trainee clips:", error);
    }
  };

  const handleStudentClick = (item) => {
    const studentId = item?._id || item?.id;
    setSelectedStudentData({ ...item });
    setRecentStudentClips(null);
    setIsModalOpen(true);
    getTraineeClipsApi(studentId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRecentStudentClips(null);
    setSelectedStudentData({});
  };

  // Get the current list based on account type
  const currentList = accountType === AccountType?.TRAINER ? recentStudent : recentTrainer;
  const headingText = accountType === AccountType?.TRAINER ? "Recent Enthusiasts" : "Recent Experts";

  // Responsive grid columns
  const getGridColumns = () => {
    if (width600) return "repeat(2, 1fr)";
    if (width900) return "repeat(3, 1fr)";
    if (width1200) return "repeat(4, 1fr)";
    return "repeat(4, 1fr)";
  };

  // Responsive image size
  const getImageSize = () => {
    if (width600) return { width: "70px", height: "70px" };
    if (width900) return { width: "80px", height: "80px" };
    return { width: "90px", height: "90px" };
  };

  const imageSize = getImageSize();

  return (
    <>
      <style>{`
        .recent-student-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 10px;
        }
        
        .recent-student-card {
          width: 100%;
          box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
          border: none;
          border-radius: 12px;
          background: #fff;
          display: flex;
          flex-direction: column;
          overflow: visible;
        }
        
        .recent-student-header {
          text-align: center;
          font-weight: 600;
          color: #333;
          margin-bottom: 0;
          padding: 20px 15px 10px;
          width: 100%;
          box-sizing: border-box;
        }
        
        .recent-student-grid {
          display: grid;
          gap: 16px;
          padding: 15px;
          width: 100%;
          box-sizing: border-box;
          overflow-y: auto;
        }
        
        .recent-student-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 12px;
          border-radius: 10px;
          background-color: #fafafa;
          border: 1px solid #f0f0f0;
          transition: all 0.3s ease;
          min-height: 140px;
        }
        
        .recent-student-item:hover {
          background-color: #f5f5f5;
          transform: translateY(-4px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          border-color: #000080;
        }
        
        .recent-student-avatar {
          border-radius: 50%;
          border: 3px solid rgb(0, 0, 128);
          padding: 2px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #fff;
          box-sizing: border-box;
          flex-shrink: 0;
        }
        
        .recent-student-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        
        .recent-student-name {
          max-width: 100%;
          margin-bottom: 0px;
          font-weight: 500;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
          padding: 0 4px;
          line-height: 1.3;
          text-align: center;
        }
        
        .recent-student-empty {
          grid-column: 1 / -1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
          color: #999;
          font-size: 14px;
          text-align: center;
        }
        
        /* Mobile styles */
        @media (max-width: 600px) {
          .recent-student-container {
            margin-top: 16px;
          }
          
          .recent-student-card {
            margin-top: 16px;
          }
          
          .recent-student-header {
            font-size: 18px;
            padding: 12px 8px 8px;
          }
          
          .recent-student-grid {
            gap: 12px;
            padding: 10px 5px;
            max-height: 60vh;
          }
          
          .recent-student-item {
            padding: 8px;
            min-height: 120px;
          }
          
          .recent-student-avatar {
            border-width: 2px;
            margin-bottom: 8px;
          }
          
          .recent-student-name {
            font-size: 11px;
          }
        }
        
        /* Tablet styles */
        @media (min-width: 601px) and (max-width: 900px) {
          .recent-student-header {
            font-size: 20px;
            padding: 15px 12px 10px;
          }
          
          .recent-student-grid {
            gap: 14px;
            padding: 12px 8px;
            max-height: 70vh;
          }
          
          .recent-student-item {
            min-height: 130px;
          }
        }
        
        /* Desktop styles */
        @media (min-width: 901px) {
          .recent-student-header {
            font-size: 22px;
            padding: 20px 15px 10px;
          }
          
          .recent-student-grid {
            gap: 16px;
            padding: 15px 10px;
            max-height: 75vh;
          }
        }
        
        /* Modal styles */
        .recent-student-modal-content {
          width: 100%;
          max-width: 100%;
          padding: 20px;
          box-sizing: border-box;
        }
        
        .recent-student-modal-header {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 15px;
        }
        
        .recent-student-close-btn {
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
        }
        
        .recent-student-close-btn:hover {
          background-color: #f0f0f0;
        }
        
        @media (max-width: 600px) {
          .recent-student-modal-content {
            padding: 15px 10px;
          }
        }
      `}</style>

      <div className="recent-student-container">
        <div className="recent-student-card">
          <div className="card-body" style={{ padding: width600 ? '12px 8px' : '20px', display: 'flex', flexDirection: 'column', flex: '1' }}>
            <h2 className="recent-student-header">
              {headingText}
            </h2>
            
            <div 
              className="recent-student-grid" 
              style={{ 
                gridTemplateColumns: getGridColumns(),
              }}
            >
              {currentList && currentList.length > 0 ? (
                currentList.map((item, index) => (
                  <div
                    key={item?._id || item?.id || index}
                    className="recent-student-item"
                    onClick={() => {
                      if (accountType === AccountType?.TRAINER) {
                        handleStudentClick(item);
                      }
                    }}
                  >
                    <div
                      className="recent-student-avatar"
                      style={{
                        width: imageSize.width,
                        height: imageSize.height,
                      }}
                    >
                      <img
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
                      className="recent-student-name"
                      style={{
                        fontSize: width600 ? '11px' : width900 ? '12px' : '13px',
                      }}
                    >
                      {item?.fullname || item?.fullName || 'Unknown'}
                    </h5>
                  </div>
                ))
              ) : (
                <div className="recent-student-empty">
                  No recent {accountType === AccountType?.TRAINER ? "enthusiasts" : "experts"} found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {accountType === AccountType?.TRAINER && (
        <Modal
          isOpen={isModalOpen}
          allowFullWidth={width600}
          width={width600 ? "95%" : width900 ? "90%" : "85%"}
          element={
            <div className="recent-student-modal-content">
              <div className="recent-student-modal-header">
                <div
                  className="recent-student-close-btn"
                  onClick={handleCloseModal}
                >
                  <X size={24} color="#333" />
                </div>
              </div>
              <div className="container media-gallery portfolio-section grid-portfolio">
                <div className="theme-title">
                  <StudentDetail
                    videoClips={recentStudentClips}
                    data={selectedStudentData}
                  />
                </div>
              </div>
            </div>
          }
        />
      )}
    </>
  );
};

export default RecentStudent;
