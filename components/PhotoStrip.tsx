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
      className="bg-white text-zinc-900 p-8 pb-16 shadow-2xl mx-auto max-w-md print:max-w-none print:shadow-none print:w-[300px] print:mx-auto transition-transform"
      style={{ minHeight: '800px' }}
    >
      <div className="flex flex-col h-full items-center space-y-8">
        {/* Header */}
        <div className="text-center w-full">
          <h2 className="text-3xl font-serif font-normal tracking-[0.2em] uppercase border-b border-black pb-4 inline-block break-words max-w-full">
            {title}
          </h2>
        </div>

        {/* Photos */}
        <div className="flex-grow flex flex-col space-y-4 w-full">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="w-full overflow-hidden bg-zinc-50 relative group shadow-sm"
            >
              <img 
                src={photo.dataUrl} 
                alt="Captured moment" 
                className="w-full h-auto block" 
              />
              {/* Removed the heavy inner shadow/ring for a cleaner print look */}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pt-8 w-full border-t border-zinc-200 mt-6 pb-2">
          <div className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-500 mb-2">
            {formattedDate} &bull; {formattedTime}
          </div>
          <p className="font-serif italic text-lg tracking-wide text-zinc-800 break-words">
            {footer}
          </p>
        </div>
      </div>
    </div>
  );
};