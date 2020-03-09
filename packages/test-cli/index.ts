import { writeFileSync, unlinkSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import debug from "debug";

import execBashCommand, {
  IExecBashCommandReturn
} from "@node-cli-toolkit/exec-bash-command";

import {
  DEFAULT_TIMEOUT_BETWEEN_INPUTS,
  CLIInputs
} from "@node-cli-toolkit/send-inputs-to-cli";
// if we don't pass a cwd, we will create the temporary node file in the tmp directory
const TMP_DIR = "/tmp/";

export type ITestCLIReturn = {
  // Exit code of the process
  code: number;
  error: jest.Mock;
  output: jest.Mock;
};

export interface ITestCLIOpts {
  // used if you need to test a CLI command/npm package
  // ex: `run-my-tool --someoption`
  bashCommand?: string;

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

  // this is a stringified node script to run as a child process
  // ex:
  // `
  // import myCLI from '../';
  // myCLI(someOpts: true);
  // `
  nodeScript?: string;

  // if using nodeScript, this is the command used to run the script
  // by default it's node (will run `node tmpFile.js`)
  // ex: 'tsnode'
  nodeCommand?: string;

  // file extension (ex: change to ts if using ts-node)
  extension?: string;

  // time to wait in between sending inputs
  // if one of your commands takes longer than the default
  // 100 ms increase this parameter
  timeoutBetweenInputs?: number;

  // Which directory should the CLI execute in
  cwd?: string;

  // Should we print out all the calls to the output and error mocks
  // otherwise use
  debug?: boolean;
}

export default ({
  bashCommand,
  inputs,

  nodeScript,
  nodeCommand = "node",
  extension = "js",

  timeoutBetweenInputs = DEFAULT_TIMEOUT_BETWEEN_INPUTS,
  cwd,
  debug = true
}: ITestCLIOpts = {}): Promise<ITestCLIReturn> => {
  // we handle debugging here by watching the functions we pass through
  const outputCB = jest.fn();
  const errorCB = jest.fn();

  let tmpFile;

  if (nodeScript) {
    tmpFile = `${TMP_DIR}/${uuidv4()}.${extension}`;
    writeFileSync(tmpFile, nodeScript);

    bashCommand = `${nodeCommand} "${tmpFile}"`;
  }

  return execBashCommand({
    bashCommand,
    cwd,
    outputCB,
    errorCB,
    inputs,
    timeoutBetweenInputs
  }).finally(() => {
    if (nodeScript && !debug) {
      unlinkSync(tmpFile);
    }
  });
};
