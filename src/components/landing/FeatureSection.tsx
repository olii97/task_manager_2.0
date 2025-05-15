import React from 'react';

interface FeatureSectionProps {
  title: string;
  description: React.ReactNode; // Allow JSX for description
  imagePlaceholder?: boolean; // New prop for image placeholder
  videoSrc?: string; // New prop for video source
  imageSrc?: string; // New prop for image source
  className?: string;
}

export function FeatureSection({ title, description, imagePlaceholder, videoSrc, imageSrc, className }: FeatureSectionProps) {
  return (
    <div className={`py-12 sm:py-16 lg:py-20 ${className || ''}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
            {title}
          </h2>
          <div className="mt-4 max-w-2xl text-lg text-slate-600 lg:mx-auto">
            {description}
          </div>
        </div>

        {videoSrc && (
          <div className="mt-10">
            <video 
              className="w-full rounded-lg shadow-lg"
              autoPlay
              muted
              loop
            >
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {imageSrc && !videoSrc && (
          <div className="mt-10">
            <img 
              src={imageSrc} 
              alt={title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        )}

        {imagePlaceholder && !videoSrc && !imageSrc && (
          <div className="mt-10">
            {/* Placeholder for a screenshot/image */}
            <div className="aspect-video bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
              <p className="text-slate-400 text-sm">Screenshot of this feature here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 