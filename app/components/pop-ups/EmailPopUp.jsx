import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Form,
  Input,
  InputGroup,
} from "reactstrap";

const EmailsPopup = ({ props }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [email, setEmail] = useState('');

  // Toggle the popup
  const toggle = () => setIsOpen((prev) => !prev);

  // Add a new email to the list
  const addEmail = (newEmail) => {
    if (isValidEmail(newEmail)) {
      setEmail(newEmail); // Clear the input after adding
    } else {
      alert("Please enter a valid email.");
    }
  };

  // Handle input change, detecting space for adding emails
  const handleEmailChange = (e) => {
    const input = e.target.value;
    setEmail(input); // Update the email input state
  };

  // Handle key down events for adding or editing emails
  const handleKeyDown = (e) => {
    const trimmedEmail = email.trim();

    if (e.key === ' ') {
      e.preventDefault(); // Prevent space from being added in the input
      if (trimmedEmail) {
        addEmail(trimmedEmail); // Add the email if not empty
      }
    } else if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      if (trimmedEmail) {
        addEmail(trimmedEmail); // Add the email if not empty
      }
    }
  };

  // Confirm selection of emails
  const confirmEmails = () => {
    toggle(); // Close the modal
    props.setSelectedEmails([email]); // Pass emails to the parent component if needed
  };

  // Validate email format (basic validation)
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="d-flex flex-direction-column my-2">
      <button
        className="m-auto px-3 py-2 rounded border-0"
        color="primary"
        onClick={toggle}
      >
        {props.buttonLabel}
      </button>

      <Modal isOpen={isOpen} toggle={toggle} centered={true}>
        <ModalHeader>Add Email</ModalHeader>
        <ModalBody>
          <Form onSubmit={(e) => e.preventDefault()}>
            <InputGroup className="mb-3 d-flex">
              <div className="d-flex flex-wrap align-items-center w-100" style={{ gap: '5px', padding: '8px', border: '1px solid #ccc', borderRadius: '5px', minHeight: '40px' }}>
                <Input
                  type="text"
                  value={email}
                  placeholder="Enter email"
                  onChange={handleEmailChange}
                  onKeyDown={handleKeyDown}
                  style={{ border: 'none', outline: 'none', minWidth: '100px' }}
                />
              </div>
            </InputGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={confirmEmails}>
            Confirm Email
          </Button>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EmailsPopup;
