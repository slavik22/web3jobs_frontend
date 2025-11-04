import { useEffect, useState } from 'react'
import StatCard from './StatCard'

function useCountUp(target = 0, duration = 600) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!target) return setValue(0)
    const start = performance.now()
    let raf
    const tick = (t) => {
      const p = Math.min((t - start) / duration, 1)
      setValue(Math.floor(p * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

export default function StatsGrid({ stats }) {
  const total = useCountUp(stats?.total_jobs || 0)
  const dao = useCountUp(stats?.dao_jobs || 0)
  const companies = useCountUp(stats?.companies || 0)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard value={total} label="Активних вакансій" />
      <StatCard value={dao} label="DAO вакансій" />
      <StatCard value={companies} label="Компаній" />
    </div>
  )
}
