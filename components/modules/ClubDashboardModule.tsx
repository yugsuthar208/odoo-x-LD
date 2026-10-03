"use client";

import React, { useState } from "react";
import { ModulePage } from "../ui/ModulePage";
import type { Club, EventItem, TaskItem, ModalState, Section, CampusRole } from "../../lib/supabase/types";

interface ClubDashboardModuleProps {
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  clubs: Club[];
  events: EventItem[];
  tasks: TaskItem[];
  totalBalanceNumber: number;
  setModal: (m: ModalState) => void;
  setSection: (s: Section) => void;
  notify: (msg: string) => void;
  role?: CampusRole;
}

export function ClubDashboardModule({
  theme,
  setTheme,
  clubs,
  events,
  tasks,
  totalBalanceNumber,
  setModal,
  setSection,
  notify,
  role = "Club Leader",
}: ClubDashboardModuleProps) {
  const isCouncil = role === "Student Council";
  const [selectedClubIndex, setSelectedClubIndex] = useState(0);
  const currentClub = clubs[selectedClubIndex] || clubs[0];

  const clubName = isCouncil ? "Student Council" : currentClub?.name?.replace(/^✓ /, "") || "Design Society";

  return (
    <ModulePage
      eyebrow={
        isCouncil
          ? "STUDENT COUNCIL · EXECUTIVE WORKSPACE"
          : `${clubName.toUpperCase()} · LEADER WORKSPACE`
      }
      title={
        <>
          {isCouncil ? "Your council has" : "Your club has"}
          <br />
          <em>a room of its own.</em>
        </>
      }
      subtitle={
        isCouncil
          ? "Executive workspace to oversee all campus organizations, verify memberships, and manage operations."
          : "One reusable page engine for your story, your people and your next event."
      }
    >
      {/* Club Switcher for Multi-Club Leaders or Council */}
      {!isCouncil && clubs.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>MANAGE CLUB:</span>
          {clubs.map((c, idx) => {
            const cName = c.name.replace(/^✓ /, "");
            return (
              <button
                key={cName}
                type="button"
                className={selectedClubIndex === idx ? "primary-button" : "soft-button"}
                onClick={() => setSelectedClubIndex(idx)}
                style={{ fontSize: 9.5, padding: "5px 11px" }}
              >
                {cName}
              </button>
            );
          })}
        </div>
      )}

      <div className={`club-engine-preview ${theme}`}>
        <div className="club-engine-cover">
          <span>✦</span>
          <small>
            {isCouncil ? "STUDENT COUNCIL · EST. 2020" : `${clubName.toUpperCase()} · EST. 2022`}
          </small>
          <h2>
            {isCouncil ? (
              <>
                Lead with
                <br />
                purpose.
              </>
            ) : (
              <>
                Make room
                <br />
                for ideas.
              </>
            )}
          </h2>
          <button onClick={() => setModal({ type: "public_club_preview" })}>
            PREVIEW PUBLIC PAGE ↗
          </button>
        </div>
        <div className="club-engine-body">
          <p>
            {isCouncil
              ? "Official governing student body of Northstar University. Bridging student aspirations, club charters, and campus governance."
              : currentClub?.description ||
                "We make the ordinary more considered. Posters, products, workshops and good reasons to stay curious."}
          </p>
          <div className="engine-sections">
            <span>ABOUT</span>
            <span>LEADERSHIP</span>
            <span>EVENTS</span>
            <span>GALLERY</span>
            <span>{isCouncil ? "BUDGET" : "SHOP"}</span>
          </div>
        </div>
      </div>
      <div className="dashboard-tools">
        <div className="panel dashboard-tool">
          <span>◌</span>
          <b>Customize page</b>
          <p>Change colors, sections and the cover story.</p>
          <button
            onClick={() => {
              setTheme(theme === "forest" ? "sunset" : "forest");
              notify(`Club theme set to ${theme === "forest" ? "sunset" : "forest"}.`);
            }}
          >
            SWITCH THEME ({theme}) ↗
          </button>
        </div>
        <div className="panel dashboard-tool">
          <span>♧</span>
          <b>Memberships</b>
          <p>{currentClub?.members || "248 members"} · 12 requests waiting.</p>
          <button onClick={() => setSection("Membership")}>MANAGE MEMBERS ↗</button>
        </div>
        <div className="panel dashboard-tool">
          <span>▦</span>
          <b>Operations &amp; Tasks</b>
          <p>
            {events.length} events · {tasks.length} active tasks.
          </p>
          <button onClick={() => setSection("Tasks")}>OPEN TASK BOARD ↗</button>
        </div>
        <div className="panel dashboard-tool">
          <span>₹</span>
          <b>Organization finance</b>
          <p>₹ {totalBalanceNumber.toLocaleString("en-IN")} available · healthy pace.</p>
          <button onClick={() => setSection("Finance")}>VIEW LEDGER ↗</button>
        </div>
      </div>
    </ModulePage>
  );
}
