import { useState, useEffect, useCallback } from 'react';
import { CameraDevice } from '../types';

export const useMediaDevices = () => {
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getDevices = useCallback(async () => {
    try {
      // Must request permission first to get labels
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 4)}`
        }));
      
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !activeDeviceId) {
        setActiveDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      setError('Permission denied or no camera found.');
      console.error(err);
    }
  }, [activeDeviceId]);

  const startStream = useCallback(async (deviceId: string) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          deviceId: { exact: deviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(newStream);
      setError(null);
    } catch (err) {
      setError('Could not start video stream.');
      console.error(err);
    }
  }, [stream]);

  useEffect(() => {
    getDevices();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Init only

  useEffect(() => {
    if (activeDeviceId) {
      startStream(activeDeviceId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDeviceId]); // Re-run when ID changes

  return { devices, activeDeviceId, setActiveDeviceId, stream, error };
};
