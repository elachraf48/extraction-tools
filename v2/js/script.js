// Initialize variables if they don't already exist
if (typeof textCount === 'undefined') {
  let textCount = 0;
}
//start fixage
if (typeof textCountfixage === 'undefined') {
  var textCountfixage = 0;
}
if (typeof window.usedNames === 'undefined') {
  window.usedNames = new Set();
}
if (typeof window.activeTextAreas === 'undefined') {
  window.activeTextAreas = new Set();
}

    // Function to find the next available text name
    function getNextTextName() {
      if (typeof window.usedNames === 'undefined') {
        window.usedNames = new Set();
      }
      let i = 1;
      while (window.usedNames.has(`text${i}`)) {
        i++;
      }
      return `text${i}`;
    }

    // Function to highlight placeholders in main text
    function highlightPlaceholders() {
      const mainText = $('#main-textarea').val();
      const placeholderRegex = /\[(.*?)\]/g;
      let match;
      let placeholders = new Set();
      
      // Find all placeholders in the text
      while ((match = placeholderRegex.exec(mainText)) !== null) {
        placeholders.add(match[1]);
      }
      
      // Update the UI to show which placeholders are defined
      $('.text-name').each(function() {
        const textName = $(this).val();
        const textGroup = $(this).closest('.text-group');
        
        if (placeholders.has(textName)) {
          textGroup.find('.placeholder-badge').removeClass('bg-secondary').addClass('bg-success').addClass('fixage').html('<i class="fas fa-check me-1 fixage"></i>Found in text');
        } else {
          textGroup.find('.placeholder-badge').removeClass('bg-success').addClass('bg-secondary').addClass('fixage').html('<i class="fas fa-question me-1 fixage"></i>Not in text');
        }
      });
    }

    // Function to add a new text input and textarea with animation
    $('#add-text-btn').click(async function () {
      const defaultName = getNextTextName();
      window.usedNames.add(defaultName);
      window.activeTextAreas.add(defaultName);
      textCountfixage = Math.max(textCountfixage, parseInt(defaultName.replace('text', '')) || 1);
      
      const inputGroup = `
        <div class="text-group fixage" id="text-group-${defaultName}" style="opacity: 0; transform: translateY(20px);">
          <div class="d-flex justify-content-between align-items-center mb-2 fixage">
            <span class="badge placeholder-badge bg-secondary fixage"><i class="fas fa-question me-1 fixage"></i>Not in text</span>
            <button class="btn btn-danger btn-sm remove-btn fixage" data-name="${defaultName}">
              <i class="fas fa-times fixage"></i>
            </button>
          </div>
          <div class="mb-3 fixage">
            <label for="text-name-${defaultName}" class="form-label fixage"><i class="fas fa-tag me-1 fixage"></i>Placeholder Name:</label>
            <div class="input-group fixage">
              <span class="input-group-text fixage">[</span>
              <input type="text" class="form-control text-name fixage" id="text-name-${defaultName}" value="${defaultName}" placeholder="Enter name without brackets">
              <span class="input-group-text fixage">]</span>
            </div>
            <small class="form-text text-muted fixage">This will replace [${defaultName}] in your text</small>
          </div>
          <div class="mb-3 fixage">
            <label for="text-value-${defaultName}" class="form-label fixage"><i class="fas fa-edit me-1 fixage"></i>Replacement Text:</label>
            <textarea class="form-control text-value fixage" id="text-value-${defaultName}" rows="3" placeholder="Enter replacement text"></textarea>
          </div>
          <div class="clean-checkbox form-check form-switch fixage">
            <input class="form-check-input clean-text-checkbox fixage" type="checkbox" id="clean-text-${defaultName}">
            <label class="form-check-label fixage" for="clean-text-${defaultName}"><i class="fas fa-clipboard me-1 fixage"></i>Auto-paste from clipboard</label>
          </div>
        </div>`;
      
      // Append and animate the new group
      $('#dynamic-inputs').append(inputGroup);
      setTimeout(() => {
        $(`#text-group-${defaultName}`).css({
          'opacity': '1',
          'transform': 'translateY(0)'
        });
      }, 10);

      // Focus on the new text name input
      $(`#text-name-${defaultName}`).focus();

      // Handle name changes to track duplicates
      $(`#text-name-${defaultName}`).on('input', function() {
        const newName = $(this).val();
        const oldName = $(this).data('old-name') || defaultName;
        
        if (newName !== oldName) {
          if (window.usedNames.has(newName) && newName !== '') {
            $(this).addClass('is-invalid');
            $(this).siblings('.invalid-feedback').remove();
            $(this).after('<div class="invalid-feedback">This name is already in use</div>');
          } else {
            $(this).removeClass('is-invalid');
            $(this).siblings('.invalid-feedback').remove();
            window.usedNames.delete(oldName);
            window.activeTextAreas.delete(oldName);
            window.usedNames.add(newName);
            window.activeTextAreas.add(newName);
            $(this).data('old-name', newName);
            
            // Update all references to the old name
            $(`button[data-name="${oldName}"]`).attr('data-name', newName);
            $(`#text-group-${oldName}`).attr('id', `text-group-${newName}`);
            $(`#text-value-${oldName}`).attr('id', `text-value-${newName}`);
            $(`#clean-text-${oldName}`).attr('id', `clean-text-${newName}`);
            $(`label[for="text-name-${oldName}"]`).attr('for', `text-name-${newName}`);
            $(`label[for="text-value-${oldName}"]`).attr('for', `text-value-${newName}`);
            $(`label[for="clean-text-${oldName}"]`).attr('for', `clean-text-${newName}`);
            
            // Update the small text helper
            $(this).parent().siblings('small').text(`This will replace [${newName}] in your text`);
          }
          
          // Update placeholder highlighting
          highlightPlaceholders();
        }
      });

      // Handle checkbox change for this specific textarea
      const handleCheckboxChange = async function() {
        const textareaName = $(this).attr('id').split('-')[2];
        if ($(this).is(':checked')) {
          try {
            const text = await navigator.clipboard.readText();
            $(`#text-value-${textareaName}`).val(text).trigger('input');
          } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
            // Show a more user-friendly toast notification instead of an alert
            const toastHtml = `
              <div class="toast align-items-center text-white bg-danger border-0 position-fixed bottom-0 end-0 m-3 fixage" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex fixage">
                  <div class="toast-body fixage">
                    <i class="fas fa-exclamation-circle me-2 fixage"></i>Could not read from clipboard. Please make sure you have granted clipboard permissions.
                  </div>
                  <button type="button" class="btn-close btn-close-white me-2 m-auto fixage" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
              </div>`;
            
            const toast = $(toastHtml);
            $('body').append(toast);
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
            
            // Remove toast after it's hidden
            toast.on('hidden.bs.toast', function() {
              $(this).remove();
            });
            
            // Uncheck the checkbox
            $(this).prop('checked', false);
          }
        } else {
          $(`#text-value-${textareaName}`).val('');
        }
      };

      $(`#clean-text-${defaultName}`).change(handleCheckboxChange);
      
      // Update placeholder highlighting
      highlightPlaceholders();
    });

    // Function to remove a text group with animation
    $(document).on('click', '.remove-btn', function() {
      const name = $(this).data('name');
      const textGroup = $(`#text-group-${name}`);
      
      // Animate removal
      textGroup.css({
        'opacity': '0',
        'transform': 'translateY(20px)'
      });
      
      setTimeout(() => {
        window.usedNames.delete(name);
        window.activeTextAreas.delete(name);
        textGroup.remove();
        
        // Reset textCountfixage if we've deleted all text areas
        if (window.activeTextAreas.size === 0) {
          textCountfixage = 0;
        }
        
        // Update placeholder highlighting
        highlightPlaceholders();
      }, 300);
    });

    // Monitor main textarea for changes to highlight placeholders
    $('#main-textarea').on('input', function() {
      highlightPlaceholders();
    });

    // Function to generate output text with animation
    $('#generate-btn').click(async function () {
      const generateBtn = $(this);
      const originalHtml = generateBtn.html();
      const outputTextarea = $('#left-output-textarea');
      
      // Add loading animation
      generateBtn.html('<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Processing...');
      generateBtn.prop('disabled', true);
      
      // Small delay to show the animation (can be removed in production)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let mainText = $('#main-textarea').val();
      let replacementsMade = 0;
      
      // Loop through all dynamic inputs and replace text
      $('.text-name').each(function () {
        const textName = $(this).val();
        const textareaName = $(this).attr('id').split('-')[2];
        const replacementText = $(`#text-value-${textareaName}`).val();
        if (textName) {
          const regex = new RegExp(`\\[${textName}\\]`, 'g');
          const matches = mainText.match(regex) || [];
          replacementsMade += matches.length;
          mainText = mainText.replace(regex, replacementText);
        }
      });

      // Set the generated output in the output textarea with a fade effect
      outputTextarea.fadeOut(200, function() {
        $(this).val(mainText);
        $(this).fadeIn(200);
      });

      // Show a success toast with replacement count
      const toastHtml = `
        <div class="toast align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 m-3 fixage" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="d-flex fixage">
            <div class="toast-body fixage">
              <i class="fas fa-check-circle me-2 fixage"></i>Successfully replaced ${replacementsMade} placeholder${replacementsMade !== 1 ? 's' : ''}!
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto fixage" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>`;
      
      const toast = $(toastHtml);
      $('body').append(toast);
      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();
      
      // Remove toast after it's hidden
      toast.on('hidden.bs.toast', function() {
        $(this).remove();
      });

      // Auto-copy to clipboard if checked
      if ($('#auto-copy').is(':checked') && mainText) {
        try {
          await navigator.clipboard.writeText(mainText);
          // Show temporary feedback
          generateBtn.html('<i class="fas fa-check me-1"></i>Copied!').removeClass('btn-primary').addClass('btn-success');
        } catch (err) {
          console.error('Failed to copy: ', err);
          generateBtn.html('<i class="fas fa-times me-1"></i>Copy Failed!').removeClass('btn-primary').addClass('btn-danger');
        }
        
        // Reset button after delay
        setTimeout(() => {
          generateBtn.html(originalHtml).removeClass('btn-success btn-danger').addClass('btn-primary');
          generateBtn.prop('disabled', false);
        }, 2000);
      } else {
        // Reset button immediately if no copy was performed
        generateBtn.html(originalHtml);
        generateBtn.prop('disabled', false);
      }
    });

    // Add visibility change listener for auto-paste
    $(document).on('visibilitychange', async function() {
      if (!document.hidden) {
        $('.clean-text-checkbox:checked').each(async function() {
          const textareaName = $(this).attr('id').split('-')[2];
          try {
            const text = await navigator.clipboard.readText();
            $(`#text-value-${textareaName}`).val(text).trigger('input');
          } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
          }
        });
      }
    });

    // Function to count and display placeholders
    function updatePlaceholderCount() {
      const mainText = $('#main-textarea').val();
      const placeholderRegex = /\[(.*?)\]/g;
      let match;
      let placeholders = new Set();
      
      // Find all unique placeholders in the text
      while ((match = placeholderRegex.exec(mainText)) !== null) {
        placeholders.add(match[1]);
      }
      
      // Update the counter
      const count = placeholders.size;
      $('#placeholder-count').text(`${count} placeholder${count !== 1 ? 's' : ''} found`);
      
      return placeholders;
    }

    // Function to clear all inputs
    $('#clear-all-btn, .clear-all-btn').click(function() {
      if (confirm('Are you sure you want to clear all inputs? This cannot be undone.')) {
        // Clear main textarea
        $('#main-textarea').val('');
        
        // Remove all text groups
        $('.text-group').each(function() {
          const name = $(this).attr('id').split('-')[2];
          window.usedNames.delete(name);
          window.activeTextAreas.delete(name);
          $(this).remove();
        });
        
        // Clear output
        $('#left-output-textarea').val('');
        
        // Reset counter
        textCountfixage = 0;
        
        // Show message
        $('#no-replacements-message').show();
        
        // Update placeholder count
        updatePlaceholderCount();
        
        // Show success toast
        const toastHtml = `
          <div class="toast align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 m-3 fixage" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex fixage">
              <div class="toast-body fixage">
                <i class="fas fa-check-circle me-2 fixage"></i>All inputs cleared successfully!
              </div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto fixage" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
          </div>`;
        
        const toast = $(toastHtml);
        $('body').append(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove toast after it's hidden
        toast.on('hidden.bs.toast', function() {
          $(this).remove();
        });
      }
    });

    // Function to clear text
    $('#clear-text-btn, .clear-text-btn').click(function() {
      $('#main-textarea').val('');
      updatePlaceholderCount();
    });

    // Function to format text
    $('#format-text-btn, .format-text-btn').click(function() {
      const textarea = $('#main-textarea');
      const text = textarea.val();
      
      // Simple formatting: add line breaks after periods, question marks, and exclamation marks
      const formattedText = text
        .replace(/\. /g, '.\n')
        .replace(/\? /g, '?\n')
        .replace(/! /g, '!\n')
        .replace(/\n\n+/g, '\n\n'); // Remove excessive line breaks
      
      textarea.val(formattedText);
      updatePlaceholderCount();
    });

    // Function to copy output
    $('#copy-output-btn').click(async function() {
      const outputText = $('#left-output-textarea').val();
      if (outputText) {
        try {
          await navigator.clipboard.writeText(outputText);
          
          // Show temporary feedback
          const originalHtml = $(this).html();
          $(this).html('<i class="fas fa-check"></i>').removeClass('btn-outline-secondary').addClass('btn-success');
          
          // Reset button after delay
          setTimeout(() => {
            $(this).html(originalHtml).removeClass('btn-success').addClass('btn-outline-secondary');
          }, 2000);
          
        } catch (err) {
          console.error('Failed to copy: ', err);
          
          // Show error feedback
          const originalHtml = $(this).html();
          $(this).html('<i class="fas fa-times"></i>').removeClass('btn-outline-secondary').addClass('btn-danger');
          
          // Reset button after delay
          setTimeout(() => {
            $(this).html(originalHtml).removeClass('btn-danger').addClass('btn-outline-secondary');
          }, 2000);
        }
      }
    });

    // Preview button functionality
    $('#preview-btn').click(function() {
      const mainText = $('#main-textarea').val();
      const placeholders = updatePlaceholderCount();
      
      // Create a preview of the text with highlighted placeholders
      let previewText = mainText;
      
      // Replace each placeholder with a highlighted version
      placeholders.forEach(placeholder => {
        const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
        const replacement = `<span class="badge bg-primary">[${placeholder}]</span>`;
        previewText = previewText.replace(regex, replacement);
      });
      
      // Create and show modal
      const modalHtml = `
        <div class="modal fade" id="previewModal" tabindex="-1" aria-labelledby="previewModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="previewModalLabel">Text Preview</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="preview-content" style="white-space: pre-wrap;">${previewText}</div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>`;
      
      // Remove any existing preview modal
      $('#previewModal').remove();
      
      // Add the new modal to the DOM
      $('body').append(modalHtml);
      
      // Show the modal
      const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
      previewModal.show();
    });

    // Bulk add functionality
    $('#bulk-add-btn').click(function() {
      const bulkModal = new bootstrap.Modal(document.getElementById('bulkAddModal'));
      bulkModal.show();
    });

    // Confirm bulk add
    $('#confirm-bulk-add').click(function() {
      const bulkText = $('#bulk-textarea').val();
      const lines = bulkText.split('\n');
      let addedCount = 0;
      
      lines.forEach(line => {
        // Parse each line in format: placeholder=value
        const parts = line.split('=');
        if (parts.length >= 2) {
          const placeholder = parts[0].trim();
          const value = parts.slice(1).join('=').trim(); // Join in case value contains = signs
          
          if (placeholder && !window.usedNames.has(placeholder)) {
            // Add a new text group with the parsed values
            window.usedNames.add(placeholder);
            window.activeTextAreas.add(placeholder);
            
            const inputGroup = `
              <div class="text-group fixage" id="text-group-${placeholder}">
                <div class="d-flex justify-content-between align-items-center mb-2 fixage">
                  <span class="badge placeholder-badge bg-secondary fixage"><i class="fas fa-question me-1 fixage"></i>Not in text</span>
                  <button class="btn btn-danger btn-sm remove-btn fixage" data-name="${placeholder}">
                    <i class="fas fa-times fixage"></i>
                  </button>
                </div>
                <div class="mb-3 fixage">
                  <label for="text-name-${placeholder}" class="form-label fixage"><i class="fas fa-tag me-1 fixage"></i>Placeholder Name:</label>
                  <div class="input-group fixage">
                    <span class="input-group-text fixage">[</span>
                    <input type="text" class="form-control text-name fixage" id="text-name-${placeholder}" value="${placeholder}" placeholder="Enter name without brackets">
                    <span class="input-group-text fixage">]</span>
                  </div>
                  <small class="form-text text-muted fixage">This will replace [${placeholder}] in your text</small>
                </div>
                <div class="mb-3 fixage">
                  <label for="text-value-${placeholder}" class="form-label fixage"><i class="fas fa-edit me-1 fixage"></i>Replacement Text:</label>
                  <textarea class="form-control text-value fixage" id="text-value-${placeholder}" rows="3" placeholder="Enter replacement text">${value}</textarea>
                </div>
                <div class="clean-checkbox form-check form-switch fixage">
                  <input class="form-check-input clean-text-checkbox fixage" type="checkbox" id="clean-text-${placeholder}">
                  <label class="form-check-label fixage" for="clean-text-${placeholder}"><i class="fas fa-clipboard me-1 fixage"></i>Auto-paste from clipboard</label>
                </div>
              </div>`;
            
            $('#dynamic-inputs').append(inputGroup);
            addedCount++;
            
            // Set up event handlers for the new elements
            $(`#text-name-${placeholder}`).on('input', function() {
              const newName = $(this).val();
              const oldName = $(this).data('old-name') || placeholder;
              
              if (newName !== oldName) {
                if (window.usedNames.has(newName) && newName !== '') {
                  $(this).addClass('is-invalid');
                  $(this).siblings('.invalid-feedback').remove();
                  $(this).after('<div class="invalid-feedback">This name is already in use</div>');
                } else {
                  $(this).removeClass('is-invalid');
                  $(this).siblings('.invalid-feedback').remove();
                  window.usedNames.delete(oldName);
                  window.activeTextAreas.delete(oldName);
                  window.usedNames.add(newName);
                  window.activeTextAreas.add(newName);
                  $(this).data('old-name', newName);
                  
                  // Update all references to the old name
                  $(`button[data-name="${oldName}"]`).attr('data-name', newName);
                  $(`#text-group-${oldName}`).attr('id', `text-group-${newName}`);
                  $(`#text-value-${oldName}`).attr('id', `text-value-${newName}`);
                  $(`#clean-text-${oldName}`).attr('id', `clean-text-${newName}`);
                  $(`label[for="text-name-${oldName}"]`).attr('for', `text-name-${newName}`);
                  $(`label[for="text-value-${oldName}"]`).attr('for', `text-value-${newName}`);
                  $(`label[for="clean-text-${oldName}"]`).attr('for', `clean-text-${newName}`);
                  
                  // Update the small text helper
                  $(this).parent().siblings('small').text(`This will replace [${newName}] in your text`);
                }
                
                // Update placeholder highlighting
                highlightPlaceholders();
              }
            });
            
            // Handle checkbox change for this specific textarea
            $(`#clean-text-${placeholder}`).change(async function() {
              const textareaName = $(this).attr('id').split('-')[2];
              if ($(this).is(':checked')) {
                try {
                  const text = await navigator.clipboard.readText();
                  $(`#text-value-${textareaName}`).val(text).trigger('input');
                } catch (err) {
                  console.error('Failed to read clipboard contents: ', err);
                  $(this).prop('checked', false);
                }
              } else {
                $(`#text-value-${textareaName}`).val('');
              }
            });
          }
        }
      });
      
      // Hide the modal
      const bulkModal = bootstrap.Modal.getInstance(document.getElementById('bulkAddModal'));
      bulkModal.hide();
      
      // Clear the textarea
      $('#bulk-textarea').val('');
      
      // Update placeholder highlighting
      highlightPlaceholders();
      
      // Hide the no replacements message if we added any
      if (addedCount > 0) {
        $('#no-replacements-message').hide();
      }
      
      // Show success toast
      const toastHtml = `
        <div class="toast align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 m-3 fixage" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="d-flex fixage">
            <div class="toast-body fixage">
              <i class="fas fa-check-circle me-2 fixage"></i>Added ${addedCount} replacement text${addedCount !== 1 ? 's' : ''}!
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto fixage" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>`;
      
      const toast = $(toastHtml);
      $('body').append(toast);
      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();
      
      // Remove toast after it's hidden
      toast.on('hidden.bs.toast', function() {
        $(this).remove();
      });
    });

    // Save template functionality
    $('#save-template-btn, .save-template-btn').click(function() {
      const mainText = $('#main-textarea').val();
      const replacements = [];
      
      // Collect all replacement texts
      $('.text-name').each(function() {
        const textName = $(this).val();
        const textareaName = $(this).attr('id').split('-')[2];
        const replacementText = $(`#text-value-${textareaName}`).val();
        
        replacements.push({
          name: textName,
          value: replacementText
        });
      });
      
      // Create template object
      const template = {
        mainText: mainText,
        replacements: replacements,
        timestamp: new Date().toISOString()
      };
      
      // Convert to JSON string
      const templateJson = JSON.stringify(template);
      
      // Create download link
      const blob = new Blob([templateJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `text-template-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success toast
      const toastHtml = `
        <div class="toast align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 m-3 fixage" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="d-flex fixage">
            <div class="toast-body fixage">
              <i class="fas fa-check-circle me-2 fixage"></i>Template saved successfully!
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto fixage" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>`;
      
      const toast = $(toastHtml);
      $('body').append(toast);
      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();
      
      // Remove toast after it's hidden
      toast.on('hidden.bs.toast', function() {
        $(this).remove();
      });
    });

    // Load template functionality
    $('#load-template-btn, .load-template-btn').click(function() {
      // Create file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      
      fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          
          reader.onload = function(e) {
            try {
              const template = JSON.parse(e.target.result);
              
              // Clear existing inputs
              $('#clear-all-btn, .clear-all-btn').trigger('click');
              
              // Set main text
              $('#main-textarea').val(template.mainText);
              
              // Add replacement texts
              template.replacements.forEach(replacement => {
                if (replacement.name) {
                  window.usedNames.add(replacement.name);
                  window.activeTextAreas.add(replacement.name);
                  
                  const inputGroup = `
                    <div class="text-group fixage" id="text-group-${replacement.name}">
                      <div class="d-flex justify-content-between align-items-center mb-2 fixage">
                        <span class="badge placeholder-badge bg-secondary fixage"><i class="fas fa-question me-1 fixage"></i>Not in text</span>
                        <button class="btn btn-danger btn-sm remove-btn fixage" data-name="${replacement.name}">
                          <i class="fas fa-times fixage"></i>
                        </button>
                      </div>
                      <div class="mb-3 fixage">
                        <label for="text-name-${replacement.name}" class="form-label fixage"><i class="fas fa-tag me-1 fixage"></i>Placeholder Name:</label>
                        <div class="input-group fixage">
                          <span class="input-group-text fixage">[</span>
                          <input type="text" class="form-control text-name fixage" id="text-name-${replacement.name}" value="${replacement.name}" placeholder="Enter name without brackets">
                          <span class="input-group-text fixage">]</span>
                        </div>
                        <small class="form-text text-muted fixage">This will replace [${replacement.name}] in your text</small>
                      </div>
                      <div class="mb-3 fixage">
                        <label for="text-value-${replacement.name}" class="form-label fixage"><i class="fas fa-edit me-1 fixage"></i>Replacement Text:</label>
                        <textarea class="form-control text-value fixage" id="text-value-${replacement.name}" rows="3" placeholder="Enter replacement text">${replacement.value || ''}</textarea>
                      </div>
                      <div class="clean-checkbox form-check form-switch fixage">
                        <input class="form-check-input clean-text-checkbox fixage" type="checkbox" id="clean-text-${replacement.name}">
                        <label class="form-check-label fixage" for="clean-text-${replacement.name}"><i class="fas fa-clipboard me-1 fixage"></i>Auto-paste from clipboard</label>
                      </div>
                    </div>`;
                  
                  $('#dynamic-inputs').append(inputGroup);
                  
                  // Set up event handlers for the new elements
                  $(`#text-name-${replacement.name}`).on('input', function() {
                    const newName = $(this).val();
                    const oldName = $(this).data('old-name') || replacement.name;
                    
                    if (newName !== oldName) {
                      if (window.usedNames.has(newName) && newName !== '') {
                        $(this).addClass('is-invalid');
                        $(this).siblings('.invalid-feedback').remove();
                        $(this).after('<div class="invalid-feedback">This name is already in use</div>');
                      } else {
                        $(this).removeClass('is-invalid');
                        $(this).siblings('.invalid-feedback').remove();
                        window.usedNames.delete(oldName);
                        window.activeTextAreas.delete(oldName);
                        window.usedNames.add(newName);
                        window.activeTextAreas.add(newName);
                        $(this).data('old-name', newName);
                        
                        // Update all references to the old name
                        $(`button[data-name="${oldName}"]`).attr('data-name', newName);
                        $(`#text-group-${oldName}`).attr('id', `text-group-${newName}`);
                        $(`#text-value-${oldName}`).attr('id', `text-value-${newName}`);
                        $(`#clean-text-${oldName}`).attr('id', `clean-text-${newName}`);
                        $(`label[for="text-name-${oldName}"]`).attr('for', `text-name-${newName}`);
                        $(`label[for="text-value-${oldName}"]`).attr('for', `text-value-${newName}`);
                        $(`label[for="clean-text-${oldName}"]`).attr('for', `clean-text-${newName}`);
                        
                        // Update the small text helper
                        $(this).parent().siblings('small').text(`This will replace [${newName}] in your text`);
                      }
                      
                      // Update placeholder highlighting
                      highlightPlaceholders();
                    }
                  });
                  
                  // Handle checkbox change for this specific textarea
                  $(`#clean-text-${replacement.name}`).change(async function() {
                    const textareaName = $(this).attr('id').split('-')[2];
                    if ($(this).is(':checked')) {
                      try {
                        const text = await navigator.clipboard.readText();
                        $(`#text-value-${textareaName}`).val(text).trigger('input');
                      } catch (err) {
                        console.error('Failed to read clipboard contents: ', err);
                        $(this).prop('checked', false);
                      }
                    } else {
                      $(`#text-value-${textareaName}`).val('');
                    }
                  });
                }
              });
              
              // Update placeholder highlighting
              highlightPlaceholders();
              updatePlaceholderCount();
              
              // Hide the no replacements message
              $('#no-replacements-message').hide();
              
              // Show success toast
              const toastHtml = `
                <div class="toast align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 m-3 fixage" role="alert" aria-live="assertive" aria-atomic="true">
                  <div class="d-flex fixage">
                    <div class="toast-body fixage">
                      <i class="fas fa-check-circle me-2 fixage"></i>Template loaded successfully!
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto fixage" data-bs-dismiss="toast" aria-label="Close"></button>
                  </div>
                </div>`;
              
              const toast = $(toastHtml);
              $('body').append(toast);
              const bsToast = new bootstrap.Toast(toast);
              bsToast.show();
              
              // Remove toast after it's hidden
              toast.on('hidden.bs.toast', function() {
                $(this).remove();
              });
              
            } catch (err) {
              console.error('Failed to parse template: ', err);
              
              // Show error toast
              const toastHtml = `
                <div class="toast align-items-center text-white bg-danger border-0 position-fixed bottom-0 end-0 m-3 fixage" role="alert" aria-live="assertive" aria-atomic="true">
                  <div class="d-flex fixage">
                    <div class="toast-body fixage">
                      <i class="fas fa-exclamation-circle me-2 fixage"></i>Failed to load template. Invalid file format.
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto fixage" data-bs-dismiss="toast" aria-label="Close"></button>
                  </div>
                </div>`;
              
              const toast = $(toastHtml);
              $('body').append(toast);
              const bsToast = new bootstrap.Toast(toast);
              bsToast.show();
              
              // Remove toast after it's hidden
              toast.on('hidden.bs.toast', function() {
                $(this).remove();
              });
            }
          };
          
          reader.readAsText(file);
        }
      });
      
      fileInput.click();
    });

    // Toggle highlight placeholders
    $('#highlight-placeholders').change(function() {
      if ($(this).is(':checked')) {
        highlightPlaceholders();
      } else {
        // Remove highlighting
        $('.placeholder-badge').removeClass('bg-success').addClass('bg-secondary').html('<i class="fas fa-question me-1 fixage"></i>Not highlighted');
      }
    });

    // Add one text area by default when page loads
    $(document).ready(function() {
      // Add a welcome message to the main textarea if it's empty
      if ($('#main-textarea').val() === '') {
        $('#main-textarea').val('Hello [text1],\n\nThis is a sample text with [text1] and [text2] placeholders.\n\nThank you,\n[text2]');
      }
      
      // Add the first text area
      $('#add-text-btn').trigger('click');
      
      // Initialize tooltips
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
      
      // Update placeholder count
      updatePlaceholderCount();
      
      // Hide no replacements message initially
      $('#no-replacements-message').hide();
    });


    // Add visibility change listener for auto-paste
    $(document).on('visibilitychange', async function() {
      if (!document.hidden) {
        $('.clean-text-checkbox:checked').each(async function() {
          const textareaName = $(this).attr('id').split('-')[2];
          try {
            const text = await navigator.clipboard.readText();
            $(`#text-value-${textareaName}`).val(text).trigger('input');
          } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
          }
        });
      }
    });

    // Add one text area by default when page loads
    $(document).ready(function() {
      // Add a welcome message to the main textarea if it's empty
      if ($('#main-textarea').val() === '') {
        $('#main-textarea').val('Hello [text1],\n\nThis is a sample text with [text1] and [text2] placeholders.\n\nThank you,\n[text2]');
      }
      
      // Add the first text area
      $('#add-text-btn').trigger('click');
      
      // Initialize tooltips
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    });
//end fixage
// Function to add a new text input and textarea

// showSection function moved to navigation.js to avoid conflicts
//for hide list header en mode mobile
function toggleCollapse() {
  const navbarNav = document.getElementById('navbarNav');

  const navbarToggler = document.querySelector('.navbar-toggler');

  if (navbarNav.classList.contains('show')) {
    navbarToggler.click(); // Close the menu
  }
}
//hide or show generateur
// Get references to the checkbox and target div
let randomCheckbox;
if (!window.randomCheckbox) {
  randomCheckbox = document.getElementById('random');
  window.randomCheckbox = randomCheckbox;
} else {
  randomCheckbox = window.randomCheckbox;
}
const generateRandomDiv = document.getElementById('generat_random');
const ip_extraction_lite= document.getElementById('ip-extraction-lite');
if (randomCheckbox) {
  randomCheckbox.addEventListener('change', function () {
  // Toggle the display style of the target div based on the checkbox's checked state
  generateRandomDiv.style.display = this.checked ? 'block' : 'none';
  // Add or remove the "row" class based on the checkbox's checked state
  // if (this.checked) {
  //   ip_extraction_lite.classList.remove('mt-5');
  // } else {
  //   ip_extraction_lite.classList.add('mt-5');
  // }
    
  });
}
function getSectionInfo(section) {
  switch (section) {
    case 'home':
      return {
        title: 'About',
        description: 'This is the About section. It provides general information about the website.'
      };
    case 'fixage':
        return {
          title: 'Text Replacement Tool',
          description: 'This tool allows you to create dynamic text with placeholders. Enter your text with placeholders like [text1], add replacement values, and generate the final text.'
        };
    case 'ip-extraction':
      return {
        title: 'Extraction Tool',
        description: 'This section contains an IP or Email or Domain extraction tool that allows you to extract IPV4/V6 or email or domain addresses from text and Remove Duplicate Line or Shulffle text.'
      };
    case 'split':
      return {
        title: 'Split Tool',
        description: 'This section contains a text splitting tool that allows you to split text into sections.'
      };
    case 'checkdomain':
      return {
        title: 'About Domain',
        description: 'This section contains information about domains and allows you to check the reputation of a domain.'
      };
      case 'prime':
        return {
          title: 'Prime',
          description: 'This section contains calcule prime.'
        };
      case 'texttool':
        return {
          title: 'text',
          description: 'This section contains tool text.'
        };
    default:
      return {
        title: '',
        description: ''
      };
  }
}
function showModal(section) {
  const visited = localStorage.getItem(section);

  if (!visited) {
    const modal = document.getElementById('section-modal');
    if (modal) {
      const modalBody = modal.querySelector('.modal-body');
      const sectionTitle = modal.querySelector('.modal-title');
      const sectionInfo = getSectionInfo(section);

      sectionTitle.innerText = sectionInfo.title;
      modalBody.innerHTML = sectionInfo.description;

      $(modal).modal('show');
      localStorage.setItem(section, 'visited');
    }
  }
}
document.getElementById("input-text").value = "";
const outputContainer = document.getElementById("output-containerr");

function splitText(buttonId) {
  const inputText = document.getElementById("input-text").value.trim();
  const sectionCount = parseInt(document.getElementById("lengths").value);
  const evenSections = document.getElementById("even-sections").checked;
  const outputContainer = document.getElementById("output-container");

  // Clear any previous output
  outputContainer.innerHTML = "";

  // Check for invalid input
  if (inputText.trim() === "") {
    showAlert("Please enter some text.");
    return;
  }

  if (isNaN(sectionCount) || sectionCount < 1) {
    showAlert("Please enter a valid number of sections.");
    return;
  }

  const inputLines = inputText.split("\n");
  const inputLineCount = inputLines.length;

  if (inputLineCount < sectionCount) {
    showAlert("The number of sections is greater than the number of lines in the input text.");
    return;
  }

  function showAlert(message) {
    outputContainer.innerHTML = `
      <div class="alert alert-danger" role="alert">
        ${message}
      </div>
    `;

    // Remove the alert after 4 seconds
    setTimeout(() => {
      outputContainer.innerHTML = "";
    }, 4000);
  }

  let splitBySection = document.getElementById("split-by-section").checked;
  let splitByLine = document.getElementById("split-by-line").checked;

  if (splitBySection) {
    let sectionSize = Math.floor(inputLineCount / sectionCount);
    let remainingLines = inputLineCount % sectionCount;
    let currentLineIndex = 0;
    let copyButtonCounter = 1;

    if (buttonId === "area") {
      for (let i = 0; i < sectionCount; i++) {
        let currentSectionSize = sectionSize;
        if (evenSections && remainingLines > 0) {
          currentSectionSize++;
          remainingLines--;
        }

        let sectionLines = inputLines.slice(currentLineIndex, currentLineIndex + currentSectionSize);
        currentLineIndex += currentSectionSize;

        let outputTextarea = createTextarea(sectionLines.join("\n"));
        outputTextarea.value = sectionLines.join("\n");

        let copyButton = createCopyButton(outputTextarea, copyButtonCounter);

        let div = createDiv();
        div.appendChild(outputTextarea);
        div.appendChild(copyButton);

        outputContainer.appendChild(div);

        copyButtonCounter++;
      }
    } else if (buttonId === "txt") {
      let sections = [];

      for (let i = 0; i < sectionCount; i++) {
        let currentSectionSize = sectionSize;
        if (evenSections && remainingLines > 0) {
          currentSectionSize++;
          remainingLines--;
        }

        let sectionLines = inputLines.slice(currentLineIndex, currentLineIndex + currentSectionSize);
        currentLineIndex += currentSectionSize;

        sections.push(sectionLines.join("\n"));
      }

      createAndDownloadFiles(sections);
    }
  } else if (splitByLine) {
    let linesPerSection = sectionCount;
    let currentLineIndex = 0;
    let copyButtonCounter = 1;
    let outputFiles = [];

    for (let i = 0; i < Math.ceil(inputLineCount / linesPerSection); i++) {
      let sectionLines = inputLines.slice(currentLineIndex, currentLineIndex + linesPerSection);
      currentLineIndex += linesPerSection;

      if (sectionLines.length > 0) {
        if (buttonId === "area") {
          let outputTextarea = createTextarea(sectionLines.join("\n"));
          outputTextarea.rows = sectionLines.length;
          let copyButton = createCopyButton(outputTextarea, copyButtonCounter);
          let div = createDiv();
          div.appendChild(outputTextarea);
          div.appendChild(copyButton);
          outputContainer.appendChild(div);
        } else if (buttonId === "txt") {
          let blob = new Blob([sectionLines.join("\n")], { type: "text/plain" });
          let file = new File([blob], `text_${i + 1}.txt`);
          outputFiles.push(file);
        }
        copyButtonCounter++;
      }
    }

    if (buttonId === "txt") {
      createAndDownloadZip(outputFiles);
    }
  }

  function createTextarea(value) {
    let outputTextarea = document.createElement("textarea");
    outputTextarea.classList.add("form-control", "mt-1");
    outputTextarea.style.height = "20px"; // Set the height to 100 pixels
    outputTextarea.style.resize = "none";
    outputTextarea.value = value;
    return outputTextarea;
  }
  
  

  function createCopyButton(outputTextarea, copyButtonCounter) {
    let copyButton = document.createElement("button");
    copyButton.classList.add("btn", "btn-outline-primary", "my-1");
    copyButton.textContent = "Copy " + copyButtonCounter;
    copyButton.addEventListener("click", function () {
      outputTextarea.select();
      document.execCommand("copy");
    });
    return copyButton;
  }

  function createDiv() {
    let div = document.createElement("div");
    div.classList.add("input-group");
    return div;
  }

  function createAndDownloadFiles(sections) {
    let outputFiles = [];
    sections.forEach((section, index) => {
      let blob = new Blob([section], { type: "text/plain" });
      let file = new File([blob], `output_${index + 1}.txt`);
      outputFiles.push(file);
    });
    createAndDownloadZip(outputFiles);
  }

  function createAndDownloadZip(files) {
    let zip = new JSZip();
    files.forEach((file, index) => {
      zip.file(`output_${index + 1}.txt`, file);
    });
    zip.generateAsync({ type: "blob" }).then((blob) => {
      saveAs(blob, "output.zip");
    });
  }
}




function countLines() {
  let text = document.getElementById("text").value;
  let lines = text.split("\n");
  document.getElementById("line-count").innerHTML = "Number of lines: " + lines.length;
}
function countLiness() {
  let text = document.getElementById("input-text").value;
  let lines = text.split("\n");
  document.getElementById("line-counts").innerHTML = "Number of lines: " + lines.length;
}

// Event listeners
document.getElementById("text").addEventListener("input", countLines);
document.getElementById("input-text").addEventListener("input", countLiness);
function checkinputText(text){
 // Clear any previous output
 if (text.trim() === "") {
  // Create the Bootstrap alert component
  let alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", "alert-danger", "mt-3");
  alertDiv.setAttribute("role", "alert");
  alertDiv.textContent = "Please enter some text.";
  // Find the container to prepend the alert
  let container = document.getElementById("output-containerr");
  container.innerHTML = ""; // Clear previous alerts
  // Append the alert to the container
  container.appendChild(alertDiv);
  // Hide the alert after 6 seconds
  setTimeout(function() {
    alertDiv.style.display = "none";
  }, 4000);

   return;
 }
 
}
function shuffleLines() {
  let fileInput = document.getElementById("inputGroupFile01");
  let textarea = document.getElementById("text");

  if (fileInput.files.length > 0) {
    let file = fileInput.files[0];
    let reader = new FileReader();

    reader.onload = function(event) {
      let dialogueContent = event.target.result;
      let lines = dialogueContent.split("\n");
      lines = shuffleArray(lines);
      downloadResult(lines.join("\n"), file);
      fileInput.value = "";
    };

    reader.readAsText(file);
  } else {
    let text = textarea.value.trim();
    checkinputText(text);
    let lines = text.split("\n");
    lines = shuffleArray(lines);
    textarea.value = lines.join("\n");
  }
}

function downloadResult(content, file) {
  if (content.trim() === "") {
    // Create the Bootstrap alert component
    let alertDiv = document.createElement("div");
    alertDiv.classList.add("alert", "alert-danger", "mt-3");
    alertDiv.setAttribute("role", "alert");
    alertDiv.textContent = "There is no information required in this file.";

    // Find the container to prepend the alert
    let container = document.getElementById("output-containerr");
    container.innerHTML = ""; // Clear previous alerts

    // Append the alert to the container
    container.appendChild(alertDiv);

    // Hide the alert after 6 seconds
    setTimeout(function() {
      alertDiv.style.display = "none";
    }, 4000);
  } else {
    let filename = "result.txt";
    let blob = new Blob([content], { type: "text/plain" });

    // Create a temporary anchor element
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    // Simulate a click on the anchor element to trigger the download
    link.dispatchEvent(new MouseEvent("click"));

    // Clean up the temporary URL object
    URL.revokeObjectURL(link.href);
  }
}


function copyText() {
  let outputText = document.getElementById("text");
  outputText.select();
  document.execCommand("copy");
}

function removeDuplicateLines() {
  let fileInput = document.getElementById("inputGroupFile01");
  let textarea = document.getElementById("text");

  if (fileInput.files.length > 0) {
    let file = fileInput.files[0];
    let reader = new FileReader();

    reader.onload = function(event) {
      let dialogueContent = event.target.result;
      let lines = dialogueContent.split("\n").map(line => line.trim());
      checkinputText(dialogueContent);

      lines = removeDuplicates(lines);
      document.getElementById("line-count").innerHTML = "Number of lines: " + lines.length;

      // Remove duplicate lines from file (if required) and download the result
      downloadResult(lines.join("\n"));
      fileInput.value = "";
    };

    reader.readAsText(file);
  } else {
    let text = textarea.value.trim();
    checkinputText(text);
    let lines = text.split("\n").map(line => line.trim());

    lines = removeDuplicates(lines);
    textarea.value = lines.join("\n");
    document.getElementById("line-count").innerHTML = "Number of lines: " + lines.length;

    
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function removeDuplicates(array) {
  return [...new Set(array)];
}


function extractipv4() {
  var fileInput = document.getElementById("inputGroupFile01");
  var textarea = document.getElementById("text");

  if (fileInput.files.length > 0) {
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
      var dialogueContent = event.target.result;
      var matches = dialogueContent.match(/((?:[0-9]{1,3}\.){3}[0-9]{1,3})/g);
      var uniqueMatches = [...new Set(matches)];
      checkinputText(dialogueContent);

      document.getElementById("line-count").innerHTML = "Number of unique IP addresses: " + uniqueMatches.length;

      downloadResult(uniqueMatches.join("\n"), file);
      fileInput.value = "";
    };

    reader.readAsText(file);
  } else {
    var input = textarea.value;
    var matches = input.match(/((?:[0-9]{1,3}\.){3}[0-9]{1,3})/g);
    var uniqueMatches = [...new Set(matches)];
    checkinputText(input);

    document.getElementById("line-count").innerHTML = "Number of unique IP addresses: " + uniqueMatches.length;

    textarea.value = uniqueMatches.join("\n");
  }
}

function extractipv6() {
  var fileInput = document.getElementById("inputGroupFile01");
  var textarea = document.getElementById("text");

  if (fileInput.files.length > 0) {
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
      var dialogueContent = event.target.result;
      var matches = dialogueContent.match(/((?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})/g);
      var uniqueMatches = [...new Set(matches)];
      checkinputText(dialogueContent);

      document.getElementById("line-count").innerHTML = "Number of unique IP addresses: " + uniqueMatches.length;

      downloadResult(uniqueMatches.join("\n"), file);
      fileInput.value = "";
    };

    reader.readAsText(file);
  } else {
    var input = textarea.value;
    var matches = input.match(/((?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})/g);
    var uniqueMatches = [...new Set(matches)];
    checkinputText(input);

    document.getElementById("line-count").innerHTML = "Number of unique IP addresses: " + uniqueMatches.length;

    textarea.value = uniqueMatches.join("\n");
  }
}

function extractipv4_ipv6() {
  var fileInput = document.getElementById("inputGroupFile01");
  var textarea = document.getElementById("text");

  if (fileInput.files.length > 0) {
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
      var dialogueContent = event.target.result;
      var ipv4Matches = dialogueContent.match(/((?:[0-9]{1,3}\.){3}[0-9]{1,3})/g);
      var ipv6Matches = dialogueContent.match(/((?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})/g);
      var allMatches = ipv4Matches.concat(ipv6Matches);
      var uniqueMatches = [...new Set(allMatches)];
      checkinputText(dialogueContent);

      document.getElementById("line-count").innerHTML = "Number of unique IP addresses: " + uniqueMatches.length;

      downloadResult(uniqueMatches.join("\n"), file);
      fileInput.value = "";
    };

    reader.readAsText(file);
  } else {
    var input = textarea.value;
    var ipv4Matches = input.match(/((?:[0-9]{1,3}\.){3}[0-9]{1,3})/g);
    var ipv6Matches = input.match(/((?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})/g);
    var allMatches = ipv4Matches.concat(ipv6Matches);
    var uniqueMatches = [...new Set(allMatches)];
    checkinputText(input);

    document.getElementById("line-count").innerHTML = "Number of unique IP addresses: " + uniqueMatches.length;

    textarea.value = uniqueMatches.join("\n");
  }
}
function extractDomain() {
  var fileInput = document.getElementById("inputGroupFile01");
  var textarea = document.getElementById("text");

  if (fileInput.files.length > 0) {
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
      var dialogueContent = event.target.result;
      var matches = dialogueContent.match(/(?:https?:\/\/)?(?:[a-z0-9-]+\.)+([a-z]{2,}(?:\.(?:com|one|net|org|edu|gov|mil|biz|info|io|me|tv|co|uk|club|online|xyz)))/ig);
      var uniqueMatches = [...new Set(matches.map(match => match.replace(/^(https?:\/\/)?/, '')))].filter(domain => domain.length > 0);
      checkinputText(dialogueContent);

      document.getElementById("line-count").innerHTML = "Number of unique Domain: " + uniqueMatches.length;
      downloadResult(uniqueMatches.join("\n"), file);
      fileInput.value = "";
    };

    reader.readAsText(file);
  } else {
    var text = textarea.value;
    var matches = text.match(/(?:https?:\/\/)?(?:[^./]+\.)?([a-z0-9-]+\.[a-z]{2,}(?:\.(?:com|one|net|org|edu|gov|mil|biz|info|io|me|tv|co|uk|club|online|xyz)))/ig);
    var uniqueMatches = [...new Set(matches.map(match => match.replace(/^(https?:\/\/)?/, '')))].filter(domain => domain.length > 0);
    checkinputText(text);

    document.getElementById("line-count").innerHTML = "Number of unique Domain: " + uniqueMatches.length;
    textarea.value = uniqueMatches.join("\n");
  }
}

function checkinputText(dialogueContent) {
  if (dialogueContent.length < 1) {
    document.getElementById("line-count").innerHTML = "Please enter some text or upload a file.";
  }
}

// }
/*----------------------new extact domain----------------------------------*/
// $(document).ready(function() {
//   $('#extensionSelect').select2({
//       tags: true,
//       tokenSeparators: [',', ' ']
//   });
// });
function closeCustomExtensionModal() {
  $('#customExtensionModal').modal('hide');
}
function handleExtensionChange() {
  var selectedExtension = document.getElementById("extensionSelect").value;
  if (selectedExtension === 'other') {
      $('#customExtensionModal').modal('show');
  } else {
      document.getElementById("customExtensionInputDiv").style.display = 'none';
  }
}

function addCustomExtension() {
  var customExtension = document.getElementById("customExtensionInputModal").value;
  if (customExtension) {
      // Add the new custom extension to the select options before "Other"
      var selectElement = document.getElementById("extensionSelect");
      var newOption = document.createElement("option");
      newOption.text = customExtension;
      newOption.value = customExtension;
      // Insert the new option before the "Other" option
      var otherOption = selectElement.querySelector('option[value="other"]');
      selectElement.insertBefore(newOption, otherOption);
      $('#customExtensionModal').modal('hide');

      // Select the newly added option
      selectElement.value = customExtension;
      document.getElementById("customExtensionInput").value = customExtension;

      // Store the new extension in local storage for future use
      var extensions = JSON.parse(localStorage.getItem('customExtensions')) || [];
      extensions.push(customExtension);
  }
  $('#customExtensionModal').modal('hide');
}
function extractDomains() {
  var selectedExtension = document.getElementById("extensionSelect").value;
  var textAreaContent = document.getElementById("text").value;
  var domainPattern = new RegExp(`\\b[a-z0-9-]+\\.${selectedExtension}\\b`, 'g');
  var matches = textAreaContent.match(domainPattern);

  if (matches) {
      var resultText = matches.join("\n");
      document.getElementById("text").value = resultText;
  } else {
      document.getElementById("text").value = "No domains found with the selected extension.";
  }
  removeDuplicateLines();
}

// function extractDomains() {
//   var selectedExtension = document.getElementById("extensionSelect").value;
//   var customExtension = document.getElementById("customExtensionInput").value;
//   var textAreaContent = document.getElementById("text").value;
//   var domainPattern;

//   if (selectedExtension && selectedExtension !== 'other') {
//       domainPattern = new RegExp(`\\b[a-z0-9-]+\\.${selectedExtension}\\b`, 'g');
//   } else if (customExtension) {
//       domainPattern = new RegExp(`\\b[a-z0-9-]+\\.${customExtension}\\b`, 'g');
//   } else {
//       document.getElementById("text").value = "Please select or enter an extension.";
//       return;
//   }

//   var matches = textAreaContent.match(domainPattern);

//   if (matches) {
//       var resultText = matches.join("\n");
//       document.getElementById("text").value = resultText;
//   } else {
//       document.getElementById("text").value = "No domains found with the selected/entered extension.";
//   }
//   removeDuplicateLines();

// }
/*------end new extract domain----*/
function downloadResult(text, file) {
  var blob = new Blob([text], {type: "text/plain"});
  var filename = file.name.replace(".txt", "-results.txt");
  var link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}


function extractsubDomain() {
  var fileInput = document.getElementById("inputGroupFile01");
  var textarea = document.getElementById("text");

  if (fileInput.files.length > 0) {
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
      var dialogueContent = event.target.result;
      var matches = dialogueContent.match(/([a-z0-9-]+\.)+(com|one|net|org|edu|gov|mil|biz|info|io|me|tv|co|uk|club|online|xyz)/ig);
      var uniqueMatches = [...new Set(matches)];
      checkinputText(dialogueContent);

      document.getElementById("line-count").innerHTML = "Number of unique SubDomain: " + uniqueMatches.length;
      downloadResult(uniqueMatches.join("\n"), file);
      fileInput.value = "";
    };

    reader.readAsText(file);
  } else {
    var text = textarea.value;
    var matches = text.match(/([a-z0-9-]+\.)+(com|one|net|org|edu|gov|mil|biz|info|io|me|tv|co|uk|club|online|xyz)/ig);
    var uniqueMatches = [...new Set(matches)];
    checkinputText(text);

    document.getElementById("line-count").innerHTML = "Number of unique SubDomain: " + uniqueMatches.length;
    textarea.value = uniqueMatches.join("\n");
  }
}

function extractEmails() {
  var fileInput = document.getElementById("inputGroupFile01");
  var textarea = document.getElementById("text");
  updateEmails();
  if (fileInput.files.length > 0) {
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
      var inputText = event.target.result;
      var regex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
      var emails = inputText.match(regex);
      checkinputText(inputText);
      var uniqueEmails = removeDuplicates(emails);
      var sortedEmails = sortEmailsByDomain(uniqueEmails);

      downloadResult(sortedEmails.join("\n"), file);
      fileInput.value = "";
    };

    reader.readAsText(file);
  } else {
    var inputText = textarea.value;
    var regex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
    var emails = inputText.match(regex);
    checkinputText(inputText);
    var uniqueEmails = removeDuplicates(emails);
    var sortedEmails = sortEmailsByDomain(uniqueEmails);

    textarea.value = sortedEmails.join("\n");
  }
}

function extractEmailAndPassword() {
  var fileInput = document.getElementById("inputGroupFile01");
  var textarea = document.getElementById("text");

  if (fileInput.files.length > 0) {
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
      var inputText = event.target.result;
      var regex = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}):([A-Za-z0-9]+)/g;
      var emailAndPasswords = inputText.match(regex);
      checkinputText(inputText);
      var uniqueEmailAndPasswords = removeDuplicates(emailAndPasswords);
      var sortedEmailAndPasswords = sortEmailsByDomain(uniqueEmailAndPasswords);

      downloadResult(sortedEmailAndPasswords.join("\n"), file);
      fileInput.value = "";
    };

    reader.readAsText(file);
  } else {
    var inputText = textarea.value;
    var regex = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}):([A-Za-z0-9]+)/g;
    var emailAndPasswords = inputText.match(regex);
    checkinputText(inputText);
    var uniqueEmailAndPasswords = removeDuplicates(emailAndPasswords);
    var sortedEmailAndPasswords = sortEmailsByDomain(uniqueEmailAndPasswords);

    textarea.value = sortedEmailAndPasswords.join("\n");
  }
}

function extractGmail() {
  var fileInput = document.getElementById("inputGroupFile01");
  var textarea = document.getElementById("text");

  function extractEmailsFromLine(line) {
    var regex = /[A-Za-z0-9._%+-]+@(gmail\.com|one|googlemail\.com)/g;
    return line.match(regex);
  }

  if (fileInput.files.length > 0) {
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function (event) {
      var inputText = event.target.result;
      var lines = inputText.split(/\r?\n/); // Split text into lines
      var gmailEmails = [];

      for (var i = 0; i < lines.length; i++) {
        var emailsInLine = extractEmailsFromLine(lines[i]);
        if (emailsInLine) {
          gmailEmails = gmailEmails.concat(emailsInLine);
        }
      }

      checkinputText(inputText);
      var uniqueGmailEmails = removeDuplicates(gmailEmails);

      downloadResult(uniqueGmailEmails.join("\n"), file);
      fileInput.value = "";
    };

    reader.readAsText(file);
  } else {
    var inputText = textarea.value;
    var lines = inputText.split(/\r?\n/); // Split text into lines
    var gmailEmails = [];

    for (var i = 0; i < lines.length; i++) {
      var emailsInLine = extractEmailsFromLine(lines[i]);
      if (emailsInLine) {
        gmailEmails = gmailEmails.concat(emailsInLine);
      }
    }

    checkinputText(inputText);
    var uniqueGmailEmails = removeDuplicates(gmailEmails);

    textarea.value = uniqueGmailEmails.join("\n");
  }
}

function extractGmail_split() {
  var textarea = document.getElementById("input-text");
  var inputText = textarea.value;
  var words = inputText.split(/\s+/); // Split text into words
  var removeGoogleMail = document.getElementById("removegooglemail").checked;
  var regex;

  if (removeGoogleMail) {
    regex = /[A-Za-z0-9._%+-]+@gmail\.com/g;
  } else {
    regex = /[A-Za-z0-9._%+-]+@(gmail\.com|googlemail\.com|one)/g;
  }

  var gmailEmails = [];

  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var emailsInWord = word.match(regex);
    if (emailsInWord) {
      gmailEmails = gmailEmails.concat(emailsInWord);
    }
  }

  checkinputText(inputText);
  var uniqueGmailEmails = removeDuplicates(gmailEmails);
  document.getElementById("line-counts").innerHTML = "Number of Email addresses: " + uniqueGmailEmails.length;
  textarea.value = uniqueGmailEmails.join("\n");
}


function extractYahoo() {
  var fileInput = document.getElementById("inputGroupFile01");
  var textarea = document.getElementById("text");

  if (fileInput.files.length > 0) {
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
      var inputText = event.target.result;
      var regex = /[A-Za-z0-9._%+-]+@yahoo\.[A-Za-z]{2,}/g;
      var yahooEmails = inputText.match(regex);
      checkinputText(inputText);
      var uniqueYahooEmails = removeDuplicates(yahooEmails);

      downloadResult(uniqueYahooEmails.join("\n"), file);
      fileInput.value = "";
    };

    reader.readAsText(file);
  } else {
    var inputText = textarea.value;
    var regex = /[A-Za-z0-9._%+-]+@yahoo\.[A-Za-z]{2,}/g;
    var yahooEmails = inputText.match(regex);
    checkinputText(inputText);
    var uniqueYahooEmails = removeDuplicates(yahooEmails);

    textarea.value = uniqueYahooEmails.join("\n");
  }
}

function extractHotmail() {
  var fileInput = document.getElementById("inputGroupFile01");
  var textarea = document.getElementById("text");

  if (fileInput.files.length > 0) {
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
      var inputText = event.target.result;
      var regex = /[A-Za-z0-9._%+-]+@hotmail\.[A-Za-z]{2,}/g;
      var hotmailEmails = inputText.match(regex);
      checkinputText(inputText);
      var uniqueHotmailEmails = removeDuplicates(hotmailEmails);

      downloadResult(uniqueHotmailEmails.join("\n"), file);
      fileInput.value = "";
    };

    reader.readAsText(file);
  } else {
    var inputText = textarea.value;
    var regex = /[A-Za-z0-9._%+-]+@hotmail\.[A-Za-z]{2,}/g;
    var hotmailEmails = inputText.match(regex);
    checkinputText(inputText);
    var uniqueHotmailEmails = removeDuplicates(hotmailEmails);

    textarea.value = uniqueHotmailEmails.join("\n");
  }
}

function sortEmailsByDomain(emails) {
  return emails.sort(function(a, b) {
    var domainA = a.substring(a.lastIndexOf("@") + 1).toLowerCase();
    var domainB = b.substring(b.lastIndexOf("@") + 1).toLowerCase();
    if (domainA < domainB) return -1;
    if (domainA > domainB) return 1;
    return 0;
  });
}

// Fonctions de tri pour les résultats d'extraction
function sortResultsAlphabetically() {
  var textarea = document.getElementById("text");
  var lines = textarea.value.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length <= 1) return; // Ne rien faire s'il n'y a pas assez de lignes
  
  lines.sort(function(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });
  
  textarea.value = lines.join('\n');
  showNotification('Résultats triés par ordre alphabétique', 2000);
}

function sortResultsByDomain() {
  var textarea = document.getElementById("text");
  var lines = textarea.value.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length <= 1) return; // Ne rien faire s'il n'y a pas assez de lignes
  
  // Vérifier si les lignes contiennent des emails ou des domaines
  var containsEmails = lines.some(line => line.includes('@'));
  
  if (containsEmails) {
    // Tri par domaine pour les emails
    lines.sort(function(a, b) {
      var domainA = a.includes('@') ? a.substring(a.lastIndexOf("@") + 1).toLowerCase() : a.toLowerCase();
      var domainB = b.includes('@') ? b.substring(b.lastIndexOf("@") + 1).toLowerCase() : b.toLowerCase();
      return domainA.localeCompare(domainB);
    });
    showNotification('Résultats triés par domaine d\'email', 2000);
  } else {
    // Tri par extension de domaine pour les domaines
    lines.sort(function(a, b) {
      var extensionA = a.substring(a.lastIndexOf(".") + 1).toLowerCase();
      var extensionB = b.substring(b.lastIndexOf(".") + 1).toLowerCase();
      if (extensionA === extensionB) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      }
      return extensionA.localeCompare(extensionB);
    });
    showNotification('Résultats triés par extension de domaine', 2000);
  }
  
  textarea.value = lines.join('\n');
}

function sortResultsByLength() {
  var textarea = document.getElementById("text");
  var lines = textarea.value.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length <= 1) return; // Ne rien faire s'il n'y a pas assez de lignes
  
  lines.sort(function(a, b) {
    return a.length - b.length;
  });
  
  textarea.value = lines.join('\n');
  showNotification('Résultats triés par longueur', 2000);
}

function classifyResults() {
  var textarea = document.getElementById("text");
  var lines = textarea.value.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length <= 1) return; // Ne rien faire s'il n'y a pas assez de lignes
  
  // Déterminer le type de contenu (emails, domaines, IPs)
  var containsEmails = lines.some(line => line.includes('@'));
  var containsIPs = lines.some(line => /\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(line));
  
  var result = '';
  
  if (containsEmails) {
    // Classifier par domaine d'email
    var emailsByDomain = {};
    
    lines.forEach(function(line) {
      if (line.includes('@')) {
        var domain = line.substring(line.lastIndexOf("@") + 1).toLowerCase();
        if (!emailsByDomain[domain]) {
          emailsByDomain[domain] = [];
        }
        emailsByDomain[domain].push(line);
      } else {
        // Lignes qui ne sont pas des emails
        if (!emailsByDomain['autres']) {
          emailsByDomain['autres'] = [];
        }
        emailsByDomain['autres'].push(line);
      }
    });
    
    // Trier les domaines alphabétiquement
    var sortedDomains = Object.keys(emailsByDomain).sort();
    
    sortedDomains.forEach(function(domain) {
      result += '--- ' + domain + ' (' + emailsByDomain[domain].length + ') ---\n';
      result += emailsByDomain[domain].join('\n') + '\n\n';
    });
    
    showNotification('Emails classés par domaine', 2000);
  } else if (containsIPs) {
    // Classifier par classe d'IP
    var ipsByClass = {};
    
    lines.forEach(function(line) {
      var ipMatch = line.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
      if (ipMatch) {
        var ip = ipMatch[0];
        var firstOctet = parseInt(ip.split('.')[0]);
        var ipClass = 'Classe ';
        
        if (firstOctet >= 1 && firstOctet <= 126) ipClass += 'A';
        else if (firstOctet >= 128 && firstOctet <= 191) ipClass += 'B';
        else if (firstOctet >= 192 && firstOctet <= 223) ipClass += 'C';
        else if (firstOctet >= 224 && firstOctet <= 239) ipClass += 'D (Multicast)';
        else if (firstOctet >= 240 && firstOctet <= 255) ipClass += 'E (Réservé)';
        else ipClass += 'Spéciale';
        
        if (!ipsByClass[ipClass]) {
          ipsByClass[ipClass] = [];
        }
        ipsByClass[ipClass].push(line);
      } else {
        // Lignes qui ne sont pas des IPs
        if (!ipsByClass['autres']) {
          ipsByClass['autres'] = [];
        }
        ipsByClass['autres'].push(line);
      }
    });
    
    // Ordre spécifique des classes
    var classOrder = ['Classe A', 'Classe B', 'Classe C', 'Classe D (Multicast)', 'Classe E (Réservé)', 'Classe Spéciale', 'autres'];
    
    classOrder.forEach(function(ipClass) {
      if (ipsByClass[ipClass]) {
        result += '--- ' + ipClass + ' (' + ipsByClass[ipClass].length + ') ---\n';
        result += ipsByClass[ipClass].join('\n') + '\n\n';
      }
    });
    
    showNotification('IPs classées par classe', 2000);
  } else {
    // Classifier par extension de domaine ou autre critère
    var itemsByExtension = {};
    
    lines.forEach(function(line) {
      var extension = 'autres';
      if (line.includes('.')) {
        extension = line.substring(line.lastIndexOf(".") + 1).toLowerCase();
      }
      
      if (!itemsByExtension[extension]) {
        itemsByExtension[extension] = [];
      }
      itemsByExtension[extension].push(line);
    });
    
    // Trier les extensions alphabétiquement
    var sortedExtensions = Object.keys(itemsByExtension).sort();
    
    sortedExtensions.forEach(function(extension) {
      result += '--- .' + extension + ' (' + itemsByExtension[extension].length + ') ---\n';
      result += itemsByExtension[extension].join('\n') + '\n\n';
    });
    
    showNotification('Éléments classés par extension', 2000);
  }
  
  textarea.value = result.trim();
}

function removeDuplicates(emails) {
  document.getElementById("text").value = "";
  document.getElementById("line-count").innerHTML = "Number of Email addresses: 0";
  var uniqueEmails = [];
  emails.forEach(function(email) {
    if (!uniqueEmails.includes(email)) {
      uniqueEmails.push(email);
    }
  });
  document.getElementById("line-count").innerHTML = "Number of Email addresses: " + uniqueEmails.length;
  return uniqueEmails;
}

// function downloadResult(content, file) {
//   var element = document.createElement("a");
//   element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
//   element.setAttribute("download", file.name + "_result.txt");
//   element.style.display = "none";
//   document.body.appendChild(element);
//   element.click();
//   document.body.removeChild(element);
// }

// function checkinputText(inputText) {
//   var lineCount = (inputText.match(/\n/g) || []).length + 1;
//   document.getElementById("line-count").innerHTML = "Number of lines: " + lineCount;
// }

$(document).ready(function () {
  // Update length display when the page loads
  updateLengthDisplay();
  
  // Update length display when the range slider changes
  $('#length, .length-range').on('input', function() {
    updateLengthDisplay();
  });
  
  // Function to update the length display badge
  function updateLengthDisplay() {
    $('#length-displays, .length-displays').text($('#length, .length-range').val());
  }
  
  // Generate random string
  $('#generate, .generate-btn').click(function () {
    var length = $('#length').val();
    var uppercase = $('#uppercase, .uppercase-check').is(':checked');
    var lowercase = $('#lowercase, .lowercase-check').is(':checked');
    var numbers = $('#numbers, .numbers-check').is(':checked');
    var symbols = $('#symbols, .symbols-check').is(':checked');
    
    // Validate at least one character type is selected
    if (!uppercase && !lowercase && !numbers && !symbols) {
      showNotification('Please select at least one character type', 3000);
      return;
    }
    
    var result = '';
    var characters = '';
    if (uppercase) {
      characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    if (lowercase) {
      characters += 'abcdefghijklmnopqrstuvwxyz';
    }
    if (numbers) {
      characters += '0123456789';
    }
    if (symbols) {
      characters += '!@#$%^&*()_+~`|}{[]\:;?><,./-=';
    }
    
    // Generate the random string
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Set the result and add highlight animation
    $('#result-GN, .result-field').val(result);
    
    // Add a brief highlight effect to the result
    $('#result-GN, .result-field').addClass('highlight-result');
      setTimeout(function() {
        $('#result-GN, .result-field').removeClass('highlight-result');
      }, 300);
  });

  // Copy button functionality
  $('#copy, .copy-btn').click(function () {
    var resultInput = $('#result-GN, .result-field');
    if (resultInput.val()) {
      resultInput.select();
      document.execCommand('copy');
      
      // Show notification
      showNotification('Copied to clipboard!', 2000);
      
      // Add animation effect to copy button
      $(this).removeClass('btn-outline-success').addClass('btn-success');
      setTimeout(function() {
        $('#copy').removeClass('btn-success').addClass('btn-outline-success');
      }, 1000);
    } else {
      showNotification('Generate a string first!', 2000);
    }
  });
  
  // Also allow clicking on the result to copy (for backward compatibility)
  $('#result-GN, .result-field').click(function() {
    if ($(this).val()) {
      $(this).select();
      document.execCommand('copy');
      showNotification('Copied to clipboard!', 2000);
    }
  });
});
$(document).ready(function () {
  var lengthInput = $('#length, .length-range');
  var incrementButtons = $('#increment, .increment-btn');
  var decrementButtons = $('#decrement, .decrement-btn');

  incrementButtons.click(function () {
    lengthInput.val(parseInt(lengthInput.val()) + 1);
    // Update the length display badge after changing the value
        $('#length-displays, .length-displays').text($('#length, .length-range').val());

    // Trigger input event to ensure any other listeners are notified
    lengthInput.trigger('input');
  });

  decrementButtons.click(function () {
    lengthInput.val(Math.max(parseInt(lengthInput.val()) - 1, 1));
    // Update the length display badge after changing the value
    $('#length-displays, .length-displays').text($('#length, .length-range').val());

    // Trigger input event to ensure any other listeners are notified
    lengthInput.trigger('input');
  });
});
$(document).ready(function () {
  var lengthInput = $('#lengths');
  var incrementButton = $('#increments');
  var decrementButton = $('#decrements');

  incrementButton.click(function () {
    lengthInput.val(parseInt(lengthInput.val()) + 1);
  });

  decrementButton.click(function () {
    lengthInput.val(Math.max(parseInt(lengthInput.val()) - 1, 1));
  });
});
function download() {
  // Get the text from the textarea
  var text = document.getElementById("text").value;
  checkinputText(text)
  if(text.trim()!=''){
    // Create a new Blob object with the text and specify the MIME type
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });

    // Create a new URL object pointing to the blob
    var url = URL.createObjectURL(blob);

    // Create a new anchor element for the download link
    var a = document.createElement("a");

    // Set the download attribute and the URL
    a.setAttribute("download", "myTextFile.txt");
    a.setAttribute("href", url);

    // Click the anchor element to initiate the download
    a.click();}
    
}
// dark mode in site
const darkModeBtn = document.getElementById('dark-mode-btn');
darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

darkModeBtn.addEventListener("click", function () {
  const icon = darkModeBtn.querySelector("svg");
  if (icon.classList.contains("bi-moon-stars")) {
    icon.classList.remove("bi-moon-stars");
    icon.classList.add("bi-brightness-high");
    darkModeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="30" fill="currentColor" class="bi bi-brightness-high" viewBox="0 0 16 16"><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/></svg>';
  }
  else {
    icon.classList.remove("bi-brightness-high");
    icon.classList.add("bi-moon-stars");
    darkModeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="30" fill="currentColor" class="bi bi-moon-stars" viewBox="0 0 16 16"><path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.858 1.311A7.269 7.269 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316 7.316 0 0 0 5.205-2.162c-.337.042-.68.063-1.029.063-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z"/><path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"/></svg>';

  }
});


const domainList = document.getElementById('domain-list');
document.getElementById('talos-button').addEventListener('click', (event) => {event.preventDefault();domainList.innerText='';checkdomain('talos');});
document.getElementById('spamhaus-button').addEventListener('click', (event) => {event.preventDefault();domainList.innerText='';checkdomain('spamhaus');});
document.getElementById('scamadviser-button').addEventListener('click', (event) => {event.preventDefault();domainList.innerText='';checkdomain('scamadviser');});
document.getElementById('mxtoolbar-button').addEventListener('click', (event) => {event.preventDefault();domainList.innerText='';checkdomain('mxtoolbar');});

document.getElementById('clear').addEventListener('click', (event) => {event.preventDefault();domainList.innerText='';});
document.getElementById('bulkblacklist').addEventListener('click', (event) => {
  event.preventDefault();
  domainList.innerText='';
   // Retrieve the user's current country
  fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
      const country = data.country_name;
      // alert('Your current country is ' + country);

      // Show the alert popup with the user's current country
      if (country!="Morocco"){
        // Create and append the iframe
        const iframe = document.createElement('iframe');
        iframe.src = "https://www.bulkblacklist.com/";
        iframe.width = "100%";
        iframe.height = "1000px";
        iframe.style.border = "none";
        iframe.style.position = "absolute";
        iframe.style.top = "40%";
        iframe.style.left = "0px";
        iframe.style.zIndex = "99999";
        // document.body.appendChild(iframe);
        domainList.appendChild(iframe);
      }
      else{
        alert('Sorry not suppored your country  ' + country);
      }
     
    })
    .catch(error => {
      console.error('Error:', error);
    });

   
      

});


function removeDuplicates(array) {
  return [...new Set(array)];
}
function namesheap() {
  var domains = document.getElementById('domain-input').value.replace(/\n/g, ',');
  var url = `https://www.namecheap.com/domains/registration/results/?type=beast&domain=${domains}`;
  window.open(url, '_blank');
}


function checkdomain(check) {
  const input = document.getElementById('domain-input');
  const domains = removeDuplicates(input.value.split('\n').filter(domain => domain.trim() !== ''));

  domains.forEach(domain => {
	const domainLine = document.createElement('li');
	const domainLink = document.createElement('a');
	switch (check) {
	  case 'talos':
		domainLink.href = `https://talosintelligence.com/reputation_center/lookup?search=${domain}`;
    domainLink.classList.add('text-primary');
		break;
	  case 'spamhaus':
		domainLink.href = `https://check.spamhaus.org/listed/?searchterm=${domain}`;
    domainLink.classList.add('text-success');
		break;
	  case 'scamadviser':
		domainLink.href = `https://www.scamadviser.com/check-website/${domain}`;
    domainLink.classList.add('text-danger');
    break;
    case 'mxtoolbar':
      domainLink.href = `https://mxtoolbox.com/SuperTool.aspx?action=mx%3a${domain}&run=toolpage`;
      domainLink.classList.add('text-warning');
      break;
    
      // https://www.namecheap.com/domains/registration/results/?type=beast&domain=

	  default:
		console.log('Invalid check value');
		return;
	}
	domainLink.target = '_blank';
	domainLink.classList.add('domain-line');
	domainLink.innerText = domain;
	domainLine.appendChild(domainLink);
	domainList.appendChild(domainLine);

	domainLink.addEventListener('click', () => {
	  // Copy the domain to the clipboard
	  const copyText = document.createElement('textarea');
	  copyText.textContent = domain;
	  document.body.appendChild(copyText);
	  copyText.select();
	  document.execCommand('copy');
	  document.body.removeChild(copyText);

	  // Remove the domain line
	  domainLine.remove();
	});
  });

  input.value = '';
}

   // Get the cookie banner and buttons
   const cookieBanner = document.getElementById("cookie-banner");
   const cookieSettings = document.getElementById("cookie-settings");
   const cookieAccept = document.getElementById("cookie-accept");

   // Check if the user has already accepted cookies
   if (localStorage.getItem("cookie-consent") === "true") {
     // Hide the cookie banner
     cookieBanner.style.display = "none";
   }

   // Show the cookie settings when the settings button is clicked
   cookieSettings.addEventListener("click", () => {
     // Add your code to open the cookie settings here
   });

   // Accept cookies and hide the cookie banner when the accept button is clicked
   cookieAccept.addEventListener("click", () => {
     // Set a local storage item to remember that the user has accepted cookies
     localStorage.setItem("cookie-consent", "true");
     // Hide the cookie banner
     cookieBanner.style.display = "none";
   });
// -------------------------------------
// suffl split
 function  shuffleSplit(){
  var textarea = document.getElementById("input-text");
  var lines = textarea.value.split("\n");
  
  // Remove empty lines
  lines = lines.filter(line => line.trim() !== '');
  
  for (var i = lines.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = lines[i];
    lines[i] = lines[j];
    lines[j] = temp;
  }
  
  var shuffledText = lines.join("\n");
  textarea.value = shuffledText;
  countLiness()

}


// prime
function fetchExchangeRate() {
  fetch('https://v6.exchangerate-api.com/v6/2fe8acc573bf7f482de7cbbe/latest/USD')
    .then(response => response.json())
    .then(data => {
      const rates = data.conversion_rates;
      const changeInput = document.getElementById('change-input');
      const exchangeRate = rates['MAD']; // Assuming you want to display the exchange rate for USD to MAD

      if (exchangeRate) {
        changeInput.value = exchangeRate.toFixed(2); // Display the exchange rate with 2 decimal places
      } else {
        alert('Exchange rate not available');
      }
    })
    .catch(error => {
      alert('Error fetching exchange rates:', error);
    });
}
const mailer =document.getElementById("mailer");
const tl =document.getElementById("tl");
const tl_div=document.getElementById("tl_div");
const mailer_div=document.getElementById("mailer_div");

tl.addEventListener('change', function () {
  tl_div.style.display = this.checked ? 'block' : 'none';
  mailer_div.style.display = this.checked ?  'none':'block';
});

mailer.addEventListener('change', function () {
  mailer_div.style.display = this.checked ? 'block' : 'none';
  tl_div.style.display = this.checked ?  'none':'block';
});

function calcule() {

  var before = Number(document.getElementById("before").value + '000');
  var beforepr = parseFloat(document.getElementById("beforepr").value/100);
  var after = Number(document.getElementById("after").value + '000');
  var afterpr = parseFloat(document.getElementById("afterpr").value/100);
  var tl_pr= parseFloat(document.getElementById("tl_pr").value/100);
  var primetl=parseFloat(document.getElementById("primetl").value/100);
  var prime = parseFloat(document.getElementById("prime").value.replace(/[\s\u202F$,]/g, '').trim(''));
  var usd = Number(document.getElementById("change-input").value);
  let TopModel = document.getElementById("model").checked;
  let NTopModel = document.getElementById("nmodel").checked;
  
  var primetop=0
  if(mailer.checked){
    if(TopModel){primetop=300}
    else if(NTopModel){primetop=0}
  
    if (prime < before) {
      res = (prime * beforepr * usd)+primetop;
    } 
    else if (prime >= after) {
      res = (prime * afterpr * usd)+primetop;
    }
   
  }
  else if(tl.checked){
    
    res = (prime * tl_pr * usd)+(primetl*3*usd);
  }
  if(res===NaN){
    document.getElementById("resultatcal").innerText="donne incorrect";
  }

  document.getElementById("resultatcal").innerText = res.toFixed(2)+" Dh"; // Update the result


  
  };

function copynot(){
  let outputText = document.getElementById("notepad-textarea");
  outputText.select();
  document.execCommand("copy");
  showNotification('Copied successfully!', 3000);
}
  
  // notpade
  function encodeMessage() {
    let message = document.getElementById('notepad-textarea').value;
    let key = document.getElementById('key').value || 0; // Use 0 if the key is empty
    document.getElementById('notepad-textarea').value = caesarCipher(message, parseInt(key));
    copynot();
}

function decodeMessage() {
    let message = document.getElementById('notepad-textarea').value;
    let key = document.getElementById('key').value || 0; // Use 0 if the key is empty
    document.getElementById('notepad-textarea').value = caesarCipher(message, -parseInt(key));
    copynot();
}

function caesarCipher(str, key) {
    key = (key % 26 + 26) % 26; // Ensure key is positive and within the range of the alphabet
    return str.replace(/[a-zA-Z]/g, function (char) {
        let offset = char.toUpperCase() === char ? 65 : 97; // ASCII code for 'A' or 'a'
        return String.fromCharCode((char.charCodeAt(0) - offset + key) % 26 + offset);
    });
}
  function decodeText() {
    // Get the textarea element
      const textarea = document.getElementById('notepad-textarea');

      // Get the text in the textarea
      let text = textarea.value;

      // Convert the text to lowercase
      text = text.toLowerCase();

      // Create a mapping of old characters to new characters
      const alphabetMapping = {'_':'_','-':'-','@':'@',' ':' ','b':'a','c':'b','d':'c','e':'d','f':'e','g':'f','h':'g','i':'h','j':'i','k':'j','l':'k','m':'l','n':'m','o':'n','p':'o','q':'p','r':'q','s':'r','t':'s','u':'t','v':'u','w':'v','x':'w','y':'x','z':'y','0':'z','3':'2','4':'3','5':'4','6':'5','7':'6','8':'7','9':'8','1':'9'};

      // Iterate over the text and replace each character with its corresponding new character
      let newText = '';
      for (const character of text) {
      newText = newText + alphabetMapping[character];   
      }

      // Set the new text in the textarea
      textarea.value = newText;
      copynot();

  }
  // Decode text function
  function codeText() {
      // Get the textarea element
      const textarea = document.getElementById('notepad-textarea');

      // Get the text in the textarea
      let text = textarea.value;

      // Convert the text to lowercase
      text = text.toLowerCase();

      // Create a mapping of old characters to new characters
      const alphabetMapping = {'_':'_','-':'-','@':'@',' ':' ','a':'b','b':'c','c':'d','d':'e','e':'f','f':'g','g':'h','h':'i','i':'j','j':'k','k':'l','l':'m','m':'n','n':'o','o':'p','p':'q','q':'r','r':'s','s':'t','t':'u','u':'v','v':'w','w':'x','x':'y','y':'z','z':'0','2':'3','3':'4','4':'5','5':'6','6':'7','7':'8','8':'9','9':'1'};

      // Iterate over the text and replace each character with its corresponding new character
      let newText = '';
      for (const character of text) {
      newText = newText + alphabetMapping[character];   
      }

      // Set the new text in the textarea
      textarea.value = newText;
      copynot();
  }
  // Check if these elements exist before trying to use them
  const notepadTextarea = document.getElementById('notepad-textarea');
  const clearNotepadButton = document.getElementById('clear-button');
  const copyNotepadButton = document.querySelector('#copy-button-note, .copy-button-note');
  
  // Save the text to local storage as the user types
  if (notepadTextarea) {
    notepadTextarea.addEventListener('input', () => {
      const text = notepadTextarea.value;
      localStorage.setItem('notepadText', text);
    });
  }
  
    // Retrieve the saved text from local storage when the page loads
    window.addEventListener('DOMContentLoaded', () => {
      if (notepadTextarea) {
        const savedText = localStorage.getItem('notepadText');
        if (savedText) {
          notepadTextarea.value = savedText;
        }
      }
    });
  
    // Clear the Notepad textarea and remove saved text from local storage
    if (clearNotepadButton && notepadTextarea) {
      clearNotepadButton.addEventListener('click', () => {
        notepadTextarea.value = '';
        localStorage.removeItem('notepadText');
      });
    }
  
    // Copy the text from the Notepad to the clipboard
    if (copyNotepadButton && notepadTextarea) {
      copyNotepadButton.addEventListener('click', () => {
        notepadTextarea.select();
        document.execCommand('copy');
      });
    }

     // Show the Notepad when Ctrl+Q is pressed
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'q') {
      event.preventDefault();
      // Get the offcanvas element and show it if it exists
      const offcanvas = document.getElementById('notepadOffcanvas');
      if (offcanvas) {
        const bsOffcanvas = new bootstrap.Offcanvas(offcanvas);
        bsOffcanvas.show();
      }
    }
  });
// ret random text
// Function to fetch random text from the internet
function getRandomText() {
  // Make an API request to the Loripsum API
  return fetch('https://baconipsum.com/api/?type=all-meat&paras=1')
    .then(response => response.text());
}

// Function to copy text to clipboard
function copyToClipboard(text) {
  // Create a temporary textarea element
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    // Copy the text to clipboard
    document.execCommand('copy');
    showNotification('Text copied successfully!', 3000);
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to copy text.', 3000);
  }
  
  // Clean up the temporary textarea element
  document.body.removeChild(textarea);
}

// Function to show notification
function showNotification(message, duration) {
  var notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '40%';
  notification.style.left = '50%';
  notification.style.transform = 'translate(-50%, -50%)';
  notification.style.backgroundColor = 'green';
  notification.style.color = 'white';
  notification.style.padding = '10px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '9999';
  document.body.appendChild(notification);

  setTimeout(function() {
    document.body.removeChild(notification);
  }, duration);
}

// Event listener for button click
$(document).on('click', '#btn, .random-text-btn', function() {
  getRandomText()
    .then(function(text) {
      // Replace the content of the textarea with the random text
      var cleanedText = text.replace(/\["|"\]/g, '');
      document.getElementById('text').value = cleanedText;
      
      // Copy the text to clipboard and show notification
      copyToClipboard(cleanedText);
    })
    .catch(function(error) {
      console.error('Error:', error);
      alert('Failed to fetch random text. Please try again later.');
    });
});

//extract email from page
function extractemailfromgmail(){
  var link="https://www.google.com/?gws_rd=ssl"
  // Find the Google Account element
  var accountElement = document.querySelector('a.gb_d[aria-label^="Google Account:"]');
  if (accountElement) {
    // Extract the email address from the aria-label attribute
    var email = accountElement.getAttribute('aria-label').match(/[\w.-]+@[\w.-]+\.[\w]{2,}/);
    if (email) {
      console.log(email[0]);
    } else {
      console.log("Email address not found.");
    }
  } else {
    console.log("Google Account element not found.");
  }
}




//extract word list
function extractWords() {
  // Get the input text and keyword
  var inputText = document.getElementById("text");
  var keyword = document.getElementById("keywordInput").value;

  // Create a regular expression to match the keyword
  var regex = new RegExp("\\b(" + keyword + "\\d*)\\b", "g");

  // Extract matching words
  var matches = inputText.value.match(regex);

  // Remove duplicates and sort the matches by the number in the last keyword
  var uniqueMatches = [...new Set(matches)].sort(function(a, b) {
    var numberA = parseInt(a.match(/\d+$/)[0]);
    var numberB = parseInt(b.match(/\d+$/)[0]);
    return numberA - numberB;
  });

  // Display extracted words
  if (uniqueMatches) {
    inputText.value = uniqueMatches.join('\n');
    document.getElementById("line-count").textContent = "Count: " + uniqueMatches.length;
  } else {
    document.getElementById("line-count").textContent = "Count: 0";
  }
}

//add or remove dot in email


function removedots() {
  checkinputText(document.getElementById("text").value );
  var newuser = "";
  var lines = document.getElementById('text').value.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (i == lines.length - 1) {
      newuser += lines[i].split('@')[0].replaceAll(".", "") + "@" + lines[i].split('@')[1];
    } else {
      newuser += lines[i].split('@')[0].replaceAll(".", "") + "@" + lines[i].split('@')[1] + "\n";
    }
  }
  document.getElementById('text').value = newuser;
}



function dotfunction() {
  checkinputText(document.getElementById("text").value );
  var lines = document.getElementById('text').value.split('\n');
  var newinput = "";

  for (let i = 0; i < lines.length; i++) {
    var email = lines[i];
    var username = email.split('@')[0];
    var domain = email.split('@')[1];
    var dotcount = username.split('.');

    if (((username.length) - dotcount.length) < dotcount.length) {
      newuser = username;
    } else {
      var usernamelength = (username.length) - 1;
      var rand = Math.floor(Math.random() * usernamelength);
      var tryname = 0;

      while ((username[rand] == "." || username[rand + 1] == ".") && tryname < usernamelength) {
        rand = Math.floor(Math.random() * usernamelength);

        if (username[rand] != "." && username[rand + 1] != ".") {
          break;
        }

        tryname++;
      }

      var newuser = "";
      for (let j = 0; j < usernamelength + 1; j++) {
        if (j == rand) {
          newuser += (username[j] + ".").replace("..", ".");
        } else {
          newuser += username[j];
        }
      }
    }

    if (i == lines.length - 1) {
      newinput += newuser.replace("..", ".") + "@" + domain;
    } else {
      newinput += newuser.replace("..", ".") + "@" + domain + "\n";
    }
  }
  document.getElementById('text').value = newinput;
}

// extract footer
async function extractFooter() {
  try {
      // Get the URL from the input
      var url = document.getElementById("url").value;

      // Use a CORS proxy to bypass CORS restrictions
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const response = await fetch(proxyUrl + url);

      // Check if the request was successful
      if (!response.ok) {
          throw new Error(`Failed to fetch. Status: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();

      // Extract the entire footer tag (customize this part based on the website structure)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const footer = doc.querySelector('footer');

      // Update the result textarea with the extracted footer content
      document.getElementById("text").value = footer ? footer.outerHTML : 'Footer not found';
  } catch (error) {
      console.error("Error:", error);
      alert(`An error occurred: ${error.message}. Check the console for more details.`);
  }
}



function processCSV(text) {
  // Get the selected delimiter from the dropdown
  const splitter = document.getElementById('Splitter').value;
  document.getElementById('text').value = "";

  const lines = text.split('\n');
  if (lines.length === 0) {
    alert("CSV is empty");
    return;
  }

  // Use the selected splitter to separate the header columns
  const headers = lines[0].split(splitter);

  // Try to find headers "Email" and "App Password" (with or without quotes)
  let emailIndex = headers.indexOf('"Email"');
  if (emailIndex === -1) {
    emailIndex = headers.indexOf('Email');
  }
  let appPasswordIndex = headers.indexOf('"App Password"');
  if (appPasswordIndex === -1) {
    appPasswordIndex = headers.indexOf('App Password');
  }

  if (emailIndex === -1 || appPasswordIndex === -1) {
    alert('CSV does not contain required headers.');
    return;
  }

  let resultText = '';
  let resultTextWithoutAppPassword = '';

  let emailWithAppPasswordCount = 0;
  let emailWithoutAppPasswordCount = 0;

  // Process each line after the header
  for (let i = 1; i < lines.length; i++) {
    // Skip empty lines
    if (lines[i].trim() === '') continue;

    const columns = lines[i].split(splitter);
    const email = columns[emailIndex] ? columns[emailIndex].replace(/"/g, '').trim() : '';
    const appPassword = columns[appPasswordIndex] ? columns[appPasswordIndex].replace(/"/g, '').trim() : '';

    if (email && appPassword) {
      resultText += `${email}    ${appPassword}\n`;
      emailWithAppPasswordCount++;
    } else if (email) {
      resultTextWithoutAppPassword += `${email}\n`;
      emailWithoutAppPasswordCount++;
    }
  }
  
  // Append emails without app passwords at the end
  resultText += resultTextWithoutAppPassword;

  // Set the result in the textarea with id 'text'
  document.getElementById('text').value = resultText;
  document.getElementById('csvFile').value = "";

  // Optionally, update counts on the page
  alert(`Emails with App Password: ${emailWithAppPasswordCount}\n Emails without App Password: ${emailWithoutAppPasswordCount}`);
  // document.getElementById('emailWithAppPasswordCount').innerText = `Emails with App Password: ${emailWithAppPasswordCount}`;
  // document.getElementById('emailWithoutAppPasswordCount').innerText = `Emails without App Password: ${emailWithoutAppPasswordCount}`;
}

// Handle file selection and reading
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    processCSV(text);
  };
  reader.readAsText(file);
}

// Trigger the file dialog when button is clicked
function openFileDialog() {
  document.getElementById('csvFile').click();
}

// Listen for file selection
document.getElementById('csvFile').addEventListener('change', handleFileSelect);