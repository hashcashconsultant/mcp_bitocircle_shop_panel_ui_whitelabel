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

const signIn = () => ({
  token: readCookie('paybito_launch_platform_token') || readStorage('access_token_us'),
  uuid: readCookie('paybito_launch_platform_uuid') || readStorage('uuid'),
});

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
    if (token && !usable(current)) {
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
    if (token && !usable(headers.get('Authorization'))) headers.set('Authorization', `Bearer ${token}`);
    if (uuid && !headers.has('uuid')) headers.set('uuid', uuid);
    return originalFetch(input, { ...init, headers });
  };
}
