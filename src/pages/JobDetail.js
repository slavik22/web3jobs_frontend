import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../components/Toast';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { apiFetch } from '../lib/api';
import { isAuthenticated, getUser } from '../lib/auth';
import { apiBase } from '../config';

function Pill({ children, tone = 'gray' }) {
  const tones = {
    gray: 'bg-gray-100 text-gray-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [applying, setApplying] = useState(false);

  const [apps, setApps] = useState(null);
  const [appsLoading, setAppsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(false);

  async function openCandidateModal(app) {
    setSelectedApp(app);
    setCandidateDetails(null);
    setCandidateModalOpen(true);

    // Уже маємо базове: ім'я/емейл/резюме з app.* — покажемо відразу.
    // Якщо на бекенді є ендпойнт детальної інфи — підтягнемо (не обов’язково).
    const userId = app.user_id;
    console.log('Loading candidate details for user ID:', userId);
    if (!userId) return;

    try {
      setCandidateLoading(true);
      const res = await apiFetch(`/recruiter/candidate/${userId}`);
      const data = await res.json();
      console.log('Candidate details:', data);
      if (res.ok && data?.ok) {
        setCandidateDetails(data.candidate);
      }
    } catch (_) {
      // тихо ігноруємо — покажемо що є з application
    } finally {
      setCandidateLoading(false);
    }
  }

  function closeCandidateModal() {
    setCandidateModalOpen(false);
    setSelectedApp(null);
    setCandidateDetails(null);
  }

  // нотатки (опціонально)
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');

  const [toast, setToast] = useState({ message: '', type: 'success' });

  const me = useMemo(() => (isAuthenticated() ? getUser() : null), []);

  useEffect(() => {
    let ignore = false;
    async function loadApps() {
      if (!job) return;
      // Можна спробувати завжди; бек сам відфільтрує доступ
      setAppsLoading(true);
      try {
        const res = await apiFetch(`/recruiter/job/${job.id}/applications`);
        const data = await res.json();
        if (!ignore && data?.ok) {
          setApps(data.applications || []);
        }
      } catch {
        // ігноруємо помилку/403 — просто не показуємо блок
      } finally {
        if (!ignore) setAppsLoading(false);
      }
    }
    loadApps();
    return () => { ignore = true; };
  }, [job]);


  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await apiFetch(`/job/${id}`);
        const data = await res.json();
        if (!ignore) {
          if (data?.ok) {
            setJob(data.job);
            setHasApplied(!!data.has_applied);
          } else {
            setJob(null);
          }
        }
      } catch {
        if (!ignore) setJob(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [id]);

  const STATUS_OPTIONS = [
    { value: 'pending', label: 'Очікує' },
    { value: 'reviewing', label: 'Розгляд' },
    { value: 'interview', label: 'Інтерв\'ю' },
    { value: 'offer', label: 'Оффер' },
    { value: 'rejected', label: 'Відхилено' },
  ];

  async function updateAppStatus(appId, status) {
    try {
      setUpdatingId(appId);
      const res = await apiFetch(`/recruiter/application/${appId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.message || 'Не вдалося оновити статус');
      setApps((lst) => lst.map(a => a.id === appId ? { ...a, status } : a));
      setToast({ message: 'Статус оновлено', type: 'success' });
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  }

  function openNote(app) {
    setEditingNoteId(app.id);
    setNoteDraft(app.recruiter_notes || '');
  }
  function closeNote() {
    setEditingNoteId(null);
    setNoteDraft('');
  }
  async function saveNote() {
    const appId = editingNoteId;
    try {
      setUpdatingId(appId);
      const res = await apiFetch(`/recruiter/application/${appId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recruiter_notes: noteDraft }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.message || 'Не вдалося зберегти нотатку');
      setApps((lst) => lst.map(a => a.id === appId ? { ...a, recruiter_notes: noteDraft } : a));
      setToast({ message: 'Нотатку збережено', type: 'success' });
      closeNote();
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  }

  function StatusBadge({ status }) {
    const tone = {
      pending: 'bg-amber-50 text-amber-700',
      reviewing: 'bg-blue-50 text-blue-700',
      interview: 'bg-indigo-50 text-indigo-700',
      offer: 'bg-emerald-50 text-emerald-700',
      rejected: 'bg-rose-50 text-rose-700',
    }[status] || 'bg-gray-100 text-gray-700';
    const label = STATUS_OPTIONS.find(s => s.value === status)?.label || status || '—';
    return <span className={`rounded px-2 py-1 text-xs ${tone}`}>{label}</span>;
  }

  function StatusSelect({ value, onChange, disabled }) {
    return (
      <select
        className="select select-bordered select-sm"
        value={value || 'pending'}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {STATUS_OPTIONS.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    );
  }

  async function submitApplication(e) {
    e.preventDefault();
    if (!isAuthenticated()) {
      setToast({ message: 'Увійдіть, щоб подати заявку.', type: 'info' });
      navigate('/login', { state: { redirectTo: `/jobs/${id}` } });
      return;
    }
    if (me?.role !== 'user') {
      setToast({ message: 'Лише кандидати можуть подавати заявки.', type: 'error' });
      return;
    }

    try {
      setApplying(true);
      const res = await apiFetch(`/job/${id}/apply`, {
        method: 'POST', // якщо на бекенді PUT — заміни тут
        body: JSON.stringify({ cover_letter: coverLetter, resume_url: resumeUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.message || 'Не вдалося відправити заявку');
      setHasApplied(true);
      setToast({ message: 'Заявку відправлено! 🚀', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LoadingSkeleton lines={12} />
        </div>
        <div className="lg:col-span-1">
          <LoadingSkeleton lines={8} />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl border bg-white p-8 text-center text-gray-600">
        <i className="bi bi-info-circle mr-2" />
        Вакансію не знайдено.
      </div>
    );
  }

  const c = job.company || {};
  const canApply = me && me.role === 'user' && !hasApplied;

  return (
    <div className="max-w-6xl mx-auto">
      <Toast {...toast} onClose={() => setToast({ message: '' })} />

      <div className="mb-6">
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left mr-1" />
          Назад
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <i className="bi bi-building" />
                  {c.name || '—'}
                  {c.is_verified ? (
                    <i className="bi bi-patch-check-fill text-blue-500" title="Верифікована" />
                  ) : null}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {job.location_type && (
                    <Pill>
                      <i className="bi bi-geo-alt" /> {job.location_type}
                    </Pill>
                  )}
                  {job.job_type && (
                    <Pill>
                      <i className="bi bi-briefcase" /> {job.job_type}
                    </Pill>
                  )}
                  {job.is_dao_job && (
                    <Pill tone="indigo">
                      <i className="bi bi-people" /> DAO
                    </Pill>
                  )}
                  {job.uses_escrow && (
                    <Pill tone="emerald">
                      <i className="bi bi-lock" /> Escrow
                    </Pill>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-2">Опис</h3>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {job.description || '—'}
                </p>
              </section>

              {job.requirements ? (
                <section>
                  <h3 className="text-lg font-semibold mb-2">Вимоги</h3>
                  <pre className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-xl border text-sm">
                    {job.requirements}
                  </pre>
                </section>
              ) : null}

              {job.responsibilities ? (
                <section>
                  <h3 className="text-lg font-semibold mb-2">Обовʼязки</h3>
                  <pre className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-xl border text-sm">
                    {job.responsibilities}
                  </pre>
                </section>
              ) : null}

              {/* Extra meta */}
              <section className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-500">Локація</div>
                  <div className="font-medium">{job.location || '—'}</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-500">Досвід</div>
                  <div className="font-medium">{job.experience_level || '—'}</div>
                </div>
              </section>
            </div>
          </div>

          {/* Apply block for small screens */}
          <div className="lg:hidden">
            <ApplyPanel
              job={job}
              canApply={canApply}
              hasApplied={hasApplied}
              applying={applying}
              coverLetter={coverLetter}
              setCoverLetter={setCoverLetter}
              resumeUrl={resumeUrl}
              setResumeUrl={setResumeUrl}
              submitApplication={submitApplication}
              onLogin={() => navigate('/login', { state: { redirectTo: `/jobs/${id}` } })}
              role={me?.role}
            />
          </div>
        </div>

        {/* === РЕКРУТЕРСЬКИЙ БЛОК: Заявки на цю вакансію === */}
        {apps !== null && isAuthenticated() && me?.role === 'recruiter' && (
          <div className="rounded-2xl border bg-white p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Заявки на вакансію</h3>
              {appsLoading && <span className="text-sm text-gray-500">Оновлення…</span>}
            </div>

            {apps.length === 0 ? (
              <div className="text-gray-600 text-sm">Поки немає заявок.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left">Кандидат</th>
                      <th className="px-4 py-2 text-left">Резюме</th>
                      <th className="px-4 py-2 text-left">Лист</th>
                      <th className="px-4 py-2 text-left">Статус</th>
                      <th className="px-4 py-2 text-left">Нотатки</th>
                      <th className="px-4 py-2 text-right">Подано</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map(app => (
                      <tr key={app.id} className="border-t">
                        <td className="px-4 py-2">
                          <button
                            className="font-medium link"
                            onClick={() => openCandidateModal(app)}
                            title="Переглянути профіль кандидата"
                          >
                            {app.candidate_name || app.user?.name || '—'}
                          </button>
                          <div className="text-xs text-gray-500">{app.user?.email || '—'}</div>
                        </td>
                        <td className="px-4 py-2">
                          {app.resume_url ? (
                            <a href={app.resume_url} className="link" target="_blank" rel="noreferrer">Відкрити</a>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2 max-w-[360px]">
                          <div className="line-clamp-3 whitespace-pre-wrap text-gray-800">
                            {app.cover_letter || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={app.status} />
                            <StatusSelect
                              value={app.status}
                              onChange={(val) => updateAppStatus(app.id, val)}
                              disabled={updatingId === app.id}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <button className="btn btn-ghost btn-sm" onClick={() => openNote(app)}>
                            {app.recruiter_notes ? 'Редагувати' : 'Додати'}
                          </button>
                        </td>
                        <td className="px-4 py-2 text-right text-gray-600">
                          {app.applied_at ? new Date(app.applied_at).toLocaleString('uk-UA') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}


        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <div className="rounded-2xl border bg-white p-5 space-y-4">
              <h3 className="font-semibold">Умови</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Зарплата</span>
                  <span className="font-medium">
                    {(job.salary_min ?? '—')} – {(job.salary_max ?? '—')} {job.salary_token || 'USDC'}
                  </span>
                </div>
                {job.salary_usd_equivalent ? (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">≈ в USD</span>
                    <span className="font-medium">${job.salary_usd_equivalent}</span>
                  </div>
                ) : null}
                {job.skills_required ? (
                  <div className="pt-2">
                    <div className="text-gray-600 mb-1">Ключові навички</div>
                    <div className="flex flex-wrap gap-2">
                      {String(job.skills_required)
                        .split(',')
                        .map((s, i) => (
                          <span key={i} className="rounded bg-gray-100 px-2 py-1 text-xs">
                            {s.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="hidden lg:block mt-4">
              <ApplyPanel
                job={job}
                canApply={canApply}
                hasApplied={hasApplied}
                applying={applying}
                coverLetter={coverLetter}
                setCoverLetter={setCoverLetter}
                resumeUrl={resumeUrl}
                setResumeUrl={setResumeUrl}
                submitApplication={submitApplication}
                onLogin={() => navigate('/login', { state: { redirectTo: `/jobs/${id}` } })}
                role={me?.role}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Modal: recruiter notes */}
      {editingNoteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Нотатки рекрутера</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeNote}>✕</button>
            </div>
            <textarea
              className="textarea textarea-bordered w-full min-h-[160px]"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Внутрішні нотатки (кандидат їх не бачить)"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={closeNote}>Скасувати</button>
              <button className={`btn btn-primary ${updatingId === editingNoteId ? 'btn-disabled' : ''}`} onClick={saveNote}>
                {updatingId === editingNoteId ? 'Збереження…' : 'Зберегти'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Candidate details */}
{candidateModalOpen && selectedApp && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Кандидат: {selectedApp.candidate_name || selectedApp.user?.name || '—'}
        </h3>
        <button className="btn btn-ghost btn-sm" onClick={closeCandidateModal}>✕</button>
      </div>

      {/* Шапка з базовими даними */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">Емейл</div>
          <div className="font-medium">{selectedApp.user?.email || '—'}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">Подано</div>
          <div className="font-medium">
            {selectedApp.applied_at ? new Date(selectedApp.applied_at).toLocaleString('uk-UA') : '—'}
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">Статус</div>
          <div className="font-medium">{selectedApp.status || '—'}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">Резюме</div>
          <div className="font-medium">
            {selectedApp.resume_url
              ? <a href={selectedApp.resume_url} className="link" target="_blank" rel="noreferrer">Відкрити</a>
              : '—'}
          </div>
        </div>
      </div>

      {/* Супровідний лист */}
      <div className="mt-4">
        <div className="text-xs text-gray-500">Супровідний лист</div>
        <pre className="whitespace-pre-wrap text-sm bg-gray-50 rounded-xl border p-3">
          {selectedApp.cover_letter || '—'}
        </pre>
      </div>

      {/* Рекрутерські нотатки (read-only у цій модалці; редагування як і раніше у таблиці) */}
      {selectedApp.recruiter_notes ? (
        <div className="mt-4">
          <div className="text-xs text-gray-500">Внутрішні нотатки</div>
          <pre className="whitespace-pre-wrap text-sm bg-amber-50 rounded-xl border p-3">
            {selectedApp.recruiter_notes}
          </pre>
        </div>
      ) : null}

      {/* Розширені дані, якщо підтягнули */}
      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2">
          <h4 className="font-semibold">Профіль кандидата</h4>
          {candidateLoading && <span className="text-xs text-gray-500">Завантаження…</span>}
        </div>

        {(candidateDetails && Object.keys(candidateDetails).length > 0) ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {candidateDetails.full_name && (
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">Повне ім’я</div>
                <div className="font-medium">{candidateDetails.full_name}</div>
              </div>
            )}
            {candidateDetails.phone && (
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">Телефон</div>
                <div className="font-medium">{candidateDetails.phone}</div>
              </div>
            )}
            {candidateDetails.location && (
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">Локація</div>
                <div className="font-medium">{candidateDetails.location}</div>
              </div>
            )}
            {candidateDetails.github && (
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">GitHub</div>
                <a className="link font-medium" href={candidateDetails.github} target="_blank" rel="noreferrer">
                  {candidateDetails.github}
                </a>
              </div>
            )}
            {candidateDetails.linkedin && (
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">LinkedIn</div>
                <a className="link font-medium" href={candidateDetails.linkedin} target="_blank" rel="noreferrer">
                  {candidateDetails.linkedin}
                </a>
              </div>
            )}
            {candidateDetails.portfolio && (
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">Портфоліо</div>
                <a className="link font-medium" href={candidateDetails.portfolio} target="_blank" rel="noreferrer">
                  {candidateDetails.portfolio}
                </a>
              </div>
            )}
            {candidateDetails.skills?.length ? (
              <div className="sm:col-span-2 rounded-xl border p-3">
                <div className="text-xs text-gray-500">Навички</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {candidateDetails.skills.split(',').map((s, i) => (
                    <span key={i} className="rounded bg-gray-100 px-2 py-1 text-xs">{s.trim()}</span>
                  ))}
                </div>
              </div>
            ) : null}
            {candidateDetails.bio && (
              <div className="sm:col-span-2">
                <div className="text-xs text-gray-500">Біо</div>
                <p className="mt-1 whitespace-pre-wrap">{candidateDetails.bio}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Додаткових даних немає. Показано інформацію із заявки.
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button className="btn btn-ghost" onClick={closeCandidateModal}>Закрити</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

/** Правий “липкий” блок з формою подачі */
function ApplyPanel({
  job,
  canApply,
  hasApplied,
  applying,
  coverLetter,
  setCoverLetter,
  resumeUrl,
  setResumeUrl,
  submitApplication,
  onLogin,
  role,
}) {
  if (!isAuthenticated()) {
    return (
      <div className="rounded-2xl border bg-white p-5">
        <p className="text-sm text-gray-600 mb-3">
          Увійдіть, щоб подати заявку на <span className="font-medium">{job.title}</span>.
        </p>
        <button className="btn btn-primary w-full" onClick={onLogin}>
          <i className="bi bi-box-arrow-in-right mr-1" />
          Увійти
        </button>
      </div>
    );
  }

  if (role !== 'user') {
    return (
      <div className="rounded-2xl border bg-white p-5">
        <div className="text-sm text-gray-600">
          Ваша роль: <span className="font-semibold">{role}</span>. Тільки кандидати можуть подавати заявки.
        </div>
      </div>
    );
  }

  if (hasApplied) {
    return (
      <div className="rounded-2xl border bg-white p-5">
        <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm">
          <i className="bi bi-check2-circle mr-1" />
          Ви вже подали заявку на цю вакансію.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-5">
      <h3 className="font-semibold mb-3">Подати заявку</h3>
      <form onSubmit={submitApplication} className="space-y-3">
        <div>
          <label className="label">Супровідний лист</label>
          <textarea
            className="input min-h-[100px]"
            placeholder="Коротко про релевантний досвід, посилання на проєкти, GitHub тощо"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Посилання на резюме</label>
          <input
            className="input"
            type="url"
            placeholder="https://..."
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
          />
        </div>
        <button className="btn btn-success w-full" disabled={applying}>
          {applying ? 'Відправляємо…' : 'Подати заявку'}
        </button>
      </form>
    </div>
  );
}
