import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack, Typography } from '@mui/material';
import { useActiveDrivers } from '../../drivers/hooks/useDrivers';

export default function AssignDriverDialog({ open, trip, submitting = false, onSubmit, onClose }) {
  const { data: drivers = [] } = useActiveDrivers();
  const [driverId, setDriverId] = useState('');

  useEffect(() => {
    if (open) setDriverId(trip?.driverId || '');
  }, [open, trip]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Assign Driver</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Trip {trip?.tripNumber}: {trip?.origin} → {trip?.destination}
        </Typography>
        <TextField
          select
          label="Driver"
          fullWidth
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
        >
          {drivers.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.fullName} — {d.vehicleNumber || 'No vehicle'}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="contained" disabled={!driverId || submitting} onClick={() => onSubmit(driverId)}>
            {submitting ? 'Assigning...' : 'Assign'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
