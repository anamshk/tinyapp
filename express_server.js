const express = require("express");
const cookieParser = require("cookie-parser");
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.userId]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.userId) {
    res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies.userId]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.userId]
  };
  if (!templateVars.longURL) {
    res.redirect('/urls');
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

//POST to delete and redirect to urls page
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
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

