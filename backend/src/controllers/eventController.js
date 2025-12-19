import { dbGet, dbAll, dbRun } from '../utils/database.js';

export async function getAllEvents(req, res) {
  try {
    const { category } = req.query;
    
    let query = `
      SELECT 
        e.*,
        COUNT(r.id) as registered_count,
        (e.capacity - COUNT(r.id)) as remaining_spots
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
    `;
    
    const params = [];
    if (category) {
      query += ' WHERE e.category = ?';
      params.push(category);
    }
    
    query += ' GROUP BY e.id ORDER BY e.date, e.time';
    
    const events = await dbAll(query, params);
    
    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getEventById(req, res) {
  try {
    const { id } = req.params;
    
    const event = await dbGet('SELECT * FROM events WHERE id = ?', [id]);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get registration count
    const registrationCount = await dbGet(
      'SELECT COUNT(*) as count FROM registrations WHERE event_id = ?',
      [id]
    );
    
    event.registered_count = registrationCount.count;
    event.remaining_spots = event.capacity - registrationCount.count;
    
    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getEventsByCategory(req, res) {
  try {
    const { category } = req.params;
    
    const events = await dbAll(`
      SELECT 
        e.*,
        COUNT(r.id) as registered_count,
        (e.capacity - COUNT(r.id)) as remaining_spots
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.category = ?
      GROUP BY e.id
      ORDER BY e.date, e.time
    `, [category]);
    
    res.json({ events });
  } catch (error) {
    console.error('Get events by category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createEvent(req, res) {
  try {
    const { title, description, category, date, time, location, capacity } = req.body;
    
    // Validation
    if (!title || !category || !date || !time || !location || !capacity) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (capacity < 1) {
      return res.status(400).json({ error: 'Capacity must be at least 1' });
    }
    
    const result = await dbRun(
      `INSERT INTO events (title, description, category, date, time, location, capacity, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || '', category, date, time, location, capacity, req.user.id]
    );
    
    const event = await dbGet('SELECT * FROM events WHERE id = ?', [result.lastID]);
    
    res.status(201).json({
      message: 'Event created successfully',
      event: { ...event, registered_count: 0, remaining_spots: capacity }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const { title, description, category, date, time, location, capacity } = req.body;
    
    // Check if event exists
    const event = await dbGet('SELECT * FROM events WHERE id = ?', [id]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Update event
    await dbRun(
      `UPDATE events 
       SET title = ?, description = ?, category = ?, date = ?, time = ?, location = ?, capacity = ?
       WHERE id = ?`,
      [
        title || event.title,
        description !== undefined ? description : event.description,
        category || event.category,
        date || event.date,
        time || event.time,
        location || event.location,
        capacity || event.capacity,
        id
      ]
    );
    
    const updatedEvent = await dbGet('SELECT * FROM events WHERE id = ?', [id]);
    const registrationCount = await dbGet(
      'SELECT COUNT(*) as count FROM registrations WHERE event_id = ?',
      [id]
    );
    
    updatedEvent.registered_count = registrationCount.count;
    updatedEvent.remaining_spots = updatedEvent.capacity - registrationCount.count;
    
    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    
    // Check if event exists
    const event = await dbGet('SELECT * FROM events WHERE id = ?', [id]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Delete registrations first (cascade)
    await dbRun('DELETE FROM registrations WHERE event_id = ?', [id]);
    
    // Delete event
    await dbRun('DELETE FROM events WHERE id = ?', [id]);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

