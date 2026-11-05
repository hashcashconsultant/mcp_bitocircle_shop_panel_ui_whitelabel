'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CollectionsIcon from '@mui/icons-material/Collections';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MovieIcon from '@mui/icons-material/Movie';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import { useApp } from '@/context/AppContext';
import logoImage from '../../../public/img/bitoHubTextLogo.png'

const drawerWidth = 250;

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { id: 'products', label: 'Products', icon: InventoryIcon, path: '/products' },
  { id: 'collections', label: 'Collections', icon: CollectionsIcon, path: '/collections' },
  { id: 'orders', label: 'Orders', icon: ShoppingCartIcon, path: '/orders' },
  { id: 'content', label: 'Content & Tags', icon: MovieIcon, path: '/content' },
  { id: 'analytics', label: 'Analytics', icon: BarChartIcon, path: '/analytics' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { mobileOpen, handleDrawerToggle, setMobileOpen } = useApp();

  const handleNavClick = () => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const isActive = (path) => {
    if (path === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname === path;
  };

  const drawerContent = (
    <Box sx={{ p: 2.5, height: '100%' }}>
      {/* Logo Section */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src="/merchandise/img/bitoHubTextLogo.png"
          alt="BitoHub"
          style={{
            height: '40px',
            width: 'auto',
            objectFit: 'contain',
          }}
        />
      </Box>
      <List sx={{ p: 0 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <ListItemButton
              key={item.id}
              component={Link}
              href={item.path}
              selected={active}
              onClick={handleNavClick}
              sx={{
                borderRadius: 3,
                mb: 0.5,
                py: 1.5,
                textDecoration: 'none',
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.3) 0%, rgba(30, 64, 175, 0.1) 100%)',
                  border: '1px solid rgba(30, 64, 175, 0.5)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.4) 0%, rgba(30, 64, 175, 0.2) 100%)',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: active ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            top: 0,
            height: '100%',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
