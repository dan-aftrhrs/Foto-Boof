export enum AppMode {
  IDLE = 'IDLE',
  COUNTDOWN = 'COUNTDOWN',
  CAPTURING = 'CAPTURING',
  REVIEW = 'REVIEW',
}

export interface PhotoData {
  id: string;
  dataUrl: string;
  timestamp: number;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
}
