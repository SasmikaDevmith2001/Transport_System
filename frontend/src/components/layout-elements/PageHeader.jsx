import { Box, Stack, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * Consistent page header used across every module: title, optional
 * description, breadcrumb trail, and an actions slot (buttons) on the
 * right. Keeps every list/detail page visually aligned.
 */
export default function PageHeader({ title, description, breadcrumbs = [], actions = null }) {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 1, fontSize: 13 }}
        >
          {breadcrumbs.map((bc) =>
            bc.path ? (
              <MuiLink
                key={bc.label}
                component={RouterLink}
                to={bc.path}
                underline="hover"
                color="text.secondary"
                sx={{ fontSize: 13 }}
              >
                {bc.label}
              </MuiLink>
            ) : (
              <Typography key={bc.label} color="text.primary" sx={{ fontSize: 13, fontWeight: 600 }}>
                {bc.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
        {actions && <Box>{actions}</Box>}
      </Stack>
    </Box>
  );
}
