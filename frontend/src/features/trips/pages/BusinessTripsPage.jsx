import { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Stack,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSnackbar } from 'notistack';
import PageHeader from '../../../components/layout-elements/PageHeader';
import DataTable from '../../../components/data-table/DataTable';
import TripDetailDrawer from '../components/TripDetailDrawer';
import { useTripsList } from '../hooks/useTrips';
import { useAuth } from '../../../contexts/AuthContext';

const APPROVAL_COLORS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

export default function BusinessTripsPage() {
  const { user } = useAuth();
  const isDriver = user?.role === 'DRIVER';

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('completedAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [viewingTrip, setViewingTrip] = useState(null);

  const params = { page, pageSize, search: search || undefined, status: 'completed', sortBy, sortOrder };
  const { data, isLoading } = useTripsList(params);

  const columns = [
    {
      field: 'tripNumber',
      headerName: 'Trip #',
      sortable: true,
      render: (row) => (
        <Typography variant="body2" fontWeight={700}>{row.tripNumber}</Typography>
      ),
    },
    {
      field: 'route',
      headerName: 'Route',
      render: (row) => (
        <Box>
          <Typography variant="body2">{row.origin} → {row.destination}</Typography>
          <Typography variant="caption" color="text.secondary">{row.customer?.companyName}</Typography>
        </Box>
      ),
    },
    ...(!isDriver ? [{
      field: 'driver',
      headerName: 'Driver',
      render: (row) => row.driver ? `${row.driver.firstName} ${row.driver.lastName}` : '—',
    }] : []),
    {
      field: 'completedAt',
      headerName: 'Completed',
      sortable: true,
      render: (row) => row.completedAt ? new Date(row.completedAt).toLocaleDateString() : '—',
    },
    {
      field: 'approvalStatus',
      headerName: 'Approval',
      render: (row) => row.approvalStatus ? (
        <Chip
          size="small"
          label={row.approvalStatus}
          color={APPROVAL_COLORS[row.approvalStatus]}
          sx={{ height: 22, fontSize: 11, textTransform: 'capitalize' }}
        />
      ) : <Chip size="small" label="—" variant="outlined" sx={{ height: 22, fontSize: 11 }} />,
    },
    {
      field: 'totalMileage',
      headerName: 'Total KM',
      render: (row) => {
        const total = (row.stops || []).reduce((sum, s) => sum + (s.driverMileage || 0), 0);
        return total > 0 ? `${total.toFixed(1)} km` : '—';
      },
    },
    {
      field: 'actions',
      headerName: '',
      render: (row) => (
        <IconButton size="small" onClick={() => setViewingTrip(row)}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const handleSortChange = (field) => {
    if (sortBy === field) setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    else { setSortBy(field); setSortOrder('ASC'); }
  };

  return (
    <Box>
      <PageHeader
        title={isDriver ? 'My Business Trips' : 'Business Trips'}
        description={isDriver ? 'All your completed trips with mileage and approval status.' : 'All completed trips across drivers with mileage details.'}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by trip number, origin or destination"
          size="small"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          sx={{ width: { xs: '100%', sm: 340 } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
      </Stack>

      <DataTable
        columns={columns}
        rows={data?.data || []}
        totalCount={data?.meta?.total || 0}
        page={page}
        pageSize={pageSize}
        sortBy={sortBy}
        sortOrder={sortOrder}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onSortChange={handleSortChange}
        emptyMessage="No completed trips yet."
      />

      <TripDetailDrawer
        open={!!viewingTrip}
        trip={viewingTrip}
        onClose={() => setViewingTrip(null)}
        canAdvance={false}
        canEditStops={false}
        isDriver={isDriver}
      />
    </Box>
  );
}
