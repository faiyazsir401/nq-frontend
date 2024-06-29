import React, { useEffect, useState } from "react";
import { Courses, CourseItems } from "../../app/common/constants";
import { ChevronRight, Filter, Circle, Star } from "react-feather";
import { LABELS } from "../../utils/constant";
import { fetchAllLatestOnlineUsers } from "../../app/components/auth/auth.api";
import { Utils } from "../../utils/utils";
import { TrainerDetails } from "../../app/components/trainer/trainerDetails";
import BookingTable from "../../app/components/trainee/scheduleTraining/BookingTable";
import "../../app/components/trainee/scheduleTraining/index.scss";
import { Modal } from "reactstrap";
import "./landing.css";
import { getTraineeWithSlotsAsync } from "../../app/components/trainee/trainee.slice";
import { useAppDispatch } from "../../app/store";
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
    console.log(ratings , 'ratings')
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
            activeTrainer?.map((data, index) => {
              const { last_activity_time, trainer_info, _id } = data;
              console.log(trainer_info, "trainer_info");
              return (
                <div
                  key={`courses_list${index}`}
                  className="col-lg-4 col-sm-12"
                >
                  <div className="card m-2">
                    <img
                      className="card-img-top"
                      src={
                        trainer_info.profilePicture
                          ? Utils?.getImageUrlOfS3(trainer_info.profilePicture)
                          : "/assets/images/demoUser.png"
                      }
                      alt="Card image cap"
                      style={{ padding: "10px", borderRadius: "20px" }}
                      onError={(e) => {
                        e.target.src =
                          arrOfDemoImg[index] ?? "/assets/images/demoUser.png";
                        // e.target.src = "/assets/images/Almer.jpeg";
                      }}
                    />
                    <div className="card-body">
                      <h5 className="card-title text-truncate">
                        {trainer_info.fullName}
                        <i
                          className="fa fa-check-circle ml-2"
                          style={{ color: "green" }}
                        ></i>
                        <span
                          style={{
                            color: "green",
                            fontWeight: 600,
                            // fontSize: "9px !important"
                          }}
                        >
                          {" "}
                          Verified
                        </span>
                      </h5>
                      <div className="row mt-4 mb-4">
                        <div
                          // key={`courses-details${index}`}
                          className="col-lg-6 col-sm-12"
                        >
                          <i className="fa fa-list-alt mr-2"></i>
                          {"Hourly Rate"}{" "}
                          <span>
                            {trainer_info && trainer_info.extraInfo
                              ? `: ${trainer_info.extraInfo.hourly_rate}`
                              : null}
                          </span>
                        </div>
                      </div>
                       {showRatings(trainer_info?.trainer_ratings, "d-flex")}
                      <div>
                        <button
                          className="btn btn-primary btn-sm d-flex"
                          onClick={() => {
                            setTrainerInfo((prev) => ({
                              ...prev,
                              userInfo: trainer_info,
                              selected_category: null,
                            }));
                            setSelectedTrainer({
                              id: trainer_info?.id,
                              trainer_id: trainer_info?.id,
                              data: trainer,
                            });
                            setParams({ search: trainer_info?.fullName });
                            setIsModalOpen(true);
                          }}
                        >
                          <div>Book session</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No Online Trainer Available</p>
          )}
        </div>

        {trainerInfo && trainerInfo.userInfo ? (
          <Modal className="recent-user-modal" isOpen={isModalOpen}>
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
              isUserOnline = {true}
              element={
                <BookingTable
                  selectedTrainer={selectedTrainer}
                  trainerInfo={trainerInfo}
                  setStartDate={setStartDate}
                  startDate={startDate}
                  getParams={getParams}
                  isUserOnline = {true}
                />
              }
            />
          </Modal>
        ) : (
          <></>
        )}
      </div>
    </React.Fragment>
  );
};

export default Course;
