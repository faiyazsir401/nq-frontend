import React, { useState } from "react";
import { useRouter } from "next/router";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Link from "next/link";
import { Eye, EyeOff } from "react-feather";
import { googleOAuthLink, routingPaths } from "../../../app/common/constants";
import { useAppDispatch } from "../../../app/store";
import {
  authAction,
  googleLoginAsync,
  loginAsync,
} from "../../../app/components/auth/auth.slice";

const Auth_SignIn = ({isRedirect = true}) => {
  const dispatch = useAppDispatch();
  const [credential, setCredential] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredential({ ...credential, [name]: value });
  };
  // simple  login
  const Login = () => {
    dispatch(authAction.updateIsRedirectToDashboard(isRedirect))
    dispatch(loginAsync({
      email:credential.email.toLowerCase(),
      password:credential.password
    }));
  };
  // const redirectToSignUpPage = () => {
  //   router.push("/auth/signUp");
  // };

  // const login = useGoogleLogin({
  //   onSuccess: async (codeResponse) => {
  //     await axios
  //       .get(`${googleOAuthLink}${codeResponse.access_token}`)
  //       .then((res) => {
  //         dispatch(googleLoginAsync({ email: res.data.email }));
  //       })
  //       .catch((err) =>  );
  //   },
  //   onError: (error) => {
  //      
  //   },
  // });

  return (   
    <div className="login-page1">
      <div className="container-fluid p-0">
        <div className="row m-0">
          <div className="col-12 p-0">
            <div className="login-contain-main">
              <div className={isRedirect ? "left-page" : "complete-width"}>
                <div className="login-content">
                  <div className="login-content-header">
                    <Link href={routingPaths.landing}>
                      {/* <div className="chitchat-loader"> */}
                      <img
                        src="/assets/images/netquix_logo_beta.png"
                        alt="images"
                        className="image-fluid header-image-logo"
                      />
                  {/* </div> */}
                    </Link>
                  </div>
                  {/* <h3>Hello Everyone , We are Chitchat</h3>
                  <h4>Welcome to chitchat please login to your account.</h4> */}
                  <h3 className="header-text">Welcome</h3>
                  <h4>Please login to your account.</h4>
                  <form className="form1">
                    <div className="form-group">
                      <label className="col-form-label" htmlFor="inputEmail3">
                        Email Address
                      </label>
                      <input
                        className="form-control"
                        id="inputEmail3"
                        value={credential.email}
                        onChange={(e) => handleChange(e)}
                        name="email"
                        type="email"
                        placeholder="Enter email"
                        style={{ placeholder: "red" }}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        className="col-form-label"
                        htmlFor="inputPassword3"
                      >
                        Password
                      </label>
                      <span> </span>
                      <div style={{ position: "relative" }}>
                        <input
                          className="form-control"
                          id="inputPassword3"
                          value={credential.password}
                          onChange={(e) => handleChange(e)}
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          style={{ paddingRight: "40px" }}
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            color: "#6c757d",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="rememberchk">
                        <div className="input-text form-check pl-0">
                          <input
                            type="checkbox"
                            id="gridCheck1"
                            aria-label="Checkbox for following text input"
                          />
                          <label
                            className="form-check-label ml-2 mr-auto"
                            htmlFor="gridCheck1"
                          >
                            Remember Me.
                          </label>
                          <h6
                            className="pointer"
                            onClick={() => {
                              router.push(routingPaths.forgetPassword);
                            }}
                          >
                            Forgot Password?
                          </h6>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="buttons" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                        <div
                          className="btn btn-primary button-effect"
                          onClick={() => Login()}
                          style={{ width: "100%", maxWidth: "400px", padding: "12px 24px", fontSize: "16px", fontWeight: "500" }}
                        >
                          Login
                        </div>
                      </div>
                    </div>
                  </form>
                  <div className="line">
                    <h6>OR</h6>
                  </div>
                  <div className="form-group">
                    <div className="buttons" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                      <Link
                        className="btn btn-primary button-effect"
                        href={routingPaths.signUp}
                        style={{ width: "100%", maxWidth: "400px", padding: "12px 24px", fontSize: "16px", fontWeight: "500", display: "block", textAlign: "center", textDecoration: "none" }}
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                  <div className="line">
                    <h6>OR Connect with</h6>
                  </div>
                  <div className="medialogo">
                    <ul>
                      <li>
                        <div
                          onClick={() => login()}
                          className="icon-btn btn-danger button-effect"
                          href="https://www.google.com/"
                        >
                          <i className="fa fa-google"></i>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="termscondition">
                  <h4 className="mb-0">
                    <a href="/t&c"><span>*</span>Terms and conditions<b>&amp;</b></a>
                    <a href="/privacy-policy">Privacy policy</a>
                    </h4>
                  </div>
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

export default Auth_SignIn;