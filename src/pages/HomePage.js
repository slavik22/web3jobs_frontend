import { useEffect, useMemo, useState } from 'react'
import Hero from '../components/Hero'
import StatsGrid from '../components/StatsGrid'
import FeatureGrid from '../components/FeatureGrid'
import JobFilters from '../components/JobFilters'
import JobCard from '../components/JobCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import { apiBase } from '../config'
import { apiFetch } from '../lib/api'


export default function HomePage() {
  const [stats, setStats] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const [query, setQuery] = useState('')
  const [jobType, setJobType] = useState('')
  const [locationType, setLocationType] = useState('')
  const [daoOnly, setDaoOnly] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        setLoadingStats(true)
        const r = await apiFetch(`/`)
        const d = await r.json()
        if (d.ok) {
          setStats(d.stats)
          setJobs(d.jobs || [])
          setHasMore(true) // ще може бути більше
        }
      } finally {
        setLoadingStats(false)
        setLoadingJobs(false)
      }
    })()
  }, [])

  // load more from /jobs with filters & pagination
  async function loadMore(nextPage = page + 1) {
    setLoadingJobs(true)
    const params = new URLSearchParams()
    params.set('page', nextPage)
    params.set('per_page', 10)
    if (jobType) params.set('type', jobType)
    if (daoOnly) params.set('dao', '1')
    // примітка: для locationType бекенд має мати фільтр (у вас є location_type в Job)
    // якщо додасте — раскоментіть:
    // if (locationType) params.set('location_type', locationType)

    const r = await apiFetch(`/jobs?${params.toString()}`)
    const d = await r.json()
    if (d.ok) {
      const newItems = d.items || []
      setJobs((prev) => (nextPage === 1 ? newItems : [...prev, ...newItems]))
      setPage(nextPage)
      setHasMore(nextPage < (d.pages || 1))
    }
    setLoadingJobs(false)
  }

  // apply filters → перезавантажити список з 1 сторінки
  function applyFilters({ q, type, location, dao }) {
    setQuery(q ?? '')
    setJobType(type ?? '')
    setLocationType(location ?? '')
    setDaoOnly(!!dao)
    // якщо пошук по заголовку/компанії лише клієнтський:
    // тут просто оновлюємо state; fetch робимо тільки для серверних фільтрів
    loadMore(1)
  }

  // локальний пошук по вже завантажених jobs (по назві/компанії)
  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return jobs
    return jobs.filter((j) => {
      const title = (j.title || '').toLowerCase()
      const company = (j.company?.name || '').toLowerCase()
      return title.includes(q) || company.includes(q)
    })
  }, [jobs, query])

  return (
    <div className="space-y-12">
      <Hero />

      <section>
        {loadingStats ? (
          <div className="grid gap-4 md:grid-cols-3">
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </div>
        ) : (
          <StatsGrid stats={stats} />
        )}
      </section>

      <FeatureGrid />

      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="text-2xl font-semibold">🔥 Нові вакансії</h2>
          <JobFilters
            value={{ query, jobType, locationType, daoOnly }}
            onChange={applyFilters}
          />
        </div>

        {/* Список вакансій */}
        <div className="space-y-3">
          {loadingJobs && !jobs.length ? (
            <LoadingSkeleton lines={6} />
          ) : filteredJobs.length ? (
            filteredJobs.map((j) => <JobCard key={j.id} job={j} />)
          ) : (
            <EmptyState
              title="Нічого не знайдено"
              subtitle="Спробуй інший пошуковий запит або змінюй фільтри."
            />
          )}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center">
            <button
              className="btn btn-outline"
              onClick={() => loadMore(page + 1)}
              disabled={loadingJobs}
            >
              {loadingJobs ? 'Завантаження…' : 'Показати більше'}
            </button>
          </div>
        )}
      </section>

      {/* <section className="space-y-4 text-center">
        <h2 className="text-3xl font-bold">Готовий почати?</h2>
        <p className="text-gray-500">Приєднуйся до майбутнього роботи вже сьогодні!</p>
        <div className="flex items-center justify-center gap-3">
          <a href="/register" className="btn btn-primary text-lg">Зареєструватися як кандидат</a>
          <a href="/register" className="btn btn-outline text-lg">Я рекрутер</a>
        </div>
      </section> */}
    </div>
  )
}

