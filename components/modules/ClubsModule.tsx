"use client";

import { GovernanceModule } from "./GovernanceModule";
import { useState } from "react";
import { campusClubs, type CampusClub } from "../../lib/clubs";
import type { ClubWorkspace } from "../../lib/useClubWorkspace";
import type { CampusRole } from "../../lib/supabase/types";

export function ClubsModule({
  workspace: w,
  selectedClub,
  openClub,
  view,
  role,
}: {
  workspace: ClubWorkspace;
  selectedClub: string | null;
  openClub: (id: string | null) => void;
  view: "Discover clubs" | "My Clubs";
  role: CampusRole;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL CLUBS");
  const [clubTab, setClubTab] = useState<"overview" | "projects" | "events" | "announcements" | "members">("overview");

  const club = campusClubs.find((c) => c.id === selectedClub);
  const pending = w.data.memberships.filter((m) => m.user_id === w.userId && m.status === "pending");

  const visible = campusClubs.filter((c) => {
    const isJoined = w.status(c.id) === "approved";
    const matchesView = view !== "My Clubs" || isJoined;
    const matchesCategory = category === "ALL CLUBS" || c.category === category;
    const matchesSearch =
      `${c.name} ${c.shortName} ${c.description} ${c.about} ${c.tags.join(" ")} ${c.venue}`
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchesView && matchesCategory && matchesSearch;
  });

  const joinButton = (id: string) => {
    const status = w.status(id);
    if (role !== "Student") return null;
    if (status === "approved") {
      return (
        <button className="btn-action leave-btn" disabled={w.busy} onClick={() => void w.membership(id, "leave")}>
          Leave club
        </button>
      );
    }
    if (status === "pending") {
      return (
        <>
          <span className="club-status-pill pending" role="status">
            Request pending
          </span>
          <button className="btn-action cancel-btn" disabled={w.busy} onClick={() => void w.membership(id, "leave")}>
            Cancel request
          </button>
        </>
      );
    }
    return (
      <>
        {status === "rejected" && <span className="club-status-pill rejected">Request rejected — you can apply again.</span>}
        <button
          className="btn-action join-primary-btn"
          disabled={w.busy || !!w.error}
          onClick={() => void w.membership(id, "request")}
        >
          {status === "rejected" ? "Request again" : "Request to join"}
        </button>
      </>
    );
  };

  return (
    <div className="clubs-workspace">
      {w.error && (
        <div className="club-error" role="alert">
          {w.error}
          <button onClick={() => void w.refresh()}>Retry</button>
        </div>
      )}

      {w.loading ? (
        <div className="club-loading-state" role="status">
          <span className="brand-mark">✦</span>
          <p>Loading campus communities…</p>
        </div>
      ) : club ? (
        <div className="club-detail-container">
          {/* Breadcrumb & Back */}
          <div className="club-nav-bar">
            <button className="club-back" onClick={() => openClub(null)}>
              ← Back to {view}
            </button>
            <span className="club-breadcrumb">
              {view} / {club.category} / <strong>{club.name}</strong>
            </span>
          </div>

          {/* Hero Header */}
          <header className={`club-detail-header ${club.color}-theme`}>
            <div className="club-detail-icon-wrap">
              <span className="club-detail-icon" aria-hidden="true">
                {club.icon}
              </span>
              <span className="club-badge-tag">{club.badge}</span>
            </div>

            <div className="club-detail-main">
              <div className="club-eyebrow-row">
                <span className="eyebrow">
                  {club.category} · NORTHSTAR UNIVERSITY · EST. {club.established}
                </span>
              </div>
              <h1>{club.name}</h1>
              <p className="club-tagline">{club.description}</p>

              {/* Fast Stats Strip */}
              <div className="club-stats-strip">
                <div className="stat-pill">
                  <span className="stat-icon">🕒</span>
                  <div>
                    <small>SCHEDULE</small>
                    <b>{club.schedule}</b>
                  </div>
                </div>
                <div className="stat-pill">
                  <span className="stat-icon">📍</span>
                  <div>
                    <small>VENUE</small>
                    <b>{club.venue}</b>
                  </div>
                </div>
                <div className="stat-pill">
                  <span className="stat-icon">👥</span>
                  <div>
                    <small>COMMUNITY</small>
                    <b>{club.memberCount}</b>
                  </div>
                </div>
                <div className="stat-pill">
                  <span className="stat-icon">⏱️</span>
                  <div>
                    <small>COMMITMENT</small>
                    <b>{club.weeklyCommitment}</b>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="club-actions">
                {joinButton(club.id)}
                {w.status(club.id) === "approved" && (
                  <span className="club-status-pill approved">✓ Member · Full access</span>
                )}
                {w.manages(club.id) && <span className="club-status-pill admin">★ Club admin</span>}
                <button className="btn-refresh" onClick={() => void w.refresh()} disabled={w.busy}>
                  ↻ Refresh
                </button>
              </div>
            </div>
          </header>

          {/* Sub Navigation Tabs */}
          <div className="club-tab-bar">
            <button
              className={`club-tab-btn ${clubTab === "overview" ? "active" : ""}`}
              onClick={() => setClubTab("overview")}
            >
              Overview & Mission
            </button>
            <button
              className={`club-tab-btn ${clubTab === "projects" ? "active" : ""}`}
              onClick={() => setClubTab("projects")}
            >
              Projects & Highlights ({club.projects.length})
            </button>
            <button
              className={`club-tab-btn ${clubTab === "events" ? "active" : ""}`}
              onClick={() => setClubTab("events")}
            >
              Events ({w.data.events.filter((e) => e.club_id === club.id).length})
            </button>
            <button
              className={`club-tab-btn ${clubTab === "announcements" ? "active" : ""}`}
              onClick={() => setClubTab("announcements")}
            >
              Announcements ({w.data.announcements.filter((a) => a.club_id === club.id).length})
            </button>
            <button
              className={`club-tab-btn ${clubTab === "members" ? "active" : ""}`}
              onClick={() => setClubTab("members")}
            >
              Leadership & Members ({w.data.memberships.filter((m) => m.club_id === club.id && m.status === "approved").length})
            </button>
          </div>

          {/* Tab 1: Overview */}
          {clubTab === "overview" && (
            <div className="club-tab-content">
              <section className="club-panel">
                <h2>About {club.name}</h2>
                <p className="club-about-text">{club.about}</p>

                <div className="club-tags-wrap">
                  <small className="eyebrow">DOMAINS & SPECIALIZATIONS</small>
                  <div className="club-tag-pills">
                    {club.tags.map((tag) => (
                      <span key={tag} className="club-tag-pill">
                        ✦ {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <div className="club-bento-grid">
                {/* Perks Card */}
                <section className="club-panel bento-card">
                  <h2>Membership Perks</h2>
                  <div className="perks-list">
                    {club.perks.map((perk, i) => (
                      <div key={i} className="perk-row">
                        <span className="perk-check">✓</span>
                        <p>{perk}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Who Can Join & Contact */}
                <section className="club-panel bento-card">
                  <h2>Who Can Join</h2>
                  <p className="eligibility-box">{club.whoCanJoin}</p>

                  <h3 className="section-subtitle">Official Channels</h3>
                  <div className="channel-rows">
                    <div className="channel-item">
                      <span className="channel-icon">✉</span>
                      <div>
                        <small>EMAIL</small>
                        <b>{club.contact.email}</b>
                      </div>
                    </div>
                    <div className="channel-item">
                      <span className="channel-icon">⌂</span>
                      <div>
                        <small>OFFICE ROOM</small>
                        <b>{club.contact.room}</b>
                      </div>
                    </div>
                    <div className="channel-item">
                      <span className="channel-icon">💬</span>
                      <div>
                        <small>DISCORD</small>
                        <b>{club.contact.discord}</b>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* FAQs */}
              <section className="club-panel">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-grid">
                  {club.faqs.map((faq, i) => (
                    <div key={i} className="faq-card">
                      <h3>Q: {faq.q}</h3>
                      <p>{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Tab 2: Projects & Highlights */}
          {clubTab === "projects" && (
            <div className="club-tab-content">
              <section className="club-panel">
                <h2>Active Student Projects</h2>
                <div className="projects-grid">
                  {club.projects.map((proj, i) => (
                    <article key={i} className="project-card">
                      <div className="project-card-header">
                        <h3>{proj.title}</h3>
                        <span
                          className={`project-status ${
                            proj.status === "Active Sprint"
                              ? "status-sprint"
                              : proj.status === "Production"
                              ? "status-prod"
                              : "status-dev"
                          }`}
                        >
                          {proj.status}
                        </span>
                      </div>
                      <p>{proj.desc}</p>
                      <div className="project-tags">
                        {proj.tags.map((t) => (
                          <span key={t} className="project-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="club-panel">
                <h2>Hall of Fame & Key Milestones</h2>
                <div className="milestones-grid">
                  {club.achievements.map((ach, i) => (
                    <div key={i} className="milestone-card">
                      <span className="trophy-icon">🏆</span>
                      <div className="milestone-content">
                        <span className="milestone-year">{ach.year}</span>
                        <h3>{ach.title}</h3>
                        <span className="milestone-badge">{ach.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Private Notice when not a member */}
          {!w.canRead(club.id) ? (
            <section className="club-private-notice">
              <h2>Get to know {club.name}</h2>
              <p>All students are welcome to apply. A club admin reviews each request.</p>
              <p>
                Events, announcements, and the member directory unlock after your membership is approved.
              </p>
            </section>
          ) : (
            <>
              {/* Join Requests (Staff Only) */}
              {w.staff(club.id) && (
                <section className="club-panel" aria-label="Join requests">
                  <h2>Join requests</h2>
                  {w.data.memberships.filter((m) => m.club_id === club.id && m.status === "pending").length === 0 && (
                    <p>No pending requests.</p>
                  )}
                  {w.data.memberships
                    .filter((m) => m.club_id === club.id && m.status === "pending")
                    .map((m) => (
                      <div className="club-request" key={m.user_id}>
                        <span>{m.display_name}</span>
                        <div className="club-actions">
                          <button
                            disabled={w.busy}
                            onClick={() =>
                              void (w.manages(club.id)
                                ? w.membership(club.id, "approve", m.user_id)
                                : w.govern({
                                    action: "submit",
                                    club_id: club.id,
                                    kind: "membership",
                                    title: `Approve membership: ${m.display_name}`,
                                    body: "Leader recommends accepting this student. Faculty approval required.",
                                    details: { target: m.user_id, decision: "approve" },
                                  }))
                            }
                          >
                            {w.manages(club.id) ? "Approve" : "Recommend approval"}
                          </button>
                          <button
                            disabled={w.busy}
                            onClick={() =>
                              void (w.manages(club.id)
                                ? w.membership(club.id, "reject", m.user_id)
                                : w.govern({
                                    action: "submit",
                                    club_id: club.id,
                                    kind: "membership",
                                    title: `Reject membership: ${m.display_name}`,
                                    body: "Leader recommends rejecting this request. Faculty review required.",
                                    details: { target: m.user_id, decision: "reject" },
                                  }))
                            }
                          >
                            {w.manages(club.id) ? "Reject" : "Recommend rejection"}
                          </button>
                        </div>
                      </div>
                    ))}
                </section>
              )}

              {/* Tab 3: Events Region */}
              <section
                className={`club-panel ${clubTab === "events" ? "tab-active" : clubTab !== "overview" ? "tab-hidden" : ""}`}
                aria-label="Club events"
              >
                <h2>Club events</h2>
                {w.data.events.filter((e) => e.club_id === club.id).length === 0 && (
                  <p>No events scheduled yet.</p>
                )}
                {w.data.events
                  .filter((e) => e.club_id === club.id)
                  .map((event) => {
                    const attending = w.data.rsvps.some(
                      (r) => r.event_id === event.id && r.user_id === w.userId
                    );
                    const matchingClubEvent = club.eventsList?.find((e) => e.id === event.id);

                    return (
                      <article className="club-event" key={event.id}>
                        <div className="event-info">
                          <h3>{event.title}</h3>
                          <p>
                            {new Date(event.starts_at).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}{" "}
                            IST · {event.location}
                          </p>
                          {matchingClubEvent?.description && (
                            <p className="event-desc">{matchingClubEvent.description}</p>
                          )}
                          {attending && <span className="attending-badge" role="status">You're on the guest list.</span>}
                        </div>
                        {w.status(club.id) === "approved" && (
                          <button
                            className={`rsvp-btn ${attending ? "cancel" : "confirm"}`}
                            disabled={w.busy}
                            onClick={() => void w.rsvp(club.id, event.id, !attending)}
                          >
                            {attending ? "Cancel RSVP" : "RSVP"}
                          </button>
                        )}
                      </article>
                    );
                  })}
              </section>

              {/* Tab 4: Announcements Region */}
              <section
                className={`club-panel ${clubTab === "announcements" ? "tab-active" : clubTab !== "overview" ? "tab-hidden" : ""}`}
                aria-label="Club announcements"
              >
                <h2>Club announcements</h2>
                {w.data.announcements.filter((a) => a.club_id === club.id).length === 0 && (
                  <p>No announcements yet.</p>
                )}
                {w.data.announcements
                  .filter((a) => a.club_id === club.id)
                  .map((a) => (
                    <article className="club-announcement" key={a.id}>
                      <div className="announcement-header">
                        <h3>{a.title}</h3>
                      </div>
                      <p>{a.body}</p>
                    </article>
                  ))}
              </section>

              {/* Approved Activities */}
              {w.data.requests.some(
                (r) => r.club_id === club.id && r.kind === "activity" && r.status === "completed"
              ) && (
                <section className="club-panel" aria-label="Approved club activities">
                  <h2>Approved activities & tasks</h2>
                  {w.data.requests
                    .filter((r) => r.club_id === club.id && r.kind === "activity" && r.status === "completed")
                    .map((r) => (
                      <article key={r.id}>
                        <h3>{r.title}</h3>
                        <p>{r.body}</p>
                      </article>
                    ))}
                </section>
              )}

              {/* Tab 5: Leadership & Members Region */}
              <section
                className={`club-panel ${clubTab === "members" ? "tab-active" : clubTab !== "overview" ? "tab-hidden" : ""}`}
                aria-label="Club members"
              >
                <h2>Leadership & Members</h2>

                {/* Leadership Spotlight Cards */}
                <div className="leadership-grid">
                  <div className="leadership-card advisor">
                    <span className="leadership-role-pill">FACULTY ADVISOR</span>
                    <h3>{club.leadership.facultyAdvisor.name}</h3>
                    <p className="advisor-title">{club.leadership.facultyAdvisor.title}</p>
                    <small>{club.leadership.facultyAdvisor.department}</small>
                  </div>

                  <div className="leadership-card president">
                    <span className="leadership-role-pill">STUDENT PRESIDENT</span>
                    <h3>{club.leadership.president.name}</h3>
                    <p className="student-major">
                      {club.leadership.president.major} · {club.leadership.president.year}
                    </p>
                    <small>{club.leadership.president.role}</small>
                  </div>

                  {club.leadership.vicePresident && (
                    <div className="leadership-card vice-pres">
                      <span className="leadership-role-pill">VICE PRESIDENT</span>
                      <h3>{club.leadership.vicePresident.name}</h3>
                      <p className="student-major">
                        {club.leadership.vicePresident.major} · {club.leadership.vicePresident.year}
                      </p>
                      <small>{club.leadership.vicePresident.role}</small>
                    </div>
                  )}
                </div>

                <h3 className="section-subtitle mt-6">Student Member Directory</h3>
                {w.data.memberships.filter((m) => m.club_id === club.id && m.status === "approved").length === 0 && (
                  <p>No approved student members yet.</p>
                )}
                <ul className="members-directory-list">
                  {w.data.memberships
                    .filter((m) => m.club_id === club.id && m.status === "approved")
                    .map((m) => (
                      <li key={m.user_id} className="member-list-item">
                        <span className="member-avatar">
                          {m.display_name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="member-info">
                          <b>{m.display_name}{m.user_id === w.userId ? " (you)" : ""}</b>
                          <small>Approved Member</small>
                        </div>
                      </li>
                    ))}
                </ul>
              </section>

              {w.staff(club.id) && <GovernanceModule key={club.id} workspace={w} clubId={club.id} />}
            </>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* Directory / Card Grid View */
        /* ========================================================================= */
        <>
          <div className="page-heading">
            <div>
              <p className="eyebrow">FIND YOUR PEOPLE · 24 STUDENT SOCIETIES</p>
              <h1>{view === "My Clubs" ? "My Clubs" : "Discover clubs"}</h1>
              <p className="welcome-copy">
                {view === "My Clubs"
                  ? "Your memberships, events, and people in one place."
                  : "Explore 24 active communities across Technology, Culture, Creative, and Community."}
              </p>
            </div>
            <div className="heading-sticker">
              CAMPUS
              <br />
              COMMONS <span>✦</span>
            </div>
          </div>

          <div className="filter-bar">
            <div className="searchbox">
              <span>⌕</span>
              <input
                aria-label="Search clubs"
                placeholder="Search clubs by name, skills, or venue…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-chips">
              {["ALL CLUBS", "TECHNOLOGY", "CULTURE", "CREATIVE", "COMMUNITY"].map((cat) => (
                <button
                  key={cat}
                  className={category === cat ? "active" : ""}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {view === "My Clubs" && pending.length > 0 && (
            <section className="club-panel pending-summary-panel">
              <h2>Pending requests ({pending.length})</h2>
              <div className="pending-chips">
                {pending.map((m) => (
                  <button key={m.club_id} className="pending-chip-btn" onClick={() => openClub(m.club_id)}>
                    {campusClubs.find((c) => c.id === m.club_id)?.name} · Pending <span>↗</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="club-grid">
            {visible.map((c, index) => (
              <article className="club-card" key={c.id}>
                <div className={`club-cover ${c.color || ["mint", "lilac", "yellow", "pink"][index % 4]}`}>
                  <span className="club-symbol">{c.icon}</span>
                  <span className="club-cat">{c.category}</span>
                  <span className="club-card-badge">{c.badge}</span>
                </div>

                <div className="club-card-body">
                  <div className="club-name-row">
                    <h2>{c.name}</h2>
                    <span className="member-count">{c.memberCount}</span>
                  </div>

                  <p>{c.description}</p>

                  {/* Domain Tag Pills */}
                  <div className="club-card-tags">
                    {c.tags.slice(0, 3).map((t) => (
                      <span key={t} className="card-tag-item">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Schedule strip */}
                  <div className="club-next">
                    <span>MEETS</span>
                    <b>{c.schedule.split("·")[0]} · {c.venue.split(",")[0]}</b>
                  </div>

                  <p className="club-status">
                    {w.status(c.id) === "approved"
                      ? "✓ Member"
                      : w.status(c.id) === "pending"
                      ? "⏳ Request pending"
                      : w.status(c.id) === "rejected"
                      ? "✕ Request rejected"
                      : "Open for applications"}
                    {w.manages(c.id) ? " · Club admin" : ""}
                  </p>

                  <button className="join-button" onClick={() => openClub(c.id)}>
                    Open {c.name} <span>↗</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {visible.length === 0 && (
            <div className="empty-state">
              <span>✦</span>
              <h2>{view === "My Clubs" ? "No joined clubs yet." : "No clubs match your search."}</h2>
              <p>
                {view === "My Clubs"
                  ? "Explore Discover clubs and send a join request. Approved clubs appear here."
                  : "Try another search keyword or switch categories above."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
