import { BoundingBox } from './types';

/**
 * Calculates the great-circle distance between two points on the Earth
 * using the Haversine formula.
 * @returns Distance in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Checks if a coordinate is within a bounding box.
 */
export function isCoordinateInBounds(
  lat: number,
  lng: number,
  bounds: BoundingBox
): boolean {
  return (
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lng >= bounds.minLng &&
    lng <= bounds.maxLng
  );
}

/**
 * Creates navigation URLs for popular navigation apps.
 */
export function getNavigationUrls(lat: number, lng: number, label?: string) {
  const encodedLabel = encodeURIComponent(label || 'EV Charging Station');
  return {
    googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    appleMaps: `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodedLabel}`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  };
}

/**
 * Formats coordinates for display (e.g. 52.5200° N, 13.4050° E)
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}
