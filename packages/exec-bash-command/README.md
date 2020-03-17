# @node-cli-toolkit/exec-bash-command

This is a utility that should run any bash command or CLI. It supports sending inputs to the command, checks for exit codes, and allows to check the `stdout` and `stderr` easily with a promise interface.

It also allows to run node scripts easily (that are meant to be run as CLIs)

## Supported Features:

- Run a bash command with inputs
- Check for exit codes
- Check stdout/stderr output
- Run a inline node script
- Run an inline node script with a different node command (ex: `ts-node`)
- Different timeouts for inputs
- Change the default `timeoutBetweenInputs`
- Run in a different `cwd`
- Debugger support (output the contents of the script that's running to console)

To see examples of each please see tests under `__tests__` or below.

## Usage

### Run a bash command

```typescript
import execBashCommand, {
  IExecBashCommandReturn
} from "@node-cli-toolkit/exec-bash-command";

const error = jest.fn();
const output = jest.fn();
const PROJECT_ROOT = `${__dirname}/..`;

const DEFAULT_EXEC_BASH_COMMAND_OPTS = {
  errorCB: error,
  outputCB: output,
  cwd: PROJECT_ROOT
};

const { code }: IExecBashCommandReturn = await execBashCommand({
  ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
  bashCommand: `echo "hello"`
});
expect(error.mock.calls.length).toBe(0);
expect(code).toBe(0);
expect(output).toBeCalledWith(expect.stringContaining("hello"));
```

### Run a bash command with inputs

- CLI: [mockCLIS/standard.ts](./mockCLIs/standard.ts)

```typescript
import execBashCommand, {
  IExecBashCommandReturn
} from "@node-cli-toolkit/exec-bash-command";
import { SPACE, DOWN, ENTER } from "@node-cli-toolkit/send-input-to-cli";

const error = jest.fn();
const output = jest.fn();
const PROJECT_ROOT = `${__dirname}/..`;

const DEFAULT_EXEC_BASH_COMMAND_OPTS = {
  errorCB: error,
  outputCB: output,
  cwd: PROJECT_ROOT
};

const STD_CLI_INPUTS = [
  // Check "Option 1"
  SPACE,

  // Move to "Option 2"
  DOWN,

  // Move to "Option 3"
  DOWN,

  // Check "Option 3"
  SPACE,

  // Next Question
  ENTER,

  // Type answer to "What's your name"
  "Anatoliy Zaslavskiy",

  // Submit answer to question
  ENTER
];

const { code }: IExecBashCommandReturn = await execBashCommand({
  ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
  bashCommand: `ts-node ./mockCLIs/standard.ts`,
  inputs: STD_CLI_INPUTS
});

expect(error.mock.calls.length).toBe(0);

expect(code).toBe(0);

expect(output).toBeCalledWith(
  expect.stringContaining("Which option do you want to choose?")
);

expect(output).toBeCalledWith(expect.stringContaining("◯ Option 1"));

expect(output).toBeCalledWith(expect.stringContaining("◯ Option 3"));

expect(output).toBeCalledWith(expect.stringContaining("Option 1 Chosen"));

expect(output).not.toBeCalledWith(expect.stringContaining("Option 2 Chosen"));

expect(output).toBeCalledWith(expect.stringContaining("Option 3 Chosen"));

expect(output).toBeCalledWith(
  expect.stringContaining("What's your full name?")
);

expect(output).toBeCalledWith(
  expect.stringContaining('Your name is "Anatoliy Zaslavskiy')
);
```

### Run a bash command with different exit code

```typescript
import execBashCommand, {
  IExecBashCommandReturn
} from "@node-cli-toolkit/exec-bash-command";

const error = jest.fn();
const output = jest.fn();
const PROJECT_ROOT = `${__dirname}/..`;

const DEFAULT_EXEC_BASH_COMMAND_OPTS = {
  errorCB: error,
  outputCB: output,
  cwd: PROJECT_ROOT
};

try {
  await execBashCommand({
    ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
    bashCommand: `echo "hello" && >&2 echo "Something bad happened 1" && exit 1`
  });
} catch (e) {
  expect(output).toBeCalledWith(expect.stringContaining("hello"));

  expect(error).toBeCalledWith(
    expect.stringContaining("Something bad happened")
  );

  expect(e.code).toBe(1);
}
```

### Run a bash command that outputs to stderr

```typescript
import execBashCommand, {
  IExecBashCommandReturn
} from "@node-cli-toolkit/exec-bash-command";

const error = jest.fn();
const output = jest.fn();
const PROJECT_ROOT = `${__dirname}/..`;

const DEFAULT_EXEC_BASH_COMMAND_OPTS = {
  errorCB: error,
  outputCB: output,
  cwd: PROJECT_ROOT
};

const { code }: IExecBashCommandReturn = await execBashCommand({
  ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
  bashCommand: `echo "hello" && >&2 echo "Something bad happened 2"`
});

expect(output).toBeCalledWith(expect.stringContaining("hello"));

expect(error).toBeCalledWith(expect.stringContaining("Something bad happened"));

expect(code).toBe(0);
```
