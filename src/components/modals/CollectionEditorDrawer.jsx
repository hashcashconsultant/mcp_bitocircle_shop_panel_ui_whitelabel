'use client';

import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
  Switch,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useApp } from '@/context/AppContext';

export default function CollectionEditorDrawer() {
  const { collectionEditorOpen, closeCollectionEditor, saveCollection, products } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isVisible: true,
  });
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductToggle = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSave = () => {
    saveCollection({
      ...formData,
      productCount: selectedProducts.length,
    });
    setFormData({ name: '', description: '', isVisible: true });
    setSelectedProducts([]);
  };

  const handleClose = () => {
    closeCollectionEditor();
    setFormData({ name: '', description: '', isVisible: true });
    setSelectedProducts([]);
  };

  return (
    <Drawer
      anchor="right"
      open={collectionEditorOpen}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, mt: 8 },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Collection Editor</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Collection Name *"
            fullWidth
            value={formData.name}
            onChange={handleChange('name')}
            size="small"
            placeholder="e.g., Summer Collection"
          />

          <TextField
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange('description')}
            size="small"
            placeholder="Shown as subheading on storefront..."
          />

          <Box
            sx={{
              border: '2px dashed rgba(255,255,255,0.2)',
              borderRadius: 3,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'rgba(30, 64, 175, 0.5)',
                bgcolor: 'rgba(30, 64, 175, 0.05)',
              },
            }}
          >
            <Typography sx={{ fontSize: 32, mb: 1 }}>🖼️</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Upload collection banner
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>Add Products</Typography>
            <Box
              sx={{
                maxHeight: 250,
                overflowY: 'auto',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2.5,
                p: 1.5,
              }}
            >
              {products.map((product) => (
                <FormControlLabel
                  key={product.id}
                  control={
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      size="small"
                    />
                  }
                  label={product.name}
                  sx={{
                    display: 'flex',
                    width: '100%',
                    m: 0,
                    p: 1,
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Collection Visible</Typography>
            <Switch checked={formData.isVisible} onChange={handleChange('isVisible')} />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClose}
              sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              sx={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                },
              }}
            >
              Save Collection
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
