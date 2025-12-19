const API_BASE_URL = 'http://localhost:3000/api';

// Get token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Set token in localStorage
function setToken(token) {
  localStorage.setItem('token', token);
}

// Remove token from localStorage
function removeToken() {
  localStorage.removeItem('token');
}

// Get current user from localStorage
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Set current user in localStorage
function setCurrentUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Remove current user from localStorage
function removeCurrentUser() {
  localStorage.removeItem('user');
}

// Make API request with authentication
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Auth API
export const authAPI = {
  register: async (username, email, password) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    if (data.token) {
      setToken(data.token);
      setCurrentUser(data.user);
    }
    return data;
  },

  login: async (username, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (data.token) {
      setToken(data.token);
      setCurrentUser(data.user);
    }
    return data;
  },

  logout: () => {
    removeToken();
    removeCurrentUser();
  },

  getMe: async () => {
    return await apiRequest('/auth/me');
  }
};

// Events API
export const eventsAPI = {
  getAll: async (category = null) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return await apiRequest(`/events${query}`);
  },

  getById: async (id) => {
    return await apiRequest(`/events/${id}`);
  },

  getByCategory: async (category) => {
    return await apiRequest(`/events/category/${encodeURIComponent(category)}`);
  },

  create: async (eventData) => {
    return await apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  update: async (id, eventData) => {
    return await apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  delete: async (id) => {
    return await apiRequest(`/events/${id}`, {
      method: 'DELETE'
    });
  }
};

// Registrations API
export const registrationsAPI = {
  getMyEvents: async () => {
    return await apiRequest('/registrations/my-events');
  },

  register: async (eventId) => {
    return await apiRequest(`/registrations/${eventId}`, {
      method: 'POST'
    });
  },

  cancel: async (eventId) => {
    return await apiRequest(`/registrations/${eventId}`, {
      method: 'DELETE'
    });
  },

  getEventRegistrations: async (eventId) => {
    return await apiRequest(`/registrations/event/${eventId}`);
  }
};

// Export utility functions
export { getToken, setToken, removeToken, getCurrentUser, setCurrentUser, removeCurrentUser };

