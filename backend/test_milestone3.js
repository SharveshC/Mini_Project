/**
 * Comprehensive Integration Test for Milestone 3
 * Tests all 5 endpoints, authentication, CSRF, validation,
 * aggregation calculations, month boundaries, and cross-user data isolation.
 */

const BASE_URL = 'http://localhost:5000';

// Cookie jar for simulating browser session
class CookieSession {
  constructor() {
    this.cookies = {};
    this.csrfToken = null;
  }

  saveCookies(res) {
    const raw = res.headers.get('set-cookie');
    if (raw) {
      // Split cookies (handling commas inside dates carefully)
      const parts = raw.split(/,(?=\s*[a-zA-Z0-9_\-]+=)/);
      for (const part of parts) {
        const pair = part.split(';')[0].trim();
        const [name, val] = pair.split('=');
        if (name && val) {
          this.cookies[name] = val;
        }
      }
    }
  }

  getCookieHeader() {
    return Object.entries(this.cookies)
      .map(([name, val]) => `${name}=${val}`)
      .join('; ');
  }

  async fetch(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    const cookieHeader = this.getCookieHeader();
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }
    if (this.csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes((options.method || 'GET').toUpperCase())) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }
    if (options.body && typeof options.body === 'object' && !(options.body instanceof String)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
    });

    this.saveCookies(res);
    return res;
  }

  async refreshCsrf() {
    const res = await this.fetch('/api/auth/csrf-token');
    const data = await res.json();
    if (data.success && data.data?.csrfToken) {
      this.csrfToken = data.data.csrfToken;
    }
    return this.csrfToken;
  }
}

async function runTests() {
  console.log('--- STARTING MILESTONE 3 INTEGRATION TESTS ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const userA = new CookieSession();
  const userB = new CookieSession();

  const userAEmail = `test_user_a_${timestamp}@example.com`;
  const userBEmail = `test_user_b_${timestamp}@example.com`;
  const testPassword = 'Password123!';

  let createdTxId = null;

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.database === 'connected', 'Backend is healthy and connected to MongoDB Atlas');

    // 2. Unauthenticated access check (401)
    const unauthRes = await fetch(`${BASE_URL}/api/transactions?month=2026-10`);
    assert(unauthRes.status === 401, 'Unauthenticated GET /api/transactions returns 401');

    const unauthSummaryRes = await fetch(`${BASE_URL}/api/transactions/summary?month=2026-10`);
    assert(unauthSummaryRes.status === 401, 'Unauthenticated GET /api/transactions/summary returns 401');

    // 3. Register User A
    await userA.refreshCsrf();
    const regResA = await userA.fetch('/api/auth/register', {
      method: 'POST',
      body: { name: 'User A', email: userAEmail, password: testPassword },
    });
    const regDataA = await regResA.json();
    assert(regResA.status === 201 && regDataA.success, 'User A registered successfully');
    await userA.refreshCsrf();

    // 4. Register User B
    await userB.refreshCsrf();
    const regResB = await userB.fetch('/api/auth/register', {
      method: 'POST',
      body: { name: 'User B', email: userBEmail, password: testPassword },
    });
    const regDataB = await regResB.json();
    assert(regResB.status === 201 && regDataB.success, 'User B registered successfully');
    await userB.refreshCsrf();

    // 5. CSRF verification on mutation
    const noCsrfSession = new CookieSession();
    noCsrfSession.cookies = { ...userA.cookies }; // Has session but no X-CSRF-Token
    const noCsrfRes = await noCsrfSession.fetch('/api/transactions', {
      method: 'POST',
      body: {
        amount: 1000,
        type: 'income',
        category: 'Salary',
        date: '2026-10-01',
        paymentMethod: 'Net Banking',
      },
    });
    assert(noCsrfRes.status === 403, 'POST /api/transactions without CSRF token returns 403 Forbidden');

    // 6. Validation checks on creation
    // 6a. Negative amount
    const negAmountRes = await userA.fetch('/api/transactions', {
      method: 'POST',
      body: {
        amount: -50,
        type: 'expense',
        category: 'Food',
        date: '2026-10-10',
        paymentMethod: 'UPI',
      },
    });
    assert(negAmountRes.status === 400, 'Creation rejects negative amount (400)');

    // 6b. Invalid calendar date (e.g. Feb 31)
    const badDateRes = await userA.fetch('/api/transactions', {
      method: 'POST',
      body: {
        amount: 50,
        type: 'expense',
        category: 'Food',
        date: '2026-02-31',
        paymentMethod: 'UPI',
      },
    });
    assert(badDateRes.status === 400, 'Creation rejects invalid calendar date 2026-02-31 (400)');

    // 6c. Client-supplied unauthorized field (e.g. userId)
    const extraFieldRes = await userA.fetch('/api/transactions', {
      method: 'POST',
      body: {
        amount: 50,
        type: 'expense',
        category: 'Food',
        date: '2026-10-10',
        paymentMethod: 'UPI',
        userId: '60c72b2f9b1d8b2bad5e0123',
      },
    });
    assert(extraFieldRes.status === 400, 'Creation rejects client-supplied unauthorized field "userId" (400)');

    // 7. Create Income Transaction (Day 1 of month: 2026-10-01)
    const incomeRes = await userA.fetch('/api/transactions', {
      method: 'POST',
      body: {
        amount: 50000,
        type: 'income',
        category: 'Salary',
        date: '2026-10-01',
        paymentMethod: 'Net Banking',
        note: 'Monthly salary credit',
      },
    });
    const incomeData = await incomeRes.json();
    assert(incomeRes.status === 201 && incomeData.data?.amount === 50000, 'User A created income transaction of ₹50,000 on 2026-10-01');

    // 8. Create Expense Transaction 1 (2026-10-15)
    const exp1Res = await userA.fetch('/api/transactions', {
      method: 'POST',
      body: {
        amount: 15000,
        type: 'expense',
        category: 'Rent',
        date: '2026-10-15',
        paymentMethod: 'UPI',
        note: 'Apartment rent',
      },
    });
    const exp1Data = await exp1Res.json();
    createdTxId = exp1Data.data?.id || exp1Data.data?._id;
    assert(exp1Res.status === 201 && exp1Data.data?.category === 'Rent', 'User A created expense transaction for Rent');

    // 9. Create Expense Transaction 2 (Day 31 of month: 2026-10-31)
    const exp2Res = await userA.fetch('/api/transactions', {
      method: 'POST',
      body: {
        amount: 5000,
        type: 'expense',
        category: 'Food',
        date: '2026-10-31',
        paymentMethod: 'Credit Card',
        note: 'Groceries & dining',
      },
    });
    assert(exp2Res.status === 201, 'User A created expense transaction on last day of month (2026-10-31)');

    // 10. List transactions for 2026-10
    const listRes = await userA.fetch('/api/transactions?month=2026-10');
    const listData = await listRes.json();
    assert(listRes.status === 200 && listData.count === 3, 'GET /api/transactions returns all 3 transactions for 2026-10');
    // Verify deterministic sort: newest date first (2026-10-31 first, then 10-15, then 10-01)
    const dates = listData.data.map((tx) => tx.date.split('T')[0]);
    assert(dates[0] === '2026-10-31' && dates[2] === '2026-10-01', 'Transactions sorted deterministically by newest date first');

    // 11. Verify MongoDB Aggregation Summary for 2026-10
    // Total income: 50000
    // Total expense: 15000 + 5000 = 20000
    // Net balance: 50000 - 20000 = 30000
    // Savings rate: ((50000 - 20000) / 50000) * 100 = 60.0%
    const sumRes = await userA.fetch('/api/transactions/summary?month=2026-10');
    const sumData = await sumRes.json();
    const s = sumData.data;
    assert(s.totalIncome === 50000, `Summary totalIncome matches 50000 (actual: ${s.totalIncome})`);
    assert(s.totalExpense === 20000, `Summary totalExpense matches 20000 (actual: ${s.totalExpense})`);
    assert(s.netBalance === 30000, `Summary netBalance matches 30000 (actual: ${s.netBalance})`);
    assert(s.savingsRate === 60, `Summary savingsRate matches 60.0% (actual: ${s.savingsRate})`);
    assert(s.categoryBreakdown.length === 2, 'Summary has 2 expense categories');
    assert(s.categoryBreakdown[0].category === 'Rent' && s.categoryBreakdown[0].percentage === 75, 'Rent is 75% of expenses');
    assert(s.categoryBreakdown[1].category === 'Food' && s.categoryBreakdown[1].percentage === 25, 'Food is 25% of expenses');
    assert(s.dailyTrends.length === 3, 'Daily trends has 3 transaction days');

    // 12. Cross-user isolation (IDOR protection)
    // User B tries to view/update/delete User A's transaction
    const crossUpdateRes = await userB.fetch(`/api/transactions/${createdTxId}`, {
      method: 'PUT',
      body: { amount: 99999 },
    });
    assert(crossUpdateRes.status === 404, 'User B cannot update User A transaction (returns 404)');

    const crossDeleteRes = await userB.fetch(`/api/transactions/${createdTxId}`, {
      method: 'DELETE',
    });
    assert(crossDeleteRes.status === 404, 'User B cannot delete User A transaction (returns 404)');

    // 13. User B empty-month summary
    const emptySumRes = await userB.fetch('/api/transactions/summary?month=2026-10');
    const emptyData = await emptySumRes.json();
    assert(
      emptyData.data.totalIncome === 0 &&
      emptyData.data.totalExpense === 0 &&
      emptyData.data.netBalance === 0 &&
      emptyData.data.savingsRate === 0 &&
      emptyData.data.categoryBreakdown.length === 0 &&
      emptyData.data.dailyTrends.length === 0,
      'User B empty month returns valid zeros and empty arrays without NaN'
    );

    // 14. Update transaction
    const updateRes = await userA.fetch(`/api/transactions/${createdTxId}`, {
      method: 'PUT',
      body: {
        amount: 16000,
        note: 'Apartment rent + maintenance',
      },
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.data.amount === 16000, 'User A updated transaction amount to ₹16,000');

    // 15. Delete transaction
    const deleteRes = await userA.fetch(`/api/transactions/${createdTxId}`, {
      method: 'DELETE',
    });
    assert(deleteRes.status === 200, 'User A deleted transaction successfully');

    // Verify deletion reflected in list
    const afterDeleteRes = await userA.fetch('/api/transactions?month=2026-10');
    const afterDeleteData = await afterDeleteRes.json();
    assert(afterDeleteData.count === 2, 'Transaction count decreased from 3 to 2 after deletion');

    console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    // 16. Clean up test users and test transactions from Atlas
    console.log('\nCleaning up test artifacts from MongoDB Atlas...');
    try {
      const mongoose = require('mongoose');
      require('dotenv').config();
      await mongoose.connect(process.env.MONGODB_URI);
      const User = require('./src/models/User');
      const Transaction = require('./src/models/Transaction');

      const deletedUsers = await User.find({ email: { $in: [userAEmail, userBEmail] } });
      const userIds = deletedUsers.map((u) => u._id);

      const delTx = await Transaction.deleteMany({ userId: { $in: userIds } });
      const delUser = await User.deleteMany({ _id: { $in: userIds } });

      console.log(`Cleaned up ${delUser.deletedCount} test users and ${delTx.deletedCount} test transactions.`);
      await mongoose.connection.close();
    } catch (cleanupErr) {
      console.warn('Cleanup error:', cleanupErr.message);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
