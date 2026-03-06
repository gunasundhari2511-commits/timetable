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
    +'<div class="tt-top" style="background:linear-gradient(135deg,#0f2044,#1e3a6e)">'
    +'<div class="tt-av" style="background:'+bg+'">'+init+'</div>'
    +'<div class="tt-ti"><h2>'+s.name+'</h2><p>'+s.role+' | '+s.dept+'</p></div>'
    +'</div>'
    +'<div class="istrip">'
    +'<div class="ii"><span class="il">📞</span><span class="iv">'+s.phone+'</span></div>'
    +'<div class="ii"><span class="il">🏫 Dept:</span><span class="iv">'+s.dept+'</span></div>'
    +'<div class="ii"><span class="il">👤 Type:</span><span class="iv">'+(s.type==='permanent'?'Permanent':'Guest/PTA')+'</span></div>'
    +'<div class="ii"><span class="il">🔄 Shift:</span><span class="iv">'+shift+'</span></div>'
    +'<div class="ii"><span class="il">📋 Periods:</span><span class="iv">'+total+' assigned</span></div>'
    +'</div>'
    +buildStaffGrid(sch)
    +'</div>';
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
    +'</div>';
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