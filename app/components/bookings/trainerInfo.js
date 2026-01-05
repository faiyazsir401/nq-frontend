import React from "react";
import { useState, useEffect } from "react";
import { Utils } from "../../../utils/utils";
import { useAppSelector } from "../../store";
import { authState, authAction } from "../auth/auth.slice";
import { TRAINER_AMOUNT_USD } from "../../common/constants";
import { Edit, Star } from "react-feather";
import SocialMediaIcons from "../../common/socialMediaIcons";
import { myClips } from "../../../containers/rightSidebar/fileSection.api";
import ShareModalTrainer from "./start/Share modal Trainer";
import ShareClipsCard from "../share-clips";
import NavHomePageCenterContainer from "../NavHomePage/NavHomePageCenterContainer";
import recentStudent from "./start/recentStudent";
import { X, Save } from "react-feather";
import UploadClipCard from "../videoupload/UploadClipCard";
import InviteFriendsCard from "../invite-friends";
import { useAppDispatch } from "../../store";
import { uploadProfilePictureAsync, bookingsState } from "../common/common.slice";

import UserInfoCard from "../cards/user-card";
import RecentUsers from "../recent-users";
import { useMediaQuery } from "../../hook/useMediaQuery";





const TrainerInfo = () => {
  const [progress, setProgress] = useState(0)
  const width2000 = useMediaQuery(2000)
  const width1200 = useMediaQuery(1200)
  const width600 = useMediaQuery(600)
  const { userInfo } = useAppSelector(authState);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRate, setEditedRate] = useState(TRAINER_AMOUNT_USD);
  const [storedRate, setStoredRate] = useState(TRAINER_AMOUNT_USD);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [err, setErr] = useState({ email: false, video: false });
  const [selectedImage, setSelectedImage] = useState(null);
  const [displayedImage, setDisplayedImage] = useState(
    Utils?.getImageUrlOfS3(userInfo?.profile_picture) || "/assets/images/avtar/user.png"
  );
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState({
    profile_picture: undefined,
  });
  const { profile_picture, profile_image_url } = useAppSelector(bookingsState);




  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleRateChange = (e) => {
    setEditedRate(e.target.value);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    // Save the edited rate value
    setStoredRate(editedRate);
  };

  const showRatings = (ratings, extraClasses = "") => {
    const { ratingRatio, totalRating } = Utils.getRatings(ratings);
    return (
      <>
        <div className={extraClasses}>
          <Star color="#FFC436" size={28} className="star-container star-svg" />
          <p className="ml-1 mt-1 mr-1 font-weight-light">{ratingRatio || 0}</p>
          <p className="mt-1">({totalRating || 0})</p>
        </div>
      </>
    );
  };
  const handleSelectClip = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    getMyClips()
  }, [])

  const getMyClips = async () => {
    var res = await myClips({})
    setClips(res?.data)
  }
  const [clips, setClips] = useState([]);
  const [selectedClips, setSelectedClips] = useState([]);
  const images = [...Array().keys()];
  // trainerInfo.js


  const handlePictureChange = (e) => {
    const selectedFile = e.target.files[0];
    setSelectedImage(selectedFile);
  };
  const handleRemovePreview = () => {
    setSelectedImage(null);
  };

  const handleSavePicture = () => {
    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", selectedImage);

      dispatch(uploadProfilePictureAsync({ files: selectedImage }))
        .then((action) => {
          const newProfilePictureURL = action.payload?.url;

          if (newProfilePictureURL) {
            setDisplayedImage(newProfilePictureURL);
          } else {
            console.error("Invalid image URL:", newProfilePictureURL);
          }

          setSelectedImage(null);
        })
        .catch((error) => {
          console.error("Error uploading profile picture:", error);
        });
    }
  };



  return (
    <div className="container-fluid">
      <div className="row">
        {/* Right side */}
        <div className={`${width600 ? "col-sm-12" : width1200 ? "row" : width2000 ? "col-sm-3" : ""}  my-3`} style={{ width: "auto !important" }}>
          <div className={`${width600 ? "col-sm-12" : width1200 ? "col-sm-6" : width2000 ? "col-sm-12" : ""}`}>
            <div className='card trainer-profile-card Home-main-Cont' style={{ 
              height: "100%", 
              width: "100%",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "none"
            }}>
              <UserInfoCard />
            </div>
          </div>
          <div className={`${width600 ? "col-sm-12" : width1200 ? "col-sm-6" : width2000 ? "col-sm-12" : ""} my-3`} >
            <div className='card trainer-profile-card Home-main-Cont' style={{ 
              height: "100%", 
              width: "100%", 
              color: "black",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "none"
            }}>
              <div className='card-body' style={{ padding: "10px" }}>
                <RecentUsers />
              </div>
            </div>
          </div>
        </div>
        {/* Middle */}
        <div className={`${width600 ? "col-sm-12" : width1200 ? "col-sm-12" : width2000 ? "col-sm-6" : ""} my-3`} id="Nav-T" style={{ width: "auto !important" }}>
          <div className='card trainer-profile-card Home-main-Cont' style={{ 
            width: "100%",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none"
          }}>
            <div className='card-body' style={{ padding: "15px" }}>
              <NavHomePageCenterContainer />
            </div>
          </div>
        </div>

        {/* Left side */}
        <div className={`${width600 ? "col-sm-12" : width1200 ? "row" : width2000 ? "col-sm-3" : ""}`} style={{ width: "auto !important" }}>
          <div className={`${width600 ? "col-sm-12" : width1200 ? "col-sm-6" : width2000 ? "col-sm-12" : ""} my-3`}>
            <div className='card trainer-profile-card Home-main-Cont' style={{ 
              height: "100%", 
              width: "100%",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "none"
            }}>
              <div className='card-body' style={{ padding: "15px" }}>
                <UploadClipCard progress={progress} setProgress={setProgress} />
              </div>
            </div>
          </div>
          <div className={`${width600 ? "col-sm-12" : width1200 ? "col-sm-6" : width2000 ? "col-sm-12" : ""} my-3`}>
            <div className='card trainer-profile-card Home-main-Cont' style={{ 
              height: "100%", 
              width: "100%",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "none"
            }}>
              <div className='card-body' style={{ padding: "15px" }}>
                <InviteFriendsCard />
              </div>
            </div>
          </div>
          <div className={`${width600 ? "col-sm-12" : width1200 ? "col-sm-6" : width2000 ? "col-sm-12" : ""} my-3`}>
            <div className='card trainer-profile-card Home-main-Cont' style={{ 
              height: "100%", 
              width: "100%",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "none"
            }}>
              <div className='card-body' style={{ padding: "15px" }}>
                <ShareClipsCard />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>


  );
}
export default TrainerInfo;
