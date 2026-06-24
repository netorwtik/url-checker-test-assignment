import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { useJobStore } from "../store/jobStore";
import { formatDate, jobStatusLabel } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

export function JobList() {
  const { activeJobId, jobs, listLoading, loadJobs, selectJob } = useJobStore();

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  return (
    <section className="panel job-list-panel">
      <div className="panel-heading">
        <div>
          <h2>Задания</h2>
          <p>Последние запуски</p>
        </div>
        <button className="icon-button" type="button" onClick={loadJobs} disabled={listLoading} title="Обновить список">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="job-list">
        {jobs.length === 0 && <div className="empty-state">Заданий пока нет</div>}
        {jobs.map((job) => (
          <button
            key={job.id}
            className={`job-row ${job.id === activeJobId ? "active" : ""}`}
            type="button"
            onClick={() => selectJob(job.id)}
          >
            <div className="job-row-top">
              <span className="job-id">{job.id}</span>
              <StatusBadge status={job.status}>{jobStatusLabel(job.status)}</StatusBadge>
            </div>
            <div className="job-row-meta">
              <span>{formatDate(job.createdAt)}</span>
              <span>
                {job.stats.success}/{job.total} успешно, {job.stats.error} ошибок
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
