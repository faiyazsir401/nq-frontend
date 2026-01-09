import { useEffect, useState } from "react";
import { Nav, NavLink, NavItem, TabContent, TabPane, Col, Button, Row } from "reactstrap";
import { Link, X } from "react-feather";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { videouploadAction, videouploadState } from "../../app/components/videoupload/videoupload.slice";
import { myClips, reports, traineeClips } from "./fileSection.api";
import { LOCAL_STORAGE_KEYS } from "../../app/common/constants";
import Modal from "../../app/common/modal";
import VideoUpload from "../../app/components/videoupload";
import ReportModal from "../../app/components/video/reportModal";

import { Tooltip } from "react-tippy";
import { Utils } from "../../utils/utils";
import { authAction, authState } from "../../app/components/auth/auth.slice";
import { awsS3Url } from "../../utils/constant";
import { useMediaQuery } from "../../app/hook/useMediaQuery";
import { Spinner } from "reactstrap";

const fiveImageGallary = [
  {
    mainColClass: "isotopeSelector filter",
    mediaClass: "media-big",
    src: "/assets/images/gallery/1.jpg",
    width: 150,
    height: 150,
  },
  {
    mediaClass: "media-small isotopeSelector filter",
    src: "/assets/images/gallery/2.jpg",
    width: 150,
    height: 150,
    Children: [
      {
        mediaClass: "media-small isotopeSelector filter",
        src: "/assets/images/gallery/3.jpg",
        width: 150,
        height: 150,
      },
    ],
  },
  {
    mediaClass: "media-small isotopeSelector filter",
    src: "/assets/images/gallery/4.jpg",
    width: 150,
    height: 150,
    Children: [
      {
        mediaClass: "media-small isotopeSelector filter fashion",
        src: "/assets/images/gallery/5.jpg",
        width: 150,
        height: 150,
      },
    ],
  },
];
const eightImageGallary = [
  {
    src: "/assets/images/gallery/4.jpg",
    width: 150,
    height: 150,
    mediaClass: "media-small isotopeSelector filter",
  }, {
    src: "/assets/images/gallery/4.jpg",
    width: 150,
    height: 150,
    mediaClass: "media-small isotopeSelector filter",
  }, {
    src: "/assets/images/gallery/4.jpg",
    width: 150,
    height: 150,
    mediaClass: "media-small isotopeSelector filter",
  }, {
    src: "/assets/images/gallery/4.jpg",
    width: 150,
    height: 150,
    mediaClass: "media-small isotopeSelector filter",
  }, {
    src: "/assets/images/gallery/4.jpg",
    width: 150,
    height: 150,
    mediaClass: "media-small isotopeSelector filter",
  },
  {
    src: "/assets/images/gallery/3.jpg",
    width: 150,
    height: 150,
    mediaClass: "media-small isotopeSelector filter",
  },
];

var netquixVideos = [{
  "_id": "656acd81cd2d7329ed0d8e91",
  "title": "Dog Activity",
  "category": "Acting",
  "user_id": "6533881d1e8775aaa25b3b6e",
  "createdAt": "2023-12-02T06:24:01.995Z",
  "updatedAt": "2023-12-02T06:24:01.995Z",
  "__v": 0
},
{
  "_id": "657053c4c440a4d0d775e639",
  "title": "Pupppy clip",
  "category": "Golf",
  "user_id": "64ad7aae6d668be38e53be1b",
  "createdAt": "2023-12-06T10:58:12.080Z",
  "updatedAt": "2023-12-06T10:58:12.080Z",
  "__v": 0
}]

const FileSection = (props) => {
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
  const [clips, setClips] = useState([]);
  const [collapse1, setCollapse1] = useState(false);
  const [collapse2, setCollapse2] = useState(false);
  const [collapse3, setCollapse3] = useState(false);
  const [collapse4, setCollapse4] = useState(false);
  const [isOpenPlayVideo, setIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [traineeClip, setTraineeClips] = useState([]);
  const [accountType, setAccountType] = useState("");
  const [reportsData, setReportsData] = useState([]);
  const [isOpenPDF, setIsOpenPDF] = useState(false);
  const [reportName, setReportName] = useState("");
  const [isOpenReport, setIsOpenReport] = useState(false);
  const { sidebarLockerActiveTab } = useAppSelector(authState);
  const [currentReportData, setCurrentReportData] = useState({})
  const [reportObj, setReportObj] = useState({ title: "", topic: "" });
  const [screenShots, setScreenShots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const width500 = useMediaQuery(500);

  const [videoDimensions, setVideoDimensions] = useState({ width: "470px", height: "587px" });

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
      setVideoDimensions({ width: width500 ? "320px" : "470px", height: width500 ? "350px" : "587px" });
    }
  };

  useEffect(() => {
    if (!isOpen && props.activeTabParent === 'file') getMyClips()
  }, [props.activeTabParent])

  useEffect(() => {
    setAccountType(localStorage.getItem(LOCAL_STORAGE_KEYS.ACC_TYPE));
  }, []);

  const getMyClips = async () => {
    setIsLoading(true);
    try {
      setClips([])
      setTraineeClips([])
      var res = await myClips({})
      let temp = res?.data
      temp = temp.map(vl => { return { ...vl, show: false } })
      if (temp.length > 0) temp[0].show = true
      setClips([...temp])
      var res2 = await traineeClips({})
      setTraineeClips(res2?.data)
      var res3 = await reports({})
      setReportsData(res3?.result || [])
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { setActiveTab("media") }, [])

  return (
    <div className="apps-content" id="files">
      <div className="theme-title">
        <div className="media">
          <div>
            <h2>Locker</h2>
            {/* <h4>Shared Media</h4> */}
          </div>
          <div className="media-body media-body text-right">
            <div
              className="icon-btn btn-sm btn-outline-light close-apps pointer"
              onClick={() => { dispatch(authAction?.setActiveModalTab(null)); dispatch(authAction?.setActiveLockerTab(null)); props.smallSideBarToggle() }}
            >
              <X />
            </div>
          </div>
        </div>
      </div>
      <Button className="button-effect mb-3" style={{ width: "100%", justifyContent: 'center' }} color="primary" onClick={() => dispatch(videouploadAction.setIsOpen(true))} >
        Upload Clip
      </Button>
      <VideoUpload />
      <div className="theme-tab">
        <Nav tabs>
          <div className="row mb-2" style={{ width: '100%', alignItems: 'center', margin: "0px" }}>
            <div className="col" style={{ padding: "0px", marginTop: "10px" }}>
              <NavItem className="ml-5px">
                <NavLink
                  className={`button-effect ${activeTab === "media" ? "active" : ""
                    }`}
                  onClick={() => setActiveTab("media")}
                  style={{ width: '100%' }}
                >
                  My Clips
                </NavLink>
              </NavItem>
            </div>
            <div className="col text-right" style={{ padding: "0px", marginTop: "10px" }}>

              <NavItem className="ml-5px">
                <NavLink
                  className={`button-effect ${activeTab === "report" ? "active" : ""}`}
                  onClick={() => setActiveTab("report")}
                  style={{ width: '100%' }}
                >
                  Reports
                </NavLink>
              </NavItem>
            </div>
          </div>
          <div className="row" style={{ width: '100%', alignItems: 'center', margin: "0px" }}>
            <div className="col" style={{ padding: "0px", marginTop: "10px" }}>
              {accountType === "Trainer" && <NavItem className="ml-5px">
                <NavLink
                  className={`button-effect ${activeTab === "trainee" ? "active" : ""
                    }`}
                  onClick={() => setActiveTab("trainee")}
                  style={{ width: '100%' }}
                >
                  Enthusiast
                </NavLink>
              </NavItem>}
            </div>
            <div className="col text-right" style={{ padding: "0px", marginTop: "10px" }}>

              {accountType === "Trainer" && <NavItem className="ml-5px">
                <NavLink
                  className={`button-effect ${activeTab === "docs" ? "active" : ""
                    }`}
                  onClick={() => setActiveTab("docs")}
                  style={{ width: '100%' }}
                >
                  NetQwix
                </NavLink>
              </NavItem>}
            </div>
          </div>
        </Nav>
      </div>
      <div className="file-tab">
        <TabContent activeTab={activeTab} className="custom-scroll">
          <TabPane tabId="media">
            {isLoading ? (
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                minHeight: "240px",
                gap: "12px"
              }}>
                <Spinner color="primary" style={{ width: "2.5rem", height: "2.5rem" }} />
                <h5 style={{ color: "#666", margin: 0, fontSize: "14px" }}>
                  Loading your clips...
                </h5>
              </div>
            ) : (
            <div className="media-gallery portfolio-section grid-portfolio">
              {clips?.length ? clips?.map((cl, ind) =>
                <div className={`collapse-block ${!cl?.show ? "" : "open"}`}>
                  <h5
                    className="block-title"
                    onClick={() => {
                      // Toggle only the clicked section and keep others as they are,
                      // so multiple sections can be open or closed independently.
                      const updatedClips = clips.map((vl, i) =>
                        i === ind ? { ...vl, show: !vl.show } : vl
                      );
                      setClips(updatedClips);
                    }}
                  >
                    {cl?._id}
                    <label className="badge badge-primary sm ml-2">{cl?.clips?.length}</label>
                  </h5>
                  {/*  NORMAL  STRUCTURE END  */}
                  <div className={`block-content ${!cl?.show ? "d-none" : ""}`}>
                    <div className="row m-0 justify-content-center">
                      {cl?.clips.map((clp, index) => (
                        <div
                          key={index}
                          className={`col-4 p-1`}
                          style={{ borderRadius: 5 }}
                          onClick={() => {
                            setSelectedVideo(Utils?.generateVideoURL(clp))
                            setIsOpen(true)
                          }}
                        >
                          <Tooltip title={clp?.title} position="top" trigger="mouseenter">
                            <video className="Sidebar-video"
                              poster={Utils?.generateThumbnailURL(clp)}
                              style={{
                                position: "relative",
                              
                                width: "100%",
                                border: "4px solid #b4bbd1",
                                borderRadius: "5px",
                                objectFit: "cover",
                                aspectRatio:"1/1"
                              }}  >
                              <source src={Utils?.generateVideoURL(clp)} type="video/mp4" />
                            </video>
                          </Tooltip>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : <>
                <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
                  <h5 className="block-title">  No Data Found</h5>
                </div>
              </>}
            </div>
            )}
          </TabPane>
          <TabPane tabId="trainee">
            <div className="media-gallery portfolio-section grid-portfolio">
              {traineeClip?.length ? traineeClip?.map((cl, ind) =>
                <div className={`collapse-block ${!cl?.show ? "" : "open"}`}>
                  <h5
                    className="block-title"
                    onClick={() => {
                      // Toggle only the clicked trainee section; allow multiple open.
                      const updatedTraineeClips = traineeClip.map((vl, i) =>
                        i === ind ? { ...vl, show: !vl.show } : vl
                      );
                      setTraineeClips(updatedTraineeClips);
                    }}
                  >
                    {cl?._id?.fullname}
                    <label className="badge badge-primary sm ml-2">{cl?.clips?.length}</label>
                  </h5>
                  {/*  NORMAL  STRUCTURE END  */}
                  <div className={`block-content ${!cl?.show ? "d-none" : ""}`}>
                    <div className="row m-0 justify-content-center">
                      {cl?.clips.map((clp, index) => (
                        <div
                          key={index}
                          className={`col-4 p-1`}
                          style={{ borderRadius: 5 }}
                          onClick={() => {
                            setSelectedVideo(Utils?.generateVideoURL(clp?.clips))
                            setIsOpen(true)
                          }}
                        >
                          <Tooltip title={clp?.clips?.title} position="top" trigger="mouseenter">
                            <video poster={Utils?.generateThumbnailURL(clp?.clips)} style={{
                              position: "relative",
                            
                              width: "100%",
                              border: "4px solid #b4bbd1",
                              borderRadius: "5px",
                              objectFit: "cover",
                                aspectRatio:"1/1"
                            }}  >
                              <source src={Utils?.generateVideoURL(clp?.clips)} type="video/mp4" />
                            </video>
                          </Tooltip>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
                <h5 className="block-title">  No Data Found</h5>
              </div>}
            </div>
          </TabPane>
          <TabPane tabId="link">
            <div className="media-gallery portfolio-section grid-portfolio">
              <div className={`collapse-block ${collapse1 ? "" : "open"}`}>
                <h5
                  className="block-title"
                  onClick={() => setCollapse1(!collapse1)}
                >
                  12/12/2019
                  <label className="badge badge-primary sm ml-2">8</label>
                </h5>
                <div className={`block-content ${collapse1 ? "d-none" : ""}`}>
                  <div className="row share-media zoom-gallery">
                    <div className="pswp-gallery row mx-0" id="my-test-gallery">
                      {fiveImageGallary.map((image, index) => (
                        <div
                          key={index}
                          className={`col-4 ${image.mainColClass ? image.mainColClass : ""
                            }`}
                        >
                          <div className={image.mediaClass}>
                            <div className="overlay">
                              <div className="border-portfolio">
                                <a
                                  href={image.src}
                                  data-pswp-width={image.width}
                                  data-pswp-height={image.height}
                                  rel="noreferrer"
                                >
                                  <div className="overlay-background">
                                    <i
                                      className="ti-plus"
                                      aria-hidden="true"
                                    ></i>
                                  </div>
                                  <img
                                    src={image.src}
                                    className="img-fluid"
                                    alt=""
                                  />
                                </a>
                              </div>
                            </div>
                          </div>
                          {image.Children &&
                            image.Children.map((data, index) => (
                              <div key={index} className={data.mediaClass}>
                                <div className="overlay">
                                  <div className="border-portfolio">
                                    <div
                                      className="pswp-gallery"
                                      id="my-test-gallery"
                                    >
                                      <a
                                        href={data.src}
                                        data-pswp-width={data.width}
                                        data-pswp-height={data.height}
                                        rel="noreferrer"
                                      >
                                        <div className="overlay-background">
                                          <i
                                            className="ti-plus"
                                            aria-hidden="true"
                                          ></i>
                                        </div>
                                        <img src={data.src} alt="" />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <h5
                  className="block-title"
                  onClick={() => setCollapse2(!collapse2)}
                >
                  10/01/2020
                  <label className="badge badge-primary sm ml-2">5</label>
                </h5>
                <div className={`block-content ${collapse2 ? "d-none" : ""}`}>
                  <div className="row share-media zoom-gallery">
                    <div className="pswp-gallery row mx-0" id="my-gallery">
                      {fiveImageGallary.map((image, index) => (
                        <div
                          key={index}
                          className={`col-4 ${image.mainColClass && image.mainColClass
                            }`}
                        >
                          <div className={image.mediaClass}>
                            <div className="overlay">
                              <div className="border-portfolio">
                                <a
                                  href={image.src}
                                  data-pswp-width={image.width}
                                  data-pswp-height={image.height}
                                  rel="noreferrer"
                                >
                                  <div className="overlay-background">
                                    <i
                                      className="ti-plus"
                                      aria-hidden="true"
                                    ></i>
                                  </div>
                                  <img src={image.src} alt="" />
                                </a>
                              </div>
                            </div>
                          </div>
                          {image.Children &&
                            image.Children.map((data, index2) => (
                              <div key={index2} className={data.mediaClass}>
                                <div className="overlay">
                                  <div className="border-portfolio">
                                    <div
                                      className="pswp-gallery"
                                      id="my-test-gallery"
                                    >
                                      <a
                                        href={data.src}
                                        data-pswp-width={data.width}
                                        data-pswp-height={data.height}
                                        rel="noreferrer"
                                      >
                                        <div className="overlay-background">
                                          <i
                                            className="ti-plus"
                                            aria-hidden="true"
                                          ></i>
                                        </div>
                                        <img src={data.src} alt="" />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/*  Eight  STRUCTURE Start  */}
                <h5
                  className="block-title"
                  onClick={() => setCollapse3(!collapse3)}
                >
                  30/04/2020
                  <label className="badge badge-primary sm ml-2">2</label>
                </h5>
                <div className={`block-content ${collapse3 ? "d-none" : ""}`}>
                  <div className="row share-media zoom-gallery">
                    <div className="pswp-gallery row mx-0" id="gallery8">
                      {eightImageGallary.map((image, index) => (
                        <div
                          key={index}
                          className={`col-4 ${image.mainColClass && image.mainColClass
                            }`}
                        >
                          <div className={image.mediaClass}>
                            <div className="overlay">
                              <div className="border-portfolio">
                                {/* <div
                                className="pswp-gallery"
                                id="my-test-gallery"
                              > */}
                                <a
                                  href={image.src}
                                  data-pswp-width={image.width}
                                  data-pswp-height={image.height}
                                  rel="noreferrer"
                                >
                                  <div className="overlay-background">
                                    <i
                                      className="ti-plus"
                                      aria-hidden="true"
                                    ></i>
                                  </div>
                                  <img src={image.src} alt="" />
                                </a>
                                {/* </div> */}
                              </div>
                            </div>
                          </div>
                          {image.Children &&
                            image.Children.map((data, index2) => (
                              <div key={index2} className={data.mediaClass}>
                                <div className="overlay">
                                  <div className="border-portfolio">
                                    <div
                                      className="pswp-gallery"
                                      id="my-test-gallery"
                                    >
                                      <a
                                        href={data.src}
                                        data-pswp-width={data.width}
                                        data-pswp-height={data.height}
                                        rel="noreferrer"
                                      >
                                        <div className="overlay-background">
                                          <i
                                            className="ti-plus"
                                            aria-hidden="true"
                                          ></i>
                                        </div>
                                        <img src={data.src} alt="" />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/*  Eight  STRUCTURE END  */}
                <h5
                  className="block-title"
                  onClick={() => setCollapse4(!collapse4)}
                >
                  10/01/2020
                  <label className="badge badge-primary sm ml-2">2</label>
                </h5>
                {/*  NORMAL  STRUCTURE END  */}
                <div className={`block-content ${collapse4 ? "d-none" : ""}`}>
                  <div className="row share-media zoom-gallery">
                    <div className="pswp-gallery row mx-0" id="gallery">
                      {eightImageGallary.map((image, index) => (
                        <div
                          key={index}
                          className={`col-4 ${image.mainColClass && image.mainColClass
                            }`}
                        >
                          <div className={image.mediaClass}>
                            <div className="overlay">
                              <div className="border-portfolio">
                                <a
                                  href={image.src}
                                  data-pswp-width={image.width}
                                  data-pswp-height={image.height}
                                  rel="noreferrer"
                                >
                                  <div className="overlay-background">
                                    <i
                                      className="ti-plus"
                                      aria-hidden="true"
                                    ></i>
                                  </div>
                                  <img src={image.src} alt="" />
                                </a>
                              </div>
                            </div>
                          </div>
                          {image.Children &&
                            image.Children.map((data, index2) => (
                              <div key={index2} className={data.mediaClass}>
                                <div className="overlay">
                                  <div className="border-portfolio">
                                    <div
                                      className="pswp-gallery"
                                      id="my-test-gallery"
                                    >
                                      <a
                                        href={data.src}
                                        data-pswp-width={data.width}
                                        data-pswp-height={data.height}
                                        rel="noreferrer"
                                      >
                                        <div className="overlay-background">
                                          <i
                                            className="ti-plus"
                                            aria-hidden="true"
                                          ></i>
                                        </div>
                                        <img src={data.src} alt="" />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPane>
          <TabPane tabId="docs">
            <div className="media-gallery portfolio-section grid-portfolio">
              <div className={`collapse-block ${collapse1 ? "" : "open"}`}>
                <div className={`block-content ${collapse4 ? "d-none" : ""}`}>
                  <div className="row">
                    {netquixVideos.map((clp, index) => (
                      <div
                        key={index}
                        className={`col-6 p-1`}
                        style={{ borderRadius: 5 }}
                        onClick={() => {
                          setSelectedVideo(Utils?.generateVideoURL(clp))
                          setIsOpen(true)
                        }}
                      >
                        <Tooltip title="Title" position="top" trigger="mouseenter">
                          <video style={{ width: "100%", height: "100%" }}  >
                            <source src={Utils?.generateVideoURL(clp)} type="video/mp4" />
                          </video>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabPane>
          <TabPane tabId="report">
            <div className="media-gallery portfolio-section grid-portfolio">
              {reportsData?.length ? reportsData?.map((cl, ind) =>
                <div className={`collapse-block ${!cl?.show ? "" : "open"}`}>
                  <h5
                    className="block-title"
                    onClick={() => {
                      // Toggle only the clicked report section; allow multiple open.
                      const updatedReports = reportsData.map((vl, i) =>
                        i === ind ? { ...vl, show: !vl.show } : vl
                      );
                      setReportsData(updatedReports);
                    }}
                  >
                    <label className="badge badge-primary sm ml-2" onClick={() => {}}>{`${cl?._id?.month}/${cl?._id?.day}/${cl?._id?.year}`}</label>
                  </h5>
                  {/*  NORMAL  STRUCTURE END  */}
                  <div className={`block-content ${!cl?.show ? "d-none" : "d-flex flex-wrap"}`}>
                    {cl?.report.map((clp, index) => (
                      <div className={`col-6`} key={index} style={{ whiteSpace: "nowrap" }}>
                        <div
                          // className="ml-3" 
                          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{ marginBottom: "5px" }}>
                            <dd
                              // className="ml-3"
                              style={{ cursor: "pointer", textAlign: "center" , textWrap:'nowrap' }}
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
                              {/* <img
                                src="/icons/FileSee.png" // Adjust the path to your PNG icon
                                alt="FileSee Icon"
                                style={{ width: "30px", height: "30px" }} // Adjust the size accordingly
                              /> */}
                              <img
                                src={Utils.getImageUrlOfS3(clp?.reportData[0]?.imageUrl)}
                                alt={clp?.reportData[0]?.title}
                                style={{
                                  // width: "12vw",
                                  // height: "100px",
                                  position: "relative",
                                  // marginLeft: '50px',
                                  height: "100%",
                                  width: "100%",
                                  objectFit: "contain",
                                  maxHeight: "120px"
                                }}
                              />
                              {accountType === "Trainer" ? "" : ""}
                            </dd>
                          </div>
                          <div className="ml-3" style={{ fontSize: "10px" }}>
                            <dd>{index + 1}. {accountType === "Trainer" ? "Enthusiast" : "Expert"} : <strong>{clp?.[accountType === "Trainer" ? "trainee" : "trainer"]?.fullname}</strong></dd>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>


                </div>
              ) : <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
                <h5 className="block-title">  No Data Found</h5>
              </div>}
            </div>
          </TabPane>
        </TabContent>
      </div>

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

      <Modal
        isOpen={isOpenPDF}
        allowFullWidth={true}
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
              <div className="d-flex flex-column  align-items-center" style={{ height: "calc(100vh - 81px)" }}>
                <h1 className="p-3">Report</h1>
                <embed src={`${awsS3Url}${reportName}`} width="100%" height="100%" allowfullscreen />
              </div>
              <div className="justify-content-center">
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
  );
};

export default FileSection;
