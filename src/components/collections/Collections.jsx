'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Skeleton,
  Tooltip,
  Chip,
  InputAdornment,
  Alert,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import InventoryIcon from '@mui/icons-material/Inventory';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';


// API Base URL - adjust according to your environment
const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';

// Sortable Collection Item Component
function SortableCollectionItem({
  collection,
  onToggleVisibility,
  onEdit,
  onDelete,
  isUpdating,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.collectionId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const productCount = collection.productIds?.length || 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        cursor: 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(30, 64, 175, 0.5)',
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          '&:last-child': { pb: 2 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            size="small"
            {...attributes}
            {...listeners}
            sx={{
              color: 'rgba(255,255,255,0.3)',
              cursor: 'grab',
              '&:hover': {
                color: 'rgba(255,255,255,0.6)',
                bgcolor: 'rgba(255,255,255,0.1)',
              },
              '&:active': {
                cursor: 'grabbing',
              },
            }}
          >
            <DragIndicatorIcon />
          </IconButton>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {collection.name}
              {!collection.isActive && (
                <Chip
                  label="Inactive"
                  size="small"
                  color="warning"
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {productCount} product{productCount !== 1 ? 's' : ''}
            </Typography>
            {collection.description && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  maxWidth: 300,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {collection.description}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Edit Collection">
            <IconButton
              size="small"
              onClick={() => onEdit(collection)}
              sx={{
                color: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Collection">
            <IconButton
              size="small"
              onClick={() => onDelete(collection)}
              sx={{
                color: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  color: 'error.main',
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={collection.isVisible ? 'Hide Collection' : 'Show Collection'}>
            <Switch
              checked={collection.isVisible}
              onChange={() => onToggleVisibility(collection.collectionId, collection.isVisible)}
              disabled={isUpdating}
              size="small"
            />
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}

// Drag Overlay Item (shown while dragging)
function DragOverlayItem({ collection }) {
  const productCount = collection.productIds?.length || 0;

  return (
    <Card
      sx={{
        cursor: 'grabbing',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(30, 64, 175, 0.5)',
        bgcolor: 'background.paper',
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          '&:last-child': { pb: 2 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              cursor: 'grabbing',
            }}
          >
            <DragIndicatorIcon />
          </IconButton>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {collection.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {productCount} product{productCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
        <Switch checked={collection.isVisible} disabled />
      </CardContent>
    </Card>
  );
}

// Collection Editor Drawer (Right Side Panel)
function CollectionEditorDrawer({
  open,
  onClose,
  collection,
  products,
  shopOwnerId,
  onSave,
  isLoading,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const isEditing = !!collection;

  // Reset form when drawer opens/closes or collection changes
  useEffect(() => {
    if (open) {
      if (collection) {
        setName(collection.name);
        setDescription(collection.description || '');
        setSelectedProductIds(collection.productIds || []);
      } else {
        setName('');
        setDescription('');
        setSelectedProductIds([]);
      }
      setSearchQuery('');
      setError('');
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
  }, [open, collection]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
      
      // Create preview URLs
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
    // Reset input value to allow selecting same file again
    event.target.value = '';
  };

  // Remove selected file
  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleProduct = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.productId));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Collection name is required');
      return;
    }

    try {
      setError('');
      await onSave({
        name: name.trim(),
        description: description.trim(),
        productIds: selectedProductIds,
        files: selectedFiles,
        ...(isEditing && { collectionId: collection.collectionId }),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save collection');
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 450, md: 500 },
          bgcolor: 'background.paper',
          backgroundImage: 'none',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isEditing ? 'Edit Collection' : 'Create New Collection'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Collection Details */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Collection Details
          </Typography>
          <TextField
            label="Collection Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            size="small"
            error={!name.trim() && error.includes('name')}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            size="small"
            placeholder="Add a description for this collection..."
          />
        </Box>

        {/* Hero Image Upload */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Collection Images
          </Typography>
          
          {/* File Upload Area */}
          <Box
            component="label"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'rgba(59, 130, 246, 0.05)',
              },
            }}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFileSelect}
            />
            <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Click to upload images
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              PNG, JPG, GIF up to 10MB
            </Typography>
          </Box>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedFiles.map((file, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    component="img"
                    src={previewUrls[index]}
                    alt={file.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      p: 0.25,
                      '&:hover': {
                        bgcolor: 'rgba(239, 68, 68, 0.8)',
                      },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      p: 0.25,
                      fontSize: '0.6rem',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Existing Hero Image (for edit mode) */}
          {isEditing && collection?.heroImageUrl && selectedFiles.length === 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                Current Image:
              </Typography>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  component="img"
                  src={collection.heroImageUrl}
                  alt="Current hero"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Product Selection */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Products ({selectedProductIds.length} selected)
            </Typography>
            {filteredProducts.length > 0 && (
              <Button size="small" onClick={handleSelectAll} sx={{ textTransform: 'none' }}>
                {selectedProductIds.length === filteredProducts.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
            )}
          </Box>

          <TextField
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <List
            sx={{
              flex: 1,
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              minHeight: 200,
              maxHeight: 'calc(100vh - 450px)',
            }}
          >
            {isLoading ? (
              <Box sx={{ p: 2 }}>
                {[1, 2, 3].map((i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Skeleton variant="rectangular" width={24} height={24} />
                    <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : filteredProducts.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={searchQuery ? 'No products found' : 'No products available'}
                  secondary={searchQuery ? 'Try a different search term' : 'Add products to your store first'}
                  sx={{ textAlign: 'center' }}
                />
              </ListItem>
            ) : (
              filteredProducts.map((product) => (
                <ListItem key={product.productId} disablePadding>
                  <ListItemButton
                    onClick={() => handleToggleProduct(product.productId)}
                    dense
                    sx={{
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        edge="start"
                        checked={selectedProductIds.includes(product.productId)}
                        tabIndex={-1}
                        disableRipple
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemAvatar sx={{ minWidth: 48 }}>
                      <Avatar
                        src={product.images?.[0]?.imageUrl}
                        variant="rounded"
                        sx={{ width: 36, height: 36 }}
                      >
                        <InventoryIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                          {product.productName}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {product.currency} {product.price} • {product.sku}
                        </Typography>
                      }
                    />
                    <Chip
                      label={product.status}
                      size="small"
                      color={product.status === 'PUBLIC' ? 'success' : 'default'}
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 2,
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          disabled={isLoading || !name.trim()}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            },
          }}
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </Button>
      </Box>
    </Drawer>
  );
}

// Delete Confirmation Dialog
function DeleteConfirmDialog({
  open,
  onClose,
  collection,
  onConfirm,
  isLoading,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Collection</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete "{collection?.name}"? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
        >
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Loading Skeleton
function CollectionsSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="20%" />
            </Box>
            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 10 }} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

// API Service Functions
const shopApi = {
  // Check if shop settings are valid
  validateShopSettings: async (shopOwnerId) => {
    const response = await fetch(`${API_BASE_URL}/settings/shops/${shopOwnerId}/verification/validate`);
    if (!response.ok) throw new Error('Failed to validate shop settings');
    return response.json();
  },
};

// Main Collections Component
export default function Collections() {
  const { showToast } = useApp();
  const router = useRouter();

  // State
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(null);
  const [validatingShop, setValidatingShop] = useState(false);

  // Dialog states
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  // Drag state
  const [activeId, setActiveId] = useState(null);

  // Shop Owner ID - This should come from your auth context or app state
  const [shopOwnerId, setShopOwnerId] = useState('3357');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShopOwnerId(localStorage.getItem('shopOwnerId') || '3357');
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Validate shop settings before any collection operation
  const validateShopSettings = async () => {
    try {
      setValidatingShop(true);
      const validationResponse = await shopApi.validateShopSettings(shopOwnerId);
      
      if (!validationResponse.success) {
        throw new Error(validationResponse.message || 'Validation failed');
      }
      
      if (validationResponse.data === false) {
        showToast(
          'Please complete your shop setup before managing collections. Redirecting to settings...',
          'warning'
        );
        
        // Short delay to show the toast message
        setTimeout(() => {
          // window.location.href = '/merchandise/settings';
          router.push('/settings');

        }, 1500);
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Shop validation error:', error);
      showToast('Failed to validate shop settings', 'error');
      return false;
    } finally {
      setValidatingShop(false);
    }
  };

  // Fetch Collections
  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/collections/collectionsdetails?shopOwnerId=${shopOwnerId}`
      );
      const data = await response.json();

      if (data.success) {
        setCollections(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch collections');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      showToast('Failed to load collections', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [shopOwnerId, showToast]);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      setIsProductsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/products/getProductsByOwner?shopOwnerId=${shopOwnerId}&tab=ALL&searchStr=&offset=0&limit=100`
      );
      const data = await response.json();

      if (data.success) {
        setProducts(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Failed to load products', 'error');
    } finally {
      setIsProductsLoading(false);
    }
  }, [shopOwnerId, showToast]);

  // Initial data fetch
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Create Collection (using FormData)
  const createCollection = async (data) => {
    const formData = new FormData();
    
    // Add the request JSON payload
    const requestPayload = {
      shopOwnerId,
      name: data.name,
      description: data.description,
      productIds: data.productIds,
    };
    formData.append('request', JSON.stringify(requestPayload));
    
    // Add files if any
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await fetch(`${API_BASE_URL}/collections/create`, {
      method: 'POST',
      body: formData,
      // Note: Don't set Content-Type header, browser will set it with boundary for FormData
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to create collection');
    }

    showToast('Collection created successfully', 'success');
    await fetchCollections();
  };

  // Update Collection (using FormData if files provided, else JSON)
  const updateCollection = async (data) => {
    if (!data.collectionId) throw new Error('Collection ID is required');

    let response;

    // Check if files are provided - use FormData
    if (data.files && data.files.length > 0) {
      const formData = new FormData();
      
      const requestPayload = {
        shopOwnerId,
        name: data.name,
        description: data.description,
        productIds: data.productIds,
      };
      formData.append('request', JSON.stringify(requestPayload));
      
      data.files.forEach((file) => {
        formData.append('files', file);
      });

      response = await fetch(
        `${API_BASE_URL}/collections/updatecollection/${data.collectionId}`,
        {
          method: 'PUT',
          body: formData,
        }
      );
    } else {
      // No files - use JSON
      response = await fetch(
        `${API_BASE_URL}/collections/updatecollection/${data.collectionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shopOwnerId,
            name: data.name,
            description: data.description,
            productIds: data.productIds,
          }),
        }
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to update collection');
    }

    showToast('Collection updated successfully', 'success');
    await fetchCollections();
  };

  // Delete Collection
  const deleteCollection = async () => {
    if (!selectedCollection) return;

    try {
      setIsDeleting(true);
      const response = await fetch(
        `${API_BASE_URL}/collections/delete/${selectedCollection.collectionId}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete collection');
      }

      showToast('Collection deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedCollection(null);
      await fetchCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      showToast(error.message || 'Failed to delete collection', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Visibility
  const toggleVisibility = async (collectionId, currentVisibility) => {
    try {
      setUpdatingVisibility(collectionId);

      // Optimistic update
      setCollections((prev) =>
        prev.map((c) =>
          c.collectionId === collectionId ? { ...c, isVisible: !currentVisibility } : c
        )
      );

      const response = await fetch(
        `${API_BASE_URL}/collections/update-visibility?collectionId=${collectionId}&shopOwnerId=${shopOwnerId}&isVisible=${!currentVisibility}`,
        {
          method: 'PATCH',
        }
      );

      const result = await response.json();

      if (!result.success) {
        // Revert on failure
        setCollections((prev) =>
          prev.map((c) =>
            c.collectionId === collectionId ? { ...c, isVisible: currentVisibility } : c
          )
        );
        throw new Error(result.message || 'Failed to update visibility');
      }

      showToast(
        `Collection ${!currentVisibility ? 'shown' : 'hidden'} successfully`,
        'success'
      );
    } catch (error) {
      console.error('Error toggling visibility:', error);
      showToast('Failed to update visibility', 'error');
    } finally {
      setUpdatingVisibility(null);
    }
  };

  // Handle Save (create or update)
  const handleSave = async (data) => {
    setIsSaving(true);
    try {
      // Validate shop settings before saving
      const isValid = await validateShopSettings();
      if (!isValid) return;
      
      if (data.collectionId) {
        await updateCollection(data);
      } else {
        await createCollection(data);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Open editor for new collection with validation
  const openNewCollectionEditor = async () => {
    // Validate shop settings before opening editor
    const isValid = await validateShopSettings();
    if (!isValid) return;
    
    setSelectedCollection(null);
    fetchProducts(); // Fetch products when opening editor
    setEditorOpen(true);
  };

  // Open editor for editing with validation
  const openEditCollectionEditor = async (collection) => {
    // Validate shop settings before opening editor
    const isValid = await validateShopSettings();
    if (!isValid) return;
    
    setSelectedCollection(collection);
    fetchProducts(); // Fetch products when opening editor
    setEditorOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (collection) => {
    setSelectedCollection(collection);
    setDeleteDialogOpen(true);
  };

  // Drag handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = collections.findIndex((item) => item.collectionId === active.id);
      const newIndex = collections.findIndex((item) => item.collectionId === over.id);
      const newOrder = arrayMove(collections, oldIndex, newIndex);

      // Optimistic update
      setCollections(newOrder);
      showToast('Collection order updated', 'success');

      // Note: If your API supports reordering, you would call it here
      // For now, order is maintained locally
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeCollection = activeId
    ? collections.find((c) => c.collectionId === activeId)
    : null;

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Collections
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Drag and drop to reorder collections
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={validatingShop ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
          onClick={openNewCollectionEditor}
          disabled={validatingShop}
          sx={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            },
          }}
        >
          {validatingShop ? 'Validating...' : 'New Collection'}
        </Button>
      </Box>

      {/* Collections List */}
      {isLoading ? (
        <CollectionsSkeleton />
      ) : collections.length === 0 ? (
        <Card>
          <CardContent
            sx={{
              textAlign: 'center',
              py: 6,
            }}
          >
            <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              No Collections Yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Create your first collection to organize your products
            </Typography>
            <Button
              variant="contained"
              startIcon={validatingShop ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              onClick={openNewCollectionEditor}
              disabled={validatingShop}
              sx={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                },
              }}
            >
              {validatingShop ? 'Validating...' : 'Create Collection'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={collections.map((c) => c.collectionId)}
            strategy={verticalListSortingStrategy}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {collections.map((collection) => (
                <SortableCollectionItem
                  key={collection.collectionId}
                  collection={collection}
                  onToggleVisibility={toggleVisibility}
                  onEdit={openEditCollectionEditor}
                  onDelete={openDeleteDialog}
                  isUpdating={updatingVisibility === collection.collectionId}
                />
              ))}
            </Box>
          </SortableContext>

          <DragOverlay>
            {activeCollection ? <DragOverlayItem collection={activeCollection} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Collection Editor Drawer */}
      <CollectionEditorDrawer
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setSelectedCollection(null);
        }}
        collection={selectedCollection}
        products={products}
        shopOwnerId={shopOwnerId}
        onSave={handleSave}
        isLoading={isSaving || isProductsLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedCollection(null);
        }}
        collection={selectedCollection}
        onConfirm={deleteCollection}
        isLoading={isDeleting}
      />
    </Box>
  );
}