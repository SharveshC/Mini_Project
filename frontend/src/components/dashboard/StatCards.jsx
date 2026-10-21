import { formatINR } from '../../utils/formatters';

export default function StatCards({ summary, loading, isMounted }) {
  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const netBalance = summary?.netBalance || 0;
  const savingsRate = summary?.savingsRate || (totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0);

  const cards = [
    {
      label: 'Net Balance',
      value: formatINR(netBalance),
      helper: netBalance >= 0 ? 'Positive Cash Flow' : 'Deficit this month',
      color: netBalance >= 0 ? 'var(--income)' : 'var(--expense)',
      bg: netBalance >= 0 ? 'var(--income-bg)' : 'var(--expense-bg)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
      ),
    },
    {
      label: 'Monthly Income',
      value: formatINR(totalIncome),
      helper: 'Total earnings recorded',
      color: 'var(--income)',
      bg: 'var(--income-bg)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      ),
    },
    {
      label: 'Monthly Expenses',
      value: formatINR(totalExpense),
      helper: 'Total spendings recorded',
      color: 'var(--expense)',
      bg: 'var(--expense-bg)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      ),
    },
    {
      label: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      helper: totalIncome > 0 ? `${formatINR(Math.max(0, netBalance))} retained` : 'Awaiting income data',
      color: savingsRate >= 20 ? 'var(--income)' : 'var(--text-primary)',
      bg: 'var(--bg-muted)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}
    >
      {cards.map((card, idx) => (
        <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {card.label}
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: card.bg,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {card.icon}
            </div>
          </div>

          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: card.color, letterSpacing: '-0.02em' }}>
            {loading ? '...' : card.value}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {!isMounted ? 'Awaiting Milestone 3 backend CRUD' : card.helper}
          </div>
        </div>
      ))}
    </div>
  );
}
