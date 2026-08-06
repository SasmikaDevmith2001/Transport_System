import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Box,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 3, pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {isEdit ? 'Edit Driver' : 'New Driver'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEdit ? 'Update driver information below' : 'Fill in the details to register a new driver'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mx: 3, mt: 1 }} />

      <DialogContent sx={{ px: 3, py: 3 }}>
        {/* Section: Personal Info */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
          Personal Information
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="First Name" fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Last Name" fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="nicNumber"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="NIC Number" fullWidth disabled={isEdit} error={!!errors.nicNumber} helperText={errors.nicNumber?.message} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Phone" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
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
        </Grid>

        {/* Section: License & Vehicle */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
          License & Vehicle
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="licenseNumber"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="License Number" fullWidth error={!!errors.licenseNumber} helperText={errors.licenseNumber?.message} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="vehicleNumber"
              control={control}
              render={({ field }) => <TextField {...field} label="Vehicle Number" fullWidth />}
            />
          </Grid>
        </Grid>

        {/* Section: Address & Notes */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
          Additional Details
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller name="address" control={control} render={({ field }) => <TextField {...field} label="Address" fullWidth />} />
          </Grid>
          <Grid size={12}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => <TextField {...field} label="Notes" fullWidth multiline minRows={3} />}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Update Driver' : 'Create Driver'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
