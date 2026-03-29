/**
 * Entry point - 텍스트배틀 팬사이트
 */

import { initRouter, navigate } from './router.js';
import { initUI } from './ui.js';

function init() {
  const navButtons = document.querySelectorAll('.nav-btn');

  initRouter(navButtons, (section) => {
    if (typeof gtag === 'function') {
      gtag('event', 'view_section', {
        section_name: section
      });
    }
  });

  initUI();

  const hash = window.location.hash.slice(1);
  const initialSection = (hash && document.getElementById(hash)) ? hash : 'home';

  navigate(initialSection);

  if (typeof gtag === 'function') {
    gtag('event', 'view_section', {
      section_name: initialSection
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
