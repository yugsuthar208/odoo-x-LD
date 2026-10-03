"use client";

import React from "react";
import type { CampusRole, EventItem, MembershipItem, Section } from "../../lib/supabase/types";

export const roleCopy: Record<
  CampusRole,
  { eyebrow: string; title: React.ReactNode; description: string; stats: [string, string, string][] }
> = {
  Student: {
    eyebrow: "YOUR CAMPUS, YOUR MOMENT",
    title: <>A campus full of<br /><em>possibility.</em></>,
    description: "Here’s what’s happening around you and the people making it happen.",
    stats: [
      ["04", "Events on your calendar", "Find your next thing"],
      ["08 hrs", "Time given to your campus", "See your impact"],
      ["120 pts", "Community points earned", "View your badges"],
    ],
  },
  "Club Leader": {
    eyebrow: "YOUR CLUBS, IN MOTION",
    title: <>Make good ideas<br /><em>move together.</em></>,
    description: "Your teams, events and club operations in one working view.",
    stats: [
      ["03", "Events you’re running", "Manage events"],
      ["12", "Open team tasks", "Open task board"],
      ["₹ 2.4L", "Club funds available", "Review finance"],
    ],
  },
  Faculty: {
    eyebrow: "FACULTY OVERSIGHT",
    title: <>Support the people<br /><em>who make campus.</em></>,
    description: "Review club activity, approve requests and keep student work moving safely.",
    stats: [
      ["08", "Clubs under guidance", "View clubs"],
      ["06", "Requests to review", "Review requests"],
      ["12", "Events this month", "View calendar"],
    ],
  },
  "Student Council": {
    eyebrow: "COUNCIL WORKSPACE",
    title: <>Listen closely.<br /><em>Lead clearly.</em></>,
    description: "Your campus signals, budgets and open decisions in one place.",
    stats: [
      ["23", "Open student issues", "Open help desk"],
      ["₹ 2.4L", "Campus balance", "Review finance"],
      ["04", "Council actions due", "Open task board"],
    ],
  },
  Admin: {
    eyebrow: "CAMPUS OPERATIONS",
    title: <>The whole campus,<br /><em>working as one.</em></>,
    description: "Manage access, records and the health of the Campus Commons workspace.",
    stats: [
      ["128", "Active campus members", "Manage access"],
      ["42", "Shared records today", "Review activity"],
      ["05", "Roles requiring review", "Open administration"],
    ],
  },
};

interface OverviewModuleProps {
  role: CampusRole;
  displayName: string;
  totalVolunteerHours: number;
  totalPoints: number;
  setSection: (s: Section) => void;
  events: EventItem[];
  handleTicketClick: (e: EventItem) => void;
  memberships: MembershipItem[];
  commitments: string[];
  notify: (msg: string) => void;
}

export function OverviewModule({
  role,
  displayName,
  totalVolunteerHours,
  totalPoints,
  setSection,
  events,
  handleTicketClick,
  memberships,
  commitments,
  notify,
}: OverviewModuleProps) {
  return (
    <>
      <section className="welcome-row">
        <div>
          <p className="eyebrow">
            {roleCopy[role].eyebrow} <span className="eyebrow-spark">✳</span>
          </p>
          <h1>{roleCopy[role].title}</h1>
          <p className="welcome-copy">
            {displayName.split(" ")[0]}, {roleCopy[role].description}
          </p>
        </div>
        <div className="welcome-art">
          <div className="sun-doodle">☼</div>
          <div className="art-note">
            a good day
            <br />
            to get involved
          </div>
          <div className="art-plant">♧</div>
          <div className="art-ground" />
          <div className="art-sticker">
            YOU
            <br />
            BELONG
            <br />
            HERE <span>✳</span>
          </div>
        </div>
      </section>
      <section className="quick-stats">
        {roleCopy[role].stats.map(([value, label, action], index) => (
          <article key={label}>
            <div className="stat-top">
              <span
                className={`stat-icon ${
                  index === 0 ? "lilac-bg" : index === 1 ? "yellow-bg" : "mint-bg"
                }`}
              >
                {index === 0 ? "✳" : index === 1 ? "▦" : "♡"}
              </span>
              <span className="stat-trend">{role === "Student" ? "↗ new" : "LIVE"}</span>
            </div>
            <strong>
              {index === 1 && role === "Student"
                ? `${totalVolunteerHours} hrs`
                : index === 2 && role === "Student"
                ? `${totalPoints} pts`
                : value}
            </strong>
            <p>{label}</p>
            <button
              onClick={() =>
                setSection(
                  role === "Student" && index === 0
                    ? "Events"
                    : role === "Student" && index === 1
                    ? "Volunteers"
                    : role === "Student" && index === 2
                    ? "Achievements"
                    : role === "Admin" && index === 0
                    ? "Administration"
                    : role === "Club Leader" && index === 2
                    ? "Finance"
                    : role === "Student Council" && index === 0
                    ? "Help desk"
                    : role === "Faculty" && index === 0
                    ? "Discover clubs"
                    : "Overview"
                )
              }
            >
              {action} <span>↗</span>
            </button>
          </article>
        ))}
      </section>
      <section className="dashboard-grid">
        <div className="panel events-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">MADE FOR YOUR CALENDAR</p>
              <h2>
                Coming up <span>✳</span>
              </h2>
            </div>
            <button className="text-link" onClick={() => setSection("Events")}>
              All events <span>↗</span>
            </button>
          </div>
          <div className="event-list">
            {events.slice(0, 2).map((event) => (
              <article className="event-row" key={event.title}>
                <div className={`event-date ${event.color}`}>
                  <b>{event.date}</b>
                  <small>{event.month}</small>
                </div>
                <div className="event-detail">
                  <span className="event-type">
                    {event.type} <i>·</i> {event.club}
                  </span>
                  <h3>{event.title}</h3>
                  <p>
                    {event.time} <i>·</i> {event.place}
                  </p>
                </div>
                <button
                  className="round-arrow"
                  onClick={() => handleTicketClick(event)}
                  aria-label={`Get a ticket for ${event.title}`}
                >
                  ↗
                </button>
              </article>
            ))}
          </div>
          <button className="all-events" onClick={() => setSection("Events")}>
            A little more of what’s on <span>→</span>
          </button>
        </div>
        <div className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">YOUR CAMPUS, LATELY</p>
              <h2>Small things add up.</h2>
            </div>
            <button
              className="more-button"
              onClick={() => notify("Your activity timeline is synchronized.")}
            >
              ···
            </button>
          </div>
          <div className="activity-feed">
            <div className="feed-item">
              <span className="feed-icon lilac-bg">✳</span>
              <p>
                <b>You found your people.</b>
                <br />
                {memberships[0]?.club
                  ? `Joined ${memberships[0].club}.`
                  : "Joined Design Society."}
                <small>2 days ago <i>·</i> CLUBS</small>
              </p>
            </div>
            <div className="feed-item">
              <span className="feed-icon mint-bg">♡</span>
              <p>
                <b>Hands-on, heart-on.</b>
                <br />
                {commitments.length
                  ? `Volunteering for ${commitments[0]}.`
                  : "Volunteered at welcome fair."}
                <small>Active <i>·</i> VOLUNTEERING</small>
              </p>
            </div>
            <div className="feed-item">
              <span className="feed-icon yellow-bg">✹</span>
              <p>
                <b>You showed up.</b>
                <br />
                Earned the “First Steps” badge.
                <small>{totalPoints} pts <i>·</i> MILESTONES</small>
              </p>
            </div>
          </div>
          <button
            className="activity-link"
            onClick={() => setSection("Achievements")}
          >
            Your whole story <span>↗</span>
          </button>
        </div>
      </section>
      <section className="bottom-banner">
        <span className="banner-flower">✿</span>
        <div>
          <p className="eyebrow">A LITTLE CAMPUS MAGIC</p>
          <h3>
            The best campus memories
            <br />
            usually start with “why not?”
          </h3>
        </div>
        <button onClick={() => setSection("Discover clubs")}>
          Find your people <span>↗</span>
        </button>
        <span className="banner-doodle">✎</span>
      </section>
    </>
  );
}
