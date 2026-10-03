"use client";

import React from "react";
import type { CampusRole, ModalState, Section } from "../../lib/supabase/types";

interface CouncilModuleProps {
  setSection: (s: Section) => void;
  setModal: (m: ModalState) => void;
  councilIdeas: Array<{
    title: string;
    cat: string;
    meta: string;
    votes: number;
    supported: boolean;
    color: string;
    icon: string;
  }>;
  supportCouncilIdea: (i: number) => void;
  role?: CampusRole;
  cycleIdeaStatus?: (i: number) => void;
}

export function CouncilModule({
  setSection,
  setModal,
  councilIdeas,
  supportCouncilIdea,
  role = "Student",
  cycleIdeaStatus,
}: CouncilModuleProps) {
  const isCouncil = role === "Student Council";
  const isAdminOrFaculty = role === "Admin" || role === "Faculty";
  const isExecutive = isCouncil || isAdminOrFaculty;

  return (
    <>
      <div className="page-heading council-heading">
        <div>
          <p className="eyebrow">
            {isCouncil
              ? "STUDENT COUNCIL · EXECUTIVE CHAMBER"
              : isAdminOrFaculty
              ? "COUNCIL ADVISORY & SENATE LIAISON"
              : "LISTEN, LEARN, LEAD"}
          </p>
          <h1>
            {isCouncil ? (
              <>
                Campus Initiatives &amp;
                <br />
                <em>Senate Deliberations.</em>
              </>
            ) : (
              <>
                A better campus
                <br />
                is something <em>we make.</em>
              </>
            )}
          </h1>
          <p className="welcome-copy">
            {isCouncil
              ? "Your official workspace to advance student petitions, deliberate on campus policies, and manage resolutions."
              : isAdminOrFaculty
              ? "Faculty and administration oversight of Student Council initiatives, budgets, and campus policies."
              : "Your student council is here to help good ideas find their way forward."}
          </p>
        </div>
        <div className="council-seal">
          <span>✦</span>
          <small>
            STUDENT
            <br />
            COUNCIL
            <br />
            2026—27
          </small>
        </div>
      </div>

      <div className="council-banner">
        <div>
          <p className="eyebrow">
            {isCouncil ? "COUNCIL EXECUTIVE DIRECTIVE" : "A NOTE FROM YOUR COUNCIL"}
          </p>
          <h2>
            {isCouncil
              ? "“Turning student petitions into funded, real-world campus actions.”"
              : "“The best ideas start by making space to listen.”"}
          </h2>
          <p>— Ananya Rao, Student President</p>
        </div>
        <span>✦</span>
        <button
          onClick={() => {
            setSection("Announcements");
          }}
        >
          {isCouncil ? "BROADCAST COUNCIL UPDATE ↗" : "READ THE LATEST NOTE ↗"}
        </button>
      </div>

      <div className="council-grid">
        <div className="panel listening-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                {isExecutive ? "SENATE INITIATIVES & STUDENT PETITIONS" : "YOUR VOICE BELONGS HERE"}
              </p>
              <h2>{isExecutive ? "Campus Proposals Pipeline" : "On the campus mind."}</h2>
            </div>
            <button className="text-link" onClick={() => setModal({ type: "share_idea" })}>
              {isExecutive ? "+ Sponsor New Proposal" : "Share an idea ↗"}
            </button>
          </div>
          {councilIdeas.map((it, i) => (
            <article className="voice-row" key={it.title}>
              <span className={`voice-icon ${it.color}`}>{it.icon}</span>
              <div style={{ flex: 1 }}>
                <small>{it.cat}</small>
                <h3>{it.title}</h3>
                <p>
                  {it.votes} student supporters ·{" "}
                  {isExecutive ? (
                    <span
                      style={{
                        cursor: cycleIdeaStatus ? "pointer" : "default",
                        textDecoration: cycleIdeaStatus ? "underline" : "none",
                        fontWeight: 600,
                      }}
                      onClick={() => cycleIdeaStatus && cycleIdeaStatus(i)}
                      title={cycleIdeaStatus ? "Click to advance status" : undefined}
                    >
                      Status: {it.meta} {cycleIdeaStatus ? "✎" : ""}
                    </span>
                  ) : (
                    it.meta
                  )}
                </p>
              </div>
              <button
                style={{
                  color: it.supported ? "#3e7153" : undefined,
                  background: it.supported ? "#e9f0e6" : undefined,
                }}
                onClick={() => supportCouncilIdea(i)}
                title="Support this proposal"
              >
                ♡ {it.votes}
              </button>
            </article>
          ))}
        </div>
        <aside className="council-side">
          <div className="panel election-panel">
            <p className="eyebrow">MAKE YOUR MARK</p>
            <div className="election-icon">◎</div>
            <h3>
              Student elections
              <br />
              are around the corner.
            </h3>
            <p>Meet the candidates, read their ideas and make your voice count.</p>
            <div className="election-date">
              <span>NOMINATIONS OPEN</span>
              <b>Oct 26 <i>·</i> In 14 days</b>
            </div>
            <button onClick={() => setModal({ type: "election_rules" })}>HOW ELECTIONS WORK ↗</button>
          </div>
          <div className="council-roles">
            <span>{isCouncil ? "YOUR EXECUTIVE BOARD" : "YOUR COUNCIL"}</span>
            <div>
              <i>AR</i> Ananya Rao <small>President</small>
            </div>
            <div>
              <i>VS</i> Vikram Shah <small>Budget &amp; Treasury</small>
            </div>
            <div>
              <i>NK</i> Nisha Kapoor <small>Events &amp; Life</small>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
