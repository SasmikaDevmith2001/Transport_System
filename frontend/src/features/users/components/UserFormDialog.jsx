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
} from '@mui/material';
import { useRoles } from '../hooks/useUsers';

const baseSchema = {
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().email({ tlds: false }).required(),
  phone: Joi.string().trim().allow('').max(20),
  roleId: Joi.number().integer().positive().required(),
  status: Joi.string().valid('active', 'inactive', 'suspended').required(),
};

const createSchema = Joi.object({
  ...baseSchema,
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .required()
    .messages({ 'string.pattern.base': 'Must include uppercase, lowercase, and a number' }),
});

const updateSchema = Joi.object(baseSchema);

/**
 * Shared create/edit dialog for the Users module. Switches validation
 * schema and default values based on whether `user` (edit) is provided.
 * Role options are fetched from the backend rather than hardcoded, so the
 * frontend never has to know role IDs in advance.
 */
export default function UserFormDialog({ open, user = null, submitting = false, onSubmit, onClose }) {
  const isEdit = !!user;
  const { data: roles = [] } = useRoles();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(isEdit ? updateSchema : createSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      roleId: '',
      status: 'active',
      password: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        user
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone || '',
              roleId: user.roleId,
              status: user.status,
            }
          : { firstName: '', lastName: '', email: '', phone: '', roleId: '', status: 'active', password: '' }
      );
    }
  }, [open, user, reset]);

  const submit = (values) => {
    if (isEdit) {
      // eslint-disable-next-line no-unused-vars
      const { password, ...rest } = values;
      onSubmit(rest);
    } else {
      onSubmit(values);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit User' : 'Create User'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="First Name" fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Last Name" fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} />
              )}
            />
          </Stack>

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Email" fullWidth disabled={isEdit} error={!!errors.email} helperText={errors.email?.message} />
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Phone" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
            )}
          />

          <Stack direction="row" spacing={2}>
            <Controller
              name="roleId"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Role" fullWidth error={!!errors.roleId} helperText={errors.roleId?.message}>
                  {roles.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Status" fullWidth error={!!errors.status} helperText={errors.status?.message}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </TextField>
              )}
            />
          </Stack>

          {!isEdit && (
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="password" label="Password" fullWidth error={!!errors.password} helperText={errors.password?.message} />
              )}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(submit)} variant="contained" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
