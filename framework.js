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
      "src/services",
      "src/utils",
      "tests/testcases",
    ];

    await Promise.all([
      fs.mkdir(path.join(projectRoot, "src")),
      fs.mkdir(path.join(projectRoot, "public")),
      fs.mkdir(path.join(projectRoot, "tests")),
    ]);

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

async function modifyPackageJson(projectRoot){
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonContent);

  packageJson.scripts = {
    "test": "jest",
    "dev": "nodemon index.js"
  };

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

async function createExpressProject(projectName, dbType, targetDirectory) {
  const projectRoot = path.join(targetDirectory, projectName);

  await fs.mkdir(projectRoot);

  await execAsync(`cd ${projectRoot} && npm init -y`);
  await modifyPackageJson(projectRoot)

  const packages = ["express", "body-parser", "cors", "jsonwebtoken"];
  const devDependencies = ["jest","nodemon"]
  dbType == "m" ? packages.push("mongoose") : packages.push("sequelize");

  await Promise.all([
    execAsync(`cd ${projectRoot} && npm install ${packages.join(" ")} && npm install -D ${devDependencies.join(" ")}`),
    createFolders(projectRoot).then(
      async () => await createFiles(projectRoot, dbType)
    ),
  ]);
}

module.exports = { createExpressProject };
