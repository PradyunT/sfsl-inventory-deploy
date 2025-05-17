import * as React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import SummarizeIcon from '@mui/icons-material/Summarize';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

import '../styles/Drawer.css';
import sfsllogo from '../assets/sfsl_logo.png';

const drawerWidth = 240;

const iconsMain = [<HomeIcon />, <StorefrontIcon />, <SummarizeIcon />];
// const iconsLower = [<SettingsIcon />];

function ResponsiveDrawer({ children }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const location = useLocation(); // Get current route

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawer = (
    <div className="drawer">
      <Box
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem',
        }}
      >
        <img
          src={sfsllogo}
          alt="sfsl-logo"
          style={{
            maxWidth: '5rem', paddingBottom: '1rem',
          }}
        />
        <Typography sx={{ fontWeight: 700 }}>
          Share Food
          <br />
          Share Love
        </Typography>
      </Box>

      {/* Navigation Links */}
      <List>
        {['Dashboard', 'Inventory', 'Reports'].map((text, index) => {
          const routePath = text.toLowerCase() === 'dashboard' ? '/' : `/${text.toLowerCase()}`;
          const isActive = location.pathname === routePath;

          return (
            <ListItem key={text} disablePadding>
              <ListItemButton
                component={Link}
                to={routePath}
                sx={{
                  borderRadius: 2,
                  color: isActive ? '#ffffff' : '#c0c0c0', // Subtle brightness for active tab
                  '&:hover': { color: '#ffffff' }, // Lighter on hover
                  transition: 'color 0.2s ease-in-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#ffffff' : '#c0c0c0', minWidth: '40px',
                  }}
                >
                  {iconsMain[index]}
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  sx={{
                    fontWeight: isActive ? 'bold' : 'normal', // Slightly bolder text
                    fontSize: isActive ? '1rem' : '0.95rem', transition: 'all 0.2s ease-in-out',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <List>
        {/* {["Settings"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon sx={{ color: '#c0c0c0' }}>
                {iconsLower[index]}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))} */}
      </List>
      <List>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile menu button with absolute positioning */}
      <Box
        sx={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 1100,
          display: { xs: 'block', sm: 'none' }
        }}
      >
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ color: '#000' }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Temporary Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#2E3B1F',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Left hand side Green Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#2E3B1F',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Render the wrapped content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 0, sm: 0 }, // Removed top margin
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default ResponsiveDrawer;