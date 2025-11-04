export default function StatusPill({ value }) {
    const map = {
        accepted: 'bg-emerald-100 text-emerald-800',
        rejected: 'bg-rose-100 text-rose-800',
        pending: 'bg-amber-100 text-amber-900',
        reviewed: 'bg-sky-100 text-sky-800',
        interview: 'bg-indigo-100 text-indigo-800'
    }
    const key = (value || '').toString().toLowerCase()
    const cls = map[key] || 'bg-gray-100 text-gray-800'
    return <span className={`badge ${cls}`}>{value}</span>
}