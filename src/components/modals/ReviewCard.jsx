import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';

/**
 * Format date to relative time
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
const formatReviewDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

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
 * Review Card Component
 * @param {Object} props
 * @param {Object} props.review - Review data
 * @param {string} props.review.reviewId - Review ID
 * @param {string} props.review.userName - User name
 * @param {string} [props.review.userAvatar] - User avatar URL
 * @param {number} props.review.rating - Rating value
 * @param {string} [props.review.title] - Review title
 * @param {string} props.review.comment - Review comment
 * @param {Array} props.review.images - Review images
 * @param {string} props.review.createdAt - Creation date
 * @param {boolean} props.review.verifiedPurchase - Verified purchase flag
 * @param {number} props.review.helpfulCount - Helpful count
 * @param {boolean} props.review.isHelpful - Current user found helpful
 * @param {string} [props.review.variantInfo] - Variant information
 * @param {Object} [props.review.shopResponse] - Shop response
 * @param {Object} props.shopAccents - Shop accent colors
 * @param {Object} props.colors - Theme colors
 * @param {Function} props.onHelpfulClick - Helpful click handler
 * @param {string|null} props.helpfulLoading - Loading state
 * @param {Function} props.onImageClick - Image click handler
 * @param {boolean} [props.expanded=false] - Expanded state
 * @returns {JSX.Element}
 */
const ReviewCard = ({ 
  review, 
  shopAccents, 
  colors, 
  onHelpfulClick, 
  helpfulLoading,
  onImageClick,
  expanded = false 
}) => {
  const [expandedContent, setExpandedContent] = useState(expanded);

  return (
    <Paper sx={{
      p: 3,
      bgcolor: colors.bg.card,
      border: `1px solid ${colors.border.subtle}`,
      borderRadius: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: colors.border.light,
      },
    }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Avatar */}
        <Box sx={{ flexShrink: 0 }}>
          {review.userAvatar ? (
            <img
              src={review.userAvatar}
              alt={review.userName}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: shopAccents.soft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <PersonOutlineIcon sx={{ color: shopAccents.primary, fontSize: 24 }} />
            </Box>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {review.userName}
            </Typography>
            {review.verifiedPurchase && (
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: 12 }} />}
                label="Verified Purchase"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  bgcolor: shopAccents.soft,
                  color: shopAccents.primary,
                  border: `1px solid ${shopAccents.border}`,
                  '& .MuiChip-icon': { ml: '4px' },
                }}
              />
            )}
            <Typography sx={{ color: colors.text.muted, fontSize: '0.7rem', ml: 'auto' }}>
              {formatReviewDate(review.createdAt)}
            </Typography>
          </Box>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 0.25 }}>
              {renderStars(review.rating, 'small')}
            </Box>
            {review.variantInfo && (
              <Typography sx={{ color: colors.text.muted, fontSize: '0.7rem' }}>
                · {review.variantInfo}
              </Typography>
            )}
          </Box>

          {/* Title */}
          {review.title && (
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 1 }}>
              {review.title}
            </Typography>
          )}

          {/* Comment */}
          <Typography sx={{
            color: colors.text.secondary,
            fontSize: '0.9rem',
            lineHeight: 1.6,
            mb: review.images?.length > 0 ? 2 : 1,
            ...(!expandedContent && {
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }),
          }}>
            {review.comment}
          </Typography>

          {/* Read More / Less */}
          {review.comment?.length > 200 && !expanded && (
            <Button
              size="small"
              onClick={() => setExpandedContent(!expandedContent)}
              sx={{
                color: shopAccents.primary,
                textTransform: 'none',
                fontSize: '0.8rem',
                p: 0,
                minWidth: 'auto',
                mb: 1,
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
              }}
            >
              {expandedContent ? 'Show less' : 'Read more'}
            </Button>
          )}

          {/* Images */}
          {review.images?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {review.images.slice(0, 3).map((img, idx) => (
                  <Box
                    key={img.imageId || idx}
                    onClick={() => onImageClick(img.imageUrl)}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: `1px solid ${colors.border.subtle}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        borderColor: shopAccents.primary,
                      },
                    }}
                  >
                    <img
                      src={img.imageUrl}
                      alt="Review"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                ))}
                {review.images.length > 3 && (
                  <Box
                    onClick={() => onImageClick(review.images[0].imageUrl)}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${colors.border.subtle}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: shopAccents.primary,
                        bgcolor: shopAccents.soft,
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted }}>
                      +{review.images.length - 3}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Helpful Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              size="small"
              onClick={() => onHelpfulClick(review.reviewId)}
              disabled={helpfulLoading === review.reviewId}
              startIcon={review.isHelpful ? 
                <ThumbUpIcon sx={{ fontSize: 16, color: shopAccents.primary }} /> : 
                <ThumbUpAltOutlinedIcon sx={{ fontSize: 16 }} />
              }
              sx={{
                color: review.isHelpful ? shopAccents.primary : colors.text.muted,
                textTransform: 'none',
                fontSize: '0.8rem',
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                minWidth: 'auto',
                bgcolor: review.isHelpful ? shopAccents.soft : 'transparent',
                '&:hover': {
                  bgcolor: review.isHelpful ? shopAccents.soft : 'rgba(255,255,255,0.04)',
                },
              }}
            >
              Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
            </Button>

            {review.shopResponse && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StorefrontIcon sx={{ fontSize: 14, color: colors.text.muted }} />
                <Typography sx={{ color: colors.text.muted, fontSize: '0.7rem' }}>
                  Shop responded
                </Typography>
              </Box>
            )}
          </Box>

          {/* Shop Response */}
          {review.shopResponse && (
            <Paper sx={{
              mt: 2,
              p: 2,
              bgcolor: 'rgba(255,255,255,0.02)',
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <StorefrontIcon sx={{ fontSize: 14, color: shopAccents.primary }} />
                <Typography sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Shop Response</Typography>
                <Typography sx={{ color: colors.text.muted, fontSize: '0.65rem', ml: 'auto' }}>
                  {formatReviewDate(review.shopResponse.createdAt)}
                </Typography>
              </Box>
              <Typography sx={{ color: colors.text.secondary, fontSize: '0.85rem', fontStyle: 'italic' }}>
                "{review.shopResponse.comment}"
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ReviewCard;