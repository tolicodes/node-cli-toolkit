import { v4 as uuidv4 } from "uuid";
import { writeFileSync } from "fs";

const TMP_DIR = "/tmp/";

const removeExtension = script => script.replace(".ts", "").replace(".js", "");

export default ({
  nodeScriptPath,
  extension,
  mockScriptPath,
  nodeCommand,
  args,

  debugCommand
}) => {
  const tmpFile = `${TMP_DIR}/${uuidv4()}.${extension}`;

  let file;
  let mockScriptIncludes;

  if (Array.isArray(mockScriptPath)) {
    mockScriptIncludes = mockScriptPath.map(removeExtension);
  } else if (typeof mockScriptPath === "string") {
    mockScriptIncludes = [removeExtension(mockScriptPath)];
  } else {
    mockScriptIncludes = [];
  }

  const nodeScriptInclude = removeExtension(nodeScriptPath);

  if (extension === "ts") {
    file = `
      ${mockScriptIncludes
        .map(
          (script, i) =>
            `
            import mock${i} from '${script}';
            mock${i}();
          `
        )
        .join("\n")}
      import '${nodeScriptInclude}';
    `;
  } else {
    file = `
      ${mockScriptIncludes
        .map(
          (script, i) =>
            `
            const mock${i} = require('${script}');
            mock${i}();
          `
        )
        .join("\n")}
      require('${nodeScriptInclude}');
    `;
  }

  debugCommand(`File to execute: ${file}`);

  writeFileSync(tmpFile, file);

  const bashCommand = `${nodeCommand} "${tmpFile}" ${args}`;

  return {
    bashCommand,
    tmpFile
  };
};
