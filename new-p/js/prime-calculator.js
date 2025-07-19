// Prime Calculator Functionality
document.addEventListener('DOMContentLoaded', function() {
  const primeForm = document.getElementById('prime-form');
  const mailerOptions = document.getElementById('mailer-options');
  const tlOptions = document.getElementById('tl-options');
  const mailerType = document.getElementById('mailer-type');
  const tlType = document.getElementById('tl-type');
  const fetchRateBtn = document.getElementById('fetch-rate');
  const calculateBtn = document.getElementById('calculate-prime');
  const primeResult = document.getElementById('prime-result');
  
  // Toggle between mailer and TL options
  mailerType.addEventListener('change', () => {
    mailerOptions.style.display = 'block';
    tlOptions.style.display = 'none';
  });
  
  tlType.addEventListener('change', () => {
    mailerOptions.style.display = 'none';
    tlOptions.style.display = 'block';
  });
  
  // Fetch exchange rate (simulated)
  fetchRateBtn.addEventListener('click', () => {
    fetchRateBtn.disabled = true;
    fetchRateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
    
    // Simulate API call
    setTimeout(() => {
      const randomRate = (Math.random() * 2 + 9).toFixed(2); // Random rate between 9 and 11
      document.getElementById('exchange-rate').value = randomRate;
      fetchRateBtn.disabled = false;
      fetchRateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Get Rate';
      showToast('Exchange rate updated', 'success');
    }, 1000);
  });
  
  // Calculate prime
  calculateBtn.addEventListener('click', calculatePrime);
  
  function calculatePrime() {
    const primeAmount = parseFloat(document.getElementById('prime-amount').value) || 0;
    const exchangeRate = parseFloat(document.getElementById('exchange-rate').value) || 1;
    const isMailer = document.getElementById('mailer-type').checked;
    
    let resultAmount = 0;
    let calculationMethod = '';
    
    if (isMailer) {
      const lessThan = parseFloat(document.getElementById('less-than').value) || 20;
      const lessThanPercent = parseFloat(document.getElementById('less-than-percent').value) || 2;
      const moreThan = parseFloat(document.getElementById('more-than').value) || 20;
      const moreThanPercent = parseFloat(document.getElementById('more-than-percent').value) || 2.5;
      const isModelEmployee = document.getElementById('model-employee').checked;
      
      const threshold = moreThan * 1000;
      const percentage = primeAmount < threshold ? lessThanPercent : moreThanPercent;
      
      // Model employees get 10% bonus
      const bonus = isModelEmployee ? 1.1 : 1;
      
      resultAmount = (primeAmount * exchangeRate * percentage / 100) * bonus;
      calculationMethod = `Mailer (${percentage}%) ${isModelEmployee ? 'with model bonus' : ''}`;
    } else {
      const tlPercent = parseFloat(document.getElementById('tl-percent').value) || 1.5;
      const tlPrime = parseFloat(document.getElementById('tl-prime').value) || 0;
      
      resultAmount = (tlPrime * exchangeRate) + (primeAmount * exchangeRate * tlPercent / 100);
      calculationMethod = `Team Leader (${tlPercent}%)`;
    }
    
    primeResult.innerHTML = `
      <strong>Calculated Prime:</strong> $${resultAmount.toFixed(2)}<br>
      <small>${calculationMethod}</small>
    `;
    primeResult.style.display = 'block';
  }
});