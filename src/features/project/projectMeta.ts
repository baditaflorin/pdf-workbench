import { z } from "zod";

export const projectMeta = {
  name: "PDF Workbench",
  version: __APP_VERSION__,
  buildCommit: __COMMIT_SHA__,
  repoUrl: __REPO_URL__,
  paypalUrl: __PAYPAL_URL__,
  pagesUrl: "https://baditaflorin.github.io/pdf-workbench/",
};

const commitResponseSchema = z.object({
  sha: z.string(),
  html_url: z.string().url(),
  commit: z.object({
    message: z.string(),
    author: z.object({
      date: z.string(),
    }),
  }),
});

export async function fetchLatestCommit(signal?: AbortSignal) {
  const response = await fetch(
    "https://api.github.com/repos/baditaflorin/pdf-workbench/commits/main",
    {
      signal,
      headers: { Accept: "application/vnd.github+json" },
    },
  );

  if (!response.ok) {
    throw new Error("Could not load the latest public GitHub commit.");
  }

  const data = commitResponseSchema.parse(await response.json());

  return {
    sha: data.sha.slice(0, 7),
    url: data.html_url,
    message: data.commit.message.split("\n")[0],
    date: data.commit.author.date,
  };
}
