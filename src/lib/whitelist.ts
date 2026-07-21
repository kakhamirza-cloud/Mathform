export const TWITTER_HANDLE = "unvoxd_nft";

/** Launch tweet for like / repost / reply whitelist tasks. */
export const PINNED_TWEET_URL =
  process.env.NEXT_PUBLIC_UNVOXD_TWEET_URL ??
  "https://x.com/Unvoxd_NFT/status/2079606815873241285";

export type WhitelistTaskId =
  | "follow"
  | "like"
  | "retweet"
  | "post"
  | "comment";

export type WhitelistTask = {
  id: WhitelistTaskId;
  step: string;
  title: string;
  openUrl: string;
  openLabel?: string;
  needsProof?: boolean;
  proofPlaceholder?: string;
};

export const WHITELIST_TASKS: WhitelistTask[] = [
  {
    id: "follow",
    step: "01",
    title: `Follow @${TWITTER_HANDLE}`,
    openUrl: `https://x.com/${TWITTER_HANDLE}`,
    openLabel: "Follow",
  },
  {
    id: "like",
    step: "02",
    title: "Like the pinned UNVOXD post",
    openUrl: PINNED_TWEET_URL,
    openLabel: "Like",
  },
  {
    id: "retweet",
    step: "03",
    title: "Repost the pinned UNVOXD post",
    openUrl: PINNED_TWEET_URL,
    openLabel: "Repost",
  },
  {
    id: "post",
    step: "04",
    title: "Share your forged character on X (tag @unvoxd_nft)",
    openUrl: "/",
    openLabel: "Forge",
    needsProof: true,
    proofPlaceholder: "https://x.com/your-post",
  },
  {
    id: "comment",
    step: "05",
    title: "Reply on the pinned post and mention 3 friends",
    openUrl: PINNED_TWEET_URL,
    openLabel: "Reply",
    needsProof: true,
    proofPlaceholder: "https://x.com/your-reply",
  },
];

export function isProofUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return (
      (url.hostname === "x.com" || url.hostname === "twitter.com") &&
      url.pathname.length > 1
    );
  } catch {
    return false;
  }
}

export function normalizeXHandle(value: string): string {
  return value.trim().replace(/^@/, "");
}

export function isEvmWallet(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

export type WhitelistSubmission = {
  xHandle: string;
  wallet: string;
  tasks: Record<WhitelistTaskId, { done: boolean; proof?: string }>;
  submittedAt: string;
};

export function isTaskDone(
  task: WhitelistTask,
  state: { opened: boolean; proof: string },
): boolean {
  if (task.needsProof) return isProofUrl(state.proof);
  return state.opened;
}

export function countDoneTasks(
  taskStates: Record<WhitelistTaskId, { opened: boolean; proof: string }>,
): number {
  return WHITELIST_TASKS.filter((task) =>
    isTaskDone(task, taskStates[task.id]),
  ).length;
}
