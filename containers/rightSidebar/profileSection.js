import React, { useContext, useEffect, useState } from "react";
import {
  X,
  Smartphone,
  Crosshair,
  MapPin,
  Share2,
  Trash2,
  ExternalLink,
  AlertCircle,
} from "react-feather";
import { Input, Label } from "reactstrap";
import ChatContext from "../../helpers/chatContext";
import Link from "next/link";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

const fiveImageGallary = [
  {
    mainColClass: "isotopeSelector filter",
    mediaClass: "media-big",
    src: "/assets/images/gallery/1.jpg",
    width: 150,
    height: 150,
  },
  {
    mediaClass: "media-small isotopeSelector filter",
    src: "/assets/images/gallery/2.jpg",
    width: 150,
    height: 150,
    Children: [
      {
        mediaClass: "media-small isotopeSelector filter",
        src: "/assets/images/gallery/3.jpg",
        width: 150,
        height: 150,
      },
    ],
  },
  {
    mediaClass: "media-small isotopeSelector filter",
    src: "/assets/images/gallery/4.jpg",
    width: 150,
    height: 150,
    Children: [
      {
        mediaClass: "media-small isotopeSelector filter fashion",
        src: "/assets/images/gallery/5.jpg",
        width: 150,
        height: 150,
      },
    ],
  },
];
const threeImageGallary = [
  { src: "/assets/images/gallery/2.jpg", width: 250, height: 250 },
  { src: "/assets/images/gallery/3.jpg", width: 250, height: 250 },
  { src: "/assets/images/gallery/4.jpg", width: 250, height: 250 },
];
const ProfileSection = (props) => {
  useEffect(() => {
    let lightbox = new PhotoSwipeLightbox({
      gallery: "#" + "my-test-gallery",
      children: "a",
      pswpModule: () => import("photoswipe"),
    });
    lightbox.init();

    let lightbox2 = new PhotoSwipeLightbox({
      gallery: "#" + "my-gallery",
      children: "a",
      pswpModule: () => import("photoswipe"),
    });
    lightbox2.init();
    return () => {
      lightbox.destroy();
      lightbox = null;
      lightbox2.destroy();
      lightbox2 = null;
    };
  }, []);

  const chatCtx = useContext(ChatContext);
  const selectedUser = chatCtx.selectedUser;
  const [collapseShow, setCollapseShow] = useState({
    shareDocument: true,
    shareMedia: true,
    starredMessage: true,
    commonGroups: true,
  });
  const { setProfileToggle, profileToggle } = useContext(ChatContext);

  const closeProfileSidebar = (toggle) => {
    setProfileToggle(!toggle);
    document.body.className = `sidebar-active main-page`;
    document.querySelector(".chitchat-main").classList.add("small-sidebar");
    document.querySelector(".app-sidebar").classList.add("active");
  };
  return (
    <aside className="chitchat-right-sidebar" id="slide-menu">
      <div className="custom-scroll right-sidebar">
        <div className="contact-profile">
          <div className="theme-title">
            <div className="media">
              <div>
                <h2>Profile</h2>
                <h4>Personal Information</h4>
              </div>
              <div className="media-body text-right">
                <Link
                  className="icon-btn btn-outline-light btn-sm close-profile ml-3"
                  href="#"
                  onClick={() => closeProfileSidebar(profileToggle)}
                >
                  <X />
                </Link>
              </div>
            </div>
          </div>
          <div className="details">
            <div
              className="contact-top"
              style={{
                backgroundImage: `url('/assets/images/${selectedUser?.thumb}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "block",
              }}
            >
              <img
                className="bg-img"
                src="/assets/images/avtar/2.jpg"
                alt=""
                style={{ display: "none" }}
              />
            </div>
            <div className="name">
              <h3>{selectedUser?.name}</h3>
              <h6>Add Description</h6>
            </div>
            <ul className="medialogo">
              <li>
                <Link
                  className="icon-btn btn-danger button-effect"
                  href="https://www.google.com/"
                >
                  <i className="fa fa-google"></i>
                </Link>
              </li>
              <li>
                <Link
                  className="icon-btn btn-primary button-effect"
                  href="https://twitter.com/"
                >
                  <i className="fa fa-twitter"></i>
                </Link>
              </li>
              <li>
                <Link
                  className="icon-btn btn-facebook button-effect"
                  href="https://www.facebook.com/"
                >
                  <i className="fa fa-facebook-f"></i>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="document">
          <div className="filter-block">
            <div
              className={`collapse-block ${
                collapseShow.shareDocument ? "open" : ""
              }`}
              onClick={() =>
                setCollapseShow({
                  ...collapseShow,
                  shareDocument: !collapseShow.shareDocument,
                  shareMedia: true,
                  starredMessage: true,
                  commonGroups: true,
                })
              }
            >
              <h5 className="block-title">
                Shared Document
                <label className="badge badge-success sm ml-2">3</label>
              </h5>
              <div
                className={`block-content ${
                  collapseShow.shareDocument ? "" : "d-none"
                }`}
              >
                <ul className="document-list">
                  <li>
                    <i className="ti-folder font-danger"></i>
                    <h5>Simple_practice_project-zip</h5>
                  </li>
                  <li>
                    <i className="ti-write font-success"></i>
                    <h5>Word_Map-jpg</h5>
                  </li>
                  <li>
                    <i className="ti-zip font-primary"></i>
                    <h5>Latest_Design_portfolio.pdf</h5>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="media-gallery portfolio-section grid-portfolio">
          <div
            className={`collapse-block ${
              collapseShow.shareMedia ? "open" : ""
            }`}
            onClick={() =>
              setCollapseShow({
                ...collapseShow,
                shareDocument: true,
                shareMedia: !collapseShow.shareMedia,
                starredMessage: true,
                commonGroups: true,
              })
            }
          >
            <h5 className="block-title">
              Shared Media
              <label className="badge badge-primary sm ml-2">2</label>
            </h5>
            <div
              className={`block-content ${
                collapseShow.shareMedia ? "" : "d-none"
              }`}
            >
              <div className="row share-media zoom-gallery">
                <div className="col-12">
                  <h6 className="mb-2">22/03/2019</h6>
                </div>
                <div className="pswp-gallery row mx-0" id="gallery">
                  {fiveImageGallary.map((image, index) => (
                    <div
                      key={index}
                      className={`col-4 ${
                        image.mainColClass ? image.mainColClass : ""
                      }`}
                    >
                      <div className={image.mediaClass}>
                        <div className="overlay">
                          <div className="border-portfolio">
                            <a
                              href={image.src}
                              data-pswp-width={image.width}
                              data-pswp-height={image.height}
                              rel="noreferrer"
                            >
                              <div className="overlay-background">
                                <i className="ti-plus" aria-hidden="true"></i>
                              </div>
                              <img src={image.src} alt="" />
                            </a>
                          </div>
                        </div>
                      </div>
                      {image.Children &&
                        image.Children.map((data, index2) => (
                          <div key={index2} className={data.mediaClass}>
                            <div className="overlay">
                              <div className="border-portfolio">
                                <div
                                  className="pswp-gallery"
                                  id="my-test-gallery"
                                >
                                  <a
                                    href={data.src}
                                    data-pswp-width={data.width}
                                    data-pswp-height={data.height}
                                    rel="noreferrer"
                                  >
                                    <div className="overlay-background">
                                      <i
                                        className="ti-plus"
                                        aria-hidden="true"
                                      ></i>
                                    </div>
                                    <img src={data.src} alt="" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
                <div className="col-12">
                  <h6 className="mb-2 mt-2">20/04/2019</h6>
                </div>
                <div className="pswp-gallery row mx-0" id="gallery">
                  {threeImageGallary.map((image, index) => (
                    <div className="col-4" key={ index}>
                      <div className="media-small isotopeSelector filter">
                        <div className="overlay">
                          <div className="border-portfolio">
                            <a
                              href={image.src}
                              data-pswp-width={image.width}
                              data-pswp-height={image.height}
                              
                              rel="noreferrer"
                            >
                              <div className="overlay-background">
                                <i className="ti-plus" aria-hidden="true"></i>
                              </div>
                              <img
                                src={image.src}
                                alt=""
                                className="img-fluid bg-img"
                              />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="status">
          <div
            className={`collapse-block ${
              collapseShow.starredMessage ? "open" : ""
            }`}
            onClick={() =>
              setCollapseShow({
                ...collapseShow,
                shareDocument: true,
                shareMedia: true,
                starredMessage: !collapseShow.starredMessage,
                commonGroups: true,
              })
            }
          >
            <h5 className="block-title">
              Starred Messages
              <label className="badge badge-outline-dark sm ml-2">2</label>
            </h5>
            <div
              className={`block-content ${
                collapseShow.starredMessage ? "" : "d-none"
              } `}
            >
              <div className="contact-chat p-0 m-0">
                <ul className="str-msg">
                  <li>
                    <div className="media">
                      <div
                        className="profile mr-4"
                        style={{
                          backgroundImage: `url('/assets/images/contact/2.jpg')`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          display: "block",
                        }}
                      >
                        <img
                          className="bg-img"
                          src="../assets/images/contact/2.jpg"
                          alt="Avatar"
                          style={{ display: "none" }}
                        />
                      </div>
                      <div className="media-body">
                        <div className="contact-name">
                          <h5>Alan josheph</h5>
                          <h6>01:35 AM</h6>
                          <ul className="msg-box">
                            <li>
                              <h5>Hi I am Alan,</h5>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="media">
                      <div
                        className="profile mr-4"
                        style={{
                          backgroundImage: `url('/assets/images/contact/3.jpg')`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          display: "block",
                        }}
                      >
                        <img
                          className="bg-img"
                          src="../assets/images/contact/3.jpg"
                          alt="Avatar"
                          style={{ display: "none" }}
                        />
                      </div>
                      <div className="media-body">
                        <div className="contact-name">
                          <h5>Josephin water</h5>
                          <h6>01:35 AM</h6>
                          <ul className="msg-box">
                            <li>
                              <h5>Can you help me to find best chat app?.</h5>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="status">
          <div
            className={`collapse-block ${
              collapseShow.commonGroups ? "open" : ""
            }`}
            onClick={() =>
              setCollapseShow({
                ...collapseShow,
                shareDocument: true,
                shareMedia: true,
                starredMessage: true,
                commonGroups: !collapseShow.commonGroups,
              })
            }
          >
            <h5 className="block-title">
              Common groups
              <label className="badge badge-outline-dark sm ml-2">3</label>
            </h5>
            <div
              className={`block-content ${
                collapseShow.commonGroups ? "" : "d-none"
              }`}
            >
              <ul className="group-main">
                <li>
                  <div className="group-box">
                    <div
                      className="profile"
                      style={{
                        backgroundImage: `url('/assets/images/avtar/teq.jpg')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "block",
                      }}
                    >
                      <img
                        className="bg-img"
                        src="../assets/images/avtar/teq.jpg"
                        alt="Avatar"
                        style={{ display: "none" }}
                      />
                    </div>
                    <div className="details">
                      <h5>Tech Ninjas</h5>
                      <h6>johan, deo, Sufiya Elija, Pabelo & you</h6>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="group-box">
                    <div
                      className="profile"
                      style={{
                        backgroundImage: `url('/assets/images/avtar/family.jpg')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "block",
                      }}
                    >
                      <img
                        className="bg-img"
                        src="../assets/images/avtar/family.jpg"
                        alt="Avatar"
                        style={{ display: "none" }}
                      />
                    </div>
                    <div className="details">
                      <h5>Family Ties</h5>
                      <h6>Mukrani, deo & you</h6>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="status other">
          <h5 className="block-title p-b-25">Contact info</h5>
          <ul>
            <li>
              <h5>
                <Link href="#">
                  <Smartphone />
                  +12 3456789587
                </Link>
              </h5>
            </li>
            <li>
              <h5>
                <Link href="https://themeforest.net/user/pixelstrap/portfolio">
                  <Crosshair />
                  https://pixelstrap
                </Link>
              </h5>
            </li>
            <li>
              <h5>
                <Link href="#">
                  <MapPin />
                  1766 Fidler Drive Texas, 78238.
                </Link>
              </h5>
            </li>
          </ul>
        </div>
        <div className="status status-switch">
          <ul>
            <li className="pl-0">
              <Label className="switch-green">
                <Input type="checkbox" />
                <span className="switch-state"></span>
              </Label>
              <Label className="label-right">Block</Label>
            </li>
            <li className="pl-0">
              <Label className="switch-green">
                <Input type="checkbox" />
                <span className="switch-state"></span>
              </Label>
              <Label className="label-right">Mute</Label>
            </li>
            <li className="pl-0">
              <Label className="switch-green">
                <Input type="checkbox" />
                <span className="switch-state"></span>
              </Label>
              <Label className="label-right">Get Notification</Label>
            </li>
          </ul>
        </div>
        <div className="status other">
          <ul>
            <li>
              <h5>
                <Link href="#">
                  <Share2 />
                  share Contact
                </Link>
              </h5>
            </li>
            <li>
              <h5>
                <Link href="#">
                  <Trash2 />
                  Clear Chat
                </Link>
              </h5>
            </li>
            <li>
              <h5>
                <Link href="#">
                  <ExternalLink />
                  Export Chat
                </Link>
              </h5>
            </li>
            <li>
              <h5>
                <Link href="#">
                  <AlertCircle />
                  Report Contact{" "}
                </Link>
              </h5>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default ProfileSection;
