import Bookings from "../../bookings";
import { bookingsAction } from "../../common/common.slice";
const TrainerDashboardContainer = ({ accountType }) => {
  return <Bookings accountType={accountType} />;
};

export default TrainerDashboardContainer;
