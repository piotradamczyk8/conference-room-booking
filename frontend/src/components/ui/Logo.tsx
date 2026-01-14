'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  className?: string;
}

/**
 * Logo aplikacji w stylu WIP.pl
 * Granatowy prostokąt z ikoną kalendarza/sali
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
      {/* Ikona - prostokąt z symbolem */}
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
          {/* Ikona sali konferencyjnej / kalendarz */}
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
          <path d="M3 9H21" stroke="white" strokeWidth="1.5" />
          <path d="M8 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          {/* Punkty reprezentujące spotkania */}
          <circle cx="8" cy="13" r="1.5" fill="white" />
          <circle cx="12" cy="13" r="1.5" fill="white" />
          <circle cx="16" cy="13" r="1.5" fill="white" />
          <circle cx="8" cy="17" r="1.5" fill="white" />
          <circle cx="12" cy="17" r="1.5" fill="white" />
        </svg>
      </div>

      {/* Tekst - tylko w wariancie full */}
      {variant === 'full' && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-800 leading-tight ${textSize}`}>
            RoomBook
          </span>
          <span className="text-xs text-gray-500 leading-tight">
            Rezerwacje sal
          </span>
        </div>
      )}
    </div>
  );
}
