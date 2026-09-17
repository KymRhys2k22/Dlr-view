import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DLRRecord } from '../types/dlr';
import { getDepartmentName } from './getDepartmentName';

export interface ExportPdfOptions {
  filenameOverride?: string;
  storeCode?: string;
  dlrNumber?: string;
}

/**
 * Format numbers as standard Philippine Peso currency in PDF safe ASCII (e.g. PHP 1,250.00).
 * Note: jsPDF standard built-in fonts (Helvetica) only support WinAnsiEncoding.
 * The Unicode character '₱' (U+20B1) is not in WinAnsi and renders as '±' or '?',
 * whereas 'PHP' renders cleanly and accurately on all PDF viewers and printers.
 */
export function formatPdfAmount(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '0.00';
  const num = typeof val === 'number' ? val : Number(val);
  if (Number.isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPdfCurrency(val: number | string | null | undefined): string {
  return `PHP ${formatPdfAmount(val)}`;
}

/**
 * Robust image loader with dual canvas/blob strategy and Cloudinary thumbnail optimization
 */
async function loadImageAsBase64(url: string | null | undefined): Promise<string | null> {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  return new Promise((resolve) => {
    // Cloudinary thumbnail optimization for fast PDF generation & small PDF file size
    const thumbUrl = trimmed.includes('cloudinary.com')
      ? trimmed.replace(/\/upload\/(?:w_\d+\/)?/, '/upload/w_300,c_limit,q_80/')
      : trimmed;

    let resolved = false;
    const finish = (result: string | null) => {
      if (!resolved) {
        resolved = true;
        resolve(result);
      }
    };

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 100;
        canvas.height = img.naturalHeight || img.height || 100;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          finish(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        finish(dataUrl);
      } catch {
        fetchBlobAsBase64(thumbUrl).then(finish);
      }
    };

    img.onerror = () => {
      fetchBlobAsBase64(thumbUrl).then(finish);
    };

    img.src = thumbUrl;

    // Timeout safety
    setTimeout(() => finish(null), 3500);
  });
}

async function fetchBlobAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export interface ExportPdfOptions {
  filenameOverride?: string;
  storeCode?: string;
  dlrNumber?: string;
  status?: string | null;
  isApproved?: boolean;
}

/**
 * Generate and download an Apple-styled PDF report for a Filed or Approved DLR batch
 */
export async function exportFiledDLRToPdf(
  records: DLRRecord[],
  dlrNumber: string,
  storeCode?: string,
  options: ExportPdfOptions = {}
): Promise<void> {
  const cleanDlr = String(dlrNumber || options.dlrNumber || records[0]?.dlrNumber || 'Batch')
    .trim()
    .replace(/^#/, '');

  const isApproved =
    options.isApproved !== undefined
      ? Boolean(options.isApproved)
      : options.status === 'approved' || records.every((r) => r.status === 'approved');

  // Calculate totals
  const totalItems = records.length;
  const totalQuantity = records.reduce((acc, r) => acc + (r.qty || 0), 0);
  const totalCost = records.reduce((acc, r) => acc + (r.cost || 0) * (r.qty || 0), 0);

  // Departments
  const deptList = Array.from(
    new Set(records.map((r) => getDepartmentName(r.departmentCode)).filter(Boolean))
  );
  const deptName = deptList.length > 0 ? deptList.join(', ') : 'All Departments';

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Pre-load primary images concurrently
  const primaryImages = records.map(
    (r) => r.images[1] || r.images[0] || r.images[2] || ''
  );
  const loadedBase64Images = await Promise.all(
    primaryImages.map((url) => loadImageAsBase64(url))
  );

  // Create jsPDF instance (A4 Portrait, mm units)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;

  // --- Top Apple Header Bar ---
  const headerY = 10;
  const headerHeight = 32;
  doc.setFillColor(245, 245, 247); // Apple off-white background (#F5F5F7)
  doc.roundedRect(margin, headerY, pageWidth - margin * 2, headerHeight, 3, 3, 'F');

  // Dynamic DLR Badge Width
  const dlrText = `#${cleanDlr}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const dlrTextWidth = doc.getTextWidth(dlrText);
  const badgeWidth = Math.max(54, dlrTextWidth + 14);
  const badgeHeight = 18;
  const badgeX = pageWidth - margin - badgeWidth - 5;
  const badgeY = headerY + (headerHeight - badgeHeight) / 2;

  // Draw Badge Box based on approval status
  if (isApproved) {
    doc.setFillColor(236, 253, 245); // Emerald-50
    doc.setDrawColor(167, 243, 208); // Emerald-200
  } else {
    doc.setFillColor(255, 251, 235); // Amber-50
    doc.setDrawColor(253, 230, 138); // Amber-200
  }
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  if (isApproved) {
    doc.setTextColor(5, 150, 105); // Emerald-600
    doc.text('APPROVED DLR', badgeX + badgeWidth / 2, badgeY + 6, { align: 'center' });
    doc.setFontSize(10.5);
    doc.setTextColor(6, 95, 70); // Emerald-800
  } else {
    doc.setTextColor(217, 119, 6); // Amber-600
    doc.text('FILED DLR', badgeX + badgeWidth / 2, badgeY + 6, { align: 'center' });
    doc.setFontSize(10.5);
    doc.setTextColor(146, 64, 14); // Amber-800
  }
  doc.text(dlrText, badgeX + badgeWidth / 2, badgeY + 13.5, { align: 'center' });

  // Left Side: Title & Subtitle with max width so it never touches the badge
  const maxTitleWidth = badgeX - margin - 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(29, 29, 31); // Apple dark text (#1D1D1F)
  doc.text(
    isApproved ? 'APPROVED DLR AUDIT REPORT' : 'FILED DLR AUDIT REPORT',
    margin + 6,
    headerY + 10
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(110, 110, 115); // Apple secondary label
  doc.text(
    `Department: ${deptName}  |  Date: ${today}  |  Store Code: ${storeCode || 'N/A'}`,
    margin + 6,
    headerY + 18,
    { maxWidth: maxTitleWidth }
  );
  doc.text(
    `Status: ${isApproved ? 'Verified & Approved Audit Batch' : 'Filed & Pending Review'}  |  ${totalItems} Total Records`,
    margin + 6,
    headerY + 25,
    { maxWidth: maxTitleWidth }
  );

  // --- Metrics Summary Cards ---
  const cardsY = headerY + headerHeight + 4; // 46mm
  const cardWidth = (pageWidth - margin * 2 - 8) / 3;
  const cardHeight = 17;

  // Card 1: Total Line Items
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(230, 230, 232);
  doc.roundedRect(margin, cardsY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(110, 110, 115);
  doc.text('TOTAL LINE ITEMS', margin + 4, cardsY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(29, 29, 31);
  doc.text(`${totalItems} items`, margin + 4, cardsY + 12.5);

  // Card 2: Total Units (pcs)
  const card2X = margin + cardWidth + 4;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(230, 230, 232);
  doc.roundedRect(card2X, cardsY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(110, 110, 115);
  doc.text('PHYSICAL QUANTITY', card2X + 4, cardsY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(29, 29, 31);
  doc.text(`${totalQuantity} pcs`, card2X + 4, cardsY + 12.5);

  // Card 3: Audited Loss (PHP)
  const card3X = card2X + cardWidth + 4;
  doc.setFillColor(254, 242, 242); // Rose-50
  doc.setDrawColor(254, 205, 211); // Rose-200
  doc.roundedRect(card3X, cardsY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(225, 29, 72); // Rose-600
  doc.text('TOTAL AUDITED LOSS', card3X + 4, cardsY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(190, 18, 60); // Rose-700
  doc.text(formatPdfCurrency(totalCost), card3X + 4, cardsY + 12.5);

  // --- Table Construction via jspdf-autotable ---
  const tableData = records.map((record) => {
    const totalLineCost = (record.cost || 0) * (record.qty || 0);
    return [
      '', // Image cell drawn by didDrawCell
      `SKU: ${record.sku}\n${record.description}\nUPC: ${record.upc || 'N/A'}`,
      record.reason || 'Damaged',
      `${record.qty}`,
      formatPdfCurrency(record.cost),
      formatPdfCurrency(record.price),
      formatPdfCurrency(totalLineCost),
    ];
  });

  autoTable(doc, {
    startY: cardsY + cardHeight + 6,
    margin: { left: margin, right: margin },
    head: [['Photo', 'Item Details (SKU / Description / UPC)', 'Reason', 'Qty', 'Unit Cost', 'Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [29, 29, 31], // Apple dark header
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [29, 29, 31],
      minCellHeight: 18, // Ample height for thumbnail photo
      valign: 'middle',
      cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2.5 },
    },
    columnStyles: {
      0: { cellWidth: 18, halign: 'center' }, // Photo
      1: { cellWidth: 62, halign: 'left' },   // Item Details
      2: { cellWidth: 26, halign: 'left' },   // Reason
      3: { cellWidth: 14, halign: 'center' }, // Qty
      4: { cellWidth: 20, halign: 'right' },  // Unit Cost
      5: { cellWidth: 20, halign: 'right' },  // Price
      6: { cellWidth: 22, halign: 'right', fontStyle: 'bold', textColor: [190, 18, 60] }, // Total Loss
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252],
    },
    didDrawCell: (data) => {
      // Draw image in column 0 for body rows
      if (data.section === 'body' && data.column.index === 0) {
        const base64 = loadedBase64Images[data.row.index];
        const cell = data.cell;
        const imgSize = 13; // 13mm x 13mm thumbnail
        const posX = cell.x + (cell.width - imgSize) / 2;
        const posY = cell.y + (cell.height - imgSize) / 2;

        if (base64) {
          try {
            // Draw thumbnail image
            doc.addImage(base64, 'JPEG', posX, posY, imgSize, imgSize);
            // Thin subtle border around photo
            doc.setDrawColor(220, 220, 225);
            doc.setLineWidth(0.2);
            doc.rect(posX, posY, imgSize, imgSize);
          } catch {
            // Fallback placeholder box
            drawPlaceholder(posX, posY, imgSize);
          }
        } else {
          // Placeholder box when no photo is available
          drawPlaceholder(posX, posY, imgSize);
        }
      }
    },
  });

  function drawPlaceholder(x: number, y: number, size: number) {
    doc.setFillColor(242, 242, 247);
    doc.setDrawColor(218, 218, 222);
    doc.setLineWidth(0.2);
    doc.rect(x, y, size, size, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 155);
    doc.text('No Photo', x + size / 2, y + size / 2 + 1.5, { align: 'center' });
  }

  // --- Sign-Off / Approval Footer Section ---
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 200;
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  let signOffY = finalY + 5;
  if (signOffY + 22 > pageHeight - margin - 5) {
    doc.addPage();
    signOffY = margin + 10;
  }

  // Sign-off box
  doc.setDrawColor(220, 220, 225);
  doc.setFillColor(252, 252, 253);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, signOffY, pageWidth - margin * 2, 21, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(110, 110, 115);
  doc.text('AUDIT VERIFICATION & SIGN-OFF', margin + 4, signOffY + 4.5);

  const colWidth = (pageWidth - margin * 2 - 16) / 3;

  // Signature 1: Audited By
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(130, 130, 135);
  doc.text('Prepared By:', margin + 4, signOffY + 11);
  doc.setDrawColor(180, 180, 185);
  doc.line(margin + 4, signOffY + 18, margin + 4 + colWidth, signOffY + 18);

  // Signature 2: Approved By
  const sig2X = margin + 4 + colWidth + 4;
  doc.text('Approved By (Manager):', sig2X, signOffY + 11);
  doc.line(sig2X, signOffY + 18, sig2X + colWidth, signOffY + 18);

  // Signature 3: Date
  const sig3X = sig2X + colWidth + 4;
  doc.text('Date Signed:', sig3X, signOffY + 11);
  doc.line(sig3X, signOffY + 18, sig3X + colWidth, signOffY + 18);

  // Page Numbers Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 155);
    doc.text(
      `DLR #${cleanDlr}  |  Generated ${today}  |  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Trigger Download
  const fileDate = new Date().toISOString().split('T')[0];
  const safeDlr = cleanDlr.replace(/[^a-zA-Z0-9_-]/g, '_');
  const prefix = isApproved ? 'Approved' : 'Filed';
  const filename = options.filenameOverride || `DLR_${prefix}_${safeDlr}_${fileDate}.pdf`;

  doc.save(filename);
}

/**
 * Export an individual approved DLR batch as PDF
 */
export async function exportApprovedDLRToPdf(
  records: DLRRecord[],
  dlrNumber: string,
  storeCode?: string,
  options: ExportPdfOptions = {}
): Promise<void> {
  return exportFiledDLRToPdf(records, dlrNumber, storeCode, {
    ...options,
    isApproved: true,
  });
}
