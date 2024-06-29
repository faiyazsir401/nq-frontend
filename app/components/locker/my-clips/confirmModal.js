import React from 'react'
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
const ConfirmModal = (
    {
        isModelOpen , 
        setIsModelOpen,
        selectedId,
        deleteFunc,
        closeModal,
    }
) => {
  return (
   <>
     <Modal isOpen={isModelOpen}>
          <ModalHeader>   
            <h5
            style={{
            fontSize : "22px !important"
          }}
            >Are you sure, you want to delete it</h5>
          </ModalHeader>
          <ModalBody>
            <div className="row"
            style={{
                justifyContent : "space-between"
            }}
            >
            <Button
                className="mx-3"
                color="primary"
                onClick={() => {
                  closeModal();
                }}
              >
                Cancel
              </Button>
              <Button
                className="mx-3"
                color="danger"
                onClick={() => {
                  deleteFunc(selectedId);
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