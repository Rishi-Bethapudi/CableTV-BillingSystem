const express = require('express');

const multer = require('multer');

const router = express.Router();

/*
=============================================================================
CONTROLLERS
=============================================================================
*/

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductsFromExcel,
  downloadProductsToExcel,
} = require('../controllers/product.controller');

/*
=============================================================================
MIDDLEWARES
=============================================================================
*/

const authMiddleware = require('../middleware/auth.middleware');

const allowRoles = require('../middleware/role.middleware');

const checkPermissions = require('../middleware/permission.middleware');

/*
=============================================================================
UPLOAD CONFIG
=============================================================================
*/

const upload = multer({
  dest: 'uploads/',

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

/*
=============================================================================
GLOBAL PROTECTION
=============================================================================
*/

router.use(authMiddleware);

router.use(allowRoles('operator'));

/*
=============================================================================
IMPORT / EXPORT
=============================================================================
*/

router.get(
  '/export/excel',

  checkPermissions('EXPORT_PRODUCTS'),

  downloadProductsToExcel,
);

router.post(
  '/import/excel',

  checkPermissions('IMPORT_PRODUCTS'),

  upload.single('file'),

  uploadProductsFromExcel,
);

/*
=============================================================================
CRUD
=============================================================================
*/

router.post(
  '/',

  checkPermissions('CREATE_PRODUCTS'),

  createProduct,
);

router.get(
  '/',

  checkPermissions('VIEW_PRODUCTS'),

  getProducts,
);

router.get(
  '/:id',

  checkPermissions('VIEW_PRODUCTS'),

  getProductById,
);

router.put(
  '/:id',

  checkPermissions('EDIT_PRODUCTS'),

  updateProduct,
);

router.delete(
  '/:id',

  checkPermissions('DELETE_PRODUCTS'),

  deleteProduct,
);

module.exports = router;
