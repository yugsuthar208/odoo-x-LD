"use client";

import React from "react";
import type { CampusRole, Section } from "../../lib/supabase/types";

interface TopbarProps {
  autoAccept: boolean;
  setAutoAccept: (enabled: boolean) => void;
  clubsBusy: boolean;
  section: Section;
  role: CampusRole;
  isPreview: boolean;
  displayName: string;
  switchPreviewRole: (r: CampusRole) => void;
  notifOpen: boolean;
  setNotifOpen: (open: boolean) => void;
  signOut: () => void;
}

export function Topbar({
  autoAccept, setAutoAccept, clubsBusy,
  section,
  role,
  isPreview,
  displayName,
  switchPreviewRole,
  notifOpen,
  setNotifOpen,
  signOut,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <span>Northstar University</span>
        <b>/</b>
        <strong>{section}</strong>
      </div>
      <div className="topbar-actions">
        {isPreview && <label className="club-test-toggle" title="Preview only: instantly approve new and pending club requests">
          <input type="checkbox" role="switch" aria-label="Test mode: auto-accept club requests" checked={autoAccept} disabled={clubsBusy} onChange={(e) => setAutoAccept(e.target.checked)} />
          <span>TEST MODE · AUTO-ACCEPT</span>
        </label>}
        <span className="term-pill">
          <i /> AUTUMN TERM ’26
        </span>
        {isPreview ? (
          <label className="role-switch">
            <span>ROLE:</span>
            <select
              value={role}
              onChange={(e) => switchPreviewRole(e.target.value as CampusRole)}
            >
              <option value="Student">Student</option>
              <option value="Club Leader">Club Leader</option>
              <option value="Faculty">Faculty</option>
              <option value="Student Council">Student Council</option>
              <option value="Admin">Admin</option>
            </select>
          </label>
        ) : (
          <span className="role-display">{role}</span>
        )}
        <button
          className="icon-button notification"
          aria-label="Notifications"
          onClick={() => setNotifOpen(!notifOpen)}
        >
          ♧<i />
        </button>
        <span className="top-divider" />
        <button className="avatar-small" onClick={signOut}>
          {displayName.slice(0, 2).toUpperCase()}
        </button>
      </div>
    </header>
  );
}
