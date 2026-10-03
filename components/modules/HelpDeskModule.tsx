"use client";

import React, { useState, useMemo } from "react";
import { ModulePage } from "../ui/ModulePage";
import type { CampusRole, IssueItem, Section } from "../../lib/supabase/types";

interface HelpDeskModuleProps {
  formText: string;
  setFormText: (s: string) => void;
  formExtra: string;
  setFormExtra: (s: string) => void;
  submitInline: (k: Section) => void;
  issues: IssueItem[];
  canModerateIssues: boolean;
  cycleIssueStatus: (index: number) => void;
  upvoteIssue: (index: number) => void;
  deleteIssue: (index: number) => void;
  role?: CampusRole;
  displayName?: string;
}

export function HelpDeskModule({
  formText,
  setFormText,
  formExtra,
  setFormExtra,
  submitInline,
  issues,
  canModerateIssues,
  cycleIssueStatus,
  upvoteIssue,
  deleteIssue,
  role = "Student",
  displayName = "Campus member",
}: HelpDeskModuleProps) {
  const isCouncil = role === "Student Council";
  const isAdminOrFaculty = role === "Admin" || role === "Faculty";
  const isManager = isCouncil || isAdminOrFaculty;

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [studentTab, setStudentTab] = useState<"ALL" | "MINE">("ALL");

  const openCount = useMemo(() => issues.filter((i) => i.status === "Open").length, [issues]);
  const inReviewCount = useMemo(() => issues.filter((i) => i.status === "In review").length, [issues]);
  const assignedCount = useMemo(() => issues.filter((i) => i.status === "Assigned").length, [issues]);
  const resolvedCount = useMemo(() => issues.filter((i) => i.status === "Resolved").length, [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (isManager) {
        if (statusFilter === "ALL") return true;
        return issue.status.toLowerCase() === statusFilter.toLowerCase();
      }
      if (studentTab === "MINE") {
        return issue.submittedBy === displayName || (issue.id && issue.id.includes("MINE"));
      }
      return true;
    });
  }, [issues, isManager, statusFilter, studentTab, displayName]);

  const eyebrowText = isCouncil
    ? "STUDENT COUNCIL · GRIEVANCE RESOLUTION DESK"
    : isAdminOrFaculty
    ? "CAMPUS OMBUDSPERSON & TICKET TRIAGE"
    : role === "Club Leader"
    ? "CLUB OPERATIONS · GRIEVANCE & SUPPORT"
    : "A BETTER CAMPUS STARTS WITH LISTENING";

  const titleNode = isManager ? (
    <>
      Grievance Triage &amp;
      <br />
      <em>Council Resolutions.</em>
    </>
  ) : (
    <>
      Something on
      <br />
      <em>your mind?</em>
    </>
  );

  const subtitleText = isCouncil
    ? "Review incoming student tickets, update investigation status, assign committee leads, and publish resolutions."
    : isAdminOrFaculty
    ? "Institutional oversight for student grievances, campus facility tickets, and academic inquiries."
    : "Share a problem or idea with the Student Council. Follow it from first note to resolution.";

  const submitButtonText = isCouncil
    ? "LOG COUNCIL TICKET ↗"
    : isAdminOrFaculty
    ? "RECORD OFFICIAL TICKET ↗"
    : "SEND TO THE COUNCIL ↗";

  return (
    <ModulePage eyebrow={eyebrowText} title={titleNode} subtitle={subtitleText}>
      {/* Triage Dashboard for Council / Faculty / Admin */}
      {isManager && (
        <div className="impact-strip" style={{ marginBottom: 16 }}>
          <div>
            <span className="impact-icon yellow-bg">⌕</span>
            <p>
              <b>{openCount} Open</b>
              <small>Awaiting Council Review</small>
            </p>
          </div>
          <div>
            <span className="impact-icon lilac-bg">⚙</span>
            <p>
              <b>{inReviewCount} In Review</b>
              <small>Committee Deliberation</small>
            </p>
          </div>
          <div>
            <span className="impact-icon mint-bg">⇄</span>
            <p>
              <b>{assignedCount} Assigned</b>
              <small>Action In Progress</small>
            </p>
          </div>
          <div className="impact-progress">
            <span>COUNCIL RESOLUTION RATE</span>
            <b>
              {resolvedCount} of {issues.length} Resolved{" "}
              <small>({issues.length ? Math.round((resolvedCount / issues.length) * 100) : 100}%)</small>
            </b>
            <div>
              <i
                style={{
                  width: `${issues.length ? (resolvedCount / issues.length) * 100 : 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Ticket Creation Form */}
      <form
        className="issue-form"
        onSubmit={(e) => {
          e.preventDefault();
          submitInline("Help desk");
        }}
      >
        <div>
          <label>
            {isManager ? "LOG OFFICIAL GRIEVANCE / PETITION ON BEHALF OF CAMPUS" : "WHAT’S HAPPENING?"}
          </label>
          <input
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            placeholder={
              isCouncil
                ? "Document walk-in grievance, senate petition, or campus maintenance note…"
                : isAdminOrFaculty
                ? "Record administrative or student affairs ticket…"
                : "Tell us what could be better…"
            }
            required
          />
        </div>
        <div>
          <label>TOPIC / COMMITTEE</label>
          <select value={formExtra} onChange={(e) => setFormExtra(e.target.value)}>
            <option value="">Choose a topic</option>
            <option>Academic</option>
            <option>Infrastructure</option>
            <option>Hostel</option>
            <option>Club or event</option>
            <option>Suggestion</option>
            <option>Student Welfare</option>
          </select>
        </div>
        <button type="submit">{submitButtonText}</button>
      </form>

      {/* Triage / Filter Bar */}
      <div className="panel issue-panel">
        <div className="panel-heading" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <p className="eyebrow">
              {isManager ? "LIVE TRIAGE BOARD" : "YOUR CAMPUS, IN PROGRESS"}
            </p>
            <h2>{isManager ? "Student Submissions & Action Items" : "Issues & ideas"}</h2>
          </div>

          {/* Council & Admin Status Filter Chips */}
          {isManager ? (
            <div className="filter-chips" style={{ margin: 0 }}>
              {["ALL", "Open", "In review", "Assigned", "Resolved"].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={statusFilter.toUpperCase() === st.toUpperCase() ? "active" : ""}
                  onClick={() => setStatusFilter(st)}
                  style={{ fontSize: 10, padding: "5px 10px" }}
                >
                  {st.toUpperCase()}{" "}
                  {st === "ALL"
                    ? `(${issues.length})`
                    : st === "Open"
                    ? `(${openCount})`
                    : st === "In review"
                    ? `(${inReviewCount})`
                    : st === "Assigned"
                    ? `(${assignedCount})`
                    : `(${resolvedCount})`}
                </button>
              ))}
            </div>
          ) : (
            <div className="filter-chips" style={{ margin: 0 }}>
              <button
                type="button"
                className={studentTab === "ALL" ? "active" : ""}
                onClick={() => setStudentTab("ALL")}
                style={{ fontSize: 10, padding: "5px 10px" }}
              >
                ALL CAMPUS ISSUES ({issues.length})
              </button>
              <button
                type="button"
                className={studentTab === "MINE" ? "active" : ""}
                onClick={() => setStudentTab("MINE")}
                style={{ fontSize: 10, padding: "5px 10px" }}
              >
                MY TICKETS
              </button>
            </div>
          )}
        </div>

        {/* Issue Rows */}
        {filteredIssues.map((issue) => {
          const index = issues.findIndex((it) => it.title === issue.title && it.id === issue.id);
          const actualIndex = index !== -1 ? index : 0;
          return (
            <article className="issue-row" key={`${issue.title}-${issue.id || actualIndex}`}>
              <span className="issue-ticket">{issue.id || `CC-${String(2401 + actualIndex)}`}</span>
              <div style={{ flex: 1 }}>
                <small>{issue.category}</small>
                <h3>{issue.title}</h3>
                <p>
                  {isCouncil
                    ? "Assigned to: Student Council Executive Committee · Tap status to advance"
                    : isAdminOrFaculty
                    ? "Jurisdiction: Campus Administration & Student Council"
                    : "Assigned to Student Council · Follow progress here"}
                </p>
              </div>

              {canModerateIssues ? (
                <button
                  className="status-badge"
                  onClick={() => cycleIssueStatus(actualIndex)}
                  title="Click to cycle status (Open ➔ In review ➔ Assigned ➔ Resolved)"
                  style={{
                    cursor: "pointer",
                    background:
                      issue.status === "Resolved"
                        ? "#e6f4ea"
                        : issue.status === "In review"
                        ? "#e8f0fe"
                        : issue.status === "Assigned"
                        ? "#f3e8fd"
                        : "#fef7e0",
                    color:
                      issue.status === "Resolved"
                        ? "#137333"
                        : issue.status === "In review"
                        ? "#1a73e8"
                        : issue.status === "Assigned"
                        ? "#7627bb"
                        : "#b06000",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  {issue.status} ✎
                </button>
              ) : (
                <span
                  className="issue-status"
                  style={{
                    background:
                      issue.status === "Resolved"
                        ? "#e6f4ea"
                        : issue.status === "In review"
                        ? "#e8f0fe"
                        : issue.status === "Assigned"
                        ? "#f3e8fd"
                        : "#fef7e0",
                    color:
                      issue.status === "Resolved"
                        ? "#137333"
                        : issue.status === "In review"
                        ? "#1a73e8"
                        : issue.status === "Assigned"
                        ? "#7627bb"
                        : "#b06000",
                  }}
                >
                  {issue.status}
                </span>
              )}

              <button
                type="button"
                onClick={() => upvoteIssue(actualIndex)}
                title="Student support votes"
              >
                ♡ {issue.votes}
              </button>

              {canModerateIssues && (
                <button
                  type="button"
                  className="delete-row"
                  onClick={() => deleteIssue(actualIndex)}
                  title="Archive / Remove ticket"
                >
                  ×
                </button>
              )}
            </article>
          );
        })}

        {filteredIssues.length === 0 && (
          <div className="empty-state" style={{ padding: "32px 16px" }}>
            <span>✦</span>
            <h3>No tickets found in this view.</h3>
            <p>
              {isManager
                ? "All tickets in this category have been triaged or resolved."
                : "You haven't submitted any tickets in this tab yet."}
            </p>
          </div>
        )}
      </div>
    </ModulePage>
  );
}
