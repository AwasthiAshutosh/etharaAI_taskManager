const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema } = require('../utils/validators');

router.post('/', authenticate, authorize('Admin'), validate(createTaskSchema), taskController.createTask);
router.get('/stats/dashboard', authenticate, taskController.getDashboardStats);
router.get('/', authenticate, taskController.getTasks);
router.get('/:id', authenticate, taskController.getTaskById);
router.put('/:id', authenticate, validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', authenticate, authorize('Admin'), taskController.deleteTask);

module.exports = router;
