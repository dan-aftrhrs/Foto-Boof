import React, { useEffect, useRef, forwardRef, ReactNode } from 'react';

interface CameraViewProps {
  stream: MediaStream | null;
  isMirrored: boolean;
  countdown: number | null;
  flashActive: boolean;
  className?: string;
  onVideoLoaded?: (width: number, height: number) => void;
  children?: ReactNode;
}

export const CameraView = forwardRef<HTMLVideoElement, CameraViewProps>(({ 
  stream, 
  isMirrored, 
  countdown, 
  flashActive,
  className = '',
  onVideoLoaded,
  children
}, ref) => {
  const internalRef = useRef<HTMLVideoElement>(null);
  
  // Combine refs
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(internalRef.current);
    } else {
      ref.current = internalRef.current;
    }
  }, [ref]);

  useEffect(() => {
    if (internalRef.current && stream) {
      internalRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative grid grid-cols-1 grid-rows-1 place-items-center w-fit mx-auto bg-black rounded-2xl overflow-hidden ring-4 ring-zinc-800 shadow-2xl ${className}`}>
      {/* Video Feed - Drives dimensions */}
      <video
        ref={internalRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={(e) => {
          if (onVideoLoaded) {
            onVideoLoaded(e.currentTarget.videoWidth, e.currentTarget.videoHeight);
          }
        }}
        // max-h-[75vh] ensures it fits on screen, w-auto keeps aspect ratio
        className={`col-start-1 row-start-1 max-h-[75vh] w-auto max-w-full object-contain ${isMirrored ? 'scale-x-[-1]' : ''}`}
      />

      {/* Overlays Wrapper - Sits on top of video */}
      <div className="col-start-1 row-start-1 w-full h-full relative z-10 pointer-events-none">
        
        {/* Pass-through children (Badges, Counters) */}
        {children}

        {/* Countdown Overlay */}
        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-20">
            <div className="text-7xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
              {countdown}
            </div>
          </div>
        )}

        {/* Flash Overlay */}
        {flashActive && (
          <div className="absolute inset-0 bg-white z-50 animate-flash" />
        )}

        {/* Guidelines (Optional Aesthetic) */}
        <div className="absolute inset-0 opacity-30 border-2 border-white/20 rounded-2xl">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20"></div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20"></div>
        </div>
      </div>
    </div>
  );
});

CameraView.displayName = 'CameraView';