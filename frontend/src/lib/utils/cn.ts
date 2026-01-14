import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility do łączenia klas Tailwind.
 * Używa clsx do warunkowego łączenia i twMerge do rozwiązywania konfliktów.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
