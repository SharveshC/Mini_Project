import { apiRequest } from './api';

/**
 * Transaction Service Layer
 * Interfaces with official REST endpoints:
 * - GET /api/transactions?month=YYYY-MM
 * - POST /api/transactions
 * - PUT /api/transactions/:id
 * - DELETE /api/transactions/:id
 * - GET /api/transactions/summary?month=YYYY-MM
 *
 * NOTE: When backend transaction routes are not yet mounted (Milestone 3),
 * this service reports { isMounted: false } so the UI displays an honest
 * readiness state rather than fabricating fake financial metrics.
 */

export const transactionService = {
  // Fetch transactions for selected month
  async getTransactions(month) {
    try {
      const res = await apiRequest(`/api/transactions?month=${encodeURIComponent(month)}`);
      return {
        isMounted: true,
        transactions: res.data || [],
        count: res.count || (res.data ? res.data.length : 0),
      };
    } catch (err) {
      if (err.status === 404) {
        return {
          isMounted: false,
          transactions: [],
          count: 0,
          message: 'Transaction API endpoints are scheduled for Milestone 3.',
        };
      }
      throw err;
    }
  },

  // Fetch summary aggregation for selected month
  async getSummary(month) {
    try {
      const res = await apiRequest(`/api/transactions/summary?month=${encodeURIComponent(month)}`);
      return {
        isMounted: true,
        summary: res.data || {
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
          savingsRate: 0,
          categoryBreakdown: [],
          dailyTrends: [],
        },
      };
    } catch (err) {
      if (err.status === 404) {
        return {
          isMounted: false,
          summary: {
            totalIncome: 0,
            totalExpense: 0,
            netBalance: 0,
            savingsRate: 0,
            categoryBreakdown: [],
            dailyTrends: [],
          },
          message: 'Summary aggregation API is scheduled for Milestone 3.',
        };
      }
      throw err;
    }
  },

  // Create new transaction
  async createTransaction(transactionData) {
    return apiRequest('/api/transactions', {
      method: 'POST',
      body: transactionData,
    });
  },

  // Update existing transaction
  async updateTransaction(id, transactionData) {
    return apiRequest(`/api/transactions/${id}`, {
      method: 'PUT',
      body: transactionData,
    });
  },

  // Delete transaction
  async deleteTransaction(id) {
    return apiRequest(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};
