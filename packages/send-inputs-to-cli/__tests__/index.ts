import * as child_process from "child_process";
import sendInputsToCLI, { CLIInputs, SPACE, DOWN, ENTER } from "../index";

interface ISendInputsToCli {
  // inputs to send
  inputs: CLIInputs;
  timeoutBetweenInputs?: number;
  // the bash command to run
  bashCommand: string;
  // output to the screen the stdout/sterr from the process
  debug?: boolean;
}

interface ITestCLIReturn {
  // mock function that fires every stdout event
  output: jest.Mock;
  // mock function that fires every sterr event
  error: jest.Mock;
  // exit code of the process
  code: number;
}

// These tests take a while to run (vs usual 5s)
const CLI_TIMEOUT = 180000;
const DEFAULT_TIMEOUT = 5000;
const PROJECT_ROOT = `${__dirname}/..`;

// a mini version of the read Test CLI used solely for testing SendInputsToCLI
const testSendInputToCLI = async ({
  inputs,
  timeoutBetweenInputs,
  bashCommand,
  debug
}: ISendInputsToCli): Promise<ITestCLIReturn> =>
  new Promise(async resolve => {
    const output = jest.fn();
    const error = jest.fn();

    const proc = child_process.exec(bashCommand, {
      cwd: PROJECT_ROOT
    });

    proc.stdout.on("data", data => {
      debug && console.log(data);
      output(data);
    });

    proc.stderr.on("data", data => {
      debug && console.error(data);
      error(data);
    });

    const promise = sendInputsToCLI({
      inputs,
      stdin: proc.stdin,
      timeoutBetweenInputs
    });

    proc.on("exit", async (code, sig) => {
      promise.finally(() => {
        debug && console.log("CODE", code, sig);
        resolve({
          code,
          output,
          error
        });
      });
    });
  });

describe("@infragen/util-send-inputs-to-cli", () => {
  beforeAll(() => {
    jest.setTimeout(CLI_TIMEOUT);
  });

  afterAll(() => {
    jest.setTimeout(DEFAULT_TIMEOUT);
  });

  it("should send input to stdin", async () => {
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

    expect(output).toBeCalledWith(
      expect.stringMatching(/What's your full name\?/)
    );

    expect(output).toBeCalledWith(
      expect.stringMatching(/Your name is "Anatoliy Zaslavskiy"/)
    );
  });

  it("tests a CLI with different timeouts for inputs", async () => {
    const { code, error, output } = await testSendInputToCLI({
      bashCommand: `ts-node ./mockCLIs/timeouts.ts`,
      inputs: [
        // Check "Option 1"
        {
          input: SPACE,
          timeoutBeforeInput: 1300
        },

        // Move to "Option 2"
        DOWN,

        // Move to "Option 3"
        DOWN,

        // Check "Option 3"
        SPACE,

        // Next Question
        ENTER,

        // Type answer to "What's your name"
        {
          input: "Anatoliy Zaslavskiy",
          timeoutBeforeInput: 2300
        },

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

    expect(output).toBeCalledWith(
      expect.stringMatching(/What's your full name\?/)
    );

    expect(output).toBeCalledWith(
      expect.stringMatching(/Your name is "Anatoliy Zaslavskiy"/)
    );
  });

  it("tests a CLI with a different default timeoutBetweenInputs", async () => {
    const { code, error, output } = await testSendInputToCLI({
      bashCommand: `ts-node ./mockCLIs/timeouts.ts`,
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
      ],
      timeoutBetweenInputs: 2300
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
  });

  // @todo figure out why this isn't working later
  // it.only("should reject the promise if the write stream is closed", async () => {
  //   try {
  //     await testSendInputToCLI({
  //       bashCommand: `ts-node ./mockCLIs/errorEarly.ts`,
  //       inputs: [
  //         // Check "Option 1"
  //         SPACE,

  //         // Move to "Option 2"
  //         DOWN,

  //         // Move to "Option 3"
  //         DOWN,

  //         // Check "Option 3"
  //         SPACE,

  //         // Next Question
  //         ENTER,

  //         // Type answer to "What's your name" (script error beforehand)
  //         "Anatoliy Zaslavskiy",

  //         // Submit answer to question
  //         ENTER
  //       ],
  //       debug: true
  //     });
  //   } catch (e) {
  //     expect(e.error).not.toBeCalledWith(
  //       expect.stringContaining(
  //         "Cannot call write after a stream was destroyedError"
  //       )
  //     );

  //     expect(e.error).toBeCalledWith(
  //       expect.stringContaining(
  //         'Unable to send input "Anatoliy Zaslavskiy" to the cli. Please check to make sure your script didn\'t exit early.'
  //       )
  //     );
  //   }
  // });
});
