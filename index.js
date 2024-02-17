#!/usr/bin/env node
const readline = require("node:readline/promises");
const { createExpressProject } = require("./framework");

function showLoadingAnimation() {
  const frames = ["-", "\\", "|", "/"];
  let index = 0;
  const loadingInterval = setInterval(() => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Installing ----------${frames[index]}`);

    index = (index + 1) % frames.length;
  }, 100);

  return loadingInterval;
}

async function main() {
  try {
    const readInstance = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const projectName = await readInstance.question("Enter the project name: ");

    if (!projectName) {
      readInstance.close();
      throw new Error("Project name is required");
    }

    let dbType;
    while (true) {
      dbType = await readInstance.question(
        "Enter the db type (m: MongoDB, s: MySQL): "
      );

      if (["m", "s"].includes(dbType)) {
        break;
      }

      console.error("Invalid dbType. Please enter 'm' or 's'.");
    }

    readInstance.close();

    const loadingInterval = showLoadingAnimation();

    const targetDirectory = process.cwd();

    await createExpressProject(projectName, dbType,targetDirectory);

    clearInterval(loadingInterval);
    process.stdout.clearLine();
    process.stdout.cursorTo(0); 
    console.log("Package installed successfully!");
  } catch (error) {
    console.error(error.message);
  }
}

main();
