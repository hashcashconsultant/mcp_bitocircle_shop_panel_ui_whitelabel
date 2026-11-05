'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RefreshIcon from '@mui/icons-material/Refresh';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Get default date range (last 30 days)
const getDefaultDateRange = () => {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);
  return {
    fromDate: formatDate(fromDate),
    toDate: formatDate(toDate),
  };
};

// Funnel color mapping
const getFunnelColor = (stepName) => {
  const colors = {
    VISITS: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    ADD_TO_CART: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    PURCHASES: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  };
  return colors[stepName] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
};

// Funnel width mapping based on step
const getFunnelWidth = (stepName) => {
  const widths = {
    VISITS: 100,
    ADD_TO_CART: 70,
    PURCHASES: 45,
  };
  return widths[stepName] || 100;
};

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [shopOwnerId, setShopOwnerId] = useState(''); // Empty until read from the signed-in session

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShopOwnerId(localStorage.getItem('shopOwnerId') || '');
    }
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    if (!shopOwnerId) return;
    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}/merchandiseanalytics?shopOwnerId=${shopOwnerId}&fromDate=${dateRange.fromDate}&toDate=${dateRange.toDate}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.data) {
        setAnalyticsData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch analytics data');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  }, [shopOwnerId, dateRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilter = () => {
    fetchAnalyticsData();
  };

  // Transform KPI data for display
  const getKPICards = () => {
    if (!analyticsData?.kpiSummary?.[0]) return [];

    const kpi = analyticsData.kpiSummary[0];
    return [
      { label: 'Shop Visits', value: kpi.shopVisits.toLocaleString(), change: 0, isPositive: true },
      { label: 'Product Views', value: kpi.productViews.toLocaleString(), change: 0, isPositive: true },
      { label: 'Cart Adds', value: kpi.cartAdds.toLocaleString(), change: 0, isPositive: true },
      { label: 'Purchases', value: kpi.purchases.toLocaleString(), change: 0, isPositive: true },
      { label: 'Revenue', value: `B$${kpi.revenue.toLocaleString()}`, change: 0, isPositive: true },
    ];
  };

  // Loading skeleton component
  const KPISkeleton = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[1, 2, 3, 4, 5].map((item) => (
        <Grid item xs={6} sm={4} md={2.4} key={item}>
          <Card>
            <CardContent sx={{ py: 2.5, textAlign: 'center' }}>
              <Skeleton variant="text" width="60%" sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width="40%" height={40} sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width="30%" sx={{ mx: 'auto' }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const kpiCards = getKPICards();

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Analytics
        </Typography>

        {/* Date Range Filter */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            type="date"
            label="From Date"
            value={dateRange.fromDate}
            onChange={(e) => handleDateChange('fromDate', e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          />
          <TextField
            type="date"
            label="To Date"
            value={dateRange.toDate}
            onChange={(e) => handleDateChange('toDate', e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleApplyFilter}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Apply
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      {loading ? (
        <KPISkeleton />
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {kpiCards.map((kpi) => (
            <Grid item xs={6} sm={4} md={2.4} key={kpi.label}>
              <Card
                sx={{
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                <CardContent sx={{ py: 2.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                  >
                    {kpi.label}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {kpi.value}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      color: kpi.isPositive ? '#22c55e' : '#ef4444',
                    }}
                  >
                    {kpi.isPositive ? (
                      <TrendingUpIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <TrendingDownIcon sx={{ fontSize: 16 }} />
                    )}
                    <Typography variant="caption">
                      {kpi.isPositive ? '+' : '-'}
                      {Math.abs(kpi.change)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={2.5}>
        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>
                Top Products
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Skeleton key={item} variant="rounded" height={48} />
                  ))}
                </Box>
              ) : analyticsData?.topProducts && analyticsData.topProducts.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {analyticsData.topProducts.map((product, index) => (
                    <Box
                      key={product.productName || index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.5,
                        bgcolor: 'rgba(255,255,255,0.02)',
                        borderRadius: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="body2">{product.productName}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Qty: {product.quantity}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 600 }}>
                        B${product.revenue.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 200,
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body2">No product data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Traffic Sources */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>
                Top Traffic Sources
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Skeleton key={item} variant="rounded" height={48} />
                  ))}
                </Box>
              ) : analyticsData?.trafficSources && analyticsData.trafficSources.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {analyticsData.trafficSources.map((source, index) => (
                    <Box
                      key={source.sourceName || index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.5,
                        bgcolor: 'rgba(255,255,255,0.02)',
                        borderRadius: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="body2">{source.sourceName}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {source.visits.toLocaleString()} visits
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#60a5fa', fontWeight: 600 }}>
                        {source.percentage}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 200,
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body2">No traffic data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Conversion Funnel */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Conversion Funnel
              </Typography>
              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 2,
                  }}
                >
                  {[100, 70, 45].map((width, index) => (
                    <Skeleton
                      key={index}
                      variant="rounded"
                      width={`${width}%`}
                      height={50}
                      sx={{ maxWidth: 500 }}
                    />
                  ))}
                </Box>
              ) : analyticsData?.funnel && analyticsData.funnel.length > 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 2,
                  }}
                >
                  {analyticsData.funnel.map((step) => (
                    <Box
                      key={step.stepName}
                      sx={{
                        position: 'relative',
                        width: `${getFunnelWidth(step.stepName)}%`,
                        maxWidth: 500,
                      }}
                    >
                      <Box
                        sx={{
                          height: 50,
                          background: getFunnelColor(step.stepName),
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 2.5,
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {step.stepName.replace(/_/g, ' ')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {step.stepValue.toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          right: -60,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'text.secondary',
                        }}
                      >
                        {step.stepPercent}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 200,
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body2">No funnel data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}