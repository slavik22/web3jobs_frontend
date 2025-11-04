import { Link } from 'react-router-dom';

export default function JobCard({ job }) {
  const c = job.company || {};
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold leading-tight">
            <Link to={`/jobs/${job.id}`} className="hover:underline">
              {job.title}
            </Link>
            {job.is_dao_job ? (
              <span className="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">DAO</span>
            ) : null}
          </h3>
          <p className="mt-1 text-sm text-gray-600 flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <i className="bi bi-building" />
              {c.name || '—'}
              {c.is_verified ? <i className="bi bi-patch-check-fill text-blue-500 ml-1" title="Верифікована" /> : null}
            </span>
          </p>
        </div>

        {/* token salary */}
        <div className="text-right">
          {(job.salary_min || job.salary_max) && (
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
              <i className="bi bi-currency-bitcoin mr-1" />
              {job.salary_min ?? '—'} – {job.salary_max ?? '—'} {job.salary_token || 'USDC'}
            </div>
          )}
          {job.salary_usd_equivalent ? (
            <div className="mt-1 text-xs text-gray-500">~${job.salary_usd_equivalent}</div>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-700 line-clamp-3">
        {job.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        {job.location_type && (
          <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1">
            <i className="bi bi-geo-alt" /> {job.location_type}
          </span>
        )}
        {job.job_type && (
          <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1">
            <i className="bi bi-briefcase" /> {job.job_type}
          </span>
        )}
        {job.uses_escrow && (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 text-emerald-700 px-2 py-1">
            <i className="bi bi-lock" /> Escrow
          </span>
        )}
      </div>

      <div className="mt-4">
        <Link to={`/jobs/${job.id}`} className="btn btn-sm btn-primary">
          Деталі <i className="bi bi-arrow-right ml-1" />
        </Link>
      </div>
    </div>
  );
}
