const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { parseMonth } = require('../utils/dateUtils');
const { validateTransactionInput } = require('../validators/transactionValidator');

/**
 * Controller: Transaction Management and MongoDB Aggregation
 * All database operations are strictly scoped to req.userId from the verified session.
 */

// 1. GET /api/transactions?month=YYYY-MM
async function getTransactions(req, res, next) {
  try {
    const { startDate, endDate } = parseMonth(req.query.month);

    const transactions = await Transaction.find({
      userId: req.userId,
      date: { $gte: startDate, $lt: endDate },
    })
      .sort({ date: -1, _id: -1 })
      .lean();

    // Map _id to id and remove internal fields
    const formatted = transactions.map((t) => {
      const { _id, __v, ...rest } = t;
      return { id: _id, _id, ...rest };
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

// 2. POST /api/transactions
async function createTransaction(req, res, next) {
  try {
    const { isValid, errors, sanitized } = validateTransactionInput(req.body, false);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Explicitly bind the authenticated user's ID
    const newTransaction = await Transaction.create({
      ...sanitized,
      userId: req.userId,
    });

    const result = newTransaction.toJSON();

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// 3. PUT /api/transactions/:id
async function updateTransaction(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format.',
      });
    }

    const { isValid, errors, sanitized } = validateTransactionInput(req.body, true);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    if (Object.keys(sanitized).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid update fields provided.',
      });
    }

    // Ensure update is strictly scoped to the transaction owner
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: sanitized },
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

// 4. DELETE /api/transactions/:id
async function deleteTransaction(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format.',
      });
    }

    // Ensure delete is strictly scoped to the transaction owner
    const deleted = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

// 5. GET /api/transactions/summary?month=YYYY-MM
async function getSummary(req, res, next) {
  try {
    const { startDate, endDate } = parseMonth(req.query.month);

    // MongoDB aggregation pipeline using $facet for single-roundtrip metrics
    const [aggregationResult] = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(String(req.userId)),
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $facet: {
          // Total income and expenses
          totals: [
            {
              $group: {
                _id: null,
                totalIncome: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
                  },
                },
                totalExpense: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
                  },
                },
              },
            },
          ],
          // Category breakdown for expenses
          categoryBreakdown: [
            {
              $match: { type: 'expense' },
            },
            {
              $group: {
                _id: '$category',
                total: { $sum: '$amount' },
              },
            },
            {
              $sort: { total: -1 },
            },
            {
              $project: {
                _id: 0,
                category: '$_id',
                total: { $round: ['$total', 2] },
              },
            },
          ],
          // Daily income and expense trends
          dailyTrends: [
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$date',
                    timezone: 'UTC',
                  },
                },
                income: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
                  },
                },
                expense: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
                  },
                },
              },
            },
            {
              $sort: { _id: 1 },
            },
            {
              $project: {
                _id: 0,
                date: '$_id',
                income: { $round: ['$income', 2] },
                expense: { $round: ['$expense', 2] },
              },
            },
          ],
        },
      },
    ]);

    const totalsDoc = aggregationResult?.totals?.[0] || { totalIncome: 0, totalExpense: 0 };
    const rawIncome = Number(totalsDoc.totalIncome) || 0;
    const rawExpense = Number(totalsDoc.totalExpense) || 0;

    const totalIncome = Math.round(rawIncome * 100) / 100;
    const totalExpense = Math.round(rawExpense * 100) / 100;
    const netBalance = Math.round((totalIncome - totalExpense) * 100) / 100;

    // Savings rate formula:
    // If totalIncome > 0: ((totalIncome - totalExpense) / totalIncome) * 100 (clamped to 0% if deficit)
    // If totalIncome <= 0: 0%
    const rawSavingsRate =
      totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const savingsRate = Math.max(0, Math.round(rawSavingsRate * 10) / 10);

    // Compute category percentages
    const rawCategories = aggregationResult?.categoryBreakdown || [];
    const categoryBreakdown = rawCategories.map((item) => ({
      category: item.category,
      total: item.total,
      percentage:
        totalExpense > 0
          ? Math.round((item.total / totalExpense) * 1000) / 10
          : 0,
    }));

    const dailyTrends = aggregationResult?.dailyTrends || [];

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance,
        savingsRate,
        categoryBreakdown,
        dailyTrends,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
};
