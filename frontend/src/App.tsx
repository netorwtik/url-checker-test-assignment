import { AlertCircle } from "lucide-react";
import { JobDetails } from "./components/JobDetails";
import { JobForm } from "./components/JobForm";
import { JobList } from "./components/JobList";
import { useJobStore } from "./store/jobStore";

export function App() {
  const error = useJobStore((state) => state.error);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>URL Checker</h1>
          <p>Асинхронная проверка списков URL через HTTP HEAD</p>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="layout">
        <div className="left-column">
          <JobForm />
          <JobList />
        </div>
        <JobDetails />
      </div>
    </main>
  );
}
