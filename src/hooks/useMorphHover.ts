import { useState, useRef, useCallback } from 'react';

export function useMorphHover() {
  const [isHovered, setIsHovered] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  const onMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setIsHovered(true);
    setIsTracking(false);
    e.currentTarget.classList.remove('is-tracking');
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setIsTracking(true);
    }, 310);
  }, []);

  const onMouseLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setIsHovered(false);
    setIsTracking(false);
    e.currentTarget.classList.remove('is-tracking');
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  return {
    isHovered,
    className: `morph-btn ${isTracking ? 'is-tracking' : ''}`,
    handlers: {
      onMouseMove,
      onMouseEnter,
      onMouseLeave,
    },
  };
}
