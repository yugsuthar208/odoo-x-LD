"use client";

import React from "react";
import { ModulePage } from "../ui/ModulePage";
import type { MembershipItem, ModalState, ProductItem } from "../../lib/supabase/types";

interface AchievementsModuleProps {
  displayName: string;
  memberships: MembershipItem[];
  totalPoints: number;
  totalVolunteerHours: number;
  tickets: string[];
  products: ProductItem[];
  leaderboard: string;
  setLeaderboard: (l: string) => void;
  setModal: (m: ModalState) => void;
  notify: (msg: string) => void;
}

export function AchievementsModule({
  displayName,
  memberships,
  totalPoints,
  totalVolunteerHours,
  tickets,
  products,
  leaderboard,
  setLeaderboard,
  setModal,
  notify,
}: AchievementsModuleProps) {
  return (
    <ModulePage
      eyebrow="THE THINGS YOU’VE SHOWN UP FOR"
      title={
        <>
          Your campus story
          <br />
          <em>keeps growing.</em>
        </>
      }
      subtitle="Verified activity becomes points, badges and a profile that feels like you."
    >
      <div className="achievement-profile">
        <div className="profile-large">{displayName.slice(0, 2).toUpperCase()}</div>
        <div>
          <p className="eyebrow">STUDENT PROFILE · YEAR 2</p>
          <h2>{displayName}</h2>
          <p>
            Curious maker · {memberships[0]?.club || "Campus Member"} · Northstar University
          </p>
          <div className="profile-stats">
            <span>
              <b>{totalPoints}</b>volunteer points
            </span>
            <span>
              <b>{String(totalVolunteerHours).padStart(2, "0")}</b>hours given
            </span>
            <span>
              <b>{String(tickets.length).padStart(2, "0")}</b>events attended
            </span>
          </div>
        </div>
        <button onClick={() => setModal({ type: "edit_profile" })}>EDIT PROFILE ↗</button>
      </div>
      <div className="achievement-grid">
        <section className="panel badge-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">BADGES IN YOUR BAG</p>
              <h2>Small proof, big feeling.</h2>
            </div>
            <button
              className="text-link"
              onClick={() => notify("Badges earn automatically when you volunteer and RSVP.")}
            >
              How to earn ↗
            </button>
          </div>
          <div className="badge-row">
            <span>
              <b>✦</b>
              <small>
                FIRST<br />VOLUNTEER
              </small>
            </span>
            <span className={tickets.length ? "" : "locked"}>
              <b>♡</b>
              <small>
                EVENT<br />HERO
              </small>
            </span>
            <span className={totalPoints >= 160 ? "" : "locked"}>
              <b>✹</b>
              <small>
                COMMUNITY<br />BUILDER
              </small>
            </span>
            <span className={products.length > 3 ? "" : "locked"}>
              <b>⌑</b>
              <small>
                TRUSTED<br />SELLER
              </small>
            </span>
          </div>
        </section>
        <section className="panel leaderboard-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CAMPUS RECOGNITION</p>
              <h2>Leaderboard</h2>
            </div>
            <button
              className="more-button"
              onClick={() => notify("Leaderboards refresh every Sunday.")}
            >
              ···
            </button>
          </div>
          <div className="leaderboard-tabs">
            <button
              className={leaderboard === "VOLUNTEERS" ? "active" : ""}
              onClick={() => setLeaderboard("VOLUNTEERS")}
            >
              VOLUNTEERS
            </button>
            <button
              className={leaderboard === "MARKETPLACE" ? "active" : ""}
              onClick={() => setLeaderboard("MARKETPLACE")}
            >
              MARKETPLACE
            </button>
          </div>
          {(leaderboard === "VOLUNTEERS"
            ? [
                { name: "Ananya Rao", dept: "Design", points: 260, medal: "🥇" },
                { name: displayName, dept: "Computer Science", points: totalPoints, medal: "🥈" },
                { name: "Vikram Shah", dept: "Engineering", points: 105, medal: "🥉" },
              ]
            : [
                { name: "Riya Shah", dept: "Architecture", points: 180, medal: "🥇" },
                { name: displayName, dept: "Computer Science", points: 74, medal: "🥈" },
                { name: "Ananya Rao", dept: "Design", points: 62, medal: "🥉" },
              ]
          ).map((person) => (
            <div className="leader-row" key={person.name}>
              <span>{person.medal}</span>
              <div>
                <b>{person.name}</b>
                <small>{person.dept}</small>
              </div>
              <strong>{person.points} pts</strong>
            </div>
          ))}
        </section>
      </div>
    </ModulePage>
  );
}
