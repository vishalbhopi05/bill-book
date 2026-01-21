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

    // Find all scrollable containers and tables
    const scrollableContainers = element.querySelectorAll('.items-table-container, .bill-table-wrapper, [style*="overflow"]');
    const tables = element.querySelectorAll('table');
    
    // Store original styles
    const originalStyles = [];
    const originalTableStyles = [];
    const originalElementStyle = {
      width: element.style.width,
      maxWidth: element.style.maxWidth,
      overflow: element.style.overflow,
    };
    
    // Ensure main element doesn't clip content
    element.style.width = 'auto';
    element.style.maxWidth = 'none';
    element.style.overflow = 'visible';
    
    // Remove overflow and scrolling from containers
    scrollableContainers.forEach((container, index) => {
      originalStyles[index] = {
        overflow: container.style.overflow,
        overflowX: container.style.overflowX,
        overflowY: container.style.overflowY,
        width: container.style.width,
        maxWidth: container.style.maxWidth,
      };
      container.style.overflow = 'visible';
      container.style.overflowX = 'visible';
      container.style.overflowY = 'visible';
      container.style.width = 'auto';
      container.style.maxWidth = 'none';
    });
    
    // Ensure tables are full width
    tables.forEach((table, index) => {
      originalTableStyles[index] = {
        minWidth: table.style.minWidth,
        width: table.style.width,
        tableLayout: table.style.tableLayout,
      };
      table.style.minWidth = 'auto';
      table.style.width = '100%';
      table.style.tableLayout = 'auto';
    });

    // Calculate the full width needed with extra buffer for padding/borders
    const tableWidths = Array.from(tables).map(t => {
      // Get computed style to include padding and borders
      const computedStyle = window.getComputedStyle(t);
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
      const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
      const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
      const borderRight = parseFloat(computedStyle.borderRightWidth) || 0;
      return t.scrollWidth + paddingLeft + paddingRight + borderLeft + borderRight;
    });
    
    const fullWidth = Math.max(
      element.scrollWidth,
      element.offsetWidth,
      ...tableWidths
    ) + 40; // Add 40px buffer for margins and potential clipping

    // Wait a moment for DOM to settle after style changes
    await new Promise(resolve => setTimeout(resolve, 150));

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: fullWidth,
      windowWidth: fullWidth,
      scrollX: 0,
      scrollY: -window.scrollY,
      x: 0,
      y: 0,
    });

    // Restore original styles
    element.style.width = originalElementStyle.width;
    element.style.maxWidth = originalElementStyle.maxWidth;
    element.style.overflow = originalElementStyle.overflow;
    
    scrollableContainers.forEach((container, index) => {
      if (originalStyles[index]) {
        container.style.overflow = originalStyles[index].overflow;
        container.style.overflowX = originalStyles[index].overflowX;
        container.style.overflowY = originalStyles[index].overflowY;
        container.style.width = originalStyles[index].width;
        container.style.maxWidth = originalStyles[index].maxWidth;
      }
    });
    
    tables.forEach((table, index) => {
      if (originalTableStyles[index]) {
        table.style.minWidth = originalTableStyles[index].minWidth;
        table.style.width = originalTableStyles[index].width;
        table.style.tableLayout = originalTableStyles[index].tableLayout;
      }
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
