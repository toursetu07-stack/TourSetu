// 1. SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://udfwcqrmksfyeigxgdws.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZndjcXJta3NmeWVpZ3hnZHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTIyNTQsImV4cCI6MjA4ODAyODI1NH0.zf1taGGbEszA0cKMwFw8rKBuT2OwYqUjF45MqZXaEBw';

let _supabase;
let isLoginMode = true;

// 2. DATA CONFIGURATION
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

function getClient() {
    if (!_supabase && window.supabase) _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _supabase;
}

// 3. APP INITIALIZATION
async function initApp() {
    const client = getClient();
    if (!client) return;
    const { data: { user } } = await client.auth.getUser();
    if (user) showDashboard(user);
    else renderAuthUI();
}



// 5. DASHBOARD ROUTING
async function showDashboard(user) {
    const role = user.user_metadata.role || 'customer';
    if (role === 'agency') renderAgencyDashboard(user);
    else renderCustomerHomepage(user);
}

// 4. AUTH UI
function renderAuthUI() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="card" style="max-width:450px; margin: 80px auto; padding:40px; background:white; text-align:center;">
            <h1 style="color:#ff9f43; margin-bottom:10px;">TourSetu</h1>
            <h2 id="form-title">${isLoginMode ? "Welcome Back" : "Create Account"}</h2>
            <input type="email" id="email" placeholder="Email Address">
            <input type="password" id="password" placeholder="Password">
            <div id="role-selection" style="display: ${isLoginMode ? 'none' : 'block'};">
                <select id="role" onchange="toggleBusinessFields()">
                    <option value="customer">Traveler</option>
                    <option value="agency">Travel Agency</option>
                </select>
            </div>
            <div id="business-fields" style="display:none;">
                <input type="text" id="gst-no" placeholder="GST Number">
                <input type="text" id="biz-reg" placeholder="Business Reg No">
                <input type="text" id="biz-lic" placeholder="Trade License">
                <input type="text" id="biz-phone" placeholder="Mobile / Contact No">
            </div>
            <button onclick="handleAuth()" style="background:#ff9f43; color:white; width:100%; padding:14px; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:20px;">
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

window.toggleMode = () => { isLoginMode = !isLoginMode; renderAuthUI(); };
window.toggleBusinessFields = () => {
    const role = document.getElementById('role').value;
    document.getElementById('business-fields').style.display = (role === 'agency') ? 'block' : 'none';
};

window.handleAuth = async function() {
    const client = getClient();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const status = document.getElementById('status');
    if (isLoginMode) {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) status.innerText = "❌ " + error.message;
        else showDashboard(data.user);
    } else {
        const role = document.getElementById('role').value;
        const metadata = { role, is_approved: false };
        if (role === 'agency') {
            metadata.gst = document.getElementById('gst-no').value;
            metadata.reg_no = document.getElementById('biz-reg').value;
            metadata.license = document.getElementById('biz-lic').value;
            metadata.phone = document.getElementById('biz-phone').value;
        }
        const { error } = await client.auth.signUp({ email, password, options: { data: metadata } });
        if (error) status.innerText = "❌ " + error.message;
        else status.innerText = "✅ Registration Successful!";
    }
};
// 6. CUSTOMER HOMEPAGE
function renderCustomerHomepage(user) {
    const app = document.getElementById('app');
    app.style.maxWidth = "100%";
    app.innerHTML = `
        <div style="font-family:'Inter', sans-serif; background:#f4f7f6; min-height:100vh; margin:-20px;">
            <div style="background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80');
                    height:450px; background-size:cover; background-position:center; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; padding:20px;">
                <h1 style="font-size:3rem; margin-bottom:10px; text-align:center;">Find Your Perfect Match</h1>
                <p style="font-size:1.2rem; margin-bottom:40px; opacity:0.9;">Direct connections with verified local travel agencies</p>
                
                <div class="card" style="background:white; padding:30px; border-radius:20px; display:flex; gap:15px; width:95%; max-width:1000px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); flex-wrap:wrap;">
                  <div style="flex:1; min-width:250px; text-align:left;">
                      <label style="color:#636e72; font-weight:bold; font-size:12px; letter-spacing:1px;">MY STARTING LOCATION</label>
                      <select id="search-start" style="border: 2px solid #eee; margin-top:8px;">
                         <option value="">Select City</option>
                          ${Object.values(locationData).flat().sort().map(city => `<option value="${city}">${city}</option>`).join('')}
                      </select>
                   </div>
                  <div style="flex:1; min-width:250px; text-align:left;">
                      <label style="color:#636e72; font-weight:bold; font-size:12px; letter-spacing:1px;">TOUR DESTINATION</label>
                      <select id="search-dest" style="border: 2px solid #eee; margin-top:8px;">
                          <option value="">Select Destination</option>
                          ${tourDestinations.map(d => `<option value="${d}">${d}</option>`).join('')}
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
                    <button onclick="renderCustomerRequests()" style="background:#3498db; color:white; padding:10px 20px; border-radius:10px; font-weight:bold; cursor:pointer;">My Requests</button>
                    <button onclick="executeLogout()" style="background:#f1f2f6; color:#ff7675; width:auto; padding:10px 25px; border-radius:10px; font-weight:bold; cursor:pointer;">Logout</button>
                  </div>
              </div>
               <div id="customer-pkg-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap:30px;"></div>
           </div>
        </div>
        <div id="detail-modal" class="modal-overlay" style="display:none;">
            <div class="modal-content card">
                <div id="detail-view-body"></div>
           </div>
        </div>
    `;
    loadAllPackages();
}

// NEW: FUNCTION TO RENDER CUSTOMER BOOKING REQUESTS
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

    container.innerHTML = data.map(b => `
        <div class="card" style="background:white; padding:25px; border-left:5px solid ${b.status === 'paid' ? '#2ecc71' : '#ff9f43'}; position:relative;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <h3 style="margin:0 0 10px 0;">${b.package_title}</h3>
                    <div style="font-size:13px; color:#636e72;">
                        <div>🚗 Vehicles: ${b.selected_vehicles}</div>
                        <div style="margin-top:5px;">Status: <b style="color:${b.status === 'paid' ? '#2ecc71' : '#e67e22'}">${b.status.toUpperCase()}</b></div>
                    </div>
                </div>
                ${b.status === 'pending' ? `
                    <button onclick="deleteBookingRequest(${b.id})" style="background:none; border:1px solid #ff7675; color:#ff7675; padding:5px 10px; font-size:12px; border-radius:5px;">🗑️ Delete Request</button>
                ` : ''}
            </div>

            <div style="margin-top:20px; padding:15px; border-radius:10px; background:${b.status === 'paid' ? '#f0fff4' : '#f8f9fa'}; border:1px solid ${b.status === 'paid' ? '#2ecc71' : '#eee'};">
                ${b.status === 'paid' ? `
                    <div style="text-align:center;">
                        <p style="margin:0 0 5px 0; font-size:12px; color:#27ae60; font-weight:bold;">✅ AGENCY CONTACT REVEALED</p>
                        <h2 style="margin:0; color:#2d3436;">${b.agency_contact || 'Contact info missing'}</h2>
                    </div>
                ` : `
                    <div style="text-align:center; color:#636e72;">
                        <p style="margin:0; font-size:13px;">🔒 Contact Details Locked</p>
                        <small>Available only after payment is confirmed</small>
                        ${b.status === 'approved' ? `
                            <button onclick="simulatePayment(${b.id})" style="margin-top:10px; background:#2ecc71; color:white; width:100%; padding:10px;">PROCEED TO PAYMENT</button>
                        ` : ''}
                    </div>
                `}
            </div>
        </div>
    `).join('');
};

// NEW: DELETE REQUEST ACTION
window.deleteBookingRequest = async (id) => {
    if(confirm("Are you sure you want to cancel and delete this request?")) {
        await getClient().from('bookings').delete().eq('id', id);
        renderCustomerRequests();
    }
};

// NEW: PAYMENT SIMULATION
window.simulatePayment = async (id) => {
    if(confirm("Confirm payment of booking fees?")) {
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
// 8. PACKAGE DETAIL VIEW (UPDATED WITH NOTIFICATIONS & PRICE CALCULATION)
window.showPackageDetails = function(pEncoded) {
    const p = JSON.parse(decodeURIComponent(pEncoded));
    const modal = document.getElementById('detail-modal');
    const body = document.getElementById('detail-view-body');
    const historyList = p.updates_history || [];
    
    const historyHtml = (historyList.length > 0) ? `
        <div style="margin-top:20px; border-top: 1px dashed #ddd; padding-top:15px;">
            <details>
                <summary style="cursor:pointer; color:#ff9f43; font-size:13px; font-weight:bold;">View Previous Package Updates (${historyList.length})</summary>
                <div style="margin-top:10px; font-size:12px; color:#636e72; background:#f9f9f9; padding:10px; border-radius:8px;">
                    ${historyList.map((h, i) => `
                        <div style="padding:8px 0; border-bottom:1px solid #eee; margin-bottom:5px;">
                            <div style="display:flex; justify-content:space-between;">
                                 <b>Update #${i+1}</b>
                                 <span style="font-size:10px; color:#999;">${new Date(h.updated_at).toLocaleDateString()}</span>
                            </div>
                            <div style="margin-top:4px;"><b>Title:</b> ${h.title}</div>
                        </div>
                    `).reverse().join('')}
                </div>
            </details>
        </div>
    ` : '';

    body.innerHTML = `
        <div style="text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <h2 style="margin:0; color:#2d3436;">${p.title}</h2>
              <button onclick="document.getElementById('detail-modal').style.display='none'" style="background:none; font-size:24px; color:#999; padding:0;">✕</button>
          </div>
            <p style="color:#ff9f43; font-weight:bold; font-size:1.1rem; margin:10px 0;">Routes: ${p.starting_location} ➔ ${Array.isArray(p.destination) ? p.destination.join(' ➔ ') : p.destination}</p>
            <div style="margin:20px 0; padding:15px; background:#f9f9f9; border-radius:12px; font-size:14px;">
                <h4 style="margin-top:0;">Itinerary / Description</h4>
                <p style="white-space: pre-line; color:#636e72; line-height:1.6;">${p.description || 'No description provided.'}</p>
            </div>
            
            <h4>Select Vehicles to Book</h4>
            <div style="display:grid; gap:12px;">
              ${(p.vehicles || []).map(v => `
                  <div style="padding:15px; border:1px solid #eee; border-radius:12px; background:white; transition: 0.3s;">
                      <div style="display:flex; justify-content:space-between; align-items:center;">
                          <div style="display:flex; align-items:center; gap:10px;">
                               <input type="checkbox" class="book-v-check" 
                                      data-id="${v.id}" 
                                      data-rate="${v.rate}" 
                                      onchange="toggleQtyInput('${v.id}')" 
                                      style="width:20px; height:20px; cursor:pointer;">
                              <span><b>${v.name}</b> <br> <small style="color:#666;">Available Units: ${v.max_cars || 1}</small></span>
                          </div>
                          <span style="color:#2ecc71; font-weight:bold;">₹${v.rate}</span>
                      </div>
                      
                      <div id="qty-container-${v.id}" style="display:none; margin-top:15px; padding-top:15px; border-top:1px solid #f0f0f0;">
                          <label style="font-size:12px; color:#636e72; display:block; margin-bottom:5px;">How many ${v.name} do you want? (Max: ${v.max_cars || 1})</label>
                          <input type="number" class="book-v-qty" data-id="${v.id}" value="1" min="1" max="${v.max_cars || 1}" 
                                 style="width:80px; padding:8px; border:2px solid #ff9f43; margin:0;"
                                 oninput="updateLivePrice()">
                      </div>
                  </div>
              `).join('')}
           </div>

            <div style="margin-top:25px; background:#2d3436; color:white; padding:15px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold;">ESTIMATED TOTAL:</span>
                <span id="live-total-display" style="font-size:20px; font-weight:bold; color:#ff9f43;">₹0</span>
            </div>

            <div style="margin-top:25px; border-top: 2px solid #eee; padding-top:20px;">
                <h4 style="margin-top:0; color:#2d3436;">Pickup & Contact Details</h4>
               <div style="display:grid; gap:15px;">
                   <div>
                       <label style="font-size:12px; color:#636e72; font-weight:bold; display:block; margin-bottom:5px;">🏠 HOME ADDRESS FOR PICKUP</label>
                       <textarea id="cust-address" placeholder="Enter your full street address..." style="width:100%; height:70px; padding:10px; border:1px solid #ddd; border-radius:8px;"></textarea>
                   </div>
                   <div>
                       <label style="font-size:12px; color:#636e72; font-weight:bold; display:block; margin-bottom:5px;">📞 PHONE NUMBER</label>
                       <input type="text" id="cust-phone" placeholder="Your mobile number" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                    </div>
               </div>
           </div>

          ${historyHtml}
           <div style="margin-top:30px; display:flex; gap:10px;">
              <button onclick="handleBookingInquiry(${p.id}, '${p.title.replace(/'/g, "\\'")}', '${p.agency_id}')" style="flex:2; background:#ff9f43; color:white; padding:15px; font-weight:bold; cursor:pointer; border-radius:8px;">SEND BOOKING REQUEST</button>
              <button onclick="document.getElementById('detail-modal').style.display='none'" style="flex:1; background:#eee; padding:15px; border-radius:8px; cursor:pointer;">BACK</button>
          </div>
        </div>
    `;
    modal.style.display = 'flex';
};

// LIVE PRICE CALCULATION LOGIC
window.updateLivePrice = () => {
    let total = 0;
    document.querySelectorAll('.book-v-check:checked').forEach(checkbox => {
        const id = checkbox.dataset.id;
        const rate = parseFloat(checkbox.dataset.rate) || 0;
        const qty = parseInt(document.querySelector(`.book-v-qty[data-id="${id}"]`).value) || 1;
        total += (rate * qty);
    });
    document.getElementById('live-total-display').innerText = `₹${total}`;
};

window.toggleQtyInput = (id) => {
    const container = document.getElementById(`qty-container-${id}`);
    const checkbox = document.querySelector(`.book-v-check[data-id="${id}"]`);
    container.style.display = checkbox.checked ? 'block' : 'none';
    updateLivePrice(); 
};

// DATABASE SAVE LOGIC (WITH NOTIFICATIONS)
window.handleBookingInquiry = async function(packageId, packageTitle, agencyId) {
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    const address = document.getElementById('cust-address').value;
    const phone = document.getElementById('cust-phone').value;

    if (!address.trim() || !phone.trim()) {
       alert("Please provide details!"); return;
    }

    let totalPrice = 0;
    const selectedVehicles = Array.from(document.querySelectorAll('.book-v-check:checked')).map(el => {
        const id = el.dataset.id;
        const rate = parseFloat(el.dataset.rate) || 0;
        const qty = parseInt(document.querySelector(`.book-v-qty[data-id="${id}"]`).value) || 1;
        totalPrice += (rate * qty);
        return `${qty}x vehicle_id:${id}`;
    });

    if (selectedVehicles.length === 0) { alert("Select a vehicle."); return; }

    // 1. INSERT BOOKING
    const { error } = await client.from('bookings').insert([{
        package_id: packageId, 
        package_title: packageTitle,
        customer_id: user.id, 
        customer_email: user.email,
        customer_address: address, 
        customer_phone: phone,
        selected_vehicles: selectedVehicles.join(', '),
        total_price: totalPrice, 
        status: 'pending'
    }]);

    if (!error) {
        // 2. SEND NOTIFICATIONS
        
        // Notify Customer (In-App)
        alert(`🔔 Notification: Your booking request for "${packageTitle}" has been sent successfully! Total: ₹${totalPrice}`);

        // Notify Agency (Preparing for real-time fetch)
        // Note: Agencies see this automatically when they refresh or if you have a real-time listener active.
        console.log(`Notification sent to Agency ID: ${agencyId} for new request.`);

        document.getElementById('detail-modal').style.display = 'none';
        if (typeof renderCustomerRequests === 'function') renderCustomerRequests();
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
            <div style="width:260px; background:#2d3436; color:white; padding:25px; position:relative;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;">
                    <h2 style="color:#ff9f43; margin:0;">TourSetu</h2>
                    <div id="notif-bell" onclick="showTab('bookings')" style="position:relative; cursor:pointer; font-size:20px;">
                        🔔
                        <span id="bell-badge" style="display:none; position:absolute; top:-5px; right:-5px; background:#ff7675; color:white; font-size:10px; padding:2px 6px; border-radius:50%; font-weight:bold;">0</span>
                    </div>
                </div>
                <nav>
                    <div onclick="showTab('earnings')" class="nav-item">📊 Dashboard</div>
                    <div onclick="showTab('bookings')" class="nav-item" style="display:flex; justify-content:space-between; align-items:center;">
                        <span>📅 Bookings</span>
                        <span id="side-notif-count" style="background:#ff9f43; color:white; padding:2px 8px; border-radius:10px; font-size:10px; display:none;">0</span>
                    </div>
                    <div onclick="showTab('packages')" class="nav-item">🎒 My Packages</div>
                    <div onclick="showTab('profile')" class="nav-item">👤 Agency Profile</div>
                    <div onclick="confirmLogout()" style="padding:15px; cursor:pointer; color:#ff7675; margin-top:50px; font-weight:bold; border-top:1px solid #444;">🚪 Logout</div>
                </nav>
            </div>
            <div id="main-content" style="flex:1; padding:40px; overflow-y:auto;"></div>
        </div>
        <div id="logout-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:1000; justify-content:center; align-items:center;">
            <div style="background:white; padding:30px; border-radius:12px; text-align:center; max-width:350px;">
                <h2>Logout?</h2>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button onclick="executeLogout()" style="background:#ff7675; color:white; width:100px; padding:10px;">Yes</button>
                    <button onclick="document.getElementById('logout-modal').style.display='none'" style="background:#eee; width:100px; padding:10px;">No</button>
                </div>
            </div>
        </div>
    `;
    showTab('earnings'); 
}

window.confirmLogout = () => document.getElementById('logout-modal').style.display = 'flex';
window.executeLogout = async () => { await getClient().auth.signOut(); isLoginMode = true; renderAuthUI(); };

window.showTab = async function(tabName) {
    const container = document.getElementById('main-content');
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();

    // Notification Logic: Check for pending bookings to light up the bell
    const { count: pCountNotif } = await client.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const badge = document.getElementById('bell-badge');
    const sideCount = document.getElementById('side-notif-count');
    
    if (pCountNotif > 0) {
        badge.innerText = pCountNotif;
        badge.style.display = 'block';
        sideCount.innerText = pCountNotif;
        sideCount.style.display = 'block';
        document.getElementById('notif-bell').style.color = '#ff7675';
    } else {
        badge.style.display = 'none';
        sideCount.style.display = 'none';
        document.getElementById('notif-bell').style.color = 'white';
    }

    if (tabName === 'earnings') {
        container.innerHTML = `<h1>Overview</h1>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px;">
                <div class="card" style="border-top:5px solid #2ecc71; background:white; padding:25px;"><small>REVENUE</small><h2>₹0</h2></div>
                <div class="card" style="border-top:5px solid #ff9f43; background:white; padding:25px;"><small>PENDING BOOKINGS</small><h2 id="pending-count">...</h2></div>
                <div class="card" style="border-top:5px solid #3498db; background:white; padding:25px;"><small>ACTIVE PACKAGES</small><h2 id="act-pkg-count">...</h2></div>
            </div>`;
        const { count } = await client.from('packages').select('*', { count: 'exact', head: true }).eq('agency_id', user.id);
        document.getElementById('act-pkg-count').innerText = count || 0;
        
        const { count: pCount } = await client.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        document.getElementById('pending-count').innerText = pCount || 0;
    } 
    else if (tabName === 'bookings') {
        container.innerHTML = `<h1>Customer Bookings</h1><div id="booking-list-area">Loading requests...</div>`;
        
        const { data, error } = await client
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        const listArea = document.getElementById('booking-list-area');
        
        if (!data || data.length === 0) {
            listArea.innerHTML = `<p>No booking requests yet.</p>`;
            return;
        }

        listArea.innerHTML = data.map(b => `
            <div class="card" style="background:white; padding:25px; margin-bottom:20px; border-left:5px solid ${b.status === 'pending' ? '#ff9f43' : '#2ecc71'};">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div>
                        <h3 style="margin:0; color:#2d3436;">${b.package_title}</h3>
                        <p style="font-size:12px; color:#636e72;">Requested on: ${new Date(b.created_at).toLocaleDateString()}</p>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:22px; font-weight:bold; color:#2ecc71;">₹${b.total_price || 0}</div>
                        <span style="padding:5px 12px; border-radius:20px; font-size:11px; font-weight:bold; background:${b.status === 'pending' ? '#fff3e0' : '#e8f5e9'}; color:${b.status === 'pending' ? '#e67e22' : '#2ecc71'};">
                            ${b.status.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div style="margin-top:20px; padding:15px; background:#f4f7f6; border-radius:10px; display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                    <div>
                        <label style="font-size:11px; color:#999; font-weight:bold;">📍 PICKUP ADDRESS</label>
                        <p style="margin:5px 0; font-size:14px; color:#2d3436; line-height:1.4;">${b.customer_address || 'Not Provided'}</p>
                    </div>
                    <div>
                        <label style="font-size:11px; color:#999; font-weight:bold;">📞 CUSTOMER PHONE</label>
                        <p style="margin:5px 0; font-size:16px; font-weight:bold; color:#ff9f43;">
                            <a href="tel:${b.customer_phone}" style="text-decoration:none; color:inherit;">${b.customer_phone || 'N/A'}</a>
                        </p>
                    </div>
                </div>

                <div style="margin-top:15px; display:flex; justify-content:space-between; align-items:center; border-top: 1px dashed #ddd; padding-top:10px;">
                    <p style="font-size:13px; margin:0;"><b>Selected Vehicles:</b> ${b.selected_vehicles}</p>
                    <div style="font-size:12px; color:#666; font-weight:bold;">Total Units: ${b.selected_vehicles.split(',').length} Item(s)</div>
                </div>

                ${b.status === 'pending' ? `
                    <div style="margin-top:20px; border-top:1px solid #eee; padding-top:15px;">
                        <button onclick="approveWithContact(${b.id})" style="background:#2ecc71; color:white; padding:10px 20px; width:auto;">Approve & Send My Details</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
    else if (tabName === 'packages') {
        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h1>My Packages</h1>
                <button onclick="showPackageForm()" style="width:auto; padding:12px 25px; background:#2ecc71; color:white;">+ CREATE NEW PACKAGE</button>
            </div>
            <div id="package-form-area"></div>
            <div id="pkg-list-container" style="margin-top:25px;"></div>`;
        loadPackageList(user.id);
    }
    else if (tabName === 'profile') {
        const meta = user.user_metadata || {};
        container.innerHTML = `
            <h1>Agency Profile</h1>
            <div class="card" style="background:white; padding:30px; max-width:600px; border-left:5px solid #ff9f43;">
                <div style="margin-bottom:20px;">
                    <label style="color:#666; font-size:12px;">EMAIL ADDRESS</label>
                    <div style="font-size:18px; font-weight:bold;">${user.email}</div>
                </div>
                <div style="margin-bottom:20px;">
                    <label style="color:#666; font-size:12px;">CONTACT / MOBILE NUMBER</label>
                    <div style="font-size:18px; font-weight:bold; color:#ff9f43;">${meta.phone || 'Not Provided'}</div>
                </div>
                <div style="margin-bottom:20px; display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                    <div>
                        <label style="color:#666; font-size:12px;">GST NUMBER</label>
                        <div style="font-weight:bold;">${meta.gst || 'N/A'}</div>
                    </div>
                    <div>
                        <label style="color:#666; font-size:12px;">REGISTRATION NO</label>
                        <div style="font-weight:bold;">${meta.reg_no || 'N/A'}</div>
                    </div>
                </div>
                <p style="font-size:12px; color:#999; border-top:1px solid #eee; padding-top:15px; margin-top:10px;">
                    Business Status: ${meta.is_approved ? '✅ Verified' : '⏳ Verification Pending'}
                </p>
            </div>
        `;
    }
};

window.approveWithContact = async (bookingId) => {
    const contactNum = prompt("Enter the contact number you want the traveler to see (e.g., Driver or Manager number):");
    if (contactNum) {
        const { error } = await getClient()
            .from('bookings')
            .update({ 
                status: 'approved', 
                agency_contact: contactNum 
            })
            .eq('id', bookingId);
            
        if (!error) {
            alert("Booking Approved! Traveler can now proceed.");
            showTab('bookings');
        }
    }
};

// 10. PACKAGE FORM
window.showPackageForm = function(pEncoded = null) {
    const pkg = pEncoded ? JSON.parse(decodeURIComponent(pEncoded)) : null;
    const isEdit = !!pkg;
    const area = document.getElementById('package-form-area');
    const pkgDestinations = isEdit ? (pkg.destination || []) : [];
    const pkgVehicles = isEdit ? (pkg.vehicles || []) : [];
    
    let selectedState = "";
    if (isEdit) {
        for (let state in locationData) {
            if (locationData[state].includes(pkg.starting_location)) {
                selectedState = state;
                break;
            }
        }
    }

    area.innerHTML = `
        <div class="card" style="background:white; padding:30px; margin-top:20px; border:1px solid #ff9f43;">
            <h3 style="color:#ff9f43; margin-top:0;">${isEdit ? '✏️ Edit Package' : '🎒 Create New Tour Package'}</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
               <input type="text" id="p-title" placeholder="Package Name" value="${isEdit ? pkg.title : ''}">
               <select id="p-state" onchange="updateCities()">
                  <option value="">Select Base State</option>
                   ${Object.keys(locationData).map(s => `<option value="${s}" ${selectedState === s ? 'selected' : ''}>${s}</option>`).join('')}
               </select>
           </div>
            <select id="p-city">
                ${isEdit && selectedState ? locationData[selectedState].map(c => `<option value="${c}" ${pkg.starting_location === c ? 'selected' : ''}>${c}</option>`).join('') : '<option>Select City</option>'}
            </select>
            
            <label style="font-weight:bold; display:block; margin-top:15px;">Select Destinations Covered:</label>
            <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin:10px 0; max-height:150px; overflow-y:auto; border:1px solid #eee;">
               ${tourDestinations.map(d => `
                   <label style="display:inline-block; margin:5px; padding:5px 10px; background:white; border-radius:5px; border:1px solid #ddd; font-size:13px;">
                       <input type="checkbox" class="d-check" value="${d}" ${pkgDestinations.includes(d) ? 'checked' : ''}> ${d}
                   </label>`).join('')}
            </div>

            <label style="font-weight:bold; display:block; margin-top:20px;">Vehicle Fleet (Tick and provide price):</label>
            <div style="display:grid; grid-template-columns: 1fr; gap:10px; margin-top:10px;">
               ${vehicleTypes.map(v => {
                   const existing = pkgVehicles.find(ev => ev.id === v.id);
                   return `
                   <div style="display:flex; align-items:center; gap:10px; background:#fff8f0; padding:10px; border-radius:10px;">
                       <input type="checkbox" class="v-enable" data-id="${v.id}" ${existing ? 'checked' : ''} style="width:20px; height:20px; margin:0;">
                       <span style="font-size:20px; width:30px;">${v.icon}</span>
                       <b style="flex:1;">${v.name}</b>
                       <input type="number" class="v-rate" data-id="${v.id}" data-name="${v.name}" placeholder="Rate (₹)" style="width:100px; margin:0;" value="${existing ? existing.rate : ''}">
                       <input type="number" class="v-max" data-id="${v.id}" placeholder="Units" style="width:100px; margin:0;" value="${existing ? existing.max_cars : '1'}">
                   </div>`;
               }).join('')}
            </div>

           <textarea id="p-desc" style="height:100px; margin-top:20px;" placeholder="Describe itinerary...">${isEdit ? pkg.description : ''}</textarea>
            <div style="display:flex; gap:10px; margin-top:20px;">
               <button id="save-btn" onclick="${isEdit ? `handleSave(${pkg.id})` : 'handleSave()'}" style="background:#2ecc71; color:white; width:100%; height:50px;">
                   ${isEdit ? 'SAVE CHANGES' : 'PUBLISH PACKAGE'}
               </button>
               <button onclick="document.getElementById('package-form-area').innerHTML=''" style="background:#eee; width:auto; padding:0 20px;">Cancel</button>
           </div>
        </div>`;
};

window.updateCities = () => {
    const state = document.getElementById('p-state').value;
    const citySelect = document.getElementById('p-city');
   citySelect.innerHTML = locationData[state] ? locationData[state].map(c => `<option value="${c}">${c}</option>`).join('') : '<option>Select City</option>';
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
