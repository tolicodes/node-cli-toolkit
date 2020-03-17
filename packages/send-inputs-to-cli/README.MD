# @node-cli-toolkit/send-inputs-to-cli

This is a generic utility that should be able to send inputs to any CLI/process executed by `child_process.exec`. It's meant to be used in the context of Jest as it exports mock functions that fire when there's data on `stdout` or `stderr`. It is also mean to be used in conjunction with [`@node-cli-toolkit/test-cli`](../test-cli/)

## Supported Features:

- Send inputs to a CLI
- Set different timeout for inputs
- Set a default `timeoutBetweenInputs`

To see examples of each please see tests under `__tests__`

## Usage

### Basic usage

```typescript
const { output, error, code } = await testSendInputToCLI({
  bashCommand: "ts-node ./mockCLIs/standard.ts",
  inputs: [
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
  ]
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

expect(output).toBeCalledWith(expect.stringMatching(/What's your full name\?/));

expect(output).toBeCalledWith(
  expect.stringMatching(/Your name is "Anatoliy Zaslavskiy"/)
);
```
