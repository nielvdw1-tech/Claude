/**
 * ============================================================
 * PPE DASHBOARD
 * ============================================================
 *
 * Add this as a second script file next to Code.gs.
 * It uses the shared helpers in Code.gs.
 *
 * Builds the "Dashboard" sheet:
 *   1. Headline numbers
 *   2. Reorder list
 *   3. Budget by branch (+ chart)
 *   4. Safety and compliance
 *      – PPE replacements overdue / due in 30 days
 *      – Lost or damaged PPE per employee (last 12 months)
 *      – Stock written off as lost, stolen or damaged
 *
 * Refresh: PPE Management → Refresh Dashboard,
 * or change the Branch dropdown in cell B3.
 */

const PPE_DASHBOARD_SHEET = "Dashboard";
const PPE_DASHBOARD_BRANCH_CELL = "B3";
const PPE_DASHBOARD_ALL = "All Branches";
const PPE_DASHBOARD_MAX_ROWS = 50;

const PPE_DASH = {
  navy: "#1F4E78",
  header: "#EAF1F8",
  tile: "#F8FAFC",
  grey: "#667085",
  border: "#D0D5DD",
  red: ["#FDE2E1", "#B42318"],
  orange: ["#FEF0C7", "#B54708"],
  green: ["#DCFAE6", "#067647"]
};

/**
 * Menu item and B3 dropdown call this.
 */
function refreshPPEDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(PPE_DASHBOARD_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(PPE_DASHBOARD_SHEET, 0);
  }

  const selectedBranch =
    cleanPPEText_(sheet.getRange(PPE_DASHBOARD_BRANCH_CELL).getValue()) ||
    PPE_DASHBOARD_ALL;

  const branchFilter =
    selectedBranch === PPE_DASHBOARD_ALL
      ? ""
      : selectedBranch.toLowerCase();

  const data = loadPPEDashboardData_(branchFilter);

  resetPPEDashboardSheet_(sheet);

  /*
   * Title and branch selector
   */
  sheet
    .getRange("A1")
    .setValue("PPE MANAGEMENT DASHBOARD")
    .setFontSize(18)
    .setFontWeight("bold")
    .setFontColor(PPE_DASH.navy);

  sheet
    .getRange("A2")
    .setValue(
      "Last refreshed: " +
      Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        "dd MMM yyyy HH:mm"
      ) +
      "   |   Refresh: PPE Management → Refresh Dashboard, or change the branch below."
    )
    .setFontSize(9)
    .setFontColor(PPE_DASH.grey);

  const branchNames =
    getActivePPEBranches(getPPESheet_("Branches"))
      .map(function(branch) {
        return branch.branchName;
      });

  sheet
    .getRange("A3")
    .setValue("Branch:")
    .setFontWeight("bold")
    .setHorizontalAlignment("right");

  sheet
    .getRange(PPE_DASHBOARD_BRANCH_CELL)
    .setValue(selectedBranch)
    .setFontWeight("bold")
    .setBackground("#FFF7D6")
    .setBorder(true, true, true, true, false, false, PPE_DASH.navy, SpreadsheetApp.BorderStyle.SOLID)
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList([PPE_DASHBOARD_ALL].concat(branchNames), true)
        .setAllowInvalid(false)
        .build()
    );

  let row = 5;

  /*
   * 1. HEADLINE NUMBERS
   */
  row = writePPEDashKpis_(sheet, row, data.kpis);

  /*
   * 2. REORDER LIST
   */
  row = writePPEDashSection_(
    sheet,
    row,
    "REORDER LIST",
    "Items out of stock or at their reorder point. Stock is held centrally, so this list is not filtered by branch."
  );

  row = writePPEDashTable_(
    sheet,
    row,
    ["PPE ID", "Description", "Size", "In Stock", "Reorder Point", "Suggested Order", "Est. Cost", "Supplier", "Status"],
    data.reorder,
    {
      formats: { 6: PPE_CURRENCY_FORMAT },
      statusColumn: 8,
      emptyText: "All PPE items are above their reorder point.",
      totalRow:
        data.reorder.length
          ? ["Total", "", "", "", "", "", data.reorderTotal, "", ""]
          : null
    }
  );

  /*
   * 3. BUDGET BY BRANCH
   */
  row = writePPEDashSection_(
    sheet,
    row,
    "BUDGET " + data.year + " BY BRANCH",
    "Committed = approved requests not yet issued. Spent = PPE already issued."
  );

  const budgetTableRow = row;

  row = writePPEDashTable_(
    sheet,
    row,
    ["Branch", "Budget", "Spent", "Committed", "Remaining", "Used %", "Status"],
    data.budgets,
    {
      formats: {
        1: PPE_CURRENCY_FORMAT,
        2: PPE_CURRENCY_FORMAT,
        3: PPE_CURRENCY_FORMAT,
        4: PPE_CURRENCY_FORMAT,
        5: "0%"
      },
      statusColumn: 6,
      emptyText: "No PPE budgets found for " + data.year + "."
    }
  );

  if (data.budgets.length > 0) {
    row = insertPPEDashBudgetChart_(
      sheet,
      budgetTableRow,
      data.budgets.length,
      row
    );
  }

  /*
   * 4. SAFETY AND COMPLIANCE
   */
  row = writePPEDashSection_(
    sheet,
    row,
    "PPE REPLACEMENTS DUE",
    "Active employees whose latest issue of an item is past, or within 30 days of, its replacement review date." +
      (data.replacementsHidden
        ? " Showing the first " + PPE_DASHBOARD_MAX_ROWS + " of " +
          (data.replacements.length + data.replacementsHidden) + "."
        : "")
  );

  row = writePPEDashTable_(
    sheet,
    row,
    ["Employee", "Branch", "PPE Item", "Size", "Last Issued", "Review Date", "Days Left", "Status"],
    data.replacements,
    {
      formats: { 4: "dd mmm yyyy", 5: "dd mmm yyyy" },
      statusColumn: 7,
      emptyText: "No PPE replacements are due in the next 30 days."
    }
  );

  row = writePPEDashSection_(
    sheet,
    row,
    "LOST OR DAMAGED PPE – LAST 12 MONTHS",
    "PPE issued because the previous item was lost or damaged. Three or more incidents are flagged."
  );

  row = writePPEDashTable_(
    sheet,
    row,
    ["Employee", "Branch", "Incidents", "Units", "Value", "Last Incident", "Flag"],
    data.losses,
    {
      formats: { 4: PPE_CURRENCY_FORMAT, 5: "dd mmm yyyy" },
      statusColumn: 6,
      emptyText: "No lost or damaged PPE issues in the last 12 months."
    }
  );

  row = writePPEDashSection_(
    sheet,
    row,
    "STOCK WRITTEN OFF – LAST 12 MONTHS",
    "Stock adjustments for lost, stolen, damaged or contaminated stock."
  );

  row = writePPEDashTable_(
    sheet,
    row,
    ["Branch", "Reason", "Adjustments", "Units", "Value"],
    data.writeOffs,
    {
      formats: { 4: PPE_CURRENCY_FORMAT },
      emptyText: "No stock was written off in the last 12 months."
    }
  );

  SpreadsheetApp.flush();

  ss.toast(
    "Dashboard refreshed for " + selectedBranch + ".",
    "PPE Dashboard",
    4
  );
}

/**
 * Re-runs the dashboard when the Branch dropdown changes.
 * (Simple trigger – no setup needed.)
 */
function onEdit(e) {
  if (!e || !e.range) {
    return;
  }

  const sheet = e.range.getSheet();

  if (
    sheet.getName() === PPE_DASHBOARD_SHEET &&
    e.range.getA1Notation() === PPE_DASHBOARD_BRANCH_CELL
  ) {
    refreshPPEDashboard();
  }
}

/**
 * Optional: run once to refresh the dashboard every
 * morning at about 06:00.
 */
function installPPEDashboardDailyRefresh() {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === "refreshPPEDashboard") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp
    .newTrigger("refreshPPEDashboard")
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();
}


/* ============================================================
 * DATA
 * ============================================================ */

function loadPPEDashboardData_(branchFilter) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayMs = 24 * 60 * 60 * 1000;
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const in30Days = new Date(today.getTime() + 30 * dayMs);

  function inBranch(branch) {
    return !branchFilter || cleanPPEKey_(branch) === branchFilter;
  }

  function isDate(value) {
    return (
      Object.prototype.toString.call(value) === "[object Date]" &&
      !isNaN(value.getTime())
    );
  }

  /*
   * Unit cost per PPE item.
   */
  const unitCost = {};

  getPPESheet_("PPE Items")
    .getDataRange()
    .getValues()
    .slice(1)
    .forEach(function(row) {
      const key = cleanPPEKey_(row[0]);

      if (key) {
        unitCost[key] = Number(row[8] || 0) || 0;
      }
    });

  function costOf(ppeID, quantity) {
    return (unitCost[cleanPPEKey_(ppeID)] || 0) * quantity;
  }

  /*
   * CURRENT STOCK → stock value and reorder list.
   */
  let stockValue = 0;
  let outOfStockCount = 0;
  const reorder = [];

  getPPESheet_("Current Stock")
    .getDataRange()
    .getValues()
    .slice(1)
    .forEach(function(row) {
      if (!cleanPPEText_(row[0])) {
        return;
      }

      stockValue += Number(row[13] || 0) || 0;

      let status = cleanPPEText_(row[24]).toUpperCase();

      // Fall back to Stock Status (J) if planning columns are empty.
      if (!status) {
        const stockStatus = cleanPPEKey_(row[9]);

        status =
          stockStatus === "out of stock" ? "OUT OF STOCK" :
          stockStatus === "low stock" ? "REORDER NOW" : "";
      }

      if (status !== "OUT OF STOCK" && status !== "REORDER NOW") {
        return;
      }

      if (status === "OUT OF STOCK") {
        outOfStockCount++;
      }

      reorder.push([
        cleanPPEText_(row[0]),
        cleanPPEText_(row[2]),
        cleanPPEText_(row[3]),
        Number(row[6] || 0),
        Number(row[20] || row[7] || 0),
        Number(row[22] || row[8] || 0),
        Number(row[23] || 0) || costOf(row[0], Number(row[22] || row[8] || 0)),
        cleanPPEText_(row[10]),
        status
      ]);
    });

  reorder.sort(function(a, b) {
    return (
      (a[8] === "OUT OF STOCK" ? 0 : 1) - (b[8] === "OUT OF STOCK" ? 0 : 1) ||
      a[1].localeCompare(b[1])
    );
  });

  const reorderTotal =
    reorder.reduce(function(total, row) {
      return total + row[6];
    }, 0);

  /*
   * PPE REQUESTS → pipeline numbers.
   */
  let awaitingCount = 0;
  let oldestAwaitingDays = 0;
  let approvedNotIssued = 0;

  getPPESheet_("PPE Requests")
    .getDataRange()
    .getValues()
    .slice(1)
    .forEach(function(row) {
      if (!cleanPPEText_(row[0]) || !inBranch(row[4])) {
        return;
      }

      const status = cleanPPEText_(row[13]);

      if (status === "Awaiting Approval") {
        awaitingCount++;

        if (isDate(row[1])) {
          oldestAwaitingDays =
            Math.max(
              oldestAwaitingDays,
              Math.floor((today - row[1]) / dayMs)
            );
        }
      } else if (status === "Approved" && !cleanPPEText_(row[16])) {
        approvedNotIssued++;
      }
    });

  /*
   * PPE ISSUE REGISTER → issued this month, replacements,
   * lost / damaged PPE.
   */
  const activeEmployees = {};

  getActivePPEEmployees(getPPESheet_("Employees"))
    .forEach(function(employee) {
      activeEmployees[cleanPPEKey_(employee.employeeID)] = true;
    });

  let issuedUnitsThisMonth = 0;
  let issuedValueThisMonth = 0;

  const latestIssue = {};
  const lossesByEmployee = {};

  getPPESheet_("PPE Issue Register")
    .getDataRange()
    .getValues()
    .slice(1)
    .forEach(function(row) {
      const issueDate = row[1];
      const employeeID = cleanPPEText_(row[2]);
      const ppeID = cleanPPEText_(row[7]);
      const quantity = Number(row[10] || 0) || 0;
      const issueStatus = cleanPPEKey_(row[20]);

      if (
        !employeeID ||
        !ppeID ||
        !isDate(issueDate) ||
        ["cancelled", "void", "rejected"].includes(issueStatus) ||
        !inBranch(row[4])
      ) {
        return;
      }

      if (issueDate >= monthStart) {
        issuedUnitsThisMonth += quantity;
        issuedValueThisMonth += costOf(ppeID, quantity);
      }

      // Latest issue of each item per employee.
      const issueKey = employeeID.toLowerCase() + "|" + ppeID.toLowerCase();

      if (!latestIssue[issueKey] || issueDate >= latestIssue[issueKey].issueDate) {
        latestIssue[issueKey] = {
          employeeID: employeeID,
          employeeName: cleanPPEText_(row[3]),
          branch: cleanPPEText_(row[4]),
          description: cleanPPEText_(row[8]),
          size: cleanPPEText_(row[9]),
          issueDate: issueDate,
          reviewDate: row[14]
        };
      }

      // Lost / damaged PPE in the last 12 months.
      const reason = cleanPPEKey_(row[11]);

      if (
        issueDate >= yearAgo &&
        (reason.includes("lost") || reason.includes("damag"))
      ) {
        const employeeKey = employeeID.toLowerCase();

        if (!lossesByEmployee[employeeKey]) {
          lossesByEmployee[employeeKey] = {
            name: cleanPPEText_(row[3]) || employeeID,
            branch: cleanPPEText_(row[4]),
            incidents: 0,
            units: 0,
            value: 0,
            lastDate: issueDate
          };
        }

        const loss = lossesByEmployee[employeeKey];

        loss.incidents++;
        loss.units += quantity;
        loss.value += costOf(ppeID, quantity);

        if (issueDate > loss.lastDate) {
          loss.lastDate = issueDate;
        }
      }
    });

  const replacementsAll = [];

  Object.keys(latestIssue).forEach(function(key) {
    const issue = latestIssue[key];

    if (
      !activeEmployees[issue.employeeID.toLowerCase()] ||
      !isDate(issue.reviewDate) ||
      issue.reviewDate > in30Days
    ) {
      return;
    }

    const daysLeft = Math.floor((issue.reviewDate - today) / dayMs);

    replacementsAll.push([
      issue.employeeName,
      issue.branch,
      issue.description,
      issue.size,
      issue.issueDate,
      issue.reviewDate,
      daysLeft,
      daysLeft < 0 ? "OVERDUE" : "Due soon"
    ]);
  });

  replacementsAll.sort(function(a, b) {
    return a[6] - b[6];
  });

  const losses =
    Object.keys(lossesByEmployee)
      .map(function(key) {
        const loss = lossesByEmployee[key];

        return [
          loss.name,
          loss.branch,
          loss.incidents,
          loss.units,
          loss.value,
          loss.lastDate,
          loss.incidents >= 3 ? "Repeat (3+)" : ""
        ];
      })
      .sort(function(a, b) {
        return b[2] - a[2] || b[4] - a[4];
      })
      .slice(0, 15);

  /*
   * STOCK ADJUSTMENTS → write-offs.
   * A ID | B Date | C PPE ID | F Branch | G Direction | H Qty | K Reason
   */
  const writeOffMap = {};
  const adjustmentSheet = ss.getSheetByName("Stock Adjustments");

  if (adjustmentSheet) {
    adjustmentSheet
      .getDataRange()
      .getValues()
      .slice(1)
      .forEach(function(row) {
        const reason = cleanPPEText_(row[10]);
        const reasonKey = reason.toLowerCase();

        if (
          !isDate(row[1]) ||
          row[1] < yearAgo ||
          cleanPPEText_(row[6]) !== "Decrease" ||
          !inBranch(row[5]) ||
          !["lost", "stolen", "damaged", "contaminated"].some(function(word) {
            return reasonKey.includes(word);
          })
        ) {
          return;
        }

        const quantity = Number(row[7] || 0) || 0;
        const key = cleanPPEText_(row[5]) + "|" + reason;

        if (!writeOffMap[key]) {
          writeOffMap[key] = [cleanPPEText_(row[5]), reason, 0, 0, 0];
        }

        writeOffMap[key][2]++;
        writeOffMap[key][3] += quantity;
        writeOffMap[key][4] += costOf(row[2], quantity);
      });
  }

  const writeOffs =
    Object.keys(writeOffMap)
      .map(function(key) {
        return writeOffMap[key];
      })
      .sort(function(a, b) {
        return b[4] - a[4];
      });

  /*
   * PPE BUDGETS → current year.
   * A ID | B Year | C Branch | E Budget | F Spent | G Committed
   * H Remaining | I Status
   */
  const year = today.getFullYear();
  const budgets = [];

  let budgetTotal = 0;
  let budgetUsed = 0;

  const budgetSheet = ss.getSheetByName("PPE Budgets");

  if (budgetSheet) {
    budgetSheet
      .getDataRange()
      .getValues()
      .slice(1)
      .forEach(function(row) {
        if (
          !cleanPPEText_(row[0]) ||
          Number(row[1]) !== year ||
          !inBranch(row[2])
        ) {
          return;
        }

        const amount = Number(row[4] || 0) || 0;
        const spent = Number(row[5] || 0) || 0;
        const committed = Number(row[6] || 0) || 0;

        budgetTotal += amount;
        budgetUsed += spent + committed;

        budgets.push([
          cleanPPEText_(row[2]),
          amount,
          spent,
          committed,
          amount - spent - committed,
          amount > 0 ? (spent + committed) / amount : 0,
          cleanPPEText_(row[8]) || "Within Budget"
        ]);
      });
  }

  budgets.sort(function(a, b) {
    return a[0].localeCompare(b[0]);
  });

  const budgetUsedShare = budgetTotal > 0 ? budgetUsed / budgetTotal : 0;

  /*
   * HEADLINE NUMBERS
   */
  const kpis = [
    {
      label: "Stock value on hand",
      value: stockValue,
      format: PPE_CURRENCY_FORMAT,
      sub: "All stock (central)"
    },
    {
      label: "Items to reorder",
      value: reorder.length,
      sub: outOfStockCount + " out of stock",
      level:
        outOfStockCount > 0 ? "red" :
        reorder.length > 0 ? "orange" : "green"
    },
    {
      label: "Requests awaiting approval",
      value: awaitingCount,
      sub: awaitingCount ? "Oldest: " + oldestAwaitingDays + " day(s)" : "None waiting",
      level:
        oldestAwaitingDays > 3 ? "red" :
        awaitingCount > 0 ? "orange" : "green"
    },
    {
      label: "Approved, not yet issued",
      value: approvedNotIssued,
      sub: "Ready for Stores to issue",
      level: approvedNotIssued > 0 ? "orange" : "green"
    },
    {
      label: "PPE issued this month",
      value: issuedUnitsThisMonth,
      sub: formatPPEMoney_(issuedValueThisMonth) + " value"
    },
    {
      label: "Budget used " + year,
      value: budgetUsedShare,
      format: "0%",
      sub: budgetTotal
        ? formatPPEMoney_(budgetTotal - budgetUsed) + " remaining"
        : "No budget set",
      level:
        !budgetTotal ? "" :
        budgetUsedShare > 1 ? "red" :
        budgetUsedShare >= 0.8 ? "orange" : "green"
    }
  ];

  return {
    year: year,
    kpis: kpis,
    reorder: reorder,
    reorderTotal: reorderTotal,
    budgets: budgets,
    replacements: replacementsAll.slice(0, PPE_DASHBOARD_MAX_ROWS),
    replacementsHidden: Math.max(0, replacementsAll.length - PPE_DASHBOARD_MAX_ROWS),
    losses: losses,
    writeOffs: writeOffs
  };
}


/* ============================================================
 * LAYOUT HELPERS
 * ============================================================ */

function resetPPEDashboardSheet_(sheet) {
  sheet.getCharts().forEach(function(chart) {
    sheet.removeChart(chart);
  });

  const fullRange =
    sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());

  fullRange.breakApart();
  fullRange.clearDataValidations();
  sheet.clear();
  sheet.setFrozenRows(0);
  sheet.setHiddenGridlines(true);

  if (sheet.getMaxColumns() < 9) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 9 - sheet.getMaxColumns());
  }

  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidths(3, 7, 115);
}

function getPPEDashColours_(level) {
  return PPE_DASH[level] || null;
}

function getPPEDashStatusColours_(value) {
  const text = cleanPPEKey_(value);

  if (!text) {
    return null;
  }

  if (/out of stock|overdue|exceeded|repeat/.test(text)) {
    return PPE_DASH.red;
  }

  if (/reorder|due soon|warning/.test(text)) {
    return PPE_DASH.orange;
  }

  if (/within|ok/.test(text)) {
    return PPE_DASH.green;
  }

  return null;
}

function writePPEDashKpis_(sheet, row, kpis) {
  kpis.forEach(function(kpi, index) {
    const column = index + 1;
    const colours = getPPEDashColours_(kpi.level) || [PPE_DASH.tile, PPE_DASH.navy];

    sheet
      .getRange(row, column, 3, 1)
      .setBackground(colours[0])
      .setWrap(true)
      .setVerticalAlignment("middle")
      .setBorder(true, true, true, true, false, false, "#FFFFFF", SpreadsheetApp.BorderStyle.SOLID_THICK);

    sheet
      .getRange(row, column)
      .setValue(kpi.label)
      .setFontSize(9)
      .setFontColor(PPE_DASH.grey);

    const valueCell =
      sheet
        .getRange(row + 1, column)
        .setValue(kpi.value)
        .setFontSize(18)
        .setFontWeight("bold")
        .setFontColor(colours[1])
        .setHorizontalAlignment("left");

    if (kpi.format) {
      valueCell.setNumberFormat(kpi.format);
    }

    sheet
      .getRange(row + 2, column)
      .setValue(kpi.sub || "")
      .setFontSize(9)
      .setFontColor(PPE_DASH.grey);
  });

  sheet.setRowHeight(row + 1, 36);

  return row + 4;
}

function writePPEDashSection_(sheet, row, title, note) {
  sheet
    .getRange(row, 1, 1, 9)
    .setBorder(null, null, true, null, null, null, PPE_DASH.navy, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  sheet
    .getRange(row, 1)
    .setValue(title)
    .setFontSize(12)
    .setFontWeight("bold")
    .setFontColor(PPE_DASH.navy);

  row++;

  if (note) {
    sheet
      .getRange(row, 1)
      .setValue(note)
      .setFontSize(9)
      .setFontStyle("italic")
      .setFontColor(PPE_DASH.grey);

    row++;
  }

  return row;
}

/**
 * options: formats {columnIndex: format}, statusColumn,
 *          emptyText, totalRow
 */
function writePPEDashTable_(sheet, row, headers, rows, options) {
  options = options || {};

  const width = headers.length;

  sheet
    .getRange(row, 1, 1, width)
    .setValues([headers])
    .setFontWeight("bold")
    .setFontColor(PPE_DASH.navy)
    .setBackground(PPE_DASH.header)
    .setWrap(true);

  const headerRow = row;
  row++;

  if (rows.length === 0) {
    sheet
      .getRange(row, 1)
      .setValue(options.emptyText || "Nothing to show.")
      .setFontStyle("italic")
      .setFontColor(PPE_DASH.grey);

    return row + 2;
  }

  const allRows =
    options.totalRow ? rows.concat([options.totalRow]) : rows;

  sheet
    .getRange(row, 1, allRows.length, width)
    .setValues(allRows);

  Object.keys(options.formats || {}).forEach(function(column) {
    sheet
      .getRange(row, Number(column) + 1, allRows.length, 1)
      .setNumberFormat(options.formats[column]);
  });

  if (options.statusColumn !== undefined) {
    const backgrounds = [];
    const fontColours = [];

    rows.forEach(function(dataRow) {
      const colours = getPPEDashStatusColours_(dataRow[options.statusColumn]);
      backgrounds.push([colours ? colours[0] : "#FFFFFF"]);
      fontColours.push([colours ? colours[1] : "#000000"]);
    });

    sheet
      .getRange(row, options.statusColumn + 1, rows.length, 1)
      .setBackgrounds(backgrounds)
      .setFontColors(fontColours)
      .setFontWeight("bold");
  }

  if (options.totalRow) {
    sheet
      .getRange(row + rows.length, 1, 1, width)
      .setFontWeight("bold")
      .setBackground(PPE_DASH.header);
  }

  sheet
    .getRange(headerRow, 1, allRows.length + 1, width)
    .setBorder(true, true, true, true, true, true, PPE_DASH.border, SpreadsheetApp.BorderStyle.SOLID);

  return row + allRows.length + 1;
}

/**
 * Stacked bar: Spent, Committed, Remaining per branch.
 * Placed below the budget table; returns the next free row.
 */
function insertPPEDashBudgetChart_(sheet, headerRow, rowCount, nextRow) {
  const chartHeight = Math.max(220, 60 + rowCount * 40);

  const chart =
    sheet
      .newChart()
      .asBarChart()
      .addRange(sheet.getRange(headerRow, 1, rowCount + 1, 1))
      .addRange(sheet.getRange(headerRow, 3, rowCount + 1, 3))
      .setStacked()
      .setOption("title", "Budget use by branch")
      .setOption("legend", { position: "bottom" })
      .setOption("colors", ["#1F4E78", "#F79009", "#D0D5DD"])
      .setOption("hAxis", { format: "R #,##0" })
      .setOption("width", 760)
      .setOption("height", chartHeight)
      .setPosition(nextRow, 1, 0, 0)
      .build();

  sheet.insertChart(chart);

  // Leave enough empty rows under the chart (≈21px per row).
  return nextRow + Math.ceil(chartHeight / 21) + 1;
}
