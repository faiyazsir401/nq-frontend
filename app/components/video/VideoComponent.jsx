// Video.js
import React, { forwardRef } from 'react';

const VideoComponent = forwardRef(({ src, poster, id, style, onTimeUpdate, ...props }, ref) => {
  return (
    <video
      id={id}
      style={style}
      ref={ref}
      onTimeUpdate={onTimeUpdate}
      
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