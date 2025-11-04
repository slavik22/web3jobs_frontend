import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'

function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return v
}

const TYPES = ['', 'full-time', 'part-time', 'contract', 'dao-contributor']
const LOCS = ['', 'remote', 'hybrid', 'onsite']

export default function JobFilters({ value, onChange }) {
  const [q, setQ] = useState(value.query || '')
  const [type, setType] = useState(value.jobType || '')
  const [loc, setLoc] = useState(value.locationType || '')
  const [dao, setDao] = useState(!!value.daoOnly)

  const debouncedQ = useDebounced(q, 350)

  useEffect(() => {
    onChange?.({ q: debouncedQ, type, location: loc, dao })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, type, loc, dao])

  const typeOptions = useMemo(() => TYPES.map((t) => ({ label: t || 'Усі типи', value: t })), [])
  const locOptions = useMemo(() => LOCS.map((t) => ({ label: t || 'Усі формати', value: t })), [])

  return (
    <div className="grid gap-2 md:grid-cols-4">
      {/* search */}
      <label className="relative md:col-span-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Пошук: назва або компанія…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      {/* type */}
      <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
        {typeOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* location + DAO toggle inline */}
      <div className="flex gap-2">
        <select className="input" value={loc} onChange={(e) => setLoc(e.target.value)}>
          {locOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setDao((v) => !v)}
          className={`btn ${dao ? 'btn-primary' : 'btn-outline'}`}
          title="Показувати лише DAO"
        >
          DAO
        </button>
      </div>
    </div>
  )
}
