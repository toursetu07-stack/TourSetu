/* TourSetu OneSignal v16 identity guard.
 *
 * OneSignal v16 requires user APIs such as login() to run after init().
 * Keep the Supabase user id pending until the SDK reports ready, then
 * serialize/deduplicate login calls so the SDK is never hit concurrently.
 */
(function () {
    'use strict';

    let lastLoggedInExternalId = null;
    let loginInFlight = null;

    window.identifyOneSignalUser = function (userId) {
        if (!userId) return;

        const externalId = String(userId);
        window.__toursetuPendingOneSignalUserId = externalId;

        if (!window.__toursetuOneSignalReady) {
            return;
        }

        if (lastLoggedInExternalId === externalId || loginInFlight) {
            return;
        }

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        loginInFlight = new Promise(function (resolve) {
            window.OneSignalDeferred.push(async function (OneSignal) {
                try {
                    await OneSignal.login(externalId);
                    lastLoggedInExternalId = externalId;
                } catch (error) {
                    console.warn('OneSignal login failed:', error);
                } finally {
                    loginInFlight = null;
                    resolve();
                }
            });
        });
    };

    window.addEventListener('toursetu-onesignal-ready', function () {
        const pendingId = window.__toursetuPendingOneSignalUserId;
        if (pendingId) {
            window.identifyOneSignalUser(pendingId);
        }
    });
})();
