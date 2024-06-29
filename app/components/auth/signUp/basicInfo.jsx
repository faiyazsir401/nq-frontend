import React from "react";

const BasicInfo = (props) => {
  const { values, handleChange, isFromGoogle = false } = props;
  return (
    <React.Fragment>
      <div className="form-group">
        <label className="col-form-label">Full Name</label>
        <input
          className="form-control"
          onChange={handleChange}
          type="text"
          name="fullname"
          placeholder="Full Name"
          value={values.fullname}
        />
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
          <input
            className="form-control"
            id="inputPassword3"
            onChange={handleChange}
            type="password"
            name="password"
            placeholder="Password"
            value={values.password}
          />
        </div>
      )}
    </React.Fragment>
  );
};

export default BasicInfo;
