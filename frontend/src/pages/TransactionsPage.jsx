import { useState, useMemo } from 'react';
import { formatINR, formatDate, formatMonthYear } from '../utils/formatters';

export default function TransactionsPage({
  transactions = [],
  selectedMonth,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const monthName = formatMonthYear(selectedMonth);

  // Extract unique categories from current transactions
  const availableCategories = useMemo(() => {
    const set = new Set();
    transactions.forEach((tx) => {
      if (tx.category) set.add(tx.category);
    });
    return Array.from(set);
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
      const matchesSearch = !searchTerm ||
        (tx.note && tx.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.category && tx.category.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesType && matchesCategory && matchesSearch;
    });
  }, [transactions, typeFilter, categoryFilter, searchTerm]);

  const handleDelete = (tx) => {
    const confirmMessage = `Delete ${tx.category} transaction of ${formatINR(tx.amount)} on ${formatDate(tx.date)}?`;
    if (window.confirm(confirmMessage)) {
      if (onDeleteTransaction) {
        onDeleteTransaction(tx);
      }
    }
  };

  return (
    <div>
      {/* Top Controls Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by note or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.55rem 0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Type Filter Pills */}
            <div style={{ display: 'inline-flex', backgroundColor: 'var(--bg-muted)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
              {['all', 'expense', 'income'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: typeFilter === t ? 'var(--bg-surface)' : 'transparent',
                    color: typeFilter === t ? 'var(--forest-800)' : 'var(--text-secondary)',
                    boxShadow: typeFilter === t ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            {availableCategories.length > 0 && (
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="all">All Categories</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onOpenAddModal}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Entry
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="card">
        {filteredTransactions.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description / Note</th>
                  <th>Payment Method</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center', width: '90px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  return (
                    <tr key={tx._id || tx.id}>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {formatDate(tx.date)}
                      </td>
                      <td>
                        <span className={`badge ${isExpense ? 'badge-expense' : 'badge-income'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{tx.category}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{tx.note || '—'}</td>
                      <td>{tx.paymentMethod}</td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 600,
                          color: isExpense ? 'var(--expense)' : 'var(--income)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isExpense ? '-' : '+'} {formatINR(tx.amount)}
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => onEditTransaction && onEditTransaction(tx)}
                            title="Edit Transaction"
                            style={{ padding: '0.3rem 0.45rem', borderRadius: 'var(--radius-sm)' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDelete(tx)}
                            title="Delete Transaction"
                            style={{ padding: '0.3rem 0.45rem', borderRadius: 'var(--radius-sm)', color: 'var(--expense)' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--forest-700)',
                marginBottom: '1rem',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              No transactions found
            </h3>
            <p style={{ fontSize: '0.85rem', maxWidth: '380px', marginBottom: '1.25rem' }}>
              {transactions.length === 0
                ? `No transactions recorded in ${monthName}. Click below to add your first entry.`
                : `No transactions matched your current filters in ${monthName}.`}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onOpenAddModal}
            >
              Record New Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
