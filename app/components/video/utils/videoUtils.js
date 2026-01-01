/**
 * Utility functions for video component
 */

/**
 * Format time as MM:SS
 */
export const formatTime = (timeInSeconds) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Calculate canvas dimensions based on video elements
 */
export const calculateCanvasDimensions = (selectedClips) => {
  const video1 = document.getElementById('selected-video-1');
  const video2 = document.getElementById('selected-video-2');
  
  if (!video1) {
    console.error("Video element 'selected-video-1' not found.");
    return {};
  }

  // If only one clip is selected
  if (selectedClips?.length && selectedClips?.length === 1) {
    const rect1 = video1.getBoundingClientRect();
    return {
      top: rect1.top + window.scrollY,
      left: rect1.left + window.scrollX,
      width: rect1.width,
      height: rect1.height,
    };
  }

  // If both clips are selected
  if (!video2) {
    console.error("Video element 'selected-video-2' not found.");
    return {};
  }

  const rect1 = video1.getBoundingClientRect();
  const rect2 = video2.getBoundingClientRect();

  const top = Math.min(rect1.top, rect2.top) + window.scrollY;
  const left = Math.min(rect1.left, rect2.left) + window.scrollX;
  const width = rect1.width + rect2.width;
  const height = Math.max(rect1.height, rect2.height);

  return {
    top,
    left,
    width,
    height,
  };
};

/**
 * Error handling function
 */
export const errorHandling = (err) => {
  // This will be replaced with toast.error in the component
  console.error(err);
};

