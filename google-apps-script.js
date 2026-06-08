const SHEET_NAME = "Fake Bets";
const HEADERS = [
  "Timestamp",
  "Name",
  "Heat",
  "Boat ID",
  "Boat Name",
  "Fake Wager",
  "Prediction Note",
  "Winning Time Guess",
  "First to Sink ID",
  "First to Sink Name",
  "Best Boat Name ID",
  "Best Boat Name",
  "Chaos Call"
];

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: "Regatta action logger is live." }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  const data = JSON.parse(e.postData.contents);

  ensureHeaders(sheet);

  sheet.appendRow([
    new Date(),
    data.name,
    data.heat,
    data.boatId,
    data.boatName,
    data.wager,
    data.note,
    data.exactTime || "",
    data.firstSink || "",
    data.firstSinkName || "",
    data.bestName || "",
    data.bestNameBoatName || "",
    data.chaosCall || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }

  const range = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), HEADERS.length));
  const currentHeaders = range.getValues()[0];
  let changed = false;

  HEADERS.forEach((header, index) => {
    if (currentHeaders[index] !== header) {
      currentHeaders[index] = header;
      changed = true;
    }
  });

  if (changed) {
    range.setValues([currentHeaders]);
  }
}
