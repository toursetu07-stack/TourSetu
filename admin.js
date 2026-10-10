(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const loginCard=$('#login-card'), deniedCard=$('#denied-card'), dashboard=$('#dashboard');
const statusEl=$('#page-status'), content=$('#content'), stats=$('#stats');
let db=null, currentUser=null, currentTab='approvals', cache={};
const escText=(v)=>v===null||v===undefined||v===''?'—':String(v);
function message(el,msg,error=false){el.textContent=msg||'';el.classList.toggle('error',!!error)}
function node(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
function show(which){loginCard.classList.toggle('hidden',which!=='login');deniedCard.classList.toggle('hidden',which!=='denied');dashboard.classList.toggle('hidden',which!=='dashboard');$('#signout').classList.toggle('hidden',which==='login');}
function client(){if(!window.supabase||!window.__TOURSETU_SUPABASE_CONFIG__?.url||!window.__TOURSETU_SUPABASE_CONFIG__?.publishableKey)throw new Error('Supabase configuration is unavailable. Check the /supabase-config deployment setting.');return window.supabase.createClient(window.__TOURSETU_SUPABASE_CONFIG__.url,window.__TOURSETU_SUPABASE_CONFIG__.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}
async function isAdmin(){const {data,error}=await db.rpc('is_toursetu_admin');if(error)throw error;return data===true}
async function audit(action,type,id,details={}){const {error}=await db.from('toursetu_admin_audit_log').insert({actor_user_id:currentUser.id,action,entity_type:type,entity_id:id==null?null:String(id),details});if(error)console.warn('Audit write failed',error.message)}
const definitions={
 approvals:{title:'Partner verification queue',desc:'Review submitted agency and hotel partner applications.',sources:[{table:'agency_verification_requests',label:'Agency requests',cols:['id','user_id','email','phone','status','denial_reason','created_at'],actions:true},{table:'hotel_verification_requests',label:'Hotel requests',cols:['id','user_id','email','phone','status','denial_reason','created_at'],actions:true}]},
 bookings:{title:'Bookings & payments',desc:'Agency and hotel booking records. Payment state is displayed from the database; no payment is marked paid by this dashboard.',sources:[{table:'bookings',label:'Tour bookings',cols:['id','package_title','customer_email','status','total_price','customer_paid_amount','created_at']},{table:'hotel_bookings',label:'Hotel bookings',cols:['id','hotel_name','customer_email','booking_status','payment_status','total_amount','created_at']}]},
 revenue:{title:'Revenue & commission',desc:'Financial fields stored on bookings; totals below are sums of the available records, not a substitute for gateway settlement reconciliation.',sources:[{table:'bookings',label:'Tour booking allocation',cols:['id','customer_paid_amount','gateway_fee_amount','gateway_fee_gst_amount','platform_commission_amount','referral_commission_amount','agency_payout_amount','platform_retained_amount','status']},{table:'hotel_bookings',label:'Hotel payment summary',cols:['id','hotel_name','subtotal_amount','gateway_fee','service_fee','total_amount','payment_status','booking_status']},{table:'referral_rewards',label:'Referral rewards',cols:['id','source_type','source_booking_id','payment_amount','platform_commission_amount','referral_reward_amount','status','created_at']}]},
 partners:{title:'Agency & hotel management',desc:'Partner approval state and public visibility controls.',sources:[{table:'profiles',label:'Partner accounts',cols:['id','email','role','company_name','phone','is_approved','approval_status','approved_at'],actions:true,partnerOnly:true},{table:'hotels',label:'Hotel listings',cols:['hotel_id','hotel_name','owner_id','city','status','hide_from_search','is_stop_sell','available_rooms','total_rooms']}]},
 customers:{title:'Customer management',desc:'Customer accounts and associated booking activity.',sources:[{table:'profiles',label:'Customer accounts',cols:['id','email','role','phone','updated_at'],customerOnly:true},{table:'bookings',label:'Customer tour bookings',cols:['id','customer_id','customer_email','package_title','status','total_price','created_at']},{table:'hotel_bookings',label:'Customer hotel bookings',cols:['id','customer_id','customer_email','hotel_name','booking_status','payment_status','total_amount','created_at']}]},
 disputes:{title:'Complaints, disputes & refunds',desc:'Review flagged/disputed/cancelled bookings. This dashboard does not initiate gateway refunds; process refunds only through the verified payment/refund workflow.',sources:[{table:'bookings',label:'Tour disputes and cancellations',cols:['id','customer_email','package_title','status','is_disputed','dispute_reason','refund_percentage','customer_paid_amount','created_at'],filter:r=>r.is_disputed===true||r.status==='disputed'||r.status==='cancelled'},{table:'hotel_bookings',label:'Hotel cancellations',cols:['id','hotel_name','customer_email','booking_status','payment_status','cancellation_reason','cancelled_by','cancelled_at','total_amount'],filter:r=>String(r.booking_status||'').toLowerCase().includes('cancel')}]}
};
function addCell(tr,value){const td=node('td',escText(value));tr.appendChild(td);return td}
function actionButton(label,cls,fn){const b=node('button',label,'action '+(cls||''));b.type='button';b.addEventListener('click',fn);return b}
async function updateRow(table,id,values,actionLabel){if(!confirm(actionLabel+'? Please confirm this administrative change.'))return;message(statusEl,'Saving change…');const key=table==='profiles'?'id':'id';const {error}=await db.from(table).update(values).eq(key,id);if(error){message(statusEl,'Update failed: '+error.message,true);return}await audit(actionLabel,table,id,values);await loadTab(currentTab)}
async function renderSource(src){
 const section=node('section');section.appendChild(node('div',src.label,'table-head'));
 const tableWrap=node('div',undefined,'table-scroll'),table=node('table'),thead=node('thead'),hr=node('tr');
 src.cols.forEach(c=>hr.appendChild(node('th',c.replaceAll('_',' '))));hr.appendChild(node('th','Admin actions'));thead.appendChild(hr);table.appendChild(thead);
 const tbody=node('tbody');table.appendChild(tbody);tableWrap.appendChild(table);section.appendChild(tableWrap);
 const {data,error}=await db.from(src.table).select(src.cols.join(',')).order(src.cols.includes('created_at')?'created_at':'id',{ascending:false}).limit(200);
 if(error){const p=node('p','Could not load '+src.label+': '+error.message,'empty');section.appendChild(p);return section}
 let rows=data||[];if(src.partnerOnly)rows=rows.filter(r=>r.role==='agency'||r.role==='hotel');if(src.customerOnly)rows=rows.filter(r=>r.role==='customer');if(src.filter)rows=rows.filter(src.filter);cache[src.table]=rows;
 if(!rows.length){section.appendChild(node('p','No records found.','empty'));return section}
 rows.forEach(r=>{const tr=node('tr');src.cols.forEach(c=>addCell(tr,r[c]));const td=node('td');
 if(src.table==='agency_verification_requests'||src.table==='hotel_verification_requests'){
   if(r.status==='pending'){td.append(actionButton('Approve','',()=>approveRequest(src.table,r,'approved'),r),actionButton('Reject','danger',()=>rejectRequest(src.table,r),r))}
 }else if(src.table==='profiles'&&(r.role==='agency'||r.role==='hotel')){
   td.append(actionButton(r.is_approved?'Deactivate':'Approve partner',r.is_approved?'danger':'',()=>togglePartner(r),r));
 }else if(src.table==='bookings'&&(r.is_disputed||r.status==='disputed'||r.status==='cancelled')){
   td.append(actionButton('Mark reviewed','',()=>updateRow('bookings',r.id,{is_disputed:false},'Mark dispute reviewed')));
 }
 tr.appendChild(td);tbody.appendChild(tr)});
 return section
}
async function approveRequest(table,r,next){const {error}=await db.from(table).update({status:next,reviewed_by:currentUser.id,reviewed_at:new Date().toISOString(),denial_reason:null}).eq('id',r.id);if(error){message(statusEl,'Approval failed: '+error.message,true);return}
 const role=table==='agency_verification_requests'?'agency':'hotel';
 const upd={is_approved:true,approval_status:'approved',approved_at:new Date().toISOString()};
 const p=await db.from('profiles').update(upd).eq('id',r.user_id).eq('role',role);
 if(p.error){message(statusEl,'Request updated, but profile status update failed: '+p.error.message,true);return}
 await audit('partner_approved',role,r.user_id,{request_id:r.id});await loadTab(currentTab)}
async function rejectRequest(table,r){const reason=prompt('Rejection reason (required, 5–500 characters):');if(reason===null)return;const clean=reason.trim();if(clean.length<5||clean.length>500){message(statusEl,'Enter a rejection reason between 5 and 500 characters.',true);return}
 const {error}=await db.from(table).update({status:'denied',denial_reason:clean,reviewed_by:currentUser.id,reviewed_at:new Date().toISOString()}).eq('id',r.id);if(error){message(statusEl,'Rejection failed: '+error.message,true);return}
 const role=table==='agency_verification_requests'?'agency':'hotel';await db.from('profiles').update({is_approved:false,approval_status:'denied'}).eq('id',r.user_id).eq('role',role);await audit('partner_rejected',role,r.user_id,{request_id:r.id,reason:clean});await loadTab(currentTab)}
async function togglePartner(r){const approve=!r.is_approved;if(!confirm((approve?'Approve':'Deactivate')+' this '+r.role+' account?'))return;const values={is_approved:approve,approval_status:approve?'approved':'denied'};const {error}=await db.from('profiles').update(values).eq('id',r.id).eq('role',r.role);if(error){message(statusEl,'Partner update failed: '+error.message,true);return}await audit(approve?'partner_approved':'partner_deactivated',r.role,r.id);await loadTab(currentTab)}
async function loadStats(){const tasks=[['profiles','id'],['bookings','id'],['agency_verification_requests','id'],['hotel_verification_requests','id']];const vals=await Promise.all(tasks.map(async ([t,c])=>{const {count,error}=await db.from(t).select(c,{count:'exact',head:true});return error?0:(count||0)}));stats.replaceChildren();[['Accounts',vals[0]],['Tour bookings',vals[1]],['Agency reviews',vals[2]],['Hotel reviews',vals[3]]].forEach(([label,val])=>{const card=node('div',undefined,'stat');card.append(node('span',label),node('strong',String(val)));stats.appendChild(card)})}
async function loadTab(tab){currentTab=tab;document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));content.replaceChildren();message(statusEl,'Loading records…');const def=definitions[tab];const head=node('div',undefined,'table-head');head.append(node('h2',def.title),node('p',def.desc));content.appendChild(head);
 for(const src of def.sources){try{content.appendChild(await renderSource(src))}catch(e){content.appendChild(node('p','Could not load '+src.label+': '+e.message,'empty'))}}
 message(statusEl,'Data refreshed. Showing up to 200 records per section.');}
async function enter(){try{currentUser=(await db.auth.getUser()).data.user;if(!currentUser){show('login');return}const ok=await isAdmin();if(!ok){show('denied');return}$('#session-label').textContent=currentUser.email||'Authorized administrator';show('dashboard');await loadStats();await loadTab(currentTab)}catch(e){show('login');message($('#login-status'),'Could not verify admin access: '+e.message,true)}}
$('#login-form').addEventListener('submit',async e=>{e.preventDefault();message($('#login-status'),'Signing in…');try{const {error}=await db.auth.signInWithPassword({email:$('#email').value.trim(),password:$('#password').value});if(error)throw error;await enter()}catch(err){message($('#login-status'),'Sign in failed: '+err.message,true)}});
async function signout(){if(db)await db.auth.signOut();currentUser=null;show('login');$('#session-label').textContent='Secure administration'}
$('#signout').addEventListener('click',signout);$('#denied-signout').addEventListener('click',signout);$('#refresh').addEventListener('click',async()=>{await loadStats();await loadTab(currentTab)});$('#tabs').addEventListener('click',e=>{const b=e.target.closest('button[data-tab]');if(b)loadTab(b.dataset.tab)});
try{db=client();db.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'){currentUser=null;show('login')} });enter()}catch(e){show('login');message($('#login-status'),e.message,true)}
})();