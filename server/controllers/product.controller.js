const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Subscription = require('../models/subscription.model');
const xlsx = require('xlsx');
const fs = require('fs');

exports.createProduct = async (req, res) => {
  try {
    const {
      productCode,
      name,
      planType,
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
          'productCode, name, customerPrice & operatorCost are required.',
      });
    }

    if (!['BASE', 'ADDON'].includes(planType)) {
      return res.status(400).json({
        message: 'planType must be BASE or ADDON.',
      });
    }

    const newProduct = await Product.create({
      operatorId: req.user.operatorId,
      productCode,
      name,
      planType,
      customerPrice,
      operatorCost,
      billingInterval: billingInterval || { value: 30, unit: 'days' },
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error while creating product.' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const {
      isActive,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;
    const query = { operatorId: req.user.operatorId };

    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.name = new RegExp(search, 'i');

    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
    const products = await Product.find(query).sort(sort).lean();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products.' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      operatorId: req.user.operatorId,
    }).lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const {
      productCode,
      name,
      planType,
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
          'productCode, name, customerPrice & operatorCost are required.',
      });
    }

    if (planType && !['BASE', 'ADDON'].includes(planType)) {
      return res.status(400).json({
        message: 'planType must be BASE or ADDON.',
      });
    }

    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, operatorId: req.user.operatorId },
      {
        productCode,
        name,
        planType,
        customerPrice,
        operatorCost,
        billingInterval,
        isActive,
      },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const operatorId = req.user.operatorId;
    const productId = req.params.id;

    // ❗ correct validation
    const inUse = await Subscription.findOne({
      productId,
      operatorId,
      status: { $in: ['ACTIVE', 'EXPIRED'] },
    });

    if (inUse) {
      return res.status(400).json({
        message:
          'Cannot delete product because subscriptions exist for this product.',
      });
    }

    const deleted = await Product.findOneAndDelete({
      _id: productId,
      operatorId,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.downloadProductsToExcel = async (req, res) => {
  try {
    const products = await Product.find({ operatorId: req.user.id }).lean();
    if (products.length === 0)
      return res
        .status(400)
        .json({ message: 'No products available to download.' });

    const rows = products.map((p) => ({
      productCode: p.productCode,
      name: p.name,
      planType: p.planType,
      customerPrice: p.customerPrice,
      operatorCost: p.operatorCost,
      billingIntervalValue: p.billingInterval?.value ?? 30,
      billingIntervalUnit: p.billingInterval?.unit ?? 'days',
      isActive: p.isActive,
    }));

    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');

    const fileName = `products_${Date.now()}.xlsx`;
    const filePath = `uploads/${fileName}`;
    xlsx.writeFile(workbook, filePath);

    res.download(filePath, fileName, (err) => {
      fs.unlinkSync(filePath); // cleanup after download
    });
  } catch (error) {
    console.error('Excel download error:', error);
    return res.status(500).json({ message: 'Error generating Excel file.' });
  }
};

exports.uploadProductsFromExcel = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'No file uploaded.' });

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    let success = 0,
      failed = 0;

    for (const row of rows) {
      try {
        if (
          !row.productCode ||
          !row.name ||
          !row.customerPrice ||
          !row.operatorCost
        ) {
          failed++;
          continue;
        }

        await Product.findOneAndUpdate(
          {
            operatorId: req.user.operatorId,
            productCode: String(row.productCode).trim(),
          },
          {
            operatorId: req.user.operatorId,
            productCode: String(row.productCode).trim(),
            name: String(row.name).trim(),
            planType:
              row.planType?.toUpperCase() === 'ADDON' ? 'ADDON' : 'BASE',
            customerPrice: parseFloat(row.customerPrice) || 0,
            operatorCost: parseFloat(row.operatorCost) || 0,

            billingInterval: {
              value: Number(row.billingIntervalValue || 30),
              unit: row.billingIntervalUnit === 'months' ? 'months' : 'days',
            },
            isActive: row.isActive === false ? false : true,
          },
          { upsert: true, new: true, runValidators: true },
        );

        success++;
      } catch (err) {
        console.error('Row failed:', row, err.message);
        failed++;
      }
    }

    fs.unlinkSync(req.file.path); // cleanup
    return res.status(200).json({
      message: 'Excel uploaded successfully',
      summary: { success, failed },
    });
  } catch (error) {
    console.error('Excel upload error:', error);
    return res.status(500).json({ message: 'Error reading Excel file.' });
  }
};
