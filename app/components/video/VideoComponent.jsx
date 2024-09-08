// Video.js
import React, { forwardRef } from 'react';

const VideoComponent = forwardRef(({ src, poster, id, style, onTimeUpdate, ...props }, ref) => {
  return (
    <video
      id={id}
      style={style}
      ref={ref}
      onTimeUpdate={onTimeUpdate}
      poster={poster}
      preload="metadata"
      playsInline
      {...props}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
});

VideoComponent.displayName = 'VideoComponent';

export default VideoComponent;