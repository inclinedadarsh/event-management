import { dbGet, dbAll, dbRun } from '../utils/database.js';

export async function getMyEvents(req, res) {
  try {
    const userId = req.user.id;
    
    const events = await dbAll(`
      SELECT 
        e.*,
        r.registered_at,
        (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) as registered_count,
        (e.capacity - (SELECT COUNT(*) FROM registrations WHERE event_id = e.id)) as remaining_spots
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.user_id = ?
      ORDER BY e.date, e.time
    `, [userId]);
    
    res.json({ events });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function registerForEvent(req, res) {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    // Check if event exists
    const event = await dbGet('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if already registered
    const existing = await dbGet(
      'SELECT id FROM registrations WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );
    
    if (existing) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }
    
    // Check capacity
    const registrationCount = await dbGet(
      'SELECT COUNT(*) as count FROM registrations WHERE event_id = ?',
      [eventId]
    );
    
    if (registrationCount.count >= event.capacity) {
      return res.status(400).json({ error: 'Event is at full capacity' });
    }
    
    // Register
    await dbRun(
      'INSERT INTO registrations (user_id, event_id) VALUES (?, ?)',
      [userId, eventId]
    );
    
    res.status(201).json({ message: 'Successfully registered for event' });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function cancelRegistration(req, res) {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    // Check if registration exists
    const registration = await dbGet(
      'SELECT * FROM registrations WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );
    
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    // Check event date (can't cancel if event has passed)
    const event = await dbGet('SELECT date, time FROM events WHERE id = ?', [eventId]);
    if (event) {
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      if (eventDateTime < new Date()) {
        return res.status(400).json({ error: 'Cannot cancel registration for past events' });
      }
    }
    
    // Cancel registration
    await dbRun(
      'DELETE FROM registrations WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );
    
    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getEventRegistrations(req, res) {
  try {
    const { eventId } = req.params;
    
    // Check if event exists
    const event = await dbGet('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get all registrations for this event
    const registrations = await dbAll(`
      SELECT 
        r.id,
        r.registered_at,
        u.id as user_id,
        u.username,
        u.email
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = ?
      ORDER BY r.registered_at DESC
    `, [eventId]);
    
    const registrationCount = registrations.length;
    
    res.json({
      event: {
        ...event,
        registered_count: registrationCount,
        remaining_spots: event.capacity - registrationCount
      },
      registrations
    });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

