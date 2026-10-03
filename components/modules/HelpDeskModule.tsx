"use client";

import React from "react";
import { ModulePage } from "../ui/ModulePage";
import type { IssueItem, Section } from "../../lib/supabase/types";

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
}: HelpDeskModuleProps) {
  return (
    <ModulePage
      eyebrow="A BETTER CAMPUS STARTS WITH LISTENING"
      title={
        <>
          Something on
          <br />
          <em>your mind?</em>
        </>
      }
      subtitle="Share a problem or idea. Follow it from first note to resolution."
    >
      <form
        className="issue-form"
        onSubmit={(e) => {
          e.preventDefault();
          submitInline("Help desk");
        }}
      >
        <div>
          <label>WHAT’S HAPPENING?</label>
          <input
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            placeholder="Tell us what could be better…"
            required
          />
        </div>
        <div>
          <label>TOPIC</label>
          <select value={formExtra} onChange={(e) => setFormExtra(e.target.value)}>
            <option value="">Choose a topic</option>
            <option>Academic</option>
            <option>Infrastructure</option>
            <option>Hostel</option>
            <option>Club or event</option>
            <option>Suggestion</option>
          </select>
        </div>
        <button type="submit">SEND TO THE COUNCIL ↗</button>
      </form>
      <div className="panel issue-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">YOUR CAMPUS, IN PROGRESS</p>
            <h2>Issues & ideas</h2>
          </div>
        </div>
        {issues.map((issue, index) => (
          <article className="issue-row" key={`${issue.title}-${index}`}>
            <span className="issue-ticket">{issue.id || `CC-${String(2401 + index)}`}</span>
            <div>
              <small>{issue.category}</small>
              <h3>{issue.title}</h3>
              <p>Assigned to Student Council · Follow progress here</p>
            </div>
            {canModerateIssues ? (
              <button
                className="status-badge"
                onClick={() => cycleIssueStatus(index)}
                title="Click to cycle status"
              >
                {issue.status} ✎
              </button>
            ) : (
              <span className="issue-status">{issue.status}</span>
            )}
            <button onClick={() => upvoteIssue(index)}>♡ {issue.votes}</button>
            {canModerateIssues && (
              <button
                className="delete-row"
                onClick={() => deleteIssue(index)}
                title="Remove issue"
              >
                ×
              </button>
            )}
          </article>
        ))}
      </div>
    </ModulePage>
  );
}
