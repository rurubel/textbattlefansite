/**
 * 테마: 모드(dark/light) + 팔레트(classic/golden/battlefield)
 */
import { t } from './i18n.js';

const MODE_KEY = 'tb_color_mode';
const PALETTE_KEY = 'tb_palette';

const MODES = ['dark', 'light'];
const PALETTES = ['classic', 'golden', 'battlefield'];

function readStored(key, allowed, fallback) {
  try {
    const v = localStorage.getItem(key);
    if (allowed.includes(v)) return v;
  } catch (_) {}
  return fallback;
}

let currentMode = readStored(MODE_KEY, MODES, 'dark');
let currentPalette = readStored(PALETTE_KEY, PALETTES, 'classic');

function applyTheme() {
  const root = document.documentElement;
  root.dataset.mode = currentMode;
  root.dataset.palette = currentPalette;
  root.style.colorScheme = currentMode === 'light' ? 'light' : 'dark';
}

export function getColorMode() {
  return currentMode;
}

export function getPalette() {
  return currentPalette;
}

export function setColorMode(mode) {
  currentMode = MODES.includes(mode) ? mode : 'dark';
  try {
    localStorage.setItem(MODE_KEY, currentMode);
  } catch (_) {}
  applyTheme();
  window.dispatchEvent(
    new CustomEvent('tb-theme-change', {
      detail: { mode: currentMode, palette: currentPalette },
    })
  );
}

export function setPalette(palette) {
  currentPalette = PALETTES.includes(palette) ? palette : 'classic';
  try {
    localStorage.setItem(PALETTE_KEY, currentPalette);
  } catch (_) {}
  applyTheme();
  window.dispatchEvent(
    new CustomEvent('tb-theme-change', {
      detail: { mode: currentMode, palette: currentPalette },
    })
  );
}

export function toggleColorMode() {
  setColorMode(currentMode === 'dark' ? 'light' : 'dark');
}

export function initTheme() {
  applyTheme();

  const modeBtn = document.getElementById('theme-mode-btn');
  const paletteSelect = document.getElementById('theme-palette-select');

  if (modeBtn) {
    modeBtn.addEventListener('click', () => toggleColorMode());
  }
  if (paletteSelect) {
    paletteSelect.value = currentPalette;
    paletteSelect.addEventListener('change', () => setPalette(paletteSelect.value));
  }

  const syncControls = () => {
    if (paletteSelect) paletteSelect.value = currentPalette;
    if (modeBtn) {
      modeBtn.dataset.mode = currentMode;
      modeBtn.setAttribute(
        'aria-label',
        currentMode === 'dark' ? t('theme.toLight') : t('theme.toDark')
      );
    }
  };
  syncControls();
  window.addEventListener('tb-theme-change', syncControls);
  window.addEventListener('tb-locale-change', syncControls);
}
