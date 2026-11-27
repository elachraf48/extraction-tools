// Custom alert function
function alert(type, message, confirmText) {
  // Create a Bootstrap alert or modal
  let alertHtml = '';
  
  if (type === 'aler') {
    // Create a Bootstrap modal for alerts
    alertHtml = `
      <div class="modal fade" id="customAlertModal" tabindex="-1" aria-labelledby="customAlertModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="customAlertModalLabel">Alert</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ${message}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal">${confirmText || 'OK'}</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Remove any existing alert modal
    const existingModal = document.getElementById('customAlertModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Add the modal to the DOM
    document.body.insertAdjacentHTML('beforeend', alertHtml);
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('customAlertModal'));
    modal.show();
  } else {
    // Fallback to browser's built-in alert
    window.alert(message);
  }
}