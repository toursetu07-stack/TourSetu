/* =========================================
   TourSetu Hotel Partner Privacy Policy
   Mandatory acceptance after Hotel Partner Terms
   ========================================= */
(function () {
    'use strict';

    const HOTEL_PRIVACY_VERSION = '2026-10-02-v1';

    function hotelPartnerPrivacyPolicyHtml() {
        return `
            <h2>🔒 TourSetu Hotel Partner Privacy Policy</h2>
            <h3>Property & Identity Verification Data</h3>
            <p>We collect hotel ownership proofs, UTDB registration certificates, trade licenses, property addresses, and contact manager details to verify property legitimacy.</p>
            <h3>1. Property Media & Location Coordinates</h3>
            <p>Uploaded room photos, amenity profiles, and exact GPS coordinates are publicly displayed on the TourSetu customer app to facilitate bookings and location navigation.</p>
            <h3>2. B2B Commercial Confidentiality</h3>
            <p>Contracted B2B room rates and seasonal tariff agreements shared with TourSetu are kept strictly confidential and will not be disclosed to competing hotel properties.</p>
            <h3>3. Guest Check-In Data Sharing</h3>
            <p>Customer booking details (guest name, phone number, arrival date, room count) are shared with the hotel dashboard strictly for check-in management and room allocation.</p>
            <h3>4. Financial Data Security</h3>
            <p>Banking credentials provided for B2B settlements are encrypted and processed solely for automated booking payouts and refund adjustments.</p>
        `;
    }

    async function ensureHotelPrivacyAccepted(user) {
        const app = document.getElementById('app');
        const client = typeof getClient === 'function' ? getClient() : null;
        if (!app || !client || !user?.id) return false;

        const { data, error } = await client
            .from('hotel_privacy_acceptances')
            .select('user_id, policy_version, accepted_at')
            .eq('user_id', user.id)
            .eq('policy_version', HOTEL_PRIVACY_VERSION)
            .maybeSingle();

        if (error) {
            console.error('Hotel privacy policy acceptance check failed:', error);
            app.innerHTML = `
                <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f7f6;padding:20px;box-sizing:border-box;font-family:Inter,sans-serif;">
                    <div style="background:#fff;max-width:560px;width:100%;padding:30px;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.12);text-align:center;">
                        <h2 style="margin-top:0;color:#2d3436;">Unable to load Hotel Partner Privacy Policy</h2>
                        <p style="color:#636e72;line-height:1.6;">Please try again. Your Hotel Dashboard will remain locked until the current Hotel Partner Privacy Policy acceptance is successfully recorded.</p>
                        <button onclick="location.reload()" style="background:#ff9f43;color:#fff;border:0;padding:12px 24px;border-radius:8px;font-weight:800;cursor:pointer;">TRY AGAIN</button>
                        <button onclick="handleLogout()" style="margin-left:8px;background:#2d3436;color:#fff;border:0;padding:12px 24px;border-radius:8px;font-weight:800;cursor:pointer;">LOGOUT</button>
                    </div>
                </div>`;
            return false;
        }

        if (data) return true;

        const existingMenu = document.getElementById('toursetu-utility-menu-root');
        if (existingMenu) existingMenu.remove();

        app.style.maxWidth = '100%';
        app.innerHTML = `
            <div style="min-height:100vh;background:#f4f7f6;padding:28px 18px;box-sizing:border-box;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;">
                <div style="background:#fff;max-width:780px;width:100%;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.15);padding:30px;box-sizing:border-box;">
                    <div style="text-align:center;margin-bottom:20px;">
                        <div style="font-size:38px;">🔒</div>
                        <h2 style="margin:5px 0;color:#2d3436;">TourSetu Hotel Partner Privacy Policy</h2>
                        <p style="margin:0;color:#777;font-size:13px;">Please read and accept this Hotel Partner Privacy Policy after accepting the Hotel Partner Terms & Conditions and before entering your Hotel Dashboard.</p>
                    </div>
                    <div style="max-height:55vh;overflow-y:auto;padding:20px;background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;color:#444;line-height:1.65;font-size:14px;">
                        ${hotelPartnerPrivacyPolicyHtml()}
                    </div>
                    <label style="display:flex;gap:12px;align-items:flex-start;margin-top:20px;padding:15px;background:#fff8e1;border:1px solid #ffd166;border-radius:10px;cursor:pointer;">
                        <input type="checkbox" id="hotel-partner-privacy-checkbox" onchange="window.toggleHotelPrivacyApprovalButton()" style="width:20px;height:20px;margin-top:3px;flex:0 0 auto;cursor:pointer;">
                        <span style="font-weight:800;color:#2d3436;line-height:1.5;">I agree to TourSetu's Hotel Partner Privacy Policy regarding property verification and inventory data.</span>
                    </label>
                    <button id="hotel-partner-privacy-approved-btn" onclick="window.acceptHotelPartnerPrivacy()" disabled style="width:100%;margin-top:14px;background:#27ae60;color:#fff;border:0;padding:14px;border-radius:10px;font-weight:900;font-size:15px;cursor:not-allowed;opacity:.5;">
                        ACCEPT & CONTINUE
                    </button>
                    <p style="margin:12px 0 0;text-align:center;color:#888;font-size:12px;">The Hotel Dashboard will remain locked until you tick the checkbox and click ACCEPT & CONTINUE.</p>
                </div>
            </div>
        `;
        return false;
    }

    window.toggleHotelPrivacyApprovalButton = function () {
        const checkbox = document.getElementById('hotel-partner-privacy-checkbox');
        const button = document.getElementById('hotel-partner-privacy-approved-btn');
        if (!checkbox || !button) return;
        button.disabled = !checkbox.checked;
        button.style.opacity = checkbox.checked ? '1' : '.5';
        button.style.cursor = checkbox.checked ? 'pointer' : 'not-allowed';
    };

    window.acceptHotelPartnerPrivacy = async function () {
        const checkbox = document.getElementById('hotel-partner-privacy-checkbox');
        const button = document.getElementById('hotel-partner-privacy-approved-btn');
        if (!checkbox?.checked) {
            alert('Please tick the Hotel Partner Privacy Policy checkbox before continuing.');
            return;
        }

        const client = typeof getClient === 'function' ? getClient() : null;
        if (!client) {
            alert('Supabase not initialized. Please reload and try again.');
            return;
        }

        const { data: { user } } = await client.auth.getUser();
        if (!user?.id) {
            alert('Your login session has expired. Please login again.');
            return;
        }

        if (button) {
            button.disabled = true;
            button.innerText = 'SAVING...';
            button.style.opacity = '.7';
            button.style.cursor = 'wait';
        }

        const { error } = await client
            .from('hotel_privacy_acceptances')
            .insert({ user_id: user.id, policy_version: HOTEL_PRIVACY_VERSION });

        if (error) {
            console.error('Hotel privacy policy acceptance save failed:', error);
            if (button) {
                button.disabled = false;
                button.innerText = 'ACCEPT & CONTINUE';
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
            }
            alert('Hotel Partner Privacy Policy acceptance save nahi ho saka: ' + error.message);
            return;
        }

        if (button) button.innerText = 'ACCEPTED ✓';

        if (typeof window.__toursetuOriginalHotelDashboard === 'function') {
            await window.__toursetuOriginalHotelDashboard(user);
        } else if (typeof window.initHotelDashboard === 'function') {
            await window.initHotelDashboard(user);
        }
    };

    window.__toursetuEnsureHotelPrivacyAccepted = ensureHotelPrivacyAccepted;
    window.hotelPartnerPrivacyPolicyHtml = hotelPartnerPrivacyPolicyHtml;
    window.HOTEL_PRIVACY_VERSION = HOTEL_PRIVACY_VERSION;

    // Hotel Terms helper wraps initHotelDashboard, so wrap the current function
    // and place Privacy immediately after the existing Hotel Partner Terms gate.
    function installHotelPrivacyGuard() {
        if (window.__toursetuHotelPrivacyWrapped) return;
        if (typeof window.initHotelDashboard !== 'function') {
            setTimeout(installHotelPrivacyGuard, 50);
            return;
        }

        const currentDashboard = window.initHotelDashboard;
        window.__toursetuOriginalHotelPrivacyDashboard = currentDashboard;

        window.initHotelDashboard = async function (user) {
            const activeUser = user || (await window.supabase.auth.getUser()).data.user;
            if (!activeUser?.id) return currentDashboard(user);

            // Enforce the requested order: Hotel Partner Terms first, then Privacy Policy.
            // If Terms are not accepted yet, let the existing Terms guard render its form.
            const client = typeof getClient === 'function' ? getClient() : null;
            if (client) {
                const { data: termsData, error: termsError } = await client
                    .from('hotel_terms_acceptances')
                    .select('user_id, terms_version, accepted_at')
                    .eq('user_id', activeUser.id)
                    .eq('terms_version', '2026-10-02-v1')
                    .maybeSingle();

                if (termsError) {
                    console.error('Hotel terms acceptance pre-check failed:', termsError);
                    return currentDashboard(activeUser);
                }

                if (!termsData) {
                    return currentDashboard(activeUser);
                }
            }

            const accepted = await ensureHotelPrivacyAccepted(activeUser);
            if (!accepted) return;

            return currentDashboard(activeUser);
        };

        window.__toursetuHotelPrivacyWrapped = true;
    }

    // Existing legal-panel Privacy Policy button should show the hotel policy for hotels.
    function installHotelPrivacyLegalPanel() {
        if (window.__toursetuHotelPrivacyLegalWrapped) return;
        if (typeof window.openTourSetuLegalPanel !== 'function') {
            setTimeout(installHotelPrivacyLegalPanel, 50);
            return;
        }

        const currentLegalPanel = window.openTourSetuLegalPanel;
        window.__toursetuOriginalHotelPrivacyLegalPanel = currentLegalPanel;

        window.openTourSetuLegalPanel = function (type) {
            if (type === 'privacy' && window.currentTourSetuUser?.user_metadata?.role === 'hotel') {
                const existing = document.getElementById('toursetu-legal-modal');
                if (existing) existing.remove();

                const modal = document.createElement('div');
                modal.id = 'toursetu-legal-modal';
                modal.style.cssText = 'position:fixed;inset:0;z-index:1000001;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:20px;';
                modal.innerHTML = '<div style="background:white;max-width:650px;width:100%;max-height:85vh;overflow:auto;border-radius:16px;padding:28px;line-height:1.65;color:#444;">' +
                    hotelPartnerPrivacyPolicyHtml() +
                    '<button onclick="document.getElementById(\'toursetu-legal-modal\').remove()" style="display:block;margin:20px auto 0;background:#ff9f43;color:white;padding:11px 25px;border:0;border-radius:8px;cursor:pointer;">CLOSE</button>' +
                    '</div>';
                document.body.appendChild(modal);
                return;
            }
            return currentLegalPanel.call(this, type);
        };

        window.__toursetuHotelPrivacyLegalWrapped = true;
    }

    installHotelPrivacyGuard();
    installHotelPrivacyLegalPanel();
})();
