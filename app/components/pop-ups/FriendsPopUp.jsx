import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  Card,
  CardImg,
  CardTitle,
} from "reactstrap";
import { getFriends } from "../../common/common.api";
import { Utils } from "../../../utils/utils";
import { X } from "react-feather";
import "./common.css";
import { useMediaQuery } from "usehooks-ts";

const FriendsPopup = ({ props }) => {
  const [isOpen, setIsOpen] = useState(false);
  // const [selectedFriends, setSelectedFriends] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const width500 = useMediaQuery("(max-width:500px)")
  const toggle = () => setIsOpen((prev) => !prev);

  const handleSelectFriend = (id) => {
    props.setSelectedFriends((prev) =>
      prev.includes(id)
        ? prev.filter((friendId) => friendId !== id)
        : [...prev, id]
    );
  };

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response = await getFriends();
      console.log("Fetched friends:", response?.friends);
      setFriends(response?.friends || []);
    } catch (error) {
      console.error("Error fetching friends list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);
  

  useEffect(() => {
    props.setSelectedFriends(props.selectedFriends);
    if(!props.isFromCommunity){
      setIsOpen(true)
    }
  }, [props]);

  return (
    <div className="d-flex flex-direction-column my-2">
      <button className="m-auto px-3 py-2 rounded border-0" onClick={toggle}>
        {props.buttonLabel}
      </button>

      <Modal
        isOpen={isOpen}
        toggle={toggle}
        centered
        fade
        className="friends-modal"
        contentClassName="d-flex flex-column"
        style={{ height: '100vh' }}
      >
        <div
          className="d-flex justify-content-end p-2"
          style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}
        >
          <button type="button" className="close" onClick={toggle}>
            <X />
          </button>
        </div>

        <ModalBody
          className="d-flex flex-column p-0"
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            paddingBottom: '60px', // Space for the select button
            justifyContent:width500?"flex-start":"center"
          }}
        >
          {loading ? (
            <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
      
               flexWrap: "wrap",
                gap: "15px",
                padding: "15px",
                maxHeight:"80dvh",
                // height:"100%",
                overflowY: 'auto',
                marginTop:"20px"
              }}
            >
              {friends.map((friend) => {
                const profileImage =
                  friend.profile_picture
                    ? Utils.getImageUrlOfS3(friend.profile_picture)
                    : "/assets/images/demoUser.png";
                return (
                  <Card
                    key={friend._id}
                    style={{
                      width: "150px",
                      border: props.selectedFriends.includes(friend._id) ? "2px solid green" : "1px solid gray",
                      cursor: "pointer",
                      height: "fit-content"
                    }}
                    onClick={() => handleSelectFriend(friend._id)}
                    className="rounded"
                  >
                    <CardImg
                      top
                      style={{ minHeight: 145, maxHeight: 145, objectFit: "cover" }}
                      src={profileImage}
                      alt="profile"
                    />
                    <CardTitle className="text-center m-0 p-2 bg-secondary text-white">
                      {friend.fullname}
                    </CardTitle>
                    <input
                      className="position-absolute"
                      type="checkbox"
                      checked={props.selectedFriends.includes(friend._id)}
                      onChange={() => handleSelectFriend(friend._id)}
                      style={{ marginTop: "5px", right: "5px" }}
                    />
                  </Card>
                );
              })}
            </div>
          )}
          <div
            className="w-100 d-flex justify-content-center p-2"
          >
            <Button
              className="m-auto"
              style={{ backgroundColor: "rgb(83 233 89)" }}
              onClick={toggle}
            >
              Select
            </Button>
          </div>
        </ModalBody>


      </Modal>
    </div>
  );
};

export default FriendsPopup;