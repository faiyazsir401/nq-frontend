import moment from 'moment';
import React from 'react'
import { TRAINER_AMOUNT_USD } from '../../../common/constants';

const PaymentContent = ({bookSessionPayload}) => {
    return (
      <div>
        <h3>
          {" "}
          Trainer: {bookSessionPayload.trainer_info.fullname} (Price per hour $
          {bookSessionPayload?.trainer_info?.userInfo?.extraInfo?.hourly_rate ||
            TRAINER_AMOUNT_USD}
          ){" "}
        </h3>
        <h4 className="mt-3 mb-3">
          Booking time: {moment(bookSessionPayload?.booked_date).format("ll")} |
          From: {bookSessionPayload?.session_start_time} To:{" "}
          {bookSessionPayload?.session_end_time}
        </h4>
        <h4 className="mb-3">
          Price:
          <b>${bookSessionPayload?.charging_price}</b>
        </h4>
      </div>
    );
  };

export default PaymentContent