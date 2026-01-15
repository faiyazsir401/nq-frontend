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
  const width600 = useMediaQuery(600);
  const width900 = useMediaQuery(900);

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

  const handleStudentClick = (id) => {
    setRecentStudentClips(null);
    setIsOpen(true);
    getTraineeClipsApi(id);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setRecentStudentClips(null);
  };

  // Get the current list based on account type
  const currentList = accountType === AccountType?.TRAINER ? recentStudent : recentTrainer;
  const headingText = accountType === AccountType?.TRAINER ? "Recent Enthusiasts" : "Recent Experts";

  // Calculate responsive grid columns
  const getGridColumns = () => {
    if (width600) return "repeat(2, 1fr)";
    if (width900) return "repeat(3, 1fr)";
    return "repeat(4, 1fr)";
  };

  // Calculate responsive image size
  const getImageSize = () => {
    if (width600) return { width: "70px", height: "70px" };
    if (width900) return { width: "80px", height: "80px" };
    return { width: "90px", height: "90px" };
  };

  const imageSize = getImageSize();

  return (
    <>
      <div 
        className="Content-Trainer" 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '10px',
          width: '100%'
        }}
      >
        <div 
          className="card rounded trainer-profile-card Select Recent Student" 
          style={{ 
            width: '100%', 
            marginTop: width600 ? '16px' : '32px', 
            boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible'
          }}
        >
          <div className="card-body" style={{ padding: width600 ? '12px 8px' : '20px', display: 'flex', flexDirection: 'column', flex: '1' }}>
            <div style={{ justifyContent: 'center', marginBottom: width600 ? '12px' : '15px', width: '100%' }}>
              <h2 
                className="Recent-Heading" 
                style={{ 
                  textAlign: 'center',
                  fontSize: width600 ? '18px' : '22px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '0',
                  paddingTop: width600 ? '8px' : '0',
                  display: 'block',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {headingText}
              </h2>
            </div>
            
            <div 
              className="image-gallery" 
              style={{ 
                display: 'grid',
                gridTemplateColumns: getGridColumns(),
                gap: width600 ? '12px' : '16px',
                paddingTop: '15px',
                width: '100%',
                justifyContent: 'center',
                overflowY: 'auto',
                maxHeight: width600 ? '60vh' : '75vh',
                padding: width600 ? '10px 5px' : '15px 10px'
              }}
            >
              {currentList && currentList.length > 0 ? (
                currentList.map((item, index) => (
                  <div
                    key={item?._id || item?.id || index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: width600 ? '8px' : '12px',
                      borderRadius: '10px',
                      backgroundColor: '#fafafa',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.3s ease',
                      minHeight: width600 ? '120px' : '140px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                      e.currentTarget.style.borderColor = '#000080';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fafafa';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#f0f0f0';
                    }}
                    onClick={() => {
                      if (accountType === AccountType?.TRAINER) {
                        handleStudentClick(item?._id || item?.id);
                        setSelectedStudentData({ ...item });
                      }
                    }}
                  >
                    <div
                      style={{
                        width: imageSize.width,
                        height: imageSize.height,
                        borderRadius: '50%',
                        border: width600 ? '2px solid rgb(0, 0, 128)' : '3px solid rgb(0, 0, 128)',
                        padding: '2px',
                        marginBottom: width600 ? '8px' : '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                        boxSizing: 'border-box',
                        flexShrink: 0
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
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.target.src = "/assets/images/demoUser.png";
                        }}
                      />
                    </div>
                    <h5
                      style={{
                        maxWidth: '100%',
                        marginBottom: '0px',
                        fontSize: width600 ? '11px' : '13px',
                        fontWeight: '500',
                        color: '#333',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        padding: '0 4px',
                        lineHeight: '1.3',
                        textAlign: 'center'
                      }}
                    >
                      {item?.fullname || item?.fullName || 'Unknown'}
                    </h5>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '40px 20px',
                    color: '#999',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}
                >
                  No recent {accountType === AccountType?.TRAINER ? "enthusiasts" : "experts"} found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {accountType === AccountType?.TRAINER && (
        <Modal
          isOpen={isOpen}
          element={
            <div className="container media-gallery portfolio-section grid-portfolio">
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
    </>
  );
};

export default RecentStudent;
