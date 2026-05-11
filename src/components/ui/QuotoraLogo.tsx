type Props = {
  size?: number
  className?: string
}

export default function QuotoraLogo({ size = 32, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="qgrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6b1a" />
          <stop offset="100%" stopColor="#e02d00" />
        </linearGradient>
      </defs>
      {/* Speech bubble / Q shape */}
      <path
        d="M50 5C25.1 5 5 23.4 5 46c0 12.6 5.8 23.9 15 31.7L16 90l13.5-6.8C34.8 85 42.2 87 50 87c24.9 0 45-18.4 45-41S74.9 5 50 5z"
        fill="url(#qgrad)"
      />
      {/* Three horizontal lines representing text/quotes */}
      <rect x="26" y="34" width="36" height="7" rx="3.5" fill="white" />
      <rect x="26" y="47" width="28" height="7" rx="3.5" fill="white" />
      <rect x="26" y="60" width="20" height="7" rx="3.5" fill="white" />
      {/* Dot on right of first line */}
      <circle cx="68" cy="37.5" r="4" fill="white" />
    </svg>
  )
}
