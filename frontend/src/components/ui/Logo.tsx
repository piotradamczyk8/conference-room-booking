'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  className?: string;
}

/**
 * Logo aplikacji AI RoomBook w stylu WIP.pl
 * Granatowy prostokąt z ikoną AI + kalendarza
 */
export function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-sm' },
    md: { icon: 32, text: 'text-base' },
    lg: { icon: 40, text: 'text-lg' },
  };

  const { icon: iconSize, text: textSize } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Ikona - prostokąt z symbolem AI */}
      <div 
        className="flex items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800"
        style={{ width: iconSize + 8, height: iconSize + 8 }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ikona AI - mózg/chip */}
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
          {/* Linie reprezentujące AI/chip */}
          <path d="M4 9H2M4 15H2M20 9H22M20 15H22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 4V2M15 4V2M9 20V22M15 20V22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          {/* Wewnętrzny symbol - kalendarz/sieć */}
          <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5" fill="none" />
          <path d="M12 9V12L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Tekst - tylko w wariancie full */}
      {variant === 'full' && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-800 leading-tight ${textSize}`}>
            <span className="text-primary-600">AI</span> RoomBook
          </span>
          <span className="text-xs text-gray-500 leading-tight">
            Inteligentne rezerwacje
          </span>
        </div>
      )}
    </div>
  );
}
