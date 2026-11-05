// components/checkout/CheckoutDialog.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Skeleton,
  Tooltip,
  Paper,
  Autocomplete,
  Fade,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import EastIcon from '@mui/icons-material/East';

// ─────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';
const COUNTRIES_API_URL = 'https://accounts.paybito.com/api/home//getExchangeCountries/PAYB18022021121103';

const EMPTY_ADDRESS = {
  fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '',
  country: '', phone: '', addressCategory: 'HOME', isDefault: 0,
};

const ADDRESS_CATEGORIES = [
  { value: 'HOME', label: 'Home', icon: HomeOutlinedIcon, color: '#3b82f6' },
  { value: 'OFFICE', label: 'Office', icon: BusinessOutlinedIcon, color: '#f59e0b' },
  { value: 'OTHER', label: 'Other', icon: LocationOnOutlinedIcon, color: '#8b5cf6' },
];

const getCategoryInfo = (category) =>
  ADDRESS_CATEGORIES.find(c => c.value === category) || ADDRESS_CATEGORIES[2];

const getFlagEmoji = (code) => {
  if (!code) return '';
  try {
    return String.fromCodePoint(
      ...[...code.slice(0, 2).toUpperCase()].map(c => 127397 + c.charCodeAt(0))
    );
  } catch { return ''; }
};

const formatCurrency = (amount, currency = 'USDB') =>
  `${currency} ${parseFloat(amount).toFixed(2)}`;

// ─────────────────────────────────────────────────────
// Default theme colors (can be overridden via props)
// ─────────────────────────────────────────────────────

const defaultColors = {
  bg: {
    primary: '#09090b',
    secondary: '#0c0c0f',
    tertiary: '#111114',
    card: 'rgba(255,255,255,0.02)',
    cardHover: 'rgba(255,255,255,0.04)',
    elevated: 'rgba(255,255,255,0.03)',
  },
  text: {
    primary: '#fafafa',
    secondary: 'rgba(250,250,250,0.7)',
    muted: 'rgba(250,250,250,0.4)',
  },
  border: {
    subtle: 'rgba(255,255,255,0.06)',
    light: 'rgba(255,255,255,0.1)',
  },
  danger: {
    primary: '#ef4444',
    muted: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.3)',
  },
};

const defaultAccents = {
  primary: '#10b981',
  muted: 'rgba(16, 185, 129, 0.15)',
  glow: 'rgba(16, 185, 129, 0.25)',
  soft: 'rgba(16, 185, 129, 0.08)',
  border: 'rgba(16, 185, 129, 0.3)',
};

// ─────────────────────────────────────────────────────
// Styled Components
// ─────────────────────────────────────────────────────

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.2); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
`;

const PrimaryButton = styled(Button)(() => ({
  background: defaultColors.bg.tertiary,
  color: '#fff',
  fontWeight: 600,
  borderRadius: 10,
  padding: '14px 32px',
  fontSize: '0.9rem',
  textTransform: 'none',
  letterSpacing: '0.01em',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  '&:disabled': {
    background: 'rgba(255,255,255,0.06)',
    color: defaultColors.text.muted,
  },
}));

const SecondaryButton = styled(Button)(() => ({
  background: 'transparent',
  color: defaultColors.text.primary,
  fontWeight: 500,
  borderRadius: 10,
  padding: '14px 32px',
  fontSize: '0.9rem',
  textTransform: 'none',
  border: `1px solid ${defaultColors.border.light}`,
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  '&:hover': {
    background: 'rgba(255,255,255,0.04)',
    borderColor: defaultColors.text.secondary,
  },
  '&:disabled': {
    borderColor: defaultColors.border.subtle,
    color: defaultColors.text.muted,
  },
}));

const AddressCard = styled(Paper)(({ selected, accentcolor }) => ({
  padding: '16px',
  background: selected ? `${accentcolor || defaultAccents.primary}08` : defaultColors.bg.card,
  border: `1.5px solid ${selected ? (accentcolor || defaultAccents.primary) : defaultColors.border.subtle}`,
  borderRadius: 14,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    borderColor: selected ? (accentcolor || defaultAccents.primary) : defaultColors.border.light,
    background: selected ? `${accentcolor || defaultAccents.primary}08` : defaultColors.bg.cardHover,
    transform: 'translateY(-1px)',
    boxShadow: selected
      ? `0 4px 20px ${accentcolor || defaultAccents.primary}25`
      : '0 4px 16px rgba(0,0,0,0.2)',
  },
  ...(selected && { animation: `${pulseGlow} 2s ease-in-out` }),
}));

const ShippingMethodCard = styled(Paper)(({ selected, accentcolor }) => ({
  padding: '12px 14px',
  background: selected ? `${accentcolor || defaultAccents.primary}08` : defaultColors.bg.card,
  border: `1.5px solid ${selected ? (accentcolor || defaultAccents.primary) : defaultColors.border.subtle}`,
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  '&:hover': {
    borderColor: selected ? (accentcolor || defaultAccents.primary) : defaultColors.border.light,
    background: selected ? `${accentcolor || defaultAccents.primary}08` : defaultColors.bg.cardHover,
  },
}));

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    fontSize: '0.875rem',
    '& fieldset': { borderColor: defaultColors.border.subtle },
    '&:hover fieldset': { borderColor: defaultColors.border.light },
    '&.Mui-focused fieldset': { borderColor: defaultAccents.primary, borderWidth: 1 },
  },
  '& .MuiInputLabel-root': { fontSize: '0.85rem' },
};

// ─────────────────────────────────────────────────────
// CheckoutDialog Component
// ─────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {boolean} props.open - Whether dialog is open
 * @param {Function} props.onClose - Called to close dialog
 * @param {string} props.currentUserId - Current user ID
 * @param {Array} props.cartItems - Cart items array
 * @param {string|null} props.cartId - Current cart ID
 * @param {boolean} props.cartLoading - Whether cart is loading
 * @param {Function} props.onUpdateQuantity - (item, newQty) => Promise
 * @param {Function} props.onRemoveItem - (item) => Promise
 * @param {Function} props.getCartItemProduct - (item) => productDetails | null
 * @param {Function} props.onCheckoutSuccess - (orderNumber) => void
 * @param {Function} props.onSnackbar - (message, severity) => void
 * @param {Object} [props.shopAccents] - Theme accent colors
 * @param {Object} [props.colors] - Theme colors
 * @param {Object} [props.currentProductInfo] - { productId, variantId, variantLabel, availableStock }
 * @param {Object} [props.cartProductDetails] - { [productId]: { profileId, ... } } for shipping
 * @param {Object} [props.currentProduct] - Current page product (for profileId)
 * @param {string} [props.currency] - Default currency (USDB)
 * @param {boolean} [props.isPhysicalProduct] - Whether products need shipping (default: true)
 */
export default function CheckoutDialog({
  open,
  onClose,
  currentUserId,
  cartItems = [],
  cartId,
  cartLoading = false,
  onUpdateQuantity,
  onRemoveItem,
  getCartItemProduct,
  onCheckoutSuccess,
  onSnackbar,
  shopAccents: propAccents,
  colors: propColors,
  currentProductInfo,
  cartProductDetails = {},
  currentProduct,
  currency = 'USDB',
  isPhysicalProduct = true,
}) {
  const c = { ...defaultColors, ...propColors };
  const accent = { ...defaultAccents, ...propAccents };

  // ===== Internal State =====

  // Address management
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressFormMode, setAddressFormMode] = useState(null); // null | 'add' | 'edit'
  const [addressForm, setAddressForm] = useState({ ...EMPTY_ADDRESS });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, addressId: null });
  const [addressDeleting, setAddressDeleting] = useState(false);

  // Shipping
  const [shippingData, setShippingData] = useState([]);
  const [selectedShippingMethods, setSelectedShippingMethods] = useState({});
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingFetched, setShippingFetched] = useState(false);

  // Checkout
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderNote, setOrderNote] = useState('');

  // Countries
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  // ===== Derived State =====

  const allShippingSelected = shippingData.length > 0 &&
    shippingData.every(s => selectedShippingMethods[s.sellerId]);

  const isUndeliverable = isPhysicalProduct && !shippingLoading && shippingFetched &&
    selectedAddressId && shippingData.length === 0;

  const cartItemsCount = cartItems.length;

  // ===== Shipping Cost Helpers =====

  const getShippingCostForSeller = useCallback((sellerId) => {
    const sellerData = shippingData.find(s => s.sellerId === sellerId);
    const selectedMethodId = selectedShippingMethods[sellerId];
    if (!sellerData || !selectedMethodId) return 0;
    const method = sellerData.shippingMethods.find(m => m.methodId === selectedMethodId);
    return method?.cost || 0;
  }, [shippingData, selectedShippingMethods]);

  const getTotalShippingCost = useCallback(() => {
    return shippingData.reduce((total, seller) => total + getShippingCostForSeller(seller.sellerId), 0);
  }, [shippingData, getShippingCostForSeller]);

  const totalShipping = getTotalShippingCost();

  // ===== API Calls =====

  const fetchCountries = useCallback(async () => {
    setCountriesLoading(true);
    try {
      const response = await fetch(COUNTRIES_API_URL, {
        method: 'GET', headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.countries?.length > 0) {
        setCountries(result.countries.sort((a, b) => a.country.localeCompare(b.country)));
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setCountriesLoading(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    setAddressesLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/user-address/listaddresses?userId=${currentUserId}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      const result = await response.json();
      if (result.success && result.data) {
        setSavedAddresses(result.data);
        const defaultAddr = result.data.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.addressId);
        } else if (result.data.length > 0) {
          setSelectedAddressId(prev => prev || result.data[0].addressId);
        }
      } else {
        setSavedAddresses([]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setAddressesLoading(false);
    }
  }, [currentUserId]);

  const fetchShippingMethods = useCallback(async (addressId) => {
    const addr = savedAddresses.find(a => a.addressId === addressId);
    if (!addr || !cartId) return;

    // Resolve profileId from actual cart items
    let resolvedProfileId = null;
    for (const item of cartItems) {
      if (item.productId === currentProduct?.productId) {
        resolvedProfileId = currentProduct?.profileId || null;
        break;
      }
      const details = cartProductDetails[item.productId];
      if (details?.profileId) {
        resolvedProfileId = details.profileId;
        break;
      }
    }

    setShippingLoading(true);
    setShippingData([]);
    setSelectedShippingMethods({});
    setShippingFetched(false);

    try {
      const payload = {
        buyerId: parseInt(currentUserId),
        cartId,
        profileId: resolvedProfileId,
        address: {
          fullName: addr.fullName,
          line1: addr.line1,
          line2: addr.line2 || '',
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          countryCode: addr.countryCode || '',
          phone: addr.phone,
        },
      };

      const response = await fetch(`${API_BASE_URL}/shipping/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.success && result.data) {
        setShippingData(result.data);
        const autoSelections = {};
        result.data.forEach((seller) => {
          if (seller.shippingMethods?.length > 0) {
            const cheapest = seller.shippingMethods.reduce(
              (min, m) => (m.cost < min.cost ? m : min), seller.shippingMethods[0]
            );
            autoSelections[seller.sellerId] = cheapest.methodId;
          }
        });
        setSelectedShippingMethods(autoSelections);
      } else {
        onSnackbar?.(result.message || 'No shipping methods available', 'warning');
      }
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      onSnackbar?.('Failed to fetch shipping options', 'error');
    } finally {
      setShippingLoading(false);
      setShippingFetched(true);
    }
  }, [savedAddresses, cartId, currentUserId, cartItems, currentProduct, cartProductDetails, onSnackbar]);

  // Save address
  const handleSaveAddress = async () => {
    const { fullName, line1, city, state, postalCode, country, phone } = addressForm;
    if (!fullName || !line1 || !city || !state || !postalCode || !country || !phone) {
      onSnackbar?.('Please fill all required fields', 'error');
      return;
    }
    setAddressSaving(true);
    try {
      const isEdit = addressFormMode === 'edit';
      const url = isEdit
        ? `${API_BASE_URL}/user-address/updateaddress`
        : `${API_BASE_URL}/user-address/addaddress`;
      const countryObj = countries.find(c => c.country === addressForm.country);
      const payload = {
        action: isEdit ? 'UPDATE' : 'INSERT',
        userId: parseInt(currentUserId),
        addressCategory: addressForm.addressCategory || 'HOME',
        fullName: addressForm.fullName,
        line1: addressForm.line1,
        line2: addressForm.line2 || '',
        city: addressForm.city,
        state: addressForm.state,
        postalCode: addressForm.postalCode,
        country: addressForm.country,
        countryCode: countryObj?.code || '',
        phone: addressForm.phone,
        isDefault: addressForm.isDefault ? 1 : 0,
        ...(isEdit && { addressId: editingAddressId }),
      };
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        onSnackbar?.(isEdit ? 'Address updated' : 'Address saved', 'success');
        setAddressFormMode(null);
        setAddressForm({ ...EMPTY_ADDRESS });
        setEditingAddressId(null);
        await fetchAddresses();
        if (!isEdit && result.data) setSelectedAddressId(result.data);
      } else {
        onSnackbar?.(result.message || 'Failed to save address', 'error');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      onSnackbar?.('Failed to save address', 'error');
    } finally {
      setAddressSaving(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId) => {
    setAddressDeleting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/user-address/deleteaddress?addressId=${addressId}&userId=${currentUserId}`,
        { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }
      );
      const result = await response.json();
      if (result.success) {
        onSnackbar?.('Address deleted', 'success');
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
          setShippingData([]);
          setSelectedShippingMethods({});
          setShippingFetched(false);
        }
        setDeleteConfirmDialog({ open: false, addressId: null });
        await fetchAddresses();
      } else {
        onSnackbar?.(result.message || 'Failed to delete', 'error');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      onSnackbar?.('Failed to delete address', 'error');
    } finally {
      setAddressDeleting(false);
    }
  };

  // Place Order
  const handlePlaceOrder = async () => {
    const selectedAddr = savedAddresses.find(a => a.addressId === selectedAddressId);
    if (!selectedAddr) {
      onSnackbar?.('Please select a shipping address', 'error');
      return;
    }
    if (isPhysicalProduct && isUndeliverable) {
      onSnackbar?.('This product cannot be delivered to your selected address', 'error');
      return;
    }
    if (isPhysicalProduct && shippingData.length > 0 && !allShippingSelected) {
      onSnackbar?.('Please select a shipping method', 'error');
      return;
    }

    setCheckoutLoading(true);
    try {
      const shippingAddress = {
        fullName: selectedAddr.fullName,
        line1: selectedAddr.line1,
        line2: selectedAddr.line2 || '',
        city: selectedAddr.city,
        state: selectedAddr.state,
        postalCode: selectedAddr.postalCode,
        country: selectedAddr.country,
        phone: selectedAddr.phone,
      };

      const firstSeller = shippingData[0];
      const selectedMethodId = firstSeller ? selectedShippingMethods[firstSeller.sellerId] : null;
      const selectedMethod = firstSeller?.shippingMethods?.find(m => m.methodId === selectedMethodId);

      const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: parseInt(currentUserId),
          shippingMethodId: selectedMethod?.methodId || null,
          shippingMethodName: selectedMethod?.methodName || '',
          shippingCost: selectedMethod?.cost || 0,
          shippingCarrier: selectedMethod?.carrier || '',
          estimatedDeliveryMin: selectedMethod?.minDeliveryDays || null,
          estimatedDeliveryMax: selectedMethod?.maxDeliveryDays || null,
          shippingAddress,
          note: orderNote || '',
        }),
      });
      const result = await response.json();

      if (result.success && result.data) {
        // Reset internal state
        setOrderNote('');
        setShippingData([]);
        setSelectedShippingMethods({});
        setShippingFetched(false);
        onCheckoutSuccess?.(result.data.orderNumber);
      } else {
        onSnackbar?.(result.message || 'Checkout failed', 'error');
      }
    } catch (error) {
      onSnackbar?.('Checkout failed', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ===== Address Form Handlers =====

  const handleOpenAddForm = () => {
    setAddressForm({ ...EMPTY_ADDRESS });
    setEditingAddressId(null);
    setAddressFormMode('add');
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      fullName: address.fullName || '',
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || '',
      phone: address.phone || '',
      addressCategory: address.addressCategory || 'HOME',
      isDefault: address.isDefault ? 1 : 0,
    });
    setEditingAddressId(address.addressId);
    setAddressFormMode('edit');
  };

  const handleCancelAddressForm = () => {
    setAddressFormMode(null);
    setAddressForm({ ...EMPTY_ADDRESS });
    setEditingAddressId(null);
  };

  // ===== Effects =====

  // Fetch addresses & countries when dialog opens
  useEffect(() => {
    if (open) {
      fetchAddresses();
      if (countries.length === 0) fetchCountries();
    } else {
      // Reset when closing
      setShippingData([]);
      setSelectedShippingMethods({});
      setShippingFetched(false);
      setAddressFormMode(null);
    }
  }, [open, fetchAddresses, countries.length, fetchCountries]);

  // Fetch shipping when address or cart items change
  useEffect(() => {
    if (open && selectedAddressId && cartId && savedAddresses.length > 0 &&
        !addressFormMode && isPhysicalProduct) {
      fetchShippingMethods(selectedAddressId);
    }
  }, [selectedAddressId, open, cartId, savedAddresses, addressFormMode,
      fetchShippingMethods, isPhysicalProduct, cartItemsCount]);

  // Auto-close when cart becomes empty
  useEffect(() => {
    if (open && cartItems.length === 0 && !cartLoading) {
      const timer = setTimeout(() => {
        onSnackbar?.('Cart is empty', 'info');
        onClose?.();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [cartItems.length, open, cartLoading, onClose, onSnackbar]);

  // ===== Render =====

  return (
    <>
      <Dialog
        open={open}
        onClose={() => !checkoutLoading && onClose?.()}
        maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            bgcolor: c.bg.secondary, backgroundImage: 'none', borderRadius: 4,
            border: `1px solid ${c.border.subtle}`, maxHeight: '90vh',
          },
        }}
      >
        {/* ===== Dialog Header ===== */}
        <DialogTitle sx={{
          borderBottom: `1px solid ${c.border.subtle}`, py: 2, px: 3,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          {addressFormMode && (
            <IconButton size="small" onClick={handleCancelAddressForm}
              sx={{ color: c.text.secondary, mr: 0.5 }}>
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.3 }}>
              {addressFormMode === 'add' ? 'Add New Address' :
               addressFormMode === 'edit' ? 'Edit Address' : 'Complete Order'}
            </Typography>
            {!addressFormMode && (
              <Typography sx={{ color: c.text.muted, fontSize: '0.75rem', mt: 0.25 }}>
                Select or add a delivery address
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={() => !checkoutLoading && onClose?.()}
            sx={{ color: c.text.secondary }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* ===== ADDRESS FORM ===== */}
          {addressFormMode ? (
            <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
              <Fade in timeout={300}>
                <Box>
                  {/* Category Selection */}
                  <Typography sx={{ fontSize: '0.75rem', color: c.text.muted, mb: 1, fontWeight: 500,
                    textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Address Type
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    {ADDRESS_CATEGORIES.map((cat) => {
                      const isSelected = addressForm.addressCategory === cat.value;
                      return (
                        <Chip
                          key={cat.value}
                          icon={<cat.icon sx={{ fontSize: 16, color: isSelected ? cat.color : c.text.muted }} />}
                          label={cat.label}
                          onClick={() => setAddressForm(prev => ({ ...prev, addressCategory: cat.value }))}
                          sx={{
                            borderRadius: 2, fontSize: '0.8rem', fontWeight: 500,
                            bgcolor: isSelected ? `${cat.color}15` : 'transparent',
                            color: isSelected ? cat.color : c.text.secondary,
                            border: `1px solid ${isSelected ? `${cat.color}40` : c.border.subtle}`,
                            transition: 'all 0.2s ease',
                            '& .MuiChip-icon': { ml: '8px' },
                          }}
                        />
                      );
                    })}
                  </Box>

                  {/* Form Fields */}
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField label="Full Name" size="small" fullWidth required
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, fullName: e.target.value }))}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ fontSize: 18, color: c.text.muted }} /></InputAdornment> }}
                        sx={textFieldSx} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Address Line 1" size="small" fullWidth required
                        value={addressForm.line1}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, line1: e.target.value }))}
                        placeholder="Street address" sx={textFieldSx} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Address Line 2 (Optional)" size="small" fullWidth
                        value={addressForm.line2}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, line2: e.target.value }))}
                        placeholder="Apartment, suite, etc." sx={textFieldSx} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField label="City" size="small" fullWidth required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                        sx={textFieldSx} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField label="State" size="small" fullWidth required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                        sx={textFieldSx} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField label="Postal Code" size="small" fullWidth required
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, postalCode: e.target.value }))}
                        sx={textFieldSx} />
                    </Grid>
                    <Grid item xs={6}>
                      <Autocomplete
                        options={countries}
                        getOptionLabel={(option) => option.country || ''}
                        value={countries.find(co => co.country === addressForm.country) || null}
                        onChange={(e, newValue) => {
                          setAddressForm(prev => ({
                            ...prev, country: newValue?.country || '',
                            phone: newValue ? `+${newValue.dialCode} ` : prev.phone,
                          }));
                        }}
                        loading={countriesLoading} size="small"
                        renderOption={(props, option) => (
                          <Box component="li" {...props} sx={{ fontSize: '0.85rem', py: 0.75 }}>
                            <Box component="span" sx={{ mr: 1, fontSize: '1rem' }}>{getFlagEmoji(option.code)}</Box>
                            {option.country}
                            <Box component="span" sx={{ ml: 'auto', color: c.text.muted, fontSize: '0.75rem' }}>
                              +{option.dialCode}
                            </Box>
                          </Box>
                        )}
                        renderInput={(params) => (
                          <TextField {...params} label="Country" required sx={textFieldSx}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: addressForm.country ? (
                                <Box component="span" sx={{ ml: 1, fontSize: '1rem' }}>
                                  {getFlagEmoji(countries.find(co => co.country === addressForm.country)?.code)}
                                </Box>
                              ) : null,
                              endAdornment: (
                                <>
                                  {countriesLoading ? <CircularProgress color="inherit" size={16} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Phone" size="small" fullWidth required
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon sx={{ fontSize: 18, color: c.text.muted }} /></InputAdornment> }}
                        sx={textFieldSx} />
                    </Grid>
                  </Grid>

                  {/* Set as Default */}
                  <Box
                    onClick={() => setAddressForm(prev => ({ ...prev, isDefault: prev.isDefault ? 0 : 1 }))}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, mt: 2.5, p: 1.5, borderRadius: 2.5,
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      bgcolor: addressForm.isDefault ? accent.soft : 'transparent',
                      border: `1px solid ${addressForm.isDefault ? accent.border : c.border.subtle}`,
                      '&:hover': { bgcolor: addressForm.isDefault ? accent.soft : 'rgba(255,255,255,0.02)' },
                    }}
                  >
                    {addressForm.isDefault ? (
                      <BookmarkIcon sx={{ fontSize: 20, color: accent.primary }} />
                    ) : (
                      <BookmarkBorderIcon sx={{ fontSize: 20, color: c.text.muted }} />
                    )}
                    <Box>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 500,
                        color: addressForm.isDefault ? accent.primary : c.text.primary }}>
                        Set as default address
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: c.text.muted }}>
                        Auto-select this address for future orders
                      </Typography>
                    </Box>
                  </Box>

                  {/* Save Button */}
                  <Box sx={{ mt: 3, display: 'flex', gap: 1.5 }}>
                    <SecondaryButton onClick={handleCancelAddressForm} sx={{ flex: 1, py: 1.25 }}>
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton onClick={handleSaveAddress} disabled={addressSaving}
                      sx={{ flex: 2, py: 1.25, background: accent.primary, '&:hover': { background: accent.primary, filter: 'brightness(1.1)' } }}
                      endIcon={addressSaving ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />}>
                      {addressSaving ? 'Saving...' : addressFormMode === 'edit' ? 'Update Address' : 'Save Address'}
                    </PrimaryButton>
                  </Box>
                </Box>
              </Fade>
            </Box>
          ) : (
            /* ===== ADDRESS LIST + SHIPPING + ORDER SUMMARY ===== */
            <Box sx={{ overflowY: 'auto', flex: 1 }}>

              {/* ===== ORDER ITEMS ===== */}
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 2 }}>Order Items</Typography>

                {cartItems.length === 0 ? (
                  <Paper sx={{
                    p: 4, textAlign: 'center', bgcolor: c.bg.card,
                    border: `1px dashed ${c.border.light}`, borderRadius: 3,
                  }}>
                    <ShoppingCartIcon sx={{ fontSize: 40, color: c.text.muted, mb: 1.5 }} />
                    <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 0.5 }}>Your cart is empty</Typography>
                    <Typography sx={{ color: c.text.muted, fontSize: '0.8rem' }}>
                      Add items to proceed with checkout
                    </Typography>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {cartItems.map((item) => {
                      const isCurrentProduct = currentProductInfo &&
                        item.productId === currentProductInfo.productId &&
                        (item.variantId || 0) === (currentProductInfo.variantId || 0);
                      const itemProduct = getCartItemProduct?.(item);
                      const itemMaxStock = isCurrentProduct
                        ? (currentProductInfo.availableStock || 999)
                        : (itemProduct?.stock || 999);

                      return (
                        <Paper key={item.cartItemId} sx={{
                          p: 2, bgcolor: c.bg.card,
                          border: `1px solid ${c.border.subtle}`, borderRadius: 3,
                        }}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            {itemProduct?.images?.[0]?.imageUrl && (
                              <img src={itemProduct.images[0].imageUrl} alt={itemProduct.name}
                                style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }} />
                            )}
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                    {itemProduct?.name || `Product #${item.productId}`}
                                  </Typography>
                                  {isCurrentProduct && currentProductInfo.variantLabel && (
                                    <Typography sx={{ color: c.text.muted, fontSize: '0.75rem' }}>
                                      {currentProductInfo.variantLabel}
                                    </Typography>
                                  )}
                                  <Typography sx={{ color: c.text.muted, fontSize: '0.8rem', mt: 0.5 }}>
                                    {formatCurrency(item.unitPrice, currency)} each
                                  </Typography>
                                </Box>
                                <IconButton size="small" onClick={() => onRemoveItem?.(item)}
                                  disabled={cartLoading}
                                  sx={{ color: c.text.muted, '&:hover': { color: c.danger.primary } }}>
                                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Box>

                              {/* Quantity Controls */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5,
                                  bgcolor: c.bg.tertiary, borderRadius: 1.5, p: 0.25 }}>
                                  <IconButton size="small"
                                    onClick={() => onUpdateQuantity?.(item, item.quantity - 1)}
                                    disabled={item.quantity <= 1 || cartLoading}>
                                    <RemoveIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                  <Typography sx={{ minWidth: 28, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                                    {item.quantity}
                                  </Typography>
                                  <IconButton size="small"
                                    onClick={() => onUpdateQuantity?.(item, Math.min(itemMaxStock, item.quantity + 1))}
                                    disabled={item.quantity >= itemMaxStock || cartLoading}>
                                    <AddIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {cartLoading && <CircularProgress size={14} sx={{ color: c.text.muted }} />}
                                  <Typography sx={{ fontWeight: 600, color: accent.primary, fontSize: '0.95rem' }}>
                                    {formatCurrency(item.unitPrice * item.quantity, currency)}
                                  </Typography>
                                </Box>
                              </Box>

                              {itemMaxStock <= 5 && (
                                <Typography sx={{ color: '#f59e0b', fontSize: '0.7rem', mt: 1 }}>
                                  Only {itemMaxStock} left in stock
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                )}
              </Box>

              {/* ===== DELIVERY ADDRESS ===== */}
              <Box sx={{ px: 3, pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShippingIcon sx={{ fontSize: 18, color: accent.primary }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Delivery Address</Typography>
                  </Box>
                  <Button size="small" startIcon={<AddLocationAltOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={handleOpenAddForm}
                    sx={{
                      textTransform: 'none', fontSize: '0.8rem', fontWeight: 500,
                      color: accent.primary, borderRadius: 2, px: 1.5,
                      '&:hover': { bgcolor: accent.soft },
                    }}>
                    Add New
                  </Button>
                </Box>

                {addressesLoading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    {[1, 2].map(i => (
                      <Skeleton key={i} variant="rectangular" height={88}
                        sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)' }} />
                    ))}
                  </Box>
                ) : savedAddresses.length === 0 ? (
                  <Paper sx={{
                    p: 4, textAlign: 'center', bgcolor: c.bg.card,
                    border: `1px dashed ${c.border.light}`, borderRadius: 3, mb: 3,
                  }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 40, color: c.text.muted, mb: 1.5 }} />
                    <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 0.5 }}>No saved addresses</Typography>
                    <Typography sx={{ color: c.text.muted, fontSize: '0.8rem', mb: 2.5 }}>
                      Add a delivery address to proceed with checkout
                    </Typography>
                    <PrimaryButton size="small" onClick={handleOpenAddForm}
                      startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                      sx={{ px: 3, py: 1, background: accent.primary, '&:hover': { background: accent.primary, filter: 'brightness(1.1)' } }}>
                      Add Address
                    </PrimaryButton>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    {savedAddresses.map((addr, idx) => {
                      const isSelected = selectedAddressId === addr.addressId;
                      const catInfo = getCategoryInfo(addr.addressCategory);
                      const CatIcon = catInfo.icon;
                      return (
                        <Fade in timeout={200 + idx * 80} key={addr.addressId}>
                          <AddressCard selected={isSelected} accentcolor={accent.primary}
                            onClick={() => setSelectedAddressId(addr.addressId)} elevation={0}>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                              <Box sx={{ pt: 0.25 }}>
                                {isSelected ? (
                                  <CheckCircleIcon sx={{ fontSize: 22, color: accent.primary }} />
                                ) : (
                                  <RadioButtonUncheckedIcon sx={{ fontSize: 22, color: c.text.muted }} />
                                )}
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: c.text.primary }}>
                                    {addr.fullName}
                                  </Typography>
                                  <Chip
                                    icon={<CatIcon sx={{ fontSize: 12, color: `${catInfo.color} !important` }} />}
                                    label={catInfo.label} size="small"
                                    sx={{
                                      height: 22, fontSize: '0.65rem', fontWeight: 600,
                                      bgcolor: `${catInfo.color}15`, color: catInfo.color,
                                      border: `1px solid ${catInfo.color}30`,
                                      '& .MuiChip-icon': { ml: '4px' },
                                    }}
                                  />
                                  {addr.isDefault && (
                                    <Chip label="Default" size="small" sx={{
                                      height: 20, fontSize: '0.6rem', fontWeight: 600,
                                      bgcolor: accent.muted, color: accent.primary,
                                      border: `1px solid ${accent.border}`,
                                    }} />
                                  )}
                                </Box>
                                <Typography sx={{
                                  color: c.text.secondary, fontSize: '0.8rem', lineHeight: 1.5, mb: 0.5,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                                </Typography>
                                <Typography sx={{ color: c.text.muted, fontSize: '0.75rem' }}>
                                  {addr.city}, {addr.state} {addr.postalCode} · {addr.country}
                                </Typography>
                                <Typography sx={{ color: c.text.muted, fontSize: '0.75rem', mt: 0.25 }}>
                                  {addr.phone}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Tooltip title="Edit" placement="left">
                                  <IconButton size="small"
                                    onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                                    sx={{ color: c.text.muted, width: 30, height: 30,
                                      '&:hover': { color: accent.primary, bgcolor: accent.soft } }}>
                                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete" placement="left">
                                  <IconButton size="small"
                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmDialog({ open: true, addressId: addr.addressId }); }}
                                    sx={{ color: c.text.muted, width: 30, height: 30,
                                      '&:hover': { color: c.danger.primary, bgcolor: c.danger.muted } }}>
                                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </AddressCard>
                        </Fade>
                      );
                    })}
                  </Box>
                )}
              </Box>

              {/* ===== SHIPPING METHODS (physical products only) ===== */}
              {savedAddresses.length > 0 && selectedAddressId && isPhysicalProduct && (
                <>
                  <Divider sx={{ borderColor: c.border.subtle }} />
                  <Box sx={{ p: 3, pb: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: accent.primary }} />
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Shipping Method</Typography>
                    </Box>

                    {shippingLoading ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                        {[1, 2].map(i => (
                          <Skeleton key={i} variant="rectangular" height={68}
                            sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)' }} />
                        ))}
                      </Box>
                    ) : shippingData.length === 0 ? (
                      <Paper sx={{
                        p: 3, textAlign: 'center', bgcolor: c.danger.muted,
                        border: `1px solid ${c.danger.border}`, borderRadius: 3, mb: 3,
                      }}>
                        <WarningAmberIcon sx={{ fontSize: 32, color: c.danger.primary, mb: 1 }} />
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: c.danger.primary, mb: 0.5 }}>
                          Delivery Not Available
                        </Typography>
                        <Typography sx={{ color: c.text.secondary, fontSize: '0.8rem' }}>
                          This product cannot be delivered to your selected address. Please try a different address.
                        </Typography>
                      </Paper>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
                        {shippingData.map((sellerGroup) => (
                          <Box key={sellerGroup.sellerId}>
                            {shippingData.length > 1 && (
                              <Typography sx={{
                                fontSize: '0.7rem', fontWeight: 600, color: c.text.muted,
                                textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1,
                              }}>
                                Seller #{sellerGroup.sellerId}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {sellerGroup.shippingMethods.map((method) => {
                                const isMethodSelected = selectedShippingMethods[sellerGroup.sellerId] === method.methodId;
                                return (
                                  <ShippingMethodCard
                                    key={method.methodId}
                                    selected={isMethodSelected}
                                    accentcolor={accent.primary}
                                    onClick={() => setSelectedShippingMethods(prev => ({
                                      ...prev, [sellerGroup.sellerId]: method.methodId,
                                    }))}
                                    elevation={0}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                      {isMethodSelected ? (
                                        <CheckCircleIcon sx={{ fontSize: 20, color: accent.primary }} />
                                      ) : (
                                        <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: c.text.muted }} />
                                      )}
                                      <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                                          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: c.text.primary }}>
                                            {method.methodName}
                                          </Typography>
                                          {method.trackingAvailable === 1 && (
                                            <Chip label="Tracked" size="small" sx={{
                                              height: 18, fontSize: '0.6rem', fontWeight: 600,
                                              bgcolor: 'rgba(96,165,250,0.1)', color: '#60a5fa',
                                              border: '1px solid rgba(96,165,250,0.25)',
                                            }} />
                                          )}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <Typography sx={{ color: c.text.muted, fontSize: '0.75rem' }}>
                                            {method.carrier}
                                          </Typography>
                                          <Typography sx={{ color: c.text.muted, fontSize: '0.75rem' }}>·</Typography>
                                          <AccessTimeIcon sx={{ fontSize: 12, color: c.text.muted }} />
                                          <Typography sx={{ color: c.text.muted, fontSize: '0.75rem' }}>
                                            {method.minDeliveryDays}-{method.maxDeliveryDays} days
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: c.text.primary }}>
                                        {formatCurrency(method.cost, currency)}
                                      </Typography>
                                    </Box>
                                  </ShippingMethodCard>
                                );
                              })}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </>
              )}

              {/* ===== ORDER NOTE ===== */}
              {savedAddresses.length > 0 && (
                <>
                  <Divider sx={{ borderColor: c.border.subtle }} />
                  <Box sx={{ p: 3, pt: 2.5 }}>
                    <TextField label="Order Note (Optional)" size="small" fullWidth multiline rows={2}
                      value={orderNote} onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Special instructions for your order..." sx={textFieldSx} />
                  </Box>
                </>
              )}

              {/* ===== ORDER SUMMARY ===== */}
              {savedAddresses.length > 0 && (
                <Box sx={{ px: 3, pb: 2 }}>
                  <Paper sx={{
                    p: 2.5, bgcolor: c.bg.elevated,
                    border: `1px solid ${c.border.subtle}`, borderRadius: 3,
                  }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: c.text.muted,
                      textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
                      Order Summary
                    </Typography>

                    {cartItems.map((item) => {
                      const itemProd = getCartItemProduct?.(item);
                      return (
                        <Box key={item.cartItemId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                          <Typography sx={{ color: c.text.secondary, fontSize: '0.85rem' }}>
                            {itemProd?.name || `Product #${item.productId}`} x {item.quantity}
                          </Typography>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            {formatCurrency(item.unitPrice * item.quantity, currency)}
                          </Typography>
                        </Box>
                      );
                    })}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, mt: 1 }}>
                      <Typography sx={{ color: c.text.secondary, fontSize: '0.85rem' }}>Shipping</Typography>
                      {!isPhysicalProduct ? (
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: accent.primary }}>
                          Not required
                        </Typography>
                      ) : shippingData.length > 0 && allShippingSelected ? (
                        <Typography sx={{
                          fontSize: '0.85rem', fontWeight: 500,
                          color: totalShipping === 0 ? accent.primary : c.text.primary,
                        }}>
                          {totalShipping === 0 ? 'Free' : formatCurrency(totalShipping, currency)}
                        </Typography>
                      ) : (
                        <Typography sx={{ fontSize: '0.8rem', color: c.text.muted, fontStyle: 'italic' }}>
                          {shippingLoading ? 'Calculating...' :
                           selectedAddressId ? (isUndeliverable ? 'Not available' : 'Select method') :
                           'Select address'}
                        </Typography>
                      )}
                    </Box>

                    <Divider sx={{ borderColor: c.border.subtle, my: 1.5 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Total</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: accent.primary }}>
                        {(() => {
                          const itemsSubtotal = cartItems.reduce(
                            (sum, item) => sum + (item.unitPrice * item.quantity), 0
                          );
                          if (!isPhysicalProduct) return formatCurrency(itemsSubtotal, currency);
                          if (shippingData.length > 0 && allShippingSelected) {
                            return formatCurrency(itemsSubtotal + totalShipping, currency);
                          }
                          return formatCurrency(itemsSubtotal, currency);
                        })()}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        {/* ===== Place Order Footer ===== */}
        {!addressFormMode && savedAddresses.length > 0 && (
          <DialogActions sx={{ p: 3, pt: 1.5, borderTop: `1px solid ${c.border.subtle}`, gap: 1 }}>
            <SecondaryButton onClick={() => onClose?.()} disabled={checkoutLoading}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={handlePlaceOrder}
              disabled={
                checkoutLoading ||
                cartItems.length === 0 ||
                !selectedAddressId ||
                isUndeliverable ||
                (isPhysicalProduct && shippingData.length > 0 && !allShippingSelected) ||
                shippingLoading
              }
              sx={{ flex: 1, background: accent.primary, '&:hover': { background: accent.primary, filter: 'brightness(1.1)' } }}
              endIcon={checkoutLoading ? <CircularProgress size={16} color="inherit" /> : <EastIcon />}
            >
              {checkoutLoading ? 'Processing...' : isUndeliverable ? 'Delivery Not Available' : 'Place Order'}
            </PrimaryButton>
          </DialogActions>
        )}
      </Dialog>

      {/* ===== DELETE ADDRESS CONFIRM DIALOG ===== */}
      <Dialog
        open={deleteConfirmDialog.open}
        onClose={() => !addressDeleting && setDeleteConfirmDialog({ open: false, addressId: null })}
        maxWidth="xs" fullWidth
        PaperProps={{
          sx: {
            bgcolor: c.bg.secondary, backgroundImage: 'none', borderRadius: 3,
            border: `1px solid ${c.border.subtle}`,
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '50%', bgcolor: c.danger.muted,
            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
          }}>
            <WarningAmberIcon sx={{ fontSize: 28, color: c.danger.primary }} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', mb: 1 }}>Delete Address?</Typography>
          <Typography sx={{ color: c.text.secondary, fontSize: '0.875rem' }}>
            This action cannot be undone. The address will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1, justifyContent: 'center', gap: 1 }}>
          <SecondaryButton
            onClick={() => setDeleteConfirmDialog({ open: false, addressId: null })}
            disabled={addressDeleting} sx={{ minWidth: 100 }}>
            Cancel
          </SecondaryButton>
          <Button
            onClick={() => handleDeleteAddress(deleteConfirmDialog.addressId)}
            disabled={addressDeleting}
            sx={{
              bgcolor: c.danger.primary, color: '#fff', fontWeight: 600,
              borderRadius: 2.5, px: 3, py: 1, textTransform: 'none', minWidth: 100, fontSize: '0.875rem',
              '&:hover': { bgcolor: '#dc2626' },
              '&:disabled': { bgcolor: 'rgba(255,255,255,0.06)', color: c.text.muted },
            }}
            endIcon={addressDeleting ? <CircularProgress size={14} color="inherit" /> : null}>
            {addressDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}