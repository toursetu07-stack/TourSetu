/* TourSetu Hotel Partner Dashboard Terms — hotel accounts only */
(function () {
    'use strict';

    const HOTEL_TERMS_VERSION = '2026-10-02-v2';

    function hotelPartnerTermsHtml() {
        return '<h2>📄 TourSetu Hotel Partner Terms & Conditions</h2>' +
            '<h3>Legal Licensing & Compliance</h3>' +
            '<p>Hotel Partner warrants that the property holds valid registrations with the Uttarakhand Tourism Development Board (UTDB), local municipal authorities, and required fire/safety NOCs.</p>' +
            '<h3>1. Inventory & Amenity Authenticity</h3>' +
            '<p>Hotel Partner agrees to provide accurate room availability, true property photographs, and guaranteed amenities (including hot water, power backup, pure veg dining options, and driver accommodation facilities where selected).</p>' +
            '<h3>2. Rate Integrity & Price Match</h3>' +
            '<p>B2B/Contracted rates offered on TourSetu must be honored upon guest arrival. Hotels cannot charge walk-in/rack rate surcharges to guests booked through TourSetu.</p>' +
            '<h3>3. Driver Accommodation Policy</h3>' +
            '<p>Hotel agrees to provide designated resting spaces/facilities for tour operator drivers as specified in the property amenity profile during the onboarding process.</p>' +
            '<h3>4. No-Show & Emergency Weather Policy</h3>' +
            '<p>In instances of Yatra stoppage due to natural disasters (landslides, severe weather) preventing tourist arrival, the hotel agrees to honor date-shifting or flexible cancellation guidelines without imposing arbitrary penalty fees.</p>' +
            '<h3>5. Platform Commission</h3>' +
            '<p>Hotel Partner confirms that it is ready to pay a <strong>4% TourSetu platform commission</strong> from the total package price for bookings generated through the TourSetu marketplace. This commission will be deducted/settled according to TourSetu payout terms.</p>';
    }

    function renderHotelTermsGate(user, originalDashboard) {
        const app = document.getElementById('app');
        if (!app) return;
        const existingMenu = document.getElementById('toursetu-utility-menu-root');
        if (existingMenu) existingMenu.remove();

        app.style.maxWidth = '100%';
        app.innerHTML =
            '<div style="min-height:100vh;background:#f4f7f6;padding:28px 18px;box-sizing:border-box;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;">' +
                '<div style="background:#fff;max-width:780px;width:100%;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.15);padding:30px;box-sizing:border-box;">' +
                    '<div style="text-align:center;margin-bottom:20px;">' +
                        '<div style="font-size:38px;">🏨</div>' +
                        '<h2 style="margin:5px 0;color:#2d3436;">TourSetu Hotel Partner Terms & Conditions</h2>' +
                        '<p style="margin:0;color:#777;font-size:13px;">Please read and accept these Hotel Partner Terms & Conditions before entering your Hotel Dashboard.</p>' +
                    '</div>' +
                    '<div style="max-height:55vh;overflow-y:auto;padding:20px;background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;color:#444;line-height:1.65;font-size:14px;">' +
                        hotelPartnerTermsHtml() +
                    '</div>' +
                    '<label style="display:flex;gap:12px;align-items:flex-start;margin-top:20px;padding:15px;background:#fff8e1;border:1px solid #ffd166;border-radius:10px;cursor:pointer;">' +
                        '<input type="checkbox" id="hotel-partner-terms-checkbox" onchange="window.toggleHotelPartnerTermsButton()" style="width:20px;height:20px;margin-top:3px;flex:0 0 auto;cursor:pointer;">' +
                        '<span style="font-weight:800;color:#2d3436;line-height:1.5;">I confirm that I am the authorized owner/manager of this property and agree to TourSetu\'s Hotel Partner Terms & Conditions.</span>' +
                    '</label>' +
                    '<button id="hotel-partner-terms-approved-btn" onclick="window.acceptHotelPartnerTerms()" disabled style="width:100%;margin-top:14px;background:#27ae60;color:#fff;border:0;padding:14px;border-radius:10px;font-weight:900;font-size:15px;cursor:not-allowed;opacity:.5;">APPROVED</button>' +
                    '<p style="margin:12px 0 0;text-align:center;color:#888;font-size:12px;">The Hotel Dashboard will remain locked until you tick the checkbox and click APPROVED.</p>' +
                '</div>' +
            '</div>';

        window.__tourSetuOriginalHotelDashboard = originalDashboard;
    }

    window.toggleHotelPartnerTermsButton = function () {
        const checkbox = document.getElementById('hotel-partner-terms-checkbox');
        const button = document.getElementById('hotel-partner-terms-approved-btn');
        if (!checkbox || !button) return;
        button.disabled = !checkbox.checked;
        button.style.opacity = checkbox.checked ? '1' : '.5';
        button.style.cursor = checkbox.checked ? 'pointer' : 'not-allowed';
    };

    window.acceptHotelPartnerTerms = async function () {
        const checkbox = document.getElementById('hotel-partner-terms-checkbox');
        const button = document.getElementById('hotel-partner-terms-approved-btn');
        if (!checkbox || !checkbox.checked) {
            alert('Please tick the confirmation checkbox before clicking APPROVED.');
            return;
        }

        // Use the same authenticated Supabase client as the main app.
        const client = typeof getClient === 'function' ? getClient() : null;

        if (!client) {
            alert('Database connection error. Please reload and try again.');
            return;
        }

        let { data: { user } } = await client.auth.getUser();

        // If the access token expired while the page was open, refresh it
        // before asking the hotel partner to log in again.
        if (!user?.id) {
            const { data: refreshed, error: refreshError } = await client.auth.refreshSession();
            if (!refreshError) {
                user = refreshed?.user || null;
            }
        }

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
            .from('hotel_terms_acceptances')
            .insert({ user_id: user.id, terms_version: HOTEL_TERMS_VERSION });

        if (error) {
            console.error('Hotel terms acceptance save failed:', error);
            if (button) {
                button.disabled = false;
                button.innerText = 'APPROVED';
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
            }
            alert('Hotel Partner Terms acceptance save nahi ho saka: ' + error.message);
            return;
        }

        if (button) button.innerText = 'APPROVED ✓';

        // Re-enter the dashboard entry point so the Hotel Privacy Policy gate
        // can run immediately after Terms acceptance.
        if (typeof window.renderHotelDashboard === 'function') {
            await window.renderHotelDashboard(user);
        } else {
            const originalDashboard = window.__tourSetuOriginalHotelDashboard;
            if (typeof originalDashboard === 'function') {
                await originalDashboard(user);
            }
        }
    };

    async function hotelTermsGuard(user) {
        // Use the same authenticated Supabase client as the main app.
        const client = typeof getClient === 'function' ? getClient() : null;

        if (!client) return false;
        const { data, error } = await client
            .from('hotel_terms_acceptances')
            .select('user_id, terms_version, accepted_at')
            .eq('user_id', user.id)
            .eq('terms_version', HOTEL_TERMS_VERSION)
            .maybeSingle();

        if (error) {
            console.error('Hotel terms acceptance check failed:', error);
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,sans-serif;"><div style="background:#fff;max-width:560px;width:100%;padding:30px;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.12);text-align:center;"><h2>Unable to load Hotel Partner Terms & Conditions</h2><p>Please try again. Your Hotel Dashboard will remain locked until the current terms are recorded.</p><button onclick="location.reload()" style="background:#ff9f43;color:#fff;border:0;padding:12px 24px;border-radius:8px;font-weight:800;">TRY AGAIN</button></div></div>';
            }
            return false;
        }

        if (data) return true;
        return false;
    }

    function installHotelDashboardGuard() {
        if (window.__tourSetuHotelTermsWrapped) return;
        if (typeof window.renderHotelDashboard !== 'function') {
            setTimeout(installHotelDashboardGuard, 50);
            return;
        }

        const originalDashboard = window.renderHotelDashboard;
        window.__tourSetuOriginalHotelDashboard = originalDashboard;

        window.renderHotelDashboard = async function (user) {
            const activeUser = user || (await window.supabase.auth.getUser()).data.user;
            if (!activeUser?.id) return originalDashboard(user);

            const accepted = await hotelTermsGuard(activeUser);
            if (!accepted) {
                renderHotelTermsGate(activeUser, originalDashboard);
                return;
            }

            return originalDashboard(activeUser);
        };

        window.__tourSetuHotelTermsWrapped = true;
    }


    function installHotelLegalTermsPanel() {
        if (window.__tourSetuHotelLegalTermsWrapped) return;
        if (typeof window.openTourSetuLegalPanel !== 'function') {
            setTimeout(installHotelLegalTermsPanel, 50);
            return;
        }
        const originalLegalPanel = window.openTourSetuLegalPanel;
        window.openTourSetuLegalPanel = function (type) {
            const role = window.currentTourSetuUser?.user_metadata?.role;
            if (type === 'terms' && role === 'hotel') {
                const existing = document.getElementById('toursetu-legal-modal');
                if (existing) existing.remove();
                const modal = document.createElement('div');
                modal.id = 'toursetu-legal-modal';
                modal.style.cssText = 'position:fixed;inset:0;z-index:1000001;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:20px;';
                modal.innerHTML = '<div style="background:white;max-width:650px;width:100%;max-height:85vh;overflow:auto;border-radius:16px;padding:28px;line-height:1.65;color:#444;">' +
                    hotelPartnerTermsHtml() +
                    '<button onclick="document.getElementById(\'toursetu-legal-modal\').remove()" style="display:block;margin:20px auto 0;background:#ff9f43;color:white;padding:11px 25px;border:0;border-radius:8px;">CLOSE</button>' +
                    '</div>';
                document.body.appendChild(modal);
                return;
            }
            return originalLegalPanel(type);
        };
        window.__tourSetuHotelLegalTermsWrapped = true;
    }

    installHotelLegalTermsPanel();
    installHotelDashboardGuard();
})();
