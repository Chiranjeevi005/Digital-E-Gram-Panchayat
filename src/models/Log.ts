import mongoose, { Document, Schema } from 'mongoose'

export interface ILog extends Document {
  action: string
  performedBy: mongoose.Types.ObjectId
  targetType: string
  targetId?: mongoose.Types.ObjectId
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const LogSchema: Schema = new Schema(
  {
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

LogSchema.index({ performedBy: 1 })
LogSchema.index({ action: 1 })
LogSchema.index({ targetType: 1 })
LogSchema.index({ createdAt: -1 })

export default mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema)