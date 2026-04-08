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
   5. AUTHENTICATION & SESSION LOGIC
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
            
            // Login successful
            showDashboard(data.user);
            // Optional: refresh page to clear any old state
            window.location.reload(); 

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

/* --- LOGOUT SYSTEM FUNCTIONS --- */

// 1. Show the Logout Modal
window.confirmLogout = function() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        // Simple alert fallback if modal element is not found
        if (confirm("Are you sure you want to logout?")) {
            executeLogout();
        }
    }
};

// 2. Perform the actual logout
window.executeLogout = async function() {
    const client = getClient();
    try {
        const { error } = await client.auth.signOut();
        if (error) throw error;

        // Clear session data
        localStorage.clear();
        
        // Hide modal and refresh page to show login screen
        const modal = document.getElementById('logout-modal');
        if (modal) modal.style.display = 'none';
        
        window.location.reload();

    } catch (err) {
        console.error("Logout Error:", err.message);
        alert("Logout failed: " + err.message);
    }
};
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
                    <button onclick="executeLogout()" style="background:#f1f2f6; color:#ff7675; width:auto; padding:10px 25px; border-radius:10px; font-weight:bold; cursor:pointer; border:none;">Logout</button>
                  </div>
              </div>
               <div id="customer-pkg-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap:30px;"></div>
            </div>
        </div>

        <div id="detail-modal" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:1000; justify-content:center; align-items:center; overflow-y:auto; padding:20px;">
            <div class="modal-content card" style="background:white; width:100%; max-width:750px; padding:30px; border-radius:20px; position:relative; margin: auto;">
                <div id="detail-view-body"></div>
           </div>
        </div>
    `;
    loadAllPackages();
}

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
        const statusColor = b.status === 'paid' ? '#2ecc71' : (b.status === 'denied' ? '#ff7675' : '#ff9f43');
        const isPending = b.status === 'pending';
        const isPaid = b.status === 'paid';
        const isApproved = b.status === 'approved';

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
                ${isPending ? `<button onclick="deleteBookingRequest(${b.id})" style="background:none; border:1px solid #ff7675; color:#ff7675; padding:5px 10px; font-size:12px; border-radius:5px; cursor:pointer;">🗑️ Delete</button>` : ''}
            </div>

            <div style="margin-top:20px; padding:15px; border-radius:10px; background:${isPaid ? '#f0fff4' : '#f8f9fa'}; border:1px solid ${isPaid ? '#2ecc71' : '#eee'};">
                ${isPaid ? `
                    <div style="text-align:center;">
                        <p style="margin:0 0 5px 0; font-size:12px; color:#27ae60; font-weight:bold;">✅ AGENCY CONTACT REVEALED</p>
                        <h2 style="margin:0; color:#2d3436;">${b.agency_contact || 'Contact info missing'}</h2>
                        <small style="color:#666;">Call now to coordinate your trip!</small>
                    </div>
                ` : `
                    <div style="text-align:center; color:#636e72;">
                        <p style="margin:0; font-size:13px;">🔒 Contact Details Locked</p>
                        <small>Available only after payment is confirmed</small>
                        ${isApproved ? `<button onclick="simulatePayment(${b.id})" style="margin-top:10px; background:#2ecc71; color:white; width:100%; padding:10px; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">PROCEED TO PAYMENT (₹${b.total_price})</button>` : ''}
                    </div>
                `}
            </div>
        </div>`;
    }).join('');
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
                <button onclick="document.getElementById('detail-modal').style.display='none'" style="background:none; border:none; font-size:24px; color:#999; cursor:pointer;">✕</button>
            </div>
            <p style="color:#ff9f43; font-weight:bold; font-size:1.1rem; margin:10px 0;">Routes: ${routeInfo}</p>
            
            <div style="margin:20px 0; padding:15px; background:#f9f9f9; border-radius:12px; font-size:14px;">
                <h4 style="margin-top:0;">Itinerary / Description</h4>
                <p style="white-space: pre-line; color:#636e72; line-height:1.6;">${p.description || 'No description provided.'}</p>
            </div>
            
            <div style="background:#fff4e6; padding:20px; border-radius:15px; border:1px solid #ffd8a8; margin-bottom:20px;">
                <h4 style="margin-top:0; color:#e67e22;">📅 SELECT TRAVEL DATE</h4>
                <input type="date" id="cust-travel-date" min="${new Date().toISOString().split('T')[0]}" style="width:100%; padding:12px; border:2px solid #ff9f43; border-radius:8px; font-weight:bold; color:#2d3436; font-family:inherit;">
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
                <button onclick="handleBookingInquiry('${p.id}', '${escapedTitle}', '${p.agency_id}')" style="flex:2; background:#ff9f43; color:white; padding:15px; font-weight:bold; cursor:pointer; border-radius:10px; border:none; transition:0.3s; font-size:16px;">SEND BOOKING REQUEST</button>
                <button onclick="document.getElementById('detail-modal').style.display='none'" style="flex:1; background:#eee; padding:15px; border-radius:10px; cursor:pointer; border:none; font-weight:bold; color:#666;">BACK</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
};

/* =========================================
   SUPPORTING LOGIC
   ========================================= */

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

window.handleBookingInquiry = async function(packageId, packageTitle, agencyId) {
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
            customer_email: user.email,
            customer_address: address, 
            customer_phone: phone,
            travel_date: travelDate, 
            selected_vehicles: selectedVehicles.join(', '),
            total_price: totalPrice, 
            status: 'pending',
            agency_id: agencyId
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

window.deleteBookingRequest = async function(id) {
    if (!confirm("Are you sure you want to cancel this request?")) return;
    const client = getClient();
    const { error } = await client.from('bookings').delete().eq('id', id);
    if (!error) renderCustomerRequests();
    else alert("Error deleting: " + error.message);
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
    const maxStr = maxDate.toISOString().split('T')[0];

    // Pre-build Vehicle HTML
    const vehicleHtml = vehicleList.map(v => `
        <div style="padding:12px; border:1px solid #eee; border-radius:10px; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <input type="checkbox" class="book-v-check" data-id="${v.id}" data-rate="${v.rate}" onchange="toggleQtyInput('${v.id}')">
                    <span><b>${v.name}</b> <br> <small style="color:#666;">Available: ${v.max_cars || 1}</small></span>
                </div>
                <span style="color:#2ecc71; font-weight:bold;">₹${v.rate}</span>
            </div>
            <div id="qty-container-${v.id}" style="display:none; margin-top:10px; border-top:1px solid #f0f0f0; padding-top:10px;">
                <label style="font-size:11px; color:#666;">Quantity:</label>
                <input type="number" class="book-v-qty" data-id="${v.id}" value="1" min="1" max="${v.max_cars || 1}" oninput="updateLivePrice()" style="width:60px; padding:5px; border:1px solid #ddd; border-radius:4px;">
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

            <div style="background:#fff4e6; padding:15px; border-radius:12px; border:1px solid #ffd8a8; margin-bottom:20px;">
                <h4 style="margin-top:0; color:#e67e22; font-size:13px;">📅 SELECT TRAVEL DATE</h4>
                <div style="display:grid; gap:5px;">
                    <label style="font-size:10px; color:#666; font-weight:bold;">CHOOSE DATE (DD-MM-YYYY)</label>
                    <input type="date" id="cust-travel-date" 
                        min="${minStr}" 
                        max="${maxStr}" 
                        value="${minStr}"
                        style="width:100%; padding:10px; border:2px solid #ff9f43; border-radius:8px; font-weight:bold; font-family:inherit;">
                    <small style="color:#e67e22; font-size:10px;">* Only dates within the next 7 days are allowed.</small>
                </div>
            </div>
            
            <h4>Select Vehicles</h4>
            ${vehicleHtml}

            <div style="background:#2d3436; color:white; padding:15px; border-radius:8px; margin-top:15px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold;">TOTAL:</span>
                <span id="live-total-display" style="color:#ff9f43; font-weight:bold; font-size:1.2rem;">₹0</span>
            </div>

            <div style="margin-top:20px; border-top:1px solid #eee; padding-top:15px;">
                <input type="text" id="cust-phone" placeholder="Mobile Number" style="width:100%; margin-bottom:10px; padding:12px; border:1px solid #ddd; border-radius:8px;">
                <textarea id="cust-address" placeholder="Full Pickup Address" style="width:100%; height:60px; padding:12px; border:1px solid #ddd; border-radius:8px;"></textarea>
            </div>

            <div style="margin-top:20px; display:flex; gap:10px;">
                <button id="main-book-btn" 
                    data-pkg-id="${p.id}" 
                    data-pkg-title="${p.title}" 
                    data-agency-id="${p.agency_id}"
                    onclick="initiateBooking(this)" 
                    style="flex:2; background:#ff9f43; color:white; border:none; padding:15px; font-weight:bold; border-radius:10px; cursor:pointer; font-size:15px;">
                    SEND BOOKING REQUEST
                </button>
                <button onclick="document.getElementById('detail-modal').style.display='none'" style="flex:1; border:none; background:#eee; border-radius:10px; cursor:pointer; font-weight:bold; color:#666;">BACK</button>
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
    if (!user) { alert("Please login first!"); return; }

    const address = document.getElementById('cust-address').value;
    const phone = document.getElementById('cust-phone').value;
    const rawDate = document.getElementById('cust-travel-date').value; // This is YYYY-MM-DD

    if (!address.trim() || !phone.trim() || !rawDate) {
        alert("Enter travel date, phone, and address!"); return;
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

    if (selectedVehicles.length === 0) { alert("Select a vehicle!"); return; }

    // --- FIX: SEND DATE AS YYYY-MM-DD TO SUPABASE ---
    // This prevents the "date/time field value out of range" error
    const { error } = await client.from('bookings').insert([{
        package_id: packageId, 
        package_title: packageTitle,
        customer_id: user.id, 
        customer_email: user.email,
        customer_address: address, 
        customer_phone: phone,
        travel_date: rawDate, // Supabase/Postgres needs YYYY-MM-DD
        selected_vehicles: selectedVehicles.join(', '),
        total_price: totalPrice, 
        status: 'pending',
        agency_id: agencyId
    }]);

    if (!error) {
        alert("✅ Booking Request Sent Successfully!");
        document.getElementById('detail-modal').style.display = 'none';
        if (typeof renderCustomerRequests === 'function') renderCustomerRequests();
    } else {
        console.error("Booking Error:", error);
        alert("❌ Error: " + error.message);
    }
};

// Helper function to update total price live
window.updateLivePrice = function() {
    let total = 0;
    document.querySelectorAll('.book-v-check:checked').forEach(el => {
        const id = el.dataset.id;
        const rate = parseFloat(el.dataset.rate) || 0;
        const qty = parseInt(document.querySelector(`.book-v-qty[data-id="${id}"]`).value) || 1;
        total += (rate * qty);
    });
    const display = document.getElementById('live-total-display');
    if (display) display.innerText = `₹${total.toLocaleString('en-IN')}`;
};

// Helper function to toggle quantity inputs
window.toggleQtyInput = function(id) {
    const container = document.getElementById(`qty-container-${id}`);
    const checkbox = document.querySelector(`.book-v-check[data-id="${id}"]`);
    if (container && checkbox) {
        container.style.display = checkbox.checked ? 'block' : 'none';
    }
    updateLivePrice();
};
/* =========================================
   9. AGENCY DASHBOARD & TAB LOGIC
   ========================================= */
function renderAgencyDashboard(user) {
    const app = document.getElementById('app');
    app.style.maxWidth = "100%";
    
    app.innerHTML = `
        <div style="display:flex; min-height:100vh; background:#f8f9fa; margin:-20px; font-family:'Inter', sans-serif;">
            <div style="width:260px; background:#2d3436; color:white; padding:25px; position:relative; flex-shrink:0;">
               <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;">
                   <h2 style="color:#ff9f43; margin:0;">TourSetu</h2>
                   <div id="notif-bell" onclick="showTab('bookings')" style="position:relative; cursor:pointer; font-size:20px; transition: 0.3s; color:white;">
                       🔔
                       <span id="bell-badge" style="display:none; position:absolute; top:-5px; right:-5px; background:#ff7675; color:white; font-size:10px; padding:2px 6px; border-radius:50%; font-weight:bold; border: 2px solid #2d3436;">0</span>
                   </div>
               </div>
               <nav>
                   <div onclick="showTab('earnings')" class="nav-item" style="padding:12px; cursor:pointer; border-radius:8px; margin-bottom:5px;">📊 Dashboard Overview</div>
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

    // 1. Fetch Fresh Data for Counts & Revenue
    const { data: allBookings } = await client.from('bookings').select('*').eq('agency_id', user.id);

    let pendingCount = 0;
    let totalRevenue = 0;
    if (allBookings) {
        pendingCount = allBookings.filter(b => b.status === 'pending').length;
        totalRevenue = allBookings
            .filter(b => b.status === 'paid')
            .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
    }

    // 2. Update UI Notifications
    const badge = document.getElementById('bell-badge');
    const sideCount = document.getElementById('side-notif-count');
    const bellIcon = document.getElementById('notif-bell');

    if (badge) {
        badge.innerText = pendingCount;
        badge.style.display = pendingCount > 0 ? 'block' : 'none';
        sideCount.innerText = pendingCount;
        sideCount.style.display = pendingCount > 0 ? 'block' : 'none';
        if(bellIcon) bellIcon.style.color = pendingCount > 0 ? '#ff7675' : 'white';
    }

    // 3. Tab Rendering Logic
    if (tabName === 'earnings') {
        container.innerHTML = `
            <h1 style="margin-bottom:30px;">Overview</h1>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:25px;">
                <div class="card" style="border-top:5px solid #2ecc71; background:white; padding:30px; border-radius:12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <small style="color:#666; font-weight:bold; letter-spacing:1px;">TOTAL REVENUE (PAID)</small>
                    <h2 style="font-size:32px; margin:10px 0;">₹${totalRevenue.toLocaleString('en-IN')}</h2>
                </div>
                <div class="card" style="border-top:5px solid #ff9f43; background:white; padding:30px; border-radius:12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <small style="color:#666; font-weight:bold; letter-spacing:1px;">PENDING REQUESTS</small>
                    <h2 style="font-size:32px; margin:10px 0;">${pendingCount}</h2>
                </div>
                <div class="card" style="border-top:5px solid #3498db; background:white; padding:30px; border-radius:12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <small style="color:#666; font-weight:bold; letter-spacing:1px;">ACTIVE PACKAGES</small>
                    <h2 id="act-pkg-count" style="font-size:32px; margin:10px 0;">...</h2>
                </div>
            </div>`;
        const { count } = await client.from('packages').select('*', { count: 'exact', head: true }).eq('agency_id', user.id);
        if(document.getElementById('act-pkg-count')) document.getElementById('act-pkg-count').innerText = count || 0;
    } 
    else if (tabName === 'bookings') {
        container.innerHTML = `<h1 style="margin-bottom:30px;">Customer Bookings</h1><div id="booking-list-area">Loading...</div>`;
        const listArea = document.getElementById('booking-list-area');

        const { data: bookingsData, error } = await client
            .from('bookings')
            .select('*')
            .eq('agency_id', user.id)
            .order('created_at', { ascending: false });

        if (error || !bookingsData || bookingsData.length === 0) {
            listArea.innerHTML = `<div style="text-align:center; padding:50px; background:white; border-radius:15px; color:#999;">No booking requests found.</div>`;
            return;
        }

        listArea.innerHTML = bookingsData.map(b => {
            const isPaid = b.status === 'paid';
            const isPending = b.status === 'pending';
            const displayPhone = isPaid ? b.customer_phone : "Locked (Unlocks after Payment)";
            
            // Format DB Date (YYYY-MM-DD) to Display Date (DD-MM-YYYY)
            let displayDate = b.travel_date;
            try {
                const parts = b.travel_date.split('-');
                if(parts.length === 3) displayDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            } catch(e) {}

            let statusColor = '#ff9f43'; // Default Pending
            if (['cancelled', 'denied'].includes(b.status)) statusColor = '#ff7675';
            if (['approved', 'paid'].includes(b.status)) statusColor = '#2ecc71';

            return `
            <div class="card" style="background:white; padding:25px; margin-bottom:20px; border-left:6px solid ${statusColor}; border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div>
                        <h3 style="margin:0; font-size:20px;">${b.package_title}</h3>
                        <div style="margin-top:8px; display:flex; gap:20px; font-size:13px; color:#636e72;">
                             <span style="color:#e67e22; font-weight:bold;">📅 TRAVEL DATE: ${displayDate}</span>
                             <span>📩 Requested: ${new Date(b.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:24px; font-weight:800; color:#2ecc71;">₹${b.total_price || 0}</div>
                        <span style="padding:5px 12px; border-radius:20px; font-size:11px; font-weight:bold; background:#f0f0f0; color:${statusColor}; text-transform:uppercase;">
                            ${b.status}
                        </span>
                    </div>
                </div>

                <div style="margin-top:20px; padding:15px; background:#f8f9fa; border-radius:10px; display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                    <div>
                        <label style="font-size:11px; color:#999; font-weight:bold; display:block; margin-bottom:5px;">📍 PICKUP ADDRESS</label>
                        <p style="margin:0; font-size:14px; color:#2d3436; line-height:1.4;">${b.customer_address || 'Not Provided'}</p>
                    </div>
                    <div>
                        <label style="font-size:11px; color:#999; font-weight:bold; display:block; margin-bottom:5px;">📞 CUSTOMER CONTACT</label>
                        <p style="margin:0; font-size:15px; font-weight:bold; color:${isPaid ? '#2d3436' : '#999'};">
                            ${displayPhone}
                        </p>
                    </div>
                </div>

                <div style="margin-top:15px; border-top: 1px dashed #ddd; padding-top:15px;">
                    <p style="font-size:13px; margin:0; color:#636e72;"><b>Vehicles:</b> ${b.selected_vehicles}</p>
                    <p style="font-size:12px; margin-top:5px; color:#999;">Email: ${b.customer_email}</p>
                </div>

                ${isPending ? `
                    <div style="margin-top:20px; display:flex; gap:12px;">
                        <button onclick="openActionModal('${b.id}', 'approved')" style="flex:1; background:#2ecc71; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;">Approve</button>
                        <button onclick="openActionModal('${b.id}', 'denied')" style="flex:1; background:#ff7675; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;">Deny</button>
                    </div>
                ` : ''}
            </div>`;
        }).join('');
    }
    else if (tabName === 'packages') {
        // ... (Keep existing Packages tab logic as it works fine)
        renderPackagesTab(container, user, client);
    }
    else if (tabName === 'profile') {
        const meta = user.user_metadata || {};
        container.innerHTML = `
            <h1 style="margin-bottom:30px;">Agency Profile</h1>
            <div class="card" style="background:white; padding:40px; max-width:600px; border-left:5px solid #ff9f43; border-radius:15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <div style="margin-bottom:25px;"><label style="color:#999; font-size:12px; font-weight:bold; display:block;">BUSINESS EMAIL</label><h3 style="margin:5px 0;">${user.email}</h3></div>
                <div style="margin-bottom:25px;"><label style="color:#999; font-size:12px; font-weight:bold; display:block;">CONTACT NUMBER</label><h3 style="margin:5px 0;">${meta.phone || 'N/A'}</h3></div>
                <div style="border-top:1px solid #eee; padding-top:20px;">
                    <span style="background:#fff5eb; color:#ff9f43; padding:5px 15px; border-radius:20px; font-size:12px; font-weight:bold;">Verified Tour Operator</span>
                </div>
            </div>`;
    }
};

/* =========================================
   10. PACKAGE FORM & SAVE LOGIC (WITH DATE FIX)
   ========================================= */

window.processSave = async function(pkgId) {
    const btn = document.getElementById('save-btn');
    if (btn) { btn.disabled = true; btn.innerText = "Saving..."; }
    
    const client = getClient();
    
    try {
        const { data: { user } } = await client.auth.getUser();
        const title = document.getElementById('p-title').value;
        const city = document.getElementById('p-city').value;
        const desc = document.getElementById('p-desc').value;

        // Collect inputs
        const selectedDests = Array.from(document.querySelectorAll('.d-check:checked')).map(cb => cb.value);
        const vehicleData = Array.from(document.querySelectorAll('.v-enable:checked')).map(cb => {
            const id = cb.getAttribute('data-id');
            return {
                id: id,
                rate: parseFloat(document.querySelector(`.v-rate[data-id="${id}"]`).value) || 0,
                max_cars: parseInt(document.querySelector(`.v-max[data-id="${id}"]`).value) || 1
            };
        });

        if (!title || !city || selectedDests.length === 0 || vehicleData.length === 0) {
            throw new Error("Missing required fields (Title, City, Destinations, or Vehicles).");
        }

        const pkgPayload = {
            title,
            starting_location: city,
            destinations: selectedDests,
            vehicles: vehicleData,
            description: desc,
            agency_id: user.id,
            agency_email: user.email
        };

        let res;
        if (pkgId && pkgId !== "undefined" && pkgId !== "") {
            res = await client.from('packages').update(pkgPayload).eq('id', pkgId);
        } else {
            res = await client.from('packages').insert([pkgPayload]);
        }

        if (res.error) throw res.error;
        
        alert("✅ Package saved successfully!");
        window.showTab('packages'); 

    } catch (err) {
        alert("❌ Error: " + err.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerText = (pkgId) ? "SAVE CHANGES" : "PUBLISH PACKAGE";
        }
    }
};

// Helper for Package Tab Rendering
async function renderPackagesTab(container, user, client) {
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
            <h1>My Packages</h1>
            <button onclick="showPackageForm()" style="padding:12px 25px; background:#2ecc71; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">+ Create New Package</button>
        </div>
        <div id="pkg-list-container"><p style="color:#999;">Loading...</p></div>`;

    const pkgList = document.getElementById('pkg-list-container');
    const { data: myPackages } = await client.from('packages').select('*').eq('agency_id', user.id).order('created_at', { ascending: false });

    if (!myPackages || myPackages.length === 0) {
        pkgList.innerHTML = `<div style="text-align:center; padding:60px; background:white; border-radius:15px; border:2px dashed #ccc; color:#999;">No packages published yet. Start by creating one!</div>`;
    } else {
        pkgList.innerHTML = myPackages.map(p => {
            const encoded = encodeURIComponent(JSON.stringify(p));
            return `
            <div style="background:white; padding:20px; border-radius:12px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 4px 6px rgba(0,0,0,0.03); border-left:5px solid #ff9f43;">
                <div>
                    <h3 style="margin:0; color:#2d3436;">${p.title}</h3>
                    <p style="margin:5px 0; color:#666; font-size:14px;">📍 From ${p.starting_location}</p>
                </div>
                <button onclick="showPackageForm('${encoded}')" style="background:#ff9f43; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">Edit Details</button>
            </div>`;
        }).join('');
    }
}
// 11. SAVE LOGIC: Sends data to Supabase (FIXED COLUMN NAMES)
window.processSave = async function(pkgId) {
    const btn = document.getElementById('save-btn');
    if (btn) { btn.innerText = "Processing..."; btn.disabled = true; }

    try {
        const client = getClient();
        const { data: { user } } = await client.auth.getUser();
        if (!user) throw new Error("User session not found. Please logout and login again.");

        const title = document.getElementById('p-title').value.trim();
        const city = document.getElementById('p-city').value;
        const desc = document.getElementById('p-desc').value;

        if (!title || !city) throw new Error("Title and Starting City are required!");

        const selectedDests = Array.from(document.querySelectorAll('.d-check:checked')).map(el => el.value);
        if (selectedDests.length === 0) throw new Error("Select at least one destination!");

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

        if (selectedVehicles.length === 0) throw new Error("Set a price for at least one vehicle!");

        // FIXED: Changed 'destinations' to 'destination' to match your Supabase schema
        const pkgData = {
            title: title,
            starting_location: city,
            destination: selectedDests, 
            vehicles: selectedVehicles,
            description: desc,
            agency_id: user.id
        };

        let result;
        // Check if pkgId is a valid string/UUID and not the literal string "null" or "undefined"
        if (pkgId && pkgId !== "undefined" && pkgId !== "null" && pkgId !== "") {
            result = await client.from('packages').update(pkgData).eq('id', pkgId);
        } else {
            result = await client.from('packages').insert([pkgData]);
        }

        if (result.error) throw result.error;

        alert("✅ Success! Package saved.");
        window.showTab('packages'); 

    } catch (err) {
        console.error("Save Error:", err);
        alert("❌ Error: " + err.message);
        if (btn) {
            btn.innerText = (pkgId && pkgId !== "undefined" && pkgId !== "null") ? "SAVE CHANGES" : "PUBLISH PACKAGE";
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
