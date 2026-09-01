import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const COMPANY_NAME = 'ANURADHA TRANSPORT SERVICE';

// ---- style helpers -------------------------------------------------------
const thin = { style: 'thin', color: { argb: 'FF000000' } };
const allBorders = { top: thin, left: thin, bottom: thin, right: thin };

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
const SUBHEAD_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
const TOTAL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };

function num(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function fmtDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
}

/**
 * Build the per-trip section on a worksheet, mirroring the paper delivery form:
 * a route/vehicle info block, then a table of delivery stops with distance columns.
 */
function writeTripSection(ws, trip, startRow) {
  let r = startRow;

  // ---- Info block --------------------------------------------------------
  const driverName = trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}`.trim() : '—';
  const vehicleNo = trip.driver?.vehicleNumber || '—';
  const infoRows = [
    ['Trip No', `: ${trip.tripNumber || ''}`],
    ['Route', `: ${trip.origin || ''} → ${trip.destination || ''}`],
    ['Vehicle No', `: ${vehicleNo}`],
    ['Driver', `: ${driverName}`],
    ['Customer', `: ${trip.customer?.companyName || '—'}`],
    ['Delivery Date', `: ${fmtDate(trip.completedAt || trip.scheduledDate)}`],
    ['Status', `: ${(trip.status || '').replace('_', ' ')} / Approval: ${trip.approvalStatus || '—'}`],
  ];

  infoRows.forEach(([label, value]) => {
    const row = ws.getRow(r);
    const labelCell = row.getCell(1);
    labelCell.value = label;
    labelCell.font = { bold: true };
    labelCell.border = allBorders;
    const valueCell = row.getCell(2);
    valueCell.value = value;
    valueCell.border = allBorders;
    ws.mergeCells(r, 2, r, 6);
    r += 1;
  });

  r += 1; // spacer

  // ---- Table header ------------------------------------------------------
  const headerRow = ws.getRow(r);
  const headers = [
    'Location',
    'Customer',
    'Invoice(s)',
    'Expected (Map) KM',
    'GPS (Actual) KM',
    'Driver KM',
    'Difference (Driver-GPS) KM',
  ];
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = HEADER_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = allBorders;
  });
  headerRow.height = 30;
  r += 1;

  // ---- Stop rows ---------------------------------------------------------
  const stops = trip.stops || [];
  let totExpected = 0;
  let totGps = 0;
  let totDriver = 0;

  const bodyStart = r;
  stops.forEach((stop) => {
    const expected = num(stop.expectedMileage);
    const gps = num(stop.gpsMileage);
    const driver = num(stop.driverMileage);
    const diff = gps != null && driver != null ? Number((driver - gps).toFixed(2)) : null;

    if (expected != null) totExpected += expected;
    if (gps != null) totGps += gps;
    if (driver != null) totDriver += driver;

    const invoices = (stop.invoices || [])
      .map((inv) => (typeof inv === 'string' ? inv : inv?.invoiceNumber))
      .filter(Boolean)
      .join(', ');

    const row = ws.getRow(r);
    const values = [
      stop.gpsLocationName || stop.locationName || '',
      trip.customer?.companyName || '',
      invoices,
      expected,
      gps,
      driver,
      diff,
    ];
    values.forEach((v, i) => {
      const cell = row.getCell(i + 1);
      cell.value = v;
      cell.border = allBorders;
      if (i >= 3) {
        cell.alignment = { horizontal: 'center' };
        cell.numFmt = '#,##0.00';
      }
    });
    r += 1;
  });

  if (stops.length === 0) {
    const row = ws.getRow(r);
    const cell = row.getCell(1);
    cell.value = 'No delivery stops recorded (direct delivery).';
    cell.alignment = { horizontal: 'left' };
    ws.mergeCells(r, 1, r, 7);
    row.getCell(1).border = allBorders;
    r += 1;
  }

  // ---- Totals ------------------------------------------------------------
  const totalRow = ws.getRow(r);
  totalRow.getCell(1).value = 'Total';
  totalRow.getCell(1).font = { bold: true };
  ws.mergeCells(r, 1, r, 3);
  const totals = [
    Number(totExpected.toFixed(2)),
    Number(totGps.toFixed(2)),
    Number(totDriver.toFixed(2)),
    Number((totDriver - totGps).toFixed(2)),
  ];
  totals.forEach((v, i) => {
    const cell = totalRow.getCell(i + 4);
    cell.value = v;
    cell.font = { bold: true };
    cell.numFmt = '#,##0.00';
    cell.alignment = { horizontal: 'center' };
    cell.fill = TOTAL_FILL;
  });
  for (let c = 1; c <= 7; c += 1) totalRow.getCell(c).border = allBorders;

  // keep body reference to avoid unused warning / future use
  void bodyStart;
  r += 2; // spacer after section

  return r;
}

/**
 * Generate and download an Excel workbook for the given trips.
 * @param {Array} trips - array of trip objects (with stops)
 * @param {Object} opts - { monthLabel: 'August 2026' }
 */
export async function exportTripReportsToExcel(trips, opts = {}) {
  const { monthLabel = '' } = opts;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = COMPANY_NAME;
  workbook.created = new Date();

  // ============ Summary sheet =============================================
  const summary = workbook.addWorksheet('Summary', {
    properties: { defaultColWidth: 18 },
    views: [{ showGridLines: false }],
  });
  summary.columns = [
    { width: 16 }, { width: 26 }, { width: 22 }, { width: 20 },
    { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 22 },
  ];

  // Title band
  summary.mergeCells('A1:I1');
  const titleCell = summary.getCell('A1');
  titleCell.value = COMPANY_NAME;
  titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = HEADER_FILL;
  summary.getRow(1).height = 28;

  summary.mergeCells('A2:I2');
  const subCell = summary.getCell('A2');
  subCell.value = `Trip Distance Report${monthLabel ? ` — ${monthLabel}` : ''}`;
  subCell.font = { bold: true, size: 12 };
  subCell.alignment = { horizontal: 'center' };

  // Column headers
  const sHeaders = ['Trip No', 'Route', 'Customer', 'Driver', 'Vehicle', 'Delivery Date', 'GPS (Actual) KM', 'Driver KM', 'Difference (Driver-GPS) KM'];
  const sHeadRow = summary.getRow(4);
  sHeaders.forEach((h, i) => {
    const cell = sHeadRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true };
    cell.fill = SUBHEAD_FILL;
    cell.border = allBorders;
    cell.alignment = { horizontal: 'center', wrapText: true };
  });

  let sr = 5;
  let grandGps = 0;
  let grandDriver = 0;
  trips.forEach((trip) => {
    const stops = trip.stops || [];
    const gpsTot = stops.reduce((s, st) => s + (num(st.gpsMileage) || 0), 0);
    const driverTot = stops.reduce((s, st) => s + (num(st.driverMileage) || 0), 0);
    grandGps += gpsTot;
    grandDriver += driverTot;

    const diffTot = Number((driverTot - gpsTot).toFixed(2));

    const row = summary.getRow(sr);
    const vals = [
      trip.tripNumber || '',
      `${trip.origin || ''} → ${trip.destination || ''}`,
      trip.customer?.companyName || '—',
      trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : '—',
      trip.driver?.vehicleNumber || '—',
      fmtDate(trip.completedAt || trip.scheduledDate),
      Number(gpsTot.toFixed(2)),
      Number(driverTot.toFixed(2)),
      diffTot,
    ];
    vals.forEach((v, i) => {
      const cell = row.getCell(i + 1);
      cell.value = v;
      cell.border = allBorders;
      if (i >= 6) { cell.numFmt = '#,##0.00'; cell.alignment = { horizontal: 'center' }; }
    });
    // Colour the difference cell: green if within 10% of GPS, red otherwise.
    const diffCell = row.getCell(9);
    const pct = gpsTot > 0 ? (Math.abs(diffTot) / gpsTot) * 100 : 0;
    diffCell.font = {
      bold: true,
      color: { argb: Math.abs(diffTot) < 0.01 ? 'FF1E7E34' : pct > 10 ? 'FFC00000' : 'FFB8860B' },
    };
    sr += 1;
  });

  // Grand total
  const gRow = summary.getRow(sr);
  gRow.getCell(1).value = 'TOTAL';
  gRow.getCell(1).font = { bold: true };
  summary.mergeCells(sr, 1, sr, 6);
  const grandDiff = Number((grandDriver - grandGps).toFixed(2));
  [grandGps, grandDriver, grandDiff].forEach((v, i) => {
    const cell = gRow.getCell(i + 7);
    cell.value = Number(v.toFixed(2));
    cell.font = { bold: true };
    cell.numFmt = '#,##0.00';
    cell.fill = TOTAL_FILL;
    cell.alignment = { horizontal: 'center' };
  });
  for (let c = 1; c <= 9; c += 1) gRow.getCell(c).border = allBorders;

  // ============ Details sheet (one section per trip) ======================
  const details = workbook.addWorksheet('Trip Details', {
    views: [{ showGridLines: false }],
  });
  details.columns = [
    { width: 28 }, { width: 22 }, { width: 22 }, { width: 16 },
    { width: 16 }, { width: 14 }, { width: 22 },
  ];

  // Details title
  details.mergeCells('A1:G1');
  const dTitle = details.getCell('A1');
  dTitle.value = `${COMPANY_NAME} — Delivery Details${monthLabel ? ` (${monthLabel})` : ''}`;
  dTitle.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  dTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  dTitle.fill = HEADER_FILL;
  details.getRow(1).height = 26;

  let row = 3;
  trips.forEach((trip) => {
    row = writeTripSection(details, trip, row);
  });

  // ============ Save ======================================================
  const buffer = await workbook.xlsx.writeBuffer();
  const safeMonth = (monthLabel || 'all').replace(/\s+/g, '_');
  const filename = `Trip_Report_${safeMonth}.xlsx`;
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
}
