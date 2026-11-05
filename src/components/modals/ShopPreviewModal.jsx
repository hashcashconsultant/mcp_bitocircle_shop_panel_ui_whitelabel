'use client';

import { Dialog, Box, Typography, Button, Grid, Card, CardContent, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useApp } from '@/context/AppContext';

export default function ShopPreviewModal() {
  const { shopPreviewOpen, closeShopPreview, products, settings } = useApp();

  const activeProducts = products.filter((p) => p.status === 'active');

  return (
    <Dialog open={shopPreviewOpen} onClose={closeShopPreview} fullScreen>
      {/* Header */}
      <Box
        sx={{
          bgcolor: '#fff',
          p: 2,
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600 }}>
          {settings.shopName}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={closeShopPreview}
          sx={{ bgcolor: '#1f2937', color: '#fff', '&:hover': { bgcolor: '#374151' } }}
        >
          Back to Manager
        </Button>
      </Box>

      {/* Content */}
      <Box sx={{ bgcolor: '#f9fafb', minHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
        {/* Hero */}
        <Box
          sx={{
            height: 300,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#fff',
            textAlign: 'center',
            px: 3,
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Welcome to My Shop
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2.5 }}>
            {settings.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip
              label="⚡ Fast Ship"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            />
            <Chip
              label="💾 Digital"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            />
            <Chip
              label="🪙 BitoDollar Payments"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            />
          </Box>
        </Box>

        {/* Products */}
        <Box sx={{ p: { xs: 3, md: 5 }, maxWidth: 1200, mx: 'auto' }}>
          <Typography variant="h5" sx={{ color: '#1f2937', fontWeight: 700, mb: 3 }}>
            Featured Products
          </Typography>
          <Grid container spacing={3}>
            {activeProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: 3,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 48,
                    }}
                  >
                    {product.icon}
                  </Box>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ color: '#1f2937', fontWeight: 600, mb: 1 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700 }}>
                      B${product.price.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Dialog>
  );
}
