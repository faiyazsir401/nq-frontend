import React, { useEffect, useRef, useState } from "react";
import { Form, Formik, FieldArray } from "formik";
import * as Yup from "yup";
import { HandleErrorLabel } from "../../../common/error";
import {
  DUMMY_URLS,
  MAXIMUM_RATE,
  MINIMUM_RATE,
  TRAINER_AMOUNT_USD,
  validationMessage,
} from "../../../common/constants";
import { MinusCircle, PlusCircle } from "react-feather";
import { Input, InputGroup } from "reactstrap";
import { Utils } from "../../../../utils/utils";

export const SettalInBankAccount = ({ onFormSubmit }) => {
  const formRef = useRef(null);
  const initialValues = {
    requested_amount: "",
  };

//   useEffect(() => {
//     if (formRef && formRef.current) {
//       formRef.current.setValues({
//         // by default it's TRAINER_AMOUNT_USD
//         requested_amount: +extraInfo?.requested_amount || TRAINER_AMOUNT_USD,
//       });
//     }
//   }, [formRef]);

  const validationSchema = Yup.object().shape({
    requested_amount: Yup.number()
    //   .min(MINIMUM_RATE, `Hourly rate must be at least ${MINIMUM_RATE}`)
    //   .max(MAXIMUM_RATE, `Hourly rate must not exceed ${MAXIMUM_RATE}`)
      .required("This field is required")
      .nullable(),
  });

  return (
    <Formik
      innerRef={formRef}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onFormSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleSubmit,
        handleBlur,
        setFieldValue,
        setValues,
        isValid,
        handleChange,
      }) => (
        <Form onSubmit={handleSubmit}>
          <div className="container mb-3">
            {/* requested_amount */}
            <label className="col-form-label">Amount ($)</label>
            <div className="row">
              <div className="col-4">
                <div className="form-group">
                  <input
                    onChange={(event) => {
                      const { value } = event.target;
                      setValues({
                        ...values,
                        requested_amount: value ? +value : null,
                      });
                    }}
                    value={values.requested_amount || ""}
                    type="number"
                    placeholder="Amount"
                    onBlur={handleBlur}
                    className={`form-control mt-1 ${
                      touched.requested_amount && errors.requested_amount
                        ? `border border-danger`
                        : ``
                    }`}
                    name="requested_amount"
                    id="requested_amount"
                    cols="10"
                    rows="3"
                  />
                </div>
              </div>
            </div>
            <div>
              <HandleErrorLabel
                isError={errors.requested_amount}
                isTouched={
                  touched.requested_amount && errors.requested_amount ? true : false
                }
              />
            </div>
            <div className=" mt-4">
              <button
                type="submit"
                // className="btn btn-primary"
                className="ml-2 btn btn-sm btn-primary"
                disabled={
                  !isValid ||
                  !values.requested_amount 
                //   ||
                //   +extraInfo?.requested_amount === values.requested_amount
                }
              >
                Save
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
