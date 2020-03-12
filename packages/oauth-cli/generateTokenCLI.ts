#!/usr/bin/env node

import oauthCLI from ".";
const yargs = require("yargs");

// in some cases like `apiVersion` we don't want
// it to cast the number as a number
yargs.parserConfiguration({
  "parse-numbers": false
});

const args = yargs.parse();

// deletes the default arguments from yargs
delete args.$0;
delete args._;

(async () => {
  await oauthCLI(args);
})();
