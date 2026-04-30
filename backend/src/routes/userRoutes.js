const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/me', authenticate, userController.getMe);
router.get('/', authenticate, authorize('Admin'), userController.getAllUsers);

module.exports = router;
