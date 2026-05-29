import { useState, useEffect, useRef, useCallback } from "react";

// ─── IMPORTANT: Firebase Setup Instructions ──────────────────────────────────
// 1. Go to https://console.firebase.google.com and create a project
// 2. Enable Authentication → Google sign-in provider
// 3. Enable Firestore Database (start in test mode for dev)
// 4. Replace the firebaseConfig below with your project's config
// 5. Add your domain to Firebase Auth → Authorized domains
// ─────────────────────────────────────────────────────────────────────────────

// ─── Firebase SDK (loaded via CDN in useEffect) ───────────────────────────────
let firebaseApp, db, auth, googleProvider;
let firestoreReady = false;

async function initFirebase() {
  if (firestoreReady) return;
  // TODO: Replace with your Firebase config
  const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

  const [appMod, authMod, fsMod] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"),
  ]);

  firebaseApp = appMod.initializeApp(firebaseConfig);
  auth = authMod.getAuth(firebaseApp);
  googleProvider = new authMod.GoogleAuthProvider();
  db = fsMod.getFirestore(firebaseApp);
  firestoreReady = true;
  return { auth, db, googleProvider, ...authMod, ...fsMod };
}

// ─── constants ────────────────────────────────────────────────────────────────
const SPORTS = [
  { id: "basketball",   label: "Basketball",   emoji: "🏀", color: "#E8590C", bg: "#FFF4EE", players: 10 },
  { id: "soccer",       label: "Soccer",       emoji: "⚽", color: "#2B8A3E", bg: "#F0FBF4", players: 22 },
  { id: "volleyball",   label: "Volleyball",   emoji: "🏐", color: "#1971C2", bg: "#EEF5FF", players: 12 },
  { id: "flagfootball", label: "Flag Football",emoji: "🏈", color: "#9C36B5", bg: "#FAF0FF", players: 14 },
  { id: "pickleball",   label: "Pickleball",   emoji: "🏓", color: "#C92A2A", bg: "#FFF5F5", players: 8  },
];
const SPORT_MAP = Object.fromEntries(SPORTS.map(s => [s.id, s]));

const TOURNAMENT_FORMATS = [
  { id: "single", label: "Single Elimination", desc: "Lose once, you're out" },
  { id: "double", label: "Double Elimination", desc: "Two losses to be out" },
  { id: "robin",  label: "Round Robin",        desc: "Everyone plays everyone" },
];

// Sample events use "HOST_DEMO" as host uid; at runtime we substitute the actual logged-in user
// so host features (remove, edit slots, contacts) work out of the box on sample data.
const SAMPLE_HOST_UID = "HOST_DEMO";

const SAMPLE_EVENTS = [
  { id: "e1", type: "pickup",     sport: "basketball",   title: "Sunday Morning Run",   date: "2026-06-01", time: "09:00", location: "Richardson Heights Park, Richardson, TX",  lat: 32.9656, lng: -96.7302, slots: 10, joined: [{ uid:"u1", name:"Alex" },{ uid:"u2", name:"Jordan" },{ uid:"u3", name:"Sam" }],   host: { uid: SAMPLE_HOST_UID, name:"Marcus T." }, tournamentFormat: "single", description:"Fast-paced pickup run — all levels welcome!" },
  { id: "e2", type: "tournament", sport: "soccer",       title: "Summer Cup 2026",      date: "2026-06-07", time: "10:00", location: "Huffhines Recreation Center, Richardson, TX", lat: 32.9754, lng: -96.6891, slots: 8,  joined: [{ uid:"u4", name:"Team Alpha", players:[] },{ uid:"u5", name:"Team Beta", players:[] }], host: { uid: SAMPLE_HOST_UID, name:"Sandra K." }, tournamentFormat: "double", description:"Annual summer tournament — bring your best squad." },
  { id: "e3", type: "pickup",     sport: "pickleball",   title: "Weekday Rally",        date: "2026-05-30", time: "18:30", location: "Breckinridge Park, Richardson, TX",          lat: 32.9484, lng: -96.7218, slots: 8,  joined: [{ uid:"u6", name:"Chris" },{ uid:"u7", name:"Dana" }],           host: { uid: SAMPLE_HOST_UID, name:"Tom H." },    tournamentFormat: "single", description:"Casual evening rally. Paddles provided." },
  { id: "e4", type: "tournament", sport: "volleyball",   title: "Net Warriors",         date: "2026-06-14", time: "11:00", location: "Terrace Park, Dallas, TX",                   lat: 32.8487, lng: -96.7772, slots: 6,  joined: [{ uid:"u8", name:"Spikers", players:[] },{ uid:"u9", name:"Blockers", players:[] },{ uid:"u10", name:"Diggers", players:[] }], host: { uid: SAMPLE_HOST_UID, name:"Priya R." }, tournamentFormat: "robin", description:"Round robin pool play then finals." },
  { id: "e5", type: "pickup",     sport: "flagfootball", title: "Flag Frenzy Friday",   date: "2026-06-05", time: "19:00", location: "Cottonwood Park, Allen, TX",                 lat: 33.1032, lng: -96.6651, slots: 14, joined: [{ uid:"u11", name:"Mike" },{ uid:"u12", name:"Leah" },{ uid:"u13", name:"Devon" },{ uid:"u14", name:"Pat" }], host: { uid: SAMPLE_HOST_UID, name:"Carlos V." }, tournamentFormat: "single", description:"Friday night flag — teams of 7." },
];

const SAMPLE_CHAT = {
  e1: [{ uid:"u1", name:"Alex", text:"Can't wait for Sunday!", ts: Date.now()-3600000 }, { uid:"u2", name:"Jordan", text:"Same! Bringing extra water 🌊", ts: Date.now()-1800000 }],
  e2: [{ uid:"h2", name:"Sandra K.", text:"Welcome everyone! Check in at 9:45am", ts: Date.now()-7200000 }],
};

// ─── storage helpers (fallback when Firebase not configured) ──────────────────
const load = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ─── AI helper ────────────────────────────────────────────────────────────────
async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}

// ─── time helpers ─────────────────────────────────────────────────────────────
function canLeaveEvent(event) {
  const [h, m] = event.time.split(":").map(Number);
  const dt = new Date(event.date + "T00:00:00");
  dt.setHours(h, m, 0, 0);
  return Date.now() < dt.getTime() - 30 * 60 * 1000;
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(ts) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── bracket generators ───────────────────────────────────────────────────────
function buildSingleElim(teams) {
  let t = [...teams];
  const n = Math.pow(2, Math.ceil(Math.log2(Math.max(t.length, 2))));
  while (t.length < n) t.push({ name: "BYE", uid: "bye-" + t.length });
  const rounds = [];
  let current = t.map((team, i) => ({ ...team, seed: i + 1 }));
  while (current.length > 1) {
    const pairs = [];
    for (let i = 0; i < current.length; i += 2) pairs.push({ a: current[i], b: current[i + 1], scoreA: "", scoreB: "", winner: null });
    rounds.push(pairs);
    current = pairs.map((_, i) => ({ name: "TBD", uid: "tbd-" + rounds.length + "-" + i }));
  }
  return { type: "single", rounds, winnersRound: null };
}

function buildDoubleElim(teams) {
  // Winners bracket (same as single elim) + losers bracket placeholder
  const winnersBracket = buildSingleElim(teams);
  const loserRounds = winnersBracket.rounds.slice(0, -1).map((round, ri) =>
    round.map((_, mi) => ({ a: { name: "L-TBD", uid: "ltbd-" + ri + mi }, b: { name: "L-TBD", uid: "ltbd2-" + ri + mi }, scoreA: "", scoreB: "", winner: null }))
  );
  const grandFinal = [{ a: { name: "Winners", uid: "gf-w" }, b: { name: "Losers", uid: "gf-l" }, scoreA: "", scoreB: "", winner: null }];
  return { type: "double", winnersRounds: winnersBracket.rounds, losersRounds: loserRounds, grandFinal };
}

function buildRoundRobin(teams) {
  const matches = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({ a: teams[i], b: teams[j], scoreA: "", scoreB: "", played: false });
    }
  }
  return { type: "robin", matches, teams };
}

// ─── Map Component (OpenStreetMap via Leaflet) ────────────────────────────────
function MapView({ lat, lng, label }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const loadMap = async () => {
      if (!window.L) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        await new Promise(resolve => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      if (!mapRef.current) return;
      const map = window.L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([lat, lng], 15);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19 }).addTo(map);
      const icon = window.L.divIcon({ html: `<div style="background:#E8590C;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)">⚡</div>`, className: "", iconSize: [32, 32], iconAnchor: [16, 16] });
      window.L.marker([lat, lng], { icon }).addTo(map).bindPopup(`<strong>${label}</strong>`).openPopup();
      mapInstanceRef.current = map;
    };
    loadMap();
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, [lat, lng, label]);

  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: "1.5px solid #eee", height: 220 }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

// ─── LocationSearch Component ─────────────────────────────────────────────────
function LocationSearch({ value, textValue, onTextChange, onChange }) {
  const [query, setQuery] = useState(textValue || value?.address || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  // keep in sync if parent resets
  useEffect(() => { if (!textValue) setQuery(""); }, [textValue]);

  const search = async (q) => {
    if (q.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=us`);
      const data = await res.json();
      setResults(data);
    } catch { setResults([]); }
    setLoading(false);
  };

  const handleInput = (v) => {
    setQuery(v);
    if (onTextChange) onTextChange(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(v), 400);
  };

  const pick = (r) => {
    const label = r.display_name.split(",").slice(0, 3).join(", ");
    setQuery(label);
    setResults([]);
    if (onTextChange) onTextChange(label);
    onChange({ address: label, lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
  };

  return (
    <div style={{ position: "relative" }}>
      <input value={query} onChange={e => handleInput(e.target.value)} placeholder="Search for a park, gym, or address…" style={{ width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} onFocus={e => e.target.style.borderColor = "#111"} onBlur={e => { e.target.style.borderColor = "#ddd"; setTimeout(() => setResults([]), 200); }} />
      {loading && <div style={{ position: "absolute", right: 12, top: 12, fontSize: 12, color: "#999" }}>Searching…</div>}
      {results.length > 0 && (
        <div style={{ position: "absolute", zIndex: 200, top: "100%", left: 0, right: 0, background: "#fff", border: "1.5px solid #eee", borderRadius: 10, marginTop: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          {results.map((r, i) => (
            <div key={i} onMouseDown={() => pick(r)} style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, borderBottom: i < results.length - 1 ? "1px solid #f5f5f5" : "none" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9f9f9"} onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
              📍 {r.display_name.split(",").slice(0, 3).join(", ")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Chat Component ───────────────────────────────────────────────────────────
function EventChat({ eventId, currentUser }) {
  const [messages, setMessages] = useState(() => load(`chat_${eventId}`, SAMPLE_CHAT[eventId] || []));
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text || !currentUser) return;
    const msg = { uid: currentUser.uid, name: currentUser.displayName || currentUser.email?.split("@")[0] || "You", text, ts: Date.now() };
    const updated = [...messages, msg];
    setMessages(updated);
    save(`chat_${eventId}`, updated);
    setInput("");
  };

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const d = formatDate(msg.ts);
    if (!acc[d]) acc[d] = [];
    acc[d].push(msg);
    return acc;
  }, {});

  return (
    <div style={{ border: "1.5px solid #eee", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", height: 320 }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid #f0f0f0", background: "#fafafa", fontSize: 13, fontWeight: 700, color: "#444", display: "flex", alignItems: "center", gap: 6 }}>
        💬 Event chat <span style={{ color: "#bbb", fontWeight: 400 }}>({messages.length})</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 2 }}>
        {Object.entries(grouped).map(([day, msgs]) => (
          <div key={day}>
            <div style={{ textAlign: "center", fontSize: 11, color: "#bbb", margin: "8px 0 6px", fontWeight: 600 }}>{day}</div>
            {msgs.map((msg, i) => {
              const isMe = msg.uid === currentUser?.uid;
              return (
                <div key={i} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 6, marginBottom: 4 }}>
                  {!isMe && <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#e9ecef", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#555", flexShrink: 0 }}>{msg.name[0].toUpperCase()}</div>}
                  <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                    {!isMe && <span style={{ fontSize: 10, color: "#999", marginBottom: 2, paddingLeft: 4 }}>{msg.name}</span>}
                    <div style={{ background: isMe ? "#111" : "#f0f0f0", color: isMe ? "#fff" : "#222", padding: "8px 12px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px", fontSize: 13, lineHeight: 1.4 }}>{msg.text}</div>
                    <span style={{ fontSize: 10, color: "#bbb", marginTop: 2, paddingLeft: 4 }}>{formatTime(msg.ts)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {messages.length === 0 && <div style={{ textAlign: "center", color: "#ccc", fontSize: 13, marginTop: 60 }}>No messages yet. Say hi! 👋</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "10px 12px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8 }}>
        {currentUser ? (
          <>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Message…" style={{ flex: 1, padding: "8px 12px", borderRadius: 20, border: "1.5px solid #ddd", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            <button onClick={send} disabled={!input.trim()} style={{ padding: "8px 16px", borderRadius: 20, border: "none", background: input.trim() ? "#111" : "#eee", color: input.trim() ? "#fff" : "#bbb", fontWeight: 700, fontSize: 13, cursor: input.trim() ? "pointer" : "default", transition: "all 0.15s" }}>Send</button>
          </>
        ) : (
          <div style={{ flex: 1, fontSize: 12, color: "#bbb", textAlign: "center", padding: "8px" }}>Sign in to chat</div>
        )}
      </div>
    </div>
  );
}

// ─── Bracket Views ────────────────────────────────────────────────────────────
function SingleEliminationBracket({ teams }) {
  const [bracket, setBracket] = useState(() => buildSingleElim(teams));
  const updateScore = (ri, mi, field, val) => {
    setBracket(b => {
      const rounds = b.rounds.map((r, rIdx) => rIdx !== ri ? r : r.map((m, mIdx) => mIdx !== mi ? m : { ...m, [field]: val }));
      return { ...b, rounds };
    });
  };
  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", minWidth: bracket.rounds.length * 190 }}>
        {bracket.rounds.map((round, ri) => (
          <div key={ri} style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 172 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, textAlign: "center" }}>
              {ri === bracket.rounds.length - 1 ? "Final" : ri === bracket.rounds.length - 2 ? "Semi-finals" : `Round ${ri + 1}`}
            </div>
            {round.map((match, mi) => (
              <MatchBox key={mi} match={match} onScore={(f, v) => updateScore(ri, mi, f, v)} />
            ))}
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 80, paddingTop: 22 }}>
          <div style={{ background: "#FFF3CD", border: "1.5px solid #FFD43B", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>🏆</div><div style={{ fontSize: 10, fontWeight: 800, color: "#856404", marginTop: 2 }}>WINNER</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DoubleEliminationBracket({ teams }) {
  const [bracket, setBracket] = useState(() => buildDoubleElim(teams));
  const updateWScore = (ri, mi, field, val) => setBracket(b => ({ ...b, winnersRounds: b.winnersRounds.map((r, rIdx) => rIdx !== ri ? r : r.map((m, mIdx) => mIdx !== mi ? m : { ...m, [field]: val })) }));
  const updateLScore = (ri, mi, field, val) => setBracket(b => ({ ...b, losersRounds: b.losersRounds.map((r, rIdx) => rIdx !== ri ? r : r.map((m, mIdx) => mIdx !== mi ? m : { ...m, [field]: val })) }));
  const updateGF = (field, val) => setBracket(b => ({ ...b, grandFinal: [{ ...b.grandFinal[0], [field]: val }] }));

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#2B8A3E", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Winners bracket</div>
      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16, minWidth: bracket.winnersRounds.length * 185 }}>
          {bracket.winnersRounds.map((round, ri) => (
            <div key={ri} style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 172 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#999", textTransform: "uppercase", textAlign: "center" }}>{ri === bracket.winnersRounds.length - 1 ? "W Final" : `W Round ${ri + 1}`}</div>
              {round.map((match, mi) => <MatchBox key={mi} match={match} onScore={(f, v) => updateWScore(ri, mi, f, v)} />)}
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#C92A2A", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Losers bracket</div>
      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16, minWidth: bracket.losersRounds.length * 185 }}>
          {bracket.losersRounds.map((round, ri) => (
            <div key={ri} style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 172 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#999", textTransform: "uppercase", textAlign: "center" }}>{`L Round ${ri + 1}`}</div>
              {round.map((match, mi) => <MatchBox key={mi} match={match} onScore={(f, v) => updateLScore(ri, mi, f, v)} />)}
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#856404", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Grand Final</div>
      <div style={{ maxWidth: 185 }}>
        <MatchBox match={bracket.grandFinal[0]} onScore={(f, v) => updateGF(f, v)} />
      </div>
    </div>
  );
}

function RoundRobinBracket({ teams }) {
  const [bracket, setBracket] = useState(() => buildRoundRobin(teams));
  const updateMatch = (i, field, val) => setBracket(b => ({ ...b, matches: b.matches.map((m, mi) => mi !== i ? m : { ...m, [field]: val }) }));

  // compute standings
  const standings = teams.map(t => ({ name: t.name, uid: t.uid, w: 0, l: 0, d: 0, pts: 0, gf: 0, ga: 0 }));
  bracket.matches.forEach(m => {
    if (m.scoreA === "" || m.scoreB === "") return;
    const sA = parseInt(m.scoreA) || 0, sB = parseInt(m.scoreB) || 0;
    const tA = standings.find(s => s.uid === m.a.uid);
    const tB = standings.find(s => s.uid === m.b.uid);
    if (!tA || !tB) return;
    tA.gf += sA; tA.ga += sB; tB.gf += sB; tB.ga += sA;
    if (sA > sB) { tA.w++; tA.pts += 3; tB.l++; }
    else if (sB > sA) { tB.w++; tB.pts += 3; tA.l++; }
    else { tA.d++; tA.pts++; tB.d++; tB.pts++; }
  });
  standings.sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Standings</div>
        <div style={{ border: "1.5px solid #eee", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 36px 36px 36px 36px", gap: 0, background: "#fafafa", padding: "7px 12px", fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.5 }}>
            <span>Team</span><span style={{ textAlign: "center" }}>W</span><span style={{ textAlign: "center" }}>D</span><span style={{ textAlign: "center" }}>L</span><span style={{ textAlign: "center" }}>Pts</span>
          </div>
          {standings.map((t, i) => (
            <div key={t.uid} style={{ display: "grid", gridTemplateColumns: "1fr 36px 36px 36px 36px", padding: "8px 12px", borderTop: "1px solid #f0f0f0", background: i === 0 ? "#FFFBEB" : "#fff", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: i < 2 ? 700 : 400, color: "#111", display: "flex", alignItems: "center", gap: 5 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}.`} {t.name}</span>
              <span style={{ textAlign: "center", fontSize: 13, color: "#2B8A3E", fontWeight: 600 }}>{t.w}</span>
              <span style={{ textAlign: "center", fontSize: 13, color: "#888" }}>{t.d}</span>
              <span style={{ textAlign: "center", fontSize: 13, color: "#C92A2A" }}>{t.l}</span>
              <span style={{ textAlign: "center", fontSize: 13, fontWeight: 700 }}>{t.pts}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Fixtures</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {bracket.matches.map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #eee", borderRadius: 10, padding: "8px 12px" }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, textAlign: "right", color: "#111" }}>{m.a.name}</span>
            <input type="number" min={0} value={m.scoreA} onChange={e => updateMatch(i, "scoreA", e.target.value)} style={{ width: 38, textAlign: "center", border: "1.5px solid #ddd", borderRadius: 6, padding: "4px", fontSize: 13, fontFamily: "inherit" }} />
            <span style={{ fontSize: 11, color: "#bbb", fontWeight: 700 }}>VS</span>
            <input type="number" min={0} value={m.scoreB} onChange={e => updateMatch(i, "scoreB", e.target.value)} style={{ width: 38, textAlign: "center", border: "1.5px solid #ddd", borderRadius: 6, padding: "4px", fontSize: 13, fontFamily: "inherit" }} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#111" }}>{m.b.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchBox({ match, onScore }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #eee", borderRadius: 10, overflow: "hidden" }}>
      {[{ team: match.a, score: match.scoreA, field: "scoreA" }, { team: match.b, score: match.scoreB, field: "scoreB" }].map(({ team, score, field }, ti) => (
        <div key={ti} style={{ display: "flex", alignItems: "center", padding: "7px 10px", borderBottom: ti === 0 ? "1px solid #f5f5f5" : "none", background: team.name === "BYE" ? "#fafafa" : "#fff" }}>
          <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: team.name === "BYE" || team.name.includes("TBD") ? "#ccc" : "#111", fontStyle: team.name.includes("TBD") ? "italic" : "normal", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.name}</span>
          {team.name !== "BYE" && <input type="number" min={0} value={score} onChange={e => onScore(field, e.target.value)} placeholder="—" style={{ width: 36, textAlign: "center", border: "1px solid #eee", borderRadius: 5, padding: "2px", fontSize: 12, fontFamily: "inherit" }} />}
        </div>
      ))}
    </div>
  );
}

function TournamentBracket({ event }) {
  const teams = event.joined.filter(j => j.name !== "BYE");
  const fmt = event.tournamentFormat || "single";
  const [format, setFormat] = useState(fmt);
  if (teams.length < 2) return <div style={{ color: "#bbb", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Need at least 2 teams to generate bracket</div>;
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {TOURNAMENT_FORMATS.map(f => (
          <button key={f.id} onClick={() => setFormat(f.id)} style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${format === f.id ? "#111" : "#ddd"}`, background: format === f.id ? "#111" : "#fff", color: format === f.id ? "#fff" : "#666", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
            {f.id === "single" ? "⚔️" : f.id === "double" ? "🔁" : "🔄"} {f.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#999", marginBottom: 12 }}>{TOURNAMENT_FORMATS.find(f => f.id === format)?.desc} · {teams.length} teams</div>
      {format === "single" && <SingleEliminationBracket key={format} teams={teams} />}
      {format === "double" && <DoubleEliminationBracket key={format} teams={teams} />}
      {format === "robin"  && <RoundRobinBracket key={format} teams={teams} />}
    </div>
  );
}

// ─── Auth Components ──────────────────────────────────────────────────────────
function AuthModal({ onClose, onSignIn }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setLoading(true); setError("");
    try {
      const mods = await initFirebase();
      const result = await mods.signInWithPopup(auth, googleProvider);
      onSignIn({ uid: result.user.uid, displayName: result.user.displayName, email: result.user.email, photo: result.user.photoURL });
      onClose();
    } catch (e) {
      console.error("FIREBASE AUTH ERROR:", e.code, e.message);
      // Demo mode fallback — stable uid so host checks survive refresh
      const existingDemo = load("sportup_demo_uid", null);
      const demoUid = existingDemo || ("demo-" + Math.random().toString(36).slice(2));
      save("sportup_demo_uid", demoUid);
      const demo = { uid: demoUid, displayName: "Demo User", email: "demo@sportup.app", photo: null };
      onSignIn(demo); onClose();
    }
    setLoading(false);
  };

  const handleEmail = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true); setError("");
    try {
      const mods = await initFirebase();
      let result;
      if (mode === "signup") {
        result = await mods.createUserWithEmailAndPassword(auth, email, password);
        await mods.updateProfile(result.user, { displayName: displayName || email.split("@")[0] });
      } else {
        result = await mods.signInWithEmailAndPassword(auth, email, password);
      }
      onSignIn({ uid: result.user.uid, displayName: result.user.displayName || email.split("@")[0], email: result.user.email, photo: null });
      onClose();
    } catch (e) {
      // Demo fallback — key by email so same email = same uid
      const emailKey = "sportup_demo_uid_" + (email || "anon");
      const existingUid = load(emailKey, null);
      const demoUid = existingUid || ("demo-" + Math.random().toString(36).slice(2));
      save(emailKey, demoUid);
      const n = displayName || email.split("@")[0] || "Player";
      onSignIn({ uid: demoUid, displayName: n, email, photo: null });
      onClose();
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", width: 360, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 22, color: "#111", marginBottom: 4, letterSpacing: -0.5 }}>⚡ Welcome to SportUp</div>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 20px" }}>Sign in to join games, host events, and chat.</p>
        <button onClick={handleGoogle} disabled={loading} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "1.5px solid #ddd", background: "#fff", color: "#111", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0", color: "#ccc", fontSize: 12 }}><div style={{ flex: 1, height: 1, background: "#eee" }}/><span>or</span><div style={{ flex: 1, height: 1, background: "#eee" }}/></div>
        <div style={{ display: "flex", gap: 0, marginBottom: 14, border: "1.5px solid #eee", borderRadius: 10, overflow: "hidden" }}>
          {["signin","signup"].map(m => <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "8px", border: "none", background: mode === m ? "#111" : "#fff", color: mode === m ? "#fff" : "#888", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{m === "signin" ? "Sign in" : "Sign up"}</button>)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mode === "signup" && <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display name" style={{ padding: "10px 13px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none", fontFamily: "inherit" }} />}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ padding: "10px 13px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ padding: "10px 13px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none", fontFamily: "inherit" }} onKeyDown={e => e.key === "Enter" && handleEmail()} />
          {error && <div style={{ fontSize: 12, color: "#C92A2A" }}>{error}</div>}
          <button onClick={handleEmail} disabled={loading} style={{ padding: "11px", borderRadius: 10, border: "none", background: "#111", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {loading ? "Loading…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
function SportBadge({ sportId, size = "sm" }) {
  const s = SPORT_MAP[sportId]; if (!s) return null;
  const pad = size === "lg" ? "6px 14px" : "3px 10px";
  return <span style={{ background: s.bg, color: s.color, padding: pad, borderRadius: 99, fontSize: size === "lg" ? 13 : 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, border: `1px solid ${s.color}22` }}>{s.emoji} {s.label}</span>;
}

function TypeBadge({ type }) {
  const isT = type === "tournament";
  return <span style={{ background: isT ? "#FFF3CD" : "#E8F5E9", color: isT ? "#856404" : "#2E7D32", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{isT ? "🏆 Tournament" : "🎮 Pickup"}</span>;
}

function EventCard({ event, onClick }) {
  const s = SPORT_MAP[event.sport];
  const spotsLeft = event.slots - event.joined.length;
  return (
    <div onClick={() => onClick(event)} style={{ background: "#fff", border: "1.5px solid #eee", borderRadius: 16, padding: "18px 20px", cursor: "pointer", transition: "all 0.18s", position: "relative", overflow: "hidden" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = `0 4px 20px ${s.color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: s.bg, borderRadius: "0 16px 0 60px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.emoji}</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}><TypeBadge type={event.type} /></div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 17, color: "#111", marginBottom: 6, paddingRight: 50 }}>{event.title}</div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 12, display: "flex", flexDirection: "column", gap: 3 }}>
        <span>📅 {event.date} · {event.time}</span>
        <span>📍 {event.location}</span>
        <span>👤 {event.host?.name || event.host}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SportBadge sportId={event.sport} />
        <span style={{ fontSize: 12, fontWeight: 600, color: spotsLeft > 3 ? "#2B8A3E" : spotsLeft > 0 ? "#E8590C" : "#C92A2A" }}>{spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft > 1 ? "s" : ""} left` : "Full"}</span>
      </div>
    </div>
  );
}

// ─── NavBar ───────────────────────────────────────────────────────────────────
function NavBar({ page, setPage, myEventCount, user, onAuthClick, onSignOut }) {
  const tabs = [{ id: "home", label: "Browse", icon: "🔍" }, { id: "create", label: "Create", icon: "➕" }, { id: "my", label: "My Events", icon: "🗓️" }];
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", padding: "0 16px", height: 56, gap: 8 }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 20, color: "#111", marginRight: "auto", letterSpacing: -0.5, whiteSpace: "nowrap" }}>⚡ SportUp</div>
      <div style={{ display: "flex", gap: 3 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setPage(t.id)} style={{ background: page === t.id ? "#111" : "transparent", color: page === t.id ? "#fff" : "#555", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s" }}>
            <span>{t.icon}</span><span style={{ display: window.innerWidth < 500 ? "none" : "inline" }}>{t.label}</span>
            {t.id === "my" && myEventCount > 0 && <span style={{ background: "#E8590C", color: "#fff", borderRadius: 99, fontSize: 10, padding: "1px 5px", fontWeight: 700 }}>{myEventCount}</span>}
          </button>
        ))}
      </div>
      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 4 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: user.photo ? `url(${user.photo}) center/cover` : "#111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden", flexShrink: 0 }}>
            {user.photo ? <img src={user.photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (user.displayName?.[0] || "U").toUpperCase()}
          </div>
          <button onClick={onSignOut} style={{ fontSize: 12, color: "#999", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Sign out</button>
        </div>
      ) : (
        <button onClick={onAuthClick} style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #111", background: "#111", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Sign in</button>
      )}
    </nav>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ events, setSelectedEvent, setPage }) {
  const [search, setSearch] = useState(""); const [filterSport, setFilterSport] = useState("all"); const [filterType, setFilterType] = useState("all");
  const filtered = events.filter(e => {
    const q = search.toLowerCase();
    return (e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)) && (filterSport === "all" || e.sport === filterSport) && (filterType === "all" || e.type === filterType);
  });
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 28, color: "#111", margin: "0 0 4px", letterSpacing: -1 }}>Find your next game</h1>
        <p style={{ color: "#888", fontSize: 14, margin: 0 }}>Browse pickup games and tournaments near you</p>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by title or location…" style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #ddd", fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box", fontFamily: "inherit" }} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <select value={filterSport} onChange={e => setFilterSport(e.target.value)} style={{ padding: "7px 12px", borderRadius: 9, border: "1.5px solid #ddd", fontSize: 13, background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
          <option value="all">All sports</option>
          {SPORTS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: "7px 12px", borderRadius: 9, border: "1.5px solid #ddd", fontSize: 13, background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
          <option value="all">All types</option><option value="pickup">🎮 Pickup</option><option value="tournament">🏆 Tournament</option>
        </select>
        <div style={{ marginLeft: "auto", fontSize: 13, color: "#888", display: "flex", alignItems: "center" }}>{filtered.length} event{filtered.length !== 1 ? "s" : ""}</div>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#aaa" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
            <div style={{ fontWeight: 600 }}>No events found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters or <span style={{ color: "#E8590C", cursor: "pointer", textDecoration: "underline" }} onClick={() => setPage("create")}>create one!</span></div>
          </div>
        ) : filtered.map(e => <EventCard key={e.id} event={e} onClick={() => setSelectedEvent(e)} />)}
      </div>
    </div>
  );
}

// ─── Create Page ──────────────────────────────────────────────────────────────
function CreatePage({ onCreated, currentUser, onAuthRequired }) {
  const [form, setForm] = useState({ title: "", sport: "basketball", type: "pickup", date: "", time: "", locationText: "", locationObj: null, slots: 10, description: "", tournamentFormat: "single" });
  const [aiLoading, setAiLoading] = useState(false); const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const label = { fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 5 };
  const input = { width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

  const generateAI = async () => {
    setAiLoading(true);
    const s = SPORT_MAP[form.sport];
    try { const txt = await callClaude(`Write a short, exciting 2-sentence event description for a ${form.type === "tournament" ? "tournament" : "pickup game"} of ${s.label}. Energetic, welcoming. Under 80 words.`); set("description", txt.trim()); }
    catch { set("description", `Join us for a great ${s.label} ${form.type}! All skill levels welcome.`); }
    setAiLoading(false);
  };

  const handleSubmit = () => {
    if (!currentUser) { onAuthRequired(); return; }
    const locationLabel = form.locationObj?.address || form.locationText.trim();
    if (!form.title || !form.date || !locationLabel) { alert("Please fill in title, date, and location."); return; }
    const newEvent = {
      ...form,
      id: "e" + Date.now(),
      joined: [],
      host: { uid: currentUser.uid, name: currentUser.displayName || currentUser.email?.split("@")[0] || "You" },
      location: locationLabel,
      lat: form.locationObj?.lat || null,
      lng: form.locationObj?.lng || null,
      slots: Number(form.slots),
    };
    onCreated(newEvent); setSaved(true); setTimeout(() => setSaved(false), 2000);
    setForm({ title: "", sport: "basketball", type: "pickup", date: "", time: "", locationText: "", locationObj: null, slots: 10, description: "", tournamentFormat: "single" });
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 26, color: "#111", margin: "0 0 20px", letterSpacing: -1 }}>Create an event</h1>
      <div style={{ background: "#fff", border: "1.5px solid #eee", borderRadius: 18, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={label}>Event type</label>
          <div style={{ display: "flex", gap: 10 }}>
            {["pickup","tournament"].map(t => <button key={t} onClick={() => set("type", t)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${form.type === t ? "#111" : "#ddd"}`, background: form.type === t ? "#111" : "#fff", color: form.type === t ? "#fff" : "#555", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.15s" }}>{t === "pickup" ? "🎮 Pickup Game" : "🏆 Tournament"}</button>)}
          </div>
        </div>
        {form.type === "tournament" && (
          <div>
            <label style={label}>Tournament format</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TOURNAMENT_FORMATS.map(f => (
                <button key={f.id} onClick={() => set("tournamentFormat", f.id)} style={{ padding: "7px 12px", borderRadius: 9, border: `1.5px solid ${form.tournamentFormat === f.id ? "#111" : "#ddd"}`, background: form.tournamentFormat === f.id ? "#111" : "#fff", color: form.tournamentFormat === f.id ? "#fff" : "#666", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                  {f.id === "single" ? "⚔️" : f.id === "double" ? "🔁" : "🔄"} {f.label}
                  <span style={{ display: "block", fontSize: 10, fontWeight: 400, marginTop: 1, opacity: 0.7 }}>{f.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label style={label}>Sport</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SPORTS.map(s => <button key={s.id} onClick={() => set("sport", s.id)} style={{ padding: "7px 13px", borderRadius: 9, border: `2px solid ${form.sport === s.id ? s.color : "#eee"}`, background: form.sport === s.id ? s.bg : "#fff", color: form.sport === s.id ? s.color : "#777", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>{s.emoji} {s.label}</button>)}
          </div>
        </div>
        <div><label style={label}>Title</label><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Saturday Morning Run" style={input} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={label}>Date</label><input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={input} /></div>
          <div><label style={label}>Time</label><input type="time" value={form.time} onChange={e => set("time", e.target.value)} style={input} /></div>
        </div>
        <div>
          <label style={label}>Location</label>
          <LocationSearch
            value={form.locationObj}
            textValue={form.locationText}
            onTextChange={v => set("locationText", v)}
            onChange={v => { set("locationObj", v); set("locationText", v.address); }}
          />
          {form.locationObj?.lat && <div style={{ marginTop: 10 }}><MapView lat={form.locationObj.lat} lng={form.locationObj.lng} label={form.locationObj.address} /></div>}
        </div>
        <div><label style={label}>{form.type === "tournament" ? "Number of teams" : "Player slots"}</label><input type="number" min={2} max={64} value={form.slots} onChange={e => set("slots", e.target.value)} style={{ ...input, width: 120 }} /></div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <label style={{ ...label, margin: 0 }}>Description</label>
            <button onClick={generateAI} disabled={aiLoading} style={{ fontSize: 12, background: "#F8F0FF", color: "#7B2FBE", border: "1px solid #D0A8F5", borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}>{aiLoading ? "✨ Generating…" : "✨ Write with AI"}</button>
          </div>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe the event, skill level, what to bring…" rows={3} style={{ ...input, resize: "vertical" }} />
        </div>
        <button onClick={handleSubmit} style={{ padding: "13px", borderRadius: 12, border: "none", background: saved ? "#2B8A3E" : "#111", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "background 0.3s" }}>
          {saved ? "✅ Event created!" : currentUser ? "Create event →" : "Sign in to create →"}
        </button>
      </div>
    </div>
  );
}

// ─── Join Modal (captures contact info) ──────────────────────────────────────
function JoinModal({ event, currentUser, onConfirm, onClose }) {
  const isTournament = event.type === "tournament";
  const [teamName, setTeamName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState(currentUser?.email || "");

  const handleConfirm = () => {
    const name = isTournament ? teamName.trim() : (currentUser?.displayName || "Player");
    if (isTournament && !name) { alert("Enter your team name"); return; }
    onConfirm({ uid: currentUser.uid, name, email: contactEmail.trim(), phone: phone.trim(), players: [] });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 18, padding: "26px 24px", width: 360, maxWidth: "92vw", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 800, fontSize: 18, color: "#111", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
          {isTournament ? "🏅 Register your team" : "🎮 Join this game"}
        </div>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 18px" }}>Your contact info is only visible to the event host.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {isTournament && (
            <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Team name *" style={{ padding: "10px 13px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none", fontFamily: "inherit" }} autoFocus />
          )}
          {!isTournament && (
            <div style={{ padding: "10px 13px", borderRadius: 10, border: "1.5px solid #f0f0f0", fontSize: 14, color: "#555", background: "#fafafa" }}>
              👤 Joining as <strong>{currentUser?.displayName || "Player"}</strong>
            </div>
          )}
          <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="Contact email" style={{ padding: "10px 13px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number (optional)" style={{ padding: "10px 13px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none", fontFamily: "inherit" }} onKeyDown={e => e.key === "Enter" && handleConfirm()} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #ddd", background: "#fff", color: "#555", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleConfirm} style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: "#111", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            {isTournament ? "Register →" : "Join game →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Host Add Modal (captures contact info for manually added players) ─────────
function HostAddModal({ event, onConfirm, onClose }) {
  const isTournament = event.type === "tournament";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleConfirm = () => {
    const n = name.trim();
    if (!n) { alert("Name is required"); return; }
    if (event.joined.some(j => j.name.toLowerCase() === n.toLowerCase())) { alert(`"${n}" is already registered.`); return; }
    if (event.joined.length >= event.slots) { alert("Event is full."); return; }
    onConfirm({ uid: "host-added-" + Date.now(), name: n, email: email.trim(), phone: phone.trim(), hostAdded: true });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 18, padding: "26px 24px", width: 360, maxWidth: "92vw", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 800, fontSize: 18, color: "#111", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
          ✏️ Add {isTournament ? "a team" : "a player"}
        </div>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 18px" }}>Manually register on their behalf.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={isTournament ? "Team name *" : "Player name *"} style={{ padding: "10px 13px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none", fontFamily: "inherit" }} autoFocus />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Contact email (optional)" style={{ padding: "10px 13px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number (optional)" style={{ padding: "10px 13px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none", fontFamily: "inherit" }} onKeyDown={e => e.key === "Enter" && handleConfirm()} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #ddd", background: "#fff", color: "#555", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleConfirm} style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: "#856404", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Add →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Contacts Tab ─────────────────────────────────────────────────────────────
function ContactsTab({ event }) {
  const [copied, setCopied] = useState(null);
  const copyAll = () => {
    const rows = event.joined.map(p => [p.name, p.email || "—", p.phone || "—"].join("\t")).join("\n");
    navigator.clipboard.writeText(rows).catch(() => {});
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {event.type === "tournament" ? "Team" : "Player"} contacts ({event.joined.length})
        </div>
        <button onClick={copyAll} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 7, border: "1.5px solid #ddd", background: copied === "all" ? "#2B8A3E" : "#fff", color: copied === "all" ? "#fff" : "#555", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
          {copied === "all" ? "✅ Copied!" : "📋 Copy all"}
        </button>
      </div>
      {event.joined.length === 0 ? (
        <div style={{ textAlign: "center", color: "#ccc", fontSize: 13, padding: "30px 0" }}>No participants yet</div>
      ) : (
        <div style={{ border: "1.5px solid #eee", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 32px", background: "#fafafa", padding: "8px 12px", fontSize: 10, fontWeight: 800, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, gap: 8, borderBottom: "1px solid #eee" }}>
            <span>Name</span><span>Email</span><span>Phone</span><span></span>
          </div>
          {event.joined.map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 32px", padding: "10px 12px", gap: 8, borderBottom: i < event.joined.length - 1 ? "1px solid #f5f5f5" : "none", alignItems: "center", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.hostAdded ? <span title="Added by host" style={{ marginRight: 4, opacity: 0.5 }}>✏️</span> : null}
                {p.name}
              </span>
              <span style={{ fontSize: 12, color: p.email ? "#1971C2" : "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.email ? <a href={`mailto:${p.email}`} style={{ color: "inherit", textDecoration: "none" }}>{p.email}</a> : "—"}
              </span>
              <span style={{ fontSize: 12, color: p.phone ? "#2B8A3E" : "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.phone ? <a href={`tel:${p.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{p.phone}</a> : "—"}
              </span>
              <button
                onClick={() => {
                  const text = `${p.name}\t${p.email || "—"}\t${p.phone || "—"}`;
                  navigator.clipboard.writeText(text).catch(() => {});
                  setCopied(p.uid);
                  setTimeout(() => setCopied(null), 1500);
                }}
                title="Copy row"
                style={{ padding: "4px 6px", borderRadius: 6, border: "1px solid #eee", background: copied === p.uid ? "#2B8A3E" : "#fff", color: copied === p.uid ? "#fff" : "#aaa", fontSize: 11, cursor: "pointer", transition: "all 0.2s" }}
              >
                {copied === p.uid ? "✓" : "📋"}
              </button>
            </div>
          ))}
        </div>
      )}
      <p style={{ fontSize: 11, color: "#bbb", marginTop: 10, textAlign: "center" }}>Contact info is only visible to you as the host.</p>
    </div>
  );
}

// ─── Team Roster Component ────────────────────────────────────────────────────
function TeamRoster({ event, team, currentUser, isHost, onUpdateTeamPlayers, onHostRemove }) {
  const [expanded, setExpanded] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [copied, setCopied] = useState(false);

  const isTeamRegistrant = team.uid === currentUser?.uid;
  const canManage = isTeamRegistrant || isHost;
  const players = team.players || [];

  const teamLink = `${window.location.origin}${window.location.pathname}#event=${event.id}&team=${encodeURIComponent(team.uid)}`;

  const copyTeamLink = () => {
    navigator.clipboard.writeText(teamLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addPlayer = () => {
    const name = addName.trim();
    if (!name) return;
    const updated = [...players, { name, email: addEmail.trim(), phone: addPhone.trim(), id: "p-" + Date.now() }];
    onUpdateTeamPlayers(event.id, team.uid, updated);
    setAddName(""); setAddEmail(""); setAddPhone("");
  };

  const removePlayer = (id) => {
    onUpdateTeamPlayers(event.id, team.uid, players.filter(p => p.id !== id));
  };

  return (
    <div style={{ border: "1.5px solid #eee", borderRadius: 10, overflow: "hidden", marginBottom: 6 }}>
      {/* Team row header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: team.uid === currentUser?.uid ? "#EEF5FF" : "#fafafa", cursor: canManage ? "pointer" : "default" }}
        onClick={() => canManage && setExpanded(e => !e)}>
        <span style={{ fontSize: 15 }}>🏅</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#111" }}>
          {team.name}
          {team.uid === currentUser?.uid && <span style={{ marginLeft: 6, fontSize: 10, color: "#1971C2", fontWeight: 500 }}>(you)</span>}
          {team.hostAdded && <span style={{ marginLeft: 6, fontSize: 10, color: "#aaa", fontWeight: 400, background: "#eee", borderRadius: 4, padding: "1px 5px" }}>added by host</span>}
        </span>
        {players.length > 0 && (
          <span style={{ fontSize: 11, color: "#888", background: "#eee", borderRadius: 99, padding: "2px 7px" }}>{players.length} player{players.length !== 1 ? "s" : ""}</span>
        )}
        {isHost && team.uid !== currentUser?.uid && (
          <button onClick={e => { e.stopPropagation(); onHostRemove && onHostRemove(team.uid); }} style={{ fontSize: 11, color: "#C92A2A", background: "none", border: "1px solid #C92A2A33", borderRadius: 6, padding: "2px 8px", cursor: "pointer", flexShrink: 0 }}>Remove</button>
        )}
        {canManage && (
          <span style={{ fontSize: 12, color: "#aaa" }}>{expanded ? "▲" : "▼"}</span>
        )}
      </div>

      {/* Expanded panel */}
      {expanded && canManage && (
        <div style={{ padding: "12px 14px", borderTop: "1px solid #f0f0f0", background: "#fff" }}>
          {/* Share team link */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F7F7F5", borderRadius: 9, padding: "8px 10px", marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 1 }}>Team join link</div>
              <div style={{ fontSize: 11, color: "#777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{teamLink}</div>
            </div>
            <button onClick={copyTeamLink} style={{ flexShrink: 0, padding: "5px 10px", borderRadius: 7, border: "1.5px solid #ddd", background: copied ? "#2B8A3E" : "#fff", color: copied ? "#fff" : "#555", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
              {copied ? "✅ Copied!" : "🔗 Copy"}
            </button>
          </div>

          {/* Player list */}
          {players.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Players ({players.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {players.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fafafa", borderRadius: 8, padding: "7px 10px", border: "1px solid #f0f0f0" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#aaa", display: "flex", gap: 8 }}>
                        {p.email && <a href={`mailto:${p.email}`} style={{ color: "#1971C2", textDecoration: "none" }}>{p.email}</a>}
                        {p.phone && <a href={`tel:${p.phone}`} style={{ color: "#2B8A3E", textDecoration: "none" }}>{p.phone}</a>}
                        {!p.email && !p.phone && <span>No contact info</span>}
                      </div>
                    </div>
                    <button onClick={() => removePlayer(p.id)} style={{ fontSize: 10, color: "#C92A2A", background: "none", border: "1px solid #C92A2A33", borderRadius: 5, padding: "2px 6px", cursor: "pointer", flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add player form */}
          <div style={{ background: "#F7F7F5", borderRadius: 9, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Add a player</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Player name *" style={{ padding: "7px 10px", borderRadius: 7, border: "1.5px solid #ddd", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <input type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)} placeholder="Email (optional)" style={{ padding: "7px 10px", borderRadius: 7, border: "1.5px solid #ddd", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
                <input type="tel" value={addPhone} onChange={e => setAddPhone(e.target.value)} placeholder="Phone (optional)" style={{ padding: "7px 10px", borderRadius: 7, border: "1.5px solid #ddd", fontSize: 12, outline: "none", fontFamily: "inherit" }} onKeyDown={e => e.key === "Enter" && addPlayer()} />
              </div>
              <button onClick={addPlayer} style={{ padding: "7px", borderRadius: 7, border: "none", background: "#111", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Add player →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function EventDetail({ event, onJoin, onLeave, onUpdateSlots, onUpdateTeamPlayers, onBack, currentUser, onAuthRequired }) {
  const s = SPORT_MAP[event.sport];
  const spotsLeft = event.slots - event.joined.length;
  const isJoined = event.joined.some(j => j.uid === currentUser?.uid);
  const isHost = event.host?.uid === currentUser?.uid;
  const [aiTip, setAiTip] = useState("");
  const [tipLoading, setTipLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const canLeave = canLeaveEvent(event);

  // slot editing state
  const [editingSlots, setEditingSlots] = useState(false);
  const [slotsInput, setSlotsInput] = useState(String(event.slots));

  // modals
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showHostAddModal, setShowHostAddModal] = useState(false);

  const [shareToast, setShareToast] = useState(false);
  const shareLink = `${window.location.origin}${window.location.pathname}#event=${event.id}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2200);
  };

  const getRules = async () => {
    setTipLoading(true);
    try { const txt = await callClaude(`Give 3 quick essential rules or tips for playing ${s.label} in a casual ${event.type === "tournament" ? "tournament" : "pickup game"}. Use short bullet points with emoji. Under 80 words.`); setAiTip(txt.trim()); }
    catch { setAiTip(`• Play fair and have fun!\n• Communicate with teammates\n• All skill levels welcome`); }
    setTipLoading(false);
  };

  const handleSaveSlots = () => {
    const n = parseInt(slotsInput);
    if (isNaN(n) || n < 2 || n > 256) { alert("Please enter a number between 2 and 256."); return; }
    if (n < event.joined.length) { alert(`Can't set slots below current registrations (${event.joined.length}).`); return; }
    onUpdateSlots(event.id, n);
    setEditingSlots(false);
  };

  const handleHostRemove = (uid) => {
    if (window.confirm("Remove this participant?")) onLeave(event.id, uid);
  };

  const handleLeave = () => {
    if (!canLeave) return;
    if (window.confirm("Leave this event?")) onLeave(event.id, currentUser.uid);
  };

  const tabs = [
    { id: "info", label: "Info" },
    { id: "chat", label: "Chat 💬" },
    ...(event.type === "tournament" ? [{ id: "bracket", label: "Bracket 🏆" }] : []),
    ...(isHost ? [{ id: "contacts", label: "Contacts 📇" }] : []),
  ];

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "24px 16px" }}>
      {showJoinModal && (
        <JoinModal event={event} currentUser={currentUser}
          onConfirm={p => { onJoin(event.id, p); setShowJoinModal(false); }}
          onClose={() => setShowJoinModal(false)} />
      )}
      {showHostAddModal && (
        <HostAddModal event={event}
          onConfirm={p => { onJoin(event.id, p); setShowHostAddModal(false); }}
          onClose={() => setShowHostAddModal(false)} />
      )}

      <button onClick={onBack} style={{ background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>← Back</button>
      <div style={{ background: "#fff", border: "1.5px solid #eee", borderRadius: 20, overflow: "hidden" }}>
        <div style={{ background: s.bg, padding: "24px 24px 0", borderBottom: "1.5px solid #eee" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><TypeBadge type={event.type} /><SportBadge sportId={event.sport} /></div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 24, color: "#111", letterSpacing: -0.5 }}>{event.title}</div>
          <div style={{ fontSize: 13, color: "#666", marginTop: 6, marginBottom: 16, lineHeight: 1.8 }}>
            <div>📅 {event.date} · {event.time}</div>
            <div>📍 {event.location}</div>
            <div>👤 Hosted by <strong>{event.host?.name || event.host}</strong></div>
          </div>
          <div style={{ display: "flex", gap: 0, borderTop: "1px solid rgba(0,0,0,0.07)", overflowX: "auto" }}>
            {tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "10px 16px", border: "none", background: "transparent", fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500, color: activeTab === t.id ? "#111" : "#999", cursor: "pointer", borderBottom: `2px solid ${activeTab === t.id ? "#111" : "transparent"}`, transition: "all 0.15s", whiteSpace: "nowrap" }}>{t.label}</button>)}
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {activeTab === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {event.description && <div><div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 7 }}>About</div><p style={{ fontSize: 14, color: "#444", lineHeight: 1.65, margin: 0 }}>{event.description}</p></div>}
              {event.lat && <div><div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Location</div><MapView lat={event.lat} lng={event.lng} label={event.location} /></div>}

              {/* ── Share link ── */}
              <div style={{ background: "#F7F7F5", border: "1.5px solid #eee", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Shareable link</div>
                  <div style={{ fontSize: 12, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareLink}</div>
                </div>
                <button onClick={copyShareLink} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #ddd", background: shareToast ? "#2B8A3E" : "#fff", color: shareToast ? "#fff" : "#111", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                  {shareToast ? "✅ Copied!" : "📋 Copy link"}
                </button>
              </div>

              {/* ── Roster ── */}
              <div>
                {/* Roster header with editable slot count for host */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {event.type === "tournament" ? "Teams" : "Players"}
                  </div>
                  {editingSlots ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
                      <span style={{ fontSize: 12, color: "#888" }}>{event.joined.length}/</span>
                      <input
                        type="number" min={event.joined.length} max={256}
                        value={slotsInput}
                        onChange={e => setSlotsInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleSaveSlots(); if (e.key === "Escape") setEditingSlots(false); }}
                        autoFocus
                        style={{ width: 60, padding: "3px 7px", borderRadius: 7, border: "1.5px solid #FFD43B", fontSize: 13, outline: "none", fontFamily: "inherit", textAlign: "center" }}
                      />
                      <button onClick={handleSaveSlots} style={{ padding: "3px 10px", borderRadius: 7, border: "none", background: "#111", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Save</button>
                      <button onClick={() => { setEditingSlots(false); setSlotsInput(String(event.slots)); }} style={{ padding: "3px 8px", borderRadius: 7, border: "1px solid #ddd", background: "#fff", color: "#888", fontSize: 12, cursor: "pointer" }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
                      <span style={{ fontSize: 12, color: "#666" }}>({event.joined.length}/{event.slots})</span>
                      {isHost && (
                        <button onClick={() => { setEditingSlots(true); setSlotsInput(String(event.slots)); }}
                          title="Edit capacity"
                          style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, border: "1px solid #FFD43B88", background: "#FFFBEB", color: "#856404", cursor: "pointer", fontWeight: 600 }}>
                          ✏️ Edit
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 14 }}>
                  {event.joined.map((p, i) => {
                    if (event.type === "tournament") {
                      return (
                        <TeamRoster key={p.uid || i} event={event} team={p} currentUser={currentUser} isHost={isHost} onUpdateTeamPlayers={onUpdateTeamPlayers} onHostRemove={(uid) => { if (window.confirm("Remove this team?")) onLeave(event.id, uid); }} />
                      );
                    }
                    const isMe = p.uid === currentUser?.uid;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: isMe ? "#EEF5FF" : "#fafafa", border: `1.5px solid ${isMe ? "#1971C222" : "#f0f0f0"}`, borderRadius: 10, padding: "8px 12px", marginBottom: 6 }}>
                        <span style={{ fontSize: 15 }}>👤</span>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#111" }}>
                          {p.name}{isMe ? " (you)" : ""}
                          {p.hostAdded && <span style={{ marginLeft: 6, fontSize: 10, color: "#aaa", fontWeight: 400, background: "#eee", borderRadius: 4, padding: "1px 5px" }}>added by host</span>}
                        </span>
                        {isHost && !isMe && (
                          <button onClick={() => handleHostRemove(p.uid)} style={{ fontSize: 11, color: "#C92A2A", background: "none", border: "1px solid #C92A2A33", borderRadius: 6, padding: "2px 8px", cursor: "pointer", flexShrink: 0 }}>Remove</button>
                        )}
                        {isMe && !isHost && (
                          canLeave
                            ? <button onClick={handleLeave} style={{ fontSize: 11, color: "#C92A2A", background: "none", border: "1px solid #C92A2A33", borderRadius: 6, padding: "2px 8px", cursor: "pointer", flexShrink: 0 }}>Leave</button>
                            : <span style={{ fontSize: 10, color: "#bbb", flexShrink: 0 }}>Locked</span>
                        )}
                      </div>
                    );
                  })}
                  {Array(Math.max(0, spotsLeft)).fill(null).map((_, i) => (
                    <div key={"o"+i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fafafa", border: "1.5px dashed #e0e0e0", borderRadius: 10, padding: "8px 12px" }}>
                      <span style={{ fontSize: 13, color: "#ccc" }}>— Open spot</span>
                    </div>
                  ))}
                </div>

                {/* Host: add participant button */}
                {isHost && spotsLeft > 0 && (
                  <button onClick={() => setShowHostAddModal(true)} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px dashed #FFD43B", background: "#FFFBEB", color: "#856404", fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 4 }}>
                    ✏️ Add {event.type === "tournament" ? "a team" : "a player"} manually
                  </button>
                )}
                {isHost && spotsLeft === 0 && (
                  <div style={{ fontSize: 12, color: "#aaa", textAlign: "center", marginBottom: 4 }}>Event is full — increase capacity above to add more</div>
                )}

                {/* Non-host join */}
                {spotsLeft > 0 && !isJoined && !isHost && (
                  <button onClick={() => { if (!currentUser) { onAuthRequired(); return; } setShowJoinModal(true); }} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: s.color, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    {event.type === "tournament" ? "Register team →" : "Join game →"}
                  </button>
                )}
                {spotsLeft === 0 && !isJoined && !isHost && <div style={{ color: "#C92A2A", fontWeight: 700, fontSize: 13, marginTop: 4 }}>❌ This event is full</div>}
              </div>

              <div>
                <button onClick={getRules} disabled={tipLoading} style={{ width: "100%", padding: "11px", borderRadius: 11, border: "1.5px solid #D0A8F5", background: "#F8F0FF", color: "#7B2FBE", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  {tipLoading ? "✨ Loading tips…" : `✨ Get AI tips for ${s.label}`}
                </button>
                {aiTip && <div style={{ marginTop: 10, background: "#F8F0FF", border: "1px solid #D0A8F5", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#4A1090", lineHeight: 1.8, whiteSpace: "pre-line" }}>{aiTip}</div>}
              </div>
            </div>
          )}
          {activeTab === "chat" && <EventChat eventId={event.id} currentUser={currentUser} />}
          {activeTab === "bracket" && event.type === "tournament" && <TournamentBracket event={event} />}
          {activeTab === "contacts" && isHost && <ContactsTab event={event} />}
        </div>
      </div>
    </div>
  );
}

// ─── My Events Page ───────────────────────────────────────────────────────────
function MyEventsPage({ events, currentUser, setSelectedEvent }) {
  if (!currentUser) return (
    <div style={{ maxWidth: 500, margin: "60px auto", textAlign: "center", padding: "0 16px" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, color: "#111", marginBottom: 8 }}>Sign in to see your events</div>
      <p style={{ color: "#888", fontSize: 14 }}>Your hosted and joined events will appear here.</p>
    </div>
  );
  const hosted = events.filter(e => e.host?.uid === currentUser.uid);
  const joined = events.filter(e => e.joined.some(j => j.uid === currentUser.uid));
  const Section = ({ title, list }) => (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: "#111", margin: "0 0 12px", letterSpacing: -0.3 }}>{title} <span style={{ color: "#aaa", fontWeight: 400 }}>({list.length})</span></h2>
      {list.length === 0 ? <div style={{ color: "#bbb", fontSize: 13, padding: "12px 0" }}>None yet</div> : <div style={{ display: "grid", gap: 12 }}>{list.map(e => <EventCard key={e.id} event={e} onClick={() => setSelectedEvent(e)} />)}</div>}
    </div>
  );
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: currentUser.photo ? `url(${currentUser.photo}) center/cover` : "#111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", overflow: "hidden", flexShrink: 0 }}>
          {currentUser.photo ? <img src={currentUser.photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : currentUser.displayName?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 20, color: "#111", letterSpacing: -0.5 }}>{currentUser.displayName}</div>
          <div style={{ fontSize: 12, color: "#aaa" }}>{currentUser.email}</div>
        </div>
      </div>
      <Section title="Events I'm hosting" list={hosted} />
      <Section title="Events I've joined" list={joined} />
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [events, setEvents] = useState(() => load("sportup_events_v2", SAMPLE_EVENTS));
  const [page, setPage] = useState("home");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => load("sportup_user", null));
  const [showAuth, setShowAuth] = useState(false);

  // Replace HOST_DEMO sentinel with the real uid once we know who the user is
  const substituteHostUid = useCallback((uid) => {
    setEvents(ev => ev.map(e =>
      e.host?.uid === SAMPLE_HOST_UID ? { ...e, host: { ...e.host, uid } } : e
    ));
  }, []);

  useEffect(() => {
    if (currentUser?.uid) substituteHostUid(currentUser.uid);
  }, [currentUser, substituteHostUid]);

  useEffect(() => { save("sportup_events_v2", events); }, [events]);
  useEffect(() => { save("sportup_user", currentUser); }, [currentUser]);

  // ── Deep-link: open event from URL hash (#event=<id>) ──────────────────────
  const openEventFromHash = useCallback((evList) => {
    const hash = window.location.hash;
    const match = hash.match(/[#&]event=([^&]+)/);
    if (match) {
      const id = decodeURIComponent(match[1]);
      const found = evList.find(e => e.id === id);
      if (found) { setSelectedEvent(found); setPage("home"); }
    }
  }, []);

  useEffect(() => {
    openEventFromHash(events);
    const handler = () => openEventFromHash(events);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, [events, openEventFromHash]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap";
    link.rel = "stylesheet"; document.head.appendChild(link);
  }, []);

  const handleJoin = useCallback((eventId, player) => {
    setEvents(ev => ev.map(e => e.id === eventId ? { ...e, joined: [...e.joined, player] } : e));
    setSelectedEvent(prev => prev?.id === eventId ? { ...prev, joined: [...prev.joined, player] } : prev);
  }, []);

  const handleLeave = useCallback((eventId, uid) => {
    setEvents(ev => ev.map(e => e.id === eventId ? { ...e, joined: e.joined.filter(j => j.uid !== uid) } : e));
    setSelectedEvent(prev => prev?.id === eventId ? { ...prev, joined: prev.joined.filter(j => j.uid !== uid) } : prev);
  }, []);

  const handleUpdateSlots = useCallback((eventId, newSlots) => {
    setEvents(ev => ev.map(e => e.id === eventId ? { ...e, slots: newSlots } : e));
    setSelectedEvent(prev => prev?.id === eventId ? { ...prev, slots: newSlots } : prev);
  }, []);

  const handleUpdateTeamPlayers = useCallback((eventId, teamUid, players) => {
    setEvents(ev => ev.map(e => e.id === eventId ? { ...e, joined: e.joined.map(j => j.uid === teamUid ? { ...j, players } : j) } : e));
    setSelectedEvent(prev => prev?.id === eventId ? { ...prev, joined: prev.joined.map(j => j.uid === teamUid ? { ...j, players } : j) } : prev);
  }, []);

  const handleCreate = useCallback((newEvent) => {
    setEvents(ev => [newEvent, ...ev]); setPage("my");
  }, []);

  const handleSignOut = () => { setCurrentUser(null); save("sportup_user", null); };

  const myEventCount = currentUser ? events.filter(e => e.host?.uid === currentUser.uid || e.joined.some(j => j.uid === currentUser.uid)).length : 0;

  const navPage = (p) => { setSelectedEvent(null); window.location.hash = ""; setPage(p); };
  const openEvent = (ev) => { setSelectedEvent(ev); window.location.hash = `event=${ev.id}`; };
  const closeEvent = () => { setSelectedEvent(null); window.history.replaceState(null, "", window.location.pathname + window.location.search); };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#F7F7F5" }}>
      <NavBar page={page} setPage={navPage} myEventCount={myEventCount} user={currentUser} onAuthClick={() => setShowAuth(true)} onSignOut={handleSignOut} />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSignIn={u => { setCurrentUser(u); setShowAuth(false); }} />}
      {selectedEvent ? (
        <EventDetail
          event={events.find(e => e.id === selectedEvent.id) || selectedEvent}
          onJoin={handleJoin}
          onLeave={handleLeave}
          onUpdateSlots={handleUpdateSlots}
          onUpdateTeamPlayers={handleUpdateTeamPlayers}
          onBack={closeEvent}
          currentUser={currentUser}
          onAuthRequired={() => setShowAuth(true)}
        />
      ) : page === "home" ? (
        <HomePage events={events} setSelectedEvent={openEvent} setPage={setPage} />
      ) : page === "create" ? (
        <CreatePage onCreated={handleCreate} currentUser={currentUser} onAuthRequired={() => setShowAuth(true)} />
      ) : (
        <MyEventsPage events={events} currentUser={currentUser} setSelectedEvent={openEvent} />
      )}
    </div>
  );
}
