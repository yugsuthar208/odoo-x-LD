"use client";

import React from "react";
import { ModulePage } from "../ui/ModulePage";
import type { ShopItem, ModalState, Section } from "../../lib/supabase/types";

interface ClubShopModuleProps {
  shopItems: ShopItem[];
  shopFilter: string;
  setShopFilter: (f: string) => void;
  cart: Array<{ name: string; club: string; price: number; qty: number }>;
  addToCart: (item: ShopItem) => void;
  setModal: (m: ModalState) => void;
  setSection: (s: Section) => void;
}

export function ClubShopModule({
  shopItems,
  shopFilter,
  setShopFilter,
  cart,
  addToCart,
  setModal,
  setSection,
}: ClubShopModuleProps) {
  const totalStock = shopItems.reduce((total, item) => total + item.stock, 0);

  return (
    <ModulePage
      eyebrow="OFFICIAL CLUB MERCHANDISE"
      title={
        <>
          Wear the work.
          <br />
          <em>Take it with you.</em>
        </>
      }
      subtitle="Club shop products stay separate from the student-to-student reuse marketplace."
    >
      <div className="shop-toolbar">
        <span>
          <i className="live-dot" /> {totalStock} items in stock across 3 clubs
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShopFilter(shopFilter === "ALL" ? "Design Society" : "ALL")}
          >
            {shopFilter === "ALL" ? "FILTER BY CLUB ⌄" : `FILTER: ${shopFilter}`}
          </button>
          {cart.length > 0 && (
            <button
              onClick={() => setModal({ type: "cart" })}
              style={{ fontWeight: 600, color: "#3d6447" }}
            >
              BAG ({cart.reduce((s, c) => s + c.qty, 0)}) ↗
            </button>
          )}
        </div>
      </div>
      <div className="shop-grid">
        {shopItems
          .filter((item) => shopFilter === "ALL" || item.club === shopFilter)
          .map((item) => (
            <article className="shop-card" key={item.name}>
              <div className={`shop-art ${item.color}`}>
                <span>{item.emoji}</span>
                <small>OFFICIAL MERCH</small>
              </div>
              <div className="shop-body">
                <small>{item.club.toUpperCase()}</small>
                <h3>{item.name}</h3>
                <p>
                  {item.variant} <i>·</i> {item.stock} available
                </p>
                <div>
                  <b>₹ {item.price.toLocaleString("en-IN")}</b>
                  <button disabled={!item.stock} onClick={() => addToCart(item)}>
                    {item.stock ? "ADD TO ORDER +" : "SOLD OUT"}
                  </button>
                </div>
              </div>
            </article>
          ))}
      </div>
      <div className="shop-note">
        <span>▤</span>
        <p>
          <b>Club shop ≠ reuse marketplace.</b> These products are created and managed by official clubs, with inventory and member pricing.
        </p>
        <button onClick={() => setSection("Marketplace")}>
          BROWSE STUDENT REUSE ITEMS ↗
        </button>
      </div>
    </ModulePage>
  );
}
