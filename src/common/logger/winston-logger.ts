        
// import { createLogger, transports, format } from 'winston';

// export const logger = createLogger({
//   level: 'info',
//   format: format.combine(
//     format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//     format.printf(({ timestamp, level, message }) => {
//       return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
//     })
//   ),
//   transports: [
//     new transports.Console(),
//     new transports.File({ filename: 'logs/combined.log' }),
//     new transports.File({ filename: 'logs/error.log', level: 'error' }),
//   ],
// });
