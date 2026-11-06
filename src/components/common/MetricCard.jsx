'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function MetricCard({ label, value, change, isPositive }) {
  return (
    <Card
      sx={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography
          variant="caption"
          sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 1 }}
        >
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
          {value}
        </Typography>
        {/* Only when the service sends a change value (today's KPIs have none yet). */}
        {Number.isFinite(Number(change)) && change !== null && change !== undefined && change !== '' && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: isPositive ? '#22c55e' : '#ef4444',
            }}
          >
            {isPositive ? (
              <TrendingUpIcon sx={{ fontSize: 16 }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16 }} />
            )}
            <Typography variant="caption">
              {isPositive ? '+' : '-'}{Math.abs(change)}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
