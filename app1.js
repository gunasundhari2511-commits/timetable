// ── STAFF SHIFT AUTO-ASSIGN ───────────────────────────────
// Each staff assigned to ONE shift only — no double shift
// Dept staff: alternate Shift I / Shift II within dept
// Tamil/English: spread across shifts

const STAFF_SHIFT = {};
(function(){
  const depts = {};
  STAFF.forEach(s=>{
    if(s.dept==='Admin') return;
    if(!depts[s.dept]) depts[s.dept]=[];
    depts[s.dept].push(s.name);
  });
  Object.keys(depts).forEach(dept=>{
    depts[dept].forEach((name,i)=>{
      STAFF_SHIFT[name] = (i%2===0) ? 'Shift I' : 'Shift II';
    });
  });
})();

// ── MASTER SCHEDULE ENGINE ──────────────────────────────
const ALL_CLASSES = [];
Object.keys(SYL).forEach(dkey=>{
  [0,1,2,3,4,5].forEach(si=>{
    ['Shift I','Shift II'].forEach(shift=>{
      ALL_CLASSES.push({
        dkey, semIdx:si, shift,
        subs: SYL[dkey].semesters[si].subs,
        year: si<2?'I Year':si<4?'II Year':'III Year',
        label: SYL[dkey].short+' '+(si<2?'I Year':si<4?'II Year':'III Year')
      });
    });
  });
});

function getSubjectStaffPool(subName, dkey, shift){
  const lc=subName.toLowerCase();
  let pool;
  if(subName==='Tamil'||lc.startsWith('tamil elakkiya')||lc.startsWith('tamilum')||lc.startsWith('tamilaga')||lc==='tamil')
    pool = STAFF.filter(s=>s.dept==='Tamil');
  else if(subName==='English')
    pool = STAFF.filter(s=>s.dept==='English');
  else
    pool = STAFF.filter(s=>DMAP[s.dept]===dkey);
  // Only staff assigned to this shift
  return pool.filter(s=>STAFF_SHIFT[s.name]===shift);
}

const subStaffMap = {};
function getFixedStaff(subName, dkey, semIdx, shift){
  const mapKey = dkey+'-'+semIdx+'-'+shift+'-'+subName;
  if(subStaffMap[mapKey]) return subStaffMap[mapKey];
  const pool = getSubjectStaffPool(subName, dkey, shift);
  if(pool.length === 0){
    // fallback: any staff from pool regardless of shift
    const fallback = getSubjectStaffPool(subName, dkey, shift==='Shift I'?'Shift II':'Shift I');
    if(fallback.length===0) return null;
    const loads={};
    Object.values(subStaffMap).forEach(n=>{loads[n]=(loads[n]||0)+1;});
    const picked=fallback.reduce((b,c)=>(loads[c.name]||0)<(loads[b.name]||0)?c:b,fallback[0]);
    subStaffMap[mapKey]=picked.name;
    return picked.name;
  }
  const loads={};
  Object.values(subStaffMap).forEach(n=>{loads[n]=(loads[n]||0)+1;});
  const picked=pool.reduce((b,c)=>(loads[c.name]||0)<(loads[b.name]||0)?c:b,pool[0]);
  subStaffMap[mapKey]=picked.name;
  return picked.name;
}

function buildMasterSchedule(){
  const master={};
  const busy={};
  STAFF.forEach(s=>{
    busy[s.name]={};
    ['Shift I','Shift II'].forEach(sh=>{
      busy[s.name][sh]={};
      DAYS.forEach(d=>{busy[s.name][sh][d]=new Set();});
    });
  });

  ALL_CLASSES.forEach(cls=>{
    const subs=cls.subs, slots=[];
    const perSub=Math.floor(30/subs.length), extra=30%subs.length;
    subs.forEach((sub,i)=>{for(let c=0;c<perSub+(i<extra?1:0);c++) slots.push(sub);});
    for(let i=slots.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[slots[i],slots[j]]=[slots[j],slots[i]];}

    const subAssign={};
    subs.forEach(sub=>{subAssign[sub]=getFixedStaff(sub,cls.dkey,cls.semIdx,cls.shift)||'—';});

    let si2=0;
    DAYS.forEach(day=>{
      PERIOD_COLS.forEach(p=>{
        const sub=slots[si2++%slots.length];
        let staffName=subAssign[sub];
        // Strict: if fixed staff is busy this period, show free — never swap
        if(staffName!=='—'&&busy[staffName]&&busy[staffName][cls.shift][day].has(p.label)){
          staffName='—';
        }
        if(staffName!=='—'&&busy[staffName]) busy[staffName][cls.shift][day].add(p.label);
        master[cls.dkey+'-'+cls.semIdx+'-'+cls.shift+'-'+day+'-'+p.label]={
          sub,
          staffName: staffName,           // used in staff timetable (may be — if double booked)
          fixedStaff: subAssign[sub]||'—', // always shows assigned staff in class timetable
          classLabel: cls.label,
          dkey: cls.dkey, semIdx: cls.semIdx, year: cls.year
        };
      });
    });
  });
  return master;
}

const MASTER=buildMasterSchedule();

// Staff schedule — ONE shift only, shows subject+class+shift info
function getStaffSchedule(staffName){
  const shift = STAFF_SHIFT[staffName] || 'Shift I';
  const sch={};
  DAYS.forEach(d=>{sch[d]={};PERIOD_COLS.forEach(p=>{sch[d][p.label]=null;});});
  DAYS.forEach(day=>{
    PERIOD_COLS.forEach(p=>{
      Object.keys(SYL).forEach(dkey=>{
        [0,1,2,3,4,5].forEach(si=>{
          const key=dkey+'-'+si+'-'+shift+'-'+day+'-'+p.label;
          if(MASTER[key]&&MASTER[key].staffName===staffName){
            if(!sch[day][p.label]){
              sch[day][p.label]={
                sub: MASTER[key].sub,
                classLabel: SYL[dkey].short+' '+(si<2?'I Year':si<4?'II Year':'III Year'),
                shift: shift
              };
            }
          }
        });
      });
    });
  });
  return {sch, shift};
}

// ── Staff grid — single professional blue ────────────────
function buildStaffGrid(sch){
  const hdrs=PERIODS.map(p=>p.type==='break'
    ?'<th class="break-hdr">'+p.label+'<br><span style="font-size:0.65rem;font-weight:400">'+p.time+'</span></th>'
    :'<th class="period-hdr">'+p.label+'<br><span style="font-size:0.65rem;font-weight:400">'+p.time+'</span></th>'
  ).join('');
  const rows=DAYS.map(day=>{
    const cells=PERIODS.map(p=>{
      if(p.type==='break') return '<td class="break-cell"><div class="break-txt">&#9749; '+p.label+'</div></td>';
      const e=sch[day][p.label];
      if(!e) return '<td style="background:#f8faff"><div class="cell-empty">Free</div></td>';
      return '<td style="background:#f0f4ff">'
        +'<div class="cell">'
        +'<div class="cell-sub" style="color:#1e3a6e;font-size:0.78rem">'+e.sub+'</div>'
        +'<div class="cell-staff" style="font-size:0.72rem;color:#4b6fa8;font-weight:600">'+e.classLabel+'</div>'
        +'</div></td>';
    }).join('');
    return '<tr><td class="day-label">'+day+'</td>'+cells+'</tr>';
  }).join('');
  return '<div class="tt-scroll"><table class="tg">'
    +'<thead><tr><th class="day-hdr">Day / Period</th>'+hdrs+'</tr></thead>'
    +'<tbody>'+rows+'</tbody>'
    +'</table></div>';
}