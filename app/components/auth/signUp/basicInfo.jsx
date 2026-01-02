import React, { useState } from "react";
import { Eye, EyeOff } from "react-feather";

const BasicInfo = (props) => {
  const { values, handleChange, isFromGoogle = false } = props;
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[a-zA-Z]/.test(password)) {
      return "Password must contain at least one letter";
    }
    return "";
  };

  const validateName = (name) => {
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return "Name must contain only letters and spaces";
    }
    if (name.includes("@") || name.includes(".")) {
      return "Name cannot contain email characters";
    }
    return "";
  };

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    const error = validatePassword(value);
    setPasswordError(error);
    handleChange(e);
  };

  const handleNameChange = (e) => {
    const { value } = e.target;
    const error = validateName(value);
    setNameError(error);
    handleChange(e);
  };

  return (
    <React.Fragment>
      <div className="form-group">
        <label className="col-form-label">Full Name</label>
        <input
          className={`form-control ${nameError ? "border-danger" : ""}`}
          onChange={handleNameChange}
          type="text"
          name="fullname"
          placeholder="Full Name"
          value={values.fullname}
        />
        {nameError && <div className="text-danger small mt-1">{nameError}</div>}
      </div>
      <div className="form-group">
        <label className="col-form-label">Email Address</label>
        <input
          className="form-control"
          onChange={handleChange}
          type="email"
          name="email"
          placeholder="Email"
          value={values.email}
        />
      </div>
      {isFromGoogle ? (
        <></>
      ) : (
        <div className="form-group">
          <label className="col-form-label" htmlFor="inputPassword3">
            Password
          </label>
          <span> </span>
          <div style={{ position: "relative" }}>
            <input
              className={`form-control ${passwordError ? "border-danger" : ""}`}
              id="inputPassword3"
              onChange={handlePasswordChange}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password (min 6 chars, 1 number, 1 letter)"
              value={values.password}
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
          {passwordError && <div className="text-danger small mt-1">{passwordError}</div>}
        </div>
      )}
    </React.Fragment>
  );
};

export default BasicInfo;
