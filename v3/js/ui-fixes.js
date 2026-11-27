/**
 * UI Fixes for dark mode, mobile menu, and section display
 */

// Initialize UI enhancements when the document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Fix dark mode toggle
  initializeDarkMode();
  
  // Fix mobile menu toggle
  initializeMobileMenu();
  
  // Fix section display
  fixSectionDisplay();
  
  // Initialize dropdowns
  initializeDropdowns();
});

/**
 * Initialize dark mode functionality
 */
function initializeDarkMode() {
  console.log('Initializing dark mode');
  
  // Try to find the dark mode button (it might have different IDs)
  let darkModeBtn = document.getElementById('dark-mode-btn');
  if (!darkModeBtn) {
    darkModeBtn = document.getElementById('darkModeBtn');
  }
  
  if (!darkModeBtn) {
    console.warn('Dark mode button not found');
    return;
  }
  
  console.log('Dark mode button found:', darkModeBtn);
  
  // Find the icon inside the button
  const darkModeIcon = darkModeBtn.querySelector('i');
  if (!darkModeIcon) {
    console.warn('Dark mode icon not found inside button');
  }
  
  // Check if dark mode was previously enabled
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  console.log('Dark mode from localStorage:', isDarkMode);
  
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    if (darkModeIcon) {
      updateDarkModeIcon(darkModeIcon, true);
    }
  }
  
  // Add event listener for dark mode toggle
  darkModeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Dark mode button clicked');
    const isDarkModeEnabled = document.body.classList.toggle('dark-mode');
    
    if (darkModeIcon) {
      updateDarkModeIcon(darkModeIcon, isDarkModeEnabled);
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', isDarkModeEnabled);
    
    // Fix text color in dark mode for privacy section
    fixPrivacySectionColors(isDarkModeEnabled);
    
    console.log('Dark mode toggled to:', isDarkModeEnabled);
  });
  
  // Initial fix for privacy section colors
  fixPrivacySectionColors(isDarkMode);
}

/**
 * Update dark mode icon based on current state
 * @param {Element} icon - The icon element
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 */
function updateDarkModeIcon(icon, isDarkMode) {
  if (isDarkMode) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
}

/**
 * Fix text colors in privacy section for dark mode
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 */
function fixPrivacySectionColors(isDarkMode) {
  // Fix text colors for privacy section
  const privacySection = document.getElementById('privacy');
  if (privacySection) {
    const headings = privacySection.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const paragraphs = privacySection.querySelectorAll('p, li');
    
    if (isDarkMode) {
      // Ensure text is visible in dark mode
      headings.forEach(heading => heading.style.color = '#e2e8f0');
      paragraphs.forEach(p => p.style.color = '#cbd5e1');
    } else {
      // Reset to default in light mode
      headings.forEach(heading => heading.style.color = '');
      paragraphs.forEach(p => p.style.color = '');
    }
  }
  
  // Fix text colors for about section
  const aboutSection = document.getElementById('home');
  if (aboutSection) {
    const headings = aboutSection.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const paragraphs = aboutSection.querySelectorAll('p, li');
    
    if (isDarkMode) {
      // Ensure text is visible in dark mode
      headings.forEach(heading => heading.style.color = '#e2e8f0');
      paragraphs.forEach(p => p.style.color = '#cbd5e1');
    } else {
      // Reset to default in light mode
      headings.forEach(heading => heading.style.color = '');
      paragraphs.forEach(p => p.style.color = '');
    }
  }
}

/**
 * Initialize mobile menu functionality
 */
function initializeMobileMenu() {
  console.log('Initializing mobile menu');
  
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.getElementById('navbarNav');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  // Fix for navbar toggler not working
  if (navbarToggler && navbarCollapse) {
    try {
      // Check if Bootstrap is available
      if (typeof bootstrap !== 'undefined') {
        // Try to get existing instance first
        let bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        
        // If no instance exists, create a new one
        if (!bsCollapse) {
          bsCollapse = new bootstrap.Collapse(navbarCollapse, {
            toggle: false
          });
          console.log('Created new Bootstrap Collapse instance');
        } else {
          console.log('Using existing Bootstrap Collapse instance');
        }
        
        // Add click event to toggle menu
        navbarToggler.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Navbar toggler clicked');
          
          const isExpanded = this.getAttribute('aria-expanded') === 'true';
          console.log('Current state - expanded:', isExpanded);
          
          if (isExpanded) {
            // Close the menu
            bsCollapse.hide();
            this.setAttribute('aria-expanded', 'false');
            console.log('Closing mobile menu');
          } else {
            // Open the menu
            bsCollapse.show();
            this.setAttribute('aria-expanded', 'true');
            console.log('Opening mobile menu');
          }
        });
        
        // Listen for collapse events to update button state
        navbarCollapse.addEventListener('show.bs.collapse', function() {
          console.log('Mobile menu showing');
          navbarToggler.setAttribute('aria-expanded', 'true');
        });
        
        navbarCollapse.addEventListener('hide.bs.collapse', function() {
          console.log('Mobile menu hiding');
          navbarToggler.setAttribute('aria-expanded', 'false');
        });
        
        navbarCollapse.addEventListener('shown.bs.collapse', function() {
          console.log('Mobile menu shown');
        });
        
        navbarCollapse.addEventListener('hidden.bs.collapse', function() {
          console.log('Mobile menu hidden');
        });
      } else {
        console.warn('Bootstrap is not available, using fallback for mobile menu');
        
        // Fallback if Bootstrap is not available
        navbarToggler.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const isExpanded = this.getAttribute('aria-expanded') === 'true';
          console.log('Fallback mobile menu toggle - current state:', isExpanded);
          
          if (isExpanded) {
            navbarCollapse.classList.remove('show');
            this.setAttribute('aria-expanded', 'false');
            console.log('Fallback: Closing mobile menu');
          } else {
            navbarCollapse.classList.add('show');
            this.setAttribute('aria-expanded', 'true');
            console.log('Fallback: Opening mobile menu');
          }
        });
      }
    } catch (error) {
      console.error('Error initializing mobile menu:', error);
      
      // Fallback if there's an error
      navbarToggler.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        console.log('Error fallback mobile menu toggle - current state:', isExpanded);
        
        if (isExpanded) {
          navbarCollapse.classList.remove('show');
          this.setAttribute('aria-expanded', 'false');
          console.log('Error fallback: Closing mobile menu');
        } else {
          navbarCollapse.classList.add('show');
          this.setAttribute('aria-expanded', 'true');
          console.log('Error fallback: Opening mobile menu');
        }
      });
    }
    
    // Close menu when a link is clicked on mobile
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        console.log('Nav link clicked, checking if mobile menu should close');
        
        if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
          console.log('Closing mobile menu after nav link click');
          
          if (typeof bootstrap !== 'undefined') {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
            if (bsCollapse) {
              bsCollapse.hide();
              navbarToggler.setAttribute('aria-expanded', 'false');
            }
          } else {
            navbarCollapse.classList.remove('show');
            navbarToggler.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });
    
    // Close menu when clicking outside on mobile
    document.addEventListener('click', function(e) {
      if (window.innerWidth < 992 && 
          !navbarToggler.contains(e.target) && 
          !navbarCollapse.contains(e.target) && 
          navbarCollapse.classList.contains('show')) {
        console.log('Closing mobile menu - clicked outside');
        
        if (typeof bootstrap !== 'undefined') {
          const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) {
            bsCollapse.hide();
            navbarToggler.setAttribute('aria-expanded', 'false');
          }
        } else {
          navbarCollapse.classList.remove('show');
          navbarToggler.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }
}

/**
 * Fix section display issues - this function is now handled by navigation.js
 * We'll just ensure proper initialization
 */
function fixSectionDisplay() {
  console.log('Ensuring proper section display initialization');
  
  // Get all sections and ensure they're properly hidden initially
  const sections = document.querySelectorAll('section, #ip-extraction, #texttool, #split, #checkdomain, #home, #privacy');
  
  // Hide all sections initially and remove active class
  sections.forEach(section => {
    if (section && section.style) {
      section.style.display = 'none';
      section.classList.remove('active');
      section.classList.remove('fade-in');
    }
  });
  
  // Let navigation.js handle the rest
  // The showSection function in navigation.js will take care of displaying the correct section
}

/**
 * Initialize Bootstrap dropdowns
 */
function initializeDropdowns() {
  console.log('Initializing dropdowns');
  
  // Check if Bootstrap is available
  if (typeof bootstrap !== 'undefined') {
    // Initialize all dropdowns
    const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
    const dropdownList = [...dropdownElementList].map(dropdownToggleEl => {
      try {
        return new bootstrap.Dropdown(dropdownToggleEl, {
          autoClose: true,
          boundary: 'viewport'
        });
      } catch (error) {
        console.warn('Error initializing dropdown:', error);
        return null;
      }
    }).filter(Boolean);
    
    console.log(`Initialized ${dropdownList.length} dropdowns`);
    
    // Add event listeners for dropdown items to ensure they work properly
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      item.addEventListener('click', function(e) {
        console.log('Dropdown item clicked:', this.textContent);
        // Prevent default only if the item has an onclick handler
        if (this.getAttribute('onclick')) {
          e.preventDefault();
          // Execute the onclick handler
          const onclickHandler = this.getAttribute('onclick');
          try {
            eval(onclickHandler);
          } catch (error) {
            console.error('Error executing dropdown item onclick:', error);
          }
        }
        
        // Close the dropdown after item selection
        const dropdown = this.closest('.dropdown');
        if (dropdown) {
          const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
          if (dropdownToggle && typeof bootstrap !== 'undefined') {
            const bsDropdown = bootstrap.Dropdown.getInstance(dropdownToggle);
            if (bsDropdown) {
              bsDropdown.hide();
            }
          }
        }
      });
    });
    
    // Add event listeners to dropdown toggles to ensure proper state management
    dropdownElementList.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        console.log('Dropdown toggle clicked');
        // Let Bootstrap handle the toggle
      });
      
      // Listen for dropdown show/hide events
      toggle.addEventListener('show.bs.dropdown', function() {
        console.log('Dropdown showing');
        this.setAttribute('aria-expanded', 'true');
      });
      
      toggle.addEventListener('hide.bs.dropdown', function() {
        console.log('Dropdown hiding');
        this.setAttribute('aria-expanded', 'false');
      });
    });
    
  } else {
    console.warn('Bootstrap is not available, using fallback for dropdowns');
    
    // Fallback for dropdowns without Bootstrap
    const dropdownToggles = document.querySelectorAll('[data-bs-toggle="dropdown"]');
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropdownMenu = this.nextElementSibling;
        if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
          const isOpen = dropdownMenu.classList.contains('show');
          
          // Close all other dropdowns first
          document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            if (menu !== dropdownMenu) {
              menu.classList.remove('show');
              const otherToggle = menu.previousElementSibling;
              if (otherToggle) {
                otherToggle.setAttribute('aria-expanded', 'false');
              }
            }
          });
          
          // Toggle current dropdown
          if (isOpen) {
            dropdownMenu.classList.remove('show');
            this.setAttribute('aria-expanded', 'false');
          } else {
            dropdownMenu.classList.add('show');
            this.setAttribute('aria-expanded', 'true');
          }
        }
      });
      
      // Close dropdowns when clicking outside
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
          const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
          openDropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
            const toggle = dropdown.previousElementSibling;
            if (toggle) {
              toggle.setAttribute('aria-expanded', 'false');
            }
          });
        }
      });
      
      // Handle dropdown item clicks in fallback mode
      const dropdownItems = document.querySelectorAll('.dropdown-item');
      dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
          console.log('Dropdown item clicked (fallback):', this.textContent);
          
          if (this.getAttribute('onclick')) {
            e.preventDefault();
            const onclickHandler = this.getAttribute('onclick');
            try {
              eval(onclickHandler);
            } catch (error) {
              console.error('Error executing dropdown item onclick:', error);
            }
          }
          
          // Close the dropdown
          const dropdown = this.closest('.dropdown');
          if (dropdown) {
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');
            if (dropdownMenu) {
              dropdownMenu.classList.remove('show');
              const toggle = dropdown.querySelector('.dropdown-toggle');
              if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
              }
            }
          }
        });
      });
    });
  }
}