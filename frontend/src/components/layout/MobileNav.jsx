import { useAuth } from '../../context/useAuth';

export default function MobileNav({ activeTab, onSelectTab, onOpenAddModal }) {
  const { logout } = useAuth();

  return (
    <nav
      className="mobile-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0.5rem 0.25rem',
        zIndex: 900,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      <button
        type="button"
        onClick={() => onSelectTab('dashboard')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          border: 'none',
          background: 'none',
          fontSize: '0.75rem',
          color: activeTab === 'dashboard' ? 'var(--forest-800)' : 'var(--text-muted)',
          fontWeight: activeTab === 'dashboard' ? 600 : 500,
          cursor: 'pointer',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
        Overview
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('transactions')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          border: 'none',
          background: 'none',
          fontSize: '0.75rem',
          color: activeTab === 'transactions' ? 'var(--forest-800)' : 'var(--text-muted)',
          fontWeight: activeTab === 'transactions' ? 600 : 500,
          cursor: 'pointer',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        History
      </button>

      {/* Floating Center Action */}
      <button
        type="button"
        onClick={onOpenAddModal}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--forest-800)',
          color: 'var(--text-inverse)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginTop: '-16px',
          boxShadow: 'var(--shadow-md)',
        }}
        title="Add Transaction"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('reports')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          border: 'none',
          background: 'none',
          fontSize: '0.75rem',
          color: activeTab === 'reports' ? 'var(--forest-800)' : 'var(--text-muted)',
          fontWeight: activeTab === 'reports' ? 600 : 500,
          cursor: 'pointer',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        Reports
      </button>

      <button
        type="button"
        onClick={logout}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          border: 'none',
          background: 'none',
          fontSize: '0.75rem',
          color: 'var(--expense)',
          cursor: 'pointer',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Exit
      </button>
    </nav>
  );
}
