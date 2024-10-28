import React, { useEffect, useState } from "react";
import {
  getRecentStudent,
  getRecentTrainers,
} from "../NavHomePage/navHomePage.api";
import { Utils } from "../../../utils/utils";
import { useSelector } from "react-redux";
import { AccountType } from "../../common/constants";
// Sample friend data
import "./common.css";
import Modal from "../../common/modal";
import { Button, Card, CardImg, CardTitle } from "reactstrap";
const FriendsPopup = ({ props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]); // Array of selected friend IDs
  const [friendsList, setFreinds] = useState([]);
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

  const fetchRecentStudents = async () => {
    try {
      const response = await getRecentStudent();
      setFreinds(response?.data); // Set the fetched students in state
      console.log("fetched data", response.data);
    } catch (error) {
      console.log("Error fetching recent students:", error);
    }
  };

  const getRecentTrainersApi = async () => {
    try {
      let res = await getRecentTrainers();
      setFreinds(res?.data); // Store trainers in the same state variable
      console.log("Recent Trainers:", res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userInfo.account_type === AccountType.TRAINEE) {
      getRecentTrainersApi();
    } else {
      fetchRecentStudents();
    }
  }, []);

  useEffect(() => {
    props.setSelectedFriends(selectedFriends);
  }, [selectedFriends]);

  return (
    <div className="d-flex flex-direction-column my-2">
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
        element={
          <div style={{
         
            height:"100%",
            display:'flex',
            justifyContent:"center",
            alignItems:"center",
            flexDirection:"column",
            gap:"20px"
          }}>
            
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "start",
                  flexWrap: "wrap",
                  gap: "10px",
                  alignItems: "center",
                  maxWidth:"800px"
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
                    className="rounded"
                  >
                    <CardImg
                      top
                      style={{
                        minHeight: 145,
                        maxHeight: 145,
                        objectFit: "cover",
                      }}
                      src={
                        Utils.getImageUrlOfS3(friend.profile_picture) ||
                        "/assets/images/demoUser.png"
                      }
                      alt={"profile"}
                    />
                    <CardTitle className="text-center m-0 p-2 bg-secondary text-white">
                      {friend.fullname}
                    </CardTitle>
                    <input
                      className="position-absolute"
                      type="checkbox"
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => handleSelectFriend(friend._id)}
                      style={{ marginTop: "5px", right: "5px" }}
                    />
                  </Card>
                ))}
              </div>
            </div>
            <div style={{
              display:"flex",
              gap:"10px"
            }}>
              <Button color="primary" onClick={confirmSelection}>
                Confirm Selection
              </Button>
              <Button color="danger" onClick={toggle}>
                Close
              </Button>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default FriendsPopup;
