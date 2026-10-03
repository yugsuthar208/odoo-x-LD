"use client";

import React from "react";
import { Icon } from "../ui/Icon";
import type { CampusRole, Section } from "../../lib/supabase/types";

export const navItems: { name: Section; icon: string; badge?: string }[] = [
  { name: "Overview", icon: "◫" },
  { name: "College portal", icon: "⌂" },
  { name: "Discover clubs", icon: "◎" },
  { name: "My Clubs", icon: "♧" },
  { name: "Events", icon: "▦", badge: "3" },
  { name: "Membership", icon: "♧" },
  { name: "Volunteers", icon: "♡" },
  { name: "Tasks", icon: "☑" },
  { name: "Club dashboard", icon: "▣" },
  { name: "Club shop", icon: "▤" },
  { name: "Marketplace", icon: "⌑" },
  { name: "Messages", icon: "↗" },
  { name: "Help desk", icon: "?" },
  { name: "Finance", icon: "₹" },
  { name: "Approvals", icon: "✓" },
  { name: "Announcements", icon: "✉" },
  { name: "Achievements", icon: "✹" },
  { name: "Council", icon: "◎" },
  { name: "Elections", icon: "◉" },
  { name: "Administration", icon: "⚙" },
];

export const roleSections: Record<CampusRole, Section[]> = {
  Student: [
    "Overview",
    "College portal",
    "Discover clubs",
    "My Clubs",
    "Events",
    "Membership",
    "Volunteers",
    "Tasks",
    "Marketplace",
    "Club shop",
    "Messages",
    "Help desk",
    "Announcements",
    "Achievements",
    "Council",
    "Elections",
  ],
  "Club Leader": [
    "Overview",
    "College portal",
    "Discover clubs",
    "My Clubs",
    "Events",
    "Membership",
    "Volunteers",
    "Tasks",
    "Club dashboard",
    "Club shop",
    "Marketplace",
    "Messages",
    "Help desk",
    "Finance",
    "Approvals",
    "Announcements",
    "Achievements",
    "Council",
  ],
  Faculty: [
    "Overview",
    "College portal",
    "Discover clubs",
    "My Clubs",
    "Events",
    "Volunteers",
    "Tasks",
    "Club dashboard",
    "Finance",
    "Approvals",
    "Help desk",
    "Announcements",
    "Council",
  ],
  "Student Council": [
    "Overview",
    "College portal",
    "Discover clubs",
    "My Clubs",
    "Events",
    "Membership",
    "Volunteers",
    "Tasks",
    "Club dashboard",
    "Marketplace",
    "Messages",
    "Help desk",
    "Finance",
    "Approvals",
    "Announcements",
    "Achievements",
    "Council",
    "Elections",
  ],
  Admin: [
    "Overview",
    "College portal",
    "Discover clubs",
    "My Clubs",
    "Events",
    "Membership",
    "Volunteers",
    "Tasks",
    "Club dashboard",
    "Club shop",
    "Marketplace",
    "Messages",
    "Help desk",
    "Finance",
    "Approvals",
    "Announcements",
    "Achievements",
    "Council",
    "Elections",
    "Administration",
  ],
};

interface SidebarProps {
  section: Section;
  setSection: (s: Section) => void;
  role: CampusRole;
  displayName: string;
  signOut: () => void;
  eventCount: number;
  approvalCount: number;
}

export function Sidebar({
  section,
  setSection,
  role,
  displayName,
  signOut,
  eventCount,
  approvalCount,
}: SidebarProps) {
  const visibleNav = navItems.filter((item) => roleSections[role].includes(item.name));

  return (
    <aside className="sidebar">
      <a
        className="brand"
        href="/"
        onClick={(e) => {
          e.preventDefault();
          setSection("Overview");
        }}
      >
        <span className="brand-mark">
          c
        </span>
        <span>
          campus<span className="brand-light">.commons</span>
          <small>YOUR CAMPUS, IN SYNC</small>
        </span>
      </a>
      <div className="campus-switch">
        <span className="campus-avatar">N</span>
        <span>
          <b>Northstar University</b>
          <small>{role} workspace</small>
        </span>
        <span className="chevron">⌄</span>
      </div>
      <p className="nav-label">YOUR CAMPUS</p>
      <nav className="side-nav">
        {visibleNav.map((item) => (
          <button
            key={item.name}
            className={section === item.name ? "selected" : ""}
            onClick={() => {
              setSection(item.name);
            }}
          >
            <Icon>{item.icon}</Icon>
            <span>{item.name}</span>
            {item.name === "Approvals" && approvalCount > 0 && <small className="nav-badge">{approvalCount}</small>}
            {item.badge && <small className="nav-badge">{item.badge}</small>}
          </button>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <div className="side-tip">
        <span className="tip-star">✦</span>
        <b>
          Good things happen
          <br />
          when we show up.
        </b>
        <p>
          Your campus has <strong>{eventCount} things</strong> going on this week.
        </p>
        <button onClick={() => setSection("Events")}>
          See what’s on <span>↗</span>
        </button>
        <span className="tip-scribble">✎</span>
      </div>
      <button className="profile-button" onClick={signOut}>
        <span className="profile-avatar">{displayName.slice(0, 2).toUpperCase()}</span>
        <span>
          <b>{displayName}</b>
          <small>{role} · Sign out</small>
        </span>
        <span className="dots">↗</span>
      </button>
    </aside>
  );
}
