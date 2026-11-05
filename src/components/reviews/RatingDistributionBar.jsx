import React from 'react';
import { Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

/**
 * Rating Distribution Bar Component
 * @param {Object} props
 * @param {number} props.rating - Rating value (1-5)
 * @param {number} props.count - Number of reviews with this rating
 * @param {number} props.total - Total number of reviews
 * @param {string} props.color - Bar color
 * @returns {JSX.Element}
 */
const RatingDistributionBar = ({ rating, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Typography sx={{ minWidth: 30, fontSize: '0.85rem', color: '#fafafa99' }}>{rating}</Typography>
      <StarIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
      <Box sx={{ flex: 1, height: 6, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ width: `${percentage}%`, height: '100%', bgcolor: color, borderRadius: 3 }} />
      </Box>
      <Typography sx={{ minWidth: 40, fontSize: '0.8rem', color: '#fafafa66', textAlign: 'right' }}>{count}</Typography>
    </Box>
  );
};

export default RatingDistributionBar;