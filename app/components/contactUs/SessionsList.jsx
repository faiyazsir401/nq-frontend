import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store';
import { bookingsState, getScheduledMeetingDetailsAsync } from '../common/common.slice';
import { FaArrowLeftLong } from "react-icons/fa6";
import SessionCard from './SessionCard';

const SessionsList = ({onClose}) => {
    const dispatch = useAppDispatch()
    const { scheduledMeetingDetails } = useAppSelector(bookingsState);
    useEffect(()=>{
        dispatch(getScheduledMeetingDetailsAsync());
    }, [])
  return (
    <>
     <div>
         <div
      style={{
        display : 'flex',
        justifyContent : 'flex-start'
      }}
      >
      <FaArrowLeftLong
        style={{
            fontSize : '22px',
            color : '#000080',
            margin : '5px 5px 0 0',
            cursor : 'pointer'
        }}
        onClick={()=>{
            onClose(false)
        }}
      />
      </div>
        <div className='container'>
            <h2 className='text-center'>Please select a session that you having the issue with</h2>
            {
                scheduledMeetingDetails?.map((data , i)=>{
                    return <SessionCard
                       key={i}
                       bookingInfo={data}
                       booking_index={i}
                    />
                })
            }
        </div>
     </div>
    </>
  )
}

export default SessionsList