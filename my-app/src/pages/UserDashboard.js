import { useEffect, useState } from 'react'
import Table from '../components/Table'
import LoadingSkeleton from '../components/LoadingSkeleton'
import StatusPill from '../components/StatusPill'
import Toast from '../components/Toast'
import { apiBase } from '../config'
import { apiFetch } from '../lib/api'


export default function UserDashboard() {
    const [apps, setApps] = useState(null)
    const [toast, setToast] = useState({ message: '', type: 'success' })


    useEffect(() => {
        (async () => {
            try {
                const r = await apiFetch(`/dashboard`)
                const d = await r.json()
                if (d.ok) setApps(d.applications || [])
                else setApps([])
            } catch (e) {
                setApps([])
                setToast({ message: 'Не вдалось завантажити заявки', type: 'error' })
            }
        })()
    }, [])


    const columns = [
        { header: 'Вакансія', key: 'title', cell: (row) => <strong>{row.job_title}</strong> },
        { header: 'Компанія', key: 'company', cell: (row) => row.company_name },
        { header: 'Статус', key: 'status', cell: (row) => <StatusPill value={row.status} /> },
        { header: 'Дата подачі', key: 'date', cell: (row) => new Date(row.applied_at).toLocaleDateString('uk-UA') },
    ]


    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <Toast {...toast} onClose={() => setToast({ message: '' })} />
            <div className="card p-6">
                <h1 className="mb-4 text-2xl font-bold">Мій дашборд</h1>
                <h4 className="mb-3 text-lg font-semibold">Мої заявки</h4>
                {apps === null ? (
                    <LoadingSkeleton lines={6} />
                ) : (
                    <Table columns={columns} data={apps} empty="Ви ще не подали жодної заявки." />
                )}
            </div>
        </div>
    )
}