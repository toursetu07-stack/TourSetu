/* TourSetu frontend security helpers (Phase 1)
 *
 * Keep plain text as text. Only use setTrustedHTML for application-owned
 * rich markup that genuinely needs HTML parsing; it sanitizes through the
 * maintained DOMPurify library loaded by index.html.
 */
(function () {
  'use strict';

  function requireSanitizer() {
    if (!window.DOMPurify || typeof window.DOMPurify.sanitize !== 'function') {
      throw new Error('DOMPurify is unavailable; refusing to render rich HTML.');
    }
    return window.DOMPurify;
  }

  window.TourSetuDOM = Object.freeze({
    setText(element, value) {
      if (!element) return;
      element.textContent = value == null ? '' : String(value);
    },

    appendText(parent, value, tagName) {
      if (!parent) return null;
      const node = document.createElement(tagName || 'span');
      node.textContent = value == null ? '' : String(value);
      parent.appendChild(node);
      return node;
    },

    setTrustedHTML(element, html) {
      if (!element) return;
      const clean = requireSanitizer().sanitize(String(html ?? ''), {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
        FORBID_ATTR: ['srcdoc']
      });
      element.innerHTML = clean;
    },

    escapeAttribute(value) {
      const node = document.createElement('div');
      node.textContent = value == null ? '' : String(value);
      return node.textContent.replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[ch]);
    }
  });

  // Static page controls: no inline onclick/onchange handlers.
  window.addEventListener('DOMContentLoaded', function () {
    const role = document.getElementById('role');
    if (role) role.addEventListener('change', function () {
      if (typeof window.toggleBusinessFields === 'function') window.toggleBusinessFields();
    });

    const authButton = document.getElementById('auth-btn');
    if (authButton) authButton.addEventListener('click', function () {
      if (typeof window.handleAuth === 'function') window.handleAuth();
    });

    const toggleModeLink = document.getElementById('toggle-mode-link');
    if (toggleModeLink) toggleModeLink.addEventListener('click', function (event) {
      event.preventDefault();
      if (typeof window.toggleMode === 'function') window.toggleMode();
    });

    const ownerRefresh = document.getElementById('owner-refresh-btn');
    if (ownerRefresh) ownerRefresh.addEventListener('click', function () {
      if (typeof window.fetchAndRenderOwnerRequests === 'function') {
        window.fetchAndRenderOwnerRequests(window.currentHotelId);
      }
    });
  });
})();
