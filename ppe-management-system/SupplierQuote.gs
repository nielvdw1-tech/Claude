/**
 * ============================================================
 * SUPPLIER QUOTE LIST
 * ============================================================
 *
 * Add this as a script file next to Code.gs.
 *
 * Builds the "Supplier Quote" sheet: the PPE requested per
 * branch, added up per item and size, ready to send to a
 * supplier for a quotation. No employee names, request
 * numbers or internal prices are shown.
 *
 * Settings sit at the top of the sheet (branch, which
 * requests, optional date range). Change them, then click
 * PPE Management → Build Supplier Quote List.
 */

const PPE_QUOTE_SHEET = "Supplier Quote";
const PPE_QUOTE_ALL_BRANCHES = "All Branches";
const PPE_QUOTE_FIRST_OUTPUT_ROW = 10;

const PPE_QUOTE_STATUS_OPTIONS = [
  "Open requests (awaiting approval + approved, not yet issued)",
  "Awaiting approval only",
  "Approved, not yet issued",
  "All requests except rejected"
];

/**
 * Menu: PPE Management → Build Supplier Quote List
 */
function buildPPESupplierQuoteList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = setupPPEQuoteSettings_(ss);

  const settings = readPPEQuoteSettings_(sheet);
  const branches = getPPEQuoteBranchDetails_();
  const lines = collectPPEQuoteLines_(settings);

  // Clear the previous list, keep the settings.
  const maxRows = sheet.getMaxRows();

  if (maxRows >= PPE_QUOTE_FIRST_OUTPUT_ROW) {
    const oldOutput =
      sheet.getRange(
        PPE_QUOTE_FIRST_OUTPUT_ROW,
        1,
        maxRows - PPE_QUOTE_FIRST_OUTPUT_ROW + 1,
        sheet.getMaxColumns()
      );

    oldOutput.breakApart();
    oldOutput.clear();
  }

  let row = PPE_QUOTE_FIRST_OUTPUT_ROW;

  /*
   * Quote heading
   */
  const companyName = getPPEQuoteSetting_("Company Name");

  sheet
    .getRange(row, 1)
    .setValue("REQUEST FOR QUOTATION")
    .setFontSize(16)
    .setFontWeight("bold")
    .setFontColor("#1F4E78");
  row++;

  if (companyName) {
    sheet.getRange(row, 1).setValue(companyName).setFontWeight("bold");
    row++;
  }

  sheet
    .getRange(row, 1)
    .setValue(
      "Date: " +
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd MMMM yyyy") +
      "     Please provide your best price and lead time for the items below."
    )
    .setFontColor("#475569");
  row += 2;

  const branchNames = Object.keys(lines).sort();

  if (branchNames.length === 0) {
    sheet
      .getRange(row, 1)
      .setValue("No PPE requests match these settings.")
      .setFontStyle("italic")
      .setFontColor("#667085");

    ss.toast("No PPE requests match these settings.", "Supplier Quote", 5);
    return;
  }

  /*
   * One section per branch
   */
  branchNames.forEach(function(branchName) {
    const branch = branches[branchName.toLowerCase()] || {};

    row = writePPEQuoteSection_(
      sheet,
      row,
      "BRANCH: " + branchName.toUpperCase(),
      [
        branch.address ? "Delivery address: " + branch.address : "",
        branch.contact ? "Contact: " + branch.contact : ""
      ],
      lines[branchName]
    );
  });

  /*
   * Combined total when more than one branch is listed
   */
  if (branchNames.length > 1) {
    const combined = {};

    branchNames.forEach(function(branchName) {
      lines[branchName].forEach(function(line) {
        if (!combined[line.key]) {
          combined[line.key] = Object.assign({}, line, { quantity: 0 });
        }

        combined[line.key].quantity += line.quantity;
      });
    });

    row = writePPEQuoteSection_(
      sheet,
      row,
      "TOTAL – ALL BRANCHES ABOVE",
      ["Combined quantities, if you prefer one order for all branches."],
      sortPPEQuoteLines_(
        Object.keys(combined).map(function(key) {
          return combined[key];
        })
      )
    );
  }

  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 320);
  sheet.setColumnWidths(3, 3, 100);

  SpreadsheetApp.flush();

  ss.toast(
    "Supplier quote list built for " + settings.branchLabel + ". " +
    "Use File → Download → PDF to send it.",
    "Supplier Quote",
    6
  );
}

/**
 * Creates the sheet and its settings the first time.
 * Existing settings are kept.
 */
function setupPPEQuoteSettings_(ss) {
  let sheet = ss.getSheetByName(PPE_QUOTE_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(PPE_QUOTE_SHEET);
  }

  sheet
    .getRange("A1")
    .setValue("SUPPLIER QUOTE LIST – SETTINGS")
    .setFontSize(13)
    .setFontWeight("bold")
    .setFontColor("#1F4E78");

  const labels = [
    ["Branch:"],
    ["Requests to include:"],
    ["Request date from:"],
    ["Request date to:"]
  ];

  sheet
    .getRange(3, 1, labels.length, 1)
    .setValues(labels)
    .setFontWeight("bold");

  const branchNames =
    getActivePPEBranches(getPPESheet_("Branches"))
      .map(function(branch) {
        return branch.branchName;
      });

  const branchCell = sheet.getRange("B3");
  const statusCell = sheet.getRange("B4");

  branchCell.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList([PPE_QUOTE_ALL_BRANCHES].concat(branchNames), true)
      .setAllowInvalid(false)
      .build()
  );

  statusCell.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(PPE_QUOTE_STATUS_OPTIONS, true)
      .setAllowInvalid(false)
      .build()
  );

  sheet
    .getRange("B5:B6")
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireDate()
        .setAllowInvalid(false)
        .setHelpText("Optional. Leave empty to include all dates.")
        .build()
    )
    .setNumberFormat("dd mmm yyyy");

  if (!cleanPPEText_(branchCell.getValue())) {
    branchCell.setValue(PPE_QUOTE_ALL_BRANCHES);
  }

  if (!cleanPPEText_(statusCell.getValue())) {
    statusCell.setValue(PPE_QUOTE_STATUS_OPTIONS[0]);
  }

  sheet
    .getRange("B3:B6")
    .setBackground("#FFF7D6")
    .setBorder(true, true, true, true, true, true, "#1F4E78", SpreadsheetApp.BorderStyle.SOLID);

  sheet
    .getRange("A8")
    .setValue(
      "Change the yellow settings, then click PPE Management → Build Supplier Quote List. " +
      "Dates are optional."
    )
    .setFontStyle("italic")
    .setFontColor("#667085");

  return sheet;
}

function readPPEQuoteSettings_(sheet) {
  const branch =
    cleanPPEText_(sheet.getRange("B3").getValue()) || PPE_QUOTE_ALL_BRANCHES;

  const status =
    cleanPPEText_(sheet.getRange("B4").getValue()) || PPE_QUOTE_STATUS_OPTIONS[0];

  const fromValue = sheet.getRange("B5").getValue();
  const toValue = sheet.getRange("B6").getValue();

  const fromDate =
    fromValue instanceof Date ? new Date(fromValue.getTime()) : null;

  const toDate =
    toValue instanceof Date ? new Date(toValue.getTime()) : null;

  if (fromDate) {
    fromDate.setHours(0, 0, 0, 0);
  }

  if (toDate) {
    toDate.setHours(23, 59, 59, 999);
  }

  return {
    branchFilter: branch === PPE_QUOTE_ALL_BRANCHES ? "" : branch.toLowerCase(),
    branchLabel: branch,
    statusIndex: Math.max(0, PPE_QUOTE_STATUS_OPTIONS.indexOf(status)),
    fromDate: fromDate,
    toDate: toDate
  };
}

/**
 * Returns { "Branch Name": [ { key, category, description,
 *           size, unit, quantity }, ... ] }
 */
function collectPPEQuoteLines_(settings) {
  // Category and unit per PPE ID, from PPE Items.
  const itemInfo = {};

  getPPESheet_("PPE Items")
    .getDataRange()
    .getValues()
    .slice(1)
    .forEach(function(row) {
      const key = cleanPPEKey_(row[0]);

      if (key) {
        itemInfo[key] = {
          category: cleanPPEText_(row[1]),
          unit: cleanPPEText_(row[5])
        };
      }
    });

  const data = getPPESheet_("PPE Requests").getDataRange().getValues();
  const byBranch = {};

  for (let i = 1; i < data.length; i++) {
    const request = readPPERequestRow_(data[i], i + 1);
    const requestDate = data[i][1];

    if (!request.requestID || !request.ppeID || request.quantity <= 0) {
      continue;
    }

    if (
      settings.branchFilter &&
      cleanPPEKey_(request.branch) !== settings.branchFilter
    ) {
      continue;
    }

    const status = cleanPPEKey_(request.status);
    const awaiting = status === "awaiting approval";
    const approvedNotIssued = status === "approved" && !request.issueID;

    const include = [
      awaiting || approvedNotIssued,
      awaiting,
      approvedNotIssued,
      status !== "rejected" && status !== "cancelled"
    ][settings.statusIndex];

    if (!include) {
      continue;
    }

    if (settings.fromDate || settings.toDate) {
      if (!(requestDate instanceof Date)) {
        continue;
      }

      if (settings.fromDate && requestDate < settings.fromDate) {
        continue;
      }

      if (settings.toDate && requestDate > settings.toDate) {
        continue;
      }
    }

    const branchName = request.branch || "(No branch)";
    const key = request.ppeID.toLowerCase();
    const info = itemInfo[key] || {};

    if (!byBranch[branchName]) {
      byBranch[branchName] = {};
    }

    if (!byBranch[branchName][key]) {
      byBranch[branchName][key] = {
        key: key,
        category: info.category || "",
        description: request.ppeDescription,
        size: request.size,
        unit: info.unit || "",
        quantity: 0
      };
    }

    byBranch[branchName][key].quantity += request.quantity;
  }

  const result = {};

  Object.keys(byBranch).forEach(function(branchName) {
    result[branchName] =
      sortPPEQuoteLines_(
        Object.keys(byBranch[branchName]).map(function(key) {
          return byBranch[branchName][key];
        })
      );
  });

  return result;
}

function sortPPEQuoteLines_(lines) {
  return lines.sort(function(a, b) {
    return (
      a.category.localeCompare(b.category) ||
      a.description.localeCompare(b.description) ||
      String(a.size).localeCompare(String(b.size), undefined, { numeric: true })
    );
  });
}

/**
 * Branch address and PPE contact, keyed by lower-case name.
 * Branches: B Name | C Address | F PPE Controller | G Controller Email
 */
function getPPEQuoteBranchDetails_() {
  const details = {};

  getPPESheet_("Branches")
    .getDataRange()
    .getValues()
    .slice(1)
    .forEach(function(row) {
      const name = cleanPPEText_(row[1]);

      if (!name) {
        return;
      }

      const contact =
        [cleanPPEText_(row[5]), cleanPPEText_(row[6])]
          .filter(function(value) { return value; })
          .join(" – ");

      details[name.toLowerCase()] = {
        address: cleanPPEText_(row[2]),
        contact: contact
      };
    });

  return details;
}

function getPPEQuoteSetting_(settingName) {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");

  if (!sheet) {
    return "";
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (cleanPPEText_(data[i][0]) === settingName) {
      return cleanPPEText_(data[i][1]);
    }
  }

  return "";
}

/**
 * Writes one titled table: Category | Item | Size | Unit | Quantity
 */
function writePPEQuoteSection_(sheet, row, title, infoLines, lines) {
  sheet
    .getRange(row, 1, 1, 5)
    .merge()
    .setValue(title)
    .setFontWeight("bold")
    .setFontColor("#FFFFFF")
    .setBackground("#1F4E78");
  row++;

  infoLines
    .filter(function(text) { return text; })
    .forEach(function(text) {
      sheet.getRange(row, 1).setValue(text).setFontColor("#475569");
      row++;
    });

  const headers = [["Category", "Item", "Size", "Unit", "Quantity"]];

  sheet
    .getRange(row, 1, 1, 5)
    .setValues(headers)
    .setFontWeight("bold")
    .setBackground("#EAF1F8")
    .setFontColor("#1F4E78");

  const headerRow = row;
  row++;

  const values =
    lines.map(function(line) {
      return [
        line.category,
        line.description,
        line.size || "Standard",
        line.unit,
        line.quantity
      ];
    });

  const totalUnits =
    lines.reduce(function(total, line) {
      return total + line.quantity;
    }, 0);

  values.push(["", "Total", "", "", totalUnits]);

  // Sizes as text so "28" or "9" are not treated as numbers.
  sheet.getRange(row, 3, values.length, 1).setNumberFormat("@");

  sheet
    .getRange(row, 1, values.length, 5)
    .setValues(values);

  sheet
    .getRange(row + values.length - 1, 1, 1, 5)
    .setFontWeight("bold")
    .setBackground("#EAF1F8");

  sheet
    .getRange(headerRow, 5, values.length + 1, 1)
    .setHorizontalAlignment("center");

  sheet
    .getRange(headerRow, 1, values.length + 1, 5)
    .setBorder(true, true, true, true, true, true, "#D0D5DD", SpreadsheetApp.BorderStyle.SOLID);

  return row + values.length + 1;
}
