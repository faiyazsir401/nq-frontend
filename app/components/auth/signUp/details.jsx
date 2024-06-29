import React, { useEffect, useState } from "react";
import { AccountType, LIST_OF_ACCOUNT_TYPE } from "../../../common/constants";
import { useAppSelector, useAppDispatch } from "../../../store";
import { masterState, getMasterDataAsync } from "../../master/master.slice";

const Details = (props) => {
  const { values, handleChange } = props;
  const { status, masterData } = useAppSelector(masterState).master;
  const dispatch = useAppDispatch();
  const [categories, setCategories] = useState(masterData);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    setCategories(masterData);
  }, [status]);

  const fetchMasterData = () => {
    dispatch(getMasterDataAsync());
  };

  return (
    <React.Fragment>
      <div className="form-group">
        <label className="col-form-label">Phone No</label>
        <input
          className="form-control"
          onChange={handleChange}
          type="number"
          name="mobile_no"
          placeholder="Phone No"
          value={values.mobile_no}
        />
      </div>
      <div className="form-group">
        <label className="col-form-label" htmlFor="account_type">
          Choose Account Type
        </label>
        <select
          id="account_type"
          className="form-control"
          name="account_type"
          onChange={handleChange}
          defaultValue={values.account_type}
        >
          <option>Choose account type</option>
          {LIST_OF_ACCOUNT_TYPE.map((account_type, index) => {
            return (
              <option key={index} value={account_type.label}>
                {account_type.label}
              </option>
            );
          })}
        </select>
      </div>
      {values.account_type === AccountType.TRAINER && (
        <div className="form-group">
          <label className="col-form-label" htmlFor="account_type">
            Choose Category Type
          </label>
          <select
            id="category"
            className="form-control"
            name="category"
            onChange={handleChange}
            defaultValue={values.category}
          >
            <option>Choose category</option>
            {categories && Array.isArray(categories.category) ? categories.category.map((category, index) => {
              return (
                <option key={index} value={category}>
                  {category}
                </option>
              );
            }): <> No categories available </>}
          </select>
        </div>
      )}
    </React.Fragment>
  );
};

export default Details;
