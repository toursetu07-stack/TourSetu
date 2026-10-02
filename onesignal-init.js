/* TourSetu OneSignal v16 bootstrap.
 *
 * Keep third-party SDK initialization outside HTML so CSP can forbid
 * inline script execution. Identity is attached by onesignal-auth-fix.js
 * only after initialization completes.
 */
(function () {
  'use strict';

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function (OneSignal) {
    try {
      await OneSignal.init({
        appId: "1d58b571-868b-4b5b-b370-cd417cac6c28",
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath:
          (location.pathname.startsWith("/TourSetu/") ? "/TourSetu/" : "/") +
          "OneSignalSDKWorker.js",
        serviceWorkerParam: {
          scope: location.pathname.startsWith("/TourSetu/") ? "/TourSetu/" : "/"
        },
        notifyButton: { enable: true }
      });

      window.__toursetuOneSignalReady = true;
      window.dispatchEvent(new Event('toursetu-onesignal-ready'));
    } catch (error) {
      window.__toursetuOneSignalReady = false;
      console.warn(
        '[OneSignal] initialization skipped:',
        error && error.message ? error.message : error
      );
    }
  });
})();
