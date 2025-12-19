import { eventsAPI, registrationsAPI, getCurrentUser } from './api.js';
import { handleLogout } from './auth.js';

let allEvents = [];
let editingEventId = null;

// Initialize admin dashboard
export async function initAdminDashboard() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  
  if (user.role !== 'admin') {
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Set admin info
  document.getElementById('admin-name').textContent = user.username;
  
  // Load events
  await loadEvents();
  
  // Setup event listeners
  setupEventListeners();
}

// Load all events
async function loadEvents() {
  try {
    const response = await eventsAPI.getAll();
    allEvents = response.events || [];
    renderEvents();
  } catch (error) {
    showError('Failed to load events: ' + error.message);
  }
}

// Render events list
function renderEvents() {
  const container = document.getElementById('events-list');
  
  if (allEvents.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">No events created yet.</p>';
    return;
  }
  
  container.innerHTML = allEvents.map(event => createEventRow(event)).join('');
  
  // Attach event listeners
  allEvents.forEach(event => {
    const editBtn = document.getElementById(`edit-btn-${event.id}`);
    const deleteBtn = document.getElementById(`delete-btn-${event.id}`);
        const viewRegBtn = document.getElementById(`view-reg-btn-${event.id}`);
    
    if (editBtn) {
      editBtn.addEventListener('click', () => editEvent(event));
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => deleteEvent(event.id));
    }
    if (viewRegBtn) {
      viewRegBtn.addEventListener('click', () => viewRegistrations(event.id));
    }
  });
}

// Create event row HTML
function createEventRow(event) {
  return `
    <tr class="border-b hover:bg-gray-50">
      <td class="px-6 py-4">${escapeHtml(event.title)}</td>
      <td class="px-6 py-4">
        <span class="px-2 py-1 rounded text-sm ${
          event.category === 'conference' ? 'bg-blue-100 text-blue-800' :
          event.category === 'seminar' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }">${escapeHtml(event.category)}</span>
      </td>
      <td class="px-6 py-4">${formatDate(event.date)}</td>
      <td class="px-6 py-4">${escapeHtml(event.time)}</td>
      <td class="px-6 py-4">${escapeHtml(event.location)}</td>
      <td class="px-6 py-4">${event.registered_count || 0} / ${event.capacity}</td>
      <td class="px-6 py-4">
        <div class="flex space-x-2">
          <button id="view-reg-btn-${event.id}" class="text-blue-600 hover:underline text-sm">View</button>
          <button id="edit-btn-${event.id}" class="text-green-600 hover:underline text-sm">Edit</button>
          <button id="delete-btn-${event.id}" class="text-red-600 hover:underline text-sm">Delete</button>
        </div>
      </td>
    </tr>
  `;
}

// Handle create event form submission
export async function handleCreateEvent(event) {
  event.preventDefault();
  
  const formData = {
    title: document.getElementById('event-title').value.trim(),
    description: document.getElementById('event-description').value.trim(),
    category: document.getElementById('event-category').value,
    date: document.getElementById('event-date').value,
    time: document.getElementById('event-time').value,
    location: document.getElementById('event-location').value.trim(),
    capacity: parseInt(document.getElementById('event-capacity').value)
  };
  
  // Validation
  if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.capacity) {
    showError('Please fill in all required fields');
    return;
  }
  
  if (formData.capacity < 1) {
    showError('Capacity must be at least 1');
    return;
  }
  
  try {
    if (editingEventId) {
      await eventsAPI.update(editingEventId, formData);
      showSuccess('Event updated successfully!');
    } else {
      await eventsAPI.create(formData);
      showSuccess('Event created successfully!');
    }
    
    // Reset form
    document.getElementById('event-form').reset();
    editingEventId = null;
    document.getElementById('form-title').textContent = 'Create New Event';
    document.getElementById('submit-btn').textContent = 'Create Event';
    
    await loadEvents();
  } catch (error) {
    showError('Failed to save event: ' + error.message);
  }
}

// Edit event
function editEvent(event) {
  editingEventId = event.id;
  document.getElementById('event-title').value = event.title;
  document.getElementById('event-description').value = event.description || '';
  document.getElementById('event-category').value = event.category;
  document.getElementById('event-date').value = event.date;
  document.getElementById('event-time').value = event.time;
  document.getElementById('event-location').value = event.location;
  document.getElementById('event-capacity').value = event.capacity;
  
  document.getElementById('form-title').textContent = 'Edit Event';
  document.getElementById('submit-btn').textContent = 'Update Event';
  
  // Scroll to form
  document.getElementById('event-form').scrollIntoView({ behavior: 'smooth' });
}

// Delete event
async function deleteEvent(eventId) {
  if (!confirm('Are you sure you want to delete this event? This will also cancel all registrations.')) {
    return;
  }
  
  try {
    await eventsAPI.delete(eventId);
    showSuccess('Event deleted successfully!');
    await loadEvents();
  } catch (error) {
    showError('Failed to delete event: ' + error.message);
  }
}

// View registrations for an event
async function viewRegistrations(eventId) {
  try {
    const response = await registrationsAPI.getEventRegistrations(eventId);
    const event = response.event;
    const registrations = response.registrations;
    
    // Update modal content
    document.getElementById('modal-event-title').textContent = event.title;
    document.getElementById('modal-registration-count').textContent = 
      `${event.registered_count} / ${event.capacity} registered`;
    
    const registrationsList = document.getElementById('registrations-list');
    if (registrations.length === 0) {
      registrationsList.innerHTML = '<p class="text-gray-500 text-center py-4">No registrations yet.</p>';
    } else {
      registrationsList.innerHTML = registrations.map(reg => `
        <div class="bg-white rounded-lg shadow p-4 mb-2">
          <div class="flex justify-between items-center">
            <div>
              <p class="font-semibold">${escapeHtml(reg.username)}</p>
              <p class="text-sm text-gray-600">${escapeHtml(reg.email)}</p>
              <p class="text-xs text-gray-500">Registered: ${formatDateTime(reg.registered_at)}</p>
            </div>
          </div>
        </div>
      `).join('');
    }
    
    // Show modal
    document.getElementById('registrations-modal').classList.remove('hidden');
  } catch (error) {
    showError('Failed to load registrations: ' + error.message);
  }
}

// Close registrations modal
export function closeRegistrationsModal() {
  document.getElementById('registrations-modal').classList.add('hidden');
}

// Setup event listeners
function setupEventListeners() {
  // Event form
  document.getElementById('event-form').addEventListener('submit', handleCreateEvent);
  
  // Logout button
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  
  // Close modal button
  document.getElementById('close-modal-btn').addEventListener('click', closeRegistrationsModal);
  
  // Close modal on background click
  document.getElementById('registrations-modal').addEventListener('click', (e) => {
    if (e.target.id === 'registrations-modal') {
      closeRegistrationsModal();
    }
  });
}

// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
      errorDiv.classList.add('hidden');
    }, 5000);
  } else {
    alert(message);
  }
}

function showSuccess(message) {
  const successDiv = document.getElementById('success-message');
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
    setTimeout(() => {
      successDiv.classList.add('hidden');
    }, 3000);
  }
}

