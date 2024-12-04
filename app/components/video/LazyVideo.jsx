// LazyVideo.js
import React, { forwardRef } from 'react';
import { useInView } from 'react-intersection-observer';
import VideoComponent from './VideoComponent';

const LazyVideo = forwardRef(({ src, poster, id, style, onTimeUpdate,videoController, ...props }, ref) => {
  const { ref: inViewRef, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  });

  const setRefs = React.useCallback(
    (node) => {
      inViewRef(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [inViewRef, ref]
  );

  if (!inView) {
    return <div ref={inViewRef} style={style} />;
  }

  return (
    <VideoComponent
      id={id}
      style={style}
      ref={setRefs}
      onTimeUpdate={onTimeUpdate}
      poster={poster}
      src={src}
      videoController={videoController}
      {...props}
    />
  );
});

LazyVideo.displayName = 'LazyVideo';

export default LazyVideo;

// import { useInView } from 'react-intersection-observer'

// function LazyVideo({ src, ...props }) {
//   const { ref, inView } = useInView({
//     threshold: 0,
//     triggerOnce: true
//   })

//   return (
//     <div ref={ref}>
//       {inView && <Video src={src} {...props} />}
//     </div>
//   )
// }