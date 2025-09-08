import mongoose, { Document, Schema } from 'mongoose'

export interface IService extends Document {
  name: string
  description: string
  requirements: string[]
  processingTime: number // in days
  isActive: boolean
  category?: string
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ServiceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [{
      type: String,
    }],
    processingTime: {
      type: Number,
      required: true,
      default: 0, // Immediate processing for free service
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema)