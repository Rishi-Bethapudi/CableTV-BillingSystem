import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (res, transaction, customer, operator) => {
  const themeColor = operator.themeColor || '#0A3D91'; // fallback
  const logo = operator.logoUrl; // string URL
  const businessName =
    operator.businessName || operator.name || 'Cable Billing Service';

  const doc = new PDFDocument({ margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename=Invoice_${transaction.invoiceId}.pdf`
  );

  doc.pipe(res);

  // Header bar
  doc.rect(0, 0, doc.page.width, 60).fill(themeColor);
  doc.fill('#FFFFFF').fontSize(22).text(businessName, 40, 18);

  if (logo) {
    try {
      doc.image(logo, doc.page.width - 120, 12, { width: 60, height: 35 });
    } catch {}
  }

  doc.moveDown(3).fill('#000000');

  // Invoice Info
  doc.fontSize(16).text('INVOICE', { align: 'right' });
  doc
    .fontSize(11)
    .text(`Invoice No: ${transaction.invoiceId}`, { align: 'right' })
    .text(
      `Date: ${new Date(transaction.createdAt).toLocaleDateString('en-IN')}`,
      { align: 'right' }
    )
    .moveDown();

  // Customer Info
  doc.fontSize(12).text('BILLED TO:', { underline: true }).moveDown(0.3);
  doc
    .text(customer.name)
    .text(customer.address || '')
    .text(customer.phone ? `Phone: ${customer.phone}` : '')
    .moveDown();

  // Bill Table
  doc.moveDown().fontSize(13).text('Bill Details', { underline: true });
  doc.moveDown(0.7).fontSize(11);

  const itemName =
    transaction.productId?.name ||
    transaction.note ||
    'Service Charge / Add-on';

  const value = transaction.baseAmount || transaction.amount;
  const extra = transaction.extraCharge || 0;
  const discount = transaction.discount || 0;
  const net = transaction.netAmount || transaction.amount;

  doc.text(`Item        : ${itemName}`);
  doc.text(`Base Amount : ₹${value}`);
  if (extra) doc.text(`Extra Charge : + ₹${extra}`);
  if (discount) doc.text(`Discount : - ₹${discount}`);
  doc.text('────────────────────────────');
  doc.font('Helvetica-Bold').text(`Net Payable : ₹${net}`);
  doc.font('Helvetica').moveDown();

  // Balance summary
  doc.text(`Balance Before: ₹${transaction.balanceBefore}`);
  doc.text(`Amount Added : ₹${net}`);
  doc.moveDown(0.4);
  doc
    .font('Helvetica-Bold')
    .text(`Balance After : ₹${transaction.balanceAfter}`);

  // Footer
  doc.moveDown(2);
  doc
    .fontSize(11)
    .fill(themeColor)
    .text('Thank you for choosing our service!', {
      align: 'center',
    });

  doc.end();
};
