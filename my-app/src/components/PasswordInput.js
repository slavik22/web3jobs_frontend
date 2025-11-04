import { useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function PasswordInput({ value, onChange, id = 'password', placeholder = '', required }) {
  const [show, setShow] = useState(false)
  const strength = useMemo(() => {
    if (!value) return 0
    let s = 0
    if (value.length >= 6) s += 1
    if (/[A-Z]/.test(value)) s += 1
    if (/[0-9]/.test(value)) s += 1
    if (/[^A-Za-z0-9]/.test(value)) s += 1
    if (value.length >= 12) s += 1
    return s // 0..5
  }, [value])

  const strengthText = ['', 'дуже слабкий', 'слабкий', 'нормальний', 'хороший', 'міцний'][strength]

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id={id}
          className="input pr-10"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
          aria-label="toggle password"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${(strength / 5) * 100}%` }} />
      </div>
      <p className="text-xs text-gray-500">
        Надійність паролю: <span className="font-medium">{strengthText}</span>
      </p>
    </div>
  )
}
