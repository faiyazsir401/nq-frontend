import axios from "axios";
import { createReport, cropImage, getReport, removeImage } from "../videoupload/videoupload.api";
import CropImage from "./cropimage";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import Modal from "../../common/modal";
import { Crop, Trash2, X } from "react-feather";
import { Button } from "reactstrap";
import html2canvas from "html2canvas";
import { getS3SignPdfUrl } from "./video.api";
import { useAppSelector, useAppDispatch } from "../../store";
import { authState } from "../auth/auth.slice";
import { values } from "lodash";
import { awsS3Url } from "../../../utils/constant";
import { Utils } from "../../../utils/utils";
import Notes from "../practiceLiveExperience/Notes";
import { SocketContext } from "../socket";
import { EVENTS } from "../../../helpers/events";




const reportModal = ({
  currentReportData,
  isOpenReport,
  setIsOpenReport,
  screenShots,
  setScreenShots,
  reportObj, 
  setReportObj,
  isClose,
  isTraineeJoined,
  isCallEnded,
  gamePlanModalNote,
  setGamePlanModalClose
}) => {

  const [isOpenCrop, setIsOpenCrop] = useState(false);
  const [preview, setPreview] = useState(false);
  const [selectImage, setSelectImage] = useState("")
  const [reportArr, setReportArr] = useState([]);
  // const [reportObj, setReportObj] = useState({ title: "", topic: "" });
  // const [screenShots, setScreenShots] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const { userInfo } = useAppSelector(authState);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [pdfFileCurrent, setPdfFileCurrent] = useState();
  const socket = useContext(SocketContext);

  // const [demoProfilePic, setDemoProfilePic] = useState();
  // const [profilePic, setProfilePic] = useState();

  const demoProfilePic = useRef(null);
  const profilePic = useRef(null);

  const loadImageFromUrl = async (imageUrl) => {
    // console.log("===========>?", imageUrl)
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve) => {
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1];
          resolve(`data:image/jpeg;base64,${base64data}`);
        };
        reader.readAsDataURL(blob);
      });

    } catch (err) {
      console.log("----->err", err)
    }

  };

  // const getImageBase64 = async (url) => await loadImageFromUrl(url);

  const getImageBase64 = useMemo(
    () => async (url) => await loadImageFromUrl(url),
    []
  );

  const setImagebase64 = async () => {
    
    const dpp = await getImageBase64('/assets/images/demoUser.png')
    // setDemoProfilePic(dpp)
    demoProfilePic.current = dpp;

    const pp = await getImageBase64(Utils?.getImageUrlOfS3(userInfo?.profile_picture))
    // setProfilePic(pp);

    profilePic.current = pp;
  }

  useEffect(() => {
    // Set the current date when the component mounts
    updateCurrentDate();

    setImagebase64()
  }, []);

  const resetState = () => {
    setScreenShots([]);
    setReportObj({ title: "", topic: "" })
  }


  const updateCurrentDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // Months are zero-based, so add 1
    const year = today.getFullYear();

    // Format the date as "day/month/year"
    const formattedDate = `${day}/${month}/${year}`;
    setCurrentDate(formattedDate);
  };
  useEffect(() => {
    if (currentReportData?.session && isOpenReport) {
      getReportData()
      setUploadPercentage(0)
    }
  }, [currentReportData?.session, isOpenReport])

  const fetchAndSetScreenShortReport = async (reportData) => {
    var newReportImages = [];
    if (reportData && reportData?.length > 0) {
      for (let index = 0; index < reportData?.length; index++) {
        const element = reportData[index];
        try {
          const response = await fetch(`${awsS3Url}${element?.imageUrl}`);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            newReportImages.push({ ...element, imageUrl: `data:image/jpeg;base64,${base64data}` })
            setReportArr([...newReportImages])
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Error fetching or converting image:', error);
        }
      }
    } else {
      setReportArr([...newReportImages])
    }

  }

  const handleCropImage = async (filename, blob) => {
    var res = await cropImage({ sessions: currentReportData?.session, trainer: currentReportData?.trainer, trainee: currentReportData?.trainee, oldFile: filename })
    if (res?.data?.url) await pushProfilePhotoToS3(res?.data?.url, blob)
    getReportData()
    setIsOpenCrop(false)
  }

  async function pushProfilePhotoToS3(presignedUrl, uploadPhoto) {
    const myHeaders = new Headers({ 'Content-Type': 'image/*' });
    await axios.put(presignedUrl, uploadPhoto, {
      headers: myHeaders,
    })
    return true
  }

  const getReportData = async () => {
    var res = await getReport({
      sessions: currentReportData?.session,
      trainer: currentReportData?.trainer,
      trainee: currentReportData?.trainee,
    })

    console.log(res?.data?.reportData , 'screenshots')
    setScreenShots(res?.data?.reportData)
    setReportObj({ title: res?.data?.title, topic: res?.data?.description })
    fetchAndSetScreenShortReport(res?.data?.reportData)
  }

  const handleRemoveImage = async (filename) => {
    await removeImage({ sessions: currentReportData?.session, trainer: currentReportData?.trainer, trainee: currentReportData?.trainee, filename: filename })
    getReportData()
  }

  var pdf = new jsPDF();

  const generatePDF = async () => {

    setPreview(true);

    const content = document.getElementById("report-pdf");

    content.style.removeProperty("display");

    html2canvas(content).then(async (canvas) => {
      const imgData = canvas.toDataURL('image/png');

      // Calculate the width of the page
      var pageWidth = pdf.internal.pageSize.width;


      // Calculate the aspect ratio of the canvas
      var aspectRatio = canvas.width / canvas.height;

      // Calculate the height to maintain the aspect ratio
      var imgHeight = pageWidth / aspectRatio;


      pdf.internal.pageSize.height = imgHeight;

      updateCurrentDate();

      // Add the canvas as an image to the PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);

      // Get the data URL of the PDF
      const generatedPdfDataUrl = pdf.output('dataurlstring');

      // Convert data URL to Blob
      const byteCharacters = atob(generatedPdfDataUrl.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const pdfBlob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });

      // Create a File from the Blob
      const pdfFile = new File([pdfBlob], 'generated_pdf.pdf', { type: 'application/pdf' });

      // content.style.display = "none";

      var link = await createUploadLink();
      if (link) pushProfilePDFToS3(link, pdfFile);

      // var res = await createReport({
      //   sessions: currentReportData?.session,
      //   trainer: currentReportData?.trainer,
      //   trainee: currentReportData?.trainee,
      //   title: reportObj?.title,
      //   topic: reportObj?.topic,
      //   reportData: [...screenShots],
      // })

    })
  };

  const createUploadLink = async () => {
    var payload = { session_id: currentReportData?.session };
    const data = await getS3SignPdfUrl(payload);
    console.log("=======245====?data", data);
    if (data?.url) return data?.url
    else return ""
  }


  const pushProfilePDFToS3 = async (presignedUrl, uploadPdf) => {
    try {
      const content = document.getElementById("report-pdf");
      content.style.display = "";
      await axios({
        method: 'put', url: presignedUrl, data: uploadPdf, headers: { "Content-Type": 'application/pdf' }, onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadPercentage(progress === 100 ? 0 : progress)
        },
      });
      console.log("pdf pushed in S3")
      // setIsOpenReport(false)
    } catch (e) {
      console.log(e);
    }
  }

  async function createOrUpdateReport() {
    const content = document.getElementById("report-pdf");
    content.style.display = "none";

    // var link = await createUploadLink();
    // if (link) pushProfilePDFToS3(link, pdfFile);

    await createReport({
      sessions: currentReportData?.session,
      trainer: currentReportData?.trainer,
      trainee: currentReportData?.trainee,
      title: reportObj?.title,
      topic: reportObj?.topic,
      reportData: [...screenShots],
    })
  }

  const hidePreview = () => {
    const content = document.getElementById("report-pdf");
    content.style.display = "none";
  }

  const sendNotifications = (data) => {
    socket?.emit(EVENTS.PUSH_NOTIFICATIONS.ON_SEND, data);
  };

  return <>
    <Modal
      isOpen={isOpenReport}
      element={
        <>
          <div id="generate-report" className="container media-gallery portfolio-section grid-portfolio">
            <div className="theme-title  mb-5">
              <div className="media-body media-body text-right" >
                <div
                  className="icon-btn btn-sm btn-outline-light close-apps pointer"
                  onClick={() => {
                    setIsOpenReport(false)
                    setPreview(false);
                    hidePreview()
                    resetState();
                    if(isTraineeJoined && isCallEnded){
                      isClose();
                    }
                  }}
                >
                  <X />
                </div>
              </div>
              <div className="media d-flex flex-column  align-items-center">
                <div>
                  <h2>Report</h2>
                </div>
              </div>
            </div>
            {
              !preview ?
                <div className="theme-tab">
                  <div className="row">
                    <div className="col-md-6 col-sm-12 col-xs-12 p-2" >
                      <div className="form-group">
                        <label className="col-form-label">Title</label>
                        <input
                          className="form-control"
                          type="text"
                          name="title"
                          placeholder="Title"
                          onChange={(e) => {
                            reportObj.title = e.target.value;
                            setReportObj({ ...reportObj })
                          }}
                          value={reportObj?.title}
                        />
                      </div>
                    </div>

                    <div className="col-md-6 col-sm-12 col-xs-12 p-2" >
                      <div className="form-group">
                        <label className="col-form-label">Description</label>
                        <input
                          className="form-control"
                          type="text"
                          name="topic"
                          placeholder="Topic"
                          onChange={(e) => {
                            reportObj.topic = e.target.value;
                            setReportObj({ ...reportObj })
                          }}
                          value={reportObj?.topic}
                        />
                      </div>
                    </div>
                    {screenShots?.map((sst, i) => {
                      console.log(sst , 'resport sst')
                      console.log('ggg', `${awsS3Url}${sst?.imageUrl}`)
                      return <>
                        <div className="col-md-6 col-sm-12 col-xs-12 p-2" style={{ position: "relative" }}>
                          <img style={{ width: "100%", height: "100%",  maxHeight: "280px", border: "1px solid #ced4da", marginTop: "10px" }}
                            src={`${awsS3Url}${sst?.imageUrl}`}
                            alt="Screen Shot"
                          />
                          <div style={{ position: "absolute", bottom: 0 }} >
                            <div className="icon-btn btn-sm btn-outline-light close-apps pointer" onClick={() => {
                              setSelectImage(sst?.imageUrl)
                              setIsOpenCrop(true)
                            }}>
                              <Crop />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 col-sm-12 col-xs-12 p-2" >
                          <div className="media-body media-body text-right" >
                            <div
                              className="icon-btn btn-sm btn-outline-light close-apps pointer"
                              onClick={() => {
                                handleRemoveImage(sst?.imageUrl)
                                // var temp = screenShots.filter((st, index) => index !== i)
                                // setScreenShots([...temp])
                              }}
                            >
                              <Trash2 />
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="col-form-label">Title</label>
                            <input
                              className="form-control"
                              type="text"
                              name="title"
                              placeholder="Title"
                              onChange={(e) => {
                                screenShots[i].title = e.target.value;
                                setScreenShots([...screenShots])
                              }}
                              value={screenShots[i]?.title}
                            />
                            <label className="col-form-label">Description</label>
                            <textarea
                              rows="4"
                              className="form-control"
                              type="text"
                              name="description"
                              placeholder="Description"
                              onChange={(e) => {
                                screenShots[i].description = e.target.value;
                                setScreenShots([...screenShots])
                              }}
                              value={screenShots[i]?.description}
                            />
                          </div>
                        </div>
                      </>
                    })}
                  </div>
                  <label style={{ color: "black", fontWeight: "500" }} className="col-form-label mt-2" htmlFor="account_type">
                    {uploadPercentage ? <> Uploading... {uploadPercentage}%</> : <></>}
                  </label>
                  <div className="d-flex justify-content-center w-100 p-3">
                    <Button className="mx-3" color="primary" disabled={uploadPercentage}
                      onClick={() => { generatePDF() }}
                    // onClick={() => { getReportData().then((res) => generatePDF()) }}
                    >Preview</Button>
                  </div>
                </div>
                :
                null
            }
            <div className="theme-tab">
              <div id="report-pdf" style={{ display: "none", padding: "20px ", border: '10px solid #000080', borderColor: '#14328d' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
                  <p style={{ textTransform: 'uppercase', marginTop: '0px', fontSize: '40px', fontWeight: '600', color: "black" }}>Game Plan</p>
                  <div style={{ textAlign: 'right' }}>
                    <img src="/assets/images/logo/netqwix_logo real.png" alt="Logo" style={{ width: '200px', objectFit: 'cover' }} />

                  </div>
                </div>
                <div style={{ display: "flex" }}>
                  <div style={{ width: "40%" }}>
                    <div style={{ fontSize: '18px', fontWeight: '400', width: "70%", fontWeight: "bold" }}>Date: {currentDate}</div>
                    <h2 style={{ margin: '0px', fontWeight: "normal", paddingTop: "10px" }}>Topic: {reportObj?.title}</h2>
                    <h2 style={{ margin: '0px', fontWeight: "normal", color: "gray" }}>Name: {reportObj?.topic}</h2>
                  </div>

                </div>
                <hr style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: 'black' }} />
                {reportArr?.map((sst, i) => {
                  return <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <img src={sst?.imageUrl} alt="image" style={{ height: '260px', width: '-webkit-fill-available', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '30px', fontWeight: 'normal' }}>{screenShots[i]?.title}</p>
                        <p>{screenShots[i]?.description}</p>
                      </div>
                    </div>
                    <hr style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: 'black' }} />
                  </>
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'left', marginRight: '20px' }}>
                    <h2 style={{ color: "black" }}>Trainer</h2>
                    <p>{userInfo?.extraInfo?.about}</p>
                  </div>
                  <div>
                    <h2 style={{ color: "black" }}>{userInfo?.fullname}</h2>
                    {/* <img src={userInfo?.profile_picture}
                          alt="John Image"
                          style={{ width: '205.8px', height: '154.4px', marginRight: "20px" }}
                        /> */}

                    <img
                      style={{
                        width: '205.8px',
                        height: '205.8px',
                        marginRight: "20px",
                        marginTop: "10px",
                        borderRadius: "8px"
                      }}
                      // src={Utils?.getImageUrlOfS3(userInfo?.profile_picture) || '/assets/images/demoUser.png'}
                      src={profilePic.current || demoProfilePic.current }
                      alt={userInfo?.fullname}
                      onError={(e) => {
                        e.target.src = demoProfilePic.current;
                      }}
                    />
                  </div>
                </div>

              </div>
              {
                preview ?

                  <div style={{ display: "flex", justifyContent: "center", paddingTop: "10px" }}>

                    <Button className="mx-3" color="primary" onClick={() => {
                      setPreview(false)
                      hidePreview()
                      }}>Back</Button>
                    <Button className="mx-3" color="primary" disabled={uploadPercentage} 
                    onClick={() => {
                      createOrUpdateReport()
                      setIsOpenReport(false)
                      hidePreview()
                      setPreview(false)
                      resetState()
                      if(isTraineeJoined && isCallEnded){
                      isClose();
                      }
                      sendNotifications({
                        title: "Game Plan Report",
                        description: `Trainer shared the gameplan. Check it in the gameplan tab`,
                        senderId: currentReportData?.trainer,
                        receiverId: currentReportData?.trainee,
                      });

                    }}>Save</Button>
                  </div>
                  : null}
            </div>


          </div>

        {gamePlanModalNote && (
        <Notes
          isOpen={gamePlanModalNote}
          onClose={setGamePlanModalClose}
          title={"Game Plans"}
          desc={"Select clips to choose up to two clips, videos will load onto your board when you click the X (cross)."}
          style={{
            top: "10px",
            left: "10px",
          }}
          triangle = {"clip-select"}
          nextFunc={() => {
            setGamePlanModalClose(false);
          }}
        />
      )}
          <CropImage
            isOpenCrop={isOpenCrop}
            setIsOpenCrop={setIsOpenCrop}
            selectImage={selectImage}
            screenShots={screenShots}
            setScreenShots={setScreenShots}
            handleCropImage={handleCropImage}
          />
        </>
      }
    />
  </>
}


export default reportModal;