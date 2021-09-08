import log, { LogCB, IWriteLogEntry, IWriteLogOpts } from "./log";

// starts a timer, returns a log function, and then ends the
// timer when you run the log
// great for timing an operation (will automatically default to that type)
// example:
// const log = startTimedOp();
// ...do some time intensive stuff
// log({
//   eventName: 'My Event'
// })
export default (): LogCB => {
  const timeStart = new Date();

  return (entry: IWriteLogEntry, opts?: IWriteLogOpts) => {
    return log(
      {
        type: "operation",
        ...entry,
        timeStart,
        timeEnd: new Date(),
      },
      opts
    );
  };
};
