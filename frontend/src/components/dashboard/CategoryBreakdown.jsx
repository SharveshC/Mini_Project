import { formatINR } from '../../utils/formatters';

export default function CategoryBreakdown({ summary, monthName }) {
  const breakdown = summary?.categoryBreakdown || [];
  const hasData = breakdown.length > 0;

  // Distinct category colors
  const categoryColors = [
    '#2d6a4f', '#40916c', '#52b788', '#1b4332',
    '#d97706', '#b45309', '#0284c7', '#0369a1',
    '#7c3aed', '#6d28d9', '#c92a2a', '#991b1b',
  ];

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '320px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--forest-800)' }}>Category Breakdown</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top expense categories in {monthName}</p>
      </div>

      {hasData ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {breakdown.map((item, index) => {
            const color = categoryColors[index % categoryColors.length];
            const pct = item.percentage ? item.percentage.toFixed(1) : '0.0';

            return (
              <div key={item.category || index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                    {item.category}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatINR(item.total)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span>
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    width: '100%',
                    backgroundColor: 'var(--bg-muted)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, item.percentage || 0)}%`,
                      backgroundColor: color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
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
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
              <path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
          </div>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            No expense categories recorded
          </p>
          <p style={{ fontSize: '0.8rem', maxWidth: '280px', lineHeight: 1.4 }}>
            Categorized transactions (Food, Rent, Travel) will automatically calculate percentage breakdowns here.
          </p>
        </div>
      )}
    </div>
  );
}
