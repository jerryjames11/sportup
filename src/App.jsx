import { useState, useEffect, useRef, useCallback, Component } from "react";

// ─── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("SportUp error:", error, info); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{minHeight:"100vh",background:"#0A0A0F",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}><img src="data:image/png;base64,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" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"calc(50% - 4px) calc(50% + 28px)"}}/></div>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:22,color:"#fff",marginBottom:8,letterSpacing:-.5}}>Something went wrong</div>
        <p style={{color:"rgba(255,255,255,.5)",fontSize:14,marginBottom:28,maxWidth:300}}>SportUp hit an unexpected error. Check your connection and try again.</p>
        <button onClick={()=>{ this.setState({hasError:false,error:null}); window.location.reload(); }}
          style={{padding:"12px 28px",borderRadius:99,border:"none",background:"#F4530D",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:15,cursor:"pointer"}}>
          Reload app
        </button>
        {this.state.error && <p style={{marginTop:20,fontSize:11,color:"rgba(255,255,255,.2)",fontFamily:"monospace",maxWidth:320,wordBreak:"break-all"}}>{String(this.state.error).slice(0,120)}</p>}
      </div>
    );
  }
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ width="100%", height=16, radius=8, style={} }) {
  return (
    <div style={{width,height,borderRadius:radius,background:"rgba(255,255,255,.07)",position:"relative",overflow:"hidden",...style}}>
      <div style={{position:"absolute",top:0,left:"-100%",width:"100%",height:"100%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)",animation:"sk-shimmer 1.4s infinite"}}/>
      <style dangerouslySetInnerHTML={{__html:"@keyframes sk-shimmer{0%{left:-100%}100%{left:100%}}"}}/>
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div style={{background:"rgba(255,255,255,.05)",border:"1.5px solid rgba(255,255,255,.08)",borderRadius:16,padding:"18px 20px",position:"relative",overflow:"hidden"}}>
      <div style={{display:"flex",gap:8,marginBottom:12}}><Skeleton width={80} height={22} radius={99}/></div>
      <Skeleton width="65%" height={20} radius={6} style={{marginBottom:10}}/>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
        <Skeleton width="50%" height={13} radius={4}/>
        <Skeleton width="70%" height={13} radius={4}/>
        <Skeleton width="40%" height={13} radius={4}/>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end"}}><Skeleton width={70} height={13} radius={4}/></div>
    </div>
  );
}

//
const SPORTS = [
  { id: "basketball",    label: "Basketball",    emoji: "🏀", color: "#E8590C", bg: "#FFF4EE" },
  { id: "soccer",        label: "Soccer",        emoji: "⚽", color: "#2B8A3E", bg: "#F0FBF4" },
  { id: "volleyball",    label: "Volleyball",    emoji: "🏐", color: "#D4A017", bg: "#FFFBEB" },
  { id: "flagfootball",  label: "Flag Football", emoji: "🏈", color: "#9C36B5", bg: "#FAF0FF" },
  { id: "pickleball",    label: "Pickleball",    emoji: "🏓", color: "#1560BD", bg: "#EEF5FF" },
];
const SPORT_MAP = Object.fromEntries(SPORTS.map(s => [s.id, s]));

// Unified lookup covering both sports and wellness activities
const ALL_SPORT_MAP = {
  ...SPORT_MAP,
  walk:    { id:"walk",    label:"Walk",     emoji:"🚶", color:"#2B8A3E", bg:"#F0FBF4" },
  cardio:  { id:"cardio",  label:"Cardio",   emoji:"🏃", color:"#E8590C", bg:"#FFF4EE" },
  yoga:    { id:"yoga",    label:"Yoga",     emoji:"🧘", color:"#1560BD", bg:"#EEF5FF" },
  cycling: { id:"cycling", label:"Cycling",  emoji:"🚴", color:"#856404", bg:"#FFFBEB" },
  gym:     { id:"gym",     label:"Gym Sesh", emoji:"💪", color:"#7B2FBE", bg:"#F8F0FF" },
  // also match by label for events created via wellness picker
  Walk:    { id:"walk",    label:"Walk",     emoji:"🚶", color:"#2B8A3E", bg:"#F0FBF4" },
  Cardio:  { id:"cardio",  label:"Cardio",   emoji:"🏃", color:"#E8590C", bg:"#FFF4EE" },
  Yoga:    { id:"yoga",    label:"Yoga",     emoji:"🧘", color:"#1560BD", bg:"#EEF5FF" },
  Cycling: { id:"cycling", label:"Cycling",  emoji:"🚴", color:"#856404", bg:"#FFFBEB" },
  "Gym Sesh": { id:"gym", label:"Gym Sesh", emoji:"💪", color:"#7B2FBE", bg:"#F8F0FF" },
};

const FORMATS = [
  { id: "single", label: "Single Elimination", desc: "Lose once, you're out" },
  { id: "double", label: "Double Elimination", desc: "Two losses to be out" },
  { id: "robin",  label: "Round Robin",        desc: "Everyone plays everyone" },
];

const SAMPLE_HOST_UID = "sample-host-do-not-match";

const SAMPLE_EVENTS = [
  { id:"e1", type:"pickup",     sport:"basketball",  title:"Sunday Morning Run",    date:"2026-06-01", time:"09:00", location:"Richardson Heights Park, TX",      lat:32.9656, lng:-96.7302, slots:10, participantType:"players", joined:[{uid:"u1",name:"Alex",email:"",phone:""},{uid:"u2",name:"Jordan",email:"",phone:""},{uid:"u3",name:"Sam",email:"",phone:""}],   host:{uid:SAMPLE_HOST_UID,name:"Marcus T."}, tournamentFormat:"single", deadline:null, description:"Fast-paced pickup run -- all levels welcome!" },
  { id:"e2", type:"tournament", sport:"soccer",      title:"Summer Cup 2026",       date:"2026-06-07", time:"10:00", location:"Huffhines Recreation Center, TX",   lat:32.9754, lng:-96.6891, slots:8,  participantType:"teams",   joined:[{uid:"u4",name:"Team Alpha",email:"",phone:"",players:[]},{uid:"u5",name:"Team Beta",email:"",phone:"",players:[]}], host:{uid:SAMPLE_HOST_UID,name:"Sandra K."}, tournamentFormat:"double", deadline:null, description:"Annual summer tournament -- bring your best squad." },
  { id:"e3", type:"pickup",     sport:"pickleball",  title:"Weekday Rally",         date:"2026-05-30", time:"18:30", location:"Breckinridge Park, Richardson, TX", lat:32.9484, lng:-96.7218, slots:8,  participantType:"players", joined:[{uid:"u6",name:"Chris",email:"",phone:""},{uid:"u7",name:"Dana",email:"",phone:""}],  host:{uid:SAMPLE_HOST_UID,name:"Tom H."},    tournamentFormat:"single", deadline:null, description:"Casual evening rally. Paddles provided." },
  { id:"e4", type:"tournament", sport:"volleyball",  title:"Net Warriors",          date:"2026-06-14", time:"11:00", location:"Terrace Park, Dallas, TX",          lat:32.8487, lng:-96.7772, slots:6,  participantType:"teams",   joined:[{uid:"u8",name:"Spikers",email:"",phone:"",players:[]},{uid:"u9",name:"Blockers",email:"",phone:"",players:[]},{uid:"u10",name:"Diggers",email:"",phone:"",players:[]}], host:{uid:SAMPLE_HOST_UID,name:"Priya R."}, tournamentFormat:"robin", deadline:null, description:"Round robin pool play then finals." },
  { id:"e5", type:"pickup",     sport:"flagfootball", title:"Flag Frenzy Friday",   date:"2026-06-05", time:"19:00", location:"Cottonwood Park, Allen, TX",         lat:33.1032, lng:-96.6651, slots:14, participantType:"players", joined:[{uid:"u11",name:"Mike",email:"",phone:""},{uid:"u12",name:"Leah",email:"",phone:""},{uid:"u13",name:"Devon",email:"",phone:""},{uid:"u14",name:"Pat",email:"",phone:""}], host:{uid:SAMPLE_HOST_UID,name:"Carlos V."}, tournamentFormat:"single", deadline:null, description:"Friday night flag -- teams of 7." },
];

//
const load = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

//
function isPastDeadline(event) {
  if (!event?.deadline) return false;
  return Date.now() > new Date(event.deadline).getTime();
}

function canLeave(event) {
  if (isPastDeadline(event)) return false;
  const [h, m] = (event.time || "00:00").split(":").map(Number);
  const dt = new Date(event.date + "T00:00:00");
  dt.setHours(h, m, 0, 0);
  return Date.now() < dt.getTime() - 30 * 60 * 1000;
}

function fmtDeadline(event) {
  if (!event?.deadline) return null;
  const d = new Date(event.deadline);
  const past = Date.now() > d.getTime();
  const text = `Registration ${past ? "closed" : "closes"} ${d.toLocaleDateString([], { month:"short", day:"numeric" })} at ${d.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}`;
  return { text, past };
}

function fmtTime(ts) { return new Date(ts).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }); }
function fmtDay(ts) {
  const d = new Date(ts), t = new Date();
  if (d.toDateString() === t.toDateString()) return "Today";
  const y = new Date(t); y.setDate(t.getDate()-1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month:"short", day:"numeric" });
}


//
async function callClaude(prompt) {
  // Proxied through /api/claude -- Anthropic key lives server-side only, never in the browser
  const r = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 800, messages: [{ role: "user", content: prompt }] }),
  });
  if (!r.ok) throw new Error("AI request failed");
  const d = await r.json();
  return d.content?.map(b => b.text || "").join("") || "";
}


//
let _fb = null;
async function getFirebase() {
  if (_fb) return _fb;
  const cfg = {
    apiKey:            (window.__FB_API_KEY__            || ""),
    authDomain:        (window.__FB_AUTH_DOMAIN__        || ""),
    projectId:         (window.__FB_PROJECT_ID__         || ""),
    storageBucket:     (window.__FB_STORAGE_BUCKET__     || ""),
    messagingSenderId: (window.__FB_MESSAGING_SENDER_ID__|| ""),
    appId:             (window.__FB_APP_ID__             || ""),
  };
  const [app, auth, fs] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
    import("firebase/firestore"),
  ]);
  const fbApp = app.initializeApp(cfg);
  _fb = { auth: auth.getAuth(fbApp), google: new auth.GoogleAuthProvider(), ...auth, ...fs, db: fs.getFirestore(fbApp) };
  return _fb;
}

//
// Build a single-elimination bracket.
// byeCount: number of top seeds that get a first-round BYE (0 = no byes, everyone plays R1)
// Seeding rule: top seed plays lowest seed (1 vs N, 2 vs N-1, etc.)
// BYE rule: top seeds 1..byeCount skip R1 and auto-advance to R2.
function buildSingle(teams, byeCount) {
  const bc = byeCount || 0;
  const seeded = teams.map((t, i) => ({ ...t, seed: i + 1 }));
  const BYE = id => ({ name:"BYE", uid:"bye-"+id, seed:999, isByeSlot:true });

  // Split teams into bye-receivers (top seeds) and active R1 players
  const byeTeams    = seeded.slice(0, bc);          // seeds 1..bc -- auto-advance
  const activeTeams = seeded.slice(bc);              // seeds bc+1..N -- play R1

  // Pair active teams: highest seed vs lowest seed
  // e.g. 4 active: (1st,4th), (2nd,3rd) → but these are already offset by bc
  const r1Pairs = [];
  let lo = 0, hi = activeTeams.length - 1;
  while (lo < hi) {
    r1Pairs.push([activeTeams[lo], activeTeams[hi]]);
    lo++; hi--;
  }
  // If odd number of active teams, middle one gets a BYE
  if (lo === hi) r1Pairs.push([activeTeams[lo], BYE("mid-" + lo)]);

  const r1Matches = r1Pairs.map(([a, b]) => {
    const isBye = b.isByeSlot;
    const auto  = isBye ? a : null;
    return { a, b, scoreA: isBye ? "W" : "", scoreB: isBye ? "--" : "", auto, isBye };
  });

  const rounds = [];
  if (r1Matches.length > 0) rounds.push(r1Matches);

  // R1 winners (or TBD placeholders) + bye-receivers feed into R2
  // Pair bye-receivers with R1 match winners: seed 1 faces winner of last R1 match, etc.
  // Standard: top bye seed plays winner of lowest R1 matchup
  let r2Entries = [];
  const r1Winners = r1Matches.map((_, i) => ({ name:"TBD", uid:`tbd-r1-${i}`, seed:0 }));

  // Interleave bye-receivers and r1-winners for correct bracket shape
  // Bye teams are already top seeds; pair them against r1 winners in reverse order
  // so seed 1 faces winner of the (bc+1 vs N) match
  const byeSlots   = byeTeams.map(t => t);
  const r1WinSlots = [...r1Winners].reverse(); // last r1 winner faces first bye seed

  // Build R2 pairs: each bye seed paired with one R1 winner
  // Fill remaining R1 winners against each other if more R1 than bye seeds
  const r2Pairs = [];
  const usedR1 = [];
  byeSlots.forEach((byeTeam, i) => {
    const opponent = r1WinSlots[i] || { name:"TBD", uid:`tbd-r2-bye-${i}`, seed:0 };
    r2Pairs.push([byeTeam, opponent]);
    if (r1WinSlots[i]) usedR1.push(r1WinSlots[i].uid);
  });
  // Any remaining R1 winners (more R1 matches than bye seeds) pair against each other
  const remaining = r1Winners.filter(w => !usedR1.includes(w.uid));
  for (let i = 0; i < remaining.length; i += 2) {
    if (i + 1 < remaining.length) r2Pairs.push([remaining[i], remaining[i+1]]);
    else r2Pairs.push([remaining[i], { name:"TBD", uid:`tbd-r2-extra-${i}`, seed:0 }]);
  }

  if (r2Pairs.length > 0 && bc > 0) {
    rounds.push(r2Pairs.map(([a, b]) => ({ a, b, scoreA:"", scoreB:"", auto:null, isBye:false })));
  }

  // Continue building subsequent rounds until 1 match remains
  while (rounds[rounds.length - 1]?.length > 1) {
    const prev = rounds[rounds.length - 1];
    const next = [];
    for (let i = 0; i < prev.length; i += 2) {
      const a = { name:"TBD", uid:`tbd-r${rounds.length}-${i}`,   seed:0 };
      const b = { name:"TBD", uid:`tbd-r${rounds.length}-${i+1}`, seed:0 };
      next.push({ a, b, scoreA:"", scoreB:"", auto:null, isBye:false });
    }
    if (next.length > 0) rounds.push(next);
  }

  return rounds;
}

function matchWinner(m) {
  if (m.auto) return m.auto;
  const a = parseInt(m.scoreA), b = parseInt(m.scoreB);
  if (isNaN(a)||isNaN(b)||m.scoreA===""||m.scoreB===""||a===b) return null;
  return a > b ? { ...m.a } : { ...m.b };
}
function matchLoser(m) { const w = matchWinner(m); return w ? (w.uid===m.a.uid ? { ...m.b } : { ...m.a }) : null; }

//
function MapView({ lat, lng, label }) {
  const ref = useRef(null);
  const inst = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  useEffect(() => {
    if (!ref.current || inst.current) return;
    const init = async () => {
      try {
        if (!window.L) {
          const lnk = document.createElement("link"); lnk.rel="stylesheet"; lnk.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(lnk);
          await new Promise((res,rej) => { const s=document.createElement("script"); s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
        }
        if (!ref.current) return;
        const map = window.L.map(ref.current,{zoomControl:true,scrollWheelZoom:false}).setView([lat,lng],15);
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:19}).addTo(map);
        const icon = window.L.divIcon({html:`<div style="background:#E8590C;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)">⚡</div>`,className:"",iconSize:[32,32],iconAnchor:[16,16]});
        window.L.marker([lat,lng],{icon}).addTo(map).bindPopup(`<strong>${label}</strong>`).openPopup();
        inst.current = map; setMapReady(true);
      } catch(e) { console.warn("Map failed to load:", e); setMapError(true); }
    };
    init();
    return () => { if (inst.current) { inst.current.remove(); inst.current=null; } };
  }, [lat, lng, label]);
  return (
    <div style={{borderRadius:12,overflow:"hidden",border:"1.5px solid rgba(255,255,255,.1)",height:200,position:"relative",background:"rgba(255,255,255,.04)"}}>
      {!mapReady&&!mapError&&<div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,zIndex:1}}><div style={{fontSize:28}}>📍</div><div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>Loading map...</div></div>}
      {mapError&&<div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}><div style={{fontSize:28}}>📍</div><div style={{fontSize:13,color:"rgba(255,255,255,.5)",textAlign:"center",padding:"0 16px",fontWeight:600}}>{label}</div><div style={{fontSize:11,color:"rgba(255,255,255,.25)"}}>Map unavailable -- check connection</div></div>}
      <div ref={ref} style={{width:"100%",height:"100%"}}/>
    </div>
  );
}

//
function LocationSearch({ value, onChange, onTextChange }) {
  const [query, setQuery] = useState(() => value?.address || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  const search = async q => {
    if (q.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=us`);
      setResults(await r.json());
    } catch { setResults([]); }
    setLoading(false);
  };

  const onType = v => {
    setQuery(v);
    if (onTextChange) onTextChange(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(v), 400);
  };

  const pick = r => {
    const addr = r.display_name.split(",").slice(0,3).join(", ");
    setQuery(addr); setResults([]);
    if (onTextChange) onTextChange(addr);
    onChange({ address: addr, lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
  };

  const inp = { width:"100%", padding:"10px 13px", borderRadius:10, border:"1.5px solid #ddd", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" };
  return (
    <div style={{position:"relative"}}>
      <input value={query} onChange={e=>onType(e.target.value)} placeholder="Search for a park, gym, or address..." style={inp} onBlur={()=>setTimeout(()=>setResults([]),200)} />
      {loading && <span style={{position:"absolute",right:12,top:12,fontSize:12,color:"#999"}}>Searching...</span>}
      {results.length > 0 && (
        <div style={{position:"absolute",zIndex:200,top:"100%",left:0,right:0,background:"#fff",border:"1.5px solid #eee",borderRadius:10,marginTop:4,boxShadow:"0 4px 20px rgba(0,0,0,.1)",overflow:"hidden"}}>
          {results.map((r,i) => (
            <div key={i} onMouseDown={()=>pick(r)} style={{padding:"10px 14px",cursor:"pointer",fontSize:13,borderBottom:i<results.length-1?"1px solid #f5f5f5":"none"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f9f9f9"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
              📍 {r.display_name.split(",").slice(0,3).join(", ")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

//
function Chat({ eventId, currentUser, event }) {
  const isHost = event?.host?.uid === currentUser?.uid;
  const isIn   = event?.joined?.some(j => j.uid === currentUser?.uid);
  const ok     = isHost || isIn;
  const [msgs, setMsgs] = useState(() => load(`chat_${eventId}`, []));
  const [input, setInput] = useState("");
  const bot = useRef(null);

  useEffect(() => { bot.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  if (!currentUser) return <Lock text="Sign in to view chat" sub="You need to be signed in and joined to access the chat." />;
  if (!ok) return <Lock text="Participants only" sub="Join this event to access the chat." />;

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const m = { uid:currentUser.uid, name:currentUser.displayName||"Player", text, ts:Date.now() };
    const next = [...msgs, m];
    setMsgs(next); save(`chat_${eventId}`, next); setInput("");
  };

  const grouped = msgs.reduce((acc, m) => { const d=fmtDay(m.ts); (acc[d]=acc[d]||[]).push(m); return acc; }, {});

  return (
    <div style={{border:"1.5px solid #eee",borderRadius:14,overflow:"hidden",display:"flex",flexDirection:"column",height:320}}>
      <div style={{padding:"10px 14px",borderBottom:"1px solid #f0f0f0",background:"#fafafa",fontSize:13,fontWeight:700,color:"#444",display:"flex",alignItems:"center",gap:6}}>
        💬 Event chat <span style={{color:"#bbb",fontWeight:400}}>({msgs.length})</span>
        {isHost && <span style={{marginLeft:"auto",fontSize:10,color:"#aaa",background:"#eee",borderRadius:4,padding:"2px 6px"}}>Host</span>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:2}}>
        {Object.entries(grouped).map(([day,ms]) => (
          <div key={day}>
            <div style={{textAlign:"center",fontSize:11,color:"#bbb",margin:"8px 0 6px",fontWeight:600}}>{day}</div>
            {ms.map((m,i) => {
              const me = m.uid === currentUser.uid;
              return (
                <div key={i} style={{display:"flex",flexDirection:me?"row-reverse":"row",alignItems:"flex-end",gap:6,marginBottom:4}}>
                  {!me && <div style={{width:26,height:26,borderRadius:"50%",background:"#e9ecef",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#555",flexShrink:0}}>{m.name[0].toUpperCase()}</div>}
                  <div style={{maxWidth:"72%",display:"flex",flexDirection:"column",alignItems:me?"flex-end":"flex-start"}}>
                    {!me && <span style={{fontSize:10,color:"#999",marginBottom:2,paddingLeft:4}}>{m.name}</span>}
                    <div style={{background:me?"#111":"#f0f0f0",color:me?"#fff":"#222",padding:"8px 12px",borderRadius:me?"14px 14px 4px 14px":"14px 14px 14px 4px",fontSize:13,lineHeight:1.4}}>{m.text}</div>
                    <span style={{fontSize:10,color:"#bbb",marginTop:2,paddingLeft:4}}>{fmtTime(m.ts)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {msgs.length === 0 && <div style={{textAlign:"center",color:"#ccc",fontSize:13,marginTop:60}}>No messages yet. Say hi! 👋</div>}
        <div ref={bot}/>
      </div>
      <div style={{padding:"10px 12px",borderTop:"1px solid #f0f0f0",display:"flex",gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Message..." style={{flex:1,padding:"8px 12px",borderRadius:20,border:"1.5px solid #ddd",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
        <button onClick={send} disabled={!input.trim()} style={{padding:"8px 16px",borderRadius:20,border:"none",background:input.trim()?"#111":"#eee",color:input.trim()?"#fff":"#bbb",fontWeight:700,fontSize:13,cursor:input.trim()?"pointer":"default"}}>Send</button>
      </div>
    </div>
  );
}

function Lock({ text, sub }) {
  return (
    <div style={{border:"1.5px solid #eee",borderRadius:14,padding:"40px 20px",textAlign:"center"}}>
      <div style={{fontSize:32,marginBottom:10}}>🔒</div>
      <div style={{fontWeight:700,fontSize:15,color:"#111",marginBottom:6}}>{text}</div>
      <p style={{fontSize:13,color:"#888",margin:0}}>{sub}</p>
    </div>
  );
}

//
function MatchBox({ match, onScore }) {
  const winner = matchWinner(match);
  return (
    <div style={{background:"#fff",border:`1.5px solid ${match.isBye?"#f0f0f0":"#eee"}`,borderRadius:10,overflow:"hidden",opacity:match.isBye?.8:1}}>
      {[{team:match.a,score:match.scoreA,field:"scoreA"},{team:match.b,score:match.scoreB,field:"scoreB"}].map(({team,score,field},ti) => {
        const isBye = team.name==="BYE", isTbd = team.name.includes("TBD");
        const isW = winner?.uid===team.uid, isL = winner && !isW && !isBye && !isTbd;
        return (
          <div key={ti} style={{display:"flex",alignItems:"center",padding:"7px 10px",borderBottom:ti===0?"1px solid #f5f5f5":"none",background:isW?"#F0FBF4":isBye?"#fafafa":"#fff"}}>
            {team.seed&&team.seed!==999 && <span style={{fontSize:9,fontWeight:800,color:"#fff",background:isW?"#2B8A3E":"#bbb",borderRadius:4,padding:"1px 4px",marginRight:6,minWidth:16,textAlign:"center"}}>{team.seed}</span>}
            <span style={{flex:1,fontSize:12,fontWeight:isW?700:600,color:isBye||isTbd?"#ccc":isL?"#bbb":"#111",fontStyle:isTbd?"italic":"normal",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
              {isW&&!isBye&&<span style={{fontSize:10,color:"#2B8A3E"}}>✓</span>}
              {isBye?"-- BYE --":team.name}
            </span>
            {!isBye&&!match.isBye && <input type="number" min={0} value={score} onChange={e=>onScore(field,e.target.value)} placeholder="--" style={{width:36,textAlign:"center",border:`1px solid ${isW?"#2B8A3E44":"#eee"}`,borderRadius:5,padding:2,fontSize:12,fontFamily:"inherit",background:isW?"#F0FBF4":"#fff",fontWeight:isW?700:400}}/>}
            {match.isBye&&isW && <span style={{fontSize:10,fontWeight:700,color:"#2B8A3E",background:"#F0FBF4",borderRadius:5,padding:"2px 6px"}}>BYE ✓</span>}
          </div>
        );
      })}
    </div>
  );
}

//
function SingleBracket({ teams, byeCount }) {
  const [rounds, setRounds] = useState(() => buildSingle(teams, byeCount));

  const getW = useCallback(m => matchWinner(m), []);

  const update = (ri, mi, field, val) => {
    setRounds(prev => {
      let next = prev.map((r,rIdx) => rIdx!==ri ? r : r.map((m,mIdx) => mIdx!==mi ? m : {...m,[field]:val}));
      for (let r=0; r<next.length-1; r++) {
        next = next.map((round,rIdx) => {
          if (rIdx!==r+1) return round;
          return round.map((match,mIdx) => {
            const pA=next[r][mIdx*2], pB=next[r][mIdx*2+1];
            const wA=pA?getW(pA):null, wB=pB?getW(pB):null;
            const nA=wA&&wA.uid!==match.a.uid?wA:match.a;
            const nB=wB&&wB.uid!==match.b.uid?wB:match.b;
            const chg=nA.uid!==match.a.uid||nB.uid!==match.b.uid;
            return {...match,a:nA,b:nB,scoreA:chg?"":match.scoreA,scoreB:chg?"":match.scoreB,auto:null};
          });
        });
      }
      return next;
    });
  };

  const champ = matchWinner(rounds[rounds.length-1]?.[0]||{});
  return (
    <div style={{overflowX:"auto",paddingBottom:8}}>
      <div style={{display:"flex",gap:20,alignItems:"flex-start",minWidth:rounds.length*190}}>
        {rounds.map((round,ri) => (
          <div key={ri} style={{display:"flex",flexDirection:"column",gap:14,minWidth:172}}>
            <div style={{fontSize:10,fontWeight:800,color:"#999",textTransform:"uppercase",letterSpacing:.8,textAlign:"center"}}>
              {ri===rounds.length-1?"Final":ri===rounds.length-2?"Semi-finals":`Round ${ri+1}`}
            </div>
            {round.map((m,mi) => <MatchBox key={mi} match={m} onScore={(f,v)=>update(ri,mi,f,v)}/>)}
          </div>
        ))}
        <div style={{display:"flex",flexDirection:"column",justifyContent:"center",minWidth:100,paddingTop:22}}>
          <div style={{background:champ?"#FFF3CD":"#fafafa",border:`1.5px solid ${champ?"#FFD43B":"#eee"}`,borderRadius:10,padding:12,textAlign:"center",transition:"all .3s"}}>
            <div style={{fontSize:24}}>🏆</div>
            <div style={{fontSize:10,fontWeight:800,color:"#856404",marginTop:4,textTransform:"uppercase"}}>Winner</div>
            {champ?<div style={{fontSize:13,fontWeight:700,color:"#111",marginTop:6}}>{champ.name}</div>:<div style={{fontSize:11,color:"#ccc",marginTop:4}}>TBD</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

//
function DoubleBracket({ teams, byeCount }) {
  // Build a proper double-elimination bracket
  // Standard structure: WB has ceil(log2(n)) rounds
  // LB has 2*(WB rounds - 1) rounds
  // WB round K losers drop into LB round 2K-1 (drop-in rounds = odd LB rounds)
  // LB round 2K-1 winners + existing LB teams play in LB round 2K (consolidation rounds = even)

  const initBracket = () => {
    const wR = buildSingle(teams, byeCount);
    const nWR = wR.length; // number of WB rounds

    // LB has 2*(nWR-1) rounds
    const lRounds = nWR > 1 ? 2 * (nWR - 1) : 0;
    const lR = [];

    for (let ri = 0; ri < lRounds; ri++) {
      const isDropIn = ri % 2 === 0; // even index = drop-in (losers from WB), odd = consolidation
      const wbRound = Math.floor(ri / 2); // which WB round feeds this drop-in
      let matchCount;
      if (isDropIn) {
        // Drop-in round: same number of matches as WB round that feeds it
        matchCount = wR[wbRound]?.length || 1;
      } else {
        // Consolidation round: half of previous LB round
        matchCount = Math.ceil((lR[ri - 1]?.length || 2) / 2);
      }
      matchCount = Math.max(1, matchCount);
      lR.push(Array.from({ length: matchCount }, (_, mi) => ({
        a: { name:"TBD", uid:`lb-${ri}-${mi}-a` },
        b: { name:"TBD", uid:`lb-${ri}-${mi}-b` },
        scoreA:"", scoreB:""
      })));
    }

    return {
      wR,
      lR,
      gf:  { a:{name:"TBD",uid:"gf-a"}, b:{name:"TBD",uid:"gf-b"}, scoreA:"", scoreB:"" },
      gfR: { a:{name:"TBD",uid:"gfr-a"}, b:{name:"TBD",uid:"gfr-b"}, scoreA:"", scoreB:"", active:false },
    };
  };

  const [bracket, setBracket] = useState(initBracket);

  const propagate = (wR, lR, gf, gfR) => {
    const w = wR.map(r => r.map(m => ({...m})));
    const l = lR.map(r => r.map(m => ({...m})));
    const g = {...gf};
    const gr = {...gfR};
    const nWR = w.length;

    // ── Winners bracket propagation ──
    for (let ri = 0; ri < nWR - 1; ri++) {
      w[ri].forEach((m, mi) => {
        const wn = matchWinner(m);
        const nx = w[ri + 1]?.[Math.floor(mi / 2)];
        if (nx && wn) {
          const sl = mi % 2 === 0 ? "a" : "b";
          if (nx[sl].uid !== wn.uid) { nx[sl] = wn; nx.scoreA = ""; nx.scoreB = ""; }
        }
      });
    }

    // ── Drop losers from WB into LB drop-in rounds ──
    for (let wbRi = 0; wbRi < nWR - 1; wbRi++) {
      const lbDropInRi = wbRi * 2; // LB drop-in round index
      if (!l[lbDropInRi]) continue;
      w[wbRi].forEach((m, mi) => {
        const ln = matchLoser(m);
        if (!ln) return;
        const lm = l[lbDropInRi][mi];
        if (!lm) return;
        // WB Round 1 losers go into slot A (facing TBD from previous LB)
        // WB Round 2+ losers drop into slot B (facing survivor of previous LB round)
        const sl = wbRi === 0 ? "a" : "b";
        if (lm[sl].uid !== ln.uid) { lm[sl] = ln; lm.scoreA = ""; lm.scoreB = ""; }
      });
    }

    // ── LB internal propagation ──
    for (let ri = 0; ri < l.length - 1; ri++) {
      l[ri].forEach((m, mi) => {
        const wn = matchWinner(m);
        if (!wn) return;
        const nextRi = ri + 1;
        const isNextDropIn = nextRi % 2 === 0;
        let nx, sl;
        if (isNextDropIn) {
          // Consolidation → next drop-in: winner fills slot B (slot A gets WB loser)
          nx = l[nextRi]?.[mi];
          sl = "a"; // consolidation winners go into slot A of drop-in
        } else {
          // Drop-in → consolidation: pair up winners
          nx = l[nextRi]?.[Math.floor(mi / 2)];
          sl = mi % 2 === 0 ? "a" : "b";
        }
        if (nx && nx[sl].uid !== wn.uid) { nx[sl] = wn; nx.scoreA = ""; nx.scoreB = ""; }
      });
    }

    // ── Grand Final ──
    const wbChamp = matchWinner(w[nWR - 1]?.[0] || {});
    const lbChamp = l.length > 0 ? matchWinner(l[l.length - 1]?.[0] || {}) : null;
    if (wbChamp && g.a.uid !== wbChamp.uid) { g.a = wbChamp; g.scoreA = ""; g.scoreB = ""; }
    if (lbChamp && g.b.uid !== lbChamp.uid) { g.b = lbChamp; g.scoreA = ""; g.scoreB = ""; }

    // ── Bracket Reset ── (only if LB player wins GF)
    const gfWinner = matchWinner(g);
    const gfLoser  = gfWinner ? (gfWinner.uid === g.a.uid ? g.b : g.a) : null;
    if (gfWinner && gfLoser && gfWinner.uid === g.b.uid) {
      // LB player won — bracket reset triggered
      gr.active = true;
      if (gr.a.uid !== g.a.uid) { gr.a = g.a; gr.scoreA = ""; gr.scoreB = ""; }
      if (gr.b.uid !== g.b.uid) { gr.b = g.b; gr.scoreA = ""; gr.scoreB = ""; }
    } else {
      gr.active = false;
    }

    return { wR: w, lR: l, gf: g, gfR: gr };
  };

  const updW  = (ri,mi,f,v) => setBracket(b => propagate(b.wR.map((r,rI)=>rI!==ri?r:r.map((m,mI)=>mI!==mi?m:{...m,[f]:v})),b.lR,b.gf,b.gfR));
  const updL  = (ri,mi,f,v) => setBracket(b => propagate(b.wR,b.lR.map((r,rI)=>rI!==ri?r:r.map((m,mI)=>mI!==mi?m:{...m,[f]:v})),b.gf,b.gfR));
  const updGF = (f,v)        => setBracket(b => propagate(b.wR,b.lR,{...b.gf,[f]:v},b.gfR));
  const updGFR= (f,v)        => setBracket(b => propagate(b.wR,b.lR,b.gf,{...b.gfR,[f]:v}));

  const gfWinner  = matchWinner(bracket.gf);
  const gfrWinner = matchWinner(bracket.gfR);
  const champion  = gfrWinner || (gfWinner?.uid === bracket.gf.a.uid ? gfWinner : null);

  const SL = (label, color) => (
    <div style={{fontSize:11,fontWeight:700,color,textTransform:"uppercase",letterSpacing:.5,marginBottom:8,marginTop:4}}>{label}</div>
  );

  const getLBLabel = (ri) => {
    const isDropIn = ri % 2 === 0;
    const num = Math.floor(ri / 2) + 1;
    return isDropIn ? `LB Drop-in ${num}` : `LB Round ${num}`;
  };

  return (
    <div>
      {SL("Winners Bracket", "#2B8A3E")}
      <div style={{overflowX:"auto",marginBottom:16}}>
        <div style={{display:"flex",gap:16,minWidth:bracket.wR.length*185}}>
          {bracket.wR.map((round, ri) => (
            <div key={ri} style={{display:"flex",flexDirection:"column",gap:12,minWidth:172}}>
              <div style={{fontSize:10,fontWeight:800,color:"#999",textTransform:"uppercase",textAlign:"center"}}>
                {ri === bracket.wR.length-1 ? "WB Final" : ri === bracket.wR.length-2 ? "WB Semis" : `WB Round ${ri+1}`}
              </div>
              {round.map((m,mi) => <MatchBox key={mi} match={m} onScore={(f,v)=>updW(ri,mi,f,v)}/>)}
            </div>
          ))}
        </div>
      </div>

      {bracket.lR.length > 0 && <>
        {SL("Losers Bracket", "#C92A2A")}
        <div style={{overflowX:"auto",marginBottom:16}}>
          <div style={{display:"flex",gap:16,minWidth:bracket.lR.length*185}}>
            {bracket.lR.map((round, ri) => (
              <div key={ri} style={{display:"flex",flexDirection:"column",gap:12,minWidth:172}}>
                <div style={{fontSize:10,fontWeight:800,color:"#999",textTransform:"uppercase",textAlign:"center"}}>
                  {getLBLabel(ri)}
                </div>
                {round.map((m,mi) => <MatchBox key={mi} match={m} onScore={(f,v)=>updL(ri,mi,f,v)}/>)}
              </div>
            ))}
          </div>
        </div>
      </>}

      {SL("Grand Final", "#856404")}
      <div style={{fontSize:11,color:"#888",marginBottom:8}}>
        WB winner vs LB champion — if LB player wins, a bracket reset is played.
      </div>
      <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
        <div style={{minWidth:185}}><MatchBox match={bracket.gf} onScore={updGF}/></div>

        {bracket.gfR.active && <>
          <div style={{display:"flex",alignItems:"center",color:"#C92A2A",fontWeight:800,fontSize:13,padding:"8px 0"}}>⚡ Reset!</div>
          <div style={{minWidth:185}}>
            <div style={{fontSize:10,fontWeight:800,color:"#C92A2A",textTransform:"uppercase",marginBottom:6}}>Bracket Reset</div>
            <MatchBox match={bracket.gfR} onScore={updGFR}/>
          </div>
        </>}

        {champion && (
          <div style={{background:"#FFF3CD",border:"1.5px solid #FFD43B",borderRadius:10,padding:"12px 16px",textAlign:"center",minWidth:90}}>
            <div style={{fontSize:22}}>🏆</div>
            <div style={{fontSize:10,fontWeight:800,color:"#856404",textTransform:"uppercase",marginTop:4}}>Champion</div>
            <div style={{fontSize:13,fontWeight:700,color:"#111",marginTop:6}}>{champion.name}</div>
          </div>
        )}
      </div>
    </div>
  );
}

//
function RobinBracket({ teams }) {
  const initMatches = () => {
    const m=[];
    for(let i=0;i<teams.length;i++) for(let j=i+1;j<teams.length;j++) m.push({a:teams[i],b:teams[j],scoreA:"",scoreB:""});
    return m;
  };
  const [matches,setMatches]=useState(()=>initMatches());
  const upd=(i,f,v)=>setMatches(ms=>ms.map((m,mi)=>mi!==i?m:{...m,[f]:v}));

  const std=teams.map(t=>({...t,w:0,d:0,l:0,pts:0,gf:0,ga:0}));
  matches.forEach(m=>{
    if(m.scoreA===""||m.scoreB==="") return;
    const a=parseInt(m.scoreA)||0,b=parseInt(m.scoreB)||0;
    const ta=std.find(s=>s.uid===m.a.uid),tb=std.find(s=>s.uid===m.b.uid);
    if(!ta||!tb) return;
    ta.gf+=a;ta.ga+=b;tb.gf+=b;tb.ga+=a;
    if(a>b){ta.w++;ta.pts+=3;tb.l++;}else if(b>a){tb.w++;tb.pts+=3;ta.l++;}else{ta.d++;ta.pts++;tb.d++;tb.pts++;}
  });
  std.sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga));

  return (
    <div>
      <div style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Standings</div>
      <div style={{border:"1.5px solid #eee",borderRadius:10,overflow:"hidden",marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 36px 36px 36px 36px",background:"#fafafa",padding:"7px 12px",fontSize:10,fontWeight:700,color:"#999",textTransform:"uppercase"}}>
          <span>Team</span><span style={{textAlign:"center"}}>W</span><span style={{textAlign:"center"}}>D</span><span style={{textAlign:"center"}}>L</span><span style={{textAlign:"center"}}>Pts</span>
        </div>
        {std.map((t,i)=>(
          <div key={t.uid} style={{display:"grid",gridTemplateColumns:"1fr 36px 36px 36px 36px",padding:"8px 12px",borderTop:"1px solid #f0f0f0",background:i===0?"#FFFBEB":"#fff",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:i<2?700:400,color:"#111"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}.`} {t.name}</span>
            <span style={{textAlign:"center",fontSize:13,color:"#2B8A3E",fontWeight:600}}>{t.w}</span>
            <span style={{textAlign:"center",fontSize:13,color:"#888"}}>{t.d}</span>
            <span style={{textAlign:"center",fontSize:13,color:"#C92A2A"}}>{t.l}</span>
            <span style={{textAlign:"center",fontSize:13,fontWeight:700}}>{t.pts}</span>
          </div>
        ))}
      </div>
      <div style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Fixtures</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {matches.map((m,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:"#fff",border:"1.5px solid #eee",borderRadius:10,padding:"8px 12px"}}>
            <span style={{flex:1,fontSize:13,fontWeight:600,textAlign:"right",color:"#111"}}>{m.a.name}</span>
            <input type="number" min={0} value={m.scoreA} onChange={e=>upd(i,"scoreA",e.target.value)} style={{width:38,textAlign:"center",border:"1.5px solid #ddd",borderRadius:6,padding:4,fontSize:13,fontFamily:"inherit"}}/>
            <span style={{fontSize:11,color:"#bbb",fontWeight:700}}>VS</span>
            <input type="number" min={0} value={m.scoreB} onChange={e=>upd(i,"scoreB",e.target.value)} style={{width:38,textAlign:"center",border:"1.5px solid #ddd",borderRadius:6,padding:4,fontSize:13,fontFamily:"inherit"}}/>
            <span style={{flex:1,fontSize:13,fontWeight:600,color:"#111"}}>{m.b.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

//
function SeedingModal({ teams, onConfirm, onClose }) {
  const [seeded, setSeeded] = useState(() => teams.map((t,i)=>({...t,seed:i+1})));
  const [drag, setDrag] = useState(null);
  const [byeCount, setByeCount] = useState(() => 0);
  const numByes = byeCount;
  const maxByes = seeded.length - 1;

  const shuffle = () => setSeeded(s => [...s].sort(()=>Math.random()-.5).map((t,i)=>({...t,seed:i+1})));
  const moveUp = i => { if(i===0) return; const a=[...seeded]; [a[i-1],a[i]]=[a[i],a[i-1]]; setSeeded(a.map((t,idx)=>({...t,seed:idx+1}))); };
  const moveDown = i => { if(i===seeded.length-1) return; const a=[...seeded]; [a[i],a[i+1]]=[a[i+1],a[i]]; setSeeded(a.map((t,idx)=>({...t,seed:idx+1}))); };
  const onDragStart = i => setDrag(i);
  const onDragOver = (e,i) => { e.preventDefault(); if(drag===null||drag===i) return; const a=[...seeded]; const[mv]=a.splice(drag,1); a.splice(i,0,mv); setSeeded(a.map((t,idx)=>({...t,seed:idx+1}))); setDrag(i); };

  // Preview matchups using same logic as buildSingle
  const previewMatchups = [];
  const activeTeams = seeded.slice(numByes);
  // BYE rows
  seeded.slice(0, numByes).forEach(t => {
    previewMatchups.push({ a: t, b: { name:"BYE", seed:999 }, isBye: true });
  });
  // R1 pairings: highest vs lowest active seed
  let lo = 0, hi = activeTeams.length - 1;
  while (lo < hi) {
    previewMatchups.push({ a: activeTeams[lo], b: activeTeams[hi], isBye: false });
    lo++; hi--;
  }
  if (lo === hi) previewMatchups.push({ a: activeTeams[lo], b: { name:"BYE", seed:999 }, isBye: true });

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.5)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:20,padding:"26px 24px",width:500,maxWidth:"96vw",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div><div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:20,color:"#111",letterSpacing:-.5}}>🎯 Set Seeding</div>
            <p style={{fontSize:13,color:"#888",margin:"4px 0 0"}}>Drag to reorder or use arrows. Seed 1 is the top team.</p></div>
          <button onClick={shuffle} style={{padding:"7px 14px",borderRadius:9,border:"1.5px solid #ddd",background:"#fff",color:"#555",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0,marginLeft:12}}>🎲 Randomize</button>
        </div>

        <div style={{background:"#F7F7F5",border:"1.5px solid #eee",borderRadius:12,padding:"12px 14px",marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>BYE Assignments</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{flex:1,fontSize:13,color:"#444"}}>{numByes===0?"No BYEs -- all teams play Round 1":<>Top <strong>{numByes}</strong> seed{numByes!==1?"s":""} get a BYE and auto-advance</>}</span>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <button onClick={()=>setByeCount(b=>Math.max(0,b-1))} disabled={byeCount<=0} style={{width:28,height:28,borderRadius:7,border:"1.5px solid #ddd",background:byeCount<=0?"#f5f5f5":"#fff",color:byeCount<=0?"#ccc":"#111",fontWeight:700,fontSize:16,cursor:byeCount<=0?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <span style={{fontWeight:800,fontSize:20,color:"#111",minWidth:24,textAlign:"center"}}>{numByes}</span>
              <button onClick={()=>setByeCount(b=>Math.min(maxByes,b+1))} disabled={byeCount>=maxByes} style={{width:28,height:28,borderRadius:7,border:"1.5px solid #ddd",background:byeCount>=maxByes?"#f5f5f5":"#fff",color:byeCount>=maxByes?"#ccc":"#111",fontWeight:700,fontSize:16,cursor:byeCount>=maxByes?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            </div>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
          {seeded.map((t,i)=>(
            <div key={t.uid} draggable onDragStart={()=>onDragStart(i)} onDragOver={e=>onDragOver(e,i)} onDragEnd={()=>setDrag(null)}
              style={{display:"flex",alignItems:"center",gap:10,background:drag===i?"#EEF5FF":i<numByes?"#F0FBF4":"#fafafa",border:`1.5px solid ${drag===i?"#1971C2":i<numByes?"#2B8A3E22":"#eee"}`,borderRadius:10,padding:"9px 12px",cursor:"grab",userSelect:"none"}}>
              <span style={{fontSize:11,fontWeight:800,color:"#fff",background:i<numByes?"#2B8A3E":"#bbb",borderRadius:5,padding:"2px 7px",minWidth:28,textAlign:"center",flexShrink:0}}>#{i+1}</span>
              <span style={{flex:1,fontSize:13,fontWeight:600,color:"#111"}}>{t.name}</span>
              {i<numByes&&<span style={{fontSize:10,color:"#2B8A3E",background:"#F0FBF4",borderRadius:5,padding:"2px 7px",fontWeight:700}}>BYE ✓</span>}
              <span style={{fontSize:14,color:"#ccc",marginRight:2}}>⠿</span>
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                <button onClick={()=>moveUp(i)} disabled={i===0} style={{background:"none",border:"none",cursor:i===0?"default":"pointer",color:i===0?"#ddd":"#888",fontSize:12,padding:"0 4px",lineHeight:1}}>▲</button>
                <button onClick={()=>moveDown(i)} disabled={i===seeded.length-1} style={{background:"none",border:"none",cursor:i===seeded.length-1?"default":"pointer",color:i===seeded.length-1?"#ddd":"#888",fontSize:12,padding:"0 4px",lineHeight:1}}>▼</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Bracket Preview</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {previewMatchups.map((m,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:m.isBye?"#F0FBF4":"#fafafa",borderRadius:8,padding:"7px 12px",border:`1px solid ${m.isBye?"#2B8A3E22":"#f0f0f0"}`}}>
                <span style={{fontSize:10,fontWeight:800,color:"#fff",background:m.isBye?"#2B8A3E":"#bbb",borderRadius:4,padding:"1px 5px"}}>#{m.a.seed}</span>
                <span style={{fontSize:13,fontWeight:600,color:"#111",flex:1}}>{m.a.name}</span>
                {m.isBye
                  ? <span style={{fontSize:10,color:"#2B8A3E",fontWeight:700,background:"#F0FBF4",borderRadius:5,padding:"2px 8px"}}>BYE -- Auto-advances ✓</span>
                  : <>
                      <span style={{fontSize:11,color:"#ccc",fontWeight:700}}>vs</span>
                      <span style={{fontSize:13,fontWeight:600,color:"#111",flex:1,textAlign:"right"}}>{m.b.name}</span>
                      <span style={{fontSize:10,fontWeight:800,color:"#fff",background:"#bbb",borderRadius:4,padding:"1px 5px"}}>#{m.b.seed}</span>
                    </>}
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:11,borderRadius:10,border:"1.5px solid #ddd",background:"#fff",color:"#555",fontWeight:600,fontSize:14,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>onConfirm(seeded,numByes)} style={{flex:2,padding:11,borderRadius:10,border:"none",background:"#111",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Generate Bracket →</button>
        </div>
      </div>
    </div>
  );
}

//
function BracketView({ event, isHost }) {
  const pt = event.participantType || "teams";
  const teams = event.joined.filter(j=>j.name!=="BYE");
  const [fmt, setFmt] = useState(() => event.tournamentFormat || "single");
  const [seeded, setSeeded] = useState(null);
  const [byes, setByes] = useState(null);
  const [showSeed, setShowSeed] = useState(false);
  const [key, setKey] = useState(0);

  if (teams.length < 2) return <div style={{color:"#bbb",fontSize:13,textAlign:"center",padding:"20px 0"}}>Need at least 2 {pt} to generate a bracket</div>;

  const confirm = (s,b) => { setSeeded(s); setByes(b); setShowSeed(false); setKey(k=>k+1); };
  const reset = () => { setSeeded(null); setByes(null); setKey(k=>k+1); };

  return (
    <div>
      {showSeed&&<SeedingModal teams={seeded||teams} onConfirm={confirm} onClose={()=>setShowSeed(false)}/>}
      {/* Format switcher — host only */}
      {isHost && (
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          {FORMATS.map(f=>(
            <button key={f.id} onClick={()=>{setFmt(f.id);setKey(k=>k+1);}} style={{padding:"6px 12px",borderRadius:8,border:`1.5px solid ${fmt===f.id?"#111":"#ddd"}`,background:fmt===f.id?"#111":"#fff",color:fmt===f.id?"#fff":"#666",fontSize:12,fontWeight:600,cursor:"pointer"}}>
              {f.id==="single"?"⚔️":f.id==="double"?"🔁":"🔄"} {f.label}
            </button>
          ))}
        </div>
      )}
      {/* Seeding controls — host only */}
      {isHost && fmt!=="robin"&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,background:seeded?"#F0FBF4":"#FFFBEB",border:`1px solid ${seeded?"#2B8A3E22":"#FFD43B55"}`,borderRadius:10,padding:"10px 14px"}}>
          <div style={{flex:1,fontSize:13,color:seeded?"#2B8A3E":"#856404",fontWeight:600}}>
            {seeded?`✓ Seeding set · ${teams.length} ${pt} · ${byes??0} BYE${(byes??0)!==1?"s":""}`:`⚠️ No seeding -- ${pt} in registration order`}
          </div>
          <button onClick={()=>setShowSeed(true)} style={{padding:"6px 14px",borderRadius:8,border:"1.5px solid #111",background:"#111",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{seeded?"✏️ Edit seeds":"🎯 Set seeding"}</button>
          {seeded&&<button onClick={reset} style={{padding:"6px 10px",borderRadius:8,border:"1.5px solid #ddd",background:"#fff",color:"#888",fontSize:12,cursor:"pointer"}}>Reset</button>}
        </div>
      )}
      <div style={{fontSize:11,color:"#999",marginBottom:12}}>{FORMATS.find(f=>f.id===fmt)?.desc} · {teams.length} {pt}</div>
      {fmt==="single"&&<SingleBracket key={`s-${key}`} teams={seeded||teams} byeCount={byes}/>}
      {fmt==="double"&&<DoubleBracket key={`d-${key}`} teams={seeded||teams} byeCount={byes}/>}
      {fmt==="robin" &&<RobinBracket  key={`r-${key}`} teams={teams}/>}
    </div>
  );
}

//
function AuthModal({ onClose, onSignIn }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const stableUid = uid => { const k="su_uid_"+uid; const e=load(k,null)||("demo-"+Math.random().toString(36).slice(2)); save(k,e); return e; };

  const gGoogle = async () => {
    setLoading(true); setErr("");
    try {
      const fb = await getFirebase();
      const r = await fb.signInWithPopup(fb.auth, fb.google);
      const savedUser = load("su_user", null);
      const preferredName = savedUser?.uid === r.user.uid ? savedUser.displayName : null;
      const hasPreset = savedUser?.uid === r.user.uid && savedUser?.avatarBg;
      onSignIn({
        uid: r.user.uid,
        displayName: preferredName || r.user.displayName,
        email: r.user.email,
        photo: hasPreset ? null : r.user.photoURL,
        avatarBg: hasPreset ? savedUser.avatarBg : null,
        avatarEmoji: hasPreset ? savedUser.avatarEmoji : null,
      });
      onClose();
    } catch(e) {
      if(e.code==="auth/popup-blocked") { setErr("Popup blocked -- please allow popups and try again."); }
      else if(e.code==="auth/unauthorized-domain") { setErr("Domain not authorized in Firebase. Add it under Auth → Settings → Authorized domains."); }
      else if(e.code==="auth/cancelled-popup-request"||e.code==="auth/popup-closed-by-user") { /* silent */ }
      else { setErr("Google sign-in failed: "+(e.message||e.code)); }
    }
    setLoading(false);
  };

  const gEmail = async () => {
    if(!email||!pw) { setErr("Please fill in all fields"); return; }
    if(mode==="signup"&&!name.trim()) { setErr("Please enter a display name"); return; }
    setLoading(true); setErr("");
    try {
      const fb = await getFirebase();
      let r;
      if(mode==="signup") { r=await fb.createUserWithEmailAndPassword(fb.auth,email,pw); await fb.updateProfile(r.user,{displayName:name.trim()}); }
      else { r=await fb.signInWithEmailAndPassword(fb.auth,email,pw); }
      const savedUser = load("su_user", null);
      const preferredName = savedUser?.uid === r.user.uid ? savedUser.displayName : null;
      const hasPreset = savedUser?.uid === r.user.uid && savedUser?.avatarBg;
      onSignIn({
        uid: r.user.uid,
        displayName: preferredName || r.user.displayName || name.trim() || "Player",
        email: r.user.email,
        photo: hasPreset ? null : null,
        avatarBg: hasPreset ? savedUser.avatarBg : null,
        avatarEmoji: hasPreset ? savedUser.avatarEmoji : null,
      });
      onClose();
    } catch(e) {
      const msg = e.code==="auth/wrong-password"||e.code==="auth/invalid-credential" ? "Incorrect email or password." : e.code==="auth/user-not-found" ? "No account with that email." : e.code==="auth/email-already-in-use" ? "An account with that email already exists." : "Sign in failed. Please try again.";
      setErr(msg);
    }
    setLoading(false);
  };

  const inp={padding:"10px 13px",borderRadius:10,border:"1.5px solid #ddd",fontSize:14,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"};
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.5)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:20,padding:"28px 24px",width:360,maxWidth:"90vw",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:22,color:"#111",marginBottom:4,letterSpacing:-.5}}> Welcome to SportUp</div>
        <p style={{fontSize:13,color:"#888",margin:"0 0 20px"}}>Sign in to join games, host events, and chat.</p>
        <button onClick={gGoogle} disabled={loading} style={{width:"100%",padding:11,borderRadius:10,border:"1.5px solid #ddd",background:"#fff",color:"#111",fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:14}}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
        <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0",color:"#ccc",fontSize:12}}><div style={{flex:1,height:1,background:"#eee"}}/><span>or</span><div style={{flex:1,height:1,background:"#eee"}}/></div>
        <div style={{display:"flex",gap:0,marginBottom:14,border:"1.5px solid #eee",borderRadius:10,overflow:"hidden"}}>
          {["signin","signup"].map(m=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:8,border:"none",background:mode===m?"#111":"#fff",color:mode===m?"#fff":"#888",fontSize:13,fontWeight:600,cursor:"pointer"}}>{m==="signin"?"Sign in":"Sign up"}</button>)}
        </div>
        <p style={{fontSize:11,color:"#aaa",margin:"0 0 14px",textAlign:"center"}}>
          By signing in you agree to our <a href="/privacy" target="_blank" style={{color:"#888",textDecoration:"underline"}}>Privacy Policy</a>.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {mode==="signup"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Display name" style={inp}/>}
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={inp}/>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" style={inp} onKeyDown={e=>e.key==="Enter"&&gEmail()}/>
          {err&&<div style={{fontSize:12,color:"#C92A2A"}}>{err}</div>}
          <button onClick={gEmail} disabled={loading} style={{padding:11,borderRadius:10,border:"none",background:"#111",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>{loading?"Loading...":mode==="signup"?"Create account":"Sign in"}</button>
        </div>
      </div>
    </div>
  );
}

//
function SportBadge({sportId}) {
  const s = ALL_SPORT_MAP[sportId] || { label: sportId, emoji:"🏅", color:"#888", bg:"#f5f5f5" };
  return (
    <span style={{background:s.bg,color:s.color,padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4,border:`1px solid ${s.color}22`}}>
      {sportId==="pickleball" ? <PickleballIcon size={14}/> : s.emoji} {s.label}
    </span>
  );
}
function EventCard({event,onClick,mode}) {
  const s=ALL_SPORT_MAP[event.sport]||{label:event.sport||"Event",color:"#888",bg:"#eee",emoji:"🏅"};
  const m=MODES[mode]||MODES.pickup;
  const left=event.slots-event.joined.length;
  const [hov,setHov]=useState(false);
  return (
    <div onClick={()=>onClick(event)}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?"rgba(255,255,255,.14)":"rgba(255,255,255,.09)",border:`1.5px solid ${hov?m.accent:"rgba(255,255,255,.15)"}`,borderRadius:16,padding:"18px 20px",cursor:"pointer",transition:"all .18s",position:"relative",overflow:"hidden",boxShadow:hov?`0 4px 24px ${m.accent}33`:"none"}}>
      <div style={{position:"absolute",top:0,right:0,width:64,height:64,background:`${s.color}22`,borderRadius:"0 16px 0 64px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>
        {event.sport==="pickleball" ? <PickleballIcon size={28}/> : s.emoji}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        <span style={{background:`${s.color}18`,color:s.color,padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4}}>
          {event.sport==="pickleball" ? <PickleballIcon size={13}/> : s.emoji} {s.label}
        </span>
        {event.isPrivate&&<span style={{background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.6)",padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600}}>🔒 Private</span>}
      </div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:17,color:"#fff",marginBottom:8,paddingRight:52}}>{event.title}</div>
      <div style={{fontSize:12,color:"rgba(255,255,255,.5)",marginBottom:12,display:"flex",flexDirection:"column",gap:3}}>
        <span>📅 {event.date} · {event.time}</span>
        <span>📍 {event.location}</span>
        <span>👤 {event.host?.name||event.host}</span>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <span style={{fontSize:12,fontWeight:700,color:left>3?"#4ADE80":left>0?"#FB923C":"#F87171"}}>{left>0?`${left} spot${left>1?"s":""} left`:"Full"}</span>
      </div>
    </div>
  );
}

//
function JoinModal({ event, currentUser, onConfirm, onClose }) {
  const pt = event.participantType || "teams";
  const isTmnt = event.type === "tournament";
  const [entryName, setEntryName] = useState("");
  const [email, setEmail] = useState(() => currentUser?.email || "");
  const [phone, setPhone] = useState("");
  const confirm = () => {
    const n = isTmnt ? entryName.trim() : (currentUser?.displayName || "Player");
    if (isTmnt && !n) { alert(`Enter a ${pt==="teams"?"team":"player"} name`); return; }
    if (!phone.trim()) { alert("Phone number is required."); return; }
    onConfirm({ uid:currentUser.uid, name:n, email:email.trim(), phone:phone.trim(), ...(isTmnt&&pt==="teams"?{players:[]}:{}) });
  };
  const inp = {padding:"10px 13px",borderRadius:10,border:"1.5px solid #ddd",fontSize:14,outline:"none",fontFamily:"inherit"};
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.45)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:18,padding:"26px 24px",width:360,maxWidth:"92vw",boxShadow:"0 20px 60px rgba(0,0,0,.18)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:800,fontSize:18,color:"#111",marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>{isTmnt?(pt==="teams"?"🏅 Register your team":"👤 Register as player"):"🎮 Join this game"}</div>
        <p style={{fontSize:13,color:"#888",margin:"0 0 18px"}}>Contact info is only visible to the host.</p>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          {isTmnt?<input value={entryName} onChange={e=>setEntryName(e.target.value)} placeholder={pt==="teams"?"Team name *":"Your name *"} style={inp} autoFocus/>
            :<div style={{padding:"10px 13px",borderRadius:10,border:"1.5px solid #f0f0f0",fontSize:14,color:"#555",background:"#fafafa"}}>👤 Joining as <strong>{currentUser?.displayName||"Player"}</strong></div>}
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Contact email" style={inp}/>
          <div style={{position:"relative"}}>
            <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone number *" style={{...inp,width:"100%",boxSizing:"border-box",borderColor:!phone.trim()?"#ddd":"#2B8A3E"}} onKeyDown={e=>e.key==="Enter"&&confirm()}/>
            <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:10,color:"#C92A2A",fontWeight:700,pointerEvents:"none"}}>required</span>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:18}}>
          <button onClick={onClose} style={{flex:1,padding:10,borderRadius:10,border:"1.5px solid #ddd",background:"#fff",color:"#555",fontWeight:600,fontSize:14,cursor:"pointer"}}>Cancel</button>
          <button onClick={confirm} style={{flex:2,padding:10,borderRadius:10,border:"none",background:"#111",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Join →</button>
        </div>
      </div>
    </div>
  );
}

function HostAddModal({ event, onConfirm, onClose }) {
  const pt = event.participantType || "teams";
  const lbl = event.type==="tournament" ? (pt==="teams"?"team":"player") : "player";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const confirm = () => {
    const n=name.trim(); if(!n){alert("Name required");return;}
    if(event.joined.some(j=>j.name.toLowerCase()===n.toLowerCase())){alert(`"${n}" already registered.`);return;}
    if(event.joined.length>=event.slots){alert("Event is full.");return;}
    onConfirm({uid:"ha-"+Date.now(),name:n,email:email.trim(),phone:phone.trim(),hostAdded:true,...(event.type==="tournament"&&pt==="teams"?{players:[]}:{})});
  };
  const inp={padding:"10px 13px",borderRadius:10,border:"1.5px solid #ddd",fontSize:14,outline:"none",fontFamily:"inherit"};
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.45)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:18,padding:"26px 24px",width:360,maxWidth:"92vw",boxShadow:"0 20px 60px rgba(0,0,0,.18)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:800,fontSize:18,color:"#111",marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>✏️ Add {lbl}</div>
        <p style={{fontSize:13,color:"#888",margin:"0 0 18px"}}>Manually register on their behalf.</p>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder={`${lbl.charAt(0).toUpperCase()+lbl.slice(1)} name *`} style={inp} autoFocus/>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (optional)" style={inp}/>
          <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone (optional)" style={inp} onKeyDown={e=>e.key==="Enter"&&confirm()}/>
        </div>
        <div style={{display:"flex",gap:8,marginTop:18}}>
          <button onClick={onClose} style={{flex:1,padding:10,borderRadius:10,border:"1.5px solid #ddd",background:"#fff",color:"#555",fontWeight:600,fontSize:14,cursor:"pointer"}}>Cancel</button>
          <button onClick={confirm} style={{flex:2,padding:10,borderRadius:10,border:"none",background:"#856404",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Add →</button>
        </div>
      </div>
    </div>
  );
}

//
function TeamRow({ event, team, currentUser, isHost, deadlinePassed, onUpdatePlayers, onRemove }) {
  const isMine = team.uid === currentUser?.uid;
  const canManage = (isMine || isHost);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(() => team.name);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [copied, setCopied] = useState(false);
  const players = team.players || [];
  const link = `${window.location.origin}${window.location.pathname}#event=${event.id}&team=${encodeURIComponent(team.uid)}`;

  const copyLink = () => { navigator.clipboard.writeText(link).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const saveName = () => { const n=nameVal.trim(); if(n) onUpdatePlayers(event.id,team.uid,players,n); setEditing(false); };
  const addPlayer = () => {
    const n=addName.trim(); if(!n) return;
    onUpdatePlayers(event.id,team.uid,[...players,{name:n,email:addEmail.trim(),phone:addPhone.trim(),id:"p-"+Date.now()}]);
    setAddName(""); setAddEmail(""); setAddPhone("");
  };
  const remPlayer = id => onUpdatePlayers(event.id,team.uid,players.filter(p=>p.id!==id));

  return (
    <div style={{border:"1.5px solid #eee",borderRadius:10,overflow:"hidden",marginBottom:6}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",background:isMine?"#EEF5FF":"#fafafa",cursor:canManage?"pointer":"default"}} onClick={()=>canManage&&setOpen(o=>!o)}>
        <span style={{fontSize:15}}>🏅</span>
        {editing&&isMine&&!deadlinePassed
          ? <input value={nameVal} onChange={e=>setNameVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveName();if(e.key==="Escape")setEditing(false);}} onClick={e=>e.stopPropagation()} autoFocus style={{flex:1,fontSize:13,fontWeight:600,padding:"2px 8px",borderRadius:6,border:"1.5px solid #1971C2",outline:"none",fontFamily:"inherit"}}/>
          : <span style={{flex:1,fontSize:13,fontWeight:600,color:"#111"}}>{team.name}{isMine&&<span style={{marginLeft:6,fontSize:10,color:"#1971C2"}}>(you)</span>}{team.hostAdded&&<span style={{marginLeft:6,fontSize:10,color:"#aaa",background:"#eee",borderRadius:4,padding:"1px 5px"}}>host added</span>}</span>}
        {players.length>0&&<span style={{fontSize:11,color:"#888",background:"#eee",borderRadius:99,padding:"2px 7px"}}>{players.length}p</span>}
        {isMine&&!deadlinePassed&&!editing&&<button onClick={e=>{e.stopPropagation();setEditing(true);setNameVal(team.name);}} style={{fontSize:10,color:"#1971C2",background:"none",border:"1px solid #1971C233",borderRadius:5,padding:"2px 6px",cursor:"pointer"}}>Rename</button>}
        {editing&&isMine&&!deadlinePassed&&<button onClick={e=>{e.stopPropagation();saveName();}} style={{fontSize:10,color:"#2B8A3E",background:"#F0FBF4",border:"1px solid #2B8A3E33",borderRadius:5,padding:"2px 6px",cursor:"pointer"}}>Save</button>}
        {isMine&&!isHost&&!deadlinePassed&&<button onClick={e=>{e.stopPropagation();onRemove(team.uid);}} style={{fontSize:10,color:"#C92A2A",background:"none",border:"1px solid #C92A2A33",borderRadius:5,padding:"2px 6px",cursor:"pointer"}}>Leave</button>}
        {isMine&&deadlinePassed&&!isHost&&<span style={{fontSize:10,color:"#bbb"}}>Deadline passed</span>}
        {isHost&&team.uid!==currentUser?.uid&&<button onClick={e=>{e.stopPropagation();onRemove(team.uid);}} style={{fontSize:11,color:"#C92A2A",background:"none",border:"1px solid #C92A2A33",borderRadius:6,padding:"2px 8px",cursor:"pointer"}}>Remove</button>}
        {canManage&&<span style={{fontSize:12,color:"#aaa"}}>{open?"▲":"▼"}</span>}
      </div>
      {open&&canManage&&(
        <div style={{padding:"12px 14px",borderTop:"1px solid #f0f0f0",background:"#fff"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#F7F7F5",borderRadius:9,padding:"8px 10px",marginBottom:12}}>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",marginBottom:1}}>Team join link</div><div style={{fontSize:11,color:"#777",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{link}</div></div>
            <button onClick={copyLink} style={{flexShrink:0,padding:"5px 10px",borderRadius:7,border:"1.5px solid #ddd",background:copied?"#2B8A3E":"#fff",color:copied?"#fff":"#555",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{copied?"✅ Copied!":"🔗 Copy"}</button>
          </div>
          {players.length>0&&(
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",marginBottom:6}}>Players ({players.length})</div>
              {players.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,background:"#fafafa",borderRadius:8,padding:"7px 10px",border:"1px solid #f0f0f0",marginBottom:4}}>
                  <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"#111"}}>{p.name}</div>
                    <div style={{fontSize:11,color:"#aaa",display:"flex",gap:8}}>
                      {p.email&&<a href={`mailto:${p.email}`} style={{color:"#1971C2",textDecoration:"none"}}>{p.email}</a>}
                      {p.phone&&<a href={`tel:${p.phone}`} style={{color:"#2B8A3E",textDecoration:"none"}}>{p.phone}</a>}
                    </div>
                  </div>
                  {!deadlinePassed&&<button onClick={()=>remPlayer(p.id)} style={{fontSize:10,color:"#C92A2A",background:"none",border:"1px solid #C92A2A33",borderRadius:5,padding:"2px 6px",cursor:"pointer"}}>✕</button>}
                </div>
              ))}
            </div>
          )}
          {!deadlinePassed
            ? <div style={{background:"#F7F7F5",borderRadius:9,padding:"10px 12px"}}>
                <div style={{fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",marginBottom:8}}>Add a player</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <input value={addName} onChange={e=>setAddName(e.target.value)} placeholder="Player name *" style={{padding:"7px 10px",borderRadius:7,border:"1.5px solid #ddd",fontSize:12,outline:"none",fontFamily:"inherit"}}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    <input type="email" value={addEmail} onChange={e=>setAddEmail(e.target.value)} placeholder="Email" style={{padding:"7px 10px",borderRadius:7,border:"1.5px solid #ddd",fontSize:12,outline:"none",fontFamily:"inherit"}}/>
                    <input type="tel" value={addPhone} onChange={e=>setAddPhone(e.target.value)} placeholder="Phone" style={{padding:"7px 10px",borderRadius:7,border:"1.5px solid #ddd",fontSize:12,outline:"none",fontFamily:"inherit"}} onKeyDown={e=>e.key==="Enter"&&addPlayer()}/>
                  </div>
                  <button onClick={addPlayer} style={{padding:7,borderRadius:7,border:"none",background:"#111",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>Add player →</button>
                </div>
              </div>
            : <div style={{fontSize:12,color:"#bbb",textAlign:"center",padding:"8px 0"}}>Deadline passed -- roster locked</div>}
        </div>
      )}
    </div>
  );
}

//
function ContactsTab({ event, isHost }) {
  const [copied, setCopied] = useState(null);
  const copyAll = () => { navigator.clipboard.writeText(event.joined.map(p=>[p.name,p.email||"--",p.phone||"--"].join("\t")).join("\n")).catch(()=>{}); setCopied("all"); setTimeout(()=>setCopied(null),2000); };

  if (!isHost) return (
    <div style={{padding:"20px 0",textAlign:"center"}}>
      <div style={{fontSize:13,color:"#888",marginBottom:16}}>Participant list ({event.joined.length})</div>
      <div style={{border:"1.5px solid #eee",borderRadius:12,overflow:"hidden"}}>
        {event.joined.length===0
          ? <div style={{color:"#ccc",fontSize:13,padding:"20px"}}>No participants yet</div>
          : event.joined.map((p,i)=>(
              <div key={i} style={{padding:"10px 16px",borderBottom:i<event.joined.length-1?"1px solid #f5f5f5":"none",fontSize:13,fontWeight:600,color:"#111",background:i%2===0?"#fff":"#fafafa",textAlign:"left"}}>
                {p.hostAdded&&<span style={{opacity:.5,marginRight:4}}>✏️</span>}{p.name}
              </div>
            ))
        }
      </div>
      <p style={{fontSize:11,color:"#bbb",marginTop:12}}>Contact info is only visible to the host.</p>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5}}>Contacts ({event.joined.length})</div>
        <button onClick={copyAll} style={{fontSize:11,padding:"4px 10px",borderRadius:7,border:"1.5px solid #ddd",background:copied==="all"?"#2B8A3E":"#fff",color:copied==="all"?"#fff":"#555",fontWeight:600,cursor:"pointer"}}>{copied==="all"?"✅ Copied!":"📋 Copy all"}</button>
      </div>
      {event.joined.length===0
        ? <div style={{textAlign:"center",color:"#ccc",fontSize:13,padding:"30px 0"}}>No participants yet</div>
        : <div style={{border:"1.5px solid #eee",borderRadius:12,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 32px",background:"#fafafa",padding:"8px 12px",fontSize:10,fontWeight:800,color:"#999",textTransform:"uppercase",gap:8,borderBottom:"1px solid #eee"}}>
              <span>Name</span><span>Email</span><span>Phone</span><span/>
            </div>
            {event.joined.map((p,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 32px",padding:"10px 12px",gap:8,borderBottom:i<event.joined.length-1?"1px solid #f5f5f5":"none",alignItems:"center",background:i%2===0?"#fff":"#fafafa"}}>
                <span style={{fontSize:13,fontWeight:600,color:"#111",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.hostAdded&&<span style={{opacity:.5,marginRight:4}}>✏️</span>}{p.name}</span>
                <span style={{fontSize:12,color:p.email?"#1971C2":"#ccc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.email?<a href={`mailto:${p.email}`} style={{color:"inherit",textDecoration:"none"}}>{p.email}</a>:"--"}</span>
                <span style={{fontSize:12,color:p.phone?"#2B8A3E":"#ccc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.phone?<a href={`tel:${p.phone}`} style={{color:"inherit",textDecoration:"none"}}>{p.phone}</a>:"--"}</span>
                <button onClick={()=>{navigator.clipboard.writeText(`${p.name}\t${p.email||"--"}\t${p.phone||"--"}`).catch(()=>{});setCopied(p.uid);setTimeout(()=>setCopied(null),1500);}} style={{padding:"4px 6px",borderRadius:6,border:"1px solid #eee",background:copied===p.uid?"#2B8A3E":"#fff",color:copied===p.uid?"#fff":"#aaa",fontSize:11,cursor:"pointer"}}>{copied===p.uid?"✓":"📋"}</button>
              </div>
            ))}
          </div>}
      <p style={{fontSize:11,color:"#bbb",marginTop:10,textAlign:"center"}}>Visible to host only.</p>
    </div>
  );
}

//
function EditEventModal({ event, onSave, onClose }) {
  const [form, setForm] = useState({
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    slots: event.slots,
    description: event.description || "",
    deadline: event.deadline ? event.deadline.slice(0,16) : "",
    isPrivate: event.isPrivate || false,
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inp = {width:"100%",padding:"10px 13px",borderRadius:10,border:"1.5px solid #ddd",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  const lbl = {fontSize:12,fontWeight:700,color:"#777",textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:5};

  const save = () => {
    if(!form.title||!form.date||!form.location){alert("Title, date, and location are required.");return;}
    onSave({...event,...form,slots:Number(form.slots),deadline:form.deadline?new Date(form.deadline).toISOString():null});
  };

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.55)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:20,padding:"26px 24px",width:480,maxWidth:"96vw",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:20,color:"#111",marginBottom:20,letterSpacing:-.5}}>✏️ Edit event</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label style={lbl}>Title</label><input value={form.title} onChange={e=>set("title",e.target.value)} style={inp}/></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
            <div><label style={lbl}>Date</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={inp}/></div>
            <div><label style={lbl}>Time</label><input type="time" value={form.time} onChange={e=>set("time",e.target.value)} style={inp}/></div>
          </div>
          <div><label style={lbl}>Location</label><input value={form.location} onChange={e=>set("location",e.target.value)} placeholder="Park, address, or venue" style={inp}/></div>
          <div><label style={lbl}>{event.type==="tournament"?"Slots":"Player slots"}</label><input type="number" min={event.joined.length||1} max={256} value={form.slots} onChange={e=>set("slots",e.target.value)} style={{...inp,width:100}}/></div>
          <div>
            <label style={lbl}>Registration deadline <span style={{color:"#bbb",fontWeight:400,textTransform:"none",fontSize:11}}>(optional)</span></label>
            <input type="datetime-local" value={form.deadline} onChange={e=>set("deadline",e.target.value)} style={inp}/>
          </div>
          <div><label style={lbl}>Description</label><textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={3} style={{...inp,resize:"vertical"}}/></div>
          <div>
            <label style={lbl}>Visibility</label>
            <div style={{display:"flex",gap:10}}>
              {[{val:false,icon:"🌐",label:"Public",desc:"Visible in browse"},{val:true,icon:"🔒",label:"Private",desc:"Link only"}].map(opt=>(
                <button key={String(opt.val)} onClick={()=>set("isPrivate",opt.val)}
                  style={{flex:1,padding:"9px 12px",borderRadius:9,border:`2px solid ${form.isPrivate===opt.val?"#111":"#ddd"}`,background:form.isPrivate===opt.val?"#111":"#fff",color:form.isPrivate===opt.val?"#fff":"#555",cursor:"pointer",textAlign:"left"}}>
                  <div style={{fontSize:15}}>{opt.icon}</div>
                  <div style={{fontSize:13,fontWeight:700,marginTop:2}}>{opt.label}</div>
                  <div style={{fontSize:11,color:form.isPrivate===opt.val?"rgba(255,255,255,.6)":"#aaa"}}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button onClick={onClose} style={{flex:1,padding:10,borderRadius:10,border:"1.5px solid #ddd",background:"#fff",color:"#555",fontWeight:600,fontSize:14,cursor:"pointer"}}>Cancel</button>
          <button onClick={save} style={{flex:2,padding:10,borderRadius:10,border:"none",background:"#111",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

//
// ─── Share with friends ───────────────────────────────────────────────────────
function ShareWithFriends({ event, currentUser }) {
  const [friends, setFriends] = useState([]);
  const [sent, setSent] = useState({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || !currentUser?.uid) return;
    getFirebase().then(fb => {
      fb.getDocs(fb.collection(fb.db,"users",currentUser.uid,"friends")).then(snap => {
        setFriends(snap.docs.map(d=>({id:d.id,...d.data()})).filter(f=>f.status==="accepted"));
      });
    }).catch(()=>{});
  }, [open, currentUser?.uid]);

  const shareWithFriend = async (f) => {
    const friendUid = f.id;
    const friendName = f.fromName===currentUser.displayName ? f.toName : f.fromName;
    try {
      const fb = await getFirebase();
      const shareLink = `${window.location.origin}${window.location.pathname}#event=${event.id}`;
      await fb.addDoc(fb.collection(fb.db,"users",friendUid,"notifications"), {
        type:"event_share", fromUid:currentUser.uid, fromName:currentUser.displayName||"Someone",
        eventId:event.id, eventTitle:event.title, shareLink,
        message:`${currentUser.displayName||"Someone"} shared an event with you: "${event.title}"`,
        ts:Date.now(), read:false
      });
      setSent(s=>({...s,[friendUid]:true}));
    } catch(e) { console.error("Share failed:", e); }
  };

  if (!open) return (
    <button onClick={()=>setOpen(true)} style={{width:"100%",padding:"9px 14px",borderRadius:10,border:"1.5px solid #ddd",background:"#fafafa",color:"#555",fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
      👥 Share with a friend
    </button>
  );

  return (
    <div style={{background:"#F7F7F5",border:"1.5px solid #eee",borderRadius:12,padding:"12px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5}}>Share with friends</div>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:"#aaa",cursor:"pointer",fontSize:16,padding:0}}>✕</button>
      </div>
      {friends.length===0
        ? <div style={{fontSize:13,color:"#aaa",textAlign:"center",padding:"12px 0"}}>No friends yet -- add friends from your profile panel.</div>
        : friends.map(f=>{
            const friendUid = f.id;
            const friendName = f.fromName===currentUser.displayName ? f.toName : f.fromName;
            return (
              <div key={friendUid} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"#F4530D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff",flexShrink:0}}>{friendName?.[0]?.toUpperCase()||"?"}</div>
                <div style={{flex:1,fontSize:13,fontWeight:600,color:"#111"}}>{friendName}</div>
                <button onClick={()=>shareWithFriend(f)} disabled={sent[friendUid]}
                  style={{padding:"6px 12px",borderRadius:8,border:"none",background:sent[friendUid]?"#2B8A3E":"#111",color:"#fff",fontSize:12,fontWeight:700,cursor:sent[friendUid]?"default":"pointer",flexShrink:0}}>
                  {sent[friendUid]?"Sent":"Share"}
                </button>
              </div>
            );
          })
      }
    </div>
  );
}

function EventDetail({ event, currentUser, onJoin, onLeave, onCancel, onUpdateSlots, onUpdateDeadline, onUpdatePlayers, onUpdateEvent, onBack, onAuthRequired }) {
  const s = ALL_SPORT_MAP[event.sport] || { label:event.sport||"Event", color:"#888", bg:"#eee", emoji:"🏅" };
  const pt = event.participantType || (event.type==="tournament"?"teams":"players");
  const ptSingular = pt==="teams"?"team":"player";
  const spotsLeft = event.slots - event.joined.length;
  const isHost = event.host?.uid === currentUser?.uid;
  const isIn   = event.joined.some(j=>j.uid===currentUser?.uid);
  const pastDL = isPastDeadline(event);
  const canLv  = canLeave(event);
  const dl     = fmtDeadline(event);

  const [confirmRemove, setConfirmRemove] = useState(null); // { uid, name }
  const [showCancel, setShowCancel] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showFmtEdit, setShowFmtEdit] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [tab, setTab] = useState("info");
  const [showJoin, setShowJoin] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const [aiLoad, setAiLoad] = useState(false);
  const [editSlots, setEditSlots] = useState(false);
  const [slotsVal, setSlotsVal] = useState(() => String(event.slots));
  const [editDL, setEditDL] = useState(false);
  const [dlVal, setDlVal] = useState(() => event.deadline ? event.deadline.slice(0,16) : "");

  const shareLink = `${window.location.origin}${window.location.pathname}#event=${event.id}`;
  const copyLink = () => { navigator.clipboard.writeText(shareLink).catch(()=>{}); setShareToast(true); setTimeout(()=>setShareToast(false),2200); };

  const getTips = async () => {
    setAiLoad(true);
    try { const t=await callClaude(`Give 3 quick tips for playing ${s.label} in a casual ${event.type==="tournament"?"tournament":"pickup game"}. Short bullet points with emoji. Under 80 words.`); setAiTip(t.trim()); }
    catch { setAiTip("• Play fair!\n• Communicate\n• Have fun"); }
    setAiLoad(false);
  };

  const saveSlots = () => {
    const n=parseInt(slotsVal);
    if(isNaN(n)||n<2||n>256){alert("Enter 2-256");return;}
    if(n<event.joined.length){alert(`Can't go below ${event.joined.length} (current registrations)`);return;}
    onUpdateSlots(event.id,n); setEditSlots(false);
  };

  const saveDL = () => {
    if(dlVal){const d=new Date(dlVal),ev=new Date(event.date+"T"+(event.time||"00:00")); if(d>=ev){alert("Deadline must be before event start");return;}}
    onUpdateDeadline(event.id, dlVal?new Date(dlVal).toISOString():null); setEditDL(false);
  };

  const tabs = [
    {id:"info",label:"Info"},
    {id:"chat",label:"Chat 💬"},
    ...(event.type==="tournament"?[{id:"bracket",label:"Bracket 🏆"}]:[]),
    ...(isHost||isIn?[{id:"contacts",label:"Contacts 📇"}]:[]),
  ];

  return (
    <div style={{maxWidth:660,margin:"0 auto",padding:"24px 16px"}}>
      {showJoin&&<JoinModal event={event} currentUser={currentUser} onConfirm={p=>{onJoin(event.id,p);setShowJoin(false);}} onClose={()=>setShowJoin(false)}/>}
      {showAdd&&<HostAddModal event={event} onConfirm={p=>{onJoin(event.id,p);setShowAdd(false);}} onClose={()=>setShowAdd(false)}/>}
      {showEdit&&<EditEventModal event={event} onSave={ev=>{onUpdateEvent(ev);setShowEdit(false);}} onClose={()=>setShowEdit(false)}/>}

      <button onClick={onBack} style={{background:"none",border:"none",color:"#888",fontSize:13,cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:4,fontFamily:"inherit"}}>← Back</button>

      {/* Inline remove/leave confirm modal */}
      {confirmRemove&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.45)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setConfirmRemove(null)}>
          <div style={{background:"#fff",borderRadius:16,padding:"24px 22px",width:320,maxWidth:"92vw",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:17,color:"#111",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>
              {confirmRemove.isSelf?"Leave this event?":"Remove participant?"}
            </div>
            <p style={{fontSize:13,color:"#666",margin:"0 0 18px"}}>
              {confirmRemove.isSelf
                ? "You won't be able to rejoin if the event fills up."
                : <>Are you sure you want to remove <strong>{confirmRemove.name}</strong>?</>}
            </p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setConfirmRemove(null)} style={{flex:1,padding:"9px",borderRadius:9,border:"1.5px solid #ddd",background:"#fff",color:"#555",fontWeight:600,fontSize:14,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>{onLeave(event.id,confirmRemove.uid);setConfirmRemove(null);}} style={{flex:1,padding:"9px",borderRadius:9,border:"none",background:"#C92A2A",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                {confirmRemove.isSelf?"Leave":"Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel event confirm modal */}
      {showCancel&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.45)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowCancel(false)}>
          <div style={{background:"#fff",borderRadius:16,padding:"24px 22px",width:340,maxWidth:"92vw",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:17,color:"#111",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Cancel this event?</div>
            <p style={{fontSize:13,color:"#666",margin:"0 0 18px"}}>This will permanently remove <strong>{event.title}</strong> and cannot be undone. All registered participants will lose their spots.</p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowCancel(false)} style={{flex:1,padding:"9px",borderRadius:9,border:"1.5px solid #ddd",background:"#fff",color:"#555",fontWeight:600,fontSize:14,cursor:"pointer"}}>Keep event</button>
              <button onClick={()=>{onCancel(event.id);setShowCancel(false);onBack();}} style={{flex:1,padding:"9px",borderRadius:9,border:"none",background:"#C92A2A",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Cancel event</button>
            </div>
          </div>
        </div>
      )}

      {dl&&<div style={{background:dl.past?"#FFF5F5":"#FFFBEB",border:`1px solid ${dl.past?"#C92A2A33":"#FFD43B55"}`,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:16}}>{dl.past?"🔒":"⏰"}</span>
        <span style={{flex:1,fontSize:13,fontWeight:600,color:dl.past?"#C92A2A":"#856404"}}>{dl.text}</span>
      </div>}

      <div style={{background:"#fff",border:"1.5px solid #eee",borderRadius:20,overflow:"hidden"}}>
        <div style={{background:s.bg,padding:"24px 24px 0",borderBottom:"1.5px solid #eee"}}>
          <div style={{display:"flex",gap:8,marginBottom:10}}><SportBadge sportId={event.sport}/></div>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:24,color:"#111",letterSpacing:-.5}}>{event.title}</div>
            {isHost&&<button onClick={()=>setShowEdit(true)} style={{flexShrink:0,marginTop:4,padding:"5px 12px",borderRadius:8,border:"1.5px solid #ddd",background:"#fff",color:"#555",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>✏️ Edit</button>}
          </div>
          <div style={{fontSize:13,color:"#666",marginTop:6,marginBottom:16,lineHeight:1.8}}>
            <div>📅 {event.date} · {event.time}</div>
            <div>📍 {event.location}</div>
            <div>👤 Hosted by <strong>{event.host?.name||event.host}</strong></div>
            {event.type==="tournament" && (
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                <span>🏆 {FORMATS.find(f=>f.id===event.tournamentFormat)?.label||"Single Elimination"}</span>
                <span style={{color:"#bbb",fontSize:11}}>· {event.participantType==="teams"?"Teams":"Individual players"}</span>
                {isHost && (
                  <button onClick={()=>setShowFmtEdit(s=>!s)}
                    style={{marginLeft:4,fontSize:11,padding:"2px 8px",borderRadius:6,border:"1.5px solid #ddd",background:"#fff",color:"#888",cursor:"pointer",fontWeight:600}}>
                    Change
                  </button>
                )}
              </div>
            )}
            {showFmtEdit && isHost && (
              <div style={{marginTop:10,background:"#f7f7f5",borderRadius:10,padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Change format</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {FORMATS.map(f=>(
                    <button key={f.id} onClick={()=>{onUpdateEvent({...event,tournamentFormat:f.id});setShowFmtEdit(false);}}
                      style={{padding:"7px 14px",borderRadius:9,border:`1.5px solid ${event.tournamentFormat===f.id?"#111":"#ddd"}`,background:event.tournamentFormat===f.id?"#111":"#fff",color:event.tournamentFormat===f.id?"#fff":"#555",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                      {f.id==="single"?"⚔️":f.id==="double"?"🔁":"🔄"} {f.label}
                    </button>
                  ))}
                </div>
                <div style={{fontSize:11,color:"#aaa"}}>Changing format resets any active bracket in the Bracket tab.</div>
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:0,borderTop:"1px solid rgba(0,0,0,.07)",overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
            {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 14px",border:"none",background:"transparent",fontSize:13,fontWeight:tab===t.id?700:500,color:tab===t.id?"#111":"#999",cursor:"pointer",borderBottom:`2px solid ${tab===t.id?"#111":"transparent"}`,transition:"all .15s",whiteSpace:"nowrap",flexShrink:0}}>{t.label}</button>)}
          </div>
        </div>

        <div style={{padding:"20px 24px"}}>
          {tab==="info"&&(
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {event.description&&<div><div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:7}}>About</div><p style={{fontSize:14,color:"#444",lineHeight:1.65,margin:0}}>{event.description}</p></div>}
              {event.lat&&<div><div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Location</div><MapView lat={event.lat} lng={event.lng} label={event.location}/></div>}

              {/* Join button — above share link */}
              {spotsLeft>0&&!isIn&&!isHost&&!pastDL&&<button onClick={()=>{if(!currentUser){onAuthRequired();return;}setShowJoin(true);}} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:s.color,color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:`0 4px 20px ${s.color}55`}}>{event.type==="tournament"?`Register ${ptSingular} →`:"Join game →"}</button>}

              {/* Share with friends */}
              {currentUser && <ShareWithFriends event={event} currentUser={currentUser}/>}

              {/* Share + Privacy */}
              <div style={{background:"#F7F7F5",border:"1.5px solid #eee",borderRadius:12,padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
                {/* Privacy toggle -- host only */}
                {isHost && (
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,flex:1}}>Visibility</span>
                    <div style={{display:"flex",gap:6}}>
                      {[{val:false,icon:"🌐",label:"Public"},{val:true,icon:"🔒",label:"Private"}].map(opt=>(
                        <button key={String(opt.val)} onClick={()=>onUpdateEvent({...event,isPrivate:opt.val})}
                          style={{padding:"4px 12px",borderRadius:7,border:`1.5px solid ${event.isPrivate===opt.val?"#111":"#ddd"}`,background:event.isPrivate===opt.val?"#111":"#fff",color:event.isPrivate===opt.val?"#fff":"#666",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                          {opt.icon} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Privacy status badge for non-hosts */}
                {!isHost && event.isPrivate && (
                  <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#856404",fontWeight:600}}>
                    🔒 Private event -- invite only
                  </div>
                )}
                {/* Shareable link */}
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>
                      {event.isPrivate ? "🔒 Private link -- share to invite" : "Shareable link"}
                    </div>
                    <div style={{fontSize:12,color:"#555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shareLink}</div>
                  </div>
                  <button onClick={copyLink} style={{flexShrink:0,padding:"7px 14px",borderRadius:8,border:"1.5px solid #ddd",background:shareToast?"#2B8A3E":"#fff",color:shareToast?"#fff":"#111",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap"}}>{shareToast?"✅ Copied!":"📋 Copy link"}</button>
                </div>
              </div>

              {/* Deadline (host only) */}
              {isHost&&<div style={{background:"#F7F7F5",border:"1.5px solid #eee",borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Registration deadline</div>
                {editDL
                  ? <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      <input type="datetime-local" value={dlVal} onChange={e=>setDlVal(e.target.value)} style={{flex:1,padding:"8px 10px",borderRadius:8,border:"1.5px solid #FFD43B",fontSize:13,outline:"none",fontFamily:"inherit",minWidth:180}}/>
                      <button onClick={saveDL} style={{padding:"8px 14px",borderRadius:8,border:"none",background:"#111",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Save</button>
                      <button onClick={()=>setEditDL(false)} style={{padding:"8px 10px",borderRadius:8,border:"1px solid #ddd",background:"#fff",color:"#888",fontSize:12,cursor:"pointer"}}>Cancel</button>
                      {dlVal&&<button onClick={()=>setDlVal("")} style={{padding:"8px 10px",borderRadius:8,border:"1px solid #C92A2A33",background:"#fff",color:"#C92A2A",fontSize:12,cursor:"pointer"}}>Remove</button>}
                    </div>
                  : <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{flex:1,fontSize:13,color:event.deadline?(pastDL?"#C92A2A":"#856404"):"#bbb"}}>{event.deadline?dl?.text:"No deadline set"}</span>
                      <button onClick={()=>{setDlVal(event.deadline?event.deadline.slice(0,16):"");setEditDL(true);}} style={{padding:"5px 12px",borderRadius:7,border:"1px solid #FFD43B88",background:"#FFFBEB",color:"#856404",fontSize:11,fontWeight:700,cursor:"pointer"}}>✏️ {event.deadline?"Edit":"Set deadline"}</button>
                    </div>}
              </div>}

              {/* Roster */}
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5}}>{pt.charAt(0).toUpperCase()+pt.slice(1)}</div>
                  {editSlots
                    ? <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:4}}>
                        <span style={{fontSize:12,color:"#888"}}>{event.joined.length}/</span>
                        <input type="number" min={event.joined.length} max={256} value={slotsVal} onChange={e=>setSlotsVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveSlots();if(e.key==="Escape")setEditSlots(false);}} autoFocus style={{width:60,padding:"3px 7px",borderRadius:7,border:"1.5px solid #FFD43B",fontSize:13,outline:"none",fontFamily:"inherit",textAlign:"center"}}/>
                        <button onClick={saveSlots} style={{padding:"3px 10px",borderRadius:7,border:"none",background:"#111",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Save</button>
                        <button onClick={()=>{setEditSlots(false);setSlotsVal(String(event.slots));}} style={{padding:"3px 8px",borderRadius:7,border:"1px solid #ddd",background:"#fff",color:"#888",fontSize:12,cursor:"pointer"}}>✕</button>
                      </div>
                    : <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:4}}>
                        <span style={{fontSize:12,color:"#666"}}>({event.joined.length}/{event.slots})</span>
                        {isHost&&<button onClick={()=>{setEditSlots(true);setSlotsVal(String(event.slots));}} style={{fontSize:11,padding:"2px 8px",borderRadius:6,border:"1px solid #FFD43B88",background:"#FFFBEB",color:"#856404",cursor:"pointer",fontWeight:600}}>✏️ Edit</button>}
                      </div>}
                </div>

                {event.joined.map((p,i) => {
                  if (event.type==="tournament") {
                    return <TeamRow key={p.uid||i} event={event} team={p} currentUser={currentUser} isHost={isHost} deadlinePassed={pastDL}
                      onUpdatePlayers={onUpdatePlayers} onRemove={uid=>setConfirmRemove({uid, name:event.joined.find(j=>j.uid===uid)?.name||"this team"})}/>;
                  }
                  const me = p.uid===currentUser?.uid;
                  return (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:me?"#EEF5FF":"#fafafa",border:`1.5px solid ${me?"#1971C222":"#f0f0f0"}`,borderRadius:10,padding:"8px 12px",marginBottom:6}}>
                      <span style={{fontSize:15}}>👤</span>
                      <span style={{flex:1,fontSize:13,fontWeight:600,color:"#111"}}>{p.name}{me?" (you)":""}{p.hostAdded&&<span style={{marginLeft:6,fontSize:10,color:"#aaa",background:"#eee",borderRadius:4,padding:"1px 5px"}}>host added</span>}</span>
                      {isHost&&!me&&<button onClick={()=>setConfirmRemove({uid:p.uid,name:p.name})} style={{fontSize:11,color:"#C92A2A",background:"none",border:"1px solid #C92A2A33",borderRadius:6,padding:"2px 8px",cursor:"pointer"}}>Remove</button>}
                      {me&&!isHost&&(canLv?<button onClick={()=>setConfirmRemove({uid:p.uid,name:"yourself",isSelf:true})} style={{fontSize:11,color:"#C92A2A",background:"none",border:"1px solid #C92A2A33",borderRadius:6,padding:"2px 8px",cursor:"pointer"}}>Leave</button>:<span style={{fontSize:10,color:"#bbb"}}>{pastDL?"Deadline passed":"Locked"}</span>)}
                    </div>
                  );
                })}
                {Array(Math.max(0,spotsLeft)).fill(null).map((_,i)=>(
                  <div key={"o"+i} style={{display:"flex",alignItems:"center",gap:8,background:"#fafafa",border:"1.5px dashed #e0e0e0",borderRadius:10,padding:"8px 12px",marginBottom:6}}>
                    <span style={{fontSize:13,color:"#ccc",flex:1}}>-- Open spot</span>
                    {isHost&&<button onClick={()=>setShowAdd(true)} style={{fontSize:11,color:"#856404",background:"#FFFBEB",border:"1px solid #FFD43B88",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap"}}>✏️ Add {ptSingular}</button>}
                  </div>
                ))}

                {isHost&&spotsLeft===0&&<div style={{fontSize:12,color:"#aaa",textAlign:"center",marginBottom:4}}>Full -- increase capacity above to add more</div>}

                {spotsLeft>0&&!isIn&&!isHost&&pastDL&&<div style={{textAlign:"center",fontSize:13,color:"#C92A2A",fontWeight:600,padding:10,background:"#FFF5F5",borderRadius:10}}>🔒 Registration closed</div>}
                {spotsLeft===0&&!isIn&&!isHost&&<div style={{color:"#C92A2A",fontWeight:700,fontSize:13,marginTop:4}}>❌ This event is full</div>}
              </div>

              {isHost&&(
                <button onClick={()=>setShowCancel(true)} style={{width:"100%",padding:11,borderRadius:11,border:"1.5px solid #C92A2A33",background:"#FFF5F5",color:"#C92A2A",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  🗑️ Cancel this event
                </button>
              )}
              {isHost&&event.joined.length>0&&(
                <button onClick={()=>setShowTransfer(true)} style={{width:"100%",padding:11,borderRadius:11,border:"1.5px solid #ddd",background:"#fafafa",color:"#555",fontWeight:600,fontSize:13,cursor:"pointer"}}>
                  👑 Transfer host role
                </button>
              )}
              {showTransfer&&(
                <div style={{background:"#fff",border:"1.5px solid #eee",borderRadius:14,padding:"16px"}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#111",marginBottom:4}}>Transfer host to:</div>
                  <p style={{fontSize:12,color:"#888",margin:"0 0 12px"}}>They will gain full host controls. You will become a regular participant.</p>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {event.joined.map(p=>(
                      <button key={p.uid} onClick={()=>{
                        onUpdateEvent({...event,host:{uid:p.uid,name:p.name},hostUid:p.uid});
                        setShowTransfer(false);
                      }} style={{padding:"10px 14px",borderRadius:10,border:"1.5px solid #eee",background:"#fff",color:"#111",fontWeight:600,fontSize:13,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8}}
                        onMouseEnter={e=>e.currentTarget.style.background="#f5f5f5"}
                        onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                        <span style={{width:28,height:28,borderRadius:"50%",background:"#111",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{p.name?.[0]?.toUpperCase()||"?"}</span>
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={()=>setShowTransfer(false)} style={{marginTop:10,width:"100%",padding:8,borderRadius:9,border:"1px solid #eee",background:"#fff",color:"#aaa",fontSize:12,cursor:"pointer"}}>Cancel</button>
                </div>
              )}

              <button onClick={getTips} disabled={aiLoad} style={{width:"100%",padding:11,borderRadius:11,border:"1.5px solid #D0A8F5",background:"#F8F0FF",color:"#7B2FBE",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                {aiLoad?"✨ Loading tips...":`✨ Get AI tips for ${s.label}`}
              </button>
              {aiTip&&<div style={{background:"#F8F0FF",border:"1px solid #D0A8F5",borderRadius:12,padding:"14px 16px",fontSize:13,color:"#4A1090",lineHeight:1.8,whiteSpace:"pre-line"}}>{aiTip}</div>}
            </div>
          )}
          {tab==="chat"&&<Chat eventId={event.id} currentUser={currentUser} event={event}/>}
          {tab==="bracket"&&event.type==="tournament"&&<BracketView event={event} isHost={isHost}/>}
          {tab==="contacts"&&(isHost||isIn)&&<ContactsTab event={event} isHost={isHost}/>}
        </div>
      </div>
    </div>
  );
}

//

//
function SportFilter({ value, onChange, surfaceBg, surfaceBorder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options = [
    { id:"all", label:"All events", emoji:null },
    ...SPORTS.map(s => ({ id:s.id, label:s.label, emoji:s.emoji, color:s.color })),
    ...WELLNESS_EVENTS.map(w => ({ id:w.id, label:w.label, emoji:w.icon, color:w.color })),
  ];
  const selected = options.find(o => o.id === value) || options[0];

  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:9,border:`1px solid ${surfaceBorder}`,fontSize:13,background:surfaceBg,color:"#fff",cursor:"pointer",fontFamily:"inherit",outline:"none",whiteSpace:"nowrap"}}>
        {selected.id==="pickleball" ? <PickleballIcon size={16}/> : selected.emoji ? <span>{selected.emoji}</span> : null}
        {selected.label}
        <span style={{marginLeft:4,opacity:.5,fontSize:10}}>▾</span>
      </button>
      {open && (
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,minWidth:160,background:"#1a1a2e",border:`1px solid ${surfaceBorder}`,borderRadius:10,overflow:"hidden",zIndex:200,boxShadow:"0 8px 24px rgba(0,0,0,.4)"}}>
          {options.map(o => (
            <button key={o.id} onClick={()=>{onChange(o.id);setOpen(false);}}
              style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"9px 14px",background:value===o.id?"rgba(255,255,255,.12)":"transparent",color:"#fff",border:"none",fontSize:13,fontFamily:"inherit",cursor:"pointer",textAlign:"left",transition:"background .12s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"}
              onMouseLeave={e=>e.currentTarget.style.background=value===o.id?"rgba(255,255,255,.12)":"transparent"}>
              {o.id==="pickleball" ? <PickleballIcon size={16}/> : o.emoji ? <span style={{fontSize:16}}>{o.emoji}</span> : null}
              {o.label}
              {value===o.id && <span style={{marginLeft:"auto",fontSize:11,opacity:.6}}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

//
function HomePage({ events, onOpen, setPage, mode, currentUser, prefs, loading, onBackToModes, firestoreError }) {
  const m = MODES[mode] || MODES.pickup;
  const [q, setQ] = useState("");
  const [sport, setSport] = useState("all");

  const hasLoc = prefs?.locCoords?.lat != null;
  const radius = prefs?.radius || 25;

  const filtered = events.filter(e => {
    if (e.isPrivate) {
      if (!currentUser) return false;
      if (e.host?.uid !== currentUser.uid && !e.joined?.some(j=>j.uid===currentUser.uid)) return false;
    }
    const ql=q.toLowerCase();
    if (!(e.title.toLowerCase().includes(ql)||e.location.toLowerCase().includes(ql))) return false;
    if (sport!=="all"&&e.sport!==sport) return false;
    if (hasLoc && e.lat && e.lng) {
      const d = distanceMiles(prefs.locCoords.lat, prefs.locCoords.lng, e.lat, e.lng);
      if (d > radius) return false;
    }
    return true;
  }).sort((a, b) => {
    const da = new Date(`${a.date}T${a.time||"00:00"}`);
    const db = new Date(`${b.date}T${b.time||"00:00"}`);
    return da - db;
  });
  const surfaceBg = "rgba(255,255,255,.11)";
  const surfaceBorder = "rgba(255,255,255,.18)";
  return (
    <div style={{maxWidth:700,margin:"0 auto",padding:"28px 16px"}}>
      {firestoreError && (
        <div style={{background:"rgba(201,42,42,.15)",border:"1.5px solid rgba(201,42,42,.4)",borderRadius:12,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#ff8080"}}>
          ⚠️ Could not load events: <strong>{firestoreError}</strong>. Check your Firestore rules and connection.
        </div>
      )}
      <div style={{marginBottom:24}}>
        <h1 style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:30,color:"#fff",margin:"0 0 6px",letterSpacing:-1}}>
          {mode==="pickup" ? "Find a pickup event" : "Find a tournament"}
        </h1>
        <p style={{color:"rgba(255,255,255,.45)",fontSize:14,margin:0}}>
          {hasLoc ? `📍 Within ${radius} mi of ${prefs.locLabel}` : m.tagline}
        </p>
      </div>
      {/* Search bar -- lighter than bg */}
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍  Search by title or location..."
        style={{padding:"12px 16px",borderRadius:12,border:`1.5px solid ${surfaceBorder}`,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:surfaceBg,color:"#fff",width:"100%"}}/>
      {/* Filter row */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"12px 0 20px",alignItems:"center"}}>
        <SportFilter value={sport} onChange={setSport} surfaceBg={surfaceBg} surfaceBorder={surfaceBorder}/>
        <div style={{marginLeft:"auto",fontSize:13,color:"rgba(255,255,255,.4)",display:"flex",alignItems:"center"}}>{filtered.length} event{filtered.length!==1?"s":""}</div>
      </div>
      {/* Event cards */}
      <div style={{display:"grid",gap:14}}>
        {loading
          ? [1,2,3].map(i => <EventCardSkeleton key={i}/>)
          : filtered.length===0
          ? <div style={{textAlign:"center",padding:"50px 20px",color:"rgba(255,255,255,.3)"}}>
              <div style={{fontSize:40,marginBottom:12,display:"flex",justifyContent:"center",color:"rgba(255,255,255,.3)"}}><TabIcon id="create" size={44}/></div>
              <div style={{fontWeight:600,color:"rgba(255,255,255,.5)",fontSize:16}}>No events found</div>
              <div style={{fontSize:13,marginTop:8}}>Be the first -- <span style={{color:m.accent,cursor:"pointer",fontWeight:600}} onClick={()=>setPage("create")}>create one!</span></div>
            </div>
          : filtered.map(e=><EventCard key={e.id} event={e} onClick={()=>onOpen(e)} mode={mode}/>)}
      </div>
    </div>
  );
}

//
// Pickleball icon -- two crossed blue paddles + yellow ball (like reference image)
function PickleballIcon({ size=28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left paddle -- shifted right toward center */}
      <g transform="rotate(-28 20 28)">
        <rect x="7" y="8" width="14" height="16" rx="4" fill="#1560BD" stroke="#0A3D8F" strokeWidth="0.6"/>
        <rect x="12.5" y="22.5" width="3" height="7" rx="1.5" fill="#7B4A1E"/>
      </g>
      {/* Right paddle -- shifted left toward center */}
      <g transform="rotate(28 20 28)">
        <rect x="19" y="8" width="14" height="16" rx="4" fill="#1560BD" stroke="#0A3D8F" strokeWidth="0.6"/>
        <rect x="24.5" y="22.5" width="3" height="7" rx="1.5" fill="#7B4A1E"/>
      </g>
      {/* Ball -- nestled in V, no contact */}
      <circle cx="20" cy="14" r="5" fill="#F5D200" stroke="#C8A000" strokeWidth="0.7"/>
      <circle cx="18.2" cy="12.5" r="0.85" fill="#C8A000" opacity="0.7"/>
      <circle cx="21.8" cy="12.5" r="0.85" fill="#C8A000" opacity="0.7"/>
      <circle cx="20"   cy="15.5" r="0.85" fill="#C8A000" opacity="0.7"/>
      <circle cx="17.8" cy="15.2" r="0.65" fill="#C8A000" opacity="0.5"/>
      <circle cx="22.2" cy="15.2" r="0.65" fill="#C8A000" opacity="0.5"/>
      <circle cx="20"   cy="11.2" r="0.65" fill="#C8A000" opacity="0.5"/>
    </svg>
  );
}

// Benchpress + spotter icon
function BenchpressIcon({ size=24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Barbell */}
      <rect x="4" y="12" width="28" height="3" rx="1.5" fill="currentColor" opacity="0.8"/>
      {/* Left weight plate */}
      <rect x="2" y="9" width="4" height="9" rx="1.5" fill="currentColor"/>
      {/* Right weight plate */}
      <rect x="30" y="9" width="4" height="9" rx="1.5" fill="currentColor"/>
      {/* Lifter torso -- lying on bench */}
      <rect x="10" y="14" width="12" height="5" rx="2" fill="currentColor" opacity="0.7"/>
      {/* Arms pushing up */}
      <line x1="14" y1="14" x2="14" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="22" y1="14" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      {/* Bench */}
      <rect x="9" y="19" width="14" height="2.5" rx="1" fill="currentColor" opacity="0.5"/>
      {/* Spotter head */}
      <circle cx="18" cy="6" r="2.5" fill="currentColor" opacity="0.85"/>
      {/* Spotter hands on bar */}
      <line x1="14" y1="8" x2="14" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="22" y1="8" x2="22" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

const WELLNESS_EVENTS = [
  { id:"cardio",  label:"Cardio",  icon:"🏃", color:"#E8590C" },
  { id:"gym",     label:"Gym Sesh",icon:null,  color:"#7B2FBE", svgIcon:"benchpress" },
  { id:"cycling", label:"Cycling", icon:"🚴", color:"#D4A017" },
  { id:"walk",    label:"Walk",    icon:"🚶", color:"#2B8A3E" },
  { id:"yoga",    label:"Yoga",    icon:"🧘", color:"#1560BD" },
];

function SportPicker({ mode, onPick }) {
  const m = MODES[mode] || MODES.pickup;
  return (
    <div style={{maxWidth:620,margin:"0 auto",padding:"24px 14px"}}>
      <h1 style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:26,color:"#fff",margin:"0 0 8px",letterSpacing:-1}}>What event?</h1>
      <p style={{color:"rgba(255,255,255,.4)",fontSize:14,margin:"0 0 28px"}}>Pick an event to get started</p>

      {/* Sports bubbles */}
      <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:.8,marginBottom:12}}>Sports</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center",marginBottom:28}}>
        {SPORTS.map(s => {
          return (
            <button key={s.id} onClick={()=>onPick(s.id)}
              style={{padding:"13px 20px",borderRadius:99,border:`2px solid ${s.color}55`,background:`${s.color}18`,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all .18s",boxShadow:`0 2px 12px ${s.color}22`}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${s.color}44`;e.currentTarget.style.borderColor=s.color;e.currentTarget.style.transform="scale(1.06)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${s.color}18`;e.currentTarget.style.borderColor=`${s.color}55`;e.currentTarget.style.transform="scale(1)";}}>
              {s.id==="pickleball"
                ? <span style={{display:"flex",alignItems:"center"}}><PickleballIcon size={22}/></span>
                : <span style={{fontSize:22}}>{s.emoji}</span>}
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Custom event button -- white */}
      <div style={{textAlign:"center",marginBottom:28}}>
        <button onClick={()=>onPick("custom")}
          style={{padding:"13px 32px",borderRadius:12,border:"1.5px solid rgba(255,255,255,.6)",background:"#fff",color:"#111",fontSize:14,fontWeight:700,cursor:"pointer",transition:"all .18s"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.9)";e.currentTarget.style.transform="scale(1.03)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.transform="scale(1)";}}>
          ✏️ Custom event
        </button>
      </div>

      {/* Wellness / activity bubbles */}
      <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:.8,marginBottom:12}}>Activities</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center"}}>
        {WELLNESS_EVENTS.map(w => {
          return (
            <button key={w.id} onClick={()=>onPick(w.id)}
              style={{padding:"13px 20px",borderRadius:99,border:`2px solid ${w.color}55`,background:`${w.color}18`,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all .18s",boxShadow:`0 2px 12px ${w.color}22`}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${w.color}44`;e.currentTarget.style.borderColor=w.color;e.currentTarget.style.transform="scale(1.06)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${w.color}18`;e.currentTarget.style.borderColor=`${w.color}55`;e.currentTarget.style.transform="scale(1)";}}>
              {w.svgIcon==="benchpress"
                ? <span style={{display:"flex",alignItems:"center",color:"#fff"}}><BenchpressIcon size={24}/></span>
                : <span style={{fontSize:22}}>{w.icon}</span>}
              {w.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

//
function CreatePage({ onCreated, currentUser, onAuthRequired, mode }) {
  const m = MODES[mode] || MODES.pickup;
  const lockedType = mode === "pickup" ? "pickup" : "tournament";
  const isPickup = mode === "pickup";

  // For pickup: start with sport picker; null = not yet chosen
  const [chosenSport, setChosenSport] = useState(() => isPickup ? null : "basketball");

  const [form, setForm] = useState({title:"",sport:"basketball",type:lockedType,date:"",time:"",locObj:null,locText:"",slots:10,description:"",tournamentFormat:"single",participantType:"teams",deadline:"",isPrivate:false});
  const [aiLoad, setAiLoad] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const pickSport = (sportId) => {
    setChosenSport(sportId);
    const isCustom = sportId === "custom";
    const isKnownSport = !!SPORT_MAP[sportId];
    const isWellness = !!WELLNESS_EVENTS?.find(w => w.id === sportId);
    // Always store the id — ALL_SPORT_MAP is keyed by id
    set("sport", isCustom ? "" : sportId);
  };

  const genAI = async () => {
    setAiLoad(true);
    const sl = chosenSport === "custom" ? "custom sport" : (SPORT_MAP[form.sport]?.label || form.sport);
    try { const t=await callClaude(`Write a short exciting 2-sentence description for a ${form.type==="tournament"?"tournament":"pickup game"} of ${sl}. Energetic, welcoming. Under 80 words.`); set("description",t.trim()); }
    catch { set("description",`Join us for a great pickup game! All levels welcome.`); }
    setAiLoad(false);
  };

  const submit = async () => {
    if(!currentUser){onAuthRequired();return;}
    const loc = form.locObj?.address || (form.locText||"").trim();
    if(!form.title||!form.date||!loc){alert("Please fill in title, date, and location.");return;}
    if(form.deadline){const d=new Date(form.deadline),ev=new Date(form.date+"T"+(form.time||"00:00")); if(d>=ev){alert("Deadline must be before event start");return;}}
    const ev={...form,id:"e"+Date.now(),joined:[],host:{uid:currentUser.uid,name:currentUser.displayName||"Player"},location:loc,lat:form.locObj?.lat||null,lng:form.locObj?.lng||null,slots:Number(form.slots),deadline:form.deadline||null,participantType:form.type==="tournament"?form.participantType:"players"};
    // Navigate away immediately — Firestore write happens in background
    // Reset form state before navigating
    setChosenSport(isPickup ? null : "basketball");
    setForm({title:"",sport:"basketball",type:lockedType,date:"",time:"",locObj:null,locText:"",slots:10,description:"",tournamentFormat:"single",participantType:"teams",deadline:"",isPrivate:false});
    onCreated(ev);
  };

  const lbl={fontSize:12,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:5};
  const inp={width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid rgba(255,255,255,.15)`,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"rgba(255,255,255,.1)",color:"#fff"};

  // Pickup flow: show sport picker first
  if (isPickup && chosenSport === null) {
    return <SportPicker mode={mode} onPick={pickSport}/>;
  }

  const selectedSport = SPORT_MAP[form.sport];

  return (
    <div style={{maxWidth:600,margin:"0 auto",padding:"24px 16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
        {isPickup && (
          <button onClick={()=>setChosenSport(null)} style={{background:"none",border:"none",color:"rgba(255,255,255,.5)",fontSize:22,cursor:"pointer",padding:"0 8px 0 0",lineHeight:1}}>‹</button>
        )}
        <h1 style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:26,color:"#fff",margin:0,letterSpacing:-1}}>
          {mode==="pickup" ? `Create a ${chosenSport==="custom"?"custom":selectedSport?.label||""} pickup` : "Create a tournament"}
        </h1>
      </div>
      <p style={{color:"rgba(255,255,255,.4)",fontSize:14,margin:"0 0 24px 0"}}>{m.tagline}</p>
      <div style={{background:"rgba(255,255,255,.06)",border:`1.5px solid rgba(255,255,255,.12)`,borderRadius:18,padding:"24px 22px",display:"flex",flexDirection:"column",gap:16}}>
        {/* Tournament-only fields */}
        {lockedType==="tournament"&&<>
          <div>
            <label style={lbl}>Format</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {FORMATS.map(f=><button key={f.id} onClick={()=>set("tournamentFormat",f.id)} style={{padding:"7px 12px",borderRadius:9,border:`1.5px solid ${form.tournamentFormat===f.id?m.accent:"rgba(255,255,255,.15)"}`,background:form.tournamentFormat===f.id?m.accent:"rgba(255,255,255,.06)",color:form.tournamentFormat===f.id?"#fff":"rgba(255,255,255,.7)",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                {f.id==="single"?"⚔️":f.id==="double"?"🔁":"🔄"} {f.label}<span style={{display:"block",fontSize:10,fontWeight:400,opacity:.7}}>{f.desc}</span>
              </button>)}
            </div>
          </div>
          <div>
            <label style={lbl}>Participants are</label>
            <div style={{display:"flex",gap:10}}>
              {[
                { id:"teams", label:"Teams", icon:(
                  <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
                    {/* Three person silhouettes side by side */}
                    <circle cx="6"  cy="5" r="3" fill="#ccc"/>
                    <path d="M1 15c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    <circle cx="14" cy="5" r="3" fill="#ccc"/>
                    <path d="M9 15c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    <circle cx="22" cy="5" r="3" fill="#ccc"/>
                    <path d="M17 15c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  </svg>
                )},
                { id:"players", label:"Individual players", icon:(
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                    <circle cx="7" cy="5" r="3.5" fill="#ccc"/>
                    <path d="M1 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  </svg>
                )},
              ].map(pt=>(
                <button key={pt.id} onClick={()=>set("participantType",pt.id)} style={{flex:1,padding:"9px 10px",borderRadius:10,border:`2px solid ${form.participantType===pt.id?m.accent:"rgba(255,255,255,.12)"}`,background:form.participantType===pt.id?m.accent:"rgba(255,255,255,.06)",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {pt.icon}{pt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Sport picker for tournament */}
          <div>
            <label style={lbl}>Sport</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {SPORTS.map(s=><button key={s.id} onClick={()=>set("sport",s.id)} style={{padding:"7px 13px",borderRadius:9,border:`2px solid ${form.sport===s.id?s.color:"rgba(255,255,255,.12)"}`,background:form.sport===s.id?`${s.color}33`:"rgba(255,255,255,.06)",color:form.sport===s.id?s.color:"rgba(255,255,255,.6)",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>{s.id==="pickleball"?<PickleballIcon size={18}/>:s.emoji} {s.label}</button>)}
            </div>
          </div>
        </>}
        {/* Custom sport name for pickup custom events */}
        {isPickup && chosenSport==="custom" && (
          <div><label style={lbl}>Sport / Activity name</label><input value={form.title.startsWith("[")?"":(form.sport||"")} onChange={e=>set("sport",e.target.value)} placeholder="e.g. Dodgeball, Ultimate Frisbee..." style={inp}/></div>
        )}
        <div><label style={lbl}>Event title</label><input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Saturday Morning Run" style={inp}/></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
          <div><label style={lbl}>Date</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Time</label><input type="time" value={form.time} onChange={e=>set("time",e.target.value)} style={inp}/></div>
        </div>
        <div>
          <label style={lbl}>Location</label>
          <LocationSearch
            value={form.locObj}
            onChange={v=>{set("locObj",v);set("locText",v.address);}}
            onTextChange={v=>set("locText",v)}
          />
          {form.locObj?.lat&&<div style={{marginTop:10}}><MapView lat={form.locObj.lat} lng={form.locObj.lng} label={form.locObj.address}/></div>}
        </div>
        <div><label style={lbl}>{lockedType==="tournament"?(form.participantType==="teams"?"Number of teams":"Number of players"):"Player slots"}</label><input type="number" min={2} max={64} value={form.slots} onChange={e=>set("slots",e.target.value)} style={{...inp,width:120}}/></div>
        <div>
          <label style={lbl}>Registration deadline <span style={{color:"rgba(255,255,255,.25)",fontWeight:400,fontSize:11,textTransform:"none"}}>(optional)</span></label>
          <input type="datetime-local" value={form.deadline} onChange={e=>set("deadline",e.target.value)} style={inp}/>
          <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:4}}>After this time, participants can't join, leave, or edit.</div>
        </div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <label style={{...lbl,margin:0}}>Description</label>
            <button onClick={genAI} disabled={aiLoad} style={{fontSize:12,background:`${m.accent}22`,color:m.accent,border:`1px solid ${m.accent}44`,borderRadius:7,padding:"4px 10px",cursor:"pointer",fontWeight:600}}>{aiLoad?"✨ Generating...":"✨ Write with AI"}</button>
          </div>
          <textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Describe the event, skill level, what to bring..." rows={3} style={{...inp,resize:"vertical"}}/>
        </div>
        {/* Privacy toggle */}
        <div style={{background:"rgba(255,255,255,.05)",borderRadius:12,padding:"14px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Visibility</div>
          <div style={{display:"flex",gap:10}}>
            {[{id:false,icon:"🌐",label:"Public",desc:"Visible to everyone browsing"},{id:true,icon:"🔒",label:"Private",desc:"Only accessible via link"}].map(opt=>(
              <button key={String(opt.id)} onClick={()=>set("isPrivate",opt.id)}
                style={{flex:1,padding:"10px 12px",borderRadius:10,border:`2px solid ${form.isPrivate===opt.id?m.accent:"rgba(255,255,255,.12)"}`,background:form.isPrivate===opt.id?`${m.accent}22`:"rgba(255,255,255,.05)",color:"#fff",cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                <div style={{fontSize:18,marginBottom:4}}>{opt.icon}</div>
                <div style={{fontSize:13,fontWeight:700}}>{opt.label}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.45)",marginTop:2}}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <button onClick={submit} style={{padding:13,borderRadius:12,border:"none",background:m.accent,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",transition:"background .3s",boxShadow:`0 4px 20px ${m.accent}55`}}>
          {currentUser?"Create event →":"Sign in to create →"}
        </button>
      </div>
    </div>
  );
}

//
function MyEventsPage({ events, currentUser, onOpen, mode }) {
  const m = MODES[mode] || MODES.pickup;
  if(!currentUser) return (
    <div style={{maxWidth:500,margin:"60px auto",textAlign:"center",padding:"0 16px"}}>
      <div style={{fontSize:48,marginBottom:12}}>🔒</div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:20,color:"#fff",marginBottom:8}}>Sign in to see your events</div>
      <p style={{color:"rgba(255,255,255,.4)",fontSize:14}}>Your hosted and joined events will appear here.</p>
    </div>
  );
  const hosted = events.filter(e=>e.host?.uid===currentUser.uid);
  const joined  = events.filter(e=>e.joined.some(j=>j.uid===currentUser.uid)&&e.host?.uid!==currentUser.uid);

  const eventMode = e => MODES[e.type==="tournament" ? "tournament" : "pickup"];

  const Sec = ({title, list}) => (
    <div style={{marginBottom:28}}>
      <h2 style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:16,color:"rgba(255,255,255,.7)",margin:"0 0 12px",letterSpacing:-.3}}>
        {title} <span style={{color:"rgba(255,255,255,.3)",fontWeight:400}}>({list.length})</span>
      </h2>
      {list.length===0
        ? <div style={{color:"rgba(255,255,255,.2)",fontSize:13,padding:"12px 0"}}>None yet</div>
        : <div style={{display:"grid",gap:12}}>
            {list.map(e => (
              <div key={e.id} style={{position:"relative"}}>
                <EventCard event={e} onClick={()=>onOpen(e)} mode={e.type==="tournament"?"tournament":"pickup"}/>
                {/* Mode badge if different from current mode */}
                {e.type !== (mode==="pickup"?"pickup":"tournament") && (
                  <div style={{position:"absolute",top:10,right:10,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:eventMode(e).accent,color:"#fff",letterSpacing:.5,textTransform:"uppercase",opacity:.9}}>
                    {eventMode(e).label}
                  </div>
                )}
              </div>
            ))}
          </div>
      }
    </div>
  );

  return (
    <div style={{maxWidth:700,margin:"0 auto",padding:"24px 16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:m.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"#fff",overflow:"hidden",flexShrink:0,boxShadow:("0 0 20px "+m.accent+"66")}}>
          {currentUser.photo?<img src={currentUser.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:currentUser.displayName?.[0]?.toUpperCase()||"U"}
        </div>
        <div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:20,color:"#fff",letterSpacing:-.5}}>{currentUser.displayName}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>{currentUser.email}</div>
        </div>
      </div>
      <Sec title="Events I'm hosting" list={hosted}/>
      <Sec title="Events I've joined" list={joined}/>
    </div>
  );
}

//
const MODES = {
  pickup:     { label:"Pickup",     accent:"#F4530D", accentDark:"#C23D00", accentSoft:"#FFF4EE", icon:"🎮", tagline:"Drop in. Play now." },
  tournament: { label:"Tournament", accent:"#1560BD", accentDark:"#0A3D7A", accentSoft:"#EEF5FF", icon:"🏆", tagline:"Compete. Win. Repeat." },
};

//
function SplashScreen({ onDone }) {
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 900);
    const t2 = setTimeout(() => onDone(), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#0A0A0F",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:9999,opacity:fading?0:1,transition:"opacity .4s ease",userSelect:"none"}}>
      {/* Radial glow */}
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"radial-gradient(ellipse 60% 50% at 50% 50%, rgba(244,83,13,.18) 0%, transparent 70%)",pointerEvents:"none"}}/>
      {/* Logo mark */}
      <div style={{position:"relative",marginBottom:24}}>
        <div style={{width:88,height:88,borderRadius:24,background:"linear-gradient(135deg,#F4530D,#C23D00)",overflow:"hidden",boxShadow:"0 0 60px rgba(244,83,13,.5)",animation:"su-pulse 1.2s ease-in-out infinite"}}><img src={"data:image/png;base64,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"} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"calc(50% - 4px) calc(50% + 28px)"}}/></div>
        <div style={{position:"absolute",top:-2,left:-2,right:-2,bottom:-2,borderRadius:26,border:"1.5px solid rgba(244,83,13,.3)",pointerEvents:"none"}}/>
      </div>
      {/* Wordmark */}
      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:42,color:"#fff",letterSpacing:-2,lineHeight:1}}>Sport<span style={{color:"#F4530D"}}>Up</span></div>
      <div style={{marginTop:10,fontSize:14,color:"rgba(255,255,255,.4)",fontWeight:500,letterSpacing:2,textTransform:"uppercase"}}>Squad Up. Show Up.</div>
      <style dangerouslySetInnerHTML={{__html:"@keyframes su-pulse{0%,100%{box-shadow:0 0 40px rgba(244,83,13,.4)}50%{box-shadow:0 0 80px rgba(244,83,13,.7)}}"}} />
    </div>
  );
}

//
function ModeSelector({ onSelect, onAuth, user }) {
  const [hovered, setHovered] = useState(false);
  const m = MODES.pickup;
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#0A0A0F",display:"flex",flexDirection:"column",zIndex:9000}}>
      {/* Header */}
      <div style={{padding:"20px 28px 12px",textAlign:"center"}}>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:28,color:"#fff",letterSpacing:-1}}>Sport<span style={{color:"#F4530D"}}>Up</span></div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginTop:6,fontWeight:500}}>What are you here for?</div>
      </div>

      {/* Pickup card — full width */}
      <div style={{flex:1,padding:"0 16px 16px",display:"flex",flexDirection:"column",minHeight:0}}>
        <div
          onClick={() => onSelect("pickup")}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{flex:1,borderRadius:20,cursor:"pointer",position:"relative",overflow:"hidden",
            background:("linear-gradient(160deg, #1A0800 0%, #2D1000 60%, "+(hovered?"#3D1800":"#251000")+" 100%)"),
            border:("1.5px solid "+(hovered?m.accent:"rgba(255,255,255,.08)")),
            transition:"all .25s ease",
            transform:hovered?"scale(1.01)":"scale(1)",
            boxShadow:hovered?("0 20px 60px "+m.accent+"44"):"0 4px 20px rgba(0,0,0,.4)",
          }}>
          {/* Glow */}
          <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:"70%",height:"50%",background:("radial-gradient(ellipse, "+m.accent+(hovered?"44":"22")+" 0%, transparent 70%)"),pointerEvents:"none",transition:"all .25s"}}/>
          {/* Content */}
          <div style={{position:"relative",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px",textAlign:"center"}}>
            <div style={{marginBottom:20,filter:("drop-shadow(0 0 24px "+m.accent+"88)"),transition:"all .25s",transform:hovered?"scale(1.08)":"scale(1)"}}>
              <svg width="72" height="80" viewBox="0 0 72 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="14" width="56" height="62" rx="5" fill={m.accent+"33"} stroke={m.accent} strokeWidth="2.5"/>
                <rect x="24" y="6" width="24" height="14" rx="4" fill={m.accent} opacity="0.9"/>
                <rect x="18" y="32" width="36" height="3" rx="1.5" fill={m.accent} opacity="0.7"/>
                <rect x="18" y="42" width="28" height="3" rx="1.5" fill={m.accent} opacity="0.5"/>
                <rect x="18" y="52" width="32" height="3" rx="1.5" fill={m.accent} opacity="0.5"/>
                <rect x="18" y="62" width="20" height="3" rx="1.5" fill={m.accent} opacity="0.35"/>
                <circle cx="14" cy="33.5" r="2.5" fill={m.accent} opacity="0.8"/>
                <circle cx="14" cy="43.5" r="2.5" fill={m.accent} opacity="0.6"/>
                <circle cx="14" cy="53.5" r="2.5" fill={m.accent} opacity="0.6"/>
                <circle cx="14" cy="63.5" r="2.5" fill={m.accent} opacity="0.4"/>
              </svg>
            </div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:28,color:"#fff",letterSpacing:-1,marginBottom:8}}>Pickup</div>
            <div style={{fontSize:13,color:m.accent,fontWeight:600,letterSpacing:.5,marginBottom:28}}>{m.tagline}</div>
            <div style={{background:m.accent,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:15,padding:"13px 36px",borderRadius:99,boxShadow:("0 4px 20px "+m.accent+"66"),transition:"all .25s",transform:hovered?"scale(1.05)":"scale(1)",whiteSpace:"nowrap"}}>
              Find an event →
            </div>
            {!user && (
              <button onClick={(e)=>{e.stopPropagation();onAuth();}}
                style={{marginTop:14,padding:"11px 36px",borderRadius:99,border:"1.5px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.07)",color:"rgba(255,255,255,.75)",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.14)";e.currentTarget.style.color="#fff";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.07)";e.currentTarget.style.color="rgba(255,255,255,.75)";}}>
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom links */}
      <div style={{textAlign:"center",padding:"0 0 24px",display:"flex",alignItems:"center",justifyContent:"center",gap:20}}>
        <button onClick={() => onSelect("tournament")}
          style={{fontSize:12,color:"rgba(255,255,255,.3)",background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textDecoration:"underline",padding:0}}>
          Looking for a tournament?
        </button>
        <span style={{color:"rgba(255,255,255,.15)",fontSize:12}}>·</span>
        <a href="/privacy" target="_blank" style={{fontSize:12,color:"rgba(255,255,255,.2)",fontFamily:"'DM Sans',sans-serif",textDecoration:"underline"}}>Privacy Policy</a>
      </div>
    </div>
  );
}

//
function distanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.pow(Math.sin(dLat/2),2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.pow(Math.sin(dLng/2),2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

//
// ─── Avatar presets ───────────────────────────────────────────────────────────
const AVATAR_PRESETS = [
  {bg:"#F4530D",emoji:"⚡"},{bg:"#1560BD",emoji:"🏆"},{bg:"#2B8A3E",emoji:"🌿"},
  {bg:"#7B2FBE",emoji:"🔮"},{bg:"#C92A2A",emoji:"🔥"},{bg:"#856404",emoji:"⭐"},
  {bg:"#1971C2",emoji:"🌊"},{bg:"#5C3BC0",emoji:"🎯"},{bg:"#2B8A3E",emoji:"⚽"},
  {bg:"#E8590C",emoji:"🏀"},{bg:"#1560BD",emoji:"🏐"},{bg:"#9C36B5",emoji:"🏈"},
  {bg:"#C92A2A",emoji:"🏓"},{bg:"#111",emoji:"😎"},{bg:"#555",emoji:"🤝"},
  {bg:"#0D2A5E",emoji:"🧊"},
];

function AvatarDisplay({ user, size=30, fontSize=12 }) {
  if (user?.photo) return <img src={user.photo} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover"}} alt=""/>;
  if (user?.avatarBg) return (
    <div style={{width:size,height:size,borderRadius:"50%",background:user.avatarBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.45,flexShrink:0}}>
      {user.avatarEmoji||"😎"}
    </div>
  );
  const bg = "#F4530D";
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize,fontWeight:700,color:"#fff",flexShrink:0}}>
      {(user?.displayName?.[0]||"U").toUpperCase()}
    </div>
  );
}

function UserProfilePanel({ user, prefs, onSave, onClose, onSignOut }) {
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState(() => user?.displayName || "");
  const [radius, setRadius] = useState(() => prefs?.radius || 25);
  const [locLabel, setLocLabel] = useState(() => prefs?.locLabel || "");
  const [locCoords, setLocCoords] = useState(() => prefs?.locCoords || null);
  const [locLoading, setLocLoading] = useState(false);
  const [locResults, setLocResults] = useState([]);
  const [avatarBg, setAvatarBg] = useState(() => user?.avatarBg || "#F4530D");
  const [avatarEmoji, setAvatarEmoji] = useState(() => user?.avatarEmoji || "⚡");
  const [avatarOpen, setAvatarOpen] = useState(false);

  // Friends state
  const [friends, setFriends] = useState([]);
  const [friendReqs, setFriendReqs] = useState([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [friendSearch, setFriendSearch] = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);
  const [friendMsg, setFriendMsg] = useState("");

  const locTimer = useRef(null);

  // Load friends from Firestore
  useEffect(() => {
    if (!user || tab !== "friends") return;
    getFirebase().then(fb => {
      const col = fb.collection(fb.db, "users", user.uid, "friends");
      return fb.onSnapshot(col, snap => {
        const all = snap.docs.map(d => ({id:d.id,...d.data()}));
        setFriends(all.filter(f => f.status==="accepted"));
        setFriendReqs(all.filter(f => f.status==="pending" && f.to===user.uid));
      });
    }).catch(()=>{});
  }, [user, tab]);

  const searchFriendByEmail = async () => {
    if (!friendEmail.trim()) return;
    setFriendLoading(true); setFriendSearch(null); setFriendMsg("");
    try {
      const fb = await getFirebase();
      const snap = await fb.getDocs(fb.query(fb.collection(fb.db,"users"), fb.where("email","==",friendEmail.trim().toLowerCase())));
      if (snap.empty) { setFriendMsg("No user found with that email."); }
      else {
        const found = {id:snap.docs[0].id,...snap.docs[0].data()};
        if (found.id === user.uid) { setFriendMsg("That's you!"); }
        else { setFriendSearch(found); }
      }
    } catch(e) { setFriendMsg("Search failed. Try again."); }
    setFriendLoading(false);
  };

  const sendFriendRequest = async (toUser) => {
    try {
      const fb = await getFirebase();
      const reqData = { from:user.uid, fromName:user.displayName, to:toUser.id, toName:toUser.displayName, status:"pending", ts:Date.now() };
      await fb.setDoc(fb.doc(fb.db,"users",user.uid,"friends",toUser.id), reqData);
      await fb.setDoc(fb.doc(fb.db,"users",toUser.id,"friends",user.uid), reqData);
      // Send notification
      await fb.addDoc(fb.collection(fb.db,"users",toUser.id,"notifications"), {
        type:"friend_request", fromUid:user.uid, fromName:user.displayName||"Someone",
        message:`${user.displayName||"Someone"} sent you a friend request!`, ts:Date.now(), read:false
      });
      setFriendMsg("Friend request sent!"); setFriendSearch(null); setFriendEmail("");
    } catch(e) { setFriendMsg("Failed to send request."); }
  };

  const acceptFriendRequest = async (req) => {
    try {
      const fb = await getFirebase();
      await fb.updateDoc(fb.doc(fb.db,"users",user.uid,"friends",req.from), {status:"accepted"});
      await fb.updateDoc(fb.doc(fb.db,"users",req.from,"friends",user.uid), {status:"accepted"});
      await fb.addDoc(fb.collection(fb.db,"users",req.from,"notifications"), {
        type:"friend_accepted", fromUid:user.uid, fromName:user.displayName||"Someone",
        message:`${user.displayName||"Someone"} accepted your friend request!`, ts:Date.now(), read:false
      });
    } catch(e) {}
  };

  const removeFriend = async (friendUid) => {
    try {
      const fb = await getFirebase();
      await fb.deleteDoc(fb.doc(fb.db,"users",user.uid,"friends",friendUid));
      await fb.deleteDoc(fb.doc(fb.db,"users",friendUid,"friends",user.uid));
    } catch(e) {}
  };

  const searchLoc = async (q) => {
    if (q.length < 3) { setLocResults([]); return; }
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=us`);
      setLocResults(await r.json());
    } catch { setLocResults([]); }
  };

  const onLocType = (v) => {
    setLocLabel(v); setLocCoords(null);
    clearTimeout(locTimer.current);
    locTimer.current = setTimeout(() => searchLoc(v), 400);
  };

  const pickLoc = (r) => {
    const label = r.display_name.split(",").slice(0,3).join(", ");
    setLocLabel(label); setLocCoords({ lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
    setLocResults([]);
  };

  const useCurrentLoc = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported by your browser."); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const d = await r.json();
        const label = d.address ? `${d.address.city||d.address.town||d.address.village||""}, ${d.address.state||""}`.trim().replace(/^,\s*/, "") : "Current location";
        setLocLabel(label); setLocCoords({ lat, lng });
      } catch { setLocLabel("Current location"); setLocCoords({ lat, lng }); }
      setLocLoading(false);
    }, () => { alert("Could not get your location."); setLocLoading(false); });
  };

  const save = () => {
    if (!name.trim()) { alert("Name can't be empty"); return; }
    onSave({ name: name.trim(), radius, locLabel, locCoords, avatarBg, avatarEmoji });
    onClose();
  };

  // Save user profile to Firestore users collection for friend discovery
  useEffect(() => {
    if (!user?.uid || !user?.email) return;
    getFirebase().then(fb => {
      fb.setDoc(fb.doc(fb.db,"users",user.uid), {
        uid: user.uid, displayName: user.displayName||"", email: user.email||"", updatedAt: Date.now()
      }, {merge:true}).catch(()=>{});
    }).catch(()=>{});
  }, [user]);

  const inp = { width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid rgba(255,255,255,.2)", background:"rgba(255,255,255,.1)", color:"#fff", fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
  const lbl = { fontSize:11, fontWeight:700, color:"rgba(255,255,255,.45)", textTransform:"uppercase", letterSpacing:.6, display:"block", marginBottom:8 };

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.65)",zIndex:9999,display:"flex",alignItems:"flex-start",justifyContent:"flex-end"}} onClick={onClose}>
      <div style={{background:"#12121C",borderLeft:"1px solid rgba(255,255,255,.1)",width:"min(360px, 100vw)",height:"100%",overflowY:"auto",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{padding:"24px 22px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:20,color:"#fff",letterSpacing:-.5}}>My Profile</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",fontSize:22,cursor:"pointer",padding:0}}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,.1)",margin:"16px 0 0",padding:"0 22px"}}>
          {["profile","friends"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 16px 10px",border:"none",background:"transparent",color:tab===t?"#fff":"rgba(255,255,255,.4)",fontWeight:tab===t?700:500,fontSize:13,cursor:"pointer",borderBottom:tab===t?"2px solid #F4530D":"2px solid transparent",fontFamily:"'DM Sans',sans-serif",textTransform:"capitalize"}}>
              {t==="profile"?"👤 Profile":"👥 Friends"}
            </button>
          ))}
        </div>

        <div style={{flex:1,padding:"20px 22px",display:"flex",flexDirection:"column",gap:20,overflowY:"auto"}}>

          {tab==="profile" && <>
            {/* Avatar picker — collapsible */}
            <div>
              <button onClick={()=>setAvatarOpen(o=>!o)}
                style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:"none",cursor:"pointer",padding:0}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <AvatarDisplay user={{...user,avatarBg,avatarEmoji}} size={34} fontSize={16}/>
                  <span style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.7)",fontFamily:"'DM Sans',sans-serif"}}>Change profile picture</span>
                </div>
                <span style={{color:"rgba(255,255,255,.4)",fontSize:16,transition:"transform .2s",display:"inline-block",transform:avatarOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
              </button>
              {avatarOpen && (
                <div style={{marginTop:14}}>
                  <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:12}}>
                    {AVATAR_PRESETS.map((p,i)=>(
                      <button key={i} onClick={()=>{setAvatarBg(p.bg);setAvatarEmoji(p.emoji);}}
                        style={{width:44,height:44,borderRadius:"50%",background:p.bg,border:avatarBg===p.bg&&avatarEmoji===p.emoji?"3px solid #fff":"3px solid transparent",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .15s",transform:avatarBg===p.bg&&avatarEmoji===p.emoji?"scale(1.15)":"scale(1)"}}>
                        {p.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Display name */}
            <div>
              <label style={lbl}>Display name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your public name" style={inp}/>
              <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:6}}>Shown to other players and hosts.</div>
            </div>

            {/* Location */}
            <div>
              <label style={lbl}>Your location</label>
              <div style={{position:"relative"}}>
                <input value={locLabel} onChange={e=>onLocType(e.target.value)} placeholder="City, zip, or neighborhood…" style={inp} onBlur={()=>setTimeout(()=>setLocResults([]),200)}/>
                {locResults.length > 0 && (
                  <div style={{position:"absolute",zIndex:10,top:"100%",left:0,right:0,background:"#1e1e2e",border:"1px solid rgba(255,255,255,.15)",borderRadius:10,marginTop:4,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,.4)"}}>
                    {locResults.map((r,i) => (
                      <div key={i} onMouseDown={()=>pickLoc(r)}
                        style={{padding:"10px 14px",cursor:"pointer",fontSize:13,color:"rgba(255,255,255,.8)",borderBottom:i<locResults.length-1?"1px solid rgba(255,255,255,.07)":"none"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        📍 {r.display_name.split(",").slice(0,3).join(", ")}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={useCurrentLoc} disabled={locLoading}
                style={{marginTop:10,width:"100%",padding:"10px",borderRadius:10,border:"1.5px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.06)",color:locLoading?"rgba(255,255,255,.3)":"rgba(255,255,255,.7)",fontSize:13,fontWeight:600,cursor:locLoading?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                {locLoading ? "📍 Getting location…" : "📍 Use my current location"}
              </button>
            </div>

            {/* Distance slider */}
            <div>
              <label style={lbl}>Search radius</label>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:13,color:"rgba(255,255,255,.5)"}}>Within</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:22,color:"#fff"}}>{radius} <span style={{fontSize:14,fontWeight:400,color:"rgba(255,255,255,.5)"}}>miles</span></span>
              </div>
              <input type="range" min={5} max={100} step={5} value={radius} onChange={e=>setRadius(Number(e.target.value))} style={{width:"100%",accentColor:"#F4530D",cursor:"pointer"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,.25)",marginTop:4}}>
                <span>5 mi</span><span>100 mi</span>
              </div>
            </div>

            <button onClick={save} style={{padding:"13px",borderRadius:12,border:"none",background:"#F4530D",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:"0 4px 20px rgba(244,83,13,.4)"}}>Save preferences</button>
          </>}

          {tab==="friends" && <>
            {/* Pending requests */}
            {friendReqs.length > 0 && (
              <div>
                <label style={lbl}>Friend requests ({friendReqs.length})</label>
                {friendReqs.map(req=>(
                  <div key={req.from} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.06)",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"#F4530D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"#fff",flexShrink:0}}>{req.fromName?.[0]?.toUpperCase()||"?"}</div>
                    <div style={{flex:1,fontSize:13,fontWeight:600,color:"#fff"}}>{req.fromName}</div>
                    <button onClick={()=>acceptFriendRequest(req)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"#2B8A3E",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Accept</button>
                    <button onClick={()=>removeFriend(req.from)} style={{padding:"6px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"transparent",color:"rgba(255,255,255,.5)",fontSize:12,cursor:"pointer"}}>Decline</button>
                  </div>
                ))}
              </div>
            )}

            {/* Find by email */}
            <div>
              <label style={lbl}>Add friend by email</label>
              <div style={{display:"flex",gap:8}}>
                <input value={friendEmail} onChange={e=>setFriendEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchFriendByEmail()} placeholder="friend@email.com" style={{...inp,flex:1}}/>
                <button onClick={searchFriendByEmail} disabled={friendLoading} style={{padding:"10px 14px",borderRadius:10,border:"none",background:"#F4530D",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",flexShrink:0}}>Find</button>
              </div>
              {friendMsg && <div style={{fontSize:12,color:"rgba(255,255,255,.5)",marginTop:8}}>{friendMsg}</div>}
              {friendSearch && (
                <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.08)",borderRadius:12,padding:"12px 14px",marginTop:10}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"#1560BD",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"#fff",flexShrink:0}}>{friendSearch.displayName?.[0]?.toUpperCase()||"?"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{friendSearch.displayName}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{friendSearch.email}</div>
                  </div>
                  <button onClick={()=>sendFriendRequest(friendSearch)} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#F4530D",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Add</button>
                </div>
              )}
            </div>

            {/* Friends list */}
            <div>
              <label style={lbl}>My friends ({friends.length})</label>
              {friends.length===0
                ? <div style={{fontSize:13,color:"rgba(255,255,255,.3)",textAlign:"center",padding:"20px 0"}}>No friends yet — search by email above or meet people at events!</div>
                : friends.map(f=>(
                  <div key={f.id} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.06)",borderRadius:12,padding:"11px 14px",marginBottom:8}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:"#F4530D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#fff",flexShrink:0}}>{(f.fromName===user.displayName?f.toName:f.fromName)?.[0]?.toUpperCase()||"?"}</div>
                    <div style={{flex:1,fontSize:13,fontWeight:600,color:"#fff"}}>{f.fromName===user.displayName?f.toName:f.fromName}</div>
                    <button onClick={()=>removeFriend(f.id)} style={{fontSize:11,color:"rgba(255,255,255,.3)",background:"none",border:"none",cursor:"pointer"}}>Remove</button>
                  </div>
                ))
              }
            </div>
          </>}
        </div>

        {/* Footer */}
        <div style={{borderTop:"1px solid rgba(255,255,255,.08)",padding:"16px 22px"}}>
          <div style={{fontSize:12,color:"rgba(255,255,255,.3)",marginBottom:10}}>{user?.email}</div>
          <button onClick={()=>{onClose();onSignOut();}} style={{width:"100%",padding:"10px",borderRadius:10,border:"1.5px solid rgba(255,255,255,.12)",background:"transparent",color:"rgba(255,255,255,.6)",fontWeight:600,fontSize:14,cursor:"pointer",marginBottom:10}}>Sign out</button>
          <a href="/privacy" target="_blank" style={{fontSize:11,color:"rgba(255,255,255,.25)",textDecoration:"underline"}}>Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}

//
// Outline SVG tab icons -- thin stroke, matches DM Sans weight
const TabIcon = ({ id, size=16 }) => {
  const s = { fill:"none", stroke:"currentColor", strokeWidth:1.6, strokeLinecap:"round", strokeLinejoin:"round" };
  if (id === "home") return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={s}>
      <circle cx="8.5" cy="8.5" r="5"/>
      <line x1="12.5" y1="12.5" x2="17" y2="17" strokeWidth={1.9} strokeLinecap="round"/>
    </svg>
  );
  if (id === "create") return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={s}>
      <line x1="10" y1="3" x2="10" y2="17" strokeWidth={1.9} strokeLinecap="round"/>
      <line x1="3" y1="10" x2="17" y2="10" strokeWidth={1.9} strokeLinecap="round"/>
    </svg>
  );
  if (id === "my") return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={s}>
      <rect x="3" y="4" width="14" height="13" rx="2"/>
      <line x1="7" y1="2" x2="7" y2="6"/>
      <line x1="13" y1="2" x2="13" y2="6"/>
      <line x1="3" y1="9" x2="17" y2="9"/>
      <line x1="7" y1="13" x2="7" y2="13" strokeWidth={2.2} strokeLinecap="round"/>
      <line x1="10" y1="13" x2="10" y2="13" strokeWidth={2.2} strokeLinecap="round"/>
      <line x1="13" y1="13" x2="13" y2="13" strokeWidth={2.2} strokeLinecap="round"/>
    </svg>
  );
  return null;
};

function NavBar({ page, setPage, count, user, onAuth, onSignOut, onUpdateProfile, prefs, mode, onBackToModes, onOpenProfile }) {
  const m = MODES[mode] || MODES.pickup;
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const tabs = [{id:"home",label:"Browse"},{id:"create",label:"Create"},{id:"my",label:"My Events"}];

  useEffect(() => {
    if (!user?.uid) return;
    let unsub;
    getFirebase().then(fb => {
      const col = fb.collection(fb.db, "users", user.uid, "notifications");
      unsub = fb.onSnapshot(col, snap => {
        setNotifs(snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>b.ts-a.ts));
      });
    }).catch(()=>{});
    return () => unsub && unsub();
  }, [user?.uid]);

  const unread = notifs.filter(n=>!n.read).length;

  const markRead = async (notifId) => {
    if (!user?.uid) return;
    try {
      const fb = await getFirebase();
      await fb.updateDoc(fb.doc(fb.db,"users",user.uid,"notifications",notifId),{read:true});
    } catch(e) {}
  };

  return (
    <>
      {showNotifs && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:9998}} onClick={()=>setShowNotifs(false)}>
          <div style={{position:"absolute",top:58,right:10,width:300,maxWidth:"90vw",background:"#1a1a2e",border:"1px solid rgba(255,255,255,.15)",borderRadius:14,overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,.5)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.1)",fontWeight:700,fontSize:14,color:"#fff"}}>Notifications</div>
            {notifs.length===0
              ? <div style={{padding:"20px 16px",fontSize:13,color:"rgba(255,255,255,.4)",textAlign:"center"}}>No notifications yet</div>
              : notifs.slice(0,10).map(n=>(
                <div key={n.id} onClick={()=>markRead(n.id)}
                  style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.07)",background:n.read?"transparent":"rgba(244,83,13,.08)",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.05)"}
                  onMouseLeave={e=>e.currentTarget.style.background=n.read?"transparent":"rgba(244,83,13,.08)"}>
                  <div style={{fontSize:13,color:"#fff",fontWeight:n.read?400:600}}>{n.message}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:3}}>{new Date(n.ts).toLocaleDateString()}</div>
                </div>
              ))
            }
          </div>
        </div>
      )}
      <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(10,10,15,.96)",backdropFilter:"blur(12px)",borderBottom:("1px solid "+m.accent+"33"),display:"flex",alignItems:"center",padding:"0 10px",height:56,gap:4}}>
        <button onClick={onBackToModes} title="Switch mode" style={{background:"none",border:"none",color:"rgba(255,255,255,.5)",fontSize:44,cursor:"pointer",padding:"0 4px 0 0",lineHeight:1,display:"flex",alignItems:"center",flexShrink:0,position:"relative",top:-2}}>‹</button>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:22,color:"#fff",marginRight:"auto",letterSpacing:-.5,whiteSpace:"nowrap",flexShrink:0}}>
          Sport<span style={{color:m.accent}}>Up</span>
          <span style={{marginLeft:5,fontSize:10,fontWeight:600,color:m.accent,background:(m.accent+"22"),borderRadius:99,padding:"1px 6px",letterSpacing:.3,textTransform:"uppercase"}}>{m.label}</span>
        </div>
        <div style={{display:"flex",gap:2,flexShrink:0}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setPage(t.id)} style={{background:page===t.id?m.accent:"transparent",color:page===t.id?"#fff":"rgba(255,255,255,.55)",border:"none",borderRadius:8,padding:"7px 9px",fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:3,transition:"all .15s",flexShrink:0}}>
              <span style={{color:page!==t.id?m.accent:"inherit",display:"flex",alignItems:"center",flexShrink:0}}>
                <TabIcon id={t.id} size={20}/>
              </span>
              <span className="nav-label" style={{fontFamily:"'DM Sans',sans-serif"}}>{t.label}</span>
              {t.id==="my"&&count>0&&<span style={{background:"#fff",color:m.accent,borderRadius:99,fontSize:9,padding:"1px 4px",fontWeight:800,flexShrink:0}}>{count}</span>}
            </button>
          ))}
        </div>
        {user
          ? <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:4,flexShrink:0}}>
              <button onClick={()=>setShowNotifs(s=>!s)} style={{position:"relative",background:"none",border:"none",color:"rgba(255,255,255,.5)",fontSize:16,cursor:"pointer",padding:"4px",display:"flex",alignItems:"center"}}>
                🔔
                {unread>0&&<span style={{position:"absolute",top:0,right:0,background:"#C92A2A",color:"#fff",borderRadius:99,fontSize:9,padding:"1px 4px",fontWeight:800,minWidth:14,textAlign:"center"}}>{unread}</span>}
              </button>
              <button onClick={()=>onOpenProfile?onOpenProfile():setShowProfile(true)} title="Profile & preferences"
                style={{width:30,height:30,borderRadius:"50%",background:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"visible",border:"none",cursor:"pointer",padding:0}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:user.avatarBg||m.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:user.avatarEmoji?16:11,fontWeight:700,color:"#fff",overflow:"hidden",flexShrink:0}}>
                  {user.avatarBg
                    ? user.avatarEmoji
                    : user.photo
                      ? <img src={user.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                      : (user.displayName?.[0]||"U").toUpperCase()}
                </div>
              </button>
            </div>
          : <button onClick={onAuth} style={{padding:"6px 11px",borderRadius:8,border:("1.5px solid "+m.accent),background:m.accent,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,marginLeft:4}}>Sign in</button>}
      </nav>
    </>
  );
}

//
function AppInner() {
  const [appState, setAppState] = useState("splash"); // splash | mode | app
  const [mode, setMode] = useState(() => load("su_mode", null));
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(() => load("su_user", null));
  const [prefs, setPrefs] = useState(() => load("su_prefs", { radius: 25, locLabel: "", locCoords: null }));
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const evRef = useRef(events);
  useEffect(() => { evRef.current = events; }, [events]);

  const [firestoreError, setFirestoreError] = useState(null);

  // Real-time Firestore listener for all events
  useEffect(() => {
    let unsub = null;
    const setup = async () => {
      try {
        const fb = await getFirebase();
        const col = fb.collection(fb.db, "events");
        unsub = fb.onSnapshot(col, snap => {
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setEvents(docs);
          setEventsLoading(false);
          setFirestoreError(null);
        }, err => {
          console.error("Firestore listener error:", err.code, err.message);
          setEventsLoading(false);
          setFirestoreError(err.code || err.message);
        });
      } catch(e) {
        console.error("Firestore init error:", e);
        setEventsLoading(false);
        setFirestoreError(e.message || "Connection failed");
      }
    };
    setup();
    return () => { if (unsub) unsub(); };
  }, []);

  const onSplashDone = useCallback(() => {
    setAppState("mode");
  }, []);

  const onSelectMode = (m) => { setMode(m); save("su_mode", m); setAppState("app"); setPage("home"); setSelected(null); };
  const onBackToModes = () => { setAppState("mode"); setSelected(null); setPage("home"); };

  // Remove localStorage event sync — Firestore is the source of truth now
  useEffect(() => { save("su_user", user); }, [user]);
  useEffect(() => {
    // Viewport meta -- critical for mobile browsers
    if (!document.querySelector('meta[name="viewport"]')) {
      const vp = document.createElement("meta");
      vp.name = "viewport";
      vp.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
      document.head.appendChild(vp);
    }
    // Fonts
    const l=document.createElement("link"); l.href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"; l.rel="stylesheet"; document.head.appendChild(l);
    // Mobile CSS resets
    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      body { margin: 0; padding: 0; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
      input, textarea, select, button { font-family: 'DM Sans', sans-serif; }
      input[type="range"] { -webkit-appearance: none; width: 100%; }
      @media (max-width: 480px) {
        .nav-label { display: none !important; }
        .mode-card-content { padding: 16px 10px !important; }
        .mode-card-title { font-size: 20px !important; }
        .mode-card-tagline { font-size: 11px !important; margin-bottom: 16px !important; }
      }
      /* Cap Leaflet map z-index so modals always appear on top */
      .leaflet-pane { z-index: 400 !important; }
      .leaflet-top, .leaflet-bottom { z-index: 500 !important; }
      .leaflet-control { z-index: 500 !important; }
      .leaflet-popup-pane { z-index: 600 !important; }
    `;
    document.head.appendChild(style);
  }, []);

  const openFromHash = useCallback((hash) => {
    const m2=hash.match(/[#&]event=([^&]+)/);
    if(m2){const id=decodeURIComponent(m2[1]),ev=evRef.current.find(e=>e.id===id); if(ev){setSelected(ev);setPage("home");setAppState("app");}}
  }, []);
  useEffect(() => {
    openFromHash(window.location.hash);
    const h=()=>openFromHash(window.location.hash);
    window.addEventListener("hashchange",h);
    return ()=>window.removeEventListener("hashchange",h);
  }, [openFromHash]);

  // Firestore helpers
  const fsUpdate = useCallback(async (id, data) => {
    try {
      const fb = await getFirebase();
      await fb.updateDoc(fb.doc(fb.db, "events", id), data);
      // Optimistically update local selected state too
      setSelected(prev => prev?.id===id ? {...prev,...data} : prev);
    } catch(e) { console.error("Firestore update error:", e); }
  }, []);

  const onCreated = useCallback(async (ev) => {
    setPage("my");
    try {
      const fb = await getFirebase();
      const { id: _id, ...data } = ev;
      data.hostUid = ev.host?.uid || "";
      data.joinedUids = ev.joined?.map(j=>j.uid) || [];
      Object.keys(data).forEach(k => { if (data[k] === undefined) data[k] = null; });
      await fb.addDoc(fb.collection(fb.db, "events"), data);
    } catch(e) {
      console.error("Firestore create error:", e);
      if (e.code === "permission-denied") {
        alert("Permission denied. Please sign out and sign back in, then try again.");
      } else {
        alert("Failed to save event: " + (e.message || "Check your connection and try again."));
      }
    }
  }, []);

  const onJoin = useCallback(async (id, p) => {
    const ev = evRef.current.find(e=>e.id===id); if(!ev) return;
    const newJoined = [...(ev.joined||[]), p];
    await fsUpdate(id, { joined: newJoined, joinedUids: newJoined.map(j=>j.uid) });
  }, [fsUpdate]);

  const onLeave = useCallback(async (id, uid2) => {
    const ev = evRef.current.find(e=>e.id===id); if(!ev) return;
    const newJoined = (ev.joined||[]).filter(j=>j.uid!==uid2);
    await fsUpdate(id, { joined: newJoined, joinedUids: newJoined.map(j=>j.uid) });
  }, [fsUpdate]);

  const onCancel = useCallback(async (id) => {
    try {
      const fb = await getFirebase();
      await fb.deleteDoc(fb.doc(fb.db, "events", id));
      setSelected(null);
    } catch(e) { console.error("Firestore delete error:", e); }
  }, []);

  const onUpdSlots   = useCallback((id,n)   => fsUpdate(id, {slots:n}), [fsUpdate]);
  const onUpdDL      = useCallback((id,dl)  => fsUpdate(id, {deadline:dl}), [fsUpdate]);
  const onUpdEvent   = useCallback(async (updated) => {
    const { id, ...data } = updated;
    await fsUpdate(id, data);
  }, [fsUpdate]);
  const onUpdPlayers = useCallback(async (id,tuid,pl,name) => {
    const ev = evRef.current.find(e=>e.id===id); if(!ev) return;
    const newJoined = (ev.joined||[]).map(j=>j.uid===tuid?{...j,players:pl,...(name?{name}:{})}:j);
    await fsUpdate(id, { joined: newJoined });
  }, [fsUpdate]);

  const onSignOut       = () => { setUser(null); save("su_user",null); };
  const onUpdateProfile = ({ name, radius, locLabel, locCoords, avatarBg, avatarEmoji }) => {
    // avatarChosen means user explicitly picked a preset — clear photo so preset shows
    setUser(u => {
      const updated = {...u, displayName:name, avatarBg, avatarEmoji, photo:null};
      save("su_user", updated);
      return updated;
    });
    const p = { radius, locLabel, locCoords }; setPrefs(p); save("su_prefs", p);
    getFirebase().then(fb => {
      if (fb.auth.currentUser) {
        fb.updateProfile(fb.auth.currentUser, { displayName: name }).catch(e => console.warn("Profile update failed:", e));
      }
    }).catch(() => {});
  };

  // Keep selected event in sync when Firestore updates it
  useEffect(() => {
    if (selected) {
      const updated = events.find(e => e.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [events]);
  const openEvent  = (ev) => { setSelected(ev); window.location.hash=`event=${ev.id}`; };
  const closeEvent = ()   => { setSelected(null); window.history.replaceState(null,"",window.location.pathname+window.location.search); };
  const navPage    = (p)  => { setSelected(null); window.location.hash=""; setPage(p); };

  // Filter events to current mode
  const modeEvents = events.filter(e => mode==="pickup" ? e.type==="pickup" : e.type==="tournament");
  const allMyEvents = user ? events.filter(e => e.host?.uid===user.uid || e.joined.some(j=>j.uid===user.uid)) : [];
  const myCount = allMyEvents.length;

  const m = MODES[mode] || MODES.pickup;

  // Global dark bg for app mode
  const appBg = mode==="tournament" ? "#06090F" : "#0D0600";
  const pageBg = mode==="tournament" ? "#0F1420" : "#180A00";

  if (appState==="splash") return <SplashScreen onDone={onSplashDone}/>;
  if (appState==="mode")   return (
    <>
      <ModeSelector onSelect={onSelectMode} onAuth={()=>setShowAuth(true)} user={user}/>
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onSignIn={u=>{setUser(u);setShowAuth(false);if(u)onSelectMode("pickup");}}/>}
    </>
  );

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",minHeight:"100vh",background:pageBg}}>
      {showProfile && <UserProfilePanel user={user} prefs={prefs} onSave={onUpdateProfile} onClose={()=>setShowProfile(false)} onSignOut={onSignOut}/>}
      <NavBar page={page} setPage={navPage} count={myCount} user={user} onAuth={()=>setShowAuth(true)} onSignOut={onSignOut} onUpdateProfile={onUpdateProfile} prefs={prefs} mode={mode} onBackToModes={onBackToModes} onOpenProfile={()=>setShowProfile(true)}/>
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onSignIn={u=>{
        const saved=load("su_user",null);
        const hasPreset=saved?.uid===u?.uid&&saved?.avatarBg;
        setUser({...u, photo:hasPreset?null:u.photo, avatarBg:hasPreset?saved.avatarBg:u.avatarBg, avatarEmoji:hasPreset?saved.avatarEmoji:u.avatarEmoji});
        setShowAuth(false);
      }}/>}
      {selected
        ? <EventDetail
            event={events.find(e=>e.id===selected.id)||selected}
            currentUser={user} mode={mode}
            onJoin={onJoin} onLeave={onLeave} onCancel={onCancel}
            onUpdateSlots={onUpdSlots} onUpdateDeadline={onUpdDL} onUpdatePlayers={onUpdPlayers} onUpdateEvent={onUpdEvent}
            onBack={closeEvent} onAuthRequired={()=>setShowAuth(true)}/>
        : page==="home"   ? <HomePage   events={modeEvents} onOpen={openEvent} setPage={setPage} mode={mode} currentUser={user} prefs={prefs} loading={eventsLoading} onBackToModes={onBackToModes} firestoreError={firestoreError}/>
        : page==="create" ? <CreatePage onCreated={onCreated} currentUser={user} onAuthRequired={()=>setShowAuth(true)} mode={mode}/>
        :                   <MyEventsPage events={allMyEvents} currentUser={user} onOpen={openEvent} mode={mode}/>}
      {/* Footer — tournament link on pickup home */}
      {!selected && mode==="pickup" && page==="home" && (
        <div style={{textAlign:"center",padding:"12px 0 24px",borderTop:"1px solid rgba(255,255,255,.06)",marginTop:8}}>
          <button onClick={()=>onSelectMode("tournament")}
            style={{fontSize:12,color:"rgba(255,255,255,.25)",background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textDecoration:"underline",padding:0}}>
            Looking for a tournament?
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
