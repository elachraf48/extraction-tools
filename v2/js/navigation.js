// Navigation and section display functionality

/**
 * Shows a specific section and hides all others
 * @param {string} sectionId - The ID of the section to show
 */
function showSection(sectionId) {
  // Make sure we have a valid section ID
  if (!sectionId) return;
  
  console.log(`Showing section: ${sectionId}`);
  
  // Define all possible sections (both section tags and div containers)
  const allSections = [
    'ip-extraction', 'split', 'texttool', 'checkdomain', 'fixage', 'home', 'privacy'
  ];
  
  // Hide all sections first
  allSections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = 'none';
      section.classList.remove('fade-in');
      section.classList.remove('active');
    }
  });

  // Show the selected section with fade-in animation
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    // First make it visible
    selectedSection.style.display = 'block';
    selectedSection.classList.add('active');
    
    // Trigger reflow to ensure the animation works
    void selectedSection.offsetWidth;
    
    // Then add the animation class
    selectedSection.classList.add('fade-in');
    
    console.log(`Section ${sectionId} displayed`);
  } else {
    console.warn(`Section with ID ${sectionId} not found`);
  }

  // Update active state in navigation
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
  });

  // Try to find the nav link by ID pattern first
  let activeLink = document.getElementById(`${sectionId}-nav-link`);
  
  // If not found, try to find by onclick attribute
  if (!activeLink) {
    activeLink = Array.from(navLinks).find(link => {
      const onclickAttr = link.getAttribute('onclick');
      return onclickAttr && onclickAttr.includes(`showSection('${sectionId}')`);
    });
  }
  
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  // Close mobile menu if open
  toggleCollapse();
  
  // Update page title based on section
  updatePageTitle(sectionId);

  // Save the current section to localStorage
  localStorage.setItem('currentSection', sectionId);
}

/**
 * Closes mobile menu if open
 */
function toggleCollapse() {
  const navbarNav = document.getElementById('navbarNav');
  const navbarToggler = document.querySelector('.navbar-toggler');

  if (navbarNav && navbarNav.classList.contains('show')) {
    if (typeof bootstrap !== 'undefined') {
      const bsCollapse = bootstrap.Collapse.getInstance(navbarNav);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    } else {
      navbarToggler.click(); // Close the menu
    }
  }
}

/**
 * Updates the page title based on the current section
 * @param {string} sectionId - The ID of the current section
 */
function updatePageTitle(sectionId) {
  const baseName = 'Text Tools';
  let pageTitle = baseName;
  
  // Map section IDs to their display names
  const sectionTitles = {
    'ip-extraction': 'Extraction Tool',
    'split': 'Split Tool',
    'texttool': 'Text Tool',
    'fixage': 'Text Replacement',
    'checkdomain': 'Domain Checker',
    'home': 'About',
    'privacy': 'Privacy Policy'
  };
  
  if (sectionTitles[sectionId]) {
    pageTitle = `${sectionTitles[sectionId]} | ${baseName}`;
  }
  
  document.title = pageTitle;
}

// Function to initialize the page with the last visited section or default
function initializeNavigation() {
  const savedSection = localStorage.getItem('currentSection');
  if (savedSection) {
    showSection(savedSection);
  } else {
    // Default to the ip-extraction section if no saved section
    showSection('ip-extraction');
  }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();

  // Add event listeners to all navigation links
  const navLinks = document.querySelectorAll('.nav-link[id$="-nav-link"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const sectionId = this.id.replace('-nav-link', '');
      showSection(sectionId);
    });
  });
});