# @infragen/util-test-cli

This is a generic utility that should be able to test any CLI. It's meant to be used in the context of Jest as it exports mock functions that fire when there's data on `stdout` or `stderr`

## Supported Features:

- Run a bash command with inputs
- Check for exit codes
- Check stdout/stderr output
- Run a inline node script
- Run an inline node script with a different node command (ex: `ts-node`)
- Different timeouts for inputs
- Change the default `timeoutBetweenInputs`
- Run in a different CWD
- Debugger support (output the contents of the script that's running to console)

To see examples of each please see tests under `__tests__`

## Usage

### Basic usage

```typescript
import { ITestGeneratorOutput }, testCLI from '@infragen/util-test-cli';
import { SPACE, DOWN, ENTER } from '@infragen/send-input-to-cli';

const { code, error, output }: ITestCLIReturn = await testCLI({
      bashCommand: `ts-node ./mockCLIs/standard.ts`,
      inputs: STD_CLI_INPUTS
    });

    expect(error.mock.calls.length).toBe(0);

    expect(code).toBe(0);

    expect(output).toBeCalledWith(
      expect.stringMatching(/Which option do you want to choose\?/)
    );

    expect(output).toBeCalledWith(expect.stringMatching(/◯ Option 1/));

    expect(output).toBeCalledWith(expect.stringMatching(/◯ Option 3/));

    expect(output).toBeCalledWith(expect.stringMatching(/Option 1 Chosen/));

    expect(output).not.toBeCalledWith(expect.stringMatching(/Option 2 Chosen/));

    expect(output).toBeCalledWith(expect.stringMatching(/Option 3 Chosen/));

    expect(output).toBeCalledWith(
      expect.stringMatching(/What's your full name\?/)
    );

    expect(output).toBeCalledWith(
      expect.stringMatching(/Your name is "Anatoliy Zaslavskiy"/)
    );

```
