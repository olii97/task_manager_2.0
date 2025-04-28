import React, { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";

interface ConfettiEffectProps {
  isActive: boolean;
  particleCount?: number;
}

export const ConfettiEffect = ({ 
  isActive, 
  particleCount = 100 
}: ConfettiEffectProps) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      const container = containerRef.current;
      if (container) {
        setContainerSize({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };

    // Initial size
    updateSize();

    // Update size on window resize
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (!isActive) return null;

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      <ReactConfetti
        width={containerSize.width}
        height={containerSize.height}
        recycle={false}
        numberOfPieces={particleCount}
        gravity={0.3}
        initialVelocityY={20}
        confettiSource={{
          x: containerSize.width / 2,
          y: containerSize.height / 2,
          w: 0,
          h: 0
        }}
        colors={["#FFD700", "#FFA500", "#FF4500", "#7CFC00", "#00FFFF", "#FF00FF"]}
      />
    </div>
  );
};
