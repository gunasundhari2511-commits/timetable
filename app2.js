// ── SUBJECT AUTOCOMPLETE ─────────────────────────────────
var ALL_SUBJECTS = ["Abstract Algebra","Algebra & Calculus","American Literature","Analytical Geometry","Applied Physics-I","Applied Physics-II","Artificial Intelligence","Banking Theory","Business Accounting","Business Communication","Business Economics","Business Law","C Lab","C Programming","CLP","Classical Algebra","Commonwealth Lit","Communicative Skills","Company Law","Complex Analysis","Computer Application","Computer Network","Computer Practical","Corporate Accounting","Cost Accounting","DBMS","DBMS Lab","Differential Calculus","Differential Equations","Digital Electronics","Drama","Dynamics","EVS","English","English Language Teaching","English for BPO","English for Competitive Exam","Environmental Studies","Ethazhiyal","Fiction","Financial Management","Financial Services","Freedom Movement","Freedom Movement in India","Fundamentals of Algorithm","GST","Gender Studies","General Studies","Graph Theory","HRM","History of English Language","History of English Lit","History of English Lit-I","Ikkala Elakiyam","Ikkala Tamil Elakanam","Income Tax Law","India Arasiyalamaipu","Indian Constitution","Indian Lit in English","Information Technology","Integral Calculus","Introduction to Latex","Investment Management","Java","Java Lab","Kalvettiyal","Kappiyam","Language & Linguistics","Linear Algebra","Literary Criticism","Literary Forms","MATLAB Lab","Management Accounting","Management Concepts","Marketing","Mathematical Statistics","Mathipukalvi","Maths for Competitive Exams","Mobile App Development","Mozhipeyarpiyal","Mozhiyiyal","NME","Nambiyaga Porul","Nannul Sollathigaram","Nannul Yezhuthathigaram","Nattupura Elakkiyam","Neethi Elakkiyam","Number Theory","Numerical Analysis","Numerical Methods","Operating Systems","OR","Oppilikiyam","PHP","PHP Lab","Padaipilakiyam","Palina Samathuvam","Partnership Accounts","Physics","Physics Lab","Poetry-I","Poetry-II","Principles of Accountancy","Professional English","Professional English-I","Professional English-II","Prose","Python","Python Lab","Real Analysis","Samaya Elakkiyam","Sanga Elakkiyam","Sequence and Series","Shakespeare","Sitrilakiyam","Social History of England","Soft Skill","Soft Skill Development","Software Development","Statics","Statistics Practical","Sutrulaviyal","Sutrusuzhal Kalvi","Tamil","Tamil Elakkiya Varalaru","Tamil Elakkiya Varalaru-I","Tamil Elakkiya Varalaru-II","Tamilaga Kovilgal","Tamilaga Varalaru","Tamilum Ariviyalum","Thamizh Semmozhi Panbugal","Tools","Translation Theory","Value Education","Vector Calculus","Web Technology","World One-Act Plays","World Short Stories","Yappu-Thandi"];

function filterSubjects(){
  var val = document.getElementById('subSearchInput').value.trim().toLowerCase();
  var dd = document.getElementById('subDropdown');
  document.getElementById('searchOut').innerHTML='<div class="empty"><div class="ei">🔍</div><p>Subject select pannunga</p></div>';
  if(val.length < 1){ dd.style.display='none'; return; }
  var matches = ALL_SUBJECTS.filter(function(s){ 
    var sl = s.toLowerCase();
    // Match from start of subject name OR start of any word in subject
    return sl.startsWith(val) || sl.split(' ').some(function(w){ return w.startsWith(val); });
  });
  if(matches.length===0){ dd.style.display='none'; return; }
  dd.style.display='block';
  dd.innerHTML = matches.map(function(s){
    return '<div onclick="selectSubject(\''+s.replace(/'/g,"\\'")+'\') " style="padding:10px 16px;cursor:pointer;font-size:0.9rem;border-bottom:1px solid #f0f4ff;color:#1e3a6e;" onmouseover="this.style.background=\'#f0f4ff\'" onmouseout="this.style.background=\'white\'">'+s+'</div>';
  }).join('');
}

function selectSubject(name){
  document.getElementById('subSearchInput').value = name;
  document.getElementById('subDropdown').style.display='none';
  searchSubject();
}

// ── Build class timetable grid ───────────────────────────
function buildClassGrid(dkey, semIdx, shift){
  const periodHeaders = PERIODS.map(p=>{
    if(p.type==='break') return '<th class="break-hdr">'+p.label+'<br><span style="font-size:0.65rem;font-weight:400">'+p.time+'</span></th>';
    return '<th class="period-hdr">'+p.label+'<br><span style="font-size:0.65rem;font-weight:400">'+p.time+'</span></th>';
  }).join('');

  const rows = DAYS.map(day=>{
    const cells = PERIODS.map(p=>{
      if(p.type==='break') return '<td class="break-cell"><div class="break-txt">&#9749; '+p.label+'</div></td>';
      const key=dkey+'-'+semIdx+'-'+shift+'-'+day+'-'+p.label;
      const entry = MASTER[key];
      if(!entry) return '<td><div class="cell-empty">-</div></td>';
      const sName = (entry.fixedStaff||entry.staffName).replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s*/,'');
      return '<td style="background:#f0f4ff"><div class="cell">'
        +'<div class="cell-sub" style="color:#1e3a6e">'+entry.sub+'</div>'
        +'<div class="cell-staff" style="color:#4b6fa8;font-weight:600">'+sName+'</div>'
        +'</div></td>';
    }).join('');
    return '<tr><td class="day-label">'+day+'</td>'+cells+'</tr>';
  }).join('');

  return '<div class="tt-scroll"><table class="tg">'
    +'<thead><tr><th class="day-hdr">Day / Period</th>'+periodHeaders+'</tr></thead>'
    +'<tbody>'+rows+'</tbody>'
    +'</table></div>';
}

// ── STAFF TIMETABLE ──────────────────────────────────────
function populateStaffDrop(){
  const dept = document.getElementById('stDept').value;
  const sel  = document.getElementById('stName');
  if(!dept){sel.innerHTML='<option value="">Select Staff</option>';return;}
  const list = STAFF.filter(s=>s.dept===dept);
  sel.innerHTML = '<option value="">Select Staff ('+list.length+' available)</option>'
    +list.map(s=>'<option value="'+STAFF.indexOf(s)+'">'+s.name+' — '+(s.type==='permanent'?'Permanent':'Guest/PTA')+'</option>').join('');
}

function showStaffTT(){
  const idx = document.getElementById('stName').value;
  const el  = document.getElementById('staffOut');
  if(idx===''){el.innerHTML='<div class="empty"><div class="ei">⚠️</div><p>Staff name select pannunga!</p></div>';return;}
  const s    = STAFF[parseInt(idx)];
  const bg   = gBg(s.name);
  const init = gIn(s.name);

  const result = getStaffSchedule(s.name);
  const sch = result.sch;
  const shift = result.shift;

  let total=0;
  DAYS.forEach(d=>PERIOD_COLS.forEach(p=>{ if(sch[d][p.label])total++; }));

  el.innerHTML='<div class="tt-wrap">'
    +'<div style="display:flex;justify-content:flex-end;margin-bottom:8px">'
    +'<button onclick="printSection(\'printArea\')" style="background:#0f2044;color:white;border:none;padding:9px 20px;border-radius:8px;cursor:pointer;font-size:0.88rem;font-family:DM Sans,sans-serif;font-weight:600;">🖨️ Print / Save PDF</button>'
    +'</div>'
    +'<div id="printArea">'
    +'<div class="tt-top" style="background:linear-gradient(135deg,#0f2044,#1e3a6e)">'
    +'<div class="tt-av" style="background:'+bg+'">'+init+'</div>'
    +'<div class="tt-ti"><h2>'+s.name+'</h2><p>'+s.role+' | '+s.dept+'</p></div>'
    +'</div>'
    +'<div class="istrip">'
    +'<div class="ii"><span class="il">📞</span><span class="iv">'+s.phone+'</span></div>'
    +'<div class="ii"><span class="il">🏫 Dept:</span><span class="iv">'+s.dept+'</span></div>'
    +'<div class="ii"><span class="il">👤 Type:</span><span class="iv">'+(s.type==='permanent'?'Permanent':'Guest/PTA')+'</span></div>'
    +'<div class="ii"><span class="il">📋 Periods:</span><span class="iv">'+total+' assigned</span></div>'
    +'</div>'
    +buildStaffGrid(sch)
    +'</div>'+'</div>';
}

// ── CLASS TIMETABLE ──────────────────────────────────────
const YEAR_MAP={"I Year":[0,1],"II Year":[2,3],"III Year":[4,5]};

function populateYearDrop(){
  populateSemDrop();
}

function populateSemDrop(){
  const key  = document.getElementById('clDept').value;
  const year = document.getElementById('clYear').value;
  const sel  = document.getElementById('clSem');
  sel.innerHTML = '<option value="">Select Semester</option>';
  if(!key || !year) return;
  const idxs = YEAR_MAP[year];
  idxs.forEach(i=>{
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = SYL[key].semesters[i].sem;
    sel.appendChild(opt);
  });
}

function showClassTT(){
  const key   = document.getElementById('clDept').value;
  const year  = document.getElementById('clYear').value;
  const si    = document.getElementById('clSem').value;
  const shift = document.getElementById('clShift').value;
  const el    = document.getElementById('classOut');
  if(!key||!year||si===''||!shift){
    el.innerHTML='<div class="empty"><div class="ei">⚠️</div><p>Ellathayum select pannunga!</p></div>';return;
  }
  const syl  = SYL[key];
  const sem  = syl.semesters[parseInt(si)];
  const deptStaff = STAFF.filter(s=>DMAP[s.dept]===key);

  el.innerHTML='<div class="tt-wrap">'
    +'<div style="display:flex;justify-content:flex-end;margin-bottom:8px">'
    +'<button onclick="printSection(\'printArea2\')" style="background:#0f2044;color:white;border:none;padding:9px 20px;border-radius:8px;cursor:pointer;font-size:0.88rem;font-family:DM Sans,sans-serif;font-weight:600;">🖨️ Print / Save PDF</button>'
    +'</div>'
    +'<div id="printArea2">'
    +'<div class="tt-top" style="background:linear-gradient(135deg,#0f2044,#1e3a6e)">'
    +'<div class="tt-av" style="background:rgba(255,255,255,0.2);font-size:20px">'+syl.short[0]+'</div>'
    +'<div class="tt-ti">'
    +'<h2>'+syl.name+' — '+year+' | '+sem.sem+'</h2>'
    +'<p>'+shift+' | '+sem.subs.length+' Subjects | Mon-Sat | 10:00-3:20 PM</p>'
    +'</div></div>'
    +'<div class="istrip">'
    +'<div class="ii"><span class="il">🎓 Year:</span><span class="iv">'+year+'</span></div>'
    +'<div class="ii"><span class="il">📋 Semester:</span><span class="iv">'+sem.sem+'</span></div>'
    +'<div class="ii"><span class="il">🔄 Shift:</span><span class="iv">'+shift+'</span></div>'
    +'<div class="ii"><span class="il">📚 Subjects:</span><span class="iv">'+sem.subs.length+'</span></div>'
    +'<div class="ii"><span class="il">👨‍🏫 Staff:</span><span class="iv">'+deptStaff.length+' members</span></div>'
    +'</div>'
    +buildClassGrid(key, parseInt(si), shift)
    +'</div>'+'</div>';
}

// ── SHIFT TAB SWITCH ─────────────────────────────────────
function switchShift(btn, targetId){
  const wrap = btn.closest('.tt-wrap');
  wrap.querySelectorAll('.shift-tab').forEach(b=>b.classList.remove('active'));
  wrap.querySelectorAll('.shift-content').forEach(c=>c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(targetId).classList.add('active');
}

// ── DASHBOARD ────────────────────────────────────────────
function initDash(){
  const stats=[
    {icon:"👨‍🏫",num:STAFF.filter(s=>s.type==='permanent').length,label:"Permanent Staff"},
    {icon:"🎓", num:STAFF.filter(s=>s.type==='guest').length,    label:"Guest / PTA Staff"},
    {icon:"🏫", num:Object.keys(SYL).length,                    label:"Departments"},
    {icon:"📚", num:Object.values(SYL).reduce((a,d)=>a+d.semesters.reduce((b,s)=>b+s.subs.length,0),0),label:"Total Subjects"},
    {icon:"🔄", num:2,                                           label:"Shifts (Batch A/B)"},
    {icon:"📅", num:6,                                           label:"Working Days"},
  ];
  document.getElementById('statsRow').innerHTML=stats.map(s=>'<div class="sc"><div class="si">'+s.icon+'</div><div class="sn">'+s.num+'</div><div class="sl">'+s.label+'</div></div>').join('');
  document.getElementById('deptList').innerHTML=Object.values(SYL).map(d=>{
    const k=Object.keys(SYL).find(k=>SYL[k]===d);
    const sc=STAFF.filter(s=>DMAP[s.dept]===k).length;
    const ts=d.semesters.reduce((a,s)=>a+s.subs.length,0);
    return '<div class="dr"><span style="font-weight:600;font-size:0.86rem">'+d.name+'</span><div style="display:flex;gap:5px"><span class="dbadge" style="background:#dbeafe;color:#1e40af">'+sc+' Staff</span><span class="dbadge" style="background:#f0f4ff;color:#475569">'+ts+' Subs</span></div></div>';
  }).join('');
}

// ── CONTACTS ─────────────────────────────────────────────
function initContacts(){
  const perm=STAFF.filter(s=>s.type==='permanent');
  const guest=STAFF.filter(s=>s.type==='guest');
  document.getElementById('permB').innerHTML=perm.map((s,i)=>'<tr><td>'+(i+1)+'</td><td><strong>'+s.name+'</strong></td><td>'+s.role+'</td><td>📞 '+s.phone+'</td></tr>').join('');
  document.getElementById('guestB').innerHTML=guest.map((s,i)=>'<tr><td>'+(i+1)+'</td><td><strong>'+s.name+'</strong></td><td>'+s.dept+'</td><td>'+s.role+'</td><td>📞 '+s.phone+'</td></tr>').join('');
  document.getElementById('nonB').innerHTML=NON_TEACH.map((s,i)=>'<tr><td>'+(i+1)+'</td><td><strong>'+s.name+'</strong></td><td>'+s.role+'</td><td>'+(s.phone!=='—'?'📞 '+s.phone:'—')+'</td></tr>').join('');
}

// ── PAGE SWITCH ───────────────────────────────────────────
function showPage(id,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  if(btn)btn.classList.add('active');
}

initDash();
initContacts();

// ── SUBJECT SEARCH ───────────────────────────────────────
function searchSubject(){
  const query = document.getElementById('subSearchInput').value.trim().toLowerCase();
  const el = document.getElementById('searchOut');
  if(query.length < 2){
    el.innerHTML='<div class="empty"><div class="ei">🔍</div><p>Subject name type pannunga</p></div>';
    return;
  }

  // Find all matching subject assignments
  const results = [];
  Object.keys(SYL).forEach(function(dkey){
    [0,1,2,3,4,5].forEach(function(si){
      ['Shift I','Shift II'].forEach(function(shift){
        var subStaff = {};
        DAYS.forEach(function(day){
          PERIOD_COLS.forEach(function(p){
            var key=dkey+'-'+si+'-'+shift+'-'+day+'-'+p.label;
            var e=MASTER[key];
            if(e && e.sub.toLowerCase()===query){
              if(!subStaff[e.sub]) subStaff[e.sub]=e.fixedStaff||e.staffName;
            }
          });
        });
        Object.keys(subStaff).forEach(function(sub){
          results.push({
            sub: sub,
            dept: SYL[dkey].name,
            year: si<2?'I Year':si<4?'II Year':'III Year',
            sem: SYL[dkey].semesters[si].sem,
            shift: shift,
            staff: subStaff[sub]
          });
        });
      });
    });
  });

  if(results.length===0){
    el.innerHTML='<div class="empty"><div class="ei">❌</div><p>No subject found!</p></div>';
    return;
  }

  // Group by subject name
  var grouped = {};
  results.forEach(function(r){
    if(!grouped[r.sub]) grouped[r.sub]=[];
    grouped[r.sub].push(r);
  });

  var html='<div style="display:grid;gap:16px;" id="searchPrintContent">';
  Object.keys(grouped).forEach(function(sub){
    html+='<div class="tt-wrap">'
      +'<div class="tt-top" style="background:linear-gradient(135deg,#0f2044,#1e3a6e);padding:14px 20px;">'
      +'<div class="tt-ti"><h2 style="font-size:1rem">'+sub+'</h2>'
      +'<p>'+grouped[sub].length+' classes assigned</p></div>'
      +'</div>'
      +'<table class="ctab" style="width:100%"><thead><tr>'
      +'<th>#</th><th>Department</th><th>Year</th><th>Semester</th><th>Shift</th><th>Staff</th>'
      +'</tr></thead><tbody>';
    grouped[sub].forEach(function(r,i){
      var sName = r.staff==='—'?'<span style="color:#9ca3af">Not assigned</span>'
        :'<strong>'+r.staff.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s*/,'')+'</strong>';
      html+='<tr>'
        +'<td>'+(i+1)+'</td>'
        +'<td>'+r.dept+'</td>'
        +'<td>'+r.year+'</td>'
        +'<td>'+r.sem+'</td>'
        +'<td><span class="dbadge" style="background:#dbeafe;color:#1e40af">'+r.shift+'</span></td>'
        +'<td>'+sName+'</td>'
        +'</tr>';
    });
    html+='</tbody></table></div>';
  });
  html+='</div>';
  el.innerHTML='<div style="display:flex;justify-content:flex-end;margin-bottom:10px">'
    +'<button class="print-btn" onclick="printSection(\'searchPrintContent\')" style="background:#0f2044;color:white;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:0.85rem">🖨️ Print / Save PDF</button>'
    +'</div>'+html;
}

// ── PRINT FUNCTION ───────────────────────────────────────
function printSection(id){
  var content = document.getElementById(id).innerHTML;
  var win = window.open('','_blank','width=900,height=700');
  win.document.write('<html><head><title>GASC Jayankondam - Timetable</title>');
  win.document.write('<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">');
  win.document.write('<style>');
  win.document.write('body{font-family:DM Sans,sans-serif;margin:0;padding:20px;background:white;color:#1e3a6e;}');
  win.document.write('.print-header{text-align:center;margin-bottom:20px;padding-bottom:12px;border-bottom:3px solid #0f2044;}');
  win.document.write('.print-header h1{font-size:1.2rem;color:#0f2044;margin:0 0 4px;}');
  win.document.write('.print-header p{font-size:0.8rem;color:#6b7280;margin:0;}');
  win.document.write('.tt-top{background:linear-gradient(135deg,#0f2044,#1e3a6e)!important;color:white;padding:16px 20px;border-radius:10px;display:flex;align-items:center;gap:14px;margin-bottom:12px;}');
  win.document.write('.tt-av{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;color:white;flex-shrink:0;}');
  win.document.write('.tt-ti h2{margin:0;font-size:1rem;color:white;} .tt-ti p{margin:0;font-size:0.8rem;color:rgba(255,255,255,0.8);}');
  win.document.write('.istrip{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;background:#f0f4ff;padding:10px 14px;border-radius:8px;}');
  win.document.write('.ii{display:flex;gap:6px;font-size:0.8rem;} .il{color:#6b7280;} .iv{color:#1e3a6e;font-weight:600;}');
  win.document.write('table{width:100%;border-collapse:collapse;font-size:0.8rem;}');
  win.document.write('th{background:#0f2044;color:white;padding:8px 10px;text-align:center;border:1px solid #1e3a6e;}');
  win.document.write('td{padding:7px 10px;border:1px solid #dde3f0;text-align:center;vertical-align:middle;}');
  win.document.write('.day-label{background:#f0f4ff;font-weight:700;color:#0f2044;text-align:left;}');
  win.document.write('.break-cell{background:#fff8e1;} .break-hdr{background:#b45309!important;}');
  win.document.write('.cell-sub{font-weight:700;color:#1e3a6e;font-size:0.78rem;}');
  win.document.write('.cell-staff{color:#4b6fa8;font-size:0.72rem;}');
  win.document.write('.tt-scroll{overflow:visible;}');
  win.document.write('@page{margin:1cm;size:A4 landscape;} @media print{body{padding:10px;}}');
  win.document.write('</style></head><body>');
  win.document.write('<div class="print-header">');
  win.document.write('<h1>Government Arts & Science College, Jayankondam</h1>');
  win.document.write('<p>Timetable Management Portal | Mon–Sat | 10:00 AM – 3:20 PM</p>');
  win.document.write('</div>');
  win.document.write(content);
  win.document.write('</body></html>');
  win.document.close();
  win.focus();
  setTimeout(function(){ win.print(); }, 800);
}

// ── PRINT ────────────────────────────────────────────────
function printTT(content){
  var printDiv = document.getElementById('printArea');
  if(!printDiv){
    printDiv = document.createElement('div');
    printDiv.id = 'printArea';
    document.body.appendChild(printDiv);
  }
  printDiv.innerHTML = content;
  window.print();
}
