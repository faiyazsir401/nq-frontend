import Link from "next/link";
import React from "react";

const Auth_SignInClassic = () => {
	return (
		<div>
			<div className="login-page2 animat-rate">
				<div className="login-content-main">
					<div className="login-content2">
						<div className="theme-tab">
							<ul className="nav nav-tabs" id="myTab" role="tablist">
								<li className="nav-item">
									<Link href="/auth/signUpClassic">
										<span
											className="nav-link"
											id="login-tab"
											data-toggle="tab"
											role="tab"
											aria-selected="false"
										>
											login
										</span>
									</Link>
								</li>
								<li className="nav-item">
									<Link href="/auth/signUpClassic">
										<span
											className="nav-link active"
											id="signup-tab"
											data-toggle="tab"
											role="tab"
											aria-selected="true"
										>
											Signup
										</span>
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="login-content">
						<div className="login-content-header"><Link href="/landing"><img className="image-fluid" src="/assets/images/logo/landing-logo.png" alt="images" /></Link></div>
						<h3>Hello Everyone , We are Chitchat</h3>
						<h4>Welcome to chitchat please, login to your account.</h4>
						<form className="form2">
							<div className="form-group">
								<label className="col-form-label" htmlFor="inputEmail3">
									Email Address
								</label>
								<input
									className="form-control"
									id="inputEmail3"
									type="email"
									placeholder="Demo@123gmail.com"
								/>
							</div>
							<div className="form-group">
								<label className="col-form-label" htmlFor="inputPassword3">
									Password
								</label>
								<span> </span>
								<input
									className="form-control"
									id="inputPassword3"
									type="password"
									placeholder="Password"
								/>
							</div>
							<div className="form-group">
								<div className="rememberchk">
									<div className="form-check">
										<input
											className="form-check-input"
											id="gridCheck1"
											type="checkbox"
										/>
										<label className="form-check-label" htmlFor="gridCheck1">
											Remember Me.
										</label>
										<h6>Forgot Password?</h6>
									</div>
								</div>
							</div>
							<ul className="medialogo">
								<li>
									<Link
										className="icon-btn btn-facebook button-effect rouded15"
										href="https://www.facebook.com/"
									>
										<i className="fa fa-facebook-f"></i>
									</Link>
								</li>
								<li>
									<Link
										className="icon-btn btn-danger button-effect rouded15"
										href="https://www.google.com/"
									>
										<i className="fa fa-google"></i>
									</Link>
								</li>
								<li>
									<Link
										className="icon-btn btn-primary button-effect rouded15"
										href="https://twitter.com/"
									>
										<i className="fa fa-twitter"></i>
									</Link>
								</li>
							</ul>
							<div className="form-group mb-0">
								<div className="buttons">
									<Link className="btn button-effect btn-primary" href="#">
										Login
									</Link>
								</div>
							</div>
						</form>
					</div>
				</div>
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
					<div className="top-circle"></div>
					<div className="center-circle"></div>
					<div className="bottom-circle1"></div>
					<div className="right-circle"></div>
					<div className="right-circle1"></div>
					<div className="quarterCircle"></div>
					<img
						className="cloud-logo"
						src="../assets/images/login_signup/2.png"
						alt="login logo"
					/>
					<img
						className="cloud-logo1"
						src="../assets/images/login_signup/2.png"
						alt="login logo"
					/>
					<img
						className="cloud-logo2"
						src="../assets/images/login_signup/2.png"
						alt="login logo"
					/>
					<img
						className="cloud-logo3"
						src="../assets/images/login_signup/2.png"
						alt="login logo"
					/>
					<img
						className="cloud-logo4"
						src="../assets/images/login_signup/2.png"
						alt="login logo"
					/>
					<img
						className="cloud-logo5"
						src="../assets/images/login_signup/2.png"
						alt="login logo"
					/>
				</div>
			</div>
		</div>
	);
};

export default Auth_SignInClassic;
