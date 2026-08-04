import { Box, Grid } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PageHeader from '../../../components/layout-elements/PageHeader';
import StatCard from '../../../components/layout-elements/StatCard';
import { useAuth } from '../../../contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Box>
      <PageHeader
        title={`Welcome, ${user?.firstName || ''}`}
        description="Anuradha Transport — operations overview"
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Active Trips" value="—" icon={<LocalShippingIcon fontSize="small" />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Available Drivers" value="—" icon={<BadgeIcon fontSize="small" />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Active Customers" value="—" icon={<BusinessIcon fontSize="small" />} color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Pending Trips" value="—" icon={<PendingActionsIcon fontSize="small" />} color="warning" />
        </Grid>
      </Grid>
    </Box>
  );
}
