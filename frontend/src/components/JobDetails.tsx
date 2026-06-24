import { Ban, Clock, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { isTerminalStatus, useJobStore } from "../store/jobStore";
import { formatDate, formatDuration, jobStatusLabel, urlStatusLabel } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

export function JobDetails() {
  const { activeJob, activeJobId, cancelActiveJob, cancelling, detailsLoading, refreshActiveJob } = useJobStore();

  useEffect(() => {
    if (!activeJobId) return;

    let alive = true;
    let timeoutId: number | undefined;
    let controller: AbortController | undefined;

    const poll = async () => {
      controller?.abort();
      controller = new AbortController();
      const details = await refreshActiveJob(activeJobId, controller.signal);

      if (!alive) return;
      if (details && !isTerminalStatus(details.status)) {
        timeoutId = window.setTimeout(poll, 1500);
      }
    };

    void poll();

    return () => {
      alive = false;
      controller?.abort();
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [activeJobId, refreshActiveJob]);

  if (!activeJobId) {
    return (
      <section className="panel details-panel empty-details">
        <Clock size={28} />
        <h2>Выберите или создайте задание</h2>
      </section>
    );
  }

  if (!activeJob || detailsLoading) {
    return (
      <section className="panel details-panel empty-details">
        <Loader2 className="spin" size={28} />
        <h2>Загрузка деталей</h2>
      </section>
    );
  }

  const processed = activeJob.urls.filter((item) =>
    ["success", "error", "cancelled"].includes(item.status)
  ).length;
  const progress = Math.round((processed / activeJob.urls.length) * 100);

  return (
    <section className="panel details-panel">
      <div className="panel-heading details-heading">
        <div>
          <h2>Детали задания</h2>
          <p>
            {formatDate(activeJob.createdAt)} · {processed} из {activeJob.urls.length} обработано
          </p>
        </div>
        <div className="details-actions">
          <StatusBadge status={activeJob.status}>{jobStatusLabel(activeJob.status)}</StatusBadge>
          {!isTerminalStatus(activeJob.status) && (
            <button className="danger-button" type="button" onClick={cancelActiveJob} disabled={cancelling}>
              <Ban size={18} />
              {cancelling ? "Отмена..." : "Отменить"}
            </button>
          )}
        </div>
      </div>

      <div className="progress-track" aria-label="Прогресс задания">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="url-table">
        {activeJob.urls.map((item) => (
          <div className="url-row" key={item.id}>
            <div className="url-main">
              <span className="url-text" title={item.url}>
                {item.url}
              </span>
              {item.error && <span className="url-error">{item.error}</span>}
            </div>
            <div className="url-meta">
              <StatusBadge status={item.status}>{urlStatusLabel(item.status)}</StatusBadge>
              <span className="http-status">{item.httpStatus ?? "—"}</span>
              <span className="duration">{formatDuration(item.durationMs)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
