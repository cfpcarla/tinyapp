const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (request, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (request, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (request, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (request, res) => {
  // res.send(`a = ${a}`);
});

app.get("/urls", (request, res) => {
  let templateVars = { urls: urlDatabase, user:users[request.cookies["user_id"]]};

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (request, res) => {
  let templateVars = { urls: urlDatabase, user:users[request.cookies["user_id"]]};

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (request, res) => {
  let templateVars = { shortURL: request.params.shortURL, longURL: request.params.longURL, user:users[request.cookies["user_id"]]};  res.render("urls_show", templateVars);
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const generateRandomString = function() {
  return Math.random().toString(36).substring(6);
};

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  res.send("Ok");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

// request is what the user sent to the server (when clicking the login button, for example)
// response is what the server will send back to the user: send the user to another page, for example
app.post('/login', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  const foundUser = findUserByEmail(email);
  if  (!foundUser) {
    response.statusCode = 403;
    response.end("403 Forbidden. E-mail cannot be found");
  }
  if (foundUser.password !== password) {
    response.statusCode = 403;
    response.end("403 Forbidden. Wrong password");
  }

  response.cookie('user_id', foundUser.id);
  response.redirect('/urls');
});

app.post('/logout', (request, response) => {
  response.clearCookie('user_id');
  response.redirect('/urls');
});

app.get('/register', (request, response) => {
  let templateVars = { urls: urlDatabase, user: users[request.cookies["user_id"]]};
  response.render("registration", templateVars);
});

const findUserByEmail = function(email) {
  let ids = Object.keys(users);
  for (let id of ids) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};

app.post('/register', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  //check empty values
  if  (email === "" || password === "") {
    response.statusCode = 400;
    response.end("400 Bad request. Missing email or password");
  }

  //check for existing email
  if (findUserByEmail(email)) {
    response.statusCode = 400;
    response.end("400 Bad request. Email already registered");
  }
  const id = generateRandomString();
  const newUser = {
    id: id,
    email: email,
    password: password
  };
  users[id] = newUser;
  response.cookie('user_id', id);
  console.log(users);
  response.redirect('/urls');

});

app.get('/login', (request, response) => {
  let templateVars = { urls: urlDatabase, user:users[request.cookies["user_id"]]};
  response.render("login", templateVars);
});
