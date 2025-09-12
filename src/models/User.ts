import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import logger from '@/lib/logger'

export interface IUser extends Document {
  name: string
  email: string
  password: string | null
  role: 'Citizens' | 'Staff' | 'Officer'  // Exact role names as specified
  provider: 'local' | 'google'
  emailVerified?: Date | null
  status: 'active' | 'inactive' | 'suspended'
  department?: string
  position?: string
  employeeId?: string
  notificationPreferences: {
    email: boolean
    sms: boolean
    push: boolean
    types: {
      applicationUpdates: boolean
      serviceAnnouncements: boolean
      systemNotifications: boolean
    }
  }
  isDeactivated?: boolean
  deactivatedAt?: Date
  failedLoginAttempts?: number
  lastFailedLoginAttempt?: Date
  lockoutUntil?: Date
  twoFactorSecret?: string
  twoFactorEnabled?: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // This automatically creates an index
    },
    password: {
      type: String,
      required: function(this: IUser) { return this.provider === 'local'; }, // Required only for local accounts
    },
    role: {
      type: String,
      enum: ['Citizens', 'Staff', 'Officer'],  // Exact role names as specified
      default: 'Citizens',
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    department: {
      type: String,
    },
    position: {
      type: String,
    },
    employeeId: {
      type: String,
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      },
      types: {
        applicationUpdates: {
          type: Boolean,
          default: true
        },
        serviceAnnouncements: {
          type: Boolean,
          default: true
        },
        systemNotifications: {
          type: Boolean,
          default: true
        }
      }
    },
    isDeactivated: {
      type: Boolean,
      default: false
    },
    deactivatedAt: {
      type: Date,
      default: null
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lastFailedLoginAttempt: {
      type: Date,
      default: null
    },
    lockoutUntil: {
      type: Date,
      default: null
    },
    twoFactorSecret: {
      type: String,
      default: null
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
UserSchema.pre('save', async function (next) {
  // Only hash the password if it's being modified and is a local account
  if (!this.isModified('password') || this.provider !== 'local') return next()
  
  try {
    // Use higher salt rounds for better security
    const saltRounds = 12
    const password = this.password as string;
    this.password = await bcrypt.hash(password, saltRounds)
    next()
  } catch (error) {
    logger.error({ error }, 'Error hashing password:')
    next(error as Error)
  }
})

// Add indexes for role-based queries and provider-based queries
UserSchema.index({ role: 1 })
UserSchema.index({ provider: 1 })
UserSchema.index({ email: 1, provider: 1 }) // Composite index for efficient lookups

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)