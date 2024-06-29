import { useEffect, useState } from 'react';

export const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState({
    height: 0,
    width: 0,
  });

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setDimensions({
          height: window.innerHeight,
          width: window.innerWidth,
        });
      };

      // Initialize dimensions
      handleResize();

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return dimensions;
};
