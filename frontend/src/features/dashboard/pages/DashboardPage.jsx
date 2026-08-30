import { Box, Card, CardContent, Typography, Stack, Avatar, Divider, Chip, LinearProgress } from '@mui/material';
import './DashboardPage.css';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { useAuth } from '../../../contexts/AuthContext';
import { useTripsList } from '../../trips/hooks/useTrips';
import { useCustomersList } from '../../customers/hooks/useCustomers';
import { useDriversList } from '../../drivers/hooks/useDrivers';

function StatCard({ label, value, subtitle, icon, color, loading }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 0.5 }}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {loading ? '...' : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            variant="rounded"
            sx={{
              width: 52,
              height: 52,
              flexShrink: 0,
              bgcolor: (theme) => `${theme.palette[color].main}15`,
              color: `${color}.main`,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

function QuickInfoCard({ title, items }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Stack spacing={2}>
          {items.map((item, i) => (
            <Box key={i}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {item.value}
                </Typography>
              </Box>
              {item.progress != null && (
                <LinearProgress
                  variant="determinate"
                  value={item.progress}
                  color={item.color || 'primary'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              )}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function RecentActivityCard({ trips, loading }) {
  const recentTrips = (trips || []).slice(0, 5);

  const STATUS_COLOR = {
    pending: 'warning',
    assigned: 'info',
    in_transit: 'primary',
    delivered: 'success',
    cancelled: 'error',
  };

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
          Recent Trips
        </Typography>
        {loading ? (
          <Typography variant="body2" color="text.secondary">Loading...</Typography>
        ) : recentTrips.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No trips yet</Typography>
        ) : (
          <Stack spacing={1.5} divider={<Divider />}>
            {recentTrips.map((trip) => (
              <Stack key={trip.id} direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {trip.origin} → {trip.destination}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {trip.tripNumber} • {trip.scheduledDate}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={trip.status?.replace('_', ' ')}
                  color={STATUS_COLOR[trip.status] || 'default'}
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch summary data
  const { data: tripsData, isLoading: tripsLoading } = useTripsList({ page: 1, pageSize: 5 });
  const { data: customersData, isLoading: customersLoading } = useCustomersList({ page: 1, pageSize: 1, status: 'active' });
  const { data: driversData, isLoading: driversLoading } = useDriversList({ page: 1, pageSize: 1, status: 'active' });
  const { data: pendingTripsData, isLoading: pendingLoading } = useTripsList({ page: 1, pageSize: 1, status: 'pending' });

  const totalTrips = tripsData?.meta?.total ?? 0;
  const totalCustomers = customersData?.meta?.total ?? 0;
  const totalDrivers = driversData?.meta?.total ?? 0;
  const pendingTrips = pendingTripsData?.meta?.total ?? 0;
  const trips = tripsData?.data || [];

  // Calculate trip distribution for the info card
  const assignedTrips = totalTrips > 0 ? Math.max(totalTrips - pendingTrips, 0) : 0;
  const assignedPct = totalTrips > 0 ? Math.round((assignedTrips / totalTrips) * 100) : 0;
  const pendingPct = totalTrips > 0 ? Math.round((pendingTrips / totalTrips) * 100) : 0;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700}>
          {greeting}, {user?.firstName || 'Admin'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Here's what's happening with your transport operations today.
        </Typography>
      </Box>

      {/* Stat Cards */}
      <div className="dashboard-stats-grid">
        <StatCard
          label="Total Trips"
          value={totalTrips}
          subtitle="All time"
          icon={<LocalShippingIcon />}
          color="primary"
          loading={tripsLoading}
        />
        <StatCard
          label="Active Drivers"
          value={totalDrivers}
          subtitle="Currently active"
          icon={<BadgeIcon />}
          color="success"
          loading={driversLoading}
        />
        <StatCard
          label="Active Customers"
          value={totalCustomers}
          subtitle="Registered clients"
          icon={<BusinessIcon />}
          color="info"
          loading={customersLoading}
        />
        <StatCard
          label="Pending Trips"
          value={pendingTrips}
          subtitle="Awaiting assignment"
          icon={<PendingActionsIcon />}
          color="warning"
          loading={pendingLoading}
        />
      </div>

      {/* Bottom Section: Recent Activity + Quick Info */}
      <div className="dashboard-bottom-grid">
        <RecentActivityCard trips={trips} loading={tripsLoading} />
        <QuickInfoCard
          title="Trip Overview"
          items={[
            { label: 'Assigned / In Progress', value: `${assignedTrips}`, progress: assignedPct, color: 'primary' },
            { label: 'Pending Assignment', value: `${pendingTrips}`, progress: pendingPct, color: 'warning' },
            { label: 'Total Drivers', value: `${totalDrivers}`, progress: totalDrivers > 0 ? 100 : 0, color: 'success' },
            { label: 'Total Customers', value: `${totalCustomers}`, progress: totalCustomers > 0 ? 100 : 0, color: 'info' },
          ]}
        />
      </div>
    </Box>
  );
}
