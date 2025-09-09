import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId: string, filename: string = 'invoice.pdf') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Hide buttons and edit elements before capturing
    const buttonsToHide = element.querySelectorAll('[data-hide-in-pdf]');
    buttonsToHide.forEach(btn => {
      (btn as HTMLElement).style.display = 'none';
    });

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#0b0f12',
      allowTaint: true,
      useCORS: true,
    });

    // Restore hidden elements
    buttonsToHide.forEach(btn => {
      (btn as HTMLElement).style.display = '';
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};