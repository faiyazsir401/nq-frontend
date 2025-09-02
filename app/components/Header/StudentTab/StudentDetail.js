import React, { useState } from "react";
import { Utils } from "../../../../utils/utils";
import NavStudentRecord from "./NavStudentRecord";
import { useMediaQuery } from "../../../hook/useMediaQuery";
import UploadClipCard from "../../videoupload/UploadClipCard";

const StudentDetail = ({ videoClips, data }) => {
  // useEffect(() => {
  //    
  // }, [data]);
  const [progress,setProgress] = useState(0)
  const width600 = useMediaQuery(700);

  const trainee_id = data?._id;

  function addSuffix(name) {
    if (name) {
      return `${name}'s`
    }
    return ""
  }

  return (
    <div>
      <h3 style={{ textAlign: 'center' }}>{addSuffix(data?.fullname)} Clips</h3>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        paddingTop: "10px",
        flexWrap:"wrap",
        gap:"15px"
      }}>
        <div >
        <div className="card rounded trainer-profile-card" style={{
          width: "250px",
          maxHeight: "260px",
          border: "2px solid rgb(0, 0, 128)",
          borderRadius: "5px"
        }}>
          <div className="card-body">
            <div className="row">
              <div className="col-12 d-flex justify-content-center align-items-center">
                <img
                  className="card-img-top"
                  src={Utils?.getImageUrlOfS3(data?.profile_picture) || '/assets/images/demoUser.png'}
                  alt="Card image cap"
                  style={{
                    padding: "5px",
                    borderRadius: "20px",
                    objectFit: 'cover',
                    height: '190px',
                    width: '200px',
                  }}
                  onError={(e) => {
                    e.target.src = '/assets/images/demoUser.png';  // Set default image on error
                  }}
                />
              </div>
              <div className="col-12 text-center mt-3">
                <h3>{data?.fullname}</h3>
              </div>
            </div>

         
          </div>
        </div>

        <div className="card rounded trainer-profile-card mt-2" style={{
          width: "250px",
         
          border: "2px solid rgb(0, 0, 128)",
          borderRadius: "5px"
        }}>
          <div className="card-body">

            <UploadClipCard progress={progress} setProgress={setProgress} isFromCommunity={data?._id}/>
          </div>
        </div>
</div>
        <div className="card rounded trainer-profile-card" style={{
          // maxWidth: "60%",
          width: `calc(100% - 300px)`,
          height: "100%",
          padding: width600?"8px":'20px',
          // overflow: 'scroll',
          border: "2px solid rgb(0, 0, 128)",
          borderRadius: "5px"
        }}>
          <NavStudentRecord  trainee_id={trainee_id}/>
        </div>
      </div>

      {/* {videoClips?.length ?
        <div style={{ display: "flex", flexWrap: "wrap", margin: '20px 20px', overflow: 'auto', gap:'20px' }}>
          {videoClips?.map((clp, index) => (
            <div key={`video_clip_${index}`}>
              <video controls style={{ maxWidth:'200px',minWidth:'200px',maxHeight:'120px',minHeight:'120px'}}>
                <source src={Utils?.generateVideoURL(clp)} type="video/mp4" />
              </video>
            </div>
          ))}
        </div>
        : <h5 style={{ margin: '40px 20px', textAlign: 'center' }}>No Clips Found.</h5>} */}
    </div>
  );
};

export default StudentDetail;
