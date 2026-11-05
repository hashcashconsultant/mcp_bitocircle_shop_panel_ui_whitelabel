export const mockProducts = [
  {
    id: '1',
    name: 'Premium T-Shirt',
    price: 34.99,
    comparePrice: 49.99,
    type: 'physical',
    status: 'active',
    stock: 'instock',
    quantity: 24,
    variants: 'Sizes: S, M, L, XL • Colors: Black, White, Navy',
    icon: '👕',
  },
  {
    id: '2',
    name: 'Digital Art Pack',
    price: 29.99,
    type: 'digital',
    status: 'active',
    stock: 'unlimited',
    variants: 'Format: PNG, PSD',
    icon: '🎨',
  },
  {
    id: '3',
    name: 'Signature Sneakers',
    price: 149.99,
    comparePrice: 199.99,
    type: 'physical',
    status: 'active',
    stock: 'lowstock',
    quantity: 3,
    variants: 'Sizes: 7, 8, 9, 10, 11',
    icon: '👟',
  },
  {
    id: '4',
    name: 'Exclusive Track',
    price: 9.99,
    type: 'digital',
    status: 'hidden',
    stock: 'unlimited',
    variants: 'Format: MP3, WAV',
    icon: '🎵',
  },
  {
    id: '5',
    name: 'Phone Case',
    price: 24.99,
    type: 'physical',
    status: 'active',
    stock: 'outstock',
    quantity: 0,
    variants: 'Models: iPhone 14, 15 • Colors: Clear, Black',
    icon: '📱',
  },
  {
    id: '6',
    name: 'Mystery Box',
    price: 149.99,
    type: 'physical',
    status: 'active',
    stock: 'instock',
    quantity: 10,
    icon: '🎁',
  },
];

export const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-2847',
    buyer: {
      name: 'John Doe',
      handle: '@johndoe',
      initials: 'JD',
      avatarColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    date: 'Nov 11, 2:30 PM',
    total: 89.99,
    fulfillmentStatus: 'pending',
    payoutStatus: 'held',
    items: [
      { productName: 'Premium T-Shirt', variant: 'Size: L, Color: Black', quantity: 2, price: 69.98 },
    ],
    shippingAddress: {
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    },
  },
  {
    id: '2',
    orderNumber: 'ORD-2846',
    buyer: {
      name: 'Sarah K',
      handle: '@sarahk',
      initials: 'SK',
      avatarColor: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
    },
    date: 'Nov 11, 1:15 PM',
    total: 129.50,
    fulfillmentStatus: 'shipped',
    payoutStatus: 'released',
    items: [
      { productName: 'Signature Sneakers', variant: 'Size: 9', quantity: 1, price: 129.50 },
    ],
  },
  {
    id: '3',
    orderNumber: 'ORD-2845',
    buyer: {
      name: 'Mike Ro',
      handle: '@mikero',
      initials: 'MR',
      avatarColor: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    },
    date: 'Nov 11, 11:45 AM',
    total: 45.00,
    fulfillmentStatus: 'pending',
    payoutStatus: 'held',
    items: [
      { productName: 'Digital Art Pack', quantity: 1, price: 29.99 },
      { productName: 'Exclusive Track', quantity: 1, price: 9.99 },
    ],
  },
  {
    id: '4',
    orderNumber: 'ORD-2844',
    buyer: {
      name: 'Alex Chen',
      handle: '@alexchen',
      initials: 'AC',
      avatarColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    date: 'Nov 10, 9:30 PM',
    total: 199.99,
    fulfillmentStatus: 'shipped',
    payoutStatus: 'released',
    items: [
      { productName: 'Mystery Box', quantity: 1, price: 149.99 },
      { productName: 'Premium T-Shirt', variant: 'Size: M, Color: White', quantity: 1, price: 34.99 },
    ],
  },
];

export const mockCollections = [
  { id: '1', name: 'Featured', productCount: 6, isVisible: true, isDefault: true },
  { id: '2', name: 'New Arrivals', productCount: 3, isVisible: true },
  { id: '3', name: 'Merch', productCount: 8, isVisible: true },
  { id: '4', name: 'Digital Products', productCount: 4, isVisible: false },
  { id: '5', name: 'Limited Edition', productCount: 2, isVisible: true },
];

export const mockContentItems = [
  {
    id: '1',
    type: 'reels',
    date: 'Nov 10, 2025',
    taggedProducts: ['Premium T-Shirt', 'Signature Sneakers'],
    performance: { taps: 1200, views: 856, sales: 12 },
    icon: '🎬',
  },
  {
    id: '2',
    type: 'posts',
    date: 'Nov 9, 2025',
    taggedProducts: ['Digital Art Pack'],
    performance: { taps: 892, views: 654, sales: 8 },
    icon: '📸',
  },
  {
    id: '3',
    type: 'stories',
    date: 'Nov 8, 2025',
    taggedProducts: ['Mystery Box', 'Phone Case', 'Exclusive Track'],
    performance: { taps: 2100, views: 1800, sales: 23 },
    icon: '📱',
  },
];

export const todayMetrics = [
  { label: 'Views', value: '2,847', change: 12, isPositive: true },
  { label: 'Cart Adds', value: '156', change: 8, isPositive: true },
  { label: 'Sales', value: '43', change: 3, isPositive: false },
  { label: 'Conversion', value: '5.4%', change: 0.2, isPositive: true },
];

export const analyticsKPIs = [
  { label: 'Shop Visits', value: '42.8K', change: 18.2, isPositive: true },
  { label: 'Product Views', value: '128.4K', change: 24.5, isPositive: true },
  { label: 'Cart Adds', value: '3,847', change: 12.8, isPositive: true },
  { label: 'Purchases', value: '847', change: 3.2, isPositive: false },
  { label: 'Revenue', value: 'B$42,847', change: 8.9, isPositive: true },
];

export const topProducts = [
  { name: 'Premium T-Shirt', revenue: 12450 },
  { name: 'Mystery Box', revenue: 8995 },
  { name: 'Signature Sneakers', revenue: 6298 },
  { name: 'Digital Art Pack', revenue: 5697 },
];

export const trafficSources = [
  { name: 'Tagged Reels', percentage: 45 },
  { name: 'Profile Shop Button', percentage: 32 },
  { name: 'Tagged Posts', percentage: 18 },
  { name: 'Direct Link', percentage: 5 },
];

export const funnelSteps = [
  { label: 'Visits', value: 42800, percentage: '100%', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', width: 100 },
  { label: 'Product Views', value: 28400, percentage: '66.4%', color: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', width: 85 },
  { label: 'Add Cart', value: 3847, percentage: '13.5%', color: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', width: 55 },
  { label: 'Purchases', value: 847, percentage: '22%', color: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)', width: 30 },
];

export const restrictedProducts = [
  { title: 'Weapons & Dangerous Items', description: 'Firearms, explosives, knives, or any item designed to cause harm' },
  { title: 'Illegal or Regulated Substances', description: 'Drugs, alcohol, tobacco, or prescription medications' },
  { title: 'Counterfeit Items', description: 'Fake branded goods or unauthorized replicas' },
  { title: 'Adult Content', description: 'Explicit or adult-oriented products' },
  { title: 'Hate Speech or Offensive Material', description: 'Items promoting discrimination or violence' },
];

export const tips = [
  { text: 'Tag products in your Reels to increase sales by up to 2.4x', color: '#1e40af' },
  { text: 'Products with 3+ images convert 40% better', color: '#22c55e' },
  { text: 'All payments are received in BitoDollars (B$)', color: '#8b5cf6' },
];
