import { useState } from 'react';
import { Box, Button, InputAdornment, TextField, MenuItem, Stack, IconButton, Typography, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAddAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSnackbar } from 'notistack';
import PageHeader from '../../../components/layout-elements/PageHeader';
import DataTable from '../../../components/data-table/DataTable';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import TripFormDialog from '../components/TripFormDialog';
import AssignDriverDialog from '../components/AssignDriverDialog';
import TripDetailDrawer from '../components/TripDetailDrawer';
import {
  useTripsList,
  useCreateTrip,
  useUpdateTrip,
  useAssignTrip,
  useUpdateTripStatus,
  useDeleteTrip,
} from '../hooks/useTrips';
import { useAuth } from '../../../contexts/AuthContext';

const TRIP_STATUS_COLORS = {
  pending: 'default',
  assigned: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'error',
};

const STATUS_OPTIONS = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];

export default function TripsListPage() {
  const { hasPermission, user } = useAuth();
  const isDriver = user?.role === 'DRIVER';
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('scheduledDate');
  const [sortOrder, setSortOrder] = useState('DESC');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewingTrip, setViewingTrip] = useState(null);

  const params = { page, pageSize, search: search || undefined, status: status || undefined, sortBy, sortOrder };
  const { data, isLoading } = useTripsList(params);

  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();
  const assignTrip = useAssignTrip();
  const updateStatus = useUpdateTripStatus();
  const deleteTrip = useDeleteTrip();

  const columns = [
    {
      field: 'tripNumber',
      headerName: 'Trip #',
      sortable: true,
      render: (row) => (
        <Typography variant="body2" fontWeight={700}>
          {row.tripNumber}
        </Typography>
      ),
    },
    {
      field: 'route',
      headerName: 'Route',
      render: (row) => (
        <Box>
          <Typography variant="body2">{row.origin} → {row.destination}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.customer?.companyName}
          </Typography>
        </Box>
      ),
    },
    { field: 'scheduledDate', headerName: 'Scheduled', sortable: true },
    {
      field: 'driver',
      headerName: 'Driver',
      render: (row) => (row.driver ? `${row.driver.firstName} ${row.driver.lastName}` : <Chip size="small" label="Unassigned" variant="outlined" />),
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      render: (row) => <Chip size="small" label={row.status.replace('_', ' ')} color={TRIP_STATUS_COLORS[row.status]} sx={{ textTransform: 'capitalize' }} />,
    },
    {
      field: 'actions',
      headerName: '',
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => setViewingTrip(row)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {hasPermission('trips:update') && !isDriver && (
            <IconButton size="small" onClick={() => { setEditing(row); setFormOpen(true); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {hasPermission('trips:assign') && row.canBeAssigned !== false && ['pending', 'assigned'].includes(row.status) && (
            <IconButton size="small" onClick={() => setAssignTarget(row)}>
              <PersonAddIcon fontSize="small" />
            </IconButton>
          )}
          {hasPermission('trips:delete') && (
            <IconButton size="small" onClick={() => setDeleteTarget(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  const handleSortChange = (field) => {
    if (sortBy === field) setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      if (editing) {
        await updateTrip.mutateAsync({ id: editing.id, payload: values });
        enqueueSnackbar('Trip updated successfully', { variant: 'success' });
      } else {
        await createTrip.mutateAsync(values);
        enqueueSnackbar('Trip created successfully', { variant: 'success' });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Something went wrong', { variant: 'error' });
    }
  };

  const handleAssign = async (driverId) => {
    try {
      await assignTrip.mutateAsync({ id: assignTarget.id, driverId });
      enqueueSnackbar('Driver assigned successfully', { variant: 'success' });
      setAssignTarget(null);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to assign driver', { variant: 'error' });
    }
  };

  const handleAdvanceStatus = async (nextStatus) => {
    try {
      const updated = await updateStatus.mutateAsync({ id: viewingTrip.id, status: nextStatus });
      enqueueSnackbar('Trip status updated', { variant: 'success' });
      setViewingTrip(updated);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to update trip status', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTrip.mutateAsync(deleteTarget.id);
      enqueueSnackbar('Trip deleted successfully', { variant: 'success' });
      setDeleteTarget(null);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to delete trip', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title={isDriver ? 'My Trips' : 'Trip Management'}
        description={
          isDriver
            ? 'Trips assigned to you, with delivery sequence and customer details.'
            : 'Create trips, assign drivers, and track delivery progress.'
        }
        actions={
          hasPermission('trips:create') && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
              New Trip
            </Button>
          )
        }
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
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          sx={{ width: { xs: '100%', sm: 180 } }}
        >
          <MenuItem value="">All</MenuItem>
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
              {s.replace('_', ' ')}
            </MenuItem>
          ))}
        </TextField>
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
        emptyMessage={isDriver ? 'No trips assigned to you yet.' : 'No trips found. Create your first trip to get started.'}
      />

      {!isDriver && (
        <TripFormDialog
          open={formOpen}
          trip={editing}
          submitting={createTrip.isPending || updateTrip.isPending}
          onSubmit={handleFormSubmit}
          onClose={() => { setFormOpen(false); setEditing(null); }}
        />
      )}

      <AssignDriverDialog
        open={!!assignTarget}
        trip={assignTarget}
        submitting={assignTrip.isPending}
        onSubmit={handleAssign}
        onClose={() => setAssignTarget(null)}
      />

      <TripDetailDrawer
        open={!!viewingTrip}
        trip={viewingTrip}
        onClose={() => setViewingTrip(null)}
        onAdvanceStatus={handleAdvanceStatus}
        canAdvance={hasPermission('trips:update') || isDriver}
        advancing={updateStatus.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete trip"
        message={`Are you sure you want to delete trip ${deleteTarget?.tripNumber}?`}
        loading={deleteTrip.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
