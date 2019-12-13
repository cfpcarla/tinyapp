const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['pipoca'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const users = {
  "abcde": {
    id: "abcde",
    email: "cfpcarla@gmail.com",
    password: "123qwe"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID:"aJ48lW"},
  i3BoGr: { longURL: "https://www.google.ca", userID:"aJ48lW"}
};

const urlsForUser = function(id) {
  let ids = Object.keys(urlDatabase);
  let userURLs = {};
  for (let shortURL of ids) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (request, res) => {
  res.json(urlsForUser);
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
  let templateVars = { urls: urlsForUser(request.session.user_id), user: users[request.session.user_id] };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (request, res) => {
  const user = request.session.user_id;
  if (!user) {
    res.redirect('/login');
  } else {
    let templateVars = { urls: urlsForUser(request.session.user_id), user: users[request.session.user_id] };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (request, res) => {
  let templateVars = { shortURL: request.params.shortURL, longURL: request.params.longURL, user: users[request.session.user_id] };
  res.render("urls_show", templateVars);
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const generateRandomString = function() {
  return Math.random().toString(36).substring(6);
};

//create new URL
app.post("/urls", (request, res) => {
  console.log(request.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  const longURL = request.body.longURL;
  const userID = request.session.user_id;
  urlDatabase[shortURL] = { longURL: longURL, userID: userID };
  console.log(urlDatabase);
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//Delete
app.post('/urls/:shortURL/delete', (request, res) => {
  const shortURL = request.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

//Edit
app.post('/urls/:shortURL/edit', (request, res) => {
  const shortURL = request.params.shortURL;
  const longURL = request.body.longURL;
  const userID = request.session.user_id;
  urlDatabase[shortURL] = { longURL: longURL, userID: userID };
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
  if (bcrypt.compareSync(password,foundUser.password)) {
    response.statusCode = 403;
    response.end("403 Forbidden. Wrong password");
  }

  request.session.user_id = foundUser.id;
  response.redirect('/urls');
});

app.post('/logout', (request, response) => {
  console.log(request.session);
  request.session.user_id = null;
  console.log("post cleaning ", request.session)
  response.redirect('/urls');
});

app.get('/register', (request, response) => {
  console.log("IN THE GET")
  console.log(request.session)
  let templateVars = { urls: urlsForUser(request.session.user_id), user: users[request.session.user_id] };
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
  const hashedPassword = bcrypt.hashSync(password, 10);
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
    password: hashedPassword
  };
  users[id] = newUser;
  request.session.user_id = id;
  response.redirect('/urls');
});

app.get('/login', (request, response) => {
  let templateVars = { urls: urlsForUser(request.session.user_id), user: users[request.session.user_id]};
  response.render("login", templateVars);
});
