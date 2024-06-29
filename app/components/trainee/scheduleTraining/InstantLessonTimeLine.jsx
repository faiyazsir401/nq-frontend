import React, { useState } from 'react';
import { Modal, Button } from 'reactstrap';
import moment from 'moment';
import { Utils } from '../../../../utils/utils';
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

const getTimeRange = (duration) => {
  const now = moment();
  const startTime = moment(now).add(2, 'minutes'); //NOTE - Start time is 10 minutes from now
  const endTime = moment(startTime).add(duration, 'minutes');

  return {
    sessionStartTime: startTime.format('HH:mm'),
    sessionEndTime: endTime.format('HH:mm'),
    startTime: startTime,
    endTime: endTime,
  };
};

const InstantLessonTimeLine = ({isOpen , onClose, trainerInfo, userInfo, setBookSessionPayload, setAmount, startDate}) => {
  const dispatch = useAppDispatch();
  const isTokenExists = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  const [selectedLesson, setSelectedLesson] = useState(null);

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
          Don't want to wait for a scheduled slot? Book an Instant Lesson and get started within just 2 minutes!
        </p>
        <div
        className='row'
        style={{
            width : '100%',
            margin : '0px auto',
            justifyContent : 'center',
            textAlign : 'center'
        }}>
        {InstantLessons.map((item, i) => {
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
        </div>
        <div className="col-12 mb-3 d-flex justify-content-center align-items-center">
          <Button
            type="button"
            disabled={!selectedLesson}
            className="mt-3 btn btn-sm btn-primary"
            onClick={() => {
              if (!selectedLesson) {
                return;
              }
              const slot = getTimeRange(selectedLesson.duration);
              console.log(slot)
             
              const amountPayable = Utils.getMinutesFromHourMM(
                slot?.sessionStartTime,
                slot?.sessionEndTime,
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
                  const payload = {
                    slot_id: slot?._id,
                    charging_price: amountPayable,
                    trainer_id: trainerInfo?.userInfo?._id || trainerInfo?.userInfo?.trainer_id || selectedTrainer?.trainer_id,
                    trainer_info: trainerInfo || selectedTrainer.data,
                    hourly_rate: trainerInfo?.userInfo?.extraInfo?.hourly_rate || selectedTrainer?.data?.extraInfo?.hourly_rate,
                    status: BookedSession.booked,
                    booked_date: startDate,
                    session_start_time: slot.sessionStartTime,
                    session_end_time: slot.sessionEndTime,
                    start_time: slot?.startTime,
                    end_time: slot?.endTime,
                  };
                  console.log(payload , 'payload')
                  setBookSessionPayload(payload);
                  setAmount(amountPayable.toFixed(1));
                  onClose(false);
              }
            }}
          >
            Book Instant Lesson
          </Button>
        </div>
      </div>
    </Modal>
  );
};



export default InstantLessonTimeLine;
