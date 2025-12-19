import { eventsAPI, registrationsAPI, getCurrentUser } from './api.js';
import { handleLogout } from './auth.js';

let allEvents = [];
let myEvents = [];

// Initialize dashboard
export async function initDashboard() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  
  // Set user info
  document.getElementById('user-name').textContent = user.username;
  
  // Load events
  await loadEvents();
  await loadMyEvents();
  
  // Set up event listeners
  setupEventListeners();
}

// Load all events
async function loadEvents() {
  try {
    const category = document.getElementById('category-filter').value;
    const response = await eventsAPI.getAll(category || null);
    allEvents = response.events || [];
    renderEvents();
  } catch (error) {
    showError('Failed to load events: ' + error.message);
  }
}

// Load user's registered events
async function loadMyEvents() {
  try {
    const response = await registrationsAPI.getMyEvents();
    myEvents = response.events || [];
    renderMyEvents();
  } catch (error) {
    console.error('Failed to load my events:', error);
  }
}

// Render events list
function renderEvents() {
  const container = document.getElementById('events-container');
  
  if (allEvents.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">No events found.</p>';
    return;
  }
  
  container.innerHTML = allEvents.map(event => createEventCard(event)).join('');
  
  // Attach event listeners to buttons
  allEvents.forEach(event => {
    const isRegistered = myEvents.some(e => e.id === event.id);
    const btn = document.getElementById(`register-btn-${event.id}`);
    if (btn) {
      btn.addEventListener('click', () => handleRegister(event.id));
    }
  });
}

// Create event card HTML
function createEventCard(event) {
  const isRegistered = myEvents.some(e => e.id === event.id);
  const isFull = event.remaining_spots <= 0;
  const canRegister = !isRegistered && !isFull && new Date(`${event.date}T${event.time}`) > new Date();
  
  return `
    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-xl font-bold text-gray-800">${escapeHtml(event.title)}</h3>
        <span class="px-3 py-1 rounded-full text-sm font-semibold ${
          event.category === 'conference' ? 'bg-blue-100 text-blue-800' :
          event.category === 'seminar' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }">${escapeHtml(event.category)}</span>
      </div>
      
      <p class="text-gray-600 mb-4">${escapeHtml(event.description || 'No description')}</p>
      
      <div class="space-y-2 mb-4">
        <div class="flex items-center text-gray-700">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span>${formatDate(event.date)}</span>
        </div>
        <div class="flex items-center text-gray-700">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>${escapeHtml(event.time)}</span>
        </div>
        <div class="flex items-center text-gray-700">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span>${escapeHtml(event.location)}</span>
        </div>
        <div class="flex items-center text-gray-700">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <span>${event.registered_count || 0} / ${event.capacity} registered (${event.remaining_spots || 0} spots left)</span>
        </div>
      </div>
      
      <button
        id="register-btn-${event.id}"
        class="w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
          isRegistered
            ? 'bg-green-500 text-white hover:bg-green-600'
            : canRegister
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }"
        ${!canRegister && !isRegistered ? 'disabled' : ''}
      >
        ${isRegistered ? 'Registered' : isFull ? 'Full' : 'Register'}
      </button>
    </div>
  `;
}

// Render my events
function renderMyEvents() {
  const container = document.getElementById('my-events-container');
  
  if (myEvents.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">You haven\'t registered for any events yet.</p>';
    return;
  }
  
  container.innerHTML = myEvents.map(event => createMyEventCard(event)).join('');
  
  // Attach cancel event listeners
  myEvents.forEach(event => {
    const btn = document.getElementById(`cancel-btn-${event.id}`);
    if (btn) {
      btn.addEventListener('click', () => handleCancel(event.id));
    }
  });
}

// Create my event card HTML
function createMyEventCard(event) {
  const eventDate = new Date(`${event.date}T${event.time}`);
  const canCancel = eventDate > new Date();
  
  return `
    <div class="bg-white rounded-lg shadow-md p-4">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h4 class="font-semibold text-gray-800">${escapeHtml(event.title)}</h4>
          <p class="text-sm text-gray-600 mt-1">${formatDate(event.date)} at ${escapeHtml(event.time)}</p>
          <p class="text-sm text-gray-600">${escapeHtml(event.location)}</p>
        </div>
        <button
          id="cancel-btn-${event.id}"
          class="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm ${!canCancel ? 'opacity-50 cursor-not-allowed' : ''}"
          ${!canCancel ? 'disabled' : ''}
        >
          ${canCancel ? 'Cancel' : 'Past Event'}
        </button>
      </div>
    </div>
  `;
}

// Handle event registration
async function handleRegister(eventId) {
  try {
    await registrationsAPI.register(eventId);
    showSuccess('Successfully registered for event!');
    await loadEvents();
    await loadMyEvents();
  } catch (error) {
    showError('Failed to register: ' + error.message);
  }
}

// Handle cancel registration
async function handleCancel(eventId) {
  if (!confirm('Are you sure you want to cancel your registration?')) {
    return;
  }
  
  try {
    await registrationsAPI.cancel(eventId);
    showSuccess('Registration cancelled successfully');
    await loadEvents();
    await loadMyEvents();
  } catch (error) {
    showError('Failed to cancel: ' + error.message);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Category filter
  document.getElementById('category-filter').addEventListener('change', loadEvents);
  
  // Logout button
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
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

