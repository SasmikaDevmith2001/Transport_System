import { useEffect, useState, lazy, Suspense } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  IconButton,
  Box,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DialogHeader from '../../../components/feedback/DialogHeader';

const MapPicker = lazy(() => import('./MapPicker'));

const locationSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required().messages({ 'string.empty': 'Location name is required' }),
  latitude: Joi.number().min(-90).max(90).required().messages({ 'any.required': 'Pick a location on the map', 'number.base': 'Pick a location on the map' }),
  longitude: Joi.number().min(-180).max(180).required().messages({ 'any.required': 'Pick a location on the map', 'number.base': 'Pick a location on the map' }),
});

const DEFAULTS = {
  name: '',
  latitude: '',
  longitude: '',
};

export default function LocationFormDialog({ open, location = null, submitting = false, onSubmit, onClose }) {
  const isEdit = !!location;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: joiResolver(locationSchema), defaultValues: DEFAULTS });

  const latitude = watch('latitude');
  const longitude = watch('longitude');

  useEffect(() => {
    if (open) {
      if (location) {
        reset({
          name: location.name || '',
          latitude: location.latitude,
          longitude: location.longitude,
        });
      } else {
        reset(DEFAULTS);
      }
    }
  }, [open, location, reset]);

  const handleMapChange = ({ latitude: lat, longitude: lng }) => {
    setValue('latitude', lat, { shouldValidate: true });
    setValue('longitude', lng, { shouldValidate: true });
  };

  const handleFormSubmit = (values) => {
    const payload = {
      name: values.name,
      latitude: values.latitude,
      longitude: values.longitude,
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogHeader
        icon={<LocationOnIcon />}
        title={isEdit ? 'Edit Location' : 'New Location'}
        subtitle={isEdit ? 'Update location details' : 'Click on the map or search to set the location'}
        onClose={onClose}
      />

      <DialogContent sx={{ px: 3, py: 3, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
        {/* Map */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
            📍 Pick Location on Map
          </Typography>
          <Suspense fallback={<Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>}>
            <MapPicker latitude={latitude} longitude={longitude} onChange={handleMapChange} />
          </Suspense>
          {(errors.latitude || errors.longitude) && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {errors.latitude?.message || errors.longitude?.message}
            </Typography>
          )}
        </Paper>

        {/* Details */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <LocationOnIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
              Location Details
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Location Name" fullWidth size="small" error={!!errors.name} helperText={errors.name?.message} placeholder="e.g., Katunayake Warehouse" />
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={submitting} variant="outlined" fullWidth={isMobile}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit, (errs) => console.error('Form validation errors:', errs))}
          variant="contained"
          disabled={submitting}
          fullWidth={isMobile}
        >
          {submitting ? 'Saving...' : isEdit ? 'Update Location' : 'Create Location'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
