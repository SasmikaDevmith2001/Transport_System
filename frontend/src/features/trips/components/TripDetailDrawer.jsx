import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
  IconButton,
  Button,
  TextField,
  Paper,
  Collapse,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircle';
import { getCurrentPosition, getDrivingDistanceKm, reverseGeocode } from '../../../utils/gps';
import { startTracking, stopTracking } from '../../../services/gpsTracker';
import RouteOptimizationDialog from './RouteOptimizationDialog';

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
  in_progress: { next: 'completed', label: 'Complete Trip' },
};

export default function TripDetailDrawer({
  open,
  trip,
  onClose,
  onAdvanceStatus,
  onUpdateStopDetails,
  canAdvance = false,
  canEditStops = false,
  isDriver = false,
  advancing = false,
  savingStop = false,
}) {
  const [expandedStop, setExpandedStop] = useState(null);
  const [stopEdits, setStopEdits] = useState({});
  const [gettingGps, setGettingGps] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);

  useEffect(() => {
    if (trip) {
      const edits = {};
      (trip.stops || []).forEach((stop) => {
        edits[stop.id] = {
          invoices: stop.invoices?.length > 0 ? [...stop.invoices] : [''],
          driverMileage: stop.driverMileage != null ? String(stop.driverMileage) : '',
        };
      });
      setStopEdits(edits);
      setExpandedStop(null);
    }
  }, [trip]);

  if (!trip) return null;
  const action = NEXT_STATUS_ACTIONS[trip.status];

  const currentStopIndex = (trip.stops || []).findIndex((s) => s.status !== 'delivered');

  const handleStopFieldChange = (stopId, field, value) => {
    setStopEdits((prev) => ({
      ...prev,
      [stopId]: { ...prev[stopId], [field]: value },
    }));
  };

  const handleInvoiceChange = (stopId, index, value) => {
    setStopEdits((prev) => {
      const invoices = [...(prev[stopId]?.invoices || [''])];
      invoices[index] = value;
      return { ...prev, [stopId]: { ...prev[stopId], invoices } };
    });
  };

  const handleAddInvoice = (stopId) => {
    setStopEdits((prev) => {
      const invoices = [...(prev[stopId]?.invoices || ['']), ''];
      return { ...prev, [stopId]: { ...prev[stopId], invoices } };
    });
  };

  const handleRemoveInvoice = (stopId, index) => {
    setStopEdits((prev) => {
      const invoices = [...(prev[stopId]?.invoices || [''])];
      invoices.splice(index, 1);
      if (invoices.length === 0) invoices.push('');
      return { ...prev, [stopId]: { ...prev[stopId], invoices } };
    });
  };

  const hasStopChanged = (stop) => {
    const edit = stopEdits[stop.id];
    if (!edit) return false;
    const origInvoices = stop.invoices?.length > 0 ? stop.invoices : [''];
    const invoicesChanged = JSON.stringify(edit.invoices) !== JSON.stringify(origInvoices);
    const origMileage = stop.driverMileage != null ? String(stop.driverMileage) : '';
    const mileageChanged = edit.driverMileage !== origMileage;
    return invoicesChanged || mileageChanged;
  };

  const handleSaveStop = async (stop) => {
    const edit = stopEdits[stop.id];
    if (!edit || !onUpdateStopDetails) return;
    const invoices = edit.invoices.filter((inv) => inv.trim() !== '');
    const payload = {
      invoices: invoices.length > 0 ? invoices : null,
      driverMileage: edit.driverMileage ? parseFloat(edit.driverMileage) : null,
    };
    onUpdateStopDetails(stop.id, payload);
  };

  const handleMarkDelivered = async (stop) => {
    if (!onUpdateStopDetails) return;
    setGettingGps(true);
    const gps = await getCurrentPosition();

    let gpsMileage = null;
    let gpsLocationName = null;

    if (gps) {
      gpsLocationName = await reverseGeocode(gps.latitude, gps.longitude);

      const stopIndex = (trip.stops || []).findIndex((s) => s.id === stop.id);
      let refLat, refLon;
      if (stopIndex > 0) {
        const prevStop = trip.stops[stopIndex - 1];
        refLat = prevStop.latitude;
        refLon = prevStop.longitude;
      } else {
        refLat = trip.startLatitude;
        refLon = trip.startLongitude;
      }

      if (refLat && refLon) {
        gpsMileage = await getDrivingDistanceKm(refLat, refLon, gps.latitude, gps.longitude);
      }
    }

    setGettingGps(false);

    const edit = stopEdits[stop.id] || {};
    const invoices = (edit.invoices || []).filter((inv) => inv.trim() !== '');
    const payload = {
      status: 'delivered',
      invoices: invoices.length > 0 ? invoices : null,
      driverMileage: edit.driverMileage ? parseFloat(edit.driverMileage) : null,
      ...(gps || {}),
      gpsLocationName,
      gpsMileage,
    };
    onUpdateStopDetails(stop.id, payload);

    // Show route dialog for next stop automatically
    const stops = trip.stops || [];
    const currentIndex = stops.findIndex((s) => s.id === stop.id);
    const nextStop = stops[currentIndex + 1];
    if (nextStop) {
      // Small delay to let the UI update, then show route dialog
      setTimeout(() => setShowRouteDialog(true), 500);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: (theme) => theme.zIndex.appBar - 1 }}>
      <Box sx={{ width: { xs: '100vw', sm: 440 }, p: 3, pt: 10 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {trip.tripNumber}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip size="small" sx={{ textTransform: 'capitalize' }} label={trip.status.replace('_', ' ')} color={TRIP_STATUS_COLORS[trip.status]} />
              {trip.approvalStatus && (
                <Chip
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                  label={`Approval: ${trip.approvalStatus}`}
                  color={trip.approvalStatus === 'approved' ? 'success' : trip.approvalStatus === 'rejected' ? 'error' : 'warning'}
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">Route</Typography>
            <Typography variant="body1" fontWeight={600}>
              {trip.origin} → {trip.destination}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {trip.scheduledDate} {trip.scheduledTime ? `at ${trip.scheduledTime.slice(0, 5)}` : ''}
            </Typography>
          </Box>

          <Divider />

          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">Customer</Typography>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                <BusinessIcon fontSize="small" color="action" />
                <Typography variant="body2" fontWeight={600}>
                  {trip.customer?.companyName || '—'}
                </Typography>
              </Stack>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Driver</Typography>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" fontWeight={600}>
                  {trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'Not assigned'}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {trip.cargoDescription && (
            <Box>
              <Typography variant="caption" color="text.secondary">Cargo</Typography>
              <Typography variant="body2">{trip.cargoDescription}</Typography>
            </Box>
          )}

          <Divider />

          {/* Delivery Stops */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
              Delivery Locations
            </Typography>

            {trip.stops?.length > 0 ? (
              <Stack spacing={1.5}>
                {trip.stops.map((stop, index) => {
                  const isExpanded = expandedStop === stop.id;
                  const edit = stopEdits[stop.id] || { invoices: [''], driverMileage: '' };
                  const isDelivered = stop.status === 'delivered';
                  const isCurrentStop = index === currentStopIndex;
                  const isLockedFuture = index > currentStopIndex && !isDelivered;

                  return (
                    <Paper
                      key={stop.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isDelivered ? 'success.light' : isCurrentStop ? 'primary.light' : 'divider',
                        bgcolor: isDelivered ? 'success.50' : isCurrentStop ? 'primary.50' : 'background.paper',
                        opacity: isLockedFuture ? 0.6 : 1,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ cursor: isLockedFuture ? 'default' : 'pointer' }}
                        onClick={() => !isLockedFuture && setExpandedStop(isExpanded ? null : stop.id)}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: isDelivered ? 'success.main' : isCurrentStop ? 'primary.main' : 'grey.400',
                              color: 'white',
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {isDelivered ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : stop.sequenceNo}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{stop.locationName}</Typography>
                            {stop.contactName && (
                              <Typography variant="caption" color="text.secondary">
                                {stop.contactName} {stop.contactPhone ? `• ${stop.contactPhone}` : ''}
                              </Typography>
                            )}
                            {!isDriver && stop.expectedMileage != null && (
                              <Typography variant="caption" color="info.main" fontWeight={600}>
                                Expected: {stop.expectedMileage} km
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Chip
                            size="small"
                            label={isLockedFuture ? 'waiting' : stop.status}
                            color={isLockedFuture ? 'default' : STOP_STATUS_COLORS[stop.status]}
                            sx={{ height: 20, fontSize: 10, textTransform: 'capitalize' }}
                          />
                          {!isLockedFuture && (isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />)}
                        </Stack>
                      </Stack>

                      <Collapse in={isExpanded && !isLockedFuture}>
                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                          {/* Expected mileage from saved locations */}
                          {!isDriver && stop.expectedMileage != null && (
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">Map Distance:</Typography>
                              <Chip size="small" label={`${stop.expectedMileage} km`} color="info" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                            </Stack>
                          )}

                          {/* Show GPS verification data for delivered stops */}
                          {isDelivered && (
                            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                              <Stack spacing={0.5}>
                                {!isDriver && stop.gpsMileage != null && (
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>GPS Distance:</Typography>
                                    <Typography variant="body2" fontWeight={700}>{stop.gpsMileage} km</Typography>
                                    <Chip size="small" label="GPS verified" color="success" sx={{ height: 18, fontSize: 9 }} />
                                  </Stack>
                                )}
                                {stop.driverMileage != null && (
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>Driver Mileage:</Typography>
                                    <Typography variant="body2" fontWeight={700}>{stop.driverMileage} km</Typography>
                                  </Stack>
                                )}
                                {!isDriver && stop.gpsLocationName && (
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>Location:</Typography>
                                    <Typography variant="body2">{stop.gpsLocationName}</Typography>
                                  </Stack>
                                )}
                                {stop.invoices?.length > 0 && (
                                  <Stack direction="row" spacing={1} alignItems="flex-start">
                                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>Invoices:</Typography>
                                    <Stack spacing={0.25}>
                                      {stop.invoices.map((inv, i) => (
                                        <Typography key={i} variant="body2">{inv}</Typography>
                                      ))}
                                    </Stack>
                                  </Stack>
                                )}
                              </Stack>
                            </Paper>
                          )}

                          {/* Editable fields */}
                          {canEditStops && !isDelivered && isCurrentStop && (
                            <>
                              {/* Navigate / View Route button */}
                              <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                startIcon={<GpsFixedIcon />}
                                onClick={() => setShowRouteDialog(true)}
                                fullWidth
                              >
                                View Best Route to {stop.locationName}
                              </Button>

                              <TextField
                                label="Driver Mileage (km)"
                                size="small"
                                fullWidth
                                type="number"
                                value={edit.driverMileage}
                                onChange={(e) => handleStopFieldChange(stop.id, 'driverMileage', e.target.value)}
                                placeholder="Manual mileage reading"
                                inputProps={{ min: 0, step: '0.01' }}
                              />

                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                  Invoice Numbers
                                </Typography>
                                <Stack spacing={1}>
                                  {(edit.invoices || ['']).map((inv, i) => (
                                    <Stack key={i} direction="row" spacing={0.5} alignItems="center">
                                      <TextField
                                        size="small"
                                        fullWidth
                                        value={inv}
                                        onChange={(e) => handleInvoiceChange(stop.id, i, e.target.value)}
                                        placeholder={`Invoice #${i + 1}`}
                                      />
                                      {edit.invoices.length > 1 && (
                                        <IconButton size="small" color="error" onClick={() => handleRemoveInvoice(stop.id, i)}>
                                          <RemoveCircleOutlineIcon fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Stack>
                                  ))}
                                  <Button size="small" startIcon={<AddIcon />} onClick={() => handleAddInvoice(stop.id)} sx={{ alignSelf: 'flex-start' }}>
                                    Add Invoice
                                  </Button>
                                </Stack>
                              </Box>

                              <Typography variant="caption" color="text.secondary">
                                📍 GPS mileage will be auto-calculated when you mark this as delivered.
                              </Typography>

                              <Stack direction="row" spacing={1}>
                                {hasStopChanged(stop) && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<SaveIcon />}
                                    onClick={() => handleSaveStop(stop)}
                                    disabled={savingStop}
                                  >
                                    {savingStop ? 'Saving...' : 'Save'}
                                  </Button>
                                )}
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="success"
                                  startIcon={gettingGps ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
                                  onClick={() => handleMarkDelivered(stop)}
                                  disabled={savingStop || gettingGps}
                                >
                                  {gettingGps ? 'Getting GPS...' : 'Mark Delivered'}
                                </Button>
                              </Stack>
                            </>
                          )}
                        </Stack>
                      </Collapse>
                    </Paper>
                  );
                })}
              </Stack>
            ) : (
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                <LocationOnIcon color="action" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  No intermediate stops — direct delivery from origin to destination.
                </Typography>
              </Paper>
            )}
          </Box>

          {trip.remarks && (
            <>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">Remarks</Typography>
                <Typography variant="body2">{trip.remarks}</Typography>
              </Box>
            </>
          )}

          {canAdvance && action && (
            <>
              <Divider />
              {action.next === 'in_progress' ? (
                /* Start Trip - show route optimization first */
                <Button
                  variant="contained"
                  fullWidth
                  disabled={advancing}
                  startIcon={<GpsFixedIcon />}
                  onClick={() => setShowRouteDialog(true)}
                >
                  Start Trip
                </Button>
              ) : (
                /* Complete Trip - normal GPS capture */
                <Button
                  variant="contained"
                  fullWidth
                  disabled={advancing || gettingGps}
                  startIcon={gettingGps ? <CircularProgress size={16} color="inherit" /> : <GpsFixedIcon />}
                  onClick={async () => {
                    setGettingGps(true);
                    const gps = await getCurrentPosition();
                    setGettingGps(false);
                    onAdvanceStatus(action.next, gps);
                    // Stop tracking when trip is completed
                    if (action.next === 'completed') {
                      stopTracking();
                    }
                  }}
                >
                  {gettingGps ? 'Getting location...' : advancing ? 'Updating...' : action.label}
                </Button>
              )}
            </>
          )}

          {/* Route Optimization Dialog */}
          <RouteOptimizationDialog
            open={showRouteDialog}
            trip={trip}
            onClose={() => setShowRouteDialog(false)}
            onStartTrip={async (midpoint) => {
              setShowRouteDialog(false);
              
              // If trip is still assigned (not started yet), start it
              if (trip.status === 'assigned') {
                setGettingGps(true);
                const gps = await getCurrentPosition();
                setGettingGps(false);
                onAdvanceStatus('in_progress', gps);
                // Start GPS tracking
                startTracking(trip.id);
              }

              // Open Google Maps navigation to next pending stop with route midpoint as waypoint
              const stops = trip.stops || [];
              const nextStop = stops.find((s) => s.status !== 'delivered');
              if (nextStop) {
                const nextIndex = stops.findIndex((s) => s.id === nextStop.id);
                const previousStop = nextIndex > 0 ? stops[nextIndex - 1] : null;
                const originName = previousStop ? previousStop.locationName : trip.origin;
                const origin = encodeURIComponent(originName);
                const destination = encodeURIComponent(nextStop.locationName);
                
                // Use midpoint as waypoint to force Google Maps to use the selected route
                let url;
                if (midpoint) {
                  const wp = `${midpoint.lat},${midpoint.lng}`;
                  url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${wp}&travelmode=driving&dir_action=navigate`;
                } else {
                  url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving&dir_action=navigate`;
                }
                window.open(url, '_blank');
              }
            }}
          />
        </Stack>
      </Box>
    </Drawer>
  );
}
