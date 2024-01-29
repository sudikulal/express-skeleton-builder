const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

async function createFolders(projectRoot) {
  try {
    const subdirectories = [
      "src/configs",
      "src/controllers",
      "src/models",
      "src/middlewares",
      "src/routes",
      "public",
      "src/services",
      "src/utils",
    ];

    await fs.mkdir(path.join(projectRoot, "src"));

    await Promise.all(
      subdirectories.map((dir) => fs.mkdir(path.join(projectRoot, dir)))
    );
  } catch (error) {
    console.log(error);
  }
}

async function createFiles(projectRoot, dbType) {
  const getFiles = require("./content.js");
  try {
    const files = getFiles(dbType);
    await Promise.all(
      Object.entries(files).map(([file, data]) =>
        fs.writeFile(path.join(projectRoot, file), data, { flag: "wx" })
      )
    );
  } catch (error) {
    console.log(error);
  }
}

async function createExpressProject(projectName, dbType, targetDirectory) {
  const projectRoot = path.join(targetDirectory, projectName);

  await fs.mkdir(projectRoot);

  await execAsync(`cd ${projectRoot} && npm init -y`);

  const packages = ["express", "body-parser", "cors", "jsonwebtoken"];
  dbType == "m" ? packages.push("mongoose") : packages.push("sequelize");

  await Promise.all([
    execAsync(`cd ${projectRoot} && npm install ${packages.join(" ")}`),
    createFolders(projectRoot).then(
      async () => await createFiles(projectRoot, dbType)
    ),
  ]);
}

module.exports = { createExpressProject };
