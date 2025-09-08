import mongoose, { Document, Schema } from 'mongoose'

export interface IDownloadHistory extends Document {
  application: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  service: mongoose.Types.ObjectId
  fileType: 'pdf' | 'jpeg'
  status: 'pending' | 'completed'
  downloadLink?: string
  createdAt: Date
  updatedAt: Date
}

const DownloadHistorySchema: Schema = new Schema(
  {
    application: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'jpeg'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'completed', // All downloads are completed immediately
    },
    downloadLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.DownloadHistory || mongoose.model<IDownloadHistory>('DownloadHistory', DownloadHistorySchema)