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
  const [titles, setTitles] = useState([""]);
  const [category, setCategory] = useState({});
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

  useEffect(() => {
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

  const trimVideo = async (video, index) => {
    if (!video) return;

    setLoading(prev => {
      const newLoading = [...prev];
      newLoading[index] = true;
      return newLoading;
    });

    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';

    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile(inputFileName, await fetchFile(video));

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

        setThumbnails(prev => {
          const newThumbnails = [...prev];
          newThumbnails[index] = {
            thumbnailFile: blob,
            dataUrl: thumbnailUrl,
            fileType: blob.type
          };
          return newThumbnails;
        });

      } catch (error) {
        console.error('Error generating thumbnail:', error);
        alert('Error generating thumbnail');
      }
    } catch (error) {
      console.error('Error trimming video:', error);
    } finally {
      setLoading(prev => {
        const newLoading = [...prev];
        newLoading[index] = false;
        return newLoading;
      });
    }
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

  const generateThumbnailFormWindowsOSAndMacChrome = (index) => {
    const video = videoRefs.current[index];
    const canvas = canvasRefs.current[index];
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

      setThumbnails(prev => {
        const newThumbnails = [...prev];
        newThumbnails[index] = {
          thumbnailFile: thumbnailFile,
          dataUrl: dataUrl,
          fileType: fileType
        };
        return newThumbnails;
      });
    };

    setLoading(prev => {
      const newLoading = [...prev];
      newLoading[index] = false;
      return newLoading;
    });
  };

  const generateThumbnail1 = (index) => {
    setTimeout(() => {
      setLoading(prev => {
        const newLoading = [...prev];
        newLoading[index] = true;
        return newLoading;
      });

      if (deviceInfo?.os?.name?.toLowerCase() === OS.ios.toLowerCase()) {
        trimVideo(videos[index], index);
      }
      else if (deviceInfo?.os?.name?.toLowerCase() === OS.windows.toLowerCase() || 
               deviceInfo?.os?.name?.toLowerCase() === OS.android.toLowerCase() || 
               (deviceInfo?.os?.name?.toLowerCase() === OS.mac.toLowerCase() && 
                deviceInfo?.browser?.name?.toLowerCase() === BROWSER.chrome.toLowerCase())) {
        generateThumbnailFormWindowsOSAndMacChrome(index);
      } else {
        generateThumbnailMacAndiOS(index);
      }
    }, 3000);
  };

  const generateThumbnailMacAndiOS = (index) => {
    const video = videoRefs.current[index];
    const canvas = canvasRefs.current[index];
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

      setThumbnails(prev => {
        const newThumbnails = [...prev];
        newThumbnails[index] = {
          thumbnailFile: thumbnailFile,
          dataUrl: dataUrl,
          fileType: fileType
        };
        return newThumbnails;
      });

      setLoading(prev => {
        const newLoading = [...prev];
        newLoading[index] = false;
        return newLoading;
      });
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

  const handleFileChange = async (e) => {
    if (e.target.files.length) {
      const newFiles = Array.from(e.target.files);
      
      // Check file sizes
      const invalidFiles = newFiles.filter(file => (file.size / 1024 / 1024) > 150);
      if (invalidFiles.length > 0) {
        alert("Some files exceed 150 MiB and will not be uploaded");
        return;
      }

      const validFiles = newFiles.filter(file => (file.size / 1024 / 1024) <= 150);
      
      // Initialize state arrays for new files
      const newVideos = [...videos];
      const newThumbnails = [...thumbnails];
      const newTitles = [...titles];
      const newLoading = [...loading];
      
      validFiles.forEach((file, index) => {
        const videoUrl = URL.createObjectURL(file);
        const videoIndex = videos.length + index;
        
        // Create new video and canvas elements if needed
        if (!videoRefs.current[videoIndex]) {
          videoRefs.current[videoIndex] = document.createElement('video');
          videoRefs.current[videoIndex].playsInline = true;
          videoRefs.current[videoIndex].onloadedmetadata = () => generateThumbnail1(videoIndex);
          
          canvasRefs.current[videoIndex] = document.createElement('canvas');
          canvasRefs.current[videoIndex].style.display = 'none';
          document.body.appendChild(canvasRefs.current[videoIndex]);
        }
        
        videoRefs.current[videoIndex].src = videoUrl;
        
        newVideos[videoIndex] = file;
        newThumbnails[videoIndex] = null;
        newTitles[videoIndex] = "";
        newLoading[videoIndex] = true;
      });
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setVideos(newVideos);
      setThumbnails(newThumbnails);
      setTitles(newTitles);
      setLoading(newLoading);
    }
  };

  const handleTitleChange = (index, value) => {
    setTitles(prev => {
      const newTitles = [...prev];
      newTitles[index] = value;
      return newTitles;
    });
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setVideos(prev => prev.filter((_, i) => i !== index));
    setThumbnails(prev => prev.filter((_, i) => i !== index));
    setTitles(prev => prev.filter((_, i) => i !== index));
    setLoading(prev => prev.filter((_, i) => i !== index));
    setProgress(prev => prev.filter((_, i) => i !== index));
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
    const uploadPromises = selectedFiles.map(async (file, index) => {
      let IsTrainer = userInfo.account_type === AccountType.TRAINER;

      var payload = {
        filename: file?.name,
        fileType: file?.type,
        thumbnail: thumbnails[index]?.fileType,
        title: titles[index],
        category: IsTrainer ? userInfo.category : category,
      };

      if (shareWith === shareWithConstants.myFriends) {
        payload.user_id = selectedFriends;
      } else if (shareWith === shareWithConstants.newUsers) {
        payload.invites = selectedEmails;
      }

      try {
        const data = await getS3SignUrl(payload);
        if (data?.url) {
          await pushProfilePhotoToS3(data.url, file, index);
          await pushProfilePhotoToS3(data.thumbnailURL, thumbnails[index].thumbnailFile, index);
          return true;
        }
        return false;
      } catch (error) {
        console.error(`Error uploading file ${index}:`, error);
        return false;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      if (results.every(r => r)) {
        toast.success("All clips uploaded successfully.");
        setSelectedFiles([]);
        setVideos([]);
        setThumbnails([]);
        setTitles([""]);
        setLoading([]);
        setProgress([]);
        dispatch(getClipsAsync({}));
      } else {
        toast.error("Some clips failed to upload.");
      }
    } catch (error) {
      console.error("Error during upload:", error);
      toast.error("Error during upload");
    } finally {
      setIsUploading(false);
    }
  };

  async function pushProfilePhotoToS3(presignedUrl, uploadPhoto, index) {
    try {
      const myHeaders = new Headers({
        "Content-Type": uploadPhoto.type,
        "Content-Disposition": "inline",
      });
      
      const response = await axios.put(presignedUrl, uploadPhoto, {
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
      console.error("Error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
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
      setCategory({});
      setSelectedFiles([]);
    }
  }, [isOpen]);

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: props.minHeight ?? "" }}
    >
      <h2>Upload Clip</h2>
      <div className="form-group" style={{ color: "black" }}>
        {
          userInfo?.account_type && userInfo?.account_type !== AccountType.TRAINER &&
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
        </>
        {
          shareWith === shareWithConstants.myFriends &&
          <div className="d-flex flex-column align-items-center">
            <FriendsPopup props={{ buttonLabel: "Select Friends", setSelectedFriends }} />
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
            disabled={isUploading}
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
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X size={16} />
                </button>
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
                <div style={{ color: "black" }}>Generating thumbnail...</div>
              ) : thumbnails[index]?.fileType ? (
                <div className="d-flex align-items-center mt-2">
                  <img 
                    src={thumbnails[index]?.dataUrl} 
                    alt="thumbnail" 
                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                  />
                  <div className="ml-2">
                    {progress[index] > 0 && (
                      <div>Upload progress: {progress[index]}%</div>
                    )}
                  </div>
                </div>
              ) : null}
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