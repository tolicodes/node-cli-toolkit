import prependFile from "./prependFile";
import getShallowObject from "./getShallowObject";
import createArrayLengthMap from "./createArrayLengthMap";

const LOG_FILE_NAME = `${__dirname}/../../log.json`;

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
  errorObject?: string;
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
  }: IWriteLogOpts = {}
): void => {
  const loggingStateTime = new Date();

  // for operations and scripts, we assume "success" by default. for logs and others, we just assume info
  status = status || (type === "log" || type === "script" ? "success" : "info");

  const timeStampString = (timestamp || new Date()).toISOString();

  const dataMapCounts = dataMap ? createArrayLengthMap(dataMap) : undefined;

  const dataCount = Array.isArray(data) ? data.length : undefined;

  const timeTaken: number | undefined =
    timeStart && timeEnd ? timeEnd.getTime() - timeStart.getTime() : undefined;

  const logEntry = JSON.stringify(
    {
      // put these on top because they're huge. We might be reading file from bottom so we see important info first

      // here we only want one level of nesting. if it's a primitive it will return that
      // if it's an array, it will loop through the elements, and get only 1 level of
      // nesting from the objects
      data: writeFileShallowData ? getShallowObject(data, 1) : data,
      // here we want 2 levels of nesting (one for the object names, and one for the
      // objects themselves)
      dataMap: writeFileShallowData ? getShallowObject(dataMap, 2) : dataMap,

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
    },
    null,
    2
  );

  if (writeFile) {
    prependFile(LOG_FILE_NAME, logEntry);
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
