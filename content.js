const content = {};

content["index.js"] = `
const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const path  = require("path")


const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "./public")));

app.get('/', (req, res) => {
  res.send("hello world");
});

const userRoute = require("./src/routes/user.route.js")

app.use(userRoute)

app.listen(port, () => {
    console.log(\`Server is listening at http://localhost:\${port}\`);
});
`;

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
async function login(req, res) {
  try {
    const { user,password } = req.body;
    
    if(!user || !password) return res.status(401).json({msg:"user/password connot be empty"})

    const isUserExist = userService.validateUser(user,password)

    return res.status(200).json({msg:"success"})
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
}

module.exports = { login };

`;

content["src/routes/user.route.js"] = `
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const authMiddleware  = require("../middlewares/auth.middleware.js")

router.use("/user")

router.post("/login",userController.login);

router.use(authMiddleware)

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
async function validateUser(user,password){
//valid in db
return true
}
module.exports = {
  validateUser
}
`;

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
  const connectDB = require("../utils/db.util.js");
  const connection = connectDB();

  const userSchema = new connection.Schema({
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

  const User = connection.model("user", userSchema);
  module.exports = User
    `;
  }

  return content;
}

module.exports = getFiles;
