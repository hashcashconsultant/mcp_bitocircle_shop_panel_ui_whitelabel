'use client';

import { Box, Chip } from '@mui/material';

export default function FilterChips({ filters, activeFilter, onFilterChange }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
      {filters.map((filter) => (
        <Chip
          key={filter.value}
          label={filter.label}
          onClick={() => onFilterChange(filter.value)}
          sx={{
            bgcolor: activeFilter === filter.value 
              ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.3) 0%, rgba(30, 64, 175, 0.1) 100%)'
              : 'rgba(255, 255, 255, 0.05)',
            background: activeFilter === filter.value 
              ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.3) 0%, rgba(30, 64, 175, 0.1) 100%)'
              : 'rgba(255, 255, 255, 0.05)',
            border: activeFilter === filter.value 
              ? '1px solid rgba(30, 64, 175, 0.5)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            color: activeFilter === filter.value ? '#fff' : 'rgba(255, 255, 255, 0.7)',
            fontWeight: 500,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: activeFilter === filter.value 
                ? 'rgba(30, 64, 175, 0.4)'
                : 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
            },
          }}
        />
      ))}
    </Box>
  );
}
