import { useEffect, useState, useRef } from "react";
import { Link, X, ChevronLeft, ChevronRight } from "react-feather";
import {
  deleteClip,
  myClips,
  reports,
  traineeClips,
} from "../../../../containers/rightSidebar/fileSection.api";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { useAppDispatch, useAppSelector } from "../../../store";
import { videouploadState } from "../../videoupload/videoupload.slice";
import { Tooltip } from "react-tippy";
import { Utils } from "../../../../utils/utils";
import { authState } from "../../auth/auth.slice";
import Modal from "../../../common/modal";
import { FaDownload, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import ConfirmModal from "./confirmModal";
import { useMediaQuery } from "../../../hook/useMediaQuery";
import { Spinner } from "reactstrap";
import "../../trainer/dashboard/index.scss";
import { commonState, getClipsAsync, getMyClipsAsync } from "../../../common/common.slice";
import { masterState } from "../../master/master.slice";
import { MY_CLIPS_LABEL_LIMIT } from "../../../../utils/constant";
import { AccountType } from "../../../common/constants";

const MyClips = ({ activeCenterContainerTab, trainee_id }) => {
  const dispatch = useAppDispatch();

  const { isOpen } = useAppSelector(videouploadState);
  const { clips, myClips, status } = useAppSelector(commonState);

  const [activeTab, setActiveTab] = useState("media");
  const [sortedClips, setSortedClips] = useState([]);
  const [isOpenPlayVideo, setIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [selectedClip, setSelectedClip] = useState(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(null);
  const [currentClipIndex, setCurrentClipIndex] = useState(null);
  const [reportsData, setReportsData] = useState([]);
  const { sidebarLockerActiveTab, accountType,userInfo } = useAppSelector(authState);
  const { masterData } = useAppSelector(masterState).master;
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const width500 = useMediaQuery(500);
  const [videoDimensions, setVideoDimensions] = useState({
    maxWidth: "470px",
    height: "587px",
  });
  const isMobileScreen= useMediaQuery(600)
  const closeButtonRef = useRef(null);
  //  const { userInfo } = useAppSelector(authState);

  //  
  useEffect(() => {
    let lightbox = new PhotoSwipeLightbox({
      gallery: "#" + "my-test-gallery",
      children: "a",
      pswpModule: () => import("photoswipe"),
    });
    lightbox.init();

    let lightbox2 = new PhotoSwipeLightbox({
      gallery: "#" + "my-gallery",
      children: "a",
      pswpModule: () => import("photoswipe"),
    });
    lightbox2.init();

    let lightbox3 = new PhotoSwipeLightbox({
      gallery: "#" + "gallery8",
      children: "a",
      pswpModule: () => import("photoswipe"),
    });
    lightbox3.init();
    let lightbox4 = new PhotoSwipeLightbox({
      gallery: "#" + "gallery",
      children: "a",
      pswpModule: () => import("photoswipe"),
    });
    lightbox4.init();

    return () => {
      lightbox.destroy();
      lightbox = null;
      lightbox2.destroy();
      lightbox2 = null;
      lightbox3.destroy();
      lightbox3 = null;
      lightbox4.destroy();
      lightbox4 = null;
    };
  }, []);

  useEffect(() => {
    setActiveTab(sidebarLockerActiveTab);
    if (sidebarLockerActiveTab === "report") {
      var temp = reportsData;
      temp = temp.map((vl, i) => {
        return i === 0 ? { ...vl, show: true } : { ...vl, show: false };
      });
      setReportsData([...temp]);
    }
  }, [sidebarLockerActiveTab]);

  useEffect(() => {
    if (!isOpen && activeCenterContainerTab === "myClips") getMyClips();
  }, [isOpen, activeCenterContainerTab]);

  // Ensure focus stays inside modal when it opens
  useEffect(() => {
    if (isOpenPlayVideo && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpenPlayVideo]);

  // Keyboard navigation for video slider (Esc / ← / →)
  useEffect(() => {
    if (!isOpenPlayVideo) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNextClip();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePreviousClip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpenPlayVideo, sortedClips, currentGroupIndex, currentClipIndex]);

  const handleVideoLoad = (event) => {
    const video = event.target;
    const aspectRatio = video.videoWidth / video.videoHeight;

    // Set width and height based on aspect ratio
    if (aspectRatio > 1) {
      setVideoDimensions({ width: "100%", height: "70%" });
    } else {
      setVideoDimensions({
        maxWidth: width500 ? "320px" : "470px",
        height: width500 ? "350px" : "587px",
      });
    }
  };

  const getMyClips = async () => {
    if (trainee_id) {
      dispatch(getClipsAsync({ trainee_id }));
    } else {
      dispatch(getMyClipsAsync());
    }
  };

  const handleDelete = async (id) => {
    const res = await deleteClip({ id });
    if (res?.success) {
      toast.success(res?.message);
      setIsConfirmModalOpen(false);
      setSelectedId(null);
      await getMyClips();
    } else {
      toast.error(res?.message);
    }
  };

  const handleCloseModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedId(null);
  };

  const openClipInModal = (groupIdx, clipIdx, clip) => {
    setCurrentGroupIndex(groupIdx);
    setCurrentClipIndex(clipIdx);
    setSelectedVideo(Utils?.generateVideoURL(clip));
    setSelectedClip(clip);
    setIsOpen(true);
  };

  const findNextClipPosition = () => {
    if (currentGroupIndex === null || currentClipIndex === null) return null;

    let g = currentGroupIndex;
    let c = currentClipIndex + 1;

    while (g < sortedClips.length) {
      const group = sortedClips[g];
      const clipsInGroup = group?.clips || [];
      if (c < clipsInGroup.length) {
        return { groupIndex: g, clipIndex: c, clip: clipsInGroup[c] };
      }
      g += 1;
      c = 0;
    }
    return null;
  };

  const findPreviousClipPosition = () => {
    if (currentGroupIndex === null || currentClipIndex === null) return null;

    let g = currentGroupIndex;
    let c = currentClipIndex - 1;

    while (g >= 0) {
      const group = sortedClips[g];
      const clipsInGroup = group?.clips || [];
      if (c >= 0 && c < clipsInGroup.length) {
        return { groupIndex: g, clipIndex: c, clip: clipsInGroup[c] };
      }
      g -= 1;
      if (g >= 0) {
        const prevGroup = sortedClips[g];
        const prevClips = prevGroup?.clips || [];
        c = prevClips.length - 1;
      }
    }
    return null;
  };

  const handleNextClip = () => {
    const next = findNextClipPosition();
    if (!next) return;
    setCurrentGroupIndex(next.groupIndex);
    setCurrentClipIndex(next.clipIndex);
    setSelectedVideo(Utils?.generateVideoURL(next.clip));
    setSelectedClip(next.clip);
  };

  const handlePreviousClip = () => {
    const prev = findPreviousClipPosition();
    if (!prev) return;
    setCurrentGroupIndex(prev.groupIndex);
    setCurrentClipIndex(prev.clipIndex);
    setSelectedVideo(Utils?.generateVideoURL(prev.clip));
    setSelectedClip(prev.clip);
  };

  useEffect(() => {
    if(trainee_id){
      if (clips?.length && masterData?.category?.length) {
        //NOTE -  Function to sort clips based on the desired order
        const desiredOrder = masterData?.category?.map((data) => data);
  
        const sortClips = (clips) => {
          const clipsCopy = clips.slice();
          return clipsCopy.sort((a, b) => {
            return desiredOrder.indexOf(a._id) - desiredOrder.indexOf(b._id);
          });
        };
        //NOTE -  call the SortClips funtion 
        const sortedClips = sortClips(clips);
         
        setSortedClips(sortedClips);
      }
    }else{
      if (myClips?.length && masterData?.category?.length) {
        //NOTE -  Function to sort myClips based on the desired order
        const desiredOrder = masterData?.category?.map((data) => data);
  
        const sortClips = (myClips) => {
          const clipsCopy = myClips.slice();
          return clipsCopy.sort((a, b) => {
            return desiredOrder.indexOf(a._id) - desiredOrder.indexOf(b._id);
          });
        };
        //NOTE -  call the SortClips funtion 
        const sortedClips = sortClips(myClips);
         
        setSortedClips(sortedClips);
      }
    }
    
  }, [clips,trainee_id,myClips]);

  return (
    <>
      <div className="media-gallery portfolio-section grid-portfolio">
        <div style={{ marginBottom: "15px", textAlign: "center" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>
            My Clips
          </h2>
          <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
            Browse and manage your uploaded clips.
          </p>
        </div>
        {status === "pending" ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              minHeight: "240px",
              gap: "12px",
            }}
          >
            <Spinner color="primary" style={{ width: "2.5rem", height: "2.5rem" }} />
            <h5 style={{ color: "#666", margin: 0, fontSize: "14px" }}>
              Loading your clips...
            </h5>
          </div>
        ) : (trainee_id ? clips?.length : myClips?.length) ? (
          sortedClips?.map((cl, ind) => (
            <div
              className={`collapse-block ${!cl?.show ? "" : "open"}`}
              key={`clip-${cl?._id ?? ind}`}
            >
     {accountType !== AccountType.TRAINER && <h5 className="block-title" onClick={() => { }}>
                {cl?._id}
                <label className="badge badge-primary sm ml-2">
                  {cl?.clips?.length}
                </label>
              </h5>}
              {/*  NORMAL  STRUCTURE END  */}
              <div className={`block-content ${!cl?.show ? "d-none" : ""}`}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    width: width500 ? "100%" : "",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                  }}
                >
                  {cl?.clips?.map((clp, index) => (
                    <div
                      key={index}
                      className={`col-6 col-sm-4 p-1 video-container text-wrap`}
                      style={{
                        borderRadius: 5,
                      }}
                   
                    >
                      <div
                        style={{
                          margin: "auto",
                          textAlign: "center",
                          width:"fit-content"
                        }}
                        className="hover-video"
                      >
                        <h5
                          class="d-block text-truncate"
                          style={{
                            textAlign: "center",
                            paddingBottom: "4px",
                            paddingTop: "2px",
                          }}
                        >
                          {clp?.title.length > MY_CLIPS_LABEL_LIMIT ? `${clp.title.slice(0, MY_CLIPS_LABEL_LIMIT)}...` : clp.title}
                        </h5>
                        <Tooltip
                          title={clp?.title}
                          position="bottom"
                          trigger="mouseenter"
                        >
                          <div style={{position:"relative"}}>
                            <video
                              id="Home-page-vid"
                              poster={Utils?.generateThumbnailURL(clp)}
                              style={{
                                position: "relative",
                                aspectRatio:"1/1",
                                width: "100% !important",
                                border: "4px solid #b4bbd1",
                                borderRadius: "5px",
                                objectFit: "cover",
                              }}
                              onClick={() => {
                                openClipInModal(ind, index, clp);
                              }}
                            >
                              <source src={Utils?.generateVideoURL(clp)} />
                            </video>
                            {clp.user_id === userInfo?._id &&
                            <div
                              className="download-delete"
                              style={{
                                position: "absolute",
                                top: "4px",
                                right: "4px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                backgroundColor: "#333",
                                color: "#fff",
                                
                                fontSize: "16px",
                                zIndex: "8",
                              }}
                              onClick={() => {
                                openClipInModal(ind, index, clp);
                              }}
                            >
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // handleDelete(clp?._id);
                                  setIsConfirmModalOpen(true);
                                  setSelectedId(clp?._id);
                                }}
                                style={{
                                  padding: isMobileScreen?"5px":"8px",
                                  paddingBottom:isMobileScreen?"0px":"2px",
                                  cursor: "pointer",
                                }}
                              >
                                <FaTrash  size={isMobileScreen?15:17}/>
                              </div>
                              <div
                                style={{
                                  paddingTop:"0px",
                                  cursor: "pointer",
                                }}
                              >
                                <a
                                  href={Utils?.generateVideoURL(clp)}
                                  download={true}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    color: "#fff",
                                    fontSize: "16px",
                                  }}
                                  target="_self"
                                >
                                  <FaDownload size={isMobileScreen?15:17}/>
                                </a>
                              </div>
                            </div>}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "40px",
              }}
            >
              <h5 className="block-title"> No Data Found</h5>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={isOpenPlayVideo}
        element={
          <>
            <div className="d-flex flex-column align-items-center justify-content-center h-100" style={{ padding: "20px" }}>
              <div
                className="position-relative"
                style={{ 
                  borderRadius: 8, 
                  maxWidth: "100%",
                  backgroundColor: "#1a1a1a",
                  padding: "20px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
                }}
              >
                {/* Close button */}
                <div className="media-body text-right" style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10 }}>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    className="icon-btn btn-sm btn-outline-light close-apps pointer"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close video"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.5)",
                      borderRadius: "50%",
                      padding: "8px"
                    }}
                  >
                    <X />
                  </button>
                </div>

                {/* Title at top center */}
                {selectedClip && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "20px",
                      paddingTop: "10px"
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#fff",
                        textAlign: "center",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        maxWidth: "80%",
                      }}
                    >
                      {selectedClip.title}
                    </h4>
                  </div>
                )}

                {/* Video with navigation buttons */}
                <div className="d-flex align-items-center justify-content-center" style={{ marginBottom: "20px" }}>
                  {/* Previous button */}
                  <button
                    type="button"
                    className="icon-btn btn-sm btn-outline-light mr-2"
                    onClick={handlePreviousClip}
                    disabled={!findPreviousClipPosition()}
                    aria-label="Previous clip"
                    style={{
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      border: "none",
                      padding: "10px",
                      opacity: !findPreviousClipPosition() ? 0.5 : 1,
                      cursor: !findPreviousClipPosition() ? "not-allowed" : "pointer"
                    }}
                  >
                    <ChevronLeft size={20} color="#fff" />
                  </button>

                  <video
                    key={selectedVideo}
                    style={videoDimensions}
                    autoPlay
                    controls
                    onLoadedData={handleVideoLoad}
                  >
                    <source src={selectedVideo} type="video/mp4" />
                  </video>

                  {/* Next button */}
                  <button
                    type="button"
                    className="icon-btn btn-sm btn-outline-light ml-2"
                    onClick={handleNextClip}
                    disabled={!findNextClipPosition()}
                    aria-label="Next clip"
                    style={{
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      border: "none",
                      padding: "10px",
                      opacity: !findNextClipPosition() ? 0.5 : 1,
                      cursor: !findNextClipPosition() ? "not-allowed" : "pointer"
                    }}
                  >
                    <ChevronRight size={20} color="#fff" />
                  </button>
                </div>

                {/* Action buttons at bottom */}
                {selectedClip?.user_id === userInfo?._id && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      paddingTop: "15px",
                      borderTop: "1px solid rgba(255,255,255,0.1)"
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsConfirmModalOpen(true);
                        setSelectedId(selectedClip?._id);
                      }}
                      style={{
                        border: "none",
                        background: "#dc3545",
                        color: "#fff",
                        borderRadius: "6px",
                        padding: "10px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#c82333"}
                      onMouseLeave={(e) => e.target.style.background = "#dc3545"}
                    >
                      <FaTrash size={14} />
                      <span>Delete</span>
                    </button>
                    <a
                      href={Utils?.generateVideoURL(selectedClip)}
                      download={true}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: "#007bff",
                        color: "#fff",
                        borderRadius: "6px",
                        padding: "10px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        textDecoration: "none",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#0056b3"}
                      onMouseLeave={(e) => e.target.style.background = "#007bff"}
                      target="_self"
                    >
                      <FaDownload size={14} />
                      <span>Download</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </>
        }
      />

      {isConfirmModalOpen && (
        <ConfirmModal
          isModelOpen={isConfirmModalOpen}
          setIsModelOpen={setIsConfirmModalOpen}
          selectedId={selectedId}
          deleteFunc={handleDelete}
          closeModal={handleCloseModal}
        />
      )}
    </>
  );
};

export default MyClips;
