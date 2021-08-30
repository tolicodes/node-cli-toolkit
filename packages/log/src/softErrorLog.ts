import log, { IWriteLogEntry, IWriteLogOpts } from ".";

export interface IRequiredErrorParams {
  errorCode: string;
  errorMessage: string;
}

export type ISoftErrorEntry = IWriteLogEntry & IRequiredErrorParams;
export type SoftErrorCB = (
  entry: ISoftErrorEntry,
  opts?: IWriteLogOpts
) => void;

// when we don't want to halt execution but bring up the error
// this is just a shortcut, which fills in the status, and requires
// the error fields
export default (entry: ISoftErrorEntry, opts?: IWriteLogOpts): void => {
  return log(
    {
      ...entry,
      status: "softError",
    },
    opts
  );
};
