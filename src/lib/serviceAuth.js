'use client';

import axios from 'axios';

/**
 * Sends the member's sign-in with every call to the PayBito services (MonetizeService, BrokerAdminApi).
 *
 * MonetizeService refuses calls without a sign-in ("Send a sign-in token (Authorization + uuid)"). The
 * community app this panel sits next to (same domain) writes the sign-in cookies, so they are read here and
 * added to every service call that does not already carry a real token. Nothing else about the call changes.
 */
const SERVICES_ORIGIN = 'https://institutional-bo.paybito.com:8443/';

const readCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const readStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

// The sign-in cookie is the member's current sign-in; browser storage can still hold an older, revoked token.
const cookieToken = () => readCookie('paybito_launch_platform_token');

const signIn = () => ({
  token: cookieToken() || readStorage('access_token_us'),
  uuid: readCookie('paybito_launch_platform_uuid') || readStorage('uuid'),
});

// Replace the call's token when the current sign-in differs from it (or it has none).
const shouldReplace = (current) => !usable(current) || (!!cookieToken() && current.trim().replace(/^bearer\s+/i, '') !== cookieToken());

// An existing header counts only when it carries a real token ("bearer null" is sent when storage is empty).
const usable = (value) => !!value && !/^bearer\s*(null|undefined)?\s*$/i.test(String(value).trim());

const isServiceUrl = (url) => typeof url === 'string' && url.startsWith(SERVICES_ORIGIN);

let installed = false;

export function installServiceAuth() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  axios.interceptors.request.use((config) => {
    const url = config.baseURL && !/^https?:/i.test(config.url || '') ? `${config.baseURL}${config.url || ''}` : config.url;
    if (!isServiceUrl(url)) return config;
    const { token, uuid } = signIn();
    config.headers = config.headers || {};
    const current = config.headers.Authorization || config.headers.authorization;
    if (token && shouldReplace(current)) {
      delete config.headers.authorization;
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (uuid && !config.headers.uuid) config.headers.uuid = uuid;
    return config;
  });

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' ? input : input && input.url;
    if (!isServiceUrl(url)) return originalFetch(input, init);
    const { token, uuid } = signIn();
    const headers = new Headers(init.headers || (typeof input !== 'string' && input.headers) || {});
    if (token && shouldReplace(headers.get('Authorization'))) headers.set('Authorization', `Bearer ${token}`);
    if (uuid && !headers.has('uuid')) headers.set('uuid', uuid);
    return originalFetch(input, { ...init, headers });
  };
}

/** The signed-in member's uuid: the one the sign-in token belongs to (the stored uuid can be another account's). */
export const signedInUuid = () => signIn().uuid;

const ME_URL = `${SERVICES_ORIGIN}BitohubService/me`;

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked: the page still works for this visit */
  }
};

/**
 * Who is signed in on this site. The shop panel always works on the signed-in member's own shop, so it asks the
 * community service (same sign-in, same site) for the member's userId and stores it as shopOwnerId before any page
 * loads. Returns { userId } when signed in, { signedOut: true } when there is no valid sign-in, or {} when the
 * check could not run (network); then the last stored id is kept.
 */
export async function resolveSignedInMember() {
  const { token, uuid } = signIn();
  if (!token || !uuid) return { signedOut: true };
  try {
    const response = await fetch(ME_URL, { headers: { Authorization: `Bearer ${token}`, uuid } });
    if (response.status === 401 || response.status === 403) return { signedOut: true };
    if (!response.ok) return {};
    const body = await response.json();
    const id = body && body.data && body.data.userId != null ? String(body.data.userId) : null;
    if (!id) return { signedOut: true };
    writeStorage('shopOwnerId', id);
    writeStorage('childUserId', id);
    return { userId: id };
  } catch {
    return {};
  }
}
