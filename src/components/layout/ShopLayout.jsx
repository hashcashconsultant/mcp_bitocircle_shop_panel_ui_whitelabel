'use client';

import { Box, Snackbar, Alert } from '@mui/material';
import { useApp } from '@/context/AppContext';

/**
 * ShopLayout - A minimal layout for public-facing shop pages
 * No sidebar, no topbar, no dashboard elements
 * Use this layout for /shop and /product pages
 */
export default function ShopLayout({ children }) {
  const { toast, hideToast } = useApp();

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: '#0a0a0f', // Dark background for shop
      }}
    >
      {children}
      
      {/* Toast Notification */}
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