'use client';

import { useState, useEffect, useId } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MessageIcon from '@mui/icons-material/Message';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { StatusChip, Avatar } from '@/components/common';
import { useApp } from '@/context/AppContext';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';

const orderSteps = [
  'Order Placed', 
  'Payment Captured', 
  'Shipped', 
  'Delivered', 
  'Payout Released',
  'Cancelled',
  'Returned'
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

// Get active step from API's orderTimeline field (1-5)
const getActiveStep = (order) => {
  if (!order) return 0;
  const orderData = order.rawData || order;
  
  // Check for cancelled status first
  const fulfillmentStatus = (orderData.fulfillmentStatus || orderData.fulfillment?.status || '').toUpperCase();
  if (fulfillmentStatus === 'CANCELLED') {
    return 5; // Step index 5 corresponds to 'Cancelled' in orderSteps
  }
  
  // Check for returned/disputed status
  const timeline = orderData.orderTimeline;
  const isDisputed = timeline === 6;
  const isReturned = timeline === 7 || !!orderData.returnReason;
  
  if (isDisputed || isReturned) {
    return 6; // Step index 6 corresponds to 'Returned' in orderSteps
  }
  
  // API returns orderTimeline: 1=Placed, 2=Payment Captured, 3=Shipped, 4=Delivered, 5=Payout Released
  if (timeline != null) {
    // Map API timeline to stepper steps (1-based to 0-based)
    return Math.min(timeline - 1, 4);
  }
  
  // Fallback for older data without orderTimeline
  const paymentStatus = (orderData.paymentStatus || orderData.payment?.paymentStatus || '').toUpperCase();
  if (paymentStatus === 'RELEASED') return 4;
  if (fulfillmentStatus === 'DELIVERED') return 3;
  if (fulfillmentStatus === 'SHIPPED') return 2;
  if (paymentStatus === 'AUTHORIZED' || paymentStatus === 'CAPTURED') return 1;
  return 0;
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

export default function OrderDetailModal({ open, onClose, order, refreshOrders }) {
  const { showToast } = useApp();
  const modalId = useId();
  
  const orderData = order?.rawData || order;
  const fulfillment = orderData?.fulfillment || order?.fulfillment || {};
  
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [customCarrier, setCustomCarrier] = useState('');
  const [shipDate, setShipDate] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (order) {
      const data = order.rawData || order;
      const fulfillmentData = data?.fulfillment || order?.fulfillment || {};
      setTrackingNumber('');
      setCarrier(fulfillmentData.carrier || '');
      setCustomCarrier('');
      setShipDate(fulfillmentData.shipDate || '');
    }
  }, [order]);

  if (!order) return null;

  // ─── Derive statuses (check all possible sources) ───
  const fulfillmentStatus = (
    orderData?.fulfillmentStatus || 
    orderData?.fulfillment?.status || 
    order?.fulfillmentStatus || 
    order?.fulfillment?.status || 
    'PENDING'
  ).toUpperCase();
  
  const paymentStatus = (
    orderData?.paymentStatus || 
    orderData?.payment?.paymentStatus || 
    order?.paymentStatus || 
    order?.payment?.paymentStatus || 
    'PENDING'
  ).toUpperCase();
  
  const activeStep = getActiveStep(order);

  const buyerId = orderData?.buyerId || order?.buyer?.id;
  const buyerName = orderData?.shippingAddress?.fullName || order?.buyer?.name || `Buyer #${buyerId}`;
  const buyerPhone = orderData?.shippingAddress?.phone || '';

  // ─── Sequential fulfillment lifecycle flags ───
  // Primary: use orderTimeline from API (1=Placed, 2=Captured, 3=Shipped, 4=Delivered, 5=Released, 6=Disputed, 7=Return Requested)
  // Fallback: check fulfillmentStatus string
  const timeline = orderData?.orderTimeline;

  const isPending = timeline != null 
    ? (timeline === 1 || timeline === 2) 
    : (fulfillmentStatus === 'PENDING' || fulfillmentStatus === 'PROCESSING');
  const isShipped = timeline != null 
    ? timeline === 3 
    : fulfillmentStatus === 'SHIPPED';
  const isDelivered = timeline != null 
    ? timeline === 4 
    : fulfillmentStatus === 'DELIVERED';
  const isCancelled = fulfillmentStatus === 'CANCELLED';
  const isPayoutReleased = timeline != null 
    ? timeline === 5 
    : paymentStatus === 'RELEASED';

  // NEW: Check if orderTimeline == 7 (Return Requested)
  const isReturnRequestedTimeline = timeline === 7;

  // NEW: Check if orderTimeline == 6 (Disputed / Refund flow)
  const isDisputed = timeline === 6;

  // Return flow: buyer filed a return (returnReason exists)
  const isReturnRequested = !!(orderData?.returnReason);
  // Pickup completed: returnBy is populated (seller confirmed pickup)
  const isPickupCompleted = !!(orderData?.returnBy);

  // ─── Handlers ───

  const handleMessageBuyer = () => {
    if (!buyerId) {
      showToast('Unable to message buyer - user ID not found', 'error');
      return;
    }
    onClose();
    window.location.href = `https://bitocircle.com/messages?userId=${buyerId}`;
  };

  const getEffectiveCarrier = () => {
    if (carrier === 'Other') return customCarrier.trim() || '';
    return carrier;
  };

  // Mark as Shipped
  const handleMarkShipped = async () => {
    setUpdating(true);
    try {
      const params = new URLSearchParams({
        orderId: (orderData?.orderId || order?.id).toString(),
        action: 'MARK_SHIPPED',
        newStatus: 'SHIPPED',
        updatedBy: (orderData?.buyerId || order?.buyer?.id || 0).toString(),
      });

      if (trackingNumber.trim()) params.append('trackingNumber', trackingNumber.trim());
      const effectiveCarrier = getEffectiveCarrier();
      if (effectiveCarrier) params.append('carrier', effectiveCarrier);

      const response = await fetch(
        `${API_BASE_URL}/orders/fulfillment/update?${params.toString()}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      );
      const result = await response.json();

      if (result.success) {
        showToast('Order marked as shipped successfully!', 'success');
        setTrackingNumber('');
        setCarrier('');
        setCustomCarrier('');
        setShipDate('');
        if (refreshOrders) refreshOrders();
        onClose();
      } else {
        showToast(result.message || 'Failed to update order', 'error');
      }
    } catch (error) {
      console.error('Error marking order as shipped:', error);
      showToast('Failed to update order. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Mark as Delivered
  const handleMarkDelivered = async () => {
    setUpdating(true);
    try {
      const params = new URLSearchParams({
        orderId: (orderData?.orderId || order?.id).toString(),
        action: 'MARK_AS_DELIVERED',
        newStatus: 'DELIVERED',
        updatedBy: (orderData?.buyerId || order?.buyer?.id || 0).toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/orders/fulfillment/update?${params.toString()}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      );
      const result = await response.json();

      if (result.success) {
        showToast('Order marked as delivered!', 'success');
        if (refreshOrders) refreshOrders();
        onClose();
      } else {
        showToast(result.message || 'Failed to update order', 'error');
      }
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      showToast('Failed to update order. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // NEW: Mark for Order Pickup (when orderTimeline == 7)
  const handleMarkReturnApproved = async () => {
    setUpdating(true);
    try {
      const params = new URLSearchParams({
        orderId: (orderData?.orderId || order?.id).toString(),
        action: 'MARK_AS_RETRUN_APPROVED',
        updatedBy: (orderData?.buyerId || order?.buyer?.id || 0).toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/orders/fulfillment/update?${params.toString()}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      );
      const result = await response.json();

      if (result.success) {
        showToast('Order marked for pickup successfully!', 'success');
        if (refreshOrders) refreshOrders();
        onClose();
      } else {
        showToast(result.message || 'Failed to mark order for pickup', 'error');
      }
    } catch (error) {
      console.error('Error marking order for pickup:', error);
      showToast('Failed to mark order for pickup. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Mark for Pickup (old handler - keeping for compatibility)
  const handleMarkForPickup = async () => {
    setUpdating(true);
    try {
      const params = new URLSearchParams({
        orderId: (orderData?.orderId || order?.id).toString(),
        action: 'MARK_PICKUP',
        updatedBy: (orderData?.buyerId || order?.buyer?.id || 0).toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/orders/fulfillment/update?${params.toString()}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      );
      const result = await response.json();

      if (result.success) {
        showToast('Order marked for pickup!', 'success');
        if (refreshOrders) refreshOrders();
        onClose();
      } else {
        showToast(result.message || 'Failed to mark for pickup', 'error');
      }
    } catch (error) {
      console.error('Error marking for pickup:', error);
      showToast('Failed to mark for pickup. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Release Payment
  const handleReleasePayment = async () => {
    setUpdating(true);
    try {
      const params = new URLSearchParams({
        orderId: (orderData?.orderId || order?.id).toString(),
        action: 'RELEASE_PAYMENT',
        updatedBy: (orderData?.buyerId || order?.buyer?.id || 0).toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/orders/fulfillment/update?${params.toString()}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      );
      const result = await response.json();

      if (result.success) {
        showToast('Payment released successfully!', 'success');
        if (refreshOrders) refreshOrders();
        onClose();
      } else {
        showToast(result.message || 'Failed to release payment', 'error');
      }
    } catch (error) {
      console.error('Error releasing payment:', error);
      showToast('Failed to release payment. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // ═══ NEW: Refund Amount (orderTimeline === 6 / DISPUTED) ═══
  const handleRefundAmount = async () => {
    setUpdating(true);
    try {
      // Get required parameters
      const shopOwnerId = localStorage.getItem('shopOwnerId') || '3357';
      const buyerId = orderData?.buyerId || order?.buyer?.id;
      const orderId = (orderData?.orderId || order?.id).toString();

      if (!buyerId) {
        showToast('Unable to process refund - buyer ID not found', 'error');
        setUpdating(false);
        return;
      }

      // Construct the refund API URL
      const refundUrl = `${API_BASE_URL}/orders/refund?shopOwnerId=${shopOwnerId}&buyerId=${buyerId}&orderId=${orderId}`;

      // Make POST request to refund API
      const response = await fetch(refundUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message || 'Refund completed successfully!', 'success');
        if (refreshOrders) refreshOrders();
        onClose();
      } else {
        showToast(result.message || 'Failed to process refund', 'error');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      showToast('Failed to process refund. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Update Tracking
  const handleUpdateTracking = async () => {
    if (!trackingNumber.trim() && !carrier) {
      showToast('Please enter tracking number or carrier', 'warning');
      return;
    }

    setUpdating(true);
    try {
      const params = new URLSearchParams({
        orderId: (orderData?.orderId || order?.id).toString(),
        action: 'UPDATE_TRACKING',
        updatedBy: (orderData?.buyerId || order?.buyer?.id || 0).toString(),
      });

      if (trackingNumber.trim()) params.append('trackingNumber', trackingNumber.trim());
      const effectiveCarrier = getEffectiveCarrier();
      if (effectiveCarrier) params.append('carrier', effectiveCarrier);

      const response = await fetch(
        `${API_BASE_URL}/orders/fulfillment/update?${params.toString()}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      );
      const result = await response.json();

      if (result.success) {
        showToast('Tracking information updated!', 'success');
        if (refreshOrders) refreshOrders();
      } else {
        showToast(result.message || 'Failed to update tracking', 'error');
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
      showToast('Failed to update tracking. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // ─── Derived data ───
  const buyer = order?.buyer || {
    handle: `@buyer${orderData?.buyerId}`,
    initials: getBuyerInitials(buyerName, orderData?.buyerId),
    avatarColor: getAvatarGradient(orderData?.buyerId),
    name: buyerName,
  };

  const items = orderData?.items || order?.items || [];
  const payment = orderData?.payment || order?.payment || {};

  // ─── Reusable carrier select ───
  const renderCarrierFields = (labelPrefix = '') => (
    <>
      <FormControl size="small" fullWidth>
        <InputLabel>{labelPrefix ? `${labelPrefix} ` : ''}Carrier</InputLabel>
        <Select
          label={`${labelPrefix ? `${labelPrefix} ` : ''}Carrier`}
          value={carrier}
          onChange={(e) => {
            setCarrier(e.target.value);
            if (e.target.value !== 'Other') setCustomCarrier('');
          }}
        >
          <MenuItem value="">Select Carrier</MenuItem>
          <MenuItem value="USPS">USPS</MenuItem>
          <MenuItem value="FedEx">FedEx</MenuItem>
          <MenuItem value="UPS">UPS</MenuItem>
          <MenuItem value="DHL">DHL</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </Select>
      </FormControl>
      {carrier === 'Other' && (
        <TextField
          label="Carrier Name"
          fullWidth
          size="small"
          placeholder="Enter carrier name"
          value={customCarrier}
          onChange={(e) => setCustomCarrier(e.target.value)}
        />
      )}
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1a1a2e',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          '& .MuiTypography-root': { margin: 0 },
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Order Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* ════════════════════ Order Information ════════════════════ */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Order Information
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Order Number:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              #{orderData?.orderNumber || order?.orderNumber}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Order Status:</Typography>
            <StatusChip status={orderData?.orderStatus?.toLowerCase() || 'placed'} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Fulfillment:</Typography>
            <StatusChip status={fulfillmentStatus.toLowerCase()} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Payment:</Typography>
            <StatusChip status={paymentStatus.toLowerCase()} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Date:</Typography>
            <Typography variant="body2">
              {formatDate(orderData?.createdAt) || order?.date}
            </Typography>
          </Box>
          {orderData?.note && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Note:</Typography>
              <Typography variant="body2" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                {orderData.note}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ════════════════════ Buyer Information ════════════════════ */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Buyer Information
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            initials={getBuyerInitials(buyerName, buyerId)}
            gradient={buyer.avatarColor || getAvatarGradient(buyerId)}
            size={48}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {buyerName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Buyer ID: {buyerId}
            </Typography>
            {buyerPhone && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Phone: {buyerPhone}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={handleMessageBuyer}
            sx={{
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' },
            }}
            title="Message Buyer"
          >
            <MessageIcon sx={{ color: '#3b82f6' }} />
          </IconButton>
        </Box>

        {orderData?.shippingAddress && (
          <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2, mb: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              Shipping Address:
            </Typography>
            <Typography variant="body2">
              {typeof orderData.shippingAddress === 'string'
                ? orderData.shippingAddress
                : (
                  <>
                    {orderData.shippingAddress.fullName && (
                      <><strong>{orderData.shippingAddress.fullName}</strong><br /></>
                    )}
                    {orderData.shippingAddress.line1}<br />
                    {orderData.shippingAddress.line2 && <>{orderData.shippingAddress.line2}<br /></>}
                    {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.postalCode}<br />
                    {orderData.shippingAddress.country}
                    {orderData.shippingAddress.phone && (
                      <><br />📞 {orderData.shippingAddress.phone}</>
                    )}
                  </>
                )
              }
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* ════════════════════ Line Items with Product Images ════════════════════ */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Line Items
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          {items.map((item, index) => {
            const productImage = item.product?.images?.[0]?.imageUrl;
            const productName = item.product?.productName || item.productName || `Product #${item.productId}`;
            const productDescription = item.product?.description;

            return (
              <Box
                key={`${modalId}-item-${index}-${item.orderItemId || item.productId}`}
                sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  {/* Product Image */}
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      flexShrink: 0,
                      bgcolor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {productImage ? (
                      <Box
                        component="img"
                        src={productImage}
                        alt={productName}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <InventoryIcon sx={{ fontSize: 28, color: 'rgba(255,255,255,0.2)' }} />
                      </Box>
                    )}
                  </Box>

                  {/* Product Details */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {productName}
                    </Typography>
                    {productDescription && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255,255,255,0.5)',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {productDescription}
                      </Typography>
                    )}
                    {(item.variant || item.variantId) && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {typeof item.variant === 'object'
                          ? `${item.variant.variantType}: ${item.variant.variantName}`
                          : item.variant || `Variant #${item.variantId}`}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Qty: {item.quantity} × {orderData?.currency || 'B$'} {item.price?.toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Price */}
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#22c55e', flexShrink: 0 }}>
                    {orderData?.currency || 'B$'} {(item.totalPrice || item.price * item.quantity)?.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            );
          })}

          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>Total:</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#22c55e' }}>
              {orderData?.currency || 'B$'} {(orderData?.totalAmount || order?.total)?.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ════════════════════ Payment ════════════════════ */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Payment
        </Typography>
        <Box sx={{ p: 1.5, bgcolor: 'rgba(96, 165, 250, 0.1)', borderRadius: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Payment Method:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {payment.paymentMethod || 'BitoDollars'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Status:</Typography>
            <StatusChip status={paymentStatus.toLowerCase()} />
          </Box>
          {payment.transactionId && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Transaction ID:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {payment.transactionId}
              </Typography>
            </Box>
          )}
          <Typography variant="caption" sx={{ color: '#60a5fa', display: 'block', mt: 1 }}>
            {paymentStatus === 'AUTHORIZED' || paymentStatus === 'HELD'
              ? 'Held in escrow until delivery'
              : paymentStatus === 'RELEASED'
                ? 'Released to wallet'
                : paymentStatus === 'REFUND_INITIATED'
                  ? 'Refund has been initiated'
                  : `Status: ${paymentStatus}`
            }
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ════════════════════ Fulfillment Actions ════════════════════
        
            Sequential flow:
            ┌──────────┐    ┌──────────┐    ┌───────────┐    ┌─────────────────┐    ┌─────────────┐    ┌─────────────────┐
            │ PENDING  │ →  │ SHIPPED  │ →  │ DELIVERED │ →  │ TIMELINE == 7   │ →  │ PICKUP DONE │ →  │ RELEASE PAYMENT │
            │          │    │          │    │           │    │ Mark for Pickup │    │             │    │                 │
            │ Mark as  │    │ Mark as  │    │           │    │                 │    │             │    │                 │
            │ Shipped  │    │ Delivered│    │           │    │                 │    │             │    │                 │
            └──────────┘    └──────────┘    └───────────┘    └─────────────────┘    └─────────────┘    └─────────────────┘
                                                             ┌─────────────────┐
                                                             │ TIMELINE == 6   │
                                                             │ (DISPUTED)      │
                                                             │ Refund Amount   │
                                                             └─────────────────┘
        
        ═══════════════════════════════════════════════════════════════════ */}
        
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Fulfillment
        </Typography>

        {/* Existing tracking info */}
        {fulfillment.trackingNumber && (
          <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tracking Number:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{fulfillment.trackingNumber}</Typography>
            </Box>
            {fulfillment.carrier && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Carrier:</Typography>
                <Typography variant="body2">{fulfillment.carrier}</Typography>
              </Box>
            )}
            {fulfillment.shipDate && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Ship Date:</Typography>
                <Typography variant="body2">{formatDate(fulfillment.shipDate)}</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Return info banner - show when timeline == 7 */}
        {isReturnRequestedTimeline && (
          <Box sx={{
            p: 1.5,
            bgcolor: 'rgba(251, 146, 60, 0.1)',
            borderRadius: 2,
            mb: 2,
            border: '1px solid rgba(251, 146, 60, 0.2)',
          }}>
            <Typography variant="caption" sx={{ color: '#fb923c', fontWeight: 600, display: 'block', mb: 0.5 }}>
              🔄 Return Requested
            </Typography>
            {orderData?.returnReason && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Reason: {orderData.returnReason}
              </Typography>
            )}
          </Box>
        )}

        {/* ═══ NEW: Disputed info banner - show when timeline == 6 ═══ */}
        {isDisputed && (
          <Box sx={{
            p: 1.5,
            bgcolor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: 2,
            mb: 2,
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}>
            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, display: 'block', mb: 0.5 }}>
              ⚠️ Order Disputed
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              This order has been disputed. Payment status: {paymentStatus.replace(/_/g, ' ').toLowerCase()}.
            </Typography>
            {orderData?.returnReason && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                Reason: {orderData.returnReason}
              </Typography>
            )}
          </Box>
        )}

        {/* ─── Step 1: PENDING → Mark as Shipped ─── */}
        {isPending && (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <TextField
                label="Tracking Number"
                fullWidth
                size="small"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
              {renderCarrierFields()}
              <TextField
                label="Ship Date"
                fullWidth
                size="small"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={shipDate}
                onChange={(e) => setShipDate(e.target.value)}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              startIcon={<LocalShippingIcon />}
              onClick={handleMarkShipped}
              disabled={updating}
              sx={{
                mb: 2,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' },
                '&:disabled': { background: 'rgba(34, 197, 94, 0.5)' },
              }}
            >
              {updating ? <CircularProgress size={20} color="inherit" /> : '📦 Mark as Shipped'}
            </Button>
          </>
        )}

        {/* ─── Step 2: SHIPPED → Mark as Delivered ─── */}
        {isShipped && (
          <>
            {/* Disabled shipped badge */}
            <Button
              fullWidth
              variant="contained"
              startIcon={<CheckCircleIcon />}
              disabled
              sx={{
                mb: 1.5,
                '&.Mui-disabled': {
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: 'rgba(255,255,255,0.4)',
                },
              }}
            >
              ✅ Marked as Shipped
            </Button>

            {/* Active: Mark as Delivered */}
            <Button
              fullWidth
              variant="contained"
              startIcon={<LocalShippingIcon />}
              onClick={handleMarkDelivered}
              disabled={updating}
              sx={{
                mb: 2,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' },
                '&:disabled': { background: 'rgba(139, 92, 246, 0.5)' },
              }}
            >
              {updating ? <CircularProgress size={20} color="inherit" /> : '📬 Mark as Delivered'}
            </Button>

            {/* Update Tracking */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2, mt: 1 }}>
              <TextField
                label="Update Tracking Number"
                fullWidth
                size="small"
                placeholder={fulfillment.trackingNumber || 'Enter tracking number'}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
              {renderCarrierFields('Update')}
            </Box>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleUpdateTracking}
              disabled={updating}
              sx={{
                mb: 2,
                borderColor: '#60a5fa',
                color: '#60a5fa',
                '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(96, 165, 250, 0.1)' },
              }}
            >
              {updating ? <CircularProgress size={20} color="inherit" /> : 'Update Tracking Info'}
            </Button>
          </>
        )}

        {/* ─── Step 3: DELIVERED, RETURN REQUESTED, OR DISPUTED ─── */}
        {(isDelivered || isReturnRequestedTimeline || isDisputed) && (
          <>
            {/* Completed badges for previous steps */}
            <Button
              fullWidth
              variant="contained"
              startIcon={<CheckCircleIcon />}
              disabled
              sx={{
                mb: 1,
                '&.Mui-disabled': { background: 'rgba(34, 197, 94, 0.15)', color: 'rgba(255,255,255,0.4)' },
              }}
            >
              ✅ Marked as Shipped
            </Button>
            <Button
              fullWidth
              variant="contained"
              startIcon={<CheckCircleIcon />}
              disabled
              sx={{
                mb: 1.5,
                '&.Mui-disabled': { background: 'rgba(139, 92, 246, 0.15)', color: 'rgba(255,255,255,0.4)' },
              }}
            >
              ✅ Order Delivered
            </Button>

            {/* NEW: Step 3a - orderTimeline == 7 → Mark for Order Pickup */}
            {isReturnRequestedTimeline && !isPickupCompleted && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<AssignmentReturnIcon />}
                onClick={handleMarkReturnApproved}
                disabled={updating}
                sx={{
                  mb: 1.5,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' },
                  '&:disabled': { background: 'rgba(245, 158, 11, 0.5)' },
                }}
              >
                {updating ? <CircularProgress size={20} color="inherit" /> : '🏪 Mark for Order Pickup'}
              </Button>
            )}

            {/* Step 3b: Return requested (old logic) but NOT yet picked up → Mark for Pickup */}
            {isReturnRequested && !isReturnRequestedTimeline && !isDisputed && !isPickupCompleted && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<AssignmentReturnIcon />}
                onClick={handleMarkForPickup}
                disabled={updating}
                sx={{
                  mb: 1.5,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' },
                  '&:disabled': { background: 'rgba(245, 158, 11, 0.5)' },
                }}
              >
                {updating ? <CircularProgress size={20} color="inherit" /> : '🏪 Mark Order for Pickup'}
              </Button>
            )}

            {/* ═══ NEW: Step 3c - orderTimeline == 6 (DISPUTED) → Refund Amount ═══ */}
            {isDisputed && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<CurrencyExchangeIcon />}
                onClick={handleRefundAmount}
                disabled={updating}
                sx={{
                  mb: 1.5,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' },
                  '&:disabled': { background: 'rgba(239, 68, 68, 0.5)' },
                }}
              >
                {updating ? <CircularProgress size={20} color="inherit" /> : '💸 Refund Amount'}
              </Button>
            )}

            {/* Step 3d: Pickup completed → Release Payment */}
            {isPickupCompleted && !isPayoutReleased && !isDisputed && (
              <>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  disabled
                  sx={{
                    mb: 1,
                    '&.Mui-disabled': { background: 'rgba(245, 158, 11, 0.15)', color: 'rgba(255,255,255,0.4)' },
                  }}
                >
                  ✅ Pickup Completed
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PaymentIcon />}
                  onClick={handleReleasePayment}
                  disabled={updating}
                  sx={{
                    mb: 1.5,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
                    '&:disabled': { background: 'rgba(16, 185, 129, 0.5)' },
                  }}
                >
                  {updating ? <CircularProgress size={20} color="inherit" /> : '💰 Release Payment'}
                </Button>
              </>
            )}

            {/* Payment already released */}
            {isPayoutReleased && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<CheckCircleIcon />}
                disabled
                sx={{
                  mb: 1.5,
                  '&.Mui-disabled': { background: 'rgba(16, 185, 129, 0.15)', color: 'rgba(255,255,255,0.4)' },
                }}
              >
                ✅ Payment Released
              </Button>
            )}
          </>
        )}

        {/* ─── CANCELLED ─── */}
        {isCancelled && (
          <Box sx={{
            p: 2,
            bgcolor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: 2,
            mb: 2,
            border: '1px solid rgba(239, 68, 68, 0.2)',
            textAlign: 'center',
          }}>
            <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600 }}>
              ❌ This order has been cancelled
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* ════════════════════ Message Buyer ════════════════════ */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<MessageIcon />}
          sx={{
            mb: 3,
            py: 1.5,
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)' },
          }}
          onClick={handleMessageBuyer}
        >
          Message {buyerName}
        </Button>

        {/* ════════════════════ Order Timeline ════════════════════ */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Order Timeline
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel>
          {orderSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
    </Dialog>
  );
}