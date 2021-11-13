const { assert } = require('chai');

const { findUserByEmail } = require('./helpers/userHelper');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return a false with an invalid email', function() {
    const user = findUserByEmail("nouser@example.com", testUsers);
    const expectedUserID = false;
    assert.equal(user, expectedUserID);
  });
});