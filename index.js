const inquirer = require("inquirer");
const { async } = require("rxjs");
const fs = require("fs").promises;

const ui = new inquirer.ui.BottomBar();

const operations = {
    "Delete a file": deleteFile,
    "Create a file": createFile,
    "Write to a text file": writeToTextFile,
    "Create new dir": createDir,
    "Delete a dir": deleteDir,
    "Create a file inside a dir": 6,
    "Delete a file from a dir": 7,
    "Get into a dir": 8,
    "Union two files": 9,
    Exit: 99999,
};
Object.freeze(operations);

function main() {
    ui.log.write("Welcome to our cli!");

    inquirer
        .prompt([
            {
                type: "list",
                name: "operation",
                message: "Choose the desired operation:",
                choices: Object.keys(operations),
            },
        ])
        .then((answers) => {
            operations[answers.operation]();
        })
        .catch(console.error);
}

async function deleteFile() {
    const filesInDir = await fs.readdir("./");
    inquirer
        .prompt([
            {
                type: "list",
                name: "fileName",
                message: "Choose the file to delete:",
                choices: filesInDir,
            },
        ])
        .then(async (answers) => {
            try {
                await fs.unlink(answers.fileName);
            } catch (err) {
                console.error(err);
            }
        })
        .catch(console.error);
}

async function createFile() {
    const fileName = await getAsyncInput("Enter the file name:");
    try {
        await fs.writeFile(fileName, "");
    } catch (err) {
        console.error(err);
    }
}

async function writeToTextFile() {
    const fileName = await getInputWithValidate(
        "Enter the file name (.txt):",
        (name) => name.length - 4 === ".txt"
    );
    const fileContent = await getAsyncInput("Enter the file content:");
    try {
        await fs.writeFile(fileName, fileContent);
    } catch (err) {
        console.error(err);
    }
}

async function createDir() {
    const dirName = await getInputWithValidate(
        "Enter the dir name:",
        async (name) => !(await fs.exists(name))
    );

    try {
        await fs.mkdir(dirName);
    } catch (err) {
        console.error(err);
    }
}

async function deleteDir() {
    const dirName = await getInputWithValidate(
        "Enter the dir name:",
        async (name) => !(await fs.exists(name))
    );

    try {
        await fs.rmdir(dirName, { recursive: true });
    } catch (err) {
        console.error(err);
    }
}

function getAsyncInput(message) {
    return getInputWithValidate(message, () => true);
}

function getInputWithValidate(message, validate) {
    return new Promise((res, rej) => {
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "in",
                    message,
                    validate,
                },
            ])
            .then((answers) => res(answers.in))
            .catch((err) => rej(err));
    });
}

(async () => {
    main();
})();
