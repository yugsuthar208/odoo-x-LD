import type { ClubRequest, ClubAccount, LedgerEntry } from "./governance";
export const campusClubs = [
  { id: "ieee", name: "IEEE", category: "TECHNOLOGY", icon: "⚡", description: "Explore electrical engineering, build circuits, and connect with the IEEE student community.", event: "Circuit design lab", place: "Electronics Lab", announcement: "Bring your breadboard to this week's circuit design lab." },
  { id: "singing", name: "Singing", category: "CULTURE", icon: "♫", description: "Find your voice through choir rehearsals, open mics, and collaborative performances.", event: "Acoustic open mic", place: "Music Room", announcement: "Sign up for a solo or duet at our next open mic." },
  { id: "dancing", name: "Dancing", category: "CULTURE", icon: "✦", description: "Learn new styles, choreograph together, and take the stage with our dance community.", event: "Contemporary dance workshop", place: "Dance Studio", announcement: "Wear comfortable clothes and bring water for rehearsal." },
  { id: "photography", name: "Photography", category: "CREATIVE", icon: "◉", description: "Tell campus stories through photo walks, editing sessions, and exhibitions.", event: "Golden hour photo walk", place: "Library Steps", announcement: "Phones and cameras are both welcome on our photo walk." },
  { id: "robotics", name: "Robotics", category: "TECHNOLOGY", icon: "⚙", description: "Design, build, and program robots with a team of curious makers.", event: "Line follower build night", place: "Innovation Lab", announcement: "Our build teams will share their sensor prototypes this week." },
  { id: "drama", name: "Drama", category: "CULTURE", icon: "🎭", description: "Explore acting, improvisation, stagecraft, and student theatre productions.", event: "Improv and stage workshop", place: "Black Box Theatre", announcement: "Auditions are open to beginners and experienced performers." },
  { id: "debate", name: "Debate", category: "COMMUNITY", icon: "❝", description: "Develop your arguments and public speaking through friendly debates and tournaments.", event: "Parliamentary debate practice", place: "Seminar Hall", announcement: "This week's motion will be revealed at practice." },
  { id: "coding", name: "Coding", category: "TECHNOLOGY", icon: "⌘", description: "Solve problems, build useful software, and learn together at coding jams and hackathons.", event: "Campus hack night", place: "Computer Lab", announcement: "Bring a laptop and an idea; teams will form at hack night." },
  { id: "design", name: "Design Society", category: "CREATIVE", icon: "✎", description: "Create thoughtful visual experiences through design critiques and collaborative projects.", event: "Poster jam", place: "Design Studio", announcement: "Share your poster draft for a friendly peer critique." },
  { id: "green", name: "Green Collective", category: "COMMUNITY", icon: "♧", description: "Make campus greener through gardening, sustainability projects, and community action.", event: "Campus garden morning", place: "Community Garden", announcement: "Gloves and tools are provided for our next garden morning." },
] as const;

export type ClubStatus = "pending" | "approved" | "rejected";
export type ClubMembership = { club_id: string; user_id: string; display_name: string; status: ClubStatus };
export type ClubEvent = { id: string; club_id: string; title: string; starts_at: string; location: string };
export type ClubAnnouncement = { id: string; club_id: string; title: string; body: string };
export type ClubRsvp = { event_id: string; user_id: string; club_id: string };
export type ClubData = { assignments: { club_id: string; user_id: string; role: "Faculty" | "Club Leader" }[]; staffProfiles: { id: string; full_name: string; role: string }[]; requests: ClubRequest[]; accounts: ClubAccount[]; ledger: LedgerEntry[]; facultyClubs: string[]; memberships: ClubMembership[]; events: ClubEvent[]; announcements: ClubAnnouncement[]; rsvps: ClubRsvp[]; adminClubs: string[]; autoAccept: boolean };
export const emptyClubData = (): ClubData => ({ assignments: [], staffProfiles: [], requests: [], accounts: [], ledger: [], facultyClubs: [], memberships: [], events: [], announcements: [], rsvps: [], adminClubs: [], autoAccept: false });
export const previewClubData = (): ClubData => ({
  ...emptyClubData(),
  assignments: ["ieee", "coding", "robotics", "design"].flatMap((club_id) => ([{ club_id, user_id: "preview:Faculty", role: "Faculty" as const }, { club_id, user_id: "preview:Club Leader", role: "Club Leader" as const }])),
  staffProfiles: [{ id: "preview:Faculty", full_name: "Dr. Sunita Sen", role: "Faculty" }, { id: "preview:Club Leader", full_name: "Maya Patel", role: "Club Leader" }],
  accounts: [{ id: "council", balance: 25_000_000 }, ...campusClubs.map((c) => ({ id: c.id, balance: 0 }))],
  ledger: [{ id: "preview-opening", account_id: "council", amount: 25_000_000, kind: "receipt", description: "Preview opening treasury", request_id: null, created_by: "preview:Student Council", created_at: "2026-10-03T00:00:00Z" }],
  events: campusClubs.map((club) => ({ id: `${club.id}-welcome`, club_id: club.id, title: club.event, starts_at: "2026-10-24T16:00:00+05:30", location: club.place })),
  announcements: campusClubs.map((club) => ({ id: `${club.id}-welcome`, club_id: club.id, title: `Welcome to ${club.name}`, body: club.announcement })),
});
