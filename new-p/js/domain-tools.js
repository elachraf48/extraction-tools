// Domain Tools Functionality
document.addEventListener('DOMContentLoaded', function() {
  const domainInput = document.getElementById('domain-input');
  const clearDomainsBtn = document.getElementById('clear-domains');
  const checkTalosBtn = document.getElementById('check-talos');
  const checkSpamhausBtn = document.getElementById('check-spamhaus');
  const checkMxtoolboxBtn = document.getElementById('check-mxtoolbox');
  const domainResults = document.getElementById('domain-results');
  const domainCount = document.getElementById('domain-count');
  
  clearDomainsBtn.addEventListener('click', () => {
    domainInput.value = '';
    domainResults.innerHTML = '';
    domainCount.textContent = '0 domains';
  });
  
  checkTalosBtn.addEventListener('click', () => {
    const domains = getDomainsFromInput();
    if (domains.length === 0) return;
    
    domainResults.innerHTML = '';
    checkDomains(domains, 'talos');
  });
  
  checkSpamhausBtn.addEventListener('click', () => {
    const domains = getDomainsFromInput();
    if (domains.length === 0) return;
    
    domainResults.innerHTML = '';
    checkDomains(domains, 'spamhaus');
  });
  
  checkMxtoolboxBtn.addEventListener('click', () => {
    const domains = getDomainsFromInput();
    if (domains.length === 0) return;
    
    domainResults.innerHTML = '';
    checkDomains(domains, 'mxtoolbox');
  });
  
  // Update domain count when input changes
  domainInput.addEventListener('input', () => {
    const domains = getDomainsFromInput();
    domainCount.textContent = `${domains.length} domains`;
  });
});

function getDomainsFromInput() {
  const input = document.getElementById('domain-input').value.trim();
  if (!input) return [];
  
  return input.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

function checkDomains(domains, service) {
  const domainCount = document.getElementById('domain-count');
  domainCount.textContent = `Checking ${domains.length} domains...`;
  
  domains.forEach((domain, index) => {
    const domainCard = document.createElement('div');
    domainCard.className = 'domain-card';
    domainCard.innerHTML = `
      <div class="domain-header">
        <span class="domain-name">${domain}</span>
        <span class="domain-status">Checking...</span>
      </div>
      <div class="domain-progress"></div>
    `;
    
    document.getElementById('domain-results').appendChild(domainCard);
    
    // Simulate checking (in a real app, you'd make API calls)
    setTimeout(() => {
      const status = getRandomStatus();
      const statusClass = status === 'Listed' ? 'danger' : status === 'Clean' ? 'success' : 'warning';
      
      domainCard.querySelector('.domain-status').textContent = status;
      domainCard.querySelector('.domain-status').className = `domain-status ${statusClass}`;
      
      const progressBar = domainCard.querySelector('.domain-progress');
      progressBar.className = `domain-progress ${statusClass}`;
      progressBar.style.width = '100%';
      
      if (index === domains.length - 1) {
        domainCount.textContent = `${domains.length} domains checked`;
      }
    }, 500 + (index * 300));
  });
}

function getRandomStatus() {
  const rand = Math.random();
  if (rand > 0.8) return 'Listed';
  if (rand > 0.5) return 'Clean';
  return 'Unknown';
}