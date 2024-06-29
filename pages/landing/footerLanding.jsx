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
      <div className="container">
        <div className="row border border-#ffecf2 m-2 rounded">
          <div className="col-lg-2 col-sm-3 mb-2">
            <img
              src="/assets/images/netquix_logo.png"
              alt="logo"
              className="mt-2"
              style={{
                maxWidth: "150px",
              }}
            />
          </div>
          <div className="col-sm-9 col-lg-10 ">
            <p className="mt-4">
              Are you ready to embark on a transformative journey towards your
              personal and professional development? We are here to
              revolutionize the way you learn and connect with expert trainers.
              Our cutting-edge platform.
            </p>
          </div>
        </div>
        {/* <div
          style={{
            width: "100%",
            display: "flex",
            border: "1px solid mistyrose",
            marginBottom: "5px",
            borderRadius: "5px",
          }}
        >
          <div className="row">

          
            <div className="col-md-6 col-sm-2 col-lg-1">
              <img
                src="/assets/images/netquix_logo.png"
                alt="logo"
                className={`${tabletView ? "ml-5" : "ml-3"}`}
                style={{
                  maxWidth: "105px",
                }}
              />
            </div>
            <div
              className={`col-8 ${tabletView ? "ml-5" : "ml-5"} mb-2`}
              style={{ marginTop: "33px" }}
            >
              <p>
                Are you ready to embark on a transformative journey towards your
                personal and professional development? We are here to
                revolutionize the way you learn and connect with expert
                trainers. Our cutting-edge platform.
              </p>
            </div>
          </div>
        </div> */}
        <div className="container mt-5">
          <div className="row">
            <div className="col-md-4 col-sm-2 col-lg-4 mb-4">
              <span>CATEGORIES</span>
              {masterRecords?.masterRecords?.category?.map((item, index) => {
                return (
                  <div className="mt-2" key={`item-${index}`}>
                    {item}
                  </div>
                );
              })}
            </div>
            <div className="col-md-4 col-sm-2 col-lg-4 mb-4">
              <div>
                {" "}
                <b>Quick access</b>
              </div>
              <div className="mt-2">
                {QUICK_ACCESS.map((accessItems, index) => {
                  return <div key={`item-${index}`}>{accessItems.label}</div>;
                })}
              </div>
            </div>
            <div className="col-md-4 col-sm-2 col-lg-4">
              <div>
                {" "}
                <b>New Comments</b>
              </div>
              <div className="mt-2">
                {NEW_COMMENTS.map((commentInfo, index) => {
                  return (
                    <div className="card bg-light my-2 " key={`item-${index}`}>
                      <div className="card-content p-2">
                        <div>
                          <b>{commentInfo.label}</b>
                          <p>{commentInfo.comment}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="row bg-primary p-3 m-2 justify-content-center">
          <span style={{ fontSize: "14px", color: "white" }}>
            All Copyright (c) 2023 Reserved
          </span>
        </div>
      </div>
    </>
  );
};

export default FooterLanding;
