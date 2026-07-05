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
                  <div style="display:flex; gap:10px; align-items:center;">
                    <button onclick="renderCustomerRequests()" style="background:#3498db; color:white; padding:10px 20px; border-radius:10px; font-weight:bold; cursor:pointer; border:none;">My Requests</button>
                    <button onclick="confirmAndExecuteLogout()" style="background:#f1f2f6; color:#ff7675; width:auto; padding:10px 25px; border-radius:10px; font-weight:bold; cursor:pointer; border:none;">Logout</button>
                    <button onclick="triggerDeactivateModalPopup()" style="background:#ff7675; color:white; width:auto; padding:10px 25px; border-radius:10px; font-weight:bold; cursor:pointer; border:none;">Deactivate</button>
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
 * Global Deactivation Popup Engine (Problem 3 Confirmation Modal)
 */
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

    const destString = Array.isArray(p.destination) ? p.destination.join(' ').toLowerCase() : String(p.destination || '').toLowerCase();
    
    const isKedarnath = destString.includes("kedarnath") || destString.includes("char dham") || destString.includes("chardham");
    const isVaishnoDevi = destString.includes("vaishno") || destString.includes("katra");

    let kedaHtmlBlock = '';
    if (isKedarnath) {
        const kedarnathServices = [
            { id: 'ghoda', label: '🐴 Khachhar / Ghoda (Horse)', cost: parseFloat(p.ghoda_price) || 0 },
            { id: 'dandi', label: '🪑 Dandi (Palanquin)', cost: parseFloat(p.dandi_price) || 0 },
            { id: 'kandi', label: '🧺 Kandi (Wicker Cradle)', cost: parseFloat(p.kandi_price) || 0 },
            { id: 'pitthu', label: '🎒 Pitthu (Porter Service)', cost: parseFloat(p.pitthu_price) || 0 }
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
                        <label style="font-size:11px; font-weight:bold;">Number of Persons / Quantity:</label>
                        <input type="number" class="book-trek-qty" id="qty-${s.id}" data-id="${s.id}" value="1" min="1" oninput="updateLivePrice()" style="width:70px; padding:5px; border:1px solid #ccc; border-radius:5px; margin-left:5px;">
                    </div>
                </div>
             `).join('');
        }
    }

    let vaishnoHtmlBlock = '';
    if (isVaishnoDevi) {
        const vaishnoServices = [
            { id: 'vaishno_ghoda', label: '🐴 Horse (Ghora) - Vaishno Devi', cost: parseFloat(p.vaishno_ghoda_price) || 0 },
            { id: 'vaishno_dandi', label: '🪑 Palanquin (Palki) - Vaishno Devi', cost: parseFloat(p.vaishno_dandi_price) || 0 },
            { id: 'vaishno_pitthu', label: '🎒 Porters (Pithoo) - Vaishno Devi', cost: parseFloat(p.vaishno_pitthu_price) || 0 }
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
                        <label style="font-size:11px; font-weight:bold;">Number of Persons / Quantity:</label>
                        <input type="number" class="book-trek-qty" id="qty-${s.id}" data-id="${s.id}" value="1" min="1" oninput="updateLivePrice()" style="width:70px; padding:5px; border:1px solid #ccc; border-radius:5px; margin-left:5px;">
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
        const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
        total += (rate * qty);
    });

    document.querySelectorAll('.book-trek-check:checked').forEach(checkbox => {
        const id = checkbox.dataset.id;
        const rate = parseFloat(checkbox.dataset.rate) || 0;
        const qtyInput = document.getElementById(`qty-${id}`);
        const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
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

    const ghodaChecked = document.getElementById('check-ghoda') && document.getElementById('check-ghoda').checked;
    const dandiChecked = document.getElementById('check-dandi') && document.getElementById('check-dandi').checked;
    const kandiChecked = document.getElementById('check-kandi') && document.getElementById('check-kandi').checked;
    const pitthuChecked = document.getElementById('check-pitthu') && document.getElementById('check-pitthu').checked;

    const vGhodaChecked = document.getElementById('check-vaishno_ghoda') && document.getElementById('check-vaishno_ghoda').checked;
    const vDandiChecked = document.getElementById('check-vaishno_dandi') && document.getElementById('check-vaishno_dandi').checked;
    const vPitthuChecked = document.getElementById('check-vaishno_pitthu') && document.getElementById('check-vaishno_pitthu').checked;

    const ghodaQty = ghodaChecked ? (parseInt(document.getElementById('qty-ghoda').value) || 1) : 0;
    const dandiQty = dandiChecked ? (parseInt(document.getElementById('qty-dandi').value) || 1) : 0;
    const kandiQty = kandiChecked ? (parseInt(document.getElementById('qty-kandi').value) || 1) : 0;
    const pitthuQty = pitthuChecked ? (parseInt(document.getElementById('qty-pitthu').value) || 1) : 0;

    const vGhodaQty = vGhodaChecked ? (parseInt(document.getElementById('qty-vaishno_ghoda').value) || 1) : 0;
    const vDandiQty = vDandiChecked ? (parseInt(document.getElementById('qty-vaishno_dandi').value) || 1) : 0;
    const vPitthuQty = vPitthuChecked ? (parseInt(document.getElementById('qty-vaishno_pitthu').value) || 1) : 0;

    if (ghodaChecked) totalPrice += (parseFloat(document.getElementById('check-ghoda').dataset.rate) * ghodaQty);
    if (dandiChecked) totalPrice += (parseFloat(document.getElementById('check-dandi').dataset.rate) * dandiQty);
    if (kandiChecked) totalPrice += (parseFloat(document.getElementById('check-kandi').dataset.rate) * kandiQty);
    if (pitthuChecked) totalPrice += (parseFloat(document.getElementById('check-pitthu').dataset.rate) * pitthuQty);

    if (vGhodaChecked) totalPrice += (parseFloat(document.getElementById('check-vaishno_ghoda').dataset.rate) * vGhodaQty);
    if (vDandiChecked) totalPrice += (parseFloat(document.getElementById('check-vaishno_dandi').dataset.rate) * vDandiQty);
    if (vPitthuChecked) totalPrice += (parseFloat(document.getElementById('check-vaishno_pitthu').dataset.rate) * vPitthuQty);

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
            agency_id: agencyId,
            agency_email: agencyEmail,
            
            keda_ghoda_qty: ghodaQty,
            keda_dandi_qty: dandiQty,
            keda_kandi_qty: kandiQty,
            keda_pitthu_qty: pitthuQty,

            vaishno_ghoda_qty: vGhodaQty,
            vaishno_dandi_qty: vDandiQty,
            vaishno_pitthu_qty: vPitthuQty,
        }]);

        if (!error) {
            alert(`✅ Success! Request sent for ${new Date(travelDate).toLocaleDateString()}. Total: ₹${totalPrice}`);
            document.getElementById('detail-modal').style.display = 'none';
            
            if (typeof window.renderCustomerRequests === 'function') {
                window.renderCustomerRequests();
            }
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
// =========================================================================
// 8. PACKAGE DETAIL VIEW (CODEPEN SYNTAX-SAFE VERSION) - MULTI-DEST ADDONS FIXED
// =========================================================================
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
    const limitDate = new Date();
    limitDate.setDate(today.getDate() + 7);
    const limitStr = limitDate.toISOString().split('T')[0];

    // Check if the destinations list includes Kedarnath or Vaishno Devi (Robust check to ensure it shows up)
    const pkgDestinations = Array.isArray(p.destination) ? p.destination : [p.destination];
    const destStringLower = pkgDestinations.join(' ').toLowerCase();
    const isKedarnath = destStringLower.includes('kedarnath') || destStringLower.includes('char dham');
    const isVaishno = destStringLower.includes('vaishno') || destStringLower.includes('katra');
    const showTrekServices = isKedarnath || isVaishno;

    // Pre-build Vehicle HTML
    const vehicleHtml = vehicleList.map(v => `
        <div style="padding:12px; border:1px solid #eee; border-radius:10px; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <input type="checkbox" class="book-v-check" data-id="${v.id}" data-rate="${v.rate}" onchange="toggleQtyInput('${v.id}'); updateLivePrice();">
                    <b>${v.name}</b>
                </div>
                <span style="color:#2ecc71; font-weight:bold;">₹${v.rate}</span>
            </div>
            <div id="qty-container-${v.id}" style="display:none; margin-top:10px;">
                <input type="number" class="book-v-qty" data-id="${v.id}" value="1" min="1" max="${v.max_cars || 1}" oninput="updateLivePrice()" style="width:60px;">
                <small>Max: ${v.max_cars || 1}</small>
            </div>
        </div>`).join('');

    // Pre-build Special Trek Services HTML (Separated by destination blocks)
    let trekServicesHtml = '';
    if (showTrekServices) {
        
        // 1. KEDARNATH SERVICES BLOCK
        let kedaHtmlBlock = '';
        if (isKedarnath) {
            const kedarnathServices = [
                { id: 'ghoda', name: '🐴 Khachhar / Ghoda (Horse)', price: parseFloat(p.ghoda_price) || 0, maxLimit: parseInt(p.ghoda_max) || 1 },
                { id: 'dandi', name: '🪑 Dandi (Palanquin)', price: parseFloat(p.dandi_price) || 0, maxLimit: parseInt(p.dandi_max) || 1 },
                { id: 'kandi', name: '🧺 Kandi (Wicker Cradle)', price: parseFloat(p.kandi_price) || 0, maxLimit: parseInt(p.kandi_max) || 1 },
                { id: 'pitthu', name: '🎒 Pitthu (Porter Service)', price: parseFloat(p.pitthu_price) || 0, maxLimit: parseInt(p.pitthu_max) || 1 }
            ].filter(s => s.price > 0);

            if (kedarnathServices.length > 0) {
                kedaHtmlBlock = `<h4 style="margin-top:15px; color:#e67e22;">Mountain Trek Services (Only for Kedarnath)</h4>`;
                kedaHtmlBlock += kedarnathServices.map(s => `
                    <div style="padding:12px; border:1px solid #ffeaa7; background:#fffdf0; border-radius:10px; margin-bottom:8px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <input type="checkbox" class="book-trek-check" id="check-${s.id}" data-id="${s.id}" data-rate="${s.price}" onchange="document.getElementById('trek-qty-box-${s.id}').style.display = this.checked ? 'block' : 'none'; updateLivePrice();">
                                <b>${s.name}</b>
                            </div>
                            <span style="color:#e67e22; font-weight:bold;">₹${s.price} / person</span>
                        </div>
                        <div id="trek-qty-box-${s.id}" style="display:none; margin-top:10px;">
                            <div style="display:flex; align-items:center; justify-content:space-between;">
                                <label style="font-size:11px; font-weight:bold;">Number of Persons / Quantity:</label>
                                <small style="color:#7f8c8d; font-weight:bold; margin-right:10px;">Allowed Max: ${s.maxLimit}</small>
                            </div>
                            <input type="number" class="book-trek-qty" id="qty-${s.id}" data-id="${s.id}" value="1" min="1" max="${s.maxLimit}" onkeypress="return event.charCode >= 48 && event.charCode <= 57" oninput="if(parseInt(this.value) > ${s.maxLimit}) this.value = ${s.maxLimit}; if(parseInt(this.value) < 1 || isNaN(parseInt(this.value))) this.value = 1; updateLivePrice();" style="width:70px; padding:5px; border:1px solid #ccc; border-radius:5px; margin-left:5px;">
                        </div>
                    </div>
                `).join('');
            }
        }

        // 2. VAISHNO DEVI SERVICES BLOCK
        let vaishnoHtmlBlock = '';
        if (isVaishno) {
            const vaishnoServices = [
                { id: 'vaishno_ghoda', name: '🐴 Horse (Ghora) - Vaishno Devi', price: parseFloat(p.vaishno_ghoda_price) || 0, maxLimit: parseInt(p.vaishno_ghoda_max || p.ghoda_max) || 1 },
                { id: 'vaishno_dandi', name: '🪑 Palanquin (Palki) - Vaishno Devi', price: parseFloat(p.vaishno_dandi_price) || 0, maxLimit: parseInt(p.vaishno_dandi_max || p.dandi_max) || 1 },
                { id: 'vaishno_pitthu', name: '🎒 Porters (Pithoo) - Vaishno Devi', price: parseFloat(p.vaishno_pitthu_price) || 0, maxLimit: parseInt(p.vaishno_pitthu_max || p.pitthu_max) || 1 }
            ].filter(s => s.price > 0);

            if (vaishnoServices.length > 0) {
                vaishnoHtmlBlock = `<h4 style="margin-top:15px; color:#2980b9;">Mountain Trek Services (Only for Vaishno Devi)</h4>`;
                vaishnoHtmlBlock += vaishnoServices.map(s => `
                    <div style="padding:12px; border:1px solid #b2bec3; background:#f5f6fa; border-radius:10px; margin-bottom:8px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <input type="checkbox" class="book-trek-check" id="check-${s.id}" data-id="${s.id}" data-rate="${s.price}" onchange="document.getElementById('trek-qty-box-${s.id}').style.display = this.checked ? 'block' : 'none'; updateLivePrice();">
                                <b>${s.name}</b>
                            </div>
                            <span style="color:#2980b9; font-weight:bold;">₹${s.price} / person</span>
                        </div>
                        <div id="trek-qty-box-${s.id}" style="display:none; margin-top:10px;">
                            <div style="display:flex; align-items:center; justify-content:space-between;">
                                <label style="font-size:11px; font-weight:bold;">Number of Persons / Quantity:</label>
                                <small style="color:#7f8c8d; font-weight:bold; margin-right:10px;">Allowed Max: ${s.maxLimit}</small>
                            </div>
                            <input type="number" class="book-trek-qty" id="qty-${s.id}" data-id="${s.id}" value="1" min="1" max="${s.maxLimit}" onkeypress="return event.charCode >= 48 && event.charCode <= 57" oninput="if(parseInt(this.value) > ${s.maxLimit}) this.value = ${s.maxLimit}; if(parseInt(this.value) < 1 || isNaN(parseInt(this.value))) this.value = 1; updateLivePrice();" style="width:70px; padding:5px; border:1px solid #ccc; border-radius:5px; margin-left:5px;">
                        </div>
                    </div>
                `).join('');
            }
        }

        // Combine both separate blocks inside the main variable seamlessly
        trekServicesHtml = kedaHtmlBlock + vaishnoHtmlBlock;
    }

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

            <div id="trek-addons-section">
                ${trekServicesHtml}
            </div>

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
    // Run price update on load to set initial state to 0
    if(window.updateLivePrice) window.updateLivePrice();
};

// THE BOOKING INITIATOR
window.initiateBooking = function(btnElement) {
    const packageId = btnElement.getAttribute('data-pkg-id');
    const packageTitle = btnElement.getAttribute('data-pkg-title');
    const agencyId = btnElement.getAttribute('data-agency-id');
    handleBookingInquiry(packageId, packageTitle, agencyId);
};

// LIVE PRICE CALCULATION ENGINE UPGRADE
window.updateLivePrice = function() {
    let grandTotal = 0;

    // Calculate vehicle choices
    document.querySelectorAll('.book-v-check:checked').forEach(el => {
        const id = el.dataset.id;
        const rate = parseFloat(el.dataset.rate) || 0;
        const qtyInput = document.querySelector(`.book-v-qty[data-id="${id}"]`);
        const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        grandTotal += (rate * qty);
    });

    // Calculate mountain trek service choices
    document.querySelectorAll('.book-trek-check:checked').forEach(el => {
        const id = el.dataset.id;
        const rate = parseFloat(el.dataset.rate) || 0;
        const qtyInput = document.getElementById(`qty-${id}`);
        const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        grandTotal += (rate * qty);
    });

    const displayElement = document.getElementById('live-total-display');
    if (displayElement) {
        displayElement.innerText = `₹${grandTotal}`;
    }
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
    
    // Process Vehicle selections
    const selectedVehicles = Array.from(document.querySelectorAll('.book-v-check:checked')).map(el => {
        const id = el.dataset.id;
        const rate = parseFloat(el.dataset.rate) || 0;
        const qtyInput = document.querySelector(`.book-v-qty[data-id="${id}"]`);
        const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        totalPrice += (rate * qty);
        return `${qty}x vehicle_id:${id}`;
    });

    if (selectedVehicles.length === 0) { alert("Select a vehicle!"); return; }

    // Read special mountain service quantities safely (with safe element validation checks for both separate structures)
    const ghodaChecked = document.getElementById('check-ghoda') && document.getElementById('check-ghoda').checked;
    const dandiChecked = document.getElementById('check-dandi') && document.getElementById('check-dandi').checked;
    const kandiChecked = document.getElementById('check-kandi') && document.getElementById('check-kandi').checked;
    const pitthuChecked = document.getElementById('check-pitthu') && document.getElementById('check-pitthu').checked;

    const vGhodaChecked = document.getElementById('check-vaishno_ghoda') && document.getElementById('check-vaishno_ghoda').checked;
    const vDandiChecked = document.getElementById('check-vaishno_dandi') && document.getElementById('check-vaishno_dandi').checked;
    const vPitthuChecked = document.getElementById('check-vaishno_pitthu') && document.getElementById('check-vaishno_pitthu').checked;

    // Resolve final quantities for saving (Merge quantities if they checked elements in separate categories)
    const finalGhodaQty = (ghodaChecked ? (parseInt(document.getElementById('qty-ghoda').value) || 1) : 0) + (vGhodaChecked ? (parseInt(document.getElementById('qty-vaishno_ghoda').value) || 1) : 0);
    const finalDandiQty = (dandiChecked ? (parseInt(document.getElementById('qty-dandi').value) || 1) : 0) + (vDandiChecked ? (parseInt(document.getElementById('qty-vaishno_dandi').value) || 1) : 0);
    const finalKandiQty = kandiChecked ? (parseInt(document.getElementById('qty-kandi').value) || 1) : 0;
    const finalPitthuQty = (pitthuChecked ? (parseInt(document.getElementById('qty-pitthu').value) || 1) : 0) + (vPitthuChecked ? (parseInt(document.getElementById('qty-vaishno_pitthu').value) || 1) : 0);

    // Add mountain add-on rates to total pricing ledger safely (Reading respective specific rates properly)
    if (ghodaChecked) totalPrice += (parseFloat(document.getElementById('check-ghoda').dataset.rate) * (parseInt(document.getElementById('qty-ghoda').value) || 1));
    if (dandiChecked) totalPrice += (parseFloat(document.getElementById('check-dandi').dataset.rate) * (parseInt(document.getElementById('qty-dandi').value) || 1));
    if (kandiChecked) totalPrice += (parseFloat(document.getElementById('check-kandi').dataset.rate) * (parseInt(document.getElementById('qty-kandi').value) || 1));
    if (pitthuChecked) totalPrice += (parseFloat(document.getElementById('check-pitthu').dataset.rate) * (parseInt(document.getElementById('qty-pitthu').value) || 1));

    if (vGhodaChecked) totalPrice += (parseFloat(document.getElementById('check-vaishno_ghoda').dataset.rate) * (parseInt(document.getElementById('qty-vaishno_ghoda').value) || 1));
    if (vDandiChecked) totalPrice += (parseFloat(document.getElementById('check-vaishno_dandi').dataset.rate) * (parseInt(document.getElementById('qty-vaishno_dandi').value) || 1));
    if (vPitthuChecked) totalPrice += (parseFloat(document.getElementById('check-vaishno_pitthu').dataset.rate) * (parseInt(document.getElementById('qty-vaishno_pitthu').value) || 1));

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
        policy_version: 'v1_9_percent_deduction',
        
        // SAVE QUANTITIES TO YOUR NEW SQL COLUMNS
        booked_ghoda_qty: finalGhodaQty,
        booked_dandi_qty: finalDandiQty,
        booked_kandi_qty: finalKandiQty,
        booked_pitthu_qty: finalPitthuQty
    }]);

    if (!error) {
        alert("Booking Sent!");
        document.getElementById('detail-modal').style.display = 'none';
        if (window.renderCustomerRequests) renderCustomerRequests();
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

            // --- BREAKDOWN GENERATION FOR KEDARNATH AND VAISHNO DEVI TREKKING SERVICES ---
            let trekkingHtml = '';
            
            // 1. Kedarnath Section Check
            const kGhoda = parseInt(b.kedar_ghoda_Qty) || 0;
            const kDandi = parseInt(b.kedar_dandi_Qty) || 0;
            const kPitthu = parseInt(b.kedar_pitthu_Qty) || 0;
            const kKandi = parseInt(b.kedar_kandi_Qty) || 0;

            if (kGhoda > 0 || kDandi > 0 || kPitthu > 0 || kKandi > 0) {
                trekkingHtml += `
                <div style="margin-top: 10px; padding: 12px; background: #f0f7ff; border: 1px solid #badc58; border-radius: 8px; font-size: 13px;">
                    <b style="color: #2980b9; display:block; margin-bottom:5px;">⛰️ Trekking Service Only For Kedarnath:</b>
                    <ul style="margin: 0; padding-left: 20px; color: #2d3436;">
                        ${kGhoda > 0 ? `<li>🐴 Ghoda/Horse: <b>${kGhoda} Members</b></li>` : ''}
                        ${kDandi > 0 ? `<li>🪑 Dandi/Palanquin: <b>${kDandi} Members</b></li>` : ''}
                        ${kPitthu > 0 ? `<li>🎒 Pitthu/Porter: <b>${kPitthu} Members</b></li>` : ''}
                        ${kKandi > 0 ? `<li>🧺 Kandi/Basket: <b>${kKandi} Members</b></li>` : ''}
                    </ul>
                </div>`;
            }

            // 2. Vaishno Devi Section Check (Reading from columns as named by you)
            const vGhoda = parseInt(b.vaishno_ghoda_price) || 0;
            const vDandi = parseInt(b.vaishno_dandi_price) || 0;
            const vPitthu = parseInt(b.vaishno_pitthu_price) || 0;

            if (vGhoda > 0 || vDandi > 0 || vPitthu > 0) {
                trekkingHtml += `
                <div style="margin-top: 10px; padding: 12px; background: #fffdf0; border: 1px solid #ffeaa7; border-radius: 8px; font-size: 13px;">
                    <b style="color: #e67e22; display:block; margin-bottom:5px;">⛰️ Trekking Service Only For Vaishno Devi:</b>
                    <ul style="margin: 0; padding-left: 20px; color: #2d3436;">
                        ${vGhoda > 0 ? `<li>🐴 Ghoda/Horse: <b>${vGhoda} Members</b></li>` : ''}
                        ${vDandi > 0 ? `<li>🪑 Dandi/Palanquin: <b>${vDandi} Members</b></li>` : ''}
                        ${vPitthu > 0 ? `<li>🎒 Pitthu/Porter: <b>${vPitthu} Members</b></li>` : ''}
                    </ul>
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
                        ${trekkingHtml} <p style="font-size:12px; margin-top:8px; color:#999;">Customer Email: ${displayEmail}</p>
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

// Dynamically shows/hides Mountain Trek Add-ons based on destination selections
window.toggleTrekPricingSection = function() {
    const kedarSection = document.getElementById('trek-pricing-section-kedar');
    const vaishnoSection = document.getElementById('trek-pricing-section-vaishno');
    
    if (!kedarSection || !vaishnoSection) return;

    let isKedarSelected = false;
    let isVaishnoSelected = false;

    document.querySelectorAll('.d-check:checked').forEach(cb => {
        if (cb.value === "Kedarnath (Uttarakhand)" || cb.value === "Char Dham Yatra (Uttarakhand)") {
            isKedarSelected = true;
        }
        if (cb.value === "Vaishno Devi (Katra)") {
            isVaishnoSelected = true;
        }
    });

    // Handle Kedarnath View Section
    if (isKedarSelected) {
        kedarSection.style.display = 'block';
    } else {
        kedarSection.style.display = 'none';
        if(document.getElementById('p-ghoda-enable')) document.getElementById('p-ghoda-enable').checked = false;
        if(document.getElementById('p-dandi-enable')) document.getElementById('p-dandi-enable').checked = false;
        if(document.getElementById('p-kandi-enable')) document.getElementById('p-kandi-enable').checked = false;
        if(document.getElementById('p-pitthu-enable')) document.getElementById('p-pitthu-enable').checked = false;

        if(document.getElementById('p-ghoda-price')) document.getElementById('p-ghoda-price').value = '';
        if(document.getElementById('p-dandi-price')) document.getElementById('p-dandi-price').value = '';
        if(document.getElementById('p-kandi-price')) document.getElementById('p-kandi-price').value = '';
        if(document.getElementById('p-pitthu-price')) document.getElementById('p-pitthu-price').value = '';
        if(document.getElementById('p-ghoda-max')) document.getElementById('p-ghoda-max').value = '1';
        if(document.getElementById('p-dandi-max')) document.getElementById('p-dandi-max').value = '1';
        if(document.getElementById('p-kandi-max')) document.getElementById('p-kandi-max').value = '1';
        if(document.getElementById('p-pitthu-max')) document.getElementById('p-pitthu-max').value = '1';
    }

    // Handle Vaishno Devi View Section
    if (isVaishnoSelected) {
        vaishnoSection.style.display = 'block';
    } else {
        vaishnoSection.style.display = 'none';
        if(document.getElementById('p-vaishno-ghoda-enable')) document.getElementById('p-vaishno-ghoda-enable').checked = false;
        if(document.getElementById('p-vaishno-dandi-enable')) document.getElementById('p-vaishno-dandi-enable').checked = false;
        if(document.getElementById('p-vaishno-pitthu-enable')) document.getElementById('p-vaishno-pitthu-enable').checked = false;

        if(document.getElementById('p-vaishno-ghoda-price')) document.getElementById('p-vaishno-ghoda-price').value = '';
        if(document.getElementById('p-vaishno-dandi-price')) document.getElementById('p-vaishno-dandi-price').value = '';
        if(document.getElementById('p-vaishno-pitthu-price')) document.getElementById('p-vaishno-pitthu-price').value = '';
        if(document.getElementById('p-vaishno-ghoda-max')) document.getElementById('p-vaishno-ghoda-max').value = '1';
        if(document.getElementById('p-vaishno-dandi-max')) document.getElementById('p-vaishno-dandi-max').value = '1';
        if(document.getElementById('p-vaishno-pitthu-max')) document.getElementById('p-vaishno-pitthu-max').value = '1';
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
    
    // --- ROBUST PARSING FOR DESTINATIONS ARRAY ---
    let activeDests = [];
    if (typeof pkgDestinations === 'string') {
        try {
            activeDests = JSON.parse(pkgDestinations);
        } catch(e) {
            activeDests = pkgDestinations.split(',').map(d => d.trim());
        }
    } else if (Array.isArray(pkgDestinations)) {
        activeDests = pkgDestinations;
    } else {
        activeDests = [pkgDestinations];
    }
    
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
            <input type="checkbox" class="d-check" value="${d}" ${activeDests.includes(d) ? 'checked' : ''} onchange="window.toggleTrekPricingSection()"> ${d}
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

    // Pre-determine status flags during edits
    const shouldShowKedarInitial = activeDests.some(d => ["Kedarnath (Uttarakhand)", "Char Dham Yatra (Uttarakhand)"].includes(d));
    const shouldShowVaishnoInitial = activeDests.some(d => ["Vaishno Devi (Katra)"].includes(d));

    // Logic to pre-check service tick boxes if values already exist during Edit
    const hasKedarGhoda = isEdit && (parseFloat(pkg.ghoda_price) > 0);
    const hasKedarDandi = isEdit && (parseFloat(pkg.dandi_price) > 0);
    const hasKedarKandi = isEdit && (parseFloat(pkg.kandi_price) > 0);
    const hasKedarPitthu = isEdit && (parseFloat(pkg.pitthu_price) > 0);

    const hasVaishnoGhoda = isEdit && (parseFloat(pkg.vaishno_ghoda_price) > 0);
    const hasVaishnoDandi = isEdit && (parseFloat(pkg.vaishno_dandi_price) > 0);
    const hasVaishnoPitthu = isEdit && (parseFloat(pkg.vaishno_pitthu_price) > 0);

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

            <div id="trek-pricing-section-kedar" style="display: ${shouldShowKedarInitial ? 'block' : 'none'}; background:#fffdf0; padding:15px; border:1px solid #ffeaa7; border-radius:12px; margin-bottom:20px;">
                <p style="margin-top:0; color:#e67e22;"><b>⛰️ Mountain Trek Service Pricing (only for kedarnath):</b></p>
                <div style="display:grid; grid-template-columns: 1fr; gap:15px;">
                    
                    <div style="display:flex; gap:10px; align-items:flex-end;">
                        <div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: center; height: 32px;">
                            <input type="checkbox" id="p-ghoda-enable" ${hasKedarGhoda ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                        </div>
                        <div style="flex:2;">
                            <label style="font-size:11px; font-weight:bold; color:#555;">🐴 Horse / Mule (Ghoda/Khachhar) Price</label>
                            <input type="number" id="p-ghoda-price" placeholder="₹ Rate" value="${isEdit ? (pkg.ghoda_price || '') : ''}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; margin-top:3px;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:11px; font-weight:bold; color:#555;">Max Member</label>
                            <input type="number" id="p-ghoda-max" placeholder="Max" value="${isEdit ? (pkg.ghoda_max || '1') : '1'}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; margin-top:3px;">
                        </div>
                    </div>

                    <div style="display:flex; gap:10px; align-items:flex-end;">
                        <div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: center; height: 32px;">
                            <input type="checkbox" id="p-dandi-enable" ${hasKedarDandi ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                        </div>
                        <div style="flex:2;">
                            <label style="font-size:11px; font-weight:bold; color:#555;">🪑 Palanquin (Dandi) Price</label>
                            <input type="number" id="p-dandi-price" placeholder="₹ Rate" value="${isEdit ? (pkg.dandi_price || '') : ''}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; margin-top:3px;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:11px; font-weight:bold; color:#555;">Max Member</label>
                            <input type="number" id="p-dandi-max" placeholder="Max" value="${isEdit ? (pkg.dandi_max || '1') : '1'}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; margin-top:3px;">
                        </div>
                    </div>

                    <div style="display:flex; gap:10px; align-items:flex-end;">
                        <div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: center; height: 32px;">
                            <input type="checkbox" id="p-kandi-enable" ${hasKedarKandi ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                        </div>
                        <div style="flex:2;">
                            <label style="font-size:11px; font-weight:bold; color:#555;">🧺 Wicker Cradle (Kandi) Price</label>
                            <input type="number" id="p-kandi-price" placeholder="₹ Rate" value="${isEdit ? (pkg.kandi_price || '') : ''}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; margin-top:3px;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:11px; font-weight:bold; color:#555;">Max Member</label>
                            <input type="number" id="p-kandi-max" placeholder="Max" value="${isEdit ? (pkg.kandi_max || '1') : '1'}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; margin-top:3px;">
                        </div>
                    </div>

                    <div style="display:flex; gap:10px; align-items:flex-end;">
                        <div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: center; height: 32px;">
                            <input type="checkbox" id="p-pitthu-enable" ${hasKedarPitthu ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                        </div>
                        <div style="flex:2;">
                            <label style="font-size:11px; font-weight:bold; color:#555;">🎒 Porter Service (Pitthu) Price</label>
                            <input type="number" id="p-pitthu-price" placeholder="₹ Rate" value="${isEdit ? (pkg.pitthu_price || '') : ''}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; margin-top:3px;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:11px; font-weight:bold; color:#555;">Max Member</label>
                            <input type="number" id="p-pitthu-max" placeholder="Max" value="${isEdit ? (pkg.pitthu_max || '1') : '1'}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; margin-top:3px;">
                        </div>
                    </div>

                </div>
            </div>

            <div id="trek-pricing-section-vaishno" style="display: ${shouldShowVaishnoInitial ? 'block' : 'none'}; background:#f0f7ff; padding:15px; border:1px solid #a7cfff; border-radius:12px; margin-bottom:20px;">
                <p style="margin-top:0; color:#0066cc;"><b>⛰️ Mountain Trek Service Pricing (only for vaishno devi):</b></p>
                <div style="display:grid; grid-template-columns: 1fr; gap:15px;">
                    
                    <div style="display:flex; gap:10px; align-items:flex-end;">
                        <div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: center; height: 32px;">
                            <input type="checkbox" id="p-vaishno-ghoda-enable" ${hasVaishnoGhoda ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                        </div>
                        <div style="flex:2;">
                            <label style="font-size:11px; font-weight:bold; color:#555;">🐴 Horse (Ghora) Price</label>
                            <input type="number" id="p-vaishno-ghoda-price" placeholder="₹ Rate" value="${isEdit ? (pkg.vaishno_ghoda_price || '') : ''}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; margin-top:3px;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:11px; font-weight:bold; color:#555;">Max Member</label>
                            <input type="number" id="p-vaishno-ghoda-max" placeholder="Max" value="${isEdit ? (pkg.vaishno_ghoda_max || '1') : '1'}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; margin-top:3px;">
                        </div>
                    </div>

                    <div style="display:flex; gap:10px; align-items:flex-end;">
                        <div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: center; height: 32px;">
                            <input type="checkbox" id="p-vaishno-dandi-enable" ${hasVaishnoDandi ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                        </div>
                        <div style="flex:2;">
                            <label style="font-size:11px; font-weight:bold; color:#555;">🪑 Palanquin (Palki) Price</label>
                            <input type="number" id="p-vaishno-dandi-price" placeholder="₹ Rate" value="${isEdit ? (pkg.vaishno_dandi_price || '') : ''}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; margin-top:3px;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:11px; font-weight:bold; color:#555;">Max Member</label>
                            <input type="number" id="p-vaishno-dandi-max" placeholder="Max" value="${isEdit ? (pkg.vaishno_dandi_max || '1') : '1'}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; margin-top:3px;">
                        </div>
                    </div>

                    <div style="display:flex; gap:10px; align-items:flex-end;">
                        <div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: center; height: 32px;">
                            <input type="checkbox" id="p-vaishno-pitthu-enable" ${hasVaishnoPitthu ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                        </div>
                        <div style="flex:2;">
                            <label style="font-size:11px; font-weight:bold; color:#555;">🎒 Porters (Pithoo) Price</label>
                            <input type="number" id="p-vaishno-pitthu-price" placeholder="₹ Rate" value="${isEdit ? (pkg.vaishno_pitthu_price || '') : ''}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; margin-top:3px;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:11px; font-weight:bold; color:#555;">Max Member</label>
                            <input type="number" id="p-vaishno-pitthu-max" placeholder="Max" value="${isEdit ? (pkg.vaishno_pitthu_max || '1') : '1'}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; margin-top:3px;">
                        </div>
                    </div>

                </div>
            </div>

            <label style="font-size:11px; font-weight:bold; color:#666;">ITINERARY DETAILS</label>
            <textarea id="p-desc" style="height:120px; width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" placeholder="Describe the trip...">${isEdit ? (pkg.description || '') : ''}</textarea>
            
            <div style="display:flex; gap:10px; margin-top:25px;">
                <button id="save-btn" onclick="window.processSave('${isEdit ? pkg.id : ''}')" style="background:#2ecc71; color:white; flex:2; height:50px; font-weight:bold; border:none; border-radius:8px; cursor:pointer;">
                    ${isEdit ? 'SAVE CHANGES' : 'PUBLISH PACKAGE'}
                </button>
                ${isEdit ? `
                <button onclick="if(confirm('Are you sure you want to delete this package?')) window.deletePackage('${pkg.id}')" style="background:#e74c3c; color:white; flex:1; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">
                    🗑️ Delete
                </button>
                ` : ''}
                <button onclick="window.showTab('packages')" style="background:#eee; flex:1; border:none; border-radius:8px; cursor:pointer;">Cancel</button>
            </div>
        </div>`;
};

// PROCESS SAVE: Collects form data and updates/inserts into Supabase 'packages' table
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

        if (!title || !city) {
            alert("Please fill Package Title and Starting City.");
            if (saveBtn) { saveBtn.disabled = false; saveBtn.innerText = packageId ? 'SAVE CHANGES' : 'PUBLISH PACKAGE'; }
            return;
        }

        // Gather Destinations
        const selectedDests = [];
        document.querySelectorAll('.d-check:checked').forEach(cb => {
            selectedDests.push(cb.value);
        });

        if (selectedDests.length === 0) {
            alert("Please select at least one destination.");
            if (saveBtn) { saveBtn.disabled = false; saveBtn.innerText = packageId ? 'SAVE CHANGES' : 'PUBLISH PACKAGE'; }
            return;
        }

        // Gather Vehicles
        const vehicles = [];
        document.querySelectorAll('.v-enable:checked').forEach(cb => {
            const vid = cb.getAttribute('data-id');
            const rateInput = document.querySelector(`.v-rate[data-id="${vid}"]`);
            const maxInput = document.querySelector(`.v-max[data-id="${vid}"]`);
            vehicles.push({
                id: vid,
                rate: parseFloat(rateInput.value) || 0,
                max_cars: parseInt(maxInput.value) || 1
            });
        });

        // 1. GATHER KEDARNATH RATES
        const ghodaEnabled = document.getElementById('p-ghoda-enable')?.checked || false;
        const dandiEnabled = document.getElementById('p-dandi-enable')?.checked || false;
        const kandiEnabled = document.getElementById('p-kandi-enable')?.checked || false;
        const pitthuEnabled = document.getElementById('p-pitthu-enable')?.checked || false;

        const ghoda_price = ghodaEnabled ? (parseFloat(document.getElementById('p-ghoda-price').value) || 0) : 0;
        const dandi_price = dandiEnabled ? (parseFloat(document.getElementById('p-dandi-price').value) || 0) : 0;
        const kandi_price = kandiEnabled ? (parseFloat(document.getElementById('p-kandi-price').value) || 0) : 0;
        const pitthu_price = pitthuEnabled ? (parseFloat(document.getElementById('p-pitthu-price').value) || 0) : 0;

        const ghoda_max = ghodaEnabled ? (parseInt(document.getElementById('p-ghoda-max').value) || 1) : 1;
        const dandi_max = dandiEnabled ? (parseInt(document.getElementById('p-dandi-max').value) || 1) : 1;
        const kandi_max = kandiEnabled ? (parseInt(document.getElementById('p-kandi-max').value) || 1) : 1;
        const pitthu_max = pitthuEnabled ? (parseInt(document.getElementById('p-pitthu-max').value) || 1) : 1;

        // 2. GATHER VAISHNO DEVI RATES
        const vaishnoGhodaEnabled = document.getElementById('p-vaishno-ghoda-enable')?.checked || false;
        const vaishnoDandiEnabled = document.getElementById('p-vaishno-dandi-enable')?.checked || false;
        const vaishnoPitthuEnabled = document.getElementById('p-vaishno-pitthu-enable')?.checked || false;

        const vaishno_ghoda_price = vaishnoGhodaEnabled ? (parseFloat(document.getElementById('p-vaishno-ghoda-price').value) || 0) : 0;
        const vaishno_dandi_price = vaishnoDandiEnabled ? (parseFloat(document.getElementById('p-vaishno-dandi-price').value) || 0) : 0;
        const vaishno_pitthu_price = vaishnoPitthuEnabled ? (parseFloat(document.getElementById('p-vaishno-pitthu-price').value) || 0) : 0;

        const vaishno_ghoda_max = vaishnoGhodaEnabled ? (parseInt(document.getElementById('p-vaishno-ghoda-max').value) || 1) : 1;
        const vaishno_dandi_max = vaishnoDandiEnabled ? (parseInt(document.getElementById('p-vaishno-dandi-max').value) || 1) : 1;
        const vaishno_pitthu_max = vaishnoPitthuEnabled ? (parseInt(document.getElementById('p-vaishno-pitthu-max').value) || 1) : 1;

        // Get Agency Session Data
        const sessionStr = localStorage.getItem('agency_session');
        if (!sessionStr) throw new Error("No active session found.");
        const session = JSON.parse(sessionStr);

        // Map payload exactly to database columns
        const payload = {
            title: title,
            starting_location: city,
            destinations: selectedDests, // Saved as array/JSON
            vehicles: vehicles,           // Saved as JSON
            description: desc,
            agency_id: session.id,
            
            // Kedarnath Fields mapping
            ghoda_price,
            dandi_price,
            kandi_price,
            pitthu_price,
            ghoda_max,
            dandi_max,
            kandi_max,
            pitthu_max,

            // Vaishno Devi Fields mapping
            vaishno_ghoda_price,
            vaishno_dandi_price,
            vaishno_pitthu_price,
            vaishno_ghoda_max,
            vaishno_dandi_max,
            vaishno_pitthu_max
        };

        let resultError = null;

        if (packageId) {
            // Update Existing Package
            const { error } = await _supabase
                .from('packages')
                .update(payload)
                .eq('id', packageId);
            resultError = error;
        } else {
            // Insert New Package
            const { error } = await _supabase
                .from('packages')
                .insert([payload]);
            resultError = error;
        }

        if (resultError) throw resultError;

        alert(packageId ? "Package updated successfully!" : "Package published successfully!");
        window.showTab('packages'); // Go back to listings and auto refresh

    } catch (err) {
        console.error("Save Error:", err);
        alert("Error saving package: " + err.message);
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerText = packageId ? 'SAVE CHANGES' : 'PUBLISH PACKAGE';
        }
    }
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

        // --- Dynamic Trek Pricing & Max Member Extraction ---
        const isKedarSelected = selectedDests.some(d => ["Kedarnath (Uttarakhand)", "Char Dham Yatra (Uttarakhand)"].includes(d));
        const isVaishnoSelected = selectedDests.some(d => ["Vaishno Devi (Katra)"].includes(d));

        // Kedarnath Variables
        let ghodaPrice = 0, ghodaMax = 1;
        let dandiPrice = 0, dandiMax = 1;
        let kandiPrice = 0, kandiMax = 1;
        let pitthuPrice = 0, pitthuMax = 1;

        // Vaishno Devi Variables
        let vaishnoGhodaPrice = 0, vaishnoGhodaQty = 1;
        let vaishnoDandiPrice = 0, vaishnoDandiQty = 1;
        let vaishnoPitthuPrice = 0, vaishnoPitthuQty = 1;

        if (isKedarSelected) {
            const ghodaEnabled = document.getElementById('p-ghoda-enable')?.checked;
            const dandiEnabled = document.getElementById('p-dandi-enable')?.checked;
            const kandiEnabled = document.getElementById('p-kandi-enable')?.checked;
            const pitthuEnabled = document.getElementById('p-pitthu-enable')?.checked;

            const ghodaMaxInput = document.getElementById('p-ghoda-max');
            const dandiMaxInput = document.getElementById('p-dandi-max');
            const kandiMaxInput = document.getElementById('p-kandi-max');
            const pitthuMaxInput = document.getElementById('p-pitthu-max');

            ghodaMax = ghodaMaxInput ? (parseInt(ghodaMaxInput.value) || 1) : 1;
            dandiMax = dandiMaxInput ? (parseInt(dandiMaxInput.value) || 1) : 1;
            kandiMax = kandiMaxInput ? (parseInt(kandiMaxInput.value) || 1) : 1;
            pitthuMax = pitthuMaxInput ? (parseInt(pitthuMaxInput.value) || 1) : 1;

            if (ghodaEnabled) ghodaPrice = parseFloat(document.getElementById('p-ghoda-price')?.value) || 0;
            if (dandiEnabled) dandiPrice = parseFloat(document.getElementById('p-dandi-price')?.value) || 0;
            if (kandiEnabled) kandiPrice = parseFloat(document.getElementById('p-kandi-price')?.value) || 0;
            if (pitthuEnabled) pitthuPrice = parseFloat(document.getElementById('p-pitthu-price')?.value) || 0;
        } 
        
        if (isVaishnoSelected) {
            const vaishnoGhodaEnabled = document.getElementById('p-vaishno-ghoda-enable')?.checked;
            const vaishnoDandiEnabled = document.getElementById('p-vaishno-dandi-enable')?.checked;
            const vaishnoPitthuEnabled = document.getElementById('p-vaishno-pitthu-enable')?.checked;

            const vaishnoGhodaMaxInput = document.getElementById('p-vaishno-ghoda-max');
            const vaishnoDandiMaxInput = document.getElementById('p-vaishno-dandi-max');
            const vaishnoPitthuMaxInput = document.getElementById('p-vaishno-pitthu-max');

            vaishnoGhodaQty = vaishnoGhodaMaxInput ? (parseInt(vaishnoGhodaMaxInput.value) || 1) : 1;
            vaishnoDandiQty = vaishnoDandiMaxInput ? (parseInt(vaishnoDandiMaxInput.value) || 1) : 1;
            vaishnoPitthuQty = vaishnoPitthuMaxInput ? (parseInt(vaishnoPitthuMaxInput.value) || 1) : 1;

            if (vaishnoGhodaEnabled) vaishnoGhodaPrice = parseFloat(document.getElementById('p-vaishno-ghoda-price')?.value) || 0;
            if (vaishnoDandiEnabled) vaishnoDandiPrice = parseFloat(document.getElementById('p-vaishno-dandi-price')?.value) || 0;
            if (vaishnoPitthuEnabled) vaishnoPitthuPrice = parseFloat(document.getElementById('p-vaishno-pitthu-price')?.value) || 0;
        }

        const pkgData = {
            title: title,
            starting_location: city,
            destination: selectedDests, 
            vehicles: selectedVehicles,
            description: desc,
            agency_id: user.id,
            
            // KEDARNATH DATABASE MAPPING
            ghoda_price: ghodaPrice,
            ghoda_max: ghodaMax,
            dandi_price: dandiPrice,
            dandi_max: dandiMax,
            kandi_price: kandiPrice,
            kandi_max: kandiMax,
            pitthu_price: pitthuPrice,
            pitthu_max: pitthuMax,

            // VAISHNO DEVI DATABASE MAPPING (EXACT SCHEMA MATCH - NO EXTRA QTY COLUMNS)
            vaishno_ghoda_price: vaishnoGhodaPrice, 
            vaishno_dandi_price: vaishnoDandiPrice,
            vaishno_pitthu_price: vaishnoPitthuPrice
        };

        let error;
        // Logic to either Update (Edit) or Insert (New)
        if (pkgId && pkgId !== "" && pkgId !== "undefined" && pkgId !== null) {
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
        const isApprovedOrConfirmed = b.status === 'confirmed' || b.status === 'approved';
        const statusColor = isCancelled ? '#e74c3c' : (isApprovedOrConfirmed ? '#2ecc71' : '#f39c12');
        
        // Formatting the date to be more readable (e.g., "15 April 2026")
        const travelDate = b.travel_date ? new Date(b.travel_date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        }) : 'Not Selected';

        const policyTag = b.constant_9_percent_policy ? 
            `<div style="background:#d1f2eb; color:#16a085; padding:5px 12px; border-radius:20px; font-size:11px; font-weight:bold;">🛡️ 9% Policy Verified</div>` : 
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

