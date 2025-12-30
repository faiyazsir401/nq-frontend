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
import "./slider.scss";
import "./landing.scss";
import { Utils } from "../../utils/utils";
import BookingTable from "../../app/components/trainee/scheduleTraining/BookingTable";
import { object } from "prop-types";
import { useMediaQuery } from "usehooks-ts";
import Modal from "../../app/common/modal";
import { ChevronLeft, ChevronRight } from "react-feather";

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
        // Error handling without console.log
      }
    })();
  }, []);
  return (
    <Container>
      <div className="text-center mb-5 d-flex flex-column">
        <h2 className="mb-3">Top Experts</h2>
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
  const [showPrevButton, setShowPrevButton] = useState(false);
  const [showNextButton, setShowNextButton] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const isMobileScreen = useMediaQuery("(max-width: 1000px)");
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const checkScrollPosition = () => {
      if (!sliderRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      const isAtStart = scrollLeft <= 5; // Small threshold for rounding
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 5;
      
      setShowPrevButton(!isAtStart);
      setShowNextButton(!isAtEnd);
    };

    const handleScroll = () => {
      if (isMobileScreen) {
        setIsScrolling(true);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
       scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 300);
      }
      checkScrollPosition();
    };

    checkScrollPosition();
    
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', checkScrollPosition);
    }

    return () => {
      if (slider) {
        slider.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', checkScrollPosition);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [trainers, isMobileScreen]);

  // Custom Slider Handlers
  const slideToNext = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.8; // Scroll 80% of visible width
      sliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const slideToPrev = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.8;
      sliderRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mb-5 category-slider-wrapper">
      <h3 className="category-title mb-3" style={{ textTransform: "capitalize" }}>
        {category}
      </h3>
      {/* Custom Slider */}
      <div className="slider-container">
        {showPrevButton && (!isMobileScreen || !isScrolling) && (
          <button 
            onClick={slideToPrev} 
            className="prev-button slider-nav-button"
            aria-label="Previous trainers"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div 
          ref={sliderRef} 
          className="slider-content"
        >
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
        {showNextButton && (!isMobileScreen || !isScrolling) && (
          <button 
            onClick={slideToNext} 
            className="next-button slider-nav-button"
            aria-label="Next trainers"
          >
            <ChevronRight size={20} />
          </button>
        )}
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
    <Card className="overflow-hidden rounded shadow-sm h-100 trainer-card">
      <div className="trainer-image-wrapper position-relative">
        <img
          alt={trainer.fullname}
          style={{
            width: "100%",
            maxHeight: isMobileScreen ? 150 : 250,
            minHeight: isMobileScreen ? 150 : 250,
            maxWidth: "100%",
            objectFit: "cover",
          }}
          src={
            trainer.profile_picture
              ? getImageUrl(trainer.profile_picture)
              : "/assets/images/demoUser.png"
          }
        />
        {/* Verified Badge on Image */}
        <div className="verified-badge">
          <i className="fa fa-check-circle verified-icon"></i>
          <span className="verified-text">Verified</span>
        </div>
      </div>
      <CardBody className="d-flex flex-column">
        <CardTitle tag="h5" className="mb-2">
          <div 
            className="trainer-name" 
            style={{
              fontSize: isMobileScreen ? 14 : 16,
              fontWeight: 600,
              lineHeight: "1.3",
              wordBreak: "break-word",
            }}
          >
            {trainer.fullname}
          </div>
        </CardTitle>
        <CardText className="mb-3 flex-grow-1">
          <div 
            className="d-flex align-items-center hourly-rate"
            style={{ fontSize: isMobileScreen ? 11 : 13 }}
          >
            <i className="fa fa-list-alt mr-2" style={{ fontSize: isMobileScreen ? 12 : 14 }}></i>
            <span>Hourly Rate: <strong>{trainer?.extraInfo?.hourly_rate || "N/A"}</strong></span>
          </div>
        </CardText>
        <Button
          className="text-white py-2 px-3 rounded btn-primary w-100 mt-auto"
          style={{ 
            cursor: "pointer", 
            fontSize: isMobileScreen ? 12 : 14,
            fontWeight: 500,
          }}
          onClick={() => {
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
