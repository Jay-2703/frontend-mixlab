import express from 'express';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// Dashboard stats
router.get('/dashboard/stats', adminController.getDashboardStats);

// Activities
router.get('/activities', adminController.getActivities);
router.post('/activities', adminController.createActivity);
router.put('/activities/:id', adminController.updateActivity);
router.delete('/activities/:id', adminController.deleteActivity);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Courses
router.get('/courses', adminController.getCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

export default router;

