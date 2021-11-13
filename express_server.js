const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const { finduserbyEmail, urlsForUser, getEmailFromId, verifyHash } = require('./helpers/userHelper');

const app = express();
const PORT = 8080; // default port 8080

//Buffer - comes before all routes
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

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
    password: "$2a$10$ddFecxpaG/GsH15YdWkqjOEzb1Eebl6Xx6RxO9LjNgqR0jdNsstSK"
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

//GET method routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  if (!req.session.id) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//GET method one the user is at the site
//Register if the user is new

app.get("/register", (req, res)=> {
  const templateVars = {
    user: users[req.session.id],
    email: getEmailFromId(req.session.id, users),
    password: req.session["password"]
  };
  
  res.render("register", templateVars);
});

//Login for exisiting users
app.get("/login", (req, res)=> {
  const templateVars = {
    user: users[req.session.id],
    email: getEmailFromId(req.session.id, users),
    password: req.session["password"]
  };
  
  // if (req.session.id) {
  //   res.redirect("/urls");
  // }
  res.render("login", templateVars);
});

//User can see there list of long urls to short urls

app.get("/urls", (req, res) => {
  const userID = req.session.id;
  const userURLs = urlsForUser(userID, urlDatabase);
  const templateVars = {
    userId: userID,
    user: users[req.session.id],
    email: getEmailFromId(userID, users),
    urls: userURLs
  };
  res.render("urls_index", templateVars);
});

//User can create new short urls

app.get("/urls/new", (req, res) => {
  const templateVars = {
    userID: req.session.id,
    user: users[req.session.id],
    email: getEmailFromId(req.session.id, users),
  };

  if (req.session.id) {
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});


app.get("/urls/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  const userid = req.session.id;
  if (!url) {
    res.redirect("/urlnotfound");
  }
  if (!userid) {
    res.redirect("/login");
  } else if (userid !== url.userID) {
    res.redirect("/notauthorized");
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: url.longURL,
    user: users[req.session.id],
    email: getEmailFromId(userid, users),
  };
  res.render("urls_shows", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    const templateVars = {
      user:null,
      email: null
    };
    res.render("urlnotfound", templateVars);
  }

  const longURL = urlDatabase[shortURL].longURL;
  if (longURL === undefined) {
    res.redirect("urlnotfound");
  }
  res.redirect(longURL);
});

app.get("/urls/:shortURL/delete"), (req, res) => {
  const templateVars = {
    user: null,
    email: null,
    message: null
  };
  res.render("notauthorized", templateVars);
};

app.get("/_403error", (req, res) => {
  const userid = req.session.id;
  const userURLs = urlsForUser(userid, urlDatabase);

  const templateVars = {
    userid: userid,
    user: users[req.session.id],
    email: getEmailFromId(userid, users),
    urls: userURLs,
  };

  res.render("_403error", templateVars);
});

app.get("/_404error", (req, res) => {
  const userid = req.session.id;
  const userURLs = urlsForUser(userid, urlDatabase);

  const templateVars = {
    userid: userid,
    user: users[req.session.id],
    email: getEmailFromId(userid, users),
    urls: userURLs,
  };
  res.render("_404error", templateVars);
});

app.get("/_405error", (req, res) => {
  const userid = req.session.id;
  const userURLs = urlsForUser(userid, urlDatabase);

  const templateVars = {
    userid: userid,
    user: users[req.session.id],
    email: getEmailFromId(userid, users),
    urls: userURLs,
  };
  res.render("_405error", templateVars);
});

app.get("/notauthorized", (req, res) => {
  const userid = req.session.id;
  const userURLs = urlsForUser(userid, urlDatabase);

  const templateVars = {
    userid: userid,
    user: users[req.session.id],
    email: getEmailFromId(userid, users),
    urls: userURLs,
  };

  res.render("notauthorized", templateVars);
});

app.get("/urlnotfound", (req, res) => {
  const userid = req.session.id;
  const userURLs = urlsForUser(userid, urlDatabase);

  const templateVars = {
    userid: userid,
    user: users[req.session.id],
    email: getEmailFromId(userid, users),
    urls: userURLs,
  };

  res.render("urlnotfound", templateVars);
});



// All posts

//Post the user email and password to the user object along with redirect to /urls
app.post("/register", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = finduserbyEmail(users, email);
  console.log(req.body);
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === "" || password === "") {
    res.redirect("/_403error");
  }

  if (!user) {
    const userId = generateRandomString();
    users[userId] = { id: userId, email, password: hashedPassword }; // adding a user to users object
    req.session.id = userId;
  } else {
    res.redirect("_405error");
  }


  res.redirect("/urls");
});

//POST to login, redirect to /urls page and display username successfully logged in
app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = finduserbyEmail(users, email);

  if (!user) {
    return res.redirect("_404error");
  }
  
  if (!verifyHash(user.id, password, users)) { // if email/password don't match, 403.
    return res.redirect("_403error");
  }

  req.session.id = user.id;
  res.redirect("/urls");
});

//POST when user logs out
app.post("/logout", (req, res) => {
  req.session.id = null;
  res.redirect("/urls");
});

//POST when the user is logged in

app.post("/urls", (req, res) => {
  console.log(req.body);
  if (!req.session.id) {
    res.redirect("notauthorized");
  }
  let id = req.body.shortURL;
  if (!id) {
    id = generateRandomString();
  }
  urlDatabase[id] = {longURL:`http://${req.body.longURL}`, userID: req.session.id};
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const updateShortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userid = req.session.id;
  if (urlDatabase[updateShortURL].userID !== userid) { // prevents changing of URLs by users that don't own them.
    res.redirect("notauthorized");
    return;
  }
  urlDatabase[updateShortURL].longURL = longURL;
  res.redirect("/urls/");
});


//POST to delete and redirect to urls page
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = [req.params.shortURL];
  const userid = req.session.id;
  if (urlDatabase[urlToDelete].userID !== userid) { // prevents deletion of URLs by users that don't own them.
    res.redirect("notauthorized");
  }
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});

//When the server is running
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
