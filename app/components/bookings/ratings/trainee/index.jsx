import React, { useEffect, useRef, useState } from "react";
import Rating from "react-rating";
import {
    AccountType,
    BookedSession,
    Message,
    STATUS,
    topNavbarOptions,
    validationMessage,
} from "../../../../common/constants";
import { X } from "react-feather";
import { useAppDispatch, useAppSelector } from "../../../../store";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import { HandleErrorLabel } from "../../../../common/error";
import ColoredRating from "../../../../common/rating";
import { authAction } from "../../../auth/auth.slice";
import { useRouter } from "next/router";
import { useMediaQuery } from "usehooks-ts";
import { addRatingAsync, updateBookedSessionScheduledMeetingAsync } from "../../../common/common.slice";

const TraineeRatings = ({ onClose, booking_id, accountType, tabBook, isFromCall, trainer }) => {
    const dispatch = useAppDispatch();
    const formRef = useRef(null);
    const router = useRouter()
    const initialValues = {
        sessionRating: null,
        audioVideoRating: null,
        recommendRating: null,
        title:"",
        remarksInfo: "",
    };

    const validationSchema = Yup.object().shape({
        accountType: Yup.string().default(accountType),
        sessionRating: Yup.number()
            .nullable()
            .required(validationMessage.rating.sessionRating),
        audioVideoRating: Yup.number()
            .nullable()
            .required(validationMessage.rating.audioVideoRating),
        recommendRating: Yup.number().when("accountType", ([type], schema) => {
            if (type !== AccountType.TRAINER)
                return Yup.number()
                    .nullable()
                    .required(validationMessage.rating.recommandRating);
            return Yup.number().nullable().optional();
        }),
        remarksInfo: Yup.string()
            .optional()
    });

    const isMobileScreen = useMediaQuery("(max-width:1000px)")
    const getImageUrl = (image) => {
        const backendUrl = "https://data.netqwix.com/";

        // Check if the image URL is already a full URL (starts with http or https)
        if (
            image &&
            (image.startsWith("http://") || image.startsWith("https://"))
        ) {
            return image;
        }

        // If the image is just a filename, append the backend URL
        return image ? `${backendUrl}${image}` : "/assets/images/demoUser.png";
    };


    return (
        <Formik
            innerRef={formRef}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                const updatePayload = {
                    id: booking_id,
                    booked_status: BookedSession.completed,
                };
                const commonPayload = {
                    ...values,
                    booking_id,
                };
                const payload = {
                    ...(accountType === AccountType.TRAINER
                        ? { status: tabBook, updatePayload }
                        : { updatePayload }),
                };
                dispatch(updateBookedSessionScheduledMeetingAsync(payload));
                dispatch(addRatingAsync(commonPayload));
              if(isFromCall){
                dispatch(authAction?.setTopNavbarActiveTab(topNavbarOptions?.HOME));
                router.push("/dashboard")
            
              }
                
            }}
        >
            {({
                values,
                errors,
                touched,
                handleSubmit,
                handleBlur,
                setValues,
                isValid,
            }) => (
                <Form onSubmit={handleSubmit}>
                    {/* {handleContentOnUserWise(
            values,
            errors,
            touched,
            handleSubmit,
            handleBlur,
            setValues,
            isValid
          )} */}
                    <>
                        <div className="d-flex justify-content-end">
                            <div className="media-body media-body text-right">
                                <div
                                    className="icon-btn btn-sm btn-outline-light close-apps pointer"
                                    onClick={onClose}
                                >
                                    <X />
                                </div>
                            </div>
                        </div>
                        
                            <div style={{
                                display: "flex"
                            }}>
                                <img
                                    alt={trainer?.fullname}
                                    style={{
                                        width: "100%",
                                        maxHeight: isMobileScreen ? 150 : 250,
                                        minHeight: isMobileScreen ? 150 : 250,
                                        maxWidth: isMobileScreen ? 150 : 250,
                                        objectFit: "cover",
                                        margin: "auto"
                                    }}
                                    src={
                                        trainer?.profile_picture
                                            ? getImageUrl(trainer?.profile_picture)
                                            : "/assets/images/demoUser.png"
                                    }
                                />
                            </div>

                        <h3 className="fs-1 p-3 mb-2 rounded" style={{ textAlign: "center" }}>
                            {"Thank you for taking a session with " + trainer?.fullname}
                        </h3>
                        <div className="container">
                            <div className="row">
                                <h4 className="col-6">{"How would you rate your expert?"}</h4>
                                <div className="col">
                                    <ColoredRating
                                        initialRating={values.sessionRating}
                                        key={"sessionRating"}
                                        onChange={(value) => {
                                            setValues({ ...values, sessionRating: value });
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <HandleErrorLabel
                                    isError={errors.sessionRating}
                                    isTouched={
                                        touched.sessionRating && errors.sessionRating ? true : false
                                    }
                                />
                            </div>
                            <div className="row mt-3 mb-3">
                                <h4 className="col-6"> {"Please rate your audio/video connection?"} </h4>
                                <div className="col">
                                    <ColoredRating
                                        key={"audioVideoRating"}
                                        initialRating={values.audioVideoRating}
                                        onChange={(value) => {
                                            setValues({ ...values, audioVideoRating: value });
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <HandleErrorLabel
                                    isError={errors.audioVideoRating}
                                    isTouched={
                                        touched.audioVideoRating && errors.audioVideoRating
                                            ? true
                                            : false
                                    }
                                />
                            </div>
                            {accountType === AccountType.TRAINER ? (
                                <></>
                            ) : (
                                <>
                                    <div className="row mt-3 mb-3">
                                        <h4 className="col-6">
                                           {"How strongly would you recommend " + trainer?.fullname + " ?"}
                                        </h4>
                                        <div className="col">
                                            <ColoredRating
                                                initialRating={values.recommendRating}
                                                key={"recommandRating"}
                                                onChange={(value) => {
                                                    setValues({
                                                        ...values,
                                                        recommendRating: value,
                                                    });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <HandleErrorLabel
                                            isError={errors.recommendRating}
                                            isTouched={
                                                touched.recommendRating && errors.recommendRating
                                                    ? true
                                                    : false
                                            }
                                        />
                                    </div>
                                </>
                            )}
                            
                            <div className="row mt-2">
                                <div className="col">
                                    <div className="form-group">
                                        <textarea
                                            onChange={(event) => {
                                                const { value } = event.target;
                                                setValues({ ...values, remarksInfo: value });
                                            }}
                                            value={values.remarksInfo}
                                            placeholder={"leave a review"}
                                            onBlur={handleBlur}
                                            className="form-control mt-1"
                                            name=""
                                            id=""
                                            cols="10"
                                            rows="4"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <HandleErrorLabel
                                    isError={errors.remarksInfo}
                                    isTouched={
                                        touched.remarksInfo && errors.remarksInfo ? true : false
                                    }
                                />
                            </div>
                            <div className="d-flex justify-content-center mt-4">
                                <button type="submit" className="btn btn-primary">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </>
                </Form>
            )}
        </Formik>
    );
};

export default TraineeRatings;
