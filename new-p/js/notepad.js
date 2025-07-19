// Notepad Functionality
document.addEventListener('DOMContentLoaded', function() {
  const notepadTextarea = document.getElementById('notepad-textarea');
  const clearNotepadBtn = document.getElementById('clear-notepad');
  const copyNotepadBtn = document.getElementById('copy-notepad');
  const saveNotepadBtn = document.getElementById('save-notepad');
  const encodeNotepadBtn = document.getElementById('encode-notepad');
  const decodeNotepadBtn = document.getElementById('decode-notepad');
  const notepadKeyInput = document.getElementById('notepad-key');
  
  // Load saved notes from localStorage
  const savedNotes = localStorage.getItem('notepadContent');
  if (savedNotes) {
    notepadTextarea.value = savedNotes;
  }
  
  clearNotepadBtn.addEventListener('click', () => {
    notepadTextarea.value = '';
    showToast('Notepad cleared', 'success');
  });
  
  copyNotepadBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(notepadTextarea.value);
      showToast('Copied to clipboard', 'success');
    } catch (error) {
      showToast('Failed to copy', 'error');
    }
  });
  
  saveNotepadBtn.addEventListener('click', () => {
    localStorage.setItem('notepadContent', notepadTextarea.value);
    showToast('Notes saved', 'success');
  });
  
  encodeNotepadBtn.addEventListener('click', () => {
    const key = parseInt(notepadKeyInput.value);
    if (isNaN(key) || key < 1 || key > 26) {
      showToast('Please enter a valid key (1-26)', 'warning');
      return;
    }
    
    notepadTextarea.value = caesarCipher(notepadTextarea.value, key);
    showToast('Text encoded', 'success');
  });
  
  decodeNotepadBtn.addEventListener('click', () => {
    const key = parseInt(notepadKeyInput.value);
    if (isNaN(key) || key < 1 || key > 26) {
      showToast('Please enter a valid key (1-26)', 'warning');
      return;
    }
    
    notepadTextarea.value = caesarCipher(notepadTextarea.value, -key);
    showToast('Text decoded', 'success');
  });
  
  function caesarCipher(text, shift) {
    return text.replace(/[a-z]/gi, (char) => {
      const code = char.charCodeAt(0);
      let shiftAmount = shift;
      
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shiftAmount + 26) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shiftAmount + 26) % 26) + 97);
      }
      
      return char;
    });
  }
});