"use client";

import { GovernanceModule } from "./GovernanceModule";
import { useState } from "react";
import { campusClubs } from "../../lib/clubs";
import type { ClubWorkspace } from "../../lib/useClubWorkspace";
import type { CampusRole } from "../../lib/supabase/types";

export function ClubsModule({ workspace: w, selectedClub, openClub, view, role }: {
  workspace: ClubWorkspace; selectedClub: string | null; openClub: (id: string | null) => void;
  view: "Discover clubs" | "My Clubs"; role: CampusRole;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL CLUBS");
  const club = campusClubs.find((c) => c.id === selectedClub);
  const pending = w.data.memberships.filter((m) => m.user_id === w.userId && m.status === "pending");
  const visible = campusClubs.filter((c) => (view !== "My Clubs" || w.status(c.id) === "approved") && (category === "ALL CLUBS" || c.category === category) && `${c.name} ${c.description}`.toLowerCase().includes(search.toLowerCase()));

  const joinButton = (id: string) => {
    const status = w.status(id);
    if (role !== "Student") return null;
    if (status === "approved") return <button disabled={w.busy} onClick={() => void w.membership(id, "leave")}>Leave club</button>;
    if (status === "pending") return <><span className="club-status" role="status">Request pending</span><button disabled={w.busy} onClick={() => void w.membership(id, "leave")}>Cancel request</button></>;
    return <>{status === "rejected" && <span className="club-status">Request rejected — you can apply again.</span>}<button disabled={w.busy || !!w.error} onClick={() => void w.membership(id, "request")}>{status === "rejected" ? "Request again" : "Request to join"}</button></>;
  };

  return <div className="clubs-workspace">
    {w.error && <div className="club-error" role="alert">{w.error}<button onClick={() => void w.refresh()}>Retry</button></div>}
    {w.loading ? <p role="status">Loading clubs…</p> : club ? <>
      <button className="club-back" onClick={() => openClub(null)}>← Back to {view}</button>
      <div className="club-detail-header">
        <span className="club-detail-icon" aria-hidden="true">{club.icon}</span>
        <div><p className="eyebrow">{club.category} · NORTHSTAR UNIVERSITY</p><h1>{club.name}</h1><p>{club.description}</p></div>
      </div>
      <div className="club-actions">{joinButton(club.id)}{w.status(club.id) === "approved" && <span className="club-status">Member · Full access</span>}{w.manages(club.id) && <span className="club-status">Club admin</span>}<button onClick={() => void w.refresh()} disabled={w.busy}>Refresh club</button></div>
      {!w.canRead(club.id) ? <section className="club-private-notice"><h2>Get to know {club.name}</h2><p>All students are welcome to apply. A club admin reviews each request.</p><p>Events, announcements, and the member directory unlock after your membership is approved.</p></section> : <>
        {w.staff(club.id) && <section className="club-panel" aria-label="Join requests">
          <h2>Join requests</h2>
          {w.data.memberships.filter((m) => m.club_id === club.id && m.status === "pending").length === 0 && <p>No pending requests.</p>}
          {w.data.memberships.filter((m) => m.club_id === club.id && m.status === "pending").map((m) => <div className="club-request" key={m.user_id}>
            <span>{m.display_name}</span><div className="club-actions"><button disabled={w.busy} onClick={() => void (w.manages(club.id) ? w.membership(club.id, "approve", m.user_id) : w.govern({ action: "submit", club_id: club.id, kind: "membership", title: `Approve membership: ${m.display_name}`, body: "Leader recommends accepting this student. Faculty approval required.", details: { target: m.user_id, decision: "approve" } }))}>{w.manages(club.id) ? "Approve" : "Recommend approval"}</button><button disabled={w.busy} onClick={() => void (w.manages(club.id) ? w.membership(club.id, "reject", m.user_id) : w.govern({ action: "submit", club_id: club.id, kind: "membership", title: `Reject membership: ${m.display_name}`, body: "Leader recommends rejecting this request. Faculty review required.", details: { target: m.user_id, decision: "reject" } }))}>{w.manages(club.id) ? "Reject" : "Recommend rejection"}</button></div>
          </div>)}
        </section>}
        <section className="club-panel" aria-label="Club events"><h2>Events</h2>
          {w.data.events.filter((e) => e.club_id === club.id).length === 0 && <p>No events scheduled yet.</p>}
          {w.data.events.filter((e) => e.club_id === club.id).map((event) => {
            const attending = w.data.rsvps.some((r) => r.event_id === event.id && r.user_id === w.userId);
            return <article className="club-event" key={event.id}><div><h3>{event.title}</h3><p>{new Date(event.starts_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST · {event.location}</p>{attending && <span role="status">You're on the guest list.</span>}</div>
              {w.status(club.id) === "approved" && <button disabled={w.busy} onClick={() => void w.rsvp(club.id, event.id, !attending)}>{attending ? "Cancel RSVP" : "RSVP"}</button>}
            </article>;
          })}
        </section>
        <section className="club-panel" aria-label="Club announcements"><h2>Announcements</h2>
          {w.data.announcements.filter((a) => a.club_id === club.id).length === 0 && <p>No announcements yet.</p>}
          {w.data.announcements.filter((a) => a.club_id === club.id).map((a) => <article className="club-announcement" key={a.id}><h3>{a.title}</h3><p>{a.body}</p></article>)}
        </section>
        {w.data.requests.some((r) => r.club_id === club.id && r.kind === "activity" && r.status === "completed") && <section className="club-panel" aria-label="Approved club activities"><h2>Approved activities & tasks</h2>{w.data.requests.filter((r) => r.club_id === club.id && r.kind === "activity" && r.status === "completed").map((r) => <article key={r.id}><h3>{r.title}</h3><p>{r.body}</p></article>)}</section>}
        {w.staff(club.id) && <GovernanceModule key={club.id} workspace={w} clubId={club.id} />}
        <section className="club-panel" aria-label="Club members"><h2>Members</h2>
          {w.data.memberships.filter((m) => m.club_id === club.id && m.status === "approved").length === 0 && <p>No approved student members yet.</p>}
          <ul>{w.data.memberships.filter((m) => m.club_id === club.id && m.status === "approved").map((m) => <li key={m.user_id}>{m.display_name}{m.user_id === w.userId ? " (you)" : ""}</li>)}</ul>
        </section>
      </>}
    </> : <>
      <div className="page-heading"><div><p className="eyebrow">FIND YOUR PEOPLE</p><h1>{view === "My Clubs" ? "My Clubs" : "Discover clubs"}</h1><p className="welcome-copy">{view === "My Clubs" ? "Your memberships, events, and people in one place." : "Ten communities. Find the one that feels like you."}</p></div></div>
      <div className="filter-bar"><div className="searchbox"><input aria-label="Search clubs" placeholder="Search clubs…" value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="filter-chips">{["ALL CLUBS", "TECHNOLOGY", "CULTURE", "CREATIVE", "COMMUNITY"].map((cat) => <button key={cat} className={category === cat ? "active" : ""} onClick={() => setCategory(cat)}>{cat}</button>)}</div></div>
      {view === "My Clubs" && pending.length > 0 && <section className="club-panel"><h2>Pending requests</h2>{pending.map((m) => <button key={m.club_id} onClick={() => openClub(m.club_id)}>{campusClubs.find((c) => c.id === m.club_id)?.name} · Pending</button>)}</section>}
      <div className="club-grid">{visible.map((c, index) => <article className="club-card" key={c.id}>
        <div className={`club-cover ${["mint", "lilac", "yellow", "pink"][index % 4]}`}><span className="club-symbol">{c.icon}</span><span className="club-cat">{c.category}</span></div>
        <div className="club-card-body"><h2>{c.name}</h2><p>{c.description}</p><p className="club-status">{w.status(c.id) === "approved" ? "Member" : w.status(c.id) === "pending" ? "Request pending" : w.status(c.id) === "rejected" ? "Request rejected" : "Open for applications"}{w.manages(c.id) ? " · Club admin" : ""}</p><button className="join-button" onClick={() => openClub(c.id)}>Open {c.name} <span>↗</span></button></div>
      </article>)}</div>
      {visible.length === 0 && <div className="empty-state"><h2>{view === "My Clubs" ? "No joined clubs yet." : "No clubs match your search."}</h2><p>{view === "My Clubs" ? "Explore Discover clubs and send a join request. Approved clubs appear here." : "Try another search or category."}</p></div>}
    </>}
  </div>;
}
