import React, { useEffect, useState } from "react";
import WriteForm from "./WriteForm";
import "./contact.scss";
import { useAppDispatch, useAppSelector } from "../../store";
import { authState, getMeAsync } from "../auth/auth.slice";
import SessionsList from "./SessionsList";


import { HelpCircle, MessageSquare } from 'react-feather'; // Import Feather icons
import { AccountType } from "../../common/constants";
import AboutUs from "../aboutUs";

const CardComponent = ({ title, onClick, icon }) => {
  return (
    <div className="container">
      <div className="card mt-2 trainer-bookings-card d-flex justify-content-between" style={{ cursor: 'pointer' }}>
        <div className="card-body" onClick={onClick}>
          <div className="row">
            <div className="col d-flex align-items-center">
              <h3 className="ml-1">{title}</h3>
            </div>
            <div className="mr-3" style={{
              padding: '9px',
              backgroundColor: '#000080',
              color: '#fff',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {
                icon === "help-circle" ? <HelpCircle  size={24} /> : <MessageSquare  size={24} />
              }
            </div>
          </div>
        </div>
      </div>
    </div>  
  );
};

const ContactUs = () => {
  const dispatch = useAppDispatch();
  const { accountType } = useAppSelector(authState);
  const [isWriteFormOpen, setIsWriteFormOpen] = useState(false);
  const [isSessionListOpen, setIsSessionListOpen] = useState(false);
  useEffect(() => {
    dispatch(getMeAsync());
  }, []);
  return (
    <>
      {!isSessionListOpen ? (
        <div className="mt-5">
          <CardComponent
            title={accountType === AccountType.TRAINEE ? "Contact Us" : "Contact Us / Report Technical issue"}
            onClick={() => setIsWriteFormOpen(true)}
            icon="help-circle"
          />
          {
            accountType === AccountType.TRAINEE ?
              <CardComponent
                title="Report a Technical issue and Request for refund"
                onClick={() => setIsSessionListOpen(true)}
                icon="message-square"
              /> : null
          }
        </div>
      ) : (
        <SessionsList
          onClose={setIsSessionListOpen}
        />
      )}

      <WriteForm
        isOpen={isWriteFormOpen}
        setIsWriteFormOpen={setIsWriteFormOpen}
      />
     
      
      <AboutUs />
    </>
  );
};

export default ContactUs;
