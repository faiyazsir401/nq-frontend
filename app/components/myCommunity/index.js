import { useEffect, useState } from "react";
import { Nav, NavLink, NavItem, TabContent, TabPane } from "reactstrap";

import "photoswipe/style.css";
import { useAppDispatch } from "../../store";
import VideoUpload from "../../../app/components/videoupload";
import { useMediaQuery } from "usehooks-ts";
import { Utils } from "../../../utils/utils";
import { LOCAL_STORAGE_KEYS } from "../../common/constants";
import { getTraineeClips } from "../NavHomePage/navHomePage.api";
import Modal from "../../common/modal";
import { X } from "react-feather";
import StudentDetail from "../Header/StudentTab/StudentDetail";
import {
  getAllUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  removeFriend,
  getFriends,
} from "../../common/common.api";
import { toast } from "react-toastify";

const MyCommunity = (props) => {
  const dispatch = useAppDispatch();
  const [friends, setFriends] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudentData, SetselectedStudentData] = useState({});
  const [recentStudentClips, setRecentStudentClips] = useState([]);

  const getFriendsApi = async () => {
    try {
      let res = await getFriends();
      setFriends(res?.friends);
      console.log("Friends:", res);
    } catch (error) {
      console.log(error);
    }
  };

  const getFriendRequestsApi = async () => {
    try {
      let res = await getFriendRequests();
      setFriendRequests(res?.friendRequests);
      console.log("Friend Requests:", res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getFriendsApi();
    getFriendRequestsApi();
  }, []);

  const [activeTab, setActiveTab] = useState("friends");
  const [accountType, setAccountType] = useState("");

  const isMobileScreen = useMediaQuery("(max-width:1000px)");
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    setAccountType(localStorage.getItem(LOCAL_STORAGE_KEYS.ACC_TYPE));
  }, []);

  useEffect(() => {
    setActiveTab("friends");
  }, []);

  const handleCourseClick = (course, index, id) => {
    setIsOpen(true);
    getTraineeClipsApi(id);
  };

  const getTraineeClipsApi = async (id) => {
    try {
      let res = await getTraineeClips({ trainer_id: id });
      setRecentStudentClips(res?.data);
      console.log("Trainee Clips:", res);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      await sendFriendRequest({ receiverId: userId });
      toast.success("Friend request sent");
      setSearchData((prevData) =>
        prevData.map((user) =>
          user._id === userId ? { ...user, requestSent: true } : user
        )
      );
      getFriendRequestsApi();
    } catch (error) {
      toast.error(error);
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      await acceptFriendRequest({ requestId });
      toast.success("Friend request accepted");
      getFriendRequestsApi();
    } catch (error) {
      toast.error(error);
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    try {
      await rejectFriendRequest({ requestId });
      toast.success("Friend request rejected");
      getFriendRequestsApi();
    } catch (error) {
      toast.error(error);
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      await removeFriend({ friendId: userId });
      toast.success("Friend removed");
      getFriendsApi();
    } catch (error) {
      toast.error(error);
    }
  };

  const isFriend = (userId) => {
    return friends.some((friend) => friend._id === userId);
  };

  const isRequestSent = (userId) => {
    console.log(
      "isRequestSent",
      userId,
      friendRequests.some((request) => {
        console.log("request", request);
        if (request.receiverId._id === userId) {
          return true;
        }
        return false;
      })
    );
    return friendRequests.some((request) => request.senderId._id === userId);
  };

  return (
    <div
      className={`apps-content `}
      style={{
        margin: !isMobileScreen ? "30px" : "15px",
        marginTop: isMobileScreen ? "0px" : "30px",
      }}
      id="files"
    >
      {!isMobileScreen && <h2 className="mb-3">My Community</h2>}
      <div>
        <form
          className={`form-inline`}
          onSubmit={async (e) => {
            e.preventDefault();
            console.log("e12", searchTerm);
            const data = await getAllUsers({ search: searchTerm });
            setSearchData(data.result);
            setActiveTab("search");
            console.log("searchTerm", data);
          }}
        >
          <div
            className="form-group"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center", // Aligns items vertically in the center
              justifyContent: "space-between", // Ensures elements are spaced correctly
              gap: "8px", // Adds a gap between the input and button
            }}
          >
            <input
              className="form-control-plaintext"
              type="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: "1", // Allows the input to take up available space
                borderBottom: "2px solid gray",
                borderRadius: "0px",
              }}
            />
            <button
              className="btn btn-primary btn-sm"
              style={{
                fontSize: isMobileScreen ? "revert-layer" : "12px",
                whiteSpace: "nowrap", // Prevents the button text from wrapping
              }}
              type="submit"
              disabled={!searchTerm.trim()}
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <VideoUpload />
      <div className="theme-tab">
        <Nav tabs>
          <div
            className="row mb-2"
            style={{
              width: "100%",
              alignItems: "center",
              margin: "0px",
              gap: !isMobileScreen ? "20px" : "0px",
            }}
          >
            <div className="col" style={{ padding: "0px", marginTop: "10px" }}>
              <NavItem className="ml-5px">
                <NavLink
                  className={`button-effect ${
                    activeTab === "friends" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("friends");
                    getFriendsApi();
                  }}
                  style={{ width: "100%" }}
                >
                  Friends
                </NavLink>
              </NavItem>
            </div>
            <div
              className="col text-right"
              style={{ padding: "0px", marginTop: "10px" }}
            >
              <NavItem className="ml-5px">
                <NavLink
                  className={`button-effect ${
                    activeTab === "pending-requests" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("pending-requests");
                    getFriendRequestsApi();
                  }}
                  style={{ width: "100%" }}
                >
                  Requests
                </NavLink>
              </NavItem>
            </div>
          </div>
        </Nav>
      </div>
      <div className="file-tab">
        <TabContent activeTab={activeTab} className="custom-scroll">
          <TabPane tabId="search">
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 10,
                flexWrap: "wrap",
                width: "100%",
              }}
            >
              {searchData && searchData.length ? (
                searchData?.map((data, index) => {
                  return (
                    <div
                      style={{
                        cursor: "pointer",
                        border: "2px solid rgb(0, 0, 128)",
                        borderRadius: "5px",
                        display: "flex",
                        gap: "10px",
                        maxWidth: 300,
                        width: isMobileScreen ? "100%" : 300,
                        padding: 5,
                      }}
                      onClick={() => {
                        handleCourseClick(data, index, data?._id);
                        SetselectedStudentData({ ...data });
                      }}
                    >
                      <div>
                        <img
                          height={100}
                          width={100}
                          src={
                            Utils?.getImageUrlOfS3(data?.profile_picture) ||
                            "/assets/images/userdemo.png"
                          }
                          alt="Card image cap"
                          onError={(e) => {
                            e.target.src = "/assets/images/demoUser.png"; // Set default image on error
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 5,
                          marginTop: 10,
                        }}
                      >
                        <h5>
                          Name: <b>{data?.fullname}</b>
                        </h5>
                        <h5>
                          Type: <b>{data?.account_type}</b>
                        </h5>

                        {isFriend(data?._id) ? (
                          <button
                            style={{
                              padding: 5,
                              width: 100,
                              marginTop: 5,
                              fontSize: isMobileScreen
                                ? "revert-layer"
                                : "12px",
                            }}
                            className="btn btn-danger btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFriend(data?._id);
                            }}
                          >
                            Remove Friend
                          </button>
                        ) : isRequestSent(data?._id) || data.requestSent ? (
                          <button
                            style={{
                              padding: 5,
                              width: 100,
                              marginTop: 5,
                              fontSize: isMobileScreen
                                ? "revert-layer"
                                : "12px",
                            }}
                            className="btn btn-secondary btn-sm"
                            disabled
                          >
                            Already Sent
                          </button>
                        ) : (
                          <button
                            style={{
                              padding: 5,
                              width: 100,
                              marginTop: 5,
                              fontSize: isMobileScreen
                                ? "revert-layer"
                                : "12px",
                            }}
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendFriendRequest(data?._id);
                            }}
                          >
                            Add Friend
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "40px",
                    }}
                  >
                    <h5 className="block-title"> No Friends Found</h5>
                  </div>
                </>
              )}
            </div>
          </TabPane>
          <TabPane tabId="friends">
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 10,
                flexWrap: "wrap",
                width: "100%",
              }}
            >
              {friends && friends.length ? (
                friends?.map((data, index) => {
                  return (
                    <div
                      style={{
                        cursor: "pointer",
                        border: "2px solid rgb(0, 0, 128)",
                        borderRadius: "5px",
                        display: "flex",
                        gap: "10px",
                        maxWidth: 300,
                        width: isMobileScreen ? "100%" : 300,
                        padding: 5,
                      }}
                      onClick={() => {
                        handleCourseClick(data, index, data?._id);
                        SetselectedStudentData({ ...data });
                      }}
                    >
                      <div>
                        <img
                          height={100}
                          width={100}
                          src={
                            Utils?.getImageUrlOfS3(data?.profile_picture) ||
                            "/assets/images/userdemo.png"
                          }
                          alt="Card image cap"
                          onError={(e) => {
                            e.target.src = "/assets/images/demoUser.png"; // Set default image on error
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 5,
                          marginTop: 10,
                        }}
                      >
                        <h5>
                          Name: <b>{data?.fullname}</b>
                        </h5>
                        <h5>
                          Type: <b>{data?.account_type}</b>
                        </h5>

                        <button
                          style={{
                            padding: 5,
                            width: 100,
                            marginTop: 5,
                            fontSize: isMobileScreen ? "revert-layer" : "12px",
                          }}
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFriend(data?._id);
                          }}
                        >
                          Remove Friend
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "40px",
                    }}
                  >
                    <h5 className="block-title"> No Friends Found</h5>
                  </div>
                </>
              )}
            </div>
          </TabPane>
          <TabPane tabId="pending-requests">
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 10,
                flexWrap: "wrap",
                width: "100%",
              }}
            >
              {friendRequests && friendRequests.length ? (
                friendRequests?.map((request, index) => (
                  <div
                    style={{
                      cursor: "pointer",
                      border: "2px solid rgb(0, 0, 128)",
                      borderRadius: "5px",
                      display: "flex",
                      gap: "10px",
                      maxWidth: 300,
                      width: isMobileScreen ? "100%" : 300,
                      padding: 5,
                    }}
                    key={index}
                  >
                    <div>
                      <img
                        height={100}
                        width={100}
                        src={
                          Utils?.getImageUrlOfS3(
                            request.senderId?.profile_picture
                          ) || "/assets/images/userdemo.png"
                        }
                        alt="Card image cap"
                        onError={(e) => {
                          e.target.src = "/assets/images/demoUser.png"; // Set default image on error
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                        marginTop: 10,
                      }}
                    >
                      <h5>
                        Name: <b>{request.senderId?.fullname}</b>
                      </h5>
                      <h5>
                        Type: <b>{request.senderId?.account_type}</b>
                      </h5>

                      <button
                        style={{
                          padding: 5,
                          width: 100,
                          marginTop: 5,
                          fontSize: isMobileScreen ? "revert-layer" : "12px",
                        }}
                        className="btn btn-success btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptFriendRequest(request?._id);
                        }}
                      >
                        Accept
                      </button>
                      <button
                        style={{
                          padding: 5,
                          width: 100,
                          marginTop: 5,
                          fontSize: isMobileScreen ? "revert-layer" : "12px",
                        }}
                        className="btn btn-danger btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectFriendRequest(request?._id);
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "40px",
                    }}
                  >
                    <h5 className="block-title"> No Pending Requests</h5>
                  </div>
                </>
              )}
            </div>
          </TabPane>
        </TabContent>
      </div>

      <Modal
        isOpen={isOpen}
        element={
          <div className="container media-gallery portfolio-section grid-portfolio ">
            <div className="theme-title">
              <div className="media mb-4">
                <div className="logo" style={{ marginLeft: "70px" }}>
                  <img
                    src="/assets/images/netquix_logo_beta.png"
                    alt="Left Logo"
                    height="75px"
                    width="246px"
                  />
                </div>
                <div className="media-body media-body text-right">
                  <div
                    className="icon-btn btn-sm btn-outline-light close-apps pointer"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                  >
                    {" "}
                    <X />{" "}
                  </div>
                </div>
              </div>
              <StudentDetail
                videoClips={recentStudentClips}
                data={selectedStudentData}
              />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default MyCommunity;
