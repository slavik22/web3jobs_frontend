// src/components/Toast.js
import { CheckCircle2, Info } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null
  const isError = type === 'error'
  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
      <div
        className={`card flex items-center gap-2 px-4 py-3 ${
          isError ? 'border-red-300 bg-red-50' : 'border-emerald-300 bg-emerald-50'
        }`}
      >
        {isError ? (
          <Info className="h-4 w-4 text-red-600" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        )}
        <span className={isError ? 'text-red-700' : 'text-emerald-700'}>{message}</span>
        <button onClick={onClose} className="ml-3 text-sm text-gray-500 hover:underline">
          закрити
        </button>
      </div>
    </div>
  )
}
