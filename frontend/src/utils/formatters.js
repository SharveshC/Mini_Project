/**
 * Utility formatting functions for currency, dates, and month arithmetic
 */

// Formatter for Indian Rupee (₹) using Indian numbering system
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(amount) {
  const numeric = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  return inrFormatter.format(numeric);
}

// Format ISO date or Date object to readable string (e.g. "21 Oct 2026")
export function formatDate(dateInput) {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Convert "YYYY-MM" string to readable month (e.g. "2026-10" -> "October 2026")
export function formatMonthYear(yearMonthStr) {
  if (!yearMonthStr || typeof yearMonthStr !== 'string') return '';
  const [year, month] = yearMonthStr.split('-');
  if (!year || !month) return yearMonthStr;

  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

// Get current year and month as "YYYY-MM"
export function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Shift "YYYY-MM" by offset months (e.g. +1 or -1)
export function shiftMonth(yearMonthStr, offset) {
  const [yearStr, monthStr] = (yearMonthStr || getCurrentMonth()).split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + offset;

  if (month < 1) {
    month = 12;
    year -= 1;
  } else if (month > 12) {
    month = 1;
    year += 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}
