import React from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Review Image Viewer Component
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.imageUrl - Image URL to display
 * @returns {JSX.Element}
 */
const ReviewImageViewer = ({ open, onClose, imageUrl }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      PaperProps={{
        sx: {
          bgcolor: 'rgba(0,0,0,0.95)',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: '#fff',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            zIndex: 10,
          }}
        >
          <CloseIcon />
        </IconButton>
        <img
          src={imageUrl || ''}
          alt="Review"
          style={{
            maxWidth: '100%',
            maxHeight: '90vh',
            objectFit: 'contain',
            display: 'block',
            margin: '0 auto',
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ReviewImageViewer;