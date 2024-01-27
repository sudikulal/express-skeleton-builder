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

// app.use(express.static(path.join(__dirname, "./public")));

app.get('/', (req, res) => {
  res.send("hello world");
});

const userRoute = require("./src/routes/user.route.js")

app.use(userRoute)

app.listen(port, () => {
    console.log(\`Server is listening at http://localhost:\${port}\`);
});
`;

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
        MONGODB_URI:env.MONGODB_URI,
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

content["src/models/user.model.js"] = ``;

content["src/services/user.service.js"] = `
async function validateUser(user,password){
//valid in db
return true
}
module.exports = {
  validateUser
}
`;

content["src/utils/db.util.js"] = ``;

module.exports = content;
