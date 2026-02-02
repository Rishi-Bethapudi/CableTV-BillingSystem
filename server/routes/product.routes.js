const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductsFromExcel,
  downloadProductsToExcel,
} = require('../controllers/product.controller');

const {
  authMiddleware,
  operatorOnly,
} = require('../middleware/auth.middleware');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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
router.get('/export/excel', downloadProductsToExcel);
router.post('/import/excel', upload.single('file'), uploadProductsFromExcel);
module.exports = router;
