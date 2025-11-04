import React, { useEffect, useMemo, useState } from 'react'
import Table from '../components/Table'
import LoadingSkeleton from '../components/LoadingSkeleton'
import Toast from '../components/Toast'
import { apiFetch } from '../lib/api'
import { Link } from 'react-router-dom'

function CompanyFormModal({ open, initial, mode = 'edit', onClose, onSaved, setToast }) {
    const [form, setForm] = useState({
        name: '',
        website: '',
        description: '',
        logo_url: '',
        company_type: '',
        treasury_address: '',
        token_symbol: '',
        founded_year: '',
        team_size: '',
        location: '',
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open) {
            setForm({
                name: initial?.name || '',
                website: initial?.website || '',
                description: initial?.description || '',
                logo_url: initial?.logo_url || '',
                company_type: initial?.company_type || '',
                treasury_address: initial?.treasury_address || '',
                token_symbol: initial?.token_symbol || '',
                founded_year: initial?.founded_year || '',
                team_size: initial?.team_size || '',
                location: initial?.location || '',
            })
        }
    }, [open, initial])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((s) => ({ ...s, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const url = mode === 'create' ? '/recruiter/company' : '/recruiter/company/edit'
            const r = await apiFetch(url, {
                method: mode === 'create' ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    founded_year: form.founded_year ? Number(form.founded_year) : null,
                    team_size: form.team_size ? Number(form.team_size) : null,
                })
            })
            const d = await r.json()
            if (!d.ok) throw new Error(d.message || 'Помилка збереження')
            setToast({ message: d.message || 'Збережено', type: 'success' })
            onSaved(d.company)
            onClose()
        } catch (err) {
            setToast({ message: err.message || 'Не вдалося зберегти', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">
                        {mode === 'create' ? 'Нова компанія' : 'Редагувати компанію'}
                    </h3>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="label">Назва *</label>
                        <input name="name" required className="input input-bordered w-full"
                            value={form.name} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="label">Сайт</label>
                        <input name="website" className="input input-bordered w-full"
                            value={form.website} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="label">Логотип (URL)</label>
                        <input name="logo_url" className="input input-bordered w-full"
                            value={form.logo_url} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="label">Тип компанії</label>
                        <input name="company_type" className="input input-bordered w-full"
                            value={form.company_type} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="label">Локація</label>
                        <input name="location" className="input input-bordered w-full"
                            value={form.location} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="label">Рік заснування</label>
                        <input name="founded_year" type="number" className="input input-bordered w-full"
                            value={form.founded_year} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="label">Розмір команди</label>
                        <input name="team_size" type="number" className="input input-bordered w-full"
                            value={form.team_size} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="label">Символ токена</label>
                        <input name="token_symbol" className="input input-bordered w-full"
                            value={form.token_symbol} onChange={handleChange} />
                    </div>

                    <div className="md:col-span-2">
                        <label className="label">Казначейська адреса</label>
                        <input name="treasury_address" className="input input-bordered w-full"
                            value={form.treasury_address} onChange={handleChange} />
                    </div>

                    <div className="md:col-span-2">
                        <label className="label">Опис</label>
                        <textarea name="description" rows={4} className="textarea textarea-bordered w-full"
                            value={form.description} onChange={handleChange} />
                    </div>

                    <div className="md:col-span-2 mt-2 flex items-center justify-end gap-2">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Скасувати</button>
                        <button type="submit" className={`btn btn-primary ${saving ? 'btn-disabled' : ''}`}>
                            {saving ? 'Збереження…' : 'Зберегти'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function RecruiterDashboard() {
    const [data, setData] = useState({ company: null, jobs: null, total_applications: 0, pending_applications: 0 })
    const [toast, setToast] = useState({ message: '', type: 'success' })

    const [companyModalOpen, setCompanyModalOpen] = useState(false)
    const [companyMode, setCompanyMode] = useState('edit') // 'edit' | 'create'

    useEffect(() => {
        (async () => {
            try {
                // можна лишити ваш /recruiter/dashboard — він уже повертає company
                const r = await apiFetch(`/recruiter/dashboard`)
                const d = await r.json()
                console.log('Recruiter dashboard data:', d);
                if (d.ok) setData(d)
                else setToast({ message: d.message || 'Помилка завантаження', type: 'error' })
            } catch (e) {
                setToast({ message: 'Не вдалось завантажити дані', type: 'error' })
            }
        })()
    }, [])

    const jobCols = useMemo(() => ([
        {
            header: 'Назва',
            key: 'title',
            cell: (row) => (
                <Link to={`/jobs/${row.id}`} className="link font-medium">
                    {row.title}
                </Link>
            ),
        },
        {
            header: 'Створено',
            key: 'created',
            cell: (row) => new Date(row.created_at).toLocaleDateString('uk-UA'),
        },
        {
            header: 'Дії',
            key: 'actions',
            cell: (row) => (
                <div className="flex gap-2 justify-center">
                    <Link to={`/jobs/${row.id}`} className="btn btn-ghost btn-sm">Деталі</Link>
                </div>
            ),
        },
    ]), []);

    const openCreateCompany = () => { setCompanyMode('create'); setCompanyModalOpen(true) }
    const openEditCompany = () => { setCompanyMode('edit'); setCompanyModalOpen(true) }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <Toast {...toast} onClose={() => setToast({ message: '' })} />

            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Дашборд рекрутера</h1>
                {data.company ? (
                    <p className="text-gray-600">Компанія: <span className="font-semibold">{data.company.name}</span></p>
                ) : (
                    <p className="text-gray-500">Компанія ще не створена.</p>
                )}
            </div>

            {/* Company */}
            <div className="card p-6">
                <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Моя компанія</h4>
                    {data.company ? (
                        <button className="btn btn-outline" onClick={openEditCompany}>Редагувати</button>
                    ) : (
                        <button className="btn btn-primary" onClick={openCreateCompany}>+ Додати компанію</button>
                    )}
                </div>

                {data.company ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="md:col-span-2 space-y-2">
                            <div><span className="text-gray-500">Назва:</span> <span className="font-medium">{data.company.name}</span></div>
                            {data.company.website && <div><span className="text-gray-500">Сайт:</span> <a className="link" href={data.company.website} target="_blank" rel="noreferrer">{data.company.website}</a></div>}
                            {data.company.company_type && <div><span className="text-gray-500">Тип:</span> {data.company.company_type}</div>}
                            {data.company.location && <div><span className="text-gray-500">Локація:</span> {data.company.location}</div>}
                            <div className="flex gap-6">
                                {data.company.founded_year && <div><span className="text-gray-500">Рік засн.:</span> {data.company.founded_year}</div>}
                                {data.company.team_size && <div><span className="text-gray-500">Команда:</span> {data.company.team_size}</div>}
                            </div>
                            {(data.company.token_symbol || data.company.treasury_address) && (
                                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                                    <div className="font-semibold mb-1">Токеноміка</div>
                                    {data.company.token_symbol && <div>Символ: {data.company.token_symbol}</div>}
                                    {data.company.treasury_address && <div className="break-all">Treasury: {data.company.treasury_address}</div>}
                                </div>
                            )}
                            {data.company.description && (
                                <div>
                                    <div className="text-gray-500">Опис:</div>
                                    <p className="mt-1 whitespace-pre-wrap">{data.company.description}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-start justify-center">
                            {data.company.logo_url ? (
                                <img
                                    src={data.company.logo_url}
                                    alt="Logo"
                                    className="h-24 w-24 rounded-xl object-contain ring-1 ring-gray-200"
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-100 text-gray-400 ring-1 ring-gray-200">
                                    Лого
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500">Немає даних компанії. Створіть її, щоб публікувати вакансії від імені бренду.</div>
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="card p-6 text-center">
                    <h6 className="text-gray-500">Загальна кількість заявок</h6>
                    <div className="text-3xl font-extrabold text-blue-600">{data.metrics?.total_applications || 0}</div>
                </div>
                <div className="card p-6 text-center">
                    <h6 className="text-gray-500">Очікують розгляду</h6>
                    <div className="text-3xl font-extrabold text-amber-600">{data.metrics?.pending_applications || 0}</div>
                </div>
            </div>

            {/* Jobs */}
            <div className="card p-6">
                <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Мої вакансії</h4>
                    <a href="/recruiter/job/create" className="btn btn-primary">+ Створити вакансію</a>
                </div>
                {data.jobs === null ? (
                    <LoadingSkeleton lines={6} />
                ) : (
                    <Table columns={jobCols} data={data.jobs} empty="Ви ще не створили жодної вакансії." />
                )}
            </div>

            {/* Modal */}
            <CompanyFormModal
                open={companyModalOpen}
                initial={companyMode === 'edit' ? data.company : null}
                mode={companyMode}
                onClose={() => setCompanyModalOpen(false)}
                onSaved={(company) => setData((s) => ({ ...s, company }))}
                setToast={setToast}
            />
        </div>
    )
}
