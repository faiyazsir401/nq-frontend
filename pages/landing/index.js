import React, { useContext, useEffect, useState } from "react";
import Slider from "./sliderSection";
import Header from "../common/header";
import AboutApp from "./aboutApp";
import AboutChitChat from "./aboutChitChat";
import TeamWork from "./teamWork";
import Collaboration from "./collaboration";
import TeamExpert from "./teamExpert";
import SecureApp from "./secureApp";
import PricePlan from "./pricePlan";
import Subscribe from "./subscribe";
import Footer from "../common/footer";
import TapTop from "../common/tapTop";
import { useAppDispatch, useAppSelector } from "../../app/store";
import {
  getMasterDataAsync,
  masterState,
} from "../../app/components/master/master.slice";
import LandingHeader from "./landingHeader";
import { Container } from "reactstrap";
import Category from "./category";
import { divide } from "lodash";
import Course from "./course";
import FooterLanding from "./footerLanding";
import { WhyChooseUs } from "../../app/components/landing/whyChooseUs";
import { HowItWorks } from "../../app/components/landing/howItWorks";
import YourCourses from "./yourCourses";
import { SocketContext } from "../../app/components/socket";
import { authAction } from "../../app/components/auth/auth.slice";
import TopTrainers from "./TopTrainers";

const Landing = () => {
  const socket = useContext(SocketContext);
  const masterRecords = useAppSelector(masterState).master;
  const dispatch = useAppDispatch();
  const [data, setData] = useState();

  useEffect(() => {
    dispatch(getMasterDataAsync());
  }, []);

  useEffect(() => {
    setData(masterRecords.masterData);
  }, [masterRecords]);

  useEffect(() => {
    console.log(socket , 'socket')
    if(socket){

    socket.on('userStatus', (data) => {
      dispatch(authAction.updateOnlineUsers(data?.user))
    });

    socket.on('onlineUser', (data) => {
      console.log(data , 'onlineUser')
      dispatch(authAction.updateOnlineUsers(data?.user))
    });
    
    return () => {
      socket?.off('userStatus');
      socket?.off('onlineUser');
    };
  }
  }, [socket]);

  return (
    // <div>
    //   <Header />
    //   <Slider />
    //   <AboutApp />
    //   <AboutChitChat />
    //   <TeamWork />
    //   <SecureApp />
    //   <Collaboration />
    //   <TeamExpert />
    //   <PricePlan />
    //   <Subscribe />
    //   <Footer />
    //   <TapTop />
    //       </div>

    <React.Fragment>
      <LandingHeader masterRecords={data} />
      <div className="dropdown-divider"></div>
      {/* <div className="container-fluid"> */}
      <Category masterRecords={data} />
      {/* <Course masterRecords={data} /> */}
      <TopTrainers masterRecords={data}/>
      {/* <YourCourses /> */}
      <HowItWorks />
      <WhyChooseUs />
      <FooterLanding masterRecords={data} />
      {/* </div> */}
    </React.Fragment>
  );
};

export default Landing;
