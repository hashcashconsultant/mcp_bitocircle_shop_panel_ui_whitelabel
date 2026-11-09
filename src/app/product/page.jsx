// product/page.js
'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  Paper,
  Rating,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Autocomplete,
  Fade,
  Drawer,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InventoryIcon from '@mui/icons-material/Inventory';
import ScaleIcon from '@mui/icons-material/Scale';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CachedIcon from '@mui/icons-material/Cached';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EastIcon from '@mui/icons-material/East';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
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
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';

// Import review components
import ReviewCard from '../../components/reviews/ReviewCard';
import ReviewStats from '../../components/reviews/ReviewStats';
import ReviewsDialog from '../../components/reviews/ReviewsDialog';
import ReviewImageViewer from '../../components/reviews/ReviewImageViewer';

import ShopHeader from '../../components/layout/ShopHeader';
import { signInUrl } from '@/config/whitelabel';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';
const COUNTRIES_API_URL = 'https://accounts.paybito.com/api/home//getExchangeCountries/PAYB18022021121103';
const REVIEWS_LIMIT = 10;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
};

// Styled Components
const PrimaryButton = styled(Button)(() => ({
  background: colors.accent.primary,
  color: '#fff',
  fontWeight: 600,
  borderRadius: 10,
  padding: '14px 32px',
  fontSize: '0.9rem',
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
  padding: '14px 32px',
  fontSize: '0.9rem',
  textTransform: 'none',
  border: `1px solid ${colors.border.light}`,
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  '&:hover': {
    background: 'rgba(255,255,255,0.04)',
    borderColor: colors.text.secondary,
  },
  '&:disabled': {
    borderColor: colors.border.subtle,
    color: colors.text.muted,
  },
}));

const ImageThumbnail = styled(Box)(({ selected }) => ({
  width: 72,
  height: 72,
  borderRadius: 10,
  overflow: 'hidden',
  cursor: 'pointer',
  border: `2px solid ${selected ? colors.accent.primary : colors.border.subtle}`,
  transition: 'all 0.3s ease',
  opacity: selected ? 1 : 0.6,
  '&:hover': {
    opacity: 1,
    borderColor: selected ? colors.accent.primary : colors.border.light,
  },
}));

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
    return String.fromCodePoint(...[...code.slice(0, 2).toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
  } catch { return ''; }
};

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

// ─────────────────────────────────────────────────────
// Variant parsing helpers
// ─────────────────────────────────────────────────────

function parseVariantAttributes(variants) {
  if (!variants || variants.length === 0) return { attrNames: [], attrValues: {} };
  const variantType = variants[0]?.variantType || '';
  const attrNames = variantType.split('-').filter(Boolean);
  if (attrNames.length === 0) return { attrNames: [], attrValues: {} };
  const attrValues = {};
  attrNames.forEach((name) => (attrValues[name] = new Set()));
  variants.forEach((v) => {
    const parts = (v.variantName || '').split('-');
    attrNames.forEach((name, i) => {
      if (parts[i]) attrValues[name].add(parts[i]);
    });
  });
  const result = {};
  attrNames.forEach((name) => { result[name] = [...attrValues[name]]; });
  return { attrNames, attrValues: result };
}

function findMatchingVariant(variants, attrNames, selectedAttrs) {
  if (!variants?.length || !attrNames?.length) return null;
  const expectedName = attrNames.map((name) => selectedAttrs[name] || '').join('-');
  return variants.find((v) => v.variantName === expectedName) || null;
}

export default function ProductPage() {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail />
    </Suspense>
  );
}

function ProductSkeleton() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg.primary }}>
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 6 }, py: 4 }}>
        <Skeleton variant="text" width={200} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.02)' }} />
        <Grid container spacing={6} sx={{ mt: 2 }}>
          <Grid item xs={12} md={7}>
            <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.02)' }} />
          </Grid>
          <Grid item xs={12} md={5}>
            <Skeleton variant="text" width="80%" height={48} sx={{ bgcolor: 'rgba(255,255,255,0.02)' }} />
            <Skeleton variant="text" width="40%" height={36} sx={{ bgcolor: 'rgba(255,255,255,0.02)', mt: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', mt: 4 }} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

function ProductDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get('productId');
  const shopCreatorId = searchParams.get('shopCreatorId') || searchParams.get('creatorId');
  const viewOnly = searchParams.get('viewOnly') === 'true';
  // The signed-in member (stored by the panel after sign-in) when the link carries no userId.
  const currentUserId = searchParams.get('userId') || (typeof window !== 'undefined' ? localStorage.getItem('childUserId') : '') || '';

  // No signed-in user: send the visitor to the community sign-in page (never act as another user).
  useEffect(() => {
    if (!currentUserId && !viewOnly) window.location.replace(signInUrl());
  }, [currentUserId, viewOnly]);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isShopVerified, setIsShopVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Variant state
  const [selectedVariants, setSelectedVariants] = useState({});
  const [variantAttrNames, setVariantAttrNames] = useState([]);
  const [variantAttrValues, setVariantAttrValues] = useState({});

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [orderSuccessDialog, setOrderSuccessDialog] = useState({ open: false, orderNumber: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  // Cart state
  const [cartId, setCartId] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartProductDetails, setCartProductDetails] = useState({}); // Details for other products in cart

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

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false);
  const [selectedReviewImage, setSelectedReviewImage] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [reviewSortBy, setReviewSortBy] = useState('recent');
  const [reviewFilterRating, setReviewFilterRating] = useState(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [helpfulLoading, setHelpfulLoading] = useState(null);

  // ========== API CALLS ==========

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

  const fetchProduct = useCallback(async () => {
    if (!productId || !shopCreatorId) {
      setSnackbar({ open: true, message: 'Missing product information', severity: 'error' });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ productId, shopOwnerId: shopCreatorId });
      const response = await fetch(`${API_BASE_URL}/products/getproductdetailsbyid?${params.toString()}`, {
        method: 'GET', headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      const hiddenFromBuyers = result.data && !viewOnly
        && (result.data.isActive === false || result.data.isDeleted === true);
      if (result.success && result.data && !hiddenFromBuyers) {
        const p = result.data;
        setProduct({
          productId: p.productId,
          name: p.productName,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          currency: p.currency,
          category: p.productType,
          productType: p.productType || 'PHYSICAL',
          images: p.images || [],
          stock: p.quantity,
          inventoryType: p.inventoryType,
          shopOwnerId: parseInt(shopCreatorId),
          variants: p.variants || [],
          sku: p.sku,
          weight: p.weight,
          shippingProfile: p.shippingProfile,
          profileId: p.profileId || null,
          handlingTime: p.handlingTime,
        });
        const { attrNames, attrValues } = parseVariantAttributes(p.variants || []);
        setVariantAttrNames(attrNames);
        setVariantAttrValues(attrValues);
        const initialSelections = {};
        attrNames.forEach((name) => {
          const values = attrValues[name] || [];
          if (values.length > 0) initialSelections[name] = values[0];
        });
        setSelectedVariants(initialSelections);
      } else {
        setSnackbar({ open: true, message: 'Product not found', severity: 'error' });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setSnackbar({ open: true, message: 'Failed to load product', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [productId, shopCreatorId, viewOnly]);

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
        setCartItemsCount(result.data.items?.length || 0);
      } else {
        // Cart might be empty after last item removed
        setCartItems([]);
        setCartId(null);
        setCartItemsCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, [currentUserId, viewOnly]);

  // Fetch product details for other cart items (for images/names in cart drawer & checkout)
  const fetchCartProductDetails = useCallback(async (items) => {
    if (!items?.length || !product) return;

    const otherItems = items.filter(item => item.productId !== product.productId);
    if (otherItems.length === 0) return;

    const details = {};
    let hasNew = false;

    for (const item of otherItems) {
      // Skip if already fetched
      if (cartProductDetails[item.productId]) {
        details[item.productId] = cartProductDetails[item.productId];
        continue;
      }

      try {
        const params = new URLSearchParams({
          productId: item.productId.toString(),
          shopOwnerId: item.shopOwnerId.toString(),
        });
        const response = await fetch(
          `${API_BASE_URL}/products/getproductdetailsbyid?${params.toString()}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        const result = await response.json();
        if (result.success && result.data) {
          details[item.productId] = {
            name: result.data.productName,
            images: result.data.images || [],
            stock: result.data.quantity,
            price: result.data.price,
            profileId: result.data.profileId || null,
          };
          hasNew = true;
        }
      } catch (error) {
        console.error(`Error fetching product ${item.productId} details:`, error);
      }
    }

    if (hasNew) {
      setCartProductDetails(prev => ({ ...prev, ...details }));
    }
  }, [product, cartProductDetails]);

  // Helper to get product details for any cart item
  const getCartItemProduct = useCallback((item) => {
    if (item.productId === product?.productId) return product;
    return cartProductDetails[item.productId] || null;
  }, [product, cartProductDetails]);

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

    // Resolve profileId from actual cart items (not just current page product)
    let resolvedProfileId = null;
    for (const item of cartItems) {
      if (item.productId === product?.productId) {
        resolvedProfileId = product?.profileId || null;
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
        cartId: cartId,
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
  }, [savedAddresses, cartId, countries, currentUserId, product, cartItems, cartProductDetails]);

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

  // Fetch reviews from API
  const fetchReviews = useCallback(async (page = 1, append = false) => {
    if (!productId) return;
    
    setReviewsLoading(true);
    try {
      const offset = (page - 1) * REVIEWS_LIMIT;
      const response = await fetch(
        `${API_BASE_URL}/product-reviews/${productId}/reviews?offset=${offset}&limit=${REVIEWS_LIMIT}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      const result = await response.json();

      if (result.success && result.data) {
        const apiReviews = result.data.reviews || [];
        const totalRecords = result.data.totalRecords || 0;

        // Map API response to component format
        const mapped = apiReviews.map((r) => ({
          reviewId: String(r.reviewId),
          userId: String(r.userId),
          userName: r.userName || `User ${r.userId}`,
          userAvatar: r.userAvatar || null,
          rating: r.rating,
          title: r.title || '',
          comment: r.reviewText || '',
          images: (r.images || []).map((url, i) => ({
            imageId: `img-${r.reviewId}-${i}`,
            imageUrl: url,
            isCover: i === 0,
          })),
          createdAt: r.createdAt,
          verifiedPurchase: r.verifiedPurchase ?? true,
          helpfulCount: r.helpfulCount || 0,
          isHelpful: false,
          variantInfo: r.variantInfo || null,
        }));

        // Use functional updater so we don't need `reviews` in deps
        setReviews(prev => {
          return append ? [...prev, ...mapped] : mapped;
        });

        setHasMoreReviews(offset + REVIEWS_LIMIT < totalRecords);
      } else {
        if (!append) {
          setReviews([]);
        }
        setHasMoreReviews(false);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setSnackbar({ open: true, message: 'Failed to load reviews', severity: 'error' });
    } finally {
      setReviewsLoading(false);
    }
  }, [productId]);

  // Fetch review summary (average rating + breakdown) from API
  const fetchReviewStats = useCallback(async () => {
    if (!productId) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/product-reviews/${productId}/ratings`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      const result = await response.json();

      if (result.success && result.data) {
        const { averageRating, ratingBreakdown, totalReviews } = result.data;

        // Normalise breakdown — API returns e.g. { "5": 1 }, fill missing keys
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (ratingBreakdown) {
          Object.entries(ratingBreakdown).forEach(([star, count]) => {
            const key = parseInt(star, 10);
            if (key >= 1 && key <= 5) distribution[key] = count;
          });
        }

        const positiveCount = (distribution[4] || 0) + (distribution[5] || 0);

        setReviewStats({
          averageRating: parseFloat((averageRating || 0).toFixed(1)),
          totalReviews: totalReviews || 0,
          ratingDistribution: distribution,
          totalImages: 0, // Not available from this endpoint
          verifiedPurchases: 0,
          recommendedPercentage: totalReviews > 0
            ? Math.round((positiveCount / totalReviews) * 100)
            : 0,
        });
      } else {
        setReviewStats(null);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
      setReviewStats(null);
    }
  }, [productId]);

  // Handle helpful click
  const handleHelpfulClick = async (reviewId) => {
    if (viewOnly) {
      setSnackbar({ open: true, message: 'Preview mode - actions disabled', severity: 'info' });
      return;
    }
    
    setHelpfulLoading(reviewId);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setReviews(prev => prev.map(review => {
        if (review.reviewId === reviewId) {
          return {
            ...review,
            helpfulCount: review.isHelpful ? review.helpfulCount - 1 : review.helpfulCount + 1,
            isHelpful: !review.isHelpful,
          };
        }
        return review;
      }));
    } catch (error) {
      console.error('Error updating helpful:', error);
      setSnackbar({ open: true, message: 'Failed to update', severity: 'error' });
    } finally {
      setHelpfulLoading(null);
    }
  };

  const handleLoadMoreReviews = () => {
    const nextPage = reviewPage + 1;
    setReviewPage(nextPage);
    fetchReviews(nextPage, true);
  };

  const handleFilterChange = (rating) => {
    setReviewFilterRating(rating);
    setReviewPage(1);
  };

  const handleSortChange = (sortValue) => {
    setReviewSortBy(sortValue);
    setReviewPage(1);
  };

  // Derived: client-side filtered and sorted reviews
  const displayedReviews = useMemo(() => {
    let result = [...reviews];
    if (reviewFilterRating) {
      result = result.filter(r => r.rating === reviewFilterRating);
    }
    if (reviewSortBy === 'recent') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (reviewSortBy === 'helpful') {
      result.sort((a, b) => b.helpfulCount - a.helpfulCount);
    } else if (reviewSortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [reviews, reviewFilterRating, reviewSortBy]);

  // ========== CART HANDLERS ==========

  const handleAddToCart = async () => {
    if (viewOnly) {
      setSnackbar({ open: true, message: 'Preview mode - cart disabled', severity: 'info' });
      return;
    }
    setAddingToCart(true);
    try {
      const matchedVariant = getSelectedVariantDetails();
      const variantId = matchedVariant?.variantId || 0;
      const params = new URLSearchParams({
        operation: 'ADD', buyerId: currentUserId, productId: product.productId.toString(),
        variantId: variantId.toString(), quantity: quantity.toString(), unitPrice: getDisplayPrice().toString(),
        currency: product.currency || 'USDB', shopOwnerId: product.shopOwnerId.toString(),
      });
      const response = await fetch(`${API_BASE_URL}/cart/handlecart?${params.toString()}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.success) {
        setSnackbar({ open: true, message: 'Added to cart', severity: 'success' });
        await fetchCart(); // Refresh cart data — quantity will sync via effect
        setCartDrawerOpen(true);
      } else {
        setSnackbar({ open: true, message: result.message || 'Failed', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to add to cart', severity: 'error' });
    } finally {
      setAddingToCart(false);
    }
  };

  // Buy Now
  const handleBuyNow = async () => {
    if (viewOnly) {
      setSnackbar({ open: true, message: 'Preview mode - checkout disabled', severity: 'info' });
      return;
    }
    setBuyNowLoading(true);
    try {
      // Step 1: Add to cart
      const matchedVariant = getSelectedVariantDetails();
      const variantId = matchedVariant?.variantId || 0;
      const params = new URLSearchParams({
        operation: 'ADD', buyerId: currentUserId, productId: product.productId.toString(),
        variantId: variantId.toString(), quantity: quantity.toString(), unitPrice: getDisplayPrice().toString(),
        currency: product.currency || 'USDB', shopOwnerId: product.shopOwnerId.toString(),
      });
      const cartAddResponse = await fetch(`${API_BASE_URL}/cart/handlecart?${params.toString()}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      });
      const cartAddResult = await cartAddResponse.json();
      if (!cartAddResult.success) {
        setSnackbar({ open: true, message: cartAddResult.message || 'Failed to add to cart', severity: 'error' });
        return;
      }

      // Step 2: Fetch cart to get cartId
      await fetchCart();

      // Step 3: Open checkout dialog
      setAddressFormMode(null);
      setCheckoutDialogOpen(true);
    } catch (error) {
      console.error('Buy now error:', error);
      setSnackbar({ open: true, message: 'Something went wrong', severity: 'error' });
    } finally {
      setBuyNowLoading(false);
    }
  };

  // Update quantity in cart (shared by drawer + checkout + product detail)
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
      await fetchCart(); // Refresh — quantity syncs via effect
    } catch (error) { console.error('Error:', error); }
    finally { setCartLoading(false); }
  };

  // Remove item from cart
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
      await fetchCart(); // Refresh — will clear cartItems and update counts
    } catch (error) { console.error('Error:', error); }
    finally { setCartLoading(false); }
  };

  // ✅ NEW: Handle quantity change in checkout dialog (syncs with cart API)
  const handleCheckoutQuantityChange = async (newQuantity) => {
    if (!product) return;
    const matchedVariant = getSelectedVariantDetails();
    const variantId = matchedVariant?.variantId || 0;

    const cartItem = cartItems.find(
      item => item.productId === product.productId &&
              (item.variantId || 0) === variantId
    );

    if (cartItem) {
      if (newQuantity < 1) {
        await handleRemoveItem(cartItem);
      } else {
        await handleUpdateQuantity(cartItem, newQuantity);
      }
      // quantity will auto-sync via the useEffect below after fetchCart completes
    } else {
      setQuantity(Math.max(1, Math.min(newQuantity, getAvailableStock())));
    }
  };

  // ✅ NEW: Handle quantity change from product detail section (syncs with cart if item in cart)
  const handleProductQuantityChange = async (newQuantity) => {
    const clampedQty = Math.max(1, Math.min(newQuantity, getAvailableStock()));
    setQuantity(clampedQty);

    // If item is already in cart, sync via API
    const matchedVariant = getSelectedVariantDetails();
    const variantId = matchedVariant?.variantId || 0;
    const cartItem = cartItems.find(
      ci => ci.productId === product.productId && (ci.variantId || 0) === variantId
    );
    if (cartItem) {
      await handleUpdateQuantity(cartItem, clampedQty);
    }
  };

  // Checkout
  const handleDirectCheckout = async () => {
    const selectedAddr = savedAddresses.find(a => a.addressId === selectedAddressId);
    if (!selectedAddr) {
      setSnackbar({ open: true, message: 'Please select a shipping address', severity: 'error' });
      return;
    }

    if (isPhysicalProduct && isUndeliverable) {
      setSnackbar({ open: true, message: 'This product cannot be delivered to your selected address', severity: 'error' });
      return;
    }

    if (isPhysicalProduct && shippingData.length > 0 && !allShippingSelected) {
      setSnackbar({ open: true, message: 'Please select a shipping method', severity: 'error' });
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
        setOrderSuccessDialog({ open: true, orderNumber: result.data.orderNumber });
        setCheckoutDialogOpen(false);
        setCartDrawerOpen(false);
        setOrderNote('');
        setQuantity(1);
        setShippingData([]);
        setSelectedShippingMethods({});
        setShippingFetched(false);
        setCartId(null);
        await fetchCart(); // Refresh cart
      } else {
        setSnackbar({ open: true, message: result.message || 'Checkout failed', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Checkout failed', severity: 'error' });
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ========== EFFECTS ==========

  useEffect(() => { fetchVerificationStatus(); fetchShopDetails(); }, [fetchVerificationStatus, fetchShopDetails]);

  useEffect(() => {
    if (!verificationLoading) {
      if (viewOnly || isShopVerified) {
        fetchProduct();
      } else {
        setLoading(false);
      }
    }
  }, [verificationLoading, isShopVerified, viewOnly, fetchProduct]);

  // Fetch cart when product loads
  useEffect(() => {
    if (product) {
      fetchCart();
    }
  }, [product, fetchCart]);

  // Fetch details for other products in cart (images/names)
  useEffect(() => {
    if (product && cartItems.length > 0) {
      fetchCartProductDetails(cartItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, product]);

  // Fetch reviews and review stats when product loads
  useEffect(() => {
    if (product) {
      fetchReviews(1);
      fetchReviewStats();
    }
  }, [product, fetchReviews, fetchReviewStats]);

  // Fetch addresses & countries when checkout dialog opens
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

  // Fetch shipping when address selection changes or cart items change (add/remove)
  useEffect(() => {
    if (checkoutDialogOpen && selectedAddressId && cartId && savedAddresses.length > 0 && !addressFormMode && product?.productType !== 'DIGITAL') {
      fetchShippingMethods(selectedAddressId);
    }
  }, [selectedAddressId, checkoutDialogOpen, cartId, savedAddresses, addressFormMode, fetchShippingMethods, product, cartItemsCount]);

  // ✅ NEW: Sync local quantity with cart data for current product
  // This ensures that whenever cartItems changes (from drawer, checkout, or API refresh),
  // the local quantity state always reflects the cart's truth.
  useEffect(() => {
    if (product && cartItems.length > 0) {
      const matchedVariant = findMatchingVariant(product.variants, variantAttrNames, selectedVariants);
      const variantId = matchedVariant?.variantId || 0;
      const cartItem = cartItems.find(
        item => item.productId === product.productId &&
                (item.variantId || 0) === variantId
      );
      if (cartItem) {
        setQuantity(cartItem.quantity);
      }
    }
  }, [cartItems, product, variantAttrNames, selectedVariants]);

  // Auto-close checkout dialog when cart becomes empty (e.g., after deleting all items)
  useEffect(() => {
    if (checkoutDialogOpen && cartItems.length === 0 && !cartLoading) {
      // Small delay so the user sees the last item disappear before dialog closes
      const timer = setTimeout(() => {
        setCheckoutDialogOpen(false);
        setSnackbar({ open: true, message: 'Cart is empty', severity: 'info' });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [cartItems.length, checkoutDialogOpen, cartLoading]);

  // ========== VARIANT HELPERS ==========

  const getSelectedVariantDetails = () => {
    if (!product?.variants?.length || variantAttrNames.length === 0) return null;
    return findMatchingVariant(product.variants, variantAttrNames, selectedVariants);
  };

  const getDisplayPrice = () => {
    const variant = getSelectedVariantDetails();
    return (variant?.priceOverride > 0) ? variant.priceOverride : product?.price || 0;
  };

  const getTotalPrice = () => getDisplayPrice() * quantity;

  const getAvailableStock = () => {
    const variant = getSelectedVariantDetails();
    if (variant) return variant.stock;
    return product?.stock || 0;
  };

  const getSavings = () => {
    if (!product?.compareAtPrice || product.compareAtPrice <= product.price) return 0;
    return Math.round((1 - getDisplayPrice() / product.compareAtPrice) * 100);
  };

  // ========== SHIPPING COST HELPERS ==========

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
  const isPhysicalProduct = product?.productType !== 'DIGITAL';

  // Check if physical product can't be delivered
  const isUndeliverable = isPhysicalProduct && !shippingLoading && shippingFetched && selectedAddressId && shippingData.length === 0 && checkoutDialogOpen;

  // ========== NAVIGATION ==========

  const navigateToOrders = () => {
    const params = new URLSearchParams({ userId: currentUserId });
    if (shopCreatorId) params.append('shopCreatorId', shopCreatorId);
    router.push(`/my-order?${params.toString()}`);
  };

  const navigateToShop = () => {
    const params = new URLSearchParams({ shopCreatorId, userId: currentUserId });
    if (viewOnly) params.append('viewOnly', 'true');
    router.push(`/shop?${params.toString()}`);
  };

  // ========== ADDRESS FORM HANDLERS ==========

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
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

  // ========== RENDER ==========

  if (loading || verificationLoading) return <ProductSkeleton />;

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
          <Box sx={{ animation: `${slideUp} 0.6s ease 0.6s both` }}>
            <SecondaryButton onClick={navigateToShop} startIcon={<ArrowBackIcon />}>Go Back</SecondaryButton>
          </Box>
        </Box>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: colors.bg.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: colors.text.secondary, mb: 3 }}>Product not found</Typography>
          <PrimaryButton onClick={navigateToShop}>Back to Shop</PrimaryButton>
        </Box>
      </Box>
    );
  }

  const displayPrice = getDisplayPrice();
  const totalPrice = getTotalPrice();
  const savings = getSavings();
  const availableStock = getAvailableStock();
  const matchedVariant = getSelectedVariantDetails();
  const totalShipping = getTotalShippingCost();
  const grandTotal = totalPrice + totalShipping;

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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg.primary }}>
      {/* Header */}
      <ShopHeader
        shopDetails={shopDetails}
        shopCreatorId={shopCreatorId}
        currentUserId={currentUserId}
        viewOnly={viewOnly}
        cartItemsCount={cartItemsCount}
        onCartClick={() => setCartDrawerOpen(true)}
        accentColor={shopAccents?.primary}
        showSearch={false}
      />

      {/* Main Content */}
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 6 }, py: 4, animation: `${fadeIn} 0.5s ease` }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 16, color: colors.text.muted }} />} sx={{ mb: 4 }}>
          <Link underline="hover" sx={{ color: colors.text.muted, cursor: 'pointer', fontSize: '0.85rem', '&:hover': { color: shopAccents.primary } }}
            onClick={navigateToShop}>{shopDetails?.shopName || 'Shop'}</Link>
          <Link underline="hover" sx={{ color: colors.text.muted, fontSize: '0.85rem' }}>{product.category}</Link>
          <Typography sx={{ color: colors.text.secondary, fontSize: '0.85rem' }}>{product.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={{ xs: 4, md: 8 }}>
          {/* Images */}
          <Grid item xs={12} md={7}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Box onClick={() => setImageZoomOpen(true)} sx={{
                position: 'relative', aspectRatio: '1', bgcolor: colors.bg.card,
                border: `1px solid ${colors.border.subtle}`, borderRadius: 4, overflow: 'hidden', mb: 2,
                cursor: 'zoom-in', '&:hover .zoom-icon': { opacity: 1 },
              }}>
                <img
                  src={product.images[selectedImage]?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {savings > 0 && (
                  <Chip label={`-${savings}%`} size="small"
                    sx={{ position: 'absolute', top: 16, left: 16, bgcolor: '#ef4444', color: '#fff', fontWeight: 600, fontSize: '0.75rem' }} />
                )}
                <Box className="zoom-icon" sx={{
                  position: 'absolute', bottom: 16, right: 16, width: 40, height: 40, borderRadius: 2,
                  bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.3s ease',
                }}>
                  <ZoomOutMapIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
              </Box>
              {product.images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {product.images.map((img, i) => (
                    <ImageThumbnail key={i} selected={selectedImage === i} onClick={() => setSelectedImage(i)}>
                      <img src={img.imageUrl} alt={`${product.name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </ImageThumbnail>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Details */}
          <Grid item xs={12} md={5}>
            <Box sx={{ animation: `${slideUp} 0.5s ease 0.1s both` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Chip label={product.category} size="small" sx={{
                  bgcolor: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', fontWeight: 500, fontSize: '0.7rem',
                }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <VerifiedIcon sx={{ color: shopAccents.primary, fontSize: 16 }} />
                  <Typography sx={{ color: shopAccents.primary, fontSize: '0.7rem', fontWeight: 500 }}>Verified</Typography>
                </Box>
              </Box>

              <Typography sx={{
                fontWeight: 600, fontSize: { xs: '1.75rem', md: '2.25rem' },
                lineHeight: 1.2, letterSpacing: '-0.02em', color: colors.text.primary, mb: 2,
              }}>
                {product.name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Rating value={reviewStats?.averageRating || 0} precision={0.1} readOnly size="small"
                  sx={{ '& .MuiRating-iconFilled': { color: '#fbbf24' }, '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.1)' } }} />
                <Typography sx={{ color: colors.text.secondary, fontSize: '0.85rem' }}>{reviewStats?.averageRating?.toFixed(1) || '0.0'}</Typography>
                <Typography sx={{ color: colors.text.muted, fontSize: '0.85rem' }}>({reviewStats?.totalReviews || 0} reviews)</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 4 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '2rem', color: colors.text.primary }}>
                  {formatCurrency(displayPrice, product.currency)}
                </Typography>
                {product.compareAtPrice && product.compareAtPrice > displayPrice && (
                  <Typography sx={{ color: colors.text.muted, fontSize: '1.1rem', textDecoration: 'line-through' }}>
                    {formatCurrency(product.compareAtPrice, product.currency)}
                  </Typography>
                )}
              </Box>

              <Typography sx={{ color: colors.text.secondary, fontSize: '0.95rem', lineHeight: 1.7, mb: 4 }}>
                {product.description}
              </Typography>

              <Divider sx={{ borderColor: colors.border.subtle, mb: 4 }} />

              {/* Variant Selectors */}
              {variantAttrNames.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  {variantAttrNames.map((attrName) => {
                    const values = variantAttrValues[attrName] || [];
                    const selectedValue = selectedVariants[attrName] || '';
                    return (
                      <Box key={attrName} sx={{ mb: 3 }}>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.85rem', mb: 1.5, color: colors.text.secondary }}>
                          {attrName}: <span style={{ color: colors.text.primary, fontWeight: 600 }}>{selectedValue}</span>
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {values.map((val) => {
                            const isSelected = selectedValue === val;
                            return (
                              <Chip key={val} label={val} size="medium"
                                onClick={() => setSelectedVariants((prev) => ({ ...prev, [attrName]: val }))}
                                sx={{
                                  fontWeight: isSelected ? 600 : 400, fontSize: '0.85rem', px: 1, cursor: 'pointer',
                                  bgcolor: isSelected ? shopAccents.muted : colors.bg.card,
                                  color: isSelected ? shopAccents.primary : colors.text.secondary,
                                  border: `1.5px solid ${isSelected ? shopAccents.primary : colors.border.light}`,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    bgcolor: isSelected ? shopAccents.muted : 'rgba(255,255,255,0.04)',
                                    borderColor: isSelected ? shopAccents.primary : colors.text.muted,
                                  },
                                }}
                              />
                            );
                          })}
                        </Box>
                      </Box>
                    );
                  })}
                  {matchedVariant && (
                    <Paper sx={{
                      p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border.subtle}`,
                      borderRadius: 2, mt: 1,
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>
                          SKU: {matchedVariant.variantSku || '—'}
                        </Typography>
                        <Typography sx={{
                          color: matchedVariant.stock > 0 ? shopAccents.primary : '#ef4444',
                          fontSize: '0.75rem', fontWeight: 500,
                        }}>
                          {matchedVariant.stock > 0 ? `${matchedVariant.stock} in stock` : 'Out of stock'}
                        </Typography>
                      </Box>
                    </Paper>
                  )}
                </Box>
              )}

              {/* ✅ FIXED: Quantity — syncs with cart API when item is in cart */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontWeight: 500, fontSize: '0.85rem', mb: 1.5, color: colors.text.secondary }}>Quantity</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', bgcolor: colors.bg.card,
                    border: `1px solid ${colors.border.subtle}`, borderRadius: 2.5, overflow: 'hidden',
                  }}>
                    <IconButton
                      onClick={() => handleProductQuantityChange(quantity - 1)}
                      disabled={quantity <= 1 || cartLoading}
                      sx={{ borderRadius: 0, px: 2, color: colors.text.secondary }}
                    >
                      <RemoveIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <Typography sx={{ minWidth: 48, textAlign: 'center', fontWeight: 600, fontSize: '0.95rem' }}>{quantity}</Typography>
                    <IconButton
                      onClick={() => handleProductQuantityChange(quantity + 1)}
                      disabled={quantity >= availableStock || cartLoading}
                      sx={{ borderRadius: 0, px: 2, color: colors.text.secondary }}
                    >
                      <AddIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                  <Typography sx={{ color: colors.text.muted, fontSize: '0.85rem' }}>{availableStock} available</Typography>
                  {cartLoading && <CircularProgress size={16} sx={{ color: colors.text.muted }} />}
                </Box>
              </Box>

              {/* Total */}
              <Paper sx={{
                p: 3, bgcolor: shopAccents.muted, border: `1px solid ${shopAccents.border}`,
                borderRadius: 3, mb: 4,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: colors.text.secondary }}>Total</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: shopAccents.primary }}>
                    {formatCurrency(totalPrice, product.currency)}
                  </Typography>
                </Box>
              </Paper>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <SecondaryButton fullWidth onClick={handleAddToCart}
                  disabled={viewOnly || addingToCart || availableStock === 0} startIcon={<ShoppingCartIcon />}>
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </SecondaryButton>
                <PrimaryButton fullWidth onClick={handleBuyNow}
                  disabled={viewOnly || availableStock === 0 || buyNowLoading} endIcon={<EastIcon />}>
                  {buyNowLoading ? 'Preparing...' : availableStock === 0 ? 'Sold Out' : 'Buy Now'}
                </PrimaryButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 5 }}>
                <Button startIcon={isWishlisted ? <FavoriteIcon sx={{ color: '#ef4444' }} /> : <FavoriteBorderIcon />}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  sx={{ color: colors.text.secondary, textTransform: 'none', fontWeight: 500, fontSize: '0.85rem' }}>
                  {isWishlisted ? 'Saved' : 'Save'}
                </Button>
                <Button startIcon={<ShareIcon />}
                  sx={{ color: colors.text.secondary, textTransform: 'none', fontWeight: 500, fontSize: '0.85rem' }}>
                  Share
                </Button>
              </Box>

              {/* Info Cards */}
              <Grid container spacing={2}>
                {[
                  { icon: InventoryIcon, label: 'Type', value: product.inventoryType || 'Physical' },
                  { icon: LocalShippingIcon, label: 'Shipping', value: product.shippingProfile || 'Standard' },
                  { icon: ScaleIcon, label: 'Weight', value: product.weight ? `${product.weight} kg` : 'N/A' },
                  { icon: AccessTimeIcon, label: 'Handling', value: product.handlingTime || '1-2 days' },
                ].map((item, i) => (
                  <Grid item xs={6} key={i}>
                    <Paper sx={{
                      p: 2, bgcolor: colors.bg.card, border: `1px solid ${colors.border.subtle}`, borderRadius: 2.5,
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <item.icon sx={{ color: colors.text.muted, fontSize: 18 }} />
                        <Box>
                          <Typography sx={{ color: colors.text.muted, fontSize: '0.7rem' }}>{item.label}</Typography>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{item.value}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {product.sku && (
                <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem', mt: 3 }}>SKU: {product.sku}</Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Product Details Tabs */}
        <Box sx={{ mt: 8 }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              borderBottom: `1px solid ${colors.border.subtle}`,
              '& .MuiTab-root': {
                color: colors.text.muted, textTransform: 'none', fontSize: '0.95rem', fontWeight: 500, py: 2,
                '&.Mui-selected': { color: shopAccents.primary },
              },
              '& .MuiTabs-indicator': { backgroundColor: shopAccents.primary },
            }}
          >
            <Tab label="Description" />
            <Tab label={`Reviews (${reviewStats?.totalReviews || 0})`} />
            <Tab label="Shipping & Returns" />
          </Tabs>

          {/* Description Tab */}
          {activeTab === 0 && (
            <Box sx={{ py: 4 }}>
              <Typography sx={{ color: colors.text.secondary, lineHeight: 1.8 }}>
                {product.description}
              </Typography>
            </Box>
          )}

          {/* Reviews Tab */}
          {activeTab === 1 && (
            <Box sx={{ py: 4 }}>
              {reviewsLoading && !reviews.length ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {[1, 2, 3].map(i => (
                    <Paper key={i} sx={{ p: 3, bgcolor: colors.bg.card, borderRadius: 3 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Skeleton variant="circular" width={48} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.02)' }} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="30%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.02)' }} />
                          <Skeleton variant="text" width="20%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.02)' }} />
                          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', mt: 2 }} />
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <>
                  {reviewStats && (
                    <ReviewStats stats={reviewStats} shopAccents={shopAccents} onViewAllClick={() => setReviewsDialogOpen(true)} />
                  )}

                  {displayedReviews.length === 0 && !reviewsLoading ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Typography sx={{ color: colors.text.muted, fontSize: '0.95rem', mb: 1 }}>No reviews yet</Typography>
                      <Typography sx={{ color: colors.text.muted, fontSize: '0.8rem' }}>Be the first to review this product</Typography>
                    </Box>
                  ) : (
                    <>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 3 }}>Recent Reviews</Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {displayedReviews.slice(0, 3).map((review) => (
                      <ReviewCard
                        key={review.reviewId}
                        review={review}
                        shopAccents={shopAccents}
                        colors={colors}
                        onHelpfulClick={handleHelpfulClick}
                        helpfulLoading={helpfulLoading}
                        onImageClick={(imageUrl) => {
                          setSelectedReviewImage(imageUrl);
                          setImageViewerOpen(true);
                        }}
                      />
                    ))}
                  </Box>

                  {displayedReviews.length > 3 && (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setReviewsDialogOpen(true)}
                        endIcon={<EastIcon />}
                        sx={{
                          borderColor: colors.border.light, color: colors.text.primary,
                          textTransform: 'none', borderRadius: 2.5, px: 4, py: 1.5,
                          '&:hover': { borderColor: shopAccents.primary, bgcolor: shopAccents.soft },
                        }}
                      >
                        See All {reviewStats?.totalReviews} Reviews
                      </Button>
                    </Box>
                  )}
                    </>
                  )}
                </>
              )}
            </Box>
          )}

          {/* Shipping & Returns Tab */}
          {activeTab === 2 && (
            <Box sx={{ py: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, bgcolor: colors.bg.card, borderRadius: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <LocalShippingIcon sx={{ color: shopAccents.primary, fontSize: 24 }} />
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Shipping Information</Typography>
                    </Box>
                    <Typography sx={{ color: colors.text.secondary, lineHeight: 1.8 }}>
                      • Free shipping on orders over $50<br />
                      • Standard delivery: 3-5 business days<br />
                      • Express delivery: 1-2 business days (additional charges apply)<br />
                      • International shipping available to select countries<br />
                      • Tracking provided for all orders
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, bgcolor: colors.bg.card, borderRadius: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <CachedIcon sx={{ color: shopAccents.primary, fontSize: 24 }} />
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Returns & Exchanges</Typography>
                    </Box>
                    <Typography sx={{ color: colors.text.secondary, lineHeight: 1.8 }}>
                      • 30-day return policy<br />
                      • Free returns within 14 days of delivery<br />
                      • Items must be unused and in original packaging<br />
                      • Refund processed within 5-7 business days<br />
                      • Contact support for exchange requests
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>

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
                    width: 52, height: 52, borderRadius: 3, bgcolor: shopAccents.muted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
                  }}>
                    <item.icon sx={{ color: shopAccents.primary, fontSize: 24 }} />
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
                  const itemProduct = getCartItemProduct(item);
                  return (
                    <Paper key={item.cartItemId} sx={{
                      p: 2, bgcolor: colors.bg.card, border: `1px solid ${colors.border.subtle}`, borderRadius: 3,
                    }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {itemProduct && (
                          <Box component="img" src={itemProduct.images[0]?.imageUrl} alt={itemProduct.name}
                            sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'cover' }} />
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {itemProduct?.name || `Product #${item.productId}`}
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
                  {formatCurrency(cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0))}
                </Typography>
              </Box>
              <PrimaryButton fullWidth onClick={() => { setCartDrawerOpen(false); setCheckoutDialogOpen(true); }} disabled={cartLoading} endIcon={<EastIcon />}>
                Checkout
              </PrimaryButton>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* ==================== IMAGE ZOOM DIALOG ==================== */}
      <Dialog open={imageZoomOpen} onClose={() => setImageZoomOpen(false)} maxWidth="lg" fullWidth
        PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.95)', backgroundImage: 'none' } }}>
        <DialogContent sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <img
            src={product?.images[selectedImage]?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200'}
            alt={product?.name}
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
          />
        </DialogContent>
      </Dialog>

      {/* Reviews Dialog */}
      <ReviewsDialog
        open={reviewsDialogOpen}
        onClose={() => setReviewsDialogOpen(false)}
        reviews={displayedReviews}
        stats={reviewStats}
        loading={reviewsLoading}
        filterRating={reviewFilterRating}
        onFilterChange={handleFilterChange}
        sortBy={reviewSortBy}
        onSortChange={handleSortChange}
        hasMore={hasMoreReviews}
        onLoadMore={handleLoadMoreReviews}
        onHelpfulClick={handleHelpfulClick}
        helpfulLoading={helpfulLoading}
        onImageClick={(imageUrl) => {
          setSelectedReviewImage(imageUrl);
          setImageViewerOpen(true);
        }}
        shopAccents={shopAccents}
        colors={colors}
      />

      {/* Review Image Viewer */}
      <ReviewImageViewer
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        imageUrl={selectedReviewImage}
      />

      {/* ==================== CHECKOUT DIALOG WITH SHIPPING ==================== */}
      <Dialog
        open={checkoutDialogOpen}
        onClose={() => !checkoutLoading && setCheckoutDialogOpen(false)}
        maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.bg.secondary, backgroundImage: 'none', borderRadius: 4,
            border: `1px solid ${colors.border.subtle}`, maxHeight: '90vh',
          },
        }}
      >
        {/* Dialog Header */}
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
              {addressFormMode === 'add' ? 'Add New Address' : addressFormMode === 'edit' ? 'Edit Address' : 'Complete Order'}
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
          {/* ===== ADDRESS FORM ===== */}
          {addressFormMode ? (
            <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
              <Fade in timeout={300}>
                <Box>
                  {/* Category Selection */}
                  <Typography sx={{ fontSize: '0.75rem', color: colors.text.muted, mb: 1, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Address Type
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    {ADDRESS_CATEGORIES.map((cat) => {
                      const isSelected = addressForm.addressCategory === cat.value;
                      return (
                        <Chip
                          key={cat.value}
                          icon={<cat.icon sx={{ fontSize: 16, color: isSelected ? cat.color : colors.text.muted }} />}
                          label={cat.label}
                          onClick={() => setAddressForm(prev => ({ ...prev, addressCategory: cat.value }))}
                          sx={{
                            borderRadius: 2, fontSize: '0.8rem', fontWeight: 500,
                            bgcolor: isSelected ? `${cat.color}15` : 'transparent',
                            color: isSelected ? cat.color : colors.text.secondary,
                            border: `1px solid ${isSelected ? `${cat.color}40` : colors.border.subtle}`,
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
                        options={countries}
                        getOptionLabel={(option) => option.country || ''}
                        value={countries.find(c => c.country === addressForm.country) || null}
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
                      <TextField label="Phone" size="small" fullWidth required value={addressForm.phone}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon sx={{ fontSize: 18, color: colors.text.muted }} /></InputAdornment> }}
                        sx={textFieldSx} />
                    </Grid>
                  </Grid>

                  {/* Set as Default */}
                  <Box
                    onClick={() => setAddressForm(prev => ({ ...prev, isDefault: prev.isDefault ? 0 : 1 }))}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, mt: 2.5, p: 1.5, borderRadius: 2.5,
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      bgcolor: addressForm.isDefault ? shopAccents.soft : 'transparent',
                      border: `1px solid ${addressForm.isDefault ? shopAccents.border : colors.border.subtle}`,
                      '&:hover': { bgcolor: addressForm.isDefault ? shopAccents.soft : 'rgba(255,255,255,0.02)' },
                    }}
                  >
                    {addressForm.isDefault ? (
                      <BookmarkIcon sx={{ fontSize: 20, color: shopAccents.primary }} />
                    ) : (
                      <BookmarkBorderIcon sx={{ fontSize: 20, color: colors.text.muted }} />
                    )}
                    <Box>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: addressForm.isDefault ? shopAccents.primary : colors.text.primary }}>
                        Set as default address
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: colors.text.muted }}>
                        Auto-select this address for future orders
                      </Typography>
                    </Box>
                  </Box>

                  {/* Save Button */}
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
            /* ===== ADDRESS LIST + SHIPPING + ORDER SUMMARY ===== */
            <Box sx={{ overflowY: 'auto', flex: 1 }}>
              {/* Order Items Summary with Management */}
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 2 }}>Order Items</Typography>
                
                {cartItems.length === 0 ? (
                  <Paper sx={{
                    p: 4, textAlign: 'center', bgcolor: colors.bg.card,
                    border: `1px dashed ${colors.border.light}`, borderRadius: 3,
                  }}>
                    <ShoppingCartIcon sx={{ fontSize: 40, color: colors.text.muted, mb: 1.5 }} />
                    <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 0.5 }}>Your cart is empty</Typography>
                    <Typography sx={{ color: colors.text.muted, fontSize: '0.8rem' }}>
                      Add items to proceed with checkout
                    </Typography>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {cartItems.map((item) => {
                      const isCurrentProduct = item.productId === product?.productId && 
                        (item.variantId || 0) === (matchedVariant?.variantId || 0);
                      const itemProduct = getCartItemProduct(item);
                      const itemMaxStock = isCurrentProduct ? availableStock : (itemProduct?.stock || 999);
                      
                      return (
                        <Paper key={item.cartItemId} sx={{ p: 2, bgcolor: colors.bg.card, border: `1px solid ${colors.border.subtle}`, borderRadius: 3 }}>
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
                                  {/* Show variant info for current product */}
                                  {isCurrentProduct && matchedVariant && (
                                    <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>
                                      {variantAttrNames.map((name) => `${name}: ${selectedVariants[name]}`).join(' / ')}
                                    </Typography>
                                  )}
                                  <Typography sx={{ color: colors.text.muted, fontSize: '0.8rem', mt: 0.5 }}>
                                    {formatCurrency(item.unitPrice)} each
                                  </Typography>
                                </Box>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleRemoveItem(item)}
                                  disabled={cartLoading}
                                  sx={{ color: colors.text.muted, '&:hover': { color: colors.danger.primary } }}
                                >
                                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Box>
                              
                              {/* Quantity Controls */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: colors.bg.tertiary, borderRadius: 1.5, p: 0.25 }}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => isCurrentProduct 
                                      ? handleCheckoutQuantityChange(item.quantity - 1) 
                                      : handleUpdateQuantity(item, item.quantity - 1)
                                    } 
                                    disabled={item.quantity <= 1 || cartLoading}
                                  >
                                    <RemoveIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                  <Typography sx={{ minWidth: 28, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                                    {item.quantity}
                                  </Typography>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => isCurrentProduct 
                                      ? handleCheckoutQuantityChange(item.quantity + 1) 
                                      : handleUpdateQuantity(item, Math.min(itemMaxStock, item.quantity + 1))
                                    } 
                                    disabled={item.quantity >= itemMaxStock || cartLoading}
                                  >
                                    <AddIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {cartLoading && <CircularProgress size={14} sx={{ color: colors.text.muted }} />}
                                  <Typography sx={{ fontWeight: 600, color: shopAccents.primary, fontSize: '0.95rem' }}>
                                    {formatCurrency(item.unitPrice * item.quantity)}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              {/* Stock Indicator */}
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

              {/* Shipping Address Section */}
              <Box sx={{ px: 3, pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShippingIcon sx={{ fontSize: 18, color: shopAccents.primary }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Delivery Address</Typography>
                  </Box>
                  <Button size="small" startIcon={<AddLocationAltOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={handleOpenAddForm}
                    sx={{
                      textTransform: 'none', fontSize: '0.8rem', fontWeight: 500,
                      color: shopAccents.primary, borderRadius: 2, px: 1.5,
                      '&:hover': { bgcolor: shopAccents.soft },
                    }}>
                    Add New
                  </Button>
                </Box>

                {/* Loading */}
                {addressesLoading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    {[1, 2].map(i => (
                      <Skeleton key={i} variant="rectangular" height={88} sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)' }} />
                    ))}
                  </Box>
                ) : savedAddresses.length === 0 ? (
                  <Paper sx={{
                    p: 4, textAlign: 'center', bgcolor: colors.bg.card,
                    border: `1px dashed ${colors.border.light}`, borderRadius: 3, mb: 3,
                  }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 40, color: colors.text.muted, mb: 1.5 }} />
                    <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 0.5 }}>No saved addresses</Typography>
                    <Typography sx={{ color: colors.text.muted, fontSize: '0.8rem', mb: 2.5 }}>
                      Add a delivery address to proceed with checkout
                    </Typography>
                    <PrimaryButton size="small" onClick={handleOpenAddForm} startIcon={<AddIcon sx={{ fontSize: 16 }} />} sx={{ px: 3, py: 1 }}>
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
                          <AddressCard selected={isSelected} onClick={() => handleSelectAddress(addr.addressId)} elevation={0}>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                              <Box sx={{ pt: 0.25 }}>
                                {isSelected ? (
                                  <CheckCircleIcon sx={{ fontSize: 22, color: shopAccents.primary }} />
                                ) : (
                                  <RadioButtonUncheckedIcon sx={{ fontSize: 22, color: colors.text.muted }} />
                                )}
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: colors.text.primary }}>
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
                                      bgcolor: shopAccents.muted, color: shopAccents.primary,
                                      border: `1px solid ${shopAccents.border}`,
                                    }} />
                                  )}
                                </Box>
                                <Typography sx={{
                                  color: colors.text.secondary, fontSize: '0.8rem', lineHeight: 1.5, mb: 0.5,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                                </Typography>
                                <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>
                                  {addr.city}, {addr.state} {addr.postalCode} · {addr.country}
                                </Typography>
                                <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem', mt: 0.25 }}>
                                  {addr.phone}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Tooltip title="Edit" placement="left">
                                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                                    sx={{ color: colors.text.muted, width: 30, height: 30, '&:hover': { color: shopAccents.primary, bgcolor: shopAccents.soft } }}>
                                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete" placement="left">
                                  <IconButton size="small"
                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmDialog({ open: true, addressId: addr.addressId }); }}
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

              {/* ===== SHIPPING METHODS SECTION (only for physical products) ===== */}
              {savedAddresses.length > 0 && selectedAddressId && isPhysicalProduct && (
                <>
                  <Divider sx={{ borderColor: colors.border.subtle }} />
                  <Box sx={{ p: 3, pb: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: shopAccents.primary }} />
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Shipping Method</Typography>
                    </Box>

                    {shippingLoading ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                        {[1, 2].map(i => (
                          <Skeleton key={i} variant="rectangular" height={68} sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)' }} />
                        ))}
                      </Box>
                    ) : shippingData.length === 0 ? (
                      <Paper sx={{
                        p: 3, textAlign: 'center', bgcolor: colors.danger.muted,
                        border: `1px solid ${colors.danger.border}`, borderRadius: 3, mb: 3,
                      }}>
                        <WarningAmberIcon sx={{ fontSize: 32, color: colors.danger.primary, mb: 1 }} />
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: colors.danger.primary, mb: 0.5 }}>
                          Delivery Not Available
                        </Typography>
                        <Typography sx={{ color: colors.text.secondary, fontSize: '0.8rem' }}>
                          This product cannot be delivered to your selected address. Please try a different address.
                        </Typography>
                      </Paper>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
                        {shippingData.map((sellerGroup) => (
                          <Box key={sellerGroup.sellerId}>
                            {shippingData.length > 1 && (
                              <Typography sx={{
                                fontSize: '0.7rem', fontWeight: 600, color: colors.text.muted,
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
                                    onClick={() => setSelectedShippingMethods(prev => ({
                                      ...prev, [sellerGroup.sellerId]: method.methodId,
                                    }))}
                                    elevation={0}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                      {isMethodSelected ? (
                                        <CheckCircleIcon sx={{ fontSize: 20, color: shopAccents.primary }} />
                                      ) : (
                                        <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: colors.text.muted }} />
                                      )}
                                      <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                                          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: colors.text.primary }}>
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
                                          <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>
                                            {method.carrier}
                                          </Typography>
                                          <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>·</Typography>
                                          <AccessTimeIcon sx={{ fontSize: 12, color: colors.text.muted }} />
                                          <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>
                                            {method.minDeliveryDays}-{method.maxDeliveryDays} days
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: colors.text.primary }}>
                                        {formatCurrency(method.cost)}
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

              {/* Order Note */}
              {savedAddresses.length > 0 && (
                <>
                  <Divider sx={{ borderColor: colors.border.subtle }} />
                  <Box sx={{ p: 3, pt: 2.5 }}>
                    <TextField label="Order Note (Optional)" size="small" fullWidth multiline rows={2}
                      value={orderNote} onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Special instructions for your order..." sx={textFieldSx} />
                  </Box>
                </>
              )}

              {/* Order Summary */}
              {savedAddresses.length > 0 && (
                <Box sx={{ px: 3, pb: 2 }}>
                  <Paper sx={{
                    p: 2.5, bgcolor: colors.bg.elevated,
                    border: `1px solid ${colors.border.subtle}`, borderRadius: 3,
                  }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
                      Order Summary
                    </Typography>
                    
                    {/* All Cart Items */}
                    {cartItems.map((item) => {
                      const itemProd = getCartItemProduct(item);
                      return (
                        <Box key={item.cartItemId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                          <Typography sx={{ color: colors.text.secondary, fontSize: '0.85rem' }}>
                            {itemProd?.name || `Product #${item.productId}`} x {item.quantity}
                          </Typography>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </Typography>
                        </Box>
                      );
                    })}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, mt: 1 }}>
                      <Typography sx={{ color: colors.text.secondary, fontSize: '0.85rem' }}>Shipping</Typography>
                      {!isPhysicalProduct ? (
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: shopAccents.primary }}>
                          Not required
                        </Typography>
                      ) : shippingData.length > 0 && allShippingSelected ? (
                        <Typography sx={{
                          fontSize: '0.85rem', fontWeight: 500,
                          color: totalShipping === 0 ? shopAccents.primary : colors.text.primary,
                        }}>
                          {totalShipping === 0 ? 'Free' : formatCurrency(totalShipping)}
                        </Typography>
                      ) : (
                        <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted, fontStyle: 'italic' }}>
                          {shippingLoading ? 'Calculating...' : selectedAddressId ? (isUndeliverable ? 'Not available' : 'Select method') : 'Select address'}
                        </Typography>
                      )}
                    </Box>
                    <Divider sx={{ borderColor: colors.border.subtle, my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Total</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: shopAccents.primary }}>
                        {(() => {
                          const itemsSubtotal = cartItems.reduce(
                            (sum, item) => sum + (item.unitPrice * item.quantity), 0
                          );
                          
                          if (!isPhysicalProduct) {
                            return formatCurrency(itemsSubtotal, product?.currency);
                          }
                          if (shippingData.length > 0 && allShippingSelected) {
                            return formatCurrency(itemsSubtotal + totalShipping, product?.currency);
                          }
                          return formatCurrency(itemsSubtotal, product?.currency);
                        })()}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        {/* Dialog Footer - Place Order */}
        {!addressFormMode && savedAddresses.length > 0 && (
          <DialogActions sx={{ p: 3, pt: 1.5, borderTop: `1px solid ${colors.border.subtle}`, gap: 1 }}>
            <SecondaryButton onClick={() => setCheckoutDialogOpen(false)} disabled={checkoutLoading}>Cancel</SecondaryButton>
            <PrimaryButton
              onClick={handleDirectCheckout}
              disabled={
                checkoutLoading ||
                cartItems.length === 0 ||
                !selectedAddressId ||
                isUndeliverable ||
                (isPhysicalProduct && shippingData.length > 0 && !allShippingSelected) ||
                shippingLoading
              }
              sx={{ flex: 1 }}
              endIcon={checkoutLoading ? <CircularProgress size={16} color="inherit" /> : <EastIcon />}
            >
              {checkoutLoading ? 'Processing...' : isUndeliverable ? 'Delivery Not Available' : 'Place Order'}
            </PrimaryButton>
          </DialogActions>
        )}
      </Dialog>

      {/* ==================== DELETE CONFIRM DIALOG ==================== */}
      <Dialog
        open={deleteConfirmDialog.open}
        onClose={() => !addressDeleting && setDeleteConfirmDialog({ open: false, addressId: null })}
        maxWidth="xs" fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.bg.secondary, backgroundImage: 'none', borderRadius: 3,
            border: `1px solid ${colors.border.subtle}`,
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '50%', bgcolor: colors.danger.muted,
            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
          }}>
            <WarningAmberIcon sx={{ fontSize: 28, color: colors.danger.primary }} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', mb: 1 }}>Delete Address?</Typography>
          <Typography sx={{ color: colors.text.secondary, fontSize: '0.875rem' }}>
            This action cannot be undone. The address will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1, justifyContent: 'center', gap: 1 }}>
          <SecondaryButton onClick={() => setDeleteConfirmDialog({ open: false, addressId: null })} disabled={addressDeleting} sx={{ minWidth: 100 }}>
            Cancel
          </SecondaryButton>
          <Button onClick={() => handleDeleteAddress(deleteConfirmDialog.addressId)} disabled={addressDeleting}
            sx={{
              bgcolor: colors.danger.primary, color: '#fff', fontWeight: 600,
              borderRadius: 2.5, px: 3, py: 1, textTransform: 'none', minWidth: 100, fontSize: '0.875rem',
              '&:hover': { bgcolor: '#dc2626' },
              '&:disabled': { bgcolor: 'rgba(255,255,255,0.06)', color: colors.text.muted },
            }}
            endIcon={addressDeleting ? <CircularProgress size={14} color="inherit" /> : null}>
            {addressDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== SUCCESS DIALOG ==================== */}
      <Dialog
        open={orderSuccessDialog.open}
        onClose={() => setOrderSuccessDialog({ open: false, orderNumber: '' })}
        maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.bg.secondary, backgroundImage: 'none', borderRadius: 4,
            border: `1px solid ${shopAccents.border}`, textAlign: 'center', py: 4,
          },
        }}
      >
        <DialogContent>
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%', bgcolor: shopAccents.muted,
            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3,
          }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 40, color: shopAccents.primary }} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '1.5rem', mb: 1 }}>Order Confirmed</Typography>
          <Typography sx={{ color: colors.text.secondary, mb: 3 }}>Thank you for your purchase</Typography>
          <Paper sx={{
            py: 2, px: 3, bgcolor: colors.bg.card, border: `1px solid ${colors.border.subtle}`,
            borderRadius: 2, display: 'inline-block', mb: 4,
          }}>
            <Typography sx={{ color: colors.text.muted, fontSize: '0.7rem', mb: 0.5 }}>ORDER NUMBER</Typography>
            <Typography sx={{ fontWeight: 600, fontFamily: 'monospace', letterSpacing: 1 }}>#{orderSuccessDialog.orderNumber}</Typography>
          </Paper>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <SecondaryButton onClick={() => { setOrderSuccessDialog({ open: false, orderNumber: '' }); navigateToOrders(); }}>
              View Orders
            </SecondaryButton>
            <PrimaryButton onClick={() => { setOrderSuccessDialog({ open: false, orderNumber: '' }); navigateToShop(); }}>
              Continue Shopping
            </PrimaryButton>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} variant="filled"
          sx={{ borderRadius: 2, fontWeight: 500 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}