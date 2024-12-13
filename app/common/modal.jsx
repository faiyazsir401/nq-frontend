import React from "react";
import { Modal as ReactStrapModal, ModalBody, ModalFooter } from "reactstrap";

const Modal = ({
  isOpen,
  id,
  element,
  toggle,
  footer = false,
  width,
  allowFullWidth = false,
  height,
  overflowHidden = false,
  minHeight = false,
}) => {
  console.log("allowFullWidth", allowFullWidth);
  return (
    <ReactStrapModal
      className={`${
        allowFullWidth
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
        minHeight: minHeight ? "100vh" : null,
      }}
      onClick={() =>toggle && toggle()}
    >
      <ModalBody>{element}</ModalBody>
      {footer &&<ModalFooter>{footer}</ModalFooter>}
    </ReactStrapModal>
  );
};

export default Modal;
