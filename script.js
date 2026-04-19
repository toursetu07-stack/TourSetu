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

            // --- ONESIGNAL INTEGRATION START ---
            // This links the Supabase User ID to the OneSignal Notification ID
            if (data.user) {
                window.OneSignal = window.OneSignal || [];
                OneSignal.push(function() {
                    OneSignal.login(data.user.id);
                });
            }
            // --- ONESIGNAL INTEGRATION END ---

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
                    emailRedirectTo: "https://toursetu-app.netlify.app"
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
   6. CUSTOMER HOMEPAGE & BOOKING SYSTEM
   ========================================= */

function renderCustomerHomepage(user) {
    const app = document.getElementById('app');
    app.style.maxWidth = "100%";
    
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
                    height:450px; background-size:cover; background-position:center; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; padding:20px;">
                <h1 style="font-size:3rem; margin-bottom:10px; text-align:center;">Find Your Perfect Match</h1>
                <p style="font-size:1.2rem; margin-bottom:40px; opacity:0.9;">Direct connections with verified local travel agencies</p>
                
                <div class="card" style="background:white; padding:30px; border-radius:20px; display:flex; gap:15px; width:95%; max-width:1000px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); flex-wrap:wrap;">
                  <div style="flex:1; min-width:200px; text-align:left;">
                      <label style="color:#636e72; font-weight:bold; font-size:12px; letter-spacing:1px;">SELECT STATE</label>
                      <select id="search-state" onchange="updateCityDropdown()" style="border: 2px solid #eee; margin-top:8px; width:100%; height:45px; border-radius:8px;">
                         <option value="">Select State</option>
                         ${stateOptions}
                      </select>
                   </div>
                   <div style="flex:1; min-width:200px; text-align:left;">
                      <label style="color:#636e72; font-weight:bold; font-size:12px; letter-spacing:1px;">SELECT CITY</label>
                      <select id="search-start" style="border: 2px solid #eee; margin-top:8px; width:100%; height:45px; border-radius:8px;">
                         <option value="">Select City First</option>
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
                  <div style="display:flex; gap:10px;">
                    <button onclick="renderCustomerRequests()" style="background:#3498db; color:white; padding:10px 20px; border-radius:10px; font-weight:bold; cursor:pointer; border:none;">My Requests</button>
                    <button onclick="confirmAndExecuteLogout()" style="background:#f1f2f6; color:#ff7675; width:auto; padding:10px 25px; border-radius:10px; font-weight:bold; cursor:pointer; border:none;">Logout</button>
                  </div>
              </div>
               <div id="customer-pkg-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap:30px;"></div>
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
 * NEW: Logout Confirmation Logic
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
    const { data, error } = await client.from('bookings').select('*').eq('customer_id', user.id).order('created_at', {ascending: false});
    
    if(!data || data.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px;">
            <p>No requests found. <span onclick="renderCustomerHomepage()" style="color:#ff9f43; cursor:pointer; font-weight:bold;">Search for packages</span></p>
        </div>`;
        return;
    }

    container.innerHTML = data.map(b => {
        const statusColor = b.status === 'paid' ? '#2ecc71' : (b.status === 'denied' ? '#ff7675' : (b.status === 'cancelled' ? '#636e72' : '#ff9f43'));
        const isPending = b.status === 'pending';
        const isPaid = b.status === 'paid';
        const isApproved = b.status === 'confirmed'; // Changed from 'approved' to match your Edge Function logic
        const isCancelled = b.status === 'cancelled';

        const today = new Date();
        today.setHours(0,0,0,0);
        const travelDateObj = b.travel_date ? new Date(b.travel_date) : null;
        if(travelDateObj) travelDateObj.setHours(0,0,0,0);
        
        const canCancel = travelDateObj && today <= travelDateObj && !isCancelled;

        return `
        <div class="card" style="background:white; padding:25px; border-left:5px solid ${statusColor}; position:relative; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-radius:15px;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <h3 style="margin:0 0 10px 0; color:#2d3436;">${b.package_title}</h3>
                    <div style="font-size:13px; color:#636e72;">
                        <div style="margin-bottom:6px; color:#e67e22; font-weight:bold;">📅 Travel Date: ${b.travel_date ? new Date(b.travel_date).toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'}) : 'Not Set'}</div>
                        <div style="margin-bottom:4px;">🚗 Vehicles: ${b.selected_vehicles}</div>
                        <div style="margin-top:5px;">Status: <span style="padding:2px 8px; border-radius:10px; font-size:11px; background:#f0f0f0; color:${statusColor}; font-weight:bold;">${b.status.toUpperCase()}</span></div>
                    </div>
                </div>
                ${canCancel ? `<button onclick="cancelBookingWithPenalty(${b.id})" style="background:#ff7675; color:white; border:none; padding:8px 15px; font-size:12px; border-radius:8px; cursor:pointer; font-weight:bold;">✕ Cancel Booking</button>` : ''}
            </div>

            <div style="margin-top:20px; padding:15px; border-radius:10px; background:${isPaid ? '#f0fff4' : (isCancelled ? '#f1f2f6' : '#f8f9fa')}; border:1px solid ${isPaid ? '#2ecc71' : '#eee'};">
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
                ` : `
                    <div style="text-align:center; color:#636e72;">
                        <p style="margin:0; font-size:13px;">🔒 Contact Details Locked</p>
                        <small>Available only after payment is confirmed</small>
                        ${isApproved ? `<button onclick="simulatePayment(${b.id})" style="margin-top:10px; background:#2ecc71; color:white; width:100%; padding:10px; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">PROCEED TO PAYMENT (₹${b.total_price})</button>` : ''}
                    </div>
                `)}
            </div>
        </div>`;
    }).join('');
};

window.cancelBookingWithPenalty = async function(id) {
    const disclaimer = "In case of cancellation, a non-refundable amount of 9% (2% Gateway + 7% Service & Facilitation Fee) will be deducted from your total fund.\n\nDo you agree to proceed with the cancellation?";
    
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

    body.innerHTML = `
        <div style="text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <h2 style="margin:0; color:#2d3436;">${p.title}</h2>
                <button onclick="document.getElementById('detail-modal').style.display='none'" style="background:none; border:none; font-size:28px; color:#999; cursor:pointer; line-height:1;">✕</button>
            </div>
            <p style="color:#ff9f43; font-weight:bold; font-size:1.1rem; margin:10px 0;">Routes: ${routeInfo}</p>
            
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

            <div style="margin-top:25px; background:#2d3436; color:white; padding:15px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold;">ESTIMATED TOTAL:</span>
                <span id="live-total-display" style="font-size:22px; font-weight:bold; color:#ff9f43;">₹0</span>
            </div>

            <div style="margin-top:25px; border-top: 2px solid #eee; padding-top:20px;">
                <h4 style="margin-top:0; color:#2d3436;">Pickup & Contact Details</h4>
                <div style="display:grid; gap:15px;">
                    <div>
                        <label style="font-size:12px; color:#636e72; font-weight:bold; display:block; margin-bottom:5px;">🏠 FULL PICKUP ADDRESS</label>
                        <textarea id="cust-address" placeholder="e.g. Flat 101, Sunny Heights, Sector 15, Meerut..." style="width:100%; height:70px; padding:12px; border:1px solid #ddd; border-radius:8px; box-sizing:border-box; font-family:inherit;"></textarea>
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

window.updateLivePrice = () => {
    let total = 0;
    document.querySelectorAll('.book-v-check:checked').forEach(checkbox => {
        const id = checkbox.dataset.id;
        const rate = parseFloat(checkbox.dataset.rate) || 0;
        const qtyInput = document.querySelector(`.book-v-qty[data-id="${id}"]`);
        const qty = parseInt(qtyInput.value) || 1;
        total += (rate * qty);
    });
    document.getElementById('live-total-display').innerText = `₹${total.toLocaleString('en-IN')}`;
};

window.toggleQtyInput = (id) => {
    const container = document.getElementById(`qty-container-${id}`);
    const checkbox = document.querySelector(`.book-v-check[data-id="${id}"]`);
    if (container) container.style.display = checkbox.checked ? 'block' : 'none';
    updateLivePrice();
};

window.handleBookingInquiry = async function(packageId, packageTitle, agencyId, agencyEmail) {
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    const address = document.getElementById('cust-address').value;
    const phone = document.getElementById('cust-phone').value;
    const travelDate = document.getElementById('cust-travel-date').value;

    if (!address.trim() || !phone.trim() || !travelDate) {
        alert("❌ Please provide travel date, pickup address and phone number!"); 
        return;
    }

    let totalPrice = 0;
    const selectedVehicles = Array.from(document.querySelectorAll('.book-v-check:checked')).map(el => {
        const id = el.dataset.id;
        const rate = parseFloat(el.dataset.rate) || 0;
        const qtyInput = document.querySelector(`.book-v-qty[data-id="${id}"]`);
        const qty = parseInt(qtyInput.value) || 1;
        totalPrice += (rate * qty);
        return `${qty}x vehicle_id:${id}`;
    });

    if (selectedVehicles.length === 0) { 
        alert("❌ Please select at least one vehicle to book."); 
        return; 
    }

    try {
        const { error } = await client.from('bookings').insert([{
            package_id: packageId, 
            package_title: packageTitle,
            customer_id: user.id, 
            customer_email: user.email, // Saves email for notifications
            customer_address: address, 
            customer_phone: phone,
            travel_date: travelDate, 
            selected_vehicles: selectedVehicles.join(', '),
            total_price: totalPrice, 
            status: 'pending',
            agency_id: agencyId,
            agency_email: agencyEmail   // Saves email to trigger agency alert
        }]);

        if (!error) {
            alert(`✅ Success! Request sent for ${new Date(travelDate).toLocaleDateString()}. Total: ₹${totalPrice}`);
            document.getElementById('detail-modal').style.display = 'none';
            renderCustomerRequests();
        } else {
            alert("Booking Error: " + error.message);
        }
    } catch (e) {
        alert("An error occurred. Please check your connection.");
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
    const vehicleList = p.vehicles || [];
    const routeInfo = `${p.starting_location} ➔ ${Array.isArray(p.destination) ? p.destination.join(' ➔ ') : p.destination}`;

    // --- CALENDAR SYSTEM LOGIC (7 DAYS ONLY) ---
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 7);

    // Format for HTML input (YYYY-MM-DD)
    const minStr = today.toISOString().split('T')[0];
    const maxStr = maxDate.setDate(today.getDate() + 7) && new Date(maxDate).toISOString().split('T')[0]; 
    // Re-calculating correctly for the string
    const limitDate = new Date();
    limitDate.setDate(today.getDate() + 7);
    const limitStr = limitDate.toISOString().split('T')[0];

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

            <div style="margin-bottom:15px;">
                <label style="font-size:12px; font-weight:bold; color:#666;">SELECT TRAVEL DATE (Within 7 Days):</label>
                <input type="date" id="cust-travel-date" min="${minStr}" max="${limitStr}" value="${minStr}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; margin-top:5px;">
            </div>
            
            <h4>Select Vehicles</h4>
            ${vehicleHtml}

            <div style="background:#2d3436; color:white; padding:15px; border-radius:8px; margin-top:15px; display:flex; justify-content:space-between;">
                <span>TOTAL:</span>
                <span id="live-total-display" style="color:#ff9f43; font-weight:bold;">₹0</span>
            </div>

            <div style="margin-top:20px;">
                <input type="text" id="cust-phone" placeholder="Phone Number" style="width:100%; margin-bottom:10px; padding:10px;">
                <textarea id="cust-address" placeholder="Pickup Address" style="width:100%; height:60px; padding:10px; margin-bottom:10px;"></textarea>
                
                <div style="background: #fff4e6; padding: 10px; border-radius: 8px; border: 1px solid #ffd8a8;">
                    <label style="display:flex; gap:10px; cursor:pointer; align-items:start;">
                        <input type="checkbox" id="policy-consent" style="margin-top:4px;">
                        <span style="font-size:12px; color:#444;">I agree to the <b>Cancellation & Refund Policy</b>. I understand that in case of cancellation, a non-refundable amount of <b>9%</b> (2% Gateway + 7% Service & Facilitation Fee) will be deducted from my total refund.</span>
                    </label>
                </div>
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

// THE BOOKING INITIATOR
window.initiateBooking = function(btnElement) {
    const packageId = btnElement.getAttribute('data-pkg-id');
    const packageTitle = btnElement.getAttribute('data-pkg-title');
    const agencyId = btnElement.getAttribute('data-agency-id');
    handleBookingInquiry(packageId, packageTitle, agencyId);
};

window.handleBookingInquiry = async function(packageId, packageTitle, agencyId) {
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    
    const address = document.getElementById('cust-address').value;
    const phone = document.getElementById('cust-phone').value;
    const travelDate = document.getElementById('cust-travel-date').value;
    const policyAccepted = document.getElementById('policy-consent').checked;

    if (!address.trim() || !phone.trim() || !travelDate) {
        alert("Enter travel date, phone and address!"); return;
    }

    if (!policyAccepted) {
        alert("You must agree to the Cancellation & Refund Policy to proceed."); return;
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
        travel_date: travelDate,
        selected_vehicles: selectedVehicles.join(', '),
        total_price: totalPrice, 
        status: 'pending',
        agency_id: agencyId,
        consent_9_percent_policy: true,
        policy_version: 'v1_9_percent_deduction'
    }]);

    if (!error) {
        alert("Booking Sent!");
        document.getElementById('detail-modal').style.display = 'none';
        renderCustomerRequests();
    } else {
        alert("Error: " + error.message);
    }
};
// 9. AGENCY DASHBOARD
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
                    <div>
                        <p style="font-size:13px; margin:0; color:#636e72;"><b>Selected Vehicles:</b> ${b.selected_vehicles}</p>
                        <p style="font-size:12px; margin-top:5px; color:#999;">Customer Email: ${displayEmail}</p>
                    </div>
                    ${b.policy_agreed ? `
                        <div style="background:#e3faf3; color:#2ecc71; font-size:10px; padding:4px 10px; border-radius:5px; font-weight:bold; border:1px solid #2ecc71;">
                            ✅ 9% DEDUCTION POLICY AGREED
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
    else if (tabName === 'profile') {
        const meta = user.user_metadata || {};
        container.innerHTML = `<h1>Agency Profile</h1><div class="card" style="background:white; padding:30px; border-radius:8px; border-left:5px solid #ff9f43;">
            <p><b>Email:</b> ${user.email}</p>
            <p><b>Phone:</b> ${meta.phone || 'N/A'}</p>
            <p><b>Status:</b> ${meta.is_approved ? '✅ Verified' : '⏳ Pending Approval'}</p>
        </div>`;
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
        // TRIGGER PUSH NOTIFICATION
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

// RENDER FORM: Shows the Create/Edit UI
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
    
    const pkgDestinations = isEdit ? (pkg.destinations || pkg.destination || []) : [];
    const pkgVehicles = isEdit ? (pkg.vehicles || []) : [];
    
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

    const destHtml = tourDestinations.map(d => `
        <label style="display:flex; align-items:center; gap:5px; padding:5px 10px; background:white; border-radius:5px; border:1px solid #ddd; font-size:13px; cursor:pointer;">
            <input type="checkbox" class="d-check" value="${d}" ${pkgDestinations.includes(d) ? 'checked' : ''}> ${d}
        </label>
    `).join('');

    const vehicleHtml = vehicleTypes.map(v => {
        const existing = pkgVehicles.find(ev => ev.id === v.id);
        return `
        <div style="display:flex; align-items:center; gap:10px; background:#fff8f0; padding:10px; border-radius:10px; border:1px solid #ffeaa7; margin-bottom:8px;">
            <input type="checkbox" class="v-enable" data-id="${v.id}" ${existing ? 'checked' : ''}>
            <span style="font-size:20px;">${v.icon || '🚗'}</span>
            <b style="flex:1;">${v.name}</b>
            <input type="number" class="v-rate" data-id="${v.id}" placeholder="Rate" style="width:80px; padding:5px;" value="${existing ? existing.rate : ''}">
            <input type="number" class="v-max" data-id="${v.id}" placeholder="Max" style="width:60px; padding:5px;" value="${existing ? existing.max_cars : '1'}">
        </div>`;
    }).join('');

    area.innerHTML = `
        <div class="card" style="background:white; padding:30px; border:1px solid #ff9f43; border-radius:12px; max-width:800px; margin:auto; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
            <h3 style="color:#ff9f43; margin-top:0;">${isEdit ? '✏️ Edit Package' : '🚀 Create New Package'}</h3>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                <div>
                    <label style="font-size:11px; font-weight:bold; color:#666;">PACKAGE TITLE</label>
                    <input type="text" id="p-title" placeholder="e.g. 3 Days Kedarnath Trip" value="${isEdit ? pkg.title : ''}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                </div>
                <div>
                    <label style="font-size:11px; font-weight:bold; color:#666;">PICKUP STATE</label>
                    <select id="p-state" onchange="window.updateCities()" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                        <option value="">Select State</option>
                        ${stateOptions}
                    </select>
                </div>
            </div>

            <label style="font-size:11px; font-weight:bold; color:#666;">STARTING CITY</label>
            <select id="p-city" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; margin-bottom:15px;">
                ${isEdit && selectedState ? locationData[selectedState].map(c => `<option value="${c}" ${pkg.starting_location === c ? 'selected' : ''}>${c}</option>`).join('') : '<option value="">Select City</option>'}
            </select>
            
            <p><b>Destinations:</b></p>
            <div style="background:#f9f9f9; padding:15px; border-radius:10px; max-height:150px; overflow-y:auto; display:flex; flex-wrap:wrap; gap:8px; border:1px solid #eee; margin-bottom:20px;">
                ${destHtml}
            </div>

            <p><b>Vehicle Pricing:</b></p>
            <div style="margin-bottom:20px;">${vehicleHtml}</div>

            <label style="font-size:11px; font-weight:bold; color:#666;">ITINERARY DETAILS</label>
            <textarea id="p-desc" style="height:120px; width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" placeholder="Describe the trip...">${isEdit ? (pkg.description || '') : ''}</textarea>
            
            <div style="display:flex; gap:10px; margin-top:25px;">
                <button id="save-btn" onclick="window.processSave('${isEdit ? pkg.id : ''}')" style="background:#2ecc71; color:white; flex:2; height:50px; font-weight:bold; border:none; border-radius:8px; cursor:pointer;">
                    ${isEdit ? 'SAVE CHANGES' : 'PUBLISH PACKAGE'}
                </button>
                <button onclick="window.showTab('packages')" style="background:#eee; flex:1; border:none; border-radius:8px; cursor:pointer;">Cancel</button>
            </div>
        </div>`;
};

/* =========================================
   11. SAVE LOGIC: Package Management
   ========================================= */
window.processSave = async function(pkgId) {
    const btn = document.getElementById('save-btn');
    if (btn) { btn.innerText = "Processing..."; btn.disabled = true; }

    try {
        const client = getClient();
        const { data: { user } } = await client.auth.getUser();
        if (!user) throw new Error("User session not found.");

        const title = document.getElementById('p-title').value.trim();
        const city = document.getElementById('p-city').value;
        const desc = document.getElementById('p-desc').value;

        if (!title || !city) throw new Error("Title and Starting City are required!");

        const selectedDests = Array.from(document.querySelectorAll('.d-check:checked')).map(el => el.value);
        const selectedVehicles = [];
        document.querySelectorAll('.v-enable:checked').forEach(el => {
            const vId = el.dataset.id;
            const rate = parseFloat(document.querySelector(`.v-rate[data-id="${vId}"]`).value) || 0;
            const max = parseInt(document.querySelector(`.v-max[data-id="${vId}"]`).value) || 1;
            const vType = vehicleTypes.find(vt => vt.id === vId);
            if (rate > 0) {
                selectedVehicles.push({ id: vId, name: vType.name, rate: rate, max_cars: max, icon: vType.icon });
            }
        });

        const pkgData = {
            title: title,
            starting_location: city,
            destination: selectedDests, 
            vehicles: selectedVehicles,
            description: desc,
            agency_id: user.id 
        };

        let error;
        // Logic to either Update (Edit) or Insert (New)
        if (pkgId && pkgId !== "" && pkgId !== "undefined") {
            const result = await client.from('packages').update(pkgData).eq('id', pkgId);
            error = result.error;
        } else {
            const result = await client.from('packages').insert([pkgData]);
            error = result.error;
        }

        if (error) throw error;
        
        alert("✅ Success! Package saved.");
        window.showTab('packages'); // Go back to the list

    } catch (err) {
        console.error("Save Error:", err);
        alert("❌ Error: " + err.message);
        if (btn) {
            btn.innerText = (pkgId) ? "SAVE CHANGES" : "PUBLISH PACKAGE";
            btn.disabled = false;
        }
    }
};

/* =========================================
   12. BOOKING RENDER LOGIC (ENHANCED WITH DATE)
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
        const statusColor = isCancelled ? '#e74c3c' : (b.status === 'confirmed' ? '#2ecc71' : '#f39c12');
        
        // Formatting the date to be more readable (e.g., "15 April 2026")
        const travelDate = b.travel_date ? new Date(b.travel_date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        }) : 'Not Selected';

        const policyTag = b.constant_9_percent_policy ? 
            `<div style="background:#d1f2eb; color:#16a085; padding:5px 12px; border-radius:20px; font-size:11px; font-weight:bold;">🛡️ 9% Policy Verified</div>` : 
            `<div style="background:#eee; color:#777; padding:5px 12px; border-radius:20px; font-size:11px;">Standard Policy</div>`;

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
                <div>🚗 <b>Vehicle:</b> ${b.selected_vehicle}</div>
                <div>💰 <b>Total:</b> ₹${b.total_price}</div>
                <div style="grid-column: span 2;">📍 <b>Pickup Address:</b> ${b.customer_address || 'N/A'}</div>
            </div>

            ${isCancelled ? `
                <div style="margin-top:15px; padding:12px; background:#fdedec; color:#c0392b; border-radius:8px; text-align:center; font-weight:bold; border: 1px solid #fadbd8;">
                    ⚠️ CANCELLATION: Customer has cancelled this request.
                </div>
            ` : `
                <div style="margin-top:15px; display:flex; gap:10px;">
                    <button onclick="window.updateBookingStatus('${b.id}', 'confirmed')" style="background:#2ecc71; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; flex:1;">Accept Request</button>
                    <button onclick="window.updateBookingStatus('${b.id}', 'rejected')" style="background:#f4f4f4; color:#666; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; flex:1;">Decline</button>
                </div>
            `}
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

