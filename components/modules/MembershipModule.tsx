"use client";

import React from "react";
import { ModulePage } from "../ui/ModulePage";
import type { MembershipItem, ModalState } from "../../lib/supabase/types";

interface MembershipModuleProps {
  memberships: MembershipItem[];
  setModal: (m: ModalState) => void;
  handlePayDues: (clubName: string) => void;
  notify: (msg: string) => void;
}

export function MembershipModule({
  memberships,
  setModal,
  handlePayDues,
  notify,
}: MembershipModuleProps) {
  const activeCount = memberships.filter((m) => m.status === "ACTIVE").length;

  return (
    <ModulePage
      eyebrow="YOUR CAMPUS CIRCLE"
      title={
        <>
          Membership that
          <br />
          <em>opens doors.</em>
        </>
      }
      subtitle="Keep track of dues, benefits and the clubs you want to grow with."
    >
      <div className="membership-hero">
        <div>
          <span className="membership-icon">♧</span>
          <p className="eyebrow">YOUR MEMBERSHIP HEALTH</p>
          <h2>{activeCount} active memberships</h2>
          <p>Members get early access, member ticket pricing and a closer seat in the club community.</p>
        </div>
        <div className="membership-ring">
          <b>{String(activeCount).padStart(2, "0")}</b>
          <small>ACTIVE</small>
        </div>
      </div>
      <div className="membership-grid">
        {memberships.map((item) => (
          <article className="membership-card" key={item.club}>
            <div className={`membership-cover ${item.color}`}>
              <span>{item.icon}</span>
              <small>{item.status}</small>
            </div>
            <div className="membership-body">
              <h3>{item.club}</h3>
              <p>{item.dues}</p>
              <div className="benefit-list">
                <span>✓ Member ticket pricing</span>
                <span>✓ Members-only updates</span>
              </div>
              <button
                className={item.status === "ACTIVE" ? "soft-button" : "primary-button"}
                onClick={() => {
                  if (item.status === "ACTIVE") {
                    setModal({ type: "membership_benefits", club: item.club });
                  } else {
                    handlePayDues(item.club);
                  }
                }}
              >
                {item.status === "ACTIVE"
                  ? "VIEW BENEFITS ↗"
                  : item.status === "RENEW SOON"
                  ? "RENEW DUES ₹250 ↗"
                  : "PAY DUES ₹250 ↗"}
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="membership-note">
        <span>✳</span>
        <p>
          <b>Membership is more than a payment.</b> It helps clubs plan better events, buy better materials and keep the door open.
        </p>
        <button onClick={() => notify("Membership reminder scheduled for next term.")}>
          REMIND ME LATER ↗
        </button>
      </div>
    </ModulePage>
  );
}
