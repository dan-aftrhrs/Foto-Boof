import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Printer, RotateCcw, Image as ImageIcon, Settings, Camera as CameraIcon, X, Type } from 'lucide-react';
import { useMediaDevices } from './hooks/useMediaDevices';
import { Button } from './components/Button';
import { CameraView } from './components/CameraView';
import { PhotoStrip } from './components/PhotoStrip';
import { AppMode, PhotoData } from './types';

// Constants
const COUNTDOWN_SECONDS = 3;
const FLASH_DURATION_MS = 150;
const IS_MIRRORED = true; // Centralized mirror config

export default function App() {
  // --- State ---
  const [mode, setMode] = useState<AppMode>(AppMode.IDLE);
  const [photosToTake, setPhotosToTake] = useState<number>(3);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [sessionDate, setSessionDate] = useState<Date>(new Date());
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [stripSettings, setStripSettings] = useState({
    title: 'PHOTO BOOTH',
    footer: '#SnapPrintMemories'
  });
  
  // --- Hooks ---
  const { devices, activeDeviceId, setActiveDeviceId, stream, error } = useMediaDevices();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));

  // --- Actions ---

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !stream) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Ensure video has data
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    // Capture Full Frame (No cropping)
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If mirrored, flip the context horizontally before drawing
      if (IS_MIRRORED) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      ctx.drawImage(video, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const newPhoto: PhotoData = {
        id: crypto.randomUUID(),
        dataUrl,
        timestamp: Date.now()
      };
      
      setPhotos(prev => [...prev, newPhoto]);
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), FLASH_DURATION_MS);
    }
  }, [stream]);

  const startSession = () => {
    setPhotos([]);
    setSessionDate(new Date());
    setMode(AppMode.COUNTDOWN);
    setCountdown(COUNTDOWN_SECONDS);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetSession = () => {
    setPhotos([]);
    setMode(AppMode.IDLE);
    setCountdown(null);
  };

  // Main Session Loop
  useEffect(() => {
    if (mode === AppMode.COUNTDOWN) {
      // Initialize countdown if null
      if (countdown === null) {
        setCountdown(COUNTDOWN_SECONDS);
        return;
      }

      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => clearTimeout(timer);
      }

      if (countdown === 0) {
        // Time to capture
        setMode(AppMode.CAPTURING);
      }
    } else if (mode === AppMode.CAPTURING) {
      // Execute capture immediately when entering CAPTURING mode
      capturePhoto();
      
      // Schedule next step
      const delay = setTimeout(() => {
        setPhotos(currentPhotos => {
          if (currentPhotos.length < photosToTake) {
            setMode(AppMode.COUNTDOWN); 
            setCountdown(COUNTDOWN_SECONDS);
          } else {
            setMode(AppMode.REVIEW);
          }
          return currentPhotos;
        });
      }, 1000); // 1 second delay to review the shot briefly
      
      return () => clearTimeout(delay);
    }
  }, [mode, countdown, photosToTake, capturePhoto]);


  // --- Render Helpers ---

  const renderSettingsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Booth Settings
          </h2>
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Camera Selection */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-zinc-400">
            <CameraIcon className="w-4 h-4 mr-2" />
            Camera Source
          </label>
          <select 
            value={activeDeviceId} 
            onChange={(e) => setActiveDeviceId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
          >
            {devices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </div>

        {/* Text Customization */}
        <div className="space-y-4 pt-2">
          <label className="flex items-center text-sm font-medium text-zinc-400">
            <Type className="w-4 h-4 mr-2" />
            Strip Customization
          </label>
          
          <div className="space-y-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Header Title</span>
            <input
              type="text"
              value={stripSettings.title}
              onChange={(e) => setStripSettings(s => ({ ...s, title: e.target.value.toUpperCase() }))}
              placeholder="PHOTO BOOTH"
              className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Footer Caption</span>
            <input
              type="text"
              value={stripSettings.footer}
              onChange={(e) => setStripSettings(s => ({ ...s, footer: e.target.value }))}
              placeholder="#SnapPrintMemories"
              className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={() => setIsSettingsOpen(false)} className="w-full">
            Save & Close
          </Button>
        </div>
      </div>
    </div>
  );

  const renderIdleControls = () => (
    <div className="flex flex-col space-y-6 w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      <div className="bg-zinc-900/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 space-y-6 shadow-xl">
        {/* Photo Count */}
        <div className="space-y-2">
           <label className="flex items-center text-sm font-medium text-zinc-400">
            <ImageIcon className="w-4 h-4 mr-2" />
            Number of Photos
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => setPhotosToTake(num)}
                className={`p-3 rounded-lg font-bold text-lg transition-all ${
                  photosToTake === num 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={startSession} 
          size="lg" 
          className="w-full text-lg font-bold py-4 tracking-wide shadow-indigo-900/20"
        >
          START BOOTH
        </Button>
      </div>

      <div className="text-center text-xs text-zinc-500 font-mono">
        {error ? <span className="text-red-500">{error}</span> : "Ready to snap"}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex flex-col md:flex-row print:bg-white print:block overflow-hidden">
      
      {/* Settings Modal */}
      {isSettingsOpen && renderSettingsModal()}

      {/* LEFT SIDE: Viewport / Strip */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 relative overflow-y-auto print:p-0 print:block no-scrollbar">
        
        {/* Decorative background elements (hidden in print) */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none print:hidden fixed">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
        </div>

        {mode === AppMode.REVIEW ? (
          <div className="animate-in zoom-in-95 duration-500 w-full flex justify-center print:w-full print:block pb-20 md:pb-0">
             {/* The Photo Strip */}
             <PhotoStrip 
                photos={photos} 
                date={sessionDate} 
                title={stripSettings.title}
                footer={stripSettings.footer}
             />
          </div>
        ) : (
          /* Camera Component - Self Sizing */
          <div className="w-full h-full flex items-center justify-center">
             <CameraView 
                ref={videoRef}
                stream={stream}
                isMirrored={IS_MIRRORED}
                countdown={countdown}
                flashActive={flashActive}
                // No explicit dimensions needed here, intrinsic video size takes over
             >
                {/* Status Badge */}
                {mode === AppMode.COUNTDOWN && (
                  <div className="absolute top-4 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-top-2 z-30">
                    <div className="bg-red-500/90 backdrop-blur text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg animate-pulse">
                      Get Ready
                    </div>
                  </div>
                )}
                
                {/* Photo Counter */}
                {mode !== AppMode.IDLE && (
                   <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-sm font-mono border border-white/10 z-30">
                     {photos.length} / {photosToTake}
                   </div>
                )}
             </CameraView>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: Controls (Hidden on Print) */}
      <div className="w-full md:w-[400px] flex flex-col border-t md:border-t-0 md:border-l border-zinc-800/50 bg-black/40 backdrop-blur-xl p-6 md:p-8 print:hidden z-20 shrink-0">
        
        <header className="mb-8 md:mb-12 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SnapPrint</h1>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSettingsOpen(true)}
            disabled={mode === AppMode.COUNTDOWN || mode === AppMode.CAPTURING}
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </Button>
        </header>

        <div className="flex-grow flex items-center justify-center">
          {mode === AppMode.IDLE && renderIdleControls()}
          
          {(mode === AppMode.COUNTDOWN || mode === AppMode.CAPTURING) && (
             <div className="text-center space-y-4 animate-pulse">
               <h3 className="text-3xl font-light text-zinc-300">
                 {mode === AppMode.CAPTURING ? 'Say Cheese!' : 'Get Ready...'}
               </h3>
               <p className="text-zinc-500">
                 {mode === AppMode.CAPTURING ? 'Capturing moment...' : 'Pose for the camera!'}
               </p>
             </div>
          )}

          {mode === AppMode.REVIEW && (
            <div className="space-y-4 w-full animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center mb-8">
                 <h3 className="text-2xl font-bold mb-2">Great Shots!</h3>
                 <p className="text-zinc-400 text-sm">Your photos are ready to print.</p>
              </div>

              <Button onClick={handlePrint} size="lg" className="w-full flex items-center justify-center space-x-2">
                <Printer className="w-5 h-5" />
                <span>Print Photo Strip</span>
              </Button>
              
              <Button onClick={resetSession} variant="secondary" size="lg" className="w-full flex items-center justify-center space-x-2">
                <RotateCcw className="w-5 h-5" />
                <span>New Session</span>
              </Button>
            </div>
          )}
        </div>

        <footer className="mt-8 md:mt-12 text-center text-xs text-zinc-600 font-mono hidden md:block">
           v1.2.0 &bull; Custom Settings
        </footer>

      </div>
    </div>
  );
}