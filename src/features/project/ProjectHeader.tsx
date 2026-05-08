import { useQuery } from "@tanstack/react-query";
import { ExternalLink, HeartHandshake, ShieldCheck, Star } from "lucide-react";
import { fetchLatestCommit, projectMeta } from "./projectMeta";

export function ProjectHeader() {
  const latestCommit = useQuery({
    queryKey: ["latest-commit"],
    queryFn: ({ signal }) => fetchLatestCommit(signal),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const commit = latestCommit.data?.sha ?? projectMeta.buildCommit;
  const commitUrl =
    latestCommit.data?.url ??
    `${projectMeta.repoUrl}/commit/${projectMeta.buildCommit}`;

  return (
    <header className="topbar">
      <a
        className="brand"
        href={projectMeta.pagesUrl}
        aria-label="PDF Workbench home"
      >
        <ShieldCheck aria-hidden="true" />
        <span>{projectMeta.name}</span>
      </a>

      <dl className="build-strip" aria-label="Version and commit">
        <div>
          <dt>Version</dt>
          <dd>{projectMeta.version}</dd>
        </div>
        <div>
          <dt>Commit</dt>
          <dd>
            <a href={commitUrl} target="_blank" rel="noreferrer">
              {commit}
            </a>
          </dd>
        </div>
      </dl>

      <nav className="topbar-actions" aria-label="Project links">
        <a href={projectMeta.repoUrl} target="_blank" rel="noreferrer">
          <Star aria-hidden="true" />
          <span>Star on GitHub</span>
          <ExternalLink aria-hidden="true" />
        </a>
        <a href={projectMeta.paypalUrl} target="_blank" rel="noreferrer">
          <HeartHandshake aria-hidden="true" />
          <span>PayPal</span>
          <ExternalLink aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}
