import { formatMonthYear, shiftMonth, getCurrentMonth } from '../../utils/formatters';
import ThemeToggle from '../common/ThemeToggle';

export default function Header({
  selectedMonth,
  onChangeMonth,
  onOpenAddModal,
  title,
}) {
  const currentMonth = getCurrentMonth();
  const isCurrentMonth = selectedMonth === currentMonth;

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.4rem', color: 'var(--forest-800)' }}>
          {title || 'Financial Overview'}
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Review your spending, income, and cash flow
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Month Selector */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-muted)',
            borderRadius: 'var(--radius-md)',
            padding: '2px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onChangeMonth(shiftMonth(selectedMonth, -1))}
            title="Previous Month"
            style={{ padding: '0.35rem 0.5rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <span
            style={{
              padding: '0 0.75rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              minWidth: '130px',
              textAlign: 'center',
            }}
          >
            {formatMonthYear(selectedMonth)}
          </span>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onChangeMonth(shiftMonth(selectedMonth, 1))}
            title="Next Month"
            style={{ padding: '0.35rem 0.5rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {!isCurrentMonth && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onChangeMonth(currentMonth)}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: 'var(--forest-700)', fontWeight: 600 }}
            >
              Current
            </button>
          )}
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Add Transaction Button */}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onOpenAddModal}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Transaction
        </button>
      </div>
    </header>
  );
}
