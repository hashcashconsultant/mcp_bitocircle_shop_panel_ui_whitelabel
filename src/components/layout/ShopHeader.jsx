// components/layout/ShopHeader.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  Button,
  Paper,
  Fade,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VerifiedIcon from '@mui/icons-material/Verified';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Animations
const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.2); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
`;

// Theme colors (same as your existing colors)
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
};

// Styled components
const StyledHeader = styled(Box)(({ scrolled, transparent }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1100,
  background: scrolled 
    ? 'rgba(9,9,11,0.85)' 
    : transparent 
      ? 'transparent' 
      : colors.bg.primary,
  backdropFilter: scrolled ? 'blur(20px)' : 'none',
  borderBottom: scrolled 
    ? `1px solid ${colors.border.subtle}` 
    : transparent 
      ? 'none' 
      : `1px solid ${colors.border.subtle}`,
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  animation: `${slideDown} 0.5s ease`,
}));

const LogoBubble = styled(Box)(({ accent }) => ({
  width: 40,
  height: 40,
  borderRadius: 12,
  background: `linear-gradient(135deg, ${accent} 0%, ${accent}aa 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 4px 12px rgba(${parseInt(accent.slice(1, 3), 16)}, ${parseInt(accent.slice(3, 5), 16)}, ${parseInt(accent.slice(5, 7), 16)}, 0.25)`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 8px 24px rgba(${parseInt(accent.slice(1, 3), 16)}, ${parseInt(accent.slice(3, 5), 16)}, ${parseInt(accent.slice(5, 7), 16)}, 0.4)`,
  },
}));

const NavItem = styled(Box)(({ active, accent }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 14px',
  borderRadius: 30,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  background: active ? `rgba(${parseInt(accent.slice(1, 3), 16)}, ${parseInt(accent.slice(3, 5), 16)}, ${parseInt(accent.slice(5, 7), 16)}, 0.1)` : 'transparent',
  color: active ? accent : colors.text.secondary,
  '&:hover': {
    background: active 
      ? `rgba(${parseInt(accent.slice(1, 3), 16)}, ${parseInt(accent.slice(3, 5), 16)}, ${parseInt(accent.slice(5, 7), 16)}, 0.15)` 
      : 'rgba(255,255,255,0.04)',
    color: active ? accent : colors.text.primary,
  },
}));

const CartBadge = styled(Badge)(({ accent }) => ({
  '& .MuiBadge-badge': {
    background: accent,
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.65rem',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    animation: `${pulseGlow} 2s ease-in-out infinite`,
  },
}));

// Main Header Component
export default function ShopHeader({
  shopDetails = null,
  shopCreatorId,
  currentUserId = '4',
  viewOnly = false,
  cartItemsCount = 0,
  onCartClick,
  onNavigate,
  transparent = false,
  accentColor = colors.accent.primary,
  showSearch = false,
  onSearch,
  searchQuery = '',
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parse accent color for rgba
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
      : '16, 185, 129';
  };
  const accentRgb = hexToRgb(accentColor);
  const shopAccents = {
    primary: accentColor,
    muted: `rgba(${accentRgb}, 0.15)`,
    glow: `rgba(${accentRgb}, 0.25)`,
    soft: `rgba(${accentRgb}, 0.08)`,
    border: `rgba(${accentRgb}, 0.3)`,
    gradient: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)`,
  };

  const shopInitial = shopDetails?.shopName?.charAt(0)?.toUpperCase() || 'S';
  const isShopPage = pathname?.includes('/shop');
  const isProductPage = pathname?.includes('/product');
  const isOrdersPage = pathname?.includes('/my-order');

  // Navigation handlers
  const handleNavigate = (path, params = {}) => {
    const searchParams = new URLSearchParams({
      ...params,
      ...(shopCreatorId && { shopCreatorId }),
      ...(currentUserId && { userId: currentUserId }),
      ...(viewOnly && { viewOnly: 'true' }),
    });
    router.push(`${path}?${searchParams.toString()}`);
    setMobileMenuOpen(false);
    if (onNavigate) onNavigate();
  };

  const handleNavigateHome = () => {
    handleNavigate('/shop', {});
  };

  const handleNavigateToOrders = () => {
    handleNavigate('/my-order', {});
  };

  const handleNavigateToProduct = (productId) => {
    handleNavigate('/product', { productId });
  };

  // Profile menu handlers
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  // Search handler
  const handleSearchChange = (e) => {
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <StyledHeader scrolled={scrolled} transparent={transparent}>
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 } }}>
        {/* Main Header Row */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          height: { xs: 64, md: 72 },
        }}>
          {/* Left Section - Logo + Shop Identity */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Mobile Menu Button */}
            <IconButton
              onClick={() => setMobileMenuOpen(true)}
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                color: colors.text.secondary,
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo/Back Button - Only show on product pages */}
            {isProductPage ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={handleNavigateHome}
                  sx={{ 
                    color: colors.text.secondary,
                    '&:hover': { color: colors.text.primary, bgcolor: 'rgba(255,255,255,0.04)' },
                  }}
                >
                  <ArrowBackIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <Divider orientation="vertical" flexItem sx={{ borderColor: colors.border.subtle }} />
              </Box>
            ) : null}

            {/* Shop Identity */}
            <Box
              onClick={handleNavigateHome}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                cursor: 'pointer',
                '&:hover .shop-name': { color: shopAccents.primary },
              }}
            >
              <LogoBubble accent={accentColor}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
                  {shopInitial}
                </Typography>
              </LogoBubble>
              
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography 
                    className="shop-name"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1rem',
                      color: colors.text.primary,
                      letterSpacing: '-0.02em',
                      transition: 'color 0.2s',
                    }}
                  >
                    {shopDetails?.shopName || 'Store'}
                  </Typography>
                  {shopDetails?.reviewStatus === 'APPROVED' && (
                    <VerifiedIcon sx={{ color: shopAccents.primary, fontSize: 14 }} />
                  )}
                </Box>
                <Typography sx={{ 
                  fontSize: '0.65rem', 
                  color: colors.text.muted, 
                  letterSpacing: '0.06em', 
                  textTransform: 'uppercase' 
                }}>
                  {shopDetails?.shopStatus === 'ACTIVE' ? 'Active Shop' : 'Shop'}
                </Typography>
              </Box>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 3 }}>
              <NavItem 
                active={isShopPage}
                accent={accentColor}
                onClick={handleNavigateHome}
              >
                <StorefrontIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>Shop</Typography>
              </NavItem>
              
              <NavItem 
                active={isOrdersPage}
                accent={accentColor}
                onClick={handleNavigateToOrders}
              >
                <ReceiptLongIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>Orders</Typography>
              </NavItem>
            </Box>
          </Box>

          {/* Center Section - Search (optional) */}
          {showSearch && (
            <Box sx={{ 
              display: { xs: 'none', md: 'block' }, 
              flex: 1, 
              maxWidth: 500,
              mx: 3,
            }}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="input"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  sx={{
                    width: '100%',
                    height: 44,
                    px: 3,
                    py: 1.5,
                    bgcolor: colors.bg.card,
                    border: `1.5px solid ${searchFocused ? shopAccents.border : colors.border.subtle}`,
                    borderRadius: 30,
                    color: colors.text.primary,
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: searchFocused ? shopAccents.border : colors.border.light,
                    },
                    '&::placeholder': {
                      color: colors.text.muted,
                    },
                  }}
                />
                <SearchIcon sx={{ 
                  position: 'absolute', 
                  right: 14, 
                  top: 12, 
                  fontSize: 20,
                  color: searchFocused ? shopAccents.primary : colors.text.muted,
                  transition: 'color 0.2s',
                }} />
              </Box>
            </Box>
          )}

          {/* Right Section - Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* View Only Chip */}
            {viewOnly && (
              <Chip 
                label="Preview" 
                size="small" 
                sx={{
                  bgcolor: 'rgba(251, 191, 36, 0.1)',
                  color: '#fbbf24',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  display: { xs: 'none', sm: 'flex' },
                }} 
              />
            )}

            {/* Notifications */}
            {!viewOnly && (
              <Tooltip title="Notifications">
                <IconButton
                  onClick={handleNotificationsOpen}
                  sx={{ 
                    color: colors.text.secondary,
                    '&:hover': { color: colors.text.primary, bgcolor: 'rgba(255,255,255,0.04)' },
                  }}
                >
                  <Badge
                    badgeContent={3}
                    sx={{
                      '& .MuiBadge-badge': {
                        background: shopAccents.primary,
                        color: '#fff',
                        fontSize: '0.6rem',
                        minWidth: 16,
                        height: 16,
                      },
                    }}
                  >
                    <NotificationsNoneIcon sx={{ fontSize: 22 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* Cart */}
            {!viewOnly && (
              <Tooltip title="Cart">
                <IconButton
                  onClick={onCartClick}
                  sx={{ 
                    color: colors.text.secondary,
                    '&:hover': { color: shopAccents.primary, bgcolor: shopAccents.soft },
                    mr: { xs: 0, sm: 1 },
                  }}
                >
                  <CartBadge badgeContent={cartItemsCount} accent={shopAccents.primary}>
                    <ShoppingCartIcon sx={{ fontSize: 22 }} />
                  </CartBadge>
                </IconButton>
              </Tooltip>
            )}

            {/* Profile Menu */}
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ 
                  p: 0.5,
                  border: `1.5px solid ${colors.border.subtle}`,
                  '&:hover': { borderColor: shopAccents.border },
                }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: shopAccents.muted,
                    color: shopAccents.primary,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  U
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Mobile Search Bar (if enabled) */}
        {showSearch && (
          <Box sx={{ 
            display: { xs: 'block', md: 'none' }, 
            pb: 2,
          }}>
            <Box sx={{ position: 'relative' }}>
              <Box
                component="input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                sx={{
                  width: '100%',
                  height: 40,
                  px: 3,
                  py: 1.5,
                  bgcolor: colors.bg.card,
                  border: `1.5px solid ${searchFocused ? shopAccents.border : colors.border.subtle}`,
                  borderRadius: 30,
                  color: colors.text.primary,
                  fontSize: '0.85rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: searchFocused ? shopAccents.border : colors.border.light,
                  },
                  '&::placeholder': {
                    color: colors.text.muted,
                  },
                }}
              />
              <SearchIcon sx={{ 
                position: 'absolute', 
                right: 12, 
                top: 10, 
                fontSize: 18,
                color: searchFocused ? shopAccents.primary : colors.text.muted,
                transition: 'color 0.2s',
              }} />
            </Box>
          </Box>
        )}
      </Box>

      {/* Shop Info Strip (compact) - only show on shop page when not scrolled much */}
      {!scrolled && shopDetails && (shopDetails.contactEmail || shopDetails.policiesUrl || shopDetails.description) && (
        <Fade in timeout={300}>
          <Box sx={{
            borderTop: `1px solid ${colors.border.subtle}`,
            background: `linear-gradient(135deg, ${shopAccents.soft} 0%, transparent 50%, ${shopAccents.soft} 100%)`,
          }}>
            <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 }, py: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 2, md: 3 }, 
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}>
                {shopDetails.description && (
                  <Typography sx={{
                    color: colors.text.secondary,
                    fontSize: '0.75rem',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    maxWidth: 400,
                  }}>
                    {shopDetails.description}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
                  {shopDetails.contactEmail && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmailOutlinedIcon sx={{ fontSize: 14, color: colors.text.muted }} />
                      <Typography
                        component="a"
                        href={`mailto:${shopDetails.contactEmail}`}
                        sx={{
                          fontSize: '0.7rem',
                          color: colors.text.muted,
                          textDecoration: 'none',
                          '&:hover': { color: shopAccents.primary, textDecoration: 'underline' },
                          transition: 'color 0.2s',
                        }}
                      >
                        {shopDetails.contactEmail}
                      </Typography>
                    </Box>
                  )}
                  
                  {shopDetails.policiesUrl && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PolicyOutlinedIcon sx={{ fontSize: 14, color: colors.text.muted }} />
                      <Typography
                        component="a"
                        href={shopDetails.policiesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          fontSize: '0.7rem',
                          color: colors.text.muted,
                          textDecoration: 'none',
                          '&:hover': { color: shopAccents.primary, textDecoration: 'underline' },
                          transition: 'color 0.2s',
                        }}
                      >
                        Policies
                      </Typography>
                    </Box>
                  )}

                  {shopDetails.shippingProfile && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocalShippingOutlinedIcon sx={{ fontSize: 14, color: colors.text.muted }} />
                      <Typography sx={{ fontSize: '0.7rem', color: colors.text.muted }}>
                        {shopDetails.shippingProfile}
                      </Typography>
                    </Box>
                  )}

                  {shopDetails.handlingTime && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 14, color: colors.text.muted }} />
                      <Typography sx={{ fontSize: '0.7rem', color: colors.text.muted }}>
                        {shopDetails.handlingTime}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Fade>
      )}

      {/* Profile Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            bgcolor: colors.bg.secondary,
            backgroundImage: 'none',
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: 3,
            minWidth: 240,
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>John Doe</Typography>
          <Typography sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>john.doe@example.com</Typography>
        </Box>
        
        <MenuItem onClick={() => { handleProfileMenuClose(); handleNavigateHome(); }} sx={{ py: 1.5 }}>
          <ListItemIcon><HomeOutlinedIcon sx={{ fontSize: 18, color: colors.text.secondary }} /></ListItemIcon>
          <ListItemText primary={<Typography sx={{ fontSize: '0.85rem' }}>Shop Home</Typography>} />
        </MenuItem>
        
        <MenuItem onClick={() => { handleProfileMenuClose(); handleNavigateToOrders(); }} sx={{ py: 1.5 }}>
          <ListItemIcon><ReceiptLongIcon sx={{ fontSize: 18, color: colors.text.secondary }} /></ListItemIcon>
          <ListItemText primary={<Typography sx={{ fontSize: '0.85rem' }}>My Orders</Typography>} />
        </MenuItem>
        
        <MenuItem sx={{ py: 1.5 }}>
          <ListItemIcon><FavoriteBorderIcon sx={{ fontSize: 18, color: colors.text.secondary }} /></ListItemIcon>
          <ListItemText primary={<Typography sx={{ fontSize: '0.85rem' }}>Wishlist</Typography>} />
        </MenuItem>
        
        <MenuItem sx={{ py: 1.5 }}>
          <ListItemIcon><SettingsOutlinedIcon sx={{ fontSize: 18, color: colors.text.secondary }} /></ListItemIcon>
          <ListItemText primary={<Typography sx={{ fontSize: '0.85rem' }}>Settings</Typography>} />
        </MenuItem>
        
        <Divider sx={{ borderColor: colors.border.subtle, my: 1 }} />
        
        <MenuItem sx={{ py: 1.5, color: '#ef4444' }}>
          <ListItemIcon><LogoutIcon sx={{ fontSize: 18, color: '#ef4444' }} /></ListItemIcon>
          <ListItemText primary={<Typography sx={{ fontSize: '0.85rem', color: '#ef4444' }}>Logout</Typography>} />
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            bgcolor: colors.bg.secondary,
            backgroundImage: 'none',
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: 3,
            minWidth: 300,
            maxWidth: 360,
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Notifications</Typography>
        </Box>
        
        {[1, 2, 3].map((_, i) => (
          <MenuItem key={i} onClick={handleNotificationsClose} sx={{ py: 2, px: 2, borderBottom: i < 2 ? `1px solid ${colors.border.subtle}` : 'none' }}>
            <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: shopAccents.soft, color: shopAccents.primary }}>
                {i === 0 ? '📦' : i === 1 ? '⭐' : '🏷️'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 500, fontSize: '0.8rem', mb: 0.25 }}>
                  {i === 0 ? 'Order Shipped' : i === 1 ? 'New Review' : 'Price Drop'}
                </Typography>
                <Typography sx={{ color: colors.text.muted, fontSize: '0.7rem' }}>
                  {i === 0 ? 'Your order #1234 has been shipped' : i === 1 ? 'Someone reviewed your purchase' : 'An item in your wishlist is on sale'}
                </Typography>
                <Typography sx={{ color: colors.text.muted, fontSize: '0.65rem', mt: 0.5 }}>
                  {i * 10} min ago
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
        
        <Box sx={{ p: 1.5, textAlign: 'center' }}>
          <Button 
            size="small"
            sx={{ 
              color: shopAccents.primary, 
              textTransform: 'none',
              fontSize: '0.8rem',
              '&:hover': { bgcolor: shopAccents.soft },
            }}
          >
            View All
          </Button>
        </Box>
      </Menu>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: colors.bg.secondary,
            backgroundImage: 'none',
            borderRight: `1px solid ${colors.border.subtle}`,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${colors.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LogoBubble accent={accentColor}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{shopInitial}</Typography>
            </LogoBubble>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{shopDetails?.shopName || 'Store'}</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: colors.text.muted }}>{shopDetails?.shopStatus || 'Active'}</Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: colors.text.secondary }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box sx={{ p: 2 }}>
          <NavItem 
            active={isShopPage}
            accent={accentColor}
            onClick={() => handleNavigateHome()}
            sx={{ width: '100%', mb: 1 }}
          >
            <StorefrontIcon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, ml: 1 }}>Shop</Typography>
          </NavItem>
          
          <NavItem 
            active={isOrdersPage}
            accent={accentColor}
            onClick={() => handleNavigateToOrders()}
            sx={{ width: '100%', mb: 1 }}
          >
            <ReceiptLongIcon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, ml: 1 }}>Orders</Typography>
          </NavItem>
          
          <NavItem accent={accentColor} sx={{ width: '100%', mb: 1 }}>
            <FavoriteBorderIcon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, ml: 1 }}>Wishlist</Typography>
          </NavItem>
          
          <NavItem accent={accentColor} sx={{ width: '100%', mb: 1 }}>
            <PersonOutlineIcon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, ml: 1 }}>Profile</Typography>
          </NavItem>
        </Box>

        {shopDetails && (
          <Box sx={{ p: 2, borderTop: `1px solid ${colors.border.subtle}`, mt: 'auto' }}>
            {shopDetails.contactEmail && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <EmailOutlinedIcon sx={{ fontSize: 16, color: colors.text.muted }} />
                <Typography sx={{ fontSize: '0.75rem', color: colors.text.muted }}>{shopDetails.contactEmail}</Typography>
              </Box>
            )}
            {shopDetails.policiesUrl && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PolicyOutlinedIcon sx={{ fontSize: 16, color: colors.text.muted }} />
                <Typography sx={{ fontSize: '0.75rem', color: colors.text.muted }}>Shop Policies</Typography>
              </Box>
            )}
          </Box>
        )}
      </Drawer>
    </StyledHeader>
  );
}