const Product = require('../models/Product');

exports.updateVerifyDescription = async (req, res, next) => {
  try {
    const { status, reason } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    let description;
    switch (status) {
      case 'approved':
        description = 'Product has passed review';
        break;
      case 'rejected':
        description = `Product has been rejected. Reason: ${reason || 'Unknown reason'}`;
        break;
      default:
        description = 'This product is under review. Please wait...';
    }
    req.body.description = description;

    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
