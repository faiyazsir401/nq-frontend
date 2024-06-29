import React from "react";
import { Modal as ReactStrapModal, ModalBody, ModalFooter } from "reactstrap";

const Modal = ({
  isOpen,
  id,
  element,
  toggle,
  footer = <></>,
  width,
  allowFullWidth = false,
  height,
  overflowHidden = false,
  minHeight = false,
}) => {
  return (
    <ReactStrapModal
      className={`${allowFullWidth
        ? "react-strap-modal-full"
        : "custom-react-strap-modal-full"
        } `}
      isOpen={isOpen}
      toggle={toggle}
      key={id}
      style={{
        width,
        height,
        overflow: overflowHidden ? "hidden" : null,
        margin: "0px",
        minHeight: minHeight ? "100vh" : null,
      }}
    >
      <ModalBody>{element}</ModalBody>
      <ModalFooter>{footer}</ModalFooter>
    </ReactStrapModal>
  );
};

export default Modal;
