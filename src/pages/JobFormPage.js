import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../components/Toast';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ChipInput from '../components/ChipInput';
import Tag from '../components/Tag';
import { apiFetch } from '../lib/api';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'dao-contributor'];
const LEVELS = ['junior', 'mid', 'senior', 'lead'];
const LOCATION_TYPES = ['remote', 'hybrid', 'onsite'];
const TOKENS = ['USDC', 'ETH', 'DAI', 'USDT', 'SOL'];

export default function JobFormPage() {

  const BLOCKCHAINS = ['ethereum', 'polygon', 'solana', 'arbitrum', 'optimism', 'other'];

  const { id } = useParams();          // якщо є id — редагуємо
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit); // при редагуванні — завантажимо job
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [tab, setTab] = useState('basic'); // basic | details | web3
  const [skills, setSkills] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    salary_min: '',
    blockchain: 'ethereum',
    salary_max: '',
    salary_token: 'USDC',
    salary_usd_equivalent: '',
    job_type: 'full-time',
    experience_level: 'mid',
    location_type: 'remote',
    location: '',
    skills_required: '',
    benefits: '',
    is_dao_job: false,
    uses_escrow: false,
    required_on_chain_proof: false,
    is_active: true,
    escrow_contract: '',
  });

  // якщо редагування — підвантажуємо вакансію
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const r = await apiFetch(`/job/${id}`);
        const d = await r.json();
        if (!r.ok || !d.ok) throw new Error(d.message || 'Не вдалося завантажити вакансію');

        const j = d.job;
        const next = {
          title: j.title || '',
          description: j.description || '',
          requirements: j.requirements || '',
          responsibilities: j.responsibilities || '',
          salary_min: j.salary_min || '',
          salary_max: j.salary_max || '',
          salary_token: j.salary_token || 'USDC',
          salary_usd_equivalent: j.salary_usd_equivalent || '',
          job_type: j.job_type || 'full-time',
          experience_level: j.experience_level || 'mid',
          location_type: j.location_type || 'remote',
          location: j.location || '',
          skills_required: j.skills_required || '',
          benefits: j.benefits || '',
          is_dao_job: !!j.is_dao_job,
          uses_escrow: !!j.uses_escrow,
          required_on_chain_proof: !!j.required_on_chain_proof,
          is_active: !!j.is_active,
          escrow_contract: j.escrow_contract || '',
          blockchain: j.blockchain || 'ethereum',   // 👈 ДОДАЛИ

        };
        setForm(next);

        // ініціалізація skills (json/string)
        const s = tryParseSkills(next.skills_required);
        setSkills(s);
      } catch (e) {
        setToast({ message: e.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  function tryParseSkills(raw) {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(x => String(x)).slice(0, 30);
    } catch { }
    // fallback — розбити за комою
    return String(raw)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 30);
  }

  // синхронізуємо skills у form.skills_required як JSON
  useEffect(() => {
    setForm(f => ({ ...f, skills_required: JSON.stringify(skills) }));
  }, [skills]);

  const salaryRange = useMemo(() => {
    const { salary_min, salary_max, salary_token } = form;
    if (!salary_min && !salary_max) return '—';
    return `${salary_min || '?'} – ${salary_max || '?'} ${salary_token}`;
  }, [form.salary_min, form.salary_max, form.salary_token]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function onSubmit(e) {
    e.preventDefault();
    // проста валідація
    if (!form.title.trim()) return setToast({ message: 'Вкажіть назву вакансії', type: 'error' });
    if (!form.description.trim()) return setToast({ message: 'Додайте опис', type: 'error' });

    setSaving(true);
    try {
      const payload = { ...form };
      // числові
      ['salary_min', 'salary_max', 'salary_usd_equivalent'].forEach(k => {
        if (payload[k] === '' || payload[k] === null) return;
        const n = Number(payload[k]);
        payload[k] = Number.isFinite(n) ? n : null;
      });

      const url = isEdit ? `/recruiter/job/${id}/edit` : `/recruiter/job/create`;
      const method = isEdit ? 'PUT' : 'POST';

      const r = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.message || 'Помилка збереження');

      setToast({ message: isEdit ? 'Вакансію оновлено' : 'Вакансію створено', type: 'success' });

      // показати прев’ю вакансії
      setTimeout(() => navigate(`/jobs/${isEdit ? id : d.job.id}`), 700);
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <LoadingSkeleton lines={14} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Toast {...toast} onClose={() => setToast({ message: '' })} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Редагувати вакансію' : 'Створити вакансію'}
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('basic')}
            className={`px-3 py-2 rounded-lg border ${tab === 'basic' ? 'bg-black text-white' : 'bg-white'}`}
          >
            Basic
          </button>
          <button
            type="button"
            onClick={() => setTab('details')}
            className={`px-3 py-2 rounded-lg border ${tab === 'details' ? 'bg-black text-white' : 'bg-white'}`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => setTab('web3')}
            className={`px-3 py-2 rounded-lg border ${tab === 'web3' ? 'bg-black text-white' : 'bg-white'}`}
          >
            Web3
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* LEFT: FORM */}
        <form onSubmit={onSubmit} className="card p-5 space-y-6">
          {/* BASIC TAB */}
          {tab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="Senior Solidity Engineer"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Job type</label>
                  <select
                    className="input"
                    value={form.job_type}
                    onChange={(e) => update('job_type', e.target.value)}
                  >
                    {JOB_TYPES.map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Experience level</label>
                  <select
                    className="input"
                    value={form.experience_level}
                    onChange={(e) => update('experience_level', e.target.value)}
                  >
                    {LEVELS.map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Location type</label>
                  <select
                    className="input"
                    value={form.location_type}
                    onChange={(e) => update('location_type', e.target.value)}
                  >
                    {LOCATION_TYPES.map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Location</label>
                  <input
                    className="input"
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="EU / Kyiv / Remote"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DETAILS TAB */}
          {tab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-[120px]"
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Що ви робитимете…"
                />
              </div>
              <div>
                <label className="label">Requirements</label>
                <textarea
                  className="input min-h-[100px]"
                  value={form.requirements}
                  onChange={(e) => update('requirements', e.target.value)}
                  placeholder="Що необхідно…"
                />
              </div>
              <div>
                <label className="label">Responsibilities</label>
                <textarea
                  className="input min-h-[100px]"
                  value={form.responsibilities}
                  onChange={(e) => update('responsibilities', e.target.value)}
                  placeholder="Ваші обов’язки…"
                />
              </div>

              <div>
                <label className="label">Skills (натисни Enter щоб додати)</label>
                <ChipInput
                  values={skills}
                  onChange={setSkills}
                  placeholder="Solidity, EVM, Hardhat"
                  maxItems={30}
                />
              </div>

              <div>
                <label className="label">Benefits</label>
                <textarea
                  className="input min-h-[80px]"
                  value={form.benefits}
                  onChange={(e) => update('benefits', e.target.value)}
                  placeholder="Що ми пропонуємо…"
                />
              </div>
            </div>
          )}

          {/* WEB3 TAB */}
          {tab === 'web3' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Salary min</label>
                  <input
                    type="number"
                    className="input"
                    value={form.salary_min}
                    onChange={(e) => update('salary_min', e.target.value)}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="label">Salary max</label>
                  <input
                    type="number"
                    className="input"
                    value={form.salary_max}
                    onChange={(e) => update('salary_max', e.target.value)}
                    placeholder="3000"
                  />
                </div>
                <div>
                  <label className="label">Token</label>
                  <select
                    className="input"
                    value={form.salary_token}
                    onChange={(e) => update('salary_token', e.target.value)}
                  >
                    {TOKENS.map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Approx. USD / month</label>
                <input
                  type="number"
                  className="input"
                  value={form.salary_usd_equivalent}
                  onChange={(e) => update('salary_usd_equivalent', e.target.value)}
                  placeholder="(необов’язково)"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    id="is_dao_job"
                    type="checkbox"
                    checked={form.is_dao_job}
                    onChange={(e) => update('is_dao_job', e.target.checked)}
                  />
                  <label htmlFor="is_dao_job">DAO job</label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="uses_escrow"
                    type="checkbox"
                    checked={form.uses_escrow}
                    onChange={(e) => update('uses_escrow', e.target.checked)}
                  />
                  <label htmlFor="uses_escrow">Smart-contract escrow</label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="required_on_chain_proof"
                    type="checkbox"
                    checked={form.required_on_chain_proof}
                    onChange={(e) => update('required_on_chain_proof', e.target.checked)}
                  />
                  <label htmlFor="required_on_chain_proof">On-chain proof required</label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => update('is_active', e.target.checked)}
                  />
                  <label htmlFor="is_active">Активна</label>
                </div>
              </div>

              {form.uses_escrow && (
                <div>
                  <label className="label">Escrow contract (address)</label>
                  <input
                    className="input"
                    value={form.escrow_contract}
                    onChange={(e) => update('escrow_contract', e.target.value)}
                    placeholder="0x..."
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Блокчейн</label>
                  <select
                    className="input"
                    value={form.blockchain}
                    onChange={(e) => update('blockchain', e.target.value)}
                  >
                    {BLOCKCHAINS.map(x => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Збереження…' : 'Зберегти'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Скасувати
            </button>
          </div>
        </form>

        {/* RIGHT: LIVE PREVIEW */}
        <div className="card p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-1">{form.title || 'Назва вакансії'}</h2>
              <div className="flex flex-wrap gap-2">
                <Tag icon="briefcase">{form.job_type}</Tag>
                <Tag icon="trophy">{form.experience_level}</Tag>
                <Tag icon="geo">{form.location_type}</Tag>
                {form.blockchain && <Tag tone="blue">{form.blockchain}</Tag>}
                {form.is_dao_job && <Tag tone="violet">DAO</Tag>}
                {form.uses_escrow && <Tag tone="green">Escrow</Tag>}
                {form.required_on_chain_proof && <Tag tone="blue">On-chain</Tag>}
                {!form.is_active && <Tag tone="gray">Inactive</Tag>}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{salaryRange}</div>
              {form.salary_usd_equivalent && (
                <div className="text-xs text-gray-500">~ ${form.salary_usd_equivalent}</div>
              )}
            </div>
          </div>

          <div className="prose max-w-none">
            <Section title="Опис" text={form.description} />
            <Section title="Вимоги" text={form.requirements} />
            <Section title="Обов’язки" text={form.responsibilities} />
          </div>

          {skills?.length > 0 && (
            <div>
              <div className="text-sm font-semibold mb-2">Навички</div>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={i} className="px-2 py-1 rounded-full bg-gray-100 text-sm">{s}</span>
                ))}
              </div>
            </div>
          )}

          {form.benefits?.trim() && (
            <div>
              <div className="text-sm font-semibold mb-2">Переваги</div>
              <div className="text-sm text-gray-700 whitespace-pre-line">{form.benefits}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, text }) {
  if (!text?.trim()) return null;
  return (
    <div className="space-y-1">
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-sm text-gray-700 whitespace-pre-line">{text}</div>
    </div>
  );
}
