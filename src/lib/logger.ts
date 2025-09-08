import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV === 'development' ? {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  } : {}),
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.aadhar',
      '*.ssn',
      '*.pan',
      '*.creditCard',
      '*.bankAccount',
      '*.phone',
      '*.email'
    ],
    censor: '[REDACTED]'
  }
})

export default logger