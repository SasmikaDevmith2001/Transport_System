import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeModeContext';
import { navConfig } from '../routes/navConfig';

const DRAWER_WIDTH = 264;

const ICONS = {
  Dashboard: DashboardIcon,
  People: PeopleIcon,
  LocalShipping: LocalShippingIcon,
  Business: BusinessIcon,
  Badge: BadgeIcon,
  FactCheck: FactCheckIcon,
};

const ROLE_LABEL = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  DRIVER: 'Driver',
};

export default function DashboardLayout() {
  const { user, logout, hasPermission } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const visibleNavItems = navConfig.filter((item) => !item.permission || hasPermission(item.permission));

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const brand = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 2.5 }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          flexShrink: 0,
        }}
      >
        <LocalShippingRoundedIcon fontSize="small" />
      </Box>
      <Box sx={{ overflow: 'hidden' }}>
        <Typography variant="subtitle1" sx={{ lineHeight: 1.2 }} noWrap>
          Anuradha Transport
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          Transport Management System
        </Typography>
      </Box>
    </Box>
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {brand}
      <Divider />
      <List sx={{ pt: 1.5, flexGrow: 1 }}>
        {visibleNavItems.map((item) => {
          const Icon = ICONS[item.icon] || DashboardIcon;
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              end={item.path === '/'}
              sx={{
                py: 1,
                '&.active': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} elevation={0} color="transparent">
        <Toolbar sx={{ gap: 1 }}>
          {!isDesktop && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          {isDesktop && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShippingRoundedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.primary' }} noWrap>
                Anuradha Transport
              </Typography>
            </Box>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={toggleMode} aria-label="Toggle dark mode" sx={{ color: 'text.primary' }}>
            {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
          </IconButton>
          <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5 }} />
          <Box
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', px: 0.5, borderRadius: 2 }}
          >
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>
              {user?.firstName?.[0] || <PersonIcon fontSize="small" />}
            </Avatar>
            {isDesktop && (
              <Box sx={{ textAlign: 'left', lineHeight: 1.15 }}>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 140, color: 'text.primary' }}>
                  {user?.fullName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {ROLE_LABEL[user?.role] || user?.role}
                </Typography>
              </Box>
            )}
          </Box>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" fontWeight={700}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip size="small" label={ROLE_LABEL[user?.role] || user?.role} color="primary" variant="outlined" />
              </Box>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
