import { prompt } from "inquirer";

const CHOICES = [
  {
    name: "Option 1",
    value: "option1"
  },
  {
    name: "Option 2",
    value: "option2"
  },
  {
    name: "Option 3",
    value: "option3"
  }
];

const timeoutPromise = timeout =>
  new Promise(resolve => {
    setTimeout(resolve, timeout);
  });

(async () => {
  await timeoutPromise(1000);

  const { optionChoice } = await prompt([
    {
      message: "Which option do you want to choose?",
      name: "optionChoice",
      type: "checkbox",
      choices: CHOICES
    }
  ]);

  await timeoutPromise(2000);

  const { fullName } = await prompt({
    message: "What's your full name?",
    name: "fullName",
    type: "input"
  });

  await timeoutPromise(1000);

  optionChoice.forEach(choice => {
    const choiceName = CHOICES.find(({ value }) => value === choice).name;
    console.log(`${choiceName} Chosen`);
  });

  console.log(`Your name is "${fullName}"`);
})();
