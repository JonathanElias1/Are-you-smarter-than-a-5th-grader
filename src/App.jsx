import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Are You Smarter Than a 5th Grader — Jon Edition
 *
 * Features
 * - Fullscreen mode with larger layout in FS
 * - Header Play/Stop Theme button (no autoplay, no loop)
 * - Volume slider (applies to music + SFX)
 * - Louder SFX:
 *   - Bright “correct” chime
 *   - Beefier wrong-answer buzzer
 *   - Distinct lose sting
 */

const BRAND_A = "#5b9bd5";
const BRAND_B = "#36e326";

// ————————————————————————————————————————————
// Question Bank (Jon-specific)
// ————————————————————————————————————————————
const QUESTIONS = [
  // Grade 1
  { id: "q1", grade: 1, subject: "Spelling", q: "What is Jon's company name?", choices: ["JON-E Worldwide", "JONE World Wide", "JonE Worldwide", "JON-E World Wide"], answerIndex: 0, hint: "It's hyphenated and one word for Worldwide." },
  { id: "q2", grade: 1, subject: "Math (Time)", q: "If Jon's party starts at 5:00 PM and lasts 3 hours, when does it end?", choices: ["7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"], answerIndex: 1, hint: "Add three hours to five o'clock." },
  { id: "q17", grade: 1, subject: "Civics", q: "Which state does Jon live in?", choices: ["California", "Nevada", "Arizona", "Utah"], answerIndex: 2, hint: "The Grand Canyon State." },
  { id: "q18", grade: 1, subject: "Occupations", q: "Jon runs a video-first ______ company.", choices: ["construction", "production", "insurance", "shipping"], answerIndex: 1, hint: "Lights, camera…" },

  // Grade 2
  { id: "q3", grade: 2, subject: "Geography", q: "Which city is Jon based in?", choices: ["Tucson", "Sedona", "Phoenix", "Flagstaff"], answerIndex: 2, hint: "Think Valley of the Sun." },
  { id: "q4", grade: 2, subject: "Web / Reading", q: "What is Jon's website domain?", choices: ["jon-worldwide.com", "jon-e.com", "jone.co", "je-world.com"], answerIndex: 1, hint: "Hyphen in the middle, short and sweet." },
  { id: "q19", grade: 2, subject: "Geography", q: "Phoenix sits in which desert?", choices: ["Mojave", "Sonoran", "Chihuahuan", "Great Basin"], answerIndex: 1, hint: "Home to the saguaro cactus." },
  { id: "q20", grade: 2, subject: "Dates", q: "Jon's birthday month is…", choices: ["October", "December", "June", "April"], answerIndex: 1, hint: "Holiday season month." },

  // Grade 3
  { id: "q5", grade: 3, subject: "Nutrition", q: "Jon prefers which veggie with his chicken teriyaki?", choices: ["Carrots", "Peas", "Broccoli", "Spinach"], answerIndex: 2, hint: "Tree-looking florets." },
  { id: "q6", grade: 3, subject: "Media Tech", q: "Which camera does Jon own?", choices: ["Canon R5", "Sony a7S III", "Panasonic GH5", "Nikon Z6 II"], answerIndex: 1, hint: "Low-light legend from Sony." },

  // Grade 4
  { id: "q7", grade: 4, subject: "Audio Gear", q: "Which lav system is in Jon's kit?", choices: ["RØDE Wireless GO II", "DJI Mic 2", "Sennheiser EK 100 G4", "Tascam DR-10L Pro"], answerIndex: 2, hint: "The classic Sennheiser G-series." },
  { id: "q8", grade: 4, subject: "Branding / Design", q: "Jon's official brand gradient runs between which two hex colors?", choices: ["#5b9bd5 → #36e326", "#ff5733 → #33ffce", "#5b9bd5 → #2ecc71", "#36e326 → #5b9bd5 (reversed)"], answerIndex: 0, hint: "Blue on the left, vibrant green on the right." },

  // Grade 5
  { id: "q9", grade: 5, subject: "Dates", q: "Jon's birthday is on which date?", choices: ["December 16, 1996", "November 16, 1995", "December 6, 1996", "January 16, 1997"], answerIndex: 0, hint: "Mid-December!" },
  { id: "q10", grade: 5, subject: "Career", q: "On what date did Jon start a new job in 2025?", choices: ["April 4, 2025", "April 14, 2025", "May 14, 2025", "March 14, 2025"], answerIndex: 1, hint: "It was a Monday in April." },
  { id: "q11", grade: 5, subject: "Travel / Culture", q: "What country is Jon saving for a future trip to?", choices: ["Japan", "Spain", "Brazil", "Canada"], answerIndex: 0, hint: "Sushi, bullet trains, cherry blossoms." },
  { id: "q12", grade: 4, subject: "Cooking", q: "Which sauce does Jon use for his air-fried Japanese BBQ chicken?", choices: ["Sriracha", "Bachan's", "Frank's", "Heinz BBQ"], answerIndex: 1, hint: "Japanese BBQ—brand starts with a B." },
  { id: "q13", grade: 4, subject: "Pets / Life", q: "Which pair of dogs has been mentioned in Jon's home?", choices: ["Poodle & Pug", "Golden & Beagle", "Husky & Black Lab", "Dachshund & Chihuahua"], answerIndex: 2, hint: "One is a sled-ready breed; the other, a classic family dog." },
  { id: "q14", grade: 3, subject: "Creative Projects", q: "In the 'True Friends' music video concept, who are Jon's friends?", choices: ["Wild animals", "Inanimate objects", "Random strangers", "Aliens in disguise"], answerIndex: 1, hint: "A lamp can listen too… maybe." },
  { id: "q15", grade: 5, subject: "Fitness / Goals", q: "What body-fat target did Jon set during his cut phase?", choices: ["20%", "15%", "10%", "8%"], answerIndex: 2, hint: "Two digits; the lowest of the healthy athletic range here." },
  { id: "q16", grade: 3, subject: "Tastes", q: "Which flavor does Jon NOT enjoy on food?", choices: ["Sweet", "Savory", "Hot/Spicy", "Umami"], answerIndex: 2, hint: "No hot sauce, please." },
];

// Currency formatter
const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// ————————————————————————————————————————————
// Utilities
// ————————————————————————————————————————————
function classNames(...xs) { return xs.filter(Boolean).join(" "); }

function useKeyboard(onAnswer, onBoard, onHint, onRestart) {
  useEffect(() => {
    const handler = (e) => {
      if (["1", "2", "3", "4"].includes(e.key)) onAnswer(parseInt(e.key, 10) - 1);
      else if (e.key.toLowerCase() === "b") onBoard();
      else if (e.key.toLowerCase() === "h") onHint();
      else if (e.key.toLowerCase() === "r") onRestart();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onAnswer, onBoard, onHint, onRestart]);
}

function useCountUp(target, duration = 700) {
  const [val, setVal] = useState(target);
  const prevRef = useRef(target);
  useEffect(() => {
    let raf; const start = performance.now();
    const from = prevRef.current; const to = target;
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    prevRef.current = target;
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function WinWinnings({ to = 999_999, duration = 2600 }) {
  const [val, setVal] = useState(0);
  const [shirt, setShirt] = useState(false);
  useEffect(() => {
    let raf; const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(to * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else setTimeout(() => setShirt(true), 250);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  if (shirt) return <span className="font-black">Winnings: JON T-SHIRT</span>;
  return <span>Winnings: <span className="font-black">{USD.format(val)}</span></span>;
}

// ————————————————————————————————————————————
// Main App
// ————————————————————————————————————————————
export default function JonSmarterGame() {
  const [phase, setPhase] = useState("board"); // board | question | million | win | lose
  const [currentId, setCurrentId] = useState(null);
  const [played, setPlayed] = useState(new Set());
  const [score, setScore] = useState(0);

  // Lifelines (once per game)
  const [lifelines, setLifelines] = useState({ peek: false, copy: false, hint: false, save: false });
  const [saveArmed, setSaveArmed] = useState(true); // auto-protect on first wrong

  // Audio state (master volume)
  const [volume, setVolume] = useState(0.8); // 0..1
  const volumeRef = useRef(volume);
  useEffect(() => { volumeRef.current = volume; if (themeRef.current) themeRef.current.volume = volume; }, [volume]);
  const themeRef = useRef(null);
  const [themeUrl] = useState("/are-you-smarter-song.mp3");
  const [isThemePlaying, setIsThemePlaying] = useState(false);

  // Fullscreen state
  const [isFs, setIsFs] = useState(false);
  useEffect(() => {
    const onFs = () => setIsFs(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
    };
  }, []);
  function toggleFullscreen() {
    const doc = document; const el = document.documentElement;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
    } else {
      (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
    }
  }

  // Per-question UI
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState(null); // null | correct | wrong-saved | wrong
  const [peekOverlay, setPeekOverlay] = useState(false);
  const [copyModal, setCopyModal] = useState(false);

  // Million dollar question (no lifelines)
  const MILLION_Q = {
    id: "mq1",
    q: "Which of these is NOT one of Jon's planned characters in the 'One Cousin' music video?",
    choices: ["Serious Business Jon", "Jon Food", "Goth Jon", "Existential Crisis Jon"],
    answerIndex: 3,
  };

 // ——— Audio helpers (Web Audio API) ———
const audioCtxRef = useRef(null);
function getAudioCtx() {
  if (!audioCtxRef.current) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtxRef.current = new Ctx();
  }
  return audioCtxRef.current;
}

function playTone(freq = 440, duration = 0.3, type = "sine", baseVolume = 0.2) {
  const master = volumeRef.current; if (master <= 0) return;
  const ctx = getAudioCtx(); if (!ctx) return;

  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator(); osc.type = type; osc.frequency.value = freq;
  const gain = ctx.createGain(); gain.gain.setValueAtTime(0.0001, t0);
  osc.connect(gain); gain.connect(ctx.destination);

  const v = Math.max(0.0001, baseVolume * master);
  gain.gain.exponentialRampToValueAtTime(v, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.start(t0); osc.stop(t0 + duration + 0.02);
}

// UI clicks (lifelines) — slightly louder
function playSfx(name) {
  switch (name) {
    case "peek": playTone(660, 0.25, "sine", 0.4); break;
    case "copy": playTone(520, 0.25, "sine", 0.4); break;
    case "hint": playTone(740, 0.30, "sine", 0.45); break;
    default: playTone(440, 0.20, "sine", 0.35);
  }
}

// WRONG answer — beefier
function playWrong() {
  playTone(220, 0.24, "square", 0.9);
  setTimeout(() => playTone(160, 0.30, "square", 0.9), 150);
}

// LOSE sting — descending
function playLose() {
  [392, 349, 330, 294].forEach((f, i) =>
    setTimeout(() => playTone(f, 0.24, "sawtooth", 0.8), i * 150)
  );
}

// CORRECT (normal question) — brighter & louder
function playCorrect() {
  [523, 659, 784].forEach((f, i) =>
    setTimeout(() => playTone(f, 0.22, "triangle", 0.7), i * 100)
  );
  // quick final chord for emphasis
  setTimeout(() => {
    [523, 659, 784].forEach((f) => playTone(f, 0.18, "triangle", 0.6));
  }, 330);
}

// WIN fanfare (million-dollar) — new, big and loud
function playWin() {
  const arp = [523, 659, 784, 988, 1175]; // C5 E5 G5 B5 D6
  arp.forEach((f, i) => setTimeout(() => playTone(f, 0.22, "triangle", 0.85), i * 120));
  // hold a bright final chord
  setTimeout(() => {
    [784, 988, 1175].forEach((f) => playTone(f, 0.6, "sawtooth", 0.75));
  }, arp.length * 120 + 40);
}
// (optional legacy) short fanfare if you still want it elsewhere
function playFanfare() {
  [523, 659, 784, 1046].forEach((f, i) =>
    setTimeout(() => playTone(f, 0.24, "triangle", 0.6), i * 160)
  );
}
  const gradientBg = { background: `linear-gradient(135deg, ${BRAND_A}, ${BRAND_B})` };

  const byGrade = useMemo(() => {
    const g = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    for (const q of QUESTIONS) g[q.grade].push(q);
    return g;
  }, []);

  const remaining = QUESTIONS.length - played.size;
  const current = useMemo(() => QUESTIONS.find((x) => x.id === currentId) || null, [currentId]);

  // Animated score readout
  const displayScore = useCountUp(score, 600);

  useKeyboard(
    (i) => {
      if (phase === "question" && !locked) handleAnswer(i);
      if (phase === "million" && !locked) handleMillionAnswer(i);
    },
    () => phase === "question" && !locked && backToBoard(),
    () => doHint(),
    () => restart()
  );

  // ——— Theme playback controls (no autoplay) ———
  async function playTheme() {
    try {
      const a = themeRef.current; if (!a) return;
      a.currentTime = 0; a.loop = false; a.volume = volumeRef.current;
      await a.play(); setIsThemePlaying(true);
    } catch { /* user blocked or quick click; no-op */ }
  }
  function stopTheme() {
    const a = themeRef.current; if (!a) return; a.pause(); setIsThemePlaying(false);
  }
  useEffect(() => {
    const a = themeRef.current; if (!a) return;
    const onEnded = () => setIsThemePlaying(false);
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, []);

  function startQuestion(qid) {
    if (played.has(qid)) return;
    setCurrentId(qid);
    setPhase("question");
    setLocked(false); setResult(null); setPeekOverlay(false); setCopyModal(false);
  }

  function backToBoard() { setPhase("board"); }

  function restart() {
    setPhase("board"); setCurrentId(null); setPlayed(new Set()); setScore(0);
    setLifelines({ peek: false, copy: false, hint: false, save: false }); setSaveArmed(true);
    setLocked(false); setResult(null); setPeekOverlay(false); setCopyModal(false);
  }

  function consumeLifeline(name) { setLifelines((L) => ({ ...L, [name]: true })); }

  // ——— Lifelines ———
  function doPeek() { if (phase !== "question" || locked || lifelines.peek) return; consumeLifeline("peek"); playSfx("peek"); setPeekOverlay(true); }
  function doCopy() { if (phase !== "question" || locked || lifelines.copy) return; consumeLifeline("copy"); playSfx("copy"); setCopyModal(true); }
  function doHint() { if (phase !== "question" || locked || lifelines.hint || !current) return; consumeLifeline("hint"); playSfx("hint"); }

  // ——— Board question grading ———
  function handleAnswer(choiceIdx) {
    if (locked || !current) return; setLocked(true);
    const isCorrect = choiceIdx === current.answerIndex;
    if (isCorrect) {
      playCorrect();
      setScore((s) => s + current.grade * 100);
      setResult("correct");
      finalizeQuestion();
    } else {
      if (saveArmed && !lifelines.save) {
        consumeLifeline("save");
        setSaveArmed(false);
        setResult("wrong-saved");
        playWrong();
        finalizeQuestion();
      } else {
        setResult("wrong");
        playWrong();
        setTimeout(() => {
          setPhase("lose");
          setLocked(false);
          playLose();
        }, 800);
      }
    }
  }

  function finalizeQuestion() {
    setPlayed((p) => {
      const np = new Set(p); if (current) np.add(current.id);
      const allPlayed = np.size >= QUESTIONS.length;
      setTimeout(() => { setPhase(allPlayed ? "million" : "board"); setLocked(false); }, 900);
      return np;
    });
  }

  // ——— Million-dollar question ———
  function handleMillionAnswer(choiceIdx) {
    if (locked) return; setLocked(true);
    const isCorrect = choiceIdx === MILLION_Q.answerIndex;
    if (isCorrect) {
      playWin();
      setTimeout(() => { setPhase("win"); setLocked(false); }, 800);
    } else {
      playLose();
      setTimeout(() => { setPhase("lose"); setLocked(false); }, 1200);
    }
  }

  // Small helpers
  const lifelinePill = (label, used) => (
    <span className={classNames("px-2 py-1 rounded-md text-xs font-bold", used ? "bg-white/20 text-white/60" : "bg-white text-black")}>{label}</span>
  );

  // Wider container + bigger type in fullscreen
  const containerW = isFs ? "max-w-[1500px] md:max-w-[1700px]" : "max-w-5xl";
  const boardMinW = isFs ? "min-w-[1200px]" : "min-w-[900px]";
  const h1Size = isFs ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl";
  const gradeTitleSize = isFs ? "text-2xl" : "text-xl";
  const tilePad = isFs ? "p-4 md:p-5" : "p-3";
  const tileLabelSize = isFs ? "text-sm" : "text-xs";
  const tilePtsSize = isFs ? "text-base" : "text-sm";

  return (
    <div className="min-h-screen w-full text-white" style={gradientBg}>
      {/* Hidden audio element for theme (no loop) */}
      <audio ref={themeRef} src={themeUrl} preload="auto" playsInline />

      {/* CONTENT CONTAINER (centers UI on desktop) */}
      <div className={classNames(containerW, "mx-auto")}>
        {/* Header */}
        <header className="px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Replace src with your image in /public to show the bubble photo */}
            <img src="/jon-5th-grade.jpg" alt="Jon (5th grade)" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover" />
            {/* <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-sm" /> */}
            <h1 className={classNames(h1Size, "font-extrabold tracking-tight drop-shadow")}>
              Are You Smarter Than a 5th Grader?
              <span className="block text-white/90 text-lg md:text-xl">Jon Edition</span>
            </h1>
          </div>
          <div className="text-right px-4 flex items-end gap-3 md:gap-4">
            <div>
              <div className="text-sm uppercase tracking-wider opacity-80">Score</div>
              <div className={classNames(isFs ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl", "font-black tabular-nums")}>{displayScore}</div>
              <div className="mt-2 flex items-center gap-2 justify-end">
                <label className="text-xs opacity-80">Vol</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(volume * 100)}
                  onChange={(e) => setVolume(parseInt(e.target.value, 10) / 100)}
                  className={classNames(isFs ? "w-36" : "w-28", "accent-white")}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {!isThemePlaying ? (
                <button onClick={playTheme} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition">Play Theme Song</button>
              ) : (
                <button onClick={stopTheme} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition">Stop Theme</button>
              )}
              <button onClick={toggleFullscreen} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition">
                {isFs ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            </div>
          </div>
        </header>

        {/* Lifelines strip (global) */}
        {phase !== "million" && phase !== "win" && phase !== "lose" && (
          <div className="px-4 md:px-8">
            <div className="flex flex-wrap gap-2 items-center mb-2">
              {lifelinePill("Peek (Cody)", lifelines.peek)}
              {lifelinePill("Copy (Cody)", lifelines.copy)}
              {lifelinePill("Hint", lifelines.hint)}
              {lifelinePill("Save", lifelines.save)}
            </div>
          </div>
        )}

        {/* BOARD PHASE */}
        {phase === "board" && (
          <main className="px-4 md:px-8 pb-10">
            <div className="mb-3 text-sm opacity-90">Pick any grade & question tile to begin. Remaining: {remaining}</div>
            <div className="overflow-x-auto">
              <div className={classNames("grid grid-cols-5 gap-3", boardMinW)}>
                {[1, 2, 3, 4, 5].map((g) => (
                  <div key={g} className="bg-white/10 rounded-2xl p-3 md:p-4 backdrop-blur-md">
                    <div className={classNames("text-center font-black mb-2", gradeTitleSize)}>Grade {g}</div>
                    <div className="space-y-2">
                      {byGrade[g].map((q) => {
                        const isPlayed = played.has(q.id);
                        return (
                          <button
                            key={q.id}
                            disabled={isPlayed}
                            onClick={() => startQuestion(q.id)}
                            className={classNames(
                              "w-full text-left bg-white text-black rounded-xl shadow transition",
                              tilePad,
                              isPlayed ? "opacity-40 line-through" : "hover:shadow-lg"
                            )}
                          >
                            <div className={classNames("uppercase tracking-widest opacity-70 font-bold", tileLabelSize)}>{q.subject}</div>
                            <div className={classNames("font-semibold", tilePtsSize)}>{q.grade * 100} pts</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2 items-center">
              <button onClick={restart} className="px-4 py-2 rounded-xl bg-white text-black hover:opacity-90 transition">Restart</button>
            </div>
          </main>
        )}

        {/* QUESTION PHASE */}
        {phase === "question" && current && (
          <main className="px-4 md:px-8 py-6">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-5 md:p-7"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="inline-flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-black/30 text-white/90 text-xs uppercase tracking-wider">{current.subject}</span>
                  <span className="px-3 py-1 rounded-full bg-black/30 text-white/90 text-xs uppercase tracking-wider">Grade {current.grade}</span>
                  <span className="px-3 py-1 rounded-full bg-black/30 text-white/90 text-xs uppercase tracking-wider">{current.grade * 100} pts</span>
                </div>

                {/* Lifelines (actions) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={doPeek}
                    disabled={lifelines.peek || locked}
                    className={classNames(
                      "px-3 py-2 rounded-xl text-sm font-semibold transition shadow",
                      lifelines.peek || locked ? "bg-white/20 text-white/60" : "bg-white text-black hover:opacity-90"
                    )}
                    title="Ask Cody for her suggestion (nothing shown on screen)"
                  >
                    Peek
                  </button>
                  <button
                    onClick={doCopy}
                    disabled={lifelines.copy || locked}
                    className={classNames(
                      "px-3 py-2 rounded-xl text-sm font-semibold transition shadow",
                      lifelines.copy || locked ? "bg-white/20 text-white/60" : "bg-white text-black hover:opacity-90"
                    )}
                    title="Copy Cody's answer (host selects A/B/C/D)"
                  >
                    Copy
                  </button>
                  <button
                    onClick={doHint}
                    disabled={lifelines.hint || locked}
                    className={classNames(
                      "px-3 py-2 rounded-xl text-sm font-semibold transition shadow",
                      lifelines.hint || locked ? "bg-white/20 text-white/60" : "bg-white text-black hover:opacity-90"
                    )}
                    title="Reveal the written hint (once per game)"
                  >
                    Hint
                  </button>
                  <button
                    disabled
                    className={classNames(
                      "px-3 py-2 rounded-xl text-sm font-semibold transition shadow",
                      lifelines.save ? "bg-white/20 text-white/60" : "bg-white text-black"
                    )}
                    title="Save triggers automatically on your first wrong answer"
                  >
                    Save (auto)
                  </button>
                </div>
              </div>

              <div className="mt-4 md:mt-6">
                <div className={classNames(isFs ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl", "font-bold leading-snug drop-shadow-sm")}>{current.q}</div>

                {/* Hint — visible for everyone once used */}
                <AnimatePresence>
                  {lifelines.hint && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-3 text-white/90 bg-black/30 rounded-xl p-3 text-sm"
                    >
                      💡 <span className="opacity-90">Hint:</span> {current.hint}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Choices */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {current.choices.map((choice, i) => {
                    const isAnswer = i === current.answerIndex;
                    let stateClasses = "";
                    if (locked && result === "correct" && isAnswer) stateClasses = "ring-4 ring-green-400";
                    if (locked && result?.startsWith("wrong") && isAnswer) stateClasses = "ring-4 ring-green-300";
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={locked}
                        className={classNames(
                          "relative group text-left bg-white text-black rounded-2xl p-4 shadow hover:shadow-lg transition focus:outline-none focus-visible:ring-4 focus-visible:ring-black/40",
                          stateClasses
                        )}
                      >
                        <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">{String.fromCharCode(65 + i)}</div>
                        <div className="text-lg leading-snug">{choice}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback + Controls */}
                <div className="min-h-10 mt-4 flex flex-wrap items-center gap-2">
                  <AnimatePresence>
                    {result === "correct" && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-400/90 text-black font-semibold shadow"
                      >
                        ✅ Correct! +{current.grade * 100}
                      </motion.div>
                    )}
                    {result === "wrong-saved" && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-300/90 text-black font-semibold shadow"
                      >
                        🛟 Wrong — but your Save rescued you!
                      </motion.div>
                    )}
                    {result === "wrong" && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-400/90 text-black font-semibold shadow"
                      >
                        ❌ Not quite.
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button onClick={backToBoard} disabled={locked} className="px-4 py-2 rounded-xl bg-black/40 text-white hover:bg-black/50 transition" title="B to go back">
                    Back to Board
                  </button>
                  <button onClick={restart} className="px-4 py-2 rounded-xl bg-white text-black hover:opacity-90 transition" title="R to restart">
                    Restart
                  </button>
                </div>
              </div>
            </motion.div>
          </main>
        )}

        {/* OVERLAYS */}
        <AnimatePresence>
          {peekOverlay && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white text-black rounded-2xl p-6 shadow max-w-md w-[90%] text-center">
                <div className="text-xl font-black mb-2">Peek (Cody)</div>
                <p>
                  Ask <strong>Cody</strong> for her suggestion now. Nothing will be shown on screen.
                </p>
                <button onClick={() => setPeekOverlay(false)} className="mt-4 px-4 py-2 rounded-xl bg-black text-white hover:opacity-90 transition">
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {copyModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white text-black rounded-2xl p-6 shadow max-w-md w-[90%] text-center">
                <div className="text-xl font-black mb-3">Copy (Cody)</div>
                <p className="mb-3">Select the option Cody just said:</p>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <button key={i} onClick={() => { setCopyModal(false); handleAnswer(i); }} className="px-4 py-3 rounded-xl bg-black text-white hover:opacity-90 transition">
                      {String.fromCharCode(65 + i)}
                    </button>
                  ))}
                </div>
                <button onClick={() => setCopyModal(false)} className="mt-4 px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MILLION-DOLLAR QUESTION */}
        {phase === "million" && (
          <main className="px-4 md:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8">
              <div className="text-center mb-4">
                <div className={classNames(isFs ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl", "font-black")}>💰 Million-Dollar Question</div>
                <div className="mt-1 text-white/90">No lifelines remain. Choose wisely.</div>
              </div>
              <div className={classNames(isFs ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl", "font-bold leading-snug drop-shadow-sm text-center")}>
                {MILLION_Q.q}
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {MILLION_Q.choices.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => handleMillionAnswer(i)}
                    disabled={locked}
                    className="text-left bg-white text-black rounded-2xl p-4 shadow hover:shadow-lg transition focus:outline-none focus-visible:ring-4 focus-visible:ring-black/40"
                  >
                    <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">{String.fromCharCode(65 + i)}</div>
                    <div className="text-lg leading-snug">{c}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </main>
        )}

        {/* WIN SCREEN */}
        {phase === "win" && (
          <main className="px-4 md:px-8 py-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white text-black rounded-2xl p-6 shadow text-center">
              <div className={classNames(isFs ? "text-5xl md:text-6xl" : "text-3xl md:text-5xl", "font-black mb-2")}>🏆 YOU ARE SMARTER THAN JON!</div>
              <div className={classNames(isFs ? "text-3xl" : "text-2xl md:text-3xl")}>
                <WinWinnings />
              </div>
              <div className="mt-4">
                <button onClick={restart} className="px-5 py-3 rounded-2xl bg-black text-white hover:opacity-90 transition">Play Again</button>
              </div>
            </motion.div>
          </main>
        )}

        {/* LOSE SCREEN */}
        {phase === "lose" && (
          <main className="px-4 md:px-8 py-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white text-black rounded-2xl p-6 shadow text-center">
              <div className="text-2xl md:text-3xl font-black mb-2">Winnings: $0</div>
              <div className={classNames(isFs ? "text-5xl md:text-6xl" : "text-3xl md:text-5xl", "font-black")}>Repeat after me:</div>
              <div className="mt-2 text-3xl md:text-5xl font-black text-red-600">“I am not smarter than Jon.”</div>
              <div className="mt-4">
                <button onClick={restart} className="px-5 py-3 rounded-2xl bg-black text-white hover:opacity-90 transition">Try Again</button>
              </div>
            </motion.div>
          </main>
        )}
      </div>
    </div>
  );
}
