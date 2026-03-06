// ── LOGIN ─────────────────────────────────────────────────
const CREDENTIALS = { username: "admin", password: "admin123" };

function doLogin(){
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const err  = document.getElementById('loginErr');
  if(user === CREDENTIALS.username && pass === CREDENTIALS.password){
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainApp').style.display   = 'block';
    err.style.display = 'none';
  } else {
    err.style.display = 'block';
    document.getElementById('loginPass').value = '';
  }
}

// ── PERIODS ──────────────────────────────────────────────
const PERIODS = [
  {label:"P1", time:"10:00–11:00", type:"period"},
  {label:"Tea", time:"11:00–11:15", type:"break"},
  {label:"P2", time:"11:15–12:15", type:"period"},
  {label:"P3", time:"12:15–1:15",  type:"period"},
  {label:"Lunch", time:"1:15–1:45", type:"break"},
  {label:"P4", time:"1:45–2:45",   type:"period"},
  {label:"P5", time:"2:45–3:20",   type:"period"},
];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const PERIOD_COLS = PERIODS.filter(p=>p.type==="period"); // 5 periods
const BREAK_COLS  = PERIODS.filter(p=>p.type==="break");

// ── SYLLABUS ─────────────────────────────────────────────
const SYL = {
  cs:{name:"B.Sc Computer Science",short:"CS",color:{bg:"#dbeafe",text:"#1d4ed8",dark:"#1e40af"},
    semesters:[
      {sem:"Semester I",   subs:["Tamil","English","Algebra & Calculus","Numerical Analysis","C Programming","C Lab","Value Education"]},
      {sem:"Semester II",  subs:["Tamil","English","Java","Java Lab","Operations Research","Numerical Analysis","Professional English-I","EVS"]},
      {sem:"Semester III", subs:["Tamil","English","Python","Python Lab","Applied Physics-I","NME","Professional English-II"]},
      {sem:"Semester IV",  subs:["Tamil","English","NME","DBMS","DBMS Lab","Applied Physics-II"]},
      {sem:"Semester V",   subs:["Soft Skill Development","Fundamentals of Algorithm","Digital Electronics","Web Technology","Computer Network","Artificial Intelligence"]},
      {sem:"Semester VI",  subs:["PHP","PHP Lab","Software Development","Operating Systems","Mobile App Development","Gender Studies"]}]},
  maths:{name:"B.Sc Mathematics",short:"Maths",color:{bg:"#ede9fe",text:"#6d28d9",dark:"#5b21b6"},
    semesters:[
      {sem:"Semester I",   subs:["Tamil","English","Differential Calculus","Integral Calculus","Physics","Value Education"]},
      {sem:"Semester II",  subs:["Tamil","English","Differential Equations","Analytical Geometry","Physics","Professional English-I","Environmental Studies","Physics Lab"]},
      {sem:"Semester III", subs:["Tamil","English","Classical Algebra","Sequence and Series","Mathematical Statistics","Professional English-II","NME"]},
      {sem:"Semester IV",  subs:["Tamil","English","Vector Calculus","Abstract Algebra","Mathematical Statistics","NME","Statistics Practical"]},
      {sem:"Semester V",   subs:["Numerical Methods","Real Analysis","Statics","MATLAB Lab","Introduction to Latex","Operation Research","Soft Skill"]},
      {sem:"Semester VI",  subs:["Linear Algebra","Complex Analysis","Dynamics","Graph Theory","Number Theory","General Studies","Maths for Competitive Exams"]}]},
  bcom:{name:"B.Com",short:"B.Com",color:{bg:"#ffedd5",text:"#c2410c",dark:"#b45309"},
    semesters:[
      {sem:"Semester I",   subs:["Tamil","English","Principles of Accountancy","Marketing","Management Concepts","Value Education"]},
      {sem:"Semester II",  subs:["Tamil","English","Business Accounting","Tools","Business Economics","EVS","CLP"]},
      {sem:"Semester III", subs:["Tamil","English","Professional English-II","Freedom Movement in India","Partnership Accounts","Business Law","Business Communication"]},
      {sem:"Semester IV",  subs:["Tamil","English","Cost Accounting","Company Law","Banking Theory","India Arasiyalamaipu"]},
      {sem:"Semester V",   subs:["Corporate Accounting","Management Accounting","Information Technology","HRM","Soft Skill","Computer Application","Computer Practical"]},
      {sem:"Semester VI",  subs:["Income Tax Law","Investment Management","Financial Management","Financial Services","GST","General Studies"]}]},
  eng:{name:"B.A English",short:"Eng",color:{bg:"#fce7f3",text:"#be185d",dark:"#9d174d"},
    semesters:[
      {sem:"Semester I",   subs:["Tamil","English","Value Education","Prose","World Short Stories","Social History of England"]},
      {sem:"Semester II",  subs:["Tamil","English","Environmental Studies","Professional English","Poetry-I","Fiction","Literary Forms"]},
      {sem:"Semester III", subs:["Tamil","English","Professional English","Freedom Movement","Poetry-II","World One-Act Plays","History of English Lit-I"]},
      {sem:"Semester IV",  subs:["Tamil","English","Indian Constitution","Drama","Language & Linguistics","History of English Lit"]},
      {sem:"Semester V",   subs:["Soft Skill","Shakespeare","Literary Criticism","American Literature","History of English Language","Translation Theory","Communicative Skills"]},
      {sem:"Semester VI",  subs:["Indian Lit in English","Commonwealth Lit","English Language Teaching","English for Competitive Exam","English for BPO","Gender Studies"]}]},
  tam:{name:"B.A Tamil",short:"Tamil",color:{bg:"#dcfce7",text:"#166534",dark:"#15803d"},
    semesters:[
      {sem:"Semester I",   subs:["Tamil Elakkiya Varalaru-I","English","Ikkala Elakiyam","Nannul Yezhuthathigaram","Tamil Elakkiya Varalaru","Mathipukalvi"]},
      {sem:"Semester II",  subs:["Tamil Elakkiya Varalaru-II","English","Sitrilakiyam","Nannul Sollathigaram","Tamilaga Varalaru","Professional English-I","Sutrusuzhal Kalvi"]},
      {sem:"Semester III", subs:["English","Samaya Elakkiyam","Nambiyaga Porul","Sutrulaviyal","Professional English-II","NME"]},
      {sem:"Semester IV",  subs:["Tamilum Ariviyalum","English","India Arasiyalamaipu","Kappiyam","Ikkala Tamil Elakanam","Tamilaga Kovilgal"]},
      {sem:"Semester V",   subs:["Soft Skill","Neethi Elakkiyam","Oppilikiyam","Yappu-Thandi","Mozhiyiyal","Nattupura Elakkiyam","Padaipilakiyam"]},
      {sem:"Semester VI",  subs:["Sanga Elakkiyam","Palina Samathuvam","Kalvettiyal","Ethazhiyal","Thamizh Semmozhi Panbugal","Mozhipeyarpiyal"]}]}
};

const STAFF=[
  {name:"Dr. M. Rajamoorthy",   dept:"Admin",            role:"Principal (F.A.C.)",             phone:"9442359395",type:"permanent"},
  {name:"Dr. S. Nandakumar",    dept:"Mathematics",      role:"Asst. Professor in Mathematics", phone:"9488892941",type:"permanent"},
  {name:"Dr. S. Vadivelan",     dept:"Tamil",            role:"Asst. Professor in Tamil",       phone:"9976996912",type:"permanent"},
  {name:"Dr. G. Bavani",        dept:"Tamil",            role:"Asst. Professor in Tamil",       phone:"9489873461",type:"permanent"},
  {name:"Dr. G. Karthikeyan",   dept:"Computer Science", role:"Asst. Professor in CS",          phone:"9750282827",type:"permanent"},
  {name:"Mr. M. Rajendran",     dept:"Computer Science", role:"Asst. Professor in CS",          phone:"9842326033",type:"permanent"},
  {name:"Dr. K. Sakthimurugan", dept:"Commerce",         role:"Asst. Professor in Commerce",    phone:"9488834195",type:"permanent"},
  {name:"Dr. S. Jaiganesh",     dept:"Commerce",         role:"Asst. Professor in Commerce",    phone:"8344206435",type:"permanent"},
  {name:"Dr. K. Anbarasan",     dept:"Admin",            role:"Physical Director",              phone:"9489229685",type:"permanent"},
  {name:"Dr. R. Natarajan",     dept:"Admin",            role:"Librarian",                      phone:"8248214089",type:"permanent"},
  {name:"Dr. A. Akila",         dept:"Commerce",         role:"Guest Lecturer in Commerce",     phone:"6081384208",type:"guest"},
  {name:"Dr. P. Rayadurai",     dept:"Tamil",            role:"Guest Lecturer in Tamil",        phone:"9095557874",type:"guest"},
  {name:"Dr. K. Velmurugan",    dept:"Tamil",            role:"Guest Lecturer in Tamil",        phone:"7373145639",type:"guest"},
  {name:"Dr. U. Kalaiselvi",    dept:"Tamil",            role:"Guest Lecturer in Tamil",        phone:"9095789245",type:"guest"},
  {name:"Dr. R. Ambiga",        dept:"Tamil",            role:"Guest Lecturer in Tamil",        phone:"9159240967",type:"guest"},
  {name:"Dr. M. Prabakaran",    dept:"Tamil",            role:"Guest Lecturer in Tamil",        phone:"6380015644",type:"guest"},
  {name:"Dr. R. Kayalvizhi",    dept:"English",          role:"Guest Lecturer in English",      phone:"9344306582",type:"guest"},
  {name:"Dr. G. Kalayarasi",    dept:"English",          role:"Guest Lecturer in English",      phone:"9787938068",type:"guest"},
  {name:"Dr. J. Priya",         dept:"English",          role:"Guest Lecturer in English",      phone:"7639503175",type:"guest"},
  {name:"Dr. S. Elakkiya",      dept:"English",          role:"Guest Lecturer in English",      phone:"8300569530",type:"guest"},
  {name:"Dr. P. Mekala",        dept:"English",          role:"Guest Lecturer in English",      phone:"7397600364",type:"guest"},
  {name:"Dr. G. Kolanchinathan",dept:"Commerce",         role:"Guest Lecturer in Commerce",     phone:"9626240366",type:"guest"},
  {name:"Dr. A. Senthil",       dept:"Commerce",         role:"Guest Lecturer in Commerce",     phone:"9894244409",type:"guest"},
  {name:"Dr. R. G. Akalya",     dept:"Mathematics",      role:"Guest Lecturer in Mathematics",  phone:"6380866177",type:"guest"},
  {name:"Dr. R. Seethadevi",    dept:"Mathematics",      role:"Guest Lecturer in Mathematics",  phone:"6374165391",type:"guest"},
  {name:"Dr. G. Senthil",       dept:"Tamil",            role:"Guest Lecturer in Tamil",        phone:"9786341891",type:"guest"},
  {name:"Dr. K. Durgadevi",     dept:"Commerce",         role:"Guest Lecturer in Commerce",     phone:"8610607522",type:"guest"},
  {name:"Dr. D. Radhika",       dept:"Computer Science", role:"Guest Lecturer in CS",           phone:"9942141110",type:"guest"},
  {name:"Mrs. S. Mekala",       dept:"Computer Science", role:"CLP Lecturer in CS",             phone:"9486087086",type:"guest"},
  {name:"Mrs. K. Roshini",      dept:"Computer Science", role:"CLP Lecturer in CS",             phone:"9363057312",type:"guest"},
  {name:"Mrs. K. Devi",         dept:"Mathematics",      role:"PTA Lecturer in Maths",          phone:"9348760245",type:"guest"},
  {name:"Ms. J. Najin",         dept:"English",          role:"PTA Lecturer in English",        phone:"8220430846",type:"guest"},
  {name:"Mr. S. Raja",          dept:"Computer Science", role:"PTA Lecturer in CS",             phone:"7639948464",type:"guest"},
  {name:"Mr. Vignesh Sharma",   dept:"Mathematics",      role:"PTA Lecturer in Mathematics",    phone:"8807302680",type:"guest"},
  {name:"Dr. R. Sathiyadevi",   dept:"Tamil",            role:"PTA Lecturer in Tamil",          phone:"8508492680",type:"guest"},
  {name:"Mr. S. Kumar",         dept:"Tamil",            role:"PTA Lecturer in Tamil",          phone:"9688983399",type:"guest"},
  {name:"Mrs. A. Anbarasi",     dept:"English",          role:"PTA Lecturer in English",        phone:"9363910332",type:"guest"},
  {name:"Mrs. S. Asha",         dept:"English",          role:"PTA Lecturer in English",        phone:"6381170353",type:"guest"},
  {name:"Mr. P. Rajagopal",     dept:"Admin",            role:"PTA Library Assistant",          phone:"7867891185",type:"guest"},
];
const NON_TEACH=[
  {name:"Mr. R. Ganesan",      role:"Bursar",                  phone:"9788107984"},
  {name:"Mr. K. Suresh",       role:"Superintendent",          phone:"9789175449"},
  {name:"Mrs. T. Veerammal",   role:"Assistant",               phone:"7502954557"},
  {name:"Mr. N. Sundararaman", role:"Assistant Programmer",    phone:"9443398009"},
  {name:"Mr. K.R. Palanisamy", role:"Junior Assistant",        phone:"9943270578"},
  {name:"Mr. K. Manivelan",    role:"Junior Assistant",        phone:"6385425959"},
  {name:"Mr. A. Aravazhi",     role:"Junior Asst (Depu.)",     phone:"8144448568"},
  {name:"Mr. K. Suresh",       role:"Watchman",                phone:"8438301943"},
  {name:"Mr. K. Kalraj",       role:"Night Watchman (PTA)",    phone:"8220307856"},
  {name:"Mrs. Anandhi A",      role:"Sweeper",                 phone:"8220307856"},
  {name:"Mrs. Rekha",          role:"Sweeper",                 phone:"—"},
  {name:"Mrs. Kalaiselvi",     role:"Scavenger",               phone:"—"},
];

const DMAP={"Computer Science":"cs","Mathematics":"maths","Commerce":"bcom","English":"eng","Tamil":"tam"};
const DC={"Computer Science":{bg:"#dbeafe",text:"#1d4ed8"},"Mathematics":{bg:"#ede9fe",text:"#6d28d9"},"Commerce":{bg:"#ffedd5",text:"#c2410c"},"English":{bg:"#fce7f3",text:"#be185d"},"Tamil":{bg:"#dcfce7",text:"#166534"},"Admin":{bg:"#f1f5f9",text:"#475569"}};
const ABG=["#1d4ed8","#6d28d9","#c2410c","#be185d","#166534","#0f2044","#7c3aed"];
function gBg(n){let h=0;for(let c of n)h=(h*31+c.charCodeAt(0))%ABG.length;return ABG[h];}
function gIn(n){return n.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s*/,'').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();}