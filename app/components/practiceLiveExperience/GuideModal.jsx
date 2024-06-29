import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { RxCross2 } from "react-icons/rx";
const GuideModal = ({isOpen , onClose, noteOpen, setGuideTour}) => {
  return (
      <Modal 
      isOpen={isOpen}
      style={{
        width : '100%',
        height : '100%',
        display : 'flex',
        justifyContent : 'center',
        alignItems : 'center'
      }}>
        <div
      style={{
        display : 'flex',
        justifyContent : 'flex-end'
      }}
      >
      <RxCross2
        style={{
            fontSize : '22px',
            color : '#000080',
            margin : '5px 5px 0 0',
            cursor : 'pointer'
        }}
        onClick={()=>{
            onClose(false)
            setGuideTour(false)
        }}
      />
      </div>
        <ModalBody
        >
          <h3
          style={{
        //    textAlign : 'center',
           fontSize : '17px',
           margin : '10px auto'
          }}
          >Welcome to the NetQwix's Live Lesson Experience</h3>
          <p
          style={{
            margin : '0'
          }}
          >This is a guide to help you get started.</p>
          <p
            style={{
            margin : '0'
          }}
          >Kindly allow us your access to your camera and microphone and click on the next button</p>
          <div
          style={{
          display : 'flex' ,
          justifyContent : 'flex-end',
          marginTop :  '10px'
          }}
          >
            <Button color="primary"
          style={{
          padding : '8px 16px'
          }}
          onClick={() => {
            noteOpen(true)
            onClose(false)
            setGuideTour(true)
          }}
          >
            Next
          </Button>
          </div>
        </ModalBody>
      </Modal>
  );
};

export default GuideModal;
