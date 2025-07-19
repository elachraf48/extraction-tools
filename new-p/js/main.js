// DOM Elements
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelectorAll('.nav-link');
const mobileLinks = document.querySelectorAll('.mobile-link');
const themeToggle = document.getElementById('theme-toggle');
const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
const contactBtn = document.getElementById('contact-btn');
const mobileContactBtn = document.getElementById('mobile-contact-btn');
const contactModal = document.getElementById('contact-modal');
const closeModal = document.querySelector('.close-modal');
const toolSections = document.querySelectorAll('.tool-section');
const currentYear = document.getElementById('current-year');

// Current year
currentYear.textContent = new Date().getFullYear();

// Mobile menu toggle
mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
  });
});

// Theme toggle
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update icon
  const icon = themeToggle.querySelector('i');
  icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  
  // Update mobile icon
  const mobileIcon = mobileThemeToggle.querySelector('i');
  mobileIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

themeToggle.addEventListener('click', toggleTheme);
mobileThemeToggle.addEventListener('click', toggleTheme);

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
  const icon = themeToggle.querySelector('i');
  icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Contact modal
contactBtn.addEventListener('click', () => {
  contactModal.style.display = 'flex';
});

mobileContactBtn.addEventListener('click', () => {
  contactModal.style.display = 'flex';
  mobileMenu.classList.remove('active');
});

closeModal.addEventListener('click', () => {
  contactModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === contactModal) {
    contactModal.style.display = 'none';
  }
});

// Tool section navigation
function showSection(sectionId) {
  // Hide all sections
  toolSections.forEach(section => {
    section.classList.remove('active');
  });
  
  // Show selected section
  document.getElementById(sectionId).classList.add('active');
  
  // Update active nav link
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${sectionId}`) {
      link.classList.add('active');
    }
  });
  
  // Update active mobile link
  mobileLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${sectionId}`) {
      link.classList.add('active');
    }
  });
}

// Handle nav link clicks
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const sectionId = link.getAttribute('href').substring(1);
    showSection(sectionId);
  });
});

mobileLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const sectionId = link.getAttribute('href').substring(1);
    showSection(sectionId);
  });
});

// Show extractor by default
showSection('extractor');