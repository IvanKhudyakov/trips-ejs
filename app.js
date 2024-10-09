const express = require("express");
require("express-async-errors");
const cookieParser = require("cookie-parser");
const app = express();
const tripRouter = require('./routes/trips');
app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));

require("dotenv").config();
const session = require("express-session");
const flash = require("connect-flash");
const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};
//csrf middleware
const csrf = require('host-csrf')

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));
let csrf_development_mode = true;
if (app.get("env") === "production") {
  csrf_development_mode = false;
  app.set("trust proxy", 1);
}
const csrf_options = {
  protected_operations: ["PATCH"],
  protected_content_types: ["application/json"],
  development_mode: csrf_development_mode,
};
const csrf_middleware = csrf(csrf_options);

app.use(session(sessionParms));
app.use(flash());


const passport = require("passport");
const passportInit = require("./passport/passportInit");

passportInit();
app.use(passport.initialize());
app.use(passport.session());
app.use(require("./middleware/storeLocals"));

//middleware for tests
app.use((req, res, next) => {
  if (req.path == "/multiply") {
    res.set("Content-Type", "application/json");
  } else {
    res.set("Content-Type", "text/html");
  }
  next();
});


//routes
app.use("/", csrf_middleware, tripRouter);
app.use("/sessions", csrf_middleware, require("./routes/sessionRoutes"));
//multiply api
app.get("/multiply", (req, res) => {
  const result = req.query.first * req.query.second;
  if (result.isNaN) {
    result = "NaN";
  } else if (result == null) {
    result = "null";
  }
  res.json({ result: result });
});

app.use(csrf_middleware, (req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use(csrf_middleware, (err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

const port = process.env.PORT || 3000;
let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV == "test") {
  mongoURL = process.env.MONGO_URI_TEST;
}

const start = () => {
  try {
    require("./db/connect")(mongoURL);
    return app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

module.exports = { app };
