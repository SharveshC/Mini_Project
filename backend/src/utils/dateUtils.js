/**
 * Date and Month Utilities for Pennywise
 * Guarantees strict calendar date validation and deterministic UTC month intervals.
 */

/**
 * Validates a YYYY-MM month string and returns UTC start and end bounds.
 * Interval is start-inclusive, next-month-exclusive: [startDate, endDate)
 *
 * @param {string} [monthStr] - Format "YYYY-MM"
 * @returns {{ startDate: Date, endDate: Date, monthStr: string }}
 */
function parseMonth(monthStr) {
  let targetMonth = monthStr;

  if (!targetMonth || typeof targetMonth !== 'string' || !targetMonth.trim()) {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    targetMonth = `${y}-${m}`;
  } else {
    targetMonth = targetMonth.trim();
  }

  // Strict regex for YYYY-MM
  const monthRegex = /^(\d{4})-(0[1-9]|1[0-2])$/;
  const match = targetMonth.match(monthRegex);
  if (!match) {
    const error = new Error('Invalid month format. Expected YYYY-MM (e.g., 2026-10).');
    error.statusCode = 400;
    throw error;
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10); // 1-12

  // Start of target month: YYYY-MM-01T00:00:00.000Z
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));

  // Start of next month (exclusive bound)
  const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

  return {
    startDate,
    endDate,
    monthStr: targetMonth,
  };
}

/**
 * Checks whether a date string represents an authentic calendar date.
 * Prevents invalid dates like February 30 or April 31 that JavaScript Date would silently roll over.
 *
 * @param {string|Date} dateInput
 * @returns {boolean}
 */
function isValidCalendarDate(dateInput) {
  if (!dateInput) return false;

  let y, m, d;
  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return false;
    y = parseInt(match[1], 10);
    m = parseInt(match[2], 10);
    d = parseInt(match[3], 10);
  } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    y = dateInput.getUTCFullYear();
    m = dateInput.getUTCMonth() + 1;
    d = dateInput.getUTCDate();
  } else {
    return false;
  }

  if (m < 1 || m > 12 || d < 1 || d > 31) return false;

  // Verify that JavaScript Date maintains the exact day, month, and year
  const testDate = new Date(Date.UTC(y, m - 1, d));
  return (
    testDate.getUTCFullYear() === y &&
    testDate.getUTCMonth() === m - 1 &&
    testDate.getUTCDate() === d
  );
}

module.exports = {
  parseMonth,
  isValidCalendarDate,
};
