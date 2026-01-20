// Utility functions for sharing bills
import html2canvas from 'html2canvas';

// Convert bill element to image blob
export const captureBillAsImage = async (elementId) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Bill element not found');
    }

    // Temporarily hide no-print elements
    const noPrintElements = element.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.style.display = 'none');

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });

    // Show no-print elements again
    noPrintElements.forEach(el => el.style.display = '');

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error capturing bill:', error);
    throw error;
  }
};

// Share via WhatsApp Web with image
export const shareViaWhatsApp = async (elementId, billNumber) => {
  try {
    const blob = await captureBillAsImage(elementId);
    
    // For WhatsApp Web, we need to download the image first
    // Then user can manually attach it
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bill-${billNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Open WhatsApp Web
    setTimeout(() => {
      const whatsappUrl = `https://wa.me/`;
      window.open(whatsappUrl, '_blank');
    }, 500);

    return { success: true, message: 'Image downloaded. Please attach it in WhatsApp.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Share via native share with image
export const shareViaNativeShare = async (elementId, billNumber) => {
  try {
    const blob = await captureBillAsImage(elementId);
    
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], `Bill-${billNumber}.png`, { type: 'image/png' });
      const shareData = {
        files: [file],
        title: `Bill #${billNumber}`,
        text: `Bill from Prashant Event & Fireworks`,
      };

      // Check if sharing files is supported
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return { success: true };
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Bill-${billNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return { success: true, message: 'Image downloaded successfully' };
      }
    } else {
      // Fallback: download the image
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bill-${billNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return { success: true, message: 'Image downloaded successfully' };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, message: 'Share cancelled' };
    }
    return { success: false, message: error.message };
  }
};

// Download bill as image
export const downloadBillImage = async (elementId, billNumber) => {
  try {
    const blob = await captureBillAsImage(elementId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bill-${billNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
