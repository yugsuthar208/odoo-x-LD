"use client";

import React from "react";
import type { VolunteerOpportunity } from "../../lib/supabase/types";

interface VolunteersModuleProps {
  totalVolunteerHours: number;
  totalPoints: number;
  volunteerTab: string;
  setVolunteerTab: (tab: string) => void;
  volunteerOpportunities: VolunteerOpportunity[];
  commitments: string[];
  handleVolunteerApply: (opp: VolunteerOpportunity) => void;
}

export function VolunteersModule({
  totalVolunteerHours,
  totalPoints,
  volunteerTab,
  setVolunteerTab,
  volunteerOpportunities,
  commitments,
  handleVolunteerApply,
}: VolunteersModuleProps) {
  return (
    <>
      <div className="page-heading volunteer-heading">
        <div>
          <p className="eyebrow">SHOW UP, MAKE A DIFFERENCE</p>
          <h1>
            Little acts.
            <br />
            <em>Lasting ripples.</em>
          </h1>
          <p className="welcome-copy">Find a way to pitch in that feels like you.</p>
        </div>
        <div className="volunteer-art">
          <span>♡</span>
          <small>
            GOOD THINGS
            <br />
            ARE GROWING
          </small>
        </div>
      </div>
      <div className="impact-strip">
        <div>
          <span className="impact-icon mint-bg">♡</span>
          <p>
            <b>{totalVolunteerHours} hours</b>
            <small>given this term</small>
          </p>
        </div>
        <div>
          <span className="impact-icon lilac-bg">✦</span>
          <p>
            <b>{totalPoints} points</b>
            <small>earned by showing up</small>
          </p>
        </div>
        <div>
          <span className="impact-icon yellow-bg">✹</span>
          <p>
            <b>First Steps</b>
            <small>your latest badge</small>
          </p>
        </div>
        <div className="impact-progress">
          <span>YOUR NEXT MILESTONE</span>
          <b>
            Community Builder <small>{Math.min(200, totalPoints)} / 200 pts</small>
          </b>
          <div>
            <i style={{ width: `${Math.min(100, (totalPoints / 200) * 100)}%` }} />
          </div>
        </div>
      </div>
      <div className="section-tabs">
        <button
          className={volunteerTab === "Opportunities" ? "active" : ""}
          onClick={() => setVolunteerTab("Opportunities")}
        >
          Opportunities<span>{String(volunteerOpportunities.length).padStart(2, "0")}</span>
        </button>
        <button
          className={volunteerTab === "My commitments" ? "active" : ""}
          onClick={() => setVolunteerTab("My commitments")}
        >
          My commitments<span>{String(commitments.length + 2).padStart(2, "0")}</span>
        </button>
      </div>
      <div className="volunteer-list">
        {volunteerTab === "Opportunities" ? (
          volunteerOpportunities.map((item) => (
            <article className="vol-row" key={item.title}>
              <span className={`vol-symbol ${item.color}`}>{item.icon}</span>
              <div className="vol-copy">
                <small>{item.org.toUpperCase()}</small>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
              <span className="spots">{item.need}</span>
              <button className="round-arrow" onClick={() => handleVolunteerApply(item)}>
                {commitments.includes(item.title) ? "✓" : "↗"}
              </button>
            </article>
          ))
        ) : (
          <>
            {commitments.map((title) => (
              <article className="vol-row" key={title}>
                <span className="vol-symbol mint">♡</span>
                <div className="vol-copy">
                  <small>CAMPUS VOLUNTEERING</small>
                  <h3>{title}</h3>
                  <p>Status: Registered · Volunteer hour credits active</p>
                </div>
                <span className="spots">CONFIRMED ✓</span>
                <button className="round-arrow">✓</button>
              </article>
            ))}
            <article className="vol-row">
              <span className="vol-symbol mint">♡</span>
              <div className="vol-copy">
                <small>STUDENT COUNCIL</small>
                <h3>Welcome fair crew</h3>
                <p>Friday, Oct 9 · 8:30 AM · 3 hours</p>
              </div>
              <span className="spots">CONFIRMED</span>
              <button className="round-arrow">✓</button>
            </article>
            <article className="vol-row">
              <span className="vol-symbol lilac">✦</span>
              <div className="vol-copy">
                <small>DESIGN SOCIETY</small>
                <h3>Design for good workshop</h3>
                <p>Tuesday, Oct 20 · 4:00 PM · 2 hours</p>
              </div>
              <span className="spots">CONFIRMED</span>
              <button className="round-arrow">✓</button>
            </article>
          </>
        )}
      </div>
    </>
  );
}
