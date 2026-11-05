'use client';

import { Chip, Box } from '@mui/material';

const statusColors = {
  pending: { bg: 'rgba(250, 204, 21, 0.2)', color: '#facc15' },
  shipped: { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' },
  delivered: { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' },
  refunded: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' },
  held: { bg: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' },
  released: { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' },
  instock: { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' },
  lowstock: { bg: 'rgba(250, 204, 21, 0.2)', color: '#facc15' },
  outstock: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' },
  unlimited: { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' },
  live: { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' },
  active: { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' },
  hidden: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' },
};

const statusLabels = {
  pending: 'Verification Pending',
  shipped: 'Shipped',
  delivered: 'Delivered',
  refunded: 'Refunded',
  held: 'Held',
  released: 'Released',
  instock: 'In Stock',
  lowstock: 'Low Stock',
  outstock: 'Out of Stock',
  unlimited: 'Unlimited',
  live: 'Shop Live',
  active: 'Active',
  hidden: 'Hidden',
};

export default function StatusChip({ status, label, showDot = false, size = 'small', onClick, sx = {} }) {
  const colors = statusColors[status] || statusColors.pending;
  const displayLabel = label || statusLabels[status] || status;

  return (
    <Chip
      size={size}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {showDot && (
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: colors.color,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            />
          )}
          {displayLabel}
        </Box>
      }
      onClick={onClick}
      sx={{
        bgcolor: colors.bg,
        color: colors.color,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
        border: `1px solid ${colors.color}40`,
        ...sx,
      }}
    />
  );
}