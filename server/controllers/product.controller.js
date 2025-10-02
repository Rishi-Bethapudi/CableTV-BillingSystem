const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Customer = require('../models/customer.model');

/**
 * Create a new product for the logged-in operator.
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      productCode,
      name,
      category,
      customerPrice,
      operatorCost,
      billingInterval,
      isActive,
    } = req.body;
    const operatorId = req.user.id;

    // Validation
    if (
      !productCode ||
      !name ||
      customerPrice === undefined ||
      operatorCost === undefined
    ) {
      return res.status(400).json({
        message:
          'Please provide productCode, name, customerPrice, and operatorCost.',
      });
    }

    const newProduct = new Product({
      operatorId,
      productCode,
      name,
      category: category || 'Basic',
      customerPrice,
      operatorCost,
      billingInterval: billingInterval || { value: 30, unit: 'days' },
      isActive: isActive !== undefined ? isActive : true,
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
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.name = new RegExp(search, 'i');

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
 * Get a single product by ID for the logged-in operator.
 */
exports.getProductById = async (req, res) => {
  try {
    const operatorId = req.user.id;
    const product = await Product.findOne({
      _id: req.params.id,
      operatorId,
    }).lean();

    if (!product) {
      return res.status(404).json({
        message: 'Product not found or you do not have permission to view it.',
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
 */
exports.updateProduct = async (req, res) => {
  try {
    const operatorId = req.user.id;
    const {
      productCode,
      name,
      category,
      customerPrice,
      operatorCost,
      billingInterval,
      isActive,
    } = req.body;

    if (
      !productCode ||
      !name ||
      customerPrice === undefined ||
      operatorCost === undefined
    ) {
      return res.status(400).json({
        message:
          'Please provide productCode, name, customerPrice, and operatorCost.',
      });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id, operatorId },
      {
        productCode,
        name,
        category,
        customerPrice,
        operatorCost,
        billingInterval,
        isActive,
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProduct) {
      return res.status(404).json({
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
 * Cannot delete if assigned to any customer.
 */
exports.deleteProduct = async (req, res) => {
  try {
    const operatorId = req.user.id;
    const productId = req.params.id;

    // Check if any customer is using this product
    const inUse = await Customer.findOne({ productId, operatorId });
    if (inUse) {
      return res.status(400).json({
        message:
          'Cannot delete this product because it is assigned to one or more customers.',
      });
    }

    const deletedProduct = await Product.findOneAndDelete({
      _id: productId,
      operatorId,
    });
    if (!deletedProduct) {
      return res.status(404).json({
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
//Updated productController
