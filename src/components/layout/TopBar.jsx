'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { StatusChip } from '@/components/common';
import { useApp } from '@/context/AppContext';
import axios from 'axios';
import { signInUrl } from '@/config/whitelabel';

const drawerWidth = 250;
const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';

export default function TopBar() {
  const { handleDrawerToggle, openShopPreview, showToast } = useApp();

  const [shopOwnerId, setShopOwnerId] = useState('');
  const [isShopVerified, setIsShopVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewData, setReviewData] = useState({
    reviewType: 'initial',
    message: '',
  });
  const [reviewErrors, setReviewErrors] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('shopOwnerId') || '';
      if (!storedId) {
        // Not signed in (or no shop): open the community sign-in page instead of using someone else's id.
        window.location.replace(signInUrl());
        return;
      }
      setShopOwnerId(storedId);
    }
  }, []);

  const pathname = usePathname();

  // Fetch shop verification status. The top bar stays on screen while pages change, so this runs again on
  // every page change (and after a review request); otherwise an approval made meanwhile is not shown.
  const fetchVerificationStatus = useCallback(async () => {
      try {
        const storedShopOwnerId = shopOwnerId;

        const response = await axios.get(
          `${API_BASE_URL}/settings/shops/${storedShopOwnerId}/verification/validate`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data && response.data.success) {
          setIsShopVerified(response.data.data === true);
        }
      } catch (err) {
        console.error('Verification status fetch error:', err);
        setIsShopVerified(false);
      } finally {
        setVerificationLoading(false);
      }
  }, [shopOwnerId]);

  useEffect(() => {
    if (shopOwnerId) {
      fetchVerificationStatus();
    }
  }, [shopOwnerId, pathname, fetchVerificationStatus]);

  const handleOpenReviewModal = () => {
    setReviewModalOpen(true);
    setReviewData({ reviewType: 'initial', message: '' });
    setReviewErrors({});
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setReviewData({ reviewType: 'initial', message: '' });
    setReviewErrors({});
  };

  const handleReviewDataChange = (field) => (event) => {
    setReviewData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Clear error for this field when user starts typing
    if (reviewErrors[field]) {
      setReviewErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateReviewForm = () => {
    const errors = {};

    if (!reviewData.reviewType) {
      errors.reviewType = 'Please select a review type';
    }

    if (!reviewData.message.trim()) {
      errors.message = 'Message is required';
    } else if (reviewData.message.trim().length < 20) {
      errors.message = 'Message must be at least 20 characters long';
    } else if (reviewData.message.length > 1000) {
      errors.message = 'Message cannot exceed 1000 characters';
    }

    setReviewErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReviewSubmit = async () => {
    if (!validateReviewForm()) {
      return;
    }

    setReviewLoading(true);

    try {
      const payload = {
        shopOwnerId: parseInt(shopOwnerId, 10),
        reviewType: reviewData.reviewType,
        message: reviewData.message.trim(),
      };

      const response = await axios.post(`${API_BASE_URL}/settings/review-request`, payload);

      if (response.data.success) {
        showToast(response.data.message || 'Review request submitted successfully!', 'success');
        setReviewModalOpen(false);
        setReviewData({ reviewType: 'initial', message: '' });
        setReviewErrors({});
        fetchVerificationStatus();
      } else {
        showToast(response.data.message || 'Failed to submit review request', 'error');
      }
    } catch (error) {
      console.error('Error submitting review request:', error);
      showToast(
        error.response?.data?.message || 'An error occurred while submitting review request',
        'error'
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const handleStatusClick = () => {
    if (isShopVerified) {
      showToast('Your shop is approved and live.', 'success');
    } else {
      showToast('Shop verification pending. Click "Request Review" to submit or appeal.', 'info');
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Shop Manager
            </Typography>
            {verificationLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={16} sx={{ color: '#fff' }} />
              </Box>
            ) : (
              <StatusChip
                status={isShopVerified ? 'live' : 'pending'}
                showDot={isShopVerified}
                onClick={handleStatusClick}
                sx={{ cursor: 'pointer' }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RateReviewIcon />}
              onClick={handleOpenReviewModal}
              sx={{
                borderColor: isShopVerified
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(250, 204, 21, 0.5)',
                color: isShopVerified ? '#fff' : '#facc15',
                display: { xs: 'none', sm: 'flex' },
                '&:hover': {
                  borderColor: isShopVerified
                    ? 'rgba(255, 255, 255, 0.4)'
                    : 'rgba(250, 204, 21, 0.7)',
                  bgcolor: isShopVerified
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(250, 204, 21, 0.1)',
                },
              }}
            >
              Request Review
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PhoneIphoneIcon />}
              onClick={openShopPreview}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                display: { xs: 'none', sm: 'flex' },
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              View Shop
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<HelpOutlineIcon />}
              onClick={() => {
                const brokerId = localStorage.getItem('brokerId');
                const token = localStorage.getItem('access_token_us');

                if (!brokerId || !token) {
                  showToast('Missing broker information', 'error');
                  return;
                }

                const url = `https://support.paybito.com/brokers/autologin?brokerid=${encodeURIComponent(
                  brokerId
                )}&token=${encodeURIComponent(token)}`;

                window.open(url, "_blank", "noopener,noreferrer");
              }}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                display: { xs: 'none', sm: 'flex' },
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Help
            </Button>

            {/* Mobile: Show only icons */}
            <IconButton
              color="inherit"
              onClick={handleOpenReviewModal}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <RateReviewIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={openShopPreview}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <PhoneIphoneIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Review Request Dialog */}
      <Dialog
        open={reviewModalOpen}
        onClose={handleCloseReviewModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1a1a2e',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Request Shop Review
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <FormControl size="small" fullWidth error={!!reviewErrors.reviewType}>
              <InputLabel>Review Type</InputLabel>
              <Select
                value={reviewData.reviewType}
                onChange={handleReviewDataChange('reviewType')}
                label="Review Type"
              >
                {/* <MenuItem value="initial">Initial Review</MenuItem> */}
                <MenuItem value="appeal">Appeal</MenuItem>
                <MenuItem value="rereview">Re-review</MenuItem>
              </Select>
              {reviewErrors.reviewType && (
                <FormHelperText>{reviewErrors.reviewType}</FormHelperText>
              )}
            </FormControl>
            <TextField
              label="Message"
              fullWidth
              multiline
              rows={4}
              value={reviewData.message}
              onChange={handleReviewDataChange('message')}
              placeholder="Describe the reason for your review request (minimum 20 characters)..."
              size="small"
              error={!!reviewErrors.message}
              helperText={reviewErrors.message || `${reviewData.message.length}/1000 characters`}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={handleCloseReviewModal} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReviewSubmit}
            disabled={reviewLoading}
            sx={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              },
            }}
          >
            {reviewLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}