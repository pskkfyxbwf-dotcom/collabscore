export default function ScoreRing({ score, size = 80, label, color = '#6366f1' }) {
  const r = (size / 2) - 8
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  const getColor = (s) => {
    if (s >= 80) return '#10b981'
    if (s >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const ringColor = color === 'auto' ? getColor(score) : color

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={ringColor} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ marginTop: -(size/2 + 6) }}>
        <span className="text-lg font-bold" style={{ color: ringColor }}>{score}</span>
      </div>
      {label && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>}
    </div>
  )
}
