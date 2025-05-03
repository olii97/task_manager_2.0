import React, { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";

interface ConfettiEffectProps {
  isActive: boolean;
  particleCount?: number;
  sourcePosition?: {
    x: number;
    y: number;
    width: number;
  };
}

export const ConfettiEffect = ({ 
  isActive, 
  particleCount = 200,
  sourcePosition
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

  // Choose appropriate source position
  let sourceX = containerSize.width / 2; // Default to center
  let sourceY = 0; // Default to top
  let sourceWidth = containerSize.width * 0.5; // Default width

  // If custom source position is provided and valid
  if (sourcePosition && sourcePosition.x && sourcePosition.y) {
    sourceX = sourcePosition.x;
    sourceY = sourcePosition.y;
    
    // Use custom width if provided, otherwise use default
    if (sourcePosition.width) {
      sourceWidth = sourcePosition.width;
    }
  }

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
        gravity={0.15}
        initialVelocityY={-15} // Upward initial movement, but gentler
        confettiSource={{
          x: sourceX,
          y: sourceY,
          w: sourceWidth,
          h: 0
        }}
        colors={[
          "#FFD700", "#FFA500", "#FF4500", 
          "#7CFC00", "#00FFFF", "#FF00FF",
          "#FF0000", "#00FF00", "#0000FF",
          "#FFFF00", "#00FFFF", "#FF00FF"
        ]}
      />
    </div>
  );
};
