const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { verifyCsrf } = require('../middleware/csrf');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} = require('../controllers/transactionController');

const router = express.Router();

// Require authenticated session for all transaction endpoints
router.use(requireAuth);

// Summary aggregation endpoint (must be defined before /:id parameter route)
router.get('/summary', getSummary);

// Collection routes
router.get('/', getTransactions);
router.post('/', verifyCsrf, createTransaction);

// Document routes by ID
router.put('/:id', verifyCsrf, updateTransaction);
router.delete('/:id', verifyCsrf, deleteTransaction);

module.exports = router;
