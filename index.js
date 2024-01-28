#!/usr/bin/env node
const readline = require("node:readline/promises");
const { createExpressProject } = require("./framework");

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

    console.log("creating project---")

    await createExpressProject(projectName, dbType);
  } catch (error) {
    console.error(error.message);
  }
}

main();
