function removeDuplicatesFromAllEmail() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('all_email');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Sheet "all_email" not found.');
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data to clean.');
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues(); // A2:B
  const uniqueEmails = new Set();
  const filteredData = [];

  for (let i = 0; i < data.length; i++) {
    const email = data[i][0]?.toString().toLowerCase().trim();
    if (email && !uniqueEmails.has(email)) {
      uniqueEmails.add(email);
      filteredData.push(data[i]);
    }
  }

  // Clear old data
  sheet.getRange(2, 1, lastRow - 1, 2).clearContent();

  // Write filtered data
  if (filteredData.length) {
    sheet.getRange(2, 1, filteredData.length, 2).setValues(filteredData);
  }

  SpreadsheetApp.getUi().alert(`✅ Done: Removed duplicates. ${data.length - filteredData.length} duplicate(s) found.`);
}


function deleteEmails() {
  const ss = SpreadsheetApp.getActive();
  const dashboard = ss.getSheetByName('dashboard');
  const deleteSheet = ss.getSheetByName('Delete') || ss.insertSheet('Delete');
  const allEmailSheet = ss.getSheetByName('all_email');
  const sheetsToCheck = ['Clean', 'Account disabled', 'Account is spam disabled', 'Other error'];
  const now = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm:ss');

  if (!dashboard || !allEmailSheet) {
    SpreadsheetApp.getUi().alert('Required sheets not found.');
    return;
  }

  const emails = dashboard.getRange('A8:A').getValues().flat().filter(Boolean).map(e => e.trim());
  if (emails.length === 0) {
    SpreadsheetApp.getUi().alert('No emails found in dashboard A8:A.');
    return;
  }

  const deletedEntries = [];

  sheetsToCheck.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;

    const data = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().map(row => row[0]?.toString().trim());

    // Parcourir à l’envers pour éviter les conflits de décalage
    for (let i = data.length - 1; i >= 0; i--) {
      const rowEmail = data[i];
      if (emails.includes(rowEmail)) {
        let errorText = '';
        if (sheetName === 'Other error') {
          const errorCell = sheet.getRange(i + 1, 2).getValue();
          errorText = errorCell ? errorCell.toString().trim() : '';
        }
        deletedEntries.push([rowEmail, sheetName, now, errorText]);
        sheet.deleteRow(i + 1);
      }
    }
  });

  // Supprimer aussi de "all_email"
  const allData = allEmailSheet.getRange(1, 1, allEmailSheet.getLastRow(), 1).getValues().map(row => row[0]?.toString().trim());
  for (let i = allData.length - 1; i >= 0; i--) {
    if (emails.includes(allData[i])) {
      allEmailSheet.deleteRow(i + 1);
    }
  }

  // Ajouter dans "Delete"
  if (deletedEntries.length > 0) {
    if (deleteSheet.getLastRow() === 0) {
      deleteSheet.appendRow(['Email', 'Type', 'Date Deleted', 'Error']);
    }
    deleteSheet.getRange(deleteSheet.getLastRow() + 1, 1, deletedEntries.length, 4).setValues(deletedEntries);
  }

  dashboard.getRange('A8:A').clearContent();

  SpreadsheetApp.getUi().alert(`${deletedEntries.length} email(s) deleted and logged.`);
}

// Shared utility functions
function getSheet(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error(`Sheet "${name}" not found`);
  return sheet;
}

function extractEmail(text) {
  const match = text?.toString().match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].trim() : null;
}

function removeEmailsFromSheet(sheet, emailsToRemove) {
  const data = sheet.getDataRange().getValues();
  const newData = data.filter(row => !emailsToRemove.includes(row[0]?.toString().trim()));
  sheet.clearContents();
  if (newData.length) sheet.getRange(1, 1, newData.length, newData[0].length).setValues(newData);
}

// Main functions
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const editedRange = e.range;
  const targetSheets = ['Clean', 'Account disabled', 'Account is spam disabled'];

  if (targetSheets.includes(sheet.getName()) && editedRange.getColumn() === 1) {
    updateHistorique(sheet, editedRange);
    updateStatusDate(sheet, editedRange); // Add date when email is added/edited
  }
}

function updateStatusDate(sheet, editedRange) {
  const currentDate = new Date();
  const numRows = editedRange.getNumRows();
  
  // Set date in column B for all edited rows
  sheet.getRange(editedRange.getRow(), 2, numRows, 1)
    .setValue(currentDate)
    .setNumberFormat("yyyy-mm-dd hh:mm:ss");
}

function updateHistorique(sheet, editedRange) {
  const historiqueSheet = getSheet('Historique');
  const emailRange = sheet.getRange(editedRange.getRow(), 1, editedRange.getNumRows(), 1);
  const values = emailRange.getValues();
  const currentDate = new Date();
  const errorType = sheet.getName();
  
  const historiqueData = historiqueSheet.getDataRange().getValues();
  const emailIndexMap = new Map(historiqueData.slice(1).map((row, i) => [row[0]?.trim(), i + 2]));

  const updates = [];
  const newRows = [];

  values.forEach(([text]) => {
    const email = extractEmail(text);
    if (!email) return;

    const rowIndex = emailIndexMap.get(email);
    if (rowIndex) {
      const row = historiqueSheet.getRange(rowIndex, 1, 1, 5).getValues()[0];
      row[1] = currentDate;
      if (errorType === 'Clean') row[2] = (row[2] || 0) + 1;
      if (errorType === 'Account disabled') row[3] = (row[3] || 0) + 1;
      if (errorType === 'Account is spam disabled') row[4] = (row[4] || 0) + 1;
      updates.push({ rowIndex, values: row });
    } else {
      const newRow = [email, currentDate, 0, 0, 0];
      if (errorType === 'Clean') newRow[2] = 1;
      if (errorType === 'Account disabled') newRow[3] = 1;
      if (errorType === 'Account is spam disabled') newRow[4] = 1;
      newRows.push(newRow);
    }
  });

  updates.forEach(({rowIndex, values}) => {
    historiqueSheet.getRange(rowIndex, 1, 1, 5).setValues([values]);
  });

  if (newRows.length) {
    historiqueSheet.getRange(historiqueSheet.getLastRow() + 1, 1, newRows.length, 5).setValues(newRows);
  }
}

function handleAddByDropdown() {
  const dashboard = getSheet('dashboard');
  const errorType = dashboard.getRange('E9').getValue().trim();
  const sheetMap = {
    "Clean": "Clean",
    "Account disabled": "Account disabled",
    "Account is spam disabled": "Account is spam disabled",
    "Other error": "Other error",
    "SendSpam":"SendSpam",
    "SendInbox":"SendInbox"
  };

  const sheetName = sheetMap[errorType];
  if (!sheetName) throw new Error('Invalid error type selected');

  if (sheetName === 'Other error') {
    addOtherError();
  } else if (sheetName === 'SendSpam' || sheetName === 'SendInbox') {
    addToSendSheet(); // 🔥 New case
  } else {
    addToErrorSheet(sheetName);
  }
}
function addToErrorSheet(targetSheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName('dashboard');
  const historique = ss.getSheetByName('Historique');
  const targetSheet = ss.getSheetByName(targetSheetName);

  if (!targetSheet) {
    SpreadsheetApp.getUi().alert(`Sheet "${targetSheetName}" not found.`);
    return;
  }

  const rawData = dashboard.getRange('A8:A').getValues().filter(r => r[0]);
  const emails = [...new Set(rawData.map(r => r[0].trim()))]; // Remove duplicates

  if (!emails.length) {
    SpreadsheetApp.getUi().alert('No emails found to add.');
    return;
  }

  // Remove from other sheets
  ['Clean', 'Account disabled', 'Account is spam disabled', 'Other error']
    .filter(name => name !== targetSheetName)
    .forEach(name => {
      const sheet = ss.getSheetByName(name);
      if (sheet) removeEmailsFromSheet(sheet, emails);
    });

  // Append new entries
  const existing = targetSheet.getRange(2, 1, targetSheet.getLastRow(), 1).getValues().map(r => r[0]?.trim());
  const toAdd = emails.filter(email => !existing.includes(email));

  if (toAdd.length) {
    const start = targetSheet.getLastRow() + 1;
    targetSheet.getRange(start + 1, 1, toAdd.length, 1).setValues(toAdd.map(e => [e]));
    targetSheet.getRange(start + 1, 1, toAdd.length, 1).setBackground('#b7b7b7');
  }

  // Update Historique
  const historiqueData = historique.getDataRange().getValues();
  const emailIndex = new Map();
  for (let i = 1; i < historiqueData.length; i++) {
    const email = historiqueData[i][0]?.trim();
    if (email) emailIndex.set(email, i + 1);
  }

  const now = new Date();
  const updates = [];
  const newEntries = [];

  toAdd.forEach(email => {
    const idx = emailIndex.get(email);
    if (idx) {
      const row = historique.getRange(idx, 1, 1, 6).getValues()[0];
      row[1] = now;
      row[5] = targetSheetName;
      updates.push({ idx, values: row });
    } else {
      newEntries.push([email, now, 0, 0, 0, targetSheetName]);
    }
  });

  updates.forEach(({ idx, values }) => {
    historique.getRange(idx, 1, 1, 6).setValues([values]);
    historique.getRange(idx, 1).setBackground('#b7b7b7');
  });

  if (newEntries.length) {
    const start = historique.getLastRow() + 1;
    historique.getRange(start, 1, newEntries.length, 6).setValues(newEntries);
    historique.getRange(start, 1, newEntries.length, 1).setBackground('#b7b7b7');
  }

  dashboard.getRange('A8:B').clearContent();
  SpreadsheetApp.getUi().alert(`Added ${toAdd.length} emails to "${targetSheetName}"`);
}



function addToSendSheet() {
  const ss = SpreadsheetApp.getActive();
  const dashboard = ss.getSheetByName('dashboard');
  const cleanSheet = ss.getSheetByName('Clean');
  const sendSheet = ss.getSheetByName("Send") || ss.insertSheet("Send");

  if (!dashboard || !cleanSheet) {
    SpreadsheetApp.getUi().alert("Required sheets not found.");
    return;
  }

  const mode = dashboard.getRange('E9').getValue().toString().trim(); // Get Send mode
  const dashboardEmails = dashboard.getRange('A8:A').getValues().flat().filter(Boolean).map(e => e.trim());
  const cleanEmails = cleanSheet.getRange('A1:A').getValues().flat().filter(Boolean).map(e => e.trim());
  const dashboardSet = new Set(dashboardEmails);

  let inboxEmails = [];
  let spamEmails = [];

  if (mode === 'SendSpam') {
    spamEmails = dashboardEmails;
    inboxEmails = cleanEmails.filter(e => !dashboardSet.has(e));
  } else if (mode === 'SendInbox') {
    inboxEmails = dashboardEmails;
    spamEmails = cleanEmails.filter(e => !dashboardSet.has(e));
  } else {
    // Default fallback (Send)
    inboxEmails = dashboardEmails;
    spamEmails = cleanEmails.filter(e => !dashboardSet.has(e));
  }

  // === Determine the next column to insert ===
  let col = 1;
  while (sendSheet.getRange(2, col).getValue()) {
    col += 2;
  }

  const today = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "dd-MM-yyyy");
  const inboxFormula = `=CONCAT("inbox "; COUNTUNIQUE(${columnLetter(col)}3:${columnLetter(col)}))`;
  const spamFormula = `=CONCAT("Spam "; COUNTUNIQUE(${columnLetter(col + 1)}3:${columnLetter(col + 1)}))`;

  // Row 1: Date merged + gray
  sendSheet.getRange(1, col, 1, 2).merge()
    .setValue(today)
    .setFontColor("white")
    .setBackground("#555555")
    .setHorizontalAlignment("center");

  // Row 2: Formulas
  sendSheet.getRange(2, col).setFormula(inboxFormula).setBackground("#00ff00").setFontWeight("bold").setFontColor("black");
  sendSheet.getRange(2, col + 1).setFormula(spamFormula).setBackground("#ff0000").setFontWeight("bold").setFontColor("white");

  // Row 3+: Set values
  if (inboxEmails.length)
    sendSheet.getRange(3, col, inboxEmails.length, 1).setValues(inboxEmails.map(e => [e]));
  if (spamEmails.length)
    sendSheet.getRange(3, col + 1, spamEmails.length, 1).setValues(spamEmails.map(e => [e]));

  // Clear dashboard
  dashboard.getRange('A8:A').clearContent();

  SpreadsheetApp.getUi().alert(`🟩 Inbox: ${inboxEmails.length} | 🟥 Spam: ${spamEmails.length} inserted at ${columnLetter(col)} & ${columnLetter(col + 1)}`);
}

function columnLetter(col) {
  let temp = '', letter = '';
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    col = (col - temp - 1) / 26;
  }
  return letter;
}




function updateHistoriqueWithError(errorType, emails) {
  const historique = getSheet('Historique');
  const historiqueData = historique.getDataRange().getValues();
  const emailIndex = new Map(historiqueData.slice(1).map((row, i) => [row[0]?.trim(), i + 2]));
  
  const now = new Date();
  const updates = [];
  const newEntries = [];

  emails.forEach(email => {
    const idx = emailIndex.get(email);
    if (idx) {
      const row = historique.getRange(idx, 1, 1, 6).getValues()[0];
      row[1] = now;
      row[5] = errorType;
      updates.push({ idx, values: row });
    } else {
      newEntries.push([email, now, 0, 0, 0, errorType]);
    }
  });

  updates.forEach(({ idx, values }) => {
    historique.getRange(idx, 1, 1, 6).setValues([values]);
    historique.getRange(idx, 1).setBackground('#b7b7b7');
  });

  if (newEntries.length) {
    const start = historique.getLastRow() + 1;
    historique.getRange(start, 1, newEntries.length, 6).setValues(newEntries);
    historique.getRange(start, 1, newEntries.length, 1).setBackground('#b7b7b7');
  }
}

function addOtherError() {
  const ss = SpreadsheetApp.getActive();
  const dashboard = getSheet('dashboard');
  const historique = getSheet('Historique');
  
  let otherErrorSheet = ss.getSheetByName('Other error');
  if (!otherErrorSheet) {
    otherErrorSheet = ss.insertSheet('Other error');
    otherErrorSheet.appendRow(['Email', 'Error', 'Date Added', 'Error', 'Count']);
  } else if (otherErrorSheet.getLastColumn() < 7) {
    otherErrorSheet.getRange(1, 3).setValue('Date Added');
  }

  const rawData = dashboard.getRange('A8:B').getValues().filter(row => row[0]);
  if (!rawData.length) throw new Error('No data found in A8:B of dashboard');

  const emailErrorMap = new Map(rawData.map(([email, error]) => 
    [email.trim(), error ? error.toString().trim() : 'Other']
  ));
  const uniqueEntries = [...emailErrorMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  // Remove from other sheets
  ['Clean', 'Account disabled', 'Account is spam disabled'].forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet) removeEmailsFromSheet(sheet, uniqueEntries.map(([email]) => email));
  });

  // Update Other error sheet
  const existingData = otherErrorSheet.getRange(2, 1, Math.max(0, otherErrorSheet.getLastRow() - 1), 3).getValues();
  const existingEmails = new Map(existingData.map((row, i) => [row[0]?.toString().trim(), i + 2]));
  
  const currentDate = new Date();
  uniqueEntries.forEach(([email, error]) => {
    const rowNum = existingEmails.get(email);
    if (rowNum) {
      // Only update error, do not delete/overwrite date if already exists
      otherErrorSheet.getRange(rowNum, 2).setValue(error);
      if (!otherErrorSheet.getRange(rowNum, 3).getValue()) {
        otherErrorSheet.getRange(rowNum, 3).setValue(currentDate);
      }
    } else {
      const newRow = [email, error, currentDate, '', '', ''];
      otherErrorSheet.appendRow(newRow);
      otherErrorSheet.getRange(otherErrorSheet.getLastRow(), 1).setBackground('#b7b7b7');
    }
  });

  // Update summary
  updateErrorSummary(otherErrorSheet);
  
  // Update Historique
  updateHistoriqueWithOtherError(uniqueEntries);

  dashboard.getRange('A8:B').clearContent();
  SpreadsheetApp.getUi().alert(`${uniqueEntries.length} emails processed in Other error`);
}

/**
 * Universal generator for dashboard actions.
 * - If "Clean" selected, generate SMTP lines.
 * - Else, just extract emails and set in result.
 * - For adding new emails: skip empty, alert if not Gmail, log all in Historique.
 * - For "Other error", fix date deletion bug.
 */
function generateUniversal() {
  const ss = SpreadsheetApp.getActive();
  const dashboard = getSheet('dashboard');
  const allEmailSheet = getSheet('all_email');
  const historique = getSheet('Historique');
  const type = dashboard.getRange('E9').getValue().toString().trim();

  // Get non-empty emails from dashboard
  let rawData = dashboard.getRange('A8:B').getValues().filter(row => row[0] && row[0].toString().trim());
  let emails = rawData.map(row => row[0].toString().trim());
  let passwords = rawData.map( row => row[1] ? row[1].toString().trim() : '');

  // Remove empty cells
  emails = emails.filter(e => e);
  passwords = passwords.filter((_, i) => emails[i]);

  // For adding new emails: skip empty, alert if not Gmail, set "no gmail acc" if declined
  let filteredEmails = [];
  let filteredPasswords = [];
  let noGmailIndexes = [];
  emails.forEach((email, i) => {
    if (!email) return;
    if (!/@gmail\.com$/i.test(email)) {
      const ui = SpreadsheetApp.getUi();
      const resp = ui.alert(`"${email}" is not a Gmail address. Add anyway?`, ui.ButtonSet.YES_NO);
      if (resp !== ui.Button.YES) {
        noGmailIndexes.push(i);
        return;
      }
    }
    filteredEmails.push(email);
    filteredPasswords.push(passwords[i]);
  });

  // Set "no gmail acc" in A8:A for skipped
  if (noGmailIndexes.length) {
    noGmailIndexes.forEach(idx => {
      dashboard.getRange(8 + idx, 1).setValue('no gmail acc');
    });
  }

  // Main logic
  if (type === 'Clean') {
    // Generate SMTP lines for Clean
    const emailPasswords = new Map(allEmailSheet.getRange('A:B').getValues().map(row => [row[0]?.trim(), row[1]?.trim()]));
    const smtpData = [];
    const missingEmails = [];
    filteredEmails.forEach(email => {
      const password = emailPasswords.get(email);
      password
        ? smtpData.push([`smtp.gmail.com 587 ${email} ${password}`])
        : missingEmails.push([email]);
    });
    if (smtpData.length) dashboard.getRange(8, 3, smtpData.length, 1).setValues(smtpData);
    if (missingEmails.length) dashboard.getRange(8, 4, missingEmails.length, 1).setValues(missingEmails);
    SpreadsheetApp.getUi().alert(`${smtpData.length} SMTP entries generated. ${missingEmails.length} missing passwords.`);
  } else {
    // For other types, just set emails in result
    if (filteredEmails.length) dashboard.getRange(8, 3, filteredEmails.length, 1).setValues(filteredEmails.map(e => [e]));
    SpreadsheetApp.getUi().alert(`${filteredEmails.length} email(s) processed.`);
  }

  // Log all actions in Historique with date
  const historiqueData = historique.getDataRange().getValues();
  const emailIndex = new Map(historiqueData.slice(1).map((row, i) => [row[0]?.trim(), i + 2]));
  const now = new Date();
  const updates = [];
  const newEntries = [];
  filteredEmails.forEach(email => {
    const idx = emailIndex.get(email);
    if (idx) {
      const row = historique.getRange(idx, 1, 1, 6).getValues()[0];
      row[1] = now;
      row[5] = type;
      updates.push({ idx, values: row });
    } else {
      newEntries.push([email, now, 0, 0, 0, type]);
    }
  });
  updates.forEach(({ idx, values }) => {
    historique.getRange(idx, 1, 1, 6).setValues([values]);
    historique.getRange(idx, 1).setBackground('#b7b7b7');
  });
  if (newEntries.length) {
    const start = historique.getLastRow() + 1;
    historique.getRange(start, 1, newEntries.length, 6).setValues(newEntries);
    historique.getRange(start, 1, newEntries.length, 1).setBackground('#b7b7b7');
  }
}

function updateErrorSummary(sheet) {
  // Summarize error counts in columns E and F
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const errorData = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  const errorCounts = {};
  errorData.forEach(([error]) => {
    if (!error) return;
    const cleanedError = error.toString()
      .replace(/^[^@]+@[^ ]+['']?\s*/, '')
      .trim() || 'Other';
    errorCounts[cleanedError] = (errorCounts[cleanedError] || 0) + 1;
  });
  const summary = Object.entries(errorCounts).sort((a, b) => b[1] - a[1]);
  sheet.getRange('E2:F').clearContent();
  if (summary.length) {
    sheet.getRange(2, 5, summary.length, 2).setValues(summary);
    sheet.getRange(2, 5, summary.length, 2).setBackground('#e0e0e0');
  }
}