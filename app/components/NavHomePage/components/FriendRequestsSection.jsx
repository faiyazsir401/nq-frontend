import React from 'react';
import { Utils } from '../../../../utils/utils';

/**
 * FriendRequestsSection Component
 * Extracted from NavHomePage/index.jsx to improve maintainability
 * Displays and handles friend requests
 */
const FriendRequestsSection = ({
  friendRequests,
  isLoading,
  onAccept,
  onReject,
  width1000,
  width600,
}) => {
  if (!width1000 || !friendRequests || friendRequests.length === 0) {
    return null;
  }

  return (
    <div
      className={`${
        width600 ? 'col-sm-12' : width1000 ? 'col-sm-6' : 'col-sm-12'
      } ${!width1000 ? 'my-3' : ''}`}
      style={{
        height: width1000 ? '100%' : 'calc(100% - 400px)',
      }}
    >
      <div
        className="card trainer-profile-card Home-main-Cont"
        style={{ width: '100%', color: 'black', height: '100%' }}
      >
        <div className="card-body" style={{ height: '100%' }}>
          <h3
            style={{
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            Recent Friend Requests
          </h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {friendRequests.map((request, index) => (
              <div
                style={{
                  cursor: 'pointer',
                  border: '2px solid rgb(0, 0, 128)',
                  borderRadius: '5px',
                  display: 'flex',
                  gap: '5px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 5,
                  width: 'fit-content',
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
                      ) || '/assets/images/userdemo.png'
                    }
                    alt="Friend request"
                    onError={(e) => {
                      e.target.src = '/assets/images/demoUser.png';
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5,
                    marginTop: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <h5>
                    <b>{request.senderId?.fullname}</b>
                  </h5>

                  <div className="d-flex" style={{ gap: 5 }}>
                    <button
                      style={{
                        padding: 5,
                        marginTop: 5,
                        fontSize: 'revert-layer',
                      }}
                      className="btn btn-success btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAccept(request?._id);
                      }}
                      disabled={isLoading}
                    >
                      Accept
                    </button>
                    <button
                      style={{
                        padding: 5,
                        marginTop: 5,
                        fontSize: 'revert-layer',
                      }}
                      className="btn btn-danger btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReject(request?._id);
                      }}
                      disabled={isLoading}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestsSection;

