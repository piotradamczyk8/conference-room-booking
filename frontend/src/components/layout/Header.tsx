'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  title: string;
  action?: React.ReactNode;
}

/**
 * Header strony z breadcrumbs i tytułem.
 */
export function Header({ title, action }: HeaderProps) {
  const pathname = usePathname();

  // Generowanie breadcrumbs
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = getBreadcrumbLabel(segment);

    return { href, label };
  });

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-sm mb-2">
            <Link href="/" className="text-gray-400 hover:text-gray-600">
              Dashboard
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-600">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-gray-400 hover:text-gray-600">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title and Action */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {action && <div>{action}</div>}
        </div>
      </div>
    </header>
  );
}

function getBreadcrumbLabel(segment: string): string {
  const labels: Record<string, string> = {
    rooms: 'Sale',
    reservations: 'Rezerwacje',
    new: 'Nowy',
    edit: 'Edycja',
  };

  // UUID lub ID - skróć
  if (segment.includes('-') && segment.length > 10) {
    return 'Szczegóły';
  }

  return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}
