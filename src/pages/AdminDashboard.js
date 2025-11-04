import React, { useEffect, useState } from 'react'
import Table from '../components/Table'
import LoadingSkeleton from '../components/LoadingSkeleton'
import Toast from '../components/Toast'
import { apiBase } from '../config'
import { apiFetch } from '../lib/api'


export default function AdminDashboard() {
    const [data, setData] = useState(null)
    const [toast, setToast] = useState({ message: '', type: 'success' })
    useEffect(() => {
        (async () => {
            try {
                const r = await apiFetch(`/admin/dashboard`)
                const d = await r.json()
                if (d.ok) setData(d)
                else setToast({ message: d.message || 'Помилка завантаження', type: 'error' })
            } catch (e) {
                setToast({ message: 'Не вдалось завантажити адмін-дані', type: 'error' })
            }
        })()
    }, [])


    async function verifyCompany(id) {
        try {
            const r = await fetch(`${apiBase}/admin/verify-company/${id}`, { method: 'POST', credentials: 'include' })
            const d = await r.json()
            if (!r.ok || !d.ok) throw new Error(d.message || 'Помилка верифікації')
            setToast({ message: 'Компанію верифіковано', type: 'success' })
            // refresh
            const rr = await fetch(`${apiBase}/admin/dashboard`, { credentials: 'include' })
            const dd = await rr.json()
            if (dd.ok) setData(dd)
        } catch (e) {
            setToast({ message: e.message, type: 'error' })
        }
    }


    const userCols = [
        { header: 'Email', key: 'email', accessor: 'email' },
        {
            header: 'Роль', key: 'role', accessor: 'role', cell: (u) => (
                <span className={`badge ${u.role === 'admin' ? 'bg-rose-100 text-rose-700' : u.role === 'company' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-800'}`}>{u.role}</span>
            )
        },
    ]


    const pendingCols = [
        { header: 'Назва компанії', key: 'name', accessor: 'name' },
        {
            header: 'Дія', key: 'act', cell: (c) => (
                <div className="text-right">
                    <button className="btn btn-primary btn-sm" onClick={() => verifyCompany(c.id)}>Верифікувати</button>
                </div>
            )
        },
    ]


    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <Toast {...toast} onClose={() => setToast({ message: '' })} />
            <h1 className="text-center text-2xl font-bold">Адмін панель</h1>


            {/* Stats */}
            {data ? (
                <div className="grid gap-3 md:grid-cols-4">
                    <div className="card border-l-4 border-blue-600 p-4">
                        <div className="text-sm text-gray-600">Користувачі</div>
                        <div className="text-3xl font-bold text-blue-600">{data.total_users}</div>
                    </div>
                    <div className="card border-l-4 border-emerald-600 p-4">
                        <div className="text-sm text-gray-600">Компанії</div>
                        <div className="text-3xl font-bold text-emerald-600">{data.total_companies}</div>
                    </div>
                    <div className="card border-l-4 border-amber-500 p-4">
                        <div className="text-sm text-gray-600">Вакансії</div>
                        <div className="text-3xl font-bold text-amber-600">{data.total_jobs}</div>
                    </div>
                    <div className="card border-l-4 border-rose-600 p-4">
                        <div className="text-sm text-gray-600">Заявки</div>
                        <div className="text-3xl font-bold text-rose-600">{data.total_applications}</div>
                    </div>
                </div>
            ) : (
                <LoadingSkeleton lines={4} />
            )}


            {/* Recent users */}
            <div className="card p-0">
                <div className="flex items-center justify-between rounded-t-2xl bg-blue-600 px-4 py-3 text-white">
                    <span>Останні користувачі</span>
                    <span className="badge bg-white text-blue-700">{data?.recent_users?.length || 0}</span>
                </div>
                <div className="p-4">
                    {data ? (
                        <Table columns={userCols} data={data.recent_users || []} empty="Немає користувачів" />
                    ) : (
                        <LoadingSkeleton lines={5} />
                    )}
                </div>
            </div>
            {/* Pending companies */}
            <div className="card p-0">
                <div className="flex items-center justify-between rounded-t-2xl bg-amber-400 px-4 py-3 text-black">
                    <span>Компанії на верифікацію</span>
                    <span className="badge bg-black text-amber-400">{data?.pending_companies?.length || 0}</span>
                </div>
                <div className="p-4">
                    {data ? (
                        <Table columns={pendingCols} data={data.pending_companies || []} empty="Немає компаній для верифікації" />
                    ) : (
                        <LoadingSkeleton lines={4} />
                    )}
                </div>
            </div>
        </div>
    )
}