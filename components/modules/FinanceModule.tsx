"use client";

import React from "react";
import type { FinanceEntry, Section } from "../../lib/supabase/types";

interface FinanceModuleProps {
  totalBalanceNumber: number;
  canManageFinance: boolean;
  formText: string;
  setFormText: (s: string) => void;
  formExtra: string;
  setFormExtra: (s: string) => void;
  formExtra2: string;
  setFormExtra2: (s: string) => void;
  submitInline: (k: Section) => void;
  financeEntries: FinanceEntry[];
  setSection: (s: Section) => void;
  notify: (msg: string) => void;
}

export function FinanceModule({
  totalBalanceNumber,
  canManageFinance,
  formText,
  setFormText,
  formExtra,
  setFormExtra,
  formExtra2,
  setFormExtra2,
  submitInline,
  financeEntries,
  setSection,
  notify,
}: FinanceModuleProps) {
  return (
    <>
      <div className="page-heading finance-heading">
        <div>
          <p className="eyebrow">THE NUMBERS, MADE HUMAN</p>
          <h1>
            Good work has
            <br />
            <em>a clear ledger.</em>
          </h1>
          <p className="welcome-copy">A transparent view of how your campus clubs make things happen.</p>
        </div>
        <div className="finance-mark">
          ₹<span>✦</span>
        </div>
      </div>
      <div className="finance-summary">
        <article className="balance-card">
          <p className="eyebrow">CAMPUS ORGANIZATIONS · THIS TERM</p>
          <span className="balance-label">Total available</span>
          <strong>₹ {totalBalanceNumber.toLocaleString("en-IN")}</strong>
          <span className="balance-change">
            ↗ Active <small>live verified ledger</small>
          </span>
          <div className="balance-squiggle">〰</div>
        </article>
        <article className="finance-stat">
          <span className="stat-icon mint-bg">↗</span>
          <small>INCOME THIS TERM</small>
          <b>₹ 3,84,200</b>
          <span>↑ 8.2% <i>from last term</i></span>
        </article>
        <article className="finance-stat">
          <span className="stat-icon pink-bg">↘</span>
          <small>SPENDING THIS TERM</small>
          <b>₹ 1,35,550</b>
          <span className="neutral-change">Within approved budgets</span>
        </article>
      </div>
      {canManageFinance && (
        <form
          className="finance-create"
          onSubmit={(e) => {
            e.preventDefault();
            submitInline("Finance");
          }}
        >
          <input
            type="text"
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            placeholder="Transaction title (e.g. Workshop materials)…"
            required
          />
          <input
            type="number"
            value={formExtra}
            onChange={(e) => setFormExtra(e.target.value)}
            placeholder="Amount (₹)"
            required
          />
          <select value={formExtra2} onChange={(e) => setFormExtra2(e.target.value)}>
            <option value="in">Income (+)</option>
            <option value="out">Expense (−)</option>
          </select>
          <button type="submit">RECORD ENTRY +</button>
        </form>
      )}
      <div className="finance-grid">
        <div className="panel ledger-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">EVERY RUPEE HAS A STORY</p>
              <h2>Recent transactions</h2>
            </div>
            <button className="text-link" onClick={() => notify("Showing the complete verified ledger.")}>
              Full ledger ↗
            </button>
          </div>
          <div className="ledger-table">
            <div className="ledger-head">
              <span>WHAT IT WAS</span>
              <span>CLUB</span>
              <span>DATE</span>
              <span>AMOUNT</span>
            </div>
            {financeEntries.map((row, i) => (
              <div className="ledger-row" key={`${row.what}-${i}`}>
                <b>{row.what}</b>
                <span>{row.club}</span>
                <span>{row.date}</span>
                <strong className={row.type}>{row.amt}</strong>
              </div>
            ))}
          </div>
        </div>
        <aside className="budget-note">
          <span>✦</span>
          <p className="eyebrow">CAMPUS PULSE</p>
          <h3>
            Budgets with
            <br />
            breathing room.
          </h3>
          <p>
            3 clubs are using their budgets at a healthy pace. The Green Collective has room to put a
            little more into their spring plans.
          </p>
          <button onClick={() => setSection("Council")}>View council insight ↗</button>
          <small>ESTIMATE BASED ON THIS TERM’S LEDGER</small>
        </aside>
      </div>
    </>
  );
}
