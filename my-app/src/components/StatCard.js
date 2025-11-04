export default function StatCard({ value, label }) {
  return (
    <div className="card text-center p-6">
      <div className="text-4xl font-extrabold tracking-tight">{value}</div>
      <p className="mt-1 text-gray-500">{label}</p>
    </div>
  )
}
