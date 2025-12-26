import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { addTrainerSlot, deleteTrainerSlot, getAvailability, updateTrainerSlot } from './calendar.api';
import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Star, X, Plus, Check } from "react-feather";
import interactionPlugin from '@fullcalendar/interaction'
import { useAppSelector } from '../../store';
import { authState } from '../auth/auth.slice';
import momentTimezonePlugin from '@fullcalendar/moment-timezone'
import axios from 'axios';
import { toast } from "react-toastify";
import Script from 'next/script';
import { Utils } from '../../../utils/utils';
import './calendar.scss';
function EventModal({ modal, setModal, toggle, data, selectedModalDate, setData, options, userTimeZone, ...args }) {

  const [showSelectTimeDiv, setShowSelectTimeDiv] = useState(false)
  const [disabledHourTime, setDisabledHourTime] = useState(["00", "04", "10"])
  const [disabledMinuteTime, setDisabledMinuteTime] = useState([])

  let [selectedStartTime, setSelectedStartTime] = useState("");
  let [selectedEndTime, setSelectedEndTime] = useState("");

  const [error, setError] = useState(false);
  const [indexErr, setIndexErr] = useState("");

  const overlap = () => {
    let status = false;

    if (!selectedStartTime && !selectedEndTime) {
      status = true;
      return status
    }

    if (selectedStartTime >= selectedEndTime) {
      status = true
      return status;
    }

    selectedStartTime = moment(selectedStartTime);
    selectedEndTime = moment(selectedEndTime);

    // Check for overlap
    for (const session of data) {
      const sessionStartTime = moment(session.start_time);
      const sessionEndTime = moment(session.end_time);

      if (
        selectedStartTime?.isBetween(
          sessionStartTime,
          sessionEndTime,
          null,
          "[]"
        ) ||
        selectedEndTime?.isBetween(
          sessionStartTime,
          sessionEndTime,
          null,
          "[]"
        ) ||
        (selectedStartTime?.isSameOrBefore(sessionStartTime) && selectedEndTime?.isSameOrAfter(sessionEndTime))
      ) {
        if (selectedStartTime?.isSame(sessionEndTime) || selectedEndTime?.isSame(sessionStartTime)) {
        } else {
          status = true;
          break; // Exit the loop if overlap is detected
        }
      }
    }
    return status;
  };


  const overlapEdit = (index) => {
    var newData = JSON.parse(JSON.stringify(data));
    newData.splice(index, 1)
    let status = false;

    selectedStartTime = moment(data[index]?.start_time);
    selectedEndTime = moment(data[index]?.end_time);

    if (selectedStartTime >= selectedEndTime) {
      status = true
      return status;
    }

    // Check for overlap
    for (const session of newData) {
      const sessionStartTime = moment(session.start_time);
      const sessionEndTime = moment(session.end_time);

      if (
        selectedStartTime?.isBetween(
          sessionStartTime,
          sessionEndTime,
          null,
          "[]"
        ) ||
        selectedEndTime?.isBetween(
          sessionStartTime,
          sessionEndTime,
          null,
          "[]"
        ) ||
        (selectedStartTime?.isSameOrBefore(sessionStartTime) && selectedEndTime?.isSameOrAfter(sessionEndTime))
      ) {
        if (selectedStartTime?.isSame(sessionEndTime) || selectedEndTime?.isSame(sessionStartTime)) {
        } else {
          status = true;
          break; // Exit the loop if overlap is detected
        }
      }
    }
    return status;
  };

  const addTrainerSlotAPI = async () => {

    // var date = selectedModalDate?.split("-")
    //   if ((!selectedStartTime || !selectedEndTime) || (selectedStartTime === selectedEndTime) || (new Date(selectedStartTime) < new Date(selectedEndTime))) setError(true)
    //   else {
    //     const filteredData = data.find(item => {
    //       var status = (new Date(item.start_time) <= new Date(selectedStartTime) && new Date(selectedStartTime) <= new Date(item?.end_time)) ||
    //         (new Date(item.start_time) <= new Date(selectedEndTime) && new Date(selectedEndTime) <= new Date(item?.end_time))

    //       var status2 = (new Date(selectedStartTime) <= new Date(item.start_time) && new Date(item?.end_time) >= new Date(selectedStartTime)) ||
    //         (new Date(selectedEndTime) <= new Date(item.start_time) && new Date(item?.end_time) >= new Date(selectedEndTime))

    //       return status && status2
    //     });
    //     if (filteredData?.start_time) setError(true)
    //     else {
    //       try {
    //         let res = await addTrainerSlot({ start_time: selectedStartTime, end_time: selectedEndTime })
    //         let updatedData = data
    //         data?.push(res?.data)
    //         setData([...data])
    //         setSelectedStartTime("")
    //         setSelectedEndTime("")
    //         setError(false)
    //       } catch (error) {
    //          
    //       }
    //     }
    //   }
    // Check for overlap



    if (overlap()) {
      setError(true)
       
    }
    else {
       
      try {
        let res = await addTrainerSlot({ start_time: selectedStartTime, end_time: selectedEndTime })
        let updatedData = data
        data?.push(res?.data)
        setData([...data])
        setSelectedStartTime("")
        setSelectedEndTime("")
        setError(false)
      } catch (error) {
         
      }
    }
  }

  const deleteTrainerSlotAPI = async (id, index) => {
    try {
      let res = await deleteTrainerSlot({ _id: id })
      data.splice(index, 1)
      setData([...data])
    } catch (error) {
       
    }
  }


  const updateTrainerSlotAPI = async (id, index) => {
    try {
      if (overlapEdit(index)) {
        setIndexErr(index)
      } else {
        let res = await updateTrainerSlot(data[index])
        toast.success("Slot updated successfully.", { type: "success" });
        setIndexErr("")
      }
    } catch (error) {
       
    }
  }

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: "10px",
  }
  const selectcontainerStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const labelStyle = {
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const selectStyle = {
    padding: '8px',
    fontSize: '16px',
    borderRadius: '4px',
  };

  useEffect(() => {
    let hourArr = data?.map((e) => {
      let str = moment(e?.start_time).format('h:mm a')
      let preFillhours = str?.split(" ")[0]?.split(":")[0].toString().padStart(2, 0)
      return preFillhours
    })
    setDisabledHourTime(hourArr)
  }, [data])


  return (
    <div>
      <Modal isOpen={modal} toggle={() => {
        setIndexErr("");
        setError(false);
        toggle();
      }} {...args}>
        <ModalBody>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: "-10px", right: "0px", background: "none" }} className="icon-btn btn-sm btn-outline-light close-apps pointer" onClick={() => {
              setIndexErr("")
              toggle()
            }} > <X /> </div>
            <div style={{ marginTop: "10px", marginBottom: "40px" }}><b>{Utils.getDateInFormat(selectedModalDate)}</b></div>

            {/* <div style={{ marginBottom: "20px" }} className="icon-btn btn-sm btn-outline-light close-apps pointer" onClick={() => { setShowSelectTimeDiv(true) }} > <Plus /> </div> */}
            <div style={containerStyle}>
              <div style={{ display: "flex", justifyContent: "flex-start", gap: "18px", flexWrap: "wrap", marginRight: "10px" }}>
                <div style={selectcontainerStyle}>
                  <select style={selectStyle} value={selectedStartTime} onChange={(e) => setSelectedStartTime(e.target.value)}>
                    <option hidden>
                      Start  Time
                    </option>
                    {options.map((time) => (
                      <option disabled={moment(time)?.tz(userTimeZone)?.isBefore(moment(new Date().toISOString())?.tz(userTimeZone))} key={time} value={time}>
                        {moment(time)?.tz(userTimeZone).format('h:mm a')}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={selectcontainerStyle}>
                  <select style={selectStyle} value={selectedEndTime} onChange={(e) => setSelectedEndTime(e.target.value)}>
                    <option hidden>
                      End Time
                    </option>
                    {options.map((time) => (
                      <option disabled={moment(time)?.tz(userTimeZone)?.isBefore(moment(new Date().toISOString())?.tz(userTimeZone))} key={time} value={time}>
                        {moment(time).tz(userTimeZone).format('h:mm a')}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <div style={selectcontainerStyle}>
                  <div className="icon-btn btn-sm btn-outline-light close-apps pointer" onClick={() => { setShowSelectTimeDiv() }} > <X /> </div>
                </div> */}
                <div style={selectcontainerStyle}>
                  <div className="icon-btn btn-sm btn-outline-light close-apps pointer" onClick={() => addTrainerSlotAPI()} >
                    <Button className="ml-4 p-3" color="primary" style={{
                      height: "0.75rem",
                      textAlign: "center",
                      alignItems: "center",
                      display: "flex"
                    }}
                    >Add</Button>
                  </div>
                </div>
              </div>
              {error && <div> <p style={{ color: "red", margin: "3px 0px -4px 2px" }}>Please select a valid start time and end time.</p></div>}
            </div>

            {showSelectTimeDiv && <hr />}
            {
              data?.map((e, index) => {
                return <div style={containerStyle}>
                  <div style={{ display: "flex", justifyContent: "flex-start", gap: "20px", flexWrap: "wrap", paddingRight: '10px' }}>
                    <div style={selectcontainerStyle}>
                      <label style={labelStyle}>Start  Time</label>
                      <select style={selectStyle} value={e?.start_time} onChange={(ev) => {
                        data[index].start_time = ev?.target?.value;
                        setData([...data])
                      }}>
                        {options.map((time) => (
                          <option disabled={moment(time)?.tz(userTimeZone)?.isBefore(moment(new Date().toISOString())?.tz(userTimeZone))} key={time} value={time}>
                            {moment(time).tz(userTimeZone).format('h:mm a')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={selectcontainerStyle}>
                      <label style={labelStyle}>End  Time</label>
                      <select style={selectStyle} value={e?.end_time} onChange={(ev) => {
                        data[index].end_time = ev?.target?.value;
                        setData([...data])
                      }}>
                        {options.map((time) => (
                          <option disabled={moment(time)?.tz(userTimeZone)?.isBefore(moment(new Date().toISOString())?.tz(userTimeZone))} key={time} value={time}>
                            {moment(time).tz(userTimeZone).format('h:mm a')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={selectcontainerStyle}>
                      <div style={{ marginTop: "27px", marginLeft: "20px" }} className="icon-btn btn-sm btn-outline-light close-apps pointer" onClick={() => { deleteTrainerSlotAPI(e?._id, index) }} >
                        <Button className="p-3"
                          style={{
                            height: "0.75rem",
                            textAlign: "center",
                            alignItems: "center",
                            display: "flex",
                            background: "#ff2b2bbd",
                          }}
                        >Delete</Button>
                      </div>
                    </div>
                    <div style={selectcontainerStyle}>
                      <div style={{ marginTop: "27px", marginLeft: "30px" }} className="icon-btn btn-sm btn-outline-light close-apps pointer" onClick={() => { updateTrainerSlotAPI(e?._id, index) }} >
                        <Button className="p-3" style={{
                          height: "0.75rem",
                          textAlign: "center",
                          alignItems: "center",
                          display: "flex",
                          background: "#ffc92b",
                        }}
                        >Update</Button>
                      </div>
                    </div>
                  </div>
                  {indexErr === index && <div> <p style={{ color: "red", margin: "3px 0px -4px 2px" }}>Please select a valid start time and end time.</p></div>}
                </div>
              })
            }
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}

export default function CalendarPage() {


  const { userInfo } = useAppSelector(authState);

  const [data, setData] = useState([])
  const [availabilityData, setAvailabilityData] = useState([])
  const [selectedDateEvent, setSelectedDateEvent] = useState([])
  const [modal, setModal] = useState(false);
  const [selectedModalDate, setSelectedModalDate] = useState("")
  const [options, setOptions] = useState([])
  const [userTimeZone, setUserTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [view, setView] = useState('dayGridMonth');
  //  

  useEffect(() => {
    if (userInfo?.extraInfo?.working_hours?.time_zone) {
      getIANATimeZone(userInfo?.extraInfo?.working_hours?.time_zone);
    }
  }, [userInfo?.extraInfo?.working_hours?.time_zone])

  const toggle = () => {
    setModal(!modal)
    setData([])
    getAllAvailability()
  };

  useEffect(() => {
    getAllAvailability();
  }, [])


  const getIANATimeZone = async (timezoneString) => {

    const matches = timezoneString.match(/\(UTC ([\+\-]\d+:\d+)\)/);
    const utcOffset = matches ? matches[1] : null;
    if (utcOffset === '-5:00') {
      return setUserTimeZone('America/New_York')
    }
    if (utcOffset === '-6:00') {
      return setUserTimeZone('America/Chicago')
    }
    if (utcOffset === '-7:00') {
      return setUserTimeZone('America/Denver')
    }
    if (utcOffset === '-8:00') {
      return setUserTimeZone('America/Los_Angeles')
    }
    if (utcOffset === '+5:30') {
      return setUserTimeZone('Asia/Calcutta')
    }
    const response = await axios.get('https://fullcalendar.io/api/demo-feeds/timezones.json');
    var timeZones = response.data;
    const ianaTimeZone = utcOffset ? timeZones.find((tz) => moment.tz(tz).utcOffset() === moment.duration(utcOffset).asMinutes()) : '';
    setUserTimeZone(ianaTimeZone)
  };



  const currentDateAndtime = (startDate) => {
    const currentDate = moment(startDate).tz(userTimeZone);
    return currentDate.format('YYYY-MM-DD');
  };

  //  .resolvedOptions().timeZone, "=====>", userTimeZone )

  // const currentDateAndtime = (startDate) => {
  //   // Create a new Date object for the current date
  //   const currentDate = new Date(startDate);
  //   // const currentDate = new Date(currentDateAndtimeEithTimeZone(startDate, userTimeZone));

  //   // Get the year, month, and day components
  //   const year = currentDate.getFullYear();
  //   const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-based
  //   const day = String(currentDate.getDate()).padStart(2, '0');

  //   // Format the date in the desired format
  //   const formattedDate = `${year}-${month}-${day}`;

  //    

  //   return formattedDate
  // }

  const getAllAvailability = async () => {
    var res = await getAvailability()
    setAvailabilityData(res?.data)
    var newData = await extractAvailabilities(res?.data)
    setData([...newData])
  }


  function extractAvailabilities(availabilitiesList) {
    const result = [];
    availabilitiesList?.forEach(availability => {
      const startTime = new Date(availability?.start_time);
      const endTime = new Date(availability?.end_time);
      result.push({
        start: startTime,
        end: endTime
      });
    });
    return result;
  }

  function generateTimeArray(selectedDate) {

    const start_time = moment.tz(selectedDate, userTimeZone).startOf('day');
    const end_time = moment.tz(selectedDate, userTimeZone).endOf('day');

    const timeArray = [];
    while (start_time <= end_time) {
      timeArray.push(start_time.toISOString());
      start_time.add(15, 'minutes');
    }
    setOptions([...timeArray])
  }


  // function generateTimeArray(selectedDate) {
  //   var date = new Date(selectedDate).toISOString().split("T")[0];
  //   var dateArr = date?.split("-");
  //   let start_time = new Date(Number(dateArr[0]), Number(dateArr[1]) - 1, Number(dateArr[2]), 0, 0, 0, 0)
  //   let end_time = new Date(Number(dateArr[0]), Number(dateArr[1]) - 1, Number(dateArr[2]), 23, 59, 0, 0)

  //   const timeArray = [];
  //   while (start_time <= end_time) {
  //     timeArray.push(start_time.toISOString());
  //     start_time.setMinutes(start_time.getMinutes() + 15);
  //   }
  //   setOptions([...timeArray])
  // }

  const handleSelectedModal = (date) => {
    // let find = availabilityData?.find((el) => el?._id === date)
    // var dateArr = date?.split("-");
    // let start_time = new Date(Number(dateArr[0]), Number(dateArr[1]) - 1, Number(dateArr[2]), 0, 0, 0, 0).toISOString()
    // let end_time = new Date(Number(dateArr[0]), Number(dateArr[1]) - 1, Number(dateArr[2]), 23, 59, 0, 0).toISOString()

    const start_time = moment.tz(date, userTimeZone).startOf('day');
    const end_time = moment.tz(date, userTimeZone).endOf('day');

    const filteredData = availabilityData?.filter(item => {
      return new Date(start_time) <= new Date(item.start_time) && new Date(item?.start_time) <= new Date(end_time)
    });
    setSelectedDateEvent(filteredData)
    setSelectedModalDate(date)
    generateTimeArray(date)
    setModal(true);
  }

  // const eventsInUserTimeZone = data.map(event => ({
  //   ...event,
  //   start: moment.tz(event.start, 'Asia/Kolkata').tz(userTimeZone).format(),
  //   end: moment.tz(event.end, 'Asia/Kolkata').tz(userTimeZone).format(),
  // }));

  const handleViewChange = (view) => {
     
    setView(view); // Update view state when the view changes
  };

  
  return (
    <div className={`calendar-container ${view === 'dayGridMonth' ? 'month-view' : 'week-day-view'}`} style={{ boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }} >
      <Script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.5/index.global.min.js" />
      {data?.length && userTimeZone && <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, momentTimezonePlugin]}
        headerToolbar={{ left: 'prev,next', center: 'title', right: 'dayGridMonth,dayGridWeek,dayGridDay' }}
        initialView='dayGridMonth'
        nowIndicator={true}
        editable={true}
        selectable={true}
        selectMirror={true}
        initialEvents={data}
        // initialEvents={eventsInUserTimeZone}
        width={500}
        height={680}
        timeZone={userTimeZone}
        dateClick={function (e) {
          var date = currentDateAndtime(e?.date)
          handleSelectedModal(date)
        }}
        viewDidMount={(arg) => handleViewChange(arg.view.type)} 
        datesSet={(arg) => handleViewChange(arg.view.type)} 

        eventContent={(e) => {
            return (
              <>
                <div style={{ display: "flex", width: "100%", justifyContent: "space-between", margin: "0px 10px", textAlign: "center" }}>
                  <div style={{ textWrap: 'pretty' }}>
                    <b>{moment(e.event.start).tz(userTimeZone).format('h:mm a')} - {moment(e.event.end).tz(userTimeZone).format('h:mm a')}</b>
                  </div>
                </div>
              </>
            )
          }}
      />}
      {!data?.length &&
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          headerToolbar={{ left: 'prev,next', center: 'title', right: '' }}
          initialView='dayGridMonth'
          nowIndicator={true}
          editable={true}
          selectable={true}
          selectMirror={true}
          initialEvents={[]}
          height={410}
          dateClick={function (e) {
            var date = currentDateAndtime(e?.date)
            handleSelectedModal(date)
          }}
          eventContent={(e) => {
            return (
              <>
                <div style={{ display: "flex", width: "100%", justifyContent: "space-between", margin: "0px 10px", textAlign: "center" }}>
                  <div style={{ textWrap: 'pretty' }}>
                    <b>{moment(e.event.start).tz(userTimeZone).format('h:mm a')} - {moment(e.event.end).tz(userTimeZone).format('h:mm a')}</b>
                  </div>
                </div>
              </>
            )
          }}
        />}
      <EventModal
        modal={modal}
        setModal={setModal}
        toggle={toggle}
        setData={setAvailabilityData}
        data={selectedDateEvent}
        selectedModalDate={selectedModalDate}
        options={options}
        userTimeZone={userTimeZone} />
    </div>
  )
}
