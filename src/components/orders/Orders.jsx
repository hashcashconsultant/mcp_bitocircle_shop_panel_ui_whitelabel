'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import { StatusChip, Avatar, FilterChips } from '@/components/common';
import { useApp } from '@/context/AppContext';
import OrderDetailModal from '@/components/modals/OrderDetailModal';
import { WHITELABEL, communityUrl } from '@/config/whitelabel';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';

const orderFilters = [
  { value: 'ALL', label: 'All' },
  { value: 'PROCESSING', label: 'Unfulfilled' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const dateRangeOptions = [
  { value: 'TODAY', label: 'Today' },
  { value: '7DAYS', label: 'Last 7 days' },
  { value: '30DAYS', label: 'Last 30 days' },
  { value: '90DAYS', label: 'Last 90 days' },
];

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Helper function to get date range
const getDateRange = (rangeCode) => {
  const today = new Date();
  const dateTo = today.toISOString().split('T')[0];
  let dateFrom = new Date();

  switch (rangeCode) {
    case 'TODAY':
      dateFrom = today;
      break;
    case '7DAYS':
      dateFrom.setDate(today.getDate() - 7);
      break;
    case '30DAYS':
      dateFrom.setDate(today.getDate() - 30);
      break;
    case '90DAYS':
      dateFrom.setDate(today.getDate() - 90);
      break;
    default:
      dateFrom.setDate(today.getDate() - 30);
  }

  return { 
    dateFrom: dateFrom.toISOString().split('T')[0], 
    dateTo: today.toISOString().split('T')[0] 
  };
};

// Generate avatar color based on buyer ID
const getAvatarGradient = (buyerId) => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];
  return gradients[Number(buyerId) % gradients.length];
};

// Get initials from name or buyer ID
const getBuyerInitials = (name, buyerId) => {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  const idStr = String(buyerId);
  return `B${idStr.slice(-2)}`;
};

// Get buyer display name from order
const getBuyerName = (order) => {
  if (order.shippingAddress?.fullName) return order.shippingAddress.fullName;
  return `Buyer #${order.buyerId}`;
};

export default function Orders() {
  const router = useRouter();
  const { openOrderDetail, orderDetailOpen, closeOrderDetail, selectedOrder } = useApp();
  
  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('30DAYS');
  const [shopOwnerId, setShopOwnerId] = useState('');

  // Initialize shopOwnerId on client side only
  useEffect(() => {
    const savedShopOwnerId = localStorage.getItem('shopOwnerId');
    if (savedShopOwnerId) {
      setShopOwnerId(savedShopOwnerId);
    }
  }, []);
  
  // Fulfillment dialog state
  const [fulfillmentDialog, setFulfillmentDialog] = useState({
    open: false,
    order: null,
    action: '',
  });
  const [fulfillmentForm, setFulfillmentForm] = useState({
    newStatus: '',
    trackingNumber: '',
    carrier: '',
  });
  const [updating, setUpdating] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Stable ID for table keys
  const tableId = useId();

  // Handle message buyer
  const handleMessageBuyer = (e, buyerId) => {
    e.stopPropagation();
    
    if (!buyerId) {
      setSnackbar({
        open: true,
        message: 'Unable to message buyer - user ID not found',
        severity: 'error',
      });
      return;
    }
    
    window.location.href = `${communityUrl(WHITELABEL.communityLinks.messages)}?userId=${buyerId}`;
  };

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!shopOwnerId) return; // wait for the signed-in member's shop id
    if (!shopOwnerId) return;
    setLoading(true);
    try {
      const { dateFrom, dateTo } = getDateRange(dateRange);
      const params = new URLSearchParams({
        shopOwnerId: shopOwnerId,
        dateFrom,
        dateTo,
        rangeCode: dateRange,
        status: orderFilter,
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`${API_BASE_URL}/orders/list?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Remove duplicates by orderId
        const uniqueOrders = [];
        const seenOrderIds = new Set();
        
        result.data.forEach(order => {
          if (!seenOrderIds.has(order.orderId)) {
            seenOrderIds.add(order.orderId);
            uniqueOrders.push(order);
          }
        });
        
        setOrders(uniqueOrders);
      } else {
        setOrders([]);
        if (!result.success) {
          setSnackbar({
            open: true,
            message: result.message || 'Failed to fetch orders',
            severity: 'error',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch orders. Please try again.',
        severity: 'error',
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [shopOwnerId, dateRange, orderFilter, searchQuery]);

  // Fetch orders on mount and when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchOrders();
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(debounceTimer);
  }, [fetchOrders]);

  // Update fulfillment
  const handleUpdateFulfillment = async () => {
    if (!fulfillmentDialog.order) return;

    setUpdating(true);
    try {
      const params = new URLSearchParams({
        orderId: fulfillmentDialog.order.orderId.toString(),
        action: fulfillmentDialog.action,
        updatedBy: shopOwnerId,
      });

      if (fulfillmentForm.newStatus) {
        params.append('newStatus', fulfillmentForm.newStatus);
      }
      if (fulfillmentForm.trackingNumber) {
        params.append('trackingNumber', fulfillmentForm.trackingNumber);
      }
      if (fulfillmentForm.carrier) {
        params.append('carrier', fulfillmentForm.carrier);
      }

      const response = await fetch(
        `${API_BASE_URL}/orders/fulfillment/update?${params.toString()}`,
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
          message: 'Fulfillment updated successfully',
          severity: 'success',
        });
        handleCloseFulfillmentDialog();
        fetchOrders();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update fulfillment',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating fulfillment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update fulfillment. Please try again.',
        severity: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  // Open fulfillment dialog
  const handleOpenFulfillmentDialog = (order, action) => {
    setFulfillmentDialog({
      open: true,
      order,
      action,
    });
    setFulfillmentForm({
      newStatus: action === 'MARK_SHIPPED' ? 'SHIPPED' : order.fulfillment?.status || '',
      trackingNumber: order.fulfillment?.trackingNumber || '',
      carrier: order.fulfillment?.carrier || '',
    });
  };

  // Close fulfillment dialog
  const handleCloseFulfillmentDialog = () => {
    setFulfillmentDialog({
      open: false,
      order: null,
      action: '',
    });
    setFulfillmentForm({
      newStatus: '',
      trackingNumber: '',
      carrier: '',
    });
  };

  // Handle view order details
  const handleViewOrder = (order) => {
    const buyerName = getBuyerName(order);
    const transformedOrder = {
      id: order.orderId,
      orderNumber: order.orderNumber,
      buyer: {
        id: order.buyerId,
        name: buyerName,
        handle: `@buyer${order.buyerId}`,
        initials: getBuyerInitials(buyerName, order.buyerId),
        avatarColor: getAvatarGradient(order.buyerId),
      },
      date: formatDate(order.createdAt),
      total: order.totalAmount,
      currency: order.currency,
      fulfillmentStatus: order.fulfillmentStatus?.toLowerCase() || 'pending',
      payoutStatus: order.paymentStatus?.toLowerCase() || 'pending',
      orderStatus: order.orderStatus,
      shippingAddress: order.shippingAddress,
      note: order.note,
      items: order.items,
      payment: order.payment,
      fulfillment: order.fulfillment,
      rawData: order,
    };
    openOrderDetail(transformedOrder);
  };

  // Action buttons - View and Message
  const getActionButtons = (order) => {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <Tooltip title={`Message ${getBuyerName(order)}`}>
          <IconButton
            size="small"
            onClick={(e) => handleMessageBuyer(e, order.buyerId)}
            sx={{
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(59, 130, 246, 0.2)',
              },
            }}
          >
            <MessageIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
          </IconButton>
        </Tooltip>
        
        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleViewOrder(order);
          }}
          sx={{ color: '#60a5fa', textTransform: 'none', fontSize: '0.75rem' }}
        >
          View
        </Button>
      </Box>
    );
  };

  // Get dialog title based on action
  const getDialogTitle = () => {
    switch (fulfillmentDialog.action) {
      case 'MARK_SHIPPED':
        return 'Mark Order as Shipped';
      case 'UPDATE_TRACKING':
        return 'Update Tracking Information';
      case 'UPDATE_STATUS':
        return 'Update Fulfillment Status';
      default:
        return 'Update Order';
    }
  };

  // Render table rows without hydration issues
  const renderTableRows = () => {
    if (loading) {
      return [...Array(5)].map((_, index) => (
        <TableRow key={`${tableId}-skeleton-${index}`}>
          <TableCell><Skeleton variant="text" width={100} /></TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="text" width={80} />
            </Box>
          </TableCell>
          <TableCell><Skeleton variant="text" width={80} /></TableCell>
          <TableCell><Skeleton variant="text" width={60} /></TableCell>
          <TableCell><Skeleton variant="rounded" width={70} height={24} /></TableCell>
          <TableCell><Skeleton variant="rounded" width={70} height={24} /></TableCell>
          <TableCell><Skeleton variant="rounded" width={100} height={30} /></TableCell>
        </TableRow>
      ));
    }

    if (orders.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              No orders found
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              Try adjusting your search or filters
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return orders.map((order) => {
      const buyerName = getBuyerName(order);
      return (
        <TableRow
          key={`${tableId}-order-${order.orderId}`}
          onClick={() => handleViewOrder(order)}
          sx={{
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' },
          }}
        >
          <TableCell sx={{ fontWeight: 600 }}>#{order.orderNumber}</TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                initials={getBuyerInitials(buyerName, order.buyerId)}
                gradient={getAvatarGradient(order.buyerId)}
                size={24}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {buyerName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                  ID: {order.buyerId}
                </Typography>
              </Box>
            </Box>
          </TableCell>
          <TableCell sx={{ color: 'text.secondary' }}>
            {formatDate(order.createdAt)}
          </TableCell>
          <TableCell sx={{ color: '#22c55e', fontWeight: 600 }}>
            {order.currency} {order.totalAmount.toFixed(2)}
          </TableCell>
          <TableCell>
            <StatusChip status={order.fulfillmentStatus?.toLowerCase() || 'pending'} />
          </TableCell>
          <TableCell>
            <StatusChip status={order.paymentStatus?.toLowerCase() || 'pending'} />
          </TableCell>
          <TableCell>{getActionButtons(order)}</TableCell>
        </TableRow>
      );
    });
  };

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
          Orders
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
          >
            {dateRangeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Search & Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search order # or buyer name..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, maxWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
              </InputAdornment>
            ),
          }}
        />
        <FilterChips
          filters={orderFilters}
          activeFilter={orderFilter}
          onFilterChange={setOrderFilter}
        />
      </Box>

      {/* Orders Table */}
      <TableContainer
        component={Paper}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 4,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                Order ID
              </TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                Buyer
              </TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                Date
              </TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                Total
              </TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                Fulfillment
              </TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                Payment
              </TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderTableRows()}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Fulfillment Update Dialog */}
      <Dialog
        open={fulfillmentDialog.open}
        onClose={handleCloseFulfillmentDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1a1a2e',
            backgroundImage: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {getDialogTitle()}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {fulfillmentDialog.order && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Order: <strong>#{fulfillmentDialog.order.orderNumber}</strong>
              </Typography>
            )}

            {fulfillmentDialog.action === 'UPDATE_STATUS' && (
              <FormControl fullWidth size="small">
                <Typography variant="caption" sx={{ mb: 0.5, color: 'rgba(255,255,255,0.7)' }}>
                  New Status
                </Typography>
                <Select
                  value={fulfillmentForm.newStatus}
                  onChange={(e) =>
                    setFulfillmentForm((prev) => ({ ...prev, newStatus: e.target.value }))
                  }
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="SHIPPED">Shipped</MenuItem>
                  <MenuItem value="DELIVERED">Delivered</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            )}

            <TextField
              label="Tracking Number"
              size="small"
              fullWidth
              value={fulfillmentForm.trackingNumber}
              onChange={(e) =>
                setFulfillmentForm((prev) => ({ ...prev, trackingNumber: e.target.value }))
              }
              placeholder="e.g., TRK-123456789"
            />

            <TextField
              label="Carrier"
              size="small"
              fullWidth
              value={fulfillmentForm.carrier}
              onChange={(e) =>
                setFulfillmentForm((prev) => ({ ...prev, carrier: e.target.value }))
              }
              placeholder="e.g., FedEx, UPS, USPS"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button
            onClick={handleCloseFulfillmentDialog}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateFulfillment}
            disabled={updating}
            sx={{
              bgcolor: '#22c55e',
              '&:hover': { bgcolor: '#16a34a' },
            }}
          >
            {updating ? <CircularProgress size={20} color="inherit" /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={orderDetailOpen}
        onClose={closeOrderDetail}
        order={selectedOrder}
        refreshOrders={fetchOrders}
      />
    </Box>
  );
}