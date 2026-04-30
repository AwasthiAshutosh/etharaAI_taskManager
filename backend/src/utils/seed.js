const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing data.');

    // Create users
    const admin = await User.create({
      name: 'Alex Admin',
      email: 'admin@etharaai.com',
      password: 'admin123',
      role: 'Admin',
    });

    const member1 = await User.create({
      name: 'Jordan Member',
      email: 'jordan@etharaai.com',
      password: 'member123',
      role: 'Member',
    });

    const member2 = await User.create({
      name: 'Sam Developer',
      email: 'sam@etharaai.com',
      password: 'member123',
      role: 'Member',
    });

    const member3 = await User.create({
      name: 'Taylor Designer',
      email: 'taylor@etharaai.com',
      password: 'member123',
      role: 'Member',
    });

    console.log('👤 Users created.');

    // Create projects
    const project1 = await Project.create({
      title: 'E-Commerce Platform',
      description: 'Build a modern e-commerce platform with payment integration, product catalog, and order management.',
      createdBy: admin._id,
      members: [member1._id, member2._id],
    });

    const project2 = await Project.create({
      title: 'Mobile Banking App',
      description: 'Design and develop a secure mobile banking application with real-time transaction tracking.',
      createdBy: admin._id,
      members: [member2._id, member3._id],
    });

    const project3 = await Project.create({
      title: 'AI Analytics Dashboard',
      description: 'Create an analytics dashboard powered by machine learning for business intelligence insights.',
      createdBy: admin._id,
      members: [member1._id, member3._id],
    });

    console.log('📁 Projects created.');

    // Helper for dates
    const daysFromNow = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d;
    };

    // Create tasks for Project 1
    const tasks = [
      { title: 'Setup project repository', description: 'Initialize Git repo, configure CI/CD pipeline, and setup branch protection rules.', projectId: project1._id, assignedTo: member1._id, status: 'Done', priority: 'High', dueDate: daysFromNow(-5) },
      { title: 'Design database schema', description: 'Create ERD for products, users, orders, and payments tables.', projectId: project1._id, assignedTo: member2._id, status: 'Done', priority: 'High', dueDate: daysFromNow(-3) },
      { title: 'Implement product catalog API', description: 'Build REST endpoints for CRUD operations on products with filtering and pagination.', projectId: project1._id, assignedTo: member1._id, status: 'In Progress', priority: 'High', dueDate: daysFromNow(5) },
      { title: 'Build shopping cart feature', description: 'Implement add-to-cart, update quantities, and remove items functionality.', projectId: project1._id, assignedTo: member2._id, status: 'To Do', priority: 'Medium', dueDate: daysFromNow(10) },
      { title: 'Payment gateway integration', description: 'Integrate Stripe API for secure payment processing with webhooks.', projectId: project1._id, assignedTo: member1._id, status: 'To Do', priority: 'High', dueDate: daysFromNow(15) },
      { title: 'Write unit tests', description: 'Achieve 80% code coverage on all API endpoints.', projectId: project1._id, assignedTo: member2._id, status: 'To Do', priority: 'Low', dueDate: daysFromNow(20) },

      // Project 2 tasks
      { title: 'UI/UX wireframes', description: 'Create wireframes for all screens: login, dashboard, transfers, and history.', projectId: project2._id, assignedTo: member3._id, status: 'Done', priority: 'High', dueDate: daysFromNow(-7) },
      { title: 'Authentication system', description: 'Implement biometric and PIN-based authentication with 2FA support.', projectId: project2._id, assignedTo: member2._id, status: 'In Progress', priority: 'High', dueDate: daysFromNow(3) },
      { title: 'Transaction history module', description: 'Build real-time transaction feed with search and export capabilities.', projectId: project2._id, assignedTo: member2._id, status: 'To Do', priority: 'Medium', dueDate: daysFromNow(8) },
      { title: 'Push notifications', description: 'Implement push notification service for transaction alerts and security notifications.', projectId: project2._id, assignedTo: member3._id, status: 'To Do', priority: 'Low', dueDate: daysFromNow(12) },
      { title: 'Security audit', description: 'Conduct penetration testing and fix vulnerabilities. Prepare compliance documentation.', projectId: project2._id, assignedTo: member2._id, status: 'To Do', priority: 'High', dueDate: daysFromNow(-2) },

      // Project 3 tasks
      { title: 'Data pipeline setup', description: 'Configure ETL pipeline for ingesting data from multiple sources into the analytics engine.', projectId: project3._id, assignedTo: member1._id, status: 'In Progress', priority: 'High', dueDate: daysFromNow(4) },
      { title: 'Dashboard layout design', description: 'Design responsive dashboard layout with widget-based architecture.', projectId: project3._id, assignedTo: member3._id, status: 'In Progress', priority: 'Medium', dueDate: daysFromNow(6) },
      { title: 'Implement chart components', description: 'Build reusable chart components: bar, line, pie, and heatmap using Recharts.', projectId: project3._id, assignedTo: member3._id, status: 'To Do', priority: 'Medium', dueDate: daysFromNow(9) },
      { title: 'ML model integration', description: 'Integrate trained ML model for predictive analytics and anomaly detection.', projectId: project3._id, assignedTo: member1._id, status: 'To Do', priority: 'High', dueDate: daysFromNow(14) },
      { title: 'Performance optimization', description: 'Optimize query performance and implement caching for dashboard data.', projectId: project3._id, assignedTo: member1._id, status: 'To Do', priority: 'Low', dueDate: daysFromNow(18) },
    ];

    await Task.insertMany(tasks);
    console.log('✅ Tasks created.');

    console.log('\n📋 Seed Summary:');
    console.log(`   Users: 4 (1 Admin, 3 Members)`);
    console.log(`   Projects: 3`);
    console.log(`   Tasks: ${tasks.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin:  admin@etharaai.com / admin123');
    console.log('   Member: jordan@etharaai.com / member123');
    console.log('   Member: sam@etharaai.com / member123');
    console.log('   Member: taylor@etharaai.com / member123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
