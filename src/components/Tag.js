import React from 'react';

const toneMap = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  violet: 'bg-violet-100 text-violet-700',
  yellow: 'bg-yellow-100 text-yellow-700',
};

export default function Tag({ children, tone = 'gray', icon }) {
  const cls = toneMap[tone] || toneMap.gray;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${cls}`}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}

function Icon({ name }) {
  const map = {
    briefcase: '💼',
    trophy: '🏆',
    geo: '📍',
  };
  return <span aria-hidden="true">{map[name] || '•'}</span>;
}
