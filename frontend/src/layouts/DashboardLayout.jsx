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
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeModeContext';
import { navConfig } from '../routes/navConfig';

const DRAWER_WIDTH = 260;

const ICONS = {
  Dashboard: DashboardIcon,
  People: PeopleIcon,
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

  const drawerContent = (
    <List sx={{ pt: 2 }}>
      {visibleNavItems.map((item) => {
        const Icon = ICONS[item.icon] || DashboardIcon;
        return (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === '/'}
            sx={{
              '&.active': { bgcolor: 'action.selected', borderRight: 3, borderColor: 'primary.main' },
            }}
          >
            <ListItemIcon>
              <Icon />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      })}
    </List>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} color="default" elevation={1}>
        <Toolbar>
          {!isDesktop && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Anuradha Transport - TMS
          </Typography>
          <IconButton onClick={toggleMode} sx={{ mr: 1 }} aria-label="Toggle dark mode">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Account menu">
            <Avatar sx={{ width: 32, height: 32 }}>{user?.firstName?.[0] || 'U'}</Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>{user?.fullName}</MenuItem>
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
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
