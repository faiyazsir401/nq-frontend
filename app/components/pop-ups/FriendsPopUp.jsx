import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Card,
  CardBody,
  CardImg,
  CardTitle,
} from "reactstrap";
import {
  getRecentStudent,
  getRecentTrainers,
} from "../NavHomePage/navHomePage.api";
import { Utils } from "../../../utils/utils";
import { useSelector } from "react-redux";
import { AccountType } from "../../common/constants";
// Sample friend data
import './common.css'
import { getFriends } from "../../common/common.api";
import { X } from "react-feather";
const FriendsPopup = ({ props }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedFriends, setSelectedFriends] = useState([]); // Array of selected friend IDs
  const [friends, setFriends] = useState([]);
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Toggle the popup
  const toggle = () => setIsOpen((prev) => !prev);

  // Handle selecting or deselecting a friend
  const handleSelectFriend = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id)
        ? prev.filter((friendId) => friendId !== id)
        : [...prev, id]
    );
  };

  // Confirm selection (can be used to perform some action)
  const confirmSelection = () => {
    console.log("Selected Friends IDs:", selectedFriends);
    toggle(); // Close the modal
  };

  const fetchFriends = async () => {
    try {
      const response = await getFriends();
      setFriends(response?.friends); // Set the fetched students in state
      console.log("fetched data", response?.friends);
    } catch (error) {
      console.log("Error fetching recent students:", error);
    }
  };


  useEffect(() => {
    fetchFriends()
  }, []);

  useEffect(() => {
    props.setSelectedFriends(selectedFriends);
  }, [selectedFriends]);

  return (
    <div className="d-flex flex-direction-column my-2  ">
      <button
        className="m-auto px-3 py-2 rounded border-0"
        color="primary"
        onClick={toggle}
      >
        {props.buttonLabel}
      </button>

      <Modal
        isOpen={isOpen}
        toggle={toggle}
        centered={true}
        style={{ maxWidth: "1440px" }}
        fade={true}
        className="friends-modal"

      >

        <ModalBody>
          <div style={{
            marginBottom: "50px"
          }}>
            <button type="button" className="close" onClick={toggle}>
              <X />
            </button>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: 'center',
              justifyContent: 'center',
              height: "50dvh",
              overflowY: "scroll"
            }}
          >
            {friends.map((friend) => (
              <Card
                key={friend._id}
                style={{
                  width: "150px",
                  border: selectedFriends.includes(friend._id)
                    ? "2px solid green"
                    : "1px solid gray",
                  cursor: "pointer",
                }}
                onClick={() => handleSelectFriend(friend._id)}
                className="rounded"
              >
                <CardImg
                  top
                  style={{ minHeight: 145, maxHeight: 145, objectFit: "cover" }}
                  src={
                    Utils.getImageUrlOfS3(friend.profile_picture) ||
                    "/assets/images/demoUser.png"
                  }
                  alt={"profile"}
                />
                <CardTitle className="text-center m-0 p-2 bg-secondary text-white">{friend.fullname}</CardTitle>
                <input
                  className="position-absolute"
                  type="checkbox"
                  checked={selectedFriends.includes(friend._id)}
                  onChange={() => handleSelectFriend(friend._id)}
                  style={{ marginTop: "5px", right: '5px' }}
                />
              </Card>
            ))}
            
          </div>
        </ModalBody>
        <ModalFooter className="d-flex">
          <Button className="m-auto" color="white" onClick={toggle} style={{ backgroundColor: 'rgb(83 233 89)' }}>
            Select
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default FriendsPopup;
