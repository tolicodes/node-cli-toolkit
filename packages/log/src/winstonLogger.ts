const winston = require("winston");

// Imports the Google Cloud client library for Winston
const { LoggingWinston } = require("@google-cloud/logging-winston");

export default ({
  service,
  filename,
  gcpLogger,
}: {
  service: string;
  filename: string;
  gcpLogger?: boolean
}) => {
  const transports = [
    new winston.transports.File({ filename })
  ]

  // Add GCP Stackdriver Logging
  if(gcpLogger) { 
    const gcpLoggingTransport = new LoggingWinston();
    transports.push(gcpLoggingTransport);
  }

  const { log, error } = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service },
    transports,
  });

  return (())
};
