import React, { useEffect, useState } from 'react'
import Toast from '../components/Toast'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { apiFetch } from '../lib/api'

export default function ProfilePage() {
    const CHAINS = ['ethereum', 'polygon', 'solana', 'arbitrum', 'optimism', 'other'];

    const [form, setForm] = useState(null)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState({ message: '', type: 'success' })

    useEffect(() => {
        (async () => {
            try {
                const r = await apiFetch(`/profile`)
                const d = await r.json()
                if (d.ok) {
                    // d.profile вже містить email та role з бекенду
                    setForm(d.profile || {})
                } else {
                    setForm({})
                }
            } catch (e) {
                setForm({})
                setToast({ message: 'Не вдалось завантажити профіль', type: 'error' })
            }
        })()
    }, [])

    function update(k, v) { setForm(f => ({ ...f, [k]: v })) }

    async function onSubmit(e) {
        e.preventDefault()
        try {
            setSaving(true)
            const r = await apiFetch(`/profile`, {
                method: 'PUT',
                body: JSON.stringify(form)
            })
            const d = await r.json()
            if (!r.ok || !d.ok) throw new Error(d.message || 'Помилка оновлення')
            setForm(d.profile || form)
            setToast({ message: 'Профіль оновлено!', type: 'success' })
        } catch (e) {
            setToast({ message: e.message, type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    if (form === null) {
        return (
            <div className="mx-auto max-w-4xl">
                <LoadingSkeleton lines={10} />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl">
            <Toast {...toast} onClose={() => setToast({ message: '' })} />
            <div className="card p-6">
                <h1 className="mb-4 text-2xl font-bold">Мій профіль</h1>

                <form onSubmit={onSubmit} className="space-y-6">
                    {/* NEW: акаунт (email + роль) */}
                    <div>
                        <h5 className="mb-3 text-blue-600">👤 Акаунт</h5>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="label">Email</label>
                                <input
                                    className="input"
                                    type="email"
                                    value={form.email || ''}
                                    onChange={(e) => update('email', e.target.value)}
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="label">Роль</label>
                                <select
                                    className="input"
                                    value={form.role || 'user'}
                                    onChange={(e) => update('role', e.target.value)}
                                >
                                    <option value="user">Кандидат</option>
                                    <option value="recruiter">Рекрутер</option>
                                </select>
                            </div>
                        </div>

                        {/* <div>
                            <label className="label">Основний блокчейн</label>
                            <select
                            disabled
                                className="input"
                                value={form.blockchain || ''}
                                onChange={(e) => update('blockchain', e.target.value)}
                            >
                                <option value="">Не вказано</option>
                                {CHAINS.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div> */}

                    </div>

                    {/* Контакти */}
                    <div>
                        <h5 className="mb-3 text-blue-600">📞 Контакти</h5>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="label">Повне ім’я</label>
                                <input
                                    className="input"
                                    value={form.full_name || ''}
                                    onChange={(e) => update('full_name', e.target.value)}
                                    placeholder="Ім’я та прізвище"
                                />
                            </div>
                            <div>
                                <label className="label">Телефон</label>
                                <input
                                    className="input"
                                    value={form.phone || ''}
                                    onChange={(e) => update('phone', e.target.value)}
                                    placeholder="+380..."
                                />
                            </div>
                            <div>
                                <label className="label">Telegram</label>
                                <input
                                    className="input"
                                    value={form.telegram || ''}
                                    onChange={(e) => update('telegram', e.target.value)}
                                    placeholder="@username"
                                />
                            </div>
                            <div>
                                <label className="label">Discord</label>
                                <input
                                    className="input"
                                    value={form.discord || ''}
                                    onChange={(e) => update('discord', e.target.value)}
                                    placeholder="username#0000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Соцмережі */}
                    <div>
                        <h5 className="mb-3 text-blue-600">🌐 Соцмережі та портфоліо</h5>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="label">GitHub</label>
                                <input
                                    className="input"
                                    value={form.github || ''}
                                    onChange={(e) => update('github', e.target.value)}
                                    placeholder="github.com/..."
                                />
                            </div>
                            <div>
                                <label className="label">LinkedIn</label>
                                <input
                                    className="input"
                                    value={form.linkedin || ''}
                                    onChange={(e) => update('linkedin', e.target.value)}
                                    placeholder="linkedin.com/in/..."
                                />
                            </div>
                            <div>
                                <label className="label">Портфоліо</label>
                                <input
                                    className="input"
                                    value={form.portfolio_url || ''}
                                    onChange={(e) => update('portfolio_url', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="label">ENS Domain</label>
                                <input
                                    className="input"
                                    value={form.ens_domain || ''}
                                    onChange={(e) => update('ens_domain', e.target.value)}
                                    placeholder="yourname.eth"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Професія */}
                    <div>
                        <h5 className="mb-3 text-blue-600">💼 Досвід та навички</h5>
                        <div className="grid gap-4">
                            <div>
                                <label className="label">Навички</label>
                                <textarea
                                    className="input min-h-[72px]"
                                    value={form.skills || ''}
                                    onChange={(e) => update('skills', e.target.value)}
                                    placeholder="Наприклад: Python, Solidity, React"
                                />
                            </div>
                            <div>
                                <label className="label">Роки досвіду</label>
                                <input
                                    className="input"
                                    value={form.experience_years || ''}
                                    onChange={(e) => update('experience_years', e.target.value)}
                                    placeholder="3"
                                />
                            </div>
                            <div>
                                <label className="label">Біо</label>
                                <textarea
                                    className="input min-h-[90px]"
                                    value={form.bio || ''}
                                    onChange={(e) => update('bio', e.target.value)}
                                    placeholder="Коротка інформація про себе"
                                />
                            </div>
                            <div>
                                <label className="label">Улюблені токени</label>
                                <input
                                    className="input"
                                    value={form.preferred_tokens || ''}
                                    onChange={(e) => update('preferred_tokens', e.target.value)}
                                    placeholder="ETH, SOL, MATIC"
                                />
                            </div>
                            <div>
                                <label className="label">NFT портфоліо</label>
                                <textarea
                                    className="input min-h-[72px]"
                                    value={form.nft_portfolio || ''}
                                    onChange={(e) => update('nft_portfolio', e.target.value)}
                                    placeholder="Посилання або короткий опис"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="btn btn-primary w-full" disabled={saving}>
                            {saving ? 'Збереження…' : '💾 Оновити профіль'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
