/**
 * ============================================================
 * ONE-OFF SETUP: Women's Mid Rise Tapered Fit Denim Jeans
 * ============================================================
 *
 * 1. Paste this into a new script file next to Code.gs.
 * 2. Select addDenimJeansToPPESystem in the toolbar and click Run.
 * 3. Delete this file afterwards – it is only needed once.
 *
 * Safe to run more than once: sizes and the Employees column
 * that already exist are skipped.
 */

const DENIM_JEANS_DESCRIPTION = "Women's Mid Rise Tapered Fit Denim Jeans";
const DENIM_JEANS_CATEGORY = "Clothing";
const DENIM_JEANS_FIRST_SIZE = 28;
const DENIM_JEANS_LAST_SIZE = 48;
const DENIM_JEANS_SIZE_STEP = 1;   // change to 2 for even sizes only (28, 30 … 48)
const DENIM_JEANS_EMPLOYEE_COLUMN = "Denim Jeans Size";

function addDenimJeansToPPESystem() {
  const sizes = [];

  for (
    let size = DENIM_JEANS_FIRST_SIZE;
    size <= DENIM_JEANS_LAST_SIZE;
    size += DENIM_JEANS_SIZE_STEP
  ) {
    sizes.push(String(size));
  }

  const itemsAdded = addDenimJeansPPEItems_(sizes);
  const columnAdded = addDenimJeansEmployeeColumn_(sizes);

  // Puts the new items on the Current Stock sheet.
  rebuildPPECurrentStock();

  const message =
    itemsAdded.length +
    " jeans size(s) added to PPE Items" +
    (itemsAdded.length ? " (" + itemsAdded[0] + " to " + itemsAdded[itemsAdded.length - 1] + ")" : "") +
    ". Employees column \"" + DENIM_JEANS_EMPLOYEE_COLUMN + "\" " +
    (columnAdded ? "added." : "already existed.") +
    " Now fill in Unit Cost, Minimum Stock, Supplier and Replacement Period for the new items.";

  Logger.log(message);

  SpreadsheetApp.getActiveSpreadsheet().toast(message, "Denim Jeans", 10);
}

/**
 * Adds one PPE Items row per size. Returns the new PPE IDs.
 */
function addDenimJeansPPEItems_(sizes) {
  const sheet = getPPESheet_("PPE Items");
  const data = sheet.getDataRange().getValues();

  /*
   * Work out the next PPE ID from existing IDs such as PPE0042.
   */
  let highestNumber = 0;
  let digits = 4;

  const existingSizes = {};

  for (let i = 1; i < data.length; i++) {
    const id = cleanPPEText_(data[i][0]);
    const match = id.match(/^PPE(\d+)$/i);

    if (match) {
      highestNumber = Math.max(highestNumber, Number(match[1]));
      digits = Math.max(digits, match[1].length);
    }

    if (cleanPPEKey_(data[i][2]) === DENIM_JEANS_DESCRIPTION.toLowerCase()) {
      existingSizes[cleanPPEKey_(data[i][4])] = true;
    }
  }

  const newRows = [];
  const newIDs = [];

  sizes.forEach(function(size) {
    if (existingSizes[size.toLowerCase()]) {
      return;
    }

    highestNumber++;

    const ppeID = "PPE" + String(highestNumber).padStart(digits, "0");

    newIDs.push(ppeID);

    newRows.push([
      ppeID,                    // A PPE ID
      DENIM_JEANS_CATEGORY,     // B Category
      DENIM_JEANS_DESCRIPTION,  // C Description
      "",                       // D Brand
      size,                     // E Size
      "Each",                   // F Unit
      "",                       // G Minimum Stock    – fill in
      "",                       // H Reorder Quantity – fill in
      "",                       // I Unit Cost        – fill in
      "",                       // J Preferred Supplier
      "",                       // K Supplier Email
      "",                       // L Replacement Period Months
      "Yes",                    // M Active
      ""                        // N Notes
    ]);
  });

  if (newRows.length > 0) {
    const startRow = sheet.getLastRow() + 1;

    // Write sizes as text so "28" stays "28" and matches employee sizes.
    sheet
      .getRange(startRow, 5, newRows.length, 1)
      .setNumberFormat("@");

    sheet
      .getRange(startRow, 1, newRows.length, newRows[0].length)
      .setValues(newRows);
  }

  return newIDs;
}

/**
 * Adds "Denim Jeans Size" to Employees, directly after
 * "Skirt Size" (or at the end), with a size dropdown.
 * Returns true if the column was added.
 */
function addDenimJeansEmployeeColumn_(sizes) {
  const sheet = getPPESheet_("Employees");

  const headers =
    sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(function(header) {
        return cleanPPEText_(header);
      });

  let column = headers.indexOf(DENIM_JEANS_EMPLOYEE_COLUMN) + 1;
  let added = false;

  if (!column) {
    const skirtColumn = headers.indexOf("Skirt Size") + 1;
    const afterColumn = skirtColumn || headers.length;

    sheet.insertColumnAfter(afterColumn);
    column = afterColumn + 1;

    sheet
      .getRange(1, afterColumn)
      .copyTo(
        sheet.getRange(1, column),
        SpreadsheetApp.CopyPasteType.PASTE_FORMAT,
        false
      );

    sheet
      .getRange(1, column)
      .setValue(DENIM_JEANS_EMPLOYEE_COLUMN);

    sheet.autoResizeColumn(column);

    added = true;
  }

  const lastRow = Math.max(sheet.getMaxRows(), 2);

  sheet
    .getRange(2, column, lastRow - 1, 1)
    .setNumberFormat("@")
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(sizes, true)
        .setAllowInvalid(false)
        .build()
    );

  return added;
}
