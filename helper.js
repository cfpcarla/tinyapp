const findUserByEmail = function(email, users) {
  let ids = Object.keys(users);
  for (let id of ids) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};

const urlsForUser = function(id, urlDatabase) {
  let ids = Object.keys(urlDatabase);
  let userURLs = {};
  for (let shortURL of ids) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

const generateRandomString = function() {
  return Math.random().toString(36).substring(6);
};

module.exports = { findUserByEmail, urlsForUser, generateRandomString };
