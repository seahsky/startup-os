import { format as dateFnsFormat, parseISO, addDays, isAfter, isBefore } from 'date-fns';

export function formatDate(date: Date | string, format: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsFormat(dateObj, format);
}

export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days);
}

export function isOverdue(dueDate: Date): boolean {
  return isBefore(dueDate, new Date());
}

export function isExpired(expiryDate: Date): boolean {
  return isBefore(expiryDate, new Date());
}

export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsFormat(dateObj, 'yyyy-MM-dd');
}
