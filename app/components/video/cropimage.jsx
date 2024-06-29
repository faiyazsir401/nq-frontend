import React, { useState, useRef, useEffect } from "react";
import CusotomModal from "../../common/modal";
import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    Crop,
    PixelCrop,
    convertToPixelCrop,
} from "react-image-crop";
import { canvasPreview } from "./canvasPreview";
import { useDebounceEffect } from "./useDebounceEffect";

import "react-image-crop/dist/ReactCrop.css";
import { X } from "react-feather";
import { Button } from "reactstrap";
import { cropImage } from "../videoupload/videoupload.api";
import { awsS3Url } from "../../../utils/constant";

function centerAspectCrop(
    mediaWidth,
    mediaHeight,
    aspect,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: "%",
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}
const CropImage = ({ isOpenCrop, setIsOpenCrop, selectImage, screenShots, setScreenShots, handleCropImage }) => {
    const [imgSrc, setImgSrc] = useState("");
    const previewCanvasRef = useRef(null);
    const imgRef = useRef(null);
    const hiddenAnchorRef = useRef(null);
    const blobUrlRef = useRef("");
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [aspect, setAspect] = useState(16 / 9);


    console.log("imgSrc", imgSrc);

    useEffect(() => {
        setImgSrc("")
        if (selectImage) fetchImage();
    }, [selectImage]);



    const fetchImage = async () => {
        try {
            const response = await fetch(`${awsS3Url}${selectImage}`);
            const blob = await response.blob();
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64data = reader.result.split(',')[1];
                setImgSrc(`data:image/jpeg;base64,${base64data}`);
            };

            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Error fetching or converting image:', error);
        }
    };

    function onImageLoad(e) {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    }

    async function onDownloadCropClick() {
        const image = imgRef.current;
        const previewCanvas = previewCanvasRef.current;
        if (!image || !previewCanvas || !completedCrop) {
            throw new Error("Crop canvas does not exist");
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const offscreen = new OffscreenCanvas(
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
        );
        const ctx = offscreen.getContext("2d");
        if (!ctx) {
            throw new Error("No 2d context");
        }

        ctx.drawImage(
            previewCanvas,
            0,
            0,
            previewCanvas.width,
            previewCanvas.height,
            0,
            0,
            offscreen.width,
            offscreen.height,
        );
        // You might want { type: "image/jpeg", quality: <0 to 1> } to
        // reduce image size
        const blob = await offscreen?.convertToBlob({ type: "image/png" });

        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
        }

        if (blob) {
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64String = reader.result;
                // screenShots[selectImage].imageUrl = base64String
                handleCropImage(selectImage, blob)
                // setScreenShots([...screenShots])
                // setIsOpenCrop(false)
            };
            reader.readAsDataURL(blob);
        }

        blobUrlRef.current = URL.createObjectURL(blob);
    }


    useDebounceEffect(
        async () => {
            if (
                completedCrop?.width &&
                completedCrop?.height &&
                imgRef.current &&
                previewCanvasRef.current
            ) {
                // We use canvasPreview as it's much faster than imgPreview.
                canvasPreview(
                    imgRef.current,
                    previewCanvasRef.current,
                    completedCrop,
                    scale,
                    rotate,
                );
            }
        },
        100,
        [completedCrop, scale, rotate],
    );

    useEffect(() => {
        if (aspect) {
            setAspect(undefined);
        } else {
            if (imgRef.current) {
                const { width, height } = imgRef.current;
                const newCrop = centerAspectCrop(width, height, 16 / 9);
                setCrop(newCrop);
                // Updates the preview
                setCompletedCrop(convertToPixelCrop(newCrop, width, height));
            }
        }
    }, [imgRef])

    return <>
        <CusotomModal
            isOpen={isOpenCrop}
            element={
                <>
                    <div className="container media-gallery portfolio-section grid-portfolio">
                        <div className="theme-title  mb-5">
                            <div className="media-body media-body text-right" >
                                <div
                                    className="icon-btn btn-sm btn-outline-light close-apps pointer"
                                    onClick={() => { setIsOpenCrop(false) }}
                                >
                                    <X />
                                </div>
                            </div>
                            <div className="media d-flex flex-column  align-items-center">
                                <div>
                                    <h2>Image Crop</h2>
                                </div>
                            </div>
                        </div>

                        <div className="theme-tab">
                            {!!imgSrc && (
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={aspect}
                                    minHeight={100}
                                >
                                    <img
                                        ref={imgRef}
                                        alt="Crop me"
                                        src={imgSrc}
                                        onLoad={onImageLoad}
                                    />
                                </ReactCrop>
                            )}
                            {!!completedCrop && (
                                <>
                                    <div style={{ display: "none" }}>
                                        <canvas
                                            ref={previewCanvasRef}
                                            style={{
                                                border: "1px solid black",
                                                objectFit: "contain",
                                                width: completedCrop.width,
                                                height: completedCrop.height,
                                            }}
                                        />
                                    </div>
                                    <div className="d-flex justify-content-center w-100 p-3">
                                        <Button className="mx-3" color="primary" onClick={onDownloadCropClick}>Save</Button>
                                        {/* <a
                                            href="#hidden"
                                            ref={hiddenAnchorRef}
                                            download
                                            style={{
                                                position: "absolute",
                                                top: "-200vh",
                                                visibility: "hidden",
                                            }}
                                        >
                                            Hidden download
                                        </a> */}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            }
        />
    </>
}

export default CropImage;