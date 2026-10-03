"use client";

import React from "react";
import type { Club, ModalState } from "../../lib/supabase/types";

interface DiscoverClubsModuleProps {
  search: string;
  setSearch: (s: string) => void;
  filter: string;
  setFilter: (f: string) => void;
  filteredClubs: Club[];
  toggleJoinClub: (name: string) => void;
  setModal: (m: ModalState) => void;
}

export function DiscoverClubsModule({
  search,
  setSearch,
  filter,
  setFilter,
  filteredClubs,
  toggleJoinClub,
  setModal,
}: DiscoverClubsModuleProps) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">FIND YOUR PEOPLE</p>
          <h1>
            There’s a place
            <br />
            for <em>your kind of curious.</em>
          </h1>
          <p className="welcome-copy">Meet the clubs making campus a little more interesting.</p>
        </div>
        <div className="heading-sticker">
          COME AS
          <br />
          YOU ARE <span>✳</span>
        </div>
      </div>
      <div className="filter-bar">
        <div className="searchbox">
          <span>⌕</span>
          <input
            id="global-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find your next favourite thing…"
          />
        </div>
        <div className="filter-chips">
          {["ALL CLUBS", "CREATIVE", "TECHNOLOGY", "COMMUNITY", "CULTURE"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={filter === cat ? "active" : ""}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="club-grid">
        {filteredClubs.map((club) => {
          const cleanName = club.name.replace(/^✓ /, "");
          const isJoined = club.name.startsWith("✓ ");
          return (
            <article className="club-card" key={club.name}>
              <div className={`club-cover ${club.color}`}>
                <span className="club-symbol">{club.icon}</span>
                <span className="club-cat">{club.category}</span>
                <span className="cover-decoration">✳</span>
              </div>
              <div className="club-card-body">
                <div className="club-name-row">
                  <h3>{cleanName}</h3>
                  <span className="member-count">{club.members}</span>
                </div>
                <p>{club.description}</p>
                <div className="club-next">
                  <span>UP NEXT</span>
                  <b>{club.next}</b>
                </div>
                <button
                  className={`join-button ${isJoined ? "joined" : ""}`}
                  onClick={() => toggleJoinClub(cleanName)}
                >
                  {isJoined ? "✓ YOU’RE A MEMBER (LEAVE?)" : "MEET THE CLUB"}
                  <span>{isJoined ? "✓" : "↗"}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {filteredClubs.length === 0 && (
        <div className="empty-state">
          <span>✳</span>
          <h3>No clubs found just yet.</h3>
          <p>Try a different search or category.</p>
          <button
            onClick={() => {
              setSearch("");
              setFilter("ALL CLUBS");
            }}
          >
            Show all clubs
          </button>
        </div>
      )}
      <div className="club-cta">
        <span>✎</span>
        <div>
          <b>Have a bright idea for a new club?</b>
          <p>There’s always room for one more good thing.</p>
        </div>
        <button onClick={() => setModal({ type: "start_club" })}>Let’s make it happen ↗</button>
      </div>
    </>
  );
}
