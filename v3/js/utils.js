// Helper functions for text manipulation

// Helper function to remove special characters except '-'
function removeSpecialCharacters(text) {
  // Define the regex pattern for special characters (except '-')
  const specialCharsRegex = /[^a-zA-Z0-9\s_]/g;

  // Replace special characters (except '-') with an empty string
  return text.replace(specialCharsRegex, '');
}

// Helper function to remove special characters
function removedotanddollar(text) {
  // Define the regex pattern for special characters
  const specialCharsRegex = /[@.$]/g;

  // Replace special characters with an empty string
  return text.replace(specialCharsRegex, '');
}

// Helper function to remove domains
function removeDomains(text) {
  // Define the regex pattern for domain names
  const domainNameRegex = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi;

  // Remove domain names from the text
  return text.replace(domainNameRegex, '');
}

// Helper function to remove empty lines
function removeEmptyLinesFromContent(text) {
  // Define the regex pattern for empty lines
  const emptyLinesRegex = /^\s*$/gm;

  // Remove empty lines from the text
  return text.replace(emptyLinesRegex, '');
}

// Email processing function
function updateEmails() {
  // Get the value from the textarea
  let inputText = document.getElementById('text').value;
  
  // Split the input text into lines
  let lines = inputText.split('\n');

  // Process each line
  let processedLines = lines.map(line => {
      // Remove everything before the last occurrence of '_smtp_'
      line = line.replace(/.*?_smtp_/, '');
      
      // Replace '_smtp_gmail_com' with '@gmail.com'
      line = line.replace('_smtp_gmail_com', '@gmail.com');
      line = line.replace('_smtp_googlemail_com', '@googlemail.com');
      line = line.replace(/_/g, '.');

      return line;
  });

  // Join the processed lines back into a single string
  let result = processedLines.join('\n');

  // Set the value back to the textarea
  document.getElementById('text').value = result;
}

// File handling functions
function handleFiles(e) {
  fileContents = [];
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    document.getElementById('loadingGif').style.display = 'block';

    const fileCount = files.length;
    document.getElementById('outputAlert').innerText = `Files merged and downloaded successfully! ${fileCount}`;
    readFiles(0, files); // Start reading the files
  } else {
    document.getElementById('resultTextContainer').style.display = 'none';
    document.getElementById('outputAlert').innerText = 'No files selected.';
  }
}

function readFiles(index, files) { // Pass the index and files as parameters
  const check = document.getElementById('sep').checked;

  if (index >= files.length) {
    if (check) {
      mergedContent = fileContents.join("\n__SEP__\n");
      mergeAndDownloadFiles();
    }
    else {
      mergedContent = fileContents.join("\n");
      mergeAndDownloadFiles();
    }

  } else {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
      const content = e.target.result;
      fileContents.push(content);
      readFiles(index + 1, files); // Call the function recursively with updated index
    };
    fileReader.onerror = function (e) {
      alert('Error reading file: ', e);
      readFiles(index + 1, files); // Call the function recursively with updated index
    };
    fileReader.readAsText(files[index]);
  }
}

function mergeAndDownloadFiles() {
  const check = document.getElementById('sep').checked;
  const removeSpecialCharacter = document.getElementById('spescialcaractir').checked;
  const removenotdolaar = document.getElementById('notdolaar').checked;
  const removeDomain = document.getElementById('domainsite').checked;
  const removeEmptyLines = document.getElementById('emptyline').checked;

  let mergedContent = '';
  if (check) {
    // Merge the file contents with separator "__SEP__"
    mergedContent = fileContents.join("\n__SEP__\n");
  } else {
    // Just join all lines of each file without any separators between them
    mergedContent = fileContents.join("\n");
  }

  // Remove special characters if the checkbox is checked
  if (removeSpecialCharacter) {
    mergedContent = removeSpecialCharacters(mergedContent);
  }
  if (removenotdolaar) {
    mergedContent = removedotanddollar(mergedContent);
  }

  // Remove domain if the checkbox is checked
  if (removeDomain) {
    mergedContent = removeDomains(mergedContent);
  }

  // Remove empty lines if the checkbox is checked
  if (removeEmptyLines) {
    mergedContent = removeEmptyLinesFromContent(mergedContent);
  }
  // Download the modified content as a text file
  const downloadLink = document.createElement('a');
  downloadLink.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(mergedContent);
  downloadLink.download = 'after_split.txt';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // Hide loading GIF and show success message
  document.getElementById('loadingGif').style.display = 'none';
  mergedContent = ''; // Reset the merged content
  document.getElementById('resultTextContainer').style.display = 'block';

  const resultTextContainer = document.getElementById('resultTextContainer');

  resultTextContainer.classList.add('show');
  resultTextContainer.classList.remove('hide');

  // Hide the result text after 3 seconds
  setTimeout(() => {
    resultTextContainer.classList.add('hide');
  }, 3000);
}

// Initialize event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  var currentYear = new Date().getFullYear();
  if (document.getElementById("currentYears")) {
    document.getElementById("currentYears").textContent = currentYear;
  }
  
  // Add event listener for file input
  if (document.getElementById('fileInputsw')) {
    document.getElementById('fileInputsw').addEventListener('change', handleFiles);
  }
  
  // Add event listener for file input 50
  if (document.getElementById("fileInputsw50")) {
    document.getElementById("fileInputsw50").addEventListener("change", handleFiles50);
  }
  
  // Add event listener for enable input checkbox
  if (document.getElementById('enableInput')) {
    document.getElementById('enableInput').addEventListener('change', function () {
      const textInput = document.getElementById('nameInput');
      if (this.checked) {
        textInput.disabled = false;
      } else {
        textInput.disabled = true;
      }
    });
  }
});

// Functions for handling files with 50 lines
function handleFiles50(e) {
  const file = e.target.files[0];
  if (file) {
    splitFiles(file);
  } else {
    alert("No file selected.");
  }
}

function splitFiles(file) {
  const number = parseInt(document.getElementById("number50").value);
  if (!isNaN(number) && number > 0) {
    const reader = new FileReader();
    reader.onload = function () {
      const content = reader.result;
      const lines = content.split("\n");
      const splitContent = [];

      document.getElementById('loadingGif').style.display = 'block';
      document.getElementById('outputAlert').innerText = `Files Split and downloaded successfully! `;
      for (let i = 0; i < lines.length; i += number) {
        splitContent.push(lines.slice(i, i + number).join("\n"));
      }
      createZips(splitContent);
    };
    reader.readAsText(file);
  } else {
    alert("Invalid number of lines.");
  }
}

function createZips(splitContent) {
  let namefile = ' ';
  enableInput = document.getElementById('enableInput').checked;
  const nameInput = document.getElementById('nameInput');
  // Remove domain if the checkbox is checked
  if (enableInput) {
    namefile = nameInput.value;
  }
  else {
    namefile = 'part';
  }

  const zip = new JSZip();
  for (let i = 0; i < splitContent.length; i++) {
    zip.file(`${namefile}_${i + 1}.txt`, splitContent[i]);
  }
  zip.generateAsync({ type: "blob" }).then(function (content) {
    downloadZips(content);
  });
}

function downloadZips(zipBlob) {
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(zipBlob);
  downloadLink.download = "split_files.zip";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  // Hide loading GIF and show success message
  document.getElementById('loadingGif').style.display = 'none';
  document.getElementById('resultTextContainer').style.display = 'block';

  const resultTextContainer = document.getElementById('resultTextContainer');

  resultTextContainer.classList.add('show');
  resultTextContainer.classList.remove('hide');

  // Hide the result text after 3 seconds
  setTimeout(() => {
    resultTextContainer.classList.add('hide');
  }, 3000);
}

// PDF to text conversion functions
function convertpdf() {
  // Hide the convertpdf button and show the loading GIF
  document.getElementById('loadingGif').style.display = 'block';

  var lignsinfile = parseInt(document.getElementById('lignsinfile').value);
  var wordsinlign = Math.floor(Math.random() * (12 - 7 + 1)) + 7;

  const files = document.getElementById('pdffile').files;
  const pdf2text = new Pdf2TextClassp();
  pdf2text.pdfToText(files, function (text) {

    // Remove URLs/domains
    text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');

    // Remove special characters
    text = text.replace(/[^0-9a-zA-Z ]+/g, ' ');

    const words = text.split(/\s+/);

    let content = "";
    let w = 0;
    let l = 0;
    let n = 1;
    let zip = new JSZip();
    let folder = zip.folder("text-files");

    for (let i = 0; i < words.length; i++) {
      content += words[i] + " ";
      w++;

      if (w == wordsinlign) {
        content += "\n";
        w = 0;
        wordsinlign = Math.floor(Math.random() * (11 - 7 + 1)) + 7;

        l++;

        if (l == lignsinfile) {
          folder.file(`text-${n}.txt`, content);
          n++;
          l = 0;
          content = "";
        }
      }
    }

    if (content.length > 0) {
      folder.file(`text-${n}.txt`, content);
    }

    zip.generateAsync({ type: "blob" }).then(function (content) {
      // Hide the loading GIF and show the result text container
      document.getElementById('loadingGif').style.display = 'none';
      document.getElementById('resultTextContainer').style.display = 'block';
      const resultTextContainer = document.getElementById('resultTextContainer');
      resultTextContainer.classList.add('show');
      resultTextContainer.classList.remove('hide');

      // Display the result text
      const outputAlert = document.getElementById('outputAlert');
      outputAlert.innerText = 'Task donne \n';
      saveAspdf(content, "textfiles.zip");
      // Hide the result text after 3 seconds
      setTimeout(() => {
        resultTextContainer.classList.add('hide');
      }, 3000);
    });
  });
}

function Pdf2TextClassp() {
  this.pdfToText = function (files, callback) {
    let total = files.length;
    let complete = 0;
    let layers = {};

    for (let j = 0; j < files.length; j++) {
      const file = files[j];
      const reader = new FileReader();

      reader.onload = function () {
        const loadingTask = pdfjsLib.getDocument(reader.result);

        loadingTask.promise.then(function (pdf) {
          let numPages = pdf.numPages;
          let pageNumber = 1;

          pdf.getPage(pageNumber).then(function (page) {
            page.getTextContent().then(function (textContent) {
              let pageText = "";

              for (let i = 0; i < textContent.items.length; i++) {
                const item = textContent.items[i];
                pageText += item.str;
              }

              layers[j] = pageText;

              complete++;
              if (complete == total) {
                let fullText = "";

                for (let k = 0; k < total; k++) {
                  if (layers[k] !== undefined) {
                    fullText += layers[k];
                  }
                }

                callback(fullText);
              }
            });
          });
        }).catch(function (error) {
          console.log(`Error loading PDF: ${error.message}`);
          complete++;
          if (complete == total) {
            let fullText = "";
            for (let k = 0; k < total; k++) {
              if (layers[k] !== undefined) {
                fullText += layers[k];
              }
            }
            callback(fullText);
          }
        });
      };

      reader.readAsArrayBuffer(file);
    }
  };
}

function saveToFilepdf(text, filename) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function saveAspdf(blob, filename) {
  if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
    navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    if (typeof link.download !== 'undefined') {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}