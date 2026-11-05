'use client';

import { Box, Typography, Card, CardContent, Grid, Chip, CircularProgress } from '@mui/material';
import { FilterChips } from '@/components/common';
import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';

const contentFilters = [
  { value: 'all', label: 'All' },
  { value: 'REEL', label: 'Reels' },
  { value: 'POST', label: 'Posts' },
  // { value: 'STORY', label: 'Stories' },
];

export default function Content() {
  const { contentFilter, setContentFilter } = useApp();
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch content data from API
  const fetchContentData = async (mediaType) => {
    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem('shopOwnerId');
      
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }

      const url = `${API_BASE_URL}/media/user-with-products?userId=${userId}&mediaType=${mediaType}&offset=0&limit=20`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Transform ALL items (including untagged ones)
        const transformedData = result.data.map((item) => ({
          id: item.mediaId,
          type: item.mediaType.toLowerCase(),
          date: item.taggedAt 
            ? new Date(item.taggedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })
            : new Date(item.lastUpdated).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              }),
          icon: getMediaIcon(item.mediaType),
          taggedProducts: item.productId > 0 ? [`Product ${item.productId}`] : [],
          isTagged: item.productId > 0 && item.taggedAt !== null,
          performance: {
            taps: item.tapsCount,
            views: item.viewsCount,
            sales: item.salesCount,
          },
        }));

        setContentItems(transformedData);
      } else {
        throw new Error(result.message || 'Failed to fetch content');
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err.message);
      setContentItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all content types if filter is 'all'
  const fetchAllContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem('shopOwnerId');
      
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }

      // Fetch all media types
      const mediaTypes = ['POST', 'REEL', 'STORY'];
      const fetchPromises = mediaTypes.map(async (type) => {
        try {
          const url = `${API_BASE_URL}/media/user-with-products?userId=${userId}&mediaType=${type}&offset=0&limit=20`;
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              return result.data; // Return ALL items
            }
          }
          return [];
        } catch (error) {
          console.error(`Error fetching ${type}:`, error);
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      const allMedia = results.flat();

      // Transform combined data
      const transformedData = allMedia.map((item) => ({
        id: item.mediaId,
        type: item.mediaType.toLowerCase(),
        date: item.taggedAt 
          ? new Date(item.taggedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })
          : new Date(item.lastUpdated).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }),
        icon: getMediaIcon(item.mediaType),
        taggedProducts: item.productId > 0 ? [`Product ${item.productId}`] : [],
        isTagged: item.productId > 0 && item.taggedAt !== null,
        performance: {
          taps: item.tapsCount,
          views: item.viewsCount,
          sales: item.salesCount,
        },
      }));

      setContentItems(transformedData);
    } catch (err) {
      console.error('Error fetching all content:', err);
      setError(err.message);
      setContentItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get icon based on media type
  const getMediaIcon = (mediaType) => {
    switch (mediaType) {
      case 'POST':
        return '📸';
      case 'REEL':
        return '🎬';
      case 'STORY':
        return '⚡';
      default:
        return '📱';
    }
  };

  // Fetch data when filter changes
  useEffect(() => {
    if (contentFilter === 'all') {
      fetchAllContent();
    } else {
      fetchContentData(contentFilter);
    }
  }, [contentFilter]);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Content & Product Tags
      </Typography>

      <FilterChips
        filters={contentFilters}
        activeFilter={contentFilter}
        onFilterChange={setContentFilter}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="error" variant="h6">
            Error loading content
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {error}
          </Typography>
        </Box>
      ) : contentItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No content found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Upload some posts, reels, or stories to get started
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {contentItems.map((item) => (
            <Grid item xs={12} sm={6} lg={4} key={item.id}>
              <Card
                sx={{
                  transition: 'all 0.3s ease',
                  opacity: item.isTagged ? 1 : 0.6,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(30, 64, 175, 0.5)',
                    opacity: 1,
                  },
                }}
              >
                <Box
                  sx={{
                    height: 180,
                    background: item.isTagged 
                      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(30, 64, 175, 0.2) 100%)'
                      : 'linear-gradient(135deg, rgba(100, 100, 100, 0.2) 0%, rgba(60, 60, 60, 0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                    position: 'relative',
                  }}
                >
                  {item.icon}
                  {!item.isTagged && (
                    <Chip
                      label="Not Tagged"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 152, 0, 0.2)',
                        border: '1px solid rgba(255, 152, 0, 0.3)',
                        color: '#ffb74d',
                        fontSize: '0.7rem',
                      }}
                    />
                  )}
                </Box>
                <CardContent>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                    {item.date}
                  </Typography>
                  
                  {item.taggedProducts.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                      {item.taggedProducts.map((product, idx) => (
                        <Chip
                          key={idx}
                          label={product}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(30, 64, 175, 0.2)',
                            border: '1px solid rgba(30, 64, 175, 0.3)',
                            color: '#60a5fa',
                            fontSize: '0.75rem',
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ mb: 1.5, minHeight: 28 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                        No products tagged
                      </Typography>
                    </Box>
                  )}
                  
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 1,
                      pt: 1.5,
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>
                        Taps
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatNumber(item.performance.taps)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>
                        Views
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatNumber(item.performance.views)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>
                        Sales
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.performance.sales}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}