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
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Box,
  Divider,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';

const contactPersonSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({ 'string.empty': 'Name is required' }),
  phone: Joi.string().trim().allow('').max(20),
  email: Joi.string().email({ tlds: false }).allow(''),
});

const customerSchema = Joi.object({
  companyName: Joi.string().trim().min(1).max(150).required(),
  email: Joi.string().email({ tlds: false }).allow(''),
  phone: Joi.string().trim().min(7).max(20).required(),
  addressLine1: Joi.string().trim().allow('').max(255),
  city: Joi.string().trim().allow('').max(100),
  country: Joi.string().trim().max(100).default('Sri Lanka'),
  status: Joi.string().valid('active', 'inactive').required(),
  notes: Joi.string().trim().allow('').max(2000),
  contactPersons: Joi.array().items(contactPersonSchema).max(3),
});

const DEFAULTS = {
  companyName: '',
  email: '',
  phone: '',
  addressLine1: '',
  city: '',
  country: 'Sri Lanka',
  status: 'active',
  notes: '',
  contactPersons: [],
};

export default function CustomerFormDialog({ open, customer = null, submitting = false, onSubmit, onClose }) {
  const isEdit = !!customer;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: joiResolver(customerSchema), defaultValues: DEFAULTS });

  const { fields, append, remove } = useFieldArray({ control, name: 'contactPersons' });

  useEffect(() => {
    if (open) {
      reset(customer ? { ...DEFAULTS, ...customer, contactPersons: customer.contactPersons || [] } : DEFAULTS);
    }
  }, [open, customer, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 3, pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {isEdit ? 'Edit Customer' : 'New Customer'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEdit ? 'Update customer information below' : 'Fill in the details to add a new customer'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mx: 3, mt: 1 }} />

      <DialogContent sx={{ px: 3, py: 3 }}>
        {/* Section: Company Details */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
          Company Details
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="companyName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Company Name" fullWidth error={!!errors.companyName} helperText={errors.companyName?.message} />
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
                </TextField>
              )}
            />
          </Grid>
        </Grid>

        {/* Section: Contact Persons */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
            Contact Persons (max 3)
          </Typography>
          {fields.length < 3 && (
            <Button size="small" startIcon={<AddIcon />} onClick={() => append({ name: '', phone: '', email: '' })}>
              Add Contact
            </Button>
          )}
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
                  Contact #{index + 1}
                </Typography>
                <IconButton size="small" onClick={() => remove(index)} color="error">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name={`contactPersons.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Name"
                        fullWidth
                        error={!!errors.contactPersons?.[index]?.name}
                        helperText={errors.contactPersons?.[index]?.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name={`contactPersons.${index}.phone`}
                    control={control}
                    render={({ field }) => <TextField {...field} label="Phone" fullWidth />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name={`contactPersons.${index}.email`}
                    control={control}
                    render={({ field }) => <TextField {...field} label="Email" fullWidth />}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
          {fields.length === 0 && (
            <Box sx={{ py: 3, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                No contact persons added yet. Click "+ Add Contact" to add up to 3.
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Section: Address */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
          Address
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="addressLine1"
              control={control}
              render={({ field }) => <TextField {...field} label="Address" fullWidth />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="city" control={control} render={({ field }) => <TextField {...field} label="City" fullWidth />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="country" control={control} render={({ field }) => <TextField {...field} label="Country" fullWidth />} />
          </Grid>
        </Grid>

        {/* Section: Notes */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
          Additional Notes
        </Typography>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => <TextField {...field} label="Notes" fullWidth multiline minRows={3} />}
        />
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
