const { PAYMENT_METHODS, TRANSACTION_TYPES } = require('../models/Transaction');
const { isValidCalendarDate } = require('../utils/dateUtils');

const ALLOWED_FIELDS = ['amount', 'type', 'category', 'date', 'paymentMethod', 'note'];

/**
 * Validates request payload for creating or updating a transaction.
 * Rejects unexpected fields, invalid data types, or out-of-range values.
 *
 * @param {object} body - Request body
 * @param {boolean} [isUpdate=false] - Whether validating a partial/full update
 * @returns {{ isValid: boolean, errors: string[], sanitized: object }}
 */
function validateTransactionInput(body, isUpdate = false) {
  const errors = [];
  const sanitized = {};

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      isValid: false,
      errors: ['Request body must be a valid JSON object.'],
      sanitized: {},
    };
  }

  // Reject unexpected or unauthorized fields (especially attempts to supply userId)
  const incomingKeys = Object.keys(body);
  for (const key of incomingKeys) {
    if (!ALLOWED_FIELDS.includes(key)) {
      errors.push(`Field '${key}' is not allowed.`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors, sanitized: {} };
  }

  // 1. Amount validation
  if (body.amount !== undefined || !isUpdate) {
    const rawAmount = Number(body.amount);
    if (typeof body.amount === 'undefined' || body.amount === null || isNaN(rawAmount)) {
      errors.push('Amount must be a valid number.');
    } else if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      errors.push('Amount must be a finite positive number greater than zero.');
    } else {
      // Round to 2 decimal places to prevent floating-point precision issues
      sanitized.amount = Math.round(rawAmount * 100) / 100;
    }
  }

  // 2. Type validation
  if (body.type !== undefined || !isUpdate) {
    if (typeof body.type !== 'string' || !TRANSACTION_TYPES.includes(body.type)) {
      errors.push(`Type must be one of: ${TRANSACTION_TYPES.join(', ')}.`);
    } else {
      sanitized.type = body.type;
    }
  }

  // 3. Category validation
  if (body.category !== undefined || !isUpdate) {
    if (typeof body.category !== 'string' || !body.category.trim()) {
      errors.push('Category is required and cannot be empty.');
    } else if (body.category.trim().length > 50) {
      errors.push('Category cannot exceed 50 characters.');
    } else {
      sanitized.category = body.category.trim();
    }
  }

  // 4. Date validation
  if (body.date !== undefined || !isUpdate) {
    if (!body.date || !isValidCalendarDate(body.date)) {
      errors.push('Date must be a valid calendar date (e.g. YYYY-MM-DD).');
    } else {
      // Store as UTC Date instance
      const d = new Date(body.date);
      sanitized.date = d;
    }
  }

  // 5. Payment Method validation
  if (body.paymentMethod !== undefined || !isUpdate) {
    if (typeof body.paymentMethod !== 'string' || !PAYMENT_METHODS.includes(body.paymentMethod)) {
      errors.push(`Payment method must be one of: ${PAYMENT_METHODS.join(', ')}.`);
    } else {
      sanitized.paymentMethod = body.paymentMethod;
    }
  }

  // 6. Note validation (optional)
  if (body.note !== undefined) {
    if (typeof body.note !== 'string') {
      errors.push('Note must be a string.');
    } else if (body.note.trim().length > 200) {
      errors.push('Note cannot exceed 200 characters.');
    } else {
      sanitized.note = body.note.trim();
    }
  } else if (!isUpdate) {
    sanitized.note = '';
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
}

module.exports = {
  validateTransactionInput,
};
