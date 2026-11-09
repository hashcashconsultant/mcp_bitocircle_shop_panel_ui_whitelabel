'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Switch,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { StatusChip, FilterChips } from '@/components/common';
import { useApp } from '@/context/AppContext';
import { shopBlockedReason } from '@/lib/shopStatus';
import WHITELABEL from '@/config/whitelabel';
import ProductModal from '../modals/ProductModal';
import DeleteConfirmDialog from '../modals/DeleteConfirmDialog';
import { useRouter } from 'next/navigation';


const BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';

const productFilters = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'outstock', label: 'Out of Stock' },
  { value: 'digital', label: 'Digital' },
  { value: 'physical', label: 'Physical' },
];

// Tab values to send to API (exactly as expected by backend)
const TAB_VALUES = {
  all: '',
  active: 'active',
  hidden: 'hidden',
  outstock: 'outstock',
  digital: 'digital',
  physical: 'physical',
};

// API Service Functions
const productApi = {
  // Check if product creation is allowed
  validateProductCreation: async (shopOwnerId) => {
    const response = await fetch(`${BASE_URL}/settings/shops/${shopOwnerId}/verification/validate`);
    if (!response.ok) throw new Error('Failed to validate product creation');
    return response.json();
  },

  // Fetch all products
  getAll: async ({ shopOwnerId, tab = '', searchStr = '', offset = 0, limit = 50 }) => {
    const params = new URLSearchParams({
      shopOwnerId: shopOwnerId.toString(),
      tab,
      searchStr,
      offset: offset.toString(),
      limit: limit.toString(),
    });
    
    const response = await fetch(`${BASE_URL}/products/getProductsByOwner?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  // Create product (FormData)
  create: async (requestData, imageFiles = []) => {
    const formData = new FormData();
    
    // Append the request JSON as a string
    formData.append('request', JSON.stringify(requestData));
    
    // Append each image file separately with key 'files'
    imageFiles.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${BASE_URL}/products/create`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  // Update product (FormData)
  update: async (productId, requestData, imageFiles = []) => {
    const formData = new FormData();
    
    // Append the request JSON as a string
    formData.append('request', JSON.stringify(requestData));
    
    // Append each image file separately with key 'files'
    imageFiles.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${BASE_URL}/products/update/${productId}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  // Delete product
  delete: async (productId) => {
    const response = await fetch(`${BASE_URL}/products/delete/${productId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
  },

  // Toggle visibility
  toggleVisibility: async (productId, status) => {
    const response = await fetch(`${BASE_URL}/products/${productId}/visibility?status=${status}`, {
      method: 'PUT',
    });
    if (!response.ok) throw new Error('Failed to update visibility');
    return response.json();
  },
};

// ─────────────────────────────────────────────────────
// Map API response → UI format
// ─────────────────────────────────────────────────────
const mapProductFromApi = (product) => {
  // Determine stock status
  let stockStatus = 'instock';
  if (product.quantity === 0) {
    stockStatus = 'outstock';
  } else if (product.quantity <= 10) {
    stockStatus = 'lowstock';
  } else if (product.inventoryType === 'UNLIMITED') {
    stockStatus = 'unlimited';
  }

  // Build variants display string from raw variants
  let variantsDisplay = '';
  if (product.variants && product.variants.length > 0) {
    const grouped = {};
    product.variants.forEach((v) => {
      const type = v.variantType || 'Custom';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(v.variantName);
    });
    variantsDisplay = Object.entries(grouped)
      .map(([type, names]) => `${type}: ${names.join(', ')}`)
      .join(' • ');
  }

  return {
    id: product.productId,
    // Display-friendly fields (used by product cards)
    name: product.productName,
    price: product.price,
    comparePrice: product.compareAtPrice,
    type: product.productType?.toLowerCase() || 'physical',
    status: product.status === 'PUBLIC' ? 'active' : 'hidden',
    stock: stockStatus,
    icon: product.productType === 'DIGITAL' ? '🎨' : '👕',
    variantsDisplay,

    // Raw API fields preserved for ProductModal editing
    productName: product.productName,
    description: product.description,
    compareAtPrice: product.compareAtPrice,
    productType: product.productType || 'PHYSICAL',
    inventoryType: product.inventoryType || 'IN_STOCK',
    quantity: product.quantity,
    sku: product.sku,
    weight: product.weight,
    profileId: product.profileId || null,
    deliveryMethod: product.deliveryMethod,
    currency: product.currency,
    images: product.images || [],
    // Variants in RAW API format — ProductModal reads variantType, variantName, etc.
    variants: product.variants || [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

export default function Products() {
  const { showToast } = useApp();
    const router = useRouter();
  
  
  // Get shopOwnerId from localStorage or context
  const shopOwnerId = typeof window !== 'undefined' 
    ? localStorage.getItem('shopOwnerId') || ''
    : '';
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [validatingShop, setValidatingShop] = useState(false);
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuProduct, setMenuProduct] = useState(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Send tab value exactly as it is (no transformation)
      const tab = TAB_VALUES[productFilter] || '';
      
      const response = await productApi.getAll({
        shopOwnerId,
        tab,
        searchStr: searchQuery,
        offset: 0,
        limit: 50,
      });
      
      if (response.success && response.data) {
        const mappedProducts = response.data.map(mapProductFromApi);
        setProducts(mappedProducts);
        setTotalRecords(response.totalRecords || mappedProducts.length);
      } else {
        setProducts([]);
        showToast(response.message || 'Failed to load products', 'error');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Failed to load products', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [shopOwnerId, searchQuery, productFilter, showToast]);

  // Initial fetch and filter change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        fetchProducts();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Products are already filtered by API, no local filtering needed
  const filteredProducts = products;

  // Validate shop settings before any product operation
  const validateShopSettings = async () => {
    try {
      setValidatingShop(true);
      const validationResponse = await productApi.validateProductCreation(shopOwnerId);
      
      if (!validationResponse.success) {
        throw new Error(validationResponse.message || 'Validation failed');
      }
      
      if (validationResponse.data === false) {
        // Saved shop waiting for PayBito approval: say so and stay here; otherwise finish the setup first.
        if ((await shopBlockedReason(BASE_URL, shopOwnerId)) === 'review') {
          showToast('Your shop is under review. You can add products once PayBito approves your shop.', 'info');
          return false;
        }
        showToast(
          'Please complete your shop setup before managing products. Redirecting to settings...',
          'warning'
        );
        setTimeout(() => {
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

  // Menu handlers
  const handleMenuOpen = (event, product) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuProduct(product);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuProduct(null);
  };

  // Product Modal handlers with validation
  const openProductModal = async (product = null) => {
    // Validate shop settings before opening modal
    const isValid = await validateShopSettings();
    if (!isValid) return;
    
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const closeProductModal = () => {
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  // Save product (create or update)
  const handleSaveProduct = async (requestData, imageFiles = []) => {
    try {
      // Validate shop settings before saving
      const isValid = await validateShopSettings();
      if (!isValid) return;
      
      // If validation passes, proceed with product creation/update
      if (editingProduct) {
        await productApi.update(editingProduct.id, requestData, imageFiles);
        showToast('Product updated successfully!', 'success');
      } else {
        const response = await productApi.create(requestData, imageFiles);
        if (response.success) {
          showToast('Product created successfully!', 'success');
        } else {
          throw new Error(response.message || 'Failed to create product');
        }
      }
      closeProductModal();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showToast(error.message || 'Failed to save product', 'error');
    }
  };

  // Toggle visibility
  const handleToggleVisibility = async (product) => {
    try {
      setActionLoading(product.id);
      const newStatus = product.status === 'active' ? 'HIDDEN' : 'PUBLIC';
      await productApi.toggleVisibility(product.id, newStatus);
      
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id 
            ? { ...p, status: newStatus === 'PUBLIC' ? 'active' : 'hidden' } 
            : p
        )
      );
      showToast(`Product ${newStatus === 'PUBLIC' ? 'published' : 'hidden'}`, 'success');
    } catch (error) {
      console.error('Error toggling visibility:', error);
      showToast('Failed to update visibility', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Edit product
  const handleEditProduct = async () => {
    // Validate shop settings before editing
    const isValid = await validateShopSettings();
    if (!isValid) {
      handleMenuClose();
      return;
    }
    
    openProductModal(menuProduct);
    handleMenuClose();
  };

  // Duplicate product — uses raw variant format
  const handleDuplicateProduct = async () => {
    try {
      handleMenuClose();
      if (!menuProduct) return;
      
      // Validate shop settings before duplication
      const isValid = await validateShopSettings();
      if (!isValid) return;
      
      const duplicateData = {
        shopOwnerId: parseInt(shopOwnerId),
        productName: `${menuProduct.productName} (Copy)`,
        description: menuProduct.description,
        price: menuProduct.price,
        compareAtPrice: menuProduct.compareAtPrice,
        inventoryType: menuProduct.inventoryType || 'IN_STOCK',
        quantity: menuProduct.quantity,
        sku: menuProduct.sku ? `${menuProduct.sku}-COPY` : '',
        productType: menuProduct.productType || 'PHYSICAL',
        weight: menuProduct.weight,
        profileId: menuProduct.profileId || null,
        deliveryMethod: menuProduct.deliveryMethod,
        status: 'DRAFT',
        currency: 'B$',
        imageUrls: menuProduct.images?.map(img => img.imageUrl).filter(Boolean) || [],
        // Variants are already in raw API format — just strip IDs for duplication
        variants: (menuProduct.variants || []).map((v) => ({
          variantType: v.variantType,
          variantName: v.variantName,
          variantSku: v.variantSku ? `${v.variantSku}-COPY` : '',
          priceOverride: v.priceOverride || 0,
          stock: v.stock || 0,
        })),
      };
      
      setActionLoading(menuProduct.id);
      const response = await productApi.create(duplicateData);
      if (response.success) {
        showToast('Product duplicated successfully!', 'success');
        fetchProducts();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error duplicating product:', error);
      showToast('Failed to duplicate product', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // View product
  const handleViewProduct = () => {
    // The panel's own product page, as a buyer sees it (window.open is not basePath-aware, so add it here).
    const params = new URLSearchParams({
      productId: String(menuProduct.id),
      shopCreatorId: String(shopOwnerId),
      userId: String(shopOwnerId),
      viewOnly: 'true',
    });
    window.open(`${WHITELABEL.basePath}/product/?${params.toString()}`, '_blank');
    handleMenuClose();
  };

  // Delete product
  const handleDeleteClick = () => {
    setProductToDelete(menuProduct);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      setActionLoading(productToDelete.id);
      await productApi.delete(productToDelete.id);
      showToast('Product deleted successfully!', 'success');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Failed to delete product', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  // Helper functions
  const getStockLabel = (product) => {
    if (product.stock === 'unlimited') return 'Unlimited';
    if (product.stock === 'outstock') return 'Out of Stock';
    if (product.stock === 'lowstock') return `Low Stock (${product.quantity})`;
    return `In Stock (${product.quantity})`;
  };

  // Loading skeleton
  const ProductSkeleton = () => (
    <Card>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" width="80%" height={28} />
        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="30%" height={32} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <TextField
          placeholder="Search products..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={validatingShop ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
          onClick={() => openProductModal()}
          disabled={validatingShop}
          sx={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            },
          }}
        >
          {validatingShop ? 'Validating...' : 'Add Product'}
        </Button>
      </Box>

      {/* Filters */}
      <FilterChips
        filters={productFilters}
        activeFilter={productFilter}
        onFilterChange={setProductFilter}
      />

      {/* Products Grid */}
      <Grid container spacing={2.5}>
        {loading ? (
          [...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <ProductSkeleton />
            </Grid>
          ))
        ) : (
          filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} lg={4} key={product.id}>
              <Card
                sx={{
                  transition: 'all 0.3s ease',
                  opacity: actionLoading === product.id ? 0.7 : 1,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(30, 64, 175, 0.5)',
                  },
                }}
              >
                <Box
                  sx={{
                    height: 200,
                    background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                    position: 'relative',
                  }}
                >
                  {product.images && product.images.length > 0 && product.images[0].imageUrl ? (
                    <img
                      src={product.images[0].imageUrl}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    product.icon
                  )}
                  {actionLoading === product.id && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0.5)',
                      }}
                    >
                      <CircularProgress size={40} />
                    </Box>
                  )}
                </Box>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {product.name}
                  </Typography>
                  {product.variantsDisplay && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                      {product.variantsDisplay}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Typography variant="h6" sx={{ color: '#22c55e', fontWeight: 700 }}>
                      B${product.price?.toFixed(2) || '0.00'}
                    </Typography>
                    {product.comparePrice && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255,255,255,0.4)',
                          textDecoration: 'line-through',
                        }}
                      >
                        B${product.comparePrice.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <StatusChip status={product.stock} label={getStockLabel(product)} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch
                        size="small"
                        checked={product.status === 'active'}
                        onChange={() => handleToggleVisibility(product)}
                        disabled={actionLoading === product.id}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, product)}
                        sx={{ color: 'rgba(255,255,255,0.5)' }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
            No products found
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 3 }}>
            {searchQuery ? 'Try adjusting your search' : 'Start by adding your first product'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => openProductModal()} 
            startIcon={validatingShop ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
            disabled={validatingShop}
          >
            {validatingShop ? 'Validating...' : 'Add Product'}
          </Button>
        </Box>
      )}

      {/* Product Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEditProduct}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicateProduct}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleViewProduct}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Product Modal */}
      <ProductModal
        open={productModalOpen}
        onClose={closeProductModal}
        onSave={handleSaveProduct}
        product={editingProduct}
        shopOwnerId={shopOwnerId}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        loading={actionLoading === productToDelete?.id}
      />
    </Box>
  );
}