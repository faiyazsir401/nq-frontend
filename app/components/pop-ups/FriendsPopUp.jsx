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
import { getRecentStudent, getRecentTrainers } from "../NavHomePage/navHomePage.api";
import { Utils } from "../../../utils/utils";
import { useSelector } from "react-redux";
import { AccountType } from "../../common/constants";

// Sample friend data


const FriendsPopup = ({ props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]); // Array of selected friend IDs
  const [friendsList, setFreinds] = useState([]);
  const userInfo = useSelector((state) => state.auth.userInfo)

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

  const fetchRecentStudents = async () => {
    try {
      const response = await getRecentStudent();
      setFreinds(response?.data); // Set the fetched students in state
      console.log("fetched data" , response.data);
    } catch (error) {
      console.log("Error fetching recent students:", error);
    }
  };

  const getRecentTrainersApi = async () => {
    try {
      let res = await getRecentTrainers();
      setFreinds(res?.data);  // Store trainers in the same state variable
      console.log("Recent Trainers:", res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if(userInfo.account_type === AccountType.TRAINEE){
      getRecentTrainersApi();
    }else{
      fetchRecentStudents();
    }
  }, []);

  useEffect(() =>{
    props.setSelectedFriends(selectedFriends)
  },[selectedFriends])

  return (
    <div className="d-flex flex-direction-column my-2">
      <button
        className="m-auto px-3 py-2 rounded border-0"
        color="primary"
        onClick={toggle}
      >
        {props.buttonLabel}
      </button>

      <Modal isOpen={isOpen} toggle={toggle} centered={true} style={{maxWidth:'700px'}}>
        <ModalHeader>Select Friends</ModalHeader>
        <ModalBody>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {friendsList.map((friend) => (
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
              >
                <CardImg top src={Utils.getImageUrlOfS3(friend.profile_picture ) || "/assets/images/demoUser.png"} alt={'profile'} />
                <CardBody>
                  <CardTitle>{friend.fullname}</CardTitle>
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend._id)}
                    onChange={() => handleSelectFriend(friend._id)}
                    style={{ marginTop: "5px" }}
                  />
                </CardBody>
              </Card>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={confirmSelection}>
            Confirm Selection
          </Button>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default FriendsPopup;
