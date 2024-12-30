import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Container,

} from "reactstrap";
import { useDispatch } from "react-redux";
import { getTraineeWithSlotsAsync } from "../../app/components/trainee/trainee.slice";
import { TrainerDetails } from "../../app/components/trainer/trainerDetails";
import { getAllTrainers } from "../../app/components/trainer/trainer.api";
import "./slider.css";
import "./landing.css";
import { Utils } from "../../utils/utils";
import BookingTable from "../../app/components/trainee/scheduleTraining/BookingTable";
import { object } from "prop-types";
import { useMediaQuery } from "usehooks-ts";
import Modal from "../../app/common/modal";

const filter = (category, trainers) => {
  const filteredTrainers = trainers.filter(
    (trainer) => trainer.category === category
  );
  return filteredTrainers || [];
};

const TopTrainers = (props) => {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [allTrainers, setAllTrainers] = useState({});

  // profile states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState({});
  const [trainerInfo, setTrainerInfo] = useState({ userInfo: null });
  const [getParams, setParams] = useState("");
  const [startDate, setStartDate] = useState(new Date());

  // Fetch categories from props
  useEffect(() => {
    setCategories(props?.masterRecords?.category || []);
  }, [props?.masterRecords]);

  useEffect(() => {
    if (getParams.search) {
      dispatch(getTraineeWithSlotsAsync(getParams));
    }
  }, [getParams]);

  const Indexer = (data) => {
    const tempObj = {};
    data.forEach((trainer) => {
      if(trainer.category){
        if (tempObj[trainer.category]) {
          tempObj[trainer.category].push(trainer);
        } else {
          tempObj[trainer.category] = [trainer];
        }
      }
    });
    setAllTrainers(tempObj);
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await getAllTrainers();
        Indexer(response.data, categories);
      } catch (error) {
        console.log("error while fetching the trainers", error);
      }
    })();
  }, []);
  console.log("trainerInfo?.userInfo",trainerInfo?.userInfo)
  return (
    <Container>
      <div className="text-center mb-5 d-flex flex-column">
        <h2 className="mb-3">Top Trainers</h2>
        <h3 className="text-secondary">
          Discover the best trainers across various specialties
        </h3>
      </div>

      {/* Loop through all trainers based on their categories */}
      {Object.keys(allTrainers)?.length > 0 &&
        Object.keys(allTrainers).map((category) => (
          <CategoryTrainerSlider
            key={category}
            category={category}
            trainers={allTrainers[category]}
            setTrainerInfo={setTrainerInfo}
            setSelectedTrainer={setSelectedTrainer}
            setParams={setParams}
            setIsModalOpen={setIsModalOpen}
          />
        ))}

      {/* Trainer Details Modal */}
      {trainerInfo?.userInfo && (
        <Modal className="recent-user-modal" allowFullWidth={true} isOpen={isModalOpen} element={<TrainerDetails
          selectOption={trainerInfo}
          isPopoverOpen={props.isPopoverOpen}
          categoryList={props.categoryList}
          key={`trainerDetails`}
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
            setTrainerInfo((prev) => ({
              ...prev,
              userInfo: {
                ...prev?.userInfo,
                ...data,
              },
            }));
          }}
          onClose={() => {
            setTrainerInfo((prev) => ({
              ...prev,
              userInfo: undefined,
            }));
            setParams((prev) => ({
              ...prev,
              search: null,
            }));
            setIsModalOpen(false);
          }}
          element={
            <BookingTable
              selectedTrainer={selectedTrainer}
              trainerInfo={trainerInfo}
              setStartDate={setStartDate}
              startDate={startDate}
              getParams={getParams}
            />
          }
        />}/>

      )}
    </Container>
  );
};
export default TopTrainers;

const CategoryTrainerSlider = ({
  category,
  trainers,
  setTrainerInfo,
  setSelectedTrainer,
  setParams,
  setIsModalOpen,
}) => {
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
    <div className="mb-5">
      <h3 className="text-nowrap mb-3" style={{ textTransform: "capitalize" }}>
        {category}
      </h3>
      {/* Custom Slider */}
      <div className="slider-container">
        <button onClick={slideToPrev} className="prev-button shadow">
          &#10094;
        </button>
        <div ref={sliderRef} className="slider-content">
          {trainers.map((trainer, index) => (
            <div key={index} className="slider-item">
              <TrainerCard
                trainer={trainer}
                setter={{
                  setTrainerInfo,
                  setSelectedTrainer,
                  setParams,
                  setIsModalOpen,
                }}
              />
            </div>
          ))}
        </div>
        <button onClick={slideToNext} className="next-button shadow">
          &#10095;
        </button>
      </div>
    </div>
  );
};

const TrainerCard = ({ trainer, setter }) => {
  const isMobileScreen= useMediaQuery("(max-width:1000px)")
  const getImageUrl = (image) => {
    const backendUrl = "https://data.netqwix.com/";

    // Check if the image URL is already a full URL (starts with http or https)
    if (
      image &&
      (image.startsWith("http://") || image.startsWith("https://"))
    ) {
      return image;
    }

    // If the image is just a filename, append the backend URL
    return image ? `${backendUrl}${image}` : "/assets/images/demoUser.png";
  };

  return (
    <Card className="overflow-hidden rounded shadow-sm h-100">
      <img
        alt={trainer.fullname}
        style={{
          width: "100%",
          maxHeight:isMobileScreen? 150:250,
          minHeight: isMobileScreen? 150:250,
          maxWidth: "100%",
          objectFit: "cover",
        }}
        src={
          trainer.profile_picture
            ? getImageUrl(trainer.profile_picture)
            : "/assets/images/demoUser.png"
        }
      />
      <CardBody>
        <CardTitle tag="h5">
          <div className="d-flex align-items-center">
            <div style={{fontSize:isMobileScreen?12:14}}>{trainer.fullname}</div>
            <i
              className="fa fa-check-circle mx-2"
              style={{ color: "green" }}
            ></i>
            <span style={{ color: "green", fontWeight: 600,fontSize:isMobileScreen?10:14 }}>Verified</span>
          </div>
        </CardTitle>
        <CardText>
          <div style={{fontSize:isMobileScreen?10:12}}>
            <i className="fa fa-list-alt mr-2"></i>
            Hourly Rate: {trainer?.extraInfo?.hourly_rate || "N/A"}
          </div>
        </CardText>
        <Button
          className="text-white py-2 px-3 rounded width-fit btn-primary"
          style={{ cursor: "pointer", fontSize: isMobileScreen?10:14 }}
          onClick={() => {
            console.log("setter.setTrainerInfo",trainer)
            setter.setTrainerInfo((prev) => ({
              ...prev,
              userInfo: trainer,
            }));
            setter.setSelectedTrainer({
              id: trainer?.id,
              trainer_id: trainer?.id,
              data: trainer,
            });
            setter.setParams({ search: trainer?.fullName });
            setter.setIsModalOpen(true);
          }}
        >
          Book Session
        </Button>
      </CardBody>
    </Card>
  );
};
