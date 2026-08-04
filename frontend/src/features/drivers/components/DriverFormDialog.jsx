import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
} from '@mui/material';

const driverSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  nicNumber: Joi.string().trim().min(5).max(20).required(),
  phone: Joi.string().trim().min(7).max(20).required(),
  email: Joi.string().email({ tlds: false }).allow(''),
  licenseNumber: Joi.string().trim().min(3).max(50).required(),
  licenseExpiry: Joi.string().required().messages({ 'string.empty': 'License expiry date is required' }),
  vehicleNumber: Joi.string().trim().allow('').max(30),
  address: Joi.string().trim().allow('').max(255),
  status: Joi.string().valid('active', 'inactive', 'on_leave', 'suspended').required(),
  notes: Joi.string().trim().allow('').max(2000),
});

const DEFAULTS = {
  firstName: '',
  lastName: '',
  nicNumber: '',
  phone: '',
  email: '',
  licenseNumber: '',
  licenseExpiry: '',
  vehicleNumber: '',
  address: '',
  status: 'active',
  notes: '',
};

export default function DriverFormDialog({ open, driver = null, submitting = false, onSubmit, onClose }) {
  const isEdit = !!driver;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: joiResolver(driverSchema), defaultValues: DEFAULTS });

  useEffect(() => {
    if (open) {
      reset(driver ? { ...DEFAULTS, ...driver, licenseExpiry: driver.licenseExpiry?.slice(0, 10) || '' } : DEFAULTS);
    }
  }, [open, driver, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Driver' : 'New Driver'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="First Name" fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Last Name" fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="nicNumber"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="NIC Number" fullWidth disabled={isEdit} error={!!errors.nicNumber} helperText={errors.nicNumber?.message} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Phone" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="licenseNumber"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="License Number" fullWidth error={!!errors.licenseNumber} helperText={errors.licenseNumber?.message} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="licenseExpiry"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="License Expiry"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.licenseExpiry}
                  helperText={errors.licenseExpiry?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="vehicleNumber"
              control={control}
              render={({ field }) => <TextField {...field} label="Vehicle Number" fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Status" fullWidth>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="on_leave">On Leave</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="address" control={control} render={({ field }) => <TextField {...field} label="Address" fullWidth />} />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => <TextField {...field} label="Notes" fullWidth multiline minRows={2} />}
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
