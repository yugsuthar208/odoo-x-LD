"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";
import type { CampusRole } from "../../lib/supabase/types";

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabase();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [previewRole, setPreviewRole] = useState<CampusRole>("Student");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    if (!supabase) { setBusy(false); setError("Add your Supabase URL and anon key to .env.local to enable account sign-in. You can still use the preview below."); return; }
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name.trim() } } });
    setBusy(false);
    if (result.error) { setError(result.error.message); return; }
    if (mode === "signup" && !result.data.session) { setNotice("Check your email to confirm your account, then come back here to sign in."); return; }
    window.localStorage.removeItem("campus-commons-preview-role");
    window.location.href = "/";
  }

  async function resetPassword() {
    setError(""); setNotice("");
    if (!supabase) { setError("Password reset is available after Supabase is configured."); return; }
    if (!email) { setError("Enter your email address first."); return; }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` });
    if (resetError) setError(resetError.message); else setNotice("If an account exists for that email, a reset link is on its way.");
  }

  function enterPreview() {
    window.localStorage.setItem("campus-commons-preview-role", previewRole);
    window.location.href = "/";
  }

  return (
    <main className="login-shell" suppressHydrationWarning>
      <section className="login-story">
        <a className="brand login-brand" href="/">
          <span className="brand-mark">c<span>✳</span></span>
          <span>campus<span className="brand-light">.commons</span><small>YOUR CAMPUS, IN SYNC</small></span>
        </a>
        <div className="login-story-copy">
          <p className="eyebrow">NORTHSTAR UNIVERSITY · AUTUMN ’26</p>
          <h1>Your campus<br/>is better <em>together.</em></h1>
          <p>One home for your clubs, events, people and the little things that make campus yours.</p>
          <div className="login-highlights">
            <span><b>24</b><small>active clubs</small></span>
            <span><b>38</b><small>things this week</small></span>
            <span><b>1</b><small>shared campus</small></span>
          </div>
        </div>
        <div className="login-story-art">
          <span className="login-sun">☼</span>
          <span className="login-flower">✳</span>
          <span className="login-doodle">good things<br/>grow here</span>
          <div className="login-hill"/>
        </div>
        <footer>✳ CAMPUS COMMONS <span>MADE FOR THE PEOPLE WHO MAKE CAMPUS.</span></footer>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="login-card-topline">
            <span><i className="live-dot"/> NORTHSTAR UNIVERSITY</span>
            <small>AUTUMN ’26</small>
          </div>
          <p className="eyebrow">YOUR PEOPLE ARE HERE</p>
          <h2>{mode === "signin" ? "Welcome back." : "Find your place."}</h2>
          <p className="login-intro">{mode === "signin" ? "Sign in to see what’s happening around you." : "Create your campus account and come on in."}</p>
          <div className="login-tabs">
            <button className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setError(""); setNotice(""); }}>SIGN IN</button>
            <button className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); setNotice(""); }}>CREATE ACCOUNT</button>
          </div>
          <form className="login-form" onSubmit={submit}>
            {mode === "signup" && <label>Your name<input autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="What should we call you?" required/></label>}
            <label>University email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@northstar.edu" required/></label>
            <label>Password<input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required/></label>
            {mode === "signin" && <button type="button" className="forgot-button" onClick={resetPassword}>Forgot password?</button>}
            <button className="login-submit" disabled={busy}>{busy ? "ONE MOMENT…" : mode === "signin" ? "COME ON IN ↗" : "CREATE MY ACCOUNT ↗"}</button>
          </form>
          {error && <p className="login-feedback error">{error}</p>}
          {notice && <p className="login-feedback success">{notice}</p>}
          <div className="preview-box">
            <div className="preview-title">
              <span>✳</span>
              <div><b>Just looking around?</b><small>Explore the interactive demo without an account.</small></div>
            </div>
            <label>PREVIEW A ROLE
              <select value={previewRole} onChange={e => setPreviewRole(e.target.value as CampusRole)}>
                <option>Student</option>
                <option>Club Leader</option>
                <option>Faculty</option>
                <option>Student Council</option>
                <option>Admin</option>
              </select>
            </label>
            <button onClick={enterPreview}>EXPLORE THE DEMO ↗</button>
          </div>
          <p className="login-security">Real accounts use Supabase authentication. Campus roles are assigned by an administrator.</p>
        </div>
      </section>
    </main>
  );
}
