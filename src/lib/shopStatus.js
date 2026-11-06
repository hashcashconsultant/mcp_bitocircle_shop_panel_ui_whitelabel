'use client';

/**
 * Why products/collections are not allowed yet. The service allows them only after PayBito approves the shop
 * (shop status not IN_REVIEW / INACTIVE / SUSPENDED). A shop that has saved its details is waiting for approval;
 * a shop without saved details still has to finish its setup.
 * Returns 'review' or 'setup'.
 */
export async function shopBlockedReason(baseUrl, shopOwnerId) {
  try {
    const response = await fetch(`${baseUrl}/settings/shopdetails/${shopOwnerId}`);
    const body = await response.json();
    const name = body && body.data && body.data.shopName;
    return name && String(name).trim() ? 'review' : 'setup';
  } catch {
    return 'setup';
  }
}
