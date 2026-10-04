"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import type {
  CampusRole,
  Section,
  Club,
  EventItem,
  TaskItem,
  IssueItem,
  ProductItem,
  MessageItem,
  MembershipItem,
  AnnouncementItem,
  ShopItem,
  FinanceEntry,
  VolunteerOpportunity,
  ModalState,
} from "../../lib/supabase/types";

// Navigation & Layout components
import { Sidebar } from "../../components/navigation/Sidebar";
import { Topbar } from "../../components/navigation/Topbar";
import { NotificationPopover } from "../../components/navigation/NotificationPopover";
import { ModalProvider } from "../../components/modals/ModalProvider";

// Module components
import { OverviewModule } from "../../components/modules/OverviewModule";
import { ClubsModule } from "../../components/modules/ClubsModule";
import { useClubWorkspace } from "../../lib/useClubWorkspace";
import { campusClubs } from "../../lib/clubs";
import { EventsModule } from "../../components/modules/EventsModule";
import { VolunteersModule } from "../../components/modules/VolunteersModule";
import { TasksModule } from "../../components/modules/TasksModule";
import { MarketplaceModule } from "../../components/modules/MarketplaceModule";
import { MessagesModule } from "../../components/modules/MessagesModule";
import { HelpDeskModule } from "../../components/modules/HelpDeskModule";
import { FinanceModule } from "../../components/modules/FinanceModule";
import { GovernanceModule } from "../../components/modules/GovernanceModule";
import { canReview } from "../../lib/governance";
import { CouncilModule } from "../../components/modules/CouncilModule";
import { ElectionsModule } from "../../components/modules/ElectionsModule";
import { AdministrationModule } from "../../components/modules/AdministrationModule";
import { CollegePortalModule } from "../../components/modules/CollegePortalModule";
import { AnnouncementsModule } from "../../components/modules/AnnouncementsModule";
import { ClubShopModule } from "../../components/modules/ClubShopModule";
import { AchievementsModule } from "../../components/modules/AchievementsModule";

const initialClubs: Club[] = campusClubs.map((club) => ({
  name: club.name, category: club.category, members: "Open for applications", color: "mint",
  icon: club.icon, description: club.description, next: "Open the club page for details",
}));

const initialEvents: EventItem[] = [
  { title: "Build Night: Make it matter", club: "Robotics & AI", date: "18", month: "OCT", time: "5:30 PM", place: "Innovation Lab", type: "WORKSHOP", color: "mint", going: 42 },
  { title: "The little things market", club: "Design Society", date: "21", month: "OCT", time: "11:00 AM", place: "Central Courtyard", type: "COMMUNITY", color: "lilac", going: 86 },
  { title: "Stories after sunset", club: "Frame by Frame", date: "25", month: "OCT", time: "6:00 PM", place: "Open-air Theatre", type: "SCREENING", color: "pink", going: 31 },
];

export default function Home() {
  const [section, setRawSection] = useState<Section>("Overview");
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const setSection = (next: Section) => {
    setSelectedClub(null);
    setRawSection(next);
    window.history.replaceState(null, "", "/dashboard");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const openClub = (id: string | null) => {
    setSelectedClub(id);
    window.history.pushState(null, "", id ? `/dashboard?club=${encodeURIComponent(id)}` : "/dashboard");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  useEffect(() => {
    const readClub = () => {
      const id = new URLSearchParams(window.location.search).get("club");
      setSelectedClub(id);
      if (id) setRawSection("Discover clubs");
    };
    readClub();
    window.addEventListener("popstate", readClub);
    return () => window.removeEventListener("popstate", readClub);
  }, []);
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [volunteerTab, setVolunteerTab] = useState("Opportunities");
  const [tickets, setTickets] = useState<string[]>([]);
  const [checkedIn, setCheckedIn] = useState<string[]>([]);
  const [commitments, setCommitments] = useState<string[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([
    { title: "Confirm workshop equipment", team: "Build Night · Robotics & AI", done: false },
    { title: "Share event poster", team: "Little Things Market · Design Society", done: false },
    { title: "Collect volunteer name tags", team: "Welcome Fair · Student Council", done: true },
  ]);
  const [issues, setIssues] = useState<IssueItem[]>([
    { title: "More covered seating by the library", category: "CAMPUS SPACES", status: "In review", votes: 23 },
    { title: "Water fountain near the east studio", category: "FACILITIES", status: "Assigned", votes: 14 },
  ]);
  const [products, setProducts] = useState<ProductItem[]>([
    { title: "Hand-printed campus tote", seller: "Design Society", price: 350, emoji: "◈" },
    { title: "Arduino starter kit", seller: "Robotics & AI", price: 1200, emoji: "⌘" },
    { title: "Ceramic planter · set of 2", seller: "Green Collective", price: 280, emoji: "♧" },
  ]);
  const [messages, setMessages] = useState<MessageItem[]>([
    { channel: "Student Council", author: "Ananya · Student Council", text: "Hi Maya! The club equipment library idea is on our agenda for next week." },
    { channel: "Student Council", author: "Maya Patel", text: "That’s great! I can help gather a list of what clubs need." },
    { channel: "Design Society", author: "Design Society", text: "Poster Jam this Friday at 4:30 PM! Bring your sketchbook." },
    { channel: "Welcome Fair Crew", author: "Welcome Fair Crew", text: "Thanks to everyone who volunteered! Name badges are ready." },
    { channel: "Robotics & AI", author: "Robotics & AI", text: "Open lab is on Saturday morning at 11 AM." },
  ]);
  const [activeChannel, setActiveChannel] = useState("Student Council");
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([
    { title: "Welcome week is looking good.", audience: "ALL STUDENTS", date: "Today · Student Council", body: "Find your people, find your rhythm and make a little room for something new." },
    { title: "Poster Jam sign-ups are open", audience: "DESIGN SOCIETY", date: "Yesterday · Design Society", body: "Bring a sketch, a friend or just your curiosity. Materials are waiting in Studio 2." },
    { title: "Open Lab needs two more volunteers", audience: "ROBOTICS & AI", date: "Oct 10 · Robotics & AI", body: "Help us welcome new makers on Saturday morning." },
  ]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([
    { name: "Northstar club hoodie", club: "Design Society", price: 850, stock: 8, variant: "S · M · L", color: "lilac", emoji: "👕" },
    { name: "Build Night tee", club: "Robotics & AI", price: 450, stock: 14, variant: "S · M · L · XL", color: "mint", emoji: "⌘" },
    { name: "Green Collective tote", club: "The Green Collective", price: 280, stock: 3, variant: "One size", color: "yellow", emoji: "♧" },
  ]);
  const [cart, setCart] = useState<Array<{ name: string; club: string; price: number; qty: number }>>([]);
  const [councilIdeas, setCouncilIdeas] = useState<Array<{ title: string; cat: string; meta: string; votes: number; supported: boolean; color: string; icon: string }>>([
    { title: "More covered seating by the library?", cat: "CAMPUS SPACES", meta: "In review", votes: 23, supported: false, color: "lilac", icon: "⌂" },
    { title: "Can clubs share an equipment library?", cat: "STUDENT LIFE", meta: "Gathering support", votes: 17, supported: false, color: "mint", icon: "⇄" },
    { title: "Later café hours during project week", cat: "FOOD & WELLBEING", meta: "New this week", votes: 11, supported: false, color: "yellow", icon: "☼" },
  ]);
  const [volunteerOpportunities, setVolunteerOpportunities] = useState<VolunteerOpportunity[]>([
    { icon: "♧", title: "Give the garden a hand", org: "The Green Collective", detail: "Sunday, Oct 18 · 9:00 AM · 2 hours", need: "4 SPOTS LEFT", color: "mint", spots: 4 },
    { icon: "✦", title: "Make welcome week wonderful", org: "Student Council", detail: "Wednesday, Oct 21 · 10:00 AM · 3 hours", need: "8 SPOTS LEFT", color: "lilac", spots: 8 },
    { icon: "◉", title: "Help us tell the story", org: "Frame by Frame", detail: "Saturday, Oct 24 · 3:00 PM · 2 hours", need: "2 SPOTS LEFT", color: "pink", spots: 2 },
  ]);
  const [theme, setTheme] = useState("forest");
  const [leaderboard, setLeaderboard] = useState("VOLUNTEERS");
  const [shopFilter, setShopFilter] = useState("ALL");
  const roleProfiles: Record<CampusRole, { name: string; avatar: string }> = useMemo(
    () => ({
      Student: { name: "Aarav Sharma · Student", avatar: "AS" },
      "Club Leader": { name: "Maya Patel · Design Society Lead", avatar: "MP" },
      Faculty: { name: "Dr. Sunita Sen · Faculty Advisor", avatar: "SS" },
      "Student Council": { name: "Ananya Rao · Council President", avatar: "AR" },
      Admin: { name: "Vikram Malhotra · Campus Admin", avatar: "VM" },
    }),
    []
  );

  const [notifOpen, setNotifOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [role, setRole] = useState<CampusRole>("Student");
  const [displayName, setDisplayName] = useState("Aarav Sharma · Student");
  const [profileId, setProfileId] = useState("preview");
  const [isPreview, setIsPreview] = useState(true);
  const [authPending, setAuthPending] = useState(true);
  const [profiles, setProfiles] = useState<Array<{ id: string; full_name: string; role: CampusRole }>>([]);
  const [formText, setFormText] = useState("");
  const [formExtra, setFormExtra] = useState("");
  const [formExtra2, setFormExtra2] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementAudience, setAnnouncementAudience] = useState("All students");
  const [adminSearch, setAdminSearch] = useState("");

  const clubWorkspace = useClubWorkspace(!authPending, isPreview, profileId, role, displayName);
  const joinedMemberships: MembershipItem[] = campusClubs.filter((club) => clubWorkspace.status(club.id) === "approved").map((club) => ({ club: club.name, status: "ACTIVE", dues: "Approved member", color: "mint", icon: club.icon }));

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      let key = "preview";
      let remoteRecords: Array<{ id: string; kind: string; payload: Record<string, unknown>; created_by: string }> = [];
      const storedPreview = window.localStorage.getItem("campus-commons-preview-role");
      const preview = storedPreview && Object.hasOwn(roleProfiles, storedPreview) ? storedPreview : null;
      // Explicit preview mode must not wait for the hosted auth service.
      const supabase = preview ? null : getSupabase();

      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: profile, error } = await supabase.from("profiles").select("role, full_name").eq("id", session.user.id).single();
            if (error || !profile) {
              await supabase.auth.signOut();
              window.location.replace("/login?profile=setup");
              return;
            }
            key = session.user.id;
            if (!cancelled) {
              setRole(profile.role as CampusRole);
              setDisplayName(profile.full_name || session.user.email?.split("@")[0] || "Campus member");
              setProfileId(key);
              setIsPreview(false);
            }
            if (profile.role === "Admin") {
              const { data: allProfiles } = await supabase.from("profiles").select("id, full_name, role").order("created_at", { ascending: false });
              if (allProfiles && !cancelled) setProfiles(allProfiles as Array<{ id: string; full_name: string; role: CampusRole }>);
            }
            const { data: records, error: recordsError } = await supabase.from("campus_records").select("id, kind, payload, created_by").order("created_at", { ascending: true });
            if (records) remoteRecords = records;
            if (recordsError && !cancelled) notify("Cloud records sync pending schema execution.");
          } else if (preview) {
            key = `preview:${preview}`;
            if (!cancelled) {
              setRole(preview as CampusRole);
              setDisplayName(roleProfiles[preview as CampusRole]?.name || "Aarav Sharma · Student");
              setProfileId(key);
              setIsPreview(true);
            }
          } else {
            window.location.replace("/login");
            return;
          }
        } catch {
          if (preview) {
            key = `preview:${preview}`;
            if (!cancelled) {
              setRole(preview as CampusRole);
              setDisplayName(roleProfiles[preview as CampusRole]?.name || "Aarav Sharma · Student");
              setProfileId(key);
              setIsPreview(true);
            }
          } else {
            window.location.replace("/login");
            return;
          }
        }
      } else {
        if (!preview) {
          window.location.replace("/login");
          return;
        }
        key = `preview:${preview}`;
        if (!cancelled) {
          setRole(preview as CampusRole);
          setDisplayName(roleProfiles[preview as CampusRole]?.name || "Aarav Sharma · Student");
          setProfileId(key);
          setIsPreview(true);
        }
      }

      if (cancelled) return;
      const storageKey = `campus-commons-demo-v1:${key}`;
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          const data = JSON.parse(saved);

          if (data.events) setEvents(data.events);
          if (data.tickets) setTickets(data.tickets);
          if (data.checkedIn) setCheckedIn(data.checkedIn);
          if (data.commitments) setCommitments(data.commitments);
          if (data.tasks) setTasks(data.tasks);
          if (data.issues) setIssues(data.issues);
          if (data.products) setProducts(data.products);
          if (data.messages) setMessages(data.messages);
          if (data.announcements) setAnnouncements(data.announcements);
          if (data.shopItems) setShopItems(data.shopItems);
          if (data.cart) setCart(data.cart);
          if (data.councilIdeas) setCouncilIdeas(data.councilIdeas);
          if (data.theme) setTheme(data.theme);
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }

      if (remoteRecords.length) {
        const merge = <T,>(local: T[], remote: T[], keyFor: (item: T) => string) => [
          ...remote,
          ...local.filter((item) => !remote.some((value) => keyFor(value) === keyFor(item))),
        ];
        setEvents((current) => merge(current, remoteRecords.filter((row) => row.kind === "event").map((row) => row.payload as unknown as EventItem), (item) => item.title));
        setTasks((current) => merge(current, remoteRecords.filter((row) => row.kind === "task").map((row) => row.payload as unknown as TaskItem), (item) => item.title));
        setProducts((current) => merge(current, remoteRecords.filter((row) => row.kind === "listing").map((row) => row.payload as unknown as ProductItem), (item) => item.title));
        setIssues((current) => merge(current, remoteRecords.filter((row) => row.kind === "issue").map((row) => row.payload as unknown as IssueItem), (item) => item.title));
        setMessages((current) => merge(current, remoteRecords.filter((row) => row.kind === "chat_message").map((row) => row.payload as unknown as MessageItem), (item) => `${item.author}:${item.text}`));
        setTickets(remoteRecords.filter((row) => row.kind === "ticket" && row.created_by === key).map((row) => String(row.payload.title)));
        setCheckedIn(remoteRecords.filter((row) => row.kind === "checkin" && row.created_by === key).map((row) => String(row.payload.title)));
        setCommitments(remoteRecords.filter((row) => row.kind === "volunteer_application" && row.created_by === key).map((row) => String(row.payload.title)));
        setTickets((current) => [...new Set([...current, ...remoteRecords.filter((row) => row.kind === "vote" && row.created_by === key).map((row) => `VOTE:${String(row.payload.position)}`)])]);
      }
      setLoaded(true);
      setAuthPending(false);
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(
      `campus-commons-demo-v1:${profileId}`,
      JSON.stringify({ clubs, events, tickets, checkedIn, commitments, tasks, issues, products, messages, announcements, shopItems, cart, councilIdeas, theme })
    );
  }, [loaded, profileId, clubs, events, tickets, checkedIn, commitments, tasks, issues, products, messages, announcements, shopItems, cart, councilIdeas, theme]);

  const recordActivity = async (kind: string, payload: Record<string, unknown>) => {
    const supabase = getSupabase();
    if (!supabase || isPreview) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from("campus_records").insert({ kind, payload, created_by: user.id });
      if (error) notify(`Cloud sync: ${error.message}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sync error";
      notify(`Sync issue: ${msg}`);
    }
  };

  const switchPreviewRole = (newRole: CampusRole) => {
    setRole(newRole);
    const profile = roleProfiles[newRole];
    setDisplayName(profile.name);
    window.localStorage.setItem("campus-commons-preview-role", newRole);
    setProfileId(`preview:${newRole}`);
    notify(`Switched workspace to: ${newRole} (${profile.name})`);
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try { await supabase.auth.signOut(); } catch {}
    }
    window.localStorage.removeItem("campus-commons-preview-role");
    window.location.replace("/login");
  };

  const canCreateEvents = role === "Admin";
  const canManageTasks = role === "Admin" || role === "Student Council";
  const canListMarketplace = ["Student", "Club Leader", "Student Council", "Admin"].includes(role);
  const canModerateIssues = ["Faculty", "Student Council", "Admin"].includes(role);
  const canPublishAnnouncements = role === "Admin" || role === "Student Council";
  const canAdminister = role === "Admin";
  const canManage = canCreateEvents;

  const totalVolunteerHours = 8 + commitments.length * 3;
  const totalPoints = 120 + commitments.length * 40 + tickets.length * 20;

  const handleTicketClick = (event: EventItem) => {
    if (tickets.includes(event.title)) {
      setModal({ type: "ticket", event });
    } else {
      setTickets((cur) => [...cur, event.title]);
      setEvents((cur) => cur.map((e) => (e.title === event.title ? { ...e, going: e.going + 1 } : e)));
      void recordActivity("ticket", { title: event.title });
      setModal({ type: "ticket", event });
      notify(`RSVP confirmed for “${event.title}”!`);
    }
  };

  const handleCheckIn = (title: string) => {
    if (checkedIn.includes(title)) {
      notify("This ticket has already been checked in.");
      return;
    }
    setCheckedIn((cur) => [...cur, title]);
    void recordActivity("checkin", { title });
    notify("Entrance check-in validated! Attendee marked present.");
  };

  const handleVolunteerApply = (opp: VolunteerOpportunity) => {
    if (commitments.includes(opp.title)) {
      notify(`You are already confirmed for “${opp.title}”.`);
      return;
    }
    setCommitments((cur) => [...cur, opp.title]);
    setVolunteerOpportunities((cur) =>
      cur.map((o) => (o.title === opp.title ? { ...o, spots: Math.max(0, o.spots - 1), need: `${Math.max(0, o.spots - 1)} SPOTS LEFT` } : o))
    );
    void recordActivity("volunteer_application", { title: opp.title });
    notify(`You're confirmed for “${opp.title}”! +40 points earned.`);
  };

  const onPostOpportunity = (opp: VolunteerOpportunity) => {
    setVolunteerOpportunities((cur) => [opp, ...cur]);
    void recordActivity("volunteer_application", { title: opp.title, role: "organizer_post" });
    notify(`Volunteer drive “${opp.title}” published across campus!`);
  };

  const submitInline = (kind: Section) => {
    const text = formText.trim();
    if (!text) return;

    if (kind === "Events") {
      const defaultHost = role === "Student Council" ? "Student Council" : "Design Society";
      const newEv: EventItem = {
        title: text,
        club: formExtra || defaultHost,
        date: formExtra2 || "30",
        month: "OCT",
        time: "4:00 PM",
        place: "Student Commons",
        type: "CAMPUS EVENT",
        color: role === "Student Council" ? "lilac" : "mint",
        going: 1,
      };
      setEvents((cur) => [newEv, ...cur]);
      void recordActivity("event", newEv as unknown as Record<string, unknown>);
      notify(`Event “${text}” created!`);
    }

    if (kind === "Tasks") {
      const defaultTeam = role === "Student Council" ? "Student Council" : "Design Society";
      const newTask: TaskItem = { title: text, team: formExtra || defaultTeam, done: false };
      setTasks((cur) => [newTask, ...cur]);
      void recordActivity("task", newTask as unknown as Record<string, unknown>);
      notify(`Task added to team board.`);
    }

    if (kind === "Help desk") {
      const ticketNum = `CC-${String(2400 + issues.length + 1)}`;
      const isCouncilOrAdmin = role === "Student Council" || role === "Admin" || role === "Faculty";
      const newIssue: IssueItem = {
        id: ticketNum,
        title: text,
        category: (formExtra || (isCouncilOrAdmin ? "STUDENT WELFARE" : "CAMPUS LIFE")).toUpperCase(),
        status: isCouncilOrAdmin ? "Assigned" : "Open",
        votes: 1,
        submittedBy: displayName,
      };
      setIssues((cur) => [newIssue, ...cur]);
      void recordActivity("issue", newIssue as unknown as Record<string, unknown>);
      notify(
        isCouncilOrAdmin
          ? `Official council ticket ${ticketNum} logged.`
          : `Issue ${ticketNum} submitted to Student Council.`
      );
    }

    if (kind === "Marketplace") {
      const priceVal = Number(formExtra) || 250;
      const newProd: ProductItem = { title: text, seller: displayName, price: priceVal, emoji: "📦" };
      setProducts((cur) => [newProd, ...cur]);
      void recordActivity("listing", newProd as unknown as Record<string, unknown>);
      notify(`Listing added for ₹${priceVal}.`);
    }

    if (kind === "Messages") {
      const newMsg: MessageItem = { channel: activeChannel, author: displayName, text, time: "Just now" };
      setMessages((cur) => [...cur, newMsg]);
      void recordActivity("chat_message", newMsg as unknown as Record<string, unknown>);
    }

    setFormText("");
    setFormExtra("");
    setFormExtra2("");
  };

  const upvoteIssue = (index: number) => {
    const issue = issues[index];
    setIssues((cur) => cur.map((it, i) => (i === index ? { ...it, votes: it.votes + 1 } : it)));
    void recordActivity("issue_support", { title: issue.title });
    notify(`Upvoted “${issue.title}”`);
  };

  const cycleIssueStatus = (index: number) => {
    const statuses = ["Open", "In review", "Assigned", "Resolved"];
    setIssues((cur) =>
      cur.map((it, i) => {
        if (i !== index) return it;
        const nextIdx = (statuses.indexOf(it.status) + 1) % statuses.length;
        return { ...it, status: statuses[nextIdx] };
      })
    );
    notify(`Issue status updated.`);
  };

  const deleteIssue = (index: number) => {
    setIssues((cur) => cur.filter((_, i) => i !== index));
    notify("Issue removed.");
  };

  const supportCouncilIdea = (index: number) => {
    setCouncilIdeas((cur) =>
      cur.map((it, i) => {
        if (i !== index) return it;
        const nextSupported = !it.supported;
        return {
          ...it,
          supported: nextSupported,
          votes: nextSupported ? it.votes + 1 : Math.max(1, it.votes - 1),
        };
      })
    );
    void recordActivity("issue_support", { title: councilIdeas[index].title });
    notify(`Updated support for “${councilIdeas[index].title}”`);
  };

  const cycleIdeaStatus = (index: number) => {
    const statuses = ["Gathering support", "In review", "On Senate Agenda", "Adopted & Funded"];
    setCouncilIdeas((cur) =>
      cur.map((it, i) => {
        if (i !== index) return it;
        const curIdx = statuses.indexOf(it.meta);
        const nextIdx = (curIdx + 1) % statuses.length;
        return { ...it, meta: statuses[nextIdx] };
      })
    );
    notify("Proposal status updated on Council agenda.");
  };

  const publishAnnouncement = () => {
    const body = announcementText.trim();
    if (!body) return;
    const newAnn: AnnouncementItem = {
      title: body.length > 45 ? `${body.slice(0, 42)}…` : body,
      audience: announcementAudience.toUpperCase(),
      date: `Just now · ${displayName}`,
      body,
    };
    setAnnouncements((cur) => [newAnn, ...cur]);
    void recordActivity("announcement", newAnn as unknown as Record<string, unknown>);
    setAnnouncementText("");
    notify("Announcement broadcasted across campus channels!");
  };

  const addToCart = (item: ShopItem) => {
    if (item.stock <= 0) {
      notify("Item is sold out.");
      return;
    }
    setShopItems((cur) => cur.map((it) => (it.name === item.name ? { ...it, stock: it.stock - 1 } : it)));
    setCart((cur) => {
      const existing = cur.find((c) => c.name === item.name);
      if (existing) {
        return cur.map((c) => (c.name === item.name ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...cur, { name: item.name, club: item.club, price: item.price, qty: 1 }];
    });
    notify(`Added ${item.name} to order.`);
  };

  const askAboutProduct = (product: ProductItem) => {
    setActiveChannel(product.seller.includes("Society") ? "Design Society" : product.seller.includes("Robotics") ? "Robotics & AI" : "Student Council");
    setSection("Messages");
    setFormText(`Hi! Is "${product.title}" still available?`);
    notify(`Inquiry drafted in ${product.seller} chat.`);
  };

  if (authPending) {
    return (
      <main className="auth-loading" suppressHydrationWarning>
        <span className="brand-mark">c</span>
        <p>Getting your campus ready…</p>
      </main>
    );
  }

  const srsSections: Section[] = ["College portal", "Membership", "Announcements", "Club shop", "Achievements", "Club dashboard"];
  const isSrsFrontend = srsSections.includes(section);
  const activeChannelMessages = messages.filter((m) => m.channel === activeChannel || (!m.channel && activeChannel === "Student Council"));

  return (
    <main className="app-shell" suppressHydrationWarning>
      <Sidebar
        section={section}
        setSection={setSection}
        role={role}
        displayName={displayName}
        signOut={signOut}
        approvalCount={clubWorkspace.data.requests.filter((r) => canReview(clubWorkspace.actor, r) || role === "Student Council" && r.status === "approved_funding").length}
        eventCount={events.length}
      />

      <section className="main-area">
        <Topbar
          section={section}
          role={role}
          isPreview={isPreview}
          displayName={displayName}
          switchPreviewRole={switchPreviewRole}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          signOut={signOut}
          autoAccept={clubWorkspace.data.autoAccept}
          setAutoAccept={(enabled) => void clubWorkspace.setAutoAccept(enabled)}
          clubsBusy={clubWorkspace.loading || clubWorkspace.busy}
        />

        {role !== "Student" && <div className="approval-inbox-banner"><button onClick={() => setSection("Approvals")}>Open my approval inbox <strong>{clubWorkspace.data.requests.filter((r) => canReview(clubWorkspace.actor, r) || role === "Student Council" && r.status === "approved_funding").length} awaiting action</strong></button><span>Requests move to the next authority after each approval.</span></div>}

        {notifOpen && (
          <NotificationPopover
            events={events}
            announcements={announcements}
            tasks={tasks}
            setNotifOpen={setNotifOpen}
          />
        )}

        {!isSrsFrontend && (
          <div className="content-wrap">
            {section === "Overview" && (
              <OverviewModule
                role={role}
                displayName={displayName}
                totalVolunteerHours={totalVolunteerHours}
                totalPoints={totalPoints}
                setSection={setSection}
                events={events}
                handleTicketClick={handleTicketClick}
                memberships={joinedMemberships}
                commitments={commitments}
                notify={notify}
              />
            )}

            {(section === "Discover clubs" || section === "My Clubs") && (
              <ClubsModule key={`${section}:${selectedClub}:${role}`} workspace={clubWorkspace} selectedClub={selectedClub} openClub={openClub} view={section} role={role} />
            )}

            {section === "Events" && (
              ["Club Leader", "Faculty"].includes(role) ? <GovernanceModule key={role} workspace={clubWorkspace} /> : <EventsModule
                events={events}
                canManage={canManage}
                formText={formText}
                setFormText={setFormText}
                formExtra={formExtra}
                setFormExtra={setFormExtra}
                formExtra2={formExtra2}
                setFormExtra2={setFormExtra2}
                submitInline={submitInline}
                tickets={tickets}
                checkedIn={checkedIn}
                handleTicketClick={handleTicketClick}
                handleCheckIn={handleCheckIn}
                setSection={setSection}
                notify={notify}
                role={role}
              />
            )}

            {section === "Volunteers" && (
              ["Club Leader", "Faculty"].includes(role) ? <GovernanceModule key={role} workspace={clubWorkspace} /> : <VolunteersModule
                totalVolunteerHours={totalVolunteerHours}
                totalPoints={totalPoints}
                volunteerTab={volunteerTab}
                setVolunteerTab={setVolunteerTab}
                volunteerOpportunities={volunteerOpportunities}
                commitments={commitments}
                handleVolunteerApply={handleVolunteerApply}
                role={role}
                onPostOpportunity={onPostOpportunity}
              />
            )}

            {section === "Tasks" && (
              ["Club Leader", "Faculty"].includes(role) ? <GovernanceModule key={role} workspace={clubWorkspace} /> : <TasksModule
                tasks={tasks}
                setTasks={setTasks}
                canManageTasks={canManageTasks}
                formText={formText}
                setFormText={setFormText}
                formExtra={formExtra}
                setFormExtra={setFormExtra}
                submitInline={submitInline}
                role={role}
              />
            )}

            {section === "Marketplace" && (
              <MarketplaceModule
                products={products}
                canListMarketplace={canListMarketplace}
                formText={formText}
                setFormText={setFormText}
                formExtra={formExtra}
                setFormExtra={setFormExtra}
                submitInline={submitInline}
                askAboutProduct={askAboutProduct}
              />
            )}

            {section === "Messages" && (
              <MessagesModule
                activeChannel={activeChannel}
                setActiveChannel={setActiveChannel}
                activeChannelMessages={activeChannelMessages}
                displayName={displayName}
                formText={formText}
                setFormText={setFormText}
                submitInline={submitInline}
                notify={notify}
              />
            )}

            {section === "Help desk" && (
              <HelpDeskModule
                formText={formText}
                setFormText={setFormText}
                formExtra={formExtra}
                setFormExtra={setFormExtra}
                submitInline={submitInline}
                issues={issues}
                canModerateIssues={canModerateIssues}
                cycleIssueStatus={cycleIssueStatus}
                upvoteIssue={upvoteIssue}
                deleteIssue={deleteIssue}
                role={role}
                displayName={displayName}
              />
            )}

            {(section === "Finance" || section === "Approvals") && (
              section === "Finance" ? <FinanceModule key={role} workspace={clubWorkspace} /> : <GovernanceModule key={role} workspace={clubWorkspace} />
            )}

            {section === "Council" && (
              role === "Student Council" ? <GovernanceModule key={role} workspace={clubWorkspace} /> : <CouncilModule
                setSection={setSection}
                setModal={setModal}
                councilIdeas={councilIdeas}
                supportCouncilIdea={supportCouncilIdea}
                role={role}
                cycleIdeaStatus={cycleIdeaStatus}
              />
            )}

            {section === "Elections" && (
              <ElectionsModule
                tickets={tickets}
                setTickets={setTickets}
                recordActivity={recordActivity}
                notify={notify}
              />
            )}

            {section === "Administration" && canAdminister && (
              <AdministrationModule
                profiles={profiles}
                setProfiles={setProfiles}
                adminSearch={adminSearch}
                setAdminSearch={setAdminSearch}
                profileId={profileId}
                notify={notify}
              />
            )}
          </div>
        )}

        {isSrsFrontend && (
          <div className="content-wrap srs-frontends">
            {section === "College portal" && (
              <CollegePortalModule
                announcements={announcements}
                setSection={setSection}
                setModal={setModal}
                notify={notify}
              />
            )}

            {section === "Membership" && (
              <ClubsModule key={`memberships:${selectedClub}:${role}`} workspace={clubWorkspace} selectedClub={selectedClub} openClub={openClub} view="My Clubs" role={role} />
            )}

            {section === "Announcements" && (
              ["Club Leader", "Faculty"].includes(role) ? <GovernanceModule key={role} workspace={clubWorkspace} /> : <AnnouncementsModule
                announcements={announcements}
                canPublishAnnouncements={canPublishAnnouncements}
                announcementText={announcementText}
                setAnnouncementText={setAnnouncementText}
                announcementAudience={announcementAudience}
                setAnnouncementAudience={setAnnouncementAudience}
                role={role}
                publishAnnouncement={publishAnnouncement}
                notify={notify}
              />
            )}

            {section === "Club shop" && (
              <ClubShopModule
                shopItems={shopItems}
                shopFilter={shopFilter}
                setShopFilter={setShopFilter}
                cart={cart}
                addToCart={addToCart}
                setModal={setModal}
                setSection={setSection}
              />
            )}

            {section === "Achievements" && (
              <AchievementsModule
                displayName={displayName}
                memberships={joinedMemberships}
                totalPoints={totalPoints}
                totalVolunteerHours={totalVolunteerHours}
                tickets={tickets}
                products={products}
                leaderboard={leaderboard}
                setLeaderboard={setLeaderboard}
                setModal={setModal}
                notify={notify}
              />
            )}

            {section === "Club dashboard" && (
              <GovernanceModule key={role} workspace={clubWorkspace} />
            )}
          </div>
        )}

        <footer className="app-footer">
          <span>CAMPUS.COMMONS</span>
          <span>MADE FOR THE PEOPLE WHO MAKE CAMPUS.</span>
          <button onClick={() => notify("You’re on the latest verified release of Campus Commons.")}>
            A LITTLE MORE HUMAN <b>↗</b>
          </button>
        </footer>
      </section>

      {toast && (
        <div className="toast">
          <span>✦</span>
          {toast}
          <button onClick={() => setToast("")}>×</button>
        </div>
      )}

      <ModalProvider
        modal={modal}
        setModal={setModal}
        checkedIn={checkedIn}
        handleCheckIn={handleCheckIn}
        setClubs={setClubs}
        setCouncilIdeas={setCouncilIdeas}
        cart={cart}
        setCart={setCart}
        displayName={displayName}
        setDisplayName={setDisplayName}
        recordActivity={recordActivity}
        notify={notify}
      />
    </main>
  );
}
