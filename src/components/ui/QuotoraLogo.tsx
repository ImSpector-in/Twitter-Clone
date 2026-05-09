type Props = {
  size?: number
  className?: string
}

export default function QuotoraLogo({ size = 32, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="og" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FF7A00" />
          <stop offset="100%" stopColor="#E02200" />
        </linearGradient>
        <linearGradient id="og2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#E03000" />
        </linearGradient>
      </defs>

      {/* Outer orange circle */}
      <circle cx="50" cy="48" r="46" fill="url(#og)" />

      {/* White inner circle — creates the ring effect */}
      <circle cx="50" cy="46" r="30" fill="white" />

      {/* Speech bubble tail — curves to lower-left like a Q tail */}
      <path
        d="M 18 82 C 10 100 6 108 22 104 C 26 103 34 97 34 90 C 28 88 22 86 18 82 Z"
        fill="url(#og)"
      />

      {/* Text lines inside white area — orange gradient */}
      {/* Line 1 (shorter, left) */}
      <rect x="29" y="32" width="16" height="6" rx="3" fill="url(#og2)" />
      {/* Dot (right of line 1) */}
      <circle cx="52" cy="35" r="3.5" fill="url(#og2)" />

      {/* Line 2 (medium) */}
      <rect x="29" y="43" width="22" height="6" rx="3" fill="url(#og2)" />

      {/* Line 3 (shortest) */}
      <rect x="29" y="54" width="16" height="6" rx="3" fill="url(#og2)" />
    </svg>
  )
}
