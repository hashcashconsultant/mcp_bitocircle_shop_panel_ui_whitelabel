'use client';

import { Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Avatar } from '@mui/material';
import { FilterChips } from '@/components/common';
import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';

const contentFilters = [
  { value: 'all', label: 'All' },
  { value: 'REEL', label: 'Reels' },
  { value: 'POST', label: 'Posts' },
];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

const formatNumber = (num) => {
  const n = Number(num) || 0;
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
};

/**
 * The API returns one row per post/reel and tagged product. Show one card per post/reel, with all its tagged
 * products and the totals of their taps, views and sales.
 */
const groupByMedia = (rows) => {
  const byMedia = new Map();
  rows.forEach((row) => {
    const key = `${row.mediaType}-${row.mediaId}`;
    if (!byMedia.has(key)) {
      byMedia.set(key, {
        key,
        id: row.mediaId,
        type: (row.mediaType || '').toUpperCase(),
        caption: row.caption || '',
        mediaUrl: row.mediaUrl || null,
        thumbnailUrl: row.thumbnailUrl || null,
        mediaKind: row.mediaKind || (row.mediaType === 'REEL' ? 'VIDEO' : 'IMAGE'),
        date: row.lastUpdated || row.taggedAt,
        products: [],
        performance: { taps: 0, views: 0, sales: 0 },
      });
    }
    const item = byMedia.get(key);
    if (row.productId > 0 && !item.products.some((p) => p.id === row.productId)) {
      item.products.push({ id: row.productId, name: row.productName || `Product ${row.productId}`, imageUrl: row.imageUrl });
      item.performance.taps += Number(row.tapsCount) || 0;
      item.performance.views += Number(row.viewsCount) || 0;
      item.performance.sales += Number(row.salesCount) || 0;
    }
  });
  return [...byMedia.values()].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
};

const fetchMedia = async (userId, mediaType) => {
  const url = `${API_BASE_URL}/media/user-with-products?userId=${userId}&mediaType=${mediaType}&offset=0&limit=20`;
  const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.message || 'Failed to fetch content');
  return result.data || [];
};

/** The post image, or the reel / video cover with a play button that plays it in place. */
function MediaPreview({ item }) {
  const [playing, setPlaying] = useState(false);
  const [broken, setBroken] = useState(false);
  const isVideo = item.mediaKind === 'VIDEO';
  const poster = isVideo ? item.thumbnailUrl : item.mediaUrl || item.thumbnailUrl;

  const frame = {
    height: 220,
    position: 'relative',
    bgcolor: 'rgba(0, 0, 0, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  if (isVideo && playing && item.mediaUrl) {
    return (
      <Box sx={frame}>
        <video src={item.mediaUrl} poster={poster || undefined} controls autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{ ...frame, cursor: isVideo && item.mediaUrl ? 'pointer' : 'default' }}
      onClick={() => isVideo && item.mediaUrl && setPlaying(true)}
    >
      {poster && !broken ? (
        <img src={poster} alt={item.caption || item.type} loading="lazy" onError={() => setBroken(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : isVideo && item.mediaUrl ? (
        <video src={`${item.mediaUrl}#t=0.5`} muted preload="metadata" playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {item.type === 'REEL' ? 'Reel' : 'Post'} preview unavailable
        </Typography>
      )}

      {isVideo && item.mediaUrl && (
        <Box
          sx={{
            position: 'absolute',
            width: 52,
            height: 52,
            borderRadius: '50%',
            bgcolor: 'rgba(0, 0, 0, 0.55)',
            border: '2px solid rgba(255, 255, 255, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ width: 0, height: 0, ml: '4px', borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '16px solid #fff' }} />
        </Box>
      )}

      <Chip
        label={item.type === 'REEL' ? 'Reel' : 'Post'}
        size="small"
        sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(0, 0, 0, 0.6)', color: '#fff', fontSize: '0.7rem' }}
      />
      {item.products.length === 0 && (
        <Chip
          label="Not Tagged"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 152, 0, 0.25)',
            border: '1px solid rgba(255, 152, 0, 0.4)',
            color: '#ffb74d',
            fontSize: '0.7rem',
          }}
        />
      )}
    </Box>
  );
}

export default function Content() {
  const { contentFilter, setContentFilter } = useApp();
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadContent = async (filter) => {
    setLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem('shopOwnerId');
      if (!userId) throw new Error('User ID not found in localStorage');

      const types = filter === 'all' ? ['POST', 'REEL'] : [filter];
      const results = await Promise.all(
        types.map((type) =>
          fetchMedia(userId, type).catch((err) => {
            if (types.length === 1) throw err;
            console.error(`Error fetching ${type}:`, err);
            return [];
          })
        )
      );
      setContentItems(groupByMedia(results.flat()));
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err.message);
      setContentItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent(contentFilter);
  }, [contentFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Content & Product Tags
      </Typography>

      <FilterChips filters={contentFilters} activeFilter={contentFilter} onFilterChange={setContentFilter} />

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
            Your posts and reels will show here with the products tagged in them.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {contentItems.map((item) => (
            <Grid item xs={12} sm={6} lg={4} key={item.key}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' },
                }}
              >
                <MediaPreview item={item} />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.75, display: 'block' }}>
                    {formatDate(item.date)}
                  </Typography>

                  <Typography
                    variant="body2"
                    title={item.caption}
                    sx={{
                      mb: 1.5,
                      minHeight: 40,
                      color: item.caption ? 'text.primary' : 'text.secondary',
                      fontStyle: item.caption ? 'normal' : 'italic',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.caption || 'No caption'}
                  </Typography>

                  {item.products.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                      {item.products.map((product) => (
                        <Chip
                          key={product.id}
                          avatar={product.imageUrl ? <Avatar src={product.imageUrl} alt={product.name} /> : undefined}
                          label={product.name}
                          size="small"
                          sx={{
                            maxWidth: '100%',
                            bgcolor: 'rgba(30, 64, 175, 0.2)',
                            border: '1px solid rgba(30, 64, 175, 0.3)',
                            color: '#60a5fa',
                            fontSize: '0.75rem',
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ mb: 1.5, minHeight: 24 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        No products tagged
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      mt: 'auto',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 1,
                      pt: 1.5,
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {[
                      ['Taps', formatNumber(item.performance.taps)],
                      ['Views', formatNumber(item.performance.views)],
                      ['Sales', item.performance.sales],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {value}
                        </Typography>
                      </Box>
                    ))}
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
