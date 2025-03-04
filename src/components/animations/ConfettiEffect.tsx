
import React, { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";

interface ConfettiEffectProps {
  isActive: boolean;
  duration?: number;
  particleCount?: number;
}

export const ConfettiEffect = ({ 
  isActive, 
  duration = 2000, 
  particleCount = 50 
}: ConfettiEffectProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isActive) {
      setShowConfetti(true);
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  if (!showConfetti) return null;

  return (
    <ReactConfetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={particleCount}
      gravity={0.3}
      initialVelocityY={10}
      colors={["#FFD700", "#FFA500", "#FF4500", "#7CFC00", "#00FFFF", "#FF00FF"]}
    />
  );
};
