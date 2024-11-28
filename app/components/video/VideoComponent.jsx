// Video.js
import React, { forwardRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const VideoComponent = forwardRef(
  ({ 
    src, 
    poster, 
    id, 
    style, 
    onTimeUpdate, 
    videoController = false, 
    ...props 
  }, ref) => {
    const [showPoster, setShowPoster] = useState(false);

    // Set a timeout to show the poster after 5 seconds
    useEffect(() => {
      if(src){
        const timer = setTimeout(() => setShowPoster(true), 5000);
        return () => clearTimeout(timer); // Cleanup timer on unmount
      }
    }, []);
    console.log("showPoster",showPoster)
    return (
      <video
        id={id}
        style={style}
        ref={ref}
        onTimeUpdate={onTimeUpdate}
        muted={videoController}
        poster={showPoster ? poster : undefined}
        preload="metadata"
        playsInline
        {...props}
        crossOrigin="anonymous"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }
);

VideoComponent.displayName = 'VideoComponent';

// Add PropTypes for better type-checking
VideoComponent.propTypes = {
  src: PropTypes.string.isRequired,
  poster: PropTypes.string,
  id: PropTypes.string,
  style: PropTypes.object,
  onTimeUpdate: PropTypes.func,
  videoController: PropTypes.bool,
  props: PropTypes.object,
};

export default VideoComponent;
