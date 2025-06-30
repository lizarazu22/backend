const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
const DailyRotateFile = require('winston-daily-rotate-file');

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

// 📦 Transport para logs INFO+
const dailyRotateTransport = new DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '5m',
  maxFiles: '14d',
  level: 'info'
});

// 📦 Transport para logs ERROR
const errorRotateTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '5m',
  maxFiles: '30d',
  level: 'error'
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    dailyRotateTransport,
    errorRotateTransport
  ]
});

// 📋 Solo en desarrollo: log en consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize(),
      logFormat
    )
  }));
}

module.exports = logger;
