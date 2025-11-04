import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import JobCard from '../components/JobCard';
import Pagination from '../components/Pagination';

export default function JobsPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // фільтри
  const [q, setQ] = useState('');
  const [jobType, setJobType] = useState('');
  const [token, setToken] = useState('');
  const [daoOnly, setDaoOnly] = useState(false);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set('page', page);
    p.set('per_page', 12);
    if (jobType) p.set('type', jobType);
    if (token) p.set('token', token);
    if (daoOnly) p.set('dao', '1');
    return p.toString();
  }, [page, jobType, token, daoOnly]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    (async () => {
      try {
        const res = await apiFetch(`/jobs?${params}`);
        const data = await res.json();
        if (ignore) return;

        if (data?.ok) {
          // простий клієнтський пошук по заголовку/опису, якщо q заданий
          const raw = data.items || [];
          const filtered = q
            ? raw.filter((j) =>
                [j.title, j.description, j.company?.name]
                  .join(' ')
                  .toLowerCase()
                  .includes(q.toLowerCase())
              )
            : raw;

          setItems(filtered);
          setPage(data.page);
          setPages(data.pages);
          setTotal(data.total);
        } else {
          setItems([]);
          setPages(1);
          setTotal(0);
        }
      } catch {
        setItems([]);
        setPages(1);
        setTotal(0);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [params, q]);

  const resetAndApply = () => setPage(1);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Список вакансій</h1>
          <p className="text-gray-500 text-sm">Знайдено: {total}</p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs text-gray-500 mb-1">Пошук</label>
            <input
              className="input w-full"
              placeholder="Назва, опис або компанія…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Тип роботи</label>
            <select className="input" value={jobType} onChange={(e) => { setJobType(e.target.value); resetAndApply(); }}>
              <option value="">Будь-який</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="dao-contributor">DAO Contributor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Токен</label>
            <select className="input" value={token} onChange={(e) => { setToken(e.target.value); resetAndApply(); }}>
              <option value="">Будь-який</option>
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
              <option value="DAI">DAI</option>
            </select>
          </div>

          <label className="inline-flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              className="checkbox"
              checked={daoOnly}
              onChange={(e) => { setDaoOnly(e.target.checked); resetAndApply(); }}
            />
            <span className="text-sm">Лише DAO</span>
          </label>
        </div>
      </div>

      {/* список */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : items.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </>
      ) : (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-600">
          <i className="bi bi-info-circle mr-2" />
          Поки що немає активних вакансій
        </div>
      )}
    </div>
  );
}
