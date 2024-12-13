import React, { useEffect, useState } from "react";
import Accordion from "../../common/accordion";
import DatePicker from "react-datepicker";
import { Star, X, ArrowLeft } from "react-feather";
import Carousel from "../../common/carousel";
import {
  AccountType,
  FILTER_DEFAULT_CHECKED_ID,
  FILTER_TIME,
  Message,
  TRAINER_AMOUNT_USD,
  TRAINER_MEETING_TIME,
  trainerFilterOptions,
  weekDays,
} from "../../common/constants";
import { useAppSelector } from "../../store";
import {
  getTraineeWithSlotsAsync,
  traineeState,
} from "../trainee/trainee.slice";
import SocialMediaIcons from "../../common/socialMediaIcons";
import { Utils } from "../../../utils/utils";
import ImageVideoThumbnailCarousel from "../../common/imageVideoThumbnailCarousel";
import moment from "moment";
import { Input, Label } from "reactstrap";
import { useDispatch } from "react-redux";
import { commonAction } from "../../common/common.slice";
import ReviewCard from "../../common/reviewCard";
// import TrainerSessionInfo from "./TrainerSessionInfo";
import Ratings from "./Ratings";
import { authState } from "../auth/auth.slice";


export const TrainerDetails = ({
  onClose,
  element,
  trainerInfo,
  selectTrainer,
  selectOption,
  searchQuery,
  categoryList,
  isUserOnline = false
}) => {
  const dispatch = useDispatch();
  const { getTraineeSlots } = useAppSelector(traineeState);
  const { onlineUsers } = useAppSelector(authState);
  const { handleTrainerAvailable } = commonAction;
  const [accordion, setAccordion] = useState({});
  const [filterParams, setFilterParams] = useState({
    date: null,
    day: null,
    time: null,
  });
  const [activeAccordion, setActiveAccordion] = useState({});
  const [trainerDetails, setTrainerDetails] = useState({
    _id: null,
    select_trainer: false,
  });
  const [accordionsData, setAccordionsData] = useState({
    teaching_style: null,
    credentials_and_affiliations: null,
    curriculum: null,
  });

  // TODO: showing dummy records, will replace it with actual records
  useEffect(() => {
    if (trainerInfo && trainerInfo.extraInfo) {
      setAccordion(trainerInfo.extraInfo);
    }

    if (trainerInfo && !trainerInfo.isCategory) {
      setTrainerDetails((prev) => ({
        ...prev,
        _id: (trainerInfo && trainerInfo.id) || trainerInfo?._id,
        select_trainer: true,
      }));
      selectTrainer(trainerInfo && trainerInfo._id);
    }
  }, []);

  useEffect(() => {
    const searchTerm = trainerInfo ? trainerInfo.name || trainerInfo?.fullname : searchQuery;
    if (filterParams.day || filterParams.time) {
      const filterPayload = {
        time: filterParams.time,
        day: filterParams.day,
        search: searchTerm,
      };
      dispatch(getTraineeWithSlotsAsync(filterPayload));
      console.log(`searchQuery --- `, searchTerm, filterParams);
    }
  }, [filterParams]);

  const accordionData = [
    {
      id: 1,
      label: "Teaching Style",
      value: accordion.teaching_style || accordionsData.teaching_style,
    },
    {
      id: 2,
      label: "Credentials & Affiliations",
      value:
        accordion.credentials_and_affiliations ||
        accordionsData.credentials_and_affiliations,
    },
    {
      id: 3,
      label: "Curriculum",
      value: accordion.curriculum || accordionsData.curriculum,
    },
  ];
  return (
    <React.Fragment>
      {trainerInfo === null ? (
        <div className="media-body media-body text-right">
          <div className="mr-4 mt-4">
            <X
              onClick={onClose}
              className="close custom-close-icon"
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>
      ) : (
        <div
          className={`${(trainerInfo?.isCategory &&
            !trainerDetails?.select_trainer &&
            "media-body media-body text-right") ||
            (!trainerInfo?.isCategory && "media-body media-body text-right")
            }`}
        >
          <div className="mr-2 mt-1">
            {!trainerInfo?.isCategory ? (
              <X
                onClick={onClose}
                className="close custom-close-icon"
                style={{ cursor: "pointer" }}
              />
            ) : !trainerDetails?.select_trainer ? (
              <X
                onClick={onClose}
                style={{ cursor: "pointer" }}
                className="custom-close-icon"
              />
            ) : (
              <ArrowLeft
                style={{ cursor: "pointer" }}
                className="custom-arrow-icon"
                onClick={() => {
                  setTrainerDetails((prev) => ({
                    ...prev,
                    _id: null,
                    select_trainer: false,
                    fullname: null,
                  }));
                }}
              />
            )}
          </div>
        </div>
      )}
      <div className={`custom-trainer-scroll `+isUserOnline&&`recent-user`} style={{ marginTop: "24px" }}>
        {trainerDetails?.select_trainer ? (
          <TrainerSessionInfo
            accordionData={accordionData}
            activeAccordion={activeAccordion}
            setActiveAccordion={setActiveAccordion}
            element={element}
            getTraineeSlots={getTraineeSlots}
            trainerDetails={trainerDetails}
            setAccordionsData={setAccordionsData}
            trainerInfo={trainerInfo}
            onlineUsers={onlineUsers}
            isUserOnline={isUserOnline}
          />
        ) : (
          <SelectedCategory
            getTraineeSlots={getTraineeSlots}
            trainerInfo={trainerInfo}
            setTrainerDetails={setTrainerDetails}
            selectTrainer={selectTrainer}
            searchQuery={searchQuery}
            setFilterParams={setFilterParams}
            filterParams={filterParams}
            dispatch={dispatch}
            handleTrainerAvailable={handleTrainerAvailable}
          />
        )}
      </div>
    </React.Fragment>
  );
};

const SelectedCategory = ({
  getTraineeSlots,
  trainerInfo,
  setTrainerDetails,
  selectTrainer,
  searchQuery,
  setFilterParams,
  filterParams,
  dispatch,
  handleTrainerAvailable,
}) => {
  const navigateToDetails = (data) => {
    setTrainerDetails((prev) => ({
      ...prev,
      _id: data && data._id,
      select_trainer: true,
    }));
    dispatch(handleTrainerAvailable(null));
    selectTrainer(data && data._id, data && data.trainer_id, data && data);
  };
  return (
    <div className="row">
      <div className="col-12 col-lg-2 col-md-3 col-sm-3">
        <div className="d-flex justify-content-between">
          <h3>Filters </h3>
        </div>
        <hr className="hr" />
        <div className="d-flex">
          <h4 className="border border-secondary rounded-pill p-10 d-flex justify-content-center align-items-center mb-4">
            {trainerInfo ? trainerInfo.name : searchQuery}
          </h4>
        </div>
        <p>Select as many filters as you would like.</p>
        <div>
          <b>Day of the week</b>
          <div>
            <div className="mt-2">
              <DatePicker
                placeholderText="Select Day"
                minDate={moment().toDate()}
                onChange={(date) => {
                  const day = new Date(date).getDay();
                  setFilterParams({
                    ...filterParams,
                    date,
                    day: weekDays[day - 1],
                  });
                }}
                selected={filterParams.date}
                // ref={null}
                customInput={<Input />}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="mt-3">
            <b> Time of Day</b>
          </div>
          <div className="mt-3 pl-3">
            {FILTER_TIME.map((time, index) => {
              return (
                <div className="my-2" key={`time-of-day-${index}-${time.id}`}>
                  <Label check>
                    <Input
                      defaultChecked={time.id === FILTER_DEFAULT_CHECKED_ID}
                      onChange={(event) => {
                        console.log(`event --- `, event);
                        const pickedId = event.target.value;
                        const selectedLog = FILTER_TIME.find(
                          (time) => time.id === +pickedId
                        );

                        if (selectedLog && selectedLog.time) {
                          setFilterParams({
                            ...filterParams,
                            time: selectedLog.time,
                          });
                        }
                      }}
                      type="radio"
                      value={time.id}
                      defaultValue={1}
                      name="time-of-day"
                    />
                    <span>{time.label}</span>
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div
        className="col-12 col-lg-px-5 col-lg-10 col-md-9 col-sm-9"
        style={{ height: "89vh" }}
      >
        {!getTraineeSlots.length ? (
          <div
            className="text-center container mw-100 border border-secondary p-30 mb-4"
            style={{ borderRadius: "20px" }}
          >
            No trainer found
          </div>
        ) : (
          getTraineeSlots.map((data, index) => {
            // console.log(data, "selected user data");
            const textTruncate = false;
            return (
              <div
                className="card custom-card mb-4"
                key={`trainers_${index}`}
                style={{
                  borderRadius: "20px",
                }}
              >
                <div className="card-body" key={index}>
                  <div className="row">
                    <div className="col-sm-3 col-md-3 col-lg-2 col-xl-2">
                      <img
                        src={
                          data?.profile_picture
                            ? Utils?.getImageUrlOfS3(data?.profile_picture)
                            : "/assets/images/avtar/statusMenuIcon.jpeg"
                        }
                        className="cardimg"
                        style={{ borderRadius: "15px" }}
                        alt="profile-picture"
                        onClick={() => navigateToDetails(data)}
                      />
                    </div>
                    <div className="col-sm-6 col-md-6 co-lg-8 col-xl-8  ">
                      <h3
                        className="card-title pointer underline m-2"
                        onClick={() => navigateToDetails(data)}
                      >
                        {data ? data.fullname : ""}
                      </h3>
                      <p
                        className="badge badge-pill badge-primary mb-2 p-2"
                        style={{ fontSize: "15px" }}
                      >
                        {`$${data?.extraInfo?.hourly_rate || TRAINER_AMOUNT_USD
                          }.00`}
                        {`/ ${TRAINER_MEETING_TIME}`}
                      </p>
                      <h4
                        className={`${textTruncate ? "text-truncate" : ""}`}
                        style={{ marginBottom: "0px" }}
                      >
                        {data && data.extraInfo
                          ? Utils.truncateText(data.extraInfo.about, 200)
                          : Message.notAvailableDescription}
                      </h4>
                      <div>
                        {data &&
                          data?.extraInfo &&
                          data?.extraInfo?.social_media_links ? (
                          <SocialMediaIcons
                            profileImageURL={
                              data &&
                              data.extraInfo &&
                              data.extraInfo.social_media_links &&
                              Utils?.getImageUrlOfS3(
                                data.extraInfo?.social_media_links
                                  ?.profile_image_url
                              )
                            }
                            social_media_links={
                              data &&
                              data.extraInfo &&
                              data.extraInfo.social_media_links
                            }
                          />
                        ) : null}
                      </div>
                    </div>
                    <div className="col-sm-3 col-md-3 col-lg-2 col-xl-2  rating">
                      {/* {showRatings(data.trainer_ratings, "d-flex ")} */}
                      <Ratings
                        ratings={data.trainer_ratings}
                        extraClasses={"d-flex"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// const showRatings = (ratings, extraClasses = "") => {
//   const { ratingRatio, totalRating } = Utils.getRatings(ratings);
//   return (
//     <div>
//       <div className={extraClasses}>
//         <Star color="#FFC436" size={28} className="star-container star-svg" />
//         <p className="ml-1 mt-1 mr-1 font-weight-light">{ratingRatio || 0}</p>
//         <p className="mt-1">({totalRating || 0})</p>
//       </div>
//     </div>
//   );
// };

const TrainerSessionInfo = ({
  accordionData,
  activeAccordion,
  setActiveAccordion,
  element,
  getTraineeSlots,
  trainerDetails,
  trainerInfo,
  setAccordionsData,
  onlineUsers,
  isUserOnline
}) => {
  const findTrainerDetails = () => {
    const findByTrainerId = getTraineeSlots.find(
      (trainer) => trainer && trainer._id === trainerDetails._id
    );
    return findByTrainerId;
  };
  const trainer = findTrainerDetails() || trainerInfo;
  console.log(trainer, trainer?.fullName, "trainer");

  useEffect(() => {
    if (trainer && trainer.extraInfo) {
      setAccordionsData((prev) => ({
        prev,
        teaching_style: trainer?.extraInfo?.teaching_style,
        credentials_and_affiliations:
          trainer?.extraInfo?.credentials_and_affiliations,
        curriculum: trainer?.extraInfo?.curriculum,
      }));
    } else {
      setAccordionsData((prev) => ({
        prev,
        teaching_style: null,
        credentials_and_affiliations: null,
        curriculum: null,
      }));
    }
  }, [trainer]);
  const revampedMedia =
    trainer &&
    trainer?.extraInfo &&
    trainer?.extraInfo?.media?.map((data, index) => {
      const { url, description, title, type, thumbnail = "" } = data;
      return {
        original: url,
        thumbnail: thumbnail,
        description,
        title,
        type,
      };
    });
  const hasRatings = Array.isArray(trainer?.trainer_ratings)
    ? trainer.trainer_ratings.some(({ ratings }) => ratings?.trainee)
    : null;

  return (
    <div
      className="row"
      style={{
        margin: "0px",
        padding: "10px",
        height: !AccountType.TRAINEE || (!AccountType.TRAINER && "92vh"),
        overflowX: !AccountType.TRAINEE || (!AccountType.TRAINER && "auto"),
      }}
      id="trainerinfo"
    >
      <div className=" col-lg-6">
        <div className="d-flex justify-content-start" style={{ gap: "20px" }}>
          <div>
            <img
              src={
                trainer && trainer.profile_picture
                  ? Utils?.getImageUrlOfS3(trainer.profile_picture)
                  : "/assets/images/avtar/statusMenuIcon.jpeg"
              }
              width={100}
              style={{
                // marginTop: "15px",
                minHeight: "120px",
                minWidth: "110px",
              }}
              className="img-fluid rounded profile_picture"
              alt="profile-picture"
            />
          </div>
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center'
              }}>
              <h2>
                {trainer && trainer ? trainer.fullname || trainer?.fullName : null}
              </h2>
              {isUserOnline || (onlineUsers &&
                Utils.isTrainerOnline(trainer?._id, onlineUsers)) ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginLeft: '5px'
                  }}>

                  <div
                    className="dot-btn dot-success grow"
                    style={{
                      marginLeft: "13px",
                      marginTop: "-16px",
                    }}
                  ></div>
                  <span className="text-success">Online Now</span>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginLeft: '5px'
                  }}>
                  <div
                    className="dot-btn dot-danger grow"
                    style={{
                      marginLeft: "13px",
                      marginTop: "-16px",
                    }}
                  ></div>
                  <span className="text-danger" >Offline</span>
                </div>
              )}
            </div>
            <h3 className="mt-2">
              Hourly Rate: $
              {trainer?.extraInfo?.hourly_rate || TRAINER_AMOUNT_USD}
            </h3>
            {/* {showRatings(
              trainer && trainer?.trainer_ratings,
              "mt-3 mb-3 d-flex"
            )} */}
            <Ratings
              ratings={trainer && trainer?.trainer_ratings}
              extraClasses={"d-flex"}
            />
            {trainer &&
              trainer?.extraInfo &&
              trainer?.extraInfo?.media &&
              trainer?.extraInfo?.social_media_links ? (
              <SocialMediaIcons
                profileImageURL={
                  trainer &&
                  trainer?.extraInfo &&
                  trainer?.extraInfo?.social_media_links &&
                  Utils?.getImageUrlOfS3(
                    trainer?.extraInfo?.social_media_links?.profile_image_url
                  )
                }
                social_media_links={
                  trainer &&
                  trainer?.extraInfo &&
                  trainer?.extraInfo?.social_media_links
                }
                isvisible={false}
              />
            ) : null}
          </div>

        </div>

        <div className="mt-2">
          <h2 className=" tag-name booking-text text-dark">Book session</h2>
          <div className="mt-1 text-dark">{element}</div>
        </div>



        {trainer && trainer.extraInfo && trainer.extraInfo.about && <div>
          <h4 className=" my-1 tag-name booking-text text-dark">About</h4>
          <p className="mt-3  ml-1 text-start text-dark">
            {trainer && trainer.extraInfo && trainer.extraInfo.about}
          </p>
        </div>}

        {accordionData.length
          ? accordionData.map((data, index) => {
            return (
              <Accordion key={`accordion_${index}`} className="mb-5 mt-2">
                <Accordion.Item>
                  <Accordion.Header
                    index={index}
                    activeAccordion={activeAccordion}
                    onAClick={() => {
                      if (activeAccordion[index]) {
                        delete activeAccordion[index];
                      } else if (!activeAccordion[index]) {
                        activeAccordion[index] = true;
                      } else {
                        activeAccordion[index] = !activeAccordion[index];
                      }
                      setActiveAccordion(activeAccordion);
                    }}
                  >
                    {data.label}
                  </Accordion.Header>
                  <Accordion.Body>
                    {!data.value ? Message.notFound : data.value}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            );
          })
          : Message.notFound}
      </div>
      <div className=" col-lg-6 px-5">
        {/* <h2 className="ml-n1 tag-name booking-text">Book session</h2>
        <div className="mt-3">{element}</div> */}
        {/* {hasRatings && (
          <div>
            <h2 className="mb-3 booking-text  tag-name">Reviews</h2>
            <div className="ml-lg-n4">
              <ReviewCard trainer={trainer} />
            </div>
          </div>
        )} */}

        <h2 className="mb-4 tag-name booking-text">Featured content </h2>
        {revampedMedia && revampedMedia?.length ? (
          <ImageVideoThumbnailCarousel
            media={revampedMedia}
            originalMedia={
              trainer && trainer?.extraInfo && trainer?.extraInfo?.media
            }
          />
        ) : (
          <div className="no-media-found">{Message.noMediaFound}</div>
        )}

        {hasRatings && (
          <div>
            <h2 className="mb-3 booking-text  tag-name">Reviews</h2>
            <div className="ml-lg-n4">
              <ReviewCard trainer={trainer} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
