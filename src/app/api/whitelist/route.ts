import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import {
  WHITELIST_TASKS,
  isRobinhoodWallet,
  isProofUrl,
  isTaskDone,
  normalizeRobinhoodWallet,
  normalizeXHandle,
  type WhitelistTaskId,
} from "@/lib/whitelist";

export const runtime = "nodejs";

/** Minimal KV surface we need — avoids pulling in full workers-types. */
type WhitelistKv = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

type SubmitBody = {
  xHandle?: string;
  wallet?: string;
  tasks?: Record<WhitelistTaskId, { done?: boolean; proof?: string }>;
};

type Submission = {
  xHandle: string;
  wallet: string;
  tasks: SubmitBody["tasks"];
  submittedAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "whitelist-submissions.json");

const WALLET_KEY = (wallet: string) => `wl:wallet:${wallet.toLowerCase()}`;
const HANDLE_KEY = (handle: string) => `wl:handle:${handle.toLowerCase()}`;

function getWhitelistKv(): WhitelistKv | null {
  try {
    const { env } = getCloudflareContext();
    // Binding from wrangler.jsonc — not on the default OpenNext env type.
    return (env as { WHITELIST?: WhitelistKv }).WHITELIST ?? null;
  } catch {
    // Local `next dev` without Cloudflare bindings.
    return null;
  }
}

async function readLocalSubmissions(): Promise<Submission[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Submission[]) : [];
  } catch {
    return [];
  }
}

async function hasDuplicate(
  kv: WhitelistKv | null,
  xHandle: string,
  wallet: string,
): Promise<boolean> {
  if (kv) {
    const [byWallet, byHandle] = await Promise.all([
      kv.get(WALLET_KEY(wallet)),
      kv.get(HANDLE_KEY(xHandle)),
    ]);
    return Boolean(byWallet || byHandle);
  }

  const existing = await readLocalSubmissions();
  return existing.some(
    (row) =>
      row.wallet?.toLowerCase() === wallet.toLowerCase() ||
      row.xHandle?.toLowerCase() === xHandle.toLowerCase(),
  );
}

async function saveSubmission(
  kv: WhitelistKv | null,
  submission: Submission,
): Promise<void> {
  if (kv) {
    // One record per wallet; handle index blocks duplicate X handles.
    await Promise.all([
      kv.put(WALLET_KEY(submission.wallet), JSON.stringify(submission)),
      kv.put(HANDLE_KEY(submission.xHandle), submission.wallet.toLowerCase()),
    ]);
    return;
  }

  const existing = await readLocalSubmissions();
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(
    DATA_FILE,
    JSON.stringify([submission, ...existing], null, 2),
    "utf8",
  );
}

export async function POST(request: Request) {
  let body: SubmitBody;

  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const xHandle = normalizeXHandle(body.xHandle ?? "");
  const wallet = normalizeRobinhoodWallet(body.wallet ?? "");

  if (!xHandle) {
    return NextResponse.json({ error: "X handle is required" }, { status: 400 });
  }

  if (!isRobinhoodWallet(wallet)) {
    return NextResponse.json(
      { error: "Valid Robinhood Wallet address required" },
      { status: 400 },
    );
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

  const submission: Submission = {
    xHandle,
    wallet,
    tasks: body.tasks,
    submittedAt: new Date().toISOString(),
  };

  const kv = getWhitelistKv();

  try {
    if (await hasDuplicate(kv, xHandle, wallet)) {
      return NextResponse.json(
        { error: "This Robinhood Wallet or X handle already applied" },
        { status: 409 },
      );
    }

    await saveSubmission(kv, submission);
  } catch (err) {
    console.error("whitelist save failed", err);
    return NextResponse.json(
      { error: "Could not save submission on server" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
