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
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            {isEdit ? 'Edit Driver' : 'New Driver'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {isEdit ? 'Update driver information below' : 'Fill in the details to register a new driver'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mx: 0 }} />

      <DialogContent sx={{ px: 3, py: 3, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {/* Section: Personal Info */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <SectionHeader icon={PersonIcon} title="Personal Information" />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    size="small"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    size="small"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="nicNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="NIC Number"
                    fullWidth
                    size="small"
                    disabled={isEdit}
                    error={!!errors.nicNumber}
                    helperText={errors.nicNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone"
                    fullWidth
                    size="small"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    placeholder="+94 71 234 5678"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    size="small"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    placeholder="driver@company.com"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Status" fullWidth size="small">
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="on_leave">On Leave</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Section: License & Vehicle */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <SectionHeader icon={DirectionsCarIcon} title="License & Vehicle" />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="licenseNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="License Number"
                    fullWidth
                    size="small"
                    error={!!errors.licenseNumber}
                    helperText={errors.licenseNumber?.message}
                  />
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
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.licenseExpiry}
                    helperText={errors.licenseExpiry?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="vehicleNumber"
                control={control}
                render={({ field }) => <TextField {...field} label="Vehicle Number" fullWidth size="small" placeholder="e.g., ABC-1234" />}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Section: Address & Notes */}
        <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <SectionHeader icon={LocationOnIcon} title="Address & Notes" />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => <TextField {...field} label="Address" fullWidth size="small" placeholder="Home address" />}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => <TextField {...field} label="Notes" fullWidth multiline minRows={3} size="small" />}
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
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={submitting} fullWidth={isMobile}>
          {submitting ? 'Saving...' : isEdit ? 'Update Driver' : 'Create Driver'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
