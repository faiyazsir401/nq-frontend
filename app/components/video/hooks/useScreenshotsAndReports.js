import { useState, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import axios from 'axios';
import jsPDF from 'jspdf';
import {
  screenShotTake,
  getReport,
  createReport,
  removeImage,
  cropImage,
} from '../../videoupload/videoupload.api';
import { getS3SignPdfUrl } from '../video.api';
import { awsS3Url } from '../../../../utils/constant';

/**
 * Custom hook for managing screenshots and reports
 */
export const useScreenshotsAndReports = ({
  id,
  fromUser,
  toUser,
  selectedClips,
  setIsTooltipShow,
  errorHandling,
}) => {
  const [screenShots, setScreenShots] = useState([]);
  const [isScreenShotModelOpen, setIsScreenShotModelOpen] = useState(false);
  const [reportObj, setReportObj] = useState({ title: '', topic: '' });
  const [reportArr, setReportArr] = useState([]);

  /**
   * Take screenshot
   */
  const takeScreenshot = useCallback(async () => {
    setIsTooltipShow(false);
    setIsScreenShotModelOpen(false);

    const targetElement = document.body;

    // Hide UI elements
    const elementsToHide = [
      '.creationBarItem',
      '.call-action-buttons',
      '.main-nav',
      '.Pause',
      '.Pause2',
      '.progress1',
      '.progress2',
      '#user-video-1',
      '#user-video-2',
      '#ChevronLeft',
      '#ChevronRight',
      '#sessionEndTime',
      '.custom-tooltip-hh',
    ];

    const elements = elementsToHide.map((selector) => ({
      selector,
      element: document.querySelector(selector),
    }));

    elements.forEach(({ element }) => {
      if (element) {
        element.style.transition = 'opacity 1s';
        element.style.opacity = '0';
        if (element.id === 'ChevronLeft' || element.id === 'ChevronRight') {
          element.style.background = '#fff';
        }
        if (element.className.includes('custom-tooltip-hh')) {
          element.style.visibility = 'hidden';
          element.style.display = 'none';
          element.style.zIndex = '-1';
        }
      }
    });

    // Hide video elements if clips are selected
    if (selectedClips?.length) {
      const userVideo1 = document.getElementById('user-video-1');
      const userVideo2 = document.getElementById('user-video-2');
      if (userVideo1) {
        userVideo1.style.transition = 'opacity 1s';
        userVideo1.style.opacity = '0';
      }
      if (userVideo2) {
        userVideo2.style.transition = 'opacity 1s';
        userVideo2.style.opacity = '0';
      }
    }

    try {
      const canvas = await html2canvas(targetElement, {
        type: 'png',
        allowTaint: true,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL('image/png');
      setIsTooltipShow(true);

      // Show UI elements again
      elements.forEach(({ element }) => {
        if (element) {
          element.style.opacity = '1';
          if (element.id === 'ChevronLeft' || element.id === 'ChevronRight') {
            element.style.background = '#000080';
          }
          if (element.className.includes('custom-tooltip-hh')) {
            element.style.visibility = 'visible';
            element.style.display = 'inline';
            element.style.zIndex = '999';
          }
        }
      });

      if (selectedClips?.length) {
        const userVideo1 = document.getElementById('user-video-1');
        const userVideo2 = document.getElementById('user-video-2');
        if (userVideo1) {
          userVideo1.style.opacity = '1';
        }
        if (userVideo2) {
          userVideo2.style.opacity = '1';
        }
      }

      const res = await screenShotTake({
        sessions: id,
        trainer: fromUser?._id,
        trainee: toUser?._id,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      if (!blob) {
        return errorHandling('Unable to take Screen Shot');
      }

      if (res?.data?.url) {
        setIsScreenShotModelOpen(true);
        await pushProfilePhotoToS3(res?.data?.url, blob, afterSucessUploadImageOnS3);
      }

      setTimeout(() => {
        toast.success('The screenshot taken successfully.', {
          type: 'success',
        });
      }, 2000);
    } catch (error) {
      errorHandling('Failed to take screenshot');
    }
  }, [
    id,
    fromUser,
    toUser,
    selectedClips,
    setIsTooltipShow,
    errorHandling,
  ]);

  /**
   * Upload photo to S3
   */
  const pushProfilePhotoToS3 = useCallback(
    async (presignedUrl, uploadPhoto, cb) => {
      const myHeaders = new Headers({ 'Content-Type': 'image/*' });
      await axios.put(presignedUrl, uploadPhoto, {
        headers: myHeaders,
      });

      if (cb) cb();

      const v = document.getElementById('selected-video-1');
      if (v) v.style.backgroundImage = '';
      const v2 = document.getElementById('selected-video-2');
      if (v2) v2.style.backgroundImage = '';
      return true;
    },
    []
  );

  /**
   * After successful upload
   */
  const afterSucessUploadImageOnS3 = useCallback(async () => {
    const result = await getReport({
      sessions: id,
      trainer: fromUser?._id,
      trainee: toUser?._id,
    });
    setScreenShots(result?.data?.reportData);
  }, [id, fromUser, toUser]);

  /**
   * Get report data
   */
  const getReportData = useCallback(async () => {
    const res = await getReport({
      sessions: id,
      trainer: fromUser?._id,
      trainee: toUser?._id,
    });
    setScreenShots(res?.data?.reportData);
    setReportObj({ title: res?.data?.title, topic: res?.data?.description });
  }, [id, fromUser, toUser]);

  /**
   * Set screenshot images
   */
  useEffect(() => {
    const setScreenShot = async () => {
      const newReportImages = [];

      for (let index = 0; index < screenShots?.length; index++) {
        const element = screenShots[index];
        try {
          const response = await fetch(`${awsS3Url}${element?.imageUrl}`);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            newReportImages[index] = {
              ...element,
              imageUrl: `data:image/jpeg;base64,${base64data}`,
            };
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          // Handle error silently
        }
      }

      setReportArr([...newReportImages]);
    };

    setScreenShot();
  }, [screenShots?.length]);

  /**
   * Generate PDF
   */
  const generatePDF = useCallback(async () => {
    const pdf = new jsPDF();
    const content = document.getElementById('report-pdf');
    if (!content) return;

    content.style.removeProperty('display');

    const canvas = await html2canvas(content, { type: 'png' });
    const imgData = canvas.toDataURL('image/png');

    const pageWidth = pdf.internal.pageSize.width;
    const aspectRatio = canvas.width / canvas.height;
    const imgHeight = pageWidth / aspectRatio;

    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);

    const generatedPdfDataUrl = pdf.output('dataurlstring');
    const byteCharacters = atob(generatedPdfDataUrl.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const pdfBlob = new Blob([new Uint8Array(byteNumbers)], {
      type: 'application/pdf',
    });

    const pdfFile = new File([pdfBlob], 'generated_pdf.pdf', {
      type: 'application/pdf',
    });

    const link = await createUploadLink();
    if (link) {
      await pushProfilePDFToS3(link, pdfFile);
    }

    content.style.display = 'none';

    await createReport({
      sessions: id,
      trainer: fromUser?._id,
      trainee: toUser?._id,
      title: reportObj?.title,
      topic: reportObj?.topic,
      reportData: screenShots,
    });
  }, [id, fromUser, toUser, reportObj, screenShots]);

  /**
   * Push PDF to S3
   */
  const pushProfilePDFToS3 = useCallback(async (presignedUrl, uploadPdf) => {
    const myHeaders = new Headers({ 'Content-Type': 'application/pdf' });
    await axios.put(presignedUrl, uploadPdf, {
      headers: myHeaders,
    });
  }, []);

  /**
   * Create upload link
   */
  const createUploadLink = useCallback(async () => {
    const payload = { session_id: id };
    const data = await getS3SignPdfUrl(payload);
    return data?.url || '';
  }, [id]);

  /**
   * Handle remove image
   */
  const handleRemoveImage = useCallback(
    async (filename) => {
      await removeImage({
        sessions: id,
        trainer: fromUser?._id,
        trainee: toUser?._id,
        filename: filename,
      });
      getReportData();
    },
    [id, fromUser, toUser, getReportData]
  );

  /**
   * Handle crop image
   */
  const handleCropImage = useCallback(
    async (filename, blob) => {
      const res = await cropImage({
        sessions: id,
        trainer: fromUser?._id,
        trainee: toUser?._id,
        oldFile: filename,
      });
      if (res?.data?.url) {
        await pushProfilePhotoToS3(res?.data?.url, blob);
      }
      getReportData();
    },
    [id, fromUser, toUser, pushProfilePhotoToS3, getReportData]
  );

  return {
    screenShots,
    isScreenShotModelOpen,
    reportObj,
    reportArr,
    takeScreenshot,
    getReportData,
    generatePDF,
    handleRemoveImage,
    handleCropImage,
    setScreenShots,
    setIsScreenShotModelOpen,
    setReportObj,
  };
};

