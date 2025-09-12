import User from '@/models/User'
import Notification from '@/models/Notification'
import { Types } from 'mongoose'
import { emitToUser } from '@/lib/socketService'

// Types for notification preferences
interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  types: {
    applicationUpdates: boolean
    serviceAnnouncements: boolean
    systemNotifications: boolean
  }
}

// Types for notification
interface NotificationData {
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'applicationUpdates' | 'serviceAnnouncements' | 'systemNotifications'
}

/**
 * Send a notification to a user based on their preferences
 * @param notificationData The notification data
 */
export async function sendNotification(notificationData: NotificationData) {
  try {
    // Get user with notification preferences
    const user = await User.findById(notificationData.userId).select('notificationPreferences')
    
    if (!user) {
      console.error('User not found for notification')
      return
    }
    
    const preferences: NotificationPreferences = user.notificationPreferences
    
    // Check if user wants this type of notification
    const wantsNotification = preferences.types[notificationData.category]
    
    if (!wantsNotification) {
      console.log(`User has disabled ${notificationData.category} notifications`)
      return
    }
    
    // Create in-app notification
    const notification = new Notification({
      user: new Types.ObjectId(notificationData.userId),
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type
    })
    
    await notification.save()
    
    // Emit real-time notification via Socket.IO
    emitToUser(notificationData.userId, 'notification', {
      id: notification._id.toString(),
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      timestamp: new Date(),
      read: false
    })
    
    // Send email notification if enabled
    if (preferences.email) {
      await sendEmailNotification(notificationData)
    }
    
    // Send SMS notification if enabled
    if (preferences.sms) {
      await sendSMSNotification(notificationData)
    }
    
    // Send push notification if enabled
    if (preferences.push) {
      await sendPushNotification(notificationData)
    }
    
    console.log(`Notification sent to user ${notificationData.userId}`)
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

/**
 * Send email notification
 * @param notificationData The notification data
 */
async function sendEmailNotification(notificationData: NotificationData) {
  try {
    // In a real implementation, you would integrate with an email service like SendGrid, Nodemailer, etc.
    console.log(`Email notification would be sent to user ${notificationData.userId}: ${notificationData.title}`)
    // Example implementation:
    // await emailService.send({
    //   to: user.email,
    //   subject: notificationData.title,
    //   text: notificationData.message
    // })
  } catch (error) {
    console.error('Error sending email notification:', error)
  }
}

/**
 * Send SMS notification
 * @param notificationData The notification data
 */
async function sendSMSNotification(notificationData: NotificationData) {
  try {
    // In a real implementation, you would integrate with an SMS service like Twilio
    console.log(`SMS notification would be sent to user ${notificationData.userId}: ${notificationData.title}`)
    // Example implementation:
    // await smsService.send({
    //   to: user.phone,
    //   body: `${notificationData.title}: ${notificationData.message}`
    // })
  } catch (error) {
    console.error('Error sending SMS notification:', error)
  }
}

/**
 * Send push notification
 * @param notificationData The notification data
 */
async function sendPushNotification(notificationData: NotificationData) {
  try {
    // In a real implementation, you would integrate with a push notification service
    console.log(`Push notification would be sent to user ${notificationData.userId}: ${notificationData.title}`)
    // Example implementation:
    // await pushService.send({
    //   userId: notificationData.userId,
    //   title: notificationData.title,
    //   body: notificationData.message,
    //   type: notificationData.type
    // })
  } catch (error) {
    console.error('Error sending push notification:', error)
  }
}

/**
 * Send application status update notification
 * @param userId The user ID
 * @param applicationId The application ID
 * @param status The new status
 */
export async function sendApplicationStatusUpdate(userId: string, applicationId: string, status: string) {
  await sendNotification({
    userId,
    title: 'Application Status Update',
    message: `Your application ${applicationId.substring(0, 8)} status has been updated to ${status}`,
    type: 'info',
    category: 'applicationUpdates'
  })
}

/**
 * Send service announcement notification
 * @param userId The user ID
 * @param serviceName The service name
 */
export async function sendServiceAnnouncement(userId: string, serviceName: string) {
  await sendNotification({
    userId,
    title: 'New Service Available',
    message: `A new service "${serviceName}" is now available for application`,
    type: 'info',
    category: 'serviceAnnouncements'
  })
}

/**
 * Send system notification
 * @param userId The user ID
 * @param message The notification message
 * @param type The notification type
 */
export async function sendSystemNotification(userId: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
  await sendNotification({
    userId,
    title: 'System Notification',
    message,
    type,
    category: 'systemNotifications'
  })
}