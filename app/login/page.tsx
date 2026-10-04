"use client";

import { FormEvent, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getSupabase } from "../../lib/supabase";
import type { CampusRole } from "../../lib/supabase/types";
import { campusClubs } from "../../lib/clubs";

interface RoleMetadata {
  title: string;
  icon: string;
  badge: string;
  tagline: string;
  powers: string[];
  chips: string[];
}

const ROLES_INFO: Record<CampusRole, RoleMetadata> = {
  Student: {
    title: "Student Member",
    icon: "🎓",
    badge: "UNDERGRADUATE & POSTGRAD",
    tagline: "Explore campus culture, join 24 active clubs, and attend events.",
    powers: [
      "Access all 24 verified clubs & request memberships",
      "Instant RSVP to workshops, hackathons & photo walks",
      "Log verified volunteering hours and earn campus karma points",
      "Participate in student senate elections and university referendums",
    ],
    chips: ["24 Clubs", "Event Passes", "Volunteer Hours", "Marketplace"],
  },
  "Club Leader": {
    title: "Club Executive",
    icon: "⚡",
    badge: "SOCIETY LEADERSHIP",
    tagline: "Lead society operations, broadcast updates, and request grants.",
    powers: [
      "Requisition Student Council funding up to ₹50,000 per initiative",
      "Broadcast official announcements & schedule calendar events",
      "Review incoming student membership applications",
      "Manage club inventory, task boards, and member rosters",
    ],
    chips: ["Treasury Grants", "Broadcasts", "Member Approvals", "Task Boards"],
  },
  Faculty: {
    title: "Faculty Advisor",
    icon: "🏛️",
    badge: "ACADEMIC SUPERVISION",
    tagline: "Oversee academic and technical societies with formal governance.",
    powers: [
      "Authorize funding proposals before Student Council financial release",
      "Review and approve official on-campus and off-campus activities",
      "Supervise laboratory safety protocols and equipment requisitions",
      "Provide institutional mentorship for national competition teams",
    ],
    chips: ["Funding Approval", "Safety Oversight", "Event Sign-Off", "Mentorship"],
  },
  "Student Council": {
    title: "Student Council Senator",
    icon: "⚖️",
    badge: "STUDENT SENATE & TREASURY",
    tagline: "Govern the university student treasury and disburse club grants.",
    powers: [
      "Direct oversight of the ₹2.5 Lakh Student Council treasury reserve",
      "Review and disburse faculty-approved financial requisitions",
      "Record university budget receipts and audit transaction ledgers",
      "Host campus townhalls and review student body proposals",
    ],
    chips: ["₹2.5L Treasury", "Disbursements", "Senate Bills", "Ledger Audit"],
  },
  Admin: {
    title: "Campus Administrator",
    icon: "🛡️",
    badge: "INSTITUTIONAL OVERSIGHT",
    tagline: "Manage university-wide infrastructure, staff, and policies.",
    powers: [
      "Assign faculty advisors and student leaders across all 24 clubs",
      "Full administrative authority over global ledger and accounts",
      "Manage user role delegations and institutional security policies",
      "Real-time governance dashboard and audit log monitoring",
    ],
    chips: ["Authority Assignments", "Global Ledger", "Staff Profiles", "System Audit"],
  },
};

const SAMPLE_EVENTS = [
  {
    id: "ev-1",
    club: "IEEE Student Branch",
    title: "Autonomous Circuit Design Lab",
    time: "Fri · 17:00 IST",
    venue: "Electronics Core Lab 102",
    tag: "WORKSHOP",
  },
  {
    id: "ev-2",
    club: "Photography Club",
    title: "Golden Hour Architecture Walk",
    time: "Sat · 16:30 IST",
    venue: "Library Steps & Quad",
    tag: "PHOTO WALK",
  },
  {
    id: "ev-3",
    club: "Coding Society",
    title: "Campus HackNight: Real-Time Web Apps",
    time: "Sun · 18:00 IST",
    venue: "Turing Lab A-204",
    tag: "HACKATHON",
  },
];

const TESTIMONIALS = [
  {
    quote: "Campus Commons transformed how 24 societies run. From messy group chats to transparent funding requisitions and instantaneous RSVPs, everything is in sync.",
    name: "Aarav Sharma",
    role: "President, Coding Society · B.Tech '26",
    avatar: "AS",
  },
  {
    quote: "Reviewing budget requisitions and safety clearances takes two clicks now instead of three weeks of signatures across administrative blocks.",
    name: "Dr. Sunita Sen",
    role: "Faculty Advisor, IEEE & Robotics · Professor of Microelectronics",
    avatar: "SS",
  },
  {
    quote: "With transparent ledger tracking, every rupee allocated from our ₹2.5 Lakh student council budget is publicly accounted for across student societies.",
    name: "Divya Kapoor",
    role: "Treasurer, Student Council · Economics '26",
    avatar: "DK",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabase();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [previewRole, setPreviewRole] = useState<CampusRole>("Student");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Interactive UI state
  const [selectedDomain, setSelectedDomain] = useState<"ALL" | "TECH" | "CREATIVE" | "CULTURE" | "COMMUNITY">("ALL");
  const [rsvpedEvents, setRsvpedEvents] = useState<Record<string, boolean>>({});
  const [navVisible, setNavVisible] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const storyArtRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string): { score: number; label: string; colorClass: string } => {
    if (!pass) return { score: 0, label: "", colorClass: "" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    if (score === 1) return { score: 1, label: "Needs 8+ characters & numbers", colorClass: "active-weak" };
    if (score === 2) return { score: 2, label: "Moderate password", colorClass: "active-medium" };
    return { score: 3, label: "Strong & secure password", colorClass: "active-strong" };
  };

  const passwordStrength = getPasswordStrength(password);

  // GSAP ScrollTrigger Animations
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // Reading progress line
    gsap.to(".login-scroll-progress-fill", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: scrollWrapperRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.2,
      },
    });

    // Floating nav visibility trigger
    ScrollTrigger.create({
      trigger: ".login-shell",
      start: "bottom 80%",
      onEnter: () => setNavVisible(true),
      onLeaveBack: () => setNavVisible(false),
    });

    // Staggered reveal for Bento items
    const bentoItems = document.querySelectorAll(".bento-reveal-item");
    if (bentoItems.length > 0) {
      gsap.from(bentoItems, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".login-ecosystem-section",
          start: "top 80%",
          once: true,
        },
      });
    }

    // Staggered reveal for Role cards
    const roleCards = document.querySelectorAll(".role-showcase-card");
    if (roleCards.length > 0) {
      gsap.from(roleCards, {
        y: 45,
        opacity: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".login-roles-section",
          start: "top 80%",
          once: true,
        },
      });
    }

    // CTA card entrance
    const ctaCard = document.querySelector(".login-cta-card");
    if (ctaCard) {
      gsap.from(ctaCard, {
        scale: 0.96,
        y: 35,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".login-cta-section",
          start: "top 88%",
          once: true,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Mouse Parallax for Hero Story Art
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 24;
    const y = (clientY / innerHeight - 0.5) * 24;
    setMouseOffset({ x, y });
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    if (!supabase) {
      setBusy(false);
      setError("Add your Supabase URL and anon key to .env.local to enable account sign-in. You can still use the preview below.");
      return;
    }

    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name.trim() } } });

    setBusy(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      setNotice("Check your email to confirm your account, then come back here to sign in.");
      return;
    }
    window.localStorage.removeItem("campus-commons-preview-role");
    window.location.href = "/dashboard";
  }

  async function resetPassword() {
    setError("");
    setNotice("");
    if (!supabase) {
      setError("Password reset is available after Supabase is configured.");
      return;
    }
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (resetError) setError(resetError.message);
    else setNotice("If an account exists for that email, a reset link is on its way.");
  }

  function enterPreview(roleToSet?: CampusRole) {
    const chosenRole = roleToSet || previewRole;
    window.localStorage.setItem("campus-commons-preview-role", chosenRole);
    window.location.href = "/dashboard";
  }

  const toggleRsvp = (id: string) => {
    setRsvpedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filteredClubs = selectedDomain === "ALL"
    ? campusClubs.slice(0, 4)
    : campusClubs.filter((c) => {
        if (selectedDomain === "TECH") return c.category === "TECHNOLOGY";
        if (selectedDomain === "CREATIVE") return c.category === "CREATIVE";
        if (selectedDomain === "CULTURE") return c.category === "CULTURE";
        if (selectedDomain === "COMMUNITY") return c.category === "COMMUNITY";
        return true;
      }).slice(0, 4);

  const activeRoleData = ROLES_INFO[previewRole];

  return (
    <div className="login-scroll-wrapper" ref={scrollWrapperRef}>
      {/* Scroll Progress Bar */}
      <div className="login-scroll-progress" aria-hidden="true">
        <div className="login-scroll-progress-fill" />
      </div>

      {/* Floating Glass Island Nav */}
      <nav className={`login-floating-nav ${navVisible ? "visible" : ""}`} aria-label="Quick Navigation">
        <a href="#hero" className="floating-nav-brand" onClick={(e) => { e.preventDefault(); scrollToSection("hero"); }}>
          <span className="floating-nav-mark">c</span>
          <span>Northstar University</span>
        </a>
        <div className="floating-nav-links">
          <a href="#ecosystem" className="floating-nav-link" onClick={(e) => { e.preventDefault(); scrollToSection("ecosystem"); }}>
            Ecosystem
          </a>
          <a href="#roles" className="floating-nav-link" onClick={(e) => { e.preventDefault(); scrollToSection("roles"); }}>
            Campus Roles
          </a>
          <a href="#voices" className="floating-nav-link" onClick={(e) => { e.preventDefault(); scrollToSection("voices"); }}>
            Student Voices
          </a>
        </div>
        <button className="floating-nav-cta" onClick={() => scrollToSection("hero")}>
          SIGN IN ↗
        </button>
      </nav>

      {/* Main Hero & Login Split View */}
      <main className="login-shell" id="hero" onMouseMove={handleMouseMove} suppressHydrationWarning>
        {/* Left Side: Editorial Story & Interactive Parallax */}
        <section className="login-story">
          <a className="brand login-brand" href="/" aria-label="Campus Commons">
            <img
              src="/brand-logo.png"
              alt="Campus Commons - Your Campus, In Sync"
              className="login-brand-logo"
            />
          </a>

          <div className="login-story-copy">
            <p className="eyebrow">NORTHSTAR UNIVERSITY · AUTUMN ’26</p>
            <h1>
              Your campus
              <br />
              is better <em>together.</em>
            </h1>
            <p>
              One synchronized home for your clubs, events, governance approvals, and the student projects that define university life.
            </p>

            <div className="login-highlights">
              <span title="6 Technology, 6 Creative, 6 Culture, 6 Community societies">
                <b>24</b>
                <small>active clubs</small>
              </span>
              <span title="Workshops, competitions, hackathons & rehearsals">
                <b>38</b>
                <small>things this week</small>
              </span>
              <span title="Unified university governance & student treasury">
                <b>₹2.5L</b>
                <small>council treasury</small>
              </span>
            </div>

            <a
              href="#ecosystem"
              className="scroll-down-hint"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("ecosystem");
              }}
            >
              <span>EXPLORE CAMPUS LIFE BELOW</span>
              <span className="scroll-down-arrow">↓</span>
            </a>
          </div>

          {/* Illustrated Layers with Mouse Parallax Reaction */}
          <div
            className="login-story-art"
            ref={storyArtRef}
            style={{
              transform: `translate(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px)`,
              transition: "transform 0.15s ease-out",
            }}
          >
            <span
              className="login-sun"
              style={{
                transform: `translate(${mouseOffset.x * -0.6}px, ${mouseOffset.y * -0.6}px)`,
              }}
            >
              ☼
            </span>
            <span
              className="login-flower"
              style={{
                transform: `translate(${mouseOffset.x * 0.8}px, ${mouseOffset.y * 0.8}px)`,
              }}
            >
              ❀
            </span>
            <span
              className="login-doodle"
              style={{
                transform: `translate(${mouseOffset.x * 0.5}px, ${mouseOffset.y * 0.5}px) rotate(7deg)`,
              }}
            >
              good things
              <br />
              grow here
            </span>
            <div className="login-hill" />
          </div>

          <footer>
            CAMPUS COMMONS <span>MADE FOR THE PEOPLE WHO MAKE CAMPUS.</span>
          </footer>
        </section>

        {/* Right Side: Double-Bezel Login Card & Interactive Preview */}
        <section className="login-panel">
          <div className="login-card" id="login-card">
            <div className="login-card-topline">
              <span>
                <i className="live-dot" /> NORTHSTAR UNIVERSITY
              </span>
              <small>AUTUMN ’26</small>
            </div>

            <p className="eyebrow">YOUR PEOPLE ARE HERE</p>
            <h2>{mode === "signin" ? "Welcome back." : "Find your place."}</h2>
            <p className="login-intro">
              {mode === "signin"
                ? "Sign in to see your clubs, approvals, and upcoming events."
                : "Create your verified university account and join the student body."}
            </p>

            {/* Mode Switcher Tabs */}
            <div className="login-tabs">
              <button
                type="button"
                className={mode === "signin" ? "active" : ""}
                onClick={() => {
                  setMode("signin");
                  setError("");
                  setNotice("");
                }}
              >
                SIGN IN
              </button>
              <button
                type="button"
                className={mode === "signup" ? "active" : ""}
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setNotice("");
                }}
              >
                CREATE ACCOUNT
              </button>
            </div>

            {/* Main Auth Form */}
            <form className="login-form" onSubmit={submit}>
              {mode === "signup" && (
                <label>
                  Your name
                  <input
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    required
                  />
                </label>
              )}

              <label>
                University email
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@northstar.edu"
                  required
                />
              </label>

              <label>
                Password
                <div className="password-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {mode === "signup" && password && (
                  <div className="password-strength-wrap">
                    <div className="strength-bars">
                      <span className={`strength-bar-seg ${passwordStrength.score >= 1 ? passwordStrength.colorClass : ""}`} />
                      <span className={`strength-bar-seg ${passwordStrength.score >= 2 ? passwordStrength.colorClass : ""}`} />
                      <span className={`strength-bar-seg ${passwordStrength.score >= 3 ? passwordStrength.colorClass : ""}`} />
                    </div>
                    <span className="password-strength-text">{passwordStrength.label}</span>
                  </div>
                )}
              </label>

              {mode === "signin" && (
                <button type="button" className="forgot-button" onClick={resetPassword}>
                  Forgot password?
                </button>
              )}

              <button className="login-submit" disabled={busy}>
                {busy ? "ONE MOMENT…" : mode === "signin" ? "COME ON IN ↗" : "CREATE MY ACCOUNT ↗"}
              </button>
            </form>

            {error && <p className="login-feedback error">{error}</p>}
            {notice && <p className="login-feedback success">{notice}</p>}

            {/* Interactive Role Switcher & Live Feature Preview */}
            <div className="interactive-role-preview">
              <div className="role-selector-header">
                <span className="eyebrow" style={{ margin: 0 }}>EXPLORE A CAMPUS PERSPECTIVE</span>
                <span style={{ font: "700 9px 'DM Mono', monospace", color: "#6a7366" }}>LIVE DEMO</span>
              </div>

              {/* Quick interactive role pills */}
              <div className="role-pills">
                {(["Student", "Club Leader", "Faculty", "Student Council", "Admin"] as CampusRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`role-pill-btn ${previewRole === r ? "active" : ""}`}
                    onClick={() => setPreviewRole(r)}
                  >
                    {ROLES_INFO[r].icon} {r}
                  </button>
                ))}
              </div>

              {/* Dynamic Role Preview Card */}
              <div className="role-preview-card">
                <div className="role-preview-top">
                  <b>{activeRoleData.icon} {activeRoleData.title}</b>
                  <span className="role-preview-badge">{activeRoleData.badge}</span>
                </div>
                <p className="role-preview-desc">{activeRoleData.tagline}</p>
                <div className="role-perks-list">
                  {activeRoleData.chips.map((chip) => (
                    <span key={chip} className="role-perk-chip">✓ {chip}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Standard Preview Box matching automated test bindings */}
            <div className="preview-box">
              <div className="preview-title">
                <span>✦</span>
                <div>
                  <b>Just looking around?</b>
                  <small>Explore the interactive live demo without an account.</small>
                </div>
              </div>

              <label>
                PREVIEW A ROLE
                <select
                  value={previewRole}
                  onChange={(e) => setPreviewRole(e.target.value as CampusRole)}
                >
                  <option>Student</option>
                  <option>Club Leader</option>
                  <option>Faculty</option>
                  <option>Student Council</option>
                  <option>Admin</option>
                </select>
              </label>

              <button onClick={() => enterPreview()}>EXPLORE THE DEMO ↗</button>
            </div>

            <p className="login-security">
              Production accounts use Supabase authentication. Campus authority roles are assigned by university administrators.
            </p>
          </div>
        </section>
      </main>

      {/* =========================================================================
         Scroll Section 1: The Campus Commons Ecosystem (Bento Grid)
         ========================================================================= */}
      <section className="login-ecosystem-section" id="ecosystem">
        <div className="section-header-centered">
          <p className="eyebrow">THE CAMPUS COMMONS ECOSYSTEM</p>
          <h2>Everything in sync. Across every department.</h2>
          <p>
            From 24 student societies and transparent governance to hackathons and volunteer impact — experience university life without administrative friction.
          </p>
        </div>

        <div className="login-bento-grid">
          {/* Bento Card 1: 24 Specialized Student Societies */}
          <article className="bento-card-large bento-reveal-item">
            <div className="bento-card-header">
              <div>
                <p className="eyebrow">SOCIETY CATALOG</p>
                <h3>24 Student-Led Societies</h3>
                <p>Spanning Technology, Creative Arts, Culture, and Social Impact.</p>
              </div>
              <span className="bento-icon-badge">⚡</span>
            </div>

            {/* Interactive Domain Filter Chips */}
            <div className="bento-filter-row">
              {(["ALL", "TECH", "CREATIVE", "CULTURE", "COMMUNITY"] as const).map((domain) => (
                <button
                  key={domain}
                  type="button"
                  className={`bento-filter-chip ${selectedDomain === domain ? "active" : ""}`}
                  onClick={() => setSelectedDomain(domain)}
                >
                  {domain}
                </button>
              ))}
            </div>

            <div className="bento-clubs-showcase">
              {filteredClubs.map((club) => (
                <div key={club.id} className="bento-club-item">
                  <div className="bento-club-top">
                    <span className="bento-club-icon">{club.icon}</span>
                    <span className="bento-club-cat">{club.category}</span>
                  </div>
                  <h4>{club.name}</h4>
                  <p>{club.description}</p>
                  <div className="bento-club-tags">
                    {club.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="bento-club-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Bento Card 2: Transparent Treasury & Multi-Tier Governance */}
          <article className="bento-card-small bento-reveal-item">
            <div className="bento-card-header">
              <div>
                <p className="eyebrow">GOVERNANCE & LEDGER</p>
                <h3>Transparent Treasury</h3>
                <p>₹2.5L reserve with cryptographic trail.</p>
              </div>
              <span className="bento-icon-badge">₹</span>
            </div>

            <div className="gov-steps-diagram">
              <div className="gov-step-item">
                <span className="gov-step-num">1</span>
                <div className="gov-step-copy">
                  <b>Leader Requisitions Grant</b>
                  <p>Itemized quote submitted for equipment or events.</p>
                </div>
              </div>
              <div className="gov-step-item">
                <span className="gov-step-num">2</span>
                <div className="gov-step-copy">
                  <b>Faculty Advisor Sign-Off</b>
                  <p>Academic & campus safety endorsement within 24h.</p>
                </div>
              </div>
              <div className="gov-step-item">
                <span className="gov-step-num">3</span>
                <div className="gov-step-copy">
                  <b>Council Disburses Funds</b>
                  <p>Instant transfer recorded to the public ledger.</p>
                </div>
              </div>
            </div>
          </article>

          {/* Bento Card 3: Autonomous Campus Event Radar */}
          <article className="bento-card-small bento-reveal-item">
            <div className="bento-card-header">
              <div>
                <p className="eyebrow">LIVE RADAR</p>
                <h3>Upcoming This Week</h3>
                <p>Instant RSVP with real-time guestlist check-in.</p>
              </div>
              <span className="bento-icon-badge">▦</span>
            </div>

            <div className="event-radar-list">
              {SAMPLE_EVENTS.map((ev) => (
                <div key={ev.id} className="event-radar-card">
                  <div className="event-radar-info">
                    <b>{ev.title}</b>
                    <small>{ev.club} · {ev.time}</small>
                  </div>
                  <button
                    type="button"
                    className={`event-radar-rsvp ${rsvpedEvents[ev.id] ? "attending" : ""}`}
                    onClick={() => toggleRsvp(ev.id)}
                  >
                    {rsvpedEvents[ev.id] ? "✓ ON GUESTLIST" : "RSVP ↗"}
                  </button>
                </div>
              ))}
            </div>
          </article>

          {/* Bento Card 4: Verified Student Karma & Points */}
          <article className="bento-card-large bento-reveal-item">
            <div className="bento-card-header">
              <div>
                <p className="eyebrow">VOLUNTEER ECONOMY</p>
                <h3>Student Points & Impact Ledger</h3>
                <p>Verified service hours converted into university store rewards.</p>
              </div>
              <span className="bento-icon-badge">♡</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginTop: "14px" }}>
              <div style={{ padding: "16px", borderRadius: "12px", background: "#fbfaf6", border: "1px solid #eaebe2" }}>
                <b style={{ fontSize: "28px", fontFamily: "Fraunces, serif", color: "#31513d" }}>1,420+</b>
                <small style={{ display: "block", color: "#747b70", font: "600 9px 'DM Mono', monospace", marginTop: "4px" }}>HOURS LOGGED</small>
                <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#636a5f" }}>Verified by society faculty coordinators.</p>
              </div>
              <div style={{ padding: "16px", borderRadius: "12px", background: "#fbfaf6", border: "1px solid #eaebe2" }}>
                <b style={{ fontSize: "28px", fontFamily: "Fraunces, serif", color: "#d87d5b" }}>148</b>
                <small style={{ display: "block", color: "#747b70", font: "600 9px 'DM Mono', monospace", marginTop: "4px" }}>ACTIVE PROJECTS</small>
                <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#636a5f" }}>Cross-disciplinary tech and creative builds.</p>
              </div>
              <div style={{ padding: "16px", borderRadius: "12px", background: "#fbfaf6", border: "1px solid #eaebe2" }}>
                <b style={{ fontSize: "28px", fontFamily: "Fraunces, serif", color: "#69588f" }}>100%</b>
                <small style={{ display: "block", color: "#747b70", font: "600 9px 'DM Mono', monospace", marginTop: "4px" }}>STUDENT GOVERNED</small>
                <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#636a5f" }}>Zero bureaucracy. Real authority.</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* =========================================================================
         Scroll Section 2: Choose Your Campus Role (Role Explorer Gallery)
         ========================================================================= */}
      <section className="login-roles-section" id="roles">
        <div className="section-header-centered">
          <p className="eyebrow">CHOOSE YOUR PERSPECTIVE</p>
          <h2>Experience the campus through 5 distinct lenses.</h2>
          <p>
            Whether you are a student discovering clubs or a faculty advisor mentoring projects, test-drive the dedicated workflow built for your university role.
          </p>
        </div>

        <div className="roles-grid">
          {(["Student", "Club Leader", "Faculty", "Student Council", "Admin"] as CampusRole[]).map((roleKey) => {
            const data = ROLES_INFO[roleKey];
            const iconClass = roleKey === "Student" ? "student"
              : roleKey === "Club Leader" ? "leader"
              : roleKey === "Faculty" ? "faculty"
              : roleKey === "Student Council" ? "council" : "admin";

            return (
              <div key={roleKey} className="role-showcase-card">
                <div className="role-icon-header">
                  <div className={`role-big-icon ${iconClass}`}>
                    {data.icon}
                  </div>
                  <span className="role-badge-pill">{roleKey}</span>
                </div>

                <h3>{data.title}</h3>
                <p className="role-tagline">{data.tagline}</p>

                <ul className="role-features-list">
                  {data.powers.slice(0, 3).map((power, idx) => (
                    <li key={idx}>
                      <span>✓</span> {power}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="role-launch-btn"
                  onClick={() => enterPreview(roleKey)}
                >
                  TEST DRIVE AS {roleKey.toUpperCase()} ↗
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
         Scroll Section 3: Campus Voices & Innovation Highlights
         ========================================================================= */}
      <section className="login-voices-section" id="voices">
        <div className="section-header-centered">
          <p className="eyebrow">CAMPUS VOICES</p>
          <h2>Built for the people who make university memorable.</h2>
          <p>
            Hear from society presidents, faculty coordinators, and council representatives who run Northstar University every day.
          </p>
        </div>

        <div className="voices-quotes-grid">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="voice-quote-card">
              <p className="quote-text">“{t.quote}”</p>
              <div className="quote-author-row">
                <span className="author-avatar">{t.avatar}</span>
                <div className="author-info">
                  <b>{t.name}</b>
                  <small>{t.role}</small>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hall of Fame Highlights */}
        <div className="hall-of-fame-panel">
          <p className="eyebrow">HALL OF FAME PROJECTS</p>
          <h3>Active student engineering & cultural milestones.</h3>
          <p>Real projects funded by the Student Council and built inside university laboratories.</p>

          <div className="hall-projects-grid">
            <div className="hall-project-item">
              <div className="hall-project-item-top">
                <span className="hall-badge">ROBOTICS CLUB</span>
                <span className="hall-status-pill">PROD</span>
              </div>
              <h4>Autonomous Swarm Rovers</h4>
              <p>ROS2-based distributed robotic navigation for disaster search and rescue operations.</p>
              <small style={{ font: "600 9px 'DM Mono', monospace", color: "#6a7366" }}>Funded grant: ₹45,000</small>
            </div>

            <div className="hall-project-item">
              <div className="hall-project-item-top">
                <span className="hall-badge">AEROSPACE SOCIETY</span>
                <span className="hall-status-pill">DEV</span>
              </div>
              <h4>Micro-Altitude Sounding Rocket</h4>
              <p>Dual-deployment telemetry avionics payload test flight scheduled for Spring '27.</p>
              <small style={{ font: "600 9px 'DM Mono', monospace", color: "#6a7366" }}>Funded grant: ₹48,000</small>
            </div>

            <div className="hall-project-item">
              <div className="hall-project-item-top">
                <span className="hall-badge">GREEN COLLECTIVE</span>
                <span className="hall-status-pill">SPRINT</span>
              </div>
              <h4>Solar Rooftop Hydroponics Farm</h4>
              <p>Zero-waste campus dining vegetables grown with 90% water conservation.</p>
              <small style={{ font: "600 9px 'DM Mono', monospace", color: "#6a7366" }}>Funded grant: ₹35,000</small>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
         Scroll Section 4: Grand CTA Banner
         ========================================================================= */}
      <section className="login-cta-section" id="join">
        <div className="login-cta-card">
          <div className="login-cta-content">
            <p className="eyebrow">YOUR CAMPUS IS WAITING</p>
            <h2>Ready to step in?</h2>
            <p>
              Join 3,420+ students, 24 societies, and faculty across Northstar University. Sign in with your university ID or explore the demo in seconds.
            </p>
            <div className="login-cta-buttons">
              <button
                type="button"
                className="cta-primary-btn"
                onClick={() => scrollToSection("hero")}
              >
                BACK TO SIGN IN ↑
              </button>
              <button
                type="button"
                className="cta-secondary-btn"
                onClick={() => enterPreview("Student")}
              >
                INSTANT STUDENT DEMO ↗
              </button>
            </div>
          </div>
          <div className="login-cta-decoration" aria-hidden="true">
            ✦
          </div>
        </div>
      </section>

      {/* =========================================================================
         Universal Clean Footer
         ========================================================================= */}
      <footer className="login-universal-footer">
        <div className="footer-left">
          <span>CAMPUS COMMONS · NORTHSTAR UNIVERSITY</span>
          <span className="footer-status-pill">
            <i className="live-dot" /> ALL SYSTEMS OPERATIONAL
          </span>
        </div>
        <div>
          <span>AUTUMN TERM 2026</span>
          <button
            type="button"
            className="back-to-top-btn"
            onClick={() => scrollToSection("hero")}
            style={{ marginLeft: "14px" }}
          >
            TOP ↑
          </button>
        </div>
      </footer>
    </div>
  );
}
