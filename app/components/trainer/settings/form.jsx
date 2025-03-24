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
import { MinusCircle, PlusCircle, Upload } from "react-feather";
import { useMediaQuery } from "usehooks-ts";
import axios from "axios";
import { toast } from "react-toastify";
import UAParser from 'ua-parser-js';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

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
  const isMobileScreen = useMediaQuery('(max-width:700px)');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const MIN_DIMENSION = 150;
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ffmpegRef = useRef(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    setDeviceInfo(result);
  }, []);
  
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;
        
        const coreURL = '/ffmpeg-core.js';
        const wasmURL = '/ffmpeg-core.wasm';

        await ffmpeg.load({ coreURL, wasmURL });
        setFfmpegLoaded(true);
      } catch (error) {
        console.error('Error loading FFmpeg:', error);
      }
    };
    loadFFmpeg();
  }, []);

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
  }, [formRef, userInfo, extraInfo]);

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
        url: Yup.string().nullable(),
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

  const OS = {
    android: 'android',
    mac: "Mac OS",
    ios: 'iOS',
    windows: "Windows",
  };

  const BROWSER = {
    chrome: 'Chrome',
    safari: "Safari",
    mobileSafari: "Mobile Safari"
  };

  function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const generateThumbnailFormWindowsOSAndMacChrome = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const seekTime = Math.min(1, video.duration * 0.25);
    video.currentTime = seekTime;

    video.onseeked = () => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageFormat = 'image/jpeg';
      const quality = 0.8;
      const dataUrl = canvas.toDataURL(imageFormat, quality);

      const fileType = dataUrl.split(';')[0].split(':')[1];

      const thumbnailFile = dataURLtoFile(dataUrl, `thumbnail.${fileType.split('/')[1]}`);

      setThumbnail({
        thumbnailFile: thumbnailFile,
        dataUrl: dataUrl,
        fileType: fileType
      });
      
      setLoading(false);
    };
  };

  const generateThumbnailMacAndiOS = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const captureFrame = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageFormat = 'image/jpeg';
      const quality = 0.8;

      const dataUrl = canvas.toDataURL(imageFormat, quality);

      const fileType = dataUrl.split(';')[0].split(':')[1];

      const thumbnailFile = dataURLtoFile(dataUrl, `thumbnail.${fileType.split('/')[1]}`);

      setThumbnail({
        thumbnailFile: thumbnailFile,
        dataUrl: dataUrl,
        fileType: fileType
      });

      setLoading(false);
    };

    video.play().then(() => {
      video.pause();

      const seekTime = Math.min(1, video.duration * 0.25);
      video.currentTime = seekTime;
      const handleFrame = () => {
        if (video.currentTime >= seekTime) {
          video.removeEventListener('timeupdate', handleFrame);
          video.removeEventListener('seeked', handleFrame);
          captureFrame();
        }
      };

      video.addEventListener('timeupdate', handleFrame);
      video.addEventListener('seeked', handleFrame);
    }).catch(error => {
      console.error('Error playing video:', error);
      captureFrame();
    });
  };

  const trimVideo = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';

    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile(inputFileName, await fetchFile(selectedFile));

      let compressionSettings = '-crf 23';

      await ffmpeg.exec([
        '-i', inputFileName,
        '-ss', '0',
        '-to', '2',
        '-c', 'copy',
        outputFileName
      ]);

      const data = await ffmpeg.readFile(outputFileName);
      const trimmedVideoBlob = new Blob([data.buffer], { type: 'video/mp4' });

      const formData = new FormData();
      formData.append('video', trimmedVideoBlob);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/common/generate-thumbnail`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to generate thumbnail');
        }

        const blob = await response.blob();
        const thumbnailUrl = URL.createObjectURL(blob);

        setThumbnail({
          thumbnailFile: blob,
          dataUrl: thumbnailUrl,
          fileType: blob.type
        });

      } catch (error) {
        console.error('Error generating thumbnail:', error);
        toast.error('Error generating thumbnail');
      } finally {
        setLoading(false);
      }

    } catch (error) {
      console.error('Error trimming video:', error);
      setLoading(false);
    }
  };

  const generateThumbnail = () => {
    setTimeout(() => {
      setLoading(true);
      if (deviceInfo?.os?.name?.toLowerCase() === OS.ios.toLowerCase()) {
        trimVideo();
      }
      else if (deviceInfo?.os?.name?.toLowerCase() === OS.windows.toLowerCase() || 
               deviceInfo?.os?.name?.toLowerCase() === OS.android.toLowerCase() || 
               (deviceInfo?.os?.name?.toLowerCase() === OS.mac.toLowerCase() && 
                deviceInfo?.browser?.name?.toLowerCase() === BROWSER.chrome.toLowerCase())) {
        generateThumbnailFormWindowsOSAndMacChrome();
      } else {
        generateThumbnailMacAndiOS();
      }
    }, 3000);
  };

  const handleUploadChange = (e, index, setFieldValue) => {
    try {
      setThumbnail(null);
      setSelectedFile(null);
      setCurrentMediaIndex(null);
      setLoading(true);
      
      const file = e.target.files?.[0];
      if (!file) {
        setLoading(false);
        return;
      }
      
      const fileType = file.type.split("/")[0]; // Get 'image' or 'video'
      const fileSize = file?.size / 1024 / 1024; // in MiB
      
      if (fileSize > 150) {
        toast.error("File size exceeds 150 MiB");
        setLoading(false);
        return;
      }
      
      setCurrentMediaIndex(index);
      
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const url = reader.result?.toString() || "";
        
        if (fileType === "image") {
          const imageElement = new Image();
          imageElement.src = url;
          imageElement.addEventListener("load", (event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
              toast.error(`Image must be at least ${MIN_DIMENSION} x ${MIN_DIMENSION} pixels.`);
              setLoading(false);
              return;
            }
            setSelectedFile(file);
            setThumbnail({
              thumbnailFile: file,
              dataUrl: url,
              fileType: file.type
            });
            setLoading(false);
          });
        } else if (fileType === "video") {
          const videoElement = document.createElement("video");
          videoElement.src = url;
          videoElement.addEventListener("loadedmetadata", () => {
            const { videoWidth, videoHeight } = videoElement;
            if (videoWidth < MIN_DIMENSION || videoHeight < MIN_DIMENSION) {
              toast.error(`Video must be at least ${MIN_DIMENSION} x ${MIN_DIMENSION} pixels.`);
              setLoading(false);
              return;
            }
            setSelectedFile(file);
            videoRef.current.src = url;
          });
        }
      });
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file");
      setLoading(false);
    }
  };

  const getS3SignedUrl = async (payload) => {
    try {
      const response = await axios({
        method: "POST",
        url: `http://localhost:8000/common/featured-content-upload-url`,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (err) {
      console.error("error while posting video/image ", err);
      throw err;
    }
  };

  async function pushFileToS3(presignedUrl, file) {
    const fileType = file.type.split("/")[0];
    
    const myHeaders = new Headers({
      "Content-Type": file.type,
      "Content-Disposition": "inline",
    });
    
    try {
      const response = await axios.put(presignedUrl, file, {
        headers: myHeaders,
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percentCompleted = (loaded / total) * 100;
          if (fileType === 'video') {
            console.log("percentCompleted =====", percentCompleted);
            setUploadProgress(
              Math.trunc(percentCompleted === 100 ? 0 : percentCompleted)
            );
          }
        },
      });
      return response;
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  }

  const handleUpload = async (values, setFieldValue) => {
    if (!selectedFile || currentMediaIndex === null) {
      toast.error("No file selected or media index is unknown");
      return;
    }
  
    if (!thumbnail?.fileType) {
      toast.error("Thumbnail is not ready yet. Please wait.");
      return;
    }
  
    setIsUploading(true);
    try {
      const fileType = selectedFile.type.split("/")[0];
      
      const payload = {
        filename: selectedFile.name,
        fileType: selectedFile.type,
        thumbnail: thumbnail.fileType,
        title: values.media[currentMediaIndex].title,
      };
      
      const data = await getS3SignedUrl(payload);
      // console.log(data);
      // return;
      if (!data?.url) {
        throw new Error("Failed to get S3 signed URL");
      }

      await pushFileToS3(data.url, selectedFile);
      
      const publicUrl = data.url.split("?")[0];
      
      setFieldValue(`media.${currentMediaIndex}.url`, publicUrl);
      
      // If this is a video and we have a thumbnail URL from the API response
      if (fileType === "video" && data.thumbnailURL) {
        if (thumbnail?.thumbnailFile) {
          await pushFileToS3(data.thumbnailURL, thumbnail.thumbnailFile);
        }
        const thumbnailURL = data.thumbnailURL.split("?")[0];
        setFieldValue(`media.${currentMediaIndex}.thumbnail`, thumbnailURL);
      } else if (fileType === "image") {
        setFieldValue(`media.${currentMediaIndex}.thumbnail`, publicUrl);
      }
      
      toast.success("File uploaded successfully!");

      setSelectedFile(null);
      setThumbnail(null);
      setCurrentMediaIndex(null);
      setUploadProgress(0);
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

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
        <Form onSubmit={(e)=>{e.preventDefault();handleSubmit(e)}}>
          <div className="container mb-3">
            {/* Hidden video and canvas elements for thumbnail generation */}
            <video ref={videoRef} style={{ display: 'none' }} playsInline onLoadedMetadata={() => generateThumbnail()} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
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
                    <div className="col-12">
                    {values.media?.length > 0 &&
                      values.media.map((mediaInfo, index) => (
                        <div key={`media-item-${index}`}>
                          <div className="row">
                            <div className="col-12">
                              <label className="col-form-label">Title</label>
                              <input
                                type="text"
                                onChange={(event) => {
                                  setFieldValue(`media.${index}.title`, event.target.value);
                                }}
                                value={values.media?.[index]?.title || ""}
                                placeholder="Media title"
                                onBlur={handleBlur}
                                className={`form-control mt-1 ${
                                  touched?.media?.[index]?.title && errors?.media?.[index]?.title
                                    ? "border border-danger"
                                    : ""
                                }`}
                                name={`media.${index}.title`}
                                id={`media-title-${index}`}
                              />
                              <HandleErrorLabel
                                isError={errors?.media?.[index]?.title}
                                isTouched={touched?.media?.[index]?.title}
                              />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="col-form-label">Media Description</label>
                            <textarea
                              onChange={(event) => {
                                setFieldValue(`media.${index}.description`, event.target.value);
                              }}
                              value={values.media?.[index]?.description || ""}
                              placeholder="Media description"
                              onBlur={handleBlur}
                              className={`form-control mt-1 ${
                                touched?.media?.[index]?.description &&
                                errors?.media?.[index]?.description
                                  ? "border border-danger"
                                  : ""
                              }`}
                              name={`media.${index}.description`}
                              id={`media-description-${index}`}
                              cols="10"
                              rows="3"
                            />
                            <HandleErrorLabel
                              isError={errors?.media?.[index]?.description}
                              isTouched={touched?.media?.[index]?.description}
                            />
                          </div>

                          <div className="row mb-4 items-center" key={`media-list-${index}`}>
                            <div
                              className="col-3"
                              style={{
                                paddingLeft: "15px",
                                paddingRight: isMobileScreen ? "5px" : "15px",
                              }}
                            >
                              <select
                                value={values.media?.[index]?.type || "image"}
                                name={`media.${index}.type`}
                                className="form-control"
                                onChange={(event) => {
                                  let thumbnail = "";
                                  if (event.target.value === "video") {
                                    thumbnail = DUMMY_URLS.YOUTUBE;
                                  } else if (event.target.value === "image") {
                                    thumbnail = values.media?.[index]?.url || "";
                                  }
                                  setFieldValue(`media.${index}.thumbnail`, thumbnail);
                                  setFieldValue(`media.${index}.type`, event.target.value);
                                }}
                              >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                              </select>
                            </div>

                            {/* File input and upload button */}
                            <div className="col-5">
                              <div className="d-flex align-items-center">
                                <input
                                  type="file"
                                  className="form-control"
                                  accept={values.media?.[index]?.type === "image" ? "image/*" : "video/*"}
                                  onChange={(e) => handleUploadChange(e, index, setFieldValue)}
                                />
                              </div>
                              {values.media?.[index]?.url && (
                                <small className="text-muted d-block mt-1 text-truncate">
                                  Current URL: {values.media?.[index]?.url}
                                </small>
                              )}
                            </div>
                            
                            <div className="col-2">
                              {loading && currentMediaIndex === index ? (
                                <div className="spinner-border text-primary" role="status">
                                  <span className="sr-only">Loading...</span>
                                </div>
                              ) : (selectedFile && currentMediaIndex === index && thumbnail?.dataUrl) ? (
                                <div className="d-flex flex-column align-items-center">
                                  <img 
                                    src={thumbnail?.dataUrl} 
                                    alt="Thumbnail" 
                                    style={{ height: '60px', width: 'auto', objectFit: 'contain' }} 
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-primary mt-2"
                                    disabled={isUploading}
                                    onClick={() => handleUpload(values, setFieldValue)}
                                  >
                                    <Upload size={16} className="mr-1" />
                                    {isUploading ? `${uploadProgress}%` : "Upload"}
                                  </button>
                                </div>
                              ) : null}
                            </div>

                            <div
                              className="col-2 mt-2 items-center"
                              onClick={() => remove(index)}
                              style={{
                                paddingLeft: isMobileScreen ? "5px" : "15px",
                                paddingRight: isMobileScreen ? "5px" : "15px",
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