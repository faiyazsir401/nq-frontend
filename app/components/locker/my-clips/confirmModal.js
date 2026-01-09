import React from 'react'
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
const ConfirmModal = (
    {
        isModelOpen , 
        setIsModelOpen,
        selectedId,
        deleteFunc,
        closeModal,
        message
    }
) => {
  return (
   <>
     <Modal 
        isOpen={isModelOpen}
        centered
        toggle={closeModal}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
          <ModalHeader 
            toggle={closeModal}
            style={{ 
              textAlign: 'center',
              borderBottom: '1px solid #e0e0e0',
              padding: '20px 24px'
            }}
          >   
            <h5
              style={{
                fontSize: "20px",
                fontWeight: 600,
                margin: 0,
                color: "#333"
              }}
            >
              {`Are you sure? ${message ?? ""}`}
            </h5>
          </ModalHeader>
          <ModalBody style={{ padding: '24px' }}>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '8px'
              }}
            >
              <Button
                color="secondary"
                onClick={closeModal}
                style={{
                  minWidth: '100px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  border: 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onClick={() => {
                  deleteFunc(selectedId);
                }}
                style={{
                  minWidth: '100px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  transition: 'all 0.3s ease'
                }}
              >
                Delete
              </Button>
            </div>
          </ModalBody>
        </Modal>
   </>
  )
}

export default ConfirmModal