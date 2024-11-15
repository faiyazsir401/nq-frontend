import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'reactstrap';
import moment from 'moment';
import { convertTimesToISO, Utils } from '../../../../utils/utils';
import { createPaymentIntentAsync } from '../trainee.slice';
import { authAction } from '../../auth/auth.slice';
import { useAppDispatch } from '../../../store';
import { BookedSession, LOCAL_STORAGE_KEYS } from '../../../common/constants';
import { RxCross2 } from 'react-icons/rx';

const InstantLessons = [
  { label: '15 Minutes', duration: 15 },
  { label: '30 Minutes', duration: 30 },
  { label: '60 Minutes', duration: 60 },
  { label: '2 Hours', duration: 120 },
];

const indexedInstantLesson = {
15:  { label: '15 Minutes', duration: 15 },
30:  { label: '30 Minutes', duration: 30 },
60: { label: '60 Minutes', duration: 60 },
120: { label: '2 Hours', duration: 120 },
}

const getTimeRange = (duration , isSchedule , selectedSlot) => {
  
  if(isSchedule){
    return {
      startTime: selectedSlot?.start,
      endTime: selectedSlot?.end,
      sessionStartTime: selectedSlot?.start,
      sessionEndTime: selectedSlot?.end,
    }
  }

  const now = moment();
  const startTime = moment(now).add(2, 'minutes');
  const endTime = moment(startTime).add(duration, 'minutes');
  console.log("getTimeRange",startTime,endTime)
  return {
    sessionStartTime: startTime.format('HH:mm'),
    sessionEndTime: endTime.format('HH:mm'),
    startTime: startTime,
    endTime: endTime,
  };
};

const InstantLessonTimeLine = ({isOpen , onClose, trainerInfo, userInfo, setBookSessionPayload, setAmount, startDate ,isCommonBooking ,setIsCommonBooking , selectedDate , selectedSlot}) => {
  const dispatch = useAppDispatch();
  const isTokenExists = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [slot ,setSlot ] = useState(null);
 
  useEffect(() =>{
    console.log('prinitng' , selectedLesson  , trainerInfo, parseInt(trainerInfo?.extraInfo?.availabilityInfo?.selectedDuration) )
    if(isCommonBooking){
      setSelectedLesson(parseInt(trainerInfo.userInfo?.extraInfo?.availabilityInfo?.selectedDuration))
    }
  },[trainerInfo , isCommonBooking , selectedSlot])

  useEffect(() =>{
    if(selectedLesson && isCommonBooking){
      const tempSlot = getTimeRange(selectedLesson.duration , isCommonBooking);
      setSlot(tempSlot)
    }
  }, [selectedLesson , isCommonBooking])

  return (
    <Modal isOpen={isOpen}>
          <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <RxCross2
          style={{
            fontSize: "22px",
            color: "#000080",
            margin: "5px 5px 0 0",
            cursor: "pointer",
          }}
          onClick={() => {
            onClose(false);
            setSelectedLesson(null)
            setIsCommonBooking(false)
          }}
        />
      </div>
      <div
      style={{
        padding : '20px'
      }}>
        <p
        style={{
            color : '#000080',
            fontSize : '18px',
            textAlign : 'center'
        }}
        >
          {isCommonBooking ?"Book your slot in advance to avoid waiting for the trainer to come online.":
          "Don't want to wait for a scheduled slot? Book an Instant Lesson and get started within just 2 minutes!"}
        </p>
        <div
        className='row'
        style={{
            width : '100%',
            margin : '0px auto',
            justifyContent : 'center',
            textAlign : 'center'
        }}>
        {!isCommonBooking && InstantLessons.map((item, i) => {
          return (
            <div
              key={i}
              onClick={() => setSelectedLesson(item)}
              className="col-5"
              style={{
                border: selectedLesson?.duration === item?.duration ? '3px solid green' : '2px solid #000080',
                cursor: 'pointer',
                padding: '10px 0px',
                margin: '5px 3px',
              }}
            >
              <b style={{ color: '#000080' }}>{item.label}</b>
            </div>
          );
        })}
        {isCommonBooking && <div
              className="col-5"
              style={{
                border: '2px solid #000080',
                cursor: 'pointer',
                padding: '10px 0px',
                margin: '5px 3px',
              }}
            >
              <b style={{ color: '#000080' }}>{indexedInstantLesson[selectedLesson]?.label }</b>
            </div>}
        </div>
        <div className="col-12 mb-3 d-flex justify-content-center align-items-center">
          <Button
            type="button"
            disabled={!selectedLesson}
            className="mt-3 btn btn-sm btn-primary"
            onClick={() => {
              console.log('onclick triggered');
              if (!selectedLesson ) {
                if(isCommonBooking && !selectedSlot){
                  return;
                }
                
                console.log('cancelling the onclick')
                return;
              }
              
              const slot1 = getTimeRange(selectedLesson.duration);
              console.log('onclick after return' , selectedSlot?.start , slot1?.sessionStartTime );
              
              const amountPayable = Utils.getMinutesFromHourMM(
                isCommonBooking ? selectedSlot.start : slot1?.sessionStartTime,
                isCommonBooking ? selectedSlot.end :  slot1?.sessionEndTime ,
                trainerInfo?.userInfo?.extraInfo?.hourly_rate
              );
              
              if (amountPayable > 0) {
                  if (isTokenExists) {
                    dispatch(authAction.updateIsAuthModalOpen(false));
                    dispatch(
                      createPaymentIntentAsync({
                        amount: +amountPayable.toFixed(1),
                        destination: trainerInfo?.userInfo?.stripe_account_id,
                        commission: trainerInfo?.userInfo?.commission,
                        customer: userInfo?.stripe_account_id,
                      })
                    );
                  } else {
                    dispatch(authAction.updateIsAuthModalOpen(true));
                  }
              
                  console.log("isCommonBooking",selectedSlot,slot1,startDate)

                  const payload = {
                    slot_id: slot?._id,
                    charging_price: amountPayable,
                    // trainer_id: trainerInfo?.userInfo?._id || trainerInfo?.userInfo?.trainer_id || selectedTrainer?.trainer_id,
                    // trainer_info: trainerInfo || selectedTrainer.data,
                    // hourly_rate: trainerInfo?.userInfo?.extraInfo?.hourly_rate || selectedTrainer?.data?.extraInfo?.hourly_rate,
                    trainer_id: trainerInfo?.userInfo?._id || trainerInfo?.userInfo?.trainer_id,
                    trainer_info: trainerInfo,
                    hourly_rate: trainerInfo?.userInfo?.extraInfo?.hourly_rate,
                    status: BookedSession.booked,
                    booked_date: startDate,
                    session_start_time:isCommonBooking ? selectedSlot.start   : slot1.sessionStartTime,
                    session_end_time: isCommonBooking ? selectedSlot.end  : slot1.sessionEndTime ,
                    start_time: isCommonBooking ?  convertTimesToISO(startDate , selectedSlot.start) :  convertTimesToISO(startDate , slot1.sessionStartTime) ,
                    end_time: isCommonBooking ?  convertTimesToISO(startDate , selectedSlot.end) :   convertTimesToISO(startDate , slot1.sessionEndTime),
                  };
                  console.log('onclick at payload',payload);
                  setBookSessionPayload(payload);
                  setAmount(amountPayable.toFixed(1));
                  onClose(false);
              }
            }}
          >
            {isCommonBooking ? "Process to Checkout": "Book Instant Lesson"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};



export default InstantLessonTimeLine;
