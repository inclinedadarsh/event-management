import express from 'express';
import {
  getMyEvents,
  registerForEvent,
  cancelRegistration,
  getEventRegistrations
} from '../controllers/registrationController.js';
import { authenticateToken } from '../utils/auth.js';
import { requireAdmin } from '../utils/admin.js';

const router = express.Router();

// User routes
router.get('/my-events', authenticateToken, getMyEvents);
router.post('/:eventId', authenticateToken, registerForEvent);
router.delete('/:eventId', authenticateToken, cancelRegistration);

// Admin route
router.get('/event/:eventId', requireAdmin, getEventRegistrations);

export default router;

