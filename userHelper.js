const bcrypt = require('bcryptjs');
//check to see if email exists
const finduserbyEmail = (database, email) => {
  for (let userid in database) {
    if (database[userid].email === email) {
      return database[userid];
    }
  }
  return false;
};

const urlsForUser = function(id, database) {
  const userURLs = {};

  if (!id) { // if user not logged in
    return null;
  }

  for (let el in database) { //finding the user associate with url in database
    if (database[el].userID === id) {
      userURLs[el] = database[el];
    }
  }

  return userURLs;
};

const verifyHash = (userid, password, database) => {
  return bcrypt.compareSync(password, database[userid].password);
};

const getEmailFromId = (userid, database) => {
  return (database[userid]) ? database[userid].email : null;
};

module.exports = {
  finduserbyEmail,
  urlsForUser,
  getEmailFromId,
  verifyHash
};