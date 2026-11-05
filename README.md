# White-label

This is the white-label copy of the Creator Shop Panel (sample brand **Circle**). It is served at
`<your domain>/merchandise` (for example https://circle.paybito.com/merchandise), next to your
white-label community app on the SAME domain.

- **Sign-in is shared.** The panel reads the community app's sign-in from localStorage on that domain
  (`access_token_us`, `shopOwnerId`, `uuid`, `userId`, `financeHubUuid`, `brokerId`). When no shop or
  user id is found, the visitor is sent to the community sign-in page (`/login`); the panel never falls
  back to another user's id.
- **Brand it in one place:** edit `src/config/whitelabel.js` (brand name, product name, description,
  support email, community links, sign-in path, logo, font, main colours).
- **Replace the images** in `public/img/`: `logo.png` (sidebar logo) and `favicon-96x96.png` (browser icon).
- **Do not change the service URLs** (MonetizeService and BrokerAdminApi on institutional-bo.paybito.com,
  the PayBito countries list and the PayBito support portal). The backend recognises your site from the
  browser's Origin, so your shop data stays on your own platform.
- **Deploy:** a normal Next.js build (`npm ci && npm run build`, then `npm start`, port 3055) with
  `basePath: '/merchandise'` and `trailingSlash: true` (see `next.config.js`). Route `/merchandise`
  on your domain to this app.

---

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
