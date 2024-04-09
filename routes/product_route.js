const router = require('express').Router();
const productController = require("../controllers/product_controller");
router.get('/products/:id', productController.getProductById);

module.exports = router;