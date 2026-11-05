'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  Grid,
  Paper,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useApp } from '@/context/AppContext';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PublicIcon from '@mui/icons-material/Public';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const API_BASE_URL = 'https://institutional-bo.paybito.com:8443/MonetizeService';
const BROKER_ADMIN_API = 'https://institutional-bo.paybito.com:8443/BrokerAdminApi';

export default function Settings() {
  const { settings, updateSettings, setSupportModalOpen } = useApp();

  const [shopOwnerId, setShopOwnerId] = useState('0');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShopOwnerId(localStorage.getItem('shopOwnerId') || '3357');
    }
  }, []);

  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    contactEmail: '',
    policiesUrl: '',
    accentColor: '#1e40af',
    theme: 'DARK',
    showShopOnProfile: true,
    allowProductTagging: true,
    externalCheckoutEnabled: false,
    externalCheckoutUrl: '',
    heroBannerUrl: null,
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Balance state
  const [realBalance, setRealBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Shop Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ reviewType: 'Initial', message: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewErrors, setReviewErrors] = useState({});

  // Restricted Products State
  const [restrictedProducts, setRestrictedProducts] = useState([]);
  const [restrictedProductsLoading, setRestrictedProductsLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  const [restrictedProductsModalOpen, setRestrictedProductsModalOpen] = useState(false);

  // ============ SHIPPING TEMPLATES STATE ============
  const [shippingTemplates, setShippingTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateFormMode, setTemplateFormMode] = useState('create'); // 'create' or 'edit'
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [currentEditingTemplateId, setCurrentEditingTemplateId] = useState(null);

  // Template Form State
  const [templateFormData, setTemplateFormData] = useState({
    profileName: '',
    isDefault: false,
    zones: [],
  });

  // Zone Form State
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [currentZoneIndex, setCurrentZoneIndex] = useState(null);
  const [currentZone, setCurrentZone] = useState({
    zoneName: '',
    countries: [],
    methods: [],
  });

  // Method Form State
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [currentMethodIndex, setCurrentMethodIndex] = useState(null);
  const [currentMethod, setCurrentMethod] = useState({
    methodName: 'Standard',
    minDeliveryDays: 5,
    maxDeliveryDays: 7,
    basePrice: 5.99,
    pricePerKg: 2.00,
    freeShippingThreshold: '',
    carrier: '',
    trackingAvailable: true,
  });

  const [availableCountries, setAvailableCountries] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

  const [shippingTemplatesModalOpen, setShippingTemplatesModalOpen] = useState(false);

  // Template Detail View Modal State
  const [templateDetailModalOpen, setTemplateDetailModalOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState(null);

  // ============ DELETE CONFIRMATION STATE ============
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============ INLINE EDIT STATES ============
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [editingZoneName, setEditingZoneName] = useState('');
  const [isSavingZone, setIsSavingZone] = useState(false);

  const [editingMethodId, setEditingMethodId] = useState(null);
  const [editingMethodData, setEditingMethodData] = useState(null);
  const [isSavingMethod, setIsSavingMethod] = useState(false);

  // ============ FETCH FUNCTIONS ============

  const fetchUserBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const adminUser = localStorage.getItem('uuid');
      const userUuid = localStorage.getItem('financeHubUuid');

      const response = await fetch(
        `${BROKER_ADMIN_API}/finance-hub/getUserBalance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': `bearer ${localStorage.getItem('access_token_us')}`
          },
          body: JSON.stringify({ adminUser, userUuid })
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.error.error_data === 0 && result.userBalanceList) {
        const usdbBalance = result.userBalanceList.find(c => c.currencyCode === 'USDB');
        setRealBalance(usdbBalance ? usdbBalance.closingBalance : 0);
      } else {
        throw new Error(result.error.error_msg || 'Failed to fetch balance');
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
      setRealBalance(0);
      setSnackbar({ open: true, message: 'Failed to load balance', severity: 'warning' });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const fetchShippingTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/shipping/shopowner`,
        { params: { shopOwnerId: localStorage.getItem('shopOwnerId') } }
      );

      if (response.data.success) {
        setShippingTemplates(response.data.data || []);
        const defaultTemplate = response.data.data?.find(t => t.isDefault === 1);
        if (defaultTemplate) setSelectedTemplateId(defaultTemplate.profileId);
      }
    } catch (error) {
      console.error('Error fetching shipping templates:', error);
      setSnackbar({ open: true, message: 'Failed to load shipping templates', severity: 'error' });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const fetchAvailableCountries = async () => {
    setIsLoadingCountries(true);
    try {
      const response = await axios.get(
        'https://accounts.paybito.com/api/home/getExchangeCountries/PAYB18022021121103'
      );

      if (response.data.countries && Array.isArray(response.data.countries)) {
        const sortedCountries = response.data.countries
          .sort((a, b) => a.country.toLowerCase().localeCompare(b.country.toLowerCase()))
          .map(c => ({ code: c.code, name: c.country, dialCode: c.dialCode }));
        setAvailableCountries(sortedCountries);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      setSnackbar({ open: true, message: 'Failed to load countries list', severity: 'error' });
    } finally {
      setIsLoadingCountries(false);
    }
  };

  const fetchRestrictedProducts = async () => {
    setRestrictedProductsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/restricted-products`);
      if (Array.isArray(response.data)) {
        setRestrictedProducts(response.data);
      } else {
        setSnackbar({ open: true, message: 'Failed to load restricted products - unexpected response format', severity: 'error' });
      }
    } catch (error) {
      console.error('Error fetching restricted products:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to load restricted products', severity: 'error' });
    } finally {
      setRestrictedProductsLoading(false);
    }
  };

  // ============ PUT /shipping/profile — CORE UPDATE/DELETE API ============

  const callShippingProfileApi = async (payload) => {
    const response = await axios.put(`${API_BASE_URL}/shipping/profile`, payload);
    return response.data;
  };

  // ============ UPDATE HANDLERS ============

  const handleSaveZoneName = async (template, zone) => {
    if (!editingZoneName.trim()) {
      setSnackbar({ open: true, message: 'Zone name cannot be empty', severity: 'error' });
      return;
    }

    setIsSavingZone(true);
    try {
      const firstMethod = zone.methods?.[0];
      if (!firstMethod) {
        setSnackbar({ open: true, message: 'Zone must have at least one method to update', severity: 'error' });
        return;
      }
      const firstCountry = zone.countries?.[0];

      const payload = {
        profileId: template.profileId,
        shopOwnerId: parseInt(shopOwnerId, 10),
        profileName: template.profileName,
        isDefault: template.isDefault === true || template.isDefault === 1 ? 1 : 0,
        isActive: template.isActive ?? 1,
        zoneId: zone.zoneId,
        zoneName: editingZoneName.trim(),
        zoneIsActive: zone.isActive ?? 1,
        zoneAction: 'U',
        zoneCountryId: firstCountry?.zoneCountryId ?? null,
        countryCode: firstCountry?.countryCode ?? null,
        countryAction: 'U',
        methodId: firstMethod.methodId,
        methodName: firstMethod.methodName,
        minDeliveryDays: firstMethod.minDeliveryDays,
        maxDeliveryDays: firstMethod.maxDeliveryDays,
        basePrice: firstMethod.basePrice,
        pricePerKg: firstMethod.pricePerKg ?? 0,
        freeShippingThreshold: firstMethod.freeShippingThreshold ?? null,
        carrier: firstMethod.carrier ?? '',
        trackingAvailable: firstMethod.trackingAvailable === 1 || firstMethod.trackingAvailable === true ? 1 : 0,
        currency: firstMethod.currency ?? 'USD',
        methodIsActive: firstMethod.isActive ?? 1,
        methodAction: 'U',
      };

      const result = await callShippingProfileApi(payload);

      if (result.success) {
        setSnackbar({ open: true, message: 'Zone name updated successfully', severity: 'success' });
        setEditingZoneId(null);
        setEditingZoneName('');
        await fetchShippingTemplates();
        if (viewingTemplate?.profileId === template.profileId) {
          const updated = (await axios.get(`${API_BASE_URL}/shipping/shopowner`, { params: { shopOwnerId: localStorage.getItem('shopOwnerId') } })).data.data?.find(t => t.profileId === template.profileId);
          if (updated) setViewingTemplate(updated);
        }
      } else {
        setSnackbar({ open: true, message: result.message || 'Failed to update zone name', severity: 'error' });
      }
    } catch (error) {
      console.error('Error updating zone name:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update zone name', severity: 'error' });
    } finally {
      setIsSavingZone(false);
    }
  };

  const handleSaveMethod = async (template, zone) => {
    if (!editingMethodData) return;

    if (editingMethodData.minDeliveryDays > editingMethodData.maxDeliveryDays) {
      setSnackbar({ open: true, message: 'Min delivery days cannot exceed max delivery days', severity: 'error' });
      return;
    }
    if (editingMethodData.basePrice < 0) {
      setSnackbar({ open: true, message: 'Base price cannot be negative', severity: 'error' });
      return;
    }

    setIsSavingMethod(true);
    try {
      const firstCountry = zone.countries?.[0];

      const payload = {
        profileId: template.profileId,
        shopOwnerId: parseInt(shopOwnerId, 10),
        profileName: template.profileName,
        isDefault: template.isDefault === true || template.isDefault === 1 ? 1 : 0,
        isActive: template.isActive ?? 1,
        zoneId: zone.zoneId,
        zoneName: zone.zoneName,
        zoneIsActive: zone.isActive ?? 1,
        zoneAction: 'U',
        zoneCountryId: firstCountry?.zoneCountryId ?? null,
        countryCode: firstCountry?.countryCode ?? null,
        countryAction: 'U',
        methodId: editingMethodData.methodId,
        methodName: editingMethodData.methodName,
        minDeliveryDays: parseInt(editingMethodData.minDeliveryDays),
        maxDeliveryDays: parseInt(editingMethodData.maxDeliveryDays),
        basePrice: parseFloat(editingMethodData.basePrice),
        pricePerKg: parseFloat(editingMethodData.pricePerKg ?? 0),
        freeShippingThreshold: editingMethodData.freeShippingThreshold ? parseFloat(editingMethodData.freeShippingThreshold) : null,
        carrier: editingMethodData.carrier ?? '',
        trackingAvailable: editingMethodData.trackingAvailable ? 1 : 0,
        currency: editingMethodData.currency ?? 'USD',
        methodIsActive: editingMethodData.isActive ?? 1,
        methodAction: 'U',
      };

      const result = await callShippingProfileApi(payload);

      if (result.success) {
        setSnackbar({ open: true, message: 'Method updated successfully', severity: 'success' });
        setEditingMethodId(null);
        setEditingMethodData(null);
        await fetchShippingTemplates();
        if (viewingTemplate?.profileId === template.profileId) {
          const updated = (await axios.get(`${API_BASE_URL}/shipping/shopowner`, { params: { shopOwnerId: localStorage.getItem('shopOwnerId') } })).data.data?.find(t => t.profileId === template.profileId);
          if (updated) setViewingTemplate(updated);
        }
      } else {
        setSnackbar({ open: true, message: result.message || 'Failed to update method', severity: 'error' });
      }
    } catch (error) {
      console.error('Error updating method:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update method', severity: 'error' });
    } finally {
      setIsSavingMethod(false);
    }
  };

  // ============ DELETE HANDLERS ============

  const handleOpenDeleteConfirm = (target) => {
    setDeleteTarget(target);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const { type, template, zone, country, method } = deleteTarget;

      let payload = {
        profileId: template.profileId,
        shopOwnerId: parseInt(shopOwnerId, 10),
        profileName: template.profileName,
        isDefault: template.isDefault === true || template.isDefault === 1 ? 1 : 0,
        isActive: template.isActive ?? 1,
      };

      if (type === 'zone') {
        const firstMethod = zone.methods?.[0];
        const firstCountry = zone.countries?.[0];
        payload = {
          ...payload,
          zoneId: zone.zoneId,
          zoneName: zone.zoneName,
          zoneIsActive: 0,
          zoneAction: 'D',
          zoneCountryId: firstCountry?.zoneCountryId ?? null,
          countryCode: firstCountry?.countryCode ?? null,
          countryAction: 'D',
          methodId: firstMethod?.methodId ?? null,
          methodName: firstMethod?.methodName ?? '',
          minDeliveryDays: firstMethod?.minDeliveryDays ?? 1,
          maxDeliveryDays: firstMethod?.maxDeliveryDays ?? 1,
          basePrice: firstMethod?.basePrice ?? 0,
          pricePerKg: firstMethod?.pricePerKg ?? 0,
          freeShippingThreshold: firstMethod?.freeShippingThreshold ?? null,
          carrier: firstMethod?.carrier ?? '',
          trackingAvailable: firstMethod?.trackingAvailable === 1 ? 1 : 0,
          currency: firstMethod?.currency ?? 'USD',
          methodIsActive: 0,
          methodAction: 'D',
        };
      } else if (type === 'country') {
        const firstMethod = zone.methods?.[0];
        payload = {
          ...payload,
          zoneId: zone.zoneId,
          zoneName: zone.zoneName,
          zoneIsActive: zone.isActive ?? 1,
          zoneAction: 'U',
          zoneCountryId: country.zoneCountryId,
          countryCode: country.countryCode,
          countryAction: 'D',
          methodId: firstMethod?.methodId ?? null,
          methodName: firstMethod?.methodName ?? '',
          minDeliveryDays: firstMethod?.minDeliveryDays ?? 1,
          maxDeliveryDays: firstMethod?.maxDeliveryDays ?? 1,
          basePrice: firstMethod?.basePrice ?? 0,
          pricePerKg: firstMethod?.pricePerKg ?? 0,
          freeShippingThreshold: firstMethod?.freeShippingThreshold ?? null,
          carrier: firstMethod?.carrier ?? '',
          trackingAvailable: firstMethod?.trackingAvailable === 1 ? 1 : 0,
          currency: firstMethod?.currency ?? 'USD',
          methodIsActive: firstMethod?.isActive ?? 1,
          methodAction: 'U',
        };
      } else if (type === 'method') {
        const firstCountry = zone.countries?.[0];
        payload = {
          ...payload,
          zoneId: zone.zoneId,
          zoneName: zone.zoneName,
          zoneIsActive: zone.isActive ?? 1,
          zoneAction: 'U',
          zoneCountryId: firstCountry?.zoneCountryId ?? null,
          countryCode: firstCountry?.countryCode ?? null,
          countryAction: 'U',
          methodId: method.methodId,
          methodName: method.methodName,
          minDeliveryDays: method.minDeliveryDays,
          maxDeliveryDays: method.maxDeliveryDays,
          basePrice: method.basePrice,
          pricePerKg: method.pricePerKg ?? 0,
          freeShippingThreshold: method.freeShippingThreshold ?? null,
          carrier: method.carrier ?? '',
          trackingAvailable: method.trackingAvailable === 1 ? 1 : 0,
          currency: method.currency ?? 'USD',
          methodIsActive: 0,
          methodAction: 'D',
        };
      }

      const result = await callShippingProfileApi(payload);

      if (result.success) {
        const typeLabel = type === 'zone' ? 'Zone' : type === 'country' ? 'Country' : 'Method';
        setSnackbar({ open: true, message: `${typeLabel} deleted successfully`, severity: 'success' });
        setDeleteConfirmOpen(false);
        setDeleteTarget(null);
        await fetchShippingTemplates();
        if (viewingTemplate?.profileId === template.profileId) {
          const refreshed = (await axios.get(`${API_BASE_URL}/shipping/shopowner`, { params: { shopOwnerId: localStorage.getItem('shopOwnerId') } })).data.data?.find(t => t.profileId === template.profileId);
          if (refreshed) setViewingTemplate(refreshed);
          else {
            setTemplateDetailModalOpen(false);
            setViewingTemplate(null);
          }
        }
      } else {
        setSnackbar({ open: true, message: result.message || 'Failed to delete', severity: 'error' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to delete', severity: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // ============ SHIPPING TEMPLATE CREATE HANDLERS ============

  const saveShippingTemplate = async () => {
    if (!templateFormData.profileName.trim()) {
      setSnackbar({ open: true, message: 'Template name is required', severity: 'error' });
      return;
    }
    if (templateFormData.zones.length === 0) {
      setSnackbar({ open: true, message: 'Please add at least one shipping zone', severity: 'error' });
      return;
    }

    setIsSavingTemplate(true);
    try {
      const payload = {
        shopOwnerId: parseInt(shopOwnerId, 10),
        profileName: templateFormData.profileName.trim(),
        isDefault: templateFormData.isDefault,
        zones: templateFormData.zones.map(zone => ({
          zoneName: zone.zoneName,
          countries: zone.countries.map(c => c.code),
          methods: zone.methods.map(method => ({
            methodName: method.methodName,
            minDeliveryDays: parseInt(method.minDeliveryDays),
            maxDeliveryDays: parseInt(method.maxDeliveryDays),
            basePrice: parseFloat(method.basePrice),
            pricePerKg: parseFloat(method.pricePerKg || 0),
            freeShippingThreshold: method.freeShippingThreshold ? parseFloat(method.freeShippingThreshold) : null,
            carrier: method.carrier || '',
            trackingAvailable: method.trackingAvailable ?? true,
          })),
        })),
      };

      const response = await axios.post(`${API_BASE_URL}/shipping/template`, payload);

      if (response.data.success) {
        setSnackbar({ open: true, message: response.data.message || 'Template created successfully!', severity: 'success' });
        await fetchShippingTemplates();
        setTemplateModalOpen(false);
        resetTemplateForm();
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Failed to save template', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to save template', severity: 'error' });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const resetTemplateForm = () => {
    setTemplateFormData({ profileName: '', isDefault: false, zones: [] });
    setTemplateFormMode('create');
    setCurrentEditingTemplateId(null);
  };

  const handleOpenTemplateModal = () => {
    resetTemplateForm();
    setTemplateModalOpen(true);
  };

  const handleViewTemplate = (template) => {
    setViewingTemplate(template);
    setTemplateDetailModalOpen(true);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch { return dateStr; }
  };

  const getCountryName = (code) => {
    const found = availableCountries.find(c => c.code === code);
    return found ? found.name : code;
  };

  // ============ ZONE HANDLERS ============

  const handleAddZone = () => {
    if (!currentZone.zoneName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a zone name', severity: 'error' });
      return;
    }
    if (currentZone.countries.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one country', severity: 'error' });
      return;
    }
    if (currentZone.methods.length === 0) {
      setSnackbar({ open: true, message: 'Please add at least one shipping method', severity: 'error' });
      return;
    }

    if (currentZoneIndex !== null) {
      const updatedZones = [...templateFormData.zones];
      updatedZones[currentZoneIndex] = { ...currentZone };
      setTemplateFormData(prev => ({ ...prev, zones: updatedZones }));
    } else {
      setTemplateFormData(prev => ({ ...prev, zones: [...prev.zones, { ...currentZone }] }));
    }

    resetZoneForm();
    setZoneModalOpen(false);
  };

  const resetZoneForm = () => {
    setCurrentZone({ zoneName: '', countries: [], methods: [] });
    setCurrentZoneIndex(null);
  };

  const handleOpenZoneModal = () => {
    resetZoneForm();
    setZoneModalOpen(true);
  };

  const handleEditZone = (zoneIndex) => {
    setCurrentZoneIndex(zoneIndex);
    setCurrentZone({ ...templateFormData.zones[zoneIndex] });
    setZoneModalOpen(true);
  };

  const handleDeleteZone = (zoneIndex) => {
    setTemplateFormData(prev => ({ ...prev, zones: prev.zones.filter((_, i) => i !== zoneIndex) }));
  };

  // ============ METHOD HANDLERS ============

  const handleAddMethod = () => {
    if (!currentMethod.methodName.trim()) {
      setSnackbar({ open: true, message: 'Method name is required', severity: 'error' });
      return;
    }
    if (currentMethod.minDeliveryDays < 1 || currentMethod.maxDeliveryDays < 1) {
      setSnackbar({ open: true, message: 'Delivery days must be at least 1', severity: 'error' });
      return;
    }
    if (currentMethod.minDeliveryDays > currentMethod.maxDeliveryDays) {
      setSnackbar({ open: true, message: 'Minimum delivery days cannot exceed maximum', severity: 'error' });
      return;
    }
    if (currentMethod.basePrice < 0) {
      setSnackbar({ open: true, message: 'Base price cannot be negative', severity: 'error' });
      return;
    }

    if (currentMethodIndex !== null) {
      const updatedMethods = [...currentZone.methods];
      updatedMethods[currentMethodIndex] = { ...currentMethod };
      setCurrentZone(prev => ({ ...prev, methods: updatedMethods }));
    } else {
      setCurrentZone(prev => ({ ...prev, methods: [...prev.methods, { ...currentMethod }] }));
    }

    resetMethodForm();
    setMethodModalOpen(false);
  };

  const resetMethodForm = () => {
    setCurrentMethod({
      methodName: 'Standard',
      minDeliveryDays: 5,
      maxDeliveryDays: 7,
      basePrice: 5.99,
      pricePerKg: 2.00,
      freeShippingThreshold: '',
      carrier: '',
      trackingAvailable: true,
    });
    setCurrentMethodIndex(null);
  };

  const handleOpenMethodModal = () => {
    resetMethodForm();
    setMethodModalOpen(true);
  };

  const handleEditMethod = (methodIndex) => {
    setCurrentMethodIndex(methodIndex);
    setCurrentMethod({ ...currentZone.methods[methodIndex] });
    setMethodModalOpen(true);
  };

  const handleDeleteMethod = (methodIndex) => {
    setCurrentZone(prev => ({ ...prev, methods: prev.methods.filter((_, i) => i !== methodIndex) }));
  };

  // ============ USEEFFECTS ============

  useEffect(() => {
    fetchUserBalance();
    fetchAvailableCountries();
    fetchShippingTemplates();
  }, []);

  const handleToggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const handleOpenRestrictedProductsModal = () => {
    setRestrictedProductsModalOpen(true);
    fetchRestrictedProducts();
  };

  const handleOpenReviewModal = () => {
    setReviewModalOpen(true);
    setReviewData({ reviewType: 'Initial', message: '' });
    setReviewErrors({});
  };

  useEffect(() => {
    if (shopOwnerId === '0') return;

    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/settings/shopdetails/${shopOwnerId}`);
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          setFormData({
            shopName: data.shopName || '',
            description: data.description || '',
            contactEmail: data.contactEmail || '',
            policiesUrl: data.policiesUrl || '',
            accentColor: data.accentColor || '#1e40af',
            theme: data.theme?.toUpperCase() || 'DARK',
            showShopOnProfile: data.showShopOnProfile === 'Y',
            allowProductTagging: data.allowProductTagging === 'Y',
            externalCheckoutEnabled: data.externalCheckoutEnabled === 'Y',
            externalCheckoutUrl: data.externalCheckoutUrl || '',
            heroBannerUrl: data.heroBannerUrl || null,
          });
          if (data.heroBannerUrl) setBannerPreview(data.heroBannerUrl);
          updateSettings({ ...data, shopOwnerId: data.shopOwnerId });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to load settings', severity: 'error' });
      } finally {
        setInitialLoading(false);
      }
    };
    fetchSettings();
  }, [shopOwnerId]);

  // ============ FORM VALIDATION ============

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidUrl = (url) => {
    if (!url || url.trim() === '') return true;
    try { new URL(url); return true; } catch { return false; }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.shopName.trim()) newErrors.shopName = 'Shop name is required';
    else if (formData.shopName.trim().length < 3) newErrors.shopName = 'Shop name must be at least 3 characters';
    else if (formData.shopName.trim().length > 100) newErrors.shopName = 'Shop name must not exceed 100 characters';

    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.trim().length < 10) newErrors.description = 'Description must be at least 10 characters';
    else if (formData.description.trim().length > 500) newErrors.description = 'Description must not exceed 500 characters';

    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
    else if (!isValidEmail(formData.contactEmail.trim())) newErrors.contactEmail = 'Please enter a valid email address';

    if (formData.policiesUrl.trim() && !isValidUrl(formData.policiesUrl.trim())) newErrors.policiesUrl = 'Please enter a valid URL';

    if (formData.externalCheckoutEnabled) {
      if (!formData.externalCheckoutUrl.trim()) newErrors.externalCheckoutUrl = 'External checkout URL is required when enabled';
      else if (!isValidUrl(formData.externalCheckoutUrl.trim())) newErrors.externalCheckoutUrl = 'Please enter a valid URL';
    }

    if (bannerFile) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(bannerFile.type)) newErrors.bannerFile = 'Please upload a valid image file (JPEG, PNG, GIF, or WEBP)';
      else if (bannerFile.size > 5 * 1024 * 1024) newErrors.bannerFile = 'Banner image must be less than 5MB';
    }

    if (!formData.accentColor || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(formData.accentColor)) newErrors.accentColor = 'Please select a valid color';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateReviewForm = () => {
    const newErrors = {};
    if (!reviewData.message.trim()) newErrors.message = 'Message is required';
    else if (reviewData.message.trim().length < 20) newErrors.message = 'Message must be at least 20 characters';
    else if (reviewData.message.trim().length > 1000) newErrors.message = 'Message must not exceed 1000 characters';
    if (!reviewData.reviewType) newErrors.reviewType = 'Please select a review type';
    setReviewErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleExternalCheckoutToggle = () => {
    setFormData(prev => ({ ...prev, externalCheckoutEnabled: !prev.externalCheckoutEnabled }));
    if (formData.externalCheckoutEnabled) setErrors(prev => ({ ...prev, externalCheckoutUrl: '' }));
  };

  const handleBannerUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, bannerFile: 'Please upload a valid image file (JPEG, PNG, GIF, or WEBP)' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, bannerFile: 'Banner image must be less than 5MB' }));
        return;
      }
      setErrors(prev => ({ ...prev, bannerFile: '' }));
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerClick = () => fileInputRef.current?.click();

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    setFormData(prev => ({ ...prev, heroBannerUrl: null }));
    setErrors(prev => ({ ...prev, bannerFile: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSnackbar({ open: true, message: 'Please fix the errors in the form before saving', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const formDataPayload = new FormData();
      const requestData = {
        shopOwnerId,
        externalCheckoutEnabled: formData.externalCheckoutEnabled ? 'Y' : 'N',
        externalCheckoutUrl: formData.externalCheckoutUrl.trim() || '',
        shopName: formData.shopName.trim(),
        description: formData.description.trim(),
        contactEmail: formData.contactEmail.trim(),
        policiesUrl: formData.policiesUrl.trim(),
        heroBannerUrl: formData.heroBannerUrl,
        accentColor: formData.accentColor,
        theme: formData.theme.toUpperCase(),
        shippingProfile: '',
        shipsTo: '',
        handlingTime: '',
        returnPolicy: '',
        showShopOnProfile: formData.showShopOnProfile ? 'Y' : 'N',
        allowProductTagging: formData.allowProductTagging ? 'Y' : 'N',
      };
      formDataPayload.append('request', JSON.stringify(requestData));
      if (bannerFile) formDataPayload.append('bannerFile', bannerFile);

      const response = await axios.post(`${API_BASE_URL}/settings/save`, formDataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        updateSettings(formData);
        setSnackbar({ open: true, message: response.data.message || 'Settings saved successfully!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Failed to save settings', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'An error occurred while saving settings', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!validateReviewForm()) return;
    setReviewLoading(true);
    try {
      const payload = { shopOwnerId: parseInt(shopOwnerId, 10), reviewType: reviewData.reviewType, message: reviewData.message.trim() };
      const response = await axios.post(`${API_BASE_URL}/settings/review-request`, payload);
      if (response.data.success) {
        setSnackbar({ open: true, message: response.data.message || 'Review request submitted successfully!', severity: 'success' });
        setReviewModalOpen(false);
        setReviewData({ reviewType: 'Initial', message: '' });
        setReviewErrors({});
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Failed to submit review request', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'An error occurred while submitting review request', severity: 'error' });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewDataChange = (field) => (event) => {
    const value = event.target.value;
    setReviewData(prev => ({ ...prev, [field]: value }));
    if (reviewErrors[field]) setReviewErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setReviewData({ reviewType: 'Initial', message: '' });
    setReviewErrors({});
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const formatBalance = (balance) => balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ============ DELETE CONFIRM DIALOG CONTENT HELPER ============
  const getDeleteMessage = () => {
    if (!deleteTarget) return '';
    const { type } = deleteTarget;
    if (type === 'zone') return `Delete zone "${deleteTarget.zone?.zoneName}"? All countries and methods in this zone will also be removed.`;
    if (type === 'country') return `Remove country "${getCountryName(deleteTarget.country?.countryCode)}" (${deleteTarget.country?.countryCode}) from zone "${deleteTarget.zone?.zoneName}"?`;
    if (type === 'method') return `Delete shipping method "${deleteTarget.method?.methodName}" from zone "${deleteTarget.zone?.zoneName}"?`;
    return 'Are you sure you want to delete this item?';
  };

  // ============ RENDER ============

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Settings</Typography>

      {initialLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {[50, 200, 200, 100, 200].map((h, i) => (
            <Card key={i} sx={{ mb: 2.5 }}>
              <CardContent>
                <Skeleton variant="rectangular" height={h} />
              </CardContent>
            </Card>
          ))}
          <Skeleton variant="rectangular" width={180} height={42} />
        </Box>
      ) : (
        <>
          {/* External Checkout Toggle */}
          <Card sx={{ mb: 2.5 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">External Checkout</Typography>
                <Switch checked={formData.externalCheckoutEnabled} onChange={handleExternalCheckoutToggle} />
              </Box>
              {formData.externalCheckoutEnabled && (
                <TextField
                  fullWidth
                  placeholder="https://your-external-store.com"
                  value={formData.externalCheckoutUrl}
                  onChange={handleChange('externalCheckoutUrl')}
                  sx={{ mt: 2 }}
                  size="small"
                  error={!!errors.externalCheckoutUrl}
                  helperText={errors.externalCheckoutUrl}
                />
              )}
            </CardContent>
          </Card>

          <Box sx={{ opacity: formData.externalCheckoutEnabled ? 0.5 : 1, pointerEvents: formData.externalCheckoutEnabled ? 'none' : 'auto' }}>
            {/* Shop Information */}
            <Card sx={{ mb: 2.5 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  Shop Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField label="Shop Name" fullWidth value={formData.shopName} onChange={handleChange('shopName')} size="small" error={!!errors.shopName} helperText={errors.shopName || `${formData.shopName.length}/100 characters`} required />
                  <TextField label="Description" fullWidth multiline rows={3} value={formData.description} onChange={handleChange('description')} size="small" error={!!errors.description} helperText={errors.description || `${formData.description.length}/500 characters`} required />
                  <TextField label="Contact Email" fullWidth value={formData.contactEmail} onChange={handleChange('contactEmail')} size="small" error={!!errors.contactEmail} helperText={errors.contactEmail} required type="email" />
                  <TextField label="External Policies Link" fullWidth placeholder="https://yoursite.com/policies" value={formData.policiesUrl} onChange={handleChange('policiesUrl')} size="small" error={!!errors.policiesUrl} helperText={errors.policiesUrl} />
                </Box>
              </CardContent>
            </Card>

            {/* Shop Customization */}
            <Card sx={{ mb: 2.5 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  Shop Customization
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <input type="file" ref={fileInputRef} onChange={handleBannerUpload} accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: 'none' }} />
                  <Box>
                    <Box
                      onClick={handleBannerClick}
                      sx={{
                        border: errors.bannerFile ? '2px dashed #f44336' : '2px dashed rgba(255,255,255,0.2)',
                        borderRadius: 3, p: bannerPreview ? 0 : 4, textAlign: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative',
                        '&:hover': { borderColor: errors.bannerFile ? '#f44336' : 'rgba(30, 64, 175, 0.5)', bgcolor: 'rgba(30, 64, 175, 0.05)' },
                      }}
                    >
                      {bannerPreview ? (
                        <Box sx={{ position: 'relative' }}>
                          <Box component="img" src={bannerPreview} alt="Banner preview" sx={{ width: '100%', height: 150, objectFit: 'cover' }} />
                          <Button size="small" variant="contained" color="error" onClick={(e) => { e.stopPropagation(); handleRemoveBanner(); }} sx={{ position: 'absolute', top: 8, right: 8 }}>Remove</Button>
                        </Box>
                      ) : (
                        <>
                          <Typography sx={{ fontSize: 32, mb: 1 }}>🎨</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Upload hero banner (1920x400 recommended)</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>Max 5MB • JPEG, PNG, GIF, WEBP</Typography>
                        </>
                      )}
                    </Box>
                    {errors.bannerFile && <FormHelperText error sx={{ mt: 1 }}>{errors.bannerFile}</FormHelperText>}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box>
                      <TextField type="color" label="Accent Color" value={formData.accentColor} onChange={handleChange('accentColor')} sx={{ width: 100 }} size="small" error={!!errors.accentColor} />
                      {errors.accentColor && <FormHelperText error>{errors.accentColor}</FormHelperText>}
                    </Box>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel>Theme</InputLabel>
                      <Select value={formData.theme} onChange={handleChange('theme')} label="Theme">
                        <MenuItem value="LIGHT">Light Theme</MenuItem>
                        <MenuItem value="DARK">Dark Theme</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>Auto Badges</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label="⚡ Fast Ship" size="small" sx={{ bgcolor: 'rgba(250, 204, 21, 0.2)', color: '#facc15' }} />
                      <Chip label="💾 Digital" size="small" sx={{ bgcolor: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' }} />
                      <Chip label="🪙 Crypto" size="small" sx={{ bgcolor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                      Badges are automatically applied based on your products and settings
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Payouts */}
            <Card sx={{ mb: 2.5 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Payouts</Typography>
                  <IconButton size="small" onClick={fetchUserBalance} disabled={isLoadingBalance} sx={{ color: 'primary.main' }}>
                    {isLoadingBalance ? <CircularProgress size={20} /> : <Typography sx={{ fontSize: 20 }}>🔄</Typography>}
                  </IconButton>
                </Box>
                <Box sx={{ p: 2, bgcolor: 'rgba(30, 64, 175, 0.1)', borderRadius: 2.5, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Current Method</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>BitoDollar Wallet (USDB)</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Balance</Typography>
                      {isLoadingBalance ? <Skeleton variant="text" width={120} height={40} /> : (
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>B${formatBalance(realBalance)}</Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  All shop payments are received in BitoDollars. You can withdraw or convert to USD, USDC, or USDT from your main monetization panel.
                </Typography>
              </CardContent>
            </Card>

            {/* Shipping Templates Section */}
            <Card sx={{ mb: 2.5 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Shipping Templates</Typography>
                  <Button
                    variant="contained" size="small" startIcon={<LocalShippingIcon />}
                    onClick={() => setShippingTemplatesModalOpen(true)}
                    sx={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', textTransform: 'none', '&:hover': { background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' } }}
                  >
                    Manage Templates
                  </Button>
                </Box>

                {isLoadingTemplates ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                ) : shippingTemplates.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <LocalShippingIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No shipping templates created yet</Typography>
                    <Button variant="outlined" size="small" onClick={handleOpenTemplateModal} sx={{ textTransform: 'none' }}>Create Your First Template</Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Active Templates: {shippingTemplates.length}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {shippingTemplates.slice(0, 3).map(template => (
                        <Paper key={template.profileId} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{template.profileName}</Typography>
                            {(template.isDefault === true || template.isDefault === 1) && (
                              <Chip label="Default" size="small" sx={{ height: 20, bgcolor: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontSize: '0.7rem' }} />
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">{template.zones?.length || 0} zones</Typography>
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => handleViewTemplate(template)} sx={{ color: '#60a5fa', p: 0.5 }}>
                                <VisibilityIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                    {shippingTemplates.length > 3 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                        +{shippingTemplates.length - 3} more templates
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Shop Visibility */}
            <Card sx={{ mb: 2.5 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Shop Visibility</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                  <Typography variant="body2">Show &quot;View Shop&quot; on my profile</Typography>
                  <Switch checked={formData.showShopOnProfile} onChange={handleChange('showShopOnProfile')} />
                </Box>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                  <Typography variant="body2">Allow product tagging on my content</Typography>
                  <Switch checked={formData.allowProductTagging} onChange={handleChange('allowProductTagging')} />
                </Box>
              </CardContent>
            </Card>

            {/* Policies & Support */}
            <Card sx={{ mb: 2.5 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Policies & Support</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button fullWidth variant="outlined" onClick={handleOpenRestrictedProductsModal} sx={{ justifyContent: 'flex-start', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                    📋 View Restricted Products List
                  </Button>
                  {/* <Button fullWidth variant="outlined" onClick={handleOpenReviewModal} sx={{ justifyContent: 'flex-start', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                    🔄 Request Shop Review
                  </Button> */}
                  <Button fullWidth variant="outlined" onClick={() => setSupportModalOpen(true)} sx={{ justifyContent: 'flex-start', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                    💬 Contact Support
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Button
              variant="contained" onClick={handleSave} disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', px: 4,
                '&:hover': { background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' },
                '&:disabled': { background: 'rgba(255,255,255,0.1)' },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Save All Settings'}
            </Button>
          </Box>
        </>
      )}

      {/* ============ SHIPPING TEMPLATES MANAGEMENT MODAL ============ */}
      <Dialog
        open={shippingTemplatesModalOpen}
        onClose={() => setShippingTemplatesModalOpen(false)}
        maxWidth="lg" fullWidth
        PaperProps={{ sx: { bgcolor: '#1a1a2e', backgroundImage: 'none', height: '90vh' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShippingIcon />
            <Typography variant="h6">Shipping Templates</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenTemplateModal}
              sx={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', textTransform: 'none', '&:hover': { background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' } }}
            >
              New Template
            </Button>
            <IconButton onClick={() => setShippingTemplatesModalOpen(false)}><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {isLoadingTemplates ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
          ) : shippingTemplates.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <LocalShippingIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 3 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>No Shipping Templates</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Create your first template to define countries you ship to and delivery options</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenTemplateModal} sx={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', textTransform: 'none' }}>
                Create Template
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {shippingTemplates.map(template => (
                <Paper
                  key={template.profileId}
                  sx={{
                    p: 2.5, bgcolor: 'rgba(255,255,255,0.05)',
                    border: (template.isDefault === true || template.isDefault === 1) ? '2px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{template.profileName}</Typography>
                        {(template.isDefault === true || template.isDefault === 1) && (
                          <Chip label="Default" size="small" icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                            sx={{ bgcolor: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontWeight: 600 }} />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {template.zones?.length || 0} shipping zones
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewTemplate(template)} sx={{ color: '#60a5fa' }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {template.zones && template.zones.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Shipping Zones:</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {template.zones.map((zone, zoneIndex) => (
                          <Paper key={zoneIndex} sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.2)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <PublicIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{zone.zoneName}</Typography>
                              <Typography variant="caption" color="text.secondary">({zone.countries?.length || 0} countries)</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                              {zone.countries?.slice(0, 5).map((countryObj, idx) => {
                                const code = countryObj.countryCode || countryObj;
                                const country = availableCountries.find(c => c.code === code);
                                return (
                                  <Chip key={idx} label={country?.name || code} size="small"
                                    sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }} />
                                );
                              })}
                              {zone.countries && zone.countries.length > 5 && (
                                <Chip label={`+${zone.countries.length - 5} more`} size="small"
                                  sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary' }} />
                              )}
                            </Box>
                            {zone.methods && zone.methods.length > 0 && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Shipping Methods:</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  {zone.methods.map((method, methodIdx) => (
                                    <Box key={methodIdx} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, bgcolor: 'rgba(139, 92, 246, 0.1)', borderRadius: 1 }}>
                                      <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 600 }}>{method.methodName}</Typography>
                                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        • B${method.basePrice} • {method.minDeliveryDays}-{method.maxDeliveryDays} days{method.trackingAvailable && ' • 📦'}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            )}
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* ============ TEMPLATE DETAIL VIEW MODAL (with Edit/Delete) ============ */}
      <Dialog
        open={templateDetailModalOpen}
        onClose={() => { setTemplateDetailModalOpen(false); setViewingTemplate(null); setEditingZoneId(null); setEditingMethodId(null); }}
        maxWidth="lg" fullWidth
        PaperProps={{ sx: { bgcolor: '#1a1a2e', backgroundImage: 'none', maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoOutlinedIcon />
            <Typography variant="h6">Template Details</Typography>
          </Box>
          <IconButton onClick={() => { setTemplateDetailModalOpen(false); setViewingTemplate(null); setEditingZoneId(null); setEditingMethodId(null); }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {viewingTemplate && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Profile Info */}
              <Paper sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#60a5fa', mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
                  Profile Information
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Profile ID', value: viewingTemplate.profileId },
                    { label: 'Shop Owner ID', value: viewingTemplate.shopOwnerId },
                    { label: 'Profile Name', value: viewingTemplate.profileName },
                  ].map(item => (
                    <Grid item xs={12} sm={6} md={3} key={item.label}>
                      <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                    </Grid>
                  ))}
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip label={viewingTemplate.isDefault === 1 ? 'Default' : 'Non-Default'} size="small"
                        sx={{ height: 22, fontSize: '0.7rem', bgcolor: viewingTemplate.isDefault === 1 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)', color: viewingTemplate.isDefault === 1 ? '#22c55e' : 'text.secondary' }} />
                      <Chip label={viewingTemplate.isActive === 1 ? 'Active' : 'Inactive'} size="small"
                        sx={{ height: 22, fontSize: '0.7rem', bgcolor: viewingTemplate.isActive === 1 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: viewingTemplate.isActive === 1 ? '#22c55e' : '#ef4444' }} />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Zones */}
              {viewingTemplate.zones && viewingTemplate.zones.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Shipping Zones ({viewingTemplate.zones.length})
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {viewingTemplate.zones.map((zone, zoneIdx) => (
                      <Paper key={zone.zoneId || zoneIdx} sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>

                        {/* Zone Header with inline edit */}
                        <Box sx={{ p: 2, bgcolor: 'rgba(59, 130, 246, 0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                              <PublicIcon sx={{ fontSize: 20, color: '#60a5fa' }} />
                              {editingZoneId === zone.zoneId ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                  <TextField
                                    size="small"
                                    value={editingZoneName}
                                    onChange={e => setEditingZoneName(e.target.value)}
                                    sx={{ flex: 1, '& .MuiInputBase-root': { height: 32 } }}
                                    autoFocus
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') handleSaveZoneName(viewingTemplate, zone);
                                      if (e.key === 'Escape') { setEditingZoneId(null); setEditingZoneName(''); }
                                    }}
                                  />
                                  <Button size="small" variant="contained" disabled={isSavingZone}
                                    onClick={() => handleSaveZoneName(viewingTemplate, zone)}
                                    sx={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', textTransform: 'none', minWidth: 60, height: 32 }}>
                                    {isSavingZone ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Save'}
                                  </Button>
                                  <Button size="small" onClick={() => { setEditingZoneId(null); setEditingZoneName(''); }}
                                    sx={{ color: 'text.secondary', textTransform: 'none', height: 32 }}>Cancel</Button>
                                </Box>
                              ) : (
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{zone.zoneName}</Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                              <Chip label={`Zone ID: ${zone.zoneId}`} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary' }} />
                              <Chip label={zone.isActive === 1 ? 'Active' : 'Inactive'} size="small"
                                sx={{ height: 22, fontSize: '0.7rem', bgcolor: zone.isActive === 1 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: zone.isActive === 1 ? '#22c55e' : '#ef4444' }} />
                              {editingZoneId !== zone.zoneId && (
                                <Tooltip title="Edit Zone Name">
                                  <IconButton size="small"
                                    onClick={() => { setEditingZoneId(zone.zoneId); setEditingZoneName(zone.zoneName); }}
                                    sx={{ color: '#60a5fa', p: 0.5 }}>
                                    <EditIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Delete Zone">
                                <IconButton size="small"
                                  onClick={() => handleOpenDeleteConfirm({ type: 'zone', template: viewingTemplate, zone })}
                                  sx={{ color: '#ef4444', p: 0.5 }}>
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ p: 2 }}>
                          {/* Countries Table */}
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.8, display: 'block', mb: 1 }}>
                            Countries ({zone.countries?.length || 0})
                          </Typography>
                          <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.2)', mb: 2.5 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  {['ID', 'Country Code', 'Country Name', 'Zone ID', 'Created At', 'Action'].map(h => (
                                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {zone.countries?.map((countryObj, cIdx) => (
                                  <TableRow key={countryObj.zoneCountryId || cIdx} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                    <TableCell sx={{ fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{countryObj.zoneCountryId}</TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                      <Chip label={countryObj.countryCode} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }} />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{getCountryName(countryObj.countryCode)}</TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{countryObj.zoneId}</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{formatDateTime(countryObj.createdAt)}</TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                      <Tooltip title="Remove Country">
                                        <IconButton size="small"
                                          onClick={() => handleOpenDeleteConfirm({ type: 'country', template: viewingTemplate, zone, country: countryObj })}
                                          sx={{ color: '#ef4444', p: 0.5 }}>
                                          <DeleteIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>

                          {/* Methods Table */}
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.8, display: 'block', mb: 1 }}>
                            Shipping Methods ({zone.methods?.length || 0})
                          </Typography>
                          <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  {['Method ID', 'Name', 'Delivery', 'Base Price', 'Per Kg', 'Free Threshold', 'Carrier', 'Tracking', 'Currency', 'Status', 'Created At', 'Actions'].map(h => (
                                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>{h}</TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {zone.methods?.map((method, mIdx) => (
                                  <TableRow key={method.methodId || mIdx} sx={{ '&:last-child td': { borderBottom: 0 } }}>

                                    {editingMethodId === method.methodId ? (
                                      <>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem' }}>{method.methodId}</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          <FormControl size="small" sx={{ minWidth: 140 }}>
                                            <Select value={editingMethodData.methodName} onChange={e => setEditingMethodData(p => ({ ...p, methodName: e.target.value }))} sx={{ fontSize: '0.8rem' }}>
                                              {['Standard', 'Standard Delivery', 'Express', 'Express Delivery', 'Priority', 'Economy', 'Overnight', 'Two-Day', 'International Standard', 'International Express', 'EU Economy'].map(n => (
                                                <MenuItem key={n} value={n} sx={{ fontSize: '0.8rem' }}>{n}</MenuItem>
                                              ))}
                                            </Select>
                                          </FormControl>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                            <TextField size="small" type="number" value={editingMethodData.minDeliveryDays} onChange={e => setEditingMethodData(p => ({ ...p, minDeliveryDays: e.target.value }))} sx={{ width: 55, '& input': { fontSize: '0.8rem', p: '4px 6px' } }} inputProps={{ min: 1 }} />
                                            <Typography variant="caption">–</Typography>
                                            <TextField size="small" type="number" value={editingMethodData.maxDeliveryDays} onChange={e => setEditingMethodData(p => ({ ...p, maxDeliveryDays: e.target.value }))} sx={{ width: 55, '& input': { fontSize: '0.8rem', p: '4px 6px' } }} inputProps={{ min: 1 }} />
                                          </Box>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          <TextField size="small" type="number" value={editingMethodData.basePrice} onChange={e => setEditingMethodData(p => ({ ...p, basePrice: e.target.value }))} sx={{ width: 70, '& input': { fontSize: '0.8rem', p: '4px 6px' } }} inputProps={{ min: 0, step: 0.01 }} />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          <TextField size="small" type="number" value={editingMethodData.pricePerKg} onChange={e => setEditingMethodData(p => ({ ...p, pricePerKg: e.target.value }))} sx={{ width: 70, '& input': { fontSize: '0.8rem', p: '4px 6px' } }} inputProps={{ min: 0, step: 0.01 }} />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          <TextField size="small" type="number" value={editingMethodData.freeShippingThreshold ?? ''} onChange={e => setEditingMethodData(p => ({ ...p, freeShippingThreshold: e.target.value }))} sx={{ width: 80, '& input': { fontSize: '0.8rem', p: '4px 6px' } }} inputProps={{ min: 0, step: 0.01 }} placeholder="—" />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          <TextField size="small" value={editingMethodData.carrier ?? ''} onChange={e => setEditingMethodData(p => ({ ...p, carrier: e.target.value }))} sx={{ width: 90, '& input': { fontSize: '0.8rem', p: '4px 6px' } }} placeholder="e.g. FedEx" />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          <Switch size="small" checked={!!editingMethodData.trackingAvailable} onChange={e => setEditingMethodData(p => ({ ...p, trackingAvailable: e.target.checked }))} />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem' }}>{method.currency || '—'}</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          <Chip label={method.isActive === 1 ? 'Active' : 'Inactive'} size="small"
                                            sx={{ height: 22, fontSize: '0.7rem', bgcolor: method.isActive === 1 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: method.isActive === 1 ? '#22c55e' : '#ef4444' }} />
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>{formatDateTime(method.createdAt)}</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="Save Changes">
                                              <IconButton size="small" disabled={isSavingMethod}
                                                onClick={() => handleSaveMethod(viewingTemplate, zone)}
                                                sx={{ color: '#22c55e', p: 0.5 }}>
                                                {isSavingMethod ? <CircularProgress size={14} /> : <CheckCircleIcon sx={{ fontSize: 18 }} />}
                                              </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Cancel">
                                              <IconButton size="small" onClick={() => { setEditingMethodId(null); setEditingMethodData(null); }} sx={{ color: 'text.secondary', p: 0.5 }}>
                                                <CloseIcon sx={{ fontSize: 18 }} />
                                              </IconButton>
                                            </Tooltip>
                                          </Box>
                                        </TableCell>
                                      </>
                                    ) : (
                                      <>
                                        <TableCell sx={{ fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{method.methodId}</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{method.methodName}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{method.minDeliveryDays}–{method.maxDeliveryDays} days</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#22c55e' }}>${method.basePrice?.toFixed(2)}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>${method.pricePerKg?.toFixed(2)}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          {method.freeShippingThreshold
                                            ? <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#facc15' }}>${method.freeShippingThreshold?.toFixed(2)}</Typography>
                                            : <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>—</Typography>}
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          {method.carrier
                                            ? <Chip label={method.carrier} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }} />
                                            : <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>—</Typography>}
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          <Chip label={method.trackingAvailable === 1 ? 'Yes' : 'No'} size="small"
                                            sx={{ height: 22, fontSize: '0.7rem', bgcolor: method.trackingAvailable === 1 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.05)', color: method.trackingAvailable === 1 ? '#22c55e' : 'text.secondary' }} />
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{method.currency || '—'}</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          <Chip label={method.isActive === 1 ? 'Active' : 'Inactive'} size="small"
                                            sx={{ height: 22, fontSize: '0.7rem', bgcolor: method.isActive === 1 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: method.isActive === 1 ? '#22c55e' : '#ef4444' }} />
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>{formatDateTime(method.createdAt)}</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="Edit Method">
                                              <IconButton size="small"
                                                onClick={() => { setEditingMethodId(method.methodId); setEditingMethodData({ ...method }); }}
                                                sx={{ color: '#60a5fa', p: 0.5 }}>
                                                <EditIcon sx={{ fontSize: 16 }} />
                                              </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Method">
                                              <IconButton size="small"
                                                onClick={() => handleOpenDeleteConfirm({ type: 'method', template: viewingTemplate, zone, method })}
                                                sx={{ color: '#ef4444', p: 0.5 }}>
                                                <DeleteIcon sx={{ fontSize: 16 }} />
                                              </IconButton>
                                            </Tooltip>
                                          </Box>
                                        </TableCell>
                                      </>
                                    )}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)', justifyContent: 'flex-end' }}>
          <Button onClick={() => { setTemplateDetailModalOpen(false); setViewingTemplate(null); setEditingZoneId(null); setEditingMethodId(null); }}
            sx={{ color: 'text.secondary', textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============ DELETE CONFIRMATION DIALOG ============ */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => { if (!isDeleting) { setDeleteConfirmOpen(false); setDeleteTarget(null); } }}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#1a1a2e', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteIcon sx={{ color: '#ef4444' }} />
          <Typography variant="h6">Confirm Delete</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            {getDeleteMessage()}
          </Typography>
          <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 1.5 }}>
            ⚠️ This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={() => { setDeleteConfirmOpen(false); setDeleteTarget(null); }} disabled={isDeleting}
            sx={{ color: 'text.secondary', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirmDelete} disabled={isDeleting}
            sx={{ bgcolor: '#ef4444', textTransform: 'none', '&:hover': { bgcolor: '#dc2626' }, '&:disabled': { bgcolor: 'rgba(239,68,68,0.4)' } }}>
            {isDeleting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============ TEMPLATE FORM MODAL (Create) ============ */}
      <Dialog
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        maxWidth="md" fullWidth
        PaperProps={{ sx: { bgcolor: '#1a1a2e', backgroundImage: 'none', maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShippingIcon />
            <Typography variant="h6">Create Shipping Template</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Template Name" fullWidth value={templateFormData.profileName}
              onChange={e => setTemplateFormData(prev => ({ ...prev, profileName: e.target.value }))}
              placeholder="e.g., Global Standard Shipping" required
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2">Set as default template</Typography>
                <Typography variant="caption" color="text.secondary">This template will be automatically assigned to new products</Typography>
              </Box>
              <Switch checked={templateFormData.isDefault} onChange={e => setTemplateFormData(prev => ({ ...prev, isDefault: e.target.checked }))} />
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Shipping Zones ({templateFormData.zones.length})</Typography>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleOpenZoneModal} sx={{ textTransform: 'none' }}>Add Zone</Button>
              </Box>
              {templateFormData.zones.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <PublicIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No zones added yet. Add your first shipping zone to define countries and delivery methods.</Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {templateFormData.zones.map((zone, zoneIndex) => (
                    <Paper key={zoneIndex} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PublicIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{zone.zoneName}</Typography>
                            <Typography variant="caption" color="text.secondary">({zone.countries.length} countries)</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                            {zone.countries.slice(0, 5).map((country, idx) => (
                              <Chip key={idx} label={country.name} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }} />
                            ))}
                            {zone.countries.length > 5 && <Chip label={`+${zone.countries.length - 5} more`} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary' }} />}
                          </Box>
                          <Typography variant="caption" color="text.secondary">{zone.methods.length} shipping method{zone.methods.length !== 1 ? 's' : ''}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleEditZone(zoneIndex)} sx={{ color: 'primary.main' }}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" onClick={() => handleDeleteZone(zoneIndex)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={() => { setTemplateModalOpen(false); resetTemplateForm(); }} sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained" onClick={saveShippingTemplate}
            disabled={!templateFormData.profileName.trim() || templateFormData.zones.length === 0 || isSavingTemplate}
            sx={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', textTransform: 'none', '&:hover': { background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' } }}
          >
            {isSavingTemplate ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Create Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============ ZONE FORM MODAL ============ */}
      <Dialog open={zoneModalOpen} onClose={() => setZoneModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#1a1a2e', backgroundImage: 'none', maxHeight: '90vh' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PublicIcon />
            <Typography variant="h6">{currentZoneIndex !== null ? 'Edit' : 'Add'} Shipping Zone</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Zone Name" fullWidth value={currentZone.zoneName} onChange={e => setCurrentZone(prev => ({ ...prev, zoneName: e.target.value }))} placeholder="e.g., India Zone, USA & Canada Zone" required />
            <Autocomplete
              multiple options={availableCountries} getOptionLabel={o => o.name} value={currentZone.countries}
              onChange={(e, newValue) => setCurrentZone(prev => ({ ...prev, countries: newValue }))}
              renderInput={params => <TextField {...params} label="Countries" placeholder="Select countries for this zone" helperText={`${currentZone.countries.length} countries selected`} />}
              renderOption={(props, option) => { const { key, ...rest } = props; return <Box component="li" key={key} {...rest}>{option.name}</Box>; }}
              loading={isLoadingCountries}
            />
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Shipping Methods ({currentZone.methods.length})</Typography>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleOpenMethodModal} sx={{ textTransform: 'none' }}>Add Method</Button>
              </Box>
              {currentZone.methods.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <LocalShippingIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No shipping methods added yet. Add at least one shipping method.</Typography>
                </Paper>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Method', 'Delivery Time', 'Base Price', 'Tracking', 'Actions'].map(h => <TableCell key={h}>{h}</TableCell>)}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentZone.methods.map((method, methodIndex) => (
                      <TableRow key={methodIndex}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{method.methodName}</Typography>
                          {method.carrier && <Typography variant="caption" color="text.secondary">via {method.carrier}</Typography>}
                        </TableCell>
                        <TableCell><Typography variant="body2">{method.minDeliveryDays}-{method.maxDeliveryDays} days</Typography></TableCell>
                        <TableCell>
                          <Typography variant="body2">B${method.basePrice}</Typography>
                          {method.freeShippingThreshold && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Free over B${method.freeShippingThreshold}</Typography>}
                        </TableCell>
                        <TableCell>
                          <Chip label={method.trackingAvailable ? 'Yes' : 'No'} size="small"
                            sx={{ height: 22, fontSize: '0.7rem', bgcolor: method.trackingAvailable ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)', color: method.trackingAvailable ? '#22c55e' : 'text.secondary' }} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => handleEditMethod(methodIndex)} sx={{ color: 'primary.main' }}><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" onClick={() => handleDeleteMethod(methodIndex)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={() => { setZoneModalOpen(false); resetZoneForm(); }} sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddZone}
            disabled={!currentZone.zoneName.trim() || currentZone.countries.length === 0 || currentZone.methods.length === 0}
            sx={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', textTransform: 'none', '&:hover': { background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' } }}>
            {currentZoneIndex !== null ? 'Update' : 'Add'} Zone
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============ METHOD FORM MODAL ============ */}
      <Dialog open={methodModalOpen} onClose={() => setMethodModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1a1a2e', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShippingIcon />
            <Typography variant="h6">{currentMethodIndex !== null ? 'Edit' : 'Add'} Shipping Method</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth>
              <InputLabel>Method Name</InputLabel>
              <Select value={currentMethod.methodName} onChange={e => setCurrentMethod(prev => ({ ...prev, methodName: e.target.value }))} label="Method Name">
                {['Standard', 'Standard Delivery', 'Express', 'Express Delivery', 'Priority', 'Economy', 'Overnight', 'Two-Day', 'International Standard', 'International Express', 'EU Economy'].map(n => (
                  <MenuItem key={n} value={n}>{n}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Min Delivery Days" type="number" fullWidth value={currentMethod.minDeliveryDays} onChange={e => setCurrentMethod(prev => ({ ...prev, minDeliveryDays: parseInt(e.target.value) || 0 }))} inputProps={{ min: 1 }} required />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Max Delivery Days" type="number" fullWidth value={currentMethod.maxDeliveryDays} onChange={e => setCurrentMethod(prev => ({ ...prev, maxDeliveryDays: parseInt(e.target.value) || 0 }))} inputProps={{ min: 1 }} required />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Base Price (B$)" type="number" fullWidth value={currentMethod.basePrice} onChange={e => setCurrentMethod(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))} inputProps={{ min: 0, step: 0.01 }} required />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Price per kg (B$)" type="number" fullWidth value={currentMethod.pricePerKg} onChange={e => setCurrentMethod(prev => ({ ...prev, pricePerKg: parseFloat(e.target.value) || 0 }))} inputProps={{ min: 0, step: 0.01 }} />
              </Grid>
            </Grid>
            <TextField label="Free Shipping Threshold (B$)" type="number" fullWidth value={currentMethod.freeShippingThreshold} onChange={e => setCurrentMethod(prev => ({ ...prev, freeShippingThreshold: e.target.value }))} inputProps={{ min: 0, step: 0.01 }} helperText="Orders above this amount get free shipping (leave empty for no free shipping)" />
            <TextField label="Carrier" fullWidth value={currentMethod.carrier} onChange={e => setCurrentMethod(prev => ({ ...prev, carrier: e.target.value }))} placeholder="e.g., FedEx, UPS, DHL, Delhivery, BlueDart" />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2">Tracking Available</Typography>
                <Typography variant="caption" color="text.secondary">Enable if this shipping method provides package tracking</Typography>
              </Box>
              <Switch checked={currentMethod.trackingAvailable} onChange={e => setCurrentMethod(prev => ({ ...prev, trackingAvailable: e.target.checked }))} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={() => { setMethodModalOpen(false); resetMethodForm(); }} sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddMethod}
            sx={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', textTransform: 'none', '&:hover': { background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' } }}>
            {currentMethodIndex !== null ? 'Update' : 'Add'} Method
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shop Review Modal */}
      <Dialog open={reviewModalOpen} onClose={handleCloseReviewModal} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1a1a2e', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Request Shop Review</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <FormControl size="small" fullWidth error={!!reviewErrors.reviewType}>
              <InputLabel>Review Type</InputLabel>
              <Select value={reviewData.reviewType} onChange={handleReviewDataChange('reviewType')} label="Review Type">
                <MenuItem value="appeal">Appeal</MenuItem>
                <MenuItem value="rereview">Re-review</MenuItem>
              </Select>
              {reviewErrors.reviewType && <FormHelperText>{reviewErrors.reviewType}</FormHelperText>}
            </FormControl>
            <TextField label="Message" fullWidth multiline rows={4} value={reviewData.message} onChange={handleReviewDataChange('message')}
              placeholder="Describe the reason for your review request (minimum 20 characters)..." size="small"
              error={!!reviewErrors.message} helperText={reviewErrors.message || `${reviewData.message.length}/1000 characters`} required />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={handleCloseReviewModal} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleReviewSubmit} disabled={reviewLoading}
            sx={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', '&:hover': { background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' } }}>
            {reviewLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restricted Products Modal */}
      <Dialog open={restrictedProductsModalOpen} onClose={() => setRestrictedProductsModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#1a1a2e', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Restricted Products List</DialogTitle>
        <DialogContent sx={{ mt: 2, maxHeight: '60vh' }}>
          {restrictedProductsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : restrictedProducts.length === 0 ? (
            <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>No restricted products found.</Typography>
          ) : (
            <List sx={{ pt: 1 }}>
              {restrictedProducts.map(product => {
                const lastUpdated = product.updatedAt || product.createdAt;
                const lastUpdatedDate = lastUpdated ? new Date(lastUpdated) : null;
                return (
                  <Box key={product.id} sx={{ mb: 2 }}>
                    <ListItem
                      sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, mb: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleToggleCategory(product.id)} sx={{ color: 'text.secondary' }}>
                          {expandedCategories[product.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{product.categoryName}</Typography>}
                        secondary={<Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>Status: {product.isActive === 1 ? 'Active' : 'Inactive'}</Typography>}
                      />
                    </ListItem>
                    <Collapse in={expandedCategories[product.id]}>
                      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1, mt: -1, mb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{product.description}</Typography>
                        {lastUpdatedDate && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>Last updated: {lastUpdatedDate.toLocaleDateString()}</Typography>}
                      </Box>
                    </Collapse>
                  </Box>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={() => setRestrictedProductsModalOpen(false)} sx={{ color: 'text.secondary' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}