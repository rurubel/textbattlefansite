/**
 * 국제화: locale 저장, DOM data-i18n, t() 조회
 */
import { MESSAGES } from './siteStrings.js';

const STORAGE_KEY = 'tb_locale';
const SUPPORTED = ['ko', 'en', 'ja'];

let currentLocale =
  typeof localStorage !== 'undefined' && SUPPORTED.includes(localStorage.getItem(STORAGE_KEY))
    ? localStorage.getItem(STORAGE_KEY)
    : 'ko';

function deepGet(obj, path) {
  return path.split('.').reduce((o, k) => (o != null && o[k] !== undefined ? o[k] : undefined), obj);
}

export function getLocale() {
  return currentLocale;
}

function interpolate(str, vars) {
  if (str == null || typeof str !== 'string') return str;
  let s = str;
  Object.entries(vars || {}).forEach(([k, v]) => {
    s = s.split(`{${k}}`).join(String(v));
  });
  return s;
}

/** 점 경로 (예: nav.home, common.opt.atk) */
export function t(path, vars) {
  const pack = MESSAGES[currentLocale] || MESSAGES.ko;
  let val = deepGet(pack, path);
  if (val === undefined) val = deepGet(MESSAGES.ko, path);
  if (val === undefined) return path;
  if (typeof val === 'string') return interpolate(val, vars);
  return val;
}

export function applyDomI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const val = t(key);
    if (typeof val === 'string') el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (!key) return;
    const val = t(key);
    if (typeof val === 'string') el.innerHTML = val;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (!key) return;
    el.setAttribute('aria-label', t(key));
  });
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    const key = el.getAttribute('data-i18n-alt');
    if (!key) return;
    el.setAttribute('alt', t(key));
  });
  document.title = t('meta.title');
}

export function setLocale(lang) {
  currentLocale = SUPPORTED.includes(lang) ? lang : 'ko';
  try {
    localStorage.setItem(STORAGE_KEY, currentLocale);
  } catch (_) {}
  document.documentElement.lang =
    currentLocale === 'ja' ? 'ja' : currentLocale === 'en' ? 'en' : 'ko';
  window.dispatchEvent(new CustomEvent('tb-locale-change', { detail: { locale: currentLocale } }));
}

export function initI18n() {
  const sel = document.getElementById('lang-select');
  if (sel) {
    sel.value = currentLocale;
    sel.addEventListener('change', () => setLocale(sel.value));
  }
  applyDomI18n();
}
