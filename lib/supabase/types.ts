export type CampusRole = "Student" | "Club Leader" | "Faculty" | "Student Council" | "Admin";

export type Section =
  | "Overview"
  | "College portal"
  | "Discover clubs"
  | "My Clubs"
  | "Events"
  | "Membership"
  | "Volunteers"
  | "Tasks"
  | "Club dashboard"
  | "Club shop"
  | "Marketplace"
  | "Messages"
  | "Help desk"
  | "Finance"
  | "Approvals"
  | "Announcements"
  | "Achievements"
  | "Council"
  | "Elections"
  | "Administration";

export type Club = {
  name: string;
  category: string;
  members: string;
  color: string;
  icon: string;
  description: string;
  next: string;
};

export type EventItem = {
  title: string;
  club: string;
  date: string;
  month: string;
  time: string;
  place: string;
  type: string;
  color: string;
  going: number;
};

export type TaskItem = {
  title: string;
  team: string;
  done: boolean;
};

export type IssueItem = {
  id?: string;
  title: string;
  category: string;
  status: string;
  votes: number;
  assignedTo?: string;
  submittedBy?: string;
  resolutionNote?: string;
};

export type ProductItem = {
  title: string;
  seller: string;
  price: number;
  emoji: string;
};

export type MessageItem = {
  channel: string;
  author: string;
  text: string;
  time?: string;
};

export type MembershipItem = {
  club: string;
  status: "ACTIVE" | "RENEW SOON" | "PENDING";
  dues: string;
  color: string;
  icon: string;
};

export type AnnouncementItem = {
  title: string;
  audience: string;
  date: string;
  body: string;
  pinned?: boolean;
};

export type ShopItem = {
  name: string;
  club: string;
  price: number;
  stock: number;
  variant: string;
  color: string;
  emoji: string;
};

export type FinanceEntry = {
  what: string;
  club: string;
  date: string;
  amt: string;
  type: "in" | "out";
};

export type VolunteerOpportunity = {
  icon: string;
  title: string;
  org: string;
  detail: string;
  need: string;
  color: string;
  spots: number;
};

export type ModalState =
  | { type: "ticket"; event: EventItem }
  | { type: "start_club" }
  | { type: "share_idea" }
  | { type: "campus_details" }
  | { type: "election_rules" }
  | { type: "membership_benefits"; club: string }
  | { type: "public_club_preview" }
  | { type: "cart" }
  | { type: "edit_profile" }
  | null;
