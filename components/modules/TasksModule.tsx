"use client";

import React, { useState, useMemo } from "react";
import { ModulePage } from "../ui/ModulePage";
import type { CampusRole, TaskItem, Section } from "../../lib/supabase/types";

interface TasksModuleProps {
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  canManageTasks: boolean;
  formText: string;
  setFormText: (s: string) => void;
  formExtra: string;
  setFormExtra: (s: string) => void;
  submitInline: (k: Section) => void;
  role?: CampusRole;
}

export function TasksModule({
  tasks,
  setTasks,
  canManageTasks,
  formText,
  setFormText,
  formExtra,
  setFormExtra,
  submitInline,
  role = "Student",
}: TasksModuleProps) {
  const isCouncil = role === "Student Council";
  const isLeader = role === "Club Leader";
  const [filterState, setFilterState] = useState<"ALL" | "ACTIVE" | "DONE">("ALL");

  const filteredTasks = useMemo(() => {
    if (filterState === "ACTIVE") return tasks.filter((t) => !t.done);
    if (filterState === "DONE") return tasks.filter((t) => t.done);
    return tasks;
  }, [tasks, filterState]);

  return (
    <ModulePage
      eyebrow={
        isCouncil
          ? "STUDENT COUNCIL · EXECUTIVE ACTIONS"
          : isLeader
          ? "CLUB OPERATIONS & CREW TASKS"
          : "THE LITTLE DETAILS, HANDLED"
      }
      title={
        <>
          Many hands.
          <br />
          <em>Good things happen.</em>
        </>
      }
      subtitle={
        isCouncil
          ? "Deliberate and coordinate student council tasks, event preparations, and senate deliverables."
          : isLeader
          ? "Track crew checklists, workshop prep, and logistics for your club."
          : "A shared task board for club teams, volunteers, and event crews."
      }
    >
      <div className="panel module-panel">
        <div className="panel-heading" style={{ flexWrap: "wrap", gap: 10 }}>
          <div>
            <p className="eyebrow">
              {isCouncil
                ? "COUNCIL ACTION BOARD"
                : isLeader
                ? "CLUB ACTION ITEMS"
                : "TEAM BOARD · ALL CLUBS"}
            </p>
            <h2>What needs doing</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="filter-chips" style={{ margin: 0 }}>
              {(["ALL", "ACTIVE", "DONE"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  className={filterState === st ? "active" : ""}
                  onClick={() => setFilterState(st)}
                  style={{ fontSize: 9.5, padding: "4px 9px" }}
                >
                  {st}
                </button>
              ))}
            </div>
            <span className="task-progress">
              {tasks.filter((t) => t.done).length} of {tasks.length} done
            </span>
          </div>
        </div>

        {canManageTasks && (
          <form
            className="inline-create"
            onSubmit={(e) => {
              e.preventDefault();
              submitInline("Tasks");
            }}
          >
            <input
              type="text"
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder={
                isCouncil
                  ? "Add a council action item…"
                  : isLeader
                  ? "Add task for club crew…"
                  : "Add a task for the team…"
              }
              required
              style={{ flex: 2 }}
            />
            <input
              type="text"
              value={formExtra}
              onChange={(e) => setFormExtra(e.target.value)}
              placeholder={
                isCouncil
                  ? "Committee (e.g. Student Council Events)"
                  : isLeader
                  ? "Team (e.g. Design Society)"
                  : "Team or event"
              }
              style={{ flex: 1 }}
            />
            <button type="submit">ADD TASK +</button>
          </form>
        )}

        {filteredTasks.map((task) => {
          const actualIndex = tasks.findIndex((t) => t.title === task.title && t.team === task.team);
          const idx = actualIndex !== -1 ? actualIndex : 0;
          return (
            <article className={`task-row ${task.done ? "completed" : ""}`} key={`${task.title}-${idx}`}>
              <button
                className="task-check"
                onClick={() =>
                  setTasks((cur) =>
                    cur.map((t, i) => (i === idx ? { ...t, done: !t.done } : t))
                  )
                }
                title="Mark task done"
              >
                {task.done ? "✓" : ""}
              </button>
              <div style={{ flex: 1 }}>
                <b>{task.title}</b>
                <small>{task.team}</small>
              </div>
              <span>{task.done ? "DONE" : "IN PROGRESS"}</span>
              {canManageTasks && (
                <button
                  className="delete-row"
                  onClick={() => setTasks((cur) => cur.filter((_, i) => i !== idx))}
                  title="Remove task"
                >
                  ×
                </button>
              )}
            </article>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="empty-state" style={{ padding: "28px 12px" }}>
            <span>✓</span>
            <h3>No tasks in this view.</h3>
            <p>Everything is currently on schedule.</p>
          </div>
        )}
      </div>
    </ModulePage>
  );
}
