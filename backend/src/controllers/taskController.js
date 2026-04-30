const Task = require('../models/Task');
const Project = require('../models/Project');

// POST /api/tasks (Admin only)
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;

    // Verify the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo: assignedTo || null,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'projectId', select: 'title' },
    ]);

    res.status(201).json({ message: 'Task created.', task: populated });
  } catch (error) {
    console.error('CreateTask error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/tasks?projectId=X&status=Y&priority=Z&search=Q&page=1&limit=20
exports.getTasks = async (req, res) => {
  try {
    const { projectId, status, priority, search, assignedTo, page = 1, limit = 20 } = req.query;

    const query = {};

    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // If user is Member, only show tasks assigned to them or in their projects
    if (req.user.role === 'Member') {
      const memberProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = memberProjects.map((p) => p._id);

      if (projectId) {
        // Verify they have access to this project
        if (!projectIds.some((pid) => pid.toString() === projectId)) {
          return res.status(403).json({ message: 'Access denied to this project.' });
        }
      } else {
        query.projectId = { $in: projectIds };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title members')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('GetTasks error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error('GetTaskById error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Members can only update status of tasks assigned to them
    if (req.user.role === 'Member') {
      const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
      
      if (!isAssigned) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you.' });
      }

      // Members can only update the status field
      const allowedFields = ['status'];
      const updateKeys = Object.keys(req.body);
      const isAllowed = updateKeys.every((key) => allowedFields.includes(key));
      if (!isAllowed) {
        return res.status(403).json({ message: 'Members can only update task status.' });
      }
    }

    // Process dueDate
    const updateData = { ...req.body };
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title');

    res.status(200).json({ message: 'Task updated.', task: updatedTask });
  } catch (error) {
    console.error('UpdateTask error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/tasks/:id (Admin only)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(200).json({ message: 'Task deleted.' });
  } catch (error) {
    console.error('DeleteTask error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/tasks/stats/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    let projectQuery = {};
    let taskQuery = {};

    if (req.user.role === 'Member') {
      const memberProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = memberProjects.map((p) => p._id);
      projectQuery = { _id: { $in: projectIds } };
      taskQuery = { projectId: { $in: projectIds } };
    }

    const totalProjects = await Project.countDocuments(projectQuery);
    const totalTasks = await Task.countDocuments(taskQuery);

    const tasksByStatus = await Task.aggregate([
      { $match: taskQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const tasksByPriority = await Task.aggregate([
      { $match: taskQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const overdueTasks = await Task.countDocuments({
      ...taskQuery,
      dueDate: { $lt: new Date() },
      status: { $ne: 'Done' },
    });

    // Tasks assigned to current user
    const myTasks = await Task.countDocuments({
      assignedTo: req.user._id,
      status: { $ne: 'Done' },
    });

    // Format status counts
    const statusMap = { 'To Do': 0, 'In Progress': 0, Done: 0 };
    tasksByStatus.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    const priorityMap = { Low: 0, Medium: 0, High: 0 };
    tasksByPriority.forEach((p) => {
      priorityMap[p._id] = p.count;
    });

    res.status(200).json({
      totalProjects,
      totalTasks,
      tasksByStatus: statusMap,
      tasksByPriority: priorityMap,
      overdueTasks,
      myTasks,
    });
  } catch (error) {
    console.error('DashboardStats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
