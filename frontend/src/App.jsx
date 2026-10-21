import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/useAuth';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import TransactionModal from './components/dashboard/TransactionModal';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';
import { transactionService } from './services/transactionService';
import { getCurrentMonth } from './utils/formatters';

export default function App() {
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [dataLoading, setDataLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    savingsRate: 0,
    categoryBreakdown: [],
    dailyTrends: [],
  });
  const [isMounted, setIsMounted] = useState(true);

  // Fetch month data when authenticated and selectedMonth changes
  const loadMonthData = useCallback(() => {
    if (!isAuthenticated) return;

    Promise.resolve().then(async () => {
      setDataLoading(true);
      try {
        const [txResult, sumResult] = await Promise.all([
          transactionService.getTransactions(selectedMonth),
          transactionService.getSummary(selectedMonth),
        ]);

        setTransactions(txResult.transactions || []);
        setSummary(sumResult.summary || {});
        setIsMounted(txResult.isMounted && sumResult.isMounted);
      } catch (err) {
        console.warn('Data fetch status:', err.message);
      } finally {
        setDataLoading(false);
      }
    });
  }, [isAuthenticated, selectedMonth]);

  useEffect(() => {
    loadMonthData();
  }, [loadMonthData]);

  // Modal open handlers
  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleTransactionSaved = () => {
    loadMonthData();
  };

  const handleDeleteTransaction = async (tx) => {
    try {
      await transactionService.deleteTransaction(tx._id || tx.id);
      loadMonthData();
    } catch (err) {
      alert(err.message || 'Failed to delete transaction.');
    }
  };

  // Loading state while checking session
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-app)',
          color: 'var(--forest-800)',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--forest-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 1.5s infinite',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-16 0V6" />
            <path d="M18 12h.01" />
          </svg>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Loading Pennywise...
        </p>
      </div>
    );
  }

  // Unauthenticated: Show Login/Register view
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Authenticated Layout
  const tabTitles = {
    dashboard: 'Financial Overview',
    transactions: 'Transaction History',
    reports: 'Monthly Reports',
  };

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Header
          title={tabTitles[activeTab]}
          selectedMonth={selectedMonth}
          onChangeMonth={setSelectedMonth}
          onOpenAddModal={handleOpenAddModal}
        />

        <main className="page-container">
          {activeTab === 'dashboard' && (
            <DashboardPage
              selectedMonth={selectedMonth}
              summary={summary}
              transactions={transactions}
              loading={dataLoading}
              isMounted={isMounted}
              onOpenAddModal={handleOpenAddModal}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPage
              selectedMonth={selectedMonth}
              transactions={transactions}
              onOpenAddModal={handleOpenAddModal}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              isMounted={isMounted}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage
              selectedMonth={selectedMonth}
              summary={summary}
              isMounted={isMounted}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Transaction Modal (Add/Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onTransactionSaved={handleTransactionSaved}
        initialData={editingTransaction}
      />
    </div>
  );
}
