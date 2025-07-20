import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const usePlatform = () => {
  const [isNative, setIsNative] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Check if running in a native Capacitor container
    setIsNative(Capacitor.isNativePlatform());

    // Listener to check for screen size changes
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768); // 768px is a common tablet breakpoint
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isNative,       // true if it's a mobile app, false if it's a web browser
    isMobileView,   // true if the screen is narrow
  };
};