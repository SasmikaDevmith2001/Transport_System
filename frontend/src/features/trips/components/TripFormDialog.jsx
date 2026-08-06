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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useCustomersList } from '../../customers/hooks/useCustomers';

const stopSchema = Joi.object({
  locationName: Joi.string().trim().min(1).max(255).required(),
  contactName: Joi.string().trim().allow('').max(100),
  contactPhone: Joi.string().trim().allow('').max(20),
});

const tripSchema = Joi.object({
  customerId: Joi.number().integer().positive().required().messages({ 'any.required': 'Customer is required' }),
  origin: Joi.string().trim().min(1).max(255).required(),
  destination: Joi.string().trim().min(1).max(255).required(),
  scheduledDate: Joi.string().required().messages({ 'string.empty': 'Scheduled date is required' }),
  scheduledTime: Joi.string().trim().allow(''),
  cargoDescription: Joi.string().trim().allow('').max(255),
  remarks: Joi.string().trim().allow('').max(2000),
  stops: Joi.array().items(stopSchema),
});

const DEFAULTS = {
  customerId: '',
  origin: '',
  destination: '',
  scheduledDate: '',
  scheduledTime: '',
  cargoDescription: '',
  remarks: '',
  stops: [],
};

export default function TripFormDialog({ open, trip = null, submitting = false, onSubmit, onClose }) {
  const isEdit = !!trip;
  const { data: customersData } = useCustomersList({ page: 1, pageSize: 100, status: 'active' });
  const customers = customersData?.data || [];

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
              destination: trip.destination,
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 3, pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {isEdit ? `Edit Trip ${trip?.tripNumber}` : 'New Trip'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEdit ? 'Update trip details below' : 'Fill in the details to create a new trip'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mx: 3, mt: 1 }} />

      <DialogContent sx={{ px: 3, py: 3 }}>
        {/* Section: Basic Info */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
          Trip Information
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={12}>
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Customer" fullWidth error={!!errors.customerId} helperText={errors.customerId?.message}>
                  {customers.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.companyName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="origin"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Origin" fullWidth error={!!errors.origin} helperText={errors.origin?.message} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="destination"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Destination" fullWidth error={!!errors.destination} helperText={errors.destination?.message} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="scheduledDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Scheduled Date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.scheduledDate}
                  helperText={errors.scheduledDate?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="scheduledTime"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="time" label="Scheduled Time" fullWidth InputLabelProps={{ shrink: true }} />
              )}
            />
          </Grid>
          <Grid size={12}>
            <Controller
              name="cargoDescription"
              control={control}
              render={({ field }) => <TextField {...field} label="Cargo Description" fullWidth />}
            />
          </Grid>
        </Grid>

        {/* Section: Delivery Stops */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
            Delivery Stops
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => append({ locationName: '', contactName: '', contactPhone: '' })}>
            Add Stop
          </Button>
        </Box>

        <Stack spacing={2}>
          {fields.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  Stop #{index + 1}
                </Typography>
                <IconButton size="small" onClick={() => remove(index)} color="error">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name={`stops.${index}.locationName`}
                    control={control}
                    render={({ field }) => <TextField {...field} label="Location" fullWidth />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name={`stops.${index}.contactName`}
                    control={control}
                    render={({ field }) => <TextField {...field} label="Contact Name" fullWidth />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name={`stops.${index}.contactPhone`}
                    control={control}
                    render={({ field }) => <TextField {...field} label="Contact Phone" fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
          {fields.length === 0 && (
            <Box sx={{ py: 3, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                No stops added. The trip will go directly from origin to destination.
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Section: Additional */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
          Additional Details
        </Typography>
        <Controller
          name="remarks"
          control={control}
          render={({ field }) => <TextField {...field} label="Remarks" fullWidth multiline minRows={3} />}
        />
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Update Trip' : 'Create Trip'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
