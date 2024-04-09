const express = require('express');
const router = express.Router();
const usersControlller = require('../controllers/user_controller');

router.get('/', usersControlller.getUsers);
router.get('/:id', usersControlller.getUserById);
router.put('/:id', usersControlller.updateUser);


module.exports = router;