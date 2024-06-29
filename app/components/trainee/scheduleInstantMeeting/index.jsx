import { Table } from "reactstrap";
import { scheduleInstantMeetingMockDate } from "../../../common/constants";
import { useState } from "react";

const ScheduleInstantMeeting = ({ isClose }) => {
  const [instantMeeting, setInstantMeeting] = useState({ email: "" });
  return (
    <>
      <div className="d-flex justify-content-end mr-3">
        <h2
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={isClose}
        >
          &times;
        </h2>
      </div>
      <h3 className="d-flex justify-content-center font-weight-bold mb-4 ml-2">
        Schedule Instant Meeting
      </h3>
      <div>
        <Table bordered>
          <thead>
            <tr>
              <th className="font-weight-bold">
                <h5>Name</h5>
              </th>
              <th className="font-weight-bold">
                <h5>Email</h5>
              </th>
              <th className="font-weight-bold">
                <h5>Instant Meeting Request</h5>
              </th>
            </tr>
          </thead>
          <tbody>
            {scheduleInstantMeetingMockDate.map((data, index) => {
              const { email, id, name } = data;
              return (
                <tr key={`meeting-${index}`}>
                  <td>
                    <h5>{name}</h5>
                  </td>
                  <td>
                    <h5>{email}</h5>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() =>
                        setInstantMeeting({ ...instantMeeting, email })
                      }
                    >
                      Instant Meeting Request
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </>
  );
};
export default ScheduleInstantMeeting;
