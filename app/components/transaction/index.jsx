import React, { useEffect, useState } from 'react'
import { Table } from 'reactstrap'
import { useAppDispatch, useAppSelector } from '../../store';
import { getTransactionDataAsync, transactionState } from './transaction.slice';
import { AccountType, LOCAL_STORAGE_KEYS } from '../../common/constants';
import { Utils } from '../../../utils/utils';
import { X } from "react-feather";

function Transaction(props) {
  const dispatch = useAppDispatch();
  const { transactionData } = useAppSelector(transactionState);
  const [accountType, setAccountType] = useState("");

  useEffect(() => {
    // if(accountType === AccountType.TRAINER){
    dispatch(getTransactionDataAsync());
    // }
  }, [dispatch]);

  useEffect(() => {
    setAccountType(localStorage.getItem(LOCAL_STORAGE_KEYS.ACC_TYPE));
  }, [dispatch]);

  const closeLeftSide = () => {
    props.smallSideBarToggle();
  };

  return (
    <div className={`notification-tab dynemic-sidebar custom-scroll ${props.tab === "transaction" ? "active" : ""}`} id="transaction">
      <div className="theme-title">
        <div className="media">
          <div>
            <h2>Transactions</h2>
          </div>
          <div className="media-body text-right">
            {" "}
            <a
              className="icon-btn btn-outline-light btn-sm close-panel"
              href="#"
              onClick={() => {
                closeLeftSide();
              }}
            >
              <X />
            </a>
          </div>
        </div>
      </div>
      <div style={{ maxHeight: '85vh', overflowY: 'auto',  }} className='transaction-table' >
        <Table responsive >
          <thead>
            <tr>
              <th>
                SL
              </th>
              <th>
                Booking Date
              </th>
              <th>
                Start Time
              </th>
              <th>
                End Time
              </th>
              <th>
                {accountType === AccountType.TRAINER ? "Trainee" : "Trainer"}
              </th>
              <th>
                Amount
              </th>
              {/* <th>
              Commission
            </th> */}
              <th>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {
              transactionData?.map((booking, index) => <tr key={booking._id} style={{ textAlign: "center" }}>
                <th scope="row">
                  {index + 1}
                </th>
                <td>
                  {Utils.getDateInFormat(booking.booked_date)}
                </td>
                <td>
                  {booking?.session_start_time}
                </td>
                <td>
                  {booking?.session_end_time}
                </td>
                <td>
                  {accountType === AccountType.TRAINER ? booking?.trainee_info?.fullName : booking?.trainer_info?.fullName}
                </td>
                <td>
                  {accountType === AccountType.TRAINER ?
                    ((booking?.amount ?? 0) - (booking?.application_fee_amount ?? 0)).toFixed(2) : (booking?.amount ?? 0)
                  }$
                </td>
                {/* <td>
            {booking?.application_fee_amount}$
            </td> */}
                <td>
                  {booking?.refund_status ?? booking?.status}
                </td>
              </tr>)
            }

          </tbody>
        </Table>
      </div>
    </div>
  )
}

export default Transaction
