"use client";

import React from "react";
import { ModulePage } from "../ui/ModulePage";
import type { MessageItem, Section } from "../../lib/supabase/types";

interface MessagesModuleProps {
  activeChannel: string;
  setActiveChannel: (ch: string) => void;
  activeChannelMessages: MessageItem[];
  displayName: string;
  formText: string;
  setFormText: (s: string) => void;
  submitInline: (k: Section) => void;
  notify: (msg: string) => void;
}

export function MessagesModule({
  activeChannel,
  setActiveChannel,
  activeChannelMessages,
  displayName,
  formText,
  setFormText,
  submitInline,
  notify,
}: MessagesModuleProps) {
  return (
    <ModulePage
      eyebrow="GOOD CONVERSATIONS, IN ONE PLACE"
      title={
        <>
          Let’s keep
          <br />
          <em>the good going.</em>
        </>
      }
      subtitle="Club updates and campus conversations, together."
    >
      <div className="message-layout">
        <aside className="conversation-list">
          <p className="eyebrow">YOUR CONVERSATIONS</p>
          {["Student Council", "Design Society", "Welcome Fair Crew", "Robotics & AI"].map(
            (name, i) => (
              <button
                className={activeChannel === name ? "active" : ""}
                key={name}
                onClick={() => setActiveChannel(name)}
              >
                <span>{["◎", "✳", "♡", "⌘"][i]}</span>
                <div>
                  <b>{name}</b>
                  <small>
                    {
                      [
                        "Ananya: See you at the forum!",
                        "New poster is ready 🎨",
                        "Thanks for volunteering!",
                        "Open lab is on Saturday",
                      ][i]
                    }
                  </small>
                </div>
              </button>
            )
          )}
        </aside>
        <section className="conversation">
          <header>
            <span>◎</span>
            <div>
              <b>{activeChannel}</b>
              <small>Campus updates & discussion thread</small>
            </div>
            <button onClick={() => notify(`Conversation info: ${activeChannel}`)}>···</button>
          </header>
          <div className="message-history">
            <p className="day-divider">TODAY</p>
            {activeChannelMessages.map((message, index) => {
              const isMine =
                message.author === displayName || message.author.startsWith("Maya");
              return (
                <article
                  className={`message-bubble ${isMine ? "mine" : ""}`}
                  key={`${message.text}-${index}`}
                >
                  <small>{message.author}</small>
                  <p>{message.text}</p>
                </article>
              );
            })}
          </div>
          <form
            className="message-compose"
            onSubmit={(e) => {
              e.preventDefault();
              submitInline("Messages");
            }}
          >
            <input
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder={`Message ${activeChannel}…`}
              required
            />
            <button type="submit">↑</button>
          </form>
          <p className="privacy-note">
            Campus communications adhere to Northstar Student Conduct guidelines.
          </p>
        </section>
      </div>
    </ModulePage>
  );
}
