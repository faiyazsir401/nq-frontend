import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/store";
import {
  authState,
  forgetPasswordAsync,
} from "../../../app/components/auth/auth.slice";
import { STATUS, routingPaths } from "../../../app/common/constants";
import { useRouter } from "next/router";
import Link from "next/link";

const ForgetPassword = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status } = useAppSelector(authState);
  const [forgetPassword, setForgetPassword] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      email: forgetPassword,
    };
    dispatch(forgetPasswordAsync(payload));
  };
  const redirectToSignInPage = () => {
    router.push(routingPaths.landing);
  };
  useEffect(() => {
    status === STATUS.fulfilled && redirectToSignInPage();
  }, [status]);
  return (
    <div className="login-page1">
      <div className="container-fluid p-0">
        <div className="row m-0">
          <div className="col-12 p-0">
            <div className="login-contain-main">
              <div className="left-page">
                <div className="login-content">
                <div className="login-content-header">
                    <Link href={routingPaths.landing}>
                      <img
                        src="/assets/images/netquix_logo.png"
                        alt="images"
                        className="image-fluid header-image-logo"
                      />
                    </Link>
                  </div>
                  {/* <h3>Hello Everyone , We are Chitchat</h3>
                  <h4>Welcome to chitchat please login to your account.</h4> */}
                  {/* <h3>Hello Everyone</h3> */}
                  <h4>Please enter your email to reset your password.</h4>
                  <form className="form1" onSubmit={handleSubmit} method="post">
                    <div className="form-group">
                      <label className="col-form-label" htmlFor="inputEmail3">
                        Email Address
                      </label>
                      {/* <input
                        className="form-control"
                        id="inputEmail3"
                        value={credential.email}
                        onChange={(e) => handleChange(e)}
                        name="email"
                        type="email"
                        placeholder="Demo@123gmail.com"
                      /> */}
                      <input
                        className="form-control"
                        id="inputEmail3"
                        name="email"
                        type="email"
                        placeholder="Enter email"
                        style={{ placeholder: "red" }}
                        value={forgetPassword}
                        onChange={(e) => setForgetPassword(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <div className="d-flex justify-content-center">
                        {/* <button
                          className="btn btn-primary button-effect mr-5"
                          type="button"
                          onClick={() => redirectToSignInPage()}
                        >
                          Back
                        </button> */}
                        <button
                          className="btn btn-primary button-effect"
                          type="submit"
                        >
                          Forgot Password
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              {/* <div className="right-page">
                <div className="right-login animat-rate">
                  <div className="animation-block">
                    <div className="bg_circle">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <div className="cross"></div>
                    <div className="cross1"></div>
                    <div className="cross2"></div>
                    <div className="dot"></div>
                    <div className="dot1"></div>
                    <div className="maincircle"></div>
                    <div className="top-circle"></div>
                    <div className="center-circle"></div>
                    <div className="bottom-circle"></div>
                    <div className="bottom-circle1"></div>
                    <div className="right-circle"></div>
                    <div className="right-circle1"></div>
                    <img
                      className="heart-logo"
                      src="/assets/images/login_signup/5.png"
                      alt="login logo"
                    />
                    <img
                      className="has-logo"
                      src="/assets/images/login_signup/4.png"
                      alt="login logo"
                    />
                    <img
                      className="login-img"
                      src="/assets/images/login_signup/1.png"
                      alt="login logo"
                    />
                    <img
                      className="boy-logo"
                      src="/assets/images/login_signup/6.png"
                      alt="login boy logo"
                    />
                    <img
                      className="girl-logo"
                      src="/assets/images/login_signup/7.png"
                      alt="girllogo"
                    />
                    <img
                      className="cloud-logo"
                      src="/assets/images/login_signup/2.png"
                      alt="login logo"
                    />
                    <img
                      className="cloud-logo1"
                      src="/assets/images/login_signup/2.png"
                      alt="login logo"
                    />
                    <img
                      className="cloud-logo2"
                      src="/assets/images/login_signup/2.png"
                      alt="login logo"
                    />
                    <img
                      className="cloud-logo3"
                      src="/assets/images/login_signup/2.png"
                      alt="login logo"
                    />
                    <img
                      className="cloud-logo4"
                      src="/assets/images/login_signup/2.png"
                      alt="login logo"
                    />
                    <img
                      className="has-logo1"
                      src="/assets/images/login_signup/4.png"
                      alt="login logo"
                    />
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
