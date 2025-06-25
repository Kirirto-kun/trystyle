"use client"

import { useEffect, useState } from 'react';

export const useRealVpHeight = () => {
  const [vpHeight, setVpHeight] = useState('100vh');

  useEffect(() => {
    const setHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      setVpHeight(`calc(var(--vh, 1vh) * 100)`);
    };

    setHeight();

    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  return vpHeight;
};

export const useRealViewportHeight = () => {
  useEffect(() => {
    const setRealViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set the initial value
    setRealViewportHeight();

    // Update the value on resize
    window.addEventListener('resize', setRealViewportHeight);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', setRealViewportHeight);
    };
  }, []);
}; 