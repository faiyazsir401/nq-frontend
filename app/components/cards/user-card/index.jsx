import React, { useState, useEffect } from "react";
import { Utils } from "../../../../utils/utils";
import { useAppDispatch, useAppSelector } from "../../../store";
import { authState, authAction, getMeAsync } from "../../auth/auth.slice";
import { Edit, Save, Star, X, CheckSquare } from "react-feather";
import { AccountType, TRAINER_AMOUNT_USD } from "../../../common/constants";
import SocialMediaIcons from "../../../common/socialMediaIcons";
import { myClips } from "../../../../containers/rightSidebar/fileSection.api";
import {
  bookingsAction,
  bookingsState,
  uploadProfilePictureAsync,
} from "../../common/common.slice";
import { toast, ToastContainer } from "react-toastify";
import {
  getTraineeWithSlotsAsync,
  traineeState,
  updateTraineeProfileAsync,
} from "../../trainee/trainee.slice";
import { useMediaQuery } from "../../../hook/useMediaQuery";
import CropImage from "./crop-modal";
import { getS3SignUrlForProfile, pushProfilePhotoToS3 } from "../../common/common.api";
import { updateProfileAsync } from "../../trainer/trainer.slice";

const ASPECT_RATIO = 1;
const MIN_DIMENSION = 150;

const UserInfoCard = () => {
  const { userInfo, accountType } = useAppSelector(authState);
  const [isEditing, setIsEditing] = useState(false);
  const [imgURL, setImgURL] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [displayedImage, setDisplayedImage] = useState(null);
  const dispatch = useAppDispatch();
  const { profile_picture, profile_image_url } = useAppSelector(bookingsState);
  const width1200 = useMediaQuery(1200);
  const width2000 = useMediaQuery(2000);
  const width600 = useMediaQuery(600);
  const [profile, setProfile] = useState({
    username: "",
    address: "Alabma , USA",
    wallet_amount: 0,
    hourly_rate: 0,
    editStatus: false,
    profile_picture: undefined,
  });
  const { getTraineeSlots } = useAppSelector(traineeState);
  const [trainerRatings, setTrainerRatings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    getMeAsync();
  }, []);

  useEffect(() => {
    if (profile_picture) {
      setProfile({ ...profile, profile_picture: profile_picture });
    }
  }, [profile_picture]);

  useEffect(() => {
    setProfile({
      ...profile,
      ...userInfo,
    });
    setDisplayedImage(userInfo?.profile_picture)
    // setDisplayedImage(Utils?.getImageUrlOfS3(userInfo?.profile_picture));
  }, [userInfo]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = (e) => {
    setIsEditing(false);
    dispatch(updateProfileAsync({extraInfo:profile.extraInfo}));
  };

  const handleRateChange = (e) => {
    setProfile({
      ...profile,
      extraInfo: {
        ...profile?.extraInfo,
        hourly_rate: e.target.value,
      },
    });
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

  const handlePictureChange = (e) => {
     
    try {
      const file = e.target.files?.[0];
       
      if (!file) return;
  
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const imageElement = new Image();
        const imageUrl = reader.result?.toString() || "";
        imageElement.src = imageUrl;
  
        imageElement.addEventListener("load", (e) => {
          // if (error) setError("");
          const { naturalWidth, naturalHeight } = e.currentTarget;
          if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
            // setError("Image must be at least 150 x 150 pixels.");
            return setSelectedImage("");
          }
        });
        setSelectedImage(imageUrl);
        setIsModalOpen(true);
      });
      reader.readAsDataURL(file);
  
    } catch (error) {
       
    }

  };

  const handleRemovePreview = () => {
    setDisplayedImage(userInfo?.profile_picture)
    setCroppedImage(null);
    setSelectedImage(null);
  };

  const handleSavePicture = async (croppedImage) => {
     
    if (croppedImage) {
      const newFileObj = Utils?.blobToFile(
        croppedImage,
        `${profile?.fullname}.png`,
        "image/png"
      );
      await handelSelectFile(selectedImage, croppedImage);
    }
  };

  const handelSelectFile = async (selectedImage, bolb) => {
     
    if (!selectedImage) {
      toast.error("Please select a Image");
      return;
    }

    var payload = { filename: selectedImage?.name, fileType: selectedImage?.type };
    const data = await getS3SignUrlForProfile(payload);

    if (data?.url) {
      await pushProfilePhotoToS3(data.url, bolb, setProgress, successImageUpload);
    }
  };

  function successImageUpload() {
    dispatch(getMeAsync());
    setCroppedImage(null);
    setSelectedImage(null);
  }

  useEffect(() => {
    if (imgURL) {
      dispatch(updateTraineeProfileAsync(profile));
    }
  }, [imgURL]);

  useEffect(() => {
    const findByTrainerId = getTraineeSlots.find(
      (trainer) => trainer && trainer?._id === profile?._id
    );
    setTrainerRatings(findByTrainerId?.trainer_ratings);
  }, [getTraineeSlots]);

  useEffect(() => {
    const searchTerm = profile && profile?.fullname;
    const filterParams = {
      date: new Date(),
      day: new Date().getDay(),
      time: new Date().getTime(),
    };
    if (searchTerm && filterParams) {
      const filterPayload = {
        time: filterParams.time,
        day: filterParams.day,
        search: searchTerm,
      };
      dispatch(getTraineeWithSlotsAsync(filterPayload));
    }
  }, [profile]);


  return (
    <>
      {/* <ToastContainer /> */}
      <div className={`Trainer-box-1 card-body`} style={{ 
        height: "100%", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        gap: width600 ? "10px" : "15px",
        padding: width600 ? "10px" : "15px"
      }}>
        <div
          className="profile-picture-container"
          style={{
            position: "relative",
            width: width600 ? "100px" : width1200 ? "140px" : "180px",
            height: width600 ? "100px" : width1200 ? "140px" : "180px",
            borderRadius: "5px",
            border: width600 ? "2px solid #000080" : "3px solid #000080",
            overflow: "hidden",
            transition: 'all 0.3s ease',
            cursor: "pointer",
            margin: "0 auto",
            padding: "5px",
            backgroundColor: "#fff"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 128, 0.3)";
            const overlay = e.currentTarget.querySelector('.profile-edit-overlay');
            if (overlay) overlay.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
            const overlay = e.currentTarget.querySelector('.profile-edit-overlay');
            if (overlay) overlay.style.opacity = "0";
          }}
          onClick={() => {
            if (!croppedImage) {
              document.getElementById("profilePictureInput")?.click();
            }
          }}
        >
          {!croppedImage ? (
            <>
              <img
                src={displayedImage?.startsWith("blob:")
                  ? displayedImage
                  : Utils.getImageUrlOfS3(displayedImage) || "/assets/images/demoUser.png"}
                alt="profile_image"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: 'all 0.3s ease',
                  pointerEvents: "none",
                  borderRadius: "3px"
                }}
                onError={(e) => {
                  e.target.src = "/assets/images/demoUser.png";
                }}
              />
              {/* Edit button overlay */}
              <div
                className="profile-edit-overlay"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: "5px",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                  cursor: "pointer",
                  pointerEvents: "auto"
                }}
              >
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                  color: "white"
                }}>
                  <Edit size={width600 ? 18 : 24} />
                  {!width600 && <span style={{ fontSize: "12px", fontWeight: "500" }}>Edit</span>}
                </div>
              </div>
            </>
          ) : (
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f0f0f0"
            }}>
              <span style={{ color: "#000080", fontWeight: "500" }}>Uploading...</span>
            </div>
          )}
          <input
            id="profilePictureInput"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePictureChange}
          />
        </div>
        <div style={{ width: "100%", textAlign: "center" }}>
          <h4 style={{ 
            marginBottom: width600 ? "8px" : "10px", 
            fontWeight: "600", 
            color: "#333",
            fontSize: width600 ? "14px" : width1200 ? "16px" : "18px"
          }}>
            {profile?.fullname || userInfo?.fullname || "User"}
          </h4>
          
          {accountType === AccountType?.TRAINER && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: width600 ? "6px" : "10px",
              marginBottom: width600 ? "8px" : "10px",
              flexWrap: "wrap"
            }}>
              <h5 style={{ 
                margin: 0, 
                fontWeight: "500", 
                color: "#666",
                fontSize: width600 ? "12px" : width1200 ? "14px" : "16px"
              }}>
                Hourly Rate: $
                {isEditing ? (
                  <input
                    type="number"
                    value={profile?.extraInfo?.hourly_rate || 0}
                    onChange={handleRateChange}
                    onBlur={handleSaveClick}
                    style={{
                      width: width600 ? "60px" : "80px",
                      padding: width600 ? "3px 6px" : "4px 8px",
                      border: "1px solid #000080",
                      borderRadius: "4px",
                      fontSize: width600 ? "12px" : "14px",
                      marginLeft: "5px"
                    }}
                  />
                ) : (
                  <span style={{ color: "#000080", fontWeight: "600" }}>
                    {profile?.extraInfo?.hourly_rate || 0}
                  </span>
                )}
              </h5>
              <button
                className="icon-btn btn-outline-primary btn-sm"
                type="button"
                onClick={isEditing ? handleSaveClick : handleEditClick}
                style={{
                  padding: width600 ? "3px 6px" : "4px 8px",
                  border: "1px solid #000080",
                  borderRadius: "4px",
                  backgroundColor: isEditing ? "#000080" : "transparent",
                  color: isEditing ? "white" : "#000080",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                {isEditing ? <Save size={width600 ? 14 : 16} /> : <Edit size={width600 ? 14 : 16} />}
              </button>
            </div>
          )}

          {accountType === AccountType?.TRAINER &&
            showRatings(trainerRatings, "d-flex justify-content-center")}
          
          {userInfo &&
            userInfo.extraInfo &&
            userInfo.extraInfo.social_media_links &&
            userInfo.extraInfo.social_media_links ? (
            <div style={{ marginTop: width600 ? "8px" : "10px" }}>
              <SocialMediaIcons
                profileImageURL={""}
                social_media_links={userInfo.extraInfo.social_media_links}
                isvisible={false}
                isMobile={width600}
              />
            </div>
          ) : null}
        </div>
      </div>
      <CropImage
        image={selectedImage}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        croppedImage={croppedImage}
        setCroppedImage={setCroppedImage}
        setDisplayedImage={setDisplayedImage}
        handleSavePicture={handleSavePicture}
      />
    </>
  );
};

export default UserInfoCard;
