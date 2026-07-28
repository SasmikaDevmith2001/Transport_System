import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Alert, Stack } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Enter a valid email address',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await login(values);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper elevation={2} sx={{ p: 4, width: 380 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Anuradha Transport
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to the Transport Management System
          </Typography>
        </Stack>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
