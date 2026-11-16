/**
 * =========================================================================
 * AIValytics LeadOS — Google Sheet to LeadOS Automated Sync
 * =========================================================================
 * 
 * Features:
 * - Dynamic column detection (handles Meta Lead Ads output automatically)
 * - LockService to prevent overlapping sync executions
 * - Automatic "LeadOS Sync Status" & "LeadOS Synced At" columns
 * - Retries failed rows automatically
 * - Config stored in Script Properties (API Key & URL never exposed in sheet)
 * - 1-Click trigger setup for 1-minute automated background execution
 */

// Production Configuration Defaults (Stored in Script Properties)
var DEFAULT_API_URL = 'https://aivalytics-leados.vercel.app/api/integrations/sheet-leads';
var DEFAULT_API_KEY = 'aiv_sync_sec_9942a1bc';

/**
 * 1. Initial Setup: Run this ONCE to store credentials in Script Properties
 * and create the 1-minute automated time-driven trigger.
 */
function setupLeadOSSync() {
  var props = PropertiesService.getScriptProperties();
  
  // Set default properties if not already configured
  if (!props.getProperty('LEADOS_API_URL')) {
    props.setProperty('LEADOS_API_URL', DEFAULT_API_URL);
  }
  if (!props.getProperty('LEADOS_API_KEY')) {
    props.setProperty('LEADOS_API_KEY', DEFAULT_API_KEY);
  }

  // Clear any existing triggers to prevent duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'syncLeadsToLeadOS') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Create time-driven trigger running every 1 minute
  ScriptApp.newTrigger('syncLeadsToLeadOS')
    .timeBased()
    .everyMinutes(1)
    .create();

  Logger.log('✓ Successfully configured LeadOS Sync trigger (every 1 minute).');
  Logger.log('✓ API Endpoint: ' + props.getProperty('LEADOS_API_URL'));
}

/**
 * 2. Helper to set custom API credentials in Script Properties if needed
 */
function configureCredentials(apiUrl, apiKey) {
  var props = PropertiesService.getScriptProperties();
  if (apiUrl) props.setProperty('LEADOS_API_URL', apiUrl);
  if (apiKey) props.setProperty('LEADOS_API_KEY', apiKey);
  Logger.log('✓ Credentials updated successfully.');
}

/**
 * 3. Main Sync Function: Executed every 1 minute by the time trigger
 */
function syncLeadsToLeadOS() {
  // Prevent overlapping runs using LockService
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) {
    Logger.log('Previous sync execution is still running. Skipping this cycle.');
    return;
  }

  try {
    var props = PropertiesService.getScriptProperties();
    var apiUrl = props.getProperty('LEADOS_API_URL') || DEFAULT_API_URL;
    var apiKey = props.getProperty('LEADOS_API_KEY') || DEFAULT_API_KEY;

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();

    if (data.length < 2) {
      Logger.log('Sheet is empty or has only headers.');
      return;
    }

    var headers = data[0];
    
    // Ensure "LeadOS Sync Status" and "LeadOS Synced At" columns exist
    var statusColIdx = -1;
    var syncedAtColIdx = -1;

    for (var j = 0; j < headers.length; j++) {
      var h = String(headers[j]).trim().toLowerCase();
      if (h === 'leados sync status' || h === 'sync status' || h === 'sync_status') {
        statusColIdx = j;
      }
      if (h === 'leados synced at' || h === 'synced at' || h === 'synced_at') {
        syncedAtColIdx = j;
      }
    }

    // Append columns if missing
    if (statusColIdx === -1) {
      statusColIdx = headers.length;
      sheet.getRange(1, statusColIdx + 1).setValue('LeadOS Sync Status');
      headers.push('LeadOS Sync Status');
    }
    if (syncedAtColIdx === -1) {
      syncedAtColIdx = headers.length;
      sheet.getRange(1, syncedAtColIdx + 1).setValue('LeadOS Synced At');
      headers.push('LeadOS Synced At');
    }

    // Dynamic header lookup map
    var colMap = {};
    for (var k = 0; k < headers.length; k++) {
      var headerKey = String(headers[k]).trim().toLowerCase().replace(/[\s_\-]/g, '');
      colMap[headerKey] = k;
    }

    function getVal(row, possibleNames) {
      for (var p = 0; p < possibleNames.length; p++) {
        var key = possibleNames[p].toLowerCase().replace(/[\s_\-]/g, '');
        if (colMap[key] !== undefined) {
          var val = row[colMap[key]];
          if (val !== undefined && val !== null) return String(val).trim();
        }
      }
      return '';
    }

    // Find rows that need syncing (Status is empty, or starts with "Error")
    var rowsToSync = [];
    var rowIndices = []; // 1-based sheet row numbers

    // Limit batch size to 30 rows per execution to stay well within Apps Script quotas
    var BATCH_LIMIT = 30;

    for (var r = 1; r < data.length && rowsToSync.length < BATCH_LIMIT; r++) {
      var currentRow = data[r];
      var currentStatus = String(currentRow[statusColIdx] || '').trim();

      // If already successfully Synced, skip
      if (currentStatus === 'Synced') {
        continue;
      }

      // Check if row has at least a phone or email or name
      var phone = getVal(currentRow, ['phone', 'phonenumber', 'phone_number', 'mobile', 'contact']);
      var email = getVal(currentRow, ['email', 'emailaddress', 'email_address']);
      var name = getVal(currentRow, ['fullname', 'name', 'full_name', 'first_name']);

      if (!phone && !email && !name) {
        continue; // empty row
      }

      // Build structured payload
      var leadPayload = {
        rowId: r + 1, // Store 1-based row number for easy callback mapping
        fullName: name || 'Meta Lead Applicant',
        phone: phone,
        email: email,
        city: getVal(currentRow, ['city', 'location']),
        state: getVal(currentRow, ['state']),
        programName: getVal(currentRow, ['program', 'programname', 'targetprogram', 'programinterested', 'course']),
        metaLeadId: getVal(currentRow, ['leadid', 'metaleadid', 'id', 'meta_id']),
        campaignName: getVal(currentRow, ['campaign', 'campaignname', 'meta_campaign', 'campaign_name']),
        adSetName: getVal(currentRow, ['adset', 'adsetname', 'ad_set_name']),
        adName: getVal(currentRow, ['ad', 'adname', 'ad_name']),
        formName: getVal(currentRow, ['form', 'formname', 'form_name']),
        currentRole: getVal(currentRow, ['role', 'jobtitle', 'designation', 'currentrole']),
        currentCompany: getVal(currentRow, ['company', 'currentcompany', 'organization']),
        yearsOfExperience: getVal(currentRow, ['experience', 'yearsofexperience', 'exp']),
        primaryGoal: getVal(currentRow, ['goal', 'primarygoal', 'objective']),
        createdTime: getVal(currentRow, ['createdtime', 'date', 'timestamp', 'created_at']) || new Date().toISOString()
      };

      // Also capture all other custom form questions as key-value pairs
      for (var c = 0; c < headers.length; c++) {
        if (c !== statusColIdx && c !== syncedAtColIdx) {
          var colName = headers[c];
          leadPayload[colName] = currentRow[c];
        }
      }

      rowsToSync.push(leadPayload);
      rowIndices.push(r + 1);
    }

    if (rowsToSync.length === 0) {
      Logger.log('All rows are already synced to LeadOS.');
      return;
    }

    Logger.log('Sending ' + rowsToSync.length + ' unsynced rows to LeadOS API: ' + apiUrl);

    // Call LeadOS Secure Endpoint
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': apiKey
      },
      payload: JSON.stringify(rowsToSync),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(apiUrl, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();

    var nowFormatted = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

    if (responseCode === 200) {
      var json = JSON.parse(responseText);
      var resultMap = {};

      (json.results || []).forEach(function (res) {
        resultMap[res.rowId] = res;
      });

      // Update Sheet status for each row
      for (var m = 0; m < rowIndices.length; m++) {
        var sheetRow = rowIndices[m];
        var resObj = resultMap[sheetRow];

        if (resObj && resObj.status === 'Synced') {
          sheet.getRange(sheetRow, statusColIdx + 1).setValue('Synced');
          sheet.getRange(sheetRow, syncedAtColIdx + 1).setValue(nowFormatted);
        } else if (resObj && resObj.status === 'Error') {
          sheet.getRange(sheetRow, statusColIdx + 1).setValue('Error: ' + (resObj.error || 'Failed'));
        } else {
          sheet.getRange(sheetRow, statusColIdx + 1).setValue('Synced');
          sheet.getRange(sheetRow, syncedAtColIdx + 1).setValue(nowFormatted);
        }
      }
      Logger.log('✓ Successfully synced ' + (json.successCount || rowsToSync.length) + ' rows.');
    } else {
      Logger.log('HTTP Error ' + responseCode + ': ' + responseText);
      // Mark rows with HTTP error
      for (var e = 0; e < rowIndices.length; e++) {
        sheet.getRange(rowIndices[e], statusColIdx + 1).setValue('Error: HTTP ' + responseCode);
      }
    }
  } catch (err) {
    Logger.log('Exception in syncLeadsToLeadOS: ' + err.toString());
  } finally {
    lock.releaseLock();
  }
}
