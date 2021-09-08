import winstonLogger from "./winstonLogger";
import getShallowObject from "./getShallowObject";
import createArrayLengthMap from "./createArrayLengthMap";

const LOGGER_FILE_NAME = process.env.LOGGER_FILE_NAME || `${process.cwd()}/log.json`;
const LOGGER_SERVICE_NAME = process.env.LOGGER_SERVICE_NAME || "default";
const LOGGER_GCP = !!process.env.LOGGER_GCP || false;
const LOGGER_DEFAULT_EXTRACT_KEYS = process.env.LOGGER_DEFAULT_EXTRACT_KEYS;
const LOGGER_DEFAULT_DEPTH = Number(process.env.LOGGER_DEFAULT_DEPTH) || 1;

// so GCP doesn't freak out
const LOGGER_MAX_ARRAY_LENGTH = Number(process.env.LOGGER_MAX_ARRAY_LENGTH);

export type LogCB = (entry: IWriteLogEntry, opts?: IWriteLogOpts) => void;
export type LogEventType = "log" | "script" | "operation";
// softError is something we should look into, but doesn't halt execution
export type EventStatus =
  | "success"
  | "failure"
  | "criticalError"
  | "softError"
  | "info";
export type DataMap = {
  [key: string]: any;
};

export interface IWriteLogEntry {
  eventName: string;

  data?: any;

  dataMap?: DataMap;
  params?: DataMap;

  status?: EventStatus;

  type?: LogEventType;

  timeStart?: Date;
  timeEnd?: Date;

  timestamp?: Date;

  // For Errors
  errorCode?: string;
  errorMessage?: string;

  // For critical (halting) error
  errorObject?: any;
}

export interface IWriteLogOpts {
  writeFile?: boolean;

  // just write the first level of data objects (otherwise it produced enormous files)
  writeFileShallowData?: boolean;
  consoleLog?: boolean;
  consoleLogData?: boolean;
  consoleLogDataCounts?: boolean;

  // how long did the logging operation itself take
  consoleLogLoggingTime?: boolean;

  extractKeys?: string[];
}

export default (
  {
    eventName: event,
    params,
    data,
    dataMap,
    status,
    type,
    timestamp = new Date(),
    timeStart,
    timeEnd,

    errorCode,
    errorMessage,
    errorObject,
  }: IWriteLogEntry,
  {
    writeFile = true,
    writeFileShallowData = true,
    consoleLog = true,
    consoleLogData = false,
    consoleLogDataCounts = true,
    consoleLogLoggingTime = false,
    extractKeys,
  }: IWriteLogOpts = {}
): void => {
  const loggingStateTime = new Date();

  // for operations and scripts, we assume "success" by default. for logs and others, we just assume info
  status = status || (type === "log" || type === "script" ? "success" : "info");

  extractKeys = extractKeys || (LOGGER_DEFAULT_EXTRACT_KEYS ? LOGGER_DEFAULT_EXTRACT_KEYS.split(',') : undefined);

  const timeStampString = (timestamp || new Date()).toISOString();

  const dataMapCounts = dataMap ? createArrayLengthMap(dataMap) : undefined;

  const dataCount = Array.isArray(data) ? data.length : undefined;

  const timeTaken: number | undefined =
    timeStart && timeEnd ? timeEnd.getTime() - timeStart.getTime() : undefined;

  const logEntry = {
    // put these on top because they're huge. We might be reading file from bottom so we see important info first

    // here we only want one level of nesting. if it's a primitive it will return that
    // if it's an array, it will loop through the elements, and get only 1 level of
    // nesting from the objects
    data: writeFileShallowData
      ? getShallowObject(data, {
          depth: LOGGER_DEFAULT_DEPTH,
          ignoreArrays: false,
          extractKeys,
          maxArrayLength: LOGGER_MAX_ARRAY_LENGTH
        })
      : data,
    // here we want 2 levels of nesting (one for the object names, and one for the
    // objects themselves)
    dataMap: writeFileShallowData
      ? getShallowObject(dataMap, {
          // because we want to account for the objects themselves
          depth: LOGGER_DEFAULT_DEPTH + 1,
          ignoreArrays: false,
          extractKeys,
          maxArrayLength: LOGGER_MAX_ARRAY_LENGTH,
        })
      : dataMap,

    event,
    type,
    status,
    params,

    dataCount,
    dataMapCounts,

    timestamp: timeStampString,
    timeStart,
    timeEnd,
    timeTaken,

    errorCode,
    errorMessage,
    errorObject,
  };

  const logger = winstonLogger({
    service: LOGGER_SERVICE_NAME,
    filename: LOGGER_FILE_NAME,
    gcpLogger: LOGGER_GCP,
  });

  const errorStatuses = ["failure", "criticalError", "softError"];

  if (writeFile) {
    const type = errorStatuses.includes(status) ? "error" : "info";

    logger.log(type, logEntry);
  }

  if (consoleLog) {
    console.log(
      `${timeStampString} - [${type}]${event} - ${status} ${
        timeTaken && `[${timeTaken} ms]`
      }`
    );

    if (consoleLogData) {
      data && console.log(data);
      dataMap && console.log(dataMap);
    }

    if (consoleLogDataCounts) {
      data && dataCount && console.log(`Data Count: ${dataCount}`);
      dataMap && dataMapCounts && console.log(`Data Map Counts`, dataMapCounts);
    }
  }
  const loggingEndTime = new Date();

  consoleLogLoggingTime &&
    console.log(
      "Logging Time",
      loggingEndTime.getTime() - loggingStateTime.getTime()
    );
};
