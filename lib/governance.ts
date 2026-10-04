import { campusClubs, type ClubData } from "./clubs";
import type { CampusRole } from "./supabase/types";

export type RequestKind = "funding" | "expense" | "event" | "announcement" | "activity" | "membership";
export type RequestStatus = "pending_faculty" | "pending_admin" | "approved_funding" | "completed" | "rejected" | "cancelled";
export type AuditEntry = { actor: string; role: CampusRole; action: string; note: string; at: string };
export type ClubRequest = {
  id: string; club_id: string; kind: RequestKind; title: string; body: string; amount: number;
  status: RequestStatus; created_by: string; creator_name: string; created_at: string;
  details: { starts_at?: string; location?: string; target?: string; decision?: string };
  history: AuditEntry[];
};
export type ClubAccount = { id: string; balance: number };
export type LedgerEntry = { id: string; account_id: string; amount: number; kind: string; description: string; request_id: string | null; created_by: string; created_at: string };
export type GovernanceActor = { role: CampusRole; userId: string; name: string; leadClubs: string[]; facultyClubs: string[] };
export type GovernanceCommand = { action: "submit" | "approve" | "reject" | "release" | "cancel" | "deposit"; club_id?: string; request_id?: string; kind?: RequestKind; title?: string; body?: string; amount?: number; details?: ClubRequest["details"]; note?: string };
export const requestStatusLabels: Record<RequestStatus, string> = { pending_faculty: "Awaiting faculty", pending_admin: "Awaiting Admin authorization", approved_funding: "Awaiting Student Council release", completed: "Completed", rejected: "Rejected", cancelled: "Cancelled" };
export const money = (paise: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(paise / 100);
export const previewStaffClubs = ["ieee", "coding", "robotics", "design", "ai_ds", "aerospace", "cybersec", "photography", "film", "finearts", "singing", "music_band", "ecell", "mun", "green"];
export const supervises = (actor: GovernanceActor, club: string) => actor.role === "Admin" || actor.role === "Faculty" && actor.facultyClubs.includes(club);
export const leads = (actor: GovernanceActor, club: string) => actor.role === "Club Leader" && actor.leadClubs.includes(club);
export const canPropose = (actor: GovernanceActor, club: string) => supervises(actor, club) || leads(actor, club);
export const canReview = (actor: GovernanceActor, request: ClubRequest) => request.status === "pending_faculty" ? supervises(actor, request.club_id) : request.status === "pending_admin" && actor.role === "Admin";

export function applyGovernance(original: ClubData, actor: GovernanceActor, command: GovernanceCommand): ClubData {
  const data: ClubData = structuredClone(original);
  const now = new Date().toISOString();
  const audit = (action: string): AuditEntry => ({ actor: actor.name, role: actor.role, action, note: (command.note || "").trim(), at: now });
  const amount = command.amount ?? 0;
  const validMoney = (value: number) => Number.isSafeInteger(value) && value > 0 && value <= 100_000_000_000;
  const entry = (account: string, value: number, kind: string, description: string, request: string | null) => {
    const target = data.accounts.find((a) => a.id === account);
    if (!target || target.balance + value < 0) throw new Error(account === "council" ? "Student Council has insufficient treasury funds." : "This club has insufficient funds. Request funding first.");
    if (!Number.isSafeInteger(target.balance + value) || target.balance + value > 9_000_000_000_000_000) throw new Error("Account balance limit exceeded.");
    target.balance += value;
    data.ledger.unshift({ id: crypto.randomUUID(), account_id: account, amount: value, kind, description, request_id: request, created_by: actor.userId, created_at: now });
  };
  if ((command.note || "").length > 1000) throw new Error("Review notes must be at most 1,000 characters.");
  if (command.action === "deposit") {
    if (actor.role !== "Student Council") throw new Error("Only Student Council records treasury receipts.");
    if (!validMoney(amount) || !command.title?.trim() || command.title.length > 160) throw new Error("Enter a positive amount and a receipt reference (up to 160 characters).");
    if (data.ledger.some((e) => e.kind === "receipt" && e.description === command.title!.trim())) throw new Error("That receipt reference has already been recorded.");
    entry("council", amount, "receipt", command.title.trim(), null);
    return data;
  }
  if (command.action === "submit") {
    const club = command.club_id || "";
    if (!campusClubs.some((c) => c.id === club) || !canPropose(actor, club)) throw new Error("You may submit requests only for your assigned clubs.");
    if (!["funding", "expense", "event", "announcement", "activity", "membership"].includes(command.kind || "")) throw new Error("Choose a request type.");
    if (!command.title?.trim() || command.title.length > 160 || !command.body?.trim() || command.body.length > 5000) throw new Error("Enter a title (up to 160 characters) and details (up to 5,000 characters).");
    const financial = command.kind === "funding" || command.kind === "expense";
    if (financial ? !validMoney(amount) : amount !== 0) throw new Error("Enter a positive amount with at most two decimal places for funding or expenses only.");
    if (command.kind === "event" && (!command.details?.starts_at || !Number.isFinite(Date.parse(command.details.starts_at)) || !command.details.location?.trim() || command.details.location.length > 200)) throw new Error("Events require a valid date, time, and venue.");
    if (command.kind === "membership") {
      if (!["approve", "reject"].includes(command.details?.decision || "") || !data.memberships.some((m) => m.club_id === club && m.user_id === command.details?.target && m.status === "pending")) throw new Error("Membership request is no longer pending.");
      if (data.requests.some((r) => r.club_id === club && r.kind === "membership" && r.details.target === command.details?.target && r.status === "pending_faculty")) throw new Error("This membership decision is already awaiting faculty review.");
    }
    data.requests.unshift({ id: crypto.randomUUID(), club_id: club, kind: command.kind!, title: command.title.trim(), body: command.body.trim(), amount, status: command.kind === "funding" && supervises(actor, club) ? "pending_admin" : "pending_faculty", created_by: actor.userId, creator_name: actor.name, created_at: now, details: command.details || {}, history: [audit("Submitted")] });
    return data;
  }
  const request = data.requests.find((r) => r.id === command.request_id);
  if (!request) throw new Error("Request not found.");
  if (command.action === "cancel") {
    if ((request.created_by !== actor.userId && actor.role !== "Admin") || !["pending_faculty", "pending_admin", "approved_funding"].includes(request.status)) throw new Error("This request cannot be cancelled.");
    request.status = "cancelled";
  } else if (command.action === "reject") {
    if (!canReview(actor, request) || !command.note?.trim()) throw new Error("An authorized reviewer and a rejection reason are required.");
    request.status = "rejected";
  } else if (command.action === "release") {
    if (actor.role !== "Student Council" || request.status !== "approved_funding" || request.kind !== "funding") throw new Error("Only Student Council can release Admin-authorized funding.");
    entry("council", -request.amount, "funding_out", request.title, request.id);
    entry(request.club_id, request.amount, "funding_in", request.title, request.id);
    request.status = "completed";
  } else if (command.action === "approve") {
    if (!canReview(actor, request)) throw new Error("This request is not awaiting your approval.");
    if (request.kind === "funding") request.status = request.status === "pending_faculty" ? "pending_admin" : "approved_funding";
    else {
      if (request.kind === "expense") entry(request.club_id, -request.amount, "expense", request.title, request.id);
      if (request.kind === "event") data.events.unshift({ id: request.id, club_id: request.club_id, title: request.title, starts_at: request.details.starts_at!, location: request.details.location! });
      if (request.kind === "announcement") data.announcements.unshift({ id: request.id, club_id: request.club_id, title: request.title, body: request.body });
      if (request.kind === "membership") {
        const member = data.memberships.find((m) => m.club_id === request.club_id && m.user_id === request.details.target && m.status === "pending");
        if (!member) throw new Error("Membership request is no longer pending.");
        member.status = request.details.decision === "approve" ? "approved" : "rejected";
      }
      request.status = "completed";
    }
  } else throw new Error("Unknown action.");
  request.history.push(audit(command.action));
  return data;
}
