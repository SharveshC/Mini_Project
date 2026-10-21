import StatCards from '../components/dashboard/StatCards';
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import { formatMonthYear } from '../utils/formatters';

export default function DashboardPage({
  selectedMonth,
  summary,
  transactions,
  loading,
  isMounted,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
}) {
  const monthName = formatMonthYear(selectedMonth);

  return (
    <div>
      {/* Financial Summary Metric Cards */}
      <StatCards
        summary={summary}
        loading={loading}
        isMounted={isMounted}
      />

      {/* Visual Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <IncomeExpenseChart
          summary={summary}
          monthName={monthName}
        />

        <CategoryBreakdown
          summary={summary}
          monthName={monthName}
        />
      </div>

      {/* Recent Transactions List */}
      <RecentTransactions
        transactions={transactions}
        monthName={monthName}
        onOpenAddModal={onOpenAddModal}
        onEditTransaction={onEditTransaction}
        onDeleteTransaction={onDeleteTransaction}
        isMounted={isMounted}
      />
    </div>
  );
}
