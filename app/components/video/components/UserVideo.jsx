import React from 'react';
import { Utils } from '../../../../utils/utils';
import { getInitials } from '../../../../utils/videoCall';
import { AccountType } from '../../../common/constants';

/**
 * User video component with fallback to profile picture/initials
 */
export const UserVideo = ({
  videoRef,
  stream,
  user,
  isFeedStopped,
  displayMsg,
  isRemoteVideoOff,
  accountType,
  pinnedUser,
  selectedClips,
  isPinned,
  height,
  width500,
  isIOS,
  style,
  className,
  onClick,
}) => {
  // If user data is missing, avoid rendering to prevent runtime errors
  if (!user) {
    return null;
  }

  const showPlaceholder = displayMsg?.msg || isRemoteVideoOff || isFeedStopped;

  return (
    <div
      id={user.id}
      className={className}
      style={style}
      onClick={onClick}
    >
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted={!!user.isLocal}
        style={{
          width: '100%',
          position:
            accountType === AccountType.TRAINER
              ? pinnedUser === user.pinnedId
                ? 'relative'
                : 'absolute'
              : pinnedUser === user.pinnedId
              ? 'relative'
              : 'absolute',
          top: 0,
          height: user.height || '100%',
          objectFit: 'cover',
          borderRadius: '10px',
        }}
        id={user.videoId}
      />
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          width: '100%',
          height: user.height || '100%',
          display: showPlaceholder ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgb(53,53,53)',
          borderRadius: '10px',
        }}
      >
        {user.profile_picture ? (
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
              src={Utils.getImageUrlOfS3(user.profile_picture)}
              srcSet=""
              style={{
                width: height < 500 ? '60px' : '100px',
                height: height < 500 ? '60px' : '100px',
                borderRadius: '5%',
              }}
            />
            <span style={{ color: 'white' }}>{user.fullname || ''}</span>
          </div>
        ) : (
          <div
            className="container-raj"
            style={{
              backgroundColor: Utils.charBasedColors(
                Utils.capitalizeFirstChar(user.fullname || 'User')
              ),
            }}
          >
            <h1 className="text-box-raj">
              {getInitials(user.fullname || 'User')}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

