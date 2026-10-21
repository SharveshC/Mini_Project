import { formatINR } from '../../utils/formatters';

export default function IncomeExpenseChart({ summary, monthName }) {
  const income = summary?.totalIncome || 0;
  const expense = summary?.totalExpense || 0;
  const hasData = income > 0 || expense > 0;

  const maxVal = Math.max(income, expense, 1);
  const incomeHeightPct = Math.round((income / maxVal) * 100);
  const expenseHeightPct = Math.round((expense / maxVal) * 100);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '320px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--forest-800)' }}>Income vs. Expense</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Comparison for {monthName}</p>
        </div>
        {hasData && (
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--income)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--income)' }} />
              Income
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--expense)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--expense)' }} />
              Expense
            </span>
          </div>
        )}
      </div>

      {hasData ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1rem 0 0' }}>
          {/* Dual Bar Chart Area */}
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '180px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            {/* Income Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '35%', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--income)' }}>
                {formatINR(income)}
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: '70px',
                  height: `${Math.max(10, incomeHeightPct * 1.5)}px`,
                  backgroundColor: 'var(--income)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease',
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Income</span>
            </div>

            {/* Expense Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '35%', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--expense)' }}>
                {formatINR(expense)}
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: '70px',
                  height: `${Math.max(10, expenseHeightPct * 1.5)}px`,
                  backgroundColor: 'var(--expense)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease',
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Expense</span>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Readiness State */
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem 1rem',
            color: 'var(--text-muted)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            No comparison data for {monthName}
          </p>
          <p style={{ fontSize: '0.8rem', maxWidth: '280px', lineHeight: 1.4 }}>
            Visual cash-flow comparisons will render here once transactions are recorded.
          </p>
        </div>
      )}
    </div>
  );
}
