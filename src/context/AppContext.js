'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { installServiceAuth } from '@/lib/serviceAuth';

// Send the member's sign-in with every MonetizeService / BrokerAdminApi call.
installServiceAuth();
import { mockProducts, mockOrders, mockCollections, mockContentItems } from '@/data/mockData';
import { signInUrl } from '@/config/whitelabel';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState(mockProducts);
  const [orders, setOrders] = useState(mockOrders);
  const [collections, setCollections] = useState(mockCollections);
  const [contentItems] = useState(mockContentItems);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [collectionEditorOpen, setCollectionEditorOpen] = useState(false);
  const [shopPreviewOpen, setShopPreviewOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [shopReviewModalOpen, setShopReviewModalOpen] = useState(false);
  const [restrictedProductsModalOpen, setRestrictedProductsModalOpen] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  // Filter states
  const [productFilter, setProductFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [contentFilter, setContentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7days');

  // Settings state
  const [settings, setSettings] = useState({
    shopName: 'CreatorStore',
    description: 'Premium merchandise and digital products from your favorite creator!',
    contactEmail: 'shop@creator.com',
    policiesLink: '',
    accentColor: '#3b82f6',
    theme: 'dark',
    shippingProfile: 'standard',
    shipsTo: 'worldwide',
    handlingTime: '1-2days',
    returnPolicy: '30-day returns accepted. Items must be unworn and in original packaging.',
    showShopOnProfile: true,
    allowProductTagging: true,
    externalCheckoutEnabled: false,
    externalCheckoutUrl: '',
  });

  const showToast = useCallback((message, severity = 'info') => {
    setToast({ open: true, message, severity });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, open: false }));
  }, []);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const openProductModal = useCallback(() => {
    setProductModalOpen(true);
  }, []);

  const closeProductModal = useCallback(() => {
    setProductModalOpen(false);
  }, []);

  const openOrderDetail = useCallback((order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  }, []);

  const closeOrderDetail = useCallback(() => {
    setOrderDetailOpen(false);
    setSelectedOrder(null);
  }, []);

  const openCollectionEditor = useCallback(() => {
    setCollectionEditorOpen(true);
  }, []);

  const closeCollectionEditor = useCallback(() => {
    setCollectionEditorOpen(false);
  }, []);

  const openShopPreview = useCallback(() => {
    const shopCreatorId = localStorage.getItem('shopOwnerId') || '';
    const userId = localStorage.getItem('userId') || '';
    if (!shopCreatorId) {
      window.location.href = signInUrl();
      return;
    }
    const shopUrl = `/merchandise/shop/?shopCreatorId=${shopCreatorId}&userId=${shopCreatorId}&viewOnly=true`;
    window.location.href = shopUrl;
  }, []);

  const closeShopPreview = useCallback(() => {
    setShopPreviewOpen(false);
  }, []);

  const toggleProductVisibility = useCallback((productId) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, status: product.status === 'active' ? 'hidden' : 'active' }
        : product
    ));
    showToast('Product visibility updated', 'success');
  }, [showToast]);

  const toggleCollectionVisibility = useCallback((collectionId) => {
    setCollections(prev => prev.map(collection => 
      collection.id === collectionId 
        ? { ...collection, isVisible: !collection.isVisible }
        : collection
    ));
    showToast('Collection visibility updated', 'success');
  }, [showToast]);

  const reorderCollections = useCallback((newOrder) => {
    setCollections(newOrder);
  }, []);

  const saveProduct = useCallback((productData) => {
    const newProduct = {
      id: String(products.length + 1),
      ...productData,
      status: 'active',
      stock: productData.type === 'digital' ? 'unlimited' : 'instock',
    };
    setProducts(prev => [...prev, newProduct]);
    showToast('Product saved successfully!', 'success');
    closeProductModal();
  }, [products.length, showToast, closeProductModal]);

  const saveCollection = useCallback((collectionData) => {
    const newCollection = {
      id: String(collections.length + 1),
      ...collectionData,
      productCount: 0,
      isVisible: true,
    };
    setCollections(prev => [...prev, newCollection]);
    showToast('Collection saved successfully!', 'success');
    closeCollectionEditor();
  }, [collections.length, showToast, closeCollectionEditor]);

  const markOrderShipped = useCallback((orderId) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, fulfillmentStatus: 'shipped', payoutStatus: 'released' }
        : order
    ));
    showToast('Order marked as shipped!', 'success');
  }, [showToast]);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showToast('Settings saved successfully!', 'success');
  }, [showToast]);

  const value = {
    // State
    activeTab,
    products,
    orders,
    collections,
    contentItems,
    mobileOpen,
    productModalOpen,
    orderDetailOpen,
    selectedOrder,
    collectionEditorOpen,
    shopPreviewOpen,
    supportModalOpen,
    shopReviewModalOpen,
    restrictedProductsModalOpen,
    toast,
    productFilter,
    orderFilter,
    contentFilter,
    dateRange,
    settings,
    
    // Actions
    setActiveTab,
    showToast,
    hideToast,
    handleDrawerToggle,
    setMobileOpen,
    openProductModal,
    closeProductModal,
    openOrderDetail,
    closeOrderDetail,
    openCollectionEditor,
    closeCollectionEditor,
    openShopPreview,
    closeShopPreview,
    setSupportModalOpen,
    setShopReviewModalOpen,
    setRestrictedProductsModalOpen,
    toggleProductVisibility,
    toggleCollectionVisibility,
    reorderCollections,
    saveProduct,
    saveCollection,
    markOrderShipped,
    updateSettings,
    setProductFilter,
    setOrderFilter,
    setContentFilter,
    setDateRange,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
