'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Skeleton,
  Drawer,
  TextField,
  IconButton,
  InputAdornment,
  Checkbox,
  ListItemButton,
  ListItemIcon,
  Chip,
  Avatar as MuiAvatar,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InventoryIcon from '@mui/icons-material/Inventory';
import { MetricCard, Avatar } from '@/components/common';
import { useApp } from '@/context/AppContext';
import { tips } from '@/data/mockData';
import ProductModal from '../modals/ProductModal';
import axios from 'axios';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';

// Collection Editor Drawer Component (reused from Collections page)
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
      product.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
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
                      <MuiAvatar
                        src={product.images?.[0]?.imageUrl}
                        variant="rounded"
                        sx={{ width: 36, height: 36 }}
                      >
                        <InventoryIcon fontSize="small" />
                      </MuiAvatar>
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

export default function Dashboard() {
  const router = useRouter();
  const { openShopPreview, showToast } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [todayMetrics, setTodayMetrics] = useState([]);
  const [shopOwnerId, setShopOwnerId] = useState('');
  const [shopDetails, setShopDetails] = useState(null);
const [shopDetailsLoading, setShopDetailsLoading] = useState(true);

  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Collection Editor State
  const [collectionEditorOpen, setCollectionEditorOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShopOwnerId(localStorage.getItem('shopOwnerId') || '');
    }
  }, []);

  useEffect(() => {
  const fetchShopDetails = async () => {
    try {
      setShopDetailsLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/settings/shopdetails/${shopOwnerId}`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.data && response.data.success) {
        setShopDetails(response.data.data);
      }
    } catch (err) {
      console.error('Shop details fetch error:', err);
      setShopDetails(null);
    } finally {
      setShopDetailsLoading(false);
    }
  };

  if (shopOwnerId) {
    fetchShopDetails();
  }
}, [shopOwnerId]);

  // Fetch shop verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        setVerificationLoading(true);
        const storedShopOwnerId = shopOwnerId;
        
        const response = await axios.get(
          `${API_BASE_URL}/settings/shops/${storedShopOwnerId}/verification/validate`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data && response.data.success) {
          setIsShopVerified(response.data.data === true);
        }
      } catch (err) {
        console.error('Verification status fetch error:', err);
        // Default to false if there's an error
        setIsShopVerified(false);
      } finally {
        setVerificationLoading(false);
      }
    };

    if (shopOwnerId) {
      fetchVerificationStatus();
    }
  }, [shopOwnerId]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const storedShopOwnerId = shopOwnerId;
        
        const response = await axios.get(
          `${API_BASE_URL}/dashboard/${storedShopOwnerId}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data && response.data.data) {
          const data = response.data.data;
          setDashboardData(data);
          
          // Transform todayKpis to match MetricCard format
          if (data.todayKpis && data.todayKpis.length > 0) {
            const kpi = data.todayKpis[0];
            setTodayMetrics([
              { label: 'Views', value: kpi.totalViews || 0, unit: 'visitors' },
              { label: 'Cart Adds', value: kpi.totalCartAdds || 0, unit: 'additions' },
              { label: 'Sales', value: `B$${(kpi.totalSales || 0).toFixed(2)}`, unit: 'today' },
              { label: 'Conversion', value: `${(kpi.conversionRate || 0).toFixed(2)}%`, unit: 'rate' },
            ]);
          }
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message || 'Failed to fetch dashboard data');
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (!shopOwnerId) return;

    setTimeout(() => {
    fetchDashboardData();
      
    }, 1000);

  }, [shopOwnerId, showToast]);

  // Fetch products when collection editor opens
  useEffect(() => {
    const fetchProducts = async () => {
      if (collectionEditorOpen && shopOwnerId) {
        try {
          setProductsLoading(true);
          const params = new URLSearchParams({
            shopOwnerId: shopOwnerId.toString(),
            tab: '',
            searchStr: '',
            offset: '0',
            limit: '100',
          });
          
          const response = await axios.get(
            `${API_BASE_URL}/products/getProductsByOwner?${params.toString()}`
          );
          
          if (response.data && response.data.data) {
            setProducts(response.data.data);
          }
        } catch (err) {
          console.error('Failed to fetch products:', err);
          showToast('Failed to load products', 'error');
        } finally {
          setProductsLoading(false);
        }
      }
    };

    fetchProducts();
  }, [collectionEditorOpen, shopOwnerId, showToast]);

  const openProductModal = (product = null) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const closeProductModal = () => {
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData, imageFiles = []) => {
    try {
      const requestData = {
        shopOwnerId: parseInt(shopOwnerId),
        productName: productData.productName,
        description: productData.description,
        price: parseFloat(productData.price),
        compareAtPrice: productData.compareAtPrice ? parseFloat(productData.compareAtPrice) : null,
        productType: productData.productType,
        inventoryType: productData.inventoryType,
        quantity: productData.quantity ? parseInt(productData.quantity) : null,
        sku: productData.sku,
        status: productData.status,
        variants: productData.variants || [],
        weight: productData.weight ? parseFloat(productData.weight) : null,
        shippingProfile: productData.shippingProfile,
        handlingTime: productData.handlingTime,
        deliveryMethod: productData.deliveryMethod,
      };

      const formData = new FormData();
      formData.append('request', JSON.stringify(requestData));
      
      imageFiles.forEach((file) => {
        if (file) formData.append('files', file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/products/create`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data && response.data.success) {
        showToast('Product created successfully!', 'success');
        closeProductModal();
      } else {
        throw new Error(response.data?.message || 'Failed to create product');
      }
    } catch (err) {
      console.error('Failed to save product:', err);
      showToast(err.message || 'Failed to save product', 'error');
      throw err;
    }
  };

  const openCollectionEditor = () => {
    setCollectionEditorOpen(true);
  };

  const closeCollectionEditor = () => {
    setCollectionEditorOpen(false);
  };

  const handleSaveCollection = async (collectionData) => {
    try {
      const requestData = {
        shopOwnerId: parseInt(shopOwnerId),
        name: collectionData.name,
        description: collectionData.description,
        productIds: collectionData.productIds,
      };

      const formData = new FormData();
      formData.append('request', JSON.stringify(requestData));
      
      collectionData.files?.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/collections/create`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data && response.data.success) {
        showToast('Collection created successfully!', 'success');
      } else {
        throw new Error(response.data?.message || 'Failed to create collection');
      }
    } catch (err) {
      console.error('Failed to save collection:', err);
      showToast(err.message || 'Failed to save collection', 'error');
      throw err;
    }
  };

  const isShopVerified =
  shopDetails?.shopStatus === 'ACTIVE' && shopDetails?.reviewStatus === 'APPROVED';

  const pendingOrders = dashboardData?.pendingOrders || [];

  const quickActions = [
    { label: 'Add Product', icon: AddIcon, onClick: () => openProductModal() },
    { label: 'Create Collection', icon: FolderIcon, onClick: openCollectionEditor },
    { label: 'Tag Products', icon: LocalOfferIcon, onClick: () => router.push('/content/') },
    { label: 'View Shop', icon: VisibilityIcon, onClick: openShopPreview },
  ];

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Shop Status Card */}
<Card sx={{ mb: 3 }}>
  <CardContent>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Shop Status
        </Typography>
        {shopDetailsLoading ? (
          <Skeleton width={200} height={24} />
        ) : isShopVerified ? (
          <Typography sx={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckCircleIcon fontSize="small" /> Your shop is live
          </Typography>
        ) : (
          <>
            <Typography sx={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PendingIcon fontSize="small" /> Verification pending
            </Typography>
            {shopDetails?.adminRemarks && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mt: 1,
                  p: 1.5,
                  bgcolor: 'rgba(245, 158, 11, 0.08)',
                  borderRadius: 1,
                  borderLeft: '3px solid #f59e0b',
                  fontSize: '0.8rem',
                }}
              >
                {shopDetails.adminRemarks}
              </Typography>
            )}
          </>
        )}
      </Box>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2.5,
          background: isShopVerified
            ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isShopVerified ? (
          <CheckCircleIcon sx={{ color: '#fff' }} />
        ) : (
          <PendingIcon sx={{ color: '#fff' }} />
        )}
      </Box>
    </Box>
  </CardContent>
</Card>

      {/* Today's Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>
            Today&apos;s Summary
          </Typography>
          <Grid container spacing={2}>
            {loading ? (
              Array(4).fill(0).map((_, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                </Grid>
              ))
            ) : (
              todayMetrics.map((metric) => (
                <Grid item xs={6} md={3} key={metric.label}>
                  <MetricCard {...metric} />
                </Grid>
              ))
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Orders Requiring Action */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Orders Requiring Action
            </Typography>
            <Button
              size="small"
              onClick={() => router.push('/orders/')}
              sx={{ color: '#60a5fa' }}
            >
              View all
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <CircularProgress size={40} />
            </Box>
          ) : pendingOrders.length === 0 ? (
            <Typography sx={{ color: 'text.secondary', p: 2, textAlign: 'center' }}>
              No pending orders at the moment
            </Typography>
          ) : (
            <List sx={{ p: 0 }}>
              {pendingOrders.map((order, index) => (
                <Box key={order.orderId}>
                  <ListItem
                    sx={{
                      px: 0,
                      py: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ListItemAvatar sx={{ minWidth: 'auto' }}>
                        <Avatar
                          initials={order.buyerInitials || 'U'}
                          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          size={40}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={`#${order.orderNumber}`}
                        secondary={order.username || `Buyer #${order.buyerId}`}
                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                        secondaryTypographyProps={{ color: 'text.secondary', fontSize: '0.75rem' }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ color: '#22c55e', fontWeight: 700 }}>
                        {order.currency}{order.totalAmount.toFixed(2)}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                          },
                        }}
                        onClick={() => router.push(`/orders`)}
                      >
                        Go to Orders
                      </Button>
                    </Box>
                  </ListItem>
                  {index < pendingOrders.length - 1 && (
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                  )}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={1.5}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Grid item xs={6} sm={3} key={action.label}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={action.onClick}
                    startIcon={<Icon />}
                    sx={{
                      py: 2,
                      background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.2) 0%, rgba(30, 64, 175, 0.1) 100%)',
                      borderColor: 'rgba(30, 64, 175, 0.3)',
                      color: '#fff',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.3) 0%, rgba(30, 64, 175, 0.2) 100%)',
                        borderColor: 'rgba(30, 64, 175, 0.5)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(30, 64, 175, 0.3)',
                      },
                    }}
                  >
                    {action.label}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Tips to Boost Sales */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            💡 Tips to Boost Sales
          </Typography>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {tips.map((tip, index) => (
              <Box
                key={index}
                sx={{
                  p: 1.5,
                  bgcolor: `${tip.color}20`,
                  borderRadius: 2,
                  borderLeft: `3px solid ${tip.color}`,
                }}
              >
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {tip.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Product Modal */}
      <ProductModal
        open={productModalOpen}
        onClose={closeProductModal}
        onSave={handleSaveProduct}
        product={editingProduct}
        shopOwnerId={shopOwnerId}
      />

      {/* Collection Editor Drawer */}
      <CollectionEditorDrawer
        open={collectionEditorOpen}
        onClose={closeCollectionEditor}
        collection={null}
        products={products}
        shopOwnerId={shopOwnerId}
        onSave={handleSaveCollection}
        isLoading={productsLoading}
      />
    </Box>
  );
}