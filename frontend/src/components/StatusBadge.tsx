import type { JobStatus, UrlCheckStatus } from "../types/jobs";

type Status = JobStatus | UrlCheckStatus;

interface StatusBadgeProps {
  status: Status;
  children: string;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return <span className={`status status-${status}`}>{children}</span>;
}
