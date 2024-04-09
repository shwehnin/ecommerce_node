const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin_controller');

router.get('/users/count', adminController.getUserCount);
router.delete('/users/:id', adminController.deleteUser)

router.post('/categories', adminController.addCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

router.get('/products', adminController.getProducts);
router.post('/products/count', adminController.addProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id/images', adminController.deleteProductImages);
router.delete('/products/:id', adminController.deleteProduct);

router.get('/orders', adminController.getOrders);
router.get('/orders/count', adminController.getOrdersCount);
router.put('/orders/:id', adminController.getOrderStatus);

module.exports = router;