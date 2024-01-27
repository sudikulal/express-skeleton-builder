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

async function createFiles(projectRoot) {
  const files = require("./content.js");
  try {
    await Promise.all(
      Object.entries(files).map(([file, data]) =>
        fs.writeFile(path.join(projectRoot, file), data, { flag: "wx" })
      )
    );
  } catch (error) {
    console.log(error);
  }
}
async function createExpressProject(projectName = "expressproject") {
  const projectRoot = path.join(__dirname, projectName);

  await fs.mkdir(projectRoot);

  process.chdir(projectRoot);

  await execAsync("npm init -y");

  await Promise.all([
    execAsync("npm install express body-parser cors jsonwebtoken"),
    createFolders(projectRoot).then(async () => await createFiles(projectRoot)),
  ]);
}

createExpressProject(process.argv[3]).catch((err) => console.error(err));
