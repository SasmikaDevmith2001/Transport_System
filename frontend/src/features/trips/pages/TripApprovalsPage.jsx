import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Collapse,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { useSnackbar } from 'notistack';
import PageHeader from '../../../components/layout-elements/PageHeader';
import DataTable from '../../../components/data-table/DataTable';
import { usePendingApprovals, useApproveTrip } from '../hooks/useTrips';

function getMileageDiffColor(driverMileage, gpsMileage) {
  if (driverMileage == null || gpsMileage == null) return 'default';
  const diff = Math.abs(driverMileage - gpsMileage);
  const pct = gpsMileage > 0 ? (diff / gpsMileage) * 100 : 0;
  if (pct <= 5) return 'success';
  if (pct <= 15) return 'warning';
  return 'error';
}

function getMileageDiffLabel(driverMileage, gpsMileage) {
  if (driverMileage == null || gpsMileage == null) return '—';
  const diff = (driverMileage - gpsMileage).toFixed(2);
  return diff > 0 ? `+${diff} km` : `${diff} km`;
}

export default function TripApprovalsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedStop, setExpandedStop] = useState(null);

  const params = { page, pageSize };
  const { data, isLoading } = usePendingApprovals(params);
  const approveTrip = useApproveTrip();

  const columns = [
    {
      field: 'tripNumber',
      headerName: 'Trip #',
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
    {
      field: 'driver',
      headerName: 'Driver',
      render: (row) => (row.driver ? `${row.driver.firstName} ${row.driver.lastName}` : '—'),
    },
    {
      field: 'completedAt',
      headerName: 'Completed',
      render: (row) => row.completedAt ? new Date(row.completedAt).toLocaleDateString() : '—',
    },
    {
      field: 'actions',
      headerName: '',
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => setSelectedTrip(row)} title="Review">
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="success"
            onClick={() => handleApprove(row.id)}
            disabled={approveTrip.isPending}
            title="Approve"
          >
            <CheckCircleIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => { setRejectTarget(row); setRejectDialogOpen(true); }}
            title="Reject"
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const handleApprove = async (tripId) => {
    try {
      await approveTrip.mutateAsync({ id: tripId, payload: { approved: true } });
      enqueueSnackbar('Trip approved', { variant: 'success' });
      if (selectedTrip?.id === tripId) setSelectedTrip(null);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to approve trip', { variant: 'error' });
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await approveTrip.mutateAsync({
        id: rejectTarget.id,
        payload: { approved: false, rejectionReason: rejectionReason || null },
      });
      enqueueSnackbar('Trip rejected', { variant: 'success' });
      setRejectDialogOpen(false);
      setRejectTarget(null);
      setRejectionReason('');
      if (selectedTrip?.id === rejectTarget.id) setSelectedTrip(null);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to reject trip', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Trip Approvals"
        description="Review completed trips and approve or reject them based on mileage verification."
      />

      <DataTable
        columns={columns}
        rows={data?.data || []}
        totalCount={data?.meta?.total || 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        emptyMessage="No trips pending approval."
      />

      {/* Trip Detail Review Panel */}
      {selectedTrip && (
        <Paper sx={{ mt: 3, p: 3, borderRadius: 2 }} elevation={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Review: {selectedTrip.tripNumber}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleApprove(selectedTrip.id)}
                disabled={approveTrip.isPending}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => { setRejectTarget(selectedTrip); setRejectDialogOpen(true); }}
              >
                Reject
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Route:</strong> {selectedTrip.origin} → {selectedTrip.destination}
            </Typography>
            <Typography variant="body2">
              <strong>Driver:</strong> {selectedTrip.driver ? `${selectedTrip.driver.firstName} ${selectedTrip.driver.lastName}` : '—'}
            </Typography>
            <Typography variant="body2">
              <strong>Completed:</strong> {selectedTrip.completedAt ? new Date(selectedTrip.completedAt).toLocaleString() : '—'}
            </Typography>
          </Stack>

          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Stop Mileage Comparison
          </Typography>

          <Stack spacing={1}>
            {(selectedTrip.stops || []).map((stop) => {
              const isExpanded = expandedStop === stop.id;
              const diffColor = getMileageDiffColor(stop.driverMileage, stop.gpsMileage);

              return (
                <Paper
                  key={stop.id}
                  elevation={0}
                  sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, cursor: 'pointer' }}
                  onClick={() => setExpandedStop(isExpanded ? null : stop.id)}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        {stop.sequenceNo}. {stop.locationName}
                      </Typography>
                      <Chip
                        size="small"
                        label={stop.status}
                        color={stop.status === 'delivered' ? 'success' : 'default'}
                        sx={{ height: 20, fontSize: 10, textTransform: 'capitalize' }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {stop.driverMileage != null && stop.gpsMileage != null && (
                        <Chip
                          size="small"
                          label={getMileageDiffLabel(stop.driverMileage, stop.gpsMileage)}
                          color={diffColor}
                          sx={{ height: 22, fontSize: 11 }}
                        />
                      )}
                      {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </Stack>
                  </Stack>

                  <Collapse in={isExpanded}>
                    <Stack spacing={0.75} sx={{ mt: 1.5, pl: 1 }}>
                      <Stack direction="row" spacing={2}>
                        <Box sx={{ minWidth: 140 }}>
                          <Typography variant="caption" color="text.secondary">Driver Mileage</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {stop.driverMileage != null ? `${stop.driverMileage} km` : '—'}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 140 }}>
                          <Typography variant="caption" color="text.secondary">GPS Mileage</Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <GpsFixedIcon sx={{ fontSize: 14 }} color="success" />
                            <Typography variant="body2" fontWeight={600}>
                              {stop.gpsMileage != null ? `${stop.gpsMileage} km` : '—'}
                            </Typography>
                          </Stack>
                        </Box>
                        <Box sx={{ minWidth: 100 }}>
                          <Typography variant="caption" color="text.secondary">Difference</Typography>
                          <Chip
                            size="small"
                            label={getMileageDiffLabel(stop.driverMileage, stop.gpsMileage)}
                            color={diffColor}
                            sx={{ height: 20, fontSize: 10 }}
                          />
                        </Box>
                      </Stack>

                      {stop.gpsLocationName && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">GPS Location</Typography>
                          <Typography variant="body2">{stop.gpsLocationName}</Typography>
                        </Box>
                      )}

                      {stop.latitude && stop.longitude && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Coordinates</Typography>
                          <Typography variant="body2">{stop.latitude}, {stop.longitude}</Typography>
                        </Box>
                      )}

                      {stop.invoices?.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Invoices</Typography>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.25 }}>
                            {stop.invoices.map((inv, i) => (
                              <Chip key={i} label={inv} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Collapse>
                </Paper>
              );
            })}
          </Stack>
        </Paper>
      )}

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Trip</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Optionally provide a reason for rejecting trip <strong>{rejectTarget?.tripNumber}</strong>.
          </Typography>
          <TextField
            label="Rejection Reason"
            multiline
            rows={3}
            fullWidth
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Mileage discrepancy exceeds acceptable threshold"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRejectDialogOpen(false); setRejectionReason(''); }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={approveTrip.isPending}>
            {approveTrip.isPending ? 'Rejecting...' : 'Reject Trip'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
