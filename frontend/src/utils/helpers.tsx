// src/utils/helpers.js

// Format date/time utility
export const formatDateTime = (dateString: string) => {
  if (!dateString) return { day: 'N/A', date: 'N/A', time: 'N/A' };
  try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) {
           // Handle potential invalid date strings gracefully
           console.warn("Invalid date string received:", dateString);
           return { day: 'Invalid Date', date: '', time: '' };
      }
      return {
        day: d.toLocaleDateString(undefined, { weekday: 'long' }),
        date: d.toLocaleDateString(),
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time
      };
  } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return { day: 'Error', date: '', time: '' };
  }
};

// Common print styles - moved here for potential reuse
export const printStyles = `
  <style>
    @media print {
      body { margin: 0; }
      @page { size: auto; margin: 5mm; } /* Adjust margin as needed */
      .ticket-card { page-break-inside: avoid !important; margin-bottom: 10px !important; display: block !important; } /* Ensure each ticket tries to stay on one page and takes full width */
      .modal-body { overflow: visible !important; } /* Ensure modal content isn't cut off */
      .no-print { display: none !important; } /* Hide elements marked with no-print */
    }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; padding: 5px; }
    .ticket-card {
      border: 1px dashed #333;
      border-radius: 6px;
      background: #fafafa;
      font-size: 9px; /* Small font for ticket */
      margin-bottom: 10px; /* Space between tickets */
      padding: 5px;
      page-break-inside: avoid; /* Try to keep ticket on one page */
      width: 180px; /* Fixed width for consistency */
      box-sizing: border-box;
      display: inline-block; /* Allow multiple tickets per row if space allows on screen */
      vertical-align: top;
      margin-right: 5px; /* Space between tickets horizontally on screen */
    }
    .ticket-header { font-size: 1.1em; font-weight: bold; text-align: center; margin-bottom: 4px; letter-spacing: 0.5px; }
    .ticket-subheader { font-size: 0.8em; font-weight: normal; text-align: center; margin-bottom: 6px; }
    .ticket-row { margin-bottom: 2px; display: flex; justify-content: space-between; align-items: baseline; }
    .ticket-label { font-weight: 600; color: #222; margin-right: 4px; white-space: nowrap; }
    .ticket-value { text-align: right; word-break: break-word; }
    .ticket-footer { margin-top: 6px; border-top: 1px dotted #aaa; padding-top: 4px; font-size: 0.9em; text-align: center; color: #555; }
    .ticket-support { color: #007bff; text-decoration: none; font-size: 0.9em; display: block; margin-top: 2px; }
  </style>
`;

