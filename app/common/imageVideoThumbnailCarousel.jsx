import React from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import "./imageVideoThumbnailCarousel.css"; // Import the CSS file

class ImageVideoThumbnailCarousel extends React.Component {
  constructor(props) {
    super();
    this.state = {
      showGalleryPlayButton: true,
      showVideo: false,
    };

    this.images = props?.media?.map(
      ({ type, original, thumbnail, title, description, showVideo = false }) => {
        return type === "video"
          ? {
              original,
              title,
              thumbnail: `https://data.netqwix.com/${thumbnail}`,
              embedUrl: `https://data.netqwix.com/${original}`,
              description,
              renderItem: this._renderVideo.bind(this),
            }
          : {
              original,
              title,
              thumbnail: `https://data.netqwix.com/${thumbnail}`,
              description,
              renderItem: this._renderImage.bind(this),
            };
      }
    );
    this._toggleShowVideo = this._toggleShowVideo.bind(this);
  }

  _toggleShowVideo() {
    const { showVideo } = this.state;
    this.setState({ showVideo: !showVideo });
  }

  _renderVideo(item) {
    return (
      <div className="video-wrapper">
        {this?.state?.showVideo ? (
          <div className="video-container">
            <button className="close-video" onClick={this._toggleShowVideo} />
            <iframe
              className="slider-iframe"
              src={item.embedUrl}
              title="Video player"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="video-container">
            <button className="play-button" onClick={this._toggleShowVideo} />
            <img alt="sample video cover" className="image-gallery-image" src={item.thumbnail} />
            {this.renderLabels(item)}
          </div>
        )}
      </div>
    );
  }

  renderLabels = (item) => (
    <>
      {item.description && (
        <span className="image-gallery-description">
          <div className="h3">{item?.title}</div>
          <div className="mt-2">{item?.description}</div>
        </span>
      )}
    </>
  );

  _renderImage(item) {
    return (
      <div className="image-container">
        <img alt="sample image" className="image-gallery-image" src={`https://data.netqwix.com/${item.original}`} />
        {this.renderLabels(item)}
      </div>
    );
  }

  render() {
    return (
      <div className="carousel-container">
        <ImageGallery
          showThumbnails={true}
          showFullscreenButton={false}
          showPlayButton={false}
          showNav={true}
          items={this.images}
          thumbnailPosition="bottom"
        />
      </div>
    );
  }
}

export default ImageVideoThumbnailCarousel;