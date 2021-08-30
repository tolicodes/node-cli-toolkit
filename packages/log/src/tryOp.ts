import log, {
  DataMap,
  LogCB,
  LogEventType,
  IWriteLogEntry,
  IWriteLogOpts,
} from "./";
import startTimedOp from "./startTimedOp";
import softError, { ISoftErrorEntry, SoftErrorCB } from "./softErrorLog";
type AddToDataMapCB = (dataMapAdditions: DataMap) => void;

// for the internal callback prefilled logging funcs
interface IOptionalEventName {
  eventName?: string;
}
interface ITryOpCallbackLoggingFuncs {
  log: LogCB & IOptionalEventName;
  softError: SoftErrorCB & IOptionalEventName;

  addDataToMap: AddToDataMapCB;
}

type TryOpCallback = (loggingFuncs: ITryOpCallbackLoggingFuncs) => any;
type TryOpReturn = (callback: TryOpCallback) => Promise<void>;

interface ITryOpParams {
  eventName: string;
  type?: LogEventType;
}

// provides a wrapper to try an operation, log data along the way, and
// fail gracefully
// example:
// tryOp({
//   eventName: "fixNextBillingDate",
// })(async ({ addDataToMap, softError }) => {
//   const data1 = 'blah';

//   addDataToMap({ data1 });

//   const data2 = 'blah';
//   const data3 = 'blah';

//   addDataToMap({ data2, data3 });

//   softError({
//     errorCode: 'SOMETHING_BAD_BUT_RECOVERABLE',
//     errorMessage: 'Something bad but recoverable happened. Check on this later'
//   });

//   return 'result';
// });

export default (
  { eventName, type = "operation" }: ITryOpParams,
  opts?: IWriteLogOpts
): TryOpReturn => {
  const complete = startTimedOp();
  return async (callback: TryOpCallback): Promise<any> => {
    // we will collect data here a bit at a time and output it with the error success
    let dataMap = {};

    try {
      const result = await callback({
        // the log function but with eventName and type filled in
        log: (
          entry: IWriteLogEntry & { eventName?: string },
          opts?: IWriteLogOpts
        ): void => {
          return log(
            {
              ...entry,
              eventName,
              type,
            },
            opts
          );
        },

        // adds data to the datamap to be outputted in the end
        addDataToMap: (dataMapAdditions: DataMap): void => {
          dataMap = {
            ...dataMap,
            ...dataMapAdditions,
          };
        },

        // here the event name and type are automatically filled in
        softError: (
          entry: ISoftErrorEntry & { eventName?: string },
          opts?: IWriteLogOpts
        ): void =>
          softError(
            {
              ...entry,
              eventName,
              type,
            },
            opts
          ),
      });

      complete(
        {
          eventName,
          type,
          status: "success",
          data: result,
          dataMap,
        },
        opts
      );

      return result;
    } catch (e) {
      // log it
      complete(
        {
          eventName,
          type,
          status: "criticalError",
          errorCode: e.errorCode || "UNKNOWN_ERROR",
          errorMessage:
            e.errorMessage ||
            `An unknown error has occurred when executing ${eventName}`,
          errorObject: e,
          dataMap,
        },
        opts
      );

      // throw it back into the wind!
      throw e;
    }
  };
};
