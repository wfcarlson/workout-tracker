import { useState, useEffect, useCallback, useRef } from "react";

// ─── Data ──────────────────────────────────────────────────────────
const ALL_EXERCISES = [
  { id: "ohp", name: "OHP", defaultWeight: 155, defaultReps: 4 },
  { id: "pullups_bw", name: "Pull-ups (BW)", defaultWeight: 0, defaultReps: 10 },
  { id: "barbell_row", name: "Barbell Row", defaultWeight: 135, defaultReps: 8 },
  { id: "shoulder_raises", name: "Shoulder Raises", defaultWeight: 18.5, defaultReps: 11 },
  { id: "face_pulls", name: "Face Pulls", defaultWeight: 20, defaultReps: 17 },
  { id: "lat_pullover", name: "Lat Stretch (Pullover)", defaultWeight: 30, defaultReps: 9 },
  { id: "hammer_curls", name: "Hammer Curls", defaultWeight: 20, defaultReps: 13 },
  { id: "zottman_curls", name: "Zottman Curls", defaultWeight: 20, defaultReps: 12 },
  { id: "ez_curls", name: "EZ Bar Curls", defaultWeight: 60, defaultReps: 7 },
  { id: "forearm_circuit", name: "Forearm Circuit", defaultWeight: 0, defaultReps: 0 },
  { id: "calf_raises_straight", name: "Straight Leg Calf Raises", defaultWeight: 18, defaultReps: 10 },
  { id: "calf_raises_bent", name: "Bent Leg Calf Raises", defaultWeight: 18, defaultReps: 10 },
  { id: "tib_raises", name: "Tibialis Raises", defaultWeight: 15, defaultReps: 18 },
  { id: "groin_lunges", name: "Groin Lunges", defaultWeight: 25, defaultReps: 8 },
  { id: "groin_stretch", name: "Groin Stretch", defaultWeight: 0, defaultReps: 10 },
  { id: "hip_flexor_raises", name: "Hip Flexor Leg Raises", defaultWeight: 0, defaultReps: 11 },
  { id: "atg_lunges", name: "ATG Split Lunges", defaultWeight: 55, defaultReps: 6 },
  { id: "zercher_dl", name: "Zercher Deadlifts", defaultWeight: 135, defaultReps: 8 },
  { id: "jefferson_curls", name: "Jefferson Curls", defaultWeight: 65, defaultReps: 10 },
  { id: "heavy_squat", name: "Heavy Squats", defaultWeight: 265, defaultReps: 5 },
  { id: "ql_curls", name: "QL Curls", defaultWeight: 15, defaultReps: 10 },
  { id: "hip_hinges", name: "Seated Hip Hinges", defaultWeight: 45, defaultReps: 10 },
  { id: "piriformis", name: "Piriformis Push-ups", defaultWeight: 0, defaultReps: 12 },
  { id: "rotator_cuff", name: "Rotator Cuff", defaultWeight: 20, defaultReps: 15 },
  { id: "flat_bench", name: "Flat Bench", defaultWeight: 245, defaultReps: 7 },
  { id: "wpullups", name: "Weighted Pull-ups", defaultWeight: 25, defaultReps: 6 },
  { id: "wdips", name: "Weighted Dips", defaultWeight: 25, defaultReps: 5 },
  { id: "db_incline", name: "DB Incline Bench w/ Stretch", defaultWeight: 50, defaultReps: 9 },
  { id: "preacher_curls", name: "Preacher Curls", defaultWeight: 25, defaultReps: 7 },
  { id: "skull_crushers", name: "Skull Crushers", defaultWeight: 30, defaultReps: 10 },
  { id: "lat_stretch_chest", name: "Lat Stretch (Pullover)", defaultWeight: 30, defaultReps: 9 },
  { id: "vmo_squats", name: "VMO Squats", defaultWeight: 30, defaultReps: 17 },
  { id: "hip_rotations", name: "Hip Rotations", defaultWeight: 0, defaultReps: 10 },
  { id: "dead_hangs", name: "Dead Hangs", defaultWeight: 0, defaultReps: 45 },
  { id: "nordic_curls", name: "Nordic Curls", defaultWeight: 0, defaultReps: 5 },
  { id: "pistol_squats", name: "Pistol Squats", defaultWeight: 0, defaultReps: 5 },
  { id: "burpees", name: "Burpees", defaultWeight: 0, defaultReps: 20 },
  { id: "soleus_raises", name: "Soleus Raises", defaultWeight: 0, defaultReps: 20 },
  { id: "split_squats", name: "Split Squats", defaultWeight: 55, defaultReps: 6 },
  { id: "bb_incline_bench", name: "Barbell Incline Bench", defaultWeight: 115, defaultReps: 7 },
  { id: "bb_curls", name: "Barbell Curls", defaultWeight: 65, defaultReps: 8 },
  { id: "machine_press", name: "Machine Press", defaultWeight: 110, defaultReps: 8 },
  { id: "dips_bw", name: "Dips (BW)", defaultWeight: 0, defaultReps: 10 },
];

const getExercise = (id, custom = []) => [...ALL_EXERCISES, ...custom].find(e => e.id === id) || { id, name: id, defaultWeight: 0, defaultReps: 10 };

const WORKOUTS = [
  {
    id: "shoulders_back_arms", name: "Shoulders, Back + Arms", icon: "💪",
    groups: [
      { label: "Superset", exercises: [{ id: "ohp", scheme: "135×8, 155×4, 155×4" }, { id: "pullups_bw", scheme: "3 × 8–12" }] },
      { label: "Superset", exercises: [{ id: "barbell_row", scheme: "3×8, ~135 lbs" }, { id: "shoulder_raises", scheme: "3×10–12, 18.5 lb DBs" }] },
      { label: null, exercises: [{ id: "face_pulls", scheme: "3×15–20, light" }] },
      { label: null, exercises: [{ id: "lat_pullover", scheme: "3×8–10, 30–35 lbs" }] },
      { label: null, choices: [{ id: "hammer_curls", scheme: "3×12–15, 20 lb DBs" }, { id: "zottman_curls", scheme: "3×12–15, 20 lb DBs" }] },
      { label: null, exercises: [{ id: "ez_curls", scheme: "3×7, 60 lbs" }] },
      { label: null, exercises: [{ id: "forearm_circuit", scheme: "Circuit" }] },
    ],
  },
  {
    id: "legs", name: "Legs A / B", icon: "🦵",
    groups: [
      { label: "Warmup Circuit — 3 rounds",
        choices: [{ id: "calf_raises_straight", scheme: "8–10ea, 15–20 lbs" }, { id: "calf_raises_bent", scheme: "8–10ea, 15–20 lbs" }],
        exercises: [{ id: "tib_raises", scheme: "16–22 reps" }, { id: "groin_lunges", scheme: "8 reps, 25 lbs" }],
      },
      { label: "Superset — pick one each",
        choices: [{ id: "hip_flexor_raises", scheme: "3×10–12" }, { id: "atg_lunges", scheme: "3×5–8ea, 40–65 lbs" }],
        choices2: [{ id: "zercher_dl", scheme: "3×8, 135–145 lbs" }, { id: "jefferson_curls", scheme: "3×10, 65 lbs" }],
      },
      { label: null, exercises: [{ id: "heavy_squat", scheme: "255–285+, 5–6 reps" }] },
      { label: "Lower Back Circuit (optional) — 3 rounds", exercises: [
        { id: "ql_curls", scheme: "10 reps, 15–20 lbs" },
        { id: "hip_hinges", scheme: "10 reps, 45 lbs" },
        { id: "piriformis", scheme: "12 reps" },
      ]},
    ],
  },
  {
    id: "chest_arms", name: "Chest + Arms", icon: "🏋️",
    groups: [
      { label: "Warmup", exercises: [{ id: "rotator_cuff", scheme: "3×15, 20 lbs" }] },
      { label: null, exercises: [{ id: "flat_bench", scheme: "2×6–8, 245 lbs" }] },
      { label: "Superset", exercises: [{ id: "wpullups", scheme: "3–4×5–7, +25 lbs" }, { id: "wdips", scheme: "3–4×5–6, +25 lbs" }] },
      { label: "Superset", exercises: [{ id: "db_incline", scheme: "3×8–10, 50 lb DBs" }, { id: "preacher_curls", scheme: "3×6–8, 25 lb DBs" }] },
      { label: "Superset", exercises: [{ id: "skull_crushers", scheme: "3×8–12, 30 lb DBs" }, { id: "lat_stretch_chest", scheme: "3×8–10, 30 lbs" }] },
    ],
  },
  {
    id: "aux_legs", name: "Aux Legs / Mobility", icon: "🧘",
    groups: [
      { label: "Pick what you need", exercises: [
        { id: "ql_curls", scheme: "10 reps, 15–20 lbs" }, { id: "hip_hinges", scheme: "10 reps, 45 lbs" },
        { id: "piriformis", scheme: "12 reps" }, { id: "vmo_squats", scheme: "3×15–20, 30–35 lbs" },
        { id: "groin_lunges", scheme: "" }, { id: "hip_rotations", scheme: "10 reps" },
        { id: "dead_hangs", scheme: "30–60 sec" }, { id: "nordic_curls", scheme: "" },
        { id: "pistol_squats", scheme: "" }, { id: "burpees", scheme: "Conditioning" },
      ]},
    ],
  },
];

const WEEK_ORDER = ["shoulders_back_arms", "legs", "chest_arms", "aux_legs"];
const FREE_WORKOUT = { id: "free", name: "Free Workout", icon: "📋", groups: [] };

// ─── Storage ───────────────────────────────────────────────────────
const UPSTASH_URL = import.meta.env.VITE_UPSTASH_URL;
const UPSTASH_TOKEN = import.meta.env.VITE_UPSTASH_TOKEN;
const KEY_PREFIX = import.meta.env.DEV ? "dev-" : "";

async function loadData(key, fallback) {
  try {
    const r = await fetch(`${UPSTASH_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
    const { result } = await r.json();
    return result ? JSON.parse(result) : fallback;
  } catch { return fallback; }
}
async function saveData(key, val) {
  try {
    await fetch(`${UPSTASH_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify([["SET", key, JSON.stringify(val)]]),
    });
  } catch (e) { console.error("Save failed", e); }
}

function getSessionEquipment(session, exerciseId) {
  return session.equipment?.[exerciseId]
    || session.log?.[exerciseId]?.find(s => s.equipment)?.equipment
    || session.log?.[exerciseId]?.find(s => s.equip)?.equip
    || null;
}

function getHistory(sessions, exerciseId, limit = 3) {
  const results = [];
  for (let i = sessions.length - 1; i >= 0 && results.length < limit; i--) {
    const s = sessions[i];
    if (s.log?.[exerciseId]?.length > 0) results.push({ date: s.date, sets: s.log[exerciseId], equipment: getSessionEquipment(s, exerciseId) });
  }
  return results;
}

function formatDate(d) { return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function fmtTime(sec) { const m = Math.floor(sec / 60); const s = sec % 60; return `${m}:${s < 10 ? "0" : ""}${s}`; }
function formatSetList(sets) { return sets.map(s => s.weight > 0 ? `${s.weight}×${s.reps}` : `${s.reps}`).join(" · "); }

function exportSession(session, workout, customExercises) {
  const date = new Date(session.date + "T12:00:00");
  const dateStr = date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
  const allEx = [...ALL_EXERCISES, ...(customExercises || [])];
  let lines = [`${workout.name} - ${dateStr}`];
  if (session.duration) lines.push(fmtTime(session.duration));
  lines.push("");
  const order = session.exerciseOrder || Object.keys(session.log);
  for (const exId of order) {
    const sets = session.log[exId];
    if (!sets || sets.length === 0) continue;
    const ex = allEx.find(e => e.id === exId) || { name: exId };
    const equipment = getSessionEquipment(session, exId);
    const equip = equipment ? ` (${equipment})` : "";
    const hasWeight = sets.some(s => s.weight > 0);
    if (hasWeight) {
      const weights = [...new Set(sets.map(s => s.weight))];
      const reps = sets.map(s => s.reps).join(",");
      if (weights.length === 1) lines.push(`${ex.name}${equip} ${weights[0]} - ${reps}`);
      else lines.push(`${ex.name}${equip} ${sets.map(s => `${s.weight}x${s.reps}`).join(",")}`);
    } else {
      lines.push(`${ex.name}${equip} ${sets.map(s => s.reps).join(",")}`);
    }
  }
  return lines.join("\n");
}

// ─── Styles ────────────────────────────────────────────────────────
const EQUIP_OPTIONS = ["DB", "BB", "EZ", "KB", "BW", "Cable"];

const S = {
  input: { padding: "7px 8px", background: "#2a2a24", border: "1px solid #3a3a32", borderRadius: 4, color: "#e8e4d8", fontSize: 16, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", outline: "none" },
  btn: (active) => ({ background: active ? "#4a6a2a" : "none", border: `1px solid ${active ? "#5a7a3a" : "#3a3a32"}`, borderRadius: 6, color: active ? "#d4e8c4" : "#8a8a6a", padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: active ? 600 : 400 }),
  tag: { fontSize: 11, color: "#5a5a4a", textTransform: "uppercase", letterSpacing: 1.1, fontWeight: 700, marginBottom: 6 },
};

// ─── Components ────────────────────────────────────────────────────
function Timer({ startTime, lapAt, onClick }) {
  const [elapsed, setElapsed] = useState(() => startTime ? Math.floor((Date.now() - startTime) / 1000) : 0);
  useEffect(() => {
    if (!startTime) return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [startTime]);
  if (!startTime) return null;
  const lapSecs = lapAt ? Math.floor((Date.now() - lapAt) / 1000) : null;
  return (
    <div onClick={onClick} style={{ padding: "10px 0", display: "flex", alignItems: "center", cursor: "pointer", userSelect: "none" }}>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#8ab86a", flexShrink: 0, animation: "pulse 2s infinite" }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, color: "#e8e4d8", fontWeight: 700 }}>{fmtTime(elapsed)}</span>
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        {lapAt
          ? <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#8ab86a", paddingRight: 4 }}>↺ {fmtTime(lapSecs)}</span>
          : <span style={{ fontSize: 13, color: "#3a4a2a", paddingRight: 4 }}>tap to lap</span>}
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }`}</style>
    </div>
  );
}

function InlineTimer({ startTime, lapAt }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [startTime]);
  if (!startTime) return null;
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const lapSecs = lapAt ? Math.floor((Date.now() - lapAt) / 1000) : null;
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: "#a8c888", lineHeight: 1.2 }}>{fmtTime(elapsed)}</div>
      {lapSecs !== null && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#6a8a4a", lineHeight: 1.2 }}>lap {fmtTime(lapSecs)}</div>}
    </div>
  );
}

function ChoicePicker({ choices, chosen, onChoose, onHide, label, customExercises }) {
  const [pickingOther, setPickingOther] = useState(false);
  const [otherQuery, setOtherQuery] = useState("");
  const allEx = [...ALL_EXERCISES, ...(customExercises || [])];
  const choiceIds = new Set(choices.map(c => c.id));
  const chosenIds = Array.isArray(chosen) ? chosen : chosen ? [chosen] : [];
  const bothIds = choices.map(c => c.id);
  const bothSelected = bothIds.length > 1 && bothIds.every(id => chosenIds.includes(id));
  const otherResults = otherQuery.length > 0
    ? allEx.filter(e => !choiceIds.has(e.id) && e.name.toLowerCase().includes(otherQuery.toLowerCase())).slice(0, 5)
    : [];
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        {label && <div style={{ ...S.tag, marginBottom: 0, fontSize: 10 }}>{label}</div>}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => { setPickingOther(p => !p); setOtherQuery(""); }} title="Choose a different exercise" style={{ background: "none", border: "none", color: "#5a7a4a", fontSize: 18, cursor: "pointer", padding: "0 2px", lineHeight: 1 }}>+</button>
          {onHide && <button onClick={onHide} title="Skip this group" style={{ background: "none", border: "none", color: "#5a5a4a", fontSize: 16, cursor: "pointer", padding: "0 2px", lineHeight: 1 }}>×</button>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {choices.map(c => {
          const ex = getExercise(c.id, customExercises);
          return (
            <button key={c.id} onClick={() => onChoose(c.id)} style={{ ...S.btn(chosenIds.length === 1 && chosenIds[0] === c.id), padding: "5px 12px", fontSize: 12 }}>{ex.name}</button>
          );
        })}
        {choices.length > 1 && (
          <button onClick={() => onChoose(bothIds)} style={{ ...S.btn(bothSelected), padding: "5px 12px", fontSize: 12 }}>Both</button>
        )}
      </div>
      {pickingOther && (
        <div style={{ marginTop: 6 }}>
          <input
            autoFocus
            placeholder="Search all exercises…"
            value={otherQuery}
            onChange={e => setOtherQuery(e.target.value)}
            style={{ ...S.input, width: "100%", marginBottom: 4 }}
          />
          {otherResults.map(e => (
            <button key={e.id} onClick={() => { onChoose(e.id); setPickingOther(false); setOtherQuery(""); }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: "1px solid #2a2a24", color: "#c8c4b8", padding: "7px 4px", fontSize: 13, cursor: "pointer" }}>
              {e.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SetLogger({ exerciseId, exercise, session, setSession }) {
  const logged = session.log[exerciseId] || [];
  const equipment = session.equipment?.[exerciseId] || null;

  const setEquipment = (type) => {
    setSession(s => ({
      ...s,
      equipment: { ...(s.equipment || {}), [exerciseId]: s.equipment?.[exerciseId] === type ? null : type },
    }));
  };

  const addSet = () => {
    const last = logged.length > 0 ? logged[logged.length - 1] : { weight: exercise.defaultWeight, reps: exercise.defaultReps };
    setSession(s => ({
      ...s,
      log: { ...s.log, [exerciseId]: [...(s.log[exerciseId] || []), { weight: last.weight, reps: last.reps }] },
      exerciseOrder: s.exerciseOrder.includes(exerciseId) ? s.exerciseOrder : [...s.exerciseOrder, exerciseId],
    }));
  };
  const updateSet = (idx, field, val) => {
    const sets = [...logged]; sets[idx] = { ...sets[idx], [field]: val === "" ? "" : Number(val) };
    setSession(s => ({ ...s, log: { ...s.log, [exerciseId]: sets } }));
  };
  const removeSet = (idx) => {
    const sets = logged.filter((_, i) => i !== idx);
    setSession(s => ({ ...s, log: { ...s.log, [exerciseId]: sets } }));
  };
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {EQUIP_OPTIONS.map(opt => (
          <button key={opt} onClick={() => setEquipment(opt)} style={{
            background: equipment === opt ? "#2a3a1a" : "none",
            border: `1px solid ${equipment === opt ? "#4a5a2a" : "#2a2a24"}`,
            borderRadius: 4, color: equipment === opt ? "#a8c878" : "#4a4a3a",
            padding: "2px 7px", fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
          }}>{opt}</button>
        ))}
      </div>
      {logged.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ width: 18, flexShrink: 0 }} />
          <span style={{ width: 64, fontSize: 10, color: "#4a4a3a", textAlign: "center" }}>weight</span>
          <span style={{ fontSize: 10, color: "#4a4a3a", width: 13, flexShrink: 0 }} />
          <span style={{ width: 52, fontSize: 10, color: "#4a4a3a", textAlign: "center" }}>reps</span>
        </div>
      )}
      {logged.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ color: "#8a8a7a", fontSize: 12, width: 18, flexShrink: 0 }}>S{i + 1}</span>
          <input type="number" inputMode="decimal" value={s.weight} onChange={e => updateSet(i, "weight", e.target.value)} onFocus={e => e.target.select()} style={{ ...S.input, width: 64 }} />
          <span style={{ color: "#6a6a5a", fontSize: 13 }}>×</span>
          <input type="number" inputMode="numeric" value={s.reps} onChange={e => updateSet(i, "reps", e.target.value)} onFocus={e => e.target.select()} style={{ ...S.input, width: 52 }} />
          <button onClick={() => removeSet(i)} style={{ background: "none", border: "none", color: "#6a4a4a", fontSize: 16, cursor: "pointer", padding: "2px 6px" }}>×</button>
        </div>
      ))}
      <button onClick={addSet} style={{ background: "none", border: "1px dashed #3a3a32", borderRadius: 4, color: "#8a8a6a", padding: "5px 14px", fontSize: 13, cursor: "pointer", marginTop: 2 }}>+ Set</button>
    </div>
  );
}

function ExerciseHistory({ exerciseId, sessions }) {
  const history = getHistory(sessions, exerciseId);
  if (history.length === 0) return <div style={{ fontSize: 12, color: "#5a5a4a", marginTop: 4 }}>No history yet</div>;
  return (
    <div style={{ marginTop: 6 }}>
      {history.map((h, i) => (
        <div key={i} style={{ fontSize: 12, color: "#7a7a6a", marginBottom: 2, fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ color: "#5a5a4a" }}>{formatDate(h.date)}</span>{" "}
          {h.equipment && <span style={{ color: "#8ab86a", fontWeight: 600 }}>{h.equipment} </span>}
          {formatSetList(h.sets)}
        </div>
      ))}
    </div>
  );
}

function ExerciseCard({ exerciseId, scheme, session, setSession, sessions, onRemove, isAdded, customExercises }) {
  const [expanded, setExpanded] = useState(false);
  const exercise = getExercise(exerciseId, customExercises);
  const logged = session?.log?.[exerciseId] || [];
  const done = logged.length > 0;
  return (
    <div style={{
      background: done ? "#1e2218" : "#1c1c18", border: `1px solid ${done ? "#3a4a2a" : "#2a2a24"}`,
      borderRadius: 8, padding: "12px 14px", marginBottom: 6,
      borderLeft: done ? "3px solid #6a8a4a" : isAdded ? "3px solid #5a5a3a" : "3px solid transparent",
    }}>
      <div onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#e8e4d8" }}>
            {exercise.name}
            {isAdded && <span style={{ fontSize: 10, color: "#6a6a4a", marginLeft: 6 }}>added</span>}
          </div>
          {done && <span style={{ fontSize: 11, color: "#6a8a4a", fontWeight: 600, flexShrink: 0, marginLeft: 8, display: "flex", alignItems: "center", gap: 4 }}>
            {session?.equipment?.[exerciseId] && (
              <span style={{ fontSize: 10, color: "#5a7a3a", background: "#1e2a14", border: "1px solid #3a4a2a", borderRadius: 3, padding: "1px 4px", fontFamily: "'JetBrains Mono', monospace" }}>{session.equipment[exerciseId]}</span>
            )}
            <span>{logged.map((s, i) => (i > 0 ? " · " : "") + (s.weight > 0 ? `${s.weight}×${s.reps}` : `${s.reps}`))}</span>
          </span>}
        </div>
        {scheme && <div style={{ fontSize: 12, color: "#6a6a5a", marginTop: 2 }}>{scheme}</div>}
      </div>
      {expanded && (
        <div style={{ marginTop: 8, borderTop: "1px solid #2a2a24", paddingTop: 8 }}>
          <div style={S.tag}>History</div>
          <ExerciseHistory exerciseId={exerciseId} sessions={sessions} />
          <div style={{ ...S.tag, marginTop: 12 }}>Log</div>
          <SetLogger exerciseId={exerciseId} exercise={exercise} session={session} setSession={setSession} />
          {onRemove && !done && (
            <button onClick={e => { e.stopPropagation(); onRemove(exerciseId); }} style={{
              background: "none", border: "1px solid #4a2a2a", borderRadius: 4, color: "#8a4a4a",
              padding: "4px 12px", fontSize: 12, cursor: "pointer", marginTop: 8
            }}>Remove</button>
          )}
        </div>
      )}
    </div>
  );
}

function ExerciseSearch({ onAdd, session, customExercises, setCustomExercises }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [superset, setSuperset] = useState(false);
  const [firstEx, setFirstEx] = useState(null);
  const ref = useRef(null);
  const allEx = [...ALL_EXERCISES, ...customExercises];
  const currentIds = new Set([
    ...(session.exerciseOrder || []),
    ...(session.addedItems
      ? session.addedItems.flatMap(i => i.type === "single" ? [i.id] : i.exercises)
      : (session.addedExercises || [])),
    ...(firstEx ? [firstEx] : []),
  ]);
  const filtered = query.length > 0 ? allEx.filter(e => e.name.toLowerCase().includes(query.toLowerCase()) && !currentIds.has(e.id)) : [];
  const exactMatch = allEx.some(e => e.name.toLowerCase() === query.toLowerCase());

  const close = () => { setQuery(""); setOpen(false); setFirstEx(null); setSuperset(false); };

  const pick = (id) => {
    if (superset && !firstEx) { setFirstEx(id); setQuery(""); }
    else if (superset && firstEx) { onAdd(firstEx); onAdd(id); close(); }
    else { onAdd(id); close(); }
  };

  const addCustom = () => {
    if (!query.trim()) return;
    const id = "custom_" + query.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
    if (!allEx.find(e => e.id === id)) setCustomExercises(prev => [...prev, { id, name: query.trim(), defaultWeight: 0, defaultReps: 10 }]);
    pick(id);
  };

  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) close(); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, [open]);

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ ...S.btn(false), width: "100%", marginTop: 8, padding: "10px", textAlign: "center" }}>+ Add Exercise</button>
  );

  const firstExName = firstEx ? allEx.find(e => e.id === firstEx)?.name : null;
  return (
    <div ref={ref} style={{ marginTop: 8, background: "#1c1c18", border: "1px solid #3a3a32", borderRadius: 8, padding: 12 }}>
      {superset && firstEx ? (
        <div style={{ fontSize: 12, color: "#8a8a5a", marginBottom: 8 }}>
          Superset: <span style={{ color: "#c8c4b8" }}>{firstExName}</span> + pick partner
        </div>
      ) : (
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
          <button onClick={() => setSuperset(s => !s)} style={{ ...S.btn(superset), fontSize: 11, padding: "3px 10px" }}>Superset</button>
          {superset && <span style={{ fontSize: 11, color: "#6a6a5a" }}>Pick 2 exercises</span>}
        </div>
      )}
      <input autoFocus type="text"
        placeholder={superset && firstEx ? "Partner exercise..." : "Search or type new exercise..."}
        value={query} onChange={e => setQuery(e.target.value)}
        style={{ ...S.input, width: "100%", textAlign: "left", marginBottom: 8, boxSizing: "border-box" }} />
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {filtered.slice(0, 8).map(ex => (
          <button key={ex.id} onClick={() => pick(ex.id)} style={{
            display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
            color: "#c8c4b8", padding: "8px 6px", cursor: "pointer", fontSize: 14, borderBottom: "1px solid #2a2a24",
          }}>{ex.name}</button>
        ))}
        {query.trim() && !exactMatch && (
          <button onClick={addCustom} style={{
            display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
            color: "#8a8a5a", padding: "8px 6px", cursor: "pointer", fontSize: 13, fontStyle: "italic"
          }}>+ Create "{query.trim()}"</button>
        )}
      </div>
      <button onClick={close} style={{ ...S.btn(false), marginTop: 6, width: "100%", textAlign: "center" }}>Cancel</button>
    </div>
  );
}

function GroupCreator({ onAdd, session, customExercises }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [exercises, setExercises] = useState([]);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const allEx = [...ALL_EXERCISES, ...customExercises];
  const takenIds = new Set([
    ...(session.exerciseOrder || []),
    ...(session.addedItems || []).flatMap(i => i.type === "single" ? [i.id] : i.exercises),
    ...exercises,
  ]);
  const filtered = query ? allEx.filter(e => !takenIds.has(e.id) && e.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6) : [];

  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setLabel(""); setExercises([]); setQuery(""); } };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const commit = () => {
    if (exercises.length === 0) return;
    onAdd(label.trim() || null, exercises);
    setOpen(false); setLabel(""); setExercises([]); setQuery("");
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ ...S.btn(false), width: "100%", marginTop: 4, padding: "10px", textAlign: "center" }}>+ Add Group</button>
  );

  return (
    <div ref={ref} style={{ marginTop: 4, background: "#1c1c18", border: "1px solid #3a3a32", borderRadius: 8, padding: 12 }}>
      <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Group label (optional)"
        style={{ ...S.input, width: "100%", textAlign: "left", marginBottom: 8, boxSizing: "border-box" }} />
      {exercises.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {exercises.map((id, i) => {
            const ex = getExercise(id, customExercises);
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 4px", borderBottom: "1px solid #2a2a24" }}>
                <span style={{ fontSize: 13, color: "#c8c4b8" }}>{ex.name}</span>
                <button onClick={() => setExercises(e => e.filter((_, j) => j !== i))}
                  style={{ background: "none", border: "none", color: "#6a4a4a", fontSize: 16, cursor: "pointer", padding: "0 4px" }}>×</button>
              </div>
            );
          })}
        </div>
      )}
      <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
        placeholder={exercises.length === 0 ? "Search exercises..." : "Add another exercise..."}
        style={{ ...S.input, width: "100%", textAlign: "left", marginBottom: 4, boxSizing: "border-box" }} />
      {filtered.length > 0 && (
        <div style={{ maxHeight: 160, overflowY: "auto", marginBottom: 8 }}>
          {filtered.map(ex => (
            <button key={ex.id} onClick={() => { setExercises(e => [...e, ex.id]); setQuery(""); }} style={{
              display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
              color: "#c8c4b8", padding: "7px 4px", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #1c1c18",
            }}>{ex.name}</button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={commit} disabled={exercises.length === 0}
          style={{ ...S.btn(exercises.length > 0), flex: 1, padding: "9px", textAlign: "center" }}>
          {exercises.length > 0 ? `Add Group (${exercises.length})` : "Add Group"}
        </button>
        <button onClick={() => { setOpen(false); setLabel(""); setExercises([]); setQuery(""); }}
          style={{ ...S.btn(false), padding: "9px 14px" }}>Cancel</button>
      </div>
    </div>
  );
}

function ExportModal({ text, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1c1c18", border: "1px solid #3a3a32", borderRadius: 12, padding: 20, maxWidth: 420, width: "100%", maxHeight: "80vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: "#e8e4d8" }}>Export Workout</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6a6a5a", fontSize: 18, cursor: "pointer" }}>×</button>
        </div>
        <pre style={{ background: "#141410", border: "1px solid #2a2a24", borderRadius: 6, padding: 12, color: "#a8a498", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: 12, lineHeight: 1.5 }}>{text}</pre>
        <button onClick={copy} style={{ ...S.btn(true), width: "100%", textAlign: "center", padding: "10px" }}>{copied ? "Copied!" : "Copy to Clipboard"}</button>
      </div>
    </div>
  );
}

// ─── Plan Editor ───────────────────────────────────────────────────
function InlinePicker({ onPick, onCancel, exclude = [], customExercises }) {
  const [q, setQ] = useState("");
  const allEx = [...ALL_EXERCISES, ...customExercises];
  const filtered = q ? allEx.filter(e => !exclude.includes(e.id) && e.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  return (
    <>
      <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search superset partner..."
        style={{ ...S.input, width: "100%", textAlign: "left", fontSize: 12, boxSizing: "border-box", marginBottom: 4 }} />
      <div style={{ maxHeight: 140, overflowY: "auto" }}>
        {filtered.map(ex => (
          <button key={ex.id} onClick={() => onPick(ex.id)} style={{
            display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
            color: "#c8c4b8", padding: "5px 4px", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #1c1c18",
          }}>{ex.name}</button>
        ))}
      </div>
      <button onClick={onCancel} style={{ ...S.btn(false), marginTop: 4, fontSize: 11, padding: "2px 8px" }}>Cancel</button>
    </>
  );
}

function WorkoutEditor({ workout, onSave, onCancel, customExercises, setCustomExercises }) {
  const isNew = !workout;
  const [name, setName] = useState(workout?.name || "");
  const [icon, setIcon] = useState(workout?.icon || "🏋️");
  const [groups, setGroups] = useState(() => {
    if (!workout) return [{ label: "", exercises: [] }];
    return workout.groups.map(g => ({
      label: g.label || "",
      exercises: [...(g.exercises || [])],
      choices: [...(g.choices || [])],
      choices2: [...(g.choices2 || [])],
    }));
  });
  const [ssPicker, setSsPicker] = useState(null); // { gi, ei }

  const addGroup = () => setGroups(gs => [...gs, { label: "", exercises: [] }]);
  const removeGroup = (gi) => setGroups(gs => gs.filter((_, i) => i !== gi));
  const setGroupLabel = (gi, label) => setGroups(gs => gs.map((g, i) => i === gi ? { ...g, label } : g));
  const addToGroup = (gi, id) => setGroups(gs => gs.map((g, i) => i === gi ? { ...g, exercises: [...g.exercises, { id, scheme: "" }] } : g));
  const addAfter = (gi, ei, id) => setGroups(gs => gs.map((g, i) => {
    if (i !== gi) return g;
    const exs = [...g.exercises]; exs.splice(ei + 1, 0, { id, scheme: "" }); return { ...g, exercises: exs };
  }));
  const removeEx = (gi, ei) => setGroups(gs => gs.map((g, i) => i === gi ? { ...g, exercises: g.exercises.filter((_, j) => j !== ei) } : g));
  const setScheme = (gi, ei, scheme) => setGroups(gs => gs.map((g, i) => i === gi ? { ...g, exercises: g.exercises.map((e, j) => j === ei ? { ...e, scheme } : e) } : g));
  const choiceKeys = ["choices", "choices2"];
  const allGroupIds = (group) => [...(group.exercises || []), ...(group.choices || []), ...(group.choices2 || [])].map(e => e.id);
  const addChoiceGroup = (gi) => {
    setGroups(gs => gs.map((g, i) => {
      if (i !== gi) return g;
      const key = g.choices ? "choices2" : "choices";
      return { ...g, [key]: g[key] || [] };
    }));
    const group = groups[gi];
    setSsPicker({ gi, choiceType: group?.choices ? "choices2" : "choices" });
  };
  const addChoiceOption = (gi, choiceType, id) => setGroups(gs => gs.map((g, i) => i === gi ? { ...g, [choiceType]: [...(g[choiceType] || []), { id, scheme: "" }] } : g));
  const removeChoiceGroup = (gi, choiceType) => setGroups(gs => gs.map((g, i) => {
    if (i !== gi) return g;
    const next = { ...g };
    delete next[choiceType];
    return next;
  }));
  const removeChoiceOption = (gi, choiceType, ci) => setGroups(gs => gs.map((g, i) => i === gi ? { ...g, [choiceType]: (g[choiceType] || []).filter((_, j) => j !== ci) } : g));
  const setChoiceScheme = (gi, choiceType, ci, scheme) => setGroups(gs => gs.map((g, i) => i === gi ? { ...g, [choiceType]: (g[choiceType] || []).map((e, j) => j === ci ? { ...e, scheme } : e) } : g));

  const handleSave = () => {
    if (!name.trim()) return;
    const id = workout?.id || "custom_" + Date.now();
    const cleanGroups = groups
      .filter(g => (g.exercises || []).length > 0 || (g.choices || []).length > 0 || (g.choices2 || []).length > 0)
      .map(g => {
        const clean = { label: g.label || null };
        if ((g.exercises || []).length > 0) clean.exercises = g.exercises;
        if ((g.choices || []).length > 0) clean.choices = g.choices;
        if ((g.choices2 || []).length > 0) clean.choices2 = g.choices2;
        return clean;
      });
    onSave({ id, name: name.trim(), icon: icon.trim() || "🏋️", groups: cleanGroups });
  };

  return (
    <div>
      <div style={{ padding: "12px 0", borderBottom: "1px solid #2a2a24", marginBottom: 16 }}>
        <button onClick={onCancel} style={{ background: "none", border: "none", color: "#8a8a6a", fontSize: 14, cursor: "pointer", padding: 0 }}>← Back</button>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#e8e4d8", margin: "0 0 16px" }}>{isNew ? "New Workout" : "Edit Workout"}</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="Icon" style={{ ...S.input, width: 52 }} />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Workout name" style={{ ...S.input, flex: 1, textAlign: "left" }} />
      </div>
      {groups.map((group, gi) => (
        <div key={gi} style={{ background: "#1c1c18", border: "1px solid #2a2a24", borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
            <input value={group.label} onChange={e => setGroupLabel(gi, e.target.value)} placeholder="Group label (optional)"
              style={{ ...S.input, flex: 1, textAlign: "left", fontSize: 12 }} />
            <button onClick={() => removeGroup(gi)} style={{ background: "none", border: "1px solid #4a2a2a", borderRadius: 4, color: "#8a4a4a", padding: "4px 8px", fontSize: 12, cursor: "pointer" }}>×</button>
          </div>
          {group.exercises.map((ex, ei) => {
            const exDef = getExercise(ex.id, customExercises);
            const pickerOpen = ssPicker?.gi === gi && ssPicker?.ei === ei;
            return (
              <div key={`${gi}-${ei}`}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                  <div style={{ flex: 1, fontSize: 13, color: "#c8c4b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exDef.name}</div>
                  <input value={ex.scheme} onChange={e => setScheme(gi, ei, e.target.value)} placeholder="Scheme"
                    style={{ ...S.input, width: 110, fontSize: 11 }} />
                  <button onClick={() => setSsPicker(pickerOpen ? null : { gi, ei })} title="Add superset partner"
                    style={{ ...S.btn(pickerOpen), fontSize: 10, padding: "3px 7px" }}>SS+</button>
                  <button onClick={() => { setSsPicker(null); removeEx(gi, ei); }}
                    style={{ background: "none", border: "1px solid #4a2a2a", borderRadius: 4, color: "#8a4a4a", padding: "4px 7px", fontSize: 12, cursor: "pointer" }}>×</button>
                </div>
                {pickerOpen && (
                  <div style={{ margin: "2px 0 8px 8px", background: "#141410", border: "1px solid #3a3a32", borderRadius: 6, padding: 8 }}>
                    <InlinePicker exclude={group.exercises.map(e => e.id)} customExercises={customExercises}
                      onPick={(id) => { addAfter(gi, ei, id); setSsPicker(null); }}
                      onCancel={() => setSsPicker(null)} />
                  </div>
                )}
              </div>
            );
          })}
          {choiceKeys.map(choiceType => {
            if (!group[choiceType]) return null;
            const pickerOpen = ssPicker?.gi === gi && ssPicker?.choiceType === choiceType;
            return (
              <div key={choiceType} style={{ background: "#141410", border: "1px solid #2a2a24", borderRadius: 6, padding: 8, margin: "8px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                  <div style={{ ...S.tag, marginBottom: 0 }}>Choice of two</div>
                  <button onClick={() => { setSsPicker(null); removeChoiceGroup(gi, choiceType); }}
                    style={{ background: "none", border: "1px solid #4a2a2a", borderRadius: 4, color: "#8a4a4a", padding: "2px 7px", fontSize: 12, cursor: "pointer" }}>×</button>
                </div>
                {(group[choiceType] || []).map((ex, ci) => {
                  const exDef = getExercise(ex.id, customExercises);
                  return (
                    <div key={`${choiceType}-${ex.id}-${ci}`} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                      <div style={{ flex: 1, fontSize: 13, color: "#c8c4b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exDef.name}</div>
                      <input value={ex.scheme} onChange={e => setChoiceScheme(gi, choiceType, ci, e.target.value)} placeholder="Scheme"
                        style={{ ...S.input, width: 110, fontSize: 11 }} />
                      <button onClick={() => removeChoiceOption(gi, choiceType, ci)}
                        style={{ background: "none", border: "1px solid #4a2a2a", borderRadius: 4, color: "#8a4a4a", padding: "4px 7px", fontSize: 12, cursor: "pointer" }}>×</button>
                    </div>
                  );
                })}
                {pickerOpen && (
                  <div style={{ marginTop: 6, background: "#1c1c18", border: "1px solid #3a3a32", borderRadius: 6, padding: 8 }}>
                    <InlinePicker exclude={allGroupIds(group)} customExercises={customExercises}
                      onPick={(id) => { addChoiceOption(gi, choiceType, id); setSsPicker(null); }}
                      onCancel={() => setSsPicker(null)} />
                  </div>
                )}
                {(group[choiceType] || []).length < 2 && !pickerOpen && (
                  <button onClick={() => setSsPicker({ gi, choiceType })} style={{ ...S.btn(false), width: "100%", marginTop: 4, padding: "7px", textAlign: "center", fontSize: 12 }}>
                    + Add Option
                  </button>
                )}
              </div>
            );
          })}
          {(!group.choices || !group.choices2) && (
            <button onClick={() => addChoiceGroup(gi)} style={{ ...S.btn(false), width: "100%", marginTop: 6, padding: "8px", textAlign: "center", fontSize: 12 }}>+ Add Choice of Two</button>
          )}
          <ExerciseSearch onAdd={(id) => addToGroup(gi, id)}
            session={{ exerciseOrder: allGroupIds(group), addedExercises: [] }}
            customExercises={customExercises} setCustomExercises={setCustomExercises} />
        </div>
      ))}
      <button onClick={addGroup} style={{ ...S.btn(false), width: "100%", marginBottom: 16, padding: "10px", textAlign: "center" }}>+ Add Group</button>
      <button onClick={handleSave} disabled={!name.trim()} style={{ ...S.btn(!!name.trim()), width: "100%", padding: "12px", textAlign: "center", marginBottom: 8 }}>
        {isNew ? "Create Workout" : "Save Changes"}
      </button>
      <button onClick={onCancel} style={{ ...S.btn(false), width: "100%", padding: "12px", textAlign: "center" }}>Cancel</button>
      <div style={{ height: 40 }} />
    </div>
  );
}

function PlanListView({ workouts, onBack, onEdit, onNew, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(null);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #2a2a24", marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#8a8a6a", fontSize: 14, cursor: "pointer", padding: 0 }}>← Back</button>
        <button onClick={onNew} style={{ ...S.btn(true), fontSize: 13 }}>+ New Plan</button>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#e8e4d8", margin: "0 0 16px" }}>Manage Plans</h2>
      {workouts.map(w => (
        <div key={w.id} style={{ background: "#1c1c18", border: "1px solid #2a2a24", borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#e8e4d8" }}>{w.icon} {w.name}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => onEdit(w)} style={{ ...S.btn(false), fontSize: 12, padding: "4px 10px" }}>Edit</button>
              {confirmDelete === w.id ? (
                <>
                  <button onClick={() => { onDelete(w.id); setConfirmDelete(null); }}
                    style={{ background: "none", border: "1px solid #8a2a2a", borderRadius: 6, color: "#c04040", padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Confirm</button>
                  <button onClick={() => setConfirmDelete(null)} style={{ ...S.btn(false), fontSize: 12, padding: "4px 8px" }}>×</button>
                </>
              ) : (
                <button onClick={() => setConfirmDelete(w.id)}
                  style={{ background: "none", border: "1px solid #4a2a2a", borderRadius: 6, color: "#8a4a4a", padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Delete</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Workout View ──────────────────────────────────────────────────
function WorkoutView({ workout, sessions, onBack, onFinish, onDiscard, customExercises, setCustomExercises, initialLapAt }) {
  const existing = sessions.find(s => s.date === todayStr() && s.workoutId === workout.id);
  const initSession = (() => {
    let raw;
    try {
      const stored = localStorage.getItem("wip");
      if (stored) {
        const { workout: w, session: ws } = JSON.parse(stored);
        if (w?.id === workout.id) raw = ws;
      }
    } catch {}
    if (!raw) raw = existing || null;
    const s = raw
      ? { choices: {}, hiddenExercises: [], hiddenChoices: [], ...raw }
      : { date: todayStr(), workoutId: workout.id, log: {}, exerciseOrder: [], choices: {}, hiddenExercises: [], hiddenChoices: [], equipment: {}, startTime: null, duration: null };
    if (!s.addedItems) {
      s.addedItems = (s.addedExercises || []).map((id, i) => ({ type: "single", id, itemId: `m${i}` }));
    } else {
      s.addedItems = s.addedItems.map((item, i) => item.itemId ? item : { ...item, itemId: `m${i}` });
    }
    if (!s.slots) {
      s.slots = [
        ...workout.groups.map((_, gi) => ({ type: "plan", gi })),
        ...s.addedItems.map(item => ({ type: "added", itemId: item.itemId })),
      ];
    }
    return s;
  })();
  const [session, setSession] = useState(initSession);
  const [timerStart, setTimerStart] = useState(initSession.startTime && !initSession.duration ? initSession.startTime : null);
  const [showExport, setShowExport] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [lapAt, setLapAt] = useState(initialLapAt);
  const [dragActive, setDragActive] = useState(null);
  const dragRef = useRef({ active: null, timer: null, lastIdx: null });
  const isTouch = useRef(typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches).current;

  const totalSets = Object.values(session.log).reduce((a, s) => a + s.length, 0);
  const started = !!timerStart;

  useEffect(() => {
    if (timerStart) {
      localStorage.setItem("wip", JSON.stringify({ session, workout, lapAt }));
    }
  }, [session, timerStart, lapAt]);

  useEffect(() => {
    if (!isTouch) return;
    const onMove = (e) => {
      const dr = dragRef.current;
      if (dr.active === null) return;
      e.preventDefault();
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const slotEl = el?.closest('[data-slot-idx]');
      if (!slotEl) return;
      const toIdx = parseInt(slotEl.dataset.slotIdx, 10);
      if (isNaN(toIdx) || toIdx === dr.lastIdx) return;
      dr.lastIdx = toIdx;
      const fromIdx = dr.active;
      dr.active = toIdx;
      setDragActive(toIdx);
      setSession(s => {
        const slots = [...s.slots];
        slots.splice(toIdx, 0, slots.splice(fromIdx, 1)[0]);
        return { ...s, slots };
      });
    };
    const onEnd = () => {
      clearTimeout(dragRef.current.timer);
      dragRef.current.active = null;
      dragRef.current.lastIdx = null;
      setDragActive(null);
    };
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    document.addEventListener('touchcancel', onEnd);
    return () => {
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);
    };
  }, [isTouch]);

  const handleStart = () => {
    const now = Date.now();
    setTimerStart(now);
    setSession(s => ({ ...s, startTime: now }));
  };

  const handleFinish = () => {
    if (totalSets === 0) { onDiscard(); return; }
    setShowFinishModal(true);
  };

  const setChoice = (key, value) => setSession(s => {
    const current = s.choices[key];
    const same = JSON.stringify(current || null) === JSON.stringify(value || null);
    return { ...s, choices: { ...s.choices, [key]: same ? null : value } };
  });

  const removeChoiceExercise = (key, exId) => setSession(s => {
    const current = s.choices[key];
    if (!Array.isArray(current)) return { ...s, choices: { ...s.choices, [key]: null } };
    const next = current.filter(id => id !== exId);
    return { ...s, choices: { ...s.choices, [key]: next.length > 0 ? next : null } };
  });

  const hideChoiceGroup = (key) => setSession(s => ({
    ...s,
    hiddenChoices: [...(s.hiddenChoices || []), key],
    choices: { ...s.choices, [key]: null },
  }));

  const reorderSlots = (fromIdx, toIdx) => {
    setSession(s => {
      const slots = [...s.slots];
      slots.splice(toIdx, 0, slots.splice(fromIdx, 1)[0]);
      return { ...s, slots };
    });
  };

  const startLongPress = (slotIdx, e) => {
    e.stopPropagation();
    const timer = setTimeout(() => {
      navigator.vibrate?.(50);
      dragRef.current.active = slotIdx;
      dragRef.current.lastIdx = slotIdx;
      setDragActive(slotIdx);
    }, 400);
    dragRef.current.timer = timer;
  };

  const cancelLongPress = () => clearTimeout(dragRef.current.timer);

  const addSingleItem = (exId) => {
    if (session.addedItems.some(i => i.type === "single" && i.id === exId)) return;
    const itemId = `a${Date.now()}`;
    setSession(s => ({
      ...s,
      addedItems: [...s.addedItems, { type: "single", id: exId, itemId }],
      slots: [...s.slots, { type: "added", itemId }],
      exerciseOrder: s.exerciseOrder.includes(exId) ? s.exerciseOrder : [...s.exerciseOrder, exId],
    }));
  };

  const addGroupItem = (label, exercises) => {
    const itemId = `a${Date.now()}`;
    setSession(s => ({
      ...s,
      addedItems: [...s.addedItems, { type: "group", label, exercises, itemId }],
      slots: [...s.slots, { type: "added", itemId }],
      exerciseOrder: [...s.exerciseOrder, ...exercises.filter(id => !s.exerciseOrder.includes(id))],
    }));
  };

  const removeAddedItem = (itemId) => {
    setSession(s => {
      const item = s.addedItems.find(i => i.itemId === itemId);
      if (!item) return s;
      const ids = item.type === "single" ? [item.id] : item.exercises;
      return {
        ...s,
        addedItems: s.addedItems.filter(i => i.itemId !== itemId),
        slots: s.slots.filter(sl => !(sl.type === "added" && sl.itemId === itemId)),
        exerciseOrder: s.exerciseOrder.filter(id => !ids.includes(id)),
        log: Object.fromEntries(Object.entries(s.log).filter(([k]) => !ids.includes(k))),
      };
    });
  };

  const hidePlanExercise = (exId) => {
    setSession(s => ({ ...s, hiddenExercises: [...s.hiddenExercises, exId] }));
  };

  const renderGroup = (group, gi) => {
    const items = [];
    if (group.choices) {
      const key = `g${gi}_c1`;
      if (!session.hiddenChoices?.includes(key)) {
        const chosen = session.choices[key] || null;
        const chosenIds = Array.isArray(chosen) ? chosen : chosen ? [chosen] : [];
        items.push(<ChoicePicker key={key + "_p"} choices={group.choices} chosen={chosen} onChoose={id => setChoice(key, id)} onHide={() => hideChoiceGroup(key)} label="Choose one / both" customExercises={customExercises} />);
        chosenIds.forEach(chosenId => {
          const c = group.choices.find(x => x.id === chosenId);
          items.push(<ExerciseCard key={chosenId} exerciseId={chosenId} scheme={c?.scheme} session={session} setSession={setSession} sessions={sessions} customExercises={customExercises} onRemove={() => removeChoiceExercise(key, chosenId)} />);
        });
      }
    }
    if (group.choices2) {
      const key = `g${gi}_c2`;
      if (!session.hiddenChoices?.includes(key)) {
        const chosen = session.choices[key] || null;
        const chosenIds = Array.isArray(chosen) ? chosen : chosen ? [chosen] : [];
        items.push(<ChoicePicker key={key + "_p"} choices={group.choices2} chosen={chosen} onChoose={id => setChoice(key, id)} onHide={() => hideChoiceGroup(key)} label="Choose one / both" customExercises={customExercises} />);
        chosenIds.forEach(chosenId => {
          const c = group.choices2.find(x => x.id === chosenId);
          items.push(<ExerciseCard key={chosenId} exerciseId={chosenId} scheme={c?.scheme} session={session} setSession={setSession} sessions={sessions} customExercises={customExercises} onRemove={() => removeChoiceExercise(key, chosenId)} />);
        });
      }
    }
    if (group.exercises) {
      group.exercises.forEach(ex => {
        if (session.hiddenExercises?.includes(ex.id)) return;
        items.push(<ExerciseCard key={ex.id} exerciseId={ex.id} scheme={ex.scheme} session={session} setSession={setSession} sessions={sessions} customExercises={customExercises} onRemove={() => hidePlanExercise(ex.id)} />);
      });
    }
    return items;
  };

  return (
    <div style={{ paddingBottom: 88 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#1a1a14ee", backdropFilter: "blur(8px)", borderBottom: "1px solid #2a2a24", overflow: "hidden", margin: "0 -16px", padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 0 4px" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#8a8a6a", fontSize: 18, cursor: "pointer", padding: 0, lineHeight: 1, flexShrink: 0 }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#e8e4d8" }}>{workout.icon} {workout.name}</div>
            <div style={{ fontSize: 12, color: "#6a6a5a", marginTop: 2 }}>{totalSets} sets logged</div>
          </div>
          {totalSets > 0 && <button onClick={() => setShowExport(true)} style={{ ...S.btn(false), padding: "4px 10px", fontSize: 12 }}>Export</button>}
        </div>
        {timerStart && <div style={{ borderTop: "1px solid #2a2a24", marginTop: 8, background: "rgba(74,106,42,0.13)", margin: "8px -16px 0", padding: "0 16px" }}><Timer startTime={timerStart} lapAt={lapAt} onClick={() => setLapAt(Date.now())} /></div>}
      </div>

      <div style={{ height: 20 }} />

      {(() => {
        const slots = session.slots || [];
        const n = slots.length;
        const obtnStyle = (disabled) => ({
          background: "none", border: "1px solid #2a2a24", borderRadius: 3,
          color: disabled ? "#2a2a24" : "#6a6a5a", padding: "0 6px", fontSize: 12,
          cursor: disabled ? "default" : "pointer",
        });
        const grip = (slotIdx) => (
          <span
            onTouchStart={(e) => startLongPress(slotIdx, e)}
            onTouchEnd={cancelLongPress}
            onTouchCancel={cancelLongPress}
            style={{ color: "#4a4a3a", fontSize: 18, lineHeight: 1, padding: "0 4px", touchAction: "none", userSelect: "none", cursor: "grab" }}
          >⠿</span>
        );
        const updown = (slotIdx) => (
          <>
            <button onClick={() => reorderSlots(slotIdx, slotIdx - 1)} disabled={slotIdx === 0} style={obtnStyle(slotIdx === 0)}>↑</button>
            <button onClick={() => reorderSlots(slotIdx, slotIdx + 1)} disabled={slotIdx === n - 1} style={obtnStyle(slotIdx === n - 1)}>↓</button>
          </>
        );

        return slots.map((slot, slotIdx) => {
          const isDragged = dragActive === slotIdx;
          const baseStyle = { marginBottom: 16, opacity: isDragged ? 0.5 : 1, transition: "opacity 0.1s" };

          if (slot.type === "plan") {
            const group = workout.groups[slot.gi];
            const groupItems = renderGroup(group, slot.gi);
            if (groupItems.length === 0) return null;
            const hasLabel = !!group.label;
            const isSuperset = group.label?.includes("Superset");
            return (
              <div key={`plan-${slot.gi}`} data-slot-idx={slotIdx} style={baseStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: hasLabel ? 4 : 2 }}>
                  {hasLabel
                    ? <div style={{ ...S.tag, marginBottom: 0, padding: "4px 0", borderLeft: isSuperset ? "2px solid #5a4a2a" : "none", paddingLeft: isSuperset ? 10 : 0 }}>{group.label}</div>
                    : <div />}
                  {n > 1 && (
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {isTouch ? grip(slotIdx) : updown(slotIdx)}
                    </div>
                  )}
                </div>
                {groupItems}
              </div>
            );
          }

          // added slot
          const item = session.addedItems.find(i => i.itemId === slot.itemId);
          if (!item) return null;

          if (item.type === "single") {
            return (
              <div key={item.itemId} data-slot-idx={slotIdx} style={baseStyle}>
                {n > 1 && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, alignItems: "center", marginBottom: 2 }}>
                    {isTouch ? grip(slotIdx) : updown(slotIdx)}
                  </div>
                )}
                <ExerciseCard exerciseId={item.id} scheme="" session={session} setSession={setSession} sessions={sessions} onRemove={() => removeAddedItem(item.itemId)} isAdded customExercises={customExercises} />
              </div>
            );
          }

          // added group
          return (
            <div key={item.itemId} data-slot-idx={slotIdx} style={{ ...baseStyle, background: "#1c1c18", border: "1px solid #2a2a24", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ ...S.tag, marginBottom: 0, borderLeft: "2px solid #5a4a2a", paddingLeft: 8 }}>{item.label || "Group"}</div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {n > 1 && (isTouch ? grip(slotIdx) : updown(slotIdx))}
                  <button onClick={() => removeAddedItem(item.itemId)} style={{ background: "none", border: "1px solid #4a2a2a", borderRadius: 4, color: "#8a4a4a", padding: "0 8px", fontSize: 13, cursor: "pointer", marginLeft: 2 }}>×</button>
                </div>
              </div>
              {item.exercises.map(exId => (
                <ExerciseCard key={exId} exerciseId={exId} scheme="" session={session} setSession={setSession} sessions={sessions} isAdded customExercises={customExercises} />
              ))}
            </div>
          );
        });
      })()}

      <ExerciseSearch onAdd={addSingleItem} session={session} customExercises={customExercises} setCustomExercises={setCustomExercises} />
      <GroupCreator onAdd={addGroupItem} session={session} customExercises={customExercises} />

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, padding: "24px 16px 28px", background: "linear-gradient(to bottom, transparent, #141410 40%)", zIndex: 50, pointerEvents: "none" }}>
        <button
          onClick={!started ? handleStart : handleFinish}
          style={{ pointerEvents: "all", width: "100%", padding: "15px", fontSize: 15, fontWeight: 600, textAlign: "center", background: started ? "#4a6a2a" : "#2e3d20", color: started ? "#d4e8c4" : "#a8c888", border: "none", borderRadius: 10, cursor: "pointer" }}
        >
          {!started ? "Start Workout" : "Finish Workout"}
        </button>
      </div>

      {showExport && <ExportModal text={exportSession(session, workout, customExercises)} onClose={() => setShowExport(false)} />}
      {showFinishModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: "#1c1c18", border: "1px solid #3a3a32", borderRadius: 16, padding: 24, maxWidth: 480, width: "100%", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#e8e4d8", marginBottom: 6, textAlign: "center" }}>Finish Workout?</div>
            <div style={{ fontSize: 13, color: "#6a6a5a", marginBottom: 20, textAlign: "center" }}>
              {totalSets} sets{timerStart && <> · <InlineTimer startTime={timerStart} /></>}
            </div>
            <button onClick={() => { const duration = timerStart ? Math.floor((Date.now() - timerStart) / 1000) : null; onFinish({ ...session, duration }); }}
              style={{ ...S.btn(true), width: "100%", padding: "14px", textAlign: "center", fontSize: 15, marginBottom: 8, background: "#4a6a2a", color: "#d4e8c4" }}>
              Save Workout
            </button>
            <button onClick={() => setShowFinishModal(false)}
              style={{ ...S.btn(false), width: "100%", padding: "12px", textAlign: "center", marginBottom: 8 }}>
              Keep Going
            </button>
            <button onClick={onDiscard}
              style={{ background: "none", border: "none", color: "#8a4a4a", width: "100%", padding: "10px", textAlign: "center", fontSize: 13, cursor: "pointer" }}>
              Erase & Discard
            </button>
          </div>
        </div>
      )}
      <div style={{ height: 80 }} />
    </div>
  );
}

// ─── History ───────────────────────────────────────────────────────
function HistoryView({ sessions, workouts, onBack, customExercises }) {
  const [exportText, setExportText] = useState(null);
  const sorted = [...sessions].reverse();
  const allEx = [...ALL_EXERCISES, ...customExercises];
  return (
    <div>
      <div style={{ padding: "16px 0", borderBottom: "1px solid #2a2a24", marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#8a8a6a", fontSize: 14, cursor: "pointer", padding: 0 }}>← Back</button>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e8e4d8", margin: "0 0 16px" }}>History</h2>
      {sorted.length === 0 && <div style={{ color: "#5a5a4a", fontSize: 14 }}>No workouts logged yet.</div>}
      {sorted.map((s, i) => {
        const workout = [...workouts, FREE_WORKOUT].find(w => w.id === s.workoutId);
        const setCount = Object.values(s.log).reduce((a, sets) => a + sets.length, 0);
        return (
          <div key={i} style={{ background: "#1c1c18", border: "1px solid #2a2a24", borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: 600, color: "#e8e4d8", fontSize: 15 }}>{workout?.icon} {workout?.name || s.workoutId}</span>
                <div style={{ fontSize: 12, color: "#6a6a5a", marginTop: 2 }}>{formatDate(s.date)} · {setCount} sets{s.duration ? ` · ${fmtTime(s.duration)}` : ""}</div>
              </div>
              <button onClick={() => setExportText(exportSession(s, workout || { name: s.workoutId }, customExercises))}
                style={{ background: "none", border: "1px solid #2a2a24", borderRadius: 4, color: "#6a6a5a", padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Export</button>
            </div>
            <div style={{ marginTop: 6 }}>
              {(s.exerciseOrder || Object.keys(s.log)).filter(exId => s.log[exId]?.length > 0).map(exId => {
                const sets = s.log[exId]; const ex = allEx.find(e => e.id === exId) || { name: exId };
                return (
                  <div key={exId} style={{ fontSize: 12, color: "#7a7a6a", marginBottom: 1, fontFamily: "'JetBrains Mono', monospace" }}>
                    <span style={{ color: "#8a8a7a" }}>{ex.name}:</span>{" "}
                    {getSessionEquipment(s, exId) && <span style={{ fontSize: 10, color: "#5a7a3a", background: "#1e2a14", border: "1px solid #3a4a2a", borderRadius: 3, padding: "1px 4px", marginRight: 4 }}>{getSessionEquipment(s, exId)}</span>}
                    {sets.map((s2, j) => <span key={j}>{j > 0 && " · "}{s2.weight > 0 ? `${s2.weight}×${s2.reps}` : `${s2.reps}`}</span>)}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {exportText && <ExportModal text={exportText} onClose={() => setExportText(null)} />}
    </div>
  );
}

// ─── Home ──────────────────────────────────────────────────────────
function HomeScreen({ workouts, onSelectWorkout, onShowHistory, onFreeWorkout, onManagePlans, sessions, wip, onResume }) {
  const recentByWorkout = {};
  sessions.forEach(s => {
    if (!recentByWorkout[s.workoutId]) recentByWorkout[s.workoutId] = [];
    recentByWorkout[s.workoutId].push({ date: s.date, duration: s.duration });
  });
  Object.keys(recentByWorkout).forEach(id => {
    recentByWorkout[id] = recentByWorkout[id].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  });
  return (
    <div>
      <div style={{ padding: "24px 0 20px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e4d8", margin: 0, letterSpacing: -0.5 }}>Workouts</h1>
        <div style={{ fontSize: 13, color: "#6a6a5a", marginTop: 4 }}>{sessions.length} sessions logged</div>
      </div>
      {wip && (
        <div onClick={onResume} style={{ background: "#1e2218", border: "1px solid #3a4a2a", borderRadius: 10, padding: "16px 18px", marginBottom: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6a8a4a", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>In Progress</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#e8e4d8" }}>{wip.workout.icon} {wip.workout.name}</div>
            <div style={{ fontSize: 12, color: "#6a6a5a", marginTop: 3 }}>
              {Object.values(wip.session.log || {}).reduce((a, s) => a + s.length, 0)} sets logged
            </div>
          </div>
          {wip.session.startTime && (
            <div style={{ flexShrink: 0 }}>
              <InlineTimer startTime={wip.session.startTime} lapAt={wip.lapAt || null} />
            </div>
          )}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ ...S.tag, marginBottom: 0 }}>Plans</div>
        <button onClick={onManagePlans} style={{ ...S.btn(false), fontSize: 11, padding: "3px 10px" }}>Manage</button>
      </div>
      {workouts.map(w => {
        const recent = recentByWorkout[w.id] || [];
        return (
          <button key={w.id} onClick={() => onSelectWorkout(w)} style={{
            display: "block", width: "100%", textAlign: "left", background: "#1c1c18", border: "1px solid #2a2a24",
            borderRadius: 10, padding: "16px 18px", marginBottom: 8, cursor: "pointer",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#e8e4d8" }}>{w.icon} {w.name}</div>
                {recent.length > 0 && (
                  <div style={{ marginTop: 5, fontSize: 12, color: "#5a5a4a" }}>
                    {recent.map((r, i) => (
                      <span key={i}>
                        {i > 0 && <span style={{ margin: "0 6px", color: "#3a3a2a" }}>·</span>}
                        {formatDate(r.date)}{r.duration ? ` – ${fmtTime(r.duration)}` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ color: "#4a4a3a", fontSize: 20, flexShrink: 0, marginLeft: 8 }}>›</div>
            </div>
          </button>
        );
      })}
      <button onClick={onFreeWorkout} style={{
        display: "block", width: "100%", textAlign: "left", background: "#1a1a16", border: "1px dashed #3a3a32",
        borderRadius: 10, padding: "14px 18px", marginBottom: 8, cursor: "pointer",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#6a6a5a" }}>📋 Free Workout</div>
          <div style={{ color: "#4a4a3a", fontSize: 20 }}>›</div>
        </div>
      </button>
      <button onClick={onShowHistory} style={{
        display: "block", width: "100%", textAlign: "center", marginTop: 8, background: "none",
        border: "1px solid #2a2a24", borderRadius: 8, color: "#6a6a5a", padding: "12px", fontSize: 14, cursor: "pointer"
      }}>View History</button>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────
export default function App() {
  const [sessions, setSessions] = useState([]);
  const [customExercises, setCustomExercises] = useState([]);
  const [workouts, setWorkouts] = useState(WEEK_ORDER.map(id => WORKOUTS.find(w => w.id === id)));
  const [view, setView] = useState("home");
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [wip, setWip] = useState(() => {
    try { const raw = localStorage.getItem("wip"); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });

  useEffect(() => {
    Promise.all([
      loadData(KEY_PREFIX + "workout-sessions", []),
      loadData(KEY_PREFIX + "workout-custom-exercises", []),
      loadData(KEY_PREFIX + "workout-plans", null),
    ]).then(([s, c, w]) => {
      setSessions(s);
      setCustomExercises(c);
      if (w) setWorkouts(w);
      setLoaded(true);
    });
  }, []);

  useEffect(() => { if (loaded && customExercises.length > 0) saveData(KEY_PREFIX + "workout-custom-exercises", customExercises); }, [customExercises, loaded]);

  const handleFinish = useCallback(async (session) => {
    localStorage.removeItem("wip");
    setWip(null);
    const filtered = sessions.filter(s => !(s.date === session.date && s.workoutId === session.workoutId));
    const updated = [...filtered, session];
    setSessions(updated);
    await saveData(KEY_PREFIX + "workout-sessions", updated);
    setView("home"); setActiveWorkout(null);
  }, [sessions]);

  const handleDiscard = useCallback(() => {
    localStorage.removeItem("wip");
    setWip(null);
    setView("home");
    setActiveWorkout(null);
  }, []);

  const handleResume = useCallback(() => {
    if (!wip) return;
    setActiveWorkout(wip.workout);
    setView("workout");
  }, [wip]);

  const goHome = useCallback(() => {
    try { const raw = localStorage.getItem("wip"); setWip(raw ? JSON.parse(raw) : null); } catch {}
    setView("home");
    setActiveWorkout(null);
  }, []);

  const handleSaveWorkout = useCallback((workout) => {
    const updated = workouts.some(w => w.id === workout.id)
      ? workouts.map(w => w.id === workout.id ? workout : w)
      : [...workouts, workout];
    setWorkouts(updated);
    saveData(KEY_PREFIX + "workout-plans", updated);
    setView("plan-list");
  }, [workouts]);

  const handleDeleteWorkout = useCallback((workoutId) => {
    const updated = workouts.filter(w => w.id !== workoutId);
    setWorkouts(updated);
    saveData(KEY_PREFIX + "workout-plans", updated);
  }, [workouts]);

  if (!loaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#141410", color: "#5a5a4a" }}>Loading...</div>;

  return (
    <div style={{ background: "#141410", minHeight: "100vh", color: "#e8e4d8", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      {view === "home" && <HomeScreen workouts={workouts} onSelectWorkout={w => { setActiveWorkout(w); setView("workout"); }} onShowHistory={() => setView("history")} onFreeWorkout={() => { setActiveWorkout(FREE_WORKOUT); setView("workout"); }} onManagePlans={() => setView("plan-list")} sessions={sessions} wip={wip} onResume={handleResume} />}
      {view === "workout" && activeWorkout && <WorkoutView workout={activeWorkout} sessions={sessions} onBack={goHome} onFinish={handleFinish} onDiscard={handleDiscard} customExercises={customExercises} setCustomExercises={setCustomExercises} initialLapAt={wip?.lapAt || null} />}
      {view === "history" && <HistoryView sessions={sessions} workouts={workouts} onBack={() => setView("home")} customExercises={customExercises} />}
      {view === "plan-list" && <PlanListView workouts={workouts} onBack={() => setView("home")} onEdit={w => { setEditingWorkout(w); setView("plan-editor"); }} onNew={() => { setEditingWorkout(null); setView("plan-editor"); }} onDelete={handleDeleteWorkout} />}
      {view === "plan-editor" && <WorkoutEditor workout={editingWorkout} onSave={handleSaveWorkout} onCancel={() => setView("plan-list")} customExercises={customExercises} setCustomExercises={setCustomExercises} />}
    </div>
  );
}
