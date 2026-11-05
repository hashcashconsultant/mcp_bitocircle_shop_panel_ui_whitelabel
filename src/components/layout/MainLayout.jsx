'use client';

import { usePathname } from 'next/navigation';
import { Box, Snackbar, Alert, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useApp } from '@/context/AppContext';

const drawerWidth = 250;

// Routes that should NOT show the sidebar and topbar
// Use exact matching to avoid conflicts (e.g., /product vs /products)
const noLayoutRoutes = ['/shop', '/product', '/my-order'];

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const { toast, hideToast, openProductModal } = useApp();

  // Check if current route should hide layout
  // Use exact match or check for query params to avoid matching /products when checking /product
  const hideLayout = noLayoutRoutes.some(route => {
    // Exact match or starts with route followed by ? or end of string
    return pathname === route || pathname.startsWith(`${route}?`) || pathname.startsWith(`${route}/`);
  });

  // If no layout needed, render children directly
  if (hideLayout) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        {children}
        
        {/* Toast Notification - Still available on all pages */}
        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={hideToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={hideToast}
            severity={toast.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Regular layout with sidebar and topbar
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopBar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
      
      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        onClick={openProductModal}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' },
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          boxShadow: '0 8px 24px rgba(30, 64, 175, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          },
        }}
      >
        <AddIcon />
      </Fab>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={hideToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
