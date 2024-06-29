import { useEffect, useState } from "react";
import { Nav, NavLink, NavItem, TabContent, TabPane, Col, Button } from "reactstrap";
import { Link, X } from "react-feather";
// import "photoswipe/style.css";
import { myClips, reports, traineeClips } from "../../../../containers/rightSidebar/fileSection.api";
// import Modal from "../../app/common/modal";
// import VideoUpload from "../../app/components/videoupload";
// import ReportModal from "../../app/components/video/reportModal";

import PhotoSwipeLightbox from "photoswipe/lightbox";
import { useAppDispatch, useAppSelector } from "../../../store";
import { videouploadAction, videouploadState } from "../../videoupload/videoupload.slice";
import { LOCAL_STORAGE_KEYS } from "../../../common/constants";
import { Tooltip } from "react-tippy";
import { Utils } from "../../../../utils/utils";
import { authState } from "../../auth/auth.slice";
import Modal from "../../../common/modal";

// const fiveImageGallary = [
//     {
//         mainColClass: "isotopeSelector filter",
//         mediaClass: "media-big",
//         src: "/assets/images/gallery/1.jpg",
//         width: 150,
//         height: 150,
//     },
//     {
//         mediaClass: "media-small isotopeSelector filter",
//         src: "/assets/images/gallery/2.jpg",
//         width: 150,
//         height: 150,
//         Children: [
//             {
//                 mediaClass: "media-small isotopeSelector filter",
//                 src: "/assets/images/gallery/3.jpg",
//                 width: 150,
//                 height: 150,
//             },
//         ],
//     },
//     {
//         mediaClass: "media-small isotopeSelector filter",
//         src: "/assets/images/gallery/4.jpg",
//         width: 150,
//         height: 150,
//         Children: [
//             {
//                 mediaClass: "media-small isotopeSelector filter fashion",
//                 src: "/assets/images/gallery/5.jpg",
//                 width: 150,
//                 height: 150,
//             },
//         ],
//     },
// ];
// const eightImageGallary = [
//     {
//         src: "/assets/images/gallery/4.jpg",
//         width: 150,
//         height: 150,
//         mediaClass: "media-small isotopeSelector filter",
//     }, {
//         src: "/assets/images/gallery/4.jpg",
//         width: 150,
//         height: 150,
//         mediaClass: "media-small isotopeSelector filter",
//     }, {
//         src: "/assets/images/gallery/4.jpg",
//         width: 150,
//         height: 150,
//         mediaClass: "media-small isotopeSelector filter",
//     }, {
//         src: "/assets/images/gallery/4.jpg",
//         width: 150,
//         height: 150,
//         mediaClass: "media-small isotopeSelector filter",
//     }, {
//         src: "/assets/images/gallery/4.jpg",
//         width: 150,
//         height: 150,
//         mediaClass: "media-small isotopeSelector filter",
//     },
//     {
//         src: "/assets/images/gallery/3.jpg",
//         width: 150,
//         height: 150,
//         mediaClass: "media-small isotopeSelector filter",
//     },
// ];

// var netquixVideos = [{
//     "_id": "656acd81cd2d7329ed0d8e91",
//     "title": "Dog Activity",
//     "category": "Acting",
//     "user_id": "6533881d1e8775aaa25b3b6e",
//     "createdAt": "2023-12-02T06:24:01.995Z",
//     "updatedAt": "2023-12-02T06:24:01.995Z",
//     "__v": 0
// },
// {
//     "_id": "657053c4c440a4d0d775e639",
//     "title": "Pupppy clip",
//     "category": "Golf",
//     "user_id": "64ad7aae6d668be38e53be1b",
//     "createdAt": "2023-12-06T10:58:12.080Z",
//     "updatedAt": "2023-12-06T10:58:12.080Z",
//     "__v": 0
// }]


const StudentClips = ({ activeCenterContainerTab }) => {
    // const dispatch = useAppDispatch();

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
    // const [collapse1, setCollapse1] = useState(false);
    // const [collapse2, setCollapse2] = useState(false);
    // const [collapse3, setCollapse3] = useState(false);
    // const [collapse4, setCollapse4] = useState(false);
    const [isOpenPlayVideo, setIsOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState("");
    // const [traineeClip, setTraineeClips] = useState([]);
    // const [accountType, setAccountType] = useState("");
    const [reportsData, setReportsData] = useState([]);
    // const [isOpenPDF, setIsOpenPDF] = useState(false);
    // const [reportName, setReportName] = useState("");
    // const [isOpenReport, setIsOpenReport] = useState(false);
    const { sidebarLockerActiveTab, accountType } = useAppSelector(authState);
    // const [currentReportData, setCurrentReportData] = useState({})



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
            setVideoDimensions({ width: "470px", height: "587px" });
        }
    };

    useEffect(() => {
        if (!isOpen) getMyClips()
    }, [isOpen, activeCenterContainerTab])

    // useEffect(() => {
    //     setAccountType(localStorage.getItem(LOCAL_STORAGE_KEYS.ACC_TYPE));
    // }, []);

    const getMyClips = async () => {
        setClips([])
        // setTraineeClips([])
        var res = await myClips({})
        let temp = res?.data
        temp = temp?.map((clp) => { return { ...clp, show: true } })
        setClips([...temp])
        // var res2 = await traineeClips({})
        // setTraineeClips(res2?.data)
        // var res3 = await reports({})
        // setReportsData(res3?.result || [])
    }
    return (
        <>
            <div className="media-gallery portfolio-section grid-portfolio">
                {clips?.length ? clips?.map((cl, ind) =>
                    <div className={`collapse-block ${!cl?.show ? "" : "open"}`}>
                        <h5
                            className="block-title"
                            onClick={() => {
                                // var temp = clips
                                // temp = temp.map(vl => { return { ...vl, show: false } })
                                // temp[ind].show = true
                                // setClips([...temp])
                            }}
                        >
                            {cl?._id}
                            <label className="badge badge-primary sm ml-2">{cl?.clips?.length}</label>
                        </h5>
                        {/*  NORMAL  STRUCTURE END  */}
                        <div className={`block-content ${!cl?.show ? "d-none" : ""}`}>
                            <div className="row">
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
                                            <video id="Home-page-vid" style={{ width: "184px", height: "100px" }}  >
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

            <Modal
                isOpen={isOpenPlayVideo}
                allowFullWidth={true}
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
        </>
    )
}

export default StudentClips;