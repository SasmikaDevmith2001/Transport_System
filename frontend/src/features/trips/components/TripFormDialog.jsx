import { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Divider,
  Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
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

/**
 * Create/edit dialog for trips. Driver assignment is handled separately
 * via AssignDriverDialog since it has its own permission (`trips:assign`)
 * and lifecycle rules.
 */
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? `Edit Trip ${trip?.tripNumber}` : 'New Trip'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
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
          <Grid item xs={12} sm={6}>
            <Controller
              name="origin"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Origin" fullWidth error={!!errors.origin} helperText={errors.origin?.message} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="destination"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Destination" fullWidth error={!!errors.destination} helperText={errors.destination?.message} />
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
                <TextField {...field} type="time" label="Scheduled Time" fullWidth InputLabelProps={{ shrink: true }} />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="cargoDescription"
              control={control}
              render={({ field }) => <TextField {...field} label="Cargo Description" fullWidth />}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ mb: 1.5 }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">Delivery Stops (in sequence)</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={() => append({ locationName: '', contactName: '', contactPhone: '' })}>
                Add Stop
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              {fields.map((item, index) => (
                <Box
                  key={item.id}
                  sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DragIndicatorIcon fontSize="small" color="disabled" />
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 20 }}>
                      #{index + 1}
                    </Typography>
                    <Controller
                      name={`stops.${index}.locationName`}
                      control={control}
                      render={({ field }) => <TextField {...field} label="Location" size="small" fullWidth />}
                    />
                    <IconButton size="small" onClick={() => remove(index)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, pl: 4 }}>
                    <Controller
                      name={`stops.${index}.contactName`}
                      control={control}
                      render={({ field }) => <TextField {...field} label="Contact Name" size="small" fullWidth />}
                    />
                    <Controller
                      name={`stops.${index}.contactPhone`}
                      control={control}
                      render={({ field }) => <TextField {...field} label="Contact Phone" size="small" fullWidth />}
                    />
                  </Stack>
                </Box>
              ))}
              {fields.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  No stops added yet. The trip will go directly from origin to destination.
                </Typography>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => <TextField {...field} label="Remarks" fullWidth multiline minRows={2} />}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
