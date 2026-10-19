import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtext?: string;
  className?: string;
  glow?: boolean;
}

export const AppLogoIcon: React.FC<{ sizePx?: number; className?: string; glow?: boolean }> = ({
  sizePx = 32,
  className = '',
  glow = true,
}) => {
  return (
    <div
      style={{ width: sizePx, height: sizePx }}
      className={`relative shrink-0 select-none ${glow ? 'group-hover:shadow-[0_0_20px_rgba(13,242,201,0.35)]' : ''} transition-all duration-300 ${className}`}
    >
      <svg
        viewBox="0 0 512 512"
        width="100%"
        height="100%"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b172a" />
            <stop offset="50%" stopColor="#07111e" />
            <stop offset="100%" stopColor="#030812" />
          </linearGradient>

          <linearGradient id="logoTealGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="40%" stopColor="#10b981" />
            <stop offset="85%" stopColor="#0df2c9" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id="logoCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0df2c9" />
          </linearGradient>

          <linearGradient id="logoBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0df2c9" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Outer squircle */}
        <rect
          x="28"
          y="28"
          width="456"
          height="456"
          rx="116"
          fill="url(#logoBgGrad)"
          stroke="url(#logoBorder)"
          strokeWidth="16"
        />

        {/* Outer dynamic orbital compass ring */}
        <circle
          cx="256"
          cy="256"
          r="164"
          stroke="url(#logoTealGrad)"
          strokeWidth="10"
          strokeDasharray="22 18"
          opacity="0.45"
        />

        {/* Upward Growth Left Wing */}
        <path
          d="M136 348 L204 192 L256 268 L208 348 Z"
          fill="url(#logoTealGrad)"
          opacity="0.95"
        />

        {/* Upward Growth Right Wing */}
        <path
          d="M376 348 L308 192 L256 268 L304 348 Z"
          fill="url(#logoTealGrad)"
          opacity="0.95"
        />

        {/* Top North Star / Sovereign Compass Needle */}
        <path
          d="M256 108 L286 216 L256 252 L226 216 Z"
          fill="url(#logoCyanGrad)"
        />

        {/* Bottom Anchor Core */}
        <path
          d="M256 388 L232 308 L256 276 L280 308 Z"
          fill="#059669"
          opacity="0.8"
        />

        {/* Center Diamond Spark of Wealth */}
        <polygon
          points="256,224 282,256 256,288 230,256"
          fill="#ffffff"
        />
        <circle cx="256" cy="256" r="6" fill="#0df2c9" />

        {/* Guiding Lights */}
        <circle cx="256" cy="112" r="8" fill="#ffffff" />
        <circle cx="308" cy="192" r="6" fill="#38bdf8" />
        <circle cx="204" cy="192" r="6" fill="#10b981" />
      </svg>
    </div>
  );
};

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  subtext,
  className = '',
  glow = true,
}) => {
  const sizeMap = {
    xs: { px: 22, text: 'text-sm', sub: 'text-[9px]' },
    sm: { px: 28, text: 'text-base', sub: 'text-[10px]' },
    md: { px: 36, text: 'text-lg', sub: 'text-xs' },
    lg: { px: 46, text: 'text-2xl', sub: 'text-xs' },
    xl: { px: 64, text: 'text-3xl', sub: 'text-sm' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <AppLogoIcon sizePx={current.px} glow={glow} />

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-white ${current.text}`}>
              Mullah<span className="text-[#0df2c9]">Tracker</span>
            </span>
          </div>
          {subtext && (
            <span className={`text-slate-400 font-medium tracking-wide mt-0.5 ${current.sub}`}>
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
