import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { awsS3Url } from "../../../utils/constant";
import { createReport } from "../videoupload/videoupload.api";
import Modal from "../../common/modal";
function ScreenShotDetails({
  setIsOpenDetail,
  isOpenDetail,
  screenShotImages,
  setScreenShotImages,
  currentReportData,
  reportObj,
}) {

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  console.log(screenShotImages)
  console.log("=======>URL after screenshot", `${awsS3Url}${screenShotImages[screenShotImages?.length - 1]?.imageUrl}`)

  function resetForm() {
    setTitle("");
    setDescription("");
  }

  return (

    <>
      <Modal isOpen={isOpenDetail} element={
        <div className="d-flex justifyContentCenter alignItemsCenter" style={{
          height:"95vh"
        }}>

        <div
          className="ss-popup"
          style={{
            width:500,
            margin:"auto",
            
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: "3px",
              width: "100%",
              position: "absolute",
              top: "15px",
              right: "15px",
            }}
          >
            <div
              style={{
                cursor: "pointer",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#fff",
                backgroundColor: "rgb(0, 0, 128)",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => {
                // setScreenShotImages([...screenShotImages,
                // screenShotImages[screenShotImages?.length - 1].title = '',
                // screenShotImages[screenShotImages?.length - 1].description = '',
                // ])
                resetForm()
                setIsOpenDetail(false)
              }}
            >
              <RxCross2
                style={{
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection:"column"
            }}
          >
            <div
              style={{
                width: "30%",
                height: "80px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                style={{
                  width: "100%",
                  height: "100%",
                  // border: "1px solid rgb(0, 0, 128)",
                  objectFit: 'cover'
                }}
                src={`${awsS3Url}${screenShotImages[screenShotImages?.length - 1]?.imageUrl}`}
                alt="Screen Shot"
              />
            </div>
            <div
              style={{
                width: '70%',
                marginLeft: '5px'
              }}>
              
              <div
                style={{
                  width: '100%',
                }}
              >
                <textarea
                  rows="2"
                  type="text"
                  name="description"
                  placeholder="Description"
                  style={{
                    padding: "5px 10px",
                    fontSize: "12px",
                    margin: "3px 0",
                    width: "100%",
                    outline: "none",
                    border: "1px solid rgb(0, 0, 128)",
                    borderRadius: '8px'
                  }}
                  onChange={(e) => {
                    // screenShotImages[screenShotImages?.length - 1].description =
                    //   e.target.value;
                    // setScreenShotImages([...screenShotImages]);
                    setDescription(e.target.value)
                  }}
                  value={
                    description
                  }
                />
              </div>
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
            }}
          >
            <button
              style={{
                backgroundColor: "rgb(0, 0, 128)",
                color: "#fff",
                borderRadius: "8px",
                padding: "6px 10px",
                border: "1px solid rgb(0, 0, 128)",
                // marginTop: "5px",
                cursor: "pointer",
              }}
              onClick={async () => {
                const copyArr = [...screenShotImages];
                copyArr[copyArr?.length - 1] = { title, description, imageUrl: copyArr[copyArr?.length - 1]?.imageUrl };
                setScreenShotImages([...copyArr]);
                await createReport({
                  sessions: currentReportData?.session,
                  trainer: currentReportData?.trainer,
                  trainee: currentReportData?.trainee,
                  title: reportObj?.title,
                  topic: reportObj?.topic,
                  reportData: [...copyArr],
                })
                resetForm();
                setIsOpenDetail(false)
              }}
            >
              Add
            </button>
          </div>
        </div>
        </div>
      } />
    </>
  );
}

export default ScreenShotDetails;
