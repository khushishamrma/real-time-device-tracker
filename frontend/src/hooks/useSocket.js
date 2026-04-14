import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useDeviceStore } from '../store/device.store';
import { useAlertStore } from '../store/alert.store';
import { useAuthStore } from '../store/auth.store';
import { useToastStore } from '../store/toast.store';

export const useSocket = () => {
  const token = useAuthStore((s) => s.token);
  const { updateDeviceLocation, setDeviceOffline, setDeviceOnline, devices } = useDeviceStore();
  const { addAlert } = useAlertStore();
  const { addToast } = useToastStore();
  const socketRef = useRef(null);
  const devicesRef = useRef(devices);
  devicesRef.current = devices;

  useEffect(() => {
    if (!token) return;
    const s = connectSocket(token);
    socketRef.current = s;

    s.on('location:update', updateDeviceLocation);

    s.on('device:offline', ({ deviceId }) => {
      setDeviceOffline(deviceId);
      const name = devicesRef.current.find((d) => d._id === deviceId)?.name || 'Device';
      addToast({ type: 'offline', title: 'Device Offline', message: `${name} went offline` });
    });

    s.on('device:online', ({ deviceId }) => {
      setDeviceOnline(deviceId);
      const name = devicesRef.current.find((d) => d._id === deviceId)?.name || 'Device';
      addToast({ type: 'online', title: 'Device Online', message: `${name} is now online and tracking` });
    });

    s.on('alert:geofence', ({ alert }) => {
      addAlert(alert);
      addToast({
        type: 'geofence',
        title: alert.type === 'enter' ? '📍 Geofence Entry' : '📍 Geofence Exit',
        message: alert.message,
        duration: 6000,
      });
    });

    return () => {
      s.off('location:update', updateDeviceLocation);
      s.off('device:offline');
      s.off('device:online');
      s.off('alert:geofence');
    };
  }, [token]);

  return socketRef;
};
