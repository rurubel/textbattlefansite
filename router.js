/**
 * SPA-style router - no page reload
 */
const sections = [
  'home',
  'probability',
  'efficiency',
  'speed',
  'position-test',
  'card-simulator',
  'characters',
  'leveling',
  'guides',
];

export function initRouter(navButtons, onNavigate) {
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      if (section) navigate(section);
      if (onNavigate) onNavigate(section);
    });
  });
}

export function navigate(sectionId) {
  document.querySelectorAll('.section').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach((el) => el.classList.remove('active'));

  const section = document.getElementById(sectionId);
  const btn = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);

  if (section) section.classList.add('active');
  if (btn) btn.classList.add('active');

  document.querySelector('.nav')?.classList.remove('open');
}
