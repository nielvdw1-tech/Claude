/**
 * ============================================================
 * PPE MANAGEMENT SYSTEM – SERVER CODE (single file)
 * ============================================================
 *
 * This one file replaces every .gs file in the project
 * (Code.gs, Test.gs, SystemTest.gs, PPEBudgetSetup.gs).
 *
 * KEEP these HTML files – they are loaded by name:
 *   IssuePPE, ReceiveStock, ReturnPPE, StockAdjustment,
 *   PPERequest, PPERequestApproval, ManagerPPERequest
 *
 * Contents:
 *   1. Menu and sidebars
 *   2. Shared helpers
 *   3. Employee, PPE item and branch lookups
 *   4. Issue PPE
 *   5. Receive stock
 *   6. Return PPE
 *   7. Stock adjustments
 *   8. PPE requests (sidebar + manager web form)
 *   9. Email approval web app (single and bulk)
 *  10. Email notifications
 *  11. Current stock and planning
 *  12. Opening stock and system repair
 *  13. Budgets
 */

const PPE_CURRENCY_FORMAT = '"R" #,##0.00';
const PPE_SYSTEM_NAME = "PPE Management System";


/* ============================================================
 * 1. MENU AND SIDEBARS
 * ============================================================ */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("PPE Management")
    .addItem("Refresh Dashboard", "refreshPPEDashboard")
    .addSeparator()
    .addItem("Issue PPE", "showIssuePPESidebar")
    .addItem("Request PPE", "showPPERequestSidebar")
    .addItem("Review PPE Requests", "showPPERequestApprovalSidebar")
    .addItem("Return PPE", "showReturnPPESidebar")
    .addSeparator()
    .addItem("Receive Stock", "showReceiveStockSidebar")
    .addItem("Adjust Stock", "showStockAdjustmentSidebar")
    .addItem("Load Opening Stock", "loadOpeningStock")
    .addSeparator()
    .addItem("Repair PPE System", "repairPPEManagementSystem")
    .addItem("Refresh Spreadsheet", "refreshPPESystem")
    .addToUi();
}

function showPPESidebar_(fileName, title, width) {
  let html = HtmlService
    .createHtmlOutputFromFile(fileName)
    .setTitle(title);

  if (width) {
    html = html.setWidth(width);
  }

  SpreadsheetApp.getUi().showSidebar(html);
}

function showIssuePPESidebar() {
  showPPESidebar_("IssuePPE", "Issue PPE");
}

function showPPERequestSidebar() {
  showPPESidebar_("PPERequest", "Request PPE", 420);
}

function showPPERequestApprovalSidebar() {
  showPPESidebar_("PPERequestApproval", "Review PPE Requests", 500);
}

function showReturnPPESidebar() {
  showPPESidebar_("ReturnPPE", "Return PPE", 420);
}

function showReceiveStockSidebar() {
  showPPESidebar_("ReceiveStock", "Receive PPE Stock", 420);
}

function showStockAdjustmentSidebar() {
  showPPESidebar_("StockAdjustment", "Adjust PPE Stock", 420);
}

function refreshPPESystem() {
  // rebuildPPECurrentStock shows its own confirmation toast.
  rebuildPPECurrentStock();
}


/* ============================================================
 * 2. SHARED HELPERS
 * ============================================================ */

/**
 * Returns a sheet by name or throws a clear error.
 */
function getPPESheet_(sheetName) {
  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(
      'The "' + sheetName + '" sheet could not be found.'
    );
  }

  return sheet;
}

function cleanPPEText_(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function cleanPPEKey_(value) {
  return cleanPPEText_(value).toLowerCase();
}

/**
 * Reads a number from a cell, even when it was typed as text:
 * "R 250", "250,00", "1 234,50", "1,234.50" all work.
 * Anything unreadable becomes 0 (never NaN, which shows as
 * #NUM! in the sheet and stops sidebars from loading).
 */
function toPPENumber_(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  let text = cleanPPEText_(value).replace(/[^\d,.\-]/g, "");

  if (!text) {
    return 0;
  }

  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");

  if (lastComma !== -1 && lastDot !== -1) {
    // Both used: the last one is the decimal mark.
    text = lastComma > lastDot
      ? text.replace(/\./g, "").replace(",", ".")
      : text.replace(/,/g, "");
  } else if (lastComma !== -1) {
    // Only commas: "250,50" is a decimal, "1,250" is thousands.
    text = /^-?\d*,\d{1,2}$/.test(text)
      ? text.replace(",", ".")
      : text.replace(/,/g, "");
  } else if ((text.match(/\./g) || []).length > 1) {
    // "1.234.567" – dots used as thousands separators.
    text = text.replace(/\./g, "");
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : 0;
}

/**
 * Turns number cells that were typed as text into real numbers.
 * Used by Repair PPE System.
 */
function convertPPETextNumbers_(sheet, columns) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return 0;
  }

  let fixed = 0;

  columns.forEach(function(column) {
    const range = sheet.getRange(2, column, lastRow - 1, 1);
    const values = range.getValues();
    let changed = false;

    values.forEach(function(row) {
      if (typeof row[0] === "string" && cleanPPEText_(row[0]) !== "") {
        row[0] = toPPENumber_(row[0]);
        changed = true;
        fixed++;
      }
    });

    if (changed) {
      range.setValues(values);
    }
  });

  return fixed;
}

/**
 * Yes / Active / TRUE / 1 all count as active.
 */
function isPPEActive_(value) {
  return ["yes", "active", "true", "1"]
    .includes(cleanPPEKey_(value));
}

/**
 * Builds a column finder from a header row.
 * finder("PPE Description", "Description") returns the
 * first matching column index, or -1.
 */
function getPPEColumnFinder_(headerRow) {
  const headers =
    headerRow.map(function(header) {
      return cleanPPEKey_(header);
    });

  return function() {
    for (let i = 0; i < arguments.length; i++) {
      const index =
        headers.indexOf(cleanPPEKey_(arguments[i]));

      if (index !== -1) {
        return index;
      }
    }

    return -1;
  };
}

function getPPECell_(row, index) {
  return index !== -1 ? row[index] : "";
}

function formatPPEDate_(value, pattern) {
  if (!value) {
    return "";
  }

  if (
    Object.prototype.toString.call(value) ===
    "[object Date]"
  ) {
    if (isNaN(value.getTime())) {
      return "";
    }

    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      pattern
    );
  }

  return cleanPPEText_(value);
}

function formatPPEMoney_(amount) {
  return "R" + Number(amount || 0).toLocaleString(
    "en-ZA",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
}

function addMonthsClamped_(dateValue, months) {
  const d = new Date(dateValue);
  const originalDay = d.getDate();

  d.setDate(1);
  d.setMonth(d.getMonth() + Number(months || 0));

  const lastDay =
    new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0
    ).getDate();

  d.setDate(Math.min(originalDay, lastDay));

  return d;
}

/**
 * Creates the next ID (e.g. PPE-REQ-00012) from a counter
 * in the Settings sheet. Skips any ID that already exists
 * in column A of any sheet.
 */
function generatePPEReferenceID(
  settingName,
  prefix,
  numberLength
) {
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const settingsSheet = getPPESheet_("Settings");

    const cleanSettingName = cleanPPEText_(settingName);

    // "PPE-REQ-" becomes "PPE-REQ".
    const cleanPrefix =
      cleanPPEText_(prefix).replace(/-+$/, "");

    const digits = Number(numberLength || 5);

    if (!cleanSettingName) {
      throw new Error("The ID setting name is missing.");
    }

    if (!cleanPrefix) {
      throw new Error("The ID prefix is missing.");
    }

    const settingsData =
      settingsSheet.getDataRange().getValues();

    let settingRow = 0;
    let nextNumber = 1;

    for (let i = 1; i < settingsData.length; i++) {
      if (cleanPPEText_(settingsData[i][0]) === cleanSettingName) {
        settingRow = i + 1;
        nextNumber = Number(settingsData[i][1] || 1);
        break;
      }
    }

    if (!settingRow) {
      throw new Error(
        'The setting "' +
        cleanSettingName +
        '" could not be found in the Settings sheet.'
      );
    }

    if (!Number.isFinite(nextNumber) || nextNumber < 1) {
      nextNumber = 1;
    }

    const existingIDs = new Set();

    ss.getSheets().forEach(function(sheet) {
      const lastRow = sheet.getLastRow();

      if (lastRow < 2) {
        return;
      }

      sheet
        .getRange(2, 1, lastRow - 1, 1)
        .getDisplayValues()
        .forEach(function(row) {
          const existingID = cleanPPEText_(row[0]);

          if (existingID) {
            existingIDs.add(existingID);
          }
        });
    });

    function buildID(number) {
      return (
        cleanPrefix +
        "-" +
        String(number).padStart(digits, "0")
      );
    }

    let newID = buildID(nextNumber);

    while (existingIDs.has(newID)) {
      nextNumber++;
      newID = buildID(nextNumber);
    }

    settingsSheet
      .getRange(settingRow, 2)
      .setValue(nextNumber + 1);

    SpreadsheetApp.flush();

    return newID;

  } finally {
    lock.releaseLock();
  }
}

/**
 * Audit Log columns: Timestamp | User | Action | Reference ID | Details
 */
function logPPEAction(
  user,
  action,
  referenceID,
  details
) {
  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("Audit Log");

  if (!sheet) {
    return;
  }

  sheet.appendRow([
    new Date(),
    user,
    action,
    referenceID,
    details
  ]);
}

/**
 * Makes data safe to send to a sidebar or web form.
 * Apps Script silently sends null when the data contains
 * something the browser can't receive (such as a date),
 * which leaves the form stuck on "Loading…". This turns
 * every value into plain text / numbers first.
 */
function toPPEClientData_(data) {
  return JSON.parse(JSON.stringify(data));
}

function escapePPEApprovalHtml(value) {
  return cleanPPEText_(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


/* ============================================================
 * 3. EMPLOYEE, PPE ITEM AND BRANCH LOOKUPS
 * ============================================================ */

const PPE_EMPLOYEE_FIELDS = {
  employeeID: "Employee ID",
  employeeName: "Employee Name",
  branch: "Branch",
  department: "Department",
  jobTitle: "Job Title",
  supervisor: "Supervisor",
  employmentStatus: "Employment Status",
  tungstanBootSize: "Tungstan Boot Size",
  sissiBootSize: "Sissi Boot Size",
  overallPantsSize: "Overall Pants Size",
  overallJacketSize: "Overall Jacket Size",
  blackPantsSize: "Black Pants Size",
  skirtSize: "Skirt Size",
  denimJeansSize: "Denim Jeans Size",
  gloveSize: "Glove Size",
  employeeEmail: "Employee Email"
};

/**
 * Reads the Employees sheet by heading name and returns
 * one object per employee (all values as text).
 */
function readPPEEmployees_(employeeSheet) {
  const data = employeeSheet.getDataRange().getValues();

  if (data.length < 2) {
    return [];
  }

  const findColumn = getPPEColumnFinder_(data[0]);
  const columns = {};

  Object.keys(PPE_EMPLOYEE_FIELDS).forEach(function(key) {
    columns[key] = findColumn(PPE_EMPLOYEE_FIELDS[key]);
  });

  const employees = [];

  for (let i = 1; i < data.length; i++) {
    const employee = {};

    Object.keys(columns).forEach(function(key) {
      employee[key] =
        cleanPPEText_(getPPECell_(data[i], columns[key]));
    });

    employees.push(employee);
  }

  return employees;
}

function findPPEEmployeeByID(employeeSheet, employeeID) {
  const searchID = cleanPPEKey_(employeeID);

  if (!searchID) {
    return null;
  }

  return readPPEEmployees_(employeeSheet).find(function(employee) {
    return cleanPPEKey_(employee.employeeID) === searchID;
  }) || null;
}

function getActivePPEEmployees(employeeSheet) {
  return readPPEEmployees_(employeeSheet).filter(function(employee) {
    return (
      employee.employeeID &&
      employee.employeeName &&
      cleanPPEKey_(employee.employmentStatus) === "active"
    );
  });
}

/**
 * PPE Items columns:
 * A ID | B Category | C Description | D Brand | E Size | F Unit
 * G Min Stock | H Reorder Qty | I Unit Cost | J Supplier
 * K Supplier Email | L Replacement Months | M Active | N Notes
 */
function findPPEItemByID(itemSheet, ppeID) {
  const data = itemSheet.getDataRange().getValues();
  const searchID = cleanPPEKey_(ppeID);

  for (let i = 1; i < data.length; i++) {
    if (cleanPPEKey_(data[i][0]) !== searchID) {
      continue;
    }

    return {
      ppeID: cleanPPEText_(data[i][0]),
      category: cleanPPEText_(data[i][1]),
      description: cleanPPEText_(data[i][2]),
      brand: cleanPPEText_(data[i][3]),
      size: cleanPPEText_(data[i][4]),
      unit: cleanPPEText_(data[i][5]),
      minimumStock: toPPENumber_(data[i][6]),
      reorderQuantity: toPPENumber_(data[i][7]),
      unitCost: toPPENumber_(data[i][8]),
      supplier: cleanPPEText_(data[i][9]),
      supplierEmail: cleanPPEText_(data[i][10]),
      replacementPeriodMonths: toPPENumber_(data[i][11]),
      active: isPPEActive_(data[i][12]),
      notes: cleanPPEText_(data[i][13])
    };
  }

  return null;
}

/**
 * Current Stock: A = PPE ID, G = Current Stock, H = Minimum Stock.
 * Returns { "ppe0001": { currentStock, minimumStock }, ... }
 */
function getPPEStockMap_(stockSheet) {
  const data = stockSheet.getDataRange().getValues();
  const stockMap = {};

  for (let i = 1; i < data.length; i++) {
    const key = cleanPPEKey_(data[i][0]);

    if (!key) {
      continue;
    }

    stockMap[key] = {
      currentStock: toPPENumber_(data[i][6]),
      minimumStock: toPPENumber_(data[i][7])
    };
  }

  return stockMap;
}

function getCurrentPPEStock(stockSheet, ppeID) {
  const searchID = cleanPPEKey_(ppeID);

  if (!searchID) {
    throw new Error("A PPE ID is required.");
  }

  const stock = getPPEStockMap_(stockSheet)[searchID];

  if (!stock) {
    throw new Error(
      "PPE ID " +
      ppeID +
      " is missing from the Current Stock sheet."
    );
  }

  return stock.currentStock;
}

/**
 * Active PPE items with their current stock, sorted by
 * description then size. Used by every sidebar.
 */
function getActivePPEItemsWithStock(itemSheet, stockSheet) {
  itemSheet = itemSheet || getPPESheet_("PPE Items");
  stockSheet = stockSheet || getPPESheet_("Current Stock");

  const itemData = itemSheet.getDataRange().getValues();
  const stockMap = getPPEStockMap_(stockSheet);
  const items = [];

  for (let i = 1; i < itemData.length; i++) {
    const row = itemData[i];
    const ppeID = cleanPPEText_(row[0]);

    if (!ppeID || !isPPEActive_(row[12])) {
      continue;
    }

    const stock =
      stockMap[ppeID.toLowerCase()] || {
        currentStock: 0,
        minimumStock: toPPENumber_(row[6])
      };

    items.push({
      ppeID: ppeID,
      category: cleanPPEText_(row[1]),
      description: cleanPPEText_(row[2]),
      size: cleanPPEText_(row[4]),
      currentStock: stock.currentStock,
      minimumStock: stock.minimumStock,
      reorderQuantity: toPPENumber_(row[7]),
      unitCost: toPPENumber_(row[8]),
      supplier: cleanPPEText_(row[9]),
      replacementPeriodMonths: toPPENumber_(row[11])
    });
  }

  items.sort(function(a, b) {
    return (
      a.description.localeCompare(b.description) ||
      a.size.localeCompare(b.size)
    );
  });

  return items;
}

/**
 * Branches: A ID | B Name | H Cost Centre | I Active
 */
function getActivePPEBranches(branchSheet) {
  const data = branchSheet.getDataRange().getValues();
  const branches = [];

  for (let i = 1; i < data.length; i++) {
    const branchID = cleanPPEText_(data[i][0]);
    const branchName = cleanPPEText_(data[i][1]);

    if (
      !branchID ||
      !branchName ||
      cleanPPEKey_(data[i][8]) !== "yes"
    ) {
      continue;
    }

    branches.push({
      branchID: branchID,
      branchName: branchName,
      costCentre: cleanPPEText_(data[i][7])
    });
  }

  branches.sort(function(a, b) {
    return a.branchName.localeCompare(b.branchName);
  });

  return branches;
}


/* ============================================================
 * 4. ISSUE PPE
 * ============================================================ */

function getIssuePPESidebarData() {
  return toPPEClientData_({
    employees:
      getActivePPEEmployees(getPPESheet_("Employees")),

    ppeItems:
      getActivePPEItemsWithStock(),

    approvedRequests:
      getApprovedPPERequestsForIssue()
  });
}

/**
 * Called by IssuePPE.html.
 */
function issuePPEFromSidebar(details) {
  if (!details) {
    throw new Error("No PPE issue information was received.");
  }

  const cleanDetails = {
    employeeID: cleanPPEText_(details.employeeID),
    ppeID: cleanPPEText_(details.ppeID),
    quantity: Number(details.quantity || 0),
    reason: cleanPPEText_(details.issueReason || details.reason),
    issuedBy: cleanPPEText_(details.issuedBy),
    comments: cleanPPEText_(details.comments),
    previousReturned: details.previousReturned || "No",
    returnedCondition: details.returnedCondition || "",
    supervisorApproval: details.supervisorApproval || "Not Required",
    requestID: cleanPPEText_(details.requestID)
  };

  if (!cleanDetails.employeeID) {
    throw new Error("Please select an employee.");
  }

  if (!cleanDetails.ppeID) {
    throw new Error("Please select a PPE item.");
  }

  if (
    !Number.isFinite(cleanDetails.quantity) ||
    cleanDetails.quantity <= 0
  ) {
    throw new Error("The issue quantity must be greater than zero.");
  }

  if (!cleanDetails.reason) {
    throw new Error("Please select an issue reason.");
  }

  if (!cleanDetails.issuedBy) {
    throw new Error(
      "Please enter the name of the person issuing the PPE."
    );
  }

  return issuePPE(cleanDetails);
}

/**
 * Only used if a Google Form "on form submit" trigger
 * points at this function. Delete it if you have no
 * such trigger (Apps Script editor → Triggers).
 */
function processPPEIssueForm(e) {
  try {
    if (!e || !e.namedValues) {
      throw new Error(
        "This function must run from a spreadsheet form-submit trigger."
      );
    }

    function formValue(heading) {
      const values = e.namedValues[heading];
      return values && values.length ? cleanPPEText_(values[0]) : "";
    }

    const details = {
      employeeID: formValue("Employee ID"),
      ppeID: formValue("PPE ID"),
      quantity: Number(formValue("Quantity")),
      reason: formValue("Reason for Issue"),
      previousReturned: formValue("Previous PPE Returned"),
      returnedCondition: formValue("Returned PPE Condition"),
      issuedBy: formValue("Issued By"),
      supervisorApproval: formValue("Supervisor Approval"),
      comments: formValue("Comments")
    };

    if (!details.employeeID) {
      throw new Error("Employee ID is required.");
    }

    if (!details.ppeID) {
      throw new Error("PPE ID is required.");
    }

    if (!Number.isFinite(details.quantity) || details.quantity <= 0) {
      throw new Error("Quantity must be a number greater than zero.");
    }

    if (!details.issuedBy) {
      throw new Error("Issued By is required.");
    }

    if (
      details.supervisorApproval !== "Approved" &&
      details.supervisorApproval !== "Not Required"
    ) {
      throw new Error(
        "PPE cannot be issued while supervisor approval is pending."
      );
    }

    issuePPE(details);

  } catch (error) {
    logPPEAction(
      Session.getActiveUser().getEmail(),
      "PPE Issue Error",
      "",
      error.message
    );

    throw error;
  }
}

/**
 * Records a PPE issue: Issue Register + Stock Transaction,
 * links an approved request and converts its reserved
 * budget to spent, then rebuilds Current Stock.
 */
function issuePPE(details) {
  if (!details) {
    throw new Error("No PPE issue information was received.");
  }

  const employeeSheet = getPPESheet_("Employees");
  const itemSheet = getPPESheet_("PPE Items");
  const stockSheet = getPPESheet_("Current Stock");
  const issueSheet = getPPESheet_("PPE Issue Register");
  const transactionSheet = getPPESheet_("Stock Transactions");

  const quantity = Number(details.quantity || 0);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error(
      "The PPE issue quantity must be greater than zero."
    );
  }

  const employee =
    findPPEEmployeeByID(employeeSheet, details.employeeID);

  if (!employee) {
    throw new Error(
      "Employee ID " + details.employeeID + " could not be found."
    );
  }

  if (cleanPPEKey_(employee.employmentStatus) !== "active") {
    throw new Error(
      employee.employeeName + " is not listed as an active employee."
    );
  }

  const item = findPPEItemByID(itemSheet, details.ppeID);

  if (!item) {
    throw new Error("PPE ID " + details.ppeID + " could not be found.");
  }

  if (!item.active) {
    throw new Error(item.description + " is not currently active.");
  }

  const currentStock =
    getCurrentPPEStock(stockSheet, details.ppeID);

  if (currentStock < quantity) {
    throw new Error(
      "Insufficient stock for " +
      item.description +
      " – " +
      item.size +
      ". Available stock: " +
      currentStock +
      ". Requested quantity: " +
      quantity +
      "."
    );
  }

  /*
   * Linked request: must be approved and not yet issued.
   */
  let requestRow = 0;

  if (details.requestID) {
    requestRow = findPPERequestRow_(details.requestID);

    if (!requestRow) {
      throw new Error(
        "The linked PPE request could not be found: " +
        details.requestID
      );
    }

    const request =
      readPPERequestRow_(
        getPPESheet_("PPE Requests")
          .getRange(requestRow, 1, 1, 18)
          .getValues()[0],
        requestRow
      );

    if (cleanPPEKey_(request.status) !== "approved") {
      throw new Error(
        "Request " + details.requestID +
        " is not approved. Current status: " + request.status
      );
    }

    if (request.issueID) {
      throw new Error(
        "Request " + details.requestID +
        " has already been issued (" + request.issueID + ")."
      );
    }

    /*
     * Approved without a budget reservation (for example when
     * "Approved" was chosen directly in the sheet): reserve now.
     * This still stops if the item has no Unit Cost or the
     * branch budget is not enough.
     */
    if (!getPPEBudgetReservationByRequest_(details.requestID)) {
      reserveBudgetForPPERequest_(request);
    }
  }

  const issueID =
    generatePPEReferenceID("Next Issue Number", "PPE-ISS");

  const transactionID =
    generatePPEReferenceID("Next Transaction Number", "TRN");

  const issueDate = new Date();

  const replacementReviewDate =
    item.replacementPeriodMonths > 0
      ? addMonthsClamped_(issueDate, item.replacementPeriodMonths)
      : "";

  issueSheet.appendRow([
    issueID,
    issueDate,
    employee.employeeID,
    employee.employeeName,
    employee.branch,
    employee.department,
    employee.jobTitle,
    item.ppeID,
    item.description,
    item.size,
    quantity,
    details.reason,
    details.previousReturned,
    details.returnedCondition,
    replacementReviewDate,
    details.issuedBy,
    "Recorded",
    details.supervisorApproval,
    details.comments,
    "",
    "Issued"
  ]);

  transactionSheet.appendRow([
    transactionID,
    issueDate,
    "PPE Issued",
    item.ppeID,
    item.description,
    item.size,
    0,
    quantity,
    employee.employeeID,
    employee.employeeName,
    employee.branch,
    employee.department,
    details.reason,
    details.issuedBy,
    issueID,
    details.comments
  ]);

  if (requestRow) {
    // PPE Requests column Q = Issue ID
    getPPESheet_("PPE Requests")
      .getRange(requestRow, 17)
      .setValue(issueID);

    convertReservedPPEBudgetToSpent_(
      details.requestID,
      issueID,
      details.issuedBy
    );
  }

  SpreadsheetApp.flush();

  rebuildPPECurrentStock();

  return {
    success: true,
    issueID: issueID,
    transactionID: transactionID,
    message: "PPE issued successfully. Issue ID: " + issueID
  };
}

/**
 * Approved PPE requests that have not been issued yet.
 */
function getApprovedPPERequestsForIssue() {
  const sheet = getPPESheet_("PPE Requests");
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  const data =
    sheet.getRange(2, 1, lastRow - 1, 18).getValues();

  const approvedRequests = [];

  data.forEach(function(row, index) {
    const request = readPPERequestRow_(row, index + 2);

    if (
      !request.requestID ||
      cleanPPEKey_(request.status) !== "approved" ||
      request.issueID
    ) {
      return;
    }

    approvedRequests.push({
      requestID: request.requestID,
      requestDate: formatPPEDate_(row[1], "yyyy-MM-dd"),
      employeeID: request.employeeID,
      employeeName: request.employeeName,
      branch: request.branch,
      department: request.department,
      ppeID: request.ppeID,
      ppeDescription: request.ppeDescription,
      size: request.size,
      quantity: request.quantity,
      reason: request.reason,
      urgency: request.urgency,
      supervisor: request.supervisor,
      approvedBy: request.approvedBy,
      approvalDate: formatPPEDate_(row[15], "yyyy-MM-dd"),
      comments: request.comments
    });
  });

  return approvedRequests;
}


/* ============================================================
 * 5. RECEIVE STOCK
 * ============================================================ */

function getReceiveStockSidebarData() {
  return toPPEClientData_({
    ppeItems: getActivePPEItemsWithStock(),
    branches: getActivePPEBranches(getPPESheet_("Branches"))
  });
}

/**
 * Called by ReceiveStock.html and by loadOpeningStock.
 * Set details.skipRebuild = true to rebuild once at the end
 * of a batch instead of after every row.
 */
function submitStockReceiptFromSidebar(details) {
  if (!details) {
    throw new Error("No stock receipt information was received.");
  }

  const ppeID = cleanPPEText_(details.ppeID);
  const quantity = Number(details.quantity || 0);
  const supplier = cleanPPEText_(details.supplier);
  const deliveryNote = cleanPPEText_(details.deliveryNote);
  const purchaseOrder = cleanPPEText_(details.purchaseOrder);
  const unitCost = Number(details.unitCost || 0);
  const branch = cleanPPEText_(details.branch);
  const receivedBy = cleanPPEText_(details.receivedBy);
  const comments = cleanPPEText_(details.comments);

  if (!ppeID) {
    throw new Error("Please select a PPE item.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantity received must be greater than zero.");
  }

  if (!branch) {
    throw new Error("Please select the receiving branch.");
  }

  if (!receivedBy) {
    throw new Error("Please enter the person receiving the stock.");
  }

  if (!Number.isFinite(unitCost) || unitCost < 0) {
    throw new Error("Unit cost cannot be negative.");
  }

  const transactionSheet = getPPESheet_("Stock Transactions");
  const item = findPPEItemByID(getPPESheet_("PPE Items"), ppeID);

  if (!item) {
    throw new Error("PPE item " + ppeID + " could not be found.");
  }

  if (!item.active) {
    throw new Error("This PPE item is not active.");
  }

  const transactionID =
    generatePPEReferenceID("Next Transaction Number", "TRN-", 5);

  const receiptID =
    generatePPEReferenceID("Next Stock Receipt Number", "REC-", 5);

  const totalValue = quantity * unitCost;

  const commentParts = [];

  if (supplier) {
    commentParts.push("Supplier: " + supplier);
  }

  if (deliveryNote) {
    commentParts.push("Delivery Note: " + deliveryNote);
  }

  if (purchaseOrder) {
    commentParts.push("Purchase Order: " + purchaseOrder);
  }

  commentParts.push("Unit Cost: R" + unitCost.toFixed(2));
  commentParts.push("Total Value: R" + totalValue.toFixed(2));

  if (comments) {
    commentParts.push("Comments: " + comments);
  }

  transactionSheet.appendRow([
    transactionID,
    new Date(),
    "Stock Received",
    item.ppeID,
    item.description,
    item.size,
    quantity,
    0,
    "",
    "",
    branch,
    "",
    "Supplier Delivery",
    receivedBy,
    receiptID,
    commentParts.join(" | ")
  ]);

  logPPEAction(
    receivedBy,
    "PPE Stock Received",
    receiptID,
    item.ppeID +
      " – " +
      item.description +
      " – Quantity: " +
      quantity +
      " – Branch: " +
      branch
  );

  SpreadsheetApp.flush();

  if (!details.skipRebuild) {
    rebuildPPECurrentStock();
  }

  return {
    success: true,
    receiptID: receiptID,
    transactionID: transactionID,
    message:
      quantity +
      " × " +
      item.description +
      " received successfully. Receipt: " +
      receiptID
  };
}


/* ============================================================
 * 6. RETURN PPE
 * ============================================================ */

function getReturnPPESidebarData() {
  try {
    return toPPEClientData_({
      employees:
        getActivePPEEmployees(getPPESheet_("Employees")),

      issues:
        getOutstandingPPEIssuesForReturn_(
          getPPESheet_("PPE Issue Register")
        )
    });

  } catch (error) {
    console.error(error);

    throw new Error(
      "Return PPE loading failed: " + error.message
    );
  }
}

/**
 * Issued PPE that still has a quantity outstanding
 * (issued minus already returned).
 */
function getOutstandingPPEIssuesForReturn_(issueSheet) {
  const data = issueSheet.getDataRange().getDisplayValues();

  if (data.length < 2) {
    return [];
  }

  const column = getPPEColumnFinder_(data[0]);

  const issueIDColumn = column("Issue ID");
  const employeeIDColumn = column("Employee ID");
  const employeeNameColumn = column("Employee Name");
  const branchColumn = column("Branch");
  const departmentColumn = column("Department");
  const ppeIDColumn = column("PPE ID");
  const descriptionColumn = column("PPE Description", "Description");
  const sizeColumn = column("Size");
  const quantityColumn =
    column("Quantity", "Quantity Issued", "Qty", "Qty Issued");
  const issueStatusColumn = column("Issue Status", "Status");

  if (issueIDColumn === -1) {
    throw new Error('PPE Issue Register is missing "Issue ID".');
  }

  if (employeeIDColumn === -1) {
    throw new Error('PPE Issue Register is missing "Employee ID".');
  }

  if (ppeIDColumn === -1) {
    throw new Error('PPE Issue Register is missing "PPE ID".');
  }

  if (quantityColumn === -1) {
    throw new Error('PPE Issue Register is missing "Quantity".');
  }

  const returnedMap = getReturnedPPEQuantityMap_();
  const issues = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const issueID = cleanPPEText_(row[issueIDColumn]);
    const employeeID = cleanPPEText_(row[employeeIDColumn]);
    const ppeID = cleanPPEText_(row[ppeIDColumn]);
    const quantityIssued = toPPENumber_(row[quantityColumn]);

    if (!issueID || !employeeID || !ppeID || !(quantityIssued > 0)) {
      continue;
    }

    const issueStatus =
      cleanPPEKey_(getPPECell_(row, issueStatusColumn));

    if (["cancelled", "void", "rejected"].includes(issueStatus)) {
      continue;
    }

    const outstanding =
      quantityIssued - Number(returnedMap[issueID] || 0);

    if (outstanding <= 0) {
      continue;
    }

    issues.push({
      issueID: issueID,
      employeeID: employeeID,
      employeeName: cleanPPEText_(getPPECell_(row, employeeNameColumn)),
      branch: cleanPPEText_(getPPECell_(row, branchColumn)),
      department: cleanPPEText_(getPPECell_(row, departmentColumn)),
      ppeID: ppeID,
      description: cleanPPEText_(getPPECell_(row, descriptionColumn)),
      size: cleanPPEText_(getPPECell_(row, sizeColumn)),
      quantityIssued: outstanding
    });
  }

  return issues;
}

/**
 * PPE Returns: J (index 9) = Quantity Returned,
 * O (index 14) = Original Issue ID.
 * Matches the row written by submitPPEReturnFromSidebar.
 */
function getReturnedPPEQuantityMap_() {
  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("PPE Returns");

  const map = {};

  if (!sheet || sheet.getLastRow() < 2) {
    return map;
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const issueID = cleanPPEText_(data[i][14]);
    const quantity = toPPENumber_(data[i][9]);

    if (!issueID || !(quantity > 0)) {
      continue;
    }

    map[issueID] = Number(map[issueID] || 0) + quantity;
  }

  return map;
}

/**
 * PPE Issue Register:
 * A Issue ID | B Date | C Employee ID | D Name | E Branch
 * F Department | G Job Title | H PPE ID | I Description
 * J Size | K Quantity
 */
function findPPEIssueByID(issueSheet, issueID) {
  const data = issueSheet.getDataRange().getValues();
  const targetIssueID = cleanPPEKey_(issueID);

  for (let i = 1; i < data.length; i++) {
    if (cleanPPEKey_(data[i][0]) !== targetIssueID) {
      continue;
    }

    return {
      issueID: cleanPPEText_(data[i][0]),
      issueDate: data[i][1],
      employeeID: cleanPPEText_(data[i][2]),
      employeeName: cleanPPEText_(data[i][3]),
      branch: cleanPPEText_(data[i][4]),
      department: cleanPPEText_(data[i][5]),
      ppeID: cleanPPEText_(data[i][7]),
      description: cleanPPEText_(data[i][8]),
      size: cleanPPEText_(data[i][9]),
      quantityIssued: toPPENumber_(data[i][10])
    };
  }

  return null;
}

/**
 * Called by ReturnPPE.html.
 */
function submitPPEReturnFromSidebar(details) {
  if (!details) {
    throw new Error("No PPE return information was received.");
  }

  const employeeID = cleanPPEText_(details.employeeID);
  const issueID = cleanPPEText_(details.issueID);
  const quantity = Number(details.quantity || 0);
  const condition = cleanPPEText_(details.condition);
  const reason = cleanPPEText_(details.reason);
  const returnedToStock = cleanPPEKey_(details.returnedToStock) === "yes";
  const receivedBy = cleanPPEText_(details.receivedBy);
  const comments = cleanPPEText_(details.comments);

  if (!employeeID) {
    throw new Error("Please select an employee.");
  }

  if (!issueID) {
    throw new Error("Please select an issued PPE item.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantity returned must be greater than zero.");
  }

  if (!condition) {
    throw new Error("Please select the return condition.");
  }

  if (!reason) {
    throw new Error("Please select the return reason.");
  }

  if (!receivedBy) {
    throw new Error("Please enter the person receiving the PPE.");
  }

  if (
    returnedToStock &&
    condition !== "Reusable" &&
    condition !== "Incorrect Size"
  ) {
    throw new Error(
      "Only reusable or incorrect-size PPE may be returned to usable stock."
    );
  }

  const issueSheet = getPPESheet_("PPE Issue Register");
  const returnSheet = getPPESheet_("PPE Returns");
  const transactionSheet = getPPESheet_("Stock Transactions");

  const issue = findPPEIssueByID(issueSheet, issueID);

  if (!issue) {
    throw new Error("The selected PPE issue could not be found.");
  }

  if (cleanPPEKey_(issue.employeeID) !== cleanPPEKey_(employeeID)) {
    throw new Error(
      "The selected PPE issue does not belong to this employee."
    );
  }

  const alreadyReturned =
    Number(getReturnedPPEQuantityMap_()[issue.issueID] || 0);

  const outstandingQuantity =
    issue.quantityIssued - alreadyReturned;

  if (quantity > outstandingQuantity) {
    throw new Error(
      "Only " +
      outstandingQuantity +
      " item(s) remain available for return."
    );
  }

  const returnID =
    generatePPEReferenceID("Next PPE Return Number", "RET-", 5);

  let transactionID = "";

  if (returnedToStock) {
    transactionID =
      generatePPEReferenceID("Next Transaction Number", "TRN-", 5);

    transactionSheet.appendRow([
      transactionID,
      new Date(),
      "PPE Returned",
      issue.ppeID,
      issue.description,
      issue.size,
      quantity,
      0,
      issue.employeeID,
      issue.employeeName,
      issue.branch,
      issue.department,
      reason,
      receivedBy,
      returnID,
      "Condition: " +
        condition +
        (comments ? " | Comments: " + comments : "")
    ]);
  }

  returnSheet.appendRow([
    returnID,
    new Date(),
    issue.employeeID,
    issue.employeeName,
    issue.branch,
    issue.department,
    issue.ppeID,
    issue.description,
    issue.size,
    quantity,
    condition,
    reason,
    returnedToStock ? "Yes" : "No",
    transactionID,
    issue.issueID,
    receivedBy,
    comments,
    new Date()
  ]);

  logPPEAction(
    receivedBy,
    "PPE Returned",
    returnID,
    issue.ppeID +
      " – " +
      issue.description +
      " – Quantity: " +
      quantity +
      " – Condition: " +
      condition +
      " – Returned to stock: " +
      (returnedToStock ? "Yes" : "No")
  );

  SpreadsheetApp.flush();

  if (returnedToStock) {
    rebuildPPECurrentStock();
  }

  return {
    success: true,
    returnID: returnID,
    transactionID: transactionID,
    message:
      quantity +
      " × " +
      issue.description +
      " returned successfully. Return reference: " +
      returnID
  };
}


/* ============================================================
 * 7. STOCK ADJUSTMENTS
 * ============================================================ */

function getStockAdjustmentSidebarData() {
  return toPPEClientData_({
    ppeItems: getActivePPEItemsWithStock(),
    branches: getActivePPEBranches(getPPESheet_("Branches"))
  });
}

/**
 * Called by StockAdjustment.html.
 */
function submitStockAdjustmentFromSidebar(details) {
  if (!details) {
    throw new Error("No stock adjustment information was received.");
  }

  const ppeID = cleanPPEText_(details.ppeID);
  const branch = cleanPPEText_(details.branch);
  const direction = cleanPPEText_(details.direction);
  const quantity = Number(details.quantity || 0);
  const reason = cleanPPEText_(details.reason);
  const explanation = cleanPPEText_(details.explanation);
  const approvedBy = cleanPPEText_(details.approvedBy);
  const processedBy = cleanPPEText_(details.processedBy);
  const supportingDocument = cleanPPEText_(details.supportingDocument);
  const comments = cleanPPEText_(details.comments);

  if (!ppeID) {
    throw new Error("Please select a PPE item.");
  }

  if (!branch) {
    throw new Error("Please select a branch.");
  }

  if (direction !== "Increase" && direction !== "Decrease") {
    throw new Error("Please select a valid adjustment direction.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantity must be greater than zero.");
  }

  if (!reason) {
    throw new Error("Please select an adjustment reason.");
  }

  if (!explanation) {
    throw new Error("Please provide a detailed explanation.");
  }

  if (!approvedBy) {
    throw new Error(
      "Please enter the person who approved the adjustment."
    );
  }

  if (!processedBy) {
    throw new Error(
      "Please enter the person processing the adjustment."
    );
  }

  const adjustmentSheet = getPPESheet_("Stock Adjustments");
  const transactionSheet = getPPESheet_("Stock Transactions");

  const item =
    getActivePPEItemsWithStock().find(function(record) {
      return record.ppeID === ppeID;
    });

  if (!item) {
    throw new Error("The selected PPE item could not be found.");
  }

  const stockBefore = Number(item.currentStock || 0);
  let stockAfter = stockBefore;
  let quantityIn = 0;
  let quantityOut = 0;

  if (direction === "Increase") {
    quantityIn = quantity;
    stockAfter = stockBefore + quantity;
  } else {
    if (quantity > stockBefore) {
      throw new Error(
        "The adjustment cannot reduce stock below zero. Current stock: " +
        stockBefore
      );
    }

    quantityOut = quantity;
    stockAfter = stockBefore - quantity;
  }

  const adjustmentID =
    generatePPEReferenceID("Next Stock Adjustment Number", "ADJ-", 5);

  const transactionID =
    generatePPEReferenceID("Next Transaction Number", "TRN-", 5);

  const commentParts = [
    "Adjustment Reference: " + adjustmentID,
    "Stock Before: " + stockBefore,
    "Stock After: " + stockAfter,
    "Approved By: " + approvedBy,
    "Explanation: " + explanation
  ];

  if (supportingDocument) {
    commentParts.push("Supporting Document: " + supportingDocument);
  }

  if (comments) {
    commentParts.push("Comments: " + comments);
  }

  transactionSheet.appendRow([
    transactionID,
    new Date(),
    direction === "Increase"
      ? "Stock Adjustment Increase"
      : "Stock Adjustment Decrease",
    item.ppeID,
    item.description,
    item.size,
    quantityIn,
    quantityOut,
    "",
    "",
    branch,
    "",
    reason,
    processedBy,
    adjustmentID,
    commentParts.join(" | ")
  ]);

  adjustmentSheet.appendRow([
    adjustmentID,
    new Date(),
    item.ppeID,
    item.description,
    item.size,
    branch,
    direction,
    quantity,
    stockBefore,
    stockAfter,
    reason,
    explanation,
    approvedBy,
    processedBy,
    transactionID,
    supportingDocument,
    comments
  ]);

  logPPEAction(
    processedBy,
    "Stock Adjustment",
    adjustmentID,
    item.ppeID +
      " – " +
      item.description +
      " – " +
      direction +
      " " +
      quantity +
      " – Stock before: " +
      stockBefore +
      " – Stock after: " +
      stockAfter +
      " – Approved by: " +
      approvedBy
  );

  SpreadsheetApp.flush();

  rebuildPPECurrentStock();

  return {
    success: true,
    adjustmentID: adjustmentID,
    stockBefore: stockBefore,
    stockAfter: stockAfter,
    message:
      "Stock adjustment recorded successfully. " +
      item.description +
      " changed from " +
      stockBefore +
      " to " +
      stockAfter +
      ". Reference: " +
      adjustmentID
  };
}


/* ============================================================
 * 8. PPE REQUESTS
 * ============================================================
 *
 * PPE Requests columns:
 * A Request ID | B Date | C Employee ID | D Name | E Branch
 * F Department | G PPE ID | H Description | I Size | J Qty
 * K Reason | L Urgency | M Supervisor | N Approval Status
 * O Approved By | P Approval Date | Q Issue ID | R Comments
 * S Bulk Request ID | T Request Type | U Bulk Lines | V Bulk Qty
 */

function readPPERequestRow_(row, rowNumber) {
  return {
    rowNumber: rowNumber,
    requestID: cleanPPEText_(row[0]),
    employeeID: cleanPPEText_(row[2]),
    employeeName: cleanPPEText_(row[3]),
    branch: cleanPPEText_(row[4]),
    department: cleanPPEText_(row[5]),
    ppeID: cleanPPEText_(row[6]),
    ppeDescription: cleanPPEText_(row[7]),
    size: cleanPPEText_(row[8]),
    quantity: toPPENumber_(row[9]),
    reason: cleanPPEText_(row[10]),
    urgency: cleanPPEText_(row[11]),
    supervisor: cleanPPEText_(row[12]),
    status: cleanPPEText_(row[13]),
    approvedBy: cleanPPEText_(row[14]),
    issueID: cleanPPEText_(row[16]),
    comments: cleanPPEText_(row[17]),
    bulkRequestID: cleanPPEText_(row[18]),
    year: new Date().getFullYear()
  };
}

function findPPERequestRow_(requestID) {
  const sheet = getPPESheet_("PPE Requests");
  const lastRow = sheet.getLastRow();
  const target = cleanPPEText_(requestID);

  if (lastRow < 2 || !target) {
    return 0;
  }

  const ids =
    sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < ids.length; i++) {
    if (cleanPPEText_(ids[i][0]) === target) {
      return i + 2;
    }
  }

  return 0;
}

function getPPERequestsByBulkID_(bulkRequestID) {
  const data =
    getPPESheet_("PPE Requests").getDataRange().getValues();

  const rows = [];

  for (let i = 1; i < data.length; i++) {
    if (cleanPPEText_(data[i][18]) === bulkRequestID) {
      rows.push(readPPERequestRow_(data[i], i + 1));
    }
  }

  return rows;
}

/**
 * Writes N (status), O (decided by), P (date) and R (comments).
 */
function setPPERequestDecision_(
  sheet,
  rowNumber,
  status,
  decidedBy,
  comments
) {
  sheet
    .getRange(rowNumber, 14, 1, 3)
    .setValues([[status, decidedBy, new Date()]]);

  sheet
    .getRange(rowNumber, 18)
    .setValue(comments);
}

/**
 * Used by PPERequest.html and ManagerPPERequest.html.
 */
function getPPERequestSidebarData() {
  const data = {
    employees:
      getActivePPEEmployees(getPPESheet_("Employees")),

    ppeItems:
      getActivePPEItemsWithStock(),

    issueHistory:
      getPPEIssueHistoryForRequests(
        getPPESheet_("PPE Issue Register")
      )
  };

  return toPPEClientData_(data);
}

function getPPEIssueHistoryForRequests(issueSheet) {
  const data = issueSheet.getDataRange().getValues();
  const history = [];

  function toText(value) {
    return value instanceof Date
      ? value.toISOString()
      : cleanPPEText_(value);
  }

  for (let i = 1; i < data.length; i++) {
    const employeeID = cleanPPEText_(data[i][2]);
    const ppeID = cleanPPEText_(data[i][7]);

    if (!employeeID || !ppeID) {
      continue;
    }

    history.push({
      employeeID: employeeID,
      ppeID: ppeID,
      issueDate: toText(data[i][1]),
      replacementReviewDate: toText(data[i][14]),
      issueStatus: cleanPPEText_(data[i][20])
    });
  }

  return history;
}

/**
 * Called by PPERequest.html (single request) and by
 * submitMultiPPERequestFromSidebar (one call per line).
 */
function submitPPERequestFromSidebar(details) {
  if (!details) {
    throw new Error("No PPE request information was received.");
  }

  const employeeID = cleanPPEText_(details.employeeID);
  const ppeID = cleanPPEText_(details.ppeID);
  const quantity = Number(details.quantity || 0);
  const reason = cleanPPEText_(details.reason);
  const urgency = cleanPPEText_(details.urgency) || "Normal";
  const supervisor = cleanPPEText_(details.supervisor);
  const comments = cleanPPEText_(details.comments);
  const suppressApprovalEmail = details.suppressApprovalEmail === true;

  if (!employeeID) {
    throw new Error("Please select an employee.");
  }

  if (!ppeID) {
    throw new Error("Please select a PPE item.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantity must be greater than zero.");
  }

  if (!reason) {
    throw new Error("Please enter the reason for the request.");
  }

  if (!supervisor) {
    throw new Error("Please enter the supervisor.");
  }

  const requestSheet = getPPESheet_("PPE Requests");

  const employee =
    getActivePPEEmployees(getPPESheet_("Employees"))
      .find(function(record) {
        return record.employeeID === employeeID;
      });

  const item =
    getActivePPEItemsWithStock().find(function(record) {
      return record.ppeID === ppeID;
    });

  if (!employee) {
    throw new Error("The selected employee could not be found.");
  }

  if (!item) {
    throw new Error("The selected PPE item could not be found.");
  }

  const requestID =
    generatePPEReferenceID("Next PPE Request Number", "PPE-REQ-", 5);

  requestSheet.appendRow([
    requestID,
    new Date(),
    employee.employeeID,
    employee.employeeName,
    employee.branch,
    employee.department,
    item.ppeID,
    item.description,
    item.size,
    quantity,
    reason,
    urgency,
    supervisor,
    "Awaiting Approval",
    "",
    "",
    "",
    comments
  ]);

  logPPEAction(
    supervisor,
    "PPE Request Submitted",
    requestID,
    employee.employeeID +
      " – " +
      employee.employeeName +
      " requested " +
      quantity +
      " × " +
      item.description
  );

  /*
   * Bulk requests suppress this email so Stores
   * receives ONE email for the whole batch instead.
   */
  let emailResult = {
    sent: false,
    managerName: "",
    managerEmail: ""
  };

  if (!suppressApprovalEmail) {
    try {
      emailResult =
        sendPPEApprovalNotification({
          requestID: requestID,
          employeeID: employee.employeeID,
          employeeName: employee.employeeName,
          branch: employee.branch,
          department: employee.department,
          ppeID: item.ppeID,
          ppeDescription: item.description,
          size: item.size,
          quantity: quantity,
          reason: reason,
          urgency: urgency,
          comments: comments
        });

    } catch (error) {
      console.error("PPE approval email failed: " + error.message);

      logPPEAction(
        supervisor,
        "PPE Approval Email Failed",
        requestID,
        error.message
      );
    }
  }

  let message =
    "PPE request submitted successfully. Reference: " +
    requestID +
    ". Status: Awaiting Approval.";

  if (suppressApprovalEmail) {
    message += " This request forms part of a bulk PPE request.";
  } else if (emailResult.sent) {
    message +=
      " Approval notification sent to " +
      emailResult.managerName +
      ".";
  } else {
    message +=
      " The request was saved, but the approval email was not sent.";
  }

  return {
    success: true,
    requestID: requestID,
    emailSent: emailResult.sent,
    approverEmail: emailResult.managerEmail,
    message: message
  };
}

/**
 * Called by ManagerPPERequest.html (web app).
 * Creates one request per line, links them with one
 * Bulk Request ID and sends ONE email to Stores.
 */
function submitMultiPPERequestFromSidebar(requests) {
  if (!Array.isArray(requests) || requests.length === 0) {
    throw new Error("No PPE request lines were received.");
  }

  // Validate every line before anything is saved.
  requests.forEach(function(request) {
    if (!cleanPPEText_(request.employeeID)) {
      throw new Error(
        "One of the request lines does not contain an employee."
      );
    }

    if (!cleanPPEText_(request.ppeID)) {
      throw new Error(
        "One of the request lines does not contain a PPE item."
      );
    }

    const quantity = Number(request.quantity || 0);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error(
        "One of the request lines contains an invalid quantity."
      );
    }

    if (!cleanPPEText_(request.reason)) {
      throw new Error(
        "One of the request lines does not contain a reason."
      );
    }
  });

  const bulkRequestID =
    generatePPEReferenceID(
      "Next PPE Bulk Request Number",
      "PPE-BULK",
      5
    );

  const createdRequests = [];
  let totalQuantity = 0;

  requests.forEach(function(request) {
    const quantity = Number(request.quantity || 0);

    const result =
      submitPPERequestFromSidebar({
        employeeID: request.employeeID,
        ppeID: request.ppeID,
        quantity: quantity,
        reason: request.reason,
        urgency: request.urgency || "Normal",
        comments: request.comments || "",
        supervisor: request.supervisor || "",
        suppressApprovalEmail: true
      });

    if (!result || !result.requestID) {
      throw new Error(
        "A PPE request was created but no Request ID was returned."
      );
    }

    createdRequests.push(result.requestID);
    totalQuantity += quantity;
  });

  /*
   * Link the new rows to the bulk request (columns S:V).
   */
  const sheet = getPPESheet_("PPE Requests");
  const lastRow = sheet.getLastRow();

  const requestIDs =
    sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();

  for (let i = 0; i < requestIDs.length; i++) {
    if (!createdRequests.includes(cleanPPEText_(requestIDs[i][0]))) {
      continue;
    }

    sheet
      .getRange(i + 2, 19, 1, 4)
      .setValues([[
        bulkRequestID,
        "Multi PPE",
        createdRequests.length,
        totalQuantity
      ]]);
  }

  SpreadsheetApp.flush();

  let emailSent = false;

  try {
    emailSent =
      sendPPEBulkApprovalNotification_(bulkRequestID).sent;

  } catch (emailError) {
    console.error(
      "Bulk PPE approval email failed: " + emailError.message
    );
  }

  return {
    success: true,
    bulkRequestID: bulkRequestID,
    requestsCreated: createdRequests.length,
    requestIDs: createdRequests,
    totalQuantity: totalQuantity,
    emailSent: emailSent
  };
}

/**
 * Called by PPERequestApproval.html.
 */
function getPendingPPERequests() {
  const data =
    getPPESheet_("PPE Requests").getDataRange().getValues();

  const requests = [];

  for (let i = 1; i < data.length; i++) {
    const request = readPPERequestRow_(data[i], i + 1);

    if (request.status !== "Awaiting Approval") {
      continue;
    }

    requests.push({
      rowNumber: request.rowNumber,
      requestID: request.requestID,
      requestDate: formatPPEDate_(data[i][1], "dd MMM yyyy"),
      employeeID: request.employeeID,
      employeeName: request.employeeName,
      branch: request.branch,
      department: request.department,
      ppeID: request.ppeID,
      ppeDescription: request.ppeDescription,
      size: request.size,
      quantity: request.quantity,
      reason: request.reason,
      urgency: request.urgency,
      supervisor: request.supervisor,
      approvalStatus: request.status,
      comments: request.comments
    });
  }

  return toPPEClientData_(requests);
}

/**
 * Called by PPERequestApproval.html (sidebar review).
 * Approvals reserve budget, the same as email approvals,
 * so the request can be issued afterwards.
 */
function reviewPPERequest(details) {
  if (!details) {
    throw new Error("No review information was received.");
  }

  const requestID = cleanPPEText_(details.requestID);
  const decision = cleanPPEText_(details.decision);
  const reviewedBy = cleanPPEText_(details.reviewedBy);
  const reviewComments = cleanPPEText_(details.comments);

  if (!requestID) {
    throw new Error("The request ID is required.");
  }

  if (decision !== "Approved" && decision !== "Rejected") {
    throw new Error("The review decision is invalid.");
  }

  if (!reviewedBy) {
    throw new Error("The reviewer name is required.");
  }

  if (decision === "Rejected" && !reviewComments) {
    throw new Error("A rejection reason is required.");
  }

  const sheet = getPPESheet_("PPE Requests");
  const rowNumber = findPPERequestRow_(requestID);

  if (!rowNumber) {
    throw new Error("The PPE request could not be found.");
  }

  const request =
    readPPERequestRow_(
      sheet.getRange(rowNumber, 1, 1, 18).getValues()[0],
      rowNumber
    );

  if (request.status !== "Awaiting Approval") {
    throw new Error(
      "This request has already been reviewed. Current status: " +
      request.status
    );
  }

  if (decision === "Approved") {
    reserveBudgetForPPERequest_(request);
  }

  let combinedComments = request.comments;

  if (reviewComments) {
    const reviewEntry =
      decision + " by " + reviewedBy + ": " + reviewComments;

    combinedComments =
      combinedComments
        ? combinedComments + "\n" + reviewEntry
        : reviewEntry;
  }

  setPPERequestDecision_(
    sheet,
    rowNumber,
    decision,
    reviewedBy,
    combinedComments
  );

  logPPEAction(
    reviewedBy,
    "PPE Request " + decision,
    requestID,
    reviewComments || "No additional review comments."
  );

  return {
    success: true,
    requestID: requestID,
    status: decision,
    message:
      "PPE request " +
      requestID +
      " was " +
      decision.toLowerCase() +
      " successfully."
  };
}


/* ============================================================
 * 9. EMAIL APPROVAL WEB APP
 * ============================================================ */

function getPPEApprovalWebAppUrl() {
  const url =
    PropertiesService
      .getScriptProperties()
      .getProperty("PPE_APPROVAL_WEB_APP_URL");

  if (!url) {
    throw new Error(
      "The PPE approval web-app URL has not been saved."
    );
  }

  return url;
}

function createPPEApprovalToken_(propertyPrefix, idName, idValue) {
  const token = Utilities.getUuid();
  const tokenData = { createdAt: new Date().getTime() };

  tokenData[idName] = cleanPPEText_(idValue);

  PropertiesService
    .getScriptProperties()
    .setProperty(
      propertyPrefix + token,
      JSON.stringify(tokenData)
    );

  return token;
}

/**
 * Web app entry point:
 * - no parameters / ?page=request → Manager PPE request form
 * - ?requestID=&token=            → single request approval
 * - ?bulkRequestID=&bulkToken=    → bulk request approval
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) || {};

    const page = cleanPPEKey_(params.page);
    const requestID = cleanPPEText_(params.requestID);
    const token = cleanPPEText_(params.token);
    const action = cleanPPEKey_(params.action);
    const comments = cleanPPEText_(params.comments);
    const bulkRequestID = cleanPPEText_(params.bulkRequestID);
    const bulkToken = cleanPPEText_(params.bulkToken);

    if (bulkRequestID && bulkToken) {
      return handlePPEBulkApprovalRequest_(
        params,
        bulkRequestID,
        bulkToken,
        action
      );
    }

    if (page === "request" || (!requestID && !token)) {
      return HtmlService
        .createHtmlOutputFromFile("ManagerPPERequest")
        .setTitle("PPE Request");
    }

    if (!requestID || !token) {
      return createPPEApprovalResultPage(
        "Invalid Link",
        "The approval link is incomplete or invalid.",
        false
      );
    }

    const properties = PropertiesService.getScriptProperties();
    const tokenKey = "PPE_APPROVAL_" + token;
    const tokenJson = properties.getProperty(tokenKey);

    if (!tokenJson) {
      return createPPEApprovalResultPage(
        "Link Expired",
        "This approval link is invalid, expired or has already been used.",
        false
      );
    }

    if (cleanPPEText_(JSON.parse(tokenJson).requestID) !== requestID) {
      return createPPEApprovalResultPage(
        "Invalid Link",
        "This approval link does not match the request.",
        false
      );
    }

    if (!action) {
      return createPPEApprovalReviewPage(requestID, token);
    }

    if (action !== "approve" && action !== "reject") {
      return createPPEApprovalResultPage(
        "Invalid Action",
        "The selected approval action is not valid.",
        false
      );
    }

    if (action === "reject" && !comments) {
      return createPPEApprovalReviewPage(
        requestID,
        token,
        "Please enter a reason before rejecting the request.",
        comments
      );
    }

    processPPEEmailApproval(requestID, action, comments);

    // A token can only be used once.
    properties.deleteProperty(tokenKey);

    return createPPEApprovalResultPage(
      action === "approve" ? "Request Approved" : "Request Rejected",
      action === "approve"
        ? "The PPE request was approved successfully."
        : "The PPE request was rejected successfully.",
      true
    );

  } catch (error) {
    console.error("doGet error: " + error.message);

    return createPPEApprovalResultPage(
      "System Error",
      error.message || "An unexpected error occurred.",
      false
    );
  }
}

function handlePPEBulkApprovalRequest_(
  params,
  bulkRequestID,
  bulkToken,
  action
) {
  const properties = PropertiesService.getScriptProperties();
  const tokenKey = "PPE_BULK_APPROVAL_" + bulkToken;
  const tokenJson = properties.getProperty(tokenKey);

  if (!tokenJson) {
    return createPPEApprovalResultPage(
      "Link Expired",
      "This bulk approval link is invalid, expired or has already been used.",
      false
    );
  }

  if (
    cleanPPEText_(JSON.parse(tokenJson).bulkRequestID) !==
    bulkRequestID
  ) {
    return createPPEApprovalResultPage(
      "Invalid Link",
      "This approval link does not match the bulk PPE request.",
      false
    );
  }

  // First opening: show the line-by-line review page.
  if (!action) {
    return createPPEBulkApprovalReviewPage_(bulkRequestID, bulkToken);
  }

  if (action !== "submitbulkdecision") {
    return createPPEApprovalResultPage(
      "Invalid Action",
      "The selected bulk approval action is not valid.",
      false
    );
  }

  const lineCount = Number(params.lineCount || 0);

  if (!Number.isInteger(lineCount) || lineCount <= 0) {
    return createPPEBulkApprovalReviewPage_(
      bulkRequestID,
      bulkToken,
      "No PPE request-line decisions were received."
    );
  }

  const decisions = [];

  for (let i = 0; i < lineCount; i++) {
    const lineRequestID = cleanPPEText_(params["requestID_" + i]);
    const lineDecision = cleanPPEKey_(params["decision_" + i]);
    const rejectionReason = cleanPPEText_(params["rejectionReason_" + i]);

    let error = "";

    if (!lineRequestID) {
      error = "One of the PPE request lines is missing its Request ID.";
    } else if (lineDecision !== "approve" && lineDecision !== "reject") {
      error = "Please select Approve or Reject for every PPE request line.";
    } else if (lineDecision === "reject" && !rejectionReason) {
      error = "Please enter a rejection reason for every rejected PPE item.";
    }

    if (error) {
      return createPPEBulkApprovalReviewPage_(
        bulkRequestID,
        bulkToken,
        error
      );
    }

    decisions.push({
      requestID: lineRequestID,
      decision: lineDecision,
      rejectionReason: rejectionReason
    });
  }

  const result =
    processPPEBulkEmailApproval_(bulkRequestID, decisions);

  if (!result.success) {
    return createPPEApprovalResultPage(
      "Bulk Request Not Updated",
      result.message || "The bulk PPE request could not be updated.",
      false
    );
  }

  // Only consume the token after successful processing.
  properties.deleteProperty(tokenKey);

  let heading = "Bulk Request Updated";
  let message = "The bulk PPE request was processed successfully.";

  if (result.status === "Approved") {
    heading = "Bulk Request Approved";
    message = "All PPE request lines were approved successfully.";
  } else if (result.status === "Rejected") {
    heading = "Bulk Request Rejected";
    message = "All PPE request lines were rejected.";
  } else if (result.status === "Partially Approved") {
    heading = "Bulk Request Partially Approved";
    message =
      result.approvedCount +
      " PPE request line(s) were approved and " +
      result.rejectedCount +
      " line(s) were rejected.";
  }

  return createPPEApprovalResultPage(heading, message, true);
}

/**
 * Wraps page content in the shared web-page layout.
 */
function buildPPEWebPage_(title, maxWidth, innerHtml) {
  const html =
    '<!DOCTYPE html><html><head>' +
    '<base target="_top">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>' + escapePPEApprovalHtml(title) + '</title>' +
    '</head>' +
    '<body style="margin:0;padding:25px;background:#f4f6f8;' +
    'font-family:Arial,sans-serif;color:#1f2937;">' +
    '<div style="max-width:' + maxWidth + 'px;margin:30px auto;' +
    'background:#ffffff;padding:30px;border-radius:10px;' +
    'box-shadow:0 3px 12px rgba(0,0,0,0.12);">' +
    innerHtml +
    '</div></body></html>';

  return HtmlService
    .createHtmlOutput(html)
    .setTitle(title);
}

function buildPPEErrorBox_(errorMessage) {
  if (!errorMessage) {
    return "";
  }

  return (
    '<div style="background:#fde8e8;color:#9b1c1c;' +
    'border:1px solid #f8b4b4;padding:12px;border-radius:6px;' +
    'margin-bottom:18px;">' +
    escapePPEApprovalHtml(errorMessage) +
    '</div>'
  );
}

function createPPEApprovalResultPage(heading, message, success) {
  const background = success ? "#e6f4ea" : "#fce8e6";
  const textColour = success ? "#137333" : "#c5221f";

  return buildPPEWebPage_(
    heading || "PPE Request",
    600,
    '<h2 style="color:#1f4e78;margin-top:0;">' +
      escapePPEApprovalHtml(heading || "PPE Request") +
    '</h2>' +
    '<div style="background:' + background + ';color:' + textColour +
      ';padding:16px;border-radius:6px;line-height:1.5;">' +
      escapePPEApprovalHtml(message || "") +
    '</div>' +
    '<p style="margin-top:24px;color:#666;font-size:13px;">' +
      PPE_SYSTEM_NAME +
    '</p>'
  );
}

function createPPEApprovalReviewPage(
  requestID,
  token,
  errorMessage,
  existingComments
) {
  const buttonStyle =
    'flex:1;min-width:180px;border:none;color:#ffffff;' +
    'padding:14px 20px;font-size:14px;font-weight:bold;' +
    'border-radius:6px;cursor:pointer;';

  return buildPPEWebPage_(
    "PPE Request Approval",
    600,
    '<h2 style="margin-top:0;color:#17365d;">PPE REQUEST APPROVAL</h2>' +
    '<p><strong>Request ID:</strong> ' +
      escapePPEApprovalHtml(requestID) +
    '</p>' +
    buildPPEErrorBox_(errorMessage) +
    '<form method="get" target="_top" action="' +
      escapePPEApprovalHtml(getPPEApprovalWebAppUrl()) + '">' +
      '<input type="hidden" name="requestID" value="' +
        escapePPEApprovalHtml(requestID) + '">' +
      '<input type="hidden" name="token" value="' +
        escapePPEApprovalHtml(token) + '">' +
      '<label for="comments" style="display:block;font-weight:bold;' +
        'margin-bottom:8px;">Comments / Rejection Reason</label>' +
      '<textarea id="comments" name="comments" rows="5" ' +
        'placeholder="Comments are optional for approval, but required for rejection." ' +
        'style="width:100%;box-sizing:border-box;padding:12px;' +
        'border:1px solid #cbd5e1;border-radius:6px;' +
        'font-family:Arial,sans-serif;font-size:14px;resize:vertical;">' +
        escapePPEApprovalHtml(existingComments || "") +
      '</textarea>' +
      '<div style="display:flex;gap:12px;margin-top:22px;flex-wrap:wrap;">' +
        '<button type="submit" name="action" value="approve" style="' +
          buttonStyle + 'background:#16803c;">APPROVE REQUEST</button>' +
        '<button type="submit" name="action" value="reject" style="' +
          buttonStyle + 'background:#c81e1e;">REJECT REQUEST</button>' +
      '</div>' +
    '</form>'
  );
}

/**
 * Applies a Stores decision from the single-request email link.
 */
function processPPEEmailApproval(requestID, action, comments) {
  const sheet = getPPESheet_("PPE Requests");

  requestID = cleanPPEText_(requestID);
  action = cleanPPEKey_(action);
  comments = cleanPPEText_(comments);

  if (!requestID) {
    throw new Error("The Request ID is missing.");
  }

  if (action !== "approve" && action !== "reject") {
    throw new Error("The approval action is invalid.");
  }

  if (action === "reject" && !comments) {
    throw new Error("A rejection reason is required.");
  }

  const rowNumber = findPPERequestRow_(requestID);

  if (!rowNumber) {
    throw new Error("PPE request not found: " + requestID);
  }

  const request =
    readPPERequestRow_(
      sheet.getRange(rowNumber, 1, 1, 18).getValues()[0],
      rowNumber
    );

  if (
    ["Approved", "Rejected", "Cancelled"].includes(request.status)
  ) {
    throw new Error(
      "This request has already been processed. Current status: " +
      request.status
    );
  }

  const approvedBy =
    Session.getActiveUser().getEmail() || "Stores Approval";

  const newStatus = action === "approve" ? "Approved" : "Rejected";

  const finalComments =
    comments ||
    (action === "approve"
      ? "Approved through Stores review."
      : "Rejected through Stores review.");

  if (action === "approve") {
    reserveBudgetForPPERequest_(request);
  }

  setPPERequestDecision_(
    sheet,
    rowNumber,
    newStatus,
    approvedBy,
    finalComments
  );

  SpreadsheetApp.flush();

  try {
    sendPPERequestDecisionNotification_(
      request,
      newStatus,
      approvedBy,
      finalComments
    );
  } catch (notificationError) {
    console.error(
      "Manager decision email failed: " + notificationError.message
    );
  }

  if (action === "approve") {
    try {
      sendPPEStoresNotification(request);
    } catch (storesError) {
      console.error(
        "Stores notification failed: " + storesError.message
      );
    }
  }

  logPPEAction(
    approvedBy,
    action === "approve"
      ? "PPE Request Approved"
      : "PPE Request Rejected",
    requestID,
    finalComments
  );

  return {
    success: true,
    requestID: requestID,
    status: newStatus,
    processedBy: approvedBy
  };
}

function createPPEBulkApprovalReviewPage_(
  bulkRequestID,
  token,
  errorMessage
) {
  const rows = getPPERequestsByBulkID_(bulkRequestID);

  if (rows.length === 0) {
    throw new Error(
      "No PPE request lines were found for " + bulkRequestID + "."
    );
  }

  const stockMap = getPPEStockMap_(getPPESheet_("Current Stock"));
  const cell = 'padding:10px;border:1px solid #ddd;vertical-align:top;';
  const inputStyle =
    'width:100%;box-sizing:border-box;padding:7px;' +
    'border:1px solid #ccc;border-radius:4px;';

  let tableRows = "";

  rows.forEach(function(row, index) {
    const stock = stockMap[row.ppeID.toLowerCase()];
    const currentStock = stock ? stock.currentStock : 0;
    const stockEnough = currentStock >= row.quantity;

    let stockStyle = "color:#188038;font-weight:bold;";
    let defaultReason = "";

    if (currentStock === 0) {
      stockStyle = "color:#d93025;font-weight:bold;";
      defaultReason = "Out of stock";
    } else if (!stockEnough) {
      stockStyle = "color:#b45309;font-weight:bold;";
      defaultReason = "Insufficient stock";
    }

    // Enough stock → Approve by default, otherwise Reject.
    tableRows +=
      '<tr>' +
        '<td style="' + cell + '">' + escapePPEApprovalHtml(row.employeeName) + '</td>' +
        '<td style="' + cell + '">' + escapePPEApprovalHtml(row.ppeDescription) + '</td>' +
        '<td style="' + cell + '">' + escapePPEApprovalHtml(row.size || "Standard") + '</td>' +
        '<td style="' + cell + 'text-align:center;">' + row.quantity + '</td>' +
        '<td style="' + cell + 'text-align:center;"><span style="' +
          stockStyle + '">' + currentStock + '</span></td>' +
        '<td style="' + cell + '">' + escapePPEApprovalHtml(row.reason) + '</td>' +
        '<td style="' + cell + 'min-width:180px;">' +
          '<input type="hidden" name="requestID_' + index + '" value="' +
            escapePPEApprovalHtml(row.requestID) + '">' +
          '<select name="decision_' + index + '" style="' + inputStyle +
            'padding:8px;margin-bottom:8px;">' +
            '<option value="approve"' + (stockEnough ? ' selected' : '') + '>Approve</option>' +
            '<option value="reject"' + (!stockEnough ? ' selected' : '') + '>Reject</option>' +
          '</select>' +
          '<input type="text" name="rejectionReason_' + index + '" value="' +
            escapePPEApprovalHtml(defaultReason) +
            '" placeholder="Rejection reason" style="' + inputStyle + '">' +
        '</td>' +
      '</tr>';
  });

  const header = 'padding:10px;border:1px solid #ddd;';

  return buildPPEWebPage_(
    "PPE Request Review",
    1100,
    '<h2 style="color:#17365d;margin-top:0;">PPE REQUEST REVIEW</h2>' +
    '<p><strong>Bulk Request ID:</strong> ' +
      escapePPEApprovalHtml(bulkRequestID) + '</p>' +
    '<p><strong>Request Lines:</strong> ' + rows.length + '</p>' +
    '<p style="color:#475569;font-size:14px;">Review each PPE item individually. ' +
      'You can approve available items and reject unavailable items.</p>' +
    buildPPEErrorBox_(errorMessage) +
    '<form method="get" target="_top" action="' +
      escapePPEApprovalHtml(getPPEApprovalWebAppUrl()) + '">' +
      '<input type="hidden" name="bulkRequestID" value="' +
        escapePPEApprovalHtml(bulkRequestID) + '">' +
      '<input type="hidden" name="bulkToken" value="' +
        escapePPEApprovalHtml(token) + '">' +
      '<input type="hidden" name="lineCount" value="' + rows.length + '">' +
      '<div style="overflow-x:auto;">' +
        '<table style="border-collapse:collapse;width:100%;margin:20px 0;font-size:14px;">' +
          '<tr style="background:#1f4e78;color:white;">' +
            '<th style="' + header + '">Employee</th>' +
            '<th style="' + header + '">PPE</th>' +
            '<th style="' + header + '">Size</th>' +
            '<th style="' + header + '">Requested</th>' +
            '<th style="' + header + '">Stock</th>' +
            '<th style="' + header + '">Request Reason</th>' +
            '<th style="' + header + '">Decision</th>' +
          '</tr>' +
          tableRows +
        '</table>' +
      '</div>' +
      '<div style="background:#eff6ff;padding:12px;border-radius:6px;' +
        'font-size:13px;color:#1e3a8a;margin-bottom:20px;">' +
        '<strong>Stock guidance:</strong> Items with sufficient stock are ' +
        'pre-selected for approval. Items with insufficient stock are ' +
        'pre-selected for rejection. You can change any decision before submitting.' +
      '</div>' +
      '<button type="submit" name="action" value="submitBulkDecision" ' +
        'style="width:100%;background:#17365d;color:white;border:none;' +
        'border-radius:6px;padding:15px;font-size:16px;font-weight:bold;' +
        'cursor:pointer;">SUBMIT DECISION</button>' +
    '</form>'
  );
}

/**
 * Applies line-by-line Stores decisions for a bulk request.
 */
function processPPEBulkEmailApproval_(bulkRequestID, decisions) {
  const sheet = getPPESheet_("PPE Requests");

  if (!Array.isArray(decisions) || decisions.length === 0) {
    return {
      success: false,
      message: "No PPE approval decisions were received."
    };
  }

  const bulkRows = {};

  getPPERequestsByBulkID_(bulkRequestID).forEach(function(request) {
    bulkRows[request.requestID] = request;
  });

  const bulkRequestIDs = Object.keys(bulkRows);

  if (bulkRequestIDs.length === 0) {
    return {
      success: false,
      message:
        "No PPE request lines were found for " + bulkRequestID + "."
    };
  }

  if (decisions.length !== bulkRequestIDs.length) {
    return {
      success: false,
      message:
        "Every PPE request line must be reviewed before the decision can be submitted."
    };
  }

  const seenRequestIDs = {};
  const approvedLines = [];
  const rejectedLines = [];

  decisions.forEach(function(decision) {
    const requestID = cleanPPEText_(decision.requestID);
    const action = cleanPPEKey_(decision.decision);
    const rejectionReason = cleanPPEText_(decision.rejectionReason);

    if (seenRequestIDs[requestID]) {
      throw new Error(
        "Duplicate PPE request decision received for " + requestID + "."
      );
    }

    seenRequestIDs[requestID] = true;

    const request = bulkRows[requestID];

    if (!request) {
      throw new Error(
        "Request " +
        requestID +
        " does not belong to bulk request " +
        bulkRequestID +
        "."
      );
    }

    if (request.status !== "Awaiting Approval") {
      throw new Error(
        "Request " +
        requestID +
        " has already been processed. Current status: " +
        request.status
      );
    }

    if (action === "approve") {
      approvedLines.push(request);
    } else if (action === "reject") {
      if (!rejectionReason) {
        throw new Error(
          "A rejection reason is required for request " + requestID + "."
        );
      }

      request.rejectionReason = rejectionReason;
      rejectedLines.push(request);
    } else {
      throw new Error("Invalid decision for request " + requestID + ".");
    }
  });

  /*
   * If the same PPE item appears more than once, compare
   * the TOTAL approved quantity with current stock.
   */
  const stockMap = getPPEStockMap_(getPPESheet_("Current Stock"));
  const approvedQuantityByPPE = {};

  approvedLines.forEach(function(request) {
    const key = request.ppeID.toLowerCase();
    approvedQuantityByPPE[key] =
      Number(approvedQuantityByPPE[key] || 0) + request.quantity;
  });

  Object.keys(approvedQuantityByPPE).forEach(function(key) {
    const requestedQuantity = approvedQuantityByPPE[key];
    const availableStock = stockMap[key] ? stockMap[key].currentStock : 0;

    if (requestedQuantity <= availableStock) {
      return;
    }

    const example =
      approvedLines.find(function(request) {
        return request.ppeID.toLowerCase() === key;
      });

    throw new Error(
      "Insufficient stock to approve all selected lines for " +
      (example
        ? example.ppeDescription + " – " + (example.size || "Standard")
        : key) +
      ". Available stock: " +
      availableStock +
      ". Total selected for approval: " +
      requestedQuantity +
      ". Please reject enough lines to match available stock."
    );
  });

  const approvedBy =
    Session.getActiveUser().getEmail() || "Stores Approval";

  approvedLines.forEach(function(request) {
    reserveBudgetForPPERequest_(request);
  });

  approvedLines.forEach(function(request) {
    setPPERequestDecision_(
      sheet,
      request.rowNumber,
      "Approved",
      approvedBy,
      "Approved through Stores bulk review."
    );
  });

  rejectedLines.forEach(function(request) {
    setPPERequestDecision_(
      sheet,
      request.rowNumber,
      "Rejected",
      approvedBy,
      request.rejectionReason
    );
  });

  SpreadsheetApp.flush();

  // Overall result (column N keeps the per-line status).
  let overallStatus = "Partially Approved";

  if (approvedLines.length === bulkRequestIDs.length) {
    overallStatus = "Approved";
  } else if (rejectedLines.length === bulkRequestIDs.length) {
    overallStatus = "Rejected";
  }

  try {
    sendPPEBulkManagerDecisionNotification_(
      bulkRequestID,
      overallStatus,
      approvedBy
    );
  } catch (managerEmailError) {
    console.error(
      "Bulk manager notification failed: " + managerEmailError.message
    );
  }

  logPPEAction(
    approvedBy,
    "Bulk PPE Request Reviewed",
    bulkRequestID,
    "Result: " +
      overallStatus +
      " | Approved lines: " +
      approvedLines.length +
      " | Rejected lines: " +
      rejectedLines.length
  );

  return {
    success: true,
    bulkRequestID: bulkRequestID,
    status: overallStatus,
    approvedCount: approvedLines.length,
    rejectedCount: rejectedLines.length,
    requestsUpdated: bulkRequestIDs.length
  };
}


/* ============================================================
 * 10. EMAIL NOTIFICATIONS
 * ============================================================
 *
 * Approvers sheet:
 * A Branch | B Department | C Approval Type | D Name | E Email
 * F Level | G Max Amount | H Active | I Backup | J Backup Email
 *
 * Stores contact:  Branch = All, Approval Type = PPE Issue
 * Branch manager:  Approval Type = PPE Request Notification
 */

function findPPEApproverContact_(branch, approvalType) {
  const data =
    getPPESheet_("Approvers").getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const email = cleanPPEText_(data[i][4]);

    if (
      cleanPPEKey_(data[i][0]) === cleanPPEKey_(branch) &&
      cleanPPEKey_(data[i][2]) === approvalType &&
      cleanPPEKey_(data[i][7]) === "yes" &&
      email
    ) {
      return {
        name: cleanPPEText_(data[i][3]),
        email: email
      };
    }
  }

  return null;
}

function getPPEStoresContact() {
  const contact = findPPEApproverContact_("All", "ppe issue");

  if (!contact) {
    throw new Error("No active central Stores approver was found.");
  }

  return {
    storesName: contact.name || "Stores",
    storesEmail: contact.email
  };
}

function getPPERequestNotificationContact(branch) {
  const contact =
    findPPEApproverContact_(branch, "ppe request notification");

  return contact
    ? { managerName: contact.name, managerEmail: contact.email }
    : null;
}

function sendPPEEmail_(to, subject, body, htmlBody) {
  MailApp.sendEmail({
    to: to,
    subject: subject,
    body: body,
    htmlBody: htmlBody,
    name: PPE_SYSTEM_NAME
  });
}

/**
 * Standard email layout: heading, greeting, intro, content.
 */
function buildPPEEmailHtml_(
  heading,
  recipientName,
  introHtml,
  contentHtml,
  maxWidth
) {
  return (
    '<div style="font-family:Arial,sans-serif;max-width:' +
      (maxWidth || 650) + 'px;margin:auto;">' +
      '<h2 style="color:#1f4e78;">' + heading + '</h2>' +
      '<p>Hi ' + escapePPEApprovalHtml(recipientName) + ',</p>' +
      '<p>' + introHtml + '</p>' +
      contentHtml +
      '<p>Regards,<br>' + PPE_SYSTEM_NAME + '</p>' +
    '</div>'
  );
}

function createPPEEmailRow(label, value) {
  return (
    '<tr>' +
      '<td style="padding:9px;border:1px solid #ddd;' +
        'background:#f5f5f5;width:35%;"><strong>' +
        escapePPEApprovalHtml(label) +
      '</strong></td>' +
      '<td style="padding:9px;border:1px solid #ddd;">' +
        escapePPEApprovalHtml(value) +
      '</td>' +
    '</tr>'
  );
}

/**
 * rows = [[label, value], ...]
 */
function buildPPEEmailDetailTable_(rows) {
  return (
    '<table style="border-collapse:collapse;width:100%;margin:20px 0;">' +
      rows.map(function(row) {
        return createPPEEmailRow(row[0], row[1]);
      }).join("") +
    '</table>'
  );
}

function buildPPEEmailText_(recipientName, intro, rows, closing) {
  return (
    "Hi " + recipientName + ",\n\n" +
    intro + "\n\n" +
    rows.map(function(row) {
      return row[0] + ": " + row[1];
    }).join("\n") +
    "\n\n" +
    (closing ? closing + "\n\n" : "") +
    "Regards,\n" + PPE_SYSTEM_NAME
  );
}

/**
 * Table with a header row. columns = [{ title, value(row), style }]
 */
function buildPPEEmailLineTable_(columns, rows) {
  const cell = 'padding:8px;border:1px solid #ddd;';

  return (
    '<table style="border-collapse:collapse;width:100%;margin:20px 0;">' +
      '<tr style="background:#1f4e78;color:white;">' +
        columns.map(function(column) {
          return '<th style="' + cell + '">' + column.title + '</th>';
        }).join("") +
      '</tr>' +
      rows.map(function(row) {
        return (
          '<tr>' +
            columns.map(function(column) {
              const style =
                typeof column.style === "function"
                  ? column.style(row)
                  : (column.style || "");

              return (
                '<td style="' + cell + style + '">' +
                  escapePPEApprovalHtml(column.value(row)) +
                '</td>'
              );
            }).join("") +
          '</tr>'
        );
      }).join("") +
    '</table>'
  );
}

/**
 * Email to Stores when a single PPE request is submitted.
 */
function sendPPEApprovalNotification(details) {
  if (!details) {
    throw new Error("No PPE request details were received.");
  }

  const stores = getPPEStoresContact();

  const token =
    createPPEApprovalToken_(
      "PPE_APPROVAL_",
      "requestID",
      details.requestID
    );

  const reviewUrl =
    getPPEApprovalWebAppUrl() +
    "?requestID=" + encodeURIComponent(details.requestID) +
    "&token=" + encodeURIComponent(token);

  const rows = [
    ["Request Number", details.requestID],
    ["Employee", details.employeeID + " – " + details.employeeName],
    ["Branch", details.branch],
    ["Department", details.department],
    ["PPE Item", details.ppeID + " – " + details.ppeDescription],
    ["Size", details.size || "Not specified"],
    ["Quantity", details.quantity],
    ["Reason", details.reason],
    ["Urgency", details.urgency],
    ["Comments", details.comments || "None"]
  ];

  const intro =
    "A new PPE request requires Stores review and approval.";

  sendPPEEmail_(
    stores.storesEmail,
    "PPE Request Awaiting Stores Review – " + details.requestID,
    buildPPEEmailText_(stores.storesName, intro, rows),
    buildPPEEmailHtml_(
      "PPE Request Awaiting Stores Review",
      stores.storesName,
      intro,
      buildPPEEmailDetailTable_(rows) +
      '<div style="margin:25px 0;"><a href="' + reviewUrl + '" style="' +
        'display:inline-block;background:#188038;color:white;' +
        'padding:14px 24px;text-decoration:none;border-radius:5px;' +
        'font-weight:bold;">REVIEW REQUEST</a></div>' +
      '<p style="font-size:13px;color:#666;">' +
        'The review link expires after seven days.</p>'
    )
  );

  return {
    sent: true,
    managerName: stores.storesName,
    managerEmail: stores.storesEmail
  };
}

/**
 * Email to Stores once a request is approved and ready to issue.
 */
function sendPPEStoresNotification(details) {
  if (!details) {
    throw new Error(
      "No approved PPE request details were received."
    );
  }

  const stores = getPPEStoresContact();

  const rows = [
    ["Request Number", details.requestID],
    ["Employee", details.employeeID + " – " + details.employeeName],
    ["Branch", details.branch],
    ["Department", details.department],
    ["PPE Item", details.ppeID + " – " + details.ppeDescription],
    ["Size", details.size || "Not specified"],
    ["Quantity", details.quantity]
  ];

  const intro =
    "A PPE request has been approved and is ready for issue.";

  const closing =
    "Please issue the PPE through the PPE Management System.";

  sendPPEEmail_(
    stores.storesEmail,
    "Approved PPE Request Ready for Issue – " + details.requestID,
    buildPPEEmailText_(stores.storesName, intro, rows, closing),
    buildPPEEmailHtml_(
      "APPROVED PPE REQUEST",
      stores.storesName,
      intro,
      buildPPEEmailDetailTable_(rows) + '<p>' + closing + '</p>'
    )
  );

  return {
    sent: true,
    storesName: stores.storesName,
    storesEmail: stores.storesEmail
  };
}

/**
 * Email to the branch manager with the Stores decision
 * on a single request.
 */
function sendPPERequestDecisionNotification_(
  requestDetails,
  decision,
  decisionBy,
  comments
) {
  if (!requestDetails) {
    throw new Error(
      "No PPE request details were received for the manager notification."
    );
  }

  const branch = cleanPPEText_(requestDetails.branch);

  if (!branch) {
    throw new Error("The PPE request does not contain a branch.");
  }

  const contact = getPPERequestNotificationContact(branch);

  if (!contact) {
    throw new Error(
      'No active "PPE Request Notification" manager was found for branch "' +
      branch +
      '".'
    );
  }

  const approved = cleanPPEKey_(decision) === "approved";

  if (!approved && cleanPPEKey_(decision) !== "rejected") {
    throw new Error("Invalid PPE request decision: " + decision);
  }

  const managerName = contact.managerName || "Branch Manager";
  const decisionText = approved ? "Approved" : "Rejected";

  const statusMessage =
    approved
      ? "The PPE request has been approved by Stores and is awaiting issue."
      : "The PPE request has been rejected by Stores.";

  const closing =
    approved
      ? "Stores will now proceed with issuing the approved PPE."
      : "Please contact Stores if you require further clarification regarding the rejection.";

  const rows = [
    ["Request ID", requestDetails.requestID],
    ["Employee", requestDetails.employeeName],
    ["Branch", requestDetails.branch],
    ["Department", requestDetails.department],
    ["PPE Item", requestDetails.ppeDescription],
    ["Size", requestDetails.size || "Not specified"],
    ["Quantity", requestDetails.quantity],
    ["Decision", decisionText],
    ["Decision By", decisionBy || "Stores"],
    ["Comments", comments || "None"]
  ];

  sendPPEEmail_(
    contact.managerEmail,
    "PPE Request " + decisionText + " – " + requestDetails.requestID,
    buildPPEEmailText_(managerName, statusMessage, rows, closing),
    buildPPEEmailHtml_(
      "PPE REQUEST " + decisionText.toUpperCase(),
      managerName,
      escapePPEApprovalHtml(statusMessage),
      buildPPEEmailDetailTable_(rows) + '<p>' + closing + '</p>'
    )
  );

  return {
    sent: true,
    managerName: managerName,
    managerEmail: contact.managerEmail,
    branch: branch,
    decision: decisionText
  };
}

/**
 * One email to Stores for a whole bulk request.
 */
function sendPPEBulkApprovalNotification_(bulkRequestID) {
  const requests = getPPERequestsByBulkID_(bulkRequestID);

  if (requests.length === 0) {
    throw new Error(
      "No PPE requests were found for bulk request " +
      bulkRequestID +
      "."
    );
  }

  const stores = getPPEStoresContact();

  const token =
    createPPEApprovalToken_(
      "PPE_BULK_APPROVAL_",
      "bulkRequestID",
      bulkRequestID
    );

  const reviewUrl =
    getPPEApprovalWebAppUrl() +
    "?bulkRequestID=" + encodeURIComponent(bulkRequestID) +
    "&bulkToken=" + encodeURIComponent(token);

  const branch = requests[0].branch || "Multiple";

  const totalQuantity =
    requests.reduce(function(total, request) {
      return total + Number(request.quantity || 0);
    }, 0);

  const lineTable =
    buildPPEEmailLineTable_(
      [
        { title: "Employee", value: function(r) { return r.employeeName; } },
        { title: "PPE Item", value: function(r) { return r.ppeDescription; } },
        { title: "Size", value: function(r) { return r.size || "Standard"; } },
        { title: "Qty", value: function(r) { return r.quantity; }, style: "text-align:center;" },
        { title: "Reason", value: function(r) { return r.reason; } }
      ],
      requests
    );

  const htmlBody =
    buildPPEEmailHtml_(
      "BULK PPE REQUEST",
      stores.storesName,
      "A new bulk PPE request requires Stores review.",
      '<p>' +
        '<strong>Bulk Request:</strong> ' + escapePPEApprovalHtml(bulkRequestID) + '<br>' +
        '<strong>Branch:</strong> ' + escapePPEApprovalHtml(branch) + '<br>' +
        '<strong>Request Lines:</strong> ' + requests.length + '<br>' +
        '<strong>Total Quantity:</strong> ' + totalQuantity +
      '</p>' +
      lineTable +
      '<div style="margin:25px 0;"><a href="' + reviewUrl + '" style="' +
        'display:inline-block;background:#188038;color:white;' +
        'padding:14px 24px;text-decoration:none;border-radius:5px;' +
        'font-weight:bold;">REVIEW BULK REQUEST</a></div>',
      800
    );

  const body =
    "Bulk PPE request " + bulkRequestID + " requires Stores review.\n\n" +
    "Branch: " + branch + "\n" +
    "Request Lines: " + requests.length + "\n" +
    "Total Quantity: " + totalQuantity + "\n\n" +
    "Please use the review link in this email.";

  sendPPEEmail_(
    stores.storesEmail,
    "Bulk PPE Request Awaiting Stores Review – " + bulkRequestID,
    body,
    htmlBody
  );

  return {
    sent: true,
    bulkRequestID: bulkRequestID,
    lines: requests.length,
    totalQuantity: totalQuantity,
    storesEmail: stores.storesEmail
  };
}

/**
 * One summary email to the branch manager after a bulk review.
 */
function sendPPEBulkManagerDecisionNotification_(
  bulkRequestID,
  overallStatus,
  decisionBy
) {
  const rows = getPPERequestsByBulkID_(bulkRequestID);

  if (rows.length === 0) {
    throw new Error(
      "No request lines were found for " + bulkRequestID
    );
  }

  const branch = rows[0].branch;
  const manager = getPPERequestNotificationContact(branch);

  if (!manager) {
    throw new Error(
      "No active branch manager notification contact was found for " +
      branch
    );
  }

  const approvedCount =
    rows.filter(function(row) { return row.status === "Approved"; }).length;

  const rejectedCount =
    rows.filter(function(row) { return row.status === "Rejected"; }).length;

  const summaryRows = [
    ["Overall Result", overallStatus],
    ["Approved Lines", approvedCount],
    ["Rejected Lines", rejectedCount],
    ["Decision By", decisionBy]
  ];

  const lineTable =
    buildPPEEmailLineTable_(
      [
        { title: "Employee", value: function(r) { return r.employeeName; } },
        { title: "PPE", value: function(r) { return r.ppeDescription; } },
        { title: "Size", value: function(r) { return r.size || "Standard"; } },
        { title: "Qty", value: function(r) { return r.quantity; }, style: "text-align:center;" },
        {
          title: "Decision",
          value: function(r) { return r.status; },
          style: function(r) {
            return (
              "font-weight:bold;color:" +
              (r.status === "Approved" ? "#188038" : "#d93025") +
              ";"
            );
          }
        },
        { title: "Comments", value: function(r) { return r.comments; } }
      ],
      rows
    );

  const htmlBody =
    buildPPEEmailHtml_(
      "PPE REQUEST REVIEW COMPLETED",
      manager.managerName,
      "Stores has completed the review of bulk PPE request <strong>" +
        escapePPEApprovalHtml(bulkRequestID) +
        "</strong>.",
      buildPPEEmailDetailTable_(summaryRows) +
      lineTable +
      '<p>Approved PPE items are now available for issue through the PPE Management System.</p>' +
      '<p>Rejected PPE items have not reserved budget and will not appear as approved requests for issue.</p>',
      850
    );

  const body =
    buildPPEEmailText_(
      manager.managerName,
      "Stores has completed the review of bulk PPE request " +
        bulkRequestID + ".",
      summaryRows,
      "Please refer to the detailed table in this email for the individual PPE decisions."
    );

  sendPPEEmail_(
    manager.managerEmail,
    "Bulk PPE Request " + overallStatus + " – " + bulkRequestID,
    body,
    htmlBody
  );

  return {
    sent: true,
    managerName: manager.managerName,
    managerEmail: manager.managerEmail,
    overallStatus: overallStatus,
    approvedCount: approvedCount,
    rejectedCount: rejectedCount
  };
}


/* ============================================================
 * 11. CURRENT STOCK AND STOCK PLANNING
 * ============================================================ */

/**
 * Rebuilds Current Stock (A:Y) from Stock Transactions and
 * writes planning figures to PPE Items (O:T).
 *
 * PPE Items O:T = Avg Monthly Usage | Lead Time Days (manual)
 *                 | Safety Stock | Reorder Point | Target Stock
 *                 | Suggested Order Qty
 */
function rebuildPPECurrentStock() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const itemSheet = getPPESheet_("PPE Items");
  const transactionSheet = getPPESheet_("Stock Transactions");
  const stockSheet = getPPESheet_("Current Stock");

  const itemData = itemSheet.getDataRange().getValues();
  const transactionData = transactionSheet.getDataRange().getValues();

  const stockTotals = {};
  const usageTotals = {};

  // Average monthly usage is based on the last 3 months.
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  /*
   * Stock Transactions: B Timestamp | D PPE ID
   *                     G Quantity In | H Quantity Out
   */
  for (let i = 1; i < transactionData.length; i++) {
    const transactionDate = transactionData[i][1];
    const ppeID = cleanPPEKey_(transactionData[i][3]);

    if (!ppeID) {
      continue;
    }

    const quantityIn = toPPENumber_(transactionData[i][6]);
    const quantityOut = toPPENumber_(transactionData[i][7]);

    if (!stockTotals[ppeID]) {
      stockTotals[ppeID] = { totalReceived: 0, totalIssued: 0 };
    }

    if (Number.isFinite(quantityIn)) {
      stockTotals[ppeID].totalReceived += quantityIn;
    }

    if (Number.isFinite(quantityOut)) {
      stockTotals[ppeID].totalIssued += quantityOut;
    }

    if (
      transactionDate instanceof Date &&
      !isNaN(transactionDate) &&
      transactionDate >= threeMonthsAgo &&
      quantityOut > 0
    ) {
      usageTotals[ppeID] = (usageTotals[ppeID] || 0) + quantityOut;
    }
  }

  const stockRows = [];
  const planningRows = [];

  for (let i = 1; i < itemData.length; i++) {
    const row = itemData[i];
    const ppeID = cleanPPEText_(row[0]);

    // Keep planning rows aligned with PPE Items rows.
    if (!ppeID) {
      planningRows.push(["", row[15] || "", "", "", "", ""]);
      continue;
    }

    const key = ppeID.toLowerCase();
    const totals = stockTotals[key] || { totalReceived: 0, totalIssued: 0 };

    const totalReceived = Number(totals.totalReceived || 0);
    const totalIssued = Number(totals.totalIssued || 0);
    const currentStock = totalReceived - totalIssued;

    const minimumStock = toPPENumber_(row[6]);
    const reorderQuantity = toPPENumber_(row[7]);
    const unitCost = toPPENumber_(row[8]);
    const leadTimeDays = toPPENumber_(row[15]); // P – entered manually

    const averageMonthlyUsage = Number(usageTotals[key] || 0) / 3;

    let safetyStock;
    let reorderPoint;
    let targetStock;

    if (averageMonthlyUsage > 0) {
      safetyStock =
        Math.ceil(
          Math.max(
            averageMonthlyUsage * 0.25,
            averageMonthlyUsage * (leadTimeDays / 30) * 0.5
          )
        );

      /*
       * Reorder point = usage during the supplier lead time
       * + safety stock. Never below the manual Minimum Stock.
       */
      reorderPoint =
        Math.max(
          Math.ceil(
            (averageMonthlyUsage / 30) * leadTimeDays + safetyStock
          ),
          minimumStock
        );

      /*
       * Target stock = reorder point + 2 months of usage, so an
       * order placed now still covers the lead time and leaves
       * two months' cover. Never below Minimum + Reorder Qty.
       */
      targetStock =
        Math.max(
          reorderPoint + Math.ceil(averageMonthlyUsage * 2),
          minimumStock + reorderQuantity
        );

    } else {
      // No usage history yet: fall back to Minimum / Reorder Qty.
      safetyStock = minimumStock;
      reorderPoint = minimumStock;
      targetStock = Math.max(minimumStock + reorderQuantity, minimumStock);
    }

    const suggestedOrderQty = Math.max(0, targetStock - currentStock);

    let stockPlanningStatus = "Stock OK";

    if (currentStock <= 0) {
      stockPlanningStatus = "OUT OF STOCK";
    } else if (currentStock <= reorderPoint) {
      stockPlanningStatus = "REORDER NOW";
    } else if (currentStock <= reorderPoint + safetyStock) {
      stockPlanningStatus = "MONITOR";
    }

    let stockStatus = "In Stock";

    if (currentStock <= 0) {
      stockStatus = "Out of Stock";
    } else if (currentStock <= minimumStock) {
      stockStatus = "Low Stock";
    }

    planningRows.push([
      averageMonthlyUsage, // O
      leadTimeDays,        // P
      safetyStock,         // Q
      reorderPoint,        // R
      targetStock,         // S
      suggestedOrderQty    // T
    ]);

    // Only active PPE items appear in Current Stock.
    if (!isPPEActive_(row[12])) {
      continue;
    }

    stockRows.push([
      ppeID,                                   // A
      row[1],                                  // B Category
      row[2],                                  // C Description
      row[4],                                  // D Size
      totalReceived,                           // E
      totalIssued,                             // F
      currentStock,                            // G
      minimumStock,                            // H
      reorderQuantity,                         // I
      stockStatus,                             // J
      row[9],                                  // K Supplier
      row[10],                                 // L Supplier Email
      unitCost,                                // M
      currentStock * unitCost,                 // N Stock Value
      "",                                      // O Open Order ID
      currentStock <= reorderPoint
        ? "Reorder Required"
        : "Stock Sufficient",                  // P Reorder Status
      "",                                      // Q Last Reorder Date
      averageMonthlyUsage,                     // R
      leadTimeDays,                            // S
      safetyStock,                             // T
      reorderPoint,                            // U
      targetStock,                             // V
      suggestedOrderQty,                       // W
      suggestedOrderQty * unitCost,            // X Estimated Order Cost
      stockPlanningStatus                      // Y
    ]);
  }

  if (planningRows.length > 0) {
    itemSheet
      .getRange(2, 15, planningRows.length, 6)
      .setValues(planningRows);
  }

  // Clear Current Stock A:Y without deleting the headings.
  const lastRow = stockSheet.getLastRow();

  if (lastRow > 1) {
    stockSheet
      .getRange(2, 1, lastRow - 1, 25)
      .clearContent();
  }

  if (stockRows.length > 0) {
    stockSheet
      .getRange(2, 1, stockRows.length, 25)
      .setValues(stockRows);
  }

  stockSheet.getRange("M2:N").setNumberFormat(PPE_CURRENCY_FORMAT);
  stockSheet.getRange("X2:X").setNumberFormat(PPE_CURRENCY_FORMAT);
  stockSheet.getRange("R2:R").setNumberFormat("0.00");
  itemSheet.getRange("I2:I").setNumberFormat(PPE_CURRENCY_FORMAT);
  itemSheet.getRange("O2:O").setNumberFormat("0.00");

  SpreadsheetApp.flush();

  ss.toast(
    "Current stock and stock planning have been recalculated.",
    "PPE Management",
    5
  );

  return {
    success: true,
    itemsUpdated: stockRows.length
  };
}


/* ============================================================
 * 12. OPENING STOCK AND SYSTEM REPAIR
 * ============================================================ */

/**
 * Opening Stock: A PPE ID | B Description | C Size | D Quantity
 *                E Unit Cost | F Branch | G Loaded (Yes)
 */
function loadOpeningStock() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const openingSheet = getPPESheet_("Opening Stock");
  const data = openingSheet.getDataRange().getValues();

  if (data.length < 2) {
    throw new Error("No opening stock rows were found.");
  }

  const errors = [];
  let loadedCount = 0;

  const receivedBy =
    Session.getActiveUser().getEmail() || "System Administrator";

  for (let i = 1; i < data.length; i++) {
    const sheetRow = i + 1;
    const ppeID = cleanPPEText_(data[i][0]);
    const quantity = toPPENumber_(data[i][3]);
    const unitCost = toPPENumber_(data[i][4]);
    const branch = cleanPPEText_(data[i][5]);

    // Skip loaded, empty and zero-quantity rows.
    if (
      cleanPPEKey_(data[i][6]) === "yes" ||
      !ppeID ||
      data[i][3] === "" ||
      data[i][3] === null ||
      quantity === 0
    ) {
      continue;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      errors.push(
        "Row " + sheetRow +
        ": Quantity must be a valid number and cannot be negative."
      );
      continue;
    }

    if (!branch) {
      errors.push("Row " + sheetRow + ": Branch is missing.");
      continue;
    }

    try {
      submitStockReceiptFromSidebar({
        ppeID: ppeID,
        quantity: quantity,
        supplier: "Opening Balance",
        deliveryNote: "SYSTEM GO-LIVE",
        purchaseOrder: "",
        unitCost: unitCost,
        branch: branch,
        receivedBy: receivedBy,
        comments: "Opening stock loaded during system implementation.",
        skipRebuild: true
      });

      openingSheet.getRange(sheetRow, 7).setValue("Yes");
      loadedCount++;

    } catch (error) {
      errors.push("Row " + sheetRow + ": " + error.message);
    }
  }

  SpreadsheetApp.flush();

  // Rebuild once after the whole batch.
  rebuildPPECurrentStock();

  if (loadedCount === 0 && errors.length === 0) {
    throw new Error("No opening stock rows were available to load.");
  }

  if (errors.length > 0) {
    throw new Error(
      loadedCount +
      " row(s) loaded successfully, but some rows failed:\n\n" +
      errors.join("\n")
    );
  }

  ss.toast(
    loadedCount +
      " opening stock item(s) loaded successfully. " +
      "Current Stock and PPE planning were refreshed.",
    "Opening Stock",
    6
  );

  return {
    success: true,
    itemsLoaded: loadedCount
  };
}

/**
 * Restores headings (row 1 only) and formatting.
 * Data from row 2 down is never touched.
 */
function repairPPEManagementSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const requiredSheets = {
    "PPE Items": [
      "PPE ID", "PPE Category", "PPE Description", "Brand", "Size",
      "Unit", "Minimum Stock", "Reorder Quantity", "Unit Cost",
      "Preferred Supplier", "Supplier Email",
      "Replacement Period Months", "Active", "Notes"
    ],

    "Current Stock": [
      "PPE ID", "PPE Category", "PPE Description", "Size",
      "Total Received", "Total Issued", "Current Stock",
      "Minimum Stock", "Reorder Quantity", "Stock Status",
      "Supplier", "Supplier Email", "Unit Cost", "Stock Value",
      "Open Order ID", "Reorder Status", "Last Reorder Date"
    ],

    "Stock Transactions": [
      "Transaction ID", "Timestamp", "Transaction Type", "PPE ID",
      "PPE Description", "Size", "Quantity In", "Quantity Out",
      "Employee ID", "Employee Name", "Branch", "Department",
      "Reason", "Processed By", "Reference Number", "Comments"
    ],

    "PPE Issue Register": [
      "Issue ID", "Issue Date", "Employee ID", "Employee Name",
      "Branch", "Department", "Job Title", "PPE ID",
      "PPE Description", "Size", "Quantity", "Reason for Issue",
      "Previous PPE Returned", "Returned PPE Condition",
      "Replacement Review Date", "Issued By",
      "Employee Confirmation", "Supervisor Approval", "Comments",
      "Supporting Document", "Issue Status"
    ],

    "PPE Requests": [
      "Request ID", "Request Date", "Employee ID", "Employee Name",
      "Branch", "Department", "PPE ID", "PPE Description", "Size",
      "Quantity Requested", "Reason", "Urgency", "Supervisor",
      "Approval Status", "Approved By", "Approval Date", "Issue ID",
      "Comments", "Bulk Request ID", "Request Type",
      "Bulk Total Employees", "Bulk Total Quantity"
    ],

    "Opening Stock": [
      "PPE ID", "PPE Description", "Size", "Quantity",
      "Unit Cost", "Branch", "Loaded"
    ]
  };

  const repairedSheets = [];
  const createdSheets = [];

  Object.keys(requiredSheets).forEach(function(sheetName) {
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      createdSheets.push(sheetName);
    }

    const headers = requiredSheets[sheetName];

    sheet
      .getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight("bold")
      .setBackground("#1F4E78")
      .setFontColor("#FFFFFF")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");

    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);

    repairedSheets.push(sheetName);
  });

  const itemSheet = ss.getSheetByName("PPE Items");

  itemSheet
    .getRange("M2:M")
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(["Yes", "No"], true)
        .setAllowInvalid(false)
        .build()
    );

  itemSheet.getRange("I2:I").setNumberFormat(PPE_CURRENCY_FORMAT);

  const stockSheet = ss.getSheetByName("Current Stock");

  stockSheet.getRange("M2:N").setNumberFormat(PPE_CURRENCY_FORMAT);
  stockSheet.getRange("Q2:Q").setNumberFormat("yyyy-mm-dd");

  /*
   * Numbers typed as text (e.g. "R250" or "250,00") cause #NUM!
   * and "Unit Cost not added" errors. Convert them to numbers:
   * PPE Items G Min Stock, H Reorder Qty, I Unit Cost,
   * L Replacement Months, P Lead Time; PPE Budgets E Budget.
   */
  const numbersFixed =
    convertPPETextNumbers_(itemSheet, [7, 8, 9, 12, 16]) +
    (ss.getSheetByName("PPE Budgets")
      ? convertPPETextNumbers_(ss.getSheetByName("PPE Budgets"), [5])
      : 0);

  rebuildPPECurrentStock();
  recalculatePPEBudgets();

  SpreadsheetApp.flush();

  ss.toast(
    "PPE system repaired. " + numbersFixed +
    " number cell(s) typed as text were converted.",
    "PPE System Repair",
    6
  );

  return {
    success: true,
    repairedSheets: repairedSheets,
    createdSheets: createdSheets
  };
}


/* ============================================================
 * 13. BUDGETS
 * ============================================================
 *
 * PPE Budgets:
 * A Budget ID | B Year | C Branch | D Department | E Budget
 * F Spent | G Committed | H Remaining | I Status
 * J Utilisation % | K Warning Level | L Last Updated
 *
 * PPE Budget Transactions:
 * A ID | B Date | C Budget ID | D Year | E Branch | F Department
 * G Transaction Type | H Linked Request ID | I Linked Issue ID
 * J Employee ID | K Employee Name | L PPE ID | M PPE Description
 * N Quantity | O Unit Cost | P Amount | Q Recorded By | R Comments
 */

function getBranchPPEBudget_(branch, year) {
  const data =
    getPPESheet_("PPE Budgets").getDataRange().getValues();

  const searchBranch = cleanPPEKey_(branch);
  const searchYear = Number(year);

  for (let i = 1; i < data.length; i++) {
    const budgetID = cleanPPEText_(data[i][0]);

    if (
      budgetID &&
      Number(data[i][1] || 0) === searchYear &&
      cleanPPEKey_(data[i][2]) === searchBranch
    ) {
      return {
        found: true,
        rowNumber: i + 1,
        budgetID: budgetID,
        year: searchYear,
        branch: data[i][2],
        department: data[i][3],
        budgetAmount: toPPENumber_(data[i][4]),
        spent: toPPENumber_(data[i][5]),
        committed: toPPENumber_(data[i][6]),
        remaining: toPPENumber_(data[i][7]),
        status: cleanPPEText_(data[i][8])
      };
    }
  }

  return {
    found: false,
    branch: branch,
    year: searchYear
  };
}

/**
 * Recalculates Spent, Committed and Remaining (F:L) for
 * every budget from PPE Budget Transactions.
 */
function recalculatePPEBudgets() {
  const budgetSheet = getPPESheet_("PPE Budgets");
  const transactionSheet = getPPESheet_("PPE Budget Transactions");

  const budgetData = budgetSheet.getDataRange().getValues();
  const transactionData = transactionSheet.getDataRange().getValues();

  if (budgetData.length < 2) {
    throw new Error(
      'No budget records were found in the "PPE Budgets" sheet.'
    );
  }

  // Accepts numbers and text such as "R 1 700,00".
  const parseMoney = toPPENumber_;

  function budgetKey(value) {
    return cleanPPEText_(value).toUpperCase().replace(/-/g, "");
  }

  const totalsByBudget = {};

  for (let i = 1; i < transactionData.length; i++) {
    const budgetID = budgetKey(transactionData[i][2]);

    if (!budgetID) {
      continue;
    }

    const transactionType = cleanPPEKey_(transactionData[i][6]);
    const amount = parseMoney(transactionData[i][15]);

    if (!totalsByBudget[budgetID]) {
      totalsByBudget[budgetID] = { spent: 0, committed: 0 };
    }

    const totals = totalsByBudget[budgetID];

    if (transactionType === "budget reserved") {
      totals.committed += amount;
    } else if (transactionType === "budget released") {
      totals.committed -= amount;
    } else if (
      transactionType === "budget spent" ||
      transactionType === "budget adjustment"
    ) {
      totals.spent += amount;
    }
  }

  const output = [];

  for (let i = 1; i < budgetData.length; i++) {
    const budgetID = budgetKey(budgetData[i][0]);

    if (!budgetID) {
      output.push(["", "", "", "", "", "", ""]);
      continue;
    }

    const budgetAmount = parseMoney(budgetData[i][4]);
    const totals = totalsByBudget[budgetID] || { spent: 0, committed: 0 };

    const spent = Math.max(0, totals.spent);
    const committed = Math.max(0, totals.committed);
    const remaining = budgetAmount - spent - committed;

    const utilisation =
      budgetAmount > 0
        ? (spent + committed) / budgetAmount
        : 0;

    let status = "Within Budget";
    let warningLevel = "Green";

    if (remaining < 0) {
      status = "Budget Exceeded";
      warningLevel = "Red";
    } else if (utilisation >= 0.8) {
      status = "Budget Warning";
      warningLevel = "Orange";
    }

    output.push([
      spent,
      committed,
      remaining,
      status,
      utilisation,
      warningLevel,
      new Date()
    ]);
  }

  budgetSheet.getRange(2, 6, output.length, 7).setValues(output);
  budgetSheet.getRange(2, 5, output.length, 4).setNumberFormat(PPE_CURRENCY_FORMAT);
  budgetSheet.getRange(2, 10, output.length, 1).setNumberFormat("0.00%");
  budgetSheet.getRange(2, 12, output.length, 1).setNumberFormat("yyyy-mm-dd hh:mm");

  SpreadsheetApp.flush();

  return {
    success: true,
    message: "PPE budgets recalculated successfully."
  };
}

function addPPEBudgetTransaction(details) {
  const sheet = getPPESheet_("PPE Budget Transactions");

  const nextID =
    "BT-" +
    Utilities.formatString("%06d", sheet.getLastRow());

  sheet.appendRow([
    nextID,
    new Date(),
    details.budgetID,
    details.year,
    details.branch,
    details.department,
    details.transactionType,
    details.requestID || "",
    details.issueID || "",
    details.employeeID || "",
    details.employeeName || "",
    details.ppeID || "",
    details.ppeDescription || "",
    details.quantity || 0,
    details.unitCost || 0,
    details.amount || 0,
    Session.getActiveUser().getEmail(),
    details.comments || ""
  ]);

  recalculatePPEBudgets();
}

function ppeBudgetTransactionExists_(columnIndex, value, transactionType) {
  const sheet = getPPESheet_("PPE Budget Transactions");

  if (sheet.getLastRow() < 2) {
    return false;
  }

  const data = sheet.getDataRange().getValues();
  const cleanValue = cleanPPEKey_(value);
  const cleanType = cleanPPEKey_(transactionType);

  for (let i = 1; i < data.length; i++) {
    if (
      cleanPPEKey_(data[i][columnIndex]) === cleanValue &&
      cleanPPEKey_(data[i][6]) === cleanType
    ) {
      return true;
    }
  }

  return false;
}

function getPPEItemUnitCost_(ppeID) {
  if (!cleanPPEText_(ppeID)) {
    throw new Error("A PPE ID is required to find the Unit Cost.");
  }

  const item = findPPEItemByID(getPPESheet_("PPE Items"), ppeID);

  if (!item) {
    throw new Error(
      "PPE item " + ppeID + " could not be found in the PPE Items sheet."
    );
  }

  if (!Number.isFinite(item.unitCost) || item.unitCost <= 0) {
    throw new Error(
      "No valid Unit Cost has been entered for PPE item " +
      ppeID +
      ". Update the Unit Cost in the PPE Items sheet before approving this request."
    );
  }

  return item.unitCost;
}

/**
 * Reserves (commits) branch budget when a request is approved.
 * Throws if the branch budget is insufficient.
 */
function reserveBudgetForPPERequest_(details) {
  const requestID = cleanPPEText_(details.requestID);
  const branch = cleanPPEText_(details.branch);
  const department = cleanPPEText_(details.department) || "All Departments";
  const ppeID = cleanPPEText_(details.ppeID);
  const quantity = Number(details.quantity || 0);
  const year = Number(details.year || new Date().getFullYear());

  if (!requestID) {
    throw new Error("A Request ID is required to reserve the PPE budget.");
  }

  if (!branch) {
    throw new Error("The PPE request does not contain a branch.");
  }

  if (!ppeID) {
    throw new Error("The PPE request does not contain a PPE ID.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error(
      "The requested PPE quantity must be greater than zero."
    );
  }

  // Never reserve the same request twice (column H = request).
  if (ppeBudgetTransactionExists_(7, requestID, "Budget Reserved")) {
    return {
      success: true,
      alreadyReserved: true,
      message:
        "The budget for " + requestID + " has already been reserved."
    };
  }

  const unitCost = getPPEItemUnitCost_(ppeID);
  const requestAmount = quantity * unitCost;

  // Use the latest committed and spent totals.
  recalculatePPEBudgets();

  const budget = getBranchPPEBudget_(branch, year);

  if (!budget.found) {
    throw new Error(
      "No PPE budget has been created for " +
      branch +
      " for " +
      year +
      "."
    );
  }

  const availableBudget = Number(budget.remaining || 0);

  if (requestAmount > availableBudget) {
    throw new Error(
      "This PPE request cannot be approved because it exceeds the available branch budget.\n\n" +
      "Branch: " + branch + "\n" +
      "Available Budget: " + formatPPEMoney_(availableBudget) + "\n" +
      "Request Amount: " + formatPPEMoney_(requestAmount)
    );
  }

  addPPEBudgetTransaction({
    budgetID: budget.budgetID,
    year: year,
    branch: branch,
    department: department,
    transactionType: "Budget Reserved",
    requestID: requestID,
    employeeID: cleanPPEText_(details.employeeID),
    employeeName: cleanPPEText_(details.employeeName),
    ppeID: ppeID,
    ppeDescription: cleanPPEText_(details.ppeDescription),
    quantity: quantity,
    unitCost: unitCost,
    amount: requestAmount,
    comments: "Budget reserved when PPE request was approved."
  });

  return {
    success: true,
    alreadyReserved: false,
    budgetID: budget.budgetID,
    unitCost: unitCost,
    amount: requestAmount,
    remainingAfterReservation: availableBudget - requestAmount
  };
}

/**
 * Latest "Budget Reserved" transaction for a request, or null.
 */
function getPPEBudgetReservationByRequest_(requestID) {
  const data =
    getPPESheet_("PPE Budget Transactions")
      .getDataRange()
      .getValues();

  const cleanRequestID = cleanPPEKey_(requestID);

  if (data.length < 2 || !cleanRequestID) {
    return null;
  }

  // Search from the bottom so the latest reservation wins.
  for (let i = data.length - 1; i >= 1; i--) {
    const row = data[i];

    if (
      cleanPPEKey_(row[7]) !== cleanRequestID ||
      cleanPPEKey_(row[6]) !== "budget reserved"
    ) {
      continue;
    }

    return {
      rowNumber: i + 1,
      transactionID: cleanPPEText_(row[0]),
      date: row[1],
      budgetID: cleanPPEText_(row[2]),
      year: toPPENumber_(row[3]),
      branch: cleanPPEText_(row[4]),
      department: cleanPPEText_(row[5]),
      requestID: cleanPPEText_(row[7]),
      linkedIssueID: cleanPPEText_(row[8]),
      employeeID: cleanPPEText_(row[9]),
      employeeName: cleanPPEText_(row[10]),
      ppeID: cleanPPEText_(row[11]),
      ppeDescription: cleanPPEText_(row[12]),
      quantity: toPPENumber_(row[13]),
      unitCost: toPPENumber_(row[14]),
      amount: toPPENumber_(row[15])
    };
  }

  return null;
}

/**
 * When PPE is issued: release the commitment and record
 * the same amount as spent.
 */
function convertReservedPPEBudgetToSpent_(requestID, issueID, issuedBy) {
  const cleanRequestID = cleanPPEText_(requestID);
  const cleanIssueID = cleanPPEText_(issueID);

  if (!cleanRequestID) {
    throw new Error(
      "A Request ID is required to convert the reserved budget."
    );
  }

  if (!cleanIssueID) {
    throw new Error(
      "An Issue ID is required to record the budget as spent."
    );
  }

  // Never record the same issue as spent twice (column I = issue).
  if (ppeBudgetTransactionExists_(8, cleanIssueID, "Budget Spent")) {
    return {
      success: true,
      alreadyProcessed: true,
      message:
        "The budget for issue " +
        cleanIssueID +
        " has already been recorded as spent."
    };
  }

  const reservation =
    getPPEBudgetReservationByRequest_(cleanRequestID);

  if (!reservation) {
    throw new Error(
      "No reserved budget transaction was found for PPE request " +
      cleanRequestID +
      "."
    );
  }

  if (!Number.isFinite(reservation.amount) || reservation.amount <= 0) {
    throw new Error(
      "The reserved budget amount for " + cleanRequestID + " is invalid."
    );
  }

  const shared = {
    budgetID: reservation.budgetID,
    year: reservation.year,
    branch: reservation.branch,
    department: reservation.department || "All Departments",
    requestID: cleanRequestID,
    issueID: cleanIssueID,
    employeeID: reservation.employeeID,
    employeeName: reservation.employeeName,
    ppeID: reservation.ppeID,
    ppeDescription: reservation.ppeDescription,
    quantity: reservation.quantity,
    unitCost: reservation.unitCost,
    amount: reservation.amount
  };

  addPPEBudgetTransaction(
    Object.assign({}, shared, {
      transactionType: "Budget Released",
      comments:
        "Reserved budget released when PPE was issued. Processed by: " +
        cleanPPEText_(issuedBy)
    })
  );

  addPPEBudgetTransaction(
    Object.assign({}, shared, {
      transactionType: "Budget Spent",
      comments:
        "PPE budget recorded as spent when PPE was issued. Processed by: " +
        cleanPPEText_(issuedBy)
    })
  );

  return {
    success: true,
    alreadyProcessed: false,
    requestID: cleanRequestID,
    issueID: cleanIssueID,
    amount: reservation.amount
  };
}
