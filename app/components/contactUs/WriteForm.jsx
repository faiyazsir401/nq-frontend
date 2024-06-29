import React from "react";
import { Modal, ModalBody, ModalFooter, Button } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RxCross2 } from "react-icons/rx";
import { authState } from "../auth/auth.slice";
import { useAppSelector, useAppDispatch } from "../../store";
import { writeUsAsync } from "./contactus.slice";
const WriteForm = ({ isOpen, setIsWriteFormOpen }) => {
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector(authState);
  const initialValues = {
    name: userInfo?.fullname || "",
    email: userInfo?.email || "",
    phone: userInfo?.mobile_no || "",
    desc: "",
    subject: "",
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .matches(/^[A-Za-z\s]+$/, "Name must contain only letters")
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email format"
      )
      .required("Email is required"),
    phone: Yup.string()
      .matches(
        /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
        "Phone must contain only digits"
      )
      .min(10, "Phone must be exactly 10 digits")
      .max(10, "Phone must be exactly 10 digits")
      .required("Phone is required"),
    subject: Yup.string().required("subject is required"),
    desc: Yup.string().required("Description is required"),
  });

  const onSubmit = (values, { setSubmitting, resetForm }) => {
    dispatch(
      writeUsAsync({
        name: values?.name || userInfo?.fullname,
        email: values?.email || userInfo?.email,
        phone_number: values?.phone || userInfo?.phone,
        subject: values?.subject,
        description: values?.desc,
      })
    );
    resetForm();
    setSubmitting(false);
    setIsWriteFormOpen(false);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    validateOnChange: true,
  });

  return (
    <Modal isOpen={isOpen}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <RxCross2
          style={{
            fontSize: "22px",
            color: "#000080",
            margin: "5px 5px 0 0",
            cursor: "pointer",
          }}
          onClick={() => {
            formik.resetForm();
            setIsWriteFormOpen(false);
          }}
        />
      </div>
      <h3 className="form-header">Contact Us</h3>
      <form onSubmit={formik.handleSubmit} className="form-container">
        <ModalBody>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              {...formik.getFieldProps("name")}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-danger">{formik.errors.name}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-danger">{formik.errors.email}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              id="phone"
              name="phone"
              className="form-control"
              value={formik.values.phone}
              onChange={(e) => {
                const newValue = e.target.value.replace(/\D/, "");

                if (!isNaN(newValue) && newValue.length <= 10) {
                  formik.setFieldValue("phone", newValue);
                }
              }}
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="text-danger">{formik.errors.phone}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="name">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              className="form-control"
              {...formik.getFieldProps("subject")}
            />
            {formik.touched.subject && formik.errors.subject && (
              <div className="text-danger">{formik.errors.subject}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="desc">Description</label>
            <textarea
              id="desc"
              name="desc"
              className="form-control"
              {...formik.getFieldProps("desc")}
            />
            {formik.touched.desc && formik.errors.desc && (
              <div className="text-danger">{formik.errors.desc}</div>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="btn-container">
          <Button
            type="submit"
            color="primary"
            disabled={formik.isSubmitting}
            className="form-btn"
          >
            Submit
          </Button>{" "}
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default WriteForm;
