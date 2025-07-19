// Fixage Tool Functionality
document.addEventListener('DOMContentLoaded', function() {
  const generateBtn = document.getElementById('generate-fixage');
  const addInputBtn = document.getElementById('add-text-input');
  const dynamicInputsContainer = document.getElementById('dynamic-inputs-container');
  const mainTextarea = document.getElementById('main-textarea');
  const fixageOutput = document.getElementById('fixage-output');
  
  // Add first input by default
  addTextInput();
  
  addInputBtn.addEventListener('click', addTextInput);
  
  generateBtn.addEventListener('click', generateFixage);
  
  function addTextInput() {
    const inputId = Date.now();
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group mb-3';
    inputGroup.innerHTML = `
      <input type="text" class="form-control dynamic-input" placeholder="Enter replacement text" id="input-${inputId}">
      <button class="btn btn-danger remove-input" type="button">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    dynamicInputsContainer.appendChild(inputGroup);
    
    // Add remove event
    inputGroup.querySelector('.remove-input').addEventListener('click', () => {
      dynamicInputsContainer.removeChild(inputGroup);
    });
  }
  
  function generateFixage() {
    const mainText = mainTextarea.value;
    if (!mainText.trim()) {
      showToast('Please enter main text', 'warning');
      return;
    }
    
    const dynamicInputs = Array.from(document.querySelectorAll('.dynamic-input'))
      .map(input => input.value.trim())
      .filter(text => text.length > 0);
    
    if (dynamicInputs.length === 0) {
      showToast('Please add at least one replacement text', 'warning');
      return;
    }
    
    let result = mainText;
    
    // Apply each replacement
    dynamicInputs.forEach((text, index) => {
      const placeholder = `{${index + 1}}`;
      result = result.replace(new RegExp(placeholder, 'g'), text);
    });
    
    fixageOutput.value = result;
    showToast('Text generated successfully', 'success');
  }
});