"use client";

import React from "react";
import type { EventItem, AnnouncementItem, TaskItem } from "../../lib/supabase/types";

interface NotificationPopoverProps {
  events: EventItem[];
  announcements: AnnouncementItem[];
  tasks: TaskItem[];
  setNotifOpen: (open: boolean) => void;
}

export function NotificationPopover({
  events,
  announcements,
  tasks,
  setNotifOpen,
}: NotificationPopoverProps) {
  const openTaskCount = tasks.filter((t) => !t.done).length;

  return (
    <div className="notif-popover">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <p className="eyebrow" style={{ margin: 0 }}>
          CAMPUS UPDATES
        </p>
        <button
          style={{ border: 0, background: "none", cursor: "pointer", fontSize: 13 }}
          onClick={() => setNotifOpen(false)}
        >
          ×
        </button>
      </div>
      <div className="notif-item">
        <b>{events[0]?.title}</b>
        <small>
          Upcoming on {events[0]?.date} {events[0]?.month} · Innovation Lab
        </small>
      </div>
      <div className="notif-item">
        <b>{announcements[0]?.title}</b>
        <small>{announcements[0]?.date}</small>
      </div>
      <div className="notif-item">
        <b>{openTaskCount} open tasks remaining</b>
        <small>Check your team board</small>
      </div>
    </div>
  );
}
