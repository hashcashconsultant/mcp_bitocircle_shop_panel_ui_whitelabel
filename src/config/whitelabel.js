/**
 * WHITE-LABEL CONTROL PANEL — set your brand in ONE place.
 *
 * This Creator Shop Panel runs next to your white-label community app, on the same domain under
 * /merchandise (for example https://circle.paybito.com/merchandise). It reads the sign-in from that
 * app (access_token_us, shopOwnerId, uuid, userId, financeHubUuid, brokerId in localStorage), so a
 * member who is signed in on your community is signed in here too.
 *
 * THE GOLDEN RULE: change the look, not the wiring. Brand values below are free to change. The service
 * addresses at the end must stay as they are: shops, products and orders live on the PayBito
 * Monetize service, and it keeps them on your own platform because the browser sends your domain
 * with every call.
 *
 * NOTE: this snapshot ships with the sample brand "Circle". Replace every brand value with your own.
 */

export const WHITELABEL = {
  // --- Identity -------------------------------------------------------------
  brandName: 'Circle',
  productName: 'Circle Creator Shop Panel',
  description: 'Circle Creator Shop Panel - Merchandise Management Dashboard',
  // Shown in the Support window and used for its "Email Support" link. Replace with your own address.
  supportEmail: 'support@circle.paybito.com',

  // --- Your community app ---------------------------------------------------
  // The domain your community app runs on. The Shop Panel is served from the same domain.
  siteUrl: 'https://circle.paybito.com',
  // The path this Shop Panel is served from. Keep it in sync with basePath in next.config.js.
  basePath: '/merchandise',
  // Pages of your community app the Shop Panel links to.
  communityLinks: {
    home: '/',
    messages: '/messages',
  },

  // --- Sign-in ---------------------------------------------------------------
  // Members sign in on your community app; this page of it is opened when nobody is signed in.
  signInPath: '/login',

  // --- Look -----------------------------------------------------------------
  // Logo and icons live in public/img/ (logo.png, favicon-96x96.png). Replace those files.
  // The favicon is linked in src/app/layout.jsx as /merchandise/img/favicon-96x96.png.
  logo: '/merchandise/img/logo.png',
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  },
  // Main theme colours, read by src/theme/theme.js (other accents are set in that file).
  colors: {
    primary: { main: '#1e40af', light: '#3b82f6', dark: '#1e3a8a' },
    secondary: { main: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed' },
    background: { default: '#0a0f1c', paper: 'rgba(255, 255, 255, 0.03)' },
  },

  // --- Services (do not change) ---------------------------------------------
  services: {
    monetize: 'https://institutional-bo.paybito.com:8443/MonetizeService',
    brokerAdminApi: 'https://institutional-bo.paybito.com:8443/BrokerAdminApi',
    countries: 'https://accounts.paybito.com/api/home/getExchangeCountries/PAYB18022021121103',
    supportPortal: 'https://support.paybito.com/brokers/autologin',
  },
};

/** A page of the community app this Shop Panel sits next to (same domain, so a plain path). */
export const communityUrl = (path = '/') => path;

/** The community app's sign-in page. */
export const signInUrl = () => communityUrl(WHITELABEL.signInPath);

export default WHITELABEL;
