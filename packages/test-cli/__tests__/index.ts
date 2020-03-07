import { ensureDir } from "fs-extra";
import { v4 as uuidv4 } from "uuid";

import testCLI, { ITestCLIReturn } from "../";
import { SPACE, DOWN, ENTER } from "@infragen/util-send-inputs-to-cli";

const TMP_DIR = "/tmp/";

const PROJECT_ROOT = `${__dirname}/..`;

// we need to pass the ts configuration because this is now in a different directory
const TS_NODE_BASH_COMMAND = `ts-node --project "${__dirname}/../tsconfig.json" `;

const CLI_TIMEOUT = 180000;
const DEFAULT_TIMEOUT = 5000;

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

describe("@infragen/util-test-cli", () => {
  beforeAll(() => {
    jest.setTimeout(CLI_TIMEOUT);
  });

  afterAll(() => {
    jest.setTimeout(DEFAULT_TIMEOUT);
  });

  it("tests a CLI run as a bash command", async () => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      bashCommand: `ts-node ./mockCLIs/standard.ts`,
      cwd: PROJECT_ROOT,
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
  });

  it("tests a CLI with a different exit code", async () => {
    try {
      await testCLI({
        bashCommand: `ts-node ./mockCLIs/differentExitCode.ts`,
        cwd: PROJECT_ROOT
      });
    } catch (e) {
      expect(e.output).toBeCalledWith(
        expect.stringMatching(/Something bad is about to happen/)
      );

      expect(e.error).toBeCalledWith(
        expect.stringMatching(/Something bad happened/)
      );

      expect(e.code).toBe(1);
    }
  });

  it("tests a CLI that outputs to stderr", async () => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      bashCommand: `ts-node ./mockCLIs/outputsToStdErr.ts`,
      cwd: PROJECT_ROOT
    });

    expect(output).toBeCalledWith(
      expect.stringMatching(/Something good happened/)
    );

    expect(error).toBeCalledWith(
      expect.stringMatching(/Something bad happened/)
    );

    expect(code).toBe(0);
  });

  it("tests a CLI run as a node script", async () => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      nodeScript: `
          const cli = require('${__dirname}/../mockCLIs/needsToBeTriggeredJS.js');

          cli({ outputThis: "something" });
        `,
      inputs: STD_CLI_INPUTS,
      cwd: PROJECT_ROOT
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

    expect(output).toBeCalledWith(
      expect.stringMatching(/Outputting "something"/)
    );
  });

  it("tests a CLI run as node script with a different node command", async () => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      nodeScript: `
          import cli from '${__dirname}/../mockCLIs/needsToBeTriggeredTS';

          cli({ outputThis: 'something' });
        `,
      cwd: PROJECT_ROOT,

      inputs: STD_CLI_INPUTS,
      nodeCommand: TS_NODE_BASH_COMMAND,
      extension: "ts"
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

    expect(output).toBeCalledWith(
      expect.stringMatching(/Outputting "something"/)
    );
  });

  it("tests a CLI with different timeouts for inputs", async () => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      bashCommand: `ts-node ./mockCLIs/timeouts.ts`,
      cwd: PROJECT_ROOT,
      inputs: [
        // Check "Option 1"
        {
          input: SPACE,
          timeoutBeforeInput: 1100
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
          timeoutBeforeInput: 2100
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
    const { code, error, output }: ITestCLIReturn = await testCLI({
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
      cwd: PROJECT_ROOT,
      timeoutBetweenInputs: 2100
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

  it("tests a CLI run in a different cwd", async () => {
    const cwd = `${TMP_DIR}${uuidv4()}`;
    await ensureDir(cwd);

    let error;
    try {
      ({ error } = await testCLI({
        bashCommand: `${TS_NODE_BASH_COMMAND} "${__dirname}/../mockCLIs/cwdTest.ts"`,
        cwd
      }));
    } catch (e) {
      console.error(e.error.mock.calls);
    }

    // expect(code).toEqual(0);
    // expect(error.mock.calls.length).toBe(0);

    // expect(output).toBeCalledWith(expect.stringMatching(cwd));
  });

  // @todo not sure how to test this
  // it.only("outputs debug info when debug flag is passed", async () => {
  //   const stdOutWriteMock = jest.fn();
  //   const stdErrWriteMock = jest.fn();

  //   const stdOutWriteOriginal = process.stdout.write;
  //   const stdErrWriteOriginal = process.stderr.write;

  //   process.stdout.write = stdOutWriteMock;
  //   process.stderr.write = stdErrWriteMock;

  //   await testCLI({
  //     bashCommand: `ts-node ./mockCLIs/minimal.ts`,
  //     debug: true
  //   });

  //   const debug = true;
  //   if (debug) {
  //     console.log(stdOutWriteMock.mock.calls);
  //     console.error(stdErrWriteMock.mock.calls);
  //   }

  //   expect(stdOutWriteMock).toBeCalledWith(
  //     expect.stringMatching(/Something good happened/)
  //   );

  //   expect(stdErrWriteMock).toBeCalledWith(
  //     expect.stringMatching(/Something bad happened/)
  //   );

  //   process.stdout.write = stdOutWriteOriginal;
  //   process.stderr.write = stdErrWriteOriginal;
  // });
});
