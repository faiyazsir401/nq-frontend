import React, { useEffect, useState } from "react";
import {
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import { AccountType, LOCAL_STORAGE_KEYS } from "../../common/constants";
import { authState } from "../auth/auth.slice";
import { useAppSelector } from "../../store";
import Addworkinghour from "../../../containers/leftSidebar/Addworkinghour";
import CalendarPage from "../calendar/calendar";
import MyClips from "../locker/my-clips";
import Reports from "../locker/reports";
import BookingList from "../bookings/BookingList";
import { loadStripe } from "@stripe/stripe-js";
import { createStripeVarificationUrl, createVarificationSession } from "../common/common.api";
import Link from "next/link";
import Slider from "react-slick";
import { useMediaQuery } from "../../hook/useMediaQuery";

const Schedule = ({ activeCenterContainerTab }) => {
  useEffect(() => { }, [activeCenterContainerTab]);
  const { userInfo } = useAppSelector(authState);
  return (
    userInfo?.account_type === "Trainer" && userInfo?.is_kyc_completed ? <>
      <Addworkinghour />
      <CalendarPage />
    </> :
      <p style={{ textAlign: "center" }}>Please complete your KYC to create slot</p>
  );
};

// class VerifyButton extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { submitted: false };
//     this.handleClick = this.handleClick.bind(this);
//   }

//   async componentDidMount() {
//     this.setState({ stripe: await this.props.stripePromise });
//   }

//   async handleClick(event) {
//     // Block native event handling.
//     event.preventDefault();

//     const { stripe } = this.state;

//     if (!stripe) {
//       // Stripe.js hasn't loaded yet. Make sure to disable
//       // the button until Stripe.js has loaded.
//       return;
//     }

//     // Call your backend to create the VerificationSession.
//     const session = await createVarificationSession();
//     // const session = await response.json();



//     const client_secret = session.data.result.clientSecret
//     console.log("============>", client_secret)
//     if (client_secret) {

//       // Show the verification modal.
//       const { error } = await stripe?.verifyIdentity(client_secret);

//       if (error) {
//         console.log('[error]', error);
//       } else {
//         console.log('Verification submitted!');
//         this.setState({ submitted: true });
//       }
//     }
//   };

//   render() {
//     const { stripe, submitted } = this.state;

//     if (submitted) {
//       return (
//         <>
//           <h1>Thanks for submitting your identity document</h1>
//           <p>
//             We are processing your verification.
//           </p>
//         </>
//       );
//     }

//     return (
//       <button
//         role="link"
//         disabled={!stripe}
//         onClick={this.handleClick}
//         style={{
//           borderRadius: "10px",
//           background: "#000080",
//           color: "white",
//           fontWeight: 600,
//           padding: "7px"
//         }}>
//         complete KYC
//       </button>
//     );
//   }
// }

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

var settings = {
  autoplay: false,
  infinite: false,
  speed: 2000,
  slidesToShow: 1,
  slidesToScroll: 1,
  swipeToSlide: true,
  autoplaySpeed: 1000,
  arrows: true,

  responsive: [
    {
      breakpoint: 1366,
      settings: {
        autoplay: false,
        slidesToShow: 3,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 800,
      settings: {
        autoplay: false,
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 768,
      settings: {
        autoplay: false,
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 700,
      settings: {
        autoplay: false,
        slidesToShow: 1,
      },
    },
  ],
};


const allTabs = [
  {
    name: "My Clips",
    value: "myClips",
    accessBy: [AccountType?.TRAINEE, AccountType?.TRAINER],
    component: MyClips,
  },
  {
    name: "Schedule",
    value: "schedule",
    accessBy: [AccountType?.TRAINER],
    component: Schedule,
  },
  {
    name: "Upcoming Sessions",
    value: "upcomingLesson",
    accessBy: [AccountType?.TRAINEE, AccountType?.TRAINER],
    component: BookingList,
  },
  {
    name: "Saved Lessons & Game Plan",
    value: "gamePlans",
    accessBy: [AccountType?.TRAINER, AccountType?.TRAINEE],
    component: Reports,
  },
];

const NavHomePageCenterContainer = () => {

  const { accountType, userInfo } = useAppSelector(authState);
  const [activeTab, setActiveTab] = useState(allTabs[0]?.value);


  const isMobile = useMediaQuery(599)

  const toggleTab = (tabValue) => {
    if (activeTab !== tabValue) {
      setActiveTab(tabValue);
    }
  };

  const handleKYCVarification = async (url) => {

    if (userInfo?.stripe_account_id) {
      const result = await createStripeVarificationUrl({ stripe_account_id: userInfo?.stripe_account_id })
      const stripe_url = result?.data?.result?.url ?? "";

      if (stripe_url) {
        window.open(stripe_url, "_blank");
      }
    }
  }

  return (
    <>
      <div id="navHomePageCenterContainer">
        {
          userInfo?.account_type === "Trainer" && !userInfo?.is_kyc_completed ?
            <div style={{
              padding: "5px",
              background: "red",
              marginBottom: "15px",
              border: "1px",
              borderRadius: "5px",
              display: "flex",
              justifyContent: "space-between"
            }}>
              <span style={{
                padding: "5px",
                color: "white"
              }}>Please Complete your KYC</span>
              <button
                style={{
                  borderRadius: "10px",
                  background: "#000080",
                  color: "white",
                  fontWeight: 600,
                  padding: "7px"
                }}
                onClick={handleKYCVarification}
              >
                complete KYC
              </button>

              {/* <a href={userInfo?.kyc_url ?? "#"} target="_blank" rel="noopener noreferrer">complete KYC</a> */}
              {/* <VerifyButton stripePromise={stripePromise}/> */}
            </div> : null
        }
        <div className="theme-tab sub-nav">
          {!isMobile ? <Nav tabs>
            {allTabs?.map(
              (el) =>
                el?.accessBy?.includes(accountType) && (
                  <NavItem key={el.value}>
                    <NavLink
                      className={
                        activeTab === el?.value
                          ? "activelink sub-item"
                          : "sub-item"
                      }
                      onClick={() => toggleTab(el?.value)}
                    >
                      {/* {el?.name === "Schedule" ? (
                        <>&nbsp;&nbsp;Schedule &nbsp; </>
                      ) : (
                        el?.name
                      )} */}
                      {el?.name}
                    </NavLink>
                  </NavItem>
                )
            )}
          </Nav> : <Nav tabs style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>

            <div className="theme-tab">
              <Nav tabs>
                <div className="row mb-2" >
                  <div className="col text-center" style={{flexBasis: "auto"}} >
                    <NavItem className="ml-1 text-center">
                      <NavLink
                        className={`button-effect ${activeTab === "myClips" ? "activelink" : ""
                          }`}
                        onClick={() => toggleTab("myClips")}
                        style={{ width: '100%' }}
                      >
                        My Clips
                      </NavLink>
                    </NavItem>
                  </div>
                  <div className="col text-center" style={{flexBasis: "auto"}}>
                    <NavItem className="ml-1">
                      {accountType === "Trainer" && <NavLink
                        className={`button-effect ${activeTab === "schedule" ? "activelink" : ""}`}
                        onClick={() => toggleTab("schedule")}
                        style={{ width: '100%' }}
                      >
                        Schedule
                      </NavLink>}
                    </NavItem>
                  </div>
                  {/* </div>
                <div className="row" style={{ width: '100%', alignItems: 'center', margin: "0px" }}> */}
                  <div className="col" style={{flexBasis: "auto"}}>
                    <NavItem className="ml-1">
                      <NavLink
                        className={`button-effect ${activeTab === "upcomingLesson" ? "activelink" : ""
                          }`}
                        onClick={() => toggleTab("upcomingLesson")}
                        style={{ width: '100%' }}
                      >
                        Upcoming Sessions
                      </NavLink>
                    </NavItem>
                  </div>
                  <div className="col text-right" style={{flexBasis: "auto"}}>

                    <NavItem className="ml-1">
                      <NavLink
                        className={`button-effect ${activeTab === "gamePlans" ? "activelink" : ""
                          }`}
                        onClick={() => toggleTab("gamePlans")}
                        style={{ width: '100%' }}
                      >
                        Saved Lessons & Game Plan
                      </NavLink>
                    </NavItem>
                  </div>
                </div>
              </Nav>
            </div>
          </Nav>}
        </div>
        <div className="file-tab Nav-Home" style={{ color: "black" }}>
          <TabContent activeTab={activeTab}>
            {allTabs?.map((el, index) => {
              return (
                <TabPane key={index} tabId={el?.value}>
                  {el?.component ? (
                    <el.component
                      key={index}
                      activeCenterContainerTab={activeTab}
                    />
                  ) : (
                    <h1>{el?.name}</h1>
                  )}
                </TabPane>
              );
            })}
          </TabContent>
        </div>
      </div>
    </>
  );
};

export default NavHomePageCenterContainer;
