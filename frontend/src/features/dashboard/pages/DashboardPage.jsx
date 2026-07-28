import { Box, Grid, Paper, Typography } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Welcome, {user?.firstName}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Anuradha Transport - Operations Overview
      </Typography>

      <Grid container spacing={2}>
        {['Active Trips', 'Available Drivers', 'Pending Deliveries', 'Vehicles In Service'].map((label) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                --
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
