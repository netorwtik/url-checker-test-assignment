import type { JobStatus, UrlCheckStatus } from "../types/jobs";

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "medium"
  }).format(new Date(value));
}

export function formatDuration(durationMs?: number): string {
  if (durationMs === undefined) return "—";
  if (durationMs < 1000) return `${durationMs} мс`;
  return `${(durationMs / 1000).toFixed(1)} с`;
}

export function jobStatusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    pending: "Ожидает",
    in_progress: "В работе",
    completed: "Завершено",
    cancelled: "Отменено",
    failed: "С ошибками"
  };
  return labels[status];
}

export function urlStatusLabel(status: UrlCheckStatus): string {
  const labels: Record<UrlCheckStatus, string> = {
    pending: "Ожидает",
    in_progress: "Проверяется",
    success: "Успешно",
    error: "Ошибка",
    cancelled: "Отменено"
  };
  return labels[status];
}
