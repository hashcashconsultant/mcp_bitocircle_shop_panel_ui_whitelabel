// pages/my-orders.tsx or app/my-orders/page.tsx

'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Rating,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import StarIcon from '@mui/icons-material/Star';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import DownloadIcon from '@mui/icons-material/Download';
import RateReviewIcon from '@mui/icons-material/RateReview';

// Import the review dialog component
import OrderReviewDialog from '../../components/reviews/OrderReviewDialog';
import { signInUrl } from '@/config/whitelabel';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';

// Helper function to format currency
const formatCurrency = (amount, currency = 'USDB') => {
  return `${currency} ${parseFloat(amount || 0).toFixed(2)}`;
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format date short
const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Generate avatar gradient
const getAvatarGradient = (id) => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];
  return gradients[(id || 0) % gradients.length];
};

// Order status configuration - mapped to API status values
const ORDER_STATUS = {
  PLACED: { label: 'Order Placed', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', icon: PendingIcon },
  CONFIRMED: { label: 'Confirmed', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)', icon: CheckCircleIcon },
  PROCESSING: { label: 'Processing', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', icon: InventoryIcon },
  SHIPPED: { label: 'Shipped', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)', icon: LocalShippingIcon },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', icon: LocalShippingIcon },
  DELIVERED: { label: 'Delivered', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)', icon: CheckCircleIcon },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', icon: CancelIcon },
  RETURN_REQUESTED: { label: 'Return Requested', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)', icon: AssignmentReturnIcon },
  RETURN_APPROVED: { label: 'Return Approved', color: '#14b8a6', bgColor: 'rgba(20, 184, 166, 0.1)', icon: AssignmentReturnIcon },
  RETURNED: { label: 'Returned', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)', icon: AssignmentReturnIcon },
  REFUNDED: { label: 'Refunded', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)', icon: PaymentIcon },
};

// Fulfillment status configuration
const FULFILLMENT_STATUS = {
  PENDING: { label: 'Pending', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  PROCESSING: { label: 'Processing', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
  SHIPPED: { label: 'Shipped', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)' },
  DELIVERED: { label: 'Delivered', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
};

// Payment status configuration
const PAYMENT_STATUS = {
  PENDING: { label: 'Pending', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  AUTHORIZED: { label: 'Authorized', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  CAPTURED: { label: 'Captured', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
  FAILED: { label: 'Failed', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  REFUNDED: { label: 'Refunded', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
};

// Custom stepper connector
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 3,
    borderRadius: 1,
  },
  '&.Mui-active .MuiStepConnector-line': {
    borderColor: '#22c55e',
  },
  '&.Mui-completed .MuiStepConnector-line': {
    borderColor: '#22c55e',
  },
}));

// Order tracking steps
const TRACKING_STEPS = [
  { key: 'PLACED', label: 'Order Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export default function MyOrderPage() {
  return (
    <Suspense fallback={<OrdersPageSkeleton />}>
      <OrdersList />
    </Suspense>
  );
}

// Skeleton loader for orders page
function OrdersPageSkeleton() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0f', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={150} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    </Box>
  );
}

function OrdersList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get URL params
  const currentUserId = searchParams.get('userId') || localStorage.getItem('userId') || '';

  // No signed-in user: send the visitor to the community sign-in page (never act as another user).
  useEffect(() => {
    if (!currentUserId) window.location.replace(signInUrl());
  }, [currentUserId]);
  const shopCreatorId = searchParams.get('shopCreatorId');

  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  
  // Order detail state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  
  // Return dialog state
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [selectedItemForReturn, setSelectedItemForReturn] = useState(null);
  
  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Tab options
  const tabOptions = [
    { value: 'ALL', label: 'All Orders' },
    { value: 'PLACED', label: 'Placed' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'RETURNED', label: 'Returns' },
  ];

  // Return reasons
  const returnReasons = [
    { value: 'DEFECTIVE', label: 'Defective or damaged product', icon: '🔧' },
    { value: 'WRONG_ITEM', label: 'Wrong item received', icon: '❌' },
    { value: 'NOT_AS_DESCRIBED', label: 'Item not as described', icon: '📝' },
    { value: 'QUALITY_ISSUE', label: 'Quality not satisfactory', icon: '⭐' },
    { value: 'SIZE_FIT', label: 'Size/fit issue', icon: '📏' },
    { value: 'CHANGED_MIND', label: 'Changed my mind', icon: '🔄' },
    { value: 'BETTER_PRICE', label: 'Better price found elsewhere', icon: '💰' },
    { value: 'ARRIVED_LATE', label: 'Arrived too late', icon: '⏰' },
    { value: 'MISSING_PARTS', label: 'Missing parts or accessories', icon: '📦' },
    { value: 'OTHER', label: 'Other reason', icon: '💬' },
  ];

  // Fetch orders from API
  const fetchOrders = useCallback(async (showRefresh = false) => {
    if (!currentUserId) return;
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/getOrderDetailByBuyerId/${currentUserId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.success && result.data) {
        let fetchedOrders = result.data;
        
        // Filter by status tab
        if (selectedTab !== 'ALL') {
          if (selectedTab === 'RETURNED') {
            fetchedOrders = fetchedOrders.filter(o => 
              ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNED', 'REFUNDED'].includes(o.orderStatus)
            );
          } else {
            fetchedOrders = fetchedOrders.filter(o => o.orderStatus === selectedTab);
          }
        }
        
        // Sort orders
        if (sortBy === 'newest') {
          fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'oldest') {
          fetchedOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortBy === 'amount_high') {
          fetchedOrders.sort((a, b) => b.totalAmount - a.totalAmount);
        } else if (sortBy === 'amount_low') {
          fetchedOrders.sort((a, b) => a.totalAmount - b.totalAmount);
        }
        
        setOrders(fetchedOrders);
      } else {
        setOrders([]);
        setSnackbar({
          open: true,
          message: result.message || 'Failed to load orders',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load orders. Please try again.',
        severity: 'error',
      });
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId, selectedTab, sortBy]);

  // Load orders on mount and when filters change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Open order details
  const handleOpenOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  // Open return dialog
  const handleOpenReturnDialog = (order) => {
    setSelectedOrder(order);
    setReturnDialogOpen(true);
  };

  // Open review dialog
  const handleOpenReviewDialog = (order) => {
    setSelectedOrderForReview(order);
    setReviewDialogOpen(true);
  };

  // Handle review submitted
  const handleReviewSubmitted = (reviewedItem) => {
    // Update the order items to mark as reviewed
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.orderId === selectedOrderForReview?.orderId) {
          return {
            ...order,
            items: order.items.map(item => 
              item.orderItemId === reviewedItem.orderItemId 
                ? { ...item, isReviewed: true, reviewStatus: 'SUBMITTED' }
                : item
            )
          };
        }
        return order;
      })
    );
    
    setSnackbar({
      open: true,
      message: 'Thank you for your review!',
      severity: 'success',
    });
  };

  // Handle return request - using new cancel_return API with flagtype=2
  const handleReturnRequest = async () => {
    if (!returnReason) {
      setSnackbar({
        open: true,
        message: 'Please select a reason for return',
        severity: 'error',
      });
      return;
    }

    if (returnReason === 'OTHER' && !returnDescription) {
      setSnackbar({
        open: true,
        message: 'Please provide a description for your return reason',
        severity: 'error',
      });
      return;
    }

    setReturnLoading(true);
    
    const reasonObj = returnReasons.find(r => r.value === returnReason);
    const reasonLabel = reasonObj ? reasonObj.label : returnReason;
    const fullReason = returnDescription
      ? `${reasonLabel} - ${returnDescription}`
      : reasonLabel;
    
    try {
      const params = new URLSearchParams({
        orderId: selectedOrder.orderId,
        buyerId: currentUserId,
        reason: fullReason,
        updatedBy: currentUserId,
        flagtype: '2',
      });

      const response = await fetch(
        `${API_BASE_URL}/orders/cancel_return?${params.toString()}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message || 'Return request submitted successfully',
          severity: 'success',
        });
        setReturnDialogOpen(false);
        setReturnReason('');
        setReturnDescription('');
        setSelectedItemForReturn(null);
        fetchOrders();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to submit return request',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error requesting return:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit return request',
        severity: 'error',
      });
    } finally {
      setReturnLoading(false);
    }
  };

  // Handle cancel order - using new cancel_return API with flagtype=1
  const handleCancelOrder = async (orderId) => {
    try {
      const params = new URLSearchParams({
        orderId: orderId,
        buyerId: currentUserId,
        reason: 'Cancelled by buyer',
        updatedBy: currentUserId,
        flagtype: '1',
      });

      const response = await fetch(
        `${API_BASE_URL}/orders/cancel_return?${params.toString()}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message || 'Order cancelled successfully',
          severity: 'success',
        });
        setOrderDetailOpen(false);
        fetchOrders();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to cancel order',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to cancel order',
        severity: 'error',
      });
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: `${label} copied to clipboard`,
      severity: 'success',
    });
  };

  // Filter orders by search
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(query) ||
      order.items?.some(item => item.productName?.toLowerCase().includes(query))
    );
  });

  // Get active tracking step
  const getActiveStep = (status) => {
    const stepIndex = TRACKING_STEPS.findIndex(step => step.key === status);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  // Check if order can be cancelled
  const canCancel = (status) => {
    return ['PLACED', 'CONFIRMED', 'PROCESSING'].includes(status);
  };

  // Check if order can be returned
  const canReturn = (status, deliveryDate) => {
    if (status !== 'DELIVERED') return false;
    
    if (deliveryDate) {
      const delivery = new Date(deliveryDate);
      const now = new Date();
      const daysDiff = Math.floor((now - delivery) / (1000 * 60 * 60 * 24));
      return daysDiff <= 30;
    }
    return true;
  };

  // Get order counts for tabs
  const getOrderCount = (tabValue) => {
    if (tabValue === 'ALL') return orders.length;
    if (tabValue === 'RETURNED') {
      return orders.filter(o => 
        ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNED', 'REFUNDED'].includes(o.orderStatus)
      ).length;
    }
    return orders.filter(o => o.orderStatus === tabValue).length;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0f', pb: 6 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            px: 3,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                const params = new URLSearchParams({ userId: currentUserId });
                if (shopCreatorId) params.append('shopCreatorId', shopCreatorId);
                router.push(`/shop?${params.toString()}`);
              }}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Back to Shop
            </Button>
            
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ShoppingBagIcon sx={{ color: '#22c55e', fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                My Orders
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Refresh orders">
              <IconButton
                onClick={() => fetchOrders(true)}
                disabled={refreshing}
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                <RefreshIcon className={refreshing ? 'spinning' : ''} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Need help?">
              <IconButton sx={{ color: 'rgba(255,255,255,0.7)' }}>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
        {/* Search and Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                placeholder="Search orders by ID or product name..."
                size="small"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="newest">Newest First</MenuItem>
                    <MenuItem value="oldest">Oldest First</MenuItem>
                    <MenuItem value="amount_high">Amount: High to Low</MenuItem>
                    <MenuItem value="amount_low">Amount: Low to High</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Status Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.5)',
                minHeight: 48,
                textTransform: 'none',
                '&.Mui-selected': {
                  color: '#22c55e',
                },
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#22c55e',
              },
            }}
          >
            {tabOptions.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.label}
                    <Chip
                      size="small"
                      label={getOrderCount(tab.value)}
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.7)',
                      }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Orders List */}
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={180}
                sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)' }}
              />
            ))}
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingBagIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
              No orders found
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 3 }}>
              {searchQuery 
                ? 'Try adjusting your search query'
                : selectedTab !== 'ALL' 
                  ? 'No orders with this status'
                  : "You haven't placed any orders yet"}
            </Typography>
            <Button
              variant="contained"
              startIcon={<StorefrontIcon />}
              onClick={() => {
                const params = new URLSearchParams({ userId: currentUserId });
                if (shopCreatorId) params.append('shopCreatorId', shopCreatorId);
                router.push(`/shop?${params.toString()}`);
              }}
              sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
            >
              Continue Shopping
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onClick={() => handleOpenOrderDetails(order)}
                onCancel={(orderId) => handleCancelOrder(orderId)}
                onReturn={() => handleOpenReturnDialog(order)}
                onReview={() => handleOpenReviewDialog(order)}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Return Request Dialog */}
      <Dialog
        open={returnDialogOpen}
        onClose={() => {
          setReturnDialogOpen(false);
          setReturnReason('');
          setReturnDescription('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1a1a2e',
            backgroundImage: 'none',
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Request Return</Typography>
          <IconButton onClick={() => setReturnDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Order Info */}
            {selectedOrder && (
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: 'rgba(249, 115, 22, 0.1)',
                    }}
                  >
                    <AssignmentReturnIcon sx={{ color: '#f97316' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Order #{selectedOrder.orderNumber}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      Placed on {formatDate(selectedOrder.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Total: <span style={{ color: '#22c55e', fontWeight: 600 }}>
                    {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                  </span>
                </Typography>
                
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                      Items in this order:
                    </Typography>
                    {selectedOrder.items.slice(0, 3).map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1,
                          bgcolor: 'rgba(255,255,255,0.02)',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <Avatar
                          sx={{ width: 40, height: 40 }}
                          src={item.product?.images?.[0]?.imageUrl}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            {item.productName || item.product?.productName || 'Product'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            Qty: {item.quantity} × {formatCurrency(item.price, selectedOrder.currency)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    {selectedOrder.items.length > 3 && (
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        + {selectedOrder.items.length - 3} more items
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            )}

            {/* Return Reason Selection */}
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                Select reason for return
              </FormLabel>
              <RadioGroup
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              >
                {returnReasons.map((reason) => (
                  <FormControlLabel
                    key={reason.value}
                    value={reason.value}
                    control={
                      <Radio 
                        sx={{ 
                          color: 'rgba(255,255,255,0.5)',
                          '&.Mui-checked': {
                            color: '#f97316',
                          },
                        }} 
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{reason.icon}</span>
                        <Typography variant="body2">{reason.label}</Typography>
                      </Box>
                    }
                    sx={{ 
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.02)',
                        borderRadius: 1,
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {/* Additional Description for "Other" reason */}
            {returnReason === 'OTHER' && (
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Please describe your reason for return..."
                value={returnDescription}
                onChange={(e) => setReturnDescription(e.target.value)}
                sx={{ mt: 2 }}
              />
            )}

            {/* Return Policy Info */}
            <Paper
              sx={{
                p: 2,
                mt: 3,
                bgcolor: 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 600, mb: 1 }}>
                Return Policy
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                • Items must be returned within 7 days of delivery
                <br />
                • Products must be in original condition with tags
                <br />
                • Refund will be processed within 5-7 business days
                {/* <br />
                • Shipping costs are non-refundable */}
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button
            onClick={() => setReturnDialogOpen(false)}
            disabled={returnLoading}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReturnRequest}
            disabled={returnLoading || !returnReason}
            startIcon={returnLoading ? <CircularProgress size={20} /> : <AssignmentReturnIcon />}
            sx={{
              bgcolor: '#f97316',
              '&:hover': { bgcolor: '#ea580c' },
              '&:disabled': { bgcolor: 'rgba(249, 115, 22, 0.5)' },
            }}
          >
            {returnLoading ? 'Submitting...' : 'Submit Return Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <OrderReviewDialog
        open={reviewDialogOpen}
        onClose={() => {
          setReviewDialogOpen(false);
          setSelectedOrderForReview(null);
        }}
        order={selectedOrderForReview}
        userId={currentUserId}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Spinning animation for refresh icon */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Box>
  );
}

// Order Card Component
function OrderCard({ order, onClick, onCancel, onReturn, onReview }) {
  const statusConfig = ORDER_STATUS[order.orderStatus] || {
    label: order.orderStatus,
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    icon: PendingIcon,
  };
  
  const StatusIcon = statusConfig.icon;

  // Get product image - check if images array exists and has items
  const getProductImage = (item) => {
    if (item.product?.images && item.product.images.length > 0) {
      return item.product.images[0].imageUrl;
    }
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'; // Fallback image
  };

  // Get variant display text
  const getVariantText = (item) => {
    if (item.variant) {
      return `${item.variant.variantType}: ${item.variant.variantName}`;
    }
    return null;
  };

  // Check if item has been reviewed
  const isItemReviewed = (item) => {
    return item.reviewStatus === 'SUBMITTED' || item.isReviewed === true;
  };

  // Check if any item can be reviewed (delivered and not reviewed)
  const hasReviewableItems = order.orderStatus === 'DELIVERED' && 
    order.items?.some(item => !isItemReviewed(item));

  return (
    <Card
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          border: '1px solid rgba(34, 197, 94, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Order Header */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: statusConfig.bgColor,
              }}
            >
              <StatusIcon sx={{ color: statusConfig.color, fontSize: 22 }} />
            </Avatar>
            
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  #{order.orderNumber}
                </Typography>
                <Chip
                  label={statusConfig.label}
                  size="small"
                  sx={{
                    bgcolor: statusConfig.bgColor,
                    color: statusConfig.color,
                    fontWeight: 500,
                    fontSize: '0.7rem',
                  }}
                />
                {/* Return Eligible Badge for Delivered Orders - only show if isReturn == 1 */}
                {order.orderStatus === 'DELIVERED' && order.isReturn === 1 && (
                  <Chip
                    icon={<AssignmentReturnIcon sx={{ fontSize: 14 }} />}
                    label="Return Eligible"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(249, 115, 22, 0.1)',
                      color: '#f97316',
                      fontWeight: 500,
                      fontSize: '0.65rem',
                      '& .MuiChip-icon': {
                        color: '#f97316',
                      },
                    }}
                  />
                )}
                {/* Reviewed Badge for orders with all items reviewed */}
                {order.orderStatus === 'DELIVERED' && order.items?.every(item => isItemReviewed(item)) && (
                  <Chip
                    icon={<StarIcon sx={{ fontSize: 14 }} />}
                    label="All Reviewed"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(245, 158, 11, 0.1)',
                      color: '#f59e0b',
                      fontWeight: 500,
                      fontSize: '0.65rem',
                      '& .MuiChip-icon': {
                        color: '#f59e0b',
                      },
                    }}
                  />
                )}
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                {formatDate(order.createdAt)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#22c55e' }}>
              {formatCurrency(order.totalAmount, order.currency)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
            </Typography>
          </Box>
        </Box>

        {/* Order Items Preview */}
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {/* Product Images Preview */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {order.items?.slice(0, 3).map((item, index) => (
                <Box
                  key={index}
                  component="img"
                  src={getProductImage(item)}
                  alt={item.product?.productName || 'Product'}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1.5,
                    objectFit: 'cover',
                    border: '1px solid rgba(255,255,255,0.1)',
                    opacity: isItemReviewed(item) ? 0.7 : 1,
                  }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
                  }}
                />
              ))}
              {order.items?.length > 3 && (
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    +{order.items.length - 3}
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Product Names */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                {order.items?.[0]?.product?.productName || 'Product'}
                {isItemReviewed(order.items?.[0]) && (
                  <Chip
                    label="Reviewed"
                    size="small"
                    icon={<StarIcon sx={{ fontSize: 12 }} />}
                    sx={{ 
                      ml: 1,
                      height: 18, 
                      fontSize: '0.6rem',
                      bgcolor: 'rgba(245, 158, 11, 0.1)',
                      color: '#f59e0b',
                    }}
                  />
                )}
              </Typography>
              {getVariantText(order.items?.[0]) && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>
                  {getVariantText(order.items?.[0])}
                </Typography>
              )}
              {order.items?.length > 1 && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  and {order.items.length - 1} more {order.items.length - 1 === 1 ? 'item' : 'items'}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Status Info */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Payment & Fulfillment Status Row */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<PaymentIcon sx={{ fontSize: 14 }} />}
                label={`Payment: ${PAYMENT_STATUS[order.paymentStatus]?.label || order.paymentStatus}`}
                size="small"
                sx={{
                  bgcolor: PAYMENT_STATUS[order.paymentStatus]?.bgColor,
                  color: PAYMENT_STATUS[order.paymentStatus]?.color,
                  fontSize: '0.7rem',
                  '& .MuiChip-icon': {
                    color: PAYMENT_STATUS[order.paymentStatus]?.color,
                  },
                }}
              />
              <Chip
                icon={<LocalShippingIcon sx={{ fontSize: 14 }} />}
                label={`Fulfillment: ${FULFILLMENT_STATUS[order.fulfillmentStatus]?.label || order.fulfillmentStatus}`}
                size="small"
                sx={{
                  bgcolor: FULFILLMENT_STATUS[order.fulfillmentStatus]?.bgColor,
                  color: FULFILLMENT_STATUS[order.fulfillmentStatus]?.color,
                  fontSize: '0.7rem',
                  '& .MuiChip-icon': {
                    color: FULFILLMENT_STATUS[order.fulfillmentStatus]?.color,
                  },
                }}
              />
            </Box>

            {/* Tracking Number */}
            {order.fulfillment?.trackingNumber && (
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'rgba(34, 197, 94, 0.05)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShippingIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Tracking: <strong style={{ fontFamily: 'monospace' }}>{order.fulfillment.trackingNumber}</strong>
                    {order.fulfillment.carrier && ` via ${order.fulfillment.carrier}`}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            {/* Review Button - for delivered items not reviewed */}
            {hasReviewableItems && onReview && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<RateReviewIcon sx={{ fontSize: 16 }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onReview(order);
                }}
                sx={{
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                  color: '#f59e0b',
                  '&:hover': {
                    borderColor: '#f59e0b',
                    bgcolor: 'rgba(245, 158, 11, 0.1)',
                  },
                }}
              >
                Write a Review
              </Button>
            )}

            {/* Cancel Button - show for orders not yet delivered */}
            {['PLACED', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus) && onCancel && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<CancelIcon sx={{ fontSize: 16 }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(order.orderId);
                }}
                sx={{
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  '&:hover': {
                    borderColor: '#ef4444',
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                  },
                }}
              >
                Cancel Order
              </Button>
            )}
            
            {/* Return Button - only show if order is DELIVERED and isReturn === 1 */}
            {order.orderStatus === 'DELIVERED' && order.isReturn === 1 && onReturn && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<AssignmentReturnIcon sx={{ fontSize: 16 }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onReturn(order);
                }}
                sx={{
                  borderColor: 'rgba(249, 115, 22, 0.3)',
                  color: '#f97316',
                  '&:hover': {
                    borderColor: '#f97316',
                    bgcolor: 'rgba(249, 115, 22, 0.1)',
                  },
                }}
              >
                Return
              </Button>
            )}
            
            {/* Buy Again Button */}
            {order.orderStatus === 'DELIVERED' && (
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle buy again
                }}
                sx={{
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  color: '#60a5fa',
                  '&:hover': {
                    borderColor: '#60a5fa',
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                  },
                }}
              >
                Buy Again
              </Button>
            )}
          </Box>

          {/* Review Progress Indicator */}
          {order.orderStatus === 'DELIVERED' && order.items?.length > 0 && (
            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Reviews:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {order.items.map((item, idx) => {
                  const reviewed = isItemReviewed(item);
                  return (
                    <Tooltip 
                      key={idx}
                      title={reviewed ? 'Already reviewed' : 'Not reviewed yet'}
                    >
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: reviewed ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {reviewed ? (
                          <StarIcon sx={{ fontSize: 12, color: '#fff' }} />
                        ) : (
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)' }}>
                            {idx + 1}
                          </Typography>
                        )}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}