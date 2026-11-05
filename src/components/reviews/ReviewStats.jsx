import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import GridViewIcon from '@mui/icons-material/GridView';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import RatingDistributionBar from './RatingDistributionBar';

/**
 * Render star rating
 * @param {number} rating - Rating value (0-5)
 * @param {string} size - Size of stars ('small', 'medium', 'large')
 * @returns {JSX.Element[]} Array of star icons
 */
const renderStars = (rating, size = 'medium') => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  const fontSize = {
    small: 16,
    medium: 20,
    large: 24,
  }[size] || 20;

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
 * Review Statistics Component
 * @param {Object} props
 * @param {Object} props.stats - Review statistics
 * @param {number} props.stats.averageRating - Average rating
 * @param {number} props.stats.totalReviews - Total number of reviews
 * @param {Object} props.stats.ratingDistribution - Rating distribution
 * @param {number} props.stats.verifiedPurchases - Number of verified purchases
 * @param {number} props.stats.recommendedPercentage - Recommended percentage
 * @param {Object} props.shopAccents - Shop accent colors
 * @param {Function} props.onViewAllClick - View all reviews click handler
 * @returns {JSX.Element}
 */
const ReviewStats = ({ stats, shopAccents, onViewAllClick }) => {
  if (!stats) return null;

  return (
    <Paper sx={{
      p: 3, mb: 4, bgcolor: '#0c0c0f',
      border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 3,
    }}>
      <Grid container spacing={3}>
        {/* Average Rating */}
        <Grid item xs={12} md={4} sx={{ textAlign: { md: 'center' } }}>
          <Typography sx={{ fontSize: '3rem', fontWeight: 700, color: '#fafafa', lineHeight: 1 }}>
            {stats.averageRating.toFixed(1)}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' }, gap: 0.5, my: 1 }}>
            {renderStars(stats.averageRating, 'large')}
          </Box>
          <Typography sx={{ color: '#fafafa66', fontSize: '0.9rem' }}>
            Based on {stats.totalReviews} reviews
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'center' }, mt: 2 }}>
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
              label={`${stats.verifiedPurchases} Verified`}
              size="small"
              sx={{ bgcolor: shopAccents.soft, color: shopAccents.primary, border: `1px solid ${shopAccents.border}` }}
            />
            <Chip
              icon={<ThumbUpAltOutlinedIcon sx={{ fontSize: 14 }} />}
              label={`${stats.recommendedPercentage}% Recommend`}
              size="small"
              sx={{ bgcolor: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}
            />
          </Box>
        </Grid>

        {/* Rating Distribution */}
        <Grid item xs={12} md={5}>
          <Box sx={{ px: { md: 2 } }}>
            {[5, 4, 3, 2, 1].map(rating => (
              <RatingDistributionBar
                key={rating}
                rating={rating}
                count={stats.ratingDistribution[rating]}
                total={stats.totalReviews}
                color={rating === 5 ? shopAccents.primary : rating === 4 ? '#60a5fa' : rating === 3 ? '#f59e0b' : rating === 2 ? '#f97316' : '#ef4444'}
              />
            ))}
          </Box>
        </Grid>

        {/* View All Button */}
        <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: { md: 'flex-end' } }}>
          <Button
            variant="outlined"
            onClick={onViewAllClick}
            endIcon={<GridViewIcon />}
            sx={{
              borderColor: 'rgba(255,255,255,0.1)',
              color: '#fafafa',
              textTransform: 'none',
              borderRadius: 2.5,
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: shopAccents.primary,
                bgcolor: shopAccents.soft,
              },
            }}
          >
            View All Reviews
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReviewStats;