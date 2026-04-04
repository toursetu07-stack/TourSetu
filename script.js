/* =========================================
   1. GLOBAL HELPERS & LOCATION DATA
   ========================================= */
window.updateCities = function() {
    const state = document.getElementById('p-state').value;
    const citySelect = document.getElementById('p-city');
    if (!state || !locationData[state]) {
        citySelect.innerHTML = '<option value="">Select City</option>';
        return;
    }
    citySelect.innerHTML = locationData[state].map(c => `<option value="${c}">${c}</option>`).join('');
};

window.processSave = (id) => {
    if (id && id !== "undefined" && id !== "" && id !== "null") {
        window.handleSave(id);
    } else {
        window.handleSave();
    }
};

const locationData = {
    "Uttarakhand": ["Dehradun", "Rishikesh", "Haridwar", "Kashipur", "Rudpur", "Lalkuan", "Kichha", "Bareilly", "Pantnagar", "Lalpur", "Almora", "Nainital"],
    "Delhi": ["New Delhi", "Old Delhi", "Saket", "Dwarka"],
    "Punjab": ["Amritsar", "Ludhiana", "Patiala"],
    "Uttar Pradesh": ["Lucknow", "Ayodhya", "Vrindavan", "Varanasi", "Agra"]
};

const tourDestinations = [
    "Char Dham Yatra (Uttarakhand)", "Kedarnath (Uttarakhand)", "Badrinath (Uttarakhand)", 
    "Gangotri (Uttarakhand)", "Yamunotri (Uttarakhand)", "Vaishno Devi (Katra)", 
    "Jagarnath (Puri, Odisha)", "Somnath (Gujarat)", "Tirumala Venkateswara (Tirupati)", 
    "Ram Janmabhoomi (Ayodhya)", "Banke Bihari (Vrindavan)", "Prem Mandir (Vrindavan)", 
    "Ajmer Sharif Dargah (Rajasthan)", "Golden Temple (Amritsar)", "Basilica of Bom Jesus (Goa)"
];

const vehicleTypes = [
    { id: 'car4', name: '4 Seater Car', icon: '🚗' },
    { id: 'car6', name: '6 Seater SUV', icon: '🚙' },
    { id: 'car7', name: '7 Seater SUV', icon: '🚐' },
    { id: 'tempo', name: 'Tempo Traveler', icon: '🚌' },
    { id: 'bus', name: 'Luxury Bus', icon: '🚍' }
];

/* =========================================
   2. CONFIGURATION & SUPABASE CLIENT
   ========================================= */
const SUPABASE_URL = 'https://udfwcqrmksfyeigxgdws.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZndjcXJta3NmeWVpZ3hnZHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTIyNTQsImV4cCI6MjA4ODAyODI1NH0.zf1taGGbEszA0cKMwFw8rKBuT2OwYqUjF45MqZXaEBw';

let _supabase = null;
let isLoginMode = true;

function getClient() {
    if (!_supabase && window.supabase) {
        _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _supabase;
}

/* =========================================
   3. AUTHENTICATION LOGIC
   ========================================= */

async function handleAuth() {
    const status = document.getElementById('status');
    const btn = document.getElementById('auth-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if(!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        status.innerText = "⚠️ Please enter email and password";
        return;
    }

    const client = getClient();
    if (!client) {
        status.innerText = "❌ Supabase not initialized";
        return;
    }

    btn.disabled = true;
    status.innerText = "⏳ Processing...";

    try {
        if (isLoginMode) {
            const { data, error } = await client.auth.signInWithPassword({ email, password });
            if (error) throw error;
            showDashboard(data.user);
        } else {
            const role = document.getElementById('role').value;
            const metadata = { role, is_approved: (role === 'customer') };
            
            if (role === 'agency') {
                metadata.gst = document.getElementById('gst-no').value || "N/A";
                metadata.reg_no = document.getElementById('biz-reg').value || "N/A";
                metadata.license = document.getElementById('biz-lic').value || "N/A";
                metadata.phone = document.getElementById('biz-phone').value || "N/A";
            }
            
            const { error } = await client.auth.signUp({ 
                email, 
                password, 
                options: { 
                    data: metadata,
                    emailRedirectTo: window.location.href 
                } 
            });

            if (error) throw error;
            
            status.innerHTML = `
                <div style="background:#fff4e6; padding:15px; border-radius:10px; border:1px solid #ffd8a8; color:#d9480f; text-align:left; margin-top:10px;">
                    <strong style="display:block; margin-bottom:5px;">✉️ Check your Inbox!</strong>
                    A link was sent to <b>${email}</b>. You must verify your email before you can log in.
                </div>`;
            
            emailInput.value = "";
            passwordInput.value = "";
        }
    } catch (err) {
        status.innerText = "❌ " + err.message;
    } finally {
        btn.disabled = false;
    }
}

function toggleMode() { 
    isLoginMode = !isLoginMode; 
    renderAuthUI(); 
}

function toggleBusinessFields() {
    const role = document.getElementById('role').value;
    const businessFields = document.getElementById('business-fields');
    if (businessFields) businessFields.style.display = (role === 'agency') ? 'block' : 'none';
}

/* =========================================
   4. APP NAVIGATION & DASHBOARD ROUTING
   ========================================= */

async function initApp() {
    console.log("TourSetu Booting Up...");
    const client = getClient();
    if (!client) return;
    
    const { data: { user } } = await client.auth.getUser();
    if (user) {
        showDashboard(user);
    } else {
        renderAuthUI();
    }
}

async function showDashboard(user) {
    const role = user.user_metadata.role || 'customer';
    if (role === 'agency') {
        if (typeof renderAgencyDashboard === "function") renderAgencyDashboard(user);
        else document.getElementById('app').innerHTML = `<h2>Agency Home</h2><button onclick="window.handleLogout()">Logout</button>`;
    } else {
        if (typeof renderCustomerHomepage === "function") renderCustomerHomepage(user);
        else document.getElementById('app').innerHTML = `<h2>Traveler Home</h2><button onclick="window.handleLogout()">Logout</button>`;
    }
}

async function handleLogout() {
    await getClient().auth.signOut();
    window.location.reload();
}

/* =========================================
   5. UI RENDERING
   ========================================= */

function renderAuthUI() {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = `
        <div class="card" style="max-width:450px; margin: 80px auto; padding:40px; background:white; text-align:center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius:15px; font-family: sans-serif;">
            <h1 style="color:#ff9f43; margin-bottom:10px;">TourSetu</h1>
            <h2 id="form-title">${isLoginMode ? "Welcome Back" : "Create Account"}</h2>
            <input type="email" id="email" placeholder="Email Address" style="width:100%; padding:12px; margin:10px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
            <input type="password" id="password" placeholder="Password" style="width:100%; padding:12px; margin:10px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
            
            <div id="role-selection" style="display: ${isLoginMode ? 'none' : 'block'}; margin: 10px 0;">
                <label style="display:block; margin-bottom:5px; font-size:12px; color:#666;">REGISTER AS</label>
                <select id="role" onchange="window.toggleBusinessFields()" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
                    <option value="customer">Traveler</option>
                    <option value="agency">Travel Agency</option>
                </select>
            </div>

            <div id="business-fields" style="display:none;">
                <input type="text" id="gst-no" placeholder="GST Number" style="width:100%; padding:12px; margin:5px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                <input type="text" id="biz-reg" placeholder="Business Reg No" style="width:100%; padding:12px; margin:5px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                <input type="text" id="biz-lic" placeholder="Trade License" style="width:100%; padding:12px; margin:5px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                <input type="text" id="biz-phone" placeholder="Mobile / Contact No" style="width:100%; padding:12px; margin:5px 0; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
            </div>

            <button id="auth-btn" onclick="window.handleAuth()" style="background:#ff9f43; color:white; width:100%; padding:14px; border-radius:8px; font-weight:bold; cursor:pointer; border:none; margin-top:20px; font-size:16px;">
                ${isLoginMode ? "Login" : "Register"}
            </button>
            
            <p style="margin-top:20px; font-size:14px; color:#636e72;">
                ${isLoginMode ? "Don't have an account?" : "Already have account?"} 
                <span onclick="window.toggleMode()" style="color:#ff9f43; cursor:pointer; font-weight:bold;">${isLoginMode ? "Create Account" : "Login"}</span>
            </p>
            <div id="status" style="margin-top:15px; font-size:13px; font-weight:bold;"></div>
        </div>
    `;
}

/* =========================================
   6. EXPORT TO GLOBAL SCOPE
   ========================================= */
window.handleAuth = handleAuth;
window.toggleMode = toggleMode;
window.toggleBusinessFields = toggleBusinessFields;
window.handleLogout = handleLogout;

document.addEventListener('DOMContentLoaded', initApp);
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
                        <span id="cust-notif-badge" style="display:none; position:absolute; top:-10px; right:-5px; background:#ff7675; color:white; font-size:10px; padding:3px 7px; border-radius:50%; border:2px solid white; font-weight:bold;">🔔</span>
                   </div>
                   <button onclick="confirmCustomerLogout()" style="background:#f1f2f6; color:#ff7675; width:auto; padding:10px 25px; border-radius:10px; font-weight:bold; cursor:pointer; border:none;">Logout</button>
                 </div>
             </div>
               <div id="customer-pkg-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap:30px;"></div>
           </div>
        </div>

        <div id="booking-success-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.9); z-index:2000; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
            <div style="font-size:60px; margin-bottom:20px;">✅</div>
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
                       <div>🚗 Vehicles: ${b.selected_vehicles}</div>
                       <div style="margin-top:5px;">Status: <b style="color:${color}">${b.status.toUpperCase()}</b></div>
                   </div>
               </div>
               ${b.status === 'pending' ? `<button onclick="deleteBookingRequest(${b.id})" style="color:#ff7675; cursor:pointer; background:none; border:none;">🗑️</button>` : ''}
            </div>
            <div style="margin-top:20px; padding:15px; border-radius:10px; background:#f8f9fa;">
               ${b.status === 'paid' ? `<h3>📞 ${b.agency_contact || 'Contact info missing'}</h3>` : 
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
// 8. PACKAGE DETAIL VIEW (CODEPEN SYNTAX-SAFE VERSION)
window.showPackageDetails = function(pEncoded) {
    const p = JSON.parse(decodeURIComponent(pEncoded));
    const modal = document.getElementById('detail-modal');
    const body = document.getElementById('detail-view-body');
    
    // Calculate values outside the string to prevent SyntaxErrors
    const historyList = p.updates_history || [];
    const vehicleList = p.vehicles || [];
    const routeInfo = `${p.starting_location} ➔ ${Array.isArray(p.destination) ? p.destination.join(' ➔ ') : p.destination}`;

    // Pre-build Vehicle HTML
    const vehicleHtml = vehicleList.map(v => `
        <div style="padding:12px; border:1px solid #eee; border-radius:10px; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <input type="checkbox" class="book-v-check" data-id="${v.id}" data-rate="${v.rate}" onchange="toggleQtyInput('${v.id}')">
                    <b>${v.name}</b>
                </div>
                <span style="color:#2ecc71; font-weight:bold;">₹${v.rate}</span>
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
                <button onclick="document.getElementById('detail-modal').style.display='none'" style="border:none; background:none; font-size:20px; cursor:pointer;">✕</button>
            </div>
            <p style="color:#ff9f43; font-weight:bold;">${routeInfo}</p>
            
            <div style="margin:15px 0; padding:10px; background:#f9f9f9; border-radius:8px;">
                <p style="white-space: pre-line; font-size:14px;">${p.description || 'No description.'}</p>
            </div>
            
            <h4>Select Vehicles</h4>
            ${vehicleHtml}

            <div style="background:#2d3436; color:white; padding:15px; border-radius:8px; margin-top:15px; display:flex; justify-content:space-between;">
                <span>TOTAL:</span>
                <span id="live-total-display" style="color:#ff9f43; font-weight:bold;">₹0</span>
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
   2. CONFIGURATION & GLOBAL STATE
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
    { id: 'car4', name: '4 Seater Car', icon: '🚗' },
    { id: 'car6', name: '6 Seater SUV', icon: '🚙' },
    { id: 'car7', name: '7 Seater SUV', icon: '🚐' },
    { id: 'tempo', name: 'Tempo Traveler', icon: '🚌' },
    { id: 'bus', name: 'Luxury Bus', icon: '🚍' }
];

const locationData = {
 "Uttarakhand": ["Dehradun", "Rishikesh", "Haridwar", "Kashipur", "Rudpur", "Lalkuan", "Kichha", "Bareilly", "Pantnagar", "Lalpur", "Almora", "Nainital"],
  "Delhi": ["New Delhi", "Old Delhi", "Saket", "Dwarka"],
  "Punjab": ["Amritsar", "Ludhiana", "Patiala"],
  "Uttar Pradesh": ["Lucknow", "Ayodhya", "Vrindavan", "Varanasi", "Agra"]
};

/* =========================================
   3. AGENCY DASHBOARD
   ========================================= */
function renderAgencyDashboard(user) {
    const app = document.getElementById('app');
    app.style.maxWidth = "100%";
    
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
            <div id="action-modal-content" style="background:white; padding:30px; border-radius:15px; max-width:400px; width:100%; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                </div>
        </div>
    `;
    showTab('earnings'); 
}

window.confirmLogout = () => document.getElementById('logout-modal').style.display = 'flex';
window.executeLogout = async () => { 
    await getClient().auth.signOut(); 
    if(typeof renderAuthUI === 'function') renderAuthUI(); 
    else window.location.reload(); 
};

window.showTab = async function(tabName) {
    const container = document.getElementById('main-content');
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;

    const { data: myPkgs } = await client.from('packages').select('id').eq('agency_id', user.id);
    const myPkgIds = (myPkgs || []).map(p => p.id);

    let pendingCount = 0;
    if (myPkgIds.length > 0) {
        const { count } = await client.from('bookings').select('*', { count: 'exact', head: true }).in('package_id', myPkgIds).eq('status', 'pending');
        pendingCount = count || 0;
    }

    const badge = document.getElementById('bell-badge');
    const sideCount = document.getElementById('side-notif-count');
    const bellIcon = document.getElementById('notif-bell');
    
    if (badge && pendingCount > 0) {
        badge.innerText = pendingCount; badge.style.display = 'block';
        sideCount.innerText = pendingCount; sideCount.style.display = 'block';
        bellIcon.style.color = '#ff7675';
    } else if (badge) {
        badge.style.display = 'none'; sideCount.style.display = 'none';
        bellIcon.style.color = 'white';
    }

    if (tabName === 'earnings') {
        container.innerHTML = `<h1>Overview</h1>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px;">
                <div class="card" style="border-top:5px solid #2ecc71; background:white; padding:25px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"><small>REVENUE</small><h2>₹0</h2></div>
                <div class="card" style="border-top:5px solid #ff9f43; background:white; padding:25px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"><small>PENDING BOOKINGS</small><h2>${pendingCount}</h2></div>
                <div class="card" style="border-top:5px solid #3498db; background:white; padding:25px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"><small>ACTIVE PACKAGES</small><h2 id="act-pkg-count">...</h2></div>
            </div>`;
        const { count } = await client.from('packages').select('*', { count: 'exact', head: true }).eq('agency_id', user.id);
        if(document.getElementById('act-pkg-count')) document.getElementById('act-pkg-count').innerText = count || 0;
    } 
    else if (tabName === 'bookings') {
        container.innerHTML = `<h1>Customer Bookings</h1><div id="booking-list-area">Loading...</div>`;
        const listArea = document.getElementById('booking-list-area');

        if (myPkgIds.length === 0) {
            listArea.innerHTML = `<p style="padding:20px; color:#666;">No packages created yet. Go to 'My Packages' to start.</p>`;
            return;
        }

        const { data: bookingsData } = await client.from('bookings').select('*').in('package_id', myPkgIds).order('created_at', { ascending: false });

        if (!bookingsData || bookingsData.length === 0) {
            listArea.innerHTML = `<p style="padding:20px; color:#666;">No booking requests found.</p>`;
            return;
        }

        listArea.innerHTML = bookingsData.map(b => {
            const isPaid = b.status === 'paid';
            const isPending = b.status === 'pending';
            const displayPhone = isPaid ? b.customer_phone : "Locked (Unlocks after Payment)";
            const phoneColor = isPaid ? "#ff9f43" : "#999";
            
            let statusColor = '#ff9f43';
            if (b.status === 'cancelled' || b.status === 'denied') statusColor = '#ff7675';
            if (b.status === 'approved' || b.status === 'paid') statusColor = '#2ecc71';

            return `
            <div class="card" style="background:white; padding:25px; margin-bottom:20px; border-left:5px solid ${statusColor}; border-radius:8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div>
                        <h3 style="margin:0; color:#2d3436;">${b.package_title}</h3>
                        <p style="font-size:12px; color:#636e72;">Requested: ${new Date(b.created_at).toLocaleDateString()}</p>
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

                <div style="margin-top:15px; border-top: 1px dashed #ddd; padding-top:10px;">
                    <p style="font-size:13px; margin:0;"><b>Vehicles:</b> ${b.selected_vehicles}</p>
                </div>

                ${isPending ? `
                    <div style="margin-top:20px; border-top:1px solid #eee; padding-top:15px; display:flex; gap:12px;">
                        <button onclick="openActionModal('${b.id}', 'approved')" style="background:#2ecc71; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;">Approve</button>
                        <button onclick="openActionModal('${b.id}', 'denied')" style="background:#ff7675; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;">Deny</button>
                    </div>
                ` : ''}
            </div>`;
        }).join('');
    }
    else if (tabName === 'packages') {
        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h1>My Packages</h1>
                <button onclick="showPackageForm()" style="padding:12px 25px; background:#2ecc71; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">+ CREATE NEW</button>
            </div>
            <div id="package-form-area"></div>
            <div id="pkg-list-container" style="margin-top:25px;"></div>`;
        if(typeof loadPackageList === 'function') loadPackageList(user.id);
    }
    else if (tabName === 'profile') {
        const meta = user.user_metadata || {};
        container.innerHTML = `
            <h1>Agency Profile</h1>
            <div class="card" style="background:white; padding:30px; max-width:600px; border-left:5px solid #ff9f43; border-radius:8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <div style="margin-bottom:20px;"><label style="color:#666; font-size:11px; font-weight:bold;">EMAIL</label><h3>${user.email}</h3></div>
                <div style="margin-bottom:20px;"><label style="color:#666; font-size:11px; font-weight:bold;">CONTACT</label><h3 style="color:#ff9f43;">${meta.phone || 'N/A'}</h3></div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
                    <div><label style="color:#666; font-size:11px; font-weight:bold;">GST</label><p style="margin:5px 0;">${meta.gst || 'N/A'}</p></div>
                    <div><label style="color:#666; font-size:11px; font-weight:bold;">REG NO</label><p style="margin:5px 0;">${meta.reg_no || 'N/A'}</p></div>
                </div>
                <p style="border-top:1px solid #eee; padding-top:15px; font-size:12px; color:#999;">
                    Status: ${meta.is_approved ? '✅ Verified' : '⏳ Pending Verification'}
                </p>
            </div>`;
    }
};

/* =========================================
   4. MODAL & STATUS FLOWS
   ========================================= */
window.openActionModal = function(bookingId, type) {
    const modal = document.getElementById('action-modal');
    const content = document.getElementById('action-modal-content');
    modal.style.display = 'flex';

    if (type === 'approved') {
        content.innerHTML = `
            <h3 style="color:#2ecc71; margin-top:0;">Approve Booking?</h3>
            <p style="font-size:14px; color:#666;">The customer will be notified to proceed with the payment.</p>
            <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px;">ENTER CONTACT NO. FOR PAYMENT:</label>
            <input type="text" id="modal-contact-input" placeholder="e.g. +91 9876543210" style="width:100%; padding:12px; margin-bottom:20px; border:1px solid #ddd; border-radius:5px;">
            <div style="display:flex; gap:10px;">
                <button onclick="processStatusUpdate('${bookingId}', 'approved')" style="flex:1; background:#2ecc71; color:white; border:none; padding:12px; border-radius:5px; cursor:pointer; font-weight:bold;">CONFIRM APPROVAL</button>
                <button onclick="closeActionModal()" style="flex:1; background:#eee; border:none; padding:12px; border-radius:5px; cursor:pointer;">CANCEL</button>
            </div>
        `;
    } else {
        content.innerHTML = `
            <h3 style="color:#ff7675; margin-top:0;">Deny Request?</h3>
            <p style="font-size:14px; color:#666;">This will cancel the request and notify the customer.</p>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button onclick="processStatusUpdate('${bookingId}', 'denied')" style="flex:1; background:#ff7675; color:white; border:none; padding:12px; border-radius:5px; cursor:pointer; font-weight:bold;">CONFIRM DENIAL</button>
                <button onclick="closeActionModal()" style="flex:1; background:#eee; border:none; padding:12px; border-radius:5px; cursor:pointer;">CANCEL</button>
            </div>
        `;
    }
};

window.closeActionModal = () => document.getElementById('action-modal').style.display = 'none';

window.processStatusUpdate = async function(bookingId, newStatus) {
    const client = getClient();
    let updateData = { status: newStatus };

    if (newStatus === 'approved') {
        const contact = document.getElementById('modal-contact-input').value;
        if (!contact.trim()) { alert("Please enter a contact number!"); return; }
        updateData.agency_contact = contact;
    }

    try {
        const { error } = await client.from('bookings').update(updateData).eq('id', bookingId);
        if (!error) {
            const content = document.getElementById('action-modal-content');
            content.innerHTML = `
                <div style="text-align:center; padding:20px;">
                    <div style="font-size:40px; margin-bottom:10px;">${newStatus === 'approved' ? '✅' : '🚫'}</div>
                    <h3 style="color:${newStatus === 'approved' ? '#2ecc71' : '#ff7675'};">${newStatus === 'approved' ? 'Approved!' : 'Denied'}</h3>
                    <button onclick="closeActionModal(); showTab('bookings');" style="background:#2d3436; color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer; margin-top:10px;">CLOSE</button>
                </div>`;
        } else alert("Error: " + error.message);
    } catch (e) { alert("System error."); }
};

// --- 10. PACKAGE FORM (Fixed & Optimized) ---
window.showPackageForm = function(pEncoded = null) {
    let pkg = null;
    try {
        pkg = pEncoded ? JSON.parse(decodeURIComponent(pEncoded)) : null;
    } catch (e) { console.error("Data Parse Error:", e); }
    
    const isEdit = !!pkg;
    const area = document.getElementById('package-form-area');
    if (!area) return; // Safety check

    const pkgDestinations = isEdit ? (pkg.destination || []) : [];
    const pkgVehicles = isEdit ? (pkg.vehicles || []) : [];
    
    // Pre-build State Options
    let selectedState = "";
    if (isEdit) {
        for (let s in locationData) {
            if (locationData[s].includes(pkg.starting_location)) { selectedState = s; break; }
        }
    }
    const stateOptions = Object.keys(locationData).map(s => 
        `<option value="${s}" ${selectedState === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    // Pre-build Destination Checkboxes
    const destHtml = tourDestinations.map(d => `
        <label style="display:flex; align-items:center; gap:5px; padding:5px 10px; background:white; border-radius:5px; border:1px solid #ddd; font-size:13px;">
            <input type="checkbox" class="d-check" value="${d}" ${pkgDestinations.includes(d) ? 'checked' : ''}> ${d}
        </label>
    `).join('');

    // Pre-build Vehicle List
    const vehicleHtml = vehicleTypes.map(v => {
        const existing = pkgVehicles.find(ev => ev.id === v.id);
        return `
        <div style="display:flex; align-items:center; gap:10px; background:#fff8f0; padding:10px; border-radius:10px; border:1px solid #ffeaa7;">
            <input type="checkbox" class="v-enable" data-id="${v.id}" ${existing ? 'checked' : ''}>
            <span style="font-size:20px;">${v.icon}</span>
            <b style="flex:1;">${v.name}</b>
            <input type="number" class="v-rate" data-id="${v.id}" placeholder="₹ Rate" style="width:80px;" value="${existing ? existing.rate : ''}">
            <input type="number" class="v-max" data-id="${v.id}" placeholder="Units" style="width:70px;" value="${existing ? existing.max_cars : '1'}">
        </div>`;
    }).join('');

    // Render the Form
    area.innerHTML = `
        <div class="card" style="background:white; padding:30px; margin-top:20px; border:1px solid #ff9f43; border-radius:12px;">
            <h3 style="color:#ff9f43; margin-top:0;">${isEdit ? '✏️ Edit Package' : '🎒 Create New Package'}</h3>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                <input type="text" id="p-title" placeholder="Package Title" value="${isEdit ? pkg.title : ''}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:5px;">
                <select id="p-state" onchange="window.updateCities()" style="padding:10px; border:1px solid #ddd; border-radius:5px;">
                    <option value="">Select State</option>
                    ${stateOptions}
                </select>
            </div>

            <select id="p-city" style="width:100%; margin-bottom:15px; padding:10px; border:1px solid #ddd; border-radius:5px;">
                ${isEdit ? locationData[selectedState].map(c => `<option value="${c}" ${pkg.starting_location === c ? 'selected' : ''}>${c}</option>`).join('') : '<option value="">Select City</option>'}
            </select>
            
            <div style="background:#f9f9f9; padding:15px; border-radius:10px; max-height:150px; overflow-y:auto; display:flex; flex-wrap:wrap; gap:8px;">
                ${destHtml}
            </div>

            <div style="display:grid; grid-template-columns: 1fr; gap:10px; margin-top:20px;">
                ${vehicleHtml}
            </div>

            <textarea id="p-desc" style="height:100px; width:100%; margin-top:20px; padding:10px; border:1px solid #ddd; border-radius:5px;" placeholder="Itinerary...">${isEdit ? pkg.description : ''}</textarea>
            
            <div style="display:flex; gap:10px; margin-top:25px;">
                <button onclick="window.processSave('${isEdit ? pkg.id : ''}')" id="save-btn" style="background:#2ecc71; color:white; flex:2; height:50px; font-weight:bold; cursor:pointer; border:none; border-radius:8px;">
                    ${isEdit ? 'SAVE CHANGES' : 'PUBLISH PACKAGE'}
                </button>
                <button onclick="document.getElementById('package-form-area').innerHTML=''" style="background:#eee; flex:1; border:none; border-radius:8px; cursor:pointer;">Cancel</button>
            </div>
        </div>`;
};
// 11. HANDLESAVE (Synced with Dynamic Form)
window.handleSave = async function(id = null) {
    const client = getClient();
    const btn = document.getElementById('save-btn');
    
    // Safety Guard: Stop if the button doesn't exist (form closed)
    if (!btn) {
        console.error("Save button not found. Is the form open?");
        return;
    }

    try {
        // 1. Get current user
        const { data: { user }, error: userError } = await client.auth.getUser();
        if (userError || !user) {
            alert("Please login again to save.");
            window.location.reload(); // Refresh to show login card
            return;
        }

        // 2. Validation Checks
        const titleVal = document.getElementById('p-title') ? document.getElementById('p-title').value : null;
        const cityVal = document.getElementById('p-city') ? document.getElementById('p-city').value : null;
        const descVal = document.getElementById('p-desc') ? document.getElementById('p-desc').value : "";

        if (!titleVal) return alert("Please enter a Package Title.");
        if (!cityVal) return alert("Please select or enter a Starting City.");

        // 3. Collect Vehicle Data
        const selectedVehicles = [];
        document.querySelectorAll('.v-enable:checked').forEach(checkbox => {
            const vid = checkbox.dataset.id;
            const rateInput = document.querySelector(`.v-rate[data-id="${vid}"]`);
            const maxInput = document.querySelector(`.v-max[data-id="${vid}"]`);
            
            const rate = rateInput ? parseFloat(rateInput.value) : 0;
            const max = maxInput ? parseInt(maxInput.value) : 1;
            
            if (rate > 0) {
                selectedVehicles.push({ 
                    id: vid, 
                    name: vid.charAt(0).toUpperCase() + vid.slice(1), 
                    rate: rate, 
                    max_cars: max 
                });
            }
        });

        if (selectedVehicles.length === 0) {
            return alert("Please select at least one vehicle and enter a price.");
        }

        // 4. UI Feedback: Start Loading
        btn.innerText = "⏳ Saving to Cloud...";
        btn.disabled = true;

        // 5. Build the Data Object
        const pkgData = {
            agency_id: user.id,
            title: titleVal,
            starting_location: cityVal,
            description: descVal,
            destination: Array.from(document.querySelectorAll('.d-check:checked')).map(c => c.value),
            vehicles: selectedVehicles
        };

        if (id && id !== "undefined" && id !== "" && id !== "null") {
            // --- UPDATE MODE (With History) ---
            const { data: oldPkg, error: fetchError } = await client
                .from('packages')
                .select('title, description, vehicles, destination, updates_history')
                .eq('id', id)
                .single();
            
            if (fetchError) throw fetchError;

            const history = Array.isArray(oldPkg.updates_history) ? oldPkg.updates_history : [];
            
            history.push({ 
                title: oldPkg.title, 
                description: oldPkg.description, 
                vehicles: oldPkg.vehicles, 
                destination: oldPkg.destination, 
                updated_at: new Date().toISOString() 
            });
            
            pkgData.updates_history = history;

            const { error: updateError } = await client
                .from('packages')
                .update(pkgData)
                .eq('id', id);
            
            if (updateError) throw updateError;
            console.log("Package Updated Successfully");
        } else {
            // --- INSERT MODE (New Package) ---
            pkgData.updates_history = []; 
            const { error: insertError } = await client
                .from('packages')
                .insert([pkgData]);
            
            if (insertError) throw insertError;
            console.log("New Package Created Successfully");
        }
        
        // 6. Success: Clear form and refresh UI
        alert("Success! Package Saved.");
        document.getElementById('package-form-area').innerHTML = ''; // Hide form
        if (typeof loadPackageList === "function") {
            loadPackageList(user.id); 
        }

    } catch (e) {
        console.error("Save Error:", e);
        alert("Error saving: " + e.message);
        btn.disabled = false;
        btn.innerText = "Try Again";
    }
};

// 12. IMPROVED DELETE (With UI Refresh)
window.deletePkg = async (id) => { 
    if(confirm("Are you sure you want to delete this package? This cannot be undone.")) { 
        const client = getClient();
        const { data: { user } } = await client.auth.getUser();
        
        const { error } = await client.from('packages').delete().eq('id', id);
        
        if (error) {
            alert("Error deleting: " + error.message);
        } else {
            // Refresh the list immediately
            loadPackageList(user.id);
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
