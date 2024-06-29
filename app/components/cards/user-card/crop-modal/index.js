import React, { useState, useRef, useEffect } from "react";
import { Modal } from "reactstrap";
import { MdOutlineRotate90DegreesCcw } from "react-icons/md";
import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const CropImage = ({ image, isModalOpen, setIsModalOpen, setCroppedImage, setDisplayedImage }) => {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(16 / 9);
  const [completedCrop, setCompletedCrop] = useState();
  
  async function showCroppedImage() {
    const image = imgRef.current;
    if (!image || !completedCrop) {
      throw new Error('Crop canvas does not exist');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }
    
    // Apply rotation to the canvas
  ctx.translate(offscreen.width / 2, offscreen.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-offscreen.width / 2, -offscreen.height / 2);

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      offscreen.width,
      offscreen.height
    );

    const blob = await offscreen.convertToBlob({
      type: 'image/png',
    });

    const bloburl = URL.createObjectURL(blob);
    setDisplayedImage(bloburl);
    setCroppedImage(blob);
    setIsModalOpen(false);
    setRotation(0)
  }

  const onClose = () => {
    setIsModalOpen(false);
    setCroppedImage(null);
    setRotation(0)
  };

  const handleRotation = () => {
    setRotation((rotation + 90) % 360);
  };

  function onImageLoad(e) {
    // if (aspect) {
    //   const { width, height } = e.currentTarget;
    //   setCrop(centerAspectCrop(width, height, aspect));
    // }

    if (aspect) {
      const { width, height } = e.currentTarget;
      const cropWidth = Math.min(width, height * aspect);
      const cropHeight = Math.min(height, width / aspect);
      const x = (width - cropWidth) / 2;
      const y = (height - cropHeight) / 2;
      setCrop({ unit: "%", x, y, width: cropWidth, height: cropHeight });
    }
  }

  useEffect(() => {
    if (aspect) {
      setAspect(undefined);
    } else {
      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerAspectCrop(width, height, 16 / 9);
        setCrop(newCrop);
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      }
    }
  }, [imgRef]);

  return (
    <Modal isOpen={isModalOpen} centered>
      {image && (
        <div>
          <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          
          <img
            ref={imgRef}
            alt="Crop me"
            src={URL.createObjectURL(image)}
            style={{ transform: `rotate(${rotation}deg)`  , objectFit : 'contain', height: "80vh"}}
            onLoad={onImageLoad}
          />
        </ReactCrop>
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
          marginTop: "10px",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            border: "1px solid red",
            color: "#fff",
            backgroundColor: "red",
            borderRadius: "8px",
            padding: "8px 15px",
            fontSize: "12px",
            outline: "none",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleRotation}
          style={{
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            color: "#000",
            fontSize: "25px",
          }}
        >
          <MdOutlineRotate90DegreesCcw />
        </button>
        <button
          type="button"
          onClick={showCroppedImage}
          style={{
            border: "1px solid green",
            color: "#fff",
            backgroundColor: "green",
            borderRadius: "8px",
            padding: "8px 15px",
            fontSize: "12px",
            outline: "none",
          }}
        >
          Done
        </button>
      </div>
    </Modal>
  );
};

export default CropImage;
