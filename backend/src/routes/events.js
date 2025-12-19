import express from 'express';
import {
  getAllEvents,
  getEventById,
  getEventsByCategory,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController.js';
import { requireAdmin } from '../utils/admin.js';

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/category/:category', getEventsByCategory);
router.get('/:id', getEventById);

// Admin routes
router.post('/', requireAdmin, createEvent);
router.put('/:id', requireAdmin, updateEvent);
router.delete('/:id', requireAdmin, deleteEvent);

export default router;

