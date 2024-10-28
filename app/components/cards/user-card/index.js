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

  console.log(displayedImage)

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
    dispatch(updateTraineeProfileAsync(profile));
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
    });
    reader.readAsDataURL(file);

    setIsModalOpen(true);
  };

  const handleRemovePreview = () => {
    setDisplayedImage(userInfo?.profile_picture)
    setCroppedImage(null);
    setSelectedImage(null);
  };

  const handleSavePicture = async (croppedImage) => {
    if (croppedImage) {
      const newFileObj = await Utils?.blobToFile(
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
      <div className={`Trainer-box-1 card-body`} style={{ height: "100%" }}>
        <div
          style={{
            position: "relative",
            width: "200px",
            height: "200px",
            borderRadius: "5px",
            border: "3px solid #000080",
            padding: "5px",
            transition: 'all 0.6s linear'
          }}
        >

          {!croppedImage ? (
            <img
              src={displayedImage?.startsWith("blob:")
                ? displayedImage
                : Utils.getImageUrlOfS3(displayedImage) || "/assets/images/demoUser.png"}
              alt="trainer_image"
              className="rounded"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "50%",
                transition: 'all 0.6s linear'
              }}
              onError={(e) => {
                e.target.src = "/assets/images/demoUser.png";
              }}
            />
          ) : (
            <span>Uploading... </span>
          )}


        </div>
        <div className="">
          {accountType === AccountType?.TRAINER && (
            <div div className="Hourly-up">
              <h3 className="Hourly-rate">
                Hourly Rate: $
                {isEditing ? (
                  <input
                    className="Rate-input-box"
                    type="number"
                    value={profile?.extraInfo?.hourly_rate}
                    onChange={handleRateChange}
                    onBlur={handleSaveClick}
                  />
                ) : (
                  profile?.extraInfo?.hourly_rate
                )}
              </h3>
              <a
                className="icon-btn btn-outline-light btn-sm edit-btn Trainer"
                href="#"
                onClick={isEditing ? handleSaveClick : handleEditClick}
              >
                {isEditing ? <Save /> : <Edit />}
              </a>
            </div>
          )}

          {accountType === AccountType?.TRAINER &&
            showRatings(trainerRatings, "d-flex justify-content-center")}
          {userInfo &&
            userInfo.extraInfo &&
            userInfo.extraInfo.social_media_links &&
            userInfo.extraInfo.social_media_links ? (
            <SocialMediaIcons
              profileImageURL={""}
              social_media_links={userInfo.extraInfo.social_media_links}
              isvisible={false}
            />
          ) : null}
        </div>

        <div className="Change-up-button">
          {!croppedImage ? (
            <>
              <label
                htmlFor="profilePictureInput"
                className="btn btn-primary btn-sm"
              >
                change Picture
              </label>
              <input
                id="profilePictureInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePictureChange}
              />
            </>
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
