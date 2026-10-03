"use client";

import React from "react";
import type { CampusRole, EventItem, Section } from "../../lib/supabase/types";

interface EventsModuleProps {
  events: EventItem[];
  canManage: boolean;
  formText: string;
  setFormText: (s: string) => void;
  formExtra: string;
  setFormExtra: (s: string) => void;
  formExtra2: string;
  setFormExtra2: (s: string) => void;
  submitInline: (k: Section) => void;
  tickets: string[];
  checkedIn: string[];
  handleTicketClick: (e: EventItem) => void;
  handleCheckIn: (title: string) => void;
  setSection: (s: Section) => void;
  notify: (msg: string) => void;
  role?: CampusRole;
}

export function EventsModule({
  events,
  canManage,
  formText,
  setFormText,
  formExtra,
  setFormExtra,
  formExtra2,
  setFormExtra2,
  submitInline,
  tickets,
  checkedIn,
  handleTicketClick,
  handleCheckIn,
  setSection,
  notify,
  role = "Student",
}: EventsModuleProps) {
  const isCouncil = role === "Student Council";
  const isClubLeader = role === "Club Leader";

  return (
    <>
      <div className="page-heading events-heading">
        <div>
          <p className="eyebrow">
            {isCouncil
              ? "STUDENT COUNCIL · CAMPUS PROGRAMMING"
              : isClubLeader
              ? "CLUB EVENTS & WORKSHOP OPERATIONS"
              : "GOOD PLANS, GOOD PEOPLE"}
          </p>
          <h1>
            Make room for
            <br />
            <em>something memorable.</em>
          </h1>
          <p className="welcome-copy">
            {canManage
              ? "Publish official campus events, manage ticketing capacity, and supervise entrance check-ins."
              : "Workshops, little adventures, and the things that bring us together."}
          </p>
        </div>
        <div className="heading-sticker yellow-bg">
          SAVE
          <br />
          YOUR
          <br />
          SEAT <span>↘</span>
        </div>
      </div>

      <div className="events-toolbar">
        <div>
          <span className="live-dot" /> OCTOBER ON CAMPUS <span className="toolbar-divider">·</span>{" "}
          {events.length} THINGS TO DO
        </div>
        <button onClick={() => notify("Viewing all active events for this semester.")}>
          ALL EVENTS ⌄
        </button>
      </div>

      {canManage && (
        <form
          className="inline-create"
          onSubmit={(e) => {
            e.preventDefault();
            submitInline("Events");
          }}
        >
          <input
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            placeholder={
              isCouncil
                ? "Propose campus-wide council event (e.g. Townhall, Cultural Night)…"
                : isClubLeader
                ? "Create club event / workshop (e.g. Design Hackathon)…"
                : "Propose a campus event…"
            }
            required
            style={{ flex: 2 }}
          />
          <input
            value={formExtra}
            onChange={(e) => setFormExtra(e.target.value)}
            placeholder={
              isCouncil
                ? "Host: Student Council"
                : isClubLeader
                ? "Host: Design Society"
                : "Organizing club"
            }
            style={{ flex: 1 }}
          />
          <input
            value={formExtra2}
            onChange={(e) => setFormExtra2(e.target.value)}
            placeholder="Day (e.g. 28)"
            style={{ maxWidth: 90 }}
          />
          <button type="submit">ADD EVENT +</button>
        </form>
      )}

      <div className="full-event-list">
        {events.map((event) => {
          const hasTicket = tickets.includes(event.title);
          const isChecked = checkedIn.includes(event.title);

          return (
            <article className="full-event" key={event.title}>
              <div className={`big-date ${event.color}`}>
                <span>{event.month}</span>
                <b>{event.date}</b>
                <small>2026</small>
              </div>
              <div className="full-event-copy">
                <div className="event-type">
                  {event.type} <i>·</i> HOSTED BY {event.club.toUpperCase()}
                </div>
                <h2>{event.title}</h2>
                <p>
                  {event.time} <i>·</i> {event.place}
                </p>
                <div className="attending">
                  <div className="attendee-stack">
                    <i>MP</i>
                    <i>AK</i>
                    <i>SR</i>
                  </div>
                  <span>
                    {event.going} people are registered
                    {hasTicket && " · YOUR TICKET SAVED"}
                    {isChecked && " · ENTRY VALIDATED ✓"}
                  </span>
                </div>
              </div>
              <div className="event-actions">
                {/* Student Ticketing View */}
                <button className="ticket-button" onClick={() => handleTicketClick(event)}>
                  {hasTicket ? "VIEW TICKET & PASS" : "GET YOUR TICKET"} <span>↗</span>
                </button>

                {/* Organizer Entrance Management vs Student Status */}
                {canManage ? (
                  <button
                    className="checkin-button"
                    onClick={() => handleCheckIn(event.title)}
                    title="Validate arriving student attendee"
                  >
                    {isChecked ? "GATE CHECK-IN VALID ✓" : "ENTRANCE CHECK-IN ↗"}
                  </button>
                ) : (
                  hasTicket && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "6px 10px",
                        borderRadius: 4,
                        background: isChecked ? "#e6f4ea" : "#f1f3ed",
                        color: isChecked ? "#137333" : "#556453",
                        fontWeight: 600,
                        alignSelf: "center",
                      }}
                    >
                      {isChecked ? "CHECKED IN AT DOOR ✓" : "PASS READY FOR DOOR"}
                    </span>
                  )
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="event-footer-note">
        <span>✦</span> Plans change. Good memories stick.
        <button
          onClick={() => {
            setSection("Help desk");
            setFormExtra("Suggestion");
          }}
        >
          Suggest an event ↗
        </button>
      </div>
    </>
  );
}
