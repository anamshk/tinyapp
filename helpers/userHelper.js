const userHelperGenerator = (users) => {
  const getUserInformation = (email) => {
    const currentUser = users[email];

    if (!currentUser) {
      return {};
    }

    return currentUser;
  };

  const fancyGetUserInformation = (email) => users[email] || {};

  const authenticateUser = (email, password) => {
    const currentUser = users[email];
    // Check if email and username are good

    if (!currentUser) {
    // If email doesn't exist, eject
      return { error: "404", data: null };
    }

    if (currentUser.password !== password) {
      // If password doesn't match, eject
      return { error: "404", data: null };
    }
    // Send back the user info in the shape of a JSON response
    return { data: currentUser, error: null };
  };

  return {
    getUserInformation,
    fancyGetUserInformation,
    authenticateUser,
  };
};

module.exports = userHelperGenerator;