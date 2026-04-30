const Project = require('../models/Project');
const Task = require('../models/Task');

// POST /api/projects (Admin only)
exports.createProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: members || [],
    });

    const populated = await project.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);

    res.status(201).json({ message: 'Project created.', project: populated });
  } catch (error) {
    console.error('CreateProject error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    let query = {};

    // Members can only see projects they belong to
    if (req.user.role === 'Member') {
      query = { members: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ projects });
  } catch (error) {
    console.error('GetProjects error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Members can only view projects they belong to
    if (
      req.user.role === 'Member' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.status(200).json({ project });
  } catch (error) {
    console.error('GetProjectById error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/projects/:id (Admin only)
exports.updateProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, members },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    res.status(200).json({ message: 'Project updated.', project });
  } catch (error) {
    console.error('UpdateProject error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/projects/:id (Admin only)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Also delete all tasks in this project
    await Task.deleteMany({ projectId: req.params.id });

    res.status(200).json({ message: 'Project and its tasks deleted.' });
  } catch (error) {
    console.error('DeleteProject error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
