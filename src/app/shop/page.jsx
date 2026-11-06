'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Badge,
  Drawer,
  Divider,
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
  Paper,
  Rating,
  Autocomplete,
  Radio,
  RadioGroup,
  FormControlLabel,
  Fade,
  Collapse,
  Slide,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';
import EastIcon from '@mui/icons-material/East';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CachedIcon from '@mui/icons-material/Cached';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';

import ShopHeader from '../../components/layout/ShopHeader';
import { signInUrl } from '@/config/whitelabel';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';
const COUNTRIES_API_URL = 'https://accounts.paybito.com/api/home//getExchangeCountries/PAYB18022021121103';

// Flag reasons for reporting a shop
const FLAG_REASONS = [
  { value: 'COUNTERFEIT', label: 'Counterfeit or fake products', icon: '🚫' },
  { value: 'MISLEADING', label: 'Misleading product information', icon: '⚠️' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate or offensive content', icon: '🔞' },
  { value: 'POOR_QUALITY', label: 'Consistently poor quality products', icon: '👎' },
  { value: 'SCAM', label: 'Suspected scam or fraud', icon: '🕵️' },
  { value: 'IP_VIOLATION', label: 'Intellectual property violation', icon: '©️' },
  { value: 'POLICY_VIOLATION', label: 'Violates platform policies', icon: '📋' },
  { value: 'OTHER', label: 'Other', icon: '💬' },
];

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.2); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
`;

// Theme colors
const colors = {
  bg: {
    primary: '#09090b',
    secondary: '#0c0c0f',
    tertiary: '#111114',
    card: 'rgba(255,255,255,0.02)',
    cardHover: 'rgba(255,255,255,0.04)',
    elevated: 'rgba(255,255,255,0.03)',
  },
  accent: {
    primary: '#10b981',
    secondary: '#34d399',
    muted: 'rgba(16, 185, 129, 0.15)',
    glow: 'rgba(16, 185, 129, 0.25)',
    soft: 'rgba(16, 185, 129, 0.08)',
  },
  text: {
    primary: '#fafafa',
    secondary: 'rgba(250,250,250,0.7)',
    muted: 'rgba(250,250,250,0.4)',
  },
  border: {
    subtle: 'rgba(255,255,255,0.06)',
    light: 'rgba(255,255,255,0.1)',
    accent: 'rgba(16, 185, 129, 0.3)',
  },
  danger: {
    primary: '#ef4444',
    muted: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  warning: {
    primary: '#f59e0b',
    muted: 'rgba(245, 158, 11, 0.12)',
  },
};

// Styled Components
const ProductCard = styled(Card)(() => ({
  background: colors.bg.card,
  backdropFilter: 'blur(40px)',
  border: `1px solid ${colors.border.subtle}`,
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
  position: 'relative',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    background: colors.bg.cardHover,
    borderColor: colors.border.light,
    boxShadow: `0 24px 48px -12px rgba(0,0,0,0.5)`,
    '& .product-image': {
      transform: 'scale(1.05)',
    },
    '& .quick-view': {
      opacity: 1,
      transform: 'translateY(0)',
    },
    '& .wishlist-btn': {
      opacity: 1,
    },
  },
}));

const PrimaryButton = styled(Button)(() => ({
  background: colors.accent.primary,
  color: '#fff',
  fontWeight: 600,
  borderRadius: 10,
  padding: '12px 28px',
  fontSize: '0.875rem',
  textTransform: 'none',
  letterSpacing: '0.01em',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  '&:hover': {
    background: colors.accent.secondary,
    transform: 'translateY(-1px)',
    boxShadow: `0 8px 24px ${colors.accent.glow}`,
  },
  '&:disabled': {
    background: 'rgba(255,255,255,0.06)',
    color: colors.text.muted,
  },
}));

const SecondaryButton = styled(Button)(() => ({
  background: 'transparent',
  color: colors.text.primary,
  fontWeight: 500,
  borderRadius: 10,
  padding: '12px 28px',
  fontSize: '0.875rem',
  textTransform: 'none',
  border: `1px solid ${colors.border.light}`,
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  '&:hover': {
    background: 'rgba(255,255,255,0.04)',
    borderColor: colors.text.secondary,
  },
}));

const CartBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    background: colors.accent.primary,
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.7rem',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
  },
}));

// Address card styled component
const AddressCard = styled(Paper)(({ selected }) => ({
  padding: '16px',
  background: selected ? colors.accent.soft : colors.bg.card,
  border: `1.5px solid ${selected ? colors.accent.primary : colors.border.subtle}`,
  borderRadius: 14,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    borderColor: selected ? colors.accent.primary : colors.border.light,
    background: selected ? colors.accent.soft : colors.bg.cardHover,
    transform: 'translateY(-1px)',
    boxShadow: selected
      ? `0 4px 20px ${colors.accent.glow}`
      : '0 4px 16px rgba(0,0,0,0.2)',
  },
  ...(selected && {
    animation: `${pulseGlow} 2s ease-in-out`,
  }),
}));

// Shipping method card
const ShippingMethodCard = styled(Paper)(({ selected }) => ({
  padding: '12px 14px',
  background: selected ? colors.accent.soft : colors.bg.card,
  border: `1.5px solid ${selected ? colors.accent.primary : colors.border.subtle}`,
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  '&:hover': {
    borderColor: selected ? colors.accent.primary : colors.border.light,
    background: selected ? colors.accent.soft : colors.bg.cardHover,
  },
}));

// Helpers
const formatCurrency = (amount, currency = 'USDB') => `${currency} ${parseFloat(amount).toFixed(2)}`;

const EMPTY_ADDRESS = {
  fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', phone: '', addressCategory: 'HOME', isDefault: 0,
};

const ADDRESS_CATEGORIES = [
  { value: 'HOME', label: 'Home', icon: HomeOutlinedIcon, color: '#3b82f6' },
  { value: 'OFFICE', label: 'Office', icon: BusinessOutlinedIcon, color: '#f59e0b' },
  { value: 'OTHER', label: 'Other', icon: LocationOnOutlinedIcon, color: '#8b5cf6' },
];

const getCategoryInfo = (category) => ADDRESS_CATEGORIES.find(c => c.value === category) || ADDRESS_CATEGORIES[2];

const getFlagEmoji = (code) => {
  if (!code) return '';
  try {
    return String.fromCodePoint(...[...code.slice(0, 2).toUpperCase()].map(c => 397 + c.charCodeAt(0)));
  } catch { return ''; }
};

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <Shop />
    </Suspense>
  );
}

function ShopSkeleton() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg.primary }}>
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 6 }, py: 4 }}>
        <Skeleton variant="rectangular" height={72} sx={{ borderRadius: 3, mb: 4, bgcolor: 'rgba(255,255,255,0.02)' }} />
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <Skeleton variant="rectangular" height={440} sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.02)' }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

function Shop() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const shopCreatorId = searchParams.get('shopCreatorId') || searchParams.get('creatorId');
  // The signed-in member (stored by the panel after sign-in) when the link carries no userId.
  const currentUserId = searchParams.get('userId') || (typeof window !== 'undefined' ? localStorage.getItem('childUserId') : '') || '';
  const viewOnly = searchParams.get('viewOnly') === 'true';

  // No signed-in user: send the visitor to the community sign-in page (never act as another user).
  useEffect(() => {
    if (!currentUserId && !viewOnly) window.location.replace(signInUrl());
  }, [currentUserId, viewOnly]);

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShopVerified, setIsShopVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [categories, setCategories] = useState(['ALL']);
  const [sortBy, setSortBy] = useState('featured');
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [orderSuccessDialog, setOrderSuccessDialog] = useState({ open: false, orderNumber: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [wishlist, setWishlist] = useState([]);
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  // Address management state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressFormMode, setAddressFormMode] = useState(null);
  const [addressForm, setAddressForm] = useState({ ...EMPTY_ADDRESS });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, addressId: null });
  const [addressDeleting, setAddressDeleting] = useState(false);

  // Shipping state
  const [shippingData, setShippingData] = useState([]);
  const [selectedShippingMethods, setSelectedShippingMethods] = useState({});
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingFetched, setShippingFetched] = useState(false);

  // Shop details state
  const [shopDetails, setShopDetails] = useState(null);
  const [shopDetailsLoading, setShopDetailsLoading] = useState(true);

  // Flag shop state
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagComment, setFlagComment] = useState('');
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [flagSuccess, setFlagSuccess] = useState(false);

  // ========== API CALLS ==========

  // Fetch shop verification status
  const fetchVerificationStatus = useCallback(async () => {
    if (!shopCreatorId) {
      setVerificationLoading(false);
      setIsShopVerified(false);
      return;
    }
    try {
      setVerificationLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/settings/shops/${shopCreatorId}/verification/validate`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      const result = await response.json();
      if (result.success) {
        setIsShopVerified(result.data === true);
      } else {
        setIsShopVerified(false);
      }
    } catch (error) {
      console.error('Verification check error:', error);
      setIsShopVerified(false);
    } finally {
      setVerificationLoading(false);
    }
  }, [shopCreatorId]);

  // Fetch shop details
  const fetchShopDetails = useCallback(async () => {
    if (!shopCreatorId) { setShopDetailsLoading(false); return; }
    try {
      setShopDetailsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/settings/shopdetails/${shopCreatorId}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      const result = await response.json();
      if (result.success && result.data) {
        setShopDetails(result.data);
      }
    } catch (error) {
      console.error('Error fetching shop details:', error);
    } finally {
      setShopDetailsLoading(false);
    }
  }, [shopCreatorId]);

  // Fetch countries
  const fetchCountries = useCallback(async () => {
    setCountriesLoading(true);
    try {
      const response = await fetch(COUNTRIES_API_URL, {
        method: 'GET', headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.countries && result.countries.length > 0) {
        setCountries(result.countries.sort((a, b) => a.country.localeCompare(b.country)));
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setCountriesLoading(false);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!shopCreatorId) {
      setSnackbar({ open: true, message: 'Shop Creator ID is required', severity: 'error' });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        shopOwnerId: shopCreatorId, tab: 'ALL', searchStr: searchQuery, offset: '0', limit: '100',
      });
      const response = await fetch(`${API_BASE_URL}/products/getProductsByOwner?${params.toString()}`, {
        method: 'GET', headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.success && result.data) {
        const transformedProducts = result.data.map(product => ({
          productId: product.productId,
          name: product.productName,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          currency: product.currency,
          category: product.productType,
          productType: product.productType || 'PHYSICAL',
          imageUrl: product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
          images: product.images || [],
          stock: product.quantity,
          shopOwnerId: parseInt(shopCreatorId),
          variants: product.variants || [],
          profileId: product.profileId || null,
          rating: 4.5 + Math.random() * 0.5,
          reviewCount: Math.floor(Math.random() * 500) + 50,
        }));
        setProducts(transformedProducts);
        const uniqueCategories = ['ALL', ...new Set(transformedProducts.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setSnackbar({ open: true, message: 'Failed to load products', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [shopCreatorId, searchQuery]);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    if (viewOnly || !currentUserId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${currentUserId}`, {
        method: 'GET', headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.success && result.data) {
        setCartItems(result.data.items || []);
        setCartId(result.data.cartId || null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, [currentUserId, viewOnly]);

  // Fetch saved addresses
  const fetchAddresses = useCallback(async () => {
    if (!currentUserId) return;
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
        } else if (result.data.length > 0 && !selectedAddressId) {
          setSelectedAddressId(result.data[0].addressId);
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

  // Fetch shipping methods
  const fetchShippingMethods = useCallback(async (addressId) => {
    const addr = savedAddresses.find(a => a.addressId === addressId);
    if (!addr || !cartId) return;

    setShippingLoading(true);
    setShippingData([]);
    setSelectedShippingMethods({});
    setShippingFetched(false);

    try {
      const cartProductIds = cartItems.map(item => item.productId);
      const cartProduct = products.find(p => cartProductIds.includes(p.productId));
      const profileId = cartProduct?.profileId || null;

      const payload = {
        buyerId: parseInt(currentUserId),
        cartId: cartId,
        profileId: profileId,
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
            const cheapest = seller.shippingMethods.reduce((min, m) => (m.cost < min.cost ? m : min), seller.shippingMethods[0]);
            autoSelections[seller.sellerId] = cheapest.methodId;
          }
        });
        setSelectedShippingMethods(autoSelections);
      } else {
        setSnackbar({ open: true, message: result.message || 'No shipping methods available', severity: 'warning' });
      }
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      setSnackbar({ open: true, message: 'Failed to fetch shipping options', severity: 'error' });
    } finally {
      setShippingLoading(false);
      setShippingFetched(true);
    }
  }, [savedAddresses, cartId, countries, currentUserId, products, cartItems]);

  // Compute shipping cost for a seller
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

  const allShippingSelected = shippingData.length > 0 && shippingData.every(s => selectedShippingMethods[s.sellerId]);

  const getUndeliverableItems = useCallback(() => {
    if (shippingLoading || !selectedAddressId || !shippingFetched) return [];
    const sellerIdsWithShipping = new Set(
      shippingData
        .filter(s => s.shippingMethods && s.shippingMethods.length > 0)
        .map(s => s.sellerId)
    );
    return cartItems.filter((item) => {
      const product = products.find(p => p.productId === item.productId);
      if (product?.productType === 'DIGITAL') return false;
      return !sellerIdsWithShipping.has(item.shopOwnerId);
    });
  }, [shippingData, shippingLoading, shippingFetched, selectedAddressId, cartItems, products]);

  const undeliverableItems = getUndeliverableItems();
  const hasUndeliverableItems = undeliverableItems.length > 0;

  const physicalCartItems = cartItems.filter((item) => {
    const product = products.find(p => p.productId === item.productId);
    return product?.productType !== 'DIGITAL';
  });
  const hasPhysicalItems = physicalCartItems.length > 0;

  // Save address (add/update)
  const handleSaveAddress = async () => {
    const { fullName, line1, city, state, postalCode, country, phone } = addressForm;
    if (!fullName || !line1 || !city || !state || !postalCode || !country || !phone) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
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
        setSnackbar({ open: true, message: isEdit ? 'Address updated' : 'Address saved', severity: 'success' });
        setAddressFormMode(null);
        setAddressForm({ ...EMPTY_ADDRESS });
        setEditingAddressId(null);
        await fetchAddresses();
        if (!isEdit && result.data) {
          setSelectedAddressId(result.data);
        }
      } else {
        setSnackbar({ open: true, message: result.message || 'Failed to save address', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving address:', error);
      setSnackbar({ open: true, message: 'Failed to save address', severity: 'error' });
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
        setSnackbar({ open: true, message: 'Address deleted', severity: 'success' });
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
          setShippingData([]);
          setSelectedShippingMethods({});
          setShippingFetched(false);
        }
        setDeleteConfirmDialog({ open: false, addressId: null });
        await fetchAddresses();
      } else {
        setSnackbar({ open: true, message: result.message || 'Failed to delete', severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      setSnackbar({ open: true, message: 'Failed to delete address', severity: 'error' });
    } finally {
      setAddressDeleting(false);
    }
  };

  /**
   * Flag / Report shop for admin review
   * POST /settings/shops/flag
   */
  const handleFlagShop = async () => {
    if (!flagReason) {
      setSnackbar({ open: true, message: 'Please select a reason', severity: 'error' });
      return;
    }

    setFlagSubmitting(true);
    try {
      // Build the reason string — include comment if provided
      const reasonText = FLAG_REASONS.find(r => r.value === flagReason)?.label || flagReason;
      const fullReason = flagComment.trim()
        ? `${reasonText}: ${flagComment.trim()}`
        : reasonText;

      const payload = {
        shopId: parseInt(shopDetails.shopId),
        reason: fullReason,
      };

      const response = await fetch(
        `${API_BASE_URL}/reports/shop?userId=${currentUserId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();

      if (result.success) {
        setFlagSuccess(true);
        setTimeout(() => {
          setFlagDialogOpen(false);
          setFlagReason('');
          setFlagComment('');
          setFlagSuccess(false);
        }, 2500);
      } else {
        setSnackbar({ open: true, message: result.message || 'Failed to submit report', severity: 'error' });
      }
    } catch (error) {
      console.error('Error flagging shop:', error);
      setSnackbar({ open: true, message: 'Failed to submit report. Please try again.', severity: 'error' });
    } finally {
      setFlagSubmitting(false);
    }
  };

  const handleOpenFlagDialog = () => {
    setFlagReason('');
    setFlagComment('');
    setFlagSuccess(false);
    setFlagDialogOpen(true);
  };

  // ========== EFFECTS ==========

  useEffect(() => { fetchVerificationStatus(); fetchShopDetails(); }, [fetchVerificationStatus, fetchShopDetails]);

  useEffect(() => {
    if (!verificationLoading) {
      if (viewOnly || isShopVerified) {
        const timer = setTimeout(() => fetchProducts(), searchQuery ? 400 : 0);
        return () => clearTimeout(timer);
      } else {
        setLoading(false);
      }
    }
  }, [verificationLoading, isShopVerified, viewOnly, fetchProducts, searchQuery]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => {
    if (checkoutDialogOpen) {
      fetchAddresses();
      if (countries.length === 0) fetchCountries();
    } else {
      setShippingData([]);
      setSelectedShippingMethods({});
      setShippingFetched(false);
    }
  }, [checkoutDialogOpen, fetchAddresses, countries.length, fetchCountries]);

  useEffect(() => {
    const cartHasPhysicalItems = cartItems.some((item) => {
      const prod = products.find(p => p.productId === item.productId);
      return prod?.productType !== 'DIGITAL';
    });
    if (checkoutDialogOpen && selectedAddressId && cartId && savedAddresses.length > 0 && !addressFormMode && cartHasPhysicalItems) {
      fetchShippingMethods(selectedAddressId);
    }
  }, [selectedAddressId, checkoutDialogOpen, cartId, savedAddresses, addressFormMode, fetchShippingMethods, cartItems, products]);

  // ========== HANDLERS ==========

  const handleAddToCart = async (product, selectedVariant = null) => {
    if (viewOnly) {
      setSnackbar({ open: true, message: 'Preview mode - cart disabled', severity: 'info' });
      return;
    }
    setCartLoading(true);
    try {
      const variantId = selectedVariant?.variantId || (product.variants?.[0]?.variantId || 0);
      const itemPrice = selectedVariant?.priceOverride > 0 ? selectedVariant.priceOverride : product.price;
      const params = new URLSearchParams({
        operation: 'ADD', buyerId: currentUserId, productId: product.productId.toString(),
        variantId: variantId.toString(), quantity: '1', unitPrice: itemPrice.toString(),
        currency: product.currency || 'USDB', shopOwnerId: product.shopOwnerId.toString(),
      });
      const response = await fetch(`${API_BASE_URL}/cart/handlecart?${params.toString()}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.success) {
        setSnackbar({ open: true, message: 'Added to cart', severity: 'success' });
        fetchCart();
      } else {
        setSnackbar({ open: true, message: result.message || 'Failed to add', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to add to cart', severity: 'error' });
    } finally {
      setCartLoading(false);
    }
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) { handleRemoveItem(item); return; }
    setCartLoading(true);
    try {
      const params = new URLSearchParams({
        operation: 'UPDATE', buyerId: currentUserId, productId: item.productId.toString(),
        variantId: (item.variantId || 0).toString(), quantity: newQuantity.toString(),
        unitPrice: item.unitPrice.toString(), currency: 'USDB', shopOwnerId: item.shopOwnerId.toString(),
      });
      await fetch(`${API_BASE_URL}/cart/handlecart?${params.toString()}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      });
      fetchCart();
    } catch (error) { console.error('Error:', error); }
    finally { setCartLoading(false); }
  };

  const handleRemoveItem = async (item) => {
    setCartLoading(true);
    try {
      const params = new URLSearchParams({
        operation: 'DELETE', buyerId: currentUserId, productId: item.productId.toString(),
        variantId: (item.variantId || 0).toString(), shopOwnerId: item.shopOwnerId.toString(),
      });
      await fetch(`${API_BASE_URL}/cart/handlecart?${params.toString()}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      });
      setSnackbar({ open: true, message: 'Item removed', severity: 'success' });
      fetchCart();
    } catch (error) { console.error('Error:', error); }
    finally { setCartLoading(false); }
  };

  const handleCheckout = async () => {
    const selectedAddr = savedAddresses.find(a => a.addressId === selectedAddressId);
    if (!selectedAddr) {
      setSnackbar({ open: true, message: 'Please select a shipping address', severity: 'error' });
      return;
    }
    if (hasUndeliverableItems) {
      setSnackbar({ open: true, message: 'Please remove items that cannot be delivered to your address', severity: 'error' });
      return;
    }
    if (hasPhysicalItems && shippingData.length > 0 && !allShippingSelected) {
      setSnackbar({ open: true, message: 'Please select a shipping method for all sellers', severity: 'error' });
      return;
    }

    setCheckoutLoading(true);
    try {
      const shippingAddress = {
        fullName: selectedAddr.fullName, line1: selectedAddr.line1, line2: selectedAddr.line2 || '',
        city: selectedAddr.city, state: selectedAddr.state, postalCode: selectedAddr.postalCode,
        country: selectedAddr.country, phone: selectedAddr.phone,
      };
      const firstSeller = shippingData[0];
      const selectedMethodId = firstSeller ? selectedShippingMethods[firstSeller.sellerId] : null;
      const selectedMethod = firstSeller?.shippingMethods?.find(m => m.methodId === selectedMethodId);

      const payload = {
        buyerId: parseInt(currentUserId),
        shippingMethodId: selectedMethod?.methodId || null,
        shippingMethodName: selectedMethod?.methodName || '',
        shippingCost: selectedMethod?.cost || 0,
        shippingCarrier: selectedMethod?.carrier || '',
        estimatedDeliveryMin: selectedMethod?.minDeliveryDays || null,
        estimatedDeliveryMax: selectedMethod?.maxDeliveryDays || null,
        shippingAddress,
        note: orderNote || '',
      };

      const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.success && result.data) {
        setOrderSuccessDialog({ open: true, orderNumber: result.data.orderNumber });
        setCheckoutDialogOpen(false);
        setCartDrawerOpen(false);
        setOrderNote('');
        setShippingData([]);
        setSelectedShippingMethods({});
        setShippingFetched(false);
        fetchCart();
      } else {
        setSnackbar({ open: true, message: result.message || 'Checkout failed', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Checkout failed', severity: 'error' });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      fullName: address.fullName || '', line1: address.line1 || '', line2: address.line2 || '',
      city: address.city || '', state: address.state || '', postalCode: address.postalCode || '',
      country: address.country || '', phone: address.phone || '',
      addressCategory: address.addressCategory || 'HOME', isDefault: address.isDefault ? 1 : 0,
    });
    setEditingAddressId(address.addressId);
    setAddressFormMode('edit');
  };

  const handleOpenAddForm = () => {
    setAddressForm({ ...EMPTY_ADDRESS });
    setEditingAddressId(null);
    setAddressFormMode('add');
  };

  const handleCancelAddressForm = () => {
    setAddressFormMode(null);
    setAddressForm({ ...EMPTY_ADDRESS });
    setEditingAddressId(null);
  };

  const handleOpenCheckout = () => {
    setAddressFormMode(null);
    setCheckoutDialogOpen(true);
  };

  const navigateToOrders = () => {
    const params = new URLSearchParams({ userId: currentUserId });
    if (shopCreatorId) params.append('shopCreatorId', shopCreatorId);
    router.push(`/my-order?${params.toString()}`);
  };

  // ========== RENDER ==========

  if (loading || verificationLoading) return <ShopSkeleton />;

  // Not verified
  if (!isShopVerified && !viewOnly) {
    return (
      <Box sx={{
        minHeight: '100vh', bgcolor: colors.bg.primary, display: 'flex',
        alignItems: 'center', justifyContent: 'center', px: 2,
      }}>
        <Box sx={{ textAlign: 'center', maxWidth: 600, animation: `${fadeIn} 0.6s ease` }}>
          <Box sx={{
            width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(250, 204, 21, 0.1)',
            border: '2px solid rgba(250, 204, 21, 0.3)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', mx: 'auto', mb: 4, animation: `${slideUp} 0.6s ease 0.2s both`,
          }}>
            <HourglassEmptyIcon sx={{ fontSize: 56, color: '#facc15' }} />
          </Box>
          <Typography sx={{
            fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.25rem' }, mb: 2,
            background: 'linear-gradient(135deg, #fafafa 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: `${slideUp} 0.6s ease 0.3s both`,
          }}>
            Shop Coming Soon
          </Typography>
          <Typography sx={{
            color: colors.text.secondary, fontSize: '1rem', mb: 4, lineHeight: 1.6,
            animation: `${slideUp} 0.6s ease 0.4s both`,
          }}>
            This shop is currently under review and will be available soon. Thank you for your patience!
          </Typography>
          <Paper sx={{
            p: 3, bgcolor: colors.bg.card, border: `1px solid ${colors.border.subtle}`,
            borderRadius: 3, mb: 4, animation: `${slideUp} 0.6s ease 0.5s both`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1.5 }}>
              <StorefrontIcon sx={{ color: '#facc15', fontSize: 24 }} />
              <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>Verification in Progress</Typography>
            </Box>
            <Typography sx={{ color: colors.text.muted, fontSize: '0.875rem', lineHeight: 1.6 }}>
              We&apos;re reviewing this shop to ensure it meets our quality standards.
              The shop owner will be notified once the verification is complete.
            </Typography>
          </Paper>
        </Box>
      </Box>
    );
  }

  // Filter and sort
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low': return a.price - b.price;
        case 'price_high': return b.price - a.price;
        case 'newest': return b.productId - a.productId;
        default: return 0;
      }
    });

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalShipping = getTotalShippingCost();
  const grandTotal = cartTotal + totalShipping;
  const selectedAddress = savedAddresses.find(a => a.addressId === selectedAddressId);

  // Dynamic accent color from shop details
  const shopAccent = shopDetails?.accentColor || colors.accent.primary;
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '16, 185, 129';
  };
  const accentRgb = hexToRgb(shopAccent);
  const shopAccents = {
    primary: shopAccent,
    muted: `rgba(${accentRgb}, 0.15)`,
    glow: `rgba(${accentRgb}, 0.25)`,
    soft: `rgba(${accentRgb}, 0.08)`,
    border: `rgba(${accentRgb}, 0.3)`,
    gradient: `linear-gradient(135deg, ${shopAccent} 0%, ${shopAccent}aa 100%)`,
  };
  const shopInitial = shopDetails?.shopName?.charAt(0)?.toUpperCase() || 'S';

  // Don't show flag button if viewing own shop
  const isOwnShop = String(shopCreatorId) === String(currentUserId);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg.primary }}>
      {/* Header */}
       <ShopHeader
      shopDetails={shopDetails}
      shopCreatorId={shopCreatorId}
      currentUserId={currentUserId}
      viewOnly={viewOnly}
      cartItemsCount={cartItems.length}
      onCartClick={() => setCartDrawerOpen(true)}
      accentColor={shopAccents?.primary}
      showSearch={true}
      onSearch={setSearchQuery}
      searchQuery={searchQuery}
    />

      {/* ===== SHOP HERO BANNER ===== */}
      {!shopDetailsLoading && shopDetails && (
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          {/* Banner Background */}
          {shopDetails.heroBannerUrl ? (
            <Box sx={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${shopDetails.heroBannerUrl})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              '&::after': {
                content: '""', position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(9,9,11,0.4) 0%, rgba(9,9,11,0.85) 70%, rgba(9,9,11,1) 100%)',
              },
            }} />
          ) : (
            <Box sx={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(135deg, ${shopAccents.soft} 0%, transparent 40%, transparent 60%, ${shopAccents.soft} 100%)`,
              '&::before': {
                content: '""', position: 'absolute', top: -80, right: -80,
                width: 300, height: 300, borderRadius: '50%',
                background: `radial-gradient(circle, ${shopAccents.glow} 0%, transparent 70%)`,
                filter: 'blur(60px)',
              },
              '&::after': {
                content: '""', position: 'absolute', bottom: -60, left: -60,
                width: 250, height: 250, borderRadius: '50%',
                background: `radial-gradient(circle, ${shopAccents.glow} 0%, transparent 70%)`,
                filter: 'blur(50px)', opacity: 0.5,
              },
            }} />
          )}

          {/* Banner Content */}
          <Box sx={{
            position: 'relative', zIndex: 1, maxWidth: 1440, mx: 'auto',
            px: { xs: 2, md: 6 }, py: { xs: 4, md: 6 },
          }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 5 }, alignItems: { md: 'center' } }}>
              {/* Shop Avatar */}
              <Box sx={{
                width: { xs: 80, md: 100 }, height: { xs: 80, md: 100 }, borderRadius: 4, flexShrink: 0,
                background: shopAccents.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 32px ${shopAccents.glow}, 0 0 0 3px rgba(255,255,255,0.08)`,
                animation: `${scaleIn} 0.5s ease 0.2s both`,
              }}>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#fff' }}>
                  {shopInitial}
                </Typography>
              </Box>

              {/* Shop Info */}
              <Box sx={{ flex: 1, minWidth: 0, animation: `${slideUp} 0.6s ease 0.3s both` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                  <Typography sx={{
                    fontWeight: 700, fontSize: { xs: '1.5rem', md: '2rem' }, color: colors.text.primary,
                    letterSpacing: '-0.02em', lineHeight: 1.2,
                  }}>
                    {shopDetails.shopName}
                  </Typography>
                  {shopDetails.reviewStatus === 'APPROVED' && (
                    <Chip
                      icon={<VerifiedIcon sx={{ fontSize: 14, color: `${shopAccents.primary} !important` }} />}
                      label="Verified"
                      size="small"
                      sx={{
                        height: 24, fontSize: '0.7rem', fontWeight: 600,
                        bgcolor: shopAccents.muted, color: shopAccents.primary,
                        border: `1px solid ${shopAccents.border}`,
                        '& .MuiChip-icon': { ml: '6px' },
                      }}
                    />
                  )}
                  {shopDetails.shopStatus === 'ACTIVE' && (
                    <Chip
                      label="Active"
                      size="small"
                      sx={{
                        height: 22, fontSize: '0.65rem', fontWeight: 600,
                        bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e',
                        border: '1px solid rgba(34, 197, 94, 0.25)',
                      }}
                    />
                  )}

                  {/* ===== FLAG SHOP BUTTON ===== */}
                  {!viewOnly && !isOwnShop && (
                    <Tooltip title="Report this shop" placement="top">
                      <IconButton
                        size="small"
                        onClick={handleOpenFlagDialog}
                        sx={{
                          ml: 'auto',
                          color: colors.text.muted,
                          border: `1px solid ${colors.border.subtle}`,
                          borderRadius: 2,
                          px: 1.5,
                          py: 0.5,
                          gap: 0.5,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            color: colors.danger.primary,
                            borderColor: colors.danger.border,
                            bgcolor: colors.danger.muted,
                          },
                        }}
                      >
                        <OutlinedFlagIcon sx={{ fontSize: 18 }} />
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                          Report
                        </Typography>
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {shopDetails.description && (
                  <Typography sx={{
                    color: colors.text.secondary, fontSize: '0.9rem', lineHeight: 1.6,
                    mb: 2, maxWidth: 700,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {shopDetails.description}
                  </Typography>
                )}

                {/* Shop Meta Info */}
                <Box sx={{ display: 'flex', gap: { xs: 2, md: 3 }, flexWrap: 'wrap', alignItems: 'center' }}>
                  {shopDetails.contactEmail && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <EmailOutlinedIcon sx={{ fontSize: 16, color: colors.text.muted }} />
                      <Typography
                        component="a"
                        href={`mailto:${shopDetails.contactEmail}`}
                        sx={{
                          fontSize: '0.8rem', color: colors.text.secondary, textDecoration: 'none',
                          '&:hover': { color: shopAccents.primary, textDecoration: 'underline' },
                          transition: 'color 0.2s',
                        }}
                      >
                        {shopDetails.contactEmail}
                      </Typography>
                    </Box>
                  )}

                  {shopDetails.policiesUrl && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <PolicyOutlinedIcon sx={{ fontSize: 16, color: colors.text.muted }} />
                      <Typography
                        component="a"
                        href={shopDetails.policiesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          fontSize: '0.8rem', color: colors.text.secondary, textDecoration: 'none',
                          '&:hover': { color: shopAccents.primary, textDecoration: 'underline' },
                          transition: 'color 0.2s',
                        }}
                      >
                        Shop Policies
                      </Typography>
                    </Box>
                  )}

                  {shopDetails.shippingProfile && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <LocalShippingOutlinedIcon sx={{ fontSize: 16, color: colors.text.muted }} />
                      <Typography sx={{ fontSize: '0.8rem', color: colors.text.secondary }}>
                        {shopDetails.shippingProfile}
                      </Typography>
                    </Box>
                  )}

                  {shopDetails.handlingTime && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, color: colors.text.muted }} />
                      <Typography sx={{ fontSize: '0.8rem', color: colors.text.secondary }}>
                        {shopDetails.handlingTime}
                      </Typography>
                    </Box>
                  )}

                  {products.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <StorefrontIcon sx={{ fontSize: 16, color: colors.text.muted }} />
                      <Typography sx={{ fontSize: '0.8rem', color: colors.text.secondary }}>
                        {products.length} {products.length === 1 ? 'product' : 'products'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Bottom fade into page */}
          <Box sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
            background: `linear-gradient(transparent, ${colors.bg.primary})`,
          }} />
        </Box>
      )}

      {/* Search & Filters */}
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 6 }, pt: { xs: 2, md: 3 }, pb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 4 }}>
          <TextField
            placeholder="Search products..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1, minWidth: 280,
              '& .MuiOutlinedInput-root': {
                bgcolor: colors.bg.card, borderRadius: 2.5, fontSize: '0.875rem',
                '& fieldset': { borderColor: colors.border.subtle },
                '&:hover fieldset': { borderColor: colors.border.light },
                '&.Mui-focused fieldset': { borderColor: colors.accent.primary, borderWidth: 1 },
              },
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: colors.text.muted, fontSize: 20 }} /></InputAdornment>,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              IconComponent={KeyboardArrowDownIcon}
              sx={{
                bgcolor: colors.bg.card, borderRadius: 2.5, fontSize: '0.875rem',
                '& fieldset': { borderColor: colors.border.subtle },
                '&:hover fieldset': { borderColor: colors.border.light },
              }}
            >
              <MenuItem value="featured">Featured</MenuItem>
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price_low">Price: Low to High</MenuItem>
              <MenuItem value="price_high">Price: High to Low</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Categories */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 5 }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setSelectedCategory(cat)}
              sx={{
                borderRadius: 2, fontSize: '0.8rem', fontWeight: 500, px: 1,
                bgcolor: selectedCategory === cat ? shopAccents.muted : 'transparent',
                color: selectedCategory === cat ? shopAccents.primary : colors.text.secondary,
                border: `1px solid ${selectedCategory === cat ? shopAccents.border : colors.border.subtle}`,
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: selectedCategory === cat ? shopAccents.muted : 'rgba(255,255,255,0.02)' },
              }}
            />
          ))}
        </Box>

        <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted, mb: 3 }}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </Typography>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 16 }}>
            <Typography sx={{ color: colors.text.secondary, mb: 2 }}>No products found</Typography>
            <SecondaryButton onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}>Clear filters</SecondaryButton>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product, index) => (
              <Grid item xs={12} sm={6} lg={4} key={product.productId}>
                <Box sx={{ animation: `${fadeInUp} 0.5s ease ${index * 0.05}s both` }}>
                  <ProductCardComponent
                    product={product}
                    onAddToCart={handleAddToCart}
                    viewOnly={viewOnly}
                    cartLoading={cartLoading}
                    shopCreatorId={shopCreatorId}
                    currentUserId={currentUserId}
                    isWishlisted={wishlist.includes(product.productId)}
                    onToggleWishlist={() => setWishlist(prev =>
                      prev.includes(product.productId) ? prev.filter(id => id !== product.productId) : [...prev, product.productId]
                    )}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Trust Section */}
        <Box sx={{ mt: 12, pt: 8, borderTop: `1px solid ${colors.border.subtle}` }}>
          <Grid container spacing={4}>
            {[
              { icon: LocalShippingIcon, title: 'Free Shipping', desc: 'Orders over $50' },
              { icon: ShieldOutlinedIcon, title: 'Secure Checkout', desc: 'Protected payments' },
              { icon: CachedIcon, title: 'Easy Returns', desc: '30-day policy' },
              { icon: SupportAgentIcon, title: '24/7 Support', desc: 'Always available' },
            ].map((item, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{
                    width: 52, height: 52, borderRadius: 3, bgcolor: colors.accent.muted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
                  }}>
                    <item.icon sx={{ color: colors.accent.primary, fontSize: 24 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 0.5 }}>{item.title}</Typography>
                  <Typography sx={{ color: colors.text.muted, fontSize: '0.8rem' }}>{item.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* ==================== CART DRAWER ==================== */}
      <Drawer
        anchor="right"
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 }, bgcolor: colors.bg.secondary,
            backgroundImage: 'none', borderLeft: `1px solid ${colors.border.subtle}`,
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${colors.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>Cart</Typography>
              <Typography sx={{ color: colors.text.muted, fontSize: '0.8rem' }}>
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </Typography>
            </Box>
            <IconButton onClick={() => setCartDrawerOpen(false)} sx={{ color: colors.text.secondary }}><CloseIcon /></IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {cartItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <ShoppingCartIcon sx={{ fontSize: 48, color: colors.text.muted, mb: 2 }} />
                <Typography sx={{ color: colors.text.secondary }}>Your cart is empty</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {cartItems.map((item) => {
                  const product = products.find(p => p.productId === item.productId);
                  return (
                    <Paper key={item.cartItemId} sx={{
                      p: 2, bgcolor: colors.bg.card, border: `1px solid ${colors.border.subtle}`, borderRadius: 3,
                    }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {product && (
                          <Box component="img" src={product.imageUrl} alt={product.name}
                            sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'cover' }} />
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {product?.name || `Product #${item.productId}`}
                          </Typography>
                          <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem', mb: 1.5 }}>
                            {formatCurrency(item.unitPrice)}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: colors.bg.tertiary, borderRadius: 1.5, p: 0.25 }}>
                              <IconButton size="small" onClick={() => handleUpdateQuantity(item, item.quantity - 1)} disabled={cartLoading}>
                                <RemoveIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <Typography sx={{ minWidth: 28, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>{item.quantity}</Typography>
                              <IconButton size="small" onClick={() => handleUpdateQuantity(item, item.quantity + 1)} disabled={cartLoading}>
                                <AddIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                            <Typography sx={{ fontWeight: 600, color: colors.accent.primary, fontSize: '0.9rem' }}>
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton size="small" onClick={() => handleRemoveItem(item)} disabled={cartLoading}
                          sx={{ alignSelf: 'flex-start', color: colors.text.muted, '&:hover': { color: '#ef4444' } }}>
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>

          {cartItems.length > 0 && (
            <Box sx={{ p: 3, borderTop: `1px solid ${colors.border.subtle}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography sx={{ fontWeight: 500 }}>Total</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: colors.accent.primary }}>
                  {formatCurrency(cartTotal)}
                </Typography>
              </Box>
              <PrimaryButton fullWidth onClick={handleOpenCheckout} disabled={cartLoading} endIcon={<EastIcon />}>
                Checkout
              </PrimaryButton>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* ==================== CHECKOUT DIALOG ==================== */}
      {/* (checkout dialog code remains identical — omitted for brevity, keep as-is from original) */}
      <Dialog
        open={checkoutDialogOpen}
        onClose={() => !checkoutLoading && setCheckoutDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.bg.secondary, backgroundImage: 'none', borderRadius: 4,
            border: `1px solid ${colors.border.subtle}`, maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{
          borderBottom: `1px solid ${colors.border.subtle}`, py: 2, px: 3,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          {addressFormMode && (
            <IconButton size="small" onClick={handleCancelAddressForm} sx={{ color: colors.text.secondary, mr: 0.5 }}>
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.3 }}>
              {addressFormMode === 'add' ? 'Add New Address' : addressFormMode === 'edit' ? 'Edit Address' : 'Shipping & Checkout'}
            </Typography>
            {!addressFormMode && (
              <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem', mt: 0.25 }}>
                Select or add a delivery address
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={() => !checkoutLoading && setCheckoutDialogOpen(false)} sx={{ color: colors.text.secondary }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {addressFormMode ? (
            <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
              <Fade in timeout={300}>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: colors.text.muted, mb: 1, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Address Type
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    {ADDRESS_CATEGORIES.map((cat) => {
                      const isSelected = addressForm.addressCategory === cat.value;
                      return (
                        <Chip key={cat.value}
                          icon={<cat.icon sx={{ fontSize: 16, color: isSelected ? cat.color : colors.text.muted }} />}
                          label={cat.label}
                          onClick={() => setAddressForm(prev => ({ ...prev, addressCategory: cat.value }))}
                          sx={{
                            borderRadius: 2, fontSize: '0.8rem', fontWeight: 500,
                            bgcolor: isSelected ? `${cat.color}15` : 'transparent',
                            color: isSelected ? cat.color : colors.text.secondary,
                            border: `1px solid ${isSelected ? `${cat.color}40` : colors.border.subtle}`,
                            transition: 'all 0.2s ease', '& .MuiChip-icon': { ml: '8px' },
                          }}
                        />
                      );
                    })}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField label="Full Name" size="small" fullWidth required value={addressForm.fullName}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, fullName: e.target.value }))}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ fontSize: 18, color: colors.text.muted }} /></InputAdornment> }}
                        sx={textFieldSx} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Address Line 1" size="small" fullWidth required value={addressForm.line1}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, line1: e.target.value }))}
                        placeholder="Street address" sx={textFieldSx} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Address Line 2 (Optional)" size="small" fullWidth value={addressForm.line2}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, line2: e.target.value }))}
                        placeholder="Apartment, suite, etc." sx={textFieldSx} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField label="City" size="small" fullWidth required value={addressForm.city}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))} sx={textFieldSx} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField label="State" size="small" fullWidth required value={addressForm.state}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))} sx={textFieldSx} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField label="Postal Code" size="small" fullWidth required value={addressForm.postalCode}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, postalCode: e.target.value }))} sx={textFieldSx} />
                    </Grid>
                    <Grid item xs={6}>
                      <Autocomplete
                        options={countries} getOptionLabel={(option) => option.country || ''}
                        value={countries.find(c => c.country === addressForm.country) || null}
                        onChange={(e, newValue) => {
                          setAddressForm(prev => ({ ...prev, country: newValue?.country || '', phone: newValue ? `+${newValue.dialCode} ` : prev.phone }));
                        }}
                        loading={countriesLoading} size="small"
                        renderOption={(props, option) => (
                          <Box component="li" {...props} sx={{ fontSize: '0.85rem', py: 0.75 }}>
                            <Box component="span" sx={{ mr: 1, fontSize: '1rem' }}>{getFlagEmoji(option.code)}</Box>
                            {option.country}
                            <Box component="span" sx={{ ml: 'auto', color: colors.text.muted, fontSize: '0.75rem' }}>+{option.dialCode}</Box>
                          </Box>
                        )}
                        renderInput={(params) => (
                          <TextField {...params} label="Country" required sx={textFieldSx}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: addressForm.country ? (
                                <Box component="span" sx={{ ml: 1, fontSize: '1rem' }}>
                                  {getFlagEmoji(countries.find(c => c.country === addressForm.country)?.code)}
                                </Box>
                              ) : null,
                              endAdornment: (<>{countriesLoading ? <CircularProgress color="inherit" size={16} /> : null}{params.InputProps.endAdornment}</>),
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Phone" size="small" fullWidth required value={addressForm.phone}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon sx={{ fontSize: 18, color: colors.text.muted }} /></InputAdornment> }}
                        sx={textFieldSx} />
                    </Grid>
                  </Grid>

                  <Box onClick={() => setAddressForm(prev => ({ ...prev, isDefault: prev.isDefault ? 0 : 1 }))}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, mt: 2.5, p: 1.5, borderRadius: 2.5, cursor: 'pointer', transition: 'all 0.2s ease',
                      bgcolor: addressForm.isDefault ? colors.accent.soft : 'transparent',
                      border: `1px solid ${addressForm.isDefault ? colors.border.accent : colors.border.subtle}`,
                      '&:hover': { bgcolor: addressForm.isDefault ? colors.accent.soft : 'rgba(255,255,255,0.02)' },
                    }}>
                    {addressForm.isDefault ? <BookmarkIcon sx={{ fontSize: 20, color: colors.accent.primary }} /> : <BookmarkBorderIcon sx={{ fontSize: 20, color: colors.text.muted }} />}
                    <Box>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: addressForm.isDefault ? colors.accent.primary : colors.text.primary }}>Set as default address</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: colors.text.muted }}>Auto-select this address for future orders</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3, display: 'flex', gap: 1.5 }}>
                    <SecondaryButton onClick={handleCancelAddressForm} sx={{ flex: 1, py: 1.25 }}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={handleSaveAddress} disabled={addressSaving} sx={{ flex: 2, py: 1.25 }}
                      endIcon={addressSaving ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />}>
                      {addressSaving ? 'Saving...' : addressFormMode === 'edit' ? 'Update Address' : 'Save Address'}
                    </PrimaryButton>
                  </Box>
                </Box>
              </Fade>
            </Box>
          ) : (
            <Box sx={{ overflowY: 'auto', flex: 1 }}>
              <Box sx={{ p: 3, pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShippingIcon sx={{ fontSize: 18, color: colors.accent.primary }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Delivery Address</Typography>
                  </Box>
                  <Button size="small" startIcon={<AddLocationAltOutlinedIcon sx={{ fontSize: 16 }} />} onClick={handleOpenAddForm}
                    sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 500, color: colors.accent.primary, borderRadius: 2, px: 1.5, '&:hover': { bgcolor: colors.accent.soft } }}>
                    Add New
                  </Button>
                </Box>

                {addressesLoading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    {[1, 2].map(i => <Skeleton key={i} variant="rectangular" height={88} sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)' }} />)}
                  </Box>
                ) : savedAddresses.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center', bgcolor: colors.bg.card, border: `1px dashed ${colors.border.light}`, borderRadius: 3, mb: 3 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 40, color: colors.text.muted, mb: 1.5 }} />
                    <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 0.5 }}>No saved addresses</Typography>
                    <Typography sx={{ color: colors.text.muted, fontSize: '0.8rem', mb: 2.5 }}>Add a delivery address to proceed with checkout</Typography>
                    <PrimaryButton size="small" onClick={handleOpenAddForm} startIcon={<AddIcon sx={{ fontSize: 16 }} />} sx={{ px: 3, py: 1 }}>Add Address</PrimaryButton>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    {savedAddresses.map((addr, idx) => {
                      const isSelected = selectedAddressId === addr.addressId;
                      const catInfo = getCategoryInfo(addr.addressCategory);
                      const CatIcon = catInfo.icon;
                      return (
                        <Fade in timeout={200 + idx * 80} key={addr.addressId}>
                          <AddressCard selected={isSelected} onClick={() => handleSelectAddress(addr.addressId)} elevation={0}>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                              <Box sx={{ pt: 0.25 }}>
                                {isSelected ? <CheckCircleIcon sx={{ fontSize: 22, color: colors.accent.primary }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 22, color: colors.text.muted }} />}
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: colors.text.primary }}>{addr.fullName}</Typography>
                                  <Chip icon={<CatIcon sx={{ fontSize: 12, color: `${catInfo.color} !important` }} />} label={catInfo.label} size="small"
                                    sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600, bgcolor: `${catInfo.color}15`, color: catInfo.color, border: `1px solid ${catInfo.color}30`, '& .MuiChip-icon': { ml: '4px' } }} />
                                  {addr.isDefault && <Chip label="Default" size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 600, bgcolor: colors.accent.muted, color: colors.accent.primary, border: `1px solid ${colors.border.accent}` }} />}
                                </Box>
                                <Typography sx={{ color: colors.text.secondary, fontSize: '0.8rem', lineHeight: 1.5, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                                </Typography>
                                <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>{addr.city}, {addr.state} {addr.postalCode} · {addr.country}</Typography>
                                <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem', mt: 0.25 }}>{addr.phone}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Tooltip title="Edit" placement="left">
                                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                                    sx={{ color: colors.text.muted, width: 30, height: 30, '&:hover': { color: colors.accent.primary, bgcolor: colors.accent.soft } }}>
                                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete" placement="left">
                                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteConfirmDialog({ open: true, addressId: addr.addressId }); }}
                                    sx={{ color: colors.text.muted, width: 30, height: 30, '&:hover': { color: colors.danger.primary, bgcolor: colors.danger.muted } }}>
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

              {/* Shipping methods, undeliverable items, order note, order summary — kept identical to original */}
              {savedAddresses.length > 0 && selectedAddressId && hasPhysicalItems && (
                <>
                  <Divider sx={{ borderColor: colors.border.subtle }} />
                  <Box sx={{ p: 3, pb: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: colors.accent.primary }} />
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Shipping Method</Typography>
                    </Box>
                    {shippingLoading ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                        {[1, 2].map(i => <Skeleton key={i} variant="rectangular" height={68} sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)' }} />)}
                      </Box>
                    ) : shippingData.length === 0 && !hasUndeliverableItems ? (
                      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: colors.bg.card, border: `1px dashed ${colors.border.light}`, borderRadius: 3, mb: 3 }}>
                        <LocalShippingOutlinedIcon sx={{ fontSize: 32, color: colors.text.muted, mb: 1 }} />
                        <Typography sx={{ color: colors.text.muted, fontSize: '0.85rem' }}>No shipping methods available for this address</Typography>
                      </Paper>
                    ) : shippingData.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
                        {shippingData.map((sellerGroup) => (
                          <Box key={sellerGroup.sellerId}>
                            {shippingData.length > 1 && (
                              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
                                Seller #{sellerGroup.sellerId}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {sellerGroup.shippingMethods.map((method) => {
                                const isMethodSelected = selectedShippingMethods[sellerGroup.sellerId] === method.methodId;
                                return (
                                  <ShippingMethodCard key={method.methodId} selected={isMethodSelected} elevation={0}
                                    onClick={() => setSelectedShippingMethods(prev => ({ ...prev, [sellerGroup.sellerId]: method.methodId }))}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                      {isMethodSelected ? <CheckCircleIcon sx={{ fontSize: 20, color: colors.accent.primary }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: colors.text.muted }} />}
                                      <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                                          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: colors.text.primary }}>{method.methodName}</Typography>
                                          {method.trackingAvailable === 1 && (
                                            <Chip label="Tracked" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)' }} />
                                          )}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>{method.carrier}</Typography>
                                          <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>·</Typography>
                                          <AccessTimeIcon sx={{ fontSize: 12, color: colors.text.muted }} />
                                          <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>{method.minDeliveryDays}-{method.maxDeliveryDays} days</Typography>
                                        </Box>
                                      </Box>
                                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: colors.text.primary }}>{formatCurrency(method.cost)}</Typography>
                                    </Box>
                                  </ShippingMethodCard>
                                );
                              })}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : null}
                  </Box>
                </>
              )}

              {savedAddresses.length > 0 && selectedAddressId && !shippingLoading && hasUndeliverableItems && (
                <>
                  <Divider sx={{ borderColor: colors.border.subtle }} />
                  <Box sx={{ p: 3, pb: 0 }}>
                    <Paper sx={{ p: 2.5, bgcolor: colors.danger.muted, border: `1px solid ${colors.danger.border}`, borderRadius: 3, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <WarningAmberIcon sx={{ fontSize: 20, color: colors.danger.primary }} />
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: colors.danger.primary }}>Delivery Not Available</Typography>
                      </Box>
                      <Typography sx={{ color: colors.text.secondary, fontSize: '0.8rem', mb: 2, lineHeight: 1.5 }}>
                        The following items cannot be delivered to your selected address. Please remove them to proceed.
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {undeliverableItems.map((item) => {
                          const product = products.find(p => p.productId === item.productId);
                          return (
                            <Paper key={item.cartItemId} sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.2)', border: `1px solid ${colors.danger.border}`, borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {product && <Box component="img" src={product.imageUrl} alt={product.name} sx={{ width: 40, height: 40, borderRadius: 1.5, objectFit: 'cover' }} />}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography sx={{ fontWeight: 500, fontSize: '0.8rem', color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {product?.name || `Product #${item.productId}`}
                                  </Typography>
                                  <Typography sx={{ color: colors.text.muted, fontSize: '0.7rem' }}>Qty: {item.quantity} · {formatCurrency(item.unitPrice)}</Typography>
                                </Box>
                                <Tooltip title="Remove from cart">
                                  <IconButton size="small" onClick={() => handleRemoveItem(item)} disabled={cartLoading}
                                    sx={{ color: colors.danger.primary, bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}>
                                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Paper>
                          );
                        })}
                      </Box>
                    </Paper>
                  </Box>
                </>
              )}

              {savedAddresses.length > 0 && (
                <>
                  <Divider sx={{ borderColor: colors.border.subtle }} />
                  <Box sx={{ p: 3, pt: 2.5 }}>
                    <TextField label="Order Note (Optional)" size="small" fullWidth multiline rows={2} value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)} placeholder="Special instructions for your order..." sx={textFieldSx} />
                  </Box>
                </>
              )}

              {savedAddresses.length > 0 && (
                <Box sx={{ px: 3, pb: 2 }}>
                  <Paper sx={{ p: 2.5, bgcolor: colors.bg.elevated, border: `1px solid ${colors.border.subtle}`, borderRadius: 3 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>Order Summary</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography sx={{ color: colors.text.secondary, fontSize: '0.85rem' }}>Items ({cartItems.length})</Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{formatCurrency(cartTotal)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography sx={{ color: colors.text.secondary, fontSize: '0.85rem' }}>Shipping</Typography>
                      {!hasPhysicalItems ? (
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: colors.accent.primary }}>Not required</Typography>
                      ) : shippingData.length > 0 && allShippingSelected ? (
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: totalShipping === 0 ? colors.accent.primary : colors.text.primary }}>
                          {totalShipping === 0 ? 'Free' : formatCurrency(totalShipping)}
                        </Typography>
                      ) : (
                        <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted, fontStyle: 'italic' }}>
                          {shippingLoading ? 'Calculating...' : selectedAddressId ? 'Select method' : 'Select address'}
                        </Typography>
                      )}
                    </Box>
                    <Divider sx={{ borderColor: colors.border.subtle, my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Total</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: colors.accent.primary }}>
                        {!hasPhysicalItems ? formatCurrency(cartTotal) : (shippingData.length > 0 && allShippingSelected) ? formatCurrency(grandTotal) : formatCurrency(cartTotal)}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        {!addressFormMode && savedAddresses.length > 0 && (
          <DialogActions sx={{ p: 3, pt: 1.5, borderTop: `1px solid ${colors.border.subtle}`, gap: 1 }}>
            <SecondaryButton onClick={() => setCheckoutDialogOpen(false)} disabled={checkoutLoading}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleCheckout} sx={{ flex: 1 }}
              disabled={checkoutLoading || !selectedAddressId || hasUndeliverableItems || (hasPhysicalItems && shippingData.length > 0 && !allShippingSelected) || shippingLoading}
              endIcon={checkoutLoading ? <CircularProgress size={16} color="inherit" /> : <EastIcon />}>
              {checkoutLoading ? 'Processing...' : hasUndeliverableItems ? 'Remove Undeliverable Items' : 'Place Order'}
            </PrimaryButton>
          </DialogActions>
        )}
      </Dialog>

      {/* ==================== DELETE CONFIRM DIALOG ==================== */}
      <Dialog open={deleteConfirmDialog.open} onClose={() => !addressDeleting && setDeleteConfirmDialog({ open: false, addressId: null })} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: colors.bg.secondary, backgroundImage: 'none', borderRadius: 3, border: `1px solid ${colors.border.subtle}` } }}>
        <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: colors.danger.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <WarningAmberIcon sx={{ fontSize: 28, color: colors.danger.primary }} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', mb: 1 }}>Delete Address?</Typography>
          <Typography sx={{ color: colors.text.secondary, fontSize: '0.875rem' }}>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1, justifyContent: 'center', gap: 1 }}>
          <SecondaryButton onClick={() => setDeleteConfirmDialog({ open: false, addressId: null })} disabled={addressDeleting} sx={{ minWidth: 100 }}>Cancel</SecondaryButton>
          <Button onClick={() => handleDeleteAddress(deleteConfirmDialog.addressId)} disabled={addressDeleting}
            sx={{ bgcolor: colors.danger.primary, color: '#fff', fontWeight: 600, borderRadius: 2.5, px: 3, py: 1, textTransform: 'none', minWidth: 100, fontSize: '0.875rem', '&:hover': { bgcolor: '#dc2626' }, '&:disabled': { bgcolor: 'rgba(255,255,255,0.06)', color: colors.text.muted } }}
            endIcon={addressDeleting ? <CircularProgress size={14} color="inherit" /> : null}>
            {addressDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== SUCCESS DIALOG ==================== */}
      <Dialog open={orderSuccessDialog.open} onClose={() => setOrderSuccessDialog({ open: false, orderNumber: '' })} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: colors.bg.secondary, backgroundImage: 'none', borderRadius: 4, border: `1px solid ${colors.border.accent}`, textAlign: 'center', py: 4 } }}>
        <DialogContent>
          <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: colors.accent.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 40, color: colors.accent.primary }} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '1.5rem', mb: 1 }}>Order Confirmed</Typography>
          <Typography sx={{ color: colors.text.secondary, mb: 3 }}>Thank you for your purchase</Typography>
          <Paper sx={{ py: 2, px: 3, bgcolor: colors.bg.card, border: `1px solid ${colors.border.subtle}`, borderRadius: 2, display: 'inline-block', mb: 4 }}>
            <Typography sx={{ color: colors.text.muted, fontSize: '0.7rem', mb: 0.5 }}>ORDER NUMBER</Typography>
            <Typography sx={{ fontWeight: 600, fontFamily: 'monospace', letterSpacing: 1 }}>#{orderSuccessDialog.orderNumber}</Typography>
          </Paper>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <SecondaryButton onClick={() => { setOrderSuccessDialog({ open: false, orderNumber: '' }); navigateToOrders(); }}>View Orders</SecondaryButton>
            <PrimaryButton onClick={() => setOrderSuccessDialog({ open: false, orderNumber: '' })}>Continue Shopping</PrimaryButton>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ==================== FLAG SHOP DIALOG ==================== */}
      <Dialog
        open={flagDialogOpen}
        onClose={() => !flagSubmitting && setFlagDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.bg.secondary, backgroundImage: 'none', borderRadius: 4,
            border: `1px solid ${colors.border.subtle}`,
          },
        }}
      >
        <DialogTitle sx={{
          borderBottom: `1px solid ${colors.border.subtle}`, py: 2, px: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2, bgcolor: colors.danger.muted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <OutlinedFlagIcon sx={{ fontSize: 20, color: colors.danger.primary }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.3 }}>
                Report Shop
              </Typography>
              <Typography sx={{ color: colors.text.muted, fontSize: '0.7rem' }}>
                Flag this shop for admin review
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => !flagSubmitting && setFlagDialogOpen(false)}
            sx={{ color: colors.text.secondary }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {flagSuccess ? (
            /* Success state */
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{
                width: 72, height: 72, borderRadius: '50%', bgcolor: colors.accent.muted,
                display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
              }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 36, color: colors.accent.primary }} />
              </Box>
              <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 1 }}>
                Report Submitted
              </Typography>
              <Typography sx={{ color: colors.text.secondary, fontSize: '0.875rem', mb: 1 }}>
                Thank you for helping keep our platform safe. Our team will review this shop shortly.
              </Typography>
              <Chip
                label="Closing automatically..."
                size="small"
                sx={{ bgcolor: colors.accent.muted, color: colors.accent.primary }}
              />
            </Box>
          ) : (
            <>
              {/* Shop info being reported */}
              {shopDetails && (
                <Paper sx={{
                  p: 2, bgcolor: colors.bg.card, border: `1px solid ${colors.border.subtle}`,
                  borderRadius: 2.5, mb: 3, display: 'flex', alignItems: 'center', gap: 2,
                }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                    background: shopAccents.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
                      {shopInitial}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {shopDetails.shopName}
                    </Typography>
                    <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>
                      Shop ID: {shopCreatorId}
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* Reason selection */}
              <Typography sx={{
                fontSize: '0.75rem', fontWeight: 600, color: colors.text.muted, mb: 1.5,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Why are you reporting this shop? <span style={{ color: colors.danger.primary }}>*</span>
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                {FLAG_REASONS.map((reason) => {
                  const isSelected = flagReason === reason.value;
                  return (
                    <Paper
                      key={reason.value}
                      elevation={0}
                      onClick={() => setFlagReason(reason.value)}
                      sx={{
                        p: 1.75, cursor: 'pointer',
                        bgcolor: isSelected ? colors.danger.muted : colors.bg.card,
                        border: `1.5px solid ${isSelected ? colors.danger.border : colors.border.subtle}`,
                        borderRadius: 2.5,
                        transition: 'all 0.2s ease',
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        '&:hover': {
                          borderColor: isSelected ? colors.danger.border : colors.border.light,
                          bgcolor: isSelected ? colors.danger.muted : colors.bg.cardHover,
                        },
                      }}
                    >
                      {isSelected ? (
                        <CheckCircleIcon sx={{ fontSize: 20, color: colors.danger.primary }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: colors.text.muted }} />
                      )}
                      <Typography sx={{ fontSize: '0.85rem', mr: 0.5 }}>{reason.icon}</Typography>
                      <Typography sx={{
                        fontSize: '0.85rem', fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? colors.danger.primary : colors.text.secondary,
                      }}>
                        {reason.label}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>

              {/* Additional details */}
              <Typography sx={{
                fontSize: '0.75rem', fontWeight: 600, color: colors.text.muted, mb: 1,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Additional Details (Optional)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Provide any additional context that may help our team investigate this issue..."
                value={flagComment}
                onChange={(e) => setFlagComment(e.target.value)}
                sx={textFieldSx}
              />

              {/* Info note */}
              <Paper sx={{
                mt: 2.5, p: 2, bgcolor: 'rgba(96, 165, 250, 0.06)',
                border: '1px solid rgba(96, 165, 250, 0.15)', borderRadius: 2,
              }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <InfoOutlinedIcon sx={{ fontSize: 16, color: '#60a5fa', mt: 0.25 }} />
                  <Typography sx={{ color: colors.text.secondary, fontSize: '0.75rem', lineHeight: 1.5 }}>
                    Your report will be reviewed by our moderation team. The shop will continue operating unless our team finds a violation. Your identity will remain confidential.
                  </Typography>
                </Box>
              </Paper>
            </>
          )}
        </DialogContent>

        {!flagSuccess && (
          <DialogActions sx={{ p: 3, pt: 1, borderTop: `1px solid ${colors.border.subtle}`, gap: 1 }}>
            <SecondaryButton
              onClick={() => setFlagDialogOpen(false)}
              disabled={flagSubmitting}
            >
              Cancel
            </SecondaryButton>
            <Button
              onClick={handleFlagShop}
              disabled={flagSubmitting || !flagReason}
              startIcon={flagSubmitting ? <CircularProgress size={16} color="inherit" /> : <OutlinedFlagIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: colors.danger.primary, color: '#fff', fontWeight: 600,
                borderRadius: 2.5, px: 3, py: 1.25, textTransform: 'none',
                fontSize: '0.875rem', flex: 1,
                '&:hover': { bgcolor: '#dc2626' },
                '&:disabled': { bgcolor: 'rgba(255,255,255,0.06)', color: colors.text.muted },
              }}
            >
              {flagSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2, fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Shared TextField styles
const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    fontSize: '0.875rem',
    '& fieldset': { borderColor: colors.border.subtle },
    '&:hover fieldset': { borderColor: colors.border.light },
    '&.Mui-focused fieldset': { borderColor: colors.accent.primary, borderWidth: 1 },
  },
  '& .MuiInputLabel-root': { fontSize: '0.85rem' },
};

// Product Card Component
function ProductCardComponent({ product, onAddToCart, viewOnly, cartLoading, shopCreatorId, currentUserId, isWishlisted, onToggleWishlist }) {
  const router = useRouter();

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

  const handleClick = () => {
    const params = new URLSearchParams({
      productId: product.productId.toString(), shopCreatorId: shopCreatorId.toString(), userId: currentUserId.toString(),
    });
    if (viewOnly) params.append('viewOnly', 'true');
    router.push(`/product?${params.toString()}`);
  };

  return (
    <ProductCard onClick={handleClick}>
      <Box sx={{ position: 'relative', overflow: 'hidden', aspectRatio: '1' }}>
        <CardMedia
          component="img"
          image={product.imageUrl}
          alt={product.name}
          className="product-image"
          sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' }}
        />
        {discount > 0 && (
          <Chip
            label={`-${discount}%`}
            size="small"
            sx={{ position: 'absolute', top: 12, left: 12, bgcolor: '#ef4444', color: '#fff', fontWeight: 600, fontSize: '0.7rem', height: 24 }}
          />
        )}
        <IconButton
          className="wishlist-btn"
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(); }}
          sx={{
            position: 'absolute', top: 12, right: 12, opacity: isWishlisted ? 1 : 0,
            bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }, transition: 'opacity 0.3s ease',
          }}
        >
          {isWishlisted ? <FavoriteIcon sx={{ color: '#ef4444', fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ color: '#fff', fontSize: 18 }} />}
        </IconButton>
        <Box
          className="quick-view"
          sx={{
            position: 'absolute', bottom: 12, left: 12, right: 12,
            opacity: 0, transform: 'translateY(8px)', transition: 'all 0.3s ease',
          }}
        >
          <Button
            fullWidth size="small"
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            disabled={viewOnly || cartLoading || product.stock === 0}
            sx={{
              bgcolor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
              color: '#fff', fontWeight: 500, borderRadius: 2, py: 1,
              textTransform: 'none', fontSize: '0.8rem',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
              '&:disabled': { bgcolor: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.5)' },
            }}
            startIcon={<ShoppingCartIcon sx={{ fontSize: 16 }} />}
          >
            {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
          </Button>
        </Box>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        <Typography sx={{
          color: colors.accent.primary, fontSize: '0.65rem', fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.75,
        }}>
          {product.category}
        </Typography>
        <Typography sx={{
          fontWeight: 500, fontSize: '0.95rem', lineHeight: 1.4, mb: 1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: colors.text.primary,
        }}>
          {product.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Rating value={product.rating} precision={0.1} readOnly size="small"
            sx={{ '& .MuiRating-iconFilled': { color: '#fbbf24' }, '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.1)' } }} />
          <Typography sx={{ color: colors.text.muted, fontSize: '0.7rem' }}>({product.reviewCount})</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: colors.text.primary }}>
            {formatCurrency(product.price, product.currency)}
          </Typography>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <Typography sx={{ color: colors.text.muted, fontSize: '0.8rem', textDecoration: 'line-through' }}>
              {formatCurrency(product.compareAtPrice, product.currency)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </ProductCard>
  );
}