import React, { useEffect } from "react";
import ScheduleTraining from "../scheduleTraining";
import "./index.scss"

const TraineeDashboardContainer = ({openCloseToggleSideNav}) => {

  return <ScheduleTraining openCloseToggleSideNav={openCloseToggleSideNav}/>;
};

export default TraineeDashboardContainer;
