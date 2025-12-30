import React from "react";
import { WHY_CHOOSE_US } from "../../common/constants";

export const WhyChooseUs = () => {
  return (
    <div className="why-choose-us">
      <div className="feat bg-gray pt-5 pb-5 why-choose-us-container">
        <div className="container">
          <div className="row">
            <div className="section-head col-sm-12">
              <h6>Why Choose Us?</h6>
              <p>
                NetQwix will revolutionize the way you learn by connecting LIVE
                with your Expert. Our cutting-edge platform empowers you to take
                LIVE Interactive Sessions with your favorite professionals,
                enhancing your skills and knowledge like never before.
              </p>
            </div>
            {WHY_CHOOSE_US.map((info, index) => {
              const totalItems = WHY_CHOOSE_US.length;
              const isLastTwoItems = index >= totalItems - 2 && totalItems % 3 !== 0;
              const isSecondToLast = index === totalItems - 2 && totalItems % 3 !== 0;
              
              // Wrap last 2 items in a centered container for desktop view only
              if (isSecondToLast) {
                return (
                  <React.Fragment key={`wrapper-${index}`}>
                    {/* Desktop view - centered wrapper */}
                    <div className="col-12 d-lg-block d-none last-row-wrapper">
                      <div className="row justify-content-center">
                        {WHY_CHOOSE_US.slice(index).map((item, idx) => (
                          <div 
                            className="col-lg-4 col-sm-6 col-12" 
                            key={`why-us-desktop-${index + idx}`}
                          >
                            <div className="item why-choose-us-item">
                              <span className="icon feature_box_col_one">
                                {item.icon}
                              </span>
                              <h6>
                                <div
                                  className="why-choose-us-title"
                                  style={{
                                    fontSize: "20px",
                                    textDecoration: "underline",
                                    textUnderlineOffset: "0.4em",
                                    textDecorationColor: "#000080",
                                  }}
                                >
                                  {item.title}
                                </div>
                              </h6>
                              <p className="why-choose-us-content">{item.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Mobile/Tablet view - render normally */}
                    {WHY_CHOOSE_US.slice(index).map((item, idx) => (
                      <div 
                        className="col-lg-4 col-sm-6 col-12 d-lg-none" 
                        key={`why-us-mobile-${index + idx}`}
                      >
                        <div className="item why-choose-us-item">
                          <span className="icon feature_box_col_one">
                            {item.icon}
                          </span>
                          <h6>
                            <div
                              className="why-choose-us-title"
                              style={{
                                fontSize: "20px",
                                textDecoration: "underline",
                                textUnderlineOffset: "0.4em",
                                textDecorationColor: "#000080",
                              }}
                            >
                              {item.title}
                            </div>
                          </h6>
                          <p className="why-choose-us-content">{item.content}</p>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                );
              }
              
              // Skip the last item on desktop as it's already rendered in the wrapper
              if (index === totalItems - 1 && totalItems % 3 !== 0) {
                return null;
              }
              
              return (
                <div 
                  className="col-lg-4 col-sm-6 col-12" 
                  key={`why-us-${index}`}
                >
                  <div className="item why-choose-us-item">
                    {" "}
                    <span className="icon feature_box_col_one">
                      {/* <i className="fa fa-globe" /> */}
                      {info.icon}
                    </span>
                    <h6>
                      <div
                        className="why-choose-us-title"
                        style={{
                          fontSize: "20px",
                          textDecoration: "underline",
                          textUnderlineOffset: "0.4em",
                          textDecorationColor: "#000080",
                        }}
                      >
                        {info.title}
                      </div>{" "}
                    </h6>
                    <p className="why-choose-us-content">{info.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
