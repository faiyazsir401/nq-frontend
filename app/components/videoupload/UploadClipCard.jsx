import React, { useEffect, useState, useRef } from "react";
import { videouploadState, videouploadAction } from "./videoupload.slice";
import { useAppSelector, useAppDispatch } from "../../store";
import Modal from "../../common/modal";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";
import { getS3SignUrl } from "./videoupload.api";
import { LIST_OF_ACCOUNT_TYPE } from "../../common/constants";
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

const UploadClipCard = (props) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState({});
  const [categoryList, setCategoryList] = useState([]);
  const ref = useRef();
  const dispatch = useAppDispatch();
  const [progress, setProgress] = useState(0);
  const { isOpen } = useAppSelector(videouploadState);

  const [thumbnail, setThumbnail] = useState('');
  console.log("thumbnail===================>", thumbnail)
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  // const ffmpegRef = useRef(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  const [video, setVideo] = useState(null);
  // const [printLog, setPrintLog] = useState(null);

  const [loading, setLoading] = useState(false);
  const ffmpegRef = useRef(null);
  const [deviceInfo, setDeviceInfo] = useState({});
  console.log("deviceInfo===================>", deviceInfo)


  useEffect(() => {

    const result = parser.getResult();
    setDeviceInfo(result);
  }, []);

  // useEffect(() => {
  //   const load = async () => {
  //     const ffmpeg = new FFmpeg();
  //     ffmpegRef.current = ffmpeg;
  //     await ffmpeg.load({
  //       coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
  //       wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
  //     });
  //   };
  //   load();
  // }, []);

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        // console.log("1===================>")
        const ffmpeg = new FFmpeg();
        // console.log("2===================>")
        ffmpegRef.current = ffmpeg;
        // console.log("3===================>")
        // await ffmpeg.load({
        //   coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
        //   wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
        // });

        const coreURL = '/ffmpeg-core.js';
        const wasmURL = '/ffmpeg-core.wasm';

        await ffmpeg.load({ coreURL, wasmURL });
        setFfmpegLoaded(true);

        // console.log("4===================>")
        setFfmpegLoaded(true);
      } catch (error) {
        console.error('Error loading FFmpeg:', error);
      }
    };
    loadFFmpeg();
  }, []);



  const trimVideo = async () => {
    if (!video) return;

    setLoading(true);
    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';

    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile(inputFileName, await fetchFile(video));

      let compressionSettings = '-crf 23';

      await ffmpeg.exec([
        '-i', inputFileName,
        '-ss', '0',
        '-to', '2',
        '-c', 'copy',
        outputFileName
      ]);

      // await ffmpeg.exec([
      //   '-i', inputFileName,
      //   '-ss', '0',
      //   '-to', '2',
      //   '-c:v', 'libx264',
      //   '-preset', 'medium',
      //   ...compressionSettings.split(' '),
      //   '-c:a', 'aac',
      //   '-b:a', '128k',
      //   outputFileName
      // ]);

      const data = await ffmpeg.readFile(outputFileName);
      const trimmedVideoBlob = new Blob([data.buffer], { type: 'video/mp4' });
      // setTrimmedVideo(URL.createObjectURL(trimmedVideoBlob));


      // console.log("4===================>", {video, trimmedVideoBlob})
      // Generate thumbnail 

      const formData = new FormData();
      formData.append('video', trimmedVideoBlob);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/common/generate-thumbnail`, {
        // const response = await fetch(`https://6d3e-59-99-53-84.ngrok-free.app/common/generate-thumbnail`, {
          method: 'POST',
          headers: {
            // "Content-Type": "application/json",
            // "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
          // credentials: 'include' 
        });
        // const response = await generateThumbnailURL(formData);

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

        // console.log("=============>", {thumbnailUrl,blob })
        // setThumbnail(thumbnailUrl);
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        alert('Error generating thumbnail');
      } finally {
      }



    } catch (error) {
      console.error('Error trimming video:', error);
    } finally {
      setLoading(false);
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


  const generateThumbnailFormWindowsOSAndMacChrome = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match the video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Seek to 1 second (or 25% of the video, whichever is less)
    const seekTime = Math.min(1, video.duration * 0.25);
    video.currentTime = seekTime;

    // Wait for the seek to complete before capturing the frame
    video.onseeked = () => {
      // Draw the current video frame on the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to data URL
      // const dataUrl = canvas.toDataURL('image/jpeg');
      // setThumbnail(dataUrl);

      const imageFormat = 'image/jpeg';
      const quality = 0.8;  // Optional: quality for JPEG (0 to 1)

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL(imageFormat, quality);

      // Extract file type from the data URL
      const fileType = dataUrl.split(';')[0].split(':')[1];

      const thumbnailFile = dataURLtoFile(dataUrl, `thumbnail.${fileType.split('/')[1]}`);

      setThumbnail({
        thumbnailFile: thumbnailFile,
        dataUrl: dataUrl,
        fileType: fileType
      });
    };

    setLoading(false)
  };

  const generateThumbnail1 = () => {

    setTimeout(() => {

      if (deviceInfo?.os?.name?.toLowerCase() === OS.ios.toLowerCase()) {
        trimVideo();
      }
      else if (deviceInfo?.os?.name?.toLowerCase() === OS.windows.toLowerCase() || deviceInfo?.os?.name?.toLowerCase() === OS.android.toLowerCase() || (deviceInfo?.os?.name?.toLowerCase() === OS.mac.toLowerCase() && deviceInfo?.browser?.name?.toLowerCase() === BROWSER.chrome.toLowerCase())) {
        generateThumbnailFormWindowsOSAndMacChrome();
      } else {
        generateThumbnailMacAndiOS()
      }

      // setLoading(false)

    }, 3000);

  }


  const generateThumbnailMacAndiOS = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Function to capture the frame
    const captureFrame = () => {
      // Set canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame on the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageFormat = 'image/jpeg';
      const quality = 0.8;

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL(imageFormat, quality);

      // Extract file type from the data URL
      const fileType = dataUrl.split(';')[0].split(':')[1];

      const thumbnailFile = dataURLtoFile(dataUrl, `thumbnail.${fileType.split('/')[1]}`);

      setThumbnail({
        thumbnailFile: thumbnailFile,
        dataUrl: dataUrl,
        fileType: fileType
      });

      setLoading(false)
    };

    // Play the video (this might trigger autoplay on iOS)
    video.play().then(() => {
      // Pause immediately after starting playback
      video.pause();

      // Seek to 1 second (or 25% of the video, whichever is less)
      const seekTime = Math.min(1, video.duration * 0.25);
      video.currentTime = seekTime;

      // Use both timeupdate and seeked events
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
      // Handle the error, maybe try to capture the frame anyway
      captureFrame();
    });
  };

  const handleFileChange = async (e) => {
    setThumbnail(null);
    setVideo(null);
    setSelectedFile(null);
    setLoading(true)
    if (e.target.files.length) {
      // console.log("e.target.files======>", e.target.files.length)
      const file = e.target.files[0];

      const videoUrl = URL.createObjectURL(file);
      videoRef.current.src = videoUrl;

      const fileSize = file?.size / 1024 / 1024; // in MiB
      if (fileSize > 150) {
        alert("File size exceeds 50 MiB");
        setThumbnail(null);
        setVideo(null);
        setSelectedFile(null);
        setLoading(false)
      } else {
        setSelectedFile(file);

        // *********************************************************
        if (file) {
          setVideo(file);
        }


        // const formData = new FormData();
        // formData.append('video', file);

        // try {
        //   // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/common/generate-thumbnail`, {
        //   const response = await fetch(`https://6d3e-59-99-53-84.ngrok-free.app/common/generate-thumbnail`, {
        //     method: 'POST',
        //     headers: {
        //       // "Content-Type": "application/json",
        //       // "Access-Control-Allow-Origin": "*",
        //       Authorization: `Bearer ${localStorage.getItem("token")}`,
        //     },
        //     body: formData,
        //     // credentials: 'include' 
        //   });
        //   // const response = await generateThumbnailURL(formData);

        //   if (!response.ok) {
        //     throw new Error('Failed to generate thumbnail');
        //   }

        //   const blob = await response.blob();
        //   const thumbnailUrl = URL.createObjectURL(blob);

        //   setThumbnail({
        //     thumbnailFile: blob,
        //     dataUrl: thumbnailUrl,
        //     fileType: blob.type
        //   });

        //   // console.log("=============>", {thumbnailUrl,blob })
        //   setThumbnail(thumbnailUrl);
        // } catch (error) {
        //   console.error('Error generating thumbnail:', error);
        //   alert('Error generating thumbnail');
        // } finally {
        // }


      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a video file.");
      return;
    }

    if (!thumbnail?.fileType) {
      toast.error("Please select a video file.");
      return;
    }

    var payload = {
      filename: selectedFile?.name,
      fileType: selectedFile?.type,
      thumbnail: thumbnail?.fileType,
      title: title,
      category: category,
    };
    const data = await getS3SignUrl(payload);

    if (data?.url) {
      await pushProfilePhotoToS3(data.url, selectedFile, 'video');
      await pushProfilePhotoToS3(data.thumbnailURL, thumbnail.thumbnailFile);
      // Create a new file input element
      const newFileInput = document.createElement("input");
      newFileInput.type = "file";
      newFileInput.id = "fileUpload";
      newFileInput.name = "file";
      newFileInput.onchange = handleFileChange;
      newFileInput.style.width = "67%";
      // Replace the existing file input with the new one
      const existingFileInput = document.getElementById("fileUpload");
      existingFileInput.parentNode.replaceChild(
        newFileInput,
        existingFileInput
      );
    }
  };

  async function pushProfilePhotoToS3(presignedUrl, uploadPhoto, type) {
    const myHeaders = new Headers({
      "Content-Type": selectedFile.type,
      "Content-Disposition": "inline",
    });
    // console.log("HEADERSSSSSS :       ==>", myHeaders);
    axios
      .put(presignedUrl, uploadPhoto, {
        headers: myHeaders,
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percentCompleted = (loaded / total) * 100;
          if(type === 'video'){
            console.log("percentCompleted =====", percentCompleted)
            setProgress(
              Math.trunc(percentCompleted === 100 ? 0 : percentCompleted)
            );
          }
        },
      })
      .then((response) => {
        dispatch(videouploadAction.uploadVideoS3(selectedFile));
        setTitle("");
        setCategory({});
        setSelectedFile(null);
        setThumbnail(null);
        setVideo(null);
        setLoading(true)
        dispatch(getClipsAsync({}));
      })
      .catch((error) => {
        console.error("Error:", error);

        if (error.response) {
          console.error("Response data:", error.response.data);
        }
      });
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
    if (progress == 100) {
      dispatch(videouploadAction?.setIsOpen(false));
    }
  }, [progress]);

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setCategory({});
      setSelectedFile(false);
      setProgress(0);
    }
  }, [isOpen]);

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: props.minHeight ?? "" }}
    >
      <h2>Upload Clip</h2>
      <div className="form-group" style={{ color: "black" }}>
        <label className="col-form-label">Title</label>
        <input
          disabled={progress}
          className="form-control"
          type="text"
          name="fullname"
          placeholder="Title"
          onChange={(e) => setTitle(e?.target?.value)}
          value={title}
        />
        <label className="col-form-label mt-2 btn_css" htmlFor="account_type">
          Choose Category
        </label>
        <select
          disabled={progress}
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
        <div style={{ textAlign: "center" }}>
          <label className="col-form-label mt-2">
            Select a clip to upload: &nbsp;
          </label>
          <input
            disabled={progress}
            type="file"
            name="file"
            id="fileUpload"
            onChange={handleFileChange}
            style={{ width: "67%" }}
            accept="video/*,video/mp4,video/webm,"
          />
        </div>
      </div>
      {progress ? (
        <label
          style={{ color: "black" }}
          className="col-form-label mt-2"
          htmlFor="account_type"
        >
          Uploading...
        </label>
      ) : !loading ? (
        <div className="d-flex justify-content-center btn_css">
          <Button
            className="mx-3 btn_css"
            color="primary"
            onClick={handleUpload}
          >
            Upload
          </Button>
        </div>
      ) : null}

      {/* <img src={thumbnailUrl} alt="thumbnail"/> */}

      {/* <video 
        ref={videoRef} 
        style={{ display: 'none' }} 
        onLoadedMetadata={generateThumbnail}
      /> */}

      {/* <video ref={videoRef} style={{ display: 'none' }} playsInline /> */}
      <video ref={videoRef} style={{ display: 'none' }} playsInline onLoadedMetadata={generateThumbnail1} />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {video && ffmpegLoaded && !thumbnail?.dataUrl && (<button onClick={trimVideo} disabled={loading}>
        {loading ? 'Wait Thumbnail is genrating...' : 'Create Thumbnail'}
      </button>)}

      {/* {thumbnail && (
        <div>
          <img src={thumbnail?.dataUrl} alt="Video Thumbnail" height="100" width="100" />
        </div>
      )} */}
      {/* <span >{deviceInfo?.browser?.name } = {deviceInfo?.os?.name}</span> */}
      {/* <span >{JSON.stringify(thumbnail?.thumbnailFile)}</span>
      <span >{JSON.stringify(thumbnail?.thumbnail?.fileType)}</span> */}

    </div>
  );
};

export default UploadClipCard;
