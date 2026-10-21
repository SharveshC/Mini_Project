import { useState } from 'react';
import { transactionService } from '../../services/transactionService';

const CATEGORIES = {
  expense: ['Food', 'Transport', 'Rent', 'Shopping', 'Utilities', 'Entertainment', 'Healthcare', 'Education', 'Other'],
  income: ['Salary', 'Freelance', 'Allowance', 'Investments', 'Gift', 'Other'],
};

const PAYMENT_METHODS = ['UPI', 'Cash', 'Credit Card', 'Debit Card', 'Net Banking', 'Other'];

function TransactionForm({ initialData, onClose, onTransactionSaved }) {
  const isEditing = Boolean(initialData && (initialData._id || initialData.id));

  const [type, setType] = useState(() => initialData?.type || 'expense');
  const [amount, setAmount] = useState(() =>
    initialData?.amount !== undefined ? String(initialData.amount) : ''
  );
  const [category, setCategory] = useState(() => initialData?.category || 'Food');
  const [date, setDate] = useState(() => {
    if (initialData?.date) {
      return typeof initialData.date === 'string'
        ? initialData.date.split('T')[0]
        : new Date(initialData.date).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });
  const [paymentMethod, setPaymentMethod] = useState(() => initialData?.paymentMethod || 'UPI');
  const [note, setNote] = useState(() => initialData?.note || '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(CATEGORIES[newType][0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number greater than 0.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    if (!date) {
      setError('Please select a date.');
      return;
    }

    const payload = {
      amount: parsedAmount,
      type,
      category,
      date,
      paymentMethod,
      note: note.trim(),
    };

    try {
      setSubmitting(true);
      if (isEditing) {
        const id = initialData._id || initialData.id;
        await transactionService.updateTransaction(id, payload);
      } else {
        await transactionService.createTransaction(payload);
      }

      if (onTransactionSaved) {
        onTransactionSaved();
      }
      onClose();
    } catch (err) {
      setError(
        err.message ||
        (isEditing ? 'Failed to update transaction' : 'Failed to create transaction')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Modal Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--forest-800)' }}>
          {isEditing ? 'Edit Transaction' : 'Record Transaction'}
        </h2>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem' }}
          aria-label="Close modal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Type Toggle Pills */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--bg-muted)',
          padding: '3px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
        }}
      >
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: type === 'expense' ? 'var(--expense)' : 'transparent',
            color: type === 'expense' ? 'var(--text-inverse)' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: type === 'income' ? 'var(--income)' : 'transparent',
            color: type === 'income' ? 'var(--text-inverse)' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          Income
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--expense-bg)', color: 'var(--expense)', border: '1px solid var(--expense-border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit}>
        {/* Amount */}
        <div className="form-group">
          <label className="form-label" htmlFor="amount">Amount (₹ INR)</label>
          <input
            id="amount"
            className="form-input"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="500.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label" htmlFor="category">Category</label>
          <select
            id="category"
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {CATEGORIES[type].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Date & Payment Method Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="date">Date</label>
            <input
              id="date"
              className="form-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="paymentMethod">Payment</label>
            <select
              id="paymentMethod"
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Note */}
        <div className="form-group">
          <label className="form-label" htmlFor="note">Note / Description (Optional)</label>
          <input
            id="note"
            className="form-input"
            type="text"
            placeholder="e.g. College lunch, books, salary"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting
              ? (isEditing ? 'Updating...' : 'Saving...')
              : (isEditing ? 'Update Transaction' : 'Save Transaction')}
          </button>
        </div>
      </form>
    </>
  );
}

export default function TransactionModal({
  isOpen,
  onClose,
  onTransactionSaved,
  initialData = null,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <TransactionForm
          key={initialData?._id || initialData?.id || 'new'}
          initialData={initialData}
          onClose={onClose}
          onTransactionSaved={onTransactionSaved}
        />
      </div>
    </div>
  );
}
