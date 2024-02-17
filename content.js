const content = {};

content["index.js"] = `
const app = require("./app");

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(\`Server is listening at http://localhost:\${port}\`);
});
`;

content["app.js"] = `
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "./public")));

app.get("/", (req, res) => {
  res.send("hello world");
});

const userRoute = require("./src/routes/user.route.js");

app.use("/user", userRoute);

module.exports = app;
`

content[".gitignore"] =  `
node_modules
.env
`

content[".env"] = `

`

content["src/configs/config.js"] = `
require('dotenv').config()
const env = process.env
const config = {}

config.DB={
    SQL:{
        NAME:env.DB_NAME,
        USER:env.USER,
        PASSWORD:env.PASSWORD,
        HOST:env.HOST,
        PORT:env.PORT,
        DIALECT:env.DIALECT,
    }, 
    MONGODB:{
        URI:env.MONGODB_URI,
    }
}

config.JWT = {
    SECRET_KEY:env.SECRET_KEY
}

config.PORT = env.PORT
`;

content["src/controllers/user.controller.js"] = `
const userService = require("../services/user.service.js")
async function listUser(req, res) {
  try {
    const response =await userService.findAll();
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
}

module.exports = { listUser };

`;

content["src/routes/user.route.js"] = `
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");

router.get("/list",userController.listUser)

module.exports = router;
`;

content["public/index.html"] = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div>
        <h1>hello world</h1>
    </div>
</body>
</html>
  `;

content["src/services/user.service.js"] = `
const User = require("../models/user.model.js");

async function findAll() {
  try {
    const users = await User.find();
    return { status: 200, data: { message: "success", user_list: users } };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  findAll
}
`;

content["tests/index.test.js"] = `
const listTestCase = require("./testcases/listUser");

beforeAll(async () => {
  //add setup before tests if needed
});

afterAll(async () => {
//add cleanup after tests if needed
});

describe("running test", () => {
  it("should list user", () => listTestCase.shouldList());
});
`
content["tests/testcases/listUser"] = `
const request = require("supertest");
const app = require("../../app.js");

exports.shouldList = async () => {
  try {
    const response = await request(app).get("/user/list");
    expect(response.statusCode).toEqual(200);
    expect(response.body.message).toEqual("success");
    expect(response.body.hasOwnProperty("user_list")).toEqual(true);
    expect(Array.isArray(response.body.user_list)).toEqual(true);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
`

function getFiles(dbType) {
  if (dbType == "s") {
    content["src/utils/db.util.js"] = `
    const { Sequelize } = require("sequelize");
    const {DB:{SQL}} = require("../configs/config.js");

    const sequelize = new Sequelize(SQL.NAME, SQL.USER, SQL.PASSWORD, {
      host: SQL.HOST,
      port: SQL.PORT,
      dialect: SQL.DIALECT,
    });

    module.exports = sequelize
    `;

    content["src/models/user.model.js"] = `
    const { DataTypes } = require("sequelize");
    const sequelize = require("../utils/db.util.js");

    const  userModel = sequelize.define("User", {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_name: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    });

    module.exports = userModel;
    `;
  } else {
    content["src/utils/db.util.js"] = `
const mongoose = require("mongoose");
const {DB:{MONGODB}} = require('../configs/config.js')

let cachedConnection;

const connectDB = () => {
  try {
    if (cachedConnection) return cachedConnection;

    mongoose.connect(MONGODB.URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    cachedConnection = mongoose.connection;
    return cachedConnection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
    `;

    content["src/models/user.model.js"] = `
  const mongoose = require("mongoose");
  const connectDB = require("../utils/db.util.js");
  connectDB();

  const userSchema = new mongoose.Schema({
    user_name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: number,
      required: true,
    },
  });

  const User = mongoose.model("user", userSchema);
  module.exports = User
    `;
  }

  return content;
}

module.exports = getFiles;
