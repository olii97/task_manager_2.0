import React from 'react';
import {
  Rocket,
  Timer,
  Zap,
  Battery,
  BookOpen,
  Wrench,
  Heart,
  Users,
  Brain,
  Lightbulb,
  CheckCircle2,
  Settings2,
  Coffee,
  CalendarDays,
  Briefcase,
  Home
} from 'lucide-react';

const icons = [
  Rocket, Timer, Zap, Battery, BookOpen, Wrench, Heart, Users, Brain, Lightbulb, 
  CheckCircle2, Settings2, Coffee, CalendarDays, Briefcase, Home
];

const GRID_SIZE = 20; // Render a 20x20 grid of icons
const ICON_OPACITY = 'opacity-10'; // Tailwind class for opacity
const ICON_COLOR = 'text-slate-400'; // Tailwind class for color

export function IconBackgroundPattern() {
  const pattern = React.useMemo(() => {
    return Array.from({ length: GRID_SIZE }).map((_, rowIndex) =>
      Array.from({ length: GRID_SIZE }).map((_, colIndex) => {
        const IconComponent = icons[Math.floor(Math.random() * icons.length)];
        const uniqueKey = `icon-${rowIndex}-${colIndex}`;
        // Add slight random rotation and size variation for a more organic feel
        const randomRotation = Math.random() * 45 - 22.5; // -22.5 to 22.5 degrees
        const randomScale = Math.random() * 0.4 + 0.8; // 0.8 to 1.2 scale

        return {
          IconComponent,
          key: uniqueKey,
          style: {
            position: 'absolute',
            left: `${(colIndex / GRID_SIZE) * 100}%`,
            top: `${(rowIndex / GRID_SIZE) * 100}%`,
            transform: `translate(-50%, -50%) rotate(${randomRotation}deg) scale(${randomScale})`,
            fontSize: '24px' // Base size, scale will adjust
          } as React.CSSProperties,
        };
      })
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pattern.flat().map(({ IconComponent, key, style }) => (
        <IconComponent key={key} style={style} className={`${ICON_COLOR} ${ICON_OPACITY}`} strokeWidth={1.5} />
      ))}
    </div>
  );
} 