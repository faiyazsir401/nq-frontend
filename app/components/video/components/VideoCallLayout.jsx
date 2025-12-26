import React from 'react';
import { AccountType } from '../../../common/constants';
import { Utils } from '../../../../utils/utils';
import { getInitials } from '../../../../utils/videoCall';


const VideoCallLayout = ({
  accountType,
  fromUser,
  toUser,
  localStream,
  remoteStream,
  isFeedStopped,
  isRemoteVideoOff,
  displayMsg,
  videoRef,
  remoteVideoRef,
  selectedClips,
  isPinned,
  pinnedUser,
  onVideoClick,
  height,
}) => {
  return (
    <div className="row" id="bookings" style={{ height: '100%' }}>
      {/* User Video 1 - Remote User */}
      <div
        id="user-video-1"
        className={
          !selectedClips.length &&
          isPinned &&
          ((accountType === AccountType.TRAINER &&
            pinnedUser === 'user-video-1') ||
            (accountType === AccountType.TRAINEE &&
              pinnedUser === 'user-video-2'))
            ? 'switch-user-video w-auto'
            : selectedClips.length &&
              isPinned &&
              ((accountType === AccountType.TRAINER &&
                pinnedUser === 'user-video-1') ||
                (accountType === AccountType.TRAINEE &&
                  pinnedUser === 'user-video-2'))
            ? 'switch-user-video w-auto'
            : ''
        }
        onClick={() => onVideoClick('user-video-1')}
      >
        <video
          id="remote-user-video"
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '10px',
          }}
          ref={remoteVideoRef}
          autoPlay
        />
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: 'rgb(53,53,53)',
            borderRadius: '10px',
            display: displayMsg?.msg || isRemoteVideoOff ? 'flex' : 'none',
          }}
        >
          {toUser?.profile_picture ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src={Utils.getImageUrlOfS3(toUser?.profile_picture)}
                style={{
                  width: height < 500 ? '60px' : '100px',
                  height: height < 500 ? '60px' : '100px',
                  borderRadius: '5%',
                }}
                alt={toUser?.fullname}
              />
              <span style={{ color: 'white' }}>{toUser?.fullname}</span>
            </div>
          ) : (
            <div
              className="container-raj"
              style={{
                backgroundColor: Utils.charBasedColors(
                  Utils.capitalizeFirstChar(toUser.fullname)
                ),
              }}
            >
              <h1 className="text-box-raj">
                {getInitials(toUser?.fullname)}
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* User Video 2 - Local User */}
      <div
        id="user-video-2"
        className={
          !selectedClips.length &&
          isPinned &&
          ((accountType === AccountType.TRAINER &&
            pinnedUser === 'user-video-2') ||
            (accountType === AccountType.TRAINEE &&
              pinnedUser === 'user-video-1'))
            ? 'switch-user-video w-auto'
            : selectedClips.length &&
              isPinned &&
              ((accountType === AccountType.TRAINER &&
                pinnedUser === 'user-video-2') ||
                (accountType === AccountType.TRAINEE &&
                  pinnedUser === 'user-video-1'))
            ? 'switch-user-video w-auto'
            : ''
        }
        onClick={() => onVideoClick('user-video-2')}
      >
        <video
          id="end-user-video"
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '10px',
          }}
          ref={videoRef}
          autoPlay
        />
        <div
          style={{
            position: 'absolute',
            top: '0%',
            left: '0%',
            right: '0%',
            bottom: '0%',
            width: '100%',
            height: '100%',
            display: isFeedStopped ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgb(53,53,53)',
            borderRadius: '10px',
          }}
        >
          {fromUser.profile_picture ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src={Utils.getImageUrlOfS3(fromUser?.profile_picture)}
                style={{
                  width: height < 500 ? '60px' : '100px',
                  height: height < 500 ? '60px' : '100px',
                  borderRadius: '5%',
                }}
                alt={fromUser?.fullname}
              />
              <span style={{ color: 'white' }}>{fromUser?.fullname}</span>
            </div>
          ) : (
            <div
              className="container-raj"
              style={{
                backgroundColor: Utils.charBasedColors(
                  Utils.capitalizeFirstChar(fromUser.fullname)
                ),
              }}
            >
              <h1 className="text-box-raj">
                {getInitials(fromUser.fullname)}
              </h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallLayout;

