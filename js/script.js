function showSection(sectionId) {
    var sections = ["home", "ip-extraction", "split"];
    sections.forEach(function(item) {
      document.getElementById(item).style.display = (item === sectionId) ? "block" : "none";
    });
  }

  document.getElementById("input-text").value = "";

  function splitText() {
      const inputText = document.getElementById("input-text").value;
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

      let outputLines = [];
      let sectionSize = Math.floor(inputLineCount / sectionCount);
      let remainingLines = inputLineCount % sectionCount;
      let currentLineIndex = 0;
      let copyButtonCounter = 1;

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
        outputTextarea.classList.add("form-control", "mt-2");

        //outputTextarea.setAttribute("hidden", "true");

       outputTextarea.rows =1;
        outputTextarea.value = sectionLines.join("\n");


        // Create a new "Copy" button for this textarea
        let copyButton = document.createElement("button");
        copyButton.classList.add("btn", "btn-primary", "my-2");
        copyButton.textContent = "Copy " + copyButtonCounter;
        copyButton.addEventListener("click", function() {
          outputTextarea.select();
          document.execCommand("copy");
        });

        // Increment the copy button counter for the next button
        copyButtonCounter++;

        // Create a new div to hold the textarea and button
        let div = document.createElement("div");
        div.classList.add("input-group","col-6","col-sm-3");
        div.appendChild(outputTextarea);
        div.appendChild(copyButton);
        

        // Append the div to the output container
        outputContainer.appendChild(div);

      }
}
   
      
      function countLines() {
        let text = document.getElementById("text").value;
        let lines = text.split("\n");
        document.getElementById("line-count").innerHTML = "Number of lines: " + lines.length;
      }
      
   
      // Event listeners
      document.getElementById("text").addEventListener("input", countLines);

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
    document.getElementById("text").addEventListener("input", countLines);
    function extractAndRemoveDuplicateIP() {
      // Get the input text
      let inputText = document.getElementById("text").value;

      // Extract IP addresses
      let ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g;
      let ipAddresses = inputText.match(ipRegex);

      // Remove duplicates
      let uniqueIPAddresses = [...new Set(ipAddresses)];

      // Update the output text and line count
      let outputText = uniqueIPAddresses.join("\n");
      document.getElementById("text").value = outputText;
      document.getElementById("line-count").innerHTML = "Number of unique IP addresses: " + uniqueIPAddresses.length;
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
      return emails.sort(function(a, b) {
        var domainA = a.substring(a.lastIndexOf("@") + 1).toLowerCase();
        var domainB = b.substring(b.lastIndexOf("@") + 1).toLowerCase();
        if (domainA < domainB) return -1;
        if (domainA > domainB) return 1;
        return 0;
      });
    }

    function removeDuplicates(emails) {
      document.getElementById("text").value='';
      document.getElementById("line-count").innerHTML = "Number of Email addresses: 0"
      var uniqueEmails = [];
      emails.forEach(function(email) {
        if (!uniqueEmails.includes(email)) {
          uniqueEmails.push(email);
        }
      });
      document.getElementById("line-count").innerHTML = "Number of Email addresses: " + uniqueEmails.length;
      return uniqueEmails;
    }

    $(document).ready(function() {
    $('#generate').click(function() {
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
      $('#count').text(result.length);
    });

    $('#copy').click(function() {
      $('#result-GN').select();
      document.execCommand('copy');
    });
  });
  $(document).ready(function() {
    var lengthInput = $('#length');
    var incrementButton = $('#increment');
    var decrementButton = $('#decrement');

    incrementButton.click(function() {
      lengthInput.val(parseInt(lengthInput.val()) + 1);
    });

    decrementButton.click(function() {
      lengthInput.val(Math.max(parseInt(lengthInput.val()) - 1, 1));
    });
  });
  $(document).ready(function() {
    var lengthInput = $('#lengths');
    var incrementButton = $('#increments');
    var decrementButton = $('#decrements');

    incrementButton.click(function() {
      lengthInput.val(parseInt(lengthInput.val()) + 1);
    });

    decrementButton.click(function() {
      lengthInput.val(Math.max(parseInt(lengthInput.val()) - 1, 1));
    });
  });
  function download() {
    // Get the text from the textarea
    var text = document.getElementById("text").value;
    
    // Create a new Blob object with the text and specify the MIME type
    var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    
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
