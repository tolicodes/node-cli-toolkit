const program = require('commander');

program
  .option('--input1 <number>', 'first number')
  .option('--input2 <number>', 'second number');

program.parse(process.argv);

console.log(`The sum is ${parseInt(program.input1) + parseInt(program.input2)}`);
