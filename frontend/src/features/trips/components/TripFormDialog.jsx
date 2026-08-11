import { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Box,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RouteIcon from '@mui/icons-material/Route';
import NotesIcon from '@mui/icons-material/Notes';
import { useCustomersList } from '../../customers/hooks/useCustomers';

const stopSchema = Joi.object({
  locationName: Joi.string().trim().min(1).max(255).required().messages({ 'string.empty': 'Location is required' }),
  contactName: Joi.string().trim().allow('').max(100),
  contactPhone: Joi.string().trim().allow('').max(20),
});

const tripSchema = Joi.object({
  customerId: Joi.number().integer().positive().required().messages({ 'any.required': 'Customer is required' }),
  origin: Joi.string().trim().min(1).max(255).required(),
  scheduledDate: Joi.string().required().messages({ 'string.empty': 'Scheduled date is required' }),
  scheduledTime: Joi.string().trim().allow(''),
  cargoDescription: Joi.string().trim().allow('').max(255),
  remarks: Joi.string().trim().allow('').max(2000),
  stops: Joi.array().items(stopSchema).min(1).required().messages({ 'array.min': 'Add at least one destination location' }),
});

const DEFAULTS = {
  customerId: '',
  origin: '',
  scheduledDate: '',
  scheduledTime: '',
  cargoDescription: '',
  remarks: '',
  stops: [{ locationName: '', contactName: '', contactPhone: '' }],
};

export default function TripFormDialog({ open, trip = null, submitting = false, onSubmit, onClose }) {
  const isEdit = !!trip;
  const { data: customersData } = useCustomersList({ page: 1, pageSize: 100, status: 'active' });
  const customers = customersData?.data || [];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: joiResolver(tripSchema), defaultValues: DEFAULTS });

  const { fields, append, remove } = useFieldArray({ control, name: 'stops' });

  useEffect(() => {
    if (open) {
      reset(
        trip
          ? {
              customerId: trip.customerId,
              origin: trip.origin,
              scheduledDate: trip.scheduledDate,
              scheduledTime: trip.scheduledTime?.slice(0, 5) || '',
              cargoDescription: trip.cargoDescription || '',
              remarks: trip.remarks || '',
              stops: (trip.stops || []).map((s) => ({
                locationName: s.locationName,
                contactName: s.contactName || '',
                contactPhone: s.contactPhone || '',
              })),
            }
          : DEFAULTS
      );
    }
  }, [open, trip, reset]);

  const handleFormSubmit = (values) => {
    // The last stop's location becomes the destination for the trip record
    const lastStop = values.stops[values.stops.length - 1];
    const payload = {
      ...values,
      destination: lastStop.locationName,
    };
    onSubmit(payload);
  };

  const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 1.5,
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>
      <Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
          {title}
        </Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 3, pb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main' }}>
            {isEdit ? `Edit Trip ${trip?.tripNumber}` : 'New Trip'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {isEdit ? 'Update trip details below' : 'Fill in the details to create a new trip'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mx: 0 }} />

      <DialogContent sx={{ px: 3, py: 3, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {/* Section: Basic Trip Info */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <SectionHeader icon={LocalShippingIcon} title="Trip Information" />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Customer"
                    fullWidth
                    size="small"
                    error={!!errors.customerId}
                    helperText={errors.customerId?.message}
                  >
                    {customers.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.companyName}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="origin"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Starting Point (Origin)"
                    fullWidth
                    size="small"
                    error={!!errors.origin}
                    helperText={errors.origin?.message}
                    placeholder="Where the trip starts from"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="scheduledDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Scheduled Date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.scheduledDate}
                    helperText={errors.scheduledDate?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="scheduledTime"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="time" label="Scheduled Time" fullWidth size="small" InputLabelProps={{ shrink: true }} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="cargoDescription"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Cargo Description" fullWidth size="small" placeholder="Describe the cargo/items" />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Section: Route Locations */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: 'primary.main',
                  color: 'white',
                }}
              >
                <RouteIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                  Route Locations
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Add locations in order. The last location is the final destination.
                </Typography>
              </Box>
            </Box>
            <Button size="small" startIcon={<AddIcon />} onClick={() => append({ locationName: '', contactName: '', contactPhone: '' })}>
              Add
            </Button>
          </Box>

          {errors.stops?.message && (
            <Typography variant="caption" color="error" sx={{ mb: 1.5, display: 'block' }}>
              {errors.stops.message}
            </Typography>
          )}

          <Stack spacing={2}>
            {fields.map((item, index) => (
              <Box key={item.id} sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    {index === fields.length - 1 ? `Location #${index + 1} (Final Destination)` : `Location #${index + 1}`}
                  </Typography>
                  {fields.length > 1 && (
                    <IconButton size="small" onClick={() => remove(index)} color="error">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <Controller
                      name={`stops.${index}.locationName`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Location"
                          fullWidth
                          size="small"
                          error={!!errors.stops?.[index]?.locationName}
                          helperText={errors.stops?.[index]?.locationName?.message}
                          placeholder={index === fields.length - 1 ? 'Final destination' : 'Delivery location'}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={`stops.${index}.contactName`}
                      control={control}
                      render={({ field }) => <TextField {...field} label="Contact Name" fullWidth size="small" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={`stops.${index}.contactPhone`}
                      control={control}
                      render={({ field }) => <TextField {...field} label="Contact Phone" fullWidth size="small" />}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* Section: Additional Notes */}
        <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <SectionHeader icon={NotesIcon} title="Remarks" />
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => <TextField {...field} label="Remarks" fullWidth multiline minRows={3} size="small" />}
          />
        </Paper>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={submitting} variant="outlined" fullWidth={isMobile}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(handleFormSubmit)} variant="contained" disabled={submitting} fullWidth={isMobile}>
          {submitting ? 'Saving...' : isEdit ? 'Update Trip' : 'Create Trip'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
