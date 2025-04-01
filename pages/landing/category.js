import React, { useEffect, useState } from "react";
import SearchableDropdown from "../../app/components/trainee/helper/searchableDropdown";
import {
  createPaymentIntentAsync,
  getTraineeWithSlotsAsync,
  traineeState,
} from "../../app/components/trainee/trainee.slice";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { masterState } from "../../app/components/master/master.slice";
import { debouncedConfigs, params } from "../../app/common/constants";
import Modal from "../../app/common/modal";
import TrainersDetails from "../../app/components/public";
import { bookingsAction } from "../../app/components/common/common.slice";
import { ChevronRight, CloudLightning } from "react-feather";
import { debounce } from "lodash";
import { LABELS } from "../../utils/constant";
import { TrainerDetails } from "../../app/components/trainer/trainerDetails";
import BookingTable from "../../app/components/trainee/scheduleTraining/BookingTable";
import { useRouter } from "next/router";

const Category = (masterRecords) => {
  const dispatch = useAppDispatch();
  const router = useRouter()
  const { handleSelectedTrainer } = bookingsAction;
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [query, setQuery] = useState("");
  const { getTraineeSlots } = useAppSelector(traineeState);
  const [getParams, setParams] = useState(params);
  const [selectedTrainer, setSelectedTrainer] = useState({ id: null });
  const [isPopoverOpen, setIsPopoverOpen] = useState(null);
  const [trainerInfo, setTrainerInfo] = useState({
    userInfo: null,
    selectCategory: null,
  });
  const { master } = useAppSelector(masterState);
  const [categoryList, setCategoryList] = useState([]);
  const [listOfTrainers, setListOfTrainers] = useState([]);
  const [startDate, setStartDate] = useState();
  const [availableSlotsState, setAvailableSlotsState] = useState([]);
  const [bookSessionPayload, setBookSessionPayload] = useState({});
  const [bookingColumns, setBookingColumns] = useState([]);
  const [isTrainerModal, setIsTrainerModal] = useState(false);
  useEffect(() => {
    setStartDate(new Date())
    if (getParams.search) {
      dispatch(getTraineeWithSlotsAsync(getParams));
    }
  }, [getParams]);

  useEffect(() => {
    setStartDate(new Date())
    const { masterData } = master;
    setCategoryList([]);
    if (masterData && masterData.category && masterData.category.length) {
      const payload = masterData.category.map((category) => {
        console.log(category , 'category')
        return { id: category, name: category, isCategory: true };
      });
      setCategoryList(payload);
    }
  }, [master]);

  useEffect(() => {
    setListOfTrainers(
      getTraineeSlots?.map((trainer) => {
        return {
          id: trainer._id,
          background_image: trainer?.profilePicture,
          isActive: true,
          category: trainer?.category,
          name: trainer?.fullname,
          isCategory: false,
          extraInfo: trainer.extraInfo,
          status:trainer?.status,
          ...trainer
        };
      })
    );
  }, [getTraineeSlots]);

  console.log("listoftrainers",listOfTrainers)

  const handleClose = () => {
    setIsTrainerModal(false);
    setTrainerInfo((prev) => ({
      ...prev,
      userInfo: null,
      selectCategory: null,
    }));
    setParams("");
    (params.search = ""), setParams(params);
  };

  const [containerStyles, setContainerStyles] = useState({
    backgroundColor: "#9d01ac",
    borderRadius: "50%",
    alignItems: "center",
  });

  useEffect(() => {
    const smallScreenStyles = {
      // backgroundImage: 'url(particular_ad_small.png)',
      innerHeight: "200px",
      backgroundColor: "black",
    };

    if (window.innerWidth === 820) {
      setContainerStyles((prevStyles) => ({
        ...prevStyles,
        ...smallScreenStyles,
      }));
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const isMobileScreen = window.innerWidth < 600;
      setIsMobileScreen(isMobileScreen);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  console.log("trainerInfo?.userInfo",trainerInfo?.userInfo)

  return (
    <React.Fragment>
      <div className="container category-content">
        <div className="row">
          <div className="col">
            {masterRecords?.masterRecords?.category?.map((item, index) => {
              return (
                <span 
                  key={`category_item${index}`}
                  className="badge badge-light lg"
                  style={{
                    margin: isMobileScreen?"5px":"12px",
                    padding: isMobileScreen?"10px":"18px",
                    alignItems: "center",
                    fontSize: isMobileScreen?"10px":"14px",
                    color: "black",
                    cursor : 'pointer'
                  }}
                    onClick={() => {
                      setTrainerInfo((prev) => ({
                        ...prev,
                        userInfo: {
                          id: item,
                          isCategory: true,
                          name: item,
                        },
                        selected_category: item,
                      }));
                      setParams({ search: item })
                      setIsTrainerModal(true);
                    }}
                >
                  {item}
                </span>
              );
            })}
          </div>
        </div>

        {/* <div className="d-flex flex-wrap justify-content-center align-items-center ">
          {masterRecords?.masterRecords?.category?.map((item, index) => {
            return (
              <span
                key={`category_item${index}`}
                className="badge badge-light lg"
                style={{
                  margin: "20px",
                  padding: "18px",
                  alignItems: "center",
                  fontSize: "14px",
                  color: "black",
                }}
              >
                {item}
              </span>
            );
          })}
        </div> */}
        <div className="container">
          <div className={`row ${isMobileScreen ?"mt-1":"mt-5"}`}>
            <div className="col-lg-6">
              <div
                className={` ${isMobileScreen ?"mt-2":"mt-4"}`}
                style={{
                  fontSize: isMobileScreen?"16px":"35px",
                  color: "black",
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                {LABELS.LANDIGN_MSG}
              </div>
              <div className="">
                <button className={`btn btn-primary d-flex  ${isMobileScreen ?"mb-1 mt-1 p-2 px-3":"mb-4 mt-5"}`}>
                  <div style={{margin:"auto",fontSize:isMobileScreen?"10px":"14px"}} onClick={()=> router.push("/auth/signUp")}>Get Started</div>
                  <div className="pl-2" style={{position:"relative", top:"3px"}}>
                    <ChevronRight />
                  </div>
                </button>
              </div>
            </div>
            <div
              className="col-lg-6  bg-primary mt-3"
              style={{ borderRadius: "50%",width:isMobileScreen?"70%":"100%",margin:'auto' }}
            >
              <img
                src="/assets/images/1-removebg 1.png"
                alt="logo"
                style={{
                  // maxWidth: "500px",
                  maxWidth: "100%",
                  height: "auto",
                }}
                className="img-fluid"
              />
            </div>
          </div>
        </div>
        <div
          className={`container d-flex justify-content-center`}
        >
          <div className={`row ${isMobileScreen ?"mb-2 mt-3":"my-5"}`}>
            <div className={`col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12`}>
              <SearchableDropdown
                placeholder="Search Trainers..."
                options={[...listOfTrainers, ...categoryList]}
                label="name"
                id="id"
                customClasses={{
                  searchBar: "search-bar-trainee",
                  searchButton: "search-button-trainee",
                  dropdown: "custom-dropdown-width-landing",
                }}
                onSearchClick={(query) => {
                  if (query) {
                    setTrainerInfo((prev) => ({
                      ...prev,
                      userInfo: null,
                      selected_category: query,
                    }));
                    setIsTrainerModal(true);
                  }
                  setQuery(query);
                  setIsTrainerModal(true);
                }}
                searchValue={(value) => {
                  setParams({ search: value });
                }}
                selectedOption={(option) => {
                  console.log(option , 'option')
                  if (option && option.isCategory) {
                    setTrainerInfo((prev) => ({
                      ...prev,
                      userInfo: option,
                      selected_category: option.name,
                    }));
                    setIsTrainerModal(true);

                  } else {
                    setTrainerInfo((prev) => ({
                      ...prev,
                      userInfo: option,
                      selected_category: null,
                    }));
                    setIsTrainerModal(true);
                  }
                }}
                handleChange={(value) => {
                  setParams({ search: value });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* <Modal
        isOpen={ isTrainerModal}
        overflowHidden={true}
        minHeight={true}
        element={
          <TrainersDetails
            onClose={handleClose}
            selectedOption={trainerInfo}
            categoryList={categoryList}
            key={`trainersDetails`}
            searchQuery={query}
            trainerInfo={trainerInfo.userInfo}
            selectTrainer={(_id) => {
              if (_id) {
                dispatch(handleSelectedTrainer(_id));
                setSelectedTrainer({ ...selectedTrainer, id: _id });
              }
            }}
          />
        }
      /> */}
      <Modal
      isOpen={isTrainerModal}
      // isOpen={getParams?.search ? true : false}
      overflowHidden={true}
      minHeight={true}
      allowFullWidth={true}
      element = {<TrainerDetails
        selectOption={trainerInfo}
        categoryList={categoryList}
        key={`trainerDetails`}
        searchQuery={query}
        trainerInfo={trainerInfo?.userInfo}
        selectTrainer={(_id, trainer_id, data) => {
          console.log(_id , 'id')
          if (_id) {
            setSelectedTrainer({
              ...selectedTrainer,
              id: _id,
              trainer_id,
              data,
            });
          }
          setTrainerInfo((pre => {
            return {
              ...pre,
              userInfo: {
                ...pre?.userInfo,
                ...data
              }
            }
          }))
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
          setIsTrainerModal(false)
        }}
        element={
        <BookingTable
          selectedTrainer={selectedTrainer}
          trainerInfo={trainerInfo}
          setStartDate={setStartDate}
          startDate={startDate}
          getParams={getParams}
        />}
      />
      }
      >
      </Modal>
 
    </React.Fragment>
  );
};

export default Category;
