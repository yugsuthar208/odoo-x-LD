"use client";

import React from "react";
import { ModulePage } from "../ui/ModulePage";

interface ElectionsModuleProps {
  tickets: string[];
  setTickets: React.Dispatch<React.SetStateAction<string[]>>;
  recordActivity: (kind: string, payload: Record<string, unknown>) => Promise<void>;
  notify: (msg: string) => void;
}

export function ElectionsModule({
  tickets,
  setTickets,
  recordActivity,
  notify,
}: ElectionsModuleProps) {
  return (
    <ModulePage
      eyebrow="YOUR VOTE, YOUR CAMPUS"
      title={
        <>
          Choose the people
          <br />
          who <em>show up.</em>
        </>
      }
      subtitle="Read candidate ideas and cast one demo vote for each position."
    >
      <div className="election-notice">
        <span>✳</span>
        <div>
          <b>Student Council Election · 2026</b>
          <p>Demo votes are stored on this device.</p>
        </div>
        <span className="election-open">VOTING OPEN</span>
      </div>
      <div className="candidate-grid">
        {[
          {
            name: "Ananya Rao",
            position: "STUDENT PRESIDENT",
            manifesto:
              "A campus where every student can find their people, and every good idea gets a fair hearing.",
            initials: "AR",
            color: "mint",
          },
          {
            name: "Vikram Shah",
            position: "BUDGET MANAGER",
            manifesto:
              "Clear club budgets, transparent decisions and more support for student-led projects.",
            initials: "VS",
            color: "lilac",
          },
          {
            name: "Nisha Kapoor",
            position: "EVENT MANAGER",
            manifesto:
              "More shared campus moments, better access and room for every community to celebrate.",
            initials: "NK",
            color: "pink",
          },
        ].map((candidate) => {
          const hasVoted = tickets.includes(`VOTE:${candidate.position}`);
          return (
            <article className="candidate-card" key={candidate.position}>
              <span className={`candidate-avatar ${candidate.color}`}>{candidate.initials}</span>
              <small>{candidate.position}</small>
              <h3>{candidate.name}</h3>
              <p>{candidate.manifesto}</p>
              <button
                disabled={hasVoted}
                onClick={() => {
                  setTickets((cur) => [...cur, `VOTE:${candidate.position}`]);
                  void recordActivity("vote", { position: candidate.position });
                  notify(`Your vote for ${candidate.position.toLowerCase()} was recorded.`);
                }}
              >
                {hasVoted ? "✓ VOTE RECORDED" : "VOTE FOR THIS CANDIDATE ↗"}
              </button>
            </article>
          );
        })}
      </div>
      <p className="demo-boundary">
        Demo election only. Identity verification, anonymous ballot storage and independent audit logs need a secure server.
      </p>
    </ModulePage>
  );
}
