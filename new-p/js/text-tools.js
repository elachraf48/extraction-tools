// Text Tools Functionality
document.addEventListener('DOMContentLoaded', function() {
  // File Merger
  const mergeFilesInput = document.getElementById('merge-files');
  const mergeBtn = document.getElementById('merge-btn');
  
  mergeBtn.addEventListener('click', () => {
    mergeFilesInput.click();
  });
  
  mergeFilesInput.addEventListener('change', handleMergeFiles);
  
  // File Splitter
  const splitFileInput = document.getElementById('split-file');
  const splitBtn = document.getElementById('split-btn');
  const splitLinesInput = document.getElementById('split-lines');
  const decrementSplit = document.getElementById('decrement-split');
  const incrementSplit = document.getElementById('increment-split');
  const customNameCheckbox = document.getElementById('custom-name-checkbox');
  const filePrefixInput = document.getElementById('file-prefix');
  
  splitBtn.addEventListener('click', () => {
    splitFileInput.click();
  });
  
  splitFileInput.addEventListener('change', handleSplitFile);
  
  decrementSplit.addEventListener('click', () => {
    if (splitLinesInput.value > 1) {
      splitLinesInput.value--;
    }
  });
  
  incrementSplit.addEventListener('click', () => {
    splitLinesInput.value++;
  });
  
  customNameCheckbox.addEventListener('change', () => {
    filePrefixInput.disabled = !customNameCheckbox.checked;
  });
  
  // PDF Converter
  const pdfFilesInput = document.getElementById('pdf-files');
  const pdfBtn = document.getElementById('pdf-btn');
  const pdfLinesInput = document.getElementById('pdf-lines');
  
  pdfBtn.addEventListener('click', () => {
    pdfFilesInput.click();
  });
  
  pdfFilesInput.addEventListener('change', handlePdfFiles);
});

async function handleMergeFiles(e) {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  
  const sepChecked = document.getElementById('sep-checkbox').checked;
  const specialCharsChecked = document.getElementById('special-chars-checkbox').checked;
  const dotsChecked = document.getElementById('dots-checkbox').checked;
  const domainsChecked = document.getElementById('domains-checkbox').checked;
  const emptyLinesChecked = document.getElementById('empty-lines-checkbox').checked;
  
  try {
    let mergedContent = '';
    
    for (const file of files) {
      const content = await readFileAsText(file);
      mergedContent += content + (sepChecked ? '\n__SEP__\n' : '\n');
    }
    
    // Apply filters
    if (specialCharsChecked) {
      mergedContent = mergedContent.replace(/[^a-zA-Z0-9\s_-]/g, '');
    }
    
    if (dotsChecked) {
      mergedContent = mergedContent.replace(/[@.$]/g, '');
    }
    
    if (domainsChecked) {
      mergedContent = mergedContent.replace(/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi, '');
    }
    
    if (emptyLinesChecked) {
      mergedContent = mergedContent.replace(/^\s*[\r\n]/gm, '');
    }
    
    // Download merged file
    downloadTextFile(mergedContent, 'merged_files.txt');
    
    showToast('Files merged successfully!', 'success');
  } catch (error) {
    showToast('Error merging files: ' + error.message, 'error');
    console.error(error);
  }
}

async function handleSplitFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const linesPerFile = parseInt(document.getElementById('split-lines').value);
  const useCustomName = document.getElementById('custom-name-checkbox').checked;
  const filePrefix = document.getElementById('file-prefix').value || 'part';
  
  try {
    const content = await readFileAsText(file);
    const lines = content.split('\n');
    const chunks = [];
    
    for (let i = 0; i < lines.length; i += linesPerFile) {
      chunks.push(lines.slice(i, i + linesPerFile).join('\n'));
    }
    
    if (chunks.length === 0) {
      showToast('No content to split', 'warning');
      return;
    }
    
    // Create zip file
    const zip = new JSZip();
    chunks.forEach((chunk, index) => {
      zip.file(`${filePrefix}_${index + 1}.txt`, chunk);
    });
    
    const zipContent = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipContent, 'split_files.zip');
    
    showToast(`File split into ${chunks.length} parts`, 'success');
  } catch (error) {
    showToast('Error splitting file: ' + error.message, 'error');
    console.error(error);
  }
}

async function handlePdfFiles(e) {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  
  const linesPerFile = parseInt(document.getElementById('pdf-lines').value);
  
  try {
    // Initialize PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
    
    const zip = new JSZip();
    let fileCount = 0;
    
    for (const file of files) {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(' ');
      }
      
      // Process text
      fullText = fullText.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
                         .replace(/[^0-9a-zA-Z ]+/g, ' ');
      
      const words = fullText.split(/\s+/);
      let currentFileContent = '';
      let lineCount = 0;
      let fileIndex = 1;
      
      for (let i = 0; i < words.length; i++) {
        currentFileContent += words[i] + ' ';
        
        if (i > 0 && i % 7 === 0) { // Roughly 7 words per line
          currentFileContent += '\n';
          lineCount++;
          
          if (lineCount >= linesPerFile) {
            zip.file(`${file.name.replace('.pdf', '')}_${fileIndex}.txt`, currentFileContent);
            fileIndex++;
            fileCount++;
            currentFileContent = '';
            lineCount = 0;
          }
        }
      }
      
      // Add remaining content
      if (currentFileContent.trim().length > 0) {
        zip.file(`${file.name.replace('.pdf', '')}_${fileIndex}.txt`, currentFileContent);
        fileCount++;
      }
    }
    
    if (fileCount === 0) {
      showToast('No content extracted from PDFs', 'warning');
      return;
    }
    
    const zipContent = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipContent, 'pdf_texts.zip');
    
    showToast(`Extracted ${fileCount} text files from PDFs`, 'success');
  } catch (error) {
    showToast('Error processing PDFs: ' + error.message, 'error');
    console.error(error);
  }
}

// Helper functions
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function downloadTextFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}