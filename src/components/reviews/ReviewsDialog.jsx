import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Skeleton,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import ReviewCard from './ReviewCard';

/**
 * Render star rating
 * @param {number} rating - Rating value (0-5)
 * @param {string} size - Size of stars ('small', 'medium', 'large')
 * @returns {JSX.Element[]} Array of star icons
 */
const renderStars = (rating, size = 'small') => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  const fontSize = {
    small: 16,
    medium: 20,
    large: 24,
  }[size] || 16;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<StarIcon key={i} sx={{ color: '#fbbf24', fontSize }} />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<StarHalfIcon key={i} sx={{ color: '#fbbf24', fontSize }} />);
    } else {
      stars.push(<StarBorderIcon key={i} sx={{ color: 'rgba(255,255,255,0.2)', fontSize }} />);
    }
  }
  return stars;
};

/**
 * Reviews Dialog Component
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close handler
 * @param {Array} props.reviews - Reviews array
 * @param {Object} props.stats - Review statistics
 * @param {boolean} props.loading - Loading state
 * @param {number|null} props.filterRating - Current rating filter
 * @param {Function} props.onFilterChange - Filter change handler
 * @param {string} props.sortBy - Current sort option
 * @param {Function} props.onSortChange - Sort change handler
 * @param {boolean} props.hasMore - Has more reviews flag
 * @param {Function} props.onLoadMore - Load more handler
 * @param {Function} props.onHelpfulClick - Helpful click handler
 * @param {string|null} props.helpfulLoading - Helpful loading state
 * @param {Function} props.onImageClick - Image click handler
 * @param {Object} props.shopAccents - Shop accent colors
 * @param {Object} props.colors - Theme colors
 * @returns {JSX.Element}
 */
const ReviewsDialog = ({
  open,
  onClose,
  reviews,
  stats,
  loading,
  filterRating,
  onFilterChange,
  sortBy,
  onSortChange,
  hasMore,
  onLoadMore,
  onHelpfulClick,
  helpfulLoading,
  onImageClick,
  shopAccents,
  colors,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: colors.bg.secondary,
          backgroundImage: 'none',
          borderRadius: 4,
          border: `1px solid ${colors.border.subtle}`,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{
        borderBottom: `1px solid ${colors.border.subtle}`,
        py: 2,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
            Customer Reviews
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {renderStars(stats?.averageRating || 0, 'small')}
            </Box>
            <Typography sx={{ color: colors.text.secondary, fontSize: '0.85rem' }}>
              {stats?.averageRating.toFixed(1)} · {stats?.totalReviews} reviews
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: colors.text.secondary }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Filter and Sort Bar */}
        <Box sx={{
          p: 2,
          px: 3,
          borderBottom: `1px solid ${colors.border.subtle}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="All Reviews"
              onClick={() => onFilterChange(null)}
              sx={{
                bgcolor: !filterRating ? shopAccents.soft : 'transparent',
                color: !filterRating ? shopAccents.primary : colors.text.secondary,
                border: `1px solid ${!filterRating ? shopAccents.border : colors.border.subtle}`,
                '&:hover': {
                  bgcolor: !filterRating ? shopAccents.soft : 'rgba(255,255,255,0.04)',
                },
              }}
            />
            {[5, 4, 3, 2, 1].map(rating => (
              <Chip
                key={rating}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{rating}</span>
                    <StarIcon sx={{ fontSize: 14 }} />
                  </Box>
                }
                onClick={() => onFilterChange(rating)}
                sx={{
                  bgcolor: filterRating === rating ? shopAccents.soft : 'transparent',
                  color: filterRating === rating ? shopAccents.primary : colors.text.secondary,
                  border: `1px solid ${filterRating === rating ? shopAccents.border : colors.border.subtle}`,
                  '&:hover': {
                    bgcolor: filterRating === rating ? shopAccents.soft : 'rgba(255,255,255,0.04)',
                  },
                }}
              />
            ))}
          </Box>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              sx={{
                bgcolor: colors.bg.card,
                color: colors.text.primary,
                fontSize: '0.85rem',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.border.subtle,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.border.light,
                },
              }}
            >
              <MenuItem value="recent">Most Recent</MenuItem>
              <MenuItem value="helpful">Most Helpful</MenuItem>
              <MenuItem value="rating">Highest Rating</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Reviews List */}
        <Box sx={{ overflowY: 'auto', flex: 1, p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[1, 2, 3].map(i => (
                <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)' }} />
              ))}
            </Box>
          ) : reviews.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ImageSearchIcon sx={{ fontSize: 64, color: colors.text.muted, mb: 2 }} />
              <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', mb: 1 }}>No reviews yet</Typography>
              <Typography sx={{ color: colors.text.muted, fontSize: '0.9rem' }}>
                Be the first to review this product
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {reviews
                .filter(r => !filterRating || r.rating === filterRating)
                .map((review) => (
                  <ReviewCard
                    key={review.reviewId}
                    review={review}
                    shopAccents={shopAccents}
                    colors={colors}
                    onHelpfulClick={onHelpfulClick}
                    helpfulLoading={helpfulLoading}
                    onImageClick={onImageClick}
                    expanded
                  />
                ))}
            </Box>
          )}
        </Box>

        {/* Load More Button */}
        {hasMore && (
          <Box sx={{ p: 2, borderTop: `1px solid ${colors.border.subtle}`, textAlign: 'center' }}>
            <Button
              onClick={onLoadMore}
              disabled={loading}
              sx={{
                color: shopAccents.primary,
                textTransform: 'none',
                '&:hover': { bgcolor: shopAccents.soft },
              }}
            >
              {loading ? 'Loading...' : 'Load More Reviews'}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Need to import StarHalfIcon and StarBorderIcon
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';

export default ReviewsDialog;