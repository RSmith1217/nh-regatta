const SHEET_NAME = "Fake Bets";

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: "Regatta action logger is live." }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  const data = JSON.parse(e.postData.contents);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Name",
      "Heat",
      "Boat ID",
      "Boat Name",
      "Fake Wager",
      "Prediction Note"
    ]);
  }

  sheet.appendRow([
    new Date(),
    data.name,
    data.heat,
    data.boatId,
    data.boatName,
    data.wager,
    data.note
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
