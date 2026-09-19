import { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api';
import { Box, TextField, InputAdornment, IconButton, Stack } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES, SRI_LANKA_CENTER, SRI_LANKA_BOUNDS } from '../../../config/googleMaps';

const mapContainerStyle = { width: '100%', height: '100%' };

const mapOptions = {
  restriction: {
    latLngBounds: SRI_LANKA_BOUNDS,
    strictBounds: true,
  },
  minZoom: 7,
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

export default function MapPicker({ latitude, longitude, onChange, height = 350 }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const searchBoxRef = useRef(null);
  const mapRef = useRef(null);

  const position = latitude && longitude ? { lat: Number(latitude), lng: Number(longitude) } : null;
  const center = position || SRI_LANKA_CENTER;
  const zoom = position ? 15 : 8;

  const handleMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    onChange({ latitude: lat, longitude: lng });
  }, [onChange]);

  const handlePlacesChanged = () => {
    const places = searchBoxRef.current?.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onChange({ latitude: lat, longitude: lng });
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(15);
        }
      }
    }
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onChange({ latitude: lat, longitude: lng });
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(15);
        }
      },
      () => {}
    );
  };

  if (!isLoaded) {
    return <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map...</Box>;
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <StandaloneSearchBox
            onLoad={(ref) => { searchBoxRef.current = ref; }}
            onPlacesChanged={handlePlacesChanged}
            bounds={SRI_LANKA_BOUNDS}
          >
            <TextField
              placeholder="Search location (e.g., FAB Ceylon, Katunayake)"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </StandaloneSearchBox>
        </Box>
        <IconButton onClick={handleMyLocation} title="Use my location" color="primary">
          <MyLocationIcon />
        </IconButton>
      </Stack>

      <Box sx={{ height, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          options={mapOptions}
          onClick={handleMapClick}
          onLoad={(map) => { mapRef.current = map; }}
        >
          {position && <Marker position={position} />}
        </GoogleMap>
      </Box>
    </Box>
  );
}
