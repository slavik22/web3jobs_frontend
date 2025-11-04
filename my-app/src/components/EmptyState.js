export default function EmptyState({ title = 'Порожньо', subtitle = '' }) {
  return (
    <div className="rounded-2xl border bg-white p-10 text-center">
      <div className="mx-auto mb-2 h-14 w-14 rounded-full bg-gray-100" />
      <h4 className="text-lg font-semibold">{title}</h4>
      {subtitle && <p className="text-gray-500">{subtitle}</p>}
    </div>
  )
}
