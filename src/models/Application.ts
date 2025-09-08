import mongoose, { Document, Schema } from 'mongoose'

export interface IApplication extends Document {
  service: mongoose.Types.ObjectId
  applicant: mongoose.Types.ObjectId
  status: 'pending' | 'in-progress' | 'approved' | 'rejected'
  formData: Record<string, any>
  assignedTo?: mongoose.Types.ObjectId
  remarks?: string
  processingTime: number // in days
  downloadStatus?: 'pending' | 'processing' | 'ready' | 'completed'
  downloadLinks?: {
    pdf?: string
    jpeg?: string
  }
  submittedAt: Date
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ApplicationSchema: Schema = new Schema(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'approved', 'rejected'],
      default: 'pending',
    },
    formData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    remarks: {
      type: String,
    },
    processingTime: {
      type: Number,
      required: true,
      default: 0, // Immediate processing for free service
    },
    downloadStatus: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'completed'],
      default: 'ready', // Ready for immediate download
    },
    downloadLinks: {
      pdf: String,
      jpeg: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
      default: Date.now, // Processed immediately for free service
    },
  },
  {
    timestamps: true,
  }
)

ApplicationSchema.index({ applicant: 1 })
ApplicationSchema.index({ service: 1 })
ApplicationSchema.index({ status: 1 })

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema)