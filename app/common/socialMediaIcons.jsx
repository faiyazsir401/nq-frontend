const SocialMediaIcons = ({
  social_media_links,
  isvisible,
  profileImageURL = null,
  isMobile = false,
}) => {
  const iconSize = isMobile ? "32px" : "40px";
  const iconGap = isMobile ? "8px" : "10px";
  
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center",
      marginTop: isMobile ? "5px" : "10px"
    }}>
      <ul className="custom-integration d-flex" style={{
        justifyContent: "center",
        alignItems: "center",
        gap: iconGap,
        margin: 0,
        padding: 0,
        listStyle: "none"
      }}>
        {social_media_links && social_media_links.fb &&
          <li style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <a
              className="fb"
              href={social_media_links && social_media_links.fb}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: iconSize,
                height: iconSize,
                borderRadius: "50%",
                backgroundColor: "#f0f0f0",
                color: "#1877F2",
                textDecoration: "none",
                transition: "all 0.3s ease",
                border: "1px solid #e0e0e0"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.backgroundColor = "#1877F2";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "#1877F2";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(24, 119, 242, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "#f0f0f0";
                e.currentTarget.style.color = "#1877F2";
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <i className={`fa fa-facebook ${isMobile ? "fa-md" : "fa-lg"}`} />
              {isvisible && <h5 style={{ margin: 0, marginLeft: "8px" }}>Facebook</h5>}
            </a>
          </li>}
        {social_media_links && social_media_links.instagram &&
          <li style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <a
              className="insta"
              href={social_media_links && social_media_links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: iconSize,
                height: iconSize,
                borderRadius: "50%",
                backgroundColor: "#f0f0f0",
                color: "#E4405F",
                textDecoration: "none",
                transition: "all 0.3s ease",
                border: "1px solid #e0e0e0"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.background = "linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(225, 48, 108, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "#f0f0f0";
                e.currentTarget.style.background = "#f0f0f0";
                e.currentTarget.style.color = "#E4405F";
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <i className={`fa fa-instagram ${isMobile ? "fa-md" : "fa-lg"}`} />
              {isvisible && <h5 style={{ margin: 0, marginLeft: "8px" }}>Instagram</h5>}
            </a>
          </li>}
        {social_media_links && social_media_links.twitter &&
          <li style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <a
              className="twi"
              href={social_media_links && social_media_links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: iconSize,
                height: iconSize,
                borderRadius: "50%",
                backgroundColor: "#f0f0f0",
                color: "#1DA1F2",
                textDecoration: "none",
                transition: "all 0.3s ease",
                border: "1px solid #e0e0e0"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.backgroundColor = "#1DA1F2";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "#1DA1F2";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(29, 161, 242, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "#f0f0f0";
                e.currentTarget.style.color = "#1DA1F2";
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <i className={`fa fa-twitter ${isMobile ? "fa-md" : "fa-lg"}`} />
              {isvisible && <h5 style={{ margin: 0, marginLeft: "8px" }}>Twitter</h5>}
            </a>
          </li>}
        {social_media_links && social_media_links.google &&
          <li style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <a
              className="ggl"
              href={social_media_links && social_media_links.google}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: iconSize,
                height: iconSize,
                borderRadius: "50%",
                backgroundColor: "#f0f0f0",
                color: "#0077B5",
                textDecoration: "none",
                transition: "all 0.3s ease",
                border: "1px solid #e0e0e0"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.backgroundColor = "#0077B5";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "#0077B5";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 119, 181, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "#f0f0f0";
                e.currentTarget.style.color = "#0077B5";
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <i className={`fa fa-linkedin ${isMobile ? "fa-md" : "fa-lg"}`} />
              {isvisible && <h5 style={{ margin: 0, marginLeft: "8px" }}>LinkedIn</h5>}
            </a>
          </li>}
        {social_media_links && social_media_links.slack &&
          <li style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <a
              className="slc"
              target="_blank"
              href={social_media_links && social_media_links.slack}
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: iconSize,
                height: iconSize,
                borderRadius: "50%",
                backgroundColor: "#f0f0f0",
                color: "#000080",
                textDecoration: "none",
                transition: "all 0.3s ease",
                border: "1px solid #e0e0e0"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.backgroundColor = "#000080";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "#000080";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 128, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "#f0f0f0";
                e.currentTarget.style.color = "#000080";
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <i className={`fa fa-globe ${isMobile ? "fa-md" : "fa-lg"}`} />
              {isvisible && <h5 style={{ margin: 0, marginLeft: "8px" }}>My Website</h5>}
            </a>
          </li>}
      </ul>
    </div>
  );
};

export default SocialMediaIcons;
