/**
 * Geolocation & Distance Utilities
 */

/**
 * Get user's current geolocation via browser API.
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
};

/**
 * Haversine distance between two coordinates (km).
 */
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Open Google Maps directions to a destination.
 */
export const openDirections = (destLat, destLng, userLat, userLng) => {
  const base = 'https://www.google.com/maps/dir/';
  const origin = userLat && userLng ? `${userLat},${userLng}` : '';
  const dest = `${destLat},${destLng}`;
  window.open(`${base}${origin}/${dest}`, '_blank');
};

/**
 * Default center for India (used when geolocation fails).
 */
export const INDIA_CENTER = { lat: 22.5937, lng: 78.9629 };
export const INDIA_ZOOM = 5;
