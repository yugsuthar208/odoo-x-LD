"use client";

import React from "react";
import { ModulePage } from "../ui/ModulePage";
import type { AnnouncementItem, ModalState, Section } from "../../lib/supabase/types";

interface CollegePortalModuleProps {
  announcements: AnnouncementItem[];
  setSection: (s: Section) => void;
  setModal: (m: ModalState) => void;
  notify: (msg: string) => void;
}

export function CollegePortalModule({
  announcements,
  setSection,
  setModal,
  notify,
}: CollegePortalModuleProps) {
  return (
    <ModulePage
      eyebrow="NORTHSTAR UNIVERSITY · THE BIG PICTURE"
      title={
        <>
          Everything that makes
          <br />
          <em>campus feel like yours.</em>
        </>
      }
      subtitle="College news, helpful details, offers and every approved club in one front door."
    >
      <div className="portal-layout">
        <section className="panel portal-news">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">FROM THE CAMPUS DESK</p>
              <h2>Good things, happening.</h2>
            </div>
            <button className="text-link" onClick={() => setSection("Announcements")}>
              View all ↗
            </button>
          </div>
          {announcements.slice(0, 3).map((item) => (
            <article className="news-card" key={item.title}>
              <span className="news-pin">✦</span>
              <div>
                <small>
                  {item.audience} <i>·</i> {item.date}
                </small>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
              <button onClick={() => notify(`Opening “${item.title}”`)}>↗</button>
            </article>
          ))}
        </section>
        <aside className="portal-side">
          <div className="portal-info">
            <span>⌂</span>
            <p className="eyebrow">KNOW YOUR CAMPUS</p>
            <h3>Northstar, in a nutshell.</h3>
            <p>Four schools, one curious community. Find offices, contacts, quiet places and the people who can help.</p>
            <button onClick={() => setModal({ type: "campus_details" })}>CAMPUS DETAILS ↗</button>
          </div>
          <div className="offer-card">
            <p className="eyebrow">A LITTLE EXTRA</p>
            <b>15% off at The Daily Grind</b>
            <small>Show your Campus Commons profile at the counter.</small>
            <button onClick={() => notify("Offer saved to your profile! Show your avatar at checkout.")}>
              SAVE OFFER ♡
            </button>
          </div>
        </aside>
      </div>
      <div className="portal-clubs">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">THE DIRECTORY</p>
            <h2>Find an official club.</h2>
          </div>
          <button className="text-link" onClick={() => setSection("Discover clubs")}>
            All clubs ↗
          </button>
        </div>
        <div className="portal-club-row">
          {["Design Society", "Robotics & AI", "The Green Collective", "Frame by Frame"].map(
            (club, index) => (
              <button key={club} onClick={() => setSection("Discover clubs")}>
                <span
                  className={`portal-club-icon ${["lilac", "mint", "yellow", "pink"][index]}`}
                >
                  {["✦", "⌘", "♧", "◉"][index]}
                </span>
                <b>{club}</b>
                <small>{["CREATIVE", "TECHNOLOGY", "COMMUNITY", "CULTURE"][index]}</small>
                <span>↗</span>
              </button>
            )
          )}
        </div>
      </div>
    </ModulePage>
  );
}
