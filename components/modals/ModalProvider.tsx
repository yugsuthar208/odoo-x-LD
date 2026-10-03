"use client";

import React from "react";
import type { ModalState, EventItem, Club } from "../../lib/supabase/types";

interface ModalProviderProps {
  modal: ModalState;
  setModal: (m: ModalState) => void;
  checkedIn: string[];
  handleCheckIn: (title: string) => void;
  setClubs: React.Dispatch<React.SetStateAction<Club[]>>;
  setCouncilIdeas: React.Dispatch<React.SetStateAction<Array<{ title: string; cat: string; meta: string; votes: number; supported: boolean; color: string; icon: string }>>>;
  cart: Array<{ name: string; club: string; price: number; qty: number }>;
  setCart: (c: Array<{ name: string; club: string; price: number; qty: number }>) => void;
  displayName: string;
  setDisplayName: (n: string) => void;
  recordActivity: (kind: string, payload: Record<string, unknown>) => Promise<void>;
  notify: (msg: string) => void;
}

export function ModalProvider({
  modal,
  setModal,
  checkedIn,
  handleCheckIn,
  setClubs,
  setCouncilIdeas,
  cart,
  setCart,
  displayName,
  setDisplayName,
  recordActivity,
  notify,
}: ModalProviderProps) {
  if (!modal) return null;

  return (
    <div className="modal-backdrop" onClick={() => setModal(null)}>
      <section className="ticket-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setModal(null)}>
          ×
        </button>

        {modal.type === "ticket" && (
          <>
            <div className="modal-spark">✳</div>
            <p className="eyebrow">YOUR DIGITAL PASS</p>
            <h2>That’s a plan.</h2>
            <p>Your spot for “{modal.event.title}” is confirmed. Present this pass at check-in.</p>
            <div className="ticket-stub">
              <span>NORTHSTAR UNIVERSITY · {modal.event.club.toUpperCase()}</span>
              <b>{modal.event.title}</b>
              <small>
                {modal.event.date} {modal.event.month} ’26 · {modal.event.time} · {modal.event.place}
              </small>
              <div className="ticket-qr-large">▦</div>
            </div>
            <button
              className="modal-done"
              onClick={() => {
                handleCheckIn(modal.event.title);
                setModal(null);
              }}
            >
              {checkedIn.includes(modal.event.title) ? "CHECKED IN ✓" : "CONFIRM & CHECK IN ↗"}
            </button>
          </>
        )}

        {modal.type === "start_club" && (
          <>
            <div className="modal-spark">✎</div>
            <p className="eyebrow">NEW CLUB PROPOSAL</p>
            <h2>Start something good.</h2>
            <p>Tell us what your club is about. We’ll help you find your founding members.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const nameInput = form.elements.namedItem("clubName") as HTMLInputElement;
                const catInput = form.elements.namedItem("clubCategory") as HTMLSelectElement;
                const descInput = form.elements.namedItem("clubDesc") as HTMLInputElement;
                const newClub: Club = {
                  name: nameInput.value.trim(),
                  category: catInput.value,
                  members: "1 member",
                  color: "mint",
                  icon: "✳",
                  description: descInput.value.trim(),
                  next: "Inaugural meeting coming soon",
                };
                setClubs((cur) => [newClub, ...cur]);
                void recordActivity("announcement", { title: `New club proposed: ${newClub.name}` });
                setModal(null);
                notify(`Club “${newClub.name}” submitted to Student Council!`);
              }}
            >
              <input name="clubName" placeholder="Club name (e.g. Astronomy Society)" required />
              <select name="clubCategory" style={{ height: 39, border: "1px solid #e4e6dc", borderRadius: 5, padding: "0 10px" }}>
                <option value="CREATIVE">CREATIVE</option>
                <option value="TECHNOLOGY">TECHNOLOGY</option>
                <option value="COMMUNITY">COMMUNITY</option>
                <option value="CULTURE">CULTURE</option>
              </select>
              <input name="clubDesc" placeholder="Short description of what members do" required />
              <button type="submit">SEND WITH CARE ↗</button>
            </form>
          </>
        )}

        {modal.type === "share_idea" && (
          <>
            <div className="modal-spark">♡</div>
            <p className="eyebrow">VOICE & CAMPUS SPACES</p>
            <h2>Share an idea.</h2>
            <p>Every good campus change starts with someone speaking up. The council will review it.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const ideaInput = form.elements.namedItem("ideaTitle") as HTMLInputElement;
                const catSelect = form.elements.namedItem("ideaCat") as HTMLSelectElement;
                const newIdea = {
                  title: ideaInput.value.trim(),
                  cat: catSelect.value,
                  meta: "New today",
                  votes: 1,
                  supported: true,
                  color: "mint",
                  icon: "✳",
                };
                setCouncilIdeas((cur) => [newIdea, ...cur]);
                void recordActivity("issue", { title: newIdea.title, category: newIdea.cat });
                setModal(null);
                notify("Your idea has been posted to Council Voice!");
              }}
            >
              <input name="ideaTitle" placeholder="What’s on your mind? (e.g. More bicycle stands)" required />
              <select name="ideaCat" style={{ height: 39, border: "1px solid #e4e6dc", borderRadius: 5, padding: "0 10px" }}>
                <option value="CAMPUS SPACES">CAMPUS SPACES</option>
                <option value="STUDENT LIFE">STUDENT LIFE</option>
                <option value="FOOD & WELLBEING">FOOD & WELLBEING</option>
              </select>
              <button type="submit">SUBMIT PROPOSAL ↗</button>
            </form>
          </>
        )}

        {modal.type === "campus_details" && (
          <>
            <div className="modal-spark">⌂</div>
            <p className="eyebrow">NORTHSTAR DIRECTORY</p>
            <h2>Campus handbook.</h2>
            <div style={{ textAlign: "left", fontSize: 11, color: "#616b60", margin: "16px 0", lineHeight: 1.8 }}>
              <p><b>Student Affairs Desk:</b> Central Commons, Room 104 (Mon–Fri 9 AM – 5 PM)</p>
              <p><b>Campus Helpline:</b> +91 (080) 4123-5500 · helpdesk@northstar.edu</p>
              <p><b>Quiet Study Spaces:</b> West Wing Library (Fl 3) & Studio Courtyard</p>
              <p><b>Campus Health & Care:</b> Wellness Center, Block C · Ext: 204</p>
            </div>
            <button className="modal-done" onClick={() => setModal(null)}>CLOSE HANDBOOK ↗</button>
          </>
        )}

        {modal.type === "election_rules" && (
          <>
            <div className="modal-spark">◎</div>
            <p className="eyebrow">STUDENT ELECTIONS · 2026</p>
            <h2>Election guidelines.</h2>
            <div style={{ textAlign: "left", fontSize: 11, color: "#616b60", margin: "16px 0", lineHeight: 1.8 }}>
              <p><b>Nominations:</b> Open Oct 26 to Oct 30 for all enrolled students with GPA &gt; 2.5.</p>
              <p><b>Campaign Period:</b> Nov 2 to Nov 7 in accordance with campus poster policies.</p>
              <p><b>Voting:</b> Single non-transferable vote per position. Authenticated and auditable.</p>
            </div>
            <button className="modal-done" onClick={() => setModal(null)}>UNDERSTOOD ↗</button>
          </>
        )}

        {modal.type === "membership_benefits" && (
          <>
            <div className="modal-spark">♧</div>
            <p className="eyebrow">{modal.club.toUpperCase()} BENEFITS</p>
            <h2>Active perks.</h2>
            <div style={{ textAlign: "left", fontSize: 11, color: "#616b60", margin: "16px 0", lineHeight: 1.8 }}>
              <p>✓ Priority seating & RSVP for workshops and screenings.</p>
              <p>✓ 20% discount on official merchandise in the Club Shop.</p>
              <p>✓ Access to private club chat channels and resource library.</p>
              <p>✓ Voting rights at annual club leadership elections.</p>
            </div>
            <button className="modal-done" onClick={() => setModal(null)}>SWEET ↗</button>
          </>
        )}

        {modal.type === "public_club_preview" && (
          <>
            <div className="modal-spark">✳</div>
            <p className="eyebrow">LIVE PREVIEW</p>
            <h2>Design Society</h2>
            <p style={{ fontStyle: "italic", margin: "12px 0", color: "#546e53" }}>
              “We make the ordinary more considered. Posters, products, workshops and good reasons to stay curious.”
            </p>
            <div style={{ background: "#edf3e9", padding: 12, borderRadius: 6, fontSize: 10, textAlign: "left" }}>
              <p><b>Upcoming:</b> Poster Jam · Fri, 4:30 PM (Studio 2)</p>
              <p><b>Leadership:</b> Maya Patel (Lead), Arjun Rao (Visuals)</p>
              <p><b>Members:</b> 248 active thinkers & makers</p>
            </div>
            <button className="modal-done" onClick={() => setModal(null)} style={{ marginTop: 14 }}>EXIT PREVIEW ↗</button>
          </>
        )}

        {modal.type === "cart" && (
          <>
            <div className="modal-spark">▤</div>
            <p className="eyebrow">YOUR MERCH BAG</p>
            <h2>Order summary.</h2>
            <div style={{ margin: "14px 0", textAlign: "left" }}>
              {cart.map((c, i) => (
                <div key={i} className="cart-item">
                  <span>{c.name} ({c.club}) × {c.qty}</span>
                  <b>₹ {(c.price * c.qty).toLocaleString("en-IN")}</b>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontWeight: 700, fontSize: 12 }}>
                <span>Total:</span>
                <span>₹ {cart.reduce((s, c) => s + c.price * c.qty, 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
            <button
              className="modal-done"
              onClick={() => {
                setCart([]);
                setModal(null);
                notify("Demo order placed! Pick up your merchandise at the student store.");
              }}
            >
              CONFIRM & PLACE ORDER ↗
            </button>
          </>
        )}

        {modal.type === "edit_profile" && (
          <>
            <div className="modal-spark">✹</div>
            <p className="eyebrow">STUDENT PROFILE</p>
            <h2>Edit your details.</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem("userName") as HTMLInputElement;
                const val = input.value.trim();
                if (val) {
                  setDisplayName(val);
                  notify(`Profile name updated to ${val}!`);
                }
                setModal(null);
              }}
            >
              <input name="userName" defaultValue={displayName} placeholder="Your display name" required />
              <button type="submit">SAVE PROFILE ↗</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
