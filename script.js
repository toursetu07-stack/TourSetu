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
   2. CORE UTILITY FUNCTIONS
   ========================================= */

function getClient() {
    if (!_supabase && window.supabase) {
        _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _supabase;
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
   3. AUTH & DASHBOARD LOGIC
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
        else document.getElementById('app').innerHTML = `<div style="padding:20px;"><h2>Agency Dashboard</h2><p>Welcome, ${user.email}</p><button onclick="handleLogout()">Logout</button></div>`;
    } else {
        if (typeof renderCustomerHomepage === "function") renderCustomerHomepage(user);
        else document.getElementById('app').innerHTML = `<div style="padding:20px;"><h2>Traveler Home</h2><p>Welcome, ${user.email}</p><button onclick="handleLogout()">Logout</button></div>`;
    }
}

async function handleLogout() {
    await getClient().auth.signOut();
    window.location.reload();
}


/* =========================================
   4. UI RENDERING (Login / Signup)
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
                <select id="role" onchange="toggleBusinessFields()" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
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

            <button id="auth-btn" onclick="handleAuth()" style="background:#ff9f43; color:white; width:100%; padding:14px; border-radius:8px; font-weight:bold; cursor:pointer; border:none; margin-top:20px; font-size:16px;">
                ${isLoginMode ? "Login" : "Register"}
            </button>
            
            <p style="margin-top:20px; font-size:14px; color:#636e72;">
                ${isLoginMode ? "Don't have an account?" : "Already have account?"} 
                <span onclick="toggleMode()" style="color:#ff9f43; cursor:pointer; font-weight:bold;">${isLoginMode ? "Create Account" : "Login"}</span>
            </p>
            <div id="status" style="margin-top:15px; font-size:13px; font-weight:bold;"></div>
        </div>
    `;
}

/* =========================================
   5. AUTHENTICATION (With Email Confirmation Logic)
   ========================================= */

async function handleAuth() {
    const status = document.getElementById('status');
    const btn = document.getElementById('auth-btn');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        status.innerText = "⚠️ Please enter email and password";
        return;
    }

    const client = getClient();
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
            
            // SIGNUP WITH REDIRECT
            const { error } = await client.auth.signUp({ 
                email, 
                password, 
                options: { 
                    data: metadata,
                    emailRedirectTo: window.location.href // Sends user back here after confirmation
                } 
            });

            if (error) throw error;
            
            status.innerHTML = `
                <div style="background:#fff4e6; padding:15px; border-radius:10px; border:1px solid #ffd8a8; color:#d9480f; text-align:left; margin-top:10px;">
                    <strong style="display:block; margin-bottom:5px;">✉️ Check your Inbox!</strong>
                    A link was sent to <b>${email}</b>. You must verify your email before you can log in to TourSetu.
                </div>`;
            
            // Clear inputs for security
            document.getElementById('email').value = "";
            document.getElementById('password').value = "";
        }
    } catch (err) {
        status.innerText = "❌ " + err.message;
    } finally {
        btn.disabled = false;
    }
}
/* =========================================
   5. AUTHENTICATION (The "handleAuth" Function)
   ========================================= */

async function handleAuth() {
    const status = document.getElementById('status');
    const btn = document.getElementById('auth-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
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
            // LOGIN LOGIC
            const { data, error } = await client.auth.signInWithPassword({ email, password });
            if (error) throw error;
            showDashboard(data.user);
        } else {
            // SIGNUP LOGIC
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
                    emailRedirectTo: window.location.href // Redirects back to your site after click
                } 
            });

            if (error) throw error;
            
            // Success UI for Email Confirmation
            status.innerHTML = `
                <div style="background:#fff4e6; padding:15px; border-radius:10px; border:1px solid #ffd8a8; color:#d9480f; text-align:left; margin-top:10px;">
                    <strong style="display:block; margin-bottom:5px;">✉️ Check your Inbox!</strong>
                    A link was sent to <b>${email}</b>. You must verify your email before you can log in to TourSetu.
                </div>`;
            
            // Clear inputs for security and better UI
            emailInput.value = "";
            passwordInput.value = "";
        }
    } catch (err) {
        status.innerText = "❌ " + err.message;
    } finally {
        btn.disabled = false;
    }
}

/* =========================================
   6. THE STARTUP SWITCH (Fixed ReferenceError)
   ========================================= */
// Make functions global so HTML onclick can find them
window.handleAuth = handleAuth;
window.toggleMode = toggleMode;
window.toggleBusinessFields = toggleBusinessFields;
window.handleLogout = handleLogout;

// --- New Additions for Package Management ---
window.showPackageForm = showPackageForm; 
window.handleSave = handleSave;
window.processSave = processSave;
window.loadAgencyPackages = loadAgencyPackages;
// --------------------------------------------

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
   9. AGENCY DASHBOARD
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
                   <div onclick="showTab('earnings')" class="nav-item" style="padding:12px; cursor:pointer; border-radius:8px; margin-bottom:5px; transition:0.2s;" onmouseover="this.style.background='#444'" onmouseout="this.style.background='transparent'">📊 Dashboard</div>
                   <div onclick="showTab('bookings')" class="nav-item" style="padding:12px; cursor:pointer; border-radius:8px; margin-bottom:5px; display:flex; justify-content:space-between; align-items:center; transition:0.2s;" onmouseover="this.style.background='#444'" onmouseout="this.style.background='transparent'">
                       <span>📅 Bookings</span>
                       <span id="side-notif-count" style="background:#ff9f43; color:white; padding:2px 8px; border-radius:10px; font-size:10px; display:none;">0</span>
                   </div>
                   <div onclick="showTab('packages')" class="nav-item" style="padding:12px; cursor:pointer; border-radius:8px; margin-bottom:5px; transition:0.2s;" onmouseover="this.style.background='#444'" onmouseout="this.style.background='transparent'">🎒 My Packages</div>
                   <div onclick="showTab('profile')" class="nav-item" style="padding:12px; cursor:pointer; border-radius:8px; margin-bottom:5px; transition:0.2s;" onmouseover="this.style.background='#444'" onmouseout="this.style.background='transparent'">👤 Agency Profile</div>
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
}

window.showTab = async function(tabName) {
    const container = document.getElementById('main-content');
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;

    // --- 1. DASHBOARD OVERVIEW ---
    if (tabName === 'earnings') {
        container.innerHTML = `<h1>Overview</h1>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px;">
                <div style="background:white; padding:25px; border-radius:12px; border-top:5px solid #2ecc71; box-shadow: 0 4px 6px rgba(0,0,0,0.05);"><small style="color:#999; font-weight:bold;">REVENUE</small><h2 style="margin:10px 0 0 0;">₹0</h2></div>
                <div style="background:white; padding:25px; border-radius:12px; border-top:5px solid #ff9f43; box-shadow: 0 4px 6px rgba(0,0,0,0.05);"><small style="color:#999; font-weight:bold;">PENDING BOOKINGS</small><h2 id="pending-count-box" style="margin:10px 0 0 0;">...</h2></div>
                <div style="background:white; padding:25px; border-radius:12px; border-top:5px solid #3498db; box-shadow: 0 4px 6px rgba(0,0,0,0.05);"><small style="color:#999; font-weight:bold;">ACTIVE PACKAGES</small><h2 id="act-pkg-count" style="margin:10px 0 0 0;">...</h2></div>
            </div>`;
        
        const { count: pkgCount } = await client.from('packages').select('*', { count: 'exact', head: true }).eq('agency_id', user.id);
        document.getElementById('act-pkg-count').innerText = pkgCount || 0;
        // Check pending bookings
        const { data: pkgs } = await client.from('packages').select('id').eq('agency_id', user.id);
        const pkgIds = (pkgs || []).map(p => p.id);
        if (pkgIds.length > 0) {
            const { count: bCount } = await client.from('bookings').select('*', { count: 'exact', head: true }).in('package_id', pkgIds).eq('status', 'pending');
            document.getElementById('pending-count-box').innerText = bCount || 0;
        } else {
            document.getElementById('pending-count-box').innerText = 0;
        }
    } 

    // --- 2. BOOKINGS TAB ---
    else if (tabName === 'bookings') {
        container.innerHTML = `<h1>Customer Bookings</h1><div id="booking-list-area">Loading...</div>`;
        const { data: pkgs } = await client.from('packages').select('id').eq('agency_id', user.id);
        const pkgIds = (pkgs || []).map(p => p.id);
        
        if (pkgIds.length === 0) {
            document.getElementById('booking-list-area').innerHTML = `<p style="color:#666;">Create a package first to receive bookings.</p>`;
            return;
        }

        const { data: bData } = await client.from('bookings').select('*').in('package_id', pkgIds).order('created_at', { ascending: false });
        const listArea = document.getElementById('booking-list-area');
        
        if (!bData || bData.length === 0) {
            listArea.innerHTML = `<p style="color:#666;">No booking requests found.</p>`;
            return;
        }

        listArea.innerHTML = bData.map(b => `
            <div style="background:white; padding:20px; border-radius:10px; margin-bottom:15px; border-left:5px solid ${b.status === 'pending' ? '#ff9f43' : '#2ecc71'}; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between;">
                    <h3>${b.package_title}</h3>
                    <strong style="color:#2ecc71;">₹${b.total_price}</strong>
                </div>
                <p style="font-size:13px; color:#666;">Status: <b>${b.status.toUpperCase()}</b> | Customer: ${b.customer_phone || 'N/A'}</p>
                ${b.status === 'pending' ? `
                    <div style="margin-top:10px; display:flex; gap:10px;">
                        <button onclick="openActionModal('${b.id}', 'approved')" style="background:#2ecc71; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Approve</button>
                        <button onclick="openActionModal('${b.id}', 'denied')" style="background:#ff7675; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Deny</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // --- 3. PACKAGES TAB (Where you Create/Edit) ---
    else if (tabName === 'packages') {
        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h1>My Packages</h1>
                <button onclick="showPackageForm()" style="padding:12px 25px; background:#2ecc71; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">+ CREATE NEW</button>
            </div>
            <div id="package-form-area"></div>
            <div id="pkg-list-container" style="margin-top:25px;">
                <p style="color:#999;">Loading packages...</p>
            </div>`;

        // Load the actual packages list
        const pkgList = document.getElementById('pkg-list-container');
        const { data: myPackages } = await client.from('packages').select('*').eq('agency_id', user.id).order('created_at', { ascending: false });

        if (!myPackages || myPackages.length === 0) {
            pkgList.innerHTML = `<div style="text-align:center; padding:50px; background:white; border-radius:15px; border:2px dashed #ddd; color:#999;">No packages published yet.</div>`;
        } else {
            pkgList.innerHTML = myPackages.map(p => {
                const encoded = encodeURIComponent(JSON.stringify(p));
                return `
                <div style="background:white; padding:20px; border-radius:12px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 8px rgba(0,0,0,0.05); border-left:5px solid #ff9f43;">
                    <div>
                        <h3 style="margin:0;">${p.title}</h3>
                        <p style="margin:5px 0; color:#666; font-size:14px;">📍 ${p.starting_location} → ${p.destinations.join(', ')}</p>
                    </div>
                    <button onclick="showPackageForm('${encoded}')" style="background:#f1f2f6; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">✏️ Edit</button>
                </div>`;
            }).join('');
        }
    }

    // --- 4. PROFILE TAB ---
    else if (tabName === 'profile') {
        const meta = user.user_metadata || {};
        container.innerHTML = `
            <h1>Agency Profile</h1>
            <div style="background:white; padding:30px; border-radius:15px; max-width:600px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <div style="margin-bottom:15px;"><label style="font-size:12px; color:#999; font-weight:bold;">AGENCY EMAIL</label><p style="font-size:18px; margin:5px 0;">${user.email}</p></div>
                <div style="margin-bottom:15px;"><label style="font-size:12px; color:#999; font-weight:bold;">BUSINESS CONTACT</label><p style="font-size:18px; margin:5px 0; color:#ff9f43;">${meta.phone || 'Not Provided'}</p></div>
                <div style="display:flex; gap:30px;">
                    <div><label style="font-size:12px; color:#999; font-weight:bold;">GST NO</label><p>${meta.gst || 'N/A'}</p></div>
                    <div><label style="font-size:12px; color:#999; font-weight:bold;">REG NO</label><p>${meta.reg_no || 'N/A'}</p></div>
                </div>
            </div>`;
    }
};

// --- LOGOUT LOGIC ---
window.confirmLogout = () => document.getElementById('logout-modal').style.display = 'flex';
window.executeLogout = async () => { 
    await getClient().auth.signOut(); 
    window.location.reload(); 
};
// 10. PACKAGE FORM (CodePen Optimized Version)
window.showPackageForm = function(pEncoded = null) {
    let pkg = null;
    try {
        pkg = pEncoded ? JSON.parse(decodeURIComponent(pEncoded)) : null;
    } catch (e) { console.error(e); }
    
    const isEdit = !!pkg;
    const area = document.getElementById('package-form-area');
    const pkgDestinations = isEdit ? (pkg.destination || []) : [];
    const pkgVehicles = isEdit ? (pkg.vehicles || []) : [];
    
    // 1. Pre-build State Options
    let selectedState = "";
    if (isEdit) {
        for (let s in locationData) {
            if (locationData[s].includes(pkg.starting_location)) { selectedState = s; break; }
        }
    }
    const stateOptions = Object.keys(locationData).map(s => 
        `<option value="${s}" ${selectedState === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    // 2. Pre-build Destination Checkboxes
    const destHtml = tourDestinations.map(d => `
        <label style="display:flex; align-items:center; gap:5px; padding:5px 10px; background:white; border-radius:5px; border:1px solid #ddd; font-size:13px;">
            <input type="checkbox" class="d-check" value="${d}" ${pkgDestinations.includes(d) ? 'checked' : ''}> ${d}
        </label>
    `).join('');

    // 3. Pre-build Vehicle List
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

    // 4. Finally, Render the Main Container
    area.innerHTML = `
        <div class="card" style="background:white; padding:30px; margin-top:20px; border:1px solid #ff9f43; border-radius:12px;">
            <h3 style="color:#ff9f43; margin-top:0;">${isEdit ? '✏️ Edit Package' : '🎒 Create New Package'}</h3>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                <input type="text" id="p-title" placeholder="Package Title" value="${isEdit ? pkg.title : ''}">
                <select id="p-state" onchange="updateCities()">
                    <option value="">Select State</option>
                    ${stateOptions}
                </select>
            </div>

            <select id="p-city" style="width:100%; margin-bottom:15px;">
                ${isEdit ? locationData[selectedState].map(c => `<option value="${c}" ${pkg.starting_location === c ? 'selected' : ''}>${c}</option>`).join('') : '<option value="">Select City</option>'}
            </select>
            
            <div style="background:#f9f9f9; padding:15px; border-radius:10px; max-height:150px; overflow-y:auto; display:flex; flex-wrap:wrap; gap:8px;">
                ${destHtml}
            </div>

            <div style="display:grid; grid-template-columns: 1fr; gap:10px; margin-top:20px;">
                ${vehicleHtml}
            </div>

            <textarea id="p-desc" style="height:100px; width:100%; margin-top:20px;" placeholder="Itinerary...">${isEdit ? pkg.description : ''}</textarea>
            
            <div style="display:flex; gap:10px; margin-top:25px;">
                <button onclick="processSave('${isEdit ? pkg.id : ''}')" style="background:#2ecc71; color:white; flex:2; height:50px; font-weight:bold; cursor:pointer; border:none; border-radius:8px;">
                    ${isEdit ? 'SAVE CHANGES' : 'PUBLISH PACKAGE'}
                </button>
                <button onclick="document.getElementById('package-form-area').innerHTML=''" style="background:#eee; flex:1; border:none; border-radius:8px; cursor:pointer;">Cancel</button>
            </div>
        </div>`;
};

// HELPER TO PREVENT TOKEN ERRORS IN ONCLICK
window.processSave = (id) => {
    if (id && id !== "undefined") {
        handleSave(id);
    } else {
        handleSave();
    }
};

// 11. HANDLESAVE
window.handleSave = async function(id = null) {
    const client = getClient();
    const btn = document.getElementById('save-btn');
    const { data: { user } } = await client.auth.getUser();
    
    const selectedVehicles = [];
    document.querySelectorAll('.v-enable:checked').forEach(checkbox => {
        const vid = checkbox.dataset.id;
        const rateInput = document.querySelector(`.v-rate[data-id="${vid}"]`);
        const maxInput = document.querySelector(`.v-max[data-id="${vid}"]`);
        const rate = parseFloat(rateInput.value);
        const name = rateInput.dataset.name;
        if (rate > 0) {
            selectedVehicles.push({ id: vid, name: name, rate: rate, max_cars: parseInt(maxInput.value) || 1 });
        }
    });

    if (selectedVehicles.length === 0) return alert("Please TICK at least one vehicle and provide a price.");
    
    btn.innerText = "Processing...";
    btn.disabled = true;

    const pkgData = {
        agency_id: user.id,
        title: document.getElementById('p-title').value,
        starting_location: document.getElementById('p-city').value,
        description: document.getElementById('p-desc').value,
        destination: Array.from(document.querySelectorAll('.d-check:checked')).map(c => c.value),
        vehicles: selectedVehicles
    };

    try {
        if (id) {
            const { data: oldPkg } = await client.from('packages').select('*').eq('id', id).single();
            const history = oldPkg.updates_history || [];
            history.push({ 
                title: oldPkg.title, 
                description: oldPkg.description, 
                vehicles: oldPkg.vehicles, 
                destination: oldPkg.destination, 
                updated_at: new Date().toISOString() 
            });
            pkgData.updates_history = history;
            const { error } = await client.from('packages').update(pkgData).eq('id', id);
            if (error) throw error;
        } else {
            pkgData.updates_history = [];
            const { error } = await client.from('packages').insert([pkgData]);
            if (error) throw error;
        }
        
        setTimeout(() => showTab('packages'), 500);
    } catch (e) {
        alert("Error saving: " + e.message);
        btn.disabled = false;
        btn.innerText = "Try Again";
    }
};

async function loadPackageList(aid) {
    const { data } = await getClient().from('packages').select('*').eq('agency_id', aid).order('id', { ascending: false });
    const container = document.getElementById('pkg-list-container');
    if(!data || data.length === 0) {
       container.innerHTML = `<div style="text-align:center; padding:40px; color:#999;">No packages created yet.</div>`;
        return;
    }
   container.innerHTML = data.map(p => {
        const pString = encodeURIComponent(JSON.stringify(p));
        return `
        <div class="card" style="background:white; padding:20px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; border-left:5px solid #ff9f43;">
            <div style="text-align:left;">
                <h3 style="margin:0;">${p.title}</h3>
                <small style="color:#666;">${p.starting_location} ➔ ${(p.destination || []).length} Destinations | <b>${(p.updates_history || []).length} edits</b></small>
           </div>
            <div style="display:flex; gap:10px;">
                <button onclick="showPackageForm('${pString}')" style="width:auto; padding:8px 15px; background:#f0f0f0;">Edit</button>
                <button onclick="deletePkg(${p.id})" style="color:#ff7675; background:none; width:auto; border:1px solid #ff7675; padding:8px 15px;">Delete</button>
           </div>
        </div>`;
   }).join('');
}

window.deletePkg = async (id) => { if(confirm("Are you sure?")) { await getClient().from('packages').delete().eq('id', id); showTab('packages'); } };

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
