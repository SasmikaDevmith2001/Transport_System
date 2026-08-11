/**
 * Get the current GPS position from the browser's Geolocation API.
 * Returns { latitude, longitude } or null if unavailable/denied.
 */
export function getCurrentPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        // Permission denied or error — resolve null instead of rejecting
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Calculate straight-line distance in km between two GPS points (Haversine formula).
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Get real driving distance in km between two points using OSRM (free, no API key).
 * Falls back to Haversine if the request fails.
 */
export async function getDrivingDistanceKm(lat1, lon1, lat2, lon2) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === 'Ok' && data.routes?.length > 0) {
      // OSRM returns distance in meters
      return Math.round((data.routes[0].distance / 1000) * 100) / 100;
    }
  } catch {
    // fallback to straight line
  }
  return calculateDistanceKm(lat1, lon1, lat2, lon2);
}

/**
 * Reverse geocode coordinates to a place name using Nominatim (free, no API key).
 * Returns a location string or null.
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    });
    const data = await response.json();
    if (data?.display_name) {
      // Return a shorter version — suburb/town + district
      const addr = data.address || {};
      const parts = [
        addr.suburb || addr.village || addr.town || addr.city_district,
        addr.city || addr.county || addr.state_district,
        addr.state,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : data.display_name.split(',').slice(0, 3).join(',');
    }
  } catch {
    // silently fail
  }
  return null;
}
