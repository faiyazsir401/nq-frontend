import React from 'react';
import Modal from 'react-modal';

// Custom styles for the modal
const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '20px',
    border:'0px'
  },
  overlay: {
    backgroundColor: 'white',
    zIndex: 1000,
  },
};

Modal.setAppElement('#__next'); // This is for accessibility reasons

const OrientationModal = ({ isOpen }) => (
  <Modal
    isOpen={isOpen}
    style={modalStyles}
    contentLabel="Orientation Modal"
    shouldCloseOnOverlayClick={false}
    shouldCloseOnEsc={false}
  >
    <img src={'/assets/images/rotate.png'} alt='Rotate Image' />
  </Modal>
);

export default OrientationModal;
