
import React, { useEffect, useState, useRef } from "react";
import { videouploadState, videouploadAction } from "./videoupload.slice";
import { useAppSelector, useAppDispatch } from "../../store";
import Modal from "../../common/modal";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";
import { getS3SignUrl } from "./videoupload.api";
import { AccountType, LIST_OF_ACCOUNT_TYPE } from "../../common/constants";
import { getMasterData } from "../master/master.api";
import axios from "axios";
import { X } from "react-feather";
import { toast } from "react-toastify";
import { getClipsAsync } from "../../common/common.slice";
import { generateThumbnailURL } from "../common/common.api";
import dynamic from 'next/dynamic';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import UAParser from 'ua-parser-js';
import { useSelector } from "react-redux";
import FriendsPopup from "../pop-ups/FriendsPopUp";
import EmailsPopup from "../pop-ups/EmailPopUp";

const OS = {
  android: 'android',
  mac: "Mac OS",
  ios: 'iOS',
  windows: "Windows",
}

const BROWSER = {
  chrome: 'Chrome',
  safari: "Safari",
  MobileSafari: "Mobile Safari"
}

const parser = new UAParser();

const shareWithConstants = {
  myClips: "My Clips",
  myFriends: "Friends",
  newUsers: "New Users"
}

const UploadClipCard = (props) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [titles, setTitles] = useState([]);
  const [category, setCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const ref = useRef();
  const dispatch = useAppDispatch();
  const [progress, setProgress] = useState([]);
  const { isOpen } = useAppSelector(videouploadState);
  const userInfo = useSelector((state) => state.auth.userInfo)
  const [isUploading, setIsUploading] = useState(false)
  const [thumbnails, setThumbnails] = useState([]);
  const videoRefs = useRef([]);
  const canvasRefs = useRef([]);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState([]);
  const ffmpegRef = useRef(null);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [shareWith, setShareWith] = useState(shareWithConstants.myClips)
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const {isFromCommunity} = props; 
  useEffect(() => {
    const result = parser.getResult();
    setDeviceInfo(result);
  }, []);

  useEffect(()=>{
    if(isFromCommunity){
      setShareWith(shareWithConstants.myFriends)
      setSelectedFriends([isFromCommunity])
    }
  },[props])

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

  const handleTitleChange = (index, value) => {
    setTitles(prev => {
      const newTitles = [...prev];
      newTitles[index] = value;
      return newTitles;
    });
  };

  const generateThumbnail = async (index) => {
    setLoading(prev => {
      const newLoading = [...prev];
      newLoading[index] = true;
      return newLoading;
    });

    try {
      const video = videoRefs.current[index];
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
        if (video.readyState >= 1) resolve();
      });

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const seekTime = Math.min(1, video.duration * 0.25);
      video.currentTime = seekTime;

      await new Promise((resolve) => {
        video.onseeked = resolve;
      });

      await new Promise(resolve => setTimeout(resolve, 200));
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const blob = await fetch(dataUrl).then(res => res.blob());

      setThumbnails(prev => {
        const newThumbnails = [...prev];
        newThumbnails[index] = {
          thumbnailFile: blob,
          dataUrl: dataUrl,
          fileType: blob.type
        };
        return newThumbnails;
      });
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      await generateThumbnailOnServer(index);
    } finally {
      setLoading(prev => {
        const newLoading = [...prev];
        newLoading[index] = false;
        return newLoading;
      });
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files.length) {
      const newFiles = Array.from(e.target.files);
      const invalidFiles = newFiles.filter(file => (file.size / 1024 / 1024) > 150);
      
      if (invalidFiles.length > 0) {
        alert("Some files exceed 150 MiB and will not be uploaded");
      }

      const validFiles = newFiles.filter(file => (file.size / 1024 / 1024) <= 150);
      const newVideos = [...videos];
      const newThumbnails = [...thumbnails];
      const newTitles = [...titles];
      const newLoading = [...loading];
      const newProgress = [...progress];

      for (const file of validFiles) {
        const videoIndex = videos.length + newFiles.indexOf(file);
        const video = document.createElement('video');
        video.playsInline = true;
        video.muted = true;
        video.preload = 'metadata';
        const videoUrl = URL.createObjectURL(file);
        video.src = videoUrl;

        videoRefs.current[videoIndex] = video;
        newVideos[videoIndex] = file;
        newThumbnails[videoIndex] = null;
        newTitles[videoIndex] = "";
        newLoading[videoIndex] = true;
        newProgress[videoIndex] = 0;

        setTimeout(() => generateThumbnail(videoIndex), 100);
      }

      setSelectedFiles(prev => [...prev, ...validFiles]);
      setVideos(newVideos);
      setThumbnails(newThumbnails);
      setTitles(newTitles);
      setLoading(newLoading);
      setProgress(newProgress);
    }
  };

  const handleUpload = async () => {
    if (shareWith === shareWithConstants.newUsers && selectedEmails.length <= 0) {
      toast.error("Please Add Emails to Share Clips With.");
      return;
    } else if (shareWith === shareWithConstants.myFriends && selectedFriends.length <= 0) {
      toast.error("Please Add Friends to Share Clips With.");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("Please select at least one video file.");
      return;
    }

    for (let i = 0; i < selectedFiles.length; i++) {
      if (!thumbnails[i]?.fileType) {
        toast.error(`Please wait for thumbnail to generate for video ${i + 1}`);
        return;
      }
      if (!titles[i] || titles[i].trim() === "") {
        toast.error(`Please enter a title for video ${i + 1}`);
        return;
      }
    }

    setIsUploading(true);
    
    try {
      const IsTrainer = userInfo.account_type === AccountType.TRAINER;
      const bulkPayload = {
        clips: selectedFiles.map((file, index) => ({
          filename: file?.name,
          fileType: file?.type,
          thumbnail: thumbnails[index]?.fileType,
          title: titles[index],
          category: IsTrainer ? userInfo.category : category,
        })),
        shareOptions: {
          type: shareWith,
          friends: shareWith === shareWithConstants.myFriends ? selectedFriends : undefined,
          emails: shareWith === shareWithConstants.newUsers ? selectedEmails : undefined
        }
      };

      const data = await getS3SignUrl(bulkPayload);
      console.log("datasky",data)
      if (data?.results) {
        const uploadPromises = data.results.map(async (urlData, index) => {
          try {
            await pushToS3(urlData.url, videos[index], index);
            await pushToS3(urlData.thumbnailURL, thumbnails[index].thumbnailFile, index);
            return true;
          } catch (error) {
            console.error(`Error uploading file ${index}:`, error);
            return false;
          }
        });

        const results = await Promise.all(uploadPromises);
        if (results.every(r => r)) {
          toast.success("All clips uploaded successfully!",{
            autoClose:false
          });
          resetForm();
          // If uploading from community context, refresh the specific user's clips
          if (isFromCommunity) {
            dispatch(getClipsAsync({ trainee_id: isFromCommunity }));
          } else {
            dispatch(getClipsAsync({}));
          }
        } else {
          toast.error("Some clips failed to upload.",{
            autoClose:false
          });
        }
      }
    } catch (error) {
      console.error("Error during bulk upload:", error);
      toast.error("Error during upload");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setVideos([]);
    setThumbnails([]);
    setTitles([]);
    setLoading([]);
    setProgress([]);
    setSelectedFriends([]);
    setSelectedEmails([]);
  };

  async function pushToS3(presignedUrl, file, index) {
    try {
      const myHeaders = {
        "Content-Type": file.type,
        "Content-Disposition": "inline",
      };

      const response = await axios.put(presignedUrl, file, {
        headers: myHeaders,
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percentCompleted = (loaded / total) * 100;
          setProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = Math.trunc(percentCompleted === 100 ? 0 : percentCompleted);
            return newProgress;
          });
        },
      });
      return response;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw error;
    }
  }


  const getCategoryData = async () => {
    var res = await getMasterData();
    setCategoryList(
      res?.data?.data[0]?.category?.map((val, ind) => {
        return {
          id: ind,
          label: val,
          value: val,
        };
      })
    );
  };

  useEffect(() => {
    getCategoryData();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setTitles([""]);
      setCategory("");
      setSelectedFiles([]);
    }
  }, [isOpen]);

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setVideos(prev => prev.filter((_, i) => i !== index));
    setThumbnails(prev => prev.filter((_, i) => i !== index));
    setTitles(prev => prev.filter((_, i) => i !== index));
    setLoading(prev => prev.filter((_, i) => i !== index));
    setProgress(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: props.minHeight ?? "" }}
    >
      {!isFromCommunity && <h2>Upload Clip</h2>}
      <div className="form-group" style={{ color: "black" }}>
        {
          !isFromCommunity && userInfo?.account_type && userInfo?.account_type !== AccountType.TRAINER &&
          <>
            <label className="col-form-label mt-2 btn_css" htmlFor="account_type">
              Choose Category
            </label>
            <select
              disabled={isUploading}
              id="account_type"
              className="form-control"
              name="account_type"
              onChange={(e) => setCategory(e?.target?.value)}
              value={category}
            >
              <option>Choose Category</option>
              {categoryList?.map((category_type, index) => (
                <option key={index} value={category_type.label}>
                  {" "}
                  {category_type.label}
                </option>
              ))}
            </select>
          </>
        }
        {!isFromCommunity &&
        <>
          <label className="col-form-label mt-2 btn_css" htmlFor="account_type">
            Upload To
          </label>
          <select
            disabled={isUploading}
            id="account_type"
            className="form-control"
            name="account_type"
            onChange={(e) => setShareWith(e?.target?.value)}
            value={shareWith}
          >
            {Object.values(shareWithConstants)?.map((category_type, index) => (
              <option key={index} value={category_type}>
                {" "}
                {category_type}
              </option>
            ))}
          </select>
        </>}
        {
          !isFromCommunity && shareWith === shareWithConstants.myFriends &&
          <div className="d-flex flex-column align-items-center">
            <FriendsPopup props={{ buttonLabel: "Select Friends", setSelectedFriends,selectedFriends,isFromCommunity }} />
            <div>Total Friends Selected {selectedFriends.length}</div>
          </div>
        }
        {
          shareWith === shareWithConstants.newUsers &&
          <div className="d-flex flex-column align-items-center">
            <EmailsPopup props={{ buttonLabel: "Add New User", setSelectedEmails }} />
            <div>Total Emails Selected {selectedEmails.length}</div>
          </div>
        }

        <div style={{ textAlign: "center" }}>
          <label className="col-form-label mt-2">
            Select clips to upload: &nbsp;
          </label>
          <input
            disabled={isUploading || userInfo.status!== "approved"}
            type="file"
            name="file"
            id="fileUpload"
            onChange={handleFileChange}
            style={{ width: "67%" }}
            accept="video/*,video/mp4,video/webm,video/quicktime"
            multiple
            
          />
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="w-100 mt-3">
          {selectedFiles.map((file, index) => (
            <div key={index} className="mb-3 p-2 border rounded">
              <div className="d-flex justify-content-between align-items-center">
                <span>{file.name}</span>
                <div
                  className="icon-btn btn-sm btn-outline-light close-apps pointer"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X size={16} />
                </div>
              </div>

              <div className="form-group mt-2">
                <label className="col-form-label">Title</label>
                <input
                  disabled={isUploading}
                  className="form-control"
                  type="text"
                  placeholder="Title"
                  value={titles[index] || ""}
                  onChange={(e) => handleTitleChange(index, e.target.value)}
                  required
                />
              </div>

              {loading[index] ? (
                <div className="d-flex align-items-center mt-2">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <span className="ml-2">Generating thumbnail...</span>
                </div>
              ) : thumbnails[index]?.dataUrl ? (
                <div className="d-flex align-items-center mt-2">
                  <img
                    src={thumbnails[index]?.dataUrl}
                    alt="thumbnail"
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      border: '1px solid #ddd'
                    }}
                  />
                  <div className="ml-2">
                   <h2>{progress[index]}%</h2> 
                  </div>
                </div>
              ) : (
                <div className="text-danger mt-2">
                  Failed to generate thumbnail. Try another video.
                </div>
              )}
            </div>
          ))}
        </div>
      )}


      {selectedFiles.length > 0 && !loading.some(l => l) && (
        <div className="d-flex justify-content-center btn_css">
          <Button
            className="mx-3 btn_css"
            color="primary"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : `Upload ${selectedFiles.length} Videos`}
          </Button>
        </div>
      )}

      {/* Hidden video and canvas elements are created dynamically in handleFileChange */}
    </div>
  );
};

export default UploadClipCard;