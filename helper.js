const findUserByEmail = function(email, users) {
  let ids = Object.keys(users);
  for (let id of ids) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};


module.exports = { findUserByEmail };