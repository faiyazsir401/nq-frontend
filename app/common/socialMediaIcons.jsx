const SocialMediaIcons = ({
  social_media_links,
  isvisible,
  profileImageURL = null,
}) => {
  return (
    <div style={{marginTop:"-15px"}}>
      <ul className="custom-integration d-flex">
        <li>
          <div className="media">
            <div className="media-left">
              <a
                className="fb"
                href={social_media_links && social_media_links.fb}
                target="_blank"
              >
                <i className="fa fa-facebook  fa-lg" />
                {isvisible && <h5>Facebook </h5>}
              </a>
            </div>
            <div className="media-right">
              <div
                className="profile"
                style={{
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "block",
                }}
              >
                <img
                  className="bg-img"
                  src="/assets/images/contact/1.jpg"
                  alt="Avatar"
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>
        </li>
        <li>
          <div className="media">
            <div className="media-left">
              <a
                className="insta"
                href={social_media_links && social_media_links.instagram}
                target="_blank"
              >
                <i className="fa fa-instagram mr-1 fa-lg" />
                {isvisible && <h5>instagram</h5>}
              </a>
            </div>
            <div className="media-right">
              <div
                className="profile"
                style={{
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "block",
                }}
              >
                <img
                  className="bg-img"
                  src="/assets/images/contact/2.jpg"
                  alt="Avatar"
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>
        </li>
        <li>
          <div className="media">
            <div className="media-left">
              <a
                className="twi"
                href={social_media_links && social_media_links.twitter}
                target="_blank"
              >
                <i className="fa fa-twitter mr-1 fa-lg" />
                {isvisible && <h5>twitter </h5>}
              </a>
            </div>
            <div className="media-right">
              <div
                className="profile"
                style={{
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "block",
                }}
              >
                <img
                  className="bg-img"
                  src="/assets/images/contact/3.jpg"
                  alt="Avatar"
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>
        </li>
        <li>
          <div className="media">
            <div className="media-left">
              <a
                className="ggl"
                href={social_media_links && social_media_links.google}
                target="_blank"
              >
                <i className="fa fa-linkedin mr-1 fa-lg" />
                {isvisible && <h5>Linkedin</h5>}
              </a>
            </div>
            <div className="media-right">
              <div
                className="profile"
                style={{
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "block",
                }}
              >
                <img
                  className="bg-img"
                  src="/assets/images/contact/2.jpg"
                  alt="Avatar"
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>
        </li>
        <li>
          <div className="media">
            <div className="media-left">
              <a
                className="slc"
                target="_blank"
                href={social_media_links && social_media_links.slack}
              >
                {profileImageURL ? (
                  <img src={profileImageURL} width={20} alt="profileImageURL" />
                ) : (
                  <i className="fa fa-globe mr-1 fa-lg" />
                )}
                {isvisible && <h5>My website </h5>}
              </a>
            </div>
            <div className="media-right">
              <div className="profile">
                <a
                  href={social_media_links && social_media_links.slack}
                  target="_blank"
                />
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default SocialMediaIcons;
