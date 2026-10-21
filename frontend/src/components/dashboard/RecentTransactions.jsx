import { formatINR, formatDate } from '../../utils/formatters';

export default function RecentTransactions({
  transactions = [],
  monthName,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
}) {
  const hasTransactions = transactions.length > 0;

  const handleDelete = (tx) => {
    const confirmMessage = `Delete ${tx.category} transaction of ${formatINR(tx.amount)} on ${formatDate(tx.date)}?`;
    if (window.confirm(confirmMessage)) {
      if (onDeleteTransaction) {
        onDeleteTransaction(tx);
      }
    }
  };

  return (
    <div className="card" style={{ marginTop: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--forest-800)' }}>Recent Transactions</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Latest entries for {monthName}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onOpenAddModal}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Transaction
        </button>
      </div>

      {hasTransactions ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Note</th>
                <th>Payment Method</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center', width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isExpense = tx.type === 'expense';
                return (
                  <tr key={tx._id || tx.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                      {formatDate(tx.date)}
                    </td>
                    <td>
                      <span className={`badge ${isExpense ? 'badge-expense' : 'badge-income'}`}>
                        {tx.category}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-primary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.note || '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {tx.paymentMethod}
                    </td>
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
                          style={{ padding: '0.25rem 0.4rem', borderRadius: 'var(--radius-sm)' }}
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
                          style={{ padding: '0.25rem 0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--expense)' }}
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
        /* Empty state */
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
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
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="6" y1="8" x2="6" y2="8" />
              <line x1="10" y1="8" x2="18" y2="8" />
              <line x1="6" y1="12" x2="6" y2="12" />
              <line x1="10" y1="12" x2="18" y2="12" />
              <line x1="6" y1="16" x2="6" y2="16" />
              <line x1="10" y1="16" x2="18" y2="16" />
            </svg>
          </div>

          <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            No transactions in {monthName}
          </h4>
          <p style={{ fontSize: '0.85rem', maxWidth: '380px', marginBottom: '1.25rem', lineHeight: 1.4 }}>
            Start by recording your daily spending or income for this month.
          </p>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onOpenAddModal}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add First Transaction
          </button>
        </div>
      )}
    </div>
  );
}
