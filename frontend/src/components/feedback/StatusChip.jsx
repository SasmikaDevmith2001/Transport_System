import { Chip } from '@mui/material';

/**
 * Consistent status pill used across Customers, Drivers, Trips, and Users.
 * Pass a `colorMap` to override default color mapping per module
 * (e.g. trip statuses vs. active/inactive statuses).
 */
const DEFAULT_COLOR_MAP = {
  active: 'success',
  inactive: 'default',
  suspended: 'error',
};

export default function StatusChip({ status, colorMap = DEFAULT_COLOR_MAP }) {
  const color = colorMap[status] || 'default';
  const label = String(status || '').replace(/_/g, ' ');

  return <Chip size="small" label={label} color={color} sx={{ textTransform: 'capitalize' }} />;
}
