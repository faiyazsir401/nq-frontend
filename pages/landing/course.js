import React, { useEffect, useRef, useState } from "react";
import { Courses, CourseItems } from "../../app/common/constants";
import { ChevronRight, Filter, Circle, Star } from "react-feather";
import { LABELS } from "../../utils/constant";
import { fetchAllLatestOnlineUsers } from "../../app/components/auth/auth.api";
import { Utils } from "../../utils/utils";
import { TrainerDetails } from "../../app/components/trainer/trainerDetails";
import BookingTable from "../../app/components/trainee/scheduleTraining/BookingTable";
import "../../app/components/trainee/scheduleTraining/index.scss";
import { Button, Card, CardBody, CardText, CardTitle } from "reactstrap";
import "./landing.css";
import { getTraineeWithSlotsAsync } from "../../app/components/trainee/trainee.slice";
import { useAppDispatch } from "../../app/store";
import { useMediaQuery } from "usehooks-ts";
import Modal from "../../app/common/modal";
const arrOfDemoImg = [
  "/assets/images/Almer.jpeg",
  "/assets/images/Edolie.jpeg",
  "/assets/images/Clovis.jpeg",
  "/assets/images/Daralis.jpeg",
  "/assets/images/Ansley.jpeg",
  "/assets/images/Benton.jpeg",
  "/assets/images/Dwennon.jpeg",
  "/assets/images/Edward.jpeg",
];

const Course = (masterRecords) => {
  const dispatch = useAppDispatch();
  const [tabletView, setTableView] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [activeTrainer, setActiveTrainer] = useState([]);
  const [getParams, setParams] = useState("");
  const [query, setQuery] = useState("");
  const [trainer, setTrainer] = useState({ trainer_id: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState({
    id: null,
    trainer_id: null,
    data: {},
  });
  const [trainerInfo, setTrainerInfo] = useState({
    userInfo: null,
    selected_category: null,
  });
  const [categoryList, setCategoryList] = useState([]);
  const isMobileScreen = useMediaQuery("(max-width:1000px)");
  useEffect(() => {
    getAllLatestActiveTrainer();
    const updateTableView = () => {
      const isTablet = window.innerWidth === 1180 && window.innerHeight === 820;
      setTableView(isTablet);
    };

    // Initial update
    updateTableView();

    // Listen to window resize events
    window.addEventListener("resize", updateTableView);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", updateTableView);
    };
  }, []);

  const getAllLatestActiveTrainer = async () => {
    const response = await fetchAllLatestOnlineUsers();

    if (response.code === 200) {
      setActiveTrainer(response.result);
    }
  };

  useEffect(() => {
    if (getParams.search) {
      dispatch(getTraineeWithSlotsAsync(getParams));
    }
  }, [getParams]);

  const showRatings = (ratings, extraClasses = "") => {
    console.log(ratings, "ratings");
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

  console.log("getAllLatestActiveTrainer =====> activeTrainer", activeTrainer);

  const sliderRef = useRef(null);

  // Custom Slider Handlers
  const slideToNext = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: sliderRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const slideToPrev = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -sliderRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <React.Fragment>
      <div
        className="container recent-trainers"
        style={{
          position: "relative",
        }}
      >
        <div className="col-11 ml-2">
          <div className="dot-btn dot-success mt-4"></div>
          <h3 className="ml-1  text-uppercase mb-1 ">
            {" "}
            Recently Online Trainers{" "}
          </h3>
        </div>

        <div className={`row gy-3`}>
          {activeTrainer.length ? (
            <div className="slider-container m-3 mb-5">
              <button onClick={slideToPrev} className="prev-button shadow">
                &#10094;
              </button>
              <div ref={sliderRef} className="slider-content">
                {activeTrainer.map((data, index) => (
                  <div key={index} className="slider-item">
                    <Card className="overflow-hidden rounded shadow-sm h-100">
                      <img
                        className="card-img-top"
                        src={
                          data?.trainer_info.profile_picture
                            ? Utils?.getImageUrlOfS3(
                                data?.trainer_info.profile_picture
                              )
                            : "/assets/images/demoUser.png"
                        }
                        alt="Card image cap"
                        style={{
                          width: "100%",
                          maxHeight: isMobileScreen ? 150 : 250,
                          minHeight: isMobileScreen ? 150 : 250,
                          maxWidth: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.src =
                            arrOfDemoImg[index] ??
                            "/assets/images/demoUser.png";
                          // e.target.src = "/assets/images/Almer.jpeg";
                        }}
                      />
                      <CardBody>
                        <CardTitle tag="h5">
                          <div className="d-flex align-items-center">
                            <div style={{ fontSize: isMobileScreen ? 12 : 14 }}>
                              {data?.trainer_info?.fullName}
                            </div>
                            <i
                              className="fa fa-check-circle mx-2"
                              style={{ color: "green" }}
                            ></i>
                            <span
                              style={{
                                color: "green",
                                fontWeight: 600,
                                fontSize: isMobileScreen ? 10 : 14,
                              }}
                            >
                              Verified
                            </span>
                          </div>
                        </CardTitle>
                        <CardText>
                          <div style={{ fontSize: isMobileScreen ? 10 : 12 }}>
                            <i className="fa fa-list-alt mr-2"></i>
                            {"Hourly Rate"}{" "}
                            <span>
                              {data?.trainer_info &&
                              data?.trainer_info.extraInfo
                                ? `: ${data?.trainer_info.extraInfo.hourly_rate}`
                                : null}
                            </span>
                          </div>
                        </CardText>

                        <Button
                          className="btn btn-primary btn-sm d-flex"
                          style={{
                            cursor: "pointer",
                            fontSize: isMobileScreen ? 10 : 14,
                          }}
                          onClick={() => {
                            setTrainerInfo((prev) => ({
                              ...prev,
                              userInfo: data?.trainer_info,
                              selected_category: null,
                            }));
                            setSelectedTrainer({
                              id: data?.trainer_info?.id,
                              trainer_id: data?.trainer_info?.id,
                              data: trainer,
                            });
                            setParams({ search: data?.trainer_info?.fullName });
                            setIsModalOpen(true);
                          }}
                        >
                          <div>Book session</div>
                        </Button>
                      </CardBody>
                    </Card>
                  </div>
                ))}
              </div>
              <button onClick={slideToNext} className="next-button shadow">
                &#10095;
              </button>
            </div>
          ) : (
            <p>No Online Trainer Available</p>
          )}
        </div>

        {trainerInfo && trainerInfo.userInfo ? (
          <Modal
            className="recent-user-modal"
            isOpen={isModalOpen}
            allowFullWidth={true}
            element={
              <TrainerDetails
                selectOption={trainerInfo}
                isPopoverOpen={isPopoverOpen}
                categoryList={categoryList}
                key={`trainerDetails`}
                searchQuery={query}
                trainerInfo={trainerInfo?.userInfo}
                selectTrainer={(_id, trainer_id, data) => {
                  if (_id) {
                    setSelectedTrainer({
                      ...selectedTrainer,
                      id: _id,
                      trainer_id,
                      data,
                    });
                  }
                  setTrainerInfo((pre) => {
                    return {
                      ...pre,
                      userInfo: {
                        ...pre?.userInfo,
                        ...data,
                      },
                    };
                  });
                }}
                onClose={() => {
                  setTrainerInfo((prev) => ({
                    ...prev,
                    userInfo: undefined,
                    selected_category: undefined,
                  }));
                  setParams((prev) => ({
                    ...prev,
                    search: null,
                  }));
                  setIsModalOpen(false);
                }}
                isUserOnline={true}
                element={
                  <BookingTable
                    selectedTrainer={selectedTrainer}
                    trainerInfo={trainerInfo}
                    setStartDate={setStartDate}
                    startDate={startDate}
                    getParams={getParams}
                    isUserOnline={true}
                  />
                }
              />
            }
          />
        ) : (
          <></>
        )}
      </div>
    </React.Fragment>
  );
};

export default Course;
