import inquirer from "inquirer";

const start = () => {
    global.prompt = inquirer.createPromptModule();
    global.promptPromise = global.prompt([
        {
            type:"list",
            name:"question1",
            choices:["Choice 1", "Choice 2"],
            message:"Question 1: "
        }
    ]);
    global.promptPromise.ui.process.subscribe((answers, ...rest) => {
        //console.log(`onEachAnswer: ${JSON.stringify({answers, rest})}`);
        global.promptPromise.next({
            type:"input",
            name:"question2",
            message:"Question 2: "
        });
      },
      (errors) => {
        console.log(`onError: ${JSON.stringify(errors)}`);
      },
      (complete) => { console.log(`onComplete: ${JSON.stringify(complete)}`)});
};

start();