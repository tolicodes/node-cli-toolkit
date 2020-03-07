import * as child_process from "child_process";

import sendInputs, {
  DEFAULT_TIMEOUT_BETWEEN_INPUTS,
  CLIInputs
} from "@infragen/util-send-inputs-to-cli";

export interface IExecBashCommandReturn {
  // Exit code of the process
  code: number;
  error: any;
  output: any;
}

export interface IExecBashCommandOpts {
  // a standard bash command
  // ex: `echo "hi"`
  bashCommand: string;

  // this is a list of inputs that need to be sent to cli
  // if a string is passed then it will use the default
  // timeoutBetweenInputs
  // if an object is passed, you can specify the time to
  // wait before the input
  // ex:
  // [
  //   'hello',
  //   '\x20',
  //   {
  //     input: 'test'
  //     timeoutBeforeInput: 1000
  //   }
  // ]
  //
  inputs?: CLIInputs;

  outputCB?: any;
  errorCB?: any;

  // only writes to `outputCB` instead of `errorCB` (good to use with git commands)
  onlyOutputCB?: boolean;

  // Should we print out all the calls to the output and error mocks
  // otherwise use
  debug?: boolean;

  // time to wait in between sending inputs
  // if one of your commands takes longer than the default
  // 100 ms increase this parameter
  timeoutBetweenInputs?: number;

  // Which directory should the CLI execute in
  cwd?: string;
}

export default ({
  bashCommand,
  inputs,

  timeoutBetweenInputs = DEFAULT_TIMEOUT_BETWEEN_INPUTS,

  outputCB,
  errorCB,
  debug = false,
  onlyOutputCB,

  cwd
}: IExecBashCommandOpts): Promise<IExecBashCommandReturn> =>
  new Promise((resolve, reject) => {
    const output = `Executing command "${bashCommand}" in ${cwd}`;
    debug && console.log(output);
    outputCB && outputCB();
    const proc = child_process.exec(bashCommand, {
      cwd
    });

    proc.stdout.on("data", data => {
      debug && console.log(data);
      outputCB && outputCB(data);
    });

    proc.stderr.on("data", data => {
      if (onlyOutputCB) {
        debug && console.log(data);
        outputCB && outputCB(data);
      } else {
        debug && console.error(data);
        errorCB && errorCB(data);
      }
    });

    const sendInputsPromise = sendInputs({
      inputs,
      stdin: proc.stdin,
      timeoutBetweenInputs
    });

    proc.on("exit", code => {
      sendInputsPromise.then(
        () => {
          if (code === 0) {
            resolve({
              code,
              error: errorCB,
              output: outputCB
            });
          } else {
            reject({
              code,
              message: `Failed executing "${bashCommand}" with exit code: ${code}`,
              error: errorCB,
              output: outputCB
            });
          }
        },
        message => {
          reject({
            code: 1,
            message,
            error: errorCB,
            output: outputCB
          });
        }
      );
    });
  });
