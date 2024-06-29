import React from "react";
import TimePicker from "rc-time-picker";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { authState } from "../../app/components/auth/auth.slice";
import { Utils } from "../../utils/utils";
import { Message, TimeZone } from "../../app/common/constants";
import { updateProfileAsync } from "../../app/components/trainer/trainer.slice";

const Addworkinghour = () => {
  const { userInfo } = useAppSelector(authState);
  const [workingHours, setWorkingHours] = useState({
    from: "09:00:00",
    to: "22:00:00",
    time_zone: "(GMT -5:00) Eastern Time (US & Canada)",
  });
  const [isTimeConflicts, setIsTimeConflicts] = useState(false);
  const dispatch = useAppDispatch();


  useEffect(() => {
    if(userInfo?.extraInfo){
      setWorkingHours(userInfo?.extraInfo?.working_hours)
    }
  }, [userInfo]);

  return (
    <div className="card-body change-number" style={{ boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px', margin: '3px', maxWidth: '99%' }}>
      <h5>Add your working hours...</h5>

      <div className="row">
        <div className="col-6 col-sm-3 col-md-3 col-lg-2" style={{ padding: "0px 10px" }}>
          <p className="ml-2" style={{ paddingTop: '10px', margin: 'auto' }}>From</p>
          <TimePicker

            name="from"
            className={`ml-2 mt-2 ${isTimeConflicts ? `border border-danger` : ``
              }  rounded`}
            placeholder="09:00 am"
            clearIcon={true}
            showSecond={false}
            minuteStep={5}
            // defaultValue={Utils.getFormattedTime(workingHours?.from)}
            value={Utils.getFormattedTime(workingHours?.from)}
            // defaultValue={
            //   userInfo &&
            //     userInfo?.extraInfo &&
            //     userInfo?.extraInfo?.working_hours
            //     ? Utils.getFormattedTime(
            //       userInfo?.extraInfo?.working_hours.from
            //     )
            //     : null
            // }
            use12Hours
            onChange={(value) => {
              if (value) {
                const fromTime =
                  Utils.getFormattedDateDb(value);
                const hasTimeConflicts = Utils.hasTimeConflicts(
                  fromTime,
                  workingHours?.to ?? "22:00:00"
                );
                setIsTimeConflicts(hasTimeConflicts);
                setWorkingHours((prev) => ({
                  ...prev,
                  from: fromTime,
                }));
              }
            }}
          />
          {isTimeConflicts && (
            <label className="mt-2 ml-2 text-danger">
              {/* {Message ? Message?.timeConflicts : ""} */}
            </label>
          )}
        </div>
        <div className="col-6 col-sm-3 col-md-3 col-lg-2" style={{ padding: "0px 10px" }}>
          <p className="ml-2" style={{ paddingTop: '10px', margin: 'auto' }}>To</p>
          <TimePicker
            name="to"
            className={`ml-2 mt-2 ${isTimeConflicts ? `border border-danger` : ``
              }  rounded`}
            clearIcon={true}
            // defaultValue={Utils.getFormattedTime(workingHours?.to)}
            value={Utils.getFormattedTime(workingHours?.to)}
            // defaultValue={
            //   userInfo &&
            //     userInfo?.extraInfo &&
            //     userInfo?.extraInfo?.working_hours
            //     ? Utils.getFormattedTime(
            //       userInfo?.extraInfo?.working_hours.to
            //     )
            //     : null
            // }
            placeholder="10:00 pm"
            showSecond={false}
            minuteStep={5}
            use12Hours
            onChange={(value) => {
              if (value) {
                const toTime = Utils.getFormattedDateDb(value);
                const hasTimeConflicts = Utils.hasTimeConflicts(
                  workingHours?.from ?? "09:00:00",
                  toTime
                );
                setIsTimeConflicts(hasTimeConflicts);
                setWorkingHours((prev) => ({
                  ...prev,
                  to: toTime,
                }));
              }
            }}
          />
          {isTimeConflicts && (
            <label className="mt-2 ml-2 text-danger">
              {/* {Message ? Message?.timeConflicts : ""} */}
            </label>
          )}
        </div>
        <div className="col-6 col-sm-3 col-md-3 col-lg-2" style={{ maxWidth: '30%' }}>
          <p className="ml-2" style={{ paddingTop: '10px', margin: 'auto' }}>Time Zone</p>
          <select
            name="timezone_offset"
            id="timezone-offset"
            className="timezone_offset mt-2 ml-2" style={{ maxWidth: '270px' }}
            value={workingHours?.time_zone}
            onChange={(event) => {
              const { value } = event.target;
              setWorkingHours((prev) => ({
                ...prev,
                time_zone: value,
              }));
            }}
          >
            {TimeZone.map(({ timezone, value }, index) => {
              return (
                <option key={`timezone_${index}`} value={value} >
                  {timezone}
                </option>
              );
            })}
          </select>
        </div>
        <div className="col-12">
          <button
            type="button"
            className="ml-2 btn btn-sm btn-primary"
            disabled={isTimeConflicts}
            onClick={() => {
              const working_hours = {
                working_hours: workingHours,
              };
              if (working_hours) {
                dispatch(
                  updateProfileAsync({
                    extraInfo: {
                      ...userInfo?.extraInfo,
                      ...working_hours,
                    },
                  })
                );
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
export default Addworkinghour;
