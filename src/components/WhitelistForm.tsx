"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  WHITELIST_TASKS,
  countDoneTasks,
  isEvmWallet,
  isTaskDone,
  normalizeXHandle,
  type WhitelistTask,
  type WhitelistTaskId,
} from "@/lib/whitelist";

type TaskState = {
  opened: boolean;
  proof: string;
};

const INITIAL_TASKS = WHITELIST_TASKS.reduce(
  (acc, task) => {
    acc[task.id] = { opened: false, proof: "" };
    return acc;
  },
  {} as Record<WhitelistTaskId, TaskState>,
);

const GLYPHS = ["π", "∑", "∞", "√", "Δ"] as const;

function TaskCard({
  task,
  index,
  state,
  onOpen,
  onProofChange,
}: {
  task: WhitelistTask;
  index: number;
  state: TaskState;
  onOpen: () => void;
  onProofChange: (value: string) => void;
}) {
  const done = isTaskDone(task, state);

  return (
    <li className={`forge-quest ${done ? "forge-quest--done" : ""}`}>
      <div className="forge-quest__glyph" aria-hidden>
        {GLYPHS[index] ?? "·"}
      </div>
      <div className="forge-quest__content">
        <div className="forge-quest__row">
          <div>
            <p className="forge-quest__label">
              Step {index + 1}
              {done ? " · complete" : ""}
            </p>
            <p className="forge-quest__title">{task.title}</p>
          </div>
          <button type="button" onClick={onOpen} className="forge-quest__action">
            {task.openLabel ?? "Go"}
          </button>
        </div>
        {task.needsProof && (
          <input
            type="url"
            value={state.proof}
            onChange={(e) => onProofChange(e.target.value)}
            placeholder={task.proofPlaceholder}
            className="forge-field"
            aria-label={`Proof link for step ${index + 1}`}
          />
        )}
      </div>
    </li>
  );
}

export function WhitelistForm() {
  const [taskStates, setTaskStates] =
    useState<Record<WhitelistTaskId, TaskState>>(INITIAL_TASKS);
  const [xHandle, setXHandle] = useState("");
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  const doneCount = useMemo(() => countDoneTasks(taskStates), [taskStates]);
  const allTasksDone = doneCount === WHITELIST_TASKS.length;
  const progress = (doneCount / WHITELIST_TASKS.length) * 100;

  const canSubmit =
    allTasksDone &&
    normalizeXHandle(xHandle).length > 0 &&
    isEvmWallet(wallet) &&
    status !== "loading";

  function markOpened(id: WhitelistTaskId) {
    setTaskStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], opened: true },
    }));
  }

  function handleOpen(task: WhitelistTask) {
    markOpened(task.id);
    window.open(task.openUrl, "_blank", "noopener,noreferrer");
  }

  function setProof(id: WhitelistTaskId, proof: string) {
    setTaskStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], proof },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("loading");
    setErrorMsg("");

    const payload = {
      xHandle: normalizeXHandle(xHandle),
      wallet: wallet.trim(),
      tasks: WHITELIST_TASKS.reduce(
        (acc, task) => {
          const state = taskStates[task.id];
          acc[task.id] = {
            done: isTaskDone(task, state),
            proof: task.needsProof ? state.proof.trim() : undefined,
          };
          return acc;
        },
        {} as Record<WhitelistTaskId, { done: boolean; proof?: string }>,
      ),
    };

    try {
      const res = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Submission failed");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed");
    }
  }

  if (status === "success") {
    return (
      <div className="forge-sheet mx-auto max-w-2xl space-y-5 p-8 text-center sm:p-10">
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--teal)]">
          Entry logged
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          You&apos;re on the list
        </h2>
        <p className="font-mono text-sm text-[var(--muted)]">
          @{normalizeXHandle(xHandle)} · {wallet.slice(0, 6)}…{wallet.slice(-4)}
        </p>
        <p className="mx-auto max-w-md text-sm text-[var(--muted)]">
          We&apos;ll review your forge proofs and reach out on X if you make the
          UNVOXD whitelist.
        </p>
        <Link href="/" className="forge-ghost-btn inline-block">
          Return home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--teal)]">
            Early access
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">
            Prove your forge
          </h1>
          <p className="max-w-md text-sm text-[var(--muted)]">
            Complete the five steps below, then leave your X handle and wallet.
            Submit unlocks when every step is done.
          </p>
        </div>
        <Link href="/" className="forge-ghost-btn shrink-0">
          Home
        </Link>
      </div>

      <section className="forge-sheet space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            Forge steps
          </h2>
          <span className="font-mono text-xs text-[var(--muted)]">
            {doneCount} of {WHITELIST_TASKS.length}
          </span>
        </div>

        <div className="forge-progress" aria-hidden>
          <div className="forge-progress__fill" style={{ width: `${progress}%` }} />
        </div>

        <ol className="space-y-3">
          {WHITELIST_TASKS.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              state={taskStates[task.id]}
              onOpen={() => handleOpen(task)}
              onProofChange={(proof) => setProof(task.id, proof)}
            />
          ))}
        </ol>
      </section>

      <form onSubmit={handleSubmit} className="forge-sheet space-y-5">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            Your entry
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Used to contact you and assign a whitelist spot.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--muted)]">
              X handle *
            </span>
            <input
              type="text"
              value={xHandle}
              onChange={(e) => setXHandle(e.target.value)}
              placeholder="@handle"
              className="forge-field"
              autoComplete="off"
            />
          </label>

          <label className="block space-y-2">
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--muted)]">
              ETH wallet *
            </span>
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x…"
              className="forge-field"
              spellCheck={false}
              autoComplete="off"
            />
          </label>
        </div>

        {wallet && !isEvmWallet(wallet) && (
          <p className="text-sm text-[var(--danger)]">
            Enter a valid Ethereum address (0x + 40 hex characters).
          </p>
        )}

        <div className="space-y-2 pt-1">
          <button
            type="submit"
            disabled={!canSubmit}
            className="forge-submit w-full disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loading" ? "Sending…" : "Submit application"}
          </button>
          {!allTasksDone && (
            <p className="text-center text-xs text-[var(--muted)]">
              Complete every forge step to unlock submit.
            </p>
          )}
          {allTasksDone && !normalizeXHandle(xHandle) && (
            <p className="text-center text-xs text-[var(--muted)]">
              Add your X handle to finish.
            </p>
          )}
          {errorMsg && (
            <p className="text-center text-sm text-[var(--danger)]">{errorMsg}</p>
          )}
        </div>
      </form>
    </div>
  );
}
