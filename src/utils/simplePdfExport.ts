import jsPDF from 'jspdf';
import { Invoice } from '../types';

export const exportSimplePDF = (invoice: Partial<Invoice>, currency: 'USD' | 'PKR' = 'USD') => {
  const doc = new jsPDF();
  let y = 15;
  const left = 15;
  const lineHeight = 10;
  const currencySymbol = currency === 'USD' ? '$' : '₨';

  // Helper for bold heading
  const addHeading = (text: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(text, left, y);
    y += lineHeight;
  };
  // Helper for normal text
  const addText = (text: string) => {
    doc.setFont('helvetica', 'normal');
    doc.text(text, left, y);
    y += lineHeight;
  };

  addHeading('Invoice');
  y += 2;

  addHeading('Invoice Date:');
  addText(invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '');

  addHeading('Status:');
  addText(invoice.status || '');

  addHeading('Project Title:');
  addText(invoice.projectTitle || '');

  addHeading('Website Pages:');
  addText(invoice.websitePages !== undefined ? String(invoice.websitePages) : '');

  addHeading('Freelancer Info:');
  addText(`Name: ${invoice.freelancerName || ''}`);
  addText(`Email: ${invoice.freelancerEmail || ''}`);
  addText(`Contact: ${invoice.freelancerContact || ''}`);

  addHeading('Client Info:');
  addText(`Name: ${invoice.clientName || ''}`);
  addText(`Email: ${invoice.clientEmail || ''}`);
  addText(`Contact: ${invoice.clientContact || ''}`);

  addHeading('Features:');
  (invoice.features || []).forEach((feature, idx) => {
    addText(`${idx + 1}. ${feature.description}`);
  });

  addHeading('Revisions:');
  addText(`Total: ${invoice.totalRevisions ?? ''}`);
  addText(`Used: ${invoice.usedRevisions ?? ''}`);

  addHeading('Payment:');
  addText(`Total Payment: ${currencySymbol}${invoice.totalPayment ?? ''}`);
  addText(`Paid Payment: ${currencySymbol}${invoice.paidPayment ?? ''}`);
  addText(`Payment Status: ${invoice.paymentStatus || ''}`);

  doc.save(`invoice-${invoice.projectTitle || 'untitled'}.pdf`);
};
