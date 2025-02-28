import React, { useState, useContext, useEffect, useRef } from "react";
import { Edit, ChevronLeft, X, ChevronRight, PlusCircle } from "react-feather";
import { Input, Label } from "reactstrap";

import { Form, Formik } from "formik";

import CustomizerContext from "../../helpers/customizerContext";
import config from "../../config/customizerConfig";
import * as Yup from "yup";

import { useAppDispatch, useAppSelector } from "../../app/store";
import { authState, getMeAsync } from "../../app/components/auth/auth.slice";
import {
  AccountType,
  LOCAL_STORAGE_KEYS,
  Message,
  STATUS,
  TimeZone,
  URL_MAX_LENGTH,
  allowedPNGExtensions,
  settingMenuFilterSection,
  urlRegex,
  validationMessage,
} from "../../app/common/constants";
import { UpdateSettingProfileForm } from "../../app/components/trainer/settings/form";
import {
  trainerState,
  updateProfileAsync,
} from "../../app/components/trainer/trainer.slice";
import { updateTraineeProfileAsync } from "../../app/components/trainee/trainee.slice";
import { HandleErrorLabel } from "../../app/common/error";
import { toast } from "react-toastify";
import UploadFile from "../../app/common/uploadFile";
import {
  bookingsAction,
  bookingsState,
  uploadProfilePictureAsync,
} from "../../app/components/common/common.slice";
import { Utils } from "../../utils/utils";
import { UpdateHourlyRateForm } from "../../app/components/trainer/settings/hourly_rate";
import TimePicker from "rc-time-picker";
import { SettalInBankAccount } from "../../app/components/trainer/settings/settal_in_bank";
import { settelReqestToBankAccount } from "../../app/components/trainer/trainer.api";
import { updateAccountPrivacy } from "../../app/common/common.api";

const NOTIFICATION_TYPES = [
  "Promotional Email",
  "Promotional SMS",
  "Transcational Email",
  "Transcational SMS"
]

const SettingSection = (props) => {
  const dispatch = useAppDispatch();
  const socialFormRef = useRef(null);
  const { removeProfilePicture, removeProfileImageUrl } = bookingsAction;
  const { profile_picture, profile_image_url } = useAppSelector(bookingsState);
  const { userInfo } = useAppSelector(authState);
  const customizerCtx = useContext(CustomizerContext);
  const addBackgroundWallpaper = customizerCtx.addBackgroundWallpaper;
  const [isSocialFormOpen, setIsSocialFormOpen] = useState(false);
  const [acctRequestDisable, setDisable] = useState(false);
  const [isCheck, setIsChecked] = useState(false);
  const [deleteAcct, setDeleteDisable] = useState(false);
  const [settingTab, setSettingTab] = useState("");
  const [isError, setIsError] = useState(false);
  const [workingHours, setWorkingHours] = useState({
    from: "09:00:00",
    to: "22:00:00",
    time_zone: "(GMT -5:00) Eastern Time (US & Canada)",
  });
  const [isTimeConflicts, setIsTimeConflicts] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    address: "Alabma , USA",
    wallet_amount: 0,
    hourly_rate: 0,
    editStatus: false,
    profile_picture: undefined,
  });
  const [collapseShow, setCollapseShow] = useState({
    security: false,
    privacy: false,
    verfication: false,
    changeNumber: false,
    accountInfo: false,
    deleteAccount: false,
    hourlyRate: false,
    workingHours: false,
    settelBankAccount: false,
  });

  const initialValues = {
    fb:
      userInfo && userInfo?.extraInfo && userInfo?.extraInfo.social_media_links
        ? userInfo.extraInfo.social_media_links.fb
        : "",
    instagram:
      userInfo && userInfo?.extraInfo && userInfo?.extraInfo.social_media_links
        ? userInfo.extraInfo.social_media_links.instagram
        : "",
    twitter:
      userInfo && userInfo?.extraInfo && userInfo?.extraInfo.social_media_links
        ? userInfo.extraInfo.social_media_links.twitter
        : "",
    google:
      userInfo && userInfo?.extraInfo && userInfo?.extraInfo.social_media_links
        ? userInfo.extraInfo.social_media_links.google
        : "",
    slack:
      userInfo && userInfo?.extraInfo && userInfo?.extraInfo.social_media_links
        ? userInfo.extraInfo.social_media_links.slack
        : "",
    profile_image_url:
      userInfo && userInfo?.extraInfo && userInfo?.extraInfo.social_media_links
        ? userInfo.extraInfo.social_media_links.profile_image_url
        : "",
  };

  const validationSchema = Yup.object().shape({
    fb: Yup.string()
      .matches(urlRegex, Message.validUrl)
      .max(URL_MAX_LENGTH.MAX_LENGTH, URL_MAX_LENGTH.MESSAGE)
      .nullable(),
    instagram: Yup.string()
      .matches(urlRegex, Message.validUrl)
      .max(URL_MAX_LENGTH.MAX_LENGTH, URL_MAX_LENGTH.MESSAGE)
      .nullable(),
    twitter: Yup.string()
      .matches(urlRegex, Message.validUrl)
      .max(URL_MAX_LENGTH.MAX_LENGTH, URL_MAX_LENGTH.MESSAGE)
      .nullable(),
    google: Yup.string()
      .matches(urlRegex, Message.validUrl)
      .max(URL_MAX_LENGTH.MAX_LENGTH, URL_MAX_LENGTH.MESSAGE)
      .nullable(),
    slack: Yup.string()
      .matches(urlRegex, Message.validUrl)
      .max(URL_MAX_LENGTH.MAX_LENGTH, URL_MAX_LENGTH.MESSAGE)
      .nullable(),
    // profile_image_url: Yup.string().test(
    //   "imageValidation",
    //   Message.errorMessage.invalidPNG,
    //   (value) => {
    //     return /\.(jpg|jpeg|png)$/i.test(value);
    //   }
    // ),
  });

  const [accountType, setAccountType] = useState("");
  useEffect(() => {
    if (
      socialFormRef &&
      socialFormRef.current &&
      userInfo?.extraInfo &&
      userInfo?.extraInfo.social_media_links
    ) {
      socialFormRef.current.setValues({
        ...userInfo?.extraInfo.social_media_links,
      });
    }
  }, [socialFormRef, userInfo]);

  useEffect(() => {
    setAccountType(localStorage.getItem(LOCAL_STORAGE_KEYS.ACC_TYPE));
  }, []);

  useEffect(() => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      username: userInfo.fullname,
      address: userInfo.email,
      wallet_amount: userInfo.wallet_amount,
      profile_picture: userInfo.profile_picture,
    }));
    setWorkingHours(userInfo?.extraInfo?.working_hours);
  }, [userInfo]);

  // useEffect(())

  const funcChecked = (val) => {
    setIsChecked(val);
  };

  const ProfileHandle = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const EditProfile = (e) => {
    e.preventDefault();
    if (profile.editStatus) {
      if (profile.username && profile.username.trim().length) {
        // updating trainee profile
        const isMatch = userInfo.fullname === profile.username;
        if (accountType === AccountType.TRAINEE) {
          if (isMatch) {
            toast(
              "Sorry, this username is already taken. Please choose a different username.",
              { type: "error" }
            );
          } else {
            dispatch(
              updateTraineeProfileAsync({
                fullname: profile.username,
                profile_picture: profile.profile_picture,
              })
            );
            setIsError(false);
          }
        } else if (accountType === AccountType.TRAINER) {
          if (isMatch) {
            toast(
              "Sorry, this username is already taken. Please choose a different username.",
              { type: "error" }
            );
          } else {
            // updating trainer profile
            dispatch(
              updateTraineeProfileAsync({
                fullname: profile.username,
                profile_picture: profile.profile_picture,
              })
            );
            setIsError(false);
          }
        }
        setProfile({
          ...profile,
          editStatus: isMatch ? profile.editStatus : !profile.editStatus,
        });
      } else {
        toast("please enter required values.");
      }

      console.log(`save here `, profile);
    } else {
      setProfile({ ...profile, editStatus: !profile.editStatus });
    }
  };

  const closeLeftSide = () => {
    // document.querySelector(".settings-tab").classList.remove("active");
    // document.querySelector(".recent-default").classList.add("active");
    // props.ActiveTab("");
    props.smallSideBarToggle();
  };

  useEffect(() => {
    // wallpaper
    if (config.wallpaper) {
      document.querySelector(
        ".wallpapers"
      ).style = `background-image: url(${`/assets/images/wallpaper/${config.wallpaper}.jpg`}) ; background-color: transparent; background-blend-mode: unset`;
    }
  }, []);

  useEffect(() => {
    if (profile_picture) {
      setProfile({ ...profile, profile_picture: profile_picture });
    }
  }, [profile_picture]);

  useEffect(() => {
    if (socialFormRef && socialFormRef.current) {
      if (profile_image_url) {
        socialFormRef.current.setFieldValue(
          "profile_image_url",
          profile_image_url
        );
      }
    }
  }, [profile_image_url]);

  const setBackgroundWallpaper = (e, wallpaper) => {
    addBackgroundWallpaper(e, wallpaper);
    config.wallpaper = wallpaper;
  };

  const handelSelectFile = (event) => {
    if (event && event.target && event.target.files && event.target.files[0]) {
      const { files } = event.target;
      const selectedFile = files[0];
      if (selectedFile instanceof File) {
        const fileSizeLessthan2Mb = Utils.fileSizeLessthan2Mb(selectedFile);
        if (fileSizeLessthan2Mb) {
          dispatch(uploadProfilePictureAsync({ files: selectedFile }));
        } else {
          setIsError(!fileSizeLessthan2Mb);
        }
      } else {
        console.error("Invalid file selected.");
      }
    }
    event.stopPropagation();
  };

  const handelClearFile = () => {
    setProfile({ ...profile, profile_picture: null });
    dispatch(removeProfilePicture(null));
  };

  const requestForSettelment = async (data) => {
    const result = await settelReqestToBankAccount(data);
    alert(result?.msg);
  };

  const updatePrivateAccount = async (isPrivate) => {
    try {
      const result = await updateAccountPrivacy({ isPrivate })
      dispatch(getMeAsync());
      toast.success(result?.msg);
    } catch (error) {
      toast.error("updateAccountPrivacy -> error");
      console.log("updateAccountPrivacy -> error", error);
    }
  }

  return (
    <div
      className={`settings-tab submenu-width dynemic-sidebar custom-scroll ${props.tab === "setting" ? "active" : ""
        }`}
      id="settings"
    >
      <div className="theme-title">
        <div className="media">
          <div>
            <h2>Settings</h2>
            <h4>Change your app setting.</h4>
          </div>
          <div className="media-body text-right">
            {" "}
            <a
              className="icon-btn btn-outline-light btn-sm close-panel"
              href="#"
              onClick={() => {
                closeLeftSide();
                setSettingTab("");
                setProfile({
                  ...profile,
                  editStatus: false,
                });
              }}
            >
              <X />
            </a>
          </div>
        </div>
        <div className="profile-box">
          <div className={`media ${profile.editStatus ? "open" : ""}`}>
            {profile.profile_picture && profile.editStatus ? (
              <div className="border border-dark rounded mt-2">
                <i
                  className="fa fa-times pointer"
                  aria-hidden="true"
                  onClick={handelClearFile}
                  style={{
                    position: "absolute",
                    left: accountType === AccountType.TRAINEE ? "14%" : "3%",
                    top: "42%",
                  }}
                />
                <img
                  className={`bg-img rounded ${accountType === !AccountType.TRAINEE && "mt-1"
                    }`}
                  src={Utils?.getImageUrlOfS3(profile?.profile_picture)}
                  alt="Avatar"
                  width={44}
                  height={38}
                />
              </div>
            ) : (
              <div>
                {profile.editStatus && !profile.profile_picture ? (
                  <>
                    <UploadFile
                      isError={isError}
                      onChange={handelSelectFile}
                      values={profile && profile.profile_picture}
                      key={"files"}
                      name={"files"}
                    />
                  </>
                ) : (
                  <img
                    className={`bg-img rounded ${accountType === AccountType.TRAINEE ? "mt-2" : "mt-3"
                      }`}
                    src={
                      profile.profile_picture
                        ? Utils?.getImageUrlOfS3(profile?.profile_picture)
                        : "/assets/images/avtar/user.png"
                    }
                    alt="Avatar"
                    width={44}
                    height={40}
                  />
                )}
              </div>
            )}
            {/* </div> */}
            <div className="details">
              <h5>{profile.username}</h5>
              <h6>{profile.address}</h6>
              {accountType === AccountType.TRAINER && (
                <h6>
                  {" "}
                  Wallet Amount: <b> ${profile.wallet_amount} </b>{" "}
                </h6>
              )}
            </div>
            <div className="details edit">
              <form className="form-radious form-sm">
                <div className="form-group mb-2 ml-2">
                  <label> Full name </label>
                  <input
                    className="form-control"
                    type="text"
                    name="username"
                    defaultValue={profile.username}
                    onChange={(e) => ProfileHandle(e)}
                  />
                </div>
                {/* <div className="form-group mb-0">
                  <input
                    className="form-control"
                    type="text"
                    name="address"
                    defaultValue={profile.address}
                    onChange={(e) => ProfileHandle(e)}
                  />
                </div> */}
              </form>
            </div>
            <div className="media-body">
              <a
                className="icon-btn btn-outline-light btn-sm pull-right edit-btn"
                href="#"
                onClick={(e) => EditProfile(e)}
              >
                {" "}
                <Edit />
              </a>
            </div>
          </div>
          {!profile_picture && isError ? (
            <div className="row">
              <div className="col-12">
                <p className="text-danger">
                  {Message.errorMessage.invalidFile}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="setting-block">
        <div
          className={`block ${settingTab === "account" ? "open custom-block-height" : ""
            }`}
          style={{ maxWidth: "95%" }}
        >
          <div className="media">
            <div className="media-body">
              <h3>Account</h3>
            </div>
            <div className="media-right">
              <a
                className="icon-btn btn-outline-light btn-sm pull-right previous"
                href="#"
                onClick={() => setSettingTab("")}
              >
                {" "}
                <ChevronLeft />
              </a>
            </div>
          </div>
          <div className="theme-according" id="accordion">
            <div className="card">
              <div
                className="card-header"
                onClick={() =>
                  setCollapseShow({
                    ...collapseShow,
                    security: !collapseShow.security,
                    privacy: false,
                    changeNumber: false,
                    accountInfo: false,
                    deleteAccount: false,
                    verfication: false,
                  })
                }
              >
                <a href="#javascript">
                  Notifications
                  <i className="fa fa-angle-down" />
                </a>
              </div>
              <div
                className={`collapse ${collapseShow.security ? "show" : ""}`}
                id="collapseTwo"
                data-parent="#accordion"
              >
                <div className="card-body">
                  {NOTIFICATION_TYPES.map((notification) =>
                    <div className="media">
                      <div className="media-body">
                        <h5>{notification}</h5>
                      </div>
                      <div className="media-right">
                        <Label className="switch">
                          <Input type="checkbox" />
                          <span className="switch-state" />
                        </Label>
                      </div>
                    </div>
                  )}
                  <p>
                    <b>Note : </b>enable or disable to control the type of notifications
                    you will receive.
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div
                className="card-header"
                onClick={() =>
                  setCollapseShow({
                    ...collapseShow,
                    privacy: !collapseShow.privacy,
                    changeNumber: false,
                    accountInfo: false,
                    deleteAccount: false,
                    verfication: false,
                    security: false,
                  })
                }
              >
                <a href="#javascript">
                  Privacy<i className="fa fa-angle-down"></i>
                </a>
              </div>
              <div className={`collapse ${collapseShow.privacy ? "show" : ""}`}>
                <div className="card-body">
                  <ul className="privacy">
                    <li className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="media-body">
                          <h5 className="pt-0">Private Account</h5>
                        </div>
                        <div className="media-right">
                          <Label className="switch mb-0">
                            <Input type="checkbox" checked={userInfo.isPrivate} onChange={(e) => updatePrivateAccount(e.target.checked)} />
                            <span className="switch-state"></span>
                          </Label>
                        </div>
                      </div>

                      <p>
                        {" "}
                        <b>Note : </b>Turn you account private. People will not be able to add you as friend in the community. Your existing friends will stay connected.
                      </p>
                    </li>
                    {/* <li>
                      <div className="media-body">
                        <h5>Last seen</h5>
                      </div>
                      <div className="media-right">
                        <Label className="switch">
                          <Input type="checkbox" />
                          <span className="switch-state"></span>
                        </Label>
                      </div>

                      <p>
                        {" "}
                        <b>Note : </b>turn on this setting to whether your
                        contact can see last seen or not.
                      </p>
                    </li>
                    <li>
                      <h5>Profile Photo</h5>
                      <div className="media-right">
                        <Label className="switch">
                          <Input type="checkbox" />
                          <span className="switch-state"></span>
                        </Label>
                      </div>
                      <p>
                        turn on this setting to whether your contact can see
                        your profile or not.
                      </p>
                    </li>
                    <li>
                      <h5>About</h5>
                      <div className="media-right">
                        <Label className="switch">
                          <Input type="checkbox" />
                          <span className="switch-state"></span>
                        </Label>
                      </div>
                      <p>
                        {" "}
                        <b>Note : </b>turn on this setting to whether your
                        contact can see about status or not.
                      </p>
                    </li>
                    <li>
                      <h5>Status</h5>
                      <div className="media-right">
                        <Label className="switch">
                          <Input type="checkbox" />
                          <span className="switch-state"></span>
                        </Label>
                      </div>
                      <p>
                        {" "}
                        <b>Note : </b>turn on this setting to whether your
                        contact can see your status or not.{" "}
                      </p>
                    </li>
                    <li>
                      <h5>Read receipts</h5>
                      <div className="media-right">
                        <Label className="switch">
                          <Input type="checkbox" />
                          <span className="switch-state"></span>
                        </Label>
                      </div>
                      <p>
                        {" "}
                        <b>Note : </b>If turn off this option you won't be able
                        to see read recipts from contact. read receipts are
                        always sent for group chats.{" "}
                      </p>
                    </li>
                    <li>
                      <h5>Groups</h5>
                      <div className="media-right">
                        <Label className="switch">
                          <Input type="checkbox" />
                          <span className="switch-state"></span>
                        </Label>
                      </div>
                      <p>
                        {" "}
                        <b>Note : </b>turn on this setting to whether your
                        contact can add in groups or not.{" "}
                      </p>
                    </li>
                    <li>
                      <h5>Screen Lock(Require Touch ID)</h5>
                      <div className="media-right">
                        <Label className="switch">
                          <Input type="checkbox" />
                          <span className="switch-state"></span>
                        </Label>
                      </div>
                    </li> */}
                  </ul>
                </div>
              </div>
            </div>
            {/* <div className="card">
              <div
                className="card-header collapsed"
                onClick={() =>
                  setCollapseShow({
                    ...collapseShow,
                    verfication: !collapseShow.verfication,
                    changeNumber: false,
                    accountInfo: false,
                    deleteAccount: false,
                    privacy: false,
                    security: false,
                  })
                }
              >
                <a href="#javascript">
                  Two Step Verification
                  <i className="fa fa-angle-down" />
                </a>
              </div>
              <div
                className={`collapse ${collapseShow.verfication ? "show" : ""}`}
              >
                <div className="card-body">
                  <div className="media">
                    <div className="media-body">
                      <h5>Enable</h5>
                    </div>
                    <div className="media-right">
                      <div className="media-right">
                        <Label className="switch">
                          <Input type="checkbox" />
                          <span className="switch-state" />
                        </Label>
                      </div>
                    </div>
                  </div>
                  <p>
                    {" "}
                    <b>Note : </b>For added security, enable two-step
                    verifiation, which will require a PIN when registering your
                    phone number with Chitchat again.
                  </p>
                </div>
              </div>
            </div> */}
            <div className="card">
              <div
                className="card-header"
                onClick={() =>
                  setCollapseShow({
                    ...collapseShow,
                    changeNumber: !collapseShow.changeNumber,
                    verfication: false,
                    accountInfo: false,
                    deleteAccount: false,
                    privacy: false,
                    security: false,
                  })
                }
              >
                <a href="#javascript">
                  Change Number
                  <i className="fa fa-angle-down" />
                </a>
              </div>
              <div
                className={`collapse ${collapseShow.changeNumber ? "show" : ""
                  }`}
              >
                <div className="card-body change-number">
                  <h5>Your old country code & phone number</h5>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text form-control m-0">
                        +
                      </span>
                    </div>
                    <input
                      className="form-control country-code"
                      type="number"
                      placeholder="01"
                    />
                    <input
                      className="form-control"
                      type="number"
                      placeholder="1234567895"
                    />
                  </div>
                  <h5>Your new country code & phone number</h5>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text form-control m-0">
                        +
                      </span>
                    </div>
                    <input
                      className="form-control country-code"
                      type="number"
                      placeholder="01"
                    />
                    <input
                      className="form-control"
                      type="number"
                      placeholder=""
                    />
                  </div>
                  <div className="text-right">
                    {" "}
                    <a
                      className="btn btn-outline-primary button-effect btn-sm"
                      href="#"
                    >
                      confirm
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {accountType === AccountType.TRAINER ? (
              <React.Fragment>
                <div className="card">
                  <div
                    className="card-header"
                    onClick={() =>
                      setCollapseShow({
                        ...collapseShow,
                        changeNumber: false,
                        hourlyRate: !collapseShow.hourlyRate,
                        workingHours: false,
                        settelBankAccount: false,
                        verfication: false,
                        accountInfo: false,
                        deleteAccount: false,
                        privacy: false,
                        security: false,
                      })
                    }
                  >
                    <a href="#javascript">
                      Update Hourly Rate
                      <i className="fa fa-angle-down" />
                    </a>
                  </div>
                  <div
                    className={`collapse ${collapseShow.hourlyRate ? "show" : ""
                      }`}
                  >
                    <div className="card-body change-number">
                      <UpdateHourlyRateForm
                        userInfo={userInfo}
                        extraInfo={userInfo?.extraInfo || {}}
                        onFormSubmit={(formValue) => {
                          //
                          dispatch(
                            updateProfileAsync({
                              extraInfo: {
                                ...userInfo?.extraInfo,
                                ...formValue,
                              },
                            })
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* ------------Withdraw Wallet amount--------------- */}
                {/* <div className="card">
                  <div
                    className="card-header"
                    onClick={() =>
                      setCollapseShow({
                        ...collapseShow,
                        changeNumber: false,
                        hourlyRate: false,
                        settelBankAccount: !collapseShow.settelBankAccount,                
                        workingHours: false,                
                        verfication: false,
                        accountInfo: false,
                        deleteAccount: false,
                        privacy: false,
                        security: false,
                      })
                    }
                  >
                    <a href="#javascript">
                      Settel in Bank Account
                      <i className="fa fa-angle-down" />
                    </a>
                  </div>
                  <div
                    className={`collapse ${collapseShow.settelBankAccount ? "show" : ""
                      }`}
                  >
                  <div className="card-body change-number">
                      <SettalInBankAccount
                        extraInfo={userInfo?.extraInfo || {}}
                        onFormSubmit={(formValue) => {
                          //
                          // dispatch(
                          //   updateProfileAsync({
                          //     extraInfo: {
                          //       ...userInfo?.extraInfo,
                          //       ...formValue,
                          //     },
                          //   })
                          // );
                          console.log("formValue ===", formValue)
                          requestForSettelment(formValue);
                        }}
                      />
                    </div>
                  </div>
                </div> */}
                {/* ------------Withdraw Wallet amount End--------------- */}
              </React.Fragment>
            ) : null}
          </div>
        </div>
        <div className="media">
          <div className="media-body">
            <h3>Account</h3>
            <h4>Update Your Account Details</h4>
          </div>
          <div className="media-right">
            {" "}
            <a
              className="icon-btn btn-outline-light btn-sm pull-right next"
              href="#"
              onClick={() => setSettingTab("account")}
            >
              {" "}
              <ChevronRight />
            </a>
          </div>
        </div>
      </div>
      {accountType === AccountType.TRAINER ? (
        <div className="setting-block">
          <div
            className={`block ${settingTab === "my-profile" ? "open custom-block-height" : ""
              }`}
            style={{ maxWidth: "95%", paddingBottom: "80px" }}
          >
            <div className="media">
              <div className="media-body">
                <h3>My profile</h3>
              </div>
              <div className="media-right">
                <a
                  className="icon-btn btn-outline-light btn-sm pull-right previous"
                  href="#"
                  onClick={() => setSettingTab("")}
                >
                  {" "}
                  <ChevronLeft />
                </a>
              </div>
            </div>
            {/* for trainer settings form */}
            {settingTab === "my-profile" && (
              <UpdateSettingProfileForm
                userInfo={userInfo}
                extraInfo={userInfo?.extraInfo || {}}
                onFormSubmit={(formValue) => {
                  //
                  dispatch(
                    updateProfileAsync({
                      extraInfo: { ...userInfo?.extraInfo, ...formValue },
                    })
                  );
                }}
              />
            )}
          </div>
          <div className="media">
            <div className="media-body">
              <h3>My profile</h3>
              <h4>Update profile settings</h4>
            </div>
            <div className="media-right">
              {" "}
              <a
                className="icon-btn btn-outline-light btn-sm pull-right next"
                href="#"
                onClick={() => setSettingTab("my-profile")}
              >
                {" "}
                <ChevronRight />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      {/* <div className='setting-block'>
        <div className={`block ${settingTab === 'chat' ? 'open' : ''}`}>
          <div className='media'>
            <div className='media-body'>
              <h3>Chat</h3>
            </div>
            <div className='media-right'>
              <a
                className='icon-btn btn-outline-light btn-sm pull-right previous'
                href='#'
                onClick={() => setSettingTab('')}
              >
                {' '}
                <ChevronLeft />
              </a>
            </div>
          </div>
          <ul className='help'>
            <li>
              <h5>Chat Backup</h5>
              <ul className='switch-list'>
                <li>
                  <Label className="switch-green">
                    <Input type="checkbox" defaultChecked /><span className="switch-state" ></span>
                  </Label>
                  <Label className='label-right'>Auto Backup</Label>
                </li>
                <li className='pt-0'>
                  <Label className="switch-green">
                    <Input type="checkbox" /><span className="switch-state" ></span>
                  </Label>
                  <Label className='label-right'>Include document</Label>
                </li>
                <li className='pt-0'>
                  <Label className="switch-green">
                    <Input type="checkbox" /><span className="switch-state" ></span>
                  </Label>
                  <Label className='label-right'>Include Videos</Label>
                </li>
              </ul>
            </li>
            <li>
              <h5>Chat wallpaper</h5>
              <ul className='wallpaper'>
                <li
                  onClick={(e) => setBackgroundWallpaper(e, 1)}
                  style={{
                    backgroundImage: `url('/assets/images/wallpaper/2.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'block',
                  }}
                >
                  <img
                    className='bg-img'
                    src='/assets/images/wallpaper/2.jpg'
                    alt='Avatar'
                    style={{ display: 'none' }}
                  />
                </li>
                <li
                  onClick={(e) => setBackgroundWallpaper(e, 2)}
                  style={{
                    backgroundImage: `url('/assets/images/wallpaper/1.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'block',
                  }}
                >
                  <img
                    className='bg-img'
                    src='/assets/images/wallpaper/1.jpg'
                    alt='Avatar'
                    style={{ display: 'none' }}
                  />
                </li>
                <li
                  onClick={(e) => setBackgroundWallpaper(e, 3)}
                  style={{
                    backgroundImage: `url('/assets/images/wallpaper/3.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'block',
                  }}
                >
                  <img
                    className='bg-img'
                    src='/assets/images/wallpaper/3.jpg'
                    alt='Avatar'
                    style={{ display: 'none' }}
                  />
                </li>
                <li
                  onClick={(e) => setBackgroundWallpaper(e, 4)}
                  style={{
                    backgroundImage: `url('/assets/images/wallpaper/4.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'block',
                  }}
                >
                  <img
                    className='bg-img'
                    src='/assets/images/wallpaper/4.jpg'
                    alt='Avatar'
                    style={{ display: 'none' }}
                  />
                </li>
                <li
                  onClick={(e) => setBackgroundWallpaper(e, 5)}
                  style={{
                    backgroundImage: `url('/assets/images/wallpaper/5.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'block',
                  }}
                >
                  <img
                    className='bg-img'
                    src='/assets/images/wallpaper/5.jpg'
                    alt='Avatar'
                    style={{ display: 'none' }}
                  />
                </li>
                <li
                  onClick={(e) => setBackgroundWallpaper(e, 6)}
                  style={{
                    backgroundImage: `url('/assets/images/wallpaper/6.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'block',
                  }}
                >
                  <img
                    className='bg-img'
                    src='/assets/images/wallpaper/6.jpg'
                    alt='Avatar'
                    style={{ display: 'none' }}
                  />
                </li>
              </ul>
            </li>
            <li>
              <h5>
                {' '}
                <a href='#'>Archive all chat</a>
              </h5>
            </li>
            <li>
              <h5>
                {' '}
                <a href='#'> Clear all chats</a>
              </h5>
            </li>
            <li>
              <h5>
                {' '}
                <a className='font-danger' href='#'>
                  Delete all chats
                </a>
              </h5>
            </li>
          </ul>
        </div>
        <div className='media'>
          <div className='media-body'>
            <h3>Chat</h3>
            <h4>Control Your Chat Backup</h4>
          </div>
          <div className='media-right'>
            {' '}
            <a
              className='icon-btn btn-outline-light btn-sm pull-right next'
              href='#'
              onClick={() => setSettingTab('chat')}
            >
              {' '}
              <ChevronRight />
            </a>
          </div>
        </div>
      </div> */}
      {!settingMenuFilterSection.includes(settingTab) &&
        accountType === AccountType.TRAINER ? (
        <>
          <div className="setting-block">
            <div
              className={`block ${settingTab === "integratin" ? "open custom-block-height" : ""
                }`}
              style={{ maxWidth: "95%" }}
            >
              <div className="media">
                <div className="media-body">
                  <h3>Integration</h3>
                </div>
                <div className="media-right">
                  {" "}
                  <a
                    className="icon-btn btn-outline-light btn-sm pull-right previous"
                    href="#"
                    onClick={() => setSettingTab("")}
                  >
                    <ChevronLeft />
                  </a>
                  <div
                    className="icon-btn btn-outline-light btn-sm pull-right edit-btn pointer"
                    // href="#"
                    onClick={() => {
                      setIsSocialFormOpen(!isSocialFormOpen);
                    }}
                  >
                    {" "}
                    {isSocialFormOpen ? <X /> : <Edit />}
                  </div>
                </div>
              </div>
              <Formik
                innerRef={socialFormRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(value) => {
                  console.log(value);
                  const payload = {
                    ...userInfo?.extraInfo,
                    social_media_links: value,
                  };
                  dispatch(updateProfileAsync({ extraInfo: { ...payload } }));
                }}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleSubmit,
                  handleBlur,
                  setValues,
                  isValid,
                }) => (
                  <Form onSubmit={handleSubmit}>
                    {console.log("Form Errors:", errors)}
                    {console.log("Form Values:", values)}
                    {console.log("Form is Valid:", isValid)}
                    <ul className="integratin">
                      <li>
                        <div className="media">
                          <div className="media-left">
                            <a
                              className="fb"
                              // href={
                              //   values.fb || "https://www.facebook.com/login"
                              // }
                              target="_blank"
                              style={{ cursor: "text" }}
                              href={null}
                            >
                              <i className="fa fa-facebook mr-1" />
                              <h5>Facebook </h5>
                            </a>
                          </div>

                          {/* <div className="media-right">
                        <div
                          className="profile"
                          style={{
                            backgroundImage: `url('assets/images/contact/1.jpg')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'block',
                          }}
                        >
                          <img
                            className="bg-img"
                            src="/assets/images/contact/1.jpg"
                            alt="Avatar"
                            style={{ display: 'none' }}
                          />
                        </div>
                      </div> */}
                        </div>
                        {isSocialFormOpen ? (
                          <>
                            <div className="row">
                              <div className="col-6">
                                <div className="form-group">
                                  <input
                                    onChange={(event) => {
                                      const { value } = event.target;
                                      setValues({ ...values, fb: value });
                                    }}
                                    value={values.fb}
                                    placeholder="Facebook URL"
                                    type="url"
                                    onBlur={handleBlur}
                                    className={`form-control mt-1`}
                                    name="fb"
                                    id="fb"
                                  ></input>
                                </div>
                              </div>
                            </div>
                            <div>
                              <HandleErrorLabel
                                isError={errors.fb}
                                isTouched={
                                  touched.fb && errors.fb ? true : false
                                }
                              />
                            </div>
                          </>
                        ) : (
                          <>{values.fb || "Not available"}</>
                        )}
                      </li>
                      <li>
                        <div className="media">
                          <div className="media-left">
                            <a
                              className="insta"
                              // href={
                              //   values.instagram ||
                              //   "https://www.instagram.com/accounts/login/?hl=en"
                              // }
                              style={{ cursor: "text" }}
                              href={null}
                              target="_blank"
                            >
                              <i className="fa fa-instagram mr-1" />
                              <h5>instagram</h5>
                            </a>
                          </div>
                          {/* <div className="media-right">
                        <div
                          className="profile"
                          style={{
                            backgroundImage: `url('assets/images/contact/2.jpg')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'block',
                          }}
                        >
                          <img
                            className="bg-img"
                            src="/assets/images/contact/2.jpg"
                            alt="Avatar"
                            style={{ display: 'none' }}
                          />
                        </div>
                      </div> */}
                        </div>
                        {isSocialFormOpen ? (
                          <>
                            <div className="row">
                              <div className="col-6">
                                <div className="form-group">
                                  <input
                                    onChange={(event) => {
                                      const { value } = event.target;
                                      setValues({
                                        ...values,
                                        instagram: value,
                                      });
                                    }}
                                    value={values.instagram}
                                    placeholder="Instagram URL"
                                    type="url"
                                    onBlur={handleBlur}
                                    className="form-control mt-1"
                                    name="instagram"
                                    id="instagram"
                                  ></input>
                                </div>
                              </div>
                            </div>
                            <div>
                              <HandleErrorLabel
                                isError={errors.instagram}
                                isTouched={
                                  touched.instagram && errors.instagram
                                    ? true
                                    : false
                                }
                              />
                            </div>
                          </>
                        ) : (
                          <>{values.instagram || "Not available"}</>
                        )}
                      </li>
                      <li>
                        <div className="media">
                          <div className="media-left">
                            <a
                              className="twi"
                              // href={
                              //   values.twitter || "https://twitter.com/login"
                              // }
                              style={{ cursor: "text" }}
                              href={null}
                              target="_blank"
                            >
                              <i className="fa fa-twitter mr-1" />
                              <h5>twitter </h5>
                            </a>
                          </div>
                          {/* <div className="media-right">
                        <div
                          className="profile"
                          style={{
                            backgroundImage: `url('assets/images/contact/3.jpg')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'block',
                          }}
                        >
                          <img
                            className="bg-img"
                            src="/assets/images/contact/3.jpg"
                            alt="Avatar"
                            style={{ display: 'none' }}
                          />
                        </div>
                      </div> */}
                        </div>
                        {isSocialFormOpen ? (
                          <>
                            <div className="row">
                              <div className="col-6">
                                <div className="form-group">
                                  <input
                                    onChange={(event) => {
                                      const { value } = event.target;
                                      setValues({ ...values, twitter: value });
                                    }}
                                    value={values.twitter}
                                    placeholder="Twitter URL"
                                    type="url"
                                    onBlur={handleBlur}
                                    className="form-control mt-1"
                                    name="twitter"
                                    id="twitter"
                                  ></input>
                                </div>
                              </div>
                            </div>
                            <div>
                              <HandleErrorLabel
                                isError={errors.twitter}
                                isTouched={
                                  touched.twitter && errors.twitter
                                    ? true
                                    : false
                                }
                              />
                            </div>
                          </>
                        ) : (
                          <>{values.twitter || "Not available"}</>
                        )}
                      </li>
                      <li>
                        <div className="media">
                          <div className="media-left">
                            <a
                              className="ggl"
                              style={{ cursor: "text" }}
                              // href={
                              //   values.google ||
                              //   "https://accounts.google.com/signin/v2/identifier?service=mail&amp;passive=true&amp;rm=false&amp;continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&amp;ss=1&amp;scc=1&amp;ltmpl=default&amp;ltmplcache=2&amp;emr=1&amp;osid=1&amp;flowName=GlifWebSignIn&amp;flowEntry=ServiceLogin"
                              // }
                              href={null}
                              target="_blank"
                            >
                              <i className="fa fa-linkedin mr-1" />
                              <h5>Linkedin</h5>
                            </a>
                          </div>
                          {/* <div className="media-right">
                        <div
                          className="profile"
                          style={{
                            backgroundImage: `url('assets/images/contact/2.jpg')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'block',
                          }}
                        >
                          <img
                            className="bg-img"
                            src="/assets/images/contact/2.jpg"
                            alt="Avatar"
                            style={{ display: 'none' }}
                          />
                        </div>
                      </div> */}
                        </div>
                        {isSocialFormOpen ? (
                          <>
                            <div className="row">
                              <div className="col-6">
                                <div className="form-group">
                                  <input
                                    onChange={(event) => {
                                      const { value } = event.target;
                                      setValues({ ...values, google: value });
                                    }}
                                    value={values.google}
                                    placeholder="Linkedin URL"
                                    type="url"
                                    onBlur={handleBlur}
                                    className="form-control mt-1"
                                    name="google"
                                    id="google"
                                  ></input>
                                </div>
                              </div>
                            </div>
                            <div>
                              <HandleErrorLabel
                                isError={errors.google}
                                isTouched={
                                  touched.google && errors.google ? true : false
                                }
                              />
                            </div>
                          </>
                        ) : (
                          <>{values.google || "Not available"}</>
                        )}
                      </li>
                      <li>
                        <div className="media">
                          <div className="media-left">
                            <a
                              className="slc"
                              style={{ cursor: "text" }}
                              href={null}
                            >
                              {values.profile_image_url ? (
                                <img
                                  style={{ width: "19px" }}
                                  src={
                                    profile_image_url ||
                                    values.profile_image_url
                                  }
                                  className="mr-1"
                                  alt="profile_image_url"
                                />
                              ) : (
                                <i className="fa fa-globe mr-1" />
                              )}
                              <h5>My website</h5>
                            </a>
                          </div>
                          
                          {/* <div className="media-right">
                        <div className="profile">
                          <a href="https://slack.com/get-started#/" target="_blank">
                            <PlusCircle />
                          </a>
                        </div>
                      </div> */}
                        </div>
                        {isSocialFormOpen ? (
                          <>
                            <div className="row">
                              <div className="col-6">
                                <div className="form-group">
                                  <input
                                    onChange={(event) => {
                                      const { value } = event.target;
                                      setValues({ ...values, slack: value });
                                    }}
                                    value={values.slack}
                                    placeholder="Website URL"
                                    type="url"
                                    onBlur={handleBlur}
                                    className="form-control mt-1"
                                    name="slack"
                                    id="slack"
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="row">
                                <div className="col-6">
                                  <HandleErrorLabel
                                    isError={errors.slack}
                                    isTouched={
                                      touched.slack && errors.slack
                                        ? true
                                        : false
                                    }
                                  />
                                </div>
                                <div className="col-6">
                                  <HandleErrorLabel
                                    isError={errors.profile_image_url}
                                    isTouched={
                                      touched.profile_image_url &&
                                        errors.profile_image_url
                                        ? true
                                        : false
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>{values.slack || "Not available"}</>
                        )}
                        {isSocialFormOpen ? (
                          <div className="my-4">
                            <div className="d-flex  mt-4">
                              <button
                                type="submit"
                                disabled={
                                  // Object.keys(errors).length
                                  //   ? true
                                  //   : false
                                  !isValid
                                }
                                className="btn btn-primary"
                              >
                                Save details
                              </button>
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                      </li>
                    </ul>
                  </Form>
                )}
              </Formik>
            </div>
            <div className="media">
              <div className="media-body">
                <h3>Integration</h3>
                <h4>Sync Your Other Social Account</h4>
              </div>
              <div className="media-right">
                {" "}
                <a
                  className="icon-btn btn-outline-light btn-sm pull-right next"
                  href="#"
                  onClick={() => setSettingTab("integratin")}
                >
                  {" "}
                  <ChevronRight />
                </a>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
      {!settingMenuFilterSection.includes(settingTab) && (
        <div className="setting-block">
          <div
            className={`block ${settingTab === "help" ? "open custom-block-height" : ""
              }`}
            style={{ maxWidth: "95%" }}
          >
            <div className="media">
              <div className="media-body">
                <h3>Help</h3>
              </div>
              <div className="media-right">
                {" "}
                <a
                  className="icon-btn btn-outline-light btn-sm pull-right previous"
                  href="#"
                  onClick={() => setSettingTab("")}
                >
                  {" "}
                  <ChevronLeft />
                </a>
              </div>
            </div>
            <ul className="help">
              <li>
                <h5>
                  {" "}
                  <a href="#">FAQ</a>
                </h5>
              </li>
              <li>
                <h5>
                  {" "}
                  <a href="#"> Contact Us</a>
                </h5>
              </li>
              <li>
                <h5>
                  {" "}
                  <a href="#">Terms and Privacy Policy</a>
                </h5>
              </li>
              {/* <li>
              <h5>
                {" "}
                <a href="#">Licenses</a>
              </h5>
            </li> */}
              {/* <li>
              <h5>
                {" "}
                <a href="#">2019 - 20 Powered by Pixelstrap</a>
              </h5>
            </li> */}
            </ul>
          </div>
          <div className="media">
            <div className="media-body">
              <h3>Help</h3>
              <h4>How can we help you?</h4>
            </div>
            <div className="media-right">
              {" "}
              <a
                className="icon-btn btn-outline-light btn-sm pull-right next"
                href="#"
                onClick={() => setSettingTab("help")}
              >
                {" "}
                <ChevronRight />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingSection;
