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
import { DiscoverClubsModule } from "../../components/modules/DiscoverClubsModule";
import { EventsModule } from "../../components/modules/EventsModule";
import { VolunteersModule } from "../../components/modules/VolunteersModule";
import { TasksModule } from "../../components/modules/TasksModule";
import { MarketplaceModule } from "../../components/modules/MarketplaceModule";
import { MessagesModule } from "../../components/modules/MessagesModule";
import { HelpDeskModule } from "../../components/modules/HelpDeskModule";
import { FinanceModule } from "../../components/modules/FinanceModule";
import { CouncilModule } from "../../components/modules/CouncilModule";
import { ElectionsModule } from "../../components/modules/ElectionsModule";
import { AdministrationModule } from "../../components/modules/AdministrationModule";
import { CollegePortalModule } from "../../components/modules/CollegePortalModule";
import { MembershipModule } from "../../components/modules/MembershipModule";
import { AnnouncementsModule } from "../../components/modules/AnnouncementsModule";
import { ClubShopModule } from "../../components/modules/ClubShopModule";
import { AchievementsModule } from "../../components/modules/AchievementsModule";
import { ClubDashboardModule } from "../../components/modules/ClubDashboardModule";

const initialClubs: Club[] = [
  { name: "Design Society", category: "CREATIVE", members: "248 members", color: "lilac", icon: "🎨", description: "A home for curious minds, visual thinkers and makers who love turning ideas into something real.", next: "Poster Jam · Fri, 4:30 PM" },
  { name: "Robotics & AI", category: "TECHNOLOGY", members: "186 members", color: "mint", icon: "⌘", description: "Build intelligent machines, learn by doing and find a team for the next big challenge.", next: "Open Lab · Sat, 11:00 AM" },
  { name: "The Green Collective", category: "COMMUNITY", members: "312 members", color: "yellow", icon: "♧", description: "Small campus changes add up. Join hands on sustainability, gardens and cleaner spaces.", next: "Campus Garden · Sun, 9:00 AM" },
  { name: "Frame by Frame", category: "CULTURE", members: "124 members", color: "pink", icon: "◉", description: "For the people who see a story everywhere. Shoot, edit, screen and share together.", next: "Short Film Night · Tue, 6:00 PM" },
];

const initialEvents: EventItem[] = [
  { title: "Build Night: Make it matter", club: "Robotics & AI", date: "18", month: "OCT", time: "5:30 PM", place: "Innovation Lab", type: "WORKSHOP", color: "mint", going: 42 },
  { title: "The little things market", club: "Design Society", date: "21", month: "OCT", time: "11:00 AM", place: "Central Courtyard", type: "COMMUNITY", color: "lilac", going: 86 },
  { title: "Stories after sunset", club: "Frame by Frame", date: "25", month: "OCT", time: "6:00 PM", place: "Open-air Theatre", type: "SCREENING", color: "pink", going: 31 },
];

export default function Home() {
  const [section, setSection] = useState<Section>("Overview");
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL CLUBS");
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
  const [memberships, setMemberships] = useState<MembershipItem[]>([
    { club: "Design Society", status: "ACTIVE", dues: "Paid until Jun 2027", color: "lilac", icon: "🎨" },
    { club: "Robotics & AI", status: "RENEW SOON", dues: "Expires in 18 days", color: "mint", icon: "⌘" },
    { club: "The Green Collective", status: "PENDING", dues: "Dues: ₹250", color: "yellow", icon: "♧" },
  ]);
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
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([
    { what: "Workshop ticket sales", club: "Robotics & AI", date: "Oct 10", amt: "+ ₹ 12,400", type: "in" },
    { what: "Materials · build night", club: "Robotics & AI", date: "Oct 09", amt: "− ₹ 4,850", type: "out" },
    { what: "Market stall fees", club: "Design Society", date: "Oct 07", amt: "+ ₹ 8,000", type: "in" },
    { what: "Garden supplies", club: "Green Collective", date: "Oct 05", amt: "− ₹ 2,150", type: "out" },
  ]);
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [role, setRole] = useState<CampusRole>("Student");
  const [displayName, setDisplayName] = useState("Campus member");
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

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const supabase = getSupabase();
      let key = "preview";
      let remoteRecords: Array<{ id: string; kind: string; payload: Record<string, unknown>; created_by: string }> = [];
      const preview = typeof window !== "undefined" ? window.localStorage.getItem("campus-commons-preview-role") : null;

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
              setDisplayName("Maya Patel · Preview");
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
              setDisplayName("Maya Patel · Preview");
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
          setDisplayName("Maya Patel · Preview");
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
          if (data.clubs) setClubs(data.clubs);
          if (data.events) setEvents(data.events);
          if (data.tickets) setTickets(data.tickets);
          if (data.checkedIn) setCheckedIn(data.checkedIn);
          if (data.commitments) setCommitments(data.commitments);
          if (data.tasks) setTasks(data.tasks);
          if (data.issues) setIssues(data.issues);
          if (data.products) setProducts(data.products);
          if (data.messages) setMessages(data.messages);
          if (data.memberships) setMemberships(data.memberships);
          if (data.announcements) setAnnouncements(data.announcements);
          if (data.shopItems) setShopItems(data.shopItems);
          if (data.cart) setCart(data.cart);
          if (data.financeEntries) setFinanceEntries(data.financeEntries);
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
        const joined = new Set(remoteRecords.filter((row) => row.kind === "membership" && row.created_by === key).map((row) => String(row.payload.title)));
        if (joined.size) setClubs((current) => current.map((club) => (joined.has(club.name.replace(/^✓ /, "")) ? { ...club, name: `✓ ${club.name.replace(/^✓ /, "")}` } : club)));
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
      JSON.stringify({ clubs, events, tickets, checkedIn, commitments, tasks, issues, products, messages, memberships, announcements, shopItems, cart, financeEntries, councilIdeas, theme })
    );
  }, [loaded, profileId, clubs, events, tickets, checkedIn, commitments, tasks, issues, products, messages, memberships, announcements, shopItems, cart, financeEntries, councilIdeas, theme]);

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
    window.localStorage.setItem("campus-commons-preview-role", newRole);
    setProfileId(`preview:${newRole}`);
    notify(`Switched preview mode to: ${newRole}`);
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try { await supabase.auth.signOut(); } catch {}
    }
    window.localStorage.removeItem("campus-commons-preview-role");
    window.location.replace("/login");
  };

  const filteredClubs = useMemo(() => {
    return clubs.filter(
      (club) =>
        (filter === "ALL CLUBS" || club.category === filter) &&
        `${club.name} ${club.category} ${club.description}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [clubs, filter, search]);

  const canCreateEvents = ["Club Leader", "Faculty", "Student Council", "Admin"].includes(role);
  const canManageTasks = ["Club Leader", "Faculty", "Student Council", "Admin"].includes(role);
  const canListMarketplace = ["Student", "Club Leader", "Student Council", "Admin"].includes(role);
  const canModerateIssues = ["Faculty", "Student Council", "Admin"].includes(role);
  const canManageFinance = ["Club Leader", "Faculty", "Student Council", "Admin"].includes(role);
  const canPublishAnnouncements = role !== "Student";
  const canAdminister = role === "Admin";
  const canManage = canCreateEvents;

  const totalVolunteerHours = 8 + commitments.length * 3;
  const totalPoints = 120 + commitments.length * 40 + tickets.length * 20;

  const totalBalanceNumber = useMemo(() => {
    return financeEntries.reduce((sum, item) => {
      const num = parseInt(item.amt.replace(/[^0-9]/g, ""), 10) || 0;
      return item.type === "in" ? sum + num : sum - num;
    }, 248650);
  }, [financeEntries]);

  const toggleJoinClub = (name: string) => {
    const isJoined = clubs.some((c) => c.name === `✓ ${name}`);
    if (isJoined) {
      setClubs((current) => current.map((c) => (c.name === `✓ ${name}` ? { ...c, name } : c)));
      setMemberships((current) => current.filter((m) => m.club !== name));
      notify(`You left ${name}.`);
    } else {
      setClubs((current) => current.map((c) => (c.name === name ? { ...c, name: `✓ ${name}` } : c)));
      setMemberships((current) => [
        ...current.filter((m) => m.club !== name),
        { club: name, status: "ACTIVE", dues: "Paid until Jun 2027", color: "mint", icon: "✦" },
      ]);
      void recordActivity("membership", { title: name });
      notify(`You're in! ${name} added to your active memberships.`);
    }
  };

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
    notify("Demo QR validated! You are officially checked in.");
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

  const submitInline = (kind: Section) => {
    const text = formText.trim();
    if (!text) return;

    if (kind === "Events") {
      const newEv: EventItem = {
        title: text,
        club: formExtra || "Student Council",
        date: formExtra2 || "30",
        month: "OCT",
        time: "4:00 PM",
        place: "Student Commons",
        type: "CAMPUS EVENT",
        color: "mint",
        going: 1,
      };
      setEvents((cur) => [newEv, ...cur]);
      void recordActivity("event", newEv as unknown as Record<string, unknown>);
      notify(`Event “${text}” created!`);
    }

    if (kind === "Tasks") {
      const newTask: TaskItem = { title: text, team: formExtra || "Student Council", done: false };
      setTasks((cur) => [newTask, ...cur]);
      void recordActivity("task", newTask as unknown as Record<string, unknown>);
      notify(`Task added to team board.`);
    }

    if (kind === "Help desk") {
      const ticketNum = `CC-${String(2400 + issues.length + 1)}`;
      const newIssue: IssueItem = { id: ticketNum, title: text, category: (formExtra || "CAMPUS LIFE").toUpperCase(), status: "Open", votes: 1 };
      setIssues((cur) => [newIssue, ...cur]);
      void recordActivity("issue", newIssue as unknown as Record<string, unknown>);
      notify(`Issue ${ticketNum} submitted to Student Council.`);
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

    if (kind === "Finance") {
      const amtNum = Number(formExtra) || 1000;
      const isIncome = formExtra2 === "in";
      const newEntry: FinanceEntry = {
        what: text,
        club: "Student Council",
        date: "Today",
        amt: `${isIncome ? "+" : "−"} ₹ ${amtNum.toLocaleString("en-IN")}`,
        type: isIncome ? "in" : "out",
      };
      setFinanceEntries((cur) => [newEntry, ...cur]);
      void recordActivity("finance_entry", newEntry as unknown as Record<string, unknown>);
      notify(`Finance record added: ${newEntry.amt}`);
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

  const handlePayDues = (clubName: string) => {
    setMemberships((cur) =>
      cur.map((m) => (m.club === clubName ? { ...m, status: "ACTIVE", dues: "Paid until Jun 2027" } : m))
    );
    void recordActivity("membership", { club: clubName, dues: "Paid until Jun 2027" });
    notify(`Dues for ${clubName} received! Your benefits are active.`);
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
        setSearch={setSearch}
        role={role}
        displayName={displayName}
        signOut={signOut}
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
        />

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
                memberships={memberships}
                commitments={commitments}
                notify={notify}
              />
            )}

            {section === "Discover clubs" && (
              <DiscoverClubsModule
                search={search}
                setSearch={setSearch}
                filter={filter}
                setFilter={setFilter}
                filteredClubs={filteredClubs}
                toggleJoinClub={toggleJoinClub}
                setModal={setModal}
              />
            )}

            {section === "Events" && (
              <EventsModule
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
              />
            )}

            {section === "Volunteers" && (
              <VolunteersModule
                totalVolunteerHours={totalVolunteerHours}
                totalPoints={totalPoints}
                volunteerTab={volunteerTab}
                setVolunteerTab={setVolunteerTab}
                volunteerOpportunities={volunteerOpportunities}
                commitments={commitments}
                handleVolunteerApply={handleVolunteerApply}
              />
            )}

            {section === "Tasks" && (
              <TasksModule
                tasks={tasks}
                setTasks={setTasks}
                canManageTasks={canManageTasks}
                formText={formText}
                setFormText={setFormText}
                formExtra={formExtra}
                setFormExtra={setFormExtra}
                submitInline={submitInline}
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
              />
            )}

            {section === "Finance" && (
              <FinanceModule
                totalBalanceNumber={totalBalanceNumber}
                canManageFinance={canManageFinance}
                formText={formText}
                setFormText={setFormText}
                formExtra={formExtra}
                setFormExtra={setFormExtra}
                formExtra2={formExtra2}
                setFormExtra2={setFormExtra2}
                submitInline={submitInline}
                financeEntries={financeEntries}
                setSection={setSection}
                notify={notify}
              />
            )}

            {section === "Council" && (
              <CouncilModule
                setSection={setSection}
                setModal={setModal}
                councilIdeas={councilIdeas}
                supportCouncilIdea={supportCouncilIdea}
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
              <MembershipModule
                memberships={memberships}
                setModal={setModal}
                handlePayDues={handlePayDues}
                notify={notify}
              />
            )}

            {section === "Announcements" && (
              <AnnouncementsModule
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
                memberships={memberships}
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
              <ClubDashboardModule
                theme={theme}
                setTheme={setTheme}
                clubs={clubs}
                events={events}
                tasks={tasks}
                totalBalanceNumber={totalBalanceNumber}
                setModal={setModal}
                setSection={setSection}
                notify={notify}
              />
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
