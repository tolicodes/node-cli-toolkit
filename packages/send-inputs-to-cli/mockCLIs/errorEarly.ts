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

(async () => {
  const { optionChoice } = await prompt([
    {
      message: "Which option do you want to choose?",
      name: "optionChoice",
      type: "checkbox",
      choices: CHOICES
    }
  ]);

  optionChoice.forEach(choice => {
    const choiceName = CHOICES.find(({ value }) => value === choice).name;
    console.log(`${choiceName} Chosen`);
  });

  throw new Error("Erroring now");
})();
