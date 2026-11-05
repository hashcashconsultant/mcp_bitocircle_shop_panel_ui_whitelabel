'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Divider,
  Paper,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { WHITELABEL } from '@/config/whitelabel';

// ─────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────

const BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';

const SUGGESTED_ATTRIBUTES = {
  Size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Color: ['Black', 'White', 'Red', 'Blue', 'Green', 'Navy', 'Grey', 'Pink'],
  Material: ['Cotton', 'Polyester', 'Silk', 'Linen', 'Wool'],
};

const INITIAL_FORM_DATA = {
  productName: '',
  description: '',
  price: '',
  compareAtPrice: '',
  productType: 'PHYSICAL',
  inventoryType: 'IN_STOCK',
  quantity: '',
  sku: '',
  status: 'PUBLIC',
  weight: '',
  deliveryMethod: 'file',
  profileId: '',
};

const MAX_IMAGES = 5;

// ─────────────────────────────────────────────────────
// Utility: Cartesian product of attribute values
// ─────────────────────────────────────────────────────

function generateCombinations(attributes) {
  const validAttrs = attributes.filter(
    (attr) => attr.name.trim() && attr.values.length > 0
  );
  if (validAttrs.length === 0) return [];

  return validAttrs.reduce((combos, attr) => {
    if (combos.length === 0) {
      return attr.values.map((val) => ({ [attr.name]: val }));
    }
    const newCombos = [];
    combos.forEach((combo) => {
      attr.values.forEach((val) => {
        newCombos.push({ ...combo, [attr.name]: val });
      });
    });
    return newCombos;
  }, []);
}

// "{ Size: M, Color: Red }" → "M-Red"
function comboVariantName(combo) {
  return Object.values(combo).join('-');
}

// Display label: "M / Red" — used as key in variantCombinations state
function comboLabel(combo) {
  return Object.values(combo).join(' / ');
}

// Default SKU: "TSHIRT-001-M-RED"
function comboSku(baseSku, combo) {
  const suffix = Object.values(combo)
    .map((v) => v.replace(/\s+/g, '').toUpperCase())
    .join('-');
  return baseSku ? `${baseSku}-${suffix}` : suffix;
}

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

const mapInventoryType = (type) => {
  if (!type) return 'IN_STOCK';
  const t = type.toUpperCase();
  if (t === 'INSTOCK' || t === 'IN_STOCK') return 'IN_STOCK';
  if (t === 'MADETOORDER' || t === 'MADE_TO_ORDER') return 'MADE_TO_ORDER';
  if (t === 'UNLIMITED') return 'UNLIMITED';
  return 'IN_STOCK';
};

const mapStatus = (s) => {
  if (!s) return 'DRAFT';
  const upper = s.toUpperCase();
  if (['PUBLIC', 'UNLISTED', 'DRAFT'].includes(upper)) return upper;
  if (upper === 'ACTIVE') return 'PUBLIC';
  if (upper === 'HIDDEN') return 'DRAFT';
  return 'DRAFT';
};

// ─────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────

export default function ProductModal({ open, onClose, onSave, product, shopOwnerId }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);

  // Shipping templates state
  const [shippingTemplates, setShippingTemplates] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Variant state
  const [hasVariants, setHasVariants] = useState(false);
  const [variantAttributes, setVariantAttributes] = useState([]); // [{ id, name, values[] }]
  const [variantCombinations, setVariantCombinations] = useState({}); // { "M / Red": { sku, priceOverride, stock } }
  const [newValueInputs, setNewValueInputs] = useState({});
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  // Image state
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);

  // Guard: skip combination sync right after loading product data from API
  const isRestoringRef = useRef(false);

  // ── Fetch shipping templates when modal opens ──
  useEffect(() => {
    if (open && shopOwnerId) {
      fetchShippingTemplates();
    }
  }, [open, shopOwnerId]);

  const fetchShippingTemplates = async () => {
    try {
      setShippingLoading(true);
      const response = await fetch(
        `${BASE_URL}/shipping/shopowner?shopOwnerId=${shopOwnerId}`
      );
      if (!response.ok) throw new Error('Failed to fetch shipping templates');
      const result = await response.json();

      if (result.success && result.data) {
        setShippingTemplates(result.data);

        // Auto-select default profile if no product is being edited
        if (!product) {
          const defaultProfile = result.data.find((p) => p.isDefault === 1);
          if (defaultProfile) {
            setFormData((prev) => ({ ...prev, profileId: defaultProfile.profileId }));
          }
        }
      } else {
        setShippingTemplates([]);
      }
    } catch (error) {
      console.error('Error fetching shipping templates:', error);
      setShippingTemplates([]);
    } finally {
      setShippingLoading(false);
    }
  };

  // ── Computed combinations ──
  const combinations = useMemo(() => {
    if (!hasVariants) return [];
    return generateCombinations(variantAttributes);
  }, [hasVariants, variantAttributes]);

  // Sync variant combinations when attributes change (user adds/removes values)
  // Skipped once after restoring from API to prevent overwriting loaded data
  useEffect(() => {
    if (combinations.length === 0) return;

    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }

    setVariantCombinations((prev) => {
      const updated = {};
      combinations.forEach((combo) => {
        const key = comboLabel(combo);
        if (prev[key]) {
          // Keep existing data (user already entered price/stock)
          updated[key] = prev[key];
        } else {
          // New combination — default from base product
          updated[key] = {
            sku: comboSku(formData.sku, combo),
            priceOverride: formData.price || '',
            stock: '',
          };
        }
      });
      return updated;
    });
  }, [combinations]);

  // ─────────────────────────────────────────────
  // Populate form for editing
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName || product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        compareAtPrice: (product.compareAtPrice ?? product.comparePrice)?.toString() || '',
        productType: (product.productType || product.type || 'PHYSICAL').toUpperCase(),
        inventoryType: mapInventoryType(product.inventoryType) || 'IN_STOCK',
        quantity: product.quantity?.toString() || '',
        sku: product.sku || '',
        status: mapStatus(product.status || product.rawStatus),
        weight: product.weight?.toString() || '',
        deliveryMethod: product.deliveryMethod || 'file',
        profileId: product.profileId || '',
      });

      // ── Restore variants from flat API format ──
      if (product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0];
        const hasRawFormat = !!firstVariant.variantType;

        if (hasRawFormat) {
          setHasVariants(true);

          const variantType = firstVariant.variantType || '';
          const attrNames = variantType.split('-').filter(Boolean);

          if (attrNames.length > 0) {
            const attrValuesMap = {};
            attrNames.forEach((name) => (attrValuesMap[name] = new Set()));

            product.variants.forEach((v) => {
              const parts = (v.variantName || '').split('-');
              attrNames.forEach((name, i) => {
                if (parts[i]) attrValuesMap[name].add(parts[i]);
              });
            });

            const attrs = attrNames.map((name, i) => ({
              id: `attr-${Date.now()}-${i}`,
              name,
              values: [...attrValuesMap[name]],
            }));

            const combos = {};
            product.variants.forEach((v) => {
              const parts = (v.variantName || '').split('-');
              const label = parts.join(' / ');
              combos[label] = {
                sku: v.variantSku || '',
                priceOverride: v.priceOverride?.toString() || '',
                stock: v.stock?.toString() || '',
              };
            });

            isRestoringRef.current = true;
            setVariantAttributes(attrs);
            setVariantCombinations(combos);
          }
        } else {
          setHasVariants(false);
          setVariantAttributes([]);
          setVariantCombinations({});
        }
      } else {
        setHasVariants(false);
        setVariantAttributes([]);
        setVariantCombinations({});
      }

      // Existing images
      if (product.images && product.images.length > 0) {
        setSelectedImages(
          product.images
            .filter((img) => img.imageUrl)
            .map((img) => ({ file: null, preview: img.imageUrl, isExisting: true }))
        );
      } else {
        setSelectedImages([]);
      }
    } else {
      resetForm();
    }
  }, [product, open]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      selectedImages.forEach((img) => {
        if (!img.isExisting && img.preview) URL.revokeObjectURL(img.preview);
      });
    };
  }, []);

  // ─────────────────────────────────────────────
  // Form change handler
  // ─────────────────────────────────────────────

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // ─────────────────────────────────────────────
  // Image Management
  // ─────────────────────────────────────────────

  const handleImageUploadClick = () => fileInputRef.current?.click();

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const slots = MAX_IMAGES - selectedImages.length;
    const newImgs = files.slice(0, slots).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }));
    setSelectedImages((prev) => [...prev, ...newImgs]);
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prev) => {
      const img = prev[index];
      if (!img.isExisting && img.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const slots = MAX_IMAGES - selectedImages.length;
    const newImgs = files.slice(0, slots).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }));
    setSelectedImages((prev) => [...prev, ...newImgs]);
  };

  // ─────────────────────────────────────────────
  // Variant Attribute Management
  // ─────────────────────────────────────────────

  const addAttribute = () => {
    setVariantAttributes((prev) => [
      ...prev,
      { id: `attr-${Date.now()}`, name: '', values: [] },
    ]);
  };

  const removeAttribute = (attrId) => {
    setVariantAttributes((prev) => prev.filter((a) => a.id !== attrId));
  };

  const updateAttributeName = (attrId, name) => {
    setVariantAttributes((prev) =>
      prev.map((a) => (a.id === attrId ? { ...a, name } : a))
    );
  };

  const addValueToAttribute = (attrId, value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setVariantAttributes((prev) =>
      prev.map((a) => {
        if (a.id !== attrId || a.values.includes(trimmed)) return a;
        return { ...a, values: [...a.values, trimmed] };
      })
    );
    setNewValueInputs((prev) => ({ ...prev, [attrId]: '' }));
  };

  const removeValueFromAttribute = (attrId, value) => {
    setVariantAttributes((prev) =>
      prev.map((a) =>
        a.id === attrId ? { ...a, values: a.values.filter((v) => v !== value) } : a
      )
    );
  };

  // ─────────────────────────────────────────────
  // Variant Combination Table
  // ─────────────────────────────────────────────

  const updateCombination = (comboKey, field, value) => {
    setVariantCombinations((prev) => ({
      ...prev,
      [comboKey]: { ...prev[comboKey], [field]: value },
    }));
  };

  const applyBulkPrice = () => {
    if (!bulkPrice) return;
    setVariantCombinations((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        updated[k] = { ...updated[k], priceOverride: bulkPrice };
      });
      return updated;
    });
  };

  const applyBulkStock = () => {
    if (!bulkStock) return;
    setVariantCombinations((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        updated[k] = { ...updated[k], stock: bulkStock };
      });
      return updated;
    });
  };

  // ─────────────────────────────────────────────
  // Reset / Close
  // ─────────────────────────────────────────────

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setHasVariants(false);
    setVariantAttributes([]);
    setVariantCombinations({});
    setNewValueInputs({});
    setBulkPrice('');
    setBulkStock('');
    selectedImages.forEach((img) => {
      if (!img.isExisting && img.preview) URL.revokeObjectURL(img.preview);
    });
    setSelectedImages([]);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  // ──────────────────────────────────────────────────
  // Build Payload
  // ──────────────────────────────────────────────────

  const buildPayload = () => {
    const variantsPayload = [];

    if (hasVariants && combinations.length > 0) {
      const variantType = variantAttributes
        .filter((a) => a.name.trim() && a.values.length > 0)
        .map((a) => a.name.trim())
        .join('-');

      combinations.forEach((combo) => {
        const key = comboLabel(combo);
        const data = variantCombinations[key] || {};

        variantsPayload.push({
          variantType,
          variantName: comboVariantName(combo),
          variantSku: data.sku || comboSku(formData.sku, combo),
          priceOverride: parseFloat(data.priceOverride) || parseFloat(formData.price) || 0,
          stock: parseInt(data.stock) || 0,
        });
      });
    }

    const totalQuantity = hasVariants
      ? variantsPayload.reduce((sum, v) => sum + v.stock, 0)
      : parseInt(formData.quantity) || 0;

    const requestData = {
      shopOwnerId: parseInt(shopOwnerId),
      productName: formData.productName,
      description: formData.description,
      productType: formData.productType,
      price: parseFloat(formData.price) || 0,
      compareAtPrice: parseFloat(formData.compareAtPrice) || 0,
      inventoryType: formData.inventoryType,
      sku: formData.sku,
      quantity: totalQuantity,
      weight: parseFloat(formData.weight) || 0,
      profileId: formData.profileId || null,
      deliveryMethod: formData.deliveryMethod,
      status: formData.status,
      currency: 'B$',
      variants: variantsPayload,
    };

    const imageFiles = selectedImages
      .filter((img) => !img.isExisting && img.file)
      .map((img) => img.file);

    return { requestData, imageFiles };
  };

  const handleSave = async () => {
    if (!formData.productName || !formData.price) return;

    if (hasVariants) {
      const validAttrs = variantAttributes.filter(
        (a) => a.name.trim() && a.values.length > 0
      );
      if (validAttrs.length === 0) {
        alert('Please add at least one variant attribute with values, or disable variants.');
        return;
      }
    }

    setLoading(true);
    try {
      const { requestData, imageFiles } = buildPayload();
      await onSave(requestData, imageFiles);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const usedAttributeNames = variantAttributes.map((a) => a.name);

  // Helper to build shipping profile summary for dropdown display
  const getProfileSummary = (profile) => {
    const zoneCount = profile.zones?.length || 0;
    const methodCount = profile.zones?.reduce((sum, z) => sum + (z.methods?.length || 0), 0) || 0;
    return `${zoneCount} zone${zoneCount !== 1 ? 's' : ''}, ${methodCount} method${methodCount !== 1 ? 's' : ''}`;
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { maxHeight: '90vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {product ? 'Edit Product' : 'Add Product'}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* ══════════ BASIC INFORMATION ══════════ */}
        <SectionHeader title="Basic Information" />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <TextField
            label="Product Name *"
            fullWidth
            value={formData.productName}
            onChange={handleChange('productName')}
            size="small"
            error={!formData.productName && loading}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange('description')}
            size="small"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ══════════ MEDIA ══════════ */}
        <SectionHeader title="Media" />
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          Upload up to {MAX_IMAGES} images. First image will be the cover.
        </Typography>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          multiple
          style={{ display: 'none' }}
        />

        {selectedImages.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1.5, mb: 2 }}>
            {selectedImages.map((img, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: index === 0 ? '2px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <img
                  src={img.preview}
                  alt={`Product ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {index === 0 && (
                  <Box sx={{ position: 'absolute', top: 4, left: 4, bgcolor: '#22c55e', color: 'white', fontSize: 10, fontWeight: 600, px: 0.75, py: 0.25, borderRadius: 1 }}>
                    Cover
                  </Box>
                )}
                <IconButton
                  size="small"
                  onClick={() => handleRemoveImage(index)}
                  sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'error.main' }, width: 24, height: 24 }}
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {selectedImages.length < MAX_IMAGES && (
          <Box
            onClick={handleImageUploadClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
              border: '2px dashed rgba(255,255,255,0.2)',
              borderRadius: 3, p: 4, textAlign: 'center', cursor: 'pointer', mb: 3,
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: 'rgba(30,64,175,0.5)', bgcolor: 'rgba(30,64,175,0.05)' },
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)', mb: 1 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Click to upload or drag and drop</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>{selectedImages.length}/{MAX_IMAGES} images uploaded</Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* ══════════ PRICING ══════════ */}
        <SectionHeader title="Pricing" />
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Price (BitoDollars) *"
            fullWidth
            type="number"
            value={formData.price}
            onChange={handleChange('price')}
            size="small"
            error={!formData.price && loading}
            InputProps={{ startAdornment: <InputAdornment position="start">B$</InputAdornment> }}
          />
          <TextField
            label="Compare-at Price"
            fullWidth
            type="number"
            value={formData.compareAtPrice}
            onChange={handleChange('compareAtPrice')}
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start">B$</InputAdornment> }}
          />
        </Box>
        <Box sx={{ p: 1.5, bgcolor: 'rgba(30,64,175,0.1)', borderRadius: 2, mb: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            💰 All payments in {WHITELABEL.brandName} shops are processed in BitoDollars (B$).
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ══════════ PRODUCT TYPE ══════════ */}
        <SectionHeader title="Product Type" />
        <FormControl size="small" fullWidth sx={{ mb: 3 }}>
          <InputLabel>Type</InputLabel>
          <Select value={formData.productType} onChange={handleChange('productType')} label="Type">
            <MenuItem value="PHYSICAL">Physical (requires shipping)</MenuItem>
            <MenuItem value="DIGITAL">Digital (instant delivery)</MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* ══════════════════════════════════════════ */}
        {/* INVENTORY & VARIANTS                       */}
        {/* ══════════════════════════════════════════ */}
        <SectionHeader title="Inventory & Variants" />

        <FormControlLabel
          control={
            <Switch
              checked={hasVariants}
              onChange={(e) => {
                setHasVariants(e.target.checked);
                if (e.target.checked && variantAttributes.length === 0) addAttribute();
              }}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#22c55e' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#22c55e' },
              }}
            />
          }
          label={
            <Box sx={{ marginLeft: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>This product has multiple variants</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Enable if this product comes in different sizes, colors, materials, etc.</Typography>
            </Box>
          }
          sx={{ mb: 2, alignItems: 'flex-start', ml: 0 }}
        />

        {/* ── SIMPLE INVENTORY (no variants) ── */}
        {!hasVariants && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Inventory Type</InputLabel>
              <Select value={formData.inventoryType} onChange={handleChange('inventoryType')} label="Inventory Type">
                <MenuItem value="IN_STOCK">In stock (track quantity)</MenuItem>
                <MenuItem value="MADE_TO_ORDER">Made to order</MenuItem>
                <MenuItem value="UNLIMITED">Unlimited (digital)</MenuItem>
              </Select>
            </FormControl>
            {formData.inventoryType !== 'UNLIMITED' && (
              <TextField label="Quantity" fullWidth type="number" value={formData.quantity} onChange={handleChange('quantity')} size="small" />
            )}
            <TextField label="SKU (optional)" fullWidth value={formData.sku} onChange={handleChange('sku')} size="small" placeholder="e.g., TSHIRT-001" />
          </Box>
        )}

        {/* ── VARIANT ATTRIBUTES ── */}
        {hasVariants && (
          <Box sx={{ mb: 3 }}>
            {variantAttributes.map((attr) => (
              <Paper
                key={attr.id}
                sx={{ p: 2, mb: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Option Name</InputLabel>
                    <Select
                      value={Object.keys(SUGGESTED_ATTRIBUTES).includes(attr.name) ? attr.name : attr.name ? '__custom__' : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateAttributeName(attr.id, val === '__custom__' ? '' : val);
                      }}
                      label="Option Name"
                    >
                      {Object.keys(SUGGESTED_ATTRIBUTES)
                        .filter((n) => !usedAttributeNames.includes(n) || n === attr.name)
                        .map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                      <MenuItem value="__custom__">Custom...</MenuItem>
                    </Select>
                  </FormControl>

                  {!Object.keys(SUGGESTED_ATTRIBUTES).includes(attr.name) && (
                    <TextField
                      size="small"
                      label="Custom name"
                      value={attr.name}
                      onChange={(e) => updateAttributeName(attr.id, e.target.value)}
                      placeholder="e.g., Material, Style"
                      sx={{ flex: 1 }}
                    />
                  )}

                  <IconButton size="small" color="error" onClick={() => removeAttribute(attr.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>Option Values</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                  {attr.values.map((val) => (
                    <Chip
                      key={val}
                      label={val}
                      onDelete={() => removeValueFromAttribute(attr.id, val)}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(34,197,94,0.1)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'error.main' } },
                      }}
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    placeholder="Type a value and press Enter"
                    value={newValueInputs[attr.id] || ''}
                    onChange={(e) => setNewValueInputs((prev) => ({ ...prev, [attr.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addValueToAttribute(attr.id, newValueInputs[attr.id] || '');
                      }
                    }}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => addValueToAttribute(attr.id, newValueInputs[attr.id] || '')}
                    sx={{ minWidth: 'auto', borderColor: 'rgba(255,255,255,0.2)', color: 'text.primary' }}
                  >
                    Add
                  </Button>
                </Box>

                {SUGGESTED_ATTRIBUTES[attr.name] && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 0.5 }}>Quick add:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {SUGGESTED_ATTRIBUTES[attr.name]
                        .filter((s) => !attr.values.includes(s))
                        .map((suggestion) => (
                          <Chip
                            key={suggestion}
                            label={suggestion}
                            size="small"
                            variant="outlined"
                            onClick={() => addValueToAttribute(attr.id, suggestion)}
                            sx={{
                              cursor: 'pointer',
                              borderColor: 'rgba(255,255,255,0.1)',
                              '&:hover': { borderColor: 'rgba(34,197,94,0.5)', bgcolor: 'rgba(34,197,94,0.05)' },
                            }}
                          />
                        ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            ))}

            {variantAttributes.length < 3 && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addAttribute}
                sx={{
                  mb: 2,
                  borderColor: 'rgba(255,255,255,0.2)', color: 'text.primary',
                  '&:hover': { borderColor: 'rgba(30,64,175,0.5)', bgcolor: 'rgba(30,64,175,0.05)' },
                }}
              >
                Add Another Option (e.g., {variantAttributes.length === 0 ? 'Size, Color' : variantAttributes.length === 1 ? 'Color, Material' : 'Material'})
              </Button>
            )}

            {/* ── VARIANT COMBINATIONS TABLE ── */}
            {combinations.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  <InventoryIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
                  Variant Inventory ({combinations.length} combinations)
                </Typography>

                {/* Bulk Actions */}
                <Paper sx={{ p: 1.5, mb: 2, bgcolor: 'rgba(30,64,175,0.08)', border: '1px solid rgba(30,64,175,0.15)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                    Bulk Update — Apply to all variants at once:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <TextField
                      size="small" type="number" placeholder="Set all prices"
                      value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start">B$</InputAdornment> }}
                      sx={{ width: 160 }}
                    />
                    <Button size="small" variant="outlined" onClick={applyBulkPrice} disabled={!bulkPrice} sx={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                      Apply Price
                    </Button>
                    <TextField
                      size="small" type="number" placeholder="Set all stock"
                      value={bulkStock} onChange={(e) => setBulkStock(e.target.value)}
                      sx={{ width: 160 }}
                    />
                    <Button size="small" variant="outlined" onClick={applyBulkStock} disabled={!bulkStock} sx={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                      Apply Stock
                    </Button>
                  </Box>
                </Paper>

                {/* Table */}
                <TableContainer
                  component={Paper}
                  sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2, maxHeight: 400, overflow: 'auto' }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>Variant</TableCell>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(255,255,255,0.05)' }}>SKU</TableCell>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(255,255,255,0.05)' }}>Price (B$)</TableCell>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(255,255,255,0.05)' }}>Stock</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {combinations.map((combo) => {
                        const key = comboLabel(combo);
                        const data = variantCombinations[key] || {};
                        return (
                          <TableRow key={key} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {Object.entries(combo).map(([attrName, value]) => (
                                  <Chip
                                    key={`${attrName}-${value}`}
                                    label={`${attrName}: ${value}`}
                                    size="small"
                                    sx={{ fontSize: 11, height: 24, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                  />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small" value={data.sku || ''}
                                onChange={(e) => updateCombination(key, 'sku', e.target.value)}
                                placeholder="SKU" variant="standard" sx={{ width: 140 }}
                                inputProps={{ style: { fontSize: 13 } }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small" type="number" value={data.priceOverride || ''}
                                onChange={(e) => updateCombination(key, 'priceOverride', e.target.value)}
                                placeholder={formData.price || '0'} variant="standard" sx={{ width: 90 }}
                                inputProps={{ step: '0.01', style: { fontSize: 13 } }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small" type="number" value={data.stock || ''}
                                onChange={(e) => updateCombination(key, 'stock', e.target.value)}
                                placeholder="0" variant="standard" sx={{ width: 70 }}
                                inputProps={{ style: { fontSize: 13 } }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'rgba(34,197,94,0.08)', borderRadius: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Total variants: <strong>{combinations.length}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Total stock: <strong>{Object.values(variantCombinations).reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)}</strong> units
                  </Typography>
                </Box>
              </Box>
            )}

            <TextField
              label="Base SKU (auto-generates variant SKUs)"
              fullWidth
              value={formData.sku}
              onChange={handleChange('sku')}
              size="small"
              placeholder="e.g., TSHIRT-001"
              sx={{ mt: 2 }}
              helperText="Variant SKUs will be generated as BASE-VALUE1-VALUE2"
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* ══════════ SHIPPING & FULFILLMENT (Physical) ══════════ */}
        {formData.productType === 'PHYSICAL' && (
          <>
            <SectionHeader title="Shipping & Fulfillment" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <TextField
                label="Weight (lbs)"
                fullWidth
                type="number"
                value={formData.weight}
                onChange={handleChange('weight')}
                size="small"
                inputProps={{ step: '0.1' }}
                placeholder="0"
              />

              {/* Shipping Template Dropdown */}
              <FormControl size="small" fullWidth>
                <InputLabel>Shipping Template</InputLabel>
                <Select
                  value={formData.profileId}
                  onChange={handleChange('profileId')}
                  label="Shipping Template"
                  disabled={shippingLoading}
                  startAdornment={
                    shippingLoading ? (
                      <InputAdornment position="start">
                        <CircularProgress size={18} />
                      </InputAdornment>
                    ) : null
                  }
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {shippingTemplates.map((profile) => (
                    <MenuItem key={profile.profileId} value={profile.profileId}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <LocalShippingIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {profile.profileName}
                            {profile.isDefault === 1 && (
                              <Chip
                                label="Default"
                                size="small"
                                sx={{
                                  ml: 1,
                                  height: 18,
                                  fontSize: 10,
                                  bgcolor: 'rgba(34,197,94,0.15)',
                                  color: '#22c55e',
                                  border: '1px solid rgba(34,197,94,0.3)',
                                }}
                              />
                            )}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {getProfileSummary(profile)}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Selected template summary */}
              {formData.profileId && (() => {
                const selected = shippingTemplates.find((p) => p.profileId === formData.profileId);
                if (!selected) return null;
                return (
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(30,64,175,0.08)',
                      border: '1px solid rgba(30,64,175,0.15)',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                      📦 Shipping Zones & Methods
                    </Typography>
                    {selected.zones
                      ?.filter((z) => z.isActive === 1)
                      .map((zone) => (
                        <Box key={zone.zoneId} sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                            {zone.zoneName}
                            <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                              ({zone.countries?.map((c) => c.countryCode).join(', ')})
                            </Typography>
                          </Typography>
                          {zone.methods
                            ?.filter((m) => m.isActive === 1)
                            .map((method) => (
                              <Box
                                key={method.methodId}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  pl: 2,
                                  py: 0.5,
                                }}
                              >
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {method.methodName} ({method.carrier}) — {method.minDeliveryDays}-{method.maxDeliveryDays} days
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 500 }}>
                                  ${method.basePrice} + ${method.pricePerKg}/kg
                                </Typography>
                              </Box>
                            ))}
                        </Box>
                      ))}
                  </Paper>
                );
              })()}
            </Box>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* ══════════ DELIVERY (Digital) ══════════ */}
        {formData.productType === 'DIGITAL' && (
          <>
            <SectionHeader title="Delivery Method" />
            <FormControl size="small" fullWidth sx={{ mb: 3 }}>
              <InputLabel>How will this be delivered?</InputLabel>
              <Select value={formData.deliveryMethod} onChange={handleChange('deliveryMethod')} label="How will this be delivered?">
                <MenuItem value="file">File upload (customer downloads)</MenuItem>
                <MenuItem value="link">Link (provide URL)</MenuItem>
                <MenuItem value="manual">Manual (send via message)</MenuItem>
              </Select>
            </FormControl>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* ══════════ VISIBILITY ══════════ */}
        <SectionHeader title="Visibility" />
        <FormControl size="small" fullWidth>
          <InputLabel>Status</InputLabel>
          <Select value={formData.status} onChange={handleChange('status')} label="Status">
            <MenuItem value="PUBLIC">Public (shown in shop)</MenuItem>
            <MenuItem value="UNLISTED">Unlisted (only via link/tag)</MenuItem>
            <MenuItem value="DRAFT">Draft</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !formData.productName || !formData.price}
          sx={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : product ? 'Update Product' : 'Save Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SectionHeader({ title }) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
      {title}
    </Typography>
  );
}