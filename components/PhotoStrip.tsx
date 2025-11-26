import React from 'react';
import { PhotoData } from '../types';

interface PhotoStripProps {
  photos: PhotoData[];
  date: Date;
  layout?: 'strip' | 'grid'; // Future extension
  title?: string;
  footer?: string;
}

export const PhotoStrip: React.FC<PhotoStripProps> = ({ 
  photos, 
  date,
  title = "PHOTO BOOTH",
  footer = "#SnapPrintMemories"
}) => {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div 
      id="printable-strip"
      className="bg-white text-zinc-900 p-8 shadow-2xl mx-auto max-w-md print:max-w-none print:shadow-none print:w-[300px] print:mx-auto transition-transform"
      style={{ minHeight: '800px' }}
    >
      <div className="flex flex-col h-full items-center space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-black tracking-tighter uppercase font-mono border-b-4 border-black pb-2 inline-block break-words max-w-full">
            {title}
          </h2>
        </div>

        {/* Photos */}
        <div className="flex-grow flex flex-col space-y-4 w-full">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="w-full overflow-hidden border-4 border-black bg-zinc-100 relative group"
            >
              <img 
                src={photo.dataUrl} 
                alt="Captured moment" 
                className="w-full h-auto block" 
              />
              {/* Subtle inner shadow for depth without altering image data */}
              <div className="absolute inset-0 ring-1 ring-black/5 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"></div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pt-8 font-mono text-sm opacity-60 w-full border-t-2 border-dashed border-zinc-300 mt-4">
          <p className="font-bold">{formattedDate}</p>
          <p>{formattedTime}</p>
          <p className="mt-2 text-xs break-words">{footer}</p>
        </div>
      </div>
    </div>
  );
};