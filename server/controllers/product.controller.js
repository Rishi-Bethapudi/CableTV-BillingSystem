const Product = require('../models/product.model');
const Customer = require('../models/customer.model');

/**
 * Create a new product for the logged-in operator.
 * The operator's ID is automatically assigned from the authenticated user's token.
 */
exports.createProduct = async (req, res) => {
  try {
    const { name, customerPrice, operatorCost, billingInterval, isActive } =
      req.body;
    const operatorId = req.user.id; // From authMiddleware

    // --- Validation ---
    if (!name || customerPrice === undefined || operatorCost === undefined) {
      return res.status(400).json({
        message: 'Please provide name, customerPrice, and operatorCost.',
      });
    }

    const newProduct = new Product({
      ...req.body,
      operatorId, // Ensure product is tied to the correct operator
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error while creating product.' });
  }
};

/**
 * Get all products for the logged-in operator.
 * Supports filtering by active status and searching by name.
 */
exports.getProducts = async (req, res) => {
  try {
    const operatorId = req.user.id;
    const {
      isActive,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = { operatorId };

    if (isActive) {
      query.isActive = isActive === 'true';
    }
    if (search) {
      query.name = new RegExp(search, 'i'); // Case-insensitive search
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const products = await Product.find(query).sort(sort).lean();

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products.' });
  }
};

/**
 * Get a single product by its ID.
 * Ensures the product belongs to the requesting operator.
 */
exports.getProductById = async (req, res) => {
  try {
    const operatorId = req.user.id;
    const product = await Product.findOne({
      _id: req.params.id,
      operatorId: operatorId, // Security check
    }).lean();

    if (!product) {
      return res
        .status(404)
        .json({
          message:
            'Product not found or you do not have permission to view it.',
        });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * Update a product's details.
 * Ensures the product belongs to the requesting operator.
 */
exports.updateProduct = async (req, res) => {
  try {
    const operatorId = req.user.id;
    const { name, customerPrice, operatorCost, billingInterval, isActive } =
      req.body;

    // --- Validation ---
    if (!name || customerPrice === undefined || operatorCost === undefined) {
      return res.status(400).json({
        message: 'Please provide name, customerPrice, and operatorCost.',
      });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id, operatorId: operatorId }, // Find and verify ownership
      { $set: req.body },
      { new: true, runValidators: true } // Return the updated doc and run schema validators
    ).lean();

    if (!updatedProduct) {
      return res
        .status(404)
        .json({
          message:
            'Product not found or you do not have permission to update it.',
        });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product.' });
  }
};

/**
 * Delete a product.
 * Prevents deletion if the product is currently in use by any customers.
 */
exports.deleteProduct = async (req, res) => {
  try {
    const operatorId = req.user.id;
    const productId = req.params.id;

    // --- Check if product is in use ---
    const customerUsingProduct = await Customer.findOne({
      productId: productId,
      operatorId: operatorId,
    });

    if (customerUsingProduct) {
      return res
        .status(400)
        .json({
          message:
            'Cannot delete this product because it is currently assigned to one or more customers.',
        });
    }

    const deletedProduct = await Product.findOneAndDelete({
      _id: productId,
      operatorId: operatorId, // Security check
    });

    if (!deletedProduct) {
      return res
        .status(404)
        .json({
          message:
            'Product not found or you do not have permission to delete it.',
        });
    }

    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product.' });
  }
};
