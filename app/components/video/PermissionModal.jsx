import React from 'react';
import { Modal, ModalBody } from 'reactstrap';
import device from '../../../public/assets/images/devices-allow.svg';

const PermissionModal = ({ isOpen, errorMessage }) => {
  return (
    <Modal
      isOpen={isOpen}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ModalBody
        style={{
          textAlign: 'center',
        }}
      >
        <img
          src={device?.src}
          alt="devices"
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
        />
        <h3
          style={{
            fontSize: '35px',
            color: '#555',
          }}
        >
          Click Allow{' '}
        </h3>
        <p
          style={{
            margin: '10 auto',
            fontSize: '16px'
          }}
        >
          {errorMessage}
        </p>
      </ModalBody>
    </Modal>
  );
};

export default PermissionModal;
