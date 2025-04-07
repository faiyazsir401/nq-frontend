import React, { useState } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { useMediaQuery } from "usehooks-ts";

const ImageVideoThumbnailCarousel = (props) => {
  const [showVideo, setShowVideo] = useState(false);

  const images = props?.media?.map(
    ({ type, original, thumbnail, title, description, showVideo = false }) => {
      return type === "video"
        ? {
            original,
            title,
            thumbnail: `https://data.netqwix.com/${thumbnail}`,
            embedUrl: `https://data.netqwix.com/${original}`,
            description,
            renderItem: (item) => renderVideo(item),
          }
        : {
            original,
            title,
            thumbnail: `https://data.netqwix.com/${thumbnail}`,
            description,
            renderItem: (item) => renderImage(item),
          };
    }
  );

  const toggleShowVideo = () => {
    setShowVideo((prevState) => !prevState);
  };
  const width500 = useMediaQuery("(max-width:500px)")

  const renderLabels = (item) => (
    <>
      {item.description && (
        <div className="image-gallery-description">
          <div className={width500?"h6":"h3"}>{item?.title}</div>
          <div className="mt-2">{item?.description}</div>
        </div>
      )}
    </>
  );

  const videoRef = React.useRef(null);

    const handleVideoClick = (e) => {
      e.stopPropagation(); // Prevent parent div from interfering
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    };

  const renderVideo = (item) => {
    
    return (
      <div className="video-wrapper">
        {showVideo ? (
          <div className="video-container">
            <video
              ref={videoRef} 
              controls
              className="slider-iframe"
              poster={item.thumbnail}
              onClick={handleVideoClick}
            >
              <source src={item.embedUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="video-container">
            <button className="play-button" onClick={toggleShowVideo} />
            <img alt="sample video cover" className="image-gallery-image" src={item.thumbnail} />
            {renderLabels(item)}
          </div>
        )}
      </div>
    );
  };

  const renderImage = (item) => {
    return (
      <div className="image-container">
        <img alt="sample image" className="image-gallery-image" src={`https://data.netqwix.com/${item.original}`} />
        {renderLabels(item)}
      </div>
    );
  };

  return (
    <div className="carousel-container">
      <ImageGallery
        showThumbnails={true}
        showFullscreenButton={false}
        showPlayButton={false}
        showNav={true}
        items={images}
        thumbnailPosition="bottom"
      />
    </div>
  );
};

export default ImageVideoThumbnailCarousel;
