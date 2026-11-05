'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useApp } from '@/context/AppContext';
import { restrictedProducts } from '@/data/mockData';

export function ShopReviewModal() {
  const { shopReviewModalOpen, setShopReviewModalOpen, showToast } = useApp();
  const [reviewType, setReviewType] = useState('initial');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    showToast("Review request submitted. We'll respond within 24-48 hours.", 'success');
    setShopReviewModalOpen(false);
    setReviewType('initial');
    setMessage('');
  };

  return (
    <Dialog open={shopReviewModalOpen} onClose={() => setShopReviewModalOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Request Shop Review</Typography>
        <IconButton onClick={() => setShopReviewModalOpen(false)} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Review Type</InputLabel>
            <Select value={reviewType} onChange={(e) => setReviewType(e.target.value)} label="Review Type">
              {/* <MenuItem value="initial">Initial Review</MenuItem> */}
              <MenuItem value="appeal">Appeal Previous Decision</MenuItem>
              <MenuItem value="update">Update Review</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Message"
            fullWidth
            multiline
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Explain your request..."
            size="small"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={() => setShopReviewModalOpen(false)} sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            },
          }}
        >
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function RestrictedProductsModal() {
  const { restrictedProductsModalOpen, setRestrictedProductsModalOpen } = useApp();

  return (
    <Dialog open={restrictedProductsModalOpen} onClose={() => setRestrictedProductsModalOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Restricted Products List</Typography>
        <IconButton onClick={() => setRestrictedProductsModalOpen(false)} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            p: 2,
            bgcolor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: 2.5,
            mb: 2.5,
          }}
        >
          <Typography variant="body2" sx={{ color: '#ef4444' }}>
            ⚠️ The following products are prohibited on BitoCircle shops:
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {restrictedProducts.map((item, index) => (
            <Box
              key={index}
              sx={{
                p: 1.5,
                bgcolor: 'rgba(255,255,255,0.02)',
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {item.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          variant="contained"
          onClick={() => setRestrictedProductsModalOpen(false)}
          sx={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            },
          }}
        >
          Got It
        </Button>
      </DialogActions>
    </Dialog>
  );
}
