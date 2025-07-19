// DOM Elements
const extractorInput = document.getElementById('extractor-input');
const extractorResults = document.getElementById('extractor-results');
const extractButtons = document.querySelectorAll('.extract-btn');
const clearTextBtn = document.getElementById('clear-text');
const pasteTextBtn = document.getElementById('paste-text');
const downloadResultsBtn = document.getElementById('download-results');
const copyResultsBtn = document.getElementById('copy-results');
const resultsCount = document.getElementById('results-count');
const resultsTime = document.getElementById('results-time');

// Regular Expressions
const REGEX = {
  EMAIL: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
  GMAIL: /([a-zA-Z0-9._-]+@gmail\.com)/gi,
  YAHOO: /([a-zA-Z0-9._-]+@yahoo\.com)/gi,
  EMAIL_PASS: /([^:\s]+:[^@\s]+@[^\s]+)/gi,
  IPV4: /(\b25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}\b/gi,
  IPV6: /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/gi,
  DOMAIN: /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi,
  SUBDOMAIN: /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.){2,}[a-z]{2,}\b/gi
};

// Extract data based on type
function extractData(type) {
  const startTime = performance.now();
  const text = extractorInput.value;
  let matches = [];
  
  switch(type) {
    case 'email':
      matches = text.match(REGEX.EMAIL) || [];
      break;
    case 'gmail':
      matches = text.match(REGEX.GMAIL) || [];
      break;
    case 'yahoo':
      matches = text.match(REGEX.YAHOO) || [];
      break;
    case 'email-pass':
      matches = text.match(REGEX.EMAIL_PASS) || [];
      break;
    case 'ipv4':
      matches = text.match(REGEX.IPV4) || [];
      break;
    case 'ipv6':
      matches = text.match(REGEX.IPV6) || [];
      break;
    case 'domain':
      matches = text.match(REGEX.DOMAIN) || [];
      // Remove duplicates and sort
      matches = [...new Set(matches)].sort();
      break;
    case 'subdomain':
      matches = text.match(REGEX.SUBDOMAIN) || [];
      // Remove duplicates and sort
      matches = [...new Set(matches)].sort();
      break;
    default:
      matches = [];
  }
  
  // Remove duplicates for email types
  if (type.includes('email') && !type.includes('email-pass')) {
    matches = [...new Set(matches)];
  }
  
  const endTime = performance.now();
  const processingTime = (endTime - startTime).toFixed(2);
  
  // Update UI
  extractorResults.value = matches.join('\n');
  resultsCount.textContent = `${matches.length} items found`;
  resultsTime.textContent = `Processed in ${processingTime}ms`;
}

// Clear text
clearTextBtn.addEventListener('click', () => {
  extractorInput.value = '';
  extractorResults.value = '';
  resultsCount.textContent = '0 items found';
  resultsTime.textContent = 'Processed in 0ms';
});

// Paste text
pasteTextBtn.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    extractorInput.value = text;
  } catch (err) {
    alert('Failed to read clipboard contents. Please paste manually.');
  }
});

// Download results
downloadResultsBtn.addEventListener('click', () => {
  if (!extractorResults.value) {
    alert('No results to download');
    return;
  }
  
  const blob = new Blob([extractorResults.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'extracted-data.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Copy results to clipboard
copyResultsBtn.addEventListener('click', async () => {
  if (!extractorResults.value) {
    alert('No results to copy');
    return;
  }
  
  try {
    await navigator.clipboard.writeText(extractorResults.value);
    const originalText = copyResultsBtn.innerHTML;
    copyResultsBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
      copyResultsBtn.innerHTML = originalText;
    }, 2000);
  } catch (err) {
    alert('Failed to copy results');
  }
});

// Handle extract button clicks
extractButtons.forEach(button => {
  button.addEventListener('click', () => {
    const type = button.getAttribute('data-type');
    extractData(type);
  });
});