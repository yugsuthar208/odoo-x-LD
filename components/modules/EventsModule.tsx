"use client";

import React from "react";
import type { EventItem, Section } from "../../lib/supabase/types";

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
}: EventsModuleProps) {
  return (
    <>
      <div className="page-heading events-heading">
        <div>
          <p className="eyebrow">GOOD PLANS, GOOD PEOPLE</p>
          <h1>
            Make room for
            <br />
            <em>something memorable.</em>
          </h1>
          <p className="welcome-copy">Workshops, little adventures, and the things that bring us together.</p>
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
          <span className="live-dot" /> OCTOBER ON CAMPUS <span className="toolbar-divider">·</span> {events.length} THINGS TO DO
        </div>
        <button onClick={() => notify("Viewing all active events for this semester.")}>ALL EVENTS ⌄</button>
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
            placeholder="Propose a campus event…"
            required
          />
          <input
            value={formExtra}
            onChange={(e) => setFormExtra(e.target.value)}
            placeholder="Organizing club (e.g. Design Society)"
          />
          <input
            value={formExtra2}
            onChange={(e) => setFormExtra2(e.target.value)}
            placeholder="Day of month (e.g. 28)"
            style={{ maxWidth: 100 }}
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
                    {event.going} people are going
                    {hasTicket && " · YOUR TICKET SAVED"}
                    {isChecked && " · CHECKED IN ✓"}
                  </span>
                </div>
              </div>
              <div className="event-actions">
                <button className="ticket-button" onClick={() => handleTicketClick(event)}>
                  {hasTicket ? "VIEW TICKET & QR" : "GET YOUR TICKET"} <span>↗</span>
                </button>
                {hasTicket && (
                  <button className="checkin-button" onClick={() => handleCheckIn(event.title)}>
                    {isChecked ? "CHECKED IN ✓" : "SCAN DEMO QR ↗"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <div className="event-footer-note">
        <span>✳</span> Plans change. Good memories stick.
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
