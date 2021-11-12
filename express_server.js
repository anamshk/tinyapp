const express = require("express");
const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
//const { finduserbyEmail } = require("/helpers/userHelpers");

const app = express();
const PORT = 8080; // default port 8080

//Buffer - comes before all routes
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");


const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

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
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",

  },
  i3BoGr: {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

//Generate a random string when creating a new short URL
app.post("/urls", (req, res) => {
  if (!req.cookies.userId) {
    res.redirect("/403error");
  }
  const id = generateRandomString(); // Log the POST request body to the console
  urlDatabase[id] = `http://${req.body.longURL}`;
  res.redirect(`/urls/${id}`);
});

//urls
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

const urlsForUser = function(id, database) {
  const userURLs = {};

  if (!id) { // if user isn't logged in, null.
    return null;
  }

  for (const item in database) { // loops through URL database to find all the urls belonging to logged in user.
    if (database[item].userID === id) {
      userURLs[item] = database[item];
    }
  }

  return userURLs;
};

const getEmailFromId = (userid, database) => {
  return (database[userid]) ? database[userid].email : null;
};


app.get("/urls", (req, res) => {
  const userURLs = urlsForUser(user_id, urlDatabase);
  const templateVars = {
    userID: user_id,
    email: getEmailFromId(user_id, users),
    urls: userURLs
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.userId) {
    res.redirect("/login");
  }
  const templateVars = {
    userId: req.session.id,
    email: getEmailFromId(req.session.id, users),
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  const userid = req.session.id;

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.userId]
    email: getEmailFromId(userid, users), 
  };
  if (!templateVars.longURL) {
    res.redirect('/error');
  }
  res.render("urls_shows", templateVars);
});

app.get("/register", (req, res)=> {
  const templateVars = {
    user: users[req.cookies.userId],
    email: req.cookies["email"],
    password: req.cookies["password"]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res)=> {
  const templateVars = {
    user: users[req.cookies.userId],
    email: req.cookies["email"],
    password: req.cookies["password"]
  };
  
  if (!templateVars) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
});


//GET method routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls/:shortURL", (req, res) => {
  const updateShortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userid = req.session.id;
  if (urlDatabase[updateShortURL].userID !== userid) { // prevents changing of URLs by users that don't own them.
    res.redirect('/not_authorized');
    return;
  }
  urlDatabase[shorturlToUpdate].longURL = longURL;
  res.redirect(`/urls/`);
});


//POST to delete and redirect to urls page
app.post("/urls/:shortURL/delete", (req, res) => {
const urlToDelete = urlDatabase[req.params.shortURL];
  const userid = req.session.id;
  if (urlDatabase[urlToDelete].userID !== userid) { // prevents deletion of URLs by users that don't own them.
    res.redirect('/not_authorized');
  }
  delete urlToDelete
  res.redirect("/urls");
});

//POST to redirect to the appropriate urls page
app.post("/urls/:id", (req,res) =>{
  const shortURL = req.params.shortURL;
  const updatedLongURL = req.body.longURL;
  urlDatabase[shortURL] = updatedLongURL;
  res.redirect("/urls/");
});

const finduserbyEmail = (database, email) => {
  for (let userid in database) {
    if (database[userid].email === email) {
      return database[userid];
    }
  }
  return false;
};

//POST to login, redirect to /urls page and display username successfully logged in
app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = finduserbyEmail(users, email);

  if (!user) {
    res.redirect("/403error");
  }

  if (user.password !== password) {
    res.redirect("/403error");
  }

  
  // let userID = 0;
  // for (let key in users) {
  //   if (users[key].email === email) {
  //     userID = users[key].id;
  //   }
  // }

  res.cookie("userId", user.id);
  res.redirect("/urls");
});

//POST when user logs out
app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/urls");
});



//Post the user email and password to the user object along with redirect to /urls
app.post("/register", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = finduserbyEmail(users, email);
  if (user) {
    res.status(400).send("User already exists");
  } else if (email === "" || password === "") {
    res.status(400).send("email or password left blank");
  }
  const userId = generateRandomString(); // generating a random userID
  users[userId] = {id: userId, email, password}; // adding a user to users object
  res.cookie("userId", userId);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

