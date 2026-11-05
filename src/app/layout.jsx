'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { AppProvider } from '@/context/AppContext';
import { MainLayout } from '@/components/layout';
import {
  ProductModal,
  OrderDetailModal,
  CollectionEditorDrawer,
  ShopPreviewModal,
  SupportModal,
  ShopReviewModal,
  RestrictedProductsModal,
} from '@/components/modals';
import theme from '@/theme/theme';
import { WHITELABEL } from '@/config/whitelabel';

// Routes that should NOT show the animated background
// Use exact matching to avoid conflicts
const noBackgroundRoutes = ['/shop', '/product'];

function AppContent({ children }) {
  const pathname = usePathname();
  
  // Check if current route should hide background
  // Use exact match or check for query params to avoid matching /products when checking /product
  const hideBackground = noBackgroundRoutes.some(route => {
    return pathname === route || pathname.startsWith(`${route}?`) || pathname.startsWith(`${route}/`);
  });

  return (
    <MainLayout>
      {/* Animated Background - Only show on dashboard pages */}
      {!hideBackground && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 50%, rgba(30, 64, 175, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 59, 59, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)
            `,
            animation: 'gradientShift 20s ease infinite',
            pointerEvents: 'none',
            zIndex: -1,
            '@keyframes gradientShift': {
              '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
              '50%': { transform: 'rotate(180deg) scale(1.1)' },
            },
          }}
        />
      )}

      {/* Page Content */}
      {children}

      {/* Global Modals */}
      <ProductModal />
      <OrderDetailModal />
      <CollectionEditorDrawer />
      <ShopPreviewModal />
      <SupportModal />
      <ShopReviewModal />
      <RestrictedProductsModal />
    </MainLayout>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{WHITELABEL.productName}</title>
        <meta name="description" content={WHITELABEL.description} />
        <link rel="icon" href="/merchandise/img/favicon-96x96.png" />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppProvider>
            <AppContent>{children}</AppContent>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}