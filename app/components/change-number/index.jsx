import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { updateMobileNumber } from '../common/common.api';
import { toast } from 'react-toastify';

const ChangePhoneNumber = ({ setCollapseShow, collapseShow }) => {
  // Formik setup
  const formik = useFormik({
    initialValues: {
      oldCountryCode: '1',
      oldPhoneNumber: '',
      newCountryCode: '1',
      newPhoneNumber: '',
    },
    validationSchema: Yup.object({
      oldCountryCode: Yup.string()
        .matches(/^\d+$/, 'Country code must be a number')
        .required('Old country code is required'),
      oldPhoneNumber: Yup.string()
        .matches(/^\d+$/, 'Old phone number must be a number')
        .min(10, 'Phone number should be at least 10 digits')
        .required('Old phone number is required'),
      newCountryCode: Yup.string()
        .matches(/^\d+$/, 'Country code must be a number')
        .required('New country code is required'),
      newPhoneNumber: Yup.string()
        .matches(/^\d+$/, 'New phone number must be a number')
        .min(10, 'Phone number should be at least 10 digits')
        .required('New phone number is required'),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          oldPhoneNumber: `${values.oldPhoneNumber}`,
          newPhoneNumber: `${values.newPhoneNumber}`,
        };

        if(payload.oldPhoneNumber === payload.newPhoneNumber){
          toast.error("New phone number should be different than the old phone number")
          return
          }

        const response = await updateMobileNumber(payload);
        toast.success('Phone number updated successfully!')
        // formik.setStatus({ successMessage:  });
        formik.setSubmitting(false);
      } catch (err) {
        console.log("error",err)
        toast.error(err?.response?.data?.error??'Error updating phone number')
        formik.setStatus({ errorMessage: 'Error updating phone number' });
        formik.setSubmitting(false);
      }
    },
  });

  return (
    <div className="card">
      <div
        className="card-header"
        onClick={() =>
          setCollapseShow({
            ...collapseShow,
            changeNumber: !collapseShow.changeNumber,
            verfication: false,
            accountInfo: false,
            deleteAccount: false,
            privacy: false,
            security: false,
          })
        }
      >
        <a href="#javascript">
          Change Number
          <i className="fa fa-angle-down" />
        </a>
      </div>
      <div
        className={`collapse ${collapseShow.changeNumber ? 'show' : ''}`}
      >
       
        <div className="card-body change-number">
        {formik.touched.oldCountryCode && formik.errors.oldCountryCode && (
          <div className="error" style={{ color: "red" }}>{formik.errors.oldCountryCode}</div>
        )}

        {formik.touched.newCountryCode && formik.errors.newCountryCode && (
          <div className="error" style={{ color: "red" }}>{formik.errors.newCountryCode}</div>
        )}

        {formik.touched.oldPhoneNumber && formik.errors.oldPhoneNumber && (
          <div className="error" style={{ color: "red" }}>{formik.errors.oldPhoneNumber}</div>
        )}

        {formik.touched.newPhoneNumber && formik.errors.newPhoneNumber && (
          <div className="error" style={{ color: "red" }} >{formik.errors.newPhoneNumber}</div>
        )}
          <h5>Your old country code & phone number</h5>
          <form onSubmit={formik.handleSubmit}>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text form-control m-0">+</span>
              </div>
              <input
                className="form-control country-code"
                type="text"
                name="oldCountryCode"
                value={formik.values.oldCountryCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="01"
                disabled
              />

              <input
                className="form-control"
                type="text"
                name="oldPhoneNumber"
                value={formik.values.oldPhoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="1234567895"
              />

            </div>
            <h5>Your new country code & phone number</h5>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text form-control m-0">+</span>
              </div>
              <input
                className="form-control country-code"
                type="text"
                name="newCountryCode"
                value={formik.values.newCountryCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="01"
                disabled
              />

              <input
                className="form-control"
                type="text"
                name="newPhoneNumber"
                value={formik.values.newPhoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder=""
              />

            </div>

            <div className="text-right">
              <button
                type="submit"
                className="btn btn-outline-primary button-effect btn-sm"
                disabled={formik.isSubmitting}
              >
                Confirm
              </button>
            </div>


          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePhoneNumber;
