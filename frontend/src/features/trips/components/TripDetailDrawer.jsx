import {
  Drawer,
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';

const TRIP_STATUS_COLORS = {
  pending: 'default',
  assigned: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'error',
};

const STOP_STATUS_COLORS = {
  pending: 'default',
  arrived: 'info',
  delivered: 'success',
  skipped: 'error',
};

const NEXT_STATUS_ACTIONS = {
  assigned: { next: 'in_progress', label: 'Start Trip' },
  in_progress: { next: 'completed', label: 'Mark Completed' },
};

export default function TripDetailDrawer({ open, trip, onClose, onAdvanceStatus, canAdvance = false, advancing = false }) {
  if (!trip) return null;
  const action = NEXT_STATUS_ACTIONS[trip.status];

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 420 }, p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {trip.tripNumber}
            </Typography>
            <Chip size="small" sx={{ mt: 0.5, textTransform: 'capitalize' }} label={trip.status.replace('_', ' ')} color={TRIP_STATUS_COLORS[trip.status]} />
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Route
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {trip.origin} → {trip.destination}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {trip.scheduledDate} {trip.scheduledTime ? `at ${trip.scheduledTime.slice(0, 5)}` : ''}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary">
              Customer
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <BusinessIcon fontSize="small" color="action" />
              <Typography variant="body2" fontWeight={600}>
                {trip.customer?.companyName || '—'}
              </Typography>
            </Stack>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Driver
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" fontWeight={600}>
                {trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'Not assigned'}
              </Typography>
              {trip.driver?.phone && (
                <Typography variant="caption" color="text.secondary">
                  ({trip.driver.phone})
                </Typography>
              )}
            </Stack>
          </Box>

          {trip.cargoDescription && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Cargo
              </Typography>
              <Typography variant="body2">{trip.cargoDescription}</Typography>
            </Box>
          )}

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Delivery Sequence
            </Typography>
            {trip.stops?.length > 0 ? (
              <List dense disablePadding>
                {trip.stops.map((stop) => (
                  <ListItem key={stop.id} disableGutters sx={{ alignItems: 'flex-start' }}>
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{stop.sequenceNo}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight={600}>
                            {stop.locationName}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <>
                          {stop.contactName && `${stop.contactName} `}
                          {stop.contactPhone}
                          <Chip
                            size="small"
                            label={stop.status}
                            color={STOP_STATUS_COLORS[stop.status]}
                            sx={{ ml: 1, height: 18, fontSize: 10, textTransform: 'capitalize' }}
                          />
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No intermediate stops — direct delivery.
              </Typography>
            )}
          </Box>

          {trip.remarks && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Remarks
              </Typography>
              <Typography variant="body2">{trip.remarks}</Typography>
            </Box>
          )}

          {canAdvance && action && (
            <Button variant="contained" fullWidth disabled={advancing} onClick={() => onAdvanceStatus(action.next)}>
              {advancing ? 'Updating...' : action.label}
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
