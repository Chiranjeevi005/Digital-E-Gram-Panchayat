import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  user: mongoose.Types.ObjectId
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: Date
  readAt?: Date
}

const NotificationSchema: Schema = new Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  readAt: { 
    type: Date 
  }
})

// Index for efficient querying
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)