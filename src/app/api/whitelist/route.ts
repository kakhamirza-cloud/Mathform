import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  WHITELIST_TASKS,
  isEvmWallet,
  isProofUrl,
  isTaskDone,
  normalizeXHandle,
  type WhitelistTaskId,
} from "@/lib/whitelist";

export const runtime = "nodejs";

type SubmitBody = {
  xHandle?: string;
  wallet?: string;
  tasks?: Record<WhitelistTaskId, { done?: boolean; proof?: string }>;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "whitelist-submissions.json");

async function readSubmissions(): Promise<unknown[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  let body: SubmitBody;

  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const xHandle = normalizeXHandle(body.xHandle ?? "");
  const wallet = body.wallet?.trim() ?? "";

  if (!xHandle) {
    return NextResponse.json({ error: "X handle is required" }, { status: 400 });
  }

  if (!isEvmWallet(wallet)) {
    return NextResponse.json({ error: "Valid EVM wallet required" }, { status: 400 });
  }

  if (!body.tasks) {
    return NextResponse.json({ error: "Task checklist incomplete" }, { status: 400 });
  }

  for (const task of WHITELIST_TASKS) {
    const entry = body.tasks[task.id];
    const state = {
      opened: entry?.done ?? false,
      proof: entry?.proof ?? "",
    };

    if (!isTaskDone(task, state)) {
      return NextResponse.json(
        { error: `Task ${task.step} is not complete` },
        { status: 400 },
      );
    }

    if (task.needsProof && entry?.proof && !isProofUrl(entry.proof)) {
      return NextResponse.json(
        { error: `Invalid proof link for task ${task.step}` },
        { status: 400 },
      );
    }
  }

  const submission = {
    xHandle,
    wallet,
    tasks: body.tasks,
    submittedAt: new Date().toISOString(),
  };

  const existing = await readSubmissions();
  const duplicate = existing.some(
    (row) =>
      typeof row === "object" &&
      row !== null &&
      ((row as { wallet?: string }).wallet?.toLowerCase() === wallet.toLowerCase() ||
        (row as { xHandle?: string }).xHandle?.toLowerCase() === xHandle.toLowerCase()),
  );

  if (duplicate) {
    return NextResponse.json(
      { error: "This wallet or X handle already applied" },
      { status: 409 },
    );
  }

  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(
      DATA_FILE,
      JSON.stringify([submission, ...existing], null, 2),
      "utf8",
    );
  } catch {
    return NextResponse.json(
      { error: "Could not save submission on server" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
