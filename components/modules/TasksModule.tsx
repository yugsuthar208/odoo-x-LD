"use client";

import React from "react";
import { ModulePage } from "../ui/ModulePage";
import type { TaskItem, Section } from "../../lib/supabase/types";

interface TasksModuleProps {
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  canManageTasks: boolean;
  formText: string;
  setFormText: (s: string) => void;
  formExtra: string;
  setFormExtra: (s: string) => void;
  submitInline: (k: Section) => void;
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
}: TasksModuleProps) {
  return (
    <ModulePage
      eyebrow="THE LITTLE DETAILS, HANDLED"
      title={
        <>
          Many hands.
          <br />
          <em>Good things happen.</em>
        </>
      }
      subtitle="A shared task board for club teams and event crews."
    >
      <div className="panel module-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">TEAM BOARD · ALL CLUBS</p>
            <h2>What needs doing</h2>
          </div>
          <span className="task-progress">
            {tasks.filter((t) => t.done).length} of {tasks.length} done
          </span>
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
              placeholder="Add a task for the team…"
              required
            />
            <input
              type="text"
              value={formExtra}
              onChange={(e) => setFormExtra(e.target.value)}
              placeholder="Team or event (e.g. Design Society)"
            />
            <button type="submit">ADD TASK +</button>
          </form>
        )}
        {tasks.map((task, index) => (
          <article className={`task-row ${task.done ? "completed" : ""}`} key={`${task.title}-${index}`}>
            <button
              className="task-check"
              onClick={() =>
                setTasks((cur) =>
                  cur.map((t, i) => (i === index ? { ...t, done: !t.done } : t))
                )
              }
            >
              {task.done ? "✓" : ""}
            </button>
            <div>
              <b>{task.title}</b>
              <small>{task.team}</small>
            </div>
            <span>{task.done ? "DONE" : "IN PROGRESS"}</span>
            <button
              className="delete-row"
              onClick={() => setTasks((cur) => cur.filter((_, i) => i !== index))}
            >
              ×
            </button>
          </article>
        ))}
      </div>
    </ModulePage>
  );
}
