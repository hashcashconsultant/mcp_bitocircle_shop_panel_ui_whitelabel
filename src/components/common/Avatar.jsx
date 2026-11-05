'use client';

import { Avatar as MuiAvatar } from '@mui/material';

export default function Avatar({ initials, gradient, size = 40 }) {
  return (
    <MuiAvatar
      sx={{
        width: size,
        height: size,
        background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontSize: size * 0.35,
        fontWeight: 600,
      }}
    >
      {initials}
    </MuiAvatar>
  );
}
