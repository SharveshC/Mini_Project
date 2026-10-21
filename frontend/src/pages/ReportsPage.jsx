import { formatINR, formatMonthYear } from '../utils/formatters';

export default function ReportsPage({
  summary,
  selectedMonth,
}) {
  const monthName = formatMonthYear(selectedMonth);
  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const netBalance = summary?.netBalance || 0;
  const categories = summary?.categoryBreakdown || [];

  return (
    <div>
      {/* Monthly Summary Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--forest-900) 0%, var(--forest-800) 100%)',
          color: 'var(--text-inverse)',
          padding: '2rem',
          marginBottom: '1.75rem',
        }}
      >
        <span style={{ fontSize: '0.85rem', color: 'var(--forest-100)', fontWeight: 500 }}>
          Monthly Financial Statement
        </span>
        <h2 style={{ fontSize: '1.75rem', color: 'var(--text-inverse)', margin: '0.35rem 0 1rem' }}>
          {monthName}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--forest-100)' }}>Total Income</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#b7e4c7' }}>
              {formatINR(totalIncome)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--forest-100)' }}>Total Expenses</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fca5a5' }}>
              {formatINR(totalExpense)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--forest-100)' }}>Net Cash Flow</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: netBalance >= 0 ? '#b7e4c7' : '#fca5a5' }}>
              {formatINR(netBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', color: 'var(--forest-800)', marginBottom: '0.25rem' }}>
          Category Spending Distribution
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Grouped by category using MongoDB aggregation
        </p>

        {categories.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total Spent</th>
                  <th>Share of Expenses</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{cat.category}</td>
                    <td style={{ fontWeight: 600 }}>{formatINR(cat.total)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ flex: 1, maxWidth: '140px', height: '6px', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, cat.percentage || 0)}%`, height: '100%', backgroundColor: 'var(--forest-700)' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {cat.percentage ? cat.percentage.toFixed(1) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              No category report available for {monthName}
            </p>
            <p style={{ fontSize: '0.8rem' }}>
              Add expense records for this month to generate category distribution reports.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
