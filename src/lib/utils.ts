import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatJalaliDate(date: Date): string {
  // We'll use Intl.DateTimeFormat for a simple string if needed
  // But react-multi-date-picker handles the UI.
  return new Intl.DateTimeFormat('fa-IR').format(date);
}

export function getExpirationStatus(expirationDate: Date) {
  const now = new Date();
  const diffDays = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'expiring-soon';
  return 'active';
}
