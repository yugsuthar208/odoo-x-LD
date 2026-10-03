"use client";

import React from "react";
import { ModulePage } from "../ui/ModulePage";
import type { AnnouncementItem, CampusRole } from "../../lib/supabase/types";

interface AnnouncementsModuleProps {
  announcements: AnnouncementItem[];
  canPublishAnnouncements: boolean;
  announcementText: string;
  setAnnouncementText: (s: string) => void;
  announcementAudience: string;
  setAnnouncementAudience: (s: string) => void;
  role: CampusRole;
  publishAnnouncement: () => void;
  notify: (msg: string) => void;
}

export function AnnouncementsModule({
  announcements,
  canPublishAnnouncements,
  announcementText,
  setAnnouncementText,
  announcementAudience,
  setAnnouncementAudience,
  role,
  publishAnnouncement,
  notify,
}: AnnouncementsModuleProps) {
  return (
    <ModulePage
      eyebrow="ONE CAMPUS, IN THE LOOP"
      title={
        <>
          Say it clearly.
          <br />
          <em>Keep it here.</em>
        </>
      }
      subtitle="Published updates replace scattered messages and make every announcement easy to find."
    >
      <div className="announcement-layout">
        <section className="announcement-feed">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">PUBLISHED RECORD</p>
              <h2>What’s been said.</h2>
            </div>
            <span className="task-progress">{announcements.length} LIVE</span>
          </div>
          {announcements.map((item, index) => (
            <article className="announcement-card" key={`${item.title}-${index}`}>
              <div className="announcement-meta">
                <span className={`announcement-dot ${index % 2 ? "mint" : "lilac"}`}>✳</span>
                <small>
                  {item.audience} <i>·</i> {item.date}
                </small>
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <div className="announcement-foot">
                <span>WEBSITE · IN-APP · MAILING LIST</span>
                <button onClick={() => notify(`Announcement “${item.title}” pinned.`)}>
                  PIN ↗
                </button>
              </div>
            </article>
          ))}
        </section>
        <aside className="announcement-compose">
          {canPublishAnnouncements ? (
            <>
              <p className="eyebrow">PUBLISH AN UPDATE</p>
              <h3>Make the next thing easy to know.</h3>
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Write a short, useful announcement…"
              />
              <label>
                AUDIENCE
                <select
                  value={announcementAudience}
                  onChange={(e) => setAnnouncementAudience(e.target.value)}
                >
                  <option value="All students">
                    {role === "Student Council" || role === "Admin"
                      ? "All students"
                      : "Your club members"}
                  </option>
                  <option value="Event ticket holders">Event ticket holders</option>
                  <option value="Event volunteers">Event volunteers</option>
                </select>
              </label>
              <button type="button" onClick={publishAnnouncement}>
                PUBLISH WITH CARE ↗
              </button>
              <small>Every published update keeps its timestamp, audience and author tag.</small>
            </>
          ) : (
            <>
              <span className="compose-lock">⌁</span>
              <p className="eyebrow">STUDENT VIEW</p>
              <h3>Good updates have a home.</h3>
              <p>
                Club leaders and council members publish announcements here. You’ll see them as soon as they’re live.
              </p>
              <button onClick={() => notify("You are subscribed to alerts for your active clubs.")}>
                FOLLOW YOUR CLUBS ↗
              </button>
            </>
          )}
        </aside>
      </div>
    </ModulePage>
  );
}
