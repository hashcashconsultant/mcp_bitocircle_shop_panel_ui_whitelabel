'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Rating,
  Avatar,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';

// Styled component for upload area
const UploadArea = styled(Paper)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? '#f59e0b' : 'rgba(255,255,255,0.2)'}`,
  borderRadius: 3,
  padding: 3,
  backgroundColor: isDragActive ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255,255,255,0.02)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
}));

/**
 * Format currency helper
 */
const formatCurrency = (amount, currency = 'USDB') => {
  return `${currency} ${parseFloat(amount || 0).toFixed(2)}`;
};

/**
 * Order Review Dialog Component with Image Upload
 */
const OrderReviewDialog = ({ open, onClose, order, userId, onReviewSubmitted }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(-1);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);       // base64 previews
  const [imageFiles, setImageFiles] = useState([]); // actual File objects
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];

  const resetForm = () => {
    setSelectedItem(null);
    setRating(5);
    setHoverRating(-1);
    setComment('');
    setImages([]);
    setImageFiles([]);
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setError('');
  };

  const handleBackToList = () => {
    setSelectedItem(null);
    setRating(5);
    setComment('');
    setImages([]);
    setImageFiles([]);
    setError('');
  };

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'File type not supported. Please upload JPEG, PNG, WEBP, or HEIC images.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size too large. Maximum size is 5MB.';
    }
    return null;
  };

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const totalImages = images.length + fileArray.length;

    if (totalImages > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images. Please select fewer files.`);
      return;
    }

    const newImages = [];
    const newFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push(e.target.result);
          if (newImages.length === newFiles.length) {
            setImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
        newFiles.push(file);
      }
    });

    if (newFiles.length > 0) {
      setImageFiles(prev => [...prev, ...newFiles]);
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }
  };

  const handleFileInputChange = (e) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    if (error) setError('');
  };

  const validateReview = () => {
    if (!selectedItem) {
      setError('Please select an item to review');
      return false;
    }
    if (!rating || rating < 1) {
      setError('Please provide a rating');
      return false;
    }
    if (!comment.trim()) {
      setError('Please write a review comment');
      return false;
    }
    if (comment.trim().length < 10) {
      setError('Review comment must be at least 10 characters');
      return false;
    }
    return true;
  };

  /**
   * Submit review via FormData POST to /product-reviews/products/reviews
   *
   * FormData keys:
   *   productId  — text (product ID)
   *   userId     — text (current user ID)
   *   request    — text (JSON string: { rating, reviewText })
   *   images     — file (optional, multiple entries under same key)
   */
  const handleSubmitReview = async () => {
    if (!validateReview()) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();

      // productId
      formData.append('productId', String(selectedItem.productId));

      // userId
      formData.append('userId', String(userId));

      // request — JSON string containing rating + reviewText
      formData.append(
        'request',
        JSON.stringify({
          rating: rating,
          reviewText: comment.trim(),
        })
      );

      // images — append each file under the same "images" key (optional)
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });
      }

      const response = await fetch(
        `${API_BASE_URL}/product-reviews/products/reviews`,
        {
          method: 'POST',
          // Do NOT set Content-Type — browser will set multipart/form-data with boundary
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onReviewSubmitted) {
            onReviewSubmitted(selectedItem);
          }
          handleClose();
        }, 2000);
      } else {
        setError(result.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (item) => {
    if (item.product?.images && item.product.images.length > 0) {
      return item.product.images[0].imageUrl;
    }
    return null;
  };

  const getVariantText = (item) => {
    if (item.variant) {
      return `${item.variant.variantType}: ${item.variant.variantName}`;
    }
    return null;
  };

  const isItemReviewed = (item) => {
    return item.reviewStatus === 'SUBMITTED' || item.isReviewed;
  };

  const reviewableItems = order?.items?.filter(item => !isItemReviewed(item)) || [];
  const reviewedItemsCount = order?.items?.filter(item => isItemReviewed(item)).length || 0;
  const allItemsReviewed = reviewableItems.length === 0 && order?.items?.length > 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1a1a2e',
          backgroundImage: 'none',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.1)',
        },
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        py: 2,
        px: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ShoppingBagIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedItem ? 'Write a Review' : 'Review Products'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {success ? (
          /* ===== Success State ===== */
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#22c55e', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Review Submitted!
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
              Thank you for sharing your feedback
            </Typography>
            <Chip 
              label="Closing automatically..." 
              size="small"
              sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
            />
          </Box>
        ) : allItemsReviewed ? (
          /* ===== All Reviewed State ===== */
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ 
              width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(34, 197, 94, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
            }}>
              <StarIcon sx={{ fontSize: 40, color: '#22c55e' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>All Items Reviewed</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
              You&apos;ve already reviewed all items in this order
            </Typography>
            <Button variant="contained" onClick={handleClose}
              sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}>
              Close
            </Button>
          </Box>
        ) : !selectedItem ? (
          /* ===== Item Selection List ===== */
          <Box>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 0.5 }}>
                Order #{order?.orderNumber}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Placed on {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                }) : 'N/A'}
              </Typography>
              {reviewedItemsCount > 0 && (
                <Chip label={`${reviewedItemsCount} item${reviewedItemsCount > 1 ? 's' : ''} already reviewed`}
                  size="small" sx={{ mt: 1.5, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }} />
              )}
            </Box>

            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, px: 1 }}>
                Select an item to review
              </Typography>
              <Stack spacing={1.5}>
                {order?.items?.map((item, index) => {
                  const isReviewed = isItemReviewed(item);
                  const imageUrl = getProductImage(item);
                  const variantText = getVariantText(item);
                  return (
                    <Paper key={item.orderItemId || index} elevation={0}
                      onClick={() => !isReviewed && handleSelectItem(item)}
                      sx={{
                        p: 2, bgcolor: isReviewed ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid', borderColor: isReviewed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                        borderRadius: 2, cursor: isReviewed ? 'default' : 'pointer', opacity: isReviewed ? 0.7 : 1,
                        transition: 'all 0.2s ease', display: 'flex', gap: 2,
                        '&:hover': !isReviewed && { bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(245, 158, 11, 0.3)' },
                      }}>
                      <Box sx={{ flexShrink: 0 }}>
                        {imageUrl ? (
                          <Avatar src={imageUrl} variant="rounded" sx={{ width: 56, height: 56 }} />
                        ) : (
                          <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.05)' }}>
                            <ImageNotSupportedIcon sx={{ fontSize: 28, color: 'rgba(255,255,255,0.3)' }} />
                          </Avatar>
                        )}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {item.productName || item.product?.productName || 'Product'}
                          </Typography>
                          {isReviewed && (
                            <Chip label="Reviewed" size="small" icon={<CheckCircleOutlineIcon sx={{ fontSize: 12 }} />}
                              sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }} />
                          )}
                        </Box>
                        {variantText && (
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>
                            {variantText}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Qty: {item.quantity}</Typography>
                          <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                            {formatCurrency(item.price, order?.currency)}
                          </Typography>
                        </Box>
                      </Box>
                      {!isReviewed && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b', alignSelf: 'center', opacity: 0.5 }} />
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            </Box>
          </Box>
        ) : (
          /* ===== Review Form ===== */
          <Box sx={{ p: 3 }}>
            {/* Selected item info */}
            <Paper elevation={0} sx={{
              p: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 2, mb: 3, display: 'flex', gap: 2,
            }}>
              <Avatar src={getProductImage(selectedItem)} variant="rounded" sx={{ width: 48, height: 48 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {selectedItem.productName || selectedItem.product?.productName}
                </Typography>
                {getVariantText(selectedItem) && (
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>
                    {getVariantText(selectedItem)}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Quantity: {selectedItem.quantity}
                </Typography>
              </Box>
            </Paper>

            {/* Rating */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Your Rating <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating value={rating} onChange={(e, v) => setRating(v)}
                  onChangeActive={(e, v) => setHoverRating(v)} size="large"
                  icon={<StarIcon fontSize="inherit" sx={{ color: '#fbbf24' }} />}
                  emptyIcon={<StarIcon fontSize="inherit" sx={{ color: 'rgba(255,255,255,0.2)' }} />} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  {hoverRating !== -1 ? hoverRating : rating} / 5
                </Typography>
              </Box>
            </Box>

            {/* Review text */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Your Review <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <TextField fullWidth multiline rows={4}
                placeholder="Share your experience with this product..."
                value={comment} onChange={(e) => setComment(e.target.value)} error={!!error}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.02)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#f59e0b' },
                  },
                }} />
              {comment.trim().length > 0 && comment.trim().length < 10 && (
                <Typography variant="caption" sx={{ color: '#ef4444', mt: 0.5, display: 'block' }}>
                  Review must be at least 10 characters ({10 - comment.trim().length} more)
                </Typography>
              )}
            </Box>

            {/* Image upload */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Add Photos (Optional)
                <Typography component="span" variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', ml: 1 }}>
                  (Max {MAX_IMAGES} images, up to 5MB each)
                </Typography>
              </Typography>

              <UploadArea ref={dropZoneRef} isDragActive={dragActive}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag}
                onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
                  multiple onChange={handleFileInputChange} style={{ display: 'none' }} />
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  {dragActive ? (
                    <>
                      <CloudUploadIcon sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#f59e0b' }}>Drop your images here</Typography>
                    </>
                  ) : (
                    <>
                      <AddPhotoAlternateIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.3)', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Drag & drop images here or click to browse
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mt: 0.5 }}>
                        Supported formats: JPEG, PNG, WEBP, HEIC
                      </Typography>
                    </>
                  )}
                </Box>
              </UploadArea>

              {images.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block' }}>
                    {images.length} of {MAX_IMAGES} images selected
                  </Typography>
                  <ImageList cols={3} gap={8} sx={{ m: 0 }}>
                    {images.map((img, index) => (
                      <ImageListItem key={index} sx={{ position: 'relative' }}>
                        <img src={img} alt={`Review ${index + 1}`} loading="lazy"
                          style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }} />
                        <ImageListItemBar sx={{ background: 'none' }} position="top"
                          actionIcon={
                            <IconButton size="small" onClick={() => handleRemoveImage(index)}
                              sx={{
                                position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.6)',
                                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.8)' },
                              }}>
                              <DeleteOutlineIcon sx={{ fontSize: 16, color: '#fff' }} />
                            </IconButton>
                          } />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}
            </Box>

            {/* Error */}
            {error && (
              <Alert severity="error" sx={{
                mb: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                '& .MuiAlert-icon': { color: '#ef4444' },
              }}>
                <Typography variant="body2">{error}</Typography>
              </Alert>
            )}

            {/* Guidelines */}
            <Paper elevation={0} sx={{
              p: 2, bgcolor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 2,
            }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Review Guidelines:
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                • Be honest and constructive<br />
                • Focus on the product quality and your experience<br />
                • Avoid sharing personal information<br />
                • Your review helps other shoppers make informed decisions<br />
                • Upload clear photos that showcase the product
              </Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>

      {!success && !allItemsReviewed && (
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2, gap: 1 }}>
          {selectedItem ? (
            <>
              <Button onClick={handleBackToList} disabled={loading} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Back to Items
              </Button>
              <Button variant="contained" onClick={handleSubmitReview}
                disabled={loading || !rating || !comment.trim() || comment.trim().length < 10}
                startIcon={loading ? <CircularProgress size={18} /> : <StarIcon />}
                sx={{
                  bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' },
                  '&:disabled': { bgcolor: 'rgba(245, 158, 11, 0.3)' },
                }}>
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>Cancel</Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default OrderReviewDialog;