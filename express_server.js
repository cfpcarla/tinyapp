const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const helper = require("./helper");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['pipoca'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const users = {
  "myuser": {
    id: "myuser",
    email: "cfpcarla@gmail.com",
    password: bcrypt.hashSync("123", 10)
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID:"aJ48lW"},
  i3BoGr: { longURL: "https://www.google.ca", userID:"aJ48lW"}
};

app.get("/", (request, response) => {
  const user = users[request.session.user_id];
  if (user) {
    response.redirect('/urls');
  } else {
    response.redirect('/login');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (request, response) => {
  response.json(helper.urlsForUser(request.session.user_id, urlDatabase));
});

app.get("/urls", (request, response) => {
  const user = users[request.session.user_id];
  if (user) {
    const templateVars = {
      urls: helper.urlsForUser(request.session.user_id, urlDatabase),
      user: users[request.session.user_id]
    };
    response.render("urls_index", templateVars);
  } else {
    response.statusCode = 403;
    response.end("403 Forbidden. Please Login");
  }
});

app.get("/urls/new", (request, response) => {
  const user = users[request.session.user_id];
  if (!user) {
    response.redirect('/login');
  } else {
    const templateVars = {
      urls: helper.urlsForUser(user.id, urlDatabase),
      user: user
    };
    response.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (request, response) => {
  const user = users[request.session.user_id];
  const shortURL = request.params.shortURL;
  const URL = urlDatabase[shortURL];
  if (!user) {
    response.statusCode = 403;
    response.end("403 Forbidden. Please Login");
  } else if (!URL) {
    response.statusCode = 404;
    response.end("404 Not found.");
  } else if (URL.userID !== user.id) {
    response.statusCode = 403;
    response.end("403 Forbidden. URL belongs to another user");
  } else {
    const longURL = URL.longURL;
    const templateVars = {
      shortURL: shortURL,
      longURL: longURL,
      user: user
    };

    response.render("urls_show", templateVars);
  }
});

//create new URL
app.post("/urls", (request, response) => {
  const user = users[request.session.user_id];
  if (!user) {
    response.statusCode = 403;
    response.end("403 Forbidden. Please Login");
  } else {
    const shortURL = helper.generateRandomString();
    const longURL = request.body.longURL;
    const userID = request.session.user_id;
    urlDatabase[shortURL] = { longURL: longURL, userID: userID };
    response.redirect(`/urls/${shortURL}`);
  }
});

app.get("/u/:shortURL", (request, response) => {
  const shortURL = request.params.shortURL;
  const URL = urlDatabase[shortURL];
  if (URL) {
    const longURL = URL.longURL;
    response.redirect(longURL);
  } else {
    response.statusCode = 404;
    response.end("404 Not found.");
  }
});

//Delete
app.post('/urls/:shortURL/delete', (request, response) => {
  const shortURL = request.params.shortURL;
  const URL = urlDatabase[shortURL];
  const user = users[request.session.user_id];
  if (!user) {
    response.statusCode = 403;
    response.end("403 Forbidden. Please Login");
  } else if (URL.userID !== user.id) {
    response.statusCode = 403;
    response.end("403 Forbidden. URL belongs to another user");
  } else {
    delete urlDatabase[shortURL];
    response.redirect('/urls');
  }
});

//Edit
app.post('/urls/:shortURL/edit', (request, response) => {
  const shortURL = request.params.shortURL;
  const URL = urlDatabase[shortURL];
  const user = users[request.session.user_id];
  if (!user) {
    response.statusCode = 403;
    response.end("403 Forbidden. Please Login");
  } else if (URL.userID !== user.id) {
    response.statusCode = 403;
    response.end("403 Forbidden. URL belongs to another user");
  } else {
    const longURL = request.body.longURL;
    urlDatabase[shortURL] = { longURL: longURL, userID: user.id };
    response.redirect('/urls');
  }
});

// request is what the user sent to the server (when clicking the login button, for example)
// response is what the server will send back to the user: send the user to another page, for example
app.post('/login', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  const foundUser = helper.findUserByEmail(email, users);

  if (!foundUser) {
    response.statusCode = 403;
    response.end("403 Forbidden. E-mail cannot be found");
  } else if (!bcrypt.compareSync(password, foundUser.password)) {
    response.statusCode = 403;
    response.end("403 Forbidden. Wrong password");
  } else {
    // eslint-disable-next-line camelcase
    request.session.user_id = foundUser.id;
    response.redirect('/urls');
  }
});

app.post('/logout', (request, response) => {
  // eslint-disable-next-line camelcase
  request.session.user_id = null;
  response.redirect('/login');
});

app.get('/register', (request, response) => {
  const user = users[request.session.user_id];
  if (user) {
    response.redirect('/urls');
  } else {
    const templateVars = { user: null };
    response.render("registration", templateVars);
  }
});

app.post('/register', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if  (email === "" || password === "") {
    response.statusCode = 400;
    response.end("400 Bad request. Missing email or password");
  } else if (helper.findUserByEmail(email, users)) {
    response.statusCode = 400;
    response.end("400 Bad request. Email already registered");
  } else {
    const id = helper.generateRandomString();
    const newUser = {
      id: id,
      email: email,
      password: hashedPassword
    };
    users[id] = newUser;
    // eslint-disable-next-line camelcase
    request.session.user_id = id;
    response.redirect('/urls');
  }
});

app.get('/login', (request, response) => {
  const user = users[request.session.user_id];
  if (user) {
    response.redirect('/urls');
  } else {
    const templateVars = { user: null };
    response.render("login", templateVars);
  }
});

