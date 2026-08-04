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

const customerSchema = Joi.object({
  companyName: Joi.string().trim().min(1).max(150).required(),
  contactPerson: Joi.string().trim().allow('').max(100),
  email: Joi.string().email({ tlds: false }).allow(''),
  phone: Joi.string().trim().min(7).max(20).required(),
  addressLine1: Joi.string().trim().allow('').max(255),
  city: Joi.string().trim().allow('').max(100),
  country: Joi.string().trim().max(100).default('Sri Lanka'),
  status: Joi.string().valid('active', 'inactive').required(),
  notes: Joi.string().trim().allow('').max(2000),
});

const DEFAULTS = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  addressLine1: '',
  city: '',
  country: 'Sri Lanka',
  status: 'active',
  notes: '',
};

export default function CustomerFormDialog({ open, customer = null, submitting = false, onSubmit, onClose }) {
  const isEdit = !!customer;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: joiResolver(customerSchema), defaultValues: DEFAULTS });

  useEffect(() => {
    if (open) {
      reset(customer ? { ...DEFAULTS, ...customer } : DEFAULTS);
    }
  }, [open, customer, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Customer' : 'New Customer'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Controller
              name="companyName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Company Name" fullWidth error={!!errors.companyName} helperText={errors.companyName?.message} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="contactPerson"
              control={control}
              render={({ field }) => <TextField {...field} label="Contact Person" fullWidth />}
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
              name="email"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
              )}
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
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Controller
              name="addressLine1"
              control={control}
              render={({ field }) => <TextField {...field} label="Address" fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller name="city" control={control} render={({ field }) => <TextField {...field} label="City" fullWidth />} />
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
