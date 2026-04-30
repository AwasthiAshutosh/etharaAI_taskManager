const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createProjectSchema, updateProjectSchema } = require('../utils/validators');

router.post('/', authenticate, authorize('Admin'), validate(createProjectSchema), projectController.createProject);
router.get('/', authenticate, projectController.getProjects);
router.get('/:id', authenticate, projectController.getProjectById);
router.put('/:id', authenticate, authorize('Admin'), validate(updateProjectSchema), projectController.updateProject);
router.delete('/:id', authenticate, authorize('Admin'), projectController.deleteProject);

module.exports = router;
