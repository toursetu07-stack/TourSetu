/* TourSetu responsive dashboard transition and accessible mobile navigation. */
(function () {
  'use strict';
  const configs = [
    { root: '.toursetu-agency-dashboard > .agency-sidebar', nav: 'nav', label: 'Dashboard menu' },
    { root: '.hotel-dashboard-shell > div:first-child', nav: 'nav', label: 'Hotel menu' },
    { root: '.driver-app .sidebar', nav: '.side-nav', label: 'Driver menu' }
  ];

  function syncDashboardWidth() {
    const app = document.getElementById('app');
    if (!app) return;
    const authVisible = Boolean(app.querySelector('#loginForm, #registerForm, #auth-section form, .auth-card'));
    const dashboardVisible = app.children.length > 0 && !authVisible;
    document.body.classList.toggle('ts-dashboard-active', dashboardVisible);
    app.classList.toggle('ts-dashboard-active', dashboardVisible);
    if (dashboardVisible && app.firstElementChild) {
      app.firstElementChild.setAttribute('data-ts-dashboard-root', '');
    } else if (app.firstElementChild) {
      app.firstElementChild.removeAttribute('data-ts-dashboard-root');
    }
  }

  function install(rootSelector, navSelector, label) {
    document.querySelectorAll(rootSelector).forEach((sidebar) => {
      const nav = sidebar.querySelector(navSelector);
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
    syncDashboardWidth();
    configs.forEach((config) => install(config.root, config.nav, config.label));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
  else scan();

  const observer = new MutationObserver(scan);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('pageshow', scan);
})();
