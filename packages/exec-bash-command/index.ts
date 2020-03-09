import * as child_process from "child_process";
import debug from "debug";

import sendInputs, {
  DEFAULT_TIMEOUT_BETWEEN_INPUTS,
  CLIInputs
} from "@node-cli-toolkit/send-inputs-to-cli";

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
  onlyOutputCB,

  cwd
}: IExecBashCommandOpts): Promise<IExecBashCommandReturn> =>
  new Promise((resolve, reject) => {
    const debugCommand = debug(`exec-bash-command`);

    const output = `Executing command "${bashCommand}" in ${cwd}`;
    debugCommand(output);
    outputCB && outputCB(output);
    const proc = child_process.exec(bashCommand, {
      cwd
    });

    // only start sending inputs after the first output
    let firstOutput = true;

    // promise when all the inputs are sent
    let sendInputsPromise;

    proc.stdout.on("data", data => {
      debugCommand(data);
      outputCB && outputCB(data);

      // if we are on our first output,
      // begin sending inputs
      if (firstOutput) {
        sendInputsPromise = sendInputs({
          inputs,
          stdin: proc.stdin,
          timeoutBetweenInputs
        });
        firstOutput = false;
      }
    });

    proc.stderr.on("data", data => {
      if (onlyOutputCB) {
        debugCommand(data);
        outputCB && outputCB(data);
      } else {
        debugCommand(data);
        errorCB && errorCB(data);
      }
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
