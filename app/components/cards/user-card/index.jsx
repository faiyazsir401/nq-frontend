import React, { useState, useEffect } from "react";
import { Utils } from "../../../../utils/utils";
import { useAppDispatch, useAppSelector } from "../../../store";
import { authState, authAction, getMeAsync } from "../../auth/auth.slice";
import { Edit, Save, Star, X, CheckSquare } from "react-feather";
import { AccountType, TRAINER_AMOUNT_USD } from "../../../common/constants";
import SocialMediaIcons from "../../../common/socialMediaIcons";
import { myClips } from "../../../../containers/rightSidebar/fileSection.api";
import { toast, ToastContainer } from "react-toastify";
import {
  getTraineeWithSlotsAsync,
  traineeState,
  updateTraineeProfileAsync,
} from "../../trainee/trainee.slice";
import { useMediaQuery } from "../../../hook/useMediaQuery";
import { updateProfileAsync } from "../../trainer/trainer.slice";

const UserInfoCard = () => {
  const { userInfo, accountType } = useAppSelector(authState);
  const [isEditing, setIsEditing] = useState(false);
  const [displayedImage, setDisplayedImage] = useState(null);
  const dispatch = useAppDispatch();
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

  useEffect(() => {
    getMeAsync();
  }, []);

  useEffect(() => {
    setProfile({
      ...profile,
      ...userInfo,
    });
    setDisplayedImage(userInfo?.profile_picture)
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
            margin: "0 auto",
            padding: "5px",
            backgroundColor: "#fff"
          }}
        >
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
              borderRadius: "3px"
            }}
            onError={(e) => {
              e.target.src = "/assets/images/demoUser.png";
            }}
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
    </>
  );
};

export default UserInfoCard;
