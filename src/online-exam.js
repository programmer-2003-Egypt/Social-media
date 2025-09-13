// App.jsx
// npm i axios socket.io-client uuid styled-components
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import * as UI from "./exam-design"; // keep your existing UI helper components
import Swal from "sweetalert2";
// ---------------------------------------------
// CONFIG
// ---------------------------------------------
const API = "http://localhost:5000"; // change to your backend base URL
const AUTH_PATH = "/api/auth/login"; // advanced backend login path
const FALLBACK_LOGIN = "/login";      // very-simple backend fallback
const SOCKET_PATH = "/"; // socket.io path on same server

// ---------------------------------------------
// Helpers
// ---------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nowIso = () => new Date().toISOString();
const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((v) => v[1]);

// small hook for intervals
function useInterval(cb, delay) {
  const ref = useRef();
  useEffect(() => (ref.current = cb), [cb]);
  useEffect(() => {
    if (delay == null) return;
    const id = setInterval(() => ref.current && ref.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// ---------------------------------------------
// Screen recorder with chunked upload
// returns { start, stop, isRecording }
// ---------------------------------------------
function useScreenRecorder({ apiBase, tokenRef, attemptIdRef }) {
  const recorderRef = useRef(null);
  const uploadIdRef = useRef(null);
  const indexRef = useRef(0);
  const totalRef = useRef(0);

  useEffect(() => {
    return () => stop().catch(() => {});
  }, []);

  async function start() {
    if (recorderRef.current) return;
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error("Screen capture not supported in this browser");
    }
    // user consent required
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 8 },
      audio: false,
    });

    const mime = "video/webm;codecs=vp8";
    let rec;
    try {
      rec = new MediaRecorder(stream, { mimeType: mime });
    } catch (e) {
      rec = new MediaRecorder(stream);
    }
    uploadIdRef.current = uuidv4();
    indexRef.current = 0;
    totalRef.current = 0;

    rec.ondataavailable = async (ev) => {
      if (!ev.data || !ev.data.size) return;
      const fd = new FormData();
      fd.append("chunk", ev.data, `part-${indexRef.current}.webm`);
      fd.append("uploadId", uploadIdRef.current);
      fd.append("attemptId", attemptIdRef.current?.current || "");
      fd.append("index", String(indexRef.current));
      fd.append("total", "0"); // server will be told the real total on complete
      try {
        await axios.post(`${apiBase}/api/record/upload`, fd, {
          headers: { Authorization: `Bearer ${tokenRef.current}` },
          timeout: 20000,
        });
        indexRef.current += 1;
        totalRef.current = indexRef.current;
      } catch (err) {
        console.warn("chunk upload failed", err);
      }
    };

    rec.onerror = (e) => console.warn("recorder error", e);
    rec.onstop = () => {
      // stop tracks
      stream.getTracks().forEach((t) => t.stop());
    };

    rec.start(3000); // emit blobs every 3s
    recorderRef.current = rec;
    return;
  }

  async function stop() {
    const rec = recorderRef.current;
    if (!rec) return;
    if (rec.state !== "inactive") rec.stop();
    recorderRef.current = null;
    // wait so last chunk fires
    await sleep(300);
    const uploadId = uploadIdRef.current;
    const total = totalRef.current;
    if (!uploadId) return;
    try {
      await axios.post(
        `${apiBase}/api/record/complete`,
        { uploadId, attemptId: attemptIdRef.current, total },
        { headers: { Authorization: `Bearer ${tokenRef.current}` } }
      );
    } catch (err) {
      console.warn("complete upload failed", err);
    }
  }

  return {
    start: async () => start(),
    stop: async () => stop(),
    isRecording: !!recorderRef.current,
  };
}

// ---------------------------------------------
// Main App
// ---------------------------------------------
export default function App() {
  // auth
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState(""); // optional for fallback
  const [token, setToken] = useState(null);
  const tokenRef = useRef(null);
  tokenRef.current = token;

  // exam / attempt state
  const [examCode, setExamCode] = useState("");
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const attemptIdRef = useRef(null); // store id for recorder hook
  attemptIdRef.current = attempt?._id || attempt?.id || null;

  // answers + lifecycle
  const [answers, setAnswers] = useState({});
  const [startedAt, setStartedAt] = useState(null);
  const [endsAt, setEndsAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // anti-cheat flags
  const [cheatCount, setCheatCount] = useState(0);
  const [flags, setFlags] = useState({
    leftFullscreen: 0,
    visibilityLoss: 0,
    blur: 0,
    pasteTried: 0,
    ctxTried: 0,
    devtools: 0,
    timeOver: false,
  });

  // UI / misc
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  // derived
  const timeLeft = useMemo(() => {
    if (!endsAt) return 0;
    const ms = new Date(endsAt).getTime() - Date.now();
    return Math.max(0, Math.floor(ms / 1000));
  }, [endsAt]);

  // attach token to axios globally
  useEffect(() => {
    if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete axios.defaults.headers.common.Authorization;
  }, [token]);

  // socket.io connect when attempt exists
  useEffect(() => {
    if (!attempt) return;
    const socket = io(API, { path: SOCKET_PATH });
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("joinAttempt", { attemptId: attempt._id || attempt.id, role: "student" });
    });
    // receive proctor messages
    socket.on("policy:lock", (data) => {
      console.warn("Policy lock from server", data);
      alert("Proctor action: " + (data.reason || "locked"));
    });
    socket.on("attempt:update", (d) => {
      console.log("attempt update", d);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [attempt]);

  // autosave
  const saveAttempt = async (reason = "autosave") => {
    if (!attemptIdRef.current) return;
    setSaving(true);
    try {
      await axios.post(`${API}/api/attempt/save`, { attemptId: attemptIdRef.current, answers });
      await logEvent("attempt_saved", { reason, snapshot: answers });
    } catch (e) {
      console.warn("save failed", e);
    } finally {
      setSaving(false);
    }
  };
  useInterval(() => {
    if (!submitted && attemptIdRef.current) saveAttempt("interval");
  }, 15_000);

  // notifier / heartbeat (to server)
  useInterval(() => {
    if (!attemptIdRef.current || submitted) return;
    axios
      .post(`${API}/api/proctor/heartbeat`, {
        attemptId: attemptIdRef.current,
        cheatCount,
        flags,
        ts: Date.now(),
      })
      .catch(() => {});
  }, 20_000);

  // anti-cheat listeners (visibility, blur, fullscreen)
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) incFlag("visibilityLoss");
    };
    const onBlur = () => incFlag("blur");
    const onFs = () => {
      const inFs = !!document.fullscreenElement;
      if (!inFs) incFlag("leftFullscreen");
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFs);

    let attemptCount = 0;

    const onKey = (e) => {
      let blocked = false;
      let reason = "";
    
      // 🔒 Block developer tools combos
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C", "K"].includes(e.key.toUpperCase()))
      ) {
        blocked = true;
        reason = "Developer Tools Shortcut";
      }
    
      // 🔒 Block clipboard actions
      if ((e.ctrlKey || e.metaKey) && ["c", "x", "p", "s", "u"].includes(e.key.toLowerCase())) {
        blocked = true;
        reason = `Clipboard/Save action (${e.key.toUpperCase()})`;
      }
    
      // 🔒 Block PrintScreen
      if (e.key === "PrintScreen") {
        blocked = true;
        reason = "Screenshot attempt";
      }
    
      // 🔒 Block select all + cut + copy combo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        blocked = true;
        reason = "Mass Select Attempt";
      }
    
      // 🔒 Block refresh and back navigation
      if ((e.ctrlKey || e.metaKey) && ["r", "f5"].includes(e.key.toLowerCase())) {
        blocked = true;
        reason = "Refresh attempt";
      }
    
      // ✅ If blocked, prevent and show Swal alert
      if (blocked) {
        e.preventDefault();
        attemptCount++;
    
        Swal.fire({
          title: "⚠️ Action Blocked",
          html: `
            <p>You tried a restricted action:</p>
            <b>${reason}</b>
            <br><br>
            <small>Attempt #${attemptCount}</small>
          `,
          icon: "warning",
          confirmButtonText: "Okay",
          background: attemptCount >= 3 ? "#ffcccc" : "#fff",
          confirmButtonColor: attemptCount >= 3 ? "#d33" : "#3085d6",
        });
    
        // ⛔ Lock user out after 5 attempts
        if (attemptCount >= 5) {
          Swal.fire({
            title: "🚫 Access Denied",
            text: "Too many suspicious attempts! Please reload the page.",
            icon: "error",
            confirmButtonText: "Reload",
            allowOutsideClick: false,
            allowEscapeKey: false,
            willClose: () => {
              window.location.reload();
            },
          });
        }
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("keydown", onKey);
    };
  }, [attemptIdRef.current]);

  // heuristic devtools detection
  useEffect(() => {
    let opened = false;
    const id = setInterval(() => {
      const threshold = 160;
      const w = window.outerWidth - window.innerWidth > threshold;
      const h = window.outerHeight - window.innerHeight > threshold;
      if (w || h) {
        if (!opened) {
          opened = true;
          incFlag("devtools");
        }
      } else {
        opened = false;
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onBU = (e) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = ""; // Needed for browser prompt
        // ✅ Custom Swal popup instead of default dialog
        Swal.fire({
          title: "Are you sure?",
          text: "You have unsaved changes, leaving will discard them!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Leave",
          cancelButtonText: "Stay",
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
        }).then((result) => {
          if (result.isConfirmed) {
            window.removeEventListener("beforeunload", onBU);
          
          }
        });
      }
    };

    window.addEventListener("beforeunload", onBU);
    return () => window.removeEventListener("beforeunload", onBU);
  }, [submitted]);

  // increment flag helper
  const incFlag = (k, meta = {}) => {
    setFlags((f) => ({ ...f, [k]: (f[k] || 0) + 1 }));
    setCheatCount((c) => c + 1);
    if (attemptIdRef.current) logEvent("cheat_event", { type: k, meta });
  };

  // log event helper
  const logEvent = async (type, meta = {}) => {
    try {
      if (!attemptIdRef.current) return;
      await axios.post(`${API}/api/event`, {
        attempt_id: attemptIdRef.current,
        type,
        meta,
      });
    } catch (e) {
      // ignore
    }
  };

  // ---------------------------------------------
  // Auth & Start exam flows
  // ---------------------------------------------
  const login = async (opts = {}) => {
    setErr("");
    setLoading(true);
    try {
      // Try advanced auth first
      try {
        const res = await axios.post(`${API}${AUTH_PATH}`, {
          email,
          fullName,
          role: "student",
        });
        const { token: tkn, user } = res.data;
        setToken(tkn);
        tokenRef.current = tkn;
        return { ok: true, tkn, user };
      } catch (e) {
        // fallback to legacy /login if available
        const fallback = await axios.post(`${API}${FALLBACK_LOGIN}`, { username: email, password });
        const tkn = fallback.data.token;
        setToken(tkn);
        tokenRef.current = tkn;
        return { ok: true, tkn, user: fallback.data.user || null };
      }
    } catch (e) {
      setErr(e.response?.data?.error || e.message || "Login failed");
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };

  const startExam = async () => {
    setErr("");
    setLoading(true);
    try {
      // device snapshot
      const device = {
        platform: navigator.platform,
        screen: { w: window.screen.width, h: window.screen.height, pixelRatio: window.devicePixelRatio },
      };
      // advanced server expects /api/exam/start with auth
      const res = await axios.post(`${API}/api/exam/start`, { examCode, device });
      const { exam: ex, questions: qs, attempt: att } = res.data;
      setExam(ex);
      setQuestions(ex.shuffle ? shuffle(qs) : qs);
      setAttempt(att);
      setStartedAt(att.started_at);
      setEndsAt(att.ends_at);
      attemptIdRef.current = att._id || att.id;
      await requestFullscreen();
      await logEvent("attempt_started", { startedAt: att.started_at, endsAt: att.ends_at });
    } catch (e) {
      // fallback simple flow (if advanced not present)
      try {
        const fallback = await axios.post(`${API}/api/exams/${encodeURIComponent(examCode)}`); // maybe server supports this endpoint
        const ex = fallback.data;
        setExam(ex);
        // fetch questions
        const qsRes = await axios.get(`${API}/api/exams/${encodeURIComponent(examCode)}/questions`);
        setQuestions(qsRes.data);
        setStartedAt(nowIso());
        const end = new Date(Date.now() + (ex.duration_minutes || 30) * 60 * 1000).toISOString();
        setEndsAt(end);
        // create a local "attempt" mock if server doesn't
        const att = { id: uuidv4(), started_at: nowIso(), ends_at: end };
        setAttempt(att);
        attemptIdRef.current = att.id;
      } catch (err) {
        setErr(err.response?.data?.error || err.message || "Failed to start exam");
      }
    } finally {
      setLoading(false);
    }
  };

  // request fullscreen
  async function requestFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    } catch (e) {}
  }

  // submit
  const calculateScore = () => {
    let s = 0;
    for (const q of questions) {
      if (q.type === "mcq_single") {
        if (answers[q.id] === q.correct?.[0]) s++;
      } else if (q.type === "mcq_multi") {
        const a = Array.isArray(answers[q.id]) ? [...answers[q.id]].sort() : [];
        const c = Array.isArray(q.correct) ? [...q.correct].sort() : [];
        if (JSON.stringify(a) === JSON.stringify(c)) s++;
      } else if (q.type === "short_text") {
        const a = (answers[q.id] || "").trim().toLowerCase();
        const c = (q.correct_text || "").trim().toLowerCase();
        if (a && c && a === c) s++;
      }
    }
    return s;
  };

  const submitNow = async (auto = false) => {
    if (!attemptIdRef.current || submitted) return;
    await saveAttempt(auto ? "time_up" : "manual_submit");
    const s = calculateScore();
    setScore(s);
    setSubmitted(true);
    try {
      await axios.post(`${API}/api/attempt/submit`, {
        attemptId: attemptIdRef.current,
        answers,
        score: s,
        flags,
        cheatCount,
      });
      await logEvent("attempt_submitted", { auto, score: s, total: questions.length });
    } catch (err) {
      console.warn("submit backend error", err);
    } finally {
      // exit fullscreen if in it
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
      } catch (e) {}
    }
  };

  // answer setter
  const setAnswer = (qid, value, multi = false) => {
    setAnswers((prev) => {
      let v = value;
      if (multi) {
        const prevArr = Array.isArray(prev[qid]) ? prev[qid] : [];
        v = prevArr.includes(value) ? prevArr.filter((x) => x !== value) : [...prevArr, value];
      }
      return { ...prev, [qid]: v };
    });
  };

  // Timer enforce auto-submit
  useEffect(() => {
    if (!endsAt || submitted) return;
    const id = setInterval(() => {
      if (Date.now() >= new Date(endsAt).getTime()) {
        setFlags((f) => ({ ...f, timeOver: true }));
        clearInterval(id);
        submitNow(true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt, submitted]);

  // use our recorder
  const recorder = useScreenRecorder({ apiBase: API, tokenRef, attemptIdRef });

  // ---------------------------------------------
  // RENDER
  // ---------------------------------------------
  return (
    <>
      <UI.Global />
      <UI.Shell>
        {!exam ? (
          <UI.Card>
            <UI.Title>Secure Exam Login</UI.Title>
            <UI.Sub>
              Enter your info and the <UI.Badge>Exam Code</UI.Badge> to begin. Fullscreen will be required.
            </UI.Sub>

            {err && (
  <UI.ErrorBox
  >
    <span style={{ fontSize: "18px" }}>⚠️</span>
    <span>{err}</span>
    <button
      onClick={() => setErr(null)}
      style={{
        marginLeft: "auto",
        background: "transparent",
        border: "none",
        color: "#b71c1c",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px",
        transition: "color 0.2s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.color = "#f44336")}
      onMouseOut={(e) => (e.currentTarget.style.color = "#b71c1c")}
    >
      ✖
    </button>
  </UI.ErrorBox>
)}


            {/* Auth area */}
            {!token ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const ok = await login();
                  if (!ok.ok) return;
                }}
              >
                <UI.Grid2>
                  <div>
                    <UI.Muted>Full Name</UI.Muted>
                    <UI.Input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Your full name" />
                  </div>
                  <div>
                    <UI.Muted>Email</UI.Muted>
                    <UI.Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
                  </div>
                </UI.Grid2>

                <div style={{ marginTop: 12 }}>
                  <UI.Muted>Exam Code</UI.Muted>
                  <UI.Input value={examCode} onChange={(e) => setExamCode(e.target.value.trim())} placeholder="e.g. FE-QUIZ-2025" />
                </div>

                <UI.Flex style={{ marginTop: 16 }}>
                  <UI.Button disabled={loading || !email || !fullName}>Login</UI.Button>
                  <UI.Button onClick={async () => {
                    // quick login + start
                    const r = await login();
                    if (r.ok) startExam();
                  }} style={{ marginLeft: 10 }}>
                    Login & Start (quick)
                  </UI.Button>
                </UI.Flex>

                <UI.Sub style={{ marginTop: 8 }}>
                  <UI.Muted>Tip:</UI.Muted> Allow screen recording if asked and keep the window in fullscreen.
                </UI.Sub>
              </form>
            ) : (
              <div>
                <UI.Sub>Signed in. <UI.Muted>Token present</UI.Muted></UI.Sub>
                <UI.Flex style={{ marginTop: 10 }}>
                  <UI.Button onClick={startExam} disabled={loading || !examCode}>Start Exam</UI.Button>
                  <UI.Button onClick={() => { setToken(null); setExam(null); }}>Logout</UI.Button>
                </UI.Flex>
              </div>
            )}
          </UI.Card>
        ) : (
          <UI.Card>
            <UI.Flex style={{ justifyContent: "space-between" }}>
              <UI.Title>{exam.title || "Exam"}</UI.Title>
              <UI.Flex>
                <UI.Badge>Cheat flags: {cheatCount}</UI.Badge>
                <UI.Badge>{submitted ? "Submitted" : "In progress"}</UI.Badge>
              </UI.Flex>
            </UI.Flex>

            <UI.Flex style={{ gap: 16, marginBottom: 10 }}>
              <UI.Badge>Duration: {exam.duration_minutes || 30} min</UI.Badge>
              <UI.Badge>Ends: {endsAt ? new Date(endsAt).toLocaleTimeString() : "—"}</UI.Badge>
              <UI.Badge>Time left: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s</UI.Badge>
              {saving && <UI.Badge>Saving…</UI.Badge>}
            </UI.Flex>

            <UI.Sub style={{ marginTop: 10 }}>
              Please keep the window in <b>fullscreen</b>, avoid switching tabs, and do not copy/paste. Violations are logged.
            </UI.Sub>

            {/* Questions */}
            <div style={{ marginTop: 16 }}>
              {questions.map((q, idx) => (
                <UI.QCard key={q._id || q.id || idx}>
                  <UI.Flex style={{ justifyContent: "space-between" }}>
                    <b>Q{idx + 1}.</b>
                    <UI.Badge>{(q.type || "").replace("mcq", "MCQ")}</UI.Badge>
                  </UI.Flex>
                  <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{q.text}</div>

                  {/* Options */}
                  {q.type === "mcq_single" && (
                    <div style={{ marginTop: 8 }}>
                      {(q.options || []).map((opt) => (
                        <UI.Opt key={opt}>
                          <input type="radio" name={`q-${q._id || q.id || q.text}`} checked={answers[q._id || q.id] === opt} onChange={() => setAnswer(q._id || q.id, opt, false)} />
                          <span>{opt}</span>
                        </UI.Opt>
                      ))}
                    </div>
                  )}

                  {q.type === "mcq_multi" && (
                    <div style={{ marginTop: 8 }}>
                      {(q.options || []).map((opt) => (
                        <UI.Opt key={opt}>
                          <input type="checkbox" checked={Array.isArray(answers[q._id || q.id]) ? answers[q._id || q.id].includes(opt) : false} onChange={() => setAnswer(q._id || q.id, opt, true)} />
                          <span>{opt}</span>
                        </UI.Opt>
                      ))}
                    </div>
                  )}

                  {q.type === "short_text" && (
                    <div style={{ marginTop: 8 }}>
                      <UI.Input placeholder="Your answer" value={answers[q._id || q.id] || ""} onChange={(e) => setAnswer(q._id || q.id, e.target.value, false)} onPaste={(e) => { e.preventDefault(); incFlag("pasteTried"); }} />
                    </div>
                  )}
                </UI.QCard>
              ))}
            </div>

            <UI.Flex style={{ justifyContent: "space-between", marginTop: 16 }}>
              <UI.Flex>
                <UI.Button onClick={() => saveAttempt("manual")} disabled={submitted}>Save</UI.Button>

                <UI.Button onClick={() => submitNow(false)} disabled={submitted} style={{ marginLeft: 8, background: "#14b86a", borderColor: "#2a7a57" }}>
                  Submit
                </UI.Button>
              </UI.Flex>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <UI.Muted>Leave fullscreen or switching tabs increases flags.</UI.Muted>
              </div>
            </UI.Flex>

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <UI.Button onClick={async () => { try { await recorder.start(); } catch (e) { alert(String(e)); } }} disabled={recorder.isRecording}>Start Screen Recording</UI.Button>
              <UI.Button onClick={async () => { await recorder.stop(); }}>Stop Recording</UI.Button>
              <UI.Button onClick={async () => {
                try {
                  await axios.post(`${API}/api/event`, { attempt_id: attemptIdRef.current, type: "manual_proctor_ping", meta: { ts: Date.now() } });
                  alert("Proctor pinged");
                } catch (e) {
                  alert("Ping failed");
                }
              }}>Ping Proctor</UI.Button>
            </div>

            {submitted && (
              <UI.Card style={{ marginTop: 16, background: "#132240" }}>
                <UI.Title>Result</UI.Title>
                <UI.Sub>Score: <b>{score}</b> / {questions.length}</UI.Sub>
                <UI.Sub>Flags: <b>{cheatCount}</b> — {Object.entries(flags).map(([k, v]) => v ? `${k}:${v}` : null).filter(Boolean).join(", ") || "none"}</UI.Sub>
              </UI.Card>
            )}
          </UI.Card>
        )}
      </UI.Shell>
    </>
  );
}
