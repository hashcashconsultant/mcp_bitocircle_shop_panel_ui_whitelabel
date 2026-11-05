# BitoCircle Creator Shop Panel

A comprehensive merchandise management dashboard for BitoCircle creators. Built with Next.js 14 and Material UI.

## Features

- **Dashboard**: Overview of shop status, daily metrics, pending orders, and quick actions
- **Products**: Full product management with search, filters, and visibility toggles
- **Collections**: Drag-and-drop collection ordering with visibility controls
- **Orders**: Order management with fulfillment tracking and buyer communication
- **Content & Tags**: Content performance tracking for tagged products
- **Analytics**: KPIs, top products, traffic sources, and conversion funnel
- **Settings**: Shop customization, payouts, shipping, and policy management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Material UI v5
- **State Management**: React Context API
- **Styling**: Material UI + Emotion

## Project Structure

```
src/
├── app/
│   ├── layout.jsx       # Root layout with theme provider
│   └── page.jsx         # Main page component
├── components/
│   ├── analytics/       # Analytics section components
│   ├── collections/     # Collections management components
│   ├── common/          # Reusable UI components
│   ├── content/         # Content & tags components
│   ├── dashboard/       # Dashboard components
│   ├── layout/          # Layout components (TopBar, Sidebar, MainLayout)
│   ├── modals/          # All modal/dialog components
│   ├── orders/          # Orders management components
│   ├── products/        # Products management components
│   └── settings/        # Settings components
├── context/
│   └── AppContext.js    # Global state management
├── data/
│   └── mockData.js      # Mock data for development
├── hooks/               # Custom React hooks
└── theme/
    └── theme.js         # Material UI theme configuration
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Features

### BitoDollar Integration
All shop payments are processed in BitoDollars (B$). Creators receive payments directly to their BitoDollar wallet.

### Product Management
- Physical and digital product support
- Variant management (size, color, custom)
- Inventory tracking with low stock alerts
- Compare-at pricing for sales

### Order Fulfillment
- Order timeline tracking
- Shipping carrier integration
- Buyer communication
- Automatic payout release on delivery

### Analytics
- Real-time shop performance metrics
- Conversion funnel visualization
- Traffic source breakdown
- Top product rankings

## Customization

### Theme
The app uses a dark theme by default. Customize colors in `src/theme/theme.js`.

### Mock Data
Replace mock data in `src/data/mockData.js` with your API integration.

## License

Proprietary - BitoCircle / PayBito
