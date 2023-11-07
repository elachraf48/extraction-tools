function showSection(sectionId) {
  var sections = ["home", "ip-extraction","texttool", "split", "checkdomain","prime"];
  sections.forEach(function (item) {
    var navLink = document.getElementById(item + "-nav-link");
    var section = document.getElementById(item);
    toggleCollapse();
    if (item === sectionId) {
      navLink.classList.add("active");
      section.style.display = "block";
    } else {
      navLink.classList.remove("active");
      section.style.display = "none";
    }
  });
  alert('la')
  showModal(sectionId);
}
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
const randomCheckbox = document.getElementById('random');
const generateRandomDiv = document.getElementById('generat_random');
const ip_extraction_lite= document.getElementById('ip-extraction-lite');
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
function getSectionInfo(section) {
  switch (section) {
    case 'home':
      return {
        title: 'About',
        description: 'This is the About section. It provides general information about the website.'
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
    const modalBody = modal.querySelector('.modal-body');
    const sectionTitle = modal.querySelector('.modal-title');
    const sectionInfo = getSectionInfo(section);

    sectionTitle.innerText = sectionInfo.title;
    modalBody.innerHTML = sectionInfo.description;

    $(modal).modal('show');
    localStorage.setItem(section, 'visited');
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
      var matches = dialogueContent.match(/(?:https?:\/\/)?(?:[a-z0-9-]+\.)+([a-z]{2,}(?:\.(?:com|net|org|edu|gov|mil|biz|info|io|me|tv|co|uk|club|online|xyz)))/ig);
      var uniqueMatches = [...new Set(matches.map(match => match.replace(/^(https?:\/\/)?/, '')))].filter(domain => domain.length > 0);
      checkinputText(dialogueContent);

      document.getElementById("line-count").innerHTML = "Number of unique Domain: " + uniqueMatches.length;
      downloadResult(uniqueMatches.join("\n"), file);
      fileInput.value = "";
    };

    reader.readAsText(file);
  } else {
    var text = textarea.value;
    var matches = text.match(/(?:https?:\/\/)?(?:[^./]+\.)?([a-z0-9-]+\.[a-z]{2,}(?:\.(?:com|net|org|edu|gov|mil|biz|info|io|me|tv|co|uk|club|online|xyz)))/ig);
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
}
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
      var matches = dialogueContent.match(/([a-z0-9-]+\.)+(com|net|org|edu|gov|mil|biz|info|io|me|tv|co|uk|club|online|xyz)/ig);
      var uniqueMatches = [...new Set(matches)];
      checkinputText(dialogueContent);

      document.getElementById("line-count").innerHTML = "Number of unique SubDomain: " + uniqueMatches.length;
      downloadResult(uniqueMatches.join("\n"), file);
      fileInput.value = "";
    };

    reader.readAsText(file);
  } else {
    var text = textarea.value;
    var matches = text.match(/([a-z0-9-]+\.)+(com|net|org|edu|gov|mil|biz|info|io|me|tv|co|uk|club|online|xyz)/ig);
    var uniqueMatches = [...new Set(matches)];
    checkinputText(text);

    document.getElementById("line-count").innerHTML = "Number of unique SubDomain: " + uniqueMatches.length;
    textarea.value = uniqueMatches.join("\n");
  }
}

function extractEmails() {
  var fileInput = document.getElementById("inputGroupFile01");
  var textarea = document.getElementById("text");

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
    var regex = /[A-Za-z0-9._%+-]+@(gmail\.com|googlemail\.com)/g;
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
  var regex = /[A-Za-z0-9._%+-]+@(gmail\.com|googlemail\.com)/g;
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
    document.execCommand('copy');
    showNotification('Random copied successfully!', 3000);

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



  // notpade
  const textarea = document.getElementById('notepad-textarea');
    const clearButton = document.getElementById('clear-button');
    const copyButton = document.getElementById('copy-button-note');
  
    // Save the text to local storage as the user types
    textarea.addEventListener('input', () => {
      const text = textarea.value;
      localStorage.setItem('notepadText', text);
    });
  
    // Retrieve the saved text from local storage when the page loads
    window.addEventListener('DOMContentLoaded', () => {
      const savedText = localStorage.getItem('notepadText');
      if (savedText) {
        textarea.value = savedText;
      }
    });
  
    // Clear the Notepad textarea and remove saved text from local storage
    clearButton.addEventListener('click', () => {
      textarea.value = '';
      localStorage.removeItem('notepadText');
    });
  
    // Copy the text from the Notepad to the clipboard
    copyButton.addEventListener('click', () => {
      textarea.select();
      document.execCommand('copy');
    });

     // Show the Notepad when Ctrl+Q is pressed
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'q') {
      event.preventDefault();
      offcanvas.show();
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
document.getElementById('btn').addEventListener('click', function() {
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


