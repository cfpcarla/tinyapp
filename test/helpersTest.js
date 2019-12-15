const { assert } = require('chai');

const { findUserByEmail, urlsForUser } = require('../helper.js');

const testUsers = {
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

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });

  it('should return null with invalid email', function() {
    const user = findUserByEmail("invalid@example.com", testUsers);
    const expectedOutput = null;
    assert.equal(user, expectedOutput);
  });
});

describe('urlsForUser', () => {
  const urlDatabaseTest = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID:"userRandomID"},
    i3BoGr: { longURL: "https://www.google.ca", userID:"userRandomID"}
  };

  it('returns urls for a valid user', () => {
    const urls = urlsForUser('userRandomID', urlDatabaseTest);
    const expectedOutput = urlDatabaseTest;

    assert.deepEqual(urls, expectedOutput);
  });

  it('returns an empty object when user has no urls', () => {
    const urls = urlsForUser('user2RandomID', urlDatabaseTest);
    const expectedOutput = {};

    assert.deepEqual(urls, expectedOutput);
  });

  it('returns an empty object when user does not exist', () => {
    const urls = urlsForUser('nonExistingUser', urlDatabaseTest);
    const expectedOutput = {};

    assert.deepEqual(urls, expectedOutput);
  });
});
