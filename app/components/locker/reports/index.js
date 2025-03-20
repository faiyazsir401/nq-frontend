import { useEffect, useState } from "react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import { useAppDispatch, useAppSelector } from "../../../../app/store";
import { videouploadAction, videouploadState } from "../../../../app/components/videoupload/videoupload.slice";
import { authAction, authState } from "../../../../app/components/auth/auth.slice";
import { deleteReports, deleteSavedSession, myClips, reports, traineeClips } from "../../../../containers/rightSidebar/fileSection.api";
import { AccountType, LOCAL_STORAGE_KEYS } from "../../../common/constants";
import Modal from "../../../common/modal";
import ReportModal from "../../../../app/components/video/reportModal";
import { X } from "react-feather";
import { Utils } from "../../../../utils/utils";
import { awsS3Url } from "../../../../utils/constant";
import { getAllSavedSessions } from "../../videoupload/videoupload.api";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { Tooltip } from "react-tippy";
import { FaDownload, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import '../../trainer/dashboard/index.css';
import ConfirmModal from "../my-clips/confirmModal";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const Reports = ({ activeCenterContainerTab, trainee_id }) => {
  const dispatch = useAppDispatch();

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
  const { isOpen } = useAppSelector(videouploadState);
  const [activeTab, setActiveTab] = useState("media");
  const [reportsData, setReportsData] = useState([]);
  const [isOpenPDF, setIsOpenPDF] = useState(false);
  const [reportName, setReportName] = useState("");
  const [isOpenReport, setIsOpenReport] = useState(false);
  const { sidebarLockerActiveTab, accountType } = useAppSelector(authState);
  const [currentReportData, setCurrentReportData] = useState({})

  const [isOpenPlayVideo, setIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [videoDimensions, setVideoDimensions] = useState({ width: "470px", height: "587px" });
  const [reportObj, setReportObj] = useState({ title: "", topic: "" });
  const [screenShots, setScreenShots] = useState([]);
  const [isConfirmModalOpen , setIsConfirmModalOpen] = useState(false)
  const [selectedReportId , setSelectedReportId] = useState(null);
  const [selectedRecordingId , setselectedRecordingId] = useState(null);
  useEffect(() => {
    setActiveTab(sidebarLockerActiveTab)
    if (sidebarLockerActiveTab === "report") {
      var temp = reportsData
      temp = temp.map((vl, i) => { return i === 0 ? { ...vl, show: true } : { ...vl, show: false } })
      setReportsData([...temp])
    }
  }, [sidebarLockerActiveTab])

  const handleVideoLoad = (event) => {
    const video = event.target;
    const aspectRatio = video.videoWidth / video.videoHeight;

    // Set width and height based on aspect ratio
    if (aspectRatio > 1) {
      setVideoDimensions({ width: "100%", height: "70%" });
    } else {
      setVideoDimensions({ width: "470px", height: "587px" });
    }
  };

  useEffect(() => {
    if (!isOpen && activeCenterContainerTab === 'gamePlans') getMyClips()
  }, [isOpen, activeCenterContainerTab])

  function extractDateParts(dateString) {
    const date = new Date(dateString);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  const getMyClips = async () => {
    var res3
    if (trainee_id) {
      res3 = await reports({ trainee_id })
    } else {
      res3 = await reports({})
    }
    const savedSessions = await getAllSavedSessions()
    const organizedData = savedSessions.data.reduce((acc, obj) => {
      const createdAtDate = extractDateParts(obj.createdAt);
      const key = `${createdAtDate.year}-${createdAtDate.month}-${createdAtDate.day}`;

      if (!acc[key]) {
        acc[key] = {
          _id: {
            year: createdAtDate.year,
            month: createdAtDate.month,
            day: createdAtDate.day
          },
          report: [],
          date: new Date(obj.createdAt)
        };
      }

      acc[key].report.push(obj);

      return acc;
    }, {});

    const result = Object.values(organizedData).map(item => ({
      ...item,
      show: true,
    }));

    var temp = res3?.result

    temp = temp.map(vl => {
      return { ...vl, show: true, date: vl?.report?.length ? new Date(vl?.report[0]?.createdAt) : new Date() }
    });

    // setReportsData([...result, ...temp])

    const groupedReports = {};

    [...result, ...temp]?.forEach((item) => {
      const { _id, report, ...rest } = item;

      const idString = JSON.stringify(_id);

      if (groupedReports[idString]) {

        groupedReports[idString].report.push(...report);
      } else {

        groupedReports[idString] = { _id, report, ...rest };
      }
    });

    const mergedData = Object.values(groupedReports);

    setReportsData(mergedData?.sort((a, b) => new Date(b.date) - new Date(a.date)))

  }
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate() < 10 ? date.getDate() : `0${date.getDate()}`;
    const month = (date.getMonth() + 1) < 10 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
    const formattedDate = `${day}/${month}/${date.getFullYear()}`;
    return formattedDate;
  }

  const handleSessionDelete = async (id) => {
    const res = await deleteSavedSession({id});
    if(res?.success){
      await getMyClips();
      toast.success(res?.message);
      setIsConfirmModalOpen(false);
      setselectedRecordingId(null);
    (null);
    }else{
      toast.error(res?.message);
    }
  };
  const handleReportDelete = async (id) => {
    const res = await deleteReports({id});
    if(res?.result?.code === 200){
    await getMyClips();
    toast.success(res?.result?.msg);
    setIsConfirmModalOpen(false);
    setSelectedReportId(null);
    }else{
      toast.error(res?.result?.msg);
    }
  };

  const handleCloseModal = () =>{
    setIsConfirmModalOpen(false)
    setSelectedReportId(null)
    setselectedRecordingId(null)
  }
  console.log("reportsData",reportsData)
  return (
    <>
      {/* <ToastContainer /> */}
    <div className="media-gallery portfolio-section grid-portfolio">
      {reportsData?.length ? reportsData?.map((cl, ind) =>
        <div className={`collapse-block ${!cl?.show ? "" : "open"}`} key={ind}>
          <h5
            className="block-title"
            onClick={() => {
              // Toggle visibility of block
            }}
          >
            <label className="badge badge-primary sm ml-2">{`${cl?._id?.month}/${cl?._id?.day}/${cl?._id?.year}`}</label>
          </h5>
          <div className={`block-content ${!cl?.show ? "d-none" : "d-flex flex-wrap"}`}>
            {/* Render videos with session data */}
            {cl?.report.map((clp, index) => {
              // return  !clp.reportData ?
              return clp.hasOwnProperty("reportData") ?
                <div className={`col-6 col-sm-4`} key={index} style={{ whiteSpace: "nowrap" }}>
                  {/* Render video */}
                  <div className="text-wrap">
                    <div style={{ textAlign: "center" }}>
                      <dd>GAME PLAN with 
                        <div>
                        <strong>{clp?.[accountType === AccountType?.TRAINER ? "trainee" : "trainer"]?.fullname}</strong>
                        </div>
                        </dd>
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <dd
                        className="video-container2"
                        style={{ cursor: "pointer", textAlign: "center" }}
                        onClick={() => {
                          if (accountType === "Trainer") {
                            setCurrentReportData({ session: clp?.session?._id, trainer: clp?.trainer?._id, trainee: clp?.trainee?._id })
                            setIsOpenReport(true)
                          } else {
                            setIsOpenPDF(true)
                            setReportName(clp?.session?.report)
                          }
                        }}
                      >
                        {
                          clp?.reportData?.length ?
                          <> 
                          <img
                              src={Utils.getImageUrlOfS3(clp?.reportData[0]?.imageUrl)}
                              alt={clp?.reportData[0]?.title}
                              style={{ 
                                width: "100%",
                                 height: "150px",
                                  position: "relative",
                                   objectFit: "contain",
                                  minWidth: "110px",
                                 }}
                            />
                            <div
                            className="download-delete"
                            style={{
                              position: "absolute",
                              top: "23.5%" ,
                              right:"7.5% ",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              backgroundColor: "#333",
                              color: "#fff",
                              padding: "8px",
                              fontSize : "16px",
                              zIndex : '8'
                            }}
                          >
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                // handleReportDelete(clp?._id);
                                setIsConfirmModalOpen(true);
                                setSelectedReportId(clp?._id);
                              }}
                              style={{
                                margin : '3px auto',
                                cursor : 'pointer'

                              }}
                            >
                              <FaTrash />
                            </div>
                            <div
                            style={{
                                margin : '3px auto'
                              }}
                            >
                              <a
                                href={awsS3Url+clp?.session?.report} // Assuming this generates a URL for the PDF file
                                download="file.pdf" // This specifies the filename for the downloaded file
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  color : '#fff',
                                  fontSize : '16px'
                                }}
                                target="_blank"
                              >
                                <FaDownload />
                              </a>
                            </div>
                          </div>

                          </>
                             :
                            <img
                              src="/icons/FileSee.png"
                              alt="FileSee Icon"
                              style={{ width: "30px", height: "30px" }}
                            />
                        }
                        {accountType === "Trainer" ? "" : ""}
                      </dd>
                    </div>
                  </div>
                </div>
                :
                <div className={`col-4`} key={index} style={{ whiteSpace: "nowrap" }}>
                  <div
                  // style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                  >
                    <div style={{
                      wordBreak: 'break-all'
                    }}>
                      <dd>SESSION RECORDING with
                        <div style={{ textAlign: "center" }}>
                          <strong>{accountType === "Trainer" ? clp?.trainee_name : clp?.trainer_name} </strong>
                        </div>
                      </dd>
                    </div>

                    <div style={{ marginBottom: "5px" }}>
                      <dd
                        className="ml-3 video-container2"
                        style={{ cursor: "pointer", textAlign: "center" }}
                        onClick={() => {
                          setSelectedVideo(Utils?.generateVideoURL(clp))
                          setIsOpen(true)
                        }}
                      >
                        <video
                          id="Home-page-vid"
                          // width="160px"
                          // height="80px"
                          style={{
                            padding: "2px",
                            position : 'relative',
                            // maxWidth: "250px",
                            aspectRatio:"1/1",
                            // width: "auto",
                            // height: "auto",
                            width: "100%",
                            border: "4px solid #b4bbd1",
                            borderRadius: "5px",
                            objectFit: "cover"
                          }}
                        >
                          <source src={Utils?.generateVideoURL(clp)} type="video/webm" />
                        </video>
                        <div
                            className="download-delete"
                            style={{
                              position: "absolute",
                              top: "23.5%" ,
                              right:"7.5% ",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              backgroundColor: "#333",
                              color: "#fff",
                              padding: "8px",
                              fontSize : "16px",
                              zIndex : '8'
                            }}
                          >
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                // handleSessionDelete(clp?._id);
                                setIsConfirmModalOpen(true);
                                setselectedRecordingId(clp?._id);
                              }}
                              style={{
                                margin : '3px auto',
                                cursor : 'pointer'

                              }}
                            >
                              <FaTrash />
                            </div>
                            <div
                            style={{
                                margin : '3px auto'
                              }}
                            >
                              <a
                                href={Utils?.generateVideoURL(clp)}
                                download={true}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  color : '#fff',
                                  fontSize : '16px'
                                }}
                                target="_self"
                              >
                                <FaDownload />
                              </a>
                            </div>
                          </div>
                      </dd>
                    </div>

                  </div>
                </div>
            })}
          </div>
        </div>
      ) :
        <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
          <h5 className="block-title">No Data Found</h5>
        </div>}


      <Modal
        isOpen={isOpenPDF}
        element={
          <>
            <div className="container media-gallery portfolio-section grid-portfolio ">
              <div className="theme-title">
                <div className="media">
                  <div className="media-body media-body text-right">
                    <div className="icon-btn btn-sm btn-outline-light close-apps pointer" onClick={() => { setIsOpenPDF(false) }} > <X /> </div>
                  </div>
                </div>
              </div>
              <div className="d-flex flex-column align-items-center">
                <h1 className="p-3">Report</h1>
                <div style={{ height: '100vh' }} className="pdf-viewer">
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer fileUrl={`${awsS3Url}${reportName}`} />
                  </Worker>
                </div>
              </div>
              <div className="justify-content-center">
              </div>
            </div>
          </>
        }
      />

      <Modal
        isOpen={isOpenPlayVideo}
        // allowFullWidth={true}
        element={
          <>
            <div className="d-flex flex-column align-items-center p-3 justify-content-center h-100">
              <div
                style={{ borderRadius: 5 }}
              >
                <div className="media-body media-body text-right">
                  <div
                    className="icon-btn btn-sm btn-outline-light close-apps pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    <X />
                  </div>
                </div>

                {/* <MediaPlayer title="Sprite Fight" style={videoDimensions} src={selectedVideo}>
                  <MediaProvider />
                  <DefaultVideoLayout thumbnails="https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/storyboard.vtt" icons={defaultLayoutIcons} />
                </MediaPlayer> */}
                <video
                  style={videoDimensions}
                  autoPlay
                  controls
                  onLoadedData={handleVideoLoad}
                >
                  <source src={selectedVideo} type="video/webm" />
                </video>
              </div>
            </div>
          </>
        }
      />


      <ReportModal
        currentReportData={currentReportData}
        isOpenReport={isOpenReport}
        setIsOpenReport={setIsOpenReport}
        screenShots={screenShots}
        setScreenShots={setScreenShots}
        reportObj={reportObj}
        setReportObj={setReportObj}
      />
     
    </div>
    {
      isConfirmModalOpen && 
      (
        <ConfirmModal
        isModelOpen={isConfirmModalOpen}
        setIsModelOpen={setIsConfirmModalOpen}
        selectedId = {selectedReportId || selectedRecordingId}
        deleteFunc={selectedReportId ? handleReportDelete : handleSessionDelete}
        closeModal = {handleCloseModal}
       />
      )
    }
    </>
  )
}

export default Reports