"use client";

import React from "react";
import { ModulePage } from "../ui/ModulePage";
import type { Club, EventItem, TaskItem, ModalState, Section } from "../../lib/supabase/types";

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
}: ClubDashboardModuleProps) {
  return (
    <ModulePage
      eyebrow="DESIGN SOCIETY · LEADER WORKSPACE"
      title={
        <>
          Your club has
          <br />
          <em>a room of its own.</em>
        </>
      }
      subtitle="One reusable page engine for your story, your people and your next event."
    >
      <div className={`club-engine-preview ${theme}`}>
        <div className="club-engine-cover">
          <span>✳</span>
          <small>DESIGN SOCIETY · EST. 2022</small>
          <h2>
            Make room
            <br />
            for ideas.
          </h2>
          <button onClick={() => setModal({ type: "public_club_preview" })}>
            PREVIEW PUBLIC PAGE ↗
          </button>
        </div>
        <div className="club-engine-body">
          <p>
            We make the ordinary more considered. Posters, products, workshops and good reasons to stay curious.
          </p>
          <div className="engine-sections">
            <span>ABOUT</span>
            <span>LEADERSHIP</span>
            <span>EVENTS</span>
            <span>GALLERY</span>
            <span>SHOP</span>
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
          <p>{clubs[0]?.members || "248 members"} · 12 requests waiting.</p>
          <button onClick={() => setSection("Membership")}>MANAGE MEMBERS ↗</button>
        </div>
        <div className="panel dashboard-tool">
          <span>▦</span>
          <b>Club operations</b>
          <p>
            {events.length} events · {tasks.length} volunteer tasks · 2 drafts.
          </p>
          <button onClick={() => setSection("Tasks")}>OPEN TASK BOARD ↗</button>
        </div>
        <div className="panel dashboard-tool">
          <span>₹</span>
          <b>Club finance</b>
          <p>₹ {totalBalanceNumber.toLocaleString("en-IN")} available · healthy pace.</p>
          <button onClick={() => setSection("Finance")}>VIEW LEDGER ↗</button>
        </div>
      </div>
    </ModulePage>
  );
}
