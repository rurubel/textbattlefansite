/**
 * Entry point - 텍스트배틀 팬사이트
 */
import { initRouter, navigate } from './router.js';
import { initUI } from './ui.js';

function init() {
  const navButtons = document.querySelectorAll('.nav-btn');
  initRouter(navButtons, (section) => {
    // Optional: scroll to top or handle section-specific init
  });
  initUI();

  // Default to home
  const hash = window.location.hash.slice(1);
  if (hash && document.getElementById(hash)) {
    navigate(hash);
  } else {
    navigate('home');
  }
}

document.addEventListener('DOMContentLoaded', init);
