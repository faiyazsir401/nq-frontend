import React, { useEffect, useState } from "react";
import { NEW_COMMENTS, QUICK_ACCESS } from "../../app/common/constants";

const FooterLanding = (masterRecords) => {
  const [tabletView, setTableView] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => {
      setTableView(window.innerWidth >= 720 && window.innerWidth <= 1280);
    };
    window.addEventListener("resize", checkScreenWidth);
    checkScreenWidth();
    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);
  return (
    <>
      <div className="footer-landing-wrapper">
        <div className="container">
          <div className="row footer-landing-top">
            <div className="col-lg-2 col-md-3 col-12 footer-logo-col">
              <img
                src="/assets/images/netquix_logo_beta.png"
                alt="logo"
                className="footer-logo-img"
              />
            </div>
            <div className="col-lg-10 col-md-9 col-12">
              <p className="footer-description">
                NetQwix is a community where passionate Experts and Enthusiasts
                meet LIVE for "Qwick Sessions over the Net"
              </p>
            </div>
          </div>
          <div className="row footer-landing-links">
            <div className="col-md-6 col-lg-4 footer-link-col">
              <h6 className="footer-section-title">CATEGORIES</h6>
              <div className="footer-categories">
                {masterRecords?.masterRecords?.category?.map((item, index) => {
                  return (
                    <span className="footer-category-item" key={`item-${index}`}>
                      {item}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="col-md-6 col-lg-4 footer-link-col">
              <h6 className="footer-section-title">Quick access</h6>
              <ul className="footer-quick-access">
                {QUICK_ACCESS.map((accessItems, index) => {
                  return (
                    <li key={`item-${index}`}>
                      <a href={accessItems.link}>{accessItems.label}</a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          <div className="container">
            <div className="row">
              <div className="col-12 text-center">
                <span className="copyright-text">
                  All Copyright &copy; {new Date().getFullYear()} Reserved
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FooterLanding;
