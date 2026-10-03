"use client";

import React from "react";
import { ModulePage } from "../ui/ModulePage";
import { getSupabase } from "../../lib/supabase";
import type { CampusRole } from "../../lib/supabase/types";

interface AdministrationModuleProps {
  profiles: Array<{ id: string; full_name: string; role: CampusRole }>;
  setProfiles: React.Dispatch<React.SetStateAction<Array<{ id: string; full_name: string; role: CampusRole }>>>;
  adminSearch: string;
  setAdminSearch: (s: string) => void;
  profileId: string;
  notify: (msg: string) => void;
}

export function AdministrationModule({
  profiles,
  setProfiles,
  adminSearch,
  setAdminSearch,
  profileId,
  notify,
}: AdministrationModuleProps) {
  const displayProfiles = profiles.length
    ? profiles.filter(
        (p) =>
          (p.full_name || "").toLowerCase().includes(adminSearch.toLowerCase()) ||
          p.role.toLowerCase().includes(adminSearch.toLowerCase())
      )
    : [
        { id: "preview-admin", full_name: "Maya Patel", role: "Admin" as CampusRole },
        { id: "preview-leader", full_name: "Arjun Mehta", role: "Club Leader" as CampusRole },
        { id: "preview-council", full_name: "Ananya Rao", role: "Student Council" as CampusRole },
        { id: "preview-student", full_name: "Riya Shah", role: "Student" as CampusRole },
      ];

  return (
    <ModulePage
      eyebrow="ACCESS, WITH CARE"
      title={
        <>
          Run the campus
          <br />
          <em>behind the scenes.</em>
        </>
      }
      subtitle="Manage roles and keep the shared Campus Commons workspace healthy."
    >
      <div className="admin-summary">
        <div>
          <b>{profiles.length || 128}</b>
          <span>registered members</span>
        </div>
        <div>
          <b>{profiles.filter((p) => p.role === "Student").length || 96}</b>
          <span>students</span>
        </div>
        <div>
          <b>{profiles.filter((p) => p.role !== "Student").length || 32}</b>
          <span>campus operators</span>
        </div>
      </div>
      <div className="panel admin-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">ROLE DIRECTORY</p>
            <h2>Who can do what</h2>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              placeholder="Search member…"
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              style={{ padding: "5px 8px", border: "1px solid #e3e7df", borderRadius: 4, fontSize: 10 }}
            />
            <span className="task-progress">ADMIN ONLY</span>
          </div>
        </div>
        {displayProfiles.map((profile) => (
          <article className="admin-user" key={profile.id}>
            <span className="profile-avatar">{profile.full_name.slice(0, 2).toUpperCase()}</span>
            <div>
              <b>{profile.full_name || "Unnamed member"}</b>
              <small>{profile.id.startsWith("preview") ? "Preview workspace" : profile.id}</small>
            </div>
            <select
              value={profile.role}
              disabled={profile.id === profileId}
              onChange={async (event) => {
                const nextRole = event.target.value as CampusRole;
                setProfiles((current) =>
                  current.map((item) => (item.id === profile.id ? { ...item, role: nextRole } : item))
                );
                const supabase = getSupabase();
                if (supabase && !profile.id.startsWith("preview")) {
                  const { error } = await supabase
                    .from("profiles")
                    .update({ role: nextRole })
                    .eq("id", profile.id);
                  if (error) notify(error.message);
                  else notify(`${profile.full_name} is now a ${nextRole}.`);
                } else {
                  notify(`${profile.full_name} will preview as ${nextRole}.`);
                }
              }}
            >
              {["Student", "Club Leader", "Faculty", "Student Council", "Admin"].map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </article>
        ))}
      </div>
      <div className="permission-map">
        <span>STUDENT</span>
        <p>Explore, join, RSVP, volunteer, list, message, report and vote.</p>
        <span>OPERATORS</span>
        <p>Club Leaders and Faculty can create events, manage tasks and oversee club work.</p>
        <span>GOVERNANCE</span>
        <p>Student Council manages issues, finance, elections and campus decisions.</p>
        <span>ADMIN</span>
        <p>Admins manage role access and the full shared workspace.</p>
      </div>
    </ModulePage>
  );
}
