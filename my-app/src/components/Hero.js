import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

export default function Hero() {
  const [pulse, setPulse] = useState(false)
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative overflow-hidden rounded-3xl border bg-white">
      {/* градієнтний фон */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 blur-3xl" />
      </div>

      <div className="relative z-10 px-6 py-14 text-center md:px-12 md:py-20">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight md:text-5xl">
          Знайди роботу в Web3 🚀
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
          Перша платформа з зарплатами в криптовалюті, роботою в DAO та on-chain верифікацією
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <a href="/register" className="btn btn-primary">
            Почати зараз
          </a>
          <a href="#features" className="btn btn-outline">
            Дізнатись більше
          </a>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-sm text-gray-600 backdrop-blur">
          <Sparkles className={`h-4 w-4 ${pulse ? 'opacity-100' : 'opacity-60'} transition`} />
          Нові вакансії додаються щодня
        </div>
      </div>
    </section>
  )
}
