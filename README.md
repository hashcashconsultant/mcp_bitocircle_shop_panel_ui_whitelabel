# White-label Merchandise (Creator Shop Panel)

The shop panel for a white-label BitoCircle community. Creators on your community set up their shop, add
physical and digital products, group them into collections, tag them on posts and reels, handle orders and
shipping, and follow their sales. Members can browse a creator's shop, buy, and see their orders. All
payments are in BitoDollars (B$). Shops, products and orders stay on your own community.

It ships with the sample brand **Circle**, live at https://circle.paybito.com/merchandise.

## How it fits with your community app

- It is served from the same domain as your community app, under `/merchandise`
  (for example `https://your-community.com/merchandise/`).
- Members sign in on your community app. When the panel opens it reads that sign-in (the
  `paybito_launch_platform_token` and `paybito_launch_platform_uuid` cookies), asks the service who is
  signed in, and always opens **that member's own shop**. When nobody is signed in it opens your
  community's `/login` page. Shop and product pages for buyers open from links that carry the shop.
- All data comes from the PayBito services (MonetizeService, BitohubService, BrokerAdminApi on
  `institutional-bo.paybito.com`). They recognise your community from the browser's Origin, so shops,
  products and orders are kept per community. Your domain must be verified as a community domain.
- A new shop is reviewed before its products go live: after the creator saves the shop details, products
  can be added once the shop is approved.

## Make it yours

Everything brand-related is in one file: `src/config/whitelabel.js`.

| What | Where |
|---|---|
| Brand name, product name, description, support links | `src/config/whitelabel.js` |
| Links back to your community and the sign-in path | `src/config/whitelabel.js` |
| Font and main colors | `src/config/whitelabel.js` |
| Logo and icon | replace `public/img/logo.png` and `public/img/favicon-96x96.png` |

Change the look, not the wiring: keep the service addresses as they are.

## Run it

```bash
npm ci --legacy-peer-deps
npm run dev                  # http://localhost:3055/merchandise/
npx next build --webpack     # production build
npm start                    # production server on port 3055
```

For local work, sign in on your community app on the same host first, so the sign-in cookies are there.

## Deploy

The app is a Next.js server with `basePath: '/merchandise'` and `trailingSlash: true` (see `next.config.js`).

1. Build as above and run it with `npm start` (port 3055).
2. On your community domain, send **`/merchandise` and everything under it** to that server **with the full
   path unchanged**. Do not strip the `/merchandise` prefix and do not redirect; the app's pages and its
   `/merchandise/_next/...` files both need the prefix.

nginx example, next to your community app:

```nginx
location /merchandise {
    proxy_pass http://127.0.0.1:3055;      # no trailing slash: the path is passed unchanged
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Apache example:

```apache
ProxyPass        /merchandise http://127.0.0.1:3055/merchandise
ProxyPassReverse /merchandise http://127.0.0.1:3055/merchandise
```

If you serve it from another path, change `basePath` in `next.config.js` and in `src/config/whitelabel.js`
to the same value.

## What creators can do

- **Dashboard**: shop status, today's summary, orders that need action, quick actions
- **Products**: physical and digital products, variants, stock, visibility
- **Collections**: group and order products
- **Orders**: fulfilment, shipping updates, refunds
- **Content & Tags**: which posts and reels have products tagged and how they perform
- **Analytics**: top products, traffic and conversion
- **Settings**: shop details, look, shipping templates, payout wallet (B$)

## License

See `LICENSE`.

<!-- sync check 2026-11-12 -->
<!-- sync check 2 -->

<!-- sync test 2026-11-13T12:28:55 -->
<!-- sync test 2026-11-13T13:14:45 -->
<!-- sync test 2026-11-13T14:29:53 -->
