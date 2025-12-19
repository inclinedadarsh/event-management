import { authAPI, getCurrentUser } from './api.js';

// Check if user is authenticated
export function isAuthenticated() {
  return !!getCurrentUser();
}

// Check if user is admin
export function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

// Redirect based on user role
export function redirectByRole() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  
  if (user.role === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'dashboard.html';
  }
}

// Handle login form submission
export async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');
  const submitBtn = event.target.querySelector('button[type="submit"]');
  
  if (!username || !password) {
    errorDiv.textContent = 'Please fill in all fields';
    errorDiv.classList.remove('hidden');
    return;
  }
  
  errorDiv.classList.add('hidden');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';
  
  try {
    const data = await authAPI.login(username, password);
    redirectByRole();
  } catch (error) {
    errorDiv.textContent = error.message || 'Login failed';
    errorDiv.classList.remove('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
}

// Handle register form submission
export async function handleRegister(event) {
  event.preventDefault();
  
  const username = document.getElementById('register-username').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  const errorDiv = document.getElementById('register-error');
  const submitBtn = event.target.querySelector('button[type="submit"]');
  
  // Validation
  if (!username || !email || !password || !confirmPassword) {
    errorDiv.textContent = 'Please fill in all fields';
    errorDiv.classList.remove('hidden');
    return;
  }
  
  if (password.length < 6) {
    errorDiv.textContent = 'Password must be at least 6 characters';
    errorDiv.classList.remove('hidden');
    return;
  }
  
  if (password !== confirmPassword) {
    errorDiv.textContent = 'Passwords do not match';
    errorDiv.classList.remove('hidden');
    return;
  }
  
  errorDiv.classList.add('hidden');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Registering...';
  
  try {
    const data = await authAPI.register(username, email, password);
    redirectByRole();
  } catch (error) {
    errorDiv.textContent = error.message || 'Registration failed';
    errorDiv.classList.remove('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register';
  }
}

// Handle logout
export function handleLogout() {
  authAPI.logout();
  window.location.href = 'index.html';
}

// Toggle between login and register forms
export function toggleAuthForm() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const toggleText = document.getElementById('toggle-auth-text');
  
  if (loginForm.classList.contains('hidden')) {
    // Show login, hide register
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    toggleText.innerHTML = "Don't have an account? <a href='#' class='text-blue-600 hover:underline' id='toggle-auth'>Register</a>";
  } else {
    // Show register, hide login
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    toggleText.innerHTML = "Already have an account? <a href='#' class='text-blue-600 hover:underline' id='toggle-auth'>Login</a>";
  }
  
  // Re-attach toggle event
  document.getElementById('toggle-auth').addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthForm();
  });
}

