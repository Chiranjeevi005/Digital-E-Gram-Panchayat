/**
 * Utility functions for handling notifications in the application
 */
import { showNotification } from '@/lib/documentGenerator';

/**
 * Send a notification to the user via the notification API
 * @param message - The message to send
 * @param type - The type of notification (info, success, warning, error)
 * @returns Promise<boolean> - Whether the notification was sent successfully
 */
export async function sendUserNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): Promise<boolean> {
  try {
    const response = await fetch('/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        type
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

/**
 * Show a download completed notification
 * @param serviceName - The name of the service
 * @param fileType - The type of file (pdf, jpeg)
 * @returns Promise<void>
 */
export async function showDownloadCompletedNotification(serviceName: string, fileType: string): Promise<void> {
  // Send system notification
  await sendUserNotification(
    `Download completed: ${serviceName} (${fileType.toUpperCase()})`,
    'success'
  );
  
  // Show immediate visual feedback
  showNotification(`Your ${fileType.toUpperCase()} download has completed`);
}

/**
 * Show an error notification for download failures
 * @returns Promise<void>
 */
export async function showDownloadErrorNotification(): Promise<void> {
  // Send system notification
  await sendUserNotification(
    'Error downloading document. Please try again.',
    'error'
  );
  
  // Show immediate visual feedback
  showNotification('Error downloading document. Please try again.');
}