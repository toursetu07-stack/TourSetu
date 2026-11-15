/* Render destination checkboxes independently of Supabase/auth setup. This must run first. */
(function renderDriverDestinationFallback(){
  'use strict';
  const destinations = [
    'Char Dham Yatra (Uttarakhand)','Kedarnath','Kedarnath Temple','Badrinath','Badrinath Temple',
    'Gangotri','Gangotri Temple','Yamunotri','Yamunotri Temple','Tungnath Temple','Rudranath Temple',
    'Madhyamaheshwar Temple','Kalpeshwar Temple','Yogadhyan Badri','Bhavishya Badri','Vridha Badri',
    'Adi Badri','Devprayag (Panch Prayag)','Rudraprayag (Panch Prayag)','Karnaprayag (Panch Prayag)',
    'Nandprayag (Panch Prayag)','Vishnuprayag (Panch Prayag)','Neem Karoli Baba Kainchi Dham',
    'Jageshwar Dham','Kasar Devi Temple','Chitai Golu Devta Temple','Naina Devi Temple (Nainital)',
    'Purnagiri Temple','Surkanda Devi Temple','Chandrabadni Temple','Dhari Devi Temple',
    'Kartik Swami Temple','Triyuginarayan Temple','Kalimath Temple','Har Ki Pauri',
    'Har Ki Pauri (Haridwar)','Mansa Devi Temple (Haridwar)','Chandi Devi Temple (Haridwar)',
    'Neelkanth Mahadev Temple (Rishikesh)','Haidakhan Babaji Temple','Mahasu Devta Temple',
    'Baijnath Temple','Bagnath Temple (Bageshwar)','Bhairav Temple (Almora)','Katarmal Sun Temple',
    'Binsar Mahadev Temple','Golu Devta Temple (Ghorakhal)','Garjiya Devi Temple',
    'Anusuya Devi Temple','Raghunath Temple (Devprayag)','Lakhamandal Temple',
    'Tapkeshwar Mahadev Temple','Prakasheshwar Mahadev Temple','Santala Devi Temple',
    'Kunjapuri Devi Temple','Baleshwar Temple (Champawat)','Nagnath Temple (Pithoragarh)',
    'Kapileshwar Mahadev Temple','Patal Bhuvaneshwar Cave Temple','Haat Kalika Temple (Gangolihat)',
    'Thal Kedar Temple','Maya Devi Temple (Haridwar)','Daksha Mahadev Temple (Kankhal)',
    'Bharat Mandir (Rishikesh)','Raghunath Temple (Joshimath)','Narsingh Temple (Joshimath)'
  ];
  const cities = ['Almora','Ranikhet','Bageshwar','Champawat','Gopeshwar','Joshimath','Dehradun',
    'Rishikesh','Haridwar','Haldwani','Nainital','Pauri','Srinagar','Pithoragarh','Rudraprayag',
    'Guptkashi','Ukhimath','Uttarkashi','Barkot','Gangotri','Yamunotri','Kedarnath','Badrinath'];
  function render(){
    const list=document.getElementById('vehicle-tour-destination-list');
    if(!list)return;
    const shared=window.TOURSETU_UK_TEMPLES;
    const options=Array.isArray(shared)&&shared.length?shared:destinations;
    list.replaceChildren();
    options.forEach(value=>{
      const name=String(value);
      const label=document.createElement('label');
      label.className='destination-option';
      const input=document.createElement('input');
      input.type='radio';
      input.name='vehicle-tour-destination';
      input.value=name;
      const span=document.createElement('span');
      span.textContent=name;
      label.append(input,span);
      list.append(label);
    });
    const city=document.getElementById('vehicle-starting-location');
    if(city && city.options.length<=1){
      const cityOptions=Array.isArray(window.TOURSETU_UK_CITIES)&&window.TOURSETU_UK_CITIES.length
        ?window.TOURSETU_UK_CITIES:cities;
      cityOptions.forEach(value=>city.add(new Option(String(value),String(value))));
    }
    list.dataset.renderedCount=String(options.length);
    list.setAttribute('aria-live','polite');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});
  else render();
})();
(() => {
'use strict';
const cfg=window.__TOURSETU_SUPABASE_CONFIG__||{};
const url=cfg.url||'',key=cfg.publishableKey||'';
const $=id=>document.getElementById(id);
const msg=(id,s)=>{$(id).textContent=s||''};
if(!window.supabase||!url||!key){msg('auth-message','TourSetu secure connection is not configured. Please contact support.');return;}
const db=window.supabase.createClient(url,key);
let mode='register';
let editingVehicleId=null;
let currentDriverProfile=null;
let driverRealtimeChannel=null;
const DRIVER_CITY_FALLBACK=['Almora','Ranikhet','Bageshwar','Champawat','Gopeshwar','Joshimath','Dehradun','Rishikesh','Haridwar','Haldwani','Nainital','Pauri','Srinagar','Pithoragarh','Rudraprayag','Guptkashi','Ukhimath','Uttarkashi','Barkot','Gangotri','Yamunotri','Kedarnath','Badrinath'];
const DRIVER_TEMPLE_FALLBACK=[
'Char Dham Yatra (Uttarakhand)','Kedarnath Temple','Badrinath Temple','Gangotri Temple','Yamunotri Temple',
'Tungnath Temple','Rudranath Temple','Madhyamaheshwar Temple','Kalpeshwar Temple','Yogadhyan Badri',
'Bhavishya Badri','Vridha Badri','Adi Badri','Devprayag (Panch Prayag)','Rudraprayag (Panch Prayag)',
'Karnaprayag (Panch Prayag)','Nandprayag (Panch Prayag)','Vishnuprayag (Panch Prayag)',
'Neem Karoli Baba Kainchi Dham','Jageshwar Dham','Kasar Devi Temple','Chitai Golu Devta Temple',
'Naina Devi Temple (Nainital)','Purnagiri Temple','Surkanda Devi Temple','Chandrabadni Temple',
'Dhari Devi Temple','Kartik Swami Temple','Triyuginarayan Temple','Kalimath Temple','Har Ki Pauri (Haridwar)',
'Mansa Devi Temple (Haridwar)','Chandi Devi Temple (Haridwar)','Neelkanth Mahadev Temple (Rishikesh)',
'Haidakhan Babaji Temple','Mahasu Devta Temple','Baijnath Temple','Bagnath Temple (Bageshwar)',
'Bhairav Temple (Almora)','Katarmal Sun Temple','Binsar Mahadev Temple','Golu Devta Temple (Ghorakhal)',
'Garjiya Devi Temple','Anusuya Devi Temple','Raghunath Temple (Devprayag)','Lakhamandal Temple',
'Tapkeshwar Mahadev Temple','Prakasheshwar Mahadev Temple','Santala Devi Temple','Kunjapuri Devi Temple',
'Baleshwar Temple (Champawat)','Nagnath Temple (Pithoragarh)','Kapileshwar Mahadev Temple',
'Patal Bhuvaneshwar Cave Temple','Haat Kalika Temple (Gangolihat)','Thal Kedar Temple',
'Maya Devi Temple (Haridwar)','Daksha Mahadev Temple (Kankhal)','Bharat Mandir (Rishikesh)',
'Raghunath Temple (Joshimath)','Narsingh Temple (Joshimath)'
];
const DRIVER_CITY_OPTIONS=Array.isArray(window.TOURSETU_UK_CITIES)&&window.TOURSETU_UK_CITIES.length?window.TOURSETU_UK_CITIES:DRIVER_CITY_FALLBACK;
const DRIVER_TEMPLE_OPTIONS=Array.isArray(window.TOURSETU_UK_TEMPLES)&&window.TOURSETU_UK_TEMPLES.length?window.TOURSETU_UK_TEMPLES:DRIVER_TEMPLE_FALLBACK;
function getSelectedVehicleDestinations(){const selected=document.querySelector('#vehicle-tour-destination-list input[name="vehicle-tour-destination"]:checked');return selected?[selected.value]:[];}
function populateVehicleLocationOptions(){
 const city=$('vehicle-starting-location'),dest=$('vehicle-tour-destination-list');
 if(city){city.replaceChildren(new Option('Select Uttarakhand city',''));DRIVER_CITY_OPTIONS.forEach(v=>city.add(new Option(v,v)));}
 if(!dest)return;
 dest.replaceChildren();
 DRIVER_TEMPLE_OPTIONS.forEach(v=>{
  const label=document.createElement('label');label.className='destination-option';
  const input=document.createElement('input');input.type='radio';input.name='vehicle-tour-destination';input.value=v;input.required=true;
  const text=document.createElement('span');text.textContent=v;
  label.append(input,text);dest.append(label);
 });
 if(!dest.children.length){
  const empty=document.createElement('p');empty.className='field-note';empty.textContent='Temple destinations could not be loaded. Please refresh this page or contact support.';dest.append(empty);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',populateVehicleLocationOptions,{once:true});
else populateVehicleLocationOptions();
const requiredDocs=['id-doc','pan-doc','lic-front','lic-back','police-doc','bank-doc'];
function errorText(e){
  if(!e)return 'Unknown error. Please try again.';
  const parts=[e.message,e.error_description,e.details,e.hint,e.code].filter(v=>typeof v==='string'&&v.trim());
  if(parts.length)return [...new Set(parts)].join(' — ');
  if(typeof e==='string')return e;
  try{const raw=JSON.stringify(e);if(raw&&raw!=='{}')return raw;}catch(_){}
  return 'The server returned an empty error response. Please check the Supabase configuration, database migration and storage permissions.';
}
function setMode(next){mode=next;$('register-fields').classList.toggle('driver-hidden',mode==='login');$('login-fields').classList.toggle('driver-hidden',mode!=='login');$('registration-legal-consent')?.classList.toggle('driver-hidden',mode==='login');$('auth-title').textContent=mode==='login'?'Driver login':'Driver registration';$('auth-submit').textContent=mode==='login'?'Login':'Create driver account';$('switch-auth').textContent=mode==='login'?'New driver? Register':'Already registered? Login';}
$('switch-auth').addEventListener('click',()=>setMode(mode==='login'?'register':'login'));
async function upload(file,uid,label){if(!file)return null;if(file.size>10*1024*1024)throw Error(label+' must be 10 MB or smaller.');if(!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(file.type))throw Error(label+' must be JPG, PNG, WEBP or PDF.');const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-80);const path=uid+'/'+label+'/'+crypto.randomUUID()+'-'+safe;const {error}=await db.storage.from('driver-verification-documents').upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;return path;}
async function uploadVehiclePhoto(file,uid){if(!file)return null;if(file.size>10*1024*1024)throw Error('Vehicle photo must be 10 MB or smaller.');if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Vehicle photo must be JPG, PNG or WEBP.');const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-80);const path=uid+'/'+crypto.randomUUID()+'-'+safe;const {error}=await db.storage.from('driver-vehicle-photos').upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;return path;}
async function saveDriver(user,docs){const payload={user_id:user.id,full_name:$('full-name').value.trim()||user.user_metadata?.full_name,phone:$('phone').value.trim()||user.user_metadata?.phone,email:user.email,status:'pending',...docs,updated_at:new Date().toISOString()};const {error}=await db.from('driver_profiles').upsert(payload,{onConflict:'user_id'});if(error)throw error;}
$('auth-submit').addEventListener('click',async()=>{const btn=$('auth-submit');btn.disabled=true;let stage='starting registration';try{msg('auth-message','Please wait…');if(mode==='register'){stage='validating registration details';const full_name=$('full-name').value.trim(),phone=$('phone').value.trim(),email=$('email').value.trim(),password=$('password').value;if(!full_name||!phone||!email||password.length<8)throw Error('Enter name, phone, email and a password of at least 8 characters.');if(!$('registration-legal-agree').checked)throw Error('Please read and accept the Driver Terms & Conditions and Privacy Policy.');for(const id of requiredDocs)if(!$ (id).files[0])throw Error('Please upload all required verification documents.');stage='creating your secure account';const {data,error}=await db.auth.signUp({email,password,options:{data:{role:'driver',full_name,phone},emailRedirectTo:'https://toursetu.in/signin'}});if(error)throw error;if(!data?.user)throw Error('Supabase did not return a user account. Please try again.');if(!data.session){msg('auth-message','Verification link aapke email par bhej diya gaya hai. Kripya email check karke account verify karein. Verify karke yahan login karein; phir secure document submission complete hogi.');setMode('login');return;}const uid=data.user.id;stage='uploading your verification documents';const docs={id_document_path:await upload($('id-doc').files[0],uid,'government-id'),pan_document_path:await upload($('pan-doc').files[0],uid,'pan'),licence_front_path:await upload($('lic-front').files[0],uid,'licence-front'),licence_back_path:await upload($('lic-back').files[0],uid,'licence-back'),police_verification_path:await upload($('police-doc').files[0],uid,'police-verification'),bank_proof_path:await upload($('bank-doc').files[0],uid,'bank-proof')};stage='saving your legal acceptance';if(data.session){const accepted=await window.TourSetuDriverLegal.record(data.user.id);if(accepted.error)throw accepted.error;}stage='saving your driver application';await saveDriver(data.user,docs);stage='opening your driver dashboard';await loadDashboard(data.user);}else{stage='logging in';const {data,error}=await db.auth.signInWithPassword({email:$('login-email').value.trim(),password:$('login-password').value});if(error){if(/email not confirmed|email.*confirm/i.test(String(error.message||'')))throw Error('Email verification pending. Please verify your email using the link sent by TourSetu, then log in again.');throw error;}await loadDashboard(data.user);}}catch(e){console.error('[TourSetu driver portal]',stage,e);msg('auth-message','Could not complete '+stage+': '+errorText(e));}finally{btn.disabled=false;}});
const kycMap=[['id_document_path','Government ID','id-doc'],['pan_document_path','PAN card','pan-doc'],['licence_front_path','Driving licence front','lic-front'],['licence_back_path','Driving licence back','lic-back'],['police_verification_path','Police verification','police-doc'],['bank_proof_path','Bank proof','bank-doc']];
async function ensureKyc(profile,user){const missing=kycMap.filter(([col])=>!profile[col]);$('kyc-completion').classList.toggle('driver-hidden',missing.length===0);$('kyc-fields').replaceChildren();missing.forEach(([col,label,id])=>{const wrap=document.createElement('label');wrap.textContent=label;const input=document.createElement('input');input.type='file';input.accept='.pdf,image/*';input.id='kyc-'+id;input.required=true;wrap.append(input);$('kyc-fields').append(wrap);});$('submit-kyc').addEventListener('click',async()=>{const b=$('submit-kyc');b.disabled=true;try{const patch={updated_at:new Date().toISOString()};for(const [col,label,id] of missing){const file=$('kyc-'+id).files[0];if(!file)throw Error('Please upload '+label+'.');patch[col]=await upload(file,user.id,id);}const {error}=await db.from('driver_profiles').update(patch).eq('user_id',user.id);if(error)throw error;alert('Documents submitted for verification.');await loadDashboard(user);}catch(e){alert(e.message||'Unable to upload documents.');}finally{b.disabled=false;}});}

function closeDriverDrawer(){const d=$('driver-slide-drawer'),b=$('driver-drawer-backdrop');if(!d||!b)return;d.classList.remove('is-open');b.classList.remove('is-open');d.setAttribute('aria-hidden','true');d.setAttribute('inert','');b.setAttribute('aria-hidden','true');document.body.classList.remove('driver-drawer-locked');$('driver-menu-open')?.setAttribute('aria-expanded','false');}
async function loadDriverReferralSummary(){const input=$('driver-referral-link'),stats=$('driver-referral-stats');if(!input||input.dataset.loaded==='1')return;try{const {data:code,error}=await db.rpc('get_or_create_referral_code');if(error)throw error;input.value=location.origin+location.pathname+'?ref='+encodeURIComponent(String(code));input.dataset.loaded='1';const {data,error:se}=await db.rpc('get_referral_dashboard_stats');if(se)throw se;const row=Array.isArray(data)?data[0]||{}:data||{};stats.textContent='Visits: '+Number(row.referral_visits||0)+' · Logins: '+Number(row.login_events||0)+' · Referred users: '+Number(row.referred_users||0)+' · Earnings: ₹'+Number(row.referral_earnings||0).toLocaleString('en-IN');}catch(e){input.value='Referral link unavailable until referral access is enabled.';stats.textContent='Referral analytics are not available for this account yet.';console.warn('[driver referral]',e);}}
function initDriverDrawer(){const t=$('driver-menu-open'),d=$('driver-slide-drawer'),b=$('driver-drawer-backdrop');if(!t||t.dataset.bound)return;t.dataset.bound='1';const open=()=>{d.removeAttribute('inert');d.setAttribute('aria-hidden','false');b.setAttribute('aria-hidden','false');d.classList.add('is-open');b.classList.add('is-open');document.body.classList.add('driver-drawer-locked');t.setAttribute('aria-expanded','true');$('driver-menu-close').focus();void loadDriverReferralSummary();};t.addEventListener('click',open);$('driver-menu-close').addEventListener('click',closeDriverDrawer);b.addEventListener('click',closeDriverDrawer);d.querySelectorAll('[data-driver-target]').forEach(x=>x.addEventListener('click',()=>{const target=$(x.dataset.driverTarget);closeDriverDrawer();target?.scrollIntoView({behavior:'smooth',block:'start'});}));d.querySelector('[data-driver-action="pricing"]').addEventListener('click',()=>{closeDriverDrawer();$('vehicle-card').scrollIntoView({behavior:'smooth',block:'start'});});$('driver-referral-copy').addEventListener('click',async()=>{const x=$('driver-referral-link');if(!x.value||x.value.startsWith('Referral link unavailable'))return;try{await navigator.clipboard.writeText(x.value);}catch(e){x.select();document.execCommand('copy');}$('driver-referral-stats').textContent='Referral link copied.';});$('driver-referral-share').addEventListener('click',async()=>{const url=$('driver-referral-link').value;if(!url||url.startsWith('Referral link unavailable'))return;if(navigator.share){try{await navigator.share({title:'Join TourSetu',text:'Join TourSetu using my referral link.',url});}catch(e){}}else{try{await navigator.clipboard.writeText(url);$('driver-referral-stats').textContent='Referral link copied.';}catch(e){}}});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&d.classList.contains('is-open')){closeDriverDrawer();t.focus();}});}

async function loadDashboard(user){const {data:profile,error}=await db.from('driver_profiles').select('*').eq('user_id',user.id).maybeSingle();if(error)throw error;if(!profile){msg('auth-message','No driver application was found for this account. Register as an independent driver first.');return;}if(!await window.TourSetuDriverLegal.ensure(user))return;currentDriverProfile=profile;initDriverDrawer();$('driver-drawer-name').textContent=profile.full_name||user.user_metadata?.full_name||'Driver';$('driver-drawer-meta').textContent=profile.email||user.email||'';$('driver-drawer-status').textContent=String(profile.status||'pending').toUpperCase();await ensureKyc(profile,user);
$('auth-card').classList.add('driver-hidden');$('dashboard').classList.remove('driver-hidden');$('vehicle-card').classList.remove('driver-hidden');$('approval-status').textContent='Application status: '+String(profile.status||'pending').toUpperCase()+(profile.denial_reason?' — '+profile.denial_reason:'')+' • Vehicle listings publish immediately; profile verification is handled separately.';$('driver-name').textContent=profile.full_name||user.user_metadata?.full_name||'Driver';$('driver-avatar').textContent=String(profile.full_name||'D').trim().charAt(0).toUpperCase();$('profile-status').textContent=String(profile.status||'pending').toUpperCase();$('profile-email').textContent=profile.email||user.email||'—';$('profile-phone').textContent=profile.phone||user.user_metadata?.phone||'—';$('verification-summary').textContent=profile.status==='approved'?'Your driver profile has been approved. Keep your documents and vehicle records up to date.':profile.status==='rejected'?'Your application needs attention. Review the rejection reason above and contact TourSetu support.' :'Your application is under review. Your saved vehicle listings can already be discovered by customers.';$('today-label').textContent=new Intl.DateTimeFormat('en-IN',{dateStyle:'full'}).format(new Date());await loadVehicles(user.id);await loadRequests(user.id);subscribeDriverRequests(user.id);}
async function loadVehicles(uid){
 const {data,error}=await db.from('driver_vehicles').select('id,driver_id,vehicle_type,make_model,registration_number,seating_capacity,price_per_km,fixed_package_price,vehicle_photo_path,status,created_at,driver_name,starting_location,tour_destination').eq('driver_id',uid).order('created_at',{ascending:false});
 if(error)throw error;
 $('stat-vehicles').textContent=String((data||[]).length);if($('driver-drawer-vehicle-count'))$('driver-drawer-vehicle-count').textContent=String((data||[]).length)+' total';
 $('vehicles').replaceChildren();
 if(!(data||[]).length){const empty=document.createElement('div');empty.className='empty';empty.textContent='No vehicles published yet. Add a vehicle to make it visible to customers.';$('vehicles').append(empty);}
 (data||[]).forEach(v=>{
   const d=document.createElement('div');d.className='driver-row';
   const info=document.createElement('div');info.style.flex='1';
   const title=document.createElement('strong');title.textContent=(v.vehicle_type||'Vehicle')+' · '+(v.make_model||'');
   const detail=document.createElement('div');detail.className='muted';const destinations=Array.isArray(v.tour_destination)?v.tour_destination:[v.tour_destination].filter(Boolean);
   detail.textContent=(v.registration_number||'')+' · '+v.seating_capacity+' seats · '+(Number(v.fixed_package_price||0)>0?'Package ₹'+Number(v.fixed_package_price).toLocaleString('en-IN'):'₹'+Number(v.price_per_km||0).toLocaleString('en-IN')+'/km')+' · From '+(v.starting_location||'—')+' · To '+(destinations.join(', ')||'—')+' · Live';
   info.append(title,detail);d.append(info);
   const actions=document.createElement('div');actions.className='driver-actions';
   const edit=document.createElement('button');edit.className='btn light';edit.type='button';edit.textContent='Edit';edit.addEventListener('click',()=>editVehicle(v));
   const del=document.createElement('button');del.className='btn light';del.type='button';del.textContent='Delete';del.addEventListener('click',()=>deleteVehicle(v.id));
   actions.append(edit,del);d.append(actions);$('vehicles').append(d);
 });
}
function editVehicle(v){
 editingVehicleId=v.id;
 $('vehicle-type').value=v.vehicle_type||'Hatchback';
 $('vehicle-model').value=v.make_model||'';
 $('vehicle-reg').value=v.registration_number||'';
 $('vehicle-seats').value=v.seating_capacity||'';
 $('vehicle-rate').value=v.price_per_km||'';
 $('vehicle-fixed-package-price').value=v.fixed_package_price||'';
 $('vehicle-starting-location').value=v.starting_location||'';
 const savedDestinations=Array.isArray(v.tour_destination)?v.tour_destination:[v.tour_destination].filter(Boolean);
 const savedDestination=String(savedDestinations.find(Boolean)||'');
 document.querySelectorAll('#vehicle-tour-destination-list input[name="vehicle-tour-destination"]').forEach(input=>{input.checked=input.value===savedDestination;});
 ['vehicle-rc','vehicle-permit','vehicle-insurance','vehicle-fitness','vehicle-puc','vehicle-photo'].forEach(id=>{$(id).value='';});
 $('vehicle-edit-note').textContent='Existing uploaded documents/photos will be kept unless you choose replacement files.';
 $('vehicle-edit-files').textContent='Saved vehicle documents remain attached. Upload a replacement only if you want to update a document.';
 const preview=$('vehicle-edit-photo');preview.classList.add('driver-hidden');if(v.vehicle_photo_path){const u=db.storage.from('driver-vehicle-photos').getPublicUrl(v.vehicle_photo_path).data?.publicUrl;if(u){preview.src=u;preview.classList.remove('driver-hidden');}}
 $('vehicle-form-title').textContent='Edit vehicle';
 $('save-vehicle').textContent='Save Vehicle Changes';
 $('vehicle-card').classList.remove('driver-hidden');
 $('vehicle-card').scrollIntoView({behavior:'smooth',block:'start'});
}
async function deleteVehicle(id){
 if(!confirm('Delete this vehicle listing? Customers will no longer see it.'))return;
 const {data:{user}}=await db.auth.getUser();
 const {error}=await db.from('driver_vehicles').delete().eq('id',id).eq('driver_id',user.id);
 if(error){alert(error.message);return;}
 await loadVehicles(user.id);
}

async function loadRequests(uid){
 const {data,error}=await db.from('driver_service_requests').select('id,vehicle_id,trip_details,status,created_at').eq('driver_id',uid).order('created_at',{ascending:false});
 if(error)throw error;const rows=data||[];
 const contactResults=await Promise.all(rows.map(async r=>{const {data:contactData,error:contactError}=await db.rpc('get_driver_service_request_contacts',{p_request_id:r.id});if(contactError){console.warn('Taxi contact status unavailable:',contactError);return [r.id,{is_shared:false}];}return [r.id,Array.isArray(contactData)?contactData[0]:(contactData||{is_shared:false})];}));
 const contactByRequest=new Map(contactResults);
 $('stat-total').textContent=String(rows.length);
 $('stat-pending').textContent=String(rows.filter(r=>r.status==='pending').length);
 $('stat-confirmed').textContent=String(rows.filter(r=>r.status==='approved').length);
 $('requests').replaceChildren();
 if(!rows.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='No customer taxi requests yet. New requests will appear here.';$('requests').append(empty);}
 rows.forEach(r=>{
   const t=r.trip_details||{};const d=document.createElement('div');d.className='driver-row';d.style.alignItems='flex-start';
   const info=document.createElement('div');info.style.flex='1';
   const heading=document.createElement('strong');heading.textContent='Taxi request · '+String(r.status||'pending').toUpperCase();
   const details=document.createElement('div');details.className='muted';
   const contact=contactByRequest.get(r.id)||{};
   details.textContent='Pickup: '+(t.pickup||'—')+' · Drop: '+(t.drop||'—')+' · Scheduled pickup: '+(t.travel_date||'—')+(t.pickup_time?' at '+t.pickup_time:'')+' · '+(Number(t.fixed_package_price||0)>0?'Total tour fare: ₹'+Number(t.fixed_package_price).toLocaleString('en-IN'):'Driver rate: ₹'+Number(t.price_per_km||0).toLocaleString('en-IN')+'/km (final total to be confirmed)')+' · Customer: '+(t.customer_name||'Customer')+' · '+(contact.is_shared&&contact.customer_phone?'Customer Contact: '+contact.customer_phone:'Contact: Not shared');
   info.append(heading,details);d.append(info);
   if(r.status==='pending'){const actions=document.createElement('div');actions.className='driver-actions';actions.style.cssText='display:grid;gap:8px;min-width:min(220px,100%);';
     const phoneLabel=document.createElement('label');phoneLabel.className='muted';phoneLabel.textContent='Your Contact Number (shared after approval)';phoneLabel.style.cssText='display:grid;gap:5px;font-size:12px;';
     const phoneInput=document.createElement('input');phoneInput.type='tel';phoneInput.inputMode='tel';phoneInput.maxLength=20;phoneInput.autocomplete='tel';phoneInput.placeholder='Enter driver contact number';phoneInput.value=String(currentDriverProfile?.phone||'');phoneInput.required=true;phoneInput.style.cssText='width:100%;box-sizing:border-box;min-height:42px;padding:9px 11px;border:1px solid #d8e1e8;border-radius:9px;font:inherit;';phoneLabel.append(phoneInput);actions.append(phoneLabel);
     const approve=document.createElement('button');approve.className='btn';approve.textContent='Approve';approve.addEventListener('click',()=>{if(!/^[+0-9()\s-]{7,20}$/.test(phoneInput.value.trim())||phoneInput.value.replace(/\D/g,'').length<7){alert('Enter a valid driver contact number before approving.');phoneInput.focus();return;}void decide(r.id,'approved',phoneInput.value.trim());});
     const deny=document.createElement('button');deny.className='btn light';deny.textContent='Deny';deny.addEventListener('click',()=>void decide(r.id,'denied',''));
     actions.append(approve,deny);d.append(actions);
   }
   $('requests').append(d);
 });
}
async function decide(id,status,driverPhone){
 const {error}=await db.rpc('respond_to_driver_service_request',{p_request_id:id,p_status:status,p_driver_phone:driverPhone||null});
 if(error){alert(error.message);return;}
 const {data}=await db.auth.getUser();await loadRequests(data.user.id);
}
function subscribeDriverRequests(uid){
 if(driverRealtimeChannel)db.removeChannel(driverRealtimeChannel);
 driverRealtimeChannel=db.channel('driver-requests-'+uid)
  .on('postgres_changes',{event:'*',schema:'public',table:'driver_service_requests',filter:'driver_id=eq.'+uid},()=>{void loadRequests(uid).catch(e=>console.error('Taxi request sync failed',e));})
  .subscribe();
}

$('save-vehicle').addEventListener('click',async()=>{
 const b=$('save-vehicle');b.disabled=true;
 try{
   const {data:{user}}=await db.auth.getUser();if(!user)throw Error('Please log in again.');if(!$('vehicle-legal-agree').checked)throw Error('Please accept the Driver Terms & Conditions and Privacy Policy before publishing this vehicle.');if(!await window.TourSetuDriverLegal.ensure(user))throw Error('Current driver legal acceptance is required.');
   const existing=editingVehicleId?await db.from('driver_vehicles').select('id,vehicle_photo_path').eq('id',editingVehicleId).eq('driver_id',user.id).single():{data:null,error:null};
   if(existing.error)throw existing.error;
   const old=existing.data||{};
   const rcFile=$('vehicle-rc').files[0],insuranceFile=$('vehicle-insurance').files[0];
   if(!editingVehicleId&&!rcFile)throw Error('RC document is required.');
   if(!editingVehicleId&&!insuranceFile)throw Error('Insurance document is required.');
   const docs={};
   if(rcFile)docs.rc_document_path=await upload(rcFile,user.id,'vehicle-rc');
   if(insuranceFile)docs.insurance_document_path=await upload(insuranceFile,user.id,'vehicle-insurance');
   if($('vehicle-permit').files[0])docs.permit_document_path=await upload($('vehicle-permit').files[0],user.id,'vehicle-permit');
   if($('vehicle-fitness').files[0])docs.fitness_document_path=await upload($('vehicle-fitness').files[0],user.id,'vehicle-fitness');
   if($('vehicle-puc').files[0])docs.puc_document_path=await upload($('vehicle-puc').files[0],user.id,'vehicle-puc');
   if($('vehicle-photo').files[0])docs.vehicle_photo_path=await uploadVehiclePhoto($('vehicle-photo').files[0],user.id);
   const payload={driver_id:user.id,driver_name:currentDriverProfile?.full_name||user.user_metadata?.full_name||'Independent Driver',vehicle_type:$('vehicle-type').value,make_model:$('vehicle-model').value.trim(),registration_number:$('vehicle-reg').value.trim(),seating_capacity:Number($('vehicle-seats').value),price_per_km:Number($('vehicle-rate').value||0),fixed_package_price:$('vehicle-fixed-package-price').value===''?null:Number($('vehicle-fixed-package-price').value),status:'active',starting_location:$('vehicle-starting-location').value,tour_destination:getSelectedVehicleDestinations(),...docs};
   if(!payload.make_model||!payload.registration_number||!payload.seating_capacity||(!Number.isFinite(payload.price_per_km)||payload.price_per_km<0)||(!payload.price_per_km&&!(payload.fixed_package_price>0))||!payload.starting_location||payload.tour_destination.length!==1)throw Error('Complete vehicle model, registration, seats, either a per-km rate or fixed package price, starting location and exactly one tour destination.');
   const result=editingVehicleId
    ?await db.from('driver_vehicles').update(payload).eq('id',editingVehicleId).eq('driver_id',user.id)
    :await db.from('driver_vehicles').insert(payload);
   if(result.error)throw result.error;
   alert(editingVehicleId?'Vehicle updated and published.':'Vehicle saved and published.');
   editingVehicleId=null;$('vehicle-form-title').textContent='Add a vehicle';$('save-vehicle').textContent='Save & Publish Vehicle';$('vehicle-edit-note').textContent='';$('vehicle-edit-files').textContent='';$('vehicle-edit-photo').classList.add('driver-hidden');$('vehicle-edit-photo').removeAttribute('src');
   $('vehicle-starting-location').value='';
   document.querySelectorAll('#vehicle-tour-destination-list input[name="vehicle-tour-destination"]').forEach(input=>{input.checked=false;});
   ['vehicle-model','vehicle-reg','vehicle-seats','vehicle-rate','vehicle-fixed-package-price','vehicle-rc','vehicle-permit','vehicle-insurance','vehicle-fitness','vehicle-puc','vehicle-photo'].forEach(id=>{$(id).value='';});
   await loadVehicles(user.id);
 }catch(e){alert(e.message||'Unable to save vehicle.');}
 finally{b.disabled=false;}
});

$('refresh-requests').addEventListener('click',async()=>{const {data}=await db.auth.getUser();if(data.user){try{await loadRequests(data.user.id);}catch(e){msg('auth-message','Could not refresh requests: '+errorText(e));}}});
$('logout').addEventListener('click',async()=>{await db.auth.signOut();location.reload();});
function showDriverLogin(message){
  $('dashboard').classList.add('driver-hidden');
  $('vehicle-card').classList.add('driver-hidden');
  $('auth-card').classList.remove('driver-hidden');
  setMode('login');
  if(message)msg('auth-message',message);
}
async function initializeDriverPortal(){
 try{
  // Restore the Supabase session before rendering. Never bounce between /driver
  // and /signin: keep unauthenticated visitors on this page and show driver login.
  const {data,error}=await db.auth.getSession();
  if(error)throw error;
  const user=data?.session?.user;
  if(!user){
   showDriverLogin('Please log in with your independent driver account.');
  }else{
   await loadDashboard(user);
  }
  // If the session expires or the user signs out elsewhere, return to the local
  // driver login form instead of navigating to the general sign-in route.
  db.auth.onAuthStateChange((event)=>{
   if(event==='SIGNED_OUT')showDriverLogin('You have been signed out. Please log in again.');
  });
 }catch(e){
  console.error('[TourSetu driver portal] session initialization failed',e);
  showDriverLogin('Unable to verify your sign-in session: '+errorText(e));
 }
}
void initializeDriverPortal();
})();
