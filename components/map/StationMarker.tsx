import { Station } from '@/lib/types';
import L from 'leaflet';

export function createStationIcon(station: Station, isSelected: boolean = false) {
  const connectors = station.connectors || [];

  // Max single-plug delivery speed (kW)
  const maxPower = connectors.length
    ? Math.max(...connectors.map((c) => c.power_kw))
    : 0;

  // Total hub combined power (kW)
  const totalPower = connectors.reduce(
    (acc, c) => acc + (c.power_kw * (c.quantity || 1)),
    0
  );

  // Total sockets / plugs count
  const totalPlugs = connectors.reduce((acc, c) => acc + (c.quantity || 1), 0);

  let bgColor = '#059669'; // Emerald (Active)
  let ringColor = 'rgba(5, 150, 105, 0.3)';

  if (station.status === 'MAINTENANCE') {
    bgColor = '#d97706'; // Amber
    ringColor = 'rgba(217, 119, 6, 0.3)';
  } else if (station.status === 'OFFLINE') {
    bgColor = '#dc2626'; // Red
    ringColor = 'rgba(220, 38, 38, 0.3)';
  } else if (maxPower >= 120) {
    bgColor = '#047857'; // Ultra-fast dark emerald
    ringColor = 'rgba(4, 120, 87, 0.35)';
  }

  if (isSelected) {
    bgColor = '#0284c7'; // Electric blue when selected
    ringColor = 'rgba(2, 132, 199, 0.45)';
  }

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; user-select: none;">
      <div style="
        display: flex;
        align-items: center;
        gap: 4px;
        background: ${bgColor};
        color: white;
        padding: 4px 8px;
        border-radius: 9999px;
        box-shadow: 0 4px 12px ${ringColor}, 0 2px 4px rgba(0,0,0,0.18);
        border: 2px solid #ffffff;
        font-weight: 800;
        font-size: 11px;
        letter-spacing: -0.01em;
        white-space: nowrap;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        <span>${maxPower > 0 ? `${maxPower} kW` : 'EV'}</span>
        <span style="
          opacity: 0.9;
          font-weight: 600;
          font-size: 10px;
          background: rgba(255,255,255,0.22);
          padding: 1px 4px;
          border-radius: 6px;
          margin-left: 1px;
        ">${totalPlugs} ${totalPlugs === 1 ? 'plug' : 'plugs'}</span>
      </div>
      <div style="
        width: 0; 
        height: 0; 
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid ${bgColor};
        margin-top: -1px;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: `custom-leaflet-marker ${isSelected ? 'selected' : ''}`,
    iconSize: [110, 32],
    iconAnchor: [55, 32],
  });
}
