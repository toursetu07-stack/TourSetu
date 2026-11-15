/* Agency package form controls: delegated bindings survive dynamic template renders. */
(function () {
  'use strict';

  function onReady() {
    document.addEventListener('click', function (event) {
      const button = event.target.closest('[data-package-action]');
      if (!button) return;

      const action = button.dataset.packageAction;
      if (action === 'save') {
        event.preventDefault();
        if (typeof window.processSave === 'function') {
          window.processSave(button.dataset.packageId || '');
        }
      } else if (action === 'cancel') {
        event.preventDefault();
        if (typeof window.showTab === 'function') window.showTab('packages');
      } else if (action === 'delete') {
        event.preventDefault();
        const packageId = button.dataset.packageId;
        if (packageId && window.confirm('Are you sure you want to delete this package?') &&
            typeof window.deletePackage === 'function') {
          window.deletePackage(packageId);
        }
      }
    });

    document.addEventListener('change', function (event) {
      if (event.target.matches('[data-package-change="state"]') &&
          typeof window.updateCities === 'function') {
        window.updateCities();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  } else {
    onReady();
  }
})();
