/* =========================================
   TourSetu Agency Partner Privacy Policy
   Mandatory acceptance after Partner Terms
   ========================================= */
(function () {
    const AGENCY_PRIVACY_VERSION = '2026-10-02-v1';

    function agencyPartnerPrivacyPolicyHtml() {
        return `
            <h2>🔒 TourSetu Partner Privacy Policy</h2>
            <h3>Business & KYC Document Collection</h3>
            <p>We collect firm registration certificates (UTDB, GST, MSME Udyam), owner Aadhaar/PAN details, bank account credentials, commercial vehicle RCs, and driver licenses solely for platform verification and legally required background checks.</p>
            <h3>1. Document Storage & Confidentiality</h3>
            <p>All uploaded registration and RC documents are stored securely in encrypted cloud storage and accessed exclusively by the TourSetu compliance team for verification purposes.</p>
            <h3>2. Commercial & Pricing Data</h3>
            <p>Operator rate cards, per-kilometer charges, and fleet availability data are used strictly to run the dynamic pricing engine and display listings on the customer marketplace.</p>
            <h3>3. Driver & Fleet Information Sharing</h3>
            <p>Driver names, contact numbers, and vehicle registration numbers will be shared with booked customers to ensure smooth on-ground trip coordination.</p>
            <h3>4. Payout & Financial Records</h3>
            <p>Bank details and payout transactions are recorded and stored in accordance with Indian tax laws (GST/TDS regulations) and financial reporting standards.</p>
        `;
    }

    async function ensureAgencyPrivacyAccepted(user) {
        const app = document.getElementById('app');
        const client = typeof getClient === 'function' ? getClient() : null;
        if (!app || !client || !user?.id) return false;

        const { data, error } = await client
            .from('agency_privacy_acceptances')
            .select('user_id, policy_version, accepted_at')
            .eq('user_id', user.id)
            .eq('policy_version', AGENCY_PRIVACY_VERSION)
            .maybeSingle();

        if (error) {
            console.error('Agency privacy policy acceptance check failed:', error);
            app.innerHTML = `
                <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f7f6;padding:20px;box-sizing:border-box;font-family:Inter,sans-serif;">
                    <div style="background:#fff;max-width:560px;width:100%;padding:30px;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.12);text-align:center;">
                        <h2 style="margin-top:0;color:#2d3436;">Unable to load Partner Privacy Policy</h2>
                        <p style="color:#636e72;line-height:1.6;">Please try again. Your Agency Dashboard will remain locked until the current Partner Privacy Policy acceptance is successfully recorded.</p>
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
                        <h2 style="margin:5px 0;color:#2d3436;">TourSetu Partner Privacy Policy</h2>
                        <p style="margin:0;color:#777;font-size:13px;">Please read and accept this Partner Privacy Policy after accepting the Partner Terms & Conditions and before entering your Agency Dashboard.</p>
                    </div>
                    <div style="max-height:55vh;overflow-y:auto;padding:20px;background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;color:#444;line-height:1.65;font-size:14px;">
                        ${agencyPartnerPrivacyPolicyHtml()}
                    </div>
                    <label style="display:flex;gap:12px;align-items:flex-start;margin-top:20px;padding:15px;background:#fff8e1;border:1px solid #ffd166;border-radius:10px;cursor:pointer;">
                        <input type="checkbox" id="agency-partner-privacy-checkbox" onchange="toggleAgencyPrivacyApprovalButton()" style="width:20px;height:20px;margin-top:3px;flex:0 0 auto;cursor:pointer;">
                        <span style="font-weight:800;color:#2d3436;line-height:1.5;">I agree to TourSetu's Partner Privacy Policy regarding business verification, fleet tracking, and document handling.</span>
                    </label>
                    <button id="agency-partner-privacy-approved-btn" onclick="acceptAgencyPartnerPrivacy()" disabled style="width:100%;margin-top:14px;background:#27ae60;color:#fff;border:0;padding:14px;border-radius:10px;font-weight:900;font-size:15px;cursor:not-allowed;opacity:.5;">
                        ACCEPT & CONTINUE
                    </button>
                    <p style="margin:12px 0 0;text-align:center;color:#888;font-size:12px;">The Agency Dashboard will remain locked until you tick the checkbox and click ACCEPT & CONTINUE.</p>
                </div>
            </div>
        `;
        return false;
    }

    window.toggleAgencyPrivacyApprovalButton = function () {
        const checkbox = document.getElementById('agency-partner-privacy-checkbox');
        const button = document.getElementById('agency-partner-privacy-approved-btn');
        if (!checkbox || !button) return;
        button.disabled = !checkbox.checked;
        button.style.opacity = checkbox.checked ? '1' : '.5';
        button.style.cursor = checkbox.checked ? 'pointer' : 'not-allowed';
    };

    window.acceptAgencyPartnerPrivacy = async function () {
        const checkbox = document.getElementById('agency-partner-privacy-checkbox');
        const button = document.getElementById('agency-partner-privacy-approved-btn');
        if (!checkbox?.checked) {
            alert('Please tick the Partner Privacy Policy checkbox before continuing.');
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
            .from('agency_privacy_acceptances')
            .insert({ user_id: user.id, policy_version: AGENCY_PRIVACY_VERSION });

        if (error) {
            console.error('Agency privacy policy acceptance save failed:', error);
            if (button) {
                button.disabled = false;
                button.innerText = 'ACCEPT & CONTINUE';
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
            }
            alert('Partner Privacy Policy acceptance save nahi ho saka: ' + error.message);
            return;
        }

        if (button) button.innerText = 'ACCEPTED ✓';

        if (typeof window.__toursetuOriginalRenderAgencyDashboard === 'function') {
            await window.__toursetuOriginalRenderAgencyDashboard(user);
        } else if (typeof window.renderAgencyDashboard === 'function') {
            await window.renderAgencyDashboard(user);
        }
    };

    window.__toursetuEnsureAgencyPrivacyAccepted = ensureAgencyPrivacyAccepted;
    window.agencyPartnerPrivacyPolicyHtml = agencyPartnerPrivacyPolicyHtml;
    window.AGENCY_PRIVACY_VERSION = AGENCY_PRIVACY_VERSION;

    // renderAgencyDashboard() is called by the existing agency showDashboard flow.
    // Wrapping it keeps the existing Terms gate unchanged and adds Privacy immediately after it.
    const originalRenderAgencyDashboard = window.renderAgencyDashboard;
    if (typeof originalRenderAgencyDashboard === 'function') {
        window.__toursetuOriginalRenderAgencyDashboard = originalRenderAgencyDashboard;
        window.renderAgencyDashboard = async function (user, ...args) {
            const role = user?.user_metadata?.role;
            if (role === 'agency') {
                const accepted = await ensureAgencyPrivacyAccepted(user);
                if (!accepted) return;
            }
            return originalRenderAgencyDashboard.call(this, user, ...args);
        };
    }

    // Existing legal-panel Privacy Policy button should show the agency policy for agencies.
    const originalOpenLegalPanel = window.openTourSetuLegalPanel;
    if (typeof originalOpenLegalPanel === 'function') {
        window.__toursetuOriginalOpenLegalPanel = originalOpenLegalPanel;
        window.openTourSetuLegalPanel = function (type) {
            if (type === 'privacy' && window.currentTourSetuUser?.user_metadata?.role === 'agency') {
                const existing = document.getElementById('toursetu-legal-modal');
                if (existing) existing.remove();

                const modal = document.createElement('div');
                modal.id = 'toursetu-legal-modal';
                modal.style.cssText = 'position:fixed;inset:0;z-index:1000001;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:20px;';
                modal.innerHTML = '<div style="background:white;max-width:650px;width:100%;max-height:85vh;overflow:auto;border-radius:16px;padding:28px;line-height:1.65;color:#444;">' +
                    agencyPartnerPrivacyPolicyHtml() +
                    '<button onclick="document.getElementById(\'toursetu-legal-modal\').remove()" style="display:block;margin:20px auto 0;background:#ff9f43;color:white;padding:11px 25px;border:0;border-radius:8px;cursor:pointer;">CLOSE</button>' +
                    '</div>';
                document.body.appendChild(modal);
                return;
            }
            return originalOpenLegalPanel.call(this, type);
        };
    }
})();
