/* =========================================
   1. CONFIGURATION & GLOBAL STATE
   ========================================= */
const SUPABASE_URL = 'https://udfwcqrmksfyeigxgdws.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZndjcXJta3NmeWVpZ3hnZHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTIyNTQsImV4cCI6MjA4ODAyODI1NH0.zf1taGGbEszA0cKMwFw8rKBuT2OwYqUjF45MqZXaEBw';

let _supabase = null;
let isLoginMode = true;

const tourDestinations = [
  "Char Dham Yatra (Uttarakhand)"
];

const vehicleTypes = [
    { id: 'car4', name: '4 Seater Car', icon: '🚗' },
    { id: 'car6', name: '6 Seater SUV', icon: '🚙' },
    { id: 'car7', name: '7 Seater SUV', icon: '🚐' },
    { id: 'tempo', name: 'Tempo Traveler', icon: '🚌' },
    { id: 'bus', name: 'Luxury Bus', icon: '🚍' }
];

const locationData = {
  "Andaman & Nicobar": ["Port Blair", "Havelock Island", "Neil Island"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Tirupati", "Guntur", "Nellore"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
  "Chandigarh": ["Mohali", "Kharar", "Zirakpur"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba"],
  "Dadra & Nagar Haveli": ["Silvassa"],
  "Daman & Diu": ["Daman", "Diu"],
  "Delhi": ["New Delhi", "Old Delhi", "Saket", "Dwarka", "Rohini", "Connaught Place"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Calangute"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Somnath"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Kullu", "Solan"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Katra", "Gulmarg", "Pahalgam"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Munnar", "Wayand"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane"],
  "Manipur": ["Imphal"],
  "Meghalaya": ["Shillong", "Cherrapunji", "Tura"],
  "Mizoram": ["Aizawl"],
  "Nagaland": ["Kohima", "Dimapur"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Puri", "Rourkela", "Sambalpur"],
  "Puducherry": ["Puducherry"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Ajmer", "Bikaner", "Pushkar"],
  "Sikkim": ["Gangtok", "Pelling", "Namchi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam"],
  "Tripura": ["Agartala"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Ayodhya", "Prayagraj", "Meerut"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Rudrapur", "Kashipur", "Nainital", "Roorkee", "Kichha", "Pantnagar", "Lal kuan", "Lalpur", "Kashipur", "Rudrapryag", "Almora", "Ranikhet", "Bageshwar", "Kausani", "Uttarkashi", "Barkot",],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Durgapur"]
};

// HELPER FUNCTION: Ensure this exists in your script so the dropdowns work
window.updateCities = function() {
    const stateSelect = document.getElementById('p-state');
    const citySelect = document.getElementById('p-city');
    const selectedState = stateSelect.value;

    // Clear current cities
    citySelect.innerHTML = '<option value="">Select City</option>';

    if (selectedState && locationData[selectedState]) {
        locationData[selectedState].forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.innerText = city;
            citySelect.appendChild(opt);
        });
    }
};
/* =========================================
   2. CORE UTILITY FUNCTIONS
   ========================================= */

function getClient() {
    if (!_supabase && window.supabase) {
        _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _supabase;
}

/* ============================================================
   🔔 TOURSETU PUSH NOTIFICATIONS
   OneSignal maps the authenticated Supabase user id to the
   OneSignal external_id alias. The provider then delivers the
   notification even when this website is not open in a tab.
   ============================================================ */
window.identifyOneSignalUser = function(userId) {
    if (!userId) return;
    window.__toursetuPendingOneSignalUserId = String(userId);
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(OneSignal) {
        try {
            await OneSignal.login(String(userId));
        } catch (error) {
            console.warn("OneSignal login failed:", error);
        }
    });
};

window.sendTourSetuBookingNotification = async function(bookingId, bookingType) {
    if (!bookingId || !bookingType) return;
    try {
        const client = getClient();
        if (!client) return;
        const { data, error } = await client.functions.invoke('send-booking-notification', {
            body: {
                booking_id: String(bookingId),
                booking_type: String(bookingType)
            }
        });
        if (error) {
            console.warn("Booking push notification failed:", error);
            return;
        }
        console.log("🔔 Booking push notification result:", data);
    } catch (error) {
        // Notification failure must never make a successful booking fail.
        console.warn("Booking push notification exception:", error);
    }
};


/* =========================================================================
   🔗 REFERRAL PROGRAM + DASHBOARD UTILITY MENU
   ========================================================================= */
const REFERRAL_STORAGE_KEY = 'toursetu_referral_code';

const CUSTOMER_TERMS_VERSION = '2026-10-02-v1';

const AGENCY_TERMS_VERSION = '2026-10-02-v4';

const CUSTOMER_PRIVACY_VERSION = '2026-10-02-v1';

function agencyPartnerTermsHtml() {
    return '<h2>📄 TourSetu Partner Terms & Conditions</h2>' +
        '<h3>Asset Ownership & Legal Compliance</h3>' +
        '<p>Operator guarantees that all commercial vehicles (Cars, Tempo Travellers, Buses) listed on TourSetu are owned or legitimately leased by the firm, possessing valid Yellow Plate commercial RCs, UTDB Registrations, AITP/State Permits, and active insurance.</p>' +
        '<h3>1. Direct Execution Responsibility</h3>' +
        '<p>Operator agrees to execute all booked tours using their in-house/dedicated fleet and verified drivers. Sub-contracting or passing bookings to unverified third-party brokers is strictly prohibited and will result in immediate account termination.</p>' +
        '<h3>2. Pricing & Route Accuracy</h3>' +
        '<p>Operators are responsible for setting accurate base package costs and per-kilometer rates. Misleading pricing, hidden charges, or demanding extra cash from tourists on-route will lead to blacklisting.</p>' +
        '<h3>3. Vehicle Breakdown & Emergency Backup</h3>' +
        '<p>In the event of a mechanical breakdown, accident, or delay during a tour, the operator is legally obligated to provide a replacement commercial vehicle of equal or higher capacity within a reasonable timeframe.</p>' +
        '<h3>4. Payout Settlement & Commission</h3>' +
        '<p>Payouts for completed trips will be processed to the operator\'s registered business bank account after deduction of the agreed TourSetu platform commission fee, subject to successful customer check-in and service delivery.</p>' +
        '<h3>5. Platform Commission & Transaction Fees</h3>' +
        '<p>Operator confirms that it is ready to pay <strong>15% TourSetu platform commission + 2% gateway transaction fee + applicable GST on the transaction fee</strong> from the total package price for bookings generated through the TourSetu marketplace. These applicable platform and transaction charges will be deducted/settled according to TourSetu payout terms.</p>';
}

async function ensureAgencyTermsAccepted(user) {
    const app = document.getElementById('app');
    const client = getClient();
    if (!app || !client || !user?.id) return false;
    const { data, error } = await client.from('agency_terms_acceptances').select('user_id, terms_version, accepted_at').eq('user_id', user.id).eq('terms_version', AGENCY_TERMS_VERSION).maybeSingle();
    if (error) {
        console.error('Agency terms acceptance check failed:', error);
        app.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f7f6;padding:20px;box-sizing:border-box;font-family:Inter,sans-serif;"><div style="background:#fff;max-width:560px;width:100%;padding:30px;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.12);text-align:center;"><h2 style="margin-top:0;color:#2d3436;">Unable to load Partner Terms & Conditions</h2><p style="color:#636e72;line-height:1.6;">Please try again. Your Agency Dashboard will remain locked until the current Partner Terms & Conditions are successfully recorded.</p><button onclick="location.reload()" style="background:#ff9f43;color:#fff;border:0;padding:12px 24px;border-radius:8px;font-weight:800;cursor:pointer;">TRY AGAIN</button><button onclick="handleLogout()" style="margin-left:8px;background:#2d3436;color:#fff;border:0;padding:12px 24px;border-radius:8px;font-weight:800;cursor:pointer;">LOGOUT</button></div></div>';
        return false;
    }
    if (data) return true;
    const existingMenu = document.getElementById('toursetu-utility-menu-root');
    if (existingMenu) existingMenu.remove();
    app.style.maxWidth = '100%';
    app.innerHTML = '<div style="min-height:100vh;background:#f4f7f6;padding:28px 18px;box-sizing:border-box;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;"><div style="background:#fff;max-width:780px;width:100%;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.15);padding:30px;box-sizing:border-box;"><div style="text-align:center;margin-bottom:20px;"><div style="font-size:38px;">📄</div><h2 style="margin:5px 0;color:#2d3436;">TourSetu Partner Terms & Conditions</h2><p style="margin:0;color:#777;font-size:13px;">Please read and accept these Partner Terms & Conditions before entering your Agency Dashboard.</p></div><div style="max-height:55vh;overflow-y:auto;padding:20px;background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;color:#444;line-height:1.65;font-size:14px;">' + agencyPartnerTermsHtml() + '</div><label style="display:flex;gap:12px;align-items:flex-start;margin-top:20px;padding:15px;background:#fff8e1;border:1px solid #ffd166;border-radius:10px;cursor:pointer;"><input type="checkbox" id="agency-partner-terms-checkbox" onchange="toggleAgencyTermsApprovalButton()" style="width:20px;height:20px;margin-top:3px;flex:0 0 auto;cursor:pointer;"><span style="font-weight:800;color:#2d3436;line-height:1.5;">I confirm that I am an Asset-Owned Integrated Tour Operator and agree to TourSetu\'s Partner Terms & Conditions.</span></label><button id="agency-partner-terms-approved-btn" onclick="acceptAgencyPartnerTerms()" disabled style="width:100%;margin-top:14px;background:#27ae60;color:#fff;border:0;padding:14px;border-radius:10px;font-weight:900;font-size:15px;cursor:not-allowed;opacity:.5;">APPROVED</button><p style="margin:12px 0 0;text-align:center;color:#888;font-size:12px;">The Agency Dashboard will remain locked until you tick the checkbox and click APPROVED.</p></div></div>';
    return false;
}

window.toggleAgencyTermsApprovalButton = function() {
    const checkbox = document.getElementById('agency-partner-terms-checkbox');
    const button = document.getElementById('agency-partner-terms-approved-btn');
    if (!checkbox || !button) return;
    button.disabled = !checkbox.checked;
    button.style.opacity = checkbox.checked ? '1' : '.5';
    button.style.cursor = checkbox.checked ? 'pointer' : 'not-allowed';
};

window.acceptAgencyPartnerTerms = async function() {
    const checkbox = document.getElementById('agency-partner-terms-checkbox');
    const button = document.getElementById('agency-partner-terms-approved-btn');
    if (!checkbox?.checked) { alert('Please tick the confirmation checkbox before clicking APPROVED.'); return; }
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user?.id) { alert('Your login session has expired. Please login again.'); return; }
    if (button) { button.disabled = true; button.innerText = 'SAVING...'; button.style.opacity = '.7'; button.style.cursor = 'wait'; }
    const acceptancePayload = {
        user_id: user.id,
        terms_version: AGENCY_TERMS_VERSION,
        accepted_at: new Date().toISOString()
    };

    // Handle both first-time acceptance and acceptance of a new terms version.
    // Updating first avoids the user_id primary-key/upsert conflict when an
    // older terms version is already stored for this agency.
    const { data: existingAcceptance, error: existingAcceptanceError } = await client
        .from('agency_terms_acceptances')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

    let acceptanceError = existingAcceptanceError || null;

    if (!acceptanceError && existingAcceptance) {
        const { error } = await client
            .from('agency_terms_acceptances')
            .update(acceptancePayload)
            .eq('user_id', user.id);
        acceptanceError = error || null;
    } else if (!acceptanceError) {
        const { error } = await client
            .from('agency_terms_acceptances')
            .insert(acceptancePayload);
        acceptanceError = error || null;
    }

    const error = acceptanceError;
    if (error) {
        console.error('Agency terms acceptance save failed:', error);
        if (button) { button.disabled = false; button.innerText = 'APPROVED'; button.style.opacity = '1'; button.style.cursor = 'pointer'; }
        alert('Partner Terms acceptance save nahi ho saka: ' + error.message);
        return;
    }
    if (button) button.innerText = 'APPROVED ✓';
    const verification = await getAgencyVerification(user.id).catch(() => null);
    window.currentAgencyVerificationStatus = verification?.status || 'pending';
    await renderAgencyDashboard(user);
};


function customerPrivacyPolicyHtml() {
    return `
        <h2>🔒 TourSetu Privacy Policy</h2>
        <h3>Information We Collect</h3>
        <p>We collect your name, phone number, email address, journey dates, pickup address, and number of passengers to facilitate seamless booking execution.</p>
        <h3>1. Location Data Usage</h3>
        <p>Real-time location data (or selected pickup city) is accessed strictly to calculate accurate distance-based pricing via Google Maps API and to coordinate pickup with your assigned operator.</p>
        <h3>2. Data Sharing with Operators</h3>
        <p>Your contact details and pickup location are shared exclusively with the booked Asset-Owned Integrated Tour Operator and assigned driver for operational execution.</p>
        <h3>3. Third-Party Processing</h3>
        <p>Payment details are processed securely through RBI-compliant third-party payment gateways (e.g., Razorpay/Paytm). TourSetu does not store your raw credit/debit card credentials or UPI PINs.</p>
        <h3>4. Data Protection & No-Sale Guarantee</h3>
        <p>Your personal data is stored on encrypted servers and will never be sold, rented, or traded to third-party marketing agencies.</p>
    `;
}

async function ensureCustomerPrivacyAccepted(user) {
    const app = document.getElementById('app');
    const client = getClient();
    if (!app || !client || !user?.id) return false;

    const { data, error } = await client
        .from('customer_privacy_acceptances')
        .select('user_id, policy_version, accepted_at')
        .eq('user_id', user.id)
        .eq('policy_version', CUSTOMER_PRIVACY_VERSION)
        .maybeSingle();

    if (error) {
        console.error('Customer privacy policy acceptance check failed:', error);
        app.innerHTML = `
            <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f7f6;padding:20px;box-sizing:border-box;font-family:Inter,sans-serif;">
                <div style="background:#fff;max-width:560px;width:100%;padding:30px;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.12);text-align:center;">
                    <h2 style="margin-top:0;color:#2d3436;">Unable to load Privacy Policy</h2>
                    <p style="color:#636e72;line-height:1.6;">Please try again. Your Customer Dashboard will remain locked until the current Privacy Policy acceptance is successfully recorded.</p>
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
                    <h2 style="margin:5px 0;color:#2d3436;">TourSetu Privacy Policy</h2>
                    <p style="margin:0;color:#777;font-size:13px;">Please read and accept this Privacy Policy before entering your Customer Dashboard.</p>
                </div>
                <div style="max-height:55vh;overflow-y:auto;padding:20px;background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;color:#444;line-height:1.65;font-size:14px;">
                    ${customerPrivacyPolicyHtml()}
                </div>
                <label style="display:flex;gap:12px;align-items:flex-start;margin-top:20px;padding:15px;background:#fff8e1;border:1px solid #ffd166;border-radius:10px;cursor:pointer;">
                    <input type="checkbox" id="customer-privacy-policy-checkbox" onchange="toggleCustomerPrivacyApprovalButton()" style="width:20px;height:20px;margin-top:3px;flex:0 0 auto;cursor:pointer;">
                    <span style="font-weight:800;color:#2d3436;line-height:1.5;">I agree to TourSetu's Privacy Policy regarding data collection, live location tracking, and trip processing.</span>
                </label>
                <button id="customer-privacy-policy-approved-btn" onclick="acceptCustomerPrivacyPolicy()" disabled style="width:100%;margin-top:14px;background:#27ae60;color:#fff;border:0;padding:14px;border-radius:10px;font-weight:900;font-size:15px;cursor:not-allowed;opacity:.5;">
                    ACCEPT & CONTINUE
                </button>
                <p style="margin:12px 0 0;text-align:center;color:#888;font-size:12px;">The Customer Dashboard will remain locked until you tick the checkbox and click ACCEPT & CONTINUE.</p>
            </div>
        </div>
    `;
    return false;
}

window.toggleCustomerPrivacyApprovalButton = function() {
    const checkbox = document.getElementById('customer-privacy-policy-checkbox');
    const button = document.getElementById('customer-privacy-policy-approved-btn');
    if (!checkbox || !button) return;
    button.disabled = !checkbox.checked;
    button.style.opacity = checkbox.checked ? '1' : '.5';
    button.style.cursor = checkbox.checked ? 'pointer' : 'not-allowed';
};

window.acceptCustomerPrivacyPolicy = async function() {
    const checkbox = document.getElementById('customer-privacy-policy-checkbox');
    const button = document.getElementById('customer-privacy-policy-approved-btn');
    if (!checkbox?.checked) {
        alert("Please tick the privacy policy checkbox before continuing.");
        return;
    }

    const client = getClient();
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
        .from('customer_privacy_acceptances')
        .insert({ user_id: user.id, policy_version: CUSTOMER_PRIVACY_VERSION });

    if (error) {
        console.error('Customer privacy policy acceptance save failed:', error);
        if (button) {
            button.disabled = false;
            button.innerText = 'ACCEPT & CONTINUE';
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
        alert('Privacy Policy acceptance save nahi ho saka: ' + error.message);
        return;
    }

    if (button) button.innerText = 'ACCEPTED ✓';
    await renderCustomerHomepage(user, { skipTermsCheck: true, skipPrivacyCheck: true });
};

function customerMarketplaceTermsHtml() {
    return `
        <h2>📄 Marketplace Terms & Conditions</h2>
        <h3>Marketplace Intermediary Role</h3>
        <p>Customer acknowledges that TourSetu is an intermediary technology marketplace connecting travelers directly with verified Uttarakhand-based local tour operators and hotels. TourSetu does not directly own or operate transport vehicles or hotels.</p>
        <h3>1. Booking & Fare Accuracy</h3>
        <p>All tour package prices are dynamically calculated based on base package rates and selected pickup location distances within Uttarakhand. Final estimated fares are binding upon booking confirmation.</p>
        <h3>2. Cancellation & Refund Policy</h3>
        <p>Cancellations made 15+ days prior to the journey start date are eligible for a partial refund as per the booked operator's policy. The platform facilitation/service fee is non-refundable.</p>
        <h3>3. Safety & On-Ground Execution</h3>
        <p>Operational execution (vehicle quality, driver conduct, and itinerary adherence) is the direct responsibility of the booked Asset-Owned Integrated Tour Operator. Passengers must comply with local safety and hill-driving guidelines.</p>
        <h3>4. Natural Calamities & Force Majeure</h3>
        <p>In cases of landslides, extreme weather, road blockages, or government-mandated Yatra halts (especially on Char Dham routes), TourSetu and the operator reserve the right to modify itineraries or reschedule trips.</p>
    `;
}

async function ensureCustomerTermsAccepted(user) {
    const app = document.getElementById('app');
    const client = getClient();
    if (!app || !client || !user?.id) return false;

    const { data, error } = await client
        .from('customer_terms_acceptances')
        .select('user_id, terms_version, accepted_at')
        .eq('user_id', user.id)
        .eq('terms_version', CUSTOMER_TERMS_VERSION)
        .maybeSingle();

    if (error) {
        console.error('Customer terms acceptance check failed:', error);
        app.innerHTML = `
            <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f7f6;padding:20px;box-sizing:border-box;font-family:Inter,sans-serif;">
                <div style="background:#fff;max-width:520px;width:100%;padding:30px;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.12);text-align:center;">
                    <h2 style="margin-top:0;color:#2d3436;">Unable to load Terms & Conditions</h2>
                    <p style="color:#636e72;line-height:1.6;">Please try again. Your Customer Dashboard will remain locked until the current Terms & Conditions are successfully recorded.</p>
                    <button onclick="location.reload()" style="background:#ff9f43;color:#fff;border:0;padding:12px 24px;border-radius:8px;font-weight:800;cursor:pointer;">TRY AGAIN</button>
                    <button onclick="handleLogout()" style="margin-left:8px;background:#2d3436;color:#fff;border:0;padding:12px 24px;border-radius:8px;font-weight:800;cursor:pointer;">LOGOUT</button>
                </div>
            </div>
        `;
        return false;
    }

    if (data) return true;

    const existingMenu = document.getElementById('toursetu-utility-menu-root');
    if (existingMenu) existingMenu.remove();

    app.style.maxWidth = '100%';
    app.innerHTML = `
        <div style="min-height:100vh;background:#f4f7f6;padding:28px 18px;box-sizing:border-box;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;">
            <div style="background:#fff;max-width:760px;width:100%;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.15);padding:30px;box-sizing:border-box;">
                <div style="text-align:center;margin-bottom:20px;">
                    <div style="font-size:38px;">📄</div>
                    <h2 style="margin:5px 0;color:#2d3436;">TourSetu Marketplace Terms & Conditions</h2>
                    <p style="margin:0;color:#777;font-size:13px;">Please read and accept these Terms & Conditions before entering your Customer Dashboard.</p>
                </div>
                <div style="max-height:55vh;overflow-y:auto;padding:20px;background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;color:#444;line-height:1.65;font-size:14px;">
                    ${customerMarketplaceTermsHtml()}
                </div>
                <label style="display:flex;gap:12px;align-items:flex-start;margin-top:20px;padding:15px;background:#fff8e1;border:1px solid #ffd166;border-radius:10px;cursor:pointer;">
                    <input type="checkbox" id="customer-marketplace-terms-checkbox" onchange="toggleCustomerTermsApprovalButton()" style="width:20px;height:20px;margin-top:3px;flex:0 0 auto;cursor:pointer;">
                    <span style="font-weight:800;color:#2d3436;line-height:1.5;">I agree all terms and conditions</span>
                </label>
                <button id="customer-marketplace-terms-approved-btn" onclick="acceptCustomerMarketplaceTerms()" disabled style="width:100%;margin-top:14px;background:#27ae60;color:#fff;border:0;padding:14px;border-radius:10px;font-weight:900;font-size:15px;cursor:not-allowed;opacity:.5;">
                    APPROVED
                </button>
                <p style="margin:12px 0 0;text-align:center;color:#888;font-size:12px;">The Customer Dashboard will remain locked until you tick the checkbox and click APPROVED.</p>
            </div>
        </div>
    `;
    return false;
}

window.toggleCustomerTermsApprovalButton = function() {
    const checkbox = document.getElementById('customer-marketplace-terms-checkbox');
    const button = document.getElementById('customer-marketplace-terms-approved-btn');
    if (!checkbox || !button) return;
    button.disabled = !checkbox.checked;
    button.style.opacity = checkbox.checked ? '1' : '.5';
    button.style.cursor = checkbox.checked ? 'pointer' : 'not-allowed';
};

window.acceptCustomerMarketplaceTerms = async function() {
    const checkbox = document.getElementById('customer-marketplace-terms-checkbox');
    const button = document.getElementById('customer-marketplace-terms-approved-btn');
    if (!checkbox?.checked) {
        alert('Please tick "I agree all terms and conditions" before clicking APPROVED.');
        return;
    }
    const client = getClient();
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
        .from('customer_terms_acceptances')
        .insert({ user_id: user.id, terms_version: CUSTOMER_TERMS_VERSION });
    if (error) {
        console.error('Customer terms acceptance save failed:', error);
        if (button) {
            button.disabled = false;
            button.innerText = 'APPROVED';
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
        alert('Terms acceptance save nahi ho saka: ' + error.message);
        return;
    }
    if (button) button.innerText = 'APPROVED ✓';
    await renderCustomerHomepage(user, { skipTermsCheck: true });
};


function captureReferralCodeFromUrl() {
    try {
        const code = new URLSearchParams(window.location.search).get('ref');
        if (code) {
            localStorage.setItem(REFERRAL_STORAGE_KEY, code.trim());
            const visitorKey = localStorage.getItem('toursetu_referral_visitor') || crypto.randomUUID();
            localStorage.setItem('toursetu_referral_visitor', visitorKey);
            const client = getClient();
            if (client) client.rpc('record_referral_visit', { p_code: code.trim(), p_visitor_key: visitorKey }).catch(() => {});
        }
    } catch (e) { console.warn('Referral capture skipped:', e); }
}

async function recordReferralLogin() {
    try {
        const code = localStorage.getItem(REFERRAL_STORAGE_KEY);
        if (!code) return;
        await getClient().rpc('record_referral_login', { p_code: code });
    } catch (e) { console.warn('Referral attribution skipped:', e); }
}

async function getMyReferralCode() {
    const { data, error } = await getClient().rpc('get_or_create_referral_code');
    if (error) throw error;
    return data;
}

window.copyMyReferralLink = async function() {
    const input = document.getElementById('toursetu-referral-link');
    if (!input) return;
    try { await navigator.clipboard.writeText(input.value); }
    catch (e) { input.select(); document.execCommand('copy'); }
    alert('✅ Referral link copied!');
};

window.shareMyReferralLink = async function() {
    const input = document.getElementById('toursetu-referral-link');
    if (!input) return;
    const link = input.value;
    if (navigator.share) {
        try { await navigator.share({title:'Join TourSetu',text:'Join TourSetu using my referral link.',url:link}); } catch (e) {}
    } else {
        try { await navigator.clipboard.writeText(link); } catch (e) {}
        alert('Referral link copied. Ab aap share kar sakte hain.');
    }
};

window.toggleDashboardUtilityMenu = async function(forceOpen) {
    const drawer = document.getElementById('toursetu-utility-drawer');
    if (!drawer) return;
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : drawer.style.display !== 'flex';
    drawer.style.display = shouldOpen ? 'flex' : 'none';
    if (!shouldOpen) return;
    const linkInput = document.getElementById('toursetu-referral-link');
    const statsEl = document.getElementById('toursetu-referral-stats');
    try {
        const code = await getMyReferralCode();
        if (linkInput) linkInput.value = window.location.origin + window.location.pathname + '?ref=' + encodeURIComponent(code);
        const { data, error: statsError } = await getClient().rpc('get_referral_dashboard_stats');
        if (statsError) throw statsError;
        const row = Array.isArray(data) ? (data[0] || {}) : (data || {});
        if (statsEl) {
            statsEl.innerHTML = '🔗 Link visits: <b>' + Number(row.referral_visits || 0) + '</b><br>🔐 Login events: <b>' + Number(row.login_events || 0) + '</b><br>👥 Referred users: <b>' + Number(row.referred_users || 0) + '</b><br>💰 Referral earnings: <b>₹' + Number(row.referral_earnings || 0).toLocaleString('en-IN') + '</b>';
        }
    } catch (e) {
        if (linkInput) linkInput.value = 'Referral link unavailable until referral database migration is applied.';
        if (statsEl) statsEl.innerText = 'Referral analytics will appear here after the Supabase referral migration is applied.';
    }
};

window.mountDashboardUtilityMenu = function(role) {
    const existing = document.getElementById('toursetu-utility-menu-root');
    if (existing) existing.remove();
    const root = document.createElement('div');
    root.id = 'toursetu-utility-menu-root';
    const accountLabel = role === 'hotel' ? 'Hotel Owner' : role === 'agency' ? 'Agency' : 'Customer';
    root.innerHTML = '<button onclick="toggleDashboardUtilityMenu()" aria-label="Open menu" style="position:fixed;left:14px;top:14px;z-index:1000000;width:42px;height:42px;border-radius:50%;border:2px solid #ff9f43;background:#2d3436;color:white;font-size:15px;font-weight:900;letter-spacing:2px;box-shadow:0 5px 18px rgba(0,0,0,.25);cursor:pointer;">••</button>' +
        '<div id="toursetu-utility-drawer" style="display:none;position:fixed;left:0;top:0;bottom:0;width:min(360px,92vw);z-index:999999;background:#fff;box-shadow:12px 0 35px rgba(0,0,0,.22);padding:26px 20px;box-sizing:border-box;overflow-y:auto;font-family:Inter,sans-serif;">' +
        '<div style="display:flex;justify-content:flex-end;align-items:center;margin-bottom:18px;"><button onclick="toggleDashboardUtilityMenu(false)" aria-label="Close menu" style="width:36px;height:36px;border-radius:50%;background:#f1f2f6;color:#2d3436;font-size:20px;border:0;cursor:pointer;">×</button></div>' +
        '<div style="padding:16px;background:#fff8ef;border:1px solid #ffd39b;border-radius:12px;margin-bottom:16px;"><div style="font-weight:900;color:#e67e22;">🔗 Your Specific Referral Link</div><p style="font-size:12px;color:#666;line-height:1.5;margin:8px 0;">Is link ko share karne par referral attribution save hoga. Eligible paid booking par platform commission ka 10% referral earning mein record hoga.</p><input id="toursetu-referral-link" readonly value="Generating..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;font-size:11px;background:white;"><div style="display:flex;gap:8px;margin-top:9px;"><button onclick="copyMyReferralLink()" style="flex:1;background:#ff9f43;color:white;padding:10px;">COPY LINK</button><button onclick="shareMyReferralLink()" style="flex:1;background:#2d3436;color:white;padding:10px;">SHARE</button></div><div id="toursetu-referral-stats" style="margin-top:12px;padding-top:10px;border-top:1px solid #f0d9b5;font-size:12px;color:#555;">Loading referral analytics...</div></div>' +
        '<div style="display:flex;flex-direction:column;gap:10px;width:100%;">' +
        '<button onclick="openTourSetuLegalPanel(\'referral\')" style="width:100%;text-align:left;padding:14px;background:#fff3e0;border:1px solid #ffd39b;font-weight:800;box-sizing:border-box;cursor:pointer;">🔗 Referral Program & Commission Flow</button>' +
        '<button onclick="openTourSetuLegalPanel(\'terms\')" style="width:100%;text-align:left;padding:14px;background:#f8f9fa;border:1px solid #e5e5e5;font-weight:700;box-sizing:border-box;cursor:pointer;">📄 Terms & Conditions</button>' +
        '<button onclick="openTourSetuLegalPanel(\'privacy\')" style="width:100%;text-align:left;padding:14px;background:#f8f9fa;border:1px solid #e5e5e5;font-weight:700;box-sizing:border-box;cursor:pointer;">🔒 Privacy Policy</button>' +
        '</div></div>';
    document.body.appendChild(root);
};

window.openTourSetuLegalPanel = function(type) {
    const existing = document.getElementById('toursetu-legal-modal');
    if (existing) existing.remove();
    const content = {
        referral: '<div style="font-family:Arial,sans-serif;">' +
            '<div style="text-align:center;margin-bottom:18px;"><div style="font-size:30px;">🔗</div><h2 style="margin:4px 0;color:#2d3436;">TourSetu Referral Program</h2><p style="margin:0;color:#666;font-size:13px;">User A shares a personal referral link → User B joins and completes an eligible paid booking → User A receives 10% of the platform commission.</p></div>' +
            '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin:20px 0;">' +
                '<div style="width:100%;padding:14px;border:2px solid #ff9f43;border-radius:12px;background:#fff8ef;text-align:center;"><b>👤 USER A</b><br><span style="font-size:12px;color:#666;">Gets a unique referral link</span><br><code style="font-size:11px;">toursetu.pages.dev/?ref=TS-XXXXXXXXXX</code></div>' +
                '<div style="font-size:24px;color:#ff9f43;">↓ SHARE LINK ↓</div>' +
                '<div style="width:100%;padding:14px;border:2px solid #3498db;border-radius:12px;background:#f4faff;text-align:center;"><b>👤 USER B</b><br><span style="font-size:12px;color:#666;">Opens the link, signs in/signs up and makes a booking</span></div>' +
                '<div style="font-size:24px;color:#ff9f43;">↓ PAYMENT SUCCESS ↓</div>' +
                '<div style="width:100%;padding:14px;border:2px solid #2ecc71;border-radius:12px;background:#f3fff7;text-align:center;"><b>💳 ELIGIBLE PAID BOOKING</b><br><span style="font-size:12px;color:#666;">TourSetu records the payment and referral attribution</span></div>' +
                '<div style="display:flex;width:100%;gap:10px;flex-wrap:wrap;justify-content:center;">' +
                    '<div style="flex:1;min-width:210px;padding:14px;border-radius:12px;background:#fafafa;border:1px solid #ddd;text-align:center;"><b>🏢 AGENCY BOOKING</b><br><span style="font-size:12px;">Platform commission = <b>15%</b><br>User A gets <b>10% of that 15%</b><br><strong>Effective referral earning = 1.5% of payment</strong></span></div>' +
                    '<div style="flex:1;min-width:210px;padding:14px;border-radius:12px;background:#fafafa;border:1px solid #ddd;text-align:center;"><b>🏨 HOTEL BOOKING</b><br><span style="font-size:12px;">Platform commission = <b>4%</b><br>User A gets <b>10% of that 4%</b><br><strong>Effective referral earning = 0.4% of payment</strong></span></div>' +
                '</div>' +
                '<div style="width:100%;padding:14px;border:2px solid #9b59b6;border-radius:12px;background:#fbf6ff;text-align:center;"><b>💰 USER A REFERRAL EARNING</b><br><span style="font-size:12px;color:#666;">The earning is recorded in the TourSetu referral ledger after the eligible payment is recorded as paid.</span></div>' +
            '</div>' +
            '<div style="padding:14px;background:#f8f9fa;border-radius:12px;font-size:12px;color:#555;"><b>Example — Agency:</b> ₹10,000 payment → 15% platform commission = ₹1,500 → 10% of ₹1,500 = <b>₹150 referral earning for User A</b>.<br><br><b>Example — Hotel:</b> ₹10,000 payment → 4% platform commission = ₹400 → 10% of ₹400 = <b>₹40 referral earning for User A</b>.</div>' +
            '<h3 style="margin-bottom:8px;">Referral Rules</h3><ul style="font-size:12px;color:#555;line-height:1.7;"><li>Referral attribution is linked to the referral code used by User B.</li><li>The reward is created only for an eligible paid booking.</li><li>A booking can create the referral reward only once.</li><li>Referral earnings are recorded in the platform ledger; actual payout/withdrawal is subject to TourSetu payout rules and availability.</li><li>Self-referrals are not eligible.</li></ul>' +
        '</div>',
        terms: window.currentTourSetuUser?.user_metadata?.role === 'agency' ? agencyPartnerTermsHtml() : customerMarketplaceTermsHtml(),
        privacy: customerPrivacyPolicyHtml()
    };
    const modal=document.createElement('div');
    modal.id='toursetu-legal-modal';
    modal.style.cssText='position:fixed;inset:0;z-index:1000001;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:20px;';
    modal.innerHTML='<div style="background:white;max-width:650px;width:100%;max-height:85vh;overflow:auto;border-radius:16px;padding:28px;line-height:1.65;color:#444;">'+(content[type]||content.privacy)+'<button onclick="document.getElementById(\'toursetu-legal-modal\').remove()" style="display:block;margin:20px auto 0;background:#ff9f43;color:white;padding:11px 25px;">CLOSE</button></div>';
    document.body.appendChild(modal);
};

captureReferralCodeFromUrl();

function toggleMode() { 
    isLoginMode = !isLoginMode; 
    renderAuthUI(); 
}

function toggleBusinessFields() {
    const role = document.getElementById('role')?.value || 'customer';
    const businessFields = document.getElementById('business-fields');
    const agencyFields = document.getElementById('agency-basic-fields');
    const hotelFields = document.getElementById('hotel-basic-fields');
    const hotelVerificationFields = document.getElementById('hotel-verification-fields');
    const agencyStep1 = document.getElementById('agency-step-1');
    const agencyStep2 = document.getElementById('agency-step-2');

    const isAgency = role === 'agency';
    const isHotel = role === 'hotel';

    if (businessFields) {
        businessFields.style.display = (isAgency || isHotel) ? 'block' : 'none';
    }
    if (agencyFields) agencyFields.style.display = isAgency ? 'block' : 'none';
    if (hotelFields) hotelFields.style.display = isHotel ? 'block' : 'none';
    if (hotelVerificationFields) hotelVerificationFields.style.display = isHotel ? 'block' : 'none';

    // Agency-only KYC steps must never appear for Hotel Partner.
    if (agencyStep1) agencyStep1.style.display = isAgency ? 'block' : 'none';
    if (agencyStep2 && !isAgency) agencyStep2.style.display = 'none';
}

/* =========================================
   3. AUTH & DASHBOARD LOGIC
   ========================================= */

let authStateListenerStarted = false;

function isPasswordRecoveryUrl() {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    return /(?:^|[&#?])type=recovery(?:&|#|$)/i.test(hash + search);
}

function clearAuthRecoveryUrl() {
    try { window.history.replaceState({}, document.title, window.location.pathname); } catch (e) {}
}

function startAuthStateListener() {
    if (authStateListenerStarted) return;
    authStateListenerStarted = true;
    const client = getClient();
    if (!client) return;
    client.auth.onAuthStateChange(async (event) => {
        if (event === 'PASSWORD_RECOVERY') renderPasswordResetUI();
    });
}

async function initApp() {
    console.log("TourSetu Booting Up...");
    const client = getClient();
    if (!client) return;
    startAuthStateListener();

    if (isPasswordRecoveryUrl()) {
        renderPasswordResetUI();
        return;
    }

    const { data: { user }, error } = await client.auth.getUser();
    if (user && !error) await showDashboard(user);
    else renderAuthUI();
}

async function showDashboard(user) {
    window.currentTourSetuUser = user;
    const role=user?.user_metadata?.role||'customer';
    if(role==='agency'){
        const termsAccepted = await ensureAgencyTermsAccepted(user);
        if (!termsAccepted) return;
        const verification=await getAgencyVerification(user.id).catch(()=>null);
        window.currentAgencyVerificationStatus=verification?.status||'pending';
        if(typeof renderAgencyDashboard==="function")renderAgencyDashboard(user);
        else document.getElementById('app').innerHTML='<div style="padding:20px;"><h2>Agency Dashboard</h2><p>Welcome, '+user.email+'</p><button onclick="handleLogout()">Logout</button></div>';
        return;
    }
    if(role==='hotel'){
        const hotelVerification=await getHotelVerification(user.id).catch(()=>null);
        window.currentHotelVerificationStatus=hotelVerification?.status||'pending';
        if(typeof initHotelDashboard==="function")await initHotelDashboard(user);
        else if(typeof renderHotelDashboard==="function")renderHotelDashboard(user);
        else document.getElementById('app').innerHTML='<div style="padding:20px;"><h2>Hotel Dashboard</h2><p>Welcome, '+user.email+'</p><button onclick="handleLogout()">Logout</button></div>';
    }else{
        if(typeof renderCustomerHomepage==="function")renderCustomerHomepage(user);
        else document.getElementById('app').innerHTML='<div style="padding:20px;"><h2>Traveler Home</h2><p>Welcome, '+user.email+'</p><button onclick="handleLogout()">Logout</button></div>';
    }
}

async function handleLogout() {
    await getClient().auth.signOut();
    window.location.reload();
}

window.confirmHotelLogout = async function() {
    const old = document.getElementById('hotel-logout-confirm-modal');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'hotel-logout-confirm-modal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:1000000;background:rgba(15,23,42,.68);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;';

    overlay.innerHTML = `
        <div style="width:min(430px,100%);background:#fff;border-radius:22px;padding:30px;box-shadow:0 25px 80px rgba(0,0,0,.30);font-family:Inter,sans-serif;text-align:center;">
            <div style="width:64px;height:64px;border-radius:18px;background:#fff7ed;margin:0 auto 15px;display:flex;align-items:center;justify-content:center;font-size:31px;">🚪</div>
            <h2 style="margin:0 0 8px;color:#1e293b;font-size:23px;">Logout from Hotel Dashboard?</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.55;">Are you sure you want to logout from your Hotel Partner account?</p>
            <div style="display:flex;gap:12px;">
                <button type="button" id="hotel-logout-deny" style="flex:1;padding:13px;border:1px solid #cbd5e1;border-radius:11px;background:#f8fafc;color:#334155;font-weight:900;cursor:pointer;">DENY</button>
                <button type="button" id="hotel-logout-confirm" style="flex:1;padding:13px;border:0;border-radius:11px;background:#e74c3c;color:#fff;font-weight:900;cursor:pointer;box-shadow:0 8px 18px rgba(231,76,60,.22);">CONFIRM</button>
            </div>
        </div>`;

    document.body.appendChild(overlay);

    overlay.querySelector('#hotel-logout-deny').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.remove();
    });

    overlay.querySelector('#hotel-logout-confirm').onclick = async () => {
        const btn = overlay.querySelector('#hotel-logout-confirm');
        btn.disabled = true;
        btn.textContent = 'LOGGING OUT...';
        btn.style.opacity = '.7';

        try {
            const client = getClient();
            if (client) await client.auth.signOut();
        } finally {
            window.location.reload();
        }
    };
};

/* =========================================
   4. UI RENDERING (Login / Signup)
   ========================================= */

function renderAuthUI() {
    const app=document.getElementById('app'); if(!app)return;
    app.innerHTML=`
      <div class="card" style="max-width:520px;margin:50px auto;padding:32px;background:white;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,.1);border-radius:15px;font-family:Inter,sans-serif;">
        <h1 style="color:#ff9f43;margin-bottom:8px;">TourSetu</h1>
        <h2 id="form-title" style="margin-bottom:18px;">${isLoginMode?"Welcome Back":"Create Account"}</h2>
        <input type="email" id="email" placeholder="Email Address" autocomplete="email" style="width:100%;padding:12px;margin:8px 0;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;">
        <input type="password" id="password" placeholder="Password" autocomplete="${isLoginMode?"current-password":"new-password"}" style="width:100%;padding:12px;margin:8px 0;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;">
        ${isLoginMode?'<div style="text-align:right;margin:-2px 0 8px;"><button type="button" onclick="handleForgotPassword()" style="background:none;border:0;color:#ff9f43;font-size:13px;font-weight:700;cursor:pointer;padding:4px 0;">Forgot Password?</button></div>':''}
        <div id="role-selection" style="display:${isLoginMode?"none":"block"};margin:12px 0;">
          <label style="display:block;text-align:left;margin:8px 0 5px;font-size:12px;color:#666;font-weight:700;">REGISTER AS</label>
          <select id="role" onchange="toggleBusinessFields()" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;">
            <option value="customer">Traveler</option><option value="agency">Travel Agency</option><option value="hotel">Hotel Partner 🏨</option>
          </select>
        </div>
        <div id="business-fields" style="display:none;text-align:left;margin-top:12px;border-top:1px solid #eee;padding-top:12px;">
          <div id="agency-basic-fields">
            <label>Email Address</label><input type="email" id="agency-email" readonly placeholder="Email Address" style="width:100%;padding:12px;margin:5px 0;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;background:#f8f9fa;">
            <label>Phone / Contact No.</label><input type="tel" id="biz-phone" placeholder="Phone / Contact No." style="width:100%;padding:12px;margin:5px 0;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;">
            <label>GST Number</label><input type="text" id="gst-no" placeholder="GST Number" style="width:100%;padding:12px;margin:5px 0;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;">
            <label>Business Registration No.</label><input type="text" id="biz-reg" placeholder="Business Registration No." style="width:100%;padding:12px;margin:5px 0;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;">
          </div>
          <div id="hotel-basic-fields" style="display:none;">
            <label>Hotel Front Desk / Owner Phone (Optional)</label>
            <input type="tel" id="hotel-phone" placeholder="Hotel Front Desk / Owner Phone" style="width:100%;padding:12px;margin:5px 0;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;">
          </div>
          <div id="hotel-verification-fields" style="display:none;margin-top:14px;">
            <h3 style="margin:8px 0;color:#2d3436;font-size:16px;">Hotel Verification Documents — Optional</h3>
            <p style="font-size:12px;color:#777;margin:0 0 10px;">Upload clear photos or PDF copies if available. All five documents are optional.</p>
            <div class="agency-doc-grid">
              <label>Uttarakhand Tourism / UTBM Hotel Registration<input type="file" id="hotel-doc-uttarakhand-registration" accept="image/*,.pdf"></label>
              <label>Trade License / Local Authority License<input type="file" id="hotel-doc-trade-license" accept="image/*,.pdf"></label>
              <label>GST Certificate / MSME Udyam<input type="file" id="hotel-doc-gst-udyam" accept="image/*,.pdf"></label>
              <label>Fire Safety NOC<input type="file" id="hotel-doc-fire-noc" accept="image/*,.pdf"></label>
              <label>Police NOC<input type="file" id="hotel-doc-police-noc" accept="image/*,.pdf"></label>
            </div>
            <p style="font-size:11px;color:#888;margin:10px 0 0;">You can continue without these documents. Your hotel remains hidden from customers until admin approval.</p>
          </div>
          <div id="agency-step-1" style="margin-top:14px;">
            <h3 style="margin:8px 0;color:#2d3436;font-size:16px;">Step 1 — Business & KYC Documents</h3>
            <p style="font-size:12px;color:#777;margin:0 0 10px;">Upload clear photos or PDF copies.</p>
            <div class="agency-doc-grid">
              <label>GST Number document/photo<input type="file" id="doc-gst" accept="image/*,.pdf"></label>
              <label>Business Registration document/photo<input type="file" id="doc-business-reg" accept="image/*,.pdf"></label>
              <label>UTDM Registration Certificate<input type="file" id="doc-utdm-certificate" accept="image/*,.pdf"></label>
              <label>PAN Card<input type="file" id="doc-pan" accept="image/*,.pdf"></label>
              <label>Aadhaar Card<input type="file" id="doc-aadhaar" accept="image/*,.pdf"></label>
              <label>Cancelled Cheque / Bank Passbook<input type="file" id="doc-cancelled-cheque" accept="image/*,.pdf"></label>
            </div>
            <button type="button" onclick="goToAgencyDocumentStep2()" style="background:#ff9f43;color:white;width:100%;padding:13px;border:0;border-radius:8px;font-weight:800;cursor:pointer;margin-top:14px;">NEXT</button>
          </div>
          <div id="agency-step-2" style="display:none;margin-top:14px;">
            <h3 style="margin:8px 0;color:#2d3436;font-size:16px;">Step 2 — Commercial Vehicle Documents</h3>
            <div class="agency-doc-grid">
              <label>Commercial RC (Registration Certificate)<input type="file" id="doc-commercial-rc" accept="image/*,.pdf"></label>
              <label>AITP / Commercial Permit copy<input type="file" id="doc-aitp-permit" accept="image/*,.pdf"></label>
              <label>Vehicle Insurance copy<input type="file" id="doc-vehicle-insurance" accept="image/*,.pdf"></label>
              <label>Vehicle Fitness Certificate copy<input type="file" id="doc-fitness" accept="image/*,.pdf"></label>
              <label>Commercial Driving License copy<input type="file" id="doc-commercial-license" accept="image/*,.pdf"></label>
              <label>Police Verification Certificate / ID Proof<input type="file" id="doc-police-id" accept="image/*,.pdf"></label>
            </div>
            <div style="display:flex;gap:10px;margin-top:14px;">
              <button type="button" onclick="backToAgencyDocumentStep1()" style="background:#636e72;color:white;flex:1;padding:13px;border:0;border-radius:8px;font-weight:800;cursor:pointer;">BACK</button>
              <button type="button" id="agency-register-btn" onclick="handleAuth()" style="background:#ff9f43;color:white;flex:1;padding:13px;border:0;border-radius:8px;font-weight:800;cursor:pointer;">REGISTER</button>
            </div>
          </div>
        </div>
        <button id="auth-btn" onclick="handleAuth()" style="background:#ff9f43;color:white;width:100%;padding:14px;border-radius:8px;font-weight:bold;cursor:pointer;border:none;margin-top:18px;font-size:16px;">${isLoginMode?"Login":"Register"}</button>
        <p style="margin-top:18px;font-size:14px;color:#636e72;">${isLoginMode?"Don't have an account?":"Already have account?"} <span onclick="toggleMode()" style="color:#ff9f43;cursor:pointer;font-weight:bold;">${isLoginMode?"Create Account":"Login"}</span></p>
        <div id="status" style="margin-top:15px;font-size:13px;font-weight:bold;"></div>
      </div>`;
    const emailInput=document.getElementById('email'),agencyEmail=document.getElementById('agency-email');
    if(emailInput&&agencyEmail){agencyEmail.value=emailInput.value;emailInput.addEventListener('input',()=>agencyEmail.value=emailInput.value);}
}
window.goToAgencyDocumentStep2=function(){
    const required=[['gst-no','GST Number'],['biz-reg','Business Registration No.'],['biz-phone','Phone / Contact No.'],['doc-gst','GST document/photo'],['doc-business-reg','Business Registration document/photo'],['doc-utdm-certificate','UTDM Registration Certificate'],['doc-pan','PAN Card'],['doc-aadhaar','Aadhaar Card'],['doc-cancelled-cheque','Cancelled Cheque / Bank Passbook']];
    for(const [id,label] of required){const el=document.getElementById(id);if(!el||(el.type==='file'?!el.files?.[0]:!el.value.trim())){document.getElementById('status').innerText='⚠️ Please provide: '+label;el?.focus();return;}}
    document.getElementById('agency-step-1').style.display='none';document.getElementById('agency-step-2').style.display='block';document.getElementById('status').innerText='';
};
window.backToAgencyDocumentStep1=function(){document.getElementById('agency-step-2').style.display='none';document.getElementById('agency-step-1').style.display='block';document.getElementById('status').innerText='';};
window.toggleBusinessFields=function(){
    const role=document.getElementById('role')?.value;
    const businessFields=document.getElementById('business-fields');
    const agencyBasic=document.getElementById('agency-basic-fields');
    const hotelBasic=document.getElementById('hotel-basic-fields');
    const agencyStep1=document.getElementById('agency-step-1');
    const agencyStep2=document.getElementById('agency-step-2');
    const hotelDocs=document.getElementById('hotel-verification-fields');
    if(!businessFields)return;
    if(role==='agency'){
        businessFields.style.display='block';
        if(agencyBasic)agencyBasic.style.display='block';
        if(hotelBasic)hotelBasic.style.display='none';
        if(agencyStep1)agencyStep1.style.display='block';
        if(agencyStep2)agencyStep2.style.display='none';
        if(hotelDocs)hotelDocs.style.display='none';
        const agencyEmail=document.getElementById('agency-email');
        if(agencyEmail)agencyEmail.value=document.getElementById('email')?.value||'';
        const genericAuth=document.getElementById('auth-btn');
        if(genericAuth)genericAuth.style.display='none';
    }else if(role==='hotel'){
        businessFields.style.display='block';
        if(agencyBasic)agencyBasic.style.display='none';
        if(hotelBasic)hotelBasic.style.display='block';
        if(agencyStep1)agencyStep1.style.display='none';
        if(agencyStep2)agencyStep2.style.display='none';
        if(hotelDocs)hotelDocs.style.display='block';
        const genericAuth=document.getElementById('auth-btn');
        if(genericAuth)genericAuth.style.display='block';
    }else{
        businessFields.style.display='none';
        if(agencyBasic)agencyBasic.style.display='none';
        if(hotelBasic)hotelBasic.style.display='none';
        if(agencyStep1)agencyStep1.style.display='none';
        if(agencyStep2)agencyStep2.style.display='none';
        if(hotelDocs)hotelDocs.style.display='none';
        const genericAuth=document.getElementById('auth-btn');
        if(genericAuth)genericAuth.style.display='block';
    }
};
async function handleForgotPassword() {
    const status = document.getElementById('status');
    const email = document.getElementById('email')?.value.trim();
    if (!email) {
        if (status) status.innerHTML = '<div style="background:#fff4e6;padding:12px;border-radius:10px;border:1px solid #ffd8a8;color:#b45309;text-align:left;">⚠️ Please enter your email address first.</div>';
        document.getElementById('email')?.focus();
        return;
    }
    const client = getClient();
    if (!client) { if (status) status.innerText = '❌ Supabase not initialized'; return; }
    if (status) status.innerText = '⏳ Sending password reset email...';
    try {
        const redirectTo = window.location.origin + window.location.pathname;
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        if (status) status.innerHTML = '<div style="background:#eafaf1;padding:14px;border-radius:10px;border:1px solid #b7ebc6;color:#1e7e34;text-align:left;"><strong>📩 Password reset email sent</strong><br>Please check <b>'+email+'</b> and open the reset link.</div>';
    } catch (err) {
        console.error('Password reset request error:', err);
        if (status) status.innerText = '❌ ' + (err?.message || 'Could not send password reset email.');
    }
}

function renderPasswordResetUI() {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = `
      <div class="card" style="max-width:520px;margin:50px auto;padding:32px;background:white;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,.1);border-radius:15px;font-family:Inter,sans-serif;">
        <h1 style="color:#ff9f43;margin-bottom:8px;">TourSetu</h1>
        <h2 style="margin-bottom:8px;">Reset Password</h2>
        <p style="color:#636e72;font-size:13px;line-height:1.5;">Enter your new password below. This will become the password for this TourSetu account.</p>
        <input type="password" id="new-password" placeholder="New Password" autocomplete="new-password" style="width:100%;padding:12px;margin:8px 0;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;">
        <input type="password" id="confirm-new-password" placeholder="Confirm New Password" autocomplete="new-password" style="width:100%;padding:12px;margin:8px 0;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;">
        <button type="button" onclick="handlePasswordUpdate()" style="background:#ff9f43;color:white;width:100%;padding:14px;border-radius:8px;font-weight:bold;cursor:pointer;border:none;margin-top:12px;font-size:16px;">Set New Password</button>
        <button type="button" onclick="clearAuthRecoveryUrl();isLoginMode=true;renderAuthUI();" style="background:#f1f2f6;color:#2d3436;width:100%;padding:12px;border-radius:8px;font-weight:700;cursor:pointer;border:none;margin-top:10px;">Back to Login</button>
        <div id="status" style="margin-top:15px;font-size:13px;font-weight:bold;"></div>
      </div>`;
}

async function handlePasswordUpdate() {
    const status = document.getElementById('status');
    const newPassword = document.getElementById('new-password')?.value || '';
    const confirmPassword = document.getElementById('confirm-new-password')?.value || '';
    if (newPassword.length < 6) { if (status) status.innerText = '⚠️ Password must be at least 6 characters.'; return; }
    if (newPassword !== confirmPassword) { if (status) status.innerText = '⚠️ New password and confirm password do not match.'; return; }

    const client = getClient();
    if (!client) { if (status) status.innerText = '❌ Supabase not initialized'; return; }
    const button = document.querySelector('button[onclick="handlePasswordUpdate()"]');
    if (button) button.disabled = true;
    if (status) status.innerText = '⏳ Updating password...';

    try {
        const { error } = await client.auth.updateUser({ password: newPassword });
        if (error) throw error;
        await client.auth.signOut();
        clearAuthRecoveryUrl();
        isLoginMode = true;
        renderAuthUI();
        const loginStatus = document.getElementById('status');
        if (loginStatus) loginStatus.innerHTML = '<div style="background:#eafaf1;padding:14px;border-radius:10px;border:1px solid #b7ebc6;color:#1e7e34;text-align:left;"><strong>✅ Password updated successfully.</strong><br>Your account password is now the new password you just set. Please login with it.</div>';
    } catch (err) {
        console.error('Password update error:', err);
        if (status) status.innerText = '❌ ' + (err?.message || 'Could not update password.');
        if (button) button.disabled = false;
    }
}

async function resendConfirmationEmail(email) {
    const client = getClient();
    if (!client || !email) throw new Error('Please enter your email address.');
    const redirectTo = window.location.origin + window.location.pathname;
    const { error } = await client.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: redirectTo }
    });
    if (error) throw error;
}

async function resendConfirmationFromLogin() {
    const email = document.getElementById('email')?.value.trim();
    const status = document.getElementById('status');
    try {
        await resendConfirmationEmail(email);
        if (status) status.innerText = '✅ Confirmation email sent again. Please check your inbox.';
    } catch (e) {
        if (status) status.innerText = '❌ ' + (e?.message || e);
    }
}

/* =========================================
   5. AUTHENTICATION + AGENCY KYC
   ========================================= */
const AGENCY_KYC_BUCKET='agency-verification-documents';
const AGENCY_KYC_FILES={gst_document_path:'doc-gst',business_reg_document_path:'doc-business-reg',utdb_registration_certificate_path:'doc-utdm-certificate',pan_card_path:'doc-pan',aadhaar_card_path:'doc-aadhaar',cancelled_cheque_or_bank_passbook_path:'doc-cancelled-cheque',commercial_rc_path:'doc-commercial-rc',aitp_commercial_permit_path:'doc-aitp-permit',vehicle_insurance_path:'doc-vehicle-insurance',fitness_certificate_path:'doc-fitness',commercial_driving_license_path:'doc-commercial-license',police_verification_id_proof_path:'doc-police-id'};
function getSelectedAgencyDocuments(){const files={};for(const [dbField,inputId] of Object.entries(AGENCY_KYC_FILES)){const input=document.getElementById(inputId);files[dbField]=input?.files?.[0]||null;}return files;}
function validateAgencyDocuments(files){const labels={gst_document_path:'GST Number document/photo',business_reg_document_path:'Business Registration document/photo',utdb_registration_certificate_path:'UTDM Registration Certificate',pan_card_path:'PAN Card',aadhaar_card_path:'Aadhaar Card',cancelled_cheque_or_bank_passbook_path:'Cancelled Cheque / Bank Passbook',commercial_rc_path:'Commercial RC',aitp_commercial_permit_path:'AITP / Commercial Permit',vehicle_insurance_path:'Vehicle Insurance',fitness_certificate_path:'Vehicle Fitness Certificate',commercial_driving_license_path:'Commercial Driving License',police_verification_id_proof_path:'Police Verification Certificate / ID Proof'};for(const [key,label] of Object.entries(labels)){if(!files[key])return'Please upload: '+label;if(files[key].size>10*1024*1024)return label+' must be 10 MB or smaller.';}return'';}
function safeFileExtension(file){const match=String(file?.name||'').toLowerCase().match(/\.([a-z0-9]+)$/);return match?match[1]:'bin';}
async function uploadAgencyDocuments(userId,files){const bucket=getClient().storage.from(AGENCY_KYC_BUCKET),uploadedPaths={};for(const [dbField,file] of Object.entries(files)){const path=userId+'/'+dbField.replace(/_path$/,'')+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+safeFileExtension(file);const {data,error}=await bucket.upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type||undefined});if(error)throw new Error('Upload failed for '+dbField+': '+error.message);uploadedPaths[dbField]=data.path;}return uploadedPaths;}
async function getAgencyVerification(userId){const {data,error}=await getClient().from('agency_verification_requests').select('id,status,denial_reason,email,gst_no,business_reg_no,phone,created_at,updated_at').eq('user_id',userId).maybeSingle();if(error)throw error;return data;}
async function submitAgencyKYC(user){const files=getSelectedAgencyDocuments(),validationError=validateAgencyDocuments(files);if(validationError)throw new Error(validationError);const client=getClient();const {data:existing,error:existingError}=await client.from('agency_verification_requests').select('id,status').eq('user_id',user.id).maybeSingle();if(existingError)throw existingError;if(!existing)throw new Error('Agency verification request was not created. Please try registration again.');if(existing.status!=='pending')throw new Error('This agency verification request is already '+existing.status+'.');const paths=await uploadAgencyDocuments(user.id,files);const {error:saveError}=await client.rpc('save_agency_verification_documents',{p_gst_document_path:paths.gst_document_path,p_business_reg_document_path:paths.business_reg_document_path,p_utdb_registration_certificate_path:paths.utdb_registration_certificate_path,p_pan_card_path:paths.pan_card_path,p_aadhaar_card_path:paths.aadhaar_card_path,p_cancelled_cheque_or_bank_passbook_path:paths.cancelled_cheque_or_bank_passbook_path,p_commercial_rc_path:paths.commercial_rc_path,p_aitp_commercial_permit_path:paths.aitp_commercial_permit_path,p_vehicle_insurance_path:paths.vehicle_insurance_path,p_fitness_certificate_path:paths.fitness_certificate_path,p_commercial_driving_license_path:paths.commercial_driving_license_path,p_police_verification_id_proof_path:paths.police_verification_id_proof_path});if(saveError)throw saveError;}
const HOTEL_KYC_BUCKET='hotel-verification-documents';
const HOTEL_KYC_FILES={uttarakhand_tourism_utbm_registration_path:'hotel-doc-uttarakhand-registration',trade_license_local_authority_license_path:'hotel-doc-trade-license',gst_certificate_msme_udyam_path:'hotel-doc-gst-udyam',fire_safety_noc_path:'hotel-doc-fire-noc',police_noc_path:'hotel-doc-police-noc'};
function getSelectedHotelDocuments(){const files={};for(const [dbField,inputId] of Object.entries(HOTEL_KYC_FILES)){const input=document.getElementById(inputId);files[dbField]=input?.files?.[0]||null;}return files;}
function validateHotelDocuments(files){const labels={uttarakhand_tourism_utbm_registration_path:'Uttarakhand Tourism / UTBM Hotel Registration',trade_license_local_authority_license_path:'Trade License / Local Authority License',gst_certificate_msme_udyam_path:'GST Certificate / MSME Udyam',fire_safety_noc_path:'Fire Safety NOC',police_noc_path:'Police NOC'};for(const [key,label] of Object.entries(labels)){if(files[key]&&files[key].size>10*1024*1024)return label+' must be 10 MB or smaller.';}return '';}
async function uploadHotelDocuments(userId,files){const bucket=getClient().storage.from(HOTEL_KYC_BUCKET),uploadedPaths={};for(const [dbField,file] of Object.entries(files)){if(!file)continue;const path=userId+'/'+dbField.replace(/_path$/,'')+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+safeFileExtension(file);const {data,error}=await bucket.upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type||undefined});if(error)throw new Error('Upload failed for '+dbField+': '+error.message);uploadedPaths[dbField]=data.path;}return uploadedPaths;}
async function getHotelVerification(userId){const {data,error}=await getClient().from('hotel_verification_requests').select('id,status,denial_reason,email,phone,created_at,updated_at').eq('user_id',userId).maybeSingle();if(error)throw error;return data;}
async function submitHotelKYC(user){const files=getSelectedHotelDocuments(),validationError=validateHotelDocuments(files);if(validationError)throw new Error(validationError);const client=getClient();const {error:ensureError}=await client.rpc('ensure_my_hotel_verification_request');if(ensureError)throw ensureError;const paths=await uploadHotelDocuments(user.id,files);if(Object.keys(paths).length===0)return;const {error:saveError}=await client.rpc('save_hotel_verification_documents',{p_uttarakhand_tourism_utbm_registration_path:paths.uttarakhand_tourism_utbm_registration_path||null,p_trade_license_local_authority_license_path:paths.trade_license_local_authority_license_path||null,p_gst_certificate_msme_udyam_path:paths.gst_certificate_msme_udyam_path||null,p_fire_safety_noc_path:paths.fire_safety_noc_path||null,p_police_noc_path:paths.police_noc_path||null});if(saveError)throw saveError;}
async function handleAuth(){
    const status=document.getElementById('status'),role=!isLoginMode?document.getElementById('role')?.value:null,btn=document.getElementById('agency-register-btn')||document.getElementById('auth-btn'),email=document.getElementById('email')?.value.trim(),password=document.getElementById('password')?.value||'';
    if(!email||!password){if(status)status.innerText='⚠️ Please enter email and password';return;}
    const client=getClient();if(!client){if(status)status.innerText='❌ Supabase not initialized';return;}
    if(!isLoginMode&&role==='agency'){
        const phone=document.getElementById('biz-phone')?.value.trim(),gst=document.getElementById('gst-no')?.value.trim(),regNo=document.getElementById('biz-reg')?.value.trim(),step2=document.getElementById('agency-step-2');
        if(!phone||!gst||!regNo){if(status)status.innerText='⚠️ Please fill Email, Phone, GST Number and Business Registration No.';return;}
        if(step2&&step2.style.display==='none'){if(status)status.innerText='⚠️ Click NEXT and complete all vehicle documents first.';return;}
    }
    if(btn)btn.disabled=true;if(status)status.innerText='⏳ Processing...';
    try{
        if(isLoginMode){
            const {data,error}=await client.auth.signInWithPassword({email,password});
            if(error){
                const msg=String(error.message||'');
                if(/email not confirmed/i.test(msg)||/email.*confirm/i.test(msg)){
                    if(status)status.innerHTML='<div style="background:#fff4e6;padding:14px;border-radius:10px;border:1px solid #ffd8a8;color:#b45309;text-align:left;"><strong>✉️ Email confirmation required</strong><br>Please confirm <b>'+email+'</b> using the link sent by TourSetu, then login again.<br><button type="button" onclick="resendConfirmationFromLogin()" style="margin-top:10px;background:#ff9f43;color:white;border:0;border-radius:7px;padding:9px 12px;font-weight:700;cursor:pointer;">Resend Confirmation Email</button></div>';
                    return;
                }
                throw error;
            }
            if(data?.user){window.identifyOneSignalUser(data.user.id);}
            await recordReferralLogin();await showDashboard(data.user);return;
        }
        const metadata={role,is_approved:role==='customer'};
        if(role==='agency'){metadata.gst=document.getElementById('gst-no')?.value.trim()||'';metadata.reg_no=document.getElementById('biz-reg')?.value.trim()||'';metadata.phone=document.getElementById('biz-phone')?.value.trim()||'';metadata.license='';}
        else if(role==='hotel'){metadata.phone=document.getElementById('hotel-phone')?.value.trim()||'';metadata.business_name='';metadata.gst='';metadata.reg_no='';metadata.license='';}
        const redirectUrl=window.location.origin+window.location.pathname;
        const {data,error}=await client.auth.signUp({email,password,options:{data:metadata,emailRedirectTo:redirectUrl}});if(error)throw error;if(!data?.user)throw new Error('Account could not be created.');
        if(role==='agency'){
            if(!data.session){if(status)status.innerHTML='<div style="background:#fff4e6;padding:15px;border-radius:10px;border:1px solid #ffd8a8;color:#d9480f;text-align:left;"><strong>✉️ Email confirmation required</strong><br>Supabase has email confirmation enabled, so documents can only be uploaded after the account is signed in. Please confirm <b>'+email+'</b>, then login once to complete the KYC upload.<br><br><small>The agency request is already created in Supabase with <b>pending</b> status.</small></div>';return;}
            await submitAgencyKYC(data.user);if(status)status.innerText='✅ Registration submitted. Opening your Agency Dashboard...';await showDashboard(data.user);return;
        }
        if(role==='hotel'){
            if(!data.session){
                if(status)status.innerHTML='<div style="background:#fff4e6;padding:15px;border-radius:10px;border:1px solid #ffd8a8;color:#d9480f;text-align:left;"><strong>✉️ Email confirmation required</strong><br>Supabase email confirmation is enabled, so the Hotel Dashboard will open after you confirm <b>'+email+'</b> and login.<br><br><small>Your hotel verification request is already saved as <b>pending</b>. The documents are optional.</small></div>';
                return;
            }
            await submitHotelKYC(data.user);
            if(status)status.innerText='✅ Hotel account created. Opening your Hotel Dashboard...';
            await showDashboard(data.user);
            return;
        }
        if(data?.session)await showDashboard(data.user);else if(status)status.innerHTML='<div style="background:#fff4e6;padding:15px;border-radius:10px;border:1px solid #ffd8a8;color:#d9480f;text-align:left;"><strong>✉️ Email confirmation required</strong><br>We sent a confirmation link to <b>'+email+'</b>. Please open that email, click the confirmation link, and then login with your email and password.<br><br><small>This applies to Traveler, Travel Agency and Hotel Partner accounts.</small></div>';
    }catch(err){console.error('Auth/KYC error:',err);if(status)status.innerText='❌ '+(err?.message||err);}
    finally{if(btn)btn.disabled=false;}
}
/* =========================================
   6. CUSTOMER HOMEPAGE & BOOKING SYSTEM
   ========================================= */

async function renderCustomerHomepage(user, options = {}) {
    user = user || window.currentTourSetuUser;
    if (!options.skipTermsCheck) {
        const accepted = await ensureCustomerTermsAccepted(user);
        if (!accepted) return;
    }
    if (!options.skipPrivacyCheck) {
        const privacyAccepted = await ensureCustomerPrivacyAccepted(user);
        if (!privacyAccepted) return;
    }
    const app = document.getElementById('app');
    app.style.maxWidth = "100%";
    window.mountDashboardUtilityMenu('customer');
    
    // Get all unique states from locationData
    const stateOptions = Object.keys(locationData).sort().map(state => 
        `<option value="${state}">${state}</option>`
    ).join('');

    const destOptions = tourDestinations.map(d => 
        `<option value="${d}">${d}</option>`
    ).join('');

    app.innerHTML = `
        <div style="font-family:'Inter', sans-serif; background:#f4f7f6; min-height:100vh; margin:-20px;">
            <div style="background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80');
                    height:auto; min-height:480px; background-size:cover; background-position:center; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; padding:30px 20px;">
                <h1 style="font-size:2.8rem; margin-bottom:10px; text-align:center;">Find Your Perfect Match</h1>
                <p style="font-size:1.1rem; margin-bottom:25px; opacity:0.9;">Direct connections with verified local travel agencies & registered hotels</p>
                
                <div class="card" style="background:white; padding:25px; border-radius:20px; width:95%; max-width:1000px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                  
                  <!-- SEARCH TYPE SELECTION BOX (AGENCY vs HOTEL) -->
                  <div style="margin-bottom:20px; background:#f8f9fa; padding:12px 20px; border-radius:12px; border:2px solid #ff9f43; display:flex; align-items:center; gap:15px; justify-content:space-between; flex-wrap:wrap;">
                      <label style="color:#2d3436; font-weight:bold; font-size:14px; display:flex; align-items:center; gap:6px;">
                          🔍 <span>SELECT SEARCH TYPE:</span>
                      </label>
                      <div style="display:flex; gap:20px;">
                          <label style="cursor:pointer; font-weight:bold; color:#2d3436; font-size:15px; display:flex; align-items:center; gap:6px;">
                              <input type="radio" name="search-type" value="agency" checked onchange="toggleCustomerSearchType()" style="accent-color:#ff9f43; width:18px; height:18px; cursor:pointer;"> 
                              🎒 Agency Packages
                          </label>
                          <label style="cursor:pointer; font-weight:bold; color:#2d3436; font-size:15px; display:flex; align-items:center; gap:6px;">
                              <input type="radio" name="search-type" value="hotel" onchange="toggleCustomerSearchType()" style="accent-color:#ff9f43; width:18px; height:18px; cursor:pointer;"> 
                              🏨 Registered Hotels
                          </label>
                      </div>
                  </div>

                  <!-- AGENCY FILTERS CONTAINER -->
                  <div id="agency-filter-box" style="display:flex; gap:15px; flex-wrap:wrap;">
                      <div style="flex:1; min-width:200px; text-align:left;">
                          <label style="color:#636e72; font-weight:bold; font-size:12px; letter-spacing:1px;">SELECT STATE</label>
                          <select id="search-state" onchange="updateCityDropdown()" style="border: 2px solid #eee; margin-top:8px; width:100%; height:45px; border-radius:8px; padding:0 10px;">
                             <option value="">Select State</option>
                             ${stateOptions}
                          </select>
                       </div>
                       <div style="flex:1; min-width:200px; text-align:left;">
                          <label style="color:#636e72; font-weight:bold; font-size:12px; letter-spacing:1px;">SELECT CITY</label>
                          <select id="search-start" style="border: 2px solid #eee; margin-top:8px; width:100%; height:45px; border-radius:8px; padding:0 10px;">
                             <option value="">Select City First</option>
                          </select>
                       </div>
                      <div style="flex:1; min-width:250px; text-align:left;">
                          <label style="color:#636e72; font-weight:bold; font-size:12px; letter-spacing:1px;">TOUR DESTINATION</label>
                          <select id="search-dest" style="border: 2px solid #eee; margin-top:8px; width:100%; height:45px; border-radius:8px; padding:0 10px;">
                              <option value="">Select Destination</option>
                              ${destOptions}
                          </select>
                      </div>
                      <button onclick="searchMatchedAgencies()" style="background:#ff9f43; color:white; border:none; padding:0 35px; border-radius:12px; font-weight:bold; cursor:pointer; height:48px; margin-top:22px; font-size:15px;">FIND AGENCIES</button>
                  </div>

              </div>
            </div>

            <div style="max-width:1200px; margin:auto; padding:40px 20px;">
               <div style="display:flex; justify-content:space-between; align-items:end; margin-bottom:30px; border-bottom:2px solid #eee; padding-bottom:15px; flex-wrap:wrap; gap:15px;">
                  <div>
                      <h2 id="result-title" style="margin:0; color:#2d3436; font-size:2rem;">Popular Packages</h2>
                      <p id="result-subtitle" style="color:#636e72; margin-top:5px;">Explore tours from all over India</p>
                  </div>
                  <div style="display:flex; gap:10px; align-items:center;">
                    <button onclick="renderCustomerRequests()" style="background:#3498db; color:white; padding:10px 20px; border-radius:10px; font-weight:bold; cursor:pointer; border:none;">My Requests</button>
                    <button onclick="confirmAndExecuteLogout()" style="background:#f1f2f6; color:#ff7675; width:auto; padding:10px 20px; border-radius:10px; font-weight:bold; cursor:pointer; border:none;">Logout</button>
                    <button onclick="triggerDeactivateModalPopup()" style="background:#ff7675; color:white; width:auto; padding:10px 20px; border-radius:10px; font-weight:bold; cursor:pointer; border:none;">Deactivate</button>
                  </div>
              </div>
               <div id="customer-pkg-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap:25px;"></div>
            </div>
        </div>

        <div id="detail-modal" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:flex-start; overflow-y:auto; padding:40px 20px;">
            <div class="modal-content card" style="background:white; width:100%; max-width:750px; padding:30px; border-radius:20px; position:relative; margin-bottom: 50px;">
                <div id="detail-view-body"></div>
           </div>
        </div>
    `;
    loadAllPackages();
}

/**
 * Dynamic Switch Logic (Agency vs Hotel)
 */
window.toggleCustomerSearchType = function() {
    const selectedType = document.querySelector('input[name="search-type"]:checked')?.value;
    const filterBox = document.getElementById('agency-filter-box');
    const resultTitle = document.getElementById('result-title');
    const resultSubtitle = document.getElementById('result-subtitle');

    if (selectedType === 'hotel') {
        if(filterBox) filterBox.style.display = 'none';
        if(resultTitle) resultTitle.innerText = "Registered Hotels Inventory";
        if(resultSubtitle) resultSubtitle.innerText = "Live room availability directly from verified hotel partners";
        loadCustomerHotelPackages();
    } else {
        if(filterBox) filterBox.style.display = 'flex';
        if(resultTitle) resultTitle.innerText = "Popular Packages";
        if(resultSubtitle) resultSubtitle.innerText = "Explore tours from all over India";
        loadAllPackages();
    }
};

/**
/* =========================================
   Fetch & Render Registered Hotels Stock (Same Detailed View as Agency Dashboard)
   ========================================= */
window.loadCustomerHotelPackages = async function() {
    const container = document.getElementById('customer-pkg-list');
    if (!container) return;

    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px;"><h3>Loading Registered Hotels Inventory...</h3></div>`;

    try {
        const client = getClient();
        
        // Relational Query: Fetching city and address safely from hotels table
        const { data, error } = await client
            .from('room_categories')
            .select(`
                *,
                hotels (
                    city,
                    address
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding:50px; background:white; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
                    <h3>🏨 No Registered Hotel Packages Available</h3>
                    <p style="color:#636e72;">Abhi kisi hotel partner dwara live inventory stock publish nahi kiya gaya hai.</p>
                </div>`;
            return;
        }

        container.innerHTML = data.map(item => {
            const price = item.price_per_night || item.price || 0;
            const availableRooms = item.available_rooms || item.total_rooms || 0;
            
            const hotelObj = item.hotels || {};
            const hotelName = item.hotel_name || item.property_name || 'Registered Hotel Partner 🏨';
            
            const city = hotelObj.city || item.city || 'N/A';
            const address = hotelObj.address || item.address || 'N/A';
            const location = `${city}/${address}`;

            const roomType = item.category_name || item.room_type || item.title || 'Standard Room';
            const roomImg = item.image || item.image_url || item.room_image || '';

            return `
            <div class="card result-card" style="background:white; overflow:hidden; border:1px solid #eee; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.05); display:flex; flex-direction:column; justify-content:space-between;">
                <div style="padding:25px;">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <span style="background:#e8f5e9; color:#2e7d32; font-size:11px; padding:4px 10px; border-radius:12px; font-weight:bold;">REGISTERED HOTEL</span>
                        <span style="font-size:20px; font-weight:bold; color:#2ecc71;">₹${price}<small style="font-size:12px; color:#666;">/night</small></span>
                    </div>
                    
                    <h3 style="margin:15px 0 5px 0; color:#2d3436;">${roomType}</h3>
                    <p style="margin:0; color:#ff9f43; font-weight:bold; font-size:15px;">🏨 ${hotelName}</p>
                    
                    <div style="font-size:13px; color:#636e72; margin:15px 0;">
                        <div>📍 <b>Location:</b> ${location}</div>
                        <div style="margin-top:5px;">🛏️ <b>Available Rooms:</b> <span style="color:#d35400; font-weight:bold;">${availableRooms} Left</span></div>
                        ${item.amenities ? `<div style="margin-top:5px;">✨ <b>Amenities:</b> ${Array.isArray(item.amenities) ? item.amenities.join(', ') : item.amenities}</div>` : ''}
                    </div>
                </div>

                <div style="padding:15px 25px; background:#f9f9f9; border-top:1px solid #eee;">
                    <button onclick="openHotelBookingModal(
    '${hotelName.replace(/'/g, "\\'")}',
    '${city.replace(/'/g, "\\'")}',
    '${address.replace(/'/g, "\\'")}',
    '${roomType.replace(/'/g, "\\'")}',
    ${price},
    ${availableRooms},
    '${roomImg}',
    '${item.id || ''}'
)"
                            style="background:#3498db; color:white; width:100%; padding:12px; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">
                        BOOK ROOM STOCK
                    </button>
                </div>
            </div>`;
        }).join('');

    } catch (err) {
        console.error("Error loading hotel inventory for customer:", err);
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#ff7675; padding:40px;"><h3>Failed to load hotel packages: ${err.message}</h3></div>`;
    }
};
/* =========================================
   Hotel Booking Modal & Price Engine
   ========================================= */

// Reliable Unsplash Fallback Image (No Timeout Issue)
const FALLBACK_ROOM_IMAGE = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80";

// 1. Storage bucket se image URL resolve karne ka helper
function getHotelRoomImageUrl(imagePath) {
    if (!imagePath || imagePath.trim() === '' || imagePath === 'undefined' || imagePath === 'null') {
        return FALLBACK_ROOM_IMAGE;
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    try {
        const client = getClient();
        let cleanPath = imagePath.trim();
        if (!cleanPath.includes('/')) {
            cleanPath = `rooms/${cleanPath}`;
        }
        const { data } = client.storage.from('hotel-media').getPublicUrl(cleanPath);
        return data?.publicUrl || FALLBACK_ROOM_IMAGE;
    } catch(e) {
        return FALLBACK_ROOM_IMAGE;
    }
}

// Helper: Dates Format String (YYYY-MM-DD)
function formatDateString(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 2. Open Modal Function
window.openHotelBookingModal = function(hotelName, city, address, roomType, pricePerNight, maxAvailableRooms, imagePath, roomCategoryId) {
    const existingModal = document.getElementById('hotel-booking-modal');
    if (existingModal) existingModal.remove();

    const imageUrl = getHotelRoomImageUrl(imagePath);

    // Today & 7-Days Date Restrictions Calculation
    const today = new Date();
    const minDateStr = formatDateString(today);

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 7);
    const maxDateStr = formatDateString(maxDate);

    const nextDay = new Date();
    nextDay.setDate(today.getDate() + 1);
    const nextDayStr = formatDateString(nextDay);

    const modalHTML = `
    <div id="hotel-booking-modal" class="custom-modal-overlay">
        <div class="custom-modal-card">
            <button class="modal-close-btn" onclick="document.getElementById('hotel-booking-modal').remove()">✕</button>
            
            <div class="modal-image-wrapper">
                <img src="${imageUrl}" alt="${roomType}" class="modal-room-img" onerror="this.onerror=null; this.src='${FALLBACK_ROOM_IMAGE}';">
            </div>

            <div class="modal-content-body">
                <h2 style="margin:0 0 5px 0; color:#2d3436;">${hotelName}</h2>
                <p style="margin:0 0 15px 0; color:#636e72; font-size:13px;">📍 ${city}, ${address}</p>
                
                <div style="background:#f8f9fa; padding:10px 15px; border-radius:8px; margin-bottom:15px; border-left:4px solid #3498db;">
                    <span style="font-weight:bold; color:#2c3e50;">🛏️ Category: ${roomType}</span>
                </div>

                <!-- Calendar Section: Check-In & Check-Out (Limited to Today + 7 Days) -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:15px;">
                    <div>
                        <label style="display:block; font-size:11px; font-weight:bold; color:#636e72; margin-bottom:5px;">📅 CHECK-IN DATE</label>
                        <input type="date" id="modal-checkin-date" min="${minDateStr}" max="${maxDateStr}" value="${minDateStr}" 
                               onchange="calculateHotelTotalPrice(${pricePerNight}, ${maxAvailableRooms})" 
                               style="width:100%; padding:8px 10px; border:2px solid #e2e8f0; border-radius:8px; font-size:13px; font-weight:bold; box-sizing:border-box;">
                    </div>
                    <div>
                        <label style="display:block; font-size:11px; font-weight:bold; color:#636e72; margin-bottom:5px;">📅 CHECK-OUT DATE</label>
                        <input type="date" id="modal-checkout-date" min="${minDateStr}" max="${maxDateStr}" value="${nextDayStr}" 
                               onchange="calculateHotelTotalPrice(${pricePerNight}, ${maxAvailableRooms})" 
                               style="width:100%; padding:8px 10px; border:2px solid #e2e8f0; border-radius:8px; font-size:13px; font-weight:bold; box-sizing:border-box;">
                    </div>
                </div>

                <div class="booking-form-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:15px; align-items:center; margin-bottom:15px;">
                    <div>
                        <label style="display:block; font-size:11px; font-weight:bold; color:#636e72; margin-bottom:5px;">PRICE PER NIGHT</label>
                        <div style="font-size:18px; font-weight:bold; color:#2ecc71;">₹${pricePerNight}</div>
                    </div>

                    <div>
                        <label style="display:block; font-size:11px; font-weight:bold; color:#636e72; margin-bottom:5px;">ROOMS TO BOOK (Max: ${maxAvailableRooms})</label>
                        <input type="number" id="modal-room-qty" min="0" max="${maxAvailableRooms}" value="1" 
                               oninput="calculateHotelTotalPrice(${pricePerNight}, ${maxAvailableRooms})" 
                               style="width:100%; padding:8px 12px; border:2px solid #e2e8f0; border-radius:8px; font-size:15px; font-weight:bold; box-sizing:border-box;">
                    </div>
                </div>

                <!-- Live Dynamic Calculation Display -->
                <div style="margin:15px 0; padding:12px 15px; background:#eef2f7; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:13px; color:#34495e; font-weight:bold;">Total Amount:</span>
                    <span id="modal-total-price-display" style="font-size:16px; font-weight:bold; color:#e67e22;">
                        ₹${pricePerNight} x 1 Room(s) x 1 Night(s) = ₹${pricePerNight}
                    </span>
                </div>

                <!-- Terms & Cancellation Policy Checkbox -->
                <div style="margin-bottom:15px;">
                    <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer; font-size:11px; color:#4a5568; line-height:1.4;">
                        <input type="checkbox" id="modal-agree-terms" style="margin-top:2px; cursor:pointer;">
                        <span>I agree to the <b>Cancellation & Refund Policy</b>. I understand that in case of cancellation, a non-refundable amount of <b>18% (2% Gateway + GST on transaction fee + 15% Service & Facilitation Fee)</b> will be deducted from my total refund.</span>
                    </label>
                </div>

                <button id="modal-confirm-btn" onclick="submitHotelRoomBooking('${hotelName.replace(/'/g, "\\'")}', '${roomType.replace(/'/g, "\\'")}', '${city.replace(/'/g, "\\'")}, ${address.replace(/'/g, "\\'")}', ${pricePerNight}, ${maxAvailableRooms}, '${roomCategoryId || ''}')" 
                        style="width:100%; padding:12px; background:#27ae60; color:white; border:none; border-radius:10px; font-weight:bold; font-size:15px; cursor:pointer;">
                    CONFIRM & PROCEED TO BOOK
                </button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// 3. Calculation Handler (Calculates Rooms × Nights)
window.calculateHotelTotalPrice = function(pricePerNight, maxAvailableRooms) {
    const qtyInput = document.getElementById('modal-room-qty');
    const checkInInput = document.getElementById('modal-checkin-date');
    const checkOutInput = document.getElementById('modal-checkout-date');
    const display = document.getElementById('modal-total-price-display');

    let val = qtyInput.value;
    let qty = parseInt(val) || 0;

    if (qty > maxAvailableRooms) {
        alert(`Available room limit is ${maxAvailableRooms}`);
        qty = maxAvailableRooms;
        qtyInput.value = maxAvailableRooms;
    } else if (qty < 0) {
        qty = 0;
        qtyInput.value = 0;
    }

    // Calculating Nights Between Dates
    let nights = 1;
    if (checkInInput && checkOutInput && checkInInput.value && checkOutInput.value) {
        const d1 = new Date(checkInInput.value);
        const d2 = new Date(checkOutInput.value);
        const diffTime = d2 - d1;
        nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (nights <= 0) nights = 1;
    }

    const total = pricePerNight * qty * nights;
    display.innerHTML = `₹${pricePerNight} x ${qty} Room(s) x ${nights} Night(s) = ₹${total}`;
};

// 4. Booking Submission Handler (Saves direct to Supabase SQL Table)
window.submitHotelRoomBooking = async function(hotelName, roomType, location, pricePerNight, maxAvailableRooms, roomCategoryId) {
    const checkbox = document.getElementById('modal-agree-terms');
    const qtyInput = document.getElementById('modal-room-qty');
    const checkInInput = document.getElementById('modal-checkin-date');
    const checkOutInput = document.getElementById('modal-checkout-date');

    const qty = parseInt(qtyInput.value) || 0;
    const checkIn = checkInInput.value;
    const checkOut = checkOutInput.value;

    if (!checkIn || !checkOut) {
        alert("Please select both Check-In and Check-Out dates.");
        return;
    }

    if (qty <= 0) {
        alert("Please select at least 1 room to book.");
        return;
    }

    if (!checkbox.checked) {
        alert("Please accept the Cancellation & Refund Policy terms to proceed.");
        return;
    }

    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diffTime = d2 - d1;
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
        alert("Check-Out date must be after Check-In date.");
        return;
    }

    const subtotal = pricePerNight * qty * nights;
    const gatewayFee = subtotal * 0.02;
    const serviceFee = subtotal * 0.07;
    const grandTotal = subtotal;

    try {
        const client = getClient();

        const { data: { user } } = await client.auth.getUser();

        if (!user) {
            alert("Please login first.");
            return;
        }

        const bookingPayload = {
            customer_id: user.id,
            customer_email: user.email || null,
            customer_phone: null,

            room_category_id: roomCategoryId ? parseInt(roomCategoryId) : null,

            hotel_name: hotelName,
            room_type: roomType,
            location: location,

            check_in_date: checkIn,
            check_out_date: checkOut,

            rooms_booked: qty,

            price_per_night: pricePerNight,
            total_nights: nights,
            subtotal_amount: subtotal,
            gateway_fee: gatewayFee,
            service_fee: serviceFee,
            total_amount: grandTotal,

            cancellation_policy_agreed: true,

            booking_status: 'pending',
            payment_status: 'unpaid',

            payment_contact_number: null,
            payment_instructions: null,
            owner_message: 'Your hotel booking request has been sent to the Registered Hotel owner. Please wait for approval.',
            cancellation_reason: null,
            cancelled_by: null,
            cancelled_at: null,
            approved_at: null,
            denied_at: null
        };

        const { data, error } = await client
            .from('hotel_bookings')
            .insert([bookingPayload])
            .select();

        if (error) throw error;

        // Push the request to the hotel owner immediately. This is
        // non-blocking so a push-provider outage cannot cancel the booking.
        const createdHotelBookingId = data?.[0]?.id;
        if (createdHotelBookingId) {
            void window.sendTourSetuBookingNotification(createdHotelBookingId, 'hotel');
        }

        alert(
            `🎉 Booking Request Sent Successfully!\n\n` +
            `Booking ID: ${data[0].id.slice(0, 8)}\n` +
            `Total Amount: ₹${grandTotal.toLocaleString('en-IN')}\n\n` +
            `The hotel owner will review your request.`
        );

        document.getElementById('hotel-booking-modal').remove();

        if (typeof window.renderCustomerRequests === 'function') {
            window.renderCustomerRequests();
        }

    } catch (err) {
        console.error("Database Insert Error:", err);
        alert(`Booking failed: ${err.message}`);
    }
};
/* ============================================================
   🏨 REGISTERED HOTEL - CUSTOMER CANCELLATION WORKFLOW
   ============================================================ */

window.openHotelCancellationModal = function(bookingId) {

    let modal =
        document.getElementById(
            'hotel-cancel-confirm-modal'
        );

    if (!modal) {

        modal = document.createElement('div');

        modal.id =
            'hotel-cancel-confirm-modal';

        modal.style = `
            position:fixed;
            inset:0;
            background:rgba(0,0,0,0.75);
            display:flex;
            justify-content:center;
            align-items:center;
            z-index:100000;
            padding:20px;
        `;

        modal.innerHTML = `
            <div style="
                background:white;
                width:100%;
                max-width:500px;
                border-radius:18px;
                padding:28px;
                box-shadow:0 20px 50px rgba(0,0,0,0.3);
            ">

                <h2 style="
                    margin-top:0;
                    color:#d63031;
                ">
                    ⚠️ Cancel Hotel Booking?
                </h2>

                <p style="
                    color:#555;
                    line-height:1.6;
                    font-size:14px;
                ">
                    Are you sure you want to cancel this Registered Hotel
                    booking request?
                </p>

                <div style="
                    background:#fff4e6;
                    border:1px solid #ffd8a8;
                    padding:15px;
                    border-radius:10px;
                    margin-top:15px;
                    font-size:13px;
                    color:#444;
                    line-height:1.6;
                ">
                    <b>Cancellation & Refund Policy</b>

                    <div style="margin-top:8px;">
                        I agree to the Cancellation & Refund Policy.
                        I understand that in case of cancellation, a
                        non-refundable amount of <b>18%</b> (2% Gateway + GST on transaction fee + 15% Service & Facilitation Fee)
                        will be deducted from my total refund.
                    </div>
                </div>

                <label style="
                    display:flex;
                    gap:10px;
                    align-items:flex-start;
                    margin-top:18px;
                    cursor:pointer;
                    font-size:13px;
                ">

                    <input
                        type="checkbox"
                        id="hotel-cancel-policy-check"
                        style="margin-top:3px;"
                    >

                    <span>
                        I agree to the Cancellation & Refund Policy.
                    </span>

                </label>

                <div style="
                    display:flex;
                    gap:10px;
                    margin-top:25px;
                ">

                    <button
                        onclick="confirmHotelCancellation('${bookingId}')"
                        style="
                            flex:1;
                            background:#ff7675;
                            color:white;
                            border:none;
                            padding:12px;
                            border-radius:8px;
                            font-weight:bold;
                            cursor:pointer;
                        "
                    >
                        CONFIRM CANCELLATION
                    </button>

                    <button
                        onclick="document.getElementById('hotel-cancel-confirm-modal').remove()"
                        style="
                            flex:1;
                            background:#eee;
                            color:#444;
                            border:none;
                            padding:12px;
                            border-radius:8px;
                            font-weight:bold;
                            cursor:pointer;
                        "
                    >
                        KEEP BOOKING
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
};


/* ============================================================
   🏨 CONFIRM CUSTOMER HOTEL CANCELLATION
   ============================================================ */

window.confirmHotelCancellation =
    async function(bookingId) {

        const checkbox =
            document.getElementById(
                'hotel-cancel-policy-check'
            );

        if (
            !checkbox ||
            !checkbox.checked
        ) {

            alert(
                "Please accept the Cancellation & Refund Policy before cancelling."
            );

            return;
        }


        const finalConfirm = confirm(
            "Cancellation confirmation:\n\n" +
            "18% (2% Gateway + GST on transaction fee + 15% Service & Facilitation Fee) " +
            "will be deducted from the total refund.\n\n" +
            "Do you want to continue?"
        );


        if (!finalConfirm) return;


        const client = getClient();


        if (!client) {

            alert(
                "Database connection error."
            );

            return;
        }


        try {

            /* ========================================================
               1. CURRENT LOGGED-IN USER
               ======================================================== */

            const {
                data: {
                    user
                },
                error: userError
            } =
                await client.auth.getUser();


            if (userError) {
                throw userError;
            }


            if (!user) {

                alert(
                    "Please login first."
                );

                return;
            }


            /* ========================================================
               2. FETCH BOOKING
               ======================================================== */

            const {
                data: booking,
                error: fetchError
            } =
                await client
                    .from('hotel_bookings')
                    .select('*')
                    .eq(
                        'id',
                        bookingId
                    )
                    .eq(
                        'customer_id',
                        user.id
                    )
                    .single();


            if (fetchError) {
                throw fetchError;
            }


            if (!booking) {

                alert(
                    "Hotel booking request not found."
                );

                return;
            }


            /* ========================================================
               3. CHECK CURRENT STATUS
               ======================================================== */

            const currentStatus =
                String(
                    booking.booking_status ||
                    ''
                ).toLowerCase();


            if (
                [
                    'cancelled',
                    'cancelled_by_customer',
                    'denied',
                    'rejected',
                    'completed'
                ].includes(
                    currentStatus
                )
            ) {

                alert(
                    "This booking can no longer be cancelled."
                );

                return;
            }


            /* ========================================================
               4. CANCELLATION MESSAGE
               ======================================================== */

            const cancellationMessage =
                "Customer cancelled this Registered Hotel booking. " +
                "Cancellation & Refund Policy accepted. " +
                "A non-refundable amount of 18% " +
                "(2% Gateway + GST on transaction fee + 15% Service & Facilitation Fee) " +
                "will be deducted from the total refund.";


            /* ========================================================
               5. UPDATE DATABASE

               IMPORTANT:
               booking_status = 'cancelled'
               because 'cancelled_by_customer' is NOT allowed
               by the database CHECK constraint.

               cancelled_by = 'customer'
               stores who cancelled the booking.
               ======================================================== */

            const {
                data: updatedBooking,
                error: updateError
            } =
                await client
                    .from('hotel_bookings')
                    .update({

                        booking_status:
                            'cancelled',

                        cancelled_by:
                            'customer',

                        cancelled_at:
                            new Date().toISOString(),

                        cancellation_reason:
                            cancellationMessage,

                        owner_message:
                            cancellationMessage

                    })
                    .eq(
                        'id',
                        bookingId
                    )
                    .eq(
                        'customer_id',
                        user.id
                    )
                    .select('*')
                    .single();


            if (updateError) {

                console.error(
                    "Hotel cancellation database update error:",
                    updateError
                );

                throw updateError;
            }


            /* ========================================================
               6. VERIFY DATABASE UPDATE
               ======================================================== */

            if (
                !updatedBooking ||
                updatedBooking.cancelled_by !==
                    'customer'
            ) {

                console.error(
                    "Cancellation update verification failed:",
                    updatedBooking
                );

                throw new Error(
                    "Cancellation was processed, but cancelled_by was not saved as 'customer'."
                );
            }


            /* ========================================================
               7. CLOSE MODAL
               ======================================================== */

            const modal =
                document.getElementById(
                    'hotel-cancel-confirm-modal'
                );


            if (modal) {
                modal.remove();
            }


            /* ========================================================
               8. SUCCESS
               ======================================================== */

            alert(
                "✅ Hotel booking request cancelled successfully.\n\n" +
                "The hotel owner has been notified of the cancellation."
            );


            /* ========================================================
               9. REFRESH CUSTOMER REQUESTS
               ======================================================== */

            if (
                typeof window.renderCustomerRequests ===
                'function'
            ) {

                await window.renderCustomerRequests();

            }

        } catch (err) {

            console.error(
                "Hotel Cancellation Error:",
                err
            );

            alert(
                "Cancellation failed: " +
                (
                    err?.message ||
                    "Unknown database error."
                )
            );
        }
    };
 /* ============================================================
   🏨 REGISTERED HOTEL - PAYMENT CONFIRMATION
   ============================================================ */

window.confirmHotelPayment = async function(bookingId) {

    const client = getClient();

    const confirmed = confirm(
        "Have you completed the payment using the payment details " +
        "provided by the hotel owner?\n\n" +
        "Click OK only after completing the payment."
    );

    if (!confirmed) return;

    try {

        const { data: { user } } =
            await client.auth.getUser();

        if (!user) {
            alert("Please login first.");
            return;
        }

        const { data: booking, error: fetchError } =
            await client
                .from('hotel_bookings')
                .select('*')
                .eq('id', bookingId)
                .eq('customer_id', user.id)
                .single();

        if (fetchError) throw fetchError;

        const bookingStatus =
            String(booking.booking_status || '').toLowerCase();

        if (
            bookingStatus !== 'approved' &&
            bookingStatus !== 'confirmed'
        ) {
            alert(
                "Payment cannot be confirmed because the hotel has not approved this request."
            );
            return;
        }

        const { error } = await client
            .from('hotel_bookings')
            .update({
                payment_status: 'paid',
                booking_status: 'confirmed',
                owner_message:
                    'Payment has been marked as completed by the customer. ' +
                    'Your hotel room booking is now confirmed.'
            })
            .eq('id', bookingId)
            .eq('customer_id', user.id);

        if (error) throw error;

        alert(
            "✅ Payment status updated successfully.\n\n" +
            "Your room booking is now confirmed."
        );

        window.renderCustomerRequests();

    } catch (err) {

        console.error("Hotel Payment Confirmation Error:", err);

        alert(
            "Payment confirmation failed: " +
            err.message
        );
    }
};   

// Customer ki hotel requests fetch karke UI par dikhane ka function
async function loadCustomerRequests() {
  const requestsListDiv = document.getElementById('requests-list');
  requestsListDiv.innerHTML = '<p>Loading requests...</p>';

  // 1. Current logged-in user get karein
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    requestsListDiv.innerHTML = '<p>User not logged in.</p>';
    return;
  }

  // 2. hotel_bookings table se customer ki requests fetch karein
  const { data: bookings, error } = await supabase
    .from('hotel_bookings')
    .select('*')
    .eq('customer_id', user.id) // customer_id ki jagah apne user foreign key column ka naam rakhein
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching requests:', error.message);
    requestsListDiv.innerHTML = '<p>Requests load karne me problem aayi.</p>';
    return;
  }

  // 3. Agar koi request nahi hai
  if (!bookings || bookings.length === 0) {
    requestsListDiv.innerHTML = '<p>Aapki koi hotel request nahi hai.</p>';
    return;
  }

  // 4. Data ko UI par render karein
  requestsListDiv.innerHTML = bookings.map(booking => `
    <div class="request-card" style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
      <h4>Hotel Name: ${booking.hotel_name || 'N/A'}</h4>
      <p><strong>Check-in:</strong> ${booking.check_in_date || 'N/A'}</p>
      <p><strong>Check-out:</strong> ${booking.check_out_date || 'N/A'}</p>
      <p><strong>Status:</strong> <span class="status-${booking.status}">${booking.status || 'Pending'}</span></p>
      <p><strong>Price:</strong> ₹${booking.price || '0'}</p>
    </div>
  `).join('');
}
// 5. 'My Requests' button par Event Listener attach karein
const myRequestsBtn = document.getElementById('my-requests-btn');
if (myRequestsBtn) {
    myRequestsBtn.addEventListener('click', () => {
        // Baaki sections hide karke My Requests section show karein
        showSection('my-requests-section'); 
        
        // Data fetch karein
        loadCustomerRequests();
    });
}
// Global Deactivation Popup Engine (Problem 3 Confirmation Modal)
window.triggerDeactivateModalPopup = function() {
    let modal = document.getElementById('deactivate-confirmation-modal');
    if(!modal) {
        modal = document.createElement('div');
        modal.id = 'deactivate-confirmation-modal';
        modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); display:flex; justify-content:center; align-items:center; z-index:100000;";
        modal.innerHTML = `
            <div style="background:white; padding:30px; border-radius:16px; text-align:center; max-width:420px; width:90%; box-shadow: 0 10px 30px rgba(0,0,0,0.25); font-family:'Inter',sans-serif;">
                <h3 style="margin-top:0; color:#d63031; font-size:20px;">⚠️ Deactivate Account?</h3>
                <p style="color:#636e72; font-size:14px; line-height:1.5; margin:15px 0;">Kya aap sach me apna account deactivate karna chate hai? Isse aapka Google/Gmail account disconnect ho jayega aur aapko fir se sign in karna padega.</p>
                <div style="margin-top:25px; display:flex; gap:12px; justify-content:center;">
                    <button onclick="executeGlobalDisconnect()" style="background:#d63031; color:white; padding:12px 25px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:14px;">Confirm</button>
                    <button onclick="document.getElementById('deactivate-confirmation-modal').style.display='none'" style="background:#dfe6e9; color:#2d3436; padding:12px 25px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:14px;">Not</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
};

window.executeGlobalDisconnect = async function() {
    try {
        const client = getClient();
        await client.auth.signOut();
        localStorage.clear();
        document.getElementById('deactivate-confirmation-modal').style.display = 'none';
        alert("Account session deactivated & disconnected successfully. Saara data admin panels (Supabase) me safe hai.");
        window.location.reload();
    } catch(err) {
        alert("Deactivation Error: " + err.message);
    }
};

/**
 * Logout Confirmation Logic
 */
window.confirmAndExecuteLogout = async function() {
    const confirmLogout = confirm("Are you sure you want to logout from your account?");
    if (confirmLogout) {
        try {
            const client = getClient();
            await client.auth.signOut();
            localStorage.clear();
            alert("Logged out successfully!");
            window.location.reload(); 
        } catch (e) {
            alert("Error logging out: " + e.message);
        }
    }
};

window.updateCityDropdown = () => {
    const state = document.getElementById('search-state').value;
    const citySelect = document.getElementById('search-start');
    if (!state) {
        citySelect.innerHTML = '<option value="">Select City First</option>';
        return;
    }
    const cities = locationData[state] || [];
    citySelect.innerHTML = cities.sort().map(c => `<option value="${c}">${c}</option>`).join('');
};

window.renderCustomerRequests = async () => {
    const container = document.getElementById('customer-pkg-list');
    const resultTitle = document.getElementById('result-title');
    const resultSubtitle = document.getElementById('result-subtitle');
    
    resultTitle.innerText = "My Trip Requests";
    resultSubtitle.innerText = "Track your inquiries and booking status";
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center;"><h3>Loading your requests...</h3></div>`;
    
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();

    if (!user) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px;">
            <p>Please login first.</p>
        </div>`;
        return;
    }

    /*
    ============================================================
    IMPORTANT:
    Check which search type is currently selected.

    🎒 Agency Packages  -> bookings table
    🏨 Registered Hotels -> hotel_bookings table

    This keeps both booking types completely separate.
    ============================================================
    */
    const selectedType = document.querySelector('input[name="search-type"]:checked')?.value || 'agency';


    /* ============================================================
       🏨 REGISTERED HOTELS - MY REQUESTS
       Source: hotel_bookings table ONLY
       ============================================================ */

if (selectedType === 'hotel') {

    resultTitle.innerText = "My Hotel Booking Requests";
    resultSubtitle.innerText = "Track your Registered Hotel booking status";

    container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center;">
            <h3>Loading your hotel booking requests...</h3>
        </div>
    `;

    try {

        const { data: hotelBookings, error } = await client
            .from('hotel_bookings')
            .select('*')
            .eq('customer_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Hotel booking fetch error:", error);
            throw error;
        }

        if (!hotelBookings || hotelBookings.length === 0) {

            container.innerHTML = `
                <div style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:50px;
                    background:white;
                    border-radius:15px;
                    box-shadow:0 4px 15px rgba(0,0,0,0.05);
                ">
                    <div style="font-size:45px;">🏨</div>

                    <h3 style="color:#2d3436;">
                        No Hotel Booking Requests
                    </h3>

                    <p style="color:#636e72;">
                        Aapki koi Registered Hotel booking request nahi hai.
                    </p>

                    <span
                        onclick="renderCustomerHomepage()"
                        style="
                            color:#3498db;
                            cursor:pointer;
                            font-weight:bold;
                        "
                    >
                        Search Registered Hotels
                    </span>
                </div>
            `;

            return;
        }

        container.innerHTML = hotelBookings.map(b => {

            const bookingStatus = String(
                b.booking_status || 'pending'
            ).toLowerCase();

            const paymentStatus = String(
                b.payment_status || 'unpaid'
            ).toLowerCase();

            const totalAmount = Number(b.total_amount || 0);
            const roomsBooked = Number(b.rooms_booked || 0);

            let bookingStatusColor = '#ff9f43';

            if (
                bookingStatus === 'approved' ||
                bookingStatus === 'confirmed'
            ) {
                bookingStatusColor = '#3498db';
            }

            if (bookingStatus === 'completed') {
                bookingStatusColor = '#2ecc71';
            }

            if (
                bookingStatus === 'cancelled' ||
                bookingStatus === 'cancelled_by_customer' ||
                bookingStatus === 'denied' ||
                bookingStatus === 'rejected'
            ) {
                bookingStatusColor = '#ff7675';
            }

            let paymentStatusColor = '#ff9f43';

            if (
                paymentStatus === 'paid' ||
                paymentStatus === 'success' ||
                paymentStatus === 'completed'
            ) {
                paymentStatusColor = '#2ecc71';
            }

            if (
                paymentStatus === 'failed' ||
                paymentStatus === 'cancelled'
            ) {
                paymentStatusColor = '#ff7675';
            }

            const canCancel =
                ![
                    'cancelled',
                    'cancelled_by_customer',
                    'denied',
                    'rejected',
                    'completed'
                ].includes(bookingStatus);

            const showPaymentButton =
                (
                    bookingStatus === 'approved' ||
                    bookingStatus === 'confirmed'
                ) &&
                (
                    paymentStatus === 'unpaid' ||
                    paymentStatus === 'pending'
                );

            return `
                <div
                    class="card"
                    style="
                        background:white;
                        padding:25px;
                        border-left:5px solid ${bookingStatusColor};
                        position:relative;
                        box-shadow:0 4px 15px rgba(0,0,0,0.05);
                        border-radius:15px;
                    "
                >

                    <!-- HEADER -->
                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:flex-start;
                        gap:15px;
                    ">

                        <div>

                            <div style="
                                display:inline-block;
                                background:#e8f5e9;
                                color:#2e7d32;
                                padding:5px 10px;
                                border-radius:12px;
                                font-size:11px;
                                font-weight:bold;
                            ">
                                🏨 REGISTERED HOTEL
                            </div>

                            <h3 style="
                                margin:12px 0 8px 0;
                                color:#2d3436;
                            ">
                                ${b.hotel_name || 'Hotel Name Not Available'}
                            </h3>

                            <div style="
                                font-size:13px;
                                color:#636e72;
                            ">
                                📍 <b>Location:</b>
                                ${b.location || 'Location not available'}
                            </div>

                        </div>

                        <div style="
                            display:flex;
                            flex-direction:column;
                            align-items:flex-end;
                            gap:8px;
                        ">

                            <div style="
                                background:#f0fff4;
                                color:#27ae60;
                                padding:8px 12px;
                                border-radius:8px;
                                font-weight:bold;
                                white-space:nowrap;
                            ">
                                ₹${totalAmount.toLocaleString('en-IN')}
                            </div>

                            ${
                                canCancel
                                ? `
                                <button
                                    onclick="openHotelCancellationModal('${b.id}')"
                                    style="
                                        background:#ff7675;
                                        color:white;
                                        border:none;
                                        padding:8px 13px;
                                        border-radius:8px;
                                        cursor:pointer;
                                        font-size:11px;
                                        font-weight:bold;
                                    "
                                >
                                    ✕ CANCEL REQUEST
                                </button>
                                `
                                : ''
                            }

                        </div>

                    </div>


                    <!-- BOOKING DETAILS -->
                    <div style="
                        margin-top:20px;
                        padding:18px;
                        border-radius:10px;
                        background:#f8f9fa;
                        display:grid;
                        grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
                        gap:15px;
                    ">

                        <div>
                            <div style="font-size:11px;color:#888;font-weight:bold;">
                                CHECK-IN DATE
                            </div>
                            <div style="margin-top:5px;color:#2d3436;font-weight:bold;">
                                📅 ${b.check_in_date || 'N/A'}
                            </div>
                        </div>

                        <div>
                            <div style="font-size:11px;color:#888;font-weight:bold;">
                                CHECK-OUT DATE
                            </div>
                            <div style="margin-top:5px;color:#2d3436;font-weight:bold;">
                                📅 ${b.check_out_date || 'N/A'}
                            </div>
                        </div>

                        <div>
                            <div style="font-size:11px;color:#888;font-weight:bold;">
                                ROOMS BOOKED
                            </div>
                            <div style="margin-top:5px;color:#2d3436;font-weight:bold;">
                                🛏️ ${roomsBooked}
                            </div>
                        </div>

                        <div>
                            <div style="font-size:11px;color:#888;font-weight:bold;">
                                TOTAL AMOUNT
                            </div>
                            <div style="margin-top:5px;color:#27ae60;font-weight:bold;">
                                ₹${totalAmount.toLocaleString('en-IN')}
                            </div>
                        </div>

                    </div>


                    <!-- STATUS -->
                    <div style="
                        margin-top:15px;
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                    ">

                        <div style="
                            background:#f8f9fa;
                            border:1px solid #eee;
                            border-radius:10px;
                            padding:10px 15px;
                        ">
                            <div style="font-size:10px;color:#888;font-weight:bold;">
                                BOOKING STATUS
                            </div>

                            <div style="
                                margin-top:4px;
                                color:${bookingStatusColor};
                                font-size:12px;
                                font-weight:bold;
                            ">
                                ${bookingStatus.toUpperCase()}
                            </div>
                        </div>


                        <div style="
                            background:#f8f9fa;
                            border:1px solid #eee;
                            border-radius:10px;
                            padding:10px 15px;
                        ">
                            <div style="font-size:10px;color:#888;font-weight:bold;">
                                PAYMENT STATUS
                            </div>

                            <div style="
                                margin-top:4px;
                                color:${paymentStatusColor};
                                font-size:12px;
                                font-weight:bold;
                            ">
                                ${paymentStatus.toUpperCase()}
                            </div>
                        </div>

                    </div>


                    <!-- HOTEL OWNER MESSAGE -->
                    ${
                        b.owner_message
                        ? `
                        <div style="
                            margin-top:18px;
                            background:#eef7ff;
                            border:1px solid #b9dcff;
                            padding:15px;
                            border-radius:10px;
                            color:#24557a;
                            font-size:13px;
                            line-height:1.6;
                        ">
                            <b>🏨 Hotel Update</b>
                            <div style="margin-top:6px;">
                                ${b.owner_message}
                            </div>
                        </div>
                        `
                        : ''
                    }


                    <!-- PAYMENT INFORMATION -->
                    ${
                        showPaymentButton
                        ? `
                        <div style="
                            margin-top:18px;
                            background:#f0fff4;
                            border:1px solid #2ecc71;
                            padding:18px;
                            border-radius:10px;
                        ">

                            <div style="
                                color:#27ae60;
                                font-weight:bold;
                                font-size:14px;
                            ">
                                ✅ REQUEST ACCEPTED
                            </div>

                            <p style="
                                margin:8px 0;
                                color:#2d3436;
                                font-size:13px;
                            ">
                                Request accepted. Now you can do payment.
                                After successful payment, your room booking will be completed.
                            </p>

                            ${
                                b.payment_contact_number
                                ? `
                                <div style="
                                    background:white;
                                    padding:10px;
                                    border-radius:7px;
                                    margin-top:8px;
                                    font-weight:bold;
                                    color:#2d3436;
                                ">
                                    📞 Payment Number:
                                    ${b.payment_contact_number}
                                </div>
                                `
                                : ''
                            }

                            ${
                                b.payment_instructions
                                ? `
                                <div style="
                                    background:white;
                                    padding:10px;
                                    border-radius:7px;
                                    margin-top:8px;
                                    color:#444;
                                ">
                                    💳 <b>Payment Instructions:</b><br>
                                    ${b.payment_instructions}
                                </div>
                                `
                                : ''
                            }

                            <button
                                onclick="confirmHotelPayment('${b.id}')"
                                style="
                                    width:100%;
                                    margin-top:12px;
                                    background:#2ecc71;
                                    color:white;
                                    border:none;
                                    padding:12px;
                                    border-radius:8px;
                                    font-weight:bold;
                                    cursor:pointer;
                                "
                            >
                                💳 PROCEED TO PAYMENT
                            </button>

                        </div>
                        `
                        : ''
                    }


                    <!-- DENIED -->
                    ${
                        (
                            bookingStatus === 'denied' ||
                            bookingStatus === 'rejected'
                        )
                        ? `
                        <div style="
                            margin-top:18px;
                            background:#fff5f5;
                            border:1px solid #ff7675;
                            padding:15px;
                            border-radius:10px;
                            color:#c0392b;
                        ">
                            <b>❌ REQUEST NOT ACCEPTED</b>
                            <div style="margin-top:6px;">
                                ${
                                    b.owner_message ||
                                    'The hotel owner has declined this booking request.'
                                }
                            </div>
                            <div style="
                                margin-top:8px;
                                font-size:12px;
                                font-weight:bold;
                            ">
                                No payment option is available for this request.
                            </div>
                        </div>
                        `
                        : ''
                    }


                    <!-- CANCELLATION -->
                    ${
                        (
                            bookingStatus === 'cancelled' ||
                            bookingStatus === 'cancelled_by_customer'
                        )
                        ? `
                        <div style="
                            margin-top:18px;
                            background:#fff5f5;
                            border:1px solid #ff7675;
                            padding:15px;
                            border-radius:10px;
                            color:#c0392b;
                        ">
                            <b>🚫 BOOKING CANCELLED</b>

                            <div style="margin-top:7px;">
                                ${
                                    b.cancellation_reason ||
                                    'This hotel booking request has been cancelled.'
                                }
                            </div>

                            ${
                                b.payment_status === 'paid'
                                ? `
                                <div style="
                                    margin-top:10px;
                                    font-size:12px;
                                    font-weight:bold;
                                ">
                                    Refund will be processed according to the
                                    Cancellation & Refund Policy with the applicable
                                    18% non-refundable deduction.
                                </div>
                                `
                                : ''
                            }
                        </div>
                        `
                        : ''
                    }


                    <!-- FOOTER -->
                    <div style="
                        margin-top:18px;
                        padding-top:15px;
                        border-top:1px solid #eee;
                        color:#636e72;
                        font-size:12px;
                    ">

                        🏨 This booking is from
                        <b>Registered Hotels</b>.

                        <span style="float:right;">
                            Booking ID:
                            <b>${b.id ? String(b.id).slice(0,8) : 'N/A'}</b>
                        </span>

                    </div>

                </div>
            `;

        }).join('');

        return;

    } catch (e) {

        console.error(
            "Error loading hotel booking requests:",
            e
        );

        container.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:40px;
                color:#ff7675;
            ">
                <h3>❌ Error loading hotel requests</h3>
                <p>${e.message}</p>
            </div>
        `;

        return;
    }
}


    /* ============================================================
       🎒 AGENCY PACKAGES - MY REQUESTS
       Source: bookings table ONLY

       ORIGINAL CODE BELOW IS KEPT SAME
       ============================================================ */

    resultTitle.innerText = "My Trip Requests";
    resultSubtitle.innerText = "Track your inquiries and booking status";
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center;"><h3>Loading your requests...</h3></div>`;
    
    // Problem 2 Fix: Freshly fetch everything directly from database to avoid caching/sync issues
    const { data, error } = await client.from('bookings').select('*').eq('customer_id', user.id).order('created_at', {ascending: false});
    
    if(!data || data.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px;">
            <p>No requests found. <span onclick="renderCustomerHomepage()" style="color:#ff9f43; cursor:pointer; font-weight:bold;">Search for packages</span></p>
        </div>`;
        return;
    }

    container.innerHTML = data.map(b => {
        // Problem 2 Fix: Handle both 'confirmed' and 'approved' values cleanly for styling and buttons
        const isApprovedOrConfirmed = b.status === 'confirmed' || b.status === 'approved';
        const statusColor = b.status === 'paid' ? '#2ecc71' : (isApprovedOrConfirmed ? '#3498db' : (b.status === 'denied' || b.status === 'rejected' ? '#ff7675' : (b.status === 'cancelled' ? '#636e72' : '#ff9f43')));
        const isPending = b.status === 'pending';
        const isPaid = b.status === 'paid';
        const isApproved = isApprovedOrConfirmed; 
        const isCancelled = b.status === 'cancelled';
        const isDenied = b.status === 'denied' || b.status === 'rejected';

        const today = new Date();
        today.setHours(0,0,0,0);
        const travelDateObj = b.travel_date ? new Date(b.travel_date) : null;
        if(travelDateObj) travelDateObj.setHours(0,0,0,0);
        
        const canCancel = travelDateObj && today <= travelDateObj && !isCancelled && !isDenied && !isPaid;

        // Problem 1 Fix: Changed database property targets to match exactly: vaishno_ghoda_price, vaishno_dandi_price, vaishno_pitthu_price
        let trackingDetailsInfo = '';
        if (b.keda_ghoda_qty > 0 || b.keda_dandi_qty > 0 || b.keda_kandi_qty > 0 || b.keda_pitthu_qty > 0) {
            trackingDetailsInfo = `<div style="margin-top:5px; color:#e67e22; font-size:12px;">⛰️ Kedarnath Trek Selected: ${b.keda_ghoda_qty ? '🐴 Ghoda ('+b.keda_ghoda_qty+') ' : ''}${b.keda_dandi_qty ? '🪑 Dandi ('+b.keda_dandi_qty+') ' : ''}${b.keda_kandi_qty ? ' baskets ('+b.keda_kandi_qty+') ' : ''}${b.keda_pitthu_qty ? '🎒 Pitthu ('+b.keda_pitthu_qty+') ' : ''}</div>`;
        } else if (b.vaishno_ghoda_price > 0 || b.vaishno_dandi_price > 0 || b.vaishno_pitthu_price > 0) {
            trackingDetailsInfo = `<div style="margin-top:5px; color:#2980b9; font-size:12px;">⛰️ Vaishno Devi Trek Selected: ${b.vaishno_ghoda_price ? '🐴 Ghoda ('+b.vaishno_ghoda_price+') ' : ''}${b.vaishno_dandi_price ? '🪑 Palki ('+b.vaishno_dandi_price+') ' : ''}${b.vaishno_pitthu_price ? '🎒 Pithoo ('+b.vaishno_pitthu_price+') ' : ''}</div>`;
        }

        let friendlyStatus = b.status.toUpperCase();
        if(friendlyStatus === 'APPROVED') friendlyStatus = 'CONFIRMED (PENDING PAYMENT)';

        return `
        <div class="card" style="background:white; padding:25px; border-left:5px solid ${statusColor}; position:relative; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-radius:15px;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <h3 style="margin:0 0 10px 0; color:#2d3436;">${b.package_title}</h3>
                    <div style="font-size:13px; color:#636e72;">
                        <div style="margin-bottom:6px; color:#e67e22; font-weight:bold;">📅 Travel Date: ${b.travel_date ? new Date(b.travel_date).toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'}) : 'Not Set'}</div>
                        <div style="margin-bottom:4px;">🚗 Vehicles: ${b.selected_vehicles}</div>
                        ${trackingDetailsInfo}
                        <div style="margin-top:5px;">Status: <span style="padding:2px 8px; border-radius:10px; font-size:11px; background:#f0f0f0; color:${statusColor}; font-weight:bold;">${friendlyStatus}</span></div>
                    </div>
                </div>
                ${canCancel ? `<button onclick="cancelBookingWithPenalty(${b.id})" style="background:#ff7675; color:white; border:none; padding:8px 15px; font-size:12px; border-radius:8px; cursor:pointer; font-weight:bold;">✕ Cancel Booking</button>` : ''}
            </div>

            <div style="margin-top:20px; padding:15px; border-radius:10px; background:${isPaid ? '#f0fff4' : (isCancelled ? '#f1f2f6' : (isDenied ? '#ffeaa7' : '#f8f9fa'))}; border:1px solid ${isPaid ? '#2ecc71' : '#eee'};">
                ${isPaid ? `
                    <div style="text-align:center;">
                        <p style="margin:0 0 5px 0; font-size:12px; color:#27ae60; font-weight:bold;">✅ AGENCY CONTACT REVEALED</p>
                        <h2 style="margin:0; color:#2d3436;">${b.agency_contact || 'Contact info missing'}</h2>
                        <small style="color:#666;">Call now to coordinate your trip!</small>
                    </div>
                ` : (isCancelled ? `
                    <div style="text-align:center; color:#636e72;">
                        <p style="margin:0; font-weight:bold; color:#ff7675;">🚫 BOOKING CANCELLED</p>
                        <small>You cancelled this trip request.</small>
                    </div>
                ` : (isDenied ? `
                    <div style="text-align:center; color:#d63031;">
                        <p style="margin:0; font-weight:bold;">❌ REQUEST DECLINED</p>
                        <small>The travel agency has denied this booking request.</small>
                    </div>
                ` : `
                    <div style="text-align:center; color:#636e72;">
                        <p style="margin:0; font-size:13px;">🔒 Contact Details Locked</p>
                        <small>Available only after payment is confirmed</small>
                        ${isApproved ? `<button onclick="simulatePayment(${b.id})" style="margin-top:10px; background:#2ecc71; color:white; width:100%; padding:10px; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">PROCEED TO PAYMENT (₹${b.total_price})</button>` : ''}
                    </div>
                `))}
            </div>
        </div>`;
    }).join('');
};


/* =========================================================================
   🎒 AGENCY BOOKING PAYMENT CONFIRMATION
   ========================================================================= */
window.simulatePayment = async function(bookingId) {
    const client = getClient();
    const confirmed = confirm("Have you completed the payment using the agency payment details?\n\nClick OK only after payment is actually completed.");
    if (!confirmed) return;
    try {
        const { data: { user } } = await client.auth.getUser();
        if (!user) { alert("Please login first."); return; }

        const { data: booking, error: fetchError } = await client
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .eq('customer_id', user.id)
            .single();

        if (fetchError) throw fetchError;
        if (!['approved','confirmed'].includes(String(booking.status || '').toLowerCase())) {
            alert("Payment cannot be confirmed until the agency approves the booking.");
            return;
        }

        const { error } = await client
            .from('bookings')
            .update({ status: 'paid' })
            .eq('id', bookingId)
            .eq('customer_id', user.id);

        if (error) throw error;

        alert("✅ Payment marked as paid. The referral commission ledger has been updated.");
        await renderCustomerRequests();
    } catch (err) {
        console.error("Agency Payment Confirmation Error:", err);
        alert("Payment confirmation failed: " + err.message);
    }
};

window.cancelBookingWithPenalty = async function(id) {
    const disclaimer = "In case of cancellation, a non-refundable amount of 18% (2% Gateway + GST on transaction fee + 15% Service & Facilitation Fee) will be deducted from your total fund.\n\nDo you agree to proceed with the cancellation?";
    
    if (!confirm(disclaimer)) return;

    const client = getClient();
    try {
        const { error } = await client
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', id);

        if (!error) {
            alert("Booking Cancelled successfully.");
            renderCustomerRequests();
        } else {
            throw error;
        }
    } catch (e) {
        alert("Error during cancellation: " + e.message);
    }
};

window.showPackageDetails = function(pEncoded) {
    const p = JSON.parse(decodeURIComponent(pEncoded));
    window.currentBookingPackage = p;
    const modal = document.getElementById('detail-modal');
    const body = document.getElementById('detail-view-body');
    
    const historyList = p.updates_history || [];
    let historyHtml = '';
    if (historyList.length > 0) {
        const historyItems = historyList.map((h, i) => `
            <div style="padding:8px 0; border-bottom:1px solid #eee; margin-bottom:5px;">
                <div style="display:flex; justify-content:space-between;">
                    <b>Update #${i+1}</b>
                    <span style="font-size:10px; color:#999;">${new Date(h.updated_at).toLocaleDateString()}</span>
                </div>
                <div style="margin-top:4px;"><b>Title:</b> ${h.title}</div>
            </div>`).reverse().join('');
        
        historyHtml = `<div style="margin-top:20px; border-top: 1px dashed #ddd; padding-top:15px;">
            <details>
                <summary style="cursor:pointer; color:#ff9f43; font-size:13px; font-weight:bold;">View Previous Package Updates (${historyList.length})</summary>
                <div style="margin-top:10px; font-size:12px; color:#636e72; background:#f9f9f9; padding:10px; border-radius:8px;">${historyItems}</div>
            </details>
        </div>`;
    }

    const vehicleListHtml = (p.vehicles || []).map(v => `
        <div style="padding:15px; border:1px solid #eee; border-radius:12px; background:white; margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="checkbox" class="book-v-check" data-id="${v.id}" data-rate="${v.rate}" onchange="toggleQtyInput('${v.id}')" style="width:20px; height:20px; cursor:pointer;">
                    <span><b>${v.name}</b> <br> <small style="color:#666;">Available Units: ${v.max_cars || 1}</small></span>
                </div>
                <span style="color:#2ecc71; font-weight:bold;">₹${v.rate}</span>
            </div>
            <div id="qty-container-${v.id}" style="display:none; margin-top:15px; padding-top:15px; border-top:1px solid #f0f0f0;">
                <label style="font-size:12px; color:#636e72; display:block; margin-bottom:5px;">Quantity (Max: ${v.max_cars || 1})</label>
                <input type="number" class="book-v-qty" data-id="${v.id}" value="1" min="1" max="${v.max_cars || 1}" oninput="updateLivePrice()" style="width:80px; padding:8px; border:2px solid #ff9f43; border-radius:5px;">
            </div>
        </div>`).join('');

    const routeInfo = `${p.starting_location} ➔ ${Array.isArray(p.destination) ? p.destination.join(' ➔ ') : p.destination}`;
    const escapedTitle = p.title.replace(/'/g, "\\'");

    const destString = Array.isArray(p.destination) ? p.destination.join(' ').toLowerCase() : String(p.destination || '').toLowerCase();
    
    const isKedarnath = destString.includes("kedarnath") || destString.includes("char dham") || destString.includes("chardham");
    const isVaishnoDevi = destString.includes("vaishno") || destString.includes("katra");

    let kedaHtmlBlock = '';
    if (isKedarnath) {
        const kedarnathServices = [
            { id: 'ghoda', label: '🐴 Khachhar / Ghoda (Horse)', cost: parseFloat(p.ghoda_price) || 0, max: parseInt(p.ghoda_max) || 1 },
            { id: 'dandi', label: '🪑 Dandi (Palanquin)', cost: parseFloat(p.dandi_price) || 0, max: parseInt(p.dandi_max) || 1 },
            { id: 'kandi', label: '🧺 Kandi (Wicker Cradle)', cost: parseFloat(p.kandi_price) || 0, max: parseInt(p.kandi_max) || 1 },
            { id: 'pitthu', label: '🎒 Pitthu (Porter Service)', cost: parseFloat(p.pitthu_price) || 0, max: parseInt(p.pitthu_max) || 1 }
        ].filter(s => s.cost > 0);

        if (kedarnathServices.length > 0) {
            kedaHtmlBlock = `<h4 style="margin-top:20px; color:#e67e22;">Mountain Trek Services (Only for Kedarnath)</h4>`;
            kedaHtmlBlock += kedarnathServices.map(s => `
                <div style="padding:12px; border:1px solid #ffeaa7; background:#fffdf0; border-radius:10px; margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <input type="checkbox" class="book-trek-check" id="check-${s.id}" data-id="${s.id}" data-rate="${s.cost}" onchange="document.getElementById('trek-qty-box-${s.id}').style.display = this.checked ? 'block' : 'none'; updateLivePrice();">
                            <b>${s.label}</b>
                        </div>
                        <span style="color:#e67e22; font-weight:bold;">₹${s.cost} / person</span>
                    </div>
                    <div id="trek-qty-box-${s.id}" style="display:none; margin-top:10px;">
                        <label style="font-size:11px; font-weight:bold;">Number of Persons / Quantity (Max Allowed: ${s.max}):</label>
                        <input type="number" class="book-trek-qty" id="qty-${s.id}" data-id="${s.id}" value="1" min="1" max="${s.max}" oninput="updateLivePrice()" style="width:70px; padding:5px; border:1px solid #ccc; border-radius:5px; margin-left:5px;">
                    </div>
                </div>
              `).join('');
        }
    }

    let vaishnoHtmlBlock = '';
    if (isVaishnoDevi) {
        const vaishnoServices = [
            { id: 'vaishno_ghoda', label: '🐴 Horse (Ghoda) - Vaishno Devi', cost: parseFloat(p.vaishno_ghoda_price) || 0, max: parseInt(p.vaishno_ghoda_max) || 1 },
            { id: 'vaishno_palki', label: '🪑 Palanquin (Palki) - Vaishno Devi', cost: parseFloat(p.vaishno_palki_price) || 0, max: parseInt(p.vaishno_palki_max) || 1 },
            { id: 'vaishno_pitthu', label: '🎒 Porters (Pitthu) - Vaishno Devi', cost: parseFloat(p.vaishno_pitthu_price) || 0, max: parseInt(p.vaishno_pitthu_max) || 1 }
        ].filter(s => s.cost > 0);

        if (vaishnoServices.length > 0) {
            vaishnoHtmlBlock = `<h4 style="margin-top:20px; color:#2980b9;">Mountain Trek Services (Only for Vaishno Devi)</h4>`;
            vaishnoHtmlBlock += vaishnoServices.map(s => `
                <div style="padding:12px; border:1px solid #b2bec3; background:#f5f6fa; border-radius:10px; margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <input type="checkbox" class="book-trek-check" id="check-${s.id}" data-id="${s.id}" data-rate="${s.cost}" onchange="document.getElementById('trek-qty-box-${s.id}').style.display = this.checked ? 'block' : 'none'; updateLivePrice();">
                            <b>${s.label}</b>
                        </div>
                        <span style="color:#2980b9; font-weight:bold;">₹${s.cost} / person</span>
                    </div>
                    <div id="trek-qty-box-${s.id}" style="display:none; margin-top:10px;">
                        <label style="font-size:11px; font-weight:bold;">Number of Persons / Quantity (Max Allowed: ${s.max}):</label>
                        <input type="number" class="book-trek-qty" id="qty-${s.id}" data-id="${s.id}" value="1" min="1" max="${s.max}" oninput="updateLivePrice()" style="width:70px; padding:5px; border:1px solid #ccc; border-radius:5px; margin-left:5px;">
                    </div>
                </div>
              `).join('');
        }
    }

    const trekServicesHtml = kedaHtmlBlock + vaishnoHtmlBlock;

    body.innerHTML = `
        <div style="text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <h2 style="margin:0; color:#2d3436;">${p.title}</h2>
                <button onclick="document.getElementById('detail-modal').style.display='none'" style="background:none; border:none; font-size:28px; color:#999; cursor:pointer; line-height:1;">✕</button>
            </div>
            <p style="color:#ff9f43; font-weight:bold; font-size:1.1rem; margin:10px 0;">Routes: ${routeInfo}</p>
            ${Number(p.pickup_km_rate) > 0 ? `
                <div style="margin:10px 0 20px; padding:12px 15px; background:#fff8f0; border:1px solid #ffeaa7; border-radius:10px;">
                    <b style="color:#e67e22;">🚗 Customer Pickup Distance Charge: ₹${Number(p.pickup_km_rate).toLocaleString('en-IN')} / km</b>
                    <div style="font-size:12px; color:#666; margin-top:5px; line-height:1.5;">
                        We will calculate the road distance from the package starting location to your pickup location and add the applicable distance charge to your package total.
                    </div>
                </div>
            ` : ''}
            
            <div style="margin:20px 0; padding:15px; background:#f9f9f9; border-radius:12px; font-size:14px;">
                <h4 style="margin-top:0;">Itinerary / Description</h4>
                <p style="white-space: pre-line; color:#636e72; line-height:1.6;">${p.description || 'No description provided.'}</p>
            </div>
            
            <div style="background:#fff4e6; padding:20px; border-radius:15px; border:1px solid #ffd8a8; margin-bottom:20px;">
                <h4 style="margin-top:0; color:#e67e22;">📅 SELECT TRAVEL DATE</h4>
                <input type="date" id="cust-travel-date" 
                       min="${new Date().toISOString().split('T')[0]}" 
                       style="width:100%; padding:15px; border:2px solid #ff9f43; border-radius:10px; font-weight:bold; color:#2d3436; font-family:inherit; font-size:16px; background:white; display:block; appearance: none; -webkit-appearance: none;">
                <small style="color:#636e72; display:block; margin-top:5px;">Click the icon or the field to open the calendar</small>
            </div>

            <h4>Select Vehicles to Book</h4>
            <div style="display:grid; gap:5px;">${vehicleListHtml}</div>

            <div id="trek-addons-placeholder">
                ${trekServicesHtml}
            </div>

            <div style="margin-top:25px; background:#2d3436; color:white; padding:15px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold;">ESTIMATED PACKAGE TOTAL:</span>
                <span id="live-total-display" style="font-size:22px; font-weight:bold; color:#ff9f43;">₹0</span>
            </div>

            <div style="margin-top:25px; border-top: 2px solid #eee; padding-top:20px;">
                <h4 style="margin-top:0; color:#2d3436;">Pickup & Contact Details</h4>
                <div style="display:grid; gap:15px;">
                    <div>
                        <label style="font-size:12px; color:#636e72; font-weight:bold; display:block; margin-bottom:5px;">🏠 FULL PICKUP ADDRESS</label>
                        <textarea id="cust-address" placeholder="e.g. Flat 101, Sunny Heights, Sector 15, Meerut..." style="width:100%; height:70px; padding:12px; border:1px solid #ddd; border-radius:8px; box-sizing:border-box; font-family:inherit;"></textarea><small style="display:block; margin-top:6px; color:#777; font-size:11px;">Pickup distance charge is calculated after you enter your address and send the booking request.</small>
                    </div>
                    <div>
                        <label style="font-size:12px; color:#636e72; font-weight:bold; display:block; margin-bottom:5px;">📞 MOBILE NUMBER</label>
                        <input type="text" id="cust-phone" placeholder="Enter 10-digit number" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                    </div>
                </div>
            </div>

            ${historyHtml}

            <div style="margin-top:30px; display:flex; gap:10px;">
                <button onclick="handleBookingInquiry('${p.id}', '${escapedTitle}', '${p.agency_id}', '${p.agency_email}')" style="flex:2; background:#ff9f43; color:white; padding:15px; font-weight:bold; cursor:pointer; border-radius:10px; border:none; transition:0.3s; font-size:16px;">SEND BOOKING REQUEST</button>
                <button onclick="document.getElementById('detail-modal').style.display='none'" style="flex:1; background:#eee; padding:15px; border-radius:10px; cursor:pointer; border:none; font-weight:bold; color:#666;">BACK</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
};

window.updateLivePrice = function() {
    let total=0;
    document.querySelectorAll('.book-v-check:checked').forEach(checkbox=>{
        const id=checkbox.dataset.id;
        const rate=parseFloat(checkbox.dataset.rate)||0;
        const qtyInput=document.querySelector(`.book-v-qty[data-id="${id}"]`);
        const qty=qtyInput?(parseInt(qtyInput.value,10)||1):1;
        total+=rate*qty;
    });
    document.querySelectorAll('.book-trek-check:checked').forEach(checkbox=>{
        const id=checkbox.dataset.id;
        const rate=parseFloat(checkbox.dataset.rate)||0;
        const qtyInput=document.getElementById(`qty-${id}`);
        const qty=qtyInput?(parseInt(qtyInput.value,10)||1):1;
        total+=rate*qty;
    });
    total+=Number(window.currentPickupDistanceCharge)||0;
    const totalEl=document.getElementById('live-total-display');
    if(totalEl)totalEl.innerText=`₹${total.toLocaleString('en-IN')}`;
};

window.toggleQtyInput = (id) => {
    const container = document.getElementById(`qty-container-${id}`);
    const checkbox = document.querySelector(`.book-v-check[data-id="${id}"]`);
    if (container) container.style.display = checkbox.checked ? 'block' : 'none';
    updateLivePrice();
};

/* ============================================================
   CUSTOMER PICKUP DISTANCE PRICING
   Uses Nominatim geocoding + OSRM road distance.
   ============================================================ */
const UTTARAKHAND_PICKUP_CITIES = ["Almora","Ranikhet","Dwarahat","Chaukhutia","Bhikiyasen","Bageshwar","Kapkot","Garur","Champawat","Banbasa","Tanakpur","Lohaghat","Pati","Gopeshwar","Joshimath","Gauchar","Karnaprayag","Nandprayag","Badrinath","Pokhari","Tharali","Gairsain","Pipalkoti","Nandanagar","Dehradun","Rishikesh","Vikasnagar","Mussoorie","Herbertpur","Selaqui","Doiwala","Haridwar","Roorkee","Adampur-Sultanpur","Dhandera","Imlikhera","Padligurjar","Rampur","Manglaur","Jhabreda","Laksar","Landhaura","Shivalik Nagar","Bhagwanpur","Piran Kaliyer","Haldwani","Ramnagar","Bhowali","Kaladhungi","Lalkuan","Nainital","Bhimtal","Pauri","Srinagar","Swargashram-Jaunk","Satpuli","Dogadda","Kotdwar","Thalisain","Pithoragarh","Dharchula","Didihat","Gangolihat","Berinag","Munsyari","Rudraprayag","Kedarnath","Augustmuni","Tilwara","Ukhimath","Guptkashi","Tehri","Narendranagar","Chamba","Muni-ki-Reti","Kirtinagar","Devprayag","Gaja","Ghansali","Lambgaon","Chamiyala","Tapovan","Gadarpur","Jaspur","Kichha","Sitarganj","Bazpur","Khatima","Mahuakheraganj","Mahuwadawara","Sultanpur","Kelakheda","Dineshpur","Shaktigarh","Nanakmatta","Gularbhoj","Kashipur","Rudrapur","Nagla","Lalpur","Garhinegi","Seroli Kalan","Uttarkashi","Barkot","Chinyalisaur","Gangotri","Purola","Naugaon"];
window.currentPickupDistanceCharge = 0;
window.currentPickupDistanceKm = 0;
window.pickupDistanceRequestId = 0;

window.updatePickupDistancePreview = async function() {
    const cityEl=document.getElementById('cust-city');
    const distanceEl=document.getElementById('pickup-distance-value');
    const chargeEl=document.getElementById('pickup-distance-charge');
    if(!cityEl||!distanceEl||!chargeEl) return;

    const customerCity=cityEl.value.trim();
    const packageData=window.currentBookingPackage||{};
    const startingCity=String(packageData.starting_location||'').trim();
    const pickupKmRate=Number(packageData.pickup_km_rate)||0;
    const requestId=++window.pickupDistanceRequestId;

    window.currentPickupDistanceCharge=0;
    window.currentPickupDistanceKm=0;
    if(typeof window.updateLivePrice==='function') window.updateLivePrice();

    if(!customerCity){distanceEl.innerText='Select a city';chargeEl.innerText='₹0';return;}
    if(!startingCity){distanceEl.innerText='Agency starting city unavailable';chargeEl.innerText='₹0';return;}
    if(pickupKmRate<=0){distanceEl.innerText='Rate not configured';chargeEl.innerText='₹0';return;}
    if(startingCity.toLowerCase()===customerCity.toLowerCase()){distanceEl.innerText='0 km';chargeEl.innerText='₹0';return;}

    distanceEl.innerText='Calculating...';chargeEl.innerText='...';
    try{
        const result=await calculatePackagePickupDistance(startingCity,customerCity,pickupKmRate);
        if(requestId!==window.pickupDistanceRequestId)return;
        window.currentPickupDistanceKm=result.distanceKm;
        window.currentPickupDistanceCharge=result.charge;
        distanceEl.innerText=`${result.distanceKm.toLocaleString('en-IN')} km`;
        chargeEl.innerText=`₹${result.charge.toLocaleString('en-IN')}`;
        if(typeof window.updateLivePrice==='function')window.updateLivePrice();
    }catch(error){
        if(requestId!==window.pickupDistanceRequestId)return;
        console.error('Pickup distance preview error:',error);
        distanceEl.innerText='Distance unavailable';chargeEl.innerText='₹0';
        if(typeof window.updateLivePrice==='function')window.updateLivePrice();
    }
};

async function calculatePackagePickupDistance(packageStartLocation, customerPickupAddress, pickupKmRate) {
    const rate=Number(pickupKmRate)||0;
    if(rate<=0) return {distanceKm:0,charge:0,origin:packageStartLocation,destination:customerPickupAddress};
    const geocode=async(query)=>{
        const response=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`,{headers:{'Accept-Language':'en-IN'}});
        if(!response.ok) throw new Error("Unable to find pickup location.");
        const results=await response.json();
        if(!results.length) throw new Error(`Location not found: ${query}`);
        return {lat:Number(results[0].lat),lon:Number(results[0].lon),displayName:results[0].display_name};
    };
    const origin=await geocode(packageStartLocation+", Uttarakhand, India");
    const destination=await geocode(customerPickupAddress+", Uttarakhand, India");
    const routeResponse=await fetch(`https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=false`);
    if(!routeResponse.ok) throw new Error("Unable to calculate pickup road distance.");
    const routeData=await routeResponse.json();
    const route=routeData.routes?.[0];
    if(!route) throw new Error("No drivable route found between package and pickup locations.");
    const distanceKm=Number((route.distance/1000).toFixed(2));
    return {distanceKm,charge:Number((distanceKm*rate).toFixed(2)),origin:origin.displayName,destination:destination.displayName};
}

window.handleBookingInquiry = async function(packageId,packageTitle,agencyId,agencyEmail){
    const client=getClient();
    const {data:{user}}=await client.auth.getUser();
    if(!user){alert("❌ Please login again before sending a booking request.");return;}

    const city=document.getElementById('cust-city')?.value.trim()||'';
    const phone=document.getElementById('cust-phone')?.value.trim()||'';
    const travelDate=document.getElementById('cust-travel-date')?.value||'';
    if(!city||!phone||!travelDate){alert("❌ Please select pickup city, travel date and enter your 10-digit phone number!");return;}
    if(!/^[6-9]\d{9}$/.test(phone)){alert("❌ Please enter a valid 10-digit mobile number.");return;}
    const policy=document.getElementById('policy-consent');
    if(policy&&!policy.checked){alert("❌ Please accept the Cancellation & Refund Policy.");return;}

    let totalPrice=0;
    const selectedVehicles=Array.from(document.querySelectorAll('.book-v-check:checked')).map(el=>{
        const id=el.dataset.id;
        const rate=parseFloat(el.dataset.rate)||0;
        const qty=parseInt(document.querySelector(`.book-v-qty[data-id="${id}"]`)?.value,10)||1;
        totalPrice+=rate*qty;
        return `${qty}x vehicle_id:${id}`;
    });
    if(selectedVehicles.length===0){alert("❌ Please select at least one vehicle to book.");return;}

    // Preserve existing trekking/add-on quantities.
    const ghodaQty=parseInt(document.getElementById('qty-ghoda')?.value,10)||0;
    const dandiQty=parseInt(document.getElementById('qty-dandi')?.value,10)||0;
    const kandiQty=parseInt(document.getElementById('qty-kandi')?.value,10)||0;
    const pitthuQty=parseInt(document.getElementById('qty-pitthu')?.value,10)||0;
    const vGhodaQty=parseInt(document.getElementById('qty-vaishno_ghoda')?.value,10)||0;
    const vPalkiQty=parseInt(document.getElementById('qty-vaishno_palki')?.value,10)||0;
    const vPitthuQty=parseInt(document.getElementById('qty-vaishno_pitthu')?.value,10)||0;

    const packageData=window.currentBookingPackage||{};
    const pickupKmRate=Number(packageData.pickup_km_rate)||0;
    let pickupDistanceKm=Number(window.currentPickupDistanceKm)||0;
    let pickupDistanceCharge=Number(window.currentPickupDistanceCharge)||0;
    let pickupOrigin=packageData.starting_location||'';
    let pickupDestination=city;

    try{
        if(pickupKmRate>0&&pickupDistanceKm<=0&&pickupOrigin.toLowerCase()!==city.toLowerCase()){
            const result=await calculatePackagePickupDistance(pickupOrigin,city,pickupKmRate);
            pickupDistanceKm=result.distanceKm;
            pickupDistanceCharge=result.charge;
            pickupOrigin=result.origin;
            pickupDestination=result.destination;
        }
        totalPrice+=pickupDistanceCharge;

        const {data,error}=await client.from('bookings').insert([{
            package_id:packageId,package_title:packageTitle,customer_id:user.id,customer_email:user.email,
            customer_address:city,customer_phone:phone,travel_date:travelDate,
            selected_vehicles:selectedVehicles.join(', '),total_price:Number(totalPrice.toFixed(2)),status:'pending',
            agency_id:agencyId,agency_email:agencyEmail,
            pickup_km_rate:Number(pickupKmRate.toFixed(2)),pickup_distance_km:Number(pickupDistanceKm.toFixed(2)),
            pickup_distance_charge:Number(pickupDistanceCharge.toFixed(2)),pickup_distance_origin:pickupOrigin,
            pickup_distance_destination:pickupDestination,
            keda_ghoda_qty:ghodaQty,keda_dandi_qty:dandiQty,keda_kandi_qty:kandiQty,keda_pitthu_qty:pitthuQty,
            vaishno_ghoda_qty:vGhodaQty,vaishno_palki_qty:vPalkiQty,vaishno_pitthu_qty:vPitthuQty
        }]);
        if(error)throw error;

        // Push the request to the agency immediately. This call is
        // intentionally non-blocking so notification issues cannot
        // break an otherwise successful booking.
        const createdBookingId = data?.[0]?.id;
        if (createdBookingId) {
            void window.sendTourSetuBookingNotification(createdBookingId, 'agency');
        }

        alert(`✅ Success! Request sent for ${new Date(travelDate).toLocaleDateString('en-IN')}.
Pickup city: ${city}
Pickup distance: ${pickupDistanceKm} km
Pickup charge: ₹${pickupDistanceCharge.toLocaleString('en-IN')}
Total: ₹${Number(totalPrice).toLocaleString('en-IN')}`);
        document.getElementById('detail-modal').style.display='none';
        if(typeof window.renderCustomerRequests==='function')window.renderCustomerRequests();
    }catch(e){console.error("Booking distance/save error:",e);alert("❌ "+e.message);}
};

// 7. MATCHING & CARD RENDERING
window.searchMatchedAgencies = async function() {
    const start = document.getElementById('search-start').value;
    const dest = document.getElementById('search-dest').value;
    const container = document.getElementById('customer-pkg-list');
    
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px;"><h3>Searching for Agency Matches...</h3></div>`;
    
    const { data, error } = await getClient().from('packages').select('*');
    if (error) {
       container.innerHTML = `<div style="grid-column:1/-1; text-align:center;"><h3>Error loading data.</h3></div>`;
        return;
    }

    let matchedData = data || [];
    if (start) matchedData = matchedData.filter(p => p.starting_location === start);
    if (dest) {
        matchedData = matchedData.filter(p => {
            const pDest = p.destination || [];
            if (Array.isArray(pDest)) return pDest.includes(dest);
            if (typeof pDest === 'string') return pDest.includes(dest);
            return false;
        });
    }

    renderPackageCards(matchedData, true);
};

async function loadAllPackages() {
    const { data } = await getClient().from('packages').select('*').limit(12);
    renderPackageCards(data || [], false);
}

function renderPackageCards(data, isFiltered) {
    const container = document.getElementById('customer-pkg-list');
    if (!data || data.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:60px;"><h3>No Matches Found</h3><button onclick="loadAllPackages()" style="width:auto; padding:10px 20px; background:#eee;">View All</button></div>`;
        return;
    }

    container.innerHTML = data.map(p => {
        const vels = p.vehicles || [];
        const rates = (vels.length > 0) ? vels.map(v => v.rate) : [0];
        const minPrice = Math.min(...rates);
        const destDisplay = Array.isArray(p.destination) ? p.destination.slice(0,2).join(', ') : (p.destination || 'N/A');
        const pString = encodeURIComponent(JSON.stringify(p));

        return `
        <div class="card result-card" style="background:white; overflow:hidden; border:1px solid #eee; cursor:pointer;" onclick="showPackageDetails('${pString}')">
            <div style="padding:25px;">
                <h3 style="margin:0;">${p.title}</h3>
                <p style="color:#ff9f43; font-weight:bold;">Starts from ₹${minPrice}</p>
               <div style="font-size:13px; color:#636e72; margin:15px 0;">
                   <div>🚩 <b>From:</b> ${p.starting_location}</div>
                   ${p._cityMatchType === 'nearby' ? `<div style="margin-top:8px;display:inline-block;padding:5px 9px;background:#eef6ff;color:#2563eb;border-radius:999px;font-size:10px;font-weight:800;">📍 NEARBY OPERATOR${Number.isFinite(p._cityMatchDistance) ? ` • ${Math.round(p._cityMatchDistance)} km away` : ''}</div>` : ''}
                   <div style="margin-top:5px;">📍 <b>To:</b> ${destDisplay}...</div>
               </div>
               <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:15px;">
                   ${vels.map(v => `<span style="font-size:10px; background:#f0f0f0; padding:3px 8px; border-radius:4px;">${v.name}</span>`).join('')}
               </div>
               <button style="background:#ff9f43; color:white; width:100%; padding:12px;">VIEW DETAILS</button>
            </div>
        </div>`;
    }).join('');
}

// 7. MATCHING & CARD RENDERING
window.searchMatchedAgencies = async function() {
    const start = document.getElementById('search-start').value;
    const dest = document.getElementById('search-dest').value;
    const container = document.getElementById('customer-pkg-list');
    
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px;"><h3>Searching for Agency Matches...</h3></div>`;
    
    const { data, error } = await getClient().from('packages').select('*');
    if (error) {
       container.innerHTML = `<div style="grid-column:1/-1; text-align:center;"><h3>Error loading data.</h3></div>`;
        return;
    }

    let matchedData = data || [];
    if (start) matchedData = matchedData.filter(p => p.starting_location === start);
    if (dest) {
        matchedData = matchedData.filter(p => {
            const pDest = p.destination || [];
            if (Array.isArray(pDest)) return pDest.includes(dest);
            if (typeof pDest === 'string') return pDest.includes(dest);
            return false;
        });
    }

    renderPackageCards(matchedData, true);
};

async function loadAllPackages() {
    const { data } = await getClient().from('packages').select('*').limit(12);
    renderPackageCards(data || [], false);
}

function renderPackageCards(data, isFiltered) {
    const container = document.getElementById('customer-pkg-list');
    if (!data || data.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:60px;"><h3>No Matches Found</h3><button onclick="loadAllPackages()" style="width:auto; padding:10px 20px; background:#eee;">View All</button></div>`;
        return;
    }

    container.innerHTML = data.map(p => {
        const vels = p.vehicles || [];
        const rates = (vels.length > 0) ? vels.map(v => v.rate) : [0];
        const minPrice = Math.min(...rates);
        const destDisplay = Array.isArray(p.destination) ? p.destination.slice(0,2).join(', ') : (p.destination || 'N/A');
        const pString = encodeURIComponent(JSON.stringify(p));

        return `
        <div class="card result-card" style="background:white; overflow:hidden; border:1px solid #eee; cursor:pointer;" onclick="showPackageDetails('${pString}')">
            <div style="padding:25px;">
                <h3 style="margin:0;">${p.title}</h3>
                <p style="color:#ff9f43; font-weight:bold;">Starts from ₹${minPrice}</p>
               <div style="font-size:13px; color:#636e72; margin:15px 0;">
                   <div>🚩 <b>From:</b> ${p.starting_location}</div>
                   <div style="margin-top:5px;">📍 <b>To:</b> ${destDisplay}...</div>
               </div>
               <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:15px;">
                   ${vels.map(v => `<span style="font-size:10px; background:#f0f0f0; padding:3px 8px; border-radius:4px;">${v.name}</span>`).join('')}
               </div>
               <button style="background:#ff9f43; color:white; width:100%; padding:12px;">VIEW DETAILS</button>
            </div>
        </div>`;
    }).join('');
}
// 7. MATCHING & CARD RENDERING
window.searchMatchedAgencies = async function() {
    const start = document.getElementById('search-start').value;
    const dest = document.getElementById('search-dest').value;
    const container = document.getElementById('customer-pkg-list');
    
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px;"><h3>Searching for Agency Matches...</h3></div>`;
    
    const { data, error } = await getClient().from('packages').select('*');
    if (error) {
       container.innerHTML = `<div style="grid-column:1/-1; text-align:center;"><h3>Error loading data.</h3></div>`;
        return;
    }

    let matchedData = data || [];
    if (start) matchedData = matchedData.filter(p => p.starting_location === start);
    if (dest) {
        matchedData = matchedData.filter(p => {
            const pDest = p.destination || [];
            if (Array.isArray(pDest)) return pDest.includes(dest);
            if (typeof pDest === 'string') return pDest.includes(dest);
            return false;
        });
    }

    renderPackageCards(matchedData, true);
};

async function loadAllPackages() {
    const { data } = await getClient().from('packages').select('*').limit(12);
    renderPackageCards(data || [], false);
}

function renderPackageCards(data, isFiltered) {
    const container = document.getElementById('customer-pkg-list');
    if (!data || data.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:60px;"><h3>No Matches Found</h3><button onclick="loadAllPackages()" style="width:auto; padding:10px 20px; background:#eee;">View All</button></div>`;
        return;
    }

    container.innerHTML = data.map(p => {
        const vels = p.vehicles || [];
        const rates = (vels.length > 0) ? vels.map(v => v.rate) : [0];
        const minPrice = Math.min(...rates);
        const destDisplay = Array.isArray(p.destination) ? p.destination.slice(0,2).join(', ') : (p.destination || 'N/A');
        const pString = encodeURIComponent(JSON.stringify(p));

        return `
        <div class="card result-card" style="background:white; overflow:hidden; border:1px solid #eee; cursor:pointer;" onclick="showPackageDetails('${pString}')">
            <div style="padding:25px;">
                <h3 style="margin:0;">${p.title}</h3>
                <p style="color:#ff9f43; font-weight:bold;">Starts from ₹${minPrice}</p>
               <div style="font-size:13px; color:#636e72; margin:15px 0;">
                   <div>🚩 <b>From:</b> ${p.starting_location}</div>
                   <div style="margin-top:5px;">📍 <b>To:</b> ${destDisplay}...</div>
               </div>
               <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:15px;">
                   ${vels.map(v => `<span style="font-size:10px; background:#f0f0f0; padding:3px 8px; border-radius:4px;">${v.name}</span>`).join('')}
               </div>
               <button style="background:#ff9f43; color:white; width:100%; padding:12px;">VIEW DETAILS</button>
            </div>
        </div>`;
    }).join('');
}
/* =========================================================================
   SMART CITY / STATE FALLBACK MATCHING
   - Exact selected city packages are shown first.
   - If none exist, packages from the selected state are shown.
   - Same-state package cities are ranked by real geographic proximity to
     the selected city using OpenStreetMap geocoding + Haversine distance.
   - Geocoded coordinates are cached in sessionStorage to avoid repeated calls.
   ========================================================================= */

const CITY_MATCH_GEO_CACHE_KEY = 'toursetu_city_geo_cache_v1';

function normalizeMatchCity(value) {
    return String(value || '').trim().toLowerCase().replace(/\\s+/g, ' ');
}

function getCityState(city) {
    const target = normalizeMatchCity(city);
    if (!target) return '';
    for (const [state, cities] of Object.entries(locationData || {})) {
        if ((cities || []).some(c => normalizeMatchCity(c) === target)) return state;
    }
    return '';
}

function getCityGeoCache() {
    try { return JSON.parse(sessionStorage.getItem(CITY_MATCH_GEO_CACHE_KEY) || '{}'); }
    catch (_) { return {}; }
}

function saveCityGeoCache(cache) {
    try { sessionStorage.setItem(CITY_MATCH_GEO_CACHE_KEY, JSON.stringify(cache)); } catch (_) {}
}

async function geocodeMatchCity(city, state) {
    const key = normalizeMatchCity(city) + '|' + normalizeMatchCity(state);
    const cache = getCityGeoCache();
    if (cache[key]) return cache[key];

    try {
        const query = encodeURIComponent(city + ', ' + state + ', India');
        const response = await fetch(
            'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=' + query,
            { headers: { 'Accept-Language': 'en-IN' } }
        );
        if (!response.ok) return null;
        const results = await response.json();
        if (!results.length) return null;

        const point = { lat: Number(results[0].lat), lon: Number(results[0].lon) };
        if (Number.isFinite(point.lat) && Number.isFinite(point.lon)) {
            cache[key] = point;
            saveCityGeoCache(cache);
            return point;
        }
    } catch (error) {
        console.warn('City proximity geocoding failed for', city, state, error);
    }
    return null;
}

function cityDistanceKm(a, b) {
    if (!a || !b) return Number.POSITIVE_INFINITY;
    const toRad = degrees => degrees * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

window.searchMatchedAgencies = async function() {
    const start = document.getElementById('search-start')?.value?.trim() || '';
    const dest = document.getElementById('search-dest')?.value?.trim() || '';
    const container = document.getElementById('customer-pkg-list');

    if (!container) return;

    container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:55px 20px;">
            <div style="font-size:32px;">🔎</div>
            <h3 style="margin:10px 0 6px;">Finding operators near ${start || 'your selected city'}...</h3>
            <p style="color:#636e72;margin:0;">Checking the selected city first, then nearby cities in the same state.</p>
        </div>`;

    const { data, error } = await getClient()
        .from('packages')
        .select('*');

    if (error) {
        console.error('Agency matching error:', error);
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:50px;">
                <h3>Unable to load operators</h3>
                <p style="color:#636e72;">Please try again.</p>
            </div>`;
        return;
    }

    let packages = data || [];

    // Destination remains an independent filter.
    if (dest) {
        packages = packages.filter(p => {
            const pDest = p.destination || [];
            if (Array.isArray(pDest)) {
                return pDest.some(value => normalizeMatchCity(value) === normalizeMatchCity(dest));
            }
            return normalizeMatchCity(pDest).includes(normalizeMatchCity(dest));
        });
    }

    if (!start) {
        renderPackageCards(packages, false);
        return;
    }

    const selectedState = getCityState(start);
    const exact = packages.filter(
        p => normalizeMatchCity(p.starting_location) === normalizeMatchCity(start)
    );

    // Normal case: selected city has operators.
    if (exact.length) {
        renderPackageCards(exact.map(p => ({ ...p, _cityMatchType: 'selected', _cityMatchDistance: 0 })), true);
        return;
    }

    // No exact city operator: restrict fallback to the same state.
    const sameState = selectedState
        ? packages.filter(p => getCityState(p.starting_location) === selectedState)
        : [];

    if (!sameState.length) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:55px 20px;background:#fff;border-radius:14px;">
                <div style="font-size:38px;">📍</div>
                <h3 style="margin:10px 0 6px;">No operators found in ${start}</h3>
                <p style="color:#636e72;margin:0 0 18px;">
                    We also checked other operator cities in ${selectedState || 'the selected area'}.
                </p>
                <button onclick="loadAllPackages()" style="width:auto;padding:10px 18px;background:#ff9f43;color:#fff;border:0;border-radius:8px;font-weight:800;cursor:pointer;">VIEW ALL OPERATORS</button>
            </div>`;
        return;
    }

    const selectedPoint = await geocodeMatchCity(start, selectedState);
    const uniqueCities = [...new Set(sameState.map(p => String(p.starting_location || '').trim()).filter(Boolean))];

    // Geocode the operator cities concurrently, then rank by actual distance.
    const geoEntries = await Promise.all(
        uniqueCities.map(async city => ({
            city,
            point: await geocodeMatchCity(city, selectedState)
        }))
    );

    const distanceByCity = {};
    geoEntries.forEach(entry => {
        distanceByCity[normalizeMatchCity(entry.city)] =
            cityDistanceKm(selectedPoint, entry.point);
    });

    const ranked = sameState
        .map(p => ({
            ...p,
            _cityMatchType: 'nearby',
            _cityMatchDistance: distanceByCity[normalizeMatchCity(p.starting_location)] ?? Number.POSITIVE_INFINITY
        }))
        .sort((a, b) => a._cityMatchDistance - b._cityMatchDistance);

    renderPackageCards(ranked, true);
};

/* =========================================================================
   PACKAGE DETAIL / CUSTOMER BOOKING MODAL 
   - Shows package duration 
   - Calculates tour end date 
   - Shows vehicle seat capacity 
   - Trekking add-ons removed 
   ========================================================================= */ 
 
window.showPackageDetails = function(pEncoded) { 
 
    const p = JSON.parse(decodeURIComponent(pEncoded));
    window.currentBookingPackage = p; 
 
    const modal = document.getElementById('detail-modal'); 
    const body = document.getElementById('detail-view-body'); 
 
    if (!modal || !body) { 
        console.error("Package detail modal elements not found."); 
        return; 
    } 
 
 
    /* ========================================================= 
       1. PACKAGE BASIC DATA 
       ========================================================= */ 
 
    const vehicleList = Array.isArray(p.vehicles) 
        ? p.vehicles 
        : []; 
 
    const destinations = Array.isArray(p.destination) 
        ? p.destination 
        : ( 
            Array.isArray(p.destinations) 
                ? p.destinations 
                : [p.destination || ''] 
        ); 
 
    const routeInfo = 
        `${p.starting_location || 'N/A'} ➔ ${destinations.filter(Boolean).join(' ➔ ')}`; 
 
 
    /* ========================================================= 
       2. TOUR DURATION 
       Reads tour_days from packages table 
       ========================================================= */ 
 
    const tourDays = parseInt(p.tour_days, 10) || 1; 
 
 
    /* ========================================================= 
       3. TRAVEL DATE LIMIT 
       Existing rule: customer can select within 7 days 
       ========================================================= */ 
 
    const today = new Date(); 
 
    const minStr = 
        today.toISOString().split('T')[0]; 
 
    const limitDate = new Date(today); 
 
    limitDate.setDate( 
        today.getDate() + 7 
    ); 
 
    const limitStr = 
        limitDate.toISOString().split('T')[0]; 
 
 
    /* ========================================================= 
       4. VEHICLE DISPLAY 
       Tempo Traveler = 26 Seater 
       Luxury Bus = 60 Seater 
 
       IMPORTANT: 
       Database vehicle IDs/rates are NOT changed. 
       Only display name is changed. 
       ========================================================= */ 
 
    const vehicleHtml = vehicleList.map(v => { 
 
        let vehicleName = v.name || 'Vehicle'; 
 
        if ( 
            vehicleName.toLowerCase().includes('tempo traveler') 
        ) { 
            vehicleName = 'Tempo Traveler (26 Seater)'; 
        } 
 
        if ( 
            vehicleName.toLowerCase().includes('luxury bus') 
        ) { 
            vehicleName = 'Luxury Bus (60 Seater)'; 
        } 
 
 
        const maxVehicles = 
            parseInt(v.max_cars, 10) || 1; 
 
        const vehicleRate = 
            parseFloat(v.rate) || 0; 
 
 
        return ` 
            <div 
                style=" 
                    padding:16px; 
                    border:1px solid #e5e7eb; 
                    border-radius:12px; 
                    background:#ffffff; 
                    margin-bottom:10px; 
                    transition:all 0.2s ease; 
                " 
            > 
 
                <div 
                    style=" 
                        display:flex; 
                        justify-content:space-between; 
                        align-items:center; 
                        gap:12px; 
                    " 
                > 
 
                    <div 
                        style=" 
                            display:flex; 
                            align-items:center; 
                            gap:10px; 
                            flex:1; 
                        " 
                    > 
 
                        <input 
                            type="checkbox" 
                            class="book-v-check" 
                            data-id="${v.id}" 
                            data-rate="${vehicleRate}" 
                            onchange=" 
                                toggleQtyInput('${v.id}'); 
                                updateLivePrice(); 
                            " 
                            style=" 
                                width:20px; 
                                height:20px; 
                                cursor:pointer; 
                                flex-shrink:0; 
                            " 
                        > 
 
                        <div> 
 
                            <div 
                                style=" 
                                    font-weight:700; 
                                    color:#2d3436; 
                                    font-size:15px; 
                                " 
                            > 
                                ${vehicleName} 
                            </div> 
 
                            <div 
                                style=" 
                                    margin-top:4px; 
                                    color:#777; 
                                    font-size:12px; 
                                " 
                            > 
                                Available Units: 
                                <b>${maxVehicles}</b> 
                            </div> 
 
                        </div> 
 
                    </div> 
 
 
                    <div 
                        style=" 
                            color:#2ecc71; 
                            font-size:16px; 
                            font-weight:800; 
                            white-space:nowrap; 
                        " 
                    > 
                        ₹${vehicleRate.toLocaleString('en-IN')} 
                    </div> 
 
                </div> 
 
 
                <div 
                    id="qty-container-${v.id}" 
                    style=" 
                        display:none; 
                        margin-top:14px; 
                        padding-top:14px; 
                        border-top:1px solid #f0f0f0; 
                    " 
                > 
 
                    <label 
                        style=" 
                            font-size:12px; 
                            color:#636e72; 
                            font-weight:700; 
                            display:block; 
                            margin-bottom:6px; 
                        " 
                    > 
                        NUMBER OF VEHICLES 
                    </label> 
 
                    <input 
                        type="number" 
                        class="book-v-qty" 
                        data-id="${v.id}" 
                        value="1" 
                        min="1" 
                        max="${maxVehicles}" 
                        oninput="updateLivePrice()" 
                        style=" 
                            width:90px; 
                            padding:9px; 
                            border:2px solid #ff9f43; 
                            border-radius:7px; 
                            box-sizing:border-box; 
                        " 
                    > 
 
                    <span 
                        style=" 
                            margin-left:8px; 
                            color:#888; 
                            font-size:12px; 
                        " 
                    > 
                        Max ${maxVehicles} 
                    </span> 
 
                </div> 
 
            </div> 
        `; 
 
    }).join(''); 
 
 
    /* ========================================================= 
       5. PACKAGE UPDATE HISTORY 
       ========================================================= */ 
 
    const historyList = 
        Array.isArray(p.updates_history) 
            ? p.updates_history 
            : []; 
 
    let historyHtml = ''; 
 
    if (historyList.length > 0) { 
 
        const historyItems = 
            historyList 
                .map((h, i) => ` 
                    <div 
                        style=" 
                            padding:8px 0; 
                            border-bottom:1px solid #eee; 
                            margin-bottom:5px; 
                        " 
                    > 
 
                        <div 
                            style=" 
                                display:flex; 
                                justify-content:space-between; 
                            " 
                        > 
 
                            <b> 
                                Update #${i + 1} 
                            </b> 
 
                            <span 
                                style=" 
                                    font-size:10px; 
                                    color:#999; 
                                " 
                            > 
                                ${new Date( 
                                    h.updated_at 
                                ).toLocaleDateString('en-IN')} 
                            </span> 
 
                        </div> 
 
                        <div 
                            style=" 
                                margin-top:4px; 
                            " 
                        > 
                            <b>Title:</b> 
                            ${h.title || p.title} 
                        </div> 
 
                    </div> 
                `) 
                .reverse() 
                .join(''); 
 
 
        historyHtml = ` 
            <div 
                style=" 
                    margin-top:20px; 
                    border-top:1px dashed #ddd; 
                    padding-top:15px; 
                " 
            > 
 
                <details> 
 
                    <summary 
                        style=" 
                            cursor:pointer; 
                            color:#ff9f43; 
                            font-size:13px; 
                            font-weight:bold; 
                        " 
                    > 
                        View Previous Package Updates 
                        (${historyList.length}) 
                    </summary> 
 
                    <div 
                        style=" 
                            margin-top:10px; 
                            font-size:12px; 
                            color:#636e72; 
                            background:#f9f9f9; 
                            padding:10px; 
                            border-radius:8px; 
                        " 
                    > 
                        ${historyItems} 
                    </div> 
 
                </details> 
 
            </div> 
        `; 
    } 
 
 
    /* ========================================================= 
       6. MAIN BOOKING FORM 
       ========================================================= */ 
 
    body.innerHTML = ` 
 
        <div 
            style=" 
                text-align:left; 
                font-family:Inter, sans-serif; 
            " 
        > 
 
            <!-- HEADER --> 
            <div 
                style=" 
                    display:flex; 
                    justify-content:space-between; 
                    align-items:flex-start; 
                    gap:15px; 
                " 
            > 
 
                <div> 
 
                    <h2 
                        style=" 
                            margin:0; 
                            color:#2d3436; 
                            font-size:24px; 
                        " 
                    > 
                        ${p.title || 'Tour Package'} 
                    </h2> 
 
                    <p 
                        style=" 
                            margin:7px 0 0; 
                            color:#ff9f43; 
                            font-weight:700; 
                            font-size:14px; 
                        " 
                    > 
                        📍 ${routeInfo} 
                    </p> 
 
                </div> 
 
 
                <button 
                    onclick=" 
                        document.getElementById('detail-modal').style.display='none' 
                    " 
                    style=" 
                        border:none; 
                        background:#f1f2f6; 
                        width:36px; 
                        height:36px; 
                        border-radius:50%; 
                        font-size:20px; 
                        cursor:pointer; 
                        color:#555; 
                        flex-shrink:0; 
                    " 
                > 
                    ✕ 
                </button> 
 
            </div> 
 
 
            <!-- PACKAGE SUMMARY --> 
            <div 
                style=" 
                    margin-top:20px; 
                    display:grid; 
                    grid-template-columns:1fr 1fr; 
                    gap:12px; 
                " 
            > 
 
                <!-- DURATION --> 
                <div 
                    style=" 
                        background:#fff8ef; 
                        border:1px solid #ffd8a8; 
                        border-radius:12px; 
                        padding:15px; 
                    " 
                > 
 
                    <div 
                        style=" 
                            font-size:11px; 
                            color:#888; 
                            font-weight:700; 
                            margin-bottom:6px; 
                        " 
                    > 
                        TOUR DURATION 
                    </div> 
 
                    <div 
                        style=" 
                            font-size:20px; 
                            color:#e67e22; 
                            font-weight:800; 
                        " 
                    > 
                        ${tourDays} 
                        <span 
                            style=" 
                                font-size:13px; 
                                font-weight:600; 
                            " 
                        > 
                            ${tourDays === 1 ? 'Day' : 'Days'} 
                        </span> 
                    </div> 
 
                </div> 
 
 
                <!-- STARTING LOCATION --> 
                <div 
                    style=" 
                        background:#f5f9ff; 
                        border:1px solid #cfe2ff; 
                        border-radius:12px; 
                        padding:15px; 
                    " 
                > 
 
                    <div 
                        style=" 
                            font-size:11px; 
                            color:#888; 
                            font-weight:700; 
                            margin-bottom:6px; 
                        " 
                    > 
                        STARTING FROM 
                    </div> 
 
                    <div 
                        style=" 
                            font-size:16px; 
                            color:#2980b9; 
                            font-weight:800; 
                        " 
                    > 
                        ${p.starting_location || 'N/A'} 
                    </div> 
 
                </div> 
 
            </div> 
 
 
            <!-- DESCRIPTION --> 
            <div 
                style=" 
                    margin-top:18px; 
                    padding:16px; 
                    background:#f8f9fa; 
                    border-radius:12px; 
                    border:1px solid #eee; 
                " 
            > 
 
                <h4 
                    style=" 
                        margin:0 0 8px; 
                        color:#2d3436; 
                    " 
                > 
                    📝 Itinerary / Description 
                </h4> 
 
                <p 
                    style=" 
                        margin:0; 
                        white-space:pre-line; 
                        font-size:14px; 
                        color:#636e72; 
                        line-height:1.6; 
                    " 
                > 
                    ${p.description || 'No description provided.'} 
                </p> 
 
            </div> 
 
 
            <!-- TRAVEL DATE + END DATE --> 
            <div 
                style=" 
                    margin-top:20px; 
                    padding:18px; 
                    background:#fff8ef; 
                    border:1px solid #ffd8a8; 
                    border-radius:14px; 
                " 
            > 
 
                <h4 
                    style=" 
                        margin:0 0 15px; 
                        color:#e67e22; 
                        font-size:16px; 
                    " 
                > 
                    📅 Tour Schedule 
                </h4> 
 
 
                <div 
                    style=" 
                        display:grid; 
                        grid-template-columns:1fr 1fr; 
                        gap:12px; 
                    " 
                > 
 
                    <!-- START DATE --> 
                    <div> 
 
                        <label 
                            style=" 
                                font-size:11px; 
                                color:#666; 
                                font-weight:800; 
                                display:block; 
                                margin-bottom:6px; 
                            " 
                        > 
                            TOUR START DATE 
                        </label> 
 
                        <input 
                            type="date" 
                            id="cust-travel-date" 
                            min="${minStr}" 
                            max="${limitStr}" 
                            value="${minStr}" 
                            onchange="updateTourEndDate(${tourDays})" 
                            style=" 
                                width:100%; 
                                padding:12px; 
                                border:2px solid #ff9f43; 
                                border-radius:9px; 
                                background:white; 
                                color:#2d3436; 
                                font-weight:700; 
                                box-sizing:border-box; 
                                cursor:pointer; 
                            " 
                        > 
 
                    </div> 
 
 
                    <!-- END DATE --> 
                    <div> 
 
                        <label 
                            style=" 
                                font-size:11px; 
                                color:#666; 
                                font-weight:800; 
                                display:block; 
                                margin-bottom:6px; 
                            " 
                        > 
                            EXPECTED TOUR END DATE 
                        </label> 
 
                        <div 
                            id="tour-end-date-display" 
                            style=" 
                                min-height:44px; 
                                display:flex; 
                                align-items:center; 
                                padding:0 12px; 
                                border:2px solid #2ecc71; 
                                border-radius:9px; 
                                background:#f0fff6; 
                                color:#219653; 
                                font-weight:800; 
                                box-sizing:border-box; 
                            " 
                        > 
                            Calculating... 
                        </div> 
 
                    </div> 
 
                </div> 
 
 
                <div 
                    style=" 
                        margin-top:10px; 
                        font-size:11px; 
                        color:#777; 
                    " 
                > 
                    Tour end date is automatically calculated from the selected start date and package duration. 
                </div> 
 
            </div> 
 
 
            <!-- VEHICLES --> 
            <div 
                style=" 
                    margin-top:22px; 
                " 
            > 
 
                <div 
                    style=" 
                        display:flex; 
                        justify-content:space-between; 
                        align-items:center; 
                        margin-bottom:10px; 
                    " 
                > 
 
                    <h4 
                        style=" 
                            margin:0; 
                            color:#2d3436; 
                            font-size:16px; 
                        " 
                    > 
                        🚗 Select Vehicles 
                    </h4> 
 
                    <span 
                        style=" 
                            font-size:11px; 
                            color:#888; 
                        " 
                    > 
                        Choose at least one 
                    </span> 
 
                </div> 
 
 
                <div> 
                    ${vehicleHtml} 
                </div> 
 
            </div> 
 
 
            <!-- TOTAL --> 
            <div 
                style=" 
                    margin-top:20px; 
                    background:#2d3436; 
                    color:white; 
                    padding:16px 18px; 
                    border-radius:12px; 
                    display:flex; 
                    justify-content:space-between; 
                    align-items:center; 
                " 
            > 
 
                <span 
                    style=" 
                        font-weight:800; 
                        font-size:14px; 
                    " 
                > 
                    ESTIMATED TOTAL 
                </span> 
 
                <span 
                    id="live-total-display" 
                    style=" 
                        color:#ff9f43; 
                        font-size:23px; 
                        font-weight:900; 
                    " 
                > 
                    ₹0 
                </span> 
 
            </div> 
 
 
            <!-- CONTACT DETAILS --> 
            <div 
                style=" 
                    margin-top:22px; 
                    padding-top:20px; 
                    border-top:2px solid #eee; 
                " 
            > 
 
                <h4 
                    style=" 
                        margin:0 0 15px; 
                        color:#2d3436; 
                        font-size:16px; 
                    " 
                > 
                    📋 Pickup & Contact Details 
                </h4> 
 
 
                <div> 
 
                    <!-- CUSTOMER PICKUP CITY -->
                    <div style="margin-bottom:14px;">
                        <label style="display:block;font-size:11px;color:#636e72;font-weight:800;margin-bottom:6px;">🏠 CUSTOMER PICKUP CITY</label>
                        <select id="cust-city" onchange="updatePickupDistancePreview()" style="width:100%;padding:12px;border:2px solid #ff9f43;border-radius:9px;box-sizing:border-box;font-family:inherit;background:white;cursor:pointer;">
                            <option value="">Select your Uttarakhand city</option>
                            <option value="Almora">Almora</option><option value="Ranikhet">Ranikhet</option><option value="Dwarahat">Dwarahat</option><option value="Chaukhutia">Chaukhutia</option><option value="Bhikiyasen">Bhikiyasen</option><option value="Bageshwar">Bageshwar</option><option value="Kapkot">Kapkot</option><option value="Garur">Garur</option><option value="Champawat">Champawat</option><option value="Banbasa">Banbasa</option><option value="Tanakpur">Tanakpur</option><option value="Lohaghat">Lohaghat</option><option value="Pati">Pati</option><option value="Gopeshwar">Gopeshwar</option><option value="Joshimath">Joshimath</option><option value="Gauchar">Gauchar</option><option value="Karnaprayag">Karnaprayag</option><option value="Nandprayag">Nandprayag</option><option value="Badrinath">Badrinath</option><option value="Pokhari">Pokhari</option><option value="Tharali">Tharali</option><option value="Gairsain">Gairsain</option><option value="Pipalkoti">Pipalkoti</option><option value="Nandanagar">Nandanagar</option><option value="Dehradun">Dehradun</option><option value="Rishikesh">Rishikesh</option><option value="Vikasnagar">Vikasnagar</option><option value="Mussoorie">Mussoorie</option><option value="Herbertpur">Herbertpur</option><option value="Selaqui">Selaqui</option><option value="Doiwala">Doiwala</option><option value="Haridwar">Haridwar</option><option value="Roorkee">Roorkee</option><option value="Adampur-Sultanpur">Adampur-Sultanpur</option><option value="Dhandera">Dhandera</option><option value="Imlikhera">Imlikhera</option><option value="Padligurjar">Padligurjar</option><option value="Rampur">Rampur</option><option value="Manglaur">Manglaur</option><option value="Jhabreda">Jhabreda</option><option value="Laksar">Laksar</option><option value="Landhaura">Landhaura</option><option value="Shivalik Nagar">Shivalik Nagar</option><option value="Bhagwanpur">Bhagwanpur</option><option value="Piran Kaliyer">Piran Kaliyer</option><option value="Haldwani">Haldwani</option><option value="Ramnagar">Ramnagar</option><option value="Bhowali">Bhowali</option><option value="Kaladhungi">Kaladhungi</option><option value="Lalkuan">Lalkuan</option><option value="Nainital">Nainital</option><option value="Bhimtal">Bhimtal</option><option value="Pauri">Pauri</option><option value="Srinagar">Srinagar</option><option value="Swargashram-Jaunk">Swargashram-Jaunk</option><option value="Satpuli">Satpuli</option><option value="Dogadda">Dogadda</option><option value="Kotdwar">Kotdwar</option><option value="Thalisain">Thalisain</option><option value="Pithoragarh">Pithoragarh</option><option value="Dharchula">Dharchula</option><option value="Didihat">Didihat</option><option value="Gangolihat">Gangolihat</option><option value="Berinag">Berinag</option><option value="Munsyari">Munsyari</option><option value="Rudraprayag">Rudraprayag</option><option value="Kedarnath">Kedarnath</option><option value="Augustmuni">Augustmuni</option><option value="Tilwara">Tilwara</option><option value="Ukhimath">Ukhimath</option><option value="Guptkashi">Guptkashi</option><option value="Tehri">Tehri</option><option value="Narendranagar">Narendranagar</option><option value="Chamba">Chamba</option><option value="Muni-ki-Reti">Muni-ki-Reti</option><option value="Kirtinagar">Kirtinagar</option><option value="Devprayag">Devprayag</option><option value="Gaja">Gaja</option><option value="Ghansali">Ghansali</option><option value="Lambgaon">Lambgaon</option><option value="Chamiyala">Chamiyala</option><option value="Tapovan">Tapovan</option><option value="Gadarpur">Gadarpur</option><option value="Jaspur">Jaspur</option><option value="Kichha">Kichha</option><option value="Sitarganj">Sitarganj</option><option value="Bazpur">Bazpur</option><option value="Khatima">Khatima</option><option value="Mahuakheraganj">Mahuakheraganj</option><option value="Mahuwadawara">Mahuwadawara</option><option value="Sultanpur">Sultanpur</option><option value="Kelakheda">Kelakheda</option><option value="Dineshpur">Dineshpur</option><option value="Shaktigarh">Shaktigarh</option><option value="Nanakmatta">Nanakmatta</option><option value="Gularbhoj">Gularbhoj</option><option value="Kashipur">Kashipur</option><option value="Rudrapur">Rudrapur</option><option value="Nagla">Nagla</option><option value="Lalpur">Lalpur</option><option value="Garhinegi">Garhinegi</option><option value="Seroli Kalan">Seroli Kalan</option><option value="Uttarkashi">Uttarkashi</option><option value="Barkot">Barkot</option><option value="Chinyalisaur">Chinyalisaur</option><option value="Gangotri">Gangotri</option><option value="Purola">Purola</option><option value="Naugaon">Naugaon</option>
                        </select>
                        <small style="display:block;margin-top:6px;color:#777;font-size:11px;line-height:1.45;">Agency starting city se selected pickup city tak road distance automatically calculate hoga.</small>
                    </div>

                    <div id="pickup-distance-preview" style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 14px;margin-bottom:14px;background:#f5fff8;border:1px solid #b7ebc6;border-radius:9px;">
                        <div>
                            <div style="font-size:11px;color:#636e72;font-weight:800;">🚗 PICKUP DISTANCE</div>
                            <div id="pickup-distance-value" style="font-size:14px;font-weight:800;color:#2d3436;margin-top:3px;">Select a city</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:11px;color:#636e72;font-weight:800;">PICKUP CHARGE</div>
                            <div id="pickup-distance-charge" style="font-size:17px;font-weight:900;color:#2ecc71;margin-top:3px;">₹0</div>
                        </div>
                    </div>

                    <!-- PHONE --> 
                    <div> 
 
                        <label 
                            style=" 
                                display:block; 
                                font-size:11px; 
                                color:#636e72; 
                                font-weight:800; 
                                margin-bottom:6px; 
                            " 
                        > 
                            📞 MOBILE NUMBER 
                        </label> 
 
                        <input 
                            type="text" 
                            id="cust-phone" 
                            maxlength="10" 
                            placeholder="Enter 10-digit mobile number" 
                            style=" 
                                width:100%; 
                                padding:12px; 
                                border:1px solid #dfe6e9; 
                                border-radius:9px; 
                                box-sizing:border-box; 
                            " 
                        > 
 
                    </div> 
 
                </div> 
 
            </div> 
 
 
            <!-- POLICY --> 
            <div 
                style=" 
                    margin-top:18px; 
                    padding:14px; 
                    background:#fff5f5; 
                    border:1px solid #ff7675; 
                    border-radius:10px; 
                " 
            > 
 
                <label 
                    style=" 
                        display:flex; 
                        gap:10px; 
                        align-items:flex-start; 
                        cursor:pointer; 
                    " 
                > 
 
                    <input 
                        type="checkbox" 
                        id="policy-consent" 
                        style=" 
                            width:18px; 
                            height:18px; 
                            margin-top:2px; 
                            flex-shrink:0; 
                        " 
                    > 
 
                    <span 
                        style=" 
                            font-size:11px; 
                            color:#444; 
                            line-height:1.5; 
                        " 
                    > 
                        I agree to the 
                        <b>Cancellation & Refund Policy</b>. 
                        I understand that in case of cancellation, 
                        a non-refundable amount of 
                        <b>18%</b>\n                        (2% Gateway + GST on transaction fee + 15% Service & Facilitation Fee) 
                        will be deducted from my total refund. 
                    </span> 
 
                </label> 
 
            </div> 
 
 
            <!-- HISTORY --> 
            ${historyHtml} 
 
 
            <!-- ACTION BUTTONS --> 
            <div 
                style=" 
                    margin-top:25px; 
                    display:flex; 
                    gap:10px; 
                " 
            > 
 
                <button 
                    onclick=" 
                        handleBookingInquiry( 
                            '${p.id}', 
                            '${String(p.title || '').replace(/'/g, "\\'")}', 
                            '${p.agency_id || ''}' 
                        ) 
                    " 
                    style=" 
                        flex:2; 
                        background:#ff9f43; 
                        color:white; 
                        padding:15px; 
                        font-weight:800; 
                        cursor:pointer; 
                        border-radius:10px; 
                        border:none; 
                        font-size:15px; 
                    " 
                > 
                    SEND BOOKING REQUEST 
                </button> 
 
 
                <button 
                    onclick=" 
                        document.getElementById('detail-modal').style.display='none' 
                    " 
                    style=" 
                        flex:1; 
                        background:#eee; 
                        padding:15px; 
                        border-radius:10px; 
                        cursor:pointer; 
                        border:none; 
                        font-weight:700; 
                        color:#666; 
                    " 
                > 
                    BACK 
                </button> 
 
            </div> 
 
        </div> 
    `; 
 
 
    /* ========================================================= 
       7. OPEN MODAL 
       ========================================================= */ 
 
    window.currentPickupDistanceCharge=0;
    window.currentPickupDistanceKm=0;
    window.pickupDistanceRequestId=(window.pickupDistanceRequestId||0)+1;

    modal.style.display = 'flex'; 
 
 
    /* ========================================================= 
       8. INITIAL END DATE 
       ========================================================= */ 
 
    if (typeof window.updateTourEndDate === 'function') { 
        window.updateTourEndDate(tourDays); 
    } 
 
 
    /* ========================================================= 
       9. INITIAL PRICE 
       ========================================================= */ 
 
    if (typeof window.updateLivePrice === 'function') {
        window.updateLivePrice();
    }

};

window.toggleQtyInput = function(id) { 
 
    const container = 
        document.getElementById( 
            `qty-container-${id}` 
        ); 
 
    const checkbox = 
        document.querySelector( 
            `.book-v-check[data-id="${id}"]` 
        ); 
 
    if (!container || !checkbox) { 
        return; 
    } 
 
 
    container.style.display = 
        checkbox.checked 
            ? 'block' 
            : 'none'; 
 
 
    if (typeof window.updateLivePrice === 'function') { 
        window.updateLivePrice(); 
    } 
 
};
/* =========================================
   HOTELS PACKAGES IN AGENCY DASHBOARD
   ========================================= */

// Agency ke Dashboard par Hotel Packages Render Karne Ka Logic
async function renderAgencyHotelPackages() {
    const container = document.getElementById('agency-hotel-pkg-list');
    if (!container) return;

    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px;"><h3>Loading Live Inventory Stock...</h3></div>`;

    try {
        const client = getClient();
        // Supabase ki room_categories table se Live Stock packages fetch kar rahe hain
        const { data, error } = await client
            .from('room_categories')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding:50px; background:white; border-radius:12px;">
                    <h3>🏨 No Hotel Packages Available</h3>
                    <p style="color:#636e72;">Hotels dwara koi Live Inventory Stock abhi publish nahi kiya gaya hai.</p>
                </div>`;
            return;
        }

        container.innerHTML = data.map(item => {
            const price = item.price || item.room_price || 0;
            const availableRooms = item.available_rooms || item.total_rooms || 0;
            const hotelName = item.hotel_name || item.property_name || 'Hotel Partner 🏨';
            const location = item.city || item.location || item.address || 'N/A';
            const roomType = item.category_name || item.room_type || item.title || 'Standard Room';

            return `
            <div class="card result-card" style="background:white; overflow:hidden; border:1px solid #eee; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.05); display:flex; flex-direction:column; justify-content:space-between;">
                <div style="padding:25px;">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <span style="background:#e8f5e9; color:#2e7d32; font-size:11px; padding:4px 10px; border-radius:12px; font-weight:bold;">LIVE STOCK</span>
                        <span style="font-size:20px; font-weight:bold; color:#2ecc71;">₹${price}<small style="font-size:12px; color:#666;">/night</small></span>
                    </div>
                    
                    <h3 style="margin:15px 0 5px 0; color:#2d3436;">${roomType}</h3>
                    <p style="margin:0; color:#ff9f43; font-weight:bold; font-size:14px;">🏨 ${hotelName}</p>
                    
                    <div style="font-size:13px; color:#636e72; margin:15px 0;">
                        <div>📍 <b>Location:</b> ${location}</div>
                        <div style="margin-top:5px;">🛏️ <b>Available Rooms:</b> <span style="color:#d35400; font-weight:bold;">${availableRooms} Left</span></div>
                        ${item.amenities ? `<div style="margin-top:5px;">✨ <b>Amenities:</b> ${Array.isArray(item.amenities) ? item.amenities.join(', ') : item.amenities}</div>` : ''}
                    </div>
                </div>

                <div style="padding:15px 25px; background:#f9f9f9; border-top:1px solid #eee;">
                    <button onclick="alert('Hotel Booking feature coming soon!')" style="background:#3498db; color:white; width:100%; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">BOOK ROOM STOCK</button>
                </div>
            </div>`;
        }).join('');

    } catch (err) {
        console.error("Error loading hotel live inventory:", err);
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#ff7675; padding:40px;"><h3>Failed to load hotel packages: ${err.message}</h3></div>`;
    }
}
// 9. AGENCY DASHBOARD
function renderAgencyDashboard(user) {
    const app = document.getElementById('app');
    app.style.maxWidth = "100%";
    window.mountDashboardUtilityMenu('agency');

    app.innerHTML = `
        <div style="display:flex; min-height:100vh; background:#f8f9fa; margin:-20px; font-family:'Inter', sans-serif;">
            <div style="width:260px; background:#2d3436; color:white; padding:25px; position:relative; flex-shrink:0;">
               <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;">
                    <h2 style="color:#ff9f43; margin:0;">TourSetu</h2>
                    <div id="notif-bell" onclick="showTab('bookings')" style="position:relative; cursor:pointer; font-size:20px; transition: 0.3s;">
                        🔔
                        <span id="bell-badge" style="display:none; position:absolute; top:-5px; right:-5px; background:#ff7675; color:white; font-size:10px; padding:2px 6px; border-radius:50%; font-weight:bold; border: 2px solid #2d3436;">0</span>
                    </div>
               </div>
               <nav>
                    <div onclick="showTab('earnings')" class="nav-item" style="padding:12px; cursor:pointer; border-radius:8px; margin-bottom:5px;">📊 Dashboard</div>
                    <div onclick="showTab('bookings')" class="nav-item" style="padding:12px; cursor:pointer; border-radius:8px; margin-bottom:5px; display:flex; justify-content:space-between; align-items:center;">
                        <span>📅 Bookings</span>
                        <span id="side-notif-count" style="background:#ff9f43; color:white; padding:2px 8px; border-radius:10px; font-size:10px; display:none;">0</span>
                    </div>
                    <div onclick="showTab('packages')" class="nav-item" style="padding:12px; cursor:pointer; border-radius:8px; margin-bottom:5px;">🎒 My Packages</div>
                    <div onclick="showTab('hotels')" class="nav-item" style="padding:12px; cursor:pointer; border-radius:8px; margin-bottom:5px;">🏨 Hotels Package</div>
                    <div onclick="showTab('profile')" class="nav-item" style="padding:12px; cursor:pointer; border-radius:8px; margin-bottom:5px;">👤 Agency Profile</div>
                    <div onclick="confirmLogout()" style="padding:15px; cursor:pointer; color:#ff7675; margin-top:50px; font-weight:bold; border-top:1px solid #444;">🚪 Logout</div>
               </nav>
            </div>
            <div id="main-content" style="flex:1; padding:40px; overflow-y:auto; background:#f8f9fa;"></div>
        </div>

        <div id="logout-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:1000; justify-content:center; align-items:center;">
            <div style="background:white; padding:30px; border-radius:12px; text-align:center; max-width:350px;">
               <h2 style="margin:0 0 20px 0;">Logout?</h2>
               <div style="display:flex; gap:10px;">
                    <button onclick="executeLogout()" style="background:#ff7675; color:white; flex:1; padding:12px; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">Yes</button>
                    <button onclick="document.getElementById('logout-modal').style.display='none'" style="background:#eee; flex:1; padding:12px; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">No</button>
               </div>
           </div>
        </div>

        <div id="action-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:2000; justify-content:center; align-items:center; padding:20px;">
            <div id="action-modal-content" style="background:white; padding:30px; border-radius:15px; max-width:400px; width:100%; box-shadow: 0 10px 30px rgba(0,0,0,0.3);"></div>
        </div>
    `;
    showTab('earnings');
    loadAgencyVerificationBanner(user);
 
}


window.loadAgencyVerificationBanner=async function(user){
    const container=document.getElementById('main-content');if(!container)return;
    const verification=await getAgencyVerification(user.id).catch(()=>null);
    document.getElementById('agency-verification-banner')?.remove();
    if(!verification||verification.status==='approved')return;
    const color=verification.status==='denied'?'#ff7675':'#f39c12';
    const text=verification.status==='denied'?'Your verification was denied. Please contact TourSetu support.':'Your registration is submitted and waiting for admin approval. Your packages remain hidden from customers until approval.';
    const banner=document.createElement('div');banner.id='agency-verification-banner';banner.style.cssText='margin:0 0 20px;padding:14px 18px;border-radius:10px;border-left:5px solid '+color+';background:white;box-shadow:0 2px 8px rgba(0,0,0,.06);color:#444;';
    banner.innerHTML='<strong>Agency Verification: '+String(verification.status||'pending').toUpperCase()+'</strong><br><span style="font-size:13px;">'+text+'</span>';
    container.prepend(banner);
};

window.showTab = async function(tabName) {
    const container = document.getElementById('main-content');
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    if(tabName==='packages'||tabName==='hotels'){
        const verification=await getAgencyVerification(user.id).catch(()=>null);
        if(!verification||verification.status!=='approved'){
            const statusText=verification?.status==='denied'?'Your verification request was denied. Please contact TourSetu support.':'Your agency account is pending verification. These sections will unlock after your documents are approved.';
            container.innerHTML='<div style="max-width:720px;margin:30px auto;background:white;border-radius:16px;padding:30px;box-shadow:0 4px 16px rgba(0,0,0,.08);text-align:center;"><div style="font-size:42px;">🔒</div><h2>Agency Verification Required</h2><p style="color:#666;line-height:1.6;">'+statusText+'</p><div style="display:inline-block;padding:8px 14px;border-radius:20px;background:#fff3cd;color:#856404;font-weight:800;text-transform:uppercase;">'+(verification?.status||'pending')+'</div></div>';
            return;
        }
    }


    const { data: bookingsData } = await client
        .from('bookings')
        .select('*')
        .eq('agency_id', user.id)
        .order('created_at', { ascending: false });

    const pendingCount = bookingsData ? bookingsData.filter(b => b.status === 'pending').length : 0;
    const badge = document.getElementById('bell-badge');
    const sideCount = document.getElementById('side-notif-count');

    if (badge && pendingCount > 0) {
        badge.innerText = pendingCount; badge.style.display = 'block';
        sideCount.innerText = pendingCount; sideCount.style.display = 'block';
    } else if (badge) {
        badge.style.display = 'none'; sideCount.style.display = 'none';
    }

    if (tabName === 'earnings') {
        const totalRevenue = bookingsData ? bookingsData
                .filter(b => b.status === 'paid')
                .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0) : 0;

        container.innerHTML = `<h1>Overview</h1>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px;">
                <div class="card" style="border-top:5px solid #2ecc71; background:white; padding:25px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"><small>REVENUE (PAID)</small><h2>₹${totalRevenue.toLocaleString('en-IN')}</h2></div>
                <div class="card" style="border-top:5px solid #ff9f43; background:white; padding:25px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"><small>PENDING BOOKINGS</small><h2>${pendingCount}</h2></div>
                <div class="card" style="border-top:5px solid #3498db; background:white; padding:25px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"><small>ACTIVE PACKAGES</small><h2 id="act-pkg-count">...</h2></div>
            </div>`;
        const { count } = await client.from('packages').select('*', { count: 'exact', head: true }).eq('agency_id', user.id);
        if(document.getElementById('act-pkg-count')) document.getElementById('act-pkg-count').innerText = count || 0;
    } 
    else if (tabName === 'bookings') {
        container.innerHTML = `<h1>Customer Bookings</h1><div id="booking-list-area">Loading...</div>`;
        const listArea = document.getElementById('booking-list-area');

        if (!bookingsData || bookingsData.length === 0) {
            listArea.innerHTML = `<p style="padding:20px; color:#666;">No booking requests found.</p>`;
            return;
        }

        listArea.innerHTML = bookingsData.map(b => {
            const isPaid = b.status === 'paid';
            const isPending = b.status === 'pending';
            const isCancelled = b.status === 'cancelled';

            const displayPhone = isPaid ? b.customer_phone : "Locked (Visible after Payment)";
            const displayEmail = isPaid ? b.customer_email : b.customer_email.replace(/(.{3})(.*)(?=@)/, "$1***");
            const phoneColor = isPaid ? "#ff9f43" : "#999";

            let statusColor = '#ff9f43';
            if (isCancelled || b.status === 'denied') statusColor = '#ff7675';
            if (b.status === 'approved' || b.status === 'paid') statusColor = '#2ecc71';

            const travelDateStr = b.travel_date ? new Date(b.travel_date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : 'Not Set';

            // --- FIXED SETUP FOR TREKKING SERVICES SECTIONS ---
            let trekkingHtml = '';

            // 1. KEDARNATH TREKKING SERVICE SELECTION
            const kGhodaPrice = parseFloat(b.kedar_ghoda_Qty) || 0;
            const kDandiPrice = parseFloat(b.kedar_dandi_Qty) || 0;
            const kPitthuPrice = parseFloat(b.kedar_pitthu_Qty) || 0;
            const kKandiPrice = parseFloat(b.kedar_kandi_Qty) || 0;

            const kGhodaMax = parseInt(b.kedar_ghoda_max_members || b.ghoda_max) || 0;
            const kDandiMax = parseInt(b.kedar_dandi_max_members || b.dandi_max) || 0;
            const kPitthuMax = parseInt(b.kedar_pitthu_max_members || b.pitthu_max) || 0;
            const kKandiMax = parseInt(b.kedar_kandi_max_members || b.kandi_max) || 0;

            if (kGhodaPrice > 0 || kDandiPrice > 0 || kPitthuPrice > 0 || kKandiPrice > 0) {
                let items = [];
                if (kGhodaPrice > 0) items.push(`Ghoda: <b>₹${kGhodaPrice}</b> (${kGhodaMax} Person)`);
                if (kDandiPrice > 0) items.push(`Dandi: <b>₹${kDandiPrice}</b> (${kDandiMax} Person)`);
                if (kPitthuPrice > 0) items.push(`Pitthu: <b>₹${kPitthuPrice}</b> (${kPitthuMax} Person)`);
                if (kKandiPrice > 0) items.push(`Kandi: <b>₹${kKandiPrice}</b> (${kKandiMax} Person)`);

                trekkingHtml += `
                <div style="margin-top: 10px; padding: 12px 15px; background: #f0faf7; border-left: 4px solid #badc58; border-radius: 6px; font-size: 13px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                    <span style="color: #27ae60; font-weight: bold; display: block; margin-bottom: 5px; font-size:14px;">⛰️ Trekking Service Only For Kedarnath:</span>
                    <span style="color: #444; line-height: 1.6;">${items.join(' | ')}</span>
                </div>`;
            }

            // 2. VAISHNO DEVI TREKKING SERVICE SELECTION (FIXED TO READ VAISHNO SPECIFIC COLUMNS)
            const vGhodaPrice = parseFloat(b.vaishno_ghoda_price) || 0;
            const vDandiPrice = parseFloat(b.vaishno_dandi_price) || 0;
            const vPitthuPrice = parseFloat(b.vaishno_pitthu_price) || 0;

            const vGhodaMax = parseInt(b.vaishno_ghoda_max_members || b.vaishno_ghoda_max) || 0;
            const vDandiMax = parseInt(b.vaishno_dandi_max_members || b.vaishno_dandi_max) || 0;
            const vPitthuMax = parseInt(b.vaishno_pitthu_max_members || b.vaishno_pitthu_max) || 0;

            if (vGhodaPrice > 0 || vDandiPrice > 0 || vPitthuPrice > 0) {
                let items = [];
                if (vGhodaPrice > 0) items.push(`Ghoda: <b>₹${vGhodaPrice}</b> (${vGhodaMax} Person)`);
                if (vDandiPrice > 0) items.push(`Dandi: <b>₹${vDandiPrice}</b> (${vDandiMax} Person)`);
                if (vPitthuPrice > 0) items.push(`Pitthu: <b>₹${vPitthuPrice}</b> (${vPitthuMax} Person)`);

                trekkingHtml += `
                <div style="margin-top: 10px; padding: 12px 15px; background: #fffcf0; border-left: 4px solid #f1c40f; border-radius: 6px; font-size: 13px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                    <span style="color: #d35400; font-weight: bold; display: block; margin-bottom: 5px; font-size:14px;">⛰️ Trekking Service Only For Vaishno Devi:</span>
                    <span style="color: #444; line-height: 1.6;">${items.join(' | ')}</span>
                </div>`;
            }

            return `
            <div class="card" style="background:white; padding:25px; margin-bottom:20px; border-left:5px solid ${statusColor}; border-radius:8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div>
                        <h3 style="margin:0; color:#2d3436;">${b.package_title}</h3>
                        <div style="margin-top:5px; display:flex; gap:15px; font-size:12px; color:#636e72;">
                             <span>📩 Requested: ${new Date(b.created_at).toLocaleDateString()}</span>
                             <span style="color:white; background:#ff9f43; padding:2px 8px; border-radius:4px; font-weight:bold;">📅 TRAVEL DATE: ${travelDateStr}</span>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:22px; font-weight:bold; color:#2ecc71;">₹${b.total_price || 0}</div>
                        <span style="padding:4px 10px; border-radius:15px; font-size:11px; font-weight:bold; background:#f0f0f0; color:${statusColor};">
                            ${b.status.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div style="margin-top:20px; padding:15px; background:#f4f7f6; border-radius:10px; display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                    <div>
                        <label style="font-size:11px; color:#999; font-weight:bold;">📍 PICKUP ADDRESS</label>
                        <p style="margin:5px 0; font-size:14px; color:#2d3436;">${b.customer_address || 'Not Provided'}</p>
                    </div>
                    <div>
                        <label style="font-size:11px; color:#999; font-weight:bold;">📞 CUSTOMER PHONE</label>
                        <p style="margin:5px 0; font-size:15px; font-weight:bold; color:${phoneColor};">
                            ${isPaid ? `<a href="tel:${displayPhone}" style="color:inherit;">${displayPhone}</a>` : displayPhone}
                        </p>
                    </div>
                </div>

                <div style="margin-top:15px; border-top: 1px dashed #ddd; padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="width: 100%;">
                        <p style="font-size:13px; margin:0; color:#636e72;"><b>Selected Vehicles:</b> ${b.selected_vehicles}</p>

                        ${trekkingHtml} 

                        <p style="font-size:12px; margin-top:8px; color:#999;">Customer Email: ${displayEmail}</p>
                    </div>
                    ${b.policy_agreed ? `
                        <div style="background:#e3faf3; color:#2ecc71; font-size:10px; padding:4px 10px; border-radius:5px; font-weight:bold; border:1px solid #2ecc71; flex-shrink:0;">
                            ✅ 18% DEDUCTION POLICY AGREED
                        </div>
                    ` : ''}
                </div>

                <div style="margin-top:20px;">
                ${isCancelled ? `
                    <div style="background:#fff5f5; color:#ff7675; padding:12px; border-radius:8px; border:1px solid #ff7675; text-align:center; font-weight:bold;">
                        🚫 CUSTOMER CANCELLED
                    </div>
                ` : (isPending ? `
                    <div style="border-top:1px solid #eee; padding-top:15px; display:flex; gap:12px;">
                        <button onclick="openActionModal('${b.id}', 'approved', '${b.customer_id}', '${b.package_title}')" style="background:#2ecc71; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;">Approve Request</button>
                        <button onclick="openActionModal('${b.id}', 'denied', '${b.customer_id}', '${b.package_title}')" style="background:#ff7675; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;">Deny Request</button>
                    </div>
                ` : '')}
                </div>
            </div>`;
        }).join('');
    }
    else if (tabName === 'packages') {
        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h1>My Packages</h1>
                <button onclick="showPackageForm()" style="padding:12px 25px; background:#2ecc71; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">+ CREATE NEW</button>
            </div>
            <div id="package-form-area"></div>
            <div id="pkg-list-container"></div>`;

        const { data: myPackages } = await client.from('packages').select('*').eq('agency_id', user.id).order('created_at', { ascending: false });
        document.getElementById('pkg-list-container').innerHTML = (myPackages || []).map(p => {
             const encoded = encodeURIComponent(JSON.stringify(p));
             return `<div style="background:white; padding:20px; border-radius:12px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 8px rgba(0,0,0,0.05); border-left:5px solid #ff9f43;">
                <div style="flex:1;">
                    <h3 style="margin:0; color:#2d3436;">${p.title || 'Untitled'}</h3>
                    <p style="margin:5px 0; color:#666; font-size:14px;">📍 <b>From:</b> ${p.starting_location || 'N/A'}</p>
                </div>
                <button onclick="showPackageForm('${encoded}')" style="background:#ff9f43; color:white; border:none; padding:10px 22px; border-radius:8px; cursor:pointer; font-weight:bold;">✏️ Edit</button>
            </div>`;
        }).join('');
    }
else if (tabName === 'hotels') {
   container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h1 style="color:#e67e22; display:flex; align-items:center; gap:10px;">
            🏨 Hotel Packages (Live Stock)
        </h1>

        <button
            onclick="renderAgencyHotelBookingRequests()"
            style="
                background:#3498db;
                color:white;
                border:none;
                padding:10px 18px;
                border-radius:8px;
                font-weight:bold;
                cursor:pointer;
                font-size:13px;
            "
        >
            📋 My Hotel Requests
        </button>
    </div>

    <div id="agency-hotel-pkg-list"
         style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:25px;">
    </div>`;
        // Fetch and display hotel room inventory
        renderAgencyHotelPackages();
    }
    else if (tabName === 'profile') {
        const meta = user.user_metadata || {};
        container.innerHTML = `<h1>Agency Profile</h1><div class="card" style="background:white; padding:30px; border-radius:8px; border-left:5px solid #ff9f43;">
            <p><b>Email:</b> ${user.email}</p>
            <p><b>Phone:</b> ${meta.phone || 'N/A'}</p>
            <p><b>Status:</b> ${meta.is_approved ? '✅ Verified' : '⏳ Pending Approval'}</p>
        </div>`;
    }
};

window.renderAgencyHotelPackages = async function() {
    const listContainer = document.getElementById('agency-hotel-pkg-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<p style="color:#666;">Loading live stock...</p>';

    const client = getClient();
    
    try {
        // 1. Fetch Room Categories Safely
        const { data: categories, error: catErr } = await client
            .from('room_categories')
            .select('*');

        if (catErr) {
            console.error("Categories Fetch Error:", catErr);
            throw catErr;
        }

        if (!categories || categories.length === 0) {
            listContainer.innerHTML = `<p style="color:#666;">No hotel packages available right now.</p>`;
            return;
        }

        // 2. Fetch Hotels Safely (Without nested string syntax that causes 400 Bad Request)
        const { data: hotelsData, error: hotelErr } = await client
            .from('hotels')
            .select('*')
            .eq('status', 'active')
            .eq('hide_from_search', false);

        if (hotelErr) {
            console.error("Hotels Fetch Error:", hotelErr);
        }

        // Map hotels using hotel_id or id
        const hotelMap = {};
        if (hotelsData) {
            hotelsData.forEach(h => {
                const key = h.hotel_id || h.id;
                if (key) {
                    hotelMap[key] = h;
                }
            });
        }

        // 3. Render HTML
        listContainer.innerHTML = categories.map(cat => {
            const price = cat.price_per_night || cat.price || 0;
            const hotelInfo = hotelMap[cat.hotel_id] || {};
            
            // Dynamic check for column names
            const cityName = hotelInfo.city || hotelInfo.location || 'N/A';
            const hotelName = hotelInfo.hotel_name || hotelInfo.name || 'Partner Hotel';
            const totalRooms = cat.total_rooms || cat.available_rooms || 0;
            const categoryName = cat.room_type || cat.category_name || cat.name || 'Room Package';

            return `
                <div style="background:white; border-radius:12px; padding:20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e0e0e0; font-family:'Inter', sans-serif;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
                        <span style="background:#e8f8f5; color:#2ecb71; font-size:10px; font-weight:bold; padding:4px 8px; border-radius:4px;">LIVE STOCK</span>
                        <div style="text-align:right;">
                            <span style="font-size:18px; font-weight:bold; color:#2ecb71;">₹${price}</span><span style="font-size:12px; color:#666;">/night</span>
                        </div>
                    </div>

                    <h3 style="margin:0 0 4px 0; font-size:18px; color:#2d3436; font-weight:bold;">${categoryName}</h3>
                    
                    <div style="display:flex; align-items:center; gap:5px; color:#555; font-size:13px; margin-bottom:12px;">
                        <span>🏨</span> <span>${hotelName}</span>
                    </div>

                    <div style="font-size:13px; color:#555; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
                        <span>📍</span> <span><b>Location:</b> ${cityName}</span>
                    </div>

                    <div style="font-size:13px; color:#555; margin-bottom:20px; display:flex; align-items:center; gap:6px;">
                        <span>🛏️</span> <span>Available Rooms: <b style="color:#e74c3c;">${totalRooms} Left</b></span>
                    </div>

                  <button
    onclick="openHotelBookingModal(
        '${hotelName.replace(/'/g, "\\'")}',
        '${cityName.replace(/'/g, "\\'")}',
        '${hotelInfo.address ? hotelInfo.address.replace(/'/g, "\\'") : ''}',
        '${categoryName.replace(/'/g, "\\'")}',
        ${price},
        ${totalRooms},
        '${hotelInfo.image_url || ''}',
        '${cat.id || ''}'
    )"
    style="width:100%; background:#3498db; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; font-size:13px; cursor:pointer;">
    BOOK ROOM STOCK
</button>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error("Dashboard Rendering Error:", err);
        listContainer.innerHTML = `<p style="color:#ff7675;">Failed to load hotel packages. Please check console.</p>`;
    }
};

window.openActionModal = function(bookingId, type, customerId, packageTitle) {
    const modal = document.getElementById('action-modal');
    const content = document.getElementById('action-modal-content');
    modal.style.display = 'flex';

    if (type === 'approved') {
        content.innerHTML = `
            <h3 style="color:#2ecc71; margin-top:0;">Approve Booking?</h3>
            <p style="font-size:14px; color:#666;">Provide the contact number for payment collection (GPay/PhonePe).</p>
            <input type="text" id="modal-contact-input" placeholder="Enter Contact Number" style="width:100%; padding:12px; margin-bottom:20px; border:1px solid #ddd; border-radius:5px;">
            <div style="display:flex; gap:10px;">
                <button onclick="processStatusUpdate('${bookingId}', 'approved', '${customerId}', '${packageTitle}')" style="flex:1; background:#2ecc71; color:white; border:none; padding:12px; border-radius:5px; cursor:pointer; font-weight:bold;">CONFIRM</button>
                <button onclick="closeActionModal()" style="flex:1; background:#eee; border:none; padding:12px; border-radius:5px; cursor:pointer;">CANCEL</button>
            </div>`;
    } else {
        content.innerHTML = `
            <h3 style="color:#ff7675; margin-top:0;">Deny Request?</h3>
            <p style="font-size:14px; color:#666;">This action will notify the customer and cancel the request.</p>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button onclick="processStatusUpdate('${bookingId}', 'denied', '${customerId}', '${packageTitle}')" style="flex:1; background:#ff7675; color:white; border:none; padding:12px; border-radius:5px; cursor:pointer; font-weight:bold;">DENY</button>
                <button onclick="closeActionModal()" style="flex:1; background:#eee; border:none; padding:12px; border-radius:5px; cursor:pointer;">CANCEL</button>
            </div>`;
    }
};

window.closeActionModal = () => document.getElementById('action-modal').style.display = 'none';

window.processStatusUpdate = async function(bookingId, newStatus, customerId, packageTitle) {
    const client = getClient();
    let updateData = { status: newStatus };

    if (newStatus === 'approved') {
        const contact = document.getElementById('modal-contact-input').value;
        if (!contact.trim()) { alert("Please enter a contact number!"); return; }
        updateData.agency_contact = contact;
    }

    const { error } = await client.from('bookings').update(updateData).eq('id', bookingId);
    if (!error) {
        if (newStatus === 'approved') {
            sendPushNotification(
                customerId, 
                "Booking Approved! ✅", 
                `Your trip for ${packageTitle} has been confirmed. Check the app for payment details.`
            );
        } else if (newStatus === 'denied') {
            sendPushNotification(
                customerId, 
                "Booking Update", 
                `Your booking request for ${packageTitle} was not accepted.`
            );
        }

        closeActionModal();
        showTab('bookings');
    } else {
        alert("Update Error: " + error.message);
    }
};

window.confirmLogout = () => document.getElementById('logout-modal').style.display = 'flex';
window.executeLogout = async () => { 
    await getClient().auth.signOut(); 
    location.reload(); 
};
/* =========================================
   HOTELS PACKAGES IN AGENCY DASHBOARD
   ========================================= */

// Agency ke Dashboard par Hotel Packages Render Karne Ka Logic
async function renderAgencyHotelPackages() {
    const container = document.getElementById('agency-hotel-pkg-list');
    if (!container) return;

    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px;"><h3>Loading Live Inventory Stock...</h3></div>`;

    try {
        const client = getClient();
        // Supabase ki room_categories table se Live Stock packages fetch kar rahe hain
        const { data, error } = await client
            .from('room_categories')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding:50px; background:white; border-radius:12px;">
                    <h3>🏨 No Hotel Packages Available</h3>
                    <p style="color:#636e72;">Hotels dwara koi Live Inventory Stock abhi publish nahi kiya gaya hai.</p>
                </div>`;
            return;
        }

        container.innerHTML = data.map(item => {
            const price = item.price || item.room_price || 0;
            const availableRooms = item.available_rooms || item.total_rooms || 0;
            const hotelName = item.hotel_name || item.property_name || 'Hotel Partner 🏨';
            const location = item.city || item.location || item.address || 'N/A';
            const roomType = item.category_name || item.room_type || item.title || 'Standard Room';

            return `
            <div class="card result-card" style="background:white; overflow:hidden; border:1px solid #eee; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.05); display:flex; flex-direction:column; justify-content:space-between;">
                <div style="padding:25px;">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <span style="background:#e8f5e9; color:#2e7d32; font-size:11px; padding:4px 10px; border-radius:12px; font-weight:bold;">LIVE STOCK</span>
                        <span style="font-size:20px; font-weight:bold; color:#2ecc71;">₹${price}<small style="font-size:12px; color:#666;">/night</small></span>
                    </div>
                    
                    <h3 style="margin:15px 0 5px 0; color:#2d3436;">${roomType}</h3>
                    <p style="margin:0; color:#ff9f43; font-weight:bold; font-size:14px;">🏨 ${hotelName}</p>
                    
                    <div style="font-size:13px; color:#636e72; margin:15px 0;">
                        <div>📍 <b>Location:</b> ${location}</div>
                        <div style="margin-top:5px;">🛏️ <b>Available Rooms:</b> <span style="color:#d35400; font-weight:bold;">${availableRooms} Left</span></div>
                        ${item.amenities ? `<div style="margin-top:5px;">✨ <b>Amenities:</b> ${Array.isArray(item.amenities) ? item.amenities.join(', ') : item.amenities}</div>` : ''}
                    </div>
                </div>

                <div style="padding:15px 25px; background:#f9f9f9; border-top:1px solid #eee;">
                    <button onclick="alert('Hotel Booking feature coming soon!')" style="background:#3498db; color:white; width:100%; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">BOOK ROOM STOCK</button>
                </div>
            </div>`;
        }).join('');

    } catch (err) {
        console.error("Error loading hotel live inventory:", err);
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#ff7675; padding:40px;"><h3>Failed to load hotel packages: ${err.message}</h3></div>`;
    }
}
/* =========================================================
   HOTEL PARTNER MODULE - PROPERTY & INVENTORY MANAGEMENT
   ========================================================= */

// Agar pehle se declared hai toh re-declare mat karein, direct value update/reassign karein (ya ise hata hi dein):
if (typeof FIXED_HOTEL_DESTINATIONS === 'undefined') {
    var FIXED_HOTEL_DESTINATIONS = [
        "Haridwar", 
        "Rishikesh", 
        "Dehradun", 
        "Barkot", 
        "Uttarkashi", 
        "Guptkashi", 
        "Sonprayag", 
        "Phata", 
        "Badrinath Main Market", 
        "Gangotri Temple Road & Market Area"
    ];
}

/**
 * Realtime Subscription Engine for Dynamic Hotel & Room Inventory Control
 */
function initHotelRealtimeSubscriptions() {
    const client = getClient();
    if (!client) return;

    // Listen to live inventory changes on rooms table
    client
        .channel('public:rooms')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, async (payload) => {
            console.log("⚡ Realtime Room Stock Update Triggered:", payload);
            
            // Auto calculate inventory status for parent hotel
            const hotelId = payload.new ? payload.new.hotel_id : payload.old.hotel_id;
            if (hotelId) {
                await evaluateHotelVisibility(hotelId);
            }
            
            // Refresh Active Views dynamically if currently on active dashboards
            if (document.getElementById('hotel-rooms-list')) {
                loadHotelRooms();
            }
            if (document.getElementById('customer-pkg-list')) {
                loadHotelListings();
            }
        })
        .subscribe();
}

/**
 * Visibility Engine: Hides hotel if total available rooms across all categories is 0
 */
async function evaluateHotelVisibility(hotelId) {
    const client = getClient();
    const { data: roomList, error } = await client
        .from('rooms')
        .select('available_rooms')
        .eq('hotel_id', hotelId);

    if (error || !roomList) return;

    // Sum available inventory across room types
    const totalAvailable = roomList.reduce((acc, curr) => acc + (parseInt(curr.available_rooms) || 0), 0);
    const shouldHide = totalAvailable <= 0;

    // Update visibility state in Database
    await client
        .from('hotels')
        .update({ hide_from_search: shouldHide })
        .eq('hotel_id', hotelId);
}
/* =========================================================
   HOTEL PARTNER MODULE - PROPERTY & INVENTORY MANAGEMENT
   ========================================================= */

// Destination list check & definition
if (typeof FIXED_HOTEL_DESTINATIONS === 'undefined') {
    var FIXED_HOTEL_DESTINATIONS = [
        "Haridwar", 
        "Rishikesh", 
        "Dehradun", 
        "Barkot", 
        "Uttarkashi", 
        "Guptkashi", 
        "Sonprayag", 
        "Phata", 
        "Badrinath Main Market", 
        "Gangotri Temple Road & Market Area"
    ];
}

// 1. Safe Fetch Function for Hotel Profile
async function fetchHotelProfile(userId) {
    try {
        const client = getClient();
        if (!client) return null;

        const { data: hotel, error } = await client
            .from('hotels')
            .select('*')
            .eq('owner_id', userId)
            .maybeSingle();

        if (error) throw error;
        return hotel;
    } catch (err) {
        console.error("Hotel profile fetch error:", err.message);
        return null;
    }
}

// Helper: Upload Image to Supabase Storage Bucket
async function uploadHotelImage(file, bucketPath) {
    if (!file) return null;
    const client = getClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `${bucketPath}/${fileName}`;

    const { data, error } = await client.storage
        .from('hotel-assets')
        .upload(filePath, file);

    if (error) {
        console.error("Image Upload Error:", error.message);
        return null;
    }

    const { data: publicUrlData } = client.storage
        .from('hotel-assets')
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}

// Render Property & Inventory Tab Content
async function renderPropertyAndInventoryTab(container, hotel) {
    const destOptions = FIXED_HOTEL_DESTINATIONS.map(loc => 
        `<option value="${loc}" ${hotel && hotel.city === loc ? 'selected' : ''}>${loc}</option>`
    ).join('');

    container.innerHTML = `
        <div style="max-width: 900px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); color: #1e293b;">
            <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px;">
                <h2 style="margin: 0; color: #0f172a; font-size: 22px;">🏨 Hotel Profile & Inventory Setup</h2>
                <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Setup property photos, room counts, and pricing to make it visible for Agencies and Customers.</p>
            </div>

            <form id="hotel-profile-form" onsubmit="event.preventDefault(); handleSaveHotelProfile('${hotel?.hotel_id || ''}');">
                <!-- SECTION 1: BASIC & LOCATION INFO -->
                <h3 style="font-size: 16px; color: #0284c7; margin-bottom: 15px;">1. Basic Info & Nearest Location</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div>
                        <label style="font-weight: 600; font-size: 13px; display: block; margin-bottom: 5px;">Hotel Name *</label>
                        <input type="text" id="h-name" required placeholder="e.g. Hotel Devbhoomi Inn" value="${hotel?.hotel_name || ''}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-weight: 600; font-size: 13px; display: block; margin-bottom: 5px;">Nearest Permitted Location *</label>
                        <select id="h-city" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                            <option value="">-- Pick Nearest Location --</option>
                            ${destOptions}
                        </select>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="font-weight: 600; font-size: 13px; display: block; margin-bottom: 5px;">Complete Street Address *</label>
                    <input type="text" id="h-address" required placeholder="Street, Landmark, City" value="${hotel?.address || ''}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                </div>

                <!-- SECTION 2: ROOM & PRICING DETAILS -->
                <h3 style="font-size: 16px; color: #0284c7; margin-bottom: 15px;">2. Room Inventory & Rates</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div>
                        <label style="font-weight: 600; font-size: 13px; display: block; margin-bottom: 5px;">Rate per Night (₹) *</label>
                        <input type="number" id="h-rate" required min="0" step="1" placeholder="Numeric only (e.g. 2500)" value="${hotel?.price_per_night || ''}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-weight: 600; font-size: 13px; display: block; margin-bottom: 5px;">Total Rooms Count *</label>
                        <input type="number" id="h-total-rooms" required min="1" step="1" placeholder="e.g. 20" value="${hotel?.total_rooms || ''}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-weight: 600; font-size: 13px; display: block; margin-bottom: 5px;">Available Rooms *</label>
                        <input type="number" id="h-avail-rooms" required min="0" step="1" placeholder="e.g. 15" value="${hotel?.available_rooms || ''}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    </div>
                </div>

                <!-- SECTION 3: MEDIA / IMAGES UPLOAD -->
                <h3 style="font-size: 16px; color: #0284c7; margin-bottom: 15px;">3. Hotel Photos</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">
                    <div>
                        <label style="font-weight: 600; font-size: 12px; display: block; margin-bottom: 5px;">Hotel Front Image *</label>
                        <input type="file" id="h-front-img" accept="image/*" style="width: 100%; font-size: 12px;">
                        ${hotel?.front_image ? `<small style="color:#16a34a;">✓ Image Uploaded</small>` : ''}
                    </div>
                    <div>
                        <label style="font-weight: 600; font-size: 12px; display: block; margin-bottom: 5px;">Parking Area Image</label>
                        <input type="file" id="h-parking-img" accept="image/*" style="width: 100%; font-size: 12px;">
                        ${hotel?.parking_image ? `<small style="color:#16a34a;">✓ Image Uploaded</small>` : ''}
                    </div>
                    <div>
                        <label style="font-weight: 600; font-size: 12px; display: block; margin-bottom: 5px;">Room Interior Image *</label>
                        <input type="file" id="h-room-img" accept="image/*" style="width: 100%; font-size: 12px;">
                        ${hotel?.room_image ? `<small style="color:#16a34a;">✓ Image Uploaded</small>` : ''}
                    </div>
                </div>

                <!-- ACTION BUTTONS -->
                <div style="display: flex; gap: 15px; justify-content: flex-end; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    <button type="button" onclick="showHotelTab('overview')" style="padding: 10px 24px; background: #e2e8f0; color: #334155; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Cancel</button>
                    <button type="submit" id="btn-save-hotel" style="padding: 10px 24px; background: #2563eb; color: #ffffff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Upload & Save Profile</button>
                </div>
            </form>
        </div>
    `;
}

// Form Submit Handler (Database Upload Logic)
async function handleSaveHotelProfile(existingHotelId) {
    const btn = document.getElementById('btn-save-hotel');
    btn.disabled = true;
    btn.innerText = "Uploading assets & saving...";

    try {
        const client = getClient();
        const { data: { user } } = await client.auth.getUser();

        if (!user) throw new Error("User session not found.");

        const hotelName = document.getElementById('h-name').value;
        const city = document.getElementById('h-city').value;
        const address = document.getElementById('h-address').value;
        const pricePerNight = parseFloat(document.getElementById('h-rate').value);
        const totalRooms = parseInt(document.getElementById('h-total-rooms').value);
        const availableRooms = parseInt(document.getElementById('h-avail-rooms').value);

        if (availableRooms > totalRooms) {
            alert("Available rooms cannot be greater than Total rooms!");
            btn.disabled = false;
            btn.innerText = "Upload & Save Profile";
            return;
        }

        const frontFile = document.getElementById('h-front-img').files[0];
        const parkingFile = document.getElementById('h-parking-img').files[0];
        const roomFile = document.getElementById('h-room-img').files[0];

        let frontUrl = null;
        let parkingUrl = null;
        let roomUrl = null;

        if (frontFile) frontUrl = await uploadHotelImage(frontFile, 'front_views');
        if (parkingFile) parkingUrl = await uploadHotelImage(parkingFile, 'parking_views');
        if (roomFile) roomUrl = await uploadHotelImage(roomFile, 'room_views');

        const payload = {
            owner_id: user.id,
            hotel_name: hotelName,
            city: city,
            address: address,
            price_per_night: pricePerNight,
            total_rooms: totalRooms,
            available_rooms: availableRooms,
            hide_from_search: false,
            updated_at: new Date()
        };

        if (frontUrl) payload.front_image = frontUrl;
        if (parkingUrl) payload.parking_image = parkingUrl;
        if (roomUrl) payload.room_image = roomUrl;

        let dbError = null;

        if (existingHotelId) {
            const { error } = await client
                .from('hotels')
                .update(payload)
                .eq('hotel_id', existingHotelId);
            dbError = error;
        } else {
            const { error } = await client
                .from('hotels')
                .insert([payload]);
            dbError = error;
        }

        if (dbError) throw dbError;

        alert("🎉 Hotel Profile & Inventory updated successfully! It is now live for Agencies & Customers.");
        showHotelTab('overview');

    } catch (err) {
        console.error("Save Error:", err.message);
        alert("Failed to save profile: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Upload & Save Profile";
    }
}

// UI Layout Render Function
async function renderHotelDashboard(user, hotelData = null) {
    const app = document.getElementById('app');
    if (!app) return;
    
    app.style.maxWidth = "100%";

    app.innerHTML = `
        <div style="display:flex; min-height:100vh; background:#f8f9fa; margin:-20px; font-family:'Inter', sans-serif;">
            <!-- SIDEBAR -->
            <div style="width:260px; background:#1e272e; color:white; padding:25px; flex-shrink:0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;">
                    <h2 style="color:#ff9f43; margin:0;">TourSetu <small style="font-size:12px; color:#aaa; display:block;">Hotel Partner</small></h2>
                </div>
                <nav>
                    <div onclick="showHotelTab('overview')" class="nav-item" style="padding:12px; cursor:pointer; border-radius:8px; margin-bottom:5px;">📊 Dashboard</div>
                    <div onclick="showHotelTab('property')" class="nav-item" style="padding:12px; cursor:pointer; border-radius:8px; margin-bottom:5px;">🏨 Property & Rooms</div>
                    <div onclick="showHotelTab('requests')" class="nav-item" style="padding:12px; cursor:pointer; border-radius:8px; margin-bottom:5px;">📥 Booking Inbox</div>
                    <div onclick="confirmAndExecuteLogout()" style="padding:15px; cursor:pointer; color:#ff7675; margin-top:50px; font-weight:bold; border-top:1px solid #444;">🚪 Logout</div>
                </nav>
            </div>
            
            <!-- MAIN DISPLAY AREA -->
            <div id="hotel-main-content" style="flex:1; padding:40px; overflow-y:auto; background:#f8f9fa;"></div>
        </div>

        <!-- Action Modal -->
        <div id="hotel-action-modal" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center; padding:20px;">
            <div class="card" style="background:white; max-width:450px; width:100%; padding:30px; border-radius:15px; text-align:left;">
                <div id="hotel-action-modal-body"></div>
            </div>
        </div>
    `;

    if (typeof initHotelRealtimeSubscriptions === "function") {
        initHotelRealtimeSubscriptions();
    }
    
    showHotelTab('overview');
}

// 4. Tab Switching Global Function
window.showHotelTab = async function(tabName) {
    const container = document.getElementById('hotel-main-content');
    if (!container) return;

    const client = getClient();
    if (!client) return;

    const { data: { user } } = await client.auth.getUser();
    if (!user) return;

    const hotel = await fetchHotelProfile(user.id);

    // TAB 1: OVERVIEW
    if (tabName === 'overview') {
        if (!hotel) {
            container.innerHTML = `
                <div class="card" style="background:white; padding:40px; border-radius:15px; text-align:center;">
                    <h2>Welcome Partner! 🏨</h2>
                    <p style="color:#666;">Please setup your property details to begin taking room requests.</p>
                    <button onclick="showHotelTab('property')" style="background:#ff9f43; color:white; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:10px;">Setup Property Now</button>
                </div>`;
            return;
        }

        const { data: requests } = await client.from('hotel_requests').select('*').eq('hotel_id', hotel.hotel_id);
        const pendingCount = requests ? requests.filter(r => r.status === 'pending').length : 0;
        const approvedCount = requests ? requests.filter(r => r.status === 'approved').length : 0;

        container.innerHTML = `
            <h1>Hotel Overview</h1>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:20px; margin-top:20px;">
                <div class="card" style="background:white; padding:25px; border-radius:12px; border-left:5px solid #ff9f43;">
                    <small style="color:#888;">PROPERTY STATUS</small>
                    <h3 style="margin:5px 0;">${hotel.hide_from_search ? '🔴 Hidden (No Inventory)' : '🟢 Active & Listed'}</h3>
                </div>
                <div class="card" style="background:white; padding:25px; border-radius:12px; border-left:5px solid #3498db;">
                    <small style="color:#888;">PENDING REQUESTS</small>
                    <h2 style="margin:5px 0;">${pendingCount}</h2>
                </div>
                <div class="card" style="background:white; padding:25px; border-radius:12px; border-left:5px solid #2ecc71;">
                    <small style="color:#888;">CONFIRMED BOOKINGS</small>
                    <h2 style="margin:5px 0;">${approvedCount}</h2>
                </div>
            </div>`;
    } 
    // TAB 2: PROPERTY / ROOM INVENTORY
    else if (tabName === 'property' || tabName === 'room-inventory' || tabName === 'inventory') {
        const destSelectOptions = (typeof FIXED_HOTEL_DESTINATIONS !== 'undefined' ? FIXED_HOTEL_DESTINATIONS : []).map(loc => 
            `<option value="${loc}" ${hotel && hotel.city === loc ? 'selected' : ''}>${loc}</option>`
        ).join('');

        container.innerHTML = `
            <h1>Property & Inventory Management</h1>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-top:20px;">
                <div class="card" style="background:white; padding:25px; border-radius:15px;">
                    <h3>🏨 Property Profile</h3>
                    <input type="text" id="h-name" placeholder="Hotel Name" value="${hotel?.hotel_name || ''}" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                    
                    <label style="font-size:12px; color:#666; font-weight:bold; display:block; margin-top:10px;">DESTINATION</label>
                    <select id="h-city" style="width:100%; padding:10px; margin:5px 0; border:1px solid #ddd; border-radius:8px;">
                        <option value="">Select Permitted Destination</option>
                        ${destSelectOptions}
                    </select>

                    <input type="text" id="h-address" placeholder="Complete Street Address" value="${hotel?.address || ''}" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                    <input type="file" id="h-front-pic" accept="image/*" style="margin:8px 0;">

                    <button onclick="handleSaveHotelProfile('${hotel?.hotel_id || ''}')" style="width:100%; background:#ff9f43; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:15px;">Save Property Profile</button>
                </div>

                <div class="card" style="background:white; padding:25px; border-radius:15px;">
                    <h3>🛏️ Add Room Category</h3>
                    ${!hotel ? '<p style="color:#e74c3c;">Save hotel property details first before adding rooms.</p>' : `
                        <input type="text" id="r-type" placeholder="Room Category (e.g. Deluxe AC)" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                        <input type="number" id="r-price" placeholder="Price per Night (₹)" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                        <input type="number" id="r-total" placeholder="Total Rooms Inventory" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                        <input type="number" id="r-available" placeholder="Current Available Rooms" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                        <input type="file" id="r-photos" multiple accept="image/*" style="margin:8px 0;">

                        <button id="btn-save-room" onclick="saveRoomCategory('${hotel.hotel_id}')" style="width:100%; background:#2ecc71; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:15px;">+ Add Room Type</button>
                    `}
                </div>
            </div>

            <div style="margin-top:30px;">
                <h3>Live Inventory Stock</h3>
                <div id="hotel-rooms-list">Loading inventory...</div>
            </div>`;

        if (hotel && typeof loadHotelRooms === "function") loadHotelRooms(hotel.hotel_id);
    } 
    // TAB 3: REQUESTS (Correctly connected with main IF block)
    else if (tabName === 'requests') {
        container.innerHTML = `
            <h1>Booking & Quote Requests</h1>
            <div style="margin-top:20px;" id="hotel-inbox-container">Loading requests...</div>`;
        if (hotel && typeof loadHotelRequests === "function") {
            loadHotelRequests(hotel.hotel_id);
        }
    }
};

// --- SUPPORTING FUNCTIONS FOR AUTO-LOAD & EDIT FEATURE ---

let currentEditingRoomId = null;

// Live Inventory Stock Auto-Loader
async function loadHotelRooms(hotelId) {
    const listDiv = document.getElementById('hotel-rooms-list');
    if (!listDiv) return;

    const client = getClient();
    if (!client) return;

    const { data: rooms, error } = await client
        .from('room_categories')
        .select('*')
        .eq('hotel_id', hotelId);

    if (error) {
        listDiv.innerHTML = `<p style="color:red;">Error loading rooms: ${error.message}</p>`;
        return;
    }

    if (!rooms || rooms.length === 0) {
        listDiv.innerHTML = `<p style="color:#666;">No room categories added yet.</p>`;
        return;
    }

    listDiv.innerHTML = rooms.map(room => `
        <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:15px; margin-top:10px; background:#fff; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div>
                <h4 style="margin:0;">${room.category_name || room.room_type || ''}</h4>
                <p style="margin:5px 0 0; color:#666;">Price: ₹${room.price_per_night || room.price || 0} / night</p>
            </div>
            
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="text-align:right;">
                    <small style="color:#888; font-size:10px; display:block;">AVAILABLE / TOTAL</small>
                    <div><strong>${room.available_rooms ?? 0}</strong> / ${room.total_rooms ?? 0}</div>
                </div>
                
                <button onclick="editRoomCategory('${room.id}', '${room.category_name || room.room_type || ''}', '${room.price_per_night || room.price || 0}', '${room.total_rooms || 0}', '${room.available_rooms || 0}')" 
                        style="background:#2196F3; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer; font-weight:bold;">
                    ✏️ Edit
                </button>
            </div>
        </div>
    `).join('');
}

// Edit Button Click Action
function editRoomCategory(id, category, price, total, available) {
    currentEditingRoomId = id;

    if (document.getElementById('r-type')) document.getElementById('r-type').value = category;
    if (document.getElementById('r-price')) document.getElementById('r-price').value = price;
    if (document.getElementById('r-total')) document.getElementById('r-total').value = total;
    if (document.getElementById('r-available')) document.getElementById('r-available').value = available;

    const btn = document.getElementById('btn-save-room');
    if (btn) {
        btn.innerText = "🔄 Update Room Type";
        btn.style.backgroundColor = "#ff9800";
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Save or Update Room Category Logic
async function saveRoomCategory(hotelId) {
    const category = document.getElementById('r-type')?.value;
    const price = document.getElementById('r-price')?.value;
    const total = document.getElementById('r-total')?.value || 0;
    const available = document.getElementById('r-available')?.value || 0;

    if (!category || !price) {
        alert("Please enter room category and price!");
        return;
    }

    const client = getClient();
    if (!client) {
        alert("Database client unavailable!");
        return;
    }

    const payload = {
        hotel_id: hotelId,
        room_type: category,
        price_per_night: price,
        total_rooms: total,
        available_rooms: available
    };

    let error;

    if (currentEditingRoomId) {
        const res = await client
            .from('room_categories')
            .update(payload)
            .eq('id', currentEditingRoomId);
        error = res.error;
    } else {
        const res = await client
            .from('room_categories')
            .insert([payload]);
        error = res.error;
    }

    if (error) {
        alert("Error saving room: " + error.message);
    } else {
        alert(currentEditingRoomId ? "Room updated successfully!" : "Room added successfully!");
        
        currentEditingRoomId = null;
        if (document.getElementById('r-type')) document.getElementById('r-type').value = '';
        if (document.getElementById('r-price')) document.getElementById('r-price').value = '';
        if (document.getElementById('r-total')) document.getElementById('r-total').value = '';
        if (document.getElementById('r-available')) document.getElementById('r-available').value = '';

        const btn = document.getElementById('btn-save-room');
        if (btn) {
            btn.innerText = "+ Add Room Type";
            btn.style.backgroundColor = "#2ecc71";
        }

        loadHotelRooms(hotelId);
    }
}
  // 1. Safe Fetch Function for Hotel Profile
async function fetchHotelProfile(userId) {
    try {
        const client = getClient();
        if (!client) return null;

        const { data: hotel, error } = await client
            .from('hotels')
            .select('*')
            .eq('owner_id', userId)
            .maybeSingle();

        if (error) throw error;
        return hotel;
    } catch (err) {
        console.error("Hotel profile fetch error:", err.message);
        return null;
    }
}

// 2. Global Tab Switcher Function
window.showHotelTab = async function(tabName) {
    const container = document.getElementById('hotel-main-content');
    if (!container) return;

    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;

    const hotel = await fetchHotelProfile(user.id);

    // TAB: OVERVIEW
    if (tabName === 'overview') {
        if (!hotel) {
            container.innerHTML = `
                <div class="card" style="background:white; padding:40px; border-radius:15px; text-align:center;">
                    <h2>Welcome Partner! 🏨</h2>
                    <p style="color:#666;">Please setup your property details to begin taking room requests.</p>
                    <button onclick="showHotelTab('property')" style="background:#ff9f43; color:white; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:10px;">Setup Property Now</button>
                </div>`;
            return;
        }

        const { data: requests } = await client.from('hotel_requests').select('*').eq('hotel_id', hotel.hotel_id);
        const pendingCount = requests ? requests.filter(r => r.status === 'pending').length : 0;
        const approvedCount = requests ? requests.filter(r => r.status === 'approved').length : 0;

        container.innerHTML = `
            <h1>Hotel Overview</h1>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:20px; margin-top:20px;">
                <div class="card" style="background:white; padding:25px; border-radius:12px; border-left:5px solid #ff9f43;">
                    <small style="color:#888;">PROPERTY STATUS</small>
                    <h3 style="margin:5px 0;">${hotel.hide_from_search ? '🔴 Hidden (No Inventory)' : '🟢 Active & Listed'}</h3>
                </div>
                <div class="card" style="background:white; padding:25px; border-radius:12px; border-left:5px solid #3498db;">
                    <small style="color:#888;">PENDING REQUESTS</small>
                    <h2 style="margin:5px 0;">${pendingCount}</h2>
                </div>
                <div class="card" style="background:white; padding:25px; border-radius:12px; border-left:5px solid #2ecc71;">
                    <small style="color:#888;">CONFIRMED BOOKINGS</small>
                    <h2 style="margin:5px 0;">${approvedCount}</h2>
                </div>
            </div>`;
    } 
    // TAB: PROPERTY / ROOM INVENTORY (Teeno Names Support Karega)
    else if (tabName === 'property' || tabName === 'room-inventory' || tabName === 'inventory') {
        const destSelectOptions = (typeof FIXED_HOTEL_DESTINATIONS !== 'undefined' ? FIXED_HOTEL_DESTINATIONS : []).map(loc => 
            `<option value="${loc}" ${hotel && hotel.city === loc ? 'selected' : ''}>${loc}</option>`
        ).join('');

        container.innerHTML = `
            <h1>Property & Inventory Management</h1>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-top:20px;">
                <div class="card" style="background:white; padding:25px; border-radius:15px;">
                    <h3>🏨 Property Profile</h3>
                    <input type="text" id="h-name" placeholder="Hotel Name" value="${hotel?.hotel_name || ''}" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                    
                    <label style="font-size:12px; color:#666; font-weight:bold; display:block; margin-top:10px;">DESTINATION</label>
                    <select id="h-city" style="width:100%; padding:10px; margin:5px 0; border:1px solid #ddd; border-radius:8px;">
                        <option value="">Select Permitted Destination</option>
                        ${destSelectOptions}
                    </select>

                    <input type="text" id="h-address" placeholder="Complete Street Address" value="${hotel?.address || ''}" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                    <input type="file" id="h-front-pic" accept="image/*" style="margin:8px 0;">

                    <button onclick="saveHotelProfile('${hotel?.hotel_id || ''}')" style="width:100%; background:#ff9f43; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:15px;">Save Property Profile</button>
                </div>

                <div class="card" style="background:white; padding:25px; border-radius:15px;">
                    <h3>🛏️ Add Room Category</h3>
                    ${!hotel ? '<p style="color:#e74c3c;">Save hotel property details first before adding rooms.</p>' : `
                        <input type="text" id="r-type" placeholder="Room Category (e.g. Deluxe AC)" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                        <input type="number" id="r-price" placeholder="Price per Night (₹)" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                        <input type="number" id="r-total" placeholder="Total Rooms Inventory" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                        <input type="number" id="r-available" placeholder="Current Available Rooms" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                        <input type="file" id="r-photos" multiple accept="image/*" style="margin:8px 0;">

                        <button onclick="saveRoomCategory('${hotel.hotel_id}')" style="width:100%; background:#2ecc71; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:15px;">+ Add Room Type</button>
                    `}
                </div>
            </div>

            <div style="margin-top:30px;">
                <h3>Live Inventory Stock</h3>
                <div id="hotel-rooms-list">Loading inventory...</div>
            </div>`;

        if (hotel && typeof loadHotelRooms === "function") loadHotelRooms(hotel.hotel_id);
    } 
    // TAB: REQUESTS
    else if (tabName === 'requests') {
        container.innerHTML = `
            <h1>Booking & Quote Requests</h1>
            <div style="margin-top:20px;" id="hotel-inbox-container">Loading requests...</div>`;
        if (hotel && typeof loadHotelRequests === "function") loadHotelRequests(hotel.hotel_id);
    }
};
/* =========================================
   12. HOTEL DATA MUTATION HELPERS
   ========================================= */

window.saveHotelProfile = async function(existingHotelId) {
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();

    const name = document.getElementById('h-name').value.trim();
    const city = document.getElementById('h-city').value;
    const address = document.getElementById('h-address').value.trim();
    const fileInput = document.getElementById('h-front-pic');

    if (!name || !city || !address) {
        alert("Please fill out all required fields!");
        return;
    }

    let imageUrl = null;
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `hotels/${Date.now()}.${fileExt}`;
        const { error: uploadErr } = await client.storage.from('hotel-media').upload(filePath, file);
        if (uploadErr) { alert("Image Upload Failed: " + uploadErr.message); return; }
        const { data: urlData } = client.storage.from('hotel-media').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
    }

    const payload = {
        owner_id: user.id,
        hotel_name: name,
        city: city,
        address: address,
        status: 'pending',
        hide_from_search: true
    };
    if (imageUrl) payload.front_pictures_urls = [imageUrl];

    let err = null;
    if (existingHotelId) {
        const { error } = await client.from('hotels').update(payload).eq('hotel_id', existingHotelId);
        err = error;
    } else {
        const { error } = await client.from('hotels').insert([payload]);
        err = error;
    }

    if (!err) {
        alert("Hotel Details Saved!");
        showHotelTab('property');
    } else {
        alert("Save Error: " + err.message);
    }
};

window.saveRoomCategory = async function(hotelId) {
    const client = getClient();
    const type = document.getElementById('r-type').value.trim();
    const price = parseFloat(document.getElementById('r-price').value);
    const total = parseInt(document.getElementById('r-total').value);
    const available = parseInt(document.getElementById('r-available').value);
    const fileInput = document.getElementById('r-photos');

    if (!type || isNaN(price) || isNaN(total) || isNaN(available)) {
        alert("Please fill all valid numerical room details.");
        return;
    }

    let uploadedUrls = [];
    if (fileInput.files.length > 0) {
        for (let file of fileInput.files) {
            const filePath = `rooms/${Date.now()}_${file.name}`;
            const { error: uploadErr } = await client.storage.from('hotel-media').upload(filePath, file);
            if (!uploadErr) {
                const { data: urlData } = client.storage.from('hotel-media').getPublicUrl(filePath);
                uploadedUrls.push(urlData.publicUrl);
            }
        }
    }

    const { error } = await client.from('rooms').insert([{
        hotel_id: hotelId,
        room_type: type,
        specific_price: price,
        total_rooms: total,
        available_rooms: available,
        room_photos_urls: uploadedUrls
    }]);

    if (!error) {
        alert("Room Category Added!");
        await evaluateHotelVisibility(hotelId);
        loadHotelRooms(hotelId);
    } else {
        alert("Error creating room: " + error.message);
    }
};

async function loadHotelRooms(hotelId) {
    const container = document.getElementById('hotel-rooms-list');
    if (!container) return;

    const client = getClient();
    const { data: rooms } = await client.from('rooms').select('*').eq('hotel_id', hotelId);

    if (!rooms || rooms.length === 0) {
        container.innerHTML = `<p style="color:#777;">No room categories configured yet.</p>`;
        return;
    }

    container.innerHTML = rooms.map(r => `
        <div class="card" style="background:white; padding:15px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <h4 style="margin:0;">${r.room_type}</h4>
                <small style="color:#666;">Price: ₹${r.specific_price} / night</small>
            </div>
            <div style="display:flex; align-items:center; gap:15px;">
                <div>
                    <small style="display:block; font-size:10px; color:#888;">AVAILABLE / TOTAL</small>
                    <input type="number" value="${r.available_rooms}" min="0" max="${r.total_rooms}" onchange="updateRoomStock('${r.room_id}', '${r.hotel_id}', this.value)" style="width:60px; padding:5px; border:1px solid #ccc; border-radius:5px; font-weight:bold;"> / ${r.total_rooms}
                </div>
            </div>
        </div>
    `).join('');
}

window.updateRoomStock = async function(roomId, hotelId, newAvailable) {
    const client = getClient();
    const { error } = await client
        .from('rooms')
        .update({ available_rooms: parseInt(newAvailable) })
        .eq('room_id', roomId);

    if (!error) {
        await evaluateHotelVisibility(hotelId);
    } else {
        alert("Failed to update stock: " + error.message);
    }
};

async function loadHotelRequests(hotelId) {
    const container = document.getElementById('hotel-inbox-container');
    const client = getClient();
    const { data: requests } = await client
        .from('hotel_requests')
        .select('*, rooms(*)')
        .eq('hotel_id', hotelId)
        .order('created_at', { ascending: false });

    if (!requests || requests.length === 0) {
        container.innerHTML = `<p style="color:#777;">No incoming requests.</p>`;
        return;
    }

    container.innerHTML = requests.map(req => {
        let statusBadge = `#ff9f43`;
        if (req.status === 'approved') statusBadge = `#2ecc71`;
        if (req.status === 'denied') statusBadge = `#e74c3c`;

        return `
        <div class="card" style="background:white; padding:20px; border-radius:12px; margin-bottom:15px; border-left:5px solid ${statusBadge};">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <h3 style="margin:0;">${req.rooms?.room_type || 'Room Request'}</h3>
                    <small style="color:#888;">Requester: <b>${req.requester_type.toUpperCase()}</b> (${req.agency_contact || 'Direct Customer'})</small>
                    <p style="margin:5px 0; font-size:13px;">Dates: ${req.requested_dates || 'Not Specified'}</p>
                </div>
                <div style="text-align:right;">
                    <span style="background:${statusBadge}; color:white; font-size:10px; padding:3px 8px; border-radius:4px; font-weight:bold;">${req.status.toUpperCase()}</span>
                </div>
            </div>

            ${req.status === 'pending' ? `
                <div style="margin-top:15px; display:flex; gap:10px;">
                    <button onclick="promptHotelAction('${req.request_id}', 'approve')" style="background:#2ecc71; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight:bold;">Accept</button>
                    <button onclick="promptHotelAction('${req.request_id}', 'deny')" style="background:#e74c3c; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight:bold;">Deny</button>
                </div>
            ` : ''}
        </div>`;
    }).join('');
}

window.promptHotelAction = function(requestId, action) {
    const modal = document.getElementById('hotel-action-modal');
    const body = document.getElementById('hotel-action-modal-body');

    if (action === 'approve') {
        body.innerHTML = `
            <h3 style="margin-top:0;">Accept Booking & Set Payment Info</h3>
            <p style="font-size:12px; color:#666;">Enter payment collection instructions (GPay / UPI / Bank Details) for the buyer:</p>
            <textarea id="h-pay-details" placeholder="e.g. GPay UPI ID: 9876543210@upi or Bank transfer details..." style="width:100%; height:80px; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;"></textarea>
            <button onclick="executeHotelRequestAction('${requestId}', 'approved')" style="width:100%; background:#2ecc71; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">Confirm Acceptance</button>
        `;
    } else {
        body.innerHTML = `
            <h3 style="margin-top:0; color:#e74c3c;">Deny Booking Request</h3>
            <p style="font-size:12px; color:#666;">State cancellation reason for client:</p>
            <textarea id="h-deny-reason" placeholder="Reason for declining inquiry..." style="width:100%; height:80px; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;"></textarea>
            <button onclick="executeHotelRequestAction('${requestId}', 'denied')" style="width:100%; background:#e74c3c; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">Confirm Decline</button>
        `;
    }
    modal.style.display = 'flex';
};

window.executeHotelRequestAction = async function(requestId, newStatus) {
    const client = getClient();
    const payInfo = document.getElementById('h-pay-details')?.value || null;

    const { error } = await client
        .from('hotel_requests')
        .update({ status: newStatus, agency_contact: payInfo })
        .eq('request_id', requestId);

    if (!error) {
        document.getElementById('hotel-action-modal').style.display = 'none';
        showHotelTab('requests');
    } else {
        alert("Action Error: " + error.message);
    }
};

/* =========================================
   13. CUSTOMER & AGENCY DISCOVERY MODULE
   ========================================= */

window.loadHotelListings = async function() {
    const client = getClient();
    // Only query non-hidden hotel properties (Hide visibility rule enforcement)
    const { data: hotels } = await client
        .from('hotels')
        .select('*, rooms(*)')
        .eq('hide_from_search', false);

    return hotels || [];
};
/* ==========================================================================
   TOURSETU - HOTEL PARTNER ECOSYSTEM MODULE
   Engineered for: Realtime Inventory, Multi-Role Workflows, Dynamic Visibility
   ========================================================================== */

// 1. STRICT LOCATION MATRIX CONSTRAINT (11 Permitted Locations)
const PERMITTED_HOTEL_LOCATIONS = [
    "Haridwar", "Barkot", "Uttarkashi", "Yamunotri", "Gangotri", 
    "Kedarnath", "Badrinath", "Rishikesh", "Dehradun", "Devprayag", "Srinagar (Garhwal)"
];

let hotelRealtimeChannel = null;

/* ==========================================================================
   AUTH REGISTRATION EXTENSION
   ========================================================================== */
/**
 * Extends auth signup to register Hotel Partners with metadata
 */
async function registerHotelUser(email, password, phone, businessName) {
    const client = getClient();
    try {
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: 'hotel',
                    phone: phone,
                    business_name: businessName
                }
            }
        });

        if (error) throw error;

        // Upsert into profiles table
        if (data.user) {
            await client.from('profiles').upsert({
                id: data.user.id,
                email: email,
                role: 'hotel',
                phone: phone,
                business_details: { company_name: businessName }
            });
        }

        alert('Hotel Partner Registration successful! Please log in.');
    } catch (err) {
        console.error('Registration Error:', err.message);
        alert('Registration failed: ' + err.message);
    }
}

/* ==========================================================================
   HOTEL PARTNER DASHBOARD RENDERER
   ========================================================================== */
/**
 * Main dashboard view generator for role === 'hotel'
 */
async function renderHotelDashboard(user) {
    window.currentHotelDashboardUser = user;
    const app = document.getElementById('app');
    if (!app) return;
    app.style.maxWidth = "100%";

    app.innerHTML = `
        <div style="display:flex; min-height:100vh; background:#f4f7f6; margin:-20px; font-family:'Inter', sans-serif;">
            <!-- Hotel Sidebar Navigation -->
            <div style="width:260px; background:#1e272e; color:white; padding:25px; flex-shrink:0;">
               <h2 style="color:#ff9f43; margin-bottom:5px;">TourSetu</h2>
               <small style="font-size:12px; color:#aaa; display:block; margin-bottom:30px;">Hotel Partner Panel</small>
               
               <nav style="display:flex; flex-direction:column; gap:8px;">
                    <button onclick="switchHotelTab('overview')" class="hotel-nav-btn" style="text-align:left; padding:13px 14px; background:#2c3e50; border:1px solid rgba(255,255,255,.06); color:white; font-weight:800; cursor:pointer; border-radius:10px;">📊 Overview</button>
                    <button onclick="switchHotelTab('property')" class="hotel-nav-btn" style="text-align:left; padding:13px 14px; background:transparent; border:1px solid transparent; color:#dfe6e9; font-weight:700; cursor:pointer; border-radius:10px;">🏨 Property & Rooms</button>
                    <button onclick="switchHotelTab('inbox')" class="hotel-nav-btn" style="text-align:left; padding:13px 14px; background:transparent; border:1px solid transparent; color:#dfe6e9; font-weight:700; cursor:pointer; border-radius:10px;">📥 Booking Inbox</button>
                    <button onclick="switchHotelTab('arrivals-payouts')" class="hotel-nav-btn" style="text-align:left; padding:13px 14px; background:transparent; border:1px solid transparent; color:#dfe6e9; font-weight:700; cursor:pointer; border-radius:10px;">📋 Arrivals & Payouts</button>
                    <button onclick="confirmAndExecuteLogout()" style="text-align:left; padding:13px 14px; background:rgba(231,76,60,.08); border:1px solid rgba(231,76,60,.18); color:#ff7675; font-weight:800; cursor:pointer; margin-top:32px; border-radius:10px;">🚪 Logout</button>
               </nav>
            </div>

            <!-- Main Content Display -->
            <div id="hotel-main-content" style="flex:1; padding:40px; overflow-y:auto;">
                <div style="text-align:center; padding:50px;">
                    <div class="skeleton-loader" style="height:40px; width:300px; margin:0 auto 20px; background:#e0e0e0; border-radius:8px;"></div>
                    <p style="color:#666;">Loading property matrix...</p>
                </div>
            </div>
        </div>

        <!-- Global Action Modal -->
        <div id="hotel-action-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:99999; justify-content:center; align-items:center;">
            <div id="hotel-modal-box" style="background:white; padding:30px; border-radius:15px; width:90%; max-width:480px; box-shadow:0 10px 25px rgba(0,0,0,0.2);"></div>
        </div>
    `;

    // Initialize Real-time Database Listeners
    initHotelRealtimeSubscriptions(user.id);
    // Render initial overview tab
    await switchHotelTab('overview');
    const hotelVerification = await getHotelVerification(user.id).catch(()=>null);
    window.currentHotelVerificationStatus = hotelVerification?.status || 'pending';
    const hotelMain = document.getElementById('hotel-main-content');
    if (hotelMain) {
        const banner = document.createElement('div');
        banner.id = 'hotel-verification-banner';
        banner.style.cssText = 'margin-bottom:20px;padding:14px 16px;border-radius:10px;font-size:13px;font-weight:700;';
        if (window.currentHotelVerificationStatus === 'approved') {
            banner.style.background = '#eafaf1';
            banner.style.border = '1px solid #b7e4c7';
            banner.style.color = '#1e8449';
            banner.innerHTML = '✅ Hotel verification approved. Your property can be shown to customers when inventory is available.';
        } else if (window.currentHotelVerificationStatus === 'denied') {
            banner.style.background = '#fff0f0';
            banner.style.border = '1px solid #f5b7b1';
            banner.style.color = '#c0392b';
            banner.innerHTML = '❌ Hotel verification denied.' + (hotelVerification?.denial_reason ? ' Reason: ' + hotelVerification.denial_reason : '');
        } else {
            banner.style.background = '#fff8e8';
            banner.style.border = '1px solid #ffd59a';
            banner.style.color = '#9a6700';
            banner.innerHTML = '⏳ Hotel verification pending. Your hotel profile is hidden from customers until admin approval.';
        }
        hotelMain.prepend(banner);
    }
}


/* ==========================================================================
   HOTEL LOGOUT CONFIRMATION
   ========================================================================== */
window.confirmAndExecuteLogout = function() {
    const existing = document.getElementById('hotel-logout-confirmation');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'hotel-logout-confirmation';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:1000000;background:rgba(15,23,42,.68);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';

    overlay.innerHTML = `
        <div style="width:min(430px,100%);background:#fff;border-radius:20px;padding:28px;box-sizing:border-box;box-shadow:0 24px 70px rgba(0,0,0,.28);text-align:center;font-family:Inter,sans-serif;">
            <div style="width:62px;height:62px;margin:0 auto 14px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff4e8;font-size:30px;">🚪</div>
            <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;">Logout from Hotel Dashboard?</h2>
            <p style="margin:0 0 24px;color:#64748b;line-height:1.55;font-size:14px;">Are you sure you want to logout? Your current dashboard session will be ended.</p>
            <div style="display:flex;gap:12px;">
                <button type="button" onclick="document.getElementById('hotel-logout-confirmation')?.remove()" style="flex:1;padding:13px 16px;border-radius:10px;border:1px solid #cbd5e1;background:#f8fafc;color:#334155;font-weight:800;cursor:pointer;">DENY</button>
                <button type="button" onclick="executeHotelLogout()" style="flex:1;padding:13px 16px;border-radius:10px;border:0;background:#e74c3c;color:#fff;font-weight:800;cursor:pointer;box-shadow:0 6px 16px rgba(231,76,60,.25);">CONFIRM</button>
            </div>
        </div>
    `;

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
};

window.executeHotelLogout = async function() {
    const button = document.querySelector('#hotel-logout-confirmation button[onclick="executeHotelLogout()"]');
    if (button) {
        button.disabled = true;
        button.innerText = 'LOGGING OUT...';
        button.style.opacity = '.7';
        button.style.cursor = 'wait';
    }

    try {
        const client = getClient();
        if (client) await client.auth.signOut();
    } finally {
        window.location.reload();
    }
};

/* ==========================================================================
   TAB NAVIGATION & DATA RENDERER LOGIC
   ========================================================================== */
async function switchHotelTab(tabName) {
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    const content = document.getElementById('hotel-main-content');

   // ✅ SAFE FETCHING LOGIC
const { data: hotelsList, error } = await client
    .from('hotels')
    .select('*')
    .eq('owner_id', user.id);

if (error) {
    console.error("Hotel fetch error:", error);
}

// Check agar hotel profile exist karta hai ya nahi
const hotel = (hotelsList && hotelsList.length > 0) ? hotelsList[0] : null;

if (!hotel) {
    // Agar hotel record nahi mila, toh crash mat hone do - 'Create Profile' form dikhao!
    const content = document.getElementById('hotel-main-content');
    content.innerHTML = `
        <div style="background:white; padding:30px; border-radius:12px; text-align:center;">
            <h3>🏨 Welcome to TourSetu Hotel Dashboard</h3>
            <p style="color:#666;">Aapki hotel property abhi registered nahi hai. Pehle property details bharein.</p>
            <button onclick="switchHotelTab('property')" style="background:#ff9f43; color:white; border:none; padding:10px 20px; border-radius:6px; cursor:pointer;">Create Property Profile</button>
        </div>
    `;
    return;
}

    if (!hotel && tabName !== 'property') {
        content.innerHTML = `
            <div style="background:white; padding:40px; border-radius:12px; text-align:center; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                <h3 style="color:#e67e22; margin-bottom:10px;">⚠️ Complete Property Registration Required</h3>
                <p style="color:#666; margin-bottom:20px;">You must setup your hotel profile and location details before managing inventory.</p>
                <button onclick="switchHotelTab('property')" style="background:#ff9f43; color:white; border:none; padding:12px 24px; border-radius:8px; cursor:pointer; font-weight:bold;">Create Property Profile</button>
            </div>`;
        return;
    }

    // TAB 1: OVERVIEW & QUICK METRICS
    if (tabName === 'overview') {
        const { data: rooms } = await client.from('rooms').select('*').eq('hotel_id', hotel.hotel_id);
        const { data: reqs } = await client.from('hotel_requests').select('*').eq('hotel_id', hotel.hotel_id);

        const totalRooms = rooms ? rooms.reduce((acc, r) => acc + r.total_rooms, 0) : 0;
        const availRooms = rooms ? rooms.reduce((acc, r) => acc + r.available_rooms, 0) : 0;
        const totalEarnings = reqs ? reqs.filter(r => r.status === 'approved').reduce((acc, r) => acc + parseFloat(r.total_amount), 0) : 0;
        const pendingCount = reqs ? reqs.filter(r => r.status === 'pending').length : 0;

        content.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap;margin-bottom:24px;">
                <div>
                    <div style="font-size:12px;font-weight:900;letter-spacing:.08em;color:#ff9f43;text-transform:uppercase;">HOTEL PARTNER PANEL</div>
                    <h2 style="margin:5px 0 4px;color:#1e293b;font-size:28px;">Welcome back, ${hotel.hotel_name || 'Hotel Partner'} 👋</h2>
                    <p style="margin:0;color:#64748b;font-size:14px;">Manage your rooms, booking requests, arrivals and customer payments from one place.</p>
                </div>
                <button onclick="switchHotelTab('arrivals-payouts')" style="border:0;background:#ff9f43;color:#fff;padding:12px 17px;border-radius:11px;font-weight:900;cursor:pointer;box-shadow:0 7px 18px rgba(255,159,67,.22);">📋 View Arrivals & Payouts</button>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px;">
                <div style="background:linear-gradient(135deg,#ffffff,#f0fff7); padding:22px; border-radius:16px; border:1px solid #d7f3e4; box-shadow:0 8px 24px rgba(15,23,42,.06);">
                    <small style="color:#64748b; font-weight:900;">ROOM AVAILABILITY</small>
                    <h3 style="margin:9px 0 5px;color:#1e293b;font-size:23px;">${availRooms} / ${totalRooms}</h3>
                    <span style="font-size:12px; color:${availRooms > 0 ? '#16a34a' : '#dc2626'}; font-weight:800;">
                        ${availRooms > 0 ? '🟢 Visible on Customer / Agency Search' : '🔴 Hidden from Search (Zero Stock)'}
                    </span>
                </div>
                <div style="background:linear-gradient(135deg,#ffffff,#fff7ed); padding:22px; border-radius:16px; border:1px solid #fed7aa; box-shadow:0 8px 24px rgba(15,23,42,.06);">
                    <small style="color:#64748b; font-weight:900;">PENDING REQUESTS</small>
                    <h3 style="margin:9px 0 5px;color:#1e293b;font-size:23px;">${pendingCount}</h3>
                    <small style="color:#2563eb;cursor:pointer;font-weight:800;" onclick="switchHotelTab('inbox')">Open Booking Inbox →</small>
                </div>
                <div style="background:linear-gradient(135deg,#ffffff,#eff6ff); padding:22px; border-radius:16px; border:1px solid #dbeafe; box-shadow:0 8px 24px rgba(15,23,42,.06);">
                    <small style="color:#64748b; font-weight:900;">CONFIRMED BOOKINGS</small>
                    <h3 style="margin:9px 0 5px;color:#1e293b;font-size:23px;">${reqs ? reqs.filter(r => r.status === 'approved').length : 0}</h3>
                    <small style="color:#16a34a;font-weight:800;">Approved requests</small>
                </div>
                <div style="background:linear-gradient(135deg,#ffffff,#faf5ff); padding:22px; border-radius:16px; border:1px solid #e9d5ff; box-shadow:0 8px 24px rgba(15,23,42,.06);">
                    <small style="color:#64748b; font-weight:900;">APPROVED REQUEST VALUE</small>
                    <h3 style="margin:9px 0 5px;color:#1e293b;font-size:23px;">₹${totalEarnings.toLocaleString('en-IN')}</h3>
                    <small style="color:#7c3aed;font-weight:800;">Based on approved hotel requests</small>
                </div>
            </div>`;

    } 

    // TAB 2: PROPERTY & ROOM MANAGEMENT
    else if (tabName === 'property') {
        const { data: rooms } = hotel ? await client.from('rooms').select('*').eq('hotel_id', hotel.hotel_id) : { data: [] };

        const optionsHtml = PERMITTED_HOTEL_LOCATIONS.map(loc => 
            `<option value="${loc}" ${hotel && hotel.city === loc ? 'selected' : ''}>${loc}</option>`
        ).join('');

        content.innerHTML = `
            <h2>Property & Room Inventory Setup</h2>
            <div style="background:white; padding:25px; border-radius:15px; margin-top:20px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <h3>Hotel Details</h3>
                <form id="hotel-profile-form" onsubmit="saveHotelProfile(event, '${hotel ? hotel.hotel_id : ''}')" style="display:grid; gap:15px; margin-top:15px;">
                    <div>
                        <label style="font-size:13px; font-weight:bold;">Hotel Name</label>
                        <input type="text" id="h-name" value="${hotel ? hotel.hotel_name : ''}" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px; margin-top:5px;">
                    </div>
                    <div>
                        <label style="font-size:13px; font-weight:bold;">Location City (Restricted to Permitted 11 Cities)</label>
                        <select id="h-city" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px; margin-top:5px;">
                            ${optionsHtml}
                        </select>
                    </div>
                    <div>
                        <label style="font-size:13px; font-weight:bold;">Property Street Address</label>
                        <input type="text" id="h-address" value="${hotel ? hotel.address : ''}" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px; margin-top:5px;">
                    </div>
                    <div>
                        <label style="font-size:13px; font-weight:bold;">Upload Front Cover Pictures (Supabase Storage: hotel-media)</label>
                        <input type="file" id="h-images" multiple accept="image/*" style="width:100%; margin-top:5px;">
                    </div>
                    <button type="submit" style="background:#2ecc71; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; width:200px;">Save Property Information</button>
                </form>
            </div>

            ${hotel ? `
            <div style="background:white; padding:25px; border-radius:15px; margin-top:30px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h3 style="margin:0;">Room Categories & Inventory Counter</h3>
                        <p style="font-size:12px; color:#666; margin-top:40px;">Real-time stock edits reflect instantly across all customer devices.</p>
                    </div>
                    <button onclick="showRoomForm('${hotel.hotel_id}')" style="background:#ff9f43; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;">+ Add Room Category</button>
                </div>
                <div id="room-list" style="display:grid; gap:15px; margin-top:20px;">
                    ${rooms.map(r => `
                        <div style="border:1px solid #eee; padding:15px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; background:#fafafa;">
                            <div>
                                <h4 style="margin:0; font-size:16px;">${r.room_type}</h4>
                                <small style="color:#666;">Price: ₹${r.specific_price} / night</small>
                            </div>
                            <div style="display:flex; align-items:center; gap:15px;">
                                <div style="text-align:right;">
                                    <small style="display:block; font-weight:bold; color:#555;">Available Stock</small>
                                    <input type="number" value="${r.available_rooms}" min="0" max="${r.total_rooms}" 
                                           onchange="updateRoomStockOptimistic('${r.room_id}', this.value)" 
                                           style="width:70px; padding:6px; border:2px solid #3498db; border-radius:6px; font-weight:bold; text-align:center;">
                                    <span style="font-size:12px; color:#888;">/ ${r.total_rooms}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>` : ''}`;
    } 

    // TAB 3: DUAL REQUEST INBOX
    else if (tabName === 'inbox') {
        const { data: reqs } = await client.from('hotel_requests').select('*, rooms(room_type)').eq('hotel_id', hotel.hotel_id).order('created_at', { ascending: false });

        content.innerHTML = `
            <h2>Dual Request Booking Inbox</h2>
            <div id="requests-container" style="display:grid; gap:20px; margin-top:20px;">
                ${(reqs || []).length === 0 ? '<p style="color:#666;">No booking quotes received yet.</p>' : ''}
                ${(reqs || []).map(req => {
                    const isAgency = req.requester_type === 'agency';
                    return `
                        <div style="background:white; padding:20px; border-radius:12px; border-left:6px solid ${isAgency ? '#3498db' : '#2ecc71'}; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <div>
                                    <span style="background:${isAgency ? '#ebf5fb' : '#e8f8f5'}; color:${isAgency ? '#2980b9' : '#27ae60'}; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:bold; letter-spacing:0.5px;">
                                        ${req.requester_type.toUpperCase()} REQUEST
                                    </span>
                                    <h3 style="margin:10px 0 0 0; color:#2c3e50;">${req.rooms?.room_type || 'Room Package Request'}</h3>
                                </div>
                                <div style="text-align:right;">
                                    <h3 style="margin:0; color:#2ecc71;">₹${req.total_amount}</h3>
                                    <span style="display:inline-block; margin-top:4px; padding:3px 8px; border-radius:4px; font-size:11px; font-weight:bold; background:#eee; color:#555;">
                                        ${req.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div style="margin:15px 0; font-size:13px; color:#555; display:flex; gap:20px;">
                                <span>📅 Check-in: <b>${req.check_in}</b> to <b>${req.check_out}</b></span>
                                <span>🚪 Quantity: <b>${req.quantity} Room(s)</b></span>
                            </div>
                            ${req.status === 'pending' ? `
                                <div style="display:flex; gap:10px; margin-top:15px;">
                                    <button onclick="handleHotelRequestAction('${req.request_id}', 'approve')" style="background:#2ecc71; color:white; border:none; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold;">Accept Request</button>
                                    <button onclick="handleHotelRequestAction('${req.request_id}', 'deny')" style="background:#e74c3c; color:white; border:none; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold;">Deny Request</button>
                                </div>
                            ` : ''}
                            ${req.status === 'approved' ? `
                                <div style="background:#f0fff4; padding:10px; border-radius:6px; font-size:12px; color:#27ae60; margin-top:10px;">
                                    <strong>Shared Payment Instructions:</strong> ${req.payment_details || 'N/A'}
                                </div>
                            ` : ''}
                        </div>`;
                }).join('')}
            </div>`;
    }

    // TAB 4: ARRIVALS & PAYOUTS — paid customer hotel bookings only
    else if (tabName === 'arrivals-payouts') {
        const { data: paidBookings, error: paidError } = await client
            .from('hotel_bookings')
            .select('id, created_at, hotel_name, room_type, location, check_in_date, check_out_date, rooms_booked, price_per_night, subtotal_amount, gateway_fee, service_fee, total_amount, total_nights, booking_status, payment_status, customer_email, customer_phone, approved_at, room_category_id, room_categories!inner(hotel_id)')
            .eq('room_categories.hotel_id', hotel.hotel_id)
            .eq('payment_status', 'paid')
            .order('check_in_date', { ascending: true })
            .order('created_at', { ascending: false });

        if (paidError) {
            content.innerHTML = `
                <div style="background:#fff1f2;border:1px solid #fecdd3;padding:22px;border-radius:15px;color:#9f1239;">
                    <h3 style="margin-top:0;">Unable to load Arrivals & Payouts</h3>
                    <p style="margin-bottom:0;">${paidError.message}</p>
                </div>`;
            return;
        }

        const rows = paidBookings || [];
        const totalCollected = rows.reduce((sum, booking) => sum + (Number(booking.total_amount) || 0), 0);
        const totalServiceFee = rows.reduce((sum, booking) => sum + (Number(booking.service_fee) || 0), 0);
        const totalGatewayFee = rows.reduce((sum, booking) => sum + (Number(booking.gateway_fee) || 0), 0);
        const totalRoomNights = rows.reduce((sum, booking) => {
            const roomsBooked = Number(booking.rooms_booked) || 0;
            const nights = Number(booking.total_nights) || Math.max(1, Math.round((new Date(booking.check_out_date) - new Date(booking.check_in_date)) / 86400000));
            return sum + (roomsBooked * nights);
        }, 0);

        content.innerHTML = `
            <div id="hotel-arrivals-payouts-view"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:18px;flex-wrap:wrap;margin-bottom:22px;">
                <div>
                    <div style="font-size:12px;font-weight:900;letter-spacing:.08em;color:#ff9f43;">OPERATIONS & FINANCE</div>
                    <h2 style="margin:5px 0;color:#1e293b;font-size:28px;">📋 Arrivals & Payouts</h2>
                    <p style="margin:0;color:#64748b;font-size:14px;">Customer se successfully received <b>paid</b> hotel bookings yahan show honge.</p>
                </div>
                <button onclick="switchHotelTab('arrivals-payouts')" style="border:1px solid #e2e8f0;background:#fff;color:#334155;padding:10px 15px;border-radius:10px;font-weight:800;cursor:pointer;">↻ Refresh</button>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin-bottom:22px;">
                <div style="background:#fff;padding:20px;border-radius:15px;border:1px solid #dcfce7;box-shadow:0 7px 22px rgba(15,23,42,.05);">
                    <small style="color:#64748b;font-weight:900;">CUSTOMER PAYMENTS RECEIVED</small>
                    <div style="font-size:27px;font-weight:900;color:#15803d;margin-top:8px;">₹${totalCollected.toLocaleString('en-IN')}</div>
                    <div style="font-size:12px;color:#64748b;margin-top:4px;">${rows.length} paid booking(s)</div>
                </div>
                <div style="background:#fff;padding:20px;border-radius:15px;border:1px solid #dbeafe;box-shadow:0 7px 22px rgba(15,23,42,.05);">
                    <small style="color:#64748b;font-weight:900;">UPCOMING PAID ARRIVALS</small>
                    <div style="font-size:27px;font-weight:900;color:#1d4ed8;margin-top:8px;">${rows.filter(b => b.check_in_date && new Date(b.check_in_date + 'T00:00:00') >= new Date(new Date().toDateString())).length}</div>
                    <div style="font-size:12px;color:#64748b;margin-top:4px;">Based on paid bookings</div>
                </div>
                <div style="background:#fff;padding:20px;border-radius:15px;border:1px solid #ffedd5;box-shadow:0 7px 22px rgba(15,23,42,.05);">
                    <small style="color:#64748b;font-weight:900;">ROOM NIGHTS SOLD</small>
                    <div style="font-size:27px;font-weight:900;color:#c2410c;margin-top:8px;">${totalRoomNights}</div>
                    <div style="font-size:12px;color:#64748b;margin-top:4px;">From paid bookings</div>
                </div>
                <div style="background:#fff;padding:20px;border-radius:15px;border:1px solid #e9d5ff;box-shadow:0 7px 22px rgba(15,23,42,.05);">
                    <small style="color:#64748b;font-weight:900;">FEES INCLUDED IN PAYMENT</small>
                    <div style="font-size:19px;font-weight:900;color:#6d28d9;margin-top:10px;">₹${(totalServiceFee + totalGatewayFee).toLocaleString('en-IN')}</div>
                    <div style="font-size:12px;color:#64748b;margin-top:4px;">Service + gateway fee</div>
                </div>
            </div>

            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:auto;box-shadow:0 8px 24px rgba(15,23,42,.05);">
                <div style="padding:18px 20px;border-bottom:1px solid #eef2f7;display:flex;justify-content:space-between;align-items:center;">
                    <div><h3 style="margin:0;color:#1e293b;">Paid Customer Bookings</h3><small style="color:#64748b;">Only records with payment_status = paid are shown.</small></div>
                    <span style="background:#dcfce7;color:#166534;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:900;">PAID</span>
                </div>
                ${rows.length ? `
                <table style="width:100%;border-collapse:collapse;min-width:900px;">
                    <thead>
                        <tr style="background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;">
                            <th style="padding:13px;text-align:left;">Guest</th>
                            <th style="padding:13px;text-align:left;">Room</th>
                            <th style="padding:13px;text-align:left;">Arrival</th>
                            <th style="padding:13px;text-align:left;">Departure</th>
                            <th style="padding:13px;text-align:left;">Rooms</th>
                            <th style="padding:13px;text-align:right;">Customer Paid</th>
                            <th style="padding:13px;text-align:center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(booking => `
                            <tr style="border-top:1px solid #f1f5f9;">
                                <td style="padding:14px;">
                                    <div style="font-weight:800;color:#1e293b;">${booking.customer_email || 'Customer'}</div>
                                    <div style="font-size:11px;color:#64748b;">${booking.customer_phone || ''}</div>
                                </td>
                                <td style="padding:14px;color:#334155;">
                                    <div style="font-weight:800;">${booking.room_type || 'Room'}</div>
                                    <div style="font-size:11px;color:#64748b;">${booking.hotel_name || hotel.hotel_name}</div>
                                </td>
                                <td style="padding:14px;color:#1d4ed8;font-weight:800;">${booking.check_in_date || '—'}</td>
                                <td style="padding:14px;color:#475569;">${booking.check_out_date || '—'}</td>
                                <td style="padding:14px;text-align:center;font-weight:800;">${booking.rooms_booked || 0}</td>
                                <td style="padding:14px;text-align:right;font-weight:900;color:#15803d;">₹${Number(booking.total_amount || 0).toLocaleString('en-IN')}</td>
                                <td style="padding:14px;text-align:center;"><span style="background:#dcfce7;color:#166534;padding:5px 9px;border-radius:999px;font-size:10px;font-weight:900;">PAID</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>` : `
                    <div style="padding:48px 20px;text-align:center;color:#64748b;">
                        <div style="font-size:42px;margin-bottom:10px;">💳</div>
                        <h3 style="margin:0 0 7px;color:#334155;">No paid customer bookings yet</h3>
                        <p style="margin:0;font-size:13px;">Jab customer ka hotel payment successfully <b>paid</b> mark hoga, woh yahan automatically show hoga.</p>
                    </div>`}
            </div>

            <div style="margin-top:14px;padding:13px 15px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;color:#92400e;font-size:12px;line-height:1.5;">
                <b>Note:</b> “Customer Payments Received” yahan <b>payment_status = paid</b> bookings ka gross <code>total_amount</code> hai. Actual bank payout/settlement status alag payment gateway/payout workflow par depend karega.
            </div>
        `;
    }
}

/* ==========================================================================
   REALTIME INVENTORY & SUBSCRIPTIONS
   ========================================================================== */
function initHotelRealtimeSubscriptions(userId) {
    const client = getClient();
    if (!client) return;

    // Window object use karein - No redeclaration error!
    if (window.hotelRealtimeChannel) {
        client.removeChannel(window.hotelRealtimeChannel);
    }

    window.hotelRealtimeChannel = client.channel('hotel-inventory-sync')
               .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'hotel_bookings'
            },
            payload => {

                console.log(
                    '⚡ Hotel Booking Workflow Update:',
                    payload
                );

                if (
                    document.getElementById('hotel-main-content')
                ) {

                    const activeTab =
                        document.querySelector('.hotel-nav-btn[style*="background"]');

                    /*
                     * Only refresh the Arrivals & Payout area
                     * when the hotel owner is viewing bookings.
                     */
                    const container = document.getElementById('hotel-main-content');

                    // Refresh the Arrivals & Payouts view only when it is open.
                    if (container && document.getElementById('hotel-arrivals-payouts-view')) {
                        switchHotelTab('arrivals-payouts');
                    }
                }
            }
        )
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hotel_requests' }, payload => {
            console.log('⚡ Incoming Booking Request Triggered:', payload);
            if (document.getElementById('hotel-main-content')) {
                switchHotelTab('inbox');
            }
        })
        .subscribe();
}

/**
 * Optimistic UI Updates for Instant Stock Manipulation
 */
window.updateRoomStockOptimistic = async function(roomId, newCount) {
    const client = getClient();
    try {
        const countInt = parseInt(newCount);
        if (isNaN(countInt) || countInt < 0) return;

        // Optimistic mutation call
        const { error } = await client.from('rooms').update({ available_rooms: countInt }).eq('room_id', roomId);
        if (error) throw error;

        console.log(`Inventory successfully synced for room: ${roomId}`);
    } catch (err) {
        alert("Stock update failed: " + err.message);
        switchHotelTab('property'); // Revert UI on failure
    }
};

/* ==========================================================================
   ACTION HANDLERS & MODAL WORKFLOWS
   ========================================================================== */
window.handleHotelRequestAction = function(requestId, action) {
    const modal = document.getElementById('hotel-action-modal');
    const box = document.getElementById('hotel-modal-box');

    if (action === 'approve') {
        box.innerHTML = `
            <h3 style="margin-top:0; color:#2c3e50;">Set Payment Instructions</h3>
            <p style="font-size:13px; color:#666;">Provide UPI details (PhonePe/GPay) or Bank Transfer details for the requester to complete the payment.</p>
            <textarea id="h-pay-details" placeholder="e.g., GPay / PhonePe UPI ID: hotelpay@upi or Bank Account details..." style="width:100%; height:90px; padding:10px; border:1px solid #ccc; border-radius:8px; margin:15px 0; box-sizing:border-box;"></textarea>
            <div style="display:flex; gap:10px;">
                <button onclick="executeRequestStatusUpdate('${requestId}', 'approved')" style="background:#2ecc71; color:white; border:none; padding:10px; border-radius:8px; flex:1; font-weight:bold; cursor:pointer;">Confirm Approval</button>
                <button onclick="document.getElementById('hotel-action-modal').style.display='none'" style="background:#eee; border:none; padding:10px; border-radius:8px; flex:1; font-weight:bold; cursor:pointer;">Cancel</button>
            </div>
        `;
    } else {
        box.innerHTML = `
            <h3 style="margin-top:0; color:#e74c3c;">Decline Request</h3>
            <p style="font-size:13px; color:#666;">Provide a reason for declining this room booking request.</p>
            <textarea id="h-cancel-reason" placeholder="Reason for decline (e.g. Sold out, Under maintenance)..." style="width:100%; height:90px; padding:10px; border:1px solid #ccc; border-radius:8px; margin:15px 0; box-sizing:border-box;"></textarea>
            <div style="display:flex; gap:10px;">
                <button onclick="executeRequestStatusUpdate('${requestId}', 'denied')" style="background:#e74c3c; color:white; border:none; padding:10px; border-radius:8px; flex:1; font-weight:bold; cursor:pointer;">Confirm Decline</button>
                <button onclick="document.getElementById('hotel-action-modal').style.display='none'" style="background:#eee; border:none; padding:10px; border-radius:8px; flex:1; font-weight:bold; cursor:pointer;">Cancel</button>
            </div>
        `;
    }
    modal.style.display = 'flex';
};

window.executeRequestStatusUpdate = async function(requestId, newStatus) {
    const client = getClient();
    const payload = { status: newStatus };

    if (newStatus === 'approved') {
        payload.payment_details = document.getElementById('h-pay-details').value;
    } else {
        payload.cancellation_reason = document.getElementById('h-cancel-reason').value;
    }

    const { error } = await client.from('hotel_requests').update(payload).eq('request_id', requestId);
    
    if (!error) {
        document.getElementById('hotel-action-modal').style.display = 'none';
        switchHotelTab('inbox');
        
        // Trigger OneSignal Push Notification Event
        triggerOneSignalPush(requestId, newStatus);
    } else {
        alert("Action Error: " + error.message);
    }
};

/* ==========================================================================
   ONESIGNAL PUSH NOTIFICATIONS TRIGGER
   ========================================================================== */
function triggerOneSignalPush(requestId, status) {
    if (window.OneSignal) {
        window.OneSignal.push(function() {
            console.log(`[OneSignal] Notification triggered for Request ID: ${requestId} | Status: ${status}`);
            // Push Notification Dispatch Logic via REST API or Notification Edge Function
        });
    }
}
/* =========================================
   10. SECURE NOTIFICATION SYSTEM (Cloudflare Bridge)
   ========================================= */

async function sendPushNotification(targetUserId, messageTitle, messageBody) {
    try {
        // This calls the private function folder you created in GitHub
        const response = await fetch("/send-notif", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                targetUserId,
                messageTitle,
                messageBody
            })
        });
        
        const result = await response.json();
        
        // This confirms if the Cloudflare function successfully talked to OneSignal
        console.log("Secure Notification Status:", result);
        
        return result;
    } catch (error) {
        // This will trigger if the Cloudflare function is missing or the network fails
        console.error("Error sending secure notification:", error);
    }
}

/* =========================================
   10. PACKAGE FORM & HELPER LOGIC
   ========================================= */

// Populates the City dropdown based on selected State
window.updateCities = function() {
    const stateSelect = document.getElementById('p-state');
    const citySelect = document.getElementById('p-city');
    if (!stateSelect || citySelect === null) return;

    const selectedState = stateSelect.value;
    citySelect.innerHTML = '<option value="">Select City</option>';

    if (selectedState && locationData[selectedState]) {
        locationData[selectedState].forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.innerText = city;
            citySelect.appendChild(opt);
        });
    }
};


// =========================================
// RENDER FORM: Shows the Create/Edit UI
// =========================================
window.showPackageForm = function(pEncoded = null) {
    let pkg = null;

    try {
        pkg = pEncoded ? JSON.parse(decodeURIComponent(pEncoded)) : null;
    } catch (e) {
        console.error("Decoding error:", e);
    }

    const isEdit = (pkg && pkg.id);
    const area = document.getElementById('main-content');

    if (!area) return;

    const pkgDestinations = isEdit
        ? (pkg.destinations || pkg.destination || [])
        : [];

    const pkgVehicles = isEdit
        ? (pkg.vehicles || [])
        : [];


    // --- ROBUST PARSING FOR DESTINATIONS ARRAY ---
    let activeDests = [];

    if (typeof pkgDestinations === 'string') {
        try {
            activeDests = JSON.parse(pkgDestinations);
        } catch(e) {
            activeDests = pkgDestinations
                .split(',')
                .map(d => d.trim());
        }
    } else if (Array.isArray(pkgDestinations)) {
        activeDests = pkgDestinations;
    } else {
        activeDests = [pkgDestinations];
    }


    // =========================================
    // FIND SELECTED STATE DURING EDIT
    // =========================================
    let selectedState = "";

    if (isEdit && pkg.starting_location) {
        for (let s in locationData) {
            if (locationData[s].includes(pkg.starting_location)) {
                selectedState = s;
                break;
            }
        }
    }


    // =========================================
    // STATE OPTIONS
    // =========================================
    const stateOptions = Object.keys(locationData).map(s =>
        `<option value="${s}" ${selectedState === s ? 'selected' : ''}>${s}</option>`
    ).join('');


    // =========================================
    // DESTINATION CHECKBOXES
    // =========================================
    const destHtml = tourDestinations.map(d => `
        <label style="
            display:flex;
            align-items:center;
            gap:5px;
            padding:5px 10px;
            background:white;
            border-radius:5px;
            border:1px solid #ddd;
            font-size:13px;
            cursor:pointer;
        ">
            <input
                type="checkbox"
                class="d-check"
                value="${d}"
                ${activeDests.includes(d) ? 'checked' : ''}
            >
            ${d}
        </label>
    `).join('');


    // =========================================
    // VEHICLE PRICING
    // =========================================
    const vehicleHtml = vehicleTypes.map(v => {

        const existing = pkgVehicles.find(ev => ev.id === v.id);

        return `
        <div style="
            display:flex;
            align-items:center;
            gap:10px;
            background:#fff8f0;
            padding:10px;
            border-radius:10px;
            border:1px solid #ffeaa7;
            margin-bottom:8px;
        ">

            <input
                type="checkbox"
                class="v-enable"
                data-id="${v.id}"
                ${existing ? 'checked' : ''}
            >

            <span style="font-size:20px;">
                ${v.icon || '🚗'}
            </span>

            <b style="flex:1;">
                ${v.name}
            </b>

            <input
                type="number"
                class="v-rate"
                data-id="${v.id}"
                placeholder="Rate"
                style="width:80px; padding:5px;"
                value="${existing ? existing.rate : ''}"
            >

            <input
                type="number"
                class="v-max"
                data-id="${v.id}"
                placeholder="Max"
                style="width:60px; padding:5px;"
                value="${existing ? existing.max_cars : '1'}"
            >

        </div>`;
    }).join('');


    // =========================================
    // TOUR DURATION VALUE
    // =========================================
    const existingTourDays = isEdit
        ? (pkg.tour_days || '')
        : '';


    // =========================================
    // BUILD COMPLETE PACKAGE FORM
    // =========================================
    area.innerHTML = `
        <div
            class="card"
            style="
                background:white;
                padding:30px;
                border:1px solid #ff9f43;
                border-radius:12px;
                max-width:800px;
                margin:auto;
                box-shadow:0 10px 25px rgba(0,0,0,0.1);
            "
        >

            <h3 style="
                color:#ff9f43;
                margin-top:0;
                margin-bottom:25px;
            ">
                ${isEdit ? '✏️ Edit Package' : '🚀 Create New Package'}
            </h3>


            <!-- PACKAGE BASIC INFORMATION -->
            <div style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:15px;
                margin-bottom:15px;
            ">

                <!-- PACKAGE TITLE -->
                <div>
                    <label style="
                        font-size:11px;
                        font-weight:bold;
                        color:#666;
                        display:block;
                        margin-bottom:5px;
                    ">
                        PACKAGE TITLE
                    </label>

                    <input
                        type="text"
                        id="p-title"
                        placeholder="e.g. 5 Days Kedarnath Trip"
                        value="${isEdit ? (pkg.title || '') : ''}"
                        style="
                            width:100%;
                            padding:10px;
                            border:1px solid #ccc;
                            border-radius:6px;
                            box-sizing:border-box;
                        "
                    >
                </div>


                <!-- PICKUP STATE -->
                <div>
                    <label style="
                        font-size:11px;
                        font-weight:bold;
                        color:#666;
                        display:block;
                        margin-bottom:5px;
                    ">
                        PICKUP STATE
                    </label>

                    <select
                        id="p-state"
                        onchange="window.updateCities()"
                        style="
                            width:100%;
                            padding:10px;
                            border:1px solid #ccc;
                            border-radius:6px;
                            box-sizing:border-box;
                            background:white;
                        "
                    >
                        <option value="">
                            Select State
                        </option>

                        ${stateOptions}
                    </select>
                </div>

            </div>


            <!-- TOUR DURATION -->
            <div style="
                margin-bottom:15px;
                max-width:50%;
            ">

                <label style="
                    font-size:11px;
                    font-weight:bold;
                    color:#666;
                    display:block;
                    margin-bottom:5px;
                ">
                    TOUR DURATION
                </label>

                <div style="
                    position:relative;
                    display:flex;
                    align-items:center;
                ">

                    <input
                        type="number"
                        id="p-tour-days"
                        min="1"
                        max="365"
                        step="1"
                        inputmode="numeric"
                        placeholder="e.g. 5"
                        value="${existingTourDays}"
                        style="
                            width:100%;
                            padding:10px 70px 10px 10px;
                            border:1px solid #ccc;
                            border-radius:6px;
                            box-sizing:border-box;
                            font-size:14px;
                        "
                    >

                    <span style="
                        position:absolute;
                        right:12px;
                        color:#777;
                        font-size:13px;
                        pointer-events:none;
                    ">
                        Days
                    </span>

                </div>

                <small style="
                    display:block;
                    margin-top:5px;
                    color:#888;
                    font-size:11px;
                ">
                    Enter the total number of days for this tour package.
                </small>

            </div>


            <!-- STARTING CITY -->
            <label style="
                font-size:11px;
                font-weight:bold;
                color:#666;
                display:block;
                margin-bottom:5px;
            ">
                STARTING CITY
            </label>

            <select
                id="p-city"
                style="
                    width:100%;
                    padding:10px;
                    border:1px solid #ccc;
                    border-radius:6px;
                    margin-bottom:20px;
                    background:white;
                    box-sizing:border-box;
                "
            >
                ${
                    isEdit && selectedState
                        ? locationData[selectedState]
                            .map(c =>
                                `<option
                                    value="${c}"
                                    ${pkg.starting_location === c ? 'selected' : ''}
                                >
                                    ${c}
                                </option>`
                            )
                            .join('')
                        : '<option value="">Select City</option>'
                }
            </select>


            <!-- DESTINATIONS -->
            <p style="
                margin-bottom:8px;
            ">
                <b>Destinations:</b>
            </p>

            <div style="
                background:#f9f9f9;
                padding:15px;
                border-radius:10px;
                max-height:150px;
                overflow-y:auto;
                display:flex;
                flex-wrap:wrap;
                gap:8px;
                border:1px solid #eee;
                margin-bottom:20px;
            ">
                ${destHtml}
            </div>


            <!-- VEHICLE PRICING -->
            <p style="
                margin-bottom:8px;
            ">
                <b>Vehicle Pricing:</b>
            </p>

            <div style="
                margin-bottom:20px;
            ">
                ${vehicleHtml}
            </div>



            <!-- CUSTOMER PICKUP DISTANCE PRICING -->
            <div style="margin:0 0 20px; padding:15px; background:#fff8f0; border:1px solid #ffeaa7; border-radius:10px;">
                <label style="font-size:11px; font-weight:bold; color:#666; display:block; margin-bottom:6px;">
                    CUSTOMER PICKUP DISTANCE CHARGE
                </label>
                <div style="position:relative; max-width:320px;">
                    <input type="number" id="p-pickup-km-rate" min="0" step="0.01" inputmode="decimal"
                        placeholder="e.g. 20"
                        value="${isEdit ? (Number(pkg.pickup_km_rate) || 0) : ''}"
                        style="width:100%; padding:10px 65px 10px 10px; border:1px solid #ccc; border-radius:6px; box-sizing:border-box; font-size:14px;">
                    <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#777; font-size:13px; pointer-events:none;">₹ / km</span>
                </div>
                <small style="display:block; margin-top:7px; color:#777; font-size:11px; line-height:1.5;">
                    Enter only the amount you charge per kilometer.
                    <br>
                    <b>Note:</b> We will calculate the distance from your package starting location to the customer's pickup location and automatically add the distance charge to the package booking price.
                </small>
            </div>


            <!-- ITINERARY DETAILS -->
            <label style="
                font-size:11px;
                font-weight:bold;
                color:#666;
                display:block;
                margin-bottom:5px;
            ">
                ITINERARY DETAILS
            </label>

            <textarea
                id="p-desc"
                style="
                    height:120px;
                    width:100%;
                    padding:10px;
                    border:1px solid #ccc;
                    border-radius:6px;
                    box-sizing:border-box;
                    resize:vertical;
                "
                placeholder="Describe the trip day-by-day..."
            >${isEdit ? (pkg.description || '') : ''}</textarea>


            <!-- ACTION BUTTONS -->
            <div style="
                display:flex;
                gap:10px;
                margin-top:25px;
            ">

                <button
                    id="save-btn"
                    onclick="window.processSave('${isEdit ? pkg.id : ''}')"
                    style="
                        background:#2ecc71;
                        color:white;
                        flex:2;
                        height:50px;
                        font-weight:bold;
                        border:none;
                        border-radius:8px;
                        cursor:pointer;
                    "
                >
                    ${isEdit ? 'SAVE CHANGES' : 'PUBLISH PACKAGE'}
                </button>


                ${
                    isEdit
                    ? `
                    <button
                        onclick="if(confirm('Are you sure you want to delete this package?')) window.deletePackage('${pkg.id}')"
                        style="
                            background:#e74c3c;
                            color:white;
                            flex:1;
                            border:none;
                            border-radius:8px;
                            cursor:pointer;
                            font-weight:bold;
                        "
                    >
                        🗑️ Delete
                    </button>
                    `
                    : ''
                }


                <button
                    onclick="window.showTab('packages')"
                    style="
                        background:#eee;
                        flex:1;
                        border:none;
                        border-radius:8px;
                        cursor:pointer;
                    "
                >
                    Cancel
                </button>

            </div>

        </div>
    `;
};


// =========================================
// PROCESS SAVE
// Collects form data and updates/inserts
// into Supabase 'packages' table
// =========================================
window.processSave = async function(packageId = '') {
    const saveBtn = document.getElementById('save-btn');

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText = "Saving...";
    }

    try {
        const title = document.getElementById('p-title').value.trim();
        const city = document.getElementById('p-city').value;
        const desc = document.getElementById('p-desc').value.trim();
        const tourDaysInput = document.getElementById('p-tour-days');
        const tourDays = tourDaysInput ? parseInt(tourDaysInput.value, 10) : NaN;

        if (!title || !city) {
            alert("Please fill Package Title and Starting City.");
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerText = packageId ? 'SAVE CHANGES' : 'PUBLISH PACKAGE';
            }
            return;
        }

        if (!Number.isInteger(tourDays) || tourDays < 1 || tourDays > 365) {
            alert("Please enter a valid Tour Duration between 1 and 365 days.");
            if (tourDaysInput) tourDaysInput.focus();
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerText = packageId ? 'SAVE CHANGES' : 'PUBLISH PACKAGE';
            }
            return;
        }

        const pickupRateInput = document.getElementById('p-pickup-km-rate');
        const pickupKmRate = pickupRateInput && pickupRateInput.value !== ''
            ? parseFloat(pickupRateInput.value)
            : 0;

        if (!Number.isFinite(pickupKmRate) || pickupKmRate < 0) {
            alert("Please enter a valid pickup distance rate (₹/km).");
            if (pickupRateInput) pickupRateInput.focus();
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerText = packageId ? 'SAVE CHANGES' : 'PUBLISH PACKAGE';
            }
            return;
        }

        const selectedDests = [];
        document.querySelectorAll('.d-check:checked').forEach(cb => {
            selectedDests.push(cb.value);
        });

        if (selectedDests.length === 0) {
            alert("Please select at least one destination.");
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerText = packageId ? 'SAVE CHANGES' : 'PUBLISH PACKAGE';
            }
            return;
        }

        const vehicles = [];
        document.querySelectorAll('.v-enable:checked').forEach(cb => {
            const vid = cb.getAttribute('data-id');
            const rateInput = document.querySelector(`.v-rate[data-id="${vid}"]`);
            const maxInput = document.querySelector(`.v-max[data-id="${vid}"]`);

            vehicles.push({
                id: vid,
                rate: parseFloat(rateInput?.value) || 0,
                max_cars: parseInt(maxInput?.value, 10) || 1
            });
        });

        // Use the same Supabase Auth session used by the rest of TourSetu.
        const client = getClient();

        if (!client) {
            throw new Error("Supabase client is not available. Please refresh and login again.");
        }

        const { data: { user }, error: authError } =
            await client.auth.getUser();

        if (authError) {
            console.error("Auth error while saving package:", authError);
            throw new Error("Your login session could not be verified. Please login again.");
        }

        if (!user) {
            throw new Error("Your login session has expired. Please login again.");
        }

        const role = user.user_metadata?.role || '';
        if (role !== 'agency') {
            throw new Error("Only an agency account can create or edit packages.");
        }

        const payload = {
            title,
            tour_days: tourDays,
            starting_location: city,

            // Use the existing packages.destination column.
            // The database does not have a "destinations" column.
            destination: selectedDests,

            vehicles,
            description: desc,
            agency_id: user.id,

            // CUSTOMER PICKUP DISTANCE PRICING
            pickup_km_rate: Number(pickupKmRate.toFixed(2))
        };

        let resultError = null;

        if (packageId) {
            const { error } = await _supabase
                .from('packages')
                .update(payload)
                .eq('id', packageId);

            resultError = error;
        } else {
            const { error } = await _supabase
                .from('packages')
                .insert([payload]);

            resultError = error;
        }

        if (resultError) {
            throw resultError;
        }

        alert(
            packageId
                ? "Package updated successfully!"
                : "Package published successfully!"
        );

        window.showTab('packages');

    } catch (err) {
        console.error("Save Error:", err);
        alert("Error saving package: " + err.message);
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerText = packageId
                ? 'SAVE CHANGES'
                : 'PUBLISH PACKAGE';
        }
    }
};

/* =========================================
   12. BOOKING RENDER LOGIC
   =========================================
 RENDER LOGIC (ENHANCED WITH DATE)
   ========================================= */
window.renderAgencyBookings = function(bookings) {
    const container = document.getElementById('main-content');
    if (!container) return;

    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <h3>Booking Requests</h3>
            <div style="text-align:center; padding:50px; color:#666; background:white; border-radius:12px; border:1px solid #ddd;">
                <p>No New or Old Booking Requests Found.</p>
                <p style="font-size:11px; color:#999;">Database column: <b>agency_id</b></p>
            </div>`;
        return;
    }

    const html = bookings.map(b => {
        const isCancelled = b.status === 'cancelled';
        const isApprovedOrConfirmed = b.status === 'confirmed' || b.status === 'approved';
        const statusColor = isCancelled ? '#e74c3c' : (isApprovedOrConfirmed ? '#2ecc71' : '#f39c12');
        
        // Formatting the date to be more readable (e.g., "15 April 2026")
        const travelDate = b.travel_date ? new Date(b.travel_date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        }) : 'Not Selected';

        const policyTag = b.constant_9_percent_policy ? 
            `<div style="background:#d1f2eb; color:#16a085; padding:5px 12px; border-radius:20px; font-size:11px; font-weight:bold;">🛡️ 18% Policy Verified</div>` : 
            `<div style="background:#eee; color:#777; padding:5px 12px; border-radius:20px; font-size:11px;">Standard Policy</div>`;

        // Problem 1 Fix: Dynamically track quantities using precise database columns
        let trekkingDetailsHtml = '';
        
        // 1. Kedarnath Details Rendering
        if (b.keda_ghoda_qty > 0 || b.keda_dandi_qty > 0 || b.keda_kandi_qty > 0 || b.keda_pitthu_qty > 0) {
            trekkingDetailsHtml += `
                <div style="grid-column: span 2; background: #fffcf0; padding: 8px 12px; border-radius: 8px; border: 1px dashed #f39c12; margin-top: 5px;">
                    <span style="font-weight:bold; color:#e67e22;">🏔️ Trekking with Kedarnath:</span>
                    <span style="font-size:12px; color:#555; margin-left:5px;">
                        ${b.keda_ghoda_qty ? `🐴 Ghoda: ${b.keda_ghoda_qty}x ` : ''}
                        ${b.keda_dandi_qty ? `🪑 Dandi: ${b.keda_dandi_qty}x ` : ''}
                        ${b.keda_kandi_qty ? `🎒 Kandi: ${b.keda_kandi_qty}x ` : ''}
                        ${b.keda_pitthu_qty ? `👤 Pitthu: ${b.keda_pitthu_qty}x ` : ''}
                    </span>
                </div>`;
        }

        // 2. Vaishno Devi Details Rendering (Using exact vaishno_*_price columns)
        if (b.vaishno_ghoda_price > 0 || b.vaishno_dandi_price > 0 || b.vaishno_pitthu_price > 0) {
            trekkingDetailsHtml += `
                <div style="grid-column: span 2; background: #f0faff; padding: 8px 12px; border-radius: 8px; border: 1px dashed #2980b9; margin-top: 5px;">
                    <span style="font-weight:bold; color:#2980b9;">🏔️ Trekking with Vaishno Devi:</span>
                    <span style="font-size:12px; color:#555; margin-left:5px;">
                        ${b.vaishno_ghoda_price ? `🐴 Ghoda: ${b.vaishno_ghoda_price}x ` : ''}
                        ${b.vaishno_dandi_price ? `🪑 Dandi/Palki: ${b.vaishno_dandi_price}x ` : ''}
                        ${b.vaishno_pitthu_price ? `👤 Pitthu: ${b.vaishno_pitthu_price}x ` : ''}
                    </span>
                </div>`;
        }

        return `
        <div class="card" style="border-left: 6px solid ${statusColor}; margin-bottom:15px; background:white; padding:20px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.05); opacity: ${isCancelled ? '0.75' : '1'}">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <h4 style="margin:0 0 5px 0; color:#333;">${b.package_title || 'Package Booking'}</h4>
                    <p style="font-size:11px; color:#888; margin:0;">Request ID: ${b.id}</p>
                </div>
                ${policyTag}
            </div>
            
            <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
            
            <div style="background: #f0f7ff; padding: 10px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #d0e1f9; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">📅</span>
                <div>
                    <small style="color: #576574; font-weight: bold; display: block; font-size: 10px; text-transform: uppercase;">Tour Starting Date</small>
                    <span style="font-size: 16px; color: #2c3e50; font-weight: 800;">${travelDate}</span>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:13px; color:#444;">
                <div>👤 <b>Customer:</b> ${b.customer_email}</div>
                <div>📞 <b>Contact:</b> ${b.customer_phone}</div>
                <div>🚗 <b>Vehicle:</b> ${b.selected_vehicle || b.selected_vehicles || 'None'}</div>
                <div>💰 <b>Total:</b> ₹${b.total_price}</div>
                <div style="grid-column: span 2;">📍 <b>Pickup Address:</b> ${b.customer_address || 'N/A'}</div>
                ${trekkingDetailsHtml}
            </div>

            ${isCancelled ? `
                <div style="margin-top:15px; padding:12px; background:#fdedec; color:#c0392b; border-radius:8px; text-align:center; font-weight:bold; border: 1px solid #fadbd8;">
                    ⚠️ CANCELLATION: Customer has cancelled this request.
                </div>
            ` : (isApprovedOrConfirmed ? `
                <div style="margin-top:15px; padding:12px; background:#e8f8f5; color:#2ecc71; border-radius:8px; text-align:center; font-weight:bold; border: 1px solid #d1f2eb;">
                    ✅ APPROVED: This request is accepted and sent for customer payment.
                </div>
            ` : `
                <div style="margin-top:15px; display:flex; gap:10px;">
                    <button onclick="window.updateBookingStatus('${b.id}', 'approved')" style="background:#2ecc71; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; flex:1;">Accept Request</button>
                    <button onclick="window.updateBookingStatus('${b.id}', 'rejected')" style="background:#f4f4f4; color:#666; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; flex:1;">Decline</button>
                </div>
            `)}
        </div>`;
    }).join('');

    container.innerHTML = `<h3 style="color:#ff9f43; margin-bottom:20px;">Booking Requests</h3>` + html;
};

/* =========================================
   13. DATA FETCHING (MATCHING agency_id)
   ========================================= */
window.loadAgencyDashboard = async function() {
    const container = document.getElementById('main-content');
    if (container) container.innerHTML = `<p style="text-align:center; padding:20px;">🔄 Syncing bookings...</p>`;

    try {
        const client = getClient();
        const { data: { user } } = await client.auth.getUser();
        
        if (user) {
            const { data: bookings, error } = await client
                .from('bookings')
                .select('*')
                .eq('agency_id', user.id) // Corrected column name
                .order('created_at', { ascending: false });

            if (error) throw error;
            window.renderAgencyBookings(bookings || []);
        }
    } catch (err) {
        console.error("Fetch Error:", err);
        if (container) container.innerHTML = `<div style="color:red; padding:20px;">Load Error: ${err.message}</div>`;
    }
};
/* =========================================================================
   HOTEL PARTNER DASHBOARD & GROUND OPERATIONS SYSTEM
   ========================================================================= */

// Global State & Timers for Hotel Module
let activeQrScanner = null;
let realtimeSubscription = null;
let ackTimer = null;

/**
 * Main Entry Point for Hotel Partner Interface
 */
async function renderHotelDashboard(user) {
    const app = document.getElementById('app');
    app.style.maxWidth = "100%";
    window.mountDashboardUtilityMenu('hotel');

    app.innerHTML = `
        <div style="display:flex; min-height:100vh; background:#f4f6f9; font-family:'Inter', sans-serif; margin:-20px;">
            <!-- Hotel Sidebar Navigation -->
            <div style="width:280px; background:linear-gradient(180deg,#17212b 0%,#1e272e 55%,#202b35 100%); color:white; padding:25px 20px; flex-shrink:0; display:flex; flex-direction:column; justify-content:space-between; box-shadow:8px 0 30px rgba(15,23,42,.10);">
                <div>
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:30px;">
                        <span style="font-size:28px;">🏔️</span>
                        <div>
                            <h3 style="margin:0; color:#ff9f43; font-size:18px;">TourSetu Hotel</h3>
                            <small style="color:#a4b0be; font-size:11px;">Char Dham Ground Ops Desk</small>
                        </div>
                    </div>
                    
                    <nav style="display:flex; flex-direction:column; gap:8px;">
                        <div onclick="window.showHotelTab('overview')" class="hotel-nav-btn" id="nav-overview" style="padding:14px; cursor:pointer; border-radius:10px; background:#2c3e50; font-weight:600; display:flex; align-items:center; gap:10px;">
                            <span>📊</span> Dashboard
                        </div>
                        <div onclick="showHotelTab('inventory')" class="hotel-nav-btn" id="nav-inventory" style="padding:14px; cursor:pointer; border-radius:10px; font-weight:600; display:flex; align-items:center; gap:10px;">
                            <span>🏨</span> Room Inventory & Lock
                        </div>
                       <div
    onclick="openHotelBookingRequestSection()"
    class="hotel-nav-btn"
    id="nav-booking-request"
    style="
        padding:14px;
        cursor:pointer;
        border-radius:10px;
        font-weight:600;
        display:flex;
        align-items:center;
        gap:10px;
    "
>
    <span>📋</span> Booking Request
</div>
                        <div onclick="window.showHotelTab('bookings')" class="hotel-nav-btn" id="nav-bookings" style="padding:14px; cursor:pointer; border-radius:10px; font-weight:600; display:flex; align-items:center; gap:10px;">
                            <span>📋</span> Arrivals & Payouts
                        </div>
                        <div onclick="showHotelTab('landslide')" class="hotel-nav-btn" id="nav-landslide" style="padding:14px; cursor:pointer; border-radius:10px; font-weight:600; display:flex; align-items:center; color:#ff7675; gap:10px;">
                            <span>⚠️</span> Landslide / Weather Policy
                        </div>
                    </nav>
                </div>

                <div style="border-top:1px solid #485460; padding-top:20px;">
                    <div style="font-size:12px; color:#a4b0be; margin-bottom:10px;">Property Status:</div>
                    <button id="stop-sell-btn" onclick="toggleStopSell('${user.id}')" style="width:100%; padding:10px; border-radius:8px; border:none; font-weight:bold; cursor:pointer; background:#2ecc71; color:white; margin-bottom:15px;">
                        🟢 Normal Selling Mode
                    </button>
                    <button onclick="window.confirmAndExecuteLogout()" style="width:100%; padding:11px; border-radius:10px; border:1px solid rgba(255,118,117,.55); background:rgba(255,118,117,.08); color:#ff7675; font-weight:900; cursor:pointer;">
                        🚪 Logout Desk
                    </button>
                </div>
            </div>

            <!-- Main Content Display Area -->
            <div id="hotel-main-content" style="flex:1; padding:40px; overflow-y:auto; background:linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%);">
                <div style="text-align:center; padding:50px;">
                    <h3>Initializing Hotel Dashboard & Network Listener...</h3>
                </div>
            </div>
        </div>

        <!-- Check-in Verification Result Modal -->
        <div id="hotel-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; padding:20px;">
            <div id="hotel-modal-body" style="background:white; border-radius:16px; max-width:500px; width:100%; padding:30px; box-shadow:0 20px 40px rgba(0,0,0,0.4);"></div>
        </div>
    `;

    // Initialize Real-time WebSocket Listeners with Fallback Alerts
    setupRealtimeBookingsSubscription(user.id);
    
    // Auto-run Dynamic Hold Release Sweeper
    runInventoryHoldSweeper();
    
    // Default Tab — open the modern dashboard overview.
    await window.showHotelTab('overview');
}

/**
 * Dynamic Tab Switcher for Hotel Dashboard
 */
async function showHotelTab(tabName) {
    const client = getClient();
    let user = window.currentHotelDashboardUser || null;
    if (!user?.id) {
        const { data: authData } = await client.auth.getUser();
        user = authData?.user || null;
    }
    const container = document.getElementById('hotel-main-content');

    if (!container) return;
    if (!user?.id) {
        container.innerHTML = '<div style="padding:30px;background:#fff1f2;border:1px solid #fecdd3;border-radius:14px;color:#9f1239;"><b>Session expired.</b> Please login again.</div>';
        return;
    }

    // Stop camera active stream if navigating away from scan tab
    if (typeof activeQrScanner !== 'undefined' && activeQrScanner) {
        try { await activeQrScanner.stop(); } catch(e){}
        activeQrScanner = null;
    }

    // Update Sidebar Navigation UI Styles
    document.querySelectorAll('.hotel-nav-btn').forEach(btn => btn.style.background = 'transparent');
    const activeBtn = document.getElementById(`nav-${tabName}`);
    if (activeBtn) activeBtn.style.background = '#2c3e50';

    if (tabName === 'checkin') {
        renderCheckinDesk(container, user);
    } else if (tabName === 'inventory') {
        renderInventoryManager(container, user);
    } else if (tabName === 'bookings') {
        renderArrivalsAndPayouts(container, user);
    } else if (tabName === 'landslide') {
        renderLandslideDisputeDesk(container, user);
    }
}
window.showHotelTab = showHotelTab;
window.renderArrivalsAndPayouts = renderArrivalsAndPayouts;

/* ============================================================
   🏨 CUSTOMER HOTEL BOOKING - OWNER APPROVAL
   ============================================================ */

window.approveCustomerHotelBooking = async function(bookingId) {

    const paymentNumber = prompt(
        "Enter the payment collection number / UPI number:\n\n" +
        "Example: 9876543210"
    );

    if (!paymentNumber || !paymentNumber.trim()) {
        alert("Payment number is required.");
        return;
    }

    const paymentInstructions = prompt(
        "Enter payment instructions:\n\n" +
        "Example: Pay via GPay / PhonePe to this number."
    );

    if (!paymentInstructions || !paymentInstructions.trim()) {
        alert("Payment instructions are required.");
        return;
    }

    const client = getClient();

    try {

        const { data: { user } } =
            await client.auth.getUser();

        if (!user) {
            alert("Hotel owner session expired.");
            return;
        }

        const { error } = await client
            .from('hotel_bookings')
            .update({
                booking_status: 'approved',
                payment_status: 'unpaid',

                payment_contact_number:
                    paymentNumber.trim(),

                payment_instructions:
                    paymentInstructions.trim(),

                owner_message:
                    "Request accepted. Now you can do payment. " +
                    "After payment your room booking will be confirmed.",

                approved_at:
                    new Date().toISOString(),

                denied_at: null,
                cancellation_reason: null
            })
            .eq('id', bookingId);

        if (error) throw error;

        alert(
            "✅ Request approved successfully.\n\n" +
            "Payment instructions have been sent to the customer."
        );

        await renderArrivalsAndPayouts(
            document.getElementById('hotel-main-content'),
            user
        );

    } catch (err) {

        console.error(
            "Customer Hotel Approval Error:",
            err
        );

        alert(
            "Approval failed: " +
            err.message
        );
    }
};


/* ============================================================
   🏨 CUSTOMER HOTEL BOOKING - OWNER DENIAL
   ============================================================ */

window.denyCustomerHotelBooking = async function(bookingId) {

    const reason = prompt(
        "Enter the reason for denying this hotel request:"
    );

    if (!reason || !reason.trim()) {
        alert("Please provide a denial reason.");
        return;
    }

    const client = getClient();

    try {

        const { data: { user } } =
            await client.auth.getUser();

        if (!user) {
            alert("Hotel owner session expired.");
            return;
        }

        const denialMessage =
            "The hotel owner has declined this booking request.\n\n" +
            "Reason: " +
            reason.trim();

        const { error } = await client
            .from('hotel_bookings')
            .update({
                booking_status: 'denied',
                payment_status: 'unpaid',

                owner_message:
                    denialMessage,

                cancellation_reason:
                    reason.trim(),

                denied_at:
                    new Date().toISOString(),

                payment_contact_number: null,
                payment_instructions: null
            })
            .eq('id', bookingId);

        if (error) throw error;

        alert(
            "❌ Request denied.\n\n" +
            "The customer has been notified."
        );

        await renderArrivalsAndPayouts(
            document.getElementById('hotel-main-content'),
            user
        );

    } catch (err) {

        console.error(
            "Customer Hotel Denial Error:",
            err
        );

        alert(
            "Denial failed: " +
            err.message
        );
    }
};
/* ============================================================
   🏨 AGENCY HOTEL REQUEST - OWNER APPROVAL / DENIAL
   ============================================================ */

window.processAgencyHotelRequestFromArrivals = async function(
    requestId,
    action
) {

    const client = getClient();

    try {

        if (action === 'approve') {

            const paymentDetails = prompt(
                "Enter payment collection number / UPI details:\n\n" +
                "Example: 9876543210 / hotelpay@upi"
            );

            if (!paymentDetails || !paymentDetails.trim()) {
                alert("Payment details are required.");
                return;
            }

            const { error } = await client
                .from('hotel_requests')
                .update({
                    status: 'approved',
                    payment_details:
                        paymentDetails.trim()
                })
                .eq('request_id', requestId);

            if (error) throw error;

            alert(
                "✅ Agency hotel request approved.\n\n" +
                "Payment information has been shared with the requester."
            );

        } else {

            const reason = prompt(
                "Enter the reason for denying this agency hotel request:"
            );

            if (!reason || !reason.trim()) {
                alert("Please provide a denial reason.");
                return;
            }

            const { error } = await client
                .from('hotel_requests')
                .update({
                    status: 'denied',
                    cancellation_reason:
                        reason.trim()
                })
                .eq('request_id', requestId);

            if (error) throw error;

            alert(
                "❌ Agency hotel request denied.\n\n" +
                "The requester has been notified."
            );
        }

        const { data: { user } } =
            await client.auth.getUser();

        if (user) {

            await renderArrivalsAndPayouts(
                document.getElementById('hotel-main-content'),
                user
            );

        }

    } catch (err) {

        console.error(
            "Agency Hotel Request Action Error:",
            err
        );

        alert(
            "Request action failed: " +
            err.message
        );
    }
};
/* =========================================================================
   FEATURE 1: SCAN & VERIFY GUEST CHECK-IN DESK (QR + 4-DIGIT OTP)
   ========================================================================= */

function renderCheckinDesk(container, user) {
    container.innerHTML = `
        <div style="max-width:900px; margin:auto;">
            <div style="margin-bottom:25px;">
                <h1 style="margin:0; color:#1e272e; font-size:26px;">📲 Reception Check-in Desk</h1>
                <p style="color:#7f8c8d; margin-top:5px;">Verify Char Dham Yatra Booking Pass via dynamic QR scanner or 4-digit OTP code.</p>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:25px;">
                <!-- Mode A: Camera QR Code Scanner -->
                <div style="background:white; padding:25px; border-radius:16px; border:1px solid #e1e8ed; box-shadow:0 4px 12px rgba(0,0,0,0.03);">
                    <h3 style="margin-top:0; color:#2c3e50; display:flex; align-items:center; gap:8px;">
                        <span>📷</span> Scan Dynamic QR Pass
                    </h3>
                    <div id="qr-reader-box" style="width:100%; height:260px; background:#000; border-radius:12px; overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center; color:white;">
                        <button id="start-cam-btn" onclick="startCameraScanner()" style="background:#ff9f43; color:white; border:none; padding:12px 24px; border-radius:8px; font-weight:bold; cursor:pointer;">
                            Activate Camera
                        </button>
                    </div>
                    <small style="color:#95a5a6; display:block; margin-top:10px; text-align:center;">Point camera at guest's Booking Pass QR Code</small>
                </div>

                <!-- Mode B: 4-Digit OTP Manual Entry -->
                <div style="background:white; padding:25px; border-radius:16px; border:1px solid #e1e8ed; box-shadow:0 4px 12px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <h3 style="margin-top:0; color:#2c3e50; display:flex; align-items:center; gap:8px;">
                            <span>🔢</span> Manual 4-Digit OTP Check-in
                        </h3>
                        <p style="font-size:13px; color:#7f8c8d;">If guest's mobile screen is damaged or offline, enter the 4-digit check-in OTP generated on their Booking Pass.</p>
                        
                        <div style="margin:25px 0; text-align:center;">
                            <input type="text" id="manual-otp-input" maxlength="4" placeholder="0 0 0 0" 
                                   style="width:80%; letter-spacing:15px; font-size:32px; font-weight:bold; text-align:center; padding:15px; border:2px solid #3498db; border-radius:12px; outline:none; background:#f8fbfe;">
                        </div>
                    </div>

                    <button onclick="verifyCheckinByOtp()" style="background:#2ecc71; color:white; border:none; width:100%; padding:16px; border-radius:10px; font-size:16px; font-weight:bold; cursor:pointer; transition:0.3s;">
                        VERIFY & CHECK-IN GUEST
                    </button>
                </div>
            </div>

            <!-- Realtime Quick Verification Status Banner -->
            <div id="verification-status-banner" style="margin-top:25px;"></div>
        </div>
    `;
}

/**
 * Camera Scanner Engine using Html5Qrcode
 */
async function startCameraScanner() {
    const box = document.getElementById('qr-reader-box');
    box.innerHTML = `<div id="reader" style="width:100%; height:100%;"></div>`;

    if (typeof Html5Qrcode === "undefined") {
        alert("Loading Camera Engine... Please check internet connection or retry.");
        return;
    }

    activeQrScanner = new Html5Qrcode("reader");
    try {
        await activeQrScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 200, height: 200 } },
            (decodedText) => {
                // QR Decoded Payload structure: {"booking_id": "UUID", "checkin_otp": "1234"}
                try {
                    const parsed = JSON.parse(decodedText);
                    if (parsed.booking_id && parsed.checkin_otp) {
                        executeCheckInVerification(parsed.booking_id, parsed.checkin_otp);
                    } else {
                        executeCheckInVerification(decodedText.trim(), null);
                    }
                } catch(e) {
                    executeCheckInVerification(decodedText.trim(), null);
                }
            },
            (errorMessage) => { /* scanning ... */ }
        );
    } catch(err) {
        box.innerHTML = `<div style="padding:20px; text-align:center; color:#e74c3c;">Camera Access Denied or Unavailable: ${err.message}</div>`;
    }
}

/**
 * Manual OTP Verification Trigger
 */
function verifyCheckinByOtp() {
    const otp = document.getElementById('manual-otp-input').value.trim();
    if (otp.length !== 4 || isNaN(otp)) {
        alert("⚠️ Please enter a valid 4-digit numerical check-in OTP.");
        return;
    }
    executeCheckInVerification(null, otp);
}

/**
 * Core Verification Logic: Matches OTP/QR with Supabase DB & Releases Payout
 */
async function executeCheckInVerification(bookingId, checkinOtp) {
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    const modal = document.getElementById('hotel-modal');
    const modalBody = document.getElementById('hotel-modal-body');

    modal.style.display = 'flex';
    modalBody.innerHTML = `<div style="text-align:center; padding:30px;"><h2>⏳ Verifying Booking Pass...</h2></div>`;

    try {
        let query = client.from('bookings').select('*').eq('hotel_id', user.id);

        if (bookingId && checkinOtp) {
            query = query.eq('booking_id', bookingId).eq('checkin_otp', checkinOtp);
        } else if (bookingId) {
            query = query.eq('booking_id', bookingId);
        } else if (checkinOtp) {
            query = query.eq('checkin_otp', checkinOtp);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
            modalBody.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:50px; color:#e74c3c;">❌</div>
                    <h2 style="color:#e74c3c; margin-top:10px;">Verification Failed</h2>
                    <p style="color:#636e72;">No active booking found matching this QR code or 4-digit OTP for your hotel property.</p>
                    <button onclick="document.getElementById('hotel-modal').style.display='none'" style="background:#dfe6e9; color:#2d3436; padding:12px 25px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:15px;">Close & Retry</button>
                </div>
            `;
            return;
        }

        const booking = data[0];

        // Validation Checks
        if (booking.status === 'checked_in') {
            modalBody.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:50px; color:#f39c12;">⚠️</div>
                    <h2 style="color:#f39c12; margin-top:10px;">Already Checked-In</h2>
                    <p style="color:#636e72;">Guest <b>${booking.customer_email || 'Traveler'}</b> checked in on ${new Date(booking.updated_at).toLocaleString()}.</p>
                    <button onclick="document.getElementById('hotel-modal').style.display='none'" style="background:#dfe6e9; color:#2d3436; padding:12px 25px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:15px;">Close</button>
                </div>
            `;
            return;
        }

        if (booking.status !== 'paid') {
            modalBody.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:50px; color:#e74c3c;">⛔</div>
                    <h2 style="color:#e74c3c; margin-top:10px;">Unpaid / Held Booking</h2>
                    <p style="color:#636e72;">Booking Status is <b>${booking.status.toUpperCase()}</b>. Check-in cannot be verified until booking status is PAID.</p>
                    <button onclick="document.getElementById('hotel-modal').style.display='none'" style="background:#dfe6e9; color:#2d3436; padding:12px 25px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:15px;">Close</button>
                </div>
            `;
            return;
        }

        // UPDATE BOOKING TO CHECKED_IN & RELEASE PAYOUT
        const payoutAmount = (parseFloat(booking.total_price) || 0) * 0.90; // 90% payout after 10% platform fee

        const { error: updateErr } = await client
            .from('bookings')
            .update({ 
                status: 'checked_in', 
                payout_released: true, 
                payout_amount: payoutAmount,
                checked_in_at: new Date().toISOString()
            })
            .eq('booking_id', booking.booking_id);

        if (updateErr) throw updateErr;

        modalBody.innerHTML = `
            <div style="text-align:center;">
                <div style="font-size:60px; color:#2ecc71;">✅</div>
                <h2 style="color:#2ecc71; margin:10px 0 5px 0;">Check-in Successful!</h2>
                <p style="color:#2d3436; font-size:16px; margin-bottom:15px;">Welcome Guest: <b>${booking.customer_email}</b></p>

                <div style="background:#f8f9fa; padding:15px; border-radius:10px; text-align:left; font-size:13px; line-height:1.6; margin-bottom:20px;">
                    <div>🆔 <b>Booking ID:</b> ${booking.booking_id}</div>
                    <div>🛌 <b>Room Type:</b> ${booking.room_type || 'Standard Deluxe'}</div>
                    <div>⏳ <b>Duration:</b> ${booking.duration_days || 1} Night(s)</div>
                    <div>💰 <b>Commission Payout:</b> <span style="color:#2ecc71; font-weight:bold;">₹${payoutAmount.toLocaleString('en-IN')} (Released)</span></div>
                </div>

                <button onclick="document.getElementById('hotel-modal').style.display='none'; showHotelTab('checkin');" style="background:#2ecc71; color:white; padding:12px 30px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:15px;">
                    DONE & CONTINUE
                </button>
            </div>
        `;

    } catch(err) {
        modalBody.innerHTML = `<div style="color:red; text-align:center;">Error verifying check-in: ${err.message}</div>`;
    }
}

/* =========================================================================
   FEATURE 1 & 5: DYNAMIC INVENTORY HOLD SWEEPER & ROOM MANAGER
   ========================================================================= */

function renderInventoryManager(container, user) {
    container.innerHTML = `
        <div style="max-width:900px; margin:auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <div>
                    <h1 style="margin:0; color:#1e272e;">🏨 Dynamic Room Inventory & Holds</h1>
                    <p style="color:#7f8c8d; margin-top:5px;">Manage total available rooms and view active 15-minute temporary inventory holds.</p>
                </div>
                <button onclick="showHotelTab('inventory')" style="background:#3498db; color:white; border:none; padding:10px 18px; border-radius:8px; font-weight:bold; cursor:pointer;">
                    🔄 Refresh Inventory
                </button>
            </div>

            <div id="inventory-card-area">Loading Inventory Details...</div>
        </div>
    `;
    fetchAndRenderHotelInventory(user.id);
}

async function fetchAndRenderHotelInventory(hotelId) {
    const area = document.getElementById('inventory-card-area');
    const client = getClient();

    // Fetch Hotel details & Active Holds
    const { data: hotel } = await client.from('hotels').select('*').eq('id', hotelId).single();
    const { data: activeHolds } = await client
        .from('bookings')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('status', 'held')
        .gt('hold_expires_at', new Date().toISOString());

    const totalRooms = hotel?.total_rooms || 10;
    const availableRooms = hotel?.available_rooms || 10;
    const holdCount = activeHolds ? activeHolds.length : 0;

    area.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:30px;">
            <div style="background:white; padding:20px; border-radius:12px; border-left:5px solid #2ecc71; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                <small style="color:#7f8c8d; font-weight:bold;">AVAILABLE ROOMS</small>
                <h2 style="margin:10px 0 0 0; font-size:32px; color:#2ecc71;">${availableRooms}</h2>
            </div>
            <div style="background:white; padding:20px; border-radius:12px; border-left:5px solid #e67e22; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                <small style="color:#7f8c8d; font-weight:bold;">TEMPORARY HOLDS (15-MIN)</small>
                <h2 style="margin:10px 0 0 0; font-size:32px; color:#e67e22;">${holdCount}</h2>
            </div>
            <div style="background:white; padding:20px; border-radius:12px; border-left:5px solid #3498db; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                <small style="color:#7f8c8d; font-weight:bold;">TOTAL PROPERTY CAPACITY</small>
                <h2 style="margin:10px 0 0 0; font-size:32px; color:#3498db;">${totalRooms}</h2>
            </div>
        </div>

        <div style="background:white; padding:25px; border-radius:16px; border:1px solid #e1e8ed;">
            <h3 style="margin-top:0; color:#2c3e50;">⏱️ Active Agency Inventory Holds</h3>
            ${holdCount === 0 ? `
                <p style="color:#95a5a6;">No temporary inventory holds active at the moment.</p>
            ` : `
                <table style="width:100%; border-collapse:collapse; text-align:left; font-size:14px;">
                    <thead>
                        <tr style="border-bottom:2px solid #eee; color:#7f8c8d;">
                            <th style="padding:10px;">Booking ID</th>
                            <th style="padding:10px;">Agency</th>
                            <th style="padding:10px;">Hold Expires In</th>
                            <th style="padding:10px;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeHolds.map(h => {
                            const expiresAt = new Date(h.hold_expires_at).getTime();
                            const now = new Date().getTime();
                            const diffMins = Math.max(0, Math.ceil((expiresAt - now) / 60000));
                            return `
                                <tr style="border-bottom:1px solid #f0f0f0;">
                                    <td style="padding:12px; font-weight:bold;">${h.booking_id}</td>
                                    <td style="padding:12px;">${h.agency_id || 'Travel Agency'}</td>
                                    <td style="padding:12px; color:#e67e22; font-weight:bold;">⏳ ${diffMins} Minutes</td>
                                    <td style="padding:12px;"><span style="background:#fff4e6; color:#d35400; padding:4px 10px; border-radius:12px; font-weight:bold; font-size:11px;">HELD</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `}
        </div>
    `;
}

/**
 * Sweeper logic: Automatically releases rooms when hold_expires_at is passed
 */
async function runInventoryHoldSweeper() {
    const client = getClient();
    try {
        const nowIso = new Date().toISOString();
        
        // Find expired holds
        const { data: expiredBookings } = await client
            .from('bookings')
            .select('*')
            .eq('status', 'held')
            .lt('hold_expires_at', nowIso);

        if (expiredBookings && expiredBookings.length > 0) {
            for (let b of expiredBookings) {
                // Update booking status to cancelled/expired
                await client.from('bookings').update({ status: 'cancelled' }).eq('booking_id', b.booking_id);
                
                // Increment available_rooms in hotels table
                if (b.hotel_id) {
                    const { data: hotel } = await client.from('hotels').select('available_rooms').eq('id', b.hotel_id).single();
                    if (hotel) {
                        await client.from('hotels').update({ available_rooms: hotel.available_rooms + 1 }).eq('id', b.hotel_id);
                    }
                }
            }
        }
    } catch(e) {
        console.error("Sweeper Error:", e.message);
    }
}

/* =========================================================================
   FEATURE 2: CONTACT MASKING & ANTI-BYPASS SECURE RENDERER
   ========================================================================= */

/**
 * Helper function used by Agency Dashboard to mask hotel info before payment
 */
function renderHotelCardForAgency(hotel, bookingStatus) {
    const isPaid = bookingStatus === 'paid' || bookingStatus === 'checked_in';

    return `
        <div class="hotel-card" style="background:white; padding:20px; border-radius:12px; border:1px solid #e1e8ed; margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <h3 style="margin:0 0 5px 0; color:#2c3e50;">${hotel.name || 'Char Dham Partner Hotel'}</h3>
                    <p style="margin:0; font-size:13px; color:#e67e22; font-weight:bold;">
                        📍 Proximity: Near ${hotel.nearest_temple || 'Yamunotri Temple'} (${hotel.proximity_km || '1.5'} km away)
                    </p>
                </div>
                <span style="background:${isPaid ? '#2ecc71' : '#e67e22'}; color:white; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:bold;">
                    ${isPaid ? 'UNLOCKED' : 'PROTECTED'}
                </span>
            </div>

            <div style="margin-top:15px; padding:12px; border-radius:8px; background:${isPaid ? '#f0fff4' : '#f8f9fa'}; border:1px dashed ${isPaid ? '#2ecc71' : '#bdc3c7'};">
                ${isPaid ? `
                    <div style="font-size:13px; color:#27ae60; line-height:1.6;">
                        <div>📞 <b>Direct Phone:</b> ${hotel.phone || '+91 9876543210'}</div>
                        <div>✉️ <b>Email Desk:</b> ${hotel.email || 'reception@hotel.com'}</div>
                        <div>🏠 <b>Exact Address:</b> ${hotel.full_address || 'Main Temple Road, Barkot, Uttarakhand'}</div>
                    </div>
                ` : `
                    <div style="font-size:13px; color:#7f8c8d; text-align:center;">
                        <span>🔒 <b>Hotel Phone, Email & Street Address Masked</b></span><br>
                        <small>Anti-Bypass Protection: Direct contact details unlock automatically after Agency payment completion.</small>
                    </div>
                `}
            </div>
        </div>
    `;
}

/* =========================================================================
   FEATURE 3: NETWORK FALLBACK & MOUNTAIN OFFLINE SMS/WHATSAPP ALERTS
   ========================================================================= */

function setupRealtimeBookingsSubscription(hotelId) {
    const client = getClient();

    // Subscribe to new completed payments for this hotel
    realtimeSubscription = client
        .channel('hotel-payment-channel')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'bookings',
                filter: `hotel_id=eq.${hotelId}`
            },
            (payload) => {
                if (payload.new && payload.new.status === 'paid') {
                    handleNewPaidBookingNotification(payload.new);
                }
            }
        )
        .subscribe();
}

/**
 * Handle WebPush Notification + 2-Minute Offline Alert Fallback
 */
function handleNewPaidBookingNotification(booking) {
    let acknowledged = false;

    // 1. Display Real-time Web Notification Banner on Hotel Screen
    const statusBanner = document.getElementById('verification-status-banner');
    if (statusBanner) {
        statusBanner.innerHTML = `
            <div style="background:#e8f8f5; border:2px solid #2ecc71; padding:20px; border-radius:12px; color:#27ae60;">
                <h3 style="margin:0 0 10px 0;">🔔 NEW PAID BOOKING RECEIVED!</h3>
                <p style="margin:0;">Booking ID: <b>${booking.booking_id}</b> | Guest OTP: <b>${booking.checkin_otp}</b></p>
                <button onclick="acknowledgeBookingAlert('${booking.booking_id}')" style="background:#2ecc71; color:white; border:none; padding:10px 20px; border-radius:6px; font-weight:bold; cursor:pointer; margin-top:12px;">
                    ACKNOWLEDGE RECEIPT (Stop Fallback SMS)
                </button>
            </div>
        `;
    }

    // 2. Start 2-Minute Fallback Countdown Timer for Poor Mountain Connectivity
    if (ackTimer) clearTimeout(ackTimer);
    
    ackTimer = setTimeout(() => {
        if (!acknowledged) {
            triggerOfflineSmsWhatsAppAlert(booking);
        }
    }, 120000); // 2 minutes (120,000 ms)

    window.acknowledgeBookingAlert = function(bId) {
        acknowledged = true;
        if (ackTimer) clearTimeout(ackTimer);
        alert("✅ Booking Acknowledged. Offline SMS alert cancelled.");
        if (statusBanner) statusBanner.innerHTML = '';
    };
}

/**
 * Trigger Supabase Edge Function to dispatch SMS/WhatsApp when offline
 */
async function triggerOfflineSmsWhatsAppAlert(booking) {
    const client = getClient();
    try {
        console.warn("Hotel offline / unacknowledged for 2 mins. Dispatching SMS/WhatsApp fallback alert...");
        await client.functions.invoke('send-offline-hotel-sms', {
            body: { 
                booking_id: booking.booking_id,
                hotel_id: booking.hotel_id,
                checkin_otp: booking.checkin_otp,
                message: `[TourSetu Urgent Alert] New Paid Booking #${booking.booking_id}. Guest OTP is ${booking.checkin_otp}. Please prepare room.` 
            }
        });
    } catch(err) {
        console.error("Offline Fallback Alert Trigger Error:", err.message);
    }
}

/* =========================================================================
   FEATURE 4: CHAR DHAM LANDSLIDE / WEATHER CANCELLATION DISPUTE DESK
   ========================================================================= */

function renderLandslideDisputeDesk(container, user) {
    container.innerHTML = `
        <div style="max-width:900px; margin:auto;">
            <div style="margin-bottom:25px;">
                <h1 style="margin:0; color:#d63031;">⚠️ Char Dham Landslide & Weather Cancellation Desk</h1>
                <p style="color:#7f8c8d; margin-top:5px;">Process Force Majeure road closures, mountain blockages, or issue 1-tap Free Date Reschedule.</p>
            </div>

            <div style="background:white; padding:25px; border-radius:16px; border:1px solid #ff7675; box-shadow:0 4px 15px rgba(214,48,49,0.05);">
                <h3 style="margin-top:0; color:#d63031;">Initiate Force Majeure Route Blocked Dispute</h3>
                <p style="font-size:13px; color:#636e72;">Under Char Dham Operational Risk Rules: In the event of a severe landslide or government-ordered Yatra halt, financial risk is split 50/50 between parties or settled via season reschedule.</p>
                
                <div style="margin:20px 0;">
                    <label style="font-size:12px; font-weight:bold; color:#2d3436; display:block; margin-bottom:5px;">SELECT AFFECTED BOOKING ID</label>
                    <select id="dispute-booking-select" style="width:100%; padding:12px; border:1px solid #ccc; border-radius:8px;">
                        <option value="">Select Booking...</option>
                    </select>
                </div>

                <div style="margin:20px 0;">
                    <label style="font-size:12px; font-weight:bold; color:#2d3436; display:block; margin-bottom:5px;">FORCE MAJEURE REASON</label>
                    <textarea id="dispute-reason" placeholder="e.g. Landslide at Sonprayag / Helipad suspended due to heavy rain..." style="width:100%; height:70px; padding:12px; border:1px solid #ccc; border-radius:8px; box-sizing:border-box;"></textarea>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:25px;">
                    <button onclick="executeLandslideResolution('split_50_50')" style="background:#e67e22; color:white; border:none; padding:15px; border-radius:8px; font-weight:bold; cursor:pointer;">
                        🤝 Execute 50/50 Risk Split (50% Refund / 50% Hotel Payout)
                    </button>
                    <button onclick="executeLandslideResolution('reschedule')" style="background:#0984e3; color:white; border:none; padding:15px; border-radius:8px; font-weight:bold; cursor:pointer;">
                        📅 1-Tap Free Season Date Reschedule
                    </button>
                </div>
            </div>
        </div>
    `;
    populatePaidBookingsDropdown(user.id);
}

async function populatePaidBookingsDropdown(hotelId) {
    const client = getClient();
    const select = document.getElementById('dispute-booking-select');
    if (!select) return;

    const { data } = await client.from('bookings').select('*').eq('hotel_id', hotelId).eq('status', 'paid');
    if (data && data.length > 0) {
        select.innerHTML = `<option value="">Select Booking...</option>` + data.map(b => `
            <option value="${b.booking_id}">Booking ID: ${b.booking_id} - ₹${b.total_price} (${b.customer_email})</option>
        `).join('');
    } else {
        select.innerHTML = `<option value="">No Active Paid Bookings Eligible for Dispute</option>`;
    }
}

/**
 * Execute Landslide Dispute Resolution Workflow
 */
async function executeLandslideResolution(actionType) {
    const bookingId = document.getElementById('dispute-booking-select').value;
    const reason = document.getElementById('dispute-reason').value;

    if (!bookingId || !reason.trim()) {
        alert("⚠️ Please select a booking and state the landslide/weather reason.");
        return;
    }

    const client = getClient();

    try {
        if (actionType === 'split_50_50') {
            if (!confirm("Are you sure you want to execute a 50/50 financial split? 50% will be refunded to customer/agency and 50% partial payout will be released to hotel to cover blocked inventory.")) return;

            const { data: booking } = await client.from('bookings').select('total_price').eq('booking_id', bookingId).single();
            const total = parseFloat(booking.total_price) || 0;
            const partialRefund = total * 0.50;
            const partialPayout = total * 0.50;

            await client.from('bookings').update({
                status: 'cancelled_landslide',
                refund_amount: partialRefund,
                payout_amount: partialPayout,
                dispute_reason: reason,
                payout_released: true
            }).eq('booking_id', bookingId);

            alert(`✅ Landslide 50/50 Resolution Applied successfully! Refund: ₹${partialRefund}, Hotel Payout: ₹${partialPayout}`);

        } else if (actionType === 'reschedule') {
            const newDate = prompt("Enter new Yatra Check-in Date for guest (YYYY-MM-DD):");
            if (!newDate) return;

            await client.from('bookings').update({
                travel_date: newDate,
                dispute_reason: reason + ` [Rescheduled to ${newDate}]`
            }).eq('booking_id', bookingId);

            alert(`✅ Free Season Date Reschedule applied for ${newDate}.`);
        }

        showHotelTab('landslide');

    } catch(err) {
        alert("Dispute Error: " + err.message);
    }
}

/* =========================================================================
   MISC HOTEL HELPER FUNCTIONS
   ========================================================================= */

async function renderArrivalsAndPayouts(container, user) {

    const client = getClient();

    container.innerHTML = `
        <div style="max-width:1100px;margin:auto;">
            <h1 style="margin:0;color:#1e272e;">
                📋 Arrivals & Payout
            </h1>

            <p style="
                color:#7f8c8d;
                margin-top:6px;
                margin-bottom:25px;
            ">
                Manage customer and agency hotel booking requests,
                cancellations and payment confirmations.
            </p>

            <div id="hotel-arrivals-payout-list">
                Loading requests...
            </div>
        </div>
    `;

    const list =
        document.getElementById('hotel-arrivals-payout-list');

    try {

        /* ============================================================
           1. CURRENT HOTEL PROFILE
           ============================================================ */

        const { data: hotel, error: hotelError } =
            await client
                .from('hotels')
                .select('*')
                .eq('owner_id', user.id)
                .maybeSingle();

        if (hotelError) throw hotelError;

        if (!hotel) {
            list.innerHTML = `
                <div style="
                    background:white;
                    padding:30px;
                    border-radius:12px;
                    color:#e74c3c;
                ">
                    Hotel profile not found.
                </div>
            `;
            return;
        }

        const hotelId = hotel.hotel_id || hotel.id;


        /* ============================================================
           2. CUSTOMER DIRECT HOTEL BOOKINGS
              hotel_bookings -> room_categories -> hotel_id
           ============================================================ */

        const { data: hotelBookings, error: hotelBookingError } =
            await client
                .from('hotel_bookings')
                .select('*')
                .order('created_at', { ascending:false });

        if (hotelBookingError) throw hotelBookingError;


        const categoryIds =
            (hotelBookings || [])
                .map(b => b.room_category_id)
                .filter(Boolean);


        let categories = [];

        if (categoryIds.length > 0) {

            const { data: categoryData, error: categoryError } =
                await client
                    .from('room_categories')
                    .select('id,hotel_id,room_type')
                    .in('id', categoryIds);

            if (categoryError) throw categoryError;

            categories = categoryData || [];
        }


        const categoryMap = {};

        categories.forEach(c => {
            categoryMap[c.id] = c;
        });


        const customerHotelBookings =
            (hotelBookings || []).filter(b => {

                const category =
                    categoryMap[b.room_category_id];

                return category &&
                    String(category.hotel_id) === String(hotelId);
            });


        /* ============================================================
           3. AGENCY / EXISTING HOTEL REQUESTS
           ============================================================ */

        const { data: agencyHotelRequests, error: agencyError } =
            await client
                .from('hotel_requests')
                .select('*, rooms(*)')
                .eq('hotel_id', hotelId)
                .order('created_at', { ascending:false });

        if (agencyError) {
            console.warn(
                "hotel_requests fetch warning:",
                agencyError.message
            );
        }


        /* ============================================================
           4. CUSTOMER HOTEL BOOKING CARDS
           ============================================================ */

        let html = '';


        customerHotelBookings.forEach(b => {

            const status =
                String(b.booking_status || 'pending')
                    .toLowerCase();

            const payment =
                String(b.payment_status || 'unpaid')
                    .toLowerCase();

            const amount =
                Number(b.total_amount || 0);

            const canAct =
                status === 'pending';

            const isCancelled =
                status === 'cancelled' ||
                status === 'cancelled_by_customer';

            const isDenied =
                status === 'denied' ||
                status === 'rejected';

            const isApproved =
                status === 'approved' ||
                status === 'confirmed';

            html += `
                <div style="
                    background:white;
                    padding:22px;
                    border-radius:15px;
                    border-left:6px solid ${
                        isCancelled
                            ? '#ff7675'
                            : isDenied
                                ? '#e74c3c'
                                : isApproved
                                    ? '#3498db'
                                    : '#ff9f43'
                    };
                    margin-bottom:18px;
                    box-shadow:0 3px 12px rgba(0,0,0,0.05);
                ">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:flex-start;
                        gap:15px;
                    ">

                        <div>

                            <span style="
                                display:inline-block;
                                background:#e8f5e9;
                                color:#2e7d32;
                                padding:4px 10px;
                                border-radius:12px;
                                font-size:10px;
                                font-weight:bold;
                            ">
                                🏨 CUSTOMER HOTEL REQUEST
                            </span>

                            <h3 style="
                                margin:10px 0 5px;
                                color:#2d3436;
                            ">
                                ${b.hotel_name || 'Registered Hotel'}
                            </h3>

                            <div style="
                                font-size:13px;
                                color:#636e72;
                            ">
                                📍 ${b.location || 'N/A'}
                            </div>

                        </div>

                        <div style="text-align:right;">

                            <div style="
                                font-size:21px;
                                font-weight:bold;
                                color:#2ecc71;
                            ">
                                ₹${amount.toLocaleString('en-IN')}
                            </div>

                            <span style="
                                display:inline-block;
                                margin-top:5px;
                                background:#f1f2f6;
                                padding:5px 9px;
                                border-radius:8px;
                                font-size:10px;
                                font-weight:bold;
                            ">
                                ${status.toUpperCase()}
                            </span>

                        </div>

                    </div>


                    <div style="
                        margin-top:18px;
                        background:#f8f9fa;
                        padding:15px;
                        border-radius:10px;
                        display:grid;
                        grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
                        gap:12px;
                        font-size:13px;
                    ">

                        <div>
                            📅 <b>Check-in</b><br>
                            ${b.check_in_date || 'N/A'}
                        </div>

                        <div>
                            📅 <b>Check-out</b><br>
                            ${b.check_out_date || 'N/A'}
                        </div>

                        <div>
                            🛏️ <b>Rooms</b><br>
                            ${b.rooms_booked || 0}
                        </div>

                        <div>
                            💳 <b>Payment</b><br>
                            ${payment.toUpperCase()}
                        </div>

                    </div>


                    ${
                        b.customer_email
                        ? `
                        <div style="
                            margin-top:12px;
                            font-size:13px;
                            color:#555;
                        ">
                            👤 <b>Customer:</b>
                            ${b.customer_email}
                        </div>
                        `
                        : ''
                    }


                    ${
                        isCancelled
                        ? `
                        <div style="
                            margin-top:15px;
                            background:#fff5f5;
                            color:#c0392b;
                            padding:14px;
                            border-radius:9px;
                            border:1px solid #ff7675;
                            font-size:13px;
                            font-weight:bold;
                        ">
                            🚫 CUSTOMER CANCELLATION

                            <div style="
                                margin-top:6px;
                                font-weight:normal;
                            ">
                                ${
                                    b.cancellation_reason ||
                                    'Customer cancelled this booking request.'
                                }
                            </div>
                        </div>
                        `
                        : ''
                    }


                    ${
                        isDenied
                        ? `
                        <div style="
                            margin-top:15px;
                            background:#fff5f5;
                            color:#c0392b;
                            padding:14px;
                            border-radius:9px;
                            border:1px solid #ff7675;
                            font-size:13px;
                        ">
                            ❌ REQUEST DENIED

                            <div style="margin-top:5px;">
                                ${b.owner_message || 'Request was denied by hotel owner.'}
                            </div>
                        </div>
                        `
                        : ''
                    }


                    ${
                        isApproved
                        ? `
                        <div style="
                            margin-top:15px;
                            background:#f0fff4;
                            color:#27ae60;
                            padding:14px;
                            border-radius:9px;
                            border:1px solid #2ecc71;
                            font-size:13px;
                        ">
                            ✅ REQUEST ACCEPTED

                            <div style="
                                margin-top:6px;
                                color:#444;
                            ">
                                ${
                                    b.owner_message ||
                                    'Request accepted. Customer can now proceed with payment.'
                                }
                            </div>

                            ${
                                b.payment_contact_number
                                ? `
                                <div style="margin-top:7px;">
                                    📞 Payment Number:
                                    <b>${b.payment_contact_number}</b>
                                </div>
                                `
                                : ''
                            }

                            ${
                                b.payment_instructions
                                ? `
                                <div style="margin-top:7px;">
                                    💳 Payment Instructions:
                                    ${b.payment_instructions}
                                </div>
                                `
                                : ''
                            }
                        </div>
                        `
                        : ''
                    }


                    ${
                        canAct
                        ? `
                        <div style="
                            display:flex;
                            gap:10px;
                            margin-top:18px;
                        ">

                            <button
                                onclick="approveCustomerHotelBooking('${b.id}')"
                                style="
                                    flex:1;
                                    background:#2ecc71;
                                    color:white;
                                    border:none;
                                    padding:12px;
                                    border-radius:8px;
                                    font-weight:bold;
                                    cursor:pointer;
                                "
                            >
                                ✅ APPROVE
                            </button>

                            <button
                                onclick="denyCustomerHotelBooking('${b.id}')"
                                style="
                                    flex:1;
                                    background:#e74c3c;
                                    color:white;
                                    border:none;
                                    padding:12px;
                                    border-radius:8px;
                                    font-weight:bold;
                                    cursor:pointer;
                                "
                            >
                                ❌ DENY
                            </button>

                        </div>
                        `
                        : ''
                    }


                    <div style="
                        margin-top:15px;
                        padding-top:10px;
                        border-top:1px solid #eee;
                        font-size:11px;
                        color:#999;
                    ">
                        Booking ID:
                        ${b.id ? String(b.id).slice(0,8) : 'N/A'}
                    </div>

                </div>
            `;
        });


        /* ============================================================
           5. AGENCY HOTEL REQUEST CARDS
           ============================================================ */

        (agencyHotelRequests || []).forEach(req => {

            const status =
                String(req.status || 'pending')
                    .toLowerCase();

            const isPending = status === 'pending';

            const isCancelled =
                status === 'cancelled' ||
                status === 'denied' ||
                status === 'rejected';

            html += `
                <div style="
                    background:white;
                    padding:22px;
                    border-radius:15px;
                    border-left:6px solid ${
                        isCancelled
                            ? '#e74c3c'
                            : status === 'approved'
                                ? '#3498db'
                                : '#ff9f43'
                    };
                    margin-bottom:18px;
                    box-shadow:0 3px 12px rgba(0,0,0,0.05);
                ">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:flex-start;
                    ">

                        <div>

                            <span style="
                                background:#ebf5fb;
                                color:#2980b9;
                                padding:4px 10px;
                                border-radius:8px;
                                font-size:10px;
                                font-weight:bold;
                            ">
                                ${
                                    String(req.requester_type || 'agency')
                                        .toUpperCase()
                                }
                                HOTEL REQUEST
                            </span>

                            <h3 style="
                                margin:10px 0 5px;
                                color:#2d3436;
                            ">
                                ${req.rooms?.room_type || 'Room Request'}
                            </h3>

                            <div style="
                                font-size:13px;
                                color:#636e72;
                            ">
                                Requester:
                                <b>
                                    ${
                                        req.agency_contact ||
                                        req.requester_type ||
                                        'Agency'
                                    }
                                </b>
                            </div>

                        </div>

                        <div style="
                            font-weight:bold;
                            color:#2ecc71;
                        ">
                            ₹${Number(req.total_amount || 0).toLocaleString('en-IN')}
                        </div>

                    </div>


                    <div style="
                        margin-top:15px;
                        background:#f8f9fa;
                        padding:14px;
                        border-radius:9px;
                        font-size:13px;
                    ">

                        📅
                        <b>Check-in:</b>
                        ${req.check_in || 'N/A'}

                        &nbsp;&nbsp;

                        📅
                        <b>Check-out:</b>
                        ${req.check_out || 'N/A'}

                        <br><br>

                        🚪
                        <b>Rooms:</b>
                        ${req.quantity || 0}

                    </div>


                    ${
                        status === 'approved'
                        ? `
                        <div style="
                            margin-top:15px;
                            background:#f0fff4;
                            color:#27ae60;
                            padding:13px;
                            border-radius:8px;
                        ">
                            ✅ REQUEST ACCEPTED

                            <div style="margin-top:5px;">
                                Payment instructions:
                                <b>${req.payment_details || 'N/A'}</b>
                            </div>
                        </div>
                        `
                        : ''
                    }


                    ${
                        isCancelled
                        ? `
                        <div style="
                            margin-top:15px;
                            background:#fff5f5;
                            color:#c0392b;
                            padding:13px;
                            border-radius:8px;
                        ">
                            🚫 REQUEST CANCELLED / DENIED

                            <div style="margin-top:5px;">
                                ${
                                    req.cancellation_reason ||
                                    'This hotel request was cancelled or denied.'
                                }
                            </div>
                        </div>
                        `
                        : ''
                    }


                    ${
                        isPending
                        ? `
                        <div style="
                            display:flex;
                            gap:10px;
                            margin-top:18px;
                        ">

                            <button
                                onclick="processAgencyHotelRequestFromArrivals('${req.request_id}','approve')"
                                style="
                                    flex:1;
                                    background:#2ecc71;
                                    color:white;
                                    border:none;
                                    padding:12px;
                                    border-radius:8px;
                                    font-weight:bold;
                                    cursor:pointer;
                                "
                            >
                                ✅ APPROVE
                            </button>

                            <button
                                onclick="processAgencyHotelRequestFromArrivals('${req.request_id}','deny')"
                                style="
                                    flex:1;
                                    background:#e74c3c;
                                    color:white;
                                    border:none;
                                    padding:12px;
                                    border-radius:8px;
                                    font-weight:bold;
                                    cursor:pointer;
                                "
                            >
                                ❌ DENY
                            </button>

                        </div>
                        `
                        : ''
                    }

                </div>
            `;
        });


        if (!html) {

            list.innerHTML = `
                <div style="
                    background:white;
                    padding:40px;
                    border-radius:15px;
                    text-align:center;
                    color:#777;
                ">
                    <h3>No hotel booking requests yet.</h3>
                    <p>
                        Customer and agency hotel requests will appear here.
                    </p>
                </div>
            `;

        } else {

            list.innerHTML = html;

        }

    } catch (err) {

        console.error(
            "Arrivals & Payout Error:",
            err
        );

        list.innerHTML = `
            <div style="
                background:#fff5f5;
                color:#c0392b;
                padding:20px;
                border-radius:10px;
            ">
                ❌ Failed to load Arrivals & Payout:
                ${err.message}
            </div>
        `;
    }
}

async function toggleStopSell(hotelId) {
    const client = getClient();
    const btn = document.getElementById('stop-sell-btn');
    
    const { data: hotel } = await client.from('hotels').select('is_stop_sell').eq('id', hotelId).single();
    const newStatus = !hotel?.is_stop_sell;

    await client.from('hotels').update({ is_stop_sell: newStatus }).eq('id', hotelId);

    if (newStatus) {
        btn.style.background = '#e74c3c';
        btn.innerText = '🔴 STOP SELL ACTIVE (Property Closed)';
    } else {
        btn.style.background = '#2ecc71';
        btn.innerText = '🟢 Normal Selling Mode';
    }
}
currentEditingRoomId = typeof currentEditingRoomId !== 'undefined' ? currentEditingRoomId : null;
// 1. Safe Fetch Function for Hotel Profile
async function fetchHotelProfile(userId) {
    try {
        const client = getClient();
        if (!client) return null;

        const { data: hotel, error } = await client
            .from('hotels')
            .select('*')
            .eq('owner_id', userId)
            .maybeSingle();

        if (error) throw error;
        return hotel;
    } catch (err) {
        console.error("Hotel profile fetch error:", err.message);
        return null;
    }
}

// 2. Global Tab Switcher Function
window.showHotelTab = async function(tabName) {
    const container = document.getElementById('hotel-main-content');
    if (!container) return;

    const client = getClient();
    if (!client) return;
    
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;

    const hotel = await fetchHotelProfile(user.id);

    // TAB: OVERVIEW
    if (tabName === 'overview') {
        if (!hotel) {
            container.innerHTML = `
                <div class="card" style="background:white; padding:40px; border-radius:15px; text-align:center;">
                    <h2>Welcome Partner! 🏨</h2>
                    <p style="color:#666;">Please setup your property details to begin taking room requests.</p>
                    <button onclick="showHotelTab('property')" style="background:#ff9f43; color:white; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:10px;">Setup Property Now</button>
                </div>`;
            return;
        }

        const { data: requests } = await client.from('hotel_requests').select('*').eq('hotel_id', hotel.hotel_id);
        const pendingCount = requests ? requests.filter(r => r.status === 'pending').length : 0;
        const approvedCount = requests ? requests.filter(r => r.status === 'approved').length : 0;

        container.innerHTML = `
            <h1>Hotel Overview</h1>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:20px; margin-top:20px;">
                <div class="card" style="background:white; padding:25px; border-radius:12px; border-left:5px solid #ff9f43;">
                    <small style="color:#888;">PROPERTY STATUS</small>
                    <h3 style="margin:5px 0;">${hotel.hide_from_search ? '🔴 Hidden (No Inventory)' : '🟢 Active & Listed'}</h3>
                </div>
                <div class="card" style="background:white; padding:25px; border-radius:12px; border-left:5px solid #3498db;">
                    <small style="color:#888;">PENDING REQUESTS</small>
                    <h2 style="margin:5px 0;">${pendingCount}</h2>
                </div>
                <div class="card" style="background:white; padding:25px; border-radius:12px; border-left:5px solid #2ecc71;">
                    <small style="color:#888;">CONFIRMED BOOKINGS</small>
                    <h2 style="margin:5px 0;">${approvedCount}</h2>
                </div>
            </div>`;
    } 
    // TAB: PROPERTY / ROOM INVENTORY
    else if (tabName === 'property' || tabName === 'room-inventory' || tabName === 'inventory') {
        const destSelectOptions = (typeof FIXED_HOTEL_DESTINATIONS !== 'undefined' ? FIXED_HOTEL_DESTINATIONS : []).map(loc => 
            `<option value="${loc}" ${hotel && hotel.city === loc ? 'selected' : ''}>${loc}</option>`
        ).join('');

        container.innerHTML = `
            <h1>Property & Inventory Management</h1>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-top:20px;">
                <div class="card" style="background:white; padding:25px; border-radius:15px;">
                    <h3>🏨 Property Profile</h3>
                    <input type="text" id="h-name" placeholder="Hotel Name" value="${hotel?.hotel_name || ''}" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                    
                    <label style="font-size:12px; color:#666; font-weight:bold; display:block; margin-top:10px;">DESTINATION</label>
                    <select id="h-city" style="width:100%; padding:10px; margin:5px 0; border:1px solid #ddd; border-radius:8px;">
                        <option value="">Select Permitted Destination</option>
                        ${destSelectOptions}
                    </select>

                    <input type="text" id="h-address" placeholder="Complete Street Address" value="${hotel?.address || ''}" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                    <input type="file" id="h-front-pic" accept="image/*" style="margin:8px 0;">

                    <button onclick="saveHotelProfile('${hotel?.hotel_id || ''}')" style="width:100%; background:#ff9f43; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:15px;">Save Property Profile</button>
                </div>

                <div class="card" style="background:white; padding:25px; border-radius:15px;">
                    <h3>🛏️ Add Room Category</h3>
                    ${!hotel ? '<p style="color:#e74c3c;">Save hotel property details first before adding rooms.</p>' : `
                        <input type="text" id="r-type" placeholder="Room Category (e.g. Deluxe AC)" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                        <input type="number" id="r-price" placeholder="Price per Night (₹)" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                        <input type="number" id="r-total" placeholder="Total Rooms Inventory" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                        <input type="number" id="r-available" placeholder="Current Available Rooms" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                        <input type="file" id="r-photos" multiple accept="image/*" style="margin:8px 0;">

                        <button id="btn-save-room" onclick="saveOrUpdateRoomCategory('${hotel.hotel_id}')" style="width:100%; background:#2ecc71; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:15px;">+ Add Room Type</button>
                    `}
                </div>
            </div>

            <div style="margin-top:30px;">
                <h3>Live Inventory Stock</h3>
                <div id="hotel-rooms-list">Loading inventory...</div>
            </div>`;

        if (hotel && typeof loadHotelRooms === "function") loadHotelRooms(hotel.hotel_id);
    } 
    // TAB: REQUESTS
    else if (tabName === 'requests') {
        container.innerHTML = `
            <h1>Booking & Quote Requests</h1>
            <div style="margin-top:20px;" id="hotel-inbox-container">Loading requests...</div>`;
        if (hotel && typeof loadHotelRequests === "function") loadHotelRequests(hotel.hotel_id);
    }
};

// 3. Edit Button Click Function
function editRoomCategory(id, category, price, total, available) {
  currentEditingRoomId = id;

  if(document.getElementById('r-type')) document.getElementById('r-type').value = category;
  if(document.getElementById('r-price')) document.getElementById('r-price').value = price;
  if(document.getElementById('r-total')) document.getElementById('r-total').value = total;
  if(document.getElementById('r-available')) document.getElementById('r-available').value = available;

  const addBtn = document.getElementById('btn-save-room') || document.getElementById('addRoomBtn');
  if(addBtn) {
    addBtn.innerText = "🔄 Update Room Type";
    addBtn.style.backgroundColor = "#ff9800";
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4. Add / Update Room Save Logic (Fixed client instance)
async function saveOrUpdateRoomCategory(hotelId) {
  const client = getClient();
  if (!client) {
    alert("Database connection error!");
    return;
  }

  const categoryInput = document.getElementById('r-type') || document.getElementById('roomCategory');
  const priceInput = document.getElementById('r-price') || document.getElementById('roomPrice');
  const totalInput = document.getElementById('r-total') || document.getElementById('totalRooms');
  const availableInput = document.getElementById('r-available') || document.getElementById('availableRooms');

  const category = categoryInput ? categoryInput.value : '';
  const price = priceInput ? priceInput.value : '';
  const total = totalInput ? totalInput.value : 0;
  const available = availableInput ? availableInput.value : 0;

  if (!category || !price) {
    alert("Please enter room category and price!");
    return;
  }

  // UPDATE MODE
  if (currentEditingRoomId) {
    const { error } = await client
      .from('room_categories')
      .update({
        room_type: category,
        price_per_night: price,
        total_rooms: total,
        available_rooms: available
      })
      .eq('id', currentEditingRoomId);

    if (error) {
      alert("Update Failed: " + error.message);
    } else {
      alert("Room details updated successfully!");
      resetRoomForm();
      if (typeof loadHotelRooms === "function") loadHotelRooms(hotelId);
      else if (typeof loadInventory === "function") loadInventory();
    }
  } 
  // INSERT MODE
  else {
    const { error } = await client
      .from('room_categories')
      .insert([
        {
          hotel_id: hotelId,
          room_type: category,
          price_per_night: price,
          total_rooms: total,
          available_rooms: available
        }
      ]);

    if (error) {
      alert("Save Failed: " + error.message);
    } else {
      alert("Room added successfully!");
      resetRoomForm();
      if (typeof loadHotelRooms === "function") loadHotelRooms(hotelId);
      else if (typeof loadInventory === "function") loadInventory();
    }
  }
}

// Alias for backwards compatibility
window.saveRoomCategory = saveOrUpdateRoomCategory;

// 5. Form Reset Function
function resetRoomForm() {
  currentEditingRoomId = null;
  
  if(document.getElementById('r-type')) document.getElementById('r-type').value = '';
  if(document.getElementById('r-price')) document.getElementById('r-price').value = '';
  if(document.getElementById('r-total')) document.getElementById('r-total').value = '';
  if(document.getElementById('r-available')) document.getElementById('r-available').value = '';

  const addBtn = document.getElementById('btn-save-room') || document.getElementById('addRoomBtn');
  if(addBtn) {
    addBtn.innerText = "+ Add Room Type";
    addBtn.style.backgroundColor = "#2ecc71";
  }
}

// 6. Auto Load Rooms Function
async function loadHotelRooms(hotelId) {
    const listDiv = document.getElementById('hotel-rooms-list');
    if (!listDiv) return;

    const client = getClient();
    if (!client) return;

    const { data: rooms, error } = await client
        .from('room_categories')
        .select('*')
        .eq('hotel_id', hotelId);

    if (error) {
        listDiv.innerHTML = `<p style="color:red;">Error loading rooms: ${error.message}</p>`;
        return;
    }

    if (!rooms || rooms.length === 0) {
        listDiv.innerHTML = `<p style="color:#666;">No room categories added yet.</p>`;
        return;
    }

    listDiv.innerHTML = rooms.map(room => `
        <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:15px; margin-top:10px; background:#fff; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div>
                <h4 style="margin:0;">${room.room_type || room.category_name || ''}</h4>
                <p style="margin:5px 0 0; color:#666;">Price: ₹${room.price_per_night || room.price || 0} / night</p>
            </div>
            
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="text-align:right;">
                    <small style="color:#888; font-size:10px; display:block;">AVAILABLE / TOTAL</small>
                    <div><strong>${room.available_rooms ?? 0}</strong> / ${room.total_rooms ?? 0}</div>
                </div>
                
                <button onclick="editRoomCategory('${room.id}', '${room.room_type || room.category_name || ''}', '${room.price_per_night || room.price || 0}', '${room.total_rooms || 0}', '${room.available_rooms || 0}')" 
                        style="background:#2196F3; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer; font-weight:bold;">
                    ✏️ Edit
                </button>
            </div>
        </div>
    `).join('');
}
/* =========================================================================
   🏨 HOTEL DASHBOARD — ARRIVALS & PAYOUTS
   CUSTOMER + AGENCY HOTEL REQUESTS
   ========================================================================= */

async function renderArrivalsAndPayouts(container, user) {

    const client = getClient();

    container.innerHTML = `
        <div style="max-width:1100px;margin:auto;">

            <h1 style="margin:0;color:#1e272e;">
                📋 Arrivals & Payouts
            </h1>

            <p style="
                color:#7f8c8d;
                margin-top:6px;
                margin-bottom:25px;
            ">
                Track customer arrivals, paid bookings, payment receipts and agency hotel requests from one place.
            </p>

            <div id="hotel-arrivals-payout-list">
                Loading requests...
            </div>

        </div>
    `;

    const list =
        document.getElementById(
            'hotel-arrivals-payout-list'
        );

    try {

        /* ============================================================
           1. CURRENT HOTEL PROFILE
           ============================================================ */

        const {
            data: hotel,
            error: hotelError
        } = await client
            .from('hotels')
            .select('*')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (hotelError) throw hotelError;

        if (!hotel) {

            list.innerHTML = `
                <div style="
                    background:white;
                    padding:30px;
                    border-radius:12px;
                    color:#e74c3c;
                ">
                    Hotel profile not found.
                </div>
            `;

            return;
        }

        const hotelId =
            hotel.hotel_id || hotel.id;


        /* ============================================================
           2. CUSTOMER DIRECT HOTEL BOOKINGS
           hotel_bookings → room_categories → hotels
           ============================================================ */

        const {
            data: hotelBookings,
            error: hotelBookingError
        } = await client
            .from('hotel_bookings')
            .select('*')
            .order(
                'created_at',
                {
                    ascending: false
                }
            );

        if (hotelBookingError) {
            throw hotelBookingError;
        }


        const categoryIds =
            (hotelBookings || [])
                .map(
                    b =>
                        b.room_category_id
                )
                .filter(Boolean);


        let categories = [];


        if (categoryIds.length > 0) {

            const {
                data: categoryData,
                error: categoryError
            } = await client
                .from('room_categories')
                .select(
                    'id,hotel_id,room_type'
                )
                .in(
                    'id',
                    categoryIds
                );

            if (categoryError) {
                throw categoryError;
            }

            categories =
                categoryData || [];
        }


        const categoryMap = {};


        categories.forEach(
            c => {

                categoryMap[c.id] =
                    c;

            }
        );


        const customerHotelBookings =
            (hotelBookings || [])
                .filter(
                    b => {

                        const category =
                            categoryMap[
                                b.room_category_id
                            ];

                        return (
                            category &&
                            String(
                                category.hotel_id
                            ) ===
                            String(hotelId)
                        );

                    }
                );


        /* ============================================================
           3. AGENCY HOTEL REQUESTS
           ============================================================ */

        const {
            data: agencyHotelRequests,
            error: agencyError
        } = await client
            .from('hotel_requests')
            .select(
                '*, rooms(*)'
            )
            .eq(
                'hotel_id',
                hotelId
            )
            .order(
                'created_at',
                {
                    ascending: false
                }
            );


        if (agencyError) {

            console.warn(
                "hotel_requests fetch warning:",
                agencyError.message
            );

        }


        /* ============================================================
           4. CUSTOMER PAYMENTS RECEIVED
           ============================================================ */

        const paidCustomerBookings =
            customerHotelBookings.filter(b => {
                const status = String(b.payment_status || 'unpaid').toLowerCase();
                return status === 'paid' || status === 'success' || status === 'completed';
            });

        const paidCustomerTotal =
            paidCustomerBookings.reduce(
                (sum, b) => sum + Number(b.total_amount || 0),
                0
            );

        const paidSection = `
            <section style="margin-bottom:28px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:15px;flex-wrap:wrap;margin-bottom:15px;">
                    <div>
                        <div style="font-size:11px;font-weight:900;letter-spacing:.1em;color:#16a34a;text-transform:uppercase;">PAYMENTS RECEIVED</div>
                        <h2 style="margin:4px 0;color:#0f172a;font-size:25px;">💳 Customer Payments Received</h2>
                        <p style="margin:0;color:#64748b;font-size:13px;">Yahan sirf customer ki successfully received/paid hotel payments show hongi.</p>
                    </div>
                    <span style="background:#dcfce7;color:#166534;padding:7px 12px;border-radius:999px;font-size:11px;font-weight:900;">${paidCustomerBookings.length} PAID</span>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin-bottom:16px;">
                    <div style="background:linear-gradient(135deg,#ffffff,#f0fdf4);border:1px solid #bbf7d0;border-radius:16px;padding:20px;box-shadow:0 8px 24px rgba(15,23,42,.05);">
                        <div style="font-size:11px;color:#64748b;font-weight:900;">TOTAL PAYMENT RECEIVED</div>
                        <div style="font-size:28px;font-weight:900;color:#15803d;margin-top:7px;">₹${paidCustomerTotal.toLocaleString('en-IN')}</div>
                    </div>
                    <div style="background:#fff;border:1px solid #dbeafe;border-radius:16px;padding:20px;box-shadow:0 8px 24px rgba(15,23,42,.05);">
                        <div style="font-size:11px;color:#64748b;font-weight:900;">PAID CUSTOMER BOOKINGS</div>
                        <div style="font-size:28px;font-weight:900;color:#1d4ed8;margin-top:7px;">${paidCustomerBookings.length}</div>
                    </div>
                    <div style="background:#fff;border:1px solid #ffedd5;border-radius:16px;padding:20px;box-shadow:0 8px 24px rgba(15,23,42,.05);">
                        <div style="font-size:11px;color:#64748b;font-weight:900;">PAYMENT STATUS</div>
                        <div style="font-size:20px;font-weight:900;color:#15803d;margin-top:10px;">✓ RECEIVED</div>
                    </div>
                </div>

                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:auto;box-shadow:0 8px 24px rgba(15,23,42,.05);">
                    ${paidCustomerBookings.length ? `
                    <table style="width:100%;border-collapse:collapse;min-width:900px;">
                        <thead>
                            <tr style="background:#f8fafc;color:#64748b;font-size:10px;text-transform:uppercase;">
                                <th style="padding:13px 15px;text-align:left;">Customer</th>
                                <th style="padding:13px 15px;text-align:left;">Room</th>
                                <th style="padding:13px 15px;text-align:left;">Arrival</th>
                                <th style="padding:13px 15px;text-align:left;">Departure</th>
                                <th style="padding:13px 15px;text-align:center;">Rooms</th>
                                <th style="padding:13px 15px;text-align:right;">Amount Received</th>
                                <th style="padding:13px 15px;text-align:center;">Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${paidCustomerBookings.map(b => `
                                <tr style="border-top:1px solid #f1f5f9;">
                                    <td style="padding:14px 15px;">
                                        <div style="font-weight:800;color:#1e293b;">${b.customer_email || 'Customer'}</div>
                                        <div style="font-size:11px;color:#64748b;">${b.customer_phone || ''}</div>
                                    </td>
                                    <td style="padding:14px 15px;color:#334155;font-weight:700;">${b.room_type || 'Room'}</td>
                                    <td style="padding:14px 15px;color:#1d4ed8;font-weight:800;">${b.check_in_date || '—'}</td>
                                    <td style="padding:14px 15px;color:#475569;">${b.check_out_date || '—'}</td>
                                    <td style="padding:14px 15px;text-align:center;font-weight:800;">${b.rooms_booked || 0}</td>
                                    <td style="padding:14px 15px;text-align:right;font-weight:900;color:#15803d;">₹${Number(b.total_amount || 0).toLocaleString('en-IN')}</td>
                                    <td style="padding:14px 15px;text-align:center;"><span style="background:#dcfce7;color:#166534;padding:5px 9px;border-radius:999px;font-size:10px;font-weight:900;">PAID</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ` : `
                    <div style="padding:38px 20px;text-align:center;color:#64748b;">
                        <div style="font-size:38px;margin-bottom:8px;">💳</div>
                        <h3 style="margin:0 0 6px;color:#334155;">No customer payment received yet</h3>
                        <p style="margin:0;font-size:13px;">Jab customer payment successfully <b>PAID</b> hoga, booking yahan automatically show hogi.</p>
                    </div>
                    `}
                </div>
            </section>
        `;

        /* ============================================================
           5. BUILD ALL BOOKING CARDS
           ============================================================ */

        let html = paidSection;


        /* ============================================================
           4A. CUSTOMER HOTEL BOOKINGS
           ============================================================ */

        customerHotelBookings.forEach(
            b => {

                const status =
                    String(
                        b.booking_status ||
                        'pending'
                    ).toLowerCase();


                const payment =
                    String(
                        b.payment_status ||
                        'unpaid'
                    ).toLowerCase();


                const amount =
                    Number(
                        b.total_amount ||
                        0
                    );


                const canAct =
                    status === 'pending';


                const isCancelled =
                    status === 'cancelled' ||
                    status === 'cancelled_by_customer';


                const isDenied =
                    status === 'denied' ||
                    status === 'rejected';


                const isApproved =
                    status === 'approved' ||
                    status === 'confirmed';


                const isPaid =
                    payment === 'paid' ||
                    payment === 'success' ||
                    payment === 'completed';


                html += `

                    <div style="
                        background:white;
                        padding:22px;
                        border-radius:15px;
                        border-left:6px solid ${
                            isCancelled
                                ? '#ff7675'
                                : isDenied
                                    ? '#e74c3c'
                                    : isApproved
                                        ? '#3498db'
                                        : '#ff9f43'
                        };
                        margin-bottom:18px;
                        box-shadow:
                            0 3px 12px
                            rgba(0,0,0,0.05);
                    ">

                        <div style="
                            display:flex;
                            justify-content:space-between;
                            align-items:flex-start;
                            gap:15px;
                        ">

                            <div>

                                <span style="
                                    display:inline-block;
                                    background:#e8f5e9;
                                    color:#2e7d32;
                                    padding:4px 10px;
                                    border-radius:12px;
                                    font-size:10px;
                                    font-weight:bold;
                                ">
                                    🏨 CUSTOMER HOTEL REQUEST
                                </span>


                                <h3 style="
                                    margin:10px 0 5px;
                                    color:#2d3436;
                                ">
                                    ${
                                        b.hotel_name ||
                                        'Registered Hotel'
                                    }
                                </h3>


                                <div style="
                                    font-size:13px;
                                    color:#636e72;
                                ">
                                    📍 ${
                                        b.location ||
                                        'N/A'
                                    }
                                </div>

                            </div>


                            <div style="
                                text-align:right;
                            ">

                                <div style="
                                    font-size:21px;
                                    font-weight:bold;
                                    color:#2ecc71;
                                ">
                                    ₹${amount.toLocaleString('en-IN')}
                                </div>


                                <span style="
                                    display:inline-block;
                                    margin-top:5px;
                                    background:#f1f2f6;
                                    padding:5px 9px;
                                    border-radius:8px;
                                    font-size:10px;
                                    font-weight:bold;
                                ">
                                    ${status.toUpperCase()}
                                </span>

                            </div>

                        </div>


                        <!-- BOOKING DETAILS -->

                        <div style="
                            margin-top:18px;
                            background:#f8f9fa;
                            padding:15px;
                            border-radius:10px;
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(180px,1fr)
                                );
                            gap:12px;
                            font-size:13px;
                        ">

                            <div>
                                📅 <b>Check-in</b><br>
                                ${
                                    b.check_in_date ||
                                    'N/A'
                                }
                            </div>


                            <div>
                                📅 <b>Check-out</b><br>
                                ${
                                    b.check_out_date ||
                                    'N/A'
                                }
                            </div>


                            <div>
                                🛏️ <b>Rooms</b><br>
                                ${
                                    b.rooms_booked ||
                                    0
                                }
                            </div>


                            <div>
                                💳 <b>Payment</b><br>

                                <span style="
                                    color:${
                                        isPaid
                                            ? '#27ae60'
                                            : payment === 'failed' ||
                                              payment === 'cancelled'
                                                ? '#e74c3c'
                                                : '#ff9f43'
                                    };
                                    font-weight:bold;
                                ">
                                    ${payment.toUpperCase()}
                                </span>
                            </div>

                        </div>


                        ${
                            b.customer_email
                            ? `

                            <div style="
                                margin-top:12px;
                                font-size:13px;
                                color:#555;
                            ">
                                👤 <b>Customer:</b>
                                ${b.customer_email}
                            </div>

                            `
                            : ''
                        }


                        ${
                            b.customer_id
                            ? `

                            <div style="
                                margin-top:6px;
                                font-size:11px;
                                color:#999;
                            ">
                                Customer ID:
                                ${String(b.customer_id).slice(0,8)}
                            </div>

                            `
                            : ''
                        }


                        <!-- CUSTOMER CANCELLATION -->

                        ${
                            isCancelled
                            ? `

                            <div style="
                                margin-top:15px;
                                background:#fff5f5;
                                color:#c0392b;
                                padding:14px;
                                border-radius:9px;
                                border:
                                    1px solid #ff7675;
                                font-size:13px;
                                font-weight:bold;
                            ">

                                🚫 CUSTOMER CANCELLATION

                                <div style="
                                    margin-top:6px;
                                    font-weight:normal;
                                    line-height:1.6;
                                ">
                                    ${
                                        b.cancellation_reason ||
                                        b.owner_message ||
                                        'Customer cancelled this booking request.'
                                    }
                                </div>

                                ${
                                    b.cancelled_by
                                    ? `
                                    <div style="
                                        margin-top:7px;
                                        font-size:11px;
                                        color:#777;
                                    ">
                                        Cancelled by:
                                        <b>
                                            ${b.cancelled_by}
                                        </b>
                                    </div>
                                    `
                                    : ''
                                }

                                ${
                                    b.cancelled_at
                                    ? `
                                    <div style="
                                        margin-top:4px;
                                        font-size:11px;
                                        color:#777;
                                    ">
                                        Cancelled at:
                                        ${
                                            new Date(
                                                b.cancelled_at
                                            ).toLocaleString(
                                                'en-IN'
                                            )
                                        }
                                    </div>
                                    `
                                    : ''
                                }

                            </div>

                            `
                            : ''
                        }


                        <!-- DENIED -->

                        ${
                            isDenied
                            ? `

                            <div style="
                                margin-top:15px;
                                background:#fff5f5;
                                color:#c0392b;
                                padding:14px;
                                border-radius:9px;
                                border:
                                    1px solid #ff7675;
                                font-size:13px;
                            ">

                                ❌ REQUEST DENIED

                                <div style="
                                    margin-top:5px;
                                    line-height:1.6;
                                ">
                                    ${
                                        b.owner_message ||
                                        'Request was denied by hotel owner.'
                                    }
                                </div>

                            </div>

                            `
                            : ''
                        }


                        <!-- APPROVED -->

                        ${
                            isApproved &&
                            !isCancelled
                            ? `

                            <div style="
                                margin-top:15px;
                                background:#f0fff4;
                                color:#27ae60;
                                padding:14px;
                                border-radius:9px;
                                border:
                                    1px solid #2ecc71;
                                font-size:13px;
                            ">

                                ${
                                    isPaid
                                    ? '✅ PAYMENT CONFIRMED'
                                    : '✅ REQUEST ACCEPTED'
                                }

                                <div style="
                                    margin-top:6px;
                                    color:#444;
                                ">
                                    ${
                                        b.owner_message ||
                                        (
                                            isPaid
                                            ? 'Customer payment has been confirmed. Hotel booking is confirmed.'
                                            : 'Request accepted. Customer can now proceed with payment.'
                                        )
                                    }
                                </div>


                                ${
                                    b.payment_contact_number
                                    ? `

                                    <div style="
                                        margin-top:7px;
                                    ">
                                        📞 Payment Number:
                                        <b>
                                            ${
                                                b.payment_contact_number
                                            }
                                        </b>
                                    </div>

                                    `
                                    : ''
                                }


                                ${
                                    b.payment_instructions
                                    ? `

                                    <div style="
                                        margin-top:7px;
                                    ">
                                        💳 Payment Instructions:
                                        ${
                                            b.payment_instructions
                                        }
                                    </div>

                                    `
                                    : ''
                                }

                            </div>

                            `
                            : ''
                        }


                        <!-- APPROVE / DENY -->

                        ${
                            canAct
                            ? `

                            <div style="
                                display:flex;
                                gap:10px;
                                margin-top:18px;
                            ">

                                <button
                                    onclick="
                                        approveCustomerHotelBooking(
                                            '${b.id}'
                                        )
                                    "
                                    style="
                                        flex:1;
                                        background:#2ecc71;
                                        color:white;
                                        border:none;
                                        padding:12px;
                                        border-radius:8px;
                                        font-weight:bold;
                                        cursor:pointer;
                                    "
                                >
                                    ✅ APPROVE
                                </button>


                                <button
                                    onclick="
                                        denyCustomerHotelBooking(
                                            '${b.id}'
                                        )
                                    "
                                    style="
                                        flex:1;
                                        background:#e74c3c;
                                        color:white;
                                        border:none;
                                        padding:12px;
                                        border-radius:8px;
                                        font-weight:bold;
                                        cursor:pointer;
                                    "
                                >
                                    ❌ DENY
                                </button>

                            </div>

                            `
                            : ''
                        }


                        <div style="
                            margin-top:15px;
                            padding-top:10px;
                            border-top:1px solid #eee;
                            font-size:11px;
                            color:#999;
                        ">

                            Booking ID:
                            ${
                                b.id
                                    ? String(
                                        b.id
                                    ).slice(0,8)
                                    : 'N/A'
                            }

                        </div>

                    </div>

                `;

            }
        );


        /* ============================================================
           4B. AGENCY HOTEL REQUEST CARDS
           ============================================================ */

        (agencyHotelRequests || [])
            .forEach(
                req => {

                    const status =
                        String(
                            req.status ||
                            'pending'
                        ).toLowerCase();


                    const paymentStatus =
                        String(
                            req.payment_status ||
                            'unpaid'
                        ).toLowerCase();


                    const isPending =
                        status === 'pending';


                    const isApproved =
                        status === 'approved' ||
                        status === 'confirmed';


                    const isCancelled =
                        status === 'cancelled' ||
                        status === 'cancelled_by_customer';


                    const isDenied =
                        status === 'denied' ||
                        status === 'rejected';


                    const isPaid =
                        paymentStatus === 'paid' ||
                        paymentStatus === 'success' ||
                        paymentStatus === 'completed';


                    html += `

                        <div style="
                            background:white;
                            padding:22px;
                            border-radius:15px;
                            border-left:6px solid ${
                                isCancelled || isDenied
                                    ? '#e74c3c'
                                    : isApproved
                                        ? '#3498db'
                                        : '#ff9f43'
                            };
                            margin-bottom:18px;
                            box-shadow:
                                0 3px 12px
                                rgba(0,0,0,0.05);
                        ">

                            <div style="
                                display:flex;
                                justify-content:
                                    space-between;
                                align-items:
                                    flex-start;
                                gap:15px;
                            ">

                                <div>

                                    <span style="
                                        display:inline-block;
                                        background:#ebf5fb;
                                        color:#2980b9;
                                        padding:4px 10px;
                                        border-radius:8px;
                                        font-size:10px;
                                        font-weight:bold;
                                    ">
                                        ${
                                            String(
                                                req.requester_type ||
                                                'agency'
                                            ).toUpperCase()
                                        }
                                        HOTEL REQUEST
                                    </span>


                                    <h3 style="
                                        margin:10px 0 5px;
                                        color:#2d3436;
                                    ">
                                        ${
                                            req.rooms?.room_type ||
                                            'Room Request'
                                        }
                                    </h3>


                                    <div style="
                                        font-size:13px;
                                        color:#636e72;
                                    ">
                                        Requester:
                                        <b>
                                            ${
                                                req.agency_contact ||
                                                req.requester_type ||
                                                'Agency'
                                            }
                                        </b>
                                    </div>

                                </div>


                                <div style="
                                    text-align:right;
                                ">

                                    <div style="
                                        font-weight:bold;
                                        color:#2ecc71;
                                        font-size:19px;
                                    ">
                                        ₹${
                                            Number(
                                                req.total_amount ||
                                                0
                                            ).toLocaleString(
                                                'en-IN'
                                            )
                                        }
                                    </div>

                                    <div style="
                                        margin-top:5px;
                                        font-size:10px;
                                        font-weight:bold;
                                        color:${
                                            isCancelled || isDenied
                                                ? '#e74c3c'
                                                : isApproved
                                                    ? '#3498db'
                                                    : '#ff9f43'
                                        };
                                    ">
                                        ${status.toUpperCase()}
                                    </div>

                                </div>

                            </div>


                            <div style="
                                margin-top:15px;
                                background:#f8f9fa;
                                padding:14px;
                                border-radius:9px;
                                font-size:13px;
                            ">

                                📅
                                <b>Check-in:</b>
                                ${
                                    req.check_in ||
                                    'N/A'
                                }

                                &nbsp;&nbsp;

                                📅
                                <b>Check-out:</b>
                                ${
                                    req.check_out ||
                                    'N/A'
                                }

                                <br><br>

                                🚪
                                <b>Rooms:</b>
                                ${
                                    req.quantity ||
                                    0
                                }

                                <br><br>

                                💳
                                <b>Payment:</b>
                                ${
                                    paymentStatus.toUpperCase()
                                }

                            </div>


                            ${
                                req.agency_contact
                                ? `

                                <div style="
                                    margin-top:12px;
                                    font-size:13px;
                                    color:#555;
                                ">
                                    👤 <b>Agency:</b>
                                    ${req.agency_contact}
                                </div>

                                `
                                : ''
                            }


                            <!-- AGENCY APPROVED -->

                            ${
                                isApproved &&
                                !isCancelled
                                ? `

                                <div style="
                                    margin-top:15px;
                                    background:#f0fff4;
                                    color:#27ae60;
                                    padding:13px;
                                    border-radius:8px;
                                ">

                                    ${
                                        isPaid
                                        ? '✅ PAYMENT CONFIRMED'
                                        : '✅ REQUEST ACCEPTED'
                                    }

                                    <div style="
                                        margin-top:5px;
                                    ">

                                        ${
                                            req.payment_details
                                            ? `
                                                Payment instructions:
                                                <b>
                                                    ${
                                                        req.payment_details
                                                    }
                                                </b>
                                            `
                                            : (
                                                isPaid
                                                ? 'Agency payment has been confirmed.'
                                                : 'Request accepted.'
                                            )
                                        }

                                    </div>

                                </div>

                                `
                                : ''
                            }


                            <!-- AGENCY CANCELLATION / DENIAL -->

                            ${
                                isCancelled || isDenied
                                ? `

                                <div style="
                                    margin-top:15px;
                                    background:#fff5f5;
                                    color:#c0392b;
                                    padding:13px;
                                    border-radius:8px;
                                    border:1px solid #ff7675;
                                ">

                                    ${
                                        isCancelled
                                        ? '🚫 REQUEST CANCELLED'
                                        : '❌ REQUEST DENIED'
                                    }

                                    <div style="
                                        margin-top:5px;
                                        line-height:1.6;
                                    ">
                                        ${
                                            req.cancellation_reason ||
                                            req.owner_message ||
                                            (
                                                isCancelled
                                                ? 'This hotel request was cancelled.'
                                                : 'This hotel request was denied.'
                                            )
                                        }
                                    </div>

                                    ${
                                        req.cancelled_at
                                        ? `
                                        <div style="
                                            margin-top:7px;
                                            font-size:11px;
                                            color:#777;
                                        ">
                                            Cancelled at:
                                            ${
                                                new Date(
                                                    req.cancelled_at
                                                ).toLocaleString(
                                                    'en-IN'
                                                )
                                            }
                                        </div>
                                        `
                                        : ''
                                    }

                                </div>

                                `
                                : ''
                            }


                            <!-- APPROVE / DENY -->

                            ${
                                isPending
                                ? `

                                <div style="
                                    display:flex;
                                    gap:10px;
                                    margin-top:18px;
                                ">

                                    <button
                                        onclick="
                                            processAgencyHotelRequestFromArrivals(
                                                '${req.request_id}',
                                                'approve'
                                            )
                                        "
                                        style="
                                            flex:1;
                                            background:#2ecc71;
                                            color:white;
                                            border:none;
                                            padding:12px;
                                            border-radius:8px;
                                            font-weight:bold;
                                            cursor:pointer;
                                        "
                                    >
                                        ✅ APPROVE
                                    </button>


                                    <button
                                        onclick="
                                            processAgencyHotelRequestFromArrivals(
                                                '${req.request_id}',
                                                'deny'
                                            )
                                        "
                                        style="
                                            flex:1;
                                            background:#e74c3c;
                                            color:white;
                                            border:none;
                                            padding:12px;
                                            border-radius:8px;
                                            font-weight:bold;
                                            cursor:pointer;
                                        "
                                    >
                                        ❌ DENY
                                    </button>

                                </div>

                                `
                                : ''
                            }


                            <div style="
                                margin-top:15px;
                                padding-top:10px;
                                border-top:1px solid #eee;
                                font-size:11px;
                                color:#999;
                            ">

                                Request ID:
                                ${
                                    req.request_id
                                        ? String(
                                            req.request_id
                                        ).slice(0,8)
                                        : 'N/A'
                                }

                            </div>

                        </div>

                    `;

                }
            );


        /* ============================================================
           5. EMPTY STATE
           ============================================================ */

        if (!html) {

            list.innerHTML = `
                <div style="
                    background:white;
                    padding:40px;
                    border-radius:15px;
                    text-align:center;
                    color:#777;
                ">

                    <h3>
                        No hotel booking requests yet.
                    </h3>

                    <p>
                        Customer and agency hotel requests
                        will appear here.
                    </p>

                </div>
            `;

        } else {

            list.innerHTML =
                html;

        }

    } catch (err) {

        console.error(
            "Arrivals & Payout Error:",
            err
        );

        list.innerHTML = `
            <div style="
                background:#fff5f5;
                color:#c0392b;
                padding:20px;
                border-radius:10px;
            ">

                ❌ Failed to load Arrivals & Payout:

                ${err.message}

            </div>
        `;

    }
}
// 12. STYLES
const styleTag = document.createElement('style');
styleTag.innerHTML = `
    body { margin:0; font-family: 'Inter', sans-serif; }
    .nav-item { padding:15px; cursor:pointer; border-radius:8px; margin-bottom:5px; transition: 0.3s; font-size:14px; }
    .nav-item:hover { background: #4b5563; color: #ff9f43; }
    input, select, textarea { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #dfe6e9; border-radius: 12px; box-sizing:border-box; outline:none; font-size:14px; }
    .card { border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    button { cursor: pointer; border: none; border-radius: 10px; font-weight: bold; transition: 0.2s; }
    button:hover { opacity: 0.8; transform: translateY(-1px); }
    .modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:1000; display:flex; justify-content:center; align-items:center; padding:20px; }
    .modal-content { background:white; padding:30px; max-width:600px; width:100%; max-height:90vh; overflow-y:auto; }
`;
document.head.appendChild(styleTag); 
initApp();
/* =========================================================================
   🏨 HOTEL DASHBOARD — BOOKING REQUEST ITEM
   CUSTOMER + AGENCY REQUESTS
   ========================================================================= */

window.openHotelBookingRequestSection = async function () {

    const client = getClient();

    if (!client) {
        console.error("Supabase client not available.");
        return;
    }

    const userResult =
        await client.auth.getUser();

    const user =
        userResult?.data?.user;

    if (!user) {
        alert("Please login first.");
        return;
    }

    /*
     * IMPORTANT:
     * Existing Hotel Dashboard ka actual main content container:
     *
     *     #hotel-main-content
     *
     * Isi container mein baaki hotel tabs bhi render hote hain.
     */

    const container =
        document.getElementById(
            'hotel-main-content'
        );

    if (!container) {

        console.error(
            "Hotel dashboard content container not found: #hotel-main-content"
        );

        alert(
            "Hotel dashboard content container not found."
        );

        return;
    }

    /*
     * Existing hotel dashboard ke content area
     * ko Booking Request screen mein render karega.
     */

    await window.renderHotelBookingRequests(
        container,
        user
    );
};


/* =========================================================================
   🏨 HOTEL DASHBOARD — BOOKING REQUEST ITEM
   ========================================================================= */

window.hotelBookingRequestItemHTML = `

    <div
        onclick="openHotelBookingRequestSection()"
        style="
            cursor:pointer;
            background:white;
            padding:22px;
            border-radius:15px;
            box-shadow:0 4px 15px rgba(0,0,0,0.08);
            border-left:5px solid #3498db;
            transition:0.2s;
            margin-bottom:15px;
        "
    >

        <div style="
            font-size:32px;
            margin-bottom:10px;
        ">
            🏨
        </div>

        <h3 style="
            margin:0;
            color:#2d3436;
        ">
            Booking Request
        </h3>

        <p style="
            margin:7px 0 0;
            color:#7f8c8d;
            font-size:13px;
        ">
            View and manage customer and agency booking requests
        </p>

    </div>

`;


/* =========================================================================
   🏨 HOTEL DASHBOARD — BOOKING REQUEST
   CUSTOMER + AGENCY REQUESTS
   Source: hotel_bookings table
   ========================================================================= */


/* =========================================================================
   1. BOOKING REQUEST TAB
   ========================================================================= */

window.openHotelBookingRequestSection = async function () {

    const client =
        getClient();

    if (!client) {

        console.error(
            "Supabase client not available."
        );

        return;
    }


    const {
        data: {
            user
        }
    } =
        await client.auth.getUser();


    if (!user) {

        alert(
            "Please login first."
        );

        return;
    }


    /*
       IMPORTANT FIX

       Existing Hotel Dashboard mein
       actual content container:

       #hotel-main-content
    */

    const container =
        document.getElementById(
            'hotel-main-content'
        );


    if (!container) {

        console.error(
            "Hotel dashboard content container not found: #hotel-main-content"
        );

        alert(
            "Hotel dashboard content container not found."
        );

        return;
    }


    /*
       Existing dashboard ke andar hi
       Booking Request render hoga.
    */

    container.style.display =
        'block';


    await window.renderHotelBookingRequests(
        container,
        user
    );

};


/* =========================================================================
   2. RENDER BOOKING REQUESTS
   ========================================================================= */

window.renderHotelBookingRequests =
    async function (
        container,
        user
    ) {

        const client =
            getClient();


        if (!container) {

            console.error(
                "Booking Request container not found."
            );

            return;
        }


        container.innerHTML = `

            <div style="
                max-width:1100px;
                margin:auto;
            ">

                <h1 style="
                    margin:0;
                    color:#1e272e;
                ">
                    🏨 Booking Requests
                </h1>


                <p style="
                    color:#7f8c8d;
                    margin-top:6px;
                    margin-bottom:25px;
                ">
                    Manage customer and agency hotel booking requests.
                </p>


                <div id="hotel-booking-request-list">

                    Loading booking requests...

                </div>

            </div>

        `;


        const list =
            document.getElementById(
                'hotel-booking-request-list'
            );


        if (!list) {
            return;
        }


        try {

            /* =============================================================
               1. HOTEL PROFILE
               ============================================================= */

            const {
                data: hotel,
                error: hotelError
            } =
                await client
                    .from('hotels')
                    .select('*')
                    .eq(
                        'owner_id',
                        user.id
                    )
                    .maybeSingle();


            if (hotelError) {
                throw hotelError;
            }


            if (!hotel) {

                list.innerHTML = `

                    <div style="
                        background:white;
                        padding:30px;
                        border-radius:15px;
                        color:#e74c3c;
                    ">

                        Hotel profile not found.

                    </div>

                `;

                return;
            }


            const hotelId =
                hotel.hotel_id ||
                hotel.id;


            /* =============================================================
               2. FETCH HOTEL BOOKINGS
               ============================================================= */

            const {
                data: bookings,
                error: bookingError
            } =
                await client
                    .from('hotel_bookings')
                    .select('*')
                    .order(
                        'created_at',
                        {
                            ascending:false
                        }
                    );


            if (bookingError) {
                throw bookingError;
            }


            /* =============================================================
               3. ROOM CATEGORY MAPPING
               ============================================================= */

            const categoryIds =
                (bookings || [])
                    .map(
                        booking =>
                            booking.room_category_id
                    )
                    .filter(Boolean);


            let categories = [];


            if (
                categoryIds.length > 0
            ) {

                const {
                    data: categoryData,
                    error: categoryError
                } =
                    await client
                        .from('room_categories')
                        .select(
                            'id,hotel_id,room_type'
                        )
                        .in(
                            'id',
                            categoryIds
                        );


                if (categoryError) {
                    throw categoryError;
                }


                categories =
                    categoryData || [];

            }


            const categoryMap = {};


            categories.forEach(
                category => {

                    categoryMap[
                        category.id
                    ] =
                        category;

                }
            );


            /* =============================================================
               4. ONLY THIS HOTEL'S BOOKINGS
               ============================================================= */

            const hotelBookings =
                (bookings || [])
                    .filter(
                        booking => {

                            const category =
                                categoryMap[
                                    booking.room_category_id
                                ];


                            const directHotelMatch =
                                booking.hotel_id &&
                                String(
                                    booking.hotel_id
                                ) ===
                                String(
                                    hotelId
                                );


                            const categoryHotelMatch =
                                category &&
                                String(
                                    category.hotel_id
                                ) ===
                                String(
                                    hotelId
                                );


                            return (
                                directHotelMatch ||
                                categoryHotelMatch
                            );

                        }
                    );


            /* =============================================================
               5. EMPTY STATE
               ============================================================= */

            if (
                hotelBookings.length === 0
            ) {

                list.innerHTML = `

                    <div style="
                        background:white;
                        padding:45px;
                        border-radius:15px;
                        text-align:center;
                        box-shadow:
                            0 4px 15px
                            rgba(0,0,0,0.05);
                    ">

                        <div style="
                            font-size:50px;
                        ">
                            🏨
                        </div>


                        <h3 style="
                            color:#2d3436;
                            margin-bottom:8px;
                        ">
                            No Booking Requests
                        </h3>


                        <p style="
                            color:#777;
                        ">
                            Customer and agency booking requests
                            will appear here.
                        </p>

                    </div>

                `;

                return;
            }


            /* =============================================================
               6. BUILD REQUEST CARDS
               ============================================================= */

            list.innerHTML =
                hotelBookings
                    .map(
                        booking => {

                            const status =
                                String(
                                    booking.booking_status ||
                                    'pending'
                                ).toLowerCase();


                            const requesterType =
                                String(
                                    booking.requester_type ||
                                    (
                                        booking.agency_id
                                            ? 'agency'
                                            : 'customer'
                                    )
                                ).toLowerCase();


                            const isPending =
                                status === 'pending';


                            const isApproved =
                                status === 'approved' ||
                                status === 'confirmed';


                            const isDenied =
                                status === 'denied' ||
                                status === 'rejected';


                            const isCancelled =
                                status === 'cancelled' ||
                                status ===
                                'cancelled_by_customer';


                            const amount =
                                Number(
                                    booking.total_amount ||
                                    0
                                );


                            const rooms =
                                Number(
                                    booking.rooms_booked ||
                                    booking.room_booked ||
                                    0
                                );


                            const totalNights =
                                Number(
                                    booking.total_nights ||
                                    0
                                );


                            let borderColor =
                                '#ff9f43';


                            if (isApproved) {

                                borderColor =
                                    '#3498db';

                            }


                            if (isDenied) {

                                borderColor =
                                    '#e74c3c';

                            }


                            if (isCancelled) {

                                borderColor =
                                    '#636e72';

                            }


                            const roomType =
                                booking.room_type ||
                                categoryMap[
                                    booking.room_category_id
                                ]?.room_type ||
                                'Room Booking';


                            return `

                                <div style="
                                    background:white;
                                    padding:24px;
                                    border-radius:15px;
                                    border-left:
                                        6px solid
                                        ${borderColor};
                                    margin-bottom:18px;
                                    box-shadow:
                                        0 4px 15px
                                        rgba(0,0,0,0.05);
                                ">


                                    <!-- REQUESTER TYPE -->

                                    <span style="
                                        display:inline-block;
                                        background:
                                            ${
                                                requesterType ===
                                                'agency'
                                                    ? '#ebf5fb'
                                                    : '#e8f5e9'
                                            };
                                        color:
                                            ${
                                                requesterType ===
                                                'agency'
                                                    ? '#2980b9'
                                                    : '#2e7d32'
                                            };
                                        padding:6px 12px;
                                        border-radius:12px;
                                        font-size:10px;
                                        font-weight:bold;
                                    ">

                                        ${
                                            requesterType ===
                                            'agency'
                                                ? '🏢 AGENCY REQUEST'
                                                : '👤 CUSTOMER REQUEST'
                                        }

                                    </span>


                                    <!-- HEADER -->

                                    <div style="
                                        display:flex;
                                        justify-content:space-between;
                                        align-items:flex-start;
                                        gap:20px;
                                        flex-wrap:wrap;
                                        margin-top:12px;
                                    ">

                                        <div>

                                            <h3 style="
                                                margin:
                                                    0 0 7px;
                                                color:#2d3436;
                                            ">

                                                ${
                                                    booking.hotel_name ||
                                                    'Registered Hotel Booking'
                                                }

                                            </h3>


                                            <div style="
                                                color:#636e72;
                                                font-size:13px;
                                            ">

                                                ${roomType}

                                            </div>

                                        </div>


                                        <div style="
                                            text-align:right;
                                        ">

                                            <div style="
                                                font-size:22px;
                                                font-weight:bold;
                                                color:#27ae60;
                                            ">

                                                ₹${amount.toLocaleString(
                                                    'en-IN'
                                                )}

                                            </div>


                                            <div style="
                                                margin-top:6px;
                                                display:inline-block;
                                                background:#f1f2f6;
                                                padding:6px 10px;
                                                border-radius:8px;
                                                font-size:10px;
                                                font-weight:bold;
                                                color:${borderColor};
                                            ">

                                                ${status.toUpperCase()}

                                            </div>

                                        </div>

                                    </div>


                                    <!-- BOOKING DETAILS -->

                                    <div style="
                                        margin-top:20px;
                                        padding:18px;
                                        background:#f8f9fa;
                                        border-radius:10px;
                                        display:grid;
                                        grid-template-columns:
                                            repeat(
                                                auto-fit,
                                                minmax(180px,1fr)
                                            );
                                        gap:15px;
                                    ">


                                        <div>

                                            <div style="
                                                font-size:10px;
                                                color:#888;
                                                font-weight:bold;
                                            ">
                                                CHECK-IN DATE
                                            </div>


                                            <div style="
                                                margin-top:5px;
                                                color:#2d3436;
                                                font-weight:bold;
                                            ">

                                                📅
                                                ${
                                                    booking.check_in_date ||
                                                    'N/A'
                                                }

                                            </div>

                                        </div>


                                        <div>

                                            <div style="
                                                font-size:10px;
                                                color:#888;
                                                font-weight:bold;
                                            ">
                                                CHECK-OUT DATE
                                            </div>


                                            <div style="
                                                margin-top:5px;
                                                color:#2d3436;
                                                font-weight:bold;
                                            ">

                                                📅
                                                ${
                                                    booking.check_out_date ||
                                                    'N/A'
                                                }

                                            </div>

                                        </div>


                                        <div>

                                            <div style="
                                                font-size:10px;
                                                color:#888;
                                                font-weight:bold;
                                            ">
                                                ROOMS BOOKED
                                            </div>


                                            <div style="
                                                margin-top:5px;
                                                color:#2d3436;
                                                font-weight:bold;
                                            ">

                                                🛏️ ${rooms}

                                            </div>

                                        </div>


                                        <div>

                                            <div style="
                                                font-size:10px;
                                                color:#888;
                                                font-weight:bold;
                                            ">
                                                TOTAL NIGHTS
                                            </div>


                                            <div style="
                                                margin-top:5px;
                                                color:#2d3436;
                                                font-weight:bold;
                                            ">

                                                🌙 ${totalNights}

                                            </div>

                                        </div>


                                        <div>

                                            <div style="
                                                font-size:10px;
                                                color:#888;
                                                font-weight:bold;
                                            ">
                                                TOTAL AMOUNT
                                            </div>


                                            <div style="
                                                margin-top:5px;
                                                color:#27ae60;
                                                font-weight:bold;
                                            ">

                                                ₹${amount.toLocaleString(
                                                    'en-IN'
                                                )}

                                            </div>

                                        </div>

                                    </div>


                                    <!-- CUSTOMER / AGENCY -->

                                    ${
                                        booking.customer_email ||
                                        booking.agency_contact ||
                                        booking.customer_id ||
                                        booking.agency_id

                                        ? `

                                        <div style="
                                            margin-top:15px;
                                            padding:12px 15px;
                                            background:#fafafa;
                                            border-radius:9px;
                                            font-size:13px;
                                            color:#555;
                                        ">

                                            <b>

                                                ${
                                                    requesterType ===
                                                    'agency'
                                                        ? '🏢 Agency'
                                                        : '👤 Customer'
                                                }

                                            </b>


                                            ${
                                                booking.customer_email
                                                    ? `

                                                    <span style="
                                                        margin-left:8px;
                                                    ">

                                                        ${booking.customer_email}

                                                    </span>

                                                    `
                                                    : ''
                                            }


                                            ${
                                                booking.agency_contact
                                                    ? `

                                                    <span style="
                                                        margin-left:8px;
                                                    ">

                                                        ${booking.agency_contact}

                                                    </span>

                                                    `
                                                    : ''
                                            }

                                        </div>

                                        `
                                        : ''
                                    }


                                    <!-- APPROVED -->

                                    ${
                                        isApproved

                                            ? `

                                            <div style="
                                                margin-top:18px;
                                                background:#f0fff4;
                                                border:
                                                    1px solid #2ecc71;
                                                padding:15px;
                                                border-radius:10px;
                                                color:#27ae60;
                                            ">

                                                <b>
                                                    ✅ BOOKING APPROVED
                                                </b>


                                                ${
                                                    booking.payment_contact_number

                                                        ? `

                                                        <div style="
                                                            margin-top:7px;
                                                            color:#444;
                                                        ">

                                                            📞 Payment Contact:

                                                            <b>

                                                                ${
                                                                    booking.payment_contact_number
                                                                }

                                                            </b>

                                                        </div>

                                                        `
                                                        : ''
                                                }

                                            </div>

                                            `
                                            : ''
                                    }


                                    <!-- DENIED -->

                                    ${
                                        isDenied

                                            ? `

                                            <div style="
                                                margin-top:18px;
                                                background:#fff5f5;
                                                border:
                                                    1px solid #ff7675;
                                                padding:15px;
                                                border-radius:10px;
                                                color:#c0392b;
                                            ">

                                                <b>
                                                    ❌ BOOKING DENIED
                                                </b>

                                            </div>

                                            `
                                            : ''
                                    }


                                    <!-- CANCELLED -->

                                    ${
                                        isCancelled

                                            ? `

                                            <div style="
                                                margin-top:18px;
                                                background:#f5f5f5;
                                                border:
                                                    1px solid #b2bec3;
                                                padding:15px;
                                                border-radius:10px;
                                                color:#636e72;
                                            ">

                                                <b>
                                                    🚫 BOOKING CANCELLED
                                                </b>

                                            </div>

                                            `
                                            : ''
                                    }


                                    <!-- ACCEPT / DENY -->

                                    ${
                                        isPending

                                            ? `

                                            <div style="
                                                display:flex;
                                                gap:10px;
                                                margin-top:20px;
                                            ">


                                                <button
                                                    onclick="
                                                        openHotelBookingApproval(
                                                            '${booking.id}'
                                                        )
                                                    "
                                                    style="
                                                        flex:1;
                                                        background:#2ecc71;
                                                        color:white;
                                                        border:none;
                                                        padding:13px;
                                                        border-radius:8px;
                                                        font-weight:bold;
                                                        cursor:pointer;
                                                    "
                                                >

                                                    ✅ ACCEPT

                                                </button>


                                                <button
                                                    onclick="
                                                        denyHotelBookingRequest(
                                                            '${booking.id}'
                                                        )
                                                    "
                                                    style="
                                                        flex:1;
                                                        background:#e74c3c;
                                                        color:white;
                                                        border:none;
                                                        padding:13px;
                                                        border-radius:8px;
                                                        font-weight:bold;
                                                        cursor:pointer;
                                                    "
                                                >

                                                    ❌ DENY

                                                </button>

                                            </div>

                                            `
                                            : ''
                                    }


                                    <div style="
                                        margin-top:15px;
                                        padding-top:12px;
                                        border-top:1px solid #eee;
                                        font-size:11px;
                                        color:#999;
                                    ">

                                        Booking ID:

                                        ${
                                            booking.id
                                                ? String(
                                                    booking.id
                                                ).slice(0,8)
                                                : 'N/A'
                                        }

                                    </div>


                                </div>

                            `;

                        }
                    )
                    .join('');


        } catch (err) {

            console.error(
                "Hotel Booking Request Error:",
                err
            );


            list.innerHTML = `

                <div style="
                    background:#fff5f5;
                    color:#c0392b;
                    padding:20px;
                    border-radius:10px;
                ">

                    ❌ Failed to load booking requests.

                    <div style="
                        margin-top:7px;
                    ">

                        ${err.message}

                    </div>

                </div>

            `;

        }

    };


/* =========================================================================
   3. ACCEPT BOOKING
   ========================================================================= */

window.openHotelBookingApproval =
    async function (
        bookingId
    ) {

        const client =
            getClient();


        const paymentNumber =
            window.prompt(
                "Enter customer/agency contact number for payment:"
            );


        if (
            paymentNumber === null
        ) {
            return;
        }


        const cleanNumber =
            String(
                paymentNumber
            ).trim();


        if (!cleanNumber) {

            alert(
                "Please enter a valid contact number."
            );

            return;
        }


        const confirmApproval =
            window.confirm(
                "Confirm this booking as APPROVED?"
            );


        if (!confirmApproval) {
            return;
        }


        try {

            const {
                error
            } =
                await client
                    .from('hotel_bookings')
                    .update({

                        booking_status:
                            'approved',

                        payment_contact_number:
                            cleanNumber

                    })
                    .eq(
                        'id',
                        bookingId
                    );


            if (error) {
                throw error;
            }


            alert(
                "Booking approved successfully."
            );


            await openHotelBookingRequestSection();


        } catch (error) {

            console.error(
                "Booking approval failed:",
                error
            );


            alert(
                "Booking approval failed: " +
                error.message
            );

        }

    };


/* =========================================================================
   4. DENY BOOKING
   ========================================================================= */

window.denyHotelBookingRequest =
    async function (
        bookingId
    ) {

        const confirmDeny =
            window.confirm(
                "Are you sure you want to DENY this booking request?"
            );


        if (!confirmDeny) {
            return;
        }


        const client =
            getClient();


        try {

            const {
                error
            } =
                await client
                    .from('hotel_bookings')
                    .update({

                        booking_status:
                            'denied'

                    })
                    .eq(
                        'id',
                        bookingId
                    );


            if (error) {
                throw error;
            }


            alert(
                "Booking request denied."
            );


            await openHotelBookingRequestSection();


        } catch (error) {

            console.error(
                "Booking deny failed:",
                error
            );


            alert(
                "Booking deny failed: " +
                error.message
            );

        }

    };

/* =========================================================================
   🏨 ACCEPT HOTEL BOOKING — PAYMENT CONTACT NUMBER
   ========================================================================= */

window.openHotelBookingApproval =
    function (
        bookingId
    ) {

        let modal =
            document.getElementById(
                'hotel-booking-approval-modal'
            );


        if (modal) {
            modal.remove();
        }


        modal =
            document.createElement(
                'div'
            );


        modal.id =
            'hotel-booking-approval-modal';


        modal.style = `
            position:fixed;
            inset:0;
            background:rgba(0,0,0,0.75);
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:100000;
            padding:20px;
        `;


        modal.innerHTML = `

            <div style="
                width:100%;
                max-width:480px;
                background:white;
                border-radius:18px;
                padding:28px;
                box-shadow:
                    0 20px 50px
                    rgba(0,0,0,0.3);
            ">

                <h2 style="
                    margin-top:0;
                    color:#27ae60;
                ">
                    ✅ Accept Booking Request
                </h2>


                <p style="
                    color:#666;
                    line-height:1.5;
                    font-size:14px;
                ">
                    Enter the contact number that the customer/agency
                    should use for payment.
                </p>


                <label style="
                    display:block;
                    margin-top:18px;
                    font-size:12px;
                    font-weight:bold;
                    color:#555;
                ">
                    PAYMENT CONTACT NUMBER
                </label>


                <input
                    id="hotel-booking-payment-contact"
                    type="tel"
                    placeholder="Enter payment contact number"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        margin-top:7px;
                        padding:12px;
                        border:1px solid #ddd;
                        border-radius:8px;
                        font-size:14px;
                        outline:none;
                    "
                >


                <div style="
                    display:flex;
                    gap:10px;
                    margin-top:22px;
                ">

                    <button
                        onclick="
                            confirmHotelBookingApproval(
                                '${bookingId}'
                            )
                        "
                        style="
                            flex:1;
                            background:#2ecc71;
                            color:white;
                            border:none;
                            padding:12px;
                            border-radius:8px;
                            font-weight:bold;
                            cursor:pointer;
                        "
                    >
                        CONFIRM APPROVAL
                    </button>


                    <button
                        onclick="
                            document
                                .getElementById(
                                    'hotel-booking-approval-modal'
                                )
                                .remove()
                        "
                        style="
                            flex:1;
                            background:#eee;
                            color:#444;
                            border:none;
                            padding:12px;
                            border-radius:8px;
                            font-weight:bold;
                            cursor:pointer;
                        "
                    >
                        CANCEL
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        setTimeout(
            function() {

                const input =
                    document.getElementById(
                        'hotel-booking-payment-contact'
                    );


                if (input) {
                    input.focus();
                }

            },
            100
        );

    };


/* =========================================================================
   🏨 CONFIRM HOTEL BOOKING APPROVAL
   ========================================================================= */

window.confirmHotelBookingApproval =
    async function (
        bookingId
    ) {

        const input =
            document.getElementById(
                'hotel-booking-payment-contact'
            );


        if (!input) {

            alert(
                "Payment contact field not found."
            );

            return;
        }


        const paymentContact =
            input.value.trim();


        if (!paymentContact) {

            alert(
                "Please enter the payment contact number."
            );

            input.focus();

            return;
        }


        const finalConfirm =
            confirm(
                "Approve this hotel booking request?\n\n" +
                "Payment Contact Number:\n" +
                paymentContact +
                "\n\n" +
                "Click OK to approve."
            );


        if (!finalConfirm) {
            return;
        }


        const client =
            getClient();


        try {

            const {
                data: {
                    user
                }
            } =
                await client.auth.getUser();


            if (!user) {

                alert(
                    "Please login first."
                );

                return;
            }


            const {
                error
            } =
                await client
                    .from('hotel_bookings')
                    .update({

                        booking_status:
                            'approved',

                        payment_contact_number:
                            paymentContact

                    })
                    .eq(
                        'id',
                        bookingId
                    );


            if (error) {
                throw error;
            }


            const modal =
                document.getElementById(
                    'hotel-booking-approval-modal'
                );


            if (modal) {
                modal.remove();
            }


            alert(
                "Booking approved successfully."
            );


            await openHotelBookingRequestSection();


        } catch (error) {

            console.error(
                "Hotel booking approval error:",
                error
            );


            alert(
                "Booking approval failed: " +
                error.message
            );

        }

    };

          
/* =========================================================================
   🏨 DENY HOTEL BOOKING REQUEST
   ========================================================================= */

window.denyHotelBookingRequest =
    async function(bookingId) {

        const confirmed =
            confirm(
                "Are you sure you want to deny this booking request?"
            );


        if (!confirmed) {
            return;
        }


        const client =
            getClient();


        try {

            const {
                data: {
                    user
                }
            } =
                await client.auth.getUser();


            if (!user) {

                alert(
                    "Please login first."
                );

                return;
            }


            const {
                data: booking,
                error: fetchError
            } =
                await client
                    .from('hotel_bookings')
                    .select('*')
                    .eq(
                        'id',
                        bookingId
                    )
                    .single();


            if (fetchError) {
                throw fetchError;
            }


            if (!booking) {

                alert(
                    "Booking request not found."
                );

                return;
            }


            const currentStatus =
                String(
                    booking.booking_status ||
                    'pending'
                ).toLowerCase();


            if (currentStatus !== 'pending') {

                alert(
                    "This booking request has already been processed."
                );

                return;
            }


            const {
                error: updateError
            } =
                await client
                    .from('hotel_bookings')
                    .update({

                        booking_status:
                            'denied',

                        owner_message:
                            'This hotel booking request has been ' +
                            'denied by the hotel owner.'

                    })
                    .eq(
                        'id',
                        bookingId
                    );


            if (updateError) {
                throw updateError;
            }


            alert(
                "❌ Booking request denied successfully."
            );


            const container =
                document.querySelector(
                    '#hotel-booking-request-list'
                )?.parentElement;


            if (container) {

                window.renderHotelBookingRequests(
                    container,
                    user
                );

            }


        } catch (err) {

            console.error(
                "Hotel Booking Denial Error:",
                err
            );


            alert(
                "Booking denial failed: " +
                err.message
            );

        }

    };
/* =========================================================================
   🏨 OPEN BOOKING REQUEST SECTION
   ========================================================================= */

window.openHotelBookingRequestSection = async function() {

    const client = getClient();

    if (!client) {
        alert("Database connection error.");
        return;
    }

    const {
        data: {
            user
        }
    } = await client.auth.getUser();

    if (!user) {
        alert("Please login first.");
        return;
    }


    const container =
        document.getElementById(
            'hotel-main-content'
        );


    if (!container) {

        console.error(
            "hotel-main-content not found."
        );

        alert(
            "Hotel dashboard content container not found."
        );

        return;
    }


    await window.renderHotelBookingRequests(
        container,
        user
    );

};
/* =========================================================================
   🏨 AGENCY HOTEL BOOKING REQUESTS
   Shows Agency's own Registered Hotel booking requests
   Source: hotel_bookings table ONLY
   ========================================================================= */

window.renderAgencyHotelBookingRequests = async function () {

    try {

        const client = getClient();

        if (!client) {
            alert("Database connection error.");
            return;
        }

        const {
            data: {
                user
            },
            error: authError
        } = await client.auth.getUser();

        if (authError || !user) {
            alert("Please login again.");
            return;
        }

        const container =
            document.getElementById('main-content');

        if (!container) {
            console.error(
                "Agency main content container not found."
            );

            alert(
                "Agency dashboard content container not found."
            );

            return;
        }

        /* ============================================================
           FETCH AGENCY'S HOTEL BOOKING REQUESTS
           hotel_bookings table ONLY
           ============================================================ */

        const {
            data: bookings,
            error
        } = await client
            .from('hotel_bookings')
            .select('*')
            .eq('customer_id', user.id)
            .order('created_at', {
                ascending: false
            });

        if (error) {
            console.error(
                "Agency hotel booking request error:",
                error
            );

            throw error;
        }

        /* ============================================================
           HEADER
           ============================================================ */

        container.innerHTML = `
            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:20px;
                gap:15px;
                flex-wrap:wrap;
            ">

                <div>
                    <h1 style="
                        margin:0;
                        color:#e67e22;
                    ">
                        📋 My Hotel Booking Requests
                    </h1>

                    <p style="
                        margin:6px 0 0;
                        color:#777;
                        font-size:14px;
                    ">
                        Track all your Registered Hotel booking requests
                    </p>
                </div>

                <button
                    onclick="showTab('hotels')"
                    style="
                        background:#f1f2f6;
                        color:#2d3436;
                        border:none;
                        padding:10px 18px;
                        border-radius:8px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    ← Back to Hotels
                </button>

            </div>

            <div id="agency-hotel-request-list"></div>
        `;

        const list =
            document.getElementById(
                'agency-hotel-request-list'
            );

        /* ============================================================
           NO REQUESTS
           ============================================================ */

        if (!bookings || bookings.length === 0) {

            list.innerHTML = `
                <div style="
                    background:white;
                    padding:40px;
                    border-radius:12px;
                    text-align:center;
                    color:#777;
                    box-shadow:0 2px 8px rgba(0,0,0,0.05);
                ">
                    <div style="
                        font-size:45px;
                        margin-bottom:10px;
                    ">
                        📋
                    </div>

                    <h3 style="
                        margin:0 0 8px;
                        color:#444;
                    ">
                        No Hotel Booking Requests
                    </h3>

                    <p style="margin:0;">
                        Your hotel booking requests will appear here.
                    </p>
                </div>
            `;

            return;
        }

        /* ============================================================
           RENDER ALL REQUESTS
           ============================================================ */

        list.innerHTML = bookings.map(booking => {

            const bookingStatus =
                String(
                    booking.booking_status || 'pending'
                ).toLowerCase();

            const paymentStatus =
                String(
                    booking.payment_status || 'unpaid'
                ).toLowerCase();

            let statusColor = '#f39c12';

            if (
                bookingStatus === 'approved' ||
                bookingStatus === 'confirmed'
            ) {
                statusColor = '#27ae60';
            }

            if (
                bookingStatus === 'denied' ||
                bookingStatus === 'cancelled'
            ) {
                statusColor = '#e74c3c';
            }

            let paymentColor = '#f39c12';

            if (paymentStatus === 'paid') {
                paymentColor = '#27ae60';
            }

            return `
                <div style="
                    background:white;
                    border-radius:14px;
                    padding:20px;
                    margin-bottom:18px;
                    border-left:5px solid ${statusColor};
                    box-shadow:0 3px 10px rgba(0,0,0,0.07);
                ">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:flex-start;
                        gap:15px;
                        flex-wrap:wrap;
                    ">

                        <div>

                            <h3 style="
                                margin:0 0 6px;
                                color:#2d3436;
                            ">
                                🏨 ${booking.hotel_name || 'Registered Hotel'}
                            </h3>

                            <div style="
                                color:#777;
                                font-size:13px;
                            ">
                                Booking ID:
                                ${booking.id || '-'}
                            </div>

                        </div>

                        <div style="
                            text-align:right;
                        ">

                            <div style="
                                display:inline-block;
                                background:${statusColor};
                                color:white;
                                padding:6px 12px;
                                border-radius:20px;
                                font-size:11px;
                                font-weight:bold;
                                text-transform:uppercase;
                            ">
                                ${bookingStatus}
                            </div>

                        </div>

                    </div>


                    <div style="
                        display:grid;
                        grid-template-columns:
                            repeat(auto-fit, minmax(150px, 1fr));
                        gap:12px;
                        margin-top:18px;
                        background:#f8f9fa;
                        padding:15px;
                        border-radius:10px;
                    ">

                        <div>
                            <small style="color:#888;">
                                CHECK-IN
                            </small>

                            <div style="
                                font-weight:bold;
                                margin-top:4px;
                            ">
                                📅 ${booking.check_in_date || '-'}
                            </div>
                        </div>


                        <div>
                            <small style="color:#888;">
                                CHECK-OUT
                            </small>

                            <div style="
                                font-weight:bold;
                                margin-top:4px;
                            ">
                                📅 ${booking.check_out_date || '-'}
                            </div>
                        </div>


                        <div>
                            <small style="color:#888;">
                                ROOMS
                            </small>

                            <div style="
                                font-weight:bold;
                                margin-top:4px;
                            ">
                                🛏️ ${booking.rooms_booked || 0}
                            </div>
                        </div>


                        <div>
                            <small style="color:#888;">
                                NIGHTS
                            </small>

                            <div style="
                                font-weight:bold;
                                margin-top:4px;
                            ">
                                🌙 ${booking.total_nights || 0}
                            </div>
                        </div>


                        <div>
                            <small style="color:#888;">
                                TOTAL AMOUNT
                            </small>

                            <div style="
                                font-weight:bold;
                                color:#27ae60;
                                margin-top:4px;
                            ">
                                ₹${Number(
                                    booking.total_amount || 0
                                ).toLocaleString('en-IN')}
                            </div>
                        </div>

                    </div>


                    <div style="
                        margin-top:15px;
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:10px;
                        flex-wrap:wrap;
                    ">

                        <div>
                            <strong>
                                Payment:
                            </strong>

                            <span style="
                                color:${paymentColor};
                                font-weight:bold;
                                text-transform:uppercase;
                            ">
                                ${paymentStatus}
                            </span>
                        </div>

                        ${
                            booking.payment_contact_number
                            ? `
                                <div style="
                                    font-size:13px;
                                    color:#555;
                                ">
                                    📞 Payment Contact:
                                    <strong>
                                        ${booking.payment_contact_number}
                                    </strong>
                                </div>
                            `
                            : ''
                        }

                    </div>


                    ${
                        booking.owner_message
                        ? `
                            <div style="
                                margin-top:15px;
                                padding:12px;
                                background:#fff8e1;
                                border-radius:8px;
                                font-size:13px;
                                color:#555;
                            ">
                                <strong>
                                    🏨 Hotel Message:
                                </strong>

                                <div style="
                                    margin-top:5px;
                                ">
                                    ${booking.owner_message}
                                </div>
                            </div>
                        `
                        : ''
                    }


                    ${
                        bookingStatus === 'denied'
                        ? `
                            <div style="
                                margin-top:15px;
                                padding:12px;
                                background:#fff0f0;
                                border-radius:8px;
                                color:#c0392b;
                                font-weight:bold;
                            ">
                                ❌ Your hotel booking request was denied.
                            </div>
                        `
                        : ''
                    }


                    ${
                        bookingStatus === 'approved'
                        ? `
                            <div style="
                                margin-top:15px;
                                padding:12px;
                                background:#effaf3;
                                border-radius:8px;
                                color:#27ae60;
                                font-weight:bold;
                            ">
                                ✅ Your hotel booking request has been approved.
                            </div>
                        `
                        : ''
                    }


                    ${
                        bookingStatus === 'cancelled'
                        ? `
                            <div style="
                                margin-top:15px;
                                padding:12px;
                                background:#fff0f0;
                                border-radius:8px;
                                color:#c0392b;
                                font-weight:bold;
                            ">
                                ❌ This hotel booking has been cancelled.
                            </div>
                        `
                        : ''
                    }

                </div>
            `;

        }).join('');

    } catch (err) {

        console.error(
            "Render Agency Hotel Booking Requests Error:",
            err
        );

        alert(
            "Failed to load hotel booking requests: " +
            err.message
        );
    }
};

      
