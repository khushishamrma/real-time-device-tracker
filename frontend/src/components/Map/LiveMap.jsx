import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useDeviceStore } from '../../store/device.store';

const buildIcon = (device) => {
  const isOnline = device.status === 'online';
  const color = device.color || '#22d3ee';
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:36px;height:36px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        ${isOnline ? `
          <div style="position:absolute;inset:-4px;border-radius:50%;background:${color};opacity:0.15;animation:markerPulse 2s ease-in-out infinite;"></div>
          <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.1;animation:markerPulse 2s ease-in-out infinite 0.5s;"></div>
        ` : ''}
        <div style="position:absolute;inset:6px;border-radius:50%;background:${isOnline ? color : '#475569'};border:2.5px solid ${isOnline ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.15)'};box-shadow:0 0 ${isOnline ? '12' : '0'}px ${color}40;"></div>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const FlyTo = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 13, { duration: 1.5 });
  }, [lat, lng]);
  return null;
};

export default function LiveMap({ geofences = [], selectedDevice }) {
  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      className="h-full w-full"
      style={{ background: '#050812' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />

      {selectedDevice?.lastLocation && (
        <FlyTo lat={selectedDevice.lastLocation.lat} lng={selectedDevice.lastLocation.lng} />
      )}

      {geofences.map((fence) => fence.center && (
        <Circle
          key={fence._id}
          center={[fence.center.lat, fence.center.lng]}
          radius={fence.radius}
          pathOptions={{
            color: fence.color || '#8b5cf6',
            fillColor: fence.color || '#8b5cf6',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '6 4',
          }}
        />
      ))}

      <DeviceMarkers selectedId={selectedDevice?._id} />
    </MapContainer>
  );
}

function DeviceMarkers({ selectedId }) {
  const devices = useDeviceStore((s) => s.devices);
  return (
    <>
      {devices.filter((d) => d.lastLocation).map((device) => {
        const isOnline = device.status === 'online';
        const color = device.color || '#22d3ee';
        return (
          <Marker
            key={device._id}
            position={[device.lastLocation.lat, device.lastLocation.lng]}
            icon={buildIcon(device)}
            zIndexOffset={device._id === selectedId ? 1000 : 0}
          >
            <Popup className="trackr-popup">
              <div style={{
                minWidth: 200, fontFamily: "'DM Sans', sans-serif",
                background: 'linear-gradient(135deg, #0a0f1e 0%, #0f1629 100%)',
                color: '#e2e8f0', padding: '14px', borderRadius: '12px',
                border: `1px solid ${color}25`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 ${color}15`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '10px',
                    background: `${color}15`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: isOnline ? color : '#475569',
                      boxShadow: isOnline ? `0 0 8px ${color}` : 'none',
                    }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{device.name}</p>
                    <p style={{
                      fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                      color: isOnline ? '#34d399' : '#94a3b8', margin: 0, marginTop: '1px',
                    }}>
                      {isOnline ? '● LIVE' : '○ OFFLINE'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {[
                    { label: 'Lat', value: device.lastLocation.lat.toFixed(5) },
                    { label: 'Lng', value: device.lastLocation.lng.toFixed(5) },
                    { label: 'Speed', value: `${((device.speed || 0) * 3.6).toFixed(1)} km/h` },
                    { label: 'Model', value: device.model || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      background: '#161e3580', borderRadius: '8px', padding: '6px 8px',
                    }}>
                      <p style={{ fontSize: 9, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</p>
                      <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#e2e8f0', margin: 0, marginTop: '2px' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
