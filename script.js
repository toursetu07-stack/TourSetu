/* =========================================
   1. CONFIGURATION & GLOBAL STATE
   ========================================= */
const SUPABASE_URL = 'https://udfwcqrmksfyeigxgdws.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZndjcXJta3NmeWVpZ3hnZHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTIyNTQsImV4cCI6MjA4ODAyODI1NH0.zf1taGGbEszA0cKMwFw8rKBuT2OwYqUjF45MqZXaEBw';

let _supabase = null;
let isLoginMode = true;

const tourDestinations = [
  "Char Dham Yatra (Uttarakhand)", "Kedarnath (Uttarakhand)", "Badrinath (Uttarakhand)", 
  "Gangotri (Uttarakhand)", "Yamunotri (Uttarakhand)", "Vaishno Devi (Katra)", 
  "Jagarnath (Puri, Odisha)", "Somnath (Gujarat)", "Tirumala Venkateswara (Tirupati)", 
  "Ram Janmabhoomi (Ayodhya)", "Banke Bihari (Vrindavan)", "Prem Mandir (Vrindavan)", 
  "Ajmer Sharif Dargah (Rajasthan)", "Golden Temple (Amritsar)", "Basilica of Bom Jesus (Goa)"
];

const vehicleTypes = [
    { id: 'car4', name: '4 Seater Car', icon: '??' },
    { id: 'car6', name: '6 Seater SUV', icon: '??' },
    { id: 'car7', name: '7 Seater SUV', icon: '??' },
    { id: 'tempo', name: 'Tempo Traveler', icon: '??' },
    { id: 'bus', name: 'Luxury Bus', icon: '??' }
];

const locationData = {
 "Uttarakhand": ["Dehradun", "Rishikesh", "Haridwar", "Kashipur", "Rudpur", "Lalkuan", "Kichha", "Bareilly", "Pantnagar", "Lalpur", "Almora", "Nainital"],
  "Delhi": ["New Delhi", "Old Delhi", "Saket", "Dwarka"],
  "Punjab": ["Amritsar", "Ludhiana", "Patiala"],
  "Uttar Pradesh": ["Lucknow", "Ayodhya", "Vrindavan", "Varanasi", "Agra"]
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

window.toggleMode = function() { 
    isLoginMode = !isLoginMode; 
    const title = document.getElementById('form-title');
    const btn = document.getElementById('auth-btn');
    if (title) title.innerText = isLoginMode ? "Welcome Back" : "Create Account";
    if (btn) btn.innerText = isLoginMode ? "Login" : "Register";
    
    const roleSel = document.getElementById('role-selection');
    if (roleSel) roleSel.style.display = isLoginMode ? 'none' : 'block';
};

window.toggleBusinessFields = function() {
    const role = document.getElementById('role')?.value;
    const businessFields = document.getElementById('business-fields');
    if (businessFields) businessFields.style.display = (role === 'agency') ? 'block' : 'none';
};

window.updateCities = function() {
    const state = document.getElementById('p-state')?.value;
    const citySelect = document.getElementById('p-city');
    if (!citySelect) return;
    const cities = locationData[state] || [];
    citySelect.innerHTML = cities.map(c => `<option value="${c}">${c}</option>`).join('');
};

/* =========================================
   3. PACKAGE FORM & SAVE LOGIC
   ========================================= */

window.showPackageForm = function(pEncoded = null) {
    let pkg = null;
    try {
        pkg = pEncoded ? JSON.parse(decodeURIComponent(pEncoded)) : null;
    } catch (e) { console.error("Data error:", e); }
    
    const isEdit = !!pkg;
    const area = document.getElementById('main-content');
    if (!area) return;
    
    const pkgDestinations = isEdit ? (pkg.destination || []) : [];
    const pkgVehicles = isEdit ? (pkg.vehicles || []) : [];
    
    let selectedState = "";
    if (isEdit && pkg.starting_location) {
        for (let s in locationData) {
            if (locationData[s].includes(pkg.starting_location)) { selectedState = s; break; }
        }
    }

    const stateOptions = Object.keys(locationData).map(s => 
        `<option value="${s}" ${selectedState === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    const destHtml = tourDestinations.map(d => `
        <label style="display:flex; align-items:center; gap:5px; padding:8px; background:white; border:1px solid #ddd; border-radius:5px; font-size:12px; cursor:pointer;">
            <input type="checkbox" class="d-check" value="${d}" ${pkgDestinations.includes(d) ? 'checked' : ''}> ${d}
        </label>
    `).join('');

    const vehicleHtml = vehicleTypes.map(v => {
        const existing = pkgVehicles.find(ev => ev.id === v.id);
        return `
        <div style="display:flex; align-items:center; gap:10px; background:#fff8f0; padding:12px; border-radius:10px; border:1px solid #ffeaa7; margin-bottom:10px;">
            <input type="checkbox" class="v-enable" data-id="${v.id}" ${existing ? 'checked' : ''}>
            <span style="font-size:20px;">${v.icon}</span>
            <b style="flex:1;">${v.name}</b>
            <input type="number" class="v-rate" data-id="${v.id}" placeholder="Rate" style="width:90px; padding:5px;" value="${existing ? existing.rate : ''}">
            <input type="number" class="v-max" data-id="${v.id}" placeholder="Max" style="width:60px; padding:5px;" value="${existing ? existing.max_cars : '1'}">
        </div>`;
    }).join('');

    area.innerHTML = `
        <div style="background:white; padding:30px; border-radius:15px; border:2px solid #ff9f43; max-width:750px; margin:20px auto; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
            <h2 style="color:#ff9f43; margin:0 0 20px 0;">${isEdit ? '?? Edit Package' : '?? Create New Package'}</h2>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                <div>
                    <label style="font-weight:bold; font-size:11px; color:#666;">PACKAGE TITLE</label>
                    <input type="text" id="p-title" value="${isEdit ? pkg.title : ''}" style="width:100%; padding:12px; border:1px solid #ccc; border-radius:8px;">
                </div>
                <div>
                    <label style="font-weight:bold; font-size:11px; color:#666;">PICKUP STATE</label>
                    <select id="p-state" onchange="window.updateCities()" style="width:100%; padding:12px; border:1px solid #ccc; border-radius:8px;">
                        <option value="">Select State</option>
                        ${stateOptions}
                    </select>
                </div>
            </div>
            <div style="margin-bottom:20px;">
                <label style="font-weight:bold; font-size:11px; color:#666;">STARTING CITY</label>
                <select id="p-city" style="width:100%; padding:12px; border:1px solid #ccc; border-radius:8px;">
                    ${isEdit && selectedState ? locationData[selectedState].map(c => `<option value="${c}" ${pkg.starting_location === c ? 'selected' : ''}>${c}</option>`).join('') : '<option value="">Select City</option>'}
                </select>
            </div>
            <p><b>Select Destinations:</b></p>
            <div style="display:flex; flex-wrap:wrap; gap:8px; background:#f9f9f9; padding:15px; border-radius:10px; margin-bottom:25px; border:1px solid #eee;">
                ${destHtml}
            </div>
            <p><b>Vehicle Pricing:</b></p>
            ${vehicleHtml}
            <label style="display:block; margin-top:20px; font-weight:bold; font-size:11px; color:#666;">ITINERARY / DESCRIPTION</label>
            <textarea id="p-desc" style="width:100%; height:120px; padding:12px; border:1px solid #ccc; border-radius:8px; margin-top:5px;">${isEdit ? (pkg.description || '') : ''}</textarea>
            <div style="display:flex; gap:15px; margin-top:30px;">
                <button id="save-btn" onclick="window.processSave('${isEdit ? pkg.id : ''}')" style="flex:2; background:#2ecc71; color:white; border:none; padding:18px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:16px;">SAVE CHANGES</button>
                <button onclick="window.showTab('packages')" style="flex:1; background:#eee; border:none; padding:18px; border-radius:10px; cursor:pointer; font-weight:bold;">CANCEL</button>
            </div>
        </div>`;
};

window.processSave = async function(pkgId) {
    const btn = document.getElementById('save-btn');
    if (btn) { btn.innerText = "Processing..."; btn.disabled = true; }
    try {
        const client = getClient();
        const { data: { user } } = await client.auth.getUser();
        if(!user) throw new Error("Session expired. Please login.");
        const titleVal = document.getElementById('p-title')?.value;
        if(!titleVal || !titleVal.trim()) throw new Error("Please enter a package title!");
        const selectedVehicles = [];
        document.querySelectorAll('.v-enable:checked').forEach(el => {
            const vId = el.dataset.id;
            const rate = parseFloat(document.querySelector(`.v-rate[data-id="${vId}"]`)?.value) || 0;
            const max = parseInt(document.querySelector(`.v-max[data-id="${vId}"]`)?.value) || 1;
            const vType = vehicleTypes.find(vt => vt.id === vId);
            if (vType) selectedVehicles.push({ id: vId, name: vType.name, rate: rate, max_cars: max, icon: vType.icon });
        });
        const pkgData = {
            title: titleVal,
            starting_location: document.getElementById('p-city')?.value || "",
            destination: Array.from(document.querySelectorAll('.d-check:checked')).map(el => el.value),
            vehicles: selectedVehicles,
            description: document.getElementById('p-desc')?.value || "",
            agency_id: user.id
        };
        const res = (pkgId && pkgId !== "undefined" && pkgId !== "")
            ? await client.from('packages').update(pkgData).eq('id', pkgId)
            : await client.from('packages').insert([pkgData]);
        if (res.error) throw res.error;
        alert("? Success! Package saved.");
        window.showTab('packages');
    } catch (err) {
        alert("? Error: " + err.message);
        if (btn) { btn.innerText = "SAVE CHANGES"; btn.disabled = false; }
    }
};

/* =========================================
   4. AUTHENTICATION LOGIC
   ========================================= */

window.handleAuth = async function() {
    const status = document.getElementById('status') || { innerText: "" };
    const btn = document.getElementById('auth-btn');
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
        status.innerText = "?? Please enter email and password";
        return;
    }

    const client = getClient();
    if (btn) { btn.disabled = true; btn.innerText = "Processing..."; }
    status.innerText = "? Processing...";

    try {
        if (isLoginMode) {
            const { error } = await client.auth.signInWithPassword({ email, password });
            if (error) throw error;
            window.location.reload();
        } else {
            const role = document.getElementById('role')?.value || 'customer';
            const metadata = { role, is_approved: (role === 'customer') };
            const { error } = await client.auth.signUp({ 
                email, password, 
                options: { data: metadata, emailRedirectTo: window.location.href } 
            });
            if (error) throw error;
            status.innerHTML = `<div style="color:green; padding:10px;">?? Check your Inbox! Verification sent to ${email}.</div>`;
        }
    } catch (err) {
        status.innerText = "? " + err.message;
        if (btn) { btn.disabled = false; btn.innerText = isLoginMode ? "Login" : "Register"; }
    }
};

window.handleLogout = async function() {
    await getClient().auth.signOut();
    window.location.reload();
};

window.showTab = function(tab) {
    const area = document.getElementById('main-content');
    if (!area) return;
    if (tab === 'packages') {
        area.innerHTML = `<h3>My Packages</h3><button onclick="window.showPackageForm()">+ Create New</button><div id="pkg-list">Loading...</div>`;
        fetchPackages();
    }
};

async function fetchPackages() {
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    const { data: pkgs } = await client.from('packages').select('*').eq('agency_id', user.id);
    const list = document.getElementById('pkg-list');
    if (!pkgs || pkgs.length === 0) { list.innerHTML = "<p>No packages found.</p>"; return; }
    list.innerHTML = pkgs.map(p => `<div style="border:1px solid #ddd; padding:10px; margin:5px; border-radius:5px;">
        <b>${p.title}</b> <button onclick="window.showPackageForm('${encodeURIComponent(JSON.stringify(p))}')">Edit</button>
    </div>`).join('');
}

/* =========================================
   5. UI INITIALIZATION & BRIDGE
   ========================================= */

function bridgeGlobalFunctions() {
    // Ensuring all functions are on window so HTML 'onclick' finds them
    window.handleAuth = window.handleAuth || handleAuth;
    window.handleLogout = window.handleLogout || handleLogout;
    window.toggleMode = window.toggleMode || toggleMode;
    window.showPackageForm = window.showPackageForm || showPackageForm;
    window.processSave = window.processSave || processSave;
    window.showTab = window.showTab || showTab;
}

async function initApp() {
    console.log("TourSetu Booting Up...");
    bridgeGlobalFunctions();
    
    const client = getClient();
    if (!client) return;
    
    const { data: { session } } = await client.auth.getSession();
    const authCard = document.getElementById('auth-card');
    const dashboard = document.getElementById('dashboard');

    if (session) {
        if (authCard) authCard.style.display = 'none';
        if (dashboard) {
            dashboard.style.display = 'block';
            window.showTab('packages');
        }
    } else {
        if (dashboard) dashboard.style.display = 'none';
        if (authCard) authCard.style.display = 'block';
    }
}

/* =========================================
   6. THE STARTUP SWITCH & INITIALIZATION
   ========================================= */

/**
 * Ensures all functions are available to the HTML 
 * even if the script loads after the HTML.
 */
function bridgeGlobalFunctions() {
    console.log("Bridging functions to window scope...");
    
    // Auth & Navigation
    window.handleAuth = window.handleAuth || handleAuth;
    window.handleLogout = window.handleLogout || handleLogout;
    window.toggleMode = window.toggleMode || toggleMode;
    window.toggleBusinessFields = window.toggleBusinessFields || toggleBusinessFields;
    
    // Dashboard & Tabs
    window.showTab = window.showTab || showTab;
    window.renderAgencyDashboard = window.renderAgencyDashboard || renderAgencyDashboard;
    
    // Package Management
    window.showPackageForm = window.showPackageForm || showPackageForm;
    window.handleSave = window.handleSave || handleSave;
    window.processSave = window.processSave || processSave;
    window.updatePackage = window.updatePackage || updatePackage;
    window.updateCities = window.updateCities || updateCities;
    window.loadPackageList = window.loadPackageList || loadPackageList;

    // Modals
    window.confirmLogout = window.confirmLogout || confirmLogout;
    window.executeLogout = window.executeLogout || executeLogout;
}

/**
 * Main App Bootloader
 */
async function initApp() {
    console.log("TourSetu Booting...");
    
    // 1. Bridge functions immediately
    bridgeGlobalFunctions();
    
    const client = getClient();
    if (!client) {
        console.error("Supabase client not found. Ensure the CDN is in your HTML <head>.");
        return;
    }
    
    try {
        // 2. Check for active session
        const { data: { session }, error } = await client.auth.getSession();
        if (error) throw error;

        const authCard = document.getElementById('auth-card');
        const dashboard = document.getElementById('dashboard');

        if (session) {
            console.log("Session active for:", session.user.email);
            
            // Hide login, show dashboard
            if (authCard) authCard.style.display = 'none';
            if (dashboard) dashboard.style.display = 'block';
            
            // Trigger dashboard UI
            window.renderAgencyDashboard(session.user);
        } else {
            console.log("No session. Rendering Auth UI.");
            if (dashboard) dashboard.style.display = 'none';
            if (authCard) authCard.style.display = 'block';
            // ensure the Auth UI is actually drawn inside the 'app' div
            if (typeof renderAuthUI === 'function') renderAuthUI();
        }
    } catch (err) {
        console.error("Init Error:", err.message);
    }
}

// --- EXECUTION ---
// This ensures it runs regardless of how CodePen loads the script
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initApp, 1); // Tiny delay helps in Debug mode
} else {
    document.addEventListener('DOMContentLoaded', initApp);
}

// 7. CUSTOMER HOMEPAGE
function renderCustomerHomepage(user) {
    const app = document.getElementById('app');
    app.style.maxWidth = "100%";
    
    const startCityOptions = Object.values(locationData || {}).flat().sort().map(city => 
        `<option value="${city}">${city}</option>`
    ).join('');

    const destOptions = (tourDestinations || []).map(d => 
        `<option value="${d}">${d}</option>`
    ).join('');

    app.innerHTML = `
        <div style="font-family:'Inter', sans-serif; background:#f4f7f6; min-height:100vh; margin:-20px;">
            <div style="background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80');
                    height:450px; background-size:cover; background-position:center; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; padding:20px;">
                <h1 style="font-size:3rem; margin-bottom:10px; text-align:center;">Find Your Perfect Match</h1>
                <p style="font-size:1.2rem; margin-bottom:40px; opacity:0.9;">Direct connections with verified local travel agencies</p>
                
               <div class="card" style="background:white; padding:30px; border-radius:20px; display:flex; gap:15px; width:95%; max-width:1000px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); flex-wrap:wrap;">
                 <div style="flex:1; min-width:250px; text-align:left;">
                     <label style="color:#636e72; font-weight:bold; font-size:12px; letter-spacing:1px;">MY STARTING LOCATION</label>
                     <select id="search-start" style="border: 2px solid #eee; margin-top:8px; width:100%; height:45px; border-radius:8px;">
                        <option value="">Select City</option>
                        ${startCityOptions}
                     </select>
                  </div>
                 <div style="flex:1; min-width:250px; text-align:left;">
                     <label style="color:#636e72; font-weight:bold; font-size:12px; letter-spacing:1px;">TOUR DESTINATION</label>
                     <select id="search-dest" style="border: 2px solid #eee; margin-top:8px; width:100%; height:45px; border-radius:8px;">
                         <option value="">Select Destination</option>
                         ${destOptions}
                      </select>
                 </div>
                 <button onclick="searchMatchedAgencies()" style="background:#ff9f43; color:white; border:none; padding:0 40px; border-radius:12px; font-weight:bold; cursor:pointer; height:55px; margin-top:22px; font-size:16px;">FIND AGENCIES</button>
             </div>
          </div>

            <div style="max-width:1200px; margin:auto; padding:50px 20px;">
               <div style="display:flex; justify-content:space-between; align-items:end; margin-bottom:40px; border-bottom:2px solid #eee; padding-bottom:15px;">
                 <div>
                     <h2 id="result-title" style="margin:0; color:#2d3436; font-size:2rem;">Popular Packages</h2>
                     <p id="result-subtitle" style="color:#636e72; margin-top:5px;">Explore tours from all over India</p>
                 </div>
                 <div style="display:flex; gap:10px; align-items:center;">
                   <div style="position:relative;">
                        <button onclick="renderCustomerRequests()" style="background:#3498db; color:white; padding:10px 20px; border-radius:10px; font-weight:bold; cursor:pointer; border:none;">My Requests</button>
                        <span id="cust-notif-badge" style="display:none; position:absolute; top:-10px; right:-5px; background:#ff7675; color:white; font-size:10px; padding:3px 7px; border-radius:50%; border:2px solid white; font-weight:bold;">??</span>
                   </div>
                   <button onclick="confirmCustomerLogout()" style="background:#f1f2f6; color:#ff7675; width:auto; padding:10px 25px; border-radius:10px; font-weight:bold; cursor:pointer; border:none;">Logout</button>
                 </div>
             </div>
               <div id="customer-pkg-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap:30px;"></div>
           </div>
        </div>

        <div id="booking-success-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.9); z-index:2000; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
            <div style="font-size:60px; margin-bottom:20px;">?</div>
            <h2 style="color:#2d3436;">Request Sent Successfully!</h2>
            <p style="color:#636e72; max-width:400px; line-height:1.6;">Your booking inquiry has been sent to the agency. You can track the status in <b>My Requests</b>.</p>
            <button onclick="closeSuccessAndShowRequests()" style="background:#ff9f43; color:white; border:none; padding:12px 30px; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:20px;">VIEW MY REQUESTS</button>
        </div>

        <div id="cust-logout-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:3000; justify-content:center; align-items:center;">
            <div style="background:white; padding:30px; border-radius:12px; text-align:center; max-width:350px;">
               <h2 style="margin:0 0 10px 0;">Logout?</h2>
               <p style="color:#666; margin-bottom:25px;">Are you sure you want to end your session?</p>
               <div style="display:flex; gap:10px;">
                   <button onclick="executeLogout()" style="background:#ff7675; color:white; flex:1; padding:12px; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">Yes, Logout</button>
                   <button onclick="document.getElementById('cust-logout-modal').style.display='none'" style="background:#eee; flex:1; padding:12px; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">Cancel</button>
               </div>
           </div>
        </div>

        <div id="detail-modal" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:1000; justify-content:center; align-items:center; overflow-y:auto;">
            <div class="modal-content card" style="background:white; width:90%; max-width:700px; padding:30px; border-radius:20px; position:relative; margin: 40px 0;">
                <div id="detail-view-body"></div>
            </div>
        </div>
    `;
    loadAllPackages();
    checkCustomerNotifications();
}

// 8. NOTIFICATION & LOGOUT LOGIC
window.confirmCustomerLogout = () => document.getElementById('cust-logout-modal').style.display = 'flex';

window.executeLogout = async () => {
    await getClient().auth.signOut();
    isLoginMode = true;
    renderAuthUI();
};

window.checkCustomerNotifications = async () => {
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    if(!user) return;

    const { data } = await client.from('bookings').select('id').eq('customer_id', user.id).neq('status', 'pending');
    const badge = document.getElementById('cust-notif-badge');
    if(badge && data && data.length > 0) {
        badge.style.display = 'block';
    }
};

// 9. BOOKING HANDLING
window.handleBookingInquiry = async function(packageId, packageTitle, agencyId) {
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    const address = document.getElementById('cust-address').value;
    const phone = document.getElementById('cust-phone').value;

    if (!address.trim() || !phone.trim()) {
        alert("Please provide pickup address and phone number!"); 
        return;
    }

    let totalPrice = 0;
    const selectedVehicles = Array.from(document.querySelectorAll('.book-v-check:checked')).map(el => {
        const id = el.dataset.id;
        const rate = parseFloat(el.dataset.rate) || 0;
        const qtyInput = document.querySelector(`.book-v-qty[data-id="${id}"]`);
        const qty = qtyInput ? parseInt(qtyInput.value) : 1;
        totalPrice += (rate * qty);
        return `${qty}x vehicle_id:${id}`;
    });

    if (selectedVehicles.length === 0) { 
        alert("Please select at least one vehicle to book."); 
        return; 
    }

    const { error } = await client.from('bookings').insert([{
        package_id: packageId, 
        package_title: packageTitle,
        customer_id: user.id, 
        customer_email: user.email,
        customer_address: address, 
        customer_phone: phone,
        selected_vehicles: selectedVehicles.join(', '),
        total_price: totalPrice, 
        status: 'pending',
        agency_id: agencyId
    }]);

    if (!error) {
        document.getElementById('detail-modal').style.display = 'none';
        document.getElementById('booking-success-overlay').style.display = 'flex';
    } else {
        alert("Booking Error: " + error.message);
    }
};

window.closeSuccessAndShowRequests = () => {
    document.getElementById('booking-success-overlay').style.display = 'none';
    renderCustomerRequests();
};

// 10. REQUESTS VIEW & ACTIONS
window.renderCustomerRequests = async () => {
    const container = document.getElementById('customer-pkg-list');
    const badge = document.getElementById('cust-notif-badge');
    if(badge) badge.style.display = 'none';
    
    document.getElementById('result-title').innerText = "My Trip Requests";
    document.getElementById('result-subtitle').innerText = "Track your inquiries and booking status";
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center;"><h3>Loading your requests...</h3></div>`;
    
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    const { data } = await client.from('bookings').select('*').eq('customer_id', user.id).order('created_at', {ascending: false});
    
    if(!data || data.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px;"><p>No requests found.</p></div>`;
        return;
    }

    container.innerHTML = data.map(b => {
        const statusColors = { pending: '#ff9f43', paid: '#2ecc71', approved: '#3498db', denied: '#ff7675' };
        const color = statusColors[b.status] || '#636e72';

        return `
        <div class="card" style="background:white; padding:25px; border-left:5px solid ${color}; position:relative; margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                   <h3 style="margin:0 0 10px 0;">${b.package_title}</h3>
                   <div style="font-size:13px; color:#636e72;">
                       <div>?? Vehicles: ${b.selected_vehicles}</div>
                       <div style="margin-top:5px;">Status: <b style="color:${color}">${b.status.toUpperCase()}</b></div>
                   </div>
               </div>
               ${b.status === 'pending' ? `<button onclick="deleteBookingRequest(${b.id})" style="color:#ff7675; cursor:pointer; background:none; border:none;">???</button>` : ''}
            </div>
            <div style="margin-top:20px; padding:15px; border-radius:10px; background:#f8f9fa;">
               ${b.status === 'paid' ? `<h3>?? ${b.agency_contact || 'Contact info missing'}</h3>` : 
                 b.status === 'approved' ? `<button onclick="simulatePayment(${b.id})" style="background:#2ecc71; color:white; width:100%; padding:10px; border-radius:5px; border:none; cursor:pointer;">PAY TO UNLOCK CONTACT</button>` : 
                 `<p style="text-align:center; font-size:12px; color:#999;">${b.status === 'denied' ? 'Request Denied' : 'Waiting for Agency Approval'}</p>`}
            </div>
        </div>`;
    }).join('');
};

window.deleteBookingRequest = async (id) => {
    if(confirm("Delete this request?")) {
        await getClient().from('bookings').delete().eq('id', id);
        renderCustomerRequests();
    }
};

window.simulatePayment = async (id) => {
    if(confirm("Confirm payment?")) {
        const { error } = await getClient().from('bookings').update({ status: 'paid' }).eq('id', id);
        if(!error) renderCustomerRequests();
    }
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
                <p style="color:#ff9f43; font-weight:bold;">Starts from ?${minPrice}</p>
               <div style="font-size:13px; color:#636e72; margin:15px 0;">
                   <div>?? <b>From:</b> ${p.starting_location}</div>
                   <div style="margin-top:5px;">?? <b>To:</b> ${destDisplay}...</div>
               </div>
               <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:15px;">
                   ${vels.map(v => `<span style="font-size:10px; background:#f0f0f0; padding:3px 8px; border-radius:4px;">${v.name}</span>`).join('')}
               </div>
               <button style="background:#ff9f43; color:white; width:100%; padding:12px;">VIEW DETAILS</button>
            </div>
        </div>`;
    }).join('');
}
// 8. PACKAGE DETAIL VIEW (CODEPEN SYNTAX-SAFE VERSION)
window.showPackageDetails = function(pEncoded) {
    const p = JSON.parse(decodeURIComponent(pEncoded));
    const modal = document.getElementById('detail-modal');
    const body = document.getElementById('detail-view-body');
    
    // Calculate values outside the string to prevent SyntaxErrors
    const historyList = p.updates_history || [];
    const vehicleList = p.vehicles || [];
    const routeInfo = `${p.starting_location} ? ${Array.isArray(p.destination) ? p.destination.join(' ? ') : p.destination}`;

    // Pre-build Vehicle HTML
    const vehicleHtml = vehicleList.map(v => `
        <div style="padding:12px; border:1px solid #eee; border-radius:10px; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <input type="checkbox" class="book-v-check" data-id="${v.id}" data-rate="${v.rate}" onchange="toggleQtyInput('${v.id}')">
                    <b>${v.name}</b>
                </div>
                <span style="color:#2ecc71; font-weight:bold;">?${v.rate}</span>
            </div>
            <div id="qty-container-${v.id}" style="display:none; margin-top:10px;">
                <input type="number" class="book-v-qty" data-id="${v.id}" value="1" min="1" max="${v.max_cars || 1}" oninput="updateLivePrice()" style="width:60px;">
                <small>Max: ${v.max_cars || 1}</small>
            </div>
        </div>`).join('');

    body.innerHTML = `
        <div style="text-align:left;">
            <div style="display:flex; justify-content:space-between;">
                <h2 style="margin:0;">${p.title}</h2>
                <button onclick="document.getElementById('detail-modal').style.display='none'" style="border:none; background:none; font-size:20px; cursor:pointer;">?</button>
            </div>
            <p style="color:#ff9f43; font-weight:bold;">${routeInfo}</p>
            
            <div style="margin:15px 0; padding:10px; background:#f9f9f9; border-radius:8px;">
                <p style="white-space: pre-line; font-size:14px;">${p.description || 'No description.'}</p>
            </div>
            
            <h4>Select Vehicles</h4>
            ${vehicleHtml}

            <div style="background:#2d3436; color:white; padding:15px; border-radius:8px; margin-top:15px; display:flex; justify-content:space-between;">
                <span>TOTAL:</span>
                <span id="live-total-display" style="color:#ff9f43; font-weight:bold;">?0</span>
            </div>

            <div style="margin-top:20px;">
                <input type="text" id="cust-phone" placeholder="Phone Number" style="width:100%; margin-bottom:10px; padding:10px;">
                <textarea id="cust-address" placeholder="Pickup Address" style="width:100%; height:60px; padding:10px;"></textarea>
            </div>

            <div style="margin-top:20px; display:flex; gap:10px;">
                <button id="main-book-btn" 
                    data-pkg-id="${p.id}" 
                    data-pkg-title="${p.title}" 
                    data-agency-id="${p.agency_id}"
                    onclick="initiateBooking(this)" 
                    style="flex:2; background:#ff9f43; color:white; border:none; padding:15px; font-weight:bold; border-radius:8px; cursor:pointer;">
                    SEND BOOKING REQUEST
                </button>
                <button onclick="document.getElementById('detail-modal').style.display='none'" style="flex:1; border:none; border-radius:8px; cursor:pointer;">BACK</button>
            </div>
        </div>`;
    modal.style.display = 'flex';
};

// THE BOOKING INITIATOR (Uses the button's data attributes)
window.initiateBooking = function(btnElement) {
    const packageId = btnElement.getAttribute('data-pkg-id');
    const packageTitle = btnElement.getAttribute('data-pkg-title');
    const agencyId = btnElement.getAttribute('data-agency-id');
    
    // Now call your logic function
    handleBookingInquiry(packageId, packageTitle, agencyId);
};

window.handleBookingInquiry = async function(packageId, packageTitle, agencyId) {
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    const address = document.getElementById('cust-address').value;
    const phone = document.getElementById('cust-phone').value;

    if (!address.trim() || !phone.trim()) {
        alert("Enter phone and address!"); return;
    }

    let totalPrice = 0;
    const selectedVehicles = Array.from(document.querySelectorAll('.book-v-check:checked')).map(el => {
        const id = el.dataset.id;
        const rate = parseFloat(el.dataset.rate) || 0;
        const qty = parseInt(document.querySelector(`.book-v-qty[data-id="${id}"]`).value) || 1;
        totalPrice += (rate * qty);
        return `${qty}x vehicle_id:${id}`;
    });

    if (selectedVehicles.length === 0) { alert("Select a vehicle!"); return; }

    const { error } = await client.from('bookings').insert([{
        package_id: packageId, 
        package_title: packageTitle,
        customer_id: user.id, 
        customer_email: user.email,
        customer_address: address, 
        customer_phone: phone,
        selected_vehicles: selectedVehicles.join(', '),
        total_price: totalPrice, 
        status: 'pending',
        agency_id: agencyId
    }]);

    if (!error) {
        alert("Booking Sent!");
        document.getElementById('detail-modal').style.display = 'none';
        renderCustomerRequests();
    } else {
        alert("Error: " + error.message);
    }
};
/* =========================================
   1. DASHBOARD RENDERING
   ========================================= */
window.renderAgencyDashboard = function(user) {
    const app = document.getElementById('app');
    app.style.maxWidth = "100%";
    
    app.innerHTML = `
        <div style="display:flex; min-height:100vh; background:#f8f9fa; margin:-20px; font-family:'Inter', sans-serif;">
            <div style="width:260px; background:#2d3436; color:white; padding:25px; position:relative; flex-shrink:0;">
               <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;">
                   <h2 style="color:#ff9f43; margin:0;">TourSetu</h2>
                   <div id="notif-bell" onclick="window.showTab('bookings')" style="position:relative; cursor:pointer; font-size:20px;">
                       ?? <span id="bell-badge" style="display:none; position:absolute; top:-5px; right:-5px; background:#ff7675; color:white; font-size:10px; padding:2px 6px; border-radius:50%;">0</span>
                   </div>
               </div>
               <nav>
                   <div onclick="window.showTab('earnings')" class="nav-item">?? Dashboard</div>
                   <div onclick="window.showTab('bookings')" class="nav-item">?? Bookings</div>
                   <div onclick="window.showTab('packages')" class="nav-item">?? My Packages</div>
                   <div onclick="window.showTab('profile')" class="nav-item">?? Agency Profile</div>
                   <div onclick="window.confirmLogout()" style="padding:15px; cursor:pointer; color:#ff7675; margin-top:50px; font-weight:bold; border-top:1px solid #444;">? Logout</div>
               </nav>
            </div>
            <div id="main-content" style="flex:1; padding:40px; overflow-y:auto; background:#f8f9fa;"></div>
        </div>

        <div id="logout-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:1000; justify-content:center; align-items:center;">
            <div style="background:white; padding:30px; border-radius:12px; text-align:center;">
                <h2>Logout?</h2>
                <button onclick="window.executeLogout()" style="background:#ff7675; color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer;">Yes, Logout</button>
                <button onclick="document.getElementById('logout-modal').style.display='none'" style="background:#eee; padding:10px 20px; border:none; border-radius:5px; margin-left:10px; cursor:pointer;">Cancel</button>
           </div>
        </div>
    `;
    window.showTab('earnings'); 
};

/* =========================================
   2. TAB & PACKAGE LIST LOGIC
   ========================================= */
window.showTab = async function(tabName) {
    const container = document.getElementById('main-content');
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;

    if (tabName === 'packages') {
        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h1>My Packages</h1>
                <button onclick="window.showPackageForm()" style="padding:12px 25px; background:#2ecc71; color:white; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">+ CREATE NEW</button>
            </div>
            <div id="pkg-list-container">Loading packages...</div>`;
        window.loadPackageList(user.id);
    } else {
        container.innerHTML = `<h1>${tabName.toUpperCase()}</h1><p>Content for ${tabName} coming soon.</p>`;
    }
};

window.loadPackageList = async function(agencyId) {
    const client = getClient();
    const { data: pkgs } = await client.from('packages').select('*').eq('agency_id', agencyId);
    const container = document.getElementById('pkg-list-container');

    if (!pkgs || pkgs.length === 0) {
        container.innerHTML = `<p>No packages found. Create your first one!</p>`;
        return;
    }

    container.innerHTML = pkgs.map(p => `
        <div class="card" style="background:white; padding:20px; border-radius:12px; margin-bottom:20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h3 style="margin:0;">${p.title}</h3>
                    <small style="color:#666;">${p.starting_location || 'No location set'}</small>
                </div>
                <button onclick="window.showPackageForm('${encodeURIComponent(JSON.stringify(p))}')" style="background:#3498db; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">?? Edit Details</button>
            </div>
        </div>
    `).join('');
};

/* =========================================
   3. PACKAGE FORM (CREATE & EDIT)
   ========================================= */
window.showPackageForm = function(pEncoded = null) {
    let pkg = null;
    try {
        pkg = pEncoded ? JSON.parse(decodeURIComponent(pEncoded)) : null;
    } catch (e) { console.error("Data error:", e); }
    
    const isEdit = !!pkg;
    const area = document.getElementById('main-content');
    
    const pkgDestinations = isEdit ? (pkg.destination || []) : [];
    const pkgVehicles = isEdit ? (pkg.vehicles || []) : [];
    
    let selectedState = "";
    if (isEdit && pkg.starting_location) {
        for (let s in locationData) {
            if (locationData[s].includes(pkg.starting_location)) { selectedState = s; break; }
        }
    }

    const stateOptions = Object.keys(locationData).map(s => 
        `<option value="${s}" ${selectedState === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    const destHtml = tourDestinations.map(d => `
        <label style="display:flex; align-items:center; gap:5px; padding:8px; background:white; border:1px solid #ddd; border-radius:5px; font-size:12px; cursor:pointer;">
            <input type="checkbox" class="d-check" value="${d}" ${pkgDestinations.includes(d) ? 'checked' : ''}> ${d}
        </label>
    `).join('');

    const vehicleHtml = vehicleTypes.map(v => {
        const existing = pkgVehicles.find(ev => ev.id === v.id);
        return `
        <div style="display:flex; align-items:center; gap:10px; background:#fff8f0; padding:12px; border-radius:10px; border:1px solid #ffeaa7; margin-bottom:10px;">
            <input type="checkbox" class="v-enable" data-id="${v.id}" ${existing ? 'checked' : ''}>
            <span style="font-size:20px;">${v.icon}</span>
            <b style="flex:1;">${v.name}</b>
            <input type="number" class="v-rate" data-id="${v.id}" placeholder="Rate" style="width:90px; padding:5px;" value="${existing ? existing.rate : ''}">
            <input type="number" class="v-max" data-id="${v.id}" placeholder="Max" style="width:60px; padding:5px;" value="${existing ? existing.max_cars : '1'}">
        </div>`;
    }).join('');

    area.innerHTML = `
        <div style="background:white; padding:30px; border-radius:15px; border:2px solid #ff9f43; max-width:750px; margin:20px auto; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
            <h2 style="color:#ff9f43; margin:0 0 20px 0;">${isEdit ? '?? Edit Package' : '?? Create New Package'}</h2>
            
            <input type="text" id="p-title" placeholder="Package Title" value="${isEdit ? pkg.title : ''}" style="width:100%; padding:12px; margin-bottom:15px; border:1px solid #ccc; border-radius:8px;">
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                <select id="p-state" onchange="window.updateCities()" style="padding:12px; border:1px solid #ccc; border-radius:8px;">
                    <option value="">Select State</option>
                    ${stateOptions}
                </select>
                <select id="p-city" style="padding:12px; border:1px solid #ccc; border-radius:8px;">
                    ${isEdit && selectedState ? locationData[selectedState].map(c => `<option value="${c}" ${pkg.starting_location === c ? 'selected' : ''}>${c}</option>`).join('') : '<option value="">Select City</option>'}
                </select>
            </div>
            
            <p><b>Select Destinations:</b></p>
            <div style="display:flex; flex-wrap:wrap; gap:8px; background:#f9f9f9; padding:15px; border-radius:10px; margin-bottom:20px; border:1px solid #eee; max-height:150px; overflow-y:auto;">
                ${destHtml}
            </div>

            <p><b>Vehicle Pricing:</b></p>
            ${vehicleHtml}

            <textarea id="p-desc" placeholder="Describe the itinerary..." style="width:100%; height:120px; padding:12px; border:1px solid #ccc; border-radius:8px; margin-top:10px;">${isEdit ? (pkg.description || '') : ''}</textarea>
            
            <div style="display:flex; gap:15px; margin-top:30px;">
                <button id="save-btn" onclick="window.handleSave('${isEdit ? pkg.id : ''}')" style="flex:2; background:#2ecc71; color:white; padding:18px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:16px;">SAVE CHANGES</button>
                <button onclick="window.showTab('packages')" style="flex:1; background:#eee; padding:18px; border-radius:10px; cursor:pointer; font-weight:bold;">CANCEL</button>
            </div>
        </div>`;
};

/* =========================================
   4. FINAL SAVE LOGIC (GUARDS INCLUDED)
 ========================================= */
window.handleSave = async function(pkgId) {
    const btn = document.getElementById('save-btn');
    if (btn) { btn.innerText = "? Saving..."; btn.disabled = true; }

    try {
        const client = getClient();
        const { data: { user } } = await client.auth.getUser();
        if(!user) throw new Error("Session expired.");

        const titleVal = document.getElementById('p-title')?.value;
        if(!titleVal) throw new Error("Title is required!");

        const selectedVehicles = [];
        document.querySelectorAll('.v-enable:checked').forEach(el => {
            const vId = el.dataset.id;
            const rate = parseFloat(document.querySelector(`.v-rate[data-id="${vId}"]`)?.value) || 0;
            const max = parseInt(document.querySelector(`.v-max[data-id="${vId}"]`)?.value) || 1;
            const vType = vehicleTypes.find(vt => vt.id === vId);
            if (vType && rate > 0) {
                selectedVehicles.push({ id: vId, name: vType.name, rate, max_cars: max, icon: vType.icon });
            }
        });

        const pkgData = {
            title: titleVal,
            starting_location: document.getElementById('p-city')?.value || "",
            destination: Array.from(document.querySelectorAll('.d-check:checked')).map(el => el.value),
            vehicles: selectedVehicles,
            description: document.getElementById('p-desc')?.value || "",
            agency_id: user.id
        };

        const res = (pkgId && pkgId !== "undefined" && pkgId !== "")
            ? await client.from('packages').update(pkgData).eq('id', pkgId)
            : await client.from('packages').insert([pkgData]);

        if (res.error) throw res.error;

        alert("? Package Published!");
        window.showTab('packages');

    } catch (err) {
        alert("? Error: " + err.message);
        if (btn) { btn.innerText = "SAVE CHANGES"; btn.disabled = false; }
    }
};

/* =========================================
   5. LOGOUT & UTILS
   ========================================= */
window.confirmLogout = () => document.getElementById('logout-modal').style.display = 'flex';
window.executeLogout = async () => { await getClient().auth.signOut(); window.location.reload(); };

window.updateCities = function() {
    const state = document.getElementById('p-state')?.value;
    const citySelect = document.getElementById('p-city');
    if (!citySelect) return;
    const cities = locationData[state] || [];
    citySelect.innerHTML = cities.map(c => `<option value="${c}">${c}</option>`).join('');
};

// --- 10. PACKAGE FORM (Fixed & Integrated) ---
window.showPackageForm = function(pEncoded = null) {
    let pkg = null;
    try {
        // Decode the package data if we are editing
        pkg = pEncoded ? JSON.parse(decodeURIComponent(pEncoded)) : null;
    } catch (e) { 
        console.error("Decoding error:", e); 
    }
    
    const isEdit = !!pkg;
    // Target the main content area of your dashboard
    const area = document.getElementById('main-content');
    
    const pkgDestinations = isEdit ? (pkg.destination || []) : [];
    const pkgVehicles = isEdit ? (pkg.vehicles || []) : [];
    
    // 1. Determine the selected state for the dropdown
    let selectedState = "";
    if (isEdit && pkg.starting_location) {
        for (let s in locationData) {
            if (locationData[s].includes(pkg.starting_location)) { 
                selectedState = s; 
                break; 
            }
        }
    }

    const stateOptions = Object.keys(locationData).map(s => 
        `<option value="${s}" ${selectedState === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    // 2. Build Destination Checkboxes
    const destHtml = tourDestinations.map(d => `
        <label style="display:flex; align-items:center; gap:5px; padding:5px 10px; background:white; border-radius:5px; border:1px solid #ddd; font-size:13px; cursor:pointer;">
            <input type="checkbox" class="d-check" value="${d}" ${pkgDestinations.includes(d) ? 'checked' : ''}> ${d}
        </label>
    `).join('');

    // 3. Build Vehicle List (Matches your vehicleTypes array)
    const vehicleHtml = vehicleTypes.map(v => {
        const existing = pkgVehicles.find(ev => ev.id === v.id);
        return `
        <div style="display:flex; align-items:center; gap:10px; background:#fff8f0; padding:10px; border-radius:10px; border:1px solid #ffeaa7; margin-bottom:8px;">
            <input type="checkbox" class="v-enable" data-id="${v.id}" ${existing ? 'checked' : ''}>
            <span style="font-size:20px;">${v.icon}</span>
            <b style="flex:1;">${v.name}</b>
            <input type="number" class="v-rate" data-id="${v.id}" placeholder="? Rate" style="width:80px; padding:5px;" value="${existing ? existing.rate : ''}">
            <input type="number" class="v-max" data-id="${v.id}" placeholder="Max" style="width:60px; padding:5px;" value="${existing ? existing.max_cars : '1'}">
        </div>`;
    }).join('');

    // 4. Render the Form
    area.innerHTML = `
        <div class="card" style="background:white; padding:30px; border:1px solid #ff9f43; border-radius:12px; max-width:800px; margin:auto;">
            <h3 style="color:#ff9f43; margin-top:0;">${isEdit ? '?? Edit Package' : '?? Create New Package'}</h3>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                <input type="text" id="p-title" placeholder="Package Title" value="${isEdit ? pkg.title : ''}" style="padding:12px; border-radius:8px; border:1px solid #ddd;">
                <select id="p-state" onchange="window.updateCities()" style="padding:12px; border-radius:8px; border:1px solid #ddd;">
                    <option value="">Select State</option>
                    ${stateOptions}
                </select>
            </div>

            <select id="p-city" style="width:100%; margin-bottom:15px; padding:12px; border-radius:8px; border:1px solid #ddd;">
                ${isEdit && selectedState ? locationData[selectedState].map(c => `<option value="${c}" ${pkg.starting_location === c ? 'selected' : ''}>${c}</option>`).join('') : '<option value="">Select City</option>'}
            </select>
            
            <p><b>Destinations:</b></p>
            <div style="background:#f9f9f9; padding:15px; border-radius:10px; max-height:150px; overflow-y:auto; display:flex; flex-wrap:wrap; gap:8px; border:1px solid #eee; margin-bottom:20px;">
                ${destHtml}
            </div>

            <p><b>Vehicle Pricing & Availability:</b></p>
            <div style="margin-bottom:20px;">
                ${vehicleHtml}
            </div>

            <textarea id="p-desc" style="height:120px; width:100%; padding:12px; border-radius:8px; border:1px solid #ddd;" placeholder="Enter Itinerary Details...">${isEdit ? (pkg.description || '') : ''}</textarea>
            
            <div style="display:flex; gap:10px; margin-top:25px;">
                <button onclick="window.processSave('${isEdit ? pkg.id : ''}')" style="background:#2ecc71; color:white; flex:2; height:50px; font-weight:bold; cursor:pointer; border:none; border-radius:8px; font-size:16px;">
                    ${isEdit ? 'SAVE CHANGES' : 'PUBLISH PACKAGE'}
                </button>
                <button onclick="window.showTab('packages')" style="background:#eee; flex:1; border:none; border-radius:8px; cursor:pointer;">Cancel</button>
            </div>
        </div>`;
};

// --- SAVE LOGIC ---
window.processSave = function(id) {
    // If id is empty string or "undefined", treat as null (new package)
    const cleanId = (id && id !== "undefined" && id !== "") ? id : null;
    window.handleSave(cleanId);
};

window.handleSave = async function(pkgId) {
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    
    // Collect checked destinations
    const selectedDests = Array.from(document.querySelectorAll('.d-check:checked')).map(el => el.value);
    
    // Collect checked vehicles and their rates
    const selectedVehicles = [];
    document.querySelectorAll('.v-enable:checked').forEach(el => {
        const vId = el.dataset.id;
        const rate = parseFloat(document.querySelector(`.v-rate[data-id="${vId}"]`).value) || 0;
        const max = parseInt(document.querySelector(`.v-max[data-id="${vId}"]`).value) || 1;
        const vType = vehicleTypes.find(vt => vt.id === vId);
        
        selectedVehicles.push({
            id: vId,
            name: vType.name,
            rate: rate,
            max_cars: max,
            icon: vType.icon
        });
    });

    const pkgData = {
        title: document.getElementById('p-title').value,
        starting_location: document.getElementById('p-city').value,
        destination: selectedDests,
        vehicles: selectedVehicles, // Saved as JSON for the booking side
        description: document.getElementById('p-desc').value,
        agency_id: user.id
    };

    try {
        let response;
        if (pkgId) {
            // Update existing
            response = await client.from('packages').update(pkgData).eq('id', pkgId);
        } else {
            // Insert new
            response = await client.from('packages').insert([pkgData]);
        }

        if (response.error) throw response.error;

        alert("? Success! Package saved and updated in Customer Dashboard.");
        window.showTab('packages'); // Refresh the list

    } catch (err) {
        console.error("Save Error:", err);
        alert("? Unsuccessful save. Error: " + err.message);
    }
};

// Helper to update city dropdown
window.updateCities = function() {
    const state = document.getElementById('p-state').value;
    const citySelect = document.getElementById('p-city');
    if (!state) {
        citySelect.innerHTML = '<option value="">Select City</option>';
        return;
    }
    const cities = locationData[state] || [];
    citySelect.innerHTML = cities.map(c => `<option value="${c}">${c}</option>`).join('');
};

// 11. HANDLESAVE - SILENT GUARD VERSION
window.handleSave = async function(id = null) {
    console.log("Save process started for ID:", id);
    
    // 1. Safe Button Reference
    const btn = document.getElementById('save-btn') || document.querySelector('button[onclick*="handleSave"]');
    
    // The ?. prevents the "null" error if the button isn't found
    if (btn) {
        btn.innerText = "Processing...";
        btn.disabled = true;
    }

    try {
        const client = getClient();
        const { data: { user } } = await client.auth.getUser();
        if (!user) throw new Error("No user logged in");

        const selectedVehicles = [];
        document.querySelectorAll('.v-enable:checked').forEach(checkbox => {
            const vid = checkbox.dataset.id;
            const rateInput = document.querySelector(`.v-rate[data-id="${vid}"]`);
            const maxInput = document.querySelector(`.v-max[data-id="${vid}"]`);
            
            // Safety check for inputs
            if (!rateInput) return;

            const rate = parseFloat(rateInput.value) || 0;
            const vInfo = window.vehicleTypes ? window.vehicleTypes.find(v => v.id === vid) : null;
            
            if (rate > 0) {
                selectedVehicles.push({ 
                    id: vid, 
                    name: vInfo ? vInfo.name : "Vehicle", 
                    rate: rate, 
                    max_cars: maxInput ? (parseInt(maxInput.value) || 1) : 1,
                    icon: vInfo ? vInfo.icon : "??" 
                });
            }
        });

        if (selectedVehicles.length === 0) {
            alert("Please select at least one vehicle and enter a price.");
            if (btn) { btn.innerText = "SAVE CHANGES"; btn.disabled = false; }
            return;
        }

        const pkgData = {
            agency_id: user.id,
            title: document.getElementById('p-title')?.value || "Untitled",
            starting_location: document.getElementById('p-city')?.value || "",
            description: document.getElementById('p-desc')?.value || "",
            destination: Array.from(document.querySelectorAll('.d-check:checked')).map(c => c.value),
            vehicles: selectedVehicles
        };

        // Database Action
        const isExisting = (id && id !== "null" && id !== "" && id !== "undefined");
        let result;

        if (isExisting) {
            result = await client.from('packages').update(pkgData).eq('id', id);
        } else {
            result = await client.from('packages').insert([pkgData]);
        }

        if (result.error) throw result.error;

        alert("? Package Saved!");
        window.showTab('packages');

    } catch (e) {
        console.error("CRITICAL SAVE ERROR:", e);
        alert("Error: " + e.message);
        
        // Reset button if it fails
        if (btn) {
            btn.innerText = "Try Again";
            btn.disabled = false;
        }
    }
};

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
