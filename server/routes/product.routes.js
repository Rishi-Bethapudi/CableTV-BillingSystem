const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');

const {
  authMiddleware,
  operatorOnly,
} = require('../middleware/auth.middleware');

/**
 * ==============================================================================================
 * PRODUCT ROUTES
 * ==============================================================================================
 * @note All routes in this file are protected and can only be accessed by an authenticated operator.
 * The `operatorOnly` middleware ensures that the user has the 'operator' role.
 * Data access is automatically scoped to the logged-in operator via `req.user.id`.
 */

// Mount the middleware for all routes in this file
router.use(authMiddleware, operatorOnly);

/**
 * @route   POST /api/products
 * @desc    Create a new product for the operator
 * @access  Private (Operator)
 */
router.post('/', createProduct);

/**
 * @route   GET /api/products
 * @desc    Get all products for the operator with optional filters
 * @access  Private (Operator)
 * @query   ?search=...&isActive=true/false&sortBy=name&order=asc/desc
 */
router.get('/', getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by its ID
 * @access  Private (Operator)
 */
router.get('/:id', getProductById);

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product
 * @access  Private (Operator)
 */
router.put('/:id', updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Operator)
 */
router.delete('/:id', deleteProduct);

module.exports = router;
