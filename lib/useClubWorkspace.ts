"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "./supabase";
import { campusClubs, emptyClubData, previewClubData, type ClubData, type ClubStatus } from "./clubs";
import type { CampusRole } from "./supabase/types";

import { applyGovernance, supervises, leads as isLeader, canPropose, type GovernanceCommand, type GovernanceActor } from "./governance";

// ponytail: preview is a local browser demo; concurrent real money operations use PostgreSQL row locks.
const storageKey = "campus-commons-clubs-v1";

export function useClubWorkspace(ready: boolean, preview: boolean, profileId: string, role: CampusRole, name: string) {
  const [data, setData] = useState<ClubData>(emptyClubData);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const generation = useRef(0);
  const userId = preview ? `preview:${role}` : profileId;

  const readPreview = (): ClubData => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return previewClubData();
    const parsed = JSON.parse(saved);
    if (![parsed.memberships, parsed.events, parsed.announcements, parsed.rsvps].every(Array.isArray)) throw new Error("Club preview data could not be loaded.");
    const defaults = previewClubData();
    return { ...defaults, ...parsed, accounts: parsed.accounts || defaults.accounts, ledger: parsed.ledger || defaults.ledger };
  };

  const fetchData = useCallback(async (): Promise<ClubData> => {
    if (preview) return readPreview();
    const db = getSupabase();
    if (!db) throw new Error("Supabase is not configured.");
    const results = await Promise.all([
      db.from("club_memberships").select("club_id,user_id,display_name,status"),
      db.from("club_events").select("id,club_id,title,starts_at,location"),
      db.from("club_announcements").select("id,club_id,title,body").order("created_at", { ascending: false }),
      db.from("club_rsvps").select("event_id,user_id,club_id"),
      db.from("club_admins").select("club_id,user_id"),
      db.from("club_faculty").select("club_id,user_id"),
      db.from("club_requests").select("*").order("created_at", { ascending: false }),
      db.from("club_accounts").select("id,balance"),
      db.from("club_ledger").select("*").order("created_at", { ascending: false }),
      db.from("profiles").select("id,full_name,role").in("role", ["Faculty", "Club Leader"]),
    ]);
    const failure = results.find((result) => result.error);
    if (failure?.error) throw new Error(`Club data unavailable: ${failure.error.message}. Apply supabase/clubs.sql and supabase/governance.sql if this feature is not installed.`);
    return { memberships: results[0].data || [], events: results[1].data || [], announcements: results[2].data || [], rsvps: results[3].data || [], adminClubs: (results[4].data || []).filter((row) => row.user_id === profileId).map((row) => row.club_id), facultyClubs: (results[5].data || []).filter((row) => row.user_id === profileId).map((row) => row.club_id), requests: results[6].data || [], accounts: results[7].data || [], ledger: results[8].data || [], assignments: [...(results[4].data || []).map((row) => ({ ...row, role: "Club Leader" })), ...(results[5].data || []).map((row) => ({ ...row, role: "Faculty" }))], staffProfiles: results[9].data || [], autoAccept: false } as ClubData;
  }, [preview, profileId]);

  const refresh = useCallback(async () => {
    const version = generation.current;
    try {
      const next = await fetchData();
      if (version === generation.current) { setData(next); setError(""); }
    } catch (e) {
      if (version === generation.current) { setData(emptyClubData()); setError(e instanceof Error ? e.message : "Unable to load clubs."); }
    } finally { if (version === generation.current) setLoading(false); }
  }, [fetchData]);

  useEffect(() => {
    generation.current++;
    setData(emptyClubData());
    setLoading(true);
    if (!ready) return;
    void refresh();
    const reload = () => { if (!lock.current) void refresh(); };
    window.addEventListener("focus", reload);
    window.addEventListener("storage", reload);
    return () => { generation.current++; window.removeEventListener("focus", reload); window.removeEventListener("storage", reload); };
  }, [ready, role, refresh]);

  const actor: GovernanceActor = { role, userId, name, leadClubs: preview ? data.assignments.filter((a) => a.user_id === userId && a.role === "Club Leader").map((a) => a.club_id) : data.adminClubs, facultyClubs: preview ? data.assignments.filter((a) => a.user_id === userId && a.role === "Faculty").map((a) => a.club_id) : data.facultyClubs };
  const manages = (clubId: string) => supervises(actor, clubId);
  const leads = (clubId: string) => isLeader(actor, clubId);
  const staff = (clubId: string) => canPropose(actor, clubId);
  const status = (clubId: string) => data.memberships.find((m) => m.club_id === clubId && m.user_id === userId)?.status;
  const canRead = (clubId: string) => status(clubId) === "approved" || staff(clubId);

  async function mutate(local: (current: ClubData) => ClubData, remote: () => PromiseLike<{ error: { message: string } | null }>) {
    if (lock.current || loading || !ready) return false;
    lock.current = true; setBusy(true); setError("");
    const version = generation.current;
    try {
      let next: ClubData;
      if (preview) {
        next = local(readPreview());
        localStorage.setItem(storageKey, JSON.stringify(next));
      } else {
        const result = await remote();
        if (result.error) throw new Error(result.error.message);
        next = await fetchData();
      }
      if (version === generation.current) setData(next);
      return true;
    } catch (e) {
      if (version === generation.current) setError(e instanceof Error ? e.message : "Club update failed. Please retry.");
      return false;
    } finally { lock.current = false; setBusy(false); }
  }

  const membership = (clubId: string, action: "request" | "approve" | "reject" | "leave", target = userId) => mutate((current) => {
    if (!campusClubs.some((club) => club.id === clubId)) throw new Error("Unknown club.");
    const existing = current.memberships.find((m) => m.club_id === clubId && m.user_id === target);
    if (action === "approve" || action === "reject") {
      if (!manages(clubId) || existing?.status !== "pending") throw new Error("Only this club's admin can review a pending request.");
    } else if (target !== userId) throw new Error("You can only change your own membership.");
    if (action === "request" && role !== "Student") throw new Error("Switch to a student to request membership.");
    if (action === "request" && existing && existing.status !== "rejected") return current;
    const memberships = current.memberships.filter((m) => !(m.club_id === clubId && m.user_id === target));
    if (action !== "leave") memberships.push({ club_id: clubId, user_id: target, display_name: existing?.display_name || name, status: (action === "request" ? current.autoAccept ? "approved" : "pending" : action === "approve" ? "approved" : "rejected") as ClubStatus });
    return { ...current, memberships, rsvps: action === "leave" ? current.rsvps.filter((r) => !(r.club_id === clubId && r.user_id === target)) : current.rsvps };
  }, () => getSupabase()!.rpc("club_membership_action", { p_club: clubId, p_action: action, p_user: target }));

  const setAutoAccept = (enabled: boolean) => {
    if (!preview) return;
    return mutate((current) => ({ ...current, autoAccept: enabled, memberships: current.memberships.map((m) => enabled && m.status === "pending" ? { ...m, status: "approved" } : m) }), async () => ({ error: null }));
  };

  const rsvp = (clubId: string, eventId: string, attending: boolean) => mutate((current) => {
    if (!current.memberships.some((m) => m.club_id === clubId && m.user_id === userId && m.status === "approved")) throw new Error("Join this club before you RSVP.");
    if (!current.events.some((e) => e.id === eventId && e.club_id === clubId)) throw new Error("Event not found.");
    const rsvps = current.rsvps.filter((r) => !(r.event_id === eventId && r.user_id === userId));
    if (attending) rsvps.push({ event_id: eventId, user_id: userId, club_id: clubId });
    return { ...current, rsvps };
  }, () => getSupabase()!.rpc("club_rsvp", { p_event: eventId, p_attending: attending }));

  const govern = (command: GovernanceCommand) => mutate((current) => applyGovernance(current, actor, command), () => getSupabase()!.rpc("club_governance", { p_command: command }));


  const assignStaff = (club: string, target: string, enabled: boolean) => mutate((current) => {
    if (role !== "Admin") throw new Error("Only Admin can assign club staff.");
    const profile = current.staffProfiles.find((p) => p.id === target);
    if (!profile || !["Faculty", "Club Leader"].includes(profile.role) || !campusClubs.some((c) => c.id === club)) throw new Error("Choose a valid club and faculty or leader profile.");
    const assignments = current.assignments.filter((a) => !(a.club_id === club && a.user_id === target));
    if (enabled) assignments.push({ club_id: club, user_id: target, role: profile.role as "Faculty" | "Club Leader" });
    return { ...current, assignments };
  }, () => getSupabase()!.rpc("club_assign_staff", { p_club: club, p_user: target, p_enabled: enabled }));

  return { assignStaff, actor, leads, staff, govern, data, loading, busy, error, userId, manages, status, canRead, membership, setAutoAccept, rsvp, refresh };
}

export type ClubWorkspace = ReturnType<typeof useClubWorkspace>;
