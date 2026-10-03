"use client";

import React from "react";
import { ModulePage } from "../ui/ModulePage";
import type { ProductItem, Section } from "../../lib/supabase/types";

interface MarketplaceModuleProps {
  products: ProductItem[];
  canListMarketplace: boolean;
  formText: string;
  setFormText: (s: string) => void;
  formExtra: string;
  setFormExtra: (s: string) => void;
  submitInline: (k: Section) => void;
  askAboutProduct: (p: ProductItem) => void;
}

export function MarketplaceModule({
  products,
  canListMarketplace,
  formText,
  setFormText,
  formExtra,
  setFormExtra,
  submitInline,
  askAboutProduct,
}: MarketplaceModuleProps) {
  return (
    <ModulePage
      eyebrow="MADE HERE, SHARED HERE"
      title={
        <>
          Campus finds
          <br />
          <em>with a little story.</em>
        </>
      }
      subtitle="Shop student-made goods, club merch and useful things passed along."
    >
      {canListMarketplace && (
        <form
          className="inline-create listing-form"
          onSubmit={(e) => {
            e.preventDefault();
            submitInline("Marketplace");
          }}
        >
          <input
            type="text"
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            placeholder="List something to sell…"
            required
          />
          <input
            type="number"
            min="0"
            value={formExtra}
            onChange={(e) => setFormExtra(e.target.value)}
            placeholder="Price ₹"
            required
          />
          <button type="submit">ADD LISTING +</button>
        </form>
      )}
      <div className="market-grid">
        {products.map((item, index) => (
          <article className="market-card" key={`${item.title}-${index}`}>
            <div className={`market-art market-color-${index % 4}`}>
              <span>{item.emoji}</span>
              <small>MADE ON CAMPUS</small>
            </div>
            <div>
              <small>{item.seller.toUpperCase()}</small>
              <h3>{item.title}</h3>
              <b>₹ {item.price.toLocaleString("en-IN")}</b>
              <button onClick={() => askAboutProduct(item)}>ASK ABOUT THIS ↗</button>
            </div>
          </article>
        ))}
      </div>
    </ModulePage>
  );
}
