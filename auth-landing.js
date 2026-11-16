/* TourSetu landing-page auth bridge. */
(function () {
    'use strict';
    var handledUserId = '';
    var handling = false;
    var allowedRoles = new Set(['customer', 'agency', 'hotel', 'driver']);
    function getClient() {
        var config = window.__TOURSETU_SUPABASE_CONFIG__ || {};
        if (!window.supabase || !config.url || !config.publishableKey) return null;
        if (!window.__toursetuLandingSupabase) {
            window.__toursetuLandingSupabase = window.supabase.createClient(config.url, config.publishableKey);
        }
        return window.__toursetuLandingSupabase;
    }
    async function routeSession(session) {
        var user = session && session.user;
        if (!user || !user.id || handledUserId === user.id || handling) return;
        handling = true;
        try {
            var client = getClient();
            if (!client) return;
            var pendingRole = '';
            try {
                var startedAt = Number(localStorage.getItem('toursetu_google_signup_started_at') || 0);
                if (startedAt && Date.now() - startedAt <= 30 * 60 * 1000) {
                    pendingRole = String(localStorage.getItem('toursetu_google_signup_role') || '').toLowerCase();
                }
            } catch (storageError) {}
            var profileResult = await client.from('profiles').select('role').eq('id', user.id).maybeSingle();
            var profileRole = !profileResult.error ? String(profileResult.data && profileResult.data.role || '').toLowerCase() : '';
            var metadataRole = String(user.user_metadata && user.user_metadata.role || '').toLowerCase();
            var role = allowedRoles.has(pendingRole) ? pendingRole :
                (allowedRoles.has(profileRole) ? profileRole : (allowedRoles.has(metadataRole) ? metadataRole : 'customer'));
            var profileWrite = await client.from('profiles').upsert({
                id: user.id, email: user.email || null, role: role
            }, { onConflict: 'id' });
            if (profileWrite.error) {
                console.error('TourSetu landing auth profile sync failed:', profileWrite.error);
                return;
            }
            try { localStorage.setItem('toursetu_authenticated_role', role); } catch (storageError) {}
            handledUserId = user.id;
            window.location.replace('/signin.html?auth=complete');
        } catch (error) {
            console.error('TourSetu landing auth redirect failed:', error);
        } finally { handling = false; }
    }
    function start() {
        var client = getClient();
        if (!client) return;
        client.auth.onAuthStateChange(function (event, session) {
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                Promise.resolve().then(function () { return routeSession(session); });
            }
        });
        client.auth.getSession().then(function (result) {
            if (!result.error) return routeSession(result.data && result.data.session);
        }).catch(function (error) { console.warn('Landing session check failed:', error); });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
}());
