import { useEffect, useState } from "react";
import { Link, X } from "react-feather";
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
import "../../trainer/dashboard/index.css";
import { commonState, getClipsAsync, getMyClipsAsync } from "../../../common/common.slice";
import { masterState } from "../../master/master.slice";
import { MY_CLIPS_LABEL_LIMIT } from "../../../../utils/constant";
import { AccountType } from "../../../common/constants";

const MyClips = ({ activeCenterContainerTab, trainee_id }) => {
  const dispatch = useAppDispatch();

  const { isOpen } = useAppSelector(videouploadState);
  const { clips } = useAppSelector(commonState);
  const { myClips } = useAppSelector(commonState);

  const [activeTab, setActiveTab] = useState("media");
  const [sortedClips, setSortedClips] = useState([]);
  const [isOpenPlayVideo, setIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");
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
  //  const { userInfo } = useAppSelector(authState);

  // console.log("allClips ========>*", allClips)
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
        console.log("sortedClips",sortedClips)
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
        console.log("sortedClips",sortedClips)
        setSortedClips(sortedClips);
      }
    }
    
  }, [clips,trainee_id,myClips]);

  return (
    <>
      <div className="media-gallery portfolio-section grid-portfolio">
        {(trainee_id?clips?.length:myClips.length) ? (
          sortedClips?.map((cl, ind) => (
            <div className={`collapse-block ${!cl?.show ? "" : "open"}`}>
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
                                setSelectedVideo(Utils?.generateVideoURL(clp));
                                setIsOpen(true);
                              }}
                            >
                              <source src={Utils?.generateVideoURL(clp)} />
                            </video>
                            {clp.user_id === userInfo._id &&
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
                                setSelectedVideo(Utils?.generateVideoURL(clp));
                                setIsOpen(true);
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
        // allowFullWidth={true}
        element={
          <>
            <div className="d-flex flex-column align-items-center p-3 justify-content-center h-100">
              <div style={{ borderRadius: 5 }}>
                <div className="media-body media-body text-right">
                  <div
                    className="icon-btn btn-sm btn-outline-light close-apps pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    <X />
                  </div>
                </div>
                <video
                  style={videoDimensions}
                  autoPlay
                  controls
                  onLoadedData={handleVideoLoad}
                >
                  <source src={selectedVideo} type="video/mp4" />
                </video>
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
