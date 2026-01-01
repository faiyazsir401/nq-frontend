import React from 'react';
import LazyVideo from '../LazyVideo';
import { AccountType } from '../../../common/constants';
import { Utils } from '../../../../utils/utils';
import { Play, Pause } from 'react-feather';

/**
 * Clips container component for displaying selected video clips
 */
export const ClipsContainer = ({
  selectedClips,
  accountType,
  isPinned,
  pinnedUser,
  height,
  isIOS,
  selectedVideoRef1,
  selectedVideoRef2,
  progressBarRef,
  progressBarRef2,
  globalProgressBarRef,
  videoTime,
  isPlaying,
  videoController,
  handleTimeUpdate1,
  handleTimeUpdate2,
  togglePlay,
  handleProgressBarChange,
  handleGlobalProgressBarChange,
  globalSliderValue,
  formatTime,
}) => {
  if (!selectedClips?.length) return null;

  const isOnlyOneVideo = {
    height: isPinned ? '150px' : '73vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: isPinned ? '0px !important' : '-15px',
    marginLeft: isPinned ? '0px !important' : '-15px',
    paddingTop: '15px',
  };

  const isTwoVideos = {
    height: isPinned ? '150px' : '73vh',
    width: '100%',
    marginRight: isPinned ? '0px !important' : '-15px',
    marginLeft: isPinned ? '0px !important' : '-15px',
    margin: 'auto',
    paddingTop: '15px',
  };

  return (
    <div
      className={
        isPinned
          ? accountType === AccountType.TRAINER
            ? pinnedUser === 'user-video-1'
              ? height < 500
                ? 'switch-clips-container-for-mobile_1'
                : 'switch-clips-container_1'
              : height < 500
              ? 'scs2-mobile_1'
              : 'scs2_1'
            : accountType === AccountType.TRAINEE &&
              pinnedUser === 'user-video-1'
            ? height < 500
              ? 'scs2-mobile_1'
              : 'scs2_1'
            : height < 500
            ? 'switch-clips-container-for-mobile_1'
            : 'switch-clips-container_1'
          : 'row'
      }
      style={{
        zIndex: isPinned ? '999' : 'auto',
        backgroundColor: isPinned ? '#353535' : '',
        borderRadius: isPinned ? '10px' : '',
        padding: isPinned ? '10px' : '5px',
        marginTop: accountType === AccountType.TRAINER
          ? isPinned && selectedClips?.length && pinnedUser === 'user-video-1'
            ? isIOS
              ? '100px'
              : '65px'
            : !isPinned && selectedClips?.length
            ? '0px'
            : '35px'
          : isPinned && selectedClips?.length && pinnedUser === 'user-video-2'
          ? isIOS
            ? '100px'
            : '65px'
          : !isPinned && selectedClips?.length
          ? '0px'
          : '35px',
        top: accountType === AccountType.TRAINER
          ? isPinned && selectedClips?.length && pinnedUser === 'user-video-2'
            ? '0px'
            : ''
          : isPinned && selectedClips?.length && pinnedUser === 'user-video-2'
          ? ''
          : '0px',
        height:
          !isPinned && selectedClips?.length ? (isIOS ? '60vh' : '73vh') : '12vw',
        width: !isPinned && selectedClips?.length ? '90%' : '',
      }}
    >
      <div
        className="row"
        style={{
          ...(selectedClips?.length === 1 ? isOnlyOneVideo : isTwoVideos),
          width: '100%',
          margin: ' 0',
          height: isPinned
            ? '100%'
            : accountType === AccountType.TRAINER
            ? isIOS
              ? '48vh'
              : '63vh'
            : isIOS
            ? '48vh'
            : '63vh',
        }}
      >
        {selectedClips.length && selectedClips[0] ? (
          <div
            className="col-lg-6 col-md-6 col-sm-6 col-xs-12"
            style={{
              height: '100%',
              padding: 0,
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              alignItems: 'end',
            }}
          >
            <LazyVideo
              id="selected-video-1"
              style={{
                height: isPinned
                  ? '95%'
                  : accountType === AccountType.TRAINER
                  ? isIOS
                    ? '50vh'
                    : '63vh'
                  : isIOS
                  ? '55vh'
                  : '63vh',
                width: 'auto',
                maxWidth: '100%',
                objectFit: 'fit',
                aspectRatio: '9 / 16',
              }}
              ref={selectedVideoRef1}
              onTimeUpdate={handleTimeUpdate1}
              poster={Utils?.generateThumbnailURL(selectedClips[0])}
              src={Utils?.generateVideoURL(selectedClips[0])}
              videoController={videoController}
            />
            {accountType === AccountType.TRAINER &&
              !videoController &&
              !isPinned && (
                <>
                  <div
                    className="Pause"
                    style={{
                      position: 'relative',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      height: '5vw',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          marginRight: '10px',
                          fontSize: 'calc(12px + 1*(100vw - 320px) / 1600)',
                        }}
                      >
                        {videoTime?.currentTime1}
                      </p>
                    </div>
                    <div className="external-control-bar">
                      <button
                        className="btn btn-primary px-1 py-1 my-3 mr-2"
                        onClick={() => togglePlay('one')}
                        style={{ minWidth: '0px' }}
                      >
                        {isPlaying?.isPlaying1 ? (
                          <Pause
                            style={{ verticalAlign: 'middle', height: '2vw' }}
                          />
                        ) : (
                          <Play style={{ verticalAlign: 'middle', height: '2vw' }} />
                        )}
                      </button>
                    </div>
                    <input
                      className="wid-mid"
                      id="vid_id"
                      type="range"
                      ref={progressBarRef}
                      step="0.01"
                      value={selectedVideoRef1.current?.currentTime}
                      max={selectedVideoRef1.current?.duration || 100}
                      onChange={(e) => handleProgressBarChange(e, 'one')}
                    />
                    <div>
                      <p
                        style={{
                          margin: 0,
                          marginLeft: '10px',
                          fontSize: 'calc(12px + 1*(100vw - 320px) / 1600)',
                        }}
                      >
                        {videoTime?.remainingTime1}
                      </p>
                    </div>
                  </div>
                </>
              )}
          </div>
        ) : null}
        {selectedClips.length >= 2 && selectedClips[1] ? (
          <div
            className="col-lg-6 col-md-6 col-sm-6 col-xs-12"
            style={{
              height: '100%',
              padding: 0,
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <LazyVideo
              id="selected-video-2"
              style={{
                height: isPinned
                  ? '95%'
                  : accountType === AccountType.TRAINER
                  ? isIOS
                    ? '50vh'
                    : '63vh'
                  : isIOS
                  ? '55vh'
                  : '63vh',
                width: 'auto',
                maxWidth: '100%',
                objectFit: 'fit',
                aspectRatio: '9 / 16',
              }}
              ref={selectedVideoRef2}
              onTimeUpdate={handleTimeUpdate2}
              poster={Utils?.generateThumbnailURL(selectedClips[1])}
              src={Utils?.generateVideoURL(selectedClips[1])}
              videoController={videoController}
            />
            {accountType === AccountType.TRAINER &&
              !videoController &&
              !isPinned &&
              !isPlaying.isPlayingAll && (
                <>
                  <div
                    className="Pause2"
                    style={{
                      position: 'relative',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      height: '5vw',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          marginRight: '10px',
                          fontSize: 'calc(12px + 1*(100vw - 320px) / 1600)',
                        }}
                      >
                        {videoTime?.currentTime2}
                      </p>
                    </div>
                    <div className="external-control-bar">
                      <button
                        className="btn btn-primary px-1 py-1 my-3 mr-2 "
                        onClick={() => togglePlay('two')}
                        style={{ minWidth: '0px' }}
                      >
                        {isPlaying?.isPlaying2 ? (
                          <Pause
                            style={{ verticalAlign: 'middle', height: '2vw' }}
                          />
                        ) : (
                          <Play style={{ verticalAlign: 'middle', height: '2vw' }} />
                        )}
                      </button>
                    </div>
                    <input
                      type="range"
                      id="vid_id"
                      className="wid-mid"
                      ref={progressBarRef2}
                      step="0.01"
                      value={selectedVideoRef2.current?.currentTime}
                      max={selectedVideoRef2.current?.duration || 100}
                      onChange={(e) => handleProgressBarChange(e, 'two')}
                    />
                    <div>
                      <p style={{ margin: 0, marginLeft: '10px' }}>
                        {videoTime?.remainingTime2}
                      </p>
                    </div>
                  </div>
                </>
              )}
          </div>
        ) : null}
      </div>
      {accountType === AccountType.TRAINER && videoController && !isPinned && (
        <>
          <div
            className="Pause"
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginInline: 'auto',
              width: '100%',
              height: '3vw',
            }}
          >
            <div className="external-control-bar">
              <button
                className="btn btn-primary px-1 py-1 my-3 mr-2"
                style={{ minWidth: '0px' }}
                onClick={() => togglePlay('all')}
              >
                {isPlaying?.isPlayingAll ? (
                  <Pause style={{ verticalAlign: 'middle' }} />
                ) : (
                  <Play style={{ verticalAlign: 'middle' }} />
                )}
              </button>
            </div>
            <input
              type="range"
              ref={globalProgressBarRef}
              step="0.01"
              value={globalSliderValue}
              max={Math.max(
                selectedVideoRef1.current?.duration || 0,
                selectedVideoRef2.current?.duration || 0
              )}
              onChange={(e) => handleGlobalProgressBarChange(e)}
              style={{ width: '450px' }}
            />
          </div>
        </>
      )}
    </div>
  );
};

