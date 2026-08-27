interface DprjLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'white';
}

export default function DprjLogo({ className = 'h-10', variant = 'full' }: DprjLogoProps) {
  const isWhite = variant === 'white';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* DPRJ Emblem: Stylized Shield with Justice Scales and Open Book / Wings */}
      <svg
        viewBox="0 0 100 100"
        className="h-full aspect-square shrink-0 drop-shadow-sm"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="dprjShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isWhite ? '#ffffff' : '#004A2F'} />
            <stop offset="100%" stopColor={isWhite ? '#F4F7F5' : '#003320'} />
          </linearGradient>
          <linearGradient id="dprjGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#C8A355" />
          </linearGradient>
        </defs>

        {/* Shield Body */}
        <path
          d="M50 8 L88 22 C88 56 68 84 50 94 C32 84 12 56 12 22 Z"
          fill={isWhite ? 'rgba(255,255,255,0.15)' : 'url(#dprjShieldGrad)'}
          stroke={isWhite ? '#ffffff' : '#004A2F'}
          strokeWidth="3.5"
        />

        {/* Inner Border */}
        <path
          d="M50 15 L80 26 C80 53 64 76 50 85 C36 76 20 53 20 26 Z"
          fill="none"
          stroke={isWhite ? 'rgba(255,255,255,0.7)' : '#C8A355'}
          strokeWidth="1.8"
          strokeDasharray="2 2"
        />

        {/* Scales of Justice and Book of Law */}
        {/* Central pillar */}
        <line
          x1="50"
          y1="30"
          x2="50"
          y2="66"
          stroke={isWhite ? '#ffffff' : '#ffffff'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Scale beam */}
        <line
          x1="32"
          y1="38"
          x2="68"
          y2="38"
          stroke={isWhite ? '#ffffff' : '#ffffff'}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Left scale pan */}
        <line x1="32" y1="38" x2="26" y2="48" stroke={isWhite ? '#ffffff' : '#ffffff'} strokeWidth="1.5" />
        <line x1="32" y1="38" x2="38" y2="48" stroke={isWhite ? '#ffffff' : '#ffffff'} strokeWidth="1.5" />
        <path
          d="M24 48 C24 53 40 53 40 48 Z"
          fill={isWhite ? '#ffffff' : '#C8A355'}
        />

        {/* Right scale pan */}
        <line x1="68" y1="38" x2="62" y2="48" stroke={isWhite ? '#ffffff' : '#ffffff'} strokeWidth="1.5" />
        <line x1="68" y1="38" x2="74" y2="48" stroke={isWhite ? '#ffffff' : '#ffffff'} strokeWidth="1.5" />
        <path
          d="M60 48 C60 53 76 53 76 48 Z"
          fill={isWhite ? '#ffffff' : '#C8A355'}
        />

        {/* Open Book Base */}
        <path
          d="M36 68 C43 65 50 67 50 67 C50 67 57 65 64 68 L64 74 C57 71 50 73 50 73 C50 73 43 71 36 74 Z"
          fill={isWhite ? '#ffffff' : '#ffffff'}
        />

        {/* Top Flame/Star */}
        <circle cx="50" cy="27" r="3.5" fill={isWhite ? '#ffffff' : '#C8A355'} />
      </svg>

      {variant !== 'compact' && (
        <div className="flex flex-col text-left leading-tight">
          <span
            className={`font-black tracking-wider text-xs uppercase sm:text-sm ${
              isWhite ? 'text-white' : 'text-[#004A2F]'
            }`}
          >
            DEFENSORIA PÚBLICA
          </span>
          <span
            className={`text-[10px] sm:text-xs font-semibold tracking-wide ${
              isWhite ? 'text-emerald-100' : 'text-[#004A2F]/80'
            }`}
          >
            ESTADO DO RIO DE JANEIRO
          </span>
        </div>
      )}
    </div>
  );
}
