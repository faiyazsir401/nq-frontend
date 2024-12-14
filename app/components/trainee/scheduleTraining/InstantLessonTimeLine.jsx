import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, Form, FormGroup, Label } from 'reactstrap';
import moment from 'moment';
import { convertTimesToISO, Utils } from '../../../../utils/utils';
import { createPaymentIntentAsync } from '../trainee.slice';
import { authAction } from '../../auth/auth.slice';
import { useAppDispatch } from '../../../store';
import { BookedSession, LOCAL_STORAGE_KEYS } from '../../../common/constants';
import { RxCross2 } from 'react-icons/rx';
import { DateTime } from 'luxon';

const InstantLessons = [
  { label: '15 Minutes', duration: 15 },
  { label: '30 Minutes', duration: 30 },
  { label: '60 Minutes', duration: 60 },
  { label: '2 Hours', duration: 120 },
];

const indexedInstantLesson = {
  15: { label: '15 Minutes', duration: 15 },
  30: { label: '30 Minutes', duration: 30 },
  60: { label: '60 Minutes', duration: 60 },
  120: { label: '2 Hours', duration: 120 },
};

const getTimeRange = (duration, isSchedule, selectedSlot) => {
  if (isSchedule) {
    return {
      startTime: selectedSlot?.start,
      endTime: selectedSlot?.end,
      sessionStartTime: selectedSlot?.start,
      sessionEndTime: selectedSlot?.end,
    };
  }

  const now = moment();
  const startTime = moment(now).add(0, 'minutes');
  const endTime = moment(startTime).add(duration, 'minutes');
  console.log("getTimeRange", startTime, endTime);
  return {
    sessionStartTime: startTime.format('HH:mm'),
    sessionEndTime: endTime.format('HH:mm'),
    startTime: startTime,
    endTime: endTime,
  };
};

const InstantLessonTimeLine = ({
  isOpen,
  onClose,
  trainerInfo,
  userInfo,
  setBookSessionPayload,
  setAmount,
  startDate,
  isCommonBooking,
  setIsCommonBooking,
  selectedDate,
  selectedSlot,
}) => {
  const dispatch = useAppDispatch();
  const isTokenExists = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [slot, setSlot] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    console.log('prinitng', selectedLesson, trainerInfo, parseInt(trainerInfo?.extraInfo?.availabilityInfo?.selectedDuration));
    if (isCommonBooking) {
      setSelectedLesson(parseInt(trainerInfo.userInfo?.extraInfo?.availabilityInfo?.selectedDuration));
    }
  }, [trainerInfo, isCommonBooking, selectedSlot]);

  useEffect(() => {
    if (selectedLesson && isCommonBooking) {
      const tempSlot = getTimeRange(selectedLesson.duration, isCommonBooking);
      setSlot(tempSlot);
    }
  }, [selectedLesson, isCommonBooking]);

  const handleFormValidation = () => {
    if (couponCode.length > 50) {
      setFormError("Coupon code cannot exceed 50 characters.");
      return false;
    }
    setFormError("");
    return true;
  };

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
            setSelectedLesson(null);
            setIsCommonBooking(false);
          }}
        />
      </div>
      <div
        style={{
          padding: '20px',
        }}
      >
        <p
          style={{
            color: '#000080',
            fontSize: '18px',
            textAlign: 'center',
          }}
        >
          {isCommonBooking
            ? "Book your slot in advance to avoid waiting for the trainer to come online."
            : "Don't want to wait for a scheduled slot? Book an Instant Lesson and get started within just 2 minutes!"}
        </p>
        <div
          className="row"
          style={{
            width: '100%',
            margin: '0px auto',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
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
          {isCommonBooking && (
            <div
              className="col-5"
              style={{
                border: '2px solid #000080',
                cursor: 'pointer',
                padding: '10px 0px',
                margin: '5px 3px',
              }}
            >
              <b style={{ color: '#000080' }}>{indexedInstantLesson[selectedLesson]?.label}</b>
            </div>
          )}
        </div>
        <Form>
          <FormGroup noMargin>
            
            <Input
              type="text"
              id="couponCode"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className='mt-3 mb-0'
              style={{
                border: '2px solid #000080',
                color: '#000080'
              }}
              placeholder="Enter coupon code"
            />
          </FormGroup>
          {formError && <p style={{ color: 'red', fontSize: '14px' }}>{formError}</p>}
        </Form>
        <div className="col-12 mb-3 d-flex justify-content-center align-items-center">
          <Button
            type="button"
            disabled={!selectedLesson}
            className="mt-3 btn btn-sm btn-primary"
            onClick={async() => {
              if (!selectedLesson || !handleFormValidation()) {
                return;
              }

              const slot1 = getTimeRange(selectedLesson.duration);

              let startTime = isCommonBooking
                ? DateTime.fromFormat(selectedSlot?.start, "h:mm a").toFormat("HH:mm")
                : slot1?.sessionStartTime;
              let endTime = isCommonBooking
                ? DateTime.fromFormat(selectedSlot?.end, "h:mm a").toFormat("HH:mm")
                : slot1?.sessionEndTime;

              const amountPayable = Utils.getMinutesFromHourMM(
                startTime,
                endTime,
                trainerInfo?.userInfo?.extraInfo?.hourly_rate
              );
              let paymentIntentData;
              if (amountPayable > 0) {
                if (isTokenExists) {
                  dispatch(authAction.updateIsAuthModalOpen(false));
                  paymentIntentData = await dispatch(
                    createPaymentIntentAsync({
                      amount: +amountPayable.toFixed(1),
                      destination: trainerInfo?.userInfo?.stripe_account_id,
                      commission: trainerInfo?.userInfo?.commission,
                      customer: userInfo?.stripe_account_id,
                      couponCode: couponCode,
                    })
                  ).unwrap();
                  
                } else {
                  dispatch(authAction.updateIsAuthModalOpen(true));
                }

                const today = DateTime.now().toISO({
                  suppressMilliseconds: false,
                  includeOffset: false,
                }) + "Z";
                const payload = {
                  slot_id: slot?._id,
                  charging_price: (paymentIntentData?.data?.result?.amount/100) ?? amountPayable,
                  trainer_id: trainerInfo?.userInfo?._id || trainerInfo?.userInfo?.trainer_id,
                  trainer_info: trainerInfo,
                  hourly_rate: trainerInfo?.userInfo?.extraInfo?.hourly_rate,
                  status: BookedSession.booked,
                  booked_date: today,
                  session_start_time: startTime,
                  session_end_time: endTime,
                  start_time: convertTimesToISO(today, startTime),
                  end_time: convertTimesToISO(today, endTime),
                };
                setBookSessionPayload(payload);
                setAmount(amountPayable.toFixed(1));
                onClose(false);
              }
            }}
          >
            {isCommonBooking ? "Process to Checkout" : "Book Instant Lesson"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InstantLessonTimeLine;
