import { Play } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useJobStore } from "../store/jobStore";

const sample = ["https://example.com", "https://github.com", "https://httpstat.us/404"].join("\n");

export function JobForm() {
  const [value, setValue] = useState(sample);
  const { createJob, creating } = useJobStore();

  const urls = useMemo(
    () =>
      value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    [value]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (urls.length === 0 || creating) return;
    await createJob(urls);
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <div>
          <h2>Новая проверка</h2>
          <p>{urls.length} URL в списке</p>
        </div>
        <button className="primary-button" type="submit" disabled={creating || urls.length === 0}>
          <Play size={18} />
          {creating ? "Запуск..." : "Запустить"}
        </button>
      </div>

      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        spellCheck={false}
        placeholder="https://example.com"
      />
    </form>
  );
}
