import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import "../scheduleTraining/index.scss";
import { Popover } from "react-tiny-popover";
import PopupContent from "./PopupContent";
import { useRouter } from "next/router";
import Slider from "react-slick";
import ShareModalTrainee from "../../bookings/start/SelectClips";

import {
  BookedSession,
  DefaultTimeRange,
  FormateHours,
  Message,
  STATUS,
  TRAINER_AMOUNT_USD,
  TimeRange,
  debouncedConfigs,
  leftSideBarOptions,
  minimumMeetingDurationInMin,
  params,
  weekDays,
} from "../../../common/constants";
import { Utils } from "../../../../utils/utils";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  bookSessionAsync,
  createPaymentIntentAsync,
  getTraineeWithSlotsAsync,
  traineeAction,
  traineeState,
} from "../trainee.slice";
import { Col, Nav, NavItem, NavLink, Row } from "reactstrap";
import TrainerSlider from "./trainerSlider";
import Modal from "../../../common/modal";
import { CloudLightning, X } from "react-feather";
import StripeCard from "../../../common/stripe";
import { toast } from "react-toastify";
import SearchableDropdown from "../helper/searchableDropdown";
import { masterState } from "../../master/master.slice";
import { TrainerDetails } from "../../trainer/trainerDetails";
import { bookingsAction, bookingsState } from "../../common/common.slice";
import { debounce } from "lodash";
import {
  checkSlotAsync,
  commonAction,
  commonState,
} from "../../../common/common.slice";
import CustomRangePicker from "../../../common/timeRangeSlider";
import {
  getTrainersAsync,
  trainerAction,
  trainerState,
} from "../../trainer/trainer.slice";
import { authAction, authState } from "../../auth/auth.slice";
import { SocketContext } from "../../socket";
import Category from "../../../../pages/landing/category";
import {
  myClips,
  shareClips,
  traineeClips,
} from "../../../../containers/rightSidebar/fileSection.api";
import { getAvailability } from "../../calendar/calendar.api";

import { addTraineeClipInBookedSessionAsync } from "../../common/common.slice";
import { useSelector } from "react-redux";
import Header from "../../Header";
import ShareClipsCard from "../../share-clips";
import BookingTable from "./BookingTable";
import Trainer from "./Trainer";
import { useMediaQuery } from "../../../hook/useMediaQuery";
import { fetchAllLatestOnlineUsers } from "../../auth/auth.api";

const settings = {
  autoplay: false,
  infinite: true,
  speed: 200,
  slidesToShow: 6,
  slidesToScroll: 1,
  swipetoslide: true,
  autoplaySpeed: 1000,
  // arrows:false,
  responsive: [
    {
      breakpoint: 1000,
      settings: {
        autoplay: false,
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 500,
      settings: {
        autoplay: false,
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 350,
      settings: {
        autoplay: false,
        slidesToShow: 1,
      },
    },
  ],
};

const { isSidebarToggleEnabled } = bookingsAction;
const { removePaymentIntent } = traineeAction;
const ScheduleTraining = ({openCloseToggleSideNav}) => {
  const socket = useContext(SocketContext);
  const masterRecords = useAppSelector(masterState).master;
  const [data, setData] = useState();
  const { userInfo, sidebarModalActiveTab,  selectedOnlineUser } =
    useAppSelector(authState);

  useEffect(() => {
    setData(masterRecords?.masterData);
  }, [masterRecords]);
  const [activeTrainer, setActiveTrainer] = useState([]);

  const getAllLatestActiveTrainer = async () => {
    const response = await fetchAllLatestOnlineUsers();

    if (response.code === 200) {
      setActiveTrainer(response.result);
    }
  };


  const dispatch = useAppDispatch();
  const { status, getTraineeSlots, transaction } = useAppSelector(traineeState);
  const { trainersList, selectedTrainerInfo } = useAppSelector(trainerState);
  const { configs } = useAppSelector(bookingsState);
  const [availableSlotsState, setAvailableSlotsState] = useState([]);
  const { isSlotAvailable, session_durations, availableSlots } =
    useAppSelector(commonState);
  const { selectedTrainerId } = useAppSelector(bookingsState);
  const { master } = useAppSelector(masterState);
  const [startDate, setStartDate] = useState();
  const [isPopoverOpen, setIsPopoverOpen] = useState(null);
  const [getParams, setParams] = useState(params);
  const [categoryList, setCategoryList] = useState([]);
  const [bookingColumns, setBookingColumns] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [listOfTrainers, setListOfTrainers] = useState([]);
  const [bookingTableData, setBookingTableData] = useState([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [trainer, setTrainer] = useState({ trainer_id: "" });
  const [timeRange, setTimeRange] = useState({
    startTime: "",
    endTime: "",
  });
  const [clips, setClips] = useState([]);
  const [selectedClips, setSelectedClips] = useState([]);
  const [trainee, setTrainee] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [err, setErr] = useState({ email: false, video: false });
  const isMobileScreen = useMediaQuery(768);
  const handleSelectClip = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    getmyClips();
    getAllLatestActiveTrainer();
  }, []);

  const addTraineeClipInBookedSession = async () => {
    const payload = {
      id: isOpenID,
      trainee_clip: selectedClips?.map((val) => val?._id),
    };
    dispatch(addTraineeClipInBookedSessionAsync(payload));
    dispatch(removeNewBookingData());
    setIsOpen(false);
    setIsModalOpen(false);
  };

  const getmyClips = async () => {
    setStartDate(new Date());
    var res = await myClips({});
    setClips(res?.data);
  };

  const [popup, setPopup] = useState(false);
  const router = useRouter();

  const togglePopup = () => {
    setPopup(!popup);
  };

  useEffect(() => {
    const handleScroll = () => {
      // You can add more logic here if needed
      // For now, just prevent the default behavior of scrolling
      if (popup) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "visible";
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "visible"; // Ensure the default behavior is restored
    };
  }, [popup]);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onShare = async () => {
    if (!emailRegex.test(userEmail)) setErr({ email: true, video: false });
    else if (!selectedClips?.length) setErr({ email: false, video: true });
    else {
      var res = await shareClips({
        user_email: userEmail,
        clips: selectedClips,
      });
      toast.success("Email sent successfully.", { type: "success" });
      setErr({ email: false, video: false });
    }
  };

  const [selectedTrainer, setSelectedTrainer] = useState({
    id: null,
    trainer_id: null,
    data: {},
  });
  useEffect(() => {
    const currentDateAndtime = () => {
      // Create a new Date object for the current date
      const currentDate = new Date(startDate);
      // Get the year, month, and day components
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 because months are zero-based
      const day = String(currentDate.getDate()).padStart(2, "0");
      // Format the date in the desired format
      const formattedDate = `${year}-${month}-${day}`;
      return formattedDate;
    };
    if (selectedTrainer?.trainer_id) {
      var date = new Date().toISOString().split("T")[0];
      var dateArr = date?.split("-");
      let start_time = new Date(
        Number(dateArr[0]),
        Number(dateArr[1]) - 1,
        Number(dateArr[2]),
        0,
        0,
        0,
        0
      ).toISOString();
      let end_time = new Date(
        Number(dateArr[0]),
        Number(dateArr[1]) - 1,
        Number(dateArr[2]),
        23,
        59,
        0,
        0
      ).toISOString();

      getAvailability({
        trainer_id: selectedTrainer?.trainer_id,
        start_time: start_time,
        end_time: end_time,
      }).then((res) => {
        setAvailableSlotsState(res?.data);
      });
    }

    //   //  .toISOStringnew Date(startDate).toISOString", moment(new Date(`${startDate}`).toISOString()).format('YYYY-MM-DD'))
  }, [selectedTrainer?.trainer_id]);

  // useEffect(() => {
  //   if (selectedTrainer?.trainer_id) {
  //     let date = new Date(startDate).toISOString().split("T")[0];
  //     let dateArr = date?.split("-");
  //     let start_time = new Date(Number(dateArr[0]), Number(dateArr[1]) - 1, Number(dateArr[2]), 0, 0, 0, 0).toISOString()
  //     let end_time = new Date(Number(dateArr[0]), Number(dateArr[1]) - 1, Number(dateArr[2]), 23, 59, 0, 0).toISOString()
  //     getAvailability({
  //       trainer_id: selectedTrainer?.trainer_id,
  //       start_time: start_time,
  //       end_time: end_time
  //     }).then((res) => {
  //       setAvailableSlotsState(res?.data);
  //     })
  //   }
  // }, [startDate])

  const [query, setQuery] = useState("");

  const [isOpenInstantScheduleMeeting, setInstantScheduleMeeting] =
    useState(false);
  const [trainerInfo, setTrainerInfo] = useState({
    userInfo: null,
    selected_category: null,
  });

  useEffect(() => {
    selectedTrainerInfo &&
      setTrainerInfo(JSON.parse(JSON.stringify(selectedTrainerInfo)));
    if (selectedTrainerInfo?.selected_category) {
      debouncedSearchAPI.cancel();
      dispatch(getTraineeWithSlotsAsync({ search: selectedTrainerInfo?.selected_category }));
      setParams({ search: selectedTrainerInfo?.selected_category });
    }
  }, [selectedTrainerInfo?.selected_category, dispatch, debouncedSearchAPI]);


 
  const [bookSessionPayload, setBookSessionPayload] = useState({});
  const toggle = () => setInstantScheduleMeeting(!isOpenInstantScheduleMeeting);

  const Logout = () => {
    socket.disconnect();
    localStorage.clear();
    router.push("/auth/signIn");
    dispatch(authAction.updateIsUserLoggedIn());
  };

  const closePopup = () => {
    setPopup(false);
  };

  // Debounced function to call API after user stops typing
  const debouncedSearchAPI = useMemo(
    () =>
      debounce((searchValue) => {
        if (searchValue && searchValue.trim()) {
          dispatch(getTraineeWithSlotsAsync({ search: searchValue }));
        }
      }, 500), // 500ms delay - waits for user to stop typing
    [dispatch]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearchAPI.cancel();
    };
  }, [debouncedSearchAPI]); 

  useEffect(() => {
    dispatch(getTrainersAsync());
  }, []);

  useEffect(() => {
    const todaySDate = Utils.getDateInFormatIOS(new Date());
    const { weekDates, weekDateFormatted } =
      Utils.getNext7WorkingDays(todaySDate);
    // setTableData(getTraineeSlots, weekDates);
    setColumns(weekDateFormatted);
    setListOfTrainers(
      getTraineeSlots.map((trainer) => {
        return {
          id: trainer._id,
          trainer_id: trainer.trainer_id,
          background_image: trainer?.profilePicture,
          isActive: true,
          category: trainer?.category,
          name: trainer?.fullname,
          isCategory: false,
          extraInfo: trainer.extraInfo,
          is_kyc_completed: trainer?.is_kyc_completed,
          stripe_account_id: trainer?.stripe_account_id,
          commission: trainer?.commission ?? 5,
          status:trainer?.status
        };
      })
    );
  }, [getTraineeSlots]);

  useEffect(() => {
    setTrainers(
      trainersList.map((trainer) => {
        const { id, fullname, profile_picture, category, extraInfo } = trainer;
        return {
          id,
          isActive: true,
          isCategory: false,
          name: fullname,
          background_image: profile_picture,
          category,
          extraInfo,
        };
      })
    );
  }, [trainersList]);

  useEffect(() => {
    const { masterData } = master;
    setCategoryList([]);
    if (masterData && masterData.category && masterData.category.length) {
      const payload = masterData.category.map((category) => {
        return { id: category, name: category, isCategory: true };
      });
      setCategoryList(payload);
    }
  }, [master]);

  useEffect(() => {
    if (
      transaction &&
      transaction?.intent &&
      transaction?.intent?.result &&
      transaction?.intent.result?.client_secret
    ) {
      setShowTransactionModal(true);
    }
  }, [transaction]);

  useEffect(() => {
    if (!selectedTrainerInfo) {
      setTrainerInfo((prev) => ({
        ...prev,
        userInfo: null,
        selected_category: undefined,
      }));
    }
  }, []);

  useEffect(() => {
    if (selectedOnlineUser) {
      debouncedSearchAPI.cancel();
      setTrainerInfo((prev) => ({
        ...prev,
        userInfo: selectedOnlineUser,
        selected_category: null,
      }));
      setSelectedTrainer({...selectedOnlineUser});
      if (selectedOnlineUser?.fullName) {
        dispatch(getTraineeWithSlotsAsync({ search: selectedOnlineUser?.fullName }));
      }
      setParams({ search: selectedOnlineUser?.fullName });
    }
  }, [selectedOnlineUser, dispatch, debouncedSearchAPI]);

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (selectedTrainer?.trainer_id || trainerInfo?.userInfo?.trainer_id) {
      const bookingDate = Utils.getDateInFormatIOS(startDate);
      const payload = {
        booked_date: bookingDate,
        trainer_id:
          trainerInfo?.userInfo?.trainer_id || selectedTrainer?.trainer_id,
        slotTime: {
          from: trainerInfo?.userInfo?.extraInfo?.working_hours
            ? Utils.getTimeFormate(
                trainerInfo.userInfo.extraInfo.working_hours?.from
              )
            : DefaultTimeRange.startTime,
          to: trainerInfo?.userInfo?.extraInfo?.working_hours
            ? Utils.getTimeFormate(
                trainerInfo.userInfo.extraInfo.working_hours?.to
              )
            : DefaultTimeRange.endTime,
        },
      };
      let date = new Date(startDate).toISOString().split("T")[0];
      let dateArr = date?.split("-");
      let start_time = new Date(
        Number(dateArr[0]),
        Number(dateArr[1]) - 1,
        Number(dateArr[2]),
        0,
        0,
        0,
        0
      ).toISOString();
      let end_time = new Date(
        Number(dateArr[0]),
        Number(dateArr[1]) - 1,
        Number(dateArr[2]),
        23,
        59,
        0,
        0
      ).toISOString();
      getAvailability({
        trainer_id:
          trainerInfo?.userInfo?.trainer_id || selectedTrainer?.trainer_id,
        start_time: start_time,
        end_time: end_time,
      }).then((res) => {
        setAvailableSlotsState(res?.data);
      });

      dispatch(checkSlotAsync(payload));
    }
  }, [selectedTrainer]);

  useEffect(() => {
    if (status === STATUS.fulfilled) {
      const bookingDate = Utils.getDateInFormatIOS(startDate);
      if (trainerInfo?.userInfo?.trainer_id || selectedTrainer?.trainer_id) {
        const payload = {
          trainer_id:
            trainerInfo?.userInfo?.trainer_id || selectedTrainer?.trainer_id,
          booked_date: bookingDate,
          slotTime: {
            from: timeRange.startTime
              ? timeRange.startTime
              : DefaultTimeRange.startTime,
            to: timeRange.endTime
              ? timeRange.endTime
              : DefaultTimeRange.endTime,
          },
        };

        let date = new Date(startDate).toISOString().split("T")[0];
        let dateArr = date?.split("-");
        let start_time = new Date(
          Number(dateArr[0]),
          Number(dateArr[1]) - 1,
          Number(dateArr[2]),
          0,
          0,
          0,
          0
        ).toISOString();
        let end_time = new Date(
          Number(dateArr[0]),
          Number(dateArr[1]) - 1,
          Number(dateArr[2]),
          23,
          59,
          0,
          0
        ).toISOString();
        getAvailability({
          trainer_id:
            trainerInfo?.userInfo?.trainer_id || selectedTrainer?.trainer_id,
          start_time: start_time,
          end_time: end_time,
        }).then((res) => {
          setAvailableSlotsState(res?.data);
        });
        dispatch(checkSlotAsync(payload));
      }
    }
  }, [status]);

  const setTableData = (data = [], selectedDate) => {
    const result = data.map(
      ({
        available_slots,
        category,
        email,
        fullname,
        profilePicture,
        trainer_id,
        extraInfo,
        _id,
      }) => {
        const trainer_info = {
          category,
          email,
          fullname,
          profilePicture,
          trainer_id,
          extraInfo,
          _id,
        };
        return {
          trainer_info,
          monday: {
            date: selectedDate[0],
            trainer_info,
            slot: getSlotByDate(available_slots, weekDays[0]),
          },
          tuesday: {
            date: selectedDate[1],
            trainer_info,
            slot: getSlotByDate(available_slots, weekDays[1]),
          },
          wednesday: {
            date: selectedDate[2],
            trainer_info,
            slot: getSlotByDate(available_slots, weekDays[2]),
          },
          thursday: {
            date: selectedDate[3],
            trainer_info,
            slot: getSlotByDate(available_slots, weekDays[3]),
          },
          friday: {
            date: selectedDate[4],
            trainer_info,
            slot: getSlotByDate(available_slots, weekDays[4]),
          },
        };
      }
    );
    setBookingTableData(result);
  };

  const getSlotByDate = (slots = [], day) => {
    const slot =
      slots.find(
        (slot) => slot?.day && slot?.day?.toLowerCase() === day?.toLowerCase()
      ).slots || [];
    return slot
      .filter(({ start_time }) => start_time && start_time.length)
      .map(({ start_time, end_time }) => {
        return {
          start_time: getSpliitedTime(start_time),
          end_time: getSpliitedTime(end_time),
        };
      });
  };

  const getSpliitedTime = (time = "") => {
    const splittedTime = time.split(":");
    return `${splittedTime[0]}:${splittedTime[1]}`;
  };

  const setColumns = (weeks = []) => {
    setBookingColumns([]);
    const initialHeader = {
      title: "",
      dataIndex: "trainer_info",
      key: "Available_Trainers",
      width: 70,
      render: (
        { category, email, fullname, profilePicture, trainer_id, _id },
        record
      ) => {
        return (
          <div className="text-center">
            <img
              height={100}
              width={100}
              src={profilePicture}
              className="rounded"
            />
            <p htmlFor="exampleFormControlInput1" className="form-label mt-2">
              {fullname}
            </p>
          </div>
        );
      },
    };

    const weekCols = weeks.map((week, index) => {
      return {
        title: Utils.capitalizeFirstLetter(week),
        // a key using which we'll show records
        dataIndex: `${week.split(" ")[0].toLowerCase()}`,
        key: `week-col-${index}`,
        width: 100,
      };
    });
    setBookingColumns([initialHeader, ...weekCols]);
  };

  const Input = ({ onChange, placeholder, value, isSecure, id, onClick }) => (
    <span
      onChange={onChange}
      placeholder={placeholder}
      value={value}
      isSecure={isSecure}
      id={id}
      onClick={onClick}
      className="select_date"
    >
      {Utils.formateDate(startDate)}
    </span>
  );
  const renderSlotsByDay = ({ slot, date, trainer_info }) => {
    return slot.map((content, index) => (
      <Popover
        key={`popover${index}`}
        isOpen={
          `${trainer_info._id}_${index}-${date.toString()}` === isPopoverOpen
        }
        positions={["top"]} // if you'd like, you can limit the positions
        align={"center"}
        padding={5} // adjust padding here!
        reposition={true} // prevents automatic readjustment of content position that keeps your popover content within its parent's bounds
        onClickOutside={() => setIsPopoverOpen(null)} // handle click events outside of the popover/target here!
        content={(
          { position, nudgedLeft, nudgedTop } // you can also provide a render function that injects some useful stuff!
        ) => (
          <div key={`tablist-${index}`}>
            {/* <div style={{ zIndex: 5000 }} key={`tablist-${index}`}> */}
            <div className="alert alert-info m-20" role="alert">
              <p>
                Want to schedule a meeting with <b>{trainer_info.fullname}?</b>
              </p>
              <Nav tabs id="myTab1" role="tablist">
                <NavItem>
                  <NavLink
                    style={{ background: "white" }}
                    onClick={() => {
                      const amountPayable = Utils.getMinutesFromHourMM(
                        content.start_time,
                        content.end_time,
                        trainer_info?.extraInfo?.hourly_rate
                      );
                      if (amountPayable > 0) {
                        const payload = {
                          charging_price: amountPayable,
                          trainer_id: trainer_info.trainer_id,
                          trainer_info,
                          status: BookedSession.booked,
                          booked_date: date,
                          hourly_rate:
                            trainerInfo?.userInfo?.extraInfo?.hourly_rate ||
                            selectedTrainer?.data?.extraInfo?.hourly_rate,
                          session_start_time: content.start_time,
                          session_end_time: content.end_time,
                        };
                        setBookSessionPayload(payload);
                        dispatch(
                          createPaymentIntentAsync({
                            amount: +amountPayable.toFixed(1),
                          })
                        );
                      } else {
                        toast.error("Invalid slot timing...");
                      }
                    }}
                  >
                    Book slot now
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
          </div>
        )}
      >
        <div
          onClick={() => {
            setIsPopoverOpen(`${trainer_info._id}_${index}-${date.toString()}`);
          }}
          key={`slot-${index}-content`}
          className="rounded-pill bg-primary text-white text-center p-1 mb-1 pointer font-weight-bold"
        >
          {Utils.convertToAmPm(content.start_time)} -{" "}
          {Utils.convertToAmPm(content.end_time)}{" "}
        </div>
      </Popover>
    ));
  };
   
  const renderSearchMenu = () => (
    <div
      onScroll={() => {
        if (configs.sidebar.isMobileMode) {
          dispatch(isSidebarToggleEnabled(true));
        }
        return;
      }}
      className="bookings custom-scroll custom-trainee-dashboard booking-container"
      id="booking-lesson"
    >
      <div className="row"  style={{margin:"0px"}}>
        <div className="trainer-recommended">
          <h1 style={{ marginBottom: "10px",fontSize:isMobileScreen?"22px":"auto" }}>Book Your Session now</h1>
          <p style={{fontSize:isMobileScreen?"14px":"20px"}}>
          Pick your favorite activity and then search for your Expert below. NetQwix is here to revolutionize the way you learn and connect LIVE on our cutting-edge platform.
          </p>
        </div>
      </div>

      {popup && (
        <PopupContent
          onClose={closePopup}
          userInfo={userInfo}
          Logout={Logout}
        />
      )}

      <div
        id="dashboard"
        className="d-flex justify-content-center align-items-center dashboard-search-trainer"
        style={{ 
          marginTop: isMobileScreen ? "3%" : "5%", 
          marginBottom: isMobileScreen ? "3%" : "2%",
          padding: isMobileScreen ? "0 15px" : "0",
          width: "100%"
        }}
      >
        <SearchableDropdown
          placeholder="Search Experts..."
          options={[...listOfTrainers, ...categoryList]}
          label="name"
          id="id"
          customClasses={{
            searchBar: "search-bar-trainee",
            searchButton: "search-button-trainee",
            dropdown: "custom-dropdown-width",
          }}
          onSearchClick={(query) => {
            debouncedSearchAPI.cancel();
            if (query) {
              setTrainerInfo((prev) => ({
                ...prev,
                userInfo: null,
                selected_category: query,
              }));
              dispatch(getTraineeWithSlotsAsync({ search: query }));
            }
            setQuery(query);
            setParams({ search: query });
          }}
          searchValue={(value) => {
            setParams({ search: value });
            debouncedSearchAPI(value);
          }}
          selectedOption={(option) => {
            debouncedSearchAPI.cancel();
            
            if (option && option.isCategory) {
              setTrainerInfo((prev) => ({
                ...prev,
                userInfo: option,
                selected_category: option.name,
              }));
              dispatch(getTraineeWithSlotsAsync({ search: option.name }));
              setParams({ search: option.name });
            } else {
              setTrainerInfo((prev) => ({
                ...prev,
                userInfo: option,
                selected_category: null,
              }));
              const searchValue = option?.name || option?.fullname || "";
              if (searchValue) {
                dispatch(getTraineeWithSlotsAsync({ search: searchValue }));
                setParams({ search: searchValue });
              }
            }
          }}
          handleChange={(value) => {
            setParams({ search: value || "" });
            debouncedSearchAPI(value || "");
          }}
          activeTrainer={activeTrainer}
        />
      </div>
      <div className="trainer-recommended Slider  " style={{ height: "90px" }}>
        <div className="row" style={{margin:"0px",width:"60vw",display:"flex",justifyContent:"center",margin:"auto"}}>
          <div className="col" style={{display:"flex",justifyContent:"center"}}>
            <Slider {...settings}>
              {data?.category?.map((item, index) => (
                <div key={`slider-item-${index}`}>
                  <span
                    className="badge badge-light lg"
                    style={{
                      padding:isMobileScreen ? "10px":"18px", // Add your desired padding here
                      alignItems:isMobileScreen ? "auto": "center",
                      fontSize:isMobileScreen ? "auto": "14px",
                      color: isMobileScreen ? "auto":"black",
                      cursor:isMobileScreen ? "auto": "pointer",
                      width:isMobileScreen ? "auto": "80%",
                      height:isMobileScreen ? "auto": "0",
                      display:isMobileScreen ? "auto": "flex",
                      justifyContent: isMobileScreen ? "auto":"center", // Center content horizontally
                      flexDirection: isMobileScreen ? "auto":"column",
                    }}
                    onClick={() => {
                      debouncedSearchAPI.cancel();
                      setTrainerInfo((prev) => ({
                        ...prev,
                        userInfo: {
                          id: item,
                          isCategory: true,
                          name: item,
                        },
                        selected_category: item,
                      }));
                      dispatch(getTraineeWithSlotsAsync({ search: item }));
                      setParams({ search: item });
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2>Online Experts</h2>
        <div
          className="Recommended"
          style={{ display: "flex", flexDirection: "row",justifyContent:"center" }}
        >
          {activeTrainer && activeTrainer?.length ? (
              <>
                <Row
            
                  lg={4}
                  md={1}
                  sm={1}
                  xs={1}
                  style={{
                    display:'flex',
                    flexDirection:"row",
                    // justifyContent:"center",
                    width: isMobileScreen ? "100%" : "100%",
                    padding:"0px",
                    justifyContent:"center"
                  }}
                  className="recent-slider recent-chat"
                >
                  
                 {activeTrainer?.map((data, index) => {
                    return (
                      <Col key={index} className="item" style={{maxWidth:isMobileScreen?"130px":"230px",padding:"15px"}}>
                        <Trainer
                          trainer={data.trainer_info}
                          onClickFunc={() => {
                            debouncedSearchAPI.cancel();
                            setTrainerInfo((prev) => ({
                              ...prev,
                              userInfo: data.trainer_info,
                              selected_category: null,
                            }));
                            setSelectedTrainer(data.trainer_info);
                            if (data.trainer_info?.fullName) {
                              dispatch(getTraineeWithSlotsAsync({ search: data.trainer_info?.fullName }));
                            }
                            setParams({ search: data.trainer_info?.fullName });
                          }}
                          
                        />
                      </Col>
                    );
                  })}
                </Row>
              </>
            
          ) : (
            <h3>There are no Active Experts</h3>
          )}
          {/* <div
            className="card trainer-profile-card Home-main-Cont"
            style={{
              height: "100%",
              width: "100%",
              maxWidth: "300px",
              margin: "auto",
              marginTop:"20px"
            }}
          >
            <div className="card-body">
              <ShareClipsCard />
            </div>
          </div> */}
        </div>
      </div>
      <div style={{ height: "11vh" }} />
    </div>
  );

  const renderUserDetails = () => {
    return (
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
          setTimeout(() => {
            let getBookingLesson = document.querySelector(".booking-container");
            if(getBookingLesson){
              getBookingLesson.style.marginLeft = openCloseToggleSideNav ? '65px' : "0px";
            }
          }, 10);
        }}
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
        isUserOnline={true}
      />
    );
  };


  return (
    <React.Fragment>
      {/* {trainerInfo.userInfo === null || */}
      {
      (trainerInfo && trainerInfo.userInfo) ? (
        <div className="custom-scroll">{renderUserDetails()}</div>
      ) : (
        <div className="custom-scroll trainee-dashboard">
          {renderSearchMenu()}
        </div>
      )}
    </React.Fragment>
  );
};

export default ScheduleTraining;
