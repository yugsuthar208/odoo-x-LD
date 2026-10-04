"use client";

import { useState } from "react";
import { campusClubs } from "../../lib/clubs";
import { canReview, money, requestStatusLabels, type ClubRequest, type RequestKind } from "../../lib/governance";
import type { ClubWorkspace } from "../../lib/useClubWorkspace";

export function GovernanceModule({ workspace: w, mode = "approvals", clubId }: { workspace: ClubWorkspace; mode?: "finance" | "approvals"; clubId?: string }) {
  const role = w.actor.role;
  const global = role === "Admin" || role === "Student Council";
  const allowedClubs = campusClubs.filter((c) => global || role === "Club Leader" || role === "Faculty" || w.staff(c.id));
  const [selected, setSelected] = useState(clubId || (mode === "approvals" || global ? "all" : allowedClubs[0]?.id || ""));
  const candidate = clubId || selected;
  const filter = candidate === "all" || allowedClubs.some((c) => c.id === candidate) || global && candidate === "council" ? candidate : allowedClubs[0]?.id || "";
  const [kind, setKind] = useState<RequestKind>(mode === "finance" ? "funding" : "event");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [receipt, setReceipt] = useState("");
  const [receiptAmount, setReceiptAmount] = useState("");
  const [staffUser, setStaffUser] = useState("");
  const [feedback, setFeedback] = useState("");
  const [inboxOnly, setInboxOnly] = useState(false);
  const paused = w.loading || w.busy;
  const financial = kind === "funding" || kind === "expense";
  const requests = w.data.requests.filter((r) => (["all", "council"].includes(filter) || r.club_id === filter) && (global || role === "Club Leader" || role === "Faculty" || w.staff(r.club_id)) && (role !== "Student Council" || r.kind === "funding") && (!inboxOnly || canReview(w.actor, r) || role === "Student Council" && r.status === "approved_funding"));
  const ledger = w.data.ledger.filter((e) => filter === "all" ? global || allowedClubs.some((c) => c.id === e.account_id) : e.account_id === filter);
  const account = filter === "all" && !global ? { balance: w.data.accounts.filter((a) => allowedClubs.some((c) => c.id === a.id)).reduce((sum, a) => sum + a.balance, 0) } : w.data.accounts.find((a) => a.id === (filter === "all" ? "council" : filter));
  const expenses = ledger.filter((e) => e.kind === "expense").reduce((sum, e) => sum - e.amount, 0);
  const allocated = ledger.filter((e) => e.kind === "funding_in").reduce((sum, e) => sum + e.amount, 0);
  const paise = (value: string) => /^\d+(\.\d{1,2})?$/.test(value) ? Math.round(Number(value) * 100) : NaN;
  const label = (id: string) => id === "council" ? "Student Council treasury" : campusClubs.find((c) => c.id === id)?.name || id;

  if (role === "Student") return <div className="empty-state">Club finance and approvals are available to assigned club staff.</div>;
  return <div className="clubs-workspace governance-workspace">
    <div className="page-heading"><div><p className="eyebrow">{role.toUpperCase()} · {clubId ? label(clubId).toUpperCase() : "CAMPUS GOVERNANCE"}</p><h1>{mode === "finance" ? "Every club. A clear ledger." : "Requests & approvals"}</h1><p className="welcome-copy">Club Leader → Faculty → Admin authorization → Student Council funding.</p></div></div>
    {role === "Faculty" ? (
      <div className="faculty-authority-banner">
        <span className="authority-icon">⚖</span>
        <div>
          <strong>Faculty Supervisory Role · Single Permission Authority</strong>
          <p>Faculty Advisors review club proposals and give permission on student requests. Faculty cannot create or edit club requests.</p>
        </div>
      </div>
    ) : role === "Club Leader" ? (
      <div className="leader-authority-banner">
        <span className="authority-icon">★</span>
        <div>
          <strong>Club Leader Workspace · All Clubs Access</strong>
          <p>Submit and manage requests & approvals across all student clubs. Requests advance to faculty advisors for permission.</p>
        </div>
      </div>
    ) : role === "Admin" ? (
      <div className="admin-authority-banner">
        <span className="authority-icon">🏛️</span>
        <div>
          <strong>Campus Administration · Oversight & Authorization</strong>
          <p>Authorize funding requests, assign club authorities, and oversee financial ledgers. Club proposals and requests are submitted by Club Leaders.</p>
        </div>
      </div>
    ) : (
      <p className="governance-explainer">Faculty supervises club operations. Admin is the final authority. Only Student Council releases authorized funding. Club spending requires faculty approval and sufficient club funds.</p>
    )}
    {w.error && <div role="alert" className="club-error">{w.error}</div>}
    {!global && !w.loading && allowedClubs.length === 0 && <p>No club is assigned to your account. Admin can assign your club from Finance.</p>}
    {feedback && <p role="status" className="club-status">{feedback}</p>}
    <div className="club-actions">
      {!clubId && <label>Club / account <select aria-label="Club / account" value={filter} onChange={(e) => { setSelected(e.target.value); setFeedback(""); }}><option value="all">{global || role === "Club Leader" ? "All clubs · Council treasury" : "All assigned clubs"}</option>{(global || role === "Club Leader") && <option value="council">Student Council treasury</option>}{allowedClubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
      <button disabled={paused} onClick={() => void w.refresh()}>Refresh requests</button>
    </div>
    {w.loading ? <p role="status">Loading approvals and balances…</p> : <>
      <div className="finance-summary">
        <article className="balance-card">
          <p className="eyebrow">{filter === "all" && !global ? "All assigned clubs" : label(filter === "all" ? "council" : filter)}</p>
          <span className="balance-label">Available balance</span>
          <strong data-testid="account-balance">{money(account?.balance || 0)}</strong>
          {role === "Club Leader" && filter !== "all" && filter !== "council" && (
            <div className="finance-card-actions">
              <button
                type="button"
                className="btn-request-money-action"
                onClick={() => { setKind("funding"); document.getElementById("request-form-heading")?.scrollIntoView({ behavior: "smooth" }); }}
              >
                💰 Request Money
              </button>
              <button
                type="button"
                className="btn-spend-money-action"
                onClick={() => { setKind("expense"); document.getElementById("request-form-heading")?.scrollIntoView({ behavior: "smooth" }); }}
              >
                💳 Spend Money
              </button>
            </div>
          )}
        </article>
        <article className="finance-stat"><small>FUNDING RECEIVED{filter === "all" ? " · ALL CLUBS" : ""}</small><b>{money(allocated)}</b><span>Transfers released by Student Council</span></article>
        <article className="finance-stat"><small>APPROVED EXPENSES{filter === "all" ? " · ALL CLUBS" : ""}</small><b>{money(expenses)}</b><span>Debited only from the selected club</span></article>
      </div>
      {filter === "all" && <section className="club-panel"><h2>Club balances</h2><div className="club-balance-grid">{allowedClubs.map((c) => <button key={c.id} onClick={() => setSelected(c.id)}><span>{c.name}</span><b>{money(w.data.accounts.find((a) => a.id === c.id)?.balance || 0)}</b></button>)}</div></section>}
      {role === "Student Council" && (filter === "all" || filter === "council") && <section className="club-panel"><h2>Record treasury receipt</h2><p>Record money actually received by Student Council, using its receipt or bank reference.</p><form className="governance-form" onSubmit={async (e) => { e.preventDefault(); if (await w.govern({ action: "deposit", amount: paise(receiptAmount), title: receipt })) { setReceipt(""); setReceiptAmount(""); setFeedback("Treasury receipt recorded."); } }}><label>Receipt reference<input required maxLength={160} value={receipt} onChange={(e) => setReceipt(e.target.value)} /></label><label>Receipt amount (₹)<input type="number" min="0.01" step="0.01" max="1000000000" required value={receiptAmount} onChange={(e) => setReceiptAmount(e.target.value)} /></label><button disabled={paused}>Record receipt</button></form></section>}
      {role === "Admin" && campusClubs.some((c) => c.id === filter) && <section className="club-panel"><h2>Club authority assignments</h2><p>Assign Faculty to supervise this club and Club Leaders to submit proposals.</p><div className="club-actions"><select aria-label="Staff profile" value={staffUser} onChange={(e) => setStaffUser(e.target.value)}><option value="">Choose faculty or club leader</option>{w.data.staffProfiles.map((p) => <option key={p.id} value={p.id}>{p.full_name} · {p.role}</option>)}</select><button disabled={paused || !staffUser} onClick={() => void w.assignStaff(filter, staffUser, true)}>Assign to club</button></div>{w.data.assignments.filter((a) => a.club_id === filter).map((a) => <div className="club-actions" key={a.user_id}><span>{w.data.staffProfiles.find((p) => p.id === a.user_id)?.full_name || a.user_id} · {a.role}</span><button disabled={paused} onClick={() => void w.assignStaff(filter, a.user_id, false)}>Remove assignment</button></div>)}</section>}
      {role === "Club Leader" && allowedClubs.some((c) => c.id === filter) && <section className="club-panel" id="request-panel"><h2 id="request-form-heading">Submit a club request</h2>
        <div className="request-kind-selector" role="tablist" aria-label="Request type options">
          <button type="button" className={`kind-pill ${kind === "funding" ? "active" : ""}`} onClick={() => setKind("funding")}>💰 Request Money (Funding)</button>
          <button type="button" className={`kind-pill ${kind === "expense" ? "active" : ""}`} onClick={() => setKind("expense")}>💳 Spend Club Money (Expense)</button>
          <button type="button" className={`kind-pill ${kind === "event" ? "active" : ""}`} onClick={() => setKind("event")}>📅 Club Event</button>
          <button type="button" className={`kind-pill ${kind === "announcement" ? "active" : ""}`} onClick={() => setKind("announcement")}>📢 Announcement</button>
          <button type="button" className={`kind-pill ${kind === "activity" ? "active" : ""}`} onClick={() => setKind("activity")}>📋 Activity / Task</button>
        </div>
        {kind === "funding" && (
          <div className="money-request-workflow-card">
            <span className="workflow-eyebrow">💰 MULTI-TIER FUNDING LIFECYCLE</span>
            <div className="workflow-steps-strip">
              <div className="wf-step-item current"><b>1. Club Leader</b><small>Submits request</small></div>
              <span className="wf-connector">→</span>
              <div className="wf-step-item"><b>2. Faculty Advisor</b><small>Grants permission</small></div>
              <span className="wf-connector">→</span>
              <div className="wf-step-item"><b>3. Campus Admin</b><small>Authorizes budget</small></div>
              <span className="wf-connector">→</span>
              <div className="wf-step-item"><b>4. Student Council</b><small>Releases funds</small></div>
            </div>
          </div>
        )}
        {kind === "expense" && (
          <div className="money-request-workflow-card expense-variant">
            <span className="workflow-eyebrow">💳 SPEND CLUB MONEY LIFECYCLE</span>
            <div className="workflow-steps-strip">
              <div className="wf-step-item current"><b>1. Club Leader</b><small>Submits expense</small></div>
              <span className="wf-connector">→</span>
              <div className="wf-step-item"><b>2. Faculty Advisor</b><small>Grants permission</small></div>
              <span className="wf-connector">→</span>
              <div className="wf-step-item"><b>3. Debit Account</b><small>Funds deducted immediately</small></div>
            </div>
          </div>
        )}
        <form className="governance-form" onSubmit={async (e) => { e.preventDefault(); if (await w.govern({ action: "submit", club_id: filter, kind, title, body, amount: financial ? paise(amount) : 0, details: kind === "event" ? { starts_at: date ? new Date(date).toISOString() : "", location } : {} })) { setTitle(""); setBody(""); setAmount(""); setFeedback(kind === "funding" ? `Money request submitted! Next: Awaiting Faculty Advisor permission.` : kind === "expense" ? `Expense request submitted! Next: Awaiting Faculty Advisor permission.` : `Request sent to your club Faculty for review. Track progress below.`); } }}>
        <label>Request type<select aria-label="Request type" value={kind} onChange={(e) => setKind(e.target.value as RequestKind)}><option value="funding">💰 Request Money (Funding from Student Council)</option><option value="expense">💳 Spend Club Money (Club expense)</option><option value="event">📅 Club event</option><option value="announcement">📢 Club announcement</option><option value="activity">📋 Club activity / task / volunteer drive</option></select></label>
        <label>Request title<input required maxLength={160} placeholder={kind === "funding" ? "e.g. Lab equipment and sensor kits grant" : kind === "expense" ? "e.g. Breadboard components invoice" : "Title of proposal..."} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label>Purpose and details<textarea required maxLength={5000} placeholder={kind === "funding" ? "Explain itemized budget breakdown, student impact, and purpose..." : "Details of this proposal..."} value={body} onChange={(e) => setBody(e.target.value)} /></label>
        {financial && <label>Amount (₹)<input required type="number" min="0.01" step="0.01" max="1000000000" placeholder="e.g. 5000" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>}
        {kind === "event" && <><label>Event date and time<input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} /></label><label>Event venue<input required maxLength={200} value={location} onChange={(e) => setLocation(e.target.value)} /></label></>}
        <button disabled={paused}>{kind === "funding" ? "💰 Submit Money Request" : kind === "expense" ? "💳 Submit Expense Request" : "Submit request"}</button>
      </form></section>}
      <section className="club-panel" aria-label="Approval requests"><div className="club-actions"><h2>{role === "Student Council" ? "Funding requests" : "Requests"} ({requests.length})</h2>{!clubId && filter !== "all" && <button onClick={() => setSelected("all")}>Show all requests</button>}<label><input type="checkbox" checked={inboxOnly} onChange={(e) => setInboxOnly(e.target.checked)} /> Awaiting my action only</label></div>
        {requests.length === 0 && <p>No requests in this view.</p>}
        {requests.map((r) => <RequestCard key={r.id} request={r} workspace={w} clubName={label(r.club_id)} />)}
      </section>
      <section className="club-panel" aria-label="Account ledger"><h2>{filter === "all" ? "All account entries" : `${label(filter)} ledger`}</h2><p>Each funding transfer has a Council debit and a club credit. Expenses have one club debit.</p><div className="governance-table"><table><thead><tr><th>Date</th><th>Account</th><th>Description</th><th>Type</th><th>Amount</th></tr></thead><tbody>{ledger.map((entry) => <tr key={entry.id}><td>{new Date(entry.created_at).toLocaleDateString("en-IN")}</td><td>{label(entry.account_id)}</td><td>{entry.description}</td><td>{entry.kind.replaceAll("_", " ")}</td><td>{money(entry.amount)}</td></tr>)}</tbody></table></div>{ledger.length === 0 && <p>No transactions for this account yet.</p>}</section>
    </>}
  </div>;
}

function RequestCard({ request: r, workspace: w, clubName }: { request: ClubRequest; workspace: ClubWorkspace; clubName: string }) {
  const [note, setNote] = useState("");
  const review = canReview(w.actor, r);
  const release = w.actor.role === "Student Council" && r.status === "approved_funding";
  const cancel = (r.created_by === w.userId || w.actor.role === "Admin") && ["pending_faculty", "pending_admin", "approved_funding"].includes(r.status);
  return <article className="governance-request" aria-label={r.title}><div><p className="eyebrow">{clubName} · {r.kind}</p><h3>{r.title}</h3><strong className="club-status">{requestStatusLabels[r.status]}</strong>{r.amount > 0 && <b className="request-amount">{money(r.amount)}</b>}<p>{r.body}</p><p className="request-recipient">{r.status === "pending_faculty" ? `Next authority: Faculty for ${clubName} (Admin may review)` : r.status === "pending_admin" ? "Next authority: Admin — authorize funding" : r.status === "approved_funding" ? "Next authority: Student Council — release funding" : `Workflow ${r.status}`}</p><small>Requested by {r.creator_name}</small></div>
    {(review || release || cancel) && <div className="request-review"><label>Review note / endorsement reason<textarea maxLength={1000} placeholder={w.actor.role === "Faculty" ? "Optional endorsement note for granting permission..." : "Review note or rejection reason..."} value={note} onChange={(e) => setNote(e.target.value)} /></label><div className="club-actions">
      {review && <><button disabled={w.busy} className="btn-approve-permission" aria-label={r.status === "pending_admin" ? "Authorize funding" : "Approve request"} onClick={() => void w.govern({ action: "approve", request_id: r.id, note: note || (w.actor.role === "Faculty" ? "Permission granted by Faculty Advisor." : "") })}>{r.status === "pending_admin" ? "Authorize funding" : w.actor.role === "Faculty" ? "✓ Give permission · Approve request" : "Approve request"}</button><button disabled={w.busy || !note.trim()} onClick={() => void w.govern({ action: "reject", request_id: r.id, note })}>Reject request</button></>}
      {release && <button disabled={w.busy} onClick={() => void w.govern({ action: "release", request_id: r.id, note })}>Release funding</button>}
      {cancel && <button disabled={w.busy} onClick={() => void w.govern({ action: "cancel", request_id: r.id, note })}>Cancel request</button>}
    </div></div>}
    <details><summary>Approval history ({r.history.length})</summary><ol>{r.history.map((entry, index) => <li key={index}><b>{entry.action}</b> · {entry.actor} ({entry.role}) · {new Date(entry.at).toLocaleString("en-IN")}{entry.note && <p>{entry.note}</p>}</li>)}</ol></details>
  </article>;
}
