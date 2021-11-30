const express = require("express");
const bodyParser = require("body-parser");
const port = 3000;
const exphbs = require("express-handlebars");
const jsforce = require("jsforce");

require("dotenv").config();

const app = express();
app.use(express.static("public"));

const jsonParser = bodyParser.json();
const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(cookieParser());
app.use(
  session({ secret: "very secret", resave: true, saveUninitialized: true })
);

app.set("views", `${__dirname}/views`);
app.engine(
  "hbs",
  exphbs({
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", "hbs");

app.get("/login", jsonParser, async (req, res) => {
  const conn = new jsforce.OAuth2({
    clientId: process.env.CONSUMER_KEY,
    clientSecret: process.env.CONSUMER_SECRET,
    redirectUri: `${req.protocol}://${req.get("host")}/callback`,
  });
  res.redirect(conn.getAuthorizationUrl({}));
});

app.get("/callback", function (req, res) {
  const code = req.query.code;
  const conn = new jsforce.Connection({
    oauth2: {
      clientId: process.env.CONSUMER_KEY,
      clientSecret: process.env.CONSUMER_SECRET,
      redirectUri: `${req.protocol}://${req.get("host")}/callback`,
    },
  });
  conn.authorize(code, function (err, userInfo) {
    if (err) {
      return console.error(err);
    }

    req.session.token = conn.accessToken;

    res.redirect("/");
  });
});

app.get("/", function (req, res) {
  if (req.session.token) {
    res.render("index", {
      instance_url: process.env.INSTANCE_URL,
      consumer_key: process.env.CONSUMER_KEY,
      token: req.session.token,
    });
  } else {
    res.redirect("/login");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
