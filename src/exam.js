// App.jsx (single file)
// npm i react styled-components axios @supabase/supabase-js
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import * as UI from "./exam-design";
// ==== ENV (you provided) ====
const SUPABASE_URL = "https://fiiudqjenjticgprqkwn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpaXVkcWplbmp0aWNncHJxa3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTM0MjksImV4cCI6MjA3MTQ2OTQyOX0.fWRkgBV2_GrLr3xY0EWz55F-7dAqUD75MPNiofmBjKE";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==== STYLES ====


// ==== HELPERS ====
const shuffle = (arr)=>arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(v=>v[1]);
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
const nowIso = ()=>new Date().toISOString();

function useInterval(callback, delay){
  const savedRef = useRef();
  useEffect(()=>{ savedRef.current = callback },[callback]);
  useEffect(()=>{
    if (delay==null) return;
    const id = setInterval(()=>savedRef.current && savedRef.current(), delay);
    return ()=>clearInterval(id);
  },[delay]);
}

// ==== MAIN APP ====
export default function App(){
  // auth / exam
  const [email,setEmail] = useState("");
  const [fullName,setFullName] = useState("");
  const [examCode,setExamCode] = useState("");
  const [loading,setLoading] = useState(false);
  const [err,setErr] = useState("");
  const [exam,setExam] = useState(null);
  const [userRow,setUserRow] = useState(null);

  // questions / answers
  const [questions,setQuestions] = useState([]);
  const [answers,setAnswers] = useState({}); // {question_id: value | [values] | string}
  const [startedAt,setStartedAt] = useState(null);
  const [endsAt,setEndsAt] = useState(null);
  const [attemptId,setAttemptId] = useState(null);
  const [submitted,setSubmitted] = useState(false);
  const [score,setScore] = useState(null);
  const [saving,setSaving] = useState(false);

  // anti-cheat
  const [cheatCount,setCheatCount] = useState(0);
  const [flags,setFlags] = useState({
    leftFullscreen:0,
    visibilityLoss:0,
    blur:0,
    pasteTried:0,
    ctxTried:0,
    devtools:0,
    timeOver:false,
  });

  // derived
  const timeLeft = useMemo(()=>{
    if(!endsAt) return 0;
    const ms = new Date(endsAt).getTime() - Date.now();
    return Math.max(0, Math.floor(ms/1000));
  },[endsAt]);
  const progress = useMemo(()=>{
    if(!exam || !startedAt) return 0;
    const total = new Date(endsAt).getTime()-new Date(startedAt).getTime();
    const left = Math.max(0, new Date(endsAt).getTime()-Date.now());
    return Math.min(100, Math.round(((total-left)/total)*100));
  },[exam, startedAt, endsAt, timeLeft]);

  // ==== LOGIN / START ====
  const handleLogin = async (e)=>{
    e.preventDefault();
    setErr("");
    setLoading(true);
    try{
      // find exam by code
      const { data: examRows, error: exErr } = await supabase
        .from("exams").select("*").eq("id", examCode).maybeSingle();
      if(exErr || !examRows) throw new Error("Invalid exam code.");
      if(examRows.status && examRows.status !== "active") throw new Error("Exam not active.");
      setExam(examRows);

      // upsert user
      const { data: user, error: uErr } = await supabase
        .from("users")
        .upsert([{ email, full_name: fullName, user_agent: navigator.userAgent }], { onConflict: "email" })
        .select("*").maybeSingle();
      if(uErr) throw uErr;
      setUserRow(user);

      // check existing attempt
      const { data: existing } = await supabase
        .from("attempts").select("*")
        .eq("user_id", user.id).eq("exam_id", examRows.id)
        .order("created_at", { ascending: false }).limit(1);
      if(existing && existing[0] && existing[0].submitted){
        throw new Error("You already submitted this exam.");
      }

      // fetch questions
      const { data: qs, error: qErr } = await supabase
        .from("questions")
        .select("*")
        .eq("exam_id", examRows.id)
        .order("id");
      if(qErr) throw qErr;
      const qsFinal = examRows.shuffle ? shuffle(qs) : qs;

      // start attempt
      const start = new Date();
      const end = new Date(start.getTime()+ (examRows.duration_minutes||30)*60*1000);
      setStartedAt(start.toISOString());
      setEndsAt(end.toISOString());
      setQuestions(qsFinal);

      const { data: at, error: aErr } = await supabase
        .from("attempts")
        .insert([{
          exam_id: examRows.id,
          user_id: user.id,
          started_at: start.toISOString(),
          ends_at: end.toISOString(),
          ip: null, // could be filled via server
          user_agent: navigator.userAgent,
        }]).select("*");
      if(aErr) throw aErr;
      const att = at[0];
      setAttemptId(att.id);

      // Enforce fullscreen before begin answering
      await requestFullscreen();
      await logEvent(att.id, "attempt_started", { startedAt: start, endsAt: end });
    }catch(e2){
      setErr(e2.message || "Failed to start exam.");
    }finally{
      setLoading(false);
    }
  };

  // ==== FULLSCREEN ====
  const requestFullscreen = async ()=>{
    const docEl = document.documentElement;
    if(!document.fullscreenElement){
      await docEl.requestFullscreen?.();
    }
  };

  // ==== ANSWER HANDLERS ====
  const setAnswer = (qid, value, multi=false)=>{
    setAnswers(prev=>{
      let v = value;
      if(multi){
        const prevArr = Array.isArray(prev[qid]) ? prev[qid] : [];
        v = prevArr.includes(value) ? prevArr.filter(x=>x!==value) : [...prevArr, value];
      }
      return { ...prev, [qid]: v };
    });
  };

  // ==== AUTOSAVE ====
  const saveAttempt = async (reason="autosave")=>{
    if(!attemptId) return;
    setSaving(true);
    try{
      await supabase.from("attempts").update({
        answers: answers,
        updated_at: nowIso(),
      }).eq("id", attemptId);
      await logEvent(attemptId, "attempt_saved", { reason, snapshot: answers });
    }catch(e){ /* silent */ }finally{
      setSaving(false);
    }
  };
  useInterval(()=>{ if(!submitted && attemptId) saveAttempt("interval"); }, 15000);

  // ==== TIMER ====
  useEffect(()=>{
    if(!endsAt || submitted) return;
    const id = setInterval(()=>{
      if(Date.now() >= new Date(endsAt).getTime()){
        setFlags(f=>({ ...f, timeOver: true }));
        clearInterval(id);
        submitNow(true);
      }
    }, 1000);
    return ()=>clearInterval(id);
  },[endsAt, submitted]);

  // ==== SUBMIT ====
  const calculateScore = ()=>{
    let s = 0;
    for(const q of questions){
      if(q.type === "mcq_single"){
        if(answers[q.id] === q.correct?.[0]) s++;
      }else if(q.type === "mcq_multi"){
        const a = Array.isArray(answers[q.id]) ? [...answers[q.id]].sort() : [];
        const c = Array.isArray(q.correct) ? [...q.correct].sort() : [];
        if(JSON.stringify(a)===JSON.stringify(c)) s++;
      }else if(q.type === "short_text"){
        const a = (answers[q.id]||"").trim().toLowerCase();
        const c = (q.correct_text||"").trim().toLowerCase();
        if(a && c && a===c) s++;
      }
    }
    return s;
  };

  const submitNow = async (auto=false)=>{
    if(submitted || !attemptId) return;
    await saveAttempt(auto ? "time_up" : "manual_submit");
    const s = calculateScore();
    setScore(s);
    setSubmitted(true);
    await supabase.from("attempts").update({
      submitted: true,
      submitted_at: nowIso(),
      answers: answers,
      score: s,
      cheat_flags: flags,
      cheat_count: cheatCount
    }).eq("id", attemptId);
    await logEvent(attemptId, "attempt_submitted", { auto, score: s, total: questions.length });
    // exit fullscreen
    if(document.fullscreenElement) document.exitFullscreen?.();
  };

  // ==== ANTI-CHEAT ====
  const incFlag = (k, meta={})=>{
    setFlags(f=>({ ...f, [k]: (f[k]||0)+1 }));
    setCheatCount(c=>c+1);
    if(attemptId) logEvent(attemptId, "cheat_event", { type:k, ...meta });
  };

  // visibility / focus
  useEffect(()=>{
    const onVis = ()=>{ if(document.hidden) incFlag("visibilityLoss"); };
    const onBlur = ()=> incFlag("blur");
    const onFocus = ()=>{}; // no-op
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return ()=>{
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  },[attemptId]);

  // fullscreen leave
  useEffect(()=>{
    const onFs = ()=>{
      const inFs = !!document.fullscreenElement;
      if(!inFs){
        incFlag("leftFullscreen");
        // gently request again
        requestFullscreen().catch(()=>{});
      }
    };
    document.addEventListener("fullscreenchange", onFs);
    return ()=>document.removeEventListener("fullscreenchange", onFs);
  },[attemptId]);

  // disable context menu, copy/paste, print-screen hint
  useEffect(()=>{
    const onCtx = (e)=>{ e.preventDefault(); incFlag("ctxTried"); };
    const onKey = (e)=>{
      // Block Ctrl/Cmd+C, X, P, S, PrintScreen
      if((e.ctrlKey||e.metaKey) && ["c","x","p","s","u"].includes(e.key.toLowerCase())){ e.preventDefault(); incFlag("pasteTried",{key:e.key}); }
      if(e.key==="PrintScreen"){ incFlag("pasteTried",{key:"PrintScreen"}); }
      // Block F12 / Devtools
      if(e.key==="F12" || (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key.toUpperCase()))){ e.preventDefault(); incFlag("devtools"); }
    };
   /*   const onPaste = (e)=>{ e.preventDefault(); incFlag("pasteTried"); };
    const onCopy = (e)=>{ e.preventDefault(); incFlag("pasteTried"); };
    document.addEventListener("contextmenu", onCtx);
    document.addEventListener("keydown", onKey);
    document.addEventListener("paste", onPaste);
    document.addEventListener("copy", onCopy);  */
    return ()=>{
     /*   document.removeEventListener("contextmenu", onCtx);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("copy", onCopy);  */
    };
  },[attemptId]);

  // basic devtools detection (heuristic)
  useEffect(()=>{
    let opened = false;
    const check = ()=>{
      const threshold = 160;
      const w = window.outerWidth - window.innerWidth > threshold;
      const h = window.outerHeight - window.innerHeight > threshold;
      if(w || h){
        if(!opened){ opened = true; incFlag("devtools"); }
      }else{
        opened = false;
      }
    };
    const id = setInterval(check, 1000);
    return ()=>clearInterval(id);
  },[attemptId]);

  // before unload
  useEffect(()=>{
    const onBU = (e)=>{
      if(!submitted){
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBU);
    return ()=>window.removeEventListener("beforeunload", onBU);
  },[submitted]);

  // log utility
  async function logEvent(attempt_id, type, meta){
    try{
      await supabase.from("proctor_events").insert([{ attempt_id, type, meta, created_at: nowIso() }]);
    }catch(_e){}
  }

  // ==== MOCK: Axios usage example (optional)
  // You can send a signed webhook to your server for extra verification
  const notifyServer = async ()=>{
    try{
      await axios.post("http://localhost:5000/api/proctor/heartbeat", {
        attemptId, cheatCount, flags, ts: Date.now()
      }, { timeout: 3000 });
    }catch(_e){}
  };
  useInterval(()=>{ if(attemptId && !submitted) notifyServer(); }, 20000);

  // ==== RENDER ====
  return (
    <>
     <UI.Global/>
<UI.Shell>
  {!exam ? (
    <UI.Card>
      <UI.Title>Secure Exam Login</UI.Title>
      <UI.Sub>
        Enter your info and the <UI.Badge>Exam Code</UI.Badge> to begin. Fullscreen will be required.
      </UI.Sub>
      {err && <UI.ErrorBox>{err}</UI.ErrorBox>}
      <form onSubmit={handleLogin}>
        <UI.Grid2>
          <div>
            <UI.Muted>Full Name</UI.Muted>
            <UI.Input
              value={fullName}
              onChange={e=>setFullName(e.target.value)}
              required
              placeholder="Your full name"
            />
          </div>
          <div>
            <UI.Muted>Email</UI.Muted>
            <UI.Input
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
        </UI.Grid2>
        <div style={{ marginTop: 12 }}>
          <UI.Muted>Exam Code</UI.Muted>
          <UI.Input
            value={examCode}
            onChange={e=>setExamCode(e.target.value.trim())}
            required
            placeholder="e.g. FE-QUIZ-2025"
          />
        </div>
        <UI.Flex style={{marginTop:16}}>
          <UI.Button disabled={loading || !email || !fullName || !examCode}>Start Exam</UI.Button>
          {loading && <UI.Muted>Checking…</UI.Muted>}
        </UI.Flex>
        <UI.Sub style={{marginTop:8}}>
          <UI.Muted>Tip:</UI.Muted> Disable extra monitors and notifications to avoid flags.
        </UI.Sub>
      </form>
    </UI.Card>
  ) : (
    <UI.Card>
      <UI.Flex style={{justifyContent:"space-between"}}>
        <UI.Title>{exam.title || "Exam"}</UI.Title>
        <UI.Flex>
          <UI.Badge>Cheat flags: {cheatCount}</UI.Badge>
          <UI.Badge>{submitted ? "Submitted" : "In progress"}</UI.Badge>
        </UI.Flex>
      </UI.Flex>

      <UI.Flex style={{gap:16, marginBottom:10}}>
        <UI.Badge>Duration: {exam.duration_minutes||30} min</UI.Badge>
        <UI.Badge>Ends: {new Date(endsAt).toLocaleTimeString()}</UI.Badge>
        <UI.Badge>Time left: {Math.floor(timeLeft/60)}m {timeLeft%60}s</UI.Badge>
        {saving && <UI.Badge>Saving…</UI.Badge>}
      </UI.Flex>
      <UI.BarWrap><UI.Bar w={progress}/></UI.BarWrap>

      <UI.Sub style={{marginTop:10}}>
        Please keep the window in <b>fullscreen</b>, avoid switching tabs, and do not copy/paste. Violations are logged.
      </UI.Sub>

      {/* QUESTIONS */}
      <div style={{marginTop:16}}>
        {questions.map((q, idx)=>(
          <UI.QCard key={q.id}>
            <UI.Flex style={{justifyContent:"space-between"}}>
              <b>Q{idx+1}.</b>
              <UI.Badge>{q.type.replace("mcq","MCQ")}</UI.Badge>
            </UI.Flex>
            <div style={{marginTop:8, whiteSpace:"pre-wrap"}}>{q.text}</div>

            {/* Options */}
            {q.type==="mcq_single" && (
              <div style={{marginTop:8}}>
                {(q.options||[]).map(opt=>(
                  <UI.Opt key={opt}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id]===opt}
                      onChange={()=>setAnswer(q.id, opt, false)}
                    />
                    <span>{opt}</span>
                  </UI.Opt>
                ))}
              </div>
            )}

            {q.type==="mcq_multi" && (
              <div style={{marginTop:8}}>
                {(q.options||[]).map(opt=>(
                  <UI.Opt key={opt}>
                    <input
                      type="checkbox"
                      checked={Array.isArray(answers[q.id]) ? answers[q.id].includes(opt) : false}
                      onChange={()=>setAnswer(q.id, opt, true)}
                    />
                    <span>{opt}</span>
                  </UI.Opt>
                ))}
              </div>
            )}

            {q.type==="short_text" && (
              <div style={{marginTop:8}}>
                <UI.Input
                  placeholder="Your answer"
                  value={answers[q.id]||""}
                  onChange={e=>setAnswer(q.id, e.target.value, false)}
                  onPaste={(e)=>{ e.preventDefault(); incFlag("pasteTried"); }}
                />
              </div>
            )}
          </UI.QCard>
        ))}
      </div>

      <UI.Flex style={{justifyContent:"space-between", marginTop:16}}>
        <UI.Flex>
          <UI.Button onClick={()=>saveAttempt("manual")} disabled={submitted}>Save</UI.Button>
          <UI.Button
            onClick={()=>submitNow(false)}
            disabled={submitted}
            style={{marginLeft:8, background:"#14b86a", borderColor:"#2a7a57"}}
          >
            Submit
          </UI.Button>
        </UI.Flex>
        <UI.Muted>Leaving fullscreen or switching tabs increases flags.</UI.Muted>
      </UI.Flex>

      {submitted && (
        <UI.Card style={{marginTop:16, background:"#132240"}}>
          <UI.Title>Result</UI.Title>
          <UI.Sub>Score: <b>{score}</b> / {questions.length}</UI.Sub>
          <UI.Sub>
            Flags: <b>{cheatCount}</b> — {Object.entries(flags).map(([k,v])=> v ?`${k}:${v}`:null).filter(Boolean).join(", ") || "none"}
          </UI.Sub>
        </UI.Card>
      )}
    </UI.Card>
  )}
</UI.Shell>

    </>
  );
}

