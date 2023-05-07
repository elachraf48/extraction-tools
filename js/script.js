function showSection(sectionId) {
  var sections = ["home", "ip-extraction", "split"];
  sections.forEach(function (item) {
    document.getElementById(item).style.display = (item === sectionId) ? "block" : "none";
  });
}

document.getElementById("input-text").value = "";

function splitText(buttonId) {
  const inputText = document.getElementById("input-text").value.trim();
  const sectionCount = parseInt(document.getElementById("lengths").value);
  const evenSections = document.getElementById("even-sections").checked;
  const outputContainer = document.getElementById("output-container");

  // Clear any previous output
  outputContainer.innerHTML = "";

  // Check for invalid input
  if (inputText.trim() === "") {
    outputContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
          Please enter some text.
        </div>
      `;
    return;
  }

  if (isNaN(sectionCount) || sectionCount < 1) {
    outputContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
          Please enter a valid number of sections.
        </div>
      `;
    return;
  }

  const inputLines = inputText.split("\n");
  const inputLineCount = inputLines.length;

  if (inputLineCount < sectionCount) {
    outputContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
          The number of sections is greater than the number of lines in the input text.
        </div>
      `;
    return;
  }

  let sectionSize = Math.floor(inputLineCount / sectionCount);
  let remainingLines = inputLineCount % sectionCount;
  let currentLineIndex = 0;
  let copyButtonCounter = 1;
  //split in textarea
  if (buttonId === 'area') {
    for (let i = 0; i < sectionCount; i++) {
      let currentSectionSize = sectionSize;
      if (evenSections && remainingLines > 0) {
        currentSectionSize++;
        remainingLines--;
      }

      let sectionLines = inputLines.slice(currentLineIndex, currentLineIndex + currentSectionSize);
      currentLineIndex += currentSectionSize;

      // Create a new textarea element for this section
      let outputTextarea = document.createElement("textarea");
      outputTextarea.classList.add("form-control", "mt-1");

      //outputTextarea.setAttribute("hidden", "true");

      outputTextarea.rows = 1;
      outputTextarea.value = sectionLines.join("\n");


      // Create a new "Copy" button for this textarea
      let copyButton = document.createElement("button");
      copyButton.classList.add("btn", "btn-outline-primary", "my-1");
      copyButton.textContent = "Copy " + copyButtonCounter;
      copyButton.addEventListener("click", function () {
        outputTextarea.select();
        document.execCommand("copy");
      });

      // Increment the copy button counter for the next button
      copyButtonCounter++;

      // Create a new div to hold the textarea and button
      let div = document.createElement("div");
      div.classList.add("input-group");
      div.appendChild(outputTextarea);
      div.appendChild(copyButton);
      // Create a new div to hold the textarea and button
      let div1 = document.createElement("div");
      div1.classList.add("col");
      div1.appendChild(div);

      // Create a new div to hold the textarea and button
      let div2 = document.createElement("div");
      div2.classList.add("row");
      div2.appendChild(div1);

      // Append the div to the output container
      outputContainer.appendChild(div2);
    }
  }
  //split in files txt
  else if (buttonId === 'txt') {
    // Get the input text and split it into lines
    // let inputText = document.getElementById('input-text').value;
    let inputLines = inputText.split(/\r?\n/);
    let inputLineCount = inputLines.length;

    // Get the number of sections and whether to split them evenly
    let sectionCount = parseInt(document.getElementById('lengths').value);
    let evenSections = document.getElementById('even-sections').checked;

    // Calculate the number of lines in each section and the remaining lines
    let currentSectionSize = Math.floor(inputLineCount / sectionCount);
    let remainingLines = inputLineCount % sectionCount;

    // Create an array to hold the sections of the input text
    let sections = [];
    let startLineIndex = 0;
    for (let i = 0; i < sectionCount; i++) {
      // Calculate the end line index for the current section
      let endLineIndex = startLineIndex + currentSectionSize - 1;
      if (evenSections && remainingLines > 0) {
        endLineIndex++;
        remainingLines--;
      }

      // Get the lines for the current section
      let sectionLines = inputLines.slice(startLineIndex, endLineIndex + 1);

      // Add the lines to the sections array
      sections.push(sectionLines);

      // Update the start line index for the next section
      startLineIndex = endLineIndex + 1;
    }

    // Create an array to hold the output files
    let outputFiles = [];

    // Loop through the sections and create a file for each one
    for (let i = 0; i < sections.length; i++) {
      // Create a Blob object from the section's lines
      let blob = new Blob([sections[i].join('\n')], { type: 'text/plain' });

      // Create a file object from the Blob
      let file = new File([blob], `output_${i + 1}.txt`);

      // Add the file to the outputFiles array
      outputFiles.push(file);
    }

    // Create a ZIP file containing the output files
    let zip = new JSZip();
    outputFiles.forEach((file, index) => {
      zip.file(`output_${index + 1}.txt`, file);
    });

    // Generate the ZIP file and save it
    zip.generateAsync({ type: 'blob' }).then((blob) => {
      saveAs(blob, 'output.zip');
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
function shuffleLines() {
  let text = document.getElementById("text").value;
  let lines = text.split("\n");
  lines = shuffleArray(lines);
  document.getElementById("text").value = lines.join("\n");
}

function copyText() {
  let outputText = document.getElementById("text");
  outputText.select();
  document.execCommand("copy");
}

function removeDuplicateLines() {
  let text = document.getElementById("text").value;
  let lines = text.split("\n").map(line => line.trim());
  lines = removeDuplicates(lines);
  document.getElementById("text").value = lines.join("\n");
  document.getElementById("line-count").innerHTML = "Number of lines: " + lines.length;

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
// Event listeners
function extractipv4() {
  var input = document.getElementById("text").value;
  var regex = /((?:[0-9]{1,3}\.){3}[0-9]{1,3})/g;
  var matches = input.match(regex);
  var uniqueMatches = [...new Set(matches)];
  document.getElementById("line-count").innerHTML = "Number of unique IP addresses: " + uniqueMatches.length;

  document.getElementById("text").value = uniqueMatches.join("\n");
}

function extractipv6() {
  var input = document.getElementById("text").value;
  var regex = /((?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})/g;
  var matches = input.match(regex);
  var uniqueMatches = [...new Set(matches)];
  document.getElementById("line-count").innerHTML = "Number of unique IP addresses: " + uniqueMatches.length;

  document.getElementById("text").value = uniqueMatches.join("\n");
}

function extractipv4_ipv6() {
  var input = document.getElementById("text").value;
  var ipv4regex = /((?:[0-9]{1,3}\.){3}[0-9]{1,3})/g;
  var ipv6regex = /((?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})/g;
  var ipv4matches = input.match(ipv4regex);
  var ipv6matches = input.match(ipv6regex);
  var allMatches = ipv4matches.concat(ipv6matches);
  var uniqueMatches = [...new Set(allMatches)];
  document.getElementById("line-count").innerHTML = "Number of unique IP addresses: " + uniqueMatches.length;

  document.getElementById("text").value = uniqueMatches.join("\n");
}
function extractDomain() {
  var text = document.getElementById("text").value;
  var regex = /(?:https?:\/\/)?(?:[a-z0-9-]+\.)+([a-z]{2,}(?:\.(?:com|net|org|edu|gov|mil|biz|info|io|me|tv|co|uk)))/ig;
  var matches = text.match(regex);
  var uniqueMatches = [...new Set(matches.map(match => match.replace(/^(https?:\/\/)?/, '')))];
  document.getElementById("line-count").innerHTML = "Number of unique Domain: " + uniqueMatches.length;
  document.getElementById("text").value = uniqueMatches.join("\n");
}


function extractsubDomain() {
  var text = document.getElementById("text").value;
  var regex = /([a-z0-9-]+\.)+(com|net|org|edu|gov|mil|biz|info|io|me|tv|co|uk)/ig;
  var matches = text.match(regex);
  var uniqueMatches = [...new Set(matches)];
  document.getElementById("line-count").innerHTML = "Number of unique SubDomain: " + uniqueMatches.length;
  document.getElementById("text").value = uniqueMatches.join("\n");
}



function extractAndRemoveDuplicateEmails() {
  // Get the input text
  let inputText = document.getElementById("text").value;

  // Extract email addresses
  let emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  let emailAddresses = inputText.match(emailRegex);

  // Remove duplicates
  let uniqueEmailAddresses = [...new Set(emailAddresses)];

  // Update the output text and line count
  let outputText = uniqueEmailAddresses.join("\n");
  document.getElementById("text").value = outputText;
}
function extractEmails() {
  var inputText = document.getElementById("text").value;
  var regex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  var emails = inputText.match(regex);
  var uniqueEmails = removeDuplicates(emails);
  var sortedEmails = sortEmailsByDomain(uniqueEmails);
  document.getElementById("text").value = sortedEmails.join("\n");
}

function extractEmailAndPassword() {
  var inputText = document.getElementById("text").value;
  var regex = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}):([A-Za-z0-9]+)/g;
  var emailAndPasswords = inputText.match(regex);
  var uniqueEmailAndPasswords = removeDuplicates(emailAndPasswords);
  var sortedEmailAndPasswords = sortEmailsByDomain(uniqueEmailAndPasswords);
  document.getElementById("text").value = sortedEmailAndPasswords.join("\n");
}

function extractGmail() {
  var inputText = document.getElementById("text").value;
  var regex = /[A-Za-z0-9._%+-]+@gmail\.com/g;
  var gmailEmails = inputText.match(regex);
  var uniqueGmailEmails = removeDuplicates(gmailEmails);
  document.getElementById("text").value = uniqueGmailEmails.join("\n");
}

function extractYahoo() {
  var inputText = document.getElementById("text").value;
  var regex = /[A-Za-z0-9._%+-]+@yahoo\.com/g;
  var yahooEmails = inputText.match(regex);
  var uniqueYahooEmails = removeDuplicates(yahooEmails);
  document.getElementById("text").value = uniqueYahooEmails.join("\n");
}

function extractHotmail() {
  var inputText = document.getElementById("text").value;
  var regex = /[A-Za-z0-9._%+-]+@hotmail\.com/g;
  var hotmailEmails = inputText.match(regex);
  var uniqueHotmailEmails = removeDuplicates(hotmailEmails);
  document.getElementById("text").value = uniqueHotmailEmails.join("\n");
}

function sortEmailsByDomain(emails) {
  return emails.sort(function (a, b) {
    var domainA = a.substring(a.lastIndexOf("@") + 1).toLowerCase();
    var domainB = b.substring(b.lastIndexOf("@") + 1).toLowerCase();
    if (domainA < domainB) return -1;
    if (domainA > domainB) return 1;
    return 0;
  });
}

function removeDuplicates(emails) {
  document.getElementById("text").value = '';
  document.getElementById("line-count").innerHTML = "Number of Email addresses: 0"
  var uniqueEmails = [];
  emails.forEach(function (email) {
    if (!uniqueEmails.includes(email)) {
      uniqueEmails.push(email);
    }
  });
  document.getElementById("line-count").innerHTML = "Number of Email addresses: " + uniqueEmails.length;
  return uniqueEmails;
}

$(document).ready(function () {
  $('#generate').click(function () {
    var length = $('#length').val();
    var uppercase = $('#uppercase').is(':checked');
    var lowercase = $('#lowercase').is(':checked');
    var numbers = $('#numbers').is(':checked');
    var symbols = $('#symbols').is(':checked');
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
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    $('#result-GN').val(result);
    $('#result-GN').select();
    // $('#count').text(result.length);
  });

  $('#copy').click(function () {
    $('#result-GN').select();
    document.execCommand('copy');
  });
});
$(document).ready(function () {
  var lengthInput = $('#length');
  var incrementButton = $('#increment');
  var decrementButton = $('#decrement');

  incrementButton.click(function () {
    lengthInput.val(parseInt(lengthInput.val()) + 1);
  });

  decrementButton.click(function () {
    lengthInput.val(Math.max(parseInt(lengthInput.val()) - 1, 1));
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
  a.click();
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

