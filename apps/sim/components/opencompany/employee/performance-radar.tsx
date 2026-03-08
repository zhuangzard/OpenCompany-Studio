'use client'

interface PerformanceRadarProps {
  dimensions: {
    taskQuality: number
    efficiency: number
    collaboration: number
    compliance: number
    growth: number
  }
  size?: number
}

const LABELS = ['Task Quality', 'Efficiency', 'Collaboration', 'Compliance', 'Growth']
const KEYS: (keyof PerformanceRadarProps['dimensions'])[] = [
  'taskQuality', 'efficiency', 'collaboration', 'compliance', 'growth',
]

export function PerformanceRadar({ dimensions, size = 200 }: PerformanceRadarProps) {
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.38
  const levels = 4

  // Calculate point positions for each axis
  const angleStep = (2 * Math.PI) / 5
  const startAngle = -Math.PI / 2 // Start from top

  const getPoint = (index: number, value: number): [number, number] => {
    const angle = startAngle + index * angleStep
    const r = (value / 100) * radius
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  }

  // Grid circles
  const gridLines = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * radius
    const points = Array.from({ length: 5 }, (_, j) => {
      const angle = startAngle + j * angleStep
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
    }).join(' ')
    return points
  })

  // Axis lines
  const axisLines = Array.from({ length: 5 }, (_, i) => {
    const angle = startAngle + i * angleStep
    return {
      x2: cx + radius * Math.cos(angle),
      y2: cy + radius * Math.sin(angle),
    }
  })

  // Data polygon
  const dataPoints = KEYS.map((key, i) => {
    const [x, y] = getPoint(i, dimensions[key] || 0)
    return `${x},${y}`
  }).join(' ')

  // Label positions
  const labelPositions = LABELS.map((label, i) => {
    const angle = startAngle + i * angleStep
    const labelR = radius + 20
    return {
      label,
      x: cx + labelR * Math.cos(angle),
      y: cy + labelR * Math.sin(angle),
      value: dimensions[KEYS[i]] || 0,
    }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Grid */}
      {gridLines.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-border"
          opacity={0.3 + i * 0.15}
        />
      ))}

      {/* Axes */}
      {axisLines.map((line, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={line.x2}
          y2={line.y2}
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-border"
          opacity={0.5}
        />
      ))}

      {/* Data */}
      <polygon
        points={dataPoints}
        fill="rgba(59, 130, 246, 0.2)"
        stroke="rgb(59, 130, 246)"
        strokeWidth="1.5"
      />

      {/* Data points */}
      {KEYS.map((key, i) => {
        const [x, y] = getPoint(i, dimensions[key] || 0)
        return <circle key={i} cx={x} cy={y} r={3} fill="rgb(59, 130, 246)" />
      })}

      {/* Labels */}
      {labelPositions.map((lp, i) => (
        <text
          key={i}
          x={lp.x}
          y={lp.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground"
          fontSize="9"
        >
          {lp.label} ({lp.value})
        </text>
      ))}
    </svg>
  )
}
