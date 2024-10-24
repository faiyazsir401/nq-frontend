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
  const [emails, setEmails] = useState([]); // State to hold multiple email inputs
  const [email, setEmail] = useState(''); // State to hold the current email input

  // Toggle the popup
  const toggle = () => setIsOpen((prev) => !prev);

  // Add a new email to the list
  const addEmail = (e) => {
    e.preventDefault();
    if(emails.includes(email)){
      alert("Email Already Entered.");
      return
    }
    if (email && isValidEmail(email)) {
      setEmails([...emails, email]);
      setEmail(''); // Clear the input after adding
    } else {
      alert("Please enter a valid email.");
    }
  };

  // Remove an email from the list
  const removeEmail = (index ,e ) => {
    e.preventDefault();
    const updatedEmails = emails.filter((_, idx) => idx !== index);
    setEmails(updatedEmails);
  };

  // Confirm selection of emails
  const confirmEmails = () => {
    console.log("Submitted Emails:", emails);
    toggle(); // Close the modal
    props.setSelectedEmails(emails); // Pass emails to the parent component if needed
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
        <ModalHeader>Add Multiple Emails</ModalHeader>
        <ModalBody>
          <Form>
            {/* Displaying the list of added emails */}
            {emails.length > 0 && (
              <ul className="mb-3">
                {emails.map((email, index) => (
                  <li key={index}>
                    {email}
                    <button className="bg-danger ml-2 px-2 rounded border-0 text-white" onClick={(e) => removeEmail(index ,e)}>
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <InputGroup className="mb-3 d-flex">
              <Input
                type="email"
                value={email}
                placeholder="Enter email address"
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                      addEmail(event)
                  }
                }}
              />
              <button className="bg-success text-white rounded border-0 px-3 ml-2" onClick={(e) => addEmail(e)}>
                Add Email
              </button>
            </InputGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={confirmEmails}>
            Confirm Emails
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
