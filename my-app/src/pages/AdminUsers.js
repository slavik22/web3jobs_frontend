import React, { useEffect, useState } from 'react'
import Table from '../components/Table'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { apiBase } from '../config'
import { apiFetch } from '../lib/api'


export default function AdminUsers() {
    const [users, setUsers] = useState(null)


    useEffect(() => {
        (async () => {
            try {
                const r = await apiFetch(`/admin/users`)
                const d = await r.json()
                if (d.ok) setUsers(d.users || [])
                else setUsers([])
            } catch {
                setUsers([])
            }
        })()
    }, [])


    const cols = [
        { header: 'Email', key: 'email', accessor: 'email' },
        { header: 'Роль', key: 'role', accessor: 'role' },
        { header: 'Дата створення', key: 'date', cell: (row) => new Date(row.created_at).toLocaleDateString('uk-UA') },
    ]


    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <h1 className="text-2xl font-bold">Список користувачів</h1>
            {users === null ? (
                <LoadingSkeleton lines={8} />
            ) : (
                <Table columns={cols} data={users} />
            )}
        </div>
    )
}