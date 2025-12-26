import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { screenShotTake } from '../../../videoupload/videoupload.api';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing screenshot functionality
 * Extracted from video.jsx to improve maintainability
 */
export const useScreenshots = ({
  id,
  fromUser,
  toUser,
  setIsTooltipShow,
}) => {
  const [screenShots, setScreenShots] = useState([]);
  const [isScreenShotModelOpen, setIsScreenShotModelOpen] = useState(false);
  const [selectImage, setSelectImage] = useState(0);

  /**
   * Take a screenshot of the current video call
   */
  const takeScreenshot = useCallback(async () => {
    try {
      setIsTooltipShow(false);

      const element = document.getElementById('bookings');
      if (!element) {
        toast.error('Unable to capture screenshot');
        return;
      }

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 1,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Failed to create screenshot');
          return;
        }

        try {
          const formData = new FormData();
          formData.append('file', blob, 'screenshot.png');
          formData.append('sessions', id);
          formData.append('trainer', fromUser?._id);
          formData.append('trainee', toUser?._id);

          const response = await screenShotTake(formData);
          
          if (response?.data?.url) {
            setScreenShots((prev) => [
              ...prev,
              {
                url: response.data.url,
                timestamp: new Date().toISOString(),
              },
            ]);
            toast.success('Screenshot captured successfully');
          } else {
            toast.error('Failed to upload screenshot');
          }
        } catch (error) {
          console.error('Error uploading screenshot:', error);
          toast.error('Failed to upload screenshot');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error taking screenshot:', error);
      toast.error('Failed to capture screenshot');
    }
  }, [id, fromUser, toUser, setIsTooltipShow]);

  /**
   * Remove a screenshot
   */
  const removeScreenshot = useCallback((index) => {
    setScreenShots((prev) => prev.filter((_, i) => i !== index));
    if (selectImage >= index && selectImage > 0) {
      setSelectImage(selectImage - 1);
    }
  }, [selectImage]);

  /**
   * Set selected image index
   */
  const setSelectedImage = useCallback((index) => {
    setSelectImage(index);
  }, []);

  return {
    screenShots,
    isScreenShotModelOpen,
    selectImage,
    takeScreenshot,
    removeScreenshot,
    setSelectedImage,
    setScreenShots,
    setIsScreenShotModelOpen,
  };
};

