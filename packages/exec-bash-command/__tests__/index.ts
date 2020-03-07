import { ensureDir } from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import * as child_process from "child_process";

import execBashCommand, { IExecBashCommandReturn } from "../";
import { SPACE, DOWN, ENTER } from "@infragen/util-send-inputs-to-cli";

const CLI_TIMEOUT = 180000;
const DEFAULT_TIMEOUT = 5000;
const TMP_DIR = "/tmp/";
const PROJECT_ROOT = `${__dirname}/..`;

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

let DEFAULT_EXEC_BASH_COMMAND_OPTS;
let error;
let output;

describe("@infragen/util-exec-bash-command", () => {
  beforeAll(() => {
    jest.setTimeout(CLI_TIMEOUT);
  });

  afterAll(() => {
    jest.setTimeout(DEFAULT_TIMEOUT);
  });

  beforeEach(() => {
    error = jest.fn();
    output = jest.fn();

    DEFAULT_EXEC_BASH_COMMAND_OPTS = {
      errorCB: error,
      outputCB: output,
      cwd: PROJECT_ROOT
    };
  });

  it("runs a bash command", async () => {
    const { code }: IExecBashCommandReturn = await execBashCommand({
      ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
      bashCommand: `echo "hello"`
    });
    expect(error.mock.calls.length).toBe(0);
    expect(code).toBe(0);
    expect(output).toBeCalledWith(expect.stringContaining("hello"));
  });

  it("runs a bash command with inputs", async () => {
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

    expect(output).not.toBeCalledWith(
      expect.stringContaining("Option 2 Chosen")
    );

    expect(output).toBeCalledWith(expect.stringContaining("Option 3 Chosen"));

    expect(output).toBeCalledWith(
      expect.stringContaining("What's your full name?")
    );

    expect(output).toBeCalledWith(
      expect.stringContaining('Your name is "Anatoliy Zaslavskiy')
    );
  });

  it("runs a bash command with different exit code", async () => {
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
  });

  it("runs a bash command that outputs to stderr", async () => {
    const { code }: IExecBashCommandReturn = await execBashCommand({
      ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
      bashCommand: `echo "hello" && >&2 echo "Something bad happened 2"`
    });

    expect(output).toBeCalledWith(expect.stringContaining("hello"));

    expect(error).toBeCalledWith(
      expect.stringContaining("Something bad happened")
    );

    expect(code).toBe(0);
  });

  it("runs a bash command with different timeouts for inputs", async () => {
    const { code }: IExecBashCommandReturn = await execBashCommand({
      ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
      bashCommand: `ts-node ./mockCLIs/timeouts.ts`,
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

  it("runs a bash command with a different default timeoutBetweenInputs", async () => {
    const { code }: IExecBashCommandReturn = await execBashCommand({
      ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
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
      timeoutBetweenInputs: 3000
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

  it("runs a bash command in a different cwd", async () => {
    const cwd = `${TMP_DIR}${uuidv4()}`;
    await ensureDir(cwd);

    const { code }: IExecBashCommandReturn = await execBashCommand({
      ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
      bashCommand: `pwd`,
      cwd
    });

    expect(code).toEqual(0);

    expect(output).toBeCalledWith(expect.stringContaining(cwd));
  });
});
