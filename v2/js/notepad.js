// Multi-page Notepad Functionality

// Check if notepads variable already exists
if (typeof window.notepads === 'undefined') {
  window.notepads = [];
}

// Check if currentNotepadIndex variable already exists
if (typeof window.currentNotepadIndex === 'undefined') {
  window.currentNotepadIndex = 0;
}

// Initialize notepad functionality
function initializeNotepad() {
  // Load saved notepads from localStorage
  const savedNotepads = localStorage.getItem('notepads');
  if (savedNotepads) {
    window.notepads = JSON.parse(savedNotepads);
  } else {
    // Create a default notepad if none exists
    window.notepads = [{ title: 'Notepad 1', content: '' }];
  }

  // Load saved current index
  const savedIndex = localStorage.getItem('currentNotepadIndex');
  if (savedIndex !== null) {
    window.currentNotepadIndex = parseInt(savedIndex);
  }

  // Initialize the UI
  updateNotepadUI();
  renderNotepadTabs();
}

// Update the notepad UI based on the current notepad
function updateNotepadUI() {
  const notepadTextarea = document.getElementById('notepad-textarea');
  if (notepadTextarea && window.notepads[window.currentNotepadIndex]) {
    notepadTextarea.value = window.notepads[window.currentNotepadIndex].content;
  }
}

// Save the current notepad content
function saveNotepadContent() {
  const notepadTextarea = document.getElementById('notepad-textarea');
  if (notepadTextarea && window.notepads && window.notepads[window.currentNotepadIndex]) {
    window.notepads[window.currentNotepadIndex].content = notepadTextarea.value;
    localStorage.setItem('notepads', JSON.stringify(window.notepads));
  }
}

// Render the notepad tabs
function renderNotepadTabs() {
  const tabsContainer = document.getElementById('notepad-tabs');
  if (!tabsContainer || !window.notepads) return;

  // Clear existing tabs
  tabsContainer.innerHTML = '';

  // Create tabs for each notepad
  window.notepads.forEach((notepad, index) => {
    const tabElement = document.createElement('li');
    tabElement.className = 'nav-item';
    
    const tabLink = document.createElement('a');
    tabLink.className = `nav-link ${index === window.currentNotepadIndex ? 'active' : ''}`;
    tabLink.href = '#';
    tabLink.textContent = notepad.title;
    
    tabLink.addEventListener('click', (e) => {
      e.preventDefault();
      saveNotepadContent(); // Save current content before switching
      window.currentNotepadIndex = index;
      localStorage.setItem('currentNotepadIndex', index);
      updateNotepadUI();
      renderNotepadTabs(); // Re-render tabs to update active state
    });
    
    tabElement.appendChild(tabLink);
    tabsContainer.appendChild(tabElement);
  });

  // Add "New Tab" button
  const newTabElement = document.createElement('li');
  newTabElement.className = 'nav-item';
  
  const newTabLink = document.createElement('a');
  newTabLink.className = 'nav-link';
  newTabLink.href = '#';
  newTabLink.innerHTML = '<i class="fas fa-plus"></i>';
  newTabLink.title = 'Add new notepad';
  
  newTabLink.addEventListener('click', (e) => {
    e.preventDefault();
    addNewNotepad();
  });
  
  newTabElement.appendChild(newTabLink);
  tabsContainer.appendChild(newTabElement);
}

// Add a new notepad
function addNewNotepad() {
  saveNotepadContent(); // Save current content before adding new
  if (!window.notepads) {
    window.notepads = [];
  }
  const newIndex = window.notepads.length;
  window.notepads.push({ title: `Notepad ${newIndex + 1}`, content: '' });
  window.currentNotepadIndex = newIndex;
  localStorage.setItem('notepads', JSON.stringify(window.notepads));
  localStorage.setItem('currentNotepadIndex', newIndex);
  updateNotepadUI();
  renderNotepadTabs();
}

// Delete the current notepad
function deleteCurrentNotepad() {
  if (!window.notepads || !Array.isArray(window.notepads)) {
    window.notepads = [{ title: 'Notepad 1', content: '' }];
    window.currentNotepadIndex = 0;
    localStorage.setItem('notepads', JSON.stringify(window.notepads));
    localStorage.setItem('currentNotepadIndex', 0);
    updateNotepadUI();
    renderNotepadTabs();
    return;
  }

  if (window.notepads.length <= 1) {
    // Don't delete the last notepad, just clear it
    window.notepads[0] = { title: 'Notepad 1', content: '' };
    window.currentNotepadIndex = 0;
  } else {
    window.notepads.splice(window.currentNotepadIndex, 1);
    if (window.currentNotepadIndex >= window.notepads.length) {
      window.currentNotepadIndex = window.notepads.length - 1;
    }
  }

  localStorage.setItem('notepads', JSON.stringify(window.notepads));
  localStorage.setItem('currentNotepadIndex', window.currentNotepadIndex);
  updateNotepadUI();
  renderNotepadTabs();
}

// Rename the current notepad
function renameCurrentNotepad() {
  if (!window.notepads || !window.notepads[window.currentNotepadIndex]) {
    return;
  }
  const newTitle = prompt('Enter new name for this notepad:', window.notepads[window.currentNotepadIndex].title);
  if (newTitle !== null && newTitle.trim() !== '') {
    window.notepads[window.currentNotepadIndex].title = newTitle.trim();
    localStorage.setItem('notepads', JSON.stringify(window.notepads));
    renderNotepadTabs();
  }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the notepad functionality
  initializeNotepad();
  
  // Add event listener for textarea changes to auto-save
  const notepadTextarea = document.getElementById('notepad-textarea');
  if (notepadTextarea) {
    notepadTextarea.addEventListener('input', saveNotepadContent);
  }
  
  // Add event listeners for notepad buttons
  const clearBtn = document.querySelector('#clear-notepad-btn, .clear-notepad-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear this notepad?')) {
        notepadTextarea.value = '';
        saveNotepadContent();
      }
    });
  }
  
  const deleteBtn = document.querySelector('#delete-notepad-btn, .delete-notepad-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to delete this notepad?')) {
        deleteCurrentNotepad();
      }
    });
  }
  
  const renameBtn = document.querySelector('#rename-notepad-btn, .rename-notepad-btn');
  if (renameBtn) {
    renameBtn.addEventListener('click', renameCurrentNotepad);
  }
});