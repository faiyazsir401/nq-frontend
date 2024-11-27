// Video.js
import React, { forwardRef } from 'react';

const VideoComponent = forwardRef(({ src, poster, id, style, onTimeUpdate,videoController, ...props }, ref) => {
  console.log("videoController",videoController)
  return (
    <video
      id={id}
      style={style}
      ref={ref}
      onTimeUpdate={onTimeUpdate}
      muted={videoController}
      preload="metadata"
      playsInline
      {...props}
      crossOrigin="anonymous"
    >
      <source src={src}/>
      Your browser does not support the video tag.
    </video>
  );
});

VideoComponent.displayName = 'VideoComponent';

export default VideoComponent;