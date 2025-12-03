/**
 * CSV Export utility functions using papaparse
 */
import Papa from 'papaparse';
import dayjs from 'dayjs';

/**
 * Download CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
  // Create blob with CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up URL object
  URL.revokeObjectURL(url);
}

/**
 * Export attendance data to CSV
 */
export function exportAttendanceToCSV(
  attendees: Array<{
    First_Name: string;
    Last_Name: string;
    Email: string;
    Check_In_Time: string;
    Person_Type: string;
  }>,
  eventName: string,
  eventDate: string | null
): void {
  // Format event name and date for filename
  const sanitizedEventName = eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const dateStr = eventDate ? new Date(eventDate).toISOString().split('T')[0] : 'no-date';
  const filename = `attendance_${sanitizedEventName}_${dateStr}.csv`;
  
  // Prepare data with formatted fields
  const csvData = attendees.map(attendee => ({
    'Name': `${attendee.First_Name} ${attendee.Last_Name}`,
    'Email': attendee.Email,
    'Check in Time': dayjs(attendee.Check_In_Time).format('MMM DD, YYYY h:mm A'),
    'Person Type': attendee.Person_Type,
  }));
  
  // Convert to CSV using papaparse
  const csvContent = Papa.unparse(csvData, {
    header: true,
    delimiter: ',',
  });
  
  // Download the CSV file
  downloadCSV(csvContent, filename);
}

