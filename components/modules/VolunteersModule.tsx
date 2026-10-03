"use client";

import React, { useState } from "react";
import type { CampusRole, VolunteerOpportunity } from "../../lib/supabase/types";

interface VolunteersModuleProps {
  totalVolunteerHours: number;
  totalPoints: number;
  volunteerTab: string;
  setVolunteerTab: (tab: string) => void;
  volunteerOpportunities: VolunteerOpportunity[];
  commitments: string[];
  handleVolunteerApply: (opp: VolunteerOpportunity) => void;
  role?: CampusRole;
  onPostOpportunity?: (opp: VolunteerOpportunity) => void;
}

export function VolunteersModule({
  totalVolunteerHours,
  totalPoints,
  volunteerTab,
  setVolunteerTab,
  volunteerOpportunities,
  commitments,
  handleVolunteerApply,
  role = "Student",
  onPostOpportunity,
}: VolunteersModuleProps) {
  const isOrganizer = role === "Club Leader" || role === "Student Council" || role === "Admin";
  const [showPostForm, setShowPostForm] = useState(false);
  const [oppTitle, setOppTitle] = useState("");
  const [oppOrg, setOppOrg] = useState(
    role === "Student Council" ? "Student Council" : "Design Society"
  );
  const [oppDetail, setOppDetail] = useState("Saturday · 10:00 AM · 2 hours");
  const [oppSpots, setOppSpots] = useState(5);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppTitle.trim()) return;
    const newOpp: VolunteerOpportunity = {
      icon: role === "Student Council" ? "✦" : "♧",
      title: oppTitle.trim(),
      org: oppOrg,
      detail: oppDetail,
      need: `${oppSpots} SPOTS LEFT`,
      color: role === "Student Council" ? "lilac" : "mint",
      spots: Number(oppSpots),
    };
    if (onPostOpportunity) {
      onPostOpportunity(newOpp);
    }
    setOppTitle("");
    setShowPostForm(false);
  };

  return (
    <>
      <div className="page-heading volunteer-heading">
        <div>
          <p className="eyebrow">
            {isOrganizer
              ? "COMMUNITY CORPS · DRIVE & ROSTER MANAGEMENT"
              : "SHOW UP, MAKE A DIFFERENCE"}
          </p>
          <h1>
            Little acts.
            <br />
            <em>Lasting ripples.</em>
          </h1>
          <p className="welcome-copy">
            {isOrganizer
              ? "Mobilize student volunteers for campus events, social drives, and club operations."
              : "Find a way to pitch in that feels like you."}
          </p>
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
            <small>{isOrganizer ? "Mobilized this term" : "Given this term"}</small>
          </p>
        </div>
        <div>
          <span className="impact-icon lilac-bg">✦</span>
          <p>
            <b>{totalPoints} points</b>
            <small>{isOrganizer ? "Awarded to crew" : "Earned by showing up"}</small>
          </p>
        </div>
        <div>
          <span className="impact-icon yellow-bg">✹</span>
          <p>
            <b>{commitments.length + 3} Volunteers</b>
            <small>Active on campus</small>
          </p>
        </div>
        <div className="impact-progress">
          <span>CAMPUS VOLUNTEER QUOTA</span>
          <b>
            Community Impact <small>{Math.min(200, totalPoints)} / 200 pts</small>
          </b>
          <div>
            <i style={{ width: `${Math.min(100, (totalPoints / 200) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Organizer Call-to-Action to Post Opportunity */}
      {isOrganizer && (
        <div
          style={{
            margin: "12px 0 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
            Active volunteer drives managed by your organization
          </span>
          <button
            type="button"
            className="primary-button"
            onClick={() => setShowPostForm(!showPostForm)}
            style={{ fontSize: 11, padding: "7px 14px" }}
          >
            {showPostForm ? "Close Form ×" : "+ Post Volunteer Call"}
          </button>
        </div>
      )}

      {showPostForm && (
        <form
          className="inline-create"
          onSubmit={handleCreate}
          style={{ marginBottom: 18, background: "#f9faf7", padding: 14, borderRadius: 8 }}
        >
          <input
            type="text"
            value={oppTitle}
            onChange={(e) => setOppTitle(e.target.value)}
            placeholder="Volunteer role title (e.g. Stage Setup Crew, Registration Desk)…"
            required
            style={{ flex: 2 }}
          />
          <input
            type="text"
            value={oppOrg}
            onChange={(e) => setOppOrg(e.target.value)}
            placeholder="Host Organization"
            style={{ flex: 1 }}
          />
          <input
            type="text"
            value={oppDetail}
            onChange={(e) => setOppDetail(e.target.value)}
            placeholder="Schedule (e.g. Sunday · 2 hours)"
            style={{ flex: 1 }}
          />
          <input
            type="number"
            value={oppSpots}
            onChange={(e) => setOppSpots(Number(e.target.value))}
            placeholder="Spots"
            style={{ maxWidth: 75 }}
          />
          <button type="submit">PUBLISH CALL +</button>
        </form>
      )}

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
          {isOrganizer ? "Volunteer Roster" : "My commitments"}
          <span>{String(commitments.length + 2).padStart(2, "0")}</span>
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
              <button
                className="round-arrow"
                onClick={() => handleVolunteerApply(item)}
                title="Volunteer sign-up"
              >
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
                  <small>{isOrganizer ? "ENROLLED VOLUNTEER" : "CAMPUS VOLUNTEERING"}</small>
                  <h3>{title}</h3>
                  <p>
                    {isOrganizer
                      ? "Assigned to event logistics · Attendance confirmed"
                      : "Status: Registered · Volunteer hour credits active"}
                  </p>
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
