import React, { useRef, useState } from 'react';

export default function ChipInput({ values = [], onChange, placeholder = 'skill', maxItems = 30 }) {
  const [input, setInput] = useState('');
  const ref = useRef();

  const add = (val) => {
    const v = String(val).trim();
    if (!v) return;
    if (values.includes(v)) return;
    if (values.length >= maxItems) return;
    onChange([...values, v]);
    setInput('');
  };

  const remove = (val) => {
    onChange(values.filter(x => x !== val));
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(input);
    }
    if (e.key === 'Backspace' && !input && values.length) {
      remove(values[values.length - 1]);
    }
  };

  return (
    <div className="border rounded-lg px-2 py-2 flex flex-wrap gap-2 focus-within:ring-1 ring-black">
      {values.map(v => (
        <span key={v} className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 text-sm">
          {v}
          <button
            type="button"
            className="hover:text-red-600"
            onClick={() => remove(v)}
            aria-label="remove"
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={ref}
        className="flex-1 min-w-[140px] outline-none text-sm"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
}
