/* Accessible collapsible dashboard navigation for narrow viewports. */
(function () {
  'use strict';
  const configs = [
    { root: '.toursetu-agency-dashboard > .agency-sidebar', nav: 'nav', label: 'Dashboard menu' },
    { root: '.hotel-dashboard-shell > div:first-child', nav: 'nav', label: 'Hotel menu' },
    { root: '.driver-app .sidebar', nav: '.side-nav', label: 'Driver menu' }
  ];
  function install(rootSelector, navSelector, label) {
    document.querySelectorAll(rootSelector).forEach((sidebar) => {
      const nav = sidebar.querySelector(navSelector) || (sidebar.matches('.driver-app .sidebar') ? sidebar.querySelector('.side-nav') : null);
      if (!nav || sidebar.querySelector(':scope > .ts-mobile-nav-toggle')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ts-mobile-nav-toggle';
      button.textContent = '☰  ' + label;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Toggle ' + label.toLowerCase());
      button.addEventListener('click', () => {
        const expanded = sidebar.classList.toggle('ts-mobile-nav-open');
        button.setAttribute('aria-expanded', String(expanded));
      });
      sidebar.insertBefore(button, nav);
    });
  }
  function scan() {
    configs.forEach((config) => install(config.root, config.nav, config.label));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
  else scan();
  const observer = new MutationObserver(scan);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
