const findUserByEmail = function(email, users) {
  let ids = Object.keys(users);
  for (let id of ids) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};




// Export this function from the helpers.js file using module.exports
// require the helpers.js module inside express_server.js
// Change all calls of your getUserByEmail function to call the function from your helpers.js module
// Test your app again to make sure everything still works as before

module.exports = { findUserByEmail };