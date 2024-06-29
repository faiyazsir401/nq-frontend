import React, { useEffect, useRef, useState } from "react";
import { Form, Formik, FieldArray } from "formik";
import * as Yup from "yup";
import { HandleErrorLabel } from "../../../common/error";
import {
  DUMMY_URLS,
  MAX_DESCRIPTION_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  validationMessage,
} from "../../../common/constants";
import { MinusCircle, PlusCircle } from "react-feather";

export const UpdateSettingProfileForm = ({
  userInfo,
  onFormSubmit,
  extraInfo,
}) => {
  const formRef = useRef(null);
  const initialValues = {
    fullname: userInfo?.fullname,
    about: "",
    teaching_style: "",
    credentials_and_affiliations: "",
    curriculum: "",
    media: [{ title: "", description: "", type: "", url: "", thumbnail: "" }],
  };

  useEffect(() => {
    if (formRef && formRef.current) {
      formRef.current.setValues({
        fullname: userInfo?.fullname,
        about: extraInfo?.about,
        teaching_style: extraInfo?.teaching_style,
        credentials_and_affiliations: extraInfo?.credentials_and_affiliations,
        curriculum: extraInfo?.curriculum,
        media: extraInfo?.media,
      });
    }
  }, [formRef]);

  const validationSchema = Yup.object().shape({
    fullname: Yup.string().default("").trim(),
    about: Yup.string()
      .required(validationMessage.edit_trainer_profile.about)
      .min(
        MIN_DESCRIPTION_LENGTH,
        validationMessage.edit_trainer_profile.minMax.about.min
      )
      .max(
        MAX_DESCRIPTION_LENGTH,
        validationMessage.edit_trainer_profile.minMax.about.max
      )
      .nullable()
      .trim(),
    teaching_style: Yup.string()
      .required(validationMessage.edit_trainer_profile.teaching_style)
      .min(
        MIN_DESCRIPTION_LENGTH,
        validationMessage.edit_trainer_profile.minMax.teaching_style.min
      )
      .max(
        MAX_DESCRIPTION_LENGTH,
        validationMessage.edit_trainer_profile.minMax.teaching_style.max
      )
      .nullable()
      .trim(),
    credentials_and_affiliations: Yup.string()
      .required(
        validationMessage.edit_trainer_profile.credentials_and_affiliations
      )
      .min(
        MIN_DESCRIPTION_LENGTH,
        validationMessage.edit_trainer_profile.minMax.credentials_affiliations
          .min
      )
      .max(
        MAX_DESCRIPTION_LENGTH,
        validationMessage.edit_trainer_profile.minMax.credentials_affiliations
          .max
      )
      .nullable()
      .trim(),
    curriculum: Yup.string()
      .required(validationMessage.edit_trainer_profile.curriculum)
      .min(
        MIN_DESCRIPTION_LENGTH,
        validationMessage.edit_trainer_profile.minMax.curriculum.min
      )
      .max(
        MAX_DESCRIPTION_LENGTH,
        validationMessage.edit_trainer_profile.minMax.curriculum.max
      )
      .nullable()
      .trim(),
    media: Yup.array().of(
      Yup.object().shape({
        type: Yup.string().required("type required").nullable(),
        url: Yup.string().required("Description required").nullable(),
        title: Yup.string()
          .required("title required")
          .min(
            MIN_DESCRIPTION_LENGTH,
            `title must be at least ${MIN_DESCRIPTION_LENGTH} characters`
          )
          .max(
            MAX_DESCRIPTION_LENGTH,
            `title must be less than ${MAX_DESCRIPTION_LENGTH} characters`
          )
          .nullable()
          .trim(),
        description: Yup.string()
          .required("Description required")
          .min(
            MIN_DESCRIPTION_LENGTH,
            `description must be at least ${MIN_DESCRIPTION_LENGTH} characters`
          )

          .max(
            MAX_DESCRIPTION_LENGTH,
            `description must be less than ${MAX_DESCRIPTION_LENGTH} characters`
          )
          .nullable()
          .trim(),
      })
    ),
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
            {/* about */}
            <>
              <label className="col-form-label">About yourself</label>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <textarea
                      onChange={(event) => {
                        const { value } = event.target;
                        setValues({ ...values, about: value });
                      }}
                      value={values.about}
                      placeholder="About yourself"
                      onBlur={handleBlur}
                      className={`form-control ${
                        touched.about && errors.about
                          ? `border border-danger`
                          : ``
                      } mt-1`}
                      name="about"
                      id="about"
                      cols="10"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div>
                <HandleErrorLabel
                  isError={errors.about}
                  isTouched={touched.about && errors.about ? true : false}
                />
              </div>
            </>
            {/* medials */}
            <FieldArray name="media">
              {({ remove, push }) => {
                return (
                  <>
                    <div className="col-form-label items-center flex">
                      Add Media{" "}
                      <div className="col-2">
                        <div className="col-2 pt-2">
                          <div
                            onClick={() => {
                              push({
                                url: "",
                                type: "image",
                                title: "",
                                description: "",
                                thumbnail: "",
                              });
                            }}
                          >
                            <PlusCircle />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-10">
                        {values.media &&
                          values.media.length > 0 &&
                          values.media.map((mediaInfo, index) => (
                            <div className="">
                              <div className="row mb-3">
                                <div className="col-6">
                                  <label className="col-form-label">
                                    Title
                                  </label>
                                  <input
                                    type="text"
                                    onChange={(event) => {
                                      const { value } = event.target;
                                      setFieldValue(
                                        `media.${index}.title`,
                                        value
                                      );
                                    }}
                                    value={values.media[index].title}
                                    placeholder="Media title"
                                    onBlur={handleBlur}
                                    className={`form-control mt-1
                                    ${
                                      touched?.media &&
                                      touched?.media[index] &&
                                      touched?.media[index]?.title &&
                                      errors?.media[index]?.title
                                        ? `border border-danger`
                                        : ``
                                    }`}
                                    name="title"
                                    id="title"
                                  />
                                  <HandleErrorLabel
                                    isError={
                                      errors?.media &&
                                      errors?.media[index] &&
                                      errors?.media[index]?.title
                                    }
                                    isTouched={
                                      touched?.media &&
                                      touched?.media[index] &&
                                      touched?.media[index]?.title &&
                                      errors?.media[index]?.title
                                    }
                                  />
                                </div>
                              </div>
                              <div className="mb-3">
                                <label className="col-form-label">
                                  Media Description
                                </label>
                                <textarea
                                  onChange={(event) => {
                                    const { value } = event.target;
                                    setFieldValue(
                                      `media.${index}.description`,
                                      value
                                    );
                                  }}
                                  value={values.media[index].description}
                                  placeholder="Media description"
                                  onBlur={handleBlur}
                                  className={`form-control mt-1
                                    ${
                                      touched?.media &&
                                      touched?.media[index] &&
                                      touched?.media[index]?.description &&
                                      errors?.media[index]?.description
                                        ? `border border-danger`
                                        : ``
                                    }`}
                                  name="description"
                                  id="description"
                                  cols="10"
                                  rows="3"
                                />
                                <HandleErrorLabel
                                  isError={
                                    errors?.media &&
                                    errors?.media[index] &&
                                    errors?.media[index]?.description
                                  }
                                  isTouched={
                                    touched?.media &&
                                    touched?.media[index] &&
                                    touched?.media[index]?.description &&
                                    errors?.media[index]?.description
                                  }
                                />
                              </div>
                              <div
                                className="row mb-4 items-center"
                                key={`media-list-${index}`}
                              >
                                <div className="col-4">
                                  <select
                                    defaultValue={"image"}
                                    name="media_type"
                                    className="form-control"
                                    id=""
                                    onChange={(event) => {
                                      let thumbnail = "";
                                      if (event.target.value === "video") {
                                        thumbnail = DUMMY_URLS.YOUTUBE;
                                      } else if (
                                        event.target.value === "image"
                                      ) {
                                        thumbnail = values.media[index].url;
                                      }
                                      setFieldValue(
                                        `media.${index}.thumbnail`,
                                        thumbnail
                                      );
                                      setFieldValue(
                                        `media.${index}.type`,
                                        event.target.value
                                      );
                                    }}
                                  >
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                  </select>
                                </div>
                                <div className="col-6">
                                  <input
                                    type="url"
                                    className="form-control "
                                    onChange={(event) => {
                                      const { value } = event.target;
                                      if (
                                        values.media[index].type === "video"
                                      ) {
                                        setFieldValue(
                                          `media.${index}.thumbnail`,
                                          DUMMY_URLS.YOUTUBE
                                        );
                                      } else {
                                        setFieldValue(
                                          `media.${index}.thumbnail`,
                                          value
                                        );
                                      }
                                      setFieldValue(
                                        `media.${index}.url`,
                                        value
                                      );
                                    }}
                                    value={values.media[index].url}
                                    placeholder="Link"
                                  />
                                </div>

                                <div
                                  className="col-2 mt-2 items-center"
                                  onClick={() => {
                                    remove(index);
                                  }}
                                >
                                  <MinusCircle />
                                </div>
                              </div>
                              <hr />
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                );
              }}
            </FieldArray>
            {/* teaching_style */}
            <>
              <label className="col-form-label">
                Mention more about your teaching style
              </label>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <textarea
                      onChange={(event) => {
                        const { value } = event.target;
                        setValues({ ...values, teaching_style: value });
                      }}
                      value={values.teaching_style}
                      placeholder="Explain more about your teaching style"
                      onBlur={handleBlur}
                      className={`form-control mt-1 ${
                        touched.teaching_style && errors.teaching_style
                          ? `border border-danger`
                          : ``
                      }`}
                      name="teaching_style"
                      id="teaching_style"
                      cols="10"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div>
                <HandleErrorLabel
                  isError={errors.teaching_style}
                  isTouched={
                    touched.teaching_style && errors.teaching_style
                      ? true
                      : false
                  }
                />
              </div>
            </>
            {/* credentials_and_affiliations */}
            <>
              <label className="col-form-label">
                Mention more about credentials & affiliations{" "}
              </label>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <textarea
                      onChange={(event) => {
                        const { value } = event.target;
                        setValues({
                          ...values,
                          credentials_and_affiliations: value,
                        });
                      }}
                      value={values.credentials_and_affiliations}
                      placeholder="Credentials & Affiliations"
                      onBlur={handleBlur}
                      className={`form-control mt-1 ${
                        touched.credentials_and_affiliations &&
                        errors.credentials_and_affiliations
                          ? `border border-danger`
                          : ``
                      }`}
                      name="credentials_and_affiliations"
                      id="credentials_and_affiliations"
                      cols="10"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div>
                <HandleErrorLabel
                  isError={errors.credentials_and_affiliations}
                  isTouched={
                    touched.credentials_and_affiliations &&
                    errors.credentials_and_affiliations
                      ? true
                      : false
                  }
                />
              </div>
            </>
            {/*  curriculum */}
            <>
              <label className="col-form-label">Curriculum </label>

              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <textarea
                      onChange={(event) => {
                        const { value } = event.target;
                        setValues({ ...values, curriculum: value });
                      }}
                      value={values.curriculum}
                      placeholder="Curriculum"
                      onBlur={handleBlur}
                      className={`form-control mt-1 ${
                        touched.curriculum && errors.curriculum
                          ? `border border-danger`
                          : ``
                      }`}
                      name="curriculum"
                      id="curriculum"
                      cols="10"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div>
                <HandleErrorLabel
                  isError={errors.curriculum}
                  isTouched={
                    touched.curriculum && errors.curriculum ? true : false
                  }
                />
              </div>
            </>
            <div className="d-flex justify-content-center mt-4">
              <button type="submit" className="btn btn-primary">
                Save details
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
