// import React, { useEffect, useState } from "react";
// import "keen-slider/keen-slider.min.css";
// import { useKeenSlider } from "keen-slider/react";
// import {
//   Button,
//   Card,
//   CardBody,
//   CardSubtitle,
//   CardText,
//   CardTitle,
//   Container,
//   Modal,
//   ModalBody,
//   Nav,
//   NavItem,
//   NavLink,
// } from "reactstrap";
// import { fetchAllLatestOnlineUsers } from "../../app/components/auth/auth.api";
// import { Utils } from "../../utils/utils";
// import { Star } from "react-feather";
// import { useDispatch } from "react-redux";
// import { getTraineeWithSlotsAsync } from "../../app/components/trainee/trainee.slice";
// import { TrainerDetails } from "../../app/components/trainer/trainerDetails";
// import { getAllTrainers } from "../../app/components/trainer/trainer.api";


// const filter = (category , trainers) =>{
// const filteredTrainers = trainers.filter((trainer) => trainer.category === category)
// console.log(filteredTrainers);
// return filteredTrainers || [];
// }

// const TopTrainers = (props) => {
//   const dispatch = useDispatch();
//   const [activeTab, setActiveTab] = useState(1);
//   const [categories, setCategories] = useState([]);
//   const [activeTrainers, setActiveTrainers] = useState([]);
 
//   const [sliderRef, instanceRef] = useKeenSlider({
//     breakpoints: {
//       "(min-width: 400px)": {
//         slides: {
//           perView: 4,
//           spacing: 15,
//         },
//       },
//       "(min-width: 1000px)": {
//         slides: {
//           perView: 4,
//           spacing: 15,
//         },
//       },
//     },
//     loop: true,
//     mode: "free-snap",
//   });
//   const [allTrainers , setAllTrainers] = useState([])
//   const [activeCategory , setActiveCategory] = useState([])

//   // profile states
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedTrainer, setSelectedTrainer] = useState({
//     id: null,
//     trainer_id: null,
//     data: {},
//   });
//   const [trainerInfo, setTrainerInfo] = useState({
//     userInfo: null,
//     selected_category: null,
//   });
//   const [getParams, setParams] = useState("");

//   // Fetch categories from props
//   useEffect(() => {
//     setCategories(props?.masterRecords?.category || []);
//   }, [props?.masterRecords]);

//   // Fetch all latest active trainers
//   useEffect(() => {
//     const getAllLatestActiveTrainers = async () => {
//       try {
//         const response = await fetchAllLatestOnlineUsers();
//         if (response.code === 200) {
//           setActiveTrainers(response.result);
//         } else {
//           console.error("Error while fetching active trainers:", response.message);
//         }
//       } catch (error) {
//         console.error("Fetch failed:", error);
//       }
//     };

//     getAllLatestActiveTrainers();
//   }, []);

//   useEffect(() => {
//     if (getParams.search) {
//       dispatch(getTraineeWithSlotsAsync(getParams));
//     }
//   }, [getParams]);

//   useEffect(() =>{
//     (async() =>{
//       try{
//         const response = await getAllTrainers();
//         setAllTrainers(response.data)
//       }catch(error){
//         console.log("error while fetching the trainers")
//       }
//     })()
//   },[])

//   const navClickHandler = (index) =>{
//     setActiveTab(index)
//     setActiveCategory(filter(categories[index] , allTrainers))
//   }

//   return (
//     <Container>
//       <div className="text-center mb-5 d-flex flex-column">
//         <h2 className="mb-3">Top 10 Trainers</h2>
//         <h3 className="text-secondary">
//           Discover the best trainers across various specialties
//         </h3>
//       </div>
//       {/* Category Tabs */}
//       <Nav
//         tabs
//         className="mb-5 justify-content-md-center justify-content-start"
//       >
//         {categories.map((category, index) => (
//           <NavItem key={index}>
//             <NavLink
//               className={activeTab === index ? "active" : ""}
//               onClick={() => navClickHandler(index)}
//             >
//               {category}
//             </NavLink>
//           </NavItem>
//         ))}
//       </Nav>
//       {/* Trainer Cards Slider */}
//       <div ref={sliderRef} className="keen-slider">
//         {activeCategory.length > 0 ? (
//           activeCategory.map((trainer, index) => (
//             <div key={index} className="keen-slider__slide mr-2" style={{minWidth:'280px' , maxWidth:'350px'}}>
//               <TrainerCard
//                 trainer={trainer}
//                 setter={{
//                   setTrainerInfo,
//                   setSelectedTrainer,
//                   setParams,
//                   setIsModalOpen,
//                 }}
//               />
//             </div>
//           ))
//         ) : (
//           <p>No active trainers available</p>
//         )}
//       </div>

//       {trainerInfo?.userInfo &&  (
//         <Modal className="recent-user-modal" isOpen={isModalOpen}>
//           <ModalBody style={{height:'100vh' , width:'100vw'}}>
//           <TrainerDetails
//             selectOption={trainerInfo}
//             isPopoverOpen={props.isPopoverOpen}
//             categoryList={props.categoryList}
//             key={`trainerDetails`}
//             trainerInfo={trainerInfo?.userInfo}
//             selectTrainer={(_id, trainer_id, data) => {
//               if (_id) {
//                 setSelectedTrainer({
//                   ...selectedTrainer,
//                   id: _id,
//                   trainer_id,
//                   data,
//                 });
//               }
//               setTrainerInfo((prev) => ({
//                 ...prev,
//                 userInfo: {
//                   ...prev?.userInfo,
//                   ...data,
//                 },
//               }));
//             }}
//             onClose={() => {
//               setTrainerInfo((prev) => ({
//                 ...prev,
//                 userInfo: undefined,
//                 selected_category: undefined,
//               }));
//               setParams((prev) => ({
//                 ...prev,
//                 search: null,
//               }));
//               setIsModalOpen(false);
//             }}
//           />
//           </ModalBody>
//         </Modal>
//       )}
//     </Container>
//   );
// };

// export default TopTrainers;

// // TrainerCard component with dynamic data
// const TrainerCard = ({ trainer, setter }) => {
//   const showRatings = (ratings, extraClasses = "") => {
//     const { ratingRatio, totalRating } = Utils.getRatings(ratings);
//     return (
//       <>
//         <div className={extraClasses}>
//           <Star color="#FFC436" size={23} className="star-container star-svg" />
//           <p className="mb-0 mr-1">{ratingRatio || 0}</p>
//           <p className="mb-0">({totalRating || 0})</p>
//         </div>
//       </>
//     );
//   };

//   return (
//     <Card style={{maxWidth:'360px'}} className="overflow-hidden rounded shadow-sm">
//       <img
//         alt={trainer.fullname}
//         style={{ width: "100%", maxHeight: 250, objectFit: "cover" }}
//         src={
//           trainer.profile_picture
//             ? trainer.profile_picture
//             : "/assets/images/demoUser.png"
//         }
//       />
//       <CardBody>
//         <CardTitle tag="h5">
//           <div className="d-flex align-items-center">
//             <div>{trainer.fullname}</div>
//             <i
//               className="fa fa-check-circle mx-2"
//               style={{ color: "green" }}
//             ></i>
//             <span style={{ color: "green", fontWeight: 600 }}>Verified</span>
//           </div>
//         </CardTitle>
//         {/* <CardSubtitle className="mb-2 text-muted" tag="h6">
//           {showRatings(trainer?.trainer_ratings, "d-flex align-items-center")}
//         </CardSubtitle> */}
//         <CardText>
//           <div>
//             <i className="fa fa-list-alt mr-2"></i>
//             {"Hourly Rate"}{" "}
//             <span>
//               {trainer?.extraInfo ? `: ${trainer.extraInfo.hourly_rate}` : null}
//             </span>
//           </div>
//         </CardText>
//         <Button
//           className="text-white py-2 px-3 rounded width-fit btn-primary"
//           style={{ cursor: "pointer", fontSize: 15 }}
//           onClick={() => {
//             setter.setTrainerInfo((prev) => ({
//               ...prev,
//               userInfo: trainer,
//               selected_category: null,
//             }));
//             setter.setSelectedTrainer({
//               id: trainer?.id,
//               trainer_id: trainer?.id,
//               data: trainer,
//             });
//             setter.setParams({ search: trainer?.fullName });
//             setter.setIsModalOpen(true);
//           }}  
//         >
//           Book Session
//         </Button>
//       </CardBody>
//     </Card>
//   );
// };
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Container,
  Modal,
  ModalBody,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import { fetchAllLatestOnlineUsers } from "../../app/components/auth/auth.api";
import { useDispatch } from "react-redux";
import { getTraineeWithSlotsAsync } from "../../app/components/trainee/trainee.slice";
import { TrainerDetails } from "../../app/components/trainer/trainerDetails";
import { getAllTrainers } from "../../app/components/trainer/trainer.api";
import './slider.css'
import "./landing.css";
import { Utils } from "../../utils/utils";
import BookingTable from "../../app/components/trainee/scheduleTraining/BookingTable";
const filter = (category, trainers) => {
  const filteredTrainers = trainers.filter(
    (trainer) => trainer.category === category
  );
  return filteredTrainers || [];
};

const TopTrainers = (props) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(1);
  const [categories, setCategories] = useState([]);
  const [activeTrainers, setActiveTrainers] = useState([]);
  const [allTrainers, setAllTrainers] = useState([]);
  const [activeCategory, setActiveCategory] = useState([]);

  // profile states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState({});
  const [trainerInfo, setTrainerInfo] = useState({ userInfo: null });
  const [getParams, setParams] = useState("");
  const [startDate, setStartDate] = useState(new Date());

  // Slider reference for scrolling
  const sliderRef = useRef(null);

  // Fetch categories from props
  useEffect(() => {
    setCategories(props?.masterRecords?.category || []);
  }, [props?.masterRecords]);

  // Fetch all latest active trainers
  useEffect(() => {
    const getAllLatestActiveTrainers = async () => {
      try {
        const response = await fetchAllLatestOnlineUsers();
        if (response.code === 200) {
          setActiveTrainers(response.result);
        } else {
          console.error("Error while fetching active trainers:", response.message);
        }
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    getAllLatestActiveTrainers();
  }, []);

  useEffect(() => {
    if (getParams.search) {
      dispatch(getTraineeWithSlotsAsync(getParams));
    }
  }, [getParams]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getAllTrainers();
        setAllTrainers(response.data);
      } catch (error) {
        console.log("error while fetching the trainers");
      }
    })();
  }, []);

  useEffect(() =>{
    navClickHandler(0);
  },[allTrainers])

  const navClickHandler = (index) => {
    setActiveTab(index);
    setActiveCategory(filter(categories[index], allTrainers));
  };

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
    <Container>
      <div className="text-center mb-5 d-flex flex-column">
        <h2 className="mb-3">Top 10 Trainers</h2>
        <h3 className="text-secondary">
          Discover the best trainers across various specialties
        </h3>
      </div>
      {/* Category Tabs */}
      <Nav tabs className="mb-5 justify-content-md-center justify-content-start">
        {categories.map((category, index) => (
          <NavItem key={index}>
            <NavLink
              className={activeTab === index ? "active" : ""}
              onClick={() => navClickHandler(index)}
            >
              {category}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      {/* Custom Slider */}
      <div className="slider-container">
        {
           activeCategory.length > 0 && 
        <button onClick={slideToPrev} className="prev-button shadow">
          &#10094;
        </button>
        }
        

        <div ref={sliderRef} className="slider-content">
          {activeCategory.length > 0 ? (
            activeCategory.map((trainer, index) => (
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
            ))
          ) : (
            <p className="m-auto">No active trainers available</p>
          )}
        </div>
          {
            activeCategory.length > 0 && 
        <button onClick={slideToNext} className="next-button shadow">
          &#10095;
        </button>
          }
      </div>

      {trainerInfo?.userInfo && (
        <Modal className="recent-user-modal" isOpen={isModalOpen}>
          <ModalBody style={{ height: "100vh", width: "100vw" }}>
            <TrainerDetails
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
                  isUserOnline = {true}
                />
              }
            />
          </ModalBody>
        </Modal>
      )}
    </Container>
  );
};

export default TopTrainers;

const TrainerCard = ({ trainer, setter }) => {
  return (
    <Card className="overflow-hidden rounded shadow-sm">
      <img
        alt={trainer.fullname}
        style={{ width: "100%", maxHeight: 250, minHeight:250, maxWidth:278, objectFit: "cover" }}
        src={
          trainer.profile_picture
            ? Utils?.getImageUrlOfS3(trainer.profile_picture)
            : "/assets/images/demoUser.png"
        }
      />
      <CardBody>
        <CardTitle tag="h5">
          <div className="d-flex align-items-center">
            <div>{trainer.fullname}</div>
            <i className="fa fa-check-circle mx-2" style={{ color: "green" }}></i>
            <span style={{ color: "green", fontWeight: 600 }}>Verified</span>
          </div>
        </CardTitle>
        <CardText>
          <div>
            <i className="fa fa-list-alt mr-2"></i>
            Hourly Rate: {trainer?.extraInfo?.hourly_rate || "N/A"}
          </div>
        </CardText>
        <Button
          className="text-white py-2 px-3 rounded width-fit btn-primary"
          style={{ cursor: "pointer", fontSize: 15 }}
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
